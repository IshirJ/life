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

/* ---------- the page headline: Today says the date, every other tab says its name ---------- */
function sgHead(k){
  if(k==='today'){const d=new Date();
    return `<header class="sgh"><span class="sgl"><i>${esc(d.toLocaleDateString('en-US',{weekday:'long'}))}</i></span><span class="sgl sg2"><i>${d.getDate()} ${esc(d.toLocaleDateString('en-US',{month:'long'}))}</i></span></header>`}
  return `<header class="sgh"><span class="sgl"><i>${esc(TABS[k].title)}</i></span></header>`}
{const _bp=buildPane;buildPane=function(k){const p=_bp.apply(this,arguments);try{if(skinOn()&&!p.querySelector(':scope>.sgh'))p.insertAdjacentHTML('afterbegin',sgHead(k))}catch(e){}return p}}

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

/* ---------- changing tabs: the page comes in from the side you moved toward, its headline rolls up into place ---------- */
function sgRoll(root,delay){if(noMotion())return;
  root.querySelectorAll('.sgh .sgl>i').forEach((n,i)=>{try{n.animate([{transform:'translateY(105%)'},{transform:'none'}],{duration:560,delay:(delay||0)+i*70,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'})}catch(e){}})}
{const _pi=playIn;playIn=function(first,dir){
  if(!skinOn()||noMotion()||first||dir===undefined)return _pi.apply(this,arguments);
  const v=document.querySelector('#view .pane');if(!v)return;
  v.getAnimations?.().forEach(a=>a.cancel());
  try{v.animate([{transform:`translateX(${(dir||0)*44}px)`,opacity:0},{transform:'none',opacity:1}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'})}catch(e){}
  sgRoll(v,40)}}

/* ---------- the opening ----------
   An orange disc lands, floods the screen, carries the date across it, then pulls back
   into the + button it will be for the rest of the session. */
function sgRun(preview){
  if(document.getElementById('ix3')||document.getElementById('sgx'))return;
  const R=document.documentElement,W=innerWidth,H=innerHeight,OUT='cubic-bezier(.2,.8,.2,1)',IO='cubic-bezier(.7,0,.2,1)';
  const A=(n,k,o)=>{try{return n&&n.animate(k,o)}catch(e){return null}};
  let g1='';try{const hi=document.getElementById('hi');g1=hi?hi.textContent.replace(/\s+/g,' ').replace(/,\s*/,', ').trim():''}catch(e){}
  const el=document.createElement('div');el.id='sgx';el.setAttribute('aria-hidden','true');
  el.innerHTML=`<div class="cv"></div><div class="ds"></div><div class="tx"><div class="gr">${esc(g1)}</div>${sgHead('today')}</div>`;
  document.body.appendChild(el);{const b0=document.getElementById('boot0');if(b0)b0.remove()}
  R.classList.remove('ix-on');R.classList.add('ix-run');window.__ixLive=true;
  try{splashBg.style.display='none';splash.style.display='none'}catch(e){}
  if(!preview){SC.style.opacity='1';SC.style.transition='none'}
  const q=s=>el.querySelector(s),cv=q('.cv'),ds=q('.ds'),tx=q('.tx'),gr=q('.gr'),lines=[...el.querySelectorAll('.sgl>i')];
  /* line the words up with where Home keeps them, so the handover is a change of colour, not of place */
  const home=document.querySelector('#view .pane>.sgh'),hr=home&&home.getBoundingClientRect(),hi=document.getElementById('hi'),gh=hi&&hi.getBoundingClientRect();
  const onHome=hr&&hr.top>40&&hr.top<H*.5&&state.tab==='today';
  tx.style.left=(onHome?hr.left:16)+'px';tx.style.right='auto';tx.style.width=(onHome?hr.width:W-32)+'px';tx.style.top=(onHome?hr.top:118)+'px';
  gr.style.cssText+=`position:absolute;left:0;bottom:calc(100% + 14px);white-space:nowrap`;
  const fab=document.getElementById('fab'),fr=fab&&fab.getBoundingClientRect(),fx=fr&&fr.width?fr.left+fr.width/2:W-50,fy=fr&&fr.width?fr.top+fr.height/2:H-60,fs=(fr&&fr.width?fr.width:60)/320;
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
      try{const pane=document.querySelector('#view .pane');if(pane){sgRoll(pane,300);
        [...pane.children].filter(n=>!n.matches('.sgh')&&n.getBoundingClientRect().top<H).slice(0,5).forEach((n,i)=>A(n,[{opacity:0,transform:'translateY(34px)'},{opacity:1,transform:'none'}],{duration:640,delay:330+i*70,easing:OUT,fill:'backwards'}))}
        const tb=document.querySelector('nav.tabs');if(tb)A(tb,[{opacity:0,transform:'translateY(26px)'},{opacity:1,transform:'none'}],{duration:520,delay:420,easing:OUT,fill:'backwards'});
      }catch(e){}},T3);
    setTimeout(done,T4);
  };
  const done=()=>{if(!el.isConnected||window.__ixHold)return;el.remove();R.classList.remove('ix-run');window.__ixLive=false;
    if(fab)A(fab,[{transform:'scale(1)'},{transform:'scale(1.14)'},{transform:'scale(1)'}],{duration:420,easing:'cubic-bezier(.3,1.4,.5,1)'});
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
