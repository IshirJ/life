
/* ===================== ui4: premium pass + new features =====================
   Design system (one radius scale, one icon pack, glass, layered depth, real photos),
   Today summary, readiness, buses, job emails, AI food photos, reels, social-media pause, JARVIS, encryption UI. */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="ui4css">
:root{--r-xl:28px;--r-l:22px;--r-m:16px;--r-s:12px;--r-xs:8px;
  --depth:0 1px 1px rgb(0 0 0 / .10),0 4px 10px rgb(0 0 0 / .10),0 18px 36px -8px rgb(0 0 0 / .22);
  --depth-hi:0 2px 2px rgb(0 0 0 / .12),0 10px 20px rgb(0 0 0 / .14),0 30px 60px -12px rgb(0 0 0 / .35)}
/* one icon pack: Lucide outline, one stroke, soft tinted tiles */
svg.i{stroke-width:1.85}
.ico{background:color-mix(in srgb,var(--c2) 26%,var(--surface));color:var(--c1);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--c1) 26%,transparent);border-radius:var(--r-s)}
.ico::before{display:none}
.ico svg.i{stroke-width:2;filter:none}
.chip.on .ico{background:color-mix(in srgb,var(--c2) 40%,var(--surface))}
:root[data-theme="light"] .ico,:root:not([data-theme]) .ico{color:var(--c2)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .ico{color:var(--c1)}}
svg.ie{width:1.05em;height:1.05em;vertical-align:-.16em;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.hring svg.ie{width:22px;height:22px}.mcat span svg.ie{width:22px;height:22px}

/* glass + depth: cards float over the photo/foliage background */
.card-s{background:color-mix(in srgb,var(--surface) calc(var(--glass-tint,69) * 1%),transparent);-webkit-backdrop-filter:blur(calc(var(--glass-blur,26) * 1px)) saturate(1.5);backdrop-filter:blur(calc(var(--glass-blur,26) * 1px)) saturate(1.5);border:1px solid color-mix(in srgb,var(--ink) 9%,transparent);box-shadow:inset 0 1px 0 rgb(255 255 255 / .06),var(--depth)}
.hero{box-shadow:inset 0 1px 0 rgb(255 255 255 / .16),var(--depth-hi);border-radius:var(--r-xl)}
.ib,.chip,.banner,.fd-search{-webkit-backdrop-filter:blur(16px) saturate(1.5);backdrop-filter:blur(16px) saturate(1.5)}
.ib{border-radius:var(--r-m);background:color-mix(in srgb,var(--surface) 70%,transparent)}
.banner{background:color-mix(in srgb,var(--surface) 70%,transparent);border-radius:var(--r-l)}
.card-s:active,.tile:active{transform:scale(.985)}
.card-s,.tile{transition:transform .25s cubic-bezier(.3,1.4,.5,1)}
/* status bar: no solid band; content and photo run edge to edge, a soft fade keeps the clock readable */
body::before{background:linear-gradient(to bottom,rgb(0 0 0 / .5),rgb(0 0 0 / 0))!important;height:calc(env(safe-area-inset-top,0px) + 14px)!important;pointer-events:none}
:root[data-theme="light"] body::before{background:linear-gradient(to bottom,rgb(255 255 255 / .6),rgb(255 255 255 / 0))!important}
.top{top:calc(env(safe-area-inset-top,0px) + 4px);gap:8px}
.top .ib{width:42px;height:42px;border-radius:var(--r-m)}
/* floating header = compact glass pill: one line title, smaller controls, a blur strip behind so nothing peeks around it */
.top .hello h1,.top .av,.top .ib,.top .hello .cap{transition:font-size .3s cubic-bezier(.22,1,.36,1),width .3s,height .3s,opacity .2s,margin .3s}
.top.float{padding:7px 7px 7px 12px;border-radius:var(--r-xl);min-height:56px;
  background:linear-gradient(135deg,rgb(255 255 255 / .11),rgb(255 255 255 / .03)),color-mix(in srgb,var(--bg) 62%,transparent);
  -webkit-backdrop-filter:blur(30px) saturate(1.9);backdrop-filter:blur(30px) saturate(1.9);
  box-shadow:inset 0 1px 0 rgb(255 255 255 / .18),inset 0 0 0 1px rgb(255 255 255 / .10),0 12px 30px rgb(0 0 0 / .28)}
:root[data-theme="light"] .top.float{background:linear-gradient(135deg,rgb(255 255 255 / .55),rgb(255 255 255 / .25))}
.hello .cap,.hello h1{margin-left:0;padding-left:0;text-indent:0;text-align:left}
.top.float .hello .cap{opacity:0;height:0;margin:0;overflow:hidden}
.top.float .hello h1{font-size:21px;line-height:1.15;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.top.float .hello h1 br{display:none}
.top .avr{transition:opacity .25s}.top.float .avr{opacity:0}
.top.float .av{width:36px;height:36px;font-size:12.5px;margin:0 4px 0 2px}
.top.float .ib{width:38px;height:38px;border-radius:var(--r-s)}
.top.float::before{content:"";position:absolute;z-index:-1;left:-40px;right:-40px;top:calc(-6px - env(safe-area-inset-top,0px));bottom:-18px;
  background:linear-gradient(to bottom,rgb(0 0 0 / .35),transparent);
  -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);pointer-events:none;
  -webkit-mask:linear-gradient(to bottom,#000 72%,transparent);mask:linear-gradient(to bottom,#000 72%,transparent)}
.ib.jvb{color:var(--accent)}

/* one radius system everywhere: sheet/hero 30 · card 22 · tile 16 · small 12 · chips round. Nothing square. */
:where(.card-s){border-radius:var(--r-l)}
.card-s.bus,.card-s.rdy,.tray.card-s,.gcard.card-s{border-radius:var(--r-l);overflow:hidden}
.wk-cols{border-radius:var(--r-m)}
.sheet{border-radius:30px!important}
.sheet.m-bottom{left:8px;right:8px;bottom:calc(8px + var(--gap,0px));max-width:560px;padding-bottom:calc(18px + env(safe-area-inset-bottom,0px) * .5)}
.sheet.m-bottom.tall{top:calc(8px + env(safe-area-inset-top,0px));padding-bottom:calc(10px + env(safe-area-inset-bottom,0px) * .5)}
.sheet.m-top,.sheet.m-zoom{border-radius:30px!important}
.nb-mcard{border-radius:30px!important;margin-bottom:8px}
.menu{border-radius:var(--r-l)}


/* background: deep near-black with slow orange + green light, film grain, vignette (no photos, no lines) */
#mesh{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;background:#050906}
#mesh i{position:absolute;will-change:transform}
#mesh .m1{width:140vmax;height:140vmax;left:-70vmax;top:-60vmax;border-radius:50%;background:radial-gradient(closest-side,rgb(46 125 82 / .34),rgb(31 92 62 / .12) 50%,transparent 75%);animation:mx1 40s ease-in-out infinite alternate}
#mesh .m2{width:130vmax;height:130vmax;right:-66vmax;bottom:-64vmax;border-radius:50%;background:radial-gradient(closest-side,rgb(62 120 80 / .30),rgb(20 60 40 / .12) 52%,transparent 76%);animation:mx2 46s ease-in-out infinite alternate}
#mesh .m3{width:180vmax;height:70vmax;left:-40vmax;top:22vh;transform-origin:50% 50%;transform:rotate(-28deg);
  background:linear-gradient(180deg,transparent 0%,rgb(240 109 68 / .0) 28%,rgb(240 109 68 / .13) 46%,rgb(242 166 90 / .09) 54%,transparent 76%);animation:mx3 34s ease-in-out infinite alternate}
#mesh .m4{width:70vmax;height:70vmax;right:-20vmax;top:-18vmax;border-radius:50%;background:radial-gradient(closest-side,rgb(240 109 68 / .10),transparent 70%);animation:mx1 52s ease-in-out infinite alternate-reverse}
#mesh::before{content:"";position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 40%,rgb(0 0 0 / .18) 30%,rgb(0 0 0 / .72) 100%)}
#mesh::after{content:"";position:absolute;inset:-50%;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");background-size:180px;opacity:.08;mix-blend-mode:overlay}
@keyframes mx1{to{transform:translate3d(10vmax,8vmax,0) scale(1.08)}}
@keyframes mx2{to{transform:translate3d(-9vmax,-10vmax,0) scale(1.1)}}
@keyframes mx3{from{transform:rotate(-28deg) translate3d(-6vmax,0,0)}to{transform:rotate(-22deg) translate3d(8vmax,4vmax,0)}}
:root[data-theme="light"] #mesh{background:#EEF0E6}:root[data-theme="light"] #mesh::before{opacity:.2}:root[data-theme="light"] #mesh i{opacity:.5}
@media (prefers-reduced-motion:reduce){#mesh i{animation:none}}
#bgPhoto{display:none!important}
#flora{z-index:0;opacity:.6}
#bgcurve>canvas:not(#bgFx){opacity:.6}
/* performance: nothing in the background animates on its own (every frame of motion behind glass forces all the glass to re-blur); it moves only when you scroll */
#flora .fxd,#mesh i{animation:none!important}
.rings-on .avr g{animation-iteration-count:1!important;animation-duration:2.4s!important;animation-timing-function:cubic-bezier(.22,1,.36,1)!important}
/* hero art: the section's own colour as soft light, a warm/green counter-glow, grain, and a huge faded word layered behind */
.hero .hart{position:absolute;inset:0;z-index:0;overflow:hidden;border-radius:inherit;pointer-events:none}
.hart i{position:absolute;border-radius:50%}
.hart .g1{width:110%;aspect-ratio:1;right:-48%;top:-62%;background:radial-gradient(closest-side,color-mix(in srgb,var(--hc,#F06D44) 70%,#fff 0%),transparent 72%);opacity:.55}
.hart .g2{width:90%;aspect-ratio:1;left:-40%;bottom:-70%;background:radial-gradient(closest-side,rgb(240 109 68 / .45),transparent 70%);opacity:.6}
.h-food .hart .g2,.h-expense .hart .g2,.h-trip .hart .g2{background:radial-gradient(closest-side,rgb(134 207 160 / .35),transparent 70%)}
.hart::after{content:"";position:absolute;inset:0;mix-blend-mode:normal!important;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");background-size:160px;opacity:.13;mix-blend-mode:overlay}
.hart .hw{position:absolute;right:16px;top:12px;max-width:58%;text-align:right;font:800 44px/1 var(--ui);letter-spacing:-.035em;white-space:nowrap;overflow:hidden;
  background:linear-gradient(180deg,rgb(255 255 255 / .30),rgb(255 255 255 / .06));-webkit-background-clip:text;background-clip:text;color:transparent}
@keyframes hg{to{transform:translate3d(-8%,6%,0) scale(1.12)}}
/* 3D glass stack per section: three floating plates in perspective, the section's icon embossed on top, two glowing orbs */
.hart .h3d{position:absolute;right:24px;top:84px;width:56px;height:56px;transform-style:preserve-3d;transform:perspective(520px) rotateX(55deg) rotateZ(-40deg);animation:none}
.h3d .p{position:absolute;inset:0;border-radius:18px;display:grid;place-items:center;transform-style:preserve-3d}
.h3d .p1{transform:translateZ(0);background:color-mix(in srgb,var(--hc,#F06D44) 40%,#000);box-shadow:0 26px 40px rgb(0 0 0 / .45)}
.h3d .p2{transform:translateZ(14px);background:linear-gradient(135deg,color-mix(in srgb,var(--hc,#F06D44) 70%,#fff 10%),color-mix(in srgb,var(--hc,#F06D44) 45%,#000));opacity:.85;border:1px solid rgb(255 255 255 / .2)}
.h3d .p3{transform:translateZ(30px);background:linear-gradient(135deg,rgb(255 255 255 / .42),rgb(255 255 255 / .08));border:1px solid rgb(255 255 255 / .45);box-shadow:inset 0 1px 0 rgb(255 255 255 / .6),0 0 30px color-mix(in srgb,var(--hc,#F06D44) 50%,transparent)}
.h3d .p3 svg{width:28px;height:28px;stroke:#fff;stroke-width:1.8;filter:drop-shadow(0 2px 6px rgb(0 0 0 / .35))}
.h3d .o{position:absolute;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,var(--hc,#F06D44) 45%,transparent 72%)}
.h3d .o1{width:18px;height:18px;right:-14px;top:-10px;transform:translateZ(56px)}
.h3d .o2{width:11px;height:11px;left:-12px;bottom:6px;transform:translateZ(44px);background:radial-gradient(circle at 35% 30%,#fff,#86CFA0 45%,transparent 72%)}
@keyframes h3in{from{opacity:0;translate:0 10px}to{opacity:1;translate:0 0}}
@keyframes h3o{to{margin-top:-8px}}
.hart .hw{z-index:0}
@media (prefers-reduced-motion:reduce){.hart .h3d,.h3d .o{animation:none}}
.hero.hasph .hero-art{opacity:0!important;transition:opacity .6s}
.hero.h-today .hart .g2{display:none}

/* Today summary */
.tsum{padding:20px 18px 18px}
.ts-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.ts-main{display:grid;grid-template-columns:126px minmax(0,1fr);gap:18px;align-items:center}
.ts-dial{position:relative;width:118px;height:118px;display:grid;place-items:center;text-align:center}
.ts-dial svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}
.ts-dial circle{fill:none;stroke-linecap:round}
.ts-dial .tk{stroke:rgb(255 255 255 / .14)}
.ts-dial .pg{transition:stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1)}
.ts-dial .ticks line{stroke:rgb(255 255 255 / .25);stroke-width:1}
.ts-dial b{font:900 38px/1 var(--dot);letter-spacing:.02em;display:block}
.ts-dial small{display:block;font:600 10.5px var(--ui);opacity:.8;margin-top:2px}
.ts-ring{position:relative;width:126px;height:126px;display:grid;place-items:center;color:inherit}
.ts-ring svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}
.ts-ring circle{fill:none;stroke-linecap:round;transition:stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1)}
.ts-c{position:relative;text-align:center}.ts-c b{display:block;font:900 30px/1 var(--dot)}.ts-c b.sm{font-size:21px}.ts-c small{display:block;font:600 10px var(--ui);opacity:.75;margin-top:3px}
.ts-leg{display:flex;flex-direction:column;gap:9px;min-width:0}
.ts-leg>button{display:grid;grid-template-columns:1fr auto;grid-template-rows:auto auto;gap:3px 8px;align-items:baseline;color:inherit;text-align:left;min-width:0}
.ts-leg .tl{display:flex!important;flex-direction:row!important;justify-content:flex-start!important;align-items:center;gap:6px;font:600 11.5px var(--ui);opacity:.85;white-space:nowrap}
.ts-leg .tl i{width:7px;height:7px;border-radius:50%}
.ts-leg .tv{white-space:nowrap}.ts-leg .tv b{font:700 14px var(--mono)}.ts-leg .tv small{font:500 11px var(--ui);opacity:.65;margin-left:3px}
.ts-leg .tb{grid-column:1/-1;height:4px;border-radius:2px;background:rgb(255 255 255 / .13);overflow:hidden}.ts-leg .tb i{display:block;height:100%;border-radius:inherit}
.ts-verdict{display:inline-flex;align-items:center;gap:6px;font:700 12px var(--ui);color:#C8EE9C;margin-top:2px}.ts-verdict svg.i{width:14px;height:14px}
.ts-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:16px}
.ts-grid>button,.ts-grid>div{background:rgb(255 255 255 / .09);border:1px solid rgb(255 255 255 / .10);border-radius:var(--r-m);padding:10px 8px;text-align:left;color:inherit;min-width:0;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.ts-grid svg.i{width:16px;height:16px;opacity:.85}
.ts-grid b{display:block;font:700 16px/1.15 var(--mono);margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ts-grid small{display:block;font:600 10.5px var(--ui);opacity:.7;white-space:nowrap}
.ts-next{display:flex;gap:8px;margin-top:10px;overflow-x:auto;scrollbar-width:none}
.ts-next::-webkit-scrollbar{display:none}
.ts-pill{display:inline-flex;align-items:center;gap:7px;flex:none;padding:8px 12px;border-radius:999px;background:rgb(0 0 0 / .22);border:1px solid rgb(255 255 255 / .12);font:600 12.5px var(--ui);color:inherit;white-space:nowrap}
.ts-pill svg.i{width:15px;height:15px}
.ts-pill b{font-weight:800}
.tsum .hero-actions{margin-top:14px}

/* buses */
.bus{padding:6px 0}
.busrow{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;padding:12px 16px}
.busrow+.busrow{border-top:1px solid var(--line)}
.busrt{width:46px;height:46px;border-radius:var(--r-s);display:grid;place-items:center;font:800 13px var(--ui);color:#fff;letter-spacing:.02em}
.busrt.nmg{background:linear-gradient(160deg,#8C2F39,#5E1F27)}.busrt.cas{background:linear-gradient(160deg,#2F5D8C,#1F3E5E)}
.busmid{min-width:0}.busmid b{display:block;font:700 15px var(--ui);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.busmid small{display:block;color:var(--muted);font-size:12.5px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.buseta{text-align:right}.buseta b{display:block;font:900 26px/1 var(--dot)}.buseta small{font:600 11px var(--ui);color:var(--muted)}
.buseta.soon b{color:var(--accent)}

/* readiness card */
.rdy{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center;padding:16px}
.rdy .ts-dial{width:96px;height:96px}.rdy .ts-dial b{font-size:30px}
.rdy .ts-dial .tk{stroke:var(--surface2)}
.rdy .ts-dial .ticks line{stroke:var(--line)}
.rdy h3{margin:0 0 6px;font:500 20px var(--serif)}
.rbar{display:grid;grid-template-columns:70px 1fr auto;gap:8px;align-items:center;font-size:12.5px;margin-top:6px}
.rbar>i{height:6px;border-radius:3px;background:var(--surface2);overflow:hidden}.rbar>i>i{display:block;height:100%;border-radius:inherit}
.rbar span{color:var(--muted)}.rbar b{font:700 12px var(--mono)}

/* chat (JARVIS) */
.jv-st{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted);margin-bottom:10px;min-height:36px}.jv-st span{flex:1}
.jv-act{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 14px;border-radius:999px;background:var(--surface2);font:700 13px var(--ui);color:var(--ink)}.jv-act svg{width:15px;height:15px}.jv-act.pri{background:var(--good);color:#0E1A14}.jv-act:disabled{opacity:.6}
.jv-note:empty{display:none}.jv-note{margin:0 0 10px}
.jv-stop{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;height:40px;margin-top:6px;border-radius:999px;background:color-mix(in srgb,var(--late) 18%,transparent);color:var(--late);font:700 13.5px var(--ui)}.jv-stop svg{width:15px;height:15px}.jv-stop[hidden]{display:none}
.jv-ai.loc{border:1px solid color-mix(in srgb,var(--good) 40%,transparent)}
.jv-st i{width:8px;height:8px;border-radius:50%;background:var(--muted)}.jv-st.on i{background:var(--good);box-shadow:0 0 10px var(--good)}
.jv-log{display:flex;flex-direction:column;gap:10px;max-height:50vh;overflow-y:auto;padding:4px 2px 10px}
.jv-me,.jv-ai{max-width:85%;padding:10px 14px;border-radius:18px;font-size:14.5px;line-height:1.4;white-space:pre-wrap;overflow-wrap:anywhere}
.jv-me{align-self:flex-end;background:var(--accent);color:var(--accent-ink);border-bottom-right-radius:6px}
.jv-ai{align-self:flex-start;background:var(--surface2);border-bottom-left-radius:6px}
.jv-ai.wait{opacity:.7;font-style:italic}
.jv-in{display:flex;gap:8px;margin-top:8px}.jv-in input{flex:1;min-width:0;height:48px;border-radius:24px;border:1px solid var(--line);background:var(--surface);color:var(--ink);padding:0 18px;font:500 15px var(--ui)}
.jv-in button{width:48px;height:48px;border-radius:50%;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center}
.jv-sugg{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.jv-sugg button{font:600 12.5px var(--ui);padding:7px 12px;border-radius:999px;background:var(--surface2)}

/* AI food */
.aif{display:flex;flex-direction:column;gap:12px}
.aif-pick{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.aif-pick label{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;height:110px;border-radius:var(--r-l);border:1.5px dashed var(--line);background:var(--surface);font:700 14px var(--ui);cursor:pointer}
.aif-pick label svg.i{width:26px;height:26px;color:var(--accent)}
.aif-prev{width:100%;max-height:220px;object-fit:cover;border-radius:var(--r-l)}
.aif-row{display:grid;grid-template-columns:28px 1fr 70px;gap:10px;align-items:center;padding:10px 4px;border-bottom:1px solid var(--line)}
.aif-row b{display:block;font-size:14.5px}.aif-row small{color:var(--muted);font-size:12px}
.aif-row input[type=number]{width:70px;height:36px;border-radius:var(--r-s);border:1px solid var(--line);background:var(--surface);color:var(--ink);text-align:center;font:600 14px var(--ui)}
.aif-row input[type=checkbox]{width:22px;height:22px;accent-color:var(--accent)}

/* setup guides */
.k-lock,.k-shieldlock{--c1:#9CD67E;--c2:#3E7A4A}.k-image{--c1:#7FD3FF;--c2:#2D7FB8}.k-sparkles{--c1:#D8C8FF;--c2:#6B55C8}.k-bot{--c1:#FFB27A;--c2:#C8552E}
.k-video{--c1:#F2B8D6;--c2:#A8457A}.k-breathe{--c1:#A6E3C2;--c2:#2F8A5A}.k-bus{--c1:#F28A92;--c2:#8C2F39}.k-job{--c1:#B9C6FF;--c2:#5568D8}
.steps{counter-reset:s;list-style:none;padding:0;margin:0 0 14px}
.steps li{display:block!important;counter-increment:s;position:relative;padding:0 0 14px 40px;font-size:14px;line-height:1.45}
.steps li::before{content:counter(s);position:absolute;left:0;top:-2px;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--surface2);font:800 13px var(--ui)}
.steps code{font:600 12.5px var(--mono);background:var(--surface2);padding:2px 6px;border-radius:6px;word-break:break-all}
.pv{display:grid;place-items:center;margin:4px 0 16px}
.pv i{width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--sage-soft) 70%,#fff),var(--sage));animation:pvb 8s ease-in-out infinite;box-shadow:0 0 40px color-mix(in srgb,var(--sage-soft) 60%,transparent)}
@keyframes pvb{0%,100%{transform:scale(.6)}40%,55%{transform:scale(1)}}
</style>`);

/* older iOS (before 16.2) drops every color-mix() declaration, which left the glass cards transparent: give those a plain colour */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="cmixfb">
@supports not (background:color-mix(in srgb,red 50%,blue)){
  .card-s,.banner{background:rgb(22 26 23 / .78)}
  .ib{background:rgb(22 26 23 / .72)}
  .ico,.chip.on .ico{background:rgb(255 255 255 / .10);box-shadow:inset 0 0 0 1px rgb(255 255 255 / .14)}
  .top.float{background:linear-gradient(135deg,rgb(255 255 255 / .11),rgb(255 255 255 / .03)),rgb(10 12 11 / .7)}
  .jv-stop{background:rgb(240 109 68 / .18)}.jv-ai.loc{border:1px solid rgb(134 207 160 / .4)}
  .mok{background:rgb(93 170 120 / .18)}
  .fdp .fill{background:linear-gradient(to top,rgb(255 255 255 / .35),rgb(255 255 255 / .1))}
  .h3d .p1{background:rgb(60 30 20)}.h3d .p2{background:linear-gradient(135deg,rgb(255 160 120 / .8),rgb(120 50 30 / .9))}
  .pv i{background:radial-gradient(circle,#CFE3D3,var(--sage))}
  :root[data-theme="light"] .card-s,:root[data-theme="light"] .banner,:root[data-theme="light"] .ib{background:rgb(255 255 255 / .8)}
}
</style>`);

/* ---------- emoji → the same icon pack everywhere ---------- */
const EMO={'💧':'droplet','💊':'pill','😴':'bed','📚':'book2','🚶':'footprints','🏋️':'dumbbell','🏋':'dumbbell','🧘':'flower','🤸':'activity','📝':'pen','🥦':'salad','🚫':'x2','🦷':'sparkle','📵':'smartphone','🌅':'sunrise','🧠':'idea','🔥':'flame','🍔':'food','🛒':'cart','🚗':'car','🛍️':'bag','🛍':'bag','🧾':'receipt','🎉':'party','✈️':'plane','✈':'plane','🎓':'school','🍽':'food','😵':'frown','😕':'meh','🙂':'smile','😀':'laugh','🏃':'footprints','☕':'coffee','🎮':'game','🎵':'music','💰':'money','💵':'money','🛏':'bed','✅':'check2','⭐':'star'};
const EMO_RE=new RegExp(Object.keys(EMO).sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
function deEmoji(root){
  if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>(EMO_RE.lastIndex=0,EMO_RE.test(n.nodeValue))&&!n.parentElement.closest('textarea,input,[contenteditable],.nb-view,#nbView')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});
  const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
  for(const n of nodes){EMO_RE.lastIndex=0;const span=document.createElement('span');span.style.display='contents';
    span.innerHTML=esc(n.nodeValue).replace(EMO_RE,m=>`<svg class="ie" viewBox="0 0 24 24" aria-hidden="true">${P[EMO[m]]||''}</svg>`).replace(/️/g,'');n.replaceWith(span)}}
const _openSheet4=openSheet;openSheet=function(h){const r=_openSheet4(h);try{deEmoji($('#sheetBody'))}catch(e){}return r};

/* ---------- art instead of photos: layered gradient light + grain + one big editorial word per section ---------- */
const HWORD={'h-food':'Fuel','h-activity':'Move','h-weight':'Weight','h-workout':'Train','h-injury':'Heal','h-sleep':'Rest','h-task':'Tasks','h-meeting':'Meet','h-project':'Build',
  'h-job':'Career','h-grades':'Grades','h-expense':'Money','h-work':'Work','h-idea':'Ideas','h-note':'Notes','h-reminder':'Remind','h-scrap':'Scrap','h-cards':'Cards','h-trip':'Trips','h-mind':'Ideas','h-today':''};
const HICON={'h-food':'food','h-activity':'activity','h-weight':'weight','h-workout':'workout','h-injury':'injury','h-sleep':'bed','h-task':'task','h-meeting':'meeting','h-project':'project',
  'h-job':'job','h-grades':'grades','h-expense':'expense','h-work':'task','h-idea':'idea','h-note':'note','h-reminder':'reminder','h-scrap':'scrap','h-cards':'cards','h-trip':'trip','h-mind':'idea'};
const HGLID=new Set();
function hydratePhotos(){
  for(const h of $$('#view .hero[data-ph]:not(.hasph),#view .hero.fdc:not(.hasph)')){
    const t=h.dataset.ph||'h-food',w=h.classList.contains('fdc')?'':HWORD[t];if(w===undefined)continue;
    h.classList.add('hasph');
    const box=document.createElement('div');box.className='hph hart';const icn=HICON[t];box.innerHTML=`<i class="g1"></i><i class="g2"></i>${w?`<span class="hw">${w}</span>`:''}${icn&&w?`<div class="h3d" aria-hidden="true"><b class="p p1"></b><b class="p p2"></b><b class="p p3">${ic(icn)}</b><i class="o o1"></i><i class="o o2"></i></div>`:''}`;h.prepend(box);if(w)h.classList.add('hasw');{const d=box.querySelector('.h3d');if(d&&!HGLID.has(t)){HGLID.add(t);try{d.animate([{opacity:0,translate:'16px 0'},{opacity:1,translate:'0 0'}],{duration:520,easing:'cubic-bezier(.22,1,.36,1)'})}catch(e){}}}
  }
}
function bgPhoto(){
  if($('#mesh'))return;
  const m=document.createElement('div');m.id='mesh';m.setAttribute('aria-hidden','true');m.innerHTML='<i class="m1"></i><i class="m2"></i><i class="m3"></i><i class="m4"></i>';
  const host=document.getElementById('bgcurve');if(host)host.before(m);else document.body.prepend(m);
}
bgPhoto();
/* ---------- JARVIS one tap away: header button on every tab ---------- */
const _header4=header;header=function(){return _header4().replace('<button class="ib" id="searchBtn"',`<button class="ib jvb" data-jarvis aria-label="JARVIS">${ic('bot')}</button><button class="ib" id="searchBtn"`)};

/* ---------- radius & render hooks ---------- */
const _render4=render;render=function(a,f,d){_render4(a,f,d);try{deEmoji($('#view'));deEmoji($('#top'))}catch(e){}hydratePhotos();if(state.tab==='today')busTick(false);if(state.tab==='work'&&state.sub.work==='job')importJobs()};
afterSplash(()=>setTimeout(()=>{bgPhoto();hydratePhotos();deEmoji($('#view'))},600));

/* ---------- readiness: overnight resting HR vs your normal, last night's sleep, yesterday's training ---------- */
function readiness(){
  if(typeof hday!=='function')return null;const td=today(),h=hday(td)||{},y=hday(addDays(-1))||{};
  const rhrT=num(h.restingHr),rhr=rhrT||num(y.restingHr)||0,sleep=num(h.sleepMin)||0;
  const base=[];for(let i=1;i<=21;i++){const d=hday(addDays(-i));if(d&&num(d.restingHr))base.push(num(d.restingHr))}
  if(!rhr&&!sleep)return null;
  const b=base.length>=4?base.reduce((s,v)=>s+v,0)/base.length:null;
  const load=of('workout').filter(e=>e.date===addDays(-1)).reduce((s,e)=>s+num(e.minutes),0);
  // only last night's resting HR counts; yesterday's is a weak stand-in, so it can't earn more than half marks
  let pr=b&&rhr?Math.max(0,Math.min(1,1-(rhr-b+1)/8)):.5;if(!rhrT)pr=Math.min(pr,.5);           // 1 bpm under normal ≈ full marks; 7 over ≈ zero
  // no sleep recorded counts as no sleep: a missing night must never look like a good one
  const ps=sleep?Math.max(0,Math.min(1,sleep/480)):0;
  const pl=load>120?.4:load>75?.7:1;
  const score=Math.round(100*(pr*.45+ps*.4+pl*.15));
  const label=score>=85?'Ready to push':score>=68?'Train normally':score>=50?'Go easy today':'Recover today';
  return{score,label,rhr,base:b?Math.round(b):null,sleep,load,parts:[['Heart',pr,b&&rhr?`${rhr} vs ${Math.round(b)} bpm${rhrT?'':' (yesterday)'}`:'need a few nights'],['Sleep',ps,sleep?`${(sleep/60).toFixed(1)} h`:'none recorded'],['Training',pl,load?`${load} min yesterday`:'rest day']]}}
function dial(v,max,col,label,big){const r=50,c=2*Math.PI*r,p=Math.max(0,Math.min(1,v/max));
  return`<div class="ts-dial"><svg viewBox="0 0 120 120"><g class="ticks">${Array.from({length:40},(_,i)=>{const a=i/40*Math.PI*2;return`<line x1="${(60+57*Math.cos(a)).toFixed(1)}" y1="${(60+57*Math.sin(a)).toFixed(1)}" x2="${(60+(i%5?55:53)*Math.cos(a)).toFixed(1)}" y2="${(60+(i%5?55:53)*Math.sin(a)).toFixed(1)}"/>`}).join('')}</g><circle class="tk" cx="60" cy="60" r="${r}" stroke-width="9"/><circle class="pg" cx="60" cy="60" r="${r}" stroke-width="9" stroke="${col}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${c.toFixed(1)}" data-off="${(c*(1-p)).toFixed(1)}"/></svg><div><b class="num">${big}</b><small>${label}</small></div></div>`}
function animDials(root){requestAnimationFrame(()=>requestAnimationFrame(()=>$$('[data-off]',root||document).forEach(c=>c.style.strokeDashoffset=c.dataset.off)))}

/* ---------- Today: one card that sums up the whole day ---------- */
function rings3(vals){const R=[54,43,32],C=['#F06D44','#FFC46B','#9CD67E'];
  return`<svg viewBox="0 0 120 120">${vals.map((v,i)=>{const c=2*Math.PI*R[i];return`<circle cx="60" cy="60" r="${R[i]}" stroke="rgb(255 255 255 / .13)" stroke-width="9"/><circle cx="60" cy="60" r="${R[i]}" stroke="${C[i]}" stroke-width="9" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${c.toFixed(1)}" data-off="${(c*(1-Math.max(0,Math.min(1,v)))).toFixed(1)}"/>`}).join('')}</svg>`}
function nextUp(){const now=new Date(),nm=now.getHours()*60+now.getMinutes(),td=today();
  const items=dayItems(td).filter(e=>!e.allDay).map(e=>{const t=e.type==='meeting'?e.time:e.start;return{e,t,m:toMin(t)}}).filter(x=>x.m!=null&&x.m>=nm-5).sort((a,b)=>a.m-b.m);return items[0]||null}
function todayHero(){
  const td=today(),g=db.settings,food=of('food').filter(e=>e.date===td),kcal=sumKcal(food),prot=sumProt(food);
  const act=of('workout').filter(e=>e.date===td).reduce((s,e)=>s+num(e.minutes),0);
  const actGoal=Math.max(15,Math.round(num(g.active)/7));
  const h=typeof hday==='function'?hday(td)||{}:{},yd=typeof hday==='function'?hday(addDays(-1))||{}:{};
  const steps=num(h.steps),sleep=num(h.sleepMin)||num(yd.sleepMin);
  const due=db.entries.filter(e=>(e.type==='task'||e.type==='reminder')&&!e.done&&e.due&&dayDiff(e.due)<=0).length+(typeof extDue==='function'?extDue(0,0).length:0);
  const spent=of('expense').filter(e=>e.date===td).reduce((s,e)=>s+num(e.amount),0);
  const R=readiness(),left=g.kcal-kcal;
  const nx=nextUp(),bus=busNext('NMG');
  const date=new Date().toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'});
  return`<section class="hero h-today tsum" data-ph="h-today">
    <div class="ts-top"><span class="cap">${esc(date)}</span><span class="cap">${left>=0?`${fmtN(left)} kcal left`:`${fmtN(-left)} kcal over`}</span></div>
    <div class="ts-main">
      <button class="ts-ring" data-goto="health:${R?'activity':'food'}" aria-label="Today's rings">${rings3([kcal/g.kcal,prot/g.protein,act/actGoal])}<div class="ts-c"><b class="num${String(R?R.score:fmtN(Math.max(0,left))).length>3?' sm':''}">${R?R.score:fmtN(Math.max(0,left))}</b><small>${R?'readiness':'kcal left'}</small></div></button>
      <div class="ts-leg">
        ${[['#F06D44','Calories',kcal,g.kcal,''],['#FFC46B','Protein',prot,g.protein,'g'],['#9CD67E','Active',act,actGoal,' min']].map(([c,l,v,goal,u])=>`<button data-goto="health:${l==='Active'?'workout':'food'}"><span class="tl"><i style="background:${c}"></i>${l}</span><span class="tv"><b class="num">${fmtN(v)}</b><small>/ ${fmtN(goal)}${u}</small></span><span class="tb"><i style="width:${Math.min(100,goal?v/goal*100:0).toFixed(1)}%;background:${c}"></i></span></button>`).join('')}
        ${R?`<span class="ts-verdict">${ic('activity')}${esc(R.label)}</span>`:''}
      </div>
    </div>
    <div class="ts-grid">
      <button data-goto="health:activity">${ic('steps')}<b>${steps?fmtK(steps):'—'}</b><small>steps</small></button>
      <button data-goto="health:activity">${ic('bed')}<b>${sleep?(sleep/60).toFixed(1)+'h':'—'}</b><small>sleep</small></button>
      <button data-goto="work:task">${ic('task')}<b>${due}</b><small>due today</small></button>
      <button data-goto="work:expense">${ic('expense')}<b>${money(Math.round(spent))}</b><small>spent</small></button>
    </div>
    <div class="ts-next">${nx?`<button class="ts-pill" data-open="${esc(nx.e.id)}">${ic(nx.e.type==='class'?'class':'meeting')}<b>${esc(nx.e.title)}</b>${esc(fmtT(nx.t))}</button>`:`<span class="ts-pill">${ic('cal')}Nothing else scheduled</span>`}${bus?`<span class="ts-pill" data-bus>${ic('bus')}<b>NMG</b><span data-eta="${esc(bus)}">${esc(etaTxt(bus))}</span></span>`:''}</div>
    <div class="hero-actions"><button class="pill light" data-add="food">${ic('food')}Log food</button><button class="pill glassy" id="fab2">${ic('plus')}Add</button><button class="pill glassy" data-jarvis>${ic('bot')}JARVIS</button></div>
  </section>`}
const fmtK=n=>n>=10000?(n/1000).toFixed(1)+'k':fmtN(n);
const _vt4=viewToday;viewToday=function(){let h=_vt4();h=h.replace(/<section class="hero h-today"[\s\S]*?<\/section>/,todayHero());const b=busCard();if(b)h=h.replace(/(<section class="sec"><div class="sec-h"><h2>Due)/,b+'$1');return h};
document.addEventListener('click',e=>{if(e.target.closest('#fab2')){e.stopImmediatePropagation();openAdd()}},true);
const _render4b=render;render=function(a,f,d){_render4b(a,f,d);animDials($('#view'))};

/* ---------- buses: NMG at your stop + CAS ---------- */
const BUS={};const busCfg=()=>db.settings.bus||[{route:'NMG',stop:'1411',name:'Red Maple'},{route:'CAS',stop:'8005',name:'Transit Center'}];
function busNext(route){const b=BUS[route];if(!b)return null;const n=Date.now();const d=(b.deps||[]).map(x=>Date.parse(x)).filter(t=>t>n-30000)[0];return d||null}
function etaTxt(t){const m=Math.round((t-Date.now())/6e4);return m<=0?'now':m<60?`${m} min`:new Date(t).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}
function busCard(){
  if(!syncOn())return'';const cfg=busCfg();
  return section(`${'Bus'}<em> times</em>`,`<div class="card-s bus">${cfg.map(c=>{const b=BUS[c.route]||{},n=Date.now(),ds=(b.deps||[]).map(x=>Date.parse(x)).filter(t=>t>n-30000);const nx=ds[0];
    return`<div class="busrow"><span class="busrt ${esc(String(c.route||'').toLowerCase().replace(/[^a-z0-9-]/g,''))}">${esc(c.route)}</span><div class="busmid"><b>${esc(b.stopName||c.name||('Stop '+c.stop))}</b><small>${ds.length>1?'Then '+ds.slice(1,4).map(t=>new Date(t).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})).join(' · '):b.at?'No more buses listed today':'Loading…'}</small></div><div class="buseta${nx&&nx-n<6e5?' soon':''}"><b data-eta="${nx||''}">${nx?esc(etaTxt(nx).replace(' min','')):'—'}</b><small>${nx&&nx-n<36e5?'min':''}</small></div></div>`}).join('')}</div>`,`<button class="link" data-panel="bus">${ic('gear')}Stops</button>`)}
let busT=0,busLast=0,busP=null;
/* one request round at a time: a call while one is running shares it instead of firing another */
function busTick(force){
  if(!syncOn())return Promise.resolve();if(busP)return busP;if(!force&&Date.now()-busLast<55000)return Promise.resolve();busLast=Date.now();
  busP=busFetch().finally(()=>{busP=null});return busP}
async function busFetch(){
  const cfg=busCfg();let changed=false;
  await Promise.all(cfg.map(async c=>{try{const r=await api(`/bus?route=${encodeURIComponent(c.route)}&stop=${encodeURIComponent(c.stop)}`);const old=JSON.stringify(BUS[c.route]&&BUS[c.route].deps);BUS[c.route]=r;if(JSON.stringify(r.deps)!==old)changed=true}catch(e){}}));
  if(changed&&state.tab==='today'&&!document.querySelector('.sheet-wrap:not([hidden]) input:focus')){const y=SC.scrollTop;_render4(false);SC.scrollTop=y;deEmoji($('#view'));hydratePhotos();animDials($('#view'))}
}
setInterval(()=>{if(document.hidden)return;$$('[data-eta]').forEach(el=>{const t=+el.dataset.eta;if(t){const s=etaTxt(t);el.textContent=el.closest('.buseta')?s.replace(' min',''):s}});if(state.tab==='today')busTick(false)},20000);
document.addEventListener('click',async e=>{const b=e.target.closest('[data-panel="bus"],[data-busstop]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();
  if(b.dataset.busstop){const route=b.dataset.busroute||'',stop=b.dataset.busstop,name=b.dataset.busname||'';if(!route)return;const cfg=busCfg().map(c=>c.route===route?{route,stop,name}:c);db.settings.bus=cfg;save();delete BUS[route];busTick(true);toast(`${route}: ${name}`);openBusSet();return}
  openBusSet()},true);
async function openBusSet(){
  NAV_DIR=1;openSheet(`${sheetHead('Bus <em>stops</em>')}<p class="small" style="margin-top:0">Live Blacksburg Transit departures, refreshed every minute while Today is open.</p><div id="busSet"><p class="hint">Loading stops…</p></div>`);
  const cfg=busCfg();let h='';
  for(const c of cfg){try{const r=await api(`/bus/stops?route=${encodeURIComponent(c.route)}`);h+=`<div class="set-grp">${esc(c.route)}</div>${(Array.isArray(r.stops)?r.stops:[]).map(s=>`<button class="trow" data-busroute="${esc(c.route)}" data-busstop="${esc(s.code)}" data-busname="${esc(s.name)}"><span>${esc(s.name)}<small>Stop ${esc(s.code)}</small></span>${s.code===c.stop?ic('check'):''}</button>`).join('')||'<p class="hint">No stops found.</p>'}`}catch(e){h+=`<p class="hint">${esc(c.route)}: ${esc(e.message)}</p>`}}
  const el=$('#busSet');if(el)el.innerHTML=h}

/* ---------- Activity: readiness card on top ---------- */
const _av4=activityView;activityView=function(){let h=_av4();const R=readiness();if(!R)return h;
  const col=R.score>=68?'#86CFA0':R.score>=50?'#F0B35C':'#F06D44';
  const card=section('Readiness',`<div class="card-s rdy">${dial(R.score,100,col,'of 100',R.score)}<div><h3>${esc(R.label)}</h3>${R.parts.map(([l,p,t])=>`<div class="rbar"><span>${l}</span><i><i style="width:${Math.round(p*100)}%;background:${p>=.8?'#86CFA0':p>=.55?'#F0B35C':'#F06D44'}"></i></i><b>${esc(t)}</b></div>`).join('')}</div></div>`);
  return h.replace(/(<\/section>)/,'$1'+card)};

/* ---------- job applications from your Gmail labels (subjects only) ---------- */
const GENERIC=/myworkday|workday|greenhouse|lever\.co|icims|smartrecruiters|ashbyhq|successfactors|taleo|jobvite|workablemail|workable|gmail|outlook|hotmail|indeed|linkedin|handshake|joinhandshake|tsenta|oraclecloud|eightfold|avature|phenom|paradox|hirevue|codesignal|hackerrank|mail\./i;
function jobCompany(m){
  const s=m.subject||'',dom=(m.domain||'').toLowerCase();
  let c=(/\bat ([A-Z][\w&.'\- ]{1,30}?)(?:[!.,:|–-]|\s+for\b|\s+as\b|$)/.exec(s)||/(?:applying to|application to|applied to|interest in|joining)\s+([A-Z][\w&.'\- ]{1,30}?)(?:[!.,:|–-]|\s+for\b|\s+as\b|$)/i.exec(s)||[])[1];
  if(c&&/^(the|a|an|our|your)\b/i.test(c))c='';
  if(!c&&dom&&!GENERIC.test(dom)){const p=dom.split('.').filter(x=>!/^(em|mail|email|e|careers?|jobs?|talent|recruit\w*|hr|notify|notifications?|info|news|us|uk|global)$/.test(x));const base=p.length>1?p[p.length-2]:p[0];if(base)c=base.charAt(0).toUpperCase()+base.slice(1)}
  if(!c){const f=(m.from||'').replace(/\b(careers?|recruit(?:ing|ment|er|ers)?|talent( acquisition)?|jobs?|hiring|team|hr|people|university( recruiting)?|no-?reply|notifications?|via workday|workday|the)\b/gi,'').replace(/[@<>"]/g,'').replace(/\s{2,}/g,' ').trim();if(f.length>1)c=f}
  return(c||'').replace(/\s{2,}/g,' ').trim().slice(0,40)}
function jobRole(m){const s=m.subject||'';return((/(?:[Ff]or (?:the )?|[Pp]osition:?\s*|[Rr]ole:?\s*|[–-]\s*)([A-Z][\w/&,()'\- ]{2,60}?)(?: [Pp]osition| [Rr]ole| at |\s*[|–-]|$)/.exec(s)||[])[1]||'').trim().slice(0,60)}
function jobStage(m){const l=(m.label||'').toLowerCase(),s=(m.subject||'').toLowerCase();
  if(/reject/.test(l)||/unfortunately|not (?:be )?moving forward|other candidates|regret/.test(s))return'Rejected';
  if(/offer/.test(s)&&!/offering/.test(s))return'Offer';
  if(/interview|schedul|phone screen|meet the team|next round|superday|availability/.test(s))return'Interview';
  if(/assess|interview|codesignal|hackerrank|\boa\b|test|challenge/.test(l+s))return'Assessment';
  if(/post-application|form|wotc|self-identif|eeo/.test(l))return null;
  return'Applied'}
const STG=['Saved','Applied','Assessment','Interview','Offer','Rejected'];
let JOBS_AT=0;
async function importJobs(force){
  if(!syncOn()||uiLocked()||(!force&&Date.now()-JOBS_AT<10*6e4))return;JOBS_AT=Date.now();
  let r;try{r=await api('/jobs')}catch(e){return}
  if(uiLocked())return;
  const seen=new Set(of('job').flatMap(j=>j.mailIds||[]).map(String));let made=0,moved=0;
  const by={};for(const m of (Array.isArray(r&&r.items)?r.items:[]).filter(m=>m&&typeof m==='object'&&m.id!=null).sort((a,b)=>(a.date||'').localeCompare(b.date||''))){const c=jobCompany(m);if(!c)continue;(by[c.toLowerCase().replace(/[^a-z0-9]/g,'')]=by[c.toLowerCase().replace(/[^a-z0-9]/g,'')]||{c,ms:[]}).ms.push(m)}
  for(const[k,{c,ms}]of Object.entries(by)){
    const fresh=ms.filter(m=>!seen.has(String(m.id)));if(!fresh.length)continue;
    let j=of('job').find(x=>(x.title||'').toLowerCase().replace(/[^a-z0-9]/g,'')===k);
    if(!j){j={id:uid(),type:'job',created:Date.now(),title:c,role:ms.map(jobRole).find(Boolean)||'',stage:'Applied',date:(ms[0].date||'').slice(0,10),src:'gmail',mailIds:[]};db.entries.push(j);made++}
    /* every mail id stays remembered (a short list made old mails count as new again), and only a mail newer than the
       last one seen can move the stage, so an old rejection can't overwrite a later offer */
    for(const m of fresh){const st=jobStage(m);j.mailIds=(j.mailIds||[]).concat(String(m.id)).slice(-500);
      const md=String(m.date||''),older=!!(j.lastMailAt&&md&&md<String(j.lastMailAt));if(!st||older)continue;
      const cur=STG.indexOf(j.stage||'Applied'),nx=STG.indexOf(st);if(st==='Rejected'||nx>cur||(j.stage==='Rejected'&&nx>=STG.indexOf('Assessment'))){if(j.stage!==st)moved++;j.stage=st}
      j.lastMail=String(m.subject||'').slice(0,120);if(md)j.lastMailAt=md}
    if(!j.role)j.role=ms.map(jobRole).find(Boolean)||''}
  if(made||moved){save();if(state.tab==='work'){const y=SC.scrollTop;render(false);SC.scrollTop=y}toast(`Gmail: ${made} new application${made===1?'':'s'}${moved?`, ${moved} updated`:''}`)}
}
afterSplash(()=>setTimeout(()=>importJobs(true),4000));
const _subOf4=subOf;subOf=function(e){if(e.type==='job'&&e.src==='gmail'&&e.lastMail)return[e.role,e.lastMail].filter(Boolean).join(' · ');return _subOf4(e)};

/* ---------- AI food: photo or a sentence → foods with macros (free Gemini, through your server) ---------- */
const AIF={img:null,text:'',items:null,busy:false,err:''};
/* AI output is untrusted (a photo can carry text that steers it): every number becomes a finite, clamped number and
   every string a short plain string before anything is stored or rendered (CONTRACTS §4) */
const clampN=(v,lo,hi,dp=0)=>{let n=Number(v);if(!Number.isFinite(n))n=0;n=Math.min(hi,Math.max(lo,n));const f=10**dp;return Math.round(n*f)/f};
const cleanStr=(v,n=80)=>String(v==null?'':v).replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,n);
function aiFoodClean(items){return(Array.isArray(items)?items:[]).filter(x=>x&&typeof x==='object').slice(0,30).map(x=>({
  name:cleanStr(x.name)||'Food',kcal:clampN(x.kcal,0,5000),protein:clampN(x.protein,0,500,1),fat:clampN(x.fat,0,500,1),carbs:clampN(x.carbs,0,500,1),
  grams:clampN(x.grams,0,3000),confidence:/^(low|medium|high)$/i.test(cleanStr(x.confidence,10))?cleanStr(x.confidence,10).toLowerCase():'',on:x.on!==false}))}
const _flBody4=flBody;flBody=function(){if(FL.tab!=='ai')return _flBody4();
  if(!syncOn())return`<div class="notice">Connect your server first (Settings → Connections), then add a free Gemini key under AI.</div>`;
  if(AIF.items)AIF.items=aiFoodClean(AIF.items);
  return`<div class="aif">${AIF.img&&/^data:image\//.test(AIF.img)?`<img class="aif-prev" src="${esc(AIF.img)}" alt="Your photo">`:''}
    <div class="aif-pick"><label>${ic('camera')}Take photo<input type="file" accept="image/*" capture="environment" id="aifCam" hidden></label><label>${ic('image')}Choose photo<input type="file" accept="image/*" id="aifLib" hidden></label></div>
    <label class="fld" for="aifTxt" style="margin:0"><span>Or describe it</span><textarea id="aifTxt" rows="2" placeholder="e.g. 2 rotis, a bowl of dal and rice">${esc(AIF.text)}</textarea></label>
    <button class="primary" id="aifGo" ${AIF.busy?'disabled':''}>${AIF.busy?'Looking…':`${ic('sparkles')}Find the foods`}</button>
    ${AIF.err?`<div class="notice">${esc(AIF.err)}</div>`:''}
    ${AIF.items?(AIF.items.length?`<div>${AIF.items.map((x,i)=>`<div class="aif-row"><input type="checkbox" data-aifon="${i}" ${x.on!==false?'checked':''} aria-label="Include ${esc(x.name)}"><div><b>${esc(x.name)}</b><small>${esc(fmtN(x.kcal))} kcal · ${esc(String(x.protein))}P ${esc(String(x.fat))}F ${esc(String(x.carbs))}C${x.confidence?` · ${esc(x.confidence)} confidence`:''}</small></div><input type="number" inputmode="decimal" min="0" max="3000" data-aifg="${i}" value="${esc(String(x.grams))}" aria-label="Grams"></div>`).join('')}</div><button class="primary" id="aifAdd">${ic('plus')}Add to picked foods</button><p class="small">Estimates from a photo can be off by 20–30%. Adjust the grams before adding.</p>`:'<p class="hint">No food found in that.</p>'):''}</div>`};
function shrink(file){return new Promise((res,rej)=>{const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{const s=Math.min(1,800/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',.74))};im.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('Couldn’t read that photo'))};im.src=u})}
document.addEventListener('change',async e=>{if(e.target.id!=='aifCam'&&e.target.id!=='aifLib')return;const f=e.target.files&&e.target.files[0];if(!f)return;try{AIF.img=await shrink(f);AIF.items=null;AIF.err='';flRefresh(false)}catch(x){toast(x.message)}});
document.addEventListener('input',e=>{if(e.target.id==='aifTxt')AIF.text=e.target.value;const g=e.target.dataset&&e.target.dataset.aifg;if(g!==undefined&&AIF.items){const x=AIF.items[+g],n=clampN(e.target.value,0,3000);if(x&&n>0&&x.grams>0){const f=n/x.grams;x.kcal=Math.round(x.kcal*f);x.protein=+(x.protein*f).toFixed(1);x.fat=+(x.fat*f).toFixed(1);x.carbs=+(x.carbs*f).toFixed(1);x.grams=n}}});
document.addEventListener('click',async e=>{const b=e.target.closest('#aifGo,#aifAdd,[data-aifon]');if(!b)return;
  if(b.dataset.aifon!==undefined){const x=AIF.items&&AIF.items[+b.dataset.aifon];if(x)x.on=b.checked;return}
  e.stopImmediatePropagation();e.preventDefault();
  if(b.id==='aifGo'){if(!AIF.img&&!AIF.text.trim()){toast('Take a photo or describe what you ate');return}AIF.busy=true;AIF.err='';flRefresh(false);
    try{const r=await Promise.race([api('/ai/food',{method:'POST',body:JSON.stringify({image:AIF.img||undefined,text:AIF.text})}),new Promise((_,rej)=>setTimeout(()=>rej(new Error('No answer after 50 seconds. Check your connection, or tap Find again.')),50000))]);AIF.items=aiFoodClean(r&&r.items);if(!AIF.items.length)AIF.err=r.note||'No food found in that photo. Try closer, or describe it.'}catch(x){AIF.err=/^5\d\d$|1102|exceeded/.test(x.message)?'Your server hit a limit on that photo. Try again (photos are now sent smaller).':x.message}AIF.busy=false;flRefresh(false);return}
  if(b.id==='aifAdd'){const pick=aiFoodClean(AIF.items).filter(x=>x.on!==false);pick.forEach(x=>FL.cart.push({name:x.name,grams:x.grams,per100:null,servings:null,k:x.kcal,p:x.protein,f:x.fat,c:x.carbs}));AIF.items=null;AIF.img=null;AIF.text='';flRefresh();tick();toast(`${pick.length} added. Tap Log to save them.`)}
},true);

/* ---------- reels → guides (shared from Instagram / TikTok / YouTube via a Shortcut) ---------- */
let REELS_AT=0;
const strList=v=>Array.isArray(v)?v.map(x=>cleanStr(typeof x==='object'&&x?(x.text||x.name||''):x,300)).filter(Boolean).slice(0,60):[];
async function importReels(force){
  if(!syncOn()||uiLocked()||(!force&&Date.now()-REELS_AT<5*6e4))return;REELS_AT=Date.now();let list;try{list=await api('/reels')}catch(e){return}
  if(uiLocked()||!Array.isArray(list)||!list.length)return;
  /* each saved note remembers its reel id, so a reel whose server-side delete failed is never imported twice */
  const have=new Set(of('note').map(n=>n.reel).filter(Boolean));let added=0;const ids=[];
  let fold=of('folder').find(f=>f.title==='Reels');
  for(const r of list){try{
    if(!r||typeof r!=='object')continue;const rid=r.id!=null?String(r.id):'';if(rid)ids.push(rid);if(rid&&have.has(rid))continue;
    const title=cleanStr(r.title,120)||(r.kind==='recipe'?'Reel recipe':r.kind==='workout'?'Reel workout':'Reel');
    const ing=strList(r.ingredients),steps=strList(r.steps),tips=strList(r.tips);
    const ex=(Array.isArray(r.exercises)?r.exercises:[]).filter(x=>x&&typeof x==='object'&&cleanStr(x.name)).slice(0,40);
    const ps=r.perServing&&typeof r.perServing==='object'?r.perServing:null,pk=ps?clampN(ps.kcal,0,5000):0;
    const lines=[cleanStr(r.summary,2000),r.servings?`Serves ${cleanStr(r.servings,20)}`:'',pk?`Per serving: ${pk} kcal · ${clampN(ps.protein,0,500)}P ${clampN(ps.fat,0,500)}F ${clampN(ps.carbs,0,500)}C`:'',
      ing.length?'Ingredients:\n'+ing.map(x=>'• '+x).join('\n'):'',steps.length?'Steps:\n'+steps.map((x,i)=>`${i+1}. ${x}`).join('\n'):'',
      ex.length?'Workout:\n'+ex.map(x=>`• ${cleanStr(x.name)}${x.sets?` — ${cleanStr(x.sets,10)}×${cleanStr(x.reps,20)}`:''}${x.notes?` (${cleanStr(x.notes,120)})`:''}`).join('\n'):'',tips.length?'Tips:\n'+tips.map(x=>'• '+x).join('\n'):'',r.source&&r.source!=='video'?'Source: '+cleanStr(r.source,300):''].filter(Boolean).join('\n\n');
    if(!fold){fold={id:uid(),type:'folder',title:'Reels',created:Date.now()};db.entries.push(fold)}
    db.entries.push({id:uid(),type:'note',created:Number.isFinite(+r.at)&&+r.at>0?+r.at:Date.now(),title,notes:lines.slice(0,8000),folder:fold.id,tag:r.kind==='recipe'?'Recipe':r.kind==='workout'?'Workout':'Reel',reel:rid||undefined});
    if(r.kind==='recipe'&&pk)lib().push({name:title,k:pk,p:clampN(ps.protein,0,500,1),f:clampN(ps.fat,0,500,1),c:clampN(ps.carbs,0,500,1),serving:'1 serving',recipe:true,fav:true,src:'Reel'});
    if(r.kind==='workout'&&ex.length){db.templates=db.templates||[];db.templates.push({id:uid(),name:title,ex:ex.map(x=>({name:cleanStr(x.name),sets:clampN(x.sets,1,20)||3,reps:cleanStr(x.reps,20)}))})}
    if(rid)have.add(rid);added++}catch(e){}}
  if(added)save();if(ids.length){try{await api('/reels',{method:'DELETE',body:JSON.stringify({ids})})}catch(e){}}
  if(!added)return;toast(`${added} reel${added>1?'s':''} saved to Ideas → Reels`);if(state.tab==='mind'){const y=SC.scrollTop;render(false);SC.scrollTop=y}}
/* the health import (ext.js) must not write either while the passcode screen is up */
try{if(typeof importHealth==='function'){const _importHealth4=importHealth;importHealth=function(){if(uiLocked())return;return _importHealth4.apply(this,arguments)}}}catch(e){}
afterSplash(()=>setTimeout(()=>importReels(true),5000));
document.addEventListener('visibilitychange',()=>{if(!document.hidden){importReels();importJobs()}});

/* ---------- JARVIS on your laptop, from here ---------- */
let JV={log:[],seen:0,launcher:0,waking:null,t:0,local:[],since:Date.now(),open:new Set(),restartAt:0};
async function jvLoad(){try{const r=await api('/jarvis/log');JV.log=Array.isArray(r.log)?r.log:[];jvApplyStop();JV.seen=r.seen||0;JV.launcher=r.launcher||0;const wa=r.wakeAt||JV.wakeAt||0;JV.waking=r.waking&&wa&&Date.now()-wa<120000&&!(r.seen&&r.seen>wa)?r.waking:null;jvPaint()}catch(e){}}
/* questions the app can answer itself, instantly, without the laptop */
function jvTime(e){const t=e.allDay?'':(e.type==='meeting'?e.time:e.start)||'';const hm=t.length>5?t.slice(11,16):t;return hm?fmtT(hm):'All day'}
/* text as typed or heard, lower-case, straight apostrophes, no "Jarvis," / "please" in front, no end punctuation */
const jvQ=t=>String(t||'').toLowerCase().replace(/[’‘`]/g,"'").replace(/\s+/g,' ').trim().replace(/[?.!]+$/,'').replace(/^(?:hey |ok |okay )?jarvis[,.]?\s+/,'').replace(/^please\s+/,'').trim();
/* commands, never questions: these must reach the AI (reminders) or the laptop (email, calendar changes) */
const JV_NOTQ=/\b(remind|reminder|e-?mail|mail|text|message|send|schedule (?:a|an|my|the)|book|add|create|open|cancel|move|reschedule|submit|set|start|delete|remove|invite|call|reply)\b/;
const JV_ASK=/^(?:what(?:'s| is| are| do| does)?|whats|show(?: me)?|list|read(?: me)?|tell me|do i have|have i got|any|is there|are there|how many|when(?:'s| is)?)\b/;
function jvLocal(t){const q=jvQ(t);if(!q||JV_NOTQ.test(q)||!JV_ASK.test(q))return null;
  const day=/\btomorrow\b/.test(q)?addDays(1):today(),when=day===today()?'today':'tomorrow';
  if(/\b(due|assignments?|homework|deadlines?)\b/.test(q)){
    const d=dueWeek().filter(e=>!e.done&&!(typeof isExtDone==='function'&&e.xid&&isExtDone(e)));if(!d.length)return'Nothing due this week.';
    return'Due this week:\n'+d.slice(0,10).map(e=>`${fmtLong(e.due||e.date)} · ${e.title||e.name}`).join('\n')}
  if(/\b(calendar|schedule|classes|class|meetings?|events?)\b/.test(q)||/^what(?:'s| is)? on\b|^what do i have\b|^whats on\b/.test(q)){
    const it=dayItems(day);if(!it.length)return`Nothing on your calendar ${when}.`;
    return`${when==='today'?'Today':'Tomorrow'}:\n`+it.slice(0,12).map(e=>`${jvTime(e)} · ${e.title||e.name||e.course||'(busy)'}`).join('\n')}
  return null}
/* a Stop tapped here sticks: commands that were running or queued then stay "Stopped." even if the server log still says running */
function jvApplyStop(){if(!JV.stopAt)return;JV.log.forEach(x=>{if(x&&!x.reply&&(x.state==='running'||x.state==='queued')&&(x.at||0)<=JV.stopAt){x.state='error';x.reply='Stopped.'}})}
function jvState(){const now=Date.now(),on=now-JV.seen<20000,lau=now-JV.launcher<60000;return{on,lau}}
function jvPaint(){const L=$('#jvLog');if(!L)return;const{on,lau}=jvState();
  const st=$('#jvSt');if(st){st.className='jv-st'+(on?' on':'');
    const txt=on?'Laptop online':JV.waking?'Starting JARVIS on your laptop…':JV.wakeFail&&Date.now()-JV.wakeFail<6e5&&!(JV.seen>JV.wakeFail-120000)?'Didn’t start: your laptop didn’t answer':JV.seen?`JARVIS off · last seen ${esc(ago(JV.seen))}`:'JARVIS hasn’t checked in yet';
    const rs=JV.restartAt&&Date.now()-JV.restartAt<45000&&JV.seen<JV.restartAt+3000;const act=on||rs?`<button class="jv-act" data-jvwake="stop">${ic('close')}Stop</button><button class="jv-act${rs?' busy':''}" data-jvwake="restart" ${rs?'disabled':''}>${ic('refresh')}${rs?'Restarting…':'Restart'}</button>`:JV.waking?`<button class="jv-act pri busy" disabled>${ic('play')}Starting…</button><button class="jv-act" data-jvwake="cancel">${ic('close')}Cancel</button>`:`<button class="jv-act pri" data-jvwake="start">${ic('play')}Start JARVIS</button>`;
    st.innerHTML=`<i></i><span>${txt}</span>${act}`}
  const nt=$('#jvNote');if(nt)nt.innerHTML=!on&&!lau?'Your laptop isn’t answering. It’s asleep, offline, or hasn’t been logged into since the update. Wake it and tap Start.':'';
  const all=[...JV.log.map(x=>({...x})),...JV.local].sort((a,b)=>(a.at||0)-(b.at||0)).slice(-30);
  const run=all.some(x=>!x.reply&&(x.state==='running'||x.state==='queued')&&(x.at||0)>=JV.since&&Date.now()-(x.at||0)<6e5);
  const html=all.length?all.map(x=>`<div class="jv-me">${esc(x.text==='__voicetest'?'Voice test':/^__say:/.test(x.text)?'Briefing':x.text)}</div>${x.reply?`<div class="jv-ai${x.local?' loc':''}">${esc(x.reply)}${x.reply!=='Stopped.'?`<button class="jvplay" data-jvplay="${esc(x.local?'':(x.id||''))}" data-jvtext="${esc(x.reply)}" aria-label="Play">${ic('play')}</button>`:''}</div>`:`<div class="jv-ai wait">${x.state==='running'?`<details class="jvsteps"${JV.open.has(x.id)?' open':''} data-jvid="${esc(x.id||'')}"><summary><span class="jvdot"></span>Working on it…${(x.steps||[]).length?`<em>${x.steps.length} step${x.steps.length>1?'s':''}</em>`:''}<i class="chev">${ic('chev')}</i></summary><ol>${(x.steps||[]).length?x.steps.map(l=>`<li>${esc(l.replace(/[\[\]]/g,'').trim())}</li>`).join(''):'<li class="mu">Waiting for the first step…</li>'}</ol></details>`:on?'Sent…':'Waiting for your laptop…'}</div>`}`).join(''):'<p class="hint">Type anything you’d say to JARVIS. Calendar and due-date questions are answered here instantly; everything else runs on your laptop.</p>';
  /* repaint only when something changed, and only follow new messages if you were already at the bottom (or just sent one) */
  if(html!==L._h){const near=L.scrollHeight-L.scrollTop-L.clientHeight<48;L._h=html;L.innerHTML=html;if((near||JV.stick)&&!JV.keepScroll)L.scrollTop=L.scrollHeight}
  JV.stick=false;JV.keepScroll=false;
  const sb=$('#jvStop');if(sb)sb.hidden=!run}
function openJarvis(){NAV_DIR=1;FORCE_MODE='m-bottom tall';openSheet(`${sheetHead('<em>JARVIS</em>')}${needSrv()}<div class="jv-st" id="jvSt"><i></i><span>Checking…</span></div><p class="small jv-note" id="jvNote"></p><div class="jv-log" id="jvLog"></div>
  <button class="jv-stop" id="jvStop" hidden>${ic('close')}Stop</button>
  <div class="jv-in"><input id="jvIn" placeholder="Ask JARVIS to do something" enterkeyhint="send" autocomplete="off"><button id="jvSend" aria-label="Send">${ic('send')}</button></div>
  <div class="jv-sugg">${['What’s on my calendar today?','What’s due this week?','Open Canvas in Opera','Open Outlook','Lock my laptop'].map(s=>`<button data-jvs="${esc(s)}">${esc(s)}</button>`).join('')}</div>
  <p class="small">Final submit, pay and send steps still need you to say "confirm" on the laptop.</p>`);jvLoad();clearInterval(JV.t);JV.t=setInterval(()=>{if(!$('#jvLog'))clearInterval(JV.t);else jvLoad()},5000)}
async function jvSend(t){t=(t||'').trim();if(!t)return;const i=$('#jvIn');if(i)i.value='';
  const loc=jvLocal(t);if(loc){JV.local.push({text:t,reply:loc,at:Date.now(),local:true});jvPaint();return}
  JV.log.push({text:t,state:'queued',at:Date.now()});jvPaint();
  try{await api('/jarvis/cmd',{method:'POST',body:JSON.stringify({text:t})});jvLoad()}catch(e){toast('Couldn’t send: '+e.message)}}
async function jvWake(mode,quiet){if(mode==='stop'){JV.stopAt=Date.now();JV.log.forEach(x=>{if(!x.reply&&(x.state==='running'||x.state==='queued')){x.state='error';x.reply='Stopped.'}});jvPaint()}if(mode==='restart'){JV.restartAt=Date.now();jvPaint()}try{await api('/jarvis/wake',{method:'POST',body:JSON.stringify({mode})});if(mode==='cancel'){JV.waking=null;JV.wakeAt=0;clearTimeout(JV.wakeT);jvPaint()}else if(mode!=='stop'){JV.waking=mode;JV.wakeAt=Date.now();clearTimeout(JV.wakeT);JV.wakeT=setTimeout(()=>{if(JV.waking&&!jvState().on){JV.waking=null;JV.wakeFail=Date.now();jvPaint()}},120000)}jvPaint();if(!quiet)toast(mode==='stop'?'Stopping…':mode==='restart'?'Restarting JARVIS…':'Starting JARVIS…');setTimeout(jvLoad,1500)}catch(e){toast('Couldn’t reach your server: '+e.message)}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-jarvis],#jvSend,[data-jvs],[data-jvwake],#jvStop');if(!b)return;e.stopImmediatePropagation();e.preventDefault();
  if(b.dataset.jarvis!==undefined)return openJarvis();if(b.id==='jvSend')return jvSend($('#jvIn').value);
  if(b.dataset.jvwake)return jvWake(b.dataset.jvwake);if(b.id==='jvStop')return jvWake('stop');jvSend(b.dataset.jvs)},true);
document.addEventListener('keydown',e=>{if(e.target.id==='jvIn'&&e.key==='Enter'){if(e.isComposing||e.keyCode===229)return;e.preventDefault();jvSend(e.target.value)}});
addEventListener('life-live',e=>{const m=e.detail||{};if(m.t==='jarvis'&&$('#jvLog'))jvLoad()});

/* ---------- Connections: encryption, photos, AI, social-media pause, reels, JARVIS, jobs ---------- */
const _openConn4=openConn;openConn=function(){_openConn4();if(!syncOn())return;const w=$('#sheetBody [data-panel="widget"]');if(!w)return;
  const cfg=SV.cfg||{};
  w.insertAdjacentHTML('afterend',`<div class="set-grp">Private &amp; smart</div>
    ${connRow('e2e','lock',`End-to-end encryption`,E2E.key?'On · the server only stores scrambled data':'Off · turn on so only your devices can read your data',!!E2E.key)}
    ${connRow('ai','sparkles','AI (free Gemini)','Food from a photo, reels into guides',lsGet('ishiros.aiok')==='1')}
    ${connRow('jarvis','bot','JARVIS','Send commands to your laptop',false)}
    ${connRow('jobs','job','Job emails','Applications from your Gmail labels',false)}
    ${connRow('reels','video','Reel saver','Share a reel → recipe or workout guide',false)}
    ${connRow('stopper','breathe','Social media pause','A breathing pause before Instagram & co.',false)}
    ${connRow('bus','bus','Bus times','NMG and CAS stops',true)}`);
  deEmoji($('#sheetBody'))};
const keyForm=(id,label,ph,note)=>`<label class="fld" for="${id}"><span>${label}</span><input id="${id}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${ph}"></label>${note?`<p class="small" style="margin-top:-8px">${note}</p>`:''}`;
const WURL=()=>(SYNC.url||'').replace(/\/+$/,'');
function openE2E(){NAV_DIR=1;openSheet(`${sheetHead('End-to-end <em>encryption</em>','conn')}
  <div class="pv"><span class="ico k-folder" style="width:64px;height:64px;border-radius:20px">${ic('shieldlock')}</span></div>
  ${E2E.key?`<div class="notice">On. This device encrypts your entries, notebooks and server backups before they leave. Your server only stores scrambled copies of those.</div>
    <p class="small">Use the same passphrase on your iPad and laptop (Settings → Connections → End-to-end encryption). If you forget it, the server copy can’t be read. Your devices still have your data.</p>
    <div class="set-grp">Check a passphrase</div>
    <p class="small" style="margin-top:0">Type a passphrase to see if it’s the one this device uses. Nothing is changed or sent.</p>
    <label class="fld" for="e2eCk"><span>Passphrase</span><input id="e2eCk" type="password" autocomplete="off" autocapitalize="off" spellcheck="false"></label>
    <div class="sh-actions"><button class="secondary" id="e2eCheck" style="flex:1">${ic('check')}Check passphrase</button></div>
    <p class="small" id="e2eMsg" role="status" aria-live="polite"></p>
    <div class="sh-actions"><button class="secondary" id="e2eForget" style="flex:1">Forget passphrase on this device</button></div>`
  :`<p class="small" style="margin-top:0">Pick a passphrase you’ll remember (4+ words is best). It never leaves your devices. If another device already uses encryption, type the same passphrase it uses.</p>
    <label class="fld" for="e2eP1"><span>Passphrase</span><input id="e2eP1" type="password" autocomplete="new-password" autocapitalize="off" spellcheck="false"></label>
    <label class="fld" for="e2eP2"><span>Same again</span><input id="e2eP2" type="password" autocomplete="new-password" autocapitalize="off" spellcheck="false"></label>
    <div class="sh-actions"><button class="primary" id="e2eOn" style="flex:1">${ic('lock')}Turn on</button></div>
    <p class="small" id="e2eMsg" role="status" aria-live="polite"></p>`}
  <p class="small">What stays readable on the server: reminder and schedule notification times, health numbers from Google (they come from Google, not this app), the Home-screen widget summary (the widget can’t decrypt) and quick-capture text from Shortcuts.</p>`)}
/* ---- passphrase → key, checked BEFORE it is used anywhere ----
   The typed passphrase is tried as typed, then with common slips fixed (spaces at the ends, first letter's case,
   smart quotes/dashes from the iPhone keyboard, Unicode form). Each try is one PBKDF2 run (~0.5 s). */
async function e2eDeriveForm(pass,server,form){
  if(form==='NFKC')return e2eDerive(pass,server);
  const enc=new TextEncoder(),salt=await crypto.subtle.digest('SHA-256',enc.encode('life-e2e-v1:'+String(server||'').replace(/\/+$/,'').toLowerCase()));
  const base=await crypto.subtle.importKey('raw',enc.encode(pass.normalize(form)),'PBKDF2',false,['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:600000},base,256))}
function e2eVariants(p){
  const ascii=s=>s.replace(/[‘’‚‛′´]/g,"'").replace(/[“”„‟″]/g,'"').replace(/[‐-―−]/g,'-').replace(/…/g,'...').replace(/[   ]/g,' ');
  const flip=s=>{const i=s.search(/\S/);if(i<0)return s;const c=s[i],f=c===c.toUpperCase()?c.toLowerCase():c.toUpperCase();return f===c?s:s.slice(0,i)+f+s.slice(i+1)};
  const out=[],seen=new Set();
  const add=(s,why,form)=>{if(!s)return;const k=form+'\u0000'+s.normalize(form);if(seen.has(k))return;seen.add(k);out.push({s,why,form})};
  const t=p.trim(),A=ascii(p),At=ascii(t);
  const bases=[[p,''],[t,'without the spaces at the start or end'],[flip(p),'with the first letter’s case switched'],[flip(t),'trimmed and with the first letter’s case switched'],
    [A,'with plain quotes and dashes'],[At,'trimmed, with plain quotes and dashes'],[flip(A),'with plain quotes/dashes and the first letter’s case switched'],[flip(At),'trimmed, plain quotes/dashes, first letter’s case switched']];
  for(const[s,why]of bases)add(s,why,'NFKC');
  for(const[s,why]of bases)if(s.normalize('NFC')!==s.normalize('NFKC'))add(s,(why?why+', ':'')+'in the other Unicode form','NFC');
  return out}
/* true if `raw` opens the sealed box (a local CryptoKey only: nothing global changes) */
async function e2eOpens(raw,box){try{const k=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['decrypt']);await crypto.subtle.decrypt({name:'AES-GCM',iv:e2eUnb64(box.iv)},k,e2eUnb64(box.ct));return true}catch(e){return false}}
async function e2eFindKey(pass,server,test,progress){const vs=e2eVariants(pass);
  for(let i=0;i<vs.length;i++){if(progress)progress(i,vs.length);const raw=await e2eDeriveForm(vs[i].s,server,vs[i].form);if(await test(raw))return{raw,why:vs[i].why,tries:i+1};raw.fill(0)}
  return{raw:null,tries:vs.length}}
async function e2eStoreKey(raw){
  if(typeof e2eSetKey==='function')return e2eSetKey(raw);
  await e2eUse(raw);localStorage.setItem('ishiros.e2e',e2eB64(raw))}
async function e2eClear(){try{if(typeof e2eForget==='function')await e2eForget()}catch(x){}try{localStorage.removeItem('ishiros.e2e')}catch(x){}E2E.key=null;E2E.on=false}
const E2EFRESH={pass:''};
const e2eSay=(t,bad)=>{const m=$('#e2eMsg');if(m){m.innerHTML=bad?`<b style="color:var(--late)">${esc(t)}</b>`:esc(t)}};
document.addEventListener('click',async e=>{const b=e.target.closest('[data-panel="e2e"],[data-panel="photos"],[data-panel="ai"],[data-panel="jarvis"],[data-panel="jobs"],[data-panel="reels"],[data-panel="stopper"],#e2eOn,#e2eForget,#e2eCheck,#e2eFresh,#aiSave,#aiTest,#jobsNow');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
  const p=b.dataset.panel;
  if(p==='e2e')return openE2E();
  if(b.id==='e2eForget'){arm(b,'Tap again — this device stops syncing until you enter it again',async()=>{await e2eClear();openE2E()});return}
  if(b.id==='e2eCheck'){const p1=($('#e2eCk')||{}).value||'';if(!p1){e2eSay('Type the passphrase to check first.',true);return}if(!E2E.key){openE2E();return}
    b.disabled=true;const lbl=b.innerHTML;b.textContent='Checking…';
    try{/* seal a throwaway value with this device's key; a passphrase is right if its key opens it */
      const iv=crypto.getRandomValues(new Uint8Array(12)),ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},E2E.key,new TextEncoder().encode('life-check'));
      const box={iv:e2eB64(iv),ct:e2eB64(ct)};
      const f=await e2eFindKey(p1,WURL(),raw=>e2eOpens(raw,box),(i,n)=>{e2eSay(`Checking… ${i+1} of ${n}`)});
      if(f.raw){f.raw.fill(0);e2eSay(f.why?`Close: it matches this device ${f.why}. Type it that way on your other devices.`:'Yes, that’s the passphrase this device uses.')}
      else e2eSay(`No, that isn’t the passphrase this device uses (also tried ${f.tries-1} common variations).`,true)}
    catch(x){e2eSay('Couldn’t check: '+x.message,true)}
    b.disabled=false;b.innerHTML=lbl;return}
  if(b.id==='e2eFresh'){const pass=E2EFRESH.pass;if(!pass){openE2E();return}
    arm(b,'Tap again to replace the server copy',async()=>{b.disabled=true;b.textContent='Encrypting…';
      try{const raw=await e2eDeriveForm(pass.trim(),WURL(),'NFKC');E2E.key=null;await e2eStoreKey(raw);
        const cur=await api('/sync');
        const p=await api('/sync',{method:'PUT',headers:{'X-Life-Device':DEVICE},body:JSON.stringify({base:cur.ver,doc:await e2eSeal(docForPush(db))})});
        SYNCST.ver=p.ver;SYNCST.keyBad=false;SYNCST.err='';E2EFRESH.pass='';
        try{await syncNotes(true)}catch(x){}cloudBackup(true);
        toast('Done. Your server now holds this device’s data. Use the same passphrase on your other devices.');openE2E()}
      catch(x){await e2eClear();e2eSay('Couldn’t start fresh, nothing was replaced: '+x.message,true);b.disabled=false;b.textContent='Start fresh with this device’s data'}});
    return}
  if(b.id==='e2eOn'){const a=$('#e2eP1').value,c=$('#e2eP2').value;if(a.trim().length<8){e2eSay('Use at least 8 characters.',true);return}if(a!==c){e2eSay('The two passphrases don’t match each other. Type them again.',true);return}
    b.disabled=true;const lbl=b.innerHTML;const reset=()=>{b.disabled=false;b.innerHTML=lbl};b.textContent='Checking…';
    /* 1) what's on the server now (another device may have turned encryption on first) */
    let r;try{r=await api('/sync')}catch(x){e2eSay('Couldn’t reach your server, so nothing was changed: '+x.message,true);reset();return}
    const box=r&&r.doc&&r.doc.e2e&&r.doc.iv&&r.doc.ct?r.doc:null;let raw=null,why='';
    try{
      if(box){/* 2) derive locally and test-open the server copy; the key is not used anywhere until this passes */
        const f=await e2eFindKey(a,WURL(),k=>e2eOpens(k,box),(i,n)=>{e2eSay(i?`Checking variations of what you typed… ${i+1} of ${n}`:'Checking your passphrase…')});
        if(!f.raw){await e2eClear();e2eSay(`The passphrase is wrong: it doesn’t open the data your other device encrypted (also tried ${f.tries-1} common variations: spaces, first-letter case, smart quotes). On a device where encryption is on, use “Check passphrase” to confirm the right one.`,true);
          E2EFRESH.pass=a;const m=$('#e2eMsg');if(m)m.insertAdjacentHTML('beforeend',`<div class="notice" style="margin-top:10px">Nobody has the old passphrase any more? Start fresh: this device’s data replaces the locked copy on your server, encrypted with the passphrase you just typed. Then type that same passphrase on your other devices; their data merges back in.</div><div class="sh-actions"><button class="secondary" id="e2eFresh" style="flex:1">Start fresh with this device’s data</button></div>`);
          reset();return}
        raw=f.raw;why=f.why}
      else{e2eSay('Making your key…');raw=await e2eDeriveForm(a.trim(),WURL(),'NFKC')}}
    catch(x){await e2eClear();e2eSay('Couldn’t make the key on this device: '+x.message,true);reset();return}
    /* 3) only now: store and switch on */
    try{E2E.key=null;await e2eStoreKey(raw)}catch(x){await e2eClear();e2eSay((box?'The passphrase is right, but this':'This')+' device couldn’t store the key, so encryption stays off: '+x.message,true);reset();return}
    e2eSay('Syncing…');let synced=true;try{await syncNow(true);if(typeof SYNCST!=='undefined'&&SYNCST.err)throw new Error(SYNCST.err)}catch(x){synced=false;e2eSay('Encryption is on and the passphrase is right, but the first sync failed: '+x.message+'. It will retry by itself.',true)}
    try{await syncNotes(true)}catch(x){}if(!box)cloudBackup(true);
    if(synced){toast(why?`Encrypted. Your passphrase matched ${why}.`:box?'Encrypted. This device can read your synced data.':'Encrypted. Enter the same passphrase on your other devices.');openE2E()}
    return}
  if(p==='ai'){NAV_DIR=1;openSheet(`${sheetHead('AI · <em>Gemini</em>','conn')}<p class="small" style="margin-top:0">Gemini’s free tier powers food-from-a-photo (Food → Log → AI) and the reel saver. Free-tier requests may be used by Google to improve its products.</p>
    <ol class="steps"><li>Open <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a> and sign in.</li><li>Tap <b>Create API key</b> and copy it.</li><li>Paste it below. It’s stored on your server only, never in this app.</li></ol>
    ${keyForm('aiKey','Gemini API key',SV.cfg&&SV.cfg.geminiKey?'Saved (paste to replace)':'Paste here','')}<div class="sh-actions"><button class="primary" id="aiSave" style="flex:1">Save &amp; test</button>${SV.cfg&&SV.cfg.geminiKey?'<button id="aiTest" style="flex:1">Test key</button>':''}</div><p class="small" id="aiRes" aria-live="polite"></p>`);if(!SV.cfg)loadCfg();return}
  if(b.id==='aiSave'||b.id==='aiTest'){const k=b.id==='aiSave'?$('#aiKey').value.trim():'';if(b.id==='aiSave'&&!k){toast('Paste the key first');return}
    const out=$('#aiRes');b.disabled=true;if(out)out.textContent=k?'Saving and testing…':'Testing…';
    try{if(k)SV.cfg=await api('/config',{method:'PUT',body:JSON.stringify({geminiKey:k})});await api('/ai/test',{method:'POST',body:'{}'});lsSet('ishiros.aiok','1');if(out)out.innerHTML='<b style="color:var(--good)">Working.</b> Food → Log → AI is ready.';}
    catch(x){if(out)out.innerHTML='<b style="color:var(--late)">Not working:</b> '+esc(x.message)}b.disabled=false;return}
  if(p==='jarvis')return openJarvis();
  if(p==='jobs'){NAV_DIR=1;openSheet(`${sheetHead('Job <em>emails</em>','conn')}<p class="small" style="margin-top:0">Your Google Apps Script sends Life one line per email in your job labels: sender, subject, date and label. Never the body. Life turns them into applications in Work → Jobs and moves each one forward as interviews and rejections come in.</p>
    <ol class="steps"><li>Open your “Life Gmail sync” project at <a href="https://script.google.com" target="_blank" rel="noopener">script.google.com</a> (or create it).</li><li>Replace the code with the new <a href="${GH}apps-script/Gmail.gs" target="_blank" rel="noopener">Gmail.gs</a>, keeping your WORKER_URL and LIFE_KEY lines.</li><li>Choose <b>setup</b> → Run. The first run sends your whole job-email history; after that it checks every hour.</li></ol>
    <div class="sh-actions"><button class="secondary" id="jobsNow" style="flex:1">${ic('refresh')}Check now</button></div>`);return}
  if(b.id==='jobsNow'){await importJobs(true);toast('Checked');return}
  if(p==='reels'){NAV_DIR=1;openSheet(`${sheetHead('Reel <em>saver</em>','conn')}<p class="small" style="margin-top:0">Share a reel to “Save to Life” and Gemini turns it into a guide: recipes go to Ideas → Reels and your food library (with macros), workouts become a workout template.</p>
    <ol class="steps"><li>Open <b>Shortcuts</b> → <b>+</b> → name it <b>Save to Life</b> → (i) → turn on <b>Show in Share Sheet</b>, accepting <b>URLs</b> and <b>Media</b>.</li>
    <li>Add <b>Get Type</b> → <b>If</b> Type contains <code>URL</code>: <b>Get Contents of URL</b> <code>${esc(WURL())}/reels</code>, POST, header <code>X-Life-Key</code> = your key, JSON body <code>url</code> = Shortcut Input.</li><li>Under <b>Otherwise</b>: the same call but Request Body <b>File</b> = Shortcut Input.</li><li>Add <b>Show Notification</b> with the result.</li>
    <li>Instagram/TikTok: tap Share → <b>Save to Life</b>. If Instagram hides the caption, save or screen-record the reel and share the video from Photos instead. YouTube links work directly.</li></ol>`);return}
  if(p==='stopper'){const pu=`${location.origin}${location.pathname.replace(/[^/]*$/,'')}pause.html`;NAV_DIR=1;openSheet(`${sheetHead('Social media <em>pause</em>','conn')}
    <div class="pv"><i></i></div><p class="small" style="margin-top:0;text-align:center">When you open Instagram, TikTok or YouTube, your phone shows a 30-second breathing pause first. Then you choose to close it or go in for 10 minutes.</p>
    <div class="set-grp">Shortcut 1 · Life Allow</div><ol class="steps"><li>Shortcuts → <b>+</b> → name it exactly <b>Life Allow</b>.</li><li>Add <b>Text</b> with <b>Current Date</b> in it → <b>Save File</b> to <code>Shortcuts/life-pass.txt</code>, “Ask Where” off, Overwrite on.</li><li>Add <b>Open App</b> → Instagram (or whichever app).</li></ol>
    <div class="set-grp">Shortcut 2 · the pause</div><ol class="steps"><li>Shortcuts → <b>Automation</b> → <b>+</b> → <b>App</b> → choose Instagram, TikTok, YouTube → <b>Is Opened</b> → <b>Run Immediately</b>.</li>
    <li>Add <b>Get File</b> <code>Shortcuts/life-pass.txt</code> (Error If Not Found off) → <b>Get Dates from Input</b> → <b>Get Time Between Dates</b> (that date and Current Date, in Minutes).</li>
    <li>Add <b>If</b> minutes <b>is less than 10</b> → <b>Stop This Shortcut</b> → End If.</li>
    <li>Add <b>Open URLs</b>: <code>${esc(pu)}?app=Instagram</code></li>
    <li>Optional, to count pauses in Life: <b>Get Contents of URL</b> <code>${esc(WURL())}/screen</code>, POST, header <code>X-Life-Key</code>, JSON <code>app</code> = Instagram, <code>event</code> = paused.</li></ol>
    <p class="small">Apple doesn’t let Home-Screen web apps block other apps, so this uses Apple’s own Shortcuts. It’s free and runs on your phone.</p>`);return}
},true);
async function loadCfg(){try{SV.cfg=await api('/config')}catch(e){}}

/* ---------- replace a leaked key: two taps, then this device switches over; the rest are updated by hand ---------- */
document.addEventListener('click',async e=>{const b=e.target.closest('#keyNew');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
  if(!b.dataset.arm){b.dataset.arm='1';b.textContent='Tap again to replace the key everywhere';setTimeout(()=>{if(b.isConnected){delete b.dataset.arm;b.textContent='Make a new key (if this one leaked)'}},5000);return}
  b.disabled=true;b.textContent='Replacing…';
  try{const r=await api('/key/rotate',{method:'POST',body:'{}'});if(!r.key)throw new Error('no key');SYNC.key=r.key;saveSync();
    toast('New key saved on this device. Update your other devices, Gmail script, widget and JARVIS.');setTimeout(()=>location.reload(),2200)}
  catch(x){toast('Couldn’t replace it: '+x.message);b.disabled=false;delete b.dataset.arm;b.textContent='Make a new key (if this one leaked)'}},true);

/* ===================== JARVIS HUD: arc-reactor screen, talk to it (free: the phone's own speech recognition + voice) ===================== */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="jvhcss">
#jvHud{position:fixed;inset:0;z-index:80;display:flex;flex-direction:column;color:#F4EFE6;background:radial-gradient(90% 60% at 50% 32%,rgb(240 109 68 / .16),transparent 70%),radial-gradient(80% 60% at 50% 110%,rgb(46 125 82 / .32),transparent 70%),#070908;
  padding:calc(env(safe-area-inset-top,0px) + 10px) max(16px,env(safe-area-inset-right,0px)) calc(env(safe-area-inset-bottom,0px) + 12px) max(16px,env(safe-area-inset-left,0px));
  opacity:0;transform:scale(1.04);transition:opacity .35s ease,transform .45s cubic-bezier(.22,1,.36,1);font-family:var(--ui)}
#jvHud.on{opacity:1;transform:none}
#jvHud::before{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgb(255 255 255 / .025) 0 1px,transparent 1px 3px),radial-gradient(circle at 50% 36%,transparent 0 30%,rgb(0 0 0 / .45) 75%)}
#jvHud>*{position:relative}
.jvh-top{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:44px;padding:4px 4px 0 2px}
.jvh-st{display:flex;align-items:center;gap:8px;margin:14px 2px 12px;font:500 11px/1.3 var(--mono);letter-spacing:.06em;text-transform:uppercase;color:rgb(244 239 230 / .6);min-height:34px}
.jvh-st span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.jvh-st i{width:7px;height:7px;flex:none}
.jvh-st .jv-act{flex:none;height:32px;font:600 12.5px var(--ui);text-transform:none;letter-spacing:0;padding:0 12px;background:rgb(255 255 255 / .08);color:#F4EFE6;border:1px solid rgb(255 255 255 / .12)}.jvh-st .jv-act.pri{background:#86CFA0;color:#08140D;border:0}
.jvh-brand{font:700 13px/1 var(--mono);letter-spacing:.32em;color:#F06D44;text-shadow:0 0 12px rgb(240 109 68 / .6)}
.jvh-top .jv-st{flex:1;margin:0;font:400 11px/1.3 var(--mono);letter-spacing:.06em;text-transform:uppercase;color:rgb(244 239 230 / .6);min-height:0}
.jvh-top .jv-st i{width:7px;height:7px;flex:none}.jvh-top .jv-st span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.jvh-top .jv-act{height:30px;font-size:12px;padding:0 11px;background:rgb(255 255 255 / .08);color:#F4EFE6;border:1px solid rgb(255 255 255 / .12)}
.jvh-top .jv-act.pri{background:#86CFA0;color:#08140D;border:0}
.jvh-x{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:rgb(255 255 255 / .07);border:1px solid rgb(255 255 255 / .12);color:#F4EFE6}
.jvh-stage{flex:1 1 0;min-height:250px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:6px 0 10px}
.jvh-r{width:min(62vw,30vh,290px);aspect-ratio:1;position:relative;border-radius:50%;flex:none}
.jvh-r svg{width:100%;height:100%;overflow:visible}

.jvh-r g[class^=r]{transition:stroke .5s ease}
#jvHud.listen .r1,#jvHud.listen .r4{stroke:#86CFA0}#jvHud.listen .r2{stroke:#F06D44}#jvHud.listen .r3{stroke:#CFF5DC}
#jvHud.listen .core{filter:hue-rotate(100deg) saturate(1.1)}
#jvHud.think .r1,#jvHud.think .r4{stroke:#F2A65A}
.jvh-mode{transition:color .4s}#jvHud.think .jvh-mode{color:#F2A65A;text-shadow:0 0 10px rgb(242 166 90 / .5)}#jvHud.speak .jvh-mode{color:#F06D44;text-shadow:0 0 10px rgb(240 109 68 / .5)}
.jvh-r .core{transition:transform .3s;transform-box:view-box;transform-origin:100px 100px}
.jvh-r::before{content:"";position:absolute;inset:-12%;border-radius:50%;background:radial-gradient(closest-side,rgb(240 109 68 / .30),rgb(240 109 68 / .08) 55%,transparent 72%);transition:background .5s}
#jvHud.listen .jvh-r::before{background:radial-gradient(closest-side,rgb(134 207 160 / .32),rgb(134 207 160 / .08) 55%,transparent 72%)}
html.ix-on #flora,html.ix-on #mesh,html.ix-on #bgcurve,html.ix-on .dock,html.ix-on #scroller,html.jv-open #scroller,html.jv-open #flora,html.jv-open #mesh,html.jv-open #bgcurve,html.jv-open .dock{visibility:hidden}
@keyframes jvspin{to{transform:rotate(360deg)}}
@keyframes jvpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.09)}}
#jvHud.listen .core{animation:jvpulse .8s ease-in-out infinite}#jvHud.speak .core{animation:jvpulse .5s ease-in-out infinite}#jvHud.think .core{animation:jvpulse 1.6s ease-in-out infinite}
.jvh-mode{font:400 11px var(--mono);letter-spacing:.3em;text-transform:uppercase;color:#86CFA0;text-shadow:0 0 10px rgb(134 207 160 / .5)}
.jvh-sub{min-height:2.7em;max-width:94%;text-align:center;font:italic 500 19px/1.35 var(--serif);color:#F4EFE6;opacity:.92;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;padding:0 4px 2px}
.jvh-log{flex:0 1 auto;max-height:22vh;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:10px;margin:0 0 10px;border-radius:22px;background:rgb(255 255 255 / .04);border:1px solid rgb(255 255 255 / .08);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
.jvh-log:empty,.jvh-log:has(>.hint:only-child){display:none}
.jvh-log .jv-me{background:linear-gradient(135deg,#F06D44,#E0582F);color:#1A0D07}.jvh-log .jv-ai{background:rgb(255 255 255 / .08);color:#F4EFE6}
.jvh-log .jv-me,.jvh-log .jv-ai{font-size:14px;padding:8px 12px}
#jvHud .jv-stop{margin:0 0 10px}
#jvHud .jv-note{color:#F2A65A;text-align:center;font-size:12.5px;margin:0 0 8px}
.jvh-in{display:flex;gap:8px;align-items:center}
.jvh-in input{flex:1;min-width:0;height:50px;border-radius:25px;border:1px solid rgb(255 255 255 / .14);background:rgb(255 255 255 / .06);color:#F4EFE6;padding:0 18px;font:500 15px var(--ui)}
.jvh-in input::placeholder{color:rgb(244 239 230 / .45)}
.jvh-mic,.jvh-in #jvSend{width:50px;height:50px;border-radius:50%;display:grid;place-items:center;flex:none}
.jvh-mic{background:radial-gradient(circle at 35% 30%,#FFB089,#F06D44 60%,#B9431F);color:#1A0D07;box-shadow:0 0 0 6px rgb(240 109 68 / .14),0 0 26px rgb(240 109 68 / .5)}
#jvHud.listen .jvh-mic{background:radial-gradient(circle at 35% 30%,#CFF5DC,#86CFA0 60%,#2E7D52);box-shadow:0 0 0 8px rgb(134 207 160 / .18),0 0 30px rgb(134 207 160 / .6)}
.jvh-in #jvSend{background:rgb(255 255 255 / .1);color:#F4EFE6}
#jvHud .jv-sugg{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;margin-top:10px}#jvHud .jv-sugg::-webkit-scrollbar{display:none}
#jvHud .jv-sugg button{flex:none;background:rgb(255 255 255 / .06);border:1px solid rgb(255 255 255 / .1);color:#F4EFE6}

@media (prefers-reduced-motion:reduce){.jvh-r g{animation:none!important}}
/* toasts (Undo) show above the JARVIS screen */
#jvHud~.toast{z-index:90;bottom:calc(132px + env(safe-area-inset-bottom,0px))}
</style>`);
function jvReactor(){
  let t='';for(let i=0;i<72;i++){const a=i*5*Math.PI/180,l=i%6?92:88,c=Math.cos(a),s=Math.sin(a);t+=`<line x1="${(100+96*c).toFixed(2)}" y1="${(100+96*s).toFixed(2)}" x2="${(100+l*c).toFixed(2)}" y2="${(100+l*s).toFixed(2)}"/>`}
  let coils='';for(let i=0;i<10;i++){coils+=`<path d="M ${100+40*Math.cos(i*.628)} ${100+40*Math.sin(i*.628)} A 40 40 0 0 1 ${100+40*Math.cos(i*.628+.45)} ${100+40*Math.sin(i*.628+.45)}"/>`}
  return`<svg viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="jvCore"><stop offset="0" stop-color="#FFF7EC"/><stop offset=".35" stop-color="#FFC9A8"/><stop offset=".7" stop-color="#F06D44" stop-opacity=".85"/><stop offset="1" stop-color="#F06D44" stop-opacity="0"/></radialGradient></defs>
  <g class="r0" stroke="#F4EFE6" stroke-opacity=".38" stroke-width=".7">${t}</g>
  <g class="r1 glow" fill="none" stroke="#F06D44" stroke-width="2.6" stroke-linecap="round"><circle cx="100" cy="100" r="83" stroke-dasharray="46 10 8 10 2 10" /></g>
  <g class="r2 gl2" fill="none" stroke="#86CFA0" stroke-width="5" stroke-opacity=".75"><circle cx="100" cy="100" r="72" stroke-dasharray="1.6 3.2"/></g>
  <g class="r3" fill="none" stroke="#F2A65A" stroke-width="1.4"><circle cx="100" cy="100" r="61" stroke-dasharray="70 26 20 26"/><circle cx="100" cy="100" r="56" stroke-opacity=".35" stroke-dasharray="4 8"/></g>
  <g class="r4 glow" fill="none" stroke="#F06D44" stroke-width="9" stroke-opacity=".9">${coils}</g>
  <g class="core"><circle cx="100" cy="100" r="30" fill="url(#jvCore)"/><circle cx="100" cy="100" r="19" fill="none" stroke="#FFF2E4" stroke-opacity=".8" stroke-width="1.2"/>
  <text x="100" y="103.5" text-anchor="middle" font-family="Space Mono,monospace" font-size="8.5" font-weight="700" letter-spacing="1.6" fill="#2A1208">JARVIS</text></g></svg>`}
const SRC=window.SpeechRecognition||window.webkitSpeechRecognition;
const JH={rec:null,listening:false,heard:'',seen:new Set(),voice:null,lastSub:''};
function jvHudState(){const h=$('#jvHud');if(!h)return;const run=[...JV.log].some(x=>!x.reply&&(x.state==='running'||x.state==='queued')&&(x.at||0)>=JV.since&&Date.now()-(x.at||0)<6e5);
  const speaking=JH.playing||(typeof speechSynthesis!=='undefined'&&speechSynthesis.speaking);
  h.classList.toggle('listen',JH.listening);h.classList.toggle('think',!JH.listening&&run);h.classList.toggle('speak',!JH.listening&&!run&&speaking);
  const mic=$('#jvhMic');if(mic){mic.setAttribute('aria-pressed',String(!!JH.listening));mic.setAttribute('aria-label',JH.listening?'Stop listening':'Talk')}
  const m=$('#jvhMode');if(m&&!h.classList.contains('boot'))m.textContent=JH.listening?'Listening':run?'Working':speaking?'Speaking':'Standing by'}
function jvSay(text){try{if(typeof speechSynthesis==='undefined'||!text)return;if(speechSynthesis.speaking||speechSynthesis.pending)speechSynthesis.cancel();if(speechSynthesis.paused)speechSynthesis.resume();const u=new SpeechSynthesisUtterance(String(text).slice(0,400));
  const vs=speechSynthesis.getVoices();JH.voice=JH.voice||vs.find(v=>/Daniel|Arthur|en-GB/i.test(v.name+' '+v.lang)&&/en-GB/i.test(v.lang))||vs.find(v=>/en-GB/i.test(v.lang))||null;
  if(JH.voice)u.voice=JH.voice;u.lang=JH.voice?JH.voice.lang:'en-GB';u.rate=1.02;u.pitch=.92;u.onstart=u.onend=()=>jvHudState();speechSynthesis.speak(u);setTimeout(jvHudState,60)}catch(e){}}
function jvSub(t){const s=$('#jvhSub');if(s&&t!==JH.lastSub){JH.lastSub=t;s.textContent=t;try{s.animate([{opacity:0,transform:'translateY(6px)'},{opacity:.92,transform:'none'}],{duration:320,easing:'ease-out'})}catch(e){}}}
const _jvPaintH=jvPaint;jvPaint=function(){_jvPaintH();if(!$('#jvHud'))return;
  /* speak + subtitle replies that arrive while the screen is open */
  const all=[...JV.log,...JV.local];for(const x of all){const k=(x.id||x.at)+'|'+(x.reply?1:0);if(x.reply&&!JH.seen.has(k)){JH.seen.add(k);if(JH.armed){jvSub(x.reply);if(!JH.listening&&x.reply!=='Stopped.')jvSpeak(x.reply,x.local?null:x.id)}}}
  JH.armed=true;jvHudState()};
function jvListen(){
  if(JH.listening){jvFinish();return}
  if(!SRC){toast('Voice isn’t available here. Tap the text box and use the keyboard’s mic instead.');const i=$('#jvIn');if(i)i.focus();return}
  let wait=0;try{if(speechSynthesis.speaking){speechSynthesis.cancel();wait=300}}catch(e){}
  setTimeout(()=>{
    let r;try{r=new SRC()}catch(e){toast('Voice isn’t available here.');return}
    JH.rec=r;JH.done=false;JH.heard='';r.lang='en-US';r.interimResults=true;r.continuous=true;r.maxAlternatives=1;
    const bump=()=>{clearTimeout(JH.quiet);JH.quiet=setTimeout(jvFinish,1500)};
    r.onstart=()=>{JH.listening=true;JH.boost=1;jvSub('Listening…');jvHudState();clearTimeout(JH.cap);JH.cap=setTimeout(jvFinish,12000);JH.quiet=setTimeout(jvFinish,6000)};
    r.onresult=e=>{let t='';for(let i=0;i<e.results.length;i++)t+=e.results[i][0].transcript;JH.heard=t;JH.boost=1;jvSub(t);bump()};
    r.onerror=e=>{const m=e&&e.error;if(m==='not-allowed'||m==='service-not-allowed')jvSub('Allow the microphone and speech recognition for Life, then try again.');else if(m==='no-speech')jvSub('I didn’t catch that.');jvFinish()};
    r.onend=()=>jvFinish();
    try{r.start()}catch(e){JH.listening=false;jvHudState()}
  },wait)}
/* always ends: stop the recogniser, abort it if it hangs, then send what was heard (once) */
function jvFinish(){
  if(JH.done)return;JH.done=true;clearTimeout(JH.quiet);clearTimeout(JH.cap);
  const r=JH.rec;JH.listening=false;jvHudState();
  try{r&&r.stop()}catch(e){}setTimeout(()=>{try{r&&r.abort()}catch(e){}},500);
  const t=(JH.heard||'').trim();JH.heard='';if(t)setTimeout(()=>jvSend(t),120)}
/* the reactor spins by script so it can speed up and slow down smoothly: slow when idle, fast while you talk */
const JSPIN={a:[0,0,0,0,0],dir:[1,-1,1,-1,1],base:[5,14,22,32,9],speed:.35,raf:0,last:0};
function jvSpin(now){const h=$('#jvHud');if(!h){JSPIN.raf=0;return}
  const dt=Math.min(.05,(now-(JSPIN.last||now))/1000);JSPIN.last=now;
  const target=JH.listening?2.8*(1+(JH.boost||0)):h.classList.contains('think')?1.5:h.classList.contains('speak')?2:.35;
  JH.boost=Math.max(0,(JH.boost||0)-dt*1.5);JSPIN.speed+=(target-JSPIN.speed)*Math.min(1,dt*3);
  const gs=h.querySelectorAll('.jvh-r g[class^=r]');
  gs.forEach((g,i)=>{JSPIN.a[i]=(JSPIN.a[i]+JSPIN.dir[i]*JSPIN.base[i]*JSPIN.speed*dt)%360;g.setAttribute('transform',`rotate(${JSPIN.a[i].toFixed(2)} 100 100)`)});
  JSPIN.raf=requestAnimationFrame(jvSpin)}
openJarvis=function(){
  if($('#jvHud'))return;
  const h=document.createElement('div');h.id='jvHud';h.setAttribute('role','dialog');h.setAttribute('aria-modal','true');h.setAttribute('aria-label','JARVIS');JV.prevFocus=document.activeElement;
  h.innerHTML=`<div class="jvh-top"><span class="jvh-brand">J.A.R.V.I.S</span><button class="jvh-x" id="jvhX" aria-label="Close">${ic('close')}</button></div>
    ${syncOn()?'':`<p class="jv-note">Connect your server first (Settings → Connections).</p>`}
    <div class="jvh-stage"><div class="jvh-r" id="jvhR" aria-hidden="true">${jvReactor()}</div><div class="jvh-mode" id="jvhMode">Standing by</div><button class="jvh-hush" id="jvhHush" hidden aria-label="Stop speaking"><i></i>Stop speaking</button><button class="jvh-vbtn" id="jvhVoice" aria-label="Change voice">${ic('sparkles')}Voice</button><div class="jvh-vlist" id="jvhVlist" hidden></div><div class="jv-st jvh-st" id="jvSt"><i></i><span>Linking…</span></div><div class="jvh-sub" id="jvhSub">Tap the mic and talk.</div></div>
    <p class="jv-note" id="jvNote"></p><div class="jvh-log jv-log" id="jvLog"></div>
    <button class="jv-stop" id="jvStop" hidden>${ic('close')}Stop</button>
    <div class="jvh-in"><button class="jvh-mic" id="jvhMic" aria-label="Talk" aria-pressed="false">${ic('mic')}</button><input id="jvIn" placeholder="Or type a command" enterkeyhint="send" autocomplete="off"><button id="jvSend" aria-label="Send">${ic('send')}</button></div>
    <div class="jv-sugg">${['Brief me','Next bus','Start a 25 minute focus','What’s due this week?','Open Spotify','Lock my laptop'].map(s=>`<button data-jvs="${esc(s)}">${esc(s)}</button>`).join('')}</div>`;
  document.body.appendChild(h);
  /* modal: the page behind can't be reached by keyboard or screen reader while JARVIS is open */
  JV.inerted=[...document.body.children].filter(n=>n!==h&&!n.inert&&!/^(SCRIPT|STYLE|LINK)$/.test(n.tagName)&&!n.classList.contains('toast'));JV.inerted.forEach(n=>{n.inert=true});
  setTimeout(()=>{try{const m=h.querySelector('#jvhMic');if(m&&h.isConnected)m.focus({preventScroll:true})}catch(e){}},60);
  if(!JV.booted){JV.booted=1;h.classList.add('boot');const m=h.querySelector('#jvhMode');if(m)m.textContent='Initializing';setTimeout(()=>{h.classList.remove('boot');jvHudState()},1500)}JH.armed=false;JH.seen.clear();requestAnimationFrame(()=>h.classList.add('on'));JSPIN.last=0;if(!JSPIN.raf)JSPIN.raf=requestAnimationFrame(jvSpin);setTimeout(()=>document.documentElement.classList.add('jv-open'),380);
  jvLoad();clearInterval(JV.t);JV.t=setInterval(()=>{if(!$('#jvLog'))clearInterval(JV.t);else jvLoad()},4000);
  try{speechSynthesis&&speechSynthesis.getVoices()}catch(e){}
};
function closeJarvis(){const h=$('#jvHud');if(!h)return;try{JR.cancel&&(JR.on||JR.starting)&&JR.cancel()}catch(e){}JR.starting=false;(JV.inerted||[]).forEach(n=>{n.inert=false});JV.inerted=null;try{const f=JV.prevFocus;JV.prevFocus=null;if(f&&f.isConnected&&f.focus)f.focus({preventScroll:true})}catch(e){}try{typeof JA!=='undefined'&&JA.pause()}catch(e){}document.documentElement.classList.remove('jv-open');JH.done=true;clearTimeout(JH.quiet);clearTimeout(JH.cap);try{JH.rec&&JH.rec.abort()}catch(e){}JH.listening=false;try{speechSynthesis.cancel()}catch(e){}clearInterval(JV.t);h.classList.remove('on');setTimeout(()=>h.remove(),380)}
document.addEventListener('click',e=>{const b=e.target.closest('#jvhX,#jvhMic');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
  if(b.id==='jvhX')return closeJarvis();jvListen()},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#jvHud'))closeJarvis()});

/* ===================== opening: "Welcome, Ishir" · a phone twirls in 3D showing the app · glowing curves orbit
   around it (passing behind AND in front) · the phone's screen grows into the real app. Classic intro kept as an option. ===================== */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="ixcss">
#ix{position:fixed;inset:0;z-index:95;overflow:hidden;background:radial-gradient(80% 55% at 50% 42%,rgb(240 109 68 / .20),transparent 70%),radial-gradient(90% 60% at 50% 105%,rgb(46 125 82 / .38),transparent 70%),#080A09;
  display:grid;place-items:center;transition:opacity .45s ease}
#ix canvas{position:absolute;inset:0;width:100%;height:100%}
#ix .ixs{position:relative;width:150px;height:310px;perspective:900px;z-index:2}
#ix .ixp{position:absolute;inset:0;transform-style:preserve-3d;will-change:transform}
#ix .ixf,#ix .ixb{position:absolute;inset:0;border-radius:34px;backface-visibility:hidden;-webkit-backface-visibility:hidden}
#ix .ixb{transform:rotateY(180deg);background:linear-gradient(145deg,#2A2D2A,#121412 60%,#1C1F1C);box-shadow:inset 0 0 0 2px #3A3F3A}
#ix .ixb::before{content:"";position:absolute;left:16px;top:16px;width:44px;height:44px;border-radius:14px;background:#0A0B0A;box-shadow:inset 0 0 0 2px #2F332F}
#ix .ixb::after{content:"";position:absolute;inset:0;border-radius:inherit;background:radial-gradient(circle at 50% 55%,rgb(240 109 68 / .5),transparent 18%)}
#ix .ixf{background:#0B0D0B;box-shadow:0 0 0 3px #2F332F,0 0 0 4px #4A504A,0 30px 70px rgb(0 0 0 / .6),0 0 60px rgb(240 109 68 / .18);overflow:hidden}
#ix .ixsc{position:absolute;inset:6px;border-radius:29px;overflow:hidden;background:radial-gradient(120% 60% at 0 0,rgb(240 109 68 / .45),transparent 60%),radial-gradient(120% 60% at 100% 100%,rgb(46 125 82 / .6),transparent 60%),#0E110E}
#ix .ixsc i{position:absolute;display:block;border-radius:10px}
#ix .ixisl{left:50%;top:7px;width:44px;height:13px;margin-left:-22px;border-radius:8px!important;background:#000}
#ix .k1{left:10px;right:10px;top:30px;height:96px;border-radius:16px!important;background:linear-gradient(140deg,#5E7C63,#2C4234);box-shadow:inset 0 1px 0 rgb(255 255 255 / .2)}
#ix .k1::before{content:"";position:absolute;left:12px;top:16px;width:52px;height:52px;border-radius:50%;border:6px solid #F06D44;border-right-color:#F2A65A;border-bottom-color:rgb(255 255 255 / .15)}
#ix .k1::after{content:"";position:absolute;left:76px;right:12px;top:22px;height:6px;border-radius:3px;background:rgb(255 255 255 / .55);box-shadow:0 14px 0 rgb(255 255 255 / .3),0 28px 0 rgb(255 255 255 / .3)}
#ix .k2{left:10px;width:58px;top:134px;height:50px;background:rgb(255 255 255 / .08)}
#ix .k3{right:10px;width:58px;top:134px;height:50px;background:rgb(240 109 68 / .5)}
#ix .k4{left:10px;right:10px;top:192px;height:40px;background:rgb(255 255 255 / .07)}
#ix .k5{left:10px;right:44px;bottom:12px;height:26px;border-radius:13px!important;background:rgb(255 255 255 / .1)}
#ix .k6{right:10px;bottom:12px;width:26px;height:26px;border-radius:50%!important;background:#F06D44}
#ix .ixsc::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgb(255 255 255 / .16) 45%,transparent 60%);transform:translateX(-120%);animation:ixsheen 1.2s .5s ease-in-out forwards}
@keyframes ixsheen{to{transform:translateX(120%)}}
#ix .ixw{position:absolute;left:0;right:0;top:calc(50% - 250px);text-align:center;z-index:3;font:500 clamp(30px,9vw,44px)/1.1 var(--serif);color:#F4EFE6;opacity:0;letter-spacing:-.01em}
#ix .ixw em{font-style:italic;color:#F06D44}
</style>`);
/* ===== opening v4: compositor-only. The vines/leaves are painted ONCE into three canvases (with glow), then only
   transform + opacity animate: they spiral in, curl, then spiral into the ring around your avatar. The cover fades,
   the background flares, and parts of Home light up in a wave. Covers the full screen (iOS reports a shorter height). ===== */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="ix4css">
#ix3{position:fixed;left:0;right:0;top:0;height:calc(100vh + 140px);height:calc(100lvh + 140px);z-index:2147483000;pointer-events:none;overflow:hidden;contain:strict}
#ix3 .bg{position:absolute;inset:0;background:radial-gradient(80% 50% at 50% 40%,rgb(240 109 68 / .16),transparent 70%),radial-gradient(90% 50% at 50% 95%,rgb(46 125 82 / .30),transparent 70%),#080A09}
#ix3 canvas{position:absolute;left:0;top:0;will-change:transform,opacity;opacity:0}
#ix3 .sh{position:absolute;left:50%;top:var(--ixh,50vh);width:min(120vw,560px);height:220px;margin:-110px 0 0 calc(min(120vw,560px) / -2);border-radius:50%;background:radial-gradient(closest-side,rgb(6 8 7 / .92),rgb(6 8 7 / .7) 55%,transparent 100%);opacity:0;will-change:opacity}
#ix3 .wl{position:absolute;left:0;right:0;top:calc(var(--ixh,50vh) - .55em);text-shadow:0 2px 18px rgb(0 0 0 / .9),0 0 2px rgb(0 0 0 / .8);text-align:center;font:500 clamp(28px,8.5vw,40px)/1.1 var(--serif);color:#F4EFE6;opacity:0;will-change:transform,opacity}
#ix3 .wl em{font-style:italic;color:#F06D44}
#ix3 .rg{position:absolute;border-radius:50%;border:2.5px solid #F2A65A;box-shadow:0 0 14px rgb(240 109 68 / .9),0 0 34px rgb(240 109 68 / .45),inset 0 0 12px rgb(240 109 68 / .6);opacity:0;will-change:transform,opacity}
#ixGlow{position:fixed;left:0;right:0;top:0;height:calc(100vh + 140px);height:calc(100lvh + 140px);z-index:4;pointer-events:none;opacity:0;will-change:opacity,transform;
  background:radial-gradient(60% 40% at 20% 10%,rgb(240 109 68 / .30),transparent 70%),radial-gradient(70% 45% at 85% 55%,rgb(134 207 160 / .20),transparent 70%),radial-gradient(80% 40% at 30% 100%,rgb(63 163 107 / .30),transparent 70%)}
.ixg{animation:ixgl 1.5s ease-out both}
@keyframes ixgl{0%{box-shadow:0 0 0 0 rgb(242 166 90 / 0)}25%{box-shadow:0 0 0 1px rgb(242 166 90 / .9),0 0 22px rgb(240 109 68 / .6)}100%{box-shadow:0 0 0 0 rgb(242 166 90 / 0),0 0 0 rgb(240 109 68 / 0)}}
.ixt{animation:ixtx 1.3s ease-out both}@keyframes ixtx{0%{text-shadow:0 0 14px rgb(240 109 68 / .9)}100%{text-shadow:none}}
</style>`);
function ixPaint(cv,W,H,L,cx,cy){
  const dpr=Math.min(W*H>700000?1.25:2,devicePixelRatio||1);cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px';
  const x=cv.getContext('2d');if(!x)return;x.scale(dpr,dpr);x.lineCap='round';
  let seed=11+L*97;const r=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const C=[['#F06D44','240,109,68'],['#86CFA0','134,207,160'],['#F2A65A','242,166,90'],['#3FA36B','63,163,107']];
  for(let i=0;i<3;i++){const c=C[(i+L)%4],a=(i/3+L/9)*Math.PI*2+r()*.6,R=Math.max(W,H)*.8,q=Math.min(W,H)*(.16+r()*.2);
    const p=[[cx+Math.cos(a)*R,cy+Math.sin(a)*R],[cx+Math.cos(a+.8)*R*.5,cy+Math.sin(a+.8)*R*.5],[cx+Math.cos(a+1.7)*q*1.8,cy+Math.sin(a+1.7)*q*1.8],[cx+Math.cos(a+2.4)*q,cy+Math.sin(a+2.4)*q],[cx+Math.cos(a+3.3)*q*.45,cy+Math.sin(a+3.3)*q*.45]];
    const path=()=>{x.beginPath();x.moveTo(p[0][0],p[0][1]);x.bezierCurveTo(p[1][0],p[1][1],p[2][0],p[2][1],p[3][0],p[3][1]);x.quadraticCurveTo(p[4][0]+30,p[4][1]-20,p[4][0],p[4][1])};
    x.shadowColor=`rgba(${c[1]},.9)`;x.shadowBlur=16;x.strokeStyle=`rgba(${c[1]},.35)`;x.lineWidth=7;path();x.stroke();
    x.shadowBlur=6;x.strokeStyle=c[0];x.lineWidth=2.2;path();x.stroke();
    /* curl at the end */
    x.beginPath();x.arc(p[4][0],p[4][1],7+r()*6,0,Math.PI*1.5);x.lineWidth=1.8;x.stroke()}
  x.shadowBlur=10;
  for(let k=0;k<7;k++){const lx=W*(.08+r()*.84),ly=H*(.1+r()*.75),s=.9+r()*1.3,rot=r()*6.28;x.save();x.translate(lx,ly);x.rotate(rot);x.scale(s,s);
    x.shadowColor='rgba(134,207,160,.6)';x.fillStyle=r()<.55?'#2E7D52':'#86CFA0';x.beginPath();x.moveTo(0,0);x.bezierCurveTo(5,-7,16,-8,24,0);x.bezierCurveTo(16,8,5,7,0,0);x.fill();x.restore()}
  for(let k=0;k<10;k++){x.shadowColor='rgba(240,109,68,.9)';x.fillStyle=r()<.5?'#F06D44':'#F2A65A';x.beginPath();x.arc(W*r(),H*r(),1.2+r()*2.2,0,7);x.fill()}
}
/* ===================== intro v5: glass + splines + pixel art + pixel-wave reveal =====================
   One clock. Phase A (0..TA): waves draw in over a dark pixel grid, glass panes float up, a pixel-art sprout builds,
   greeting appears. Phase B (TA..T), everything at once: the dark dissolves as a wave of pixels from the centre
   (Home shows underneath), the sprout explodes, waves swell and fade, glass panes morph onto Home's cards,
   greeting flies into the header. Then the glow burst. */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="ix5css">
#ix3.ix5{background:none}
#ix3.ix5 canvas{position:absolute;left:0;top:0;opacity:1}
#ix3.ix5 .rg{position:absolute;box-sizing:border-box;border:2px solid rgb(255 236 214 / .9);border-radius:50%;box-shadow:0 0 18px rgb(255 176 122 / .55),inset 0 0 14px rgb(255 176 122 / .35);opacity:0;will-change:transform,opacity;z-index:3}
#ix3.ix5 .fb{position:absolute;border-radius:50%;background:radial-gradient(circle at 35% 30%,#FFD2B8,#F06D44 60%,#C94E2A);box-shadow:0 0 16px rgb(240 109 68 / .8),0 0 40px rgb(240 109 68 / .4);opacity:0;will-change:transform,opacity;z-index:3}
#ix3.ix5 .gp{position:absolute;left:0;top:0;border-radius:28px;opacity:0;transform-origin:0 0;will-change:transform,opacity;overflow:hidden;
  background:linear-gradient(135deg,rgb(255 255 255 / .16),rgb(255 255 255 / .04) 55%,rgb(240 109 68 / .06));
  border:1px solid rgb(255 255 255 / .24);
  box-shadow:inset 0 1px 0 rgb(255 255 255 / .4),inset 0 -24px 48px rgb(240 109 68 / .12),inset 0 24px 48px rgb(134 207 160 / .08),0 24px 60px rgb(0 0 0 / .5);
  background:linear-gradient(135deg,rgb(255 255 255 / .2),rgb(255 255 255 / .07) 55%,rgb(240 109 68 / .1))!important}
#ix3.ix5 .gp i{position:absolute;inset:-40%;will-change:transform;background:linear-gradient(115deg,transparent 42%,rgb(255 255 255 / .22) 50%,transparent 58%);animation:ix5sh 2.4s .2s ease-in-out infinite}
@keyframes ix5sh{0%{transform:translateX(-45%)}60%,100%{transform:translateX(45%)}}
#ix3.ix5 .wl{z-index:5}
</style>`);
const IX_SPRITE=[
"....ooo....",
"...oOOOo...",
"....ooo....",
".....s.....",
".gg..s..gg.",
"gGGg.s.gGGg",
"gGGGgsgGGGg",
".gGGgsgGGg.",
"..ggssgg...",
".....s.....",
"...aaaaa...",
"..aAAAAAa..",
"...aaaaa..."];
const IX_COL={o:'#F06D44',O:'#FFB07A',s:'#2E7D52',g:'#3FA36B',G:'#86CFA0',a:'#F2A65A',A:'#FFD08A'};
function ixRun(preview){
  if($('#ix3'))return;
  const W=innerWidth,H=innerHeight,cx=W/2,cy=H*.47;
  const TA=700,T=2300,MOVE=T-TA,EZ='cubic-bezier(.65,0,.35,1)';
  const ez=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2,eo=k=>1-Math.pow(1-k,3),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  const el=document.createElement('div');el.id='ix3';el.className='ix5';el.setAttribute('aria-hidden','true');
  el.innerHTML=`<canvas class="cv"></canvas><canvas class="fx"></canvas><div class="gp g3"><i></i></div><div class="gp g2"><i></i></div><div class="gp g1"><i></i></div><div class="rg"></div><div class="fb"></div><div class="wl"></div>`;
  el.style.background='#070908';document.body.appendChild(el);{const b0=document.getElementById('boot0');if(b0)b0.remove()}
  document.documentElement.classList.remove('ix-on');document.documentElement.classList.add('ix-run');window.__ixLive=true;
  try{splashBg.style.display='none';splash.style.display='none'}catch(e){}
  if(!preview){SC.style.opacity='1';SC.style.transition='none'}
  const HH=Math.max(H,el.getBoundingClientRect().height||H),dpr0=devicePixelRatio||1;
  const mk=(c,d)=>{c.width=Math.round(W*d);c.height=Math.round(HH*d);c.style.width=W+'px';c.style.height=HH+'px';const x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);return x};
  const cv=el.querySelector('.cv'),fxc=el.querySelector('.fx'),M=mk(cv,Math.min(1.5,dpr0)),X=mk(fxc,Math.min(1.5,dpr0)),P=X;
  /* backdrop: near-black with theme glows and a faint pixel dot grid, painted once */
  const S=Math.round(cl(W/28,14,26)),cols=Math.ceil(W/S),rows=Math.ceil(HH/S);
  const B=M;
  B.fillStyle='#070908';B.fillRect(0,0,W,HH);
  const rg=(x,y,r,c)=>{const g=B.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');B.fillStyle=g;B.fillRect(0,0,W,HH)};
  rg(W*.15,HH*.12,W*.9,'rgba(240,109,68,.20)');rg(W*.9,HH*.85,W*.95,'rgba(46,125,82,.34)');rg(cx,cy,W*.6,'rgba(242,166,90,.08)');
  B.fillStyle='rgba(255,255,255,.07)';for(let i=0;i<=cols;i++)for(let j=0;j<=rows;j++)B.fillRect(i*S-.75,j*S-.75,1.5,1.5);
  /* every pixel cell gets a reveal moment: distance from the centre plus a little noise */
  const hash=(i,j)=>{let h=(i*374761393+j*668265263)^0x5bd1e995;h=(h^(h>>>13))*1274126177;return((h^(h>>>16))>>>0)/4294967295};
  const dmax=Math.hypot(Math.max(cx,W-cx),Math.max(cy,HH-cy)),cells=[];
  for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const x=i*S,y=j*S,d=Math.hypot(x+S/2-cx,y+S/2-cy)/dmax,n=hash(i,j);cells.push({x,y,rv:cl(d*.86+(n-.5)*.16,0,.98),n,i,j})}
  const grid=new Array(cols*rows);cells.forEach(c=>grid[c.i*rows+c.j]=c);cells.sort((a,b)=>a.rv-b.rv);let ptr=0;
  const TC=['240,109,68','134,207,160','242,166,90','63,163,107','255,176,122','156,214,126'];
  /* glass panes: centred, measured for the greeting */
  const g1=el.querySelector('.g1'),g2=el.querySelector('.g2'),g3=el.querySelector('.g3');
  const pw=Math.min(W-40,340),ph=Math.min(230,H*.3),P1={x:cx-pw/2,y:cy-ph/2,w:pw,h:ph},P2={x:Math.max(14,cx-pw*.6),y:cy-ph*.9,w:pw*.58,h:ph*.58},P3={x:Math.min(W-14-pw*.52,cx+pw*.1),y:cy+ph*.3,w:pw*.52,h:ph*.52};
  const place=(g,r)=>Object.assign(g.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'});
  place(g1,P1);place(g2,P2);place(g3,P3);
  const A=(n,k,o)=>{try{return n&&n.animate(k,o)}catch(e){return null}};
  /* all three panes arrive together, on one curve (no 3D tilt: it rendered jagged on iPhone) */
  [[g3,-6],[g2,5],[g1,0]].forEach(([g,rot])=>{g.style.transformOrigin='50% 50%';A(g,[{opacity:0,transform:`translateY(28px) rotate(${rot*1.8}deg) scale(.94)`},
    {opacity:1,transform:`translateY(0) rotate(${rot}deg) scale(1)`}],{duration:TA*.9,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'})});
  /* two more things that land on Home: a ring (-> your avatar) and a warm dot (-> the + button) */
  const rgE=el.querySelector('.rg'),fbE=el.querySelector('.fb'),RR=Math.round(Math.min(pw,ph)*.19),R0={x:cx-RR,y:P1.y+ph*.3-RR,w:RR*2,h:RR*2},FD=14,F0={x:cx-FD/2,y:P1.y+ph*.78-FD/2,w:FD,h:FD};
  place(rgE,R0);place(fbE,F0);
  A(rgE,[{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'scale(1)'}],{duration:TA*.8,delay:TA*.25,easing:'cubic-bezier(.2,.8,.25,1)',fill:'both'});
  A(fbE,[{opacity:0,transform:'scale(.2)'},{opacity:1,transform:'scale(1)'}],{duration:TA*.6,delay:TA*.45,easing:'cubic-bezier(.2,.8,.25,1)',fill:'both'});
  /* greeting: exact copy of #hi, centred under the sprite, then flown onto #hi */
  const wl=el.querySelector('.wl'),HI=()=>document.getElementById('hi'),hi0=HI();
  const rng=n=>{const r=document.createRange();r.selectNodeContents(n);return r.getBoundingClientRect()};
  const tvis=n=>{if(!n||!n.textContent.trim())return null;const r=rng(n);return r.width>0&&r.bottom>0&&r.top<innerHeight?r:null};
  let ox=0,oy=0,w0=1,h0=1;const gOK=!!tvis(hi0);
  if(gOK){const cs=getComputedStyle(hi0),em0=hi0.querySelector('em');wl.innerHTML=hi0.innerHTML;
    Object.assign(wl.style,{left:'0',top:'0',right:'auto',width:'max-content',whiteSpace:'nowrap',transformOrigin:'0 0',opacity:'0',fontFamily:cs.fontFamily,fontWeight:cs.fontWeight,fontStyle:cs.fontStyle,fontSize:cs.fontSize,lineHeight:cs.lineHeight,letterSpacing:cs.letterSpacing,color:cs.color});
    wl.querySelectorAll('br').forEach(n=>n.remove());wl.querySelectorAll('.gl').forEach(n=>n.style.display='inline-block');
    const em=wl.querySelector('em');if(em&&em0){const ec=getComputedStyle(em0);em.style.marginLeft=ec.marginLeft;em.style.color=ec.color;em.style.fontStyle=ec.fontStyle}}
  else wl.innerHTML=`Welcome, <em>${esc(firstName())}</em>`;
  const meas=()=>{const tf=wl.style.transform;wl.style.transform='none';const b=wl.getBoundingClientRect(),r=rng(wl);ox=r.left-b.left;oy=r.top-b.top;w0=Math.max(1,r.width);h0=Math.max(1,r.height);wl.style.transform=tf};
  if(gOK){meas();try{document.fonts&&document.fonts.ready.then(()=>{if(el.isConnected)meas()})}catch(e){}}
  const fs=parseFloat(wl.style.fontSize)||28,gy=P1.y+ph*.56;
  let lastT=null,goB=false,glowed=false,homeOn=false,pre=null;const pdpr=Math.min(1.5,dpr0);
  let t0=performance.now();
  const FL=[];let fl0=0;
  const frame=now=>{if(fl0)FL.push(Math.round(now-fl0));fl0=now;if(now-t0>=T&&FL.length&&!preview){try{const s=FL.slice(2),sl=s.filter(x=>x>20);localStorage.setItem('ixperf',JSON.stringify({at:new Date().toISOString(),frames:s.length,avgFps:Math.round(1000*s.length/s.reduce((a,b)=>a+b,0)),slow:sl.length,worst:Math.max(...s),slowAt:FL.map((d,i)=>[d,FL.slice(0,i).reduce((a,b)=>a+b,0)]).filter(x=>x[0]>20).map(x=>x[1]+'ms:'+x[0]).join(' ')}))}catch(e){}FL.length=0}
    const _c0=performance.now();try{frame0(now)}finally{if(window.__ixProf)window.__ixProf.push([now-t0,performance.now()-_c0])}};
  const frame0=now=>{
    if(!el.isConnected){const h=HI();if(h)h.style.opacity='';return}
    const t=now-t0,pa=cl(t/TA,0,1),pb=t<TA?0:cl((t-TA)/MOVE,0,1),eb=ez(pb);
    if(t>=TA&&!goB){goB=true;phaseB()}
    /* ---- base canvas: unrevealed dark pixels, glowing front, twinkles, waves ---- */
    if(!pre&&t>=TA-200)premeasure();
    X.clearRect(0,0,W,HH);
    const rk=cl(pb/.8,0,1),front=pb>0?(rk<.5?2*rk*rk:1-Math.pow(-2*rk+2,2)/2)*1.06:-1;
    /* erase only the cells the wave front passed since the last frame */
    while(ptr<cells.length&&cells[ptr].rv<=front){const c=cells[ptr++];M.clearRect(c.x-.5,c.y-.5,S+1,S+1)}
    if(pb>0&&front<1.06){
      for(let q=ptr-1;q>=0&&cells[q].rv>front-.055;q--){const c=cells[q],k=1-(front-c.rv)/.055,z=(S-2)*k*k;X.fillStyle=`rgba(${c.n<.5?'255,176,122':'242,166,90'},${.2+.5*k})`;X.fillRect(c.x+S/2-z/2,c.y+S/2-z/2,z,z)}
      for(let q=ptr;q<cells.length&&cells[q].rv<=front+.03;q++){const c=cells[q],k=1-(c.rv-front)/.03;X.fillStyle=`rgba(255,238,216,${.15+.55*k})`;X.fillRect(c.x+1,c.y+1,S-2,S-2)}}
    /* ---- greeting ---- */
    const Sg=gOK?Math.min((pw-28)/w0,Math.max(1,Math.min(34,W*.08)/fs)):1;
    let s=Sg,Xg=cx-w0*s/2-ox*s,Yg=gy-h0*s/2-oy*s,o=1;
    if(t<TA){const k=eo(cl((t-TA*.35)/(TA*.65),0,1));o=k;Yg+=10*(1-k)}
    else if(gOK){const r=tvis(HI())||lastT;if(r){lastT=r;const ebg=ez(cl(pb/.62,0,1)),st=r.width/w0;Xg+=(r.left-ox*st-Xg)*ebg;Yg+=(r.top-oy*st-Yg)*ebg;s+=(st-s)*ebg}}
    else o=1-eb;
    const h=HI();
    if(h&&h.style.transition!=='none')h.style.transition='none';
    if(gOK){if(t>T-200){const k=cl((t-(T-200))/200,0,1);o=1-k;if(h)h.style.opacity=String(k)}else if(h)h.style.opacity='0'}
    wl.style.opacity=String(o);wl.style.transform=`translate(${Xg}px,${Yg}px) scale(${s})`;
    if(t<T)requestAnimationFrame(frame);
    else{wl.style.opacity='0';if(h){h.style.opacity='';h.style.transition=''}window.__ixEnd=t;if(!glowed){glowed=true;ixGlowAll()}A(el,[{opacity:1},{opacity:0}],{duration:180,fill:'forwards'});setTimeout(done,190)}
  };
  /* measure where the panes will land a moment before the shatter, so the shatter frame does no layout work */
  function premeasure(){
    if(!homeOn){homeOn=true;document.documentElement.classList.remove('ix-on')}
    const dockTop=(document.querySelector('.dock .tabs')||{getBoundingClientRect:()=>({top:innerHeight})}).getBoundingClientRect().top;
    /* a card counts if its top is on screen above the dock; a tall card is cut at the dock, so the pane lands on the part you see */
    const box=n=>{const r=n&&n.getBoundingClientRect();if(!(r&&r.width>W*.4&&r.height>40&&r.top>=0&&r.top<dockTop-70))return null;
      const b=Math.min(r.bottom,dockTop-10);return{left:r.left,top:r.top,width:r.width,height:b-r.top,right:r.right,bottom:b}};
    const tg=[...document.querySelectorAll('#view .hero,#view .banner,#view .sec .card-s,#view .tiles,#view .chips')].map(n=>[n,box(n),getComputedStyle(n).borderRadius]).filter(x=>x[1]).sort((a,b)=>a[1].top-b[1].top);
    const used=new Set(),pick=()=>{for(const x of tg)if(!used.has(x[0])&&![...used].some(u=>u.contains(x[0])||x[0].contains(u))){used.add(x[0]);return x}return null};
    pre=[pick(),pick(),pick()];   /* a pane with no card of its own fades where it is (never stacks on another) */
  }
  function phaseB(){
    if(!el.isConnected)return;window.__ixB=performance.now()-t0;el.style.background='transparent';document.documentElement.classList.remove('ix-run');
    if(!pre)premeasure();
    /* glass panes morph exactly onto Home's cards (FLIP), then hand over */
    [[g1,P1,0,pre[0]],[g2,P2,5,pre[1]],[g3,P3,-6,pre[2]]].forEach(([g,src,rot,tx])=>{
      g.getAnimations().forEach(a=>a.cancel());
      if(!tx){A(g,[{opacity:1,transform:`rotate(${rot}deg)`},{opacity:0,transform:`rotate(${rot}deg) scale(.96)`}],{duration:500,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'});return}
      const [n,r,br]=tx,R0=getComputedStyle(g).borderRadius||'28px';
      const gl=document.createElement('b');gl.style.cssText='position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;will-change:opacity;box-shadow:inset 0 0 0 1.5px rgb(255 214 170 / .85),inset 0 0 22px rgb(240 109 68 / .35)';g.appendChild(gl);
      const o={duration:900,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'};
      A(g,[{left:src.x+'px',top:src.y+'px',width:src.w+'px',height:src.h+'px',borderRadius:R0,transform:`rotate(${rot}deg)`,opacity:1,offset:0},
           {left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',borderRadius:br||'24px',transform:'rotate(0deg)',opacity:1,offset:.8},
           {left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',borderRadius:br||'24px',transform:'rotate(0deg)',opacity:0,offset:1}],o);
      A(gl,[{opacity:0},{opacity:0,offset:.5},{opacity:1,offset:.8},{opacity:0}],{duration:900,fill:'both'});
    });
    /* ring -> avatar, dot -> the + button: same glide, same clock */
    const flip=(n,src,tgt,rad,dur,delay)=>{n.getAnimations().forEach(a=>a.cancel());if(!tgt){A(n,[{opacity:1},{opacity:0}],{duration:MOVE*.5,easing:EZ,fill:'forwards'});return}
      place(n,{x:tgt.left,y:tgt.top,w:tgt.width,h:tgt.height});n.style.borderRadius=rad;
      const sx=src.w/tgt.width,sy=src.h/tgt.height;n.style.transformOrigin='0 0';
      A(n,[{transform:`translate(${src.x-tgt.left}px,${src.y-tgt.top}px) scale(${sx},${sy})`,opacity:1},{transform:'none',opacity:1,offset:.78},{transform:'none',opacity:0}],{duration:dur,delay,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'})};
    const box=n=>{const r=n&&n.getBoundingClientRect();return r&&r.width>10&&r.bottom>0&&r.top<innerHeight?r:null};
    flip(rgE,R0,box(document.getElementById('avBtn')),'50%',980,40);
    flip(fbE,F0,box(document.querySelector('.dock .fab')),'50%',1050,90);
  }
  const done=()=>{if(!el.isConnected||window.__ixHold)return;el.remove();document.documentElement.classList.remove('ix-run');window.__ixLive=false;if(window.__ixPend){window.__ixPend=false;setTimeout(()=>render(false),60)}const h=HI();if(h)h.style.transition='';if(h)h.style.opacity='';if(!preview){SC.style.transition='';setTimeout(endSplash,1500)}};
  /* let Home and the overlay paint first (the expensive frame), then start every animation on one clock */
  const pre0=el.getAnimations({subtree:true});pre0.forEach(x=>x.pause());
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!el.isConnected)return;t0=performance.now();pre0.forEach(x=>x.play());requestAnimationFrame(frame)}));
  setTimeout(()=>{if(!glowed&&el.isConnected){glowed=true;try{ixGlowAll()}catch(e){}}done()},T+2500);
}
/* end of intro: a lot of Home lights up at once (one bloom, same moment), then fades.
   Halos are drawn on their own layer so the cards' glass/blur is never touched. */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="ixglocss">
#ixGlo{position:fixed;inset:0;z-index:2147482999;pointer-events:none;overflow:hidden}
#ixGlo i{position:absolute;box-sizing:border-box;opacity:0;will-change:opacity,transform}
.ixtg{animation:ixtg 1.8s cubic-bezier(.22,1,.36,1) both}
@keyframes ixtg{0%{text-shadow:0 0 0 rgb(240 109 68 / 0)}20%{text-shadow:0 0 10px rgb(255 176 122 / .95),0 0 26px rgb(240 109 68 / .7)}100%{text-shadow:0 0 0 rgb(240 109 68 / 0)}}
.ixsg{animation:ixsg 1.8s cubic-bezier(.22,1,.36,1) both}
@keyframes ixsg{0%{filter:none}20%{filter:drop-shadow(0 0 6px rgb(255 176 122 / .95)) drop-shadow(0 0 16px rgb(240 109 68 / .6))}100%{filter:none}}
@media (prefers-reduced-motion:reduce){#ixGlo{display:none}.ixtg,.ixsg{animation:none}}
</style>`);
function ixGlowAll(){
  try{
    const old=document.getElementById('ixGlo');if(old)old.remove();
    const vis=n=>{const r=n.getBoundingClientRect();return r.width>=16&&r.height>=16&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth&&getComputedStyle(n).visibility!=='hidden'?r:null};
    const sel='#avBtn,.top .ib,#view .hero,#view .card-s,#view .banner,#view .tile,#view .ts-tile,#view .chip,#view .pill,#view button,#view input,.dock .fab,.dock';
    const seen=new Set(),items=[];
    document.querySelectorAll(sel).forEach(n=>{if(seen.has(n)||n.closest('#ix3,#ixGlo'))return;seen.add(n);const r=vis(n);if(!r)return;const br=parseFloat(getComputedStyle(n).borderTopLeftRadius)||0;if(br<6)return;if(!n.matches('.dock,.dock *,#view .hero,#view .card-s')){const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);if(!t||!(n===t||n.contains(t)))return}items.push([n,r])});
    const lay=document.createElement('div');lay.id='ixGlo';lay.setAttribute('aria-hidden','true');
    const C=['240 109 68','134 207 160','242 166 90','99 196 133'];
    items.slice(0,16).forEach(([n,r],i)=>{
      const c=C[i%4],big=r.width*r.height>40000,b=document.createElement('i');
      b.style.cssText=`will-change:opacity;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;border-radius:${getComputedStyle(n).borderRadius||'16px'};`+
        `border:2px solid rgb(${c} / 1);box-shadow:0 0 ${big?26:16}px rgb(${c} / .8),0 0 ${big?60:34}px rgb(${c} / .45),inset 0 0 ${big?24:12}px rgb(${c} / .45)`;
      lay.appendChild(b);
      try{b.animate([{opacity:0},{opacity:1,offset:.2},{opacity:.85,offset:.45},{opacity:0}],{duration:2000,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'})}catch(e){}
    });
    document.body.appendChild(lay);setTimeout(()=>lay.remove(),2100);
    const tx=[...document.querySelectorAll('#hi')].filter(vis);
    const sv=[];
    tx.forEach(n=>{n.classList.remove('ixtg');void n.offsetWidth;n.classList.add('ixtg')});
    sv.forEach(n=>{n.classList.remove('ixsg');void n.offsetWidth;n.classList.add('ixsg')});
    setTimeout(()=>{tx.forEach(n=>n.classList.remove('ixtg'));sv.forEach(n=>n.classList.remove('ixsg'))},1900);
  }catch(e){}
}
const _runSplash4=runSplash;runSplash=function(){if((db.settings.intro||'orbit')==='classic')return _runSplash4();ixRun(false)};
document.addEventListener('click',e=>{if(e.target.closest('[data-introplay]')){e.preventDefault();e.stopImmediatePropagation();closeSheet();setTimeout(()=>ixRun(true),350)}},true);

/* greeting + name always on ONE line; the font shrinks only as much as needed to fit */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="hicss">#hi br{display:none}#hi em{margin-left:.26em}#hi{white-space:nowrap;overflow:visible}#hi .hl1,#hi em{display:inline}</style>`);
fitHello=function(){const h=$('#top .hello h1');if(!h)return;h.style.transition='none';h.style.fontSize='';
  const avail=h.parentElement?h.parentElement.clientWidth:h.clientWidth;if(!avail)return;
  const r=document.createRange();r.selectNodeContents(h);const w=r.getBoundingClientRect().width;
  if(w>avail){const fs=parseFloat(getComputedStyle(h).fontSize);h.style.fontSize=Math.max(13,fs*avail/w*.97).toFixed(1)+'px'}requestAnimationFrame(()=>h.style.transition='')};
(function(){const t=document.getElementById('top');if(!t||!window.MutationObserver)return;let last=t.classList.contains('float');
  new MutationObserver(()=>{const f=t.classList.contains('float');if(f!==last){last=f;requestAnimationFrame(()=>fitHello())}}).observe(t,{attributes:true,attributeFilter:['class']});
  /* the header animates between floating and normal; measuring mid-animation gave a too-big greeting that ran into the buttons.
     Re-fit whenever the greeting's box actually changes width and once the header's transitions finish. */
  const hb=t.querySelector('.hello');let lw=0,tm=0;const refit=()=>{clearTimeout(tm);tm=setTimeout(fitHello,60)};
  if(hb&&window.ResizeObserver)new ResizeObserver(es=>{const w=Math.round(es[0].contentRect.width);if(w!==lw){lw=w;refit()}}).observe(hb);
  t.addEventListener('transitionend',e=>{if(e.target===t||e.target.closest('.ib,.av,.hello'))refit()});})();
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="hgap">#top .hello{min-width:0;margin-right:10px}</style>`);

(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="hwfix">
.hero.hasw>*:not(.hart):not(.hero-actions):not(.cbar):not(.mstats):not([class*=stat]):not(.hero-art){max-width:calc(100% - 96px)}
.hero.hasw>.cap:first-of-type,.hero.hasw>.cap{max-width:40%}
#jvHud .jvh-top{min-height:48px}
#jvHud .jvh-x{width:38px;height:38px}
#jvHud .jvh-st{margin:22px 2px 14px;flex-wrap:wrap;row-gap:10px}
#jvHud .jvh-st .jv-act{margin-left:auto}
</style>`);

(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="jvfix2">
#jvHud .jvh-st{margin:2px 0 0;justify-content:center;flex-wrap:nowrap;gap:10px;min-height:32px;max-width:100%}
#jvHud .jvh-st span{flex:0 1 auto}
#jvHud .jvh-st .jv-act{margin-left:4px;height:30px}
</style>`);

(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="topfix">.top.float::before{display:none!important}</style>`);

/* ===== wide screens (iPad / landscape / laptop): predictable grid instead of newspaper columns =====
   full-width: chips, hero, banners, week/timeline, notebooks, footers; everything else fills 2-3 even columns left to right */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="widegrid">
html:not([data-lay="port"]) .pane{columns:auto!important;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr));column-gap:24px;row-gap:0;align-items:start;grid-auto-flow:row dense}
html:not([data-lay="port"]) .pane>*{grid-column:auto;min-width:0}
html:not([data-lay="port"]) .pane>.chips,html:not([data-lay="port"]) .pane>.hero,html:not([data-lay="port"]) .pane>.banner,html:not([data-lay="port"]) .pane>.qbar,
html:not([data-lay="port"]) .pane>.sprig,html:not([data-lay="port"]) .pane>.lay-wide,html:not([data-lay="port"]) .pane>.sec:has(.wk),html:not([data-lay="port"]) .pane>.sec:has(.abars),
html:not([data-lay="port"]) .pane>.sec:has(#nbStrip),html:not([data-lay="port"]) .pane>.sec:has(.nbs),html:not([data-lay="port"]) .pane>.sec:has(.fd-meal),html:not([data-lay="port"]) .pane>.tsum,
html:not([data-lay="port"]) .pane>:not(.sec):not(.card-s){grid-column:1/-1}
html:not([data-lay="port"]) .pane>.sec{margin-top:22px}
html:not([data-lay="port"]) .nbs{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))!important}
html:not([data-lay="port"]) .hero{padding:26px 28px 24px}
html:not([data-lay="port"]) .hart .h3d{right:34px;top:92px;width:70px;height:70px}
html:not([data-lay="port"]) .hart .hw{right:30px;top:18px;font-size:54px}
</style>`);

(document.body||document.head).insertAdjacentHTML('beforeend',`<style>.h3d .o{display:none}</style>`);

document.addEventListener('toggle',e=>{const d=e.target;if(!d.matches||!d.matches('details.jvsteps'))return;const id=d.dataset.jvid;if(d.open)JV.open.add(id);else JV.open.delete(id);JV.keepScroll=true},true);
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="jvsteps">
.jv-ai.wait{font-style:normal;opacity:1;min-width:62%}
.jvsteps summary{list-style:none;display:flex;align-items:center;gap:8px;cursor:pointer;font-style:italic;color:rgb(244 239 230 / .85)}
.jvsteps summary::-webkit-details-marker{display:none}
.jvsteps summary em{font:600 11px var(--mono);font-style:normal;color:#86CFA0;background:rgb(134 207 160 / .12);padding:2px 7px;border-radius:999px;margin-left:auto}
.jvsteps .chev{display:grid;place-items:center;width:20px;height:20px;transition:transform .3s cubic-bezier(.22,1,.36,1);margin-left:4px}.jvsteps .chev svg{width:14px;height:14px}
.jvsteps summary:not(:has(em)) .chev{margin-left:auto}
.jvsteps[open] .chev{transform:rotate(180deg)}
.jvdot{width:8px;height:8px;border-radius:50%;background:#F2A65A;box-shadow:0 0 10px #F2A65A;animation:jvdp 1s ease-in-out infinite;flex:none}
@keyframes jvdp{50%{opacity:.35}}
.jvsteps ol{margin:10px 0 2px;padding:0 0 0 2px;list-style:none;display:flex;flex-direction:column;gap:6px;max-height:34vh;overflow:auto;font:400 12px/1.45 var(--mono);color:rgb(244 239 230 / .78);counter-reset:s}
.jvsteps li{counter-increment:s;display:grid;grid-template-columns:22px 1fr;gap:4px;overflow-wrap:anywhere}
.jvsteps li::before{content:counter(s);color:#F06D44;font-weight:700}
.jvsteps li:last-child{color:#F4EFE6}
.jvsteps li.mu{opacity:.6}.jvsteps li.mu::before{content:"…"}
@keyframes jvsl{from{opacity:0;transform:translateY(4px)}}
.jv-act.busy svg{animation:jvrs .8s linear infinite}
@keyframes jvrs{to{transform:rotate(360deg)}}
.jv-act:active{transform:scale(.94)}.jv-act{transition:transform .15s ease,background .3s}
</style>`);

(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="jvboot">
#jvHud.boot .jvh-r{animation:jvb 1.3s cubic-bezier(.22,1,.36,1) both}
#jvHud.boot .jvh-r g{animation:jvbg .9s ease-out both}
#jvHud.boot .jvh-r g:nth-of-type(1){animation-delay:.05s}#jvHud.boot .jvh-r g:nth-of-type(2){animation-delay:.18s}#jvHud.boot .jvh-r g:nth-of-type(3){animation-delay:.3s}
#jvHud.boot .jvh-r g:nth-of-type(4){animation-delay:.42s}#jvHud.boot .jvh-r g:nth-of-type(5){animation-delay:.54s}#jvHud.boot .jvh-r g:nth-of-type(6){animation-delay:.7s}
#jvHud.boot .jvh-r::after{content:"";position:absolute;left:-10%;right:-10%;height:2px;top:0;background:linear-gradient(90deg,transparent,#86CFA0,transparent);box-shadow:0 0 12px #86CFA0;animation:jvscan 1.1s ease-in-out .1s both}
#jvHud.boot .jvh-mode{animation:jvbt .3s steps(2) 4}
@keyframes jvb{0%{transform:scale(.55);opacity:0;filter:brightness(2.2)}55%{transform:scale(1.05);opacity:1}100%{transform:none;filter:none}}
@keyframes jvbg{from{opacity:0}to{opacity:1}}
@keyframes jvscan{0%{top:0;opacity:0}15%{opacity:1}85%{opacity:1}100%{top:100%;opacity:0}}
@keyframes jvbt{50%{opacity:.25}}
</style>`);

/* every tappable thing gets a tiny press motion. :where() has zero specificity, so anything that already
   defines its own transition or :active effect keeps it untouched. */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="pressfx">
:where(button,a.btn,label.pill,[role="button"],[data-open],[data-add],.chip,.tile,.navrow,.trow){transition:transform .16s cubic-bezier(.22,1,.36,1),filter .16s ease}
:where(button,a.btn,label.pill,[role="button"],[data-open],[data-add],.chip,.tile,.navrow,.trow):active{transform:scale(.965);filter:brightness(1.08)}
@media (prefers-reduced-motion:reduce){:where(button,[role="button"]):active{transform:none}}
</style>`);

/* ---------- camera flash (torch) for the barcode scanner and the AI food camera ---------- */
async function torchSet(video,on){const st=video&&video.srcObject;const tr=st&&st.getVideoTracks&&st.getVideoTracks()[0];if(!tr)throw new Error('Start the camera first');
  const cap=tr.getCapabilities?tr.getCapabilities():{};if(cap&&cap.torch===false)throw new Error('no torch');
  await tr.applyConstraints({advanced:[{torch:on}]});return on}
function torchBtn(id){return`<button type="button" class="torch" id="${id}" aria-pressed="false" aria-label="Flash">${ic('bolt')}<span>Flash</span></button>`}
document.addEventListener('click',async e=>{const b=e.target.closest('#scanTorch,#aicTorch');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
  const v=document.getElementById(b.id==='scanTorch'?'scanvid':'aicVid'),on=b.getAttribute('aria-pressed')!=='true';
  try{await torchSet(v,on);b.setAttribute('aria-pressed',String(on))}catch(x){toast(/first/.test(x.message)?x.message:'This phone doesn’t let web apps use the flash. Turn on the Flashlight in Control Center instead.')}},true);
/* scanner: add the flash button over the camera box */
const _flBodyT=flBody;flBody=function(){let h=_flBodyT();if(FL.tab==='scan')h=h.replace('<div class="frame"></div></div>','<div class="frame"></div>'+torchBtn('scanTorch')+'</div>');return h};
/* AI photo: an in-app camera with flash (the phone's own camera keeps its own flash button too) */
const AIC={stream:null,gen:0};
function aicStop(){AIC.gen++;try{AIC.stream&&AIC.stream.getTracks().forEach(t=>t.stop())}catch(e){}AIC.stream=null}
/* the camera never outlives its sheet: closing the sheet (any way) stops it */
try{const _closeSheetA=closeSheet;closeSheet=function(){aicStop();return _closeSheetA.apply(this,arguments)}}catch(e){}
setInterval(()=>{if(!AIC.stream)return;const v=document.getElementById('aicVid');if(!v||!v.isConnected||!v.offsetParent||v.closest('[hidden]'))aicStop()},1000);
document.addEventListener('click',async e=>{const b=e.target.closest('#aicOpen,#aicShot,#aicClose');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
  if(b.id==='aicOpen'){const box=$('#aicBox');if(!box)return;aicStop();const my=AIC.gen;box.hidden=false;
    try{const st=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1280}},audio:false});
      const v=$('#aicVid');
      /* a second tap or a closed sheet while we waited: this stream is no longer wanted */
      if(my!==AIC.gen||!v||!v.isConnected){st.getTracks().forEach(t=>t.stop());return}
      AIC.stream=st;v.srcObject=st;await v.play()}
    catch(x){if(my!==AIC.gen)return;aicStop();const bx=$('#aicBox');if(bx)bx.hidden=true;toast('Camera not available here. Use “Take photo” instead.')}return}
  if(b.id==='aicClose'){aicStop();const box=$('#aicBox');if(box)box.hidden=true;return}
  if(b.id==='aicShot'){const v=$('#aicVid');if(!v||!v.videoWidth)return;const s=Math.min(1,800/Math.max(v.videoWidth,v.videoHeight)),c=document.createElement('canvas');c.width=Math.round(v.videoWidth*s);c.height=Math.round(v.videoHeight*s);
    c.getContext('2d').drawImage(v,0,0,c.width,c.height);AIF.img=c.toDataURL('image/jpeg',.74);AIF.items=null;AIF.err='';aicStop();flRefresh(false)}},true);
const _flBodyA=flBody;flBody=function(){let h=_flBodyA();if(FL.tab==='ai'&&!AIF.img)h=h.replace('<div class="aif-pick">',`<div class="aic" id="aicBox" hidden><video id="aicVid" playsinline muted></video>${torchBtn('aicTorch')}<div class="aic-bar"><button type="button" id="aicClose" aria-label="Close camera">${ic('close')}</button><button type="button" class="aic-shot" id="aicShot" aria-label="Take photo"></button><span></span></div></div><div class="aif-pick"><button type="button" class="aic-open" id="aicOpen">${ic('camera')}Camera + flash</button>`);if(FL.tab!=='ai')aicStop();return h};
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="torchcss">
.scanbox{position:relative}
.torch{position:absolute;right:12px;top:12px;z-index:3;display:flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:999px;background:rgb(0 0 0 / .5);color:#fff;font:700 12.5px var(--ui);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgb(255 255 255 / .2)}
.torch svg{width:16px;height:16px}.torch[aria-pressed="true"]{background:#F2C14E;color:#1A1205;border-color:transparent;box-shadow:0 0 18px rgb(242 193 78 / .6)}
.aic{position:relative;border-radius:var(--r-l);overflow:hidden;background:#000;margin-bottom:12px;aspect-ratio:3/4;max-height:52vh}
.aic video{width:100%;height:100%;object-fit:cover;display:block}
.aic-bar{position:absolute;left:0;right:0;bottom:12px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 16px}
.aic-bar button:first-child{width:40px;height:40px;border-radius:50%;background:rgb(0 0 0 / .5);color:#fff;display:grid;place-items:center}
.aic-shot{width:66px;height:66px;border-radius:50%;background:#fff;box-shadow:0 0 0 4px rgb(0 0 0 / .35),0 0 0 7px #fff}
.aif-pick{grid-template-columns:repeat(3,1fr)!important}
.aic-open{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;height:110px;border-radius:var(--r-l);border:1.5px dashed var(--line);background:var(--surface);font:700 13.5px var(--ui);color:var(--ink);text-align:center}.aic-open svg.i{width:26px;height:26px;color:var(--accent)}
</style>`);

(document.body||document.head).insertAdjacentHTML('beforeend',`<style>#aifGo{height:52px;min-height:52px;width:100%;display:flex;align-items:center;justify-content:center;gap:8px;border-radius:999px;margin-top:12px}</style>`);

/* iPhone only lets a page talk after it has spoken once during a tap: "unlock" the voice on every JARVIS tap */
function jvUnlockVoice(){try{if(typeof speechSynthesis==='undefined'||JH.unlocked)return;const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u);speechSynthesis.getVoices();JH.unlocked=true}catch(e){}}
document.addEventListener('pointerdown',e=>{if(e.target.closest('#jvHud,[data-jarvis]'))jvUnlockVoice()},true);
document.addEventListener('keydown',e=>{if(e.target&&e.target.id==='jvIn')jvUnlockVoice()},true);
try{if(typeof speechSynthesis!=='undefined')speechSynthesis.onvoiceschanged=()=>{JH.voice=null}}catch(e){}
/* the glow behind the reactor breathes while it listens, works or talks, and pulses once when you send a command */
const _jvSendP=jvSend;jvSend=async function(t){const r=$('#jvhR');if(r&&(t||'').trim()){r.classList.remove('kick');void r.offsetWidth;r.classList.add('kick')}return _jvSendP(t)};
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="jvglow">
.jvh-r::before{will-change:transform,opacity}
#jvHud.listen .jvh-r::before{animation:jvgl .9s ease-in-out infinite}
#jvHud.think .jvh-r::before{animation:jvgl 1.6s ease-in-out infinite}
#jvHud.speak .jvh-r::before{animation:jvgl .55s ease-in-out infinite}
.jvh-r.kick::before{animation:jvkick .9s cubic-bezier(.22,1,.36,1)}
@keyframes jvgl{0%,100%{transform:scale(1);opacity:.85}50%{transform:scale(1.18);opacity:1}}
@keyframes jvkick{0%{transform:scale(1);opacity:1}35%{transform:scale(1.35);opacity:1;filter:brightness(1.6)}100%{transform:scale(1);opacity:.85}}
</style>`);

/* JARVIS's real voice on the phone: the laptop sends its spoken reply (same calm British neural voice) and the phone
   plays it. Answers the phone makes itself, or if the audio isn't there, use the best built-in iPhone voice instead. */
const JA=new Audio();JA.preload='auto';JA.setAttribute('playsinline','');
const SILENT='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#jvHud,[data-jarvis]')||JH.aUnlocked)return;try{JA.src=SILENT;const p=JA.play();if(p)p.then(()=>{JH.aUnlocked=true}).catch(()=>{})}catch(x){}},true);
JA.onplay=()=>{JH.playing=true;jvHudState();if(JA.src!==SILENT&&typeof fmYield==='function')fmYield(true,JA)};
JA.onended=JA.onpause=()=>{const was=JH.playing;JH.playing=false;jvHudState();if(was&&typeof fmYield==='function')fmYield(false)};
async function jvSpeak(text,id){
  if(id&&syncOn()){try{const r=await fetch(SYNC.url.replace(/\/+$/,'')+'/jarvis/voice?id='+encodeURIComponent(id),{headers:{'X-Life-Key':SYNC.key}});
    if(r.ok){const b=await r.blob();if(b.size>200){if(JA.dataset.u)URL.revokeObjectURL(JA.dataset.u);const u=URL.createObjectURL(b);JA.dataset.u=u;JA.src=u;await JA.play();return}}}catch(e){}}
  jvSay(text)}
/* built-in fallback: a natural-sounding voice at normal pitch and pace (no more deep, slow robot) */
function jvPickVoice(){const vs=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang));if(!vs.length)return null;
  const score=v=>(/premium/i.test(v.name)?40:/enhanced/i.test(v.name)?30:0)+(/en-GB/i.test(v.lang)?12:/en-US/i.test(v.lang)?6:0)+(/Daniel|Arthur|Oliver|Jamie|Malcolm|Evan|Nathan|Aaron/i.test(v.name)?10:0)-(/compact|eloquence|grandpa|grandma|bad news|bells|boing|bubbles|cellos|jester|organ|superstar|trinoids|whisper|wobble|zarvox|albert|fred|junior|ralph|kathy/i.test(v.name)?100:0);
  return vs.sort((a,b)=>score(b)-score(a))[0]}
jvSay=function(text){try{if(typeof speechSynthesis==='undefined'||!text)return;if(speechSynthesis.speaking||speechSynthesis.pending)speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(String(text).slice(0,400));const v=jvPickVoice();if(v){u.voice=v;u.lang=v.lang}else u.lang='en-GB';u.rate=1;u.pitch=1;
  u.onstart=u.onend=()=>jvHudState();speechSynthesis.speak(u);setTimeout(jvHudState,60)}catch(e){}};

/* replay a reply, stop speaking, and say why if the phone can't play the voice */
async function jvSpeak2(text,id){
  JH.why="";if(id&&syncOn()){for(let k=0;k<1;k++){try{const r=await fetch(SYNC.url.replace(/\/+$/,'')+'/jarvis/voice?id='+encodeURIComponent(id),{headers:{'X-Life-Key':SYNC.key}});
      if(r.ok){const b=await r.blob();if(b.size>200){if(JA.dataset.u)URL.revokeObjectURL(JA.dataset.u);const u=URL.createObjectURL(b);JA.dataset.u=u;JA.src=u;try{await JA.play();return}catch(e){JH.why='This app is blocking sound until you tap somewhere in JARVIS.'}}}
      else JH.why=r.status===404?'The laptop didn’t send its voice for this reply (restart JARVIS on the laptop).':'Voice download failed ('+r.status+').'}catch(e){JH.why='Couldn’t download the voice.'}
    break}}
  if(syncOn()){try{const r=await fetch(SYNC.url.replace(/\/+$/,'')+'/jarvis/tts',{method:'POST',headers:{'X-Life-Key':SYNC.key,'Content-Type':'application/json'},body:JSON.stringify({text:String(text).slice(0,600),voice:(SV.cfg&&SV.cfg.jarvisVoice)||''})});
    if(r.ok){const b=await r.blob();if(b.size>200){if(JA.dataset.u)URL.revokeObjectURL(JA.dataset.u);const u=URL.createObjectURL(b);JA.dataset.u=u;JA.src=u;try{await JA.play();return}catch(e){}}}}catch(e){}}
  if(typeof speechSynthesis==='undefined'){toast(JH.why||'This browser has no voice to speak with.');return}
  jvSay(text);setTimeout(()=>{try{if(!speechSynthesis.speaking&&!JH.playing&&JH.why)toast(JH.why)}catch(e){}},1500)}
jvSpeak=jvSpeak2;
function jvHush(){try{JA.pause();JA.currentTime=0}catch(e){}try{speechSynthesis.cancel()}catch(e){}JH.playing=false;jvHudState()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-jvplay],#jvhHush');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
  if(b.id==='jvhHush')return jvHush();jvHush();jvSpeak(b.dataset.jvtext,b.dataset.jvplay||null)},true);
setInterval(()=>{const h=$('#jvhHush');if(!h)return;const on=(JH.playing&&!JA.paused&&!JA.ended)||(typeof speechSynthesis!=='undefined'&&speechSynthesis.speaking);if(h.hidden===on)h.hidden=!on},250);
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="jvfix3">
#jvHud .jvh-stage{overflow:hidden;min-height:0}
#jvHud .jvh-sub{-webkit-line-clamp:2;font-size:clamp(15px,4.4vw,19px);min-height:0;max-height:2.8em;margin-bottom:4px}
#jvHud .jvh-r{width:min(58vw,27vh,270px)}
.jvh-hush{display:inline-flex;align-items:center;gap:7px;height:28px;padding:0 12px;border-radius:999px;background:rgb(255 255 255 / .08);border:1px solid rgb(255 255 255 / .14);color:#F4EFE6;font:600 12px var(--ui)}
.jvh-hush[hidden]{display:none}
.jvh-hush i{width:9px;height:9px;border-radius:2px;background:#F06D44;box-shadow:0 0 8px #F06D44}
.jv-ai{position:relative}
.jvplay{display:inline-grid;place-items:center;width:24px;height:24px;margin:-2px -4px -6px 8px;border-radius:50%;background:rgb(255 255 255 / .08);vertical-align:middle;color:#F2A65A}
.jvplay svg{width:12px;height:12px}
</style>`);

/* ===== JARVIS mic v2: record on the phone, transcribe with your free Gemini key on your server.
   (iPhone home-screen apps often listen with the built-in recogniser but never return the words.) ===== */
const JR={on:false};
function wavEncode(chunks,rate){let n=0;for(const c of chunks)n+=c.length;const b=new ArrayBuffer(44+n*2),v=new DataView(b);
  const w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
  v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);let o=44;
  for(const c of chunks)for(let i=0;i<c.length;i++,o+=2){const x=Math.max(-1,Math.min(1,c[i]));v.setInt16(o,x<0?x*0x8000:x*0x7fff,true)}return b}
async function jvRecord(){
  if(JR.on){JR.stop&&JR.stop();return}
  if(JR.starting)return;/* a second tap while the mic is still opening */
  if(!syncOn()){toast('Connect your server first');return}
  JR.starting=true;const hud=$('#jvHud');const gone=()=>!JR.starting||!hud||!hud.isConnected||!hud.classList.contains('on');
  JR.cancel=()=>{JR.starting=false};
  let stream;try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}})}catch(e){JR.starting=false;jvSub('Allow the microphone for Life, then try again.');return}
  if(gone()){JR.starting=false;try{stream.getTracks().forEach(t=>t.stop())}catch(e){}return}
  try{speechSynthesis.cancel()}catch(e){}try{JA.pause()}catch(e){}
  let ctx;try{const AC=window.AudioContext||window.webkitAudioContext;ctx=new AC();await ctx.resume()}catch(e){JR.starting=false;try{stream.getTracks().forEach(t=>t.stop());ctx&&ctx.close()}catch(x){}jvSub('Couldn’t open the microphone.');return}
  if(gone()){JR.starting=false;try{stream.getTracks().forEach(t=>t.stop());ctx.close()}catch(e){}return}
  JR.starting=false;
  const src=ctx.createMediaStreamSource(stream),proc=ctx.createScriptProcessor(4096,1,1),mute=ctx.createGain();mute.gain.value=0;
  const ratio=ctx.sampleRate/16000,chunks=[];let started=false,quiet=0,t0=performance.now(),done=false,peak=0;
  JR.on=true;JR.noise=null;JR.thr=0.01;JH.listening=true;JH.boost=1;jvSub('Listening… tap the mic again when you’re done');jvHudState();
  /* send=false (closed, cancelled, or nothing above the noise floor was heard): drop the audio, never transcribe it */
  const finish=async(send,quiet)=>{if(done)return;done=true;JR.on=false;JH.listening=false;try{proc.disconnect();src.disconnect();stream.getTracks().forEach(t=>t.stop());ctx.close()}catch(e){}jvHudState();
    if(quiet||!$('#jvHud'))return;
    const secs=chunks.reduce((t,c)=>t+c.length,0)/16000;if(!send||!started||secs<0.6){jvSub('I didn’t hear anything. Tap the mic, speak, then tap it again.');return}
    jvSub('Thinking…');const h=$('#jvHud');if(h)h.classList.add('think');
    try{const b=new Blob([wavEncode(chunks,16000)]);const url=await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.replace(/^data:[^;]*/,'data:audio/wav'));f.readAsDataURL(b)});
      const r=await api('/ai/stt',{method:'POST',body:JSON.stringify({audio:url})});if(!$('#jvHud'))return;/* closed while transcribing: don't act */const t=cleanStr(r&&r.text,500);
      if(!t){jvSub('I didn’t catch that.');return}jvSub(t);jvSend(t)}
    catch(e){jvSub(/Gemini key|geminiKey|Connections → AI/i.test(e.message)?'Add your free Gemini key (Settings → Connections → AI) so I can understand speech.':'Couldn’t understand that: '+e.message)}finally{jvHudState()}};
  JR.stop=()=>finish(true);JR.cancel=()=>finish(false,true);
  proc.onaudioprocess=e=>{if(done)return;const d=e.inputBuffer.getChannelData(0);let sum=0;for(let i=0;i<d.length;i++)sum+=d[i]*d[i];const rms=Math.sqrt(sum/d.length);peak=Math.max(peak*.95,rms);
    const out=new Float32Array(Math.floor(d.length/ratio));for(let i=0;i<out.length;i++)out[i]=d[Math.floor(i*ratio)];chunks.push(out);
    const dt=d.length/ctx.sampleRate,thr=JR.thr;JR.noise=JR.noise==null?rms:Math.min(JR.noise*1.002+1e-5,Math.max(JR.noise*.98,rms));JR.thr=Math.max(0.004,(JR.noise||0)*2.6);if(rms>thr){started=true;quiet=0;JH.boost=Math.min(1.5,rms*25)}else if(started)quiet+=dt;
    const el=(performance.now()-t0)/1000;JR.el=el;if((started&&quiet>1.5)||el>15)finish(true);else if(!started&&el>10)finish(false)};
  src.connect(proc);proc.connect(mute);mute.connect(ctx.destination);
}
jvListen=jvRecord;

/* voice picker: all free Microsoft neural voices, used by the laptop and played on the phone */
const JVOICES=[['jarvis','JARVIS','The movie AI · offline on your laptop'],['en-US-AndrewMultilingualNeural','Andrew','Warm, natural'],['en-US-BrianMultilingualNeural','Brian','Relaxed, conversational'],['en-GB-RyanNeural','Ryan','British, crisp'],
  ['en-GB-ThomasNeural','Thomas','British, soft'],['en-US-ChristopherNeural','Christopher','Deep, steady'],['en-IE-ConnorNeural','Connor','Irish, friendly'],['en-US-AvaMultilingualNeural','Ava','Warm, female'],['en-GB-SoniaNeural','Sonia','British, female']];
document.addEventListener('click',async e=>{const b=e.target.closest('#jvhVoice,[data-jvvoice]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
  const L=$('#jvhVlist');if(!L)return;
  if(b.id==='jvhVoice'){if(!L.hidden){L.hidden=true;return}if(!SV.cfg)try{SV.cfg=await api('/config')}catch(x){}const cur=(SV.cfg&&SV.cfg.jarvisVoice)||'jarvis';
    L.innerHTML=JVOICES.map(([id,n,d])=>`<button data-jvvoice="${id}" class="${id===cur?'on':''}"><b>${n}</b><small>${d}</small>${id===cur?ic('check'):''}</button>`).join('');L.hidden=false;return}
  const v=b.dataset.jvvoice;try{SV.cfg=await api('/config',{method:'PUT',body:JSON.stringify({jarvisVoice:v})});L.hidden=true;toast('Voice changed. Saying hello in it…');
    await api('/jarvis/cmd',{method:'POST',body:JSON.stringify({text:'__voicetest'})});jvLoad()}catch(x){toast('Couldn’t change the voice: '+x.message)}},true);
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="jvvoice">
.jvh-vbtn{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px;border-radius:999px;background:rgb(255 255 255 / .06);border:1px solid rgb(255 255 255 / .12);color:rgb(244 239 230 / .85);font:600 12px var(--ui)}
.jvh-vbtn svg{width:13px;height:13px;color:#F2A65A}
.jvh-vlist{position:absolute;left:50%;top:50%;transform:translate(-50%,-30%);z-index:5;width:min(92%,360px);max-height:52vh;overflow:auto;padding:6px;border-radius:22px;background:rgb(20 22 20 / .96);border:1px solid rgb(255 255 255 / .12);box-shadow:0 20px 50px rgb(0 0 0 / .6);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px)}
.jvh-vlist[hidden]{display:none}
.jvh-vlist button{display:grid;grid-template-columns:1fr auto;align-items:center;width:100%;text-align:left;padding:10px 14px;border-radius:16px;color:#F4EFE6}
.jvh-vlist button b{font:700 15px var(--ui)}.jvh-vlist button small{grid-column:1;font:500 12px var(--ui);color:rgb(244 239 230 / .6)}
.jvh-vlist button svg{grid-row:1/3;grid-column:2;width:18px;height:18px;color:#86CFA0}
.jvh-vlist button.on{background:rgb(134 207 160 / .12)}
.jvh-stage{position:relative}
/* phone in landscape (short screen): small reactor, no voice button, status row with Start/Restart always visible */
@media (max-height:500px){
  #jvHud{padding-top:calc(env(safe-area-inset-top,0px) + 4px);padding-bottom:calc(env(safe-area-inset-bottom,0px) + 6px)}
  #jvHud .jvh-top{min-height:36px}
  #jvHud .jvh-stage{flex:0 0 auto;min-height:0;overflow:visible;flex-direction:row;flex-wrap:wrap;justify-content:center;align-items:center;gap:6px 12px;padding:2px 0 6px}
  #jvHud .jvh-r{width:54px!important;height:54px}
  #jvHud .jvh-r::before{inset:-6%}
  #jvHud .jvh-vbtn{display:none}
  #jvHud .jvh-mode{order:1}
  #jvHud .jvh-st{order:2;flex:0 1 auto;margin:0;min-height:30px}
  #jvHud .jvh-hush{order:3}
  #jvHud .jvh-sub{order:4;flex:1 1 100%;-webkit-line-clamp:1;max-height:1.4em;font-size:15px;margin:0}
  #jvHud .jvh-log{max-height:26vh;margin-bottom:6px}
  #jvHud .jv-sugg{margin-top:6px}
  #jvHud .jvh-in input,#jvHud .jvh-mic,#jvHud .jvh-in #jvSend{height:44px}
  #jvHud .jvh-mic,#jvHud .jvh-in #jvSend{width:44px}
}
</style>`);

/* ===================== JARVIS on the phone: Life actions by voice, morning briefing, and a brain for when the laptop is off ===================== */
const jvNorm=s=>String(s||'').toLowerCase().replace(/[’‘']/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const JV_STOP=new Set('the my a an to as for and of off on in at it its this that please item task todo habit reminder today'.split(' '));
const jvWords=s=>{const w=jvNorm(s).split(' ').filter(Boolean),m=w.filter(x=>!JV_STOP.has(x));return m.length?m:w};
const jvStem=w=>w.length>4&&/ies$/.test(w)?w.slice(0,-3)+'y':w.length>3&&/s$/.test(w)&&!/ss$/.test(w)?w.slice(0,-1):w;
function jvWordEq(a,b){a=jvStem(a);b=jvStem(b);if(a===b)return true;const[x,y]=a.length<=b.length?[a,b]:[b,a];return x.length>=5&&y.startsWith(x)&&x.length/y.length>=.6}
/* how well a spoken name fits an item's name: 1 = same words. all = every meaningful spoken word is in the name. */
function jvScore(q,name){const nq=jvNorm(q),nn=jvNorm(name);if(!nq||!nn)return{s:0,all:false,any:false};if(nq===nn)return{s:1,all:true,any:true};
  const qw=jvWords(q),nw=jvWords(name),qh=qw.filter(w=>nw.some(v=>jvWordEq(w,v))).length,nh=nw.filter(v=>qw.some(w=>jvWordEq(w,v))).length;
  return{s:.6*qh/qw.length+.4*nh/nw.length,all:qh===qw.length,any:qh>0}}
const JV_MIN=.8;
/* strict lookup: a hit needs every meaningful word to match and a score of 0.8+, and must clearly beat any other hit.
   Otherwise no hit, plus up to 3 near misses to offer as "Did you mean …?" */
function jvFind(q,list,get,min=JV_MIN){const sc=[];for(const x of list||[]){const n=get(x);if(!n)continue;const r=jvScore(q,n);if(r.any)sc.push({x,n:String(n),s:r.s,all:r.all})}
  sc.sort((a,b)=>b.s-a.s);const ok=sc.filter(c=>c.all&&c.s>=min);
  if(ok.length){/* any other item that also contains every spoken word and scores close makes it ambiguous */
    const top=ok[0],rivals=sc.filter(c=>c!==top&&c.all&&top.s-c.s<.15&&jvNorm(c.n)!==jvNorm(top.n));
    if(!rivals.length)return{hit:top.x,name:top.n,alts:[]};
    return{hit:null,alts:[top,...rivals].slice(0,3)}}
  return{hit:null,alts:sc.filter(c=>c.s>=.3).slice(0,2)}}
function jvMatch(q,list,get){return jvFind(q,list,get).hit}
const jvOpenItems=()=>db.entries.filter(e=>(e.type==='task'||e.type==='reminder')&&!e.done);
function jvClock(t){if(!t)return'';const m=/^(\d{1,2}):(\d{2})$/.exec(t);if(!m)return t;return fmtT(`${m[1].padStart(2,'0')}:${m[2]}`)}
function jvBusLine(route){const c=busCfg().find(x=>x.route===route);const nx=busNext(route);if(!c)return`No ${route} stop is set.`;
  if(!nx)return`No ${route} buses listed right now at ${c.name||'your stop'}.`;const m=Math.max(0,Math.round((nx-Date.now())/6e4));
  return`Next ${route} at ${c.name||'your stop'} in ${m} minute${m===1?'':'s'}, at ${new Date(nx).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}.`}
/* every Life change JARVIS makes returns an undo, shown as an Undo toast */
function jvStartFocus(min,label){
  if(FOCUS())return{text:'A focus session is already running. Finish or end it first, then ask again.'};
  const p=PS(),id=uid();label=cleanStr(label,60);
  db.focusNow={id,started:Date.now(),label:label||'Focus',ref:'',mode:'single',cfg:{...p,mode:'single',single:min},phase:'focus',round:1,pStart:Date.now(),paused:null,focusMs:0,done:0};
  save();pushSchedule(true);render(false);
  return{text:`Started a ${min}-minute focus${label?' on '+label:''}.`,undo:()=>{const f=FOCUS();if(!f||f.id!==id)return;if(typeof finishFocus==='function')finishFocus(true);else{db.focusNow=null;save();pushSchedule(true);render(false)}}}}
const jvTargets=()=>[...jvOpenItems().map(e=>({k:'task',e,n:e.title})),...habits().map(h=>({k:'habit',e:h,n:h.name}))];
function jvApply(t){
  if(t.k==='task'){const id=t.e.id,e=find(id);if(!e||e.done)return{text:`“${t.e.title}” is already done.`};setDone(id,true,null);return{text:`Done. Marked “${e.title}” complete.`,undo:()=>setDone(id,false,null)}}
  const h=t.e,td=today(),L=hlog();L[td]=L[td]||{};const prev=L[td][h.id];L[td][h.id]=Math.min(h.target||1,hCount(h,td)+1);save();render(false);
  return{text:`Ticked ${h.name}${(h.target||1)>1?` (${L[td][h.id]} of ${h.target})`:''}.`,undo:()=>{const L2=hlog();L2[td]=L2[td]||{};if(prev)L2[td][h.id]=prev;else delete L2[td][h.id];save();render(false)}}}
/* only: 'habit' to look at habits only. soft: no "did you mean", just null when nothing fits */
function jvComplete(title,only,soft){const list=jvTargets().filter(x=>!only||x.k===only),f=jvFind(title,list,x=>x.n);
  if(f.hit)return jvApply(f.hit);if(soft)return null;
  if(f.alts.length===1){const a=f.alts[0];JV.pending={k:a.x.k,id:a.x.e.id,at:Date.now()};return{text:`Did you mean “${a.n}”? Say “yes” to ${a.x.k==='habit'?'tick it':'mark it done'}.`,ask:true}}
  if(f.alts.length>1)return{text:`Did you mean ${f.alts.map(a=>`“${a.n}”`).join(' or ')}? Say the full name, like “mark ${f.alts[0].n} done”.`,ask:true};
  return{text:`I couldn’t find “${title}” in your open tasks or habits.`}}
function jvConfirm(){const p=JV.pending;JV.pending=null;if(!p||Date.now()-p.at>120000)return null;
  const t=jvTargets().find(x=>x.k===p.k&&x.e.id===p.id);return t?jvApply(t):{text:'That one’s already done.'}}
async function jvSetStop(route,name){route=cleanStr(route,8).toUpperCase();name=cleanStr(name,80);if(!/^[A-Z0-9]{1,8}$/.test(route)||!name)return{text:'Say which bus and which stop, like “set the NMG stop to Red Maple”.'};
  try{const r=await api('/bus/stops?route='+encodeURIComponent(route));const s=jvFind(name,Array.isArray(r.stops)?r.stops:[],x=>x&&x.name,.5).hit;
    if(!s)return{text:`I couldn’t find one ${route} stop called “${name}”.`};const prev=db.settings.bus?JSON.parse(JSON.stringify(db.settings.bus)):null;
    const st={route,stop:cleanStr(s.code,20),name:cleanStr(s.name,80)};db.settings.bus=busCfg().map(c=>c.route===route?st:c);if(!db.settings.bus.some(c=>c.route===route))db.settings.bus.push(st);
    save();delete BUS[route];busTick(true);
    return{text:`${route} stop set to ${st.name}.`,undo:()=>{if(prev)db.settings.bus=prev;else delete db.settings.bus;save();delete BUS[route];busTick(true)}}}
  catch(e){return{text:'Couldn’t reach the bus service: '+e.message}}}
/* morning briefing, written to be spoken */
function jvBriefing(){const td=today(),h=new Date().getHours(),g=db.settings,parts=[];
  parts.push(`${h<12?'Good morning':h<17?'Good afternoon':'Good evening'}, ${firstName()}.`);
  const R=readiness&&readiness();if(R)parts.push(`Readiness is ${R.score}: ${R.label.toLowerCase()}.`);
  const nm=new Date().getHours()*60+new Date().getMinutes();
  const it=dayItems(td).filter(e=>!e.allDay).map(e=>{const t=e.type==='meeting'?e.time:e.start;return{e,m:toMin(t),t}}).filter(x=>x.m!=null&&x.m>=nm-5).sort((a,b)=>a.m-b.m);
  if(it.length)parts.push(`You have ${it.length} thing${it.length>1?'s':''} left today. Next is ${it[0].e.title||'an event'} at ${fmtT(it[0].t)}${it.length>1?`, then ${it[1].e.title||'another'} at ${fmtT(it[1].t)}`:''}.`);else parts.push('Your calendar is clear for the rest of today.');
  const due=jvOpenItems().filter(e=>e.due&&e.due<=td),urg=jvOpenItems().filter(e=>+e.urg===3);
  if(due.length)parts.push(`${due.length} item${due.length>1?'s are':' is'} due${due.some(e=>e.due<td)?' or overdue':''}: ${due.slice(0,3).map(e=>e.title).join(', ')}.`);
  if(urg.length)parts.push(`High priority: ${urg.slice(0,2).map(e=>e.title).join(' and ')}.`);
  const food=of('food').filter(e=>e.date===td),k=Math.round(sumKcal(food)),p=Math.round(sumProt(food));
  parts.push(k?`You've had ${k} calories and ${p} grams of protein, ${Math.max(0,g.kcal-k)} calories left.`:`Nothing logged yet today; your target is ${g.kcal} calories and ${g.protein} grams of protein.`);
  const nx=busNext('NMG');if(nx){const m=Math.max(0,Math.round((nx-Date.now())/6e4));parts.push(`The next NMG bus is in ${m} minute${m===1?'':'s'}.`)}
  const hs=habits().filter(x=>hCount(x,td)<(x.target||1));if(hs.length)parts.push(`Still to do: ${hs.slice(0,3).map(x=>x.name.toLowerCase()).join(', ')}.`);
  return parts.join(' ')}
/* free, instant commands the app understands itself. Only explicit forms count ("mark X done", "tick X", "tick off X",
   "check off X", "I took/drank my X" for habits); anything else returns null and goes to the AI or the laptop. */
function jvIntent(t){const q=jvQ(t);let m;if(!q)return null;
  if(/^(?:yes|yeah|yep|yup|yes please|correct|that one|do it|right)$/.test(q))return{k:'yes'};
  if(/^(?:brief me|morning briefing|briefing|good morning|what'?s my day(?: look like)?|give me (?:a|my) (?:rundown|briefing))$/.test(q)||
     (/\b(?:brief|briefing|rundown)\b/.test(q)&&q.split(/\s+/).length<=8&&!/\b(?:email|send|write|draft|text|message|slack|teams|doc|document|report)\b/.test(q)))return{k:'brief'};
  if((m=/^(?:mark|set)\s+(.+?)\s+(?:as\s+)?(?:done|complete|completed|finished)$/.exec(q)))return{k:'complete',what:m[1]};
  if((m=/^(?:tick|tick off|check off|cross off)\s+(.+?)(?:\s+(?:as\s+)?(?:done|complete|completed|finished))?$/.exec(q)))return{k:'complete',what:m[1]};
  if((m=/^i(?: just)? (?:took|drank) (?:my |the )?(.+)$/.exec(q))&&!/\b\d/.test(m[1]))return{k:'habit',what:m[1]};
  if((m=/^(?:set|change|switch)\s+(?:the\s+|my\s+)?(nmg|cas)\s+(?:bus\s+)?stop\s+to\s+(.+)$/.exec(q)))return{k:'stop',route:m[1],what:m[2]};
  if((m=/^(?:can you |could you )?(?:start|begin)\s+(?:a\s+)?(\d{1,3})[\s-]*(?:min(?:ute)?s?)\s+(?:focus|pomodoro|timer|session)(?:\s+(?:on|for)\s+(.+))?$/.exec(q))||(m=/^(?:focus|pomodoro)\s+(?:for\s+)?(\d{1,3})\s*(?:min(?:ute)?s?)(?:\s+(?:on|for)\s+(.+))?$/.exec(q)))return{k:'focus',min:+m[1],what:m[2]||''};
  if(/^(?:when(?:'s| is)?|what time is|next)\b.{0,24}\bbus\b|^bus times?\b|\bnext (?:nmg|cas) bus\b/.test(q))return{k:'bus',q};
  return null}
async function jvLife(t){const it=jvIntent(t);if(!it){JV.pending=null;return null}
  if(it.k==='yes')return jvConfirm();
  JV.pending=null;
  if(it.k==='brief')return{text:jvBriefing(),brief:true};
  if(it.k==='complete')return jvComplete(it.what);
  if(it.k==='habit')return jvComplete(it.what,'habit',true);
  if(it.k==='stop')return jvSetStop(it.route,it.what);
  if(it.k==='focus'){const n=Math.max(5,Math.min(240,it.min));return jvStartFocus(n,it.what?it.what.replace(/^\w/,c=>c.toUpperCase()):'')}
  if(it.k==='bus'){if(!Object.keys(BUS).length)await busTick(true);const q=it.q,r=/\bcas\b/.test(q)?['CAS']:/\bnmg\b/.test(q)?['NMG']:busCfg().map(c=>c.route);return{text:r.map(jvBusLine).join(' ')}}
  return null}
/* the phone's own brain (Gemini via your server) - used for Life requests always, and for anything else only while the laptop is offline */
function jvContext(){const td=today(),g=db.settings,food=of('food').filter(e=>e.date===td);
  return{now:new Date().toString().slice(0,24),today:td,weekday:wdOf(td),name:firstName(),
    calendar:dayItems(td).slice(0,12).map(e=>({title:e.title,time:e.allDay?'all day':(e.type==='meeting'?e.time:e.start)})),
    tomorrow:dayItems(addDays(1)).slice(0,8).map(e=>({title:e.title,time:e.allDay?'all day':(e.type==='meeting'?e.time:e.start)})),
    open:jvOpenItems().slice(0,30).map(e=>({type:e.type,title:e.title,due:e.due||'',time:e.time||'',urgency:+e.urg||0})),
    food:{kcal:Math.round(sumKcal(food)),protein:Math.round(sumProt(food)),goals:{kcal:g.kcal,protein:g.protein,fat:g.fat,carbs:g.carbs},items:food.slice(-8).map(e=>e.title)},
    habits:habits().map(h=>({name:h.name,done:hCount(h,td),target:h.target||1})),
    bus:busCfg().map(c=>({route:c.route,stop:c.name,next:busNext(c.route)?new Date(busNext(c.route)).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):null})),
    readiness:(()=>{try{const R=readiness();return R?{score:R.score,label:R.label}:null}catch(e){return null}})()}}
/* the AI's action list is untrusted: at most 5, known types only, every value clamped (CONTRACTS §4), strict matching
   for "complete", and one Undo for the lot */
const JV_ACTS=new Set(['add_task','add_reminder','log_food','tick_habit','complete','start_focus','set_bus_stop','needs_laptop']);
function jvRemove(id){const i=db.entries.findIndex(x=>x.id===id);if(i>=0)db.entries.splice(i,1)}
async function jvActions(acts){const undos=[],notes=[];let needLaptop=false,added=0;
  const list=(Array.isArray(acts)?acts:[]).filter(a=>a&&typeof a==='object'&&JV_ACTS.has(a.type)).slice(0,5);
  for(const a of list){try{
    if(a.type==='add_task'||a.type==='add_reminder'){const due=cleanStr(a.due,10),tm=/^(\d{1,2}):(\d{2})$/.exec(cleanStr(a.time,5));
      const o={id:uid(),type:a.type==='add_task'?'task':'reminder',title:cleanStr(a.title,200)||'Untitled',due:/^\d{4}-\d{2}-\d{2}$/.test(due)&&!isNaN(Date.parse(due))?due:(a.type==='add_reminder'?today():''),created:Date.now()};
      if(tm&&+tm[1]<24&&+tm[2]<60)o.time=tm[1].padStart(2,'0')+':'+tm[2];const u=clampN(a.urgency,0,3);if(u>0)o.urg=u;if(o.type==='task')o.priority='Normal';
      db.entries.push(o);added++;undos.push(()=>jvRemove(o.id))}
    else if(a.type==='log_food'){const o={id:uid(),type:'food',created:Date.now(),title:cleanStr(a.title,80)||'Food',meal:['Breakfast','Lunch','Dinner','Snack'].includes(a.meal)?a.meal:mealNow(),
      grams:clampN(a.grams,0,3000)||undefined,kcal:clampN(a.kcal,0,5000),protein:clampN(a.protein,0,500,1),fat:clampN(a.fat,0,500,1),carbs:clampN(a.carbs,0,500,1),date:today(),time:new Date().toTimeString().slice(0,5),src:'jarvis'};
      db.entries.push(o);added++;undos.push(()=>jvRemove(o.id))}
    else if(a.type==='tick_habit'||a.type==='complete'){const r=jvComplete(cleanStr(a.title,120),a.type==='tick_habit'?'habit':null);if(r&&r.undo)undos.push(r.undo);else if(r&&r.text)notes.push(r.text)}
    else if(a.type==='start_focus'){const r=jvStartFocus(clampN(a.minutes||25,5,240),cleanStr(a.title,60));if(r.undo)undos.push(r.undo);else notes.push(r.text)}
    else if(a.type==='set_bus_stop'&&a.route&&a.stop){const r=await jvSetStop(a.route,a.stop);if(r.undo)undos.push(r.undo);else notes.push(r.text)}
    else if(a.type==='needs_laptop')needLaptop=true}catch(e){}}
  if(added){save();render(false)}
  return{needLaptop,notes,undo:undos.length?()=>{undos.slice().reverse().forEach(f=>{try{f()}catch(e){}});save();render(false)}:null}}
async function jvAsk(t){const r=await api('/jarvis/ask',{method:'POST',body:JSON.stringify({text:t,context:jvContext()})});const x=await jvActions(r&&r.actions);
  const reply=cleanStr(r&&r.reply,1500)||'Done.';return{text:x.notes.length?reply+'\n'+x.notes.join('\n'):reply,needLaptop:x.needLaptop,undo:x.undo}}
/* Life requests the phone's AI handles (it can add reminders/tasks and log food). Email, calendar changes, "check …"
   and everything else go to the laptop. */
const JV_LIFE=/^(?:can you |could you )?(?:remind me\b|set (?:a |an )?reminder\b|add (?:a |an )?(?:task|todo|to-do|reminder)\b|create (?:a |an )?(?:task|reminder)\b|new (?:task|reminder)\b|log\s+(?!in\b|into\b|on\b|onto\b|out\b|off\b|me\b)|i (?:just )?(?:ate|had|drank)\b|for (?:breakfast|lunch|dinner|a snack),? i\b)|\b(?:calories|kcal|protein|carbs|macros|my habits?)\b/;
const jvIsLife=t=>JV_LIFE.test(jvQ(t));
/* where a request goes, without doing it (used by the tests): local | life:<kind> | ai | laptop */
function jvRoute(t,online){if(jvLocal(t))return'local';const it=jvIntent(t);if(it&&it.k!=='yes')return'life:'+it.k;if(it&&it.k==='yes'&&JV.pending)return'life:yes';return jvIsLife(t)||!online?'ai':'laptop'}
function jvLocalPush(t,reply){JV.local.push({text:t,reply,at:Date.now(),local:true});JV.stick=true;jvPaint()}
function jvUndoToast(text,undo){if(!undo)return;const m=String(text||'Done').split('\n')[0];toastAct(m.length>48?m.slice(0,46)+'…':m,'Undo',()=>{try{undo()}catch(e){}toast('Undone')})}
jvSend=async function(t){t=(t||'').trim();if(!t)return;const i=$('#jvIn');if(i)i.value='';JV.stick=true;
  const r=$('#jvhR');if(r){r.classList.remove('kick');void r.offsetWidth;r.classList.add('kick')}
  const loc=jvLocal(t);if(loc){JV.pending=null;return jvLocalPush(t,loc)}
  try{const l=await jvLife(t);if(l){
      if(l.brief&&jvState().on){/* laptop online: it speaks the briefing in the JARVIS voice */
        JV.log.push({text:'Briefing',state:'queued',at:Date.now()});jvPaint();await api('/jarvis/cmd',{method:'POST',body:JSON.stringify({text:'__say:'+l.text})});return jvLoad()}
      jvLocalPush(t,l.text);jvUndoToast(l.text,l.undo);return}}catch(e){}
  const online=jvState().on;
  if(jvIsLife(t)||!online){const tmp={text:t,state:'running',at:Date.now(),local:true,steps:[online?'Life request · handled on your phone':'Laptop offline · answering on your phone']};JV.local.push(tmp);jvPaint();
    try{const a=await jvAsk(t);tmp.reply=a.text;tmp.state='done';jvUndoToast(a.text,a.undo);
      if(a.needLaptop){tmp.reply+=jvState().on?' Sent to your laptop.':' Queued: it runs when JARVIS is on. Tap Start to turn it on.';await api('/jarvis/cmd',{method:'POST',body:JSON.stringify({text:t})})}}
    catch(e){tmp.reply='I couldn’t answer that: '+e.message;tmp.state='error'}jvPaint();return}
  JV.log.push({text:t,state:'queued',at:Date.now()});jvPaint();
  try{await api('/jarvis/cmd',{method:'POST',body:JSON.stringify({text:t})});jvLoad()}catch(e){toast('Couldn’t send: '+e.message)}};
/* first JARVIS open of the day (after 5 AM): it briefs you */
const _openJarvisB=openJarvis;openJarvis=function(){_openJarvisB();const d=today(),h=new Date().getHours();if(h>=5&&lsGet('ishiros.brief')!==d){lsSet('ishiros.brief',d);setTimeout(()=>jvSend('brief me'),1700)}};

/* smoother scrolling: per-card background blur is the most expensive thing iOS paints while scrolling (every card re-blurs
   the background each frame). The background behind cards is a soft static gradient, so a slightly denser tint looks the same. */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="perfglass">
.card-s,.chip,.ts-grid>button,.ts-grid>div{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
.card-s{background:color-mix(in srgb,var(--surface) calc((var(--glass-tint,69) + 17) * 1%),transparent)}
@supports not (background:color-mix(in srgb,red 50%,blue)){.card-s{background:rgb(24 26 24 / .86)}}
</style>`);

/* laptop/desktop: full-screen background blurs cost far more on a big window (the blur is redrawn for every pixel behind it).
   On wide screens the dimmed backdrop behind sheets is a flat tint, and big glass panels use a lighter blur. */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="perfwide">
@media (min-width:900px){
  .wrap.blurred .scrim{-webkit-backdrop-filter:none!important;backdrop-filter:none!important;background:rgb(6 8 7 / .62)!important}
  .sheet{-webkit-backdrop-filter:blur(12px) saturate(1.3)!important;backdrop-filter:blur(12px) saturate(1.3)!important}
  .tabs,.dock::before,.top.float,.ib,.fd-search,.banner{-webkit-backdrop-filter:blur(8px)!important;backdrop-filter:blur(8px)!important}
  #flora,#mesh,#bgcurve{will-change:auto!important}
}
</style>`);

/* ===================== polish 5: centred icons, one radius scale, timeline text, steady header,
   projects that group tasks, daily injury log ===================== */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="polish5">
/* --- icons: optically centred in every icon button; the svg is a block inside a centring flex box --- */
.ib,.x,.fab,.chk,.wk-nav,.insi,.qbi,.ico,.pj-act,.il-x,.dchip,.stepadd .primary,.chk i{display:inline-flex;align-items:center;justify-content:center;line-height:0}
.chip,.link,.pill,.primary,.secondary,.danger,.banner button,.ilq,.ptag{display:inline-flex;align-items:center;justify-content:center}
:is(.ib,.x,.fab,.chk,.chk i,.wk-nav,.insi,.qbi,.ico,.chip,.link,.pill,.primary,.secondary,.danger,.navrow,.tabs button,.banner button,.ilq,.pj-act,.il-x,.dchip,.h3d .p3)>svg{display:block;flex:none;margin:0}
:where(button):has(>svg:only-child){display:inline-flex;align-items:center;justify-content:center;line-height:0}
.ico .emo{line-height:1;display:block}
.h3d .p3 svg{transform:translateZ(0)}
.secondary{gap:8px}.secondary svg.i{width:18px;height:18px}
.tabs button{align-items:center;justify-content:center}
/* --- one radius scale: inner radius = outer radius - padding --- */
.blk{border-radius:var(--r-s)}.blk.sh{border-radius:var(--r-xs)}.blk.wide{border-radius:var(--r-s)}
input,textarea,.sel-btn{border-radius:var(--r-m)}
.kv{border-radius:var(--r-l)}
.wcol{border-radius:var(--r-xs)}
.rvcard{border-radius:var(--r-l)}
.rvcard .sh-actions button{border-radius:var(--r-m);height:48px}
.link{border-radius:999px}
/* --- week / day timeline: titles top-aligned with padding, never clipped; the now-line runs under the events --- */
.blk{z-index:3;display:flex;flex-direction:column;justify-content:flex-start;align-items:stretch;padding:4px 5px;overflow:hidden}
.blk:not(.wide){padding:4px 4px}
.blk.sh{justify-content:center;padding-top:0;padding-bottom:0}
.blk .bt{display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden;text-overflow:ellipsis;max-height:none;overflow-wrap:break-word;flex:none}
.blk .bt.one{display:block;white-space:nowrap;-webkit-line-clamp:unset}
.blk.wide .bt{font-size:13px;line-height:16px}
.blk small{flex:none;margin-top:1px}
.nowline{z-index:2;pointer-events:none}
/* --- lists: dots / checks sit on the first line of text --- */
.rvlist li{display:flex;align-items:flex-start;gap:8px}.rvlist li>svg.i{margin-top:calc((1lh - 1em) / 2);width:1em;height:1em;flex:none}
.wk-key span{line-height:1}
/* --- project tag shown on tasks elsewhere --- */
.ptag{gap:5px;height:20px;padding:0 8px 0 6px;margin:0 6px 0 0;border-radius:999px;font:700 11px/1 var(--ui);vertical-align:1px;max-width:60%;white-space:nowrap;overflow:hidden;
  color:var(--pc2,#7D55B5);background:color-mix(in srgb,var(--pc1,#C9A7E8) 22%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--pc1,#C9A7E8) 35%,transparent)}
.ptag i{width:6px;height:6px;border-radius:50%;background:var(--pc2,#7D55B5);flex:none}
.ptag span{overflow:hidden;text-overflow:ellipsis}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .ptag{color:var(--pc1,#C9A7E8)}}
:root[data-theme="dark"] .ptag{color:var(--pc1,#C9A7E8)}
/* --- project cards + sheet --- */
.pjgrid{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))}
.pjcard{display:flex;flex-direction:column;gap:12px;padding:14px;border-radius:var(--r-l);text-align:left;width:100%;min-width:0}
.pj-top{display:flex;align-items:center;gap:12px;min-width:0}
.pj-top .ico{width:44px;height:44px;border-radius:var(--r-s);flex:none}
.pj-t{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.pj-t b{font-weight:800;font-size:15.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pj-t small{font-size:12.5px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pj-top>svg.chev{transform:rotate(-90deg);color:var(--muted);width:18px;height:18px}
.pjbar{display:block;height:8px;border-radius:999px;background:color-mix(in srgb,var(--ink) 10%,transparent);overflow:hidden}
.pjbar i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--accent),color-mix(in srgb,var(--accent) 70%,#fff));min-width:0;transition:width .5s cubic-bezier(.22,1,.36,1)}
.pj-meta{display:flex;justify-content:space-between;gap:10px;font:600 12px/1.2 var(--ui);color:var(--muted)}
.pj-prog{display:flex;align-items:center;gap:12px;margin:2px 0 18px}.pj-prog .pjbar{flex:1}.pj-prog b{font:800 13px var(--ui);min-width:38px;text-align:right}
.pj-h{display:flex;align-items:center;justify-content:space-between;margin:18px 0 8px}
.pj-h .cap{margin:0}
.psteps{list-style:none;margin:0;padding:2px 0;border-radius:var(--r-l);background:color-mix(in srgb,var(--surface) 70%,transparent);border:1px solid color-mix(in srgb,var(--ink) 9%,transparent)}
.psteps:empty{display:none}
.psteps li{display:flex;align-items:center;gap:6px;padding:6px 8px 6px 4px;min-height:56px;min-width:0}
.psteps li+li{border-top:1px solid color-mix(in srgb,var(--ink) 9%,transparent)}
.psteps .chk{width:40px;height:40px;margin:0}
.psteps .st{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;font-weight:700;font-size:14.5px;line-height:1.3;overflow-wrap:anywhere}
.psteps .st small{font-weight:600;font-size:12px;color:var(--muted)}
.psteps .st small.late{color:var(--late)}
.psteps li.done .st>span{text-decoration:line-through;color:var(--muted)}
.pj-acts{display:flex;align-items:center;gap:6px;flex:none;align-self:center}
.pj-act{width:34px;height:34px;border-radius:50%;background:color-mix(in srgb,var(--ink) 8%,transparent);color:var(--ink2)}
.pj-act svg.i{width:16px;height:16px}
.pj-act.del:hover{color:var(--late)}
.stepadd{display:flex;gap:8px;margin-top:10px;align-items:center}
.stepadd input[type=text],.stepadd input:not([type]){flex:1;min-width:0;height:46px}
.stepadd .primary{width:46px;height:46px;padding:0;flex:none;border-radius:50%}
.dchip{position:relative;flex:none;height:46px;min-width:46px;padding:0 12px;gap:6px;border-radius:var(--r-m);font:700 13px var(--ui);color:var(--ink2);white-space:nowrap;
  background:color-mix(in srgb,var(--surface) 80%,transparent);border:1px solid color-mix(in srgb,var(--ink) 14%,transparent);cursor:pointer}
.dchip svg.i{width:17px;height:17px}
.dchip.set{color:var(--accent);border-color:color-mix(in srgb,var(--accent) 45%,transparent)}
.dchip input{position:absolute;inset:0;width:100%;height:100%;opacity:0;padding:0;margin:0;border:0;cursor:pointer;min-width:0}
.dchip input::-webkit-calendar-picker-indicator{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
.pjgrp .list{margin-bottom:6px}
.pj-empty{margin:0;padding:12px 2px;color:var(--muted);font-size:13.5px}
.pj-delask{display:flex;flex-direction:column;gap:10px;width:100%}
.pj-delask p{margin:0 0 4px;font-size:14px;line-height:1.4;color:var(--ink2)}
.pj-delask .row3{display:flex;gap:8px;flex-wrap:wrap}.pj-delask .row3>button{flex:1 1 140px;height:48px}
/* --- injuries: quick log button, sheet, log form --- */
.ilq{flex:none;gap:4px;height:32px;padding:0 11px 0 8px;border-radius:999px;font:800 12px/1 var(--ui);color:#fff;background:linear-gradient(160deg,#F28A92,#B83A4E);box-shadow:inset 0 1px 0 rgb(255 255 255 / .3);margin-left:6px}
.ilq svg.i{width:14px;height:14px;stroke-width:2.6}
.row .ilq+.pain,.row .pain+.ilq{margin-left:8px}
.il-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:0 0 12px}
.il-stats>div{padding:10px 12px;border-radius:var(--r-m);background:color-mix(in srgb,var(--surface) 70%,transparent);border:1px solid color-mix(in srgb,var(--ink) 9%,transparent);min-width:0}
.il-stats b{display:block;font:800 20px/1.1 var(--ui)}.il-stats span{display:block;font-size:11.5px;color:var(--muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.il-spark{padding:12px 12px 8px;border-radius:var(--r-l);background:color-mix(in srgb,var(--surface) 70%,transparent);border:1px solid color-mix(in srgb,var(--ink) 9%,transparent);margin-bottom:12px}
.il-spark svg{display:block;width:100%;height:64px;overflow:visible}
.il-spark .ax{display:flex;justify-content:space-between;font:400 10px var(--mono);color:var(--muted);margin-top:4px;text-transform:uppercase}
.il-strip{display:grid;grid-template-columns:repeat(14,minmax(0,1fr));gap:3px;margin:0 0 6px}
.il-day{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 0;border-radius:var(--r-xs);font:400 9.5px/1 var(--mono);color:var(--muted);min-width:0}
.il-day b{font:800 12px/1 var(--ui);color:var(--ink)}
.il-day i{width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:800 9.5px/1 var(--ui);font-style:normal;color:#fff;background:color-mix(in srgb,var(--ink) 8%,transparent)}
.il-day.on{background:var(--ink);color:var(--bg)}.il-day.on b{color:var(--bg)}
.il-day.today b{color:var(--accent)}.il-day.on.today b{color:var(--bg)}
.ilrows{list-style:none;margin:0 0 6px;padding:2px 0;border-radius:var(--r-l);background:color-mix(in srgb,var(--surface) 70%,transparent);border:1px solid color-mix(in srgb,var(--ink) 9%,transparent)}
.ilrow{display:flex;align-items:flex-start;gap:12px;width:100%;padding:11px 14px;text-align:left;min-width:0}
.ilrows li+li .ilrow{border-top:1px solid color-mix(in srgb,var(--ink) 9%,transparent)}
.ilp{width:32px;height:32px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;font:800 14px/1 var(--ui);color:#fff}
.ilb{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;padding-top:1px}
.ilb b{font-weight:800;font-size:14px;line-height:1.3}.ilb small{font-size:12.5px;line-height:1.35;color:var(--muted);overflow-wrap:anywhere}
.ilb .ilmeds{color:var(--ink2)}
.il-meds{list-style:none;margin:0 0 12px;padding:0;display:flex;flex-direction:column;gap:6px}
.il-meds li{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:var(--r-m);background:color-mix(in srgb,var(--surface) 70%,transparent);border:1px solid color-mix(in srgb,var(--ink) 9%,transparent);font-size:13.5px;min-width:0}
.il-meds li b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.il-meds li span{color:var(--muted);font:600 12.5px var(--ui);white-space:nowrap}
.il-meds .pill-i{width:26px;height:26px;border-radius:var(--r-xs);flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,#62C7BE 22%,transparent);color:#1F7C80}
.il-meds .pill-i svg.i{width:15px;height:15px}
.il-when{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:10px}
.il-when input{min-width:0;width:100%;-webkit-appearance:none;appearance:none;height:52px}
.il-pain{display:flex;align-items:center;gap:14px;margin:4px 0 2px}
.il-pain output{width:52px;height:52px;border-radius:var(--r-m);display:flex;align-items:center;justify-content:center;font:800 22px/1 var(--ui);color:#fff;flex:none}
.il-pain input{flex:1;padding:0;border:0;background:none}
.il-scale{display:flex;justify-content:space-between;font:400 10px var(--mono);color:var(--muted);margin:0 0 14px 66px;text-transform:uppercase}
.il-mchips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 10px}
.il-mchips .chip{height:36px;padding:0 13px;font-size:13px;gap:6px}
.il-mchips .chip svg.i{width:14px;height:14px}
.il-mchips .chip.new{border-style:dashed;color:var(--accent)}
.il-picked{list-style:none;margin:0 0 10px;padding:0;display:flex;flex-direction:column;gap:6px}
.il-picked li{display:grid;grid-template-columns:minmax(0,1fr) 92px 104px 34px;align-items:center;gap:6px;padding:6px 6px 6px 12px;border-radius:var(--r-m);background:color-mix(in srgb,var(--surface) 70%,transparent);border:1px solid color-mix(in srgb,var(--ink) 9%,transparent)}
.il-picked b{font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.il-picked input{height:38px;padding:0 8px;font-size:13.5px;border-radius:var(--r-s);min-width:0;-webkit-appearance:none;appearance:none}
.il-x{width:34px;height:34px;border-radius:50%;background:color-mix(in srgb,var(--ink) 8%,transparent)}.il-x svg.i{width:15px;height:15px}
.il-new{display:grid;grid-template-columns:minmax(0,1fr) 96px 46px;gap:6px;margin:0 0 12px}
.il-new input{height:46px;min-width:0}.il-new .primary{width:46px;height:46px;padding:0;border-radius:50%}
@media (max-width:380px){.il-picked li{grid-template-columns:minmax(0,1fr) 76px 92px 32px}}
/* --- focus card --- */
.fcard .rvgrid{align-items:start;margin:4px 0 12px}
.fcard .rvgrid>div{min-width:0}.fcard .rvgrid span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fcard .sh-actions{display:flex;gap:8px}.fcard .sh-actions button{flex:1 1 0;min-width:0;gap:8px;padding:0 12px}
.fcard .sh-actions svg.i{width:17px;height:17px}
/* --- header: the toggle never changes the header's height in the layout (fixed box; only paint and transforms change) --- */
#top{height:var(--toph,auto);box-sizing:border-box}
#top.float{height:var(--toph,auto);min-height:0}
</style>`);

/* ---------- projects: a task / reminder links to a project with project:<id> (old entries may hold the project's title) ---------- */
const projById=id=>{const p=id?find(id):null;return p&&p.type==='project'?p:null};
function projOf(e){if(!e||!e.project)return null;const p=projById(e.project);if(p)return p;const t=String(e.project).trim().toLowerCase();if(!t)return null;return of('project').find(x=>(x.title||'').trim().toLowerCase()===t)||null}
function projLabel(e){const p=projOf(e);return p?(p.title||'Project'):(e&&e.project&&!projById(e.project)&&!/^[a-z0-9]{10,}$/.test(e.project)?e.project:'')}
const projItems=p=>db.entries.filter(e=>(e.type==='task'||e.type==='reminder')&&e.project&&projOf(e)===p);
function projStats(p){const s=p.steps||[],it=projItems(p),done=s.filter(x=>x.done).length+it.filter(x=>x.done).length,tot=s.length+it.length;return{s,it,done,tot,pct:tot?done/tot:0,open:it.filter(x=>!x.done).length}}
const pcol=p=>{const c=p&&p.color!==undefined&&p.color!==''?PICK_COLS[+p.color]:null;return c?`--pc1:${c[0]};--pc2:${c[1]}`:''};
TYPES.task.f=TYPES.task.f.map(f=>f[0]==='project'?['project','Project','project']:f);
if(!TYPES.reminder.f.some(f=>f[0]==='project'))TYPES.reminder.f.push(['project','Project','project']);
const _field5=field;
field=function(f,v){
  if(f[2]!=='project')return _field5(f,v);
  let cur=v||'';const m=cur?projOf({project:cur}):null;if(m)cur=m.id;
  if(!cur&&PJ_CTX&&projById(PJ_CTX))cur=PJ_CTX;
  const ps=of('project').filter(p=>(p.status||'Active')!=='Done'||p.id===cur).sort((a,b)=>(a.title||'').localeCompare(b.title||''));
  const opts=[['','No project'],...ps.map(p=>[p.id,p.title||'Project'])];if(cur&&!opts.some(o=>o[0]===cur))opts.push([cur,cur]);
  return`<label class="fld" for="f_project"><span>${f[1]}</span>${selectHTML('project',opts,cur,'f_project')}</label>`;
};
let PJ_CTX=null,ROW_NOPTAG=false;
const _row5=row;
row=function(e){
  let h=_row5(e);
  if((e.type==='task'||e.type==='reminder')&&!ROW_NOPTAG){const p=projOf(e);
    if(p){const tag=`<span class="ptag" style="${pcol(p)}"><i></i><span>${esc(p.title||'Project')}</span></span>`;
      const i=h.indexOf('<span class="rs">');
      if(i>=0)h=h.slice(0,i+17)+tag+h.slice(i+17);
      else{const j=h.indexOf('</button>',h.indexOf('class="rowbtn"'));if(j>0)h=h.slice(0,j)+`<span class="rs">${tag}</span>`+h.slice(j)}}}
  if(e.type==='injury'&&e.status!=='Healed'){const j=h.lastIndexOf('</li>');h=h.slice(0,j)+`<button class="ilq" data-injlog="${esc(e.id)}" aria-label="Log ${esc(e.title||'injury')} today">${ic('plus')}Log</button>`+h.slice(j)}
  return h;
};
function projCards(a){
  return`<div class="pjgrid">${a.map(p=>{const st=projStats(p),nx=st.s.find(x=>!x.done);
    const sub=[nx?`Next: ${nx.t}`:p.next?`Next: ${p.next}`:'',].filter(Boolean).join(' · ')||(st.tot?'All done':'No steps or tasks yet');
    return`<button class="card-s pjcard" data-open="${esc(p.id)}"><span class="pj-top">${tileE(p)}<span class="pj-t"><b>${esc(p.title||'Project')}</b><small>${esc(sub)}</small></span>${ic('chev','i chev')}</span>
      <span class="pjbar"><i style="width:${Math.round(st.pct*100)}%"></i></span>
      <span class="pj-meta"><span>${st.s.length?`${st.s.filter(x=>x.done).length}/${st.s.length} steps`:'No steps'}</span><span>${st.it.length?`${st.open} open · ${st.it.length-st.open} done`:'No tasks'}</span></span></button>`}).join('')}</div>`;
}
const dueTxt=d=>{if(!d)return'';const n=dayDiff(d);return n<0?`${relDue(d)}`:`Due ${relDue(d).toLowerCase()==='today'?'today':relDue(d).toLowerCase()==='tomorrow'?'tomorrow':relDue(d)}`};
const dchip=(id,val,label)=>`<label class="dchip${val?' set':''}" title="${esc(label)}">${ic('cal')}<span>${val?esc(fmtDate(val)):'Date'}</span><input id="${id}" type="date" value="${esc(val||'')}" aria-label="${esc(label)}"></label>`;
function projSheetHTML(e){
  const st=projStats(e),s=st.s,open=st.it.filter(x=>!x.done).sort(byDue),done=st.it.filter(x=>x.done).sort((a,b)=>(b.doneAt||0)-(a.doneAt||0));
  ROW_NOPTAG=true;let L1,L2;try{L1=open.length?list(open,''):`<p class="pj-empty">Nothing open. Add a task below.</p>`;L2=done.length?list(done,''):''}finally{ROW_NOPTAG=false}
  return`<div id="pjSheet" data-pid="${esc(e.id)}"><div class="sh-h"><div class="lhs"><span class="cap">Project · ${esc(e.status||'Active')}</span></div><button type="button" class="x" data-close aria-label="Close">${ic('close')}</button></div>
    <div class="dhead">${tileE(e)}<div style="min-width:0"><h3>${esc(e.title||'Project')}</h3><div class="rs" style="margin-top:4px">${st.tot?`${st.done} of ${st.tot} done`:'No steps or tasks yet'}${st.open?` · ${st.open} open task${st.open===1?'':'s'}`:''}</div></div></div>
    <div class="pj-prog"><span class="pjbar"><i style="width:${Math.round(st.pct*100)}%"></i></span><b class="num">${Math.round(st.pct*100)}%</b></div>
    <div class="pj-h"><span class="cap">Steps${s.length?` · ${s.filter(x=>x.done).length}/${s.length}`:''}</span></div>
    <ul class="psteps" id="stepList">${s.map(x=>{const late=x.due&&!x.done&&dayDiff(x.due)<0;return`<li class="${x.done?'done':''}"><button class="chk${x.done?' on':''}" data-step="${e.id}:${x.id}" aria-label="${x.done?'Mark not done':'Mark done'}"><i><svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7"/></svg></i></button><span class="st"><span>${esc(x.t)}</span>${x.due?`<small class="${late?'late':''}">${esc(dueTxt(x.due))}</small>`:''}</span><span class="pj-acts"><button class="pj-act" data-steptask="${e.id}:${x.id}" aria-label="Make it a task" title="Make it a task">${ic('check')}</button><button class="pj-act del" data-stepdel="${e.id}:${x.id}" aria-label="Delete step" title="Delete step">${ic('close')}</button></span></li>`}).join('')}</ul>
    <div class="stepadd"><input id="stepIn" placeholder="Add a step" enterkeyhint="done" autocomplete="off">${dchip('stepDue','','Step due date (optional)')}<button class="primary" id="stepAdd" data-pid="${esc(e.id)}" aria-label="Add step">${ic('plus')}</button></div>
    <div class="pj-h"><span class="cap">Tasks &amp; reminders · ${st.it.length}</span></div>
    <div class="pjgrp"><div class="cap" style="margin:0 0 6px;opacity:.8">Open · ${open.length}</div>${L1}${done.length?`<div class="cap" style="margin:12px 0 6px;opacity:.8">Done · ${done.length}</div>${L2}`:''}</div>
    <div class="stepadd"><input id="pjTaskIn" placeholder="Add task to this project" enterkeyhint="done" autocomplete="off">${dchip('pjTaskDue','','Task due date (optional)')}<button class="primary" id="pjTaskAdd" data-pid="${esc(e.id)}" aria-label="Add task">${ic('plus')}</button></div>
    ${e.notes?`<div class="cap" style="margin:18px 0 8px">Notes</div><div class="notes">${esc(e.notes)}</div>`:''}
    <div class="sh-actions"><button class="primary" data-edit="${esc(e.id)}">${ic('edit')}Edit project</button></div></div>`;
}
openProject=function(id){
  const e=find(id);if(!e)return;const html=projSheetHTML(e);
  if(!wrap.hidden&&wrap.classList.contains('open')&&$('#pjSheet')){const sh=$('.sheet'),sb=sh.scrollTop;$('#sheetBody').innerHTML=html;sh.scrollTop=sb}else openSheet(html);
};
function pjAddTask(pid){const p=find(pid),inp=$('#pjTaskIn'),t=(inp&&inp.value||'').trim();if(!p)return;if(!t){inp&&inp.focus();return}
  db.entries.push({id:uid(),type:'task',title:t,project:p.id,due:($('#pjTaskDue')||{}).value||'',priority:'Normal',created:Date.now()});delete p.sample;save();render(false);openProject(pid);
  setTimeout(()=>{const i=$('#pjTaskIn');i&&i.focus({preventScroll:true})},30)}
/* delete a project: choose what happens to its tasks and reminders */
function pjDeleteAsk(btn,p){
  const it=projItems(p),acts=btn.closest('.sh-actions');if(!acts)return;
  acts.innerHTML=`<div class="pj-delask"><p><b>Delete “${esc(p.title||'Project')}”?</b> It has ${it.length} task${it.length===1?'':'s'} and reminder${it.length===1?'':'s'} linked to it.</p>
    <div class="row3"><button type="button" class="secondary" data-pjdel="unassign" data-pid="${esc(p.id)}">Keep them, unassign</button><button type="button" class="danger" data-pjdel="all" data-pid="${esc(p.id)}">Delete them too</button></div>
    <button type="button" class="link" data-pjdel="cancel" data-pid="${esc(p.id)}" style="align-self:center">Cancel</button></div>`;
}
function pjDelete(pid,mode){const p=find(pid);if(!p)return;const it=projItems(p),ids=new Set(it.map(x=>x.id));
  if(mode==='all')db.entries=db.entries.filter(x=>!ids.has(x.id)&&x.id!==pid);
  else{it.forEach(x=>{x.project='';delete x.sample});db.entries=db.entries.filter(x=>x.id!==pid)}
  save();closeSheet();render(false);toast(mode==='all'?`Deleted project and ${it.length} item${it.length===1?'':'s'}`:'Project deleted · tasks kept')}

/* ---------- injuries: a daily log (pain 0–10, notes, medication) stored in db.injlog; meds you reuse in db.meds.
   Both are lists of objects with ids, so sync merges them item by item like entries. ---------- */
const injlog=()=>(db.injlog=Array.isArray(db.injlog)?db.injlog:[]);
const medsL=()=>(db.meds=Array.isArray(db.meds)?db.meds:[]);
const injLogs=id=>injlog().filter(x=>x&&x.inj===id&&x.at).sort((a,b)=>b.at.localeCompare(a.at));
const painCol=p=>`hsl(${Math.round(130-12*Math.max(0,Math.min(10,num(p))))} 62% ${p>=7?46:44}%)`;
const nowT=()=>{const d=new Date();return pad(d.getHours())+':'+pad(d.getMinutes())};
const dayAvg=l=>l.length?l.reduce((s,x)=>s+num(x.pain),0)/l.length:null;
function injSpark(id){
  const L=injLogs(id),by={};L.forEach(x=>{(by[x.at.slice(0,10)]=by[x.at.slice(0,10)]||[]).push(x)});
  const pts=[];for(let i=29;i>=0;i--){const d=addDays(-i),a=by[d];if(a)pts.push([29-i,dayAvg(a)])}
  if(pts.length<2)return`<div class="il-spark"><p class="small" style="margin:0">${pts.length?'One day logged. The 30-day trend appears after a second day.':'No logs yet. Tap “Log today” to start a 30-day pain trend.'}</p></div>`;
  const W=300,H=60,X=i=>(i/29*W).toFixed(1),Y=v=>(H-4-(v/10)*(H-8)).toFixed(1);
  const line=pts.map(([i,v],k)=>`${k?'L':'M'}${X(i)} ${Y(v)}`).join(''),area=`${line}L${X(pts[pts.length-1][0])} ${H}L${X(pts[0][0])} ${H}Z`;
  const last=pts[pts.length-1];
  return`<div class="il-spark"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Pain over the last 30 days">
    <defs><linearGradient id="ilg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F28A92" stop-opacity=".45"/><stop offset="1" stop-color="#F28A92" stop-opacity="0"/></linearGradient></defs>
    <path d="M0 ${Y(5)}H${W}" stroke="currentColor" stroke-opacity=".12" stroke-dasharray="3 4" vector-effect="non-scaling-stroke"/>
    <path d="${area}" fill="url(#ilg)"/><path d="${line}" fill="none" stroke="#E0566A" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
    <circle cx="${X(last[0])}" cy="${Y(last[1])}" r="3.5" fill="#E0566A" vector-effect="non-scaling-stroke"/></svg>
    <div class="ax"><span>30 days ago</span><span>Pain 0–10</span><span>Today</span></div></div>`;
}
let INJ_SEL=null;
function medLine(m){return[m.name||(medsL().find(x=>x.id===m.med)||{}).name||'Medication',m.dose,m.time?fmtT(m.time):''].filter(Boolean).join(' · ')}
function injSheetHTML(e){
  const L=injLogs(e.id),td=today(),tl=L.filter(x=>x.at.slice(0,10)===td),by={};L.forEach(x=>{(by[x.at.slice(0,10)]=by[x.at.slice(0,10)]||[]).push(x)});
  const cur=L.length?num(L[0].pain):num(e.pain),w7=L.filter(x=>dayDiff(x.at.slice(0,10))>-7),a7=dayAvg(w7);
  const days=[...Array(14)].map((_,i)=>addDays(i-13));
  const strip=`<div class="il-strip">${days.map(d=>{const a=by[d],v=a?dayAvg(a):null;return`<button class="il-day${d===td?' today':''}${INJ_SEL===d?' on':''}" data-ilday="${d}" aria-label="${esc(fmtLong(d))}${v!=null?`, pain ${v.toFixed(1)}`:''}"><span>${wdOf(d).slice(0,1)}</span><b>${+d.slice(8)}</b><i${v!=null?` style="background:${painCol(v)}"`:''}>${v!=null?Math.round(v):''}</i></button>`}).join('')}</div>`;
  const showDays=Object.keys(by).sort().reverse().filter(d=>!INJ_SEL||d===INJ_SEL).slice(0,INJ_SEL?1:10);
  const meds=tl.flatMap(x=>(x.meds||[]).map(m=>({...m,_at:x.at}))).sort((a,b)=>(a.time||a._at.slice(11)).localeCompare(b.time||b._at.slice(11)));
  const rowsFor=d=>`<ul class="ilrows">${by[d].map(x=>`<li><button class="ilrow" data-ilog="${esc(x.id)}" data-inj="${esc(e.id)}"><span class="ilp" style="background:${painCol(x.pain)}">${Math.round(num(x.pain))}</span><span class="ilb"><b>${esc(fmtT(x.at.slice(11,16)))}</b>${x.notes?`<small>${esc(x.notes)}</small>`:''}${(x.meds||[]).length?`<small class="ilmeds">💊 ${esc(x.meds.map(medLine).join(', '))}</small>`:''}</span></button></li>`).join('')}</ul>`;
  const kv=[['Status',e.status||'Active'],e.date?['Started',fmtLong(e.date)]:null].filter(Boolean);
  return`<div id="injSheet" data-inj="${esc(e.id)}"><div class="sh-h"><div class="lhs"><span class="cap">Injury · ${esc(e.status||'Active')}</span></div><button type="button" class="x" data-close aria-label="Close">${ic('close')}</button></div>
    <div class="dhead">${tileE(e)}<div style="min-width:0"><h3>${esc(e.title||'Injury')}</h3><div class="rs" style="margin-top:4px">${esc([e.date?`since ${fmtDate(e.date)}`:'',L.length?`${L.length} log${L.length===1?'':'s'}`:'not logged yet'].filter(Boolean).join(' · '))}</div></div></div>
    <div class="il-stats"><div><b class="num" style="color:${painCol(cur)}">${Math.round(cur)}<small style="font-size:12px;color:var(--muted)">/10</small></b><span>pain now</span></div><div><b class="num">${a7!=null?a7.toFixed(1):'—'}</b><span>7-day average</span></div><div><b class="num">${tl.length}</b><span>logs today</span></div></div>
    ${injSpark(e.id)}
    <div class="sh-actions" style="margin:0 0 6px"><button class="primary" data-injlog="${esc(e.id)}">${ic('plus')}Log today</button></div>
    <div class="pj-h"><span class="cap">Today’s meds</span></div>
    ${meds.length?`<ul class="il-meds">${meds.map(m=>`<li><span class="pill-i">${ic('check')}</span><b>${esc(m.name||'Medication')}</b><span>${esc([m.dose,m.time?fmtT(m.time):fmtT(m._at.slice(11,16))].filter(Boolean).join(' · '))}</span></li>`).join('')}</ul>`:`<p class="pj-empty" style="padding-top:0">No medication logged today.</p>`}
    <div class="pj-h"><span class="cap">Last 14 days</span>${INJ_SEL?`<button class="link" data-ilday="">Show all</button>`:''}</div>
    ${strip}
    ${showDays.length?showDays.map(d=>`<div class="cap" style="margin:12px 0 6px">${esc(dayDiff(d)===0?'Today':dayDiff(d)===-1?'Yesterday':fmtLong(d))} · ${by[d].length} entr${by[d].length===1?'y':'ies'} · avg ${dayAvg(by[d]).toFixed(1)}</div>${rowsFor(d)}`).join(''):`<p class="pj-empty">${INJ_SEL?'Nothing logged that day.':'Entries you log show up here, grouped by day.'}</p>`}
    <ul class="kv" style="margin-top:16px">${kv.map(([l,v])=>`<li><span class="cap">${esc(l)}</span><b>${esc(v)}</b></li>`).join('')}</ul>
    ${e.notes?`<div class="cap" style="margin-bottom:8px">Notes</div><div class="notes">${esc(e.notes)}</div>`:''}
    <div class="sh-actions"><button class="secondary" data-edit="${esc(e.id)}">${ic('edit')}Edit injury</button></div></div>`;
}
function openInjury(id,keep){const e=find(id);if(!e)return;if(!keep)INJ_SEL=null;const html=injSheetHTML(e);
  if(!wrap.hidden&&wrap.classList.contains('open')&&$('#injSheet')){const sh=$('.sheet'),sb=sh.scrollTop;$('#sheetBody').innerHTML=html;sh.scrollTop=sb}else openSheet(html)}
const _odInj=openDetail;openDetail=function(id){const e=find(id);if(e&&e.type==='injury')return openInjury(id);return _odInj(id)};
let ILF=null;
function ilMedsHTML(){return ILF.meds.map((m,i)=>`<li><b>${esc(m.name)}</b><input data-ilm="${i}" data-k="dose" value="${esc(m.dose||'')}" placeholder="Dose" aria-label="Dose of ${esc(m.name)}"><input data-ilm="${i}" data-k="time" type="time" value="${esc(m.time||'')}" aria-label="Time taken"><button type="button" class="il-x" data-ilmx="${i}" aria-label="Remove ${esc(m.name)}">${ic('close')}</button></li>`).join('')}
function ilChipsHTML(){return medsL().map(m=>`<button type="button" class="chip" data-ilpick="${esc(m.id)}">${ic('plus')}${esc(m.name)}${m.dose?`<small style="opacity:.6;font-weight:600">${esc(m.dose)}</small>`:''}</button>`).join('')+`<button type="button" class="chip new" data-ilnew>${ic('plus')}New med</button>`}
function openInjLog(injId,logId){
  const e=find(injId);if(!e)return;const x=logId?injlog().find(l=>l.id===logId):null;
  ILF={inj:injId,id:x?x.id:'',meds:x?(x.meds||[]).map(m=>({...m})):[]};
  const at=x?x.at:`${today()}T${nowT()}`,p=x?num(x.pain):(injLogs(injId)[0]?num(injLogs(injId)[0].pain):num(e.pain));
  openSheet(`<form id="ilForm">${sheetHead(`${x?'Edit':'Log'} <em>${esc(e.title||'injury')}</em>`,`open:${injId}`)}
    <div class="il-when"><label class="fld" for="ilDate"><span>Date</span><input id="ilDate" type="date" value="${esc(at.slice(0,10))}" required></label><label class="fld" for="ilTime"><span>Time</span><input id="ilTime" type="time" value="${esc(at.slice(11,16))}" required></label></div>
    <label class="fld" for="ilPain"><span>Pain</span></label>
    <div class="il-pain"><output id="ilOut" style="background:${painCol(p)}">${Math.round(p)}</output><input id="ilPain" type="range" min="0" max="10" step="1" value="${Math.round(p)}" style="--p:${Math.round(p)*10}%" aria-label="Pain from 0 to 10"></div>
    <div class="il-scale"><span>0 none</span><span>5</span><span>10 worst</span></div>
    <label class="fld" for="ilNotes"><span>Notes (optional)</span><textarea id="ilNotes" rows="2" placeholder="What made it better or worse?">${esc(x?x.notes||'':'')}</textarea></label>
    <div class="fld" style="margin-bottom:4px"><span>Medication taken</span></div>
    <ul class="il-picked" id="ilPicked">${ilMedsHTML()}</ul>
    <div class="il-mchips" id="ilChips">${ilChipsHTML()}</div>
    <div class="il-new" id="ilNew" hidden><input id="ilNewName" placeholder="Medication name" autocomplete="off"><input id="ilNewDose" placeholder="Dose" autocomplete="off"><button type="button" class="primary" id="ilNewAdd" aria-label="Save medication">${ic('check')}</button></div>
    <div class="sh-actions">${x?`<button type="button" class="danger" id="ilDel">Delete</button>`:''}<button class="primary" type="submit">Save</button></div></form>`);
}
function ilRefreshMeds(){const a=$('#ilPicked');if(a)a.innerHTML=ilMedsHTML();const c=$('#ilChips');if(c)c.innerHTML=ilChipsHTML()}
function ilSave(){
  const d=$('#ilDate').value||today(),t=$('#ilTime').value||nowT(),e=find(ILF.inj);if(!e)return;
  const o={inj:ILF.inj,at:`${d}T${t}`,pain:Math.max(0,Math.min(10,num($('#ilPain').value))),notes:($('#ilNotes').value||'').trim(),meds:ILF.meds.filter(m=>m.name).map(m=>({med:m.med||'',name:m.name,dose:(m.dose||'').trim(),time:m.time||''}))};
  const L=injlog();if(ILF.id){const x=L.find(l=>l.id===ILF.id);if(x)Object.assign(x,o)}else L.push({id:uid(),created:Date.now(),...o});
  const latest=injLogs(ILF.inj)[0];if(latest&&num(e.pain)!==latest.pain){e.pain=latest.pain;delete e.sample}
  save();render(false);toast('Logged');NAV_DIR=-1;openInjury(ILF.inj);
}

/* ---------- focus card: no repeated numbers; three aligned stats, centred buttons ---------- */
focusSection=function(){
  const w=focusWeek(),td=of('focus').filter(e=>e.date===today()),tdm=td.reduce((s,e)=>s+num(e.minutes),0);
  const named=w.by.filter(([k])=>k&&k!=='Focus'&&k!=='focus');
  const third=named.length?[fmtDurS(named[0][1]),named[0][0]]:[fmtDurS(tdm),'today'];
  return section('Focus <em>this week</em>',`<div class="card-s rvcard fcard"><div class="rvgrid"><div><b class="num">${fmtDurS(w.total)}</b><span>this week</span></div><div><b class="num">${w.n}</b><span>session${w.n===1?'':'s'}</span></div><div><b class="num">${third[0]}</b><span>${esc(third[1])}</span></div></div><div class="sh-actions" style="margin:0"><button class="secondary" data-focus="">${ic('play')}<span>${FOCUS()?'Open timer':'Start Pomodoro'}</span></button><button class="secondary" id="fcLog3">${ic('list')}<span>Log</span></button></div></div>`,`<button class="link" data-focus="">${ic('plus')}Focus</button>`);
};

/* ---------- clicks for all of the above (window capture runs before the app's document handlers) ---------- */
window.addEventListener('click',ev=>{
  const t=ev.target;if(!t.closest)return;
  const stop=()=>{ev.preventDefault();ev.stopImmediatePropagation()};
  const dc=t.closest('.dchip');if(dc&&t.tagName!=='INPUT'){const i=dc.querySelector('input');stop();try{i.showPicker()}catch(e){i.focus();i.click()}return}
  if(t.closest('.dchip input')){const i=t.closest('.dchip input');try{if(i.showPicker){ev.preventDefault();i.showPicker()}}catch(e){}ev.stopImmediatePropagation();return}
  let b=t.closest('#pjTaskAdd');if(b){stop();pjAddTask(b.dataset.pid);return}
  b=t.closest('#pjSheet [data-chk]');if(b){stop();const x=find(b.dataset.chk);if(!x)return;x.done=!x.done;x.doneAt=Date.now();delete x.sample;save();if(x.done){tick();toast('Done')}
    b.classList.toggle('on',x.done);anim(b.querySelector('i'),{scale:[.5,1]},{spring:true,k:600,d:14});const pid=$('#pjSheet').dataset.pid;setTimeout(()=>{render(false);if($('#pjSheet'))openProject(pid)},x.done?380:0);return}
  b=t.closest('#pjSheet [data-steptask]');if(b){stop();const[pid,sid]=b.dataset.steptask.split(':'),p=find(pid),s=p&&(p.steps||[]).find(x=>x.id===sid);if(!s)return;
    db.entries.push({id:uid(),type:'task',title:s.t,project:p.id,due:s.due||'',priority:'Normal',created:Date.now()});save();render(false);openProject(pid);toast('Added as a task in this project');return}
  b=t.closest('#delBtn');if(b){const f=$('#entryForm');const p=f&&f.dataset.type==='project'?find(f.dataset.id):null;if(p&&projItems(p).length){stop();pjDeleteAsk(b,p);return}}
  b=t.closest('[data-pjdel]');if(b){stop();const m=b.dataset.pjdel;if(m==='cancel'){openForm('project',b.dataset.pid);return}pjDelete(b.dataset.pid,m);return}
  b=t.closest('[data-injlog]');if(b){stop();openInjLog(b.dataset.injlog);return}
  b=t.closest('[data-ilog]');if(b){stop();openInjLog(b.dataset.inj,b.dataset.ilog);return}
  b=t.closest('[data-ilday]');if(b&&$('#injSheet')){stop();const d=b.dataset.ilday;INJ_SEL=d&&INJ_SEL!==d?d:null;openInjury($('#injSheet').dataset.inj,true);return}
  b=t.closest('[data-ilpick]');if(b&&ILF){stop();const m=medsL().find(x=>x.id===b.dataset.ilpick);if(m){ILF.meds.push({med:m.id,name:m.name,dose:m.dose||'',time:nowT()});ilRefreshMeds()}return}
  b=t.closest('[data-ilmx]');if(b&&ILF){stop();ILF.meds.splice(+b.dataset.ilmx,1);ilRefreshMeds();return}
  b=t.closest('[data-ilnew]');if(b){stop();const n=$('#ilNew');n.hidden=!n.hidden;if(!n.hidden)setTimeout(()=>$('#ilNewName').focus(),30);return}
  b=t.closest('#ilNewAdd');if(b&&ILF){stop();const nm=($('#ilNewName').value||'').trim(),ds=($('#ilNewDose').value||'').trim();if(!nm){$('#ilNewName').focus();return}
    let m=medsL().find(x=>(x.name||'').toLowerCase()===nm.toLowerCase());if(!m){m={id:uid(),name:nm,dose:ds};medsL().push(m);save()}
    ILF.meds.push({med:m.id,name:m.name,dose:ds||m.dose||'',time:nowT()});$('#ilNewName').value='';$('#ilNewDose').value='';$('#ilNew').hidden=true;ilRefreshMeds();return}
  b=t.closest('#ilDel');if(b&&ILF){stop();arm(b,'Tap again to delete',()=>{db.injlog=injlog().filter(x=>x.id!==ILF.id);const e=find(ILF.inj),l=injLogs(ILF.inj)[0];if(e&&l)e.pain=l.pain;save();render(false);toast('Deleted');NAV_DIR=-1;openInjury(ILF.inj)});return}
},true);
document.addEventListener('submit',ev=>{if(ev.target.id!=='ilForm')return;ev.preventDefault();ilSave()});
document.addEventListener('input',ev=>{const t=ev.target;
  if(t.id==='ilPain'){const v=+t.value,o=$('#ilOut');t.style.setProperty('--p',v*10+'%');if(o){o.textContent=v;o.style.background=painCol(v)}return}
  if(t.dataset&&t.dataset.ilm!==undefined&&ILF){const m=ILF.meds[+t.dataset.ilm];if(m)m[t.dataset.k]=t.value;return}
  const dc=t.closest&&t.closest('.dchip');if(dc){dc.classList.toggle('set',!!t.value);dc.querySelector('span').textContent=t.value?fmtDate(t.value):'Date'}});
document.addEventListener('change',ev=>{const t=ev.target,dc=t.closest&&t.closest('.dchip');if(dc){dc.classList.toggle('set',!!t.value);dc.querySelector('span').textContent=t.value?fmtDate(t.value):'Date'}});
document.addEventListener('keydown',ev=>{if(ev.key!=='Enter')return;
  if(ev.target.id==='pjTaskIn'){ev.preventDefault();pjAddTask($('#pjTaskAdd').dataset.pid)}
  else if(ev.target.id==='ilNewName'||ev.target.id==='ilNewDose'){ev.preventDefault();$('#ilNewAdd').click()}},true);

/* ---------- header: one fixed layout height for both states, so floating can never move the scroll position ---------- */
(function(){const t=document.getElementById('top');if(!t)return;let tm=0;
  function measure(){const top=document.getElementById('top');if(!top||top.classList.contains('float'))return;
    top.style.setProperty('--toph','auto');const h=Math.ceil(top.getBoundingClientRect().height);if(h>20)top.style.setProperty('--toph',h+'px')}
  window.measureTop=measure;
  const later=()=>{clearTimeout(tm);tm=setTimeout(measure,420)};
  const _rT=render;render=function(a,f,d){const r=_rT(a,f,d);requestAnimationFrame(measure);return r};
  addEventListener('resize',later);
  new MutationObserver(()=>{if(!t.classList.contains('float'))later()}).observe(t,{attributes:true,attributeFilter:['class']});
  requestAnimationFrame(measure);setTimeout(measure,600);
  /* the greeting fit runs on resize / class change; it can no longer move layout, and it is capped so nothing can make it loop */
  const _fit=fitHello;let n=0,t0=0;fitHello=function(){const now=performance.now();if(now-t0>1000){t0=now;n=0}if(++n>6)return;return _fit()};
})();

/* Notebooks strip: keep showing the last strip while it refreshes, so the page never collapses and jumps on re-render */
(function(){if(typeof notebookStrip!=='function')return;const _nb=notebookStrip;let last='';
  notebookStrip=async function(){const el=$('#nbStrip');if(el&&last&&!el.querySelector('.nbs'))el.innerHTML=last;
    await _nb();const e2=$('#nbStrip');if(e2&&e2.querySelector('.nbs'))last=e2.innerHTML}})();

/* ===================== Home v2 (Oct 21): reminders on Home; schedule, due-this-week and food log live in their own tabs ===================== */
TODAY_SECS.splice(1,0,['rem','Reminders','Your open reminders, soonest first']);
/* (old one-time Home setup removed: it ran before data loaded) */
function homeReminders(){
  const rs=of('reminder').filter(e=>!e.done).sort((a,b)=>((a.due||'9999')+(a.time||'')).localeCompare((b.due||'9999')+(b.time||''))).slice(0,6);
  const n=of('reminder').filter(e=>!e.done).length;
  return section('Your <em>reminders</em>',list(rs,'No reminders. Add one with the + button.'),`<button class="link" data-goto="mind:reminder">${n>6?'All '+n:'All'}</button>`);
}
/* removed from the Today tab outright (still in their own tabs): due this week, today's schedule, eaten today */
for(let i=TODAY_SECS.length-1;i>=0;i--)if(['due','sched','eaten'].includes(TODAY_SECS[i][0]))TODAY_SECS.splice(i,1);
const TODAY_OUT=/<section class="sec"><div class="sec-h"><h2>(Due <em>this week|Today’s <em>schedule|Eaten <em>today)[\s\S]*?<\/section>/g;
const _vtHome2=viewToday;viewToday=function(){let h=_vtHome2().replace(TODAY_OUT,'');const H=new Set([...(db.settings.todayHide||[]),'due','sched','eaten']);
  if(!H.has('rem')){const r=homeReminders(),i=h.indexOf('<section class="sec"><div class="sec-h"><h2>Habits');
    if(i>=0)h=h.slice(0,i)+r+h.slice(i);else{const c=h.indexOf('<div class="chips"');const e=c>=0?h.indexOf('</div>',c)+6:-1;h=e>5?h.slice(0,e)+r+h.slice(e):h+r}}
  /* the bus card used to sit in front of "Due this week"; keep it on Home when that section is hidden */
  {const sp=h.indexOf('<div class="sprig'),ii=h.indexOf('<section class="sec"><div class="sec-h"><h2>Insights');
    if(sp>=0&&ii>sp){const ie=h.indexOf('</section>',ii)+10,ins=h.slice(ii,ie);h=h.slice(0,ii)+h.slice(ie);const L=h.indexOf('<section class="sec"><div class="sec-h"><h2>Logging'),at=L>=0?L:h.indexOf('<div class="sprig');h=h.slice(0,at)+ins+h.slice(at)}}
  if(H.has('due')&&typeof busCard==='function'&&!/class="card-s bus"/.test(h)){const b=busCard();if(b){const i=h.indexOf('<section class="sec"><div class="sec-h"><h2>Logging');h=i>=0?h.slice(0,i)+b+h.slice(i):h+b}}
  return h};
/* big Home card: each of the four tiles gets its own colour so they read apart at a glance */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="tsTint">
.ts-grid>button{--tc:255 255 255;background:linear-gradient(155deg,rgb(var(--tc) / .26),rgb(var(--tc) / .07) 70%)!important;border:1px solid rgb(var(--tc) / .38)!important;box-shadow:inset 0 1px 0 rgb(255 255 255 / .14);position:relative;overflow:hidden}
.ts-grid>button::before{content:"";position:absolute;left:10px;right:10px;top:0;height:2px;border-radius:0 0 2px 2px;background:rgb(var(--tc))}
.ts-grid>button svg.i{color:rgb(var(--tc));opacity:1}
.ts-grid>button small{color:rgb(var(--tc));opacity:.95}
.ts-grid>button:nth-child(1){--tc:134 207 160}
.ts-grid>button:nth-child(2){--tc:169 155 255}
.ts-grid>button:nth-child(3){--tc:240 109 68}
.ts-grid>button:nth-child(4){--tc:255 196 107}
:root[data-theme="light"] .ts-grid>button small{filter:brightness(.7)}
</style>`);

/* ===================== design accents (Oct 21): the intro's pixel + spline language, used sparingly ===================== */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="pxcss">
/* 1. pixel progress bars */
.ts-leg .tb{height:6px!important;border-radius:1px!important;-webkit-mask:repeating-linear-gradient(90deg,#000 0 6px,transparent 6px 8px);mask:repeating-linear-gradient(90deg,#000 0 6px,transparent 6px 8px)}
.ts-leg .tb i{border-radius:0!important}
/* 2. pixel glyph on section titles */
.sec-h h2::before{content:"";display:inline-block;width:4px;height:4px;margin:0 13px 0 1px;vertical-align:.2em;background:#F06D44;box-shadow:4px -4px 0 #86CFA0,8px 0 0 #F2A65A;opacity:.9}
/* 3 + 4. spline waves and a pixel dither inside the big header cards */
.hero{isolation:isolate}
.hero>.pxw{position:absolute;left:0;right:0;bottom:0;width:100%;height:46px;pointer-events:none;z-index:-1;opacity:.6}
.hero>.pxd{position:absolute;right:0;bottom:0;width:112px;height:112px;pointer-events:none;z-index:-1;opacity:.3;mix-blend-mode:soft-light}
/* 5. pixel sprout in empty states */
.empty svg.pxs{width:40px;height:44px;flex:none;shape-rendering:crispEdges;filter:drop-shadow(0 0 6px rgb(240 109 68 / .25))}
/* 6. pixel sparkle on the active dock tab */
#tabs button.on{position:relative}
#tabs button.on::after{content:"";position:absolute;top:8px;right:12px;width:3px;height:3px;background:#FFE2B8;box-shadow:3px 3px 0 rgb(255 255 255 / .55),-3px 3px 0 rgb(255 255 255 / .3);animation:pxtw 2.6s steps(2) infinite;pointer-events:none}
@keyframes pxtw{0%,70%{opacity:1}85%{opacity:.25}100%{opacity:1}}
@media (prefers-reduced-motion:reduce){#tabs button.on::after{animation:none}}
</style>`);
const PX_SPROUT=(()=>{const C=IX_COL;let r='';IX_SPRITE.forEach((row,j)=>[...row].forEach((c,i)=>{if(C[c])r+=`<rect x="${i}" y="${j}" width="1" height="1" fill="${C[c]}"/>`}));
  return`<svg class="pxs" viewBox="0 0 ${IX_SPRITE[0].length} ${IX_SPRITE.length}" aria-hidden="true">${r}</svg>`})();
const PX_WAVE=(()=>{const L=(y,a,ph)=>{let d=`M0 ${y}`;for(let x=0;x<=300;x+=10)d+=` L${x} ${(y+a*Math.sin(x/300*Math.PI*2*1.4+ph)+a*.4*Math.sin(x/300*Math.PI*2*3.1-ph)).toFixed(1)}`;return d};
  return`<svg class="pxw" viewBox="0 0 300 46" preserveAspectRatio="none" aria-hidden="true"><path d="${L(26,9,0)}" fill="none" stroke="rgb(255 255 255 / .22)" stroke-width="1.2" vector-effect="non-scaling-stroke"/><path d="${L(31,7,1.9)}" fill="none" stroke="rgb(240 109 68 / .45)" stroke-width="1.2" vector-effect="non-scaling-stroke"/><path d="${L(36,6,3.6)}" fill="none" stroke="rgb(134 207 160 / .40)" stroke-width="1.2" vector-effect="non-scaling-stroke"/></svg>`})();
const PX_DITHER=(()=>{let r='';const N=14,h=(i,j)=>{let x=(i*73856093^j*19349663)>>>0;x=(x^(x>>>13))*1274126177>>>0;return(x%1000)/1000};
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){const d=Math.hypot(N-1-i,N-1-j)/(N*1.15);if(h(i,j)>d*1.05)r+=`<rect x="${i*8}" y="${j*8}" width="6" height="6" fill="${h(j,i)<.25?'#F2A65A':'#fff'}"/>`}
  return`<svg class="pxd" viewBox="0 0 112 112" aria-hidden="true" shape-rendering="crispEdges">${r}</svg>`})();
function pxDecorate(root){try{
  root.querySelectorAll('.hero').forEach(h=>{if(!h.querySelector(':scope>.pxw'))h.insertAdjacentHTML('afterbegin',PX_WAVE+PX_DITHER)});
  root.querySelectorAll('.empty svg.art').forEach(s=>s.outerHTML=PX_SPROUT);
}catch(e){}}
const _renderPx=render;render=function(a,f,d){_renderPx(a,f,d);pxDecorate(document.getElementById('view')||document)};

/* ===================== extra headline styles (free Google Fonts, loaded only when picked) ===================== */
const HEAD_FONTS={tech:'Tektur:wght@500;700',wide:'Michroma',pixel:'Pixelify+Sans:wght@500;700',groovy:'Shrikhand',flare:'Gloock'};
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="headx">
:root[data-head="tech"]{--serif:'Tektur','Geist',sans-serif}
:root[data-head="wide"]{--serif:'Michroma','Geist',sans-serif}
:root[data-head="pixel"]{--serif:'Pixelify Sans','Geist',sans-serif}
:root[data-head="groovy"]{--serif:'Shrikhand','Geist',serif}
:root[data-head="flare"]{--serif:'Gloock',Georgia,serif}
:root[data-head="tech"] :is(h1,h2,h3){font-weight:700;letter-spacing:.01em}
:root[data-head="wide"] :is(h1,h2,h3){font-weight:400;letter-spacing:-.05em}
:root[data-head="wide"] #hi,:root[data-head="wide"] .hero .big{letter-spacing:-.03em}
:root[data-head="pixel"] :is(h1,h2,h3){font-weight:600;letter-spacing:.02em}
:root[data-head="groovy"] :is(h1,h2,h3){font-weight:400;letter-spacing:0}
:root[data-head="groovy"] :is(h1,h2,h3) em,:root[data-head="tech"] :is(h1,h2,h3) em,:root[data-head="wide"] :is(h1,h2,h3) em,:root[data-head="pixel"] :is(h1,h2,h3) em{font-style:normal}
:root[data-head="flare"] :is(h1,h2,h3){font-weight:400;letter-spacing:-.005em}
.lookset .seg2:has([data-look="head"]){flex-wrap:wrap;row-gap:6px}
.lookset .seg2:has([data-look="head"]) button{flex:1 1 22%}
</style>`);
function headFont(){const k=document.documentElement.dataset.head,f=HEAD_FONTS[k];if(!f||document.getElementById('hf-'+k))return;
  const l=document.createElement('link');l.id='hf-'+k;l.rel='stylesheet';l.href=`https://fonts.googleapis.com/css2?family=${f}&display=swap`;
  l.onload=()=>{try{(document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{if(typeof fitHello==='function')fitHello()})}catch(e){}};document.head.appendChild(l)}
headFont();new MutationObserver(headFont).observe(document.documentElement,{attributes:true,attributeFilter:['data-head']});

/* ===================== type themes by area (Headlines → "By area", the default) =====================
   Today = Michroma (wide/futuristic) · Week = Pixelify Sans (pixel) · Work = Tektur (technical)
   Health = Gloock (editorial) · Ideas = Shrikhand (groovy). Page title, greeting, section titles and the
   big card's watermark word take the area's face; body text, numbers and panels stay as they are. */
HEAD_FONTS.areas='Michroma&family=Pixelify+Sans:wght@500;700&family=Tektur:wght@500;700&family=Gloock&family=Shrikhand';

(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="areacss">
:root[data-head="areas"][data-area="today"] :is(#top,#view){--serif:'Michroma','Geist',sans-serif;--areaf:'Michroma','Geist',sans-serif}
:root[data-head="areas"][data-area="plan"] :is(#top,#view){--serif:'Pixelify Sans','Geist',sans-serif;--areaf:'Pixelify Sans','Geist',sans-serif}
:root[data-head="areas"][data-area="work"] :is(#top,#view){--serif:'Tektur','Geist',sans-serif;--areaf:'Tektur','Geist',sans-serif}
:root[data-head="areas"][data-area="health"] :is(#top,#view){--serif:'Gloock',Georgia,serif;--areaf:'Gloock',Georgia,serif}
:root[data-head="areas"][data-area="mind"] :is(#top,#view){--serif:'Shrikhand','Geist',serif;--areaf:'Shrikhand','Geist',serif}
:root[data-head="areas"] :is(#top,#view) :is(h1,h2,h3) em{font-style:normal}
:root[data-head="areas"] .hart .hw{font-family:var(--areaf,var(--ui))}
/* per-face tuning so every area sits at the same visual size */
:root[data-head="areas"][data-area="today"] :is(#top,#view) :is(h1,h2){font-weight:400;letter-spacing:-.045em}
:root[data-head="areas"][data-area="today"] #view h2{font-size:17px}
:root[data-head="areas"][data-area="today"] .hello h1{font-size:clamp(17px,5vw,21px)}
:root[data-head="areas"][data-area="plan"] :is(#top,#view) :is(h1,h2){font-weight:600;letter-spacing:.01em}
:root[data-head="areas"][data-area="work"] :is(#top,#view) :is(h1,h2){font-weight:700;letter-spacing:.005em}
:root[data-head="areas"][data-area="work"] #view h2{font-size:21px}
:root[data-head="areas"][data-area="health"] :is(#top,#view) :is(h1,h2){font-weight:400}
:root[data-head="areas"][data-area="mind"] :is(#top,#view) :is(h1,h2){font-weight:400;letter-spacing:.005em}
:root[data-head="areas"][data-area="mind"] #view h2{font-size:21px}
:root[data-head="areas"][data-area="today"] .hart .hw{letter-spacing:-.06em;font-size:34px;font-weight:400}
:root[data-head="areas"][data-area="mind"] .hart .hw{font-weight:400;letter-spacing:0}
:root[data-head="areas"][data-area="health"] .hart .hw{font-weight:400}
:root[data-head="areas"][data-area="plan"] .hart .hw{font-weight:700}
</style>`);
const _renderArea=render;render=function(a,f,d){document.documentElement.dataset.area=state.tab;_renderArea(a,f,d)};
document.documentElement.dataset.area=state.tab;headFont();

/* ===================== sync: merge settings, habit ticks and other plain objects FIELD BY FIELD =====================
   Before: an object like settings or the habit log synced as one block, so the last device to touch ANY field
   replaced every field (a font choice or a habit tick could vanish). Now each field (two levels deep, e.g.
   hlog → day → habit) carries its own change time in db._fu, and the newer side wins per field.
   Older copies without _fu fall back to the block's time, so mixed app versions still merge sensibly. */
(function(){
  if(typeof mergeDocs!=='function'||typeof SYNC_SKIP==='undefined')return;
  SYNC_SKIP.add('_fu');
  const isPO=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
  const FU_SKIP=new Set(['entries','tomb','_ku','_fu','_loc']);
  const poKeys=d=>Object.keys(d||{}).filter(k=>!FU_SKIP.has(k)&&isPO(d[k]));
  const SEP='\u0001';
  const flat=o=>{const m={};for(const a of Object.keys(o||{})){const v=o[a];if(isPO(v)&&Object.keys(v).length){for(const b of Object.keys(v))m[a+SEP+b]=JSON.stringify(v[b])}else m[a]=JSON.stringify(v===undefined?null:v)}return m};
  const unflat=m=>{const o={};const ps=Object.keys(m).sort();
    for(const p of ps)if(p.indexOf(SEP)<0){try{o[p]=JSON.parse(m[p])}catch(e){}}
    for(const p of ps){const i=p.indexOf(SEP);if(i<0)continue;const a=p.slice(0,i),b=p.slice(i+1);if(!isPO(o[a]))o[a]={};try{o[a][b]=JSON.parse(m[p])}catch(e){}}
    return o};
  const sortDeep=v=>Array.isArray(v)?v.map(sortDeep):isPO(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sortDeep(v[k])])):v;
  const FLAT={};
  const _sb=syncBase;syncBase=function(){_sb();for(const k of Object.keys(FLAT))delete FLAT[k];for(const k of poKeys(db))FLAT[k]=flat(db[k])};
  const _st=stampSync;stampSync=function(){const had=!!SH.map;_st();if(!had)return;
    const now=Date.now();let ch=false;db._fu=db._fu||{};
    const keys=new Set([...poKeys(db),...Object.keys(FLAT)]);
    for(const k of keys){const cur=isPO(db[k])?flat(db[k]):{},old=FLAT[k]||{},fu=db._fu[k]||(db._fu[k]={});
      for(const p of new Set([...Object.keys(cur),...Object.keys(old)]))if(cur[p]!==old[p]){fu[p]=now;ch=true}
      FLAT[k]=cur}
    if(ch){SYNCST.dirty=true;SYNCST.gen++}};
  const _md=mergeDocs;mergeDocs=function(L,R){const out=_md(L,R);
    const lk=L._ku||{},rk=R._ku||{},lf=L._fu||{},rf=R._fu||{};out._fu={};
    for(const k of new Set([...Object.keys(lf),...Object.keys(rf)]))out._fu[k]={...(rf[k]||{})};
    for(const k of new Set([...poKeys(L),...poKeys(R)])){
      if((L[k]!=null&&!isPO(L[k]))||(R[k]!=null&&!isPO(R[k])))continue;
      const a=L[k]?flat(L[k]):{},b=R[k]?flat(R[k]):{},fa=lf[k]||{},fb=rf[k]||{},res={},fu={};
      for(const p of new Set([...Object.keys(a),...Object.keys(b),...Object.keys(fa),...Object.keys(fb)])){
        const ta=fa[p]!=null?fa[p]:(p in a?(lk[k]||0):0),tb=fb[p]!=null?fb[p]:(p in b?(rk[k]||0):0);
        const src=ta>=tb?a:b;if(p in src)res[p]=src[p];fu[p]=Math.max(ta,tb)}
      out[k]=unflat(res);out._fu[k]=fu}
    if(out.settings)out.settings=cleanSettings(out.settings);
    return out};
  /* compare copies by content, not by key order, so two devices never ping-pong uploads */
  const _cn=canon;canon=function(d){if(!d)return'';const o={...d};for(const k of [...poKeys(d),'_fu'])if(o[k])o[k]=sortDeep(o[k]);return _cn(o)};
})();

/* ===================== fixed type system (Oct 22): no font picker; every face has a job =====================
   Gloock (Flare)  → headlines: page titles, greeting, section titles, panel titles
   Tektur          → numbers and data labels (everything that used the mono face)
   Michroma        → small caps labels (dates, "KCAL LEFT", stat captions)
   Pixelify Sans   → the big faded word on each tab's main card
   Shrikhand       → Ideas only: its page title and card word (the creative corner)
   Geist stays the body font; Doto stays on the big dial number. */
HEAD_FONTS.type='Gloock&family=Tektur:wght@400;500;600;700;800&family=Michroma&family=Pixelify+Sans:wght@500;700&family=Shrikhand';
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="typecss">
:root[data-head="type"]{--serif:'Gloock',Georgia,serif;--mono:'Tektur','Space Mono',ui-monospace,monospace}
:root[data-head="type"] :is(h1,h2,h3){font-weight:400;letter-spacing:-.005em}
:root[data-head="type"] :is(h1,h2,h3,#hi) em{font-style:italic;color:var(--accent)}
:root[data-head="type"] .cap{font-family:'Michroma','Geist',sans-serif;font-size:9.5px;letter-spacing:.06em;font-weight:400}
:root[data-head="type"] .hart .hw{font-family:'Pixelify Sans','Geist',sans-serif;font-weight:700;letter-spacing:0}
:root[data-head="type"][data-area="mind"] #top h1,:root[data-head="type"][data-area="mind"] .hart .hw{font-family:'Shrikhand','Geist',serif;font-weight:400}
:root[data-head="type"] :is(.ts-grid b,.ts-leg .tv b,.num,b.num){font-variant-numeric:tabular-nums}
/* more weight where the eye needs it */
:root[data-head="type"] :is(.ts-leg .tl,.ts-grid small,.chip,.pill,.habit,.habit b,.habit span,.link,.trow b,.fld>span,.seg2 button,.folder b,.ts-pill,.ts-pill b,.qbar input,.tab span,#tabs button){font-weight:700}
:root[data-head="type"] .ts-leg .tv small{font-weight:600}
</style>`);
(function(){const _al=applyLook;applyLook=function(){const g=db.settings;g.head='type';g.corners='round';g.icons='color';g.intro='orbit';_al();headFont()}})();
document.documentElement.dataset.head='type';headFont();
/* "Plan this day": each task card has a fixed width; the title wraps to two lines, then ends in … — never spills out */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="tchipfix">
.tray-l .tchip{flex:none;width:clamp(140px,42vw,210px);max-width:none!important;min-width:0;white-space:normal;overflow:hidden;box-sizing:border-box}
.tray-l .tchip .tt{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;width:100%;line-height:1.25;word-break:break-word}
.tray-l .tchip small{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
</style>`);
/* Week: the full "Due this week" list (tasks, reminders and Canvas/calendar due items) now lives here */
const _vpDue=viewPlan;viewPlan=function(){let h=_vpDue();
  const due=[...db.entries.filter(e=>(e.type==='task'||e.type==='reminder')&&!e.done&&e.due&&dayDiff(e.due)<=7),...(typeof extDue==='function'?extDue(0,7):[])].sort(byDue);
  const openN=due.filter(e=>!(e.done||(e.type==='ext'&&typeof isExtDone==='function'&&isExtDone(e)))).length;
  const sec=section('Due <em>this week</em>',list(due,'Nothing due in the next 7 days.'),`<span class="cap">${openN} open</span>`);
  const i=h.indexOf('<section class="sec"><div class="sec-h"><h2>All <em>classes');return i>=0?h.slice(0,i)+sec+h.slice(i):h+sec};

/* ===================== motion pass (Oct 22): natural, never-instant feedback; Apple-style ease-out curves =====================
   --ease-out: the iOS sheet curve; --spring: a soft overshoot for things that land. Presses dip in ~0.12 s and spring back
   ~0.4 s; colour/state changes cross-fade instead of flipping. Reduce Motion turns all of it off. */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="motioncss">
:root{--ease-out:cubic-bezier(.32,.72,0,1);--spring:cubic-bezier(.34,1.36,.64,1)}
:where(button,.chip,.pill,.tile,.ts-tile,.card-s,.row,.folder,.habit,.tchip,.ib,.sw,.seg2 button,.link,.ts-grid>button,.ts-leg>button){
  transition:transform .42s var(--spring),background-color .28s var(--ease-out),color .28s var(--ease-out),border-color .28s var(--ease-out),box-shadow .32s var(--ease-out),opacity .28s var(--ease-out)}
:where(button,.chip,.pill,.tile,.ts-tile,.folder,.habit,.tchip,.ib,.sw,.seg2 button,.ts-grid>button):active{transform:scale(.955);transition-duration:.14s,.14s,.14s,.14s,.14s,.14s;transition-timing-function:var(--ease-out)}
:where(.card-s,.row,.ts-leg>button):active{transform:scale(.985);transition-duration:.14s;transition-timing-function:var(--ease-out)}
.tabs .ind{transition:background-color .3s var(--ease-out),-webkit-backdrop-filter .3s var(--ease-out),backdrop-filter .3s var(--ease-out),box-shadow .3s var(--ease-out)}
.tabs .ind::before,.tabs .ind::after{transition:opacity .3s var(--ease-out)}
#tabs button svg,#tabs button span{transition:color .3s var(--ease-out),transform .42s var(--spring),opacity .3s var(--ease-out)}
.sheet{transition-timing-function:var(--ease-out)!important}
input,textarea,select{transition:border-color .25s var(--ease-out),box-shadow .25s var(--ease-out),background-color .25s var(--ease-out)}
/* big cards: the old flat drawing never shows once the 3D art is used (it used to flash over the text), and the 3D art settles in */
.hero[data-ph] .hero-art,.hero.hasph .hero-art{display:none!important}
.hart .h3d{animation:h3settle .7s var(--ease-out) both}
.hart .hw{animation:hwIn .6s var(--ease-out) both}
@keyframes h3settle{from{opacity:0;transform:perspective(520px) rotateX(55deg) rotateZ(-40deg) translateZ(-24px) scale(.9)}to{opacity:1;transform:perspective(520px) rotateX(55deg) rotateZ(-40deg)}}
@keyframes hwIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){:where(button,.chip,.pill,.tile,.card-s,.row,.folder,.habit,.tchip,.ib,.sw){transition:none!important}.hart .h3d,.hart .hw{animation:none!important}}
html[data-motion="off"] .hart .h3d,html[data-motion="off"] .hart .hw{animation:none!important}
</style>`);

/* ===================== big-card art in real 3D (Oct 22) =====================
   Each card's own drawing (or its icon when it has none) becomes a solid 3D object: 7 copies stacked in depth,
   darker toward the back, tilted in perspective, with a soft floor shadow. Replaces the stacked glass panels.
   Built in the same frame as the card, so nothing flashes; it settles in once with an ease-out. */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="a3dcss">
.hart .h3d{display:none!important}
.hero .a3d{position:absolute;right:12px;top:56px;width:124px;height:98px;z-index:0;pointer-events:none;perspective:620px;animation:a3in .7s var(--ease-out,cubic-bezier(.32,.72,0,1)) both}
.hero .a3d .a3w{position:absolute;inset:0;transform-style:preserve-3d;transform:rotateX(18deg) rotateY(-28deg) rotateZ(3deg)}
.hero .a3d svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;color:color-mix(in srgb,var(--hc,#F06D44) var(--lt,100%),#000)}
.hero .a3d svg.f{color:color-mix(in srgb,var(--hc,#F06D44) 70%,#fff);filter:drop-shadow(0 0 6px color-mix(in srgb,var(--hc,#F06D44) 60%,transparent))}
.hero .a3d svg.ic{inset:12% 18%;width:64%;height:76%}
.hero .a3d svg.ic *{stroke-width:2.1}
.hero .a3d .ash{position:absolute;left:14%;right:8%;bottom:-16px;height:18px;border-radius:50%;background:radial-gradient(closest-side,rgb(0 0 0 / .4),transparent);transform:rotateZ(3deg)}
@keyframes a3in{from{opacity:0;transform:translateY(8px) scale(.94)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.hero .a3d{animation:none}}
html[data-motion="off"] .hero .a3d{animation:none}
</style>`);
const A3D_SEEN={};
function art3d(t){
  let inner='',vb='0 0 200 156',cls='';
  if(typeof ARTS!=='undefined'&&ARTS[t])inner=ARTS[t];
  else{const ico=typeof HICON!=='undefined'&&HICON[t]?ic(HICON[t]):'';const m=ico.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*)<\/svg>/);if(!m)return'';vb=m[1];inner=m[2];cls=' ic'}
  const N=7;let L='';
  for(let k=N-1;k>=1;k--)L+=`<svg class="${cls.trim()}" viewBox="${vb}" style="transform:translateZ(${(-k*2.4).toFixed(1)}px);--lt:${Math.round(78-k*7)}%" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  L+=`<svg class="f${cls}" viewBox="${vb}" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  return`<div class="a3d" aria-hidden="true"><div class="ash"></div><div class="a3w">${L}</div></div>`;
}
(function(){const _hp=hydratePhotos;hydratePhotos=function(){_hp();
  for(const h of $$('#view .hero[data-ph].hasph')){h.querySelectorAll('.h3d').forEach(x=>x.remove());if(h.querySelector(':scope>.a3d'))continue;const t=h.dataset.ph;if(!HWORD[t])continue;
    h.querySelectorAll(':scope>.hero-art,.h3d').forEach(x=>x.remove());const a=art3d(t);if(a){h.insertAdjacentHTML('afterbegin',a);const k=state.tab+':'+t,now=Date.now();if(now-(A3D_SEEN[k]||0)<4000)h.querySelector(':scope>.a3d').style.animation='none';A3D_SEEN[k]=now}}}})();

/* ===================== every pop-up grows out of the button that opened it, and goes back into it =====================
   Panels: scale up from the tapped button (or the last touch point) with the iOS ease-out curve; closing — by X, tapping
   outside or swiping down — shrinks back into that same point. Menus already drop from their button. */
let POPPT=null;
document.addEventListener('pointerdown',e=>{if(!e.target.closest||e.target.closest('.sheet'))return;POPPT=[e.clientX,e.clientY]},true);
(function(){
  const sh=()=>$('.sheet'),EO='cubic-bezier(.32,.72,0,1)';
  const originPt=()=>{const b=typeof lastTrigger!=='undefined'&&lastTrigger&&lastTrigger.isConnected?lastTrigger.getBoundingClientRect():null;
    if(b&&b.width)return[b.left+b.width/2,b.top+b.height/2];return POPPT||[innerWidth/2,innerHeight-40]};
  const layoutRect=s=>{try{s.getAnimations().forEach(x=>x.cancel())}catch(e){}const t=s.style.transform,tr=s.style.transition;s.style.transition='none';s.style.transform='none';const r=s.getBoundingClientRect();s.style.transform=t;s.style.transition=tr;return{left:r.left,top:r.top,width:r.width,height:r.height}};
  /* express the grow point from the edge the panel is attached to, so it stays on the button if the panel's height changes */
  const orgCss=(s,pt,L)=>{const x=(pt[0]-L.left).toFixed(1);
    if(s.classList.contains('m-bottom')&&!s.classList.contains('tall'))return`${x}px calc(100% - ${(L.top+L.height-pt[1]).toFixed(1)}px)`;
    if(s.classList.contains('m-zoom'))return`${x}px calc(50% + ${(pt[1]-(L.top+L.height/2)).toFixed(1)}px)`;
    return`${x}px ${(pt[1]-L.top).toFixed(1)}px`};
  const _open=openSheet;openSheet=function(h){
    const wasOpen=!wrap.hidden&&wrap.classList.contains('open');const r=_open.apply(this,arguments);
    const s=sh();if(wasOpen||!s||noMotion())return r;
    const pt=originPt();s._org=pt;const L=layoutRect(s);
    s.style.transformOrigin=orgCss(s,pt,L);s.style.transition='none';
    try{s.getAnimations().forEach(a=>a.cancel());const a=s.animate([{transform:'scale(.1)',opacity:0},{transform:'scale(1)',opacity:1}],{duration:460,easing:EO});a.onfinish=()=>{s.style.transition=''}}catch(e){s.style.transition=''}
    return r};
  const _close=closeSheet;closeSheet=function(){
    const s=sh();if(!s||wrap.hidden||noMotion())return _close.apply(this,arguments);
    const cur=s.style.transform&&s.style.transform!=='none'?s.style.transform:'translate(0,0)';
    const pt=s._org||originPt(),L=layoutRect(s);
    s.style.transformOrigin=orgCss(s,pt,L);
    const r=_close.apply(this,arguments);
    try{s.getAnimations().forEach(a=>a.cancel());s.animate([{transform:cur,opacity:1},{transform:'translate(0,0) scale(.1)',opacity:0}],{duration:300,easing:'cubic-bezier(.4,0,.6,1)',fill:'forwards'})}catch(e){}
    return r};
})();
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="popcss">
.menu{transform-origin:50% 0;transition:opacity .26s cubic-bezier(.32,.72,0,1),transform .34s cubic-bezier(.32,.72,0,1)!important}
.menu.hide{transform:scale(.3) translateY(-10px)!important}
.menu.up.hide{transform:scale(.3) translateY(10px)!important}
</style>`);


/* ===================== Oct 22 fixes =====================
   1. "Stop speaking" really hides when JARVIS is quiet (its display style was overriding [hidden]).
   2. Card watermark word: room for descenders (the g in "Grades" was clipped into a b).
   3. Today: the quick-add bar is gone.
   4. Ideas tabs in your order: Ideas, Reminders, Notes, Trips, Cards, Scrap. */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="fix22">
.jvh-hush[hidden]{display:none!important}
.hart .hw{line-height:1.22!important;padding-bottom:.1em;top:6px!important;overflow:visible!important}
</style>`);
for(let i=TODAY_SECS.length-1;i>=0;i--)if(TODAY_SECS[i][0]==='quick')TODAY_SECS.splice(i,1);
{const _vtQ=viewToday;viewToday=function(){return _vtQ().replace(/<form class="qbar"[\s\S]*?<\/form>/,'')}}
{const ORD=['idea','reminder','note','trip','cards','scrap'];TABS.mind.subs.sort((a,b)=>{const x=ORD.indexOf(a[0]),y=ORD.indexOf(b[0]);return(x<0?99:x)-(y<0?99:y)})}

/* 5. pop-ups grow from the button you actually touched: the element under your finger at touch-down wins over
      the last "trigger" the app remembered (that one could be stale and send the animation to the wrong place). */
let POPEL=null,POPAT=0;
document.addEventListener('pointerdown',e=>{if(!e.target.closest||e.target.closest('.sheet'))return;POPEL=e.target.closest('button,a,[role=button],.chip,.tile,.row,.card-s,.habit,.folder,.ib,.fab,[data-add],[data-open]');POPAT=Date.now()},true);
{const _o=openSheet;openSheet=function(){const keep=typeof lastTrigger!=='undefined'?lastTrigger:null;
  if(POPEL&&POPEL.isConnected&&Date.now()-POPAT<2500){try{lastTrigger=POPEL}catch(e){}}
  return _o.apply(this,arguments)}}

/* 6. Leave-for-class alerts. The server watches live NMG times every minute and pings you: start getting ready
      (bus − 45), finish packing (bus − 15), leave now (bus − walk − 1). Works with the phone locked and the laptop off.
      Only class START TIMES go to the server (no names). Settings: db.settings.leave = {on, walk, ride, buffer}. */
function leavePlan(){
  const g=db.settings.leave||{},b=(typeof busCfg==='function'?busCfg():[])[0]||{route:'NMG',stop:'1411',name:'Red Maple'};
  const classes=[];for(let i=0;i<7;i++){const d=addDays(i);of('class').filter(e=>(e.days||[]).includes(wdOf(d))&&e.start).forEach(e=>{const t=+atLocal(d,e.start);if(t>Date.now())classes.push(t)})}
  return{on:g.on!==false,route:b.route,stop:b.stop,stopName:b.name||'',walk:g.walk||7,ride:g.ride||12,buffer:g.buffer??3,tz:Intl.DateTimeFormat().resolvedOptions().timeZone,classes:[...new Set(classes)].sort((a,b)=>a-b)}}
let LEAVE_T=0;
async function leaveSync(force){try{if(typeof syncOn!=='function'||!syncOn())return;const p=leavePlan(),k=JSON.stringify(p);
  if(!force&&lsGet('ishiros.leave')===k&&Date.now()-(+lsGet('ishiros.leaveAt')||0)<6*36e5)return;
  await api('/leave',{method:'PUT',body:k});lsSet('ishiros.leave',k);lsSet('ishiros.leaveAt',String(Date.now()))}catch(e){}}
afterSplash(()=>setTimeout(()=>leaveSync(),4000));
document.addEventListener('visibilitychange',()=>{if(!document.hidden){clearTimeout(LEAVE_T);LEAVE_T=setTimeout(()=>leaveSync(),3000)}});
{const _as=afterSave;afterSave=function(){_as.apply(this,arguments);clearTimeout(LEAVE_T);LEAVE_T=setTimeout(()=>leaveSync(),5000)}}

(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="ixrun">html.ix-run .dock,html.ix-run nav.tabs{visibility:hidden!important}</style>`);
/* while the intro plays, background updates (sync, bus, calendar) don't rebuild Home under it; one render happens right after */
{const _rI=render;render=function(a,f,d){if(window.__ixLive&&!a&&!f){window.__ixPend=true;return}return _rI.apply(this,arguments)}}

/* full-screen overlays (JARVIS, focus timer, card study, notebooks) grow from the button you touched and shrink back into it */
{const POPIDS=new Set(['jvHud','fcView','crWrap','nbView']),EO='cubic-bezier(.32,.72,0,1)';
  const pt=()=>{if(POPEL&&POPEL.isConnected&&Date.now()-POPAT<2500){const r=POPEL.getBoundingClientRect();if(r.width)return[r.left+r.width/2,r.top+r.height/2]}return POPPT||[innerWidth/2,innerHeight-40]};
  const popIn=el=>{if(noMotion())return;const p=pt();el._org=p;el.style.transformOrigin=`${p[0]}px ${p[1]}px`;
    try{el.getAnimations().forEach(a=>a.cancel());el.animate([{transform:'scale(.06)',opacity:0,borderRadius:'44px'},{transform:'none',opacity:1,borderRadius:'0px'}],{duration:480,easing:EO})}catch(e){}};
  const popOut=el=>{if(noMotion())return;const p=el._org||pt();el.style.transformOrigin=`${p[0]}px ${p[1]}px`;
    try{el.getAnimations().forEach(a=>a.cancel());const a=el.animate([{transform:'none',opacity:1},{transform:'scale(.06)',opacity:0,borderRadius:'44px'}],{duration:300,easing:'cubic-bezier(.4,0,.6,1)',fill:'forwards'});
      setTimeout(()=>{if(!el.classList.contains('on'))a.cancel()},700)}catch(e){}};
  new MutationObserver(ms=>{for(const m of ms){const el=m.target;if(!POPIDS.has(el.id))continue;const on=el.classList.contains('on'),was=(m.oldValue||'').split(/\s+/).includes('on');
    if(on&&!was)popIn(el);else if(!on&&was)popOut(el)}}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class'],attributeOldValue:true});}

/* ===================== Oct 22 (evening) =====================
   a. "Stop speaking" follows what is REALLY playing: our own utterance start/end (iOS can leave speechSynthesis.speaking stuck on). */
try{if(typeof speechSynthesis!=='undefined'){const _sp=speechSynthesis.speak.bind(speechSynthesis),_cn=speechSynthesis.cancel.bind(speechSynthesis);
  speechSynthesis.speak=u=>{const n=String(u&&u.text||'').length;JH.ttsUntil=Date.now()+Math.min(60000,1800+n*85);const end=()=>{JH.ttsUntil=0;try{jvHudState()}catch(e){}};try{u.addEventListener('end',end);u.addEventListener('error',end)}catch(e){}return _sp(u)};
  speechSynthesis.cancel=()=>{JH.ttsUntil=0;return _cn()}}}catch(e){}
const jvTalking=()=>(!JA.paused&&!JA.ended&&JA.currentTime>0)||Date.now()<(JH.ttsUntil||0);

JA.addEventListener('ended',()=>{JH.playing=false});JA.addEventListener('pause',()=>{JH.playing=false});

/* b. card watermark word: Pixelify at a lighter weight with a little tracking, so C and G keep their openings (bold closed them into O and B) */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="hwfix">
:root[data-head="type"] .hart .hw{font-weight:500!important;letter-spacing:.045em!important}
/* c. weekly nutrition: premium meter look */
.fdw-grid{gap:9px 5px!important}
.fdw-c{height:58px!important;border-radius:12px!important;margin:0 1px!important;background:linear-gradient(180deg,rgb(255 255 255 / .06),rgb(255 255 255 / .015))!important;box-shadow:inset 0 0 0 1px rgb(255 255 255 / .07),inset 0 1px 0 rgb(255 255 255 / .08)}
:root[data-theme="light"] .fdw-c{background:linear-gradient(180deg,rgb(0 0 0 / .05),rgb(0 0 0 / .02))!important;box-shadow:inset 0 0 0 1px rgb(0 0 0 / .06)}
.fdw-c i{opacity:1!important;background:linear-gradient(180deg,color-mix(in srgb,var(--k) 55%,#fff) 0%,var(--k) 38%,color-mix(in srgb,var(--k) 72%,#000) 100%)!important;
  box-shadow:0 0 16px color-mix(in srgb,var(--k) 55%,transparent);border-radius:9px 9px 3px 3px;
  -webkit-mask:repeating-linear-gradient(0deg,#000 0 4px,transparent 4px 5.5px);mask:repeating-linear-gradient(0deg,#000 0 4px,transparent 4px 5.5px);
  transform-origin:50% 100%;animation:fdwGrow .8s var(--ease-out,cubic-bezier(.32,.72,0,1)) both}
details.fd-wk[open] .fdw-c:nth-child(9n+3) i{animation-delay:.03s}details.fd-wk[open] .fdw-c:nth-child(9n+4) i{animation-delay:.06s}details.fd-wk[open] .fdw-c:nth-child(9n+5) i{animation-delay:.09s}
details.fd-wk[open] .fdw-c:nth-child(9n+6) i{animation-delay:.12s}details.fd-wk[open] .fdw-c:nth-child(9n+7) i{animation-delay:.15s}details.fd-wk[open] .fdw-c:nth-child(9n+8) i{animation-delay:.18s}
@keyframes fdwGrow{from{transform:scaleY(0)}to{transform:none}}
.fdw-c.zero::after{top:auto!important;bottom:7px;width:4px!important;height:4px!important;margin-left:-2px!important;border-radius:50%!important;background:currentColor;opacity:.22}
.fdw-rl{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font:800 11px var(--ui)!important;background:color-mix(in srgb,currentColor 16%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,currentColor 35%,transparent)}
.fdw-d{font:700 11px var(--ui)!important;letter-spacing:.04em;padding:4px 0 2px!important;border-radius:8px}
.fdw-d.on{color:#fff!important;background:var(--accent);box-shadow:0 4px 14px color-mix(in srgb,var(--accent) 45%,transparent)}
.fdw-hl{border:1.5px solid color-mix(in srgb,var(--accent) 80%,#fff)!important;border-radius:14px!important;box-shadow:0 0 18px color-mix(in srgb,var(--accent) 35%,transparent)}
.fdw-tot{font:700 15px var(--mono)!important}
@media (prefers-reduced-motion:reduce){.fdw-c i{animation:none}}
</style>`);

/* d. 3D card art never covers text: it fits into the free space between the card's word and its first line of text on that side, or hides */
function fitArt(root){for(const h of (root||document).querySelectorAll('#view .hero')){const a=h.querySelector(':scope>.a3d');if(!a)continue;
  a.style.display='';a.style.top='';a.style.scale='';const ar=a.getBoundingClientRect(),hr=h.getBoundingClientRect();if(!ar.width)continue;
  const w=h.querySelector('.hart .hw'),wr=w&&w.getBoundingClientRect();let start=(wr&&wr.height?wr.bottom:hr.top+40)+4;
  /* every word on the art's side of the card is an obstacle; take the first gap tall enough (min 40 px), shrinking the art to fit */
  const obs=[];const tw=document.createTreeWalker(h,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.nodeValue.trim()&&!n.parentElement.closest('.a3d,.hart,.pxw,.pxd')?1:3});
  for(let n;(n=tw.nextNode());){const rg=document.createRange();rg.selectNodeContents(n);for(const r of rg.getClientRects())if(r.width&&r.right>ar.left+4&&r.left<ar.right-4)obs.push([r.top-6,r.bottom+4])}
  /* buttons, pills and the action row count as their whole shape, not just their label */
  h.querySelectorAll('button,.pill,a,.chip,.hero-actions,input,.seg2').forEach(el=>{if(el.closest('.a3d,.hart'))return;const r=el.getBoundingClientRect();if(r.width&&r.height&&r.right>ar.left+4&&r.left<ar.right-4)obs.push([r.top-8,r.bottom+4])});
  obs.push([hr.bottom-12,hr.bottom]);obs.sort((x,y)=>x[0]-y[0]);
  let room=0;for(const[t,bt]of obs){if(bt<=start)continue;if(t-start>=40){room=t-start;break}start=Math.max(start,bt)}
  room-=8;if(room<40){a.style.display='none';continue}
  const sc=Math.min(1,room/(ar.height/(parseFloat(getComputedStyle(a).scale)||1)));a.style.top=(start-hr.top)+'px';a.style.transformOrigin='100% 0';a.style.scale=sc<1?sc.toFixed(3):''}}
{const _rF=render;render=function(){const r=_rF.apply(this,arguments);try{requestAnimationFrame(()=>fitArt());setTimeout(fitArt,750);setTimeout(fitArt,1800)}catch(e){}return r}}
try{document.fonts&&document.fonts.ready.then(()=>fitArt())}catch(e){}
addEventListener('resize',()=>setTimeout(fitArt,150));

/* ===================== Oct 22 (night) =====================
   a. JARVIS: iOS can leave speechSynthesis.speaking stuck on. Every check in the app (status text, Stop-speaking button)
      now reads the truth: our own utterance window, and whether the reply audio is actually playing. */
try{if(typeof speechSynthesis!=='undefined')Object.defineProperty(speechSynthesis,'speaking',{configurable:true,get:()=>Date.now()<(JH.ttsUntil||0)})}catch(e){}
try{Object.defineProperty(JH,'playing',{configurable:true,get:()=>!JA.paused&&!JA.ended&&JA.currentTime>0,set(v){}})}catch(e){}

/* b. the 3D art on every big card floats, slowly and continuously (compositor-only, so it costs almost nothing) */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="floatcss">
.hero .a3d .a3w{animation:a3float 6.5s ease-in-out infinite alternate}
.hero .a3d .ash{animation:a3shadow 6.5s ease-in-out infinite alternate}
@keyframes a3float{from{transform:rotateX(18deg) rotateY(-31deg) rotateZ(3deg) translate3d(0,3px,0)}to{transform:rotateX(14deg) rotateY(-23deg) rotateZ(2deg) translate3d(0,-5px,0)}}
@keyframes a3shadow{from{opacity:1;transform:rotateZ(3deg) scaleX(1)}to{opacity:.7;transform:rotateZ(3deg) scaleX(.86)}}
@media (prefers-reduced-motion:reduce){.hero .a3d .a3w,.hero .a3d .ash{animation:none}}
html[data-motion="off"] .hero .a3d .a3w,html[data-motion="off"] .hero .a3d .ash{animation:none}
/* c. no colour fades while the app comes back from the background (they showed as white flashes) */
html.resuming *,html.resuming *::before,html.resuming *::after{transition:none!important}
/* d. reminders by importance */
.row.imp{box-shadow:inset 3px 0 0 var(--imp)}
.row.imp .imp-chip{display:inline-flex;align-items:center;gap:5px;margin-left:8px;padding:2px 8px;border-radius:999px;font:700 10.5px var(--ui);letter-spacing:.02em;color:var(--imp);background:color-mix(in srgb,var(--imp) 16%,transparent);vertical-align:middle}
.row.imp .imp-chip::before{content:"";width:6px;height:6px;border-radius:2px;background:var(--imp)}
</style>`);
document.addEventListener('visibilitychange',()=>{const r=document.documentElement;if(document.hidden)r.classList.add('resuming');else setTimeout(()=>r.classList.remove('resuming'),600)});
addEventListener('pagehide',()=>document.documentElement.classList.add('resuming'));
addEventListener('pageshow',()=>setTimeout(()=>document.documentElement.classList.remove('resuming'),600));
const IMP={Urgent:'#F0533F',High:'#F2A65A',Normal:'#86CFA0',Low:'#7FB8E0'};
{const _rowI=row;row=function(e){let h=_rowI(e);if(e&&e.type==='reminder'){const k=IMP[e.importance]?e.importance:'Normal',c=IMP[k];
  h=h.replace(/<li([^>]*?) class="row/,`<li$1 style="--imp:${c}" class="row imp`);if(k!=='Normal')h=h.replace(/(<span class="rt">[\s\S]*?<\/span>)/,`$1<span class="imp-chip">${k}</span>`)}return h}}
/* Home: Urgent and High reminders first, then by date */
{const RANK={Urgent:0,High:1,Normal:2,Low:3};homeReminders=function(){
  const all=of('reminder').filter(e=>!e.done),rs=all.sort((a,b)=>((RANK[a.importance]??2)-(RANK[b.importance]??2))||((a.due||'9999')+(a.time||'')).localeCompare((b.due||'9999')+(b.time||''))).slice(0,6);
  return section('Your <em>reminders</em>',list(rs,'No reminders. Add one with the + button.'),`<button class="link" data-goto="mind:reminder">${all.length>6?'All '+all.length:'All'}</button>`)}}

/* Oct 23: tab labels get breathing room from their icons; the pixel sparkle on the active dock tab is gone;
   a server that can't be reached says so clearly instead of "Looking…" for 50 s */
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="oct23">
.fl-tabs button{gap:7px!important;height:62px!important}
#tabs button.on::after,.tabs button.on::after,nav.tabs button.on::after{content:none!important;display:none!important;animation:none!important}
</style>`);
{const _api=api;api=async function(path,o){try{return await _api.apply(this,arguments)}catch(e){
  if(/Load failed|Failed to fetch|NetworkError|access control/i.test(String(e&&e.message||e)))throw new Error(navigator.onLine?'Your Life server isn’t answering right now (it may have hit its free daily limit; it resets at 8 pm). Try again later.':'You’re offline.');
  throw e}}}

/* ===================== Oct 23 (b): live meeting status, inline projects, smart jobs, grades layout ===================== */
/* ---- meetings know if they're upcoming, happening now or over (default length 1 h; set "Ends" for exact) ---- */
if(!TYPES.meeting.f.some(f=>f[0]==='end')){const i=TYPES.meeting.f.findIndex(f=>f[0]==='time');TYPES.meeting.f.splice(i+1,0,['end','Ends (optional)','time'])}
const hmMin=t=>{const m=/^(\d{1,2}):(\d{2})/.exec(t||'');return m?+m[1]*60+ +m[2]:null};
const nowMin=()=>{const d=new Date();return d.getHours()*60+d.getMinutes()};
/* status of the occurrence that matters right now: {st:'live'|'soon'|'up'|'done'|'past', d:date, s:start min, en:end min} */
function meetInfo(e){
  const td=today(),rep=e.repeat&&e.repeat!=='Never'&&e.repeat!=='none';let d=nextOcc(e,td);if(!d&&!e.date)return{st:'up',d:''};if(!d)return{st:'past',d:e.date};
  const s=hmMin(e.time),en0=hmMin(e.end),en=s==null?null:(en0!=null&&en0>s?en0:s+60),n=nowMin();
  if(d<td)return{st:'past',d,s,en};
  if(d>td)return{st:'up',d,s,en};
  if(s==null)return{st:'up',d,s,en,allDay:true};
  if(n<s)return{st:s-n<=60?'soon':'up',d,s,en,mins:s-n};
  if(n<en)return{st:'live',d,s,en,left:en-n};
  if(rep){const d2=nextOcc(e,shiftDays(td,1));return d2?{st:'up',d:d2,s,en,endedToday:true}:{st:'done',d,s,en}}
  return{st:'done',d,s,en};
}
const mm2t=m=>fmtT(`${pad(Math.floor(m/60)%24)}:${pad(m%60)}`);
function meetRow(e,I){
  let h=row(e);const sub=[I.s!=null?`${mm2t(I.s)}–${mm2t(I.en)}`:'',e.with].filter(Boolean).join(' · ');
  const pill=I.st==='live'?`<span class="mt-pill live"><i></i>Now · ${I.left} min left</span>`:I.st==='soon'?`<span class="mt-pill soon">in ${I.mins} min</span>`:I.st==='done'?`<span class="mt-pill done">Done</span>`:I.d?`<span class="meta plain">${esc(I.d===today()?(I.allDay?'Today':mm2t(I.s)):relDue(I.d))}</span>`:'';
  h=h.replace(/<span class="rs">[\s\S]*?<\/span><\/button>/,`<span class="rs">${esc(sub)}</span></button>`).replace(/<span class="meta[^"]*">[^<]*<\/span>(?=<\/li>)/,'');
  const j=h.lastIndexOf('</li>');h=h.slice(0,j)+pill+h.slice(j);
  return h.replace('<li class="row',`<li class="row mt-${I.st}${I.st==='done'||I.st==='past'?' done':''}`);
}
const mKey=x=>(x[1].d||'9999')+String(x[1].s==null?9999:x[1].s).padStart(4,'0');
function meetSections(){
  const all=of('meeting').map(e=>[e,meetInfo(e)]);
  const live=all.filter(x=>x[1].st==='live').sort((a,b)=>mKey(a).localeCompare(mKey(b)));
  const up=all.filter(x=>x[1].st==='up'||x[1].st==='soon').sort((a,b)=>mKey(a).localeCompare(mKey(b)));
  const done=all.filter(x=>x[1].st==='done').sort((a,b)=>mKey(b).localeCompare(mKey(a)));
  const past=all.filter(x=>x[1].st==='past').sort((a,b)=>mKey(b).localeCompare(mKey(a))).slice(0,10);
  const ul=a=>`<ul class="list card-s">${a.map(x=>meetRow(...x)).join('')}</ul>`;
  let h='';
  if(live.length)h+=section('Happening <em>now</em>',ul(live));
  h+=section('Upcoming',up.length?ul(up):emptyBox('No meetings coming up.'));
  if(done.length)h+=section('Earlier <em>today</em>',ul(done));
  if(past.length)h+=section('Past',ul(past));
  return h;
}
{const _vwMt=viewWork;viewWork=function(){let h=_vwMt();if(state.sub.work!=='meeting')return h;
  const re=/<section class="sec"><div class="sec-h"><h2>(?:Upcoming|Past)<\/h2>[\s\S]*?<\/section>/g,i=h.search(re);if(i<0)return h;
  return h.slice(0,i)+meetSections()+h.slice(i).replace(re,'')}}
{const _wh6=workHero;workHero=function(k){if(k!=='meeting')return _wh6(k);
  const a=of('meeting'),I=a.map(e=>[e,meetInfo(e)]),td=today();
  const live=I.filter(x=>x[1].st==='live'),next=I.filter(x=>x[1].st==='up'||x[1].st==='soon').sort((x,y)=>mKey(x).localeCompare(mKey(y)));
  const wk=next.filter(x=>x[1].d&&dayDiff(x[1].d)<=7).length+live.length,left=I.filter(x=>x[1].d===td&&x[1].st!=='done'&&!x[1].endedToday).length;
  const nx=next[0],when=nx&&(nx[1].d===td?(nx[1].allDay?'today':`today ${mm2t(nx[1].s)}`):`${dayDiff(nx[1].d)===1?'tomorrow':wdOf(nx[1].d)}${nx[1].s!=null?' '+mm2t(nx[1].s):''}`);
  const line=live.length?`now <b>${esc(live[0][0].title)}</b> · ${live[0][1].left} min left${nx?` · then ${esc(nx[0].title)}`:''}`:nx?`coming up · next <b>${esc(nx[0].title)}</b>, ${esc(when)}`:'nothing coming up';
  return heroBanner('Meetings',`${wk}`,line,[['Left today',left],['Next 7 days',wk],['Done today',I.filter(x=>x[1].st==='done'||x[1].endedToday).length]],'',heroAct('meeting','New meeting'))}}
/* repaint when a meeting starts or ends */
let MT_SIG='';setInterval(()=>{if(document.hidden||state.tab!=='work'||state.sub.work!=='meeting'||!wrap.hidden)return;
  const sig=of('meeting').map(e=>{const I=meetInfo(e);return I.st+(I.st==='live'?I.left:I.st==='soon'?I.mins:'')}).join();
  if(sig===MT_SIG)return;MT_SIG=sig;if(document.activeElement&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;const y=SC.scrollTop;render(false);SC.scrollTop=y},20000);

/* ---- projects: tap a card to open it in place (steps, tasks, add); the pencil edits the project's details ---- */
const PJ_OPEN=new Set();
function pjBody(p){
  const st=projStats(p),s=st.s,open=st.it.filter(x=>!x.done).sort(byDue),done=st.it.filter(x=>x.done).length;
  const chk=(on,attr,lbl)=>`<button class="chk${on?' on':''}" ${attr} aria-label="${lbl}"><i><svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7"/></svg></i></button>`;
  const steps=s.map(x=>{const late=x.due&&!x.done&&dayDiff(x.due)<0;return`<li class="${x.done?'done':''}">${chk(x.done,`data-pjs="${esc(p.id)}:${esc(x.id)}"`,x.done?'Mark not done':'Mark done')}<span class="st"><span>${esc(x.t)}</span>${x.due?`<small class="${late?'late':''}">${esc(dueTxt(x.due))}</small>`:''}</span><button class="pj-act del" data-pjsdel="${esc(p.id)}:${esc(x.id)}" aria-label="Delete step">${ic('close')}</button></li>`}).join('');
  const tasks=open.map(t=>{const late=t.due&&dayDiff(t.due)<0;return`<li>${chk(false,`data-pjt="${esc(t.id)}"`,'Mark done')}<button class="st pjx-open" data-open="${esc(t.id)}"><span>${esc(t.title||'Task')}</span>${t.due?`<small class="${late?'late':''}">${esc(dueTxt(t.due))}</small>`:''}</button></li>`}).join('');
  const add=(k,ph)=>`<div class="stepadd pjx-add"><input data-pjin="${k}" data-pid="${esc(p.id)}" placeholder="${ph}" enterkeyhint="done" autocomplete="off">${dchip(`pjd_${k}_${p.id}`,'',`${k==='step'?'Step':'Task'} due date (optional)`)}<button class="primary" data-pjadd="${k}" data-pid="${esc(p.id)}" aria-label="Add ${k}">${ic('plus')}</button></div>`;
  return`<div class="pjx-b">
    <div class="pj-h"><span class="cap">Next steps${s.length?` · ${s.filter(x=>x.done).length}/${s.length}`:''}</span></div>
    ${steps?`<ul class="psteps">${steps}</ul>`:''}${add('step','Add a step')}
    <div class="pj-h"><span class="cap">Open tasks · ${open.length}${done?` <span style="opacity:.6">· ${done} done</span>`:''}</span></div>
    ${tasks?`<ul class="psteps">${tasks}</ul>`:''}${add('task','Add a task')}
    ${p.notes?`<div class="cap" style="margin:6px 0 4px">Notes</div><div class="notes">${esc(p.notes)}</div>`:''}</div>`;
}
projCards=function(a){
  return`<div class="pjgrid">${a.map(p=>{const st=projStats(p),nx=st.s.find(x=>!x.done),o=PJ_OPEN.has(p.id);
    const sub=(nx?`Next: ${nx.t}`:p.next?`Next: ${p.next}`:'')||(st.tot?'All done':'No steps or tasks yet');
    return`<div class="card-s pjcard pjx${o?' open':''}" data-pjcard="${esc(p.id)}"><div class="pjx-h"><button class="pjx-tog" data-pjx="${esc(p.id)}" aria-expanded="${o}"><span class="pj-top">${tileE(p)}<span class="pj-t"><b>${esc(p.title||'Project')}</b><small>${esc(sub)}</small></span>${ic('chev','i chev')}</span></button><button class="pjx-edit" data-edit="${esc(p.id)}" aria-label="Edit ${esc(p.title||'project')}">${ic('edit')}</button></div>
      <span class="pjbar"><i style="width:${Math.round(st.pct*100)}%"></i></span>
      <span class="pj-meta"><span>${st.s.length?`${st.s.filter(x=>x.done).length}/${st.s.length} steps`:'No steps'}</span><span>${st.it.length?`${st.open} open · ${st.it.length-st.open} done`:'No tasks'}</span></span>${o?pjBody(p):''}</div>`}).join('')}</div>`;
};
function pjRerender(focusSel){const y=SC.scrollTop;render(false);SC.scrollTop=y;if(focusSel){const i=document.querySelector(focusSel);i&&i.focus({preventScroll:true})}}
function pjxAdd(k,pid){const p=find(pid),inp=document.querySelector(`[data-pjin="${k}"][data-pid="${CSS.escape(pid)}"]`),t=(inp&&inp.value||'').trim();if(!p)return;if(!t){inp&&inp.focus();return}
  const due=(document.getElementById(`pjd_${k}_${pid}`)||{}).value||'';
  if(k==='step'){p.steps=p.steps||[];p.steps.push({id:uid(),t,due,done:false})}else db.entries.push({id:uid(),type:'task',title:t,project:p.id,due,priority:'Normal',created:Date.now()});
  delete p.sample;save();pjRerender(`[data-pjin="${k}"][data-pid="${CSS.escape(pid)}"]`)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-pjx],[data-pjs],[data-pjsdel],[data-pjt],[data-pjadd]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();const d=b.dataset;
  if(d.pjx){const card=b.closest('.pjx');if(PJ_OPEN.has(d.pjx))PJ_OPEN.delete(d.pjx);else PJ_OPEN.add(d.pjx);pjRerender();const n=document.querySelector(`[data-pjcard="${CSS.escape(d.pjx)}"] .pjx-b`);if(n&&n.animate)n.animate([{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'none'}],{duration:320,easing:'cubic-bezier(.16,1,.3,1)'});return}
  if(d.pjadd){pjxAdd(d.pjadd,d.pid);return}
  if(d.pjt){const t=find(d.pjt);if(!t)return;t.done=true;t.doneAt=Date.now();delete t.sample;save();tick();pjRerender();return}
  const[pid,sid]=(d.pjs||d.pjsdel).split(':'),p=find(pid);if(!p)return;
  if(d.pjsdel){p.steps=(p.steps||[]).filter(x=>x.id!==sid);save();pjRerender();return}
  const s=(p.steps||[]).find(x=>x.id===sid);if(!s)return;s.done=!s.done;save();if(s.done)tick();pjRerender()},true);
document.addEventListener('keydown',e=>{const k=e.target.dataset&&e.target.dataset.pjin;if(e.key==='Enter'&&k){e.preventDefault();pjxAdd(k,e.target.dataset.pid)}},true);
document.addEventListener('change',e=>{const l=e.target.closest&&e.target.closest('.pjx .dchip');if(!l)return;const v=e.target.value;l.classList.toggle('set',!!v);const sp=l.querySelector('span');if(sp)sp.textContent=v?fmtDate(v):'Date'});

/* ---- jobs: Gemini reads each job email (server side); Applied stays tucked away ---- */
{const _jc=jobCompany,_js=jobStage,_jr=jobRole;
  jobCompany=m=>{if(m&&m.ai&&!m.ai.job)return'';return m&&m.ai&&m.ai.company?m.ai.company:_jc(m)};
  jobStage=m=>{if(m&&m.ai){if(!m.ai.job||m.ai.stage==='Form'||m.ai.stage==='Other')return null;return m.ai.stage}return _js(m)};
  jobRole=m=>m&&m.ai&&m.ai.role?m.ai.role:_jr(m);}
const jkey=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
/* after the import: re-read every job's emails so a later reading (or a later email) fixes the stage and the date */
let JOBS_LAST=null;{const _aj=api;api=async function(p){const r=await _aj.apply(this,arguments);if(p==='/jobs')JOBS_LAST=r;return r}}
{const _ij=importJobs;importJobs=async function(force){
  JOBS_LAST=null;await _ij(force);const r=JOBS_LAST;JOBS_LAST=null;if(!r||uiLocked())return;
  const items=(Array.isArray(r&&r.items)?r.items:[]).filter(m=>m&&m.id!=null),byId=new Map(items.map(m=>[String(m.id),m]));let ch=0;
  /* merge duplicates made before the AI knew the real company */
  for(const j of of('job').filter(j=>j.src==='gmail')){
    const ms=(j.mailIds||[]).map(id=>byId.get(String(id))).filter(m=>m&&m.ai&&m.ai.job&&m.ai.company);if(!ms.length)continue;
    const cnt={};ms.forEach(m=>{cnt[m.ai.company]=(cnt[m.ai.company]||0)+1});const best=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0][0];
    if(jkey(best)&&jkey(best)!==jkey(j.title)){const twin=of('job').find(x=>x!==j&&jkey(x.title)===jkey(best));
      if(twin){twin.mailIds=[...new Set([...(twin.mailIds||[]),...(j.mailIds||[])])].slice(-500);if(!twin.role)twin.role=j.role;db.entries=db.entries.filter(x=>x!==j);ch++;continue}
      j.title=best;ch++}}
  for(const j of of('job').filter(j=>j.src==='gmail')){
    const ms=(j.mailIds||[]).map(id=>byId.get(String(id))).filter(Boolean).filter(m=>jobStage(m)).sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));if(!ms.length)continue;
    const last=ms[ms.length-1],st=jobStage(last),md=String(last.date||'');
    if(j.manualAt&&md&&md<j.manualAt)continue;   /* you moved it yourself after that email */
    if(st&&j.stage!==st){j.stage=st;(j.history=j.history||[]).push({stage:st,date:md.slice(0,10)||today()});ch++}
    const w=last.ai&&last.ai.when;if((st==='Interview'||st==='Assessment')&&w&&w!==j.next){j.next=w;ch++}
    if(!j.role){const ro=ms.map(jobRole).find(Boolean);if(ro){j.role=ro;ch++}}
    j.lastMail=String(last.subject||'').slice(0,120);j.lastMailAt=md}
  if(ch){save();if(state.tab==='work'&&state.sub.work==='job'){const y=SC.scrollTop;render(false);SC.scrollTop=y}}
}}
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-jstage]');if(!b)return;const j=find(b.dataset.jstage.split('|')[0]);if(j)j.manualAt=new Date().toISOString()},true);
let JB_APPLIED=false;
{const _vj6=viewJobs;viewJobs=function(){let h=_vj6();const a=of('job'),n=a.filter(e=>(e.stage||'Applied')==='Applied').length+a.filter(e=>e.stage==='Saved').length;
  if(!JB_APPLIED)h=h.replace(/<section class="sec"><div class="sec-h"><h2>(?:Applied|Saved)<\/h2>[\s\S]*?<\/section>/g,'');
  if(n){const btn=`<button class="link jb-more" data-jbapplied>${JB_APPLIED?'Hide':'Show'} ${n} waiting to hear back</button>`;const i=h.indexOf('<details class="sec">');h=i>=0?h.slice(0,i)+btn+h.slice(i):h+btn}
  return h}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-jbapplied]');if(!b)return;e.stopImmediatePropagation();JB_APPLIED=!JB_APPLIED;const y=SC.scrollTop;render(false);SC.scrollTop=y},true);
{const _so6=subOf;subOf=function(e){if(e.type==='job'&&e.next&&dayDiff(e.next)>=0&&(e.stage==='Interview'||e.stage==='Assessment'))return[`${e.stage==='Interview'?'Interview':'Due'} ${relDue(e.next)}`,e.role].filter(Boolean).join(' · ');return _so6(e)}}

/* ---- grades sheet: nothing cut off, tidy add-score form ---- */
{const _ocg=openClassGrades;openClassGrades=function(cid){_ocg(cid);const f=$('#gAdd');if(!f)return;
  const d=f.querySelector('input[name=date]');if(d&&!d.closest('.gdate')){const l=document.createElement('label');l.className='gdate';l.innerHTML=`${ic('cal')}<span>${d.value?fmtDate(d.value):'Date'}</span>`;d.replaceWith(l);l.appendChild(d);d.addEventListener('change',()=>{l.querySelector('span').textContent=d.value?fmtDate(d.value):'Date';l.classList.toggle('set',!!d.value)})}
  const mx=f.querySelector('input[name=max]');if(mx&&!mx.closest('.gmax')){const l=document.createElement('label');l.className='gmax';l.innerHTML='<span>out of</span>';mx.replaceWith(l);l.appendChild(mx)}}}

(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="oct23b">
.mt-pill{flex:none;margin-left:6px;font:700 12px var(--ui);padding:5px 10px;border-radius:999px;white-space:nowrap;background:var(--surface2);color:var(--muted)}
.mt-pill.live{background:color-mix(in srgb,#5FD08A 22%,transparent);color:#7FE0A3;display:inline-flex;align-items:center;gap:6px}
.mt-pill.live i{width:7px;height:7px;border-radius:50%;background:#5FD08A;animation:mtPulse 1.6s ease-in-out infinite}
@keyframes mtPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.7)}}
.mt-pill.soon{background:color-mix(in srgb,var(--accent) 20%,transparent);color:var(--accent)}
li.row.mt-live{box-shadow:inset 3px 0 0 #5FD08A}
li.row.mt-done .rt,li.row.mt-past .rt{text-decoration:none}
li.row.mt-done,li.row.mt-past{opacity:.6}
.pjx{gap:10px}.pjx-h{display:flex;align-items:flex-start;gap:6px;min-width:0}
.pjx-tog{flex:1;min-width:0;text-align:left;padding:0;background:none;border:0;color:inherit}
.pjx .chev{transition:transform .35s cubic-bezier(.16,1,.3,1)}.pjx.open .chev{transform:rotate(180deg)}
.pjx-edit{flex:none;width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:var(--surface2);color:var(--muted)}
.pjx-edit .i{width:17px;height:17px}
.pjx-b{display:flex;flex-direction:column;gap:8px;padding-top:4px;border-top:1px solid color-mix(in srgb,var(--ink) 9%,transparent);margin-top:2px}
.pjx-b .pj-h{margin:6px 0 0}.pjx-b .stepadd{margin:0}
.pjx-open{background:none;border:0;padding:0;color:inherit;text-align:left;cursor:pointer}
.jb-more{display:block;margin:4px auto 18px;font-weight:700}
/* grades */
.gsum{display:grid!important;grid-template-columns:1fr 1fr;gap:10px}
.gsum>div,.gsum>label{min-width:0}
.gcat{display:grid!important;grid-template-columns:minmax(0,1fr) 62px 28px 64px 32px;gap:5px!important;align-items:center;gap:6px}
.gcat>input{min-width:0;padding:0 4px!important}
.gw{padding:0 8px!important;height:36px;justify-content:flex-end;gap:3px}
.gw input{width:34px!important;padding:0!important;margin:0;font:700 15px var(--ui)!important;font-variant-numeric:tabular-nums;text-align:right;letter-spacing:0;min-width:0}
.gcat .gp{width:auto!important;text-align:center}
.gcat .x{width:34px;height:34px}
.gadd{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}
.gadd>input[name=name]{grid-column:1/-1}
.gadd>select{grid-column:span 3}.gadd>input[name=score]{grid-column:span 3}
.gadd .gmax{grid-column:span 3}.gadd .gdate{grid-column:span 3}
.gadd .gex{grid-column:span 3;display:flex;align-items:center;gap:8px;font-weight:700}
.gadd>button{grid-column:span 3}
.gadd>input,.gadd>select{width:100%}
.gcat .link{justify-self:stretch;text-align:center;padding:6px 2px!important;font-size:12px!important}
.gcat>input{font-size:14.5px!important}.gcat .gp{font-size:12px}.gw{padding:0 6px!important}.gw input{width:28px!important}
.gw input,.gcat>input,.gsum input,.gmax input{background:none!important;box-shadow:none!important;border:0!important;outline:0;-webkit-appearance:none;appearance:none}
.gsum input{padding:0!important;height:auto!important;font:800 26px var(--ui)!important}
.gadd .gex{height:42px;border-radius:12px;border:1px solid var(--line);background:var(--bg);padding:0 12px;justify-content:flex-start}
.gadd .gex input{width:20px!important;height:20px!important;flex:none;margin:0;accent-color:var(--accent);box-shadow:none!important;border-radius:5px}
.gmax,.gdate{position:relative;display:flex;align-items:center;gap:8px;height:42px;border-radius:12px;border:1px solid var(--line);background:var(--bg);padding:0 12px;min-width:0;font:600 14px var(--ui);color:var(--muted)}
.gmax span{flex:none;font-size:13px}.gmax input{border:0!important;height:100%!important;padding:0!important;background:none!important;text-align:right;flex:1;min-width:0}
.gdate .i{width:17px;height:17px;flex:none}.gdate.set{color:var(--ink)}
.gdate input{position:absolute;inset:0;opacity:0;width:100%!important;height:100%!important}
</style>`);

/* the dark launch cover (build.py) goes as soon as the intro or Home is on screen */
{const _es0=endSplash;endSplash=function(){const b0=document.getElementById('boot0');if(b0)b0.remove();return _es0.apply(this,arguments)};
 setTimeout(()=>{const b0=document.getElementById('boot0');if(b0&&!document.getElementById('ix3'))b0.remove()},6000);}

SRCL.VT='VT Dining (published nutrition)';
/* ===================== Oct 27: food search that forgives plurals, brand spellings and word order ===================== */
{const cmp=s=>s.toLowerCase().replace(/['’`.\-&]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
 const stem=w=>w.length>4&&/ies$/.test(w)?w.slice(0,-3)+'y':w.length>5&&/(ches|shes|oes|xes)$/.test(w)?w.slice(0,-2):w.length>3&&/s$/.test(w)&&!/ss$/.test(w)?w.slice(0,-1):w;
 const BRAND={mcdonalds:'mcdonalds',mcd:'mcdonalds',maccas:'mcdonalds',cfa:'chickfila',chickfila:'chickfila',cookout:'cook out',canes:'raising canes',bww:'buffalo wild wings',bdubs:'buffalo wild wings',jj:'jimmy johns',dd:'dunkin',dunkin:'dunkin',sbux:'starbucks',pj:'papa johns',tbell:'taco bell',bk:'burger king',moes:'moes',jerseymikes:'jersey mikes',fivegu:'five guys'};
/* common staples: the everyday row first (USDA lists dozens of variants with similar names) */
 const PIN={egg:['Egg, whole, cooked, hard-boiled','Egg, whole, cooked, scrambled','Egg, whole, cooked, fried','Egg, whole, raw, fresh'],
  rice:['Rice, white, cooked, NS as to fat','Rice, cooked','Rice, brown, cooked, NS as to fat'],'white rice':['Rice, white, cooked, NS as to fat'],'brown rice':['Rice, brown, cooked, NS as to fat'],
  'chicken breast':['Chicken breast, boneless skinless, cooked'],chicken:['Chicken breast, boneless skinless, cooked'],
  pizza:['Pizza, cheese, from frozen, thin crust'],oatmeal:['Oatmeal, regular or quick, made with water, no added fat'],oat:['Oatmeal, regular or quick, made with water, no added fat'],
  milk:['Milk, whole','Milk, whole, 3.25% milkfat, with added vitamin D'],bread:['Bread, white','Bread, whole wheat, made from home recipe or purchased at bakery'],
  pasta:['Pasta, cooked'],apple:['Apple, raw'],potato:['Potato, baked, NFS'],avocado:['Avocado, raw','Avocados, raw, California'],
  'greek yogurt':['Greek yogurt'],bagel:['Bagel'],tortilla:['Tortilla, flour'],'ground beef':['Beef, ground, 80% lean meat / 20% fat, raw'],
  'peanut butter':['Peanut butter, chunk style, with salt'],banana:['Banana']};
 searchFoods=function(q){
  if(!FOODS)return[];
  let qs=cmp(q);for(const[k,v]of Object.entries(BRAND))qs=qs.replace(new RegExp('\\b'+k+'\\b','g'),v);
  const words=qs.split(' ').filter(Boolean);if(!words.length)return[];
  const ws=words.map(stem);
  const out=[];
  for(const x of FOODS){
    if(!x.lcc){x.lcc=' '+cmp(x.lc)+' ';x.lcj=x.lcc.replace(/ /g,'')}
    let ok=true;for(let i=0;i<words.length;i++){const w=words[i],s=ws[i];if(!(x.lcc.includes(w)||x.lcc.includes(s)||(w.length>3&&x.lcj.includes(w)))){ok=false;break}}
    if(!ok)continue;
    const nl=cmp(x.n);
    let sc=nl.startsWith(ws[0])?0:(' '+nl+' ').includes(' '+ws[0])?3:7;
    sc+=x.n.length/28+(x.n.split(',').length-1)*.7;
    {const nn=' '+nl+' ';for(let i=0;i<words.length;i++)sc+=nn.includes(' '+words[i]+' ')||nn.includes(' '+ws[i]+' ')?-.8:.7}   /* whole words beat fragments (eggs -> Egg, not Eggnog) */
    sc+=x.s==='IN'?-1.5:x.s==='ONB'?2.5:x.s==='ONR'||x.s==='RC'||x.s==='VT'?.5:0;
    if(!x.sg)sc+=1.2;                                   /* foods with a real serving size first */
    if(/\b(raw|cooked|boiled|plain)\b/.test(nl))sc-=.4;
    if(words.length===1){const head=cmp(x.n.split(',')[0]);if(head===words[0]||head===ws[0]||stem(head)===ws[0])sc-=1.6}   /* "eggs" -> Egg, whole… before Egg salad */
    if(/\b(fish|roe|substitute|dried|powder|frozen|dry mix)\b/.test(nl)&&!words.some(w=>/fish|roe|substitute|dried|powder|frozen|mix/.test(w)))sc+=1;
    if(/[A-Z]{4,}/.test(x.n))sc+=1.5;
    {const m=/ (?:by|at) (.+)$/i.exec(x.n);if(m){const chain=' '+cmp(m[1])+' ';if(words.some(w=>chain.includes(' '+w)))sc-=1.2}}   /* "moes burrito" -> Moe's rows first */
    out.push([sc,x]);
  }
  const P=PIN[ws.join(' ')]||PIN[words.join(' ')];if(P)for(const o of out){const k=P.indexOf(o[1].n);if(k>=0)o[0]=-20+k}
  return out.sort((a,b)=>a[0]-b[0]).slice(0,50).map(o=>o[1]);
 }}

/* ===================== Oct 27: each Today section gets its own tint (same palette as the hero tiles; low enough to keep contrast) ===================== */
const TONES=[[/reminder/,'242 128 120'],[/habit/,'98 199 190'],[/progress/,'242 166 90'],[/insight/,'169 155 255'],[/streak/,'134 207 160'],
  [/weight/,'124 183 222'],[/injur/,'224 96 116'],[/mail|inbox/,'125 170 255'],[/bus/,'214 120 96'],[/caffeine/,'196 140 92'],[/rhythm|circadian|peak/,'255 196 107'],
  [/recovery/,'134 207 160'],[/crowd|campus/,'98 180 230'],[/deadline|milestone/,'240 109 68'],[/next|schedule|plan|class/,'156 214 126'],[/focus/,'232 150 210'],[/money|spend/,'230 190 90']];
function toneSections(root){try{(root||document).querySelectorAll('#view .sec').forEach(s=>{if(s.dataset.tone)return;const h=s.querySelector('.sec-h h2');if(!h)return;const t=h.textContent.toLowerCase();const m=TONES.find(([re])=>re.test(t));if(m){s.dataset.tone='1';s.style.setProperty('--tc',m[1])}})}catch(e){}}
{const _rT=render;render=function(a,f,d){_rT(a,f,d);toneSections(document.getElementById('view'))}}
(document.body||document.head).insertAdjacentHTML('beforeend',`<style id="tones">
#view .sec[data-tone] :is(.card-s,.habit,.stat,.ts-tile,.hstat,.tchip,.il-spark){
  background:linear-gradient(150deg,rgb(var(--tc) / .25) 0%,rgb(var(--tc) / .09) 55%,rgb(var(--tc) / .04) 100%),var(--surface)!important;
  border-color:rgb(var(--tc) / .32)!important;
  box-shadow:inset 0 1px 0 rgb(255 255 255 / .06),0 8px 22px rgb(0 0 0 / .18)!important}
#view .sec[data-tone] .card-s .card-s{background:rgb(var(--tc) / .06)!important;box-shadow:none!important}
#view .sec[data-tone] .sec-h h2 em{color:rgb(var(--tc))!important}
#view .sec[data-tone] .sec-h h2::before{filter:none}
#view .sec[data-tone] .list.card-s>li+li{border-color:rgb(var(--tc) / .14)}
:root[data-theme="light"] #view .sec[data-tone] :is(.card-s,.habit,.stat,.ts-tile,.hstat,.tchip,.il-spark){
  background:linear-gradient(150deg,rgb(var(--tc) / .20) 0%,rgb(var(--tc) / .08) 55%,rgb(var(--tc) / .04) 100%),var(--surface)!important;box-shadow:0 6px 18px rgb(80 60 30 / .07)!important}
</style>`);
