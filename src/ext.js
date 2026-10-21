/* ===================== ext: backup · sync · food+ · weight trend · workouts · weekly review ===================== */
P.ext=P.cal;P.job=P.work;P.focus=P.today;
P.mail='<rect x="3.5" y="5.5" width="17" height="13" rx="3"/><path d="M4 7l8 6 8-6"/>';
P.star='<path d="M12 3.8l2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8z"/>';
P.bell=P.reminder;
P.cloud='<path d="M7 18.5h10.5a4 4 0 0 0 .4-8A6 6 0 0 0 6.4 9.2 4.7 4.7 0 0 0 7 18.5z"/>';
P.link='<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>';
P.review='<path d="M4 19V9M10 19V5M16 19v-7M21 19H3"/>';
P.play='<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>';
P.pause='<path d="M8.5 5.5v13M15.5 5.5v13"/>';
P.list='<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>';
P.search2=P.search;
P.activity='<path d="M3 12h4l2.5-6 5 12 2.5-6h4"/>';
P.copy='<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>';
const APP_URL=location.origin+location.pathname;
const META_K='ishiros.meta',SYNC_K='ishiros.sync';
const readJ=k=>{try{return JSON.parse(localStorage.getItem(k))||{}}catch(e){return{}}};
const meta=readJ(META_K),SYNC=readJ(SYNC_K);
function saveMeta(){try{localStorage.setItem(META_K,JSON.stringify(meta))}catch(e){}}
function saveSync(){try{localStorage.setItem(SYNC_K,JSON.stringify(SYNC))}catch(e){}}
const syncOn=()=>!!(SYNC.url&&SYNC.key);
const ago=ts=>{if(!ts)return'never';const m=Math.round((Date.now()-ts)/6e4);return m<2?'just now':m<60?`${m} min ago`:m<1440?`${Math.round(m/60)} h ago`:`${Math.round(m/1440)} d ago`};
function copyText(t){const done=()=>toast('Copied');if(navigator.clipboard)navigator.clipboard.writeText(t).then(done,()=>toast('Couldn’t copy'));else toast('Copy isn’t available here')}

/* ---------- storage safety ---------- */
let storageWarned=0,STORAGE_BAD=false;
/* a failed save leaves this screen and the stored copy different: say so until a save works again, and stop syncing meanwhile */
function storageFail(){STORAGE_BAD=true;
  if(!document.getElementById('storeBad')){const b=document.createElement('div');b.id='storeBad';b.setAttribute('role','alert');
    b.style.cssText='position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top,0px) + 8px);z-index:9999;padding:10px 14px;border-radius:12px;background:#B3261E;color:#fff;font:600 13px/1.35 system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.35)';
    b.textContent='Not saved: storage for Life is full. Your latest changes are only on screen. Save a backup (Settings → Backup), then delete old data.';document.body.appendChild(b)}
  if(Date.now()-storageWarned>6e4){storageWarned=Date.now();toast('Couldn’t save: phone storage for Life is full. Back up, then delete old data.')}}
function storageOk(){if(!STORAGE_BAD)return;STORAGE_BAD=false;const b=document.getElementById('storeBad');if(b)b.remove()}
function flushNow(){if(LOCK.key&&LOCK.timer){clearTimeout(LOCK.timer);LOCK.timer=null;LOCK.writeNow()}}
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist().catch(()=>{})}catch(e){}

/* daily snapshots on this phone (IndexedDB), last 14 days. They hold exactly what is in storage, so they stay encrypted when a passcode is on */
const SNAP={p:null,
  open(){return this.p||(this.p=new Promise((res,rej)=>{if(!window.indexedDB)return rej(new Error('no idb'));const r=indexedDB.open('life-snaps',1);r.onupgradeneeded=()=>r.result.createObjectStore('s',{keyPath:'day'});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}))},
  tx(mode,fn){return this.open().then(d=>new Promise((res,rej)=>{const t=d.transaction('s',mode),r=fn(t.objectStore('s'));t.oncomplete=()=>res(r&&r.result);t.onerror=()=>rej(t.error)}))},
  async list(){return((await this.tx('readonly',s=>s.getAll()))||[]).sort((a,b)=>b.day.localeCompare(a.day))},
  async put(){const raw=localStorage.getItem(KEY);if(!raw)return false;await this.tx('readwrite',s=>s.put({day:today(),ts:Date.now(),raw,n:db.entries.length,enc:raw.startsWith('{"enc"')}));
    const all=await this.list();for(const x of all.slice(14))await this.tx('readwrite',s=>s.delete(x.day));return true},
  get(day){return this.tx('readonly',s=>s.get(day))}
};
function dailySnap(){if(meta.snapDay===today())return;SNAP.put().then(ok=>{if(ok){meta.snapDay=today();saveMeta()}}).catch(()=>{})}

/* backup files: plain JSON, or the encrypted blob when a passcode is on */
function backupText(){return LOCK.key?(localStorage.getItem(KEY)||''):JSON.stringify(db)}
async function exportFile(){
  flushNow();await new Promise(r=>setTimeout(r,LOCK.key?300:0));
  let txt=backupText();
  /* notebooks ride along in the same file (not when a passcode is on: the file would no longer be fully encrypted) */
  if(!LOCK.key){try{const N=await loadNotes(),n=await N.exportAll();if(n.books.length){const o=JSON.parse(txt);o.notes=n;txt=JSON.stringify(o)}}catch(e){}}
  const name=`life-backup-${today()}.json`,f=new File([txt],name,{type:'application/json'});
  const ok=()=>{meta.lastFile=Date.now();delete meta.snoozeBk;saveMeta();DATA_VER++;toast('Backup saved');if(state.tab==='today')render(false)};
  if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],title:'Life backup'});ok();return}catch(e){if(e&&e.name==='AbortError')return}}
  const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);ok();
}
function restoreText(text,btn){
  let d;try{d=JSON.parse(text)}catch(e){toast('That file isn’t a Life backup');return}
  /* a server copy made with end-to-end encryption on: open it with this device's key first */
  if(d&&d.e2e&&!d.enc&&!Array.isArray(d.entries)){(async()=>{await E2E_READY;try{const o=await e2eOpen(d);restoreText(typeof o==='string'?o:JSON.stringify(o),btn)}catch(e){toast('Couldn’t open that copy: '+e.message)}})();return}
  if(d&&d.enc){arm(btn,'Tap again to restore (needs that backup’s passcode)',()=>{freezeStore();if(!lsWrite(KEY,text)){FROZEN=false;storageFail();return}markRestored();location.reload()});return}
  if(!d||!Array.isArray(d.entries)){toast('That file isn’t a Life backup');return}
  arm(btn,`Tap again to replace with ${d.entries.length} entries`,()=>{d.entries=cleanEntries(d.entries.filter(e=>e&&TYPES[e.type]&&e.id));db={entries:d.entries,lib:Array.isArray(d.lib)?d.lib:[],templates:Array.isArray(d.templates)?d.templates:[],settings:cleanSettings({...db.settings,...(d.settings||{})})};restampAll();save();applyLook();closeSheet();render(false);toast(`Restored ${db.entries.length} entries`);if(d.notes)loadNotes().then(N=>N.importAll(d.notes,false)).then(n=>{if(n)toast(`Restored ${n} notebook${n===1?'':'s'}`)}).catch(()=>{})});
}
function openBackup(){
  const bkDue=Date.now()-(meta.lastFile||0)>7*864e5;
  openSheet(`${sheetHead('Backup &amp; <em>restore</em>','settings')}
    <div class="pstats"><div><span class="cap">Files</span><b style="font-size:15px">${ago(meta.lastFile)}</b></div><div><span class="cap">Server</span><b style="font-size:15px">${syncOn()?ago(meta.lastCloud):'off'}</b></div><div><span class="cap">Snapshots</span><b style="font-size:15px" id="snapN">…</b></div></div>
    ${bkDue?'<div class="notice" style="margin-bottom:12px">Save a backup to Files at least once a week. Deleting Life from the Home Screen deletes everything in it.</div>':''}
    <div class="sh-actions" style="margin-top:0"><button class="primary" id="bkFile" style="flex:1">${ic('copy')}Save backup to Files</button></div>
    <div class="sh-actions" style="margin-top:8px"><label class="secondary" style="flex:1;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer">Restore from a file<input type="file" id="bkPick" accept="application/json,.json,text/plain,*/*" hidden></label></div><div id="bkPicked"></div>
    ${syncOn()?`<div class="cap" style="margin:18px 0 6px">Your server · automatic daily copy</div><div class="sh-actions" style="margin-top:0"><button class="secondary" id="bkCloud" style="flex:1">Back up now</button></div><div id="srvList"><p class="hint">Loading server copies…</p></div>`:`<p class="small">Connect your server in Settings → Connections and Life also backs up there automatically every day.</p>`}
    <div class="cap" style="margin:18px 0 6px">Daily snapshots on this phone</div><div id="snapList"><p class="hint">Loading…</p></div>
    <details style="margin-top:16px"><summary class="cap" style="cursor:pointer">Copy as text</summary>
    <label class="fld" for="exp" style="margin-top:10px"><span>Backup text · ${db.entries.length} entries</span><textarea id="exp" readonly rows="3">${esc(backupText())}</textarea></label>
    <div class="sh-actions"><button class="secondary" id="copyExp">Copy backup</button></div>
    <label class="fld" for="imp" style="margin-top:12px"><span>Paste a backup to restore</span><textarea id="imp" rows="3"></textarea></label>
    <div class="sh-actions"><button class="danger" id="doImp2" style="flex:1">Replace my data with this backup</button></div></details>`);
  if(syncOn())api('/backup/list').then(l=>{const el=$('#srvList');if(!el)return;
    el.innerHTML=(l&&l.length)?l.map(b=>`<div class="trow" style="cursor:default"><span>Server copy · ${esc(ago(b.ts))}<small>${esc(new Date(b.ts).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}))} · ${Math.max(1,Math.round(b.size/1024))} KB</small></span><button class="link" data-srvslot="${esc(b.slot)}">Restore</button></div>`).join(''):'<p class="hint">No server copies yet.</p>'}).catch(e=>{const el=$('#srvList');if(el)el.innerHTML='<p class="hint">Couldn’t reach your server.</p>'});
  SNAP.list().then(l=>{const el=$('#snapList');if(!el)return;$('#snapN').textContent=l.length;
    el.innerHTML=l.length?l.map(s=>`<div class="trow" style="cursor:default"><span>${esc(fmtLong(s.day))}<small>${s.n} entries${s.enc?' · encrypted':''} · ${ago(s.ts)}</small></span><button class="link" data-snap="${esc(s.day)}">Restore</button></div>`).join(''):'<p class="hint">The first snapshot is taken today.</p>'}).catch(()=>{const el=$('#snapList');if(el)el.innerHTML='<p class="hint">Snapshots aren’t available in this browser.</p>';const n=$('#snapN');if(n)n.textContent='—'});
}
async function cloudBackup(force){
  if(!syncOn()||isLocked()||(!force&&meta.cloudDay===today()))return;
  await E2E_READY;
  if(!force&&!db.entries.some(e=>!e.sample))return; /* a fresh/empty phone must never push over your real server copies */
  try{flushNow();await api('/backup',{method:'PUT',body:E2E.key?JSON.stringify(await e2eSeal(JSON.parse(backupText()))):backupText(),raw:true});meta.cloudDay=today();meta.lastCloud=Date.now();saveMeta();if(force)toast('Backed up to your server')}catch(e){if(force)toast('Server backup failed: '+e.message)}
}

/* ---------- server (Cloudflare Worker) client ---------- */
const myTZ=()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(e){return''}};
async function api(path,opt={}){
  /* nothing that changes the server goes out while the passcode screen is up (the data behind it is a blank placeholder) */
  if(opt.method&&opt.method!=='GET'&&isLocked())throw new Error('Locked');
  const h={'X-Life-Key':SYNC.key,...(opt.headers||{})};const tz=myTZ();if(tz)h['X-Life-TZ']=tz;if(opt.body&&!opt.raw)h['Content-Type']='application/json';if(opt.raw)h['Content-Type']='text/plain';
  const r=await fetch(SYNC.url.replace(/\/+$/,'')+path,{method:opt.method||'GET',body:opt.body,headers:h});
  if(!r.ok){let m=r.status+'';try{const j=await r.json();m=j.error||j.message||m}catch(e){}throw new Error(m)}
  const ct=r.headers.get('content-type')||'';return ct.includes('json')?r.json():r.text();
}
const SV={status:null};
async function refreshStatus(){if(!syncOn())return null;try{SV.status=await api('/status')}catch(e){SV.status={error:e.message}}
  /* a reinstalled phone forgets its switches: turn on what the server says is connected */
  const cn=SV.status&&SV.status.connections;if(cn){let ch=false;
    if(SYNC.healthOn===undefined&&(cn.googleHealth||cn.healthUpdated)){SYNC.healthOn=true;ch=true;setTimeout(()=>loadHealth(true),300)}
    if(SYNC.mailOn===undefined&&(cn.outlookMail||cn.gmailUpdated)){SYNC.mailOn=true;ch=true;setTimeout(()=>loadMail(true),600)}
    if(SYNC.widgetOn===undefined){SYNC.widgetOn=true;ch=true;setTimeout(()=>pushWidget(true),900)}
    if(ch){saveSync();DATA_VER++;render(false)}}
  const sc=SV.status&&SV.status.calendars;if(Array.isArray(sc)&&sc.length){const have=new Set((SYNC.cals||[]).map(c=>c.id)),add=sc.filter(c=>!have.has(c.id));
    if(add.length){SYNC.cals=[...(SYNC.cals||[]),...add];saveSync();try{loadExt(true)}catch(e){}}}
  return SV.status}
const b64uBytes=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return Uint8Array.from(atob(s),c=>c.charCodeAt(0))};

/* notifications: Life works out the exact times, your server sends them */
const NDEF={on:false,reminders:true,digestOn:true,digest:'08:00',classes:true,events:false,food:false,foodTime:'20:00',review:true,backup:true,habits:true,urgent:true};
const NS=()=>({...NDEF,...(SYNC.notif||{})});
async function enablePush(){
  if(!syncOn()){toast('Connect your server first');return false}
  if(!('Notification' in window)||!('serviceWorker' in navigator)||!('PushManager' in window)){toast('Open Life from the Home Screen icon (iOS 16.4 or newer) to turn on notifications');return false}
  const p=await Notification.requestPermission();if(p!=='granted'){toast('Notifications are off for Life in iPhone Settings → Notifications');return false}
  try{const reg=await navigator.serviceWorker.ready;const v=await (await fetch(SYNC.url.replace(/\/+$/,'')+'/vapid')).json();
    let sub=await reg.pushManager.getSubscription();
    if(sub&&meta.vapid&&meta.vapid!==v.publicKey){await sub.unsubscribe();sub=null}
    sub=sub||await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64uBytes(v.publicKey)});
    meta.vapid=v.publicKey;saveMeta();
    await api('/push/subscription',{method:'PUT',body:JSON.stringify({subscription:sub.toJSON()})});
    SYNC.notif={...NS(),on:true};saveSync();await pushSchedule(true);return true}
  catch(e){toast('Couldn’t turn on notifications: '+e.message);return false}
}
const atLocal=(d,t)=>new Date(`${d}T${t||'09:00'}:00`);
/* wall-clock time m minutes after midnight of day d (m may run past midnight into the next day); right on DST-change days too */
const atMin=(d,m)=>{const dd=m>=1440?shiftDays(d,Math.floor(m/1440)):d,r=m%1440;return atLocal(dd,`${pad(Math.floor(r/60))}:${pad(r%60)}`)};
function nextDow(dow,time){const x=new Date();for(let i=0;i<8;i++){const d=addDays(i),dt=atLocal(d,time);if(new Date(d+'T12:00').getDay()===dow&&dt>x)return dt}return null}
function buildSchedule(){
  const n=NS(),out=[],now=Date.now(),lim=now+7*864e5;
  const add=(id,dt,title,body,url)=>{if(!dt)return;const t=dt.getTime();if(t>now-6e4&&t<lim)out.push({id,at:dt.toISOString(),title,body:body||'',url:url||APP_URL,tag:id})};
  for(let i=0;i<7;i++){const d=addDays(i),wd=wdOf(d);
    if(n.reminders)of('reminder').filter(e=>!e.done&&e.due===d).forEach(e=>add('r:'+e.id,atLocal(d,e.time||'09:00'),e.title,'Reminder'));
    /* urgent reminders/tasks nag through the day (8 AM - 2 AM) until done: High every 90 min, Medium every 3 h */
    if(i<2&&n.urgent)of('reminder').concat(of('task')).filter(x=>!x.done&&+x.urg>=2&&x.due&&x.due<=d).forEach(x=>{const step=+x.urg===3?90:180;
      for(let m=8*60;m<26*60;m+=step){const t=atMin(d,m);add(`u:${x.id}:${d}:${m}`,t,(+x.urg===3?'🔴 ':'')+x.title,+x.urg===3?'High urgency · still not done':'Still to do')}});
    /* habit check-ins (8 AM - 2 AM): water ~every 50 min, creatine & vitamins every 3 h - they stop once ticked for the day */
    if(i<2&&n.habits&&typeof habits==='function')habits().forEach(h=>{const nm=(h.name||'').toLowerCase();
      const step=/water|hydrat/.test(nm)?50:/creatine|vitamin|supplement|multivit|omega|fish oil/.test(nm)?180:0;if(!step)return;
      if(typeof hCount==='function'&&hCount(h,d)>=(h.target||1))return;
      for(let m=8*60;m<26*60;m+=step){const t=atMin(d,m);add(`h:${h.id}:${d}:${m}`,t,/water|hydrat/.test(nm)?'Drink some water 💧':`Take your ${h.name}`,/water/.test(nm)?'Tap to log it in Life.':'Tick it off in Life when done.',APP_URL+'#today')}});
    if(n.digestOn){const due=[...of('task').filter(e=>!e.done&&e.due&&(e.due===d||(i===0&&e.due<d))),...extOn(d).filter(e=>e.allDay&&e.date===d&&!isExtDone(e))];
      if(due.length)add('dg:'+d,atLocal(d,n.digest),`${due.length} task${due.length>1?'s':''} due${i===0&&due.some(e=>e.due<d)?' or late':''}`,due.slice(0,3).map(e=>e.title).join(' · '))}
    if(n.classes){of('class').filter(e=>(e.days||[]).includes(wd)&&e.start).forEach(e=>add(`c:${e.id}:${d}`,new Date(atLocal(d,e.start)-6e5),e.title,`Starts ${fmtT(e.start)}${e.place?' · '+e.place:''}`));
      of('meeting').filter(e=>e.time&&meetingOn(e,d)).forEach(e=>add(`m:${e.id}:${d}`,new Date(atLocal(d,e.time)-6e5),e.title,`Meeting at ${fmtT(e.time)}${e.with?' · '+e.with:''}`))}
    if(n.events)extOn(d).filter(e=>!e.allDay&&e.start).forEach(e=>add(`x:${e.xid}`,new Date(atLocal(d,e.start)-6e5),e.title,`Starts ${fmtT(e.start)}${e.place?' · '+e.place:''}`));
    if(n.food&&!(i===0&&of('food').some(e=>e.date===d)))add('f:'+d,atLocal(d,n.foodTime),'Log today’s food','Nothing logged yet today.',APP_URL+'#log=food');
  }
  const f=FOCUS();if(f&&f.phase!=='ready'&&f.paused==null){const end=f.pStart+phaseLen(f,f.phase)*6e4;add('fc:'+f.id+':'+f.phase+':'+f.round,new Date(end),f.phase==='focus'?'Focus block done':'Break over',f.phase==='focus'?`Nice work on ${f.label}. Time for a break.`:`Back to ${f.label}.`)}
  of('job').filter(e=>e.next&&!['Offer','Rejected'].includes(e.stage)).forEach(e=>add(`j:${e.id}:${e.next}`,atLocal(e.next,'08:00'),`${e.stage==='Interview'?'Interview':'Job'}: ${e.title}`,`${e.role||''} · ${e.stage||''} today`.trim()));
  if(n.review)add('wr:'+today(),nextDow(0,'19:00'),'Your weekly review is ready','See what you ate, trained, finished and missed.',APP_URL+'#review');
  if(n.backup&&now-(meta.lastFile||0)>5*864e5)add('bk:'+today(),nextDow(0,'18:00'),'Back up Life','Save a backup to Files. It takes 5 seconds.',APP_URL+'#backup');
  return out.sort((a,b)=>a.at.localeCompare(b.at)).slice(0,300);
}
let schedT=null;
async function pushSchedule(force){
  if(!syncOn()||!NS().on||isLocked())return;   /* locked: the placeholder data would cancel every reminder on the server */
  await E2E_READY;
  const items=buildSchedule(),h=JSON.stringify(items)+(E2E.key?'|e2e':'');
  if(!force&&h===meta.schedHash&&meta.schedDay===today())return;
  try{
    /* with end-to-end encryption on, titles and text travel encrypted; only this app's service worker can read them */
    const out=E2E.key?await Promise.all(items.map(async it=>({id:it.id,at:it.at,tag:it.tag,url:it.url,title:'Life',body:'',enc:await e2eSealSmall({title:it.title,body:it.body})}))):items;
    await api('/schedule',{method:'PUT',body:JSON.stringify({items:out})});meta.schedHash=h;meta.schedDay=today();saveMeta()}catch(e){}
}
function queueSchedule(){clearTimeout(schedT);schedT=setTimeout(()=>pushSchedule(false),4000)}

/* ---------- caches of server data ----------
   With a passcode on, the calendar, mail and health caches are never written to storage unencrypted:
   they live in memory only, are wiped when Life locks, and are fetched again after you unlock. */
const BOOT_ENC=(()=>{try{return(localStorage.getItem(KEY)||'').startsWith('{"enc"')}catch(e){return false}})();
const passOn=()=>!!(LOCK.key||LOCKED_BLOB);
function cacheRead(k,def){if(BOOT_ENC){try{localStorage.removeItem(k)}catch(e){}return def}try{return JSON.parse(localStorage.getItem(k))||def}catch(e){return def}}
function cacheWrite(k,o){try{if(passOn()){localStorage.removeItem(k);return}localStorage.setItem(k,JSON.stringify(o))}catch(e){}}
const cleanExt=a=>(Array.isArray(a)?a:[]).filter(v=>v&&typeof v==='object').map(v=>ID_OK.test(String(v.id))?v:{...v,id:safeId(v.id)});
/* external calendars (Outlook / iCloud ICS feeds through your server) */
const CALC=(()=>{const c=cacheRead('ishiros.cache.cal',{ev:[],at:0});c.ev=cleanExt(c.ev);return c})();
function extOn(d){
  if(!syncOn())return[];
  const out=[];
  for(const v of CALC.ev||[]){
    const sd=(v.start||'').slice(0,10),ed=(v.end||v.start||'').slice(0,10);
    const ct=cleanExtTitle(v.title);
    if(v.allDay){if(d>=sd&&(d<ed||d===sd))out.push({id:'ext:'+v.id,xid:v.id,type:'ext',title:ct.title,course:ct.course,allDay:true,start:'',end:'',place:ct.course||v.location||'',cal:v.cal,date:d});continue}
    if(sd!==d)continue;
    out.push({id:'ext:'+v.id,xid:v.id,type:'ext',title:ct.title,course:ct.course,start:(v.start||'').slice(11,16),end:ed===d?(v.end||'').slice(11,16):'23:59',place:v.location||'',cal:v.cal,date:d});
  }
  return out;
}
async function loadExt(force){
  if(!syncOn()||!(SYNC.cals||[]).length)return;
  if(!force&&Date.now()-(CALC.at||0)<15*6e4)return;
  try{const r=await api(`/calendar?from=${addDays(-35)}&to=${addDays(70)}`);CALC.ev=cleanExt(r.events);CALC.err=r.errors||[];CALC.at=Date.now();
    cacheWrite('ishiros.cache.cal',CALC);
    DATA_VER++;if(state.tab==='plan'||state.tab==='today')render(false);queueSchedule()}catch(e){CALC.err=[{cal:'all',message:e.message}]}
}
function dayItems(d){
  const wd=wdOf(d);
  return[...of('class').filter(e=>(e.days||[]).includes(wd)).map(e=>[e.start||'',e]),
         ...of('meeting').filter(e=>meetingOn(e,d)).map(e=>[e.time||'',e]),
         ...extOn(d).map(e=>[e.allDay?'':e.start,e])].sort((a,b)=>a[0].localeCompare(b[0])).map(x=>x[1]);
}
function openExt(xid){
  const v=(CALC.ev||[]).find(x=>x.id===xid);if(!v)return;
  const cal=(SYNC.cals||[]).find(c=>c.id===v.cal);
  const when=v.allDay?`${fmtLong(v.start.slice(0,10))} · all day`:`${fmtLong(v.start.slice(0,10))} · ${fmtT(v.start.slice(11,16))}${v.end?'–'+fmtT(v.end.slice(11,16)):''}`;
  openSheet(`<div class="sh-h"><div class="lhs"><span class="cap">${esc(cal?cal.name:'Calendar')}</span></div><button type="button" class="x" data-close aria-label="Close">${ic('close')}</button></div>
    <div class="dhead">${tile('ext')}<div style="min-width:0"><h3>${esc(v.title||'(busy)')}</h3><div class="rs" style="white-space:normal;margin-top:4px">${esc(when)}</div></div></div>
    ${v.location?`<ul class="kv"><li><span class="cap">Where</span><b>${esc(v.location)}</b></li></ul>`:''}
    <p class="small">From your ${esc(cal?cal.name:'linked')} calendar. Edit it there; Life refreshes every 15 minutes.</p>`);
}
const _openDetail=openDetail;
openDetail=function(id){if(String(id).startsWith('ext:'))return openExt(String(id).slice(4));const e=find(id);if(e&&e.type==='workout'&&e.ex)return openWorkoutDetail(e);return _openDetail(id)};

