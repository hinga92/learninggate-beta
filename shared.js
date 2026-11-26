/* 1) One progress for the child on every device (tablet + iPad), shared through the family's own Google Sheet.
   2) Grown-up key: press and hold 🔑 on any activity screen → PIN → stop, open Grown-ups, give play, Parent mode. */
'use strict';

// ---------------------------------------------------------------------------
// 1. Shared progress + shared settings
// ---------------------------------------------------------------------------
const LOCAL_ONLY_P = ['syncedT', 'remoteLastId', 'bookTimer', 'events', 'syncBase', 'lastSync'];
// The grown-up PIN (and its length) never leaves the device: each device keeps its own (audit H-1).
const LOCAL_ONLY_S = ['deviceName', 'deviceRole', 'syncUrl', 'syncKey', 'pin', 'pinLen', 'pinLock', 'settingsT', 'micOn'];
const myDevice = () => S.deviceName || defaultDeviceName();
const unionBy = (a, b, key) => { const m = new Map(); (a || []).concat(b || []).forEach(x => { if (x == null) return; const k = key(x); if (!m.has(k)) m.set(k, x); }); return [...m.values()]; };
const counters = p => ({stars: p.stars || 0, treatsGiven: p.treatsGiven || 0, sessionCount: p.sessionCount || 0, usage: Object.assign({}, p.usage || {})});

function mergeProgress(L, R, base) {
  base = base || {stars: 0, treatsGiven: 0, sessionCount: 0, usage: {}};
  const out = Object.assign({}, R, L);
  const delta = k => (L[k] || 0) - (base[k] || 0);                       // what this device added since the last share
  out.stars = Math.max(0, (R.stars || 0) + delta('stars'));
  out.treatsGiven = Math.max(0, (R.treatsGiven || 0) + delta('treatsGiven'));
  out.sessionCount = Math.max(0, (R.sessionCount || 0) + delta('sessionCount'));
  out.usage = Object.assign({}, R.usage || {});
  Object.keys(L.usage || {}).forEach(d => { out.usage[d] = Math.max(0, ((R.usage || {})[d] || 0) + (L.usage[d] || 0) - ((base.usage || {})[d] || 0)); });
  out.sessions = unionBy(L.sessions, R.sessions, s => s.t + ':' + (s.challenge || '')).sort((a, b) => a.t - b.t).slice(-400);
  out.trophies = unionBy(L.trophies, R.trophies, t => t.t + ':' + t.ch).sort((a, b) => a.t - b.t);
  out.treatLog = unionBy(L.treatLog, R.treatLog, t => String(t)).sort((a, b) => a - b);
  out.books = unionBy(L.books, R.books, b => b.t).sort((a, b) => a.t - b.t).slice(-200);
  out.moods = unionBy(L.moods, R.moods, m => m.t).sort((a, b) => a.t - b.t).slice(-90);
  out.skills = {};
  new Set(Object.keys(L.skills || {}).concat(Object.keys(R.skills || {}))).forEach(id => {
    const a = (L.skills || {})[id], b = (R.skills || {})[id];
    out.skills[id] = !a ? b : !b ? a : ((b.last || 0) > (a.last || 0) ? b : a);   // the most recent practice wins
  });
  out.ch = {};
  new Set(Object.keys(L.ch || {}).concat(Object.keys(R.ch || {}))).forEach(id => {
    const a = (L.ch || {})[id] || {}, b = (R.ch || {})[id] || {};
    out.ch[id] = Object.assign({}, (b.level || 1) > (a.level || 1) ? b : a, {level: Math.max(a.level || 1, b.level || 1), tries: Math.max(a.tries || 0, b.tries || 0), best: Math.max(a.best || 0, b.best || 0)});
  });
  if (L.mascotStage !== undefined || R.mascotStage !== undefined) out.mascotStage = Math.max(L.mascotStage || 0, R.mascotStage || 0);
  out.moodAsked = [L.moodAsked || '', R.moodAsked || ''].sort().pop() || undefined;
  LOCAL_ONLY_P.forEach(k => { out[k] = L[k]; });
  return out;
}
const sharedProgress = p => { const o = Object.assign({}, p); LOCAL_ONLY_P.forEach(k => delete o[k]); return o; };
const sharedSettings = s => { const o = Object.assign({}, s); LOCAL_ONLY_S.forEach(k => delete o[k]); return o; };

