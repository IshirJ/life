
const KEY='ishiros.life.v1';
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const P={
  food:'<path d="M7 3v8a2 2 0 0 0 2 2v8M11 3v8M7 7h4M17 3c-1.7 0-3 2-3 5s1.3 4 3 4v9"/>',
  weight:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 9.5a4 4 0 0 1 6 0l-2 2.5"/>',
  workout:'<path d="M6 8v8M3.5 10v4M18 8v8M20.5 10v4M6 12h12"/>',
  task:'<path d="M5 12.5l4 4 10-10"/>',
  reminder:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0"/>',
  class:'<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z"/>',
  meeting:'<circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M14.5 19a4 4 0 0 1 6.5-3"/>',
  project:'<path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h4.5l2 2H19a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z"/>',
  folder:'<path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h4.5l2 2H19a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z"/>',
  injury:'<rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="M10.5 10.5h.01M13.5 13.5h.01M10.5 13.5h.01M13.5 10.5h.01"/>',
  idea:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  note:'<path d="M14 4l6 6-10 10H4v-6z"/>',
  scrap:'<path d="M4 15c3-6 5 4 8-2s5 4 8-2"/>',
  today:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  plan:'<rect x="3.5" y="5" width="17" height="15" rx="4"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  work:'<rect x="3.5" y="7" width="17" height="12.5" rx="3.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/>',
  health:'<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
  mind:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  close:'<path d="M6 6l12 12M18 6L6 18"/>',
  arrow:'<path d="M12 5v14M6 13l6 6 6-6"/>',
  chev:'<path d="M6 9l6 6 6-6"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
  flame:'<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.6-5.3 3.6-8.3 1.6 1.2 2.3 2.8 2.4 4.3 1.1-.6 1.9-1.8 2-3.3 2.4 1.9 5 4.4 5 7.3 0 3.6-2.6 6.2-6.5 6.2z"/>',
  cal:'<rect x="3.5" y="5" width="17" height="15" rx="4"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  edit:'<path d="M14 4l6 6-10 10H4v-6z"/>'
};
const ic=(k,cls='i')=>`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[k]||''}</svg>`;
const TYPES={
  class:{label:'Class',f:[['title','Course','text'],['days','Days','days'],['start','Starts','time'],['end','Ends','time'],['place','Room','text'],['look','Icon & colour','look']]},
  task:{label:'Task',f:[['title','Task','text'],['due','Due','date'],['project','Project','text'],['priority','Priority','select:Normal,High,Low'],['notes','Notes','area']]},
  meeting:{label:'Meeting',f:[['title','Meeting','text'],['date','Date','date'],['time','Time','time'],['repeat','Repeats','select:Never,Daily,Weekdays,Weekly,Every 2 weeks,Monthly'],['until','Repeat until (optional)','date'],['with','With','text'],['look','Icon & colour','look'],['notes','Notes','area']]},
  project:{label:'Project',f:[['title','Project','text'],['status','Status','select:Active,Planning,Paused,Done'],['next','Next step','text'],['look','Icon & colour','look'],['notes','Notes','area']]},
  food:{label:'Food',f:[['title','Food','text'],['meal','Meal','select:Breakfast,Lunch,Dinner,Snack'],['grams','Amount (g)','number'],['kcal','Calories (kcal)','number'],['protein','Protein (g)','number'],['fat','Fat (g)','number'],['carbs','Carbs (g)','number'],['date','Date','date']]},
  weight:{label:'Weight',f:[['value','Weight (lb)','number'],['date','Date','date']]},
  workout:{label:'Workout',f:[['title','Workout','text'],['minutes','Minutes','number'],['date','Date','date'],['notes','Sets, reps, how it felt','area']]},
  injury:{label:'Injury',f:[['title','Body area','text'],['pain','Pain (0–10)','number'],['status','Status','select:Active,Healing,Healed'],['date','Started','date'],['notes','Notes','area']]},
  idea:{label:'Idea',f:[['title','Idea','text'],['tag','Tag','text'],['folder','Folder','folder'],['notes','Details','area']]},
  note:{label:'Note',f:[['title','Title','text'],['folder','Folder','folder'],['notes','Note','area']]},
  reminder:{label:'Reminder',f:[['title','Remind me to','text'],['due','Date','date'],['time','Time','time'],['importance','Importance','select:Normal,High,Urgent,Low']]},
  scrap:{label:'Scrap',f:[['notes','Anything','area']]},
  folder:{label:'Folder',f:[['title','Folder name','text']]},
  job:{label:'Job application',f:[['title','Company','text'],['role','Role','text'],['stage','Stage','select:Saved,Applied,Assessment,Interview,Offer,Rejected'],['date','Applied on','date'],['next','Next date (interview, deadline)','date'],['link','Job link','text'],['notes','Notes','area']]},
  focus:{label:'Focus',f:[['title','What','text'],['minutes','Minutes','number'],['rating','Focus (1–5)','number'],['notes','What got done','area'],['date','Date','date']]}
};
const ADDABLE=Object.keys(TYPES).filter(k=>k!=='folder'&&k!=='focus');
const TABS={
  today:{title:'Today',label:'Today',add:['food','task','weight','workout','reminder','scrap']},
  plan:{title:'Schedule',label:'Week',add:['class','meeting','task']},
  work:{title:'Work',label:'Work',subs:[['task','Tasks'],['meeting','Meetings'],['project','Projects'],['job','Jobs']]},
  health:{title:'Health',label:'Health',subs:[['food','Food'],['activity','Activity'],['weight','Weight'],['workout','Workouts'],['injury','Injuries']]},
  mind:{title:'Ideas',label:'Ideas',subs:[['idea','Ideas'],['note','Notes'],['reminder','Reminders'],['scrap','Scrap']]}
};
const state={tab:'today',day:0,folder:null,heatRange:16,sub:{work:'task',health:'food',mind:'idea'}};
const $=s=>document.querySelector(s);
const SC=document.getElementById('scroller');
/* a different greeting each time the app opens */
const GREET=(()=>{const h=new Date().getHours(),tod=h<5?'Up late,':h<12?'Good morning,':h<17?'Good afternoon,':h<22?'Good evening,':'Up late,';
  const L=[tod,'Welcome back,','Hey,','Hello again,','Let\u2019s go,','Nice to see you,',tod];let last=-1;try{last=+localStorage.getItem('ishiros.greet')}catch(e){}
  let i;do{i=Math.floor(Math.random()*L.length)}while(i===last&&L.length>1);try{localStorage.setItem('ishiros.greet',i)}catch(e){}return L[i]})();
const $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today=()=>iso(new Date());
const addDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const dayDiff=s=>Math.round((new Date(s+'T00:00')-new Date(today()+'T00:00'))/864e5);
const wdOf=s=>DAYS[(new Date(s+'T00:00').getDay()+6)%7];
/* date labels are formatted thousands of times per screen: one shared formatter + a cache instead of toLocaleDateString each time */
const _FD=new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric'}),_FL=new Intl.DateTimeFormat(undefined,{weekday:'short',month:'short',day:'numeric'}),_FDC=new Map(),_FLC=new Map();
const fmtDate=s=>{if(!s)return'';let v=_FDC.get(s);if(v===undefined){v=_FD.format(new Date(s+'T00:00'));if(_FDC.size>2000)_FDC.clear();_FDC.set(s,v)}return v};
const fmtLong=s=>{if(!s)return'';let v=_FLC.get(s);if(v===undefined){v=_FL.format(new Date(s+'T00:00'));if(_FLC.size>2000)_FLC.clear();_FLC.set(s,v)}return v};
const C24=()=>{try{return!!db.settings.clock24}catch(e){return false}};
const fmtTime=t=>{if(!t)return'';const[h,m]=t.split(':').map(Number);return C24()?`${pad(h)}:${pad(m)}`:`${(h%12)||12}:${pad(m)}`};
const ampm=t=>t&&!C24()?(Number(t.split(':')[0])<12?'AM':'PM'):'';
const fmtT=t=>t?(C24()?fmtTime(t):`${fmtTime(t)} ${ampm(t)}`):'';
const relDue=s=>{if(!s)return'';const n=dayDiff(s);if(n<0)return`${-n}d late`;if(n===0)return'Today';if(n===1)return'Tomorrow';if(n<7)return wdOf(s);return fmtDate(s)};
const num=v=>Number(v)||0;
const fmtN=n=>Math.round(n).toLocaleString();

const DEF={profile:null,startTab:'today',dayStart:9,clock24:false,todayHide:[],kcal:2200,protein:150,fat:70,carbs:250,lockMin:5,active:150,goalWeight:'',sound:true,theme:'system',accent:'',hero:'',head:'serif',corners:'round',glass:26,icons:'color',motion:true};
let db={entries:[],settings:{...DEF}};
/* settings arrive from backups and other devices: numbers must be numbers before they are put into the page */
function cleanSettings(s){const o={...DEF,...(s&&typeof s==='object'?s:{})};
  for(const k of ['kcal','protein','fat','carbs','active','lockMin','dayStart','glass']){const v=o[k];o[k]=(v!==''&&v!=null&&Number.isFinite(+v))?+v:(DEF[k]||0)}
  o.goalWeight=o.goalWeight===''||o.goalWeight==null?'':(Number.isFinite(+o.goalWeight)&&String(o.goalWeight).trim()!==''?+o.goalWeight:'');
  if(typeof o.startTab!=='string'||!/^[a-z]+$/.test(o.startTab))o.startTab='today';
  if(!Array.isArray(o.todayHide))o.todayHide=[];
  return o}
/* ids are put into HTML attributes everywhere: anything that isn't a plain id is replaced by a stable safe one */
const ID_OK=/^[\w:.@-]{1,120}$/;
const safeId=id=>{const s=String(id??'');if(ID_OK.test(s))return s;let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return'x'+(h>>>0).toString(36)+s.length.toString(36)};
function cleanEntries(a){return(Array.isArray(a)?a:[]).filter(e=>e&&typeof e==='object'&&e.id!=null).map(e=>{if(!ID_OK.test(String(e.id)))e.id=safeId(e.id);if(e.folder!=null&&!ID_OK.test(String(e.folder)))e.folder=safeId(e.folder);return e})}
let LOCKED_BLOB=null;
const prof=()=>({name:'Ishir Johari',...(db.settings.profile||{})});
const firstName=()=>(prof().name.trim().split(/\s+/)[0]||'there');
const myInitials=()=>{const w=prof().name.trim().split(/\s+/).filter(Boolean);return((w[0]||'?')[0]+(w.length>1?w[w.length-1][0]:'')).toUpperCase()};
let DATA_VER=0;const VIEWS={};
function seed(){
  const s=o=>({id:uid(),created:Date.now(),sample:true,...o});
  const w=[[-18,172.8],[-15,172.1],[-12,171.9],[-9,171.2],[-6,171.4],[-3,170.6],[0,170.2]].map(([d,v])=>s({type:'weight',value:v,date:addDays(d)}));
  const fApps=s({type:'folder',title:'App ideas'}),fHome=s({type:'folder',title:'Room'});
  return[
    s({type:'class',title:'Example class',days:['Mon','Wed','Fri'],start:'10:10',end:'11:00',place:'Room 101'}),
    s({type:'class',title:'Example lab',days:['Tue','Thu'],start:'14:00',end:'15:15',place:'Room 204'}),
    s({type:'task',title:'Finish problem set',due:addDays(1),project:'Class',priority:'High'}),
    s({type:'task',title:'Reply to recruiter email',due:today(),priority:'Normal'}),
    s({type:'meeting',title:'Project sync',date:today(),time:'16:00',with:'Team'}),
    s({type:'project',title:'ISHIR.OS Life app',status:'Active',next:'Approve the design'}),
    s({type:'food',title:'Greek yogurt + oats',meal:'Breakfast',kcal:420,protein:32,date:today()}),
    s({type:'food',title:'Chicken rice bowl',meal:'Lunch',kcal:650,protein:45,date:today()}),
    ...w,
    s({type:'workout',title:'Push day',minutes:55,date:addDays(-1),notes:'Bench 3×8'}),
    s({type:'workout',title:'Incline walk',minutes:30,date:addDays(-3)}),
    s({type:'workout',title:'Pull day',minutes:50,date:addDays(-5)}),
    s({type:'injury',title:'Lower back',pain:3,status:'Healing',date:addDays(-6),notes:'Started after deadlifts.\nSkip heavy pulls from the floor for two weeks.\nStretch hips each morning.'}),
    fApps,fHome,
    s({type:'idea',title:'Reel saver from the share sheet',tag:'App',folder:fApps.id,notes:'Share a reel, get a saved guide.'}),
    s({type:'idea',title:'Desk lamp on the ESP32',tag:'Hardware',notes:'MOSFET on pin 27, dim at night with the light sensor.'}),
    s({type:'note',title:'Room ideas',folder:fHome.id,notes:'LED strip behind desk\nCable tray under desk'}),
    s({type:'reminder',title:'Water + creatine',due:today(),time:'20:00'}),
    s({type:'scrap',notes:'Look into faster-whisper for reel transcripts'})
  ];
}
function load(){LOADED=true;
  try{const r=localStorage.getItem(KEY);if(r){const d=JSON.parse(r);if(d&&d.enc){LOCKED_BLOB=d;return}if(Array.isArray(d.entries)){db=d;db.entries=cleanEntries(db.entries);db.settings=cleanSettings(db.settings);return}}}catch(e){}
  db.entries=seed();
}
/* true while the passcode screen is up: the real data is still encrypted and `db` is an empty placeholder */
function isLocked(){return!!(LOCKED_BLOB&&!(typeof LOCK!=='undefined'&&LOCK.key))}
/* set just before a restore writes storage and reloads: nothing else may write over it on the way out */
let FROZEN=false;
function freezeStore(){FROZEN=true;try{clearTimeout(LOCK.timer);LOCK.timer=null}catch(e){}}
/* caches of server data (calendar, mail, health) share the ~5 MB storage with your entries: they go first when space runs out */
const CACHE_KEYS=['ishiros.cache.cal','ishiros.cache.mail','ishiros.cache.health'];
function lsWrite(k,v){try{localStorage.setItem(k,v);return true}catch(e){}
  for(const c of CACHE_KEYS)if(c!==k){try{localStorage.removeItem(c)}catch(e){}}
  try{localStorage.setItem(k,v);return true}catch(e){return false}}
let LOADED=false;
function save(){
  if(!LOADED||isLocked()||FROZEN)return;   /* before load() runs, db is an empty placeholder: never write it */   /* never write the empty placeholder over the encrypted data */
  DATA_VER++;if(typeof afterSave==='function')afterSave();if(typeof LOCK!=='undefined'&&LOCK.key){LOCK.saveEnc();return}
  if(lsWrite(KEY,JSON.stringify(db))){if(typeof storageOk==='function')storageOk()}else if(typeof storageFail==='function')storageFail()}
/* fast lookups: one pass builds an index by type and id; it rebuilds only when the data changes (DATA_VER) */
let IDX={v:-1,a:null,n:-1,t:null,i:null};
function idx(){const E=db.entries;if(IDX.v!==DATA_VER||IDX.a!==E||IDX.n!==E.length){const t={},i=new Map();for(const e of E){(t[e.type]||(t[e.type]=[])).push(e);i.set(e.id,e)}IDX={v:DATA_VER,a:E,n:E.length,t,i}}return IDX}
const of=t=>(idx().t[t]||[]).slice();
const find=id=>idx().i.get(id);

