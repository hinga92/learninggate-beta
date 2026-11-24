/* Learning Gate — curriculum map K–5 and the math skills added for Kindergarten to Grade 5.
   Aligned to the California Common Core State Standards for Mathematics (codes in `std`).
   g: [first grade, last grade] (K = 0) decides which children see a skill; base: the grade its level 1 is written for
   (a child one grade above starts at level 2, two grades above at level 3). Levels then adapt (85% up / 60% down). */
'use strict';

// ---------- 1. Grade ranges for the original (Grade 1-centred) skills ----------
const ORIGINAL_RANGES = {
  m_add10: [0, 2], m_sub10: [0, 2], m_add20: [1, 2], m_doubles: [1, 2], m_sub20: [1, 2], m_missing: [1, 3], m_truefalse: [1, 2], m_turn: [1, 2],
  m_factfam: [1, 3], m_word: [0, 2], m_place: [1, 2], m_compare: [0, 2], m_count: [0, 1], m_shapes: [0, 3], m_bond: [1, 2], m_three: [1, 2],
  m_rest: [1, 2], m_time: [1, 2], m_measure: [0, 1], m_data: [0, 3],
  r_end: [0, 1], r_begin: [0, 1], r_syll: [0, 2], r_rhyme: [0, 1], r_cvc: [0, 1], r_digraph: [1, 2], r_silente: [1, 2], r_sight: [0, 3], r_th: [1, 1],
  r_vocab: [0, 3], r_comp: [0, 2], r_aloud: [0, 5],
  w_order: [0, 2], w_caps: [1, 2], w_spell: [0, 2], w_punct: [1, 2],
  s_earth: [0, 2], s_life: [0, 2], s_phys: [0, 2], a_color: [0, 2], a_pattern: [0, 2], a_art: [0, 5], ss_civics: [0, 2]
};
Object.entries(ORIGINAL_RANGES).forEach(([id, g]) => { if (SKILLS[id]) SKILLS[id].g = g; });

// add a skill: addSkill('m3_mult', {subject, label, std, weight, g, base}, generator)
function addSkill(id, meta, gen) { SKILLS[id] = Object.assign({weight: 1.2, base: meta.g[0]}, meta); G[id] = gen; }

// ---------- 2. Small helpers and pictures ----------
const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
const fr = (n, d) => `${n}/${d}`;
const simp = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
const fmtMixed = (n, d) => { const w = Math.floor(n / d), r = n % d; return w && r ? `${w} ${r}/${d}` : w ? String(w) : `${r}/${d}`; };
const commas = n => Number(n).toLocaleString('en-US');
const dec = (x, p = 2) => String(+x.toFixed(p));
const choiceItem = (o) => Object.assign({type: 'choice', wordChoices: true}, o);
const numItem = (o) => Object.assign({type: 'number'}, o, {maxLen: Math.max(3, String(o.answer).length)});
const uniqChoices = (ans, wrongs, n = 4) => choicesFrom(ans, wrongs.filter(w => String(w) !== String(ans)), n);

function arraySVG(rows, cols, emoji = '🟠') {   // equal groups in rows
  return `<div class="arr">${Array.from({length: rows}, () => `<div>${emoji.repeat(cols)}</div>`).join('')}</div>`;
}
function fracBarSVG(n, d, color = '#4C7BF3') {
  const w = 300, h = 46, cw = w / d; let s = '';
  for (let i = 0; i < d; i++) s += `<rect x="${i * cw + 2}" y="2" width="${cw - 4}" height="${h - 4}" rx="6" fill="${i < n ? color : '#fff'}" stroke="#333" stroke-width="3"/>`;
  return `<svg viewBox="0 0 ${w + 4} ${h + 4}" class="fracbar" width="320">${s}</svg>`;
}
function numberLineSVG(d, mark, max = 1) {   // 0 … max, ticks every 1/d, a dot at mark/d
  const W = 340, x0 = 20, x1 = W - 20, n = d * max, X = k => x0 + (x1 - x0) * k / n; let s = `<line x1="${x0}" y1="40" x2="${x1}" y2="40" stroke="#333" stroke-width="3"/>`;
  for (let k = 0; k <= n; k++) s += `<line x1="${X(k)}" y1="30" x2="${X(k)}" y2="50" stroke="#333" stroke-width="${k % d === 0 ? 4 : 2}"/>` + (k % d === 0 ? `<text x="${X(k)}" y="74" text-anchor="middle" font-size="18" font-weight="700" fill="#222">${k / d}</text>` : '');
  s += `<circle cx="${X(mark)}" cy="40" r="9" fill="#EB5757"/>`;
  return `<svg viewBox="0 0 ${W} 84" class="nline" width="360">${s}</svg>`;
}
function gridSVG(w, h, showAll = true) {   // a w × h rectangle of unit squares
  const u = Math.min(30, Math.floor(260 / Math.max(w, h))); let s = '';
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (showAll || y === 0 || x === 0) s += `<rect x="${4 + x * u}" y="${4 + y * u}" width="${u}" height="${u}" fill="#CFE3FF" stroke="#4C7BF3" stroke-width="2"/>`;
  if (!showAll) s += `<rect x="4" y="4" width="${w * u}" height="${h * u}" fill="none" stroke="#4C7BF3" stroke-width="3"/>`;
  return `<svg viewBox="0 0 ${w * u + 8} ${h * u + 8}" class="grid" width="${w * u + 8}">${s}</svg>`;
}
function rectSVG(w, h, unit) {   // labelled rectangle for perimeter / area
  const sc = Math.min(22, 240 / Math.max(w, h)), W = w * sc, H = h * sc;
  return `<svg viewBox="0 0 ${W + 90} ${H + 60}" class="rect" width="${Math.min(360, W + 90)}"><rect x="45" y="20" width="${W}" height="${H}" fill="#E8F7EE" stroke="#27AE60" stroke-width="4"/>
    <text x="${45 + W / 2}" y="14" text-anchor="middle" font-size="18" font-weight="700" fill="#222">${w} ${unit}</text>
    <text x="38" y="${24 + H / 2}" text-anchor="end" font-size="18" font-weight="700" fill="#222">${h} ${unit}</text></svg>`;
}
function angleSVG(deg) {
  const r = 110, a = deg * Math.PI / 180, x = 30 + r * Math.cos(a), y = 140 - r * Math.sin(a);
  return `<svg viewBox="0 0 260 160" class="angle" width="260"><line x1="30" y1="140" x2="${30 + r}" y2="140" stroke="#222" stroke-width="5" stroke-linecap="round"/>
    <line x1="30" y1="140" x2="${x}" y2="${y}" stroke="#9B51E0" stroke-width="5" stroke-linecap="round"/>
    ${deg === 90 ? '<rect x="30" y="118" width="22" height="22" fill="none" stroke="#EB5757" stroke-width="3"/>' : `<path d="M ${30 + 30} 140 A 30 30 0 0 0 ${30 + 30 * Math.cos(a)} ${140 - 30 * Math.sin(a)}" fill="none" stroke="#EB5757" stroke-width="3"/>`}</svg>`;
}
function coordSVG(px, py, n = 8) {
  const u = 30, o = 30; let s = '';
  for (let i = 0; i <= n; i++) s += `<line x1="${o + i * u}" y1="${o}" x2="${o + i * u}" y2="${o + n * u}" stroke="#ddd"/><line x1="${o}" y1="${o + i * u}" x2="${o + n * u}" y2="${o + i * u}" stroke="#ddd"/>`
    + `<text x="${o + i * u}" y="${o + n * u + 20}" text-anchor="middle" font-size="14" fill="#333">${i}</text><text x="${o - 10}" y="${o + (n - i) * u + 5}" text-anchor="end" font-size="14" fill="#333">${i}</text>`;
  s += `<line x1="${o}" y1="${o + n * u}" x2="${o + n * u}" y2="${o + n * u}" stroke="#222" stroke-width="3"/><line x1="${o}" y1="${o}" x2="${o}" y2="${o + n * u}" stroke="#222" stroke-width="3"/>`;
  s += `<circle cx="${o + px * u}" cy="${o + (n - py) * u}" r="8" fill="#EB5757"/>`;
  return `<svg viewBox="0 0 ${o * 2 + n * u} ${o * 2 + n * u}" class="coord" width="300">${s}</svg>`;
}
function boxSVG(l, w, h) {   // rectangular prism made of cubes, with labels
  return `<div class="bigemoji" style="font-size:44px">${'🧊'.repeat(Math.min(l, 8))}</div><p class="eqlabel">length ${l} · width ${w} · height ${h}</p>`;
}
const COINS = [['penny', 1, '1¢'], ['nickel', 5, '5¢'], ['dime', 10, '10¢'], ['quarter', 25, '25¢']];
const coinHTML = list => `<div class="coins">${list.map(c => `<span class="coin c${c[1]}">${c[2]}</span>`).join('')}</div>`;