let shareBusy = false, shareStatus = '';
function shareState() {
  if (shareBusy || S.deviceRole === 'parent' || !syncReady()) return Promise.resolve(false);
  shareBusy = true;
  return syncPost({action: 'getstate'}).then(d => {
    if (!d || !d.ok) throw new Error('refused');
    const me = myDevice();
    P.sessions.forEach(s => { if (!s.dev) s.dev = me; });                // tag what this device did
    const before = JSON.stringify([P.sessions.length, P.stars, P.trophies.length, P.books.length, P.ch, S.settingsT]);
    const remote = d.state || {};
    if (remote.progress) P = mergeProgress(P, remote.progress, P.syncBase);
    if (remote.settings && (remote.settingsT || 0) > (S.settingsT || 0)) {   // newer Grown-ups settings from her other device
      const keep = {}; LOCAL_ONLY_S.forEach(k => keep[k] = S[k]);
      S = cleanSettings(Object.assign({}, DEFAULT_SETTINGS, remote.settings, keep, {settingsT: remote.settingsT}));   // settings from the Sheet are checked before use
    }
    P.syncBase = counters(P);
    saveAll();
    const state = {t: Date.now(), by: me, progress: sharedProgress(P), settings: sharedSettings(S), settingsT: S.settingsT || 0};
    return fetch(S.syncUrl, {method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify({key: S.syncKey, action: 'state', device: me, state})})
      .then(() => {
        shareStatus = 'ok';
        const after = JSON.stringify([P.sessions.length, P.stars, P.trophies.length, P.books.length, P.ch, S.settingsT]);
        const on = document.querySelector('.screen.on')?.id;
        if (after !== before && (on === 'home' || on === 'challenges' || on === 'shelf')) { if (on === 'home') renderHome(); else if (on === 'challenges' && typeof renderChallenges === 'function') renderChallenges(); }
        return true;
      });
  }).catch(() => { shareStatus = 'offline'; return false; }).finally(() => { shareBusy = false; });
}
// When to share: at start, when the app comes back, after every finished activity, and every 5 minutes.
setTimeout(shareState, 2500);
setInterval(() => { if (!document.hidden) shareState(); }, 5 * 60000);
const _resumeShared = window.onNativeResume;
window.onNativeResume = function () { const r = _resumeShared ? _resumeShared.apply(this, arguments) : undefined; shareState(); return r; };
const _finishSessionSh = finishSession; finishSession = function () { const r = _finishSessionSh.apply(this, arguments); setTimeout(shareState, 1500); return r; };
if (typeof finishChallenge === 'function') { const f = finishChallenge; finishChallenge = function () { const r = f.apply(this, arguments); setTimeout(shareState, 1500); return r; }; }
if (typeof finishBook === 'function') { const f = finishBook; finishBook = function () { const r = f.apply(this, arguments); setTimeout(shareState, 1500); return r; }; }
if (typeof pickMood === 'function') { const f = pickMood; pickMood = function () { const r = f.apply(this, arguments); setTimeout(shareState, 1500); return r; }; }
const _saveParentSh = saveParent;
saveParent = function () { const r = _saveParentSh.apply(this, arguments); if (r !== false) { S.settingsT = Date.now(); Bridge.save('settings', S); setTimeout(shareState, 500); } return r; };