/* ---------- row content ---------- */
function titleOf(e){
  if(e.type==='weight')return`${e.value} lb`;
  if(e.type==='scrap')return(e.notes||'').split('\n')[0].slice(0,80)||'Scrap';
  return e.title||TYPES[e.type].label;
}
function subOf(e){
  const j=a=>a.filter(Boolean).join(' · ');
  switch(e.type){
    case'class':return j([(e.days||[]).join(' '),e.place]);
    case'task':return j([typeof projOf==='function'&&projOf(e)?'':e.project,e.priority==='High'?'High priority':'']);
    case'meeting':return j([fmtDate(e.date),fmtT(e.time),e.with]);
    case'project':return e.next?`Next: ${e.next}`:'';
    case'food':return j([e.meal,e.grams?`${e.grams} g`:'',(e.protein!==''&&e.protein!=null)?`${Math.round(num(e.protein))}P ${Math.round(num(e.fat))}F ${Math.round(num(e.carbs))}C`:'',e.date&&dayDiff(e.date)?fmtDate(e.date):'']);
    case'weight':return fmtLong(e.date);
    case'workout':return j([fmtDate(e.date),e.notes?e.notes.split('\n')[0]:'']);
    case'injury':return j([e.status,e.date?`since ${fmtDate(e.date)}`:'',e.notes?e.notes.split('\n')[0]:'']);
    case'idea':return e.tag||'';
    case'note':return(e.notes||'').split('\n')[0];
    case'reminder':return j([relDue(e.due),fmtT(e.time)]);
    case'scrap':return fmtDate(iso(new Date(e.created)));
  }
  return'';
}
function metaOf(e){
  switch(e.type){
    case'class':return[fmtT(e.start),'plain'];
    case'meeting':return[fmtT(e.time),'plain'];
    case'task':case'reminder':{if(!e.due||e.done)return['',''];const n=dayDiff(e.due);return[relDue(e.due),n<0?'late':n===0?'soon':'']}
    case'food':return[e.kcal?`${e.kcal} kcal`:'',''];
    case'workout':return[e.minutes?`${e.minutes} min`:'',''];
    case'project':return[e.status||'',''];
    case'job':return[e.stage||'Applied',e.stage==='Offer'?'soon':e.stage==='Rejected'?'plain':''];
    case'focus':return[e.minutes?`${e.minutes} min`:'',''];
    case'ext':return e.due?[relDue(e.due),dayDiff(e.due)<=0?'soon':'']:['',''];
  }
  return['',''];
}
const tile=(t,cls='')=>`<span class="ico k-${t} ${cls}">${ic(t)}</span>`;

function lead(e){
  if(e.type==='ext'&&e.allDay)return`<button class="chk${isExtDone(e)?' on':''}" data-xdone="${esc(e.xid)}" aria-label="Mark done"><i><svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7"/></svg></i></button>`;
  if(e.type==='task'||e.type==='reminder')
    return`<button class="chk${e.done?' on':''}" data-chk="${esc(e.id)}" aria-label="${e.done?'Mark not done':'Mark done'}"><i><svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7"/></svg></i></button>`;
  return tileE(e);
}
function painBar(p,big){const n=Math.max(0,Math.min(10,Math.round(num(p))));return`<span class="${big?'painbig':'pain'}" role="img" aria-label="Pain ${n} of 10">${Array.from({length:10},(_,i)=>`<i class="${i<n?'on':''}"></i>`).join('')}</span>`}
function row(e){
  const[m,mc]=metaOf(e),sub=subOf(e);
  const right=e.type==='injury'?painBar(e.pain):m?`<span class="meta ${mc}">${esc(m)}</span>`:'';
  return`<li class="row${e.done?' done':''}">${lead(e)}<button class="rowbtn" data-open="${esc(e.id)}"><span class="rt">${esc(titleOf(e))}</span>${sub?`<span class="rs">${esc(sub)}</span>`:''}</button>${right}</li>`;
}
const ART=`<svg class="art" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="ea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".95"/><stop offset="1" stop-color="var(--accent)" stop-opacity=".65"/></linearGradient></defs><path d="M20 40h24l-3 16a3 3 0 0 1-3 2.5H26a3 3 0 0 1-3-2.5z" fill="url(#ea)"/><rect x="18" y="37" width="28" height="6" rx="3" fill="var(--accent)"/><path d="M32 37V18" stroke="var(--sage-soft)" stroke-width="2.4" stroke-linecap="round"/><path d="M32 28c-9-1-13-8-12-14 9 0 13 7 12 14zM32 24c7-6 15-6 19-1-6 6-14 6-19 1z" fill="var(--sage-soft)"/><circle cx="48" cy="12" r="2" fill="var(--sage-soft)" opacity=".5"/><circle cx="14" cy="20" r="1.5" fill="var(--sage-soft)" opacity=".5"/></svg>`;
const emptyBox=t=>`<p class="empty">${ART}<span>${t}</span></p>`;
/* entries per day for the streak map: one pass, cached until the data changes */
let LC={v:-1,m:null};function logCounts(){if(LC.v!==DATA_VER){const m={};for(const e of db.entries){if(e.type==='folder'||e.sample)continue;const d=dayOf(e);if(d)m[d]=(m[d]||0)+1}LC={v:DATA_VER,m}}return LC.m}
/* long lists show the first 80 rows; “Show all” renders the rest (keeps big histories fast) */
const LIST_CAP=80;let LIST_ALL=false;
const list=(items,empty)=>{if(!items.length)return emptyBox(empty);const cut=!LIST_ALL&&items.length>LIST_CAP;return`<ul class="list card-s">${(cut?items.slice(0,LIST_CAP):items).map(row).join('')}</ul>${cut?`<button class="link showall" data-showall="1">Show all ${items.length}</button>`:''}`};
const section=(title,body,extra='')=>`<section class="sec"><div class="sec-h"><h2>${title}</h2>${extra}</div>${body}</section>`;
const byDue=(a,b)=>(a.due||'9999').localeCompare(b.due||'9999');
const byDateDesc=(a,b)=>(b.date||'').localeCompare(a.date||'')||b.created-a.created;
const sumKcal=a=>a.reduce((s,e)=>s+num(e.kcal),0);
const sumProt=a=>a.reduce((s,e)=>s+num(e.protein),0);

/* ---------- hero cards ---------- */
let artN=0;
function heroArt(orb){
  const n=++artN;
  return`<svg class="hero-art" viewBox="0 0 200 156" aria-hidden="true">
  <defs>
    <radialGradient id="orb${n}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".5" stop-color="${orb}"/><stop offset="1" stop-color="${orb}" stop-opacity=".4"/></radialGradient>
    <linearGradient id="gl${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".55" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient>
    <linearGradient id="rim${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".45" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity=".55"/></linearGradient>
  </defs>
  <circle cx="122" cy="66" r="56" fill="none" stroke="#fff" stroke-opacity=".25"/>
  <circle cx="122" cy="66" r="36" fill="none" stroke="#fff" stroke-opacity=".18"/>
  <circle cx="138" cy="56" r="30" fill="url(#orb${n})"/>
  <rect x="62" y="66" width="122" height="54" rx="27" fill="url(#gl${n})" stroke="url(#rim${n})" stroke-width="1.5"/>
  <rect x="72" y="72" width="102" height="14" rx="7" fill="#fff" opacity=".2"/>
</svg>`;
}
function heroCard(date){
  const food=of('food').filter(e=>e.date===date),kcal=sumKcal(food),prot=sumProt(food),g=db.settings;
  const left=g.kcal-kcal,n=12,on=Math.min(n,Math.round(kcal/g.kcal*n)),over=left<0;
  const segs=Array.from({length:n},(_,i)=>`<i class="${i<on?(over?'over':'on'):''}"></i>`).join('');
  const isToday=date===today();
  return`<section class="hero">${heroArt('#FFB27A')}
    <div class="cap">${isToday?'Calories · today':`Calories · ${esc(fmtDate(date))}`}</div>
    <div class="big num" aria-label="${Math.abs(left)} kilocalories ${over?'over':'left'}"><span class="roll" aria-hidden="true">${fmtN(Math.abs(left)).split('').map(c=>`<span style="display:inline-block">${c}</span>`).join('')}</span></div>
    <div class="lead">kcal <b>${over?'over':'left'}</b>${isToday?' today':''}, of ${fmtN(g.kcal)}</div>
    <div class="segs" aria-hidden="true">${segs}</div>
    <div class="macros">${[['Protein',prot,g.protein],['Fat',food.reduce((s,e)=>s+num(e.fat),0),g.fat],['Carbs',food.reduce((s,e)=>s+num(e.carbs),0),g.carbs]].map(([l,v,goal])=>`<div><div class="cap">${l}</div><b class="num">${fmtN(v)}<small> / ${goal}g</small></b><div class="mbar"><i style="width:${Math.min(100,v/goal*100)}%"></i></div></div>`).join('')}</div>
    <div class="hero-actions"><button class="pill light" data-add="food">${ic('food')}Log food</button><button class="pill glassy" data-add="weight">${ic('weight')}Weigh in</button></div>
  </section>`;
}
function heroBanner(kicker,big,lead,stats,orb,actions=''){
  return`<section class="hero">${heroArt(orb)}
    <div class="cap">${kicker}</div>
    <div class="big num">${big}</div>
    <div class="lead">${lead}</div>
    ${stats?`<div class="hero-stats">${stats.map(([l,v])=>`<div><div class="cap">${l}</div><b class="num">${v}</b></div>`).join('')}</div>`:''}
    ${actions}
  </section>`;
}
function ring(pct,icon){
  const r=19,c=2*Math.PI*r,p=Math.max(0,Math.min(1,pct));
  return`<div class="ring"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="${r}" fill="none" stroke="var(--surface2)" stroke-width="5.5"/><circle class="arc" data-len="${(c*p).toFixed(1)}" cx="24" cy="24" r="${r}" fill="none" stroke="var(--accent)" stroke-width="5.5" stroke-linecap="round" stroke-dasharray="${(c*p).toFixed(1)} ${c.toFixed(1)}"/></svg><span>${ic(icon)}</span></div>`;
}
function weights(){return of('weight').filter(e=>e.date).sort((a,b)=>a.date.localeCompare(b.date))}
function weightDelta(ws){const last=ws[ws.length-1],ref=[...ws].reverse().find(e=>e.date<=addDays(-7));return last&&ref?num(last.value)-num(ref.value):null}
function deltaPill(d){if(d===null)return'';const up=d>0;return`<span class="delta ${up?'up':'down'}"><svg class="i" viewBox="0 0 24 24" style="width:12px;height:12px;${up?'transform:rotate(180deg)':''}">${P.arrow}</svg>${Math.abs(d).toFixed(1)} lb / wk</span>`}
function tiles(){
  const td=today(),g=db.settings;
  const prot=sumProt(of('food').filter(e=>e.date===td));
  const act=of('workout').filter(e=>e.date&&dayDiff(e.date)>-7&&dayDiff(e.date)<=0).reduce((s,e)=>s+num(e.minutes),0);
  const ws=weights(),last=ws[ws.length-1],d=weightDelta(ws);
  const gw=g.goalWeight===''?null:num(g.goalWeight);
  const wp=gw&&last&&ws[0]&&num(ws[0].value)!==gw?Math.max(0,Math.min(1,(num(ws[0].value)-num(last.value))/(num(ws[0].value)-gw))):d===null?0:.5;
  return`<div class="tiles">
    <button class="tile card-s" data-goto="health:food">${ring(prot/g.protein,'food')}<div><b class="num">${fmtN(prot)}<small>g</small></b><div class="cap">Protein</div></div></button>
    <button class="tile card-s" data-goto="health:workout">${ring(act/g.active,'workout')}<div><b class="num">${fmtN(act)}<small>min</small></b><div class="cap">Active · 7d</div></div></button>
    <button class="tile card-s" data-goto="health:weight">${ring(wp,'weight')}<div><b class="num">${last?esc(last.value):'—'}<small>lb</small></b><div class="cap">${d===null?'Weight':`${d>0?'+':'−'}${Math.abs(d).toFixed(1)} · 7d`}</div></div></button>
  </div>`;
}
function chart(ws,W=320,H=128){
  if(ws.length<2)return`<p class="hint" style="margin-top:12px">Log two weigh-ins to see your trend.</p>`;
  const L=6,R=6,T=14,B=20;
  const ts=ws.map(e=>new Date(e.date+'T00:00').getTime()),vs=ws.map(e=>num(e.value));
  const goal=db.settings.goalWeight===''?null:num(db.settings.goalWeight);
  let mn=Math.min(...vs,...(goal?[goal]:[])),mx=Math.max(...vs,...(goal?[goal]:[]));if(mx-mn<1){mn-=.5;mx+=.5}
  const t0=ts[0],t1=ts[ts.length-1];
  const x=t=>L+(t1===t0?0:(t-t0)/(t1-t0))*(W-L-R),y=v=>T+(mx-v)/(mx-mn)*(H-T-B);
  const pts=ts.map((t,i)=>`${x(t).toFixed(1)},${y(vs[i]).toFixed(1)}`);
  const ex=x(t1),ey=y(vs[vs.length-1]);
  const grid=[0,.5,1].map(f=>{const yy=(T+f*(H-T-B)).toFixed(1);return`<line x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}" stroke="var(--line)" stroke-dasharray="2 5"/>`}).join('');
  return`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Weight trend from ${mn.toFixed(1)} to ${mx.toFixed(1)} lb">
    <defs><linearGradient id="wg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".28"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
    ${grid}
    ${goal?`<line x1="${L}" x2="${W-R}" y1="${y(goal).toFixed(1)}" y2="${y(goal).toFixed(1)}" stroke="var(--good)" stroke-width="1.5" stroke-dasharray="5 4"/><text x="${W-R}" y="${(y(goal)-5).toFixed(1)}" text-anchor="end" font-size="10" font-family="Space Mono, monospace" fill="var(--good)">GOAL ${goal}</text>`:''}
    <path d="M${x(t0)},${H-B} L${pts.join(' L')} L${ex},${H-B} Z" fill="url(#wg)"/>
    <polyline class="line" points="${pts.join(' ')}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${ex}" cy="${ey}" r="6" fill="var(--surface)" stroke="var(--accent)" stroke-width="3"/>
    <text x="${L}" y="${H-4}" font-size="10" font-family="Space Mono, monospace" fill="var(--muted)">${esc(fmtDate(ws[0].date).toUpperCase())}</text>
    <text x="${W-R}" y="${H-4}" text-anchor="end" font-size="10" font-family="Space Mono, monospace" fill="var(--muted)">${esc(fmtDate(ws[ws.length-1].date).toUpperCase())}</text>
  </svg>`;
}
function goalLine(last){
  const g=db.settings.goalWeight;
  if(g===''||!last)return`<div class="goal">Set a goal weight in Settings</div>`;
  const diff=num(last.value)-num(g);
  return`<div class="goal">Goal <b>${esc(g)} lb</b> · ${Math.abs(diff)<.05?'reached':`${Math.abs(diff).toFixed(1)} lb to ${diff>0?'lose':'gain'}`}</div>`;
}
function weightCard(){
  const ws=weights(),last=ws[ws.length-1],d=weightDelta(ws);
  return`<section class="wcard card-s">
    <div class="wtop"><div><div class="cap">Weight</div><div class="wnum num">${last?esc(last.value):'—'}<small>LB</small></div>${goalLine(last)}</div>${deltaPill(d)}</div>
    ${chart(ws.slice(-20))}
  </section>`;
}
const dayOf=e=>e.date||e.due||iso(new Date(e.created||Date.now()));
/* interactive heatmap: tap a square for its day, switch range; squares ripple in */
const heatCtx={};
function heatmap(id,title,valueFor,unit){
  const weeks=state.heatRange,now=new Date(),wd=(now.getDay()+6)%7;
  const start=new Date(now);start.setDate(now.getDate()-wd-(weeks-1)*7);
  const vals=[];let mx=0;
  for(let i=0;i<weeks*7;i++){const d=new Date(start);d.setDate(start.getDate()+i);const s=iso(d),v=dayDiff(s)>0?null:valueFor(s);vals.push([s,v,d]);if(v>mx)mx=v}
  heatCtx[id]={unit};
  let cells='',lastMonth=-1;
  for(let w=0;w<weeks;w++){
    const d0=vals[w*7][2],m=d0.getMonth();
    cells+=`<span class="mo">${m!==lastMonth?d0.toLocaleDateString(undefined,{month:'short'}):''}</span>`;lastMonth=m;
    for(let k=0;k<7;k++){const[s,v]=vals[w*7+k];
      const lvl=v===null?'fut':!v?'':'l'+Math.max(1,Math.min(4,Math.ceil(v/mx*4)));
      cells+=`<button class="${lvl}${s===today()?' now':''}" data-heat="${esc(id)}" data-d="${s}" data-v="${v||0}" data-w="${w}" data-k="${k}" aria-label="${esc(fmtLong(s))}: ${v||0} ${unit}"></button>`}
  }
  const total=vals.filter(v=>v[1]).length;
  const ranges=[[8,'8W'],[16,'16W'],[26,'26W']];
  return section(title,`<div class="heat card-s" id="heat-${id}">
    <div class="heat-top"><span class="cap num">${total} active days</span><div class="seg2" style="width:156px">${ranges.map(([n,l])=>`<button data-range="${n}" aria-pressed="${state.heatRange===n}">${l}</button>`).join('')}</div></div>
    <div class="hm" style="grid-template-columns:repeat(${weeks},minmax(0,1fr))">${cells}</div>
    <div class="legend"><span class="cap">Less</span><i></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><span class="cap">More</span></div>
    <div class="tip hide" role="status"></div></div>`);
}
function showTip(btn){
  const box=btn.closest('.heat'),tip=box.querySelector('.tip');
  box.querySelectorAll('.hm button.sel').forEach(b=>b.classList.remove('sel'));
  btn.classList.add('sel');
  const u=heatCtx[btn.dataset.heat]?.unit||'';
  tip.innerHTML=`<small>${esc(fmtLong(btn.dataset.d))}</small>${esc(btn.dataset.v)} ${esc(u)}`;
  const br=btn.getBoundingClientRect(),hr=box.getBoundingClientRect();
  tip.classList.remove('hide');
  const tw=tip.offsetWidth||120;
  let left=br.left-hr.left+br.width/2-tw/2;left=Math.max(8,Math.min(hr.width-tw-8,left));
  tip.style.left=left+'px';tip.style.top=(br.top-hr.top-tip.offsetHeight-10)+'px';
  clearTimeout(showTip.t);showTip.t=setTimeout(()=>{tip.classList.add('hide');btn.classList.remove('sel')},2600);
}
function statsGrid(){
  const wo=of('workout').filter(e=>e.date&&dayDiff(e.date)<=0);
  const ym=today().slice(0,7),month=wo.filter(e=>e.date.slice(0,7)===ym).length;
  const wk=s=>{const d=new Date(s+'T00:00');d.setDate(d.getDate()-((d.getDay()+6)%7));return iso(d)};
  const weeksSet=new Set(wo.map(e=>wk(e.date)));
  let streak=0;const cur=new Date(wk(today())+'T00:00');
  if(!weeksSet.has(iso(cur)))cur.setDate(cur.getDate()-7);
  while(weeksSet.has(iso(cur))){streak++;cur.setDate(cur.getDate()-7)}
  const ws=weights(),last=ws[ws.length-1],ref=[...ws].reverse().find(e=>e.date<=addDays(-30))||ws[0];
  const d30=last&&ref&&last!==ref?num(last.value)-num(ref.value):null;
  return`<div class="stats">
    <div class="stat card-s"><div class="cap">${ic('workout')}Workouts</div><div class="v num">${wo.length}</div></div>
    <div class="stat card-s"><div class="cap">${ic('cal')}This month</div><div class="v num">${month}</div></div>
    <div class="stat card-s"><div class="cap">${ic('flame')}Week streak</div><div class="v num">${streak}</div></div>
    <div class="stat card-s"><div class="cap">${ic('weight')}Weight 30d</div><div class="v num ${d30===null?'':d30<=0?'good':'bad'}">${d30===null?'—':`${d30>0?'+':'−'}${Math.abs(d30).toFixed(1)}`}</div></div>
  </div>`;
}
function timeline(items){
  if(!items.length)return emptyBox('Nothing scheduled.');
  return`<div class="tl">${items.map(e=>{
    const cl=e.type==='class'||e.type==='ext'||e.type==='block',t=cl?e.start:e.time;
    const sub=cl?[e.place,e.end&&!e.allDay?`until ${fmtT(e.end)}`:''].filter(Boolean).join(' · '):[e.with].filter(Boolean).join(' · ');
    return`<div class="tli"><div class="tm">${e.allDay?'All<small>day</small>':`${esc(fmtTime(t))||'—'}<small>${esc(ampm(t))}</small>`}</div>
      <div class="tcard card-s">${tileE(e)}<button class="rowbtn" data-open="${esc(e.id)}"><span class="rt">${esc(e.title)}</span>${sub?`<span class="rs">${esc(sub)}</span>`:''}</button></div></div>`;
  }).join('')}</div>`;
}
function dayItems(d){
  const wd=wdOf(d);
  return[...of('class').filter(e=>(e.days||[]).includes(wd)).map(e=>[e.start||'',e]),
         ...of('meeting').filter(e=>e.date===d).map(e=>[e.time||'',e])].sort((a,b)=>a[0].localeCompare(b[0])).map(x=>x[1]);
}
function chipsAdd(keys){return`<div class="chips">${keys.map(k=>`<button class="chip" data-add="${k}">${tile(k)}${TYPES[k].label}</button>`).join('')}</div>`}
function chipsSub(tab){const cur=state.sub[tab];return`<div class="chips" role="tablist">${TABS[tab].subs.map(([k,l])=>`<button class="chip${k===cur?' on':''}" role="tab" aria-selected="${k===cur}" data-sub="${k}">${tile(k)}${l}</button>`).join('')}</div>`}

