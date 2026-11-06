/*
  Talk panel: scrolling conversation log + A/B/C choices.
  Log keeps Claudia's lines and the player's replies for this page visit.
*/

export default class DialoguePanel {
  constructor({ onChoose = null, onClose = null, onDrive = null } = {}) {
    this.onChoose = onChoose;
    this.onClose = onClose;
    this.onDrive = onDrive;
    this.root = document.createElement("div");
    this.root.id = "dialoguePanel";
    this.root.hidden = true;
    this.root.innerHTML = `
      <div class="dialogue-card">
        <div class="dialogue-log" id="dialogueLog" aria-live="polite"></div>
        <div class="dialogue-choices" id="dialogueChoices" role="group" aria-label="Replies"></div>
        <button type="button" class="dialogue-close" id="dialogueClose">Close</button>
      </div>
    `;
    document.body.appendChild(this.root);
    this.logEl = this.root.querySelector("#dialogueLog");
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

  _bindActivate(el, handler) {
    let lastTs = 0;
    const run = (event) => {
      const now = Date.now();
      if (now - lastTs < 350) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      lastTs = now;
      event.preventDefault();
      event.stopPropagation();
      handler();
    };
    el.addEventListener("pointerup", (event) => {
      if (event.button != null && event.button !== 0) return;
      run(event);
    });
    el.addEventListener("click", run);
  }

  _renderLog(view) {
    const entries = Array.isArray(view?.log) ? view.log : [];
    this.logEl.innerHTML = "";
    if (entries.length === 0 && view?.line) {
      const row = document.createElement("div");
      row.className = "dialogue-log-row dialogue-log-claudia";
      row.textContent = view.line;
      this.logEl.appendChild(row);
    } else {
      for (const entry of entries) {
        const row = document.createElement("div");
        const isYou = entry.role === "you";
        row.className = `dialogue-log-row ${isYou ? "dialogue-log-you" : "dialogue-log-claudia"}`;
        row.textContent = isYou ? `You: ${entry.text}` : entry.text;
        this.logEl.appendChild(row);
      }
    }
    // Auto-scroll to newest while still allowing scrollback.
    requestAnimationFrame(() => {
      this.logEl.scrollTop = this.logEl.scrollHeight;
    });
  }

  show(view) {
    if (view == null) {
      this.hide();
      return;
    }
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
