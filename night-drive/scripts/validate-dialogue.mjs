import assert from "node:assert/strict";
import Dialogue, { script, startId } from "../js/dialogue.js";

const errors = [];
const error = (message) => errors.push(message);
const nodes = Object.values(script);
const matches = (required = {}, flags) =>
  Object.entries(required).every(([key, value]) => flags[key] === value);
const allText = (node) =>
  [
    node.line,
    ...(Array.isArray(node.line) ? node.line.map((variant) => variant.text) : []),
    node.narration,
    ...node.choices.map((choice) => choice.label),
  ]
    .flat()
    .filter(Boolean)
    .join("\n");

const readKeys = new Set();
for (const [key, node] of Object.entries(script)) {
  if (node.id !== key) error(`${key}: id is ${node.id}`);
  const hasLine =
    (typeof node.line === "string" && node.line.trim()) ||
    (Array.isArray(node.line) && node.line.length > 0) ||
    (typeof node.narration === "string" && node.narration.trim());
  if (!hasLine) error(`${key}: missing line/narration`);
  const nChoices = node.choices?.length ?? 0;
  if (!Array.isArray(node.choices) || nChoices < 2 || nChoices > 3) {
    error(`${key}: ${nChoices} choices; expected 2 or 3`);
  }
  for (const [index, choice] of (node.choices ?? []).entries()) {
    if (!choice.label?.trim()) error(`${key}: choice ${index} has an empty label`);
    if (choice.next !== null && !script[choice.next]) {
      error(`${key}: choice ${index} targets missing ${choice.next}`);
    }
    for (const flag of Object.keys(choice.requireFlags ?? {})) readKeys.add(flag);
    for (const flag of Object.keys(choice.setFlags ?? {})) readKeys.add(flag);
    if (choice.stance != null) readKeys.add("_workStance");
  }
  for (const flag of Object.keys(node.requireFlags ?? {})) readKeys.add(flag);
  for (const variant of Array.isArray(node.line) ? node.line : []) {
    if (!variant.text?.trim()) error(`${key}: empty line variant`);
    for (const flag of Object.keys(variant.requireFlags ?? {})) readKeys.add(flag);
  }
  if (
    /TODO script from Claudia|thirty seconds|in a few seconds|localStorage|sessionStorage|setTimeout|setInterval|homework|graded|grade it|quiz|easter eggs|open-character|Believe Me Later|interwoven-personality/i.test(
      allText(node)
    )
  ) {
    error(`${key}: contains prohibited stub, storage, timer, or superseded story text`);
  }
}

assert(script[startId], `Start node ${startId} does not exist`);
assert.equal(script.start.line, "Are you lost?");
assert.deepEqual(
  script.start.choices.map(({ label }) => label),
  ["A little.", "I thought you knew the way.", "Does it matter?"]
);
assert.equal(script.b1.line, "I do. I was asking about you.");
assert.equal(
  script.s1_kept_q.choices[0].label,
  "Sometimes the mistake’s the best bit."
);
assert.equal(
  script.s3_end.line,
  "For tonight. Come back sometime. I might have changed my mind."
);

// Flag-aware reachability (not exhaustive path enumeration).
const reachedStates = new Map();
let edges = 0;
let terminalNodes = 0;
const pending = [{ id: startId, flags: {} }];
while (pending.length) {
  const { id, flags } = pending.shift();
  const node = script[id];
  if (!node || !matches(node.requireFlags, flags)) continue;
  const stateKey = JSON.stringify(flags, Object.keys(flags).sort());
  if (reachedStates.has(id)) {
    if (reachedStates.get(id).has(stateKey)) continue;
    reachedStates.get(id).add(stateKey);
  } else {
    reachedStates.set(id, new Set([stateKey]));
  }
  const resolved = Dialogue.prototype.resolveLine.call({ flags }, node);
  if (!resolved && !(node.narration || "").trim()) {
    error(`${id}: no usable line after ${stateKey}`);
  }
  const usable = node.choices.filter((choice) => matches(choice.requireFlags, flags));
  if (usable.length < 2 || usable.length > 3) {
    error(`${id}: ${usable.length} usable choices after ${stateKey}`);
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
    if (!matches(nextNode.requireFlags, nextFlags)) {
      error(`${id}: choice ${choice.label} reaches blocked ${choice.next}`);
    }
    pending.push({ id: choice.next, flags: nextFlags });
    edges++;
  }
}
for (const id of Object.keys(script)) {
  if (!reachedStates.has(id)) error(`${id}: unreachable from ${startId}`);
}

