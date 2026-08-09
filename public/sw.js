const CACHE_NAME = "finance-app-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/main.js",
  "/manifest.json",

  "/db/database.js",

  "/models/accountModel.js",
  "/models/transactionModel.js",

  "/services/transactionService.js",
  "/services/accountService.js",

  "/utils/helper.js",
  "/utils/render.js",
  "/utils/account.js",
  "/utils/utils.js",

  "/lib/dexie.mjs",
  "/lib/lucide.min.js",
  "/lib/sweetalert2.all.min.js",
  "/lib/datatables.min.js",

  "/assets/css/tailwind.min.css",
  "/assets/css/style.css",
  "/assets/css/sweetalert2.min.css",
  "/assets/css/datatables.min.css",

  "/assets/fonts/Roboto-Regular.ttf",
  "/icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});