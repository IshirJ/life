/* ===================== Oct 27 features: rhythm, caffeine, recovery, campus crowds, job board, deadline rings, leave-by for meetings =====================
   Everything here reads the data the app already has (Fitbit days, food log, workouts, injuries, jobs, calendar, grades, buses)
   and renders into existing screens with the same building blocks (section(), .card-s, .cap, .num). New data lives in
   db.caf / db.crowd / db.wakeLog: arrays of {id} objects (or a date map) so sync merges them item by item. */
const hmM=t=>{const m=/^(\d{1,2}):(\d{2})/.exec(t||'');return m?+m[1]*60+ +m[2]:null};
const mClock=m=>{m=((Math.round(m)%1440)+1440)%1440;return fmtT(`${pad(Math.floor(m/60))}:${pad(m%60)}`)};
const nowM=()=>{const d=new Date();return d.getHours()*60+d.getMinutes()+d.getSeconds()/60};
const median=a=>{if(!a.length)return null;const s=[...a].sort((x,y)=>x-y),i=s.length>>1;return s.length%2?s[i]:(s[i-1]+s[i])/2};
const sdev=a=>{if(a.length<2)return 0;const m=a.reduce((s,v)=>s+v,0)/a.length;return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/(a.length-1))};

/* ---------------------------------------------------------------- 1. body rhythm (circadian alignment) */
const wakeLog=()=>(db.wakeLog=db.wakeLog&&typeof db.wakeLog==='object'&&!Array.isArray(db.wakeLog)?db.wakeLog:{});
function rhythmData(){
  const nights=[];
  for(let i=0;i<14;i++){const d=addDays(-i),h=(typeof hday==='function'&&hday(d))||{};
    const w=hmM(h.wake)??hmM(wakeLog()[d]),b=hmM(h.bed);
    if(w==null&&b==null)continue;
    nights.push({d,wake:w,bed:b==null?null:(b<12*60?b+1440:b),sleep:num(h.sleepMin)||0,rhr:num(h.restingHr)||0})}
  if(!nights.length)return null;
  const W=nights.map(n=>n.wake).filter(v=>v!=null),B=nights.map(n=>n.bed).filter(v=>v!=null);
  const uw=median(W),ub=median(B),sw=sdev(W),sb=sdev(B);
  const spread=W.length>1&&B.length>1?(sw+sb)/2:W.length>1?sw:B.length>1?sb:30,score=Math.max(0,Math.min(100,Math.round(100-spread*1.1)));
  // does keeping to the usual bedtime pay off? compare sleep on nights near vs away from it
  let pay=null;if(ub!=null){const near=nights.filter(n=>n.bed!=null&&Math.abs(n.bed-ub)<=30&&n.sleep),far=nights.filter(n=>n.bed!=null&&Math.abs(n.bed-ub)>30&&n.sleep);
    if(near.length>=3&&far.length>=2){const a=near.reduce((s,n)=>s+n.sleep,0)/near.length,b=far.reduce((s,n)=>s+n.sleep,0)/far.length;pay={near:a,far:b}}}
  const td=nights.find(n=>n.d===today()),wake=td&&td.wake!=null?td.wake:uw;
  return{nights,uw,ub,sw,sb,score,pay,wake,todayKnown:!!(td&&td.wake!=null),n:nights.length}}
function rhythmWindows(R){if(!R||R.wake==null)return null;const w=R.wake,bed=R.ub!=null?R.ub:w+16*60;
  return[{k:'Wake-up ramp',a:w,b:w+90,c:'124 183 222'},{k:'Peak focus',a:w+150,b:w+330,c:'255 196 107'},{k:'Afternoon dip',a:w+420,b:w+510,c:'169 155 255'},
    {k:'Second wind',a:w+570,b:w+720,c:'134 207 160'},{k:'Wind down',a:bed-90,b:bed,c:'232 150 210'}]}
function rhythmCard(compact){
  const R=rhythmData();
  const upBtn=`<button class="link" data-wakeup>${ic('check')}I’m up</button>`;
  if(!R)return section('Body <em>rhythm</em>',`<div class="card-s rv-rhythm"><p class="small" style="margin:0">Your peak-focus window comes from your wake and bed times. Fitbit sends them once it’s reconnected, or tap <b>I’m up</b> each morning.</p></div>`,upBtn);
  const W=rhythmWindows(R),n=nowM()+(nowM()<(R.wake||0)-120?1440:0),cur=W&&W.find(x=>n>=x.a&&n<x.b);
  const lo=R.wake,hi=(R.ub!=null?R.ub:R.wake+960)+30,span=Math.max(60,hi-lo),pc=v=>Math.max(0,Math.min(100,(v-lo)/span*100));
  const bar=W?`<div class="rh-bar">${W.map(x=>`<i style="left:${pc(x.a).toFixed(1)}%;width:${(pc(x.b)-pc(x.a)).toFixed(1)}%;--c:${x.c}" title="${esc(x.k)}"></i>`).join('')}${n>=lo&&n<=hi?`<b style="left:${pc(n).toFixed(1)}%"></b>`:''}</div>
    <div class="rh-ax"><span>${esc(mClock(lo))}</span><span>${esc(mClock(hi))}</span></div>`:'';
  const pk=W&&W[1],dip=W&&W[2];
  const head=cur?`<b>${esc(cur.k)}</b> right now${cur.k==='Peak focus'?' — do your hardest work':cur.k==='Afternoon dip'?' — admin, walking, a short nap':cur.k==='Wind down'?' — screens down, no caffeine':''}`:pk&&n<pk.a?`Peak focus starts at <b>${esc(mClock(pk.a))}</b>`:`Peak focus was ${esc(mClock(pk.a))}–${esc(mClock(pk.b))}`;
  const stats=`<div class="rh-st"><div><b class="num">${R.score}</b><span>consistency</span></div><div><b class="num">${R.uw!=null?esc(mClock(R.uw)):'—'}</b><span>usual wake${R.uw!=null&&R.n>1?' ±'+Math.round(R.sw)+'m':''}</span></div><div><b class="num">${R.ub!=null?esc(mClock(R.ub)):'—'}</b><span>${R.ub!=null?'usual bed ±'+Math.round(R.sb)+'m':'bedtime (needs Fitbit)'}</span></div></div>`;
  const pay=R.pay?`<p class="small" style="margin:10px 0 0">On nights within 30 min of your usual bedtime you slept <b>${(R.pay.near/60).toFixed(1)} h</b>, vs ${(R.pay.far/60).toFixed(1)} h otherwise.</p>`:'';
  const legend=W?`<div class="rh-lg">${W.slice(1,4).map(x=>`<span><i style="--c:${x.c}"></i>${esc(x.k)} ${esc(mClock(x.a))}–${esc(mClock(x.b))}</span>`).join('')}</div>`:'';
  return section('Body <em>rhythm</em>',`<div class="card-s rv-rhythm"><p class="rh-now">${head}</p>${bar}${compact?'':legend}${compact?'':stats}${compact?'':pay}${R.todayKnown?'':`<p class="small" style="margin:8px 0 0;opacity:.75">Using your usual wake time — tap “I’m up” for today’s exact window.</p>`}</div>`,upBtn);
}

