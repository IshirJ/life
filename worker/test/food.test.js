import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeEnv, mockFetch, req } from './helpers.js';
import worker from '../src/index.js';
import { cacheClear as memClear } from '../src/util.js';
import { cleanName, cacheKeyFor, mapFdc } from '../src/food.js';

const cacheClear = () => { memClear(); globalThis.caches.default._store?.clear(); };
const call = (env, r) => worker.fetch(r, env);

async function paired() {
  const env = makeEnv();
  const { key } = await (await call(env, req('/pair', { method: 'POST' }))).json();
  return { env, key };
}

const nut = (nutrientNumber, value, unitName = 'G', nutrientId = 0) => ({ nutrientId, nutrientNumber, nutrientName: 'x', unitName, value });

const FDC_PAYLOAD = {
  foods: [
    { // branded, ALL CAPS, brand not in description
      fdcId: 111, description: 'GREEK YOGURT, PLAIN', dataType: 'Branded', brandOwner: 'Chobani, Inc.', brandName: 'CHOBANI',
      servingSize: 170, servingSizeUnit: 'GRM', householdServingFullText: '1 container',
      foodNutrients: [nut('208', 59, 'KCAL', 1008), nut('203', 10.2), nut('204', 0.4), nut('205', 3.6)],
    },
    { // generic, exact match
      fdcId: 222, description: 'Yogurt, Greek, plain, nonfat', dataType: 'SR Legacy',
      foodNutrients: [nut('208', 59, 'KCAL', 1008), nut('203', 10.19), nut('204', 0.39), nut('205', 3.64)],
    },
    { // Foundation, kJ only
      fdcId: 333, description: 'Greek yogurt', dataType: 'Foundation',
      foodNutrients: [nut('268', 418.4, 'kJ', 1062), nut('203', 9), nut('204', 5), nut('205', 4)],
    },
    { // Atwater only
      fdcId: 444, description: 'Greek yogurt, whole milk', dataType: 'Survey (FNDDS)',
      foodNutrients: [nut('958', 97.3, 'KCAL', 2048), nut('203', 9)],
    },
    { // no energy → skipped
      fdcId: 555, description: 'Greek yogurt mystery', dataType: 'Foundation', foodNutrients: [nut('203', 9)],
    },
    { // brand already in name; ml serving
      fdcId: 666, description: 'Fage Total 0% Greek Yogurt', dataType: 'Branded', brandName: 'Fage',
      servingSize: 150, servingSizeUnit: 'MLT', foodNutrients: [nut('208', 54, 'KCAL')],
    },
    { // oz serving → servingG null; no word match
      fdcId: 777, description: 'Smoothie with yoghurt', dataType: 'Branded', brandOwner: 'Acme',
      servingSize: 8, servingSizeUnit: 'OZ', foodNutrients: [nut('208', 80, 'KCAL')],
    },
  ],
};

const OFF_PAYLOAD = {
  products: [
    { code: '0001', product_name: 'Greek Yogurt Plain', brands: 'Chobani,Other', nutriments: { 'energy-kcal_100g': 59, proteins_100g: 10, fat_100g: 0.4, carbohydrates_100g: 3.6 }, serving_quantity: '170', serving_size: '170 g' },
    { code: '0002', product_name: 'Greek yogurt honey', brands: 'Brand X', nutriments: { energy_100g: 418.4, proteins_100g: 8 }, serving_quantity: 0 },
    { code: '0003', product_name: 'Chobani Greek Yogurt, Plain', brands: 'Chobani', nutriments: { 'energy-kcal_100g': 60 } }, // dup of USDA item
    { code: '0004', product_name: 'No energy', nutriments: {} },
  ],
};

function foodFetch({ usdaStatus = 200 } = {}) {
  return mockFetch((url) => {
    if (url.startsWith('https://api.nal.usda.gov/fdc/v1/foods/search')) {
      return usdaStatus === 200 ? Response.json(FDC_PAYLOAD) : Response.json({ error: { code: 'OVER_RATE_LIMIT' } }, { status: usdaStatus });
    }
    if (url.startsWith('https://world.openfoodfacts.org/cgi/search.pl')) return Response.json(OFF_PAYLOAD);
    return new Response('x', { status: 404 });
  });
}

test('food: cleanName title-cases mostly-uppercase text only', () => {
  assert.equal(cleanName('GREEK YOGURT, PLAIN'), 'Greek Yogurt, Plain');
  assert.equal(cleanName('CHEERIOS (MULTI-GRAIN)'), 'Cheerios (Multi-Grain)');
  assert.equal(cleanName('Yogurt, Greek, plain'), 'Yogurt, Greek, plain');
  assert.equal(cleanName('  KIND  bar '), 'KIND bar'); // 4/7 uppercase → untouched
});

test('food: auth required and q length validated', async () => {
  const { env, key } = await paired();
  assert.equal((await call(env, req('/food/search?q=yogurt'))).status, 401);
  const r = await call(env, req('/food/search?q=y', { key }));
  assert.equal(r.status, 400);
  assert.match((await r.json()).error, /at least 2/);
});