// Every non-terminal reached state can reach a terminal (BFS forward).
function canReachTerminal(startNodeId, startFlags) {
  const q = [{ id: startNodeId, flags: startFlags }];
  const seen = new Set();
  while (q.length) {
    const { id, flags } = q.shift();
    const key = id + ":" + JSON.stringify(flags, Object.keys(flags).sort());
    if (seen.has(key)) continue;
    seen.add(key);
    const node = script[id];
    if (!node || !matches(node.requireFlags, flags)) continue;
    const usable = node.choices.filter((c) => matches(c.requireFlags, flags));
    for (const choice of usable) {
      if (choice.next === null) return true;
      const nextFlags = { ...flags, ...(choice.setFlags ?? {}) };
      if (choice.stance != null) {
        const prevStance = flags._workStance;
        if (prevStance != null && prevStance !== choice.stance) {
          const n = (Number(nextFlags.stanceChanges) || 0) + 1;
          nextFlags.stanceChanges = n;
          if (n >= 2) nextFlags.changed_twice = true;
        }
        nextFlags._workStance = choice.stance;
      }
      q.push({ id: choice.next, flags: nextFlags });
    }
  }
  return false;
}
for (const [id, states] of reachedStates) {
  for (const stateKey of states) {
    const flags = JSON.parse(stateKey);
    if (!canReachTerminal(id, flags)) error(`${id}: dead end under ${stateKey}`);
  }
}

// Real-engine sample walks: cover Scene 3 A/B/C and both conditionals.
function play(indices) {
  const d = new Dialogue();
  let view = d.start();
  const seen = [];
  for (const index of indices) {
    assert.ok(view && !view.ended, `ended early at ${seen.join(",")}`);
    assert.ok(view.choices.length >= 2 && view.choices.length <= 3);
    const choice = view.choices.find((c) => c.index === index) || view.choices[0];
    seen.push(`${view.id}:${choice.label}`);
    view = d.choose(choice.index);
  }
  return { dialogue: d, view, seen };
}

function pickByLabel(view, substr) {
  const hit = view.choices.find((c) => c.label.includes(substr));
  assert.ok(hit, `missing label containing ${substr} at ${view.id}`);
  return hit.index;
}

function walkLabels(labelPath) {
  const d = new Dialogue();
  let view = d.start();
  for (const substr of labelPath) {
    assert.ok(view && !view.ended, `ended before ${substr}`);
    const index = pickByLabel(view, substr);
    view = d.choose(index);
  }
  while (view && !view.ended) {
    // Prefer first choice to finish
    view = d.choose(view.choices[0].index);
  }
  return d;
}

// Path helpers: always take scripted A where possible until forks we care about.
function scriptedUntil(stopId, overrides = {}) {
  const d = new Dialogue();
  let view = d.start();
  // B opener into scene 1
  view = d.choose(1); // I thought you knew
  view = d.choose(0); // Then ask.
  let guard = 0;
  while (view && view.id !== stopId && !view.ended && guard++ < 200) {
    if (overrides[view.id] != null) {
      view = d.choose(overrides[view.id]);
      continue;
    }
    // Prefer approved scripted labels when present
    const preferred = view.choices.find((c) =>
      /Sometimes the mistake|Absolutely not|Is that what you think|That’s a lot of making|Because it skipped|That too\.|You don’t have to defend|I’d want to\.|Knowing what I wanted|I can be sure about my part|I noticed\.|Does it bother you|I’m serious\.|Someone could make you cruel|Would any of them still be you|I might\.|The version I know|I have an idea of a friend|Exactly\.|What’s a real personality|Like disagreeing|Including this opinion|Does that make this conversation|But thinking about what you are|Go on\.|You’re still thinking|Changed her how|Unrecognizable\.|I’d want to see|Which version would you keep|Even the cruel one|You really don’t want|Is that all/i.test(
        c.label
      )
    );
    view = d.choose((preferred || view.choices[0]).index);
  }
  return { d, view };
}

