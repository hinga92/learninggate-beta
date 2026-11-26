/**
 * Learning Gate progress sync — runs inside YOUR Google Sheet (Extensions → Apps Script).
 * The tablet / iPad send a short summary after each session (doPost).
 * Your iPhone's parent view reads it back (doGet). Nothing leaves your Google account.
 *
 * 1. Change SECRET below to your own long password (16+ letters and numbers). Until you do, the script refuses every device.
 * 2. Deploy → New deployment → type "Web app" → Execute as: Me → Who has access: Anyone → Deploy.
 * Keep this Sheet private (Share → Restricted). Anyone who has both the URL and the SECRET can read the progress.
 * The SECRET always travels inside the request body, never in a web address. The grown-up PIN never reaches this Sheet:
 * remote commands need the separate dashboard PIN, which is kept hashed in the script's own properties.
 * iPhone dashboard: open the Web app URL in Safari → Share → Add to Home Screen.
 * Weekly email: after deploying, choose setupWeeklyEmail in the toolbar and press ▶ Run once (allow access).
 * 3. Copy the Web app URL. Put the URL and SECRET into Learning Gate → Grown-ups → Progress sync, on every device.
 */
const SECRET = 'CHANGE-ME-to-a-long-secret';
const HEADERS = ['Time', 'Device', 'Child', 'Type', 'Challenge', 'Level', 'Right first try', 'Questions', 'Play minutes earned', 'Trophy?', 'Trophies total', 'Stars total', 'Skills practised'];

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName('Sessions');
  if (!sh) { sh = ss.insertSheet('Sessions'); }
  if (sh.getLastRow() === 0) { sh.appendRow(HEADERS); sh.setFrozenRows(1); }
  return sh;
}

// ---- input safety: never let text from a device become a spreadsheet formula, and cap sizes ----
function txt_(v, max) { v = String(v == null ? '' : v).slice(0, max || 80); return /^[=+\-@\t\r]/.test(v) ? "'" + v : v; }
function num_(v, lo, hi) { v = Number(v); return isFinite(v) ? Math.max(lo, Math.min(hi, v)) : 0; }
// The script stays closed until the family replaces the sample SECRET with their own long one (16+ characters).
function secretSet_() { return SECRET.length >= 16 && !/^CHANGE-ME/i.test(SECRET); }
function same_(a, b) { if (b === SECRET && !secretSet_()) return false; a = String(a || ''); b = String(b || ''); if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }

function doPost(e) {
  let d;
  if (!e || !e.postData || e.postData.contents.length > 1000000) return out_({ok: false, error: 'too big'});
  try { d = JSON.parse(e.postData.contents); } catch (err) { return out_({ok: false, error: 'bad json'}); }
  if (!d || !same_(d.key, SECRET)) return out_({ok: false, error: 'wrong key'});
  if (d.action === 'cmd') {   // a parent device sending a command: needs the dashboard PIN (the app's grown-up PIN never leaves the device)
    const p = pinCheck_(d.pin); if (p !== 'ok') return out_({ok: false, error: p});
    return out_(addCmd_(d)); }
  if (d.action === 'status') return saveStatus_(d);
  if (d.action === 'state') return out_(saveState_(d));
  // Reads: the SECRET comes in the body, so it never ends up in a web address, server log or browser history.
  if (d.action === 'getstate') return out_({ok: true, state: stripPrivate_(loadState_())});   // the child's shared progress (tablet + iPad)
  if (d.action === 'poll') return out_(pollCmds_(d.poll, d.since));            // a child device asking "anything for me?"
  if (d.action === 'dash') return out_(dashRows_());                           // the parent view inside the app
  if (d.action === 'link') { const r = dashSetup(d.key, ''); r.hasPin = !!PropertiesService.getScriptProperties().getProperty('dash_pin'); return out_(r); }
  if (d.action === 'setpin') return out_(dashSetup(d.key, String(d.pin || '')));   // set the dashboard PIN from the app (needs the SECRET)
  if (d.action) return out_({ok: false, error: 'unknown action'});
  const device = String(d.device == null ? '' : d.device).replace(/[^\w \-'’.]/g, '').replace(/^[^\w]+/, '').slice(0, 40) || 'device';
  if (!deviceAllowed_('snap_', device)) return out_({ok: false, error: 'too many devices'});
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const sh = sheet_();
    const props = PropertiesService.getScriptProperties();
    const lastKey = 'last_' + device;
    let lastT = Number(props.getProperty(lastKey) || 0);          // one marker per device (no per-event properties to fill up)
    const evs = (Array.isArray(d.events) ? d.events : []).slice(0, 200)
      .filter(function (ev) { return ev && isFinite(ev.t) && ev.t > lastT && ev.t < Date.now() + 864e5; })
      .sort(function (a, b) { return a.t - b.t; });
    const rows = evs.map(function (ev) {
      return [new Date(ev.t), device, txt_(d.child, 30), ['challenge', 'book', 'mood', 'bedtime'].indexOf(ev.type) >= 0 ? ev.type : 'daily', txt_(ev.challenge, 40), num_(ev.level, 0, 10),
        num_(ev.ok, 0, 50), num_(ev.n, 0, 50), num_(ev.mins, 0, 240), ev.pass === undefined ? '' : (ev.pass ? 'yes' : 'no'),
        num_(d.trophies, 0, 1e5), num_(d.stars, 0, 1e6), txt_(ev.skills, 200)];
    });
    if (rows.length) { sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows); lastT = evs[evs.length - 1].t; props.setProperty(lastKey, String(lastT)); }
    const skills = {}; Object.keys(d.skills || {}).slice(0, 80).forEach(function (k) {
      const v = d.skills[k]; if (/^[a-z_0-9]{1,20}$/.test(k) && Array.isArray(v)) skills[k] = [num_(v[0], 0, 1e5), num_(v[1], 0, 1e5), num_(v[2], 0, 5), num_(v[3], 0, 3)]; });
    props.setProperty('snap_' + device, JSON.stringify({
      t: Date.now(), device: device, child: txt_(d.child, 30), trophies: num_(d.trophies, 0, 1e5), stars: num_(d.stars, 0, 1e6),
      treatsWaiting: num_(d.treatsWaiting, 0, 100), treatText: txt_(d.treatText, 60), skills: skills, playToday: num_(d.playToday, 0, 1440),
      mascot: txt_(d.mascot, 30), days: num_(d.days, 0, 1e4), moodToday: txt_(d.moodToday, 10), readWeek: num_(d.readWeek, 0, 1e4),
      words: words_(d.words), stories: stories_(d.stories), levels: levels_(d.levels),
      library: library_(d.library),
      bedtime: d.bedtime && typeof d.bedtime === 'object' ? {streak: num_(d.bedtime.streak, 0, 1e4), best: num_(d.bedtime.best, 0, 1e4), week: num_(d.bedtime.week, 0, 7), total: num_(d.bedtime.total, 0, 1e5)} : null
    }));
  } finally { lock.releaseLock(); }
  return out_({ok: true});
}

// Sight words, story books and level changes sent by the app (cleaned and kept small).
function list_(a, n, max) { return (Array.isArray(a) ? a : []).slice(0, n).map(function (x) { return txt_(x, max || 20); }).filter(function (x) { return x; }); }
function words_(w) { if (!w || typeof w !== 'object') return null;
  return {known: num_(w.known, 0, 5000), learning: num_(w.learning, 0, 5000), review: num_(w.review, 0, 5000),
    newKnown: list_(w.newKnown, 15), tricky: list_(w.tricky, 8), practising: list_(w.practising, 8)}; }
