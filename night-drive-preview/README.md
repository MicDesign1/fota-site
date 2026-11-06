# Claudia Night Drive

A GPL-3 fork of [Rezmason/drivey](https://github.com/Rezmason/drivey) (Drivey.js) by **MicDesign1**.

Upstream: Mark Pursey’s 2007 Drivey demo, ported to JavaScript by rezmason. This project keeps Drivey’s industrial amber night drive as a fixed scene and adds a passenger companion (Claudia).

## License

GNU General Public License v3.0 — see [`LICENSE`](./LICENSE). Any distribution of this derivative must also be under GPL-3 and include source.

## What’s different (Stage 0)

- Only the **Industrial Zone** level (amber tint, gradient sky preserved)
- Locked **driver** camera and **ombré** effect
- Always driving (autopilot on; cruise never parks)
- Demo panels removed (autopilot / cars / side / controls / quality / music) — locked defaults; arrow keys still steer
- Single small **Claudia** pill: front↔side cross-dissolve (dialogue UI later; silent for now)
- Side view uses temporary transparent eyes-open art (fit-test); final Claudia will be native ShapePath

## Local play

```bash
python3 -m http.server 8765
# open http://localhost:8765/
```

ES modules require HTTP (do not open `index.html` as a file:// URL).


## Dialogue (integration only — no UI yet)

Script nodes live in [`js/dialogue.js`](./js/dialogue.js).

```js
{
  id: "node_id",
  line: "Claudia's line",
  mood: "idle",   // optional — e.g. idle | smile | listen | think (portrait / future blip pitch)
  choices: [
    { label: "Reply A", next: "other_node_id" }, // or null to end
    { label: "Reply B", next: null },
    { label: "Reply C", next: "other_node_id" },
  ],
}
```

Engine API (no AI, no timers):

- `dialogue.start(nodeId)` — enter a node (fires `onEnter`)
- `dialogue.choose(index)` — take choice `0..2`; advances or ends
- `dialogue.exitToRoad()` — leave dialogue (fires `onExit`)

Placeholder nodes whose `line` starts with `TODO script from Claudia` must stay **hidden from UI** until creative replaces them. The Claudia button currently only runs the front↔side dissolve; dialogue UI will attach to the side view later.

### Future: typewriter + Gameboy blips (not implemented)

A later step will add a typewriter text reveal with original synthesized Gameboy-style "bebebob" blips via **WebAudio**, started only after a **user gesture**, with **mute** and **volume**. The build stays **silent by default** until then — do not add music or SFX now.

## Attribution

- Original Drivey © 2007 Mark Pursey
- Drivey.js © rezmason — https://github.com/Rezmason/drivey
- Claudia Night Drive fork © MicDesign1
