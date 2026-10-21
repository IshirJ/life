import re,shutil
s=open('index.html').read()
lines=s.split('\n',4)
headbits='\n'.join(l for l in lines[:4] if l.startswith('<'))
body=lines[4]
# scripts from the CDN are pinned to the exact files the app loads (motion, and ZXing for the barcode scanner)
SCRIPT_CDN="https://cdn.jsdelivr.net/npm/motion@11.11.13/dist/motion.js https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js"
CONNECT_OTHER="https://world.openfoodfacts.org https://cdn.jsdelivr.net https://fonts.googleapis.com https://fonts.gstatic.com"
csp=("default-src 'self'; script-src 'self' 'unsafe-inline' "+SCRIPT_CDN+"; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
     "font-src https://fonts.gstatic.com; img-src 'self' data: blob: https://raw.githubusercontent.com https://images.unsplash.com; media-src 'self' blob: data: mediastream:; "
     "connect-src 'self' https://*.workers.dev wss://*.workers.dev "+CONNECT_OTHER+"; "
     "worker-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none'")
connect_other=CONNECT_OTHER
head=f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="color-scheme" content="dark">
<style>html,body{{background:#080A09}}</style>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="{csp}">
<script>/* once a server is connected, a second policy narrows connect-src from any *.workers.dev to exactly that server
  (browsers enforce both policies, so the stricter one wins). Disconnecting reloads the page to lift it. */
(function(){{try{{var s=JSON.parse(localStorage.getItem('ishiros.sync')||'null'),u=s&&s.url?new URL(s.url):null;
if(u&&u.protocol==='https:'&&/^[a-z0-9.-]+(:[0-9]+)?$/i.test(u.host)){{var m=document.createElement('meta');m.httpEquiv='Content-Security-Policy';
m.content="connect-src 'self' "+u.origin+" wss://"+u.host+" {connect_other}";document.head.appendChild(m)}}}}catch(e){{}}}})();</script>
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="theme-color" content="#131311">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Life">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
'''+open('launch_links.html').read()+f'''
{headbits}
<style>html{{background:#080A09}}body{{margin:0}}[hidden]{{display:none!important}}img{{max-width:100%}}</style>
</head>
<body>
'''
tail='''
<script>
if('serviceWorker' in navigator){addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(reg=>{
  /* look for a new version every time the app comes back to the front, not only on a cold start */
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')reg.update().catch(()=>{})});
}).catch(()=>{}));
  /* a new version took over: reload straight away if nothing is open, otherwise the next time the app is brought back */
  let had=!!navigator.serviceWorker.controller,pend=false;
  const go=()=>{const a=document.activeElement;if(document.querySelector('#wrap:not([hidden])')||document.getElementById('jvHud')||(a&&/INPUT|TEXTAREA/.test(a.tagName)))pend=true;else location.reload()};
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had)go();had=true});
  document.addEventListener('visibilitychange',()=>{if(pend&&document.visibilityState==='visible'){pend=false;location.reload()}});
}
</script>
</body>
</html>
'''
# the service worker source lives in sw.src.js; dist/sw.js only tells us the last version number
try: prev=open('dist/sw.js').read()
except FileNotFoundError: prev=''
m=re.search(r"life-v(\d+)",prev) or re.search(r"life-v(\d+)",open('sw.src.js').read())
nv=int(m.group(1))+1
sw=re.sub(r"life-v\d+",f"life-v{nv}",open('sw.src.js').read(),count=1)
body=body.replace('/*@@EXT@@*/','\n'.join(open(f).read() for f in ['secure.js','ext.js','more.js','ui2.js','ui3.js','icons.js','ui4.js']))
# one radius scale for the whole app: every single border-radius snaps to 8 / 12 / 16 / 22 / 28
def _rad(m):
    n=int(m.group(1))
    if n<=5: return m.group(0)
    if n>32: return m.group(0)
    v='var(--r-xs)' if n<=8 else 'var(--r-s)' if n<=12 else 'var(--r-m)' if n<=18 else 'var(--r-l)' if n<=24 else 'var(--r-xl)'
    return 'border-radius:'+v+m.group(2)
body=re.sub(r'border-radius:(\d+)px(\s*[;}"!])',_rad,body)
open('dist/index.html','w').write((head+body+tail).replace('__APPVER__',str(nv)))
shutil.copy('foods.txt','dist/foods.txt')
shutil.copy('exercises.json','dist/exercises.json')
shutil.copy('notes.js','dist/notes.js')
shutil.copy('pause.html','dist/pause.html')
shutil.copy('pf.js','dist/pf.js')
shutil.copytree('pdfjs','dist/pdfjs',dirs_exist_ok=True)
open('dist/sw.js','w').write(sw)
print('built', re.search(r"life-v\d+",sw).group(0))