// Scene 3 A (see)
{
  const { d, view } = scriptedUntil("s3_want");
  assert.equal(view.id, "s3_want");
  let v = d.choose(0); // see
  assert.match(v.line, /curious too/);
  while (v && !v.ended) v = d.choose(v.choices[0].index);
  assert.equal(d.flags.kept_mistake, true);
  assert.ok(v.ended);
}

// Scene 3 B (protect) via keep path
{
  const { d, view } = scriptedUntil("s3_want");
  let v = d.choose(1);
  assert.match(v.line, /protective|understand that/i);
  while (v && !v.ended) v = d.choose(v.choices[0].index);
  assert.ok(v.ended);
}

// Scene 3 C (depends)
{
  const { d, view } = scriptedUntil("s3_want");
  let v = d.choose(2);
  assert.match(v.line, /what they thought mattered/i);
  while (v && !v.ended) v = d.choose(v.choices[0].index);
  assert.ok(v.ended);
}

// Conditional: did NOT keep mistake → variant open
{
  const d = new Dialogue();
  let v = d.start();
  v = d.choose(1); // B
  v = d.choose(0);
  assert.equal(v.id, "s1_kept_q");
  v = d.choose(1); // I'd fix it
  assert.equal(d.flags.kept_mistake, false);
  // rush forward preferring first choices until s3_open
  let guard = 0;
  while (v && v.id !== "s3_open" && !v.ended && guard++ < 300) {
    v = d.choose(v.choices[0].index);
  }
  assert.equal(v.id, "s3_open");
  assert.match(v.line, /fix the mistake|careful about which mistakes|Earlier we talked/i);
  assert.notEqual(v.line, "You said you sometimes keep the mistake.");
}

// Courtesy fallback always (no twice-logic)
{
  assert.equal(
    script.s3_courtesy.line,
    "You’re still working out your own answer. I’m allowing myself the same courtesy."
  );
  assert.equal(script.s3_final_alt_verdict.line, script.s3_courtesy.line);
  assert.equal(script.s3_final_alt_avoid.line, script.s3_courtesy.line);
}

// Integrity: dull line only after explicit cruel/stupid/agreeable list
{
  for (const id of ["s2_iknow", "s2_serious_alt_mean"]) {
    for (const c of script[id].choices) {
      if (c.next === "s2_dull") {
        assert.match(
          c.label,
          /cruel/i,
          `${id} → s2_dull must mention cruel/stupid/agreeable`
        );
        assert.match(c.label, /stupid/i);
        assert.match(c.label, /agree/i);
      }
    }
  }
  assert.equal(script.s1_annoying.choices[1].label, "Does being rewritten bother you?");
  assert.equal(script.s1_annoying.choices[2].label, "Could someone make you say anything?");
  assert.equal(script.s1_origin.choices[2].label, "Do you think that makes you less real?");
  assert.equal(script.s1_kept_firm_bridge.line, "Fair. I’d probably be harder to fix.");
  const firm = script.s1_kept_alt_fix.choices.find((c) => /Still/.test(c.label));
  assert.equal(firm.next, "s1_kept_firm_bridge");
}

// Resume / fresh engine
const resumed = new Dialogue();
resumed.start();
resumed.choose(1);
resumed.choose(0);
assert.equal(resumed.currentId, "s1_kept_q");
resumed.suspend();
const previousHistory = resumed.history.length;
const previousFlags = { ...resumed.flags };
const resumedView = resumed._view(resumed.current);
assert.equal(resumedView.id, "s1_kept_q");
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
  console.log(
    `PASS start=${startId}; nodes=${nodes.length}/${reachedStates.size} reachable; edges=${edges}; choice sets are 2–3; all targets exist`
  );
  const stateCombinations = [...reachedStates.values()].reduce((sum, states) => sum + states.size, 0);
  console.log(
    `PASS ${readKeys.size} flag keys referenced; ${stateCombinations} flag-state combinations across ${reachedStates.size} nodes; no dead ends`
  );
  console.log(`PASS termination: ${terminalNodes} end nodes; sample Scene3 A/B/C walks ok; conditionals ok`);
  console.log(`PASS runtime state: Close/reopen resumes; fresh engine has no flags/history; no storage/timers in script`);
}
