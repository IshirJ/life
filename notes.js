/* ===================== Life · Notebooks =====================
   Handwritten + typed notebooks for iPad / iPhone / laptop, with PDF import and export.
   Pages are stored in this device's IndexedDB (and in backups / server sync).
   Page coordinates: width is always 1000; height is 1414 (A4) or follows an imported PDF page. */
(function(){
'use strict';
const PW=1000,PH=1414,HH=p=>p.h||PH;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const say=m=>{try{window.toast?toast(m):0}catch(e){}};
const agoS=t=>{try{return window.ago?ago(t):''}catch(e){return''}};
const safeImg=s=>/^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/.test(String(s||''))?s:'';
const fname=s=>(String(s||'Notebook').replace(/[^\w .-]+/g,'').trim()||'Notebook');

/* ---------- storage ---------- */
function tombNote(store,id){try{const k='ishiros.nbtomb',t=JSON.parse(localStorage.getItem(k)||'{}');t[store+':'+id]=Date.now();localStorage.setItem(k,JSON.stringify(t))}catch(e){}}
const IDB={d:null,
  open(){if(this.d)return Promise.resolve(this.d);return new Promise((res,rej)=>{const r=indexedDB.open('life-notes',1);
    r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('books'))d.createObjectStore('books',{keyPath:'id'});if(!d.objectStoreNames.contains('pages'))d.createObjectStore('pages',{keyPath:'id'})};
    r.onsuccess=()=>{this.d=r.result;res(this.d)};r.onerror=()=>rej(r.error)})},
  async tx(store,mode,fn){const d=await this.open();return new Promise((res,rej)=>{const t=d.transaction(store,mode),s=t.objectStore(store);const out=fn(s);t.oncomplete=()=>res(out&&out.result!==undefined?out.result:out);t.onerror=()=>rej(t.error)})},
  get(store,id){return this.tx(store,'readonly',s=>s.get(id))},
  put(store,o){return this.tx(store,'readwrite',s=>{s.put(o)})},
  del(store,id){tombNote(store,id);return this.tx(store,'readwrite',s=>{s.delete(id)})},
  rawDel(store,id){return this.tx(store,'readwrite',s=>{s.delete(id)})},
  all(store){return this.tx(store,'readonly',s=>s.getAll())}
};

/* ---------- paper & templates ---------- */
const BGS={white:['#FCFBF8','#1D1C1A','White'],cream:['#F5EFE1','#1D1C1A','Cream'],sage:['#E6EEE7','#1D1C1A','Sage'],dark:['#1E1D1B','#F2EDE3','Dark']};
const TPL={blank:'Blank',lined:'Lined',narrow:'Narrow ruled',grid:'Grid',graph:'Engineering',dots:'Dots',cornell:'Cornell notes',todo:'To-do',meeting:'Meeting',assign:'Assignment',planner:'Week planner'};
const COVERS=['#F06D44','#4E6A5A','#3E6FD0','#8C5CE0','#D18A12','#C9466A','#2B2A26','#1F8A8A'];
function paintPaper(ctx,tpl,bgKey,w,h,k,dateStr){
  const bg=(BGS[bgKey]||BGS.white)[0],dark=bgKey==='dark',L=dark?'rgba(242,237,227,.15)':'rgba(40,60,90,.17)',L2=dark?'rgba(242,237,227,.3)':'rgba(40,60,90,.32)',RED=dark?'rgba(255,120,110,.32)':'rgba(220,80,80,.34)',INK=dark?'rgba(242,237,227,.55)':'rgba(40,40,40,.5)';
  ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);ctx.lineWidth=Math.max(1,1.1*k);
  const hl=(y,x0=0,x1=w,c=L)=>{ctx.strokeStyle=c;ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke()},vl=(x,y0=0,y1=h,c=L)=>{ctx.strokeStyle=c;ctx.beginPath();ctx.moveTo(x,y0);ctx.lineTo(x,y1);ctx.stroke()};
  const label=(t,x,y,sz=16)=>{ctx.fillStyle=INK;ctx.font=`600 ${sz*k}px -apple-system,system-ui,sans-serif`;ctx.textBaseline='alphabetic';ctx.fillText(t,x,y)};
  const rules=(top,step,x0=0)=>{for(let y=top;y<h-30*k;y+=step)hl(y,x0)};
  switch(tpl){
    case'lined':rules(120*k,40*k);vl(90*k,0,h,RED);break;
    case'narrow':rules(100*k,30*k);vl(80*k,0,h,RED);break;
    case'grid':for(let y=40*k;y<h;y+=40*k)hl(y);for(let x=40*k;x<w;x+=40*k)vl(x);break;
    case'graph':for(let i=1,y=20*k;y<h;y+=20*k,i++)hl(y,0,w,i%5?L:L2);for(let i=1,x=20*k;x<w;x+=20*k,i++)vl(x,0,h,i%5?L:L2);break;
    case'dots':ctx.fillStyle=L2;for(let y=40*k;y<h;y+=40*k)for(let x=40*k;x<w;x+=40*k){ctx.beginPath();ctx.arc(x,y,1.7*k,0,7);ctx.fill()}break;
    case'cornell':{const top=150*k,cue=280*k,sum=h-260*k;label('Topic',40*k,70*k,18);label('Date',w-260*k,70*k,18);hl(90*k,0,w,L2);hl(top,0,w,L2);vl(cue,top,sum,L2);hl(sum,0,w,L2);label('Cues',40*k,top+34*k,15);label('Notes',cue+30*k,top+34*k,15);label('Summary',40*k,sum+36*k,15);for(let y=top+80*k;y<sum-10*k;y+=40*k)hl(y,cue+20*k,w-30*k);break}
    case'todo':{label('To do',60*k,90*k,30);if(dateStr)label(dateStr,w-300*k,90*k,16);for(let y=170*k;y<h-60*k;y+=60*k){hl(y+16*k,110*k,w-60*k);ctx.strokeStyle=L2;ctx.lineWidth=Math.max(1,2*k);ctx.strokeRect(60*k,y-16*k,30*k,30*k);ctx.lineWidth=Math.max(1,1.1*k)}break}
    case'meeting':{label('Meeting',60*k,90*k,30);[['Date',140],['Attendees',190],['Agenda',260]].forEach(([t,y])=>{label(t,60*k,y*k,15);hl((y+12)*k,190*k,w-60*k)});hl(330*k,0,w,L2);label('Notes',60*k,375*k,15);const a=h-330*k;for(let y=420*k;y<a-40*k;y+=40*k)hl(y);hl(a-20*k,0,w,L2);label('Action items',60*k,a+22*k,15);for(let y=a+70*k;y<h-30*k;y+=50*k){ctx.strokeStyle=L2;ctx.strokeRect(60*k,y-22*k,24*k,24*k);hl(y,100*k,w-60*k)}break}
    case'assign':{label('Name',60*k,80*k,15);hl(90*k,140*k,w*.55);label('Course',w*.6,80*k,15);hl(90*k,w*.6+75*k,w-60*k);label('Assignment',60*k,140*k,15);hl(150*k,190*k,w*.55);label('Date',w*.6,140*k,15);hl(150*k,w*.6+60*k,w-60*k);hl(185*k,0,w,L2);rules(240*k,40*k);vl(90*k,185*k,h,RED);break}
    case'planner':{const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Weekend'],top=120*k,rowH=(h-top-40*k)/3,colW=(w-80*k)/2;label('Week of',60*k,80*k,22);hl(90*k,170*k,w*.6);
      days.forEach((d,i)=>{const c=i%2,r=Math.floor(i/2),x=40*k+c*colW,y=top+r*rowH;ctx.strokeStyle=L2;ctx.strokeRect(x+6*k,y+6*k,colW-12*k,rowH-12*k);label(d,x+22*k,y+40*k,15);for(let yy=y+70*k;yy<y+rowH-20*k;yy+=36*k)hl(yy,x+22*k,x+colW-22*k)});break}
  }
}

