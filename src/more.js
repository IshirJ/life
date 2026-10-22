
/* ===================== more: quick capture · grades · money · insights · time-blocking · flashcards · trips · follow-ups ===================== */
Object.assign(P,{
  expense:'<rect x="3.5" y="6" width="17" height="12" rx="3"/><path d="M3.5 10h17M7 14.5h3"/>',
  trip:'<path d="M3 13l8-2 4-7 2 1-2 7 5 1v2l-6 .5-3 4.5H9l1.5-4.5L4 15z"/>',
  grades:'<path d="M3 9l9-5 9 5-9 5z"/><path d="M7 11.5V16c3 2 7 2 10 0v-4.5M21 9v5"/>',
  cards:'<rect x="3.5" y="7" width="13" height="13" rx="2.5"/><path d="M8 4h10.5A2.5 2.5 0 0 1 21 6.5V17"/>',
  block:'<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 14h6"/>',
  spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/>',
  bolt:'<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>',person:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>'
});
/* only our own base64 pictures are ever put into an <img> (synced data can't inject markup) */
const safeImg=s=>/^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/.test(String(s||''))?s:'';
const MCATS=[['Food','🍔'],['Groceries','🛒'],['Transport','🚗'],['Shopping','🛍️'],['Bills','🧾'],['Fun','🎉'],['Health','💊'],['Travel','✈️'],['School','🎓'],['Other','•']];
TYPES.expense={label:'Expense',f:[['title','What','text'],['amount','Amount ($)','number'],['cat','Category','select:'+MCATS.map(c=>c[0]).join(',')],['date','Date','date'],['notes','Notes','area']]};
TYPES.trip={label:'Trip',f:[['title','Trip','text'],['place','Where','text'],['date','Leaves','date'],['end','Returns','date'],['notes','Notes','area']]};
ADDABLE.push('expense','trip');
TABS.work.subs.push(['grades','Grades'],['expense','Money']);
TABS.mind.subs.push(['cards','Cards'],['trip','Trips']);
TODAY_SECS.splice(1,0,['quick','Quick add bar','Type “40g protein”, “task email Bansal fri”, “spent 12 coffee”'],['insights','Insights','What lines up with your good days'],['coming','Coming up','Exams, trips and follow-ups']);
const money=n=>(n<0?'−':'')+'$'+Math.abs(num(n)).toLocaleString(undefined,{minimumFractionDigits:Math.abs(n)%1?2:0,maximumFractionDigits:2});
const catEmoji=c=>(MCATS.find(x=>x[0]===c)||MCATS[MCATS.length-1])[1];
const monthKey=d=>d.slice(0,7);
const _subOfM=subOf;subOf=function(e){
  if(e.type==='expense')return[catEmoji(e.cat||'Other')+' '+(e.cat||'Other'),e.date&&dayDiff(e.date)?fmtDate(e.date):''].filter(Boolean).join(' · ');
  if(e.type==='trip')return[e.place,e.date?`${fmtDate(e.date)}${e.end?' – '+fmtDate(e.end):''}`:''].filter(Boolean).join(' · ');
  if(e.type==='task'&&e.block)return[_subOfM(e),`🗓 ${fmtDate(e.block.date)} ${fmtT(e.block.start)}`].filter(Boolean).join(' · ');
  return _subOfM(e)};
const _metaOfM=metaOf;metaOf=function(e){
  if(e.type==='expense')return[money(num(e.amount)),''];
  if(e.type==='trip'){if(!e.date)return['',''];const n=dayDiff(e.date);return[n>0?`in ${n} day${n===1?'':'s'}`:(e.end&&dayDiff(e.end)>=0?'Now':''),n>0&&n<=14?'soon':'plain']}
  return _metaOfM(e)};

/* ======================================================================
   1) QUICK CAPTURE — one line of text becomes the right entry
   ====================================================================== */
const WD=['sun','mon','tue','wed','thu','fri','sat'];
function parseWhen(s){ /* pulls a date / time out of the text: today, tomorrow, fri, next week, in 3 days, 10/25, oct 25, at 5pm */
  let date='',time='',rest=s;
  const take=re=>{const m=rest.match(re);if(m){rest=(rest.slice(0,m.index)+rest.slice(m.index+m[0].length)).replace(/\s{2,}/g,' ').trim()}return m};
  let m;
  if((m=take(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i))){let h=+m[1]%12;if(/pm/i.test(m[3]))h+=12;time=`${pad(h)}:${m[2]||'00'}`}
  else if((m=take(/\bat\s+(\d{1,2}):(\d{2})\b/i)))time=`${pad(+m[1])}:${m[2]}`;
  if(take(/\b(?:by\s+|on\s+|due\s+)?today\b/i))date=today();
  else if(take(/\b(?:by\s+|on\s+|due\s+)?(?:tomorrow|tmrw|tmr)\b/i))date=addDays(1);
  else if(take(/\bnext week\b/i))date=addDays(7);
  else if((m=take(/\bin\s+(\d+)\s+days?\b/i)))date=addDays(+m[1]);
  else if((m=take(/\b(?:by\s+|on\s+|due\s+)?(sun|mon|tue|wed|thu|fri|sat)[a-z]*\b/i))){const t=WD.indexOf(m[1].toLowerCase()),c=new Date().getDay();date=addDays(((t-c+7)%7)||7)}
  else if((m=take(/\b(?:by\s+|on\s+|due\s+)?(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/))){const y=m[3]?(m[3].length===2?'20'+m[3]:m[3]):String(new Date().getFullYear());date=`${y}-${pad(+m[1])}-${pad(+m[2])}`;if(!m[3]&&date<today())date=`${+y+1}-${pad(+m[1])}-${pad(+m[2])}`}
  else if((m=take(/\b(?:by\s+|on\s+|due\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})\b/i))){const mo=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(m[1].toLowerCase())+1,y=new Date().getFullYear();date=`${y}-${pad(mo)}-${pad(+m[2])}`;if(date<today())date=`${y+1}-${pad(mo)}-${pad(+m[2])}`}
  return{date,time,rest:rest.replace(/^[\s:,-]+|[\s:,-]+$/g,'')}}
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;
function parseQuick(raw){
  const s=String(raw||'').trim().replace(/\s+/g,' ');if(!s)return null;const low=s.toLowerCase();let m;
  const mk=(label,fn,kind)=>({label,run:fn,kind});
  /* money: "spent 12 coffee", "$12.50 chipotle", "12 on lunch" */
  if((m=s.match(/^(?:spent|spend|paid|bought)\s+\$?(\d+(?:\.\d{1,2})?)\s*(?:on|for|at)?\s*(.*)$/i))||(m=s.match(/^\$(\d+(?:\.\d{1,2})?)\s*(?:on|for|at)?\s*(.*)$/))||(m=s.match(/^(\d+(?:\.\d{1,2})?)\s+(?:on|for)\s+(.+)$/i))){
    const amt=+m[1],what=cap(m[2]||'Purchase'),cat=autoCat(what);return mk(`${money(amt)} · ${catEmoji(cat)} ${cat} · ${what}`,()=>addEntry({type:'expense',title:what,amount:amt,cat,date:today()}),'expense')}
  /* protein / calories: "40g protein", "protein 40", "chipotle 850 kcal 45p", "shake 300 cal 50g protein" */
  const pM=low.match(/(\d+(?:\.\d+)?)\s*g?\s*(?:of\s+)?protein\b|\bprotein\s+(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*p\b/),kM=low.match(/(\d+(?:\.\d+)?)\s*(?:kcal|cal|calories)\b/);
  if(pM||kM){const p=pM?+(pM[1]||pM[2]||pM[3]):0,k=kM?+kM[1]:Math.round(p*4);
    const name=cap(s.replace(/(\d+(?:\.\d+)?)\s*g?\s*(?:of\s+)?protein\b|\bprotein\s+\d+(?:\.\d+)?|(\d+(?:\.\d+)?)\s*p\b|(\d+(?:\.\d+)?)\s*(?:kcal|cal|calories)\b|^(?:log|ate|had)\s+/gi,'').replace(/\s{2,}/g,' ').trim())||(kM?'Quick add':'Protein');
    return mk(`🍽 ${name} · ${fmtN(k)} kcal${p?` · ${p} g protein`:''}${!kM&&p?' (4 kcal/g)':''}`,()=>addEntry({type:'food',title:name,kcal:k,protein:p,fat:0,carbs:0,meal:mealNow(),date:today()}),'food')}
  /* weight: "weight 172.4", "172.4 lb", "weighed 171" */
  if((m=low.match(/^(?:weight|weigh(?:ed)?|wt)\s*(\d{2,3}(?:\.\d)?)\s*(?:lb|lbs)?$/))||(m=low.match(/^(\d{2,3}(?:\.\d)?)\s*(?:lb|lbs)$/)))return mk(`⚖️ Weigh-in ${m[1]} lb`,()=>addEntry({type:'weight',value:+m[1],date:today()}),'weight');
  /* focus: "focus 50 problem set", "pomodoro", "study 25" */
  if((m=low.match(/^(?:focus|pomodoro|study|deep work)\b\s*(\d+)?\s*(?:m|min|mins|minutes)?\s*(.*)$/))){const min=m[1]?+m[1]:null,label=cap(s.split(/\s+/).slice(m[1]?2:1).join(' ').replace(/^(m|min|mins|minutes)\s*/i,''))||'Focus';
    return mk(`⏱ Start ${min?min+' min ':''}focus${label!=='Focus'?' · '+label:''}`,()=>{if(FOCUS()){toast('A focus session is already running');return null}const p=PS();const cfg=min?{...p,mode:'single',single:min}:p;db.focusNow={id:uid(),started:Date.now(),label,ref:'',mode:cfg.mode,cfg,phase:'focus',round:1,pStart:Date.now(),paused:null,focusMs:0,done:0};save();pushSchedule(true);setTimeout(openFocusRun,250);return null},'focus')}
  /* workout: "workout 45 push day", "ran 30 min" */
  if((m=low.match(/^(?:workout|gym|lift|ran|run|walked|walk|swim|bike|played)\b\s*(\d+)?\s*(?:m|min|mins|minutes)?\s*(.*)$/))&&!/^(?:run|walk)\s+(?:to|the)\b/.test(low)){const min=m[1]?+m[1]:'';const title=cap(m[2]||s.split(' ')[0]);
    return mk(`🏋️ Workout${min?' · '+min+' min':''} · ${title}`,()=>addEntry({type:'workout',title,minutes:min,date:today()}),'workout')}
  /* habits: "water", "creatine" — ticks a habit you track */
  const hb=habits().find(h=>low===h.name.toLowerCase()||low===('+'+h.name.toLowerCase())||low.replace(/^(?:had|took|did)\s+/,'')===h.name.toLowerCase());
  if(hb)return mk(`${hb.icon||'✓'} ${hb.name} +1`,()=>{const L=hlog(),td=today();L[td]=L[td]||{};L[td][hb.id]=Math.min(hb.target,(L[td][hb.id]||0)+1);save();return null},'habit');
  /* reminder: "remind me to call mom at 6pm" */
  if((m=s.match(/^remind(?:\s+me)?(?:\s+to)?\s+(.+)$/i))){const w=parseWhen(m[1]);return mk(`🔔 Reminder · ${cap(w.rest)} · ${w.date?relDue(w.date):'today'}${w.time?' '+fmtT(w.time):''}`,()=>addEntry({type:'reminder',title:cap(w.rest),due:w.date||today(),time:w.time||'09:00'}),'reminder')}
  /* task: "task email Bansal fri", "todo ...", "add task: ..." */
  if((m=s.match(/^(?:add\s+)?(?:task|todo|to-do|to do)\s*:?\s+(.+)$/i))){const w=parseWhen(m[1]),pri=/!$|\burgent\b/i.test(w.rest)?'High':'Normal';const title=cap(w.rest.replace(/!$|\burgent\b/i,'').trim());
    return mk(`☑️ Task · ${title}${w.date?' · due '+relDue(w.date):''}`,()=>addEntry({type:'task',title,due:w.date,priority:pri}),'task')}
  /* ideas / notes / journal */
  if((m=s.match(/^(?:idea|ideas)\s*:?\s+(.+)$/i)))return mk(`💡 Idea · ${m[1]}`,()=>addEntry({type:'idea',title:cap(m[1]).slice(0,120),notes:m[1].length>120?m[1]:''}),'idea');
  if((m=s.match(/^(?:note|journal)\s*:?\s+(.+)$/i)))return mk(`📝 Note · ${m[1].slice(0,60)}`,()=>addEntry({type:'note',title:cap(m[1]).split(/[.!?]/)[0].slice(0,80),notes:m[1]}),'note');
  if(/^https?:\/\//i.test(s))return mk(`🔗 Saved link to Ideas`,()=>addEntry({type:'idea',title:s.replace(/^https?:\/\/(www\.)?/,'').slice(0,90),notes:s,tag:'Link'}),'idea');
  return mk(`📥 Scrap · ${s.slice(0,60)}`,()=>addEntry({type:'scrap',notes:s}),'scrap');
}
function addEntry(o){const e={id:uid(),created:Date.now(),...o};db.entries.push(e);save();return e.id}
function runQuick(text,quiet){const q=parseQuick(text);if(!q)return null;const id=q.run();DATA_VER++;render(false);if(!quiet){tick();toast(`Added: ${q.label.replace(/^\S+\s/,'')}`)}return q}
function quickBar(id='qc'){return`<form class="qbar" data-qform="${esc(id)}" autocomplete="off"><span class="qbi">${ic('bolt')}</span><input id="${esc(id)}" enterkeyhint="done" placeholder="40g protein · task email Bansal fri · spent 12 coffee" aria-label="Quick add"><button type="submit" aria-label="Add">${ic('plus')}</button><div class="qprev" id="${id}Prev"></div></form>`}
document.addEventListener('input',e=>{const f=e.target.closest&&e.target.closest('[data-qform]');if(!f||e.target.tagName!=='INPUT')return;const pv=f.querySelector('.qprev'),q=parseQuick(e.target.value);pv.textContent=q?q.label:'';f.classList.toggle('has',!!q)});
document.addEventListener('submit',e=>{const f=e.target.closest&&e.target.closest('[data-qform]');if(!f)return;e.preventDefault();const inp=f.querySelector('input');if(!inp.value.trim())return;runQuick(inp.value);inp.value='';f.querySelector('.qprev').textContent='';f.classList.remove('has');if(!wrap.hidden&&f.closest('#sheetBody'))closeSheet()},true);
/* the + sheet and search get the bar too */
const _openAddM=openAdd;openAdd=function(){
  const k=TABS[state.tab].subs?state.sub[state.tab]:null;
  if(k==='grades')return openClassGrades(null);if(k==='cards')return openCardForm();if(k==='expense')return openMoneyAdd();
  _openAddM();const b=$('#sheetBody');if(b&&!$('#sheetBody [data-qform]'))b.querySelector('.sh-h')?.insertAdjacentHTML('afterend',quickBar('qcAdd'))};
const _openSearchM=openSearch;openSearch=function(){_openSearchM();const q=$('#q');if(!q)return;const hint=document.createElement('div');hint.id='qLog';$('#results').before(hint);
  q.addEventListener('input',()=>{const p=parseQuick(q.value);hint.innerHTML=p&&p.kind!=='scrap'&&q.value.trim().length>2?`<button class="qlog" id="qLogBtn">${ic('bolt')}<span>Add it<small>${esc(p.label)}</small></span><b>↵</b></button>`:''});
  q.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&$('#qLogBtn')){ev.preventDefault();runQuick(q.value);closeSheet()}})};
