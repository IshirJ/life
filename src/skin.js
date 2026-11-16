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
   Ridgelines are ridged noise sampled finely, so slopes curve and peaks vary like eroded rock
   instead of zig-zagging. Each layer is shaded lighter with distance and separated by haze. */
const SG_W=390,SG_H=220;
function sgRnd(seed){let s=seed%2147483647;if(s<=0)s+=2147483646;return()=>((s=s*16807%2147483647)-1)/2147483646}
function sgRidge(seed,base,amp,sharp,freq){const r=sgRnd(seed),oct=[[1,1],[2.3,.42],[4.7,.13]],ph=oct.map(()=>r()*6.283),N=64;let d=`M0 ${SG_H} `;
  for(let i=0;i<=N;i++){const x=i/N;let n=0,tot=0;oct.forEach(([f,a],j)=>{const s=Math.sin(x*f*freq*6.283+ph[j]),rg=1-Math.abs(s),sm=(s+1)/2;n+=(sharp*Math.pow(rg,1.6)+(1-sharp)*sm)*a;tot+=a});
    d+=`L${(x*SG_W).toFixed(1)} ${(base-amp*n/tot).toFixed(1)} `}
  return d+`L${SG_W} ${SG_H}Z`}
const SG_TONE=[['#9a4630','#7a3230'],['#6a2a30','#4a1c28'],['#3c1722','#2a101a'],['#1f0c14','#150a10']];
function sgLayer(i,d,k){const id=`sgG${k}${i}`;return `<svg class="sgr r${i+1}" viewBox="0 0 ${SG_W} ${SG_H}" preserveAspectRatio="none"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SG_TONE[i][0]}"/><stop offset="1" stop-color="${SG_TONE[i][1]}"/></linearGradient></defs><path fill="url(#${id})" d="${d}"/></svg>`}
function sgSky(){const h=new Date().getHours()+new Date().getMinutes()/60;
  /* how much of the horizon is lit: full at sunrise and sunset, a low ember through the night */
  const day=h>=6&&h<=20,t=day?(h-6)/14:0,g=day?.55+.45*Math.abs(Math.cos(Math.PI*t)):.3;
  return{h,day,t,g}}
function sgSun(k,W){const s=sgSky();
  if(k==='today'){const x=W*(.62+.2*(s.day?s.t:.5)),y=s.day?250-Math.sin(Math.PI*s.t)*40:262;return{x,y,d:132}}
  return{plan:{x:W*.78,y:158,d:76},work:{x:W*.7,y:196,d:150},health:{x:W*.8,y:170,d:104},mind:{x:W*.72,y:150,d:64}}[k]||{x:W*.75,y:180,d:110}}
