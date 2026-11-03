/* ===================== Nov 2: Recomp — the cut from 199 to 180–185 lb, losing fat while building muscle back =====================
   First sub-tab of Health. Everything is read from what the app already has: weigh-ins, MacroFactor (via Apple Health → your
   server), Fitbit burn + steps, the Life food log and workouts. New data: db.settings.journey (targets) and db.jwaist (waist). */
const JRN=()=>{const s=db.settings;if(!s.journey||typeof s.journey!=='object')s.journey={};const j=s.journey;
  const D={start:'2026-11-02',startW:199,lo:180,hi:185,protein:180,steps:10000,gymDays:4,remind:true,kcal:''};
  for(const k in D)if(j[k]===undefined)j[k]=D[k];return j};
const jKcal=()=>num(JRN().kcal)||num(db.settings.kcal)||2200;
const jGoal=()=>(num(JRN().lo)+num(JRN().hi))/2;
const jWaist=()=>(db.jwaist=Array.isArray(db.jwaist)?db.jwaist:[]);
const wkStart=s=>{const d=new Date(s+'T00:00');d.setDate(d.getDate()-((d.getDay()+6)%7));return iso(d)};

/* one day, from every source: MacroFactor totals (Apple Health) win over the Life food log so nothing is counted twice */
function jDay(d){
  const h=(typeof hday==='function'&&hday(d))||{},foods=of('food').filter(e=>e.date===d),own=foods.filter(e=>e.src!=='mf');
  const mf=num(h.kcal)||0,ownK=sumKcal(own),eaten=mf>0?mf:(ownK||sumKcal(foods));
  const prot=num(h.protein)>0?num(h.protein):sumProt(own.length?own:foods);
  const burn=num(h.burnKcal)||0,steps=num(h.steps)||0,gym=of('workout').filter(e=>e.date===d);
  const ws=of('weight').filter(e=>e.date===d).map(e=>num(e.value)).filter(v=>v>0);
  return{d,eaten,src:mf>0?'MacroFactor':eaten?'Life log':'',prot,burn,def:burn&&eaten?burn-eaten:null,steps,gym,w:ws.length?ws[ws.length-1]:null}}

/* trend from the start of the cut only, seeded at the start weight (so an older, lower trend can't fake progress) */
function jTrend(){const J=JRN(),pts=[{date:J.start,v:num(J.startW),t:num(J.startW)}];
  const daily=dailyWeights(weights().filter(e=>e.date>=J.start));let t=num(J.startW),prev=new Date(J.start+'T00:00').getTime();
  for(const e of daily){const d=new Date(e.date+'T00:00').getTime(),dd=Math.max(1,Math.round((d-prev)/864e5));t=e.date===J.start?e.value:t+(1-Math.pow(.9,dd))*(e.value-t);prev=d;
    if(e.date===J.start){pts[0]={date:e.date,v:e.value,t:e.value}}else pts.push({date:e.date,v:e.value,t})}
  return pts}
function jRate(tr){const p=tr.filter(x=>x.date>=addDays(-21)).map(x=>({x:new Date(x.date+'T00:00').getTime()/864e5,y:x.t}));
  if(p.length<3||p[p.length-1].x-p[0].x<6)return null;const n=p.length,mx=p.reduce((s,q)=>s+q.x,0)/n,my=p.reduce((s,q)=>s+q.y,0)/n,sxx=p.reduce((s,q)=>s+(q.x-mx)**2,0);
  return sxx?p.reduce((s,q)=>s+(q.x-mx)*(q.y-my),0)/sxx*7:null}