document.addEventListener('click',e=>{if(e.target.closest('#qLogBtn')){e.preventDefault();e.stopImmediatePropagation();const q=$('#q');if(q){runQuick(q.value);closeSheet()}}},true);
/* deep links: …/life/#q=40g%20protein */
const _handleHashM=handleHash;handleHash=function(){const h=location.hash;if(typeof isLocked==='function'&&isLocked())return;   /* handled after unlock */
  if(h.startsWith('#q=')){history.replaceState(null,'',APP_URL);const t=decodeURIComponent(h.slice(3).replace(/\+/g,' '));setTimeout(()=>runQuick(t),600);return}return _handleHashM()};
/* things you sent from Siri / the Action button / the share sheet while Life was closed */
let INBOX_BUSY=false;
async function pullInbox(){if(!syncOn()||INBOX_BUSY||(typeof LOCKED_BLOB!=='undefined'&&LOCKED_BLOB))return;INBOX_BUSY=true;
  try{const list=await api('/inbox');if(!Array.isArray(list)||!list.length)return;const done=[];const labels=[];
    for(const it of list){if(SYNCST.seenInbox&&SYNCST.seenInbox.has(it.id))continue;const q=parseQuick(it.text);if(q){q.run();labels.push(q.label)}done.push(it.id);(SYNCST.seenInbox=SYNCST.seenInbox||new Set()).add(it.id)}
    if(done.length){await api('/inbox',{method:'DELETE',body:JSON.stringify({ids:done})});DATA_VER++;render(false);tick();toast(labels.length===1?`From Shortcuts: ${labels[0]}`:`${labels.length} things added from Shortcuts`)}
  }catch(e){}finally{INBOX_BUSY=false}}
afterSplash(()=>setTimeout(pullInbox,1500));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(pullInbox,700)});
setInterval(()=>{if(!document.hidden)pullInbox()},45000);
function openQuickSetup(){
  const url=(SYNC.url||'https://life-sync.YOURNAME.workers.dev').replace(/\/+$/,'')+'/inbox';
  NAV_DIR=1;openSheet(`${sheetHead('Quick <em>capture</em>','conn')}${needSrv()}
    <p class="small" style="margin-top:0">Log without opening Life: say <b>“Hey Siri, Life”</b>, press the <b>Action button</b>, or share a link from any app. It lands in Life the next time you open it.</p>
    <div class="set-grp">Make the Shortcut (once, 2 minutes)</div>
    <ol class="steps">
      <li>Open <b>Shortcuts</b> → <b>+</b>. Add <b>Ask for Input</b> (Text). Prompt: <i>What should Life log?</i></li>
      <li>Add <b>Get Contents of URL</b>. Paste the address below. Tap <b>›</b>: Method <b>POST</b>; add a Header <code>X-Life-Key</code> with your key; Request Body <b>JSON</b> with key <code>text</code> = <i>Provided Input</i>.</li>
      <li>Rename the shortcut <b>Life</b>. Now “Hey Siri, Life” works.</li>
      <li><b>Action button:</b> Settings → Action Button → Shortcut → Life. <b>Back Tap:</b> Settings → Accessibility → Touch → Back Tap.</li>
      <li><b>Share sheet:</b> duplicate it, swap Ask for Input for <b>Receive Text, URLs and Images from Share Sheet</b>, add <b>Extract Text from Image</b> for screenshots, and put <code>idea </code> in front so shares land in Ideas.</li>
    </ol>
    ${copyRow('Address',url)}${syncOn()?copyRow('Header X-Life-Key',SYNC.key):''}
    <div class="set-grp">Things you can say</div>
    <div class="qex">${['40g protein','chipotle bowl 850 kcal 45p','weight 172.4','task email Bansal fri','remind me to call dad at 6pm','spent 12.50 coffee','focus 50 problem set','water','workout 45 push day','idea reel saver app'].map(x=>`<button class="chip" data-qtry="${esc(x)}">${esc(x)}</button>`).join('')}</div>
    <p class="small">Tap an example to try it here. Anything that doesn’t match lands in Scrap so nothing is lost.</p>`);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-qtry]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const q=parseQuick(b.dataset.qtry);toast(`Would add: ${q.label}`)},true);

/* ======================================================================
   2) GRADES & DEADLINES
   ====================================================================== */
const LETTERS=[['A',93,4.0],['A-',90,3.7],['B+',87,3.3],['B',83,3.0],['B-',80,2.7],['C+',77,2.3],['C',73,2.0],['C-',70,1.7],['D+',67,1.3],['D',63,1.0],['D-',60,.7],['F',0,0]];
const letterOf=p=>(LETTERS.find(l=>p>=l[1])||LETTERS[LETTERS.length-1]);
const G=()=>(db.grades=db.grades||{});
function gOf(cid){const g=G();if(!g[cid])g[cid]={credits:3,target:'A',cats:[{id:uid(),name:'Homework',w:30},{id:uid(),name:'Exams',w:40},{id:uid(),name:'Final',w:30,final:true}],items:[]};return g[cid]}
/* weighted grade: each category's % (points earned ÷ points possible) times its weight, over the weight that has grades so far */
function gradeCalc(g){
  const cats=g.cats.map(c=>{const it=g.items.filter(i=>i.cat===c.id&&i.score!==''&&i.score!=null&&num(i.max)>0);const e=it.reduce((s,i)=>s+num(i.score),0),mx=it.reduce((s,i)=>s+num(i.max),0);return{...c,n:it.length,pct:mx?e/mx*100:null}});
  const graded=cats.filter(c=>c.pct!=null),W=graded.reduce((s,c)=>s+num(c.w),0),cur=W?graded.reduce((s,c)=>s+num(c.w)*c.pct,0)/W:null;
  const fin=cats.find(c=>c.final),others=cats.filter(c=>!c.final&&c.pct!=null),Wo=others.reduce((s,c)=>s+num(c.w),0),curO=Wo?others.reduce((s,c)=>s+num(c.w)*c.pct,0)/Wo:null;
  const tgt=(LETTERS.find(l=>l[0]===g.target)||LETTERS[0])[1],wf=fin?num(fin.w)/100:0;
  const need=fin&&curO!=null&&wf>0&&fin.pct==null?(tgt-(1-wf)*curO)/wf:null;   /* target = (1−w_f)·current + w_f·x  →  x = (target − (1−w_f)·current) ÷ w_f */
  return{cats,cur,curO,need,tgt,wf,fin}}