// ---------------------------------------------------------------------------
// 2. Grown-up key on activity screens (press and hold, then PIN)
// ---------------------------------------------------------------------------
const GU_SCREENS = ['quiz', 'reward', 'chresult', 'book', 'mood', 'studycall', 'challenges', 'shelf'];
const guKey = document.createElement('button');
guKey.id = 'guKey'; guKey.className = 'gukey'; guKey.textContent = '🔑'; guKey.setAttribute('aria-label', 'Grown-ups: press and hold');
guKey.style.display = 'none'; document.body.appendChild(guKey);
const guTip = document.createElement('div'); guTip.className = 'gutip'; guTip.textContent = 'Grown-ups: press and hold 🔑'; document.body.appendChild(guTip);
const _showGu = show;
show = function (id) { const r = _showGu.apply(this, arguments); guKey.style.display = GU_SCREENS.includes(id) ? '' : 'none'; guTip.classList.remove('on'); return r; };
let guHold = null;
const guStart = e => { e.preventDefault(); guKey.classList.add('holding'); guHold = setTimeout(() => { guKey.classList.remove('holding'); guHold = null; askPin(ok => ok && openGrownupMenu(), 'Grown-up PIN'); }, 1500); };
const guEnd = () => { guKey.classList.remove('holding'); if (guHold) { clearTimeout(guHold); guHold = null; guTip.classList.add('on'); setTimeout(() => guTip.classList.remove('on'), 1800); } };
guKey.addEventListener('pointerdown', guStart); guKey.addEventListener('pointerup', guEnd); guKey.addEventListener('pointerleave', guEnd); guKey.addEventListener('pointercancel', guEnd);
guKey.addEventListener('contextmenu', e => e.preventDefault());

const guModal = document.createElement('div'); guModal.className = 'modal'; guModal.id = 'guModal';
guModal.innerHTML = `<div class="growbox gumenu"><h2>🔑 Grown-up</h2><p class="muted" id="guWhat"></p>
  <button class="bigbtn" data-gu="parent">🛠 Open Grown-ups</button>
  <button class="bigbtn2" data-gu="home">⏹ Stop and go home</button>
  <button class="bigbtn2 ok" data-gu="play">🎮 Play now (${'{m}'} min)</button>
  <button class="bigbtn2" data-gu="pmode">🔓 Parent mode 30 min (whole device)</button>
  <button class="small-btn ghost" data-gu="cancel">Cancel, keep going</button></div>`;
document.body.appendChild(guModal);
function stopActivity() {
  try { Bridge.stopSpeak(); } catch (e) {}
  if (typeof carTimer !== 'undefined') clearTimeout(carTimer);
  if (typeof bookTick !== 'undefined') clearInterval(bookTick);
  if (session) { session.aborted = true; session.locked = true; }
}
const _nextQuestionGu = nextQuestion;
nextQuestion = function () { if (session && session.aborted) return; return _nextQuestionGu.apply(this, arguments); };
function openGrownupMenu() {
  const on = document.querySelector('.screen.on')?.id;
  const what = {quiz: 'In the middle of the questions.', book: 'The reading timer is running.', reward: 'Just finished a session.', chresult: 'Just finished a challenge.'}[on] || '';
  $('#guWhat').textContent = what + (what ? ' Progress so far is kept.' : '');
  guModal.querySelector('[data-gu="play"]').textContent = `🎮 Let ${kidName()} play now (${S.minutesPerUnlock} min)`;
  guModal.classList.add('on');
  guModal.querySelectorAll('[data-gu]').forEach(b => b.onclick = () => {
    const a = b.dataset.gu; guModal.classList.remove('on'); if (a === 'cancel') return;
    stopActivity();
    if (a === 'parent') renderParent(false);
    else if (a === 'home') renderHome();
    else if (a === 'play') { Bridge.unlock(S.minutesPerUnlock); renderPlay(); }
    else if (a === 'pmode') { Bridge.parentMode(30); renderPlay(); }
  });
}