/* gym: sessions this week, and how many weeks in a row hit the target (this week counts once it's hit) */
function jGym(){const J=JRN(),wo=of('workout').filter(e=>e.date&&dayDiff(e.date)<=0),by={};
  for(const e of wo){const k=wkStart(e.date);(by[k]=by[k]||new Set()).add(e.date)}
  const thisW=wkStart(today()),cnt=k=>(by[k]?by[k].size:0),now=cnt(thisW);let streak=now>=J.gymDays?1:0;
  for(let i=1;i<60;i++){const k=wkStart(addDays(-7*i));if(cnt(k)>=J.gymDays)streak++;else break}
  let dayStreak=0;for(let i=0;i<120;i++){const d=addDays(-i);if(wo.some(e=>e.date===d))dayStreak++;else if(i===0)continue;else break}
  return{now,streak,dayStreak,total:wo.filter(e=>e.date>=J.start).length}}

/* pixel log: one square per day, coloured by how well that day went on the chosen metric */
const JMET=[['all','All goals'],['kcal','Calories'],['def','Deficit'],['prot','Protein'],['steps','Steps'],['gym','Gym']];
let JM=(()=>{try{return localStorage.getItem('lifeJMet')||'all'}catch(e){return'all'}})(),JRG=(()=>{try{return+(localStorage.getItem('lifeJRange'))||5}catch(e){return 5}})();
function jScore(x,m){const J=JRN(),T=jKcal();
  const kc=x.eaten?(Math.abs(x.eaten-T)<=150?4:x.eaten<T?(x.eaten>T-500?3:2):(x.eaten<=T+300?2:1)):0;
  const pr=x.prot?(x.prot>=J.protein?4:x.prot>=J.protein*.85?3:x.prot>=J.protein*.7?2:1):0;
  const st=x.steps?(x.steps>=J.steps?4:x.steps>=J.steps*.75?3:x.steps>=J.steps*.5?2:1):0;
  const df=x.def==null?0:x.def>=500?4:x.def>=250?3:x.def>=0?2:1,gy=x.gym.length?4:0;
  if(m==='kcal')return kc;if(m==='prot')return pr;if(m==='steps')return st;if(m==='def')return df;if(m==='gym')return gy;
  const hits=[kc>=3,pr>=3,st>=3,gy>0||df>=3].filter(Boolean).length,any=x.eaten||x.prot||x.steps||x.gym.length;return any?Math.max(1,hits):0}
function jPixel(){
  const weeks=JRG,d0=new Date(wkStart(today())+'T00:00');d0.setDate(d0.getDate()-(weeks-1)*7);
  const days=[];for(let i=0;i<weeks*7;i++){const d=new Date(d0);d.setDate(d0.getDate()+i);days.push(iso(d))}
  const cell=s=>{if(dayDiff(s)>0)return`<button class="fut" aria-hidden="true" tabindex="-1"></button>`;const x=jDay(s),v=jScore(x,JM);
    return`<button class="${v?'l'+v:''}${s===today()?' now':''}${s===JRN().start?' st':''}" data-jd="${s}" aria-label="${esc(fmtLong(s))}"></button>`};
  let grid;
  if(weeks<=6){const hd=['M','T','W','T','F','S','S'].map(x=>`<span class="cap">${x}</span>`).join('');
    grid=`<div class="jhm" style="--rows:${weeks}">${hd}${days.map(cell).join('')}</div>`}
  else{let cells='',lastM=-1;for(let w=0;w<weeks;w++){const dd=new Date(days[w*7]+'T00:00'),m=dd.getMonth();cells+=`<span class="mo">${m!==lastM?dd.toLocaleDateString(undefined,{month:'short'}):''}</span>`;lastM=m;for(let k=0;k<7;k++)cells+=cell(days[w*7+k])}
    grid=`<div class="hm" style="grid-template-columns:repeat(${weeks},minmax(0,1fr))">${cells}</div>`}
  const hit=days.filter(s=>dayDiff(s)<=0&&jScore(jDay(s),JM)>=3).length,past=days.filter(s=>dayDiff(s)<=0).length;
  const lg={all:'goals hit',kcal:'on target',def:'deficit',prot:'protein',steps:'steps',gym:'gym days'}[JM];
  return section('The <em>log</em>',`<div class="heat card-s jheat">
    <div class="jm-chips">${JMET.map(([k,l])=>`<button class="chip${k===JM?' on':''}" data-jmet="${k}">${l}</button>`).join('')}</div>
    <div class="heat-top"><span class="cap num">${hit}/${past} days · ${lg}</span><div class="seg2" style="width:196px">${[[1,'W'],[5,'M'],[13,'3M'],[26,'6M']].map(([n,l])=>`<button data-jrg="${n}" aria-pressed="${JRG===n}">${l}</button>`).join('')}</div></div>
    ${grid}
    <div class="legend"><span class="cap">Missed</span><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><span class="cap">Nailed</span></div></div>`)}

