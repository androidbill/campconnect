const CACHE_NAME="campconnect-multi-v56";
const ASSETS=["./","./index.html","./manifest.json","./icons/icon-192.png","./icons/icon-512.png","./icons/maskable-512.png","./icons/rock-app-team-logo.png"];

self.addEventListener("install",e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
});

self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

// Navigations go to the network first so a new index.html is picked up as soon as
// the device is online, falling back to the cached shell when it is not.
function handleNavigation(request){
  return fetch(request).then(r=>{
    const copy=r.clone();
    caches.open(CACHE_NAME).then(c=>c.put("./index.html",copy));
    return r;
  }).catch(()=>caches.match("./index.html").then(cached=>cached||caches.match("./")));
}

// Everything else is cache-first. A miss that also fails on the network returns a
// real error rather than the HTML shell, so a broken image stays a broken image.
function handleAsset(request){
  return caches.match(request).then(cached=>cached||fetch(request).then(r=>{
    if(r.ok&&new URL(request.url).origin===self.location.origin){
      const copy=r.clone();
      caches.open(CACHE_NAME).then(c=>c.put(request,copy));
    }
    return r;
  }));
}

self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  e.respondWith(e.request.mode==="navigate"?handleNavigation(e.request):handleAsset(e.request));
});