// ---------- 3. Kindergarten ----------
const OBJ = [['🍎', 'apples'], ['⭐', 'stars'], ['🐟', 'fish'], ['🌸', 'flowers'], ['🚗', 'cars'], ['🐞', 'ladybugs'], ['🎈', 'balloons'], ['🦆', 'ducks']];
addSkill('mk_count', {subject: 'math', label: 'Counting objects (to 20)', std: 'K.CC.5', g: [0, 0]}, () => { const L = level('mk_count'); const n = R(1, L === 1 ? 10 : L === 2 ? 15 : 20); const [e, w] = pick(OBJ);
  return numItem({prompt: `How many ${w}?`, say: `Count the ${w}. How many are there?`, visual: `<div class="countgrid">${e.repeat(n)}</div>`, answer: n, hint: 'Touch each one as you count. Say one number for each.'}); });
addSkill('mk_more', {subject: 'math', label: 'More, fewer, the same', std: 'K.CC.6', g: [0, 0]}, () => { const [e, w] = pick(OBJ); let a = R(1, 9), b = R(1, 9); if (Math.random() < .15) b = a;
  const ask = pick(['more', 'fewer']); const ans = a === b ? 'the same' : (ask === 'more') === (a > b) ? 'top row' : 'bottom row';
  return choiceItem({prompt: `Which row has ${ask} ${w}?`, say: `Which row has ${ask} ${w}? Or are they the same?`, visual: `<div class="countgrid">${e.repeat(a)}</div><div class="countgrid">${e.repeat(b)}</div>`, choices: ['top row', 'bottom row', 'the same'], answer: ans, hint: 'Match them up one to one. Which row has some left over?'}); });
addSkill('mk_teen', {subject: 'math', label: 'Teen numbers: ten and some more', std: 'K.NBT.1', g: [0, 1]}, () => { const o = R(1, 9);
  return pick([() => numItem({prompt: `10 and ${o} more is ?`, say: `Ten and ${o} more makes what number?`, visual: `<div class="row">${tenFrame(10)}${tenFrame(o, 0, '#4C7BF3')}</div>`, answer: 10 + o, hint: `A full ten frame is 10. Count on: 11, 12…`}),
    () => numItem({prompt: `${10 + o} is 10 and how many more?`, say: `${10 + o} is ten and how many more?`, answer: o, hint: `Look at the last digit of ${10 + o}.`})])(); });
addSkill('mk_add5', {subject: 'math', label: 'Adding and taking away within 5', std: 'K.OA.5', g: [0, 0]}, () => { const add = Math.random() < .6; const a = R(1, 4), b = add ? R(1, 5 - a) : R(1, a);
  const [e] = pick(OBJ); return numItem({prompt: add ? `${a} + ${b} = ?` : `${a} − ${b} = ?`, say: add ? `What is ${a} plus ${b}?` : `What is ${a} take away ${b}?`, visual: big(add ? e.repeat(a) + ' + ' + e.repeat(b) : e.repeat(a)), answer: add ? a + b : a - b, hint: add ? 'Put them together and count them all.' : `Start with ${a}. Take ${b} away.`}); });
addSkill('mk_make10', {subject: 'math', label: 'Make 10', std: 'K.OA.4', g: [0, 1]}, () => { const a = R(1, 9);
  return numItem({prompt: `${a} + ? = 10`, say: `${a} and what number make ten?`, visual: tenFrame(a), answer: 10 - a, hint: 'Count the empty boxes in the ten frame.'}); });
addSkill('mk_shapes3d', {subject: 'math', label: 'Flat and solid shapes', std: 'K.G.3', g: [0, 1]}, () => { const s = pick([['ball', 'sphere', '⚽'], ['ice cream cone', 'cone', '🍦'], ['can of soup', 'cylinder', '🥫'], ['dice', 'cube', '🎲'], ['box', 'rectangular prism', '📦'], ['pizza slice', 'triangle', '🍕'], ['clock', 'circle', '🕐']]);
  return choiceItem({prompt: `A ${s[0]} looks like which shape?`, say: `A ${s[0]} looks like which shape?`, visual: big(s[2]), choices: uniqChoices(s[1], ['sphere', 'cone', 'cylinder', 'cube', 'circle', 'triangle'], 3), answer: s[1], hint: 'Is it flat or solid? Does it roll?', speakChoices: true}); });

// ---------- 4. Grade 2 ----------
addSkill('m2_evenodd', {subject: 'math', label: 'Even and odd numbers', std: '2.OA.3', g: [2, 3]}, () => { const n = R(1, level('m2_evenodd') === 1 ? 20 : 99);
  return choiceItem({prompt: `Is ${n} even or odd?`, say: `Is ${n} even or odd?`, visual: n <= 20 ? `<div class="pairs">${'🔵'.repeat(n)}</div>` : '', choices: ['even', 'odd'], answer: n % 2 ? 'odd' : 'even', hint: 'Even numbers end in 0, 2, 4, 6 or 8. Can you make pairs with none left over?'}); });
addSkill('m2_add100', {subject: 'math', label: 'Add and subtract within 100 and 1,000', std: '2.NBT.5 / 2.NBT.7', g: [2, 3], base: 2}, () => { const L = level('m2_add100'); const mx = L === 3 ? 999 : 99; const sub = Math.random() < .5;
  let a = R(L === 1 ? 10 : 20, mx), b = R(L === 1 ? 1 : 10, L === 1 ? 9 : mx); if (sub && b > a) [a, b] = [b, a]; if (!sub && a + b > (L === 3 ? 1000 : 100)) b = R(1, (L === 3 ? 1000 : 100) - a);
  return numItem({prompt: sub ? `${a} − ${b} = ?` : `${a} + ${b} = ?`, say: sub ? `What is ${a} minus ${b}?` : `What is ${a} plus ${b}?`, answer: sub ? a - b : a + b, hint: sub ? 'Subtract the ones, then the tens (then the hundreds). Regroup if you need more ones.' : 'Add the ones, then the tens (then the hundreds). Ten ones make a new ten.'}); });
addSkill('m2_skip', {subject: 'math', label: 'Skip-counting by 2s, 5s, 10s, 100s', std: '2.NBT.2', g: [2, 2]}, () => { const by = pick([2, 5, 10, 100]); const st = by === 100 ? R(1, 5) * 100 : by * R(0, 15); const seq = [0, 1, 2].map(i => st + i * by);
  return numItem({prompt: `What comes next?<div class="eq">${seq.join(', ')}, ▢</div>`, say: `Skip count by ${by}s. ${seq.join(', ')}. What comes next?`, answer: st + 3 * by, hint: `Each number is ${by} more.`}); });
