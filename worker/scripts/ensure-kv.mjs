// CI helper: find (or create) the KV namespace "life-sync-LIFE" and write its id into wrangler.toml.
// Needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in the environment.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const TITLE = 'life-sync-LIFE';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const wrangler = join(root, 'node_modules', '.bin', 'wrangler');
// Run wrangler outside the project so `create` can never edit our wrangler.toml.
const cwd = mkdtempSync(join(tmpdir(), 'kv-'));

function run(args) {
  try {
    return execFileSync(wrangler, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    throw new Error(`wrangler ${args.join(' ')} failed:\n${(e.stdout || '').slice(-1500)}\n${(e.stderr || '').slice(-1500)}`);
  }
}
// GitHub shows ::error:: lines as annotations on the run page
const annotate = (m) => console.log('::error::' + String(m).replace(/%/g, '%25').replace(/\r?\n/g, '%0A'));
process.on('uncaughtException', (e) => { annotate(e.message || e); process.exit(1); });

function list() {
  const out = run(['kv', 'namespace', 'list']);
  const start = out.search(/^\s*\[/m); // skip any banner/warning lines
  if (start < 0) throw new Error(`unexpected output from kv namespace list:\n${out}`);
  return JSON.parse(out.slice(start));
}

const find = (all) => all.find((n) => n.title === TITLE) || all.find((n) => n.title.endsWith(TITLE));

let ns = find(list());
if (!ns) {
  console.log(`Creating KV namespace ${TITLE}`);
  run(['kv', 'namespace', 'create', TITLE]);
  ns = find(list());
}
if (!ns) throw new Error(`could not find or create KV namespace ${TITLE}`);
console.log(`KV namespace ${ns.title}: ${ns.id}`);

const tomlPath = join(root, 'wrangler.toml');
const toml = readFileSync(tomlPath, 'utf8');
if (toml.includes('__KV_ID__')) writeFileSync(tomlPath, toml.replace('__KV_ID__', ns.id));
else if (!toml.includes(ns.id)) throw new Error('wrangler.toml has no __KV_ID__ placeholder');
