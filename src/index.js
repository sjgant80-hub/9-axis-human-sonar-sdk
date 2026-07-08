// @ai-native-solutions/9-axis-human-sonar-sdk
// Sovereign SDK for 9-axis conversation intelligence.
// All algorithms extracted verbatim from 9-axis-human-sonar/index.html.

export { AXES, AXIS_BY_KEY, PROBES } from './axes.js';
export {
  parseTranscript, uniqueSpeakers, focusSpeakerAuto
} from './transcript.js';
export {
  countMatches, scoreTurn, readAxis, axisClass,
  analyseSession, growthHypothesis, nextProbe
} from './sonar.js';
export { isSpeechAvailable, startCapture } from './capture.js';

import { parseTranscript, focusSpeakerAuto } from './transcript.js';
import { analyseSession, growthHypothesis, nextProbe } from './sonar.js';
import { AXES, AXIS_BY_KEY } from './axes.js';

/**
 * One-shot: raw transcript in, full sonar map out.
 * @param {string} raw
 * @param {{ focus?: string, title?: string }} [opts]
 */
export function mapTranscript(raw, opts = {}) {
  const turns = parseTranscript(raw);
  const focus = opts.focus || focusSpeakerAuto(turns);
  const result = analyseSession(turns, focus);
  return {
    title: opts.title || (focus + ' -- ' + new Date().toISOString().slice(0, 10)),
    focus,
    turns,
    result,
    schema: '9-axis-human-sonar-v1',
  };
}

/**
 * Export a session map as JSON string (with schema tag).
 */
export function exportJson(session) {
  return JSON.stringify({
    ...session,
    exported_at: new Date().toISOString(),
    schema: '9-axis-human-sonar-v1',
  }, null, 2);
}

/**
 * Export a session as a markdown report.
 */
export function exportMarkdown(session) {
  const r = session.result;
  const lines = [];
  lines.push('# 9-Axis Human Sonar -- ' + session.title);
  lines.push('');
  lines.push('- Focus speaker: **' + session.focus + '**');
  lines.push('- Turns analysed: **' + r.turnsAnalysed + '**');
  lines.push('- Axes touched: **' + r.touched + ' / 9**');
  lines.push('- Mean coherence: **' + (r.meanCoh * 100).toFixed(0) + '%**');
  lines.push('- Trajectory: **' + r.arc + '**');
  lines.push('');
  lines.push('## Per-axis reading');
  lines.push('');
  lines.push('| Axis | Presence | Fidelity | Coherence | Reading |');
  lines.push('|---|---|---|---|---|');
  for (const a of AXES) {
    const v = r.axisAgg[a.key];
    lines.push(`| ${a.sym} ${a.name} | ${(v.presence * 100).toFixed(0)}% | ${(v.fidelity * 100).toFixed(0)}% | ${(v.coherence * 100).toFixed(0)}% | ${v.verdict} |`);
  }
  lines.push('');
  lines.push('## Growth direction');
  lines.push('');
  const gh = growthHypothesis(r);
  lines.push('- **Strongest ground:** ' + gh.strongest.sym + ' ' + gh.strongest.name);
  lines.push('- **Growth edge:** ' + gh.weakest.sym + ' ' + gh.weakest.name);
  lines.push('- **Arc:** ' + gh.arc);
  lines.push('');
  lines.push('## Suggested next probes');
  lines.push('');
  for (const s of r.suggestions) {
    lines.push(`- **${s.sym} ${s.name}** -- "${s.probe}"`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('*The map is not the territory. Augment, do not replace clinical judgment. Consent required. AI-Native Solutions.*');
  return lines.join('\n');
}

export { nextProbe as suggestProbe };
export const VERSION = '1.0.0';