/* ---------- pens ---------- */
const INK_L=['#1D1C1A','#5B5A57','#2F5BD8','#1F8A4C','#D9372B','#F06D44','#8E44D6','#C49000','#0F8A8A'];
const INK_D=['#F2EDE3','#A39C8E','#7FB2FF','#7FD9A0','#FF7A6B','#FFB07A','#C49BFF','#FFD45E','#5ED3D0'];
const HLS=['#FFE14D','#7CF0A0','#7FD3FF','#FF9AD5','#FFB36B','#C9A7FF'];
const CFG_DEF={pen:{i:0,w:3.6,c:null},hl:{i:0,w:26},eraser:{w:22},shape:{k:'rect',i:0,w:3.6,c:null},text:{size:30,i:0,bold:false,c:null}};
const SHAPES={line:'Line',arrow:'Arrow',rect:'Box',ellipse:'Oval'};
const I={
  back:'<path d="M15 5l-7 7 7 7"/>',undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',redo:'<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
  pen:'<path d="M15.5 4.5l4 4L9 19l-5 1 1-5z"/><path d="M13.5 6.5l4 4"/>',hl:'<path d="M14 4l6 6-8 8H6v-6z"/><path d="M4 21h8"/>',
  eraser:'<path d="M8 20h12"/><path d="M4.5 15.5l9-9a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L11 19H8z"/>',
  lasso:'<path d="M7 17c-2.5-1-4-3-4-5.5C3 7.4 7 4 12 4s9 3.4 9 7.5S17 19 12 19c-1.4 0-2.6-.2-3.7-.6"/><path d="M8 17c0 2-1 3-2.5 3.5"/>',
  shape:'<rect x="3.5" y="10" width="9" height="9" rx="1.5"/><circle cx="16" cy="8" r="4.5"/>',text:'<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
  img:'<rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M20.5 16l-5-5-8 8"/>',
  more:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',zin:'<path d="M8 11h6M11 8v6"/><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',zout:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2M8 11h6"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',trash:'<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  pencil:'<path d="M4 20l3-1 11-11-2-2L5 17z"/><path d="M14 6l2 2"/>',book:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
  share:'<path d="M12 15V3M7.5 7.5L12 3l4.5 4.5"/><path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',pages:'<rect x="4" y="3.5" width="7" height="9" rx="1.5"/><rect x="13" y="3.5" width="7" height="9" rx="1.5"/><rect x="4" y="14.5" width="7" height="6" rx="1.5"/><rect x="13" y="14.5" width="7" height="6" rx="1.5"/>',
  pdf:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9.5 16.5h5M9.5 13h5"/>',moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  up:'<path d="M12 19V5M6 11l6-6 6 6"/>',down:'<path d="M12 5v14M6 13l6 6 6-6"/>',print:'<path d="M7 9V3h10v6"/><rect x="3.5" y="9" width="17" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
  bold:'<path d="M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z"/>'
};
const svg=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${I[k]||''}</svg>`;

/* ---------- state ---------- */
const S={books:[],book:null,pages:[],tool:'pen',cfg:JSON.parse(JSON.stringify(CFG_DEF)),zoom:1,pencilOnly:false,night:false,undo:[],redo:[],sel:null,q:'',cur:0};
try{const p=JSON.parse(localStorage.getItem('ishiros.notes.prefs2')||'{}');if(p.cfg)for(const k in CFG_DEF)S.cfg[k]={...CFG_DEF[k],...(p.cfg[k]||{})};S.pencilOnly=!!p.pencilOnly;S.night=!!p.night}catch(e){}
const savePrefs=()=>{try{localStorage.setItem('ishiros.notes.prefs2',JSON.stringify({cfg:S.cfg,pencilOnly:S.pencilOnly,night:S.night}))}catch(e){}};
const darkPaper=()=>S.book&&S.book.paper.bg==='dark';
const palette=t=>t==='hl'?HLS:(darkPaper()?INK_D:INK_L);
function colorOf(t){const c=S.cfg[t]||{};if(c.c)return c.c;const p=palette(t==='hl'?'hl':'pen');return p[(c.i||0)%p.length]}

/* ---------- drawing ---------- */
function outline(st,last=true){return PF.getStroke(st.p,{size:st.w,thinning:st.t==='hl'?0:(st.pr?.62:.5),smoothing:.55,streamline:st.t==='hl'?.6:.42,simulatePressure:!st.pr,last,start:{cap:true},end:{cap:true}})}
function fillOutline(ctx,o){if(o.length<2)return;ctx.beginPath();ctx.moveTo(o[0][0],o[0][1]);for(let i=1;i<o.length;i++){const a=o[i],b=o[(i+1)%o.length];ctx.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}ctx.closePath();ctx.fill()}
function drawStroke(ctx,st){
  if(st.sh){ /* shapes are crisp lines along their sampled points */
    ctx.globalAlpha=1;ctx.strokeStyle=st.c;ctx.lineWidth=st.w;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
    (st.segs||[st.p]).forEach(seg=>{seg.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]))});ctx.stroke();return}
  if(!st._o)st._o=outline(st);ctx.globalAlpha=st.t==='hl'?.38:1;ctx.fillStyle=st.c;fillOutline(ctx,st._o);ctx.globalAlpha=1}
function drawAll(ctx,p){(p.strokes||[]).forEach(st=>{if(st.t==='hl')drawStroke(ctx,st)});(p.strokes||[]).forEach(st=>{if(st.t!=='hl')drawStroke(ctx,st)})}
function shapePts(k,a,b){const seg=(x0,y0,x1,y1)=>{const n=Math.max(2,Math.ceil(Math.hypot(x1-x0,y1-y0)/8)),s=[];for(let i=0;i<=n;i++)s.push([x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,.5]);return s};
  if(k==='line')return{p:seg(a[0],a[1],b[0],b[1])};
  if(k==='arrow'){const ang=Math.atan2(b[1]-a[1],b[0]-a[0]),L=Math.min(40,Math.hypot(b[0]-a[0],b[1]-a[1])*.35);const h1=[b[0]-L*Math.cos(ang-.45),b[1]-L*Math.sin(ang-.45)],h2=[b[0]-L*Math.cos(ang+.45),b[1]-L*Math.sin(ang+.45)];
    const s1=seg(a[0],a[1],b[0],b[1]),s2=seg(h1[0],h1[1],b[0],b[1]).concat(seg(b[0],b[1],h2[0],h2[1]));return{p:s1.concat(s2),segs:[s1,s2]}}
  if(k==='rect'){const x0=Math.min(a[0],b[0]),y0=Math.min(a[1],b[1]),x1=Math.max(a[0],b[0]),y1=Math.max(a[1],b[1]);return{p:seg(x0,y0,x1,y0).concat(seg(x1,y0,x1,y1),seg(x1,y1,x0,y1),seg(x0,y1,x0,y0))}}
  const pts=[],cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2,rx=Math.abs(b[0]-a[0])/2,ry=Math.abs(b[1]-a[1])/2,n=Math.max(24,Math.ceil((rx+ry)/4));for(let i=0;i<=n;i++){const t=i/n*Math.PI*2;pts.push([cx+rx*Math.cos(t),cy+ry*Math.sin(t),.5])}return{p:pts}}
function moveStroke(st,dx,dy){const mv=q=>[q[0]+dx,q[1]+dy,q[2]];const n={...st,p:st.p.map(mv),_o:null};if(st.segs)n.segs=st.segs.map(sg=>sg.map(mv));return n}

/* ---------- view shell ---------- */
let V=null;
function shell(){if(V)return V;V=document.createElement('div');V.id='nbView';V.setAttribute('role','dialog');V.setAttribute('aria-label','Notebooks');document.body.appendChild(V);return V}
function show(){shell();V.hidden=false;V.classList.toggle('night',S.night);requestAnimationFrame(()=>V.classList.add('on'));document.documentElement.classList.add('nb-open')}
function hide(){if(!V)return;flushAll();V.classList.remove('on');document.documentElement.classList.remove('nb-open');setTimeout(()=>{if(!V.classList.contains('on')){V.hidden=true;V.innerHTML=''}},320)}
function modal(html,cls=''){const m=document.createElement('div');m.className='nb-modal';m.innerHTML=`<div class="nb-mcard ${cls}">${html}</div>`;V.appendChild(m);requestAnimationFrame(()=>m.classList.add('on'));return m}
const closeModal=m=>{if(!m)return;m.classList.remove('on');setTimeout(()=>m.remove(),200)};
const mhead=t=>`<div class="nb-mh"><h3>${t}</h3><button class="nb-ib sm" data-nb="cancel" aria-label="Close">${svg('x')}</button></div>`;

/* ---------- library ---------- */
async function library(){
  S.book=null;S.pages=[];S.sel=null;
  S.books=(await IDB.all('books')).sort((a,b)=>(b.u||0)-(a.u||0));
  let texts={};if(S.q){const ps=await IDB.all('pages');ps.forEach(p=>{const t=(p.texts||[]).map(x=>x.txt).join(' ').toLowerCase();if(t)texts[p.book]=(texts[p.book]||'')+' '+t})}
  const q=S.q.toLowerCase(),list=S.books.filter(b=>!q||b.title.toLowerCase().includes(q)||(texts[b.id]||'').includes(q));
  V.innerHTML=`<div class="nb-lib">
    <header class="nb-top"><button class="nb-ib" data-nb="close" aria-label="Close notebooks">${svg('x')}</button><h2>Note<em>books</em></h2>
      <button class="nb-ib" data-nb="night" aria-pressed="${S.night}" aria-label="Dark pages" title="Dark pages">${svg('moon')}</button>
      <button class="nb-pill nbghost" data-nb="importpdf">${svg('pdf')}<span>Import PDF</span></button><button class="nb-pill" data-nb="new">${svg('plus')}<span>New</span></button></header>
    <label class="nb-search">${svg('search')}<input id="nbQ" type="search" placeholder="Search notebooks and typed text" value="${esc(S.q)}"></label>
    <div class="nb-grid">${list.map(b=>`<div class="nb-card" data-open="${b.id}" role="button" tabindex="0" aria-label="${esc(b.title)}">
      <div class="nb-cover" style="--cv:${esc(b.color)}"><canvas data-thumb="${b.id}" width="300" height="424"></canvas><span class="nb-spine"></span></div>
      <div class="nb-meta"><span><b>${esc(b.title)}</b><small>${b.pages.length} page${b.pages.length===1?'':'s'} · ${esc(agoS(b.u))}</small></span><button class="nb-ib sm nbghost" data-menu="${b.id}" aria-label="Options for ${esc(b.title)}">${svg('more')}</button></div></div>`).join('')}
      ${!list.length?`<div class="nb-empty">${S.q?'Nothing matches that search.':`${svg('book')}<b>No notebooks yet</b><span>Make one for each class, or import a PDF to write on.</span>`}</div>`:''}</div>
    <input type="file" id="nbPdf" accept="application/pdf,.pdf" hidden></div>`;
  list.forEach(b=>thumb(b));
}
async function thumb(b){const c=$(`canvas[data-thumb="${b.id}"]`,V);if(!c||!b.pages[0])return;const p=await IDB.get('pages',b.pages[0]);if(!p)return;
  c.height=Math.round(c.width*HH(p)/PW);const img=await renderPageCanvas(p,b,c.width);c.getContext('2d').drawImage(img,0,0)}

/* ---------- notebook settings / new ---------- */
function tplPicker(sel,bg,attr='tp'){return`<div class="nb-tpls">${Object.entries(TPL).map(([k,l])=>`<button data-${attr}="${k}" aria-pressed="${k===sel}"><canvas data-tplprev="${k}" data-pbg="${bg}" width="120" height="170"></canvas><span>${l}</span></button>`).join('')}</div>`}
function paintTplPreviews(root){$$('canvas[data-tplprev]',root).forEach(c=>paintPaper(c.getContext('2d'),c.dataset.tplprev,c.dataset.pbg,c.width,c.height,c.width/PW,''))}
function bookForm(edit){
  const b=edit?JSON.parse(JSON.stringify(edit)):{title:'',color:COVERS[0],paper:{style:'lined',bg:'white'}};
  const m=modal(`${mhead(edit?'Notebook <em>settings</em>':'New <em>notebook</em>')}
    <label class="nb-fld"><span>Name</span><input id="nbT" value="${esc(b.title)}" placeholder="e.g. ISE 4404 · Optimization"></label>
    <div class="nb-cap">Cover</div><div class="nb-sw">${COVERS.map(c=>`<button data-cv="${c}" style="--c:${c}" aria-pressed="${c===b.color}" aria-label="Cover colour"></button>`).join('')}</div>
    <div class="nb-cap">Paper</div><div class="nb-seg" id="nbBg">${Object.entries(BGS).map(([k,v])=>`<button data-bg="${k}" aria-pressed="${k===b.paper.bg}"><i style="background:${v[0]}"></i>${v[2]}</button>`).join('')}</div>
    <div class="nb-cap">Template${edit?' · for new pages':''}</div>${tplPicker(b.paper.style,b.paper.bg)}
    <div class="nb-acts">${edit?`<button class="nb-btn danger" data-nb="delbook">${svg('trash')}Delete</button>`:''}<span></span><button class="nb-btn primary" data-nb="${edit?'savebook':'createbook'}">${edit?'Save':'Create notebook'}</button></div>`,'wide');
  m._b=b;m._edit=edit||null;paintTplPreviews(m);setTimeout(()=>{const t=$('#nbT',m);if(t&&!edit)t.focus()},250);
}
async function createBook(m){const b=m._b;b.title=($('#nbT',m).value.trim()||'Untitled');const pg={id:uid(),book:'',strokes:[],texts:[],imgs:[],tpl:b.paper.style,u:Date.now()};
  const book={id:uid(),title:b.title,color:b.color,paper:b.paper,pages:[pg.id],created:Date.now(),u:Date.now()};pg.book=book.id;
  await IDB.put('pages',pg);await IDB.put('books',book);closeModal(m);changed();openBook(book.id)}

/* ---------- PDF import (pdf.js, bundled with the app) ---------- */
let PDFJS=null;
async function pdfjs(){if(PDFJS)return PDFJS;const m=await import(new URL('pdfjs/pdf.min.mjs',location.href).href);m.GlobalWorkerOptions.workerSrc=new URL('pdfjs/pdf.worker.min.mjs',location.href).href;PDFJS=m;return m}
async function pdfToPages(file,bookId){
  const lib=await pdfjs(),data=new Uint8Array(await file.arrayBuffer()),doc=await lib.getDocument({data,isEvalSupported:false}).promise,out=[];
  for(let i=1;i<=doc.numPages;i++){progress(`Importing page ${i} of ${doc.numPages}…`);const pg=await doc.getPage(i),vp0=pg.getViewport({scale:1}),vp=pg.getViewport({scale:1500/vp0.width});
    const c=document.createElement('canvas');c.width=Math.round(vp.width);c.height=Math.round(vp.height);const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);
    await pg.render({canvasContext:ctx,viewport:vp}).promise;out.push({id:uid(),book:bookId,strokes:[],texts:[],imgs:[],tpl:'blank',bg:c.toDataURL('image/jpeg',.84),h:Math.round(PW*vp.height/vp.width),u:Date.now()});pg.cleanup()}
  progress('');return out}
let progEl=null;function progress(t){if(!V)return;if(!t){progEl?.remove();progEl=null;return}if(!progEl){progEl=document.createElement('div');progEl.className='nb-prog';V.appendChild(progEl)}progEl.textContent=t}
async function importPdfAsBook(file){if(!file)return;try{const id=uid(),pages=await pdfToPages(file,id);if(!pages.length)return;
  for(const p of pages)await IDB.put('pages',p);const book={id,title:file.name.replace(/\.pdf$/i,'')||'PDF',color:COVERS[2],paper:{style:'blank',bg:'white'},pages:pages.map(p=>p.id),created:Date.now(),u:Date.now()};
  await IDB.put('books',book);changed();say(`Imported ${pages.length} page${pages.length===1?'':'s'} · write anywhere on them`);openBook(id)}catch(e){progress('');say('Couldn’t open that PDF: '+(e.message||e))}}
async function insertPdfPages(file){if(!file)return;try{const pages=await pdfToPages(file,S.book.id);for(const p of pages)await IDB.put('pages',p);S.pages.splice(S.cur+1,0,...pages);S.book.pages=S.pages.map(p=>p.id);pages.forEach(touch);layout();say(`Added ${pages.length} PDF page${pages.length===1?'':'s'}`)}catch(e){progress('');say('Couldn’t open that PDF: '+(e.message||e))}}

/* ---------- notebook ---------- */
async function openBook(id){
  const b=await IDB.get('books',id);if(!b)return library();S.book=b;S.undo=[];S.redo=[];S.sel=null;S.zoom=1;if(['text','lasso'].includes(S.tool))S.tool='pen';
  S.pages=(await Promise.all(b.pages.map(p=>IDB.get('pages',p)))).filter(Boolean);
  if(!S.pages.length){const pg={id:uid(),book:b.id,strokes:[],texts:[],imgs:[],tpl:b.paper.style,u:Date.now()};S.pages=[pg];b.pages=[pg.id];IDB.put('pages',pg);IDB.put('books',b)}
  V.innerHTML=`<div class="nb-ed">
    <header class="nb-bar">
      <div class="nb-grp nb-left"><button class="nb-ib" data-nb="lib" aria-label="All notebooks">${svg('back')}</button><button class="nb-title" data-nb="bookset" title="Notebook settings">${esc(b.title)}</button></div>
      <div class="nb-grp nb-toolgrp" id="nbTools"></div>
      <div class="nb-grp nb-right"><button class="nb-ib" data-nb="undo" aria-label="Undo">${svg('undo')}</button><button class="nb-ib" data-nb="redo" aria-label="Redo">${svg('redo')}</button>
        <button class="nb-ib nb-wide" data-nb="pages" aria-label="Pages">${svg('pages')}</button><button class="nb-ib accent" data-nb="share" aria-label="Export or share">${svg('share')}</button><button class="nb-ib" data-nb="more" aria-label="More">${svg('more')}</button></div>
    </header>
    <div class="nb-scroll" id="nbScroll"><div class="nb-pages" id="nbPages"></div></div>
    <div class="nb-zoom"><button class="nb-ib sm nbghost" data-nb="zout" aria-label="Zoom out">${svg('zout')}</button><b id="nbZ">100%</b><button class="nb-ib sm nbghost" data-nb="zin" aria-label="Zoom in">${svg('zin')}</button><span class="nb-pgno" id="nbPg">1 / ${S.pages.length}</span></div>
    <input type="file" id="nbImg" accept="image/*" hidden><input type="file" id="nbPdf2" accept="application/pdf,.pdf" hidden>
  </div>`;
  tools();layout();bindScroll();
}
function tools(){
  const t=S.tool,el=$('#nbTools');if(!el)return;
  const tb=(k,l)=>`<button class="nb-tool${t===k?' on':''}" data-tool="${k}" aria-label="${l}" aria-pressed="${t===k}" title="${l}">${svg(k)}</button>`;
  const szOf=k=>Math.max(6,Math.min(18,(S.cfg[k].w||8)*(k==='hl'||k==='eraser'?.5:2.2)));
  const sw=['pen','hl','shape','text'].includes(t)?`<button class="nb-swatch" data-nb="pop" aria-label="Colour and size" title="Colour and size"><i style="background:${colorOf(t)};--sz:${t==='text'?14:szOf(t)}px"></i></button>`:t==='eraser'?`<button class="nb-swatch" data-nb="pop" aria-label="Eraser size"><i class="er" style="--sz:${szOf('eraser')}px"></i></button>`:'';
  el.innerHTML=`${tb('pen','Pen (P)')}${tb('hl','Highlighter (H)')}${tb('eraser','Eraser (E)')}${tb('lasso','Lasso: select, move, copy (L)')}${tb('shape','Shapes (S)')}${tb('text','Text (T)')}<button class="nb-tool" data-nb="img" aria-label="Insert photo" title="Insert photo">${svg('img')}</button>${sw?`<span class="nb-sep"></span>${sw}`:''}`;
  V.classList.toggle('t-text',t==='text');V.classList.toggle('t-lasso',t==='lasso');
}
/* colour / size popover for the current tool */
function popover(anchor){
  $('.nb-pop',V)?.remove();if(!anchor)return;const t=S.tool,c=S.cfg[t],pal=palette(t==='hl'?'hl':'pen');
  const p=document.createElement('div');p.className='nb-pop';
  const cols=`<div class="nb-cap">Colour</div><div class="nb-cols">${pal.map((x,i)=>`<button class="nb-col${!c.c&&(c.i||0)===i?' on':''}" data-pi="${i}" style="--c:${x}" aria-label="Colour ${i+1}"></button>`).join('')}${t!=='hl'?`<label class="nb-col nb-custom${c.c?' on':''}" style="--c:${c.c||'conic-gradient(#f44,#fd4,#4f8,#4df,#66f,#f4f,#f44)'}" aria-label="Pick any colour"><input type="color" id="nbCustom" value="${c.c||'#1d1c1a'}"></label>`:''}</div>`;
  const slider=(k,min,max,step,label)=>`<div class="nb-cap">${label}<b id="nbSzV">${(+c[k]).toFixed(1)}</b></div><input class="nb-range" type="range" data-pk="${k}" min="${min}" max="${max}" step="${step}" value="${c[k]}">`;
  if(t==='pen')p.innerHTML=cols+slider('w',1,14,.2,'Thickness');
  else if(t==='hl')p.innerHTML=cols+slider('w',8,60,1,'Thickness');
  else if(t==='eraser')p.innerHTML=slider('w',6,80,1,'Eraser size')+`<button class="nb-btn danger full" data-nb="clearpage">${svg('trash')}Clear this page</button>`;
  else if(t==='shape')p.innerHTML=`<div class="nb-cap">Shape</div><div class="nb-seg">${Object.entries(SHAPES).map(([k,l])=>`<button data-shk="${k}" aria-pressed="${c.k===k}">${l}</button>`).join('')}</div>`+cols+slider('w',1,14,.2,'Thickness');
  else if(t==='text')p.innerHTML=`<div class="nb-cap">Size</div><div class="nb-seg">${[[22,'S'],[30,'M'],[42,'L'],[60,'XL']].map(([v,l])=>`<button data-tsz="${v}" aria-pressed="${c.size==v}">${l}</button>`).join('')}<button data-tbold="1" aria-pressed="${!!c.bold}" aria-label="Bold">${svg('bold')}</button></div>`+cols;
  V.appendChild(p);const r=anchor.getBoundingClientRect(),pr=p.getBoundingClientRect();p.style.left=Math.max(10,Math.min(innerWidth-pr.width-10,r.left+r.width/2-pr.width/2))+'px';p.style.top=(r.bottom+10)+'px';
  requestAnimationFrame(()=>p.classList.add('on'));
}
const closePop=()=>{const p=$('.nb-pop',V);if(p){p.classList.remove('on');setTimeout(()=>p.remove(),160)}};

/* page size on screen */
function dispW(){const sc=$('#nbScroll');const avail=(sc?sc.clientWidth:innerWidth)-(innerWidth>=700?80:20);return Math.round(Math.min(avail,960)*S.zoom)}
function layout(){
  const wrap=$('#nbPages');if(!wrap)return;const w=dispW(),s=w/PW;
  wrap.style.setProperty('--s',s);wrap.style.width=w+'px';
  const have=new Map($$('.nb-page',wrap).map(el=>[el.dataset.pid,el]));
  S.pages.forEach((p,i)=>{let el=have.get(p.id);
    if(!el){el=document.createElement('div');el.className='nb-page';el.dataset.pid=p.id;el.innerHTML=`<canvas class="nb-paper"></canvas><img class="nb-bg" alt="" hidden draggable="false"><div class="nb-imgs"></div><canvas class="nb-ink"></canvas><div class="nb-txts"></div><span class="nb-no"></span>`}
    el.style.width=w+'px';el.style.height=Math.round(HH(p)*s)+'px';el.querySelector('.nb-no').textContent=i+1;wrap.appendChild(el);el._dirty=true;have.delete(p.id)});
  have.forEach(el=>el.remove());
  $('#nbZ').textContent=Math.round(S.zoom*100)+'%';
  paintVisible(true);
}
let paintT=0;
function paintVisible(force){cancelAnimationFrame(paintT);paintT=requestAnimationFrame(()=>{const sc=$('#nbScroll');if(!sc)return;const r=sc.getBoundingClientRect();
  const els=$$('.nb-page',sc);els.forEach(el=>{const b=el.getBoundingClientRect();const vis=b.bottom>r.top-500&&b.top<r.bottom+500;if(vis&&(el._dirty||force&&el._w!==b.width))paintPage(el)});
  let best=0,bv=-1;els.forEach((el,i)=>{const b=el.getBoundingClientRect(),v=Math.min(b.bottom,r.bottom)-Math.max(b.top,r.top);if(v>bv){bv=v;best=i}});S.cur=best;const pg=$('#nbPg');if(pg)pg.textContent=`${best+1} / ${S.pages.length}`})}
function pageOf(el){return S.pages.find(p=>p.id===el.dataset.pid)}
const pageTpl=p=>p.tpl||S.book.paper.style;
function paintPage(el){
  const p=pageOf(el);if(!p)return;const w=el.clientWidth,h=el.clientHeight,s=w/PW;
  const dpr=Math.min(2.5,devicePixelRatio||1),k=Math.min(dpr,4096/w,4096/h),kp=Math.min(k,1.5);
  const pc=el.querySelector('.nb-paper');pc.width=Math.round(w*kp);pc.height=Math.round(h*kp);pc.style.width=w+'px';pc.style.height=h+'px';
  paintPaper(pc.getContext('2d'),p.bg?'blank':pageTpl(p),S.book.paper.bg,pc.width,pc.height,pc.width/PW,new Date(p.u||Date.now()).toLocaleDateString());
  const bgi=el.querySelector('.nb-bg');if(p.bg&&safeImg(p.bg)){if(bgi.getAttribute('src')!==p.bg)bgi.src=p.bg;bgi.hidden=false}else bgi.hidden=true;
  const c=el.querySelector('.nb-ink');c.width=Math.round(w*k);c.height=Math.round(h*k);c.style.width=w+'px';c.style.height=h+'px';
  const ctx=c.getContext('2d');ctx.setTransform(k*s,0,0,k*s,0,0);ctx.clearRect(0,0,PW,HH(p));drawAll(ctx,p);
  el._dirty=false;el._w=w;
  el.querySelector('.nb-imgs').innerHTML=(p.imgs||[]).map(m=>`<img data-iid="${esc(m.id)}" src="${safeImg(m.src)}" style="left:${+m.x*s}px;top:${+m.y*s}px;width:${+m.w*s}px;height:${+m.h*s}px" alt="" draggable="false">`).join('');
  const ink=BGS[S.book.paper.bg][1];
  el.querySelector('.nb-txts').innerHTML=(p.texts||[]).map(t=>`<div class="nb-txt" data-tid="${esc(t.id)}" contenteditable="${S.tool==='text'?'true':'false'}" spellcheck="true" style="left:${+t.x*s}px;top:${+t.y*s}px;width:${+t.w*s}px;font-size:${+t.size*s}px;font-weight:${t.bold?700:500};color:${esc(t.c||ink)}">${esc(t.txt)}</div>`).join('');
  if(S.sel&&S.sel.pid===p.id)drawSel(el);
}
function repaint(pid){const el=$(`.nb-page[data-pid="${pid}"]`,V);if(el)paintPage(el)}

/* ---------- saving ---------- */
const dirty=new Set();let saveT=0;
function touch(p){p.u=Date.now();dirty.add(p.id);clearTimeout(saveT);saveT=setTimeout(flushAll,500)}
const changed=d=>window.dispatchEvent(new CustomEvent('life-notes-changed',{detail:d}));
async function flushAll(){clearTimeout(saveT);if(!S.book)return;const ids=[...dirty];dirty.clear();
  for(const id of ids){const p=S.pages.find(x=>x.id===id);if(p)await IDB.put('pages',strip(p))}
  if(ids.length){S.book.u=Date.now();await IDB.put('books',S.book);changed()}}
const strip=p=>({...p,strokes:(p.strokes||[]).map(({_o,...st})=>st)});

/* ---------- undo ---------- */
function snap(p){S.undo.push({pid:p.id,s:[...(p.strokes||[])],t:[...(p.texts||[])],i:[...(p.imgs||[])]});if(S.undo.length>100)S.undo.shift();S.redo=[]}
function undoRedo(from,to){const u=from.pop();if(!u){say(from===S.undo?'Nothing to undo':'Nothing to redo');return}const p=S.pages.find(x=>x.id===u.pid);if(!p)return;
  to.push({pid:p.id,s:[...p.strokes],t:[...p.texts],i:[...p.imgs]});p.strokes=u.s;p.texts=u.t;p.imgs=u.i;S.sel=null;touch(p);repaint(p.id)}

/* ---------- input: Pencil, fingers, pinch ---------- */
const ptrs=new Map();let act=null,pinch=null,mom=0;
function toPage(el,e){const r=el.getBoundingClientRect(),s=r.width/PW;return[(e.clientX-r.left)/s,(e.clientY-r.top)/s,r]}
function bindScroll(){
  const sc=$('#nbScroll');
  sc.addEventListener('scroll',()=>paintVisible(false),{passive:true});
  sc.addEventListener('pointerdown',onDown);sc.addEventListener('pointermove',onMove);sc.addEventListener('pointerup',onUp);sc.addEventListener('pointercancel',onUp);
  sc.addEventListener('wheel',e=>{if(e.ctrlKey){e.preventDefault();zoomAt(S.zoom*Math.exp(-e.deltaY*.01),e.clientX,e.clientY,true)}},{passive:false});
  sc.addEventListener('gesturestart',e=>{e.preventDefault();sc._gz=S.zoom});sc.addEventListener('gesturechange',e=>{e.preventDefault();zoomAt(sc._gz*e.scale,e.clientX||innerWidth/2,e.clientY||innerHeight/2,true)});
  sc.addEventListener('gestureend',e=>{e.preventDefault();layout()});
}
function drawsWith(e){if(e.pointerType==='pen'){if(!S.pencilOnly){S.pencilOnly=true;savePrefs();say('Apple Pencil found: Pencil writes, fingers scroll')}return true}
  if(e.pointerType==='touch')return!S.pencilOnly;return e.button===0}
function onDown(e){
  closePop();const sc=$('#nbScroll');ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY,t:e.pointerType});cancelAnimationFrame(mom);
  if(e.target.closest('.nb-selbar'))return;
  const touches=[...ptrs.values()].filter(p=>p.t==='touch');
  if(touches.length===2){if(act&&act.live)act.live.remove();act=null;const[a,b]=touches;pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:S.zoom,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2};return}
  const pageEl=e.target.closest('.nb-page');
  if(!pageEl||e.pointerType==='touch'&&!drawsWith(e)){if(e.pointerType!=='mouse')act={kind:'pan',y:e.clientY,x:e.clientX,st:sc.scrollTop,sl:sc.scrollLeft,v:0,lt:performance.now(),ly:e.clientY};return}
  if(!drawsWith(e))return;
  const p=pageOf(pageEl),[x,y]=toPage(pageEl,e);
  if(S.tool==='text'){if(e.target.closest('.nb-txt'))return;e.preventDefault();addText(p,pageEl,x,y);return}
  if(S.tool==='lasso'){
    const im=e.target.closest('img[data-iid]'),tx=e.target.closest('.nb-txt');
    if(S.sel&&S.sel.pid===p.id&&inBox(S.sel.box,x,y)){act={kind:'move',p,el:pageEl,x0:x,y0:y,dx:0,dy:0,id:e.pointerId};snap(p);sc.setPointerCapture(e.pointerId);return}
    if(im||tx){S.sel={pid:p.id,strokes:[],imgs:im?[im.dataset.iid]:[],texts:tx?[tx.dataset.tid]:[]};S.sel.box=selBox(p);drawSel(pageEl);act={kind:'move',p,el:pageEl,x0:x,y0:y,dx:0,dy:0,id:e.pointerId};snap(p);sc.setPointerCapture(e.pointerId);return}
    clearSel();act={kind:'lasso',p,el:pageEl,pts:[[x,y]],live:liveCanvas(pageEl),id:e.pointerId};sc.setPointerCapture(e.pointerId);return}
  e.preventDefault();sc.setPointerCapture(e.pointerId);
  if(S.tool==='eraser'){snap(p);act={kind:'erase',p,el:pageEl,n:0,id:e.pointerId};eraseAt(p,x,y);return}
  if(S.tool==='shape'){act={kind:'shape',p,el:pageEl,a:[x,y],b:[x,y],live:liveCanvas(pageEl),id:e.pointerId};return}
  const t=S.tool==='hl'?'hl':'pen';
  act={kind:'ink',p,el:pageEl,id:e.pointerId,st:{t,c:colorOf(t),w:S.cfg[t].w,pr:e.pointerType==='pen',p:[[x,y,e.pointerType==='pen'?Math.max(.05,e.pressure||.5):.5]]},live:liveCanvas(pageEl)};
  drawLive();
}
function onMove(e){
  const sc=$('#nbScroll');const pp=ptrs.get(e.pointerId);if(pp){pp.x=e.clientX;pp.y=e.clientY}
  if(pinch){const touches=[...ptrs.values()].filter(p=>p.t==='touch');if(touches.length<2)return;const[a,b]=touches,d=Math.hypot(a.x-b.x,a.y-b.y),cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
    zoomAt(pinch.z*d/pinch.d,pinch.cx,pinch.cy,true);if(pinch.py!=null){sc.scrollTop-=cy-pinch.py;sc.scrollLeft-=cx-pinch.px}pinch.py=cy;pinch.px=cx;return}
  if(!act)return;
  if(act.kind==='pan'){const now=performance.now();sc.scrollTop=act.st-(e.clientY-act.y);sc.scrollLeft=act.sl-(e.clientX-act.x);act.v=(act.ly-e.clientY)/Math.max(1,now-act.lt)*.6+act.v*.4;act.ly=e.clientY;act.lt=now;return}
  if(e.pointerId!==act.id)return;
  const evs=e.getCoalescedEvents?e.getCoalescedEvents():[e];
  if(act.kind==='ink'){for(const ev of evs){const[x,y]=toPage(act.el,ev);act.st.p.push([x,y,act.st.pr?Math.max(.05,ev.pressure||.5):.5])}drawLive();return}
  if(act.kind==='erase'){for(const ev of evs){const[x,y]=toPage(act.el,ev);eraseAt(act.p,x,y)}return}
  if(act.kind==='lasso'){const[x,y]=toPage(act.el,e);act.pts.push([x,y]);drawLasso();return}
  if(act.kind==='shape'){let[x,y]=toPage(act.el,e);if(e.shiftKey){const dx=x-act.a[0],dy=y-act.a[1],m=Math.max(Math.abs(dx),Math.abs(dy));x=act.a[0]+Math.sign(dx)*m;y=act.a[1]+Math.sign(dy)*m}act.b=[x,y];drawShapeLive();return}
  if(act.kind==='move'){const[x,y]=toPage(act.el,e);act.dx=x-act.x0;act.dy=y-act.y0;previewMove();return}
}
function onUp(e){
  ptrs.delete(e.pointerId);const sc=$('#nbScroll');
  if(pinch){if([...ptrs.values()].filter(p=>p.t==='touch').length<2){pinch=null;layout()}return}
  if(!act)return;
  if(act.kind==='pan'){let v=act.v*16;act=null;const step=()=>{if(Math.abs(v)<.5)return;sc.scrollTop+=v;v*=.94;mom=requestAnimationFrame(step)};mom=requestAnimationFrame(step);return}
  if(e.pointerId!==act.id)return;
  const a=act;act=null;
  if(a.kind==='ink'){a.live.remove();if(a.st.p.length===1){const q=a.st.p[0];a.st.p.push([q[0]+.4,q[1]+.4,q[2]])}snap(a.p);a.p.strokes.push(a.st);touch(a.p);
    if(a.st.t==='hl')paintPage(a.el);else{const c=a.el.querySelector('.nb-ink'),ctx=c.getContext('2d'),k=c.width/PW;ctx.setTransform(k,0,0,k,0,0);drawStroke(ctx,a.st)}return}
  if(a.kind==='shape'){a.live.remove();if(Math.hypot(a.b[0]-a.a[0],a.b[1]-a.a[1])<6)return;const c=S.cfg.shape,sp=shapePts(c.k,a.a,a.b);snap(a.p);a.p.strokes.push({t:'pen',sh:c.k,c:colorOf('shape'),w:c.w,pr:false,...sp});touch(a.p);paintPage(a.el);return}
  if(a.kind==='erase'){if(!a.n)S.undo.pop();else touch(a.p);return}
  if(a.kind==='lasso'){a.live.remove();finishLasso(a);return}
  if(a.kind==='move'){commitMove(a);return}
}
function liveCanvas(pageEl){const c=document.createElement('canvas');c.className='nb-live';const w=pageEl.clientWidth,h=pageEl.clientHeight,k=Math.min(2,devicePixelRatio||1,4096/Math.max(w,h));c.width=w*k;c.height=h*k;c.style.width=w+'px';c.style.height=h+'px';pageEl.appendChild(c);c._k=k*w/PW;return c}
const clearLive=c=>{const ctx=c.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,c.width,c.height);ctx.setTransform(c._k,0,0,c._k,0,0);return ctx};
let liveRAF=0;
function drawLive(){if(liveRAF)return;liveRAF=requestAnimationFrame(()=>{liveRAF=0;if(!act||act.kind!=='ink')return;const ctx=clearLive(act.live);const st={...act.st};st._o=outline(st,false);drawStroke(ctx,st)})}
function drawShapeLive(){const ctx=clearLive(act.live),c=S.cfg.shape;drawStroke(ctx,{sh:c.k,c:colorOf('shape'),w:c.w,...shapePts(c.k,act.a,act.b)})}
function eraseAt(p,x,y){const r=S.cfg.eraser.w/2;const keep=[];let hit=false;
  for(const st of p.strokes){const rr=r+st.w/2;if(st.p.some(q=>(q[0]-x)**2+(q[1]-y)**2<rr*rr))hit=true;else keep.push(st)}
  if(hit){p.strokes=keep;act.n++;repaint(p.id)}}
/* ---------- lasso / selection ---------- */
function drawLasso(){const ctx=clearLive(act.live);ctx.setLineDash([10,8]);ctx.lineWidth=2.2;ctx.strokeStyle='#F06D44';ctx.fillStyle='rgba(240,109,68,.08)';ctx.beginPath();act.pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();ctx.fill();ctx.stroke()}
function inPoly(pt,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>pt[1])!==(b[1]>pt[1])&&pt[0]<(b[0]-a[0])*(pt[1]-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
function finishLasso(a){const p=a.p,poly=a.pts;if(poly.length<4){clearSel();return}
  const strokes=[];p.strokes.forEach((st,i)=>{const n=st.p.filter(q=>inPoly(q,poly)).length;if(n>=st.p.length*.5)strokes.push(i)});
  const imgs=p.imgs.filter(m=>inPoly([m.x+m.w/2,m.y+m.h/2],poly)).map(m=>m.id),texts=p.texts.filter(t=>inPoly([t.x+20,t.y+t.size/2],poly)).map(t=>t.id);
  if(!strokes.length&&!imgs.length&&!texts.length){clearSel();return}
  S.sel={pid:p.id,strokes,imgs,texts};S.sel.box=selBox(p);drawSel(a.el)}
function selBox(p){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const add=(x,y)=>{x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)};
  S.sel.strokes.forEach(i=>{const st=p.strokes[i];if(st)st.p.forEach(q=>{add(q[0]-st.w,q[1]-st.w);add(q[0]+st.w,q[1]+st.w)})});
  S.sel.imgs.forEach(id=>{const m=p.imgs.find(z=>z.id===id);if(m){add(m.x,m.y);add(m.x+m.w,m.y+m.h)}});
  S.sel.texts.forEach(id=>{const t=p.texts.find(z=>z.id===id);if(t){add(t.x,t.y);add(t.x+t.w,t.y+t.size*1.4*Math.max(1,(t.txt.match(/\n/g)||[]).length+1))}});
  return[x0-8,y0-8,x1+8,y1+8]}
const inBox=(b,x,y)=>x>=b[0]&&x<=b[2]&&y>=b[1]&&y<=b[3];
function drawSel(pageEl){$$('.nb-selbox,.nb-selbar',V).forEach(n=>n.remove());if(!S.sel)return;const s=pageEl.clientWidth/PW,b=S.sel.box;
  const box=document.createElement('div');box.className='nb-selbox';box.style.cssText=`left:${b[0]*s}px;top:${b[1]*s}px;width:${(b[2]-b[0])*s}px;height:${(b[3]-b[1])*s}px`;
  if(S.sel.imgs.length===1&&!S.sel.strokes.length&&!S.sel.texts.length)box.innerHTML='<i class="nb-rz" data-nbrz="1"></i>';
  pageEl.appendChild(box);
  const bar=document.createElement('div');bar.className='nb-selbar';
  bar.innerHTML=`<button data-nb="seldel">${svg('trash')}<span>Delete</span></button><button data-nb="seldup">${svg('copy')}<span>Duplicate</span></button><button data-nb="selcard">${svg('book')}<span>Flashcard</span></button>${S.sel.strokes.length?`<button data-nb="selcol"><i style="background:${colorOf('pen')}"></i><span>Recolour</span></button>`:''}`;
  pageEl.appendChild(bar);const bw=bar.offsetWidth,above=b[1]*s-bar.offsetHeight-10;
  bar.style.left=Math.max(6,Math.min(pageEl.clientWidth-bw-6,(b[0]+b[2])/2*s-bw/2))+'px';bar.style.top=(above>6?above:b[3]*s+10)+'px'}
function clearSel(){S.sel=null;$$('.nb-selbox,.nb-selbar',V).forEach(n=>n.remove())}
function previewMove(){const s=act.el.clientWidth/PW;$$('.nb-selbox,.nb-selbar',act.el).forEach(n=>n.style.transform=`translate(${act.dx*s}px,${act.dy*s}px)`);
  if(!act.ghost)act.ghost=liveCanvas(act.el);const g=act.ghost,ctx=g.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,g.width,g.height);ctx.setTransform(g._k,0,0,g._k,act.dx*g._k,act.dy*g._k);
  ctx.globalAlpha=.6;S.sel.strokes.forEach(i=>{const st=act.p.strokes[i];if(st)drawStroke(ctx,st)});ctx.globalAlpha=1;
  S.sel.imgs.forEach(id=>{const im=act.el.querySelector(`img[data-iid="${id}"]`);if(im)im.style.transform=`translate(${act.dx*s}px,${act.dy*s}px)`});
  S.sel.texts.forEach(id=>{const t=act.el.querySelector(`.nb-txt[data-tid="${id}"]`);if(t)t.style.transform=`translate(${act.dx*s}px,${act.dy*s}px)`})}
function commitMove(a){a.ghost?.remove();const p=a.p,dx=a.dx,dy=a.dy;if(Math.abs(dx)+Math.abs(dy)<1){S.undo.pop();drawSel(a.el);return}
  p.strokes=p.strokes.map((st,i)=>S.sel.strokes.includes(i)?moveStroke(st,dx,dy):st);
  p.imgs=p.imgs.map(m=>S.sel.imgs.includes(m.id)?{...m,x:m.x+dx,y:m.y+dy}:m);p.texts=p.texts.map(t=>S.sel.texts.includes(t.id)?{...t,x:t.x+dx,y:t.y+dy}:t);
  S.sel.box=[S.sel.box[0]+dx,S.sel.box[1]+dy,S.sel.box[2]+dx,S.sel.box[3]+dy];touch(p);paintPage(a.el)}
function selAction(k){const p=S.pages.find(x=>x.id===S.sel.pid);if(!p)return;snap(p);
  if(k==='seldel'){p.strokes=p.strokes.filter((_,i)=>!S.sel.strokes.includes(i));p.imgs=p.imgs.filter(m=>!S.sel.imgs.includes(m.id));p.texts=p.texts.filter(t=>!S.sel.texts.includes(t.id));S.sel=null}
  if(k==='seldup'){const d=24,n0=p.strokes.length,ns=S.sel.strokes.map(i=>moveStroke(p.strokes[i],d,d));p.strokes=[...p.strokes,...ns];
    const ni=S.sel.imgs.map(id=>{const m=p.imgs.find(z=>z.id===id);return{...m,id:uid(),x:m.x+d,y:m.y+d}}),nt=S.sel.texts.map(id=>{const t=p.texts.find(z=>z.id===id);return{...t,id:uid(),x:t.x+d,y:t.y+d}});
    p.imgs=[...p.imgs,...ni];p.texts=[...p.texts,...nt];S.sel={pid:p.id,strokes:ns.map((_,i)=>n0+i),imgs:ni.map(m=>m.id),texts:nt.map(t=>t.id)};S.sel.box=selBox(p)}
  if(k==='selcol'){const c=colorOf('pen');p.strokes=p.strokes.map((st,i)=>S.sel.strokes.includes(i)&&st.t!=='hl'?{...st,c,_o:st._o}:st)}
  touch(p);repaint(p.id)}
document.addEventListener('pointerdown',e=>{const h=e.target.closest&&e.target.closest('[data-nbrz]');if(!h||!S.sel)return;e.stopPropagation();e.preventDefault();
  const pageEl=h.closest('.nb-page'),p=pageOf(pageEl),m=p.imgs.find(z=>z.id===S.sel.imgs[0]);if(!m)return;snap(p);const s=pageEl.clientWidth/PW,x0=e.clientX,w0=m.w,h0=m.h;
  const mv=ev=>{const w=Math.max(60,w0+(ev.clientX-x0)/s);m.w=w;m.h=w*h0/w0;const im=pageEl.querySelector(`img[data-iid="${m.id}"]`);if(im){im.style.width=m.w*s+'px';im.style.height=m.h*s+'px'}};
  const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);S.sel.box=selBox(p);touch(p);paintPage(pageEl)};addEventListener('pointermove',mv);addEventListener('pointerup',up)},true);

/* ---------- text boxes ---------- */
function addText(p,pageEl,x,y){snap(p);const c=S.cfg.text,t={id:uid(),x:Math.max(10,x-4),y:Math.max(10,y-c.size*.6),w:Math.min(600,PW-x-20),size:c.size,bold:!!c.bold,txt:'',c:colorOf('text')};p.texts.push(t);paintPage(pageEl);
  const el=pageEl.querySelector(`.nb-txt[data-tid="${t.id}"]`);if(el)el.focus()}
document.addEventListener('input',e=>{const el=e.target.closest&&e.target.closest('.nb-txt');if(!el)return;const pageEl=el.closest('.nb-page'),p=pageOf(pageEl),t=p&&p.texts.find(z=>z.id===el.dataset.tid);if(!t)return;
  const nt={...t,txt:el.innerText.replace(/\n$/,'')};p.texts=p.texts.map(z=>z.id===t.id?nt:z);touch(p)});
document.addEventListener('focusout',e=>{const el=e.target.closest&&e.target.closest('.nb-txt');if(!el)return;const pageEl=el.closest('.nb-page'),p=pageOf(pageEl);if(!p)return;const t=p.texts.find(z=>z.id===el.dataset.tid);
  if(t&&!t.txt.trim()){p.texts=p.texts.filter(z=>z.id!==t.id);touch(p);paintPage(pageEl)}});
function drawTexts(ctx,p,b){const ink=BGS[b.paper.bg][1];(p.texts||[]).forEach(t=>{ctx.fillStyle=t.c||ink;ctx.font=`${t.bold?700:500} ${t.size}px -apple-system,system-ui,sans-serif`;ctx.textBaseline='top';
  let y=t.y+2;for(const para of String(t.txt).split('\n')){let line='';for(const w of para.split(' ')){const test=line?line+' '+w:w;if(ctx.measureText(test).width>t.w&&line){ctx.fillText(line,t.x+2,y);y+=t.size*1.3;line=w}else line=test}ctx.fillText(line,t.x+2,y);y+=t.size*1.3}})}
/* ---------- images ---------- */
function loadImg(src){return new Promise(r=>{const im=new Image();im.onload=()=>r(im);im.onerror=()=>r(null);im.src=src})}
async function drawImgs(ctx,p,k){for(const m of p.imgs||[]){const im=await loadImg(m.src);if(im)ctx.drawImage(im,m.x*k,m.y*k,m.w*k,m.h*k)}}
async function insertImage(file){if(!file)return;const url=URL.createObjectURL(file),im=await loadImg(url);URL.revokeObjectURL(url);if(!im){say('Couldn’t read that image');return}
  const max=1400,sc=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);c.getContext('2d').drawImage(im,0,0,c.width,c.height);
  const src=c.toDataURL('image/jpeg',.85),p=S.pages[S.cur]||S.pages[0],w=Math.min(600,PW-80),h=w*c.height/c.width;snap(p);
  const pageEl=$(`.nb-page[data-pid="${p.id}"]`,V),sc2=$('#nbScroll'),r=pageEl.getBoundingClientRect(),s=r.width/PW,vy=Math.max(40,Math.min(HH(p)-h-40,(sc2.getBoundingClientRect().top+sc2.clientHeight/2-r.top)/s-h/2));
  const m={id:uid(),x:(PW-w)/2,y:vy,w,h,src};p.imgs.push(m);touch(p);S.tool='lasso';tools();S.sel={pid:p.id,strokes:[],imgs:[m.id],texts:[]};S.sel.box=selBox(p);paintPage(pageEl);say('Drag to move, corner to resize')}

/* ---------- zoom ---------- */
function zoomAt(z,cx,cy,live){z=Math.max(.5,Math.min(4,z));if(Math.abs(z-S.zoom)<.001)return;const sc=$('#nbScroll'),r=sc.getBoundingClientRect(),f=z/S.zoom;
  const ox=sc.scrollLeft+(cx-r.left),oy=sc.scrollTop+(cy-r.top);S.zoom=z;
  const wrap=$('#nbPages'),w=dispW(),s=w/PW;wrap.style.setProperty('--s',s);wrap.style.width=w+'px';
  $$('.nb-page',wrap).forEach(el=>{const p=pageOf(el),h=Math.round(HH(p)*s);el.style.width=w+'px';el.style.height=h+'px';['.nb-ink','.nb-paper'].forEach(q=>{const c=el.querySelector(q);c.style.width=w+'px';c.style.height=h+'px'});
    el.querySelectorAll('img[data-iid]').forEach(im=>{const m=p.imgs.find(z2=>z2.id===im.dataset.iid);if(m){im.style.left=m.x*s+'px';im.style.top=m.y*s+'px';im.style.width=m.w*s+'px';im.style.height=m.h*s+'px'}});
    el.querySelectorAll('.nb-txt').forEach(tn=>{const t=p.texts.find(z2=>z2.id===tn.dataset.tid);if(t){tn.style.left=t.x*s+'px';tn.style.top=t.y*s+'px';tn.style.width=t.w*s+'px';tn.style.fontSize=t.size*s+'px'}});el._dirty=true});
  sc.scrollLeft=ox*f-(cx-r.left);sc.scrollTop=oy*f-(cy-r.top);$('#nbZ').textContent=Math.round(z*100)+'%';
  clearTimeout(zoomAt.t);zoomAt.t=setTimeout(()=>paintVisible(true),live?160:0)}

/* ---------- rendering a whole page (export, thumbnails) ---------- */
async function renderPageCanvas(p,b,width){const k=width/PW,c=document.createElement('canvas');c.width=width;c.height=Math.round(HH(p)*k);const ctx=c.getContext('2d');
  paintPaper(ctx,p.bg?'blank':(p.tpl||b.paper.style),b.paper.bg,c.width,c.height,k,new Date(p.u||Date.now()).toLocaleDateString());
  if(p.bg){const im=await loadImg(p.bg);if(im)ctx.drawImage(im,0,0,c.width,c.height)}
  await drawImgs(ctx,p,k);ctx.save();ctx.scale(k,k);drawAll(ctx,p);drawTexts(ctx,p,b);ctx.restore();return c}

/* ---------- PDF writer: one JPEG per page, no libraries ---------- */
async function buildPDF(pages,b,onStep){
  const enc=new TextEncoder(),parts=[],offs=[];let len=0;const push=x=>{const u=typeof x==='string'?enc.encode(x):x;parts.push(u);len+=u.length};
  push('%PDF-1.4\n');const obj=(n,body)=>{offs[n]=len;push(`${n} 0 obj\n`);body();push('\nendobj\n')};
  const N=pages.length,kids=[];for(let i=0;i<N;i++)kids.push(`${3+i*3} 0 R`);
  for(let i=0;i<N;i++){onStep&&onStep(i);const p=pages[i],c=await renderPageCanvas(p,b,1654);const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.88));const jpg=new Uint8Array(await blob.arrayBuffer());
    const wPt=595.28,hPt=+(wPt*c.height/c.width).toFixed(2),pn=3+i*3,cn=pn+1,im=pn+2,cs=`q ${wPt} 0 0 ${hPt} 0 0 cm /Im0 Do Q`;
    obj(pn,()=>push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${wPt} ${hPt}] /Resources << /XObject << /Im0 ${im} 0 R >> >> /Contents ${cn} 0 R >>`));
    obj(cn,()=>{push(`<< /Length ${cs.length} >>\nstream\n`);push(cs);push('\nendstream')});
    obj(im,()=>{push(`<< /Type /XObject /Subtype /Image /Width ${c.width} /Height ${c.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);push(jpg);push('\nendstream')})}
  obj(1,()=>push(`<< /Type /Catalog /Pages 2 0 R >>`));obj(2,()=>push(`<< /Type /Pages /Count ${N} /Kids [${kids.join(' ')}] >>`));
  const total=3+N*3,xref=len;let x=`xref\n0 ${total}\n0000000000 65535 f \n`;for(let n=1;n<total;n++)x+=String(offs[n]).padStart(10,'0')+' 00000 n \n';
  push(x+`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(parts,{type:'application/pdf'})}
async function sendFile(blob,name,title){const f=new File([blob],name,{type:blob.type});
  if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],title});return true}catch(e){if(e&&e.name==='AbortError')return false}}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000);return true}
