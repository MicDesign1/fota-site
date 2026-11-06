import assert from "node:assert/strict";
import Dialogue, { script, startId } from "../js/dialogue.js";

const errors = [];
const error = (message) => errors.push(message);
const nodes = Object.values(script);
const matches = (required = {}, flags) => Object.entries(required).every(([key, value]) => flags[key] === value);
const allText = (node) => [node.line, ...(Array.isArray(node.line) ? node.line.map((variant) => variant.text) : []), ...node.choices.map((choice) => choice.label)].flat().join("\n");
const readKeys = new Set();
for (const [key, node] of Object.entries(script)) {
  if (node.id !== key) error(`${key}: id is ${node.id}`);
  if (!node.line || (Array.isArray(node.line) && node.line.length === 0)) error(`${key}: missing line`);
  if (!Array.isArray(node.choices) || node.choices.length !== 3) error(`${key}: ${node.choices?.length ?? 0} choices; expected 3`);
  for (const [index, choice] of (node.choices ?? []).entries()) {
    if (!choice.label?.trim()) error(`${key}: choice ${index} has an empty label`);
    if (choice.next !== null && !script[choice.next]) error(`${key}: choice ${index} targets missing ${choice.next}`);
    for (const flag of Object.keys(choice.requireFlags ?? {})) readKeys.add(flag);
  }
  for (const flag of Object.keys(node.requireFlags ?? {})) readKeys.add(flag);
  for (const variant of Array.isArray(node.line) ? node.line : []) {
    if (!variant.text?.trim()) error(`${key}: empty line variant`);
    for (const flag of Object.keys(variant.requireFlags ?? {})) readKeys.add(flag);
  }
  if (/TODO script from Claudia|thirty seconds|in a few seconds|localStorage|sessionStorage|setTimeout|setInterval|homework|graded|grade it|quiz|easter eggs|open-character|not one of anabology|not doing his voice|hit play/i.test(allText(node))) {
    error(`${key}: contains prohibited stub, event/storage, or removed optional-branch text`);
  }
}
assert(script[startId], `Start node ${startId} does not exist`);
assert.equal(script.start.line, "Are you lost?");
assert.deepEqual(script.start.choices.map(({ label }) => label), ["A little.", "I thought you knew the way.", "Does it matter?"]);
assert.equal(script.b1.line, "I do. I was asking about you.");
assert.equal(script.bml_later.line, "You want to do the later part now?");
assert.equal(script.bml_velocity.line, "You've passed the same warehouse three times. Not yet.");
assert.equal(script.bml_ana.line, "You can tell him. I'm not turning around.");
assert.equal(Object.values(script).map(allText).join("\n").match(/Encore\?/g)?.length, 1, "Only approved sparse French");

// Explore node states, retaining every possible value of every referenced flag.
// This verifies choices and variants against the complete state at their arrival,
// rather than merely finding a setter somewhere in the source map.
const reachedStates = new Map();
let edges = 0;
let terminalNodes = 0;
const pending = [{ id: startId, flags: {} }];
while (pending.length) {
  const { id, flags } = pending.shift();
  const node = script[id];
  if (!node || !matches(node.requireFlags, flags)) continue;
  const stateKey = JSON.stringify(flags);
  if (reachedStates.has(id)) {
    if (reachedStates.get(id).has(stateKey)) continue;
    reachedStates.get(id).add(stateKey);
  } else {
    reachedStates.set(id, new Set([stateKey]));
  }
  if (!Dialogue.prototype.resolveLine.call({ flags }, node)) error(`${id}: no usable line after ${stateKey}`);
  const usable = node.choices.filter((choice) => matches(choice.requireFlags, flags));
  if (usable.length !== 3) error(`${id}: ${usable.length} usable choices after ${stateKey}`);
  for (const [flag, expected] of Object.entries(node.requireFlags ?? {})) {
    if (flags[flag] !== expected) error(`${id}: node flag ${flag} read before being set`);
  }
  if (node.choices.every((choice) => choice.next === null)) terminalNodes++;
  for (const choice of usable) {
    if (choice.next === null) {
      edges++;
      continue;
    }
    if (!script[choice.next]) continue;
    const nextFlags = { ...flags, ...(choice.setFlags ?? {}) };
    const nextNode = script[choice.next];
    if (!matches(nextNode.requireFlags, nextFlags)) error(`${id}: choice ${choice.label} reaches blocked ${choice.next}`);
    pending.push({ id: choice.next, flags: nextFlags });
    edges++;
  }
}
for (const id of Object.keys(script)) {
  if (!reachedStates.has(id)) error(`${id}: unreachable from ${startId}`);
}

