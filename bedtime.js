/* Bedtime story: one calm, read-to-me story each night to build a bedtime routine.
   Pip narrates (words light up), dark night theme, screen dimmed while it plays.
   Open from 45 min before bedtime until 60 min after it starts. Its own 🌙 streak (nights in a row).
   Not a learning activity: no stars for speed, no quiz, no play time. */
'use strict';

// [text, scene] per page. {child} is replaced with the child's name from setup. scene: [emoji, animation, left %, size]. Calm animations only: float twinkle sway glow drift.
const BEDTIME_STORIES = [
  {id: 'b01', title: 'Pip Says Good Night', cover: '🐥', pages: [
    ['The sun went down behind the hill, and the sky turned soft and pink.', [['🌇', 'glow', 50, 110]]],
    ['Pip yawned a big yawn. "It is time for bed," said Mom.', [['🐥', 'sway', 40, 90], ['🐔', 'float', 65, 100]]],
    ['Pip said good night to the tree, and good night to the little brown log.', [['🌳', 'sway', 30, 110], ['🪵', '', 65, 70]]],
    ['She said good night to the moon, and the moon smiled back.', [['🌙', 'glow', 55, 110], ['⭐', 'twinkle', 25, 40], ['⭐', 'twinkle', 80, 34]]],
    ['Then Pip snuggled under Mom\'s warm wing and closed her eyes. Good night, Pip.', [['🐔', 'float', 50, 120], ['💤', 'drift', 68, 50]]]]},
  {id: 'b02', title: 'The Sleepy Star', cover: '⭐', pages: [
    ['High up in the sky lived a little star who loved to shine.', [['⭐', 'twinkle', 50, 90]]],
    ['Every night she twinkled for the children who were going to sleep.', [['⭐', 'twinkle', 30, 60], ['🏠', '', 65, 90]]],
    ['One night the little star felt sleepy too. Her light grew soft and slow.', [['⭐', 'glow', 50, 70], ['🌙', 'float', 78, 70]]],
    ['The moon hummed a gentle song: "Rest now, little star. I will watch the sky."', [['🌙', 'glow', 55, 110], ['🎶', 'drift', 30, 50]]],
    ['So the little star rested, and all the children dreamed of twinkling lights.', [['✨', 'twinkle', 25, 50], ['✨', 'twinkle', 50, 40], ['✨', 'twinkle', 75, 50]]]]},
  {id: 'b03', title: 'Bear\'s Bedtime Bath', cover: '🐻', pages: [
    ['Little Bear played in the mud all day long. Splish, splash, splosh!', [['🐻', 'sway', 45, 110]]],
    ['"Bath time," said Papa Bear, and he filled the tub with warm bubbles.', [['🛁', '', 50, 120], ['🫧', 'drift', 35, 40], ['🫧', 'drift', 65, 34]]],
    ['Little Bear scrubbed his paws, his ears, and the tip of his nose.', [['🐻', 'float', 50, 100], ['🫧', 'drift', 70, 40]]],
    ['Then he put on soft pajamas and brushed his teeth, one, two, three.', [['🪥', 'sway', 40, 80], ['🦷', '', 62, 60]]],
    ['Clean and cozy, Little Bear climbed into bed. Sweet dreams, Little Bear.', [['🛏️', '', 50, 120], ['💤', 'drift', 70, 50]]]]},
  {id: 'b04', title: 'The Moon\'s Boat', cover: '🌙', pages: [
    ['Tonight the moon looked just like a little silver boat.', [['🌙', 'float', 50, 120]]],
    ['Pip imagined climbing aboard with her blanket and her pillow.', [['🐥', 'float', 40, 80], ['🌙', 'float', 62, 110]]],
    ['The moon boat sailed past fluffy clouds and sleepy stars.', [['☁️', 'drift', 25, 80], ['⭐', 'twinkle', 70, 40], ['🌙', 'float', 50, 90]]],
    ['Down below, the whole town was quiet. Every window was dark.', [['🏘️', '', 50, 120], ['⭐', 'twinkle', 20, 30]]],
    ['The boat rocked gently, back and forth, until Pip was fast asleep.', [['🌙', 'sway', 50, 110], ['💤', 'drift', 68, 46]]]]},
  {id: 'b05', title: 'Ten Quiet Sheep', cover: '🐑', pages: [
    ['When Pip cannot sleep, she counts the sheep in the meadow.', [['🐑', 'float', 50, 100]]],
    ['One sheep, two sheep, three sheep hop softly over the fence.', [['🐑', 'float', 25, 70], ['🐑', 'float', 50, 70], ['🐑', 'float', 75, 70]]],
    ['Four, five, six. The sheep are yawning now.', [['🐑', 'sway', 30, 70], ['🐑', 'sway', 55, 70], ['🥱', 'glow', 78, 50]]],
    ['Seven, eight, nine. They lie down in the soft green grass.', [['🌾', 'sway', 30, 80], ['🐑', '', 55, 70], ['🌾', 'sway', 78, 70]]],
    ['Ten quiet sheep, all fast asleep. And Pip is sleepy too.', [['🐑', '', 50, 90], ['💤', 'drift', 70, 50]]]]},
  {id: 'b06', title: 'Owl\'s Night Watch', cover: '🦉', pages: [
    ['When the forest goes to sleep, Owl opens her big round eyes.', [['🦉', 'glow', 50, 110], ['🌲', 'sway', 20, 90]]],
    ['"Hoo, hoo," she calls softly. "I will keep watch tonight."', [['🦉', 'sway', 50, 100], ['🌙', 'float', 80, 60]]],
    ['She sees the fox curled in his den and the rabbit tucked in her hole.', [['🦊', '', 30, 80], ['🐇', '', 68, 70]]],
    ['Everyone is safe. Everyone is cozy. The forest is calm and still.', [['🌲', 'sway', 25, 100], ['🌲', 'sway', 75, 100], ['⭐', 'twinkle', 50, 34]]],
    ['When the sun comes up, Owl will sleep. But now it is your turn. Good night.', [['🦉', 'float', 50, 100], ['💤', 'drift', 68, 46]]]]},
  {id: 'b07', title: 'The Blanket Fort', cover: '⛺', pages: [
    ['{child} and Pip built a fort with blankets and pillows.', [['⛺', '', 50, 120], ['🐥', 'float', 72, 60]]],
    ['Inside, it was warm and dim, like a little cave.', [['⛺', 'glow', 50, 120]]],
    ['They whispered stories and listened to the rain outside.', [['🌧️', 'float', 30, 80], ['⛺', '', 65, 100]]],
    ['Their flashlight made a tiny moon on the blanket ceiling.', [['🔦', 'sway', 35, 70], ['🌕', 'glow', 65, 60]]],
    ['Soon the whispers got softer and softer, until there were none at all.', [['💤', 'drift', 50, 60], ['⭐', 'twinkle', 25, 30], ['⭐', 'twinkle', 75, 30]]]]},
  {id: 'b08', title: 'The Firefly Lanterns', cover: '✨', pages: [
    ['On summer nights, the fireflies come out to play.', [['✨', 'twinkle', 30, 40], ['✨', 'twinkle', 55, 34], ['✨', 'twinkle', 78, 40]]],
    ['They blink their tiny lanterns: on, off, on, off.', [['✨', 'twinkle', 40, 50], ['✨', 'twinkle', 62, 44]]],
    ['They light the path for the snail who is going home.', [['🐌', 'drift', 40, 70], ['✨', 'twinkle', 65, 40]]],
    ['They light the pond where the frogs sing their last song.', [['🐸', 'sway', 40, 70], ['🪷', 'float', 65, 60]]],
    ['Then, one by one, the lanterns rest, and the night is soft and dark.', [['✨', 'glow', 50, 34], ['🌙', 'float', 78, 60]]]]},
  {id: 'b09', title: 'Grandma\'s Lullaby', cover: '👵', pages: [
    ['Grandma has a special song she sings at bedtime.', [['👵', 'sway', 50, 110], ['🎶', 'drift', 72, 50]]],
    ['It sounds like the wind in the trees and the waves on the sand.', [['🌴', 'sway', 30, 90], ['🌊', 'float', 68, 80]]],
    ['"Close your eyes, my little one," the song goes. "The night will keep you safe."', [['🎶', 'drift', 40, 50], ['🌙', 'glow', 65, 80]]],
    ['{child} listens and holds a teddy bear tight.', [['🧸', 'float', 50, 100]]],
    ['The song wraps around you like a warm hug. Good night, little one.', [['🤗', 'glow', 50, 90], ['💤', 'drift', 70, 46]]]]},
  {id: 'b10', title: 'Where the Animals Sleep', cover: '🐶', pages: [
    ['The dog sleeps in his basket by the door.', [['🐶', '', 50, 100], ['🧺', '', 50, 60]]],
    ['The bird sleeps in her nest high in the tree.', [['🐦', 'float', 50, 70], ['🪺', '', 50, 60], ['🌳', 'sway', 78, 90]]],
    ['The fish sleeps in the cool, quiet water.', [['🐟', 'drift', 45, 80], ['🌊', 'float', 70, 60]]],
    ['The cat curls up in a sunny spot that is still a little warm.', [['🐈', '', 50, 100]]],
    ['And {child} sleeps in a cozy bed, safe and sound.', [['🛏️', '', 50, 120], ['🌙', 'glow', 80, 60]]]]},
  {id: 'b11', title: 'The Cloud Pillow', cover: '☁️', pages: [
    ['A soft white cloud floated down from the sky.', [['☁️', 'float', 50, 120]]],
    ['"I am the softest pillow in the world," the cloud said.', [['☁️', 'sway', 50, 120], ['🐥', 'float', 72, 50]]],
    ['Pip lay down on the cloud. It felt like a marshmallow.', [['☁️', 'float', 50, 130], ['🐥', 'float', 50, 50]]],
    ['The cloud drifted slowly over the sleeping houses.', [['☁️', 'drift', 50, 110], ['🏘️', '', 50, 70]]],
    ['Pip floated off to dreamland, light as a feather.', [['🪶', 'drift', 40, 60], ['💤', 'drift', 65, 50]]]]},
  {id: 'b12', title: 'Thank You, Day', cover: '🌅', pages: [
    ['Before sleeping, {child} thinks about the day.', [['🌅', 'glow', 50, 110]]],
    ['Thank you for my breakfast and for my friends at school.', [['🥣', '', 35, 70], ['🎒', '', 65, 70]]],
    ['Thank you for the games I played and the things I learned.', [['⚽', 'sway', 35, 60], ['📚', '', 65, 70]]],
    ['Thank you for my family who loves me very much.', [['❤️', 'glow', 50, 90]]],
    ['Good night, day. Tomorrow will be another happy one.', [['🌙', 'glow', 50, 110], ['⭐', 'twinkle', 25, 34]]]]},
  {id: 'b13', title: 'The Turtle Who Took His Time', cover: '🐢', pages: [
    ['Turtle was always the last one home, because he walked slow, slow, slow.', [['🐢', 'drift', 40, 100]]],
    ['On the way he saw the sun set gold and orange.', [['🌇', 'glow', 50, 110], ['🐢', '', 70, 60]]],
    ['He saw the first star blink awake in the sky.', [['⭐', 'twinkle', 50, 60], ['🐢', '', 50, 70]]],
    ['He heard the crickets begin their quiet song.', [['🦗', 'sway', 40, 60], ['🎶', 'drift', 62, 44]]],
    ['When Turtle got home, he was happy. Going slow let him see the whole night. Good night, Turtle.', [['🐢', '', 45, 90], ['🏡', '', 70, 80]]]]},
  {id: 'b14', title: 'Pip\'s Dream Garden', cover: '🌷', pages: [
    ['In her dream, Pip found a garden that only grows at night.', [['🌷', 'sway', 30, 80], ['🌙', 'glow', 70, 70]]],
    ['The flowers glowed like little lamps: blue, pink, and gold.', [['🌸', 'glow', 30, 70], ['🌼', 'glow', 50, 70], ['💠', 'glow', 70, 60]]],
    ['A friendly snail showed her the path between the flowers.', [['🐌', 'drift', 40, 70], ['🌷', 'sway', 65, 70]]],
    ['Pip planted a tiny seed and whispered, "Grow while I sleep."', [['🌱', 'glow', 50, 80], ['🐥', 'float', 70, 50]]],
    ['In the morning, there will be a new flower. But for now, sleep tight.', [['🌺', 'glow', 50, 100], ['💤', 'drift', 70, 46]]]]}
];