async function exportPDF(which){await flushAll();const pages=which==='page'?[S.pages[S.cur]]:S.pages;
  try{const blob=await buildPDF(pages,S.book,i=>progress(`Making PDF… page ${i+1} of ${pages.length}`));progress('');
    await sendFile(blob,`${fname(S.book.title)}${which==='page'?` p${S.cur+1}`:''}.pdf`,S.book.title)}catch(e){progress('');say('Couldn’t make the PDF: '+(e.message||e))}}
async function sharePage(){const p=S.pages[S.cur],c=await renderPageCanvas(p,S.book,1600);const blob=await new Promise(r=>c.toBlob(r,'image/png'));sendFile(blob,`${fname(S.book.title)} p${S.cur+1}.png`,S.book.title)}
async function printBook(){progress('Preparing pages…');const box=document.createElement('div');box.id='nbPrint';
  for(const p of S.pages){const c=await renderPageCanvas(p,S.book,1240);const im=new Image();im.src=c.toDataURL('image/jpeg',.9);box.appendChild(im)}progress('');
  document.body.appendChild(box);document.documentElement.classList.add('nb-printing');const done=()=>{document.documentElement.classList.remove('nb-printing');box.remove();removeEventListener('afterprint',done)};
  addEventListener('afterprint',done);setTimeout(()=>{window.print();setTimeout(()=>{if(document.getElementById('nbPrint'))done()},60000)},300)}

