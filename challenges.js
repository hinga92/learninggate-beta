/* Challenges, trophies, treats and car mode — extra practice that never unlocks play time. */
'use strict';

const CHALLENGES = [
  {id: 'unit2',   icon: '⭐', name: 'Grade 1 Math Review', skills: ['m_three', 'm_rest', 'm_place', 'm_doubles', 'm_add20', 'm_sub20', 'm_bond'], car: true},
  {id: 'kcount',  icon: '🔢', name: 'Counting Fun',       skills: ['mk_count', 'mk_more', 'mk_teen', 'mk_add5', 'mk_make10'], car: true},
  {id: 'g2math',  icon: '🪙', name: 'Coins, Arrays & 100s', skills: ['m2_money', 'm2_array', 'm2_add100', 'm2_evenodd', 'm2_skip', 'm2_place3', 'm2_timefacts'], car: true},
  {id: 'times',   icon: '✖️', name: 'Times Table Champ',  skills: ['m3_mult', 'm3_div', 'm3_unknown'], car: true},
  {id: 'fracs',   icon: '🍕', name: 'Fraction Pizza',     skills: ['m3_frac', 'm4_fraceq', 'm4_fracadd', 'm4_fracmul', 'm5_fracadd', 'm5_fracmul'], car: false},
  {id: 'bignum',  icon: '🚀', name: 'Big Number Blast',   skills: ['m3_round', 'm3_add1000', 'm4_place', 'm4_mult', 'm4_div', 'm5_div', 'm5_pow10'], car: true},
  {id: 'geo',     icon: '📐', name: 'Shapes, Area & Angles', skills: ['m3_area', 'm3_perim', 'm4_angles', 'm4_triangles', 'm4_areaword', 'm5_volume', 'm5_coord', 'm5_shapes'], car: false},
  {id: 'decimal', icon: '💲', name: 'Decimal Dash',       skills: ['m4_dec', 'm5_decops', 'm5_pow10'], car: true},
  {id: 'words',   icon: '🧩', name: 'Word Wizard',        skills: ['r_prefix', 'r_suffix', 'r_roots', 'r_syn', 'r_ant', 'r_multi', 'r_context', 'r_figur'], car: true},
  {id: 'grammar', icon: '📝', name: 'Grammar Gym',        skills: ['w_irrpast', 'w_irrplural', 'w_pos', 'w_agree', 'w_tense', 'w_sentence', 'w_punct2', 'r_homo', 'w_spell2'], car: false},
  {id: 'reader',  icon: '📚', name: 'Reading Detective',  skills: ['r_passage'], car: false},
  {id: 'world',   icon: '🌎', name: 'Science & Social Studies', skills: ['sci_K', 'sci_1', 'sci_2', 'sci_3', 'sci_4', 'sci_5', 'soc_K', 'soc_1', 'soc_2', 'soc_3', 'soc_4', 'soc_5', 'hlth_K2', 'hlth_35', 'arts_K2', 'arts_35'], car: true},
  {id: 'bonds',   icon: '🔗', name: 'Bonds & Frames',     skills: ['m_bond'], car: false},
  {id: 'th',      icon: '🧠', name: 'Th- Word Hunt',      skills: ['r_th'], car: true},
  {id: 'doubles', icon: '🎲', name: 'Doubles Dash',      skills: ['m_doubles'], car: true},
  {id: 'mathmix', icon: '➕', name: 'Math Mix',           skills: ['m_add10', 'm_sub10', 'm_add20', 'm_sub20', 'm_missing', 'm_turn', 'm_factfam', 'm_truefalse'], car: true},
  {id: 'story',   icon: '🧩', name: 'Number Puzzles',     skills: ['m_word', 'm_compare', 'm_place', 'm_count'], car: true},
  {id: 'sight',   icon: '👀', name: 'Sight Word Safari',  skills: ['r_sight', 'r_th'], car: true},
  {id: 'sounds',  icon: '🔤', name: 'Sound Spy',          skills: ['r_end', 'r_begin', 'r_syll', 'r_rhyme', 'r_digraph'], car: true},
  {id: 'detect',  icon: '🔍', name: 'Story Detective',    skills: ['r_comp', 'r_vocab'], car: true},
  {id: 'aloud',   icon: '🎤', name: 'Read-Aloud Star',    skills: ['r_aloud'], car: true, needsMic: true},
  {id: 'writer',  icon: '✏️', name: 'Sentence Builder',   skills: ['w_order', 'w_caps', 'w_punct', 'w_spell'], car: false},
  {id: 'explore', icon: '🔬', name: 'Science & Art',      skills: ['s_earth', 's_life', 's_phys', 'a_color', 'a_pattern', 'a_art', 'm_shapes', 'm_time'], car: false}
];
const CH_Q = 10;                                   // questions per challenge level
const passMark = lvl => lvl <= 3 ? 8 : 9;          // first-try right needed for a trophy
const chLevelDifficulty = lvl => Math.min(3, lvl); // levels 1–3 get harder, 4+ = champion levels

