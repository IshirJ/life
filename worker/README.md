# life-sync

Single-user Cloudflare Worker behind the Life app (https://ishirj.github.io/life/): push notifications,
calendars (ICS / Outlook), Outlook + Gmail unread mail, health (Apple Health via Shortcut, Fitbit via
Google Health API), widget summary and backups. Everything runs on Cloudflare's free tier and deploys
from GitHub Actions, so no Mac or local CLI is needed.

<a id="deploy"></a>

## 1. Deploy (once)

1. Create a free Cloudflare account at https://dash.cloudflare.com.
2. Open **Workers & Pages** once and pick a **workers.dev subdomain** (e.g. `ishir`).
3. **My Profile → API Tokens → Create Token** → template **Edit Cloudflare Workers** → add permission
   **Account · Workers KV Storage · Edit** → choose your account → Create. Copy the token.
4. Copy your **Account ID** (Workers & Pages overview, right-hand side).
5. In the GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**:
   - `CLOUDFLARE_API_TOKEN` = the token
   - `CLOUDFLARE_ACCOUNT_ID` = the account id
6. **Actions → Deploy life-sync worker → Run workflow**. It runs the tests, creates the KV namespace
   `life-sync-LIFE` if needed, deploys, and prints the URL (`https://life-sync.<subdomain>.workers.dev`)
   in the run summary. Later pushes that touch `worker/**` redeploy automatically.
7. In the Life app: Settings → Sync → paste the URL → **Pair**. Pairing works once; the key is stored in
   the app. Copy it from there for the Gmail script, the Shortcut and the widget below.

Lost the key? Delete the `key` entry in the KV namespace (Cloudflare dashboard → Storage → KV) and pair again.

<a id="outlook"></a>

## 2. Outlook mail + calendar (Microsoft Graph)

1. https://portal.azure.com → **Microsoft Entra ID → App registrations → New registration**.
   - Name: `Life`
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI: platform **Web**, `https://life-sync.<subdomain>.workers.dev/oauth/ms/callback`
2. **Certificates & secrets → New client secret** → copy the *Value* (not the ID).
3. **API permissions → Add → Microsoft Graph → Delegated**: `Mail.Read`, `Calendars.Read`,
   `offline_access`, `User.Read`.
4. In the Life app, enter the Application (client) ID and secret (sent via `PUT /config`), then tap
   **Connect Outlook**. A university tenant may require admin consent; if so set tenant to
   `consumers` for a personal account or ask IT.

<a id="fitbit"></a>

## 3. Fitbit via Google Health API

1. https://console.cloud.google.com → new project `Life` → **APIs & Services → Library** → enable
   **Google Health API**.
2. **OAuth consent screen**: User type **External**, publishing status **Testing**, add yourself under
   **Test users**. Add the three `googlehealth.*.readonly` scopes (activity_and_fitness, sleep,
   health_metrics_and_measurements).
3. **Credentials → Create credentials → OAuth client ID → Web application**. Authorized redirect URI:
   `https://life-sync.<subdomain>.workers.dev/oauth/google/callback`.
4. Enter client ID/secret in the Life app and tap **Connect Fitbit**.
5. In Testing mode Google expires refresh tokens after **7 days**. When that happens `/health` returns
   `errors:[{source:'google', code:'reauth'}]` and the app should prompt you to reconnect.

<a id="gmail"></a>

## 4. Gmail (Apps Script)

Open `apps-script/Gmail.gs` and follow the numbered steps at the top: paste it into a new project at
https://script.google.com, set `WORKER_URL` and `LIFE_KEY`, run `setup` once. It pushes your top 15
unread inbox threads every 15 minutes.

<a id="apple-health"></a>

## 5. Apple Health / MacroFactor (iOS Shortcut)

MacroFactor writes nutrition and weight into Apple Health; a Shortcut forwards a daily summary.
In **Shortcuts → +** add these actions:

1. **Find Health Samples** where Type is **Steps**, Start Date is **today**; Group by **Day**, Fill missing
   **off**; then **Calculate Statistics → Sum** (or set the Find action's *Sort/limit* and use Sum). Rename
   the result `Steps`.
2. Repeat for **Dietary Energy** (`Kcal`), **Protein** (`Protein`), **Carbohydrates** (`Carbs`),
   **Total Fat** (`Fat`), **Active Energy** (`Active`) — each with Sum for today.
3. **Find Health Samples** Type **Weight**, sorted by **End Date, Latest first**, Limit **1** → `Weight`
   (in lb; if your Health unit is kg send it as `weightKg`).
4. **Find Health Samples** Type **Sleep Analysis**, Start Date is in the last **1 day**, value **Asleep**;
   **Calculate Statistics → Sum** of Duration (minutes) → `Sleep`. (Or send `sleepHours`.)
5. **Find Health Samples** Type **Resting Heart Rate**, latest 1 → `RHR`.
6. **Dictionary** with keys: `date` (Current Date formatted `yyyy-MM-dd`), `steps`, `kcal`, `protein`,
   `carbs`, `fat`, `activeKcal`, `weightLb`, `sleepMin`, `restingHr` → the variables above.
7. **Get Contents of URL**: `https://life-sync.<subdomain>.workers.dev/ingest/health`, Method **POST**,
   Headers `X-Life-Key: <your key>`, Request Body **JSON** → the Dictionary (or add each key directly).

Then **Automation → + → Time of Day → 9:00 PM, Daily → Run Immediately** and pick the Shortcut. Values may be
numbers or text ("2,345", lists of samples are summed; weight uses the last value).

<a id="widget"></a>

## 6. Home-screen widget (Scriptable)

Install **Scriptable**, create a script, paste `scriptable/LifeWidget.js`, set `WORKER_URL` and
`LIFE_KEY`, then add a Scriptable widget (small/medium/large) and pick the script. The Life app keeps
the summary fresh with `PUT /widget`.

<a id="food"></a>

## 7. Food search (optional key)

`GET /food/search?q=<text>&page=1` searches USDA FoodData Central and Open Food Facts together.
It works out of the box with USDA's shared `DEMO_KEY`, but that is limited to roughly 30 requests/hour
(when exceeded, results still come from Open Food Facts and `errors` contains `{source:'usda', code:'rate'}`).

1. Get a free key at https://fdc.nal.usda.gov/api-key-signup (instant, emailed).
2. Paste it in **Life → Settings → Connections → Food search** (stored as `fdcKey` via `PUT /config`;
   masked in `GET /config`).

## Development

```
cd worker
npm install
npm test                                   # node:test suite (mocked KV / fetch)
npx wrangler deploy --dry-run --outdir dist # bundle check
npx wrangler dev --local --test-scheduled   # local run; GET /__scheduled triggers the cron
```

Free-tier notes: the per-minute cron only writes KV when it actually sent a notification; remote data
(ICS feeds, Google Health, access tokens) is cached in memory and the Cache API, never in KV.
On `*.workers.dev` the Cache API may be a no-op, in which case caching is per-isolate memory only.