/* ---------- menus ---------- */
function shareMenu(){const n=S.pages.length;modal(`${mhead('Export &amp; <em>share</em>')}
  <div class="nb-big">
    <button data-nb="pdfall"><span class="nb-bi">${svg('pdf')}</span><span><b>Share as PDF</b><small>All ${n} page${n===1?'':'s'} · Canvas, Mail, Files, Drive, Notability</small></span></button>
    <button data-nb="pdfpage"><span class="nb-bi">${svg('pdf')}</span><span><b>This page as PDF</b><small>Page ${S.cur+1} only</small></span></button>
    <button data-nb="exppng"><span class="nb-bi">${svg('img')}</span><span><b>This page as an image</b><small>PNG for messages and slides</small></span></button>
    <button data-nb="print"><span class="nb-bi">${svg('print')}</span><span><b>Print</b><small>Or “Save as PDF” from the print screen</small></span></button>
  </div><p class="nb-note">Handing in on Canvas: <b>Share as PDF</b> → <b>Canvas Student</b> → pick the course and assignment → Submit.</p>`)}
function moreMenu(){modal(`${mhead(esc(S.book.title))}
  <div class="nb-list">
    <button data-nb="pages" class="nb-phone">${svg('pages')}<span><b>All pages</b><small>Reorder, duplicate or delete</small></span></button>
    <button data-nb="addpage">${svg('plus')}<span><b>Add a page</b><small>After page ${S.cur+1}, from any template</small></span></button>
    <button data-nb="insertpdf">${svg('pdf')}<span><b>Insert PDF pages</b><small>After page ${S.cur+1}, then write on them</small></span></button>
    <button data-nb="pagetpl">${svg('pages')}<span><b>This page’s template</b><small>${esc(TPL[pageTpl(S.pages[S.cur])]||'Blank')}</small></span></button>
    <button data-nb="bookset">${svg('book')}<span><b>Cover, paper &amp; name</b><small>${esc(BGS[S.book.paper.bg][2])} paper</small></span></button>
    <button data-nb="night" aria-pressed="${S.night}">${svg('moon')}<span><b>Dark pages</b><small>${S.night?'On':'Off'} · exports stay normal</small></span><i class="nb-tg"></i></button>
    <button data-nb="pencil" aria-pressed="${S.pencilOnly}">${svg('pencil')}<span><b>Pencil only</b><small>${S.pencilOnly?'Fingers scroll, Pencil writes':'Fingers write; two fingers scroll'}</small></span><i class="nb-tg"></i></button>
  </div>`)}