Object.assign(DEFAULT_SETTINGS, {treatText: 'a special treat', trophiesPerTreat: 10, challengesAtRest: false, maxChallengesPerDay: 0, carMode: false});
for (const k of ['treatText', 'trophiesPerTreat', 'challengesAtRest', 'maxChallengesPerDay', 'carMode']) if (S[k] === undefined) S[k] = DEFAULT_SETTINGS[k];
P.ch = P.ch || {}; P.trophies = P.trophies || []; P.treatsGiven = P.treatsGiven || 0; P.treatLog = P.treatLog || [];
const chState = id => (P.ch[id] = P.ch[id] || {level: 1, tries: 0, best: 0});
const trophyCount = () => P.trophies.length;
const treatsEarned = () => Math.floor(trophyCount() / Math.max(1, S.trophiesPerTreat));
const treatsWaiting = () => Math.max(0, treatsEarned() - P.treatsGiven);
const challengesToday = () => P.sessions.filter(s => s.date === todayKey() && s.challenge).length;
const medal = (ok, n) => ok >= n ? {e: '🏆', c: 'gold', t: 'Gold'} : ok >= n - 1 ? {e: '🥈', c: 'silver', t: 'Silver'} : {e: '🥉', c: 'bronze', t: 'Bronze'};

function challengeAllowed() {
  if (inBedtime() && !S.challengesAtRest) return 'rest';
  if (S.maxChallengesPerDay && challengesToday() >= S.maxChallengesPerDay) return 'max';
  return '';
}

function treatBar() {
  const per = Math.max(1, S.trophiesPerTreat), have = trophyCount() % per, waiting = treatsWaiting();
  const cells = Array.from({length: per}, (_, i) => `<i class="${i < have ? 'on' : ''}">${i < have ? '🏆' : ''}</i>`).join('');
  return `<div class="treatbar">${cells}<span class="gift">🎁</span></div>
    <div class="treatline">${waiting ? `<b>🎉 You earned ${waiting > 1 ? waiting + ' treats' : 'a treat'}! Show ${esc(helperName())}.</b>` : `${per - have} more ${per - have === 1 ? 'trophy' : 'trophies'} to ${esc(S.treatText)}!`}</div>`;
}

function renderChallenges() {
  const block = challengeAllowed(), canMic = Bridge.canListen();
  document.body.classList.toggle('car', !!S.carMode);
  $('#chTop').innerHTML = `<div class="chcount">🏆 <b>${trophyCount()}</b> trophies</div>${treatBar()}`;
  $('#carToggle').textContent = S.carMode ? '🚗 Car mode: ON' : '🚗 Car mode: off';
  $('#carToggle').classList.toggle('on', !!S.carMode);
  // only challenges that have skills for this child's grade
  const okSkill = s => SKILLS[s] && S.subjects[SKILLS[s].subject] && gradeOk(s);
  const list = CHALLENGES.filter(c => (!c.needsMic || canMic) && (!S.carMode || c.car) && c.skills.some(okSkill));
  $('#chGrid').innerHTML = block ? `<p class="homemsg">${block === 'rest' ? '🌙 Challenges are resting too. See you tomorrow!' : '🌟 That\'s all the challenges for today. Amazing work!'}</p>` :
    list.map(c => { const st = chState(c.id); const got = P.trophies.filter(t => t.ch === c.id).length;
      return `<button class="chcard" data-ch="${c.id}"><span class="chicon">${c.icon}</span><span class="chname">${c.name}</span>
        <span class="chlvl">Level ${st.level}${st.level > 3 ? ' · Champion' : ''}</span><span class="chgot">${got ? '🏆 × ' + got : 'No trophy yet'}</span></button>`; }).join('');
  document.querySelectorAll('[data-ch]').forEach(b => b.onclick = () => startChallenge(b.dataset.ch));
  show('challenges');
  Bridge.speak(S.carMode ? 'Car mode! Pick a challenge. I will read everything to you.' : 'Pick a challenge and win a trophy!');
}

function startChallenge(cid) {
  const c = CHALLENGES.find(x => x.id === cid), st = chState(cid);
  const pool = c.skills.filter(s => SKILLS[s] && S.subjects[SKILLS[s].subject] && gradeOk(s)).concat([]);
  if (!pool.length) c.skills.filter(s => SKILLS[s] && S.subjects[SKILLS[s].subject]).forEach(s => pool.push(s));
  const plan = []; let last = null;
  for (let i = 0; i < CH_Q; i++) { let id = weightedPick(pool, new Set(pool.length > 1 && last ? [last] : [])); plan.push(id); last = id; }
  session = {plan, i: 0, firstTry: 0, start: Date.now(), results: [], practice: true,
    challenge: {id: cid, level: st.level, difficulty: chLevelDifficulty(st.level), name: c.name, icon: c.icon}};
  st.tries++; nextQuestion();
}

