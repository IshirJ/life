# Life app — developer handoff (state as of 2026-10-21, v180)

Live app: https://ishirj.github.io/life/  ·  Server: https://life-sync.ishir1089.workers.dev  ·  Repo: IshirJ/life (GitHub Pages serves the repo root)

## Rebuild from this repo (fresh session)
```
git clone https://github.com/IshirJ/life repo-life
mkdir -p life/dist && cp -r repo-life/src/* life/ && cp repo-life/{foods.txt,exercises.json,pf.js} life/ && cp -r repo-life/pdfjs life/ && cp repo-life/sw.js life/dist/sw.js
cd life && python3 build.py          # -> life/dist (bumps sw.js life-vN)
cp -r dist/* ../repo-life/ && cp *.js *.html build.py sw.src.js ../repo-life/src/   # keep src in sync
cd ../repo-life && git add -A && git commit -m "..." && git push origin HEAD:main
```
- Commits end with the Co-Authored-By / Claude-Session lines from the session's system reminder.
- Pages deploys in ~40 s ("pages build and deployment"); the worker auto-deploys from repo-life/worker via GitHub Action "Deploy life-sync worker" (`gh run list -R IshirJ/life`).
- Worker tests: `cd repo-life/worker && npm test` (91 pass). Never run `wrangler deploy` by hand.
- Phone picks up updates on the next foreground (service worker + reload on controllerchange). The intro only plays on a cold start; Settings → Intro → Play it now.

## Source layout (src/)
- build.py concatenates index.html + secure.js, ext.js, more.js, ui2.js, ui3.js, icons.js, ui4.js into one page. **Later files override earlier functions** (`const _x=fn; fn=function(){…}`), CSS blocks are injected at the end of ui4.js.
- index.html: core (db, entries, render, sheets, food log, lock/passcode, menus `.sel`/`openMenu`).
- secure.js: E2E (AES-GCM, PBKDF2 600k, salt = server URL). Key stored non-extractable in IndexedDB `life-keys/k/e2e`. Helpers e2eSetKey/e2eForget/isLocked.
- ext.js: server sync (merge per item, tombstones 730 d, change counter), notifications schedule (encrypted titles), calendars/mail/health, backups, units (UNITS incl. 'serving').
- ui2/ui3: swipes + urgency, food week, focus timer, readiness inputs.
- ui4.js: everything newer — hero art, header, intro (`ixRun`), JARVIS phone HUD + voice + local intents (`jvIntent`, strict matching, Undo), E2E sheet (verify-before-activate, passphrase variants, "Start fresh with this device's data"), projects grouping, injury daily log (`db.injlog`, `db.meds`), perf CSS (#perfglass, #perfwide).
- foods.txt: TSV `name, kcal, protein, carbs, fat (per 100 g), source, aliases, serving "grams|label"`; 75,133 rows (USDA, IFCT, OpenNutrition, 132 restaurant components `RC`). See FOOD_SOURCES.md (licences/attribution rules).

## Server (repo-life/worker)
- Cloudflare Worker + KV LIFE + Durable Object SyncHub + Workers AI (`AI`).
- Gemini (owner's free key, stored server-side) with model fallbacks; when its quota is out, /ai/food and /jarvis/ask fall back to Workers AI (Llama 3.2 Vision / 3.3 70B / 3.1 8B).
- Rate limits per key, X-Life-TZ header for time zone, POST /oauth/<x>/begin (no key in URLs), push payload carries `enc` for encrypted notification titles.

## Owner rules (must keep)
- Everything free. Owner must not have to paste new keys, re-copy the Scriptable widget, or edit Gmail.gs. He refuses key rotation / scoped keys.
- Never ask for, show, paste or upload secrets (life key, Gemini key, passphrase, laptop config files).
- Laptop work only inside Downloads\IshirOS\; back up before editing; never delete without explicit OK. JARVIS must never pay and never click a final submit/send without "confirm".
- Style: dark botanical glass, orange/green, Geist font, consistent radius tokens; direct, concise replies; build → test → push every change.
- Token budget matters: prefer direct small edits over parallel agents; batch requests.

## Open items
- Laptop JARVIS security fixes are NOT installed. A draft was written against the 07:25 Oct 21 files, but the laptop files changed a lot later that day (other sessions: instant commands, app packs, speed pass), so redo them against the current laptop files if wanted (open_app allow-list, one confirm gate incl. Enter/keys/click_xy, NO_PAY on actions, pending confirm 60 s expiry with exact "confirm", no auto-run VBA, phone/voice event tagging, cancel checks, TTS lock, main-loop try/except). Installed already: web_agent.py NO_PAY in code, installer pinning, launcher port check.
- CSP still allows 'unsafe-inline' (escaping fixes closed the known holes; moving to hashes is the remaining hardening).
- Restaurant components missing for Subway, Cava, Moe's, Jersey Mike's, Firehouse, Starbucks, Blaze, VT Dining (JS-only/blocked sites). Owner said leave them.
- Injury log and project picker shipped with light testing only (save path verified); header jitter fix verified on Today only.
- E2E: owner reset with "Start fresh"; laptop must enter the same new passphrase.
