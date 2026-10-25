/* ===================== "Ledger" skin (Oct 25) — a complete alternative look, switchable in Settings → Look & feel.
   Nothing here changes data or behaviour: it's fonts, colour, layout and chrome on top of the same screens.
   Stored in localStorage (lifeSkin) so it applies before the first paint. Classic look = this file does nothing. */
const SKIN=(()=>{try{return localStorage.getItem('lifeSkin')||''}catch(e){return ''}})();
function setSkin(v){try{v?localStorage.setItem('lifeSkin',v):localStorage.removeItem('lifeSkin')}catch(e){}try{sessionStorage.setItem('lifeNoIntro','1')}catch(e){}location.reload()}
{const _lp5=lookPanel;lookPanel=function(){const h=_lp5();const seg=`<div class="lookset"><span class="cap">Design</span><div class="seg2"><button data-skin="" aria-pressed="${SKIN!=='ledger'}">Classic</button><button data-skin="ledger" aria-pressed="${SKIN==='ledger'}">Ledger</button></div><p class="hint" style="margin:8px 0 0">Ledger is a test of a flatter, type-led look. Switching reloads the app; your data is untouched.</p></div>`;
  const k='<p class="hint">Changes apply instantly behind this panel.</p>';return h.includes(k)?h.replace(k,k+seg):h.replace('<div class="lookset">',seg+'<div class="lookset">')}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-skin]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if((b.dataset.skin||'')===(SKIN||''))return;setSkin(b.dataset.skin)},true);