/* ---------------------------------------------------------------- 2. caffeine half-life */
const CAF_P=[['Coffee','☕',140],['Espresso','☕',64],['Cold brew','🧊',200],['Matcha','🍵',70],['Celsius','⚡',200],['Tea','🫖',47]];
const cafLog=()=>(db.caf=Array.isArray(db.caf)?db.caf:[]);
const CAF_RX=[[/cold ?brew/i,200],[/\b(celsius|bang|reign|ghost energy|c4 energy)\b/i,200],[/\bmonster\b/i,160],[/red ?bull/i,80],[/\bespresso|americano|double shot\b/i,128],[/\b(latte|cappuccino|flat white|macchiato|mocha)\b/i,130],[/\bmatcha\b/i,70],[/\bcoffee\b/i,140],[/\b(chai)\b/i,50],[/\b(black|green|earl grey|english breakfast) tea\b/i,45],[/\b(diet coke|coke zero|coca-cola|coke|pepsi|dr pepper|mountain dew)\b/i,45],[/energy drink/i,150]];
function cafDoses(){const from=Date.now()-30*36e5,out=cafLog().filter(x=>x&&x.at>from).map(x=>({at:x.at,mg:num(x.mg),name:x.name,id:x.id}));
  for(const e of of('food')){const t=e.created||0;if(t<from)continue;const hit=CAF_RX.find(([re])=>re.test(e.title||''));if(hit&&!/decaf/i.test(e.title))out.push({at:t,mg:hit[1]*(num(e.servings)||1),name:e.title,food:true})}
  return out.sort((a,b)=>a.at-b.at)}