function gpaProj(){
  const cls=of('class'),rows=cls.map(c=>{const g=G()[c.id];if(!g)return null;const r=gradeCalc(g);if(r.cur==null)return null;const L=letterOf(r.cur);return{c,g,r,L,cr:num(g.credits)||0}}).filter(Boolean);
  const cr=rows.reduce((s,x)=>s+x.cr,0),pts=rows.reduce((s,x)=>s+x.L[2]*x.cr,0),term=cr?pts/cr:null,st=db.settings.gpa||{},cum0=num(st.cum),cr0=num(st.credits);
  const cum=term!=null&&cr0?(cum0*cr0+pts)/(cr0+cr):null;return{rows,term,cum,cr,cum0,cr0}}
function examsAhead(days=30){const out=[];for(const c of of('class')){const g=G()[c.id];if(!g)continue;for(const i of g.items)if(i.exam&&i.date&&dayDiff(i.date)>=0&&dayDiff(i.date)<=days)out.push({...i,cls:c})}return out.sort((a,b)=>a.date.localeCompare(b.date))}
function gradesView(){
  const P2=gpaProj(),cls=of('class'),ex=examsAhead(30);
  let h=chipsSub('work')+heroBanner('Grades',P2.term!=null?P2.term.toFixed(2):'—',P2.term!=null?`projected term GPA${P2.cum!=null?` · cumulative <b>${P2.cum.toFixed(2)}</b>`:''}`:'add scores to see your projected GPA',[['Classes',cls.length],['Credits',P2.cr||0],['Exams · 30d',ex.length]],'#B9C6FF',`<div class="hero-actions"><button class="pill glassy" id="gpaSet">${ic('gear')}GPA so far</button></div>`);
  if(ex.length)h+=section('Exams <em>coming up</em>',`<div class="card-s rvcard">${ex.map(x=>`<div class="exrow2"><span class="cdn"><b class="num">${dayDiff(x.date)}</b><small>day${dayDiff(x.date)===1?'':'s'}</small></span><span class="exm2"><b>${esc(x.name)}</b><small>${esc(x.cls.title)} · ${esc(fmtLong(x.date))}</small></span><button class="link" data-studyplan="${x.cls.id}|${x.id}">${ic('block')}Plan study</button></div>`).join('')}</div>`);
  h+=section('Your <em>classes</em>',cls.length?`<div class="gcards">${cls.map(c=>{const g=G()[c.id],r=g?gradeCalc(g):null,L=r&&r.cur!=null?letterOf(r.cur):null;
    return`<button class="gcard card-s" data-gcls="${esc(c.id)}"><span class="gtop"><b>${esc(c.title)}</b>${L?`<span class="glet">${L[0]}</span>`:''}</span><span class="gpct num">${r&&r.cur!=null?r.cur.toFixed(1)+'%':'No scores yet'}</span>
      <i class="gbar"><i style="width:${r&&r.cur!=null?Math.min(100,r.cur):0}%"></i>${r?`<em style="left:${r.tgt}%"></em>`:''}</i>
      <small>${r&&r.need!=null?(r.need>100?`Need ${r.need.toFixed(0)}% on the final for ${esc(g.target)}: out of reach, aim for the next grade`:r.need<=0?`${esc(g.target)} is safe even with a 0 on the final`:`Need <b>${r.need.toFixed(0)}%</b> on the final for ${esc(g.target)}`):'Tap to add categories and scores'}</small></button>`}).join('')}</div>`:emptyBox('Add your classes in the Week tab first, then track grades here.'));
  return h}
function openClassGrades(cid){
  const cls=of('class');if(!cid){if(!cls.length){toast('Add a class first (Week tab)');return}cid=cls[0].id}
  const c=find(cid),g=gOf(cid),r=gradeCalc(g);
  const catSel=v=>`<select data-gf="cat">${g.cats.map(x=>`<option value="${esc(x.id)}"${x.id===v?' selected':''}>${esc(x.name)}</option>`).join('')}</select>`;
  openSheet(`${sheetHead(`${esc(c.title)} <em>grades</em>`)}
    ${cls.length>1?`<div class="chips gcls">${cls.map(x=>`<button class="chip${x.id===cid?' on':''}" data-gcls="${esc(x.id)}">${esc(x.title)}</button>`).join('')}</div>`:''}
    <div class="gsum"><div><b class="num">${r.cur!=null?r.cur.toFixed(1)+'%':'—'}</b><span>now${r.cur!=null?' · '+letterOf(r.cur)[0]:''}</span></div><div><b class="num"${r.need!=null&&r.need>100?' style="color:var(--late)"':''}>${r.need!=null?Math.max(0,r.need).toFixed(0)+'%':'—'}</b><span>${r.need!=null&&r.need>100?'out of reach':'needed on final'}</span></div>
      <label><span>Goal</span><select data-gset="target">${LETTERS.slice(0,10).map(l=>`<option${l[0]===g.target?' selected':''}>${l[0]}</option>`).join('')}</select></label><label><span>Credits</span><input data-gset="credits" type="number" inputmode="numeric" value="${esc(g.credits)}"></label></div>
    ${r.need!=null?`<p class="small formula">Final needed = (goal ${r.tgt}% − (1 − ${r.wf.toFixed(2)}) × ${r.curO.toFixed(1)}%) ÷ ${r.wf.toFixed(2)} = <b>${r.need.toFixed(1)}%</b>. Assumes your other categories stay where they are.</p>`:''}
    <div class="set-grp">Categories <small>weights should add to 100 · now ${g.cats.reduce((s,x)=>s+num(x.w),0)}</small></div>
    <div class="gcats">${r.cats.map(x=>`<div class="gcat" data-gcat="${esc(x.id)}"><input data-gc="name" value="${esc(x.name)}" aria-label="Category name"><span class="gw"><input data-gc="w" type="number" inputmode="decimal" value="${esc(x.w)}" aria-label="Weight"><i>%</i></span><span class="gp num">${x.pct!=null?x.pct.toFixed(0)+'%':'—'}</span><button class="link${x.final?' on':''}" data-gfinal="${esc(x.id)}" title="Mark as the final exam">${x.final?'Final ✓':'Final?'}</button><button class="x" data-gcdel="${esc(x.id)}" aria-label="Remove category">${ic('close')}</button></div>`).join('')}
      <button class="link" id="gcAdd">${ic('plus')}Category</button></div>
    <div class="set-grp">Scores &amp; exams</div>
    <div class="gitems">${g.items.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(i=>`<div class="gitem" data-gitem="${esc(i.id)}"><span><b>${esc(i.name)}</b><small>${esc((g.cats.find(x=>x.id===i.cat)||{}).name||'')}${i.date?' · '+esc(fmtDate(i.date)):''}${i.exam?' · exam':''}</small></span><span class="gsc num">${i.score!==''&&i.score!=null?`${i.score}/${i.max} · ${(num(i.score)/num(i.max)*100).toFixed(0)}%`:i.exam&&i.date?`in ${dayDiff(i.date)}d`:'—'}</span><button class="x" data-gidel="${esc(i.id)}" aria-label="Delete">${ic('close')}</button></div>`).join('')||'<p class="hint">No scores yet.</p>'}</div>
    <form class="gadd" id="gAdd"><input name="name" placeholder="e.g. Exam 2" required><select name="cat">${g.cats.map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join('')}</select>
      <input name="score" type="number" inputmode="decimal" step="any" placeholder="Score"><input name="max" type="number" inputmode="decimal" step="any" placeholder="Out of" value="100"><input name="date" type="date"><label class="gex"><input type="checkbox" name="exam">Exam</label><button class="primary" type="submit">Add</button></form>
    <p class="small">Leave the score blank for an upcoming exam: you’ll get a countdown and study-block suggestions.</p>`);
  $('#sheetBody').dataset.gcid=cid;
}
function gRefresh(){const cid=$('#sheetBody')?.dataset.gcid;if(!cid)return;save();const st=$('.sheet').scrollTop;openClassGrades(cid);$('.sheet').scrollTop=st;DATA_VER++}
document.addEventListener('change',e=>{const b=$('#sheetBody');if(!b||!b.dataset.gcid||!b.contains(e.target))return;const g=gOf(b.dataset.gcid);
  if(e.target.dataset.gset){const k=e.target.dataset.gset;g[k]=k==='credits'?num(e.target.value):e.target.value;gRefresh();return}
  const row=e.target.closest('[data-gcat]');if(row&&e.target.dataset.gc){const c=g.cats.find(x=>x.id===row.dataset.gcat);c[e.target.dataset.gc]=e.target.dataset.gc==='w'?num(e.target.value):e.target.value;gRefresh()}});
document.addEventListener('submit',e=>{if(e.target.id!=='gAdd')return;e.preventDefault();const f=new FormData(e.target),g=gOf($('#sheetBody').dataset.gcid);
  g.items.push({id:uid(),name:String(f.get('name')).trim()||'Score',cat:f.get('cat'),score:f.get('score')===''?'':num(f.get('score')),max:num(f.get('max'))||100,date:f.get('date')||'',exam:!!f.get('exam')});gRefresh();tick()});