addSkill('m2_money', {subject: 'math', label: 'Counting coins', std: '2.MD.8', g: [2, 3]}, () => { const L = level('m2_money'); const pool = L === 1 ? COINS.slice(1, 3) : COINS; const k = R(2, L === 3 ? 6 : 4);
  const list = Array.from({length: k}, () => pick(pool)).sort((a, b) => b[1] - a[1]); const tot = list.reduce((s, c) => s + c[1], 0);
  return numItem({prompt: 'How many cents in all?', say: 'Count the coins. How many cents in all?', visual: coinHTML(list), answer: tot, hint: 'Start with the biggest coins: a quarter is 25¢, a dime 10¢, a nickel 5¢, a penny 1¢.'}); });
addSkill('m2_array', {subject: 'math', label: 'Arrays and equal rows', std: '2.OA.4', g: [2, 2]}, () => { const r = R(2, 5), c = R(2, 5);
  return numItem({prompt: `${r} rows of ${c}. How many in all?`, say: `There are ${r} rows with ${c} in each row. How many in all?`, visual: arraySVG(r, c), answer: r * c, hint: `Add the rows: ${Array(r).fill(c).join(' + ')}`}); });
addSkill('m2_place3', {subject: 'math', label: 'Hundreds, tens and ones', std: '2.NBT.1', g: [2, 2]}, () => { const n = R(101, 999); const h = Math.floor(n / 100), t = Math.floor(n / 10) % 10, o = n % 10; const k = R(0, 2);
  if (k === 0) return choiceItem({prompt: `What is the value of the <b>${t}</b> in ${String(n).slice(0, 1)}<b>${t}</b>${o}?`, say: `In ${n}, what is the value of the digit ${t} in the tens place?`, choices: uniqChoices(t * 10, [t, t * 100, t + 10]), answer: String(t * 10), hint: 'The middle digit tells the tens.'});
  if (k === 1) return numItem({prompt: `${h} hundreds + ${t} tens + ${o} ones = ?`, say: `${h} hundreds, ${t} tens and ${o} ones make what number?`, answer: n, hint: 'Write the hundreds digit, then the tens, then the ones.'});
  return choiceItem({prompt: `Which is ${n} in expanded form?`, say: `Which shows ${n} in expanded form?`, choices: uniqChoices(`${h * 100} + ${t * 10} + ${o}`, [`${h} + ${t} + ${o}`, `${h * 100} + ${t} + ${o}`, `${h * 10} + ${t * 10} + ${o}`]), answer: `${h * 100} + ${t * 10} + ${o}`, hint: 'Each digit times its place: hundreds, tens, ones.'}); });
addSkill('m2_measure', {subject: 'math', label: 'Inches, feet, centimeters', std: '2.MD.1-3', g: [2, 3]}, () => { const it = pick([['a pencil', '7 inches', ['7 feet', '7 yards'], '✏️'], ['a door', '7 feet', ['7 inches', '7 centimeters'], '🚪'], ['a paper clip', '3 centimeters', ['3 meters', '3 feet'], '📎'],
  ['a classroom', '10 meters', ['10 centimeters', '10 inches'], '🏫'], ['a crayon', '9 centimeters', ['9 meters', '9 feet'], '🖍️'], ['a car', '15 feet', ['15 inches', '15 centimeters'], '🚗'], ['your hand', '6 inches', ['6 feet', '6 yards'], '✋']]);
  return choiceItem({prompt: `About how long is ${it[0]}?`, say: `About how long is ${it[0]}?`, visual: big(it[3]), choices: shuffle([it[1], ...it[2]]), answer: it[1], hint: 'An inch is about a paper clip wide; a foot is a long ruler; a centimeter is about the width of your finger.', speakChoices: true}); });

// ---------- 5. Grade 3 ----------
const multFacts = L => L === 1 ? [0, 1, 2, 5, 10] : L === 2 ? [3, 4, 6] : [7, 8, 9];
addSkill('m3_mult', {subject: 'math', label: 'Multiplication facts', std: '3.OA.7', g: [3, 5], weight: 1.6}, () => { const L = level('m3_mult'); const a = pick(multFacts(L)), b = R(1, 10); const [x, y] = Math.random() < .5 ? [a, b] : [b, a];
  return numItem({prompt: `${x} × ${y} = ?`, say: `What is ${x} times ${y}?`, visual: L === 1 && x * y <= 30 && x > 0 && y > 0 ? arraySVG(x, y, '🔵') : '', answer: x * y, hint: x === 0 || y === 0 ? 'Any number times 0 is 0.' : `${x} groups of ${y}. Skip-count by ${y}: ${Array.from({length: Math.min(x, 4)}, (_, i) => (i + 1) * y).join(', ')}…`}); });
addSkill('m3_div', {subject: 'math', label: 'Division facts', std: '3.OA.7', g: [3, 5], weight: 1.4}, () => { const L = level('m3_div'); const d = pick(multFacts(L).filter(x => x > 0)), q = R(1, 10);
  return pick([() => numItem({prompt: `${d * q} ÷ ${d} = ?`, say: `What is ${d * q} divided by ${d}?`, answer: q, hint: `Think multiplication: ${d} × ? = ${d * q}`}),
    () => numItem({prompt: `${d * q} cookies shared by ${d} friends. How many each?`, say: `${d * q} cookies are shared equally by ${d} friends. How many cookies does each friend get?`, visual: d * q <= 30 ? big('🍪'.repeat(d * q)) : '', answer: q, hint: `Share them out one at a time, or think ${d} × ? = ${d * q}.`})])(); });
addSkill('m3_unknown', {subject: 'math', label: 'Find the unknown number (× and ÷)', std: '3.OA.4', g: [3, 4]}, () => { const a = R(2, 9), b = R(2, 9); const k = R(0, 2);
  if (k === 0) return numItem({prompt: `${a} × ▢ = ${a * b}`, say: `${a} times what number equals ${a * b}?`, answer: b, hint: `${a * b} ÷ ${a} = ?`});
  if (k === 1) return numItem({prompt: `▢ ÷ ${a} = ${b}`, say: `What number divided by ${a} equals ${b}?`, answer: a * b, hint: `${a} × ${b} = ?`});
  return numItem({prompt: `${a * b} ÷ ▢ = ${b}`, say: `${a * b} divided by what number equals ${b}?`, answer: a, hint: `${b} × ? = ${a * b}`}); });
addSkill('m3_props', {subject: 'math', label: 'Properties: turn-around and break-apart', std: '3.OA.5', g: [3, 4]}, () => { const a = R(3, 9), b = R(6, 9), b1 = 5, b2 = b - 5;
  return pick([() => choiceItem({prompt: `${a} × ${b} is the same as…`, say: `${a} times ${b} is the same as which?`, choices: uniqChoices(`${b} × ${a}`, [`${a} + ${b}`, `${a} × ${b + 1}`, `${b} − ${a}`]), answer: `${b} × ${a}`, hint: 'You can switch the order when you multiply.'}),
    () => choiceItem({prompt: `${a} × ${b} = ${a} × ${b1} + ${a} × ?`, say: `${a} times ${b} equals ${a} times ${b1} plus ${a} times what?`, choices: uniqChoices(String(b2), [String(b), String(b1), String(a)]), answer: String(b2), hint: `Break ${b} into ${b1} and ${b2}.`})])(); });
addSkill('m3_round', {subject: 'math', label: 'Rounding to 10 and 100', std: '3.NBT.1', g: [3, 4]}, () => { const L = level('m3_round'); const to = L === 1 ? 10 : L === 2 ? 100 : pick([10, 100]); const n = R(to === 10 ? 11 : 101, 999); const ans = Math.round(n / to) * to;
  return numItem({prompt: `Round ${n} to the nearest ${to}.`, say: `Round ${n} to the nearest ${to}.`, answer: ans, hint: to === 10 ? 'Look at the ones digit: 5 or more rounds up, 4 or less rounds down.' : 'Look at the tens digit: 5 or more rounds up, 4 or less rounds down.'}); });