const HL=5*36e5,ABS=45*6e4;
const cafAt=(t,ds)=>ds.reduce((s,d)=>{const dt=t-d.at;if(dt<0)return s;return s+d.mg*(dt<ABS?dt/ABS:Math.pow(.5,(dt-ABS)/HL))},0);
function bedTs(){const R=rhythmData(),b=R&&R.ub!=null?R.ub:hmM(db.settings.bedtime)??(23*60+30);const d=new Date();d.setHours(0,0,0,0);return d.getTime()+b*6e4+(b<12*60?864e5:0)}
function caffeineCard(){
  const ds=cafDoses(),now=Date.now(),bed=bedTs(),cur=cafAt(now,ds),atBed=cafAt(bed,ds);
  const chips=`<div class="caf-p">${CAF_P.map(([n,e,mg])=>`<button class="chip" data-caf="${esc(n)}|${mg}">${e} ${esc(n)} <small>${mg}</small></button>`).join('')}</div>`;
  if(!ds.length)return section('Caffeine',`<div class="card-s caf"><p class="small" style="margin:0 0 10px">Nothing in your system. Log a drink and see when it clears before bed (half-life ≈ 5 h).</p>${chips}</div>`);
  // curve: 6 AM today → 3 AM, 50 mg = the "won't hurt sleep" line
  const d0=new Date();d0.setHours(6,0,0,0);const t0=Math.min(d0.getTime(),ds[0].at),t1=Math.max(bed+2*36e5,now+36e5),N=90;
  const pts=[];let mx=60;for(let i=0;i<=N;i++){const t=t0+(t1-t0)*i/N,v=cafAt(t,ds);mx=Math.max(mx,v);pts.push([t,v])}
  const Wd=300,Hd=86,X=t=>((t-t0)/(t1-t0)*Wd).toFixed(1),Y=v=>(Hd-4-v/mx*(Hd-12)).toFixed(1);
  const line=pts.map(([t,v],i)=>`${i?'L':'M'}${X(t)} ${Y(v)}`).join(''),area=`${line}L${Wd} ${Hd}L0 ${Hd}Z`;
  let clear=null;for(const[t,v]of pts)if(t>now&&v<50){clear=t;break}
  // latest time another regular coffee still leaves you under 50 mg at bedtime
  let cut=null;if(atBed<50){const left=50-atBed;cut=bed-ABS-HL*Math.log2(140/left)}
  const tm=t=>new Date(t).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
  const svg=`<svg class="caf-g" viewBox="0 0 ${Wd} ${Hd}" preserveAspectRatio="none" role="img" aria-label="Caffeine in your body today">
    <defs><linearGradient id="cafg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C48C5C" stop-opacity=".55"/><stop offset="1" stop-color="#C48C5C" stop-opacity="0"/></linearGradient></defs>
    <path d="M0 ${Y(50)}H${Wd}" stroke="currentColor" stroke-opacity=".25" stroke-dasharray="3 4" vector-effect="non-scaling-stroke"/>
    <path d="${area}" fill="url(#cafg)"/><path d="${line}" fill="none" stroke="#E0A06A" stroke-width="2" vector-effect="non-scaling-stroke"/>
    <path d="M${X(now)} 0V${Hd}" stroke="currentColor" stroke-opacity=".55" vector-effect="non-scaling-stroke"/>
    <path d="M${X(bed)} 0V${Hd}" stroke="#A99BFF" stroke-opacity=".9" stroke-dasharray="2 3" vector-effect="non-scaling-stroke"/></svg>
    <div class="caf-ax"><span>${esc(tm(t0))}</span><span>now</span><span style="color:#A99BFF">bed ${esc(tm(bed))}</span></div>`;
  const msg=atBed>=50?`<b>${Math.round(atBed)} mg</b> still in you at bedtime — that can cut deep sleep. Skip more caffeine today.`:
    `${clear?`Below 50 mg by <b>${esc(tm(clear))}</b>. `:''}${cut&&cut>now?`Last coffee by <b>${esc(tm(cut))}</b> to sleep clean.`:cut?'Another coffee now would still be in you at bedtime.':''}`;
  const today0=new Date();today0.setHours(0,0,0,0);const tot=ds.filter(x=>x.at>=today0.getTime()).reduce((s,x)=>s+x.mg,0);
  return section('Caffeine',`<div class="card-s caf"><div class="caf-top"><div><b class="num">${Math.round(cur)}</b><span>mg in you now</span></div><div><b class="num">${Math.round(tot)}</b><span>mg today${tot>400?' · over 400':''}</span></div></div>${svg}<p class="small caf-msg">${msg}</p>${chips}</div>`,
    cafLog().some(x=>x.at>Date.now()-6*36e5)?`<button class="link" data-cafundo>Undo last</button>`:'');
}

/* ---------------------------------------------------------------- 3. recovery & soreness predictor */
const MG={chest:[60,'Chest'],back:[72,'Back'],shoulders:[48,'Shoulders'],arms:[48,'Arms'],legs:[72,'Legs'],core:[48,'Core']};
const PM2G={chest:'chest',lats:'back','middle back':'back','lower back':'back',traps:'back',shoulders:'shoulders',biceps:'arms',triceps:'arms',forearms:'arms',quadriceps:'legs',hamstrings:'legs',glutes:'legs',calves:'legs',adductors:'legs',abductors:'legs',abdominals:'core'};
const KW2G=[[/bench|chest|fly|push ?up|dip/i,['chest','arms']],[/row|pull|lat|chin|deadlift|back/i,['back','arms']],[/press|shoulder|raise|delt/i,['shoulders']],[/curl|tricep|bicep|arm/i,['arms']],[/squat|leg|lunge|calf|hamstring|glute|rdl|run|jog|sprint|hike|bike|cycl/i,['legs']],[/ab|core|plank|crunch/i,['core']],
  [/\bpush\b/i,['chest','shoulders','arms']],[/\bpull\b/i,['back','arms']],[/upper/i,['chest','back','shoulders','arms']],[/lower/i,['legs']],[/full ?body/i,['chest','back','legs','core']]];
function groupsOf(name){const x=(typeof EXDB!=='undefined'&&EXDB||[]).find(e=>e.name.toLowerCase()===String(name).toLowerCase());if(x&&PM2G[x.pm])return[PM2G[x.pm]];
  const out=new Set();KW2G.forEach(([re,g])=>{if(re.test(name))g.forEach(v=>out.add(v))});return[...out]}
const MOB={back:['Cat–cow · 10 slow reps','Bird-dog · 3×8 each side, 5 s hold','Dead bug · 3×8','Glute bridge · 3×12','McGill curl-up · 3×6, 8 s hold','Child’s pose · 60 s'],
  knee:['Quad sets · 3×10, 5 s hold','Straight-leg raise · 3×10','Wall sit (pain-free depth) · 3×20 s','Hamstring stretch · 2×30 s'],
  shoulder:['Pendulum swings · 30 s','Band external rotation · 3×12','Wall slides · 2×10','Doorway pec stretch · 2×30 s'],
  ankle:['Ankle alphabet · 2 rounds','Calf raises · 3×12','Single-leg balance · 3×30 s'],neck:['Chin tucks · 2×10','Upper-trap stretch · 2×30 s each side','Thoracic extension on a chair · 10'],
  wrist:['Wrist flexor stretch · 2×30 s','Tendon glides · 2 rounds','Rice-bucket / grip squeezes · 2×20'],general:['Hip flexor stretch · 2×30 s each','World’s greatest stretch · 5 each side','Easy walk · 20 min']};
