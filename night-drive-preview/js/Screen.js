/*
  Screen — three.js renderer, scene, cameras, animation loop, resize.
  Extended for Claudia Night Drive: dual-view cross-dissolve (front ↔ side)
  that still runs through the EffectComposer so ombré/silhouette is preserved.
*/

import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  WebGLRenderTarget,
  LinearFilter,
  RGBAFormat,
  ShaderMaterial,
  Mesh,
  PlaneBufferGeometry,
  OrthographicCamera,
  Vector2,
} from "./../lib/three/three.module.js";
import { EffectComposer } from "./../lib/three/postprocessing/EffectComposer.js";
import { RenderPass } from "./../lib/three/postprocessing/RenderPass.js";
import { ShaderPass } from "./../lib/three/postprocessing/ShaderPass.js";
import { SMAAPass } from "./../lib/three/postprocessing/SMAAPass.js";
import { SobelOperatorShader } from "./../lib/three/shaders/SobelOperatorShader.js";
import { CopyShader } from "./../lib/three/shaders/CopyShader.js";

import { silhouetteMaterial, transparentMaterial } from "./materials.js";

export default class Screen {
  constructor(animate = true) {
    this.time = 0;
    this.updateListeners = [];
    this.element = document.createElement("div");
    this.element.id = "viewStage";
    document.body.appendChild(this.element);
    this.resolution = 1;
    this.active = true;
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(90, 1, 0.05, 100000);
    this.camera.rotation.order = "YZX";
    this.renderer = new WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.element.appendChild(this.renderer.domElement);
    this.renderer.domElement.id = "renderer";
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.sobelPass = new ShaderPass(SobelOperatorShader);
    this.composer.addPass(this.sobelPass);
    this.sobelPass.enabled = false;

    this.blueprintPass = new ShaderPass({
      uniforms: {
        tDiffuse: { type: "t", value: null },
      },
      vertexShader: `
        varying vec2 vUV;
        void main() {
          vUV = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        precision mediump float;
        #define prussianBlue vec3(0.1, 0.15, 0.7)
        uniform sampler2D tDiffuse;
        varying vec2 vUV;
        void main() {
          float edge = texture2D(tDiffuse, vUV).r * 20.;
          if (edge < 0.4) edge = 0.;
          vec3 color = mix(prussianBlue, vec3(0.9, 0.9, 1.0), edge);
          gl_FragColor = vec4(color, 1.);
        }
      `,
    });
    this.composer.addPass(this.blueprintPass);
    this.blueprintPass.enabled = false;

    this.colorCyclePass = new ShaderPass({
      uniforms: {
        tDiffuse: { type: "t", value: null },
        time: { type: "f", value: 0 },
      },
      vertexShader: `
        varying vec2 vUV;
        void main() {
          vUV = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform sampler2D tDiffuse;
        uniform float time;
        varying vec2 vUV;
        vec3 hueShift( const in vec3 color, const in float amount ) {
          vec3 p = vec3(0.55735) * dot(vec3(0.55735), color);
          vec3 u = color - p;
          vec3 v = cross(vec3(0.55735), u);
          return u * cos(amount * 6.2832) + v * sin(amount * 6.2832) + p;
        }
        void main() {
          gl_FragColor = vec4(hueShift(texture2D(tDiffuse, vUV).rgb, time), 1.0);
        }
      `,
    });
    this.composer.addPass(this.colorCyclePass);
    this.colorCyclePass.enabled = false;

    this.aaPass = new SMAAPass(1, 1);
    this.aaPass.renderToScreen = true;
    this.composer.addPass(this.aaPass);
    window.addEventListener("resize", this.onWindowResize.bind(this), false);

    // Dual-view dissolve (0 = front/driver, 1 = Claudia side view)
    this.viewBlend = 0;
    this.debugFlags = { side: false, noclaudia: false, rawsky: false };
    this.altCamera = null;
    this.beforeFrontRender = null; // optional () => void
    this.beforeSideRender = null;
    this.frontRT = null;
    this.sideRT = null;
    this.copyMaterial = new ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        opacity: { value: 1.0 },
      },
      vertexShader: CopyShader.vertexShader,
      fragmentShader: CopyShader.fragmentShader,
    });
    // viewBlend 0=front, 1=Claudia. Slide: front exits left, Claudia enters from right.
    // Optional dissolve mixes in the overlap. viewSlideAmount mirrors viewBlend by default.
    this.blendMaterial = new ShaderMaterial({
      uniforms: {
        tFront: { value: null },
        tSide: { value: null },
        blend: { value: 0 },
        slide: { value: 0 },
        dissolve: { value: 0.35 },
        feather: { value: 0.09 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform sampler2D tFront;
        uniform sampler2D tSide;
        uniform float blend;
        uniform float slide;
        uniform float dissolve;
        uniform float feather;
        varying vec2 vUv;

        vec4 sampleOrBlack(sampler2D tex, vec2 uv) {
          if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            return vec4(0.0);
          }
          return texture2D(tex, uv);
        }

        void main() {
          // s=0: front fills screen. s=1: side fills screen.
          // Front shifts left (−x); side starts off-screen right and moves left into place.
          float s = clamp(slide, 0.0, 1.0);
          vec2 uvFront = vec2(vUv.x + s, vUv.y);
          vec2 uvSide  = vec2(vUv.x + s - 1.0, vUv.y);
          vec4 front = sampleOrBlack(tFront, uvFront);
          vec4 side  = sampleOrBlack(tSide, uvSide);
          // Soft feathered seam at the panel boundary (plus a little dissolve in the band).
          float boundary = 1.0 - s;
          float f = max(feather, 0.001);
          float mixW = smoothstep(boundary - f, boundary + f, vUv.x);
          // Extra soft dissolve across the feather band so the join never reads as a hard cut.
          float band = 1.0 - smoothstep(f, f * 2.5, abs(vUv.x - boundary));
          mixW = clamp(mixW + band * dissolve * 0.35, 0.0, 1.0);
          gl_FragColor = mix(front, side, mixW);
        }
      `,
    });
    this.fsCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.fsGeo = new PlaneBufferGeometry(2, 2);
    this.copyMesh = new Mesh(this.fsGeo, this.copyMaterial);
    this.blendMesh = new Mesh(this.fsGeo, this.blendMaterial);
    this.fsScene = new Scene();

    this.onWindowResize();
    if (animate) {
      this.update();
      this.render();
    }

    this.frameRate = 1;
    this.startFrameTime = Date.now();
    this.lastFrameTime = this.startFrameTime;
  }

  _ensureDissolveRTs(width, height) {
    // Match EffectComposer targets: same size as drawing buffer, depth attached.
    const w = Math.max(1, width);
    const h = Math.max(1, height);
    const params = {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat,
      stencilBuffer: false,
      depthBuffer: true,
    };
    if (this.frontRT == null || this.frontRT.width !== w || this.frontRT.height !== h) {
      if (this.frontRT) this.frontRT.dispose();
      if (this.sideRT) this.sideRT.dispose();
      this.frontRT = new WebGLRenderTarget(w, h, params);
      this.sideRT = new WebGLRenderTarget(w, h, params);
    }
  }

  _clearFsScene() {
    while (this.fsScene.children.length > 0) {
      this.fsScene.remove(this.fsScene.children[0]);
    }
  }

  _blitTo(rt, sourceTexture) {
    this.copyMaterial.uniforms.tDiffuse.value = sourceTexture;
    this.copyMesh.material = this.copyMaterial;
    this._clearFsScene();
    this.fsScene.add(this.copyMesh);
    const prevAutoClear = this.renderer.autoClear;
    this.renderer.autoClear = true;
    this.renderer.setRenderTarget(rt);
    this.renderer.clear();
    this.renderer.render(this.fsScene, this.fsCamera);
    this.renderer.setRenderTarget(null);
    this.renderer.autoClear = prevAutoClear;
  }

  _composerOutputTexture() {
    // Last enabled pass with renderToScreen=false writes into writeBuffer, then
    // needsSwap moves it to readBuffer. Prefer readBuffer; fall back to writeBuffer.
    return this.composer.readBuffer?.texture || this.composer.writeBuffer?.texture;
  }

  _layoutViewport() {
    // Portrait phone: keep a full 16:9 drive view up top; chrome (buttons/Talk) sits below.
    // Landscape / desktop: view fills the window as before.
    const ww = window.innerWidth;
    const wh = window.innerHeight;
    const portrait = wh > ww;
    document.body.classList.toggle("portrait-letterbox", portrait);
    if (portrait) {
      const viewH = Math.round(ww * 9 / 16);
      return { width: ww, height: Math.max(1, viewH), aspect: ww / Math.max(1, viewH) };
    }
    return { width: ww, height: wh, aspect: ww / Math.max(1, wh) };
  }

  onWindowResize() {
    const { aspect } = this._layoutViewport();
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    if (this.altCamera != null) {
      this.altCamera.aspect = aspect;
      this.altCamera.updateProjectionMatrix();
    }
    this.setResolution(this.resolution);
  }

  setResolution(amount) {
    this.resolution = amount;
    const vp = this._layoutViewport();
    const width = Math.ceil(vp.width * this.resolution);
    const height = Math.ceil(vp.height * this.resolution);
    this.renderer.setSize(width, height);
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";

    this.sobelPass.uniforms.resolution.value.x = width;
    this.sobelPass.uniforms.resolution.value.y = height;

    this.composer.setSize(width, height);
    silhouetteMaterial.uniforms.resolution.value.set(width, height);
    // Dissolve RTs must match the composer's internal buffer pixel size.
    const db = new Vector2();
    this.renderer.getDrawingBufferSize(db);
    this._ensureDissolveRTs(Math.max(1, Math.ceil(db.x)), Math.max(1, Math.ceil(db.y)));
  }

  setWireframe(enabled) {
    this.sobelPass.enabled = enabled;
    this.blueprintPass.enabled = enabled;
  }

  setCycleColors(enabled) {
    this.colorCyclePass.enabled = enabled;
  }

  update() {
    if (this.active) {
      for (const listener of this.updateListeners) {
        listener();
      }
    }
    setTimeout(this.update.bind(this), 1000 / 60);
  }

  render() {
    requestAnimationFrame(this.render.bind(this));
    if (!this.active) return;

    this.time += 0.05;
    // Match upstream: always animate ombré dither (no side-only freeze).
    silhouetteMaterial.uniforms.scramble.value = this.time;
    transparentMaterial.uniforms.scramble.value = this.time;
    this.colorCyclePass.uniforms.time.value = this.time * 0.02;

    if (this.camera == null) return;

    const blend = this.viewBlend;
    const useDissolve = this.altCamera != null && blend > 0.001 && blend < 0.999;
    const useSideOnly = this.altCamera != null && blend >= 0.999;
    const useFrontOnly = !useDissolve && !useSideOnly;

    if (useFrontOnly) {
      if (this.beforeFrontRender) this.beforeFrontRender();
      this.renderPass.camera = this.camera;
      this.composer.renderToScreen = true;
      this.composer.render();
    } else if (useSideOnly) {
      if (this.beforeSideRender) this.beforeSideRender();
      // ?rawsky — bypass composer/SMAA entirely (debug). Else same single composer as front.
      if (this.debugFlags?.rawsky) {
        this.renderer.setRenderTarget(null);
        this.renderer.clear();
        this.renderer.render(this.scene, this.altCamera);
      } else {
        this.renderPass.camera = this.altCamera;
        this.composer.renderToScreen = true;
        this.composer.render();
      }
    } else {
      // Cross-dissolve: each eye through the SAME composer into depth-bearing RTs.
      const db = new Vector2();
      this.renderer.getDrawingBufferSize(db);
      this._ensureDissolveRTs(Math.max(1, Math.ceil(db.x)), Math.max(1, Math.ceil(db.y)));

      const prevRTS = this.composer.renderToScreen;
      this.composer.renderToScreen = false;

      if (this.beforeFrontRender) this.beforeFrontRender();
      this.renderPass.camera = this.camera;
      this.composer.render();
      this._blitTo(this.frontRT, this._composerOutputTexture());

      if (this.beforeSideRender) this.beforeSideRender();
      this.renderPass.camera = this.altCamera;
      this.composer.render();
      this._blitTo(this.sideRT, this._composerOutputTexture());

      this.blendMaterial.uniforms.tFront.value = this.frontRT.texture;
      this.blendMaterial.uniforms.tSide.value = this.sideRT.texture;
      this.blendMaterial.uniforms.blend.value = blend;
      this.blendMaterial.uniforms.slide.value = blend;
      this.blendMaterial.uniforms.feather.value = 0.09;
      this.blendMaterial.uniforms.dissolve.value = 0.35;
      this.blendMesh.material = this.blendMaterial;
      this._clearFsScene();
      this.fsScene.add(this.blendMesh);
      this.renderer.setRenderTarget(null);
      this.renderer.clear();
      this.renderer.render(this.fsScene, this.fsCamera);

      this.composer.renderToScreen = prevRTS;
    }

    const frameTime = Date.now() - this.startFrameTime;
    const frameDuration = frameTime - this.lastFrameTime;
    this.frameRate = 1000 / frameDuration;
    this.lastFrameTime = frameTime;
  }

  addUpdateListener(func) {
    if (!this.updateListeners.includes(func)) {
      this.updateListeners.push(func);
    }
  }

  get width() {
    return this._layoutViewport().width;
  }

  get height() {
    return this._layoutViewport().height;
  }

  get backgroundColor() {
    return this.scene.background;
  }

  set backgroundColor(color) {
    this.scene.background = color;
    return color;
  }
}