/* ---------- views ---------- */
const TODAY_SECS=[['habits','Habits','Water, creatine and other daily ticks'],['mail','Unread mail','Outlook and Gmail, when connected'],['chips','Quick-add buttons','Food, task, workout and more under the big card'],['progress','Your progress','Protein, active minutes, weight'],['due','Due this week','Open tasks and reminders'],['sched','Today’s schedule','Classes and meetings today'],['eaten','Eaten today','Everything you logged today'],['streak','Logging streak','The activity heatmap'],['weight','Weight','Trend chart and goal'],['inj','Injuries','Only shows when one is current']];
function viewToday(){
  const td=today();
  const due=[...db.entries.filter(e=>(e.type==='task'||e.type==='reminder')&&!e.done&&e.due&&dayDiff(e.due)<=7),...extDue(0,7)].sort(byDue);
  const food=of('food').filter(e=>e.date===td);
  const inj=of('injury').filter(e=>e.status!=='Healed');
  const H=new Set(db.settings.todayHide||[]),on=k=>!H.has(k);
  const bk=typeof meta!=='undefined'&&Date.now()-(meta.lastFile||0)>7*864e5&&!(meta.snoozeBk>Date.now());
  return(bk?`<div class="banner bkb">${ic('cloud')}<span style="flex:1;min-width:0">${meta.lastFile?`Last backup ${ago(meta.lastFile)}.`:'No backup yet.'} Deleting Life from the Home Screen deletes your data.</span><button data-bk="save">Save to Files</button><button data-bk="later" class="bkx" aria-label="Remind me in 2 days">${ic('close')}</button></div>`:'')
    +heroCard(td)
    +(on('chips')?chipsAdd(['food','task','workout','weight','reminder','note','idea','scrap']):'')
    +''
    +(on('habits')?habitSection():'')
    +(on('progress')?section('Your <em>progress</em>',tiles()+healthTiles(),`<button class="link" id="reviewBtn">${ic('review')}Week</button>`):'')
    +(on('mail')?mailSection():'')
    +(on('due')?section('Due <em>this week</em>',list(due,'Nothing due in the next 7 days.'),`<button class="link" data-goto="work:task">All tasks</button>`):'')
    +(on('sched')?section('Today’s <em>schedule</em>',timeline(dayItems(td).filter(e=>!e.allDay)),`<button class="link" data-goto="plan">Week</button>`):'')
    +(on('eaten')?section('Eaten <em>today</em>',list(food,'Nothing logged yet.'),`<span class="cap num">${fmtN(sumKcal(food))} kcal</span>`):'')
    +(on('streak')?heatmap('log','Logging <em>streak</em>',s=>logCounts()[s]||0,'entries'):'')
    +(on('weight')?section('Weight',weightCard()):'')
    +(on('inj')&&inj.length?section('Injuries',list(inj,'')):'');
}
/* ---------- schedule: day / week / month with filters ---------- */
const calView=()=>db.settings.calView||'day';
const calF=()=>({class:true,meeting:true,due:true,ext:true,block:true,...(db.settings.calF||{})});
const calItems=d=>dayItems(d).filter(e=>calF()[e.type]);
const dueOn=d=>calF().due?[...db.entries.filter(e=>(e.type==='task'||e.type==='reminder')&&!e.done&&e.due===d),...(typeof extOn==='function'?extOn(d).filter(e=>e.allDay&&e.date===d&&!isExtDone(e)).map(e=>({...e,due:d})):[])]:[];
const anchor=()=>state.wsel||today();
const shiftDays=(d,n)=>{const x=new Date(d+'T00:00');x.setDate(x.getDate()+n);return iso(x)};
function weekDays(d){const x=new Date(d+'T00:00');x.setDate(x.getDate()-((x.getDay()+6)%7));return[...Array(7)].map((_,i)=>{const y=new Date(x);y.setDate(x.getDate()+i);return iso(y)})}
const toMin=t=>{if(!t)return null;const[h,m]=t.split(':').map(Number);return h*60+m};
/* in the 7-day view, empty weekend days get half a column so busy days have room for their titles */
function wkCols(days){return days.map(d=>days.length===7&&[0,6].includes(new Date(d+'T12:00').getDay())&&!calItems(d).length?'minmax(0,.55fr)':'minmax(0,1fr)').join(' ')}
function hourGrid(days,wide){
  const items=days.map(d=>calItems(d).filter(e=>!e.allDay).map(e=>{const cl=e.type==='class'||e.type==='ext'||e.type==='block';const st=toMin(cl?e.start:e.time);let en=cl?toMin(e.end):null;if(st!==null&&(en===null||en<=st))en=st+60;return{e,st,en}}).filter(x=>x.st!==null));
  const all=items.flat();
  const h0=wide?Math.min(6,...all.map(x=>Math.floor(x.st/60))):Math.min(8,...all.map(x=>Math.floor(x.st/60))),h1=wide?Math.max(23,...all.map(x=>Math.ceil(x.en/60))):Math.max(18,...all.map(x=>Math.ceil(x.en/60)));
  const PH=wide?48:40,H=(h1-h0)*PH,sel=anchor(),nowM=new Date().getHours()*60+new Date().getMinutes();
  const hours=[...Array(h1-h0)].map((_,i)=>`<span style="top:${i*PH}px">${C24()?pad(h0+i):(((h0+i)%12)||12)+(h0+i<12?'a':'p')}</span>`).join('');
  const cols=days.map((d,di)=>`<div class="wcol${!wide&&d===sel?' on':''}"${wide?'':` data-wday="${d}"`}>${items[di].map(({e,st,en})=>{const top=(st-h0*60)/60*PH,ht=Math.max(wide?28:18,(en-st)/60*PH-2);
      const cl=e.type==='class'||e.type==='ext'||e.type==='block',t=cl?e.start:e.time,sub=[fmtT(t)+(cl&&e.end?`–${fmtT(e.end)}`:''),e.place||e.with].filter(Boolean).join(' · ');
      const pc=e.color!==undefined&&e.color!==''&&PICK_COLS[+e.color];return`<button class="blk${wide?' wide':''}${ht<26?' sh':''} k-${e.type}" data-open="${esc(e.id)}" style="top:${top.toFixed(1)}px;height:${ht.toFixed(1)}px${pc?`;--c1:${pc[0]};--c2:${pc[1]}`:''}" aria-label="${esc(e.title)} ${esc(fmtT(t))}">${(()=>{/* lines that fully fit inside the block (padding 4px top+bottom, ~10.6px per line narrow / 16px wide); never clipped mid-line */
        const ln=Math.max(1,Math.floor((ht-8)/(wide?16:10.6)));return wide?`<span class="bt one">${esc(e.title)}</span>${ht>=40&&sub?`<small>${esc(sub)}</small>`:''}`:`<span class="bt${ln===1?' one':''}" style="-webkit-line-clamp:${ln}">${esc(e.title)}</span>`})()}</button>`}).join('')}${d===today()&&nowM>=h0*60&&nowM<=h1*60?`<i class="nowline" style="top:${((nowM-h0*60)/60*PH).toFixed(1)}px"></i>`:''}</div>`).join('');
  const gcols=wkCols(days);
  const body=`<div class="wk-body" style="height:${H}px"><div class="wk-hours">${hours}</div><div class="wk-cols" style="--ph:${PH}px;grid-template-columns:${gcols}">${cols}</div></div>`;
  const strip=allDayStrip(days,wide);
  return strip+(wide?`<div class="day-scroll" data-h0="${h0}" data-ph="${PH}" style="max-height:${Math.round(6.5*PH)+16}px">${body}</div>`:body);
}
function initDayScroll(){
  const s=$('.day-scroll');if(!s)return;
  const h0=Number(s.dataset.h0),ph=Number(s.dataset.ph),st=Number(db.settings.dayStart)||9;
  let h=st;const nowH=new Date().getHours();if(anchor()===today()&&nowH>=st+5)h=Math.max(h0,nowH-1);
  s.scrollTop=Math.max(0,(h-h0)*ph-4);
}
function calNav(label){return`<div class="wk-top"><button class="wk-nav" data-calnav="-1" aria-label="Previous">${ic('chev','i chev l')}</button><b>${label}</b><button class="wk-nav" data-calnav="1" aria-label="Next">${ic('chev','i chev r')}</button></div>`}
function calCard(){
  const v=calView(),a=anchor();
  if(v==='day'){const n=dayDiff(a),label=n===0?'Today':n===1?'Tomorrow':n===-1?'Yesterday':fmtLong(a);
    const empty=!calItems(a).length;
    return`<section class="wk card-s">${calNav(esc(label))}${hourGrid([a],true)}${empty?'<p class="hint" style="margin:10px 0 0;text-align:center">Nothing scheduled.</p>':''}</section>`}
  if(v==='week'){const days=weekDays(a),cur=days.includes(today());
    const range=`${fmtDate(days[0])} – ${fmtDate(days[6])}`;
    const head=days.map(d=>{const due=dueOn(d).length;return`<button class="wd${d===a?' on':''}${d===today()?' today':''}" data-wday="${d}" aria-pressed="${d===a}" aria-label="${esc(fmtLong(d))}${due?`, ${due} due`:''}"><span>${wdOf(d).slice(0,2)}</span><b class="num">${+d.slice(8)}</b><i class="${due?'has':''}">${due||''}</i></button>`}).join('');
    return`<section class="wk card-s">${calNav(cur?'This week':esc(range))}<div class="wk-head" style="grid-template-columns:28px ${wkCols(days)}">${head}</div>${hourGrid(days,false)}</section>`}
  const m0=new Date(a.slice(0,7)+'-01T00:00'),mLabel=m0.toLocaleDateString(undefined,{month:'long',year:'numeric'});
  const start=new Date(m0);start.setDate(1-((m0.getDay()+6)%7));
  const cells=[];for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);cells.push(iso(d));if(i>=27&&i%7===6&&d.getMonth()!==m0.getMonth())break}
  const f=calF();
  const body=cells.map(d=>{const its=dayItems(d),dots=[f.class&&its.some(e=>e.type==='class')?'<i class="k-class"></i>':'',f.meeting&&its.some(e=>e.type==='meeting')?'<i class="k-meeting"></i>':'',f.ext!==false&&its.some(e=>e.type==='ext'&&!e.allDay)?'<i class="k-ext"></i>':'',dueOn(d).length?'<i class="due"></i>':''].join('');
    return`<button class="mc${d.slice(0,7)!==a.slice(0,7)?' out':''}${d===today()?' today':''}${d===a?' on':''}" data-wday="${d}" aria-pressed="${d===a}" aria-label="${esc(fmtLong(d))}"><b class="num">${+d.slice(8)}</b><span class="dots">${dots}</span></button>`}).join('');
  return`<section class="wk card-s">${calNav(esc(mLabel))}<div class="mgrid">${DAYS.map(x=>`<span class="mh">${x.slice(0,2)}</span>`).join('')}${body}</div></section>`;
}
function calControls(){
  const v=calView(),f=calF();
  return`<div class="cal-ctl"><div class="seg2" role="group" aria-label="Calendar view">${[['day','Day'],['week','Week'],['month','Month']].map(([k,l])=>`<button data-calview="${k}" aria-pressed="${v===k}">${l}</button>`).join('')}</div></div>
  <div class="cal-f" role="group" aria-label="Show">${[['class','Classes','k-class'],['meeting','Meetings','k-meeting'],['due','Due','due'],...((typeof SYNC!=='undefined'&&(SYNC.cals||[]).length)?[['ext','Calendars','k-ext']]:[])].map(([k,l,c])=>`<button data-calf="${k}" aria-pressed="${!!f[k]}"><i class="${c}"></i>${l}</button>`).join('')}</div>`;
}
function dayPane(){
  const d=anchor(),n=dayDiff(d),label=n===0?'Today':n===1?'Tomorrow':n===-1?'Yesterday':`${wdOf(d)}, ${fmtDate(d)}`;
  const due=dueOn(d);
  if(calView()==='day')return due.length?section('Due <em>'+esc(label.toLowerCase()==='today'?'today':label)+'</em>',list(due,'')):'';
  return section(`<em>${esc(label)}</em>`,timeline(calItems(d).filter(e=>!e.allDay)))+(due.length?section('Due',list(due,'')):'');
}
function viewPlan(){
  return section('Your <em>schedule</em>',calControls()+`<div id="calWrap">${calCard()}</div>`,`<button class="link" data-add="class">${ic('plus')}Class</button>`)
    +`<div id="dayPane">${dayPane()}</div>`
    +section('All <em>classes</em>',list(of('class'),'Add your classes so they show up every week.'));
}
function refreshCal(dir){
  const w=$('#calWrap');if(!w)return;w.innerHTML=calCard();initDayScroll();
  anim(w.firstElementChild,dir?{x:[dir*36,0],opacity:[.001,1]}:{opacity:[.001,1],y:[6,0]},{duration:.4});
  const pane=$('#dayPane');pane.innerHTML=dayPane();anim(pane,{opacity:[.001,1]},{duration:.3});
}
function doneSplit(type,emptyOpen){
  const a=of(type);
  const open=a.filter(e=>!e.done).sort(byDue),done=a.filter(e=>e.done).sort((x,y)=>(y.doneAt||0)-(x.doneAt||0)).slice(0,15);
  return section('Open',list(open,emptyOpen),`<span class="cap">${open.length}</span>`)+(done.length?section('Done',list(done,'')):'');
}
function ideaCard(e){
  const f=e.folder&&find(e.folder);
  return`<button class="card card-s" data-open="${esc(e.id)}" data-drag="${esc(e.id)}"><span class="cardtop">${e.tag?`<span class="tag">${esc(e.tag)}</span>`:tile(e.type)}${f&&!state.folder?`<span class="cap" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(f.title)}</span>`:''}</span><h4>${esc(titleOf(e))}</h4>${e.notes?`<p>${esc(e.notes)}</p>`:''}</button>`;
}
function folderRow(kind){
  const fs=of('folder'),items=of(kind);
  const all=`<button class="folder card-s${state.folder===null?' on':''}" data-folder="" data-drop="">${tile('folder')}<b>All</b><span class="cap">${items.length} item${items.length===1?'':'s'}</span></button>`;
  const rest=fs.map(f=>`<button class="folder card-s${state.folder===f.id?' on':''}" data-folder="${esc(f.id)}" data-drop="${esc(f.id)}">${tile('folder')}<b>${esc(f.title)}</b><span class="cap">${(n=>`${n} item${n===1?'':'s'}`)(items.filter(e=>e.folder===f.id).length)}</span></button>`).join('');
  return`<div class="folders">${all}${rest}<button class="folder new" data-add="folder">${ic('plus')}<b>New folder</b></button></div>`;
}
function viewMind(){
  const k=state.sub.mind;
  const ideas=of('idea').length,notes=of('note').length,fs=of('folder').length;
  let h=chipsSub('mind')+heroBanner('Ideas &amp; notes',`${ideas+notes}`,`saved across <b>${fs}</b> folder${fs===1?'':'s'}`,[['Ideas',ideas],['Notes',notes],['Reminders',of('reminder').filter(e=>!e.done).length]],'#E7B8FF');
  if(k==='note')h+=section('Note<em>books</em>','<div id="nbStrip"><p class="hint">Loading notebooks…</p></div>','<button class="link" data-nbopen="">'+ic('plus')+'Open</button>');
  if(k==='idea'||k==='note'){
    const items=of(k).filter(e=>state.folder?e.folder===state.folder:true).sort((x,y)=>y.created-x.created);
    const f=state.folder&&find(state.folder);
    h+=folderRow(k);
    h+=section(f?`<em>${esc(f.title)}</em>`:(k==='idea'?'All <em>ideas</em>':'All <em>notes</em>'),
      items.length?`<div class="grid2" id="cardGrid">${(LIST_ALL?items:items.slice(0,60)).map(ideaCard).join('')}</div>${!LIST_ALL&&items.length>60?`<button class="link showall" data-showall="1">Show all ${items.length}</button>`:''}<p class="hint" style="margin-top:12px">Press and hold a card, then drag it onto a folder.</p>`:emptyBox(f?'This folder is empty. Drag cards onto it.':'Nothing here yet. Tap + to add.'),
      f?`<button class="link" data-folder-edit="${esc(f.id)}">${ic('edit')}Rename</button>`:`<span class="cap">${items.length}</span>`);
    return h;
  }
  if(k==='reminder')return h+doneSplit('reminder','No reminders.');
  return h+section('Scrap',list(of('scrap').sort((x,y)=>y.created-x.created),'Nothing here yet. Tap + to add.'));
}
function viewWork(){
  const k=state.sub.work,open=of('task').filter(e=>!e.done);
  const dueToday=open.filter(e=>e.due&&dayDiff(e.due)<=0).length;
  let h=heroBanner('Work',`${open.length}`,`open task${open.length===1?'':'s'}${dueToday?`, <b>${dueToday} due today</b>`:''}`,[['Meetings',of('meeting').filter(e=>{const n=nextOcc(e);return n&&dayDiff(n)>=0}).length],['Projects',of('project').filter(e=>e.status!=='Done').length],['Done',of('task').filter(e=>e.done).length]],'#FFCB8A');h=chipsSub('work')+h;
  if(k==='job')return viewJobs();
  if(k==='task')return h+focusSection()+doneSplit('task','No open tasks.');
  if(k==='meeting'){
    const a=of('meeting'),nk=e=>(nextOcc(e)||'9999')+(e.time||''),up=a.filter(e=>!e.date||(nextOcc(e)&&dayDiff(nextOcc(e))>=0)).sort((x,y)=>nk(x).localeCompare(nk(y))),past=a.filter(e=>e.date&&!up.includes(e)).sort(byDateDesc).slice(0,10);
    return h+section('Upcoming',list(up,'No meetings coming up.'))+(past.length?section('Past',list(past,'')):'');
  }
  let any='';
  for(const st of['Active','Planning','Paused','Done']){const a=of('project').filter(e=>(e.status||'Active')===st);if(a.length)any+=section(st,projCards(a))}
  return h+(any||section('Projects',list([],'No projects yet. Tap + to add one.')));
}
function viewHealth(){
  const k=state.sub.health;
  if(k==='activity')return chipsSub('health')+activityView();
  if(k==='food'){
    let h=chipsSub('health')+heroCard(today());
    for(let i=0;i<7;i++){const d=addDays(-i),a=of('food').filter(e=>e.date===d);if(!a.length&&i>0)continue;
      h+=section(i===0?'<em>Today</em>':i===1?'Yesterday':`${wdOf(d)} ${fmtDate(d)}`,list(a,'Nothing logged yet.'),`<span class="cap num">${fmtN(sumKcal(a))} kcal</span>`)}
    return h;
  }
  if(k==='weight'){
    const ws=weights(),last=ws[ws.length-1],d=weightDelta(ws);
    return chipsSub('health')+heroBanner('Weight',last?esc(last.value):'—',last?`lb on ${esc(fmtLong(last.date))}`:'no weigh-ins yet',[['Rate / week',d===null?'—':`${d>0?'+':'−'}${Math.abs(d).toFixed(2)}`],['Goal',db.settings.goalWeight===''?'—':esc(db.settings.goalWeight)],['Weigh-ins',ws.length]],'#8FE3DA',
      `<div class="hero-actions"><button class="pill light" data-add="weight">${ic('weight')}Weigh in</button><button class="pill glassy" data-goto="settings">${ic('gear')}Set goal</button></div>`)
      +section('Trend',weightCard())+energyCard()+section('Weigh-ins',list([...ws].reverse(),'No weigh-ins yet.'));
  }
  if(k==='workout'){
    const a=of('workout').sort(byDateDesc),wk=a.filter(e=>e.date&&dayDiff(e.date)>-7&&dayDiff(e.date)<=0);
    const mins=wk.reduce((s,e)=>s+num(e.minutes),0);
    return chipsSub('health')+heroBanner('Training · 7 days',`${mins}`,`minutes, of your <b>${num(db.settings.active)}</b> min goal`,[['Sessions',wk.length],['All time',a.length]],'#B9F0A0',
      `<div class="hero-actions"><button class="pill light" data-add="workout">${ic('workout')}Start workout</button><button class="pill glassy" data-add-simple="workout">${ic('plus')}Quick log</button></div>`)
      +exerciseSection()
      +section('At a <em>glance</em>',statsGrid())
      +heatmap('train','Activity · <em>minutes</em>',s=>a.filter(e=>e.date===s).reduce((t,e)=>t+num(e.minutes),0),'min')
      +section('History',list(a,'No workouts logged yet.'));
  }
  const a=of('injury').sort(byDateDesc),act=a.filter(e=>e.status!=='Healed'),old=a.filter(e=>e.status==='Healed');
  const avg=act.length?(act.reduce((s,e)=>s+num(e.pain),0)/act.length).toFixed(1):'—';
  return chipsSub('health')+heroBanner('Injuries',`${act.length}`,`current${act.length?`, average pain <b>${avg}/10</b>`:''}`,[['Healed',old.length]],'#FFAFB8')
    +section('Current',list(act,'No current injuries.'))+(old.length?section('Healed',list(old,'')):'');
}
function header(){
  const t=TABS[state.tab],h=new Date().getHours();
  const greet=GREET;
  const dueN=db.entries.filter(e=>(e.type==='task'||e.type==='reminder')&&!e.done&&e.due&&dayDiff(e.due)<=0).length;
  const date=new Date().toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
  const left=state.tab==='today'
    ?`<button class="av" id="avBtn" aria-label="Your profile">${esc(myInitials())}${typeof avRings==='function'?avRings():''}</button><div class="hello"><div class="cap">${esc(date)}</div><h1 id="hi"><span class="hl1">${greet}</span><br><em>${esc(firstName())}</em></h1></div>`
    :`<div class="hello"><div class="cap">${esc(date)}</div><h1>${t.title}</h1></div>`;
  return left+`<button class="ib" id="searchBtn" aria-label="Search everything">${ic('search')}</button>
    <button class="ib" id="setBtn" aria-label="Settings${dueN?`, ${dueN} due today`:''}">${ic('gear')}${dueN?`<span class="badge">${dueN}</span>`:''}</button>`;
}