test('food: maps USDA + OFF, ranks, dedupes, kJ/Atwater fallbacks', async () => {
  cacheClear();
  const { env, key } = await paired();
  const f = foodFetch();
  try {
    const r = await call(env, req('/food/search?q=greek%20yogurt&page=2', { key }));
    assert.equal(r.status, 200);
    const { items, errors } = await r.json();
    assert.deepEqual(errors, []);

    const fdcCall = f.calls.find((c) => c.url.includes('api.nal.usda.gov'));
    const u = new URL(fdcCall.url);
    assert.equal(u.searchParams.get('api_key'), 'DEMO_KEY');
    assert.equal(u.searchParams.get('query'), 'greek yogurt');
    assert.equal(u.searchParams.get('pageNumber'), '2');
    assert.equal(u.searchParams.get('pageSize'), '40');
    assert.equal(u.searchParams.get('dataType'), 'Branded,Foundation,Survey (FNDDS),SR Legacy');
    const offCall = f.calls.find((c) => c.url.includes('openfoodfacts'));
    assert.equal(offCall.init.headers['User-Agent'], 'LifeApp/1.0 (personal use)');
    assert.equal(new URL(offCall.url).searchParams.get('page'), '2');

    const byId = Object.fromEntries(items.map((i) => [i.id, i]));
    assert.deepEqual(byId['fdc:111'], {
      id: 'fdc:111', name: 'Chobani Greek Yogurt, Plain', brand: 'Chobani',
      per100: { k: 59, p: 10.2, f: 0.4, c: 3.6 }, servingG: 170, servingText: '1 container', src: 'USDA branded',
    });
    assert.equal(byId['fdc:333'].per100.k, 100); // 418.4 kJ / 4.184
    assert.equal(byId['fdc:444'].per100.k, 97);  // Atwater 958
    assert.equal(byId['fdc:555'], undefined);    // no energy
    assert.equal(byId['fdc:666'].name, 'Fage Total 0% Greek Yogurt'); // brand not doubled
    assert.equal(byId['fdc:666'].servingG, 150); // ml ≈ g
    assert.equal(byId['fdc:777'].servingG, null);
    assert.equal(byId['fdc:222'].src, 'USDA');
    assert.equal(byId['off:0002'].per100.k, 100); // energy_100g kJ fallback
    assert.equal(byId['off:0002'].servingG, null);
    assert.equal(byId['off:0001'].brand, 'Chobani');
    assert.equal(byId['off:0001'].servingG, 170);
    assert.equal(byId['off:0004'], undefined);
    assert.equal(byId['off:0003'], undefined, 'deduped against USDA branded Chobani item');

    assert.deepEqual(items.map((i) => i.id), [
      'fdc:333',  // exact "Greek yogurt" (generic)
      'fdc:444',  // prefix, generic
      'off:0001', // prefix, OFF
      'off:0002', // prefix, OFF
      'fdc:222',  // all words match, generic
      'fdc:111',  // all words match, branded
      'fdc:666',  // all words match, branded
      'fdc:777',  // no word match
    ]);
  } finally { f.restore(); cacheClear(); }
});

test('food: USDA 429 → rate error but OFF results still returned', async () => {
  cacheClear();
  const { env, key } = await paired();
  const f = foodFetch({ usdaStatus: 429 });
  try {
    const { items, errors } = await (await call(env, req('/food/search?q=greek yogurt', { key }))).json();
    assert.equal(errors.length, 1);
    assert.equal(errors[0].source, 'usda');
    assert.equal(errors[0].code, 'rate');
    assert.ok(errors[0].message);
    assert.ok(items.length >= 3);
    assert.ok(items.every((i) => i.src === 'Open Food Facts'));
  } finally { f.restore(); cacheClear(); }
});

test('food: configured fdcKey used + masked; cache key excludes api key; responses cached', async () => {
  cacheClear();
  const { env, key } = await paired();
  let c = await (await call(env, req('/config', { method: 'PUT', key, body: { fdcKey: 'SECRETKEY123' } }))).json();
  assert.equal(c.fdcKey, '********');
  assert.equal(env.LIFE.json('config').fdcKey, 'SECRETKEY123');
  await call(env, req('/config', { method: 'PUT', key, body: { fdcKey: '********', tz: 'America/Chicago' } }));
  assert.equal(env.LIFE.json('config').fdcKey, 'SECRETKEY123');
  c = await (await call(env, req('/config', { key }))).json();
  assert.equal(c.fdcKey, '********');

  const f = foodFetch();
  try {
    await call(env, req('/food/search?q=greek yogurt', { key }));
    const fdcUrl = f.calls.find((x) => x.url.includes('api.nal.usda.gov')).url;
    assert.equal(new URL(fdcUrl).searchParams.get('api_key'), 'SECRETKEY123');
    assert.ok(!cacheKeyFor(fdcUrl).includes('SECRETKEY123'));
    assert.ok(!cacheKeyFor(fdcUrl).includes('api_key'));
    for (const k of globalThis.caches.default._store.keys()) assert.ok(!k.includes('SECRETKEY123'));

    // Second identical search is served from cache (no new upstream calls).
    const n = f.calls.length;
    const r = await (await call(env, req('/food/search?q=greek yogurt', { key }))).json();
    assert.equal(f.calls.length, n);
    assert.ok(r.items.length > 0);
  } finally { f.restore(); cacheClear(); }

  // Clearing the key falls back to DEMO_KEY.
  await call(env, req('/config', { method: 'PUT', key, body: { fdcKey: '' } }));
  assert.equal(env.LIFE.json('config').fdcKey, undefined);
});

test('food: mapFdc tolerates missing fields', () => {
  assert.deepEqual(mapFdc({}), []);
  const [it] = mapFdc({ foods: [{ fdcId: 1, description: 'Apple', dataType: 'Foundation', foodNutrients: [nut('', 52, 'KCAL', 1008)] }] });
  assert.deepEqual(it.per100, { k: 52, p: 0, f: 0, c: 0 });
  assert.equal(it.brand, null);
});
