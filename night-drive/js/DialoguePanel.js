/*
  Talk panel: scrolling conversation log + A/B/C choices.
  Log keeps Claudia's lines and the player's replies for this page visit.
*/

export default class DialoguePanel {
  constructor({ onChoose = null, onClose = null, onDrive = null } = {}) {
    this.onChoose = onChoose;
    this.onClose = onClose;
    this.onDrive = onDrive;
    this._choiceLockUntil = 0;
    this.root = document.createElement("div");
    this.root.id = "dialoguePanel";
    this.root.hidden = true;
    this.root.innerHTML = `
      <div class="dialogue-card">
        <div class="dialogue-main">
          <div class="dialogue-line" id="dialogueLine" aria-live="polite"></div>
          <div class="dialogue-choices" id="dialogueChoices" role="group" aria-label="Replies"></div>
          <button type="button" class="dialogue-close" id="dialogueClose">Close</button>
        </div>
        <div class="dialogue-history">
          <div class="dialogue-history-label">Earlier</div>
          <div class="dialogue-log" id="dialogueLog"></div>
        </div>
      </div>
    `;
    document.body.appendChild(this.root);
    this.lineEl = this.root.querySelector("#dialogueLine");
    this.logEl = this.root.querySelector("#dialogueLog");
    this.historyWrap = this.root.querySelector(".dialogue-history");
    this.choicesEl = this.root.querySelector("#dialogueChoices");
    this.closeBtn = this.root.querySelector("#dialogueClose");
    this.closeBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.onClose) this.onClose();
    });
    // Keep touch scrolling inside the log from being treated as drive input.
    this.logEl.addEventListener(
      "touchmove",
      (event) => event.stopPropagation(),
      { passive: true }
    );
  }

  _activateOnce(handler) {
    const now = Date.now();
    // Panel-level lock: a phone tap often synthesizes click on the *new*
    // buttons after show() rebuilds the DOM; ignore that ghost event.
    if (now < this._choiceLockUntil) return false;
    this._choiceLockUntil = now + 450;
    handler();
    return true;
  }

  _bindActivate(el, handler) {
    // Single path only (click). No pointerup/touchstart twin listeners.
    el.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this._activateOnce(handler);
    });
  }

  _historyEntries(view) {
    const entries = Array.isArray(view?.log) ? view.log.slice() : [];
    const current = (view?.line || "").trim();
    // Keep the open question in .dialogue-line; history shows earlier turns only.
    if (current && entries.length) {
      const last = entries[entries.length - 1];
      if (last?.role === "claudia" && last.text === current) entries.pop();
    }
    return entries;
  }

  _renderLog(view) {
    const entries = this._historyEntries(view);
    this.logEl.innerHTML = "";
    if (this.historyWrap) this.historyWrap.hidden = entries.length === 0;
    for (const entry of entries) {
      const row = document.createElement("div");
      const isYou = entry.role === "you";
      row.className = `dialogue-log-row ${isYou ? "dialogue-log-you" : "dialogue-log-claudia"}`;
      row.textContent = isYou ? `You: ${entry.text}` : entry.text;
      this.logEl.appendChild(row);
    }
    requestAnimationFrame(() => {
      this.logEl.scrollTop = this.logEl.scrollHeight;
    });
  }

  show(view) {
    if (view == null) {
      this.hide();
      return;
    }
    this.lineEl.textContent = view.line || "";
    this._renderLog(view);
    this.choicesEl.innerHTML = "";
    const choices = view.choices || [];
    const ended = view.ended || choices.length === 0;
    if (ended) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dialogue-choice dialogue-drive";
      btn.textContent = "Drive";
      this._bindActivate(btn, () => {
        if (this.onDrive) this.onDrive();
        else if (this.onClose) this.onClose();
      });
      this.choicesEl.appendChild(btn);
      this.closeBtn.hidden = true;
    } else {
      const letters = ["A", "B", "C"];
      for (const choice of choices) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "dialogue-choice";
        const letter = letters[choice.index] ?? "?";
        btn.innerHTML = `<span class="dialogue-choice-letter">${letter}</span><span class="dialogue-choice-label"></span>`;
        btn.querySelector(".dialogue-choice-label").textContent = choice.label;
        this._bindActivate(btn, () => {
          if (this.onChoose) this.onChoose(choice.index);
        });
        this.choicesEl.appendChild(btn);
      }
      this.closeBtn.hidden = false;
    }
    this.root.hidden = false;
  }

  hide() {
    this.root.hidden = true;
  }

  get isOpen() {
    return !this.root.hidden;
  }
}
