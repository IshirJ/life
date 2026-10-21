
/* ===================== end-to-end encryption for everything this app sends to your server =====================
   Your sync passphrase never leaves the device. From it (plus your server's address as salt) each device
   derives the same AES-256-GCM key with PBKDF2-SHA256 (600,000 rounds). Synced data, notebooks and server
   backups are compressed, then encrypted here; the server only ever stores {e2e,iv,ct}.
   The key itself is kept as a NON-extractable CryptoKey in IndexedDB ('life-keys' / 'k' / 'e2e'), so page
   script can use it but can never read its bytes back out. The service worker uses the same stored key to
   decrypt notification text. */
const E2E={key:null,on:false};
const e2eB64=b=>{let s='';const u=b instanceof Uint8Array?b:new Uint8Array(b);for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)};
const e2eUnb64=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
/* tiny IndexedDB key store */
const KEYDB={p:null,
  open(){return this.p||(this.p=new Promise((res,rej)=>{if(!window.indexedDB)return rej(new Error('no idb'));const r=indexedDB.open('life-keys',1);
    r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('k'))r.result.createObjectStore('k')};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}).catch(e=>{this.p=null;throw e}))},
  tx(mode,fn){return this.open().then(d=>new Promise((res,rej)=>{const t=d.transaction('k',mode),r=fn(t.objectStore('k'));t.oncomplete=()=>res(r&&r.result);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)}))},
  get(k){return this.tx('readonly',s=>s.get(k))},
  put(k,v){return this.tx('readwrite',s=>s.put(v,k))},
  del(k){return this.tx('readwrite',s=>s.delete(k))}
};
const e2eImport=raw=>crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']);
async function e2eDerive(pass,server){
  const enc=new TextEncoder(),salt=await crypto.subtle.digest('SHA-256',enc.encode('life-e2e-v1:'+String(server||'').replace(/\/+$/,'').toLowerCase()));
  const base=await crypto.subtle.importKey('raw',enc.encode(pass.normalize('NFKC')),'PBKDF2',false,['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:600000},base,256));
}
/* activate a key for this session only (nothing is stored) - use it to TRY a passphrase */
async function e2eUse(raw){E2E.key=await e2eImport(raw);E2E.on=true}
/* store a verified key on this device and activate it. Call only after the passphrase has been checked. */
async function e2eSetKey(raw){
  const k=await e2eImport(raw);let stored=false;
  try{await KEYDB.put('e2e',k);stored=!!(await KEYDB.get('e2e'))}catch(e){}
  if(stored){try{localStorage.removeItem('ishiros.e2e')}catch(e){}}
  else{try{localStorage.setItem('ishiros.e2e',e2eB64(raw))}catch(e){}}   /* no IndexedDB here (very old browser / private mode): keep the old way so sync still works */
  E2E.key=k;E2E.on=true;return true}
async function e2eForget(){
  E2E.key=null;E2E.on=false;try{localStorage.removeItem('ishiros.e2e')}catch(e){}
  try{await KEYDB.del('e2e')}catch(e){}
  try{if(typeof meta!=='undefined'){delete meta.srvE2E;saveMeta()}}catch(e){}}
/* load the key at start; silently move an old raw key from localStorage into IndexedDB */
async function e2eLoad(){
  try{const k=await KEYDB.get('e2e');if(k){E2E.key=k;E2E.on=true}}catch(e){}
  let s=null;try{s=localStorage.getItem('ishiros.e2e')}catch(e){}
  if(!s)return;
  /* a raw key in localStorage was written more recently than anything in IndexedDB (older app code writes it there): it wins */
  try{const raw=e2eUnb64(s);if(raw.length!==32)return;await e2eSetKey(raw)}catch(e){try{if(!E2E.key)await e2eUse(e2eUnb64(s))}catch(x){}}
}
const E2E_READY=e2eLoad().catch(()=>{});
async function e2eZip(bytes,dir){
  if(dir?typeof CompressionStream==='undefined':typeof DecompressionStream==='undefined')return null;
  const s=new Blob([bytes]).stream().pipeThrough(dir?new CompressionStream('gzip'):new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(s).arrayBuffer())}
async function e2eSeal(obj){
  if(!E2E.key)throw new Error('No sync passphrase on this device');
  let data=new TextEncoder().encode(JSON.stringify(obj)),z=0;
  /* compress when the browser can; older iOS (before 16.4) writes uncompressed data that every device can read */
  try{const c=await e2eZip(data,true);if(c){data=c;z=1}}catch(e){}
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},E2E.key,data);
  return{e2e:1,v:1,z,iv:e2eB64(iv),ct:e2eB64(ct)}}
const e2eErr=(msg,code)=>{const e=new Error(msg);e.code=code;return e};
async function e2eOpen(box){
  if(!E2E.key)throw e2eErr('Enter your sync passphrase first','nokey');
  let data;try{data=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:e2eUnb64(box.iv),},E2E.key,e2eUnb64(box.ct)))}
  catch(e){throw e2eErr('Wrong sync passphrase for this data','key')}
  if(box.z){
    if(typeof DecompressionStream==='undefined')throw e2eErr('This browser is too old to read your synced data. Update to iOS 16.4 or newer (or open Life in a newer browser).','old');
    data=await e2eZip(data,false)}
  try{return JSON.parse(new TextDecoder().decode(data))}catch(e){throw e2eErr('Synced data is damaged (it decrypted but isn’t valid)','bad')}}
/* small helpers for one-off fields (notification text): AES-GCM over JSON, no compression */
async function e2eSealSmall(obj){const iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},E2E.key,new TextEncoder().encode(JSON.stringify(obj)));return{iv:e2eB64(iv),ct:e2eB64(ct)}}