/* email (Outlook via Microsoft Graph, Gmail via your Apps Script) */
const MAILC=cacheRead('ishiros.cache.mail',{items:[],at:0});
const httpsOnly=u=>/^https:\/\/[^\s]+$/i.test(String(u||''))?String(u):'#';
async function loadMail(force){
  if(!syncOn()||!(SYNC.mailOn))return;
  if(!force&&Date.now()-(MAILC.at||0)<10*6e4)return;
  try{const r=await api('/mail');const sig=JSON.stringify((r.items||[]).map(x=>x.id));const changed=sig!==JSON.stringify((MAILC.items||[]).map(x=>x.id));
    MAILC.items=r.items||[];MAILC.err=r.errors||[];MAILC.at=Date.now();cacheWrite('ishiros.cache.mail',MAILC);
    if(changed){DATA_VER++;if(state.tab==='today')render(false)}}catch(e){MAILC.err=[{source:'server',message:e.message}]}
}
function mailSection(){
  if(!syncOn()||!SYNC.mailOn)return'';
  const it=(MAILC.items||[]).slice(0,6);
  const rows=it.map(m=>`<li class="row mailrow"><span class="ico ${m.source==='gmail'?'k-gmail':'k-outlook'}">${ic('mail')}</span><a class="rowbtn" href="${esc(httpsOnly(m.link))}" target="_blank" rel="noopener noreferrer"><span class="rt">${esc(m.subject||'(no subject)')}</span><span class="rs">${esc((m.from||'').replace(/<.*>/,'').trim())} · ${esc(m.source==='gmail'?'Gmail':'Outlook')} · ${esc(relTime(m.date))}</span></a><button class="link" data-mailjob="${esc(m.id)}" aria-label="Add as job application">${ic('work')}</button><button class="link" data-mailtask="${esc(m.id)}" aria-label="Make a task">${ic('task')}</button></li>`).join('');
  return section('Unread <em>mail</em>',it.length?`<ul class="list card-s">${rows}</ul>`:emptyBox(MAILC.at?'Inbox zero. Nice.':'Checking your inbox…'),`<span class="cap num">${(MAILC.items||[]).length} unread</span>`);
}
const relTime=s=>{const t=new Date(s).getTime();if(!t)return'';const m=(Date.now()-t)/6e4;return m<60?`${Math.max(1,Math.round(m))}m`:m<1440?`${Math.round(m/60)}h`:fmtDate(iso(new Date(t)))};

/* health: Fitbit (Google Health API) + Apple Health (MacroFactor etc.) through your server */
const HC=cacheRead('ishiros.cache.health',{days:[],at:0});
const hday=d=>(HC.days||[]).find(x=>x.date===d)||null;
async function loadHealth(force){
  if(!syncOn()||!SYNC.healthOn)return;
  if(!force&&Date.now()-(HC.at||0)<4*6e4)return;
  if(HC.busy)return;HC.busy=true;setTimeout(()=>{HC.busy=false},20000);
  try{const r=await api('/health?days=30'+(force?'&fresh=1':''));HC.busy=false;HC.days=r.days||[];HC.err=r.errors||[];HC.sources=r.sources||{};HC.hr=r.latestHr||null;HC.at=Date.now();cacheWrite('ishiros.cache.health',HC);
    importHealth();DATA_VER++;if(['today','health'].includes(state.tab))render(false)}catch(e){HC.busy=false;HC.err=[{source:'server',message:e.message}];DATA_VER++;if(['today','health'].includes(state.tab))render(false)}
}
/* weigh-ins from Apple Health fill days you didn't weigh in by hand; MacroFactor daily totals become one food entry per day (optional) */
function importHealth(){
  if(isLocked())return;
  let ch=false;
  for(const d of HC.days||[]){
    if(SYNC.whImport!==false&&num(d.weightLb)>0&&!of('weight').some(e=>e.date===d.date&&!e.src)){
      const ex=of('weight').find(e=>e.date===d.date&&e.src==='health');const v=+num(d.weightLb).toFixed(1);
      if(!ex){db.entries.push({id:uid(),type:'weight',src:'health',value:v,date:d.date,created:Date.now()});ch=true}else if(num(ex.value)!==v){ex.value=v;ch=true}}
    if(SYNC.mfImport&&num(d.kcal)>0){
      const ex=of('food').find(e=>e.date===d.date&&e.src==='mf');const o={kcal:Math.round(num(d.kcal)),protein:+num(d.protein).toFixed(1),fat:+num(d.fat).toFixed(1),carbs:+num(d.carbs).toFixed(1)};
      if(!ex){db.entries.push({id:uid(),type:'food',src:'mf',title:'MacroFactor · day total',meal:'Snack',date:d.date,created:Date.now(),...o});ch=true}
      else if(ex.kcal!==o.kcal||ex.protein!==o.protein){Object.assign(ex,o);ch=true}}
  }
  if(ch)save();
}

/* widget summary for the Scriptable home-screen widget */
let widgetAt=0;
function nextUp(){const nowM=new Date().getHours()*60+new Date().getMinutes();
  for(const[d,lbl]of[[today(),'Today'],[addDays(1),'Tomorrow']]){const it=dayItems(d).find(e=>{const t=(e.type==='class'||e.type==='ext')?e.start:e.time;if(!t)return false;return d!==today()||toMin(t)>=nowM});
    if(it){const t=(it.type==='class'||it.type==='ext')?it.start:it.time;return{title:it.title,time:fmtT(t),day:lbl,place:it.place||''}}}return null}
function widgetSummary(){
  const td=today(),food=of('food').filter(e=>e.date===td),k=sumKcal(food),g=db.settings,h=hday(td);
  const due=of('task').filter(e=>!e.done&&e.due&&dayDiff(e.due)<=0).length+of('reminder').filter(e=>!e.done&&e.due&&dayDiff(e.due)<=0).length;
  const ws=weights(),tr=trendSeries(ws),last=tr[tr.length-1];
  const nx=nextUp(),nowM=new Date().getHours()*60+new Date().getMinutes(),evs=dayItems(td).filter(e=>{const t=(e.type==='class'||e.type==='ext')?e.start:e.time;return t&&toMin(t)>=nowM}).slice(0,4).map(e=>({title:e.title,time:(e.type==='class'||e.type==='ext')?e.start:e.time}));
  const urg=db.entries.filter(e=>(e.type==='task'||e.type==='reminder')&&!e.done&&+e.urg>=2).sort((a,b)=>(+b.urg-+a.urg)||String(a.due||'9').localeCompare(String(b.due||'9')))[0];
  return{busCfg:typeof busCfg==='function'?busCfg():undefined,urgent:urg?{title:urg.title,level:+urg.urg,due:urg.due||''}:null,name:firstName(),kcal:Math.round(k),kcalGoal:g.kcal,kcalLeft:Math.round(g.kcal-k),protein:Math.round(sumProt(food)),proteinGoal:g.protein,proteinTarget:g.protein,due,next:nx,nextEvent:nx?{title:nx.title,time:nx.day==='Today'?(evs[0]?evs[0].time:nx.time):nx.day+' '+nx.time}:null,events:evs,steps:h&&h.steps?Math.round(num(h.steps)):null,sleepMin:h&&h.sleepMin?Math.round(num(h.sleepMin)):null,weightTrend:last?+last.t.toFixed(1):null,updated:Date.now()};
}
async function pushWidget(force){
  if(!syncOn()||!SYNC.widgetOn||LOCKED_BLOB&&!LOCK.key)return;
  if(!force&&Date.now()-widgetAt<10*6e4)return;widgetAt=Date.now();
  try{await api('/widget',{method:'PUT',body:JSON.stringify({summary:widgetSummary()})})}catch(e){}
}

/* everything that should follow a change to your data */
function afterSave(){if(isLocked())return;try{stampSync()}catch(e){}queueSync();queueSchedule();if(meta.snapDay!==today())setTimeout(dailySnap,1500);if(Date.now()-widgetAt>10*6e4)setTimeout(()=>pushWidget(false),5000)}
function syncOnHide(){if(isLocked())return;pushWidget(true);pushSchedule(false)}
/* passcode hooks (called from the lock code) */
function onLockOn(){for(const k of CACHE_KEYS){try{localStorage.removeItem(k)}catch(e){}}
  let b=null;try{b=localStorage.getItem('ishiros.brief')}catch(e){}if(b!=null){(db._loc=db._loc||{})['ishiros.brief']=b;try{localStorage.removeItem('ishiros.brief')}catch(e){}save()}}
function onLockWipe(){CALC.ev=[];CALC.at=0;CALC.err=[];MAILC.items=[];MAILC.at=0;HC.days=[];HC.at=0;HC.hr=null;HC.sources={};for(const k of CACHE_KEYS){try{localStorage.removeItem(k)}catch(e){}}}
function onUnlock(){if(location.hash)setTimeout(()=>handleHash(),300);
  if(syncOn())setTimeout(()=>{refreshStatus();loadExt(true);loadMail(true);loadHealth(true);cloudBackup(false);pushSchedule(false)},300)}
let lastWake=Date.now();
function onWake(){
  if(Date.now()-lastWake>5*6e4){DATA_VER++;if(!$('#lock'))render(false)}
  lastWake=Date.now();dailySnap();adaptCheck();
  if(syncOn()&&!$('#lock')){loadExt();loadMail();loadHealth();cloudBackup(false);pushSchedule(false)}
}
addEventListener('pagehide',()=>{flushNow();syncOnHide()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){flushNow();syncOnHide()}else onWake()});
setInterval(()=>{if(!document.hidden)onWake()},10*6e4);

/* ---------- weight: trend line (exponential moving average) + real weekly rate ---------- */
function dailyWeights(ws){const m=new Map();for(const e of ws){const a=m.get(e.date)||[];a.push(num(e.value));m.set(e.date,a)}return[...m].sort((a,b)=>a[0].localeCompare(b[0])).map(([date,a])=>({date,value:a.reduce((s,v)=>s+v,0)/a.length}))}
/* trend_t = trend_(t-1) + α·(scale_t − trend_(t-1)),  α = 1 − 0.9^(days since last weigh-in)  → each day moves 10% toward the scale */
function trendSeries(ws){let t=null,prev=null;return dailyWeights(ws).map(e=>{const v=e.value,d=new Date(e.date+'T00:00').getTime();if(t===null)t=v;else{const dd=Math.max(1,Math.round((d-prev)/864e5));t=t+(1-Math.pow(.9,dd))*(v-t)}prev=d;return{date:e.date,v,t}})}
/* weekly rate = least-squares slope of the trend over the last 21 days × 7 */
function trendRate(tr){const cut=new Date(addDays(-21)+'T00:00').getTime(),p=tr.map(x=>({x:new Date(x.date+'T00:00').getTime()/864e5,y:x.t})).filter(q=>q.x*864e5>=cut);
  if(p.length<3||p[p.length-1].x-p[0].x<5)return null;const n=p.length,mx=p.reduce((s,q)=>s+q.x,0)/n,my=p.reduce((s,q)=>s+q.y,0)/n;
  const sxx=p.reduce((s,q)=>s+(q.x-mx)**2,0);return sxx?p.reduce((s,q)=>s+(q.x-mx)*(q.y-my),0)/sxx*7:null}
function weightDelta(ws){const r=trendRate(trendSeries(ws));if(r!==null)return r;const last=ws[ws.length-1],ref=[...ws].reverse().find(e=>e.date<=addDays(-7));return last&&ref?num(last.value)-num(ref.value):null}
function chart(ws,W=320,H=140){
  const tr=trendSeries(ws).slice(-45);
  if(tr.length<2)return`<p class="hint" style="margin-top:12px">Log two weigh-ins to see your trend.</p>`;
  const L=6,R=6,T=14,B=20,ts=tr.map(e=>new Date(e.date+'T00:00').getTime());
  const goal=db.settings.goalWeight===''?null:num(db.settings.goalWeight);
  const all=[...tr.map(e=>e.v),...tr.map(e=>e.t),...(goal&&Math.abs(goal-tr[tr.length-1].t)<15?[goal]:[])];
  let mn=Math.min(...all),mx=Math.max(...all);if(mx-mn<1){mn-=.5;mx+=.5}
  const t0=ts[0],t1=ts[ts.length-1],x=t=>L+(t1===t0?0:(t-t0)/(t1-t0))*(W-L-R),y=v=>T+(mx-v)/(mx-mn)*(H-T-B);
  const pts=tr.map((e,i)=>`${x(ts[i]).toFixed(1)},${y(e.t).toFixed(1)}`),ex=x(t1),ey=y(tr[tr.length-1].t);
  const grid=[0,.5,1].map(f=>{const yy=(T+f*(H-T-B)).toFixed(1);return`<line x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}" stroke="var(--line)" stroke-dasharray="2 5"/>`}).join('');
  const gl=goal&&goal>=mn&&goal<=mx?`<line x1="${L}" x2="${W-R}" y1="${y(goal).toFixed(1)}" y2="${y(goal).toFixed(1)}" stroke="var(--good)" stroke-width="1.5" stroke-dasharray="5 4"/><text x="${W-R}" y="${(y(goal)-5).toFixed(1)}" text-anchor="end" font-size="10" font-family="Space Mono, monospace" fill="var(--good)">GOAL ${goal}</text>`:'';
  return`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Trend weight from ${tr[0].t.toFixed(1)} to ${tr[tr.length-1].t.toFixed(1)} lb, scale weights shown as dots">
    <defs><linearGradient id="wg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".24"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
    ${grid}${gl}
    <path d="M${x(t0)},${H-B} L${pts.join(' L')} L${ex},${H-B} Z" fill="url(#wg)"/>
    ${tr.map((e,i)=>`<circle cx="${x(ts[i]).toFixed(1)}" cy="${y(e.v).toFixed(1)}" r="2.6" fill="var(--muted)" opacity=".75"/>`).join('')}
    <polyline class="line" points="${pts.join(' ')}" fill="none" stroke="var(--accent)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${ex}" cy="${ey}" r="6" fill="var(--surface)" stroke="var(--accent)" stroke-width="3"/>
    <text x="${L}" y="${H-4}" font-size="10" font-family="Space Mono, monospace" fill="var(--muted)">${esc(fmtDate(tr[0].date).toUpperCase())}</text>
    <text x="${W-R}" y="${H-4}" text-anchor="end" font-size="10" font-family="Space Mono, monospace" fill="var(--muted)">${esc(fmtDate(tr[tr.length-1].date).toUpperCase())}</text></svg>`;
}
function weightCard(){
  const ws=weights(),tr=trendSeries(ws),last=tr[tr.length-1],rate=trendRate(tr);
  const g=db.settings.goalWeight,eta=last&&g!==''&&rate&&Math.sign(num(g)-last.t)===Math.sign(rate)&&Math.abs(rate)>.05?Math.ceil(Math.abs(num(g)-last.t)/Math.abs(rate)):null;
  return`<section class="wcard card-s">
    <div class="wtop"><div><div class="cap">Trend weight</div><div class="wnum num">${last?last.t.toFixed(1):'—'}<small>LB</small></div>
      <div class="goal">${last?`Scale ${last.v.toFixed(1)} lb on ${esc(fmtDate(last.date))}`:'No weigh-ins yet'}${g!==''&&last?` · goal ${esc(g)}${eta?`, about ${eta} wk at this rate`:''}`:''}</div></div>${rate===null?'':deltaPill(rate)}</div>
    ${chart(ws)}
    <p class="small" style="margin:6px 0 0">Line = trend (each day moves 10% toward the scale, so water swings don’t mislead you). Dots = scale readings. Rate = trend slope over 21 days.</p>
  </section>`;
}

/* ---------- workouts: templates, sets × reps × weight, progress per exercise ---------- */
const tpls=()=>(db.templates=db.templates||[]);
const e1rm=(w,r)=>num(w)*(1+num(r)/30); /* Epley estimate of a one-rep max */
/* built once per data change, not once per row (the exercise picker asked for it ~90 times per keystroke) */
let EXH={v:-1,a:null,n:-1,m:null};
function exHistory(){
  if(EXH.m&&EXH.v===DATA_VER&&EXH.a===db.entries&&EXH.n===db.entries.length)return EXH.m;
  const m=exHistoryBuild();EXH={v:DATA_VER,a:db.entries,n:db.entries.length,m};return m}
function exHistoryBuild(){
  const m={};
  for(const e of of('workout').filter(x=>x.ex&&x.date).sort((a,b)=>a.date.localeCompare(b.date)))for(const x of e.ex){
    const sets=(x.sets||[]).filter(s=>num(s.r)>0);if(!sets.length)continue;
    const best=sets.reduce((b,s)=>e1rm(s.w,s.r)>e1rm(b.w,b.r)?s:b,sets[0]),vol=sets.reduce((t,s)=>t+num(s.r)*num(s.w),0);
    const k=x.name.trim().toLowerCase();(m[k]=m[k]||{name:x.name.trim(),pts:[]}).pts.push({date:e.date,id:e.id,best,est:e1rm(best.w,best.r),vol,sets})}
  return m;
}
const lastSets=name=>{const h=exHistory()[name.trim().toLowerCase()];return h?h.pts[h.pts.length-1].sets:null};
let WK=null;
function openWorkoutStart(){
  const t=tpls();
  openSheet(`${sheetHead('Start a <em>workout</em>')}
    <button class="navrow" data-wkstart="">${tile('workout')}<span class="t">Empty workout<small>Add exercises as you go</small></span>${ic('chev','i chev')}</button>
    ${t.length?`<div class="set-grp">Your templates</div>${t.map(x=>`<div class="tplrow"><button class="navrow" data-wkstart="${esc(x.id)}" style="flex:1">${tile('workout')}<span class="t">${esc(x.name)}<small>${esc(x.ex.map(e=>e.name).join(' · ')||'No exercises yet')}</small></span>${ic('chev','i chev')}</button><button class="ib sm" data-tpledit="${esc(x.id)}" aria-label="Edit ${esc(x.name)}">${ic('edit')}</button></div>`).join('')}`:''}
    <div class="sh-actions"><button class="secondary" data-tpledit="new" style="flex:1">${ic('plus')}New template</button><button class="secondary" data-add-simple="workout" style="flex:1">Quick log</button></div>
    <p class="small">Templates fill in your last weights for each exercise so you can beat them.</p>`);
}
function startWorkout(tplId,entryId){
  const e=entryId?find(entryId):null,t=tplId?tpls().find(x=>x.id===tplId):null;
  if(e)WK={mode:'log',id:e.id,title:e.title||'Workout',date:e.date||today(),minutes:e.minutes||'',notes:e.notes||'',ex:JSON.parse(JSON.stringify(e.ex||[]))};
  else WK={mode:'log',id:null,title:t?t.name:'Workout',date:today(),minutes:'',notes:'',started:Date.now(),
    ex:(t?t.ex:[]).map(x=>{const ls=lastSets(x.name);return{name:x.name,sets:Array.from({length:Math.max(1,num(x.sets)||3)},(_,i)=>({r:x.reps||'',w:ls&&ls[Math.min(i,ls.length-1)]?ls[Math.min(i,ls.length-1)].w:(x.weight||''),done:false}))}})};
  showWK();
}
function editTemplate(id){
  const t=id==='new'?null:tpls().find(x=>x.id===id);
  WK={mode:'tpl',id:t?t.id:null,title:t?t.name:'',ex:t?t.ex.map(x=>({name:x.name,sets:[{r:x.reps||'',w:x.weight||''}],n:x.sets||3})):[]};
  showWK();
}
function wkHTML(){
  const tpl=WK.mode==='tpl',names=Object.values(exHistory()).map(h=>h.name);
  const exs=WK.ex.map((x,i)=>{
    const h=exHistory()[x.name.trim().toLowerCase()],best=h?Math.max(...h.pts.map(p=>p.est)):0;
    const rows=tpl?`<div class="wkset tplset"><label>Sets<input type="number" inputmode="numeric" data-wkf="${i}.n" value="${esc(x.n||3)}"></label><label>Reps<input type="number" inputmode="numeric" data-wkf="${i}.0.r" value="${esc(x.sets[0].r)}"></label><label>lb<input type="number" inputmode="decimal" step="any" data-wkf="${i}.0.w" value="${esc(x.sets[0].w)}"></label></div>`
      :x.sets.map((s,j)=>`<div class="wkset${s.done?' done':''}"><span class="sn">${j+1}</span><label>Reps<input type="number" inputmode="numeric" data-wkf="${i}.${j}.r" value="${esc(s.r)}"></label><label>lb<input type="number" inputmode="decimal" step="any" data-wkf="${i}.${j}.w" value="${esc(s.w)}"></label><button class="tick" data-wkdone="${i}.${j}" aria-pressed="${!!s.done}" aria-label="Set ${j+1} done">${ic('check')}</button></div>`).join('')
        +`<div class="wkfoot"><button class="link" data-wkaddset="${i}">${ic('plus')}Set</button>${x.sets.length>1?`<button class="link" data-wkdelset="${i}">Remove last</button>`:''}${best?`<span class="cap">Best e1RM ${Math.round(best)}</span>`:''}</div>`;
    return`<div class="wkex card-s"><div class="wkh"><input class="wkname" data-wkf="${i}.name" value="${esc(x.name)}" placeholder="Exercise" list="exNames"><button class="x" data-wkrm="${i}" aria-label="Remove exercise">${ic('close')}</button></div>${rows}</div>`}).join('');
  return`${sheetHead(tpl?(WK.id?'Edit <em>template</em>':'New <em>template</em>'):(WK.id?'Edit <em>workout</em>':'<em>Workout</em>'))}
    <div class="fl"><div class="fl-body" id="wkBody">
    <label class="fld" for="wkTitle"><span>${tpl?'Template name':'Name'}</span><input id="wkTitle" value="${esc(WK.title)}" placeholder="${tpl?'e.g. Push day':'Workout'}"></label>
    ${tpl?'':`<div class="qa" style="grid-template-columns:repeat(2,minmax(0,1fr))"><label class="fld" for="wkDate"><span>Date</span><input id="wkDate" type="date" value="${esc(WK.date)}"></label><label class="fld" for="wkMin"><span>Minutes</span><input id="wkMin" type="number" inputmode="numeric" value="${esc(WK.minutes)}" placeholder="${WK.started?'auto':''}"></label></div>`}
    ${exs||'<p class="hint">Add your first exercise below.</p>'}
    <datalist id="exNames">${names.map(n=>`<option value="${esc(n)}">`).join('')}</datalist>
    <div class="sh-actions" style="margin-top:6px"><button class="secondary" id="wkAddEx" style="flex:1">${ic('plus')}Add exercise</button></div>
    ${tpl?'':`<label class="fld" for="wkNotes" style="margin-top:12px"><span>Notes</span><textarea id="wkNotes" rows="2">${esc(WK.notes)}</textarea></label>`}
    </div><div class="fl-bottom">${tpl?(WK.id?'<button class="danger" id="tplDel">Delete</button>':'<span style="flex:1"></span>'):`<button class="secondary" id="wkAsTpl">Save as template</button>`}<button class="primary" id="wkSave" style="flex:1">${tpl?'Save template':'Finish'}</button></div></div>`;
}
/* ===================== exercise library (free-exercise-db, public domain, 880+ exercises) ===================== */
let EXDB=null,EXP={q:'',m:'',eq:''};
const EXIMG='https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
function loadExDB(){if(EXDB)return Promise.resolve(EXDB);return fetch('exercises.json').then(r=>r.json()).then(a=>(EXDB=a.map(r=>({name:r[0],cat:r[1],eq:r[2],pm:r[3],sm:r[4],lvl:r[5],mech:r[6],how:r[7],img:r[8]}))))}
const EXGROUPS=[['','All'],['chest','Chest'],['back','Back'],['shoulders','Shoulders'],['arms','Arms'],['legs','Legs'],['core','Core'],['cardio','Cardio'],['stretch','Stretch']];
const EXEQ=[['','Any'],['barbell','Barbell'],['dumbbell','Dumbbell'],['machine','Machine'],['cable','Cable'],['body only','Bodyweight'],['kettlebells','Kettlebell'],['bands','Bands']];
const EXPOP=['Barbell Bench Press - Medium Grip','Barbell Squat','Barbell Deadlift','Romanian Deadlift','Pullups','Wide-Grip Lat Pulldown','Seated Cable Rows','Bent Over Barbell Row','Dumbbell Bench Press','Incline Dumbbell Press','Standing Military Press','Side Lateral Raise','Leg Press','Lying Leg Curls','Leg Extensions','Barbell Hip Thrust','Barbell Curl','Hammer Curls','Triceps Pushdown - Rope Attachment','Dips - Triceps Version','Face Pull','Cable Crossover','Bulgarian Split Squat','Plank','Hanging Leg Raise','Pushups'];
function exGroupOf(x){const m=(x.pm||'').split(',');
  if(x.cat==='cardio')return'cardio';if(x.cat==='stretching')return'stretch';
  if(m.includes('chest'))return'chest';if(m.some(v=>['lats','middle back','lower back','traps'].includes(v)))return'back';if(m.includes('shoulders')||m.includes('neck'))return'shoulders';
  if(m.some(v=>['biceps','triceps','forearms'].includes(v)))return'arms';if(m.some(v=>['quadriceps','hamstrings','glutes','calves','adductors','abductors'].includes(v)))return'legs';if(m.includes('abdominals'))return'core';return''}
