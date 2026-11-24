/* Home library: the family's own paper books, tracked in the app (titles only, never the books' text).
   Picked in "I read a book", then a short talk-about-it: 2–3 questions Pip asks aloud and a grown-up marks
   👍 got it / 🤔 needed help, plus a quick vowel-sound game for phonics books. Status per book:
   to read → read together → read on their own → mastered (on their own twice, and understood it). */
'use strict';

// Questions are written for this app (themes only, no text from the books).
const LIB_GENERIC = ['Who was in the story?', 'Where did the story happen?', 'What was the problem in the story?', 'How did the story end?',
  'What was your favorite part? Why?', 'Tell me what happened first, next and last.', 'Did something like this ever happen to you?', 'How did the main character feel?'];
// Sound game words (made for this app).
const LIB_SOUNDS = {
  'short a': ['cat', 'map', 'hat', 'van', 'bag', 'jam', 'ran', 'pan'], 'short e': ['bed', 'red', 'pet', 'ten', 'hen', 'net', 'leg', 'wet'],
  'short i': ['big', 'pig', 'win', 'sit', 'fin', 'lid', 'dig', 'hit'], 'short o': ['hot', 'dog', 'pot', 'mop', 'top', 'box', 'fox', 'log'],
  'short u': ['bus', 'cup', 'sun', 'bug', 'rug', 'mud', 'hut', 'nut'], 'long a': ['cake', 'game', 'rain', 'day', 'play', 'tape', 'wave', 'sail'],
  'long e': ['tree', 'see', 'bee', 'feet', 'sea', 'leaf', 'read', 'green'], 'long i': ['bike', 'kite', 'ride', 'time', 'five', 'pie', 'line', 'night'],
  'long o': ['boat', 'home', 'rope', 'road', 'nose', 'bone', 'coat', 'goat'], 'long u': ['cube', 'tube', 'mule', 'cute', 'huge', 'tune', 'flute', 'June']};
const STATUS = [['toread', 'To read', '⚪'], ['together', 'Read together', '🤝'], ['alone', 'Read on their own', '⭐'], ['mastered', 'Mastered', '🏅']];
const statusRank = s => Math.max(0, STATUS.findIndex(x => x[0] === s));

P.lib = P.lib || {}; P.libCustom = P.libCustom || []; P.libQs = P.libQs || {};
// First run: books already read on their own (LIB_ALREADY_READ in library-books.js, empty for a new family).
if (!P.libSeeded) { LIB_ALREADY_READ.forEach(id => { P.lib[id] = P.lib[id] || {status: 'alone', reads: 1, alone: 1, last: 0, talks: []}; }); P.libSeeded = 1; }

function libSeries() {
  const extra = {}; (P.libCustom || []).forEach(b => { (extra[b.series || 'Our books'] = extra[b.series || 'Our books'] || []).push(b); });
  return HOME_LIBRARY.map(s => s).concat(Object.keys(extra).filter(k => !HOME_LIBRARY.some(s => s.series === k)).map(k => ({series: k, author: '', mode: extra[k][0].mode || 'alone', icon: '📕', books: []})))
    .map(s => Object.assign({}, s, {books: s.books.concat(extra[s.series] || []).map(b => Object.assign({author: b.author || s.author, mode: b.mode || s.mode, series: s.series}, b))}));
}
const libBooks = () => [].concat(...libSeries().map(s => s.books));
const libFind = title => { const t = String(title || '').trim().toLowerCase(); return t ? libBooks().find(b => b.title.toLowerCase() === t) : null; };
const lstate = id => (P.lib[id] = P.lib[id] || {status: 'toread', reads: 0, alone: 0, last: 0, talks: []});
const libNextUp = () => libSeries().map(s => s.books.find(b => statusRank(lstate(b.id).status) < (s.mode === 'together' ? 1 : 2))).filter(Boolean);