function jDaySheet(s){const x=jDay(s),J=JRN(),T=jKcal(),tr=jTrend().find(p=>p.date===s);
  const row=(k,v,sub)=>`<div class="jd-r"><span>${k}</span><b class="num">${v}</b>${sub?`<small>${sub}</small>`:''}</div>`;
  openSheet(`${sheetHead(`${esc(wdOf(s))} <em>${esc(fmtDate(s))}</em>`)}<div class="card-s jd">
    ${row('Eaten',x.eaten?fmtN(Math.round(x.eaten))+' kcal':'—',x.src?`${esc(x.src)} · target ${fmtN(T)}`:'')}
    ${row('Burned',x.burn?fmtN(x.burn)+' kcal':'—',x.burn?'Fitbit':'')}
    ${row(x.def!=null&&x.def<0?'Surplus':'Deficit',x.def==null?'—':`${fmtN(Math.abs(Math.round(x.def)))} kcal`,x.def==null?'needs MacroFactor + Fitbit for the day':x.def>=0?`ate less than you burned · ≈${(x.def/3500).toFixed(2)} lb fat`:'ate more than you burned')}
    ${row('Protein',x.prot?Math.round(x.prot)+' g':'—',`goal ${J.protein} g`)}
    ${row('Steps',x.steps?fmtN(x.steps):'—',`goal ${fmtN(J.steps)}`)}
    ${row('Gym',x.gym.length?esc(x.gym.map(g=>g.title||'Workout').join(', ')):'Rest','')}
    ${row('Weight',x.w?x.w.toFixed(1)+' lb':'—',tr?`trend ${tr.t.toFixed(1)}`:'')}</div>`)}