addSkill('m3_add1000', {subject: 'math', label: 'Add and subtract within 1,000', std: '3.NBT.2', g: [3, 4]}, () => { const sub = Math.random() < .5; let a = R(120, 899), b = R(15, 499); if (sub && b > a) [a, b] = [b, a]; if (!sub && a + b > 1000) b = 1000 - a - R(0, 40);
  return numItem({prompt: sub ? `${a} − ${b} = ?` : `${a} + ${b} = ?`, say: sub ? `What is ${a} minus ${b}?` : `What is ${a} plus ${b}?`, answer: sub ? a - b : a + b, hint: 'Line up the ones, tens and hundreds. Regroup when you need to.'}); });
addSkill('m3_times10', {subject: 'math', label: 'Multiply by multiples of 10', std: '3.NBT.3', g: [3, 4]}, () => { const a = R(2, 9), t = R(2, 9) * 10;
  return numItem({prompt: `${a} × ${t} = ?`, say: `What is ${a} times ${t}?`, answer: a * t, hint: `${a} × ${t / 10} = ${a * t / 10}, so ${a} × ${t} is ten times as much.`}); });
addSkill('m3_frac', {subject: 'math', label: 'Understanding fractions', std: '3.NF.1-3', g: [3, 4], weight: 1.5}, () => { const L = level('m3_frac'); const d = pick(L === 1 ? [2, 3, 4] : [2, 3, 4, 6, 8]); const n = R(1, d - (L === 1 ? 0 : 1)) || 1; const k = R(0, L === 1 ? 1 : 3);
  if (k === 0) return choiceItem({prompt: 'What fraction is shaded?', say: 'What fraction of the bar is shaded?', visual: fracBarSVG(n, d), choices: uniqChoices(fr(n, d), [fr(d, n), fr(n, d + 1), fr(d - n, d), fr(n + 1, d)]), answer: fr(n, d), hint: `Count the shaded parts (top number) and all the equal parts (bottom number): ${d} parts.`});
  if (k === 1) return choiceItem({prompt: 'Where is the dot on the number line?', say: 'What fraction is the red dot at?', visual: numberLineSVG(d, n), choices: uniqChoices(fr(n, d), [fr(n + 1, d), fr(n, d + 1), fr(d, n)]), answer: fr(n, d), hint: `The space from 0 to 1 is cut into ${d} equal parts. Count the jumps to the dot.`});
  if (k === 2) { const m = R(1, d - 1), ans = n > m ? '>' : n < m ? '<' : '='; return choiceItem({prompt: `<div class="eq">${fr(n, d)} ▢ ${fr(m, d)}</div>`, say: `Compare ${n} over ${d} and ${m} over ${d}.`, choices: ['>', '<', '='], answer: ans, hint: 'Same size parts: more parts is bigger.', wordChoices: false}); }
  const a = pick([2, 3, 4, 6, 8]), b = pick([2, 3, 4, 6, 8].filter(x => x !== a)); return choiceItem({prompt: `Which is bigger: 1/${a} or 1/${b}?`, say: `Which is bigger: one ${a === 2 ? 'half' : a + 'th'} or one ${b === 2 ? 'half' : b + 'th'}?`, choices: [`1/${a}`, `1/${b}`], answer: a < b ? `1/${a}` : `1/${b}`, hint: 'Cutting a pizza into MORE pieces makes each piece SMALLER.'}); });
addSkill('m3_area', {subject: 'math', label: 'Area', std: '3.MD.5-7', g: [3, 4]}, () => { const L = level('m3_area'); const w = R(2, L === 1 ? 6 : 9), h = R(2, L === 1 ? 5 : 8);
  if (L === 1) return numItem({prompt: 'What is the area? (count the square units)', say: 'Count the squares. What is the area in square units?', visual: gridSVG(w, h), answer: w * h, hint: `${h} rows of ${w} squares.`});
  return numItem({prompt: `Area of a rectangle ${w} cm by ${h} cm = ? square cm`, say: `A rectangle is ${w} centimeters long and ${h} centimeters wide. What is its area in square centimeters?`, visual: rectSVG(w, h, 'cm'), answer: w * h, hint: 'Area = length × width.'}); });
addSkill('m3_perim', {subject: 'math', label: 'Perimeter', std: '3.MD.8', g: [3, 4]}, () => { const w = R(2, 12), h = R(2, 9); const k = R(0, 1);
  if (k === 0) return numItem({prompt: 'What is the perimeter?', say: `The rectangle is ${w} inches by ${h} inches. What is the perimeter, the distance all the way around?`, visual: rectSVG(w, h, 'in'), answer: 2 * (w + h), hint: `Add all four sides: ${w} + ${h} + ${w} + ${h}.`});
  const s = R(2, 9); return numItem({prompt: `A square has sides of ${s} m. What is its perimeter?`, say: `A square has sides of ${s} meters. What is its perimeter?`, answer: 4 * s, hint: 'A square has 4 equal sides.'}); });
addSkill('m3_time', {subject: 'math', label: 'Time to the minute and elapsed time', std: '3.MD.1', g: [3, 3]}, () => { const h = R(1, 12), m = R(0, 11) * 5 + (level('m3_time') === 3 ? R(0, 4) : 0); const f = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
  if (Math.random() < .5) return choiceItem({prompt: 'What time is it?', say: 'What time does the clock show?', visual: clockSVG(h, m), choices: uniqChoices(f(h, m), [f(h % 12 + 1, m), f(h, (m + 15) % 60), f((m / 5) || 12, h * 5 % 60)]), answer: f(h, m), hint: 'The short hand shows the hour. Count the long hand by 5s from the 12.'});
  const start = R(1, 10), sm = R(0, 5) * 10, add = R(1, 7) * 10 + pick([0, 5]); const em = sm + add, eh = start + Math.floor(em / 60);
  return numItem({prompt: `A movie starts at ${f(start, sm)} and ends at ${f(eh > 12 ? eh - 12 : eh, em % 60)}. How many minutes long is it?`, say: `A movie starts at ${f(start, sm)} and ends at ${f(eh > 12 ? eh - 12 : eh, em % 60)}. How many minutes long is it?`, answer: add, hint: 'Count on in tens of minutes from the start time to the end time.'}); });
addSkill('m3_word2', {subject: 'math', label: 'Two-step word problems', std: '3.OA.8', g: [3, 4], weight: 1.4}, () => { const nm = pick(NAMES), n2 = pick(NAMES.filter(x => x !== nm)); const k = R(0, 2);
  if (k === 0) { const p = R(3, 8), c = R(3, 9), g = R(2, 9); return numItem({prompt: `${nm} buys ${p} packs of stickers with ${c} stickers in each pack, then gives ${g} away. How many stickers are left?`, say: `${nm} buys ${p} packs of stickers with ${c} stickers in each pack, then gives ${g} away. How many stickers are left?`, answer: p * c - g, hint: `First ${p} × ${c}, then take away ${g}.`}); }
  if (k === 1) { const t = R(4, 9) * R(3, 6), each = pick([2, 3, 4, 6].filter(x => t % x === 0)) || 2, extra = R(3, 12); return numItem({prompt: `${nm} has ${t} marbles and shares them equally into ${each} bags. ${n2} adds ${extra} marbles to one bag. How many marbles are in that bag now?`, say: `${nm} has ${t} marbles and shares them equally into ${each} bags. ${n2} adds ${extra} marbles to one bag. How many marbles are in that bag now?`, answer: Math.floor(t / each) + extra, hint: `First ${t} ÷ ${each}, then add ${extra}.`}); }
  const a = R(120, 400), b = R(50, 200), c = R(20, 90); return numItem({prompt: `A library had ${a} books. It got ${b} new books and lent out ${c}. How many books are on the shelves now?`, say: `A library had ${a} books. It got ${b} new books and lent out ${c}. How many books are on the shelves now?`, answer: a + b - c, hint: `${a} + ${b}, then − ${c}.`}); });
