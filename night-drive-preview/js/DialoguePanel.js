/*
  Minimal Talk panel: Claudia's line + A/B/C choices.
*/

export default class DialoguePanel {
  constructor({ onChoose = null, onClose = null } = {}) {
    this.onChoose = onChoose;
    this.onClose = onClose;
    this.root = document.createElement("div");
    this.root.id = "dialoguePanel";
    this.root.hidden = true;
    this.root.innerHTML = `
      <div class="dialogue-card">
        <div class="dialogue-line" id="dialogueLine"></div>
        <div class="dialogue-choices" id="dialogueChoices"></div>
        <button type="button" class="dialogue-close" id="dialogueClose">Close</button>
      </div>
    `;
    document.body.appendChild(this.root);
    this.lineEl = this.root.querySelector("#dialogueLine");
    this.choicesEl = this.root.querySelector("#dialogueChoices");
    this.root.querySelector("#dialogueClose").addEventListener("click", () => {
      if (this.onClose) this.onClose();
    });
  }

  show(view) {
    if (view == null) {
      this.hide();
      return;
    }
    this.lineEl.textContent = view.line || "";
    this.choicesEl.innerHTML = "";
    const letters = ["A", "B", "C"];
    for (const choice of view.choices || []) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dialogue-choice";
      btn.textContent = `${letters[choice.index] ?? "?"}. ${choice.label}`;
      btn.addEventListener("click", () => {
        if (this.onChoose) this.onChoose(choice.index);
      });
      this.choicesEl.appendChild(btn);
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