// ---- 1. "I read a book": next-up books from the home library on the start screen ----
(() => { const prev = bookPicker; bookPicker = function () { const r = prev.apply(this, arguments);
  try { const next = libNextUp().slice(0, 4); if (!next.length) return r;
    const box = document.querySelector('#bkExtra .bkshelf'); if (!box) return r;
    box.insertAdjacentHTML('beforebegin', `<p class="bkq small">From our home library</p><div class="bkshelf" id="libNext">${next.map((b, i) =>
      `<button class="bkchip lib" data-lib="${i}">${b.mode === 'together' ? '🤝' : '📗'} ${esc(b.title)}<small>${esc(b.series)}${b.num ? ' · book ' + b.num : ''}</small></button>`).join('')}</div><p class="bkq small">Books you read before</p>`);
    document.querySelectorAll('[data-lib]').forEach(c => c.onclick = () => { const b = next[+c.dataset.lib]; bkSel = {title: b.title, author: b.author};
      document.querySelectorAll('.bkchip').forEach(x => x.classList.toggle('on', x === c)); const f = $('#bkNewForm'); if (f) f.style.display = 'none'; Bridge.speak(b.title); });
  } catch (e) { console.error(e); } return r; }; })();

// ---- 1b. A reading timer nobody checked: pick the book afterwards, start over, and clear very old ones ----
(() => { const prev = renderBook; renderBook = function () {
  const b = P.bookTimer;
  if (b && Date.now() - b.start - (b.pausedMs || 0) > 12 * 3600e3) { P.bookTimer = null; saveAll(); }   // forgotten (12 h+): never earns play time
  const clock = $('#bkClock'), bar = document.querySelector('#book .bkbar'); if (clock) clock.style.display = ''; if (bar) bar.style.display = '';   // shown again for a new timer
  return prev.apply(this, arguments); }; })();
(() => { const prev = bookDone; bookDone = function () {
  const r = prev.apply(this, arguments);
  try {
    const clock = $('#bkClock'), bar = document.querySelector('#book .bkbar'); if (clock) clock.style.display = 'none'; if (bar) bar.style.display = 'none';   // time is up: make room
    const name = $('#bkName'), auth = $('#bkAuthor');
    if (name && !name.value.trim()) {   // started without choosing a book: offer the shelves here
      const picks = libNextUp().slice(0, 4).concat(bookShelf().slice(0, 3).map(x => ({title: x.title, author: x.author, recent: 1})));
      const seen = new Set(), list = picks.filter(x => !seen.has(x.title) && seen.add(x.title));
      if (list.length) { $('#bkExtra').insertAdjacentHTML('afterbegin', `<p class="bkq small">Which book was it?</p><div class="bkshelf">${list.map((x, i) =>
        `<button class="bkchip ${x.recent ? '' : 'lib'}" data-pick="${i}">📗 ${esc(x.title)}${x.series ? `<small>${esc(x.series)}</small>` : x.author ? `<small>${esc(x.author)}</small>` : ''}</button>`).join('')}</div>`);
        document.querySelectorAll('[data-pick]').forEach(c => c.onclick = () => { const x = list[+c.dataset.pick]; name.value = x.title; if (auth) auth.value = x.author || '';
          document.querySelectorAll('[data-pick]').forEach(o => o.classList.toggle('on', o === c)); }); }
    }
    const btns = $('#bkBtns'); if (btns && !$('#bkOver')) { btns.insertAdjacentHTML('beforeend', '<button class="small-btn" id="bkOver">✖ Start over</button>');
      $('#bkOver').onclick = () => { if ($('#bkOver').dataset.sure) { P.bookTimer = null; saveAll(); renderBook(); } else { $('#bkOver').dataset.sure = 1; $('#bkOver').textContent = 'Tap again: no play time'; } }; }
  } catch (e) { console.error(e); }
  return r; }; })();

// ---- 2. After a library book: who read it, talk about it, sound game ----
(() => { const prev = finishBook; finishBook = function (title, author) {
  const r = prev.apply(this, arguments);
  try { const b = libFind(title); if (b) libTalk(b); } catch (e) { console.error(e); }
  return r; }; })();