// ---------------------------------------------------------------------------
P.bedtime = P.bedtime || {nights: [], streak: 0, best: 0, count: 0};
const BT_BEFORE = 45, BT_AFTER = 60;   // minutes around bedtime when the story is open
const toMin = s => { const m = /^(\d{1,2}):(\d{2})$/.exec(s || ''); return m ? +m[1] * 60 + +m[2] : null; };
// Story time is its own setting (Grown-ups → 🌙 Bedtime story), so it can come before rest time starts.
// Default 7:30–8:45 pm. If the times are cleared, it falls back to 45 min before → 60 min after rest time.
Object.assign(DEFAULT_SETTINGS, {btFrom: '19:30', btTo: '20:45'});
if (S.btFrom === undefined) S.btFrom = '19:30'; if (S.btTo === undefined) S.btTo = '20:45';
function bedtimeOpen() {
  const d = new Date(), now = d.getHours() * 60 + d.getMinutes();
  const a = toMin(S.btFrom), b = toMin(S.btTo);
  if (a != null && b != null && a !== b) return a < b ? (now >= a && now < b) : (now >= a || now < b);   // also works across midnight
  const st = toMin(S.bedtimeStart || '20:00'); if (st == null) return false;
  const diff = ((now - st) % 1440 + 1440) % 1440;           // minutes since bedtime started (0..1439)
  return diff <= BT_AFTER || diff >= 1440 - BT_BEFORE;
}
function nightKey() { const d = new Date(); if (d.getHours() < 5) d.setDate(d.getDate() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
const readTonight = () => (P.bedtime.nights || []).includes(nightKey());
function btStreak() {   // nights in a row, ending tonight or last night
  const set = new Set(P.bedtime.nights || []); const d = new Date(); if (d.getHours() < 5) d.setDate(d.getDate() - 1);
  const key = x => x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  if (!set.has(key(d))) d.setDate(d.getDate() - 1);
  let n = 0; while (set.has(key(d))) { n++; d.setDate(d.getDate() - 1); } return n;
}
const tonightsStory = () => BEDTIME_STORIES[(P.bedtime.count || 0) % BEDTIME_STORIES.length];

addScreen('bedtime', `<header class="playhead btbar"><button class="small-btn" id="btClose">✖</button><span class="btstreak" id="btStreakTop"></span><span></span></header>
  <div class="btsky" id="btSky"></div><div class="spbody" id="btBody"></div>`);
if (typeof GU_SCREENS !== 'undefined') GU_SCREENS.push('bedtime');

let BT = null, btBright = null;
function btDim(on) {   // dim the screen while the story plays, then put it back
  try { if (on) { if (btBright == null) { const b = Bridge.brightness(null); btBright = b ? b.b : null; } if (btBright != null && btBright > 50) Bridge.brightness(50); }
        else if (btBright != null) { Bridge.brightness(btBright); btBright = null; } } catch (e) {}
}
function btStop() { if (BT) BT.dead = true; BT = null; try { Bridge.stopSpeak(); } catch (e) {} btDim(false); document.body.classList.remove('night'); }

function renderBedtime() {
  btStop(); const story = tonightsStory(), done = readTonight();
  document.body.classList.add('night'); show('bedtime');
  $('#btSky').innerHTML = Array.from({length: 22}, (_, i) => `<i style="left:${(i * 37) % 100}%;top:${(i * 53) % 90}%;animation-delay:${(i % 7) * 0.4}s">✦</i>`).join('');
  $('#btStreakTop').textContent = btStreak() ? `🌙 ${btStreak()} night${btStreak() > 1 ? 's' : ''} in a row` : '';
  $('#btBody').innerHTML = done
    ? `<div class="btcover">🌙</div><h1 class="bth">You had your story tonight</h1><p class="homemsg">Sleep tight, ${esc(kidName())}. See you tomorrow night for the next one!</p>
       <div class="row"><button class="bigbtn2 btbtn" id="btAgain">🔁 Hear it again</button><button class="bigbtn2 ghost" id="btHome">🌙 Good night</button></div>`
    : `<div class="btcover">${story.cover}</div><h1 class="bth">${esc(story.title)}</h1><p class="homemsg">Get cozy in bed. Pip will read you tonight's story.</p>
       <button class="bigbtn btbtn" id="btGo">🌙 Start the story</button>`;
  if ($('#btGo')) $('#btGo').onclick = () => playStory(story, false);
  if ($('#btAgain')) $('#btAgain').onclick = () => playStory(BEDTIME_STORIES[((P.bedtime.count || 1) - 1) % BEDTIME_STORIES.length], true);
  if ($('#btHome')) $('#btHome').onclick = () => { btStop(); renderHome(); };
}
$('#btClose').onclick = () => { btStop(); renderHome(); };

function playStory(story, replay) {
  btDim(true); BT = {story, page: 0, replay, dead: false, start: Date.now()}; btPage();
}
function btPage() {
  const r = BT; if (!r || r.dead) return; const [raw, scene] = r.story.pages[r.page];
  const text = raw.replace(/\{child\}/g, S.childName || 'Little One');
  $('#btBody').innerHTML = `<div class="scene btscene">${scene.map(([e, a, x, s], k) => `<i class="act ${a ? 'b-' + a : ''}" style="left:${x}%;font-size:${s}px;animation-delay:${(k * 0.3).toFixed(1)}s">${e}</i>`).join('')}</div>
    <div class="readtext bttext" id="btText">${text.split(' ').map(w => `<span>${esc(w)}</span>`).join(' ')}</div>
    <div class="row"><button class="small-btn btbtn2" id="btPrev" ${r.page ? '' : 'disabled'}>⏮</button><button class="small-btn btbtn2" id="btPause">⏸</button><button class="small-btn btbtn2" id="btNext">⏭</button></div>
    <div class="dots btdots">${r.story.pages.map((_, k) => `<i class="${k < r.page ? 'done' : k === r.page ? 'cur' : ''}"></i>`).join('')}</div>`;
  const spans = () => [...document.querySelectorAll('#btText span')];
  let paused = false;
  const go = d => { if (BT !== r) return; Bridge.stopSpeak(); clearTimeout(r.timer); r.page += d; if (r.page >= r.story.pages.length) return btEnd(); btPage(); };
  $('#btPrev').onclick = () => go(-1); $('#btNext').onclick = () => go(1);
  $('#btPause').onclick = () => { paused = !paused; $('#btPause').textContent = paused ? '▶' : '⏸'; if (paused) { Bridge.stopSpeak(); clearTimeout(r.timer); } else btPage(); };
  setTimeout(() => { if (BT !== r || r.dead) return;
    speakTracked(text, i => spans().forEach((s, k) => { s.classList.toggle('now', k === i); s.classList.toggle('done', k < i); }),
      () => { if (BT !== r || r.dead || paused) return; spans().forEach(s => s.classList.remove('now')); r.timer = setTimeout(() => { if (!paused) go(1); }, 1800); }); }, 700);
}
function btEnd() {
  const r = BT; if (!r) return;
  if (!r.replay && !readTonight()) {
    const n = nightKey(); P.bedtime.nights = (P.bedtime.nights || []).concat(n).slice(-120); P.bedtime.count = (P.bedtime.count || 0) + 1;
    P.bedtime.streak = btStreak(); P.bedtime.best = Math.max(P.bedtime.best || 0, P.bedtime.streak);
    logEvent({type: 'bedtime', title: r.story.title, mins: Math.max(1, Math.round((Date.now() - r.start) / 60000)), streak: P.bedtime.streak});
    saveAll(); if (typeof shareState === 'function') setTimeout(shareState, 1500); if (typeof trySync === 'function') setTimeout(trySync, 4000);
  }
  const s = btStreak();
  $('#btStreakTop').textContent = s ? `🌙 ${s} night${s > 1 ? 's' : ''} in a row` : '';
  $('#btBody').innerHTML = `<div class="btcover">🌙</div><h1 class="bth">The end. Good night, ${esc(kidName())}.</h1>
    ${s ? `<p class="homemsg">🌙 That's <b>${s}</b> night${s > 1 ? 's' : ''} in a row of bedtime stories!</p><div class="btmoons">${'🌙'.repeat(Math.min(s, 14))}</div>` : ''}
    <button class="bigbtn2 ghost" id="btBye">😴 Good night</button>`;
  Bridge.speak(`The end. Good night, ${kidName()}. Sleep tight.`);
  $('#btBye').onclick = () => { btStop(); renderHome(); };
  BT = null;
}

// Home: the 🌙 button appears only around bedtime
(() => { const prev = renderHome; renderHome = function () { const r = prev.apply(this, arguments); try {
  let b = $('#btBtn'); const row = document.querySelector('#home .homewrap .row');
  if (!b && row) { b = document.createElement('button'); b.id = 'btBtn'; b.className = 'bigbtn2 btbtn'; b.onclick = renderBedtime; row.insertBefore(b, row.firstChild); }
  if (b) { const open = bedtimeOpen() && S.bedtimeStories !== false; b.style.display = open ? '' : 'none';
    b.textContent = readTonight() ? '🌙 Story done tonight' : '🌙 Bedtime story'; }
  } catch (e) { console.error(e); } return r; }; })();
setInterval(() => { if (onScreen() === 'home') { const b = $('#btBtn'); if (b) b.style.display = bedtimeOpen() && S.bedtimeStories !== false ? '' : 'none'; } }, 60000);
(() => { const prev = window.onNativeResume; window.onNativeResume = () => { if (onScreen() === 'bedtime') return; if (prev) prev(); }; })();

// share between devices
if (typeof mergeProgress === 'function') { const prevM = mergeProgress; mergeProgress = function (L, R) { const out = prevM.apply(this, arguments);
  const a = L.bedtime || {}, b = R.bedtime || {}; const nights = [...new Set((a.nights || []).concat(b.nights || []))].sort().slice(-120);
  out.bedtime = {nights, count: Math.max(a.count || 0, b.count || 0), best: Math.max(a.best || 0, b.best || 0), streak: Math.max(a.streak || 0, b.streak || 0)}; return out; }; }

// leaving the bedtime screen any other way (grown-up key, Help…) ends the story and undims
(() => { const prev = show; show = function (id) { if (id !== 'bedtime' && document.body.classList.contains('night')) { if (BT) BT.dead = true; BT = null; btDim(false); document.body.classList.remove('night'); } return prev.apply(this, arguments); }; })();

// grown-ups: on/off switch and the streak
if (S.bedtimeStories === undefined) S.bedtimeStories = true;
(() => { const prevRP = renderParent; renderParent = function () { const r = prevRP.apply(this, arguments);
  try { const body = $('#parentBody'); if (body && !$('#btCard')) body.insertAdjacentHTML('beforeend', `<div class="card" id="btCard"><h3>🌙 Bedtime story</h3>
    <label class="chk"><input id="btOn" type="checkbox" ${S.bedtimeStories !== false ? 'checked' : ''}> Show the bedtime story button</label>
    <div class="row2"><label>Story time from <input id="btFrom" type="time" value="${esc(S.btFrom || '')}"></label><label>until <input id="btTo" type="time" value="${esc(S.btTo || '')}"></label></div>
    <p class="muted">The 🌙 button shows on the home screen only between these times (even during rest time). Set it to end around bedtime.</p>
    <p>Stories heard: <b>${(P.bedtime.nights || []).length}</b> · Nights in a row now: <b>${btStreak()}</b> · Best: <b>${P.bedtime.best || 0}</b></p>
    <p class="muted">One calm read-to-me story per night, ${BEDTIME_STORIES.length} stories in rotation. The screen dims while it plays. It never unlocks play time.</p>
    <div class="row"><button class="small-btn" id="btPreview">▶ Preview tonight's story now</button></div><p class="muted">The preview works at any time and doesn't count as tonight's story.</p></div>`);
    if ($('#btPreview')) $('#btPreview').onclick = () => { if (!saveParent()) return; btStop(); document.body.classList.add('night'); show('bedtime');
      $('#btSky').innerHTML = Array.from({length: 22}, (_, i) => `<i style="left:${(i * 37) % 100}%;top:${(i * 53) % 90}%;animation-delay:${(i % 7) * 0.4}s">✦</i>`).join('');
      $('#btStreakTop').textContent = 'Preview'; playStory(tonightsStory(), true); };
  } catch (e) { console.error(e); }
  return r; }; })();
(() => { const prevSP = saveParent; saveParent = function () {
  if ($('#btOn')) S.bedtimeStories = $('#btOn').checked;
  const f = $('#btFrom'), t = $('#btTo');
  if (f && t) { const ok = v => /^\d{2}:\d{2}$/.test(v); if (ok(f.value) && ok(t.value) && f.value !== t.value) { S.btFrom = f.value; S.btTo = t.value; } else if (!f.value && !t.value) { S.btFrom = ''; S.btTo = ''; } }
  return prevSP.apply(this, arguments); }; })();

// for the family Sheet (dashboard + email)
function bedtimeExtras() { const week = new Set(); const d = new Date(); for (let i = 0; i < 7; i++) { week.add(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')); d.setDate(d.getDate() - 1); }
  return {bedtime: {streak: btStreak(), best: P.bedtime.best || 0, week: (P.bedtime.nights || []).filter(n => week.has(n)).length, total: (P.bedtime.nights || []).length}}; }
