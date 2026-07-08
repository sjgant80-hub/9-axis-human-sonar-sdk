// Live capture -- Web Speech API wrapper (browser only).
// Extracted from 9-axis-human-sonar/index.html live-mic block.

export function isSpeechAvailable() {
  if (typeof window === 'undefined') return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Start live speech capture. Returns a handle with stop() and a text buffer.
 * @param {(text: string, isFinal: boolean) => void} onUpdate
 * @param {{ lang?: string }} [opts]
 */
export function startCapture(onUpdate, opts = {}) {
  if (!isSpeechAvailable()) {
    throw new Error('Web Speech API not available. Use paste mode.');
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SR();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = opts.lang || (typeof navigator !== 'undefined' ? navigator.language : 'en-GB');
  let finalText = '';
  let active = true;
  rec.onresult = (ev) => {
    let interim = '';
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const r = ev.results[i];
      if (r.isFinal) {
        finalText += (finalText && !finalText.endsWith('\n') ? ' ' : '') + r[0].transcript;
        onUpdate && onUpdate(finalText, true);
      } else {
        interim += r[0].transcript;
      }
    }
    if (interim) onUpdate && onUpdate(finalText + ' [' + interim + ']', false);
  };
  rec.onerror = (e) => { console.warn('speech error', e); };
  rec.onend = () => { if (active) { try { rec.start(); } catch (e) {} } };
  rec.start();
  return {
    stop() { active = false; try { rec.stop(); } catch (e) {} },
    text() { return finalText; },
  };
}