async function pagesMenu(){const m=modal(`${mhead('<em>Pages</em>')}
  <div class="nb-pgrid">${S.pages.map((p,i)=>`<div class="nb-pg${i===S.cur?' on':''}"><button class="nb-pgt" data-goto="${i}" aria-label="Go to page ${i+1}"><canvas data-pth="${i}" width="160" height="${Math.round(160*HH(p)/PW)}"></canvas></button>
    <div class="nb-pgb"><b>${i+1}</b><span></span><button data-pmv="${i}|-1" aria-label="Move earlier" ${i?'':'disabled'}>${svg('up')}</button><button data-pmv="${i}|1" aria-label="Move later" ${i<S.pages.length-1?'':'disabled'}>${svg('down')}</button><button data-pdup="${i}" aria-label="Duplicate">${svg('copy')}</button><button data-pdel="${i}" aria-label="Delete page">${svg('trash')}</button></div></div>`).join('')}
  <button class="nb-pg nb-pgadd" data-nb="addpage"><span>${svg('plus')}</span><b>Add page</b></button></div>`,'wide');
  for(const[i,p]of S.pages.entries()){const c=$(`canvas[data-pth="${i}"]`,m);if(c)renderPageCanvas(p,S.book,c.width).then(img=>c.getContext('2d').drawImage(img,0,0))}}
