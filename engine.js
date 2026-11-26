/* Learning Gate (family edition) — engine (shared by the Android and iPad shells) */
'use strict';

// ---------------- utilities ----------------
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const uniq = a => [...new Set(a)];
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// ---- small SHA-256 (sync) so the grown-up PIN is never stored in plain text ----
const sha256 = (() => { const K = [], H0 = []; let n = 2, c = 0; const frac = x => (x - Math.floor(x)) * 4294967296 | 0;
  while (c < 64) { let p = true; for (let i = 2; i * i <= n; i++) if (n % i === 0) { p = false; break; } if (p) { if (c < 8) H0[c] = frac(Math.pow(n, 1 / 2)); K[c++] = frac(Math.pow(n, 1 / 3)); } n++; }
  return str => { const b = unescape(encodeURIComponent(str)), l = b.length, words = []; for (let i = 0; i < l; i++) words[i >> 2] |= b.charCodeAt(i) << (24 - (i % 4) * 8);
    words[l >> 2] |= 0x80 << (24 - (l % 4) * 8); const nw = ((l + 8 >> 6) + 1) * 16; words[nw - 1] = l * 8; for (let i = 0; i < nw; i++) words[i] |= 0;
    const H = H0.slice(), w = new Array(64), r = (x, k) => (x >>> k) | (x << (32 - k));
    for (let j = 0; j < nw; j += 16) { const a = H.slice();
      for (let i = 0; i < 64; i++) { if (i < 16) w[i] = words[j + i]; else { const s0 = r(w[i-15], 7) ^ r(w[i-15], 18) ^ (w[i-15] >>> 3), s1 = r(w[i-2], 17) ^ r(w[i-2], 19) ^ (w[i-2] >>> 10); w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0; }
        const t1 = (a[7] + (r(a[4], 6) ^ r(a[4], 11) ^ r(a[4], 25)) + ((a[4] & a[5]) ^ (~a[4] & a[6])) + K[i] + w[i]) | 0, t2 = ((r(a[0], 2) ^ r(a[0], 13) ^ r(a[0], 22)) + ((a[0] & a[1]) ^ (a[0] & a[2]) ^ (a[1] & a[2]))) | 0;
        a.unshift((t1 + t2) | 0); a[4] = (a[4] + t1) | 0; a.pop(); }
      for (let i = 0; i < 8; i++) H[i] = (H[i] + a[i]) | 0; }
    return H.map(x => (x >>> 0).toString(16).padStart(8, '0')).join(''); }; })();
const PIN_ROUNDS = 3000;
const pinDigest = (pin, salt) => { let h = salt + ':' + pin; for (let i = 0; i < PIN_ROUNDS; i++) h = sha256(h + salt); return h; };
const makePin = pin => { const salt = Array.from(crypto.getRandomValues(new Uint8Array(12)), x => x.toString(16).padStart(2, '0')).join(''); return 'h1$' + salt + '$' + pinDigest(pin, salt); };
const pinOk = v => { const p = String(S.pin || '').split('$'); return p[0] === 'h1' && p.length === 3 && pinDigest(v, p[1]) === p[2]; };   // old format (h1)
// New format h2$iterations$salt$hash: PBKDF2-SHA256 with 210,000 rounds, done by the browser's own crypto (fast for a parent, slow to guess offline).
// A 4-digit PIN keeps a child out of Grown-ups; it is not device security (anyone who can read the device's storage can still try all 10,000).
const PIN_RE = /^\d{4}(\d{2})?$/, PBKDF2_ITER = 210000;
const easyPin = p => /^(\d)\1+$/.test(p) || '0123456789'.includes(p) || '9876543210'.includes(p) || /^(2580|0852|1212|1122|112233|121212|123123)$/.test(p);
const hasSubtle = () => { try { return !!(window.crypto && crypto.subtle && crypto.subtle.deriveBits && window.TextEncoder); } catch (e) { return false; } };
async function pbkdf2Hex(pin, salt, iter) {
  const enc = new TextEncoder(), k = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: iter}, k, 256);
  return Array.from(new Uint8Array(bits), x => x.toString(16).padStart(2, '0')).join('');
}
function hardenPin(pin) {   // replace an h1 hash with h2 (right after setting a PIN, or the first time an old PIN is entered)
  if (!hasSubtle()) return Promise.resolve(false);
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)), x => x.toString(16).padStart(2, '0')).join(''), was = S.pin;
  return pbkdf2Hex(pin, salt, PBKDF2_ITER).then(h => { if (S.pin !== was) return false; S.pin = 'h2$' + PBKDF2_ITER + '$' + salt + '$' + h; Bridge.save('settings', S); return true; }).catch(() => false);
}
function setPin(pin) { S.pin = makePin(pin); S.pinLen = pin.length; S.pinLock = {fails: 0, until: 0}; return hardenPin(pin); }
function pinCheck(v) {   // → Promise<boolean>
  const p = String(S.pin || '').split('$');
  if (p[0] === 'h2' && p.length === 4) { const it = +p[1]; if (!hasSubtle() || !(it >= 1000 && it <= 5e6)) return Promise.resolve(false);
    return pbkdf2Hex(v, p[2], it).then(h => h === p[3]).catch(() => false); }
  const ok = pinOk(v); if (ok) hardenPin(v); return Promise.resolve(ok);
}
const todayKey = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); };
function choicesFrom(answer, wrongs, n = 3) {
  const w = uniq(wrongs.map(String)).filter(x => x !== String(answer));
  return shuffle([String(answer), ...shuffle(w).slice(0, n - 1)]);
}
function numWrongs(ans, lo = 0, hi = 120) {
  return uniq([ans + 1, ans - 1, ans + 2, ans - 2, ans + 10, ans - 10].filter(x => x >= lo && x <= hi && x !== ans));
}

