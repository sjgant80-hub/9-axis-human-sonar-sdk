// Scoring engine -- 9-dim sonar mapping.
// Extracted verbatim from 9-axis-human-sonar/index.html.

import { AXES, AXIS_BY_KEY, PROBES } from './axes.js';

export function countMatches(text, list) {
  const t = ' ' + String(text).toLowerCase() + ' ';
  let n = 0;
  for (const k of list) {
    const re = new RegExp('\\b' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    const m = t.match(re);
    if (m) n += m.length;
  }
  return n;
}

export function scoreTurn(text) {
  const wc = String(text).trim().split(/\s+/).length;
  const perAxis = {};
  for (const a of AXES) {
    const kwHits = countMatches(text, a.kw);
    const hedgeHits = countMatches(text, a.hedge);
    const landedHits = countMatches(text, a.landed);
    const presence = kwHits + landedHits * 2 > 0 ? 1 : 0;
    let fidelity = 0;
    if (presence) {
      const raw = (landedHits * 2 + kwHits) / Math.max(1, hedgeHits * 2 + kwHits + landedHits * 2);
      fidelity = Math.min(1, raw);
      if (wc < 6) fidelity *= 0.55;
    }
    perAxis[a.key] = { presence, fidelity, hits: kwHits + landedHits, hedges: hedgeHits, wc };
  }
  let dom = null, best = -1;
  for (const a of AXES) {
    const s = perAxis[a.key].presence * (0.4 + perAxis[a.key].fidelity);
    if (s > best) { best = s; dom = a.key; }
  }
  return { perAxis, dominant: dom, wordCount: wc };
}

export function readAxis(v) {
  if (v.presence === 0) return 'defended terrain -- no touch';
  if (v.presence < 0.2 && v.fidelity < 0.4) return 'thin ground -- evaded or hedged';
  if (v.presence >= 0.4 && v.fidelity >= 0.6 && v.coherence >= 0.5) return 'landed -- speaks from it';
  if (v.presence >= 0.3 && v.fidelity < 0.4) return "present but can't see it yet";
  if (v.fidelity >= 0.6 && v.coherence < 0.4) return 'landed but inconsistent';
  return 'partial ground -- some purchase';
}

export function axisClass(v) {
  if (v.presence === 0) return 'defended';
  if (v.composite < 0.35) return 'defended';
  if (v.composite < 0.6) return 'thin';
  return 'strong';
}

export function analyseSession(turns, focus) {
  const focusTurns = turns.filter(t => t.speaker === focus);
  const perTurn = focusTurns.map(t => ({ ...scoreTurn(t.text), text: t.text, speaker: t.speaker }));

  const axisAgg = {};
  for (const a of AXES) {
    const presents = perTurn.filter(pt => pt.perAxis[a.key].presence);
    const presence = perTurn.length ? presents.length / perTurn.length : 0;
    const fidelity = presents.length ? presents.reduce((s, pt) => s + pt.perAxis[a.key].fidelity, 0) / presents.length : 0;
    axisAgg[a.key] = { presence, fidelity, count: presents.length };
  }

  for (const a of AXES) {
    const presents = perTurn.filter(pt => pt.perAxis[a.key].presence).map(pt => pt.perAxis[a.key].fidelity);
    if (presents.length < 2) {
      axisAgg[a.key].coherence = presents.length ? presents[0] : 0;
    } else {
      const mean = presents.reduce((s, v) => s + v, 0) / presents.length;
      const variance = presents.reduce((s, v) => s + (v - mean) ** 2, 0) / presents.length;
      axisAgg[a.key].coherence = Math.max(0, 1 - Math.sqrt(variance));
    }
  }

  for (const a of AXES) {
    const v = axisAgg[a.key];
    v.composite = v.presence * 0.4 + v.fidelity * 0.4 + v.coherence * 0.2;
    v.verdict = readAxis(v);
  }

  const window = Math.max(2, Math.floor(perTurn.length / 6));
  const trajectory = perTurn.map((pt, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = perTurn.slice(start, i + 1);
    const sum = slice.reduce((s, x) => {
      let axisSum = 0, axisCount = 0;
      for (const a of AXES) {
        if (x.perAxis[a.key].presence) {
          axisSum += x.perAxis[a.key].fidelity;
          axisCount++;
        }
      }
      return s + (axisCount ? axisSum / axisCount : 0);
    }, 0);
    return { i, coherence: slice.length ? sum / slice.length : 0, dominant: pt.dominant };
  });

  let arc = 'flat';
  if (trajectory.length >= 3) {
    const first = trajectory.slice(0, Math.ceil(trajectory.length / 3)).reduce((s, x) => s + x.coherence, 0) / Math.ceil(trajectory.length / 3);
    const last = trajectory.slice(-Math.ceil(trajectory.length / 3)).reduce((s, x) => s + x.coherence, 0) / Math.ceil(trajectory.length / 3);
    const delta = last - first;
    if (delta > 0.08) arc = 'climbing';
    else if (delta < -0.08) arc = 'falling';
  }

  const meanCoh = trajectory.length ? trajectory.reduce((s, x) => s + x.coherence, 0) / trajectory.length : 0;
  const touched = AXES.filter(a => axisAgg[a.key].count > 0).length;

  const sorted = AXES.slice().sort((a, b) => axisAgg[a.key].composite - axisAgg[b.key].composite);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

  const suggestions = sorted.slice(0, 3).map(a => {
    const pool = PROBES[a.key];
    return { axis: a.key, sym: a.sym, name: a.name, probe: pool[Math.floor(Math.random() * pool.length)] };
  });

  const thin = AXES.filter(a => axisClass(axisAgg[a.key]) === 'thin').map(a => a.key);
  const defended = AXES.filter(a => axisClass(axisAgg[a.key]) === 'defended').map(a => a.key);

  return {
    perTurn, axisAgg, trajectory, arc, meanCoh, touched,
    weakest: weakest.key, strongest: strongest.key,
    suggestions, thin, defended,
    turnsAnalysed: perTurn.length
  };
}

export function growthHypothesis(result) {
  const w = AXIS_BY_KEY[result.weakest];
  const s = AXIS_BY_KEY[result.strongest];
  const arcs = {
    climbing: `Coherence rose across the conversation. They're landing more as they went. Keep going in the same texture.`,
    flat: `Coherence was flat -- you weren't moving them. Strongest ground: ${s.sym} ${s.name}. Growth edge: ${w.sym} ${w.name}. Try a sideways probe.`,
    falling: `Coherence dropped -- you pushed a defended axis too hard. Return to ${s.sym} ${s.name} to re-anchor.`,
  };
  return {
    text: arcs[result.arc],
    strongest: { sym: s.sym, name: s.name },
    weakest: { sym: w.sym, name: w.name },
    arc: result.arc,
  };
}

export function nextProbe(currentMap) {
  const sorted = AXES.slice().sort((a, b) => (currentMap[a.key]?.composite || 0) - (currentMap[b.key]?.composite || 0));
  const target = sorted[0];
  const pool = PROBES[target.key];
  return {
    axis: target.key,
    sym: target.sym,
    name: target.name,
    probe: pool[Math.floor(Math.random() * pool.length)],
  };
}