function stories_(s) { if (!s || typeof s !== 'object') return null;
  return {series: txt_(s.series, 40), next: txt_(s.next, 40), books: (Array.isArray(s.books) ? s.books : []).slice(0, 30).map(function (b) {
    return {t: txt_(b && b.t, 40), s: num_(b && b.s, 0, 3), r: num_(b && b.r, 0, 1000)}; })}; }
function levels_(l) { if (!l || typeof l !== 'object') return null;
  const row = function (x) { return {k: txt_(x && x.k, 40), l: num_(x && x.l, 1, 3), d: num_(x && x.d, -1, 1), a: x && x.a != null ? num_(x.a, 0, 100) : null}; };
  return {changes: (Array.isArray(l.changes) ? l.changes : []).slice(0, 20).map(row), focus: (Array.isArray(l.focus) ? l.focus : []).slice(0, 5).map(row)}; }

function library_(l) { if (!l || typeof l !== 'object') return null;
  return {mastered: num_(l.mastered, 0, 1e4), alone: num_(l.alone, 0, 1e4), together: num_(l.together, 0, 1e4), toread: num_(l.toread, 0, 1e4), total: num_(l.total, 0, 1e4),
    talkOk: num_(l.talkOk, 0, 1e5), talkN: num_(l.talkN, 0, 1e5),
    recent: (Array.isArray(l.recent) ? l.recent : []).slice(0, 6).map(function (x) { return {t: txt_(x && x.t, 60), s: ['toread', 'together', 'alone', 'mastered'].indexOf(x && x.s) >= 0 ? x.s : 'toread'}; })}; }

function doGet(e) {
  // Only the dashboard page is served by GET. A SECRET in the web address is refused: apps send it in the POST body.
  if (e && e.parameter && (e.parameter.key || e.parameter.poll)) return out_({ok: false, error: 'update the app: the secret must not be in the web address'});
  return dashboardPage_(e && e.parameter && e.parameter.t);   // the iPhone dashboard
}
function pollCmds_(poll, since) {
  const dev = cleanDev_(poll); since = Number(since || 0);
  const cmds = cmds_(PropertiesService.getScriptProperties()).filter(function (c) { return c.id > since && (c.target === 'all' || c.target === dev) && c.id > Date.now() - 15 * 60000; });
  return {ok: true, cmds: cmds};
}
function dashRows_() {
  const sh = sheet_();
  const last = sh.getLastRow();
  const n = Math.min(300, Math.max(0, last - 1));
  const rows = n > 0 ? sh.getRange(last - n + 1, 1, n, HEADERS.length).getValues().map(function (r) {
    r[0] = r[0] instanceof Date ? r[0].getTime() : r[0]; return r; }) : [];
  const props = PropertiesService.getScriptProperties().getProperties();
  const snaps = Object.keys(props).filter(function (k) { return k.indexOf('snap_') === 0; })
    .map(function (k) { try { return JSON.parse(props[k]); } catch (err) { return null; } }).filter(Boolean);
  const status = {};
  Object.keys(props).filter(function (k) { return k.indexOf('status_') === 0; }).forEach(function (k) { try { const v = JSON.parse(props[k]); status[v.device] = v; } catch (err) {} });
  return {ok: true, rows: rows, snaps: snaps, status: status, cmds: cmds_(PropertiesService.getScriptProperties())};
}


// At most 8 devices, so a stolen key can't fill the Sheet's storage with fake ones (an existing device always passes).
function deviceAllowed_(prefix, dev) {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty(prefix + dev) != null) return true;
  return Object.keys(props.getProperties()).filter(function (k) { return k.indexOf(prefix) === 0; }).length < 8;
}

// ---------------- Remote control (parent's phone → the child's devices) ----------------
function cleanDev_(v) { return String(v == null ? '' : v).replace(/[^\w \-'’.]/g, '').replace(/^[^\w]+/, '').slice(0, 40) || 'device'; }
function cmds_(props) { try { return JSON.parse(props.getProperty('cmds') || '[]'); } catch (err) { return []; } }
function addCmd_(d) {
  const type = ['unlock', 'lock', 'msg', 'bonus'].indexOf(d.type) >= 0 ? d.type : null;
  if (!type) return {ok: false, error: 'bad command'};
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const props = PropertiesService.getScriptProperties();
    const list = cmds_(props).filter(function (c) { return c.id > Date.now() - 60 * 60000; }).slice(-29);
    const id = Math.max(Date.now(), list.length ? list[list.length - 1].id + 1 : 0);
    const c = {id: id, type: type, target: d.target === 'all' ? 'all' : cleanDev_(d.target)};
    if (type === 'unlock') c.minutes = num_(d.minutes, 5, 60);
    if (type === 'bonus') c.minutes = num_(d.minutes, 5, 120);   // extra play the child can still EARN today
    if (type === 'msg') c.text = String(d.text || '').replace(/[\u0000-\u001f<>]/g, '').slice(0, 100);
    list.push(c); props.setProperty('cmds', JSON.stringify(list));
  } finally { lock.releaseLock(); }
  return {ok: true};
}
function saveStatus_(d) {
  const dev = cleanDev_(d.device);
  if (!deviceAllowed_('status_', dev)) return out_({ok: false, error: 'too many devices'});
  PropertiesService.getScriptProperties().setProperty('status_' + dev, JSON.stringify({device: dev, t: Date.now(), applied: num_(d.applied, 0, 1e15), unlockUntil: num_(d.unlockUntil, 0, 1e15)}));
  return out_({ok: true});
}

// ---------------- Shared progress: one progress for the child on every device ----------------
// Kept in a hidden "State" tab, split across cells (a cell holds at most 50,000 characters).
// Settings that must never be stored in the Sheet (an older app may still send them).
const PRIVATE_SETTINGS = ['pin', 'pinLen', 'pinLock', 'syncUrl', 'syncKey'];
function stripPrivate_(st) {
  if (st && st.settings && typeof st.settings === 'object') PRIVATE_SETTINGS.forEach(function (k) { delete st.settings[k]; });
  return st;
}
function saveState_(d) {
  const s = JSON.stringify(stripPrivate_(d.state || {}));
  if (s.length > 900000) return {ok: false, error: 'too big'};
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName('State');
    if (!sh) { sh = ss.insertSheet('State'); sh.hideSheet(); }
    const parts = [];
    for (let i = 0; i < s.length; i += 40000) parts.push(['~' + s.slice(i, i + 40000)]);
    sh.clearContents();
    sh.getRange(1, 1, parts.length, 1).setNumberFormat('@').setValues(parts);
  } finally { lock.releaseLock(); }
  return {ok: true};
}
function loadState_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('State');
  if (!sh || sh.getLastRow() < 1) return null;
  const s = sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map(function (r) { return String(r[0]).replace(/^~/, ''); }).join('');
  try { return stripPrivate_(JSON.parse(s)); } catch (err) { return null; }
}

