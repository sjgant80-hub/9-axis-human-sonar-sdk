# 9-axis-human-sonar-sdk

Sovereign SDK for **9-axis conversation intelligence**. All algorithms extracted verbatim from the [9-Axis Human Sonar](https://sjgant80-hub.github.io/9-axis-human-sonar/) tool.

Maps any speaker across nine dimensions -- seven primes plus substrate (`◊`) and theta (`θ`) -- from a transcript. Zero network. Runs identically in Node and the browser.

```
◊ substrate  β bloom     ƒ function
κ kappa      Ω omega     ψ psi
№ numero     ₹ rupee     θ theta
```

## Install

```bash
npm install @ai-native-solutions/9-axis-human-sonar-sdk
```

## Quick start

```js
import { mapTranscript, exportMarkdown, nextProbe } from '@ai-native-solutions/9-axis-human-sonar-sdk';

const session = mapTranscript(`
COACH: What's underneath the anger?
CLIENT: I don't know. It just shows up. I feel it in my chest.
COACH: What are you doing about it?
CLIENT: I started walking at lunch. It helps, I think.
`);

console.log(session.result.strongest);   // e.g. 'psi'
console.log(session.result.weakest);     // e.g. 'rupee'
console.log(session.result.arc);         // 'climbing' | 'flat' | 'falling'
console.log(nextProbe(session.result.axisAgg)); // { axis, sym, name, probe }
console.log(exportMarkdown(session));    // full markdown report
```

## API

### `mapTranscript(raw, opts?)` -> `Session`

Parse transcript, auto-detect focus speaker, run full sonar. `opts.focus` overrides auto-detection; `opts.title` names the session.

### `parseTranscript(raw)` -> `Turn[]`

Speaker-prefixed lines, VTT/SRT-stripped, sentence-fallback.

### `analyseSession(turns, focus)` -> `SonarResult`

Per-axis presence, fidelity, coherence, composite; coherence trajectory; arc; strongest/weakest; three probe suggestions targeting the thinnest axes.

### `nextProbe(currentMap)` -> `Probe`

Picks a probe for the lowest-composite axis in the map.

### `growthHypothesis(result)` -> `{ text, strongest, weakest, arc }`

Practitioner-facing readout: where they landed, where the edge is, what the arc suggests.

### `exportJson(session)` / `exportMarkdown(session)` -> `string`

Sovereign export -- schema-tagged JSON or a printable markdown report.

### `startCapture(onUpdate, opts?)` (browser only)

Web Speech API wrapper. Returns `{ stop(), text() }`.

## The nine axes

Each axis carries a question, keyword set, hedge set, and landed set. Fidelity rises with **landed** phrases (`i built`, `i feel`, `it cost me`), falls with **hedges** (`sort of`, `maybe`, `fine`). Coherence tracks consistency of fidelity across turns. Composite = `0.4*presence + 0.4*fidelity + 0.2*coherence`.

| Sym | Key | Question |
|---|---|---|
| ◊ | substrate | What is this at its core? |
| β | bloom | Where are you right now with it? |
| ƒ | function | What are you doing about it? |
| κ | kappa | Is that working? |
| Ω | omega | What's the next call? |
| ψ | psi | How do you feel about it? |
| № | numero | How much has this cost you? |
| ₹ | rupee | What's it worth to fix? |
| θ | theta | From where you sit, what's the shape? |

## Companion repos

- **Tool:** [9-axis-human-sonar](https://github.com/sjgant80-hub/9-axis-human-sonar) -- the shipping HTML app
- **MCP:** [9-axis-human-sonar-mcp](https://github.com/sjgant80-hub/9-axis-human-sonar-mcp) -- Model Context Protocol server
- **API:** [9-axis-human-sonar-api](https://github.com/sjgant80-hub/9-axis-human-sonar-api) -- Node HTTP server + Docker

## License

MIT -- AI-Native Solutions.

**The map is not the territory.** Augment, do not replace clinical judgment. Consent required.
