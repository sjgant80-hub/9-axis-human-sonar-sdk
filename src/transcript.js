// Transcript parsing + speaker segmentation.
// Extracted from 9-axis-human-sonar/index.html.

export function parseTranscript(raw) {
  const lines = String(raw || '').split(/\r?\n/).map(l => l.trim()).filter(l => l.length);
  const turns = [];
  let currentSpeaker = null, currentText = [];
  const speakerRe = /^([A-Z][A-Z0-9\-_\s]{0,24}?)\s*[:>\-]\s*(.+)$/;
  const vttRe = /^\d\d:\d\d[:\.]/;
  for (const line of lines) {
    if (vttRe.test(line)) continue;
    if (/^WEBVTT/i.test(line) || /^\d+$/.test(line)) continue;
    const m = line.match(speakerRe);
    if (m) {
      if (currentSpeaker && currentText.length) {
        turns.push({ speaker: currentSpeaker, text: currentText.join(' ').trim() });
      }
      currentSpeaker = m[1].trim();
      currentText = [m[2]];
    } else if (currentSpeaker) {
      currentText.push(line);
    } else {
      currentSpeaker = 'SPEAKER';
      currentText = [line];
    }
  }
  if (currentSpeaker && currentText.length) {
    turns.push({ speaker: currentSpeaker, text: currentText.join(' ').trim() });
  }
  if (!turns.length && String(raw).trim()) {
    const sents = String(raw).split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 3);
    return sents.map(s => ({ speaker: 'SPEAKER', text: s.trim() }));
  }
  return turns;
}

export function uniqueSpeakers(turns) {
  const set = new Set();
  turns.forEach(t => set.add(t.speaker));
  return Array.from(set);
}

export function focusSpeakerAuto(turns) {
  const wc = {};
  for (const t of turns) {
    wc[t.speaker] = (wc[t.speaker] || 0) + t.text.split(/\s+/).length;
  }
  let best = null, bs = -1;
  for (const [s, n] of Object.entries(wc)) {
    if (n > bs) { bs = n; best = s; }
  }
  return best;
}
