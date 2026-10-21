
/* ===================== ui3: every section its own look, living plants, scroll sparks, focus on the lock screen, layout fixes ===================== */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="ui3css">
/* heroes for Work and Ideas sections */
.hero.h-task{background:linear-gradient(158deg,#7A6224 0%,#4E3E17 58%,#3A2E10 100%);--hc:#FFD68C}
.hero.h-meeting{background:linear-gradient(158deg,#2F4B68 0%,#203448 58%,#18263A 100%);--hc:#A9CFF5}
.hero.h-project{background:linear-gradient(158deg,#56632C 0%,#3A431E 58%,#2B3216 100%);--hc:#DDE8A0}
.hero.h-job{background:linear-gradient(158deg,#62304E 0%,#432135 58%,#311827 100%);--hc:#F2B8D6}
.hero.h-grades{background:linear-gradient(158deg,#363C76 0%,#262A55 58%,#1C1F40 100%);--hc:#C4CBFF}
.hero.h-expense{background:linear-gradient(158deg,#2B5F4C 0%,#1D4234 58%,#153126 100%);--hc:#A6E3C2}
.hero.h-idea{background:linear-gradient(158deg,#4B4068 0%,#312946 58%,#231D33 100%);--hc:#D8C8FF}
.hero.h-note{background:linear-gradient(158deg,#6A5A44 0%,#4A3E2F 58%,#372E22 100%);--hc:#EFD9B2}
.hero.h-reminder{background:linear-gradient(158deg,#7E5B1C 0%,#563D12 58%,#40300E 100%);--hc:#FFD27A}
.hero.h-scrap{background:linear-gradient(158deg,#46534C 0%,#323C37 58%,#252D29 100%);--hc:#CFE0D5}
.hero.h-cards{background:linear-gradient(158deg,#2C4A7A 0%,#1F3459 58%,#172642 100%);--hc:#AFCBFF}
.hero.h-trip{background:linear-gradient(158deg,#7A4E2E 0%,#55361F 58%,#3F2716 100%);--hc:#FFCB9C}
.hero.h-cards .big{font:800 60px/1 var(--ui)}.hero.h-trip .big{font:italic 500 64px/1 var(--serif)}
.hero.h-task .big{font:800 62px/1 var(--ui);letter-spacing:-.03em}
.hero.h-meeting .big{font:italic 500 64px/1 var(--serif)}
.hero.h-job .big{font:700 56px/1 var(--mono);letter-spacing:-.05em}
.hero.h-grades .big{font:500 62px/1 var(--serif)}
.hero.h-expense .big{font:500 62px/1 var(--serif);letter-spacing:-.02em}
.hero.h-note .big{font:italic 500 64px/1 var(--serif)}
.hero.h-reminder .big{font:800 62px/1 var(--ui)}
.hero.h-scrap .big{font:700 56px/1 var(--mono)}
.hero[class*=" h-"] .lead{max-width:calc(100% - 96px)}
.hero .big small.bu{font:600 22px var(--ui);font-style:normal;margin-left:6px;opacity:.8;letter-spacing:0}

/* hero buttons: one fills the row, three share it evenly */
.hero-actions:has(>:only-child){grid-template-columns:1fr}
.hero-actions:has(>:nth-child(3)){grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.hero-actions:has(>:nth-child(3)) .pill{font-size:13px;padding:0 6px;gap:5px;white-space:nowrap;min-width:0}
.hero-actions:has(>:nth-child(3)) .pill svg{width:15px;height:15px;flex:none}

/* greeting: always on its own line, shrinks to fit */
#hi .hl1,#hi em,.hello h1{white-space:nowrap}
.hello h1{overflow:visible}

/* swipe actions sit inside the card's rounded shape */
.list{overflow:hidden}
.swa{padding:6px 6px 6px 0;gap:6px;box-sizing:border-box}
.swa button{border-radius:14px}

/* form labels in normal text, not the small caps typewriter style */
.fld>span,.fld legend{font:600 13px/1.25 var(--ui);letter-spacing:0;text-transform:none;color:var(--ink2)}
.mbuds .fld>span{display:flex;align-items:center;gap:6px}
.wsub,.wcard .cap+.small{font-family:var(--ui)}

/* money */
.cbar{padding:10px 2px}.cbar+.cbar{border-top:1px solid var(--line)}
.cbar .ct{display:flex;justify-content:space-between;align-items:baseline;gap:12px;font:700 14px var(--ui)}
.cbar .ct span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cbar .ct b{font:700 14px var(--mono);white-space:nowrap;padding-right:2px}.cbar .ct small{color:var(--muted);font-weight:500}
.cbar .tr{height:8px;border-radius:5px;background:var(--surface2);margin-top:8px;overflow:hidden}.cbar .tr i{display:block;height:100%;border-radius:inherit;transition:width .5s}
.mamt{position:relative}
.mdone{display:none;height:42px;padding:0 14px;border-radius:12px;background:var(--accent);color:var(--accent-ink);font:800 14px var(--ui);flex:none}
.mamt:focus-within .mdone{display:block}
.mok{display:flex;align-items:center;gap:10px;margin-top:12px;padding:10px 10px 10px 12px;border-radius:14px;background:color-mix(in srgb,var(--good,#5DAA78) 18%,transparent);font-size:14px}
.mok span{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:var(--good,#5DAA78);color:#fff;flex:none}
.mok span svg{width:14px;height:14px;stroke-width:3}
.mok b{flex:1;min-width:0}
.mok button{font:800 13px var(--ui);padding:7px 12px;border-radius:12px;background:var(--surface2)}

/* notebooks: three equal columns, same margins on both sides */
.nbs{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0!important;padding:2px 0 6px!important;overflow:visible!important}
html:not([data-lay="port"]) .nbs{grid-template-columns:repeat(auto-fill,minmax(120px,1fr))}
.nbs-b{width:auto!important;min-width:0}
.nbs-c{width:100%!important;height:auto!important;aspect-ratio:3/4}

/* living plants behind everything */
#flora{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
#flora .flx{position:absolute;inset:-6%;will-change:transform}
#flora canvas{position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity 1.6s ease,transform 2.4s cubic-bezier(.2,.7,.2,1);transform:scale(1.08)}
#flora.in canvas{opacity:var(--o,.6);transform:none}
#flora .fx0 canvas{filter:blur(22px);--o:.55}
#flora .fx1 canvas{filter:blur(8px);--o:.6;transition-delay:.25s}
#flora .fx2 canvas{filter:blur(1.2px);--o:.8;transition-delay:.5s}
#flora .fxd{position:absolute;inset:0;animation:fdrift var(--t,18s) ease-in-out infinite alternate}
@keyframes fdrift{from{transform:translate3d(-6px,4px,0) rotate(-.6deg)}to{transform:translate3d(6px,-4px,0) rotate(.6deg)}}
:root[data-theme="light"] #flora{opacity:.55}
@media (prefers-color-scheme:light){:root:not([data-theme="dark"]) #flora{opacity:.55}}
html.nb-open #flora,body.panel #flora{opacity:.35;transition:opacity .5s}
@media (prefers-reduced-motion:reduce){#flora .fxd{animation:none}}

/* scroll sparks */
#bgFx{position:absolute;inset:0;pointer-events:none}
#bgComet{display:none}
</style>`);

/* ---------- each Work / Ideas section: own colour, picture and the numbers that matter there ---------- */
Object.assign(ARTS,{
  'h-task':`<rect x="118" y="26" width="62" height="80" rx="10" fill="currentColor" fill-opacity=".22" stroke="currentColor" stroke-width="2"/><rect x="136" y="20" width="26" height="12" rx="5" fill="currentColor" opacity=".8"/>${[0,1,2].map(i=>`<path d="M128 ${48+i*18}l5 5 9-10" fill="none" stroke="#fff" stroke-opacity="${i<2?.85:.35}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M148 ${50+i*18}h22" stroke="#fff" stroke-opacity=".45" stroke-width="2" stroke-linecap="round"/>`).join('')}<path d="M106 128c0-14 8-24 18-26M106 128c-2-12-12-18-22-16 2 10 10 16 22 16z" fill="#B9D7AE" fill-opacity=".85" stroke="#B9D7AE" stroke-width="1.5"/>`,
  'h-meeting':`<path d="M110 40h52a12 12 0 0 1 12 12v22a12 12 0 0 1-12 12h-30l-14 12v-12h-8a12 12 0 0 1-12-12V52a12 12 0 0 1 12-12z" fill="currentColor" fill-opacity=".28" stroke="currentColor" stroke-width="2"/><path d="M142 70h40a10 10 0 0 1 10 10v18a10 10 0 0 1-10 10h-4v10l-12-10h-24a10 10 0 0 1-10-10V80a10 10 0 0 1 10-10z" fill="currentColor" fill-opacity=".55"/>${[0,1,2].map(i=>`<circle cx="${124+i*12}" cy="63" r="3" fill="#fff" fill-opacity=".8"/>`).join('')}<path d="M86 136c4-14 14-20 24-20-2 12-12 20-24 20z" fill="#B9D7AE" fill-opacity=".8"/>`,
  'h-project':ARTS['h-work'],
  'h-job':`<rect x="112" y="52" width="76" height="54" rx="10" fill="currentColor" fill-opacity=".3" stroke="currentColor" stroke-width="2"/><path d="M136 52v-8a6 6 0 0 1 6-6h16a6 6 0 0 1 6 6v8M112 74h76" fill="none" stroke="currentColor" stroke-width="2"/><rect x="144" y="70" width="12" height="9" rx="2" fill="currentColor"/><path d="M96 134c14-6 24-18 26-34" fill="none" stroke="#B9D7AE" stroke-width="1.8"/>${[[104,128,40],[112,118,10],[118,106,-20]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="4" ry="8" transform="rotate(${r} ${x} ${y})" fill="#B9D7AE" fill-opacity=".85"/>`).join('')}`,
  'h-grades':`<path d="M100 56l50-20 50 20-50 20z" fill="currentColor" fill-opacity=".75"/><path d="M120 64v20c0 8 14 14 30 14s30-6 30-14V64" fill="currentColor" fill-opacity=".3" stroke="currentColor" stroke-width="2"/><path d="M196 58v24" stroke="currentColor" stroke-width="2"/><circle cx="196" cy="84" r="3" fill="currentColor"/>${[0,1,2,3,4].map(i=>`<ellipse cx="${106+i*9}" cy="${128-i*5}" rx="3.5" ry="8" transform="rotate(${50-i*10} ${106+i*9} ${128-i*5})" fill="#B9D7AE" fill-opacity=".8"/>`).join('')}`,
  'h-expense':`${[0,1,2,3].map(i=>`<ellipse cx="150" cy="${112-i*12}" rx="26" ry="8" fill="currentColor" fill-opacity="${.35+i*.15}" stroke="#fff" stroke-opacity=".3"/>`).join('')}<path d="M150 74V44" stroke="#B9D7AE" stroke-width="2.2"/><path d="M150 56c-4-10-14-12-18-8 2 8 10 12 18 8zM150 50c4-10 14-14 20-9-3 9-12 12-20 9z" fill="#B9D7AE" fill-opacity=".9"/><circle cx="106" cy="40" r="2.5" fill="#fff" fill-opacity=".5"/>`,
  'h-idea':ARTS['h-mind'],
  'h-cards':`<rect x="122" y="44" width="70" height="46" rx="8" transform="rotate(10 157 67)" fill="currentColor" fill-opacity=".25"/><rect x="114" y="40" width="70" height="46" rx="8" transform="rotate(-4 149 63)" fill="currentColor" fill-opacity=".45"/><rect x="106" y="50" width="70" height="46" rx="8" fill="currentColor" fill-opacity=".75"/><path d="M118 66h34M118 76h22" stroke="#fff" stroke-opacity=".7" stroke-width="2.4" stroke-linecap="round"/><path d="M96 138c6-16 18-24 30-24-4 14-16 22-30 24z" fill="#B9D7AE" fill-opacity=".85"/>`,
  'h-trip':`<circle cx="160" cy="44" r="16" fill="currentColor" fill-opacity=".85"/><path d="M96 74c14-2 24-10 40-10s24 8 40 8M112 92c10-2 18-6 30-6s20 6 34 4" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/><path d="M104 132l28-6 16-20 6 4-10 18 30-4 8-10 6 2-6 12 4 10-6 2-8-8-30 6 2 20-6 2-12-18-26 4z" fill="#fff" fill-opacity=".8"/><path d="M180 132c4-12 12-18 20-18-2 10-10 16-20 18z" fill="#B9D7AE" fill-opacity=".8"/>`,
  'h-note':`<rect x="118" y="30" width="60" height="78" rx="6" transform="rotate(8 148 69)" fill="currentColor" fill-opacity=".25"/><rect x="112" y="30" width="60" height="78" rx="6" fill="currentColor" fill-opacity=".45" stroke="#fff" stroke-opacity=".35"/>${[0,1,2,3,4].map(i=>`<path d="M122 ${48+i*11}h${i===4?24:40}" stroke="#fff" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/>`).join('')}<path d="M96 140c10-30 30-56 70-80" fill="none" stroke="#B9D7AE" stroke-width="1.6"/>${[0,1,2,3,4,5].map(i=>`<ellipse cx="${104+i*10}" cy="${126-i*11}" rx="3" ry="7" transform="rotate(${-60+i*4} ${104+i*10} ${126-i*11})" fill="#B9D7AE" fill-opacity=".8"/>`).join('')}`,
  'h-reminder':`<path d="M150 30c-18 0-28 14-28 32v18l-8 12h72l-8-12V62c0-18-10-32-28-32z" fill="currentColor" fill-opacity=".35" stroke="currentColor" stroke-width="2"/><path d="M142 96a8 8 0 0 0 16 0" fill="none" stroke="currentColor" stroke-width="2"/><path d="M178 34c6 4 10 10 10 18M184 26c9 6 14 15 14 26" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/><circle cx="104" cy="122" r="7" fill="#F2B8D6" fill-opacity=".8"/>${[0,72,144,216,288].map(a=>`<ellipse cx="${(104+9*Math.cos(a*Math.PI/180)).toFixed(1)}" cy="${(122+9*Math.sin(a*Math.PI/180)).toFixed(1)}" rx="5" ry="3.5" transform="rotate(${a} ${(104+9*Math.cos(a*Math.PI/180)).toFixed(1)} ${(122+9*Math.sin(a*Math.PI/180)).toFixed(1)})" fill="#F2B8D6" fill-opacity=".55"/>`).join('')}<path d="M104 130v14" stroke="#B9D7AE" stroke-width="2"/>`,
  'h-scrap':`<path d="M118 40l40-6 6 30-10 4 8 10-40 8z" fill="currentColor" fill-opacity=".4" stroke="#fff" stroke-opacity=".35"/><path d="M150 76l36 6-6 34-38-8 6-10z" fill="currentColor" fill-opacity=".65"/><path d="M110 132c0-8 4-14 10-16M110 132c-6 0-10-6-8-12 6 0 9 5 8 12zM110 132c4-5 11-6 15-2-4 5-10 5-15 2zM110 132c-1-7 2-13 8-14 1 7-3 12-8 14z" fill="#B9D7AE" fill-opacity=".85" stroke="#B9D7AE" stroke-width="1.2"/>`
});
function heroAct(add,label){return`<div class="hero-actions"><button class="pill light" data-add="${add}">${ic('plus')}${label}</button></div>`}
function workHero(k){
  if(k==='task'){const a=of('task'),open=a.filter(e=>!e.done),td=open.filter(e=>e.due&&dayDiff(e.due)===0).length,late=open.filter(e=>e.due&&dayDiff(e.due)<0).length,dw=a.filter(e=>e.done&&Date.now()-(e.doneAt||0)<7*864e5).length;
    return heroBanner('Tasks',`${open.length}`,`open${td?` · <b>${td}</b> due today`:''}`,[['Due today',td],['Overdue',late],['Done · 7d',dw]],'',heroAct('task','New task'))}
  if(k==='meeting'){const a=of('meeting'),occ=a.map(e=>[e,nextOcc(e)]).filter(x=>x[1]&&dayDiff(x[1])>=0).sort((x,y)=>(x[1]+(x[0].time||'')).localeCompare(y[1]+(y[0].time||'')));
    const td=occ.filter(x=>x[1]===today()).length,wk=occ.filter(x=>dayDiff(x[1])<=7).length,nx=occ[0];
    return heroBanner('Meetings',`${wk}`,nx?`this week · next <b>${esc(nx[0].title)}</b>, ${esc(dayDiff(nx[1])===0?'today':dayDiff(nx[1])===1?'tomorrow':wdOf(nx[1]))}${nx[0].time?` ${esc(fmtT(nx[0].time))}`:''}`:'this week · nothing scheduled',[['Today',td],['Next 7 days',wk],['Recurring',a.filter(e=>e.repeat&&e.repeat!=='none'&&e.repeat!=='').length]],'',heroAct('meeting','New meeting'))}
  if(k==='project'){const a=of('project'),act=a.filter(e=>(e.status||'Active')==='Active'),steps=a.reduce((s,p)=>s+(p.steps||[]).filter(x=>!x.done).length,0);
    return heroBanner('Projects',`${act.length}`,`active${steps?` · <b>${steps}</b> open step${steps===1?'':'s'}`:''}`,[['Planning',a.filter(e=>e.status==='Planning').length],['Paused',a.filter(e=>e.status==='Paused').length],['Done',a.filter(e=>e.status==='Done').length]],'',heroAct('project','New project'))}
  return null}
function mindHero(k){
  const wk=e=>Date.now()-(e.created||0)<7*864e5,fs=of('folder').length;
  if(k==='idea'){const a=of('idea');return heroBanner('Ideas',`${a.length}`,`saved${fs?` across <b>${fs}</b> folder${fs===1?'':'s'}`:''}`,[['This week',a.filter(wk).length],['Tagged',a.filter(e=>e.tag).length],['Folders',fs]],'',heroAct('idea','New idea'))}
  if(k==='note'){const a=of('note'),last=a.reduce((m,e)=>Math.max(m,e.u||e.created||0),0);return heroBanner('Notes',`${a.length}`,last?`notes · last written <b>${esc(ago(last))}</b>`:'notes',[['This week',a.filter(wk).length],['In folders',a.filter(e=>e.folder).length]],'',heroAct('note','New note'))}
  if(k==='reminder'){const a=of('reminder'),open=a.filter(e=>!e.done),td=open.filter(e=>e.due&&dayDiff(e.due)===0).length,late=open.filter(e=>e.due&&dayDiff(e.due)<0).length;
    return heroBanner('Reminders',`${open.length}`,`open${td?` · <b>${td}</b> due today`:''}`,[['Due today',td],['Overdue',late],['Done',a.length-open.length]],'',heroAct('reminder','New reminder'))}
  if(k!=='scrap')return null;
  const a=of('scrap');return heroBanner('Scrap',`${a.length}`,'quick bits to sort later',[['This week',a.filter(wk).length]],'',heroAct('scrap','Jot something'))}
const HERO_RE=/<section class="hero[^"]*"[^>]*>[\s\S]*?<\/section>/;
const _vw3=viewWork;viewWork=function(){const k=state.sub.work;HERO_T='h-'+k;try{let h=_vw3();const n=workHero(k);if(n)h=h.replace(HERO_RE,n);return h}finally{HERO_T=''}};
const _vm3=viewMind;viewMind=function(){const k=state.sub.mind;HERO_T='h-'+k;try{let h=_vm3();const n=mindHero(k);if(n)h=h.replace(HERO_RE,n);return h}finally{HERO_T=''}};
const _vt3=viewToday;viewToday=function(){HERO_T='h-today';try{return _vt3()}finally{HERO_T=''}};
const _vp3=viewPlan;viewPlan=function(){HERO_T='h-today';try{return _vp3()}finally{HERO_T=''}};

/* weight: "195 lb" stays together, the date goes underneath */
const _vh3=viewHealth;viewHealth=function(){let h=_vh3();if(state.sub.health==='weight')h=h.replace(/<div class="big num">([^<]*)<\/div>\s*<div class="lead">lb on ([^<]*)<\/div>/,'<div class="big num">$1<small class="bu">lb</small></div><div class="lead">$2</div>');return h};

/* Activity: match what the Fitbit app shows (calories burned, latest heart rate), and say which heart rate is which */
const _av3=activityView;activityView=function(){let h=_av3();if(!syncOn()||!SYNC.healthOn)return h;
  const d=hday(today())||{},hr=HC.hr&&Date.now()-HC.hr.t<3*36e5?HC.hr:null;
  const extra=[['Burned',d.burnKcal?`${fmtN(d.burnKcal)}`:'—'],['Heart rate',hr&&num(hr.bpm)?`${Math.round(num(hr.bpm))}`:'—']];
  h=h.replace(/(<div class="hero-stats">)/,`$1${extra.map(([l,v])=>`<div><div class="cap">${l}</div><b class="num">${v}</b></div>`).join('')}`);
  h=h.replace(/(<div class="hstat)/,`<p class="small" style="margin:10px 2px 4px">Heart rate is your latest reading${hr?` (${esc(new Date(hr.t).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}))})`:''}, like the Fitbit app’s home screen. Resting HR is your overnight baseline, so it’s lower.</p>$1`);
  return h};

/* ---------- keep the section chips where you left them; greeting always fits on one line ---------- */
function fitHello(){const h=$('#top .hello h1');if(!h)return;h.style.fontSize='';
  const parts=[h.querySelector('.hl1'),h.querySelector('em')].filter(Boolean);const avail=h.clientWidth;if(!avail)return;
  const w=parts.length?Math.max(...parts.map(p=>p.getBoundingClientRect().width)):h.scrollWidth;
  if(w>avail){const fs=parseFloat(getComputedStyle(h).fontSize);h.style.fontSize=Math.max(15,fs*avail/w*.97).toFixed(1)+'px'}}
const _render3=render;render=function(a,f,d){
  const c=document.querySelector('#view .chips[role=tablist]'),sl=c?c.scrollLeft:null,tab=state.tab;
  _render3(a,f,d);
  const n=document.querySelector('#view .chips[role=tablist]');
  if(n){if(sl!=null&&tab===state.tab)n.scrollLeft=sl;const on=n.querySelector('.chip.on');
    if(on){const l=on.offsetLeft-n.offsetLeft,r=l+on.offsetWidth;if(l<n.scrollLeft+8||r>n.scrollLeft+n.clientWidth-8)n.scrollTo({left:Math.max(0,l-(n.clientWidth-on.offsetWidth)/2),behavior:sl!=null&&tab===state.tab&&!noMotion()?'smooth':'auto'})}}
  fitHello()};
addEventListener('resize',()=>setTimeout(fitHello,120));
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitHello);

/* ---------- living foliage: soft, out-of-focus leaves at the edges, three depths like a camera shot through plants ---------- */
(function(){
  const host=document.getElementById('bgcurve');if(!host||document.getElementById('flora'))return;
  const F=document.createElement('div');F.id='flora';F.setAttribute('aria-hidden','true');
  F.innerHTML=['fx0','fx1','fx2'].map((c,i)=>`<div class="flx ${c}"><div class="fxd" style="--t:${[22,17,13][i]}s;animation-delay:-${i*4}s"><canvas></canvas></div></div>`).join('');host.after(F);
  const layers=[...F.querySelectorAll('.flx')],cvs=[...F.querySelectorAll('canvas')];
  let seed=7;const R=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
  const light=()=>{const t=document.documentElement.dataset.theme;return t==='light'||(t!=='dark'&&matchMedia('(prefers-color-scheme: light)').matches)};
  /* one leaf, drawn from its stem (0,0) along +x: shaded body, glossy highlight, midrib and side veins */
  function leaf(x,len,wid,bend,c1,c2,hi){
    x.beginPath();x.moveTo(0,0);
    x.bezierCurveTo(len*.28,-wid*1.05,len*.72,-wid*.85+bend*.3,len,bend);
    x.bezierCurveTo(len*.72,wid*.85+bend*.3,len*.28,wid*1.05,0,0);x.closePath();
    const g=x.createLinearGradient(0,-wid,len*.4,wid);g.addColorStop(0,c2);g.addColorStop(1,c1);x.fillStyle=g;x.fill();
    x.save();x.clip();const h=x.createLinearGradient(0,-wid,0,wid*.2);h.addColorStop(0,hi);h.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=h;x.globalAlpha*=.35;x.fillRect(0,-wid*1.1,len,wid*1.1);x.restore();
    x.strokeStyle=hi;x.globalAlpha*=.55;x.lineWidth=Math.max(1,wid*.06);x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(len*.5,bend*.35,len*.97,bend*.95);x.stroke();
    x.lineWidth=Math.max(.6,wid*.025);for(let i=1;i<8;i++){const t=i/8,px=len*t,py=bend*t*t;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+len*.06,py-wid*.5*(1-t),px+len*.12,py-wid*.8*(1-t*.8));x.moveTo(px,py);x.quadraticCurveTo(px+len*.06,py+wid*.5*(1-t),px+len*.12,py+wid*.8*(1-t*.8));x.stroke()}
  }
  /* a palm-like frond: arching stem with leaflets on both sides */
  function frond(x,len,c1,c2,hi){x.strokeStyle=c1;x.lineWidth=3;x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(len*.5,-len*.12,len,len*.05);x.stroke();
    for(let i=2;i<20;i++){const t=i/20,px=len*t,py=-len*.12*4*t*(1-t)*.9+len*.05*t*t,ln=len*.34*(1-t*.65),a=.95-t*.4;
      for(const sgn of[-1,1]){x.save();x.translate(px,py);x.rotate(sgn*a);leaf(x,ln,ln*.13,sgn*ln*.06,c1,c2,hi);x.restore()}}}
  function paint(){
    const W=Math.round(innerWidth*1.12),H=Math.round(innerHeight*1.12),L=light();seed=7;
    const pal=L?{c1:'#5E8C6A',c2:'#9BC4A2',hi:'rgba(255,255,255,.9)',glow:'rgba(160,210,170,.35)'}:{c1:'#0C2618',c2:'#2F6A47',hi:'rgba(190,240,200,.85)',glow:'rgba(70,150,110,.28)'};
    cvs.forEach((cv,li)=>{const k=li===2?1:.5;cv.width=Math.round(W*k);cv.height=Math.round(H*k);const x=cv.getContext('2d');if(!x)return;x.setTransform(k,0,0,k,0,0);x.clearRect(0,0,W,H);
      if(li===0){const g=x.createRadialGradient(W*.82,H*.18,0,W*.82,H*.18,W*.7);g.addColorStop(0,pal.glow);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
        const g2=x.createRadialGradient(W*.1,H*.92,0,W*.1,H*.92,W*.6);g2.addColorStop(0,pal.glow);g2.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g2;x.fillRect(0,0,W,H)}
      /* leaves come in from the edges and corners, never across the middle of the page */
      const spots=li===0?[[0,.15,.2],[1,.05,2.6],[1,.55,3.3],[0,.7,-.3],[0,1,-.7],[1,.95,3.8],[.5,1.02,-1.6],[.2,0,.9]]
        :li===1?[[1,.02,2.4],[0,.88,-.5],[1,.78,3.6],[0,.35,.15]]:[[1,1.02,3.9],[0,1.04,-.9],[1.02,.3,3.0]];
      spots.forEach(([fx,fy,ang],i)=>{x.save();x.translate(fx*W,fy*H);x.rotate(ang+(R()-.5)*.3);
        const base=Math.min(W,H)*(li===0?.55:li===1?.42:.36)*(.8+R()*.4);x.globalAlpha=li===2?.95:.9;
        if(li===1&&i%2===0)frond(x,base*1.3,pal.c1,pal.c2,pal.hi);
        else{const n=li===2?2:3;for(let j=0;j<n;j++){x.save();x.rotate((j-(n-1)/2)*.45+(R()-.5)*.2);leaf(x,base*(1-j*.12),base*(.17+R()*.08),(R()-.5)*base*.2,pal.c1,pal.c2,pal.hi);x.restore()}}
        x.restore()})});
  }
  paint();let pw=innerWidth,ph=innerHeight,rt;
  addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(Math.abs(innerWidth-pw)>40||Math.abs(innerHeight-ph)>160){pw=innerWidth;ph=innerHeight;paint()}},300)});
  try{matchMedia('(prefers-color-scheme: light)').addEventListener('change',paint)}catch(e){}
  new MutationObserver(paint).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  /* the leaves come into focus as the home screen appears after the startup animation */
  afterSplash(()=>requestAnimationFrame(()=>F.classList.add('in')));
  /* depth while scrolling: near leaves move more than far ones */
  let raf=0;SC.addEventListener('scroll',()=>{if(raf||noMotion())return;raf=requestAnimationFrame(()=>{raf=0;const y=Math.min(SC.scrollTop,2000);layers.forEach((l,i)=>l.style.transform=`translate3d(0,${(-y*[.015,.035,.07][i]).toFixed(1)}px,0)`)})},{passive:true});
})();

/* ---------- scrolling: a comet with a glowing tail runs along the curve and throws off sparks and tiny leaves ---------- */
(function(){
  const host=document.getElementById('bgcurve');if(!host)return;
  const cv=document.createElement('canvas');cv.id='bgFx';host.appendChild(cv);const x=cv.getContext('2d');if(!x)return;
  let W=0,H=0,dpr=1;function size(){W=host.clientWidth;H=host.clientHeight;dpr=Math.min(1.5,devicePixelRatio||1);cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px';x.setTransform(dpr,0,0,dpr,0,0)}
  size();addEventListener('resize',()=>setTimeout(size,200));
  const pt=u=>{const seg=u<.5?[[82,-4],[18,14],[104,34],[50,52]]:[[50,52],[-4,70],[-2,80],[64,104]],v=u<.5?u*2:(u-.5)*2,m=1-v;
    const b=i=>m*m*m*seg[0][i]+3*m*m*v*seg[1][i]+3*m*v*v*seg[2][i]+v*v*v*seg[3][i];return[b(0)/100*W,b(1)/100*H]};
  const cs=()=>{const s=getComputedStyle(document.documentElement);return[s.getPropertyValue('--accent').trim()||'#F06D44',s.getPropertyValue('--sage-soft').trim()||'#557262']};
  let energy=0,prog=0,shown=0,lastY=0,last=0,raf=0,P=[];const COLS=['#F06D44','#FFB27A','#9CC49A','#C8EE9C'];
  function frame(){
    energy*=.93;shown+=(prog-shown)*.18;x.clearRect(0,0,W,H);
    const[acc]=cs(),e=Math.min(1,energy);
    if(e>.01){
      const tail=.05+e*.12,N=26;x.lineCap='round';
      for(let i=0;i<N;i++){const u0=Math.max(0,shown-tail*(1-i/N)),u1=Math.max(0,shown-tail*(1-(i+1)/N));const[a,b]=pt(Math.min(1,u0)),[c,d]=pt(Math.min(1,u1));
        const t=i/N;x.strokeStyle=t<.5?`rgba(157,196,154,${(e*t*.9).toFixed(3)})`:acc;x.globalAlpha=t<.5?1:e*t;x.lineWidth=1+t*5*e;x.shadowColor=acc;x.shadowBlur=14*t;x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke()}
      x.globalAlpha=1;const[hx,hy]=pt(Math.min(1,shown));const g=x.createRadialGradient(hx,hy,0,hx,hy,26+30*e);g.addColorStop(0,`rgba(255,226,190,${(.9*e).toFixed(3)})`);g.addColorStop(.3,`rgba(240,109,68,${(.45*e).toFixed(3)})`);g.addColorStop(1,'rgba(240,109,68,0)');
      x.shadowBlur=0;x.fillStyle=g;x.beginPath();x.arc(hx,hy,26+30*e,0,7);x.fill();
      if(P.length<140)for(let k=0;k<Math.round(e*3);k++)P.push({x:hx,y:hy,vx:(Math.random()-.5)*2.4,vy:(Math.random()-.6)*2.4,l:1,d:.012+Math.random()*.02,c:COLS[(Math.random()*COLS.length)|0],leaf:Math.random()<.18,r:Math.random()*6.3})}
    x.shadowBlur=0;
    for(const p of P){p.x+=p.vx;p.y+=p.vy;p.vy+=.025;p.vx*=.985;p.l-=p.d;p.r+=.06;if(p.l<=0)continue;x.globalAlpha=Math.max(0,p.l)*.9;x.fillStyle=p.c;
      if(p.leaf){x.save();x.translate(p.x,p.y);x.rotate(p.r);x.beginPath();x.ellipse(0,0,2.2,4.5,0,0,7);x.fill();x.restore()}else{x.beginPath();x.arc(p.x,p.y,1+p.l*1.6,0,7);x.fill()}}
    x.globalAlpha=1;P=P.filter(p=>p.l>0);
    if(energy>.01||P.length)raf=requestAnimationFrame(frame);else{raf=0;x.clearRect(0,0,W,H)}
  }
  SC.addEventListener('scroll',()=>{if(noMotion())return;const y=SC.scrollTop,now=performance.now(),dt=Math.max(16,now-last),v=Math.abs(y-lastY)/dt;last=now;lastY=y;
    const max=Math.max(1,SC.scrollHeight-SC.clientHeight);prog=Math.min(1,y/max);energy=Math.min(1.2,energy+v*.3);if(!raf)raf=requestAnimationFrame(frame)},{passive:true});
})();

/* ---------- focus timer on the lock screen / Dynamic Island / Mac & iPad media controls ----------
   iOS only lets real apps show Live Activities. A web app can show a "Now playing" card instead:
   Life plays an inaudible loop while a session runs and fills the card with the phase and time left;
   the progress bar there counts down by itself. Play/pause on the lock screen pauses the timer. */
const FM={a:null,on:false,key:'',art:null};
/* artwork with the minutes left drawn on it: the lock screen and the expanded Dynamic Island show artwork, so the time shows there too */
function fmArt(txt,col){try{const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,512,512);g.addColorStop(0,'#2B3A2F');g.addColorStop(1,'#131311');x.fillStyle=g;x.fillRect(0,0,512,512);
  x.strokeStyle=col;x.lineWidth=26;x.lineCap='round';x.beginPath();x.arc(256,256,200,-Math.PI/2,Math.PI*1.5);x.globalAlpha=.25;x.stroke();x.globalAlpha=1;
  x.fillStyle='#F2EDE3';x.font='800 '+(txt.length>4?150:190)+'px Geist, system-ui, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,256,262);
  return c.toDataURL('image/png')}catch(e){return null}}
function silentWav(){const sr=8000,n=sr*2,b=new ArrayBuffer(44+n),v=new DataView(b),w=(o,s)=>[...s].forEach((c,i)=>v.setUint8(o+i,c.charCodeAt(0)));
  w(0,'RIFF');v.setUint32(4,36+n,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr,true);v.setUint16(32,1,true);v.setUint16(34,8,true);w(36,'data');v.setUint32(40,n,true);
  for(let i=0;i<n;i++)v.setUint8(44+i,128);return URL.createObjectURL(new Blob([b],{type:'audio/wav'}))}
function fmToggle(){const f=FOCUS();if(!f||f.phase==='ready')return;if(f.paused!=null){f.pStart=Date.now()-(phaseLen(f,f.phase)*6e4-f.paused);f.paused=null}else f.paused=focusLeft();save();pushSchedule(true);paintFocus();fmSync(true)}
function fmStart(){
  if(!('mediaSession' in navigator)||FM.on)return;
  try{if(!FM.a){FM.a=new Audio(silentWav());FM.a.loop=true;FM.a.setAttribute('playsinline','')}
    if(!fmJarvisTalking()){const p=FM.a.play();if(p&&p.catch)p.catch(()=>{FM.on=false})}FM.on=true;
    fmHandlers();
    setTimeout(()=>fmSync(true),80)}catch(e){}}
/* lock-screen play/pause/next belong to the focus timer, except while JARVIS is talking (see fmYield) */
function fmHandlers(){try{const ms=navigator.mediaSession;
  ms.setActionHandler('play',()=>{fmToggle()});ms.setActionHandler('pause',()=>{fmToggle()});
  try{ms.setActionHandler('nexttrack',()=>{skipPhase();fmSync(true)})}catch(e){}
  try{ms.setActionHandler('stop',()=>{openFocusRun()})}catch(e){}}catch(e){}}
/* JARVIS's voice (ui4 JA) and this silent loop share one iOS audio session. While JARVIS speaks, the loop must not
   restart (that would cut the voice off at the minute mark) and the lock-screen buttons control the voice instead. */
function fmJarvisTalking(){try{return!!(FM.yield||(typeof JH!=='undefined'&&JH.playing))}catch(e){return!!FM.yield}}
function fmYield(on,audio){FM.yield=!!on;if(!('mediaSession' in navigator))return;
  try{const ms=navigator.mediaSession;
    if(on){ms.setActionHandler('play',()=>{try{audio&&audio.play()}catch(e){}});ms.setActionHandler('pause',()=>{try{audio&&audio.pause()}catch(e){}});
      try{ms.setActionHandler('nexttrack',null)}catch(e){}try{ms.setActionHandler('stop',()=>{try{audio&&audio.pause()}catch(e){}})}catch(e){}
      try{ms.metadata=new MediaMetadata({title:'JARVIS',artist:'Life',artwork:[{src:'icon-512.png',sizes:'512x512',type:'image/png'}]});ms.playbackState='playing'}catch(e){}}
    else if(FM.on){fmHandlers();fmSync(true)}
    else{try{ms.metadata=null;ms.playbackState='none'}catch(e){}}}catch(e){}}
function fmStop(){FM.on=false;FM.key='';try{FM.a&&FM.a.pause()}catch(e){}try{navigator.mediaSession.metadata=null;navigator.mediaSession.playbackState='none'}catch(e){}}
function fmSync(force){
  if(!FM.on)return;const f=FOCUS();if(!f){fmStop();return}if(fmJarvisTalking())return;
  const ph=f.phase==='ready'?'ready':f.phase,len=phaseLen(f,ph==='ready'?f.nextPhase:ph)*60,left=Math.ceil(focusLeft()/1000),mm=Math.floor(left/60);
  const title=ph==='ready'?`Ready · ${PHASE[f.nextPhase][0]} next`:`${PHASE[ph][0]} · ${mm}:${pad(left%60)} left${f.paused!=null?' · paused':''}`;
  const key=`${ph}|${f.paused!=null}|${f.round}|${mm}`;if(!force&&key===FM.key)return;FM.key=key;
  try{const ms=navigator.mediaSession;
    const art=fmArt(ph==='ready'?'▶':`${mm}′`,PHASE[ph][1]);
    ms.metadata=new MediaMetadata({title,artist:f.label||'Focus',album:f.mode==='single'?'Life · Focus timer':`Life · Pomodoro round ${((f.round-1)%f.cfg.rounds)+1}/${f.cfg.rounds}`,artwork:[...(art?[{src:art,sizes:'512x512',type:'image/png'}]:[]),{src:'icon-512.png',sizes:'512x512',type:'image/png'}]});
    if(ph!=='ready'&&len>0&&ms.setPositionState)ms.setPositionState({duration:len,position:Math.max(0,Math.min(len,len-left)),playbackRate:1});
    const paused=f.paused!=null||ph==='ready';ms.playbackState=paused?'paused':'playing';
    if(paused){FM.a.pause()}else if(FM.a.paused){FM.a.play().catch(()=>{})}}catch(e){}}
/* any tap on a focus control is a real user gesture, which is what lets the card appear */
window.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#fcGo,#fcNext,#fcPause,#fcPill,#fcOpen,[data-focus]'))fmStart()},true);
setInterval(()=>{if(FOCUS()){if(FM.on)fmSync(false)}else if(FM.on)fmStop()},1000);

/* no sounds from Life for now; turning "Tick sound" on in Look & feel brings it back */
const _tick3=tick;tick=function(){if(lsGet('ishiros.snd')==='1')_tick3()};
document.addEventListener('click',e=>{const b=e.target.closest('[data-snd]');if(b)lsSet('ishiros.snd',b.dataset.snd)},true);