/*            sharp  amp   freq   per layer, far to near */
const SG_LAND={today:[[.75,96,1.25],[.6,74,1.5],[.4,50,1.1],[.2,30,.9]],plan:[[.25,54,1.2],[.2,46,1.6],[.15,34,1.1],[.1,22,.9]],work:[[.7,112,1.35],[.6,84,1.6],[.4,54,1.2],[.2,30,.9]],health:[[0,60,1.1],[0,48,1.5],[0,36,1],[0,22,.8]]};
function sgScene(k){
  const W=Math.min(innerWidth,sgPort()?innerWidth:1200),s=sgSky(),sun=sgSun(k,W),g=s.g;
  const sky=`linear-gradient(180deg,#15111b 0%,#231422 ${(30-14*g).toFixed(0)}%,#4a1f2d ${(56-22*g).toFixed(0)}%,#8f3a2c ${(78-20*g).toFixed(0)}%,#d36a34 ${(94-14*g).toFixed(0)}%,#f0a258 ${(108-10*g).toFixed(0)}%)`;
  const r=sgRnd(71),stars=!s.day||k==='mind'?`<svg class="sgstars" viewBox="0 0 ${SG_W} ${SG_H}" preserveAspectRatio="xMidYMid slice">${[...Array(k==='mind'?26:10)].map(()=>`<circle cx="${(r()*SG_W).toFixed(1)}" cy="${(r()*(k==='mind'?120:46)).toFixed(1)}" r="${(r()*.8+.35).toFixed(2)}" opacity="${(r()*.6+.25).toFixed(2)}"/>`).join('')}</svg>`:'';
  let land;
  if(k==='mind')land=sgLayer(1,sgRidge(9,150,20,.1,1),k)+`<div class="sgwater"><i style="left:${(sun.x-34).toFixed(0)}px"></i></div>`;
  else{const L=SG_LAND[k]||SG_LAND.today,bases=[150,172,194,212],seed={today:11,plan:31,work:53,health:77}[k]||11;
    land=L.map((p,i)=>sgLayer(i,sgRidge(seed+i*17,bases[i],p[1],p[0],p[2]),k)+(i===1?'<div class="sghaze"></div>':'')).join('')}
  let head;
  if(k==='today'){const d=new Date();let due=0;try{due=db.entries.filter(e=>(e.type==='task'||e.type==='reminder')&&!e.done&&e.due&&dayDiff(e.due)<=0).length}catch(e){}
    head=`<header class="sgh"><span class="sgl"><i>${esc(d.toLocaleDateString('en-US',{weekday:'long'}))}</i></span><span class="sgl sg2"><i>${d.getDate()} ${esc(d.toLocaleDateString('en-US',{month:'long'}))}</i></span></header>`
      +(due?`<button class="sgpill" data-goto="mind:reminder"><b>${due}</b>due today</button>`:'')}
  else head=`<header class="sgh"><span class="sgl"><i>${esc(TABS[k].title)}</i></span></header>`;
  return `<div class="sgscene" data-k="${k}"><div class="sgsky" style="background:${sky}"></div>${stars}<i class="sgglow" style="--sx:${(sun.x-sun.d*1.6).toFixed(0)}px;--sv:${(sun.y-sun.d*1.6).toFixed(0)}px;width:${(sun.d*3.2).toFixed(0)}px;height:${(sun.d*3.2).toFixed(0)}px"></i><i class="sgsun" style="--sx:${(sun.x-sun.d/2).toFixed(0)}px;--sv:${(sun.y-sun.d/2).toFixed(0)}px;width:${sun.d}px;height:${sun.d}px"></i>${land}<div class="sghd">${head}</div></div><div class="sgcap"><i></i></div>`}

/* Today, rebuilt: the classic summary card is read once and laid out again as tiles. Every graphic has its own
   corner of its tile, so no number ever sits under one. */
