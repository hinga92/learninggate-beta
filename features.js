/* Learning Gate extras: growing owl, feelings check-in, real-book reading timer,
   reading tutor (word highlighting), and remote control from a parent's phone. */
'use strict';

Object.assign(DEFAULT_SETTINGS, {moodCheck: true, bookMinutes: 15, bookReward: 15, bookPin: true, mascotName: 'Hoot'});
for (const k of ['moodCheck', 'bookMinutes', 'bookReward', 'bookPin', 'mascotName']) if (S[k] === undefined) S[k] = DEFAULT_SETTINGS[k];
P.events = P.events || []; P.books = P.books || []; P.moods = P.moods || []; P.remoteLastId = P.remoteLastId || 0;
const logEvent = e => { P.events.push(Object.assign({t: Date.now()}, e)); P.events = P.events.slice(-300); };
const onScreen = () => document.querySelector('.screen.on')?.id;
const weekAgo = () => Date.now() - 7 * 864e5;

function addScreen(id, html) { const s = document.createElement('section'); s.className = 'screen'; s.id = id; s.innerHTML = html; document.body.appendChild(s); return s; }
function addModal(id, html) { const m = document.createElement('div'); m.className = 'modal'; m.id = id; m.innerHTML = html; document.body.appendChild(m); return m; }

// =====================================================================
// 1. Growing owl: grows with LEARNING DAYS (never shrinks, never gets sad)
// =====================================================================
const STAGES = [
  {d: 0, e: '🥚', name: 'an egg', size: 72},
  {d: 1, e: '🐣', name: 'a hatchling', size: 78},
  {d: 3, e: '🐥', name: 'a chick', size: 84},
  {d: 6, e: '🦉', name: 'a baby owl', size: 78},
  {d: 10, e: '🦉', acc: '📖', name: 'a reading owl', size: 92},
  {d: 16, e: '🦉', acc: '🎓', name: 'a graduate owl', size: 102},
  {d: 25, e: '🦉', acc: '⭐', name: 'a star owl', size: 110},
  {d: 40, e: '🦉', acc: '👑', name: 'a royal owl', size: 118}];
function learningDays() { return new Set(P.sessions.map(s => s.date).concat(P.books.map(b => b.date))).size; }
function mascotStage() { const d = learningDays(); let i = 0; STAGES.forEach((s, k) => { if (d >= s.d) i = k; }); return {i, d, s: STAGES[i], next: STAGES[i + 1]}; }
function owlHTML(s, scale = 1) { return `<span class="owl" style="font-size:${Math.round(s.size * scale)}px">${s.e}${s.acc ? `<i class="acc ${s.acc === '📖' ? 'side' : 'top'}">${s.acc}</i>` : ''}</span>`; }
function drawMascot() {
  const el = document.querySelector('#home .mascot'); if (!el) return;
  const m = mascotStage(); el.innerHTML = owlHTML(m.s); el.style.cursor = 'pointer';
  el.onclick = () => Bridge.speak(m.next ? `Hi! I'm ${S.mascotName}. I grow every day you learn!` : `Hi! I'm ${S.mascotName}, the royal owl. You did it!`);
  let line = $('#mascotLine'); if (!line) { el.insertAdjacentHTML('afterend', '<div id="mascotLine" class="mascotline"></div>'); line = $('#mascotLine'); }
  const left = m.next ? m.next.d - m.d : 0, pct = m.next ? Math.round(100 * (m.d - m.s.d) / (m.next.d - m.s.d)) : 100;
  line.innerHTML = `<b>${esc(S.mascotName)}</b> is ${m.s.name}` + (m.next ? ` · ${left} more learning day${left > 1 ? 's' : ''} to grow!` : ' · all grown up! 👑') +
    `<div class="growbar"><i style="width:${pct}%"></i></div>`;
  if (P.mascotStage === undefined) { P.mascotStage = m.i; saveAll(); }
  else if (P.mascotStage < m.i) { P.mascotStage = m.i; saveAll(); celebrateGrowth(m); }
}
addModal('growModal', '<div class="growbox"><div id="growOwl"></div><h2 id="growTitle"></h2><button class="bigbtn" id="growOk">Yay! 🎉</button></div>');
function celebrateGrowth(m) {
  $('#growOwl').innerHTML = owlHTML(m.s, 1.6); $('#growTitle').textContent = `Wow! ${S.mascotName} grew into ${m.s.name}!`;
  $('#growModal').classList.add('on'); confetti(30); Bridge.speak(`Wow! ${S.mascotName} grew into ${m.s.name}! Thank you for learning every day.`);
  $('#growOk').onclick = () => $('#growModal').classList.remove('on');
}

