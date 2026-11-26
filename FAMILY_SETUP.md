# Family setup: your own Learning Gate Sheet (optional, about 10 minutes)

Learning Gate works on its own on one tablet or iPad, with no account. This guide adds the **family kit**:
your own copy of the Learning Gate Google Sheet. It lives in **your** Google account, and nobody else can see it, including the people who make the app.

With it you get:

- **One progress on every device.** The tablet and the iPad share stars, trophies, levels, sight words, books and settings.
- **A dashboard on your phone**: today's learning, the last 7 days, reading and levels, plus remote control (give or lock play time, send a message). No app needed on your phone.
- **A weekly email** every Sunday afternoon with your child's learning week.

You need a Google account (Gmail is fine) and a computer for steps 1–4. The other steps can be done on a phone or tablet.

---

## 1. Make your own Sheet

**If you were sent a "Learning Gate Sheet" template link:** open it, then choose **File → Make a copy**. Name it something like `Learning Gate progress` and skip to step 2. The copy already contains the script, so step 2 is just opening it.

**Otherwise:**

1. Go to <https://sheets.google.com> and create a **blank** spreadsheet.
2. Name it `Learning Gate progress` (top left).

Keep the Sheet **private**. Leave **Share** at its default (**Restricted**), and don't share it with anyone.

## 2. Add the script

1. In the Sheet: **Extensions → Apps Script**. A new tab opens.
2. Delete everything in the editor (`function myFunction() {}`).
3. Open the file **`LearningGateSync.gs`** (on the beta site: https://hinga92.github.io/learninggate-beta/LearningGateSync.gs, or `sync/LearningGateSync.gs` in this project), select all of it, copy, and paste it into the editor.
4. Click the 💾 **Save** icon. Name the project `Learning Gate` if asked.

## 3. Set your own SECRET

Near the top of the script there is this line:

```js
const SECRET = 'CHANGE-ME-to-a-long-secret';
```

Replace `CHANGE-ME-to-a-long-secret` with your own password of **at least 16 letters and numbers**, for example `river7Mango2Lamp9Tiger4`. Keep the quotes around it. Then **Save** again.

- **Write the SECRET down.** You'll type it into each device.
- Until you change it, the script refuses every device, so a copy with the sample SECRET can't be used by anyone.
- Optional: to email the weekly report to another grown-up as well (a co-parent or grandparent), edit the `REPORT_TO` list in the script (an example is right above it). You always get the email yourself.

## 4. Deploy it as a web app

1. Click **Deploy → New deployment**.
2. Click the ⚙ gear next to "Select type" → **Web app**.
3. Set **Execute as: Me** and **Who has access: Anyone**.
   ("Anyone" lets your child's devices reach the script without signing in. They still need your SECRET, and the Sheet itself stays private.)
4. Click **Deploy** → **Authorize access** → choose your Google account. Google shows "Google hasn't verified this app", because it's your own script. Click **Advanced → Go to Learning Gate (unsafe) → Allow**.
5. Copy the **Web app URL**. It starts with `https://script.google.com/macros/s/` and ends with `/exec`.

**Weekly email (recommended):** in the Apps Script editor, pick **`setupWeeklyEmail`** in the function list next to ▶ Run, then press **▶ Run** once and allow access. You'll get a test email right away, then a report every Sunday around 5 pm.

> **Changed the script later?** Use **Deploy → Manage deployments → ✎ Edit → Version: New version → Deploy**. The URL stays the same.

## 5. Connect your child's devices

On each of your child's tablets or iPads:

1. Hold **⚙** (top-right of the home screen) for 1 second and enter your grown-up PIN.
2. Find the **📡 Progress sync** card.
3. **This device is:** *(child's name)'s device (sends progress)*.
4. **Device name:** for example `Tablet` or `iPad`.
5. Paste the **Web app URL** and type your **SECRET**.
6. Tap **Save and send now**. A row appears in the Sheet's **Sessions** tab after the next learning session.

Settings and progress now follow your child between devices. Each family Sheet accepts at most 8 devices.

## 6. Open the dashboard on your phone

1. On your phone, open the **Web app URL** in **Safari** (iPhone) or **Chrome** (Android).
2. **Set up once:** paste your **SECRET** and choose a **remote-control PIN** (4 or 6 digits) for remote commands. Use a **different** PIN from the grown-up PIN on your child's devices: that one never leaves the devices, and this one is kept (scrambled) in your script.
3. The dashboard gives you a **personal link**. Tap **Copy**, open it in Safari or Chrome, then **Share → Add to Home Screen**.
4. From now on, the Home Screen icon opens straight to your child's progress. Commands (give play time, lock, messages) ask for your remote-control PIN. Five wrong tries lock commands for a few minutes.

Anyone who has the personal link can *see* the progress, so keep it to yourself. If a phone is lost, open the dashboard and tap **🔗 Make a new link** at the bottom; the old link stops working.

*(Alternative: install Learning Gate on your own phone and choose **Parent's phone** in the Progress sync card. The app's home screen then becomes the dashboard. Set the remote-control PIN there with **Set remote-control PIN**, or use the one you chose in step 2.)*

---

## Updating from an earlier version (0.3.1 or older)

Version 0.3.2 changes how the app talks to your Sheet (the SECRET now travels inside each request, never in a web address, and the grown-up PIN is no longer copied to the Sheet). After updating the app:

1. Open your Sheet → **Extensions → Apps Script**, select all of the old script and paste the new **`LearningGateSync.gs`**.
2. Put **your own SECRET** back in the `const SECRET = …` line (the new file has the sample one), and your `REPORT_TO` list if you had one. **Save**.
3. **Deploy → Manage deployments → ✎ Edit → Version: New version → Deploy.** The URL stays the same.
4. On your phone, open the dashboard and set a **remote-control PIN** (or in the app: 📡 Progress sync → Set remote-control PIN). The old way of using the child's grown-up PIN for remote commands no longer works.
5. Older versions copied the grown-up PIN (scrambled) into the Sheet's hidden `State` tab. The new script removes it the next time a device syncs. To be safe, **change the grown-up PIN** on each of your child's devices, and if anyone else ever had access to your Sheet, **change the SECRET** too (see "Lost device or SECRET leaked" below).

---

## Good to know

- **Your data, your account.** Progress lives in your Google Drive. To stop syncing, delete the deployment (Deploy → Manage deployments → Archive) or the Sheet itself.
- **Don't rename** the Sheet's tabs (`Sessions`, `State` and others the script creates).
- **Lost device or SECRET leaked:** change the SECRET in the script, **deploy a new version** (step 4), type the new SECRET on your other devices, set a new remote-control PIN, make a new dashboard link, and change the grown-up PIN on your other devices.
- **Privacy:** the devices send a short summary (skills practised, scores, books and minutes), never voice recordings and never the grown-up PIN. Reading out loud uses the device's speech recognition: on the Android tablet it runs on the tablet when the offline English voice is installed, otherwise Android may send the speech to Google; in a web browser, Chrome sends it to Google and Safari to Apple. Nothing is kept by Learning Gate, and the microphone can be switched off in Grown-ups → Rules.
- **Problems?** "Couldn't send" usually means a typo in the SECRET, a URL that doesn't end in `/exec`, or no internet. On the device, the Progress sync card shows when it last sent.