addSkill('m3_graph', {subject: 'math', label: 'Scaled picture and bar graphs', std: '3.MD.3', g: [3, 3]}, () => { const key = pick([2, 5, 10]), items = shuffle([['soccer', '⚽'], ['reading', '📚'], ['art', '🎨'], ['music', '🎵']]).slice(0, 3); const cnt = items.map(() => R(1, 6));
  const vis = `<div class="graph">${items.map((it, i) => `<div>${it[1]} ${'⭐'.repeat(cnt[i])}</div>`).join('')}<p class="eqlabel">Each ⭐ = ${key} children</p></div>`; const i = R(0, 2);
  return pick([() => numItem({prompt: `How many children chose ${items[i][0]}?`, say: `Each star stands for ${key} children. How many children chose ${items[i][0]}?`, visual: vis, answer: cnt[i] * key, hint: `${cnt[i]} stars × ${key}.`}),
    () => { const j = (i + 1) % 3; return numItem({prompt: `How many more children chose ${items[i][0]} than ${items[j][0]}?`, say: `How many more children chose ${items[i][0]} than ${items[j][0]}? Each star is ${key} children.`, visual: vis, answer: Math.abs(cnt[i] - cnt[j]) * key, hint: 'Find each number first, then subtract.'}); }])(); });

// ---------- 6. Grade 4 ----------
addSkill('m4_place', {subject: 'math', label: 'Place value to 1,000,000', std: '4.NBT.1-3', g: [4, 5]}, () => { const n = R(10000, 999999); const s = String(n); const pos = R(0, s.length - 2); const digit = +s[pos]; const val = digit * Math.pow(10, s.length - 1 - pos); const k = R(0, 3);
  if (k === 0 && digit) return choiceItem({prompt: `What is the value of the underlined digit?<div class="eq">${s.split('').map((c, i) => i === pos ? `<u>${c}</u>` : c).join('')}</div>`, say: `What is the value of the digit ${digit} in ${commas(n)}?`, choices: uniqChoices(commas(val), [commas(val * 10), commas(val / 10), String(digit)]), answer: commas(val), hint: 'Name the place: ones, tens, hundreds, thousands, ten thousands, hundred thousands.'});
  if (k === 1) { const m = n + pick([-1, 1]) * pick([10, 100, 1000, 10000]); return choiceItem({prompt: `<div class="eq">${commas(n)} ▢ ${commas(m)}</div>`, say: `Compare ${commas(n)} and ${commas(m)}.`, choices: ['>', '<', '='], answer: n > m ? '>' : '<', hint: 'Compare from the left, place by place.', wordChoices: false}); }
  if (k === 2) { const to = pick([1000, 10000, 100000]); return choiceItem({prompt: `Round ${commas(n)} to the nearest ${commas(to)}.`, say: `Round ${commas(n)} to the nearest ${commas(to)}.`, choices: uniqChoices(commas(Math.round(n / to) * to), [commas(Math.floor(n / to) * to === Math.round(n / to) * to ? Math.ceil(n / to) * to : Math.floor(n / to) * to), commas(Math.round(n / (to / 10)) * to / 10), commas(Math.round(n / to) * to + to)]), answer: commas(Math.round(n / to) * to), hint: 'Look at the digit just to the right of the place you round to.'}); }
  return choiceItem({prompt: `Which is ${commas(n)} written in words?`, say: `Which shows ${commas(n)} in words?`, choices: uniqChoices(numWords(n), [numWords(n + 1000 < 1000000 ? n + 1000 : n - 1000), numWords(Math.floor(n / 10)), numWords(n + 10)]), answer: numWords(n), hint: 'Read the thousands part first, then say "thousand", then the rest.'}); });
function numWords(n) { const o = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'], t = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const h = x => { let s = ''; if (x >= 100) { s += o[Math.floor(x / 100)] + ' hundred'; x %= 100; if (x) s += ' '; } if (x >= 20) { s += t[Math.floor(x / 10)] + (x % 10 ? '-' + o[x % 10] : ''); } else if (x) s += o[x]; return s; };
  const th = Math.floor(n / 1000), r = n % 1000; return ((th ? h(th) + ' thousand' : '') + (th && r ? ' ' : '') + (r ? h(r) : '')) || 'zero'; }
addSkill('m4_mult', {subject: 'math', label: 'Multi-digit multiplication', std: '4.NBT.5', g: [4, 5], weight: 1.4}, () => { const L = level('m4_mult'); let a, b;
  if (L === 1) { a = R(11, 99); b = R(2, 9); } else if (L === 2) { a = R(101, 999); b = R(2, 9); } else { a = R(11, 99); b = R(11, 99); }
  return numItem({prompt: `${a} × ${b} = ?`, say: `What is ${a} times ${b}?`, answer: a * b, hint: L === 3 ? `Break it apart: ${a} × ${Math.floor(b / 10) * 10} + ${a} × ${b % 10}` : `Break ${a} into ${Math.floor(a / 10) * 10} and ${a % 10}, multiply each by ${b}, then add.`}); });
addSkill('m4_div', {subject: 'math', label: 'Division with remainders', std: '4.NBT.6 / 4.OA.3', g: [4, 5]}, () => { const d = R(2, 9), q = R(level('m4_div') === 1 ? 3 : 12, level('m4_div') === 3 ? 250 : 60), r = R(0, d - 1), n = d * q + r;
  if (Math.random() < .5) return numItem({prompt: `${n} ÷ ${d} = ? R ${r}`, say: `${n} divided by ${d} is what, with remainder ${r}?`, answer: q, hint: `How many groups of ${d} fit in ${n}? ${d} × ? is close to ${n}.`});
  return numItem({prompt: `${n} ÷ ${d} = ${q} R ▢`, say: `${n} divided by ${d} is ${q} with what remainder?`, answer: r, hint: `${d} × ${q} = ${d * q}. How many are left over?`}); });
addSkill('m4_factors', {subject: 'math', label: 'Factors, multiples, prime and composite', std: '4.OA.4', g: [4, 5]}, () => { const k = R(0, 2); const isPrime = n => n > 1 && [...Array(Math.floor(Math.sqrt(n))).keys()].slice(2).every(i => n % i);
  if (k === 0) { const n = R(2, 50); return choiceItem({prompt: `Is ${n} prime or composite?`, say: `Is ${n} a prime number or a composite number?`, choices: ['prime', 'composite'], answer: isPrime(n) ? 'prime' : 'composite', hint: 'A prime number has exactly two factors: 1 and itself.'}); }
  if (k === 1) { const n = pick([12, 18, 20, 24, 30, 36, 40, 42, 48, 56, 60]); const fs = [...Array(n + 1).keys()].filter(i => i > 1 && i < n && n % i === 0); const f = pick(fs); const nots = [...Array(12).keys()].map(i => i + 2).filter(i => n % i);
    return choiceItem({prompt: `Which number is a factor of ${n}?`, say: `Which number is a factor of ${n}?`, choices: shuffle([String(f), ...shuffle(nots).slice(0, 2).map(String)]), answer: String(f), hint: `A factor divides ${n} with nothing left over.`}); }
  const m = R(3, 9), c = m * R(3, 12); return choiceItem({prompt: `Which number is a multiple of ${m}?`, say: `Which number is a multiple of ${m}?`, choices: shuffle([String(c), String(c + 1), String(c + m - 1 === c ? c + 2 : c - 1)]), answer: String(c), hint: `Multiples of ${m}: ${m}, ${2 * m}, ${3 * m}…`}); });