// =====================================================================
// 2. Feelings check-in (once a day, never blocks learning)
// =====================================================================
const MOODS = [['happy', '😀', 'Happy'], ['calm', '😌', 'Calm'], ['tired', '😴', 'Tired'], ['sad', '😢', 'Sad'], ['mad', '😠', 'Mad'], ['worried', '😟', 'Worried']];
const moodEmoji = id => (MOODS.find(m => m[0] === id) || ['', '🙂'])[1];
addScreen('mood', `<div class="homewrap"><div class="mascot" id="moodOwl"></div><h1>How are you feeling today?</h1>
  <div class="moodgrid" id="moodGrid"></div><div id="moodReply"></div><button class="small-btn ghost" id="moodSkip">Skip</button></div>`);
function needMood() { return S.moodCheck && S.deviceRole !== 'parent' && P.moodAsked !== todayKey() && !inBedtime(); }
function renderMood() {
  $('#moodOwl').innerHTML = owlHTML(mascotStage().s); $('#moodReply').innerHTML = ''; $('#moodSkip').style.display = '';
  $('#moodGrid').innerHTML = MOODS.map(m => `<button class="moodbtn" data-m="${m[0]}"><span>${m[1]}</span>${m[2]}</button>`).join('');
  $('#moodGrid').querySelectorAll('[data-m]').forEach(b => b.onclick = () => pickMood(b.dataset.m));
  $('#moodSkip').onclick = () => { P.moodAsked = todayKey(); saveAll(); renderHome(); };
  show('mood'); setTimeout(() => Bridge.speak('How are you feeling today?'), 300);
}
function pickMood(id) {
  P.moodAsked = todayKey(); P.moods.push({date: todayKey(), t: Date.now(), mood: id}); P.moods = P.moods.slice(-90); logEvent({type: 'mood', mood: id}); saveAll();
  $('#moodGrid').innerHTML = `<div class="moodbig">${moodEmoji(id)}</div>`; $('#moodSkip').style.display = 'none';
  const who = esc(helperName());
  if (id === 'happy' || id === 'calm') { const t = id === 'happy' ? "Yay! I'm happy too. Let's learn!" : "Nice and calm. That's a great way to learn!"; $('#moodReply').innerHTML = `<p class="homemsg">${t}</p>`; Bridge.speak(t); setTimeout(renderHome, 2200); return; }
  if (id === 'tired') { const t = "Thanks for telling me. Let's do a few questions, and you can rest after."; $('#moodReply').innerHTML = `<p class="homemsg">${t}</p><button class="bigbtn" id="moodGo">🙂 OK</button>`; Bridge.speak(t); $('#moodGo').onclick = renderHome; return; }
  const name = MOODS.find(m => m[0] === id)[2].toLowerCase();
  const t = `Thank you for telling me. It's okay to feel ${name}. Talking to someone who loves you can help.`;
  $('#moodReply').innerHTML = `<p class="homemsg">${t}</p><div class="helpbtns moodhelp"><button class="helpbtn call" id="moodCall">🆘 Talk to ${who}</button>${typeof renderStudyCall === 'function' ? '<button class="helpbtn wa" id="moodSC">📞 Study call</button>' : ''}<button class="bigbtn2 ghost" id="moodOk">🙂 I'm OK, let's learn</button></div>`;
  Bridge.speak(t); $('#moodCall').onclick = openHelp; if ($('#moodSC')) $('#moodSC').onclick = () => renderStudyCall(); $('#moodOk').onclick = renderHome;
}

// =====================================================================
// 3. A real book counts: reading timer, grown-up check, reading log
// =====================================================================
addScreen('book', `<header class="playhead"><button class="small-btn" id="bkBack">⬅ Back</button><span><button class="small-btn helpOpen">🆘 Help</button><button class="small-btn ctrlBtn">🔊☀️</button></span></header>
  <div class="homewrap"><div class="mascot" id="bkOwl"></div><h1 id="bkTitle">Reading time!</h1><p class="homemsg" id="bkMsg"></p>
  <div class="bkclock" id="bkClock"></div><div class="growbar bkbar"><i id="bkFill"></i></div><div id="bkExtra"></div><div class="row" id="bkBtns"></div></div>`);