function libQuestions(b) {
  const own = (b.qs || []).concat(P.libQs[b.id] || []), gen = shuffle(LIB_GENERIC);
  return b.mode === 'together' ? shuffle(own).slice(0, 2).concat(gen.slice(0, 1)) : shuffle(own).slice(0, 1).concat(gen).slice(0, 3);
}
function libTalk(b) {
  const btns = $('#bkBtns'); if (btns) btns.style.display = 'none';
  const clock = $('#bkClock'), bar = document.querySelector('#book .bkbar'); if (clock) clock.style.display = 'none'; if (bar) bar.style.display = 'none';   // room for the questions
  const st = lstate(b.id), qs = libQuestions(b), res = []; let who = b.mode;
  const box = $('#bkExtra'); if (!box) return;
  const done = () => { if (btns) btns.style.display = ''; if (clock) clock.style.display = ''; if (bar) bar.style.display = ''; };
  // a) who read it
  box.innerHTML = `<div class="libtalk"><p class="bkq">📖 <b>${esc(b.title)}</b></p><p class="bkq small">Who read it?</p>
    <div class="row"><button class="bigbtn2 ${who === 'alone' ? 'ok' : 'ghost'}" data-who="alone">⭐ ${esc(kidName())} read it alone</button><button class="bigbtn2 ${who === 'together' ? 'ok' : 'ghost'}" data-who="together">🤝 We read it together</button></div>
    <button class="small-btn" id="libSkip">Skip talking today</button></div>`;
  box.querySelectorAll('[data-who]').forEach(x => x.onclick = () => { who = x.dataset.who; ask(0); });
  $('#libSkip').onclick = () => { save(); box.innerHTML = ''; done(); };
  // b) questions: Pip asks, a grown-up marks the answer
  function ask(i) {
    if (i >= qs.length) return game();
    box.innerHTML = `<div class="libtalk"><p class="bkq small">Let's talk about the book · ${i + 1} of ${qs.length}</p><p class="libq">💬 ${esc(qs[i])}</p>
      <p class="muted">${esc(S.childName)} answers out loud. Grown-up, tap:</p>
      <div class="row"><button class="bigbtn2 ok" data-a="1">👍 Got it</button><button class="bigbtn2 ghost" data-a="0">🤔 Needed help</button><button class="small-btn" id="libRe">🔊 Again</button></div></div>`;
    Bridge.speak(qs[i]); $('#libRe').onclick = () => Bridge.speak(qs[i]);
    box.querySelectorAll('[data-a]').forEach(x => x.onclick = () => { const ok = x.dataset.a === '1'; res.push(ok); skillResult('r_comp', ok); saveAll();
      Bridge.speak(ok ? pick(PRAISE) : 'Good thinking. Let\'s look in the book together.'); ask(i + 1); });
  }
  // c) phonics books: a quick game on the book's vowel sound
  function game() {
    const sounds = b.sound === 'short' ? ['short a', 'short e', 'short i', 'short o', 'short u'] : b.sound === 'long' ? ['long a', 'long e', 'long i', 'long o', 'long u'] : LIB_SOUNDS[b.sound] ? [b.sound] : null;
    if (!sounds || who !== 'alone') return finish();
    let round = 0, okFirst = 0; const skill = sounds[0].startsWith('long') ? 'r_silente' : 'r_cvc';
    const play = () => {
      if (round >= 3) { saveAll(); return finish(okFirst); }
      const snd = pick(sounds), w = pick(LIB_SOUNDS[snd]);
      const others = shuffle(Object.keys(LIB_SOUNDS).filter(k => k !== snd).flatMap(k => LIB_SOUNDS[k])).filter(x => x !== w).slice(0, 2);
      const opts = shuffle([w].concat(others)); let tries = 0;
      box.innerHTML = `<div class="libtalk"><p class="bkq small">🎯 Sound game: <b>${esc(snd)}</b> · ${round + 1} of 3</p><p class="libq">Tap the word you hear</p>
        <div class="row">${opts.map(o => `<button class="choice wordc" data-w="${esc(o)}">${esc(o)}</button>`).join('')}</div><button class="small-btn" id="libRe">🔊 Again</button></div>`;
      Bridge.speak(w); $('#libRe').onclick = () => Bridge.speak(w);
      box.querySelectorAll('[data-w]').forEach(x => x.onclick = () => { tries++;
        if (x.dataset.w === w) { x.classList.add('right'); if (tries === 1) okFirst++; skillResult(skill, tries === 1); Bridge.speak(pick(PRAISE)); round++; setTimeout(play, 1100); }
        else { x.classList.add('wrong'); Bridge.speak('Try again. ' + w); } });
    };
    play();
  }
  function save() {
    const s = lstate(b.id); s.reads++; s.last = Date.now(); if (who === 'alone') s.alone++;
    if (res.length) s.talks = (s.talks || []).concat({t: Date.now(), ok: res.filter(Boolean).length, n: res.length, who}).slice(-10);
    const understood = res.length ? res.filter(Boolean).length >= Math.ceil(res.length * 2 / 3) : false;
    let next = who === 'alone' ? 'alone' : 'together';
    if (who === 'alone' && s.alone >= 2 && understood) next = 'mastered';
    if (b.mode === 'together' && s.reads >= 2 && understood) next = 'mastered';
    if (statusRank(next) > statusRank(s.status)) s.status = next;
    saveAll(); if (typeof shareState === 'function') setTimeout(shareState, 1500);
    return s;
  }
  function finish(okFirst) {
    const s = save(), got = res.filter(Boolean).length;
    const label = STATUS[statusRank(s.status)];
    box.innerHTML = `<div class="libtalk"><p class="libq">${label[2]} ${esc(b.title)}: <b>${label[1]}</b></p>
      <p class="muted">${res.length ? `Talked about it: ${got} of ${res.length} 👍` : ''}${okFirst != null ? ` · Sound game: ${okFirst} of 3 first try` : ''} · Read ${s.reads} time${s.reads > 1 ? 's' : ''}</p></div>`;
    Bridge.speak(s.status === 'mastered' ? `You mastered ${b.title}! Amazing reading!` : 'Great talking about the book!'); if (s.status === 'mastered') confetti(40);
    done();
  }
}

