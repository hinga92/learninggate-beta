/* First-run setup wizard for a new family, plus the "Child, grade and sight words" card in Grown-ups.
   Runs on the first launch (no grown-up PIN yet): child's name and grade, grown-up PIN, who to call for help,
   study-call helpers, rest time, bedtime-story time and play limits, and an optional class word list.
   Everything here can be changed later in Grown-ups. Nothing is sent anywhere: progress sync to the family's
   own Google Sheet is a separate, optional step (FAMILY_SETUP.md). */
'use strict';

const GRADES = [['K', 'Kindergarten', '🌱'], ['1', 'Grade 1', '🌿'], ['2', 'Grade 2', '🌳'], ['3', 'Grade 3', '🍎'], ['4', 'Grade 4', '🚀'], ['5', 'Grade 5', '🎓']];
const EASY_PIN = /^(\d)\1{3}$|^(0123|1234|2345|3456|4567|5678|6789|9876|4321|2580|0000)$/;
const PHONE_OK = v => !v || /^\+?[0-9 ()-]{8,20}$/.test(v);
const TIME_OK = v => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

addScreen('setup', `<header class="phead"><h2>👋 Welcome to Learning Gate</h2><span class="muted" id="wzStep"></span></header>
  <div class="pbody wzbody"><div id="wzBody"></div><p class="wzerr" id="wzErr" role="alert"></p>
  <div class="row wznav"><button class="small-btn" id="wzBack">⬅ Back</button><button class="small-btn ok" id="wzNext">Next ➡</button></div></div>`);

let WZ = null;   // the answers so far; copied into the settings only when the wizard is finished
function wzDefaults() {
  const h = (typeof normHelpers === 'function' ? normHelpers() : (S.studyHelpers || [])).map(x => Object.assign({}, x));
  return {i: 0, childName: S.childName || '', grade: S.grade || '1', mascotName: S.mascotName || 'Hoot', pin: '', pin2: '',
    helpName: S.helpName || '', helpPhone: S.helpPhone || '', helpers: h, bedtimeStart: S.bedtimeStart || '20:00', bedtimeEnd: S.bedtimeEnd || '07:00',
    btFrom: S.btFrom || '19:30', btTo: S.btTo || '20:45', dailyMaxMinutes: S.dailyMaxMinutes, minutesPerUnlock: S.minutesPerUnlock,
    questionsPerUnlock: S.questionsPerUnlock, classWords: (S.classWords || []).join(', ')};
}