/* ---------- motion ---------- */
const RM=matchMedia('(prefers-reduced-motion: reduce)');
const noMotion=()=>RM.matches||db.settings.motion===false;
function anim(el,frames,o={}){
  if(noMotion()||!el)return;
  const kf=[{},{}];
  if(frames.y)kf.forEach((k,i)=>k.transform=`translateY(${frames.y[i]}px)`);
  if(frames.x)kf.forEach((k,i)=>k.transform=`translateX(${frames.x[i]}px)`);
  if(frames.scale)kf.forEach((k,i)=>k.transform=(k.transform||'')+` scale(${frames.scale[i]})`);
  if(frames.opacity)kf.forEach((k,i)=>k.opacity=frames.opacity[i]);
  if(frames.dash)kf.forEach((k,i)=>k.strokeDasharray=frames.dash[i]);
  if(window.Motion&&Motion.animate&&!frames.dash&&o.spring){
    try{const mf={};if(frames.y)mf.y=frames.y;if(frames.x)mf.x=frames.x;if(frames.scale)mf.scale=frames.scale;if(frames.opacity)mf.opacity=frames.opacity;
      return Motion.animate(el,mf,{type:'spring',stiffness:o.k||380,damping:o.d||30,delay:o.delay||0})}catch(e){}
  }
  try{el.animate(kf,{duration:(o.duration||.5)*1000,delay:(o.delay||0)*1000,easing:o.ease||'cubic-bezier(.22,1,.36,1)',fill:'backwards'})}catch(e){}
}
/* which layout fits the screen right now */
function layNow(){const w=innerWidth,h=innerHeight,s=Math.min(w,h);if(s>=600&&w>=700)return'tab';if(w>h&&w>=560)return'land';return'port'}
const RAIL=()=>document.documentElement.dataset.lay!=='port';
function applyLay(animate){
  const r=document.documentElement,was=r.dataset.lay,now=layNow();if(was===now)return;r.dataset.lay=now;
  for(const k in VIEWS)delete VIEWS[k];   /* panes rebuild for the new width */
  if(!was||!animate||noMotion()){if(was)render(false);requestAnimationFrame(()=>moveInd(true));return}
  render(false);requestAnimationFrame(()=>moveInd(true));
  /* turning the phone: the page settles in with a soft blur, the tab bar slides in from its new edge, and the glow flickers once */
  const v=$('#view'),d=$('.dock');v.classList.remove('relay');d.classList.remove('relay-side','relay-bottom');void v.offsetWidth;
  v.classList.add('relay');d.classList.add(now==='port'?'relay-bottom':'relay-side');
  setTimeout(()=>{v.classList.remove('relay');d.classList.remove('relay-side','relay-bottom')},700);
  try{const gl=$('#bgGlow');if(gl)gl.animate([{opacity:0},{opacity:.85,offset:.3},{opacity:.25,offset:.5},{opacity:.7,offset:.7},{opacity:0}],{duration:700,easing:'ease-out'})}catch(e){}
  if(typeof glitchIn==='function')setTimeout(glitchIn,180);
}
addEventListener('resize',()=>applyLay(true));
/* iOS reports the new size before the bar has re-laid out: re-measure whenever the bar itself changes size */
try{new ResizeObserver(()=>{if(!document.querySelector('.tabs.lensing'))moveInd(true)}).observe(document.querySelector('nav.tabs'))}catch(e){}
addEventListener('orientationchange',()=>{setTimeout(()=>{applyLay(true);moveInd(true)},120);setTimeout(()=>moveInd(true),600)});
function moveInd(instant){
  const on=$('#tabs button.on'),ind=$('#ind');
  if(!on||!ind)return;
  if(RAIL()){const y=on.offsetTop,fy=ind.dataset.y===undefined?y:Number(ind.dataset.y);ind.style.width='';ind.style.height=on.offsetHeight+'px';ind.dataset.y=y;delete ind.dataset.x;
    ind.getAnimations?.().forEach(a=>a.cancel());ind.style.transform=`translateY(${y}px)`;
    if(!instant&&!noMotion()&&fy!==y)try{ind.animate([{transform:`translateY(${fy}px)`},{transform:`translateY(${y}px)`}],{duration:460,easing:'cubic-bezier(.3,1.25,.5,1)'})}catch(e){}
    return}
  delete ind.dataset.y;ind.style.height='';
  const x=on.offsetLeft,w=on.offsetWidth,from=ind.dataset.x===undefined?x:Number(ind.dataset.x);
  ind.style.width=w+'px';ind.dataset.x=x;
  ind.getAnimations?.().forEach(a=>a.cancel());
  ind.style.transform=`translateX(${x}px)`;
  if(instant||noMotion()||from===x)return;
  try{ind.animate([{transform:`translateX(${from}px)`},{transform:`translateX(${x}px)`}],{duration:460,easing:'cubic-bezier(.3,1.25,.5,1)'})}catch(e){}
}
/* switching the small tabs at the top of a page: the tab row stays still, only the content below settles in softly.
   It never starts from invisible, so tapping fast can't make the page strobe. */
