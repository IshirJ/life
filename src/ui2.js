
/* ===================== ui2: food tracker, swipe actions, themed health, botanical touches, draggable focus pill ===================== */
Object.assign(P,{
  trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  undo:'<path d="M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"/>',
  leaf:'<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15M5 19l7-7"/>',
  heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  scan:'<path d="M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3M8 8v8M11 8v8M14 8v8M17 8v8"/>',
  restore:'<path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/>'
});

/* ---------- styles ---------- */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="ui2css">
/* header: more air between the date and the greeting; the greeting is tappable */
.hello .cap{display:block;margin-bottom:7px;transition:opacity .25s}
.hello h1{margin-top:2px}
#hi{cursor:pointer;-webkit-user-select:none;user-select:none;position:relative}
#hi .gl{display:inline-block;will-change:transform}
#hi.shine .hl1,#hi.shine em{background:linear-gradient(100deg,currentColor 40%,#FFF3E2 50%,currentColor 60%) 100% 0/300% 100% repeat;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:hishine 1.15s cubic-bezier(.4,0,.2,1) both}
#hi.shine .hl1{background-image:linear-gradient(100deg,currentColor 40%,var(--accent) 50%,currentColor 60%)}
#hi.shine em{animation-delay:.12s}
@keyframes hishine{from{background-position:100% 0}to{background-position:0% 0}}
#avBtn.spin .avr{animation:avspin 1.2s cubic-bezier(.5,0,.2,1)}
@keyframes avspin{to{transform:rotate(1turn)}}
#avBtn.spin{animation:avpulse 1.2s ease-out}
@keyframes avpulse{30%{box-shadow:0 0 0 6px color-mix(in srgb,var(--accent) 25%,transparent),0 4px 12px rgb(0 0 0 / .15)}100%{box-shadow:0 0 0 14px transparent,0 4px 12px rgb(0 0 0 / .15)}}
.leafp{position:fixed;width:14px;height:14px;pointer-events:none;z-index:40;color:var(--sage-soft)}
.leafp svg{width:100%;height:100%;fill:currentColor;stroke:none}

