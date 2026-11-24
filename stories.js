/* Pip's Stories: a series of short sight-word books with simple animations.
   Each page: Pip reads it (words light up) → the child repeats it (echo reading, mic checks each word).
   On a re-read ("Read by myself") she reads first and can tap a word or ask Pip for help.
   Every sight word is tracked (new → learning → known → review), and her learning words
   come back in the warm-up and the word game. Stories never unlock play time; a finished
   book earns a trophy (counts toward treats) and a learning day for the mascot. */
'use strict';

// ---------------------------------------------------------------------------
// 1. The books. Words come from the Dolch lists (and any class list a grown-up adds), plus
//    short-vowel words she can sound out. Each book adds 2–4 new sight words.
//    scene: [emoji, animation, left %, size] · anim: bob hop run fall rise spin grow shake pop sway
// ---------------------------------------------------------------------------
const STORY_SERIES = "Pip's Adventures";
const GIGI_BOOKS = [
  {id: 'g1', title: 'Pip Can Play', cover: '🐥', bg: 'sky', newWords: ['look', 'see', 'play'], pages: [
    {text: 'Look! I see Pip.', scene: [['🐥', 'pop', 45, 120], ['🌼', 'sway', 15, 60], ['🌼', 'sway', 80, 60]]},
    {text: 'Pip can run.', scene: [['🐥', 'run', 10, 110], ['💨', 'fade', 5, 50]]},
    {text: 'Pip can hop and hop.', scene: [['🐥', 'hop', 45, 120], ['🌱', '', 20, 50], ['🌱', '', 72, 50]]},
    {text: 'Come and play, Pip!', scene: [['🐶', 'bob', 25, 110], ['🐥', 'hop', 62, 100], ['⚽', 'spin', 45, 60]]},
    {text: 'We like to play!', scene: [['🐥', 'hop', 30, 110], ['🐶', 'hop', 60, 110], ['🎉', 'pop', 47, 70]]}],
   quiz: [['Who can hop?', 'Pip', ['a cat', 'a fish'], ['🐥', '🐱', '🐟']], ['What do they like to do?', 'play', ['sleep', 'eat'], ['⚽', '😴', '🍎']]]},

  {id: 'g2', title: 'The Big Red Bug', cover: '🐞', bg: 'grass', newWords: ['here', 'is', 'said'], pages: [
    {text: 'Here is a bug.', scene: [['🐞', 'pop', 45, 110], ['🍃', 'sway', 20, 70], ['🍃', 'sway', 75, 70]]},
    {text: 'The bug is big and red.', scene: [['🐞', 'grow', 45, 150]]},
    {text: 'Pip said, "Hi, bug!"', scene: [['🐥', 'bob', 25, 110], ['👋', 'shake', 38, 50], ['🐞', 'bob', 68, 90]]},
    {text: 'The bug said, "Come and play!"', scene: [['🐞', 'hop', 30, 90], ['🐥', 'hop', 65, 110]]},
    {text: 'Here we go! Run, run, run!', scene: [['🐞', 'run', 10, 80], ['🐥', 'run', 30, 100], ['💨', 'fade', 2, 50]]}],
   quiz: [['What color is the bug?', 'red', ['blue', 'green'], ['🔴', '🔵', '🟢']], ['What did Pip say?', 'Hi, bug!', ['Go away!', 'Good night!'], ['👋', '🙅', '🌙']]]},

  {id: 'g3', title: 'Pip at the Park', cover: '🌳', bg: 'park', newWords: ['went', 'this', 'they'], pages: [
    {text: 'Pip went to the park.', scene: [['🐥', 'run', 15, 100], ['🌳', 'sway', 70, 140]]},
    {text: 'Mom went too.', scene: [['🐔', 'bob', 35, 120], ['🐥', 'hop', 60, 90], ['🌳', 'sway', 85, 110]]},
    {text: 'This is a big tree.', scene: [['🌳', 'grow', 45, 190], ['🐦', 'bob', 60, 50]]},
    {text: 'They sat on a log.', scene: [['🐔', 'bob', 35, 100], ['🐥', 'bob', 58, 80], ['🪵', '', 47, 90]]},
    {text: 'They had fun in the sun.', scene: [['☀️', 'spin', 80, 90], ['🐔', 'hop', 30, 100], ['🐥', 'hop', 52, 80]]}],
   quiz: [['Where did Pip go?', 'the park', ['the shop', 'the beach'], ['🌳', '🏪', '🏖️']], ['What did they sit on?', 'a log', ['a bed', 'a car'], ['🪵', '🛏️', '🚗']]]},

  {id: 'g4', title: 'Rain Came Down', cover: '🌧️', bg: 'rain', newWords: ['down', 'out', 'there'], pages: [
    {text: 'Look out! It is wet.', scene: [['🌧️', 'bob', 45, 120], ['💧', 'fall', 20, 40], ['💧', 'fall', 50, 40], ['💧', 'fall', 75, 40]]},
    {text: 'Rain came down, down, down.', scene: [['💧', 'fall', 10, 44], ['💧', 'fall', 30, 44], ['💧', 'fall', 50, 44], ['💧', 'fall', 70, 44], ['💧', 'fall', 90, 44]]},
    {text: 'Pip got a red hat.', scene: [['🐥', 'bob', 45, 120], ['🎩', 'drop', 45, 70]]},
    {text: 'There is the sun!', scene: [['☀️', 'rise', 50, 130], ['🌈', 'pop', 20, 80]]},
    {text: 'Pip ran out to play.', scene: [['🐥', 'run', 15, 110], ['☀️', 'spin', 82, 80], ['🌈', '', 50, 70]]}],
   quiz: [['What came down?', 'rain', ['snow', 'leaves'], ['🌧️', '❄️', '🍂']], ['What did Pip get?', 'a red hat', ['a red bag', 'a red bike'], ['🎩', '👜', '🚲']]]},

  {id: 'g5', title: 'Hen Has Six Eggs', cover: '🥚', bg: 'farm', newWords: ['she', 'has', 'are', 'all'], pages: [
    {text: 'Pip has a pal. She is Hen.', scene: [['🐥', 'bob', 30, 90], ['🐔', 'bob', 62, 130]]},
    {text: 'Hen has six eggs.', scene: [['🐔', 'bob', 50, 110], ['🥚', 'pop', 15, 50], ['🥚', 'pop', 25, 50], ['🥚', 'pop', 35, 50], ['🥚', 'pop', 65, 50], ['🥚', 'pop', 75, 50], ['🥚', 'pop', 85, 50]]},
    {text: 'Are the eggs big? Yes!', scene: [['🥚', 'grow', 45, 140], ['❓', 'shake', 72, 60]]},
    {text: 'Look! All the eggs crack.', scene: [['🥚', 'shake', 20, 70], ['🥚', 'shake', 40, 70], ['🥚', 'shake', 60, 70], ['🥚', 'shake', 80, 70]]},
    {text: 'Six chicks! Hen is so glad.', scene: [['🐣', 'hop', 12, 60], ['🐣', 'hop', 28, 60], ['🐣', 'hop', 44, 60], ['🐣', 'hop', 60, 60], ['🐣', 'hop', 76, 60], ['🐣', 'hop', 92, 60]]}],
   quiz: [['How many eggs did Hen have?', '6', ['2', '10'], ['6️⃣', '2️⃣', '🔟']], ['What came out of the eggs?', 'chicks', ['fish', 'frogs'], ['🐣', '🐟', '🐸']]]},

  {id: 'g6', title: "Pip's Big Day", cover: '🎂', bg: 'party', newWords: ['my', 'for', 'be', 'more'], pages: [
    {text: '"It is my big day!" said Pip.', scene: [['🐥', 'hop', 45, 120], ['🎈', 'rise', 15, 70], ['🎈', 'rise', 80, 70]]},
    {text: 'A cake for me? Yes!', scene: [['🎂', 'pop', 45, 140], ['✨', 'spin', 70, 50]]},
    {text: 'Mom has a gift for Pip.', scene: [['🐔', 'bob', 30, 110], ['🎁', 'shake', 65, 100]]},
    {text: 'Can we have more cake?', scene: [['🐥', 'bob', 30, 100], ['🍰', 'pop', 58, 80], ['🍰', 'pop', 75, 80]]},
    {text: 'I will be big! This is fun!', scene: [['🐥', 'grow', 45, 130], ['🎉', 'pop', 15, 70], ['🎉', 'pop', 80, 70]]}],
   quiz: [['What did Pip get to eat?', 'cake', ['soup', 'corn'], ['🎂', '🥣', '🌽']], ['What did Mom give Pip?', 'a gift', ['a hat', 'a ball'], ['🎁', '🎩', '⚽']]]}
];