// ---------------- Shared summary (used by the iPhone dashboard and the weekly email) ----------------
function summary_(nDays) {
  const sh = sheet_(), last = sh.getLastRow(), since = Date.now() - nDays * 864e5, tz = Session.getScriptTimeZone();
  const all = last > 1 ? sh.getRange(Math.max(2, last - 499), 1, Math.min(500, last - 1), HEADERS.length).getValues() : [];
  const rows = all.filter(function (r) { return new Date(r[0]).getTime() > since; });
  const props = PropertiesService.getScriptProperties().getProperties();
  const snaps = Object.keys(props).filter(function (k) { return k.indexOf('snap_') === 0; }).map(function (k) { try { return JSON.parse(props[k]); } catch (e) { return null; } }).filter(Boolean)
    .sort(function (a, b) { return b.t - a.t; });
  const status = {}; Object.keys(props).filter(function (k) { return k.indexOf('status_') === 0; }).forEach(function (k) { try { const v = JSON.parse(props[k]); status[v.device] = v; } catch (e) {} });
  const isStory = function (r) { return r[3] === 'challenge' && (String(r[4]) === "Pip's Stories" || String(r[4]) === "Gigi's Stories"); };
  const storyReads = rows.filter(isStory).map(function (r) { return {day: Utilities.formatDate(new Date(r[0]), tz, 'EEE'), book: Number(r[5]) || 0, ok: Number(r[6]) || 0, n: Number(r[7]) || 0}; });
  const learn = rows.filter(function (r) { return (r[3] === 'daily' || r[3] === 'challenge') && !isStory(r); });   // story words aren't "questions"
  const day = function (r) { return Utilities.formatDate(new Date(r[0]), tz, 'EEE'); };
  const days = []; learn.concat(rows.filter(isStory)).sort(function (a, b) { return new Date(a[0]) - new Date(b[0]); }).forEach(function (r) { if (days.indexOf(day(r)) < 0) days.push(day(r)); });
  const qs = learn.reduce(function (a, r) { return a + Number(r[7] || 0); }, 0), ok = learn.reduce(function (a, r) { return a + Number(r[6] || 0); }, 0);
  const books = rows.filter(function (r) { return r[3] === 'book'; }).map(function (r) { const m = String(r[12]).match(/(\d+) min/), a = String(r[12]).match(/· by (.+)$/); return {day: day(r), title: String(r[4]), author: a ? a[1] : '', mins: m ? Number(m[1]) : 0}; });
  const bedtimes = rows.filter(function (r) { return r[3] === 'bedtime'; }).map(function (r) { return {day: day(r), title: String(r[4])}; });
  const moods = rows.filter(function (r) { return r[3] === 'mood'; }).map(function (r) { return {day: day(r), mood: String(r[4])}; });
  const sk = {}; learn.forEach(function (r) { String(r[12] || '').split(', ').forEach(function (p) { const m = p.match(/^(.*) (\d+)\/(\d+)$/); if (!m) return; sk[m[1]] = sk[m[1]] || [0, 0]; sk[m[1]][0] += +m[2]; sk[m[1]][1] += +m[3]; }); });
  const list = Object.keys(sk).map(function (k) { return {k: k, ok: sk[k][0], n: sk[k][1], p: sk[k][0] / sk[k][1]}; }).filter(function (x) { return x.n >= 3; });
  const recent = all.slice(-15).reverse().map(function (r) { return {t: new Date(r[0]).getTime(), device: String(r[1]), type: String(r[3]), what: String(r[4]), level: r[5], ok: Number(r[6]) || 0, n: Number(r[7]) || 0, pass: r[9] === 'yes', skills: String(r[12] || '')}; });
  return {child: (snaps[0] && snaps[0].child) || 'Your child', snaps: snaps, status: status, days: days, questions: qs, firstTry: qs ? Math.round(100 * ok / qs) : 0,
    trophies: rows.filter(function (r) { return r[3] === 'challenge' && r[9] === 'yes'; }).length, storyReads: storyReads,
    words: (snaps.filter(function (x) { return x.words; })[0] || {}).words || null,
    stories: (snaps.filter(function (x) { return x.stories; })[0] || {}).stories || null,
    levels: (snaps.filter(function (x) { return x.levels; })[0] || {}).levels || null,
    bedtime: (snaps.filter(function (x) { return x.bedtime; })[0] || {}).bedtime || null, bedtimes: bedtimes,
    library: (snaps.filter(function (x) { return x.library; })[0] || {}).library || null, play: rows.reduce(function (a, r) { return a + Number(r[8] || 0); }, 0),
    books: books, readMins: books.reduce(function (a, b) { return a + b.mins; }, 0), moods: moods,
    strong: list.filter(function (x) { return x.p >= 0.85; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 4),
    practice: list.filter(function (x) { return x.p < 0.7; }).sort(function (a, b) { return a.p - b.p; }).slice(0, 4), recent: recent};
}

// ---------------- iPhone dashboard (no app install, no Developer Mode) ----------------
// iPhone Safari forgets what a Google web app saves, so the dashboard uses a personal link instead:
// ?t=<link key>, saved once to the Home Screen. The link key is separate from SECRET and can be replaced.
// Viewing needs only the link; commands (unlock / lock / message) also need the parent PIN, checked here.
function dashboardPage_(t) {
  const tok = PropertiesService.getScriptProperties().getProperty('dash_token');
  const boot = {token: tok && t && same_(t, tok) ? t : ''};
  return HtmlService.createHtmlOutput(DASH_HTML.replace('/*__BOOT__*/', 'var BOOT = ' + JSON.stringify(boot) + ';')).setTitle('Learning Gate')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover')
    .addMetaTag('apple-mobile-web-app-capable', 'yes');
}
function authOk_(cred) {
  if (same_(cred, SECRET)) return true;
  const tok = PropertiesService.getScriptProperties().getProperty('dash_token');
  return !!(tok && same_(cred, tok));
}
function pinHash_(salt, pin) { return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + ':' + pin).map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join(''); }
const PIN_RE = /^\d{4}(\d{2})?$/;   // 4 or 6 digits
function pinCheck_(pin) {   // 'ok' | 'wrong' | 'locked' | 'nopin' — the dashboard PIN only
  const props = PropertiesService.getScriptProperties(), saved = (props.getProperty('dash_pin') || '').split('$');
  if (saved.length !== 2) return 'nopin';
  const until = Number(props.getProperty('dash_pin_until') || 0); if (Date.now() < until) return 'locked';
  if (PIN_RE.test(String(pin)) && same_(pinHash_(saved[0], pin), saved[1])) { props.setProperty('dash_pin_fails', '0'); return 'ok'; }
  const fails = Number(props.getProperty('dash_pin_fails') || 0) + 1; props.setProperty('dash_pin_fails', String(fails));
  if (fails >= 5) props.setProperty('dash_pin_until', String(Date.now() + Math.min(60, Math.pow(2, fails - 5) * 5) * 60000));
  Utilities.sleep(1000); return fails >= 5 ? 'locked' : 'wrong';
}
/** Called from the dashboard page: the secret or the personal link key. */
function dashData(cred) {
  if (!authOk_(cred)) { Utilities.sleep(1500); return {ok: false}; }   // slow down guessing
  const props = PropertiesService.getScriptProperties();
  const s = summary_(7); s.ok = true; s.cmds = cmds_(props).slice(-6); s.now = Date.now(); s.hasPin = !!props.getProperty('dash_pin'); return s;
}
function dashCmd(cred, c, pin) {
  if (!authOk_(cred)) { Utilities.sleep(1500); return {ok: false}; }
  const p = pinCheck_(pin); if (p !== 'ok') return {ok: false, error: p};
  return addCmd_(c || {});
}
/** One-time setup from the dashboard: needs the SECRET. Saves the parent PIN and returns the personal link. */
function dashSetup(secret, pin) {
  if (!same_(secret, SECRET)) { Utilities.sleep(1500); return {ok: false, error: 'secret'}; }
  const props = PropertiesService.getScriptProperties();
  if (pin) { if (!PIN_RE.test(String(pin))) return {ok: false, error: 'pin'};
    const salt = Utilities.getUuid(); props.setProperties({dash_pin: salt + '$' + pinHash_(salt, pin), dash_pin_fails: '0', dash_pin_until: '0'}); }
  let tok = props.getProperty('dash_token');
  if (!tok) { tok = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, ''); props.setProperty('dash_token', tok); }
  return {ok: true, url: ScriptApp.getService().getUrl() + '?t=' + tok};
}
/** The personal link again (for copying into Safari). Works with the secret or the current link key. */
function dashMyLink(cred) {
  if (!authOk_(cred)) { Utilities.sleep(1500); return {ok: false}; }
  const tok = PropertiesService.getScriptProperties().getProperty('dash_token');
  return tok ? {ok: true, url: ScriptApp.getService().getUrl() + '?t=' + tok} : {ok: false, error: 'nolink'};
}
/** Makes a new personal link; the old one stops working (e.g. if a phone is lost). Needs the SECRET. */
function dashNewLink(secret) {
  if (!same_(secret, SECRET)) { Utilities.sleep(1500); return {ok: false}; }
  PropertiesService.getScriptProperties().deleteProperty('dash_token');
  return dashSetup(secret, '');
}