addSkill('m4_fraceq', {subject: 'math', label: 'Equivalent and comparing fractions', std: '4.NF.1-2', g: [4, 5], weight: 1.5}, () => { const k = R(0, 2);
  if (k === 0) { const d = pick([2, 3, 4, 5, 6]), n = R(1, d - 1), m = R(2, 4); return choiceItem({prompt: `Which fraction is equal to ${fr(n, d)}?`, say: `Which fraction is equal to ${n} over ${d}?`, visual: fracBarSVG(n, d), choices: uniqChoices(fr(n * m, d * m), [fr(n + m, d + m), fr(n * m, d), fr(n, d * m)]), answer: fr(n * m, d * m), hint: `Multiply the top and the bottom by the same number.`}); }
  if (k === 1) { const a = [R(1, 5), pick([2, 3, 4, 5, 6, 8, 10, 12])]; a[0] = Math.min(a[0], a[1] - 1); const b = [R(1, 7), pick([2, 3, 4, 5, 6, 8, 10, 12])]; b[0] = Math.min(b[0], b[1] - 1);
    const va = a[0] / a[1], vb = b[0] / b[1]; return choiceItem({prompt: `<div class="eq">${fr(...a)} ▢ ${fr(...b)}</div>`, say: `Compare ${a[0]} over ${a[1]} and ${b[0]} over ${b[1]}.`, choices: ['>', '<', '='], answer: Math.abs(va - vb) < 1e-9 ? '=' : va > vb ? '>' : '<', hint: 'Make the bottoms the same, or compare each fraction to one half.', wordChoices: false}); }
  const d = pick([4, 6, 8, 10, 12]), n = R(1, d - 1); const [sn, sd] = simp(n, d); return choiceItem({prompt: `Write ${fr(n, d)} in simplest form.`, say: `What is ${n} over ${d} in simplest form?`, choices: uniqChoices(fr(sn, sd), [fr(n, d + 1), fr(sn + 1, sd), fr(Math.max(1, n - 1), d)]), answer: fr(sn, sd), hint: 'Divide the top and bottom by the biggest number that goes into both.'}); });
addSkill('m4_fracadd', {subject: 'math', label: 'Add and subtract fractions (same bottom)', std: '4.NF.3', g: [4, 5]}, () => { const d = pick([3, 4, 5, 6, 8, 10, 12]); const L = level('m4_fracadd');
  if (L < 3) { const a = R(1, d - 1), b = R(1, d - a), sub = Math.random() < .4 && a > b; const n = sub ? a - b : a + b;
    return choiceItem({prompt: `${fr(a, d)} ${sub ? '−' : '+'} ${fr(b, d)} = ?`, say: `What is ${a} over ${d} ${sub ? 'minus' : 'plus'} ${b} over ${d}?`, choices: uniqChoices(fr(n, d), [fr(n, d * 2), fr(sub ? a + b : Math.abs(a - b), d), fr(n + 1, d)]), answer: fr(n, d), hint: 'The bottom number stays the same. Add or subtract the top numbers.'}); }
  const w1 = R(1, 3), a = R(1, d - 1), w2 = R(1, 2), b = R(1, d - 1); const tot = (w1 + w2) * d + a + b;
  return choiceItem({prompt: `${w1} ${fr(a, d)} + ${w2} ${fr(b, d)} = ?`, say: `What is ${w1} and ${a} over ${d}, plus ${w2} and ${b} over ${d}?`, choices: uniqChoices(fmtMixed(tot, d), [fmtMixed(tot - d, d), `${w1 + w2} ${fr(a + b, d * 2)}`, fmtMixed(tot + 1, d)]), answer: fmtMixed(tot, d), hint: 'Add the whole numbers, add the fractions, and turn an extra whole into 1.'}); });
addSkill('m4_fracmul', {subject: 'math', label: 'Multiply a fraction by a whole number', std: '4.NF.4', g: [4, 4]}, () => { const d = pick([2, 3, 4, 5, 6, 8]), n = R(1, d - 1), w = R(2, 6);
  return choiceItem({prompt: `${w} × ${fr(n, d)} = ?`, say: `What is ${w} times ${n} over ${d}?`, choices: uniqChoices(fr(w * n, d), [fr(w * n, w * d), fr(n, w * d), fr(w + n, d)]), answer: fr(w * n, d), hint: `${w} groups of ${fr(n, d)}: multiply the top number by ${w}.`}); });
addSkill('m4_dec', {subject: 'math', label: 'Decimals: tenths and hundredths', std: '4.NF.5-7', g: [4, 5]}, () => { const k = R(0, 2);
  if (k === 0) { const h = R(1, 99); return choiceItem({prompt: `${h}/100 written as a decimal is…`, say: `${h} hundredths written as a decimal is?`, choices: uniqChoices((h / 100).toFixed(2), [(h / 10).toFixed(1), String(h), (h / 1000).toFixed(3)]), answer: (h / 100).toFixed(2), hint: 'Hundredths go two places after the decimal point.'}); }
  if (k === 1) { const a = R(1, 99) / 100, b = R(1, 9) / 10; return choiceItem({prompt: `<div class="eq">${a.toFixed(2)} ▢ ${b.toFixed(1)}</div>`, say: `Compare ${a.toFixed(2)} and ${b.toFixed(1)}.`, choices: ['>', '<', '='], answer: Math.abs(a - b) < 1e-9 ? '=' : a > b ? '>' : '<', hint: `Write both with two places: ${b.toFixed(1)} = ${b.toFixed(2)}.`, wordChoices: false}); }
  const t = R(1, 9); return choiceItem({prompt: `${t}/10 = ?/100`, say: `${t} tenths equals how many hundredths?`, choices: uniqChoices(fr(t * 10, 100), [fr(t, 100), fr(t * 100, 100), fr(t + 10, 100)]), answer: fr(t * 10, 100), hint: 'One tenth is the same as ten hundredths.'}); });
addSkill('m4_angles', {subject: 'math', label: 'Angles and lines', std: '4.G.1 / 4.MD.5-7', g: [4, 5]}, () => { const k = R(0, 2);
  if (k === 0) { const deg = pick([R(20, 80), 90, R(100, 160)]); const ans = deg < 90 ? 'acute' : deg === 90 ? 'right' : 'obtuse';
    return choiceItem({prompt: 'What kind of angle is this?', say: 'Is this angle acute, right, or obtuse?', visual: angleSVG(deg), choices: ['acute', 'right', 'obtuse'], answer: ans, hint: 'A right angle is a square corner (90°). Acute is smaller, obtuse is bigger.'}); }
  if (k === 1) { const a = R(2, 16) * 5, b = R(2, 16) * 5; return numItem({prompt: `Two angles of ${a}° and ${b}° are put together. What is the whole angle?`, say: `Two angles of ${a} degrees and ${b} degrees are joined. How many degrees is the whole angle?`, answer: a + b, hint: 'Angle measures add up.'}); }
  const q = pick([['Lines that never meet are…', 'parallel', ['perpendicular', 'intersecting']], ['Lines that cross to make square corners are…', 'perpendicular', ['parallel', 'curved']], ['How many degrees in a full turn?', '360', ['180', '90']], ['How many degrees in a straight angle?', '180', ['90', '360']], ['A line that folds a shape into two matching halves is a line of…', 'symmetry', ['parallel', 'perimeter']]]);
  return choiceItem({prompt: q[0], say: q[0], choices: shuffle([q[1], ...q[2]]), answer: q[1], hint: 'Picture train tracks (parallel) and the corner of a page (perpendicular).', speakChoices: true}); });
addSkill('m4_convert', {subject: 'math', label: 'Measurement conversions', std: '4.MD.1-2', g: [4, 5]}, () => { const c = pick([['feet', 'inches', 12], ['yards', 'feet', 3], ['hours', 'minutes', 60], ['minutes', 'seconds', 60], ['meters', 'centimeters', 100], ['kilometers', 'meters', 1000], ['kilograms', 'grams', 1000], ['pounds', 'ounces', 16], ['liters', 'milliliters', 1000], ['days', 'hours', 24], ['weeks', 'days', 7], ['gallons', 'quarts', 4]]);
  const n = R(2, c[2] >= 1000 ? 9 : 12); return numItem({prompt: `${n} ${c[0]} = ? ${c[1]}`, say: `${n} ${c[0]} equals how many ${c[1]}?`, answer: n * c[2], hint: `1 ${c[0].replace(/s$/, '')} = ${c[2]} ${c[1]}. Multiply by ${c[2]}.`}); });
