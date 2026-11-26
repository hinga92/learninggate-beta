/* In-app User guide + About (Grown-ups area). Family edition: written for any family. */
'use strict';
const APP_VERSION = '0.3.1 (family beta)';
const APP_DATE = 'November 2026';
const APP_DEVELOPER = 'a parent, for families in our community';
const MASCOT = () => (typeof S !== 'undefined' && S.mascotName) || 'Hoot';
const KID = () => esc((typeof S !== 'undefined' && S.childName) || 'your child');

const GUIDE = [
  ['What Learning Gate is', `
    <p>Learning Gate keeps __KID__'s tablet or iPad on a friendly learning screen. __KID__ answers a few questions (Kindergarten to Grade 5) or reads a real book to <b>earn play time</b> on the apps you choose. Learning comes first, and the app rewards without punishing.</p>
    <ul><li><b>Learning Gate app</b> on the child's tablet or iPad: questions, Pip's Stories, the bedtime story, real-book reading, challenges, the lock, Help and study calls.</li>
    <li><b>Grown-ups area</b> (this area, behind your PIN): settings, progress cards and parent controls.</li>
    <li><b>Optional, your own Google Sheet</b> ("family kit"): shares progress between devices, gives you a dashboard on your phone with remote control, and sends a weekly email. It lives in <b>your</b> Google account; nobody else, including the people who make the app, can see it.</li></ul>
    <p>Questions follow the California standards for each grade, Kindergarten to Grade 5 (Common Core math and English, which most US states share, CA NGSS science and CA History–Social Science, plus arts and health). ${Object.keys(SKILLS).length} skills in all; each child only sees the ones for their grade. Skills your child finds hard come up more often, and each skill has its own level (see "Sight words and levels").</p>`],
  ['First-time setup', `
    <p>The first time the app opens, a short <b>setup wizard</b> asks for:</p>
    <ol><li>Your child's first name (or a nickname) and grade: <b>Kindergarten to Grade 5</b>.</li>
    <li>A 4-digit <b>grown-up PIN</b>.</li>
    <li>Who your child calls with the 🆘 Help button (or <b>Skip for now</b> and add it later), and up to 3 optional <b>study-call helpers</b> (name and WhatsApp number).</li>
    <li>Play rules (questions per unlock, minutes earned, daily limit), <b>rest time</b> and <b>bedtime-story time</b>.</li>
    <li>An optional <b>class sight-word list</b> from the teacher.</li></ol>
    <p>All of it can be changed later here in Grown-ups. <b>👧 Child, grade and sight words</b> has a button to run the wizard again.</p>
    <p><b>On an Android tablet</b>, then tap <b>Fix</b> next to each ⚠️ in <b>Tablet setup</b> (Home app, display over other apps, microphone, usage access…) and tick the apps your child may use after learning. The lock only works while Learning Gate is the tablet's <b>Home app</b>: a copy that isn't the Home app (for example a test copy next to another Learning Gate) never pulls itself in front of other apps. <b>On an iPad</b>, approve Screen Time and choose the apps that need learning first.</p>`],
  ["A learning day", `
    <ol><li>__KID__ taps <b>🚀 Let's learn!</b> Each question is read aloud. A wrong first try gives a hint; a second miss shows the answer and brings the skill back later.</li>
    <li>The reward screen shows the score and the minutes earned. <b>Let's play!</b> opens the apps you allowed, with a countdown.</li>
    <li>When time runs out, the device comes back here and locks again.</li></ol>
    <ul><li>Defaults: 5 questions earn 20 minutes, up to 90 minutes a day (3 questions for Kindergarten; change them in Rules). When the day's play is used up, home says "Want to keep learning? Ask a grown-up" (see "More play time today").</li>
    <li><b>Rest time</b> (default 8 pm–7 am): learning and play are closed; Help and the bedtime story still work.</li>
    <li><b>🔊☀️</b> changes volume (up to your limit) and brightness.</li>
    <li>Everything is read aloud in plain words: sums like 3/4 + 1/4 are read as "3 fourths plus 1 fourth", blanks as "blank", and a tapped answer never talks over the question.</li>
    <li><b>🆘 Help</b> works on every screen, even locked or at rest time. On an iPad it opens <b>FaceTime</b> (set the FaceTime address in the Help button card).</li>
    <li><b>⚙ Grown-ups</b> (top-right of home): hold it for about 1 second, then enter the PIN.</li>
    <li><b>🔑 Grown-up key</b> (bottom-left on questions, stories, reading, challenges and results): press and hold it, enter the PIN, then choose Open Grown-ups, Stop and go home, Play now, or Parent mode. Progress so far is kept.</li></ul>`],
  ['More play time today ("keep learning")', `
    <p>If your child wants to keep learning after the daily limit, give more minutes <b>to earn</b>, not free play:</p>
    <ul><li><b>Here:</b> the card <b>📚 Let __KID__ earn more play time today</b> at the top of Grown-ups → +30 or +60.</li>
    <li><b>From your phone's dashboard</b> (if you set up your Sheet): Remote control → <b>📚 +30 / +60 min to earn</b> (asks your PIN).</li></ul>
    <p>Questions or <b>I read a book</b> then earn play again until the extra minutes are used. Today only; rest time still applies.</p>`],
  ["Pip's Stories: books for every grade", `
    <p><b>📖 Pip's Stories</b> changes with the grade you chose. The shelf shows three tabs: <b>⬇ Easier</b>, <b>📚 My grade</b> and <b>🚀 Challenge</b>, and the book that fits best has a <b>⭐ Just right</b> badge.</p>
    <ul><li><b>Kindergarten–Grade 1:</b> short sight-word books. Pip reads each page first, then your child repeats it (echo reading).</li>
    <li><b>Grades 2–3:</b> longer stories and true-fact books. Your child reads each page out loud into the microphone (Pip can read it first), with "words to know" before the book and 3–5 questions after it. Grade 3 adds a quick check-in question halfway.</li>
    <li><b>Grades 4–5:</b> chapter-style books with headings, one paragraph a page, read silently or aloud. One <b>fluency page</b> is read into the microphone to measure accuracy and words per minute. Questions include main idea, inference, theme, vocabulary and <b>"Which sentence from the book shows that?"</b> evidence questions, with a <b>🔎 Look back</b> button.</li></ul>
    <p><b>Levels:</b> a book is "just right" when about 80% of the questions are right on the first try and about 95% (Grade 2) or 90% (Grades 3–5) of the words are read correctly. Then the next level opens. After two hard books in a row, an easier book is suggested. Children can always choose any book and re-read. Grown-ups → <b>📖 Pip's Stories: reading level</b> shows the level, the last books, scores and reading speed.</p>`],
  ["Pip's sight-word books (Kindergarten–Grade 1)", `
    <p><b>📖 Pip's Stories</b> (home screen) is a series of short books, <i>Pip's Adventures</i>, with simple animations. Each book adds 2–4 new sight words.</p>
    <ol><li><b>Warm-up:</b> tap the new words (and up to 3 of your child's own learning words) to hear them.</li>
    <li><b>Read with Pip:</b> on each page Pip reads first while the words light up, then __KID__ repeats it into the microphone. Words turn green when read. Any word can be tapped to hear it. After 3 tries the story always moves on.</li>
    <li><b>After the book:</b> two story questions and a "find the word" game.</li></ol>
    <ul><li>The first finished read of each book wins a trophy (counts toward treats). The next book opens at about 85% of the words right on the first try, or after two reads.</li>
    <li><b>⭐ Read by myself</b> (after the first read): your child reads first and can tap <b>Help me</b>.</li>
    <li>Stories never unlock play time. Like challenges, they rest at bedtime unless "Allow challenges during rest time" is on.</li></ul>`],
  ['What each grade practises', `
    <ul><li><b>Kindergarten:</b> counting to 20, more and fewer, teen numbers, adding and taking away within 5, making 10, flat and solid shapes; letter sounds, rhymes, syllables, first sight words; science, social studies, arts and health questions for K.</li>
    <li><b>Grade 1:</b> adding and subtracting within 20, place value, time, shapes; phonics (short vowels, digraphs, magic e), sight words, story questions, building sentences.</li>
    <li><b>Grade 2:</b> within 100 and 1,000, even and odd, coins, arrays, skip-counting, measuring; prefixes and suffixes, synonyms and antonyms, irregular verbs and plurals, homophones, reading passages, punctuation.</li>
    <li><b>Grade 3:</b> multiplication and division facts, rounding, fractions on bars and number lines, area and perimeter, time to the minute, two-step word problems; context clues, figurative language, verb tenses, subject–verb agreement.</li>
    <li><b>Grade 4:</b> place value to a million, multi-digit multiplication, division with remainders, factors and primes, equivalent fractions, decimals, angles, unit conversions; Greek and Latin roots, progressive tenses, fragments and run-ons.</li>
    <li><b>Grade 5:</b> decimal operations, powers of 10, adding fractions with different denominators, multiplying fractions, 2-digit division, volume, the coordinate plane, order of operations; perfect tenses and longer reading passages.</li></ul>
    <p>Science, social studies, arts and health questions follow the California standards for each grade. <b>🏆 Challenges</b> only show the challenges that fit the grade. Change the grade any time in <b>👧 Child, grade and sight words</b>.</p>`],
  ['Sight words and levels', `
    <p><b>Sight words</b> come from the public-domain <b>Dolch lists</b> for the grade you chose: Kindergarten starts with pre-primer words, Grade 1 with pre-primer and primer words, Grade 2 with first-grade words. If your child's teacher sends home a class word list, paste it in <b>👧 Child, grade and sight words</b>: those words come first.</p>
    <p>Every sight word is tracked: <i>new → learning → known</i>. A word is <b>known</b> after it is read without help on 3 different days, then it comes back for review after 1, 3, 7, 14 and 30 days.</p>
    <p><b>Levels:</b> each skill has level 1–3. New skills start at level 1 (Kindergarten, Grade 1) or level 2 (Grade 2). A skill moves up after <b>85%</b> or more right on the first try over the last 8–10 answers, and back down below <b>60%</b>. Kindergarten leaves out clearly Grade 1 skills (adding within 20, fact families, magic e…).</p>`],
  ['🌙 Bedtime story', `
    <p>One calm, read-to-me story each night to build a bedtime routine. The <b>🌙 Bedtime story</b> button shows on home only during <b>story time</b> (set in setup; it works even during rest time).</p>
    <ul><li>Pip reads it aloud with the words lighting up, on a dark starry screen; the screen dims while it plays. Some stories use your child's name.</li>
    <li>One new story per night (14 stories in rotation). <b>Hear it again</b> is allowed but counts once. Its own <b>🌙 nights in a row</b> streak. It never unlocks play time.</li>
    <li>Change story time or turn it off in the <b>🌙 Bedtime story</b> card.</li></ul>`],
  ['📚 I read a book (real books)', `
    <p>A timer for a real paper book. The setup wizard picks the minutes for the grade: 10 (Kindergarten), 15 (Grades 1–2), 20 (Grade 3), 25 (Grade 4) or 30 (Grade 5). Change it any time in Rules.</p>
    <ol><li><b>Which book?</b> Tap a recent book, a book from your <b>home library</b>, or <b>＋ A new book</b> and type the title.</li>
    <li>When time is up, check the title and confirm with the PIN.</li></ol>
    <p><b>Finished the whole book before the timer?</b> Tap <b>✅ I finished my book</b>. A grown-up enters the PIN, the minutes actually read are filled in (you can change them), and <b>Done</b> gives the full reward without a second PIN.</p>
    <p><b>Read a book without the timer?</b> On the start screen tap <b>📝 Already read one? Log it</b>, enter the PIN, then type the title and minutes.</p>
    <p>It earns 3 stars and 15 minutes of play (unless the day's play is used up or it is rest time). If nobody checked when the time was up, the timer waits at 0:00: tap <b>Which book was it?</b> or <b>✖ Start over</b>.</p>`],
  ['🏠 Home library (your paper books)', `
    <p>Your own paper books can live in the app as shelves (titles only, never the books' text). A new family starts with one <b>sample shelf of classic folk tales</b> that any library has.</p>
    <ol><li>Grown-ups → <b>🏠 Home library</b> → <b>＋ Add a book</b>: title, author, a shelf name (for example a series), and whether you read it together.</li>
    <li>In <b>📚 I read a book</b>, the next book from each shelf is shown first.</li>
    <li><b>Talk about it:</b> after reading, Pip asks 3 short questions aloud that fit the grade (Kindergarten–Grade 2: who, where, the problem, the ending; Grades 3–5: how a character changed, the lesson, which part proves it, who tells the story); a grown-up taps <b>👍 Got it</b> or <b>🤔 Needed help</b>. There is no pass or fail. Add your own question to any book with ✎.</li></ol>
    <p>Each book moves through <b>To read → 🤝 Read together → ⭐ Read on their own → 🏅 Mastered</b>.</p>`],
  ['Feelings check-in and __MASCOT__', `
    <p>Once a day the app asks "How are you feeling today?" (happy, calm, tired, sad, mad, worried). It can be skipped. Sad, mad or worried gets a kind reply and buttons to call the Help grown-up or start a study call. It never blocks learning.</p>
    <p><b>__MASCOT__</b> the owl grows with learning days: egg, hatchling, chick, baby owl, reading owl, graduate owl, star owl and royal owl. It only grows; it never gets sad or shrinks. Rename it in the 📚 Reading card.</p>`],
  ['Challenges, trophies and treats', `
    <p>Challenges are 10-question rounds that win trophies; they never unlock play time. A trophy needs 8 of 10 right on the first try (9 of 10 from level 4).</p>
    <ul><li>Every 10 trophies earns a treat you choose (set it in <b>Trophies and treats</b>, then mark it given there).</li>
    <li><b>Car mode</b> reads every question aloud and repeats it.</li></ul>`],
  ['Study calls with helpers', `
    <p>Add up to 3 helpers (a parent at work, a grandparent, an aunt abroad) with their <b>WhatsApp number including the country code</b>, in setup or in Grown-ups → 📞 Study call. A Google Meet link you reuse is optional.</p>
    <ol><li>__KID__ taps <b>📞 Study call</b>, then a helper's WhatsApp button (or Join our Google Meet), then the 🎥 video button.</li>
    <li>Share the screen. Tablet: Share screen → <b>Entire screen</b> → Start now. iPad: Share screen → Start Broadcast.</li>
    <li>Press Home to come back; the call keeps going.</li></ol>
    <ul><li>Calls are never cut off by the lock. The study call closes itself 2 minutes after the call ends. Games stay locked.</li>
    <li>On the child's WhatsApp: Privacy → Calls → <b>Silence unknown callers</b>, and keep only family in the contacts.</li></ul>`],
  ['Your Google Sheet: phone dashboard and weekly email (optional)', `
    <p>Without a Sheet, everything works on the one device. With your own copy of the <b>Learning Gate Sheet</b> ("family kit") you also get:</p>
    <ul><li><b>One progress on every device</b> (tablet and iPad share stars, trophies, levels, words, books and settings).</li>
    <li>A <b>dashboard on your phone</b> with remote control: +15/+30 minutes of play, minutes to earn, lock now, and quick messages (each asks your PIN).</li>
    <li>A <b>weekly email</b> on Sunday afternoon to you (and anyone you add to REPORT_TO in the script).</li></ul>
    <p><b>How:</b> follow <b>FAMILY_SETUP.md</b> (about 10 minutes): make a copy of the Sheet in your Google account, paste the script, set your own long SECRET, deploy it as a web app, then paste the web app URL and SECRET in <b>📡 Progress sync</b> on each device. On your phone choose <b>Parent's phone</b>.</p>
    <p>The data stays in your Google Drive. Keep the Sheet's sharing <b>Restricted</b>, and don't rename its tabs.</p>`],
  ['Safety and privacy', `
    <ul><li>No ads, no tracking, no outside analytics, no account with us. Without a Sheet, nothing leaves the device.</li>
    <li>With a Sheet, progress goes only to <b>your own</b> Google account. The Sheet answers only devices that know your SECRET, and refuses everyone until you change the sample SECRET. Remote commands also need your PIN, with a lockout after 5 wrong tries. At most 8 devices can connect.</li>
    <li>The weekly email only goes out on Sunday afternoon (once), and the test email only from the Apps Script editor, so nobody else can use your Sheet to send email.</li>
    <li>The app only runs its own code (a content security policy blocks anything injected), and settings shared between devices are checked before use.</li>
    <li>The PIN is stored scrambled, with a lockout after 5 wrong tries.</li>
    <li>USB debugging lets anyone with a cable read the tablet's app data: keep it off except while installing updates.</li>
    <li>If a device is lost: make a new dashboard link, change the SECRET in your script, deploy a new version, and enter the new SECRET on your other devices.</li></ul>`],
  ['Troubleshooting', `
    <ul><li><b>Can't open Grown-ups:</b> hold ⚙ (top-right of home) for about 1 second.</li>
    <li><b>Forgot the PIN:</b> the PIN can't be recovered. Remove and reinstall the app (progress on this device is lost unless it was shared to your Sheet).</li>
    <li><b>Progress sync says it couldn't send:</b> check the internet, that the URL ends in <b>/exec</b>, and that the SECRET is exactly the one in your script.</li>
    <li><b>Dashboard shows no devices:</b> finish one learning session on a device with sync on.</li>
    <li><b>Read-aloud or stories never hear your child:</b> allow the microphone in Tablet setup (iPad: Settings → Learning Gate → Microphone and Speech Recognition).</li>
    <li><b>No 🌙 button:</b> it only shows during story time, and can be switched off in the 🌙 Bedtime story card.</li>
    <li><b>You need the device yourself:</b> Right now → Parent mode.</li></ul>`]
];

