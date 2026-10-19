/* Offline cache for the app itself only. Your entries live in this phone's storage and are never put in this cache. */
const VERSION='life-v17';
const SHELL=['./','./index.html','./foods.txt','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
const CDN=['https://cdn.jsdelivr.net/','https://fonts.googleapis.com/','https://fonts.gstatic.com/'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  const sameApp=url.origin===location.origin&&url.pathname.startsWith(new URL('./',self.registration.scope).pathname);
  if(sameApp){
    /* app files: try the network first so updates arrive, fall back to the cache when offline */
    e.respondWith(fetch(req).then(r=>{if(r.ok){const c=r.clone();caches.open(VERSION).then(x=>x.put(req,c))}return r}).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html'))));
    return;
  }
  if(CDN.some(p=>req.url.startsWith(p))){
    /* fonts and pinned libraries never change: cache first */
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(n=>{if(n.ok){const c=n.clone();caches.open(VERSION).then(x=>x.put(req,c))}return n})));
  }
  /* everything else (food lookups) goes straight to the network and is never cached */
});
