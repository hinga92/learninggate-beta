/* Progress sync to the family's OWN Google Sheet ("family kit", see FAMILY_SETUP.md) + a parent dashboard on a parent's phone. */
'use strict';

// Optional build-time default (secrets.js, never in git). Normally empty: each family pastes their own
// web app URL and secret in Grown-ups → Progress sync.
const FAMILY_SYNC_URL = (window.LG_SECRETS || {}).syncUrl || '';
const FAMILY_SYNC_KEY = (window.LG_SECRETS || {}).syncKey || '';
Object.assign(DEFAULT_SETTINGS, {syncUrl: FAMILY_SYNC_URL, syncKey: FAMILY_SYNC_KEY, deviceName: '', deviceRole: 'child'});
for (const k of ['syncUrl', 'syncKey', 'deviceName', 'deviceRole']) if (!S[k]) S[k] = DEFAULT_SETTINGS[k];
P.syncedT = P.syncedT || 0;
let syncStatus = '';

function defaultDeviceName() {
  const st = Bridge.state(); return st.ios ? (/iPhone/.test(navigator.userAgent) ? 'iPhone' : 'iPad') : (Bridge.native ? 'Android tablet' : 'Browser');
}
function syncReady() { return /^https:\/\/script\.google(usercontent)?\.com\//.test(S.syncUrl || '') && (S.syncKey || '').length >= 6; }

function sessionSummary(s) {
  const by = {};
  (s.skills || []).forEach(r => { const lab = (SKILLS[r.skill] || {label: r.skill}).label.split(' (')[0]; by[lab] = by[lab] || [0, 0]; by[lab][1]++; if (r.first) by[lab][0]++; });
  return Object.entries(by).map(([k, v]) => `${k} ${v[0]}/${v[1]}`).join(', ');
}

function trySync() {
  if (S.deviceRole !== 'child' || !syncReady()) return Promise.resolve(false);
  const me = S.deviceName || defaultDeviceName();
  const fresh = P.sessions.filter(s => s.t > P.syncedT && (!s.dev || s.dev === me));   // sessions copied from her other device are reported by that device
  const events = fresh.map(s => ({t: s.t, type: s.challenge ? 'challenge' : 'daily', challenge: s.challenge ? ((typeof CHALLENGES !== 'undefined' && CHALLENGES.find(c => c.id === s.challenge)) || {name: s.challenge}).name : '',
    level: s.level || '', ok: s.ok, n: s.n, mins: s.mins || 0, pass: s.challenge ? !!s.pass : undefined, skills: sessionSummary(s)}));
  const extra = (P.events || []).filter(e => e.t > P.syncedT).map(e => e.type === 'book'
    ? {t: e.t, type: 'book', challenge: e.title || 'A book', level: '', ok: 0, n: 0, mins: e.earned || 0, skills: `Read a book for ${e.mins} min` + (e.author ? ` · by ${e.author}` : "")}
    : e.type === 'bedtime' ? {t: e.t, type: 'bedtime', challenge: e.title || 'Bedtime story', level: '', ok: 0, n: 0, mins: 0, skills: `Bedtime story (${e.mins} min) · ${e.streak || 1} nights in a row`}
    : {t: e.t, type: 'mood', challenge: e.mood, level: '', ok: 0, n: 0, mins: 0, skills: ''});
  events.push(...extra); events.sort((a, b) => a.t - b.t);
  const skills = {};
  Object.keys(SKILLS).forEach(id => { const x = P.skills[id]; if (x && x.seen) skills[id] = [x.seen, x.correct, x.box, x.lvl || 0]; });
  const body = {key: S.syncKey, device: S.deviceName || defaultDeviceName(), child: S.childName, events,
    trophies: typeof trophyCount === 'function' ? trophyCount() : 0, stars: P.stars,
    treatsWaiting: typeof treatsWaiting === 'function' ? treatsWaiting() : 0, treatText: S.treatText || '', skills, playToday: minutesToday(),
    mascot: typeof mascotStage === 'function' ? mascotStage().s.name : '', days: typeof learningDays === 'function' ? learningDays() : 0,
    moodToday: ((P.moods || []).filter(m => m.date === todayKey()).slice(-1)[0] || {}).mood || '', readWeek: typeof bookWeek === 'function' ? bookWeek().mins : 0};
  if (typeof progressExtras === 'function') try { Object.assign(body, progressExtras()); } catch (e) {}
  if (typeof bedtimeExtras === 'function') try { Object.assign(body, bedtimeExtras()); } catch (e) {}
  if (typeof libraryExtras === 'function') try { Object.assign(body, libraryExtras()); } catch (e) {}   // sight words, story books, level changes
  return fetch(S.syncUrl, {method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify(body)})
    .then(() => { if (events.length) P.syncedT = Math.max(...events.map(s => s.t)); P.lastSync = Date.now(); saveAll(); syncStatus = 'ok'; return true; })
    .catch(() => { syncStatus = 'offline'; return false; });   // try again next time (e.g. after a car ride with no signal)
}

// send after every daily session or challenge
const _finishSession = finishSession; finishSession = function () { const r = _finishSession.apply(this, arguments); setTimeout(trySync, 500); return r; };
const _finishChallenge = finishChallenge; finishChallenge = function () { const r = _finishChallenge.apply(this, arguments); setTimeout(trySync, 500); return r; };
setInterval(trySync, 10 * 60 * 1000);

// ---------- parent's phone: dashboard ----------
const _renderHome = renderHome;
renderHome = function () { if (S.deviceRole === 'parent' && S.pin) return renderParentView(); return _renderHome.apply(this, arguments); };

function ago(t) { const m = Math.round((Date.now() - t) / 60000); if (m < 2) return 'just now'; if (m < 60) return m + ' min ago'; const h = Math.round(m / 60); if (h < 24) return h + ' h ago'; return Math.round(h / 24) + ' days ago'; }

function renderParentView() {
  show('pview');
  if (!syncReady()) { $('#pvBody').innerHTML = `<div class="card"><h3>Connect your Google Sheet first</h3><p>Hold ⚙ → enter your PIN → <b>📡 Progress sync</b>, then paste the web app URL and secret (the same ones as on your child's tablet). Step-by-step help: FAMILY_SETUP.md.</p></div>`; return; }
  $('#pvBody').innerHTML = '<p class="muted" style="text-align:center">Loading progress…</p>';
  fetch(S.syncUrl + (S.syncUrl.includes('?') ? '&' : '?') + 'key=' + encodeURIComponent(S.syncKey))
    .then(r => r.json()).then(d => {
      if (!d.ok) throw new Error(d.error || 'error');
      const rows = (d.rows || []).map(r => ({t: +new Date(r[0]) || 0, device: r[1], child: r[2], type: r[3], ch: r[4], level: r[5], ok: +r[6], n: +r[7], mins: +r[8], pass: r[9], skills: r[12]}));
      const snaps = (d.snaps || []).sort((a, b) => b.t - a.t);
      const allRows = rows; const learnRows = rows.filter(r => r.type === 'daily' || r.type === 'challenge');
      // device cards
      const cards = snaps.map(s => {
        const sk = Object.entries(s.skills || {}).filter(([, v]) => v[0] >= 3).map(([id, v]) => ({id, acc: v[1] / v[0], box: v[2]}));
        const weak = sk.filter(x => x.acc < 0.8).sort((a, b) => a.acc - b.acc).slice(0, 4).map(x => `${(SKILLS[x.id] || {label: x.id}).label.split(' (')[0]} (${Math.round(100 * x.acc)}%)`);
        const strong = sk.filter(x => x.box >= 4).slice(0, 4).map(x => (SKILLS[x.id] || {label: x.id}).label.split(' (')[0]);
        return `<div class="card"><h3>${esc(s.device)} <span class="muted" style="font-size:14px">· updated ${ago(s.t)}</span></h3>
          <div class="pvstats"><div><b>${+s.trophies || 0}</b><span>🏆 trophies</span></div><div><b>${+s.stars || 0}</b><span>⭐ stars</span></div><div><b>${+s.playToday || 0}</b><span>min play today</span></div><div><b>${+s.treatsWaiting || 0}</b><span>🎁 treats waiting</span></div></div>
          ${s.mascot ? `<p>🦉 Owl: ${esc(s.mascot)} (${+s.days || 0} learning days)${s.moodToday ? ' · Feeling today: ' + (typeof moodEmoji === 'function' ? moodEmoji(s.moodToday) : '') + ' ' + esc(s.moodToday) : ''} · 📚 ${+s.readWeek || 0} min of book reading this week</p>` : ''}${weak.length ? `<p><b>Needs practice:</b> ${esc(weak.join(', '))}</p>` : ''}${strong.length ? `<p><b>Strong:</b> ${esc(strong.join(', '))}</p>` : ''}</div>`;
      }).join('');
      // last 7 days
      const days = {};
      learnRows.forEach(r => { if (Date.now() - r.t > 7 * 864e5) return; const k = new Date(r.t).toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'});
        const e = days[k] = days[k] || {s: 0, ok: 0, n: 0, ch: 0, tr: 0, mins: 0, t: r.t}; e.s++; e.ok += r.ok; e.n += r.n; e.mins += r.mins; if (r.type === 'challenge') { e.ch++; if (r.pass === 'yes') e.tr++; } });
      const week = Object.entries(days).sort((a, b) => b[1].t - a[1].t).map(([k, e]) => `<tr><td>${k}</td><td>${e.s}</td><td>${e.n ? Math.round(100 * e.ok / e.n) : 0}%</td><td>${e.tr}</td><td>${+e.mins || 0} min</td></tr>`).join('');
      const recent = allRows.slice(-12).reverse().map(r => r.type === 'book' ? `<tr><td>${new Date(r.t).toLocaleString([], {weekday: 'short', hour: 'numeric', minute: '2-digit'})}</td><td>${esc(r.device)}</td><td>📚 ${esc(r.ch)}</td><td>–</td><td class="muted">${esc(r.skills || '')}</td></tr>` : r.type === 'mood' ? `<tr><td>${new Date(r.t).toLocaleString([], {weekday: 'short', hour: 'numeric', minute: '2-digit'})}</td><td>${esc(r.device)}</td><td>${typeof moodEmoji === 'function' ? moodEmoji(r.ch) : ''} Feeling ${esc(r.ch)}</td><td>–</td><td></td></tr>` : `<tr><td>${new Date(r.t).toLocaleString([], {weekday: 'short', hour: 'numeric', minute: '2-digit'})}</td><td>${esc(r.device)}</td><td>${r.type === 'challenge' ? esc(r.ch) + ' L' + (+r.level || '') + (r.pass === 'yes' ? ' 🏆' : '') : 'Daily questions'}</td><td>${r.ok}/${r.n}</td><td class="muted">${esc(r.skills || '')}</td></tr>`).join('');
      $('#pvBody').innerHTML = '<div id="remoteCard"></div>' + (cards || '<div class="card"><p>No updates yet. They appear after a session is finished on a device that has sync turned on.</p></div>') +
        `<div class="card"><h3>Last 7 days</h3>${week ? `<table><tr><th>Day</th><th>Sessions</th><th>First-try right</th><th>Trophies</th><th>Play earned</th></tr>${week}</table>` : '<p class="muted">Nothing in the last 7 days.</p>'}</div>` +
        `<div class="card"><h3>Recent activity</h3>${recent ? `<table class="pvrecent"><tr><th>When</th><th>Device</th><th>What</th><th>Score</th><th>Skills</th></tr>${recent}</table>` : '<p class="muted">No sessions yet.</p>'}</div>`;
      if (typeof renderRemote === 'function') renderRemote(d, snaps);
    }).catch(err => { $('#pvBody').innerHTML = `<div class="card"><h3>Couldn't load progress</h3><p>Check the internet connection, and that the URL and secret match the ones in your Google Sheet script. (${esc(String(err.message || err))})</p></div>`; });
}

function syncCard(st) {
  return `<div class="card"><h3>📡 Progress sync (your Google Sheet)</h3>
    <label>This device is <select id="sRole"><option value="child" ${S.deviceRole !== 'parent' ? 'selected' : ''}>${esc(kidName())}'s device (sends progress)</option><option value="parent" ${S.deviceRole === 'parent' ? 'selected' : ''}>Parent's phone (shows progress)</option></select></label>
    <label>Device name <input id="sDev" value="${esc(S.deviceName || defaultDeviceName())}"></label>
    <label>Web app URL <input id="sUrl" value="${esc(S.syncUrl)}" placeholder="https://script.google.com/macros/s/…/exec" style="max-width:420px"></label>
    <label>Secret <input id="sKey" value="${esc(S.syncKey)}" placeholder="same as in the script"></label>
    <p class="muted">${syncReady() ? (S.deviceRole === 'parent' ? 'Ready: the home screen shows the dashboard.' : (P.lastSync ? 'Last sent ' + ago(P.lastSync) + '.' : 'Not sent yet.') + (syncStatus === 'offline' ? ' Offline right now; it will retry.' : '')) : 'Not connected. Optional: see FAMILY_SETUP.md (make your own copy of the Sheet, about 10 minutes). Without it, everything works on this device only.'}</p>
    <div class="row"><button class="small-btn" id="sTest">Save and send now</button>${S.deviceRole === 'parent' ? '<button class="small-btn" id="sView">Open dashboard</button>' : ''}</div></div>`;
}
function saveSyncSettings() {
  if (!$('#sUrl')) return;
  S.deviceRole = $('#sRole').value; S.deviceName = $('#sDev').value.trim(); S.syncUrl = $('#sUrl').value.trim(); S.syncKey = $('#sKey').value.trim();
}

window.addEventListener('DOMContentLoaded', () => {
  $('#pvRefresh').onclick = () => renderParentView();
  $('#pvGear').onclick = () => openParent(false);
  setTimeout(trySync, 3000);
});