/* ---- the screen ---- */
function journeyView(){
  const J=JRN(),T=jKcal(),tr=jTrend(),last=tr[tr.length-1],cur=last.t,lost=num(J.startW)-cur,goal=jGoal(),toGo=Math.max(0,cur-num(J.hi)),rate=jRate(tr);
  const pct=Math.max(0,Math.min(1,(num(J.startW)-cur)/(num(J.startW)-goal)));
  const wks=Math.max(1,Math.round((Date.now()-new Date(J.start+'T00:00').getTime())/(7*864e5)));
  const lastW=tr.length>1?tr[tr.length-1]:null;
  let h=chipsSub('health')+heroBanner(`Road to <em>${num(J.lo)}–${num(J.hi)}</em>`,cur.toFixed(1),
    `lb trend · ${lost>=.05?`<b>${lost.toFixed(1)} lb</b> down since ${esc(fmtDate(J.start))}`:`started at <b>${num(J.startW)}</b> on ${esc(fmtDate(J.start))}`}`,
    [['To go',toGo>0?toGo.toFixed(1):'in range'],['Rate / wk',rate==null?'—':`${rate>0?'+':'−'}${Math.abs(rate).toFixed(1)}`],['Week',wks]],'#FF9A6B',
    `<div class="hero-actions"><button class="pill light" data-add="weight">${ic('weight')}Weigh in</button><button class="pill glassy" id="jGymBtn">${ic('workout')}Log gym</button><button class="pill glassy" id="jSet">${ic('gear')}Targets</button></div>`);

  /* progress bar: start → goal zone */
  const span=num(J.startW)-num(J.lo)+2,xp=v=>Math.max(0,Math.min(100,(num(J.startW)-v)/span*100));
  const eta=rate&&rate<-.1&&toGo>0?addDays(Math.ceil(toGo/Math.abs(rate)*7)):null;
  const pr=num(J.startW)*.01,pace=rate==null?'Weigh in most mornings — the pace shows after about a week.':rate>=0?'Trend isn’t moving down yet. Check calories are logged every day.':Math.abs(rate)>pr*1.05?`Losing ${Math.abs(rate).toFixed(1)} lb/wk — faster than ~1% of bodyweight a week, which risks muscle. Eat ~150 kcal more and keep protein high.`:Math.abs(rate)<pr*.45?`Losing ${Math.abs(rate).toFixed(1)} lb/wk — slower than ~0.5% a week. Trim ~150 kcal or add steps.`:`Losing ${Math.abs(rate).toFixed(1)} lb/wk — inside the 0.5–1% a week range that keeps muscle.`;
  h+=section('Progress',`<div class="card-s jprog"><div class="jbar"><i style="width:${(pct*100).toFixed(1)}%"></i><em style="left:${xp(num(J.hi))}%;right:${100-xp(num(J.lo))}%"></em><b style="left:${xp(cur)}%"></b></div>
    <div class="jax"><span>${num(J.startW)}</span><span>goal ${num(J.lo)}–${num(J.hi)}</span></div>
    <p class="jmsg">${pace}${eta?` At this pace you reach ${num(J.hi)} around <b>${esc(fmtLong(eta))}</b>.`:''}</p></div>`);

  /* today */
  const x=jDay(today()),g=jGym(),hT=(typeof hday==='function'&&hday(today()))||{};
  h+=section('Today',`<div class="tiles jtiles">
    <div class="tile card-s">${ring(x.eaten/T,'food')}<div><b class="num">${x.eaten?fmtN(Math.round(x.eaten)):'—'}<small>/${fmtN(T)}</small></b><div class="cap">Eaten${x.src==='MacroFactor'?' · MF':''}</div></div></div>
    <div class="tile card-s">${ring(x.burn?Math.min(1,x.burn/3000):0,'activity')}<div><b class="num">${x.burn?fmtN(x.burn):'—'}</b><div class="cap">Burned</div></div></div>
    <div class="tile card-s">${ring(x.def!=null?Math.max(0,Math.min(1,x.def/750)):0,'weight')}<div><b class="num">${x.def==null?'—':fmtN(Math.abs(Math.round(x.def)))}</b><div class="cap">${x.def!=null&&x.def<0?'Surplus':'Deficit'}</div></div></div>
    <div class="tile card-s">${ring(x.prot/J.protein,'food')}<div><b class="num">${x.prot?Math.round(x.prot):'—'}<small>/${J.protein}g</small></b><div class="cap">Protein</div></div></div>
    <div class="tile card-s">${ring(x.steps/J.steps,'workout')}<div><b class="num">${x.steps?fmtN(x.steps):'—'}</b><div class="cap">Steps</div></div></div>
    <div class="tile card-s">${ring(g.now/J.gymDays,'workout')}<div><b class="num">${g.now}<small>/${J.gymDays}</small></b><div class="cap">Gym · week</div></div></div>
  </div>${!x.src||x.src!=='MacroFactor'?`<p class="small jnote">${num(hT.kcal)?'':'MacroFactor calories show up here once the Apple Health shortcut has run today (Settings → Connections → Fitbit &amp; Apple Health).'}</p>`:''}`);

  /* streaks */
  h+=section('Streaks',`<div class="card-s jstreak">
    <div><b class="num">${g.streak}</b><span>week${g.streak===1?'':'s'} at ${J.gymDays}+ gym days</span></div>
    <div><b class="num">${g.dayStreak}</b><span>day${g.dayStreak===1?'':'s'} trained in a row</span></div>
    <div><b class="num">${g.total}</b><span>sessions since ${esc(fmtDate(J.start))}</span></div></div>`);

  h+=jPixel();
  h+=jGymCard();

  /* weekly check-in */
  const wkRows=[];for(let i=0;i<6;i++){const ws=wkStart(addDays(-7*i));if(ws<wkStart(J.start))break;const ds=[...Array(7)].map((_,k)=>{const d=new Date(ws+'T00:00');d.setDate(d.getDate()+k);return iso(d)}).filter(d=>dayDiff(d)<=0);
    const xs=ds.map(jDay),av=f=>{const v=xs.map(f).filter(n=>n);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null};
    const tw=[...tr].reverse().find(p=>p.date<=ds[ds.length-1]&&p.date>=ws);
    wkRows.push({ws,w:tw?tw.t:null,k:av(z=>z.eaten),p:av(z=>z.prot),s:av(z=>z.steps),def:av(z=>z.def),gym:new Set(xs.filter(z=>z.gym.length).map(z=>z.d)).size})}
  h+=section('Weekly <em>check-in</em>',`<div class="card-s jweeks"><div class="jw-h"><span>Week of</span><span>Trend</span><span>Kcal</span><span>Prot</span><span>Steps</span><span>Gym</span></div>
    ${wkRows.map(r=>`<div class="jw-r"><span>${esc(fmtDate(r.ws))}</span><b class="num">${r.w?r.w.toFixed(1):'—'}</b><span class="num">${r.k?fmtN(Math.round(r.k)):'—'}</span><span class="num">${r.p?Math.round(r.p):'—'}</span><span class="num">${r.s?(r.s/1000).toFixed(1)+'k':'—'}</span><span class="num">${r.gym}</span></div>`).join('')}
    <p class="small" style="margin:8px 0 0;opacity:.75">Daily averages for days with data. Trend = smoothed weight at the end of the week.</p></div>`);

  /* waist: the recomp check (weight alone can't tell fat from muscle) */
  const W=jWaist().slice().sort((a,b)=>a.date.localeCompare(b.date)),w0=W[0],wl=W[W.length-1];
  h+=section('Waist',`<div class="card-s jwaist"><div class="jw-top"><div><b class="num">${wl?num(wl.in).toFixed(1):'—'}<small> in</small></b><span>${wl?`${esc(fmtDate(wl.date))}${w0&&w0!==wl?` · ${(num(wl.in)-num(w0.in)>0?'+':'−')}${Math.abs(num(wl.in)-num(w0.in)).toFixed(1)} since ${esc(fmtDate(w0.date))}`:''}`:'Measure at the navel, relaxed, once a week'}</span></div>
    <form id="jWaistF" class="jw-in"><input name="in" type="number" inputmode="decimal" step="0.1" placeholder="inches" aria-label="Waist in inches"><button class="secondary" type="submit">Log</button></form></div>
    <p class="small" style="margin:8px 0 0;opacity:.75">Weight down + waist down = fat loss. Weight flat + waist down = recomp working (fat out, muscle in).</p></div>`);
  return h}

