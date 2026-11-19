// Small helpers shared by every other file.
const $ = (s, r = document) => r.querySelector(s);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
let _ac;
function beep(freq = 440, dur = 0.1) {
  // Original tones from the Web Audio API, no audio files needed.
  if (typeof Store !== 'undefined' && !Store.state.settings.sound) return;
  try {
    _ac = _ac || new AudioContext();
    const o = _ac.createOscillator(), g = _ac.createGain();
    o.frequency.value = freq; o.type = 'square'; g.gain.value = 0.04;
    o.connect(g); g.connect(_ac.destination); o.start(); o.stop(_ac.currentTime + dur);
  } catch (e) { /* audio blocked, ignore */ }
}
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2400); }
// Original placeholder artwork tinted by collection, no official art.
function art(p, s = 72) {
  const c = CATS[p.cat].color, face = p.cat === 'cinna' ? '☁' : p.cat === 'gta' ? '🌴' : p.cat === 'poke' ? '◓' : '☺';
  return `<svg width="${s}" height="${s}" viewBox="0 0 72 72"><rect x="8" y="8" width="56" height="56" rx="18" fill="${c}"/><rect x="8" y="8" width="56" height="26" rx="18" fill="#fff" opacity=".2"/><text x="36" y="46" font-size="26" text-anchor="middle" fill="#10101C">${face}</text></svg>`;
}