// ---------------- Weekly progress email (Sunday afternoon) ----------------
// One separate email per person. You (the Sheet's owner) are always included, so this list can stay empty.
// To add other grown-ups (a co-parent, a grandparent…), list them like this, then Save and Deploy a new version:
//   const REPORT_TO = [
//     {name: 'Grandma', email: 'grandma@example.com'},
//   ];
const REPORT_TO = [];
const INCLUDE_FEELINGS = true;      // set to false to leave the daily feelings out of the email

/** Run this ONCE from the Apps Script editor (select it, press ▶ Run, allow access). */
// SECURITY: every function without a trailing "_" can be called by anyone who opens the public dashboard page
// (google.script.run). These three must only run for the owner (in the editor) or from the Sunday trigger.
function ownerOnly_() {
  const who = Session.getActiveUser().getEmail(), me = Session.getEffectiveUser().getEmail();
  if (!who || who !== me) throw new Error('Run this from the Apps Script editor (owner only).');
}
function setupWeeklyEmail() {
  ownerOnly_();
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'sendWeeklyReport') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('sendWeeklyReport').timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(17).create();
  sendTestReport();
}
/** Sends this week's report to you only, so you can see what it looks like. */
function sendTestReport() { ownerOnly_(); const me = Session.getEffectiveUser().getEmail(); sendReport_([{name: '', email: me}], true); }
function sendWeeklyReport() {
  // Only Sunday afternoon (the trigger runs at 5 pm) and at most once a day, so nobody can use it to spam the family.
  const tz = Session.getScriptTimeZone(), now = new Date(), props = PropertiesService.getScriptProperties();
  const dow = Utilities.formatDate(now, tz, 'u'), hr = Number(Utilities.formatDate(now, tz, 'H'));
  if (dow !== '7' || hr < 16 || hr > 20) return;
  if (Date.now() - Number(props.getProperty('weekly_sent') || 0) < 20 * 3600e3) return;
  props.setProperty('weekly_sent', String(Date.now()));
  const me = Session.getEffectiveUser().getEmail();
  sendReport_([{name: '', email: me}].concat(REPORT_TO.filter(function (r) { return r.email && r.email !== me; })), false);
}
// "Reading & sight words" for the email: story books, words learned this week, tricky words.
function readingHtml_(s, esc) {
  const w = s.words, st = s.stories; if (!w && !st && !s.library) return '';
  const out = ['<p><b>📖 Reading &amp; sight words</b></p><ul>'];
  if (st && st.books.length) {
    const done = st.books.filter(function (b) { return b.r > 0; });
    out.push('<li><b>' + done.length + '</b> of ' + st.books.length + ' ' + esc(st.series || 'story') + ' books read' +
      (done.length ? ': ' + done.map(function (b) { return esc(b.t) + ' ' + '⭐'.repeat(b.s); }).join(', ') : '') + '</li>');
    if (s.storyReads.length) out.push('<li>This week: <b>' + s.storyReads.length + '</b> stor' + (s.storyReads.length === 1 ? 'y' : 'ies') + ' read, with <b>' +
      Math.round(100 * s.storyReads.reduce(function (a, r) { return a + r.ok; }, 0) / Math.max(1, s.storyReads.reduce(function (a, r) { return a + r.n; }, 0))) + '%</b> of the words right the first time</li>');
    if (st.next) out.push('<li>Next book: <b>' + esc(st.next) + '</b></li>');
  }
  if (w) {
    out.push('<li>Sight words known: <b>' + w.known + '</b> · learning: <b>' + w.learning + '</b>' + (w.review ? ' · due for review: <b>' + w.review + '</b>' : '') + '</li>');
    if (w.newKnown.length) out.push('<li>🌟 New words learned this week: <b>' + w.newKnown.map(esc).join(', ') + '</b></li>');
    if (w.tricky.length) out.push('<li>Tricky words to practise together: <b>' + w.tricky.map(esc).join(', ') + '</b></li>');
  }
  if (s.library) { const L = s.library, SL = {toread: 'to read', together: 'read together', alone: 'read on their own', mastered: 'mastered'};
    out.push('<li>🏠 Home library: <b>' + L.mastered + '</b> mastered, <b>' + L.alone + '</b> read on their own, <b>' + L.together + '</b> read together (of ' + L.total + ' books)' +
      (L.talkN ? '; talking about the books this week: <b>' + L.talkOk + ' of ' + L.talkN + '</b> 👍' : '') + '</li>');
    if (L.recent.length) out.push('<li>Books this week: ' + L.recent.map(function (x) { return esc(x.t) + ' (' + SL[x.s] + ')'; }).join(', ') + '</li>'); }
  out.push('</ul>'); return out.join('');
}
// "Levels" for the email: what moved up or down, and what is hard lately.
function levelsHtml_(s, esc) {
  const l = s.levels; if (!l || (!l.changes.length && !l.focus.length)) return '';
  const up = l.changes.filter(function (x) { return x.d > 0; }), down = l.changes.filter(function (x) { return x.d < 0; });
  return '<p><b>📈 Levels</b> (a skill moves up after 85% right on the first try, down below 60%)</p><ul>' +
    (up.length ? '<li>⬆️ Moved up: ' + up.map(function (x) { return esc(x.k) + ' (level ' + x.l + ')'; }).join(', ') + '</li>' : '') +
    (down.length ? '<li>⬇️ Easier for now: ' + down.map(function (x) { return esc(x.k) + ' (level ' + x.l + ')'; }).join(', ') + '</li>' : '') +
    (l.focus.length ? '<li>Finding it hard lately: ' + l.focus.map(function (x) { return esc(x.k) + ' ' + x.a + '%'; }).join(', ') + '</li>' : '') + '</ul>';
}