function jGymCard(){
  const today_=of('workout').filter(e=>e.date===today());
  const G=[['Chest','chest'],['Back','back'],['Shoulders','shoulders'],['Arms','arms'],['Legs','legs'],['Core','core'],['Cardio','cardio']];
  return section('What did you <em>hit</em>?',`<div class="card-s jgym">${today_.length?`<p class="small" style="margin:0 0 10px">Today: <b>${esc(today_.map(w=>w.title||'Workout').join(', '))}</b></p>`:''}
    <div class="jg-chips">${G.map(([l,k])=>`<button class="chip" data-jg="${l}" aria-pressed="false">${l}</button>`).join('')}</div>
    <div class="jg-row"><label class="jg-min"><input id="jgMin" type="number" inputmode="numeric" value="60" aria-label="Minutes"><span>min</span></label><button class="primary" id="jgSave" disabled>Log session</button><button class="secondary" data-add="workout">Full logger</button></div></div>`)}

function jSettings(){const J=JRN();
  openSheet(`${sheetHead('Recomp <em>targets</em>')}<div class="qa" style="grid-template-columns:1fr 1fr">
    ${[['start','Start date','date',J.start],['startW','Start weight (lb)','number',J.startW],['lo','Goal low (lb)','number',J.lo],['hi','Goal high (lb)','number',J.hi],['kcal','Calories / day','number',J.kcal||jKcal()],['protein','Protein (g)','number',J.protein],['steps','Steps / day','number',J.steps],['gymDays','Gym days / week','number',J.gymDays]]
      .map(([k,l,t,v])=>`<label class="fld"><span>${l}</span><input data-jset="${k}" type="${t}" ${t==='number'?'inputmode="decimal" step="any"':''} value="${esc(v)}"></label>`).join('')}</div>
    ${trow('id="jRem"',!!J.remind,'Weigh-in reminder','8:00 AM each day until you’ve weighed in')}
    <p class="small">Match Calories to MacroFactor’s daily target so the log colours mean the same thing in both apps.</p>
    <div class="sh-actions"><button class="primary" id="jSave" style="flex:1">Save</button></div>`)}

