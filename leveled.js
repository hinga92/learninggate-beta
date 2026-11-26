/* Pip's Stories for every grade: leveled books for Grades 2–5 (story-library.js) on top of the
   Kindergarten–Grade 1 sight-word series in stories.js.
   - Shelves: Easier · My grade · Challenge. The recommended book has a "⭐ Just right" badge.
   - Grades 2–3: the child reads each page aloud (Pip can read it first); Grade 3 adds a check-in question halfway.
   - Grades 4–5: chapter-style books read silently or aloud; one "fluency page" is read into the microphone
     (accuracy + words per minute); questions include "which sentence shows it?" evidence questions; 🔎 Look back.
   - Level moves: comprehension ≥ 80% (and reading accuracy ≥ 95% when the mic was used) → next level;
     comprehension < 60% or accuracy < 90% → an easier book is suggested. Nothing is ever taken away. */
'use strict';
(() => {
  const BOOKS = [].concat(typeof LEVELED_BOOKS !== 'undefined' ? LEVELED_BOOKS : [], typeof BOOKS_23 !== 'undefined' ? BOOKS_23 : [], typeof BOOKS_45 !== 'undefined' ? BOOKS_45 : [])
    .filter(b => b && b.pages && b.pages.length);
  const BANDS = ['K1', '2', '3', '4', '5'];
  const BAND_NAME = {K1: 'Kindergarten–Grade 1', '2': 'Grade 2', '3': 'Grade 3', '4': 'Grade 4', '5': 'Grade 5'};
  const myBand = () => { const n = gradeNum(); return n <= 1 ? 'K1' : String(Math.min(5, n)); };
  const inBand = band => BOOKS.filter(b => b.band === band).sort((a, b) => (a.lvl || 0) - (b.lvl || 0));
  P.readLv = P.readLv || {};   // {band: index of the "just right" book}
  P.readLog = P.readLog || []; // [{t, id, band, comp, acc, wcpm, move}]
  const lvIndex = band => Math.max(0, Math.min(inBand(band).length - 1, P.readLv[band] || 0));
  const words = t => String(t).split(/\s+/).filter(Boolean);
  const sentences = t => String(t).match(/[^.!?]+[.!?]+["”’']?/g) || [String(t)];
  let shelf = null;   // which band is shown

  // ---------- shelves ----------
  const origRender = renderStories;
  renderStories = function (band) {
    storyStop(); if (typeof band !== 'string' || !BANDS.includes(band)) band = null;
    const mine = myBand(), i = BANDS.indexOf(mine), easier = BANDS[i - 1], harder = BANDS[i + 1];
    if (shelf && ![easier, mine, harder].includes(shelf)) shelf = null;   // the grade changed: back to "My grade"
    band = band || shelf || mine; shelf = band;
    if (band === 'K1' && mine === 'K1' && !BOOKS.some(b => b.band === '2')) return origRender.apply(this, arguments);
    if (inBedtime() && !S.challengesAtRest) return origRender.apply(this, arguments);   // "the story books are sleeping"
    const tabs = [[easier, '⬇ Easier'], [mine, '📚 My grade'], [harder, '🚀 Challenge']].filter(t => t[0] && (t[0] === 'K1' || inBand(t[0]).length));
    $('#stWords').innerHTML = `<div class="lvtabs">${tabs.map(([b, l]) => `<button class="small-btn ${b === band ? 'ok' : ''}" data-shelf="${b}">${l}<small> ${BAND_NAME[b]}</small></button>`).join('')}</div>`;
    $('#stWords').querySelectorAll('[data-shelf]').forEach(x => x.onclick = () => renderStories(x.dataset.shelf));
    if (band === 'K1') {   // the original sight-word series, with the tabs on top
      const tabsHtml = $('#stWords').innerHTML; origRender.call(this); $('#stWords').insertAdjacentHTML('afterbegin', tabsHtml);
      $('#stWords').querySelectorAll('[data-shelf]').forEach(x => x.onclick = () => renderStories(x.dataset.shelf)); return;
    }
    const list = inBand(band), just = lvIndex(band);
    $('#stGrid').innerHTML = list.map((b, k) => { const st = bstate(b.id);
      return `<div class="stcard bg-${esc(b.bg || 'sky')} ${k === just ? 'justright' : ''}">${k === just ? '<span class="jr">⭐ Just right</span>' : `<span class="stnum">Level ${k + 1}</span>`}
        <span class="stcover">${b.cover || '📘'}</span><span class="sttitle">${esc(b.title)}</span>
        <span class="muted">${b.kind === 'informational' ? 'True facts' : 'Story'} · ${words(b.pages.map(p => p.text).join(' ')).length} words</span>
        <span class="ststars">${'⭐'.repeat(st.stars)}${'☆'.repeat(3 - st.stars)}</span>
        <button class="small-btn ok" data-lv="${esc(b.id)}">${st.reads ? '🔁 Read again' : '▶ Read'}</button></div>`; }).join('') || '<p class="homemsg">Books for this level are coming soon.</p>';
    $('#stGrid').querySelectorAll('[data-lv]').forEach(x => x.onclick = () => lvOpen(BOOKS.find(b => b.id === x.dataset.lv)));
    show('stories');
    const jb = list[just]; Bridge.speak(jb ? `Your just right book is ${jb.title}.` : 'Pick a book!');
  };
  $('#stBack').onclick = () => { storyStop(); shelf = null; renderHome(); };
  if ($('#storyBtn')) $('#storyBtn').onclick = () => { shelf = null; renderStories(); };   // the home button was bound to the old function
  $('#spClose').onclick = () => { storyStop(); RD && RD.lv ? renderStories(RD.book.band) : renderStories(); };

  // ---------- reading ----------
  const upper = b => b.band === '4' || b.band === '5';
  function lvOpen(book) {
    storyStop(); if (!book) return;
    const fluPage = upper(book) ? Math.min(book.pages.length - 1, Math.floor(book.pages.length / 2)) : -1;
    RD = {lv: true, book, page: -1, dead: false, hits: 0, total: 0, micUsed: false, readMs: 0, readWords: 0, fluPage, answers: [], helped: new Set()};
    show('story'); lvIntro();
  }
  function lvDots() { const r = RD; $('#spDots').innerHTML = [-1].concat(r.book.pages.map((_, k) => k)).map(k => `<i class="${k < r.page ? 'done' : k === r.page ? 'cur' : ''}"></i>`).join(''); }
  function lvIntro() {
    const r = RD, b = r.book; lvDots();
    const vocab = (b.vocab || []).slice(0, 6);
    $('#spBody').innerHTML = `<div class="spcover bg-${esc(b.bg || 'sky')}"><span class="bigcover">${b.cover || '📘'}</span><h1>${esc(b.title)}</h1>${b.series ? `<p class="muted">${esc(b.series)}</p>` : ''}</div>
      ${vocab.length ? `<p class="homemsg">Words to know. Tap one to hear it and what it means:</p><div class="wrow">${vocab.map(([w, m], k) => `<button class="wchip new vocab" data-v="${k}">${esc(w)}</button>`).join('')}</div><p class="vmean" id="vMean"></p>` : ''}
      <p class="muted big">${upper(b) ? 'Read each page by yourself (out loud or in your head). Tap 🔊 if you want Pip to read it.' : 'Read each page out loud. Tap 🔊 to hear Pip read it first.'}</p>
      <button class="bigbtn" id="spGo">📖 Start reading</button>`;
    $('#spBody').querySelectorAll('[data-v]').forEach(x => x.onclick = () => { const [w, m] = vocab[+x.dataset.v]; $('#vMean').innerHTML = `<b>${esc(w)}</b>: ${esc(m)}`; Bridge.speak(`${w}. ${m}`); x.classList.add('heard'); });
    $('#spGo').onclick = () => { r.page = 0; lvPage(); };
    Bridge.speak(`${b.title}.` + (vocab.length ? ' Here are some words to know.' : ''));
  }
  function lvPage() {
    const r = RD, pg = r.book.pages[r.page]; lvDots(); r.tries = 0; r.pageStart = Date.now();
    const toks = pg.text.split(' ');
    $('#spBody').innerHTML = `${pg.scene && pg.scene.length ? `<div class="scene small bg-${esc(r.book.bg || 'sky')}">${pg.scene.map(([e, a, x, s], k) => `<i class="act ${a ? 'a-' + a : ''}" style="left:${x}%;font-size:${Math.min(s, 90)}px;animation-delay:${(k * 0.15).toFixed(2)}s">${e}</i>`).join('')}</div>` : (pg.icon ? `<div class="bigemoji">${pg.icon}</div>` : '')}
      ${pg.heading ? `<h3 class="lvhead">${esc(pg.heading)}</h3>` : ''}
      <div class="readtext lvtext ${upper(r.book) ? 'upper' : ''}" id="readtext">${toks.map((w, k) => `<span data-i="${k}">${esc(w)}</span>`).join(' ')}</div>
      <div class="feedback" id="spFb"></div><div class="row" id="spBtns"></div>`;
    $('#readtext').querySelectorAll('span').forEach(s => s.onclick = () => { const w = s.textContent.replace(/[^A-Za-z']/g, ''); if (!w) return; Bridge.speak(w); r.helped.add(r.page + ':' + s.dataset.i); s.classList.add('tapped'); setTimeout(() => s.classList.remove('tapped'), 900); });
    const flu = r.page === r.fluPage, last = r.page >= r.book.pages.length - 1, mic = canMic();
    const readAloudFirst = !upper(r.book) || flu;
    fb(flu ? (mic ? '🎤 Fluency page: read this page out loud to Pip.' : 'Read this page out loud to a grown-up.') : readAloudFirst ? (mic ? 'Read this page out loud. Tap 🔊 to hear Pip first.' : 'Read this page out loud. Tap 🔊 to hear Pip first.') : 'Read this page. Tap 🔊 if you want Pip to read it to you.');
    spButtons(`<button class="small-btn" id="lvHear">🔊 Read to me</button>` + (readAloudFirst && mic ? `<button class="mic" id="spMic">🎤 <span>Tap and read</span></button>` : '') +
      `<button class="bigbtn2 ${readAloudFirst && mic ? 'ghost' : 'ok'}" id="lvNext">${last ? '✅ Done reading' : '▶ Next page'}</button>`);
    $('#lvHear').onclick = () => { r.pageHeard = true; speakTracked(pg.text, i => spSpans().forEach((s, k) => { s.classList.toggle('now', k === i); s.classList.toggle('done', k < i); }), () => spSpans().forEach(s => s.classList.remove('now', 'done'))); };
    if ($('#spMic')) $('#spMic').onclick = () => lvListen();
    $('#lvNext').onclick = () => lvNextPage();
    r.pageHeard = false;
  }
  function lvListen() {
    const r = RD, text = r.book.pages[r.page].text, btn = $('#spMic'); if (!btn || btn.classList.contains('listening')) return;
    Bridge.stopSpeak(); btn.classList.add('listening'); btn.querySelector('span').textContent = 'Listening… read now!';
    const t0 = Date.now(); spSpans().forEach(s => s.classList.remove('hit', 'miss', 'live'));
    window.__speechPartial = txt => { if (RD !== r) return; const p = scoreRead(text, [String(txt)]); spSpans().forEach((s, k) => s.classList.toggle('live', !!p.hit[k])); };
    Bridge.listen(alts => {
      if (r.dead || RD !== r) return; window.__speechPartial = null; r.tries++; r.micUsed = true;
      const res = scorePage(text, alts), n = norm(text).length, heard = Math.max(...alts.map(a => norm(a).length), 0);
      spSpans().forEach((s, k) => { s.classList.remove('live'); s.className = res.hit[k] ? 'hit' : 'miss'; });
      if (r.tries === 1) { r.hits += res.hit.filter(Boolean).length; r.total += n; if (r.page === r.fluPage && heard >= n * 0.6) { r.readMs += Date.now() - t0; r.readWords += res.hit.filter(Boolean).length; }
        if (typeof wordsFromRead === 'function') try { wordsFromRead(text, res.hit); } catch (e) {} }
      btn.classList.remove('listening'); btn.querySelector('span').textContent = 'Read again';
      const pct = Math.round(100 * res.score);
      if (res.score >= 0.9 && heard >= n * 0.6) { fb(`⭐ Great reading! ${pct}% of the words.`, 'good'); Bridge.speak('Great reading!'); confetti(8); $('#lvNext').className = 'bigbtn2 ok'; }
      else { const miss = norm(text).filter((w, k) => !res.hit[k]).slice(0, 3); fb(`Good try! ${pct}% of the words. Tricky: ${miss.join(', ')}`, 'warn'); Bridge.speak(`Good try! Listen: ${miss.join(', ')}.`); }
    }, () => { if (r.dead || RD !== r) return; window.__speechPartial = null; btn.classList.remove('listening'); btn.querySelector('span').textContent = 'Tap and read'; fb('I could not hear you. Try again, or tap Next page.', 'warn'); });
  }
  function lvNextPage() {
    const r = RD; Bridge.stopSpeak();
    if (!r.micUsed || r.tries === 0) { const n = norm(r.book.pages[r.page].text).length; r.silentWords = (r.silentWords || 0) + n; }
    // Grade 3+: one check-in question halfway (a question marked mid, or the first detail question)
    const half = Math.floor((r.book.pages.length - 1) / 2);
    if (r.page === half && r.book.band >= '3' && !r.midDone) { const q = (r.book.questions || []).find(x => x.mid); if (q) { r.midDone = true; return lvQuestion(q, true, () => { r.page++; lvPage(); }); } }
    if (r.page >= r.book.pages.length - 1) return lvQuizStart();
    r.page++; lvPage();
  }

  // ---------- questions ----------
  // Look back at the whole book. After two wrong tries the paragraph that holds the answer is highlighted (elaborated feedback).
  function lookBack(hint) {
    const r = RD; const box = document.createElement('div'); box.className = 'modal on'; box.id = 'lvLook';
    const mark = p => hint && p.text.includes(hint) ? ' class="lvmark"' : '';
    box.innerHTML = `<div class="growbox lvlook"><h3>🔎 ${esc(r.book.title)}</h3>${hint ? '<p class="muted">The answer is in the yellow part.</p>' : ''}${r.book.pages.map(p => `${p.heading ? `<h4>${esc(p.heading)}</h4>` : ''}<p${mark(p)}>${esc(p.text)}</p>`).join('')}<button class="bigbtn2 ok" id="lvLookClose">Back to the question</button></div>`;
    document.body.appendChild(box); r.lookedBack = true; $('#lvLookClose').onclick = () => box.remove();
    const m = box.querySelector('.lvmark'); if (m) m.scrollIntoView({block: 'center'});
  }
  function lvQuizStart() { const r = RD; r.page = r.book.pages.length; lvDots(); r.qs = (r.book.questions || []).filter(q => !q.mid); r.qi = 0; lvNextQ(); }
  function lvNextQ() { const r = RD, q = r.qs[r.qi]; if (!q) return lvFinish(); lvQuestion(q, false, () => { r.qi++; lvNextQ(); }); }
  function lvQuestion(q, mid, next) {
    const r = RD, choices = shuffle([q.a].concat(q.wrong || []));
    $('#spBody').innerHTML = `${mid ? '<p class="muted big">Quick check while you read</p>' : ''}<div class="prompt">🤔 ${esc(q.q)}</div>
      <div class="answers">${choices.map((c, k) => `<button class="choice wordc" data-c="${k}">${esc(c)}</button>`).join('')}</div>
      <div class="feedback" id="spFb"></div><div class="row"><button class="small-btn" id="lvLookBtn">🔎 Look back</button></div>`;
    $('#lvLookBtn').onclick = () => lookBack();
    let tries = 0, locked = false;
    $('#spBody').querySelectorAll('[data-c]').forEach(b => b.onclick = () => { if (locked) return; tries++;
      if (choices[+b.dataset.c] === q.a) { locked = true; b.classList.add('right'); const first = tries === 1;
        if (!mid) { r.answers.push({type: q.type || 'detail', first}); skillResult('r_comp', first); }
        saveAll(); const m = pick(PRAISE); fb('⭐ ' + m, 'good'); Bridge.speak(m); confetti(first ? 10 : 4);
        setTimeout(() => { if (RD !== r || r.dead) return; if (q.evidence && r.book.band >= '3' && !mid) evidenceQ(q, next); else next(); }, 1400); }
      else { b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 600); fb(tries >= 2 ? 'Let\'s look back in the book together.' : 'Not quite. Think again!', 'warn'); Bridge.speak(tries >= 2 ? 'Let\'s look back in the book.' : 'Not quite. Think again!');
        if (tries === 2) setTimeout(() => { if (RD === r && !document.getElementById('lvLook')) lookBack(q.evidence ? q.evidence.trim() : null); }, 900); }
    });
    Bridge.speak(q.q);
  }
  // Part B: "Which sentence from the book shows this?" (CAASPP-style evidence question, Grades 4–5)
  function evidenceQ(q, next) {
    const r = RD, all = [].concat(...r.book.pages.map(p => sentences(p.text))).map(s => s.trim());
    const ev = q.evidence.trim(), others = shuffle(all.filter(s => s !== ev && s.length > 25)).slice(0, 2);
    const choices = shuffle([ev].concat(others));
    $('#spBody').innerHTML = `<div class="prompt">🔍 Which sentence from the book shows that?</div><div class="answers evid">${choices.map((c, k) => `<button class="choice wordc" data-c="${k}">${esc(c)}</button>`).join('')}</div><div class="feedback" id="spFb"></div><div class="row"><button class="small-btn" id="lvLookBtn">🔎 Look back</button></div>`;
    $('#lvLookBtn').onclick = () => lookBack(); let tries = 0, locked = false;
    $('#spBody').querySelectorAll('[data-c]').forEach(b => b.onclick = () => { if (locked) return; tries++;
      if (choices[+b.dataset.c] === ev) { locked = true; b.classList.add('right'); r.answers.push({type: 'evidence', first: tries === 1}); skillResult('r_comp', tries === 1); saveAll(); fb('⭐ That sentence proves it!', 'good'); Bridge.speak('Yes! That sentence proves it.'); setTimeout(() => { if (RD === r && !r.dead) next(); }, 1400); }
      else { b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 600); fb('Look for the sentence that gives the reason.', 'warn'); } });
    Bridge.speak('Which sentence from the book shows that?');
  }

  // ---------- results and level moves ----------
  function lvFinish() {
    const r = RD, b = r.book, st = bstate(b.id), list = inBand(b.band), idx = list.indexOf(b);
    const comp = r.answers.length ? r.answers.filter(a => a.first).length / r.answers.length : 1;
    const acc = r.micUsed && r.total ? r.hits / r.total : null;
    const wcpm = r.readMs > 5000 ? Math.round(r.readWords / (r.readMs / 60000)) : null;
    // Just right: ~80% comprehension and ≥95% accuracy (Grade 2) or ≥90% (Grades 3–5). Easier only after two hard books in a row.
    const accOk = b.band === '2' ? 0.95 : 0.9, accLow = b.band === '2' ? 0.9 : 0.85;
    const hard = comp < 0.6 || (acc != null && acc < accLow);
    P.readHard = P.readHard || {}; P.readHard[b.band] = hard ? (P.readHard[b.band] || 0) + 1 : 0;
    // Move up on the pooled last 3 reads in this grade (at least 2): one 5-question quiz is too noisy on its own.
    const recent = (P.readLog || []).filter(x => x.band === b.band).slice(-2).map(x => x.comp / 100).concat(comp);
    const pooled = recent.reduce((s, x) => s + x, 0) / recent.length;
    let move = 'stay';
    if (recent.length >= 2 && pooled >= 0.8 && comp >= 0.7 && (acc == null || acc >= accOk)) move = 'up'; else if (hard && P.readHard[b.band] >= 2) { move = 'down'; P.readHard[b.band] = 0; }
    const first = !st.reads; st.reads++; st.last = Date.now();
    const stars = comp >= 0.9 && (acc == null || acc >= accOk) ? 3 : comp >= 0.7 ? 2 : 1; st.stars = Math.max(st.stars, stars); st.best = Math.max(st.best || 0, Math.round(comp * 100));
    // A good read at or above the "just right" book moves the pointer past it; a hard read at or below it moves it back.
    const cur = lvIndex(b.band);
    if (idx >= 0) { if (move === 'up' && idx >= cur) P.readLv[b.band] = Math.min(list.length - 1, idx + 1); else if (move === 'down' && idx <= cur) P.readLv[b.band] = Math.max(0, idx - 1); }
    P.readLog.push({t: Date.now(), id: b.id, band: b.band, comp: Math.round(comp * 100), acc: acc == null ? null : Math.round(acc * 100), wcpm, move}); P.readLog = P.readLog.slice(-100);
    P.sessions.push({date: todayKey(), t: Date.now(), n: r.answers.length, ok: r.answers.filter(a => a.first).length, dur: 0, mins: 0, challenge: 'gigistory', level: b.band + '.' + (idx + 1), pass: true, story: b.id,
      skills: r.answers.map(a => ({skill: 'r_comp', first: a.first}))}); P.sessions = P.sessions.slice(-400);
    let trophy = ''; if (first) { const m = comp >= 0.9 ? {e: '🏆', c: 'gold', t: 'Gold'} : comp >= 0.7 ? {e: '🥈', c: 'silver', t: 'Silver'} : {e: '🥉', c: 'bronze', t: 'Bronze'}; P.trophies.push({ch: 'gigistory', level: idx + 1, ok: r.answers.filter(a => a.first).length, n: r.answers.length, medal: m.c, t: Date.now()}); trophy = m; }
    saveAll();
    const nb = list[lvIndex(b.band)], easierBand = BANDS[BANDS.indexOf(b.band) - 1], harderBand = BANDS[BANDS.indexOf(b.band) + 1];
    const tip = move === 'up' ? (idx === list.length - 1 && harderBand && inBand(harderBand).length ? `You finished the top level! Try the 🚀 Challenge shelf: ${BAND_NAME[harderBand]}.` : `You're ready for the next level!`)
      : move === 'down' ? 'Let\'s read an easier book next and come back to this one.' : hard ? 'That one was tricky! Try it again, or pick another book.' : 'Read another book at this level.';
    $('#spBody').innerHTML = `<div class="homewrap"><div class="bigtrophy ${trophy ? trophy.c : ''}">${trophy ? trophy.e : '⭐'}</div>
      <h1>${trophy ? `${trophy.t} trophy!` : 'Great reading!'}</h1>
      <p class="homemsg">You read <b>${esc(b.title)}</b>.<br>Questions right the first time: <b>${Math.round(comp * 100)}%</b>${acc != null ? `<br>Words read correctly: <b>${Math.round(acc * 100)}%</b>` : ''}${wcpm ? `<br>Reading speed: <b>${wcpm}</b> words a minute` : ''}</p>
      <div class="rstars">${'⭐'.repeat(st.stars)}${'☆'.repeat(3 - st.stars)}</div><p class="homemsg">${tip}</p>
      <div class="row">${nb && nb !== b ? `<button class="bigbtn" id="lvNextBook">▶ ${esc(nb.title)}</button>` : ''}<button class="bigbtn2 ghost" id="spLib">📚 All books</button></div></div>`;
    if ($('#lvNextBook')) $('#lvNextBook').onclick = () => lvOpen(nb);
    $('#spLib').onclick = () => renderStories(b.band);
    confetti(trophy ? 60 : 25); Bridge.speak((trophy ? `${trophy.t} trophy! ` : 'Great reading! ') + tip);
    if (typeof shareState === 'function') setTimeout(shareState, 1500);
    if (typeof trySync === 'function') setTimeout(trySync, 4000);
    RD = null;
  }

  // ---------- sharing between devices + Grown-ups card ----------
  if (typeof mergeProgress === 'function') { const prevM = mergeProgress; mergeProgress = function (L, R) { const out = prevM.apply(this, arguments);
    out.readLv = Object.assign({}, R.readLv || {}, L.readLv || {}); BANDS.forEach(b => { const a = (L.readLv || {})[b], c = (R.readLv || {})[b]; if (a != null || c != null) out.readLv[b] = Math.max(a || 0, c || 0); });
    out.readLog = unionBy(L.readLog, R.readLog, x => x.t + ':' + x.id).sort((a, b) => a.t - b.t).slice(-100); return out; }; }
  const prevRP = renderParent;
  renderParent = function () { const r = prevRP.apply(this, arguments);
    try { const band = myBand(), list = inBand(band), last = (P.readLog || []).slice(-5).reverse();
      if (list.length && !$('#lvReadCard')) $('#parentBody').insertAdjacentHTML('beforeend', `<div class="card" id="lvReadCard"><h3>📖 Pip's Stories: reading level</h3>
        <p>${esc(BAND_NAME[band])}: level <b>${lvIndex(band) + 1}</b> of ${list.length} (“${esc(list[lvIndex(band)].title)}”)</p>
        ${last.length ? `<table><tr><th>Book</th><th>Questions</th><th>Accuracy</th><th>Words/min</th><th></th></tr>${last.map(x => { const bk = BOOKS.find(b => b.id === x.id); return `<tr><td>${esc(bk ? bk.title : x.id)}</td><td>${x.comp}%</td><td>${x.acc == null ? '–' : x.acc + '%'}</td><td>${x.wcpm || '–'}</td><td>${x.move === 'up' ? '⬆️' : x.move === 'down' ? '⬇️' : ''}</td></tr>`; }).join('')}</table>` : '<p class="muted">No leveled books read yet.</p>'}
        <p class="muted">A book counts as "just right" when your child answers about 80% of the questions on the first try and reads about 95% of the words correctly. Typical spring reading speeds: Grade 2 ≈ 100, Grade 3 ≈ 112, Grade 4 ≈ 133, Grade 5 ≈ 146 words a minute (Hasbrouck & Tindal 2017). The app moves up a level after a just-right read and suggests an easier book after a hard one.</p></div>`); } catch (e) { console.error(e); }
    return r; };
  window.__LV = {BOOKS, inBand, myBand, lvIndex, lvOpen};
})();