document.addEventListener('click',e=>{const t=e.target.closest('[data-gcls],#gcAdd,[data-gcdel],[data-gidel],[data-gfinal],#gpaSet,[data-studyplan],#spAdd');if(!t)return;e.preventDefault();e.stopImmediatePropagation();
  const d=t.dataset,b=$('#sheetBody'),cid=b&&b.dataset.gcid,g=cid?gOf(cid):null;
  if(d.gcls){openClassGrades(d.gcls);return}
  if(t.id==='gcAdd'){g.cats.push({id:uid(),name:'Category',w:0});gRefresh();return}
  if(d.gcdel){if(g.items.some(i=>i.cat===d.gcdel)){toast('Move or delete its scores first');return}g.cats=g.cats.filter(x=>x.id!==d.gcdel);gRefresh();return}
  if(d.gidel){g.items=g.items.filter(x=>x.id!==d.gidel);gRefresh();return}
  if(d.gfinal){g.cats.forEach(x=>x.final=x.id===d.gfinal?!x.final:false);gRefresh();return}
  if(t.id==='gpaSet'){const s=db.settings.gpa||{};openSheet(`${sheetHead('GPA <em>so far</em>')}<p class="small">Used to project your cumulative GPA after this term.</p><div class="qa" style="grid-template-columns:1fr 1fr"><label class="fld"><span>Cumulative GPA</span><input id="gpaC" type="number" step="0.01" inputmode="decimal" value="${esc(s.cum||'')}" placeholder="3.50"></label><label class="fld"><span>Credits earned</span><input id="gpaN" type="number" inputmode="numeric" value="${esc(s.credits||'')}" placeholder="90"></label></div><div class="sh-actions"><button class="primary" id="gpaSave" style="flex:1">Save</button></div>`);return}
  if(d.studyplan){const[c,i]=d.studyplan.split('|');openStudyPlan(c,i);return}
  if(t.id==='spAdd'){const plan=window.__plan||[];plan.forEach(p=>db.entries.push({id:uid(),type:'task',title:p.title,project:p.project,due:p.due,block:{date:p.date,start:p.start,end:p.end},created:Date.now()}));save();closeSheet();render(false);tick();toast(`${plan.length} study blocks added to your Week`);return}
},true);
document.addEventListener('click',e=>{if(!e.target.closest('#gpaSave'))return;e.preventDefault();e.stopImmediatePropagation();db.settings.gpa={cum:num($('#gpaC').value),credits:num($('#gpaN').value)};save();closeSheet();render(false)},true);
document.addEventListener('click',e=>{const b=e.target.closest('.gcard[data-gcls]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();openClassGrades(b.dataset.gcls)},true);
/* study blocks: free 50-minute slots before the exam, around classes and meetings, one a day, evenings first */
function freeSlots(d,len=50){const busy=dayItems(d).filter(e=>!e.allDay).map(e=>{const cl=e.type==='class'||e.type==='ext'||e.type==='block';const s=toMin(cl?e.start:e.time);let en=cl?toMin(e.end):null;if(s==null)return null;if(en==null||en<=s)en=s+60;return[s-10,en+10]}).filter(Boolean);
  const pref=[19*60,20*60,17*60,15*60,13*60,10*60,21*60],out=[];const now=new Date(),nowM=d===today()?now.getHours()*60+now.getMinutes()+30:0;
  for(const s of pref){const e=s+len;if(s<nowM)continue;if(!busy.some(([a,b])=>s<b&&e>a))out.push([s,e])}return out}
function openStudyPlan(cid,iid){const c=find(cid),g=gOf(cid),it=g.items.find(x=>x.id===iid);if(!it)return;const n=dayDiff(it.date),plan=[];
  for(let k=Math.max(0,n-7);k<n;k++){const d=addDays(k),sl=freeSlots(d);if(sl.length){const[s,e]=sl[0];plan.push({date:d,start:`${pad(Math.floor(s/60))}:${pad(s%60)}`,end:`${pad(Math.floor(e/60))}:${pad(e%60)}`,title:`Study: ${it.name}`,project:c.title,due:it.date})}}
  window.__plan=plan;
  openSheet(`${sheetHead('Study <em>plan</em>')}<p class="small" style="margin-top:0">${esc(it.name)} · ${esc(c.title)} · ${esc(fmtLong(it.date))} (${n} day${n===1?'':'s'})</p>
    ${plan.length?`<div class="card-s rvcard">${plan.map(p=>`<div class="exrow2"><span class="cdn"><b class="num">${esc(wdOf(p.date).slice(0,3))}</b><small>${esc(fmtDate(p.date))}</small></span><span class="exm2"><b>${fmtT(p.start)} – ${fmtT(p.end)}</b><small>50 min, between your classes and meetings</small></span></div>`).join('')}</div>
    <div class="sh-actions"><button class="primary" id="spAdd" style="flex:1">${ic('block')}Add ${plan.length} blocks to my Week</button></div><p class="small">They show up on your schedule as tasks; drag them to move.</p>`:'<p class="hint">No free slots found before the exam. Drag tasks onto the Week view to plan by hand.</p>'}`)}

/* ======================================================================
   3) MONEY
   ====================================================================== */
const AUTO=[[/uber|lyft|shell|exxon|bp |chevron|sunoco|parking|transit|amtrak|bus|gas/i,'Transport'],[/kroger|walmart|food lion|aldi|trader joe|whole foods|target|costco|grocery|safeway|publix|wegmans|lidl/i,'Groceries'],
  [/chipotle|starbucks|mcdonald|chick-fil|subway|panera|pizza|taco|wendy|burger|cafe|coffee|restaurant|doordash|grubhub|uber eats|dining|turner place|bowl|sushi|lunch|dinner|breakfast/i,'Food'],
  [/amazon|best buy|apple\.com|nike|h&m|zara|ebay|etsy|shop/i,'Shopping'],[/netflix|spotify|hulu|verizon|at&t|t-mobile|rent|electric|utility|internet|insurance|icloud|subscription|apple music|youtube/i,'Bills'],
  [/delta|united|american air|airbnb|hotel|marriott|hilton|expedia|booking\.com|flight|airline/i,'Travel'],[/cvs|walgreens|pharmacy|doctor|clinic|dental|gym|planet fitness/i,'Health'],[/bookstore|tuition|chegg|pearson|course|textbook|vt |virginia tech/i,'School'],[/movie|cinema|steam|playstation|xbox|concert|ticket|bar |club/i,'Fun']];
function autoCat(t){for(const[re,c]of AUTO)if(re.test(' '+t+' '))return c;return'Other'}
const budgets=()=>(db.settings.budgets=db.settings.budgets||{});
function monthSpend(mk){const by={};let tot=0;of('expense').filter(e=>e.date&&monthKey(e.date)===mk).forEach(e=>{const a=num(e.amount);tot+=a;by[e.cat||'Other']=(by[e.cat||'Other']||0)+a});return{tot,by}}
function moneyView(){
  const mk=monthKey(today()),{tot,by}=monthSpend(mk),B=budgets(),btot=Object.values(B).reduce((s,v)=>s+num(v),0),dom=+today().slice(8),dim=new Date(+mk.slice(0,4),+mk.slice(5,7),0).getDate();
  const wk=of('expense').filter(e=>e.date&&dayDiff(e.date)>-7&&dayDiff(e.date)<=0).reduce((s,e)=>s+num(e.amount),0),pace=tot/dom*dim;
  let h=chipsSub('work')+heroBanner(new Date().toLocaleDateString(undefined,{month:'long'})+' spending',money(tot),btot?`of <b>${money(btot)}</b> budget · on pace for ${money(Math.round(pace))}`:`on pace for ${money(Math.round(pace))} this month`,[['This week',money(Math.round(wk))],['Per day',money(Math.round(tot/dom))],['Left',btot?money(Math.round(btot-tot)):'—']],'#9DE0B8',
    `<div class="hero-actions"><button class="pill light" id="mAdd">${ic('plus')}Log</button><button class="pill glassy" id="mBud">${ic('gear')}Budgets</button><button class="pill glassy" id="mCsv">${ic('copy')}Import</button></div>`);
  h+=section('Quick <em>log</em>',`<div class="card-s rvcard mquick"><div class="mamt"><span>$</span><input id="mAmt" type="number" inputmode="decimal" step="0.01" placeholder="0.00" aria-label="Amount" enterkeyhint="next"><input id="mWhat" placeholder="What (optional)" aria-label="What" enterkeyhint="done"><button class="mdone" id="mDone" type="button">Done</button></div><div class="mcats">${MCATS.map(([c,e])=>`<button class="mcat" data-mcat="${c}"><span>${e}</span>${c}</button>`).join('')}</div>${MLAST&&Date.now()-MLAST.t<15000?`<div class="mok" id="mOk"><span>${ic('check')}</span><b>Logged ${money(MLAST.a)} · ${esc(MLAST.cat)}</b><button type="button" id="mUndo">Undo</button></div>`:`<p class="small" style="margin:10px 0 0">Type the amount, then tap a category to log it.</p>`}</div>`);
  const cats=MCATS.map(c=>c[0]).filter(c=>by[c]||num(B[c]));
  if(cats.length)h+=section('By <em>category</em>',`<div class="card-s rvcard">${cats.sort((a,b)=>(by[b]||0)-(by[a]||0)).map(c=>{const s=by[c]||0,b=num(B[c]),p=b?s/b:0;return`<div class="cbar"><div class="ct"><span>${catEmoji(c)} ${c}</span><b class="num">${money(Math.round(s))}${b?`<small> / ${money(b)}</small>`:''}</b></div><div class="tr"><i style="width:${Math.min(100,b?p*100:(tot?s/tot*100:0)).toFixed(1)}%;background:${b&&p>1?'var(--late)':b&&p>.85?'var(--soon)':'var(--good)'}"></i></div></div>`}).join('')}</div>`);
  const recent=of('expense').sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.created-a.created)).slice(0,40);
  h+=section('Recent',list(recent,'Nothing logged yet. Type “spent 12 coffee” in the quick bar, or import your bank’s CSV.'));
  return h}
function openMoneyAdd(){state.sub.work='expense';if(state.tab!=='work'){state.tab='work'}render(false);setTimeout(()=>{const a=$('#mAmt');if(a){a.scrollIntoView({block:'center',behavior:'smooth'});a.focus()}},350)}
let MLAST=null;
document.addEventListener('click',e=>{const t=e.target.closest('[data-mcat],#mAdd,#mBud,#mCsv,#mBudSave,#csvGo,#mDone,#mUndo');if(!t)return;e.preventDefault();e.stopImmediatePropagation();
  if(t.id==='mDone'){try{document.activeElement.blur()}catch(x){}return}
  if(t.id==='mUndo'){if(MLAST&&MLAST.id){db.entries=db.entries.filter(x=>x.id!==MLAST.id);save()}MLAST=null;const y=SC.scrollTop;render(false);SC.scrollTop=y;toast('Removed');return}
  if(t.dataset.mcat){const a=num($('#mAmt').value);if(!a){const i=$('#mAmt');i.focus();i.closest('.mamt').animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:260});return}const w=$('#mWhat').value.trim()||t.dataset.mcat;
    try{document.activeElement&&document.activeElement.blur()}catch(x){}
    const n0=db.entries.length;addEntry({type:'expense',title:cap(w),amount:a,cat:t.dataset.mcat,date:today()});const ne=db.entries[db.entries.length-1];MLAST={a,cat:t.dataset.mcat,id:n0<db.entries.length?ne.id:null,t:Date.now()};tick();
    const y=SC.scrollTop;render(false);SC.scrollTop=y;const ok=$('#mOk');if(ok)ok.animate([{transform:'scale(.92)',opacity:0},{transform:'none',opacity:1}],{duration:360,easing:'cubic-bezier(.3,1.4,.5,1)'});return}
  if(t.id==='mAdd'){openMoneyAdd();return}
  if(t.id==='mBud'){const B=budgets();openSheet(`${sheetHead('Monthly <em>budgets</em>')}<p class="small" style="margin-top:0">Leave blank for no limit. Bars turn amber at 85% and red over budget.</p><div class="mbuds">${MCATS.map(([c,em])=>`<label class="fld"><span>${em} ${c}</span><input data-bud="${c}" type="number" inputmode="decimal" value="${esc(B[c]||'')}" placeholder="—"></label>`).join('')}</div><div class="sh-actions"><button class="primary" id="mBudSave" style="flex:1">Save</button></div>`);return}
  if(t.id==='mBudSave'){const B={};$$('[data-bud]').forEach(i=>{if(num(i.value)>0)B[i.dataset.bud]=num(i.value)});db.settings.budgets=B;save();closeSheet();render(false);return}
  if(t.id==='mCsv'){const inp=document.createElement('input');inp.type='file';inp.accept='.csv,text/csv,text/plain';inp.onchange=()=>inp.files[0]&&inp.files[0].text().then(csvPreview);inp.click();return}
  if(t.id==='csvGo'){const rows=window.__csv||[];rows.forEach(r=>db.entries.push({id:uid(),type:'expense',title:r.title,amount:r.amount,cat:r.cat,date:r.date,src:'csv',csv:r.key,created:Date.now()}));save();closeSheet();render(false);tick();toast(`Imported ${rows.length} purchases`);return}
},true);
document.addEventListener('keydown',e=>{if(e.target.id==='mAmt'&&e.key==='Enter'){e.preventDefault();$('#mWhat')?.focus()}});
function csvSplit(line){const out=[];let cur='',q=false;for(let i=0;i<line.length;i++){const ch=line[i];if(q){if(ch==='"'&&line[i+1]==='"'){cur+='"';i++}else if(ch==='"')q=false;else cur+=ch}else if(ch==='"')q=true;else if(ch===','){out.push(cur);cur=''}else cur+=ch}out.push(cur);return out.map(s=>s.trim())}
function csvDate(s){s=s.trim();let m;if((m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)))return`${m[1]}-${pad(+m[2])}-${pad(+m[3])}`;if((m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)))return`${m[3].length===2?'20'+m[3]:m[3]}-${pad(+m[1])}-${pad(+m[2])}`;return''}
function csvPreview(text){
  const lines=text.replace(/\r/g,'').split('\n').filter(l=>l.trim());if(lines.length<2){toast('That file looks empty');return}
  const head=csvSplit(lines[0]).map(h=>h.toLowerCase()),col=re=>head.findIndex(h=>re.test(h));
  const ci={date:col(/date|posted/),desc:col(/desc|payee|merchant|name|memo|details/),amt:col(/^amount$|amount|amt/),deb:col(/debit|withdraw/),cred:col(/credit|deposit/)};
  if(ci.date<0||ci.desc<0||(ci.amt<0&&ci.deb<0)){toast('Couldn’t find Date, Description and Amount columns');return}
  const raw=lines.slice(1).map(csvSplit),amt=r=>ci.deb>=0?(num(String(r[ci.deb]).replace(/[$,]/g,''))||-(num(String(r[ci.cred]||'').replace(/[$,]/g,''))||0)):num(String(r[ci.amt]).replace(/[$,()]/g,''))*(String(r[ci.amt]).includes('(')?-1:1);
  const vals=raw.map(amt),negSpend=ci.deb<0&&vals.filter(v=>v<0).length>=vals.filter(v=>v>0).length;   /* most banks list purchases as negative numbers */
  const have=new Set(of('expense').map(e=>e.csv).filter(Boolean));let skipped=0;const rows=[];
  raw.forEach((r,i)=>{let v=vals[i];if(negSpend)v=-v;const date=csvDate(r[ci.date]||''),desc=(r[ci.desc]||'').replace(/\s{2,}/g,' ').trim();if(!date||!(v>0)||/payment|transfer|deposit|refund|interest|zelle from/i.test(desc)){skipped++;return}
    const key=`${date}|${v.toFixed(2)}|${desc.toLowerCase()}`;if(have.has(key)){skipped++;return}have.add(key);rows.push({date,amount:+v.toFixed(2),title:cap(desc.toLowerCase().replace(/\b(pos|debit|purchase|card|\d{4,})\b/g,'').replace(/\s{2,}/g,' ').trim()).slice(0,60)||'Purchase',cat:autoCat(desc),key})});
  window.__csv=rows;const by={};rows.forEach(r=>by[r.cat]=(by[r.cat]||0)+r.amount);
  openSheet(`${sheetHead('Import <em>purchases</em>')}<p class="small" style="margin-top:0">Found <b>${rows.length}</b> purchases totalling <b>${money(rows.reduce((s,r)=>s+r.amount,0))}</b>. Skipped ${skipped} (payments, refunds, duplicates already in Life).</p>
    <div class="card-s rvcard">${Object.entries(by).sort((a,b)=>b[1]-a[1]).map(([c,v])=>`<div class="cbar"><div class="ct"><span>${catEmoji(c)} ${c}</span><b class="num">${money(Math.round(v))}</b></div><div class="tr"><i style="width:${Math.min(100,v/Math.max(...Object.values(by))*100).toFixed(1)}%;background:var(--good)"></i></div></div>`).join('')}</div>
    <p class="small">Categories are guessed from the merchant name; tap any purchase later to change it.</p><div class="sh-actions"><button class="primary" id="csvGo" style="flex:1"${rows.length?'':' disabled'}>Import ${rows.length}</button></div>`)}