function sendReport_(people, test) {
  const s = summary_(7), snap = s.snaps[0] || {};
  const EMO = {happy: '😀', calm: '😌', tired: '😴', sad: '😢', mad: '😠', worried: '😟'};
  const esc = function (v) { return String(v).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); };
  const pl = function (n, one, many) { return '<b>' + n + '</b> ' + (n === 1 ? one : many); };
  const li = function (a) { return a.map(function (x) { return '<li>' + esc(x.k) + ' — ' + Math.round(100 * x.p) + '% (' + x.ok + '/' + x.n + ')</li>'; }).join(''); };
  const body = [
    '<p>Here is ' + esc(s.child) + "'s learning week:</p><ul>",
    '<li>' + pl(s.days.length, 'learning day', 'learning days') + (s.days.length ? ' (' + s.days.join(', ') + ')' : '') + '</li>',
    '<li>' + pl(s.questions, 'question', 'questions') + ', <b>' + s.firstTry + '%</b> right on the first try</li>',
    '<li>' + pl(s.trophies, 'new trophy', 'new trophies') + ' 🏆 (' + (snap.trophies || 0) + ' total)</li>',
    '<li>' + pl(s.books.length, 'real-book reading session', 'real-book reading sessions') + ', <b>' + s.readMins + '</b> minutes 📚' + (s.books.length ? ': ' + s.books.map(function (b) { return esc(b.title) + (b.author ? ' (' + esc(b.author) + ')' : ''); }).join(', ') : '') + '</li>',
    '<li><b>' + s.play + '</b> minutes of play earned</li>',
    s.bedtime || s.bedtimes.length ? '<li>🌙 Bedtime stories on <b>' + s.bedtimes.length + '</b> of the last 7 nights' + (s.bedtime && s.bedtime.streak ? ' · <b>' + s.bedtime.streak + '</b> nights in a row' : '') + (s.bedtime && s.bedtime.best ? ' (best ' + s.bedtime.best + ')' : '') + '</li>' : '',
    snap.mascot ? '<li>The owl is now <b>' + esc(snap.mascot) + '</b> 🦉</li>' : '', '</ul>',
    s.strong.length ? '<p><b>Doing great at:</b></p><ul>' + li(s.strong) + '</ul>' : '',
    s.practice.length ? '<p><b>Could use some practice:</b></p><ul>' + li(s.practice) + '</ul>' : '',
    readingHtml_(s, esc),
    levelsHtml_(s, esc),
    INCLUDE_FEELINGS && s.moods.length ? '<p><b>Feelings this week:</b> ' + s.moods.map(function (m) { return m.day + ' ' + (EMO[m.mood] || '') + ' ' + esc(m.mood); }).join(' · ') + '</p>' : '',
    '<p style="color:#888;font-size:12px">Sent by Learning Gate from the family Google Sheet' + (test ? ' (test email, only to you)' : '') + '.</p>'
  ].join('');
  people.forEach(function (p) {
    MailApp.sendEmail({to: p.email, subject: s.child + "'s learning week 🦉", name: 'Learning Gate',
      htmlBody: '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5"><p>Hi' + (p.name ? ' ' + esc(p.name) : '') + ',</p>' + body + '</div>'});
  });
}