if(SKIN==='ledger'){
  document.documentElement.dataset.skin='ledger';
  const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Schibsted+Grotesk:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&display=swap';document.head.appendChild(l);
  /* the opening animation belongs to the classic look */
  runSplash=function(){endSplash()};
  /* no pixel/wave/3D ornaments in this skin (they're rendered, just hidden - the classic look keeps them) */
  document.head.insertAdjacentHTML('beforeend',`<style id="skin-ledger">
html[data-skin="ledger"]{
  --bg:#F5F2EA; --surface:#FBF9F3; --surface2:#ECE8DD; --ink:#1C1B18; --ink2:#44413A; --muted:#7B766B; --line:#D9D3C5;
  --accent:#B3401F; --accent-ink:#fff; --sage:#1C1B18; --sage-ink:#F5F2EA; --sage-soft:#44413A;
  --bar:#F5F2EA; --bar-ink:#7B766B; --late:#A8321C; --soon:#8A5A12; --good:#2E6B45;
  --hi:transparent; --shadow:none; --card-shadow:none;
  --serif:'Instrument Serif',Georgia,'Times New Roman',serif;
  --ui:'Schibsted Grotesk',ui-sans-serif,system-ui,sans-serif;
  --mono:'Schibsted Grotesk',ui-sans-serif,system-ui,sans-serif;
  --dot:'Instrument Serif',Georgia,serif;
  --r-xl:10px; --r-l:8px; --r-m:6px; --r-s:4px; --glass-blur:0; --glass-tint:100;
  --rule:1px solid var(--line);
}
@media (prefers-color-scheme:dark){html[data-skin="ledger"]:not([data-theme="light"]){
  --bg:#161513; --surface:#1C1B18; --surface2:#262420; --ink:#ECE7DB; --ink2:#C9C3B5; --muted:#8E887B; --line:#2E2C27;
  --accent:#E0684A; --accent-ink:#1A0D07; --sage:#ECE7DB; --sage-ink:#161513; --sage-soft:#C9C3B5;
  --bar:#161513; --bar-ink:#8E887B; --late:#F28B75; --soon:#E6B05C; --good:#7FC79A; color-scheme:dark}}
html[data-skin="ledger"][data-theme="dark"]{
  --bg:#161513; --surface:#1C1B18; --surface2:#262420; --ink:#ECE7DB; --ink2:#C9C3B5; --muted:#8E887B; --line:#2E2C27;
  --accent:#E0684A; --accent-ink:#1A0D07; --sage:#ECE7DB; --sage-ink:#161513; --sage-soft:#C9C3B5;
  --bar:#161513; --bar-ink:#8E887B; --late:#F28B75; --soon:#E6B05C; --good:#7FC79A; color-scheme:dark}
html[data-skin="ledger"]:not(.booted),html[data-skin="ledger"]:not(.booted) body{background:var(--bg)!important}

/* ---- ornaments off (the ambient mesh background, rings, art) */
html[data-skin="ledger"] :is(#mesh,#flora,#bgcurve){display:none!important}
html[data-skin="ledger"] .av{background:var(--ink)!important;color:var(--bg)!important;box-shadow:none!important;width:40px;height:40px;font:600 13px var(--ui);margin:0 8px 0 0}
html[data-skin="ledger"] .banner{background:var(--surface);border:var(--rule);border-radius:8px;box-shadow:none}
html[data-skin="ledger"] .banner button{border-radius:5px;font-weight:600}
/* the Today nutrition block is the one solid panel: ink on paper (paper on ink in dark mode) */
html[data-skin="ledger"] .hero.tsum{background:var(--ink)!important;color:var(--bg);border-radius:10px;border-top:0;padding:18px 18px 16px;overflow:hidden}
html[data-skin="ledger"] .hero.tsum .cap{color:color-mix(in srgb,var(--bg) 65%,transparent)}
html[data-skin="ledger"] .ts-grid>button{background:transparent!important;border:1px solid color-mix(in srgb,var(--bg) 22%,transparent)!important;box-shadow:none!important;border-radius:6px}
html[data-skin="ledger"] .ts-grid>button::before{display:none}
html[data-skin="ledger"] .ts-grid>button small{filter:none;color:color-mix(in srgb,var(--bg) 70%,transparent)}
html[data-skin="ledger"] .ts-grid b{font-family:var(--serif)!important;font-weight:400!important;font-size:26px!important;color:var(--bg)}
html[data-skin="ledger"] .hero.tsum .pill.light{background:var(--bg)!important;color:var(--ink)!important}
html[data-skin="ledger"] .hero:not(.tsum){--hc:var(--ink)}
html[data-skin="ledger"] .hero:not(.tsum) .pill.light{background:var(--ink)!important;color:var(--bg)!important}
html[data-skin="ledger"] .hero:not(.tsum) .pill.glassy{background:transparent!important;color:var(--ink)!important;border:var(--rule)}
html[data-skin="ledger"] .hero:not(.tsum) :is(.hero-stats b,.big,.cap,.lead){color:inherit}
html[data-skin="ledger"] .hero:not(.tsum) .hero-stats b{color:var(--ink)!important}
html[data-skin="ledger"] .hero:not(.tsum) .lead{max-width:30ch!important}

html[data-skin="ledger"] :is(.hero-art,.pxw,.pxd,.sprig,.a3d,.hart,#bgcurve,.avr,.hero-wave,.ts-leg .tb i.px){display:none!important}
html[data-skin="ledger"] .sec-h h2::before{content:none!important;display:none!important}
html[data-skin="ledger"] .empty svg{display:none}

/* ---- type */
html[data-skin="ledger"] body{font:400 15.5px/1.5 var(--ui);letter-spacing:0}
html[data-skin="ledger"] :is(h1,h2,h3,#hi),html[data-skin="ledger"][data-head] :is(h1,h2,h3,#hi){font-family:var(--serif)!important;font-weight:400!important;letter-spacing:-.005em!important;font-feature-settings:"liga","kern"}
html[data-skin="ledger"] :is(h1,h2,h3) em{font-style:italic;color:var(--accent)}
html[data-skin="ledger"] .hello h1,html[data-skin="ledger"] #hi{font-size:clamp(30px,8.4vw,36px)!important;line-height:1.05!important;margin-top:2px}
html[data-skin="ledger"] h2{font-size:27px!important;line-height:1.1!important}
html[data-skin="ledger"] .cap,html[data-skin="ledger"][data-head] .cap{font:500 12px/1.3 var(--ui)!important;letter-spacing:.02em!important;text-transform:none!important;color:var(--muted)}
html[data-skin="ledger"] .num:not(.big),html[data-skin="ledger"] b.num,html[data-skin="ledger"][data-head] :is(.num:not(.big),b.num,.ts-grid b,.ts-leg .tv b){font-family:var(--ui)!important;font-weight:600!important;font-variant-numeric:tabular-nums lining-nums;letter-spacing:-.01em!important}
html[data-skin="ledger"] .hello .cap{font-size:13px!important}
html[data-skin="ledger"] b,html[data-skin="ledger"] strong{font-weight:600}

/* ---- header */
html[data-skin="ledger"] .top{border-radius:0;padding:14px 0 10px;margin:0 0 4px;gap:8px}
html[data-skin="ledger"] .top.float{background:var(--bg);-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:none;border-bottom:var(--rule)}
html[data-skin="ledger"] .ib{width:40px;height:40px;border-radius:6px;background:transparent;border:var(--rule);box-shadow:none;color:var(--ink2)}
html[data-skin="ledger"] .ib svg{width:19px;height:19px}

/* ---- page rhythm */
html[data-skin="ledger"] .app{max-width:600px}
html[data-skin="ledger"] .sec{margin-top:34px}
html[data-skin="ledger"] .sec-h{border-top:var(--rule);padding-top:12px;margin-bottom:12px;align-items:baseline}
html[data-skin="ledger"] .sec-h .cap{font-size:13px!important}

/* ---- the big card becomes a typographic block */
html[data-skin="ledger"] .hero{background:transparent!important;color:var(--ink);border-radius:0;padding:14px 0 0;box-shadow:none;border-top:2px solid var(--ink);overflow:visible}
html[data-skin="ledger"] .hero .cap{color:var(--muted)}
html[data-skin="ledger"] .hero .big,html[data-skin="ledger"][data-head] .hero .big{font:400 clamp(72px,22vw,96px)/.92 var(--serif)!important;letter-spacing:-.03em!important;margin:12px 0 10px;color:var(--ink);font-variant-numeric:lining-nums}
html[data-skin="ledger"] .hero .lead{font:italic 400 22px/1.25 var(--serif);color:var(--ink2);max-width:30ch}
html[data-skin="ledger"] .hero .lead b{font-style:normal;font-weight:400;color:var(--ink)}
html[data-skin="ledger"] .hero-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;margin-top:22px;border-top:var(--rule)}
html[data-skin="ledger"] .hero-stats>div{padding:10px 12px 0 0;border-right:var(--rule);margin-right:12px}
html[data-skin="ledger"] .hero-stats>div:last-child{border-right:0;margin-right:0}
html[data-skin="ledger"] .hero-stats b{font:600 22px/1.1 var(--ui);letter-spacing:-.02em;margin-top:4px}
html[data-skin="ledger"] .hero-actions{margin-top:18px}
html[data-skin="ledger"] .pill{height:46px;border-radius:6px;font-weight:600;font-size:15px;width:auto;padding:0 18px;box-shadow:none!important;transition:background .2s,transform .2s cubic-bezier(.2,.8,.2,1)}
html[data-skin="ledger"] .pill.light{background:var(--ink);color:var(--bg)}
html[data-skin="ledger"] .pill.glassy{background:transparent;color:var(--ink);border:var(--rule)}
html[data-skin="ledger"] .pill:active{transform:scale(.98)}

/* ---- section nav (chips) = text with an underline */
html[data-skin="ledger"] .chips{gap:0;margin:14px -16px 0;padding:0 16px;border-bottom:var(--rule)}
html[data-skin="ledger"] .chips:first-child{margin-bottom:6px}
html[data-skin="ledger"] .chips>.chip{height:42px;padding:0 14px;margin:0 2px 0 0;border-radius:0;background:none;border:0;box-shadow:none;font-weight:500;font-size:15px;color:var(--muted);position:relative}
html[data-skin="ledger"] .chips>.chip:first-child{padding-left:0}
html[data-skin="ledger"] .chips>.chip :is(.ico,.tile,svg,i){display:none}
html[data-skin="ledger"] .chips>.chip.on{color:var(--ink);font-weight:600}
html[data-skin="ledger"] .chips>.chip.on::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--ink)}
html[data-skin="ledger"] .chips>.chip:first-child.on::after{left:0}

/* ---- lists: rules, not cards */
html[data-skin="ledger"] .card-s,html[data-skin="ledger"] .card,html[data-skin="ledger"] .tile,html[data-skin="ledger"] .stat,html[data-skin="ledger"] .pjcard{background:var(--surface);border:var(--rule);box-shadow:none;border-radius:8px}
html[data-skin="ledger"] ul.list.card-s{background:transparent;border:0;border-top:var(--rule);border-radius:0;padding:0}
html[data-skin="ledger"] .row{padding:12px 0;min-height:60px;border-bottom:var(--rule);gap:14px;border-radius:0}
html[data-skin="ledger"] .rt{font-weight:500;font-size:16px}
html[data-skin="ledger"] .rs{font-size:13.5px}
html[data-skin="ledger"] .meta{background:none;padding:0;border-radius:0;font:500 13px var(--ui);color:var(--muted);font-variant-numeric:tabular-nums}
html[data-skin="ledger"] .meta.late{color:var(--late)}html[data-skin="ledger"] .meta.soon{color:var(--soon)}
html[data-skin="ledger"] .mt-pill{border-radius:3px;padding:3px 8px;font-size:12px}
html[data-skin="ledger"] .mt-pill.live{background:color-mix(in srgb,var(--good) 14%,transparent);color:var(--good)}
html[data-skin="ledger"] .mt-pill.live i{background:var(--good)}
html[data-skin="ledger"] li.row.mt-live{box-shadow:none}
html[data-skin="ledger"] ul.list.card-s{border-top:0}
html[data-skin="ledger"] .row:first-child{border-top:var(--rule)}
html[data-skin="ledger"] .sec-h+ul.list .row:first-child{border-top:0}
html[data-skin="ledger"] .ico,html[data-skin="ledger"] .tile .ico{width:36px;height:36px;border-radius:6px;background:color-mix(in srgb,var(--c1,var(--accent)) 14%,var(--surface));color:var(--c1,var(--accent));box-shadow:none;border:1px solid color-mix(in srgb,var(--c1,var(--accent)) 28%,transparent)}
html[data-skin="ledger"] .ico::before{display:none}
html[data-skin="ledger"] .ico svg{width:18px;height:18px}
html[data-skin="ledger"] .chk{border-radius:50%}
html[data-skin="ledger"] .empty{border:var(--rule);border-style:solid;border-radius:8px;padding:18px;color:var(--muted);font-style:italic;font-family:var(--serif);font-size:17px;line-height:1.35;min-height:0}
html[data-skin="ledger"] .link{border-radius:4px;background:none;border:var(--rule);height:34px;font-weight:500;font-size:13px}
html[data-skin="ledger"] .notice{border-radius:8px;background:var(--surface);border:var(--rule)}

/* ---- today tiles */
html[data-skin="ledger"] .tiles{gap:8px}
html[data-skin="ledger"] .tile{padding:14px 14px 12px;gap:8px;border-radius:8px}
html[data-skin="ledger"] .tile b{font:400 34px/1 var(--serif);letter-spacing:-.02em}
html[data-skin="ledger"] .tile b small{font:500 12px var(--ui);margin-left:3px;letter-spacing:0}
html[data-skin="ledger"] .tile .cap{order:-1}
html[data-skin="ledger"] .stat b,html[data-skin="ledger"] .ts-grid b{font-family:var(--serif)!important;font-weight:400!important;font-size:30px!important;letter-spacing:-.02em!important}

/* ---- projects */
html[data-skin="ledger"] .pjcard{padding:14px 16px}
html[data-skin="ledger"] .pjbar{height:3px;border-radius:0;background:var(--surface2)}
html[data-skin="ledger"] .pjbar i{border-radius:0;background:var(--ink)}
html[data-skin="ledger"] .psteps{border-radius:0;border:0;background:transparent;border-top:var(--rule)}
html[data-skin="ledger"] .psteps li{border-bottom:var(--rule);padding-left:0;padding-right:0}
html[data-skin="ledger"] .psteps li+li{border-top:0}
html[data-skin="ledger"] .pjx .stepadd input{border-radius:6px}
html[data-skin="ledger"] .pjx .stepadd .primary{border-radius:6px}
html[data-skin="ledger"] .pj-act{border-radius:6px;background:transparent;border:var(--rule)}
html[data-skin="ledger"] .pjx-edit{border-radius:6px;background:transparent;border:var(--rule)}

/* ---- buttons & forms */
html[data-skin="ledger"] .primary{border-radius:6px;height:50px;box-shadow:none;font-weight:600;font-size:15px;background:var(--ink);color:var(--bg)}
html[data-skin="ledger"] .secondary{border-radius:6px;height:50px;background:transparent;border:1px solid var(--ink2);font-weight:600;font-size:15px;transition:transform .2s cubic-bezier(.2,.8,.2,1)}
html[data-skin="ledger"] .danger{border-radius:6px}
html[data-skin="ledger"] .sheet :is(input,select,textarea):not([type=checkbox]):not([type=range]):not([type=color]),html[data-skin="ledger"] .fld :is(input,select,textarea){border-radius:6px;background:var(--surface);border:var(--rule)}
html[data-skin="ledger"] .fld>span{font:500 12.5px var(--ui);color:var(--muted);letter-spacing:0;text-transform:none}
html[data-skin="ledger"] .seg2{border-radius:6px;background:var(--surface2);padding:3px}
html[data-skin="ledger"] .seg2 button{border-radius:4px}
html[data-skin="ledger"] .set-grp{font:500 13px var(--ui);text-transform:none;letter-spacing:0;color:var(--muted);border-top:var(--rule);padding-top:12px}
html[data-skin="ledger"] .trow{border-radius:0;border-bottom:var(--rule)}

/* ---- sheets: solid paper */
html[data-skin="ledger"] .sheet{background:var(--surface);-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:0 -1px 0 var(--line),0 24px 60px rgb(0 0 0 / .18);padding:18px 20px 22px}
html[data-skin="ledger"] .m-bottom{border-radius:14px 14px 0 0}
html[data-skin="ledger"] .m-zoom,html[data-skin="ledger"] .m-center{border-radius:10px}
html[data-skin="ledger"] .sh-h{margin-bottom:16px;padding-bottom:12px;border-bottom:var(--rule)}
html[data-skin="ledger"] .sh-h h1,html[data-skin="ledger"] .sh-h h2{font-size:28px!important}
html[data-skin="ledger"] .sh-h .x{border-radius:6px;background:transparent;border:var(--rule)}
html[data-skin="ledger"] .dhead h3{font-size:26px!important}
html[data-skin="ledger"] .kv{border-radius:6px}
html[data-skin="ledger"] .menu{border-radius:8px;box-shadow:0 10px 30px rgb(0 0 0 / .18);border:var(--rule);background:var(--surface);-webkit-backdrop-filter:none;backdrop-filter:none}
html[data-skin="ledger"] .menu button{border-radius:4px}

/* ---- dock: a flat bar with a 2px marker */
html[data-skin="ledger"] .dock{padding-top:0;background:var(--bg);border-top:var(--rule)}
html[data-skin="ledger"] .dock::before{display:none}
html[data-skin="ledger"] .dock-in{gap:14px;align-items:stretch}
html[data-skin="ledger"] .tabs{background:none;-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:none;border-radius:0;padding:0}
html[data-skin="ledger"] .tabs .ind{top:-1px;height:2px;border-radius:0;background:var(--ink);box-shadow:none}
html[data-skin="ledger"] .tabs .ind.lens{background:var(--ink);-webkit-backdrop-filter:none;backdrop-filter:none;height:2px}
html[data-skin="ledger"] .tabs .ind.lens::before,html[data-skin="ledger"] .tabs .ind.lens::after,html[data-skin="ledger"] .tabs .ind .lmag{display:none!important}
html[data-skin="ledger"] .tabs button{height:58px;border-radius:0;color:var(--bar-ink);font:500 11px var(--ui);letter-spacing:0;gap:4px;padding-top:6px;transition:color .2s}
html[data-skin="ledger"] .tabs button.on{color:var(--ink)}
html[data-skin="ledger"] .tabs button svg.i{width:21px;height:21px}
html[data-skin="ledger"] .fab{width:52px;height:52px;border-radius:6px;background:var(--ink);color:var(--bg);box-shadow:none;align-self:center;transition:transform .2s cubic-bezier(.2,.8,.2,1)}
html[data-skin="ledger"] .fab:active{transform:scale(.96)}
html[data-skin="ledger"] html:not([data-lay="port"]) .tabs{border-radius:0}

/* ---- misc chrome */
html[data-skin="ledger"] .qbar,html[data-skin="ledger"] .searchbox,html[data-skin="ledger"] .scanbox{border-radius:8px}
html[data-skin="ledger"] .habit,html[data-skin="ledger"] .folder,html[data-skin="ledger"] .tcard,html[data-skin="ledger"] .wcard{border-radius:8px}
html[data-skin="ledger"] .fl-tabs{border-radius:8px}
html[data-skin="ledger"] :is(.imp-chip,.ptag){border-radius:3px}
html[data-skin="ledger"] .ideas-title,html[data-skin="ledger"][data-head] .ideas-title{font-family:var(--serif)!important}
html[data-skin="ledger"] .sprig,html[data-skin="ledger"] .hero>.pxw{display:none!important}
html[data-skin="ledger"] .reveal,html[data-skin="ledger"] .press{transition-timing-function:cubic-bezier(.2,.8,.2,1)}
</style>`);
}