// ---- 3. Grown-ups card: shelves, status, own questions, add a book ----
(() => { const prevRP = renderParent; renderParent = function () { const r = prevRP.apply(this, arguments);
  try { const body = $('#parentBody'); if (body && !$('#libCard')) { body.insertAdjacentHTML('beforeend', libCardHTML()); libCardWire(); } } catch (e) { console.error(e); }
  return r; }; })();
function libCardHTML() {
  return `<div class="card" id="libCard"><h3>🏠 Home library (our paper books)</h3>
    <p class="muted">Tap a book's status to change it. ⭐ = read it on their own. 🏅 Mastered = read on their own twice and understood it (read-together books: twice together). Tap ✎ to add your own question for a book.</p>
    ${libSeries().map(s => `<div class="libser"><b>${s.icon || '📕'} ${esc(s.series)}</b> <span class="muted">${esc(s.note || '')}</span>
      ${s.books.map(b => { const st = lstate(b.id), lab = STATUS[statusRank(st.status)], t = (st.talks || []).slice(-1)[0];
        return `<div class="librow"><span class="libt">${b.num ? b.num + '. ' : ''}${esc(b.title)}${b.sound && b.sound !== 'short' && b.sound !== 'long' ? ` <span class="muted">(${esc(b.sound)})</span>` : ''}</span>
          <button class="small-btn libst" data-st="${esc(b.id)}">${lab[2]} ${lab[1]}</button>${t ? `<span class="muted">💬 ${t.ok}/${t.n}</span>` : ''}<button class="small-btn" data-q="${esc(b.id)}" title="Add a question">✎</button></div>
          <div class="libqrow" id="q-${esc(b.id)}" style="display:none"><input maxlength="120" placeholder="Your question about ${esc(b.title)}"><button class="small-btn ok" data-qsave="${esc(b.id)}">Add</button>
          ${(P.libQs[b.id] || []).length ? `<div class="muted">Your questions: ${(P.libQs[b.id] || []).map(esc).join(' · ')}</div>` : ''}</div>`; }).join('')}</div>`).join('')}
    <details class="libadd"><summary>＋ Add a book</summary>
      <label>Title <input id="laT" maxlength="60"></label><label>Author <input id="laA" maxlength="60"></label>
      <label>Series or shelf <input id="laS" maxlength="40" placeholder="e.g. Our books"></label>
      <label class="chk"><input id="laTog" type="checkbox"> A book we read together (harder books, chapter books)</label>
      <label>A question to ask afterwards (optional) <input id="laQ" maxlength="120"></label>
      <button class="small-btn ok" id="laAdd">Add to the home library</button></details></div>`;
}
function libCardWire() {
  document.querySelectorAll('[data-st]').forEach(x => x.onclick = () => { const s = lstate(x.dataset.st); s.status = STATUS[(statusRank(s.status) + 1) % STATUS.length][0]; s.last = Date.now();
    const lab = STATUS[statusRank(s.status)]; x.textContent = `${lab[2]} ${lab[1]}`; saveAll(); });
  document.querySelectorAll('[data-q]').forEach(x => x.onclick = () => { const row = document.getElementById('q-' + x.dataset.q); row.style.display = row.style.display === 'none' ? '' : 'none'; });
  document.querySelectorAll('[data-qsave]').forEach(x => x.onclick = () => { const inp = x.previousElementSibling, v = inp.value.trim(); if (!v) return;
    (P.libQs[x.dataset.qsave] = P.libQs[x.dataset.qsave] || []).push(v.slice(0, 120)); inp.value = ''; x.textContent = '✅ Added'; saveAll(); });
  $('#laAdd').onclick = () => { const t = $('#laT').value.trim(); if (!t) { $('#laT').focus(); return; }
    const q = $('#laQ').value.trim();
    P.libCustom.push({id: 'c' + Date.now(), title: t.slice(0, 60), author: $('#laA').value.trim().slice(0, 60), series: $('#laS').value.trim().slice(0, 40) || 'Our books', mode: $('#laTog').checked ? 'together' : 'alone', qs: q ? [q.slice(0, 120)] : []});
    saveAll(); const c = $('#libCard'); c.outerHTML = libCardHTML(); libCardWire(); };
}