/* ======================================================================
   4) INSIGHTS — honest, simple correlations across your own days
   ====================================================================== */
function pearson(xs,ys){const n=xs.length;if(n<3)return 0;const mx=xs.reduce((a,b)=>a+b,0)/n,my=ys.reduce((a,b)=>a+b,0)/n;let sxy=0,sx=0,sy=0;for(let i=0;i<n;i++){const a=xs[i]-mx,b=ys[i]-my;sxy+=a*b;sx+=a*a;sy+=b*b}return sx&&sy?sxy/Math.sqrt(sx*sy):0}
function daySeries(days=56){
  const foodBy={},focBy={},woBy={},spBy={};
  of('food').forEach(e=>{if(e.date){const f=foodBy[e.date]=foodBy[e.date]||{k:0,p:0};f.k+=num(e.kcal);f.p+=num(e.protein)}});
  of('focus').forEach(e=>{if(e.date)focBy[e.date]=(focBy[e.date]||0)+num(e.minutes)});
  of('workout').forEach(e=>{if(e.date)woBy[e.date]=(woBy[e.date]||0)+(num(e.minutes)||45)});
  of('expense').forEach(e=>{if(e.date)spBy[e.date]=(spBy[e.date]||0)+num(e.amount)});
  const hs=habits(),L=hlog(),out=[];
  for(let i=days-1;i>=0;i--){const d=addDays(-i),h=hday(d)||{},hc=hs.length?hs.reduce((s,x)=>s+Math.min(1,((L[d]||{})[x.id]||0)/x.target),0)/hs.length:null;
    out.push({d,sleep:num(h.sleepMin)?num(h.sleepMin)/60:null,steps:num(h.steps)||null,focus:focBy[d]!=null?focBy[d]:(i<days?null:null),focusAny:focBy[d]||0,wo:woBy[d]||0,prot:foodBy[d]?foodBy[d].p:null,kcal:foodBy[d]?foodBy[d].k:null,habit:hc,spend:spBy[d]||0,done:of('task').filter(e=>e.doneAt&&iso(new Date(e.doneAt))===d).length})}
  return out}
function insights(){
  const S2=daySeries(56),R=[],fmt={sleep:v=>v.toFixed(1)+' h',focusAny:v=>Math.round(v)+' min',steps:v=>fmtN(v),kcal:v=>fmtN(v)+' kcal',habit:v=>Math.round(v*100)+'%',done:v=>v.toFixed(1),spend:v=>money(Math.round(v))};
  const pairs=[['sleep','focusAny',0,'sleep','focus time','after more sleep'],['sleep','habit',0,'sleep','habits done','after more sleep'],['sleep','kcal',0,'sleep','calories eaten','after less sleep',true],['sleep','done',0,'sleep','tasks finished','after more sleep'],
    ['steps','sleep',1,'steps','sleep that night','on more active days'],['wo','sleep',1,'workouts','sleep that night','on workout days'],['sleep','spend',0,'sleep','spending','after less sleep',true]];
  for(const[x,y,lag,xn,yn,phrase,inv]of pairs){const xs=[],ys=[];for(let i=0;i+lag<S2.length;i++){const a=S2[i][x],b=S2[i+lag][y];if(a==null||b==null||(x==='wo'&&false))continue;if(y==='kcal'&&!b)continue;xs.push(a);ys.push(b)}
    if(xs.length<10)continue;const r=pearson(xs,ys);if(Math.abs(r)<.3)continue;
    const med=[...xs].sort((a,b)=>a-b)[xs.length>>1],hi=ys.filter((_,i)=>xs[i]>med),lo=ys.filter((_,i)=>xs[i]<=med);if(hi.length<3||lo.length<3)continue;
    const mh=hi.reduce((a,b)=>a+b,0)/hi.length,ml=lo.reduce((a,b)=>a+b,0)/lo.length,diff=mh-ml,f=fmt[y]||(v=>v.toFixed(1));
    R.push({r,n:xs.length,text:inv?`${cap(yn)} is <b>${f(Math.abs(diff))} ${diff<0?'higher':'lower'}</b> ${phrase}`:`${cap(yn)} is <b>${f(Math.abs(diff))} ${diff>0?'higher':'lower'}</b> ${phrase}`,sub:`Days above vs below your median ${xn} · r = ${r.toFixed(2)} · ${xs.length} days`})}
  /* best focus hour */
  const byH={};of('focus').filter(e=>e.start).forEach(e=>{const h=new Date(e.start).getHours();const b=byH[h]=byH[h]||{n:0,m:0,r:0,rn:0};b.n++;b.m+=num(e.minutes);if(e.rating){b.r+=num(e.rating);b.rn++}});
  const hrs=Object.entries(byH).filter(([,b])=>b.n>=3).map(([h,b])=>({h:+h,n:b.n,score:b.rn?b.r/b.rn:b.m/b.n/10,avg:b.m/b.n,rating:b.rn?b.r/b.rn:null})).sort((a,b)=>b.score-a.score);
  if(hrs.length>=2){const t=hrs[0],lbl=h=>fmtT(`${pad(h)}:00`);R.push({r:.99,n:t.n,text:`Your best focus hour is <b>${lbl(t.h)}–${lbl((t.h+1)%24)}</b>`,sub:`${t.n} sessions${t.rating?` · ${t.rating.toFixed(1)}/5 focus`:''} · ${Math.round(t.avg)} min average`})}
  R.sort((a,b)=>Math.abs(b.r)-Math.abs(a.r));
  const logged=S2.filter(d=>d.sleep!=null).length;return{R,logged}}
