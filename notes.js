/* ===================== Life · Notebooks =====================
   Handwritten + typed notebooks for iPad / iPhone / laptop.
   Pages are stored in this device's IndexedDB (and in your backups / server sync).
   Page coordinates are fixed (1000 × 1414, A4 ratio) so ink stays put at any zoom. */
(function(){
'use strict';
const PW=1000,PH=1414;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const say=m=>{try{window.toast?toast(m):0}catch(e){}};
const agoS=t=>{try{return window.ago?ago(t):''}catch(e){return''}};

/* ---------- storage ---------- */
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

/* deletions are remembered so other devices delete them too */
function tombNote(store,id){try{const k='ishiros.nbtomb',t=JSON.parse(localStorage.getItem(k)||'{}');t[store+':'+id]=Date.now();localStorage.setItem(k,JSON.stringify(t))}catch(e){}}
/* ---------- look ---------- */
const PAPERS={blank:'Blank',lined:'Lined',grid:'Grid',dots:'Dots'};
const BGS={white:['#FCFBF8','#1D1C1A'],cream:['#F5EFE1','#1D1C1A'],dark:['#1E1D1B','#F2EDE3'],sage:['#E6EEE7','#1D1C1A']};
const COVERS=['#F06D44','#4E6A5A','#3E6FD0','#8C5CE0','#D18A12','#C9466A','#2B2A26'];
const INK_L=['#1D1C1A','#2F5BD8','#D9372B','#1F8A4C','#8E44D6','#F06D44'];
const INK_D=['#F2EDE3','#7FB2FF','#FF7A6B','#7FD9A0','#C49BFF','#FFB07A'];
const HLS=['#FFE14D','#7CF0A0','#7FD3FF','#FF9AD5','#FFB36B'];
const SIZES={pen:[2.2,3.6,6.5],hl:[16,26,38],eraser:[10,22,40]};
const I={
  back:'<path d="M15 5l-7 7 7 7"/>',undo:'<path d="M9 7L4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 12h-2" transform="translate(0 -6)"/>',
  redo:'<path d="M15 7l5 5-5 5"/><path d="M20 12H10a6 6 0 0 0 0 12h2" transform="translate(0 -6)"/>',
  pen:'<path d="M15.5 4.5l4 4L9 19l-5 1 1-5z"/><path d="M13.5 6.5l4 4"/>',hl:'<path d="M14 4l6 6-8 8H6v-6z"/><path d="M4 21h8"/>',
  eraser:'<path d="M8 20h12"/><path d="M4.5 15.5l9-9a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L11 19H8z"/>',
  lasso:'<path d="M7 17c-2.5-1-4-3-4-5.5C3 7.4 7 4 12 4s9 3.4 9 7.5S17 19 12 19c-1.4 0-2.6-.2-3.7-.6"/><path d="M8 17c0 2-1 3-2.5 3.5"/>',
  text:'<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',img:'<rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M20.5 16l-5-5-8 8"/>',
  more:'<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',plus:'<path d="M12 5v14M5 12h14"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',zin:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2M8 11h6M11 8v6"/>',zout:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2M8 11h6"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',trash:'<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  pencil:'<path d="M4 20l3-1 11-11-2-2L5 17z"/><path d="M14 6l2 2"/>',book:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>'
};
const svg=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${I[k]||''}</svg>`;

/* ---------- state ---------- */
const S={books:[],book:null,pages:[],tool:'pen',ink:{pen:0,hl:0},sz:{pen:1,hl:1,eraser:1},zoom:1,pencilOnly:false,undo:[],redo:[],sel:null,q:'',cur:0};
function inkColor(t){const dark=S.book&&S.book.paper.bg==='dark';return t==='hl'?HLS[S.ink.hl%HLS.length]:(S.customInk||(dark?INK_D:INK_L)[S.ink.pen%INK_L.length])}
try{const p=JSON.parse(localStorage.getItem('ishiros.notes.prefs')||'{}');Object.assign(S,{pencilOnly:!!p.pencilOnly,ink:p.ink||S.ink,sz:p.sz||S.sz})}catch(e){}
const savePrefs=()=>{try{localStorage.setItem('ishiros.notes.prefs',JSON.stringify({pencilOnly:S.pencilOnly,ink:S.ink,sz:S.sz}))}catch(e){}};

/* ---------- drawing ---------- */
function outline(st){
  const pts=st.p,pr=st.pr;
  return PF.getStroke(pts,{size:st.w,thinning:st.t==='hl'?0:(pr?.62:.5),smoothing:.55,streamline:st.t==='hl'?.6:.42,simulatePressure:!pr,last:true,start:{cap:true},end:{cap:true}})}
function fillOutline(ctx,o){if(o.length<2)return;ctx.beginPath();ctx.moveTo(o[0][0],o[0][1]);
  for(let i=1;i<o.length;i++){const a=o[i],b=o[(i+1)%o.length];ctx.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}ctx.closePath();ctx.fill()}
function drawStroke(ctx,st){if(!st._o)st._o=outline(st);ctx.globalAlpha=st.t==='hl'?.38:1;ctx.fillStyle=st.c;fillOutline(ctx,st._o);ctx.globalAlpha=1}
function paperPaint(ctx,paper,w,h,k){
  const [bg]=BGS[paper.bg]||BGS.white,line=paper.bg==='dark'?'rgba(242,237,227,.14)':'rgba(40,60,90,.16)';
  ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);ctx.strokeStyle=line;ctx.fillStyle=line;ctx.lineWidth=Math.max(1,1.2*k);
  const g=40*k;
  if(paper.style==='lined'){ctx.beginPath();for(let y=120*k;y<h-20*k;y+=g){ctx.moveTo(0,y);ctx.lineTo(w,y)}ctx.stroke();ctx.strokeStyle=paper.bg==='dark'?'rgba(255,120,110,.25)':'rgba(220,80,80,.3)';ctx.beginPath();ctx.moveTo(90*k,0);ctx.lineTo(90*k,h);ctx.stroke()}
  if(paper.style==='grid'){ctx.beginPath();for(let y=g;y<h;y+=g){ctx.moveTo(0,y);ctx.lineTo(w,y)}for(let x=g;x<w;x+=g){ctx.moveTo(x,0);ctx.lineTo(x,h)}ctx.stroke()}
  if(paper.style==='dots'){for(let y=g;y<h;y+=g)for(let x=g;x<w;x+=g){ctx.beginPath();ctx.arc(x,y,1.6*k,0,7);ctx.fill()}}
}
function paperCSS(paper){const [bg]=BGS[paper.bg]||BGS.white,line=paper.bg==='dark'?'rgba(242,237,227,.14)':'rgba(40,60,90,.16)';
  const u='calc(var(--s) * 40px)';
  const M=paper.bg==='dark'?'rgba(255,120,110,.25)':'rgba(220,80,80,.3)';
  if(paper.style==='lined')return`background-color:${bg};background-image:linear-gradient(90deg,transparent calc(var(--s) * 89px),${M} calc(var(--s) * 89px),${M} calc(var(--s) * 91px),transparent calc(var(--s) * 91px)),repeating-linear-gradient(transparent 0,transparent calc(var(--s) * 39px),${line} calc(var(--s) * 39px),${line} calc(var(--s) * 40px));background-position:0 0,0 calc(var(--s) * 81px);background-repeat:no-repeat;background-size:100% 100%,100% 100%`;
  if(paper.style==='grid')return`background:linear-gradient(${line} 1px,transparent 1px) 0 0/${u} ${u},linear-gradient(90deg,${line} 1px,transparent 1px) 0 0/${u} ${u},${bg}`;
  if(paper.style==='dots')return`background:radial-gradient(circle,${line} calc(var(--s) * 2.2px),transparent calc(var(--s) * 2.6px)) calc(var(--s) * -20px) calc(var(--s) * -20px)/${u} ${u},${bg}`;
  return`background:${bg}`}

/* ---------- view shell ---------- */
let V=null;
function shell(){
  if(V)return V;
  V=document.createElement('div');V.id='nbView';V.setAttribute('role','dialog');V.setAttribute('aria-label','Notebooks');document.body.appendChild(V);
  return V}
function show(){shell();V.hidden=false;requestAnimationFrame(()=>V.classList.add('on'));document.documentElement.classList.add('nb-open')}
function hide(){if(!V)return;flushAll();V.classList.remove('on');document.documentElement.classList.remove('nb-open');setTimeout(()=>{if(!V.classList.contains('on')){V.hidden=true;V.innerHTML=''}},320)}

/* ---------- library ---------- */
async function library(){
  S.book=null;S.pages=[];S.sel=null;
  S.books=(await IDB.all('books')).sort((a,b)=>(b.u||0)-(a.u||0));
  let texts={};if(S.q){const ps=await IDB.all('pages');ps.forEach(p=>{const t=(p.texts||[]).map(x=>x.txt).join(' ').toLowerCase();if(t)texts[p.book]=(texts[p.book]||'')+' '+t})}
  const q=S.q.toLowerCase(),list=S.books.filter(b=>!q||b.title.toLowerCase().includes(q)||(texts[b.id]||'').includes(q));
  V.innerHTML=`<div class="nb-lib">
    <div class="nb-top"><button class="nb-ib" data-nb="close" aria-label="Close notebooks">${svg('x')}</button><h2>Note<em>books</em></h2><button class="nb-pill" data-nb="new">${svg('plus')}New</button></div>
    <label class="nb-search">${svg('search')}<input id="nbQ" type="search" placeholder="Search notebooks and typed text" value="${esc(S.q)}"></label>
    <div class="nb-grid">${list.map(b=>`<div class="nb-card" data-open="${b.id}" role="button" tabindex="0">
      <div class="nb-cover" style="--cv:${esc(b.color)}"><canvas data-thumb="${b.id}" width="300" height="424"></canvas><span class="nb-spine"></span></div>
      <div class="nb-meta"><b>${esc(b.title)}</b><small>${b.pages.length} page${b.pages.length===1?'':'s'} · ${esc(agoS(b.u))}</small></div>
      <button class="nb-ib sm" data-menu="${b.id}" aria-label="Notebook options">${svg('more')}</button></div>`).join('')}
      ${!list.length?`<p class="nb-empty">${S.q?'Nothing matches that search.':'No notebooks yet. Make one for each class, project or idea dump.'}</p>`:''}</div>
    <p class="nb-foot">Notebooks live on this device and in your Life backups. With an Apple Pencil, fingers scroll and the Pencil writes.</p></div>`;
  list.forEach(b=>thumb(b));
}
async function thumb(b){const c=$(`canvas[data-thumb="${b.id}"]`,V);if(!c||!b.pages[0])return;const p=await IDB.get('pages',b.pages[0]);if(!p)return;const k=c.width/PW,ctx=c.getContext('2d');
  paperPaint(ctx,b.paper,c.width,c.height,k);await drawImgs(ctx,p,k);ctx.save();ctx.scale(k,k);(p.strokes||[]).filter(s=>s.t==='hl').forEach(s=>drawStroke(ctx,s));(p.strokes||[]).filter(s=>s.t!=='hl').forEach(s=>drawStroke(ctx,s));drawTexts(ctx,p,b);ctx.restore()}
function newBookForm(edit){
  const b=edit||{title:'',color:COVERS[0],paper:{style:'lined',bg:'white'}};
  const m=document.createElement('div');m.className='nb-modal';m.innerHTML=`<div class="nb-mcard"><h3>${edit?'Notebook <em>settings</em>':'New <em>notebook</em>'}</h3>
    <label class="nb-fld"><span>Name</span><input id="nbT" value="${esc(b.title)}" placeholder="e.g. ISE 4404 · Optimization"></label>
    <div class="nb-cap">Cover</div><div class="nb-sw">${COVERS.map(c=>`<button data-cv="${c}" style="--c:${c}" aria-pressed="${c===b.color}"></button>`).join('')}</div>
    <div class="nb-cap">Paper</div><div class="nb-seg" id="nbSt">${Object.entries(PAPERS).map(([k,l])=>`<button data-st="${k}" aria-pressed="${k===b.paper.style}">${l}</button>`).join('')}</div>
    <div class="nb-seg" id="nbBg" style="margin-top:8px">${Object.keys(BGS).map(k=>`<button data-bg="${k}" aria-pressed="${k===b.paper.bg}"><i style="background:${BGS[k][0]}"></i>${k[0].toUpperCase()+k.slice(1)}</button>`).join('')}</div>
    <div class="nb-acts">${edit?`<button class="nb-btn danger" data-nb="delbook">Delete</button>`:'<span></span>'}<button class="nb-btn" data-nb="cancel">Cancel</button><button class="nb-btn primary" data-nb="${edit?'savebook':'createbook'}">${edit?'Save':'Create'}</button></div></div>`;
  m._b=JSON.parse(JSON.stringify(b));m._edit=edit||null;V.appendChild(m);requestAnimationFrame(()=>m.classList.add('on'));setTimeout(()=>{const t=$('#nbT',m);if(t&&!edit)t.focus()},250);
}
async function createBook(m){const b=m._b;b.title=($('#nbT',m).value.trim()||'Untitled');const pg={id:uid(),book:'',strokes:[],texts:[],imgs:[],u:Date.now()};
  const book={id:uid(),title:b.title,color:b.color,paper:b.paper,pages:[pg.id],created:Date.now(),u:Date.now()};pg.book=book.id;
  await IDB.put('pages',pg);await IDB.put('books',book);m.remove();openBook(book.id)}

/* ---------- notebook ---------- */
async function openBook(id){
  const b=await IDB.get('books',id);if(!b)return library();S.book=b;S.undo=[];S.redo=[];S.sel=null;S.zoom=1;S.tool=S.tool==='text'||S.tool==='lasso'?'pen':S.tool;
  S.pages=(await Promise.all(b.pages.map(p=>IDB.get('pages',p)))).filter(Boolean);
  if(!S.pages.length){const pg={id:uid(),book:b.id,strokes:[],texts:[],imgs:[],u:Date.now()};S.pages=[pg];b.pages=[pg.id];IDB.put('pages',pg);IDB.put('books',b)}
  V.innerHTML=`<div class="nb-ed">
    <div class="nb-bar">
      <div class="nb-row">
        <button class="nb-ib" data-nb="lib" aria-label="All notebooks">${svg('back')}</button>
        <button class="nb-title" data-nb="bookset">${esc(b.title)}</button>
        <span class="nb-flex"></span>
        <button class="nb-ib" data-nb="undo" aria-label="Undo">${svg('undo')}</button><button class="nb-ib" data-nb="redo" aria-label="Redo">${svg('redo')}</button>
        <button class="nb-ib" data-nb="more" aria-label="More">${svg('more')}</button>
      </div>
      <div class="nb-row nb-tools" id="nbTools"></div>
    </div>
    <div class="nb-scroll" id="nbScroll"><div class="nb-pages" id="nbPages"></div></div>
    <div class="nb-zoom"><button class="nb-ib sm" data-nb="zout" aria-label="Zoom out">${svg('zout')}</button><b id="nbZ">100%</b><button class="nb-ib sm" data-nb="zin" aria-label="Zoom in">${svg('zin')}</button></div>
    <input type="file" id="nbImg" accept="image/*" hidden>
  </div>`;
  tools();layout();bindScroll();
}
function tools(){
  const t=S.tool,el=$('#nbTools');if(!el)return;
  const tb=(k,l)=>`<button class="nb-tool${t===k?' on':''}" data-tool="${k}" aria-label="${l}" aria-pressed="${t===k}">${svg(k)}</button>`;
  const dark=S.book.paper.bg==='dark',pal=t==='hl'?HLS:(dark?INK_D:INK_L),cur=t==='hl'?S.ink.hl:S.ink.pen;
  const sizes=SIZES[t]||null,si=S.sz[t]||0;
  el.innerHTML=`${tb('pen','Pen')}${tb('hl','Highlighter')}${tb('eraser','Eraser')}${tb('lasso','Lasso select')}${tb('text','Text')}<button class="nb-tool" data-nb="img" aria-label="Insert image">${svg('img')}</button>
    <span class="nb-sep"></span>
    ${t==='pen'||t==='hl'||t==='text'?`<span class="nb-cols">${pal.map((c,i)=>`<button class="nb-col${i===cur&&!(t!=='hl'&&S.customInk)?' on':''}" data-ink="${i}" style="--c:${c}" aria-label="Colour ${i+1}"></button>`).join('')}${t!=='hl'?`<label class="nb-col nb-custom${S.customInk?' on':''}" style="--c:${S.customInk||'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)'}" aria-label="Custom colour"><input type="color" id="nbCustom" value="${S.customInk||'#1D1C1A'}"></label>`:''}</span>`:''}
    ${sizes?`<span class="nb-sep"></span><span class="nb-szs">${sizes.map((w,i)=>`<button class="nb-sz${i===si?' on':''}" data-sz="${i}" aria-label="Size ${i+1}"><i style="width:${Math.min(22,4+i*6)}px;height:${Math.min(22,4+i*6)}px"></i></button>`).join('')}</span>`:''}
    <span class="nb-flex"></span><button class="nb-tool${S.pencilOnly?' on':''}" data-nb="pencil" aria-pressed="${S.pencilOnly}" aria-label="Write with Apple Pencil only">${svg('pencil')}<small>Pencil only</small></button>`;
  V.classList.toggle('t-text',t==='text');V.classList.toggle('t-lasso',t==='lasso');
}
/* page size on screen */
function dispW(){const sc=$('#nbScroll');const avail=(sc?sc.clientWidth:innerWidth)-24;return Math.round(Math.min(avail,880)*S.zoom)}
function layout(keepAnchor){
  const wrap=$('#nbPages');if(!wrap)return;const w=dispW(),s=w/PW,h=Math.round(PH*s);
  wrap.style.setProperty('--s',s);wrap.style.width=w+'px';
  const have=new Map($$('.nb-page',wrap).map(el=>[el.dataset.pid,el]));
  S.pages.forEach((p,i)=>{let el=have.get(p.id);
    if(!el){el=document.createElement('div');el.className='nb-page';el.dataset.pid=p.id;el.innerHTML=`<div class="nb-imgs"></div><canvas class="nb-ink"></canvas><div class="nb-txts"></div><span class="nb-no">${i+1}</span>`;}
    el.style.cssText=`width:${w}px;height:${h}px;${paperCSS(S.book.paper)}`;el.querySelector('.nb-no').textContent=i+1;wrap.appendChild(el);el._dirty=true;have.delete(p.id)});
  have.forEach(el=>el.remove());
  $('#nbZ').textContent=Math.round(S.zoom*100)+'%';
  paintVisible(true);
}
let paintT=0;
function paintVisible(force){cancelAnimationFrame(paintT);paintT=requestAnimationFrame(()=>{const sc=$('#nbScroll');if(!sc)return;const r=sc.getBoundingClientRect();
  $$('.nb-page',sc).forEach(el=>{const b=el.getBoundingClientRect();const vis=b.bottom>r.top-400&&b.top<r.bottom+400;if(vis&&(el._dirty||force&&el._w!==b.width))paintPage(el)});
  /* which page is in view */
  let best=0,bv=-1;$$('.nb-page',sc).forEach((el,i)=>{const b=el.getBoundingClientRect(),v=Math.min(b.bottom,r.bottom)-Math.max(b.top,r.top);if(v>bv){bv=v;best=i}});S.cur=best})}
function pageOf(el){return S.pages.find(p=>p.id===el.dataset.pid)}
function paintPage(el){
  const p=pageOf(el);if(!p)return;const w=el.clientWidth,h=el.clientHeight,s=w/PW;
  const dpr=Math.min(2.5,devicePixelRatio||1),maxPx=4096,k=Math.min(dpr,maxPx/w);
  const c=el.querySelector('.nb-ink');c.width=Math.round(w*k);c.height=Math.round(h*k);c.style.width=w+'px';c.style.height=h+'px';
  const ctx=c.getContext('2d');ctx.setTransform(k*s,0,0,k*s,0,0);ctx.clearRect(0,0,PW,PH);
  (p.strokes||[]).forEach(st=>{if(st.t==='hl')drawStroke(ctx,st)});(p.strokes||[]).forEach(st=>{if(st.t!=='hl')drawStroke(ctx,st)});
  el._dirty=false;el._w=w;
  /* images and text boxes are real elements so they stay sharp and editable */
  el.querySelector('.nb-imgs').innerHTML=(p.imgs||[]).map(m=>`<img data-iid="${m.id}" src="${m.src}" style="left:${m.x*s}px;top:${m.y*s}px;width:${m.w*s}px;height:${m.h*s}px" alt="" draggable="false">`).join('');
  const ink=BGS[S.book.paper.bg][1];
  el.querySelector('.nb-txts').innerHTML=(p.texts||[]).map(t=>`<div class="nb-txt" data-tid="${t.id}" contenteditable="${S.tool==='text'?'true':'false'}" spellcheck="true" style="left:${t.x*s}px;top:${t.y*s}px;width:${t.w*s}px;font-size:${t.size*s}px;color:${esc(t.c||ink)}">${esc(t.txt)}</div>`).join('');
  if(S.sel&&S.sel.pid===p.id)drawSel(el);
}
function repaint(pid){const el=$(`.nb-page[data-pid="${pid}"]`,V);if(el)paintPage(el)}

/* ---------- saving ---------- */
const dirty=new Set();let saveT=0;
function touch(p){p.u=Date.now();dirty.add(p.id);clearTimeout(saveT);saveT=setTimeout(flushAll,500)}
async function flushAll(){clearTimeout(saveT);if(!S.book)return;const ids=[...dirty];dirty.clear();
  for(const id of ids){const p=S.pages.find(x=>x.id===id);if(p)await IDB.put('pages',strip(p))}
  if(ids.length){S.book.u=Date.now();await IDB.put('books',S.book);window.dispatchEvent(new CustomEvent('life-notes-changed'))}}
const strip=p=>({...p,strokes:(p.strokes||[]).map(({_o,...st})=>st)});

/* ---------- undo ---------- */
function snap(p){S.undo.push({pid:p.id,s:[...(p.strokes||[])],t:[...(p.texts||[])],i:[...(p.imgs||[])]});if(S.undo.length>80)S.undo.shift();S.redo=[]}
function undoRedo(from,to){const u=from.pop();if(!u)return;const p=S.pages.find(x=>x.id===u.pid);if(!p)return;
  to.push({pid:p.id,s:[...p.strokes],t:[...p.texts],i:[...p.imgs]});p.strokes=u.s;p.texts=u.t;p.imgs=u.i;S.sel=null;touch(p);repaint(p.id)}

/* ---------- input: pen, fingers, pinch ---------- */
const ptrs=new Map();let act=null,pinch=null,mom=0;
function toPage(el,e){const r=el.getBoundingClientRect(),s=r.width/PW;return[(e.clientX-r.left)/s,(e.clientY-r.top)/s,r]}
function bindScroll(){
  const sc=$('#nbScroll');
  sc.addEventListener('scroll',()=>paintVisible(false),{passive:true});
  sc.addEventListener('pointerdown',onDown);sc.addEventListener('pointermove',onMove);sc.addEventListener('pointerup',onUp);sc.addEventListener('pointercancel',onUp);
  /* trackpad / mouse wheel: ctrl+wheel = pinch zoom on laptops */
  sc.addEventListener('wheel',e=>{if(e.ctrlKey){e.preventDefault();zoomAt(S.zoom*Math.exp(-e.deltaY*.01),e.clientX,e.clientY,true)}},{passive:false});
  /* Safari's own pinch gesture (trackpad / iPad keyboard) */
  sc.addEventListener('gesturestart',e=>{e.preventDefault();sc._gz=S.zoom});sc.addEventListener('gesturechange',e=>{e.preventDefault();zoomAt(sc._gz*e.scale,e.clientX||innerWidth/2,e.clientY||innerHeight/2,true)});
  sc.addEventListener('gestureend',e=>{e.preventDefault();layout()});
}
function drawsWith(e){if(e.pointerType==='pen'){if(!S.pencilOnly){S.pencilOnly=true;savePrefs();tools();say('Apple Pencil found: fingers now scroll, Pencil writes')}return true}
  if(e.pointerType==='touch')return!S.pencilOnly;return e.button===0}
function onDown(e){
  const sc=$('#nbScroll');ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY,t:e.pointerType});cancelAnimationFrame(mom);
  if(e.target.closest('.nb-selbar'))return;
  const touches=[...ptrs.values()].filter(p=>p.t==='touch');
  if(touches.length===2){ /* two fingers: cancel any stroke, start pinch/pan */
    if(act&&act.kind==='ink'){act.live?.remove();act=null}
    const [a,b]=touches;pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:S.zoom,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2,st:sc.scrollTop,sl:sc.scrollLeft};return}
  const pageEl=e.target.closest('.nb-page');
  if(e.pointerType==='touch'&&!drawsWith(e)||!pageEl){if(e.pointerType==='touch'||!pageEl){act={kind:'pan',y:e.clientY,x:e.clientX,st:sc.scrollTop,sl:sc.scrollLeft,v:0,lt:performance.now(),ly:e.clientY}}return}
  if(!drawsWith(e))return;
  const p=pageOf(pageEl),[x,y]=toPage(pageEl,e);
  /* text and lasso work with what's already on the page */
  if(S.tool==='text'){const tEl=e.target.closest('.nb-txt');if(tEl)return;e.preventDefault();addText(p,pageEl,x,y);return}
  if(S.tool==='lasso'){
    const im=e.target.closest('img[data-iid]'),tx=e.target.closest('.nb-txt');
    if(S.sel&&S.sel.pid===p.id&&inBox(S.sel.box,x,y)){act={kind:'move',p,el:pageEl,x0:x,y0:y,dx:0,dy:0,id:e.pointerId};snap(p);sc.setPointerCapture(e.pointerId);return}
    if(im||tx){S.sel={pid:p.id,strokes:[],imgs:im?[im.dataset.iid]:[],texts:tx?[tx.dataset.tid]:[]};S.sel.box=selBox(p);drawSel(pageEl);act={kind:'move',p,el:pageEl,x0:x,y0:y,dx:0,dy:0,id:e.pointerId};snap(p);sc.setPointerCapture(e.pointerId);return}
    clearSel();act={kind:'lasso',p,el:pageEl,pts:[[x,y]],live:liveCanvas(pageEl),id:e.pointerId};sc.setPointerCapture(e.pointerId);return}
  e.preventDefault();sc.setPointerCapture(e.pointerId);
  if(S.tool==='eraser'){snap(p);act={kind:'erase',p,el:pageEl,n:0,id:e.pointerId};eraseAt(p,x,y);return}
  const t=S.tool==='hl'?'hl':'pen';
  act={kind:'ink',p,el:pageEl,id:e.pointerId,st:{t,c:inkColor(t),w:SIZES[t][S.sz[t]||0],pr:e.pointerType==='pen',p:[[x,y,e.pointerType==='pen'?Math.max(.05,e.pressure||.5):.5]]},live:liveCanvas(pageEl)};
  drawLive();
}
function onMove(e){
  const sc=$('#nbScroll');const pp=ptrs.get(e.pointerId);if(pp){pp.x=e.clientX;pp.y=e.clientY}
  if(pinch){const touches=[...ptrs.values()].filter(p=>p.t==='touch');if(touches.length<2)return;const[a,b]=touches,d=Math.hypot(a.x-b.x,a.y-b.y),cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
    zoomAt(pinch.z*d/pinch.d,pinch.cx,pinch.cy,true);sc.scrollTop+= (pinch.cy-cy)*.0+0;pinch.lastY=cy;
    if(pinch.py!=null){sc.scrollTop-=cy-pinch.py;sc.scrollLeft-=cx-pinch.px}pinch.py=cy;pinch.px=cx;return}
  if(!act)return;
  if(act.kind==='pan'){const now=performance.now();sc.scrollTop=act.st-(e.clientY-act.y);sc.scrollLeft=act.sl-(e.clientX-act.x);act.v=(act.ly-e.clientY)/Math.max(1,now-act.lt)*.6+act.v*.4;act.ly=e.clientY;act.lt=now;return}
  if(e.pointerId!==act.id)return;
  const evs=e.getCoalescedEvents?e.getCoalescedEvents():[e];
  if(act.kind==='ink'){for(const ev of evs){const[x,y]=toPage(act.el,ev);act.st.p.push([x,y,act.st.pr?Math.max(.05,ev.pressure||.5):.5])}drawLive();return}
  if(act.kind==='erase'){for(const ev of evs){const[x,y]=toPage(act.el,ev);eraseAt(act.p,x,y)}return}
  if(act.kind==='lasso'){const[x,y]=toPage(act.el,e);act.pts.push([x,y]);drawLasso();return}
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
  if(a.kind==='erase'){if(!a.n)S.undo.pop();else touch(a.p);return}
  if(a.kind==='lasso'){a.live.remove();finishLasso(a);return}
  if(a.kind==='move'){commitMove(a);return}
}
function liveCanvas(pageEl){const c=document.createElement('canvas');c.className='nb-live';const w=pageEl.clientWidth,h=pageEl.clientHeight,k=Math.min(2,devicePixelRatio||1);c.width=w*k;c.height=h*k;c.style.width=w+'px';c.style.height=h+'px';pageEl.appendChild(c);c._k=k*w/PW;return c}
let liveRAF=0;
function drawLive(){if(liveRAF)return;liveRAF=requestAnimationFrame(()=>{liveRAF=0;if(!act||act.kind!=='ink')return;const c=act.live,ctx=c.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,c.width,c.height);ctx.setTransform(c._k,0,0,c._k,0,0);
  const st={...act.st,_o:null};st._o=PF.getStroke(st.p,{size:st.w,thinning:st.t==='hl'?0:(st.pr?.62:.5),smoothing:.55,streamline:st.t==='hl'?.6:.42,simulatePressure:!st.pr,last:false});drawStroke(ctx,st)})}
function eraseAt(p,x,y){const r=SIZES.eraser[S.sz.eraser||0];const keep=[];let hit=false;
  for(const st of p.strokes){const rr=r+st.w/2;if(st.p.some(q=>(q[0]-x)**2+(q[1]-y)**2<rr*rr)){hit=true}else keep.push(st)}
  if(hit){p.strokes=keep;act.n++;repaint(p.id)}}
/* ---------- lasso / selection ---------- */
function drawLasso(){const c=act.live,ctx=c.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,c.width,c.height);ctx.setTransform(c._k,0,0,c._k,0,0);
  ctx.setLineDash([10,8]);ctx.lineWidth=2.2;ctx.strokeStyle='#F06D44';ctx.fillStyle='rgba(240,109,68,.08)';ctx.beginPath();act.pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();ctx.fill();ctx.stroke()}
function inPoly(pt,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>pt[1])!==(b[1]>pt[1])&&pt[0]<(b[0]-a[0])*(pt[1]-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
function finishLasso(a){const p=a.p,poly=a.pts;if(poly.length<4){clearSel();return}
  const strokes=p.strokes.filter(st=>{const n=st.p.filter(q=>inPoly(q,poly)).length;return n>=st.p.length*.5}).map(st=>p.strokes.indexOf(st));
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
  const hasImg=S.sel.imgs.length===1&&!S.sel.strokes.length&&!S.sel.texts.length;if(hasImg)box.innerHTML='<i class="nb-rz" data-nbrz="1"></i>';
  pageEl.appendChild(box);
  const bar=document.createElement('div');bar.className='nb-selbar';bar.style.cssText=`left:${Math.max(0,b[0]*s)}px;top:${Math.max(0,b[1]*s-50)}px`;
  bar.innerHTML=`<button data-nb="seldel">${svg('trash')}Delete</button><button data-nb="seldup">${svg('copy')}Duplicate</button>${S.sel.strokes.length?`<button data-nb="selcol"><i style="background:${inkColor('pen')}"></i>Recolour</button>`:''}`;
  pageEl.appendChild(bar)}
function clearSel(){S.sel=null;$$('.nb-selbox,.nb-selbar',V).forEach(n=>n.remove())}
function previewMove(){const s=act.el.clientWidth/PW;$$('.nb-selbox,.nb-selbar',act.el).forEach(n=>n.style.transform=`translate(${act.dx*s}px,${act.dy*s}px)`);
  const c=act.el.querySelector('.nb-ink');c.style.transform=`translate(0,0)`;
  if(!act.ghost){act.ghost=liveCanvas(act.el)}const g=act.ghost,ctx=g.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,g.width,g.height);ctx.setTransform(g._k,0,0,g._k,act.dx*g._k,act.dy*g._k);
  ctx.globalAlpha=.55;S.sel.strokes.forEach(i=>{const st=act.p.strokes[i];if(st)drawStroke(ctx,st)});ctx.globalAlpha=1;
  S.sel.imgs.forEach(id=>{const im=act.el.querySelector(`img[data-iid="${id}"]`);if(im)im.style.transform=`translate(${act.dx*s}px,${act.dy*s}px)`});
  S.sel.texts.forEach(id=>{const t=act.el.querySelector(`.nb-txt[data-tid="${id}"]`);if(t)t.style.transform=`translate(${act.dx*s}px,${act.dy*s}px)`})}
function commitMove(a){a.ghost?.remove();const p=a.p,dx=a.dx,dy=a.dy;if(Math.abs(dx)+Math.abs(dy)<1){S.undo.pop();drawSel(a.el);return}
  if(a.resize){}
  p.strokes=p.strokes.map((st,i)=>S.sel.strokes.includes(i)?{...st,p:st.p.map(q=>[q[0]+dx,q[1]+dy,q[2]]),_o:null}:st);
  p.imgs=p.imgs.map(m=>S.sel.imgs.includes(m.id)?{...m,x:m.x+dx,y:m.y+dy}:m);p.texts=p.texts.map(t=>S.sel.texts.includes(t.id)?{...t,x:t.x+dx,y:t.y+dy}:t);
  S.sel.box=[S.sel.box[0]+dx,S.sel.box[1]+dy,S.sel.box[2]+dx,S.sel.box[3]+dy];touch(p);paintPage(a.el)}
function selAction(k){const p=S.pages.find(x=>x.id===S.sel.pid);if(!p)return;snap(p);
  if(k==='seldel'){p.strokes=p.strokes.filter((_,i)=>!S.sel.strokes.includes(i));p.imgs=p.imgs.filter(m=>!S.sel.imgs.includes(m.id));p.texts=p.texts.filter(t=>!S.sel.texts.includes(t.id));S.sel=null}
  if(k==='seldup'){const d=24,n0=p.strokes.length;const ns=S.sel.strokes.map(i=>({...p.strokes[i],p:p.strokes[i].p.map(q=>[q[0]+d,q[1]+d,q[2]]),_o:null}));p.strokes=[...p.strokes,...ns];
    const ni=S.sel.imgs.map(id=>{const m=p.imgs.find(z=>z.id===id);return{...m,id:uid(),x:m.x+d,y:m.y+d}}),nt=S.sel.texts.map(id=>{const t=p.texts.find(z=>z.id===id);return{...t,id:uid(),x:t.x+d,y:t.y+d}});
    p.imgs=[...p.imgs,...ni];p.texts=[...p.texts,...nt];S.sel={pid:p.id,strokes:ns.map((_,i)=>n0+i),imgs:ni.map(m=>m.id),texts:nt.map(t=>t.id)};S.sel.box=selBox(p)}
  if(k==='selcol'){const c=inkColor('pen');p.strokes=p.strokes.map((st,i)=>S.sel.strokes.includes(i)&&st.t!=='hl'?{...st,c,_o:st._o}:st)}
  touch(p);repaint(p.id)}
/* resize a selected image from its corner */
document.addEventListener('pointerdown',e=>{const h=e.target.closest&&e.target.closest('[data-nbrz]');if(!h||!S.sel)return;e.stopPropagation();e.preventDefault();
  const pageEl=h.closest('.nb-page'),p=pageOf(pageEl),m=p.imgs.find(z=>z.id===S.sel.imgs[0]);if(!m)return;snap(p);const s=pageEl.clientWidth/PW,x0=e.clientX,w0=m.w,h0=m.h;
  const mv=ev=>{const w=Math.max(60,w0+(ev.clientX-x0)/s);m.w=w;m.h=w*h0/w0;const im=pageEl.querySelector(`img[data-iid="${m.id}"]`);if(im){im.style.width=m.w*s+'px';im.style.height=m.h*s+'px'}};
  const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);S.sel.box=selBox(p);touch(p);paintPage(pageEl)};addEventListener('pointermove',mv);addEventListener('pointerup',up)},true);

/* ---------- text boxes ---------- */
function addText(p,pageEl,x,y){snap(p);const t={id:uid(),x:Math.max(10,x-4),y:Math.max(10,y-18),w:Math.min(560,PW-x-20),size:30,txt:'',c:inkColor('pen')};p.texts.push(t);paintPage(pageEl);
  const el=pageEl.querySelector(`.nb-txt[data-tid="${t.id}"]`);if(el){el.focus()}}
document.addEventListener('input',e=>{const el=e.target.closest&&e.target.closest('.nb-txt');if(!el)return;const pageEl=el.closest('.nb-page'),p=pageOf(pageEl),t=p&&p.texts.find(z=>z.id===el.dataset.tid);if(!t)return;
  const nt={...t,txt:el.innerText.replace(/\n$/,'')};p.texts=p.texts.map(z=>z.id===t.id?nt:z);touch(p)});
document.addEventListener('focusout',e=>{const el=e.target.closest&&e.target.closest('.nb-txt');if(!el)return;const pageEl=el.closest('.nb-page'),p=pageOf(pageEl);if(!p)return;const t=p.texts.find(z=>z.id===el.dataset.tid);
  if(t&&!t.txt.trim()){p.texts=p.texts.filter(z=>z.id!==t.id);S.undo.pop();touch(p);paintPage(pageEl)}});
function drawTexts(ctx,p,b){const ink=BGS[b.paper.bg][1];(p.texts||[]).forEach(t=>{ctx.fillStyle=t.c||ink;ctx.font=`500 ${t.size}px -apple-system,system-ui,sans-serif`;ctx.textBaseline='top';
  let y=t.y+2;for(const para of String(t.txt).split('\n')){let line='';for(const w of para.split(' ')){const test=line?line+' '+w:w;if(ctx.measureText(test).width>t.w&&line){ctx.fillText(line,t.x+2,y);y+=t.size*1.3;line=w}else line=test}ctx.fillText(line,t.x+2,y);y+=t.size*1.3}})}
/* ---------- images ---------- */
function loadImg(src){return new Promise(r=>{const im=new Image();im.onload=()=>r(im);im.onerror=()=>r(null);im.src=src})}
async function drawImgs(ctx,p,k){for(const m of p.imgs||[]){const im=await loadImg(m.src);if(im)ctx.drawImage(im,m.x*k,m.y*k,m.w*k,m.h*k)}}
async function insertImage(file){if(!file)return;const url=URL.createObjectURL(file),im=await loadImg(url);URL.revokeObjectURL(url);if(!im){say('Couldn’t read that image');return}
  const max=1400,sc=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);c.getContext('2d').drawImage(im,0,0,c.width,c.height);
  const src=c.toDataURL('image/jpeg',.85),p=S.pages[S.cur]||S.pages[0],w=Math.min(600,PW-80),h=w*c.height/c.width;snap(p);
  const pageEl=$(`.nb-page[data-pid="${p.id}"]`,V),sc2=$('#nbScroll'),r=pageEl.getBoundingClientRect(),s=r.width/PW,vy=Math.max(40,Math.min(PH-h-40,(sc2.getBoundingClientRect().top+sc2.clientHeight/2-r.top)/s-h/2));
  const m={id:uid(),x:(PW-w)/2,y:vy,w,h,src};p.imgs.push(m);touch(p);S.tool='lasso';tools();S.sel={pid:p.id,strokes:[],imgs:[m.id],texts:[]};S.sel.box=selBox(p);paintPage(pageEl);say('Drag to move, corner to resize')}

/* ---------- zoom ---------- */
function zoomAt(z,cx,cy,live){z=Math.max(.5,Math.min(4,z));if(Math.abs(z-S.zoom)<.001)return;const sc=$('#nbScroll'),r=sc.getBoundingClientRect(),f=z/S.zoom;
  const ox=sc.scrollLeft+(cx-r.left),oy=sc.scrollTop+(cy-r.top);S.zoom=z;
  const wrap=$('#nbPages'),w=dispW(),s=w/PW,h=Math.round(PH*s);wrap.style.setProperty('--s',s);wrap.style.width=w+'px';
  $$('.nb-page',wrap).forEach(el=>{el.style.width=w+'px';el.style.height=h+'px';const c=el.querySelector('.nb-ink');c.style.width=w+'px';c.style.height=h+'px';
    const p=pageOf(el);el.querySelectorAll('img[data-iid]').forEach(im=>{const m=p.imgs.find(z2=>z2.id===im.dataset.iid);if(m){im.style.left=m.x*s+'px';im.style.top=m.y*s+'px';im.style.width=m.w*s+'px';im.style.height=m.h*s+'px'}});
    el.querySelectorAll('.nb-txt').forEach(tn=>{const t=p.texts.find(z2=>z2.id===tn.dataset.tid);if(t){tn.style.left=t.x*s+'px';tn.style.top=t.y*s+'px';tn.style.width=t.w*s+'px';tn.style.fontSize=t.size*s+'px'}});el._dirty=true});
  sc.scrollLeft=ox*f-(cx-r.left);sc.scrollTop=oy*f-(cy-r.top);$('#nbZ').textContent=Math.round(z*100)+'%';
  clearTimeout(zoomAt.t);zoomAt.t=setTimeout(()=>paintVisible(true),live?160:0)}

/* ---------- pages menu / export ---------- */
function menu(){
  const b=S.book;const m=document.createElement('div');m.className='nb-modal';m.innerHTML=`<div class="nb-mcard"><h3>${esc(b.title)}</h3>
    <div class="nb-list">
      <button data-nb="addpage">${svg('plus')}Add page after this one</button>
      <button data-nb="delpage">${svg('trash')}Delete page ${S.cur+1}</button>
      <button data-nb="bookset">${svg('book')}Paper, cover &amp; name</button>
      <button data-nb="exppng">${svg('img')}Share page ${S.cur+1} as image</button>
      <button data-nb="exppdf">${svg('copy')}Export notebook as PDF</button>
      <button data-nb="pencil">${svg('pencil')}Pencil only: <b>${S.pencilOnly?'On':'Off'}</b></button>
    </div><div class="nb-acts"><span></span><button class="nb-btn" data-nb="cancel">Done</button></div></div>`;V.appendChild(m);requestAnimationFrame(()=>m.classList.add('on'))}
async function renderPageImage(p,width){const k=width/PW,c=document.createElement('canvas');c.width=width;c.height=Math.round(PH*k);const ctx=c.getContext('2d');paperPaint(ctx,S.book.paper,c.width,c.height,k);
  await drawImgs(ctx,p,k);ctx.save();ctx.scale(k,k);p.strokes.forEach(st=>{if(st.t==='hl')drawStroke(ctx,st)});p.strokes.forEach(st=>{if(st.t!=='hl')drawStroke(ctx,st)});drawTexts(ctx,p,S.book);ctx.restore();return c}
async function sharePage(){const p=S.pages[S.cur];const c=await renderPageImage(p,1600);const blob=await new Promise(r=>c.toBlob(r,'image/png'));const name=`${S.book.title.replace(/[^\w -]/g,'')||'page'} p${S.cur+1}.png`,f=new File([blob],name,{type:'image/png'});
  if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f]});return}catch(e){if(e&&e.name==='AbortError')return}}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
async function exportPDF(){say('Preparing pages…');const box=document.createElement('div');box.id='nbPrint';
  for(const p of S.pages){const c=await renderPageImage(p,1240);const im=new Image();im.src=c.toDataURL('image/jpeg',.92);box.appendChild(im)}
  document.body.appendChild(box);document.documentElement.classList.add('nb-printing');const done=()=>{document.documentElement.classList.remove('nb-printing');box.remove();removeEventListener('afterprint',done)};
  addEventListener('afterprint',done);setTimeout(()=>{window.print();setTimeout(()=>{if(document.getElementById('nbPrint'))done()},60000)},300)}

/* ---------- clicks ---------- */
document.addEventListener('click',async e=>{
  if(!V||V.hidden)return;const t=e.target.closest('[data-nb],[data-tool],[data-ink],[data-sz],[data-open],[data-menu],[data-cv],[data-st],[data-bg]');if(!t||!V.contains(t))return;
  const d=t.dataset,m=t.closest('.nb-modal');
  if(d.cv&&m){m._b.color=d.cv;$$('[data-cv]',m).forEach(x=>x.setAttribute('aria-pressed',String(x===t)));return}
  if(d.st&&m){m._b.paper.style=d.st;$$('[data-st]',m).forEach(x=>x.setAttribute('aria-pressed',String(x===t)));return}
  if(d.bg&&m){m._b.paper.bg=d.bg;$$('[data-bg]',m).forEach(x=>x.setAttribute('aria-pressed',String(x===t)));return}
  if(d.menu){e.stopPropagation();const b=S.books.find(x=>x.id===d.menu);if(b)newBookForm(b);return}
  if(d.open){openBook(d.open);return}
  if(d.tool){S.tool=d.tool;clearSel();tools();$$('.nb-txt',V).forEach(x=>x.contentEditable=String(S.tool==='text'));if(S.tool==='text')say('Tap the page to type');return}
  if(d.ink!==undefined){if(S.tool==='hl')S.ink.hl=+d.ink;else{S.ink.pen=+d.ink;S.customInk=null;if(S.tool!=='pen'&&S.tool!=='text')S.tool='pen'}savePrefs();tools();return}
  if(d.sz!==undefined){S.sz[S.tool]=+d.sz;savePrefs();tools();return}
  switch(d.nb){
    case'close':hide();return;
    case'lib':await flushAll();library();return;
    case'new':newBookForm();return;
    case'cancel':m?.remove();return;
    case'createbook':createBook(m);return;
    case'savebook':{const b=await IDB.get('books',m._edit.id);Object.assign(b,{title:$('#nbT',m).value.trim()||b.title,color:m._b.color,paper:m._b.paper,u:Date.now()});await IDB.put('books',b);m.remove();if(S.book&&S.book.id===b.id){S.book=b;$('.nb-title',V).textContent=b.title;tools();layout()}else library();return}
    case'delbook':{if(!t.dataset.armed){t.dataset.armed=1;t.textContent='Tap again to delete';setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.textContent='Delete'}},3000);return}
      const b=m._edit;for(const pid of b.pages)await IDB.del('pages',pid);await IDB.del('books',b.id);m.remove();window.dispatchEvent(new CustomEvent('life-notes-changed',{detail:{deleted:b.id}}));library();return}
    case'bookset':m?.remove();newBookForm(S.book);return;
    case'undo':undoRedo(S.undo,S.redo);return;
    case'redo':undoRedo(S.redo,S.undo);return;
    case'more':menu();return;
    case'zin':zoomAt(S.zoom*1.25,innerWidth/2,innerHeight/2);return;
    case'zout':zoomAt(S.zoom/1.25,innerWidth/2,innerHeight/2);return;
    case'pencil':S.pencilOnly=!S.pencilOnly;savePrefs();tools();m?.remove();say(S.pencilOnly?'Pencil writes, fingers scroll':'Fingers write too (two fingers scroll)');return;
    case'img':{const inp=$('#nbImg',V);inp.value='';inp.onchange=()=>insertImage(inp.files&&inp.files[0]);inp.click();return}
    case'addpage':{const pg={id:uid(),book:S.book.id,strokes:[],texts:[],imgs:[],u:Date.now()};S.pages.splice(S.cur+1,0,pg);S.book.pages=S.pages.map(p=>p.id);await IDB.put('pages',pg);touch(pg);m?.remove();layout();
      setTimeout(()=>{const el=$(`.nb-page[data-pid="${pg.id}"]`,V);el?.scrollIntoView({behavior:'smooth',block:'start'})},60);return}
    case'delpage':{if(S.pages.length<2){say('A notebook needs at least one page');return}if(!t.dataset.armed){t.dataset.armed=1;t.innerHTML=`${svg('trash')}Tap again to delete page ${S.cur+1}`;return}
      const p=S.pages[S.cur];S.pages.splice(S.cur,1);S.book.pages=S.pages.map(x=>x.id);await IDB.del('pages',p.id);S.book.u=Date.now();await IDB.put('books',S.book);m?.remove();layout();return}
    case'exppng':m?.remove();sharePage();return;
    case'exppdf':m?.remove();exportPDF();return;
    case'seldel':case'seldup':case'selcol':selAction(d.nb);return;
  }
});
document.addEventListener('input',e=>{if(e.target.id==='nbQ'){S.q=e.target.value;clearTimeout(S.qt);S.qt=setTimeout(()=>{const pos=e.target.selectionStart;library().then(()=>{const q=$('#nbQ');if(q){q.focus();q.setSelectionRange(pos,pos)}})},250)}
  if(e.target.id==='nbCustom'){S.customInk=e.target.value;if(S.tool!=='text')S.tool='pen';tools()}});
document.addEventListener('keydown',e=>{if(!V||V.hidden)return;if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'&&!e.target.closest('.nb-txt,input,textarea')){e.preventDefault();e.shiftKey?undoRedo(S.redo,S.undo):undoRedo(S.undo,S.redo)}
  if(e.key==='Escape'){const m=$('.nb-modal',V);if(m)m.remove();else if(S.sel){clearSel()}}
  if((e.key==='Backspace'||e.key==='Delete')&&S.sel&&!e.target.closest('.nb-txt,input,textarea')){e.preventDefault();selAction('seldel')}});
addEventListener('resize',()=>{if(V&&!V.hidden&&S.book){clearTimeout(S.rt);S.rt=setTimeout(()=>layout(),150)}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)flushAll()});

/* ---------- public ---------- */
window.NOTES={
  async open(bookId){show();if(bookId)await openBook(bookId);else await library()},
  close:hide,
  /* everything, for backups and sync */
  async exportAll(){return{books:await IDB.all('books'),pages:(await IDB.all('pages')).map(strip)}},
  async importAll(d,replace){if(!d||!Array.isArray(d.books))return 0;if(replace){for(const b of await IDB.all('books'))await IDB.del('books',b.id);for(const p of await IDB.all('pages'))await IDB.del('pages',p.id)}
    for(const p of d.pages||[])await IDB.put('pages',p);for(const b of d.books)await IDB.put('books',b);return d.books.length},
  async summary(){const b=await IDB.all('books');return b.sort((x,y)=>(y.u||0)-(x.u||0)).map(x=>({id:x.id,title:x.title,color:x.color,pages:x.pages.length,u:x.u}))},
  IDB,_S:S,
  /* after a sync brought in newer notebooks */
  refresh(){if(!V||V.hidden)return;if(!S.book)library()},
  openBookId(){return V&&!V.hidden&&S.book?S.book.id:null}
};
})();
