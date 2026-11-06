/*
  Claudia Night Drive — derivative of Drivey.js

  Original Drivey project Copyright © 2007 Mark Pursey.
  Drivey.js port by rezmason, 2018 — https://github.com/Rezmason/drivey
  This fork by MicDesign1, 2026.

  Licensed under the GNU General Public License v3.0 (see ../LICENSE).
  Upstream root LICENSE is GPL-3; this header previously conflicted and is corrected here.
*/

import { Group, Color, CylinderBufferGeometry, Mesh, PerspectiveCamera } from "./../lib/three/three.module.js";

import buildLevel from "./buildLevel.js";
import renderLevel from "./renderLevel.js";
import { lerp, PI } from "./math.js";
import { silhouetteMaterial, transparentMaterial, blendColors } from "./materials.js";
import { shadeGeometry } from "./geometry.js";
import isTouchDevice from "./isTouchDevice.js";
import { Input, controlSchemesByName } from "./Input.js";

import Screen from "./Screen.js";
import Buttons from "./Buttons.js";
import Car from "./Car.js";
import buildCar from "./buildCar.js";
import Dashboard from "./Dashboard.js";
import ClaudiaPassenger from "./ClaudiaPassenger.js";
import Dialogue, { script as dialogueScript, startId as dialogueStartId } from "./dialogue.js";
import DialoguePanel from "./DialoguePanel.js";
import MusicPlayer from "./MusicPlayer.js";

const parser = new DOMParser();
const readLevel = (htmlText) => {
  const levelDOM = parser.parseFromString(htmlText, "text/html").documentElement;
  if (levelDOM?.querySelector("drivey") != null) {
    return levelDOM;
  }
  return null;
};

const levelsByName = new Map(
  // Claudia Night Drive: IndustrialZone only (amber tint + gradient sky).
  [["industrial", "IndustrialZone"]].map(([levelName, filename]) => [
    levelName,
    fetch(`./levels/${filename}.html`)
      .then((file) => file.text())
      .then(readLevel)
      .then(buildLevel),
  ])
);

const cruiseSpeeds = new Map([
  [0, 0.0],
  [1, 0.5],
  [2, 1.0],
  [3, 4.0],
]);

const drivingSidesByName = new Map([
  ["left", 1],
  ["right", -1],
]);

const screenResolutions = new Map([
  ["low", 1 / 4],
  ["medium", 1 / 2],
  ["high", 1 / 1],
]);

export default class Drivey {
  constructor() {
    this.currentEffect = "ombré";
    this.npcControlScheme = new Input();
    this.controlScheme = controlSchemesByName.get("autopilot");
    this.screen = new Screen();
    this.buttons = new Buttons();
    this.buttons.addListener(this.onButtonClick.bind(this));
    this.theme = new Theme();
    document.body.appendChild(this.theme.el);
    window.addEventListener("dragover", this.drag.bind(this));
    window.addEventListener("drop", this.drop.bind(this));
    window.addEventListener("focus", this.onWindowFocus.bind(this), false);
    window.addEventListener("blur", this.onWindowBlur.bind(this), false);
    this.theme.onLoad = this.onThemeLoaded.bind(this);
    this.init();
  }

  onWindowFocus() {
    if (this.screen != null) {
      this.screen.active = true;
    }
  }

  onWindowBlur() {
    if (this.buttons != null && this.buttons.isMouseOverEmbeddedPlaylist) {
      return;
    }
    if (this.screen != null) {
      this.screen.active = false;
    }
  }

  drag(event) {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  drop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];

    const isSVG = file.name.endsWith(".svg");
    const isHTML = file.name.endsWith(".html");

