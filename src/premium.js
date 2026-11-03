/* ===================== Nov 3: premium pass =====================
   One surface system (deep, cool graphite cards; nested tiles one clear step lighter), reminders as their own cards,
   deadlines as countdown tickets, masonry on wide screens (no holes), collapsible Today sections, no flicker on habit taps,
   and nudges through the day (meals, protein, gym, steps, sitting). */
const DK=(sel,css)=>`:root[data-theme="dark"] ${sel}{${css}}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) ${sel}{${css}}}`;
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="prem">
/* ---- tokens: cooler, deeper dark theme ---- */
${DK('','--surface:#181818;--surface2:#252525;--line:#313131;--muted:#A3A3A3;--ink2:#D9D9D9;--card-shadow:inset 0 1px 0 rgb(255 255 255 / .05);--pf1:#1B1B1B;--pf2:#171717;--pin:#262626;--pin2:#2A2A2A;--pedge:rgb(255 255 255 / .10);--pedge2:rgb(255 255 255 / .14)')}
/* ---- cards ---- */
${DK('#view .card-s,#view .habit,#view .tile,#view .stat,#view .hstat,#view .gcard','background:linear-gradient(180deg,var(--pf1),var(--pf2))!important;border:1px solid var(--pedge)!important;box-shadow:inset 0 1px 0 rgb(255 255 255 / .045)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important')}
${DK('#view .card-s :is(.card-s,.habit,.tile,.stat,.hstat,.tchip,.kb-card,.cd-i,.dl,.caf-b,.jd-r)','background:linear-gradient(180deg,var(--pin2),var(--pin))!important;border:1px solid var(--pedge2)!important;box-shadow:inset 0 1px 0 rgb(255 255 255 / .06)!important')}
${DK('#view .sec .sec-h h2 em','text-shadow:none')}
/* the old grey steps are gone: every Today card uses the same deep surface */
#view .sec[data-shade]{--shd:var(--pf2)}
/* habit + progress tiles: deep card, ring track darker, crisp label */
${DK('#view .habit .hring','background:radial-gradient(closest-side,#121212 79%,transparent 80% 100%),conic-gradient(var(--accent) var(--p),#333333 0)')}
${DK('#view .habit small,#view .tile .cap','color:#AAAAAA')}
/* ---- hero mini tiles (steps / sleep / due / spent): solid dark glass for contrast ---- */
.hero .ts-grid>button{background:rgb(0 0 0 / .45)!important;border:1px solid rgb(255 255 255 / .12)!important;box-shadow:inset 0 1px 0 rgb(255 255 255 / .08)!important}
.hero .ts-grid>button b{color:#F6F3EC!important}
.hero .ts-grid>button small{filter:brightness(1.25) saturate(1.1);font-weight:700}
.hero .ts-leg>button{background:rgb(0 0 0 / .32)!important;border-color:rgb(255 255 255 / .10)!important}

/* ---- reminders: each its own card; badge · title + meta · check ---- */

ul.rml>li.row.rmd{position:relative;display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:12px;padding:12px 12px 12px 12px!important;border-radius:20px;min-height:0;
  background:linear-gradient(180deg,var(--pf1,var(--surface)),var(--pf2,var(--surface)))!important;border:1px solid var(--pedge,var(--line))!important;box-shadow:inset 0 1px 0 rgb(255 255 255 / .045)!important;overflow:hidden}

li.row.rmd::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(90% 160% at 0% 50%,color-mix(in srgb,var(--imp) 16%,transparent),transparent 55%);opacity:0}

.rm-b{position:relative;z-index:1;width:42px;height:42px;border-radius:13px;display:grid;place-items:center;color:var(--imp);background:var(--surface2);box-shadow:inset 0 0 0 1px rgb(255 255 255 / .08)}
.rm-b svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.lv-Urgent .rm-b{box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--imp) 70%,transparent)}
li.rmd .rowbtn{position:relative;z-index:1;display:flex!important;flex-direction:column;align-items:flex-start;gap:5px;min-width:0;padding:0!important;text-align:left}
li.rmd .rt{font-size:15.5px;line-height:1.25;font-weight:700;white-space:normal!important;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;max-width:100%}
.rm-m{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;font:600 12.5px var(--ui);color:var(--muted)}
.rm-m b{font:800 10.5px/1 var(--ui);letter-spacing:.09em;text-transform:uppercase;color:var(--imp)}
.rm-m .late{color:var(--late);font-weight:800}.rm-m .tdy{color:var(--soon);font-weight:700}
li.rmd .chk{position:relative;z-index:1;margin:0!important}

