/* ============================================================================
   STUDIO skin — behaviour half. The look itself is skin.css (inlined in <head>).
   Nothing here replaces app logic: it switches html[data-skin], owns the Studio
   intro, and adds the Classic / Studio switch to Look & feel. Switch back and
   every line below is dormant.
   ========================================================================== */
const SKIN_KEY='lifeSkin';
function skinOn(){return document.documentElement.dataset.skin==='studio'}
function skinSet(v){
  const r=document.documentElement;
  if(v==='studio')r.dataset.skin='studio';else r.removeAttribute('data-skin');
  try{localStorage.setItem(SKIN_KEY,v==='studio'?'studio':'')}catch(e){}
  /* the status bar follows the page colour */
  const m=document.querySelector('meta[name="theme-color"]');
  if(m){if(!m.dataset.orig)m.dataset.orig=m.content;
    const light=r.dataset.theme==='light'||(!r.dataset.theme&&matchMedia('(prefers-color-scheme:light)').matches);
    m.content=v==='studio'?(light?'#ECEAE4':'#141518'):m.dataset.orig}
}
/* settings → attribute, every time the look is applied (boot, theme change, reset) */
{const _al=applyLook;applyLook=function(){const r=_al.apply(this,arguments);try{skinSet(db.settings.skin==='studio'?'studio':'classic');
  /* Studio has one palette: the classic accent / big-card colours stay saved for Classic but are not applied here */
  if(skinOn()){const st=document.documentElement.style;st.removeProperty('--accent');st.removeProperty('--sage');st.removeProperty('--sage-soft')}}catch(e){}return r}}
/* Look & feel: the switch sits first; the big-card colour row only matters to Classic */
{const _lp=lookPanel;lookPanel=function(){let h=_lp.apply(this,arguments);const cur=db.settings.skin==='studio'?'studio':'classic';
  const seg=`<div class="lookset"><span class="cap">Interface</span><div class="seg2"><button data-look="skin" data-val="classic" aria-pressed="${cur==='classic'}">Classic</button><button data-look="skin" data-val="studio" aria-pressed="${cur==='studio'}">Studio</button></div>
    <p class="hint" style="margin:8px 0 0">Studio is a second interface for the same app: graphite and brass, new type, new opening. Classic is always one tap away.</p></div>`;
  h=h.replace('<p class="hint">Changes apply instantly behind this panel.</p>','<p class="hint">Changes apply instantly behind this panel.</p>'+seg);
  h=h.replace('<div class="lookset"><span class="cap">Big card colour</span>','<div class="lookset" id="lookHero"><span class="cap">Big card colour</span>');
  h=h.replace('<div class="lookset"><span class="cap">Accent colour</span>','<div class="lookset" id="lookAccent"><span class="cap">Accent colour</span>');
  return h}}
{const _sl=setLook;setLook=function(key,val){if(key==='skin'){db.settings.skin=val==='studio'?'studio':'';save();applyLook();
    try{document.body.classList.add('skin-swap');setTimeout(()=>document.body.classList.remove('skin-swap'),500)}catch(e){}
    try{render(false)}catch(e){}setTimeout(()=>{try{moveInd(true)}catch(e){}},50);return}
  return _sl.apply(this,arguments)}}

/* Studio header: the date and the greeting share one small mono line, the name stands alone in Syne.
   (Classic fits "Hello again, Ishir" on one line by shrinking it; with three buttons beside it that line ran out of room.) */
{const _hd=header;header=function(){let h=_hd.apply(this,arguments);if(!skinOn()||state.tab!=='today')return h;
  return h.replace(/<div class="cap">([^<]*)<\/div><h1 id="hi"><span class="hl1">([^<]*)<\/span><br>/,(m,d,g)=>`<div class="cap">${g.replace(/[,\s]+$/,'')}</div><h1 id="hi"><span class="hl1" hidden>${g}</span>`)}}

/* ---------- the Studio opening ----------
   A brass rule draws across the dark, the name is revealed from it, then the screen
   splits like a shutter and Home is already there, settling in line by line. */