// ---------------------------------------------------------------------------
// 2. Word tracking: every sight word she meets, with spaced review once known.
// ---------------------------------------------------------------------------
const SIGHT_SET = new Set([].concat(...SIGHT).concat(TH_WORDS).concat(...GIGI_BOOKS.map(b => b.newWords)).map(w => w.toLowerCase()));
P.words = P.words || {}; P.stories = P.stories || {};
const REVIEW_DAYS = [1, 3, 7, 14, 30];
const wordKey = w => String(w).toLowerCase().replace(/[^a-z']/g, '');
const wordShow = w => w === 'i' ? 'I' : w;
const wrec = w => (P.words[w] = P.words[w] || {seen: 0, ok: 0, miss: 0, help: 0, days: [], stage: 0, due: 0, last: 0});
function wordState(w) {
  const r = P.words[w]; if (!r || !r.seen) return 'new';
  if (r.days.length >= 3) return Date.now() >= r.due ? 'review' : 'known';
  return 'learning';
}
/** how: 'alone' (read it herself, counts toward "known"), 'echo' (after Pip read it), 'help' (tapped for help), 'miss' */
function wordResult(word, how) {
  const w = wordKey(word); if (!SIGHT_SET.has(w)) return;
  const r = wrec(w), today = todayKey(); r.seen++; r.last = Date.now();
  if (how === 'miss') { r.miss++; if (r.days.length >= 3) { r.days = r.days.slice(-1); r.stage = 0; r.knownT = 0; } return; }
  if (how === 'help') { r.help++; return; }
  r.ok++;
  if (how === 'alone' && !r.days.includes(today)) {
    r.days = r.days.concat(today).slice(-6);
    if (r.days.length >= 3) { if (!r.knownT) r.knownT = Date.now(); r.stage = Math.min(REVIEW_DAYS.length - 1, r.days.length - 3); r.due = Date.now() + REVIEW_DAYS[r.stage] * 864e5; }
  }
}
/** Words to practise next: due reviews first, then learning words with the most trouble. */
function practiceWords(n, exclude = []) {
  const ex = new Set(exclude.map(wordKey));
  return Object.keys(P.words).filter(w => !ex.has(w) && ['review', 'learning'].includes(wordState(w)))
    .map(w => { const r = P.words[w]; return {w, score: (wordState(w) === 'review' ? 5 : 0) + (r.miss + r.help) / Math.max(1, r.seen) * 4 + (r.miss ? 1 : 0)}; })
    .sort((a, b) => b.score - a.score).slice(0, n).map(x => x.w);
}
function wordCounts() { const c = {known: 0, learning: 0, review: 0}; Object.keys(P.words).forEach(w => { const s = wordState(w); if (c[s] !== undefined) c[s]++; }); return c; }
function trickyWords(n) { return Object.keys(P.words).filter(w => P.words[w].seen >= 2).map(w => [w, (P.words[w].miss + P.words[w].help) / P.words[w].seen])
  .filter(x => x[1] >= 0.34).sort((a, b) => b[1] - a[1]).slice(0, n).map(x => x[0]); }

// The daily sight-word questions feed the word list too.
(() => { const prev = record; record = function (id, first) { try { const it = session && session.item;
  if (it && (id === 'r_sight' || id === 'r_th') && it.answer) wordResult(it.answer, first ? 'alone' : 'miss'); } catch (e) {} return prev.apply(this, arguments); }; })();

// Daily "read out loud" questions: her first try counts for every sight word in the sentence.
function wordsFromRead(text, hit) { norm(text).forEach((w, k) => wordResult(w, hit[k] ? 'alone' : 'miss')); saveAll(); }

// Same skill update as record(), for activities outside a quiz session.
function skillResult(id, first) { const s = initLvl(sk(id), id); levelStep(s, first, id); s.seen++; if (first) { s.correct++; s.streak++; s.box = Math.min(5, s.box + 1); P.stars++; } else { s.streak = 0; s.box = Math.max(0, s.box - 1); }
  s.last = Date.now(); s.hist = (s.hist || []).concat(first ? 1 : 0).slice(-20); }

// ---------------------------------------------------------------------------
// 3. Book state and unlocking
// ---------------------------------------------------------------------------
const bstate = id => (P.stories[id] = P.stories[id] || {stars: 0, reads: 0, best: 0, last: 0});
const storyUnlocked = i => i === 0 || (() => { const p = bstate(GIGI_BOOKS[i - 1].id); return p.stars >= 2 || p.reads >= 2; })();
const canMic = () => { try { return Bridge.canListen(); } catch (e) { return false; } };

// Hidden entry so trophies show on the shelf and synced rows get a nice name (no skills → not in the challenge grid).
CHALLENGES.push({id: 'gigistory', icon: '📖', name: "Pip's Stories", skills: [], car: false});

// ---------------------------------------------------------------------------
// 4. Screens
// ---------------------------------------------------------------------------
addScreen('stories', `<header class="playhead"><button class="small-btn" id="stBack">⬅ Back</button><span class="sthead">📖 ${STORY_SERIES}</span><span><button class="small-btn helpOpen">🆘 Help</button></span></header>
  <div class="stwords" id="stWords"></div><div class="stgrid" id="stGrid"></div>`);
addScreen('story', `<header class="playhead stbar"><button class="small-btn" id="spClose">✖</button><div id="spDots" class="dots"></div><span><button class="small-btn helpOpen">🆘</button></span></header>
  <div class="spbody" id="spBody"></div>`);
document.querySelectorAll('#stories .helpOpen, #story .helpOpen').forEach(b => b.onclick = openHelp);
if (typeof GU_SCREENS !== 'undefined') GU_SCREENS.push('stories', 'story');

let RD = null;  // the read in progress
function storyStop() { try { Bridge.stopSpeak(); } catch (e) {} if (RD) { RD.dead = true; clearTimeout(RD.timer); } window.__speechPartial = null; window.__speechResult = window.__speechError = () => {}; }

function renderStories() {
  storyStop();
  if (inBedtime() && !S.challengesAtRest) { $('#stGrid').innerHTML = '<p class="homemsg" style="grid-column:1/-1;text-align:center">🌙 The story books are sleeping. See you tomorrow!</p>'; $('#stWords').innerHTML = ''; show('stories'); return; }
  const c = wordCounts();
  $('#stWords').innerHTML = `<span class="pill2 known">⭐ ${c.known} words I know</span><span class="pill2 learn">🌱 ${c.learning + c.review} words I'm learning</span>`;
  $('#stGrid').innerHTML = GIGI_BOOKS.map((b, i) => { const st = bstate(b.id), open = storyUnlocked(i);
    return `<div class="stcard ${open ? '' : 'locked'} bg-${b.bg}"><span class="stnum">Book ${i + 1}</span><span class="stcover">${open ? b.cover : '🔒'}</span>
      <span class="sttitle">${esc(b.title)}</span><span class="ststars">${'⭐'.repeat(st.stars)}${'☆'.repeat(3 - st.stars)}</span>
      ${open ? `<button class="small-btn ok" data-read="${i}">${st.reads ? '🔁 Read with Pip' : '▶ Read with Pip'}</button>${st.reads ? `<button class="small-btn" data-alone="${i}">⭐ Read by myself</button>` : ''}` : `<span class="muted">Finish book ${i} first</span>`}</div>`; }).join('');
  document.querySelectorAll('[data-read]').forEach(b => b.onclick = () => openBook(+b.dataset.read, false));
  document.querySelectorAll('[data-alone]').forEach(b => b.onclick = () => openBook(+b.dataset.alone, true));
  show('stories');
  const next = GIGI_BOOKS.findIndex((b, i) => storyUnlocked(i) && !bstate(b.id).reads);
  Bridge.speak(next >= 0 ? `Pick a book! Let's read ${GIGI_BOOKS[next].title}.` : 'Pick a book to read again!');
}
$('#stBack').onclick = () => { storyStop(); renderHome(); };
$('#spClose').onclick = () => { storyStop(); renderStories(); };

function openBook(i, alone) {
  storyStop();
  const book = GIGI_BOOKS[i];
  RD = {book, i, alone, page: -1, words: {}, tries: 0, hits: 0, total: 0, dead: false, quizOk: 0, quizN: 0};
  show('story'); warmUp();
}
const spDotsDraw = () => { $('#spDots').innerHTML = [-1].concat(RD.book.pages.map((_, k) => k)).map(k => `<i class="${k < RD.page ? 'done' : k === RD.page ? 'cur' : ''}"></i>`).join(''); };

// Warm-up: the book's new words + up to 3 of her own learning words
function warmUp() {
  const r = RD, extra = practiceWords(3, r.book.newWords); r.extra = extra; spDotsDraw();
  const chip = (w, cls) => `<button class="wchip ${cls}" data-w="${esc(wordShow(w))}">${esc(wordShow(w))}</button>`;
  $('#spBody').innerHTML = `<div class="spcover bg-${r.book.bg}"><span class="bigcover">${r.book.cover}</span><h1>${esc(r.book.title)}</h1></div>
    <p class="homemsg">${r.alone ? 'You read it by yourself this time! Tap a word if you need help.' : 'New words in this book. Tap each one to hear it!'}</p>
    <div class="wrow">${r.book.newWords.map(w => chip(w, 'new')).join('')}</div>
    ${extra.length ? `<p class="muted big">Words you are learning:</p><div class="wrow">${extra.map(w => chip(w, 'learn')).join('')}</div>` : ''}
    <button class="bigbtn" id="spGo">📖 Let's read!</button>`;
  $('#spBody').querySelectorAll('[data-w]').forEach(b => b.onclick = () => { Bridge.speak(b.dataset.w); b.classList.add('heard'); });
  $('#spGo').onclick = () => { r.page = 0; drawPage(); };
  Bridge.speak(`${r.book.title}. ` + (r.alone ? 'This time, you read first!' : `New words: ${r.book.newWords.join(', ')}.`));
}

// One page
function drawPage() {
  const r = RD, pg = r.book.pages[r.page]; r.tries = 0; r.helped = new Set(); r.usedHelp = false; spDotsDraw();
  const words = pg.text.split(' ');
  $('#spBody').innerHTML = `<div class="scene bg-${r.book.bg}" id="scene">${pg.scene.map(([e, a, x, s], k) => `<i class="act ${a ? 'a-' + a : ''}" style="left:${x}%;font-size:${s}px;animation-delay:${(k * 0.15).toFixed(2)}s">${e}</i>`).join('')}</div>
    <div class="readtext sptext" id="readtext">${words.map((w, k) => `<span data-i="${k}">${esc(w)}</span>`).join(' ')}</div>
    <div class="feedback" id="spFb"></div>
    <div class="row" id="spBtns"></div>`;
  $('#readtext').querySelectorAll('span').forEach(s => s.onclick = () => { const w = s.textContent.replace(/[^A-Za-z']/g, ''); if (!w) return; Bridge.speak(w);
    s.classList.add('tapped'); setTimeout(() => s.classList.remove('tapped'), 900); r.helped.add(+s.dataset.i); });
  if (r.alone) yourTurn(true); else gigiReads(() => yourTurn(false));
}
const spSpans = () => [...document.querySelectorAll('#readtext span')];
const fb = (t, cls = '') => { const f = $('#spFb'); if (f) { f.textContent = t; f.className = 'feedback ' + cls; } };
function spButtons(html) { $('#spBtns').innerHTML = html; }

function gigiReads(after) {
  const r = RD, text = r.book.pages[r.page].text; spButtons(''); fb('🔊 Pip is reading…');
  spSpans().forEach(s => s.classList.remove('now', 'done', 'hit', 'miss', 'live'));
  speakTracked(text, i => spSpans().forEach((s, k) => { s.classList.toggle('now', k === i); s.classList.toggle('done', k < i); }),
    () => { if (r.dead || RD !== r || onScreen() !== 'story') return; spSpans().forEach(s => s.classList.remove('now', 'done')); after(); });
}

function yourTurn(aloneFirst) {
  const r = RD;
  if (!canMic()) { // no speech recognizer: honor system
    fb(aloneFirst ? 'Read it out loud. Tap a word if you need help.' : 'Your turn! Read it out loud.', '');
    spButtons(`${aloneFirst ? '<button class="small-btn" id="spHelp">🔊 Help me</button>' : '<button class="small-btn" id="spAgain">🔊 Hear it again</button>'}<button class="bigbtn2 ok" id="spDid">✅ I read it!</button>`);
    if ($('#spHelp')) $('#spHelp').onclick = () => gigiReads(() => yourTurn(false));
    if ($('#spAgain')) $('#spAgain').onclick = () => gigiReads(() => yourTurn(false));
    $('#spDid').onclick = () => { pageDone(null, aloneFirst); };
    Bridge.speak(aloneFirst ? 'Read it out loud.' : 'Your turn!');
    return;
  }
  fb(aloneFirst ? 'Your turn first! Tap the microphone and read.' : 'Your turn! Tap the microphone and read it like Pip.');
  spButtons(`${aloneFirst ? '<button class="small-btn" id="spHelp">🔊 Help me</button>' : '<button class="small-btn" id="spAgain">🔊 Hear it again</button>'}<button class="mic" id="spMic">🎤 <span>Tap and read</span></button>`);
  if ($('#spHelp')) $('#spHelp').onclick = () => { r.usedHelp = true; gigiReads(() => yourTurn(false)); r.aloneThisPage = false; };
  if ($('#spAgain')) $('#spAgain').onclick = () => gigiReads(() => yourTurn(false));
  r.aloneThisPage = aloneFirst;
  $('#spMic').onclick = () => listenPage(aloneFirst);
  if (!aloneFirst) Bridge.speak('Your turn!');
}

// Speech engines spell "Pip" many ways (GG, Gg, Pip's…), so story names always count as read.
const STORY_NAMES = new Set(['gigi', "gigi's"]);
function scorePage(text, alts) {
  const res = scoreRead(text, alts), tw = norm(text);
  tw.forEach((w, k) => { if (STORY_NAMES.has(w)) res.hit[k] = true; });
  res.score = res.hit.filter(Boolean).length / Math.max(1, tw.length); return res;
}

function listenPage(aloneFirst) {
  const r = RD, text = r.book.pages[r.page].text, btn = $('#spMic'); if (!btn || btn.classList.contains('listening')) return;
  Bridge.stopSpeak(); btn.classList.add('listening'); btn.querySelector('span').textContent = 'Listening… read now!';
  spSpans().forEach(s => s.classList.remove('hit', 'miss', 'live'));
  window.__speechPartial = txt => { if (RD !== r) return; const p = scoreRead(text, [String(txt)]); spSpans().forEach((s, k) => s.classList.toggle('live', !!p.hit[k])); };
  Bridge.listen(alts => {
    if (r.dead || RD !== r) return; window.__speechPartial = null;
    const res = scorePage(text, alts); r.tries++;
    if (r.tries === 1) r.firstHit = res.hit.slice();   // her first try is what the score and word list use
    spSpans().forEach((s, k) => { s.classList.remove('live'); s.className = res.hit[k] ? 'hit' : 'miss'; });
    // A pass needs most words AND roughly the right amount of speech, so room noise doesn't count.
    const heard = Math.max(...alts.map(a => norm(a).length), 0), need = norm(text).length;
    const pass = res.score >= 0.8 && heard >= Math.ceil(need * 0.6);
    if (pass || r.tries >= 3) pageDone(res, aloneFirst && r.tries === 1 && !r.usedHelp, pass);
    else { const miss = norm(text).filter((w, k) => !res.hit[k]).slice(0, 3);
      fb(`Good try! Listen to: ${miss.join(', ')}`, 'warn'); Bridge.speak(`Good try! Listen: ${miss.join(', ')}.`);
      btn.classList.remove('listening'); btn.querySelector('span').textContent = 'Tap and read again';
      if (aloneFirst && r.tries === 1) { r.aloneThisPage = false; } }
  }, () => {
    if (r.dead || RD !== r) return; window.__speechPartial = null; r.tries++;
    btn.classList.remove('listening'); btn.querySelector('span').textContent = 'Tap and read';
    if (r.tries >= 3) { spButtons(`<button class="small-btn" id="spSkip">⏭ Next page</button>`); $('#spSkip').onclick = () => pageDone(null, false); fb('I could not hear you. Let\'s keep going!', 'warn'); }
    else fb('I could not hear you. Try again, a little louder!', 'warn');
  });
}

// Record the words on this page, then praise and move on.
function pageDone(res, aloneCredit, passed = true) {
  const r = RD, text = r.book.pages[r.page].text, toks = text.split(' ');
  const first = res && r.firstHit ? r.firstHit : null;
  toks.forEach((tok, k) => { const w = wordKey(tok); if (!w) return;
    r.total++; const hit = first ? !!first[k] : true; if (hit) r.hits++;
    if (!res) { wordResult(w, r.helped.has(k) ? 'help' : 'echo'); return; }       // no mic: seen, not proof
    if (r.helped.has(k)) wordResult(w, 'help');
    else if (!hit) { wordResult(w, 'miss'); if (res.hit[k]) wordResult(w, 'echo'); } // missed first, got it on a retry
    else wordResult(w, aloneCredit ? 'alone' : 'echo'); });
  r.firstHit = null;
  saveAll();
  const last = r.page >= r.book.pages.length - 1;
  const msg = passed ? pick(['Great reading!', 'Super!', 'You did it!', 'Wonderful!', 'Pip is so proud!']) : 'Good try! Let\'s keep going.';
  fb((passed ? '⭐ ' : '💪 ') + msg, passed ? 'good' : 'warn'); Bridge.speak(msg); if (passed) confetti(10);
  spButtons(`<button class="bigbtn2 ok" id="spNext">${last ? '🎉 The end!' : '▶ Next page'}</button>`);
  $('#spNext').onclick = () => { if (last) quizStart(); else { r.page++; drawPage(); } };
}

// ---------------------------------------------------------------------------
// 5. After the book: 2 story questions + "find the word"
// ---------------------------------------------------------------------------
function quizStart() {
  const r = RD; r.page = r.book.pages.length; spDotsDraw();
  const words = r.book.newWords.slice(0, 2).concat((r.extra || []).slice(0, 2));
  r.qs = r.book.quiz.map(([q, a, wrong, emo]) => ({kind: 'comp', q, a, choices: [a].concat(wrong), emo}))
    .concat(words.map(w => { const pool = [...SIGHT_SET].filter(x => x !== w && x.length > 1);
      const look = shuffle(pool.filter(x => x[0] === w[0] || x.length === w.length)).concat(shuffle(pool));   // look-alike words first
      return {kind: 'word', q: `Find the word: ${wordShow(w)}`, a: wordShow(w), choices: [wordShow(w)].concat(uniq(look).slice(0, 2))}; }));
  r.qi = 0; quizQ();
}
function quizQ() {
  const r = RD, q = r.qs[r.qi]; if (!q) return finishGigiBook();
  const order = shuffle(q.choices.map((c, k) => k));
  $('#spBody').innerHTML = `<div class="prompt">${q.kind === 'word' ? '👀 ' : '🤔 '}${esc(q.q)}</div>
    <div class="answers">${order.map(k => `<button class="choice ${q.kind === 'word' ? 'wordc' : 'pic'}" data-k="${k}">${q.kind === 'comp' && q.emo ? `<span class="emo sm">${q.emo[k]}</span><br>` : ''}${esc(q.choices[k])}</button>`).join('')}</div>
    <div class="feedback" id="spFb"></div>`;
  r.qTries = 0; r.qLocked = false;
  $('#spBody').querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
    if (r.qLocked) return; const right = +b.dataset.k === 0; r.qTries++;
    if (right) { r.qLocked = true; b.classList.add('right'); const first = r.qTries === 1;
      if (q.kind === 'comp') { r.quizN++; if (first) r.quizOk++; skillResult('r_comp', first); }
      else wordResult(q.a, first ? 'alone' : 'miss');
      saveAll(); const m = pick(PRAISE); fb('⭐ ' + m, 'good'); Bridge.speak(m); confetti(first ? 12 : 4);
      setTimeout(() => { if (RD === r && !r.dead) { r.qi++; quizQ(); } }, 1500); }
    else { b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 600); fb('Try again!', 'warn'); Bridge.speak(q.kind === 'word' ? `Try again. Find ${q.a}.` : 'Try again!'); }
  });
  Bridge.speak(q.kind === 'word' ? `Find the word ${q.a}.` : q.q);
}

function finishGigiBook() {
  const r = RD, st = bstate(r.book.id), acc = r.total ? r.hits / r.total : 1, first = !st.reads;
  const stars = canMic() ? (r.alone && acc >= 0.9 ? 3 : acc >= 0.85 ? 2 : 1) : (r.alone ? 3 : 2);
  st.reads++; st.last = Date.now(); st.best = Math.max(st.best, Math.round(acc * 100)); const newStars = stars > st.stars; st.stars = Math.max(st.stars, stars);
  P.sessions.push({date: todayKey(), t: Date.now(), n: r.total, ok: r.hits, dur: 0, mins: 0, challenge: 'gigistory', level: r.i + 1, pass: true, story: r.book.id,
    skills: [{skill: 'r_aloud', first: acc >= 0.85}].concat(Array.from({length: r.quizN}, (_, k) => ({skill: 'r_comp', first: k < r.quizOk})))});
  P.sessions = P.sessions.slice(-400);
  let trophy = '';
  if (first) { const m = acc >= 0.95 ? {e: '🏆', c: 'gold', t: 'Gold'} : acc >= 0.8 ? {e: '🥈', c: 'silver', t: 'Silver'} : {e: '🥉', c: 'bronze', t: 'Bronze'};
    P.trophies.push({ch: 'gigistory', level: r.i + 1, ok: r.hits, n: r.total, medal: m.c, t: Date.now()}); trophy = m; }
  saveAll();
  const nextI = r.i + 1, unlockedNext = nextI < GIGI_BOOKS.length && storyUnlocked(nextI);
  $('#spBody').innerHTML = `<div class="homewrap"><div class="bigtrophy ${trophy ? trophy.c : ''}">${trophy ? trophy.e : '⭐'}</div>
    <h1>${trophy ? `${trophy.t} trophy!` : 'Great reading!'}</h1>
    <p class="homemsg">You read <b>${esc(r.book.title)}</b>${canMic() ? `<br>and read <b>${Math.round(acc * 100)}%</b> of the words right` : ''}!</p>
    <div class="rstars">${'⭐'.repeat(st.stars)}${'☆'.repeat(3 - st.stars)}</div>
    ${unlockedNext ? `<p class="homemsg">📖 Next book: <b>${esc(GIGI_BOOKS[nextI].title)}</b></p>` : nextI < GIGI_BOOKS.length ? `<p class="homemsg">Read it once more to open the next book!</p>` : `<p class="homemsg">You finished the whole series! 🎉</p>`}
    <div class="row">${unlockedNext ? `<button class="bigbtn" id="spNextBook">▶ Next book</button>` : ''}<button class="bigbtn2 ghost" id="spLib">📚 All books</button></div></div>`;
  if ($('#spNextBook')) $('#spNextBook').onclick = () => openBook(nextI, false);
  $('#spLib').onclick = () => renderStories();
  confetti(trophy ? 70 : 30);
  Bridge.speak((trophy ? `${trophy.t} trophy! ` : 'Great reading! ') + (newStars ? `You got ${st.stars} stars! ` : '') + (unlockedNext ? `The next book is ${GIGI_BOOKS[nextI].title}.` : ''));
  if (typeof shareState === 'function') setTimeout(shareState, 1500);
  if (typeof trySync === 'function') setTimeout(trySync, 4000);   // log the book in the family Sheet
  RD = null;
}

// ---------------------------------------------------------------------------
// 6. Wiring: home button, sharing between devices, grown-ups card
// ---------------------------------------------------------------------------
(() => { const row = document.querySelector('#home .homewrap .row'); if (!row) return;
  const b = document.createElement('button'); b.className = 'bigbtn2 storybtn'; b.id = 'storyBtn'; b.textContent = '📖 Pip\'s Stories'; b.onclick = renderStories;
  row.insertBefore(b, row.firstChild); })();

// Coming back to the app (screen off/on) keeps her on her book.
(() => { const prev = window.onNativeResume; window.onNativeResume = () => { const on = onScreen(); if (on === 'story' || on === 'stories') return; if (prev) prev(); }; })();

if (typeof mergeProgress === 'function') {
  const prevMerge = mergeProgress;
  mergeProgress = function (L, R, base) {
    const out = prevMerge.apply(this, arguments);
    out.words = {}; new Set(Object.keys(L.words || {}).concat(Object.keys(R.words || {}))).forEach(w => {
      const a = (L.words || {})[w], b = (R.words || {})[w]; out.words[w] = !a ? b : !b ? a : ((b.last || 0) > (a.last || 0) ? b : a); });
    out.bonus = {}; [L.bonus || {}, R.bonus || {}].forEach(src => Object.keys(src).forEach(d => { out.bonus[d] = Object.assign(out.bonus[d] || {}, src[d]); }));   // extra minutes, by command id
    out.stories = {}; new Set(Object.keys(L.stories || {}).concat(Object.keys(R.stories || {}))).forEach(id => {
      const a = (L.stories || {})[id] || {}, b = (R.stories || {})[id] || {};
      out.stories[id] = {stars: Math.max(a.stars || 0, b.stars || 0), reads: Math.max(a.reads || 0, b.reads || 0), best: Math.max(a.best || 0, b.best || 0), last: Math.max(a.last || 0, b.last || 0)}; });
    return out;
  };
}

// Extra summary sent to the family Sheet (dashboard + weekly email). Kept small: the Sheet stores it in one property.
function progressExtras() {
  const c = wordCounts(), week = Date.now() - 7 * 864e5;
  const words = {known: c.known, learning: c.learning, review: c.review,
    newKnown: Object.keys(P.words).filter(w => P.words[w].knownT > week).slice(0, 15).map(wordShow),
    tricky: trickyWords(8).map(wordShow), practising: practiceWords(8).map(wordShow)};
  const books = GIGI_BOOKS.map((b, i) => ({t: b.title, s: bstate(b.id).stars, r: bstate(b.id).reads}));
  const next = GIGI_BOOKS.find((b, i) => storyUnlocked(i) && !bstate(b.id).reads);
  const lv = Object.keys(SKILLS).filter(id => P.skills[id] && P.skills[id].seen).map(id => { const s = initLvl(sk(id), id), h = (s.hist || []).slice(-10);
    return {k: SKILLS[id].label.split(' (')[0], l: s.lvl, a: h.length >= 5 ? Math.round(100 * h.reduce((x, y) => x + y, 0) / h.length) : null, d: s.lvlT > week ? s.lvlDir : 0}; });
  return {words, stories: {series: STORY_SERIES, books, next: next ? next.title : ''},
    levels: {changes: lv.filter(x => x.d).map(x => ({k: x.k, l: x.l, d: x.d})),
      focus: lv.filter(x => x.a != null && x.a < 75).sort((a, b) => a.a - b.a).slice(0, 5).map(x => ({k: x.k, l: x.l, a: x.a}))}};
}

// Grown-ups: every practised skill with its level and how she's doing lately.
function levelsCard() {
  const rows = Object.keys(SKILLS).filter(id => P.skills[id] && P.skills[id].seen).map(id => { const s = initLvl(sk(id), id), h = (s.hist || []).slice(-10);
    const acc = h.length ? Math.round(100 * h.reduce((a, b) => a + b, 0) / h.length) : null;
    const moved = s.lvlT && Date.now() - s.lvlT < 7 * 864e5 ? (s.lvlDir > 0 ? ' ⬆️' : ' ⬇️') : '';
    return {id, subj: SKILLS[id].subject, label: SKILLS[id].label.split(' (')[0], lvl: s.lvl, acc, moved}; });
  if (!rows.length) return '';
  rows.sort((a, b) => a.subj.localeCompare(b.subj) || (a.acc ?? 101) - (b.acc ?? 101));
  const cls = a => a == null ? '' : a >= 85 ? 'lv-good' : a < 60 ? 'lv-low' : 'lv-mid';
  return `<div class="card" id="lvCard"><h3>📈 Levels (adjusts to how ${esc(kidName())} is doing)</h3>
    <table class="lvtab"><tr><th>Skill</th><th>Level</th><th>Last 10, right first try</th></tr>
    ${rows.map(r => `<tr><td>${esc(r.label)}</td><td>${'●'.repeat(r.lvl)}${'○'.repeat(3 - r.lvl)}${r.moved}</td><td class="${cls(r.acc)}">${r.acc == null ? '–' : r.acc + '%'}</td></tr>`).join('')}</table>
    <p class="muted">Each skill moves up a level after 85% or more right on the first try over the last 8–10 answers, and down below 60%. New skills start at the level for the grade chosen in setup. ⬆️ ⬇️ = changed this week.</p></div>`;
}

(() => { const prevRP = renderParent;
  renderParent = function () { const r = prevRP.apply(this, arguments);
    try { const c = wordCounts(), done = GIGI_BOOKS.filter(b => bstate(b.id).reads).length, tricky = trickyWords(8), learn = practiceWords(8);
      const html = `<div class="card" id="stCard"><h3>📖 Pip's Stories &amp; sight words</h3>
        <p>Books read: <b>${done}</b> of ${GIGI_BOOKS.length} · Words known: <b>${c.known}</b> · Learning: <b>${c.learning}</b> · Due for review: <b>${c.review}</b></p>
        ${learn.length ? `<p>Practising next: ${learn.map(w => esc(wordShow(w))).join(', ')}</p>` : ''}${tricky.length ? `<p>Tricky words: <b>${tricky.map(w => esc(wordShow(w))).join(', ')}</b></p>` : ''}
        <p class="muted">A word counts as "known" after it is read without help on 3 different days. Known words come back for review after 1, 3, 7, 14 and 30 days.</p></div>`;
      const body = $('#parentBody'); if (body && !$('#stCard')) body.insertAdjacentHTML('beforeend', html + levelsCard());
      if (body && !$('#moreCard') && S.dailyMaxMinutes) { body.insertAdjacentHTML('afterbegin', `<div class="card" id="moreCard"><h3>📚 Let ${esc(kidName())} earn more play time today</h3>
        <p>Play today: <b>${minutesToday()}</b> of <b>${dailyCap()}</b> min${bonusToday() ? ` (daily limit ${S.dailyMaxMinutes} + ${bonusToday()} extra)` : ''}.</p>
        <div class="row"><button class="small-btn ok" data-more="30">📚 +30 min to earn</button><button class="small-btn ok" data-more="60">📚 +60 min to earn</button></div>
        <p class="muted">It still has to be earned: questions or "I read a book" unlock play again, up to the extra minutes. Only for today. Rest time still applies.</p></div>`);
        document.querySelectorAll('[data-more]').forEach(b => b.onclick = () => { addBonus('here-' + Date.now(), +b.dataset.more); b.textContent = `✅ +${b.dataset.more} added`; }); } } catch (e) { console.error(e); }
    return r; };
})();