    if (isSVG || isHTML) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        if (isSVG) {
          this.theme.load(text);
        } else if (isHTML) {
          // Level selector removed — ignore dropped level HTML.
          console.info("Claudia Night Drive: level drops disabled");
        }
      };
      reader.readAsText(file, "UTF-8");
    }

    event.stopPropagation();
  }

  async init() {
    this.drivingSide = -1;
    this.defaultTilt = -0.0625;

    this.cruiseSpeed = 1;

    // Used to determine time delta between frames
    this.lastTime = NaN;
    this.lastDelta = 0;

    /*
      The organization of the scene is as follows:

      scene
        <satelliteCameraMount>
        myCarExterior
          sky
          <chaseCameraMount>
          <aerialCameraMount>
          myCarInterior
            myCarMesh
            driver
              <claudiaCameraMount>
              <rearCameraMount>
              <driverCameraMount>
                dashboard
        level world
        level sky
        [otherCarExteriors]
    */

    this.screen.scene.visible = false;

    this.satelliteCameraMount = new Group();
    this.screen.scene.add(this.satelliteCameraMount);

    this.myCar = new Car();
    this.otherCars = [];
    this.otherCarExteriors = [];
    this.numOtherCars = 0;

    this.myCarExterior = new Group();
    this.screen.scene.add(this.myCarExterior);

    this.myCarInterior = new Group();
    this.myCarExterior.add(this.myCarInterior);

    this.sky = this.makeSky();
    this.myCarExterior.add(this.sky);
    // Full cylinder sky for Check Claudia (side look); hidden unless side view.
    this.sideSky = this.makeFullSky();
    this.sideSky.visible = false;
    this.myCarExterior.add(this.sideSky);

    this.chaseCameraMount = new Group();
    this.chaseCameraMount.rotation.x = PI * 0.5;
    this.chaseCameraMount.position.y = -5;
    this.chaseCameraMount.position.z = 2;
    this.myCarExterior.add(this.chaseCameraMount);

    this.hoodCameraMount = new Group();
    this.hoodCameraMount.rotation.x = PI * 0.5;
    this.hoodCameraMount.position.y = 3;
    this.hoodCameraMount.position.z = 0.5;
    this.myCarExterior.add(this.hoodCameraMount);

    this.myCarMesh = buildCar();
    this.myCarExterior.add(this.myCarMesh);
    this.myCarMesh.visible = false;

    this.driver = new Group();
    this.driver.name = "Ace";
    this.myCarInterior.add(this.driver);

    this.driverCameraMount = new Group();
    this.driverCameraMount.rotation.x = PI * (0.5 + this.defaultTilt);
    this.driverCameraMount.position.z = 1;
    this.driver.add(this.driverCameraMount);

    // "claudia" view: back-seat mount aimed at passenger side (RIGHT).
    // Stock drivey "backseat" used +π·0.625 and looked out the opposite side — do not reuse that yaw.
    this.claudiaCameraMount = new Group();
    this.claudiaCameraMount.name = "claudiaCameraMount";
    this.claudiaCameraMount.rotation.order = "XYZ";
    // Back seat, passenger-side aim. Pitch level (π/2), yaw −0.38π toward passenger+forward,
    // raised (z=1.45) + FOV 85 so α windows show amber sky, poles, wires, lamps.
    this.claudiaCameraMount.position.set(0.20, -0.45, 1.45);
    this.claudiaCameraMount.rotation.set(PI * 0.5, -PI * 0.38, 0);
    this.driver.add(this.claudiaCameraMount);

    this.rearCameraMount = new Group();
    this.rearCameraMount.rotation.x = PI * (0.5 - this.defaultTilt);
    this.rearCameraMount.rotation.y = PI;
    this.rearCameraMount.position.z = 1;
    this.driver.add(this.rearCameraMount);

    this.aerialCameraMount = new Group();
    this.aerialCameraMount.position.set(0, 0, 60);
    this.myCarExterior.add(this.aerialCameraMount);

    // Side / Check Claudia camera lives on the claudia (ex-backseat) mount so the
    // live industrial world from that vantage shows through her α=0 window.
    this.sideCameraMount = this.claudiaCameraMount;
    this.sideCamera = new PerspectiveCamera(70, 1, 0.05, 100000);
    this.claudiaCameraMount.add(this.sideCamera);

    this.dashboard = new Dashboard();
    this.dashboard.object.scale.set(0.0018, 0.0018, 0.001);
    this.dashboard.object.position.y = -0.02;
    this.driverCameraMount.add(this.dashboard.object);
    this.gear = 1;

    // TEMP fit-test: textured-plane Claudia — ONLY ever drawn in side view.
    this.claudia = new ClaudiaPassenger();
    this.driver.add(this.claudia.object);
    this.claudia.object.visible = false; // front view must never show her

    // Check Claudia = cross-dissolve front ↔ side (not a yaw glance).
    this.checkPhase = "idle"; // idle | in | hold | out
    this.checkPhaseT = 0;
    this.checkDissolveSec = 0.75;
    this.checkHoldSec = 2.8;
    this.screen.altCamera = this.sideCamera;
    this.screen.viewBlend = 0;
    this.screen.beforeFrontRender = () => this.prepareFrontView();
    this.screen.beforeSideRender = () => this.prepareSideView();

    // Talk mode: side view stays open while the dialogue panel is up.
    this.talkMode = false;

    this.dialoguePanel = new DialoguePanel({
      onChoose: (index) => this.onDialogueChoose(index),
      onClose: () => this.closeTalkPanel({ returnToRoad: true }),
    });

    this.dialogue = new Dialogue({
      script: dialogueScript,
      startId: dialogueStartId,
      onEnter: (view) => {
        if (this.talkMode) this.dialoguePanel.show(view);
      },
      onExit: () => {
        // exitToRoad / end of branch — panel hides; glance returns to road if talking.
        this.dialoguePanel.hide();
        if (this.talkMode) {
          this.talkMode = false;
          this.beginReturnToRoad();
        }
      },
    });

    this.music = new MusicPlayer();
    this._refreshMusicMenu = () => {
      const st = this.music.status();
      this.buttons.setMusicStatus(st);
    };
    this.music.addListener(() => this._refreshMusicMenu());
    this._refreshMusicMenu();
    this.controlMode = "autopilot";
    this.buttons.setControlsMenu({
      current: this.controlMode,
      onPick: (id) => this.onButtonClick("controlMode", id),
    });

    // Only driver is a reachable front camera. "claudia" is the side-view mount (not a free cam).
    // Satellite / aerial / hood / rear / chase / side-selector are not exposed.
    this.cameraMountsByName = new Map([
      ["driver", { mount: this.driverCameraMount, drawBrighterGround: false }],
      ["claudia", { mount: this.claudiaCameraMount, drawBrighterGround: false }],
    ]);

    // Locked: driver camera + ombré effect for Claudia Night Drive.
    this.currentEffect = "ombré";
    this.setCameraMount("driver");
    this.sideCamera.aspect = this.screen.camera.aspect;
    this.sideCamera.updateProjectionMatrix();

    // Always driving: cruise starts at full (map key 2 → 1.0×).
    this.cruiseSpeed = cruiseSpeeds.get(2);
    this.controlScheme = controlSchemesByName.get("autopilot"); // default: always driving, no manual steer
    this.drivingSide = -1; // SIDE RIGHT locked
    this.dashboard.drivingSide = this.drivingSide;
    this.screen.setResolution(screenResolutions.get("high"));

    // Initial (and only) level is Industrial Zone
    await this.setLevelByName("industrial");

    this.setNumOtherCars(2 * 8); // fixed sensible traffic (was UI "cars" = 2)

    if (localStorage.getItem("theme") != null) {
      this.theme.start();
    }

    this.screen.addUpdateListener(this.update.bind(this));
    this.update();
    this.screen.scene.visible = true;
  }

  async setLevelByName(levelName) {
    this.loadingLevelName = levelName;
    const levelData = await levelsByName.get(levelName);
    if (this.loadingLevelName === levelName) {
      await this.setLevel(levelData);
    }
  }

  async setLevel(levelData) {
    const level = await renderLevel(levelData);

    if (this.level != null) {
      this.screen.scene.remove(this.level.world);
      this.screen.scene.remove(this.level.sky);
      this.level.dispose();
    }

    this.level = level;
    this.autoSteerApproximation = level.mainRoad.approximate(10000); // Used by car steering logic

    // Retint forward sky + full side sky (gradient from level skyLow/skyHigh)
    this.retintSkyMesh(this.sky, level);
    if (this.sideSky) this.retintSkyMesh(this.sideSky, level);

    // Retint the background, UI and materials
    this.updateTints();

    // Build the level scene graph
    this.screen.scene.add(level.world);
    this.screen.scene.add(this.level.sky);
    this.myCar.remove();
    this.myCar.place(
      level.mainRoad,
      this.autoSteerApproximation,
      0,
      level.laneWidth,
      level.numLanes,
      this.drivingSide,
      1,
      this.cruiseSpeed * level.cruiseSpeed
    );
    this.setNumOtherCars(this.numOtherCars);

    // The height of the world camera depends on the size of the level
    this.satelliteCameraMount.position.set(0, 0, level.worldRadius);

    this.updateCamera();
  }

  updateBackgroundColor() {
    this.screen.backgroundColor = blendColors(this.themeColors, this.drawBrighterGround ? 0.25 : this.level.ground);
  }

  /** Side view: keep silhouette highlights amber — never pure white (stops sky flicker). */
  _applySideAmberTints() {
    if (this.level == null || this.themeColors == null) return;
    const amber = this.level.tint.clone().lerp(new Color(1, 0.75, 0.35), 0.35);
    silhouetteMaterial.uniforms.lightTint.value.copy(amber);
    transparentMaterial.uniforms.lightTint.value.copy(amber);
    silhouetteMaterial.uniforms.ditherMagnitude.value = 0.008;
    transparentMaterial.uniforms.ditherMagnitude.value = 0.008;
  }

  _restoreFrontTints() {
    if (this.themeColors == null) return;
    silhouetteMaterial.uniforms.lightTint.value.copy(this.themeColors.light);
    transparentMaterial.uniforms.lightTint.value.copy(this.themeColors.light);
    silhouetteMaterial.uniforms.ditherMagnitude.value = 0.02;
    transparentMaterial.uniforms.ditherMagnitude.value = 0.02;
  }

  updateButtonTint() {
    switch (this.currentEffect) {
      case "ombré":
        if (this.level != null) {
          const tint = this.level.tint;
          this.buttons.setColors(tint.clone().multiplyScalar(0.0), tint.clone().multiplyScalar(0.4), tint.clone().lerp(new Color(1, 1, 1), 0.25));
        }

        break;
      case "wireframe":
        this.buttons.setColors(new Color(0.1, 0.15, 0.7), new Color(0.8, 0.8, 1), new Color(1, 1, 1));
        break;
      case "technicolor":
        this.buttons.setColors(new Color(0, 0, 0), new Color(0.1, 0.1, 0.1), new Color(1, 1, 1));
        break;
      case "merveilles":
        this.buttons.setColors(this.themeColors.dark, this.themeColors.full, this.themeColors.light);
        break;
    }
    this.buttons.setWireframe(this.currentEffect === "wireframe");
  }

  onThemeLoaded() {
    this.buttons.setButton("effect", "merveilles");
    this.updateTints();
  }

  updateTints() {
    let full, light, dark;

    switch (this.currentEffect) {
      case "merveilles":
        const active = this.theme.active;
        if (active.background == null) {
          return;
        }

        const hsl = Array.from(new Set([active.f_high, active.f_med, active.f_low, active.b_high, active.b_med, active.background]))
          .map((hex) => new Color(parseInt(hex.substring(1), 16)))
          .map((color) => color.getHSL({ color }));
        const minLightness = Math.min(...hsl.map((o) => o.l));
        const darkHSL = hsl.find((o) => o.l === minLightness);
        const maxLightness = Math.max(...hsl.map((o) => o.l));
        const lightHSL = hsl.find((o) => o.l === maxLightness);
        const remainingHSL = hsl.filter((o) => o != darkHSL && o != lightHSL);
        const maxSaturation = Math.max(...remainingHSL.map((o) => o.s));
        const fullHSL = remainingHSL.find((o) => o.s === maxSaturation);
        [dark, light, full] = [darkHSL.color, lightHSL.color, fullHSL.color];
        // console.log(dark.getHexString(), full.getHexString(), light.getHexString());
        break;
      default:
        if (this.level == null) {
          return;
        }

        full = this.level.tint;
        dark = new Color(0, 0, 0);
        light = new Color(1, 1, 1);
        break;
    }

    this.themeColors = { dark, full, light };

    silhouetteMaterial.uniforms.fullTint.value = full;
    silhouetteMaterial.uniforms.darkTint.value = dark;
    silhouetteMaterial.uniforms.lightTint.value = light;

    transparentMaterial.uniforms.fullTint.value = full;
    transparentMaterial.uniforms.darkTint.value = dark;
    transparentMaterial.uniforms.lightTint.value = light;

    this.updateBackgroundColor();
    this.updateButtonTint();
  }

  makeSky() {
    /*

    The sky is half a cylindrical shell with a gradient
    based on the y position of its vertices

        :::::::---------------::        skyHigh
      :::     :::               ::        .
     ::         ::               ::       .
    ::           ::               ::      .
    ::           ::_______________::    skyLow

    It needs to be wide enough to reach the edges
    of the driver camera frustum most of the time

    */

    const geometry = new CylinderBufferGeometry(1, 1, -100, 100, 1, true, 0, PI);
    shadeGeometry(geometry, 0);
    const mesh = new Mesh(geometry, silhouetteMaterial);
    mesh.scale.multiplyScalar(100000);
    mesh.rotation.x = PI * 0.5;
    mesh.rotation.z = PI * 0.5;
    return mesh;
  }

  makeFullSky() {
    // 360° shell so passenger-side camera still sees the amber gradient.
    // Negative X scale flips normals inward (camera sits inside the shell).
    const geometry = new CylinderBufferGeometry(1, 1, -100, 100, 1, true, 0, PI * 2);
    shadeGeometry(geometry, 0);
    const mesh = new Mesh(geometry, silhouetteMaterial);
    mesh.scale.set(-100000, 100000, 100000);
    mesh.rotation.x = PI * 0.5;
    mesh.rotation.z = PI * 0.5;
    mesh.name = "sideSky";
    mesh.frustumCulled = false;
    return mesh;
  }

  retintSkyMesh(mesh, level) {
    if (mesh == null || mesh.geometry == null) return;
    const skyGeometry = mesh.geometry;
    const positions = skyGeometry.getAttribute("position");
    const numVertices = positions.count;
    const monochromeAttribute = skyGeometry.getAttribute("monochromeValue");
    const monochromeValues = monochromeAttribute.array;
    for (let i = 0; i < numVertices; i++) {
      const y = positions.array[i * 3 + 0];
      monochromeValues[i * 3 + 0] = level.skyLow * (1 - y) + level.skyHigh * y;
      monochromeValues[i * 3 + 1] = 1;
    }
    monochromeAttribute.needsUpdate = true;
  }

  _retintSideSkyCapped(mesh, level) {
    if (mesh == null || mesh.geometry == null) return;
    const skyGeometry = mesh.geometry;
    const positions = skyGeometry.getAttribute("position");
    const numVertices = positions.count;
    const monochromeAttribute = skyGeometry.getAttribute("monochromeValue");
    const monochromeValues = monochromeAttribute.array;
    const skyLow = Math.min(level.skyLow, 0.52);
    const skyHigh = level.skyHigh;
    for (let i = 0; i < numVertices; i++) {
      const y = positions.array[i * 3 + 0];
      monochromeValues[i * 3 + 0] = skyLow * (1 - y) + skyHigh * y;
      monochromeValues[i * 3 + 1] = 1;
    }
    monochromeAttribute.needsUpdate = true;
  }

  onButtonClick(button, value) {
    switch (button) {
      case "checkClaudia":
        this.startClaudiaGlance({ talk: false });
        break;
      case "talkClaudia":
        this.startClaudiaGlance({ talk: true });
        break;
      case "musicToggle":
        this.music.toggleFromUser();
        this._refreshMusicMenu();
        this.buttons.wakeUp();
        break;
      case "musicPrev":
        this.music.prev({ fromUser: true });
        this._refreshMusicMenu();
        this.buttons.wakeUp();
        break;
      case "musicNext":
        this.music.next({ fromUser: true });
        this._refreshMusicMenu();
        this.buttons.wakeUp();
        break;
      case "drive":
        this.goDrive();
        break;
      case "controls":
        this.buttons.toggleControlsMenu();
        this.buttons.wakeUp();
        break;
      case "controlMode":
        this.setControlMode(value);
        break;
      // No cruise / npc / side / camera / level / quality selectors.
    }
  }

  /** Return to front driving view anytime; keeps dialogue history/flags in memory. */
  goDrive() {
    this._openTalkWhenHeld = false;
    this.talkMode = false;
    if (this.dialoguePanel) this.dialoguePanel.hide();
    // Suspend (do not exitToRoad) so runtime dialogue state survives.
    if (this.dialogue && this.dialogue.active) this.dialogue.suspend();
    // Prevent dialogue onExit from double-triggering return.
    this.beginReturnToRoad();
    this.buttons.wakeUp();
  }

  setControlMode(id) {
    const scheme = controlSchemesByName.get(id);
    if (scheme == null) {
      console.warn("Unknown control mode", id);
      return;
    }
    this.controlMode = id;
    this.controlScheme = scheme;
    this.buttons.setControlsMenu({
      current: id,
      onPick: (next) => this.onButtonClick("controlMode", next),
    });
  }

  startClaudiaGlance({ talk = false } = {}) {
    // Slide-right pan (front exits left, Claudia enters from right) + light dissolve.
    // Silent glance: auto-returns after checkHoldSec. Talk: stays until panel closes.
    if (this.checkPhase === "idle") {
      this.checkPhase = "in";
      this.checkPhaseT = 0;
      const variant = this.claudia.pickNextVariant();
      this._claudiaVariant = variant;
      this.claudia.setSmile(true);
    } else if (!talk) {
      return; // already glancing / talking
    }

    this.talkMode = !!talk;
    if (talk) {
      const openNow = this.checkPhase === "hold" || this.screen.viewBlend >= 0.999;
      if (openNow) {
        const view = this.dialogue.currentId != null
          ? this.dialogue._view(this.dialogue.current)
          : this.dialogue.start(dialogueStartId);
        if (view) this.dialoguePanel.show(view);
      } else {
        this._openTalkWhenHeld = true;
      }
    } else {
      this._openTalkWhenHeld = false;
      this.dialoguePanel.hide();
    }
  }

  onDialogueChoose(index) {
    const view = this.dialogue.choose(index);
    if (view) this.dialoguePanel.show(view);
    // null view → onExit already closing talk / returning
  }

  closeTalkPanel({ returnToRoad = true } = {}) {
    this.dialogue.suspend();
    this.dialoguePanel.hide();
    this.talkMode = false;
    this._openTalkWhenHeld = false;
    if (returnToRoad) this.beginReturnToRoad();
  }

  beginReturnToRoad() {
    if (this.checkPhase === "idle" || this.checkPhase === "out") return;
    this.checkPhase = "out";
    this.checkPhaseT = 0;
  }

  prepareFrontView() {
    // Front driver view: Claudia must not exist in this render at all.
    this.claudia.object.visible = false;
    if (this.claudia.hideBackdrop) this.claudia.hideBackdrop();
    if (this._sideSavedBrighter != null) {
      this.drawBrighterGround = this._sideSavedBrighter;
      this._sideSavedBrighter = null;
    }
    this._restoreFrontTints();
    this.dashboard.object.visible = true;
    this.myCarMesh.visible = false;
    this.sky.visible = true;
    if (this.sideSky) this.sideSky.visible = false;
    if (this.level != null) {
      this.level.sky.visible = true;
      this.level.world.visible = true;
    }
    for (let i = 0; i < this.numOtherCars; i++) {
      if (this.otherCarExteriors[i]) this.otherCarExteriors[i].visible = true;
    }
  }

  prepareSideView() {
    // Side view: live 3D from the "claudia" back-seat mount (passenger-side aim).
    // Full-bleed cover plane (PNG as supplied, unmirrored) composites via alphaTest;
    // α=0 window reveals the real industrial road/poles/sky — no fake canvas backdrop.
    this.dashboard.object.visible = false;
    this.myCarMesh.visible = false;
    // Full 360° sky shell so sideways look still hits amber gradient (half-shell only covers forward).
    if (this.sideSky) {
      this.sky.visible = false;
      this.sideSky.visible = true;
      // Cap horizon shade so dither never reaches lightTint white.
      if (this.level != null) {
        this._retintSideSkyCapped(this.sideSky, this.level);
      }
    } else {
      this.sky.visible = true;
    }
    if (this.level != null) {
      this.level.sky.visible = true;
      this.level.world.visible = true;
    }
    for (let i = 0; i < this.otherCarExteriors.length; i++) {
      if (this.otherCarExteriors[i]) this.otherCarExteriors[i].visible = false;
    }

    const passengerSign = -this.drivingSide; // RIGHT → +1
    // Back seat, passenger-side aim (NOT stock +π·0.625). Raised + level pitch + FOV 85
    // so windows read amber sky / poles / wires / lamps like the old backdrop.
    this.claudiaCameraMount.position.set(0.20 * passengerSign, -0.45, 1.45);
    this.claudiaCameraMount.rotation.order = "XYZ";
    this.claudiaCameraMount.rotation.set(PI * 0.5, -PI * 0.38 * passengerSign, 0);
    this.sideCamera.position.set(0, 0, 0);
    this.sideCamera.rotation.set(0, 0, 0);
    this.sideCamera.fov = 85;
    this.sideCamera.near = 0.05;
    this.sideCamera.far = 100000;
    this.sideCamera.aspect = this.screen.camera.aspect;
    this.sideCamera.updateProjectionMatrix();

    // Keep clear color at night ground — brighter clear + white lightTint was
    // blowing lamps/sky through dither into flashing white. Cap lightTint to amber.
    this._sideSavedBrighter = this.drawBrighterGround;
    this.drawBrighterGround = false;
    this.updateBackgroundColor();
    this._applySideAmberTints();

    // Face-anchored cover-fit overlay; real world shows through α cutouts.
    this.claudia.attachToSideCamera(this.sideCamera, {
      dist: 0.85,
      focusU: 0.68, // face-centered; phone cover crops sides around her
      focusV: 0.36,
    });
    if (this.claudia.hideBackdrop) this.claudia.hideBackdrop();
    this.claudia.object.visible = true;
  }

  updateCheckClaudia(dt) {
    if (this.checkPhase === "idle") {
      this.screen.viewBlend = 0;
      this.claudia.object.visible = false;
      if (this.claudia.hideBackdrop) this.claudia.hideBackdrop();
      this.sky.visible = true;
      if (this.sideSky) this.sideSky.visible = false;
      return;
    }
    this.checkPhaseT += dt;
    if (this.checkPhase === "in") {
      const u = Math.min(1, this.checkPhaseT / this.checkDissolveSec);
      this.screen.viewBlend = u * u * (3 - 2 * u); // smoothstep
      if (u >= 1) {
        this.checkPhase = "hold";
        this.checkPhaseT = 0;
        this.screen.viewBlend = 1;
      }
    } else if (this.checkPhase === "hold") {
      this.screen.viewBlend = 1;
      if (this._openTalkWhenHeld) {
        this._openTalkWhenHeld = false;
        const view = this.dialogue.current
          ? this.dialogue._view(this.dialogue.current)
          : this.dialogue.start(dialogueStartId);
        if (view) this.dialoguePanel.show(view);
      }
      // Silent glance auto-returns; Talk stays until the panel closes / branch ends.
      if (!this.talkMode && this.checkPhaseT >= this.checkHoldSec) {
        this.checkPhase = "out";
        this.checkPhaseT = 0;
      }
    } else if (this.checkPhase === "out") {
      const u = Math.min(1, this.checkPhaseT / this.checkDissolveSec);
      this.screen.viewBlend = 1 - u * u * (3 - 2 * u);
      if (u >= 1) {
        this.checkPhase = "idle";
        this.checkPhaseT = 0;
        this.screen.viewBlend = 0;
        this.claudia.setSmile(false);
        this.claudia.object.visible = false;
        if (this.claudia.hideBackdrop) this.claudia.hideBackdrop();
        this.sky.visible = true;
        if (this.sideSky) this.sideSky.visible = false;
        this.dashboard.object.visible = this.cameraMount === this.driverCameraMount;
      }
    }
  }

  setCameraMount(name) {
    // Lock-out: only "driver" may own the front camera. Side view uses altCamera.
    if (name !== "driver") {
      console.info("Claudia Night Drive: camera locked to driver (ignored", name, ")");
      name = "driver";
    }
    const mount = this.cameraMountsByName.get(name);
    if (mount == null) return;
    this.cameraMount = mount.mount;
    this.drawBrighterGround = mount.drawBrighterGround;
    this.cameraMount.add(this.screen.camera);
    this.updateCamera();
  }

  updateCamera() {
    // The dashboard only appears if the camera is in the driver's seat
    this.dashboard.object.visible = this.cameraMount == this.driverCameraMount;

    // Only show the level's sky if the camera is the driver camera
    if (this.level != null) {
      this.level.sky.visible = !this.isWireframe && this.cameraMount != this.aerialCameraMount && this.cameraMount != this.satelliteCameraMount;
    }
    this.sky.rotation.y = this.cameraMount.rotation.y;

    // Only show my car if the camera is not the driver camera
    this.myCarMesh.visible =
      this.cameraMount !== this.driverCameraMount && this.cameraMount !== this.rearCameraMount && this.cameraMount !== this.claudiaCameraMount;
    this.myCarMesh.needsUpdate = true;

    if (this.level != null) {
      this.updateBackgroundColor();
    }
  }

  update() {
    this.dashboard.update();
    this.controlScheme.update();

    // now let's get the time delta here
    const now = Date.now();
    let delta = Math.min(0.1, isNaN(this.lastTime) ? 0 : (now - this.lastTime) / 1000); // maximum delta is 0.1 seconds
    delta = lerp(this.lastDelta, delta, 0.5); // soften it to deal with coarse timing issues
    this.lastTime = now;
    this.lastDelta = delta;

    const simSpeed = this.controlScheme.slow ? 0.125 : this.controlScheme.fast ? 4 : 1;
    const simDelta = simSpeed * delta;

    // Drive all the cars and update their positions/rotations
    for (let i = 0; i < this.numOtherCars; i++) {
      this.otherCars[i].drive(simDelta, this.level.cruiseSpeed, this.npcControlScheme, this.drivingSide);
      this.updateCarExterior(this.otherCars[i], this.otherCarExteriors[i]);
    }

    const myCruiseSpeed = Math.max(this.controlScheme.minCruiseSpeed, this.cruiseSpeed) * this.level.cruiseSpeed;
    this.myCar.drive(simDelta, myCruiseSpeed, this.controlScheme, this.drivingSide);
    this.updateCarExterior(this.myCar, this.myCarExterior);
    this.myCarInterior.rotation.x = this.myCar.pitch * PI;
    this.driver.rotation.y = this.myCar.tilt * PI;
    this.hoodCameraMount.rotation.z = -this.myCar.tilt * PI;
    this.hoodCameraMount.rotation.x = (this.myCar.pitch + 0.5) * PI;

    // Update the dashboard
    this.dashboard.object.rotation.z = this.driver.rotation.y;
    this.dashboard.wheelRotation = lerp(this.dashboard.wheelRotation, PI + this.myCar.steerPos * 50, 0.3);
    const speed = this.myCar.vel.length() * 0.009;

    let tach = (2 * speed) / this.gear ** 0.5;
    if (this.gear < 3 && tach > 0.8) {
      this.gear++;
    } else if (this.gear > 1 && tach < 0.4) {
      this.gear--;
    }

    this.dashboard.speed = speed;
    this.dashboard.tach = tach; // this.screen.frameRate / 80;

    // Always driving: refuse zero cruise even if something external sets it.
    if (this.cruiseSpeed < 0.5) this.cruiseSpeed = 0.5;

    this.updateCheckClaudia(delta);
  }

  setNumOtherCars(num) {
    this.numOtherCars = num;

    // Other cars are procedurally generated as needed
    while (this.otherCars.length < this.numOtherCars) {
      this.otherCars.push(new Car());
      const otherCarExterior = buildCar();
      this.otherCarExteriors.push(otherCarExterior);
    }

    for (let i = 0; i < this.otherCars.length; i++) {
      if (i < this.numOtherCars) {
        if (this.otherCarExteriors[i].parent == null) {
          this.screen.scene.add(this.otherCarExteriors[i]);
        }

        this.otherCars[i].place(
          this.level.mainRoad,
          this.autoSteerApproximation,
          Math.random(),
          this.level.laneWidth,
          this.level.numLanes,
          this.drivingSide,
          Math.random() < 0.5 ? 1 : -1,
          this.level.cruiseSpeed
        );
      } else {
        if (this.otherCarExteriors[i].parent != null) {
          this.screen.scene.remove(this.otherCarExteriors[i]);
        }

        this.otherCars[i].remove();
      }
    }
  }

  updateCarExterior(car, exterior) {
    exterior.position.x = car.pos.x;
    exterior.position.y = car.pos.y;
    exterior.rotation.z = car.angle - PI * 0.5;
  }
}