function finishChallenge() {
  const ch = session.challenge, n = session.results.length, ok = session.firstTry, st = chState(ch.id);
  const dur = Math.round((Date.now() - session.start) / 1000), pass = ok >= Math.min(n, passMark(ch.level));
  P.sessions.push({date: todayKey(), t: Date.now(), n, ok, dur, mins: 0, skills: session.results, challenge: ch.id, level: ch.level, pass});
  P.sessions = P.sessions.slice(-400);
  st.best = Math.max(st.best || 0, ok);
  let html, say;
  if (pass) {
    const m = medal(ok, n), before = treatsEarned();
    P.trophies.push({ch: ch.id, level: ch.level, ok, n, medal: m.c, t: Date.now()});
    st.level++;
    const newTreat = treatsEarned() > before;
    html = `<div class="bigtrophy ${m.c}">${m.e}</div><h1>${m.t} trophy!</h1><p class="homemsg">${ch.icon} ${ch.name} · Level ${ch.level}<br><b>${ok}</b> of <b>${n}</b> right on the first try.</p>
      ${newTreat ? `<div class="treatwin">🎁 You earned ${esc(S.treatText)}! Show ${esc(helperName())}!</div>` : ''}${treatBar()}`;
    say = `${m.t} trophy! You finished level ${ch.level}.` + (newTreat ? ` You earned a treat! Show ${helperName()}!` : ` Next up: level ${st.level}!`);
    confetti(newTreat ? 120 : 70);
  } else {
    const need = passMark(ch.level);
    html = `<div class="bigtrophy try">💪</div><h1>So close!</h1><p class="homemsg">You got <b>${ok}</b> of <b>${n}</b>. Get <b>${need}</b> right to win the trophy.<br>Every try makes your brain stronger!</p>${treatBar()}`;
    say = `So close! You got ${ok}. Get ${need} right to win the trophy. Try again!`;
    confetti(10);
  }
  saveAll();
  $('#chResultBody').innerHTML = html;
  $('#chAgain').textContent = pass ? `▶ Level ${st.level}` : '🔁 Try again';
  $('#chAgain').onclick = () => startChallenge(ch.id);
  show('chresult'); Bridge.speak(say);
}

function renderShelf() {
  const by = {}; P.trophies.forEach(t => (by[t.ch] = by[t.ch] || []).push(t));
  $('#shelfBody').innerHTML = `${treatBar()}` + (P.trophies.length ? CHALLENGES.filter(c => by[c.id]).map(c => `<div class="shelfrow"><span class="shelfname">${c.icon} ${c.name}</span><span class="shelfcups">${by[c.id].map(t => `<span class="cup ${t.medal}" title="Level ${t.level}">${t.medal === 'gold' ? '🏆' : t.medal === 'silver' ? '🥈' : '🥉'}</span>`).join('')}</span></div>`).join('')
    : '<p class="homemsg">No trophies yet. Win your first one in a challenge!</p>');
  show('shelf');
}

// car mode: repeat the question if nothing happens for a while
let carTimer = null;
function carRepeat(it) {
  clearTimeout(carTimer);
  if (!S.carMode) return;
  carTimer = setTimeout(() => { if (session && session.item === it && !session.locked && document.querySelector('.screen.on')?.id === 'quiz') { Bridge.speak(it.type === 'aloud' ? 'Press the microphone and read the sentence.' : it.say); carRepeat(it); } }, 14000);
}

function parentTreatCard() {
  const w = treatsWaiting();
  return `<div class="card"><h3>🏆 Trophies and treats</h3>
    <p>Trophies: <b>${trophyCount()}</b> · Treats earned: <b>${treatsEarned()}</b> · Given: <b>${P.treatsGiven}</b>${w ? ` · <b style="color:#C2560F">${w} waiting</b>` : ''}</p>
    <label>The treat <input id="tText" value="${esc(S.treatText)}"></label>
    <label>Trophies per treat <input id="tPer" type="number" min="3" max="50" value="${S.trophiesPerTreat}"></label>
    <label>Most challenges per day (0 = no limit) <input id="tMax" type="number" min="0" max="50" value="${S.maxChallengesPerDay}"></label>
    <label class="chk"><input id="tRest" type="checkbox" ${S.challengesAtRest ? 'checked' : ''}> Allow challenges during rest time (for car rides)</label>
    <p class="muted">A trophy needs 8 of 10 right on the first try (9 of 10 from level 4). Challenges never unlock play time.</p>
    <div class="row"><button class="small-btn ok" id="tGive" ${w ? '' : 'disabled'}>🎁 Mark 1 treat as given</button></div>
    ${P.treatLog.length ? `<p class="muted">Given: ${P.treatLog.slice(-6).map(d => new Date(d).toLocaleDateString()).join(', ')}</p>` : ''}</div>`;
}
function saveTreatSettings() {
  if (!$('#tText')) return;
  S.treatText = $('#tText').value.trim() || DEFAULT_SETTINGS.treatText;
  S.trophiesPerTreat = Math.max(3, Math.min(50, +$('#tPer').value || 10));
  S.maxChallengesPerDay = Math.max(0, +$('#tMax').value || 0);
  S.challengesAtRest = $('#tRest').checked;
}