function subIn(){if(noMotion())return;const v=$('#view .pane')||$('#view');
  [...v.children].forEach(c=>{if(c.matches('.chips[role=tablist]'))return;try{c.animate([{opacity:.6,transform:'translateY(3px)'},{opacity:1,transform:'none'}],{duration:220,easing:'cubic-bezier(.22,1,.36,1)'})}catch(e){}})}
function playIn(first,dir){
  const v=$('#view .pane')||$('#view');
  if(dir!==undefined&&!first){ /* tab switch: one cheap composited slide, nothing else */
    v.getAnimations?.().forEach(a=>a.cancel());
    anim(v,dir?{x:[dir*22,0],opacity:[.001,1]}:{y:[8,0],opacity:[.001,1]},{duration:.3});return}
  /* one smooth pass: the page lifts in as a whole, then the main card's details settle */
  anim(v,{y:[first?24:10,0],opacity:[.001,1]},{duration:first?.7:.42});
  [...v.children].slice(0,4).forEach((el,i)=>i&&anim(el,{y:[12,0]},{duration:.5,delay:i*.04}));
  $$('.roll span').forEach((s,i)=>anim(s,{y:[-40,0],opacity:[.001,1]},{duration:.6,delay:.08+i*.05}));
  $$('.segs i.on,.segs i.over').forEach((s,i)=>anim(s,{scale:[.4,1],opacity:[.001,1]},{duration:.4,delay:.18+i*.03,ease:'cubic-bezier(.34,1.4,.64,1)'}));
  $$('.arc').forEach(c=>{const L=c.dataset.len,full=c.getAttribute('stroke-dasharray').split(' ')[1];anim(c,{dash:[`0 ${full}`,`${L} ${full}`]},{duration:.9,delay:.2})});
  $$('polyline.line').forEach(l=>{try{const len=l.getTotalLength();anim(l,{dash:[`0 ${len}`,`${len} ${len}`]},{duration:1,delay:.15})}catch(e){}});
}
function rippleHeat(hm){
  hm.querySelectorAll('button').forEach(b=>anim(b,{scale:[.2,1],opacity:[.001,1]},{duration:.4,delay:(Number(b.dataset.w)+Number(b.dataset.k))*.012,ease:'cubic-bezier(.34,1.56,.64,1)'}));
}
let firstRender=true;
function buildTabs(){
  $('#tabs').innerHTML=Object.keys(TABS).map(k=>`<button data-tab="${k}" aria-label="${TABS[k].title}">${ic(k)}<span>${TABS[k].label}</span></button>`).join('');
}
const viewFor=k=>k==='today'?viewToday():k==='plan'?viewPlan():k==='work'?viewWork():k==='health'?viewHealth():viewMind();
const viewSig=k=>[DATA_VER,today(),k,state.sub[k]||'',k==='mind'?state.folder:'',state.heatRange,k==='plan'?state.wsel||'':'',state.day,db.settings.calView||'',JSON.stringify(db.settings.calF||{}),db.settings.clock24,(db.settings.todayHide||[]).join(),typeof meta!=='undefined'?[meta.lastFile,meta.snoozeBk,SYNC.mailOn,SYNC.healthOn,(SYNC.cals||[]).length].join():''].join('|');
function buildPane(k){artN=k.length*100;const pane=document.createElement('div');pane.className='pane';pane.innerHTML=viewFor(k);VIEWS[k]={pane,sig:viewSig(k)};return pane}
function getPane(k,fresh){const c=VIEWS[k];return!fresh&&c&&c.sig===viewSig(k)?c.pane:buildPane(k)}
let warmT=null;
/* heavy background work waits until the startup animation is finished, so it never stutters */
var SPLASHING=false;const AFTER_SPLASH=[];
function afterSplash(fn){if(SPLASHING)AFTER_SPLASH.push(fn);else fn()}
function flushAfterSplash(){SPLASHING=false;let d=0;while(AFTER_SPLASH.length){const f=AFTER_SPLASH.shift();setTimeout(()=>{try{f()}catch(e){}},d);d+=120}}
function warmViews(){if(SPLASHING){if(!AFTER_SPLASH.includes(warmViews))AFTER_SPLASH.push(warmViews);return}clearTimeout(warmT);const todo=Object.keys(TABS).filter(k=>k!==state.tab&&!(VIEWS[k]&&VIEWS[k].sig===viewSig(k)));
  if(!todo.length)return;const go=()=>{const k=todo.shift();if(k&&k!==state.tab)getPane(k);if(todo.length)warmT=setTimeout(()=>(window.requestIdleCallback||setTimeout)(go),60)};
  warmT=setTimeout(()=>(window.requestIdleCallback||setTimeout)(go),400)}
function render(animate,first,switchDir){
  if(!$('#tabs button'))buildTabs();
  $$('#tabs button').forEach(b=>{const on=b.dataset.tab===state.tab;b.classList.toggle('on',on);b.setAttribute('aria-current',on?'page':'false')});
  $('#top').innerHTML=header();
  const pane=getPane(state.tab,switchDir===undefined);
  $('#view').replaceChildren(pane);
  if(state.tab==='plan')initDayScroll();
  if(state.tab==='mind'&&typeof notebookStrip==='function'&&!SPLASHING)notebookStrip();
  $('#sampleBar').hidden=!db.entries.some(e=>e.sample);
  moveInd(firstRender);
  if(animate)playIn(first,switchDir);
  firstRender=false;
  warmViews();
}
addEventListener('resize',()=>moveInd(true));
let actx;
function tick(){
  if(!db.settings.sound)return;
  try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();
    const t=actx.currentTime,o=actx.createOscillator(),g=actx.createGain();
    o.type='triangle';o.frequency.setValueAtTime(1760,t);o.frequency.exponentialRampToValueAtTime(880,t+.06);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.18,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+.09);
    o.connect(g).connect(actx.destination);o.start(t);o.stop(t+.1);
  }catch(e){}
}

/* ---------- openers (glass panels from their button) ---------- */
const wrap=$('#wrap');
let lastTrigger=null;
function openerMode(el){
  if(!el||!el.getBoundingClientRect)return['m-bottom','50% 100%'];
  const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,W=innerWidth,H=innerHeight;
  if(!r.width&&!r.height)return['m-bottom','50% 100%'];
  if(cy<H*.2)return['m-top',cx];
  if(cy>H*.78)return['m-bottom','50% 100%'];
  return['m-zoom',[cx,cy]];
}
let NAV_DIR=0,FORCE_MODE=null;
/* iPhone home-screen apps can report a viewport shorter than the screen; measure the gap so bottom layers reach the real bottom */
/* iOS home-screen bug: after the keyboard opens, the viewport stays ~59pt short (black band, bar floats/crops).
   Fix = force WebKit to re-measure by flipping a full-height fixed layer off/on once the keyboard closes. */
const STANDALONE=navigator.standalone||matchMedia('(display-mode: standalone)').matches;
let maxVH=innerHeight;
function expectedVH(){return maxVH}
function healViewport(){
  if(typeof SPLASHING!=='undefined'&&SPLASHING){if(!AFTER_SPLASH.includes(healViewport))AFTER_SPLASH.push(healViewport);return}
  if(expectedVH()-innerHeight<=4)return;
  const sc=document.getElementById('scroller');if(!sc)return;
  const st=sc.scrollTop;
  sc.style.display='none';void sc.offsetHeight;sc.style.display='';
  sc.scrollTop=st;
  /* nudge the document too — some iOS builds only recover on a scroll of the root */
  scrollTo(0,1);scrollTo(0,0);
}
addEventListener('resize',()=>{maxVH=Math.max(maxVH,innerHeight)});
document.addEventListener('focusout',e=>{if(e.target.matches&&e.target.matches('input,textarea,select'))setTimeout(healViewport,140)});
addEventListener('pageshow',()=>setTimeout(healViewport,60));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(healViewport,60)});
addEventListener('orientationchange',()=>setTimeout(healViewport,300));
setTimeout(healViewport,300);
function fixGap(){} /* legacy no-op */
/* while a panel is open, only the panel scrolls */
document.addEventListener('touchmove',e=>{if(!wrap.hidden&&!e.target.closest('.sheet')&&!e.target.closest('.menu'))e.preventDefault()},{passive:false});
function openSheet(html){
  const sh=$('.sheet');
  closeMenu();
  if(!wrap.hidden&&wrap.classList.contains('open')){
    const body=$('#sheetBody'),dir=NAV_DIR;NAV_DIR=0;if(FORCE_MODE){sh.className='sheet '+FORCE_MODE;FORCE_MODE=null}body.innerHTML=html;sh.scrollTop=0;
    anim(body,dir?{x:[dir*28,0],opacity:[.001,1]}:{y:[10,0],opacity:[.001,1]},{duration:.38});return}
  const[mode,origin]=FORCE_MODE?[FORCE_MODE,'50% 100%']:openerMode(lastTrigger);FORCE_MODE=null;
  wrap.classList.remove('open','closing');
  sh.getAnimations?.().forEach(a=>a.cancel());sh.style.transform='';sh.style.opacity='';sh._from=null;
  sh.className='sheet '+mode;
  $('#sheetBody').innerHTML=html;sh.scrollTop=0;
  wrap.hidden=false;SC.classList.add('locked');document.body.classList.add('panel');
  sh.classList.remove('opening');wrap.classList.add('blurred');
  if(mode==='m-zoom'){const top=innerHeight/2-sh.offsetHeight/2;sh.style.transformOrigin=`${Math.round(origin[0]-sh.offsetLeft)}px ${Math.round(origin[1]-top)}px`}
  else if(mode==='m-top'){sh.style.transformOrigin=`${Math.round(origin-sh.offsetLeft)}px 0`}
  else sh.style.transformOrigin=origin;
  const morph=mode==='m-top'&&lastTrigger&&lastTrigger.isConnected&&!noMotion();
  $$('#sheetBody>*').forEach((c,i)=>c.style.transitionDelay=morph?'0s':(.06+i*.025)+'s');
  if(morph){sh.classList.add('morph');sh.style.transform='none';sh.style.opacity='1';
    const br=lastTrigger.getBoundingClientRect(),sr=sh.getBoundingClientRect();
    sh.style.transformOrigin=`${br.left+br.width/2-sr.left}px ${br.top+br.height/2-sr.top}px`;
    sh._from=1;sh._btn=lastTrigger;sh.style.willChange='transform,opacity';
    try{const a=sh.animate([{transform:'scale(.5)',opacity:0},{transform:'scale(1)',opacity:1}],{duration:380,easing:'cubic-bezier(.2,.9,.25,1.04)'});a.onfinish=()=>{sh.style.willChange=''}}catch(e){}
  }
  void sh.offsetWidth;
  requestAnimationFrame(()=>wrap.classList.add('open'));
}
function closeSheet(){
  closeMenu();
  const sh=$('.sheet');
  $$('#sheetBody>*').forEach(c=>c.style.transitionDelay='0s');
  if(sh.classList.contains('morph')&&sh._from&&!sh._drag){
    if(sh._btn&&sh._btn.isConnected){const br=sh._btn.getBoundingClientRect(),sr=sh.getBoundingClientRect();sh.style.transformOrigin=`${br.left+br.width/2-sr.left}px ${br.top+br.height/2-sr.top}px`}
    sh.style.willChange='transform,opacity';
    try{sh.getAnimations().forEach(a=>a.cancel());sh.animate([{transform:'scale(1)',opacity:1},{transform:'scale(.6)',opacity:0}],{duration:240,easing:'cubic-bezier(.4,0,.8,.6)',fill:'forwards'})}catch(e){}
  }
  wrap.classList.add('closing');wrap.classList.remove('open');document.body.classList.remove('panel');
  setTimeout(()=>{if(!wrap.classList.contains('open')){wrap.hidden=true;wrap.classList.remove('blurred');wrap.classList.remove('closing');SC.classList.remove('locked');
    sh.classList.remove('morph');sh.style.transform='';sh.style.opacity='';sh.style.willChange='';sh.style.transition='';sh._drag=0;sh._from=null;sh.getAnimations?.().forEach(a=>a.cancel())}},360);
}
function toast(msg){$$('.toast').forEach(t=>t.remove());msg=String(msg).replace(/^(\w+Error|Error):\s*/,'');const t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent=msg;document.body.appendChild(t);setTimeout(()=>{t.style.transition='opacity .3s';t.style.opacity='0';setTimeout(()=>t.remove(),300)},Math.min(5000,1500+msg.length*30))}
const sheetHead=(title,back)=>`<div class="sh-h"><div class="lhs">${back?`<button class="back" data-back="${back}">${ic('chev','i chev')}Back</button>`:`<h3>${title}</h3>`}</div><button type="button" class="x" data-close aria-label="Close">${ic('close')}</button></div>${back?`<h3 style="margin:-6px 0 18px">${title}</h3>`:''}`;