const cap1=s=>(s||'').replace(/\b\w/g,c=>c.toUpperCase());
function openExPicker(){
  const body=$('#sheetBody');if(!body)return;
  body.innerHTML=`<div class="sh-h"><div class="lhs"><button class="back" id="exBack">${ic('chev','i chev')}Back</button></div><button type="button" class="x" data-close aria-label="Close">${ic('close')}</button></div>
    <h3 style="margin:-6px 0 12px">Add <em>exercise</em></h3>
    <div class="exsearch">${ic('search')}<input id="exQ" type="search" placeholder="Search 880+ exercises" autocomplete="off" value="${esc(EXP.q)}"></div>
    <div class="exchips" id="exM">${EXGROUPS.map(([k,l])=>`<button class="chip" data-exm="${k}" aria-pressed="${EXP.m===k}">${l}</button>`).join('')}</div>
    <div class="exchips" id="exE">${EXEQ.map(([k,l])=>`<button class="chip sm" data-exe="${k}" aria-pressed="${EXP.eq===k}">${l}</button>`).join('')}</div>
    <div id="exList"><p class="hint">Loading exercises…</p></div>`;
  anim(body,{x:[28,0],opacity:[.001,1]},{duration:.32});
  loadExDB().then(paintExList).catch(()=>{const l=$('#exList');if(l)l.innerHTML='<p class="hint">Couldn’t load the exercise library. You can still type a name.</p>'});
}
function paintExList(){
  const l=$('#exList');if(!l||!EXDB)return;const q=EXP.q.trim().toLowerCase(),toks=q.split(/\s+/).filter(Boolean);
  const hist=exHistory(),mine=Object.values(hist).map(h=>h.name);
  let res=EXDB.filter(x=>(!EXP.m||exGroupOf(x)===EXP.m)&&(!EXP.eq||x.eq===EXP.eq)&&toks.every(t=>(x.name+' '+x.pm+' '+x.eq).toLowerCase().includes(t)));
  const score=x=>{const n=x.name.toLowerCase();return(hist[n]?-3:0)+(EXPOP.includes(x.name)?-2:0)+(q&&n.startsWith(q)?-1:0)};
  res.sort((a,b)=>score(a)-score(b)||a.name.localeCompare(b.name));
  const custom=q&&!EXDB.some(x=>x.name.toLowerCase()===q)?`<button class="trow exrow" data-expick="${esc(EXP.q.trim())}"><span class="exi">${ic('plus')}</span><span class="exm"><b>Add “${esc(EXP.q.trim())}”</b><small>Your own exercise</small></span></button>`:'';
  const myOnly=!q&&!EXP.m&&!EXP.eq&&mine.length?`<div class="cap" style="margin:14px 0 6px">Your exercises</div>${mine.slice(0,12).map(n=>{const x=EXDB.find(e=>e.name.toLowerCase()===n.toLowerCase());return exRow(n,x,true)}).join('')}<div class="cap" style="margin:16px 0 6px">Popular</div>`:(!q&&!EXP.m&&!EXP.eq?'<div class="cap" style="margin:14px 0 6px">Popular</div>':`<div class="cap" style="margin:14px 0 6px">${res.length} exercise${res.length===1?'':'s'}</div>`);
  const shown=(!q&&!EXP.m&&!EXP.eq?res.filter(x=>EXPOP.includes(x.name)&&!mine.some(n=>n.toLowerCase()===x.name.toLowerCase())):res).slice(0,80);
  l.innerHTML=custom+myOnly+shown.map(x=>exRow(x.name,x)).join('')+(res.length>80&&(q||EXP.m||EXP.eq)?`<p class="hint">Showing 80 of ${res.length}. Narrow it down with a search.</p>`:'')+'<p class="small" style="margin-top:14px">Exercise library: free-exercise-db (public domain).</p>';
}
function exRow(name,x,mine){const g=x?exGroupOf(x):'';const ls=lastSets(name);
  return`<div class="trow exrow"><button class="exadd" data-expick="${esc(name)}"><span class="exi k-${g||'other'}">${esc((EXGROUPS.find(e=>e[0]===g)||['','•'])[1].slice(0,2))}</span><span class="exm"><b>${esc(name)}</b><small>${esc([x?cap1(x.pm.split(',')[0]):'',x?cap1(x.eq):'',ls?`last ${ls.map(s=>`${s.r}×${s.w||0}`).slice(0,3).join(', ')}`:''].filter(Boolean).join(' · '))}</small></span></button>${x?`<button class="exinfo" data-exinfo="${esc(name)}" aria-label="How to do ${esc(name)}">i</button>`:''}</div>`}
