const CACHE='scout-volley-shell-v17';
const FILES=['./','./index.html','./manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(path=>new Request(path,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('scout-volley-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  const isAppDocument=url.origin===self.location.origin&&(event.request.mode==='navigate'||url.pathname.endsWith('/index.html')||url.pathname.endsWith('/'));
  if(isAppDocument){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
      if(response.ok)caches.open(CACHE).then(cache=>cache.put('./index.html',response.clone()));
      return response;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response.ok&&url.origin===self.location.origin){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
    return response;
  }).catch(()=>caches.match('./index.html'))));
});
