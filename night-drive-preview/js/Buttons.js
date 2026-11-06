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

    // Glance at Claudia (side view, no Talk panel).
    this.addActionButton("checkClaudia", () => `<div class='label'>claudia</div>`);
    // Enter side view + open dialogue panel.
    this.addActionButton("talkClaudia", () => `<div class='label'>Talk to Claudia</div>`);
    // Music: opens/closes the manual track list (empty until tracks are added).
    this.addActionButton("music", () => `<div class='label'>music</div>`);

    this.musicMenu = document.createElement("div");
    this.musicMenu.id = "musicMenu";
    this.musicMenu.hidden = true;
    this.musicMenu.innerHTML = `<div class="music-empty">No tracks yet</div>`;
    document.body.appendChild(this.musicMenu);

    const stylesheet = Array.from(document.styleSheets).find((sheet) => sheet.title === "main");
    this.bodyRule = Array.from(stylesheet.cssRules).find((rule) => rule.selectorText === "body, colors");

    document.addEventListener("mousemove", this.onMouse.bind(this), false);
    document.addEventListener("mousedown", this.onMouse.bind(this), false);
    document.addEventListener("mouseup", this.onMouse.bind(this), false);
    document.addEventListener("touchstart", this.onMouse.bind(this), false);
    document.addEventListener("touchmove", this.onMouse.bind(this), false);
    document.addEventListener("touchend", this.onMouse.bind(this), false);

    this.element.addEventListener("mouseover", () => (this.isMouseOver = true));
    this.element.addEventListener("mouseout", () => (this.isMouseOver = false));
  }

  onMouse() {
    this.wakeUp();
  }

  wakeUp() {
    if (this.buttonsContainer.classList.contains("awake")) return;
    clearTimeout(this.awakeTimer);
    this.buttonsContainer.classList.toggle("awake", true);
    this.awakeTimer = setTimeout(() => {
      this.buttonsContainer.classList.toggle("awake", false);
      if (this.isMouseOver || this.isMouseOverEmbeddedPlaylist) {
        this.wakeUp();
      }
    }, 4000);
  }

  addListener(func) {
    if (!this.listeners.includes(func)) {
      this.listeners.push(func);
    }
  }

  dispatch(id, value) {
    for (const listener of this.listeners) {
      listener(id, value);
    }
  }

  addActionButton(id, labelMaker) {
    const button = document.createElement("button");
    button.id = `button_${id}`;
    button.name = id;
    button.type = "button";
    button.innerHTML = labelMaker();
    this.element.appendChild(button);
    button.addEventListener("click", () => {
      this.dispatch(id, "trigger");
    });
  }

  setMusicTracks(tracks, { currentId = null, onPick = null, onSkip = null, userStarted = false } = {}) {
    this.musicMenu.innerHTML = "";
    if (!tracks || tracks.length === 0) {
      const empty = document.createElement("div");
      empty.className = "music-empty";
      empty.textContent = "No tracks yet — add local MP3s in js/music-tracks.js";
      this.musicMenu.appendChild(empty);
      return;
    }
    for (const t of tracks) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "music-track" + (t.id === currentId ? " playing" : "");
      btn.textContent = t.title || t.id;
      btn.addEventListener("click", () => {
        if (onPick) onPick(t.id);
      });
      this.musicMenu.appendChild(btn);
    }
    const skip = document.createElement("button");
    skip.type = "button";
    skip.className = "music-skip";
    skip.textContent = "Skip / next";
    skip.disabled = false;
    skip.addEventListener("click", () => {
      if (onSkip) onSkip();
    });
    this.musicMenu.appendChild(skip);
  }

  toggleMusicMenu(force) {
    const open = force != null ? force : this.musicMenu.hidden;
    this.musicMenu.hidden = !open;
    return open;
  }

  setButton(_id, _value) {
    // No cycling buttons (camera / level / side / effect) in this fork.
  }

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