// ---- 4. Share between devices and with the family Sheet ----
if (typeof mergeProgress === 'function') { const prevM = mergeProgress; mergeProgress = function (L, R) { const out = prevM.apply(this, arguments);
  out.lib = {}; new Set(Object.keys(L.lib || {}).concat(Object.keys(R.lib || {}))).forEach(id => { const a = (L.lib || {})[id], b = (R.lib || {})[id]; out.lib[id] = !a ? b : !b ? a : ((b.last || 0) > (a.last || 0) ? b : a); });
  out.libCustom = unionBy(L.libCustom, R.libCustom, b => b.id);
  out.libQs = Object.assign({}, R.libQs || {}); Object.keys(L.libQs || {}).forEach(k => { out.libQs[k] = [...new Set((out.libQs[k] || []).concat(L.libQs[k]))]; });
  out.libSeeded = L.libSeeded || R.libSeeded; return out; }; }
function libraryExtras() {
  const all = libBooks(), cnt = {toread: 0, together: 0, alone: 0, mastered: 0}; all.forEach(b => cnt[lstate(b.id).status]++);
  const week = Date.now() - 7 * 864e5, talks = [];
  all.forEach(b => (lstate(b.id).talks || []).filter(t => t.t > week).forEach(t => talks.push(t)));
  const recent = all.filter(b => lstate(b.id).last > week).sort((a, b) => lstate(b.id).last - lstate(a.id).last).slice(0, 6)
    .map(b => ({t: b.title, s: lstate(b.id).status}));
  return {library: {mastered: cnt.mastered, alone: cnt.alone, together: cnt.together, toread: cnt.toread, total: all.length,
    talkOk: talks.reduce((a, t) => a + t.ok, 0), talkN: talks.reduce((a, t) => a + t.n, 0), recent}};
}
