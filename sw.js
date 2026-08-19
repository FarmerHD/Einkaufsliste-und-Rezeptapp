// Meine Rezepte -- Service Worker (Schritt 6: offline & installierbar)
//
// Zweck: die vier App-Dateien (index.html, config.js, styles.css, app.js) plus
// Manifest/Icons als "App-Shell" zwischenspeichern, damit die Seite auch ganz
// ohne Internetverbindung öffnet. Die eigentlichen Daten (Rezepte, Einkaufs-
// liste, Wochenplan) werden NICHT hier, sondern direkt in app.js im
// localStorage zwischengespeichert (siehe zzCacheRead/zzCacheWrite dort) --
// dieser Service Worker kümmert sich nur um die statischen Dateien.
//
// Strategie bewusst "Netzwerk zuerst, Cache als Rückfalloption": bei jedem
// Laden wird zuerst versucht, die Datei frisch vom Server zu holen (und der
// Cache dabei aktualisiert) -- nur wenn das Netzwerk nicht erreichbar ist,
// kommt die zuletzt gespeicherte Version aus dem Cache. Das stellt sicher,
// dass ein normaler Hard-Refresh nach einem neuen Deployment weiterhin sofort
// die neue Version zeigt (kein "hängt an einer alten, gecachten Version").
const ZZ_SW_CACHE = "meine-rezepte-shell-v1";
const ZZ_SHELL_FILES = [
  "./",
  "./index.html",
  "./config.js",
  "./styles.css",
  "./app.js",
  "./manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(ZZ_SW_CACHE)
      .then((cache) => cache.addAll(ZZ_SHELL_FILES))
      .catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== ZZ_SW_CACHE)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Nur eigene, statische Dateien behandeln -- Supabase-API-Aufrufe und
  // Drittanbieter-CDNs (z. B. die Supabase-JS-Bibliothek) laufen unverändert
  // direkt übers Netz, damit sich an deren Verhalten nichts ändert.
  if (url.origin !== self.location.origin) return;
  if (
    /\.(html|js|json|css|woff2?|ttf)$/.test(url.pathname) ||
    url.pathname.endsWith("/")
  ) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(ZZ_SW_CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req)),
    );
  }
});