const sgAttrs=el=>el?[...el.attributes].filter(a=>a.name!=='class'&&a.name!=='style').map(a=>`${a.name}="${esc(a.value)}"`).join(' '):'';
function sgBento(hero){
  const q=s=>hero.querySelector(s),qa=s=>[...hero.querySelectorAll(s)],tx=n=>n?n.textContent.trim():'';
  const ring=q('.ts-ring'),legs=qa('.ts-leg>button'),grid=qa('.ts-grid>button'),left=tx(qa('.ts-top .cap')[1]),verdict=tx(q('.ts-verdict')),next=q('.ts-pill'),acts=q('.hero-actions');
  if(!ring||legs.length<3||grid.length<2)return null;
  const leg=i=>{const b=legs[i],bar=b.querySelector('.tb i');return{a:sgAttrs(b),l:tx(b.querySelector('.tl')),v:tx(b.querySelector('.tv b')),g:tx(b.querySelector('.tv small')),p:Math.max(0,Math.min(100,parseFloat(bar&&bar.style.width)||0))}};
  const cal=leg(0),pro=leg(1),lm=left.match(/^([\d,.\-]+)\s*(.*)$/),C=2*Math.PI*30,rp=Math.max(0,Math.min(100,parseFloat(tx(ring.querySelector('.ts-c b')).replace(/,/g,''))||0));
  const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
  const small=b=>{const ico=b.querySelector('svg');return `<button class="sgt s" ${sgAttrs(b)}>${ico?`<span class="ic">${ico.outerHTML}</span>`:''}<span class="n">${esc(tx(b.querySelector('b')))}</span><span class="l">${esc(cap(tx(b.querySelector('small'))))}</span></button>`};
  let big={a:sgAttrs(ring),l:cap(tx(ring.querySelector('.ts-c small'))||'today'),n:tx(ring.querySelector('.ts-c b')),v:verdict,p:rp};
  if(!/read/i.test(big.l)){ /* no readiness score yet: show the cut instead of repeating calories */
    try{const J=JRN(),tr=jTrend(),cur=tr.length?num(tr[tr.length-1].t):num(J.startW),goal=num(J.hi),span=Math.max(.1,num(J.startW)-goal),g=jGym();
      big={a:'data-goto="health:journey"',l:'Weight',n:cur.toFixed(1),v:cur>goal?`${(cur-goal).toFixed(1)} lb to ${goal}`:'In your goal range',p:Math.max(0,Math.min(100,(num(J.startW)-cur)/span*100))}}catch(e){big.l='Today'}}
  const el=document.createElement('div');el.className='sgbento';
  el.innerHTML=`<button class="sgt big" ${big.a}><span class="l">${esc(big.l)}</span>
      <svg class="sgring" viewBox="0 0 72 72"><circle cx="36" cy="36" r="30"/><circle class="a" cx="36" cy="36" r="30" stroke-dasharray="${(C*big.p/100).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 36 36)"/></svg>
      <span class="n${big.n.length>4?' sm':''}">${esc(big.n)}</span><span class="v">${esc(big.v)}</span></button>
    <button class="sgt kc" ${cal.a}><span class="l">${esc(lm?(/^kcal/i.test(lm[2])?lm[2].replace(/^kcal/i,'Calories'):cap(lm[2])):'Calories')}</span><span class="n">${esc(lm?lm[1]:cal.v)}</span><span class="sgbar"><i style="width:${cal.p.toFixed(0)}%"></i></span></button>
    ${small(grid[0])}${small(grid[1])}
    <button class="sgt pr" ${pro.a}><span class="l">${esc(pro.l)}</span><span class="n">${esc(pro.v)}<small>${esc(pro.g)}</small></span><span class="sgbar"><i style="width:${pro.p.toFixed(0)}%"></i></span></button>
    ${grid[2]?small(grid[2]):''}${grid[3]?small(grid[3]):''}
    ${next?`<div class="sgt nx">${next.innerHTML}</div>`:''}`;
  if(acts){acts.classList.add('sgacts');el.appendChild(acts)}
  return el}

{const _bp=buildPane;buildPane=function(k){const p=_bp.apply(this,arguments);
  try{if(skinOn()&&!p.querySelector(':scope>.sgscene')){
    p.insertAdjacentHTML('afterbegin',sgScene(k));
    if(k==='today'){const hero=p.querySelector(':scope>.hero.h-today');if(hero){const b=sgBento(hero);if(b){hero.before(b);hero.classList.add('sgoff')}}}}}catch(e){console.error(e)}
  return p}}
/* the + sheet, sorted: what belongs to this tab first, then everything else by area */
const SG_GROUPS=[['Health',['food','workout','weight','injury']],['Work',['task','meeting','project','job','expense']],['Notes',['reminder','note','idea','scrap','trip']],['School',['class']]];
{const _oa=openAdd;openAdd=function(){const r=_oa.apply(this,arguments);
  try{if(skinOn()){const g=document.querySelector('#sheetBody .typegrid');if(g&&!g.classList.contains('sgadd')){
    const btn=Object.fromEntries([...g.querySelectorAll('.tilt[data-add]')].map(b=>[b.dataset.add,b])),used=new Set();
    const wrap=document.createElement('div');wrap.className='typegrid sgadd';
    SG_GROUPS.forEach(([name,keys])=>{const have=keys.filter(k=>btn[k]);if(!have.length)return;const sec=document.createElement('div');sec.className='sgag';sec.innerHTML=`<div class="sgah">${name}</div><div class="sgar"></div>`;have.forEach(k=>{sec.lastChild.appendChild(btn[k]);used.add(k)});wrap.appendChild(sec)});
    const rest=Object.keys(btn).filter(k=>!used.has(k));if(rest.length){const sec=document.createElement('div');sec.className='sgag';sec.innerHTML=`<div class="sgah">More</div><div class="sgar"></div>`;rest.forEach(k=>sec.lastChild.appendChild(btn[k]));wrap.appendChild(sec)}
    g.replaceWith(wrap);const h=document.querySelector('#sheetBody .sh-h h3');if(h)h.textContent='Add'}}}catch(e){console.error(e)}
  return r}}