function insightSection(){const{R,logged}=insights();
  const body=R.length?`<div class="card-s rvcard ins">${R.slice(0,3).map(x=>`<div class="insr"><span class="insi">${ic('spark')}</span><span><b>${x.text}</b><small>${x.sub}</small></span></div>`).join('')}<p class="small" style="margin:6px 0 0">These are correlations in your own data, not proof of cause.${R.length>3?` <button class="link" id="insMore">${R.length-3} more</button>`:''}</p></div>`
    :`<div class="card-s rvcard"><p class="small" style="margin:0">Insights appear once there are about 10 days with both sleep and the thing it’s compared to (${logged} days with sleep so far). Keep Fitbit synced and log focus, food and habits.</p></div>`;
  return section('Insights',body)}
document.addEventListener('click',e=>{if(!e.target.closest('#insMore'))return;e.preventDefault();e.stopImmediatePropagation();const{R}=insights();
  openSheet(`${sheetHead('<em>Insights</em>')}<div class="card-s rvcard ins">${R.map(x=>`<div class="insr"><span class="insi">${ic('spark')}</span><span><b>${x.text}</b><small>${x.sub}</small></span></div>`).join('')}</div><p class="small">r runs from −1 to 1; above 0.3 or below −0.3 is a noticeable pattern. “Higher/lower” compares your days above vs below the median.</p>`)},true);

/* ======================================================================
   5) TIME-BLOCKING — drag tasks onto the day
   ====================================================================== */
const _dayItemsM=dayItems;dayItems=function(d){const base=_dayItemsM(d);const bl=of('task').filter(e=>e.block&&e.block.date===d&&!e.done).map(e=>({...e,type:'block',start:e.block.start,end:e.block.end,place:e.project||''}));
  return bl.length?[...base,...bl].sort((a,b)=>((a.start||a.time||'')).localeCompare(b.start||b.time||'')):base};
const _calCardM=calCard;calCard=function(){const h=_calCardM();if(calView()!=='day')return h;const d=anchor(),open=of('task').filter(e=>!e.done&&!(e.block&&e.block.date===d)).sort(byDue).slice(0,14);
  if(!open.length)return h;
  return`<div class="tray card-s"><div class="tray-h"><b>Plan this day</b><small>Hold a task and drag it onto a time</small></div><div class="tray-l">${open.map(e=>`<button class="tchip" data-tdrag="${esc(e.id)}"><span class="tt">${esc(e.title)}</span>${e.due?`<small>${esc(relDue(e.due))}</small>`:''}</button>`).join('')}</div></div>`+h};