/* themed heroes: one family, each with its own colour, numbers and illustration */
.hero[class*=" h-"]{--hc:#F3D9A8}
.hero .hero-art.ta{opacity:1;right:-4px;top:-4px;width:186px;height:146px;color:var(--hc)}
.hero.h-today{--hc:#FFB27A}
.hero.h-food{background:linear-gradient(158deg,#7B4024 0%,#4C2716 58%,#381D12 100%);--hc:#FFB98A}
.hero.h-activity{background:linear-gradient(158deg,#205459 0%,#163A3D 58%,#10292B 100%);--hc:#86DCD4}
.hero.h-weight{background:linear-gradient(158deg,#57465F 0%,#3B3043 58%,#2B2331 100%);--hc:#E6C9F2}
.hero.h-workout{background:linear-gradient(158deg,#3E6C44 0%,#28462C 58%,#1C3220 100%);--hc:#C8EE9C}
.hero.h-injury{background:linear-gradient(158deg,#7C3B45 0%,#50252C 58%,#3A1A20 100%);--hc:#FFC3CA}
.hero.h-work{background:linear-gradient(158deg,#6E5C2B 0%,#483B1B 58%,#33290F 100%);--hc:#FFD68C}
.hero.h-mind{background:linear-gradient(158deg,#4B4068 0%,#312946 58%,#231D33 100%);--hc:#D8C8FF}
.hero.h-food .big{font:800 58px/1 var(--ui);letter-spacing:-.035em}
.hero.h-activity .big{font:700 54px/1 var(--mono);letter-spacing:-.05em}
.hero.h-weight .big{font:italic 500 66px/1 var(--serif);letter-spacing:-.02em}
.hero.h-injury .big{font:800 62px/1 var(--ui);letter-spacing:-.03em}
.hero.h-work .big{font:500 62px/1 var(--serif);letter-spacing:-.02em}
.hero.h-mind .big{font:700 58px/1 var(--ui);letter-spacing:-.03em}
.hero[class*=" h-"]:not(.h-today) .pill.light{background:var(--hc);color:#211A14}
.hero[class*=" h-"]:not(.h-today) .segs i.on,.hero[class*=" h-"]:not(.h-today) .mbar i{background:var(--hc)}
.hero[class*=" h-"]:not(.h-today) .hero-stats b{color:var(--hc)}
.hero .hk{display:inline-flex;align-items:center;gap:6px}
.hero .hk svg{width:13px;height:13px;stroke:var(--hc);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}

/* botanical footer at the end of each page */
.sprig{display:flex;flex-direction:column;align-items:center;gap:6px;margin:34px 0 8px;color:var(--muted);opacity:.85}
.sprig svg{width:120px;height:44px;color:var(--sage-soft)}
.sprig span{font:italic 500 14px var(--serif)}

/* ---------- food ---------- */
.hero .mbar,.fd-m .mbar{display:block!important;min-height:0!important;height:5px!important;padding:0;grid-template-columns:none}
.fd-nav .l{transform:rotate(90deg)}.fd-nav .r{transform:rotate(-90deg)}
.hero.h-workout .hero-art.ta{width:150px;height:118px}
.fdc{padding:18px 16px 14px}
.fdc .fd-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;min-height:32px}
.fd-left{display:grid;min-width:0;flex:1}.fdv{grid-area:1/1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:opacity .3s,transform .35s cubic-bezier(.22,1,.36,1)}
.fd-when{opacity:.7}
.fdc .vw{opacity:0;transform:translateY(8px);pointer-events:none}
.fdc[data-pg="1"] .vd{opacity:0;transform:translateY(-8px)}.fdc[data-pg="1"] .vw{opacity:1;transform:none}
.fdp .wkv{display:none;background:none!important;padding:0!important;border-radius:0!important;box-shadow:none!important}.fdp .dn,.fdp .wkv{transition:opacity .3s}
.fdc[data-pg="1"] .fdp .dn{display:none}.fdc[data-pg="1"] .fdp .wkv{display:block;font:700 13px/1 var(--mono)}.fdp .wkv.z{opacity:.4}
.fdc[data-pg="1"] .fdp.on{background:none;border-color:rgb(255 255 255 / .22)}
.fdp.fut{border-style:dashed;opacity:.8}
.fd-sep{height:1px;background:rgb(255 255 255 / .13);margin:0 0 12px}
.fd-week+.fd-sep{margin:14px 0 0}
.fd-pg>div{min-width:0}
.fd-pg>div+div{border-left:1px solid rgb(255 255 255 / .13);padding-left:10px}
.fd-l{font:600 11px/1.2 var(--ui);color:rgb(243 240 230 / .72);margin-bottom:5px;white-space:nowrap}
.fd-s{text-align:center}.fd-s b{display:block;font:700 17px/1.1 var(--mono);white-space:nowrap}.fd-s small{display:block;font:500 11px var(--ui);opacity:.65;margin-top:3px;white-space:nowrap}
details.fd-wk .fdw{overflow:hidden}
.fdc .fd-left{font:italic 500 19px/1.2 var(--serif)}
.fdc .fd-left b{font:800 24px var(--ui);font-style:normal;letter-spacing:-.02em;color:var(--hc)}
.fd-nav{display:flex;gap:4px;align-items:center}
.fd-nav button{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:rgb(255 255 255 / .1);color:inherit}
.fd-nav button svg{width:15px;height:15px}
.fd-nav .fd-td{width:auto;padding:0 10px;border-radius:15px;font:700 12px var(--ui)}
.fd-week{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;touch-action:pan-y}
.fdp{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;height:62px;border-radius:999px;border:1.5px solid rgb(255 255 255 / .22);overflow:hidden;color:inherit;transition:transform .25s,border-color .25s,background .25s}
.fdp>*{position:relative}
.fdp .fill{position:absolute;left:0;right:0;bottom:0;height:var(--f,0%);background:linear-gradient(to top,color-mix(in srgb,var(--hc) 55%,transparent),color-mix(in srgb,var(--hc) 18%,transparent));transition:height .5s cubic-bezier(.22,1,.36,1)}
.fdp.over .fill{background:linear-gradient(to top,rgb(240 109 68 / .75),rgb(240 109 68 / .25))}
.fdp b{font:600 16px/1 var(--ui)}
.fdp span{font:500 11px/1 var(--ui);opacity:.75}
.fdp.on{background:rgb(255 255 255 / .16);border-color:rgb(255 255 255 / .75)}
.fdp.td span{opacity:1;font-weight:800;color:var(--hc,#fff)}
.fdp.td:not(.on){border-color:color-mix(in srgb,var(--hc,#fff) 70%,transparent)}
.fdp:active{transform:scale(.94)}
.fd-pager{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;margin:12px -16px 0;-webkit-overflow-scrolling:touch}
.fd-pager::-webkit-scrollbar{display:none}
.fd-pg{flex:0 0 100%;scroll-snap-align:start;padding:0 16px;box-sizing:border-box;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.fd-m b{display:block;font:700 14px var(--mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fd-m b small{font:400 11px var(--mono);opacity:.75}
.fd-g{display:block;font:500 11px var(--ui);opacity:.6;margin-top:2px;white-space:nowrap}
.fd-m .cap{color:rgb(243 240 230 / .7);font-size:10px}
.fd-m .mbar{height:4px;border-radius:2px;background:rgb(255 255 255 / .16);margin-top:6px;overflow:hidden}
.fd-m .mbar i{display:block;height:100%;border-radius:2px;background:var(--hc);transition:width .5s}
.fd-m .mbar i.over,.hero .fd-m .mbar i.over{background:#FF7A5C!important;box-shadow:0 0 8px rgb(255 122 92 / .6)}
.fd-dots{display:flex;justify-content:center;gap:6px;margin-top:12px}
.fd-dots i{width:6px;height:6px;border-radius:50%;background:rgb(255 255 255 / .3);transition:background .25s,transform .25s}
.fd-dots i.on{background:#fff;transform:scale(1.15)}
.fd-search{display:flex;align-items:center;gap:10px;width:100%;margin-top:12px;height:52px;border-radius:26px;padding:0 8px 0 18px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--card-shadow);color:var(--muted);font:500 16px var(--ui);text-align:left}
.fd-search svg{width:19px;height:19px;flex:none}
.fd-search span{flex:1}
.fd-search .sc.ai{color:var(--accent)}
.fd-search .sc+.sc{margin-left:-4px}
.fd-search .sc{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:var(--surface2);color:var(--ink)}
details.fd-wk{margin-top:12px;border-radius:var(--r-l);overflow:hidden}
details.fd-wk summary{list-style:none;display:flex;align-items:center;gap:10px;padding:14px 16px;cursor:pointer}
details.fd-wk summary::-webkit-details-marker{display:none}
details.fd-wk summary b{font:500 17px var(--serif)}
details.fd-wk summary .grow{flex:1}
details.fd-wk summary .chev{width:16px;height:16px;transition:transform .3s}
details.fd-wk[open] summary .chev{transform:rotate(180deg)}
.fdw{padding:0 14px 16px}
.fdw-grid{display:grid;grid-template-columns:20px repeat(7,1fr) 62px;gap:6px 6px;align-items:end}
.fdw-c{height:40px;border-radius:7px;background:var(--surface2);position:relative;overflow:hidden;margin:0 2px}
.fdw-c i{position:absolute;left:0;right:0;bottom:0;background:var(--k,var(--accent));opacity:.85;transition:height .5s cubic-bezier(.22,1,.36,1)}
.fdw-c.zero::after{content:"";position:absolute;top:6px;left:50%;width:8px;height:2px;margin-left:-4px;border-radius:1px;background:var(--muted);opacity:.6}
.fdw-col{display:contents}
.fdw-tot{font:700 15px var(--mono);line-height:1.1;padding-left:4px}
.fdw-tot small{display:block;font:500 11px var(--ui);color:var(--muted);white-space:nowrap}
.fdw-rl{font:800 12px var(--ui);align-self:center;text-align:center}
.fdw-d{text-align:center;font:500 12px var(--ui);color:var(--muted);padding-top:4px}
.fdw-d.on{color:var(--ink);font-weight:800}
.fdw-sel{position:relative}
.fdw-wrap{position:relative}
.fdw-hl{position:absolute;top:-6px;bottom:-4px;border:1.5px solid var(--ink2);border-radius:10px;pointer-events:none;transition:left .35s cubic-bezier(.22,1,.36,1)}
.fdw-hit{position:absolute;top:-6px;bottom:-4px;background:none}
.fdw-seg{display:flex;justify-content:center;margin-top:16px}.fdw-seg .seg2{width:min(260px,100%)}
.fd-tl{position:relative;padding-left:4px}
.fd-tl::before{content:"";position:absolute;left:21px;top:16px;bottom:18px;width:1.5px;background:var(--line)}
.fd-meal{position:relative;margin-bottom:12px}
.fd-node{display:flex;align-items:center;gap:8px;margin-bottom:8px;position:relative}
.fd-pill{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:15px;background:var(--surface2);font:700 13px var(--ui);color:var(--ink)}
.fd-pill i{width:7px;height:7px;border-radius:50%;background:var(--k,var(--accent))}
.fd-node .cap{margin-left:auto}
.fd-node .fd-add{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:var(--surface2);color:var(--ink)}
.fd-node .fd-add svg{width:15px;height:15px}
.fd-meal.none .fd-pill{background:transparent;border:1px solid var(--line);color:var(--muted);font-weight:600}
.fd-meal .list{margin-left:34px}
.fd-sum{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:4px;padding:14px 16px}
.fd-sum div b{display:block;font:700 16px var(--mono)}

/* ---------- swipe actions on any list row ---------- */
li.row{position:relative;touch-action:pan-y;overflow:hidden}
li.row>:not(.swa){transform:translateX(var(--sx,0px));transition:transform .38s cubic-bezier(.22,1,.36,1)}
li.row.swiping>:not(.swa){transition:none}
.swa{position:absolute;top:0;bottom:0;right:0;display:flex;align-items:stretch;width:var(--sw,0px);transform:translateX(calc(var(--sw,0px) + var(--sx,0px)));transition:transform .38s cubic-bezier(.22,1,.36,1)}
li.row.swiping .swa{transition:none}
.swa button{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font:700 11px var(--ui);color:#fff;min-width:0}
.swa button svg{width:20px;height:20px}
.swa .s-edit{background:#5F7F6C}
.swa .s-del{background:#C9473A}
.swa .s-undo{background:#C98A3A}
.swa .s-open{background:#4F6F8F}
li.row.gone{transition:height .3s ease,opacity .25s ease,padding .3s ease;opacity:0;padding-top:0!important;padding-bottom:0!important;min-height:0!important}

/* done items stay, with a line drawn through them */
.row .rt{background-image:linear-gradient(currentColor,currentColor);background-repeat:no-repeat;background-position:0 58%;background-size:0 1.6px;transition:background-size .5s cubic-bezier(.65,0,.35,1),color .3s,opacity .3s}
.row.done .rt{text-decoration:none!important;background-size:100% 1.6px;opacity:.6}
.row.done .meta{opacity:.5}
.row.done .rt{display:inline}
.row .rowbtn .rt{max-width:100%}

/* toast with an action button */
.toast.act{pointer-events:auto;display:flex;align-items:center;gap:14px;padding:8px 8px 8px 18px}
.toast.act button{background:rgb(0 0 0 / .14);color:inherit;font:800 14px var(--ui);padding:8px 14px;border-radius:14px}

/* tab bar highlight: no jump to the first tab while it flickers */
#ind.glitch{animation-name:glitchInd}
@keyframes glitchInd{0%{opacity:1;filter:none}12%{opacity:.4;filter:brightness(1.6)}18%{opacity:1}30%{opacity:.6;filter:hue-rotate(20deg) brightness(1.3)}40%{opacity:1;filter:none}100%{opacity:1;filter:none}}

/* focus pill: drag it anywhere, it settles into the nearest corner or edge */
#fcPill.dr{left:0!important;top:0!important;right:auto!important;bottom:auto!important;touch-action:none;transition:transform .5s cubic-bezier(.2,1.25,.35,1),box-shadow .25s}
#fcPill.dr.drag{transition:box-shadow .25s;box-shadow:0 18px 40px rgb(0 0 0 / .45)}
</style>`);

/* ---------- toast with Undo ---------- */
function toastAct(msg,label,fn){
  $$('.toast').forEach(t=>t.remove());
  const t=document.createElement('div');t.className='toast act';t.setAttribute('role','status');
  t.innerHTML=`<span>${esc(msg)}</span><button type="button">${esc(label)}</button>`;document.body.appendChild(t);
  let gone=false;const kill=()=>{if(gone)return;gone=true;t.style.transition='opacity .3s';t.style.opacity='0';setTimeout(()=>t.remove(),300)};
  t.querySelector('button').addEventListener('click',e=>{e.stopPropagation();kill();try{fn()}catch(x){}});
  setTimeout(kill,5200);
}

/* ---------- botanical illustrations (inline SVG, use the hero's colour) ---------- */
const ARTS={
  'h-today':`<circle cx="148" cy="46" r="24" fill="currentColor" opacity=".9"/><circle cx="148" cy="46" r="36" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-dasharray="2 7" stroke-linecap="round" stroke-width="3"/><circle cx="148" cy="46" r="52" fill="none" stroke="#fff" stroke-opacity=".12"/>
    <path d="M70 156C92 120 120 96 176 82" fill="none" stroke="#DDEBD9" stroke-opacity=".55" stroke-width="2"/>
    ${[[92,124,-40],[108,110,-30],[126,99,-25],[146,91,-15],[164,85,-10]].map(([x,y,r],i)=>`<ellipse cx="${x}" cy="${y-9}" rx="5" ry="11" transform="rotate(${r} ${x} ${y})" fill="#BFD9B8" fill-opacity="${.5+i*.06}"/><ellipse cx="${x+9}" cy="${y+6}" rx="5" ry="10" transform="rotate(${r+75} ${x} ${y})" fill="#9CC49A" fill-opacity="${.45+i*.05}"/>`).join('')}`,
  'h-food':`<circle cx="146" cy="50" r="30" fill="currentColor" opacity=".85"/><circle cx="146" cy="50" r="23" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2"/>${[0,45,90,135].map(a=>`<path d="M146 50 L${(146+23*Math.cos(a*Math.PI/180)).toFixed(1)} ${(50+23*Math.sin(a*Math.PI/180)).toFixed(1)}M146 50 L${(146-23*Math.cos(a*Math.PI/180)).toFixed(1)} ${(50-23*Math.sin(a*Math.PI/180)).toFixed(1)}" stroke="#fff" stroke-opacity=".45" stroke-width="1.5"/>`).join('')}
    <path d="M96 150C100 118 108 92 122 70" fill="none" stroke="#F1D7A6" stroke-opacity=".7" stroke-width="2"/>${[[100,128],[103,114],[107,100],[112,88],[118,77]].map(([x,y],i)=>`<ellipse cx="${x-6}" cy="${y}" rx="3.5" ry="7.5" transform="rotate(-35 ${x-6} ${y})" fill="#F1D7A6" fill-opacity=".7"/><ellipse cx="${x+5}" cy="${y-3}" rx="3.5" ry="7.5" transform="rotate(30 ${x+5} ${y-3})" fill="#F1D7A6" fill-opacity=".6"/>`).join('')}
    <path d="M168 104c10-14 24-16 30-14-2 12-14 22-30 14z" fill="#A7C79A" fill-opacity=".65"/>`,
  'h-activity':`${[0,1,2,3,4].map(i=>`<path d="M${70+i*6} ${130-i*4}C${90+i*4} ${60+i*10} ${150-i*3} ${20+i*12} ${200} ${40+i*9}" fill="none" stroke="currentColor" stroke-opacity="${.18+i*.1}" stroke-width="1.6"/>`).join('')}
    <path d="M86 150C110 120 120 104 146 96S186 70 196 52" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2.4" stroke-dasharray="1 8" stroke-linecap="round"/><circle cx="146" cy="96" r="6" fill="currentColor"/><circle cx="146" cy="96" r="13" fill="none" stroke="currentColor" stroke-opacity=".4"/>`,
  'h-weight':`<path d="M70 140H200" stroke="#fff" stroke-opacity=".25" stroke-width="2"/><ellipse cx="146" cy="128" rx="34" ry="12" fill="currentColor" opacity=".55"/><ellipse cx="144" cy="106" rx="26" ry="10" fill="currentColor" opacity=".7"/><ellipse cx="147" cy="88" rx="18" ry="8" fill="currentColor" opacity=".85"/><ellipse cx="145" cy="74" rx="11" ry="6" fill="#fff" opacity=".8"/>
    <path d="M145 68V46" stroke="#B9D7AE" stroke-width="2"/><path d="M145 54c-12-2-16-12-15-18 10 0 16 8 15 18zM145 50c10-4 18-2 22 4-8 6-18 4-22-4z" fill="#B9D7AE" fill-opacity=".85"/>`,
  'h-workout':`<circle cx="150" cy="40" r="16" fill="currentColor" opacity=".9"/><path d="M60 150L110 80l26 34 24-44 46 80z" fill="#fff" fill-opacity=".12" stroke="#fff" stroke-opacity=".35" stroke-width="1.5" stroke-linejoin="round"/><path d="M110 80l10 13 8-6 8 15M160 70l10 18 8-4" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.5"/>
    ${[[84,150,22],[98,152,16],[186,152,20]].map(([x,y,h])=>`<path d="M${x} ${y-h}l-7 ${h*.55}h4l-6 ${h*.45}h18l-6-${h*.45}h4z" fill="currentColor" opacity=".75"/>`).join('')}`,
  'h-injury':`<path d="M64 96h34l10-24 14 46 12-34 8 12h58" fill="none" stroke="currentColor" stroke-opacity=".85" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><g transform="rotate(-30 156 56)"><rect x="126" y="44" width="60" height="24" rx="12" fill="#fff" fill-opacity=".22" stroke="#fff" stroke-opacity=".5"/><rect x="146" y="44" width="20" height="24" fill="#fff" fill-opacity=".25"/>${[0,1,2,3].map(i=>`<circle cx="${151+(i%2)*10}" cy="${51+Math.floor(i/2)*10}" r="1.6" fill="#fff" fill-opacity=".6"/>`).join('')}</g><path d="M176 132c4-16 16-22 24-22-2 12-10 22-24 22zM176 132c-6-12-2-22 4-26 6 8 4 20-4 26z" fill="#B9D7AE" fill-opacity=".8"/>`,
  'h-work':`<rect x="104" y="116" width="44" height="18" rx="4" fill="currentColor" opacity=".45"/><rect x="118" y="98" width="44" height="18" rx="4" fill="currentColor" opacity=".65"/><rect x="132" y="80" width="44" height="18" rx="4" fill="currentColor" opacity=".85"/><path d="M160 80V52" stroke="#B9D7AE" stroke-width="2.2"/><path d="M160 62c-14-2-19-14-18-22 12 0 19 10 18 22zM160 58c12-6 22-4 27 4-10 7-22 5-27-4z" fill="#B9D7AE" fill-opacity=".9"/><circle cx="96" cy="44" r="3" fill="#fff" fill-opacity=".5"/><circle cx="190" cy="30" r="2" fill="#fff" fill-opacity=".5"/>`,
  'h-mind':`<path d="M146 30a26 26 0 0 0-15 47c3 3 5 7 5 11v6h20v-6c0-4 2-8 5-11a26 26 0 0 0-15-47z" fill="currentColor" fill-opacity=".3" stroke="currentColor" stroke-width="2"/><path d="M138 102h16M140 109h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M146 58c4-6 4-12 0-16" stroke="#fff" stroke-opacity=".7" stroke-width="1.6" fill="none"/>
    <path d="M118 140c10-24 4-44-10-60" fill="none" stroke="#B9D7AE" stroke-opacity=".75" stroke-width="1.8"/>${[[112,126,-20],[116,108,30],[110,92,-30]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="4.5" ry="9" transform="rotate(${r} ${x} ${y})" fill="#B9D7AE" fill-opacity=".8"/>`).join('')}`
};
function themedArt(t){const a=ARTS[t];return a?`<svg class="hero-art ta" viewBox="0 0 200 156" aria-hidden="true">${a}</svg>`:''}
let HERO_T='';
function curTheme(){if(HERO_T)return HERO_T;const t=state.tab;return t==='health'?'h-'+state.sub.health:t==='work'?'h-work':t==='mind'?'h-mind':'h-today'}
function themeHero(h,t){t=t||curTheme();return h.replace('<section class="hero">',`<section class="hero ${t}" data-ph="${t}">`).replace(/<svg class="hero-art"[\s\S]*?<\/svg>/,themedArt(t))}
const _heroBanner=heroBanner;heroBanner=function(){return themeHero(_heroBanner.apply(null,arguments))};
const _heroCard=heroCard;heroCard=function(d){return themeHero(_heroCard(d),'h-today')};

const SPRIG=`<svg viewBox="0 0 120 44" aria-hidden="true"><path d="M8 38c30-6 62-8 104-2" fill="none" stroke="currentColor" stroke-opacity=".45" stroke-width="1.4"/><path d="M60 37V12" stroke="currentColor" stroke-width="1.6"/><path d="M60 22c-10-1-14-9-13-15 9 0 14 7 13 15zM60 18c8-5 15-4 19 2-7 5-15 4-19-2zM60 30c-7-2-10-7-9-12 6 1 10 6 9 12z" fill="currentColor" fill-opacity=".75"/><circle cx="30" cy="34" r="1.6" fill="currentColor" fill-opacity=".5"/><circle cx="92" cy="33" r="1.6" fill="currentColor" fill-opacity=".5"/></svg>`;
const SPRIG_LINES={today:'Grow a little every day.',plan:'One block at a time.',work:'Small steps, steady roots.',health:'Fuel, move, rest, repeat.',mind:'Plant the idea. Tend it later.'};
const sprig=k=>`<div class="sprig" aria-hidden="true">${SPRIG}<span>${SPRIG_LINES[k]||''}</span></div>`;
const _vPlan=viewPlan;viewPlan=function(){return _vPlan()+sprig('plan')};
const _vWork=viewWork;viewWork=function(){return _vWork()+sprig('work')};
const _vMind=viewMind;viewMind=function(){return _vMind()+sprig('mind')};

/* ---------- Today: due this week keeps what you ticked, crossed out ---------- */
function dueWeek(){
  const open=[...db.entries.filter(e=>(e.type==='task'||e.type==='reminder')&&!e.done&&e.due&&dayDiff(e.due)<=7),...extDue(0,7)].sort(byDue);
  const since=Date.now()-7*864e5;
  const done=db.entries.filter(e=>(e.type==='task'||e.type==='reminder')&&e.done&&e.due&&dayDiff(e.due)<=7&&dayDiff(e.due)>=-7&&(e.doneAt||0)>since).sort((a,b)=>(b.doneAt||0)-(a.doneAt||0));
  const xd=[];if(typeof extOn==='function')for(let i=-1;i<=7;i++){const d=addDays(i);extOn(d).filter(e=>e.allDay&&e.date===d&&isExtDone(e)).forEach(e=>{if(!xd.some(x=>x.xid===e.xid))xd.push({...e,due:d})})}
  return[...open,...done,...xd];
}
/* true while the passcode screen is up (data not decrypted yet): nothing may save or import then */
function uiLocked(){try{if(typeof isLocked==='function')return!!isLocked();return!!(typeof LOCKED_BLOB!=='undefined'&&LOCKED_BLOB&&!(typeof LOCK!=='undefined'&&LOCK.key))}catch(e){return false}}
/* more.js (built before this file) wraps viewToday to add the quick-capture bar, "Coming up" and Insights.
   This file replaces Today's body, so re-apply that injection here, but only if more.js really ran first
   (if the build order ever changes, more.js wraps this version itself and adds them once). */
const _vtPrev2=viewToday,_vtMoreFirst=/_viewTodayM/.test(String(_vtPrev2));
function todayMoreInject(h){
  const H=new Set(db.settings.todayHide||[]),on=k=>!H.has(k);
  const hero=h.indexOf('<section class="hero'),afterHero=hero<0?0:h.indexOf('</section>',hero)+10;
  const inject=(on('quick')&&typeof quickBar==='function'?quickBar('qcToday'):'')+(on('coming')&&typeof comingUp==='function'?comingUp():'');
  h=h.slice(0,afterHero)+inject+h.slice(afterHero);
  if(on('insights')&&typeof insightSection==='function'){const i=h.indexOf('<section class="sec"><div class="sec-h"><h2>Due');const ins=insightSection();h=i<0?h+ins:h.slice(0,i)+ins+h.slice(i)}
  return h}
const _vtBody2=function(){
  const td=today(),due=dueWeek(),food=of('food').filter(e=>e.date===td),inj=of('injury').filter(e=>e.status!=='Healed');
  const H=new Set(db.settings.todayHide||[]),on=k=>!H.has(k);
  const bk=typeof meta!=='undefined'&&Date.now()-(meta.lastFile||0)>7*864e5&&!(meta.snoozeBk>Date.now());
  const openN=due.filter(e=>!(e.done||(e.type==='ext'&&isExtDone(e)))).length;
  return(bk?`<div class="banner bkb">${ic('cloud')}<span style="flex:1;min-width:0">${meta.lastFile?`Last backup ${ago(meta.lastFile)}.`:'No backup yet.'} Deleting Life from the Home Screen deletes your data.</span><button data-bk="save">Save to Files</button><button data-bk="later" class="bkx" aria-label="Remind me in 2 days">${ic('close')}</button></div>`:'')
    +heroCard(td)
    +(on('chips')?chipsAdd(['food','task','workout','weight','reminder','note','idea','scrap']):'')
    +(on('habits')?habitSection():'')
    +(on('progress')?section('Your <em>progress</em>',tiles()+healthTiles(),`<button class="link" id="reviewBtn">${ic('review')}Week</button>`):'')
    +(on('mail')?mailSection():'')
    +(on('due')?section('Due <em>this week</em>',list(due,'Nothing due in the next 7 days.'),`<span class="cap">${openN} open</span>`):'')
    +(on('sched')?section('Today’s <em>schedule</em>',timeline(dayItems(td).filter(e=>!e.allDay)),`<button class="link" data-goto="plan">Week</button>`):'')
    +(on('eaten')?section('Eaten <em>today</em>',list(food,'Nothing logged yet.'),`<span class="cap num">${fmtN(sumKcal(food))} kcal</span>`):'')
    +(on('streak')?heatmap('log','Logging <em>streak</em>',s=>logCounts()[s]||0,'entries'):'')
    +(on('weight')?section('Weight',weightCard()):'')
    +(on('inj')&&inj.length?section('Injuries',list(inj,'')):'')
    +sprig('today');
};
viewToday=function(){const h=_vtBody2();if(!_vtMoreFirst)return h;try{return todayMoreInject(h)}catch(e){return h}};
/* rows know who they are, so swipe actions can find them; finished calendar items render crossed out */
const _row=row;row=function(e){let h=_row(e);if(e.type==='ext'&&isExtDone(e)&&!/<li class="row done/.test(h))h=h.replace('<li class="row','<li class="row done');
  const sid=e.type==='ext'?'x:'+(e.xid||''):e.id;const u=(e.type==='reminder'||e.type==='task')&&!e.done&&+e.urg?` urg${+e.urg}`:'';return h.replace('<li class="row',`<li data-sid="${esc(sid)}" class="row${u}`)};

/* ticking a row: it stays where it is and a line draws through it; Undo in the toast or by swiping */
function setDone(sid,val,rowEl){
  if(sid.startsWith('x:')){const x=extDone(),k=sid.slice(2);if(val)x[k]=Date.now();else delete x[k];save()}
  else{const e=find(sid);if(!e)return;e.done=val;e.doneAt=Date.now();save()}
  if(rowEl){rowEl.classList.toggle('done',val);const c=rowEl.querySelector('.chk');if(c){c.classList.toggle('on',val);if(val)anim(c.querySelector('i'),{scale:[.5,1]},{spring:true,k:600,d:14})}}
  if(val)tick();
  clearTimeout(setDone.t);setDone.t=setTimeout(()=>render(false),rowEl?650:0);
}
document.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-chk],[data-xdone]');if(!b||b.closest('.sheet')&&!b.closest('.row'))return;
  if(!b.closest('.row'))return;
  ev.stopImmediatePropagation();ev.preventDefault();
  const r=b.closest('.row'),sid=b.dataset.chk||('x:'+b.dataset.xdone),was=r.classList.contains('done');
  setDone(sid,!was,r);
  toastAct(!was?'Done':'Back on your list','Undo',()=>setDone(sid,was,null));
},true);

/* ---------- swipe a row left: Edit · Delete (or Undo for finished ones) ---------- */
let SW=null,SWO=null,SWBLOCK=0;
function swActions(r){
  const sid=r.dataset.sid||'';const ext=sid.startsWith('x:'),done=r.classList.contains('done');
  const e=ext?null:find(sid);const a=[];
  if(done)a.push(['undo','s-undo',ext?'restore':'undo','Bring back']);
  if(ext)a.push(['open','s-open','arrow','Open']);
  else if(e){a.push(['edit','s-edit','edit','Edit']);a.push(['del','s-del','trash','Delete'])}
  return a;
}
function swEnsure(r){let s=r.querySelector(':scope>.swa');if(s)return s;const a=swActions(r);if(!a.length)return null;
  s=document.createElement('div');s.className='swa';s.innerHTML=a.map(([k,c,i,l])=>`<button type="button" class="${c}" data-swact="${k}" aria-label="${l}">${ic(i)}<span>${l}</span></button>`).join('');
  r.appendChild(s);const w=a.length*74;r.style.setProperty('--sw',w+'px');r.dataset.sww=w;return s}
function swEnsureL(r){let s=r.querySelector(':scope>.swl');if(s)return s;const e=find(r.dataset.sid||'');if(!e||!(e.type==='reminder'||e.type==='task')||e.done)return null;
  const cur=+e.urg||0;s=document.createElement('div');s.className='swl';
  s.innerHTML=[[0,'None'],[1,'Low'],[2,'Medium'],[3,'High']].map(([n,l])=>`<button type="button" class="u${n}${cur===n?' on':''}" data-urg="${n}" aria-label="Urgency ${l}"><b>${n?'!'.repeat(n):'–'}</b><span>${l}</span></button>`).join('');
  r.appendChild(s);r.style.setProperty('--swl','256px');r.dataset.swlw=256;return s}
function swSet(r,x){r.style.setProperty('--sx',x+'px')}
function swClose(r){if(!r)return;swSet(r,0);if(SWO&&SWO===r)SWO=null;setTimeout(()=>{if(r!==SWO&&!r.classList.contains('swiping')){const s=r.querySelector(':scope>.swa');if(getComputedStyle(r).getPropertyValue('--sx').trim()==='0px'){if(s)s.remove();const l=r.querySelector(':scope>.swl');if(l)l.remove();delete r.dataset.side}}},420)}
document.addEventListener('pointerdown',e=>{
  const r=e.target.closest('li.row[data-sid]');
  if(SWO&&r!==SWO&&!e.target.closest('.swa,.swl'))swClose(SWO);
  if(!r||e.target.closest('.swa,.swl')||(e.pointerType==='mouse'&&e.button!==0))return;
  SW={r,x0:e.clientX,y0:e.clientY,base:r===SWO?(r.dataset.side==='l'?(+r.dataset.swlw||0):-(+r.dataset.sww||0)):0,dir:0,t:performance.now(),lx:e.clientX,v:0};
},{passive:true});
document.addEventListener('pointermove',e=>{
  if(!SW)return;const dx=e.clientX-SW.x0,dy=e.clientY-SW.y0;
  if(!SW.dir){if(Math.abs(dx)>9&&Math.abs(dx)>Math.abs(dy)*1.25){const R=SW.base+dx>0;if(R?!swEnsureL(SW.r):!swEnsure(SW.r)){SW=null;return}SW.dir=1;SW.r.classList.add('swiping');try{SW.r.setPointerCapture(e.pointerId)}catch(x){}}
    else if(Math.abs(dy)>9){SW=null;return}else return}
  const w=+SW.r.dataset.sww||0,wl=SW.r.querySelector(':scope>.swl')?(+SW.r.dataset.swlw||0):0;let x=SW.base+dx;if(x>0){if(!wl)x=x*.2;else if(x>wl)x=wl+(x-wl)*.3}if(x<-w)x=-w+(x+w)*.3;if(x<0&&!SW.r.querySelector(':scope>.swa')&&!swEnsure(SW.r))x=x*.2;
  const now=performance.now();SW.v=(e.clientX-SW.lx)/Math.max(1,now-SW.t);SW.t=now;SW.lx=e.clientX;swSet(SW.r,Math.round(x));SW.x=x;
},{passive:true});
function swEnd(){if(!SW)return;const s=SW;SW=null;if(!s.dir)return;s.r.classList.remove('swiping');SWBLOCK=Date.now();
  const w=+s.r.dataset.sww||0,wl=+s.r.dataset.swlw||0,open=(s.x<-w*.4&&s.v<.4)||s.v<-.5,openL=wl&&s.r.querySelector(':scope>.swl')&&((s.x>wl*.4&&s.v>-.4)||s.v>.5);
  if(openL){swSet(s.r,wl);SWO=s.r;s.r.dataset.side='l'}else if(open&&w){swSet(s.r,-w);SWO=s.r;s.r.dataset.side='r'}else swClose(s.r)}
document.addEventListener('pointerup',swEnd,{passive:true});document.addEventListener('pointercancel',swEnd,{passive:true});
document.addEventListener('click',e=>{if(Date.now()-SWBLOCK<350&&e.target.closest('li.row')&&!e.target.closest('.swa')){e.stopImmediatePropagation();e.preventDefault()}},true);
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-swact]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();
  const r=b.closest('li.row'),sid=r.dataset.sid,k=b.dataset.swact;
  if(k==='undo'){swClose(r);setDone(sid,false,r);toastAct('Back on your list','Undo',()=>setDone(sid,true,null));return}
  if(k==='open'){swClose(r);openDetail(sid.startsWith('x:')?(r.querySelector('[data-open]')||{}).dataset?.open:sid);return}
  if(k==='edit'){swClose(r);const x=find(sid);if(x)openForm(x.type,x.id);return}
  if(k==='del'){
    const i=db.entries.findIndex(x=>x.id===sid);if(i<0)return;const[x]=db.entries.splice(i,1);
    r.style.height=r.offsetHeight+'px';void r.offsetWidth;r.classList.add('gone');r.style.height='0px';
    save();if(navigator.vibrate)try{navigator.vibrate(8)}catch(y){}
    setTimeout(()=>render(false),300);
    toastAct(`Deleted ${titleOf(x)}`.slice(0,60),'Undo',()=>{if(db.tomb)delete db.tomb[x.id];db.entries.splice(Math.min(i,db.entries.length),0,x);save();render(false)});
  }
},true);

/* ---------- Health: each section keeps the app's look but has its own colour, numbers and picture ---------- */
const _viewHealth=viewHealth;
viewHealth=function(){const k=state.sub.health;HERO_T='h-'+k;try{return(k==='food'?chipsSub('health')+foodView():_viewHealth())+sprig('health')}finally{HERO_T=''}};

/* Activity: steps, sleep and resting heart rate up top, then 14-day bars for each */
const _activityView=activityView;
activityView=function(){
  if(!syncOn()||!SYNC.healthOn)return _activityView();
  const days=[...Array(14)].map((_,i)=>addDays(i-13)),H=days.map(d=>hday(d)||{});
  const h=hday(today())||{},y=hday(addDays(-1))||{},st=num(h.steps)||0,sl=num(h.sleepMin)||num(y.sleepMin)||0,hr=num(h.restingHr)||num(y.restingHr)||0;
  const rh=H.map(x=>num(x.restingHr)||0),rv=rh.filter(Boolean),r7=rh.slice(-7).filter(Boolean);
  const hero=heroBanner(`<span class="hk">${ic('workout')}Activity · today</span>`,st?fmtN(st):'—',st>=10000?'steps — <b>10k reached</b>':`steps, <b>${fmtN(Math.max(0,10000-st))}</b> to go`,[['Sleep',sl?`${(sl/60).toFixed(1)}h`:'—'],['Resting HR',hr?`${hr} bpm`:'—'],['RHR 7-day',r7.length?`${Math.round(r7.reduce((a,b)=>a+b,0)/r7.length)}`:'—']],'');
  let rest=_activityView();const tilesSec=section('<em>Today</em>',healthTiles());rest=rest.replace(tilesSec,'');
  const lo=rv.length?Math.min(...rv)-4:40,hi=rv.length?Math.max(...rv)+4:80;
  const rbars=`<div class="abars">${rh.map((v,i)=>`<div class="ab${days[i]===today()?' td':''}" title="${esc(fmtDate(days[i]))}: ${v?v+' bpm':'no data'}"><i style="height:${v?Math.max(8,(v-lo)/(hi-lo)*100).toFixed(1):0}%;background:#E58C9A"></i><span>${wdOf(days[i]).slice(0,1)}</span></div>`).join('')}</div>`;
  const rsec=section(`Resting heart rate · <em>14 days</em>`,rv.length?`<div class="card-s rvcard"><div class="rvgrid"><div><b class="num">${r7.length?Math.round(r7.reduce((a,b)=>a+b,0)/r7.length):'—'}<small> bpm</small></b><span>7-day average</span></div><div><b class="num">${Math.min(...rv)}–${Math.max(...rv)}</b><span>14-day range</span></div></div>${rbars}<p class="small" style="margin:10px 0 0">Lower usually means better recovery. A jump of 5+ bpm over your normal can mean stress, poor sleep or getting sick.</p></div>`:`<p class="hint">No resting heart rate yet. It shows up after your Fitbit syncs a night of sleep to Google.</p>`);
  return hero+healthStatus()+rest+rsec;
};
healthStatus=function(){
  const e=(HC.err||[]).find(x=>x.part!=='restingHr')||(HC.err||[])[0],part=e&&e.part==='sleep'?'Sleep':e&&e.part==='restingHr'?'Resting heart rate':'Some Fitbit data';
  const msg=e?(e.code==='reauth'?'Fitbit sign-in expired':`${part} didn’t load`):'';
  return`<div class="hstat${e?' bad':''}"><i></i><span>${e?esc(msg):`Fitbit · ${HC.at?`updated ${esc(ago(HC.at))}`:'not loaded yet'}`}</span><button class="link" id="${e&&e.code==='reauth'?'hReconnect':'hRefresh'}">${HC.busy?'Refreshing…':e&&e.code==='reauth'?'Reconnect':e?'Retry':'Refresh'}</button></div>`};

/* ---------- Food: week at a glance, day totals, weekly grid on demand, meals on a timeline ---------- */
const FD={day:null,wk:false,mode:'c',page:0};
const fdDay=()=>FD.day||today();
function dayTot(d){const a=of('food').filter(e=>e.date===d);return{a,k:sumKcal(a),p:sumProt(a),f:a.reduce((s,e)=>s+num(e.fat),0),c:a.reduce((s,e)=>s+num(e.carbs),0)}}
const MEALS=[['Breakfast','#F2B66D'],['Lunch','#8FCB8B'],['Dinner','#E5876A'],['Snack','#B9A6E8']];
function mealOf(e){if(e.meal&&MEALS.some(m=>m[0]===e.meal))return e.meal;const h=e.time?+e.time.split(':')[0]:12;return h<11?'Breakfast':h<15?'Lunch':h<21?'Dinner':'Snack'}
function foodView(){
  const g=db.settings,d=fdDay(),days=weekDays(d),T=dayTot(d),left=g.kcal-T.k;
  const wt=days.map(dayTot),logged=wt.filter(x=>x.a.length),sum=k=>wt.reduce((s,x)=>s+x[k],0),avg=k=>logged.length?sum(k)/logged.length:0;
  const thisWk=days.includes(today());
  const kfmt=v=>v>=1000?(v/1000).toFixed(1).replace(/\.0$/,'')+'k':v?String(Math.round(v)):'0';
  const pills=days.map((x,i)=>{const t=wt[i],f=Math.min(100,t.k/g.kcal*100);return`<button class="fdp${x===d?' on':''}${x===today()?' td':''}${t.k>g.kcal?' over':''}${x>today()?' fut':''}" data-fdday="${esc(x)}" aria-pressed="${x===d}" aria-label="${esc(fmtLong(x))}: ${fmtN(t.k)} kcal" style="--f:${f.toFixed(1)}%"><i class="fill"></i><b class="num dn">${+x.slice(8)}</b><b class="num wkv${t.k?'':' z'}">${kfmt(t.k)}</b><span>${wdOf(x).slice(0,2)}</span></button>`}).join('');
  const mac=(lab,v,goal,unit='g')=>`<div class="fd-m"><div class="fd-l">${lab}</div><b>${fmtN(v)}${unit&&v?`<small>${unit}</small>`:''}</b><small class="fd-g">of ${fmtN(goal)}${unit}</small><div class="mbar"><i class="${v>goal?'over':''}" style="width:${Math.min(100,goal?v/goal*100:0).toFixed(1)}%"></i></div></div>`;
  const stat=(lab,v,sub)=>`<div class="fd-s"><div class="fd-l">${lab}</div><b>${v}</b><small>${sub}</small></div>`;
  const label=d===today()?'Today':d===addDays(-1)?'Yesterday':d===addDays(1)?'Tomorrow':`${wdOf(d)} ${fmtDate(d)}`;
  const wkLabel=thisWk?'this week':`week of ${fmtDate(days[0])}`;
  const card=`<section class="hero h-food fdc" id="fdCard" data-pg="${FD.page}">
    <div class="fd-head"><div class="fd-left"><span class="fdv vd">${left>=0?`<b>${fmtN(left)}</b> kcal left`:`<b>${fmtN(-left)}</b> kcal over`}<span class="fd-when"> · ${esc(label.toLowerCase()==='today'?'today':label)}</span></span><span class="fdv vw"><b>${fmtN(sum('k'))}</b> kcal<span class="fd-when"> · ${esc(wkLabel)}</span></span></div>
      <div class="fd-nav">${thisWk?'':`<button class="fd-td" data-fdgo="today">Today</button>`}<button data-fdwk="-7" aria-label="Previous week">${ic('chev','i chev l')}</button><button data-fdwk="7" aria-label="Next week">${ic('chev','i chev r')}</button></div></div>
    <div class="fd-sep"></div>
    <div class="fd-week" id="fdWeek">${pills}</div>
    <div class="fd-sep"></div>
    <div class="fd-pager" id="fdPager"><div class="fd-pg">${mac('Kcal',T.k,g.kcal,'')}${mac('Protein',T.p,g.protein)}${mac('Fat',T.f,g.fat)}${mac('Carbs',T.c,g.carbs)}</div>
      <div class="fd-pg">${stat('Total',fmtN(sum('k')),'kcal')}${stat('Per day',fmtN(avg('k')),'kcal avg')}${stat('Protein',fmtN(avg('p'))+'g','per day')}${stat('Logged',`${logged.length}/7`,'days')}</div></div>
    <div class="fd-dots" id="fdDots"><i class="${FD.page?'':'on'}"></i><i class="${FD.page?'on':''}"></i></div>
  </section>`;
  const search=`<button class="fd-search" data-fdlog=""><svg class="i" viewBox="0 0 24 24">${P.search}</svg><span>Search for a food</span><i class="sc ai" data-fdai="1" aria-label="Log with AI photo">${ic('sparkles')}</i><i class="sc" data-fdscan="1" aria-label="Scan barcode">${ic('scan')}</i></button>`;
  /* weekly grid: folded away until you want it */
  const rows=[['kcal','🔥','k',g.kcal,'#F06D44'],['P','P','p',g.protein,'#E8B04B'],['F','F','f',g.fat,'#8FCB8B'],['C','C','c',g.carbs,'#7FB8E0']];
  const di=days.indexOf(d);
  const grid=`<div class="fdw-wrap"><div class="fdw-grid">${rows.map(([n,lab,k,goal,col])=>`<div class="fdw-rl" style="color:${col}">${lab}</div>`+days.map((x,i)=>{const v=wt[i][k],val=FD.mode==='c'?v:Math.max(0,goal-v),h=Math.min(100,goal?val/goal*100:0);return`<div class="fdw-c${val?'':' zero'}" style="--k:${col}"><i style="height:${h.toFixed(1)}%"></i></div>`}).join('')+`<div class="fdw-tot">${fmtN(FD.mode==='c'?T[k]:Math.max(0,goal-T[k]))}<small>of ${fmtN(goal)}</small></div>`).join('')}
    <div></div>${days.map((x,i)=>`<div class="fdw-d${i===di?' on':''}">${wdOf(x).slice(0,1)}</div>`).join('')}<div></div></div></div>
    <div class="fdw-seg"><div class="seg2" role="group" aria-label="Show"><button data-fdmode="c" aria-pressed="${FD.mode==='c'}">Consumed</button><button data-fdmode="r" aria-pressed="${FD.mode==='r'}">Remaining</button></div></div>`;
  const wk=`<details class="fd-wk card-s" id="fdWk"${FD.wk?' open':''}><summary>${ic('chart')}<b>Weekly <em>nutrition</em></b><span class="grow"></span><span class="cap num">${fmtN(avg('k'))} avg</span>${ic('chev','i chev')}</summary><div class="fdw">${grid}</div></details>`;
  /* the day: meals on a timeline, each one swipeable */
  const by={};T.a.forEach(e=>{(by[mealOf(e)]=by[mealOf(e)]||[]).push(e)});
  const tl=`<div class="fd-tl">${MEALS.map(([m,col])=>{const a=(by[m]||[]).sort((x,y)=>(x.time||'').localeCompare(y.time||'')||x.created-y.created);const k=sumKcal(a),p=sumProt(a);
    return`<div class="fd-meal${a.length?'':' none'}"><div class="fd-node"><span class="fd-pill" style="--k:${col}"><i></i>${m}</span>${a.length?`<span class="cap num">${fmtN(k)} kcal · ${fmtN(p)}P</span>`:'<span class="grow" style="flex:1"></span>'}<button class="fd-add" data-fdlog="${m}" aria-label="Add to ${m}">${ic('plus')}</button></div>${a.length?`<ul class="list card-s">${a.map(row).join('')}</ul>`:''}</div>`}).join('')}</div>`;
  const dayHead=`${d===today()?'<em>Today</em>':esc(label)}`;
  return card+search+wk+section(dayHead,T.a.length?tl+`<p class="hint" style="margin:6px 0 0;text-align:center">Swipe a food left to edit or delete it.</p>`:tl,`<span class="cap num">${fmtN(T.k)} kcal</span>`);
}
function fdRefresh(dir){
  const y=SC.scrollTop;render(false);SC.scrollTop=y;
  const pg=$('#fdPager');if(pg&&FD.page)pg.scrollLeft=pg.clientWidth;
  if(dir){const w=$('#fdWeek');if(w)anim(w,{x:[dir*40,0],opacity:[.001,1]},{duration:.35})}
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-fdday],[data-fdwk],[data-fdgo],[data-fdmode],[data-fdlog]');if(!b)return;
  e.stopImmediatePropagation();e.preventDefault();const d=b.dataset;
  if(d.fdday){FD.day=d.fdday===today()?null:d.fdday;fdRefresh(0);return}
  if(d.fdwk){FD.day=shiftDays(fdDay(),+d.fdwk);if(FD.day===today())FD.day=null;fdRefresh(Math.sign(+d.fdwk));return}
  if(d.fdgo){FD.day=null;fdRefresh(1);return}
  if(d.fdmode){FD.mode=d.fdmode;fdRefresh(0);return}
  if(d.fdlog!==undefined){openFoodLog(fdDay(),d.fdlog||null);if(e.target.closest('[data-fdai]'))setTimeout(()=>{const t=$('[data-ftab="ai"]');if(t)t.click()},60);if(e.target.closest('[data-fdscan]'))setTimeout(()=>{const t=$('[data-ftab="scan"]');if(t)t.click();setTimeout(()=>{const g=$('#scanStart');if(g)g.click()},120)},60)}
},true);
document.addEventListener('click',e=>{const sm=e.target.closest('#fdWk>summary');if(!sm)return;e.preventDefault();e.stopImmediatePropagation();
  const d=sm.parentElement,body=d.querySelector('.fdw');if(d._anim)return;
  if(!d.open){d.open=true;FD.wk=true;if(noMotion())return;const h=body.scrollHeight;d._anim=body.animate([{height:'0px',opacity:0,transform:'translateY(-6px)'},{height:h+'px',opacity:1,transform:'none'}],{duration:380,easing:'cubic-bezier(.22,1,.36,1)'});d._anim.onfinish=()=>d._anim=null}
  else{FD.wk=false;if(noMotion()){d.open=false;return}const h=body.scrollHeight;d._anim=body.animate([{height:h+'px',opacity:1},{height:'0px',opacity:0}],{duration:280,easing:'cubic-bezier(.4,0,.2,1)'});d._anim.onfinish=()=>{d.open=false;d._anim=null}}
},true);
document.addEventListener('scroll',e=>{const p=e.target;if(!p||p.id!=='fdPager')return;const i=Math.round(p.scrollLeft/Math.max(1,p.clientWidth));if(i!==FD.page){FD.page=i;$$('#fdDots i').forEach((x,j)=>x.classList.toggle('on',j===i));const c=$('#fdCard');if(c)c.dataset.pg=i}},true);
/* swipe the week strip sideways to move a week */
(function(){let s=null;
  document.addEventListener('pointerdown',e=>{const w=e.target.closest('#fdWeek');s=w?{x:e.clientX,y:e.clientY}:null},{passive:true});
  document.addEventListener('pointerup',e=>{if(!s)return;const dx=e.clientX-s.x,dy=e.clientY-s.y;s=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5){SWBLOCK=Date.now();const n=dx<0?7:-7;FD.day=shiftDays(fdDay(),n);if(FD.day===today())FD.day=null;fdRefresh(dx<0?1:-1)}},{passive:true});
  document.addEventListener('click',e=>{if(Date.now()-SWBLOCK<300&&e.target.closest('#fdWeek')){e.stopImmediatePropagation();e.preventDefault()}},true);
})();
/* logging from a past day or a specific meal puts the food there */
const _openFoodLog=openFoodLog;
openFoodLog=function(date,meal){
  if(typeof date!=='string')date=state.tab==='health'&&state.sub.health==='food'?FD.day:null;
  _openFoodLog();FL.date=date&&date!==today()?date:null;
  if(typeof meal==='string'&&meal){const m=$('#flHead input[name=flmeal]');if(m)m.value=meal;FL.meal=meal;flRefresh()}
};
const _commitLog=commitLog;
commitLog=function(){const d=FL.date;if(!d)return _commitLog();const n0=db.entries.length;_commitLog();db.entries.slice(n0).forEach(e=>{if(e.type==='food')e.date=d});FL.date=null;save();render(false)};

/* ---------- greeting: tap it and a soft light sweeps across it while the avatar rings spin once ---------- */
document.addEventListener('click',e=>{
  const h=e.target.closest('#hi');if(!h||state.tab!=='today'||SPLASHING)return;e.stopImmediatePropagation();
  if(h.classList.contains('shine')||noMotion())return;
  h.classList.add('shine');const av=$('#avBtn');if(av)av.classList.add('spin');
  setTimeout(()=>{h.classList.remove('shine');if(av)av.classList.remove('spin')},1250);
},true);

/* ---------- focus pill: drag anywhere, it snaps to the nearest of a few resting spots (like picture-in-picture) ---------- */
const PILLK='ishiros.pillspot';
function pillSpots(p){const W=innerWidth,H=innerHeight,w=p.offsetWidth,h=p.offsetHeight,m=14;
  const cs=getComputedStyle(document.documentElement),sat=parseFloat(cs.getPropertyValue('--sat'))||0;
  const dock=$('.dock'),rail=RAIL(),db_=dock&&!rail?dock.getBoundingClientRect().height+18:16;
  const tb=$('#top'),top=Math.max(m+sat,58,tb?Math.min(140,tb.getBoundingClientRect().bottom+10):0),bot=H-h-Math.max(db_,m)-(rail?0:6),lx=rail&&dock?dock.getBoundingClientRect().right+m:m,rx=W-w-m,mx=(W-w)/2,my=(H-h)/2;
  return{tl:[lx,top],tc:[mx,top],tr:[rx,top],ml:[lx,my],mr:[rx,my],bl:[lx,bot],bc:[mx,bot],br:[rx,bot]}}
function pillPlace(p,key,instant){const s=pillSpots(p),k=s[key]?key:'bc',[x,y]=s[k];if(instant){p.style.transition='none';p.style.transform=`translate(${x}px,${y}px)`;void p.offsetWidth;p.style.transition=''}else p.style.transform=`translate(${x}px,${y}px)`;p.dataset.spot=k}
function pillDrag(p){
  p._drag=1;p.classList.add('dr');let spot=lsGet(PILLK)||'bc';requestAnimationFrame(()=>pillPlace(p,spot,true));
  let s=null;
  p.addEventListener('pointerdown',e=>{const m=/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(p.style.transform)||[0,0,0];s={x0:e.clientX,y0:e.clientY,px:+m[1],py:+m[2],moved:false,t:performance.now(),lx:e.clientX,ly:e.clientY,vx:0,vy:0};try{p.setPointerCapture(e.pointerId)}catch(x){}});
  p.addEventListener('pointermove',e=>{if(!s)return;const dx=e.clientX-s.x0,dy=e.clientY-s.y0;if(!s.moved&&Math.hypot(dx,dy)<7)return;if(!s.moved){s.moved=true;p.classList.add('drag')}
    const now=performance.now(),dt=Math.max(1,now-s.t);s.vx=s.vx*.4+.6*(e.clientX-s.lx)/dt;s.vy=s.vy*.4+.6*(e.clientY-s.ly)/dt;s.t=now;s.lx=e.clientX;s.ly=e.clientY;
    p.style.transform=`translate(${s.px+dx}px,${s.py+dy}px) scale(1.06)`});
  const end=e=>{if(!s)return;const st=s;s=null;if(!st.moved)return;p.classList.remove('drag');p._moved=Date.now();
    /* where it would coast to, then the closest resting spot */
    const x=st.px+(e.clientX-st.x0)+st.vx*180,y=st.py+(e.clientY-st.y0)+st.vy*180,sp=pillSpots(p);
    let best='bc',bd=1e9;for(const[k,[sx,sy]]of Object.entries(sp)){const d=Math.hypot(sx-x,sy-y);if(d<bd){bd=d;best=k}}
    lsSet(PILLK,best);pillPlace(p,best,false)};
  p.addEventListener('pointerup',end);p.addEventListener('pointercancel',end);
  p.addEventListener('click',e=>{if(Date.now()-(p._moved||0)<400){e.stopImmediatePropagation();e.preventDefault()}},true);
}
const _pill=pill;pill=function(){_pill();const p=$('#fcPill');if(p&&!p._drag)pillDrag(p)};
addEventListener('resize',()=>{const p=$('#fcPill');if(p&&p._drag)setTimeout(()=>pillPlace(p,p.dataset.spot||'bc',true),250)});
/* a timer started on another device shows up here too, and ends here when it ends there */
setInterval(()=>{const f=FOCUS(),v=$('#fcView');
  if(f){if(!v||v.hidden||!v.classList.contains('on'))focusTick()}
  else{if(v&&!v.hidden&&v.classList.contains('on')&&!v.querySelector('#fvRate'))hideFocus();const p=$('#fcPill');if(p)p.remove()}},1000);

/* urgency: swipe a reminder or task to the RIGHT and pick None / Low / Medium / High */
document.addEventListener('click',e=>{const b=e.target.closest('[data-urg]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();
  const r=b.closest('li.row'),x=find(r.dataset.sid),n=+b.dataset.urg;if(!x)return;x.urg=n||undefined;if(!n)delete x.urg;x.updated=Date.now();swClose(r);save();
  toast(n===3?'High urgency: you’ll be reminded through the day until it’s done':n?`Urgency set to ${['','Low','Medium'][n]}`:'Urgency cleared');setTimeout(()=>render(false),380)},true);
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="urgcss">
.swl{position:absolute;top:0;bottom:0;left:0;display:flex;align-items:stretch;width:var(--swl,0px);transform:translateX(calc(-1 * var(--swl,0px) + var(--sx,0px)));transition:transform .38s cubic-bezier(.22,1,.36,1)}
li.row.swiping .swl{transition:none}
.swl button{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font:700 11px var(--ui);color:#fff;min-width:0}
.swl button b{font:800 17px/1 var(--ui)}
.swl .u0{background:#5C574D}.swl .u1{background:#B98A3A}.swl .u2{background:#D9652E}.swl .u3{background:#E5352B}
.swl button.on{box-shadow:inset 0 -4px 0 rgb(255 255 255 / .85)}
li.row.urg1{box-shadow:inset 3px 0 0 #E0A34A}
li.row.urg2{box-shadow:inset 4px 0 0 #F0753A;background:linear-gradient(90deg,rgb(240 117 58 / .10),transparent 40%)}
li.row.urg3{box-shadow:inset 5px 0 0 #FF3B30,0 0 0 1px rgb(255 59 48 / .45);background:linear-gradient(90deg,rgb(255 59 48 / .24),rgb(255 59 48 / .06) 55%,transparent)}
li.row.urg3 .t,li.row.urg3 b:first-child{color:#FF8A80}
li.row>.swl{transform:translateX(calc(-1 * var(--swl,0px) + var(--sx,0px)))!important}
</style>`);