/* custom select: a glass menu that drops from (or above) its button */
let openMenuFor=null;
const optList=options=>options.map(o=>typeof o==='string'?[o,o]:o);
function selectHTML(name,options,value,id){
  const opts=optList(options),v=value!==undefined&&value!==null&&opts.some(o=>o[0]===String(value))?String(value):opts[0][0];
  return`<div class="sel"><input type="hidden" name="${name}" value="${esc(v)}"><button type="button" class="sel-btn" id="${esc(id)}" aria-haspopup="listbox" aria-expanded="false" data-sel="${esc(JSON.stringify(opts))}"><span>${esc(opts.find(o=>o[0]===v)[1])}</span>${ic('chev','i chev')}</button></div>`;
}
function openMenu(btn){
  closeMenu();
  const opts=JSON.parse(btn.dataset.sel),cur=btn.parentElement.querySelector('input').value;
  const m=document.createElement('div');m.className='menu hide';m.setAttribute('role','listbox');
  m.innerHTML=opts.map(([v,l])=>`<button type="button" role="option" aria-selected="${v===cur}" data-opt="${esc(v)}"><span>${esc(l)}</span>${ic('check')}</button>`).join('');
  $('#menuLayer').appendChild(m);
  const r=btn.getBoundingClientRect(),below=innerHeight-r.bottom-16,above=r.top-16;
  m.style.left=r.left+'px';m.style.width=r.width+'px';m.style.overflowY='auto';m.style.overscrollBehavior='contain';m.style.webkitOverflowScrolling='touch';
  /* long lists scroll inside the menu instead of running off the screen; open on whichever side has more room */
  let mh=m.offsetHeight;const up=below<mh+8&&above>below,room=Math.max(140,(up?above:below)-8);
  if(mh>room){m.style.maxHeight=room+'px';mh=room}
  if(up){m.classList.add('up');m.style.top=(r.top-mh-8)+'px'}else m.style.top=(r.bottom+8)+'px';
  btn.setAttribute('aria-expanded','true');openMenuFor=btn;
  requestAnimationFrame(()=>m.classList.remove('hide'));
  m.querySelector('[aria-selected="true"]')?.focus({preventScroll:true});
}
function closeMenu(){
  const m=$('#menuLayer .menu');if(!m)return;
  openMenuFor?.setAttribute('aria-expanded','false');openMenuFor=null;
  m.classList.add('hide');setTimeout(()=>m.remove(),220);
}
function pickOption(v){
  const btn=openMenuFor;if(!btn)return;
  const opts=JSON.parse(btn.dataset.sel);
  const inp=btn.parentElement.querySelector('input');inp.value=v;if(inp.name.startsWith('set_'))setTimeout(()=>applySet(inp.name.slice(4),v),0);
  btn.querySelector('span').textContent=(opts.find(o=>o[0]===v)||[v,v])[1];
  closeMenu();btn.focus({preventScroll:true});
}
document.addEventListener('scroll',e=>{if(!e.target.closest||!e.target.closest('.menu'))closeMenu()},true);

/* ---------- forms ---------- */
function defVal(k,type){
  if(k==='date'&&['food','weight','workout','injury','meeting','focus'].includes(type))return today();
  if(k==='stage')return'Applied';
  if(k==='date'&&type==='job')return today();
  if(k==='meal'){const h=new Date().getHours();return h<11?'Breakfast':h<15?'Lunch':h<21?'Dinner':'Snack'}
  if(k==='days')return[];
  if(k==='folder')return state.folder||'';
  return'';
}
function field([k,lbl,kind],v){
  if(kind==='look')return lookField(v||{});
  const id=`f_${k}`,req=(k==='title'||k==='value'||(k==='notes'&&lbl==='Anything'))?' required':'';
  if(kind==='days')return`<fieldset class="fld"><legend>${lbl}</legend><div class="days">${DAYS.map(d=>`<label class="daychip"><input type="checkbox" name="days" value="${d}" ${(v||[]).includes(d)?'checked':''}><span>${d.slice(0,2)}</span></label>`).join('')}</div></fieldset>`;
  let input;
  if(kind==='area')input=`<textarea id="${esc(id)}" name="${k}" rows="3"${req}>${esc(v)}</textarea>`;
  else if(kind.startsWith('select:'))input=selectHTML(k,kind.slice(7).split(','),v,id);
  else if(kind==='folder')input=selectHTML(k,[['','No folder'],...of('folder').map(f=>[f.id,f.title])],v||'',id);
  else if(kind==='number')input=`<input id="${esc(id)}" name="${k}" type="number" inputmode="decimal" step="any" value="${esc(v)}"${req}>`;
  else input=`<input id="${esc(id)}" name="${k}" type="${kind}" value="${esc(v)}"${req} autocomplete="off">`;
  return`<label class="fld" for="${esc(id)}"><span>${lbl}</span>${input}</label>`;
}
function openForm(type,id){
  const e=id?find(id):null,t=TYPES[type];
  openSheet(`<form id="entryForm" data-type="${type}" data-id="${esc(id||'')}">
    ${sheetHead(`${e?'Edit':'New'} <em>${t.label.toLowerCase()}</em>`,e&&type!=='folder'?`open:${id}`:'')}
    ${t.f.map(f=>field(f,f[2]==='look'?{type,icon:e?e.icon:'',color:e?e.color:''}:e?e[f[0]]:defVal(f[0],type))).join('')}
    <div class="sh-actions">${e?`<button type="button" class="danger" id="delBtn">Delete</button>`:''}<button class="primary" type="submit">Save</button></div></form>`);
}
/* detail view: everything about one entry, with edit / done */
function openDetail(id){
  const e=find(id);if(!e)return;
  const t=TYPES[e.type],rows=[];
  for(const[k,lbl,kind]of t.f){
    if(k==='title'||k==='notes'||k==='pain'||kind==='look'||(k==='repeat'&&e[k]==='Never'))continue;
    let v=e[k];if(v===''||v==null||(Array.isArray(v)&&!v.length))continue;
    if(kind==='date')v=fmtLong(v);else if(kind==='time')v=fmtT(v);else if(kind==='days')v=v.join(', ');else if(kind==='folder')v=find(v)?.title||'';else if(kind==='project')v=projLabel(e)||'';
    if(v!=='')rows.push([lbl.replace(/ \(.*\)/,''),v+(k==='kcal'?' kcal':k==='protein'?' g':k==='minutes'?' min':k==='value'?' lb':'')]);
  }
  if(e.type==='task'||e.type==='reminder')rows.push(['Status',e.done?'Done':'Open']);
  const pain=e.type==='injury'?`<div class="lookset"><span class="cap">Pain · ${Math.round(num(e.pain))}/10</span>${painBar(e.pain,true)}</div>`:'';
  const notes=t.f.some(f=>f[0]==='notes')?`<div class="cap" style="margin-bottom:8px">${e.type==='scrap'?'Text':'Notes'}</div><div class="notes${e.notes?'':' none'}">${e.notes?esc(e.notes):'No notes yet. Tap Edit to add some.'}</div>`:'';
  openSheet(`<div class="sh-h"><div class="lhs"><span class="cap">${esc(t.label)}</span></div><button type="button" class="x" data-close aria-label="Close">${ic('close')}</button></div>
    <div class="dhead">${tileE(e)}<div style="min-width:0"><h3>${esc(titleOf(e))}</h3>${subOf(e)?`<div class="rs" style="white-space:normal;margin-top:4px">${esc(subOf(e))}</div>`:''}</div></div>
    ${pain}
    ${rows.length?`<ul class="kv">${rows.map(([l,v])=>`<li><span class="cap">${esc(l)}</span><b>${esc(v)}</b></li>`).join('')}</ul>`:''}
    ${notes}
    <div class="sh-actions">${e.type==='task'&&!e.done?`<button class="secondary" data-focus="${esc(e.id)}">${ic('today')}Focus</button>`:''}${(e.type==='task'||e.type==='reminder')?`<button class="secondary" data-chkd="${esc(e.id)}">${e.done?'Reopen':'Mark done'}</button>`:''}<button class="primary" data-edit="${esc(e.id)}">${ic('edit')}Edit</button></div>`);
}
function openAdd(){
  const t=TABS[state.tab];
  if(t.subs&&TYPES[state.sub[state.tab]]||state.sub[state.tab]==='workout')return state.sub[state.tab]==='workout'?openWorkoutStart():openForm(state.sub[state.tab]);
  const btn=k=>`<button class="tilt" data-add="${k}">${tile(k)}${TYPES[k].label}</button>`;
  const rest=ADDABLE.filter(k=>!t.add.includes(k));
  openSheet(`${sheetHead('Add <em>anything</em>')}
    <div class="typegrid">${t.add.map(btn).join('')}<div class="lbl cap">Everything else</div>${rest.map(btn).join('')}</div>`);
}
function openSearch(){
  openSheet(`${sheetHead('<em>Search</em>')}
    <label class="fld" for="q"><span>Search everything</span><input id="q" type="search" autocomplete="off" placeholder="back, chicken, problem set"></label><div id="results"><p class="hint">Searches every class, task, food, note and injury.</p></div>`);
  const q=$('#q');setTimeout(()=>q.focus({preventScroll:true}),500);
  /* only real text fields are searched (String(object) would make "object" match everything), and only after a short pause in typing */
  const txt=v=>typeof v==='string'?v:Array.isArray(v)?v.filter(x=>typeof x==='string').join(' '):'';
  const SKIP=new Set(['id','folder','type','u','created','date','due','sample','src']);
  let qT=0;q.addEventListener('input',()=>{clearTimeout(qT);qT=setTimeout(()=>{
    const r=$('#results');if(!r)return;const s=q.value.trim().toLowerCase();
    if(!s){r.innerHTML='<p class="hint">Searches every class, task, food, note and injury.</p>';return}
    const hits=db.entries.filter(e=>e.type!=='folder'&&Object.entries(e).some(([k,v])=>!SKIP.has(k)&&txt(v).toLowerCase().includes(s))).slice(0,50);
    r.innerHTML=list(hits,'No matches.');
  },150)});
}

