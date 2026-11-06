/*
  Talk panel: scrolling conversation log + A/B/C choices.
  Staging: typed ELIZA mode with text box; switch back to choices without losing place.
  Log keeps Claudia's lines and the player's replies for this page visit.
  All player/Claudia text via textContent (HTML shown as text). Local only.
*/

export default class DialoguePanel {
  constructor({
    onChoose = null,
    onClose = null,
    onDrive = null,
    onTypedSubmit = null,
    onModeChange = null,
  } = {}) {
    this.onChoose = onChoose;
    this.onClose = onClose;
    this.onDrive = onDrive;
    this.onTypedSubmit = onTypedSubmit;
    this.onModeChange = onModeChange;
    this._choiceLockUntil = 0;
    this.mode = "choices"; // choices | typed
    this._lastChoicesView = null;
    this._typedLog = []; // {role:'you'|'claudia', text}
    this._typedLine = "";

    this.root = document.createElement("div");
    this.root.id = "dialoguePanel";
    this.root.hidden = true;
    this.root.innerHTML = `
      <div class="dialogue-card">
        <div class="dialogue-main">
          <div class="dialogue-mode-bar" id="dialogueModeBar">
            <button type="button" class="dialogue-mode-btn is-active" id="dialogueModeChoices" aria-pressed="true">A / B / C</button>
            <button type="button" class="dialogue-mode-btn" id="dialogueModeTyped" aria-pressed="false">Type</button>
          </div>
          <div class="dialogue-narration" id="dialogueNarration" hidden></div>
          <div class="dialogue-line" id="dialogueLine" aria-live="polite"></div>
          <div class="dialogue-choices" id="dialogueChoices" role="group" aria-label="Replies"></div>
          <form class="dialogue-typed" id="dialogueTyped" hidden>
            <label class="dialogue-typed-label" for="dialogueTypedInput">Say something</label>
            <div class="dialogue-typed-row">
              <input type="text" id="dialogueTypedInput" class="dialogue-typed-input" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="true" enterkeyhint="send" maxlength="500" />
              <button type="submit" class="dialogue-typed-send" id="dialogueTypedSend">Send</button>
            </div>
          </form>
          <button type="button" class="dialogue-close" id="dialogueClose">Close</button>
        </div>
        <div class="dialogue-history">
          <div class="dialogue-history-label">Earlier</div>
          <div class="dialogue-log" id="dialogueLog"></div>
        </div>
      </div>
    `;
    document.body.appendChild(this.root);
    this.narrationEl = this.root.querySelector("#dialogueNarration");
    this.lineEl = this.root.querySelector("#dialogueLine");
    this.logEl = this.root.querySelector("#dialogueLog");
    this.historyWrap = this.root.querySelector(".dialogue-history");
    this.choicesEl = this.root.querySelector("#dialogueChoices");
    this.typedForm = this.root.querySelector("#dialogueTyped");
    this.typedInput = this.root.querySelector("#dialogueTypedInput");
    this.modeChoicesBtn = this.root.querySelector("#dialogueModeChoices");
    this.modeTypedBtn = this.root.querySelector("#dialogueModeTyped");
    this.closeBtn = this.root.querySelector("#dialogueClose");

    this.closeBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.onClose) this.onClose();
    });
    this.modeChoicesBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.setMode("choices");
    });
    this.modeTypedBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.setMode("typed");
    });
    this.typedForm.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const raw = this.typedInput.value;
      this.typedInput.value = "";
      if (this.onTypedSubmit) this.onTypedSubmit(raw);
      // Keep focus for mobile keyboard flow
      requestAnimationFrame(() => {
        try {
          this.typedInput.focus({ preventScroll: true });
        } catch (_) {
          this.typedInput.focus();
        }
      });
    });
    // Keep touch scrolling inside the log from being treated as drive input.
    this.logEl.addEventListener(
      "touchmove",
      (event) => event.stopPropagation(),
      { passive: true }
    );
    this.typedInput.addEventListener(
      "touchmove",
      (event) => event.stopPropagation(),
      { passive: true }
    );
  }

  setMode(mode) {
    if (mode !== "choices" && mode !== "typed") return;
    const prev = this.mode;
    this.mode = mode;
    this.modeChoicesBtn.setAttribute("aria-pressed", mode === "choices" ? "true" : "false");
    this.modeTypedBtn.setAttribute("aria-pressed", mode === "typed" ? "true" : "false");
    this.modeChoicesBtn.classList.toggle("is-active", mode === "choices");
    this.modeTypedBtn.classList.toggle("is-active", mode === "typed");
    if (mode === "typed") {
      this.choicesEl.hidden = true;
      this.typedForm.hidden = false;
      this.closeBtn.hidden = false;
      this._renderTyped();
      requestAnimationFrame(() => {
        try {
          this.typedInput.focus({ preventScroll: true });
        } catch (_) {
          this.typedInput.focus();
        }
      });
    } else {
      this.typedForm.hidden = true;
      this.choicesEl.hidden = false;
      if (this._lastChoicesView) this.show(this._lastChoicesView);
    }
    if (prev !== mode && this.onModeChange) this.onModeChange(mode);
  }

  _activateOnce(handler) {
    const now = Date.now();
    if (now < this._choiceLockUntil) return false;
    this._choiceLockUntil = now + 450;
    handler();
    return true;
  }

  _bindActivate(el, handler) {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this._activateOnce(handler);
    });
  }

  _historyEntries(view) {
    const entries = Array.isArray(view?.log) ? view.log.slice() : [];
    const current = (view?.line || "").trim();
    const narration = (view?.narration || "").trim();
    if (current && entries.length) {
      const last = entries[entries.length - 1];
      if (last?.role === "claudia" && last.text === current) entries.pop();
    }
    if (narration && entries.length) {
      const last = entries[entries.length - 1];
      if (last?.role === "narration" && last.text === narration) entries.pop();
    }
    return entries;
  }

  _renderLogFromEntries(entries) {
    this.logEl.innerHTML = "";
    if (this.historyWrap) this.historyWrap.hidden = entries.length === 0;
    for (const entry of entries) {
      const row = document.createElement("div");
      const isYou = entry.role === "you";
      const isNarr = entry.role === "narration";
      row.className = `dialogue-log-row ${isYou ? "dialogue-log-you" : isNarr ? "dialogue-log-narration" : "dialogue-log-claudia"}`;
      // textContent: HTML tags from player input render as literal text
      row.textContent = isYou ? `You: ${entry.text}` : entry.role === "claudia" || !entry.role ? `Claudia: ${entry.text}` : entry.text;
      // Choices-mode history historically omitted "Claudia:" prefix for claudia lines —
      // keep prefix only in typed mode for clearer You/Claudia history.
      if (this.mode !== "typed" && !isYou && !isNarr) {
        row.textContent = entry.text;
      }
      this.logEl.appendChild(row);
    }
    requestAnimationFrame(() => {
      this.logEl.scrollTop = this.logEl.scrollHeight;
    });
  }

  _renderLog(view) {
    this._renderLogFromEntries(this._historyEntries(view));
  }

  /** Replace typed transcript (opener + turns). */
  setTypedState({ line = "", log = [] } = {}) {
    this._typedLine = line || "";
    this._typedLog = Array.isArray(log) ? log.slice() : [];
    if (this.mode === "typed" && !this.root.hidden) this._renderTyped();
  }

  appendTypedTurn(youText, claudiaText) {
    if (youText != null) this._typedLog.push({ role: "you", text: String(youText) });
    if (claudiaText != null) {
      this._typedLog.push({ role: "claudia", text: String(claudiaText) });
      this._typedLine = String(claudiaText);
    }
    if (this.mode === "typed") this._renderTyped();
  }

  _renderTyped() {
    this.lineEl.textContent = this._typedLine || "";
    if (this.narrationEl) {
      this.narrationEl.hidden = true;
      this.narrationEl.textContent = "";
    }
    // History = earlier turns; current Claudia line stays in main column
    const entries = this._typedLog.slice();
    const current = (this._typedLine || "").trim();
    if (current && entries.length) {
      const last = entries[entries.length - 1];
      if (last?.role === "claudia" && last.text === current) entries.pop();
    }
    this._renderLogFromEntries(entries);
    this.choicesEl.hidden = true;
    this.typedForm.hidden = false;
    this.closeBtn.hidden = false;
  }

  show(view) {
    if (view == null) {
      this.hide();
      return;
    }
    this._lastChoicesView = view;
    if (this.mode === "typed") {
      // Keep typed UI if user switched; don't wipe choices snapshot
      this.root.hidden = false;
      this._renderTyped();
      return;
    }
    const narration = (view.narration || "").trim();
    if (this.narrationEl) {
      if (narration) {
        this.narrationEl.hidden = false;
        this.narrationEl.textContent = narration;
      } else {
        this.narrationEl.hidden = true;
        this.narrationEl.textContent = "";
      }
    }
    this.lineEl.textContent = view.line || "";
    this._renderLog(view);
    this.choicesEl.innerHTML = "";
    this.choicesEl.hidden = false;
    this.typedForm.hidden = true;
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