/* weigh-in reminders: today's and tomorrow's 8 AM reminder exist while the setting is on; a weigh-in ticks them off */
function jReminders(){const J=JRN();if(isLocked())return;let ch=false;
  for(const d of[today(),addDays(1)]){const id='jw-'+d,ex=find(id),weighed=of('weight').some(e=>e.date===d);
    if(!J.remind||d<J.start){if(ex&&!ex.done){db.entries=db.entries.filter(e=>e.id!==id);ch=true}continue}
    if(!ex&&!weighed&&(d!==today()||new Date().getHours()<11)){db.entries.push({id,type:'reminder',title:'Weigh in (before eating)',due:d,time:'08:00',importance:'Normal',created:Date.now()});ch=true}
    else if(ex&&!ex.done&&weighed){ex.done=true;ch=true}}
  if(ch)save()}

/* one-time setup for this cut: today's 199 lb weigh-in, the goal weight, and MacroFactor calories feeding the food rings */
function jBoot(){if(isLocked()||!db||!Array.isArray(db.entries))return;const J=JRN(),S=db.settings.seeds=db.settings.seeds||{};
  if(!S.recomp1){S.recomp1=Date.now();
    if(!of('weight').some(e=>e.date===J.start&&!e.sample))db.entries.push({id:uid(),type:'weight',value:num(J.startW),date:J.start,created:Date.now()});
    if(db.settings.goalWeight===''||db.settings.goalWeight==null)db.settings.goalWeight=jGoal();
    state.sub.health='journey';save()}
  try{if(typeof SYNC!=='undefined'&&SYNC.mfImport===undefined){SYNC.mfImport=true;saveSync()}}catch(e){}
  jReminders()}

