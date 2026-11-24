/* Learning Gate — quiz skills built from the K–5 banks (banks.js: science, social studies, arts, health;
   lang-banks.js: reading and language for Grades 2–5). Each skill is registered only when its data is present.
   Standards: CA NGSS, CA History–Social Science, CA Arts and Health, CA CCSS ELA (RF, RL, RI, L). */
'use strict';
(() => {
  const GK = ['K', '1', '2', '3', '4', '5'];
  const gk = (lo, hi) => { const n = Math.max(lo, Math.min(hi, gradeNum())); return n === 0 ? 'K' : String(n); };
  const bold = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const plain = s => String(s).replace(/\*\*/g, '');
  const recent = {};   // don't repeat one of the last few items of a bank
  const fresh = (key, list) => { const r = recent[key] = recent[key] || []; const pool = list.filter((_, i) => !r.includes(i)); const i = list.indexOf(pick(pool.length ? pool : list)); r.push(i); if (r.length > Math.min(8, Math.floor(list.length / 2))) r.shift(); return list[i]; };
  const mc = (prompt, say, ans, wrongs, extra) => Object.assign({type: 'choice', prompt, say, choices: shuffle([ans, ...wrongs.filter(w => w !== ans).slice(0, 3)]), answer: ans, wordChoices: true, speakChoices: true}, extra || {});

  // ---------- science, social studies, arts and health banks ----------
  if (typeof BANKS !== 'undefined') {
    const bankSkill = (id, subject, label, std, g, list) => { if (!list || !list.length) return;
      addSkill(id, {subject, label, std, g, weight: 1.1}, () => { const [q, a, w1, w2, e, code] = fresh(id, list);
        return mc(esc(q), q, a, [w1, w2], {visual: e ? big(e) : '', hint: 'Think about what you have learned and seen in real life.', std: code}); }); };
    GK.forEach((g, n) => {
      bankSkill('sci_' + g, 'science', `Science, ${n ? 'Grade ' + n : 'Kindergarten'} (CA NGSS)`, 'CA NGSS ' + (n ? n : 'K'), [n, n], (BANKS.science || {})[g]);
      bankSkill('soc_' + g, 'social', `Social studies, ${n ? 'Grade ' + n : 'Kindergarten'} (CA HSS)`, 'CA HSS ' + (n ? n : 'K'), [n, n], (BANKS.social || {})[g]);
    });
    bankSkill('arts_K2', 'art', 'Arts: music, dance, theater, visual art', 'CA Arts K–2', [0, 2], (BANKS.arts || {}).K2);
    bankSkill('arts_35', 'art', 'Arts: music, dance, theater, visual art', 'CA Arts 3–5', [3, 5], (BANKS.arts || {})['35']);
    bankSkill('hlth_K2', 'science', 'Health and safety', 'CA Health K–2', [0, 2], (BANKS.health || {}).K2);
    bankSkill('hlth_35', 'science', 'Health and safety', 'CA Health 3–5', [3, 5], (BANKS.health || {})['35']);
  }

  // ---------- reading and language (Grades 2–5) ----------
  if (typeof LANG === 'undefined') return;
  const L = LANG, byGrade = (obj, lo, hi) => (obj || {})[gk(lo, hi)] || [].concat(...Object.values(obj || {}));
  const has = x => x && (Array.isArray(x) ? x.length : Object.keys(x).length);
  const sk2 = (id, meta, gen) => addSkill(id, Object.assign({weight: 1.2}, meta), gen);

  if (has(L.prefixes)) sk2('r_prefix', {subject: 'reading', label: 'Prefixes (un-, re-, pre-…)', std: 'RF.2.3d / L.3.4b', g: [2, 4]}, () => { const [p, m, ex] = fresh('r_prefix', L.prefixes); const w = pick(ex); const others = shuffle([...new Set(L.prefixes.map(x => x[1]))].filter(x => x !== m && !x.includes(m) && !m.includes(x))).slice(0, 2);
    return mc(`What does the prefix <b>${esc(p)}-</b> mean in <b>${esc(w)}</b>?`, `What does the prefix ${p} mean in the word ${w}?`, m, others, {hint: `Other ${p}- words: ${ex.filter(x => x !== w).join(', ')}.`}); });
  if (has(L.suffixes)) sk2('r_suffix', {subject: 'reading', label: 'Suffixes (-ful, -less, -ly…)', std: 'RF.2.3d / L.3.4b', g: [2, 4]}, () => { const [s, m, ex] = fresh('r_suffix', L.suffixes); const w = pick(ex); const others = shuffle([...new Set(L.suffixes.map(x => x[1]))].filter(x => x !== m && !x.includes(m) && !m.includes(x))).slice(0, 2);
    return mc(`What does the suffix <b>-${esc(s)}</b> mean in <b>${esc(w)}</b>?`, `What does the ending ${s} mean in the word ${w}?`, m, others, {hint: `Other -${s} words: ${ex.filter(x => x !== w).join(', ')}.`}); });
  if (has(L.roots)) sk2('r_roots', {subject: 'reading', label: 'Greek and Latin roots', std: 'L.4.4b / L.5.4b', g: [4, 5]}, () => { const [r, m, ex] = fresh('r_roots', L.roots); const w = pick(ex); const others = shuffle([...new Set(L.roots.map(x => x[1]))].filter(x => x !== m && !x.includes(m) && !m.includes(x))).slice(0, 2);
    return mc(`The root <b>${esc(r)}</b> in <b>${esc(w)}</b> means…`, `The root ${r} in the word ${w} means what?`, m, others, {hint: `Think of other words with ${r}: ${ex.filter(x => x !== w).join(', ')}.`}); });
  if (has(L.synonyms)) sk2('r_syn', {subject: 'reading', label: 'Synonyms', std: 'L.2.5 / L.4.5c', g: [2, 5]}, () => { const [w, s, wr] = fresh('r_syn' + gk(2, 5), byGrade(L.synonyms, 2, 5));
    return mc(`Which word means almost the same as <b>${esc(w)}</b>?`, `Which word means almost the same as ${w}?`, s, wr, {hint: 'A synonym can take its place in a sentence without changing the meaning.'}); });
  if (has(L.antonyms)) sk2('r_ant', {subject: 'reading', label: 'Antonyms', std: 'L.1.5 / L.2.5 / L.4.5c', g: [1, 5]}, () => { const [w, a, wr] = fresh('r_ant' + gk(1, 5), byGrade(L.antonyms, 1, 5));
    return mc(`Which word means the opposite of <b>${esc(w)}</b>?`, `Which word means the opposite of ${w}?`, a, wr, {hint: 'An antonym is as different as can be.'}); });
  if (has(L.homophones)) sk2('r_homo', {subject: 'writing', label: 'Homophones (there, their, they\'re…)', std: 'L.2.2 / L.4.1g', g: [2, 4]}, () => { const [s, a, wr] = fresh('r_homo', L.homophones);
    return mc(`Which word fits?<div class="eq small">${esc(s).replace('___', '▢')}</div>`, `Which word fits? ${s.replace('___', 'blank')}`, a, wr, {speakChoices: false, hint: 'They sound the same but mean different things. Read the sentence with each one.'}); });
  if (has(L.multiMeaning)) sk2('r_multi', {subject: 'reading', label: 'Words with more than one meaning', std: 'L.2.4 / L.5.5c', g: [2, 5]}, () => { const [s, w, m, wr] = fresh('r_multi', L.multiMeaning);
    return mc(`<div class="eq small">${esc(s)}</div>What does <b>${esc(w)}</b> mean here?`, `${s} What does ${w} mean in this sentence?`, m, wr, {hint: 'Use the other words in the sentence as clues.'}); });
  if (has(L.figurative)) sk2('r_figur', {subject: 'reading', label: 'Similes, metaphors and idioms', std: 'L.3.5a / L.4.5 / L.5.5', g: [3, 5]}, () => { const [s, kind, m, wr] = fresh('r_figur' + gk(3, 5), byGrade(L.figurative, 3, 5));
    if (Math.random() < .5) return mc(`<div class="eq small">${esc(s)}</div>What does it really mean?`, `${s} What does it really mean?`, m, wr, {hint: `This is a${/^[aeiou]/.test(kind) ? 'n' : ''} ${kind}. The words don't mean exactly what they say.`});
    const kinds = ['simile', 'metaphor', 'idiom', 'personification', 'hyperbole'].filter(k => k !== kind); return mc(`<div class="eq small">${esc(s)}</div>What kind of language is this?`, `${s} What kind of language is this?`, kind, shuffle(kinds).slice(0, 2), {hint: 'A simile uses like or as. A metaphor says one thing IS another. An idiom is a saying.'}); });
  if (has(L.contextClues)) sk2('r_context', {subject: 'reading', label: 'Context clues', std: 'L.3.4a / L.4.4a / L.5.4a', g: [3, 5]}, () => { const [s, w, m, wr] = fresh('r_context' + gk(3, 5), byGrade(L.contextClues, 3, 5));
    return mc(`<div class="eq small">${bold(s)}</div>What does <b>${esc(w)}</b> mean?`, `${plain(s)} What does ${w} mean?`, m, wr, {hint: 'Look at the words around it for clues.'}); });
  if (has(L.irregularPast)) sk2('w_irrpast', {subject: 'writing', label: 'Irregular past-tense verbs', std: 'L.2.1d / L.3.1d', g: [2, 3]}, () => { const [v, p] = fresh('w_irrpast', L.irregularPast); const wrong = [v + (v.endsWith('e') ? 'd' : 'ed'), v.endsWith('s') ? v + 'es' : v + 's'].filter(x => x !== p);
    return mc(`Yesterday I ___ (${esc(v)}).<br>Which word is right?`, `Yesterday I blank. Use the word ${v}. Which is right?`, p, wrong, {hint: `Some verbs change in the past tense. ${v} becomes…`}); });
  const PLURALS = (L.irregularPlural || []).filter(p => !['fish', 'person'].includes(p[0]));   // "fishes" and "persons" are also correct
  if (PLURALS.length) sk2('w_irrplural', {subject: 'writing', label: 'Irregular plurals', std: 'L.2.1b', g: [2, 3]}, () => { const [one, many] = fresh('w_irrplural', PLURALS); const wrong = [one + 's', one + 'es'].filter(x => x !== many);
    return mc(`One <b>${esc(one)}</b>, two…`, `One ${one}, two what?`, many, wrong, {hint: 'Some words change in a special way when there is more than one.'}); });
  if (has(L.partsOfSpeech)) sk2('w_pos', {subject: 'writing', label: 'Parts of speech', std: 'L.2.1 / L.3.1a', g: [2, 5]}, () => { const list = byGrade(L.partsOfSpeech, 2, 5); const [s, w, pos] = fresh('w_pos' + gk(2, 5), list);
    const kinds = [...new Set(list.map(x => x[2]))].filter(k => k !== pos);
    return mc(`<div class="eq small">${bold(s)}</div>What part of speech is <b>${esc(w)}</b>?`, `${plain(s)} What part of speech is the word ${w}?`, pos, shuffle(kinds).slice(0, 2), {speakChoices: true, hint: 'Noun: person, place or thing. Verb: action. Adjective: describes a noun. Adverb: describes a verb.'}); });
  if (has(L.agreement)) sk2('w_agree', {subject: 'writing', label: 'Subject and verb agreement', std: 'L.3.1f', g: [3, 4]}, () => { const [s, a, wr] = fresh('w_agree', L.agreement);
    return mc(`Which word fits?<div class="eq small">${esc(s).replace('___', '▢')}</div>`, `Which word fits? ${s.replace('___', 'blank')}`, a, wr, {hint: 'One person or thing usually takes a verb with -s. More than one does not.'}); });
  if (has(L.tenses)) sk2('w_tense', {subject: 'writing', label: 'Verb tenses', std: 'L.3.1e / L.4.1b-c / L.5.1b-d', g: [3, 5]}, () => { const [s, a, wr, name] = fresh('w_tense' + gk(3, 5), byGrade(L.tenses, 3, 5));
    return mc(`Which verb fits?<div class="eq small">${esc(s).replace('___', '▢')}</div>`, `Which verb fits? ${s.replace('___', 'blank')}`, a, wr, {hint: name ? `This sentence needs the ${name}.` : 'Look for time words like yesterday, now or tomorrow.'}); });
  if (has(L.sentences)) sk2('w_sentence', {subject: 'writing', label: 'Complete sentences, fragments and run-ons', std: 'L.3.1i / L.4.1f', g: [3, 5]}, () => { const [ok, wr] = fresh('w_sentence' + gk(3, 5), byGrade(L.sentences, 3, 5));
    return mc('Which is a complete, correct sentence?', 'Which is a complete, correct sentence?', ok, wr, {speakChoices: false, hint: 'A sentence has a subject and a verb and tells a complete thought. Two thoughts need a joining word or a period.'}); });
  if (has(L.punctuation)) sk2('w_punct2', {subject: 'writing', label: 'Commas, apostrophes and quotation marks', std: 'L.1.2 / L.2.2 / L.3.2 / L.4.2 / L.5.2', g: [1, 5]}, () => { const [ok, wr] = fresh('w_punct2' + gk(1, 5), byGrade(L.punctuation, 1, 5));
    return mc('Which one is punctuated correctly?', 'Which one has the punctuation right?', ok, wr, {speakChoices: false, hint: 'Check the commas, apostrophes and quotation marks one by one.'}); });
  if (has(L.spelling)) sk2('w_spell2', {subject: 'writing', label: 'Spelling grade-level words', std: 'L.1.2d / L.2.2d / L.3.2e-g', g: [1, 5]}, () => { const [ok, wr] = fresh('w_spell2' + gk(1, 5), byGrade(L.spelling, 1, 5));
    return mc(`Which word is spelled correctly?`, `Which word is spelled correctly? ${ok}.`, ok, wr, {speakChoices: false, hint: 'Say it slowly and look at each part of the word.'}); });
  if (has(L.passages)) sk2('r_passage', {subject: 'reading', label: 'Reading passages: details, main idea, inference', std: 'RL/RI.2–5.1-6', g: [2, 5], weight: 1.6}, () => { const p = fresh('r_passage' + gk(2, 5), byGrade(L.passages, 2, 5)); const [q, a, ...w] = pick(p.q);
    return mc(`<div class="story"><b>${esc(p.t)}</b><br>${esc(p.text)}</div><div class="q">${esc(q)}</div>`, `${p.t}. ${p.text} ... ${q}`, a, w, {hint: 'Read the passage again and look for the sentence that answers the question.'}); });
  if (has(L.aloud)) { const base = G.r_aloud; G.r_aloud = function () { if (gradeNum() < 3) return base.apply(this, arguments); const list = byGrade(L.aloud, 3, 5);
    return {type: 'aloud', prompt: 'Read this out loud:', text: pick(list), say: 'Press the microphone and read this sentence out loud.'}; }; }
})();