/* ---------- settings + live appearance editor ---------- */
const APP_VER='227';
const ACCENTS=['#D9552E','#2F6BFF','#1FA45A','#8B4CF0','#E0336B','#2A2A2A'];
const HEROS=['#4E6A5A','#2C3A5A','#5A3A2E','#1E1E1E','#6A4FC4','#0F6E73'];
function applyLook(){
  DATA_VER++;const g=db.settings,r=document.documentElement;
  if(g.theme==='light'||g.theme==='dark')r.dataset.theme=g.theme;else r.removeAttribute('data-theme');
  try{if(!LOCKED_BLOB){localStorage.setItem('lifeTheme',g.theme||'');localStorage.setItem('lifeAccent',g.accent||'')}}catch(e){}
  g.accent?r.style.setProperty('--accent',g.accent):r.style.removeProperty('--accent');
  if(g.hero){r.style.setProperty('--sage',g.hero);r.style.setProperty('--sage-soft',`color-mix(in srgb,${g.hero} 72%,#fff)`)}else{r.style.removeProperty('--sage');r.style.removeProperty('--sage-soft')}
  r.dataset.head=g.head;r.dataset.corners=g.corners;r.dataset.icons=g.icons;r.dataset.motion=g.motion?'on':'off';
  r.style.setProperty('--glass-blur',g.glass);
  r.style.setProperty('--glass-tint',Math.round(92-g.glass*.9));
  requestAnimationFrame(()=>moveInd(true));
  if(typeof drawBgCurve==='function')requestAnimationFrame(drawBgCurve);
}
function lookPanel(){
  const g=db.settings;
  const sw=(list,key,cur)=>list.map(c=>`<button class="sw" style="--c:${c}" data-look="${key}" data-val="${c}" aria-label="Colour ${c}" aria-pressed="${(cur||list[0]).toLowerCase()===c.toLowerCase()}">${ic('check')}</button>`).join('')
    +`<label class="sw" style="--c:conic-gradient(#f55,#fd5,#5e5,#5df,#55f,#f5f,#f55)" aria-label="Pick any colour"><input type="color" data-look="${key}" value="${cur||list[0]}"></label>`;
  const seg=(key,opts,cur)=>`<div class="seg2">${opts.map(([v,l])=>`<button data-look="${key}" data-val="${v}" aria-pressed="${cur===v}">${l}</button>`).join('')}</div>`;
  return`${sheetHead('Look &amp; <em>feel</em>','settings')}
    <p class="hint">Changes apply instantly behind this panel.</p>
    <div class="lookset"><span class="cap">Accent colour</span><div class="swatches">${sw(ACCENTS,'accent',g.accent)}</div></div>
    <div class="lookset"><span class="cap">Big card colour</span><div class="swatches">${sw(HEROS,'hero',g.hero)}</div></div>
    <div class="lookset"><span class="cap">Theme</span>${seg('theme',[['system','Auto'],['light','Light'],['dark','Dark']],g.theme)}</div>
    <div class="lookset"><span class="cap">Animations</span>${seg('motion',[['1','On'],['0','Off']],g.motion?'1':'0')}</div>
    <div class="lookset"><span class="cap">Opening animation</span><button class="link" data-introplay style="margin-top:8px">Play it now</button></div>
    <div class="lookset"><span class="cap">Tick sound when you finish a task</span><div class="seg2"><button data-snd="1" aria-pressed="${!!g.sound}">On</button><button data-snd="0" aria-pressed="${!g.sound}">Off</button></div></div>
    <div class="sh-actions"><button class="secondary" data-look="reset">Reset to default</button></div>`;
}
function setLook(key,val){
  const g=db.settings;
  if(key==='reset')['theme','accent','hero','head','corners','glass','icons','motion'].forEach(k=>g[k]=DEF[k]);
  else if(key==='motion')g.motion=val==='1';
  else if(key==='glass')g.glass=Number(val);
  else g[key]=val;
  save();applyLook();
}
function navrow(panel,icon,title,sub){return`<button class="navrow" data-panel="${panel}">${tile(icon)}<span class="t">${title}<small>${sub}</small></span>${ic('chev','i chev')}</button>`}
function openSettings(){
  const g=db.settings,pf=prof(),hid=(g.todayHide||[]).length;
  openSheet(`${sheetHead('<em>Settings</em>')}
    <div class="set-grp">You</div>
    ${navrow('profile','weight','Profile',esc([pf.name,pf.school,pf.major].filter(Boolean).join(' · ')))}
    ${navrow('goals','food','Goals',`${fmtN(num(g.kcal))} kcal · ${num(g.protein)} g protein · ${num(g.active)} active min`)}
    <div class="set-grp">App</div>
    ${navrow('home','task','Home screen',`Opens on ${TABS[g.startTab||'today'].title} · ${TODAY_SECS.length-hid} of ${TODAY_SECS.length} sections shown`)}
    ${navrow('sched','class','Schedule',`${({day:'Day',week:'Week',month:'Month'})[g.calView||'day']} view · day starts ${fmtT(pad(g.dayStart||9)+':00')} · ${g.clock24?'24':'12'}-hour clock`)}
    ${navrow('look','idea','Look &amp; feel','Colours, theme, fonts, animations, sounds')}
    ${navrow('conn','ext','Connections',syncOn()?'Server on · notifications, calendars, mail, health, widget':'Notifications, calendars, email, Fitbit, widget')}
    <div class="set-grp">Data &amp; privacy</div>
    ${navrow('security','injury','Passcode &amp; privacy',LOCK.key?'Passcode on · data encrypted':'Passcode off')}
    ${navrow('backup','note','Backup &amp; restore','Copy or restore everything as text')}
    ${navrow('data','scrap','Storage &amp; data',`${db.entries.filter(e=>e.type!=='folder').length} entries · ${lib().length} saved foods`)}
    ${navrow('about','meeting','About Life',`Version ${APP_VER} · data sources, updates`)}`);
}
function openProfile(){
  const pf=prof(),ws=weights(),last=ws[ws.length-1],hIn=num(pf.heightIn);
  let age='—';if(pf.birthday){const b=new Date(pf.birthday+'T00:00'),n=new Date();let a=n.getFullYear()-b.getFullYear();if(n<new Date(n.getFullYear(),b.getMonth(),b.getDate()))a--;if(a>=0&&a<130)age=a}
  /* BMI = 703 × weight(lb) ÷ height(in)² */
  const bmi=last&&hIn>0?(703*num(last.value)/(hIn*hIn)).toFixed(1):'—';
  const ft=hIn?Math.floor(hIn/12):'',inch=hIn?+(hIn%12).toFixed(1):'';
  openSheet(`${sheetHead('Your <em>profile</em>',lastTrigger&&lastTrigger.id==='avBtn'?'':'settings')}
    <div class="phead"><span class="av" aria-hidden="true">${esc(myInitials())}</span><div style="min-width:0"><h3>${esc(pf.name)}</h3><div class="hint" style="margin:2px 0 0">${esc([pf.year,pf.major,pf.school].filter(Boolean).join(' · ')||'Add your details below')}</div></div></div>
    <div class="pstats"><div><span class="cap">Age</span><b class="num">${age}</b></div><div><span class="cap">Weight</span><b class="num">${last?esc(last.value):'—'}</b></div><div><span class="cap">BMI</span><b class="num">${bmi}</b></div></div>
    <label class="fld" for="pName"><span>Name (used in your greeting)</span><input id="pName" value="${esc(pf.name)}" autocomplete="name"></label>
    <label class="fld" for="pBday"><span>Birthday</span><input id="pBday" type="date" value="${esc(pf.birthday||'')}"></label>
    <div class="qa" style="grid-template-columns:repeat(2,minmax(0,1fr))"><label class="fld" for="pFt"><span>Height ft</span><input id="pFt" type="number" inputmode="numeric" value="${ft}"></label><label class="fld" for="pIn"><span>Height in</span><input id="pIn" type="number" inputmode="decimal" step="any" value="${inch}"></label></div>
    <label class="fld" for="pSchool"><span>School</span><input id="pSchool" value="${esc(pf.school||'')}" placeholder="e.g. Virginia Tech"></label>
    <label class="fld" for="pMajor"><span>Program</span><input id="pMajor" value="${esc(pf.major||'')}" placeholder="e.g. Industrial &amp; Systems Engineering"></label>
    <label class="fld" for="pYear"><span>Year</span>${selectHTML('pyear',[['','Not set'],'Freshman','Sophomore','Junior','Senior','Graduate','Working'],pf.year||'','pYear')}</label>
    <label class="fld" for="pEmail"><span>Email</span><input id="pEmail" type="email" value="${esc(pf.email||'')}" autocomplete="email"></label>
    <label class="fld" for="pBio"><span>About me / notes</span><textarea id="pBio" rows="3">${esc(pf.bio||'')}</textarea></label>
    <p class="small">Stays on this phone only, like everything else in Life.</p>
    <div class="sh-actions"><button class="primary" id="saveProfile">Save profile</button></div>`);
}
const trow=(attr,on,label,sub)=>`<button class="trow" ${attr} aria-pressed="${on}"><span>${label}${sub?`<small>${sub}</small>`:''}</span><i class="sw2" aria-hidden="true"></i></button>`;
function openHome(){
  const g=db.settings,H=new Set(g.todayHide||[]);
  openSheet(`${sheetHead('Home <em>screen</em>','settings')}
    <label class="fld" for="sStart"><span>Open the app on</span>${selectHTML('set_startTab',Object.keys(TABS).map(k=>[k,TABS[k].title]),g.startTab||'today','sStart')}</label>
    <div class="cap" style="margin:6px 0 2px">Sections on Today</div>
    ${TODAY_SECS.map(([k,l,sub])=>trow(`data-thide="${k}"`,!H.has(k),l,sub)).join('')}`);
}
function openSched(){
  const g=db.settings,v=g.calView||'day',seg=(k,opts,cur)=>`<div class="seg2">${opts.map(([val,l])=>`<button data-setk="${k}" data-val="${val}" aria-pressed="${String(cur)===String(val)}">${l}</button>`).join('')}</div>`;
  openSheet(`${sheetHead('<em>Schedule</em>','settings')}
    <div class="lookset"><span class="cap">Default view</span>${seg('calView',[['day','Day'],['week','Week'],['month','Month']],v)}</div>
    <label class="fld" for="sDay"><span>Day view scrolls to</span>${selectHTML('set_dayStart',[5,6,7,8,9,10,11,12].map(h=>[String(h),fmtT(pad(h)+':00')]),String(g.dayStart||9),'sDay')}</label>
    <div class="lookset"><span class="cap">Clock</span>${seg('clock24',[['0','12-hour'],['1','24-hour']],g.clock24?'1':'0')}</div>
    <div class="cap" style="margin:6px 0 2px">Show on the calendar</div>
    ${[['class','Classes'],['meeting','Meetings'],['due','Tasks &amp; reminders due']].map(([k,l])=>trow(`data-calf2="${k}"`,!!calF()[k],l,'')).join('')}`);
}
function openData(){
  const by={};db.entries.forEach(e=>{if(e.type!=='folder')by[e.type]=(by[e.type]||0)+1});
  const hasSample=db.entries.some(e=>e.sample);let bytes=0;try{bytes=(localStorage.getItem(KEY)||'').length}catch(e){}
  openSheet(`${sheetHead('Storage &amp; <em>data</em>','settings')}
    <p class="hint">Everything is stored on this phone${LOCK.key?', encrypted with your passcode':''}. About ${bytes>1e6?(bytes/1e6).toFixed(1)+' MB':Math.max(1,Math.round(bytes/1e3))+' KB'} used.</p>
    <div class="countgrid">${Object.keys(TYPES).filter(k=>k!=='folder').map(k=>`<div>${esc(TYPES[k].label)}<b class="num">${by[k]||0}</b></div>`).join('')}<div>Saved foods<b class="num">${lib().length}</b></div></div>
    ${hasSample?`<div class="sh-actions"><button class="secondary" id="clearSamples2" style="flex:1">Remove example entries</button></div>`:''}
    <div class="sh-actions"><button class="danger" id="wipeAll" style="flex:1">Delete all my data</button></div>
    <p class="small">Deletes every entry, saved food, workout template and your profile. Settings and passcode stay. Make a backup first; this can’t be undone.</p>`);
}
function openAbout(){
  openSheet(`${sheetHead('About <em>Life</em>','settings')}
    <div class="about"><p><b>Life</b> · version ${APP_VER}. Your classes, work, food, health and ideas in one place.</p>
    <p><b>Updates</b> install by themselves. If something looks old, swipe the app away and open it again.</p>
    <p><b>Privacy.</b> No account and no server. Your data never leaves this phone unless you copy a backup.</p>
    <p><b>Food data.</b> 75,000 built-in foods: USDA FoodData Central (SR Legacy, FNDDS, Foundation; public domain), IFCT 2017 India, tempo-food-db by TempoLife (CC-BY-4.0), <a href="https://www.opennutrition.app" target="_blank" rel="noopener">OpenNutrition</a> (ODbL 1.0) and © Open Food Facts contributors (ODbL). The food list is shared under the ODbL. Online search adds USDA branded foods and Open Food Facts.</p>
    <p><a href="https://github.com/IshirJ/life">Source on GitHub</a></p></div>`);
}
function openGoals(){
  const g=db.settings;
  openSheet(`${sheetHead('<em>Goals</em>','settings')}
    <div class="cap" style="margin:0 0 10px">Nutrition · per day</div>
    <label class="fld" for="sKcal"><span>Calories (kcal)</span><input id="sKcal" type="number" inputmode="numeric" value="${num(g.kcal)}"></label>
    <div class="qa"><label class="fld" for="sProt"><span>Protein g</span><input id="sProt" type="number" inputmode="numeric" value="${num(g.protein)}"></label><label class="fld" for="sFat"><span>Fat g</span><input id="sFat" type="number" inputmode="numeric" value="${num(g.fat)}"></label><label class="fld" for="sCarb"><span>Carbs g</span><input id="sCarb" type="number" inputmode="numeric" value="${num(g.carbs)}"></label></div>
    <div class="lookset"><span class="cap">Calorie target</span><div class="seg2"><button data-adapt="0" aria-pressed="${!g.adaptive}">Fixed</button><button data-adapt="1" aria-pressed="${!!g.adaptive}">Adaptive</button></div></div>
    <label class="fld" for="sRate"><span>Goal rate (adaptive)</span>${selectHTML('grate',[['-1.5','Lose 1.5 lb/week'],['-1','Lose 1 lb/week'],['-0.5','Lose 0.5 lb/week'],['0','Maintain'],['0.25','Gain 0.25 lb/week'],['0.5','Gain 0.5 lb/week']],String(g.goalRate||0),'sRate')}</label>
    <p class="small" style="margin-top:-6px">Adaptive works out what you burn from your trend weight and food log, then sets your calories each week. It needs about 10 fully logged days first.</p>
    <div class="cap" style="margin:8px 0 10px">Fitness</div>
    <label class="fld" for="sAct"><span>Active minutes per week</span><input id="sAct" type="number" inputmode="numeric" value="${num(g.active)}"></label>
    <label class="fld" for="sGoal"><span>Goal weight (lb, optional)</span><input id="sGoal" type="number" inputmode="decimal" step="any" value="${esc(g.goalWeight)}" placeholder="e.g. 165"></label>
    <div class="sh-actions"><button class="primary" id="saveGoals">Save goals</button></div>`);
}
function openBackup(){
  openSheet(`${sheetHead('Backup &amp; <em>restore</em>','settings')}
    <p class="hint">Your data lives only on this phone. Copy the backup and keep it somewhere safe, such as a note.</p>
    <label class="fld" for="exp"><span>Backup text · ${db.entries.length} entries</span><textarea id="exp" readonly rows="3">${esc(JSON.stringify(db))}</textarea></label>
    <div class="sh-actions"><button class="primary" id="copyExp">Copy backup</button></div>
    <label class="fld" for="imp" style="margin-top:22px"><span>Paste a backup to restore</span><textarea id="imp" rows="3"></textarea></label>
    <div class="sh-actions"><button class="danger" id="doImp" style="flex:1">Replace my data with this backup</button></div>`);
}
function applySet(k,v){
  if(k.startsWith('n_')){const n=NS();n[k.slice(2)]=v;SYNC.notif=n;saveSync();pushSchedule(true);return}
  const g=db.settings;
  if(k==='clock24')g.clock24=v==='1';else if(k==='dayStart')g.dayStart=Number(v);else g[k]=v;
  save();render(false);
}
function arm(btn,label,fn){
  if(btn.dataset.armed){fn();return}
  const old=btn.innerHTML;btn.dataset.armed='1';btn.textContent=label;
  setTimeout(()=>{if(btn.isConnected){delete btn.dataset.armed;btn.innerHTML=old}},3000);
}
function clearSamples(){db.entries=db.entries.filter(e=>!e.sample);state.folder=null;save();render(true);toast('Examples removed')}