const injArea=t=>{t=String(t||'').toLowerCase();return/back|spine|lumbar/.test(t)?'back':/knee|patell|acl|menisc/.test(t)?'knee':/shoulder|rotator/.test(t)?'shoulder':/ankle|achilles/.test(t)?'ankle':/neck/.test(t)?'neck':/wrist|hand|forearm/.test(t)?'wrist':'general'};
function recovery(){
  const now=Date.now(),last={};
  for(const w of of('workout')){if(!w.date)continue;const t=+atLocal(w.date,'18:00');if(now-t>6*864e5||t>now+864e5)continue;
    const sets={};(w.ex||[]).forEach(x=>groupsOf(x.name).forEach(g=>sets[g]=(sets[g]||0)+Math.max(1,(x.sets||[]).length)));
    if(!Object.keys(sets).length)groupsOf(w.title).forEach(g=>sets[g]=(sets[g]||0)+Math.max(3,Math.round(num(w.minutes)/12)));
    for(const[g,s]of Object.entries(sets))if(!last[g]||last[g].t<t)last[g]={t,s}}
  const R=typeof readiness==='function'?readiness():null;
  const groups=Object.entries(MG).map(([g,[h,label]])=>{const l=last[g];if(!l)return{g,label,pct:1};const need=h*(l.s>14?1.3:l.s>8?1:.8),hrs=(now-l.t)/36e5;
    return{g,label,pct:Math.max(0,Math.min(1,hrs/need)),ready:l.t+need*36e5,sets:l.s}});
  const inj=of('injury').filter(e=>e.status!=='Healed').map(e=>{const L=typeof injLogs==='function'?injLogs(e.id):[];return{e,pain:L.length?num(L[0].pain):num(e.pain),area:injArea(e.title)}});
  const hurt=inj.find(x=>x.pain>=6);
  let verdict,tone;
  if(hurt){verdict=`Rest day — ${hurt.e.title||'your injury'} is at ${hurt.pain}/10. Mobility only.`;tone='rest'}
  else if(R&&R.score<50){verdict='Recovery day — readiness is low. Walk and stretch.';tone='rest'}
  else{const ready=groups.filter(x=>x.pct>=.95).map(x=>x.label),sore=groups.filter(x=>x.pct<.7);
    verdict=sore.length?`Train ${ready.length?ready.slice(0,3).join(', '):'light'} — ${sore.map(x=>x.label).join(', ')} still recovering.`:'Everything is recovered — good day to train hard.';tone=sore.length?'mid':'go'}
  return{groups,inj,verdict,tone,R}}
function recoveryCard(){
  const V=recovery();
  const bars=V.groups.map(x=>`<div class="rc-row"><span>${esc(x.label)}</span><i><i style="width:${Math.round(x.pct*100)}%;background:${x.pct>=.95?'#86CFA0':x.pct>=.7?'#F0B35C':'#F06D44'}"></i></i><b class="num">${x.pct>=.95?'ready':x.ready?esc(relDue(iso(new Date(x.ready)))+' '+new Date(x.ready).toLocaleTimeString([],{hour:'numeric'})):'—'}</b></div>`).join('');
  const areas=[...new Set([...V.inj.map(x=>x.area),...(V.groups.find(g=>g.g==='back'&&g.pct<.7)?['back']:[])])].slice(0,2);
  const mob=areas.length?areas.map(a=>`<div class="cap" style="margin:12px 0 6px">${a==='general'?'Mobility':esc(a[0].toUpperCase()+a.slice(1))+' mobility'} · 10 min</div><ul class="rc-mob">${MOB[a].map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`).join(''):'';
  return section('Recovery',`<div class="card-s rc ${V.tone}"><p class="rc-v">${esc(V.verdict)}</p>${bars}${mob}<p class="small" style="margin:10px 0 0;opacity:.7">From your last 6 days of workouts${V.R?', readiness':''}${V.inj.length?' and injury log':''}. Big muscles need ~72 h, small ~48 h.</p></div>`)}

/* ---------------------------------------------------------------- 4. campus crowds (bus = live; places = typical + your reports) */
const PLACES=[['newman','Newman Library','lib'],['torg','Torgersen Bridge','lib'],['turner','Turner Place','din'],['owens','Owens','din'],['d2','D2','din'],['westend','West End','din'],['squires','Squires','din'],['war','War Memorial Gym','gym'],['mccomas','McComas Gym','gym']];
const CURVE={lib:[20,15,10,5,5,5,5,8,10,20,35,45,50,55,60,65,65,55,55,65,70,65,50,35],
  din:[0,0,0,0,0,0,0,25,40,30,30,70,90,75,35,25,30,60,85,80,45,25,10,0],
  gym:[0,0,0,0,0,0,35,40,30,25,25,30,45,40,40,60,75,90,90,80,60,40,15,0]};
const crowdLog=()=>(db.crowd=Array.isArray(db.crowd)?db.crowd:[]);
function crowdNow(id,type){const d=new Date(),h=d.getHours(),wd=d.getDay(),c=CURVE[type];
  let v=c[h]+(c[(h+1)%24]-c[h])*d.getMinutes()/60;if(wd===0||wd===6)v*=type==='gym'?.8:type==='lib'?(wd===0&&h>=14?.95:.55):.6;
  if(type!=='gym'&&wd>=1&&wd<=5&&d.getMinutes()>=50)v=Math.min(100,v*1.12);              // class change
  const mine=crowdLog().filter(x=>x.place===id),recent=mine.filter(x=>Date.now()-x.at<45*6e4).pop();
  const same=mine.filter(x=>{const t=new Date(x.at);return Math.abs(t.getHours()-h)<=1&&((t.getDay()===0||t.getDay()===6)===(wd===0||wd===6))&&Date.now()-x.at<56*864e5});
  if(same.length)v=v*.5+same.reduce((s,x)=>s+x.v,0)/same.length*.5;
  if(recent)v=v*.3+recent.v*.7;
  return{v:Math.round(Math.max(0,Math.min(100,v))),mine:!!(recent||same.length),recent:!!recent}}