/* The scene's parallax is a CSS scroll timeline (runs on the compositor, no script per frame).
   Script only flips one class when the sheet reaches the bar, and fades the headline where timelines are missing. */
const SG_TL=(()=>{try{return CSS.supports('animation-timeline: scroll()')}catch(e){return false}})();
{let raf=0,over=null;const on=()=>{if(raf||!skinOn())return;raf=requestAnimationFrame(()=>{raf=0;const s=document.querySelector('#view .sgscene'),t=document.getElementById('top');if(!s||!t)return;
    const y=SC.scrollTop,o=y>s.offsetHeight-t.offsetHeight-40;if(o!==over){over=o;document.documentElement.classList.toggle('sg-over',o)}
    if(!SG_TL){const h=s.querySelector('.sghd');if(h)h.style.opacity=Math.max(0,1-y/46).toFixed(2)}})};
  try{SC.addEventListener('scroll',on,{passive:true})}catch(e){}
  window.sgOver=()=>{over=null;on()}}

/* ---------- changing tabs: the same sun travels to its place in the next scene, the land rises, the page comes up ---------- */
let SG_SUN=null;
function sgRoll(root,delay){if(noMotion())return;
  root.querySelectorAll('.sgh .sgl>i').forEach((n,i)=>{try{n.animate([{transform:'translateY(105%)'},{transform:'none'}],{duration:620,delay:(delay||0)+i*70,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'})}catch(e){}})}
function sgArrive(v,from,delay,light){if(noMotion())return;const A=(n,k,o)=>{try{return n&&n.animate(k,o)}catch(e){return null}},OUT='cubic-bezier(.2,.8,.2,1)',d0=delay||0;
  const sun=v.querySelector('.sgsun');
  if(sun&&from){const r=sun.getBoundingClientRect();if(r.width){const dx=from.left+from.width/2-(r.left+r.width/2),dy=from.top+from.height/2-(r.top+r.height/2),sc=from.width/r.width;
    [sun,v.querySelector('.sgglow')].forEach(n=>A(n,[{translate:`${dx}px ${dy}px`,scale:String(sc)},{translate:'0 0',scale:'1'}],{duration:760,delay:d0,easing:'cubic-bezier(.5,0,.15,1)',fill:'backwards'}))}}

  sgRoll(v,d0+90);
  const rest=[...v.children].filter(n=>!n.matches('.sgscene')&&n.getBoundingClientRect().top<innerHeight).slice(0,light?3:4);
  rest.forEach((n,i)=>A(n,[{opacity:0,transform:'translateY(54px)'},{opacity:1,transform:'none'}],{duration:620,delay:d0+110+i*45,easing:OUT,fill:'backwards'}));
  v.querySelectorAll('.sgring .a').forEach(c=>{const da=c.getAttribute('stroke-dasharray');A(c,[{strokeDasharray:'0 200'},{strokeDasharray:da}],{duration:900,delay:d0+320,easing:OUT,fill:'backwards'})});
  v.querySelectorAll('.sgbar i').forEach(b=>A(b,[{transform:'scaleX(0)'},{transform:'none'}],{duration:700,delay:d0+360,easing:OUT,fill:'backwards'}))}
{const _r=render;render=function(){if(skinOn()){try{const s=document.querySelector('#view .sgsun');SG_SUN=s?s.getBoundingClientRect():null}catch(e){SG_SUN=null}}
  const r=_r.apply(this,arguments);
  if(skinOn()){try{const t=document.getElementById('top'),s=document.querySelector('#view .sgscene');if(t&&s)s.style.setProperty('--tb',t.offsetHeight+'px');sgOver()}catch(e){}}
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
  R.classList.remove('ix-on','ix-run');window.__ixLive=true;
  try{splashBg.style.display='none';splash.style.display='none'}catch(e){}
  if(!preview){SC.style.opacity='1';SC.style.transition='none'}
  const q=s=>el.querySelector(s),cv=q('.cv'),ds=q('.ds'),tx=q('.tx'),gr=q('.gr'),lines=[...el.querySelectorAll('.sgl>i')];
  /* line the words up with where Home keeps them, so the handover is a change of colour, not of place */
  const home=document.querySelector('#view .sgh'),hr=home&&home.getBoundingClientRect(),hi=document.getElementById('hi'),gh=hi&&hi.getBoundingClientRect();
  const onHome=hr&&hr.top>40&&hr.top<H*.5;
  tx.style.left=(onHome?hr.left:16)+'px';tx.style.right='auto';tx.style.width=(onHome?hr.width:W-32)+'px';tx.style.top=(onHome?hr.top:118)+'px';
  gr.style.cssText+=`position:absolute;left:0;bottom:calc(100% + 14px);white-space:nowrap`;
  const realSun=document.querySelector('#view .sgsun'),fab=realSun||document.getElementById('fab'),fr=fab&&fab.getBoundingClientRect(),fx=fr&&fr.width?fr.left+fr.width/2:W-50,fy=fr&&fr.width?fr.top+fr.height/2:H-60,fs0=(fr&&fr.width?fr.width:60);
  const D=Math.ceil(Math.hypot(W,H)+60),cx=W/2,cy=H/2,cover=1,S0=61/D;ds.style.cssText+=`width:${D}px;height:${D}px;margin:${-D/2}px 0 0 ${-D/2}px`;
  const at=(x,y,s)=>`translate(${x}px,${y}px) scale(${s})`;
  const T1=380,T2=940,T3=1780,T4=2480;   /* landed · flooded · starts to pull back · gone */
  const run=()=>{
    A(ds,[{transform:at(cx,cy,0)},{transform:at(cx,cy,S0)}],{duration:T1-80,delay:80,easing:'cubic-bezier(.3,1.5,.5,1)',fill:'both'});
    A(ds,[{transform:at(cx,cy,S0)},{transform:at(cx,cy,cover)}],{duration:T2-T1,delay:T1,easing:IO,fill:'forwards'});
    A(gr,[{opacity:0},{opacity:1}],{duration:300,delay:T2-140,fill:'both'});
    lines.forEach((n,i)=>A(n,[{transform:'translateY(105%)'},{transform:'none'}],{duration:620,delay:T2-180+i*80,easing:OUT,fill:'both'}));
    /* once the screen is orange, Home can sit underneath, ready */
    setTimeout(()=>{if(el.isConnected)cv.style.visibility='hidden'},T2+20);
    setTimeout(()=>{if(!el.isConnected)return;
      lines.forEach((n,i)=>A(n,[{transform:'none'},{transform:'translateY(-105%)'}],{duration:340,delay:i*50,easing:'cubic-bezier(.6,0,.8,.2)',fill:'forwards'}));
      A(gr,[{opacity:1},{opacity:0}],{duration:200,fill:'forwards'});
      A(ds,[{transform:at(cx,cy,cover)},{transform:at(fx,fy,fs0/D)}],{duration:T4-T3,easing:IO,fill:'forwards'});
      try{const pane=document.querySelector('#view .pane');if(pane)sgArrive(pane,null,240,true);
        
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