const WZ_STEPS = [
  {title: 'Welcome', html: () => `<div class="card hl wzhero"><div class="mascot">🦉</div>
      <h3>Let's set up Learning Gate for your child</h3>
      <p>This device will stay on a friendly learning screen. Your child answers a few questions or reads a real book to <b>earn play time</b> on the apps you choose.</p>
      <p>Setup takes about 3 minutes. You can change every answer later in <b>⚙ Grown-ups</b> (hold the ⚙ button for 1 second, then enter your PIN).</p>
      <p class="muted">Everything stays on this device. Sharing progress with your phone through your own Google Sheet is optional and comes later.</p></div>`},
  {title: 'Your child', html: w => `<div class="card"><h3>👧 About your child</h3>
      <label>First name (or nickname) <input id="wName" maxlength="30" autocomplete="off" value="${esc(w.childName)}" placeholder="e.g. Amani"></label>
      <p>Grade</p><div class="row wzgrades">${GRADES.map(([g, n, ic]) => `<button class="bigbtn2 ${w.grade === g ? 'ok' : 'ghost'}" data-grade="${g}">${ic} ${n}</button>`).join('')}</div>
      <p class="muted">The grade picks the skills (California and Common Core standards for that grade), where each one starts, and which sight words come first. After that the app adapts: a skill moves up after 85% right on the first try, and down below 60%.</p>
      <label>Name of the owl that grows as your child learns <input id="wOwl" maxlength="20" value="${esc(w.mascotName)}"></label></div>`,
    save: w => { w.childName = $('#wName').value.trim().replace(/[<>`"]/g, '').slice(0, 30); w.mascotName = $('#wOwl').value.trim().replace(/[<>`"]/g, '').slice(0, 20) || 'Hoot';
      if (!w.childName) return 'Please type your child\'s name.'; }},
  {title: 'Grown-up PIN', html: w => `<div class="card"><h3>🔐 Grown-up PIN</h3>
      <p>A 4-digit PIN protects the Grown-ups area. You also use it to unlock the device for yourself and to confirm real-book reading.</p>
      <label>New PIN <input id="wPin" type="password" inputmode="numeric" maxlength="4" autocomplete="off" value="${esc(w.pin)}"></label>
      <label>Type it again <input id="wPin2" type="password" inputmode="numeric" maxlength="4" autocomplete="off" value="${esc(w.pin2)}"></label>
      <p class="muted">${w.rerun ? 'Leave both boxes empty to keep your current PIN. ' : ''}Don't use a birthday or something easy like 1234. Keep it from your child.</p></div>`,
    save: w => { w.pin = $('#wPin').value.trim(); w.pin2 = $('#wPin2').value.trim();
      if (w.rerun && !w.pin && !w.pin2) return;
      if (!/^\d{4}$/.test(w.pin)) return 'The PIN must be exactly 4 digits.';
      if (EASY_PIN.test(w.pin)) return 'That PIN is too easy to guess. Please pick another.';
      if (w.pin !== w.pin2) return 'The two PINs are different. Please type the same PIN twice.'; }},
  {title: 'Help and helpers', html: w => `<div class="card"><h3>🆘 Who does ${esc(w.childName || 'your child')} call for help?</h3>
      <p>The 🆘 Help button is on every screen and always works, even when the device is locked. Add the grown-up your child should call, or skip this and add it later in Grown-ups → 🆘 Help button.</p>
      <label class="chk"><input id="wHSkip" type="checkbox" ${w.helpSkip ? 'checked' : ''}> Skip for now, I'll add it later</label>
      <div id="wHFields" ${w.helpSkip ? 'hidden' : ''}>
      <label>Name <input id="wHN" maxlength="30" value="${esc(w.helpName)}" placeholder="e.g. Mom, Dad, Grandma"></label>
      <label>Phone number <input id="wHP" inputmode="tel" maxlength="24" value="${esc(w.helpPhone)}" placeholder="+1 555 123 4567"></label></div>
      <p class="muted">Without a contact, the Help screen still shows the 🚑 911 button and asks a grown-up to add a number.</p></div>
    <div class="card"><h3>📞 Study-call helpers (optional)</h3>
      <p>People who can help with homework over a WhatsApp video call and see the screen: a parent at work, a grandparent, an aunt abroad. Add up to 3, with the country code.</p>
      ${w.helpers.map((h, k) => `<div class="row2"><label>Name <input data-wh="${k}" maxlength="30" value="${esc(h.name)}" placeholder="optional"></label><label>WhatsApp <input data-wp="${k}" inputmode="tel" maxlength="24" value="${esc(h.num)}" placeholder="+1 555 123 4567"></label></div>`).join('')}
      <p class="muted">You can skip this and add helpers later in Grown-ups → Study call.</p></div>`,
    save: w => { w.helpSkip = $('#wHSkip').checked;
      w.helpName = w.helpSkip ? '' : $('#wHN').value.trim().replace(/[<>`"]/g, '').slice(0, 30); w.helpPhone = w.helpSkip ? '' : $('#wHP').value.trim();
      document.querySelectorAll('[data-wh]').forEach(x => w.helpers[+x.dataset.wh].name = x.value.trim().replace(/[<>`"]/g, '').slice(0, 30));
      document.querySelectorAll('[data-wp]').forEach(x => w.helpers[+x.dataset.wp].num = x.value.trim());
      if (!w.helpSkip && !w.helpName) return 'Please add the name of the grown-up your child calls for help, or tick "Skip for now".';
      if (!PHONE_OK(w.helpPhone)) return 'Please enter the help phone number with digits only, like +1 555 123 4567.';
      if (w.helpers.some(h => !PHONE_OK(h.num))) return 'Please enter WhatsApp numbers with the country code, like +1 555 123 4567.';
      if (w.helpers.some(h => h.num && !h.name)) return 'Please add a name for each WhatsApp number.'; }},
  {title: 'Time and play', html: w => `<div class="card"><h3>⏰ Play rules</h3>
      <label>Questions to unlock play <input id="wQ" type="number" min="3" max="10" value="${w.questionsPerUnlock}"></label>
      <label>Minutes of play earned each time <input id="wM" type="number" min="5" max="120" value="${w.minutesPerUnlock}"></label>
      <label>Daily play limit, in minutes (0 = no limit) <input id="wD" type="number" min="0" max="600" value="${w.dailyMaxMinutes}"></label></div>
    <div class="card"><h3>🌙 Rest time and bedtime story</h3>
      <label>Rest time starts (no learning or play) <input id="wB1" type="time" value="${esc(w.bedtimeStart)}"></label>
      <label>Rest time ends (morning) <input id="wB2" type="time" value="${esc(w.bedtimeEnd)}"></label>
      <label>Bedtime story from <input id="wS1" type="time" value="${esc(w.btFrom)}"></label>
      <label>Bedtime story until <input id="wS2" type="time" value="${esc(w.btTo)}"></label>
      <p class="muted">The 🌙 bedtime story is a calm read-to-me story, one per night. Its button shows only during story time, even in rest time. The 🆘 Help button works at any time.</p></div>`,
    save: w => { w.questionsPerUnlock = Math.max(3, Math.min(10, +$('#wQ').value || 5)); w.minutesPerUnlock = Math.max(5, Math.min(120, +$('#wM').value || 20));
      w.dailyMaxMinutes = Math.max(0, Math.min(600, +$('#wD').value || 0));
      w.bedtimeStart = $('#wB1').value; w.bedtimeEnd = $('#wB2').value; w.btFrom = $('#wS1').value; w.btTo = $('#wS2').value;
      if (![w.bedtimeStart, w.bedtimeEnd, w.btFrom, w.btTo].every(TIME_OK)) return 'Please fill in all four times.'; }},
  {title: 'Sight words', html: w => `<div class="card"><h3>📖 Sight words</h3>
      <p>The app practises the Dolch sight words for ${esc(GRADES.find(g => g[0] === w.grade)[1])}, in its stories, games and read-aloud sentences.</p>
      <p><b>Optional:</b> if your child's teacher sent home a list of words for the class, paste or type it here. Those words come first.</p>
      <textarea id="wCW" rows="4" class="wzarea" placeholder="e.g. the, and, said, come, here, play">${esc(w.classWords)}</textarea>
      <p class="muted">Words separated by commas or spaces. You can change the list any time in Grown-ups → Child, grade and sight words.</p></div>`,
    save: w => { w.classWords = $('#wCW').value; }},
  {title: 'All set', html: w => { const ws = uniqWords(w.classWords); const hs = w.helpers.filter(h => h.num);
      return `<div class="card hl"><h3>🎉 Ready for ${esc(w.childName)}!</h3><ul>
      <li>${esc(GRADES.find(g => g[0] === w.grade)[1])} · ${w.questionsPerUnlock} questions earn ${w.minutesPerUnlock} minutes of play${w.dailyMaxMinutes ? ', up to ' + w.dailyMaxMinutes + ' minutes a day' : ''}</li>
      <li>Rest time ${esc(w.bedtimeStart)}–${esc(w.bedtimeEnd)} · bedtime story ${esc(w.btFrom)}–${esc(w.btTo)}</li>
      <li>🆘 Help: ${w.helpName ? 'calls ' + esc(w.helpName) + (w.helpPhone ? ' (' + esc(w.helpPhone) + ')' : ' (no number yet)') : 'no contact yet (add one later in Grown-ups)'}</li>
      <li>📞 Study-call helpers: ${hs.length ? hs.map(h => esc(h.name)).join(', ') : 'none yet'}</li>
      <li>📖 Sight words: Dolch lists${ws.length ? ' + ' + ws.length + ' words from the class list' : ''}</li></ul></div>
      <div class="card"><h3>What's next</h3><ol>
      <li>${Bridge.native ? 'Finish the <b>device setup</b> on the next screen: tap <b>Fix</b> next to each ⚠️ and choose the apps your child may use after learning.' : 'On a tablet or iPad, the next screen walks you through the device permissions and the apps your child may use.'}</li>
      <li><b>Optional:</b> see progress on your phone and get a weekly email: follow <b>FAMILY_SETUP.md</b> to make your own copy of the Learning Gate Sheet, then paste its link in Grown-ups → 📡 Progress sync.</li>
      <li>Open <b>📖 User guide</b> at the top of Grown-ups any time.</li></ol></div>`; }}
];

function openSetupWizard() {
  if (!WZ) WZ = wzDefaults();
  renderWizard();
}
function renderWizard() {
  const w = WZ, st = WZ_STEPS[w.i];
  $('#wzStep').textContent = `Step ${w.i + 1} of ${WZ_STEPS.length} · ${st.title}`;
  $('#wzBody').innerHTML = st.html(w); $('#wzErr').textContent = '';
  $('#wzBack').style.visibility = w.i ? '' : 'hidden';
  $('#wzNext').textContent = w.i === 0 ? '🚀 Start' : w.i === WZ_STEPS.length - 1 ? '✔ Finish' : 'Next ➡';
  if ($('#wHSkip')) $('#wHSkip').onchange = () => { $('#wHFields').hidden = $('#wHSkip').checked; };
  document.querySelectorAll('[data-grade]').forEach(b => b.onclick = () => { w.childName = $('#wName').value; w.mascotName = $('#wOwl').value; w.grade = b.dataset.grade;
    if (w.questionsPerUnlock === S.questionsPerUnlock) w.questionsPerUnlock = w.grade === 'K' ? 3 : 5; renderWizard(); });
  show('setup'); $('#setup').scrollTop = 0;
  const first = $('#wzBody input'); if (first && !first.value) setTimeout(() => { try { first.focus(); } catch (e) {} }, 50);
}
function wzNext() {
  const w = WZ, st = WZ_STEPS[w.i];
  const err = st.save ? st.save(w) : '';
  if (err) { $('#wzErr').textContent = '⚠️ ' + err; return; }
  if (w.i < WZ_STEPS.length - 1) { w.i++; return renderWizard(); }
  finishWizard();
}
function finishWizard() {
  const w = WZ;
  Object.assign(S, {childName: w.childName, grade: w.grade, mascotName: w.mascotName, helpName: w.helpName, helpPhone: w.helpPhone,
    studyHelpers: w.helpers.map(h => ({name: h.name, num: h.num})), bedtimeStart: w.bedtimeStart, bedtimeEnd: w.bedtimeEnd, btFrom: w.btFrom, btTo: w.btTo,
    questionsPerUnlock: w.questionsPerUnlock, minutesPerUnlock: w.minutesPerUnlock, dailyMaxMinutes: w.dailyMaxMinutes, classWords: uniqWords(w.classWords), setupDone: true});
  if (w.pin) { S.pin = makePin(w.pin); S.pinLock = {fails: 0, until: 0}; }
  S.settingsT = Date.now();
  applyGrade();
  saveAll(); Bridge.volumeCap(S.volumeCapPct);
  WZ = null;
  if (Bridge.native) renderParent(false); else renderHome();   // on a device, the device setup checklist comes next (setupFirst)
}
// Right after the wizard (and while anything is still missing), show the Tablet setup checklist first.
function setupFirst() {
  const card = [...document.querySelectorAll('#parentBody .card')].find(c => /^(Tablet setup|iPad setup)/.test((c.querySelector('h3') || {}).textContent || ''));
  if (!card || !/⚠️/.test(card.textContent)) return;
  card.classList.add('hl');
  if (!card.querySelector('.wznote')) card.querySelector('h3').insertAdjacentHTML('afterend', '<p class="wznote">Last step: tap <b>Fix</b> next to each ⚠️ and allow it, then come back here. After that, choose the apps your child may use further down this page.</p>');
  $('#parentBody').insertBefore(card, $('#parentBody').firstChild);
  $('#parent').scrollTop = 0;
}
// Grade or class words changed: rebuild the sight-word levels (stories.js keeps a set of all words it can track).
function applyGrade() {
  buildSight(S.grade, S.classWords);
  if (typeof SIGHT_SET !== 'undefined') [].concat(...SIGHT).forEach(x => SIGHT_SET.add(x.toLowerCase()));
}
$('#wzNext').onclick = wzNext;
$('#wzBack').onclick = () => { const st = WZ_STEPS[WZ.i]; if (st.save) st.save(WZ); WZ.i = Math.max(0, WZ.i - 1); renderWizard(); };
$('#wzBody').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); wzNext(); } });

