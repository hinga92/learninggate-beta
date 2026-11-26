# Learning Gate — family beta (web preview)

A free preview of Learning Gate for families testing the beta: setup wizard, Kindergarten–Grade 5 questions,
Pip's Stories for every grade, bedtime story and reading timer.

Open: https://hinga92.github.io/learninggate-beta/ (QR code: [share/learninggate-beta-qr.png](share/learninggate-beta-qr.png))

## Privacy

- **Nothing is collected.** No ads, no tracking, no analytics, no account. Progress and what you type in stay in this browser.
- **Microphone:** off by default here. If you turn on reading out loud, the browser turns speech into text
  (Chrome sends it to Google, Safari to Apple). Nothing is recorded or kept by Learning Gate.
- **Optional family Sheet:** progress can go to *your own* Google Sheet if you set one up. The grown-up PIN is never sent there.

## This page can't lock a device

All the learning works here, but a web page can't stop a child from opening other apps. Use **Guided Access** on an
iPad or iPhone (Settings → Accessibility → Guided Access, then triple-click the side button). The lock itself needs
the Android tablet app.

## Family kit (optional)

- [FAMILY_SETUP.md](FAMILY_SETUP.md): set up your own Google Sheet, phone dashboard and weekly email (about 10 minutes).
- [LearningGateSync.gs](LearningGateSync.gs): the Sheet script. **Change the sample `SECRET` before the first sync**:
  until you do, the script refuses every device.

Known limits of GitHub Pages hosting: no `frame-ancestors` header can be set, and inline styles are allowed (never inline scripts).