addSkill('m4_areaword', {subject: 'math', label: 'Area and perimeter problems', std: '4.MD.3', g: [4, 5]}, () => { const w = R(3, 15), a = w * R(3, 12), h = a / w;
  return pick([() => numItem({prompt: `A garden has an area of ${a} square feet. It is ${w} feet wide. How long is it?`, say: `A rectangular garden has an area of ${a} square feet and is ${w} feet wide. How long is it?`, answer: h, hint: `Area = length × width, so ${a} ÷ ${w}.`}),
    () => numItem({prompt: `A rug is ${w} ft by ${h} ft. How many feet of ribbon go around its edge?`, say: `A rug is ${w} feet by ${h} feet. How many feet of ribbon are needed to go all the way around?`, answer: 2 * (w + h), hint: 'Perimeter: add all four sides.'})])(); });

// ---------- 7. Grade 5 ----------
addSkill('m5_decops', {subject: 'math', label: 'Add, subtract and multiply decimals', std: '5.NBT.7', g: [5, 5], weight: 1.4}, () => { const k = R(0, 2);
  if (k === 0) { const a = R(105, 999) / 100, b = R(11, 899) / 100; return choiceItem({prompt: `${a.toFixed(2)} + ${b.toFixed(2)} = ?`, say: `What is ${a.toFixed(2)} plus ${b.toFixed(2)}?`, choices: uniqChoices((a + b).toFixed(2), [(a + b + 0.1).toFixed(2), (a + b + 1).toFixed(2), (a + b - 0.01).toFixed(2)]), answer: (a + b).toFixed(2), hint: 'Line up the decimal points, then add like whole numbers.'}); }
  if (k === 1) { let a = R(200, 999) / 100, b = R(11, 199) / 100; return choiceItem({prompt: `${a.toFixed(2)} − ${b.toFixed(2)} = ?`, say: `What is ${a.toFixed(2)} minus ${b.toFixed(2)}?`, choices: uniqChoices((a - b).toFixed(2), [(a - b + 0.1).toFixed(2), (a - b - 1).toFixed(2), (a + b).toFixed(2)]), answer: (a - b).toFixed(2), hint: 'Line up the decimal points. Regroup if needed.'}); }
  const a = R(11, 99) / 10, b = R(2, 9); return choiceItem({prompt: `${a.toFixed(1)} × ${b} = ?`, say: `What is ${a.toFixed(1)} times ${b}?`, choices: uniqChoices(dec(a * b, 1), [dec(a * b * 10, 0), dec(a * b / 10, 2), dec(a * b + 1, 1)]), answer: dec(a * b, 1), hint: `Multiply ${a * 10} × ${b}, then put back one decimal place.`}); });
addSkill('m5_pow10', {subject: 'math', label: 'Powers of 10 and decimal place value', std: '5.NBT.1-4', g: [5, 5]}, () => { const k = R(0, 2);
  if (k === 0) { const x = R(12, 999) / 100, p = pick([10, 100, 1000]); const ans = dec(x * p, 2); return choiceItem({prompt: `${x.toFixed(2)} × ${p} = ?`, say: `What is ${x.toFixed(2)} times ${p}?`, choices: uniqChoices(ans, [dec(x * p / 10, 3), dec(x * p * 10, 1), dec(x / p, 5)]), answer: ans, hint: `Move each digit ${String(p).length - 1} place${p > 10 ? 's' : ''} to the left (bigger).`}); }
  if (k === 1) { const e = R(2, 5); return choiceItem({prompt: `10<sup>${e}</sup> = ?`, say: `What is 10 to the power of ${e}?`, choices: uniqChoices(commas(Math.pow(10, e)), [commas(10 * e), commas(Math.pow(10, e - 1)), commas(Math.pow(10, e + 1))]), answer: commas(Math.pow(10, e)), hint: `1 followed by ${e} zeros.`}); }
  const x = R(1001, 9999) / 1000, to = pick(['tenth', 'hundredth']); const p = to === 'tenth' ? 1 : 2; return choiceItem({prompt: `Round ${x.toFixed(3)} to the nearest ${to}.`, say: `Round ${x.toFixed(3)} to the nearest ${to}.`, choices: uniqChoices(x.toFixed(p), [(Math.floor(x * Math.pow(10, p)) / Math.pow(10, p) === +x.toFixed(p) ? (Math.ceil(x * Math.pow(10, p)) / Math.pow(10, p)) : (Math.floor(x * Math.pow(10, p)) / Math.pow(10, p))).toFixed(p), x.toFixed(p === 1 ? 2 : 1), Math.round(x).toFixed(0)]), answer: x.toFixed(p), hint: 'Look at the next digit to the right: 5 or more rounds up.'}); });
addSkill('m5_fracadd', {subject: 'math', label: 'Add and subtract fractions (different bottoms)', std: '5.NF.1-2', g: [5, 5], weight: 1.5}, () => { const ds = pick([[2, 4], [3, 6], [2, 3], [3, 4], [4, 8], [2, 5], [5, 10], [4, 6], [6, 8]]); const [d1, d2] = shuffle(ds); const a = R(1, d1 - 1), b = R(1, d2 - 1); const sub = Math.random() < .4 && a / d1 > b / d2;
  const L = d1 * d2 / gcd(d1, d2), n = sub ? a * L / d1 - b * L / d2 : a * L / d1 + b * L / d2; const [sn, sd] = simp(n, L); const ans = fmtMixed(sn, sd);
  return choiceItem({prompt: `${fr(a, d1)} ${sub ? '−' : '+'} ${fr(b, d2)} = ?`, say: `What is ${a} over ${d1} ${sub ? 'minus' : 'plus'} ${b} over ${d2}?`, choices: uniqChoices(ans, [fr(sub ? Math.abs(a - b) : a + b, sub ? Math.abs(d1 - d2) || d1 : d1 + d2), fmtMixed(n + 1, L), fmtMixed(Math.max(1, n - 1), L)]), answer: ans, hint: `Make the bottoms the same first (use ${L}), then ${sub ? 'subtract' : 'add'} the tops.`}); });
addSkill('m5_fracmul', {subject: 'math', label: 'Multiply and divide fractions', std: '5.NF.4 / 5.NF.7', g: [5, 5]}, () => { const k = R(0, 2);
  if (k === 0) { const a = R(1, 4), b = pick([2, 3, 4, 5]), c = R(1, 4), d = pick([2, 3, 4, 5, 6]); const [n, m] = simp(a * c, b * d); return choiceItem({prompt: `${fr(a, b)} × ${fr(c, d)} = ?`, say: `What is ${a} over ${b} times ${c} over ${d}?`, choices: uniqChoices(fmtMixed(n, m), [fr(a + c, b + d), fmtMixed(...simp(a * d, b * c)), fr(a * c, b + d)]), answer: fmtMixed(n, m), hint: 'Multiply the tops, multiply the bottoms, then simplify.'}); }
  if (k === 1) { const d = pick([2, 3, 4, 5]), w = d * R(1, 6); return numItem({prompt: `${fr(1, d)} of ${w} = ?`, say: `What is one ${d === 2 ? 'half' : d === 3 ? 'third' : d === 4 ? 'fourth' : 'fifth'} of ${w}?`, answer: w / d, hint: `Split ${w} into ${d} equal groups.`}); }
  const d = pick([2, 3, 4, 5]), w = R(2, 6); return numItem({prompt: `${w} ÷ ${fr(1, d)} = ?`, say: `How many ${d === 2 ? 'halves' : d === 3 ? 'thirds' : d === 4 ? 'fourths' : 'fifths'} are in ${w}?`, answer: w * d, hint: `Each whole has ${d} pieces of size 1/${d}.`}); });
addSkill('m5_div', {subject: 'math', label: 'Divide by 2-digit numbers', std: '5.NBT.6', g: [5, 5]}, () => { const d = R(11, 45), q = R(level('m5_div') === 1 ? 4 : 12, level('m5_div') === 3 ? 199 : 60);
  return numItem({prompt: `${d * q} ÷ ${d} = ?`, say: `What is ${d * q} divided by ${d}?`, answer: q, hint: `Estimate: ${d} is about ${Math.round(d / 10) * 10}. How many ${d}s fit in ${d * q}?`}); });
