const CACHE="golf-tracker-v40", SHARE="tracer-share";
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"])));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==SHARE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
 const req=e.request;
 /* v40: Android-Teilen-Menue (Web Share Target). Dateien zwischenlagern, dann die App oeffnen. */
 if(req.method==="POST"&&new URL(req.url).pathname.endsWith("/share-target")){
  e.respondWith((async()=>{
   try{const fd=await req.formData(),c=await caches.open(SHARE);let i=0;
    for(const f of fd.getAll("file")){if(!f||typeof f==="string")continue;
     await c.put("./shared/"+Date.now()+"-"+(i++),new Response(f,{headers:{"X-Name":encodeURIComponent(f.name||""),"Content-Type":f.type||"text/plain"}}));}
   }catch(err){}
   return Response.redirect(new URL("./?share=1",self.registration.scope).href,303);})());
  return;
 }
 if(req.mode==="navigate"){
  // network-first fuer die App-Shell: Updates kommen automatisch an, offline faellt es auf den Cache zurueck.
  e.respondWith(fetch(req).then(resp=>{const cp=resp.clone();caches.open(CACHE).then(c=>c.put("./index.html",cp));return resp;}).catch(()=>caches.match("./index.html").then(r=>r||caches.match("./"))));
  return;
 }
 e.respondWith(caches.match(req).then(r=>r||fetch(req).then(resp=>{const cp=resp.clone();caches.open(CACHE).then(c=>c.put(req,cp));return resp;}).catch(()=>caches.match("./index.html"))));
});
