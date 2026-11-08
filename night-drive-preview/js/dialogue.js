/*
  Dialogue engine for Claudia Night Drive.

  Node format (extends the creative draft contract):
    {
      id: string,
      line: string | Array<{ text: string, requireFlags?: Record<string, unknown> }>,
      mood?: string,
      requireFlags?: Record<string, unknown>,   // node only enters if all match
      choices: [                                // exactly 3
        {
          label: string,
          next: string | null,
          setFlags?: Record<string, unknown>,   // applied when chosen
          requireFlags?: Record<string, unknown>, // choice hidden unless match
        } x3
      ],
    }

  Script is loaded from ./dialogue-script.js (placeholder TODO stub for now).
  Choice history + flags live in RUNTIME MEMORY ONLY — never localStorage /
  sessionStorage. Survives closing the Talk panel and switching camera/music
  in the same page; a fresh page load starts a new story.

  No AI calls. Advancement is start() / choose(index) only.
*/

import { script as defaultScript, startId as defaultStartId } from "./dialogue-script.js?v=20261107e";

/** @typedef {{ label: string, next: string | null, setFlags?: Record<string, unknown>, requireFlags?: Record<string, unknown> }} DialogueChoice */
/**
 * @typedef {{
 *   id: string,
 *   line: string | Array<{ text: string, requireFlags?: Record<string, unknown> }>,
 *   mood?: string,
 *   requireFlags?: Record<string, unknown>,
 *   choices: DialogueChoice[]
 * }} DialogueNode
 */

export const script = defaultScript;
export const startId = defaultStartId;

function flagsMatch(required, flags) {
  if (required == null) return true;
  for (const [k, v] of Object.entries(required)) {
    if (flags[k] !== v) return false;
  }
  return true;
}

export default class Dialogue {
  constructor({ script: scriptMap = defaultScript, startId: sid = defaultStartId, onEnter = null, onExit = null } = {}) {
    this.script = scriptMap;
    this.startId = sid;
    this.currentId = null;
    this.onEnter = onEnter;
    this.onExit = onExit;
    this.active = false;
    /** @type {Record<string, unknown>} */
    this.flags = Object.create(null);
    /** @type {Array<{ nodeId: string, choiceIndex: number, label: string, next: string | null }>} */
    this.history = [];
    /** @type {Array<{ role: "claudia" | "you", text: string, nodeId?: string }>} */
    this.log = [];
  }

  get current() {
    if (this.currentId == null) return null;
    return this.script[this.currentId] ?? null;
  }

  /** Resolve the display line for a node given current flags. */
  resolveLine(node = this.current) {
    if (node == null) return "";
    if (typeof node.line === "string") return node.line;
    if (Array.isArray(node.line)) {
      for (const variant of node.line) {
        if (flagsMatch(variant.requireFlags, this.flags)) return variant.text;
      }
      return node.line[node.line.length - 1]?.text ?? "";
    }
    return "";
  }

  /** Choices visible under current flags (still length ≤ 3; pad not applied). */
  visibleChoices(node = this.current) {
    if (node == null) return [];
    const list = Array.isArray(node.choices) ? node.choices : [];
    return list
      .map((c, index) => ({ ...c, index }))
      .filter((c) => flagsMatch(c.requireFlags, this.flags));
  }

  nodeAllowed(nodeId) {
    const node = this.script[nodeId];
    if (node == null) return false;
    return flagsMatch(node.requireFlags, this.flags);
  }


  _appendLog(role, text, nodeId = null) {
    const line = (text ?? "").trim();
    if (!line) return;
    const last = this.log[this.log.length - 1];
    if (last && last.role === role && last.text === line && last.nodeId === nodeId) return;
    this.log.push({ role, text: line, nodeId });
  }

  /** Re-open Talk on the current node without resetting history/flags/log. */
  resume() {
    if (this.currentId == null) return this.start(this.startId);
    if (!this.nodeAllowed(this.currentId)) return null;
    this.active = true;
    return this._view(this.current);
  }

  /** Begin at a node (default: script startId). */
  start(nodeId = this.startId) {
    const node = this.script[nodeId];
    if (node == null) {
      console.warn("Dialogue.start: unknown node", nodeId);
      return null;
    }
    if (!flagsMatch(node.requireFlags, this.flags)) {
      console.warn("Dialogue.start: requireFlags not met", nodeId, node.requireFlags);
      return null;
    }
    this.currentId = nodeId;
    this.active = true;
    if (typeof node.narration === "string" && node.narration.trim()) {
      this._appendLog("narration", node.narration.trim(), nodeId);
    }
    const spoken = this.resolveLine(node);
    if (spoken) this._appendLog("claudia", spoken, nodeId);
    const view = this._view(node);
    if (this.onEnter) this.onEnter(view);
    return view;
  }

  _view(node) {
    const choices = this.visibleChoices(node);
    return {
      id: node.id,
      mood: node.mood,
      narration: typeof node.narration === "string" ? node.narration.trim() : "",
      line: this.resolveLine(node),
      choices,
      ended: choices.length === 0,
      flags: { ...this.flags },
      history: this.history.slice(),
      log: this.log.slice(),
    };
  }

  /**
   * Advance by choice index 0..2 (original slot index on the node).
   * Returns the next view, or null if dialogue ended.
   */
  choose(index) {
    const node = this.current;
    if (node == null || !this.active) return null;
    const choice = node.choices[index];
    if (choice == null) {
      console.warn("Dialogue.choose: bad index", index);
      return null;
    }
    if (!flagsMatch(choice.requireFlags, this.flags)) {
      console.warn("Dialogue.choose: choice requireFlags not met", index);
      return null;
    }
    if (choice.setFlags) {
      for (const [k, v] of Object.entries(choice.setFlags)) {
        this.flags[k] = v;
      }
    }
    this.history.push({
      nodeId: node.id,
      choiceIndex: index,
      label: choice.label,
      next: choice.next,
    });
    this._appendLog("you", choice.label, node.id);
    if (choice.next == null) {
      // End of branch: stay in Talk; UI shows a Drive button. Do not auto-return.
      this.currentId = null;
      this.active = true;
      const ended = {
        id: null,
        mood: node.mood,
        line: this.resolveLine(node),
        choices: [],
        ended: true,
        flags: { ...this.flags },
        history: this.history.slice(),
        log: this.log.slice(),
      };
      if (this.onEnter) this.onEnter(ended);
      return ended;
    }
    if (!this.nodeAllowed(choice.next)) {
      console.warn("Dialogue.choose: next node blocked by flags", choice.next);
      this.currentId = null;
      this.active = true;
      const ended = {
        id: null,
        mood: null,
        line: "",
        choices: [],
        ended: true,
        flags: { ...this.flags },
        history: this.history.slice(),
        log: this.log.slice(),
      };
      if (this.onEnter) this.onEnter(ended);
      return ended;
    }
    return this.start(choice.next);
  }

  /** Leave dialogue UI; history + flags stay in memory for this page session. */
  exitToRoad() {
    this.active = false;
    this.currentId = null;
    if (this.onExit) this.onExit();
  }

  /** Close the panel without clearing history/flags (Talk can resume later). */
  suspend() {
    this.active = false;
    if (this.onExit) this.onExit();
  }

  hasFlag(name) {
    return Object.prototype.hasOwnProperty.call(this.flags, name);
  }

  static isTodoNode(node) {
    const line = typeof node?.line === "string" ? node.line : node?.line?.[0]?.text;
    return typeof line === "string" && line.startsWith("TODO script from Claudia");
  }
}
