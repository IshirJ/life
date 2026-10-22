/* Offline cache for the app itself only. Your entries live in this phone's storage and are never put in this cache. */
const VERSION='life-v193';
const SHELL=['./','./index.html','./foods.txt','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./notes.js','./pf.js','./exercises.json','./pdfjs/pdf.min.mjs','./pdfjs/pdf.worker.min.mjs'];
const CDN=['https://images.unsplash.com/','https://cdn.jsdelivr.net/','https://fonts.googleapis.com/','https://fonts.gstatic.com/'];
const CDN_MAX=80;
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION&&k!=='life-cdn').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
/* cache app files under their address without ?v=… so old versions don't pile up */
const bare=u=>{const x=new URL(u);x.search='';x.hash='';return x.href};
async function trimCdn(){try{const c=await caches.open('life-cdn'),ks=await c.keys();for(const k of ks.slice(0,Math.max(0,ks.length-CDN_MAX)))await c.delete(k)}catch(e){}}
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  const sameApp=url.origin===location.origin&&url.pathname.startsWith(new URL('./',self.registration.scope).pathname);
  if(sameApp){
    /* app files: try the network first so updates arrive, fall back to the cache when offline */
    const net=fetch(req,{cache:'no-cache'}).then(r=>{if(r.ok&&r.type==='basic'){const c=r.clone();caches.open(VERSION).then(x=>x.put(bare(req.url),c))}return r});
    if(req.mode==='navigate'){
      /* open instantly from the saved copy (no blank white screen while 650 KB downloads); the new version is saved for next launch */
      e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('./index.html')).then(r=>{if(r){e.waitUntil(net.catch(()=>{}));return r}return net}).catch(()=>net));
      return;
    }
    /* other files never fall back to index.html (a script that comes back as HTML breaks more than a clean failure) */
    e.respondWith(net.catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||Response.error())));
    return;
  }
  if(CDN.some(p=>req.url.startsWith(p))){
    /* fonts and pinned libraries never change: cache first. Only good answers are kept (an opaque answer could be an error, and
       each one costs megabytes of quota); the Google Fonts stylesheet is the one opaque file allowed, so text looks right offline */
    const okOpaque=url.hostname==='fonts.googleapis.com';
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(n=>{if(n.ok||(okOpaque&&n.type==='opaque')){const c=n.clone();e.waitUntil(caches.open('life-cdn').then(x=>x.put(req,c)).then(trimCdn))}return n})));
  }
  /* everything else (food lookups) goes straight to the network and is never cached */
});

/* the end-to-end key lives in IndexedDB as a non-extractable CryptoKey (written by the app) */
function e2eKey(){return new Promise(res=>{try{const r=indexedDB.open('life-keys',1);
  r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('k'))r.result.createObjectStore('k')};
  r.onerror=()=>res(null);r.onsuccess=()=>{try{const d=r.result,t=d.transaction('k','readonly'),q=t.objectStore('k').get('e2e');q.onsuccess=()=>{res(q.result||null);d.close()};q.onerror=()=>{res(null);d.close()}}catch(x){res(null)}}}catch(x){res(null)}})}
const unb64=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
async function openEnc(enc){try{const k=await e2eKey();if(!k||!enc||!enc.iv||!enc.ct)return null;
  const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(enc.iv)},k,unb64(enc.ct));const o=JSON.parse(new TextDecoder().decode(pt));
  return o&&typeof o==='object'?{title:String(o.title||'').slice(0,200),body:String(o.body||'').slice(0,500)}:null}catch(e){return null}}
/* only links inside this app are opened from a notification */
function safeUrl(u){try{const x=new URL(u||'./',self.registration.scope),s=new URL('./',self.registration.scope);return x.origin===s.origin&&x.pathname.startsWith(s.pathname)?x.href:s.href}catch(e){return new URL('./',self.registration.scope).href}}

/* notifications from your Life server */
self.addEventListener('push',e=>{
  let d={};try{d=e.data?e.data.json():{}}catch(x){d={title:'Life',body:e.data?e.data.text():''}}
  if(!d||typeof d!=='object')d={};
  e.waitUntil((async()=>{let title=d.title||'Life',body=d.body||'';
    if(d.enc){const o=await openEnc(d.enc);if(o&&o.title){title=o.title;body=o.body}}
    return self.registration.showNotification(String(title),{body:String(body),tag:d.tag?String(d.tag):undefined,icon:'./icon-192.png',badge:'./icon-192.png',data:{url:safeUrl(d.url)}})})());
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();const url=safeUrl(e.notification.data&&e.notification.data.url);
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if('focus' in c){c.navigate&&c.navigate(url).catch(()=>{});return c.focus()}}return self.clients.openWindow(url)}));
});