let bookTick = null;
const bkElapsed = b => Math.max(0, ((b.pauseAt || Date.now()) - b.start - (b.pausedMs || 0)));
function renderBook() {
  clearInterval(bookTick); $('#bkOwl').innerHTML = owlHTML(Object.assign({}, mascotStage().s, {acc: '📖'})); $('#bkExtra').innerHTML = '';
  const b = P.bookTimer;
  if (!b) {
    $('#bkTitle').textContent = 'Reading time!'; $('#bkClock').textContent = ''; $('#bkFill').style.width = '0';
    $('#bkMsg').innerHTML = `Get a real book, sit somewhere cozy,<br>and read for <b>${S.bookMinutes} minutes</b>.` + (S.bookReward && !inBedtime() ? `<br>You'll earn <b>${S.bookReward} minutes</b> of play!` : '');
    bookPicker();
    $('#bkBtns').innerHTML = `<button class="bigbtn" id="bkStart">▶ Start reading</button><button class="small-btn" id="bkLog">📝 Already read one? Log it</button>`;
    $('#bkLog').onclick = () => { const pick = bookChoice(); askPin(ok => { if (!ok) return;   // read without the timer: a grown-up adds it
      P.bookTimer = {start: Date.now(), mins: S.bookMinutes, pausedMs: 0, pauseAt: 0, title: pick.title, author: pick.author, early: 1}; saveAll(); renderBook(); }, 'Grown-up: add a book that was already read?'); };
    $('#bkStart').onclick = () => { const pick = bookChoice(); P.bookTimer = {start: Date.now(), mins: S.bookMinutes, pausedMs: 0, pauseAt: 0, title: pick.title, author: pick.author}; saveAll();
      Bridge.speak(pick.title ? `Happy reading ${pick.title}! I will tell you when the time is up.` : 'Happy reading! I will tell you when the time is up.'); renderBook(); };
  } else if (b.early) { bookDone();   // finished early, waiting for the title
  } else {
    const total = b.mins * 60000;
    const draw = () => {
      const left = Math.max(0, total - bkElapsed(b)); $('#bkClock').textContent = `${Math.floor(left / 60000)}:${String(Math.floor(left / 1000) % 60).padStart(2, '0')}`;
      $('#bkFill').style.width = Math.round(100 * (1 - left / total)) + '%';
      if (left <= 0) { clearInterval(bookTick); bookDone(); }
    };
    $('#bkExtra').innerHTML = b.title ? `<div class="bknow">📖 <b>${esc(b.title)}</b>${b.author ? ` <span class="muted">by ${esc(b.author)}</span>` : ''}</div>` : '';
    $('#bkTitle').textContent = b.pauseAt ? 'Paused' : 'Reading…'; $('#bkMsg').innerHTML = b.pauseAt ? 'Tap Resume when you are ready.' : 'Keep reading! The tablet will cheer when time is up. 📖';
    $('#bkBtns').innerHTML = (b.pauseAt ? '<button class="bigbtn2" id="bkPause">▶ Resume</button>' : '<button class="bigbtn2 ghost" id="bkPause">⏸ Pause</button>') + '<button class="bigbtn2 ok" id="bkFin">✅ I finished my book</button><button class="small-btn danger" id="bkStop">✖ Stop</button>';
    $('#bkFin').onclick = () => askPin(ok => { if (!ok || P.bookTimer !== b) return; clearInterval(bookTick);   // whole book read before the timer ended
      b.mins = Math.max(1, Math.ceil(bkElapsed(b) / 60000)); b.pauseAt = 0; b.early = 1; saveAll(); renderBook(); }, 'Grown-up: was the whole book finished?');
    $('#bkPause').onclick = () => { if (b.pauseAt) { b.pausedMs += Date.now() - b.pauseAt; b.pauseAt = 0; } else b.pauseAt = Date.now(); saveAll(); renderBook(); };
    $('#bkStop').onclick = () => { if ($('#bkStop').dataset.sure) { P.bookTimer = null; saveAll(); renderBook(); } else { $('#bkStop').dataset.sure = 1; $('#bkStop').textContent = 'Tap again to stop'; } };
    draw(); if (!b.pauseAt) bookTick = setInterval(draw, 1000);
  }
  document.querySelectorAll('#book .helpOpen').forEach(x => x.onclick = openHelp);
  document.querySelectorAll('#book .ctrlBtn').forEach(x => { const o = document.querySelector('#home .ctrlBtn'); if (o) x.onclick = o.onclick; });
  show('book');
}
function bookDone() {
  const b = P.bookTimer; if (!b) return;
  $('#bkTitle').textContent = 'Time is up! 🎉'; $('#bkClock').textContent = '0:00'; $('#bkFill').style.width = '100%';
  $('#bkMsg').innerHTML = `You read for <b>${b.mins} minutes</b>. Wonderful!` + (S.bookPin ? '<br>Ask a grown-up to check.' : '');
  confetti(30); Bridge.speak(b.early ? 'You finished your book. Wonderful reading! What was it called?' : `Time is up! You read for ${b.mins} minutes. Wonderful reading!` + (S.bookPin ? ' Ask a grown-up to check.' : ''));
  $('#bkExtra').innerHTML = `<div class="bkform"><label class="bktitle">Book title <input id="bkName" maxlength="60" value="${esc(b.title || '')}" placeholder="e.g. The Little Red Hen"></label>
    <label class="bktitle">Author <input id="bkAuthor" maxlength="60" value="${esc(b.author || '')}" placeholder="e.g. James Dean (optional)"></label></div>`;
  $('#bkBtns').innerHTML = `<button class="bigbtn" id="bkConfirm">${S.bookPin && !b.early ? '👩 Grown-up check' : '✅ Done'}</button>`;
  if (b.early) {   // a grown-up already checked: say so and let them fix the minutes
    $('#bkTitle').textContent = 'Book finished! 🎉'; $('#bkClock').textContent = ''; $('#bkMsg').innerHTML = 'A grown-up checked it. Great reading!';
    $('#bkExtra').querySelector('.bkform').insertAdjacentHTML('beforeend', `<label class="bktitle">Minutes read <input id="bkMins" type="number" inputmode="numeric" min="1" max="180" value="${b.mins}"></label>`);
  }
  $('#bkConfirm').onclick = () => { const title = ($('#bkName').value || '').trim().slice(0, 60), author = ($('#bkAuthor').value || '').trim().slice(0, 60);
    if (b.early) { const m = parseInt(($('#bkMins') || {}).value, 10); b.mins = m > 0 ? Math.min(180, m) : b.mins; return finishBook(title, author); }
    if (S.bookPin) askPin(ok => ok && finishBook(title, author), 'Grown-up: did they read?'); else finishBook(title, author); };
}
// ---- her bookshelf: every real book she has read, remembered for one-tap re-reads ----
function bookShelf() {   // newest first, one entry per title+author
  const m = new Map(); P.books.filter(x => x.title).forEach(x => { const k = (x.title + '|' + (x.author || '')).toLowerCase();
    const e = m.get(k) || {title: x.title, author: x.author || '', times: 0, mins: 0, last: 0}; e.times++; e.mins += x.mins || 0; e.last = Math.max(e.last, x.t); m.set(k, e); });
  return [...m.values()].sort((a, b) => b.last - a.last);
}
let bkSel = null;   // the book picked on the start screen: {title, author} or null
function bookPicker() {
  const shelf = bookShelf().slice(0, 8); bkSel = null;
  $('#bkExtra').innerHTML = `<p class="bkq">Which book are you reading?</p>
    <div class="bkshelf">${shelf.map((x, i) => `<button class="bkchip" data-bk="${i}">📕 ${esc(x.title)}${x.author ? `<small>${esc(x.author)}</small>` : ''}</button>`).join('')}
    <button class="bkchip new" id="bkNew">＋ A new book</button></div>
    <div class="bkform" id="bkNewForm" style="display:none"><label class="bktitle">Book title <input id="bkNewT" maxlength="60" placeholder="e.g. The Little Red Hen"></label>
    <label class="bktitle">Author <input id="bkNewA" maxlength="60" placeholder="e.g. James Dean (optional)"></label></div>`;
  const mark = el => document.querySelectorAll('.bkchip').forEach(c => c.classList.toggle('on', c === el));
  document.querySelectorAll('[data-bk]').forEach(c => c.onclick = () => { const x = shelf[+c.dataset.bk]; bkSel = {title: x.title, author: x.author}; mark(c); $('#bkNewForm').style.display = 'none'; Bridge.speak(x.title); });
  $('#bkNew').onclick = () => { bkSel = 'new'; mark($('#bkNew')); $('#bkNewForm').style.display = ''; $('#bkNewT').focus(); };
}
function bookChoice() {
  if (bkSel === 'new') return {title: ($('#bkNewT').value || '').trim().slice(0, 60), author: ($('#bkNewA').value || '').trim().slice(0, 60)};
  return bkSel || {title: '', author: ''};
}
function finishBook(title, author = '') {
  const b = P.bookTimer; if (!b) return; P.bookTimer = null;
  const leftCap = dailyCap() ? Math.max(0, dailyCap() - minutesToday()) : 999;
  const earned = inBedtime() ? 0 : Math.min(S.bookReward || 0, leftCap);
  P.books.push({date: todayKey(), t: Date.now(), mins: b.mins, title, author}); P.books = P.books.slice(-200);
  logEvent({type: 'book', mins: b.mins, title, author, earned}); P.stars += 3; if (earned) P.usage[todayKey()] = minutesToday() + earned; saveAll();
  if (typeof trySync === 'function') setTimeout(trySync, 300);
  $('#bkExtra').innerHTML = ''; $('#bkTitle').textContent = 'Added to your reading log! 📚';
  $('#bkMsg').innerHTML = `⭐⭐⭐ +3 stars!` + (earned ? `<br>You earned <b>${earned} minutes</b> of play!` : '');
  $('#bkBtns').innerHTML = earned ? '<button class="bigbtn" id="bkPlay">▶ Let\'s play!</button>' : '<button class="bigbtn" id="bkHome">🏠 Home</button>';
  if (earned) $('#bkPlay').onclick = () => { Bridge.unlock(earned); renderPlay(); }; else $('#bkHome').onclick = renderHome;
}
$('#bkBack').onclick = () => { clearInterval(bookTick); renderHome(); };
function bookWeek() { const w = P.books.filter(b => b.t > weekAgo()); const days = {}; w.forEach(b => days[b.date] = (days[b.date] || 0) + b.mins); return {mins: w.reduce((a, b) => a + b.mins, 0), n: w.length, days15: Object.values(days).filter(m => m >= 15).length}; }

