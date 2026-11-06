/*
  Placeholder dialogue script for Claudia Night Drive.
  Creative (Claudia bot) replaces this file — do not invent plot here.
  Only a TODO stub until then. Chained so Talk A/B/C can be tested.
*/

/** @type {Record<string, import("./dialogue.js").DialogueNode>} */
export const script = {
  todo_1: {
    id: "todo_1",
    line: "TODO script from Claudia",
    mood: "idle",
    choices: [
      { label: "TODO choice A", next: "todo_2" },
      { label: "TODO choice B", next: "todo_2" },
      { label: "TODO choice C", next: "todo_2" },
    ],
  },
  todo_2: {
    id: "todo_2",
    line: "TODO script from Claudia (2)",
    mood: "idle",
    choices: [
      { label: "TODO choice A", next: "todo_end" },
      { label: "TODO choice B", next: "todo_end" },
      { label: "TODO choice C", next: "todo_end" },
    ],
  },
  todo_end: {
    id: "todo_end",
    line: "TODO script from Claudia (end)",
    mood: "idle",
    choices: [],
  },
};

/** Entry node id for Talk to Claudia. */
export const startId = "todo_1";
