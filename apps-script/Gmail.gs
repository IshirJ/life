/**
 * Life — Gmail sync (Google Apps Script)
 *
 * Pushes your unread Gmail inbox (top 15 threads) to your life-sync worker every 15 minutes,
 * so the Life app can show it next to Outlook mail. Runs entirely in your Google account.
 *
 * SETUP
 *  1. Go to https://script.google.com and click "New project". Name it "Life Gmail sync".
 *  2. Delete the sample code and paste this whole file in.
 *  3. Set WORKER_URL below to your worker URL (e.g. https://life-sync.<you>.workers.dev, no trailing slash).
 *  4. Set LIFE_KEY to your pairing key (Life app → Settings → Sync → copy key).
 *  5. Select the function "setup" in the toolbar and click Run. Approve the permissions
 *     (Gmail read, external requests, triggers). If you see "Google hasn't verified this app",
 *     click Advanced → Go to project (it is your own script).
 *  6. Select "syncGmail" and click Run once to test. View → Executions/Logs should show "200".
 *  Done — it now runs every 15 minutes. Run setup again any time to reset the trigger.
 *
 *  JOB APPLICATIONS (added): syncJobs() sends Life a short line for every email in your job labels
 *  ("Job applications", its sub-labels like "Assessments & Interviews" / "Rejections", and
 *  "Post-Application Forms"): sender name, sender domain, subject, date and label. Never the email body.
 *  Run "setup" again after pasting this version; the first run sends your whole history.
 */

const WORKER_URL = 'https://life-sync.YOUR-SUBDOMAIN.workers.dev';
const LIFE_KEY = 'PASTE-YOUR-LIFE-KEY-HERE';

function syncGmail() {
  const threads = GmailApp.search('is:unread in:inbox', 0, 15);
  const items = threads.map(function (t) {
    const msgs = t.getMessages();
    const last = msgs[msgs.length - 1];
    const body = (last.getPlainBody() || '').replace(/\s+/g, ' ').trim();
    return {
      id: t.getId(),
      from: cleanFrom(last.getFrom()),
      subject: t.getFirstMessageSubject() || '(no subject)',
      preview: body.slice(0, 140),
      date: last.getDate().toISOString(),
      link: 'https://mail.google.com/mail/u/0/#inbox/' + t.getId(),
    };
  });

  const res = UrlFetchApp.fetch(WORKER_URL.replace(/\/+$/, '') + '/ingest/gmail', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'X-Life-Key': LIFE_KEY },
    payload: JSON.stringify({ items: items }),
    muteHttpExceptions: true,
  });
  Logger.log(res.getResponseCode() + ' ' + res.getContentText().slice(0, 200));
}

// "Jane Doe <jane@x.com>" → "Jane Doe"
function cleanFrom(from) {
  const m = /^\s*"?([^"<]+?)"?\s*<[^>]+>\s*$/.exec(from || '');
  return m ? m[1] : (from || '');
}

// ---- job applications: subjects only ----
const JOB_LABEL_RE = /job|applica|assessment|interview|rejection|offer/i;

function syncJobs() {
  const props = PropertiesService.getScriptProperties();
  const since = Number(props.getProperty('jobsSince') || 0);       // 0 = first run: send everything
  const labels = GmailApp.getUserLabels().filter(function (l) { return JOB_LABEL_RE.test(l.getName()); });
  const items = [];
  labels.forEach(function (label) {
    for (let start = 0; start < 2000; start += 100) {
      const threads = label.getThreads(start, 100);
      if (!threads.length) break;
      let older = false;
      threads.forEach(function (t) {
        const d = t.getLastMessageDate();
        if (since && d.getTime() < since - 86400000) { older = true; return; }
        const first = t.getMessages()[0];
        const from = first.getFrom();
        items.push({
          id: t.getId(),
          from: cleanFrom(from),
          domain: ((/@([^>\s]+)/.exec(from) || [])[1] || '').toLowerCase(),
          subject: (t.getFirstMessageSubject() || '').slice(0, 200),
          date: d.toISOString(),
          label: label.getName(),
        });
      });
      if (older || threads.length < 100) break;
    }
  });
  for (let i = 0; i < items.length; i += 500) {
    const res = UrlFetchApp.fetch(WORKER_URL.replace(/\/+$/, '') + '/ingest/jobs', {
      method: 'post', contentType: 'application/json', headers: { 'X-Life-Key': LIFE_KEY },
      payload: JSON.stringify({ items: items.slice(i, i + 500) }), muteHttpExceptions: true,
    });
    Logger.log('jobs ' + res.getResponseCode() + ' ' + res.getContentText().slice(0, 120));
  }
  props.setProperty('jobsSince', String(Date.now()));
}

function setup() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'syncGmail' || t.getHandlerFunction() === 'syncJobs') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('syncGmail').timeBased().everyMinutes(15).create();
  ScriptApp.newTrigger('syncJobs').timeBased().everyHours(1).create();
  syncGmail();
  syncJobs();
}