function skRun(preview){
  if(document.getElementById('ix3')||document.getElementById('skx'))return;
  const R=document.documentElement,W=innerWidth,EZ='cubic-bezier(.2,.9,.2,1)',SH='cubic-bezier(.76,0,.24,1)';
  const el=document.createElement('div');el.id='skx';el.setAttribute('aria-hidden','true');
  let g1='Hello',nm='';
  try{const hi=document.getElementById('hi');g1=((hi&&hi.querySelector('.hl1'))||{}).textContent||'';nm=((hi&&hi.querySelector('em'))||{}).textContent||''}catch(e){}
  if(!nm){try{nm=firstName()}catch(e){}}
  g1=(g1||'Hello').replace(/[,\s]+$/,'');nm=nm||'you';
  const d=new Date(),dts=d.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'}).replace(/,/g,'  ·').toUpperCase();
  el.innerHTML=`<div class="sh t"></div><div class="sh b"></div><div class="ln"></div><div class="mk"></div><div class="dt">${esc(dts)}</div><div class="tx"><div class="nm"><em>${esc(nm)}</em></div><div class="gr">${esc(g1)}</div></div>`;
  document.body.appendChild(el);{const b0=document.getElementById('boot0');if(b0)b0.remove()}
  R.classList.remove('ix-on');R.classList.add('ix-run');window.__ixLive=true;
  try{splashBg.style.display='none';splash.style.display='none'}catch(e){}
  if(!preview){SC.style.opacity='1';SC.style.transition='none'}
  const q=s=>el.querySelector(s),A=(n,k,o)=>{try{return n&&n.animate(k,o)}catch(e){return null}};
  const ln=q('.ln'),mk=q('.mk'),dt=q('.dt'),nm_=q('.nm'),gr=q('.gr'),tx=q('.tx'),st=q('.sh.t'),sb=q('.sh.b');
  const lw=Math.min(W*.78,360),full=(W+40)/lw;
  const T_OPEN=1950,T_END=2950;
  const anims=[];
  const run=()=>{
    anims.push(A(mk,[{transform:'scale(0)'},{transform:'scale(1)',offset:.25},{transform:'scale(1)',offset:.55},{transform:'scale(0)'}],{duration:700,easing:EZ,fill:'both'}));
    anims.push(A(ln,[{transform:'translate(-50%,-50%) scaleX(0)'},{transform:'translate(-50%,-50%) scaleX(1)',offset:.3},{transform:'translate(-50%,-50%) scaleX(1)',offset:.84},{transform:`translate(-50%,-50%) scaleX(${full})`,offset:1}],{duration:T_OPEN+150,delay:120,easing:'cubic-bezier(.3,.7,.2,1)',fill:'both'}));
    anims.push(A(ln,[{opacity:1},{opacity:1,offset:.9},{opacity:0}],{duration:T_OPEN+600,fill:'both'}));
    anims.push(A(dt,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:420,delay:520,easing:EZ,fill:'both'}));
    anims.push(A(nm_,[{opacity:1,clipPath:'inset(0 0 100% 0)',transform:'translateY(-14px)'},{opacity:1,clipPath:'inset(0 0 -10% 0)',transform:'none'}],{duration:700,delay:620,easing:EZ,fill:'both'}));
    anims.push(A(gr,[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:420,delay:940,easing:EZ,fill:'both'}));
    anims.push(A(tx,[{opacity:1},{opacity:1,offset:.86},{opacity:0,transform:'translateY(6px)'}],{duration:T_OPEN,fill:'both',easing:'ease-in'}));
    anims.push(A(dt,[{opacity:1},{opacity:1,offset:.74},{opacity:0,transform:'translateY(-6px)'}],{duration:T_OPEN-950,delay:950,fill:'forwards',easing:'ease-in'}));
    anims.push(A(st,[{transform:'none'},{transform:'translateY(-101%)'}],{duration:860,delay:T_OPEN,easing:SH,fill:'both'}));
    anims.push(A(sb,[{transform:'none'},{transform:'translateY(101%)'}],{duration:860,delay:T_OPEN,easing:SH,fill:'both'}));
    /* Home is under the shutters the whole time; it only becomes visible when they part, then settles in line by line */
    setTimeout(()=>{if(!el.isConnected)return;R.classList.remove('ix-run');
      try{const top=document.querySelector('.top'),kids=[...document.querySelectorAll('#view .pane>*')].filter(n=>n.getBoundingClientRect().top<innerHeight+40);
        [top,...kids].filter(Boolean).forEach((n,i)=>A(n,[{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'none'}],{duration:620,delay:60+Math.min(i,9)*55,easing:EZ,fill:'both'}));
        const dk=document.querySelector('.dock');if(dk)A(dk,[{opacity:0,transform:'translateY(40%)'},{opacity:1,transform:'none'}],{duration:560,delay:220,easing:EZ,fill:'both'});
      }catch(e){}},T_OPEN+60);
    setTimeout(done,T_END);
  };
  const done=()=>{if(!el.isConnected||window.__ixHold)return;el.remove();R.classList.remove('ix-run');window.__ixLive=false;
    if(window.__ixPend){window.__ixPend=false;setTimeout(()=>render(false),60)}
    const h=document.getElementById('hi');if(h){h.style.transition='';h.style.opacity=''}
    if(!preview){SC.style.transition='';setTimeout(endSplash,250)}};
  /* let Home and the overlay paint first (the expensive frame), then start every animation on one clock */
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!el.isConnected)return;run()}));
  setTimeout(()=>{if(el.isConnected)done()},T_END+2000);
}
{const _rs=runSplash;runSplash=function(){if(skinOn()&&!noMotion())return skRun(false);return _rs.apply(this,arguments)}}
/* the Studio faces load after first paint: re-fit the one-line greeting once they are in */
try{if(document.fonts){document.fonts.ready.then(()=>{if(skinOn()&&typeof fitHello==='function')fitHello()});document.fonts.addEventListener('loadingdone',()=>{if(skinOn()&&typeof fitHello==='function')fitHello()})}}catch(e){}
/* "Play it now" in Look & feel: ours runs first (window, capture) and only when Studio is on */
window.addEventListener('click',e=>{if(!skinOn())return;const b=e.target.closest&&e.target.closest('[data-introplay]');if(!b)return;
  e.preventDefault();e.stopImmediatePropagation();closeSheet();setTimeout(()=>skRun(true),350)},true);
/* switching interfaces: one soft crossfade of the page instead of a hard repaint */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="skinswap">body.skin-swap #scroller,body.skin-swap .dock{animation:skinSwap .45s ease-out}@keyframes skinSwap{from{opacity:.35}to{opacity:1}}</style>`);