const crowdWord=v=>v>=80?'Packed':v>=60?'Busy':v>=35?'Moderate':v>=12?'Quiet':'Empty';
function crowdCard(){
  const rows=PLACES.map(([id,name,type])=>{const c=crowdNow(id,type),closed=type!=='lib'&&c.v===0&&!c.recent;
    const wait=type==='din'&&!closed?` · ~${Math.max(1,Math.round(c.v/100*15))} min line`:'';
    return`<button class="cw-row" data-crowd="${id}"><span class="cw-n"><b>${esc(name)}</b><small>${closed?'Likely closed':crowdWord(c.v)+wait}${c.recent?' · you reported':''}</small></span><span class="cw-b"><i style="width:${closed?0:c.v}%;background:${c.v>=80?'#F06D44':c.v>=60?'#F0B35C':'#86CFA0'}"></i></span></button>`}).join('');
  const bus=busCfg().map(c=>{const L=(BUS[c.route]||{}).load||[];if(!L.length)return'';const ps=L.map(x=>x.pct).sort((a,b)=>b-a);
    return`<span class="cw-bus"><b>${esc(c.route)}</b> ${ps.slice(0,3).map(p=>`<i class="${p>=80?'hot':p>=50?'mid':''}">${p}%</i>`).join(' ')}</span>`}).join('');
  return section('Campus <em>now</em>',`<div class="card-s cw">${bus?`<div class="cw-live"><span class="cap">Buses right now · live</span>${bus}</div>`:''}${rows}<p class="small" style="margin:10px 0 0;opacity:.7">Buses are live from Blacksburg Transit. Places are typical for this hour, tuned by what you report — tap one to say how busy it is.</p></div>`)}
function crowdAsk(id){const p=PLACES.find(x=>x[0]===id);if(!p)return;
  openSheet(`${sheetHead(`How busy is <em>${esc(p[1])}</em>?`)}<div class="cw-ask">${[['Empty',5],['Quiet',25],['Moderate',50],['Busy',72],['Packed',92]].map(([w,v])=>`<button class="secondary" data-crowdset="${id}|${v}">${w}</button>`).join('')}</div><p class="small">Your reports shape the estimate for this place at this time of day.</p>`)}

/* ---------------------------------------------------------------- 5. job board (kanban) tied to the calendar */
const JCOLS=[['Applied','Applied'],['Assessment','OA'],['Interview','Interview'],['Offer','Offer']];
function jobCal(j){const name=String(j.title||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').trim();if(name.length<3)return null;
  const re=new RegExp('\\b'+name.split(/\s+/)[0].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i');
  for(let i=0;i<30;i++){const d=addDays(i);const evs=[...(typeof extOn==='function'?extOn(d):[]),...of('meeting').filter(m=>m.date===d)];
    const hit=evs.find(e=>re.test(e.title||''));if(hit)return{date:d,time:hit.start||hit.time||'',title:hit.title}}
  return null}
function jobBoard(){
  const a=of('job');
  const cols=JCOLS.map(([st,label])=>{const items=a.filter(j=>(j.stage||'Applied')===st).sort((x,y)=>(y.lastMailAt||y.date||'').localeCompare(x.lastMailAt||x.date||''));
    const show=items.slice(0,st==='Applied'?25:60);
    return`<div class="kb-col" data-kbcol="${st}"><div class="kb-h"><b>${label}</b><span class="num">${items.length}</span></div>${show.map(j=>{const cal=jobCal(j),nx=cal?cal.date:j.next;
      return`<div class="kb-card" data-open="${esc(j.id)}"><b>${esc(j.title||'Company')}</b>${j.role?`<small>${esc(j.role)}</small>`:''}${nx?`<span class="kb-d${cal?' cal':''}">${cal?ic('cal'):''}${esc(relDue(nx))}${cal&&cal.time?' '+esc(fmtT(cal.time)):''}</span>`:''}
        <span class="kb-mv">${st!=='Applied'?`<button data-kbmv="${esc(j.id)}|-1" aria-label="Move back">‹</button>`:'<i></i>'}${st!=='Offer'?`<button data-kbmv="${esc(j.id)}|1" aria-label="Move forward">›</button>`:''}</span></div>`}).join('')}${items.length>show.length?`<p class="small kb-more">+${items.length-show.length} more in the list view</p>`:''}${!items.length?'<p class="small kb-more">Nothing here yet</p>':''}</div>`}).join('');
  return`<section class="sec"><div class="sec-h"><h2>Pipeline</h2><span class="cap">${a.filter(j=>j.stage==='Rejected').length} rejected</span></div><div class="kb">${cols}</div></section>`}
function jobAutoCal(){let ch=0;for(const j of of('job')){if(['Offer','Rejected'].includes(j.stage))continue;const c=jobCal(j);if(c&&c.date!==j.next){j.next=c.date;ch++}}if(ch)save()}

/* ---------------------------------------------------------------- 6. deadline countdown rings */
function deadlines(projOnly){
  const now=Date.now(),out=[],cut=now+21*864e5;
  const add=(id,title,sub,due,start,open,proj)=>{if(due>now-36e5&&due<cut)out.push({id,title,sub,due,start:Math.min(start||due-14*864e5,due-864e5),open,proj})};
  for(const e of db.entries){
    if((e.type==='task'||e.type==='reminder')&&!e.done&&e.due){const big=/^(High|Urgent)$/.test(e.priority||e.importance||'')||e.project||/exam|final|project|presentation|report|paper|deliverable|interview|deadline|due/i.test(e.title||'');
      if(big)add(e.id,e.title,e.project&&typeof projOf==='function'&&projOf(e)?projOf(e).title:e.type==='task'?'Task':'Reminder',+atLocal(e.due,e.time||'23:59'),e.created,e.id,!!e.project)}
    if(e.type==='project'&&(e.status||'Active')!=='Done')(e.steps||[]).filter(s=>!s.done&&s.due).forEach(s=>add(e.id+':'+s.id,s.t,e.title||'Project',+atLocal(s.due,'23:59'),e.created,e.id,true))}
  try{const G=db.grades||{};for(const[cid,g]of Object.entries(G)){const c=find(cid);(g.items||[]).filter(i=>i.exam&&i.date&&(i.score===''||i.score==null)).forEach(i=>add('g:'+i.id,i.name,(c&&c.title)||'Exam',+atLocal(i.date,'09:00'),null,null))}}catch(e){}
  try{if(typeof extOn==='function')for(let i=0;i<21;i++){const d=addDays(i);extOn(d).filter(e=>/exam|midterm|final|project|presentation|report|paper/i.test(e.title)&&!(typeof isExtDone==='function'&&isExtDone(e))).forEach(e=>add(e.id,e.title,e.course||'Canvas',+atLocal(d,e.start||'23:59'),null,null))}}catch(e){}
  const seen=new Set();return out.filter(x=>!seen.has(x.id)&&seen.add(x.id)&&(!projOnly||x.proj)).sort((a,b)=>a.due-b.due).slice(0,6)}
const leftTxt=ms=>{if(ms<=0)return'now';const h=ms/36e5;if(h<1)return`${Math.max(1,Math.round(ms/6e4))}m`;if(h<48)return`${Math.floor(h)}h ${Math.round((h%1)*60)}m`;const d=Math.floor(h/24);return`${d}d ${Math.round(h%24)}h`};
function countdownCard(projOnly){
  const D=deadlines(projOnly);if(!D.length)return'';const now=Date.now();
  return section('Deadlines',`<div class="cd">${D.map(x=>{const tot=x.due-x.start,left=x.due-now,p=Math.max(0,Math.min(1,1-left/tot)),r=26,C=2*Math.PI*r,col=left<864e5?'#F06D44':left<3*864e5?'#F0B35C':'#86CFA0';
    return`<button class="cd-i" ${x.open?`data-open="${esc(x.open)}"`:''} data-cdue="${x.due}" data-cstart="${x.start}"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="${r}" style="stroke:color-mix(in srgb,var(--ink) 14%,transparent)" stroke-width="6" fill="none"/><circle cx="32" cy="32" r="${r}" stroke="${col}" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*p).toFixed(1)}" transform="rotate(-90 32 32)"/></svg>
      <b class="num cd-l">${esc(leftTxt(left))}</b><span class="cd-t">${esc(x.title||'')}</span><small>${esc(x.sub||'')} · ${esc(relDue(iso(new Date(x.due))))}</small></button>`}).join('')}</div>`)}