function openExInfo(name){
  const x=(EXDB||[]).find(e=>e.name===name);if(!x)return;
  const body=$('#sheetBody');body.innerHTML=`<div class="sh-h"><div class="lhs"><button class="back" id="exBack2">${ic('chev','i chev')}Back</button></div><button type="button" class="x" data-close aria-label="Close">${ic('close')}</button></div>
    <h3 style="margin:-6px 0 6px">${esc(x.name)}</h3><p class="small" style="margin:0 0 12px">${esc([cap1(x.pm),x.sm?`also ${x.sm}`:'',cap1(x.eq),cap1(x.lvl)].filter(Boolean).join(' · '))}</p>
    ${x.img?`<div class="eximg"><img src="${EXIMG+esc(x.img)}" alt="${esc(x.name)}" loading="lazy" data-imgfail="box"><img src="${EXIMG+esc(x.img.replace('/0.jpg','/1.jpg'))}" alt="" loading="lazy" data-imgfail="self"></div>`:''}
    <ol class="exhow">${x.how.split('\n').map(t=>t.trim()).filter(Boolean).map(t=>`<li>${esc(t)}</li>`).join('')}</ol>
    <div class="sh-actions"><button class="primary" data-expick="${esc(x.name)}" style="flex:1">${ic('plus')}Add to workout</button></div>`;
  anim(body,{x:[28,0],opacity:[.001,1]},{duration:.32});
}
document.addEventListener('click',e=>{
  const b=e.target.closest('#exBack,#exBack2,[data-exm],[data-exe],[data-expick],[data-exinfo]');if(!b||!$('#sheetBody').contains(b))return;
  e.stopImmediatePropagation();e.preventDefault();const d=b.dataset;
  if(b.id==='exBack'){NAV_DIR=-1;wkRefresh();return}
  if(b.id==='exBack2'){openExPicker();return}
  if(d.exm!==undefined){EXP.m=d.exm;$$('#exM .chip').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));paintExList();return}
  if(d.exe!==undefined){EXP.eq=d.exe;$$('#exE .chip').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));paintExList();return}
  if(d.exinfo){openExInfo(d.exinfo);return}
  if(d.expick){const name=d.expick,ls=lastSets(name);WK.ex.push({name,sets:ls?ls.map(s=>({r:s.r,w:s.w,done:false})):[{r:'',w:'',done:false},{r:'',w:'',done:false},{r:'',w:'',done:false}],n:ls?ls.length:3});EXP.q='';wkRefresh();setTimeout(()=>{const b2=$('#wkBody');if(b2)b2.scrollTop=b2.scrollHeight},40);toast(`${name} added`);return}
},true);
document.addEventListener('input',e=>{if(e.target.id!=='exQ')return;EXP.q=e.target.value;clearTimeout(EXP.t);EXP.t=setTimeout(paintExList,120)});
function showWK(){FORCE_MODE='m-bottom tall';const open=!wrap.hidden&&wrap.classList.contains('open');if(open)NAV_DIR=1;openSheet(wkHTML())}
function wkRefresh(){const b=$('#wkBody'),st=b?b.scrollTop:0;$('#sheetBody').innerHTML=wkHTML();const nb=$('#wkBody');if(nb)nb.scrollTop=st}
function wkCommitInputs(){const t=$('#wkTitle');if(t)WK.title=t.value;const d=$('#wkDate');if(d)WK.date=d.value;const m=$('#wkMin');if(m)WK.minutes=m.value;const n=$('#wkNotes');if(n)WK.notes=n.value}
function saveWK(asTpl){
  wkCommitInputs();
  const ex=WK.ex.map(x=>({...x,name:x.name.trim()})).filter(x=>x.name);
  if(WK.mode==='tpl'||asTpl){
    const name=(WK.title||'').trim();if(!name){toast('Name the template');return}
    const t={id:WK.mode==='tpl'&&WK.id?WK.id:uid(),name,ex:ex.map(x=>({name:x.name,sets:WK.mode==='tpl'?num(x.n)||3:x.sets.length,reps:x.sets[0]?x.sets[0].r:'',weight:x.sets[0]?x.sets[0].w:''}))};
    const i=tpls().findIndex(x=>x.id===t.id);if(i>=0)tpls()[i]=t;else tpls().push(t);save();toast(asTpl?'Saved as a template':'Template saved');if(!asTpl){NAV_DIR=-1;openWorkoutStart()}return}
  if(!ex.length&&!WK.minutes){toast('Add an exercise or minutes');return}
  const mins=num(WK.minutes)||(WK.started?Math.max(1,Math.round((Date.now()-WK.started)/6e4)):'');
  const o={title:(WK.title||'Workout').trim(),date:WK.date||today(),minutes:mins,notes:(WK.notes||'').trim(),ex:ex.map(x=>({name:x.name,sets:x.sets.filter(s=>num(s.r)>0||num(s.w)>0).map(s=>({r:num(s.r),w:num(s.w)}))}))};
  const prs=[];const hist=exHistory();
  for(const x of o.ex){const h=hist[x.name.toLowerCase()],prev=h?Math.max(...h.pts.filter(p=>p.id!==WK.id).map(p=>p.est),0):0;const b=Math.max(0,...x.sets.map(s=>e1rm(s.w,s.r)));if(prev&&b>prev+.01)prs.push(x.name)}
  if(WK.id){Object.assign(find(WK.id),o)}else db.entries.push({id:uid(),type:'workout',created:Date.now(),...o});
  save();closeSheet();render(false);tick();toast(prs.length?`New best: ${prs.slice(0,2).join(', ')}`:'Workout saved');WK=null;
}
/* broken exercise pictures remove themselves (a listener instead of inline onerror="", which the security policy should not need to allow) */
document.addEventListener('error',e=>{const t=e.target;if(!t||t.tagName!=='IMG'||!t.dataset||!t.dataset.imgfail)return;if(t.dataset.imgfail==='box'&&t.parentNode)t.parentNode.remove();else t.remove()},true);
function openWorkoutDetail(e){
  const vol=e.ex.reduce((t,x)=>t+x.sets.reduce((s,y)=>s+num(y.r)*num(y.w),0),0);
  openSheet(`<div class="sh-h"><div class="lhs"><span class="cap">Workout · ${esc(fmtLong(e.date))}</span></div><button type="button" class="x" data-close aria-label="Close">${ic('close')}</button></div>
    <div class="dhead">${tile('workout')}<div style="min-width:0"><h3>${esc(e.title||'Workout')}</h3><div class="rs" style="margin-top:4px">${e.minutes?`${e.minutes} min · `:''}${e.ex.length} exercise${e.ex.length===1?'':'s'} · ${fmtN(vol)} lb volume</div></div></div>
    ${e.ex.map(x=>`<div class="wkex card-s"><button class="wkh link" data-exprog="${esc(x.name)}" style="justify-content:space-between;width:100%"><b>${esc(x.name)}</b>${ic('chev','i chev r')}</button>${x.sets.map((s,j)=>`<div class="wkline"><span class="sn">${j+1}</span><span class="num">${s.r} × ${s.w||0} lb</span><span class="cap">e1RM ${Math.round(e1rm(s.w,s.r))}</span></div>`).join('')}</div>`).join('')}
    ${e.notes?`<div class="notes">${esc(e.notes)}</div>`:''}
    <div class="sh-actions"><button class="secondary" data-wkedit="${esc(e.id)}">${ic('edit')}Edit</button><button class="primary" data-wkagain="${esc(e.id)}">Do it again</button></div>`);
}
function openExProgress(name){
  const h=exHistory()[name.trim().toLowerCase()];if(!h){toast('No sets logged for this exercise yet');return}
  const p=h.pts.slice(-30),W=320,H=140,L=8,R=8,T=14,B=20,vs=p.map(x=>x.est);let mn=Math.min(...vs),mx=Math.max(...vs);if(mx-mn<5){mn-=2.5;mx+=2.5}
  const ts=p.map(x=>new Date(x.date+'T00:00').getTime()),t0=ts[0],t1=ts[ts.length-1],X=t=>L+(t1===t0?.5:(t-t0)/(t1-t0))*(W-L-R),Y=v=>T+(mx-v)/(mx-mn)*(H-T-B);
  const pts=p.map((x,i)=>`${X(ts[i]).toFixed(1)},${Y(x.est).toFixed(1)}`).join(' ');
  const best=p.reduce((b,x)=>x.est>b.est?x:b,p[0]);
  NAV_DIR=1;openSheet(`${sheetHead(esc(h.name),'')}
    <div class="pstats"><div><span class="cap">Best e1RM</span><b class="num">${Math.round(best.est)}</b></div><div><span class="cap">Top set</span><b class="num" style="font-size:16px">${best.best.r}×${best.best.w}</b></div><div><span class="cap">Sessions</span><b class="num">${h.pts.length}</b></div></div>
    ${p.length>1?`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Estimated one-rep max over time"><polyline class="line" points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>${p.map((x,i)=>`<circle cx="${X(ts[i]).toFixed(1)}" cy="${Y(x.est).toFixed(1)}" r="3.4" fill="var(--surface)" stroke="var(--accent)" stroke-width="2"/>`).join('')}<text x="${L}" y="${H-4}" font-size="10" font-family="Space Mono, monospace" fill="var(--muted)">${esc(fmtDate(p[0].date).toUpperCase())}</text><text x="${W-R}" y="${H-4}" text-anchor="end" font-size="10" font-family="Space Mono, monospace" fill="var(--muted)">${esc(fmtDate(p[p.length-1].date).toUpperCase())}</text></svg>`:'<p class="hint">Log this exercise again to see a progress line.</p>'}
    <p class="small">e1RM = weight × (1 + reps ÷ 30), the Epley estimate of your one-rep max. It lets sets with different reps be compared.</p>
    <div class="cap" style="margin:14px 0 6px">History</div>
    ${[...h.pts].reverse().slice(0,12).map(x=>`<div class="wkline"><span class="cap" style="width:64px">${esc(fmtDate(x.date))}</span><span class="num" style="flex:1">${x.sets.map(s=>`${s.r}×${s.w}`).join('  ')}</span><span class="cap">${Math.round(x.est)}</span></div>`).join('')}`);
}
function exerciseSection(){
  const h=Object.values(exHistory()).sort((a,b)=>b.pts[b.pts.length-1].date.localeCompare(a.pts[a.pts.length-1].date));
  if(!h.length)return'';
  return section('Your <em>lifts</em>',`<ul class="list card-s">${h.slice(0,12).map(x=>{const l=x.pts[x.pts.length-1],f=x.pts[0],d=l.est-f.est;
    return`<li class="row"><span class="ico k-workout">${ic('workout')}</span><button class="rowbtn" data-exprog="${esc(x.name)}"><span class="rt">${esc(x.name)}</span><span class="rs">Last ${l.best.r}×${l.best.w} lb · e1RM ${Math.round(l.est)}${x.pts.length>1?` · ${d>=0?'+':'−'}${Math.abs(Math.round(d))} since ${esc(fmtDate(f.date))}`:''}</span></button></li>`}).join('')}</ul>`);
}

/* ---------- weekly review ---------- */
let RV=0;
function weekRange(off){const d=weekDays(shiftDays(today(),off*7));return d}
function openReview(off=0){
  RV=off;const days=weekRange(off),a=days[0],z=days[6],inW=d=>d&&d>=a&&d<=z,g=db.settings,td=today();
  const past=days.filter(d=>d<=td),nd=Math.max(1,past.length);
  const food=of('food').filter(e=>inW(e.date)),fd=[...new Set(food.map(e=>e.date))];
  const kcalDay=d=>sumKcal(food.filter(e=>e.date===d)),protDay=d=>sumProt(food.filter(e=>e.date===d));
  const avgK=fd.length?fd.reduce((s,d)=>s+kcalDay(d),0)/fd.length:0,avgP=fd.length?fd.reduce((s,d)=>s+protDay(d),0)/fd.length:0;
  const onTarget=fd.filter(d=>Math.abs(kcalDay(d)-g.kcal)<=g.kcal*.1).length;
  const wo=of('workout').filter(e=>inW(e.date)),mins=wo.reduce((s,e)=>s+num(e.minutes),0);
  const vol=wo.reduce((t,e)=>t+(e.ex||[]).reduce((s,x)=>s+x.sets.reduce((q,y)=>q+num(y.r)*num(y.w),0),0),0);
  const hist=exHistory(),prs=[];for(const k in hist){const p=hist[k].pts;let best=0;for(const x of p){if(inW(x.date)&&best&&x.est>best+.01)prs.push(`${hist[k].name} ${Math.round(x.est)}`);best=Math.max(best,x.est)}}
  const done=db.entries.filter(e=>(e.type==='task'||e.type==='reminder')&&e.done&&e.doneAt&&inW(iso(new Date(e.doneAt))));
  const missed=db.entries.filter(e=>(e.type==='task'||e.type==='reminder')&&!e.done&&e.due&&inW(e.due)&&e.due<td);
  const tr=trendSeries(weights()),tIn=tr.filter(x=>inW(x.date)),tw0=tIn[0],tw1=tIn[tIn.length-1];
  const hs=(HC.days||[]).filter(x=>inW(x.date)),avg=(k)=>{const v=hs.map(x=>num(x[k])).filter(Boolean);return v.length?v.reduce((s,q)=>s+q,0)/v.length:null};
  const steps=avg('steps'),sleep=avg('sleepMin');
  const bar=(v,goal)=>`<div class="mbar"><i style="width:${Math.min(100,goal?v/goal*100:0)}%"></i></div>`;
  const label=off===0?'This week':off===-1?'Last week':`${fmtDate(a)} – ${fmtDate(z)}`;
  FORCE_MODE='m-bottom tall';
  const html=`${sheetHead('Weekly <em>review</em>')}
    <div class="wk-top" style="margin-bottom:10px"><button class="wk-nav" data-rv="-1" aria-label="Previous week">${ic('chev','i chev l')}</button><b>${label}</b><button class="wk-nav" data-rv="1" aria-label="Next week" ${off>=0?'disabled':''}>${ic('chev','i chev r')}</button></div>
    <div class="fl"><div class="fl-body">
    <div class="rvcard card-s"><div class="cap">Food</div>
      <div class="rvgrid"><div><b class="num">${fd.length}/${nd}</b><span>days logged</span></div><div><b class="num">${fmtN(avgK)}</b><span>avg kcal · goal ${fmtN(g.kcal)}</span></div><div><b class="num">${fmtN(avgP)}g</b><span>avg protein · goal ${g.protein}</span></div></div>
      ${bar(avgP,g.protein)}<p class="small">${fd.length?`${onTarget} of ${fd.length} logged days within 10% of your calorie goal.`:'Nothing logged this week.'}</p></div>
    <div class="rvcard card-s"><div class="cap">Training</div>
      <div class="rvgrid"><div><b class="num">${wo.length}</b><span>sessions</span></div><div><b class="num">${fmtN(mins)}</b><span>min · goal ${g.active}</span></div><div><b class="num">${vol>=1e4?(vol/1e3).toFixed(1)+'k':fmtN(vol)}</b><span>lb lifted</span></div></div>
      ${bar(mins,g.active)}${prs.length?`<p class="small"><b>New bests:</b> ${esc(prs.slice(0,4).join(' · '))}</p>`:''}</div>
    <div class="rvcard card-s"><div class="cap">Body</div>
      <div class="rvgrid"><div><b class="num">${tw1?tw1.t.toFixed(1):'—'}</b><span>trend lb</span></div><div><b class="num">${tw0&&tw1&&tw0!==tw1?((tw1.t-tw0.t)>0?'+':'−')+Math.abs(tw1.t-tw0.t).toFixed(1):'—'}</b><span>change this week</span></div><div><b class="num">${steps?fmtN(steps):sleep?(sleep/60).toFixed(1)+'h':'—'}</b><span>${steps?'avg steps':sleep?'avg sleep':'steps (connect Fitbit)'}</span></div></div></div>
    ${(()=>{const fw=focusWeek(off),hs=habits();const hp=hs.length?Math.round(hs.reduce((t,h)=>t+past.filter(d=>hCount(h,d)>=h.target).length,0)/(hs.length*nd)*100):null;return`<div class="rvcard card-s"><div class="cap">Focus &amp; habits</div><div class="rvgrid"><div><b class="num">${(fw.total/60).toFixed(1)}h</b><span>focused · ${fw.n} sessions</span></div><div><b class="num">${fw.by[0]?esc(fw.by[0][0]).slice(0,14):'—'}</b><span>most time</span></div><div><b class="num">${hp===null?'—':hp+'%'}</b><span>habits done</span></div></div></div>`})()}
    <div class="rvcard card-s"><div class="cap">Finished · ${done.length+Object.values(extDone()).filter(t=>inW(iso(new Date(t)))).length}</div>${done.length?`<ul class="rvlist">${done.slice(0,8).map(e=>`<li>${ic('check')}${esc(e.title)}</li>`).join('')}</ul>`:'<p class="small">Nothing ticked off yet.</p>'}</div>
    <div class="rvcard card-s"><div class="cap">Missed · ${missed.length}</div>${missed.length?`<ul class="rvlist miss">${missed.slice(0,8).map(e=>`<li><button class="link" data-open="${esc(e.id)}">${esc(e.title)} · due ${esc(fmtDate(e.due))}</button></li>`).join('')}</ul>`:'<p class="small">Nothing missed. Good week.</p>'}</div>
    </div></div>`;
  if(!wrap.hidden&&wrap.classList.contains('open')&&$('#sheetBody .rvcard')){$('#sheetBody').innerHTML=html;anim($('#sheetBody .fl'),{x:[-NAV_DIR*24,0],opacity:[.001,1]},{duration:.35});NAV_DIR=0}else openSheet(html);
}

/* ---------- food: copy yesterday, favourites, units ---------- */
const UNITS=[['serving',null],['g',1],['oz',28.35],['cup',240],['tbsp',15],['tsp',5],['piece',null]];
function unitG(u,it){const x=UNITS.find(q=>q[0]===u);if(!x)return 1;if(x[1])return x[1];return u==='serving'?(it.servingG||null):(it.pieceG||it.servingG||null)}
function isFav(it){return lib().some(x=>x.fav&&x.name.toLowerCase()===it.name.toLowerCase())}
function toggleFav(it){const i=lib().findIndex(x=>x.name.toLowerCase()===it.name.toLowerCase());
  if(i>=0&&lib()[i].fav){if(lib()[i].recipe||lib()[i].saved)lib()[i].fav=false;else lib().splice(i,1);save();return false}
  if(i>=0){lib()[i].fav=true}else{const c={...it,id:uid(),fav:true};delete c.src;lib().push(c)}save();return true}
function copyYesterday(){
  const y=addDays(-1),m=$('#flHead input[name=flmeal]'),meal=m?m.value:FL.meal;
  let items=of('food').filter(e=>e.date===y&&e.meal===meal&&e.src!=='mf');if(!items.length)items=of('food').filter(e=>e.date===y&&e.src!=='mf');
  if(!items.length){toast('Nothing logged yesterday');return}
  for(const e of items)FL.cart.push({name:e.title,grams:e.grams||'',per100:e.per100||null,servings:e.per100?null:1,k:num(e.kcal),p:num(e.protein),f:num(e.fat),c:num(e.carbs)});
  if(m)FL.meal=m.value;flRefresh();tick();toast(`Added ${items.length} from yesterday${items[0].meal===meal?' · '+meal.toLowerCase():''}`);
}

/* ---------- connections UI ---------- */
const GH='https://github.com/IshirJ/life/blob/main/';
function connRow(panel,icon,title,sub,on){return`<button class="navrow" data-panel="${panel}">${tile(icon)}<span class="t">${title}<small>${sub}</small></span>${on?'<span class="dot-on" aria-label="On"></span>':''}${ic('chev','i chev')}</button>`}
function openConn(){
  const s=SV.status&&!SV.status.error?SV.status:null,c=s?s.connections||{}:{};
  openSheet(`${sheetHead('<em>Connections</em>','settings')}
    <div class="notice" style="margin-bottom:12px">Notifications, calendars, email, Fitbit, Apple Health and the widget all go through <b>your own free server</b> (a Cloudflare Worker). Set it up once with the <a href="${GH}worker/README.md" target="_blank" rel="noopener">step-by-step guide</a>.</div>
    ${syncOn()?`<div class="trow" style="cursor:default"><span>Server connected<small>${esc(SYNC.url.replace(/^https?:\/\//,''))}${SV.status&&SV.status.error?` · <b style="color:var(--late)">${esc(SV.status.error)}</b>`:''}</small></span><button class="link" id="srvOff">Disconnect</button></div>`
      :`<label class="fld" for="srvUrl"><span>Server address</span><input id="srvUrl" type="url" inputmode="url" placeholder="https://life-sync.yourname.workers.dev" autocomplete="off"></label>
        <label class="fld" for="srvKey"><span>Key (only if this server is already paired)</span><input id="srvKey" autocomplete="off" placeholder="Leave empty the first time"></label>
        <div class="sh-actions" style="margin-top:0"><button class="primary" id="srvGo" style="flex:1">${ic('link')}Connect</button></div>`}
    ${syncOn()?`<div class="sh-actions" style="margin-top:20px"><button class="primary" id="diagGo" style="flex:1">Check everything</button></div>`:''}
    <div class="set-grp">What it powers</div>
    ${syncOn()?trow('id="syncTg"',SYNC.syncOn!==false,'Sync across devices',syncStatusText()):''}
    ${syncOn()?connRow('syncstat','cloud','Sync status','See what this device and the server each have',LIVE.state==='live'):''}
    ${connRow('notif','reminder','Notifications',NS().on?'On · reminders, classes, morning digest':'Off',NS().on)}
    ${connRow('cals','ext','Calendars',(SYNC.cals||[]).length?`${SYNC.cals.length} linked · ${(SYNC.cals||[]).map(c=>c.name).join(', ')}`:'Outlook and iPhone (iCloud) calendars',(SYNC.cals||[]).length>0)}
    ${connRow('mail','mail','Email',SYNC.mailOn?`On${c.outlookMail?' · Outlook':''}${c.gmailUpdated?' · Gmail':''}`:'Outlook and Gmail unread',!!SYNC.mailOn)}
    ${connRow('health','workout','Fitbit &amp; Apple Health',SYNC.healthOn?`On${c.googleHealth?' · Fitbit':''}${c.healthUpdated?' · Apple Health':''}`:'Steps, sleep, MacroFactor food and weight',!!SYNC.healthOn)}
    ${connRow('food','food','Food search','USDA + Open Food Facts as you type',false)}
    ${connRow('quick','bolt','Quick capture','Siri, Action button and the share sheet',false)}
    ${connRow('widget','today','Home-screen widget',SYNC.widgetOn?'On · Scriptable':'Calories left, next class, tasks due',!!SYNC.widgetOn)}
    ${syncOn()?`<div class="set-grp">This phone’s key</div><div class="trow" style="cursor:default"><span style="font-family:var(--mono);font-size:12px;word-break:break-all">${esc(SYNC.key)}</span><button class="link" data-copy="${esc(SYNC.key)}">Copy</button></div><p class="small">Treat the key like a password. Your Gmail script, Shortcut, widget and JARVIS use it.</p><button class="link" id="keyNew" style="color:var(--late)">Make a new key (if this one leaked)</button>`:''}`);
  if(syncOn()&&!SV.status)refreshStatus().then(()=>{if($('#srvOff'))openConn()});
}
function needSrv(){return syncOn()?'':`<div class="notice">Connect your server first (Settings → Connections).</div>`}
function copyRow(label,val){return`<div class="trow" style="cursor:default"><span>${label}<small style="font-family:var(--mono);word-break:break-all">${esc(val)}</small></span><button class="link" data-copy="${esc(val)}">Copy</button></div>`}
function openNotif(){
  const n=NS(),t=(k,l,s)=>trow(`data-nset="${k}"`,!!n[k],l,s);
  const times=['06:00','07:00','07:30','08:00','08:30','09:00','10:00'].map(x=>[x,fmtT(x)]),ft=['18:00','19:00','20:00','21:00','22:00'].map(x=>[x,fmtT(x)]);
  NAV_DIR=1;openSheet(`${sheetHead('<em>Notifications</em>','conn')}${needSrv()}
    ${trow('id="nOn"',!!n.on,'Allow notifications','Your iPhone asks once. Life must be opened from the Home Screen icon.')}
    <div class="set-grp">Send me</div>
    ${t('reminders','Reminders','At the time you set on each reminder')}
    ${t('urgent','Urgent reminders','High: every 90 min · Medium: every 3 h · 8 AM–2 AM until done')}
    ${t('habits','Habit check-ins','Water every ~50 min · creatine & vitamins every 3 h · 8 AM–2 AM until ticked')}
    ${t('classes','Classes and meetings','10 minutes before they start')}
    ${t('events','Linked calendar events','10 minutes before (Outlook, iCloud)')}
    ${t('digestOn','Morning digest','Tasks due today and anything late')}
    <label class="fld" for="nDig"><span>Digest time</span>${selectHTML('set_n_digest',times,n.digest,'nDig')}</label>
    ${t('food','Food nudge','Only on days you haven’t logged anything')}
    <label class="fld" for="nFood"><span>Nudge time</span>${selectHTML('set_n_foodTime',ft,n.foodTime,'nFood')}</label>
    ${t('review','Weekly review','Sundays at 7:00 PM')}
    ${t('backup','Backup reminder','Sundays at 6:00 PM, only if you haven’t backed up that week')}
    <div class="sh-actions"><button class="secondary" id="nTest" style="flex:1">Send a test</button></div>`);
}
function openCals(){
  const cs=SYNC.cals||[],cols=['#4C9AFF','#36B37E','#FF8B00','#B286FD','#F26D8F','#1FB5AD'];
  NAV_DIR=1;openSheet(`${sheetHead('<em>Calendars</em>','conn')}${needSrv()}
    ${cs.map(c=>`<div class="trow" style="cursor:default"><i class="cdot" style="background:${esc(c.color)}"></i><span>${esc(c.name)}<small>${esc(c.url.replace(/^(webcal|https?):\/\//,'').slice(0,46))}…</small></span><button class="link" data-caldel="${esc(c.id)}">Remove</button></div>`).join('')}
    ${CALC.err&&CALC.err.length?`<div class="notice" style="margin:10px 0">${CALC.err.map(e=>esc((cs.find(c=>c.id===e.cal)||{name:e.cal}).name+': '+e.message)).join('<br>')}</div>`:''}
    <div class="set-grp">Add a calendar</div>
    <label class="fld" for="calName"><span>Name</span><input id="calName" placeholder="e.g. Outlook"></label>
    <label class="fld" for="calUrl"><span>Calendar link (.ics or webcal://)</span><input id="calUrl" type="url" inputmode="url" autocomplete="off" placeholder="https://outlook.office365.com/owa/calendar/…/calendar.ics"></label>
    <label class="fld" for="calCol"><span>Colour</span>${selectHTML('calcol',cols.map((c,i)=>[c,['Blue','Green','Orange','Purple','Pink','Teal'][i]]),cols[cs.length%cols.length],'calCol')}</label>
    <div class="sh-actions" style="margin-top:0"><button class="primary" id="calAdd" style="flex:1">Add calendar</button></div>
    <details style="margin-top:14px"><summary class="cap" style="cursor:pointer">Where do I get the link?</summary><div class="about" style="margin-top:10px">
    <p><b>Outlook (work, school or Outlook.com):</b> on a computer, open outlook.com or outlook.office.com → Settings (gear) → Calendar → Shared calendars → <i>Publish a calendar</i> → choose your calendar and “Can view all details” → Publish → copy the <b>ICS</b> link. If your school blocks publishing, ask me to use the Outlook account connection instead.</p>
    <p><b>iPhone calendar (iCloud):</b> Calendar app → Calendars → tap ⓘ next to a calendar → turn on <i>Public Calendar</i> → Share Link → Copy.</p>
    <p><b>Gmail / Google Calendar:</b> calendar.google.com → Settings → your calendar → <i>Secret address in iCal format</i>.</p>
    <p>Life refreshes linked calendars every 15 minutes. They are read-only here.</p></div></details>`);
}
function openMail(){
  const s=SV.status&&SV.status.connections||{};
  NAV_DIR=1;openSheet(`${sheetHead('<em>Email</em>','conn')}${needSrv()}
    ${trow('id="mailOn"',!!SYNC.mailOn,'Show unread mail on Today','Up to 6 newest unread, tap ✓ to turn one into a task')}
    <div class="set-grp">Outlook</div>
    <p class="small">One-time setup: register a free app in Microsoft Entra (Azure) as described in the <a href="${GH}worker/README.md#outlook" target="_blank" rel="noopener">guide</a>, then paste its ID and secret here.</p>
    <label class="fld" for="msId"><span>Application (client) ID</span><input id="msId" autocomplete="off" placeholder="${s.outlookMail?'saved':'xxxxxxxx-xxxx-…'}"></label>
    <label class="fld" for="msSec"><span>Client secret value</span><input id="msSec" autocomplete="off" type="password"></label>
    <div class="sh-actions" style="margin-top:0"><button class="secondary" id="msSave" style="flex:1">Save</button><button class="primary" id="msGo" style="flex:1">${s.outlookMail?'Reconnect':'Connect'} Outlook</button></div>
    <div class="set-grp">Gmail</div>
    <p class="small">Gmail sends its unread list to your server from a tiny Google Apps Script that runs as you, so no Google app review is needed. Open <a href="${GH}apps-script/Gmail.gs" target="_blank" rel="noopener">Gmail.gs</a>, paste it at script.google.com, fill in these two values, then run <b>setup</b> once.</p>
    ${syncOn()?copyRow('WORKER_URL',SYNC.url.replace(/\/+$/,''))+copyRow('LIFE_KEY',SYNC.key):''}
    <p class="small">Gmail last synced: ${ago(s.gmailUpdated)}.</p>`);
}
function openHealthConn(){
  const s=SV.status&&SV.status.connections||{};
  NAV_DIR=1;openSheet(`${sheetHead('Fitbit &amp; <em>Apple Health</em>','conn')}${needSrv()}
    ${trow('id="hOn"',!!SYNC.healthOn,'Use health data','Steps and sleep on Today and in your weekly review')}
    ${trow('id="whImp"',SYNC.whImport!==false,'Import weigh-ins','Fills days you didn’t weigh in by hand')}
    ${trow('id="mfImp"',!!SYNC.mfImport,'MacroFactor calories as my food log','Adds one “day total” per day. Turn off if you log food in Life too.')}
    <div class="set-grp">Fitbit (Google Health API)</div>
    <p class="small">Fitbit’s old API was switched off on Oct 30, 2026, so Fitbit now connects through Google. Create a Google Cloud project as in the <a href="${GH}worker/README.md#fitbit" target="_blank" rel="noopener">guide</a> and paste its OAuth client here. While the Google project is in “testing”, Google makes you reconnect every 7 days.</p>
    <label class="fld" for="gId"><span>OAuth client ID</span><input id="gId" autocomplete="off" placeholder="${s.googleHealth?'saved':'…apps.googleusercontent.com'}"></label>
    <label class="fld" for="gSec"><span>Client secret</span><input id="gSec" autocomplete="off" type="password"></label>
    <div class="sh-actions" style="margin-top:0"><button class="secondary" id="gSave" style="flex:1">Save</button><button class="primary" id="gGo" style="flex:1">${s.googleHealth?'Reconnect':'Connect'} Fitbit</button></div>
    ${(HC.err||[]).some(e=>e.code==='reauth')?'<div class="notice">Fitbit needs reconnecting (Google’s 7-day test limit).</div>':''}
    <div class="set-grp">Apple Health · MacroFactor</div>
    <p class="small">MacroFactor writes your food and weight to Apple Health (MacroFactor → Settings → Apple Health → turn on writing). A Shortcut then sends Apple Health to your server every night. Build it with the steps in the <a href="${GH}worker/README.md#apple-health" target="_blank" rel="noopener">guide</a> using these values:</p>
    ${syncOn()?copyRow('URL',SYNC.url.replace(/\/+$/,'')+'/ingest/health')+copyRow('Header X-Life-Key',SYNC.key):''}
    <p class="small">Apple Health last received: ${ago(s.healthUpdated)} · Fitbit: ${s.googleHealth?'connected':'not connected'}.</p>`);
}
function openWidget(){
  NAV_DIR=1;openSheet(`${sheetHead('Home-screen <em>widget</em>','conn')}${needSrv()}
    ${trow('id="wOn"',!!SYNC.widgetOn,'Send a summary to the widget','Calories left, protein, next class, tasks due, steps. Updated when you use Life (at most every 10 min).')}
    <div class="about"><p>Home-screen web apps can’t have widgets of their own, so this uses the free <b>Scriptable</b> app:</p>
    <p>1. Install Scriptable from the App Store.<br>2. Open <a href="${GH}scriptable/LifeWidget.js" target="_blank" rel="noopener">LifeWidget.js</a>, copy everything, and paste it into a new Scriptable script named “Life”.<br>3. Replace WORKER_URL and LIFE_KEY at the top with the values below.<br>4. Long-press your Home Screen → + → Scriptable → pick a size → tap the widget → Script: Life.</p></div>
    ${syncOn()?copyRow('WORKER_URL',SYNC.url.replace(/\/+$/,''))+copyRow('LIFE_KEY',SYNC.key):''}
    <div class="sh-actions"><button class="secondary" id="wPush" style="flex:1">Update widget now</button></div>`);
}
async function connectServer(){
  let url=($('#srvUrl').value||'').trim().replace(/\/+$/,'');const key=($('#srvKey').value||'').trim();
  if(!/^https:\/\/[^/]+/.test(url)){toast('Enter the https:// address of your worker');return}
  try{let k=key;
    if(!k){const r=await fetch(url+'/pair',{method:'POST'});if(r.status===409){toast('This server is already paired. Paste its key.');return}if(!r.ok)throw new Error(r.status);k=(await r.json()).key}
    SYNC.url=url;SYNC.key=k;saveSync();const st=await refreshStatus();if(st&&st.error){SYNC.key='';saveSync();toast('Key rejected: '+st.error);return}
    toast('Server connected');openConn();cloudBackup(false);   /* not forced: a fresh phone must never push its example data over a real server copy */
  }catch(e){toast('Couldn’t reach the server: '+e.message)}
}
async function putConfig(o){try{await api('/config',{method:'PUT',body:JSON.stringify(o)});return true}catch(e){toast('Server: '+e.message);return false}}
/* the key never goes into a URL: ask the server for a one-time start link, then go there */
async function oauthGo(which){if(!syncOn()){toast('Connect your server first');return}
  try{const r=await api(`/oauth/${encodeURIComponent(which)}/begin`,{method:'POST',body:JSON.stringify({return:APP_URL})});
    const base=new URL(SYNC.url.replace(/\/+$/,'')+'/'),u=r&&r.url?new URL(r.url,base):null;
    if(!u||u.origin!==base.origin)throw new Error('the server didn’t return a sign-in link (update your worker)');
    location.href=u.href}
  catch(e){toast('Couldn’t start sign-in: '+e.message)}}

/* clicks for everything above (capture phase so the main handler doesn't also act) */
document.addEventListener('click',async e=>{
  const t=e.target.closest('[data-wkstart],[data-tpledit],[data-add-simple],[data-wkaddset],[data-wkdelset],[data-wkrm],[data-wkdone],[data-wkedit],[data-wkagain],[data-exprog],#wkAddEx,#wkSave,#wkAsTpl,#tplDel,[data-rv],[data-snap],#bkFile,#bkCloud,#bkCloudGet,#bkDo,#doImp2,[data-bk],[data-copy],[data-nset],#nOn,#nTest,[data-caldel],#calAdd,#mailOn,#msSave,#msGo,#hOn,#whImp,#mfImp,#gSave,#gGo,#wOn,#wPush,#srvGo,#srvOff,[data-mailtask],#flCopy,[data-fav],[data-unit],#reviewBtn');
  if(!t)return;
  const d=t.dataset;e.stopImmediatePropagation();if(t.tagName==='A')return;e.preventDefault();
  if(d.wkstart!==undefined){NAV_DIR=1;startWorkout(d.wkstart||null);return}
  if(d.tpledit){NAV_DIR=1;editTemplate(d.tpledit);return}
  if(d.addSimple){openForm(d.addSimple);return}
  if(d.wkaddset!==undefined){wkCommitInputs();const x=WK.ex[+d.wkaddset],l=x.sets[x.sets.length-1]||{};x.sets.push({r:l.r||'',w:l.w||'',done:false});wkRefresh();return}
  if(d.wkdelset!==undefined){wkCommitInputs();WK.ex[+d.wkdelset].sets.pop();wkRefresh();return}
  if(d.wkrm!==undefined){wkCommitInputs();WK.ex.splice(+d.wkrm,1);wkRefresh();return}
  if(d.wkdone){const[i,j]=d.wkdone.split('.').map(Number),s=WK.ex[i].sets[j];s.done=!s.done;t.setAttribute('aria-pressed',String(s.done));t.closest('.wkset').classList.toggle('done',s.done);if(s.done){tick();anim(t,{scale:[.6,1]},{spring:true,k:600,d:14})}return}
  if(d.wkedit){NAV_DIR=1;startWorkout(null,d.wkedit);return}
  if(d.wkagain){const src=find(d.wkagain);WK={mode:'log',id:null,title:src.title,date:today(),minutes:'',notes:'',started:Date.now(),ex:src.ex.map(x=>({name:x.name,sets:x.sets.map(s=>({r:s.r,w:s.w,done:false}))}))};NAV_DIR=1;showWK();return}
  if(d.exprog){openExProgress(d.exprog);return}
  switch(t.id){
    case'wkAddEx':wkCommitInputs();openExPicker();return;
    case'wkSave':saveWK(false);return;
    case'wkAsTpl':saveWK(true);return;
    case'tplDel':arm(t,'Tap again to delete',()=>{db.templates=tpls().filter(x=>x.id!==WK.id);save();NAV_DIR=-1;openWorkoutStart()});return;
    case'reviewBtn':openReview(0);return;
    case'bkFile':exportFile();return;
    case'bkCloud':cloudBackup(true);return;
    case'bkDo':restoreText(PICKED||'',t);return;
    case'bkCloudGet':try{const txt=await api('/backup');restoreText(typeof txt==='string'?txt:JSON.stringify(txt),t)}catch(err){toast('No server backup yet')}return;
    case'doImp2':restoreText($('#imp').value,t);return;
    case'nOn':if(NS().on){SYNC.notif={...NS(),on:false};saveSync();t.setAttribute('aria-pressed','false');api('/schedule',{method:'PUT',body:JSON.stringify({items:[]})}).catch(()=>{});meta.schedHash='';saveMeta();toast('Notifications off')}else if(await enablePush()){t.setAttribute('aria-pressed','true');toast('Notifications on')}return;
    case'nTest':try{const r=await api('/push/test',{method:'POST'});
      if(r.ok)toast(`Apple accepted it (${r.status}). It should arrive in a few seconds. If not, check iPhone Settings → Notifications → Life.`);
      else toast(`Not delivered: ${r.status||''} ${r.reason||r.error||''}`.trim()+'. Tap Allow notifications again to re-register, then retry.')}
      catch(err){toast(/subscription/.test(err.message)?'This phone isn’t registered yet. Tap Allow notifications first.':'Test failed: '+err.message)}return;
    case'calAdd':{const name=$('#calName').value.trim()||'Calendar',url=$('#calUrl').value.trim(),color=$('#sheetBody input[name=calcol]').value;
      if(!/^(https?|webcal):\/\//.test(url)){toast('Paste the calendar’s .ics or webcal:// link');return}
      const cals=[...(SYNC.cals||[]),{id:uid(),name,url,color}];if(await putConfig({calendars:cals,tz:Intl.DateTimeFormat().resolvedOptions().timeZone})){SYNC.cals=cals;saveSync();toast('Calendar linked');loadExt(true);openCals()}return}
    case'mailOn':SYNC.mailOn=!SYNC.mailOn;saveSync();t.setAttribute('aria-pressed',String(SYNC.mailOn));DATA_VER++;if(SYNC.mailOn)loadMail(true);return;
    case'msSave':{const id=$('#msId').value.trim(),sec=$('#msSec').value.trim();if(!id||!sec){toast('Paste both the ID and the secret');return}if(await putConfig({ms:{clientId:id,clientSecret:sec}}))toast('Saved. Now tap Connect.');return}
    case'msGo':oauthGo('ms');return;
    case'hOn':SYNC.healthOn=!SYNC.healthOn;saveSync();t.setAttribute('aria-pressed',String(SYNC.healthOn));DATA_VER++;if(SYNC.healthOn)loadHealth(true);return;
    case'whImp':SYNC.whImport=SYNC.whImport===false;saveSync();t.setAttribute('aria-pressed',String(SYNC.whImport!==false));return;
    case'mfImp':SYNC.mfImport=!SYNC.mfImport;saveSync();t.setAttribute('aria-pressed',String(SYNC.mfImport));if(SYNC.mfImport){importHealth();render(false)}else{const n=of('food').filter(x=>x.src==='mf').length;db.entries=db.entries.filter(x=>!(x.type==='food'&&x.src==='mf'));if(n)save();render(false)}return;
    case'gSave':{const id=$('#gId').value.trim(),sec=$('#gSec').value.trim();if(!id||!sec){toast('Paste both the client ID and secret');return}if(await putConfig({google:{clientId:id,clientSecret:sec}}))toast('Saved. Now tap Connect.');return}
    case'gGo':oauthGo('google');return;
    case'wOn':SYNC.widgetOn=!SYNC.widgetOn;saveSync();t.setAttribute('aria-pressed',String(SYNC.widgetOn));if(SYNC.widgetOn)pushWidget(true);return;
    case'wPush':await pushWidget(true);toast('Widget updated');return;
    case'srvGo':connectServer();return;
    case'srvOff':arm(t,'Tap again to disconnect',()=>{for(const k of Object.keys(SYNC))delete SYNC[k];saveSync();SV.status=null;delete meta.srvE2E;saveMeta();
      /* the page's security policy only allows the connected server; reload so a different one can be connected */
      flushNow();setTimeout(()=>location.reload(),LOCK.key?400:50)});return;
    case'flCopy':copyYesterday();return;
  }
  if(d.rv){NAV_DIR=+d.rv;openReview(RV+(+d.rv));return}
  if(d.snap){arm(t,'Tap again to restore this day',async()=>{const s=await SNAP.get(d.snap);if(!s){toast('Snapshot missing');return}freezeStore();if(!lsWrite(KEY,s.raw)){FROZEN=false;storageFail();return}markRestored();location.reload()});return}
  if(d.bk){if(d.bk==='save')exportFile();else{meta.snoozeBk=Date.now()+2*864e5;saveMeta();DATA_VER++;render(false)}return}
  if(d.copy){copyText(d.copy);return}
  if(d.nset){const n=NS();n[d.nset]=!n[d.nset];SYNC.notif=n;saveSync();t.setAttribute('aria-pressed',String(n[d.nset]));pushSchedule(true);return}
  if(d.caldel){const cals=(SYNC.cals||[]).filter(c=>c.id!==d.caldel);if(await putConfig({calendars:cals})){SYNC.cals=cals;saveSync();CALC.ev=(CALC.ev||[]).filter(v=>v.cal!==d.caldel);DATA_VER++;render(false);openCals()}return}
  if(d.mailtask){const m=(MAILC.items||[]).find(x=>x.id===d.mailtask);if(m){db.entries.push({id:uid(),type:'task',title:m.subject||'Email',notes:`From ${m.from||''}\n${m.link||''}`,due:today(),priority:'Normal',created:Date.now()});save();render(false);toast('Added to tasks')}return}
  if(d.fav){const it=FITEMS[d.fav];if(!it)return;const on=toggleFav(it);t.classList.toggle('on',on);t.setAttribute('aria-pressed',String(on));anim(t,{scale:[.5,1]},{spring:true,k:600,d:12});toast(on?'Added to favourites':'Removed from favourites');return}
  if(d.unit){const li=t.closest('li'),it=FITEMS[li.dataset.fkey],q=num(li.querySelector('[data-uq]').value)||1,gpu=unitG(d.unit,it);
    li.querySelectorAll('[data-unit]').forEach(b=>b.setAttribute('aria-pressed',String(b===t)));li.dataset.unit=d.unit;
    const note=li.querySelector('.unote');if(note)note.textContent=['cup','tbsp','tsp'].includes(d.unit)?'Volume uses water weight (1 cup ≈ 240 g). Oils, flour and rice differ, so weigh when it matters.':d.unit==='piece'&&!gpu?'This food has no piece size. Type the grams below.':'';
    if(gpu){const inp=li.querySelector('[data-sg]');inp.value=+(q*gpu).toFixed(1);inp.dispatchEvent(new Event('input',{bubbles:true}))}return}
},true);
document.addEventListener('input',e=>{
  const t=e.target;if(!t.matches)return;
  if(t.matches('[data-wkf]')&&WK){const p=t.dataset.wkf.split('.');const x=WK.ex[+p[0]];if(p[1]==='name')x.name=t.value;else if(p[1]==='n')x.n=t.value;else x.sets[+p[1]][p[2]]=t.value;return}
  if(t.matches('[data-uq]')){const li=t.closest('li'),it=FITEMS[li.dataset.fkey],gpu=unitG(li.dataset.unit||'g',it);if(gpu){const inp=li.querySelector('[data-sg]');inp.value=+(num(t.value)*gpu).toFixed(1);inp.dispatchEvent(new Event('input',{bubbles:true}))}}
});
/* deep links from notifications and OAuth returns */
function handleHash(){
  const h=location.hash;if(!h||isLocked())return;   /* while locked the link waits; onUnlock runs it */history.replaceState(null,'',APP_URL);
  if(h.startsWith('#connected=')){toast(`${h.includes('outlook')||h.includes('ms')?'Outlook':'Fitbit'} connected`);refreshStatus();setTimeout(()=>{lastTrigger=null;openSettings();setTimeout(openConn,60)},400);loadMail(true);loadHealth(true);return}
  if(h.startsWith('#error=')){toast('Connection failed: '+decodeURIComponent(h.slice(7)).slice(0,80));return}
  if(h==='#review'){setTimeout(()=>openReview(0),500);return}
  if(h==='#backup'){setTimeout(()=>{openSettings();setTimeout(openBackup,60)},500);return}
  if(h==='#log=food'){setTimeout(openFoodLog,500)}
}
function healthStatus(){
  const e=(HC.err||[])[0],part=e&&e.part==='sleep'?'Sleep':'Some Fitbit data';
  const msg=e?(e.code==='reauth'?'Fitbit sign-in expired':`${part} didn’t load`):'';
  /* details live in Settings → Connections → Check everything; here it stays one calm line */
  return`<div class="hstat${e?' bad':''}"><i></i><span>${e?esc(msg):`Fitbit · ${HC.at?`updated ${esc(ago(HC.at))}`:'not loaded yet'}`}</span><button class="link" id="${e&&e.code==='reauth'?'hReconnect':'hRefresh'}">${HC.busy?'Refreshing…':e&&e.code==='reauth'?'Reconnect':e?'Retry':'Refresh'}</button></div>`}
function healthTiles(){
  if(!syncOn())return'';
  if(!SYNC.healthOn)return`<div class="card-s rvcard" style="margin-top:8px"><p class="small" style="margin:0 0 10px">Health data is off on this phone.</p><button class="secondary" id="hOn2" style="width:100%">Show Fitbit &amp; Apple Health data</button></div>`;
  const h=hday(today())||{},y=hday(addDays(-1))||{},st=num(h.steps)||0,sl=num(h.sleepMin)||num(y.sleepMin)||0,hr=num(h.restingHr)||num(y.restingHr)||0;
  if(!st&&!sl&&!hr)return`<p class="small" style="margin-top:8px">No health data for today yet. Fitbit data reaches your server after the Fitbit app syncs.</p>${healthStatus()}`;
  return`<div class="tiles htiles">
    <div class="tile card-s">${ring(st/10000,'workout')}<div><b class="num">${st?fmtN(st):'—'}</b><div class="cap">Steps</div></div></div>
    <div class="tile card-s">${ring(sl/480,'today')}<div><b class="num">${sl?(sl/60).toFixed(1):'—'}<small>h</small></b><div class="cap">Sleep</div></div></div>
    <div class="tile card-s">${ring(hr?.6:0,'health')}<div><b class="num">${hr||'—'}<small>bpm</small></b><div class="cap">Resting HR</div></div></div>
  </div>${healthStatus()}`;
}

/* ---------- custom icon + colour per class / meeting / project ---------- */
Object.assign(P,{
  book:'<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z"/>',
  flask:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3M7.5 15h9"/>',
  code:'<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-8M21 20H3"/>',
  calc:'<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M8.5 7h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
  cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4M10 10h4v4h-4z"/>',
  rocket:'<path d="M12 15l-3-3c1-4 4-8 10-9-1 6-5 9-9 10zM9 12l-4 1-2 3 4 1M12 15l-1 4 3 2 1-4M14.5 9.5h.01"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  bolt:'<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  wrench:'<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 1-2-2zM5 21l2-2"/>',
  pen:'<path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3"/>',
  music:'<path d="M9 18V6l11-2v12M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM20 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z"/>',
  money:'<rect x="3" y="6" width="18" height="12" rx="3"/><circle cx="12" cy="12" r="2.5"/><path d="M6.5 9.5h.01M17.5 14.5h.01"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  heartp:P.health,users:P.meeting,brief:P.work,leaf:'<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15M5 19l7-7"/>',
  coffee:'<path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M7 3v2M10.5 3v2M14 3v2"/>',
  game:'<rect x="3" y="7" width="18" height="11" rx="5"/><path d="M8 10.5v4M6 12.5h4M15.5 11.5h.01M17.5 13.5h.01"/>',
  camera:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  plane:'<path d="M2 13l20-8-6 16-4-6-6-1z"/>'
});
const PICK_ICONS=['book','flask','code','chart','calc','cpu','rocket','globe','bolt','wrench','pen','music','money','target','users','brief','leaf','coffee','game','camera','plane','heartp','class','meeting','project','idea'];
const PICK_COLS=[['#9B95E8','#5B4FC2'],['#7CB7DE','#3A72A8'],['#62C7BE','#1F7C80'],['#93C97A','#4A8A3E'],['#F5CB6B','#C98A14'],['#FF9F6B','#D9552E'],['#F28A92','#C2364A'],['#C9A7E8','#7D55B5'],['#B9B3A6','#6E685C']];
function tileE(e,cls=''){
  if(!e||(!e.icon&&!e.color))return tile(e?e.type:'',cls);
  const c=e.color?(PICK_COLS[+e.color]||null):null,st=c?` style="--c1:${c[0]};--c2:${c[1]}"`:'';
  const inner=e.icon&&e.icon.startsWith('e:')?`<span class="emo">${esc(e.icon.slice(2))}</span>`:ic(e.icon&&P[e.icon]?e.icon:e.type);
  return`<span class="ico k-${e.type} ${cls}"${st}>${inner}</span>`;
}
function lookField(v){
  const icon=v.icon||'',col=v.color===undefined||v.color===null?'':String(v.color),type=v.type;
  const prev={type,icon,color:col};
  return`<div class="fld lookpick"><span>Icon &amp; colour</span>
    <input type="hidden" name="icon" value="${esc(icon)}"><input type="hidden" name="color" value="${esc(col)}">
    <div class="lp-top"><span id="lpPrev">${tileE(prev)}</span><input id="lpEmoji" maxlength="4" placeholder="or type an emoji" value="${icon.startsWith('e:')?esc(icon.slice(2)):''}"></div>
    <div class="lp-cols">${PICK_COLS.map((c,i)=>`<button type="button" data-lpc="${i}" aria-pressed="${col===String(i)}" style="--c1:${c[0]};--c2:${c[1]}" aria-label="Colour ${i+1}"></button>`).join('')}</div>
    <div class="lp-icons">${PICK_ICONS.map(k=>`<button type="button" data-lpi="${k}" aria-pressed="${icon===k}" aria-label="${k}">${ic(k)}</button>`).join('')}</div></div>`;
}
function lpUpdate(){const f=$('#entryForm');if(!f)return;const type=f.dataset.type,icon=f.querySelector('[name=icon]').value,color=f.querySelector('[name=color]').value;$('#lpPrev').innerHTML=tileE({type,icon,color})}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-lpc],[data-lpi]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();const f=$('#entryForm');
  if(b.dataset.lpc!==undefined){const inp=f.querySelector('[name=color]'),on=inp.value===b.dataset.lpc;inp.value=on?'':b.dataset.lpc;f.querySelectorAll('[data-lpc]').forEach(x=>x.setAttribute('aria-pressed',String(!on&&x===b)))}
  else{const inp=f.querySelector('[name=icon]'),on=inp.value===b.dataset.lpi;inp.value=on?'':b.dataset.lpi;f.querySelectorAll('[data-lpi]').forEach(x=>x.setAttribute('aria-pressed',String(!on&&x===b)));$('#lpEmoji').value=''}
  lpUpdate();anim($('#lpPrev'),{scale:[.8,1]},{spring:true,k:600,d:16});
},true);
document.addEventListener('input',e=>{if(e.target.id!=='lpEmoji')return;const f=$('#entryForm'),v=e.target.value.trim();f.querySelector('[name=icon]').value=v?'e:'+v:'';if(v)f.querySelectorAll('[data-lpi]').forEach(x=>x.setAttribute('aria-pressed','false'));lpUpdate()});

/* ---------- recurring meetings ---------- */
const REPEATS=['Never','Daily','Weekdays','Weekly','Every 2 weeks','Monthly'];
function meetingOn(e,d){
  if(!e.date)return false;if((e.skip||[]).includes(d))return false;if(d===e.date)return true;
  const r=e.repeat;if(!r||r==='Never'||d<e.date||(e.until&&d>e.until))return false;
  const diff=Math.round((new Date(d+'T00:00')-new Date(e.date+'T00:00'))/864e5),wd=new Date(d+'T12:00').getDay();
  return r==='Daily'||(r==='Weekdays'&&wd>0&&wd<6)||(r==='Weekly'&&diff%7===0)||(r==='Every 2 weeks'&&diff%14===0)||(r==='Monthly'&&d.slice(8)===e.date.slice(8));
}
function nextOcc(e,from=today()){if(!e.date)return null;if(!e.repeat||e.repeat==='Never')return e.date;for(let i=0;i<400;i++){const d=shiftDays(from,i);if(meetingOn(e,d))return d}return null}
const _subOf=subOf;
subOf=function(e){
  if(e.type==='meeting'&&e.repeat&&e.repeat!=='Never'){const n=nextOcc(e);return[e.repeat,fmtT(e.time),n?`next ${relDue(n)}`:'ended',e.with].filter(Boolean).join(' · ')}
  if(e.type==='ext')return[e.course||((SYNC.cals||[]).find(c=>c.id===e.cal)||{}).name||'Calendar',e.allDay?'':fmtT(e.start)].filter(Boolean).join(' · ');
  if(e.type==='job')return[e.role,e.next&&dayDiff(e.next)>=0?`next ${relDue(e.next)}`:e.date?`applied ${fmtDate(e.date)}`:''].filter(Boolean).join(' · ');
  if(e.type==='focus')return[e.project&&e.project!==e.title?e.project:'',fmtDate(e.date)].filter(Boolean).join(' · ');
  if(e.type==='project'){const s=e.steps||[],d=s.filter(x=>x.done).length,nx=s.find(x=>!x.done);return[s.length?`${d}/${s.length} steps`:'',nx?`Next: ${nx.t}`:e.next?`Next: ${e.next}`:''].filter(Boolean).join(' · ')}
  return _subOf(e);
};

/* ---------- projects: steps / action items ---------- */
function projProgress(e){const s=e.steps||[];return s.length?s.filter(x=>x.done).length/s.length:0}
function openProject(id){
  const e=find(id);if(!e)return;const s=e.steps||[],done=s.filter(x=>x.done).length,linked=of('task').filter(t=>t.project&&e.title&&t.project.trim().toLowerCase()===e.title.trim().toLowerCase());
  const html=`<div class="sh-h"><div class="lhs"><span class="cap">Project · ${esc(e.status||'Active')}</span></div><button type="button" class="x" data-close aria-label="Close">${ic('close')}</button></div>
    <div class="dhead">${tileE(e)}<div style="min-width:0"><h3>${esc(e.title||'Project')}</h3><div class="rs" style="margin-top:4px">${s.length?`${done} of ${s.length} steps done`:'No steps yet'}</div></div></div>
    ${s.length?`<div class="mbar pbar"><i style="width:${Math.round(projProgress(e)*100)}%"></i></div>`:''}
    <ul class="steps" id="stepList">${s.map(x=>`<li class="${x.done?'done':''}"><button class="chk${x.done?' on':''}" data-step="${e.id}:${x.id}" aria-label="${x.done?'Mark not done':'Mark done'}"><i><svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7"/></svg></i></button><span class="st">${esc(x.t)}${x.due?`<small>${esc(relDue(x.due))}</small>`:''}</span><button class="link" data-steptask="${e.id}:${x.id}" aria-label="Make a task">${ic('task')}</button><button class="link" data-stepdel="${e.id}:${x.id}" aria-label="Delete step">${ic('close')}</button></li>`).join('')}</ul>
    <div class="stepadd"><input id="stepIn" placeholder="Add a step or action item" enterkeyhint="done"><input id="stepDue" type="date" aria-label="Due date (optional)"><button class="primary" id="stepAdd" data-pid="${esc(e.id)}" aria-label="Add step">${ic('plus')}</button></div>
    ${linked.length?`<div class="cap" style="margin:16px 0 6px">Linked tasks</div>${list(linked,'')}`:''}
    ${e.notes?`<div class="cap" style="margin:16px 0 8px">Notes</div><div class="notes">${esc(e.notes)}</div>`:''}
    <div class="sh-actions"><button class="primary" data-edit="${esc(e.id)}">${ic('edit')}Edit project</button></div>`;
  if(!wrap.hidden&&wrap.classList.contains('open')&&$('#stepList')){const sb=$('.sheet').scrollTop;$('#sheetBody').innerHTML=html;$('.sheet').scrollTop=sb}else openSheet(html);
}
function addStep(pid){const e=find(pid),inp=$('#stepIn'),t=(inp.value||'').trim();if(!t){inp.focus();return}(e.steps=e.steps||[]).push({id:uid(),t,done:false,due:$('#stepDue').value||''});delete e.sample;save();render(false);openProject(pid);setTimeout(()=>{const i=$('#stepIn');i&&i.focus({preventScroll:true})},30);const li=$$('#stepList li').pop();if(li)anim(li,{y:[8,0],opacity:[.001,1]},{duration:.3})}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-step],[data-stepdel],[data-steptask],#stepAdd');if(!b)return;e.stopImmediatePropagation();
  if(b.id==='stepAdd'){addStep(b.dataset.pid);return}
  const[pid,sid]=(b.dataset.step||b.dataset.stepdel||b.dataset.steptask).split(':'),p=find(pid),s=(p.steps||[]).find(x=>x.id===sid);if(!s)return;
  if(b.dataset.step){s.done=!s.done;save();if(s.done)tick();render(false);openProject(pid);return}
  if(b.dataset.stepdel){p.steps=p.steps.filter(x=>x.id!==sid);save();render(false);openProject(pid);return}
  db.entries.push({id:uid(),type:'task',title:s.t,project:p.id,due:s.due||'',priority:'Normal',created:Date.now()});save();render(false);toast('Added to tasks');
},true);
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='stepIn'){e.preventDefault();addStep($('#stepAdd').dataset.pid)}});
const _openDetail2=openDetail;
openDetail=function(id){const e=find(id);if(e&&e.type==='project')return openProject(id);return _openDetail2(id)};

/* ---------- background curve: drawn once to a canvas (no live CSS blur) ---------- */
function drawBgCurve(){
  const host=document.getElementById('bgcurve');if(!host)return;
  let cv=host.querySelector('canvas');if(!cv){cv=document.createElement('canvas');host.prepend(cv)}
  const W=host.clientWidth||innerWidth,H=host.clientHeight||innerHeight,dpr=Math.min(2,devicePixelRatio||1);
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px';
  const x=cv.getContext('2d');if(!x)return;x.scale(dpr,dpr);
  const cs=getComputedStyle(document.documentElement),acc=cs.getPropertyValue('--accent').trim()||'#D9552E',sage=cs.getPropertyValue('--sage-soft').trim()||'#9DB4A3';
  const X=v=>v/100*W,Y=v=>v/100*H;
  const path=(o)=>{x.beginPath();x.moveTo(X(82+o),Y(-4));x.bezierCurveTo(X(18+o),Y(14),X(104+o),Y(34),X(50+o),Y(52));x.bezierCurveTo(X(-4+o),Y(70),X(-2+o),Y(80),X(64+o),Y(104))};
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,acc);g.addColorStop(.55,sage);g.addColorStop(1,acc);
  x.lineCap='round';x.strokeStyle=g;
  x.globalAlpha=.16;x.lineWidth=70;x.shadowColor=acc;x.shadowBlur=60;path(0);x.stroke();
  x.globalAlpha=.55;x.lineWidth=4;x.shadowBlur=10;path(0);x.stroke();
  x.globalAlpha=.25;x.lineWidth=1.4;x.shadowBlur=4;path(6);x.stroke();
}
let bgT;addEventListener('resize',()=>{clearTimeout(bgT);bgT=setTimeout(drawBgCurve,200)});

/* ---------- bigger food search: your server asks USDA (incl. branded) + Open Food Facts ---------- */
const _onlineSearch=onlineSearch;
onlineSearch=async function(){
  if(!syncOn())return _onlineSearch();
  const q=FL.q.trim();if(q.length<2)return;
  if(FL.online&&FL.online.q===q&&(FL.online.items||FL.online.loading))return;
  FL.online={q,loading:true};flRefresh(false);
  try{const r=await api(`/food/search?q=${encodeURIComponent(q)}`);
    FL.online={q,items:(r.items||[]).map(x=>({name:x.name,per100:x.per100,grams:x.servingG||100,servingG:x.servingG||null,src:x.src+(x.servingText?` · ${x.servingText}`:'')})),
      err:(r.errors||[]).some(e=>e.code==='rate')&&!(r.items||[]).length?'USDA’s free demo key is busy. Add your own free key in Settings → Connections → Food search.':null}}
  catch(e){FL.online={q,err:'Couldn’t reach your server: '+e.message}}
  if(FL.q.trim()===q)flRefresh(false);
};
let onlT;
document.addEventListener('input',e=>{if(e.target.id!=='fq'||!syncOn())return;clearTimeout(onlT);onlT=setTimeout(()=>{if(FL.q.trim().length>=2)onlineSearch()},550)});
function openFoodConn(){
  NAV_DIR=1;openSheet(`${sheetHead('Food <em>search</em>','conn')}${needSrv()}
    <div class="about"><p>When your server is connected, Log food also searches <b>USDA FoodData Central</b> (around 400,000 branded and generic foods) and <b>Open Food Facts</b> (millions of packaged foods) as you type, below the built-in list.</p>
    <p>It works with USDA’s shared demo key, but that’s limited to about 30 searches an hour. A free personal key gives 1,000 an hour: sign up at <a href="https://fdc.nal.usda.gov/api-key-signup" target="_blank" rel="noopener">fdc.nal.usda.gov/api-key-signup</a> (it’s emailed instantly) and paste it here.</p></div>
    <label class="fld" for="fdcKey"><span>USDA API key</span><input id="fdcKey" autocomplete="off" placeholder="Paste your key"></label>
    <div class="sh-actions" style="margin-top:0"><button class="primary" id="fdcSave" style="flex:1">Save key</button></div>`);
}
document.addEventListener('click',async e=>{const b=e.target.closest('#fdcSave');if(!b)return;e.stopImmediatePropagation();const k=$('#fdcKey').value.trim();if(!k){toast('Paste the key first');return}if(await putConfig({fdcKey:k}))toast('Key saved. Food search now uses it.')},true);

/* ---------- tab bar: press, hold and slide — the selector turns into a glass lens that follows your finger.
   Works along the bottom bar (phone upright) and down the side rail (sideways, iPad, laptop). ---------- */
(function(){
  const nav=document.querySelector('nav.tabs'),ind=document.getElementById('ind');if(!nav||!ind)return;
  let g=null,raf=0,x=0,v=0,tx=0,w=0,suppress=false,mag=null,VERT=false;
  const btns=()=>[...document.querySelectorAll('#tabs button')];
  const pos=b=>VERT?b.offsetTop:b.offsetLeft,len=b=>VERT?b.offsetHeight:b.offsetWidth,ptr=e=>VERT?e.clientY:e.clientX;
  const bounds=()=>{const b=btns();return[pos(b[0]),pos(b[b.length-1])+len(b[b.length-1])-w]};
  const under=c=>{let best=null,bd=1e9;for(const b of btns()){const d=Math.abs(c-(pos(b)+len(b)/2));if(d<bd){bd=d;best=b}}return best};
  const tr=(p,a,b)=>VERT?`translateY(${p.toFixed(2)}px) scale(${b.toFixed(3)},${a.toFixed(3)})`:`translateX(${p.toFixed(2)}px) scale(${a.toFixed(3)},${b.toFixed(3)})`;
  function frame(){
    const a=.22,d=.62;v=(v+(tx-x)*a)*d;x+=v;                          /* damped spring toward the finger */
    const sp=Math.min(1,Math.abs(v)/14),along=(VERT?1.42:1.62)+sp*.16,across=(VERT?1.3:1.36)-sp*.1;   /* stretch along the direction of travel */
    ind.style.transform=tr(x,along,across);
    if(mag){const sx=VERT?across:along,sy=VERT?along:across;   /* the copy inside lines up with the real bar; what you see through the lens is a steady 1.2× */
      mag.style.transformOrigin=VERT?`${mag.dataset.cx}px ${(x+w/2).toFixed(1)}px`:`${(x+w/2).toFixed(1)}px ${mag.dataset.cy}px`;
      mag.style.transform=`${VERT?`translateY(${(-x).toFixed(2)}px)`:`translateX(${(-x).toFixed(2)}px)`} scale(${(1.2/sx).toFixed(3)},${(1.2/sy).toFixed(3)})`}
    const u=under(x+w/2);btns().forEach(b=>b.classList.toggle('under',b===u));
    if(g&&g.lens||Math.abs(v)>.05||Math.abs(tx-x)>.3)raf=requestAnimationFrame(frame);else raf=0;
  }
  function buildMag(){mag?.remove();mag=document.createElement('span');mag.className='lmag';mag.setAttribute('aria-hidden','true');
    const top=ind.offsetTop,left=ind.offsetLeft;mag.dataset.cy=(top+ind.offsetHeight/2).toFixed(1);mag.dataset.cx=(left+ind.offsetWidth/2).toFixed(1);
    mag.style.cssText=VERT?`width:${nav.clientWidth}px;height:${nav.clientHeight}px;left:${-left}px;top:0`:`width:${nav.clientWidth}px;height:${nav.clientHeight}px;top:${-top}px`;
    for(const b of btns()){const c=document.createElement('span');c.className='lbtn';c.innerHTML=b.innerHTML;c.style.cssText=`left:${b.offsetLeft}px;top:${b.offsetTop}px;width:${b.offsetWidth}px;height:${b.offsetHeight}px`;mag.appendChild(c)}
    ind.appendChild(mag)}
  function startLens(){if(!g||g.lens)return;g.lens=true;buildMag();try{nav.setPointerCapture(g.id)}catch(err){}nav.classList.add('lensing');ind.classList.add('lens');ind.getAnimations?.().forEach(a=>a.cancel());
    try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}if(!raf)raf=requestAnimationFrame(frame)}
  nav.addEventListener('pointerdown',e=>{
    if(noMotion()||e.button>0)return;const b=e.target.closest('#tabs button');if(!b)return;
    VERT=RAIL();w=VERT?ind.offsetHeight:ind.offsetWidth;x=Number(VERT?ind.dataset.y:ind.dataset.x);if(!isFinite(x))x=pos(b);v=0;const r=nav.getBoundingClientRect();
    g={id:e.pointerId,s:ptr(e),r,lens:false,t:setTimeout(startLens,220)};
    tx=Math.max(bounds()[0],Math.min(bounds()[1],ptr(e)-(VERT?r.top:r.left)-w/2));
  });
  nav.addEventListener('pointermove',e=>{
    if(!g||e.pointerId!==g.id)return;
    const[lo,hi]=bounds();tx=Math.max(lo-10,Math.min(hi+10,ptr(e)-(VERT?g.r.top:g.r.left)-w/2));   /* a little rubber-band past the ends */
    if(!g.lens&&Math.abs(ptr(e)-g.s)>6){clearTimeout(g.t);startLens()}
  });
  function end(e){
    if(!g||(e&&e.pointerId!==g.id))return;clearTimeout(g.t);const was=g.lens;g=null;
    if(!was)return;
    suppress=true;setTimeout(()=>suppress=false,80);
    const[lo,hi]=bounds();x=Math.max(lo,Math.min(hi,x));
    const b=under(x+w/2);cancelAnimationFrame(raf);raf=0;
    btns().forEach(z=>z.classList.remove('under'));
    ind.style.transform=VERT?`translateY(${x.toFixed(2)}px)`:`translateX(${x.toFixed(2)}px)`;if(VERT)ind.dataset.y=x;else ind.dataset.x=x;
    ind.classList.remove('lens');nav.classList.remove('lensing');const m=mag;mag=null;setTimeout(()=>m?.remove(),260);
    if(b&&b.dataset.tab!==state.tab){const ks=Object.keys(TABS),dir=Math.sign(ks.indexOf(b.dataset.tab)-ks.indexOf(state.tab));state.tab=b.dataset.tab;if(b.dataset.tab!=='mind')state.folder=null;SC.scrollTop=0;render(true,false,dir);tick()}
    else moveInd(false);
  }
  nav.addEventListener('pointerup',end);nav.addEventListener('pointercancel',end);
  nav.addEventListener('click',e=>{if(suppress){e.stopPropagation();e.preventDefault();suppress=false}},true);
})();

/* ===================== all-day items (Canvas assignments etc.) ===================== */
const extDone=()=>(db.extDone=db.extDone||{});
const isExtDone=e=>!!extDone()[e.xid||String(e.id).replace(/^ext:/,'')];
function cleanExtTitle(t){const m=/^(.*?)\s*\[([^\]]+)\]\s*$/.exec(t||'');return m?{title:m[1],course:m[2].replace(/_\d{4,}.*$/,'').replace(/_/g,' ')}:{title:t||'(busy)',course:''}}
function allDayStrip(days,wide){
  const cols=days.map(d=>calItems(d).filter(e=>e.allDay));
  if(!cols.some(c=>c.length))return'';
  return`<div class="adstrip${wide?' wide':''}" style="grid-template-columns:28px ${days.length===7?wkCols(days):`repeat(${days.length},minmax(0,1fr))`}"><span class="adl">all<br>day</span>${cols.map(c=>`<div>${c.slice(0,wide?6:3).map(e=>`<button class="adchip${isExtDone(e)?' done':''}" data-open="${esc(e.id)}" style="--c:${calColor(e.cal)}" aria-label="${esc(e.title)}">${esc(e.title)}</button>`).join('')}${c.length>(wide?6:3)?`<span class="admore">+${c.length-(wide?6:3)}</span>`:''}</div>`).join('')}</div>`;
}
const calColor=id=>((SYNC.cals||[]).find(c=>c.id===id)||{}).color||'#6FC3F0';
function extDue(fromDays,toDays){const out=[];for(let i=fromDays;i<=toDays;i++){const d=addDays(i);extOn(d).filter(e=>e.allDay&&e.date===d&&!isExtDone(e)&&(e.start===''||true)).forEach(e=>{if(!out.some(x=>x.xid===e.xid))out.push({...e,due:d})})}return out}

/* ===================== adaptive calorie target ===================== */
/* expenditure = average intake − (Δ trend weight × 3,500 kcal/lb) ÷ days,  target = expenditure + goal rate × 3,500 ÷ 7 */
function energyModel(days=21){
  const end=today(),start=addDays(-days),food=of('food').filter(e=>e.date&&e.date>=start&&e.date<end);
  const byDay={};food.forEach(e=>byDay[e.date]=(byDay[e.date]||0)+num(e.kcal));
  const logged=Object.keys(byDay).filter(d=>byDay[d]>=600);  /* ignore days that were clearly not fully logged */
  const tr=trendSeries(weights()).filter(x=>x.date>=start);
  if(logged.length<10||tr.length<2)return{ok:false,logged:logged.length,weighIns:tr.length,need:'10 fully logged days and 2+ weigh-ins in the last 3 weeks'};
  const span=Math.max(7,(new Date(tr[tr.length-1].date)-new Date(tr[0].date))/864e5);
  const avgIn=logged.reduce((s,d)=>s+byDay[d],0)/logged.length,dTrend=tr[tr.length-1].t-tr[0].t;
  const tdee=avgIn-dTrend*3500/span,rate=num(db.settings.goalRate||0),target=tdee+rate*3500/7;
  return{ok:true,avgIn,dTrend,span,tdee,target,rate,logged:logged.length};
}
function adaptCheck(){
  const g=db.settings;if(!g.adaptive)return;if(g.adaptAt&&Date.now()-g.adaptAt<6*864e5)return;
  const m=energyModel();if(!m.ok)return;
  let next=Math.round(Math.max(1200,Math.min(5000,m.target))/10)*10;const prev=g.kcal;next=Math.max(prev-250,Math.min(prev+250,next));
  g.adaptAt=Date.now();g.kcalHist=[...(g.kcalHist||[]).slice(-11),{d:today(),k:next,tdee:Math.round(m.tdee)}];
  if(next!==prev){g.kcal=next;save();render(false);toast(`Weekly check-in: calorie target ${prev>next?'down':'up'} to ${fmtN(next)} (you burn about ${fmtN(m.tdee)}/day)`)}else save();
}
function energyCard(){
  const m=energyModel(),g=db.settings;
  if(!m.ok)return section('Energy <em>expenditure</em>',`<div class="card-s rvcard"><p class="small" style="margin:0">Life estimates what you burn from your trend weight and food log once it has ${esc(m.need)} (you have ${m.logged} logged days, ${m.weighIns} weigh-ins).</p></div>`);
  return section('Energy <em>expenditure</em>',`<div class="card-s rvcard">
    <div class="rvgrid"><div><b class="num">${fmtN(m.tdee)}</b><span>kcal/day you burn</span></div><div><b class="num">${fmtN(m.avgIn)}</b><span>avg eaten (${m.logged} days)</span></div><div><b class="num">${m.dTrend>0?'+':'−'}${Math.abs(m.dTrend).toFixed(1)}</b><span>lb trend, ${Math.round(m.span)} days</span></div></div>
    <p class="small" style="margin:0">Burn = ${fmtN(m.avgIn)} − (${m.dTrend.toFixed(2)} lb × 3,500) ÷ ${Math.round(m.span)} days. ${g.adaptive?`Your target updates weekly toward ${m.rate>0?'+':''}${m.rate} lb/week: <b>${fmtN(Math.round(m.target/10)*10)} kcal</b>.`:'Turn on <b>Adaptive target</b> in Settings → Goals to update your calories from this every week.'}</p></div>`);
}

/* ===================== focus timer (Pomodoro) =====================
   Pomodoro technique: work in focused blocks (default 25 min), short break (5) after each,
   long break (15) after every 4th block. Everything is adjustable; a plain single timer is also there. */
const FOCUS=()=>db.focusNow||null;
const PDEF={mode:'pomo',focus:25,short:5,long:15,rounds:4,autoBreak:true,autoFocus:false,single:25};
const PS=()=>({...PDEF,...(db.settings.pomo||{})});
const fmtDur=min=>{const m=Math.round(num(min)*10)/10;if(m<1)return`${Math.max(0,Math.round(m*60))} sec`;if(m<60)return`${Math.round(m)} min`;const h=Math.floor(m/60),r=Math.round(m%60);return r?`${h} h ${r} min`:`${h} h`};
const fmtDurS=min=>{const m=num(min);if(m<=0)return'0m';if(m<1)return`${Math.max(0,Math.round(m*60))}s`;if(m<60)return`${Math.round(m)}m`;return`${(m/60).toFixed(1)}h`};
const PHASE={focus:['Focus','#F06D44'],short:['Short break','#86CFA0'],long:['Long break','#6FC3F0'],ready:['Ready','#A39C8E']};
function phaseLen(f,ph){const p=f.cfg;return ph==='focus'?(f.mode==='single'?p.single:p.focus):ph==='short'?p.short:ph==='long'?p.long:0}
function focusLeft(){const f=FOCUS();if(!f||f.phase==='ready')return 0;if(f.paused!=null)return f.paused;return Math.max(0,f.pStart+phaseLen(f,f.phase)*6e4-Date.now())}
function focusElapsedNow(f){if(!f||f.phase!=='focus')return 0;const len=phaseLen(f,'focus')*6e4;return Math.max(0,Math.min(len,len-(f.paused!=null?f.paused:Math.max(0,f.pStart+len-Date.now()))))}

function openFocusStart(ref){
  if(FOCUS())return openFocusRun();
  const r=ref?find(ref):null,opts=[...of('task').filter(e=>!e.done),...of('project').filter(e=>e.status!=='Done')].slice(0,30),p=PS();
  const step=(k,lab,min,max,st)=>`<div class="pstep"><span>${lab}</span><div class="stp"><button data-pstep="${k}|-${st}|${min}|${max}" aria-label="Less">−</button><b class="num" id="ps_${k}">${p[k]}</b><i>min</i><button data-pstep="${k}|${st}|${min}|${max}" aria-label="More">+</button></div></div>`;
  const tg=(k,lab)=>`<button class="ptog" data-ptog="${k}" aria-pressed="${!!p[k]}"><span>${lab}</span><i></i></button>`;
  const w=focusWeek(),td=of('focus').filter(e=>e.date===today()).reduce((s,e)=>s+num(e.minutes),0);
  openSheet(`${sheetHead('<em>Focus</em> · Pomodoro')}
    <div class="fcstat"><div><b class="num">${fmtDurS(td)}</b><span>today</span></div><div><b class="num">${fmtDurS(w.total)}</b><span>this week</span></div><button class="link" id="fcLog">${ic('list')}Log</button></div>
    <label class="fld" for="fcRef"><span>Working on</span>${selectHTML('fcref',[['','Something else'],...opts.map(e=>[e.id,`${e.type==='project'?'Project':'Task'}: ${e.title}`])],r?r.id:'','fcRef')}</label>
    <label class="fld" for="fcLabel"><span>Label (optional)</span><input id="fcLabel" placeholder="e.g. Problem set 4" value=""></label>
    <div class="seg2" id="fcMode" style="margin-bottom:14px"><button data-fcmode="pomo" aria-pressed="${p.mode==='pomo'}">Pomodoro</button><button data-fcmode="single" aria-pressed="${p.mode==='single'}">Single timer</button></div>
    <div id="fcPomo" ${p.mode==='pomo'?'':'hidden'}><div class="card-s pcard">${step('focus','Focus',5,120,5)}${step('short','Short break',1,30,1)}${step('long','Long break',5,60,5)}<div class="pstep"><span>Rounds before long break</span><div class="stp"><button data-pstep="rounds|-1|1|8" aria-label="Less">−</button><b class="num" id="ps_rounds">${p.rounds}</b><i></i><button data-pstep="rounds|1|1|8" aria-label="More">+</button></div></div>${tg('autoBreak','Start breaks automatically')}${tg('autoFocus','Start next focus automatically')}</div></div>
    <div id="fcSingle" ${p.mode==='single'?'':'hidden'}><div class="card-s pcard">${step('single','Length',5,240,5)}</div></div>
    <div class="sh-actions"><button class="primary" id="fcGo" style="flex:1">${ic('play')}Start</button></div>
    <p class="small">Your phone gets a notification when each block ends, even with Life closed (needs notifications on).</p>`);
}
function startFocus(){
  const ref=$('#sheetBody input[name=fcref]').value,lbl=$('#fcLabel').value.trim(),p=PS(),r=ref?find(ref):null;
  db.focusNow={id:uid(),started:Date.now(),label:lbl||(r?r.title:'Focus'),ref:ref||'',mode:p.mode,cfg:p,phase:'focus',round:1,pStart:Date.now(),paused:null,focusMs:0,done:0};
  save();pushSchedule(true);closeSheet();setTimeout(openFocusRun,200);
}
/* move to the next phase when one ends */
function advanceFocus(){
  const f=FOCUS();if(!f)return;
  if(f.phase==='focus'){f.focusMs+=phaseLen(f,'focus')*6e4;f.done++;
    if(f.mode==='single'){save();return focusReview(true)}
    const nx=f.done%f.cfg.rounds===0?'long':'short';
    if(f.cfg.autoBreak){f.phase=nx;f.pStart=Date.now();f.paused=null}else{f.phase='ready';f.nextPhase=nx}
    notifyLocal(`Block ${f.done} done`,`Take ${phaseLen(f,nx)} min.`);
  }else if(f.phase==='short'||f.phase==='long'){
    if(f.cfg.autoFocus){f.phase='focus';f.round++;f.pStart=Date.now();f.paused=null}else{f.phase='ready';f.nextPhase='focus'}
    notifyLocal('Break over','Ready for the next block?');
  }
  save();pushSchedule(true);tick();paintFocus();
}
function notifyLocal(t,b){try{if(document.hidden)return;toast(`${t} · ${b}`)}catch(e){}}

/* full-screen timer: nothing closes it by accident; ⌄ hides it into a small pill */
function openFocusRun(){
  const f=FOCUS();if(!f)return openFocusStart();
  if(!wrap.hidden)closeSheet();
  let v=$('#fcView');if(!v){v=document.createElement('div');v.id='fcView';v.setAttribute('role','dialog');v.setAttribute('aria-label','Focus timer');document.body.appendChild(v)}
  v.innerHTML=`<div class="fv-top"><button class="fv-btn" id="fcHide" aria-label="Minimize">${ic('chev','i chev d')}</button><span class="cap" id="fvMode"></span><button class="fv-btn" id="fcLog2" aria-label="Focus log">${ic('list')}</button></div>
    <div class="fv-label">${esc(f.label)}</div>
    <div class="fv-ring"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="90" class="bg"/><circle cx="100" cy="100" r="90" class="fg" id="fcArc" pathLength="1000" stroke-dasharray="1000 1000"/></svg>
      <div class="fv-mid"><span class="fv-ph" id="fvPh"></span><b class="num" id="fcT">--:--</b><span class="fv-dots" id="fvDots"></span></div></div>
    <div class="fv-acts" id="fvActs"></div>
    <div class="fv-foot" id="fvFoot"></div>`;
  v.hidden=false;requestAnimationFrame(()=>v.classList.add('on'));pill();paintFocus();
  clearInterval(fcTimer);fcTimer=setInterval(focusTick,500);
}
let fcTimer=null;
function hideFocus(){const v=$('#fcView');if(!v)return;v.classList.remove('on');setTimeout(()=>{if(!v.classList.contains('on'))v.hidden=true},320);pill()}
function focusTick(){const f=FOCUS();if(!f){clearInterval(fcTimer);pill();return}if(f.phase!=='ready'&&f.paused==null&&focusLeft()<=0){advanceFocus();return}paintFocus(true);pill()}
function paintFocus(light){
  const f=FOCUS(),v=$('#fcView');if(!f||!v||v.hidden||!$('#fcT'))return;
  const ph=f.phase==='ready'?'ready':f.phase,len=phaseLen(f,ph)*6e4,ms=focusLeft(),s=Math.ceil(ms/1000);
  v.style.setProperty('--pc',PHASE[ph][1]);
  $('#fcT').textContent=f.phase==='ready'?`${phaseLen(f,f.nextPhase)}:00`:`${Math.floor(s/60)}:${pad(s%60)}`;
  $('#fcArc').setAttribute('stroke-dasharray',`${f.phase==='ready'?1000:(1000*ms/Math.max(1,len)).toFixed(1)} 1000`);
  $('#fvPh').textContent=f.phase==='ready'?`Up next: ${PHASE[f.nextPhase][0].toLowerCase()}`:f.paused!=null?`${PHASE[ph][0]} · paused`:PHASE[ph][0];
  $('#fvMode').textContent=f.mode==='single'?'Single timer':`Pomodoro · round ${((f.round-1)%f.cfg.rounds)+1} of ${f.cfg.rounds}`;
  $('#fvDots').innerHTML=f.mode==='single'?'':[...Array(f.cfg.rounds)].map((_,i)=>`<i class="${i<f.done%f.cfg.rounds||(f.done&&f.done%f.cfg.rounds===0&&f.phase==='long')?'on':''}"></i>`).join('');
  const tot=f.focusMs+focusElapsedNow(f);
  $('#fvFoot').textContent=`${fmtDur(tot/6e4)} focused · ${f.done} block${f.done===1?'':'s'} done`;
  if(light&&$('#fvActs').dataset.k===`${f.phase}|${f.paused!=null}`)return;
  $('#fvActs').dataset.k=`${f.phase}|${f.paused!=null}`;
  $('#fvActs').innerHTML=f.phase==='ready'
    ?`<button class="fv-main" id="fcNext">${ic('play')}Start ${PHASE[f.nextPhase][0].toLowerCase()}</button><div class="fv-row"><button class="fv-sec" id="fcSkip">${f.nextPhase==='focus'?'Skip':'Skip break'}</button><button class="fv-sec" id="fcStop">Finish</button></div>`
    :`<button class="fv-main" id="fcPause">${f.paused!=null?`${ic('play')}Resume`:`${ic('pause')}Pause`}</button><div class="fv-row"><button class="fv-sec" id="fcSkip">${f.phase==='focus'?'Skip to break':'Skip break'}</button><button class="fv-sec" id="fcStop">Finish</button></div>`;
}
/* small floating timer on every screen while a session runs */
function pill(){
  const f=FOCUS(),v=$('#fcView'),show=f&&(!v||v.hidden||!v.classList.contains('on'));let p=$('#fcPill');
  if(!show){if(p)p.remove();return}
  if(!p){p=document.createElement('button');p.id='fcPill';p.setAttribute('aria-label','Open focus timer');document.body.appendChild(p);p.addEventListener('click',e=>{e.stopPropagation();openFocusRun()})}
  const ph=f.phase==='ready'?'ready':f.phase,s=Math.ceil(focusLeft()/1000);p.style.setProperty('--pc',PHASE[ph][1]);
  p.innerHTML=`<i></i><span>${f.phase==='ready'?'Ready':esc(PHASE[ph][0])}</span><b class="num">${f.phase==='ready'?'▶':`${Math.floor(s/60)}:${pad(s%60)}`}${f.paused!=null?' ⏸':''}</b>`;
}
function skipPhase(){const f=FOCUS();if(!f)return;
  if(f.phase==='focus'){const el=focusElapsedNow(f);f.focusMs+=el;f.done++;const nx=f.mode==='single'?null:(f.done%f.cfg.rounds===0?'long':'short');if(!nx){save();return focusReview(true)}f.phase=nx;f.pStart=Date.now();f.paused=null}
  else if(f.phase==='ready'){if(f.nextPhase==='focus'){f.phase='focus';f.round++;f.pStart=Date.now();f.paused=null}else{f.phase='focus';f.round++;f.pStart=Date.now();f.paused=null}}
  else{f.phase='focus';f.round++;f.pStart=Date.now();f.paused=null}
  save();pushSchedule(true);paintFocus()}
/* finish: rate how it went, then it's saved to your focus log */
function focusReview(auto){
  const f=FOCUS();if(!f)return;if(f.phase==='focus'&&!auto){f.focusMs+=focusElapsedNow(f);f.phase='ready';f.nextPhase='focus'}f.ended=f.ended||Date.now();f.paused=null;save();pushSchedule(true);
  const v=$('#fcView');if(!v||v.hidden)openFocusRun();
  const min=f.focusMs/6e4;
  $('#fcView').innerHTML=`<div class="fv-top"><span></span><span class="cap">Session done</span><span></span></div>
    <div class="fv-done"><b class="num">${esc(fmtDur(min))}</b><span>focused on ${esc(f.label)} · ${f.done} block${f.done===1?'':'s'}</span></div>
    <div class="cap" style="text-align:center;margin:18px 0 10px">How focused were you?</div>
    <div class="fv-rate" id="fvRate">${[['1','😵'],['2','😕'],['3','🙂'],['4','😀'],['5','🔥']].map(([n,e])=>`<button data-frate="${n}" aria-pressed="false" aria-label="${n} of 5"><span>${e}</span><small>${n}</small></button>`).join('')}</div>
    <label class="fld" for="fvNote" style="margin:16px 0 0"><span>What did you get done? (optional)</span><textarea id="fvNote" rows="2" placeholder="e.g. Finished Q1–Q3"></textarea></label>
    <div class="fv-acts"><button class="fv-main" id="fcSave">${ic('check')}Save to log</button><div class="fv-row"><button class="fv-sec" id="fcCancel">Discard</button></div></div>`;
}
function finishFocus(discard){
  const f=FOCUS();if(!f)return;db.focusNow=null;clearInterval(fcTimer);
  const min=Math.round(f.focusMs/6e3)/10;
  if(!discard&&min>0){const r=f.ref?find(f.ref):null,rt=$('#fvRate [aria-pressed="true"]');
    db.entries.push({id:uid(),type:'focus',title:f.label,ref:f.ref,refType:r?r.type:'',project:r?(r.type==='project'?r.title:(typeof projLabel==='function'?projLabel(r):r.project)||''):'',minutes:min,blocks:f.done,rating:rt?+rt.dataset.frate:'',notes:($('#fvNote')||{}).value||'',start:f.started,end:f.ended||Date.now(),mode:f.mode,date:iso(new Date(f.started)),created:Date.now()})}
  save();pushSchedule(true);hideFocus();pill();render(false);
  if(!discard&&min>0){tick();toast(`${fmtDur(min)} of focus saved`)}else if(!discard)toast('Nothing to save yet');
}
function openFocusLog(){
  const all=of('focus').slice().sort((a,b)=>(b.start||b.created||0)-(a.start||a.created||0)),w=focusWeek(),rated=all.filter(e=>e.rating),avg=rated.length?(rated.reduce((s,e)=>s+num(e.rating),0)/rated.length):0;
  const byDay={};all.slice(0,80).forEach(e=>{(byDay[e.date]=byDay[e.date]||[]).push(e)});
  const t=ms=>ms?new Date(ms).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'';
  NAV_DIR=1;openSheet(`${sheetHead('Focus <em>log</em>')}
    <div class="fcstat"><div><b class="num">${fmtDurS(w.total)}</b><span>this week</span></div><div><b class="num">${w.n}</b><span>sessions</span></div><div><b class="num">${avg?avg.toFixed(1):'–'}</b><span>avg focus /5</span></div></div>
    ${w.by.length?`<div class="cap" style="margin:6px 0 8px">This week by task</div><div class="card-s pcard">${w.by.slice(0,6).map(([k,m])=>`<div class="fbar"><span>${esc(k)}</span><i style="--w:${Math.round(m/w.by[0][1]*100)}%"></i><b class="num">${fmtDurS(m)}</b></div>`).join('')}</div>`:''}
    ${Object.keys(byDay).length?Object.entries(byDay).map(([d,l])=>`<div class="cap" style="margin:16px 0 8px">${esc(dayDiff(d)===0?'Today':dayDiff(d)===-1?'Yesterday':fmtLong(d))} · ${fmtDurS(l.reduce((s,e)=>s+num(e.minutes),0))}</div>${l.map(e=>`<button class="trow flog" data-open="${esc(e.id)}"><span class="fl-main"><b>${esc(e.title||'Focus')}</b><small>${esc([t(e.start),e.blocks?`${e.blocks} block${e.blocks==1?'':'s'}`:'',e.notes].filter(Boolean).join(' · '))}</small></span><span class="fl-r"><b class="num">${fmtDurS(e.minutes)}</b>${e.rating?`<small>${['','😵','😕','🙂','😀','🔥'][e.rating]||''}</small>`:''}</span></button>`).join('')}`).join(''):'<p class="hint">Finished sessions show up here with how long you focused and how it went.</p>'}`);
}
function focusWeek(off=0){const days=weekRange(off),a=days[0],z=days[6];const f=of('focus').filter(e=>e.date>=a&&e.date<=z);const by={};f.forEach(e=>{const k=e.project||e.title||'Focus';by[k]=(by[k]||0)+num(e.minutes)});return{total:f.reduce((s,e)=>s+num(e.minutes),0),by:Object.entries(by).sort((x,y)=>y[1]-x[1]),n:f.length}}
function focusSection(){
  const w=focusWeek();
  return section('Focus <em>this week</em>',`<div class="card-s rvcard"><div class="rvgrid"><div><b class="num">${fmtDurS(w.total)}</b><span>${w.n} session${w.n===1?'':'s'}</span></div>${w.by.slice(0,2).map(([k,m])=>`<div><b class="num">${fmtDurS(m)}</b><span>${esc(k)}</span></div>`).join('')}</div><div class="sh-actions" style="margin:4px 0 0"><button class="secondary" data-focus="" style="flex:1">${ic('play')}${FOCUS()?'Open timer':'Start Pomodoro'}</button><button class="secondary" id="fcLog3">${ic('list')}Log</button></div></div>`,`<button class="link" data-focus="">${ic('plus')}Focus</button>`);
}

/* ===================== habits ===================== */
const habits=()=>(db.habits=db.habits||[]);
const hlog=()=>(db.hlog=db.hlog||{});
const hCount=(h,d)=>((hlog()[d]||{})[h.id])||0;
function hStreak(h){let n=0;for(let i=0;i<400;i++){const d=addDays(-i);if(hCount(h,d)>=h.target)n++;else if(i===0)continue;else break}return n}
function habitSection(){
  const hs=habits(),td=today();
  if(!hs.length)return section('<em>Habits</em>',`<div class="card-s rvcard"><p class="small" style="margin:0 0 10px">Track small daily things in one tap. Pick as many as you like.</p>${habitChips(6)}<button class="link" id="hEdit2" style="margin-top:10px">${ic('plus')}More habits or your own</button></div>`);
  return section('<em>Habits</em>',`<div class="habits">${hs.map(h=>{const c=hCount(h,td),p=Math.min(1,c/h.target),s=hStreak(h);
    return`<button class="habit${p>=1?' on':''}" data-habit="${esc(h.id)}" aria-label="${esc(h.name)}, ${c} of ${h.target}"><span class="hring" style="--p:${(p*100).toFixed(0)}%"><span>${esc(h.icon||'✓')}</span></span><b>${esc(h.name)}</b><small>${h.target>1?`${c}/${h.target}`:p>=1?'Done':'Tap when done'}${s>1?` · 🔥${s}`:''}</small></button>`}).join('')}<button class="habit hmore" id="hEdit" aria-label="Add or edit habits"><span class="hring" style="--p:0%"><span>${ic('plus')}</span></span><b>Add</b><small>More habits</small></button></div>`,`<button class="link" id="hEdit2">${ic('edit')}Edit</button>`);
}
const HABIT_SUGG=[['💧','Water',8],['💊','Creatine',1],['😴','Sleep 7h+',1],['📚','Read',1],['🚶','10k steps',1],['🏋️','Gym',1],['🧘','Meditate',1],['🤸','Stretch',1],['📝','Journal',1],['🥦','Veggies',3],['🚫','No sugar',1],['💊','Vitamins',1],['🦷','Floss',1],['📵','No phone in bed',1],['🌅','Up by 8',1],['🧠','Study 1h',1]];
function habitChips(max){const have=new Set(habits().map(h=>h.name.toLowerCase()));const l=HABIT_SUGG.filter(([,n])=>!have.has(n.toLowerCase())).slice(0,max||99);
  return l.length?`<div class="hsugg">${l.map(([e,n,t])=>`<button class="chip" data-hadd="${esc(e)}|${esc(n)}|${t}">${e} ${esc(n)}${t>1?` <small>${t}×</small>`:''}</button>`).join('')}</div>`:''}
function openHabits(){
  const body=`${sheetHead('<em>Habits</em>')}
    ${habits().map(h=>`<div class="trow hrow" style="cursor:default"><span class="hico">${esc(h.icon||'✓')}</span><span class="hmain"><b>${esc(h.name)}</b><small>${h.target}× a day · 🔥 ${hStreak(h)} day streak</small></span><button class="link" data-hdel="${esc(h.id)}">Remove</button></div>`).join('')||'<p class="hint">No habits yet.</p>'}
    ${habitChips()?`<div class="set-grp">Quick add</div>${habitChips()}`:''}
    <div class="set-grp">Your own</div>
    <div class="qa" style="grid-template-columns:72px minmax(0,1fr) 90px"><label class="fld" for="hIco"><span>Emoji</span><input id="hIco" maxlength="4" placeholder="💧"></label><label class="fld" for="hName"><span>Name</span><input id="hName" placeholder="e.g. Stretch"></label><label class="fld" for="hT"><span>Times/day</span><input id="hT" type="number" inputmode="numeric" value="1"></label></div>
    <div class="sh-actions" style="margin-top:0"><button class="primary" id="hSave" style="flex:1">Add habit</button></div>
    <p class="small">Tap a habit on Today to count it. Tapping a finished habit resets that day.</p>`;
  if(!wrap.hidden&&wrap.classList.contains('open')&&$('#sheetBody #hSave'))$('#sheetBody').innerHTML=body;else openSheet(body);
}

/* ===================== job applications ===================== */
const STAGES=['Saved','Applied','Assessment','Interview','Offer','Rejected'];
function viewJobs(){
  const a=of('job'),by=s=>a.filter(e=>(e.stage||'Applied')===s);
  const active=a.filter(e=>!['Offer','Rejected'].includes(e.stage||'Applied')).length,resp=a.filter(e=>['Assessment','Interview','Offer'].includes(e.stage)).length,applied=a.filter(e=>e.stage!=='Saved').length;
  let h=chipsSub('work')+heroBanner('Job search',`${active}`,`active application${active===1?'':'s'}${applied?` · <b>${Math.round(resp/applied*100)}%</b> got a response`:''}`,STAGES.slice(1,5).map(s=>[s,by(s).length]),'#9DB4FF',
    `<div class="hero-actions"><button class="pill light" data-add="job">${ic('plus')}Add application</button></div>`);
  const up=a.filter(e=>e.next&&dayDiff(e.next)>=0&&!['Offer','Rejected'].includes(e.stage)).sort((x,y)=>x.next.localeCompare(y.next));
  if(up.length)h+=section('Coming <em>up</em>',list(up,''));
  for(const s of ['Interview','Assessment','Offer','Applied','Saved'])if(by(s).length)h+=section(s,list(by(s).sort(byDateDesc),''));
  if(by('Rejected').length)h+=`<details class="sec"><summary class="sec-h"><h2>Rejected · ${by('Rejected').length}</h2></summary>${list(by('Rejected'),'')}</details>`;
  return a.length?h:h+emptyBox('Add the roles you apply to and move them through the stages.');
}
function openJob(id){
  const e=find(id);if(!e)return;const st=e.stage||'Applied',hist=e.history||[];
  const html=`<div class="sh-h"><div class="lhs"><span class="cap">Application</span></div><button type="button" class="x" data-close aria-label="Close">${ic('close')}</button></div>
    <div class="dhead">${tileE(e)}<div style="min-width:0"><h3>${esc(e.title||'Company')}</h3><div class="rs" style="margin-top:4px">${esc([e.role,e.date?`applied ${fmtDate(e.date)}`:''].filter(Boolean).join(' · '))}</div></div></div>
    <div class="stages">${STAGES.map(s=>`<button data-jstage="${e.id}|${s}" aria-pressed="${s===st}" class="${s==='Rejected'?'rej':''}">${s}</button>`).join('')}</div>
    ${e.next?`<ul class="kv"><li><span class="cap">Next date</span><b>${esc(fmtLong(e.next))} · ${esc(relDue(e.next))}</b></li></ul>`:''}
    ${e.link?`<p><a class="link" href="${esc(/^https?:/.test(e.link)?e.link:'https://'+e.link)}" target="_blank" rel="noopener">${ic('link')}Open job posting</a></p>`:''}
    ${hist.length?`<div class="cap" style="margin:14px 0 6px">History</div><ul class="rvlist">${hist.slice().reverse().map(x=>`<li>${ic('check')}${esc(x.stage)} · ${esc(fmtDate(x.date))}</li>`).join('')}</ul>`:''}
    ${e.notes?`<div class="cap" style="margin:16px 0 8px">Notes</div><div class="notes">${esc(e.notes)}</div>`:''}
    <div class="sh-actions"><button class="primary" data-edit="${esc(e.id)}">${ic('edit')}Edit</button></div>`;
  if(!wrap.hidden&&wrap.classList.contains('open')&&$('#sheetBody .stages')){$('#sheetBody').innerHTML=html}else openSheet(html);
}

/* ===================== wiring ===================== */
const _openDetail3=openDetail;
openDetail=function(id){const e=find(id);if(e&&e.type==='job')return openJob(id);if(e&&e.type==='focus')return _openDetail2(id);return _openDetail3(id)};
const _openExt=openExt;
openExt=function(xid){_openExt(xid);const v=(CALC.ev||[]).find(x=>x.id===xid);if(!v||!v.allDay)return;const act=$('#sheetBody');if(!act)return;act.insertAdjacentHTML('beforeend',`<div class="sh-actions"><button class="primary" data-xdone="${esc(xid)}" style="flex:1">${extDone()[xid]?'Mark not done':'Mark done'}</button></div>`)};
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-xdone],[data-focus],#fcGo,#fcStop,#fcCancel,#fcOpen,#fcHide,#fcPause,#fcNext,#fcSkip,#fcSave,#fcLog,#fcLog2,#fcLog3,[data-fcmode],[data-pstep],[data-ptog],[data-frate],[data-habit],[data-hadd],#hEdit,#hEdit2,#hSave,[data-hdel],[data-jstage],[data-mailjob]');if(!b)return;
  e.stopImmediatePropagation();e.preventDefault();const d=b.dataset;
  if(d.xdone){const x=extDone();if(x[d.xdone])delete x[d.xdone];else{x[d.xdone]=Date.now();tick()}save();closeSheet();render(false);return}
  if(d.focus!==undefined){if(FOCUS())openFocusRun();else openFocusStart(d.focus||null);return}
  if(d.fcmode){const p=PS();p.mode=d.fcmode;db.settings.pomo=p;save();b.parentElement.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#fcPomo').hidden=d.fcmode!=='pomo';$('#fcSingle').hidden=d.fcmode!=='single';return}
  if(d.pstep){const[k,st,mn,mx]=d.pstep.split('|').map((x,i)=>i?+x:x),p=PS();p[k]=Math.max(mn,Math.min(mx,p[k]+st));db.settings.pomo=p;save();const el=$('#ps_'+k);if(el)el.textContent=p[k];return}
  if(d.ptog){const p=PS();p[d.ptog]=!p[d.ptog];db.settings.pomo=p;save();b.setAttribute('aria-pressed',String(p[d.ptog]));return}
  if(d.frate){b.parentElement.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));return}
  if(d.habit){const h=habits().find(x=>x.id===d.habit),td=today(),L=hlog();L[td]=L[td]||{};const c=hCount(h,td);L[td][h.id]=c>=h.target?0:c+1;save();render(false);if(L[td][h.id]>=h.target){tick();const n=$(`[data-habit="${esc(h.id)}"]`);if(n)anim(n,{scale:[.85,1]},{spring:true,k:500,d:12})}return}
  if(d.hadd){const[icon,name,t]=d.hadd.split('|');habits().push({id:uid(),icon,name,target:+t||1});save();render(false);if($('#sheetBody #hSave'))openHabits();toast(`${icon} ${name} added`);return}
  if(d.hdel){db.habits=habits().filter(x=>x.id!==d.hdel);save();render(false);openHabits();return}
  if(d.jstage){const[id,s]=d.jstage.split('|'),j=find(id);if(j.stage!==s){j.stage=s;(j.history=j.history||[]).push({stage:s,date:today()});if(s==='Applied'&&!j.date)j.date=today();delete j.sample;save();render(false);if(s==='Offer'){tick();toast('Offer! 🎉')}}openJob(id);return}
  if(d.mailjob){const m=(MAILC.items||[]).find(x=>x.id===d.mailjob);if(m){const co=(m.from||'').replace(/<.*>/,'').replace(/["']/g,'').trim()||'Company';db.entries.push({id:uid(),type:'job',title:co,role:m.subject||'',stage:'Applied',date:today(),link:m.link||'',history:[{stage:'Applied',date:today()}],created:Date.now()});save();render(false);toast('Added to job applications')}return}
  switch(b.id){
    case'fcGo':startFocus();return;
    case'fcStop':focusReview(false);return;
    case'fcSave':finishFocus(false);return;
    case'fcCancel':arm(b,'Tap again to discard',()=>finishFocus(true));return;
    case'fcOpen':openFocusRun();return;
    case'fcHide':hideFocus();return;
    case'fcPause':{const f=FOCUS();if(!f)return;if(f.paused!=null){f.pStart=Date.now()-(phaseLen(f,f.phase)*6e4-f.paused);f.paused=null}else f.paused=focusLeft();save();pushSchedule(true);paintFocus();return}
    case'fcNext':case'fcSkip':skipPhase();return;
    case'fcLog':case'fcLog3':openFocusLog();return;
    case'fcLog2':hideFocus();setTimeout(openFocusLog,250);return;
    case'hEdit':case'hEdit2':openHabits();return;
    case'hSave':{const name=$('#hName').value.trim();if(!name){toast('Name the habit');return}habits().push({id:uid(),icon:$('#hIco').value.trim()||'✓',name,target:Math.max(1,Math.min(20,num($('#hT').value)||1))});save();render(false);openHabits();return}
  }
},true);
/* keep the pill and phases moving even when the big timer is hidden */
setInterval(()=>{const f=FOCUS();if(!f){pill();return}if(!$('#fcView')||$('#fcView').hidden){if(f.phase!=='ready'&&f.paused==null&&focusLeft()<=0&&!f.ended)advanceFocus();pill()}},1000);
/* sessions saved by the old timer had no phase info: migrate a running one */
(function(){const f=db.focusNow;if(f&&!f.phase){db.focusNow={id:uid(),started:f.start,label:f.label,ref:f.ref||'',mode:'single',cfg:{...PS(),single:f.dur},phase:'focus',round:1,pStart:f.start,paused:null,focusMs:0,done:0}}
  setTimeout(pill,600)})();

/* ===================== diagnostics: one screen that shows what each connection returns ===================== */
async function openDiag(){
  NAV_DIR=1;openSheet(`${sheetHead('Connection <em>check</em>','conn')}<div id="diagOut"><p class="hint">Checking your server…</p></div>`);
  const out=[],row=(name,ok,detail)=>out.push(`<div class="trow" style="cursor:default;align-items:flex-start"><span>${ok?'✅':'⚠️'} ${esc(name)}<small style="white-space:normal;word-break:break-word">${detail}</small></span></div>`);
  const t=async(fn)=>{try{return{v:await fn()}}catch(e){return{e:e.message||String(e)}}};
  const paint=()=>{const el=$('#diagOut');if(el)el.innerHTML=out.join('')+'<p class="small">Screenshot this screen and send it to Claude if something shows ⚠️.</p>'};
  if(!syncOn()){row('Server',false,'Not connected. Paste your server address in Connections.');return paint()}
  const st=await t(()=>api('/status'));
  if(st.e){row('Server',false,'Can’t reach it: '+esc(st.e));return paint()}
  const c=st.v.connections||{};
  row('Server',true,`${esc(SYNC.url.replace(/^https:\/\//,''))} · ${(st.v.calendars||[]).length} calendars on server · ${st.v.scheduleCount||0} notifications queued`);
  row('Notifications',!!c.pushSubscribed,c.pushSubscribed?'This phone is registered for push.':'This phone isn’t registered. Open Notifications and turn Allow notifications on.');
  const cal=await t(()=>api(`/calendar?from=${addDays(-7)}&to=${addDays(30)}`));
  row('Calendars',!cal.e&&!(cal.v.errors||[]).length,cal.e?esc(cal.e):`${(cal.v.events||[]).length} events in the next month${(cal.v.errors||[]).length?' · errors: '+esc(cal.v.errors.map(x=>x.cal+': '+x.message).join('; ')):''}`);
  paint();
  const ml=await t(()=>api('/mail'));
  const gm=c.gmailUpdated?`Gmail last sent ${ago(c.gmailUpdated)}`:'Gmail script has never sent anything (run syncGmail in Apps Script)';
  row('Email',!ml.e&&!!c.gmailUpdated,ml.e?esc(ml.e):`${(ml.v.items||[]).length} unread · ${gm} · Outlook ${c.outlookMail?'connected':'not connected'}${(ml.v.errors||[]).length?' · errors: '+esc(ml.v.errors.map(x=>x.source+': '+(x.code||'')+' '+x.message).join('; ')):''}${SYNC.mailOn?'':' · “Show unread mail on Today” is OFF in Email'}`);
  paint();
  const hl=await t(()=>api('/health?days=14'));
  const days=hl.v&&hl.v.days||[],last=days[0];
  row('Fitbit / Apple Health',!hl.e&&days.length>0,hl.e?esc(hl.e):`Fitbit ${c.googleHealth?'connected':'NOT connected'} · ${days.length} days of data${last?` · latest ${esc(last.date)}: ${['steps','sleepMin','restingHr','weightLb','kcal'].filter(k=>last[k]!=null).map(k=>k+' '+last[k]).join(', ')||'no values'}`:''}${(hl.v.errors||[]).length?' · errors: '+esc(hl.v.errors.map(x=>x.source+': '+(x.code||'')+' '+(x.message||'')+(x.part?' ('+x.part+')':'')).join('; ')):''}${SYNC.healthOn?'':' · “Use health data” is OFF'}`);
  paint();
  if(!ml.e){MAILC.items=ml.v.items||[];MAILC.at=Date.now();cacheWrite('ishiros.cache.mail',MAILC)}
  if(!hl.e){HC.days=days.length?(await t(()=>api('/health?days=30'))).v?.days||days:days;HC.at=Date.now();cacheWrite('ishiros.cache.health',HC);importHealth()}
  if(!cal.e){CALC.ev=cal.v.events?cleanExt(cal.v.events):CALC.ev;}
  DATA_VER++;render(false);
}
document.addEventListener('click',e=>{const b=e.target.closest('#diagGo');if(!b)return;e.stopImmediatePropagation();openDiag()},true);

/* ===================== startup: orbit → round up → swoosh across revealing Home → final flicker ===================== */
function runSplash(){
  /* wait (briefly) for the greeting font so nothing swaps mid-animation */
  let started=false;const go=()=>{if(started)return;started=true;runSplashNow()};
  try{document.fonts.load('500 40px Newsreader').then(go,go)}catch(e){go()}
  setTimeout(go,450);
}
function runSplashNow(){
  const root=()=>document.documentElement;
  const hiEl=document.getElementById('splashHi');
  hiEl.innerHTML=`<span class="sl1">${esc(GREET)}</span><span class="sl2"><em>${esc(firstName())}</em></span>`;
  const target=$('#hi');if(target)target.style.visibility='hidden';
  const mk=splash.querySelector('.mark');if(mk)mk.style.display='none';
  SC.style.opacity='0';splash.classList.add('go');document.documentElement.classList.remove('rings-on');
  const cv=document.createElement('canvas');cv.id='splashCv';splash.prepend(cv);
  let W=innerWidth,H=innerHeight;const dpr=Math.min(2,devicePixelRatio||1);cv.width=W*dpr;cv.height=H*dpr;
  const x=cv.getContext('2d');if(!x)return legacyEnd();x.scale(dpr,dpr);x.lineCap='round';x.lineJoin='round';
  const cs=getComputedStyle(document.documentElement),ACC=cs.getPropertyValue('--accent').trim()||'#D9552E',SAGE=cs.getPropertyValue('--sage-soft').trim()||'#9DB4A3';
  const PAL=[[ACC,'#FFB07A'],[SAGE,'#F2EDE3'],['#FFB07A',ACC],['#F2EDE3',SAGE]];
  const hr=hiEl.getBoundingClientRect();let cx=W/2,cy=hr.top+hr.height/2||H/2;
  /* the Home Screen app can change size just after launch: follow it instead of stretching */
  const onRs=()=>{if(!cv.isConnected){removeEventListener('resize',onRs);return}if(innerWidth===W&&innerHeight===H)return;
    W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0);x.lineCap='round';x.lineJoin='round';
    const r2=hiEl.getBoundingClientRect();cx=W/2;cy=r2.top+r2.height/2||H/2};
  addEventListener('resize',onRs);
  const ex=Math.max(hr.width,170)/2+34,ey=Math.max(hr.height,80)/2+34,TAU=Math.PI*2,N=12;
  const T_IN=900,T_SWIRL=1600,T_ROUND=520,T_FLY=900,T_FLICK=800;
  /* three of the curves become the rings that stay around your avatar; the rest pour into it */
  const KEEP={0:0,5:1,10:2};
  const cur=[...Array(N)].map((_,i)=>{const k=i/(N-1);return{rx:ex+12+k*(W*.5),ry:ey+12+k*(H*.36),a:i*1.9,ang:0,span:(1.15+((i*37)%10)/14)*Math.PI,spd:(.22+((i*13)%7)/40)*(i%2?1:-1),
    wob:.035+((i*7)%5)/120,ph:i*.9,w:[2.6,1.4,2,1.1,1.7,3][i%6],pal:PAL[i%PAL.length],ring:1+(i%4)*.06,keep:KEEP[i]}});
  const flyE=u=>1-Math.pow(1-u,2.6),ease=u=>u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2,cl=v=>Math.max(0,Math.min(1,v)),PTS=90;
  const tRound=T_SWIRL,tFly=T_SWIRL+T_ROUND,tEnd=tFly+T_FLY+(N-1)*22;
  let av=null,flew=false,shown=false,done=false,raf=0,vt=0,last=0;
  function frame(now){
    /* animation clock: if the phone hiccups, pause instead of jumping ahead */
    if(!last)last=now;const dt=Math.min(34,Math.max(0,now-last));vt+=dt;last=now;
    const ms=vt,t=ms/1000;x.clearRect(0,0,W,H);
    const r=ease(cl((ms-tRound)/T_ROUND));                 /* 0→1: gather into one ring around the greeting */
    if(ms>tFly-40&&!av)av=avTarget();
    cur.forEach((c,i)=>{
      const grow=1-Math.pow(1-cl((ms-i*45)/T_IN),3);if(grow<.02&&r<=0)return;
      const kp=c.keep!=null?AVR[c.keep]:null,fl=av?flyE(cl((ms-tFly-(kp?(N-1)*22:i*22))/T_FLY)):0;
      /* spin speed: speeds up while gathering, then settles to the exact speed the rings keep after the splash */
      const w0=c.spd*(1+r*4),w1=kp?TAU/kp.dur*kp.dir:w0*1.6;c.ang+=dt/1000*(w0+(w1-w0)*fl);
      const n=Math.max(2,Math.round(PTS*(r>0?1:grow)));let fade=r>0?1:Math.min(1,grow*1.6);
      let ox=cx,oy=cy,rx=c.rx+(ex*c.ring-c.rx)*r,ry=c.ry+(ey*c.ring-c.ry)*r,span=c.span+(TAU*.92-c.span)*r,lw=c.w;
      if(fl>0){ /* fly along a soft arc into the avatar, shrinking to its ring */
        const u=fl,p1x=av.x+(cx-av.x)*.25,p1y=cy*.3+av.y*.7;ox=(1-u)*(1-u)*cx+2*u*(1-u)*p1x+u*u*av.x;oy=(1-u)*(1-u)*cy+2*u*(1-u)*p1y+u*u*av.y;
        const tr=kp?kp.r:av.r*.8;rx=rx+(tr-rx)*u;ry=ry+(tr-ry)*u;span=span+((kp?kp.f:.25)*TAU-span)*u;lw=lw+((kp?kp.w:.6)-lw)*u;
        if(!kp)fade*=1-cl((u-.55)/.4)}
      if(fade<=0)return;
      const th0=c.a+c.ang;c.th0=th0;c.span1=span;
      let fx=0,fy=0,mx=0,my=0;const mid=n>>1;x.beginPath();
      for(let j=0;j<n;j++){const s=j/(PTS-1),th=th0+s*span,w=1+c.wob*(1-r)*Math.sin(2*th+t*1.1+c.ph);
        const px=ox+Math.cos(th)*rx*w,py=oy+Math.sin(th)*ry*w;
        if(!j){fx=px;fy=py;x.moveTo(px,py)}else x.lineTo(px,py);if(j===mid){mx=px;my=py}}
      const d=Math.hypot(mx-fx,my-fy)>2,g=x.createLinearGradient(fx,fy,d?mx:fx+1,d?my:fy+1);g.addColorStop(0,c.pal[0]);g.addColorStop(1,c.pal[1]);x.strokeStyle=g;
      x.globalAlpha=.16*fade*(1+fl*.8);x.lineWidth=lw*(5-fl*2.5);x.stroke();
      x.globalAlpha=.85*fade;x.lineWidth=lw;x.stroke();
    });
    x.globalAlpha=1;
    if(!flew&&ms>tFly+60){flew=true;flyGreeting()}
    if(!shown&&ms>tFly+120){shown=true;SC.style.transition='none';SC.style.opacity='';
      /* Home fades up softly under the reveal */
      try{$('#view').animate([{opacity:0,transform:'translateY(14px)',filter:'blur(6px)'},{opacity:1,transform:'none',filter:'blur(0)'}],{duration:760,easing:'cubic-bezier(.22,1,.36,1)'});
        $('#top').animate([{opacity:0},{opacity:1}],{duration:520,easing:'ease-out'});$('.dock').animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:700,delay:120,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'})}catch(e){}}
    /* Home opens outward from the greeting while the rings fly to the avatar */
    if(ms>tFly+120){const p=ease(cl((ms-tFly-120)/(T_FLY*.85))),R=Math.round(p*Math.hypot(W,H)*1.05);
      const m=`radial-gradient(circle at ${Math.round(cx)}px ${Math.round(cy)}px,transparent ${R}px,#000 ${R+140}px)`;splashBg.style.webkitMaskImage=m;splashBg.style.maskImage=m;if(p>=1)splashBg.style.opacity='0'}
    if(!done&&ms>=tEnd){done=true;handOff();return}
    raf=requestAnimationFrame(frame);
  }
  /* where the avatar is, and the rings it keeps */
  function avTarget(){const a=$('#avBtn');if(!a)return{x:40,y:60,r:23};const b=a.getBoundingClientRect();return{x:b.left+b.width/2,y:b.top+b.height/2,r:b.width/2}}
  function handOff(){
    const root=document.documentElement;
    cur.forEach(c=>{if(c.keep==null)return;const g=document.querySelector(`.avr .r${c.keep}`);if(g)g.style.setProperty('--a0',((c.th0*180/Math.PI)%360).toFixed(1)+'deg')});
    root.classList.add('rings-on');
    cv.animate([{opacity:1},{opacity:0}],{duration:260,fill:'forwards'});setTimeout(()=>cv.remove(),280);
    finalFlicker();setTimeout(endSplash,T_FLICK);
  }
  function finalFlicker(){
    const bc=document.getElementById('bgcurve'),gl=document.getElementById('bgGlow');
    const k=[{opacity:1},{opacity:.35,offset:.12},{opacity:1.0,offset:.24},{opacity:.55,offset:.36},{opacity:1,offset:.5},{opacity:1}];
    try{if(bc)bc.animate([{filter:'brightness(1)'},{filter:'brightness(2.2)',offset:.25},{filter:'brightness(1.1)',offset:.4},{filter:'brightness(2.6)',offset:.6},{filter:'brightness(1)'}],{duration:T_FLICK,easing:'ease-out'})}catch(e){}
    try{if(bc)bc.animate(k,{duration:T_FLICK})}catch(e){}
    try{if(gl)gl.animate([{opacity:0},{opacity:.9,offset:.25},{opacity:.2,offset:.4},{opacity:1,offset:.6},{opacity:0}],{duration:T_FLICK,easing:'ease-out'})}catch(e){}
    glitchIn();
  }
  function flyGreeting(){
    hiEl.style.animation='none';hiEl.style.opacity='1';hiEl.style.transform='none';
    const t=$('#hi');if(!t){hiEl.animate([{opacity:1},{opacity:0}],{duration:400,fill:'forwards'});return}
    const tl1=t.querySelector('.hl1'),tl2=t.querySelector('em'),sl1=hiEl.querySelector('.sl1'),sl2=hiEl.querySelector('.sl2 em');
    const sc=parseFloat(getComputedStyle(t).fontSize)/parseFloat(getComputedStyle(hiEl).fontSize);
    [[sl1,tl1],[sl2,tl2]].forEach(([a,b])=>{if(!a||!b)return;a.style.display='inline-block';a.style.transformOrigin='0 0';const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();
      a.animate([{transform:'none'},{transform:`translate(${br.left-ar.left}px,${br.top-ar.top}px) scale(${sc})`}],{duration:820,easing:'cubic-bezier(.45,0,.15,1)',fill:'forwards'})});
    setTimeout(()=>{t.style.visibility='';hiEl.style.visibility='hidden'},830);
  }
  function legacyEnd(){splashBg.style.opacity='0';SC.style.opacity='';const t=$('#hi');if(t)t.style.visibility='';root().classList.add('rings-on');setTimeout(endSplash,300)}
  raf=requestAnimationFrame(frame);
  setTimeout(()=>{if(splash.isConnected){cancelAnimationFrame(raf);SC.style.opacity='';const t=$('#hi');if(t)t.style.visibility='';root().classList.add('rings-on');endSplash()}},7500);
}
/* the rings that live around your avatar (radius, line width, how much of the circle, seconds per turn, direction) */
const AVR=[{r:26.2,w:1.3,f:.62,dur:16,dir:1},{r:28.6,w:.9,f:.36,dur:23,dir:-1},{r:31,w:.7,f:.78,dur:31,dir:1}];
function avRings(){
  const C=['#F06D44','#9DB4A3','#FFB07A'],D=['#FFB07A','#F2EDE3','#F06D44'];
  return`<svg class="avr" viewBox="0 0 80 80" aria-hidden="true"><defs>${AVR.map((_,k)=>`<linearGradient id="avg${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C[k]}"/><stop offset="1" stop-color="${D[k]}"/></linearGradient>`).join('')}</defs>
    ${AVR.map((q,k)=>{const L=2*Math.PI*q.r;return`<g class="r${k}" style="--dur:${q.dur}s;--dir:${q.dir>0?'normal':'reverse'}"><circle cx="40" cy="40" r="${q.r}" stroke="url(#avg${k})" stroke-width="${q.w}" stroke-dasharray="${(L*q.f).toFixed(1)} ${L.toFixed(1)}"/></g>`}).join('')}</svg>`}
/* a short glow-and-glitch pass over the key pieces of Home as it appears */
function glitchIn(){
  const els=[['#hi',0],['#avBtn',90],['#scroller .big',160],['#ind',260],['#scroller .sec-h h2',340]];
  els.forEach(([sel,d])=>{const el=$(sel);if(!el)return;setTimeout(()=>{el.classList.remove('glitch');void el.offsetWidth;el.classList.add('glitch');setTimeout(()=>el.classList.remove('glitch'),900)},d)});
}

/* ===================== drag a panel down by its handle (or header) to close it ===================== */
(function(){
  const sh=document.querySelector('.sheet'),scrim=document.querySelector('.scrim');if(!sh)return;
  let d=null;
  const pt=e=>e.touches?e.touches[0]:e;
  function start(e){
    if(wrap.hidden||!wrap.classList.contains('open'))return;
    const onHandle=e.target.closest('.grab,.sh-h')&&!e.target.closest('button,input,select,textarea,a');
    const atTop=sh.scrollTop<=0&&!e.target.closest('.fl-body,.day-scroll,input,textarea,.wkset,[data-unit]');
    if(!onHandle&&!atTop)return;
    const p=pt(e);d={y0:p.clientY,x0:p.clientX,y:0,t:performance.now(),v:0,handle:!!onHandle,live:false};
  }
  function move(e){
    if(!d)return;const p=pt(e),dy=p.clientY-d.y0,dx=p.clientX-d.x0;
    if(!d.live){if(Math.abs(dx)>Math.abs(dy)||dy<=0){if(Math.abs(dx)>8||dy<-6)d=null;return}if(dy<(d.handle?4:10))return;d.live=true;sh.style.transition='none';sh.getAnimations&&sh.getAnimations().forEach(a=>a.cancel())}
    if(e.cancelable)e.preventDefault();
    const now=performance.now();d.v=(dy-d.y)/Math.max(1,now-d.t);d.t=now;d.y=dy;
    sh.style.transform=`translateY(${dy}px)`;scrim.style.opacity=String(Math.max(0,1-dy/(sh.offsetHeight||400)));
  }
  function end(){
    if(!d)return;const was=d;d=null;if(!was.live)return;
    const close=was.y>Math.min(140,(sh.offsetHeight||400)*.28)||was.v>.65;
    if(close){sh.style.transition='transform .28s cubic-bezier(.3,0,.7,.4),opacity .28s ease';sh.style.transform=`translateY(${Math.max(innerHeight,sh.offsetHeight)}px)`;sh.style.opacity='0';scrim.style.transition='opacity .28s ease';scrim.style.opacity='0';
      sh._drag=1;setTimeout(()=>{closeSheet();scrim.style.transition='';scrim.style.opacity=''},240)}
    else{sh.style.transition='transform .42s cubic-bezier(.22,1.25,.36,1)';sh.style.transform=sh.classList.contains('morph')?'none':'';scrim.style.transition='opacity .3s';scrim.style.opacity='';setTimeout(()=>{sh.style.transition='';scrim.style.transition=''},450)}
  }
  sh.addEventListener('touchstart',start,{passive:true});sh.addEventListener('touchmove',move,{passive:false});sh.addEventListener('touchend',end);sh.addEventListener('touchcancel',end);
  sh.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')start(e)});addEventListener('pointermove',e=>{if(e.pointerType==='mouse')move(e)});addEventListener('pointerup',e=>{if(e.pointerType==='mouse')end()});
})();

/* ===================== background curve reacts to scrolling: it brightens and a light travels along it ===================== */
(function(){
  const host=document.getElementById('bgcurve');if(!host)return;
  const glow=document.createElement('div');glow.id='bgGlow';host.appendChild(glow);
  const comet=document.createElement('div');comet.id='bgComet';host.appendChild(comet);
  let energy=0,last=0,lastY=0,raf=0,prog=0;
  const pt=u=>{ /* same curve as drawBgCurve, in % of the host box */
    const seg=u<.5?[[82,-4],[18,14],[104,34],[50,52]]:[[50,52],[-4,70],[-2,80],[64,104]],v=u<.5?u*2:(u-.5)*2,m=1-v;
    const b=(i)=>m*m*m*seg[0][i]+3*m*m*v*seg[1][i]+3*m*v*v*seg[2][i]+v*v*v*seg[3][i];return[b(0),b(1)]};
  function step(){
    energy*=.92;const[px,py]=pt(Math.max(0,Math.min(1,prog)));
    comet.style.transform=`translate3d(${(px/100*host.clientWidth).toFixed(1)}px,${(py/100*host.clientHeight).toFixed(1)}px,0) translate(-50%,-50%)`;
    comet.style.opacity=Math.min(.95,energy*1.2).toFixed(3);glow.style.opacity=Math.min(.9,energy).toFixed(3);
    if(energy>.01)raf=requestAnimationFrame(step);else{raf=0;comet.style.opacity=0;glow.style.opacity=0}
  }
  function onScroll(e){
    const el=e.target===document?SC:e.target;if(!el||!el.scrollHeight)return;
    const y=el.scrollTop,now=performance.now(),dt=Math.max(16,now-last),v=Math.abs(y-lastY)/dt;last=now;lastY=y;
    if(noMotion())return;
    const max=Math.max(1,el.scrollHeight-el.clientHeight);prog=y/max;energy=Math.min(1,energy+v*.35);
    if(!raf)raf=requestAnimationFrame(step);
  }
  SC.addEventListener('scroll',onScroll,{passive:true});
  document.addEventListener('scroll',e=>{if(e.target&&e.target.classList&&(e.target.classList.contains('sheet')||e.target.classList.contains('fl-body')))onScroll(e)},{passive:true,capture:true});
})();

/* restore from a picked file (and from a specific server copy) */
let PICKED=null;
document.addEventListener('change',e=>{if(e.target.id!=='bkPick')return;const f=e.target.files&&e.target.files[0];if(!f)return;
  f.text().then(txt=>{let n='?',ok=true;try{const d=JSON.parse(txt);if(d&&d.enc)n='encrypted';else if(d&&Array.isArray(d.entries))n=d.entries.length+' entries';else ok=false}catch(x){ok=false}
    const el=$('#bkPicked');if(!el)return;if(!ok){el.innerHTML='<p class="hint">That file isn’t a Life backup.</p>';return}
    PICKED=txt;el.innerHTML=`<div class="sh-actions" style="margin-top:8px"><button class="danger" id="bkDo" style="flex:1">Restore ${esc(f.name)} (${esc(n)})</button></div>`}).catch(()=>toast('Couldn’t read that file'));
  e.target.value=''});
document.addEventListener('click',async e=>{const b=e.target.closest('[data-srvslot]');if(!b)return;e.stopPropagation();
  try{const txt=await api('/backup?slot='+encodeURIComponent(b.dataset.srvslot));restoreText(typeof txt==='string'?txt:JSON.stringify(txt),b)}catch(err){toast('Couldn’t load that copy: '+err.message)}},true);

/* health: refresh when you open the Health tab and every 5 minutes while Life is open */
document.addEventListener('click',e=>{const b=e.target.closest('#hRefresh,#hOn2,#hReconnect');if(!b)return;e.stopImmediatePropagation();e.preventDefault();
  if(b.id==='hReconnect'){openConn();return}
  if(b.id==='hOn2'){SYNC.healthOn=true;saveSync();DATA_VER++;render(false)}
  b.textContent='Refreshing…';loadHealth(true)},true);
setInterval(()=>{if(!document.hidden&&syncOn()&&SYNC.healthOn)loadHealth(false)},5*6e4);
document.addEventListener('click',e=>{const t=e.target.closest('[data-tab="health"],[data-tab="today"]');if(t&&syncOn()&&SYNC.healthOn&&Date.now()-(HC.at||0)>2*6e4)setTimeout(()=>loadHealth(true),350)});

/* Health → Activity: Fitbit / Apple Health days */
function activityView(){
  if(!syncOn())return emptyBox('Connect your server in Settings → Connections, then link Fitbit to see steps and sleep here.');
  if(!SYNC.healthOn)return healthTiles();
  const days=[...Array(14)].map((_,i)=>addDays(i-13)),H=days.map(d=>hday(d)||{});
  const st=H.map(h=>num(h.steps)||0),sl=H.map(h=>num(h.sleepMin)||0);
  const has=st.some(Boolean)||sl.some(Boolean);
  const avg=a=>{const v=a.slice(-7).filter(Boolean);return v.length?v.reduce((x,y)=>x+y,0)/v.length:0};
  const bars=(a,max,fmt,goal)=>`<div class="abars">${a.map((v,i)=>`<div class="ab${days[i]===today()?' td':''}" title="${esc(fmtDate(days[i]))}: ${esc(fmt(v))}"><i style="height:${Math.max(v?4:0,Math.min(100,v/max*100)).toFixed(1)}%"></i><span>${wdOf(days[i]).slice(0,1)}</span></div>`).join('')}${goal?`<em style="bottom:calc(${Math.min(100,goal/max*100)}% + 16px)"></em>`:''}</div>`;
  const smax=Math.max(10000,...st)*1.08,lmax=Math.max(540,...sl)*1.08;
  return section('<em>Today</em>',healthTiles())
    +(has?section('Steps · <em>14 days</em>',`<div class="card-s rvcard"><div class="rvgrid"><div><b class="num">${fmtN(avg(st))}</b><span>7-day average</span></div><div><b class="num">${st.slice(-7).filter(v=>v>=10000).length}/7</b><span>days over 10k</span></div></div>${bars(st,smax,v=>fmtN(v)+' steps',10000)}</div>`)
      +section('Sleep · <em>14 days</em>',`<div class="card-s rvcard"><div class="rvgrid"><div><b class="num">${(avg(sl)/60).toFixed(1)}h</b><span>7-day average</span></div><div><b class="num">${sl.slice(-7).filter(v=>v>=420).length}/7</b><span>nights 7h+</span></div></div>${bars(sl,lmax,v=>(v/60).toFixed(1)+' h',480)}</div>`)
      :section('History','<p class="hint">No steps or sleep in the last 14 days yet. Once the Fitbit app syncs to Google, data shows up here within a few minutes.</p>'));
}

/* ===================== notebooks (loaded only when you open them) ===================== */
let NOTES_P=null;
function loadNotes(){if(window.NOTES)return Promise.resolve(window.NOTES);if(NOTES_P)return NOTES_P;
  const add=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src+'?v=__APPVER__';s.onload=res;s.onerror=()=>rej(new Error('Couldn’t load '+src));document.head.appendChild(s)});
  NOTES_P=add('pf.js').then(()=>add('notes.js')).then(()=>window.NOTES).catch(e=>{NOTES_P=null;throw e});return NOTES_P}
async function openNotebooks(id){try{if(!wrap.hidden)closeSheet();const N=await loadNotes();N.open(id)}catch(e){toast('Notebooks need one online open first: '+e.message)}}
async function notebookStrip(){
  const el=$('#nbStrip');if(!el)return;let list=[];try{const N=await loadNotes();list=await N.summary()}catch(e){}
  el.innerHTML=`<div class="nbs">${list.slice(0,8).map(b=>`<button class="nbs-b" data-nbopen="${esc(b.id)}"><span class="nbs-c" style="--cv:${esc(b.color)}"></span><b>${esc(b.title)}</b><small>${b.pages} page${b.pages===1?'':'s'} · ${esc(ago(b.u))}</small></button>`).join('')}<button class="nbs-b nbs-new" data-nbopen=""><span class="nbs-c nbs-plus">${ic('plus')}</span><b>${list.length?'All notebooks':'New notebook'}</b><small>Handwrite or type</small></button></div>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-nbopen],#nbRail');if(!b)return;e.stopImmediatePropagation();e.preventDefault();openNotebooks(b.dataset?b.dataset.nbopen||null:null)},true);
window.addEventListener('life-notes-changed',()=>{if(state.tab==='mind'){DATA_VER++;setTimeout(notebookStrip,50)}});

/* ===================== sync between your devices (iPhone · iPad · laptop) =====================
   Every entry carries the time it last changed (u); deletions leave a dated marker (tomb).
   Devices pull the server copy, merge entry by entry (newest change wins), then push back. */
const SYNC_SKIP=new Set(['entries','_ku','tomb','_loc']);   /* a running focus timer (focusNow) syncs too, so every device shows it. _loc = this device only */
const SH={map:null,keys:{},arr:{}};
/* a few small per-device markers live inside the encrypted data while a passcode is on, instead of in plain storage */
const LOCK_LS=new Set(['ishiros.brief']);
const lsGet=k=>{if(LOCK_LS.has(k)&&passOn()){const v=(db._loc||{})[k];return v==null?null:String(v)}try{return localStorage.getItem(k)}catch(e){return null}};
const lsSet=(k,v)=>{if(LOCK_LS.has(k)&&passOn()){if(isLocked())return;(db._loc=db._loc||{})[k]=String(v);save();return}try{localStorage.setItem(k,v)}catch(e){}};
const SYNCST={ver:+(lsGet('ishiros.syncver')||0),dirty:false,gen:0,busy:false,lastPush:0,lastAt:+(lsGet('ishiros.syncat')||0),err:'',warn:'',t:0};
const hashE=e=>{const{u,...r}=e;return JSON.stringify(r)};
/* lists of things with ids (food library, workout templates, habits, flash cards) merge item by item, like entries */
const isObjArr=v=>Array.isArray(v)&&v.every(x=>x&&typeof x==='object'&&!Array.isArray(x));
function ensureIds(a){for(const x of a)if(typeof x.id!=='string'||!ID_OK.test(x.id))x.id=x.id!=null&&x.id!==''?safeId(x.id):safeId(JSON.stringify(x));return a}
const arrKeys=d=>Object.keys(d).filter(k=>!SYNC_SKIP.has(k)&&k!=='settings'&&isObjArr(d[k])&&d[k].length);
const TOMB_DAYS=730;   /* deletions are remembered for two years, so a device that was offline for months can't bring them back */
function syncBase(){SH.map=new Map(db.entries.map(e=>[e.id,hashE(e)]));SH.keys={};SH.arr={};
  for(const k of Object.keys(db))if(!SYNC_SKIP.has(k)){if(isObjArr(db[k])){ensureIds(db[k]);SH.arr[k]=new Map(db[k].map(x=>[x.id,hashE(x)]))}SH.keys[k]=JSON.stringify(db[k])}}
function stampSync(){if(!SH.map){syncBase();return}const now=Date.now(),seen=new Set();let ch=false;
  for(const e of db.entries){seen.add(e.id);const h=hashE(e);if(SH.map.get(e.id)!==h){if(!e.sample){e.u=now;ch=true}SH.map.set(e.id,h)}}
  for(const id of [...SH.map.keys()])if(!seen.has(id)){(db.tomb=db.tomb||{})[id]=now;SH.map.delete(id);ch=true}
  for(const k of Object.keys(db)){if(SYNC_SKIP.has(k)||!isObjArr(db[k]))continue;ensureIds(db[k]);
    const mp=SH.arr[k]||(SH.arr[k]=new Map()),s2=new Set();
    for(const x of db[k]){s2.add(x.id);const h=hashE(x);if(mp.get(x.id)!==h){x.u=now;mp.set(x.id,h);ch=true}}
    for(const id of [...mp.keys()])if(!s2.has(id)){(db.tomb=db.tomb||{})['a:'+k+':'+id]=now;mp.delete(id);ch=true}}
  db._ku=db._ku||{};for(const k of Object.keys(db))if(!SYNC_SKIP.has(k)){const j=JSON.stringify(db[k]);if(SH.keys[k]!==j){SH.keys[k]=j;db._ku[k]=now;ch=true}}
  if(ch){SYNCST.dirty=true;SYNCST.gen++}}
/* after restoring a backup or snapshot, everything in it counts as just changed, so the next sync keeps it instead of letting the server's newer state undo the restore */
function restampAll(){const now=Date.now(),tomb=db.tomb||{};
  for(const e of db.entries){if(!e.sample)e.u=now;delete tomb[e.id]}
  for(const k of Object.keys(db)){if(SYNC_SKIP.has(k)||!isObjArr(db[k]))continue;ensureIds(db[k]);for(const x of db[k]){x.u=now;delete tomb['a:'+k+':'+x.id]}}
  db.tomb=tomb;db._ku={};for(const k of Object.keys(db))if(!SYNC_SKIP.has(k))db._ku[k]=now;
  syncBase();SYNCST.dirty=true;SYNCST.gen++}
function markRestored(){lsSet('ishiros.restamp','1')}
const tsE=e=>e.u||e.created||0;
function mergeDocs(L,R){
  const tomb={...(R.tomb||{})};for(const[k,v]of Object.entries(L.tomb||{}))tomb[k]=Math.max(tomb[k]||0,v);
  const cut=Date.now()-TOMB_DAYS*864e5;for(const k in tomb)if(tomb[k]<cut)delete tomb[k];
  const m=new Map();for(const e of cleanEntries(R.entries))if(!e.sample)m.set(e.id,e);
  for(const e of L.entries){const r=m.get(e.id);if(!r||tsE(e)>=tsE(r))m.set(e.id,e)}
  let entries=[...m.values()].filter(e=>!(tomb[e.id]&&tomb[e.id]>=tsE(e)));
  if(entries.some(e=>!e.sample))entries=entries.filter(e=>!e.sample);   /* real data replaces the example entries */
  const out={...L,entries,tomb},lk=L._ku||{},rk=R._ku||{};out._ku={...lk};
  const both=new Set([...arrKeys(L),...arrKeys(R)].filter(k=>(L[k]==null||isObjArr(L[k]))&&(R[k]==null||isObjArr(R[k]))));
  for(const k of both){
    const la=ensureIds((L[k]||[]).slice()),ra=ensureIds((R[k]||[]).map(x=>({...x}))),mm=new Map(),order=[];
    for(const x of ra)mm.set(x.id,x);
    for(const x of la){order.push(x.id);const r=mm.get(x.id);if(!r||(x.u||0)>=(r.u||0))mm.set(x.id,x)}
    const seen=new Set(order);for(const x of ra)if(!seen.has(x.id)){order.push(x.id);seen.add(x.id)}
    out[k]=order.map(id=>mm.get(id)).filter(x=>!(tomb['a:'+k+':'+x.id]&&tomb['a:'+k+':'+x.id]>=(x.u||0)));
    out._ku[k]=Math.max(lk[k]||0,rk[k]||0)}
  for(const k of Object.keys(R))if(!SYNC_SKIP.has(k)&&!both.has(k)){if((rk[k]||0)>(lk[k]||0)){out[k]=R[k];out._ku[k]=rk[k]}}
  out.settings=cleanSettings(out.settings);
  return out}
/* order-independent fingerprint, so two devices with the same data never think they differ */
function canon(d){if(!d)return'';const o={};for(const k of Object.keys(d).sort()){if(k==='_loc')continue;let v=d[k];
  if(k==='entries')v=[...v].filter(e=>!e.sample).sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);else if(k==='tomb'||k==='_ku')v=Object.fromEntries(Object.entries(v||{}).sort());
  else if(k!=='settings'&&isObjArr(v)&&v.every(x=>typeof x.id==='string'))v=[...v].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);o[k]=v}return JSON.stringify(o)}
const docForPush=d=>{const o={};for(const k of Object.keys(d))if(k!=='_loc')o[k]=d[k];o.entries=d.entries.filter(e=>!e.sample);return o};
const syncAllowed=()=>syncOn()&&SYNC.syncOn!==false&&!(LOCK&&LOCK.key)&&!LOCKED_BLOB&&!STORAGE_BAD;
function syncStatusText(){if(LOCK&&LOCK.key)return'Off while a passcode is on (data on the server would not be encrypted)';if(SYNC.syncOn===false)return'Off · this device keeps its own copy';
  if(STORAGE_BAD)return'Paused: this device’s storage is full';
  const nb=NBS.err?` · ${esc(NBS.err)}`:'';
  return SYNCST.err?`Last try failed: ${esc(SYNCST.err)}${nb}`:SYNCST.lastAt?`Your entries and notebooks · synced ${esc(ago(SYNCST.lastAt))}${SYNCST.warn&&Date.now()-(SYNCST.warnAt||0)<864e5?' · '+esc(SYNCST.warn):''}${nb}`:'Your entries and notebooks stay the same on every device'}
const partErr=(part,msg,code)=>{const e=new Error(`${part}: ${msg}`);e.code=code;return e};
/* an older version of the app may have just written a raw key; move it into IndexedDB */
async function e2eFresh(){await E2E_READY;let s=null;try{s=localStorage.getItem('ishiros.e2e')}catch(e){}if(s)await e2eLoad()}
async function syncNow(force){
  if(!syncAllowed())return;if(SYNCST.busy){SYNCST.again=true;return}SYNCST.busy=true;SYNCST.again=false;
  try{
    await e2eFresh();
    if(lsGet('ishiros.restamp')){restampAll();try{localStorage.removeItem('ishiros.restamp')}catch(e){}force=true}
    stampSync();
    for(let attempt=0;attempt<4;attempt++){
      /* cheap check first: if the server is still on the version we have, only send our own changes */
      let r=await api('/sync'+(!force&&attempt===0&&SYNCST.ver?`?have=${SYNCST.ver}`:''));
      const wasEnc=!!(r.doc&&r.doc.e2e);let refused=false;
      if(wasEnc){if(!meta.srvE2E){meta.srvE2E=1;saveMeta()}
        if(!E2E.key)throw partErr('Entries','your synced data is encrypted. Enter your sync passphrase in Settings → Connections → End-to-end encryption.','nokey');
        try{r.doc=await e2eOpen(r.doc);SYNCST.keyBad=false}catch(e){if(e.code==='key')SYNCST.keyBad=true;throw partErr('Entries',e.code==='key'?'wrong sync passphrase. This device’s passphrase doesn’t open your main synced data (entries, settings). Nothing was uploaded.':e.message,e.code)}}
      else if(r.doc&&E2E.key&&meta.srvE2E){
        /* encryption is on, yet the server sent plain data: never merge it (it could be forged); replace it with this device's encrypted copy */
        r.doc=undefined;refused=true;SYNCST.warnAt=Date.now();SYNCST.warn='the server had an unencrypted copy; it was ignored and replaced with this device’s encrypted data'}
      if(r.same){if(!SYNCST.dirty)break;r={ver:r.ver,doc:undefined,same:true}}
      let changed=false;
      if(r.doc&&(r.ver!==SYNCST.ver||force)){const merged=mergeDocs(db,r.doc);if(canon(merged)!==canon(db)){db=merged;changed=true}}
      if(changed){syncBase();
        if(typeof LOCK!=='undefined'&&LOCK.key)LOCK.saveEnc();
        else if(lsWrite(KEY,JSON.stringify(db)))storageOk();
        else{storageFail();DATA_VER++;render(false);throw partErr('Entries','couldn’t store the synced data on this device (storage is full). Sync is paused.','storage')}
        DATA_VER++;applyLook();render(false);SYNCST.pulledAt=Date.now()}
      const pushDoc=docForPush(db),g0=SYNCST.gen,need=r.same?SYNCST.dirty:(refused||r.doc==null||canon(pushDoc)!==canon(r.doc)||(!!E2E.key&&!wasEnc));
      if(!need){SYNCST.ver=r.ver;if(SYNCST.gen===g0)SYNCST.dirty=false;break}
      try{const p=await api('/sync',{method:'PUT',headers:{'X-Life-Device':DEVICE},body:JSON.stringify({base:r.ver,doc:E2E.key?await e2eSeal(pushDoc):pushDoc})});
        SYNCST.ver=p.ver;if(SYNCST.gen===g0)SYNCST.dirty=false;   /* an edit made while this was uploading stays marked for the next push */
        SYNCST.lastPush=Date.now();break}
      catch(e){if(!/conflict|409/.test(e.message))throw e;force=true}   /* another device saved first: pull everything and merge */
    }
    SYNCST.err='';SYNCST.lastAt=Date.now();lsSet('ishiros.syncver',SYNCST.ver);lsSet('ishiros.syncat',SYNCST.lastAt);
  }catch(e){SYNCST.err=e.message||'error'}finally{SYNCST.busy=false}
  if(SYNCST.again)setTimeout(()=>syncNow(),300);
  syncNotes().catch(e=>{NBS.err='Notebooks: '+(e&&e.message||'error')});
}
/* changes go up about a second after you make them */
function queueSync(){if(!syncAllowed())return;clearTimeout(SYNCST.t);SYNCST.t=setTimeout(()=>syncNow(),Math.max(1200,3000-(Date.now()-SYNCST.lastPush)))}
/* ---------- live link: the server tells this device the moment another one saves ---------- */
const DEVICE=(()=>{let d=lsGet('ishiros.dev');if(!d){d=Math.random().toString(36).slice(2,10);lsSet('ishiros.dev',d)}return d})();
const LIVE={ws:null,tries:0,t:0,ping:0,state:'off',devices:0};
function liveConnect(){
  if(!syncAllowed()||document.hidden||LIVE.ws||!('WebSocket' in window))return;
  let ws;try{ws=new WebSocket(SYNC.url.replace(/\/+$/,'').replace(/^http/,'ws')+'/sync/ws?d='+DEVICE,['life',SYNC.key])}catch(e){return}
  LIVE.ws=ws;LIVE.state='connecting';
  ws.onopen=()=>{LIVE.tries=0;LIVE.state='live';clearInterval(LIVE.ping);LIVE.ping=setInterval(()=>{try{ws.send('ping')}catch(e){}},25000)};
  ws.onmessage=ev=>{if(ev.data==='pong')return;let m;try{m=JSON.parse(ev.data)}catch(e){return}try{dispatchEvent(new CustomEvent('life-live',{detail:m}))}catch(x){}
    if(m.devices)LIVE.devices=m.devices;
    if((m.t==='ver'||m.t==='hello')&&m.ver!==SYNCST.ver&&m.from!==DEVICE)syncNow();
    if(m.t==='notes'){clearTimeout(NBS.t);NBS.t=setTimeout(()=>syncNotes().catch(()=>{}),800)}};
  ws.onclose=()=>{clearInterval(LIVE.ping);LIVE.ws=null;LIVE.state='off';if(document.hidden||!syncAllowed())return;LIVE.tries++;clearTimeout(LIVE.t);LIVE.t=setTimeout(liveConnect,Math.min(30000,1000*2**Math.min(LIVE.tries,5)))};
  ws.onerror=()=>{try{ws.close()}catch(e){}};
}
function liveClose(){clearTimeout(LIVE.t);if(LIVE.ws){try{LIVE.ws.close()}catch(e){}LIVE.ws=null}LIVE.state='off'}
afterSplash(()=>setTimeout(liveConnect,1500));
document.addEventListener('visibilitychange',()=>{if(document.hidden)liveClose();else setTimeout(liveConnect,400)});
addEventListener('online',()=>{setTimeout(()=>{liveConnect();syncNow()},500)});
/* notebooks: one server record per book and page */
let NBS={busy:false,t:0,err:'',bad:0,skip:new Map()};
/* Each notebook item is handled on its own: one that can't be opened (for example sealed earlier with a mistyped
   passphrase) is skipped and this device's own copy is uploaded again to repair it. Only the main sync data
   decides whether the passphrase is wrong. */
async function syncNotes(all){
  if(!syncAllowed()||NBS.busy)return;await E2E_READY;let N;try{N=await loadNotes()}catch(e){return}NBS.busy=true;
  try{
    const idx=await api('/sync/notes'),books=await N.IDB.all('books'),pages=await N.IDB.all('pages');
    const lb=new Map(books.map(b=>[b.id,b])),lp=new Map(pages.map(p=>[p.id,p])),open=N.openBookId();let pulled=0;
    const tombs=JSON.parse(lsGet('ishiros.nbtomb')||'{}');
    const heal=new Map(),bad=[];let srvEnc=!!meta.srvE2E,locked=0,netFail=0;
    /* pull what's newer on the server */
    for(const[kind,map,store]of[['books',lb,'books'],['pages',lp,'pages']]){
      for(const[id,m]of Object.entries(idx[kind]||{})){if(!ID_OK.test(id)||!m||typeof m!=='object')continue;const loc=map.get(id);
        if(m.d){if(loc&&(loc.u||0)<=m.u){await N.IDB.rawDel(store,id);map.delete(id);pulled++}continue}
        if(tombs[store+':'+id]&&tombs[store+':'+id]>=m.u)continue;
        if(open&&(kind==='books'?id===open:(loc&&loc.book===open)))continue;   /* never change the notebook you're writing in */
        if(loc&&(m.u||0)<=(loc.u||0))continue;
        if(!loc&&NBS.skip.get(store+':'+id)===m.u&&!all){bad.push(`${kind==='books'?'notebook':'page'} ${id}`);continue}   /* already known unreadable: don't download it again */
        let d;try{d=await api(`/sync/notes/item?kind=${kind==='books'?'book':'page'}&id=${encodeURIComponent(id)}`)}catch(e){netFail++;continue}
        if(!d||typeof d!=='object')continue;
        if(d.e2e){srvEnc=true;if(!E2E.key){locked++;continue}
          try{d=await e2eOpen(d)}catch(e){bad.push(e.code==='old'?e.message:`${kind==='books'?'notebook':'page'} ${id}`);if(loc)heal.set(store+':'+id,m.u||0);else NBS.skip.set(store+':'+id,m.u);continue}}
        else if(E2E.key&&srvEnc){bad.push(`${kind==='books'?'notebook':'page'} ${id} (not encrypted)`);if(loc)heal.set(store+':'+id,m.u||0);continue}
        if(!d||typeof d!=='object'||d.id!==id||(kind==='pages'&&d.book!=null&&!ID_OK.test(String(d.book)))){bad.push(`${kind==='books'?'notebook':'page'} ${id} (damaged)`);if(loc)heal.set(store+':'+id,m.u||0);continue}
        await N.IDB.put(store,d);map.set(id,d);pulled++}}
    if(srvEnc&&!meta.srvE2E){meta.srvE2E=1;saveMeta()}
    /* this device's passphrase didn't open the main data: upload nothing, or notebooks would be sealed with a key no other device has */
    if(E2E.key&&SYNCST.keyBad){NBS.err='notebooks not uploaded until the passphrase opens your main synced data';if(pulled)N.refresh();return}
    /* the server is encrypted but this device has no passphrase: upload nothing (it would go up unencrypted) */
    if(srvEnc&&!E2E.key){NBS.err=`notebooks not synced${locked?` (${locked} waiting)`:''}: your server copy is encrypted. Enter your sync passphrase in Settings → Connections → End-to-end encryption.`;if(pulled)N.refresh();return}
    /* repair: this device's copy of an item that couldn't be opened goes up again, marked newer so every device takes it */
    for(const[k,su]of heal){const[store,id]=k.split(':');const map=store==='books'?lb:lp,loc=map.get(id);if(!loc)continue;
      loc.u=Math.max(loc.u||0,su)+1;await N.IDB.put(store,loc)}
    /* push what's newer here (in batches that stay well under the size limit) */
    const items=[];
    for(const b of lb.values()){const m=idx.books&&idx.books[b.id];if(all||heal.has('books:'+b.id)||!m||(b.u||0)>(m.u||0))items.push({kind:'book',id:b.id,u:b.u||Date.now(),data:b})}
    for(const p of lp.values()){const m=idx.pages&&idx.pages[p.id];if(all||heal.has('pages:'+p.id)||!m||(p.u||0)>(m.u||0))items.push({kind:'page',id:p.id,u:p.u||Date.now(),data:p})}
    const sentT={};
    for(const[k,u]of Object.entries(tombs)){const[store,id]=k.split(':');const m=idx[store]&&idx[store][id];sentT[k]=u;if(!m||!m.d)items.push({kind:store==='books'?'book':'page',id,u,deleted:true})}
    let batch=[],size=0;const send=async()=>{if(!batch.length)return;await api('/sync/notes',{method:'PUT',body:JSON.stringify({items:batch})});batch=[];size=0};
    for(const it of items){if(E2E.key&&it.data)it.data=await e2eSeal(it.data);const n=JSON.stringify(it).length;if(size+n>4e6)await send();batch.push(it);size+=n}await send();
    /* forget only the deletions that were just sent; ones made during the upload go next time */
    if(Object.keys(sentT).length){const now=JSON.parse(lsGet('ishiros.nbtomb')||'{}');for(const[k,u]of Object.entries(sentT))if(now[k]===u)delete now[k];lsSet('ishiros.nbtomb',JSON.stringify(now))}
    NBS.bad=bad.length;
    NBS.err=bad.length?`${bad.length} notebook item${bad.length===1?'':'s'} on the server couldn’t be opened with this passphrase${heal.size?` (${heal.size} repaired from this device)`:''}; your copies here are untouched`:netFail?`${netFail} notebook item${netFail===1?'':'s'} didn’t download; will retry`:'';
    if(pulled){N.refresh();if(state.tab==='mind'){DATA_VER++;notebookStrip()}}
  }finally{NBS.busy=false}
}
window.addEventListener('life-notes-changed',()=>{clearTimeout(NBS.t);NBS.t=setTimeout(()=>syncNotes().catch(()=>{}),2500)});
document.addEventListener('click',e=>{const b=e.target.closest('#syncTg');if(!b)return;e.stopImmediatePropagation();e.preventDefault();SYNC.syncOn=SYNC.syncOn===false;saveSync();b.setAttribute('aria-pressed',String(SYNC.syncOn!==false));if(SYNC.syncOn)syncNow(true)},true);
/* pull on open, when you come back to Life, and every minute while it's open */
afterSplash(()=>setTimeout(()=>syncNow(true),900));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>syncNow(),500);else if(SYNCST.dirty)syncNow()});
/* safety net: check every 20 s if the live link is down, every 2 min if it's up */
setInterval(()=>{if(!document.hidden&&(LIVE.state!=='live'||Date.now()-(SYNCST.lastAt||0)>12e4))syncNow()},20000);