// ---- Grown-ups card: child, grade and sight words (and running the wizard again) ----
(() => {
  const card = () => `<div class="card" id="grCard"><h3>👧 Child, grade and sight words</h3>
    <label>Grade <select id="grSel">${GRADES.map(([g, n]) => `<option value="${g}" ${S.grade === g ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
    <p>Class sight-word list from the teacher (optional; these words come first, then the Dolch words for the grade):</p>
    <textarea id="grCW" rows="3" class="wzarea" placeholder="e.g. the, and, said, come, here, play">${esc((S.classWords || []).join(', '))}</textarea>
    <p class="muted">Changing the grade changes where new skills start and the sight-word lists. Skills already practised keep their level.</p>
    <div class="row"><button class="small-btn" id="grWizard">🧭 Run the setup wizard again</button></div></div>`;
  const prevRP = renderParent;
  renderParent = function () {
    const r = prevRP.apply(this, arguments);
    const rules = [...document.querySelectorAll('#parentBody .card')].find(c => c.querySelector('#sName'));
    if (rules && !$('#grCard')) rules.insertAdjacentHTML('beforebegin', card());
    if ($('#grWizard')) $('#grWizard').onclick = () => { if (!saveParent()) return; WZ = wzDefaults(); WZ.rerun = true; WZ.i = 1; renderWizard(); };
    try { setupFirst(); } catch (e) {}
    try { if (!(S.helpPhone || '').trim()) { const hc = [...document.querySelectorAll('#parentBody .card')].find(c => /Help button/.test((c.querySelector('h3') || {}).textContent || ''));
      if (hc && !hc.querySelector('.wznote')) { hc.classList.add('hl'); hc.querySelector('h3').insertAdjacentHTML('afterend', '<p class="wznote">⚠️ No Help contact yet. Add the name and phone number of the grown-up your child should call.</p>'); } } } catch (e) {}
    return r;
  };
  const prevSP = saveParent;
  saveParent = function () {
    if ($('#grSel')) { S.grade = GRADES.some(g => g[0] === $('#grSel').value) ? $('#grSel').value : '1'; S.classWords = uniqWords($('#grCW').value); applyGrade(); }
    return prevSP.apply(this, arguments);
  };
})();

// Back from an Android settings page opened by a Fix button: save the form, then redraw so the ✅ / ⚠️ are current.
(() => {
  let fixing = false;
  const prevSetup = Bridge.setup.bind(Bridge);
  Bridge.setup = what => { if ($('#parent').classList.contains('on')) { try { saveParent(); } catch (e) {} fixing = true; } return prevSetup(what); };
  const prevResume = window.onNativeResume;
  window.onNativeResume = function () {
    if (fixing && $('#parent').classList.contains('on')) { fixing = false; return renderParent(false); }
    return prevResume ? prevResume.apply(this, arguments) : undefined;
  };
})();