addScreen('guide', `<header class="playhead"><button class="small-btn" id="gdBack">⬅ Back to Grown-ups</button><span class="muted">Learning Gate ${APP_VERSION}</span></header>
  <div class="guidewrap"><h1>📖 Learning Gate user guide</h1><p class="muted">Tap a topic to open it.</p><div id="gdBody"></div>
  <div class="card aboutcard"><h3>ℹ️ About</h3><p>Learning Gate ${APP_VERSION} (${APP_DATE})<br>Made by ${APP_DEVELOPER}.</p></div></div>`);
function renderGuide() {
  const mm = esc(MASCOT()), kid = KID(), fill = t => t.replace(/__MASCOT__/g, mm).replace(/__KID__/g, kid);
  $('#gdBody').innerHTML = GUIDE.map((g, i) => `<details class="gd" ${i === 0 ? 'open' : ''}><summary>${esc(fill(g[0]))}</summary><div class="gdtext">${fill(g[1])}</div></details>`).join('');
  $('#gdBack').onclick = () => renderParent(false);
  show('guide'); $('#guide').scrollTop = 0;
}

const _renderParentGd = renderParent;
renderParent = function () {
  const r = _renderParentGd.apply(this, arguments);
  const body = $('#parentBody');
  if (body && !$('#gdCard')) {
    body.insertAdjacentHTML('afterbegin', `<div class="card" id="gdCard"><div class="row" style="justify-content:space-between;align-items:center"><span><b>📖 New here?</b> Everything the app does, step by step.</span><button class="small-btn ok" id="gdOpen">📖 User guide</button></div></div>`);
    body.insertAdjacentHTML('beforeend', `<div class="card aboutcard" id="aboutCard"><h3>ℹ️ About</h3><p>Learning Gate ${APP_VERSION} (${APP_DATE})<br>Made by ${APP_DEVELOPER}.</p><button class="small-btn" id="gdOpen2">📖 User guide</button></div>`);
    const go = () => { if (saveParent()) renderGuide(); };
    $('#gdOpen').onclick = go; $('#gdOpen2').onclick = go;
  }
  return r;
};
