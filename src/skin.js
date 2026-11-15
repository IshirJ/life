/* ============================================================================
   SIGNAL — behaviour half. The look is skin.css (inlined in <head>).
   This file switches html[data-skin], adds the page headline, runs the dock,
   the tab change and the opening, and puts the Classic / Signal switch in
   Look & feel. With Classic selected every function here steps aside.
   ========================================================================== */
const SKIN_KEY='lifeSkin',SKIN='signal';
function skinOn(){return document.documentElement.dataset.skin===SKIN}
const sgPort=()=>document.documentElement.dataset.lay==='port';
function sgLight(){const r=document.documentElement;return r.dataset.theme==='light'||(!r.dataset.theme&&matchMedia('(prefers-color-scheme:light)').matches)}
function skinSet(v){
  const r=document.documentElement,on=v===SKIN,was=skinOn();
  if(on)r.dataset.skin=SKIN;else r.removeAttribute('data-skin');
  try{localStorage.setItem(SKIN_KEY,on?SKIN:'')}catch(e){}
  const m=document.querySelector('meta[name="theme-color"]');
  if(m){if(!m.dataset.orig)m.dataset.orig=m.content;m.content=on?(sgLight()?'#E8E7E2':'#151515'):m.dataset.orig}
  if(was!==on){try{for(const k in VIEWS)delete VIEWS[k]}catch(e){}}   /* pages are cached per interface */
}
{const _al=applyLook;applyLook=function(){const r=_al.apply(this,arguments);try{skinSet(db.settings.skin===SKIN?SKIN:'classic');
  /* Signal has one palette: the Classic accent and big-card colours stay saved for Classic, they are just not applied here */
  if(skinOn()){const st=document.documentElement.style;st.removeProperty('--accent');st.removeProperty('--sage');st.removeProperty('--sage-soft')}}catch(e){}return r}}
{const _lp=lookPanel;lookPanel=function(){let h=_lp.apply(this,arguments);const cur=db.settings.skin===SKIN?SKIN:'classic';
  const seg=`<div class="lookset"><span class="cap">Interface</span><div class="seg2"><button data-look="skin" data-val="classic" aria-pressed="${cur==='classic'}">Classic</button><button data-look="skin" data-val="${SKIN}" aria-pressed="${cur===SKIN}">Signal</button></div>
    <p class="hint" style="margin:8px 0 0">Signal is a second interface for the same app. Classic stays one tap away, and nothing you have saved changes.</p></div>`;
  h=h.replace('<p class="hint">Changes apply instantly behind this panel.</p>','<p class="hint">Changes apply instantly behind this panel.</p>'+seg);
  h=h.replace('<div class="lookset"><span class="cap">Big card colour</span>','<div class="lookset" id="lookHero"><span class="cap">Big card colour</span>');
  h=h.replace('<div class="lookset"><span class="cap">Accent colour</span>','<div class="lookset" id="lookAccent"><span class="cap">Accent colour</span>');
  return h}}
{const _sl=setLook;setLook=function(key,val){if(key==='skin'){db.settings.skin=val===SKIN?SKIN:'';save();applyLook();
    try{render(false)}catch(e){}setTimeout(()=>{try{moveInd(true)}catch(e){}},60);
    try{document.querySelectorAll('[data-look="skin"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.val===(val===SKIN?SKIN:'classic'))))}catch(e){}
    return}
  return _sl.apply(this,arguments)}}

/* ---------- the scene: every tab opens on a drawn landscape; the orange disc is its sun ----------
   The sky follows the clock, the sun follows the hour, and the land is built from that tab's own data. */
const SG_W=390,SG_H=210;
function sgRnd(seed){let s=seed%2147483647;if(s<=0)s+=2147483646;return()=>((s=s*16807%2147483647)-1)/2147483646}
function sgPeaks(seed,base,amp,n){const r=sgRnd(seed);let d=`M0 ${SG_H} L0 ${base}`;for(let i=1;i<=n;i++){const x=i*SG_W/n,pk=x-SG_W/n/2+(r()-.5)*14;d+=` L${pk.toFixed(1)} ${(base-amp*(.45+r()*.55)).toFixed(1)} L${x.toFixed(1)} ${(base-amp*r()*.25).toFixed(1)}`}return d+` L${SG_W} ${SG_H}Z`}
function sgDunes(vals,base,amp){const n=vals.length,mx=Math.max(1,...vals),pt=i=>[i*SG_W/(n-1),base-amp*(vals[i]/mx)];let d=`M0 ${SG_H} L0 ${pt(0)[1].toFixed(1)}`,line=`M0 ${pt(0)[1].toFixed(1)}`;
  for(let i=1;i<n;i++){const[x0,y0]=pt(i-1),[x1,y1]=pt(i),mxp=(x0+x1)/2,seg=` C${mxp.toFixed(1)} ${y0.toFixed(1)} ${mxp.toFixed(1)} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;d+=seg;line+=seg}return[d+` L${SG_W} ${SG_H}Z`,line]}
function sgSteps(seed,base,amp,n){const r=sgRnd(seed);let d=`M0 ${SG_H} L0 ${base}`,y=base;for(let i=0;i<n;i++){const x0=i*SG_W/n,x1=(i+1)*SG_W/n;y=base-amp*(.2+r()*.8);d+=` L${x0.toFixed(1)} ${y.toFixed(1)} L${x1.toFixed(1)} ${y.toFixed(1)}`}return d+` L${SG_W} ${SG_H}Z`}
function sgWeekLoad(){const out=[],now=new Date(),dow=(now.getDay()+6)%7;for(let i=0;i<7;i++){const k=addDays(i-dow);let c=0;
  try{c=db.entries.filter(e=>!e.done&&(e.due===k||e.date===k)).length}catch(e){}
  try{const wd=new Date(k+'T12:00').getDay();c+=db.entries.filter(e=>e.type==='class'&&Array.isArray(e.days)&&e.days.includes(wd)).length}catch(e){}
  out.push(c)}return{v:out,dow}}
function sgSky(){const h=new Date().getHours()+new Date().getMinutes()/60;
  /* how much of the horizon is lit: full at sunrise and sunset, a low ember through the night */
  const day=h>=6&&h<=20,t=day?(h-6)/14:0,g=day?.55+.45*Math.abs(Math.cos(Math.PI*t)):.28;
  return{h,day,t,g}}
function sgSun(k,W){const s=sgSky();
  if(k==='today'){const x=W*(.6+.24*(s.day?s.t:.5)),y=s.day?292-Math.sin(Math.PI*s.t)*62:300;return{x,y,d:150}}
  return{plan:{x:W*.8,y:150,d:78},work:{x:W*.66,y:236,d:196},health:{x:W*.8,y:170,d:112},mind:{x:W*.74,y:136,d:62}}[k]||{x:W*.75,y:180,d:110}}
function sgScene(k){
  const W=Math.min(innerWidth,sgPort()?innerWidth:1200),s=sgSky(),sun=sgSun(k,W),g=s.g;
  const sky=`linear-gradient(180deg,#17121c 0%,#3d1c2b ${(52-28*g).toFixed(0)}%,#a63f2b ${(84-22*g).toFixed(0)}%,#ef8a3c ${(100-14*g).toFixed(0)}%,#f6c27a ${(112-10*g).toFixed(0)}%)`;
  let land='',extra='';
  if(k==='today')land=`<svg class="sgr r1" viewBox="0 0 ${SG_W} ${SG_H}" preserveAspectRatio="none"><path d="${sgPeaks(11,128,74,5)}"/></svg><svg class="sgr r2" viewBox="0 0 ${SG_W} ${SG_H}" preserveAspectRatio="none"><path d="${sgPeaks(29,158,56,4)}"/></svg><svg class="sgr r3" viewBox="0 0 ${SG_W} ${SG_H}" preserveAspectRatio="none"><path d="${sgPeaks(47,186,34,3)}"/></svg>`;
  else if(k==='plan'){const{v,dow}=sgWeekLoad(),mx=Math.max(3,...v),bw=SG_W/7;
    land=`<svg class="sgr r1" viewBox="0 0 ${SG_W} ${SG_H}" preserveAspectRatio="none"><path d="${sgSteps(5,150,40,9)}"/></svg><svg class="sgr r2 sgwk" viewBox="0 0 ${SG_W} ${SG_H}" preserveAspectRatio="none">${v.map((c,i)=>{const hh=34+92*(c/mx),x=i*bw+7;return`<rect class="${i===dow?'now':i<dow?'past':''}" x="${x.toFixed(1)}" y="${(SG_H-hh).toFixed(1)}" width="${(bw-14).toFixed(1)}" height="${(hh+30).toFixed(1)}" rx="12"/>`}).join('')}</svg>`}
  else if(k==='work')land=`<svg class="sgr r1" viewBox="0 0 ${SG_W} ${SG_H}" preserveAspectRatio="none"><path d="${sgSteps(3,120,70,6)}"/></svg><svg class="sgr r2" viewBox="0 0 ${SG_W} ${SG_H}" preserveAspectRatio="none"><path d="${sgSteps(17,160,52,8)}"/></svg><svg class="sgr r3" viewBox="0 0 ${SG_W} ${SG_H}" preserveAspectRatio="none"><path d="${sgSteps(23,188,30,5)}"/></svg>`;
  else if(k==='health'){let vals=[];try{vals=(HC.days||[]).slice(0,12).map(d=>num(d.steps)).reverse()}catch(e){}
    if(vals.filter(Boolean).length<4)vals=[5,7,4,8,6,9,5,7,8,6,9,7];const[d1,l1]=sgDunes(vals,150,84),[d2]=sgDunes(vals.map((x,i)=>vals[(i+4)%vals.length]),176,50);
    land=`<svg class="sgr r1" viewBox="0 0 ${SG_W} ${SG_H}" preserveAspectRatio="none"><path d="${d1}"/><path class="sgline" d="${l1}"/></svg><svg class="sgr r2" viewBox="0 0 ${SG_W} ${SG_H}" preserveAspectRatio="none"><path d="${d2}"/></svg><svg class="sgr r3" viewBox="0 0 ${SG_W} ${SG_H}" preserveAspectRatio="none"><path d="${sgDunes([3,5,4,6,4,5,3],196,22)[0]}"/></svg>`}
  else{let n=14;try{n=Math.min(46,10+db.entries.filter(e=>e.type==='idea'||e.type==='note'||e.type==='scrap').length*2)}catch(e){}
    const r=sgRnd(71),pts=[...Array(n)].map(()=>[(r()*SG_W).toFixed(1),(r()*150+6).toFixed(1),(r()*1.5+.6).toFixed(1)]);
    extra=`<svg class="sgstars" viewBox="0 0 ${SG_W} ${SG_H}" preserveAspectRatio="xMidYMid slice"><polyline points="${pts.slice(0,6).map(p=>p[0]+','+p[1]).join(' ')}"/>${pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="${p[2]}"/>`).join('')}</svg>`;
    land=`<svg class="sgr r2" viewBox="0 0 ${SG_W} ${SG_H}" preserveAspectRatio="none"><path d="${sgDunes([2,3,2,4,3,2,3],178,30)[0]}"/></svg><svg class="sgr r3" viewBox="0 0 ${SG_W} ${SG_H}" preserveAspectRatio="none"><path d="${sgDunes([3,2,3,2,4,3,2],198,18)[0]}"/></svg>`}
  let head;
  if(k==='today'){const d=new Date();let due=0;try{due=db.entries.filter(e=>(e.type==='task'||e.type==='reminder')&&!e.done&&e.due&&dayDiff(e.due)<=0).length}catch(e){}
    head=`<header class="sgh"><span class="sgl"><i>${esc(d.toLocaleDateString('en-US',{weekday:'long'}))}</i></span><span class="sgl sg2"><i>${d.getDate()} ${esc(d.toLocaleDateString('en-US',{month:'long'}))}</i></span></header>`
      +(due?`<button class="sgpill" data-goto="mind:reminder"><b>${due}</b>due today</button>`:'')}
  else head=`<header class="sgh"><span class="sgl"><i>${esc(TABS[k].title)}</i></span></header>`;
  return `<div class="sgscene" data-k="${k}"><div class="sgsky" style="background:${sky}"></div>${extra}<i class="sgsun" style="--sx:${(sun.x-sun.d/2).toFixed(0)}px;--sv:${(sun.y-sun.d/2).toFixed(0)}px;width:${sun.d}px;height:${sun.d}px"></i>${land}<div class="sggrain"></div><div class="sghd">${head}</div></div><div class="sgcap"><i></i></div>`}

/* Today, rebuilt: the classic summary card is read once and laid out again as tiles of different sizes */
const sgAttrs=el=>el?[...el.attributes].filter(a=>a.name!=='class'&&a.name!=='style').map(a=>`${a.name}="${esc(a.value)}"`).join(' '):'';
function sgBento(hero){
  const q=s=>hero.querySelector(s),qa=s=>[...hero.querySelectorAll(s)],tx=n=>n?n.textContent.trim():'';
  const ring=q('.ts-ring'),legs=qa('.ts-leg>button'),grid=qa('.ts-grid>button'),left=tx(qa('.ts-top .cap')[1]),verdict=tx(q('.ts-verdict')),next=q('.ts-pill'),acts=q('.hero-actions');
  if(!ring||legs.length<3||grid.length<2)return null;
  const leg=i=>{const b=legs[i],bar=b.querySelector('.tb i');return{a:sgAttrs(b),l:tx(b.querySelector('.tl')),v:tx(b.querySelector('.tv b')),g:tx(b.querySelector('.tv small')),p:Math.max(0,Math.min(100,parseFloat(bar&&bar.style.width)||0))}};
  const cal=leg(0),pro=leg(1),act=leg(2),lm=left.match(/^([\d,.\-]+)\s*(.*)$/),C=2*Math.PI*52,rp=Math.max(0,Math.min(100,parseFloat(tx(ring.querySelector('.ts-c b')).replace(/,/g,''))||0));
  const small=(b,cls,gfx)=>`<button class="sgt s ${cls}" ${sgAttrs(b)}><span class="n">${esc(tx(b.querySelector('b')))}</span><span class="l">${esc(tx(b.querySelector('small')))}</span>${gfx||''}</button>`;
  let bars='';try{const st=(HC.days||[]).slice(0,5).map(d=>num(d.steps)).reverse(),mx=Math.max(1,...st);if(st.length>=3)bars=`<span class="sgbars">${st.map((v,i)=>`<i class="${i===st.length-1?'on':''}" style="height:${Math.max(12,100*v/mx).toFixed(0)}%"></i>`).join('')}</span>`}catch(e){}
  const el=document.createElement('div');el.className='sgbento';
  el.innerHTML=`<button class="sgt big" ${sgAttrs(ring)}><span class="l">${esc(tx(ring.querySelector('.ts-c small'))||'today')}</span><span class="n">${esc(tx(ring.querySelector('.ts-c b')))}</span><span class="v">${esc(verdict)}</span>
      <svg class="sgring" viewBox="0 0 120 120"><circle cx="60" cy="60" r="52"/><circle class="a" cx="60" cy="60" r="52" stroke-dasharray="${(C*rp/100).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 60 60)"/><circle class="b" cx="60" cy="60" r="33" stroke-dasharray="${(2*Math.PI*33*pro.p/100).toFixed(1)} 400" transform="rotate(-90 60 60)"/></svg></button>
    <button class="sgt kc" ${cal.a}><span class="l">${esc(lm?lm[2]:'calories')}</span><span class="n">${esc(lm?lm[1]:cal.v)}</span><span class="sgliq" style="--lv:${(100-cal.p).toFixed(0)}%"><svg viewBox="0 0 240 20" preserveAspectRatio="none"><path d="M0 10 Q30 0 60 10 T120 10 T180 10 T240 10 V20 H0Z"/></svg></span></button>
    ${small(grid[0],'',bars)}${small(grid[1],'',`<svg class="sgarc" viewBox="0 0 60 30"><path d="M3 27 Q30 -16 57 27"/><path class="on" d="M3 27 Q30 -16 57 27" pathLength="100" stroke-dasharray="${Math.max(8,Math.min(100,(parseFloat(tx(grid[1].querySelector('b')))||0)/8*100)).toFixed(0)} 100"/></svg>`)}
    <button class="sgt pr" ${pro.a}><span class="l">${esc(pro.l)}</span><span class="n">${esc(pro.v)}<small>${esc(pro.g)}</small></span><span class="sgseg">${[...Array(12)].map((_,i)=>`<i class="${i<Math.round(pro.p/100*12)?'on':''}"></i>`).join('')}</span></button>
    ${grid[2]?small(grid[2],'d'):''}${grid[3]?small(grid[3],''):`<button class="sgt s" ${act.a}><span class="n">${esc(act.v)}</span><span class="l">${esc(act.l.toLowerCase())}</span></button>`}
    ${next?`<div class="sgt nx">${next.innerHTML}</div>`:''}`;
  if(acts){acts.classList.add('sgacts');el.appendChild(acts)}
  return el}
/* reminders on Today become a deck: the top card is the next thing, swipe it aside to see the one behind */
function sgDeck(sec){
  const ul=sec.querySelector('ul.rml');if(!ul)return;const lis=[...ul.querySelectorAll(':scope>li.rmd')];if(lis.length<2)return;
  const deck=document.createElement('div');deck.className='sgdeck';deck.style.setProperty('--n',Math.min(3,lis.length));
  lis.forEach((li,i)=>{li.classList.add('sgc');li.dataset.i=Math.min(i,3);deck.appendChild(li)});
  const dots=document.createElement('div');dots.className='sgdots';dots.innerHTML=lis.map((_,i)=>`<i class="${i?'':'on'}"></i>`).join('');
  ul.replaceWith(deck);deck.after(dots);deck.dataset.at='0'}
function sgDeckTurn(deck,dir){
  const cs=[...deck.children],n=cs.length;if(n<2)return;const top=cs.find(c=>c.dataset.i==='0');if(!top)return;
  top.style.transform='';top.dataset.i='out';top.style.setProperty('--dir',dir);
  setTimeout(()=>{deck.appendChild(top);top.dataset.i='3';[...deck.children].forEach((c,i)=>c.dataset.i=Math.min(i,3));
    const at=(Number(deck.dataset.at||0)+1)%n;deck.dataset.at=at;const d=deck.nextElementSibling;if(d&&d.classList.contains('sgdots'))[...d.children].forEach((x,i)=>x.classList.toggle('on',i===at))},230)}
{let g=null;
  addEventListener('pointerdown',e=>{if(!skinOn())return;const c=e.target.closest&&e.target.closest('.sgdeck>.sgc[data-i="0"]');if(!c||e.target.closest('.chk'))return;g={c,x:e.clientX,y:e.clientY,dx:0,lock:0}},{passive:true});
  addEventListener('pointermove',e=>{if(!g)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;if(!g.lock){if(Math.abs(dx)<8&&Math.abs(dy)<8)return;g.lock=Math.abs(dx)>Math.abs(dy)?1:2}
    if(g.lock!==1)return;g.dx=dx;g.c.classList.add('drag');g.c.style.transform=`translate3d(${dx}px,0,0) rotate(${(dx/22).toFixed(2)}deg)`},{passive:true});
  const end=()=>{if(!g)return;const{c,dx,lock}=g;g=null;c.classList.remove('drag');if(lock!==1){c.style.transform='';return}
    /* a real swipe must not also count as a tap on the card */
    const stop=ev=>{ev.stopPropagation();ev.preventDefault()};addEventListener('click',stop,{capture:true,once:true});setTimeout(()=>removeEventListener('click',stop,true),350);
    if(Math.abs(dx)>64)sgDeckTurn(c.parentElement,dx>0?1:-1);else c.style.transform=''};
  addEventListener('pointerup',end,{passive:true});addEventListener('pointercancel',end,{passive:true})}

{const _bp=buildPane;buildPane=function(k){const p=_bp.apply(this,arguments);
  try{if(skinOn()&&!p.querySelector(':scope>.sgscene')){
    p.insertAdjacentHTML('afterbegin',sgScene(k));
    if(k==='today'){const hero=p.querySelector(':scope>.hero.h-today');if(hero){const b=sgBento(hero);if(b){hero.before(b);hero.classList.add('sgoff')}}
      const sec=[...p.querySelectorAll(':scope>section.sec')].find(s=>s.querySelector('ul.rml'));if(sec)sgDeck(sec)}}}catch(e){console.error(e)}
  return p}}
/* the scene moves slower than the page that slides over it */
{let raf=0;const on=()=>{if(raf||!skinOn())return;raf=requestAnimationFrame(()=>{raf=0;const s=document.querySelector('#view .sgscene');if(!s)return;const y=Math.max(0,Math.min(460,SC.scrollTop));s.style.setProperty('--y',y+'px');s.style.setProperty('--o',Math.max(0,1-y/230).toFixed(3))})};
  try{SC.addEventListener('scroll',on,{passive:true})}catch(e){}}

/* ---------- dock: the paper capsule slides to the tab you picked while that tab opens up ---------- */
{const _mi=moveInd;moveInd=function(instant){
  if(!skinOn()||!sgPort())return _mi.apply(this,arguments);
  const on=document.querySelector('#tabs button.on'),ind=document.getElementById('ind');if(!on||!ind)return;
  const i=[...document.querySelectorAll('#tabs button')].indexOf(on),cs=getComputedStyle(document.documentElement),px=n=>parseFloat(cs.getPropertyValue(n))||0;
  const x=px('--tp')+i*(px('--tw')+px('--tg')),from=ind.dataset.x===undefined?x:Number(ind.dataset.x);
  ind.style.height='';delete ind.dataset.y;ind.dataset.x=x;ind.getAnimations?.().forEach(a=>a.cancel());ind.style.transform=`translateX(${x}px)`;
  if(instant||noMotion()||from===x)return;
  try{ind.animate([{transform:`translateX(${from}px)`},{transform:`translateX(${x}px)`}],{duration:460,easing:'cubic-bezier(.2,.8,.2,1)'})}catch(e){}}}
/* the drag-a-lens gesture belongs to Classic's glass bar */
window.addEventListener('pointerdown',e=>{if(skinOn()&&sgPort()&&e.target.closest&&e.target.closest('nav.tabs'))e.stopPropagation()},true);

/* ---------- changing tabs: the same sun travels to its place in the next scene, the land rises, the page comes up ---------- */
let SG_SUN=null;
function sgRoll(root,delay){if(noMotion())return;
  root.querySelectorAll('.sgh .sgl>i').forEach((n,i)=>{try{n.animate([{transform:'translateY(105%)'},{transform:'none'}],{duration:620,delay:(delay||0)+i*70,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'})}catch(e){}})}
function sgArrive(v,from,delay){if(noMotion())return;const A=(n,k,o)=>{try{return n&&n.animate(k,o)}catch(e){return null}},OUT='cubic-bezier(.2,.8,.2,1)',d0=delay||0;
  const sun=v.querySelector('.sgsun');
  if(sun&&from){const r=sun.getBoundingClientRect();if(r.width){const dx=from.left+from.width/2-(r.left+r.width/2),dy=from.top+from.height/2-(r.top+r.height/2),sc=from.width/r.width;
    A(sun,[{translate:`${dx}px ${dy}px`,scale:String(sc)},{translate:'0 0',scale:'1'}],{duration:760,delay:d0,easing:'cubic-bezier(.5,0,.15,1)',fill:'backwards'})}}
  v.querySelectorAll('.sgr').forEach((n,i)=>A(n,[{translate:'0 '+(46+i*26)+'px'},{translate:'0 0'}],{duration:700+i*90,delay:d0+i*50,easing:OUT,fill:'backwards'}));
  A(v.querySelector('.sgsky'),[{opacity:.55},{opacity:1}],{duration:500,delay:d0});
  sgRoll(v,d0+90);
  const rest=[...v.children].filter(n=>!n.matches('.sgscene')&&n.getBoundingClientRect().top<innerHeight).slice(0,7);
  rest.forEach((n,i)=>A(n,[{opacity:0,transform:'translateY(54px)'},{opacity:1,transform:'none'}],{duration:620,delay:d0+110+i*45,easing:OUT,fill:'backwards'}));
  v.querySelectorAll('.sgring .a,.sgring .b').forEach(c=>{const da=c.getAttribute('stroke-dasharray');A(c,[{strokeDasharray:'0 400'},{strokeDasharray:da}],{duration:900,delay:d0+320,easing:OUT,fill:'backwards'})});
  v.querySelectorAll('.sgbars i').forEach((b,i)=>A(b,[{transform:'scaleY(.1)'},{transform:'none'}],{duration:520,delay:d0+380+i*50,easing:'cubic-bezier(.3,1.4,.5,1)',fill:'backwards'}));
  v.querySelectorAll('.sgliq').forEach(l=>A(l,[{translate:'0 60%'},{translate:'0 0'}],{duration:900,delay:d0+300,easing:OUT,fill:'backwards'}))}
{const _r=render;render=function(){if(skinOn()){try{const s=document.querySelector('#view .sgsun');SG_SUN=s?s.getBoundingClientRect():null}catch(e){SG_SUN=null}}
  const r=_r.apply(this,arguments);
  if(skinOn()){try{const t=document.getElementById('top'),s=document.querySelector('#view .sgscene');if(t&&s)s.style.setProperty('--tb',t.offsetHeight+'px')}catch(e){}}
  return r}}
{const _pi=playIn;playIn=function(first,dir){
  if(!skinOn()||noMotion()||first||dir===undefined)return _pi.apply(this,arguments);
  const v=document.querySelector('#view .pane');if(!v)return;
  v.getAnimations?.().forEach(a=>a.cancel());sgArrive(v,SG_SUN,0)}}

/* ---------- the opening ----------
   An orange disc lands, floods the screen, carries the date across it, then pulls back
   into the + button it will be for the rest of the session. */
function sgRun(preview){
  if(document.getElementById('ix3')||document.getElementById('sgx'))return;
  const R=document.documentElement,W=innerWidth,H=innerHeight,OUT='cubic-bezier(.2,.8,.2,1)',IO='cubic-bezier(.7,0,.2,1)';
  const A=(n,k,o)=>{try{return n&&n.animate(k,o)}catch(e){return null}};
  let g1='';try{const hi=document.getElementById('hi');g1=hi?hi.textContent.replace(/\s+/g,' ').replace(/,\s*/,', ').trim():''}catch(e){}
  const el=document.createElement('div');el.id='sgx';el.setAttribute('aria-hidden','true');
  el.innerHTML=`<div class="cv"></div><div class="ds"></div><div class="tx"><div class="gr">${esc(g1)}</div><header class="sgh">${(document.querySelector('#view .sgh')||{innerHTML:''}).innerHTML}</header></div>`;
  document.body.appendChild(el);{const b0=document.getElementById('boot0');if(b0)b0.remove()}
  R.classList.remove('ix-on');R.classList.add('ix-run');window.__ixLive=true;
  try{splashBg.style.display='none';splash.style.display='none'}catch(e){}
  if(!preview){SC.style.opacity='1';SC.style.transition='none'}
  const q=s=>el.querySelector(s),cv=q('.cv'),ds=q('.ds'),tx=q('.tx'),gr=q('.gr'),lines=[...el.querySelectorAll('.sgl>i')];
  /* line the words up with where Home keeps them, so the handover is a change of colour, not of place */
  const home=document.querySelector('#view .sgh'),hr=home&&home.getBoundingClientRect(),hi=document.getElementById('hi'),gh=hi&&hi.getBoundingClientRect();
  const onHome=hr&&hr.top>40&&hr.top<H*.5;
  tx.style.left=(onHome?hr.left:16)+'px';tx.style.right='auto';tx.style.width=(onHome?hr.width:W-32)+'px';tx.style.top=(onHome?hr.top:118)+'px';
  gr.style.cssText+=`position:absolute;left:0;bottom:calc(100% + 14px);white-space:nowrap`;
  const realSun=document.querySelector('#view .sgsun'),fab=realSun||document.getElementById('fab'),fr=fab&&fab.getBoundingClientRect(),fx=fr&&fr.width?fr.left+fr.width/2:W-50,fy=fr&&fr.width?fr.top+fr.height/2:H-60,fs=(fr&&fr.width?fr.width:60)/320;
  const cx=W/2,cy=H/2,cover=(Math.hypot(W,H)+60)/320;
  const at=(x,y,s)=>`translate(${x}px,${y}px) scale(${s})`;
  const T1=380,T2=940,T3=1780,T4=2480;   /* landed · flooded · starts to pull back · gone */
  const run=()=>{
    A(ds,[{transform:at(cx,cy,0)},{transform:at(cx,cy,.19)}],{duration:T1-80,delay:80,easing:'cubic-bezier(.3,1.5,.5,1)',fill:'both'});
    A(ds,[{transform:at(cx,cy,.19)},{transform:at(cx,cy,cover)}],{duration:T2-T1,delay:T1,easing:IO,fill:'forwards'});
    A(gr,[{opacity:0},{opacity:1}],{duration:300,delay:T2-140,fill:'both'});
    lines.forEach((n,i)=>A(n,[{transform:'translateY(105%)'},{transform:'none'}],{duration:620,delay:T2-180+i*80,easing:OUT,fill:'both'}));
    /* once the screen is orange, Home can sit underneath, ready */
    setTimeout(()=>{if(!el.isConnected)return;cv.remove();R.classList.remove('ix-run')},T2+20);
    setTimeout(()=>{if(!el.isConnected)return;
      lines.forEach((n,i)=>A(n,[{transform:'none'},{transform:'translateY(-105%)'}],{duration:340,delay:i*50,easing:'cubic-bezier(.6,0,.8,.2)',fill:'forwards'}));
      A(gr,[{opacity:1},{opacity:0}],{duration:200,fill:'forwards'});
      A(ds,[{transform:at(cx,cy,cover)},{transform:at(fx,fy,fs)}],{duration:T4-T3,easing:IO,fill:'forwards'});
      try{const pane=document.querySelector('#view .pane');if(pane)sgArrive(pane,null,260);
        const tb=document.querySelector('nav.tabs');if(tb)A(tb,[{opacity:0,transform:'translateY(26px)'},{opacity:1,transform:'none'}],{duration:520,delay:420,easing:OUT,fill:'backwards'});
      }catch(e){}},T3);
    setTimeout(done,T4);
  };
  const done=()=>{if(!el.isConnected||window.__ixHold)return;el.remove();R.classList.remove('ix-run');window.__ixLive=false;
    if(fab&&!realSun)A(fab,[{transform:'scale(1)'},{transform:'scale(1.14)'},{transform:'scale(1)'}],{duration:420,easing:'cubic-bezier(.3,1.4,.5,1)'});
    if(window.__ixPend){window.__ixPend=false;setTimeout(()=>render(false),60)}
    const h=document.getElementById('hi');if(h){h.style.transition='';h.style.opacity='';h.style.visibility=''}
    if(!preview){SC.style.transition='';setTimeout(endSplash,200)}};
  /* let the first heavy frame (Home + overlay) paint, then start everything on one clock */
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(el.isConnected)run()}));
  setTimeout(()=>{if(el.isConnected)done()},T4+2200);
}
{const _rs=runSplash;runSplash=function(){if(skinOn()&&!noMotion())return sgRun(false);return _rs.apply(this,arguments)}}
/* "Play it now" in Look & feel: ours answers first (window, capture) and only when Signal is on */
window.addEventListener('click',e=>{if(!skinOn())return;const b=e.target.closest&&e.target.closest('[data-introplay]');if(!b)return;
  e.preventDefault();e.stopImmediatePropagation();closeSheet();setTimeout(()=>{SC.scrollTop=0;sgRun(true)},380)},true);