addSkill('m5_volume', {subject: 'math', label: 'Volume', std: '5.MD.3-5', g: [5, 5]}, () => { const l = R(2, 9), w = R(2, 6), h = R(2, 6);
  return pick([() => numItem({prompt: `A box is ${l} cm long, ${w} cm wide and ${h} cm tall. What is its volume in cubic cm?`, say: `A box is ${l} centimeters long, ${w} centimeters wide and ${h} centimeters tall. What is its volume in cubic centimeters?`, visual: boxSVG(l, w, h), answer: l * w * h, hint: 'Volume = length × width × height.'}),
    () => numItem({prompt: `A tank holds ${l * w * h} cubic feet. Its base is ${l} ft by ${w} ft. How tall is it?`, say: `A tank holds ${l * w * h} cubic feet. Its base is ${l} feet by ${w} feet. How many feet tall is it?`, answer: h, hint: `Base area is ${l * w}. Divide the volume by it.`})])(); });
addSkill('m5_coord', {subject: 'math', label: 'The coordinate plane', std: '5.G.1-2', g: [5, 5]}, () => { const x = R(0, 8), y = R(0, 8);
  return choiceItem({prompt: 'What are the coordinates of the red point?', say: 'What are the coordinates of the red point? Over first, then up.', visual: coordSVG(x, y), choices: uniqChoices(`(${x}, ${y})`, [`(${y}, ${x})`, `(${x + 1}, ${y})`, `(${x}, ${Math.max(0, y - 1)})`]), answer: `(${x}, ${y})`, hint: 'Start at 0. Go across the bottom first (x), then up (y).'}); });
addSkill('m5_expr', {subject: 'math', label: 'Expressions and order of operations', std: '5.OA.1-2', g: [5, 5]}, () => { const a = R(2, 9), b = R(2, 9), c = R(2, 9); const k = R(0, 2);
  if (k === 0) return numItem({prompt: `${a} × (${b} + ${c}) = ?`, say: `What is ${a} times, in parentheses, ${b} plus ${c}?`, answer: a * (b + c), hint: 'Work inside the parentheses first.'});
  if (k === 1) return numItem({prompt: `${a} + ${b} × ${c} = ?`, say: `What is ${a} plus ${b} times ${c}?`, answer: a + b * c, hint: 'Multiply before you add.'});
  return choiceItem({prompt: `Which expression means "add ${a} and ${b}, then multiply by ${c}"?`, say: `Which expression means add ${a} and ${b}, then multiply by ${c}?`, choices: uniqChoices(`(${a} + ${b}) × ${c}`, [`${a} + ${b} × ${c}`, `${a} × ${b} + ${c}`, `(${a} × ${b}) + ${c}`]), answer: `(${a} + ${b}) × ${c}`, hint: 'Parentheses show what to do first.'}); });
addSkill('m5_shapes', {subject: 'math', label: 'Classifying shapes', std: '5.G.3-4', g: [5, 5]}, () => { const q = pick([['Every square is also a…', 'rectangle', ['triangle', 'pentagon']], ['A triangle with a right angle is a…', 'right triangle', ['equilateral triangle', 'obtuse triangle']], ['A quadrilateral with 4 right angles and 4 equal sides is a…', 'square', ['rhombus only', 'kite']],
  ['A triangle with all sides equal is…', 'equilateral', ['scalene', 'isosceles only']], ['A parallelogram with 4 right angles is a…', 'rectangle', ['trapezoid', 'pentagon']], ['A shape with 5 sides is a…', 'pentagon', ['hexagon', 'octagon']], ['A shape with 8 sides is an…', 'octagon', ['hexagon', 'pentagon']]]);
  return choiceItem({prompt: q[0], say: q[0], choices: shuffle([q[1], ...q[2]]), answer: q[1], hint: 'Think about the sides and the angles.', speakChoices: true}); });
addSkill('m5_lineplot', {subject: 'math', label: 'Line plots with fractions', std: '5.MD.2', g: [5, 5]}, () => { const vals = [['1/4', 0.25], ['1/2', 0.5], ['3/4', 0.75]]; const cnt = vals.map(() => R(1, 4)); const tot = vals.reduce((s, v, i) => s + v[1] * cnt[i], 0);
  const vis = `<div class="graph">${vals.map((v, i) => `<div>${v[0]} cup: ${'✖️'.repeat(cnt[i])}</div>`).join('')}</div>`;
  return choiceItem({prompt: 'Each ✖ is one bottle of water. How many cups of water in all?', say: 'The line plot shows how much water is in each bottle. How many cups of water are there in all?', visual: vis, choices: uniqChoices(fmtMixed(tot * 4, 4).replace(/ 2\/4$/, ' 1/2').replace(/^2\/4$/, '1/2'), [fmtMixed(tot * 4 + 1, 4), fmtMixed(Math.max(1, tot * 4 - 2), 4), String(cnt.reduce((a, b) => a + b, 0))]), answer: fmtMixed(tot * 4, 4).replace(/ 2\/4$/, ' 1/2').replace(/^2\/4$/, '1/2'), hint: 'Multiply each amount by how many ✖ it has, then add.'}); });

// ---------- 8. California additions (CA) ----------
addSkill('m2_timefacts', {subject: 'math', label: 'Time facts: minutes, days, weeks (CA)', std: '2.MD.7 (CA)', g: [2, 3]}, () => { const q = pick([['How many minutes are in 1 hour?', 60], ['How many hours are in 1 day?', 24], ['How many days are in 1 week?', 7], ['How many weeks are in 1 year?', 52],
  ['How many months are in 1 year?', 12], ['How many days are in a year (not a leap year)?', 365], ['How many minutes are in half an hour?', 30], ['How many days are in 2 weeks?', 14], ['How many seconds are in 1 minute?', 60]]);
  return numItem({prompt: q[0], say: q[0], answer: q[1], hint: 'Think of a clock and a calendar.'}); });
addSkill('m4_triangles', {subject: 'math', label: 'Naming triangles and quadrilaterals (CA)', std: '4.G.2 (CA)', g: [4, 5]}, () => { const q = pick([['A triangle with 3 equal sides is…', 'equilateral', ['isosceles', 'scalene']], ['A triangle with exactly 2 equal sides is…', 'isosceles', ['equilateral', 'scalene']], ['A triangle with no equal sides is…', 'scalene', ['isosceles', 'equilateral']],
  ['A quadrilateral with 4 equal sides and no right angles is a…', 'rhombus', ['rectangle', 'trapezoid']], ['A quadrilateral with 2 pairs of parallel sides is a…', 'parallelogram', ['trapezoid', 'kite']], ['A triangle with one angle bigger than a right angle is…', 'obtuse', ['acute', 'right']]]);
  return choiceItem({prompt: q[0], say: q[0], choices: shuffle([q[1], ...q[2]]), answer: q[1], hint: 'Count the equal sides, then look at the angles.', speakChoices: true}); });
addSkill('m5_primefac', {subject: 'math', label: 'Prime factorization (CA)', std: '5.OA.2.1 (CA)', g: [5, 5]}, () => { const n = pick([6, 8, 10, 12, 14, 15, 18, 20, 21, 24, 27, 28, 30, 32, 36, 40, 42, 45, 48, 50]); const f = []; let x = n; for (let p = 2; x > 1; p++) while (x % p === 0) { f.push(p); x /= p; }
  const ans = f.join(' × '); const wrong = [f.slice(0, -1).concat(f[f.length - 1] * 2).join(' × '), `${f[0]} × ${n / f[0]}`, `1 × ${n}`].filter(w => w !== ans);
  return choiceItem({prompt: `Which is the prime factorization of ${n}?`, say: `Which shows ${n} as a product of prime numbers?`, choices: uniqChoices(ans, wrong), answer: ans, hint: 'Keep breaking the number into factors until every factor is prime.'}); });