/* wiring */
if(!TABS.health.subs.some(s=>s[0]==='journey'))TABS.health.subs.unshift(['journey','Recomp']);
state.sub.health='journey';
HWORD['h-journey']='Recomp';HICON['h-journey']='journey';
if(!P.journey)P.journey='<path d="M12 3c1 3 4 4.5 4 8.5a4 4 0 0 1-8 0c0-1.6.7-2.8 1.6-3.8.2 1.6 1 2.6 2 2.8C11 8 11 5.5 12 3z"/><path d="M5 21h14"/>';
{const _vhJ=viewHealth;viewHealth=function(){if(state.sub.health==='journey'){HERO_T='h-journey';try{return journeyView()+sprig('health')}finally{HERO_T=''}}return _vhJ.apply(this,arguments)}}
{const _rJ=render;let booted=false;render=function(){if(!booted&&db&&Array.isArray(db.entries)&&!isLocked()){booted=true;try{jBoot()}catch(e){console.warn('recomp',e)}}return _rJ.apply(this,arguments)}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)try{jReminders()}catch(e){}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-jmet],[data-jrg],[data-jd],#jSet,#jSave,#jGymBtn,[data-jg],#jgSave');if(!b)return;
  e.preventDefault();e.stopImmediatePropagation();const d=b.dataset,keep=()=>{const y=SC.scrollTop;render(false);SC.scrollTop=y};
  if(d.jmet){JM=d.jmet;try{localStorage.setItem('lifeJMet',JM)}catch(x){}keep();return}
  if(d.jrg){JRG=+d.jrg;try{localStorage.setItem('lifeJRange',String(JRG))}catch(x){}keep();return}
  if(d.jd){jDaySheet(d.jd);return}
  if(b.id==='jSet'){jSettings();return}
  if(b.id==='jSave'){const J=JRN();$$('[data-jset]').forEach(i=>{const k=i.dataset.jset;J[k]=i.type==='number'?(i.value===''?'':num(i.value)):i.value});
    const r=$('#jRem');if(r)J.remind=r.getAttribute('aria-pressed')==='true';db.settings.goalWeight=jGoal();save();closeSheet();jReminders();keep();toast('Targets saved');return}
  if(b.id==='jGymBtn'){const s=$('.jgym');if(s)s.scrollIntoView({behavior:'smooth',block:'center'});return}
  if(d.jg){const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));b.classList.toggle('on',on);const sv=$('#jgSave');if(sv)sv.disabled=!$$('[data-jg][aria-pressed="true"]').length;return}
  if(b.id==='jgSave'){const gs=$$('[data-jg][aria-pressed="true"]').map(x=>x.dataset.jg);if(!gs.length)return;const m=num(($('#jgMin')||{}).value)||60;
    db.entries.push({id:uid(),type:'workout',title:gs.join(' + '),date:today(),minutes:m,created:Date.now()});save();tick();keep();
    const g=jGym();toast(`${gs.join(' + ')} logged · ${g.now}/${JRN().gymDays} this week`);return}
},true);
document.addEventListener('click',e=>{const t=e.target.closest('#jRem');if(!t)return;e.preventDefault();e.stopImmediatePropagation();t.setAttribute('aria-pressed',String(t.getAttribute('aria-pressed')!=='true'))},true);
document.addEventListener('submit',e=>{if(e.target.id!=='jWaistF')return;e.preventDefault();const v=num(new FormData(e.target).get('in'));if(!(v>15&&v<80)){toast('Enter inches, e.g. 36.5');return}
  const L=jWaist(),ex=L.find(x=>x.date===today());if(ex)ex.in=v;else L.push({id:uid(),date:today(),in:v});save();const y=SC.scrollTop;render(false);SC.scrollTop=y;toast(`Waist ${v.toFixed(1)} in`)});

