const CACHE="golf-tracker-v6";
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(["./","./index.html","./manifest.webmanifest"])));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
 const req=e.request;
 if(req.mode==="navigate"){
  // network-first fuer die App-Shell: Updates kommen automatisch an, offline faellt es auf den Cache zurueck.
  e.respondWith(fetch(req).then(resp=>{const cp=resp.clone();caches.open(CACHE).then(c=>c.put("./index.html",cp));return resp;}).catch(()=>caches.match("./index.html").then(r=>r||caches.match("./"))));
  return;
 }
 e.respondWith(caches.match(req).then(r=>r||fetch(req).then(resp=>{const cp=resp.clone();caches.open(CACHE).then(c=>c.put(req,cp));return resp;}).catch(()=>caches.match("./index.html"))));
});