(function(){ /* drag from the tray (or move an existing block) onto the day grid, snapping to 15 minutes */
  let dr=null;
  const slotAt=(x,y)=>{const sc=$('.day-scroll'),body=sc&&sc.querySelector('.wk-body');if(!sc||!body)return null;const r=body.getBoundingClientRect(),sr=sc.getBoundingClientRect();if(x<sr.left||x>sr.right||y<sr.top-20||y>sr.bottom+20)return null;
    const h0=+sc.dataset.h0,ph=+sc.dataset.ph,m=Math.round(((y-r.top)/ph*60+h0*60)/15)*15;return{m:Math.max(0,Math.min(23*60+45,m)),y:r.top+(m-h0*60)/60*ph,r}};
  function start(e,id,label){const t=find(id);if(!t)return;const g=document.createElement('div');g.className='tghost';g.textContent=label||t.title;document.body.appendChild(g);
    const line=document.createElement('div');line.className='tline';document.body.appendChild(line);dr={id,g,line,dur:t.block?toMin(t.block.end)-toMin(t.block.start):(num(t.est)||50)};move(e);try{navigator.vibrate&&navigator.vibrate(8)}catch(x){}}
  function move(e){if(!dr)return;dr.g.style.transform=`translate(${e.clientX-20}px,${e.clientY-28}px)`;const s=slotAt(e.clientX,e.clientY);if(s){dr.line.style.cssText=`display:block;left:${s.r.left}px;width:${s.r.width}px;top:${s.y}px`;dr.line.dataset.t=fmtT(`${pad(Math.floor(s.m/60))}:${pad(s.m%60)}`);dr.m=s.m}else{dr.line.style.display='none';dr.m=null}
    const sc=$('.day-scroll');if(sc){const r=sc.getBoundingClientRect();if(e.clientY<r.top+30)sc.scrollTop-=8;else if(e.clientY>r.bottom-30)sc.scrollTop+=8}}
  function end(){if(!dr)return;const{id,m,dur}=dr;dr.g.remove();dr.line.remove();dr=null;if(m==null)return;const t=find(id),d=anchor(),e2=m+dur;
    t.block={date:d,start:`${pad(Math.floor(m/60))}:${pad(m%60)}`,end:`${pad(Math.floor(Math.min(e2,1439)/60))}:${pad(Math.min(e2,1439)%60)}`};save();render(false);tick();toast(`${t.title} · ${fmtT(t.block.start)}`)}
  let hold=null;
  document.addEventListener('pointerdown',e=>{const c=e.target.closest('[data-tdrag],.blk.k-block');if(!c)return;const id=c.dataset.tdrag||c.dataset.open;const go=()=>{hold=null;start(e,id)};
    if(e.pointerType==='mouse'&&c.dataset.tdrag){e.preventDefault();go();return}hold={t:setTimeout(go,280),x:e.clientX,y:e.clientY}},true);
  document.addEventListener('pointermove',e=>{if(hold&&Math.hypot(e.clientX-hold.x,e.clientY-hold.y)>8){clearTimeout(hold.t);hold=null}if(dr){e.preventDefault();move(e)}},{passive:false});
  document.addEventListener('pointerup',e=>{if(hold){clearTimeout(hold.t);hold=null}if(dr){e.preventDefault();e.stopPropagation();const was=dr;end();window.__tdragEnd=Date.now()}},true);
  document.addEventListener('click',e=>{if(window.__tdragEnd&&Date.now()-window.__tdragEnd<300){e.stopPropagation();e.preventDefault()}},true);
  document.addEventListener('touchmove',e=>{if(dr)e.preventDefault()},{passive:false});
})();
/* a blocked task's detail gets an "Unschedule" button */
const _openDetailB=openDetail;openDetail=function(id){_openDetailB(id);const e=find(id);if(!e||e.type!=='task'||!e.block)return;const a=$('#sheetBody .sh-actions');if(a)a.insertAdjacentHTML('beforebegin',`<p class="small">🗓 Planned ${esc(fmtLong(e.block.date))}, ${fmtT(e.block.start)}–${fmtT(e.block.end)} <button class="link" data-unblock="${esc(e.id)}">Unschedule</button></p>`)};
document.addEventListener('click',e=>{const b=e.target.closest('[data-unblock]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const t=find(b.dataset.unblock);delete t.block;save();closeSheet();render(false)},true);

/* ======================================================================
   6) FLASHCARDS — spaced repetition (SM-2)
   ====================================================================== */
const CARDS=()=>(db.cards=db.cards||[]);
const dueCards=deck=>CARDS().filter(c=>(!deck||c.deck===deck)&&(c.due||'')<=today());
/* SM-2: q = 1 (again) 3 (hard) 4 (good) 5 (easy). ease ← ease + 0.1 − (5−q)(0.08 + 0.02(5−q)), floor 1.3; interval 1 → 3 → interval × ease */
function sm2(c,q){c.ef=c.ef||2.5;if(q<3){c.reps=0;c.ivl=0}else{c.reps=(c.reps||0)+1;c.ivl=c.reps===1?1:c.reps===2?3:Math.round((c.ivl||1)*c.ef*(q===3?.85:q===5?1.3:1))}
  c.ef=Math.max(1.3,c.ef+.1-(5-q)*(.08+(5-q)*.02));c.due=addDays(c.ivl);c.last=Date.now();return c}
const ivlLabel=(c,q)=>{const x=sm2({...c},q);return x.ivl===0?'today':x.ivl===1?'1 day':x.ivl<30?x.ivl+' days':Math.round(x.ivl/30)+' mo'};
function cardsView(){
  const cs=CARDS(),decks=[...new Set(cs.map(c=>c.deck||'General'))],due=dueCards();
  let h=chipsSub('mind')+heroBanner('Flashcards',`${due.length}`,`card${due.length===1?'':'s'} due today · ${cs.length} total`,decks.slice(0,3).map(d=>[d,dueCards(d).length+' due']),'#FFD27A',
    `<div class="hero-actions"><button class="pill light" data-study=""${due.length?'':' disabled'}>${ic('cards')}Study ${due.length||''}</button><button class="pill glassy" id="cardNew">${ic('plus')}New card</button></div>`);
  if(decks.length)h+=section('Decks',`<div class="decks">${decks.map(d=>{const n=cs.filter(c=>(c.deck||'General')===d).length,du=dueCards(d).length;return`<button class="deck card-s" data-study="${esc(d)}"><b>${esc(d)}</b><small>${n} card${n===1?'':'s'} · ${du} due</small></button>`}).join('')}</div>`);
  h+=section('All cards',cs.length?`<ul class="list card-s">${cs.slice().reverse().slice(0,60).map(c=>`<li class="row"><span class="ico k-cards">${ic('cards')}</span><button class="rowbtn" data-cardedit="${esc(c.id)}"><span class="rt">${c.img?'🖼 ':''}${esc(c.front||'(picture)')}</span><span class="rs">${esc(c.deck||'General')} · next ${c.due<=today()?'today':esc(fmtDate(c.due))}</span></button></li>`).join('')}</ul>`:emptyBox('Make cards here, or lasso something in a notebook and tap “Flashcard”.'));
  return h}
function openCardForm(pre={}){const c=pre.id?CARDS().find(x=>x.id===pre.id):null,v=c||pre,decks=[...new Set(CARDS().map(x=>x.deck||'General'))];
  openSheet(`${sheetHead(c?'Edit <em>card</em>':'New <em>card</em>')}
    <label class="fld"><span>Deck</span><input id="cdDeck" list="cdDecks" value="${esc(v.deck||decks[0]||'')}" placeholder="e.g. ISE 4404"><datalist id="cdDecks">${decks.map(d=>`<option value="${esc(d)}">`).join('')}</datalist></label>
    ${v.img?`<div class="cdimg"><img src="${safeImg(v.img)}" alt="Front"></div>`:''}
    <label class="fld"><span>Front${v.img?' (optional text)':''}</span><textarea id="cdF" rows="2" placeholder="Question">${esc(v.front||'')}</textarea></label>
    <label class="fld"><span>Back</span><textarea id="cdB" rows="3" placeholder="Answer">${esc(v.back||'')}</textarea></label>
    <div class="sh-actions">${c?`<button class="danger" id="cdDel">Delete</button>`:''}<button class="primary" id="cdSave" style="flex:1">Save card</button></div>`);
  $('#sheetBody').dataset.card=c?c.id:'';$('#sheetBody')._img=v.img||null;setTimeout(()=>$('#cdF')?.focus(),400)}
document.addEventListener('click',e=>{const t=e.target.closest('#cardNew,#cdSave,#cdDel,[data-cardedit],[data-study],[data-crate],#crShow,#crClose');if(!t)return;e.preventDefault();e.stopImmediatePropagation();
  if(t.id==='cardNew'){openCardForm();return}
  if(t.dataset.cardedit){openCardForm({id:t.dataset.cardedit});return}
  if(t.id==='cdSave'){const b=$('#sheetBody'),id=b.dataset.card,f=$('#cdF').value.trim(),bk=$('#cdB').value.trim(),deck=$('#cdDeck').value.trim()||'General';if(!f&&!b._img){toast('Add a question');return}
    if(id){Object.assign(CARDS().find(x=>x.id===id),{front:f,back:bk,deck})}else CARDS().push({id:uid(),deck,front:f,back:bk,img:b._img||'',ef:2.5,ivl:0,reps:0,due:today(),created:Date.now()});save();closeSheet();render(false);tick();return}
  if(t.id==='cdDel'){arm(t,'Tap again to delete',()=>{db.cards=CARDS().filter(x=>x.id!==$('#sheetBody').dataset.card);save();closeSheet();render(false)});return}
  if(t.dataset.study!==undefined){study(t.dataset.study||null);return}
  if(t.id==='crShow'){$('#crView').classList.add('flip');return}
  if(t.dataset.crate){const q=+t.dataset.crate,c=CARDS().find(x=>x.id===STUDY.q[0]);sm2(c,q);STUDY.q.shift();if(q<3)STUDY.q.push(c.id);STUDY.done++;save();nextCard();return}
  if(t.id==='crClose'){endStudy();return}
},true);
let STUDY=null;
function study(deck){const q=dueCards(deck).map(c=>c.id);if(!q.length){toast('Nothing due. Nice.');return}STUDY={q,done:0,deck};let v=$('#crWrap');if(!v){v=document.createElement('div');v.id='crWrap';document.body.appendChild(v)}v.hidden=false;requestAnimationFrame(()=>v.classList.add('on'));nextCard()}
function nextCard(){const v=$('#crWrap');if(!STUDY.q.length){v.innerHTML=`<div class="cr-top"><span></span><button class="fv-btn" id="crClose" aria-label="Close">${ic('close')}</button></div><div class="cr-done"><b class="num">${STUDY.done}</b><span>reviews done. See you ${(()=>{const n=CARDS().map(c=>c.due).filter(d=>d>today()).sort()[0];return n?fmtLong(n).toLowerCase():'soon'})()}.</span></div><button class="fv-main" id="crClose">Done</button>`;tick();return}
  const c=CARDS().find(x=>x.id===STUDY.q[0]);
  v.innerHTML=`<div class="cr-top"><span class="cap">${esc(c.deck||'General')} · ${STUDY.q.length} left</span><button class="fv-btn" id="crClose" aria-label="Close">${ic('close')}</button></div>
    <div class="cr-card" id="crView"><div class="cr-f">${c.img?`<img src="${safeImg(c.img)}" alt="">`:''}${c.front?`<p>${esc(c.front)}</p>`:''}</div><div class="cr-b"><p>${esc(c.back||'(no answer written)')}</p></div></div>
    <div class="cr-acts"><button class="fv-main cr-show" id="crShow">Show answer</button>
      <div class="cr-rate">${[[1,'Again','late'],[3,'Hard','soon'],[4,'Good','good'],[5,'Easy','accent']].map(([q,l,k])=>`<button data-crate="${q}" class="k-${k}"><b>${l}</b><small>${ivlLabel(c,q)}</small></button>`).join('')}</div></div>`}
function endStudy(){const v=$('#crWrap');if(!v)return;v.classList.remove('on');setTimeout(()=>{v.hidden=true;v.innerHTML=''},300);STUDY=null;render(false)}
window.addEventListener('life-make-card',e=>{const d=e.detail||{};if(window.NOTES)NOTES.close();setTimeout(()=>openCardForm({img:d.img,deck:d.deck,front:d.text||''}),360)});

/* ======================================================================
   7) TRIPS
   ====================================================================== */
const PACK=['Passport / ID','Phone charger','Headphones','Toothbrush & toothpaste','Medication','Clothes for each day','Sleepwear','Sunglasses','Sunscreen','Swimsuit','Laptop + charger','Travel adapter','Wallet & cards','Water bottle'];
function tripsView(){const ts=of('trip').sort((a,b)=>(a.date||'').localeCompare(b.date||'')),up=ts.filter(t=>!t.end||dayDiff(t.end)>=0),past=ts.filter(t=>t.end&&dayDiff(t.end)<0).reverse(),nx=up[0];
  return chipsSub('mind')+heroBanner('Trips',nx&&nx.date?(dayDiff(nx.date)>0?`${dayDiff(nx.date)}`:'Now'):'—',nx?`${dayDiff(nx.date)>0?'days until ':''}<b>${esc(nx.title)}</b>`:'no trips planned',[['Upcoming',up.length],['Past',past.length]],'#7FD3FF',`<div class="hero-actions"><button class="pill light" data-add="trip">${ic('plus')}Plan a trip</button></div>`)
    +section('Upcoming',list(up,'Plan your next trip: itinerary, packing list and a countdown.'))+(past.length?section('Past',list(past,'')):'')}
function openTrip(id){const e=find(id);if(!e)return;e.itin=e.itin||[];e.pack=e.pack||[];
  const days=[];if(e.date){const n=e.end?Math.max(0,Math.min(30,dayDiff(e.end)-dayDiff(e.date))):0;for(let i=0;i<=n;i++){const d=new Date(e.date+'T12:00');d.setDate(d.getDate()+i);days.push(iso(d))}}
  const spent=e.date?of('expense').filter(x=>x.date>=e.date&&x.date<=(e.end||e.date)).reduce((s,x)=>s+num(x.amount),0):0,n=e.date?dayDiff(e.date):null,packed=e.pack.filter(p=>p.done).length;
  const html=`<div class="sh-h"><div class="lhs"><span class="cap">Trip</span></div><button type="button" class="x" data-close aria-label="Close">${ic('close')}</button></div>
    <div class="trip-hd"><h3>${esc(e.title)}</h3><p>${esc([e.place,e.date?`${fmtLong(e.date)}${e.end?' – '+fmtLong(e.end):''}`:''].filter(Boolean).join(' · '))}</p>
      ${n!=null?`<div class="trip-cd"><b class="num">${n>0?n:n===0?'Today':'Now'}</b><span>${n>0?`day${n===1?'':'s'} to go`:n===0?'you leave':'enjoy it'}</span></div>`:''}</div>
    <div class="gsum"><div><b class="num">${packed}/${e.pack.length}</b><span>packed</span></div><div><b class="num">${money(Math.round(spent))}</b><span>spent during trip</span></div><div><b class="num">${e.itin.length}</b><span>plans</span></div></div>
    <div class="set-grp">Itinerary</div>
    ${(days.length?days:['']).map(d=>{const it=e.itin.filter(x=>(x.d||'')===d).sort((a,b)=>(a.t||'').localeCompare(b.t||''));return`<div class="itd"><b>${d?esc(wdOf(d)+' '+fmtDate(d)):'Plans'}</b>${it.map(x=>`<div class="iti"><span class="num">${x.t?fmtT(x.t):''}</span><span>${esc(x.text)}</span><button class="x" data-itdel="${e.id}|${x.id}" aria-label="Remove">${ic('close')}</button></div>`).join('')}</div>`}).join('')}
    <form class="gadd" data-itadd="${esc(e.id)}"><select name="d">${(days.length?days:['']).map(d=>`<option value="${d}">${d?esc(wdOf(d).slice(0,3)+' '+fmtDate(d)):'Any day'}</option>`).join('')}</select><input name="t" type="time"><input name="text" placeholder="e.g. Old San Juan walking tour" required><button class="primary" type="submit">Add</button></form>
    <div class="set-grp">Packing <small>${packed} of ${e.pack.length}</small></div>
    <div class="pack">${e.pack.map(p=>`<button class="pk${p.done?' on':''}" data-pk="${e.id}|${p.id}"><i>${p.done?ic('check'):''}</i>${esc(p.text)}</button>`).join('')}</div>
    <form class="gadd" data-pkadd="${esc(e.id)}"><input name="text" placeholder="Add an item" required><button class="primary" type="submit">Add</button>${e.pack.length?'':`<button class="secondary" type="button" data-pkdef="${esc(e.id)}">Use the usual list</button>`}</form>
    <div class="sh-actions"><button class="primary" data-edit="${esc(e.id)}">${ic('edit')}Edit trip</button></div>`;
  if(!wrap.hidden&&wrap.classList.contains('open')&&$('#sheetBody .trip-hd')){const st=$('.sheet').scrollTop;$('#sheetBody').innerHTML=html;$('.sheet').scrollTop=st}else openSheet(html)}
document.addEventListener('submit',e=>{const f=e.target;if(f.dataset.itadd){e.preventDefault();const t=find(f.dataset.itadd),fd=new FormData(f);t.itin=t.itin||[];t.itin.push({id:uid(),d:fd.get('d')||'',t:fd.get('t')||'',text:String(fd.get('text')).trim()});save();openTrip(t.id)}
  if(f.dataset.pkadd){e.preventDefault();const t=find(f.dataset.pkadd),fd=new FormData(f);t.pack=t.pack||[];t.pack.push({id:uid(),text:String(fd.get('text')).trim(),done:false});save();openTrip(t.id)}},true);
document.addEventListener('click',e=>{const b=e.target.closest('[data-itdel],[data-pk],[data-pkdef]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
  if(b.dataset.itdel){const[id,x]=b.dataset.itdel.split('|'),t=find(id);t.itin=t.itin.filter(i=>i.id!==x);save();openTrip(id);return}
  if(b.dataset.pk){const[id,x]=b.dataset.pk.split('|'),t=find(id),p=t.pack.find(i=>i.id===x);p.done=!p.done;save();openTrip(id);if(p.done&&t.pack.every(i=>i.done)){tick();toast('All packed ✈️')}return}
  if(b.dataset.pkdef){const t=find(b.dataset.pkdef);t.pack=PACK.map(x=>({id:uid(),text:x,done:false}));save();openTrip(t.id)}},true);

/* ======================================================================
   8) PEOPLE & FOLLOW-UPS on job applications
   ====================================================================== */
const _openJobM=openJob;openJob=function(id){_openJobM(id);const e=find(id);if(!e)return;e.people=e.people||[];const b=$('#sheetBody .sh-actions');if(!b)return;
  b.insertAdjacentHTML('beforebegin',`<div class="set-grp">People <small>${e.people.length?'':'recruiters, referrals, interviewers'}</small></div>
    <div class="ppl">${e.people.map(p=>{const due=p.follow&&!p.done?dayDiff(p.follow):null;return`<div class="pp"><span class="ico k-job">${ic('person')}</span><span class="ppm"><b>${esc(p.name)}</b><small>${esc([p.role,p.how,p.follow?(p.done?'followed up':`follow up ${relDue(p.follow)}`):''].filter(Boolean).join(' · '))}</small></span>
      ${p.follow&&!p.done?`<button class="link${due!=null&&due<=0?' late':''}" data-ppdone="${e.id}|${p.id}">${ic('check')}Done</button>`:''}<button class="x" data-ppdel="${e.id}|${p.id}" aria-label="Remove">${ic('close')}</button></div>`}).join('')}</div>
    <form class="gadd" data-ppadd="${esc(e.id)}"><input name="name" placeholder="Name" required><input name="role" placeholder="Role (e.g. Recruiter)"><input name="how" placeholder="How you met"><label class="fld2"><span>Follow up</span><input name="follow" type="date" value="${addDays(5)}"></label><button class="primary" type="submit">Add</button></form>`)};
document.addEventListener('submit',e=>{const f=e.target;if(!f.dataset.ppadd)return;e.preventDefault();const j=find(f.dataset.ppadd),fd=new FormData(f);j.people=j.people||[];j.people.push({id:uid(),name:String(fd.get('name')).trim(),role:fd.get('role')||'',how:fd.get('how')||'',follow:fd.get('follow')||'',done:false,met:today()});save();pushSchedule(true);openJob(j.id);tick()},true);
document.addEventListener('click',e=>{const b=e.target.closest('[data-ppdone],[data-ppdel]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const[id,x]=(b.dataset.ppdone||b.dataset.ppdel).split('|'),j=find(id);
  if(b.dataset.ppdone){const p=j.people.find(i=>i.id===x);p.done=true;p.followedAt=today();tick()}else j.people=j.people.filter(i=>i.id!==x);save();pushSchedule(true);openJob(id)},true);
function followUps(days=7){const out=[];of('job').forEach(j=>(j.people||[]).forEach(p=>{if(p.follow&&!p.done&&dayDiff(p.follow)<=days)out.push({p,j})}));return out.sort((a,b)=>a.p.follow.localeCompare(b.p.follow))}
const _viewJobsM=viewJobs;viewJobs=function(){const h=_viewJobsM(),fu=followUps(14);if(!fu.length)return h;
  const sec=section('Follow <em>up</em>',`<div class="card-s rvcard">${fu.map(({p,j})=>`<div class="exrow2"><span class="cdn"><b class="num">${Math.abs(dayDiff(p.follow))}</b><small>${dayDiff(p.follow)<0?'late':'days'}</small></span><span class="exm2"><b>${esc(p.name)}</b><small>${esc([p.role,j.title].filter(Boolean).join(' · '))}</small></span><button class="link" data-open="${esc(j.id)}">Open</button></div>`).join('')}</div>`);
  const i=h.indexOf('<section class="sec">');return i<0?h+sec:h.slice(0,i)+sec+h.slice(i)};

/* ======================================================================
   wiring into tabs, Today, detail sheets and notifications
   ====================================================================== */
const _viewWorkM=viewWork;viewWork=function(){const k=state.sub.work;if(k==='grades')return gradesView();if(k==='expense')return moneyView();return _viewWorkM()};
const _viewMindM=viewMind;viewMind=function(){const k=state.sub.mind;if(k==='cards')return cardsView();if(k==='trip')return tripsView();return _viewMindM()};
const _openDetailT=openDetail;openDetail=function(id){const e=find(id);if(e&&e.type==='trip')return openTrip(id);return _openDetailT(id)};
function comingUp(){const items=[];
  examsAhead(14).forEach(x=>items.push({d:x.date,html:`<span class="cdn"><b class="num">${dayDiff(x.date)}</b><small>days</small></span><span class="exm2"><b>${esc(x.name)}</b><small>${esc(x.cls.title)} exam</small></span><button class="link" data-studyplan="${x.cls.id}|${x.id}">${ic('block')}Plan</button>`}));
  of('trip').filter(t=>t.date&&dayDiff(t.date)>=0&&dayDiff(t.date)<=45).forEach(t=>items.push({d:t.date,html:`<span class="cdn"><b class="num">${dayDiff(t.date)}</b><small>days</small></span><span class="exm2"><b>${esc(t.title)}</b><small>${(t.pack||[]).length?`${(t.pack||[]).filter(p=>p.done).length}/${t.pack.length} packed`:'trip'}</small></span><button class="link" data-open="${esc(t.id)}">Open</button>`}));
  followUps(3).forEach(({p,j})=>items.push({d:p.follow,html:`<span class="cdn"><b class="num">${Math.abs(dayDiff(p.follow))}</b><small>${dayDiff(p.follow)<0?'late':'days'}</small></span><span class="exm2"><b>Follow up: ${esc(p.name)}</b><small>${esc(j.title)}</small></span><button class="link" data-open="${esc(j.id)}">Open</button>`}));
  const due=dueCards().length;if(due)items.push({d:today(),html:`<span class="cdn"><b class="num">${due}</b><small>cards</small></span><span class="exm2"><b>Flashcards due</b><small>about ${Math.max(1,Math.round(due*.3))} min</small></span><button class="link" data-study="">Study</button>`});
  if(!items.length)return'';return section('Coming <em>up</em>',`<div class="card-s rvcard">${items.sort((a,b)=>a.d.localeCompare(b.d)).map(x=>`<div class="exrow2">${x.html}</div>`).join('')}</div>`)}
const _viewTodayM=viewToday;viewToday=function(){const H=new Set(db.settings.todayHide||[]),on=k=>!H.has(k);let h=_viewTodayM();
  const hero=h.indexOf('<section class="hero'),afterHero=hero<0?0:h.indexOf('</section>',hero)+10;
  const inject=(on('quick')?quickBar('qcToday'):'')+(on('coming')?comingUp():'');h=h.slice(0,afterHero)+inject+h.slice(afterHero);
  if(on('insights')){const i=h.indexOf('<section class="sec"><div class="sec-h"><h2>Due');const ins=insightSection();h=i<0?h+ins:h.slice(0,i)+ins+h.slice(i)}
  return h};
const _buildScheduleM=buildSchedule;buildSchedule=function(){const out=_buildScheduleM(),now=Date.now(),lim=now+7*864e5;
  const add=(id,dt,title,body)=>{const t=dt.getTime();if(t>now-6e4&&t<lim)out.push({id,at:dt.toISOString(),title,body,url:APP_URL,tag:id})};
  followUps(7).forEach(({p,j})=>add(`pp:${p.id}`,atLocal(p.follow,'09:00'),`Follow up with ${p.name}`,`${j.title}${p.role?' · '+p.role:''}`));
  examsAhead(7).forEach(x=>{add(`ex:${x.id}:1`,atLocal(addDays(Math.max(0,dayDiff(x.date)-1)),'19:00'),`${x.name} is ${dayDiff(x.date)<=1?'tomorrow':'coming up'}`,x.cls.title)});
  for(let i=0;i<7;i++){const d=addDays(i);of('task').filter(e=>e.block&&e.block.date===d&&!e.done).forEach(e=>add(`bl:${e.id}:${d}`,new Date(atLocal(d,e.block.start)-5*6e4),e.title,`Starts at ${fmtT(e.block.start)}`))}
  if(dueCards().length)add('fc:'+today(),atLocal(today(),'20:30'),`${dueCards().length} flashcards due`,'A few minutes keeps them stuck.');
  return out.sort((a,b)=>a.at.localeCompare(b.at)).slice(0,300)};
document.addEventListener('click',e=>{const b=e.target.closest('[data-panel="quick"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();openQuickSetup()},true);
document.addEventListener('click',e=>{if(!e.target.closest('[data-showall]'))return;e.preventDefault();e.stopImmediatePropagation();LIST_ALL=true;DATA_VER++;render(false);setTimeout(()=>{LIST_ALL=false},50)},true);

/* ===================== sync status: what this device has vs the server ===================== */
async function openSyncStatus(){
  NAV_DIR=1;openSheet(`${sheetHead('Sync <em>status</em>','conn')}<div id="ssOut"><p class="hint">Checking…</p></div>`);
  const local=db.entries.filter(e=>!e.sample).length,tombs=Object.keys(db.tomb||{}).length;let srv=null,err='';
  try{srv=await api('/sync/status')}catch(e){err=e.message}
  const row=(ok,l,v)=>`<div class="trow" style="cursor:default"><span>${ok===null?'':ok?'✅ ':'⚠️ '}${l}<small>${v}</small></span></div>`;
  const el=$('#ssOut');if(!el)return;
  el.innerHTML=row(syncAllowed(),'This device',!syncAllowed()?(LOCK&&LOCK.key?'Sync is off because a passcode is on':SYNC.syncOn===false?'Sync is switched off':'Not connected to a server'):`ID ${esc(DEVICE)} · version ${SYNCST.ver||'—'} · ${local} entries${tombs?` · ${tombs} deleted`:''}`)
    +row(LIVE.state==='live',`Live link`,LIVE.state==='live'?`Connected · ${LIVE.devices||1} device${(LIVE.devices||1)===1?'':'s'} online · changes arrive instantly`:LIVE.state==='connecting'?'Connecting…':'Not connected (checks every 20 s instead)')
    +(srv?row(srv.ver===SYNCST.ver,'Server',`version ${srv.ver} · ${srv.entries} entries${srv.tombs?` · ${srv.tombs} deleted`:''} · saved ${esc(ago(srv.ts))}`):row(false,'Server',esc(err||'unreachable')))
    +row(!SYNCST.err,'Last sync',SYNCST.err?`Failed: ${esc(SYNCST.err)}`:SYNCST.lastAt?`${esc(ago(SYNCST.lastAt))}${SYNCST.pulledAt?` · last brought in changes ${esc(ago(SYNCST.pulledAt))}`:''}`:'Not yet')
    +`<div class="sh-actions"><button class="primary" id="ssNow" style="flex:1">Sync now</button><button class="secondary" id="ssFull">Merge everything</button></div>
    <p class="small">Both devices should show the same server version within a few seconds of a change. “Merge everything” re-reads the whole server copy and combines it with this device. Anything deleted on one device stays deleted.</p>`}
document.addEventListener('click',async e=>{const b=e.target.closest('[data-panel="syncstat"],#ssNow,#ssFull');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
  if(b.id==='ssNow'||b.id==='ssFull'){b.textContent='Syncing…';await syncNow(b.id==='ssFull');liveConnect();toast(SYNCST.err?'Sync failed: '+SYNCST.err:'Synced');openSyncStatus();return}
  openSyncStatus()},true);
