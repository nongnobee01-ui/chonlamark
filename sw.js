/* Service worker: ข้อมูลหน้าแอปดึงจากเน็ตก่อนเสมอ (อัปเดตทันทีที่แก้ไฟล์บน GitHub)
   ถ้าเน็ตหลุด ใช้ของที่เก็บไว้ล่าสุด · ภาพดาวเทียมและรูปเก็บไว้ใช้ตอนสัญญาณอ่อน */
const VERSION = "v10";
const SHELL = "shell-" + VERSION, MEDIA = "media-v1";
const CORE = ["./", "index.html", "manifest.webmanifest", "logo.png", "app-icon-192.png",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== SHELL && k !== MEDIA).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

async function networkFirst(req){
  const cache = await caches.open(SHELL);
  try {
    const res = await fetch(req, {cache: "no-store"});
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return (await cache.match(req, {ignoreSearch: true})) || (await cache.match("index.html")) || Response.error();
  }
}
async function staleWhileRevalidate(req){
  const cache = await caches.open(MEDIA);
  const hit = await cache.match(req);
  const net = fetch(req).then(res => { if (res.ok || res.type === "opaque") cache.put(req, res.clone()); return res; }).catch(() => hit);
  return hit || net;
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const same = url.origin === location.origin;
  if (req.mode === "navigate" || (same && /\.(html|js|webmanifest|json)$/.test(url.pathname)) || (same && url.pathname.endsWith("/"))) {
    e.respondWith(networkFirst(req)); return;
  }
  if (same || url.hostname.endsWith("arcgisonline.com") || url.hostname.endsWith("cdnjs.cloudflare.com") || url.hostname.endsWith("gstatic.com") || url.hostname.endsWith("googleapis.com")) {
    e.respondWith(staleWhileRevalidate(req));
  }
});