li.rmd.done{opacity:.6}
/* ---- deadlines: countdown tickets ---- */
.dls{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.dl{position:relative;display:flex;flex-direction:column;gap:6px;padding:13px 14px 14px;border-radius:20px;text-align:left;min-width:0;overflow:hidden;
  background:linear-gradient(180deg,var(--pf1,var(--surface)),var(--pf2,var(--surface)));border:1px solid var(--pedge,var(--line));box-shadow:inset 0 1px 0 rgb(255 255 255 / .045)}

.dl .cd-l{position:static!important;width:auto!important;height:auto!important;display:flex!important;align-items:baseline;gap:5px;color:var(--u);place-items:initial}
.dl .cd-l span{font:800 25px/1 var(--mono);letter-spacing:-.04em}.dl .cd-l small{font:700 14px/1 var(--mono);opacity:.75}
.dl-t{font-weight:700;font-size:14px;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:var(--ink)}
.dl-s{font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dl-bar{display:block;height:3px;border-radius:3px;background:rgb(255 255 255 / .07);margin-top:4px;overflow:hidden}
.dl-bar>i{display:block;height:100%;border-radius:3px;background:var(--u)}
:root[data-theme="light"] .dl-bar{background:rgb(0 0 0 / .07)}
/* ---- motivation line on Today ---- */
.mot{display:flex;align-items:center;gap:12px;width:100%;margin:14px 0 0;padding:12px 14px;border-radius:18px;text-align:left;
  background:linear-gradient(180deg,var(--pf1,var(--surface)),var(--pf2,var(--surface)));border:1px solid var(--pedge,var(--line))}
.mot .mi{flex:none;width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:var(--surface2);color:var(--accent)}
.mot .mi svg.i{width:18px;height:18px}
.mot b{display:block;font-size:14.5px;line-height:1.3}.mot small{display:block;margin-top:2px;font-size:12.5px;color:var(--muted)}
/* ---- collapsible Today sections ---- */
html[data-ltab="today"] #view .sec-h h2{cursor:pointer}
html[data-ltab="today"] #view .sec-h h2::after{content:"";display:inline-block;width:7px;height:7px;margin:0 0 4px 10px;border-right:2px solid var(--muted);border-bottom:2px solid var(--muted);transform:rotate(45deg);opacity:.55;transition:transform .25s}
#view .sec.col .sec-h h2::after{transform:rotate(-45deg);margin-bottom:1px}
#view .sec.col>:not(.sec-h){display:none!important}
#view .sec.col{margin-bottom:-4px}
/* ---- wide screens: masonry (rows of 4px; each card spans its own height, so columns pack with no holes) ---- */
html:not([data-lay="port"]) .pane.mas{grid-auto-rows:4px!important;row-gap:0!important;align-items:start}
html:not([data-lay="port"]) .pane.mas>.sec{margin-top:0!important;padding-top:20px}
/* ---- small fixes ---- */
.caf.cafE .small{margin:0 0 10px!important}
.dl .cd-l{display:block!important;text-align:left;white-space:nowrap}.dl .cd-l small{margin-left:5px}
/* nested corners follow the outer card (outer radius minus its padding) */
#view .card-s :is(.card-s,.habit,.tile,.stat,.hstat,.tchip,.kb-card,.caf-b,.cw-row,.rc-row){border-radius:14px}
html:not([data-lay="port"]) .pane>.sprig{order:99}
/* wide hero: rings + bars on the left, the four stats as a 2×2 on the right */
html:not([data-lay="port"]) .tsum{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);column-gap:28px;align-items:center}
html:not([data-lay="port"]) .tsum>.ts-top,html:not([data-lay="port"]) .tsum>.ts-next,html:not([data-lay="port"]) .tsum>.hero-actions{grid-column:1/-1}
html:not([data-lay="port"]) .tsum>.ts-grid{grid-template-columns:repeat(2,minmax(0,1fr));margin-top:0}
html:not([data-lay="port"]) .tsum .hero-actions{max-width:640px}
/* long lists start short */
.cw.short .cw-row:nth-of-type(n+5){display:none}
.cw-more{display:block;width:100%;margin-top:6px;padding:10px 0 0;border-top:1px solid var(--pedge,var(--line));text-align:center;font:700 13px var(--ui);color:var(--muted)}
</style>`);
(document.body||document.head).insertAdjacentHTML('beforeend',`<style>${DK('#view .sec[data-shade] :is(.card-s,.habit,.stat,.ts-tile,.hstat,.tchip,.il-spark)','background:linear-gradient(180deg,var(--pf1),var(--pf2))!important;border:1px solid var(--pedge)!important;box-shadow:inset 0 1px 0 rgb(255 255 255 / .045)!important')}${DK('#view .sec[data-shade] .card-s :is(.card-s,.habit,.stat,.ts-tile,.hstat,.tchip)','background:linear-gradient(180deg,var(--pin2),var(--pin))!important;border:1px solid var(--pedge2)!important;box-shadow:inset 0 1px 0 rgb(255 255 255 / .06)!important')}</style>`);

/* ---- reminders ---- */
const RM_I={Urgent:'<path d="M5.5 3.2v6.2M5.5 12.6v.2M10.5 3.2v6.2M10.5 12.6v.2"/>',High:'<path d="M8 3.2v6.4M8 12.6v.2"/>',Normal:'<path d="M3.6 8.4l2.9 2.9 5.9-6.6"/>',Low:'<path d="M8 3.2v8.6M4.6 8.6L8 12l3.4-3.4"/>'};
{const _rowP=row;row=function(e){const h=_rowP(e);if(!e||e.type!=='reminder')return h;
  const k=IMP[e.importance]?e.importance:'Normal',chk=(h.match(/<button class="chk[\s\S]*?<\/button>/)||[''])[0],sub=subOf(e)||'',n=e.due?dayDiff(e.due):null;
  return`<li class="row rmd lv-${k}${e.done?' done':''}" style="--imp:${IMP[k]}"><span class="rm-b" aria-hidden="true"><svg viewBox="0 0 16 16">${RM_I[k]}</svg></span><button class="rowbtn" data-open="${esc(e.id)}"><span class="rt">${esc(titleOf(e))}</span><span class="rm-m"><b>${k}</b>${sub?`<span class="${!e.done&&n!=null&&n<0?'late':!e.done&&n===0?'tdy':''}">${esc(sub)}</span>`:''}</span></button>${chk}</li>`}}

/* ---- deadlines ---- */
countdownCard=function(projOnly){const D=deadlines(projOnly);if(!D.length)return'';const now=Date.now();
  return section('Deadlines',`<div class="dls">${D.map(x=>{const tot=x.due-x.start,left=x.due-now,p=Math.max(0,Math.min(1,1-left/tot)),col=left<864e5?'#FF7A55':left<3*864e5?'#F0B35C':'#86CFA0';
    return`<button class="dl" ${x.open?`data-open="${esc(x.open)}"`:''} data-cdue="${x.due}" data-cstart="${x.start}" style="--u:${col}"><b class="num cd-l">${leftHtml(left)}</b><span class="dl-t">${esc(x.title||'')}</span><span class="dl-s">${esc(x.sub||'')} · ${esc(relDue(iso(new Date(x.due))))}</span><i class="dl-bar"><i style="width:${(p*100).toFixed(1)}%"></i></i></button>`}).join('')}</div>`)};
setInterval(()=>{if(document.hidden)return;const now=Date.now();document.querySelectorAll('.dl[data-cdue]').forEach(b=>{const l=b.querySelector('.cd-l');if(l)l.innerHTML=leftHtml(+b.dataset.cdue-now)})},30000);

/* ---- habit taps update in place (the whole screen used to re-render, which flickered) ---- */
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-habit]');if(!b||!b.closest('#view'))return;
  e.preventDefault();e.stopImmediatePropagation();
  const h=habits().find(x=>x.id===b.dataset.habit);if(!h)return;const td=today(),L=hlog();L[td]=L[td]||{};const c=hCount(h,td);L[td][h.id]=c>=h.target?0:c+1;save();
  try{const tmp=document.createElement('div');tmp.innerHTML=habitSection();const nb=tmp.querySelector(`[data-habit="${CSS.escape(h.id)}"]`);
    if(nb){b.className=nb.className;b.setAttribute('aria-label',nb.getAttribute('aria-label'));const r=b.querySelector('.hring'),nr=nb.querySelector('.hring');if(r&&nr)r.style.setProperty('--p',nr.style.getPropertyValue('--p'));
      const s=b.querySelector('small'),ns=nb.querySelector('small');if(s&&ns){s.innerHTML=ns.innerHTML;try{deEmoji(s)}catch(x){}}}}catch(x){}
  try{for(const k in VIEWS)if(k!==state.tab)delete VIEWS[k]}catch(x){}
  if(L[td][h.id]>=h.target){tick();try{anim(b,{scale:[.9,1]},{spring:true,k:500,d:14})}catch(x){}const s=hStreak(h);if(s>1)toast(`${h.name} · ${s}-day streak`)}},true);

/* ---- progress tiles: right icons (footprints for steps, bed for sleep) and MacroFactor protein ---- */
{const _ht=healthTiles;healthTiles=function(){let h=_ht();const parts=h.split('<div class="tile card-s">');if(parts.length>=4){parts[1]=parts[1].replace(/<svg class="i"[\s\S]*?<\/svg>/,ic('steps'));parts[2]=parts[2].replace(/<svg class="i"[\s\S]*?<\/svg>/,ic('bed'));h=parts.join('<div class="tile card-s">')}return h}}
{const _tl=tiles;tiles=function(){let h=_tl();try{const x=jDay(today());if(x.src==='MacroFactor'&&x.prot){const g=db.settings;h=h.replace(/(<button class="tile card-s" data-goto="health:food">)[\s\S]*?(<\/button>)/,`$1${ring(x.prot/g.protein,'food')}<div><b class="num">${fmtN(Math.round(x.prot))}<small>g</small></b><div class="cap">Protein</div></div>$2`)}}catch(e){}return h}}

/* ---- caffeine with nothing logged: one line, not a paragraph ---- */
{const _cc=caffeineCard;caffeineCard=function(){let h=_cc();if(/Nothing in your system/.test(h))h=h.replace('class="card-s caf"','class="card-s caf cafE"').replace(/Nothing in your system\.[^<]*/,'Nothing in your system. Tap what you drink:');return h}}

/* ---- motivation line: the one thing that moves the cut forward right now ---- */
function motLine(){try{
  const J=JRN(),hr=new Date().getHours(),x=jDay(today()),g=jGym(),tr=jTrend(),cur=tr[tr.length-1].t,lost=num(J.startW)-cur,day=Math.max(1,dayDiff(J.start)*-1+1);
  const weighed=of('weight').some(e=>e.date===today()&&!e.sample),wd=(new Date().getDay()+6)%7,daysLeft=7-wd,needGym=Math.max(0,J.gymDays-g.now);
  const pick=[];
  if(!weighed&&hr<12)pick.push(['weight',`Day ${day} of the cut — weigh in before breakfast`,`Started at ${num(J.startW)} · goal ${J.lo}–${J.hi}`]);
  if(hr>=15&&x.prot<J.protein*.5)pick.push(['food',`Protein ${Math.round(x.prot)} of ${J.protein} g`,'Behind for this time of day']);
  if(needGym&&!x.gym.length&&hr>=12&&needGym>=daysLeft-1)pick.push(['workout',`${needGym} gym day${needGym>1?'s':''} left to hit ${J.gymDays} this week`,needGym>=daysLeft?'Today is a must':'Going today keeps the week safe']);
  if(hr>=17&&x.steps&&x.steps<J.steps*.6)pick.push(['steps',`${fmtN(x.steps)} steps — a 20-minute walk adds about 2,000`,`Goal ${fmtN(J.steps)}`]);
  if(hr>=19&&x.eaten&&x.eaten<jKcal()-900)pick.push(['food',`${fmtN(Math.round(jKcal()-x.eaten))} kcal left — eat a real dinner`,'Too big a deficit costs muscle']);
  if(x.prot>=J.protein)pick.push(['check','Protein goal hit','Muscle protected for today']);
  if(!pick.length)pick.push(['activity',lost>=.3?`Down ${lost.toFixed(1)} lb since ${fmtDate(J.start)}`:`Day ${day} of the cut`,g.streak?`${g.streak}-week gym streak · keep it going`:`${g.now}/${J.gymDays} gym days this week`]);
  const [i,t,s]=pick[0];return`<button class="mot" data-goto="health:journey"><span class="mi">${ic(i)}</span><span><b>${esc(t)}</b><small>${esc(s)}</small></span></button>`}catch(e){return''}}
{const _vtM=viewToday;viewToday=function(){let h=_vtM();const m=motLine();if(m){const i=h.indexOf('</section>',h.indexOf('<section class="hero'));if(i>0)h=h.slice(0,i+10)+m+h.slice(i+10)}return h}}

/* ---- collapsible Today sections (tap a heading) ---- */
let TCOLS=(()=>{try{return new Set(JSON.parse(localStorage.getItem('lifeCollapsed')||'[]'))}catch(e){return new Set()}})();
const secKey=s=>{const h=s.querySelector('.sec-h h2');return h?h.textContent.trim().toLowerCase():''};
function applyCols(){if(state.tab!=='today')return;document.querySelectorAll('#view .sec').forEach(s=>s.classList.toggle('col',TCOLS.has(secKey(s))))}
document.addEventListener('click',e=>{const h=e.target.closest('#view .sec-h h2');if(!h||state.tab!=='today'||e.target.closest('button,a'))return;
  const s=h.closest('.sec'),k=secKey(s);if(!k)return;TCOLS.has(k)?TCOLS.delete(k):TCOLS.add(k);try{localStorage.setItem('lifeCollapsed',JSON.stringify([...TCOLS]))}catch(x){}
  s.classList.toggle('col',TCOLS.has(k));masonry()});

/* ---- masonry for wide screens ---- */
let masT=0;const masRO=typeof ResizeObserver==='function'?new ResizeObserver(()=>{cancelAnimationFrame(masT);masT=requestAnimationFrame(masonry)}):null;
function masonry(){
  const wide=document.documentElement.dataset.lay!=='port';
  document.querySelectorAll('#view .pane').forEach(p=>{
    if(!wide){if(p.classList.contains('mas')){p.classList.remove('mas');[...p.children].forEach(c=>c.style.gridRowEnd='')}return}
    if(getComputedStyle(p).display!=='grid')return;p.classList.add('mas');
    for(const c of p.children){if(c.offsetParent===null&&getComputedStyle(c).display==='none'){c.style.gridRowEnd='';continue}
      const cs=getComputedStyle(c),hgt=c.getBoundingClientRect().height+parseFloat(cs.marginTop||0)+parseFloat(cs.marginBottom||0);
      c.style.gridRowEnd=`span ${Math.max(1,Math.ceil(hgt/4))}`;if(masRO&&!c.__mo){c.__mo=1;masRO.observe(c)}}})}
{const _rP=render;render=function(){const r=_rP.apply(this,arguments);document.documentElement.dataset.ltab=state.tab;try{applyCols()}catch(e){}requestAnimationFrame(masonry);setTimeout(masonry,400);return r}}
addEventListener('resize',()=>{cancelAnimationFrame(masT);masT=requestAnimationFrame(masonry)});
try{document.fonts&&document.fonts.ready.then(()=>masonry())}catch(e){}

/* ---- nudges through the day (pushed by your server; MacroFactor/Fitbit checks happen there at send time) ---- */
{const _bs=buildSchedule;buildSchedule=function(){const out=_bs();try{
  const n=NS();if(!n.nudges||typeof JRN!=='function')return out;
  const J=JRN(),now=Date.now(),add=(id,dt,title,body,cond,url)=>{const t=dt.getTime();if(t>now-6e4&&t<now+2*864e5)out.push({id,at:dt.toISOString(),title,body,url:url||APP_URL+'#today',tag:id,...(cond?{cond}:{})})};
  for(let i=0;i<2;i++){const d=addDays(i);if(d<J.start)continue;const x=jDay(d),wd=(new Date(d+'T12:00').getDay()+6)%7;
    const busy=m=>dayItems(d).some(e=>{const cl=e.type==='class'||e.type==='ext';const s=toMin(cl?e.start:e.time);if(s==null)return false;let en=cl?toMin(e.end):s+60;if(en==null||en<=s)en=s+60;return m>=s-5&&m<=en})
    /* meals: skipped on the server if MacroFactor (via Apple Health) already shows enough */
    if(x.eaten<150)add(`nu:bf:${d}`,atMin(d,10*60+30),'Breakfast logged?','Log it in MacroFactor — protein early makes 180 g easy.',{kcalBelow:150});
    if(x.eaten<600)add(`nu:ln:${d}`,atMin(d,14*60),'Lunch check','Nothing much logged yet. Log lunch so the day’s numbers stay honest.',{kcalBelow:600});
    if(x.eaten<1400)add(`nu:dn:${d}`,atMin(d,20*60+15),'Close the day','Log dinner in MacroFactor. A logged day is a day that counts.',{kcalBelow:1400});
    if(x.prot<J.protein*.65)add(`nu:pr:${d}`,atMin(d,18*60+30),`Protein check · goal ${J.protein} g`,'Under two-thirds of your goal so far.',{proteinBelow:Math.round(J.protein*.65)});
    if(x.steps<J.steps*.7)add(`nu:st:${d}`,atMin(d,19*60+30),'Steps are low today','A 20-minute walk adds about 2,000 steps and ~100 kcal.',{stepsBelow:Math.round(J.steps*.7)});
    /* gym: only when this week's target is in danger */
    if(!x.gym.length){const g=jGym(),need=Math.max(0,J.gymDays-(i===0?g.now:g.now)),left=7-wd;if(need&&need>=left-1)add(`nu:gy:${d}`,atMin(d,16*60+45),need>=left?'Gym today — no slack left':'Gym today keeps the week on track',`${need} session${need>1?'s':''} still needed for ${J.gymDays} this week.`)}
    /* sitting: weekdays 10:50-18:50, skipped during classes/meetings and on the server if you've moved */
    if(wd<5)for(let m=10*60+50;m<=18*60+50;m+=60){if(busy(m))continue;add(`nu:mv:${d}:${m}`,atMin(d,m),'Stand up for 3 minutes','You’ve been sitting about an hour. Walk, refill water, stretch.',{moveBelow:250})}
  }}catch(e){}return out.sort((a,b)=>a.at.localeCompare(b.at)).slice(0,300)}}

/* campus: first four places, the rest one tap away */
let CW_ALL=false;
{const _cw=crowdCard;crowdCard=function(){let h=_cw();if(CW_ALL)return h;return h.replace('class="card-s cw"','class="card-s cw short"').replace(/(<p class="small" style="margin:10px 0 0;opacity:\.7">)/,'<button class="cw-more" data-cwall>Show all 9 places</button>$1')}}
document.addEventListener('click',e=>{if(!e.target.closest('[data-cwall]'))return;e.preventDefault();e.stopImmediatePropagation();CW_ALL=true;const y=SC.scrollTop;render(false);SC.scrollTop=y},true);
/* insights with too little data: one line */
{const _vtI=viewToday;viewToday=function(){let h=_vtI();return h.replace(/Insights appear once there are about 10 days[^<]*/,'Insights unlock after about 10 days of synced sleep and logging.')}}


/* the end-of-intro halo burst over every card read as white flashes: off */
ixGlowAll=function(){};
/* coming back to Life within 30 minutes never replays the intro (iOS sometimes reloads the app in the background) */

document.addEventListener('visibilitychange',()=>{if(document.hidden)try{localStorage.setItem('lifeHiddenAt',String(Date.now()))}catch(e){}});
addEventListener('pagehide',()=>{try{localStorage.setItem('lifeHiddenAt',String(Date.now()))}catch(e){}});

/* reminder lists: decided in the HTML, not with :has() (iOS kept the old box after switching tabs) */
const rmlFix=h=>h.replace(/<ul class="list card-s">((?:(?!<\/ul>)[\s\S])*?)<\/ul>/g,(m,inner)=>{const lis=inner.match(/<li\b[^>]*>/g)||[];return lis.length&&lis.every(t=>/class="row rmd/.test(t))?`<ul class="list rml">${inner}</ul>`:m});
/* no eval here: the app's security policy blocks it (that's why the box kept coming back on the phone) */
{const f=viewToday;viewToday=function(){return rmlFix(f.apply(this,arguments))}}
{const f=viewMind;viewMind=function(){return rmlFix(f.apply(this,arguments))}}
{const f=viewPlan;viewPlan=function(){return rmlFix(f.apply(this,arguments))}}
{const f=viewWork;viewWork=function(){return rmlFix(f.apply(this,arguments))}}
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="rmfix2">
ul.list.rml{display:grid;gap:10px;margin:0;padding:0;list-style:none;background:none;border:0;box-shadow:none}
ul.rml>li.row.rmd{border-radius:22px!important;margin:0!important}
ul.rml>li.row.rmd .rm-b{border-radius:10px}
ul.list.card-s>li.row.rmd{display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:12px}
ul.list.card-s>li.row.rmd .rm-b{border-radius:12px}
</style>`);