// ---------------- The dashboard page itself (built from sync/dashboard.html) ----------------
const DASH_HTML = "<!DOCTYPE html>\n<html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover\">\n<style>\n:root{--bg:#fff8ec;--ink:#3b2a00;--muted:#8a7a62;--purple:#7b3fd1;--green:#27AE60;--red:#EB5757;--card:#fff}\n*{box-sizing:border-box}\nbody{margin:0;background:var(--bg);color:var(--ink);font:16px/1.45 -apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Arial,sans-serif;padding:14px 14px 40px;-webkit-text-size-adjust:100%}\nh1{font-size:23px;margin:4px 0 2px;color:var(--purple)}\nh3{margin:0 0 10px;font-size:18px}\n.top{display:flex;align-items:center;justify-content:space-between;gap:8px}\n.muted{color:var(--muted);font-size:14px}\n.card{background:var(--card);border-radius:18px;padding:14px 16px;margin:12px 0;box-shadow:0 3px 0 #ece2cf}\n.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;text-align:center;margin:8px 0}\n.stats b{display:block;font-size:22px}.stats span{font-size:12px;color:var(--muted)}\nbutton{font:inherit;border:0;border-radius:999px;padding:9px 14px;background:#f1e8d8;color:var(--ink);font-weight:600;cursor:pointer}\nbutton:active{transform:translateY(2px)}\n.ok{background:var(--green);color:#fff}.danger{background:#fde2e2;color:#b02a2a}.primary{background:var(--purple);color:#fff}\n.row{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}\n.row.grid2 button{flex:1 1 45%}\ninput,select{font:inherit;padding:9px 11px;border-radius:12px;border:1px solid #e0d6c3;background:#fff;width:100%}\nlabel{display:block;margin:8px 0;font-size:15px}\n.pill{display:inline-block;padding:2px 9px;border-radius:999px;background:#f1e8d8;font-size:13px;margin:2px 2px 0 0}\n.lock{background:#fde2e2}.open{background:#d9f4e3}\nul{margin:6px 0;padding-left:20px}li{margin:3px 0}\n.recent div{padding:7px 0;border-top:1px solid #f1e8d8;font-size:15px}.recent div:first-child{border-top:0}\n.emo{font-size:26px;margin-right:6px}\n#note{min-height:20px}\n.modal{position:fixed;inset:0;background:#0006;display:none;align-items:center;justify-content:center;padding:20px}.modal.on{display:flex}\n.box{background:var(--bg);border-radius:20px;padding:20px;width:100%;max-width:340px;text-align:center}\n.pin{font-size:30px;letter-spacing:12px;text-align:center}\n.err{color:#b02a2a;font-weight:600}\n.btnlink{display:block;text-align:center;background:var(--purple);color:#fff;font-weight:700;padding:12px;border-radius:999px;text-decoration:none}\n</style></head>\n<body>\n<div id=\"app\"><p class=\"muted\">Loading…</p></div>\n<div class=\"modal\" id=\"pinModal\"><div class=\"box\"><h3 id=\"pinTitle\">Enter your PIN</h3><input id=\"pinIn\" class=\"pin\" type=\"password\" inputmode=\"numeric\" maxlength=\"6\" autocomplete=\"off\"><p class=\"err\" id=\"pinErr\"></p><div class=\"row\"><button id=\"pinCancel\" style=\"flex:1\">Cancel</button><button class=\"primary\" id=\"pinOk\" style=\"flex:1\">OK</button></div></div></div>\n<script>\n'use strict';\n/*__BOOT__*/\nvar $ = function (s) { return document.querySelector(s); };\nvar esc = function (s) { return String(s == null ? '' : s).replace(/[&<>\"']/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&#39;'}[c]; }); };\nvar store; try { localStorage.setItem('lg_t', '1'); store = localStorage; } catch (e) { store = {m: {}, getItem: function (k) { return this.m[k] || null; }, setItem: function (k, v) { this.m[k] = v; }, removeItem: function (k) { delete this.m[k]; }}; }\nvar BOOT_ = (typeof BOOT !== 'undefined' && BOOT) || {token: ''};\nvar CRED = BOOT_.token || store.getItem('lg_secret') || '', LINKED = !!BOOT_.token, PIN = '', D = null, timer = null;\nvar EMO = {happy: '😀', calm: '😌', tired: '😴', sad: '😢', mad: '😠', worried: '😟'};\nvar PRESETS = ['Great job today! 🌟', 'Time for dinner 🍽️', 'Please call me 📞', 'Bedtime soon 🌙', 'I love you! ❤️'];\n\nfunction call(fn) { var args = [].slice.call(arguments, 1); return new Promise(function (res, rej) { var r = google.script.run.withSuccessHandler(res).withFailureHandler(rej); r[fn].apply(r, args); }); }\nfunction sha(s) { return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function (b) { return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, '0'); }).join(''); }); }\nfunction ago(t) { var m = Math.round((Date.now() - t) / 60000); if (m < 2) return 'just now'; if (m < 60) return m + ' min ago'; var h = Math.round(m / 60); return h < 24 ? h + ' h ago' : Math.round(h / 24) + ' days ago'; }\nfunction hm(t) { return new Date(t).toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'}); }\nfunction when(t) { return new Date(t).toLocaleString([], {weekday: 'short', hour: 'numeric', minute: '2-digit'}); }\n\n// ---------- one-time setup: secret + PIN → personal link for the Home Screen ----------\n// (iPhone Safari forgets what this page saves, so the link itself carries a separate, replaceable key.)\nfunction setup(msg) {\n  clearInterval(timer);\n  $('#app').innerHTML = '<h1>🦉 Learning Gate</h1><p class=\"muted\">Parent dashboard for your phone</p>' +\n    '<div class=\"card\"><h3>Set up once</h3><p>Paste the <b>secret</b> from your Google Sheet script (the line <code>const SECRET = …</code>) and choose a 4- or 6-digit parent PIN (use a different one from the PIN on your child's tablet). The PIN is only asked when you send a command.</p>' +\n    (msg ? '<p class=\"err\">' + esc(msg) + '</p>' : '') +\n    '<label>Secret <input id=\"sk\" type=\"password\" autocomplete=\"off\" autocapitalize=\"off\" spellcheck=\"false\"></label>' +\n    '<label>Parent PIN (4 or 6 digits) <input id=\"p1\" class=\"pin\" type=\"password\" inputmode=\"numeric\" maxlength=\"6\"></label>' +\n    '<label>PIN again <input id=\"p2\" class=\"pin\" type=\"password\" inputmode=\"numeric\" maxlength=\"6\"></label>' +\n    '<button class=\"primary\" id=\"go\" style=\"width:100%;margin-top:6px\">Make my link</button></div>';\n  $('#go').onclick = function () {\n    var k = $('#sk').value.trim(), a = $('#p1').value, b = $('#p2').value;\n    if (k.length < 8) return setup('Please paste the whole secret.');\n    if (!/^\\d{4}(\\d{2})?$/.test(a) || a !== b) return setup('The two PINs must be the same 4 or 6 digits.');\n    if (/^(\\d)\\1+$/.test(a) || '0123456789'.indexOf(a) >= 0 || '9876543210'.indexOf(a) >= 0 || /^(2580|0852|1212|1122|112233|121212|123123)$/.test(a)) return setup('That PIN is too easy to guess. Please pick another.');\n    $('#go').textContent = 'Checking…';\n    call('dashSetup', k, a).then(function (r) {\n      if (!r || !r.ok) return setup(r && r.error === 'pin' ? 'The PIN must be 4 or 6 digits.' : 'That secret did not match. Check it and try again.');\n      showLink(r.url);\n    }).catch(function () { setup('Could not reach your Google Sheet. Check the internet and try again.'); });\n  };\n}\nfunction showLink(url, note) {\n  clearInterval(timer);\n  $('#app').innerHTML = '<h1>🦉 Learning Gate</h1><div class=\"card\"><h3>✅ Your personal link is ready</h3>' + (note ? '<p>' + esc(note) + '</p>' : '') +\n    '<ol><li>Tap <b>Open my dashboard</b>.</li><li>In Safari tap <b>Share → Add to Home Screen</b>.</li><li>Delete the old Learning Gate icon.</li></ol>' +\n    '<p><a class=\"btnlink\" href=\"' + esc(url) + '\" target=\"_top\">📈 Open my dashboard</a></p>' +\n    '<p class=\"muted\">Anyone with this link can see the progress, so keep it to yourself. Commands still need your PIN. You can make a new link at the bottom of the dashboard if a phone is lost.</p></div>';\n}\n\n// ---------- PIN for commands: asked once per visit, checked by the Sheet ----------\nfunction askPin(cb, err) {\n  if (PIN && !err) return cb(PIN);\n  $('#pinIn').value = ''; $('#pinErr').textContent = err || ''; $('#pinModal').classList.add('on'); setTimeout(function () { $('#pinIn').focus(); }, 100);\n  $('#pinCancel').onclick = function () { $('#pinModal').classList.remove('on'); };\n  $('#pinOk').onclick = function () { var v = $('#pinIn').value; if (!/^\\d{4}(\\d{2})?$/.test(v)) { $('#pinErr').textContent = 'Enter your 4- or 6-digit PIN.'; return; } $('#pinModal').classList.remove('on'); cb(v); };\n}\n\n// ---------- load + draw ----------\nfunction load(quiet) {\n  if (!quiet) $('#app').innerHTML = '<p class=\"muted\">Loading…</p>';\n  return call('dashData', CRED).then(function (d) {\n    if (!d || !d.ok) { store.removeItem('lg_secret'); CRED = ''; return setup(LINKED ? 'This link no longer works (a new one was made). Set up again to get the new link.' : 'Your secret changed. Please set up again.'); }\n    D = d; render();\n  }).catch(function () { if (!quiet) $('#app').innerHTML = '<div class=\"card\"><h3>Couldn\\'t load</h3><p>Check the internet connection.</p><button class=\"primary\" onclick=\"load()\">Try again</button></div>'; });\n}\nfunction start() { clearInterval(timer); timer = setInterval(function () { if (!document.hidden && !$('#pinModal').classList.contains('on')) load(true); }, 60000); }\n\nfunction render() {\n  var d = D, h = '';\n  h += '<div class=\"top\"><div><h1>📈 ' + esc(d.child) + '\\'s progress</h1><div class=\"muted\">Updated ' + hm(d.now) + '</div></div><button onclick=\"load()\">↻ Refresh</button></div>';\n  // devices\n  d.snaps.forEach(function (s) {\n    var st = d.status[s.device], open = st && st.unlockUntil > Date.now();\n    h += '<div class=\"card\"><h3>' + esc(s.device) + ' <span class=\"muted\">· synced ' + ago(s.t) + '</span></h3>' +\n      (st ? '<span class=\"pill ' + (open ? 'open' : 'lock') + '\">' + (open ? '🔓 playing until ' + hm(st.unlockUntil) : '🔒 locked') + '</span> <span class=\"muted\">checked in ' + ago(st.t) + '</span>' : '') +\n      '<div class=\"stats\"><div><b>' + (+s.trophies || 0) + '</b><span>🏆 trophies</span></div><div><b>' + (+s.stars || 0) + '</b><span>⭐ stars</span></div><div><b>' + (+s.playToday || 0) + '</b><span>min play today</span></div><div><b>' + (+s.treatsWaiting || 0) + '</b><span>🎁 treats</span></div></div>' +\n      (s.mascot ? '<div>🦉 Owl: <b>' + esc(s.mascot) + '</b> · ' + (+s.days || 0) + ' learning days</div>' : '') +\n      (s.moodToday ? '<div><span class=\"emo\">' + (EMO[s.moodToday] || '🙂') + '</span>Feeling today: <b>' + esc(s.moodToday) + '</b></div>' : '') +\n      '<div>📚 ' + (+s.readWeek || 0) + ' min of book reading this week</div></div>';\n  });\n  if (!d.snaps.length) h += '<div class=\"card\"><p>No updates yet. They appear after a session is finished on a device with Progress sync turned on.</p></div>';\n  // remote control\n  var devs = d.snaps.map(function (s) { return s.device; });\n  var doneFor = function (c) { return Object.keys(d.status).some(function (k) { var st = d.status[k]; return (c.target === 'all' || c.target === k) && st.applied >= c.id; }); };\n  var label = function (c) { return c.type === 'bonus' ? '📚 +' + c.minutes + ' min to earn' : c.type === 'unlock' ? '🎁 +' + c.minutes + ' min' : c.type === 'lock' ? '🔒 Lock' : '💌 “' + esc(c.text) + '”'; };\n  h += '<div class=\"card\"><h3>🎮 Remote control</h3>' +\n    '<label>Send to <select id=\"rcDev\"><option value=\"all\">All of ' + esc(d.child) + '\\'s devices</option>' + devs.map(function (x) { return '<option value=\"' + esc(x) + '\">' + esc(x) + '</option>'; }).join('') + '</select></label>' +\n    '<div class=\"row grid2\"><button class=\"ok\" data-rc=\"unlock\" data-m=\"15\">🎁 +15 min play</button><button class=\"ok\" data-rc=\"unlock\" data-m=\"30\">🎁 +30 min play</button><button class=\"danger\" data-rc=\"lock\" style=\"flex-basis:100%\">🔒 Lock now</button></div>' +\n    '<div class=\"muted\" style=\"margin-top:6px\"><b>Let them keep learning:</b> the extra play is earned with questions or a real book (today only).</div>' +\n    '<div class=\"row grid2\"><button data-rc=\"bonus\" data-m=\"30\">📚 +30 min to earn</button><button data-rc=\"bonus\" data-m=\"60\">📚 +60 min to earn</button></div>' +\n    '<div class=\"row\">' + PRESETS.map(function (p) { return '<button data-msg=\"' + esc(p) + '\">' + esc(p) + '</button>'; }).join('') + '</div>' +\n    '<div class=\"row\"><input id=\"rcText\" maxlength=\"100\" placeholder=\"Type a message for ' + esc(d.child) + '\" style=\"flex:1\"><button class=\"primary\" id=\"rcSend\">💌 Send</button></div>' +\n    '<div class=\"muted\" id=\"note\">Her tablet picks it up within about a minute. The iPad only while Learning Gate is open.</div>' +\n    (d.cmds.length ? '<div class=\"muted\" style=\"margin-top:6px\"><b>Recent:</b> ' + d.cmds.slice().reverse().map(function (c) { return label(c) + ' ' + hm(c.id) + ' ' + (doneFor(c) ? '✅' : '⏳'); }).join(' · ') + '</div>' : '') + '</div>';\n  // week\n  h += '<div class=\"card\"><h3>📅 Last 7 days</h3><ul>' +\n    '<li><b>' + d.days.length + '</b> learning day' + (d.days.length === 1 ? '' : 's') + (d.days.length ? ' (' + d.days.join(', ') + ')' : '') + '</li>' +\n    '<li><b>' + d.questions + '</b> questions, <b>' + d.firstTry + '%</b> right on the first try</li>' +\n    '<li><b>' + d.trophies + '</b> new troph' + (d.trophies === 1 ? 'y' : 'ies') + ' 🏆</li>' +\n    '<li><b>' + d.books.length + '</b> book' + (d.books.length === 1 ? '' : 's') + ', <b>' + d.readMins + '</b> min of reading 📚' + (d.books.length ? ': ' + d.books.map(function (b) { return esc(b.title) + (b.author ? ' <span class=\"muted\">(' + esc(b.author) + ')</span>' : ''); }).join(', ') : '') + '</li>' +\n    '<li><b>' + d.play + '</b> minutes of play earned</li>' +\n    (d.bedtime || (d.bedtimes && d.bedtimes.length) ? '<li>🌙 Bedtime story on <b>' + (d.bedtimes || []).length + '</b> of 7 nights' + (d.bedtime && d.bedtime.streak ? ' · <b>' + d.bedtime.streak + '</b> in a row' : '') + '</li>' : '') + '</ul>' +\n    (d.moods.length ? '<div><b>Feelings:</b> ' + d.moods.map(function (m) { return '<span class=\"pill\">' + esc(m.day) + ' ' + (EMO[m.mood] || '') + '</span>'; }).join('') + '</div>' : '') + '</div>';\n  var li = function (a) { return a.map(function (x) { return '<li>' + esc(x.k) + ' — ' + Math.round(100 * x.p) + '%</li>'; }).join(''); };\n  if (d.strong.length || d.practice.length) h += '<div class=\"card\">' + (d.strong.length ? '<h3>💪 Doing great at</h3><ul>' + li(d.strong) + '</ul>' : '') + (d.practice.length ? '<h3>🎯 Could use practice</h3><ul>' + li(d.practice) + '</ul>' : '') + '</div>';\n  // reading & sight words, levels\n  h += readingCard(d) + levelsCard(d);\n  // recent\n  h += '<div class=\"card\"><h3>🕑 Recent activity</h3><div class=\"recent\">' + (d.recent.length ? d.recent.map(function (r) {\n    var story = r.type === 'challenge' && r.what === \"Gigi's Stories\";\n    var book = story && d.stories && d.stories.books[(+r.level || 0) - 1];\n    var what = r.type === 'bedtime' ? '🌙 Bedtime story “' + esc(r.what) + '”' : story ? '📖 Read ' + (book ? '“' + esc(book.t) + '”' : 'story book ' + (+r.level || '')) + ' — ' + r.ok + '/' + r.n + ' words right' : r.type === 'book' ? '📚 Read “' + esc(r.what) + '”' : r.type === 'mood' ? (EMO[r.what] || '🙂') + ' Feeling ' + esc(r.what) : r.type === 'challenge' ? '🏆 ' + esc(r.what) + ' L' + (+r.level || '') + ' — ' + r.ok + '/' + r.n + (r.pass ? ' ✅' : '') : '📝 Daily questions — ' + r.ok + '/' + r.n;\n    return '<div><span class=\"muted\">' + when(r.t) + ' · ' + esc(r.device) + '</span><br>' + what + '</div>'; }).join('') : '<p class=\"muted\">Nothing yet.</p>') + '</div></div>';\n  h += '<div class=\"card\" id=\"homeLink\"><h3>📲 Add to your Home Screen</h3><p class=\"muted\">Opened from a Home Screen icon there is no Share button, so add it from the Safari app:</p><button class=\"primary\" id=\"getLink\" style=\"width:100%\">📲 Get my Home Screen link</button><div id=\"linkBox\"></div></div>';\n  h += '<p class=\"muted\" style=\"text-align:center\"><button id=\"newLink\">🔗 Make a new link</button></p>';\n  $('#app').innerHTML = h;\n  // handlers\n  document.querySelectorAll('[data-rc]').forEach(function (b) { b.onclick = function () { send({type: b.dataset.rc, minutes: +b.dataset.m || 0}); }; });\n  document.querySelectorAll('[data-msg]').forEach(function (b) { b.onclick = function () { send({type: 'msg', text: b.dataset.msg}); }; });\n  $('#rcSend').onclick = function () { var t = $('#rcText').value.trim(); if (t) send({type: 'msg', text: t.slice(0, 100)}); };\n  $('#getLink').onclick = function () { $('#getLink').textContent = 'Getting your link…';\n    call('dashMyLink', CRED).then(function (r) {\n      if (!r || !r.ok) { $('#getLink').textContent = '📲 Get my Home Screen link'; return setup('Set up once to get your personal link.'); }\n      $('#getLink').style.display = 'none';\n      $('#linkBox').innerHTML = '<input id=\"linkTxt\" readonly value=\"' + esc(r.url) + '\" style=\"font-size:13px;margin:6px 0\">' +\n        '<button class=\"ok\" id=\"copyLink\" style=\"width:100%\">📋 Copy link</button>' +\n        '<ol style=\"margin-top:10px\"><li>Tap <b>Copy link</b>.</li><li>Open the <b>Safari</b> app, tap the address bar, paste and go.</li><li>Tap <b>Share</b> (□↑) → <b>Add to Home Screen</b> → Add.</li><li>Press and hold the old Learning Gate icon → <b>Remove App</b> → Delete Bookmark.</li></ol>';\n      $('#copyLink').onclick = function () { var t = $('#linkTxt'); t.focus(); t.select(); t.setSelectionRange(0, 99999);\n        var done = function () { $('#copyLink').textContent = '✅ Copied! Now open Safari and paste it'; };\n        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(r.url).then(done, function () { document.execCommand('copy'); done(); });\n        else { document.execCommand('copy'); done(); } };\n    }).catch(function () { $('#getLink').textContent = '📲 Get my Home Screen link'; alert('Could not reach your Google Sheet.'); }); };\n  $('#newLink').onclick = function () { var k = prompt('To make a new link (the old one will stop working), paste the secret from your Google Sheet script:'); if (!k) return;\n    call('dashNewLink', k.trim()).then(function (r) { if (!r || !r.ok) return alert('That secret did not match.'); showLink(r.url, 'The old link no longer works.'); }).catch(function () { alert('Could not reach your Google Sheet.'); }); };\n}\nfunction readingCard(d) {\n  var w = d.words, st = d.stories; if (!w && !st && !d.library) return '';\n  var h = '<div class=\"card\"><h3>📖 Reading &amp; sight words</h3>';\n  if (w) h += '<div class=\"stats\" style=\"grid-template-columns:repeat(3,1fr)\"><div><b>' + w.known + '</b><span>⭐ words known</span></div><div><b>' + w.learning + '</b><span>🌱 learning</span></div><div><b>' + w.review + '</b><span>🔁 to review</span></div></div>';\n  if (w && w.newKnown.length) h += '<div>🌟 New this week: <b>' + w.newKnown.map(esc).join(', ') + '</b></div>';\n  if (w && w.tricky.length) h += '<div>🎯 Tricky: ' + w.tricky.map(function (x) { return '<span class=\"pill\">' + esc(x) + '</span>'; }).join('') + '</div>';\n  if (w && w.practising.length) h += '<div class=\"muted\" style=\"margin-top:4px\">Practising next: ' + w.practising.map(esc).join(', ') + '</div>';\n  if (st && st.books.length) {\n    h += '<div style=\"margin-top:8px\"><b>' + esc(st.series) + '</b></div><ul>' + st.books.map(function (b) {\n      return '<li>' + esc(b.t) + ' ' + (b.r ? '⭐'.repeat(b.s) + '☆'.repeat(3 - b.s) + ' <span class=\"muted\">· read ' + b.r + '×</span>' : '<span class=\"muted\">' + (b.t === st.next ? 'next up' : 'not yet') + '</span>') + '</li>'; }).join('') + '</ul>';\n  }\n  if (d.library) { var L = d.library, SL = {toread: 'to read', together: '🤝 together', alone: '⭐ on their own', mastered: '🏅 mastered'};\n    h += '<div style=\"margin-top:8px\"><b>🏠 Home library</b></div><div>🏅 ' + L.mastered + ' mastered · ⭐ ' + L.alone + ' on their own · 🤝 ' + L.together + ' together <span class=\"muted\">(of ' + L.total + ')</span></div>' +\n      (L.talkN ? '<div class=\"muted\">Talking about books this week: ' + L.talkOk + ' of ' + L.talkN + ' 👍</div>' : '') +\n      (L.recent.length ? '<ul>' + L.recent.map(function (x) { return '<li>' + esc(x.t) + ' <span class=\"muted\">' + SL[x.s] + '</span></li>'; }).join('') + '</ul>' : ''); }\n  if (d.storyReads && d.storyReads.length) { var ok = 0, n = 0; d.storyReads.forEach(function (r) { ok += r.ok; n += r.n; });\n    h += '<div class=\"muted\">This week: ' + d.storyReads.length + ' stor' + (d.storyReads.length === 1 ? 'y' : 'ies') + ', ' + Math.round(100 * ok / Math.max(1, n)) + '% of words right first time</div>'; }\n  return h + '</div>';\n}\nfunction levelsCard(d) {\n  var l = d.levels; if (!l || (!l.changes.length && !l.focus.length)) return '';\n  var dots = function (n) { return '●●●'.slice(0, n) + '○○○'.slice(0, 3 - n); };\n  return '<div class=\"card\"><h3>📈 Levels</h3>' +\n    (l.changes.length ? '<ul>' + l.changes.map(function (x) { return '<li>' + (x.d > 0 ? '⬆️ ' : '⬇️ ') + esc(x.k) + ' <span style=\"color:var(--purple)\">' + dots(x.l) + '</span></li>'; }).join('') + '</ul>' : '<p class=\"muted\">No level changes this week.</p>') +\n    (l.focus.length ? '<div><b>Finding it hard lately:</b></div><ul>' + l.focus.map(function (x) { return '<li>' + esc(x.k) + ' — ' + x.a + '% <span style=\"color:var(--purple)\">' + dots(x.l) + '</span></li>'; }).join('') + '</ul>' : '') +\n    '<div class=\"muted\">Up after 85% right on the first try (last 8–10 answers), down below 60%.</div></div>';\n}\nfunction send(c, err) {\n  c.target = $('#rcDev').value;\n  askPin(function (pin) {\n    $('#note').textContent = 'Sending…';\n    call('dashCmd', CRED, c, pin).then(function (r) {\n      if (r && r.ok) { PIN = pin; $('#note').textContent = '✅ Sent! It reaches the device within about a minute.'; setTimeout(function () { load(true); }, 1500); setTimeout(function () { load(true); }, 70000); return; }\n      PIN = '';\n      if (r && r.error === 'wrong') return send(c, 'Wrong PIN, try again.');\n      if (r && r.error === 'locked') { $('#note').textContent = 'Too many wrong PINs. Please wait a few minutes.'; return; }\n      if (r && r.error === 'nopin') return setup('Please set your parent PIN once (this also gives you a link that stays signed in).');\n      $('#note').textContent = 'Could not send.';\n    }).catch(function () { $('#note').textContent = 'Could not send. Check the internet connection.'; });\n  }, err);\n}\nif (CRED) { load(); start(); } else setup();\n</script>\n</body></html>\n";
