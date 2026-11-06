/*
  Full-bleed COVER plane for Claudia side panel.
  Arts shown EXACTLY as supplied (no mirroring): window left/top, Claudia on the right.
  Facing camera uses yaw π + scale.x = -1 only to cancel the facing flip (net unmirrored).
  α=0 window reveals the live 3D scene from the "claudia" (back-seat, passenger-side) camera.
*/

import {
  Group,
  PlaneBufferGeometry,
  MeshBasicMaterial,
  Mesh,
  TextureLoader,
  DoubleSide,
  sRGBEncoding,
  ClampToEdgeWrapping,
  LinearFilter,
} from "./../lib/three/three.module.js";

const OPEN_URL = "./assets/claudia-art/claudia-eyes-open.png";
const CLOSED_URL = "./assets/claudia-art/claudia-eyes-closed.png";
const ART_ASPECT = 2560 / 1440;

export default class ClaudiaPassenger {
  constructor() {
    this.object = new Group();
    this.object.name = "ClaudiaPassenger_COVER";
    this.ready = false;
    this.mesh = null;
    this.artAspect = ART_ASPECT;
    this.texOpen = null;
    this.texClosed = null;
    this.currentVariant = "closed";
    this._lastVariant = null;

    this.material = new MeshBasicMaterial({
      transparent: true,
      opacity: 1,
      depthWrite: false,
      depthTest: false,
      side: DoubleSide,
      alphaTest: 0.08,
    });
    this.mesh = new Mesh(new PlaneBufferGeometry(1, 1), this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 1000;
    this.object.add(this.mesh);
    // Crossfade twin for soft open/closed eye swaps.
    this.fadeMaterial = this.material.clone();
    this.fadeMaterial.opacity = 0;
    this.fadeMaterial.transparent = true;
    this.fadeMesh = new Mesh(this.mesh.geometry, this.fadeMaterial);
    this.fadeMesh.frustumCulled = false;
    this.fadeMesh.renderOrder = 1001;
    this.fadeMesh.visible = false;
    this.object.add(this.fadeMesh);
    this._eyeFade = null; // { from, to, t, dur }
    // No fake backdrop — live world from the claudia camera shows through α cutouts.
    this.backdrop = null;

    const loader = new TextureLoader();
    let pending = 2;
    const done = () => {
      pending -= 1;
      if (pending <= 0) {
        this._applyVariant(this.currentVariant);
        this.ready = true;
      }
    };
    loader.load(OPEN_URL, (tex) => { this._prepTex(tex); this.texOpen = tex; done(); }, undefined, () => done());
    loader.load(CLOSED_URL, (tex) => { this._prepTex(tex); this.texClosed = tex; done(); }, undefined, () => done());
  }

  _prepTex(tex) {
    tex.encoding = sRGBEncoding;
    tex.anisotropy = 4;
    tex.flipY = true;
    tex.premultiplyAlpha = false;
    tex.generateMipmaps = false;
    tex.minFilter = LinearFilter;
    tex.magFilter = LinearFilter;
    tex.wrapS = tex.wrapT = ClampToEdgeWrapping;
    if (tex.image && tex.image.width && tex.image.height) {
      this.artAspect = tex.image.width / tex.image.height;
    }
  }

  _texFor(which) {
    return which === "closed" ? this.texClosed || this.texOpen : this.texOpen || this.texClosed;
  }

  _applyVariant(which) {
    const tex = this._texFor(which);
    if (!tex) return;
    this.currentVariant = which;
    this.material.map = tex;
    this.material.opacity = 1;
    this.material.needsUpdate = true;
    if (this.fadeMesh) {
      this.fadeMesh.visible = false;
      this.fadeMaterial.opacity = 0;
    }
    this._eyeFade = null;
  }

  /** Soft crossfade to open or closed eyes. */
  crossfadeToVariant(which, dur = 0.28) {
    if (which === this.currentVariant && !this._eyeFade) return which;
    const toTex = this._texFor(which);
    if (!toTex || !this.fadeMesh) {
      this._applyVariant(which);
      return which;
    }
    this.fadeMesh.geometry = this.mesh.geometry;
    this.fadeMaterial.map = toTex;
    this.fadeMaterial.opacity = 0;
    this.fadeMaterial.needsUpdate = true;
    this.fadeMesh.visible = true;
    this.material.opacity = 1;
    this._eyeFade = { to: which, t: 0, dur: Math.max(0.05, dur) };
    return which;
  }

  /** Alternate eyes-closed / eyes-open; soft crossfade. */
  pickNextVariant({ fade = false } = {}) {
    let next;
    if (this._lastVariant == null) {
      next = Math.random() < 0.5 ? "open" : "closed";
    } else {
      next = this._lastVariant === "open" ? "closed" : "open";
    }
    this._lastVariant = next;
    if (fade) this.crossfadeToVariant(next);
    else this._applyVariant(next);
    return next;
  }

  /** Toggle open ↔ closed with a soft crossfade (Talk answers). */
  toggleEyesSoft(dur = 0.28) {
    const next = this.currentVariant === "open" ? "closed" : "open";
    this._lastVariant = next;
    return this.crossfadeToVariant(next, dur);
  }

  update(dt) {
    if (!this._eyeFade) return;
    this._eyeFade.t += dt;
    const u = Math.min(1, this._eyeFade.t / this._eyeFade.dur);
    const s = u * u * (3 - 2 * u);
    this.fadeMaterial.opacity = s;
    this.material.opacity = 1 - s;
    if (u >= 1) {
      const to = this._eyeFade.to;
      this._eyeFade = null;
      this._applyVariant(to);
    }
  }

  setEyesOpen(amount) {
    this._applyVariant(amount >= 0.5 ? "open" : "closed");
  }

  hideBackdrop() {
    // Fake backdrop removed; kept as no-op for Drivey call sites.
  }

  /**
   * Desktop: full-bleed cover, face-anchored.
   * Portrait (aspect < 0.85): loosened contain-fit UV so the live window/road
   * stays visible beside her face (letterboxed; side sky fills the bars).
   */
  attachToSideCamera(camera, { dist = 0.85, focusU = 0.68, focusV = 0.36 } = {}) {
    if (this.object.parent !== camera) {
      camera.add(this.object);
    }
    const aspect = Math.max(0.05, camera.aspect);
    const cacheKey = `${aspect.toFixed(4)}|${camera.fov}|${dist}|${focusU}|${focusV}|${this.artAspect.toFixed(4)}`;
    if (this._attachCacheKey === cacheKey && this.mesh.geometry) {
      return;
    }
    this._attachCacheKey = cacheKey;
    const vFov = (camera.fov * Math.PI) / 180;
    const visibleH = 2 * dist * Math.tan(vFov * 0.5);
    const visibleW = visibleH * aspect;
    const texAspect = this.artAspect;
    const tex = this.material.map;
    const portrait = aspect < 0.85;

    let planeW = visibleW;
    let planeH = visibleH;
    let yOff = 0;

    if (tex) {
      if (portrait) {
        // Include left window (~0.04) through face (~0.88).
        const u0 = 0.04, u1 = 0.88, v0 = 0.02, v1 = 0.98;
        const repX = u1 - u0;
        const repY = v1 - v0;
        const uvAspect = (repX / repY) * texAspect;
        if (uvAspect > aspect) {
          planeW = visibleW;
          planeH = visibleW / uvAspect;
        } else {
          planeH = visibleH;
          planeW = visibleH * uvAspect;
        }
        yOff = (visibleH - planeH) * 0.18; // keep face a bit high
        tex.repeat.set(repX, repY);
        tex.offset.set(u0, v0);
      } else if (texAspect > aspect + 0.001) {
        const repX = aspect / texAspect;
        const maxOff = Math.max(0, 1 - repX);
        const faceU0 = 0.56, faceU1 = 0.86;
        let offX = focusU - repX * 0.5;
        if (repX < faceU1 - faceU0) {
          offX = (faceU0 + faceU1) * 0.5 - repX * 0.5;
        } else {
          offX = Math.min(offX, faceU0);
          offX = Math.max(offX, faceU1 - repX);
        }
        offX = Math.min(maxOff, Math.max(0, offX));
        tex.repeat.set(repX, 1);
        tex.offset.set(offX, 0);
      } else if (aspect > texAspect + 0.001) {
        const repY = texAspect / aspect;
        const maxOff = Math.max(0, 1 - repY);
        const offY = Math.min(maxOff, Math.max(0, focusV - repY * 0.5));
        tex.repeat.set(1, repY);
        tex.offset.set(0, offY);
      } else {
        tex.repeat.set(1, 1);
        tex.offset.set(0, 0);
      }
      tex.needsUpdate = true;
    }

    this.mesh.geometry.dispose();
    this.mesh.geometry = new PlaneBufferGeometry(planeW, planeH);
    if (this.fadeMesh) this.fadeMesh.geometry = this.mesh.geometry;

    // Unmirrored as supplied: yaw π to face camera, scale.x -1 cancels the facing flip.
    this.object.position.set(0, yOff, -dist);
    this.object.rotation.set(0, Math.PI, 0);
    this.object.scale.set(-1, 1, 1);
  }

  setDrivingSide(_drivingSide) {}
  setSmile(_on) {}
  setBlink(_on) {}
}