function tplMenu(forAdd){const cur=forAdd?S.book.paper.style:pageTpl(S.pages[S.cur]);const m=modal(`${mhead(forAdd?'Add a <em>page</em>':'Page <em>template</em>')}${tplPicker(cur,S.book.paper.bg,forAdd?'addtpl':'settpl')}`,'wide');paintTplPreviews(m)}
function goPage(i){const el=$$('.nb-page',V)[i];el?.scrollIntoView({behavior:'smooth',block:'start'})}
async function addPage(tpl){const pg={id:uid(),book:S.book.id,strokes:[],texts:[],imgs:[],tpl:tpl||S.book.paper.style,u:Date.now()};S.pages.splice(S.cur+1,0,pg);S.book.pages=S.pages.map(p=>p.id);await IDB.put('pages',pg);touch(pg);layout();setTimeout(()=>goPage(S.pages.indexOf(pg)),60)}

/* ---------- clicks ---------- */
document.addEventListener('click',async e=>{
  if(!V||V.hidden)return;
  if(!e.target.closest('.nb-pop,[data-nb="pop"],[data-tool]'))closePop();
  if(e.target.classList&&e.target.classList.contains('nb-modal')){closeModal(e.target);return}
  const t=e.target.closest('[data-nb],[data-tool],[data-open],[data-menu],[data-cv],[data-tp],[data-bg],[data-pi],[data-shk],[data-tsz],[data-tbold],[data-goto],[data-pmv],[data-pdup],[data-pdel],[data-addtpl],[data-settpl]');if(!t||!V.contains(t))return;
  const d=t.dataset,m=t.closest('.nb-modal');
  if(d.cv&&m){m._b.color=d.cv;$$('[data-cv]',m).forEach(x=>x.setAttribute('aria-pressed',String(x===t)));return}
  if(d.tp&&m){m._b.paper.style=d.tp;$$('[data-tp]',m).forEach(x=>x.setAttribute('aria-pressed',String(x===t)));return}
  if(d.bg&&m){m._b.paper.bg=d.bg;$$('[data-bg]',m).forEach(x=>x.setAttribute('aria-pressed',String(x===t)));$$('canvas[data-tplprev]',m).forEach(c=>c.dataset.pbg=d.bg);paintTplPreviews(m);return}
  if(d.addtpl){closeModal(m);addPage(d.addtpl);return}
  if(d.settpl){const p=S.pages[S.cur];p.tpl=d.settpl;delete p.bg;delete p.h;touch(p);closeModal(m);layout();return}
  if(d.menu){e.stopPropagation();const b=S.books.find(x=>x.id===d.menu);if(b)bookForm(b);return}
  if(d.open){openBook(d.open);return}
  if(d.goto!==undefined){closeModal(m);goPage(+d.goto);return}
  if(d.pmv){const[i,dir]=d.pmv.split('|').map(Number),j=i+dir;if(j<0||j>=S.pages.length)return;[S.pages[i],S.pages[j]]=[S.pages[j],S.pages[i]];S.book.pages=S.pages.map(p=>p.id);S.book.u=Date.now();await IDB.put('books',S.book);changed();m.remove();layout();pagesMenu();return}
  if(d.pdup){const src=S.pages[+d.pdup],pg={...strip(src),id:uid(),u:Date.now()};S.pages.splice(+d.pdup+1,0,pg);S.book.pages=S.pages.map(p=>p.id);await IDB.put('pages',pg);touch(pg);m.remove();layout();pagesMenu();return}
  if(d.pdel){if(S.pages.length<2){say('A notebook needs at least one page');return}if(!t.dataset.armed){t.dataset.armed=1;t.classList.add('armed');say('Tap delete again to remove that page');setTimeout(()=>{delete t.dataset.armed;t.classList.remove('armed')},2500);return}
    const p=S.pages.splice(+d.pdel,1)[0];S.book.pages=S.pages.map(x=>x.id);await IDB.del('pages',p.id);S.book.u=Date.now();await IDB.put('books',S.book);changed();m.remove();layout();pagesMenu();return}
  if(d.tool){if(S.tool===d.tool&&['pen','hl','eraser','shape','text'].includes(d.tool)){popover($('[data-nb="pop"]',V));return}
    S.tool=d.tool;clearSel();tools();$$('.nb-txt',V).forEach(x=>x.contentEditable=String(S.tool==='text'));if(S.tool==='text')say('Tap the page to type');return}
  if(d.pi!==undefined){const c=S.cfg[S.tool];c.i=+d.pi;c.c=null;savePrefs();tools();popover($('[data-nb="pop"]',V));return}
  if(d.shk){S.cfg.shape.k=d.shk;savePrefs();popover($('[data-nb="pop"]',V));return}
  if(d.tsz){S.cfg.text.size=+d.tsz;savePrefs();popover($('[data-nb="pop"]',V));return}
  if(d.tbold){S.cfg.text.bold=!S.cfg.text.bold;savePrefs();popover($('[data-nb="pop"]',V));return}
  switch(d.nb){
    case'close':hide();return;
    case'lib':await flushAll();if(S.direct){S.direct=false;hide();return}library();return;
    case'new':bookForm();return;
    case'importpdf':{const inp=$('#nbPdf',V);inp.value='';inp.onchange=()=>importPdfAsBook(inp.files&&inp.files[0]);inp.click();return}
    case'insertpdf':{closeModal(m);const inp=$('#nbPdf2',V);inp.value='';inp.onchange=()=>insertPdfPages(inp.files&&inp.files[0]);inp.click();return}
    case'cancel':closeModal(m);return;
    case'createbook':createBook(m);return;
    case'savebook':{const b=await IDB.get('books',m._edit.id);Object.assign(b,{title:$('#nbT',m).value.trim()||b.title,color:m._b.color,paper:m._b.paper,u:Date.now()});await IDB.put('books',b);changed();closeModal(m);if(S.book&&S.book.id===b.id){S.book=b;$('.nb-title',V).textContent=b.title;tools();layout()}else library();return}
    case'delbook':{if(!t.dataset.armed){t.dataset.armed=1;t.innerHTML=`${svg('trash')}Tap again to delete`;setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.innerHTML=`${svg('trash')}Delete`}},3000);return}
      const b=m._edit;for(const pid of b.pages)await IDB.del('pages',pid);await IDB.del('books',b.id);closeModal(m);changed({deleted:b.id});library();return}
    case'bookset':closeModal(m);bookForm(S.book);return;
    case'undo':undoRedo(S.undo,S.redo);return;
    case'redo':undoRedo(S.redo,S.undo);return;
    case'pop':popover(t);return;
    case'more':moreMenu();return;
    case'share':shareMenu();return;
    case'pages':closeModal(m);pagesMenu();return;
    case'pagetpl':closeModal(m);tplMenu(false);return;
    case'addpage':closeModal(m);tplMenu(true);return;
    case'night':S.night=!S.night;savePrefs();V.classList.toggle('night',S.night);t.setAttribute('aria-pressed',String(S.night));const sm=t.querySelector('small');if(sm)sm.textContent=`${S.night?'On':'Off'} · exports stay normal`;return;
    case'zin':zoomAt(S.zoom*1.25,innerWidth/2,innerHeight/2);return;
    case'zout':zoomAt(S.zoom/1.25,innerWidth/2,innerHeight/2);return;
    case'pencil':{S.pencilOnly=!S.pencilOnly;savePrefs();t.setAttribute('aria-pressed',String(S.pencilOnly));const sm2=t.querySelector('small');if(sm2)sm2.textContent=S.pencilOnly?'Fingers scroll, Pencil writes':'Fingers write; two fingers scroll';return}
    case'img':{const inp=$('#nbImg',V);inp.value='';inp.onchange=()=>insertImage(inp.files&&inp.files[0]);inp.click();return}
    case'clearpage':{const p=S.pages[S.cur];if(!p.strokes.length&&!p.texts.length&&!p.imgs.length)return;snap(p);p.strokes=[];p.texts=[];p.imgs=[];touch(p);repaint(p.id);closePop();say('Page cleared · Undo brings it back');return}
    case'pdfall':closeModal(m);exportPDF('all');return;
    case'pdfpage':closeModal(m);exportPDF('page');return;
    case'exppng':closeModal(m);sharePage();return;
    case'print':closeModal(m);printBook();return;
    case'seldel':case'seldup':case'selcol':selAction(d.nb);return;
    case'selcard':{const p=S.pages.find(x=>x.id===S.sel.pid),b=S.sel.box,full=await renderPageCanvas(p,S.book,1400),k=1400/PW;
      const x0=Math.max(0,b[0]*k),y0=Math.max(0,b[1]*k),w=Math.min(full.width-x0,(b[2]-b[0])*k),h=Math.min(full.height-y0,(b[3]-b[1])*k),sc=Math.min(1,700/w),c=document.createElement('canvas');c.width=Math.round(w*sc);c.height=Math.round(h*sc);
      c.getContext('2d').drawImage(full,x0,y0,w,h,0,0,c.width,c.height);const text=S.sel.texts.map(id=>(p.texts.find(t=>t.id===id)||{}).txt||'').join(' ').trim();
      await flushAll();window.dispatchEvent(new CustomEvent('life-make-card',{detail:{img:c.toDataURL('image/jpeg',.78),deck:S.book.title,text}}));return}
  }
});
document.addEventListener('input',e=>{
  if(e.target.id==='nbQ'){S.q=e.target.value;clearTimeout(S.qt);S.qt=setTimeout(()=>{const pos=e.target.selectionStart;library().then(()=>{const q=$('#nbQ');if(q){q.focus();q.setSelectionRange(pos,pos)}})},250)}
  if(e.target.id==='nbCustom'){S.cfg[S.tool].c=e.target.value;savePrefs();tools()}
  if(e.target.dataset&&e.target.dataset.pk){const k=e.target.dataset.pk;S.cfg[S.tool][k]=+e.target.value;savePrefs();const v=$('#nbSzV',V);if(v)v.textContent=(+e.target.value).toFixed(1);
    const sw=$('.nb-swatch i',V);if(sw)sw.style.setProperty('--sz',Math.max(6,Math.min(18,(+e.target.value)*(S.tool==='hl'||S.tool==='eraser'?.5:2.2)))+'px')}});