(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="jrcss">
.hero.h-journey{background:linear-gradient(158deg,#6A3A24 0%,#43261A 58%,#2C1A13 100%);--hc:#FFB58C}
.hero.h-journey .big{font:700 58px/1 var(--mono);letter-spacing:-.05em}
.k-journey{--c1:#FFB07A;--c2:#D9552E}
.jprog{padding:16px}
.jbar{position:relative;height:14px;border-radius:999px;background:color-mix(in srgb,var(--ink) 9%,var(--surface));overflow:visible}
.jbar>i{position:absolute;left:0;top:0;bottom:0;border-radius:999px;background:linear-gradient(90deg,#D9552E,#FFB07A)}
.jbar>em{position:absolute;top:-3px;bottom:-3px;border-radius:999px;background:rgb(134 207 160 / .28);box-shadow:inset 0 0 0 1.5px rgb(134 207 160 / .8)}
.jbar>b{position:absolute;top:-5px;width:4px;height:24px;margin-left:-2px;border-radius:2px;background:var(--ink);box-shadow:0 0 0 2px rgb(0 0 0 / .35)}
.jax{display:flex;justify-content:space-between;margin-top:8px;font:600 11px var(--mono);color:var(--muted);text-transform:uppercase}
.jmsg{margin:12px 0 0;font-size:14px;line-height:1.45}
.jtiles{grid-template-columns:repeat(3,minmax(0,1fr))!important}
.jnote{margin:8px 2px 0;opacity:.75}
.jstreak{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:14px}
.jstreak>div{display:flex;flex-direction:column;gap:3px;min-width:0}.jstreak b{font-size:30px;letter-spacing:-.03em}.jstreak span{font-size:12px;color:var(--muted);line-height:1.3}
.jm-chips{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 0 10px}.jm-chips::-webkit-scrollbar{display:none}.jm-chips .chip{height:34px;padding:0 12px;font-size:13px;flex:none}
.jhm{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}
.jhm .cap{text-align:center;font-size:10px}
.jhm button{aspect-ratio:1;border-radius:7px;background:color-mix(in srgb,var(--ink) 9%,var(--surface));padding:0}
.jhm button.fut{background:transparent;pointer-events:none;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--ink) 8%,transparent)}
.jhm button.now,.jheat .hm button.now{box-shadow:0 0 0 1.5px var(--ink)}
.jhm button.st,.jheat .hm button.st{outline:2px dashed #FFB07A;outline-offset:1px}
.jheat .jhm button.l1,.jheat .hm button.l1,.jheat .legend .l1{background:#5A2A20}
.jheat .jhm button.l2,.jheat .hm button.l2,.jheat .legend .l2{background:#9A4A2A}
.jheat .jhm button.l3,.jheat .hm button.l3,.jheat .legend .l3{background:#D9773F}
.jheat .jhm button.l4,.jheat .hm button.l4,.jheat .legend .l4{background:#FFB07A}
.jd{padding:6px 14px}.jd-r{display:grid;grid-template-columns:90px 1fr;align-items:baseline;padding:10px 0;border-bottom:1px solid var(--line);gap:2px 10px}.jd-r:last-child{border:0}
.jd-r>span{color:var(--muted);font-size:13px}.jd-r b{font-size:16px}.jd-r small{grid-column:2;color:var(--muted);font-size:12px}
.jgym{padding:14px}.jg-chips{display:flex;flex-wrap:wrap;gap:8px}.jg-chips .chip{height:38px;padding:0 14px}
.jg-chips .chip[aria-pressed="true"]{background:var(--accent);color:var(--accent-ink);border-color:transparent}
.jg-row{display:grid;grid-template-columns:92px 1fr 1fr;gap:8px;margin-top:12px;align-items:center}
.jg-min{display:flex;align-items:center;gap:6px;height:44px;padding:0 12px;border-radius:12px;border:1px solid var(--line);background:var(--bg)}
.jg-min input{width:100%;border:0!important;background:none!important;box-shadow:none!important;padding:0!important;height:auto!important;font:700 16px var(--ui)}.jg-min span{color:var(--muted);font-size:13px}
.jg-row .primary:disabled{opacity:.45}
.jweeks{padding:12px 14px}.jw-h,.jw-r{display:grid;grid-template-columns:1.2fr 1fr 1fr .8fr .9fr .6fr;gap:6px;align-items:baseline}
.jw-h{font:700 10px var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);padding-bottom:6px;border-bottom:1px solid var(--line)}
.jw-r{padding:9px 0;border-bottom:1px solid var(--line);font-size:13.5px}.jw-r:last-of-type{border:0}.jw-r>span:first-child{color:var(--ink2)}
.jwaist{padding:14px}.jw-top{display:flex;justify-content:space-between;align-items:center;gap:12px}.jw-top>div{display:flex;flex-direction:column;gap:2px;min-width:0}
.jw-top b{font-size:28px}.jw-top b small{font-size:13px;color:var(--muted)}.jw-top span{font-size:12.5px;color:var(--muted)}
.jw-in{display:flex;gap:6px;flex:none}.jw-in input{width:88px}
</style>`);