// The graph must be acyclic, or have a deliberate loop with exits.
const visiting = new Set();
const visited = new Set();
function visit(id, flags) {
  const key = `${id}:${JSON.stringify(flags)}`;
  if (visiting.has(key)) return true;
  if (visited.has(key)) return false;
  visiting.add(key);
  let hasLoop = false;
  for (const choice of script[id].choices) {
    if (choice.next !== null) hasLoop ||= visit(choice.next, { ...flags, ...(choice.setFlags ?? {}) });
  }
  visiting.delete(key);
  visited.add(key);
  return hasLoop;
}
const hasLoop = visit(startId, {});
if (terminalNodes === 0 && !hasLoop) error("Story has neither an end node nor a loop");

// Execute every route through the real engine, including every A/B/C exit.
let completeWalks = 0;
let minChoices = Infinity;
let maxChoices = 0;
let minRoute = [];
let maxRoute = [];
function walk(path) {
  if (path.length > nodes.length) {
    error(`Unexpected cycle: ${path.map((step) => step.id).join(" -> ")}`);
    return;
  }
  const dialogue = new Dialogue();
  let view = dialogue.start();
  for (const step of path) {
    assert.equal(view.id, step.id);
    assert.equal(view.line, step.line);
    assert.equal(view.choices.length, 3);
    view = dialogue.choose(step.index);
  }
  if (view.ended) {
    completeWalks++;
    const flags = Object.keys(dialogue.flags);
    assert(flags.every((flag) => readKeys.has(flag)), `Unused runtime flag: ${flags}`);
    if (path.length < minChoices) { minChoices = path.length; minRoute = path; }
    if (path.length > maxChoices) { maxChoices = path.length; maxRoute = path; }
    return;
  }
  for (let index = 0; index < 3; index++) {
    const choice = script[view.id].choices[index];
    walk([...path, { id: view.id, index, line: view.line }]);
  }
}
walk([]);

// State survives closing/reopening Talk, but a newly constructed page engine resets.
const resumed = new Dialogue();
resumed.start();
resumed.choose(2);
resumed.choose(0);
resumed.choose(2);
assert.equal(resumed.currentId, "bml_start");
resumed.suspend();
const previousHistory = resumed.history.length;
const previousFlags = { ...resumed.flags };
const resumedView = resumed._view(resumed.current);
assert.equal(resumedView.id, "bml_start");
assert.equal(resumed.currentId, "bml_start");
assert.equal(resumed.history.length, previousHistory);
assert.deepEqual({ ...resumed.flags }, previousFlags);
const fresh = new Dialogue();
assert.equal(fresh.history.length, 0);
if (Object.keys(fresh.flags).length !== 0) error("Fresh engine has flags");
assert.equal(fresh.start().line, "Are you lost?");

if (errors.length) {
  console.error(errors.map((message) => `FAIL ${message}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`PASS start=${startId}; nodes=${nodes.length}/${reachedStates.size} reachable; edges=${edges}; all choice nodes expose 3 usable choices; all targets exist`);
  const stateCombinations = [...reachedStates.values()].reduce((sum, states) => sum + states.size, 0);
  console.log(`PASS ${readKeys.size} referenced flags are set before read on every visited state (${stateCombinations} flag-state combinations across ${reachedStates.size} nodes)`);
  console.log(`PASS termination: ${terminalNodes} end nodes; every route ends with three honest Drive choices; loop present=${hasLoop}`);
  console.log(`PASS real-engine exhaustive walks=${completeWalks.toLocaleString("en-US")}; length=${minChoices}..${maxChoices} choices; no unexpected cycles; no blank lines`);
  assert.equal(resumedView.history.length, resumed.history.length);
  console.log(`PASS runtime state: Close/reopen resumes; fresh engine has no flags/history; script contains no browser storage or timers`);
  console.log(`Shortest route: ${JSON.stringify(minRoute.map(({ id, index }) => ({ id, choice: "ABC"[index] })))}`);
  console.log(`Longest route: ${JSON.stringify(maxRoute.map(({ id, index }) => ({ id, choice: "ABC"[index] })))}`);
}