/* ---------- drag cards into folders (press and hold, then drag) ---------- */
const drag={timer:null,id:null,ghost:null,src:null,sx:0,sy:0,ox:0,oy:0,active:false,suppress:false,target:null};
document.addEventListener('pointerdown',e=>{
  const card=e.target.closest('[data-drag]');if(!card||e.button>0)return;
  drag.src=card;drag.id=card.dataset.drag;drag.sx=e.clientX;drag.sy=e.clientY;
  clearTimeout(drag.timer);
  drag.timer=setTimeout(()=>startDrag(drag.sx,drag.sy),340);
});
function startDrag(x,y){
  drag.timer=null;
  const r=drag.src.getBoundingClientRect();
  drag.ox=x-r.left;drag.oy=y-r.top;drag.active=true;
  const g=drag.src.cloneNode(true);g.className='card card-s ghost';g.removeAttribute('data-drag');g.removeAttribute('data-open');
  g.style.width=r.width+'px';g.style.height=r.height+'px';g.style.left=r.left+'px';g.style.top=r.top+'px';
  g.style.transition='transform .25s cubic-bezier(.34,1.56,.64,1)';
  document.body.appendChild(g);drag.ghost=g;drag.src.classList.add('lifting');
  requestAnimationFrame(()=>g.style.transform='scale(1.06) rotate(-1.5deg)');
  if(navigator.vibrate)navigator.vibrate(12);
}
document.addEventListener('pointermove',e=>{
  if(drag.timer&&!drag.active&&Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>8){clearTimeout(drag.timer);drag.timer=null}
  if(!drag.active)return;
  drag.ghost.style.left=(e.clientX-drag.ox)+'px';drag.ghost.style.top=(e.clientY-drag.oy)+'px';
  drag.ghost.style.display='none';const under=document.elementFromPoint(e.clientX,e.clientY);drag.ghost.style.display='';
  const f=under&&under.closest('.folder[data-drop]');
  if(f!==drag.target){drag.target?.classList.remove('target');drag.target=f;f?.classList.add('target');if(f&&navigator.vibrate)navigator.vibrate(6)}
  const strip=$('.folders');if(strip){const sr=strip.getBoundingClientRect();if(e.clientY>sr.top-40&&e.clientY<sr.bottom+40){if(e.clientX<60)strip.scrollLeft-=8;else if(e.clientX>innerWidth-60)strip.scrollLeft+=8}}
});
document.addEventListener('touchmove',e=>{if(drag.active)e.preventDefault()},{passive:false});
function endDrag(){
  clearTimeout(drag.timer);drag.timer=null;
  if(!drag.active)return;
  drag.active=false;drag.suppress=true;setTimeout(()=>drag.suppress=false,60);
  const g=drag.ghost,src=drag.src,target=drag.target,item=find(drag.id);
  target?.classList.remove('target');drag.target=null;
  if(target&&item){
    const fid=target.dataset.drop||'';const tr=target.getBoundingClientRect();
    g.style.transition='left .35s cubic-bezier(.22,1,.36,1),top .35s cubic-bezier(.22,1,.36,1),transform .35s cubic-bezier(.22,1,.36,1),opacity .35s';
    g.style.left=(tr.left+tr.width/2-g.offsetWidth/2)+'px';g.style.top=(tr.top+tr.height/2-g.offsetHeight/2)+'px';g.style.transform='scale(.15)';g.style.opacity='0';
    target.classList.add('bump');
    const changed=(item.folder||'')!==fid;
    item.folder=fid;delete item.sample;save();
    setTimeout(()=>{g.remove();render(false);
      if(changed){const f=find(fid);toast(f?`Moved to ${f.title}`:'Removed from folder');tick()}
      $(`.folder[data-drop="${esc(fid)}"]`)?.classList.add('bump')},360);
  }else{
    const r=src.getBoundingClientRect();
    g.style.transition='left .4s cubic-bezier(.22,1,.36,1),top .4s cubic-bezier(.22,1,.36,1),transform .4s cubic-bezier(.22,1,.36,1)';
    g.style.left=r.left+'px';g.style.top=r.top+'px';g.style.transform='none';
    setTimeout(()=>{g.remove();src.classList.remove('lifting')},400);
  }
}
document.addEventListener('pointerup',endDrag);document.addEventListener('pointercancel',endDrag);
document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('[data-drag]'))e.preventDefault()});

/* ---------- tilt + glare inside openers ---------- */
document.addEventListener('pointermove',e=>{
  const t=e.target.closest&&e.target.closest('.tilt');
  $$('.tilt.live').forEach(x=>{if(x!==t){x.classList.remove('live');x.style.removeProperty('--rx');x.style.removeProperty('--ry')}});
  if(!t||noMotion())return;
  const r=t.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
  t.classList.add('live');
  t.style.setProperty('--ry',((px-.5)*14).toFixed(2)+'deg');t.style.setProperty('--rx',((.5-py)*14).toFixed(2)+'deg');
  t.style.setProperty('--gx',(px*100).toFixed(1)+'%');t.style.setProperty('--gy',(py*100).toFixed(1)+'%');
},{passive:true});
['pointerup','pointercancel','pointerleave'].forEach(n=>document.addEventListener(n,()=>$$('.tilt.live').forEach(x=>{x.classList.remove('live');x.style.removeProperty('--rx');x.style.removeProperty('--ry')}),true));

/* ---------- events ---------- */
document.addEventListener('click',ev=>{
  if(drag.suppress){ev.preventDefault();ev.stopPropagation();return}
  const opt=ev.target.closest('[data-opt]');if(opt){pickOption(opt.dataset.opt);return}
  const selb=ev.target.closest('[data-sel]');if(selb){openMenuFor===selb?closeMenu():openMenu(selb);return}
  if(openMenuFor&&!ev.target.closest('.menu'))closeMenu();
  const el=ev.target.closest('[data-adapt],[data-setk],[data-thide],[data-calf2],[data-calview],[data-calf],[data-calnav],[data-open],[data-wday],[data-tab],[data-sub],[data-chk],[data-chkd],[data-open],[data-edit],[data-add],[data-close],[data-goto],[data-day],[data-heat],[data-range],[data-folder],[data-folder-edit],[data-panel],[data-back],[data-look],[data-snd],button');
  if(!el)return;
  if(!el.closest('.sheet'))lastTrigger=el;
  const d=el.dataset;
  if(d.look!==undefined&&el.tagName==='BUTTON'){const k=d.look;setLook(k,d.val);
    if(k==='reset'){openSheet(lookPanel());return}
    el.parentElement.querySelectorAll('[data-look]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));return}
  if(d.setk){applySet(d.setk,d.val);el.parentElement.querySelectorAll('[data-setk]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));return}
  if(d.thide){const H=new Set(db.settings.todayHide||[]);H.has(d.thide)?H.delete(d.thide):H.add(d.thide);db.settings.todayHide=[...H];save();el.setAttribute('aria-pressed',String(!H.has(d.thide)));if(state.tab==='today')render(false);return}
  if(d.calf2){const f=calF();f[d.calf2]=!f[d.calf2];db.settings.calF=f;save();el.setAttribute('aria-pressed',String(f[d.calf2]));if(state.tab==='plan')render(false);return}
  if(d.adapt!==undefined){el.parentElement.querySelectorAll('[data-adapt]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));return}
  if(d.snd){db.settings.sound=d.snd==='1';save();el.parentElement.querySelectorAll('[data-snd]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));if(db.settings.sound)tick();return}
  if(d.panel){NAV_DIR=1;const P={look:()=>openSheet(lookPanel()),security:openSecurity,backup:openBackup,goals:openGoals,profile:openProfile,home:openHome,sched:openSched,data:openData,about:openAbout,conn:openConn,notif:openNotif,cals:openCals,mail:openMail,health:openHealthConn,widget:openWidget,food:openFoodConn};(P[d.panel]||openBackup)();return}
  if(d.back){NAV_DIR=-1;if(d.back==='settings')openSettings();else if(d.back==='conn')openConn();else if(d.back.startsWith('open:'))openDetail(d.back.slice(5));return}
  if(d.tab){if(state.tab===d.tab){SC.scrollTo({top:0,behavior:'smooth'});return}const ks=Object.keys(TABS),dir=Math.sign(ks.indexOf(d.tab)-ks.indexOf(state.tab));state.tab=d.tab;if(d.tab!=='mind')state.folder=null;SC.scrollTop=0;render(true,false,dir);return}
  if(d.goto){if(d.goto==='settings'){openSettings();return}const[t,s]=d.goto.split(':');state.tab=t;if(s)state.sub[t]=s;SC.scrollTop=0;render(true);return}
  if(d.calview){db.settings.calView=d.calview;save();el.parentElement.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));refreshCal(0);return}
  if(d.calf){const f=calF();f[d.calf]=!f[d.calf];db.settings.calF=f;save();el.setAttribute('aria-pressed',String(f[d.calf]));refreshCal(0);return}
  if(d.calnav){const n=Number(d.calnav),v=calView(),a=anchor();
    if(v==='day')state.wsel=shiftDays(a,n);else if(v==='week')state.wsel=shiftDays(a,7*n);
    else{const x=new Date(a+'T00:00');const day=x.getDate();x.setDate(1);x.setMonth(x.getMonth()+n);const last=new Date(x.getFullYear(),x.getMonth()+1,0).getDate();x.setDate(Math.min(day,last));state.wsel=iso(x)}
    refreshCal(n);return}
  if(d.wday&&!ev.target.closest('.blk')){const prev=anchor();state.wsel=d.wday;
    if(calView()==='month'&&d.wday.slice(0,7)!==prev.slice(0,7)){refreshCal(d.wday>prev?1:-1);return}
    $$('.wd,.mc').forEach(b=>{const on=b.dataset.wday===d.wday;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on))});
    $$('.wcol[data-wday]').forEach(c=>c.classList.toggle('on',c.dataset.wday===d.wday));
    const pane=$('#dayPane');pane.innerHTML=dayPane();[...pane.querySelectorAll('.tli,.sec-h,.list,.empty')].forEach((x,i)=>anim(x,{y:[10,0],opacity:[.001,1]},{duration:.38,delay:i*.03}));return}
  if(d.day!==undefined){state.day=Number(d.day);
    $$('.day').forEach((b,i)=>{b.classList.toggle('on',i===state.day);b.setAttribute('aria-pressed',String(i===state.day))});
    const pane=$('#dayPane');pane.innerHTML=dayPane();
    [...pane.querySelectorAll('.tli,.sec-h,.list,.empty')].forEach((x,i)=>anim(x,{x:[24,0],opacity:[.001,1]},{duration:.45,delay:i*.04}));
    anim(el,{scale:[.9,1]},{spring:true,k:500,d:18});return}
  if(d.sub){if(state.sub[state.tab]===d.sub&&!state.folder)return;state.sub[state.tab]=d.sub;state.folder=null;render(false);subIn();return}
  if(d.range){state.heatRange=Number(d.range);const id=el.closest('.heat').id.slice(5);
    render(false);const hm=$(`#heat-${id} .hm`);if(hm)rippleHeat(hm);return}
  if(d.heat){showTip(el);return}
  if(d.folder!==undefined){state.folder=d.folder||null;render(false);$$('#cardGrid .card').forEach((c,i)=>anim(c,{y:[16,0],scale:[.96,1],opacity:[.001,1]},{duration:.45,delay:i*.04}));return}
  if(d.folderEdit){openForm('folder',d.folderEdit);return}
  if(d.chk||d.chkd){const id=d.chk||d.chkd,e=find(id);e.done=!e.done;e.doneAt=Date.now();save();
    if(d.chkd){closeSheet();render(false);if(e.done)tick()}
    else if(e.done){tick();el.classList.add('on');anim(el.querySelector('i'),{scale:[.5,1]},{spring:true,k:600,d:14});el.closest('.row')?.classList.add('done');setTimeout(()=>render(false),450)}else render(false);
    if(e.done)toast('Done');return}
  if(d.open){openDetail(d.open);return}
  if(d.edit){const e=find(d.edit);openForm(e.type,e.id);return}
  if(d.add){d.add==='food'?openFoodLog():d.add==='workout'?openWorkoutStart():openForm(d.add);return}
  if('close' in d){closeSheet();return}
  switch(el.id){
    case'fab':state.tab==='health'&&state.sub.health==='food'?openFoodLog():openAdd();break;
    case'searchBtn':openSearch();break;
    case'setBtn':openSettings();break;
    case'avBtn':openProfile();break;
    case'saveProfile':{const ft=num($('#pFt').value),inch=num($('#pIn').value),yr=$('#sheetBody input[name=pyear]');
      db.settings.profile={name:$('#pName').value.trim()||'Ishir Johari',birthday:$('#pBday').value,heightIn:ft||inch?ft*12+inch:'',school:$('#pSchool').value.trim(),major:$('#pMajor').value.trim(),year:yr?yr.value:'',email:$('#pEmail').value.trim(),bio:$('#pBio').value.trim()};
      save();render(false);toast('Profile saved');if($('#sheetBody [data-back]')){NAV_DIR=-1;openSettings()}else openProfile();break}
    case'wipeAll':arm(el,'Tap again to delete everything',()=>{db.entries=[];db.lib=[];db.templates=[];db.settings.profile=null;state.folder=null;save();render(false);toast('All data deleted');NAV_DIR=-1;openSettings()});break;
    case'clearSamples':clearSamples();break;
    case'clearSamples2':arm(el,'Tap again to remove',()=>{clearSamples();closeSheet()});break;
    case'delBtn':arm(el,'Tap again to delete',()=>{const id=$('#entryForm').dataset.id,e=find(id);
      if(e&&e.type==='folder')db.entries.forEach(x=>{if(x.folder===id)x.folder=''});
      if(state.folder===id)state.folder=null;
      db.entries=db.entries.filter(x=>x.id!==id);save();closeSheet();render(false);toast('Deleted')});break;
    case'saveGoals':{const gr=$('#sheetBody input[name=grate]');if(gr)db.settings.goalRate=Number(gr.value);const ad=$('#sheetBody [data-adapt][aria-pressed="true"]');if(ad)db.settings.adaptive=ad.dataset.adapt==='1';}db.settings.kcal=num($('#sKcal').value)||2200;db.settings.protein=num($('#sProt').value)||150;db.settings.active=num($('#sAct').value)||150;db.settings.fat=num($('#sFat').value)||70;db.settings.carbs=num($('#sCarb').value)||250;db.settings.goalWeight=$('#sGoal').value===''?'':num($('#sGoal').value);save();render(false);toast('Goals saved');NAV_DIR=-1;openSettings();break;
    case'copyExp':{const t=$('#exp');const fb=()=>{t.select();toast('Select all and copy')};if(navigator.clipboard)navigator.clipboard.writeText(t.value).then(()=>toast('Backup copied'),fb);else fb();break}
    case'doImp':arm(el,'Tap again to replace everything',()=>{
      try{const d=JSON.parse($('#imp').value);if(!Array.isArray(d.entries))throw 0;
        d.entries=cleanEntries(d.entries.filter(e=>e&&TYPES[e.type]&&e.id));db={entries:d.entries,settings:cleanSettings({...db.settings,...(d.settings||{})})};if(typeof restampAll==='function')restampAll();save();applyLook();closeSheet();render(false);toast(`Restored ${db.entries.length} entries`)}
      catch(e){toast('That is not a valid backup')}});break;
  }
});
document.addEventListener('input',e=>{
  const t=e.target;if(!t.dataset||t.dataset.look===undefined)return;
  setLook(t.dataset.look,t.value);
  if(t.dataset.look==='glass'){$('#glassVal').textContent=t.value;t.style.setProperty('--p',(t.value*2)+'%')}
  else t.closest('.swatches')?.querySelectorAll('[aria-pressed]').forEach(b=>b.setAttribute('aria-pressed','false'));
});
document.addEventListener('submit',ev=>{
  if(ev.target.id!=='entryForm')return;
  ev.preventDefault();
  const f=ev.target,type=f.dataset.type,id=f.dataset.id,fd=new FormData(f),o={};
  for(const[k,,kind]of TYPES[type].f){
    if(kind==='look'){o.icon=fd.get('icon')||'';o.color=fd.get('color')||''}
    else if(kind==='days')o[k]=fd.getAll('days');
    else if(kind==='number'){const v=fd.get(k);o[k]=v===''?'':Number(v)}
    else o[k]=(fd.get(k)||'').trim();
  }
  if(id){const e=find(id);Object.assign(e,o);delete e.sample}
  else db.entries.push({id:uid(),type,created:Date.now(),...o});
  save();render(false);toast('Saved');
  if(id&&type!=='folder')openDetail(id);else closeSheet();
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(openMenuFor)closeMenu();else if(!wrap.hidden)closeSheet()}
  if(openMenuFor&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();const bs=$$('#menuLayer .menu button'),i=bs.indexOf(document.activeElement);bs[(i+(e.key==='ArrowDown'?1:-1)+bs.length)%bs.length]?.focus()}
});

/* boot happens in the second script, after the lock check */
