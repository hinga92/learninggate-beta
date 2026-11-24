// ---------------- Study call: family helpers (set in setup / Grown-ups) help over WhatsApp or Google Meet with screen sharing ----------------
(() => {
  const N = window.Native;
  const HELPER_SLOTS = 3;   // up to 3 helpers (name + WhatsApp number); every family starts with none
  window.normHelpers = () => {
    const h = (Array.isArray(S.studyHelpers) ? S.studyHelpers : []).filter(x => x && typeof x === 'object')
      .map(x => ({name: String(x.name || '').slice(0, 30), num: String(x.num || '').slice(0, 24)})).slice(0, HELPER_SLOTS);
    while (h.length < HELPER_SLOTS) h.push({name: '', num: ''});
    return (S.studyHelpers = h);
  };
  normHelpers();
  if (typeof S.meetLink !== 'string') S.meetLink = '';
  const names = () => { const n = S.studyHelpers.filter(h => h.num.trim()).map(h => h.name || 'a helper'); return n.length ? n.slice(0, -1).join(', ') + (n.length > 1 ? ' or ' : '') + n[n.length - 1] : 'a helper'; };
  const info = () => { try { return N && N.studyInfo ? JSON.parse(N.studyInfo()) : {active: false, onCall: false, hasWhatsApp: true, hasMeet: true}; } catch (e) { return {}; } };
  const start = (kind, target) => {
    if (N && N.startStudyCall) N.startStudyCall(kind, target);
    else window.open(kind === 'meet' ? target : 'https://wa.me/' + String(target).replace(/\D/g, ''), '_blank');
  };
  const end = () => { if (N && N.endStudyCall) N.endStudyCall(); };
  const isIOS = () => { try { return !!Bridge.state().ios; } catch (e) { return false; } };

  // screen
  const sec = document.createElement('section'); sec.className = 'screen'; sec.id = 'studycall';
  sec.innerHTML = `<header class="playhead"><button class="small-btn" id="scBack">⬅ Back</button><span><button class="small-btn helpOpen">🆘 Help</button><button class="small-btn ctrlBtn">🔊☀️</button></span></header>
    <div class="homewrap scwrap"><div class="mascot">📞</div><h1>Study call</h1><p class="homemsg" id="scMsg"></p>
    <div class="helpbtns" id="scBtns"></div>
    <ol class="scsteps" id="scSteps"></ol>
    <button class="bigbtn" id="scLearn">🚀 Back to my questions</button>
    <button class="small-btn danger" id="scEnd">📴 End study call</button></div>`;
  document.body.appendChild(sec);

  window.renderStudyCall = function () {
    const i = info(), helpers = S.studyHelpers.filter(h => h.num.trim()), meet = S.meetLink.trim();
    let b = helpers.map((h, k) => `<button class="helpbtn wa" data-sc="${k}">🎥 WhatsApp ${esc(h.name || 'helper')}</button>`).join('');
    if (meet) b += `<button class="helpbtn meet" id="scMeet">🟢 Join our Google Meet</button>`;
    if (!b) b = `<p class="homemsg">Ask a grown-up to add your helpers' numbers in ⚙︎ Grown-ups → Study call.</p>`;
    $('#scBtns').innerHTML = b;
    $('#scMsg').textContent = i.onCall ? '✅ You are on a call. Share your screen, then come back here.' : (i.active ? 'Study call is open. You can go back to the call any time.' : 'Call ' + names() + ' so they can see your screen and help you.');
    const share = isIOS() ? 'In the call, tap <b>Share screen</b> (📱↗️), then <b>Start Broadcast</b>.' : 'In the call, tap <b>⋯</b> or the 📱↗️ button, then <b>Share screen</b> → <b>Entire screen</b> → <b>Start now</b>.';
    $('#scSteps').innerHTML = [
      'Tap a big button above. In WhatsApp, tap the 🎥 <b>video</b> button to call.',
      share,
      'Swipe up or press <b>Home</b> to come back to Learning Gate. The call keeps going!',
      'Do your questions. ' + esc(names()) + ' can see and help you. 💛'
    ].map(s => `<li>${s}</li>`).join('');
    sec.querySelectorAll('[data-sc]').forEach(x => x.onclick = () => { const h = helpers[+x.dataset.sc]; start('wa', h.num); setTimeout(renderStudyCall, 800); });
    if ($('#scMeet')) $('#scMeet').onclick = () => { start('meet', meet); setTimeout(renderStudyCall, 800); };
    $('#scEnd').style.display = (i.active || i.onCall) ? '' : 'none';
    sec.querySelectorAll('.helpOpen').forEach(x => x.onclick = openHelp);
    sec.querySelectorAll('.ctrlBtn').forEach(x => { const o = document.querySelector('#home .ctrlBtn'); if (o) x.onclick = o.onclick; });
    show('studycall');
  };
  $('#scBack').onclick = () => renderHome();
  $('#scLearn').onclick = () => renderHome();
  $('#scEnd').onclick = () => { end(); renderHome(); };

  // buttons on home, play and challenges
  const addBtn = (parent, cls, before) => { if (!parent) return; const x = document.createElement('button'); x.className = cls + ' scOpen'; x.textContent = '📞 Study call'; x.onclick = () => renderStudyCall(); before ? parent.insertBefore(x, before) : parent.appendChild(x); };
  addBtn(document.querySelector('#home .homewrap .row'), 'bigbtn2 sc');
  const ph = document.querySelector('#play .playhead > span:last-child'); addBtn(ph, 'small-btn', ph && ph.firstChild);
  const ch = document.querySelector('#challenges .playhead > span:last-child'); addBtn(ch, 'small-btn', ch && ch.firstChild);

  // stay on the study-call screen when she comes back from the call
  const prevResume = window.onNativeResume;
  window.onNativeResume = () => { const on = document.querySelector('.screen.on')?.id; if (on === 'studycall') return renderStudyCall(); if (prevResume) prevResume(); };

  // grown-ups card
  const card = () => `<div class="card" id="scCard"><h3>📞 Study call (helpers join on video and see the screen)</h3>
    ${S.studyHelpers.map((h, k) => `<div class="row2"><label>Name <input data-scn="${k}" value="${esc(h.name)}"></label><label>WhatsApp number <input data-scp="${k}" inputmode="tel" value="${esc(h.num)}" placeholder="+1 555 123 4567"></label></div>`).join('')}
    <label>Google Meet link (optional, a link you reuse) <input id="scLink" value="${esc(S.meetLink)}" placeholder="https://meet.google.com/abc-defg-hij"></label>
    <p class="muted">Add up to 3 helpers (a parent, grandparent, older cousin…) with their WhatsApp number including the country code. A study call keeps WhatsApp and Meet open for 60 minutes so your child can share the screen. It closes by itself 2 minutes after the call ends. Calls are never interrupted by the lock, so on the child's WhatsApp turn on <b>Settings → Privacy → Calls → Silence unknown callers</b> and keep only family in the contacts. Games stay locked. ${isIOS() ? 'iPad: turn Guided Access off before a study call (triple-click), or screen sharing can\'t start.' : ''}</p></div>`;
  const prevRP = renderParent;
  renderParent = function () { const r = prevRP.apply(this, arguments);
    try { if (Bridge.state().adbOn && !$('#adbCard')) $('#parentBody').insertAdjacentHTML('afterbegin', '<div class="card hl" id="adbCard"><h3>⚠️ USB debugging is on</h3><p>Anyone with a computer and a cable could change this tablet while it is on. After installing updates, turn it off: <b>Settings → Developer options → USB debugging</b> (turn it back on only when you install an update).</p></div>'); } catch (e) {} const help = [...document.querySelectorAll('#parentBody .card')].find(c => /Help button/.test(c.textContent)); if (help && !$('#scCard')) help.insertAdjacentHTML('afterend', card()); return r; };
  const prevSP = saveParent;
  saveParent = function () {
    if ($('#scCard')) {
      normHelpers();
      document.querySelectorAll('[data-scn]').forEach(x => S.studyHelpers[+x.dataset.scn].name = x.value.trim().slice(0, 30));
      document.querySelectorAll('[data-scp]').forEach(x => S.studyHelpers[+x.dataset.scp].num = x.value.trim());
      let l = $('#scLink').value.trim().replace(/[?#].*$/, '');
      if (/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/.test(l)) l = 'https://meet.google.com/' + l;
      if (l && !/^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/.test(l)) { alert('The Meet link must look like https://meet.google.com/abc-defg-hij'); return false; }
      const bad = [...document.querySelectorAll('[data-scp]')].find(x => x.value.trim() && !/^\+?[0-9 ()-]{8,20}$/.test(x.value.trim()));
      if (bad) { alert('Please enter WhatsApp numbers with the country code, like +1 555 123 4567'); return false; }
      S.meetLink = l;
    }
    return prevSP.apply(this, arguments);
  };
})();