// =====================================================================
// 4. Reading tutor: "Listen first" with word-by-word highlighting, tap a word to hear it,
//    and live highlighting while she reads aloud.
// =====================================================================
let trackTimer = null;
function speakTracked(text, onWord, onDone) {
  const words = text.split(' '), starts = []; let p = 0; words.forEach(w => { starts.push(p); p += w.length + 1; });
  const idxAt = c => { let i = 0; while (i + 1 < starts.length && starts[i + 1] <= c) i++; return i; };
  let gotRange = false, finished = false; clearInterval(trackTimer);
  const done = () => { if (finished) return; finished = true; clearInterval(trackTimer); window.__speakRange = window.__speakDone = null; onDone(); };
  window.__speakRange = s => { gotRange = true; clearInterval(trackTimer); onWord(idxAt(+s)); };
  window.__speakDone = done;
  const N = window.Native;
  if (N && N.speakTrack) N.speakTrack(text);
  else if (window.speechSynthesis) { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 0.8; u.lang = 'en-US';
    u.onboundary = e => window.__speakRange && window.__speakRange(e.charIndex); u.onend = () => window.__speakDone && window.__speakDone(); speechSynthesis.speak(u); }
  // If the voice engine gives no word timing, step through the words at a gentle pace.
  setTimeout(() => { if (gotRange || finished) return; let i = 0; onWord(0);
    trackTimer = setInterval(() => { if (gotRange) return clearInterval(trackTimer); if (++i >= words.length) { clearInterval(trackTimer); return setTimeout(done, 700); } onWord(i); }, 450); }, 800);
}
const _renderQuestion = renderQuestion;
renderQuestion = function (it) {
  const r = _renderQuestion.apply(this, arguments);
  if (it.type === 'aloud' && $('#readtext')) {
    const rt = $('#readtext'), spans = () => [...rt.querySelectorAll('span')];
    rt.insertAdjacentHTML('afterend', '<div class="row tutorrow"><button class="small-btn" id="listenFirst">🔊 Listen first</button><span class="muted">Tap any word to hear it</span></div>');
    $('#listenFirst').onclick = () => { Bridge.stopSpeak(); spans().forEach(s => s.classList.remove('now', 'done'));
      speakTracked(it.text, i => spans().forEach((s, k) => { s.classList.toggle('now', k === i); s.classList.toggle('done', k < i); }), () => spans().forEach(s => s.classList.remove('now', 'done'))); };
    spans().forEach(s => s.onclick = () => { const w = s.textContent.replace(/[^A-Za-z0-9']/g, ''); if (!w) return; Bridge.speak(w); s.classList.add('tapped'); setTimeout(() => s.classList.remove('tapped'), 900); });
  }
  return r;
};
const _doListen = doListen;
doListen = function (it) {
  const spans = [...document.querySelectorAll('#readtext span')];
  spans.forEach(s => s.classList.remove('live', 'now', 'done', 'hit', 'miss'));
  window.__speechPartial = txt => { const r = scoreRead(it.text, [String(txt)]); let last = -1; r.hit.forEach((h, i) => { if (h) last = i; });
    spans.forEach((s, i) => { s.classList.toggle('live', !!r.hit[i]); s.classList.toggle('now', i === last + 1); }); };
  return _doListen.apply(this, arguments);
};

// =====================================================================
// 5. Remote control: parent's phone → the family's own Google Sheet → the child's device
//    (Android checks natively every minute; iPad/iPhone check while the app is open)
// =====================================================================
addModal('msgModal', '<div class="growbox"><div class="msgicon">💌</div><h3 id="msgFrom"></h3><h2 id="msgText"></h2><button class="bigbtn" id="msgOk">OK!</button></div>');
function showRemoteMsg(text, after) {
  $('#msgFrom').textContent = `From ${HelperName()}`; $('#msgText').textContent = text; $('#msgModal').classList.add('on'); Bridge.speak(text);
  $('#msgOk').onclick = () => { $('#msgModal').classList.remove('on'); if (after) after(); };
}
function addBonus(id, mins) {   // a grown-up lets her earn more play time today
  mins = Math.max(5, Math.min(120, +mins || 30)); P.bonus = P.bonus || {}; const d = todayKey();
  (P.bonus[d] = P.bonus[d] || {})[String(id)] = mins;
  Object.keys(P.bonus).sort().slice(0, -7).forEach(k => delete P.bonus[k]);   // keep the last 7 days saveAll(); if (typeof shareState === 'function') setTimeout(shareState, 1000);
}
function handleNativeMsg(m) {
  if (!m) return; const who = HelperName();
  if (m.startsWith('#bonus:')) { const [, id, mins] = m.split(':'); addBonus(id, +mins);
    return showRemoteMsg(`📚 ${who} says you can keep learning! You can earn up to ${Math.max(5, Math.min(120, +mins || 30))} more minutes of play today.`, renderHome); }
  if (m.startsWith('#unlock:')) showRemoteMsg(`🎁 ${who} gave you ${parseInt(m.slice(8), 10) || 15} minutes of play!`, renderHome);
  else if (m === '#lock') showRemoteMsg(`${who} says it's time to stop playing now. 🔒`, renderHome);
  else showRemoteMsg(m);
}
const remoteByJS = () => { const st = Bridge.state(); return S.deviceRole === 'child' && typeof syncReady === 'function' && syncReady() && (!Bridge.native || st.ios); };
function pollRemote() {
  if (!remoteByJS()) return; const dev = S.deviceName || defaultDeviceName();
  syncPost({action: 'poll', poll: dev, since: P.remoteLastId}).then(d => {
      const cmds = (d && d.cmds) || []; let n = 0;
      cmds.forEach(c => { if (!(c.id > P.remoteLastId)) return; P.remoteLastId = c.id; n++;
        if (c.type === 'unlock') { const m = Math.max(5, Math.min(60, +c.minutes || 15)); Bridge.unlock(m); handleNativeMsg('#unlock:' + m); }
        else if (c.type === 'lock') { Bridge.lockNow(); handleNativeMsg('#lock'); }
        else if (c.type === 'msg') showRemoteMsg(String(c.text || '').slice(0, 100));
        else if (c.type === 'bonus') handleNativeMsg('#bonus:' + c.id + ':' + (+c.minutes || 30)); });
      if (n) { saveAll(); postStatus(); }
    }).catch(() => {});
}
function postStatus() {
  const st = Bridge.state();
  fetch(S.syncUrl, {method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain;charset=utf-8'},
    body: JSON.stringify({key: S.syncKey, action: 'status', device: S.deviceName || defaultDeviceName(), applied: P.remoteLastId, unlockUntil: st.unlockUntil || 0})}).catch(() => {});
}
setInterval(pollRemote, 60000); setTimeout(pollRemote, 4000);
// Android: the native service applies commands and leaves a note for the screen.
setInterval(() => { if (window.Native && Native.takeMessage) { try { handleNativeMsg(Native.takeMessage()); } catch (e) {} } }, 4000);
// Keep home/play in step with the lock (e.g. a parent unlocked or locked from their phone).
setInterval(() => {
  if (!Bridge.native || S.deviceRole === 'parent') return; const on = onScreen(), st = Bridge.state(), now = Date.now();
  const open = (st.parentUntil || 0) > now || (!st.locked && (st.unlockUntil || 0) > now);
  if (on === 'home' && open) renderPlay(); else if (on === 'play' && !open) renderHome();
}, 3000);

// Parent's phone: remote-control card on the dashboard (called by sync.js after loading).
const RC_PRESETS = ['Great job today! 🌟', 'Time for dinner 🍽️', 'Please call me 📞', 'Bedtime soon 🌙', 'I love you! ❤️'];
function renderRemote(d, snaps) {
  const box = $('#remoteCard'); if (!box) return;
  const status = d.status || {}, cmds = (d.cmds || []).slice(-5).reverse(), devs = snaps.map(s => s.device);
  const fmt = t => new Date(t).toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});
  const devLines = devs.map(x => { const s = status[x]; const open = s && s.unlockUntil > Date.now();
    return `<li><b>${esc(x)}</b>: ${s ? `${open ? '🔓 playing until ' + fmt(s.unlockUntil) : '🔒 locked'} <span class="muted">(checked in ${ago(s.t)})</span>` : '<span class="muted">no check-in yet</span>'}</li>`; }).join('');
  const label = c => c.type === 'unlock' ? `🎁 +${c.minutes} min` : c.type === 'lock' ? '🔒 Lock' : `💌 “${esc(c.text)}”`;
  const doneFor = c => Object.entries(status).some(([dev, s]) => (c.target === 'all' || c.target === dev) && s.applied >= c.id);
  box.innerHTML = `<div class="card"><h3>🎮 Remote control</h3>
    <label>Send to <select id="rcDev"><option value="all">All of ${esc(S.childName)}'s devices</option>${devs.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join('')}</select></label>
    <div class="row"><button class="small-btn ok" data-rc="unlock" data-m="15">🎁 +15 min play</button><button class="small-btn ok" data-rc="unlock" data-m="30">🎁 +30 min play</button><button class="small-btn danger" data-rc="lock">🔒 Lock now</button></div>
    <div class="row rcpresets">${RC_PRESETS.map(p => `<button class="small-btn" data-msg="${esc(p)}">${esc(p)}</button>`).join('')}</div>
    <div class="row"><input id="rcText" maxlength="100" placeholder="Type a message for ${esc(S.childName)}"><button class="small-btn" id="rcSend">💌 Send</button></div>
    <p class="muted" id="rcNote">The tablet checks about once a minute. The iPad checks while Learning Gate is open.</p>
    ${devLines ? `<ul class="rclist">${devLines}</ul>` : ''}
    ${cmds.length ? `<p class="muted"><b>Recent:</b> ${cmds.map(c => `${label(c)} ${fmt(c.id)} ${doneFor(c) ? '✅' : '⏳'}`).join(' · ')}</p>` : ''}</div>`;
  const target = () => $('#rcDev').value;
  box.querySelectorAll('[data-rc]').forEach(b => b.onclick = () => sendRemote({type: b.dataset.rc, minutes: +b.dataset.m || 0, target: target()}));
  box.querySelectorAll('[data-msg]').forEach(b => b.onclick = () => sendRemote({type: 'msg', text: b.dataset.msg, target: target()}));
  $('#rcSend').onclick = () => { const t = $('#rcText').value.trim(); if (t) sendRemote({type: 'msg', text: t.slice(0, 100), target: target()}); };
}
// The remote-control (dashboard) PIN is checked by the family's Sheet, with its own lockout. It is remembered for 3 minutes
// and forgotten as soon as the app goes to the background.
let rcPinAt = 0, rcPin = '';
const forgetRcPin = () => { rcPinAt = 0; rcPin = ''; };
document.addEventListener('visibilitychange', () => { if (document.hidden) forgetRcPin(); });
function sendRemote(c) {
  const note = t => { if ($('#rcNote')) $('#rcNote').textContent = t; };
  const go = () => syncPost(Object.assign({action: 'cmd', pin: rcPin}, c)).then(r => {
      if (r && r.ok) { rcPinAt = Date.now(); note('✅ Sent! It reaches the device within about a minute. This page refreshes in a minute to confirm.'); setTimeout(() => { if (onScreen() === 'pview') renderParentView(); }, 70000); return; }
      forgetRcPin();
      if (r && r.error === 'wrong') { note('Wrong remote-control PIN. Try again.'); return ask(); }
      if (r && r.error === 'locked') return note('Too many wrong PINs. Please wait a few minutes.');
      if (r && r.error === 'nopin') return note('Set a remote-control PIN first: Grown-ups → 📡 Progress sync → Set remote-control PIN.');
      note('Could not send: please update your Sheet script to v0.3.2 (see FAMILY_SETUP.md).'); })
    .catch(() => note('Could not send. Check the internet connection.'));
  const ask = () => askDigits((ok, pin) => { if (ok) { rcPin = pin; go(); } }, 'Remote-control PIN');
  if (rcPin && Date.now() - rcPinAt < 3 * 60000) return go();
  forgetRcPin(); ask();
}

// =====================================================================
// Home screen hooks + Grown-ups card
// =====================================================================
(() => { const row = document.querySelector('#home .homewrap .row'); if (row) { const b = document.createElement('button'); b.className = 'bigbtn2 bookbtn'; b.id = 'bookBtn'; b.textContent = '📚 I read a book'; b.onclick = renderBook; row.insertBefore(b, row.firstChild.nextSibling); } })();
const _renderHomeFx = renderHome;
renderHome = function () {
  const r = _renderHomeFx.apply(this, arguments);
  if (onScreen() === 'home') {
    if (needMood()) { renderMood(); return r; }
    drawMascot();
    const b = P.bookTimer, bb = $('#bookBtn');
    if (bb) bb.textContent = b ? `📚 Reading: ${Math.max(0, Math.ceil((b.mins * 60000 - bkElapsed(b)) / 60000))} min left` : '📚 I read a book';
  }
  return r;
};
const _prevResumeFx = window.onNativeResume;
window.onNativeResume = () => { const on = onScreen(); if (on === 'book') return renderBook(); if (on === 'mood') return; if (_prevResumeFx) _prevResumeFx(); pollRemote(); };

const fxCard = () => {
  const w = bookWeek(), log = P.books.slice(-8).reverse(), moods = P.moods.filter(m => m.t > weekAgo());
  return `<div class="card" id="fxCard"><h3>📚 Reading, feelings and ${esc(S.mascotName)} the owl</h3>
    <label>Book reading timer (minutes) <input id="bkMin" type="number" min="5" max="60" value="${S.bookMinutes}"></label>
    <label>Play minutes earned per book (0 = log only) <input id="bkRew" type="number" min="0" max="60" value="${S.bookReward}"></label>
    <label class="chk"><input id="bkPinC" type="checkbox" ${S.bookPin ? 'checked' : ''}> A grown-up confirms with the PIN after reading</label>
    <label class="chk"><input id="mdChk" type="checkbox" ${S.moodCheck ? 'checked' : ''}> Ask “How are you feeling?” once a day</label>
    <label>Owl's name <input id="mzName" maxlength="20" value="${esc(S.mascotName)}"></label>
    <p><b>Reading log this week:</b> ${w.n} book session${w.n === 1 ? '' : 's'}, ${w.mins} minutes, ${w.days15} day${w.days15 === 1 ? '' : 's'} with 15+ minutes.</p>
    ${log.length ? `<table><tr><th>Day</th><th>Minutes</th><th>Book</th></tr>${log.map(b => `<tr><td>${esc(b.date)}</td><td>${+b.mins}</td><td>${esc(b.title || '–')}</td></tr>`).join('')}</table>` : '<p class="muted">No books logged yet.</p>'}
    <p><b>Feelings this week:</b> ${moods.length ? moods.map(m => `<span title="${esc(m.date)}">${moodEmoji(m.mood)}</span>`).join(' ') : '<span class="muted">none yet</span>'}</p>
    <p class="muted">${esc(S.mascotName)} is ${mascotStage().s.name} after ${learningDays()} learning days. The owl only grows; it never gets sad or shrinks after a missed day.</p></div>`;
};
const _renderParentFx = renderParent;
renderParent = function () { const r = _renderParentFx.apply(this, arguments); const after = $('#scCard') || [...document.querySelectorAll('#parentBody .card')].find(c => /Help button/.test(c.textContent)); if (after && !$('#fxCard')) after.insertAdjacentHTML('afterend', fxCard()); return r; };
const _saveParentFx = saveParent;
saveParent = function () {
  if ($('#fxCard')) {
    S.bookMinutes = Math.max(5, Math.min(60, +$('#bkMin').value || 15)); S.bookReward = Math.max(0, Math.min(60, +$('#bkRew').value || 0));
    S.bookPin = $('#bkPinC').checked; S.moodCheck = $('#mdChk').checked; S.mascotName = $('#mzName').value.trim().slice(0, 20) || 'Hoot';
  }
  return _saveParentFx.apply(this, arguments);
};

// Push the sync settings to the native side at start-up (Android remote control).
saveAll();