setInterval(()=>{if(document.hidden)return;const now=Date.now();document.querySelectorAll('.cd-i[data-cdue]').forEach(b=>{const l=b.querySelector('.cd-l');if(l)l.textContent=leftTxt(+b.dataset.cdue-now)})},30000);

/* ---------------------------------------------------------------- 7. leave-by for meetings (bus) */
if(!TYPES.meeting.f.some(f=>f[0]==='place')){const i=TYPES.meeting.f.findIndex(f=>f[0]==='with');TYPES.meeting.f.splice(i>=0?i:TYPES.meeting.f.length,0,['place','Where (building, or Zoom)','text'])}
const inPerson=p=>!!p&&!/zoom|teams|meet\.google|google meet|online|virtual|webex|call|phone|remote/i.test(p);
function meetingStarts(days=7){const out=[];for(let i=0;i<days;i++){const d=addDays(i);of('meeting').filter(m=>inPerson(m.place)&&m.time&&(m.date===d||(typeof meetingOn==='function'&&m.repeat&&m.repeat!=='Never'&&meetingOn(m,d)))).forEach(m=>{const t=+atLocal(d,m.time);if(t>Date.now())out.push({t,m})})}return out}
{const _lp=leavePlan;leavePlan=function(){const p=_lp();p.classes=[...new Set([...p.classes,...meetingStarts().map(x=>x.t)])].sort((a,b)=>a-b);return p}}
function leaveLine(){const g=db.settings.leave||{},walk=g.walk||7,ride=g.ride||12,buf=g.buffer??3,c=busCfg()[0];if(!c)return'';const b=BUS[c.route]||{};const deps=(b.deps||[]).map(x=>Date.parse(x)).filter(t=>t>Date.now());
  const ms=meetingStarts(1).slice(0,2);if(!ms.length)return'';
  return ms.map(({t,m})=>{const ok=deps.filter(d=>d+(ride+buf)*6e4<=t).pop();const leave=ok?ok-(walk+1)*6e4:null;
    return`<div class="lv-row">${ic('bus')}<span><b>${esc(m.title||'Meeting')}</b> at ${esc(fmtT(m.time))} · ${esc(m.place)}<small>${ok?`Leave by <b>${new Date(leave).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</b> for the ${esc(c.route)} at ${new Date(ok).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}`:deps.length?'Bus times for then aren’t out yet — you’ll get a leave alert.':'You’ll get leave alerts 45, 15 and ~8 min before your bus.'}</small></span></div>`}).join('')}

/* ---------------------------------------------------------------- wiring into screens */
{const _vtF=viewToday;viewToday=function(){let h=_vtF();const H=new Set(db.settings.todayHide||[]),on=k=>!H.has(k);
  const after=(re,html)=>{if(!html)return;const m=re.exec(h);if(m){const i=h.indexOf('</section>',m.index)+10;h=h.slice(0,i)+html+h.slice(i)}else h+=html};
  if(on('deadlines'))after(/<section class="sec"><div class="sec-h"><h2>Your <em>reminders/,countdownCard());
  if(on('rhythm'))after(/<section class="sec"><div class="sec-h"><h2>Your <em>progress/,rhythmCard(true));
  if(on('caffeine'))after(/<section class="sec"><div class="sec-h"><h2>Body <em>rhythm/,caffeineCard());
  const lv=leaveLine();if(lv)h=h.replace(/(<div class="card-s bus">)/,'$1'+`<div class="lv">${lv}</div>`);
  if(on('crowd'))after(/<section class="sec"><div class="sec-h"><h2>Bus<em> times/,crowdCard());
  return h}}
{const _avF=activityView;activityView=function(){let h=_avF();const i=h.indexOf('</section>',h.indexOf('<section class="sec"><div class="sec-h"><h2>Readiness'));
  const add=rhythmCard(false)+recoveryCard();return i>9?h.slice(0,i+10)+add+h.slice(i+10):add+h}}
let JB_BOARD=(()=>{try{return localStorage.getItem('lifeJobBoard')==='1'}catch(e){return false}})();
{const _vjF=viewJobs;viewJobs=function(){let h=_vjF();try{jobAutoCal()}catch(e){}
  const seg=`<div class="seg2 kb-seg"><button data-kbview="0" aria-pressed="${!JB_BOARD}">List</button><button data-kbview="1" aria-pressed="${JB_BOARD}">Board</button></div>`;
  const i=h.indexOf('</section>',h.indexOf('<section class="hero'))+10;if(i<10)return h;
  if(!JB_BOARD)return h.slice(0,i)+seg+h.slice(i);
  return h.slice(0,i)+seg+jobBoard()}}
{const _vwF=viewWork;viewWork=function(){let h=_vwF();if(state.sub.work!=='project')return h;const c=countdownCard(true);if(!c)return h;const i=h.indexOf('</section>',h.indexOf('<section class="hero'))+10;return i>9?h.slice(0,i)+c+h.slice(i):h}}

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-caf],[data-cafundo],[data-wakeup],[data-crowd],[data-crowdset],[data-kbview],[data-kbmv]');if(!b)return;
  e.stopImmediatePropagation();e.preventDefault();const d=b.dataset,keep=()=>{const y=SC.scrollTop;render(false);SC.scrollTop=y};
  if(d.caf){const[n,mg]=d.caf.split('|');cafLog().push({id:uid(),at:Date.now(),mg:+mg,name:n});save();tick();keep();toast(`${n} logged · ${mg} mg`);return}
  if(d.cafundo!==undefined){const L=cafLog();L.sort((a,b)=>a.at-b.at);const x=L.pop();save();keep();if(x)toast(`Removed ${x.name}`);return}
  if(d.wakeup!==undefined){wakeLog()[today()]=nowT();save();keep();toast(`Woke at ${fmtT(nowT())} — today’s windows updated`);return}
  if(d.crowd){crowdAsk(d.crowd);return}
  if(d.crowdset){const[id,v]=d.crowdset.split('|');crowdLog().push({id:uid(),place:id,at:Date.now(),v:+v});if(crowdLog().length>400)db.crowd=crowdLog().slice(-400);save();closeSheet();keep();toast('Thanks — noted');return}
  if(d.kbview!==undefined){JB_BOARD=d.kbview==='1';try{localStorage.setItem('lifeJobBoard',JB_BOARD?'1':'0')}catch(x){}keep();return}
  if(d.kbmv){const[id,dir]=d.kbmv.split('|'),j=find(id);if(!j)return;const order=JCOLS.map(c=>c[0]),i=Math.max(0,order.indexOf(j.stage||'Applied')),n=order[Math.max(0,Math.min(order.length-1,i+ +dir))];
    if(n!==j.stage){j.stage=n;(j.history=j.history||[]).push({stage:n,date:today()});j.manualAt=new Date().toISOString();delete j.sample;save();if(n==='Offer'){tick();toast('Offer! 🎉')}keep()}return}
},true);
if(!P.bus)P.bus='<rect x="4" y="4" width="16" height="14" rx="3"/><path d="M4 11h16M8 18v2M16 18v2"/><circle cx="8" cy="14.5" r=".8"/><circle cx="16" cy="14.5" r=".8"/>';