// ---------------- speech: turn screen text into something a voice reads naturally ----------------
// Dashes, spelled-out letters, syllable hyphens, maths symbols (incl. Grades 3–5: × ÷ fractions powers remainders),
// emoji and "…" confuse text-to-speech. Every Bridge.speak() goes through here.
const FRAC_NAMES = {2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['fourth', 'fourths'], 5: ['fifth', 'fifths'], 6: ['sixth', 'sixths'], 8: ['eighth', 'eighths'], 10: ['tenth', 'tenths'], 12: ['twelfth', 'twelfths'], 100: ['hundredth', 'hundredths']};
const fracWords = (n, d) => { const f = FRAC_NAMES[+d]; return f ? `${n} ${+n === 1 ? f[0] : f[1]}` : `${n} over ${d}`; };
function speakable(t) {
  let s = String(t == null ? '' : t);
  s = s.replace(/<sup>\s*(\d+)\s*<\/sup>/g, ' to the power of $1 ');                       // 10<sup>3</sup>
  s = s.replace(/<[^>]*>/g, ' ');                                                   // any HTML
  s = s.replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}\u{20E3}]/gu, ' ');   // emoji
  s = s.replace(/[↔→←⇒➜]/g, ' ');                                                  // arrows
  s = s.replace(/_{2,}|▢/g, ' blank ');
  s = s.replace(/\b([A-Za-z])((?:\s*-\s*[A-Za-z]\b)+)/g, m => m.split(/\s*-\s*/).join(', '));   // p - i - g  ->  p, i, g
  s = s.replace(/\b[A-Za-z]+(?:-[A-Za-z]+){2,}\b/g, m => m.split('-').join(', '));          // kan-ga-roo -> kan, ga, roo
  s = s.replace(/(Clap:\s*)([A-Za-z]+(?:-[A-Za-z]+)+)/g, (m, a, w) => a + w.split('-').join(', '))   // Clap: pen-cil -> pen, cil
    .replace(/\b([A-Za-z]+(?:-[A-Za-z]+)+)(?=[\s,—–-]+\d+\s+claps?\b)/g, w => w.split('-').join(', '));   // pen-cil — 2 claps
  s = s.replace(/\b(\d)-D\b/g, '$1 D');
  s = s.replace(/(^|[\s(“"])([A-Za-z]{1,6})-(?=[\s,.!?)”"]|$)/g, '$1$2').replace(/(^|[\s(“"])-([A-Za-z]{1,6})\b/g, '$1$2');   // the prefix re- / the suffix -ful
  s = s.replace(/~+/g, ' ');
  s = s.replace(/(\d+)\s+(\d+)\/(\d+)\b/g, (m, w, n, d) => `${w} and ${fracWords(n, d)}`);     // 2 3/4 -> 2 and 3 fourths
  s = s.replace(/(?<![\d/])(\d+)\/(\d+)\b/g, (m, n, d) => fracWords(n, d));                  // 3/4 -> 3 fourths
  s = s.replace(/(\d)\s*R\s*(?=\d|\?|blank)/g, '$1 remainder ').replace(/\bR\s+blank\b/g, 'remainder blank');   // 7 R 2
  s = s.replace(/(\d)\s*°/g, '$1 degrees').replace(/(\d)\s*¢/g, '$1 cents');
  s = s.replace(/(\d)\s*[−–-]\s*(?=\d)/g, '$1 minus ');                             // 11 − 8
  s = s.replace(/([+=−×÷]\s*)\?/g, '$1 what ').replace(/(^|[\s(:])\?(?=\s*[+=−×÷-])/g, '$1what ');   // the unknown in "2 + ? = 12"
  s = s.replace(/\s*−\s*/g, ' minus ').replace(/\bwhat\s*-\s*(?=\d)/g, 'what minus ').replace(/\s*\+\s*/g, ' plus ').replace(/(\d|\))\s*[×x]\s*(?=\d|\(|what)/g, '$1 times ').replace(/(\d)\s*÷\s*(?=\d|what)/g, '$1 divided by ');
  s = s.replace(/\s*×\s*/g, ' times ').replace(/\s*÷\s*/g, ' divided by ');
  s = s.replace(/(\d)\s*<\s*(?=\d)/g, '$1 is less than ').replace(/(\d)\s*>\s*(?=\d)/g, '$1 is greater than ');
  s = s.replace(/\s*=\s*/g, ' equals ').replace(/\s[<>]\s/g, ' ');
  s = s.replace(/\s*[—–]\s*/g, ', ').replace(/\s+-\s+/g, ', ');                    // dashes used as pauses
  s = s.replace(/…|\.{3,}/g, '. ');
  s = s.replace(/\s+([,.!?])/g, '$1').replace(/([,.!?]){2,}/g, '$1').replace(/,\s*([.!?])/g, '$1').replace(/\s{2,}/g, ' ').trim();
  return s.replace(/^[,.\s]+/, '');
}

// ---------------- native bridge (Android injects window.Native) ----------------
const Bridge = (() => {
  const N = window.Native;
  let voice = null;
  if (!N && window.speechSynthesis) {
    const pickVoice = () => { const v = speechSynthesis.getVoices().filter(v => /en[-_]US/i.test(v.lang)); voice = v.find(x => /Samantha|female|Google US/i.test(x.name)) || v[0] || null; };
    pickVoice(); speechSynthesis.onvoiceschanged = pickVoice;
  }
  return {
    native: !!N,
    speak(t) {
      if (!t) return; t = speakable(t); if (!t) return;
      if (N) return N.speak(t);
      if (!window.speechSynthesis) return;
      speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.rate = 0.85; u.pitch = 1.1; if (voice) u.voice = voice; speechSynthesis.speak(u);
    },
    stopSpeak() { if (N) N.stopSpeaking(); else if (window.speechSynthesis) speechSynthesis.cancel(); },
    canListen() { if (typeof S !== 'undefined' && S.micOn === false) return false; return N ? N.hasRecognizer() === 'true' || N.hasRecognizer() === true : !!(window.SpeechRecognition || window.webkitSpeechRecognition); },
    listen(onResult, onError) {
      window.__speechResult = r => onResult(typeof r === 'string' ? JSON.parse(r) : r);
      window.__speechError = e => onError(e);
      if (N) return N.startListening();
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SR(); rec.lang = 'en-US'; rec.maxAlternatives = 5; rec.interimResults = false;
      rec.onresult = ev => { const alts = []; for (const a of ev.results[0]) alts.push(a.transcript); window.__speechResult(alts); };
      rec.onerror = ev => window.__speechError(ev.error); rec.start();
    },
    load(k) { try { const v = N ? N.load(k) : localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    save(k, v) { const s = JSON.stringify(v); if (N) N.save(k, s); else try { localStorage.setItem(k, s); } catch (e) {} },
    unlock(min) { if (N) N.unlock(min); },
    lockNow() { if (N) N.lockNow(); },
    parentMode(min) { if (N) N.parentMode(min); },
    _fake: {vol: 8, max: 15, b: 150},
    volume(dir) { if (N) return JSON.parse(dir ? N.changeVolume(dir) : N.getVolume()); const f = this._fake; f.vol = Math.max(0, Math.min(f.max, f.vol + (dir || 0))); return {vol: f.vol, max: f.max}; },
    brightness(val) { if (N) return JSON.parse(val == null ? N.getBrightness() : N.setBrightness(Math.round(val))); if (val != null) this._fake.b = Math.max(5, Math.min(255, val)); document.body.style.filter = `brightness(${0.4 + 0.6 * this._fake.b / 255})`; return {b: this._fake.b, max: 255, system: false}; },
    callNumber(n) { if (N && N.callNumber) N.callNumber(String(n)); else location.href = 'tel:' + n; },
    faceTime(id, video) { if (N && N.faceTime) N.faceTime(String(id), !!video); else location.href = (video ? 'facetime:' : 'facetime-audio:') + id; },
    dialEmergency() { if (N && N.dialEmergency) N.dialEmergency(); else location.href = 'tel:911'; },
    whatsapp(n) { if (N && N.whatsapp) N.whatsapp(String(n)); else window.open('https://wa.me/' + String(n).replace(/\D/g, '')); },
    helpInfo() { try { return N && N.helpInfo ? JSON.parse(N.helpInfo()) : {canPhone: true, hasWhatsApp: true, callPerm: false}; } catch (e) { return {canPhone: true, hasWhatsApp: false}; } },
    setSafetyApps(list) { if (N && N.setSafetyApps) N.setSafetyApps(JSON.stringify(list)); },
    volumeCap(p) { p = +p; if (N) N.setVolumeCap(p >= 10 && p <= 100 ? p : 80); },
    state() { if (!N) return {locked: true, unlockUntil: 0, web: true}; try { return JSON.parse(N.getState()); } catch (e) { return {locked: true}; } },
    apps(all) { if (!N) return []; try { return JSON.parse(all ? N.getAllApps() : N.getAllowedApps()); } catch (e) { return []; } },
    setAllowedApps(list) { if (N) N.setAllowedApps(JSON.stringify(list)); },
    launch(pkg) { if (N) N.launchApp(pkg); },
    setup(what) { if (N) N.openSetup(what); },
    config(c) { if (N) N.setConfig(JSON.stringify(c)); }
  };
})();

// ---------------- persistent state ----------------
const DEFAULT_SETTINGS = {
  childName: '', grade: '1', classWords: [], setupDone: false, pin: '', questionsPerUnlock: 5, minutesPerUnlock: 20, dailyMaxMinutes: 90,
  bedtimeStart: '20:00', bedtimeEnd: '07:00', readAloud: true, readQuestions: true, volumeCapPct: 80, helpName: '', helpPhone: '', helpWhatsApp: true, alwaysWhatsApp: false, faceTimeId: '', faceTimeVideo: true,
  subjects: {math: true, reading: true, writing: true, science: true, art: true, social: true}
};
// Settings can arrive from her other device through the Sheet, so check them before use (defence in depth):
// numbers must be numbers, yes/no must be yes/no, and text loses characters that could build HTML.
function cleanSettings(o) {
  const strip = v => String(v == null ? '' : v).replace(/[<>`"\u0000-\u001f]/g, '').slice(0, 300);
  const clean = (v, d) => typeof d === 'number' ? (isFinite(+v) ? +v : d) : typeof d === 'boolean' ? !!v : typeof d === 'string' ? strip(v)
    : Array.isArray(v) ? v.slice(0, 200).map(x => (x && typeof x === 'object') ? clean(x, {}) : typeof x === 'string' ? strip(x) : x)
    : (v && typeof v === 'object') ? Object.fromEntries(Object.entries(v).slice(0, 200).map(([k, x]) => [strip(k), typeof x === 'string' ? strip(x) : typeof x === 'number' || typeof x === 'boolean' ? x : clean(x, {})])) : v;
  Object.keys(o).forEach(k => { if (k === 'pin' || k === 'syncUrl' || k === 'syncKey') { o[k] = String(o[k] || '').replace(/[<>`"\s]/g, ''); return; }
    const d = DEFAULT_SETTINGS[k]; o[k] = d === undefined ? (typeof o[k] === 'string' ? strip(o[k]) : (o[k] && typeof o[k] === 'object') ? clean(o[k], {}) : o[k]) : clean(o[k], d); });
  return o;
}
let S = cleanSettings(Object.assign({}, DEFAULT_SETTINGS, Bridge.load('settings') || {}));
S.subjects = Object.assign({}, DEFAULT_SETTINGS.subjects, S.subjects || {});
if (!['K', '1', '2', '3', '4', '5'].includes(S.grade)) S.grade = '1';
if (!Array.isArray(S.classWords)) S.classWords = [];
if (S.pin && !S.setupDone) S.setupDone = true;   // a device that was set up before the wizard existed
buildSight(S.grade, S.classWords);
if (!(S.volumeCapPct >= 10 && S.volumeCapPct <= 100)) S.volumeCapPct = 80;
if (/^\d{4}$/.test(S.pin || '')) { setPin(S.pin); Bridge.save('settings', S); }   // upgrade an old plain-text PIN
if (S.pinLen !== 6) S.pinLen = 4;
if (typeof S.micOn !== 'boolean') S.micOn = !!Bridge.native;   // the web preview starts with the microphone off (browsers send speech to Google or Apple)
if (!S.pinLock) S.pinLock = {fails: 0, until: 0};
let P = Bridge.load('progress') || {skills: {}, sessions: [], stars: 0, usage: {}, sessionCount: 0};
const saveAll = () => { Bridge.save('settings', S); Bridge.save('progress', P); Bridge.config({minutesPerUnlock: S.minutesPerUnlock, bedtimeStart: S.bedtimeStart, bedtimeEnd: S.bedtimeEnd, syncUrl: S.syncUrl || '', syncKey: S.syncKey || '', deviceRole: S.deviceRole || 'child', deviceName: S.deviceName || (typeof defaultDeviceName === 'function' ? defaultDeviceName() : '')}); };
const sk = id => (P.skills[id] = P.skills[id] || {seen: 0, correct: 0, box: 0, streak: 0, last: 0, hist: []});
// Grown-up words used in the child's screens (set in the setup wizard / Grown-ups).
const kidName = () => S.childName || 'friend';
const helperName = () => S.helpName || 'your grown-up';
const HelperName = () => { const h = helperName(); return h[0].toUpperCase() + h.slice(1); };
// Grades: K = 0 … Grade 5 = 5. Every skill has g: [first grade, last grade] and base: the grade its level 1 is written for.
const GRADE_LIST = ['K', '1', '2', '3', '4', '5'];
const gradeNum = () => Math.max(0, GRADE_LIST.indexOf(S.grade));
const skillRange = id => (SKILLS[id] && SKILLS[id].g) || [0, 2];
// Starting level for a new skill: one level up for each grade above the grade it was written for (1–3).
const gradeStartLevel = id => { const base = (SKILLS[id] && SKILLS[id].base != null) ? SKILLS[id].base : 1; return Math.max(1, Math.min(3, 1 + gradeNum() - base)); };
// Levels 1–3 per skill. She moves up after 85%+ right on the first try over her last 8–10 answers at
// that level, and back down below 60%, so a single lucky (or unlucky) answer never changes her level.
const boxLevel = b => b < 2 ? 1 : b < 4 ? 2 : 3;
const initLvl = (s, id) => { if (!s.lvl) { s.lvl = Math.max(boxLevel(s.box), gradeStartLevel(id)); s.recent = (s.hist || []).slice(-10); } return s; };
const recentAcc = s => { const r = s.recent || []; return r.length ? r.reduce((a, b) => a + b, 0) / r.length : null; };
function levelStep(s, first, id) {
  initLvl(s, id); s.recent = (s.recent || []).concat(first ? 1 : 0).slice(-10);
  if (s.recent.length < 8) return;
  const acc = recentAcc(s);
  if (acc >= 0.85 && s.lvl < 3) { s.lvl++; s.recent = []; s.lvlT = Date.now(); s.lvlDir = 1; }
  else if (acc < 0.6 && s.lvl > 1) { s.lvl--; s.recent = []; s.lvlT = Date.now(); s.lvlDir = -1; }
}
const level = id => { if (typeof session !== 'undefined' && session && session.challenge) return session.challenge.difficulty; return initLvl(sk(id), id).lvl; };

// ---------------- visuals ----------------
function tenFrame(n, crossed = 0, color = '#F2994A') {
  let h = '<div class="tf">';
  for (let i = 0; i < 10; i++) h += `<span class="cell">${i < n ? `<i class="dot ${i >= n - crossed ? 'x' : ''}" style="background:${color}"></i>` : ''}</span>`;
  return h + '</div>';
}
function frames(n, crossed = 0, color) { let h = '<div class="frames">'; let left = n, lc = crossed; while (left > 0 || h === '<div class="frames">') { const k = Math.min(10, left); const cx = Math.max(0, lc - (left - k)); h += tenFrame(k, Math.min(cx, k), color); lc -= Math.min(cx, k); left -= k; if (n === 0) break; } return h + '</div>'; }
function blocks(tens, ones) {
  let h = '<div class="blocks">';
  for (let i = 0; i < tens; i++) h += '<div class="rod">' + '<b></b>'.repeat(10) + '</div>';
  h += '<div class="ones">'; for (let i = 0; i < ones; i++) h += '<b></b>'; return h + '</div></div>';
}
function clockSVG(h, m) {
  const ma = m * 6, ha = (h % 12) * 30 + m * 0.5;
  let t = ''; for (let i = 1; i <= 12; i++) { const a = (i * 30 - 90) * Math.PI / 180; t += `<text x="${100 + 72 * Math.cos(a)}" y="${106 + 72 * Math.sin(a)}" text-anchor="middle" font-size="20" font-weight="700" fill="#333">${i}</text>`; }
  return `<svg viewBox="0 0 200 200" class="clock"><circle cx="100" cy="100" r="92" fill="#fff" stroke="#4C7BF3" stroke-width="8"/>${t}
  <line x1="100" y1="100" x2="100" y2="52" stroke="#222" stroke-width="8" stroke-linecap="round" transform="rotate(${ha} 100 100)"/>
  <line x1="100" y1="100" x2="100" y2="30" stroke="#EB5757" stroke-width="5" stroke-linecap="round" transform="rotate(${ma} 100 100)"/>
  <circle cx="100" cy="100" r="7" fill="#222"/></svg>`;
}
const SHAPES = {
  circle:    {sides: 0, corners: 0, svg: '<circle cx="60" cy="60" r="48"/>'},
  triangle:  {sides: 3, corners: 3, svg: '<polygon points="60,10 112,104 8,104"/>'},
  square:    {sides: 4, corners: 4, svg: '<rect x="14" y="14" width="92" height="92"/>'},
  rectangle: {sides: 4, corners: 4, svg: '<rect x="4" y="30" width="112" height="60"/>'},
  hexagon:   {sides: 6, corners: 6, svg: '<polygon points="32,12 88,12 116,60 88,108 32,108 4,60"/>'},
  trapezoid: {sides: 4, corners: 4, svg: '<polygon points="34,24 86,24 116,96 4,96"/>'},
  'half circle': {sides: 1, corners: 2, svg: '<path d="M10 80 A50 50 0 0 1 110 80 Z"/>'}
};
const shapeSVG = (name, color = '#9B51E0') => `<svg viewBox="0 0 120 120" class="shape"><g fill="${color}" stroke="#333" stroke-width="3">${SHAPES[name].svg}</g></svg>`;
const big = s => `<div class="bigemoji">${s}</div>`;

// ---------------- question generators ----------------
const G = {};
G.m_add10 = () => { const L = level('m_add10'); const mx = L === 1 ? 5 : 10; const a = R(0, mx - 1), b = R(1, mx - a); const c = a + b;
  return {type: 'number', prompt: `${a} + ${b} = ?`, say: `What is ${a} plus ${b}?`, visual: L < 3 ? `<div class="row">${tenFrame(a)}<span class="op">+</span>${tenFrame(b, 0, '#4C7BF3')}</div>` : '', answer: c,
    hint: `Count all the dots: start at ${a} and count ${b} more.`}; };
G.m_doubles = () => { const L = level('m_doubles'); const k = L === 1 ? 0 : R(0, L === 2 ? 2 : 3);
  if (k === 0) { const a = R(1, L === 1 ? 5 : 9); return {type: 'number', prompt: `${a} + ${a} = ?`, say: `Doubles! What is ${a} plus ${a}?`, answer: 2 * a,
    visual: a <= 5 ? `<div class="row">${tenFrame(a)}<span class="op">+</span>${tenFrame(a, 0, '#4C7BF3')}</div>` : '', hint: `Doubles: ${a} and ${a} more. Count by ${a}s, or think of a fact you know.`}; }
  if (k === 1) { const a = R(2, 8); return {type: 'number', prompt: `${a} + ${a} = ${2 * a}<br>so ${a} + ${a + 1} = ?`, say: `${a} plus ${a} is ${2 * a}. So what is ${a} plus ${a + 1}?`, answer: 2 * a + 1,
    hint: `Doubles plus one! ${a} + ${a + 1} is the same as ${a} + ${a}, and 1 more.`}; }
  if (k === 2) { const a = R(2, 8); const sw = Math.random() < .5; const x = sw ? a + 1 : a, y = sw ? a : a + 1; return {type: 'number', prompt: `${x} + ${y} = ?`, say: `What is ${x} plus ${y}? Use a doubles fact.`, answer: x + y,
    hint: `Find the double: ${a} + ${a} = ${2 * a}. Then add 1 more.`}; }
  const a = R(2, 9); return {type: 'choice', prompt: `Which doubles fact helps with<div class="eq">${a} + ${a + 1}</div>`, say: `Which doubles fact helps you solve ${a} plus ${a + 1}?`,
    choices: choicesFrom(`${a} + ${a}`, [`${a + 2} + ${a + 2}`, `${a - 1} + ${a + 1}`, `${a} + 1`, `${a + 1} + 1`]), answer: `${a} + ${a}`, hint: `Look for the same number twice, close to ${a} and ${a + 1}.`}; };
function bondSVG(w, a, b) {
  const c = (x, y, v) => `<circle cx="${x}" cy="${y}" r="30" fill="#fff" stroke="#333" stroke-width="4"/>` + (v === null ? `<text x="${x}" y="${y + 12}" text-anchor="middle" font-size="34" font-weight="700" fill="#9B51E0">?</text>` : `<text x="${x}" y="${y + 12}" text-anchor="middle" font-size="32" font-weight="700" fill="#222">${v}</text>`);
  return `<svg viewBox="0 0 220 170" class="bond" width="240" height="185"><line x1="110" y1="40" x2="50" y2="130" stroke="#333" stroke-width="4"/><line x1="110" y1="40" x2="170" y2="130" stroke="#333" stroke-width="4"/>${c(110, 38, w)}${c(50, 132, a)}${c(170, 132, b)}</svg>`;
}
G.m_bond = () => { const L = level('m_bond'); const k = R(0, L === 1 ? 1 : 3); const w = R(L === 1 ? 5 : 9, L === 1 ? 10 : 18), a = R(1, w - 1), b = w - a;
  if (k === 0) { const miss = Math.random() < .5; return {type: 'number', prompt: `What number is missing?`, say: `Look at the number bond. ${miss ? a : b} and what number make ${w}?`, visual: bondSVG(w, miss ? a : null, miss ? null : b), answer: miss ? b : a,
    hint: `The top circle is the whole: ${w}. The parts together make ${w}. ${miss ? a : b} + ? = ${w}`}; }
  if (k === 1) { const right = `${a} + ${b} = ${w}`; return {type: 'choice', prompt: 'Which number sentence matches the number bond?', say: 'Which number sentence matches the number bond?', visual: bondSVG(w, a, b),
    choices: choicesFrom(right, [`${w} + ${a} = ${b}`, `${a} − ${b} = ${w}`, `${a} + ${w} = ${b}`]), answer: right, hint: 'The two bottom parts add up to the whole on top.', wordChoices: true}; }
  if (k === 2) { const x = R(6, 9), y = R(11 - x, 9), right = `${x} + ${y} = ${x + y}`; return {type: 'choice', prompt: 'Which number sentence matches the dots?', say: 'Count the orange dots and the blue dots. Which number sentence matches?',
    visual: `<div class="row">${tenFrame(x)}<span class="op">+</span>${tenFrame(y, 0, '#4C7BF3')}</div>`, choices: choicesFrom(right, [`${x} − ${y} = ${x - y}`, `${x} + ${y + 1} = ${x + y + 1}`, `${x + y} + ${y} = ${x + 2 * y}`]), answer: right, hint: 'Count each frame once. Orange first, then blue. Adding puts them together.', wordChoices: true}; }
  const t = R(11, 15), c = R(2, 6), right = `${t} − ${c} = ${t - c}`; return {type: 'choice', prompt: 'Which number sentence matches? The X dots are taken away.', say: 'Some dots are crossed out. Which number sentence matches?',
    visual: frames(t, c), choices: choicesFrom(right, [`${t} + ${c} = ${t + c}`, `${t} − ${c + 1} = ${t - c - 1}`, `${t - c} − ${c} = ${t - 2 * c}`]), answer: right, hint: 'Crossed-out dots are taken away, so use minus. Start with all the dots.', wordChoices: true}; };
G.m_three = () => { const L = level('m_three'); let a, b, c; if (Math.random() < .5) { a = R(1, 9); b = 10 - a; c = R(1, L === 1 ? 5 : 9); } else { a = R(2, L === 1 ? 5 : 8); b = a; c = R(1, 5); }
  const ord = shuffle([a, b, c]); return {type: 'number', prompt: `${ord[0]} + ${ord[1]} + ${ord[2]} = ?`, say: `What is ${ord[0]} plus ${ord[1]} plus ${ord[2]}?`, answer: a + b + c,
    hint: a + b === 10 ? `Find two numbers that make 10: ${a} + ${b} = 10. Then add ${c}.` : `Find the double: ${a} + ${a} = ${2 * a}. Then add ${c}.`}; };
G.m_rest = () => { const [th, em] = pick(THINGS); const k = R(0, 1); const w = R(11, 18), p = R(4, 9);
  if (k === 0) { const other = pick(['red', 'big', 'blue', 'new', 'small']); return {type: 'number', prompt: `There are ${w} ${th}. ${p} are ${other}. The rest are not. How many are not ${other}?`, say: `There are ${w} ${th}. ${p} are ${other}. The rest are not. How many are not ${other}?`, answer: w - p,
    hint: `"The rest" means take away the part you know: ${w} − ${p}.`}; }
  const left = w - p; return {type: 'number', prompt: `There are ${w} ${th}. Some go away. Now there are ${left}. How many went away?`, say: `There are ${w} ${th}. Some go away. Now there are ${left}. How many went away?`, answer: p,
    hint: `Count up from ${left} to ${w}. ${left} + ? = ${w}`}; };
G.r_th = () => { if (Math.random() < .5) { const w = pick(TH_WORDS.slice(0, 4)); const opts = choicesFrom(w, TH_WORDS.filter(x => x !== w), 4);
    return {type: 'choice', prompt: 'Listen 🔊 and tap the word.', say: `Find the word: ${w}.`, choices: opts, answer: w, wordChoices: true, noSpeakAnswer: true,
      hint: `They, there, that, this all start with th. Look at the end: they ends in "ey", there in "ere", that in "at", this in "is".`}; }
  const [sent, ans] = pick(TH_SENT); const cap = ans[0] === ans[0].toUpperCase(); const base = ['they', 'there', 'that', 'this'];
  const opts = shuffle(base.map(x => cap ? x[0].toUpperCase() + x.slice(1) : x));
  return {type: 'choice', prompt: `Which word fits?<div class="eq small">${sent.replace('___', '▢')}</div>`, say: `Which word fits? ${sent.replace('___', 'blank')}`, choices: opts, answer: ans, wordChoices: true, noSpeakAnswer: true,
    hint: 'Read the sentence with each word. Which one sounds right?'}; };
G.m_sub10 = () => { const L = level('m_sub10'); const a = R(L === 1 ? 3 : 5, 10), b = R(1, a - 1); return {type: 'number', prompt: `${a} − ${b} = ?`, say: `What is ${a} take away ${b}?`,
  visual: L < 3 ? frames(a, b) : '', answer: a - b, hint: `Start with ${a}. Cross out ${b}. How many are left?`}; };
G.m_add20 = () => { const L = level('m_add20'); let a, b;
  if (L === 1) { a = 10; b = R(1, 9); } else if (L === 2) { a = pick([9, 8, 7]); b = R(11 - a, 9); } else { a = R(4, 9); b = R(11 - a, 9); }
  if (Math.random() < .5) [a, b] = [b, a];
  const big1 = Math.max(a, b), small = Math.min(a, b), need = 10 - big1;
  return {type: 'number', prompt: `${a} + ${b} = ?`, say: `What is ${a} plus ${b}?`, visual: L < 3 ? `<div class="row">${frames(a)}<span class="op">+</span>${frames(b, 0, '#4C7BF3')}</div>` : '',
    answer: a + b, hint: big1 === 10 ? `10 and ${small} more is 1${small}.` : `Make a ten! ${big1} + ${need} = 10, then add ${small - need} more.`}; };
G.m_sub20 = () => { const L = level('m_sub20'); const a = R(11, L === 1 ? 15 : 19), b = L === 1 ? a - 10 : R(2, 9); return {type: 'number', prompt: `${a} − ${b} = ?`, say: `What is ${a} minus ${b}?`,
  visual: L < 3 ? frames(a, b) : '', answer: a - b, hint: `Think addition: ${b} + ? = ${a}`}; };
G.m_missing = () => { const L = level('m_missing'); const mx = L === 1 ? 10 : 20; const c = R(4, mx), a = R(1, c - 1), b = c - a; const f = R(0, L === 1 ? 1 : 2);
  if (f === 0) return {type: 'number', prompt: `${a} + ▢ = ${c}`, say: `${a} plus what number makes ${c}?`, answer: b, visual: L === 1 ? frames(a) : '', hint: `Count up from ${a} to ${c}. How many jumps?`};
  if (f === 1) return {type: 'number', prompt: `▢ + ${b} = ${c}`, say: `What number plus ${b} makes ${c}?`, answer: a, hint: `Take ${b} away from ${c}.`};
  return {type: 'number', prompt: `${c} − ▢ = ${a}`, say: `${c} minus what number is ${a}?`, answer: b, hint: `Count up from ${a} to ${c}.`}; };
G.m_truefalse = () => { const L = level('m_truefalse'); let l, r, tru;
  const a = R(1, 9), b = R(1, 9), s = a + b; tru = Math.random() < .5;
  const kind = R(0, L === 1 ? 1 : 3);
  if (kind === 0) { l = `${s}`; r = tru ? `${a} + ${b}` : `${a} + ${b + pick([1, -1].filter(d => b + d > 0))}`; }
  else if (kind === 1) { l = `${a} + ${b}`; r = tru ? `${b} + ${a}` : `${b} + ${a + 1}`; }
  else if (kind === 2) { const c = R(1, s - 1); l = `${a} + ${b}`; r = tru ? `${c} + ${s - c}` : `${c} + ${s - c + pick([1, 2])}`; }
  else { l = `${s} − ${b}`; r = tru ? `${a}` : `${a + 1}`; }
  return {type: 'choice', prompt: `Is this true?<div class="eq">${l} = ${r}</div>`, say: `Is this true? ${l.replace('−', 'minus')} equals ${r.replace('−', 'minus')}`,
    choices: ['✅ True', '❌ False'], answer: tru ? '✅ True' : '❌ False', hint: 'The = sign means "the same as". Work out each side. Are they the same?'}; };
G.m_turn = () => { const a = R(2, 9), b = R(2, level('m_turn') === 1 ? 6 : 9); if (a === b) return G.m_turn();
  return {type: 'number', prompt: `${a} + ${b} = ${a + b}<br>so ${b} + ${a} = ?`, say: `${a} plus ${b} is ${a + b}. So what is ${b} plus ${a}?`, answer: a + b,
    hint: 'Turn-around facts! Switching the order does not change the answer.'}; };
G.m_factfam = () => { const a = R(2, 9), b = R(1, level('m_factfam') === 1 ? 5 : 9), c = a + b; const f = R(0, 1);
  if (f === 0) return {type: 'number', prompt: `${a} + ${b} = ${c}<br>so ${c} − ${b} = ?`, say: `${a} plus ${b} is ${c}. So ${c} minus ${b} is?`, answer: a, hint: `${a}, ${b} and ${c} are a family. Take ${b} away from ${c}.`};
  const right = `${c} − ${a} = ${b}`; const wrong = [`${c} + ${a} = ${b}`, `${a} − ${b} = ${c}`, `${c} − ${a} = ${b + 1}`];
  return {type: 'choice', prompt: `Which fact belongs to the family<br><b>${a}, ${b}, ${c}</b>?`, say: `Which fact belongs to the family ${a}, ${b}, ${c}?`, choices: choicesFrom(right, wrong), answer: right,
    hint: `The biggest number, ${c}, is the whole. Take a part away and the other part is left.`}; };
G.m_word = () => { const L = level('m_word'); const nm = pick(NAMES), [th, em] = pick(THINGS); const mx = L === 1 ? 10 : 20; const k = R(0, 2);
  if (k === 0) { const a = R(1, mx - 2), b = R(1, Math.min(9, mx - a)); return {type: 'number', prompt: `${nm} has ${a} ${th}. ${nm} gets ${b} more. How many ${th} now?`, say: `${nm} has ${a} ${th}. ${nm} gets ${b} more. How many ${th} now?`,
    visual: a + b <= 12 ? big(em.repeat(a) + ' + ' + em.repeat(b)) : '', answer: a + b, hint: `Put them together: ${a} + ${b}`}; }
  if (k === 1) { const a = R(3, mx), b = R(1, a - 1); return {type: 'number', prompt: `${nm} had ${a} ${th}. ${b} went away. How many are left?`, say: `${nm} had ${a} ${th}. ${b} went away. How many are left?`,
    visual: a <= 12 ? big(em.repeat(a)) : '', answer: a - b, hint: `Take away: ${a} − ${b}`}; }
  const a = R(4, mx), b = R(1, a - 1); const n2 = pick(NAMES.filter(x => x !== nm));
  return {type: 'number', prompt: `${nm} has ${a} ${th}. ${n2} has ${b}. How many more does ${nm} have?`, say: `${nm} has ${a} ${th}. ${n2} has ${b}. How many more does ${nm} have?`, answer: a - b, hint: `Line them up and compare. ${b} + ? = ${a}`}; };
G.m_place = () => { const L = level('m_place'); const n = L === 1 ? R(11, 39) : R(20, 99); const t = Math.floor(n / 10), o = n % 10; const k = R(0, 1);
  if (k === 0 || L === 1) return {type: 'number', prompt: 'How many blocks?', say: 'Count the tens, then the ones. How many blocks?', visual: blocks(t, o), answer: n, hint: `${t} tens is ${t * 10}. Then count on the ones.`};
  return {type: 'number', prompt: `${n} = ▢ tens and ${o} ones`, say: `${n} is how many tens and ${o} ones?`, answer: t, hint: `The first digit in ${n} tells the tens.`}; };
G.m_compare = () => { const L = level('m_compare'); let a = R(L === 1 ? 1 : 10, L === 1 ? 20 : 99), b = Math.random() < .15 ? a : R(L === 1 ? 1 : 10, L === 1 ? 20 : 99);
  const ans = a > b ? '>' : a < b ? '<' : '=';
  return {type: 'choice', prompt: `<div class="eq">${a} ▢ ${b}</div>`, say: `Compare ${a} and ${b}. Greater than, less than, or equal?`, choices: ['>', '<', '='], answer: ans,
    hint: 'The alligator mouth > eats the bigger number. Look at the tens first.'}; };
G.m_count = () => { const L = level('m_count'); const by = L === 3 && Math.random() < .4 ? 10 : 1; const start = by === 10 ? R(0, 8) * 10 + R(0, 9) : R(L === 1 ? 1 : 30, L === 1 ? 40 : 116);
  const seq = [0, 1, 2].map(i => start + i * by); const ans = start + 3 * by;
  return {type: 'number', prompt: `What comes next?<div class="eq">${seq.join(', ')}, ▢</div>`, say: `What comes next? ${seq.join(', ')}`, answer: ans, hint: by === 10 ? 'Count by tens: the tens digit goes up by one.' : 'Count up by one.'}; };
G.m_shapes = () => { const names = Object.keys(SHAPES); const k = R(0, 2); const n = pick(names);
  if (k === 0) return {type: 'choice', prompt: 'What shape is this?', say: 'What shape is this?', visual: shapeSVG(n), choices: choicesFrom(n, names), answer: n, hint: `Count the sides and corners. It has ${SHAPES[n].sides} sides.`};
  if (k === 1) { const m = pick(['triangle', 'square', 'rectangle', 'hexagon', 'trapezoid']); return {type: 'number', prompt: `How many sides does a ${m} have?`, say: `How many sides does a ${m} have?`, visual: shapeSVG(m, '#27AE60'), answer: SHAPES[m].sides, hint: 'Touch each straight side and count.'}; }
  const q = pick([['Which shape has 3 corners?', 'triangle'], ['Which shape has 6 sides?', 'hexagon'], ['Which shape has no corners?', 'circle'], ['Which shape has 4 sides that are all the same?', 'square']]);
  const opts = choicesFrom(q[1], names.filter(x => x !== 'rectangle' || q[1] !== 'square'));
  return {type: 'choice', prompt: q[0], say: q[0], choices: opts, choiceHTML: opts.map(o => shapeSVG(o)), answer: q[1], hint: 'Count the sides and corners of each shape.'}; };
G.m_time = () => { const L = level('m_time'); const h = R(1, 12), m = L === 1 ? 0 : pick([0, 30]); const fmt = (h, m) => `${h}:${m === 0 ? '00' : '30'}`;
  const ans = fmt(h, m); const wr = [fmt(h % 12 + 1, m), fmt(h, m === 0 ? 30 : 0), fmt((h + 5) % 12 + 1, m)];
  return {type: 'choice', prompt: 'What time is it?', say: 'What time does the clock show?', visual: clockSVG(h, m), choices: choicesFrom(ans, wr), answer: ans, hint: m === 0 ? 'The long hand on 12 means o\'clock. The short hand shows the hour.' : 'The long hand on 6 means half past.'}; };
G.m_measure = () => { const items = [['pencil', '#F2C94C'], ['snake', '#27AE60'], ['ribbon', '#EB5757'], ['train', '#4C7BF3']]; const [a, b] = shuffle(items);
  const la = R(3, 10), lb = R(3, 10); if (la === lb) return G.m_measure(); const longer = Math.random() < .5; const ans = longer ? (la > lb ? a[0] : b[0]) : (la < lb ? a[0] : b[0]);
  const bar = (it, l) => `<div class="mbar"><span>${it[0]}</span><i style="width:${l * 9}%;background:${it[1]}"></i></div>`;
  return {type: 'choice', prompt: `Which is ${longer ? 'longer' : 'shorter'}?`, say: `Which is ${longer ? 'longer' : 'shorter'}?`, visual: `<div class="measure">${bar(a, la)}${bar(b, lb)}</div>`, choices: [a[0], b[0]], answer: ans, hint: 'Both start at the same line. Look where each one ends.'}; };
G.m_data = () => { const fr = shuffle([['🍎', 'apples'], ['🍌', 'bananas'], ['🍇', 'grapes']]); const cnt = fr.map(() => R(1, 7)); if (new Set(cnt).size < 3) return G.m_data();
  const vis = '<div class="graph">' + fr.map((f, i) => `<div>${f[0].repeat(cnt[i])}</div>`).join('') + '</div>'; const k = R(0, 2);
  if (k === 0) { const i = cnt.indexOf(Math.max(...cnt)); return {type: 'choice', prompt: 'Which fruit do kids like the most?', say: 'Look at the graph. Which fruit has the most?', visual: vis, choices: fr.map(f => f[1]), answer: fr[i][1], hint: 'Find the longest row.'}; }
  if (k === 1) { const i = R(0, 2); return {type: 'number', prompt: `How many ${fr[i][1]}?`, say: `How many ${fr[i][1]}?`, visual: vis, answer: cnt[i], hint: 'Count that row.'}; }
  const i = cnt.indexOf(Math.max(...cnt)), j = cnt.indexOf(Math.min(...cnt));
  return {type: 'number', prompt: `How many more ${fr[i][1]} than ${fr[j][1]}?`, say: `How many more ${fr[i][1]} than ${fr[j][1]}?`, visual: vis, answer: cnt[i] - cnt[j], hint: `${cnt[j]} + ? = ${cnt[i]}`}; };

// Reading
const LET = 'bcdfghjklmnprstvwxz'.split('');
G.r_end = () => { const [w, e] = pick(CVC); const ans = w.slice(-1); return {type: 'choice', prompt: `What sound does <b>${w}</b> end with?`, say: `What is the ending sound in ${w}?`, visual: big(e),
  choices: choicesFrom(ans, LET), answer: ans, hint: `Say it slowly: ${w.split('').join(' - ')}. Listen to the very last sound.`}; };
G.r_begin = () => { const [w, e] = pick(CVC); const ans = w[0]; return {type: 'choice', prompt: 'What sound does it start with?', say: `What is the first sound in ${w}?`, visual: big(e),
  choices: choicesFrom(ans, LET), answer: ans, hint: `Say ${w} slowly and listen to the first sound.`}; };
G.r_syll = () => { const L = level('r_syll'); const pool = SYLL.filter(x => L === 1 ? true : x[1] > 1); const [w, n, e, parts] = pick(pool);
  return {type: 'choice', prompt: `Clap it! How many parts in <b>${w}</b>?`, say: `Clap the word ${w}. How many parts do you hear?`, visual: big(e), choices: ['1', '2', '3'], answer: String(n),
    hint: parts ? `Clap: ${parts}` : `${w} is one clap.`, explain: parts ? `${parts} — ${n} claps!` : ''}; };
G.r_rhyme = () => { const [w, rs] = pick(RHYMES); const ans = pick(rs); const wrong = shuffle(RHYMES.filter(r => r[0] !== w).flatMap(r => r[1])).slice(0, 4);
  return {type: 'choice', prompt: `Which word rhymes with <b>${w}</b>?`, say: `Which word rhymes with ${w}?`, choices: choicesFrom(ans, wrong), answer: ans, hint: `Rhymes sound the same at the end: ${w}, ${rs.filter(x => x !== ans)[0]}…`, speakChoices: true}; };
G.r_cvc = () => { const items = shuffle(CVC).slice(0, 3); const [w, e] = items[0]; const opts = shuffle(items);
  return {type: 'choice', prompt: `Read the word:<div class="word">${w}</div>Tap the picture.`, say: 'Read the word. Then tap the matching picture.', choices: opts.map(o => o[0]), choiceHTML: opts.map(o => `<span class="emo">${o[1]}</span>`), answer: w,
    hint: `Sound it out: ${w.split('').join(' - ')}`, noSpeakAnswer: true}; };
G.r_digraph = () => { const [w, e, d] = pick(DIGRAPH); const pos = w.startsWith(d) ? 'start' : 'end';
  return {type: 'choice', prompt: `Does <b>${w}</b> ${pos === 'start' ? 'start' : 'end'} with…`, say: `${w}. What sound does ${w} ${pos} with? sh, ch, th, or wh?`, visual: big(e), choices: ['sh', 'ch', 'th', 'wh'], answer: d, hint: `Say ${w} slowly. sh like a quiet finger, ch like a train, th sticks out your tongue.`}; };
G.r_silente = () => { const [w, e, wrong] = pick(SILENT_E); return {type: 'choice', prompt: 'Which word matches the picture?', say: 'Which word matches the picture?', visual: big(e), choices: shuffle([w, wrong]), answer: w,
  hint: 'Magic e at the end makes the vowel say its name!', noSpeakAnswer: true}; };
G.r_sight = () => { const L = level('r_sight'); const list = SIGHT.slice(0, L).flat();
  const mine = typeof practiceWords === 'function' ? practiceWords(6).filter(x => x.length > 1) : [];   // her own learning / due-for-review words
  const w = mine.length && Math.random() < 0.6 ? pick(mine) : pick(L === 1 ? SIGHT[0] : SIGHT[L - 1]); const wr = shuffle(list.filter(x => x !== w && x[0] === w[0])).concat(shuffle(list)).filter(x => x !== w);
  const opts = choicesFrom(w, wr.slice(0, 6), 4);
  return {type: 'choice', prompt: 'Listen 🔊 and tap the word.', say: `Find the word: ${w}.`, choices: opts, answer: w, hint: `Listen again: ${w}`, noSpeakAnswer: true, wordChoices: true}; };
G.r_vocab = () => { if (Math.random() < .55) { const o = pick(OPPOSITES); const flip = Math.random() < .5; const w = flip ? o[1] : o[0], ans = flip ? o[0] : o[1]; const wr = OPPOSITES.filter(x => x !== o).flatMap(x => [x[0], x[1]]);
    return {type: 'choice', prompt: `What is the opposite of <b>${w}</b>?`, say: `What is the opposite of ${w}?`, visual: big(flip ? o[3] : o[2]), choices: choicesFrom(ans, wr), answer: ans, hint: `Opposites are as different as can be. ${o[2]} ↔ ${o[3]}`, speakChoices: true}; }
  const [cat, yes, no] = pick(CATEGORIES); const ans = pick(yes); return {type: 'choice', prompt: `Which one is in the group <b>${cat}</b>?`, say: `Which one belongs in the group ${cat}?`, choices: choicesFrom(ans, no), answer: ans, hint: `Think: is it a kind of ${cat}?`, speakChoices: true}; };
G.r_comp = () => { const st = pick(STORIES); const [q, a, ...w] = pick(st.q);
  return {type: 'choice', prompt: `<div class="story">${esc(st.t)}</div><div class="q">${esc(q)}</div>`, say: `${st.t} ... ${q}`, choices: shuffle([a, ...w]), answer: a, hint: 'Read the story again and look for the answer.', speakChoices: true}; };
G.r_aloud = () => { const L = level('r_aloud'); let t = pick(ALOUD[L - 1]);
  const mine = new Set(typeof practiceWords === 'function' ? practiceWords(12) : []);
  if (mine.size && Math.random() < 0.6) { const hits = s => norm(s).filter(w => mine.has(w)).length;   // a sentence with her learning words
    const best = Math.max(...ALOUD[L - 1].map(hits)); if (best > 0) t = pick(ALOUD[L - 1].filter(s => hits(s) === best)); } return {type: 'aloud', prompt: 'Read this out loud:', text: t, say: 'Press the microphone and read this sentence out loud.'}; };

// Writing
G.w_order = () => { const L = level('w_order'); const s = pick(BUILD); const words = s.split(' ');
  return {type: 'tiles', prompt: 'Put the words in order to make a sentence.', say: 'Put the words in order to make a sentence.', tiles: shuffle(words), answer: words, join: ' ', hint: `Start with the word that has a capital letter: "${words[0]}". End with the period.`, readBack: true}; };
G.w_caps = () => { const s = pick(BUILD); const noCap = s[0].toLowerCase() + s.slice(1), noDot = s.slice(0, -1), both = noCap.slice(0, -1);
  return {type: 'choice', prompt: 'Which sentence is written the right way?', say: 'Which sentence is written the right way?', choices: shuffle([s, noCap, noDot].concat(Math.random() < .3 ? [both] : [])), answer: s, wordChoices: true,
    hint: 'A sentence starts with a CAPITAL letter and ends with a period.', noSpeakAnswer: true}; };
G.w_spell = () => { const L = level('w_spell'); const pool = L === 1 ? CVC : L === 2 ? CVC.concat(DIGRAPH.filter(d => d[0].length <= 4)) : DIGRAPH.concat(SILENT_E); const it = pick(pool); const w = it[0], e = it[1];
  const extra = shuffle('abcdefghilmnoprstu'.split('').filter(c => !w.includes(c))).slice(0, 2);
  return {type: 'tiles', prompt: 'Spell the word.', say: `Spell the word: ${w}.`, visual: big(e), tiles: shuffle(w.split('').concat(extra)), answer: w.split(''), join: '', hint: `Say it slowly: ${w.split('').join(' - ')}`, letters: true}; };
G.w_punct = () => { const items = [['Can you see the bird', '?'], ['I like pizza', '.'], ['Where is my hat', '?'], ['The dog is brown', '.'], ['Do you want to play', '?'], ['We went to the park', '.'], ['What is your name', '?'], ['My cat is soft', '.'], ['Is it time for lunch', '?'], ['The sun is hot', '.']];
  const [s, p] = pick(items); return {type: 'choice', prompt: `Which mark goes at the end?<div class="eq small">${s} ▢</div>`, say: `${s}. Is it telling, or asking? Which mark goes at the end?`, choices: ['.', '?'], answer: p,
    hint: 'Asking sentences end with a question mark ?. Telling sentences end with a period.'}; };

// Science / Art / Social
const fromBank = (bank, id) => () => { const [q, a, w1, w2, e] = pick(bank); return {type: 'choice', prompt: q, say: q, visual: e ? big(e) : '', choices: shuffle([a, w1, w2]), answer: a, hint: 'Think about what you have seen in real life.', speakChoices: true}; };
G.s_earth = fromBank(SCIENCE.s_earth); G.s_life = fromBank(SCIENCE.s_life); G.s_phys = fromBank(SCIENCE.s_phys);
G.a_color = fromBank(ART.a_color); G.a_art = fromBank(ART.a_art); G.ss_civics = fromBank(CIVICS);
G.a_pattern = () => { const sets = [['🔴', '🔵', '🟡'], ['⭐', '🌙', '☀️'], ['🍎', '🍌', '🍇'], ['🔺', '⬛', '⚪'], ['🐶', '🐱', '🐭']]; const s = pick(sets); const L = level('a_pattern');
  const pats = L === 1 ? [[0, 1]] : L === 2 ? [[0, 1], [0, 0, 1], [0, 1, 2]] : [[0, 0, 1], [0, 1, 2], [0, 1, 1], [0, 1, 1, 2]]; const p = pick(pats);
  const len = p.length * 2 + R(0, p.length - 1); const seq = Array.from({length: len}, (_, i) => s[p[i % p.length]]); const ans = s[p[len % p.length]];
  return {type: 'choice', prompt: `What comes next?<div class="pattern">${seq.join(' ')} ❓</div>`, say: 'Look at the pattern. What comes next?', choices: shuffle(s.slice(0, Math.max(2, Math.max(...p) + 1)).concat(Math.max(...p) < 2 ? [s[2]] : [])).filter((v, i, a) => a.indexOf(v) === i), answer: ans,
    hint: 'Say the pattern out loud and find the part that repeats.', bigChoices: true}; };

// ---------------- adaptive selection ----------------
// Only the skills meant for the child's grade (curriculum.js sets each skill's grade range).
const gradeOk = id => { const [a, b] = skillRange(id), n = gradeNum(); return n >= a && n <= b; };
function enabledSkills(subject) { return Object.keys(SKILLS).filter(id => SKILLS[id].subject === subject && S.subjects[subject] && gradeOk(id) && (id !== 'r_aloud' || (S.readAloud && Bridge.canListen()))); }
function priority(id) { const s = sk(id); const base = SKILLS[id].weight;
  const h = (s.hist || []).slice(-10), acc = h.length >= 3 ? h.reduce((a, b) => a + b, 0) / h.length : s.seen ? s.correct / s.seen : 0.5;   // how she is doing lately
  let boost = 1; if (id === 'r_sight' && typeof practiceWords === 'function') boost += Math.min(1, practiceWords(10).length / 8);    // sight words she is learning pull this skill in
  const since = (Date.now() - (s.last || 0)) / 3.6e6; return base * boost * (1 + (5 - s.box) / 4) * (1.5 - acc) * (s.seen < 3 ? 1.4 : 1) * Math.min(2, 0.6 + since / 24); }
function weightedPick(ids, avoid) { const c = ids.filter(i => !avoid.has(i)); const pool = c.length ? c : ids; if (!pool.length) return null;
  const w = pool.map(priority); let r = Math.random() * w.reduce((a, b) => a + b, 0); for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return pool[i]; } return pool[pool.length - 1]; }
function planSession(n) {
  const rotate = ['science', 'art', 'social', 'science', 'art'];
  const slots = ['math', 'reading', 'writing', 'math', 'ROT', 'reading', 'math', 'writing', 'ROT', 'reading'];
  const out = [], used = new Set(); const sc = P.sessionCount || 0;
  for (let i = 0; i < n; i++) {
    let subj = slots[i % slots.length]; if (subj === 'ROT') subj = rotate[(sc + i) % rotate.length];
    if (subj === 'reading' && S.readAloud && Bridge.canListen() && sc % 2 === 0 && !used.has('r_aloud') && S.subjects.reading) { out.push('r_aloud'); used.add('r_aloud'); continue; }
    let ids = enabledSkills(subj).filter(id => id !== 'r_aloud');
    if (!ids.length) ids = Object.keys(SKILLS).filter(id => S.subjects[SKILLS[id].subject] && gradeOk(id) && id !== 'r_aloud');
    if (!ids.length) ids = ['m_add10'];
    const id = weightedPick(ids, used); used.add(id); out.push(id);
  }
  return out;
}
function makeItem(id) { for (let t = 0; t < 5; t++) { try { const it = G[id](); it.skill = id; return it; } catch (e) { console.error(id, e); } } return Object.assign(G.m_add10(), {skill: 'm_add10'}); }

// ---------------- session state & screens ----------------
let session = null;
function show(id) { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === id)); Bridge.stopSpeak(); }
function minutesToday() { return (P.usage[todayKey()] || 0); }
// Extra play minutes a grown-up allowed today ("let her earn more"), on top of the daily limit. Keyed by command id so both devices never double it.
function bonusToday() { const b = (P.bonus || {})[todayKey()] || {}; return Object.values(b).reduce((a, x) => a + (+x || 0), 0); }
const dailyCap = () => S.dailyMaxMinutes ? S.dailyMaxMinutes + bonusToday() : 0;
function inBedtime() { const [bs, be] = [S.bedtimeStart, S.bedtimeEnd]; if (!bs || !be || bs === be) return false; const now = new Date(); const m = now.getHours() * 60 + now.getMinutes();
  const t = s => { const [h, mm] = s.split(':').map(Number); return h * 60 + mm; }; const a = t(bs), b = t(be); return a < b ? (m >= a && m < b) : (m >= a || m < b); }

function renderHome() {
  if (!S.pin) return typeof openSetupWizard === 'function' ? openSetupWizard() : openParent(true);
  const st = Bridge.state();
  if ((st.parentUntil || 0) > Date.now()) return renderPlay();
  if (!st.locked && st.unlockUntil > Date.now()) return renderPlay();
  $('#hello').textContent = S.childName ? `Hi ${S.childName}!` : 'Hi there!';
  $('#stars').textContent = P.stars;
  $('#streakline').textContent = streakText();
  const cb = challengeAllowed(); $('#chBtn').style.display = cb === 'rest' ? 'none' : '';
  $('#shelfBtn').innerHTML = `🏆 My trophies: <b>${trophyCount()}</b>` + (treatsWaiting() ? ' · 🎁' : '');
  const left = dailyCap() ? Math.max(0, dailyCap() - minutesToday()) : Infinity;
  if (inBedtime()) { $('#homeMsg').innerHTML = '🌙 It\'s rest time now.<br>See you tomorrow!'; $('#startBtn').style.display = 'none'; }
  else if (left <= 0) { $('#homeMsg').innerHTML = '🎉 You used all your play time for today.<br>Great learning!<br><small>Want to keep learning? Ask a grown-up.</small>'; $('#startBtn').style.display = 'none'; }
  else { const m = Math.min(S.minutesPerUnlock, left); $('#homeMsg').innerHTML = `Answer <b>${S.questionsPerUnlock}</b> questions<br>to unlock <b>${m} minutes</b> of play!` + (bonusToday() && left !== Infinity ? `<br><small>⭐ Bonus time: you can earn <b>${left}</b> more minutes today</small>` : ''); $('#startBtn').style.display = ''; }
  show('home');
}
function streakText() { const days = new Set(P.sessions.map(s => s.date)); let n = 0; const d = new Date(); for (;;) { const k = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); if (days.has(k)) { n++; d.setDate(d.getDate() - 1); } else break; } return n > 1 ? `🔥 ${n}-day learning streak!` : ''; }

function startSession(practice = false) {
  const n = S.questionsPerUnlock; session = {plan: planSession(n), i: 0, firstTry: 0, start: Date.now(), results: [], practice};
  P.sessionCount = (P.sessionCount || 0) + 1; nextQuestion();
}
function nextQuestion() {
  if (session.i >= session.plan.length) return session.challenge ? finishChallenge() : finishSession();
  const it = makeItem(session.plan[session.i]); session.item = it; session.tries = 0;
  renderQuestion(it); show('quiz');
  if (S.readQuestions || S.carMode) { const q = it.type === 'aloud' && S.carMode ? 'Press the microphone and read this sentence: ' + it.text : it.say;
    session.qSpeakUntil = Date.now() + 350 + 700 + speakable(q).split(/\s+/).length * 450;   // rough length of the spoken question
    setTimeout(() => Bridge.speak(q), 350); }
  if (typeof carRepeat === 'function') carRepeat(it);
}
function renderQuestion(it) {
  const subj = SKILLS[it.skill].subject, si = SUBJECT_INFO[subj];
  $('#qbadge').innerHTML = session.challenge ? `${session.challenge.icon} ${session.challenge.name} · Level ${session.challenge.level}` : `${si.icon} ${si.name}`; $('#qbadge').style.background = session.challenge ? '#8A6300' : si.color;
  $('#dots').innerHTML = session.plan.map((_, i) => `<i class="${i < session.i ? 'done' : i === session.i ? 'cur' : ''}"></i>`).join('');
  $('#qprompt').innerHTML = it.prompt; $('#qvisual').innerHTML = it.visual || ''; $('#feedback').textContent = ''; $('#feedback').className = '';
  session.numReset = null;
  const A = $('#answers'); A.innerHTML = ''; A.className = 'answers t-' + it.type;
  $('.qbody').classList.toggle('split', it.type === 'number' || (it.type === 'tiles' && !!it.visual));
  if (it.type === 'choice') {
    it.choices.forEach((c, i) => { const b = document.createElement('button'); b.className = 'choice' + (it.wordChoices ? ' wordc' : '') + (it.bigChoices ? ' bigc' : '') + (it.choiceHTML ? ' pic' : '');
      b.innerHTML = it.choiceHTML ? it.choiceHTML[i] : esc(c); b.onclick = () => { if (it.speakChoices && Date.now() > (session.qSpeakUntil || 0)) Bridge.speak(c); answer(c, b); }; A.appendChild(b); });
  } else if (it.type === 'number') {
    A.innerHTML = `<div class="numdisp" id="numdisp">&nbsp;</div><div class="pad">${[1,2,3,4,5,6,7,8,9].map(d => `<button data-d="${d}">${d}</button>`).join('')}<button data-d="del" class="del">⌫</button><button data-d="0">0</button><button data-d="ok" class="ok">✔</button></div>`;
    let v = ''; A.querySelectorAll('.pad button').forEach(b => b.onclick = () => { const d = b.dataset.d; if (d === 'del') v = v.slice(0, -1); else if (d === 'ok') { if (v) answer(v, b); return; } else if (v.length < (it.maxLen || 3)) v += d; $('#numdisp').innerHTML = v || '&nbsp;'; session.numReset = () => { v = ''; if ($('#numdisp')) $('#numdisp').innerHTML = '&nbsp;'; }; });
  } else if (it.type === 'tiles') {
    A.innerHTML = `<div class="slots" id="slots"></div><div class="tiles" id="tiles"></div><div class="row"><button class="small-btn" id="tclear">↺ Clear</button><button class="small-btn ok" id="tok">✔ Check</button></div>`;
    const placed = []; const drawT = () => {
      $('#slots').innerHTML = placed.length ? placed.map((p, i) => `<button class="tile ${it.letters ? 'let' : ''}" data-i="${i}">${esc(it.tiles[p])}</button>`).join('') : '<span class="ph">Tap the tiles below</span>';
      $('#tiles').innerHTML = it.tiles.map((t, i) => `<button class="tile ${it.letters ? 'let' : ''} ${placed.includes(i) ? 'used' : ''}" data-i="${i}">${esc(t)}</button>`).join('');
      $('#tiles').querySelectorAll('.tile').forEach(b => b.onclick = () => { const i = +b.dataset.i; if (!placed.includes(i)) { placed.push(i); if (!it.letters) Bridge.speak(it.tiles[i]); drawT(); } });
      $('#slots').querySelectorAll('.tile').forEach(b => b.onclick = () => { placed.splice(+b.dataset.i, 1); drawT(); }); };
    drawT(); $('#tclear').onclick = () => { placed.length = 0; drawT(); };
    $('#tok').onclick = () => { const need = it.answer.length; if (placed.length < need) { feedback('Use more tiles!', 'warn'); return; } answer(placed.map(p => it.tiles[p]).join(it.join), $('#tok')); };
    session.numReset = () => { placed.length = 0; drawT(); };
  } else if (it.type === 'aloud') {
    const words = it.text.split(' ');
    A.innerHTML = `<div class="readtext" id="readtext">${words.map((w, i) => `<span data-i="${i}">${esc(w)}</span>`).join(' ')}</div>
      <button class="mic" id="micBtn">🎤 <span>Tap and read</span></button><div class="row" id="aloudExtra"></div>`;
    $('#micBtn').onclick = () => doListen(it);
  }
}
function feedback(t, cls) { const f = $('#feedback'); f.textContent = t; f.className = cls; }
function answer(val, btn) {
  const it = session.item; if (session.locked) return; const correct = String(val) === String(it.type === 'tiles' ? it.answer.join(it.join) : it.answer);
  session.tries++;
  if (correct) {
    session.locked = true; if (btn) btn.classList.add('right');
    const msg = pick(PRAISE); feedback('⭐ ' + msg + (it.explain ? '  ' + it.explain : ''), 'good');
    const say = msg + (it.readBack ? ' ' + val : '') + (it.explain ? ' ' + it.explain.replace(/—/g, ',') : '');
    Bridge.speak(say); record(it.skill, session.tries === 1); confetti(session.tries === 1 ? 18 : 8);
    setTimeout(() => { session.locked = false; session.i++; nextQuestion(); }, 1900);
  } else {
    if (btn) { btn.classList.add('wrong'); setTimeout(() => btn.classList.remove('wrong'), 600); }
    if (session.numReset) setTimeout(session.numReset, 500);
    if (session.tries === 1) { const t = pick(TRYAGAIN); feedback(t + ' 💡 ' + it.hint, 'warn'); Bridge.speak(t + ' ' + it.hint); }
    else { // reveal, then she taps the right one to continue
      const ansTxt = it.type === 'tiles' ? it.answer.join(it.join) : it.answer;
      feedback(`The answer is ${ansTxt}. ${it.type === 'choice' ? 'Tap it to go on.' : 'Type it to go on.'}`, 'reveal');
      Bridge.speak(it.noSpeakAnswer && it.type === 'choice' ? 'Here is the answer. Tap it to go on.' : `The answer is ${ansTxt}.`);
      if (it.type === 'choice') document.querySelectorAll('.choice').forEach(b => { const i = [...b.parentNode.children].indexOf(b); if (it.choices[i] === String(it.answer)) b.classList.add('hintglow'); });
      if (!session.missedQueued) { session.missedQueued = 0; }
      if (session.tries === 2 && session.plan.length < S.questionsPerUnlock + 2 && !session.practice) { session.plan.push(it.skill); session.missedQueued++; } // one more try at that skill later
    }
  }
}
function record(id, first) { const s = initLvl(sk(id), id);
  if (!session.challenge || session.challenge.difficulty === s.lvl) levelStep(s, first, id);   // challenge questions at another level don't move her daily level
  s.seen++; if (first) { s.correct++; s.streak++; s.box = Math.min(5, s.box + 1); } else { s.streak = 0; s.box = Math.max(0, s.box - 1); }
  s.last = Date.now(); s.hist = (s.hist || []).concat(first ? 1 : 0).slice(-20); session.results.push({skill: id, first}); if (first) { session.firstTry++; P.stars++; } saveAll(); }

// read-aloud
const NUMW = {'1':'one','2':'two','3':'three','4':'four','5':'five','6':'six','7':'seven','8':'eight','9':'nine','10':'ten'};
const norm = s => s.toLowerCase().replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean).map(w => NUMW[w] || w);
function scoreRead(target, alts) { const tw = norm(target); let best = {score: 0, hit: []};
  for (const a of alts) { const aw = norm(a); const hit = new Array(tw.length).fill(false); let j = 0;
    for (let i = 0; i < tw.length; i++) { for (let k = j; k < Math.min(aw.length, j + 4); k++) { if (aw[k] === tw[i] || (tw[i].length > 3 && aw[k].startsWith(tw[i].slice(0, 3)))) { hit[i] = true; j = k + 1; break; } } }
    const sc = hit.filter(Boolean).length / tw.length; if (sc > best.score) best = {score: sc, hit}; }
  return best; }
function doListen(it) {
  const btn = $('#micBtn'); if (btn.classList.contains('listening')) return; Bridge.stopSpeak();
  btn.classList.add('listening'); btn.querySelector('span').textContent = 'Listening… read now!';
  Bridge.listen(alts => { btn.classList.remove('listening'); btn.querySelector('span').textContent = 'Tap and read again';
    const r = scoreRead(it.text, alts); document.querySelectorAll('#readtext span').forEach((s, i) => s.className = r.hit[i] ? 'hit' : 'miss');
    if (session.tries === 0 && typeof wordsFromRead === 'function') wordsFromRead(it.text, r.hit);   // first try feeds her sight-word list
    session.tries++; const pass = r.score >= (level('r_aloud') === 1 ? 0.7 : 0.8);
    if (pass) { session.locked = true; const msg = pick(PRAISE) + ' Beautiful reading!'; feedback('⭐ ' + msg, 'good'); Bridge.speak(msg); record(it.skill, session.tries === 1); confetti(20); setTimeout(() => { session.locked = false; session.i++; nextQuestion(); }, 2200); }
    else if (session.tries < 3) { const miss = norm(it.text).filter((w, i) => !r.hit[i]); feedback(`Good try! Let's practice: ${miss.slice(0, 3).join(', ')}`, 'warn'); Bridge.speak(`Good try! Listen: ${it.text}. Now you try.`); }
    else { feedback('Nice effort! Ask a grown-up to check, or skip.', 'reveal'); aloudFallback(it, r.score >= 0.5); }
  }, err => { btn.classList.remove('listening'); btn.querySelector('span').textContent = 'Tap and read'; feedback('I could not hear you. Try again, a little louder!', 'warn');
    if (++session.tries >= 3) aloudFallback(it, false); });
}
function aloudFallback(it, effort) {
  $('#aloudExtra').innerHTML = `<button class="small-btn" id="grownup">👩 Grown-up check</button><button class="small-btn" id="skipA">⏭ Skip</button>`;
  $('#grownup').onclick = () => askPin(ok => { if (ok) { record(it.skill, false); session.i++; nextQuestion(); } });
  $('#skipA').onclick = () => { if (effort) record(it.skill, false); session.plan[session.i] = weightedPick(enabledSkills('reading').filter(x => x !== 'r_aloud'), new Set()); nextQuestion(); };
}

function finishSession() {
  if (session.challenge) return finishChallenge();
  const dur = Math.round((Date.now() - session.start) / 1000); const n = session.results.length; const ok = session.firstTry;
  const left = dailyCap() ? Math.max(0, dailyCap() - minutesToday()) : 999;
  const mins = session.practice ? 0 : Math.min(S.minutesPerUnlock, left);
  P.sessions.push({date: todayKey(), t: Date.now(), n, ok, dur, mins, skills: session.results}); P.sessions = P.sessions.slice(-400);
  if (mins) P.usage[todayKey()] = minutesToday() + mins; saveAll();
  $('#rewardTitle').textContent = ok === n ? 'PERFECT! 🌟' : 'You did it! 🎉';
  $('#rewardText').innerHTML = `You got <b>${ok}</b> of <b>${n}</b> right on the first try.<br>` + (mins ? `You earned <b>${mins} minutes</b> of play!` : 'Extra practice = extra stars!');
  $('#rewardStars').textContent = '⭐'.repeat(Math.min(ok, 10));
  $('#playBtn').textContent = mins ? `▶ Let's play!` : 'Done';
  $('#playBtn').onclick = () => { if (mins) { Bridge.unlock(mins); renderPlay(); } else renderHome(); };
  show('reward'); confetti(60); Bridge.speak(`${ok === n ? 'Perfect!' : 'You did it!'} You earned ${mins} minutes of play time.`);
}

// play screen (shown when app is the home launcher and time is unlocked)
let playTimer = null;
function renderPlay() {
  const st = Bridge.state(); const parent = (st.parentUntil || 0) > Date.now();
  if (Bridge.native && !parent && (st.locked || st.unlockUntil <= Date.now())) return renderHome();
  const until = () => { const s = Bridge.state(); return (s.parentUntil || 0) > Date.now() ? s.parentUntil : s.unlockUntil; };
  $('#playLabel').textContent = parent ? '🔑 Parent mode — whole tablet open:' : '⏰ Play time left:';
  $('#playLearn').style.display = parent ? 'none' : '';
  $('#endParent').style.display = parent ? '' : 'none';
  $('#playheadBar').classList.toggle('parent', parent);
  const apps = Bridge.apps(parent ? true : false);
  if (st.ios) { // iPad: apps can't be launched from here; Screen Time shields are lifted instead
    $('#appgrid').innerHTML = `<div class="iosplay"><div class="mascot">🎉</div><h2>${parent ? 'The iPad is open for you.' : 'Your apps are open!'}</h2>
      <p>${st.basic ? 'Ask a grown-up to end Guided Access (triple-click the side button), then open your app.' : 'Swipe up to go Home and open your app.<br>When the time is up, they lock again.'}</p></div>`;
  } else
  $('#appgrid').innerHTML = apps.length ? apps.map(a => `<button class="app" data-p="${esc(a.pkg)}">${a.icon ? `<img src="${a.icon}">` : '📱'}<span>${esc(a.label)}</span></button>`).join('') :
    `<p class="muted">${Bridge.native ? 'A grown-up can pick apps in the Grown-ups area.' : 'Web preview: on the tablet, the apps a grown-up picked appear here.'}</p>`;
  document.querySelectorAll('#appgrid .app').forEach(b => b.onclick = () => Bridge.launch(b.dataset.p));
  const tick = () => { const ms = (until() || Date.now() + S.minutesPerUnlock * 60000) - Date.now(); if (Bridge.native && ms <= 0) { clearInterval(playTimer); return renderHome(); }
    const m = Math.max(0, Math.floor(ms / 60000)), sec = Math.max(0, Math.floor(ms / 1000) % 60); $('#timeLeft').textContent = `${m}:${String(sec).padStart(2, '0')}`; };
  clearInterval(playTimer); tick(); playTimer = setInterval(tick, 1000); show('play');
}

// ---------------- parent area ----------------
function askPin(cb, title = 'Grown-ups only') {
  const locked = () => S.pinLock.until > Date.now();
  const lockMsg = () => `Too many tries. Wait ${Math.ceil((S.pinLock.until - Date.now()) / 60000)} min.`;
  const len = S.pinLen === 6 ? 6 : 4; let busy = false;
  $('#pinTitle').textContent = locked() ? lockMsg() : title; let v = ''; const d = $('#pinDots'); const draw = () => d.textContent = '●'.repeat(v.length) + '○'.repeat(len - v.length); draw();
  $('#pinPad').innerHTML = [1,2,3,4,5,6,7,8,9,'✕',0,'⌫'].map(k => `<button data-k="${k}">${k}</button>`).join('');
  const prev = document.querySelector('.screen.on')?.id;
  $('#pinPad').querySelectorAll('button').forEach(b => b.onclick = () => { const k = b.dataset.k; if (busy) return;
    if (k === '✕') { $('#pinModal').classList.remove('on'); return cb(false); }
    if (k === '⌫') v = v.slice(0, -1); else if (v.length < len) v += k; draw();
    if (locked()) { v = ''; $('#pinTitle').textContent = lockMsg(); draw(); return; }
    if (v.length === len) { busy = true; pinCheck(v).then(ok => { busy = false;
      if (ok) { S.pinLock = {fails: 0, until: 0}; Bridge.save('settings', S); $('#pinModal').classList.remove('on'); cb(true); }
      else { v = ''; const f = ++S.pinLock.fails; if (f >= 5) { S.pinLock.until = Date.now() + Math.min(15, Math.pow(2, f - 5)) * 60000; $('#pinTitle').textContent = lockMsg(); }
        Bridge.save('settings', S); d.classList.add('shake'); setTimeout(() => { d.classList.remove('shake'); draw(); }, 500); } }); } });
  $('#pinModal').classList.add('on');
}
function askDigits(cb, title) {   // 4–6 digits that are checked elsewhere (the dashboard PIN is checked by the family's Sheet)
  let v = ''; const d = $('#pinDots'); const draw = () => d.textContent = v.length ? '●'.repeat(v.length) : '○○○○'; draw(); $('#pinTitle').textContent = title;
  $('#pinPad').innerHTML = [1,2,3,4,5,6,7,8,9,'✕',0,'⌫','✓'].map(k => `<button data-k="${k}"${k === '✓' ? ' class="pinok"' : ''}>${k}</button>`).join('');
  $('#pinPad').querySelectorAll('button').forEach(b => b.onclick = () => { const k = b.dataset.k;
    if (k === '✕') { $('#pinModal').classList.remove('on'); return cb(false); }
    if (k === '✓') { if (!PIN_RE.test(v)) { d.classList.add('shake'); setTimeout(() => d.classList.remove('shake'), 500); return; } $('#pinModal').classList.remove('on'); return cb(true, v); }
    if (k === '⌫') v = v.slice(0, -1); else if (v.length < 6) v += k; draw(); });
  $('#pinModal').classList.add('on');
}
function openParent(firstRun) {
  if (firstRun) return renderParent(true);
  askPin(ok => ok && renderParent(false));
}
function renderParent(firstRun) {
  const st = Bridge.state(); const subj = Object.keys(SUBJECT_INFO);
  const setupRows = st.ios ? (st.basic ? [
    ['mic', 'Allow microphone + speech (for reading out loud)', st.micOk],
    ['guided', 'Keep her in this app: Settings → Accessibility → Guided Access ON, then triple-click the side button here', true]
  ] : [
    ['screentime', 'Turn on Screen Time control (approve with your passcode)', st.screenTimeOk],
    ['pickapps', `Choose the apps that need learning first (${st.appsPicked || 0} chosen)`, (st.appsPicked || 0) > 0],
    ['mic', 'Allow microphone + speech (for reading out loud)', st.micOk]
  ]) : Bridge.native ? [
    ['home', 'Make this the Home app (required)', st.isHome],
    ['overlay', 'Allow "Display over other apps" (required)', st.overlayOk],
    ['mic', 'Allow microphone (for reading out loud)', st.micOk],
    ['battery', 'Don\'t let Android put this app to sleep', st.batteryOk],
    ['usage', 'Allow usage access (to see which app is open)', st.usageOk],
    ['brightness', 'Allow changing screen brightness', st.writeSettingsOk]
  ] : [];
  const bySubj = {}; Object.keys(SKILLS).forEach(id => { (bySubj[SKILLS[id].subject] = bySubj[SKILLS[id].subject] || []).push(id); });
  const skillRows = subj.map(s => `<tr class="sh"><td colspan="4">${SUBJECT_INFO[s].icon} ${SUBJECT_INFO[s].name}</td></tr>` + (bySubj[s] || []).filter(gradeOk).map(id => { const x = sk(id); const recent = (x.hist || []); const ra = recent.length ? Math.round(100 * recent.reduce((a, b) => a + b, 0) / recent.length) : null;
    return `<tr><td>${SKILLS[id].label}<small> ${SKILLS[id].std}</small></td><td>${x.seen}</td><td>${ra === null ? '–' : ra + '%'}</td><td>${'★'.repeat(x.box)}${'☆'.repeat(5 - x.box)}</td></tr>`; }).join('')).join('');
  const last7 = {}; P.sessions.forEach(s => { if (Date.now() - s.t < 7 * 864e5) { const e = last7[s.date] = last7[s.date] || {n: 0, ok: 0, q: 0, mins: 0, dur: 0}; e.n++; e.q += s.n; e.ok += s.ok; e.mins += s.mins; e.dur += s.dur; } });
  const weak = Object.keys(SKILLS).filter(id => sk(id).seen >= 3).sort((a, b) => (sk(a).correct / sk(a).seen) - (sk(b).correct / sk(b).seen)).slice(0, 5);
  $('#parentBody').innerHTML = `
    ${Bridge.native ? '' : '<div class="card"><h3>🌐 Web preview</h3><p>All the learning works here, but this page <b>can\'t lock the device</b>. Use Guided Access on an iPad, or the Android tablet app for the lock. See the guide: "Web preview or tablet app?"</p></div>'}
    ${firstRun ? '<div class="card hl"><h3>Welcome! Set a grown-up PIN (4 or 6 digits)</h3><p>The PIN protects these settings and lets you unlock the tablet any time.</p></div>' : ''}
    <div class="card"><h3>PIN</h3><input id="pinNew" type="password" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="${S.pin ? 'Change PIN (4 or 6 digits)' : 'New PIN (4 or 6 digits)'}">
      <p class="muted">6 digits is stronger. The PIN keeps your child out of Grown-ups; it stays on this device only and is never sent to your Sheet. Each device has its own PIN.</p></div>
    ${setupRows.length ? `<div class="card"><h3>Tablet setup</h3>${setupRows.map(r => `<div class="setrow"><span>${r[2] ? '✅' : '⚠️'} ${r[1]}</span>${r[0] === 'guided' ? '' : r[0] === 'pickapps' ? `<button class="small-btn" data-setup="pickapps">${r[2] ? 'Change' : 'Choose'}</button>` : r[2] ? '' : `<button class="small-btn" data-setup="${r[0]}">Fix</button>`}</div>`).join('')}</div>` : ''}
    <div class="card"><h3>🆘 Help button (always works, even when locked or at rest time)</h3>
      <label>Who ${esc(kidName())} calls <input id="hName" value="${esc(S.helpName)}" placeholder="e.g. Mom, Dad, Grandma"></label>
      <label>Phone number <input id="hPhone" inputmode="tel" value="${esc(S.helpPhone)}" placeholder="+1 408 555 0123"></label>
      <label>FaceTime address for iPad/iPhone (phone number or Apple ID email; blank = the phone number above) <input id="hFT" autocapitalize="off" value="${esc(S.faceTimeId || '')}" placeholder="+1 408 555 0123 or name@icloud.com"></label>
      <label class="chk"><input id="hFTv" type="checkbox" ${S.faceTimeVideo !== false ? 'checked' : ''}> FaceTime with video (off = FaceTime audio only)</label>
      <label class="chk"><input id="hWA" type="checkbox" ${S.helpWhatsApp ? 'checked' : ''}> Show a WhatsApp button (same number)</label>
      <label class="chk"><input id="hWAalways" type="checkbox" ${S.alwaysWhatsApp ? 'checked' : ''}> Never block WhatsApp, so your calls always ring through</label>
      <p class="muted">${(() => { const h = Bridge.helpInfo(); return st.ios ? 'iPad: the call button opens FaceTime (video or audio, set below). iPads can\'t call 911 unless paired with an iPhone.' : (h.canPhone ? (h.callPerm ? 'This tablet can place phone calls: one tap rings you.' : 'This tablet can place phone calls. Allow phone calls so one tap rings you: <button class="small-btn" data-setup="callperm">Allow</button>') : 'This tablet has no phone service. Use the WhatsApp button for calls; 911 needs a phone line.'); })()}</p>
      <div class="row"><button class="small-btn" id="hTest">Test: open the Help screen</button></div>
    </div>
    ${parentTreatCard()}
    ${syncCard(st)}
    <div class="card"><h3>Rules</h3>
      <label>Child's name <input id="sName" value="${esc(S.childName)}"></label>
      <label>Questions to unlock <input id="sQ" type="number" min="3" max="10" value="${S.questionsPerUnlock}"></label>
      <label>Minutes earned per unlock <input id="sM" type="number" min="5" max="120" value="${S.minutesPerUnlock}"></label>
      <label>Daily play limit (minutes, 0 = none) <input id="sD" type="number" min="0" max="600" value="${S.dailyMaxMinutes}"></label>
      <label>Rest time starts <input id="sB1" type="time" value="${S.bedtimeStart}"></label>
      <label>Rest time ends <input id="sB2" type="time" value="${S.bedtimeEnd}"></label>
      <label>Loudest volume ${esc(kidName())} can choose (%) <input id="sVC" type="number" min="10" max="100" step="10" value="${S.volumeCapPct}"></label>
      <label class="chk"><input id="sMic" type="checkbox" ${S.micOn ? 'checked' : ''}> 🎤 Use the microphone for reading out loud</label>
      <p class="muted">${Bridge.native && !Bridge.state().ios ? 'On this tablet, speech is recognised on the device when Android has the offline English voice; otherwise Android may send it to Google to be recognised.' : 'In a web browser, Chrome sends what your child says to Google, and Safari to Apple, to turn it into text. Nothing is recorded or kept by Learning Gate.'} Turn it off and stories are read to your child instead.</p>
      <label class="chk"><input id="sRA" type="checkbox" ${S.readAloud ? 'checked' : ''}> Read-out-loud practice ${Bridge.canListen() ? '' : '<small>(no speech recognizer found)</small>'}</label>
      <label class="chk"><input id="sRQ" type="checkbox" ${S.readQuestions ? 'checked' : ''}> Read each question aloud</label>
      <div class="subjs">${subj.map(s => `<label class="chk"><input type="checkbox" data-subj="${s}" ${S.subjects[s] ? 'checked' : ''}> ${SUBJECT_INFO[s].icon} ${SUBJECT_INFO[s].name}</label>`).join('')}</div>
    </div>
    ${Bridge.native && !st.ios ? `<div class="card"><h3>Apps ${esc(kidName())} can use after unlocking</h3><div id="appPick">${Bridge.apps(true).map(a => `<label class="chk app-chk"><input type="checkbox" data-pkg="${esc(a.pkg)}" ${a.allowed ? 'checked' : ''}> ${a.icon ? `<img src="${a.icon}">` : ''} ${esc(a.label)}</label>`).join('')}</div></div>` : ''}
    <div class="card"><h3>Right now</h3><p>${st.web ? 'Web preview' : (st.locked || st.unlockUntil < Date.now() ? '🔒 Locked' : `🔓 Unlocked until ${new Date(st.unlockUntil).toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'})}`)} · Play time used today: ${minutesToday()} min</p>
      <div class="row"><button class="small-btn" id="pLock">🔒 Lock now</button><button class="small-btn" id="pUnl">🔓 Give ${esc(kidName())} 30 min</button>${st.ios && st.basic ? '' : '<button class="small-btn" id="pPM30">🔑 Parent mode 30 min</button><button class="small-btn" id="pPM120">🔑 Parent mode 2 h</button>'}<button class="small-btn" id="pPractice">🎯 Practice (no unlock)</button></div></div>
    <div class="card"><h3>Last 7 days</h3>${Object.keys(last7).length ? `<table><tr><th>Day</th><th>Sessions</th><th>First-try right</th><th>Play earned</th></tr>${Object.entries(last7).sort().reverse().map(([d, e]) => `<tr><td>${d}</td><td>${e.n}</td><td>${e.ok}/${e.q} (${Math.round(100 * e.ok / e.q)}%)</td><td>${e.mins} min</td></tr>`).join('')}</table>` : '<p class="muted">No sessions yet.</p>'}
      ${weak.length ? `<p><b>Needs the most practice:</b> ${weak.map(id => SKILLS[id].label).join(', ')}</p>` : ''}<p>Total stars: ⭐ ${P.stars}</p></div>
    <div class="card"><h3>Skills</h3><p class="muted">Stars = mastery level (0–5). The app gives more questions on skills with fewer stars and on skills your child finds hard lately.</p><table class="skills"><tr><th>Skill</th><th>Tried</th><th>Recent</th><th>Mastery</th></tr>${skillRows}</table></div>
    <div class="card"><button class="small-btn danger" id="pReset">Reset progress</button></div>`;
  document.querySelectorAll('[data-setup]').forEach(b => b.onclick = () => Bridge.setup(b.dataset.setup));
  $('#hTest').onclick = () => { saveParent(); openHelp(); };
  $('#sTest').onclick = () => { if (!saveParent()) return; if (S.deviceRole === 'parent') return renderParentView(); trySync().then(ok => { renderParent(false); alert(ok ? 'Sent! Check the Sessions tab in your Google Sheet.' : 'Could not send. Check the internet connection, URL and secret.'); }); };
  if ($('#sView')) $('#sView').onclick = () => { if (saveParent()) renderParentView(); };
  if ($('#sDashPinSet')) $('#sDashPinSet').onclick = () => { const p = $('#sDashPin').value.trim(), note = $('#sDashNote');
    if (!PIN_RE.test(p)) return note.textContent = 'The remote-control PIN must be 4 or 6 digits.'; if (easyPin(p)) return note.textContent = 'That PIN is too easy to guess. Please pick another.';
    if (!saveParent() || !syncReady()) return; note.textContent = 'Saving…';
    syncPost({action: 'setpin', pin: p}).then(r => { $('#sDashPin').value = ''; note.textContent = r && r.ok ? '✅ Remote-control PIN saved in your Sheet.' : 'Could not save: ' + (r && r.error === 'secret' ? 'the secret does not match your script.' : 'please update your Sheet script to v0.3.2 (FAMILY_SETUP.md).'); })
      .catch(() => { note.textContent = 'Could not reach your Sheet. Check the internet connection and the web app URL.'; }); };
  $('#tGive').onclick = () => { if (!treatsWaiting()) return; saveParent(); P.treatsGiven++; P.treatLog.push(Date.now()); saveAll(); renderParent(false); };
  $('#pLock').onclick = () => { saveParent(); Bridge.lockNow(); renderHome(); };
  $('#pUnl').onclick = () => { saveParent(); Bridge.unlock(30); renderPlay(); };
  const pm = m => { saveParent(); Bridge.parentMode(m); renderPlay(); };
  if ($('#pPM30')) { $('#pPM30').onclick = () => pm(30); $('#pPM120').onclick = () => pm(120); }
  $('#pPractice').onclick = () => { saveParent(); startSession(true); };
  $('#pReset').onclick = () => { if (confirm('Erase all progress?')) { P = {skills: {}, sessions: [], stars: 0, usage: {}, sessionCount: 0}; saveAll(); renderParent(false); } };
  $('#parentDone').onclick = () => { if (saveParent()) renderHome(); };
  show('parent');
}
function saveParent() {
  const np = $('#pinNew').value.trim(); if (np) { if (!PIN_RE.test(np)) { alert('The PIN must be 4 or 6 digits.'); return false; } if (easyPin(np)) { alert('That PIN is too easy to guess. Please pick another.'); return false; } setPin(np); }
  if (!S.pin) { alert('Please set a PIN (4 or 6 digits) first.'); return false; }
  S.childName = ($('#sName').value.trim() || S.childName).slice(0, 30); S.questionsPerUnlock = Math.max(3, Math.min(10, +$('#sQ').value || 5));
  S.minutesPerUnlock = Math.max(5, Math.min(120, +$('#sM').value || 20)); S.dailyMaxMinutes = Math.max(0, +$('#sD').value || 0);
  saveTreatSettings(); saveSyncSettings();
  S.helpName = $('#hName').value.trim().slice(0, 30); S.helpPhone = $('#hPhone').value.trim(); S.faceTimeId = $('#hFT').value.trim(); S.faceTimeVideo = $('#hFTv').checked; S.helpWhatsApp = $('#hWA').checked; S.alwaysWhatsApp = $('#hWAalways').checked;
  Bridge.setSafetyApps(S.alwaysWhatsApp ? ['com.whatsapp'] : []);
  S.volumeCapPct = Math.max(10, Math.min(100, +$('#sVC').value || 80)); Bridge.volumeCap(S.volumeCapPct);
  S.bedtimeStart = $('#sB1').value; S.bedtimeEnd = $('#sB2').value; S.readAloud = $('#sRA').checked; if ($('#sMic')) S.micOn = $('#sMic').checked; S.readQuestions = $('#sRQ').checked;
  document.querySelectorAll('[data-subj]').forEach(c => S.subjects[c.dataset.subj] = c.checked);
  if (!Object.values(S.subjects).some(Boolean)) S.subjects.math = true;
  const ap = document.querySelectorAll('[data-pkg]'); if (ap.length) Bridge.setAllowedApps([...ap].filter(c => c.checked).map(c => c.dataset.pkg));
  saveAll(); return true;
}

// ---------------- Help / emergency ----------------
function openHelp() {
  Bridge.stopSpeak();
  const h = Bridge.helpInfo(), st = Bridge.state(), who = esc(helperName()), num = (S.helpPhone || '').trim();
  let btns = '';
  if (num) {
    btns += st.ios ? `<button class="helpbtn call" id="hCall">${S.faceTimeVideo !== false ? '📹' : '📞'} FaceTime ${who}</button>` : `<button class="helpbtn call" id="hCall">📞 Call ${who}</button>`;
    if (S.helpWhatsApp && (h.hasWhatsApp || st.ios)) btns += `<button class="helpbtn wa" id="hWAbtn">💬 WhatsApp ${who}</button>`;
  } else btns += `<p class="muted">A grown-up needs to add a phone number in the Grown-ups area.</p>`;
  btns += `<button class="helpbtn sos" id="h911">🚑 Call 911</button>`;
  $('#helpBtns').innerHTML = btns;
  $('#helpNote').textContent = st.ios ? 'If you are hurt, scared or lost, call your grown-up.' : 'If you are hurt, scared or lost, press a button. You will not get in trouble.';
  if ($('#hCall')) $('#hCall').onclick = () => { st.ios ? Bridge.faceTime((S.faceTimeId || '').trim() || num, S.faceTimeVideo !== false) : Bridge.callNumber(num); };
  if ($('#hWAbtn')) $('#hWAbtn').onclick = () => Bridge.whatsapp(num);
  $('#h911').onclick = () => { $('#h911').textContent = '🚑 Opening… press the green button'; Bridge.dialEmergency(); };
  $('#helpModal').classList.add('on');
  Bridge.speak('Do you need help? Press a button to call ' + helperName() + '.');
}

// ---------------- volume + brightness panel ----------------
const BSTEPS = [20, 50, 90, 140, 200, 255];
function drawLevels() {
  const v = Bridge.volume(0), b = Bridge.brightness(null);
  const vn = Math.round(10 * v.vol / v.max), bn = Math.max(1, Math.round(6 * b.b / 255));
  $('#volBars').innerHTML = Array.from({length: 10}, (_, i) => `<i class="${i < vn ? 'on' : ''}" style="height:${14 + i * 4}px"></i>`).join('');
  $('#briBars').innerHTML = Array.from({length: 6}, (_, i) => `<i class="${i < bn ? 'on' : ''}"></i>`).join('');
  $('#volIcon').textContent = v.vol === 0 ? '🔇' : vn < 4 ? '🔈' : vn < 8 ? '🔉' : '🔊';
}
function openControls() { drawLevels(); $('#ctrlModal').classList.add('on'); }
function stepBrightness(dir) { const b = Bridge.brightness(null).b; let i = BSTEPS.findIndex(x => x >= b - 5); if (i < 0) i = BSTEPS.length - 1; i = Math.max(0, Math.min(BSTEPS.length - 1, i + dir)); Bridge.brightness(BSTEPS[i]); drawLevels(); }

// ---------------- fx ----------------
function confetti(n) { const c = $('#fx'); for (let i = 0; i < n; i++) { const p = document.createElement('i'); p.textContent = pick(['⭐', '🌟', '✨', '🎉', '💜', '💛']);
  p.style.left = R(5, 95) + '%'; p.style.animationDelay = (Math.random() * 0.4) + 's'; p.style.fontSize = R(18, 34) + 'px'; c.appendChild(p); setTimeout(() => p.remove(), 2200); } }

// ---------------- wiring ----------------
window.onNativeResume = () => { const on = document.querySelector('.screen.on')?.id; if (['quiz', 'parent', 'reward', 'challenges', 'chresult', 'shelf'].includes(on)) return; renderHome(); };
window.addEventListener('DOMContentLoaded', () => {
  $('#startBtn').onclick = () => startSession(false);
  $('#sayAgain').onclick = () => Bridge.speak(session.item.type === 'aloud' ? session.item.text : session.item.say);
  let hold; const g = $('#gear'); const end = () => { clearTimeout(hold); hold = null; };
  const startHold = e => { e.preventDefault(); end(); hold = setTimeout(() => { hold = null; openParent(false); }, 1200); };
  g.addEventListener('touchstart', startHold, {passive: false}); g.addEventListener('mousedown', startHold);
  ['touchend', 'touchcancel', 'mouseup', 'mouseleave'].forEach(ev => g.addEventListener(ev, end)); g.addEventListener('contextmenu', e => e.preventDefault());
  $('#playLearn').onclick = () => renderChallenges();
  $('#chBtn').onclick = () => renderChallenges();
  $('#shelfBtn').onclick = () => renderShelf();
  $('#chBack').onclick = () => renderHome(); $('#shelfBack').onclick = () => renderHome(); $('#chDone').onclick = () => renderChallenges();
  $('#chShelf').onclick = () => renderShelf();
  $('#carToggle').onclick = () => { S.carMode = !S.carMode; saveAll(); renderChallenges(); };
  document.querySelectorAll('.ctrlBtn').forEach(b => b.onclick = openControls);
  document.querySelectorAll('.helpOpen').forEach(b => b.onclick = openHelp);
  $('#helpClose').onclick = () => $('#helpModal').classList.remove('on');
  $('#volDown').onclick = () => { Bridge.volume(-1); drawLevels(); Bridge.speak('quieter'); };
  $('#volUp').onclick = () => { Bridge.volume(1); drawLevels(); Bridge.speak('louder'); };
  $('#briDown').onclick = () => stepBrightness(-1);
  $('#briUp').onclick = () => stepBrightness(1);
  $('#ctrlClose').onclick = () => $('#ctrlModal').classList.remove('on');
  $('#ctrlModal').onclick = e => { if (e.target.id === 'ctrlModal') $('#ctrlModal').classList.remove('on'); };
  Bridge.volumeCap(S.volumeCapPct);
  $('#playParent').onclick = () => openParent(false);
  $('#endParent').onclick = () => { Bridge.lockNow(); renderHome(); };
  $('#openSettings').onclick = () => Bridge.setup('settings');
  saveAll(); renderHome();
});

// expose for tests
window.__LG = {G, SKILLS, planSession, makeItem, scoreRead, S, P: () => P};
