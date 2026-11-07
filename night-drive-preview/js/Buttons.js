export default class Buttons {
  constructor() {
    this.listeners = [];
    this.buttonsContainer = document.createElement("div");
    this.buttonsContainer.id = "buttonsContainer";
    this.buttonsContainer.classList.add("claudia-only");
    this.element = document.createElement("div");
    this.element.id = "buttons";
    this.isMouseOverEmbeddedPlaylist = false;
    this.isMouseOver = false;
    document.body.appendChild(this.buttonsContainer);
    this.buttonsContainer.appendChild(this.element);

    this.addActionButton("checkClaudia", () => `<div class='label'>claudia</div>`);
    this.addActionButton("drive", () => `<div class='label'>Drive</div>`);
    this.addActionButton("talkClaudia", () => `<div class='label'>Talk to Claudia</div>`);

    // Compact music transport in the bar
    this.musicGroup = document.createElement("div");
    this.musicGroup.id = "musicTransport";
    this.musicGroup.innerHTML = `
      <button type="button" id="button_musicMute" title="Sound off" aria-label="Sound off"><div class="label">🔊</div></button>
      <button type="button" id="button_musicPrev" title="Previous"><div class="label">⏮</div></button>
      <button type="button" id="button_musicToggle" title="Play/Pause"><div class="label">▶</div></button>
      <button type="button" id="button_musicNext" title="Next"><div class="label">⏭</div></button>
      <label class="music-vol" title="Volume">
        <input id="musicVolume" type="range" min="0" max="1" step="0.01" value="0.25" aria-label="Volume" />
      </label>
      <div id="musicTitle" class="music-title"></div>
    `;
    this.element.appendChild(this.musicGroup);
    this.musicMuteBtn = this.musicGroup.querySelector("#button_musicMute");
    this.musicMuteBtn.addEventListener("click", (e) => { e.stopPropagation(); this.dispatch("musicMute", "trigger"); });
    this.musicGroup.querySelector("#button_musicPrev").addEventListener("click", () => this.dispatch("musicPrev", "trigger"));
    this.musicGroup.querySelector("#button_musicToggle").addEventListener("click", () => this.dispatch("musicToggle", "trigger"));
    this.musicGroup.querySelector("#button_musicNext").addEventListener("click", () => this.dispatch("musicNext", "trigger"));
    this.musicVolEl = this.musicGroup.querySelector("#musicVolume");
    this.musicVolEl.addEventListener("input", (e) => this.dispatch("musicVolume", e.target.value));
    this.musicVolEl.addEventListener("change", (e) => this.dispatch("musicVolume", e.target.value));
    // Prevent touch drag on the slider from scrolling the page / stealing drive gestures oddly
    this.musicVolEl.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
    this.musicVolEl.addEventListener("touchmove", (e) => e.stopPropagation(), { passive: true });
    this.musicTitleEl = this.musicGroup.querySelector("#musicTitle");
    this.musicToggleBtn = this.musicGroup.querySelector("#button_musicToggle .label");

    this.addActionButton("controls", () => `<div class='label'>⚙</div>`);
    this.addActionButton("vibe", () => `<div class='label vibe-label'>Vibe</div>`);
    this._buildVibeMenu();

    this.controlsMenu = document.createElement("div");
    this.controlsMenu.id = "controlsMenu";
    this.controlsMenu.hidden = true;
    document.body.appendChild(this.controlsMenu);

    // Keep empty musicMenu node for any legacy CSS; unused
    this.musicMenu = document.createElement("div");
    this.musicMenu.id = "musicMenu";
    this.musicMenu.hidden = true;
    document.body.appendChild(this.musicMenu);

    const stylesheet = Array.from(document.styleSheets).find((sheet) => sheet.title === "main");
    this.bodyRule = Array.from(stylesheet.cssRules).find((rule) => rule.selectorText === "body, colors");

    for (const ev of ["mousemove", "mousedown", "mouseup", "touchstart", "touchmove", "touchend"]) {
      document.addEventListener(ev, this.onMouse.bind(this), false);
    }
    this.element.addEventListener("mouseover", () => (this.isMouseOver = true));
    this.element.addEventListener("mouseout", () => (this.isMouseOver = false));
  }

  onMouse() { this.wakeUp(); }

  wakeUp() {
    if (this.buttonsContainer.classList.contains("awake")) return;
    clearTimeout(this.awakeTimer);
    this.buttonsContainer.classList.toggle("awake", true);
    this.awakeTimer = setTimeout(() => {
      this.buttonsContainer.classList.toggle("awake", false);
      if (this.isMouseOver || this.isMouseOverEmbeddedPlaylist) this.wakeUp();
    }, 4000);
  }

  addListener(func) {
    if (!this.listeners.includes(func)) this.listeners.push(func);
  }

  dispatch(id, value) {
    for (const listener of this.listeners) listener(id, value);
  }

  addActionButton(id, labelMaker) {
    const button = document.createElement("button");
    button.id = `button_${id}`;
    button.name = id;
    button.type = "button";
    button.innerHTML = labelMaker();
    this.element.appendChild(button);
    button.addEventListener("click", () => this.dispatch(id, "trigger"));
  }

  /** One hue rotation for the whole page: road, sky, Claudia and UI stay matched. */
  _buildVibeMenu() {
    const presets = [
      ["Orange", 0], ["Rose", 330], ["Violet", 270], ["Blue", 200], ["Teal", 160], ["Green", 95],
    ];
    const m = document.createElement("div");
    m.id = "vibeMenu";
    m.hidden = true;
    m.innerHTML = `<div class="vibe-swatches">${presets
      .map(([n, h]) => `<button type="button" class="vibe-swatch" data-h="${h}" title="${n}" aria-label="${n}" style="background:hsl(${30 + h},90%,50%)"></button>`)
      .join("")}</div><input id="vibeHue" type="range" min="0" max="359" step="1" value="0" aria-label="Hue" />`;
    document.body.appendChild(m);
    this.vibeMenu = m;
    const slider = m.querySelector("#vibeHue");
    const apply = (h) => {
      h = ((Number(h) % 360) + 360) % 360;
      document.documentElement.style.filter = h ? `hue-rotate(${h}deg)` : "";
      // Counter-rotate the picker so its swatches show their true colors.
      m.style.filter = h ? `hue-rotate(${-h}deg)` : "";
      slider.value = String(h);
      m.querySelectorAll(".vibe-swatch").forEach((b) => b.classList.toggle("active", Number(b.dataset.h) === h));
      try { localStorage.setItem("nd_hue", String(h)); } catch (_) {}
    };
    m.querySelectorAll(".vibe-swatch").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); apply(b.dataset.h); }));
    slider.addEventListener("input", (e) => apply(e.target.value));
    for (const ev of ["touchstart", "touchmove", "pointerdown", "mousedown"]) m.addEventListener(ev, (e) => e.stopPropagation(), { passive: true });
    // Tap / click anywhere outside the palette (and not on the Vibe button) closes it.
    const outside = (e) => {
      if (m.hidden) return;
      const t = e.target;
      if (m.contains(t)) return;
      const vb = document.getElementById("button_vibe");
      if (vb && vb.contains(t)) return;
      m.hidden = true;
    };
    document.addEventListener("pointerdown", outside, true);
    let saved = 0;
    try { saved = Number(localStorage.getItem("nd_hue")) || 0; } catch (_) {}
    apply(saved);
  }

  toggleVibeMenu(force) {
    const open = force != null ? force : this.vibeMenu.hidden;
    this.vibeMenu.hidden = !open;
    if (open && this.controlsMenu) this.controlsMenu.hidden = true;
    return open;
  }

  setMusicStatus(st) {
    if (!this.musicTitleEl) return;
    this.musicTitleEl.textContent = st.title || "";
    this.musicTitleEl.title = st.title || "";
    if (this.musicToggleBtn) {
      this.musicToggleBtn.textContent = !st.userStarted || st.paused ? "▶" : "❚❚";
    }
    if (this.musicMuteBtn) {
      const off = !!st.muted;
      this.musicMuteBtn.querySelector(".label").textContent = off ? "🔇" : "🔊";
      this.musicMuteBtn.title = off ? "Sound on" : "Sound off";
      this.musicMuteBtn.setAttribute("aria-label", off ? "Sound on" : "Sound off");
      this.musicMuteBtn.classList.toggle("muted", off);
    }
    if (this.musicVolEl && typeof st.volume === "number") {
      const v = String(Math.round(st.volume * 100) / 100);
      if (this.musicVolEl.value !== v) this.musicVolEl.value = v;
    }
  }

  // legacy no-op so old Drivey refresh calls don't break
  setMusicTracks(_tracks, _opts = {}) {}
  toggleMusicMenu() { return false; }

  setControlsMenu({ current = "autopilot", onPick = null } = {}) {
    const modes = [
      { id: "autopilot", label: "Autopilot" },
      { id: "touch", label: "Touch to drive" },
      { id: "arrows", label: "Keyboard arrows" },
    ];
    this.controlsMenu.innerHTML = "";
    for (const m of modes) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "controls-option" + (m.id === current ? " active" : "");
      btn.textContent = m.label;
      btn.addEventListener("click", () => {
        if (onPick) onPick(m.id);
        this.controlsMenu.hidden = true;
      });
      this.controlsMenu.appendChild(btn);
    }
  }

  toggleControlsMenu(force) {
    const open = force != null ? force : this.controlsMenu.hidden;
    this.controlsMenu.hidden = !open;
    if (open && this.vibeMenu) this.vibeMenu.hidden = true;
    return open;
  }

  setButton(_id, _value) {}

  setColors(backgroundColor, borderColor, lightColor) {
    if (this.bodyRule == null) return;
    this.bodyRule.style.setProperty("--dashboard-background-color", `#${backgroundColor.getHex().toString(16).padStart(6, "0")}`);
    this.bodyRule.style.setProperty("--dashboard-border-color", `#${borderColor.getHex().toString(16).padStart(6, "0")}`);
    this.bodyRule.style.setProperty("--dashboard-light-color", `#${lightColor.getHex().toString(16).padStart(6, "0")}`);
  }

  setWireframe(enabled) {
    this.element.classList.toggle("wireframe", enabled);
  }
}