(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="featcss">
.rv-rhythm,.caf,.rc,.cw{padding:14px 14px 14px}
.rh-now{margin:0 0 12px;font-size:15px;line-height:1.35}
.rh-bar{position:relative;height:16px;border-radius:999px;background:rgb(255 255 255 / .07);overflow:hidden}
.rh-bar i{position:absolute;top:0;bottom:0;border-radius:999px;background:linear-gradient(90deg,rgb(var(--c) / .55),rgb(var(--c) / .95))}
.rh-bar b{position:absolute;top:-3px;bottom:-3px;width:3px;margin-left:-1.5px;border-radius:2px;background:var(--ink);box-shadow:0 0 0 2px rgb(0 0 0 / .35)}
.rh-ax,.caf-ax{display:flex;justify-content:space-between;font:600 11px var(--ui);color:var(--muted);margin-top:6px}
.rh-lg{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:10px;font-size:12.5px;color:var(--ink2)}
.rh-lg i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background:rgb(var(--c))}
.rh-st,.caf-top{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}
.caf-top{grid-template-columns:1fr 1fr;margin:0 0 8px}
.rh-st>div,.caf-top>div{display:flex;flex-direction:column;gap:2px;min-width:0}
.rh-st b,.caf-top b{font-size:20px}.rh-st span,.caf-top span{font-size:11.5px;color:var(--muted)}
.caf-g{width:100%;height:86px;display:block;color:var(--ink)}
.caf-msg{margin:10px 0 10px}
.caf-p{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 -2px;padding:2px}
.caf-p::-webkit-scrollbar{display:none}.caf-p .chip{height:38px;padding:0 12px;font-size:13px}.caf-p small{opacity:.6;font-weight:600}
.rc-v{margin:0 0 12px;font-weight:700;font-size:15px;line-height:1.35}
.rc.rest .rc-v{color:#F28A92}.rc.go .rc-v{color:#86CFA0}
.rc-row{display:grid;grid-template-columns:82px 1fr auto;align-items:center;gap:10px;margin:7px 0;font-size:13px}
.rc-row>i{height:8px;border-radius:999px;background:rgb(255 255 255 / .08);overflow:hidden}.rc-row>i>i{display:block;height:100%;border-radius:999px}
.rc-row b{font-size:11.5px;color:var(--muted);min-width:64px;text-align:right}
.rc-mob{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px;font-size:13.5px;color:var(--ink2)}
.cw-live{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;margin-bottom:10px}
.cw-bus{font:600 13px var(--ui)}.cw-bus i{font-style:normal;padding:2px 7px;border-radius:999px;background:rgb(134 207 160 / .2);color:#9fdcb4;margin-left:2px}
.cw-bus i.mid{background:rgb(240 179 92 / .2);color:#F0B35C}.cw-bus i.hot{background:rgb(240 109 68 / .22);color:#FF9A7A}
.cw-row{display:grid;grid-template-columns:1fr 92px;align-items:center;gap:10px;width:100%;text-align:left;padding:8px 0;border-top:1px solid rgb(255 255 255 / .06)}
.cw-n{display:flex;flex-direction:column;min-width:0}.cw-n b{font-size:14.5px}.cw-n small{font-size:12px;color:var(--muted)}
.cw-b{height:8px;border-radius:999px;background:rgb(255 255 255 / .08);overflow:hidden}.cw-b i{display:block;height:100%;border-radius:999px}
.cw-ask{display:grid;gap:8px}
.kb-seg{margin:14px 0 4px}
.kb{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(220px,78%);gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;margin:0 -16px;padding:2px 16px 8px;scrollbar-width:none}
.kb::-webkit-scrollbar{display:none}
.kb-col{scroll-snap-align:start;border-radius:var(--r-l);padding:10px;background:color-mix(in srgb,var(--surface) 80%,transparent);border:1px solid var(--line);display:flex;flex-direction:column;gap:8px;max-height:62vh;overflow-y:auto}
.kb-h{display:flex;justify-content:space-between;align-items:center;padding:2px 4px 4px}.kb-h span{font-size:12px;color:var(--muted)}
.kb-col[data-kbcol="Assessment"] .kb-h b{color:#F0B35C}.kb-col[data-kbcol="Interview"] .kb-h b{color:#A99BFF}.kb-col[data-kbcol="Offer"] .kb-h b{color:#86CFA0}
.kb-card{position:relative;display:flex;flex-direction:column;gap:3px;padding:10px 10px 8px;border-radius:14px;background:var(--surface2);text-align:left;cursor:pointer}
.kb-card b{font-size:14px}.kb-card small{font-size:12px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.kb-d{align-self:flex-start;display:inline-flex;align-items:center;gap:4px;font:700 11.5px var(--ui);padding:3px 8px;border-radius:999px;background:rgb(169 155 255 / .18);color:#C4BBFF;margin-top:2px}
.kb-d .i{width:12px;height:12px}
.kb-mv{display:flex;justify-content:space-between;margin-top:4px}.kb-mv button{width:34px;height:28px;border-radius:9px;background:rgb(255 255 255 / .07);font-size:17px;font-weight:700;color:var(--ink2)}
.kb-more{margin:2px 4px;opacity:.7}
.cd{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.cd-i{position:relative;display:grid;grid-template-columns:58px 1fr;grid-template-rows:auto auto;align-items:center;column-gap:10px;padding:10px;border-radius:var(--r-l);background:var(--surface);border:1px solid var(--line);text-align:left;min-width:0}
.cd-i svg{grid-row:1/3;width:58px;height:58px}
.cd-l{position:absolute;left:10px;top:10px;width:58px;height:58px;display:grid;place-items:center;font-size:11.5px;font-weight:800;letter-spacing:-.02em}
.cd-t{font-weight:700;font-size:13.5px;line-height:1.2;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.cd-i small{font-size:11.5px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lv{display:flex;flex-direction:column;gap:8px;padding-bottom:10px;margin-bottom:10px;border-bottom:1px solid rgb(255 255 255 / .07)}
.lv-row{display:flex;gap:10px;align-items:flex-start;font-size:13.5px}.lv-row .i{width:18px;height:18px;flex:none;margin-top:2px;color:#F0B35C}
.lv-row small{display:block;color:var(--muted);font-size:12.5px;margin-top:2px}.lv-row small b{color:var(--ink)}
:root[data-theme="light"] .rh-bar,:root[data-theme="light"] .rc-row>i,:root[data-theme="light"] .cw-b{background:rgb(0 0 0 / .07)}
</style>`);
