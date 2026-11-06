# Chapter 1 story integration

## Scope

Replaces the TODO script with all **43** nodes of `chapter-01-are-you-lost-DRAFT` and a **10-node** optional `Believe Me Later` topic (53 nodes total). The optional hook is `c2_curious`, choice C: **“Tell me about Believe Me Later.”** No song must play: the topic is conversational and independent of `MusicPlayer`.

The automatic drive, A/B/C presentation, `Dialogue`, and `DialoguePanel` are unchanged. One existing UI race was found by the local walkthrough and fixed: reopening Talk during the return-camera transition now reverses that transition instead of leaving the panel concealed indefinitely. Five meaningful flags select optional-topic line variants; choices/history/flags stay runtime-only. An ended branch shows the existing Drive button. Reopening Talk during one page session resumes the same node; a fresh page load has no flags/history.

## Required creative edits

- Exact opener and B reply retained; optional “Believe you about what?” / “You want to do the later part now?” exchange retained.
- All catalogue/credits exposition, nine-film labels, open-character explanation, impersonation, easter eggs, grading, quizzes, homework, and other meta-instruction text removed.
- Approved playful exchanges included verbatim:
  - “Is this escape velocity?” / “You’ve passed the same warehouse three times. Not yet.”
  - “Does anabology know you’re here?” / “You can tell him. I’m not turning around.”
  - “Believe you about what?” / “You want to do the later part now?”
- One French word only: **“Encore?”** at `lap_pace`, followed by the same English continuation as the draft. It requires no French knowledge.
- “Bridge in thirty seconds” removed. “Ramp on the right in a few seconds” removed. There are no timed narrative events.
- Ramp/exit choices were rewritten as conversation, not steering, route choice, or a change to the simulation. South-spur sightings became descriptions of Claudia’s recollection; “I’m taking it,” “Take me there,” “I’m ready,” “We’ll check,” and similar physical commands became requests to talk about the road/leaving.
- `coy_what` still ends on the draft’s “Nobody’s asked me to sing”; BML remains a title/concept discussion and has no audio-sync code.

## Neutral connectors and de-meta edits

No new plot or lore. These are the minimal joins/adaptations needed around retained draft or approved lines:

- `c2_curious`: “Tell me about Believe Me Later.” (optional-topic hook)
- `bml_heard`: “I’ve heard it too.” (join to retained “What did the title feel like to you?”; removes quiz reference)
- `bml_new`: “Short version, or skip?” (removes “No homework”)
- `bml_title_talk`: “Then the name did its job.”; “Short version: a song with me in it, called Believe Me Later. The rest is yours.” (meta/audio-playback clauses removed)
- `bml_reflect`: “Patience. I’ll take that reading.”; “Staying’s a clean read. Still yours.” (grading/official-footnote clauses removed)
- `bml_whose`: “Still me in the frame when they ask.” (retained draft fragment replacing credits exposition)
- `bml_ana` and `bml_velocity`: existing honest road exits, including “Okay. Back to the road.” from the draft.
- Main-tree neutral transitions use forms of “Tell me about…”, “I’m listening,” “Keep talking,” “Understood,” “Got it,” “Noted,” “Lead back how?”, and “What would leaving look like?” where a physical command was removed.

## Larger main-tree rephrasing groups

For editorial review, the modified substantive lines are concentrated at:

- `b2_ok`, `c2_curious`, `out_want`: discussion of leaving instead of spur picking/hunting.
- `out1`, `soft1`, `both1`, `ramp_prep`, `ramp1`, `not1_awake`, `out_if2`: descriptions of misleading ramps, without imminent arrival or driving instructions.
- `after_not`, `bridge_prep`, `bridge1_clearq`, `bridge2`, `bridge2_plain`, `bridge2_exit`, `fenced1`, `open1`, `choose1`, `settle_out`: recollection/hypothetical discussion of fencing and leaving, not live signage or a steerable exit.

Other retained Claudia lines and labels may differ only in the neutral connectors listed above. The breakfast exchange, ordinary companionship, fake-exit backstory, uncanny bridge feeling, coy replies, and “Not this one.” remain.

## Validation

Run from the worktree with Node.js:

```sh
node scripts/validate-dialogue.mjs
```

This does a flag-aware state traversal and executes all routes through the actual `Dialogue` engine. It checks node IDs, reachability, three usable choices, target existence, flags set before read, usable variants, termination, forbidden text/storage/timers, resume behavior, and fresh-engine reset. Output is saved at `artifacts/story-ch1/validation.txt`.

Browser walkthrough (requires the box’s installed Playwright-core/Chrome; used for the supplied evidence):

```sh
python3 -m http.server 8876
node scripts/test-story-browser.cjs
```

Requires Playwright-core, using the box’s installed path by default (override `PLAYWRIGHT_CORE_PATH` if needed).

Clicks real Talk A/B/C buttons in headless Chrome over four story paths; verifies the exact opener/B reply/optional exchanges, close/reopen resume, fresh-load reset, runtime-only state, zero audio playback calls, autopilot while talking, and desktop/portrait layout. Results are saved at `artifacts/story-ch1/browser-results.json`; screenshots are alongside it.

## Publication status

This branch is **integration and local validation only**. Nothing has been merged to main or deployed. Story publication still needs Mike’s own approval.

## Evidence captured

- `scripts/validate-dialogue.mjs`: all 53/53 reachable; 231 visited edges; exactly three visible choices; five flags set before read; 23 terminal nodes; 3,866,247 real-engine complete walks (including each of A/B/C end exits), 6–17 choices. No cyclic graph is needed because all routes reach an end.
- Headless Chrome 156.0.8078.47: four button-driven paths, 46 rendered views, opener/B-reply/optional-topic assertions, close-and-reopen transition, reload reset, all 3-choice buttons, end-Drive behavior, no console errors.
- Music stayed user-unstarted throughout; `Audio.play()` was never called, no MP3 was requested, and audio request interception was armed for the entire run. Story success therefore did not depend on audio, though it did not force a denied-playback case because no playback was attempted.
- Ten inspected screenshots: seven desktop and three portrait; all dialogue is readable at 390×844 and the sky-fix scene remains visually intact.
- The only browser-storage reads observed are the pre-existing Drivey theme reads; the story engine makes none. Closing/reopening retains state; reload clears it.
- Integration findings: a stale sibling test server initially served the old TODO on port 8765, so testing moved to isolated port 8876. That other server was not modified. Test-harness observer/transition assumptions were fixed; the one genuine app issue was the Talk-reopen transition race now fixed in `Drivey.js`.
