/* Offline cache for the app itself only. Your entries live in this phone's storage and are never put in this cache. */
const VERSION='life-v167';
const SHELL=['./','./index.html','./foods.txt','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./notes.js','./pf.js','./exercises.json','./pdfjs/pdf.min.mjs','./pdfjs/pdf.worker.min.mjs'];
const CDN=['https://images.unsplash.com/','https://cdn.jsdelivr.net/','https://fonts.googleapis.com/','https://fonts.gstatic.com/'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION&&k!=='life-cdn').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  const sameApp=url.origin===location.origin&&url.pathname.startsWith(new URL('./',self.registration.scope).pathname);
  if(sameApp){
    /* app files: try the network first so updates arrive, fall back to the cache when offline */
    const net=fetch(req,{cache:'no-cache'}).then(r=>{if(r.ok){const c=r.clone();caches.open(VERSION).then(x=>x.put(req,c))}return r});
    if(req.mode==='navigate'){
      /* open instantly from the saved copy (no blank white screen while 650 KB downloads); the new version is saved for next launch */
      e.respondWith(caches.match(req).then(r=>r||caches.match('./index.html')).then(r=>{if(r){e.waitUntil(net.catch(()=>{}));return r}return net}).catch(()=>net));
      return;
    }
    e.respondWith(net.catch(()=>caches.match(req).then(r=>r||caches.match('./index.html'))));
    return;
  }
  if(CDN.some(p=>req.url.startsWith(p))){
    /* fonts and pinned libraries never change: cache first */
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(n=>{if(n.ok||n.type==='opaque'){const c=n.clone();caches.open('life-cdn').then(x=>x.put(req,c))}return n})));
  }
  /* everything else (food lookups) goes straight to the network and is never cached */
});

/* notifications from your Life server */
self.addEventListener('push',e=>{
  let d={};try{d=e.data?e.data.json():{}}catch(x){d={title:'Life',body:e.data?e.data.text():''}}
  e.waitUntil(self.registration.showNotification(d.title||'Life',{body:d.body||'',tag:d.tag||undefined,icon:'./icon-192.png',badge:'./icon-192.png',data:{url:d.url||'./'}}));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();const url=(e.notification.data&&e.notification.data.url)||'./';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if('focus' in c){c.navigate&&c.navigate(url).catch(()=>{});return c.focus()}}return self.clients.openWindow(url)}));
});