document.addEventListener('keydown',e=>{if(!V||V.hidden)return;const inField=e.target.closest&&e.target.closest('.nb-txt,input,textarea');
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'&&!inField){e.preventDefault();e.shiftKey?undoRedo(S.redo,S.undo):undoRedo(S.undo,S.redo)}
  if(e.key==='Escape'){const m=$('.nb-modal',V);if(m)closeModal(m);else if($('.nb-pop',V))closePop();else if(S.sel)clearSel()}
  if((e.key==='Backspace'||e.key==='Delete')&&S.sel&&!inField){e.preventDefault();selAction('seldel')}
  if(!inField&&!e.metaKey&&!e.ctrlKey&&S.book&&!$('.nb-modal',V)){const k={p:'pen',h:'hl',e:'eraser',l:'lasso',s:'shape',t:'text'}[e.key];if(k){S.tool=k;clearSel();tools()}}});
addEventListener('resize',()=>{if(V&&!V.hidden&&S.book){clearTimeout(S.rt);S.rt=setTimeout(()=>layout(),150)}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)flushAll()});

/* ---------- public ---------- */
window.NOTES={
  async open(bookId){show();S.direct=!!bookId;if(bookId)await openBook(bookId);else await library()},
  close:hide,
  async exportAll(){return{books:await IDB.all('books'),pages:(await IDB.all('pages')).map(strip)}},
  async importAll(d,replace){if(!d||!Array.isArray(d.books))return 0;if(replace){for(const b of await IDB.all('books'))await IDB.rawDel('books',b.id);for(const p of await IDB.all('pages'))await IDB.rawDel('pages',p.id)}
    for(const p of d.pages||[])await IDB.put('pages',p);for(const b of d.books)await IDB.put('books',b);return d.books.length},
  async summary(){const b=await IDB.all('books');return b.sort((x,y)=>(y.u||0)-(x.u||0)).map(x=>({id:x.id,title:x.title,color:x.color,pages:x.pages.length,u:x.u}))},
  IDB,_S:S,
  refresh(){if(!V||V.hidden)return;if(!S.book)library()},
  openBookId(){return V&&!V.hidden&&S.book?S.book.id:null},
  _buildPDF:(pages,b)=>buildPDF(pages,b)
};
})();
