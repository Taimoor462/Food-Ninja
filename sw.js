const staticCacheName = "site-static-v3";
const dynamicCacheName = "site-dynamic-v3";
const assets = [
  "/",
  "/index.html",
  "/js/app.js",
  "/js/materialize.min.js",
  "/js/ui.js",
  "/css/styles.css",
  "/css/materialize.min.css",
  "/img/dish.png",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  'https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
  "/pages/fallback.html",
];
// cache size limit function

// const limitCacheSize = (name, size)=>{
//     caches.open(name).then(cache =>{
//         cache.keys().then(keys =>{
//             console.log('cache:', cache)
//             console.log('keys:', keys, keys.length)
//             console.log('size:', size)
//             if(keys.length > size){
//                 cache.delete(keys[0]).then(limitCacheSize(name, size))
//             }
//         })
//     })
// }



// install serice worker
self.addEventListener("install", (event) => {
  // console.log('service worker installed');
  event.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log("cashing shell assets");
      cache.addAll(assets);
    })
  );
});


// yeh hamesha 1 promise return krty han

// activate service event
self.addEventListener("activate", (event) => {
  // console.log('service worker activated');
  event.waitUntil(
    caches.keys().then((keys) => {
      // console.log(keys)
      // deleting old caches
      return Promise.all(
        keys
          // agr key staticCacheName k equal ni hoti to woh isi array main rahaygi or agr woh is k equal ha to woh new array main save ho jaygi
          .filter((key) => key !== staticCacheName && key !== dynamicCacheName)
          // iss k bad map method ki madad sy hum isko delete kr dain gy
          .map((key) => caches.delete(key))
      );
    })
  );
});

// fetch event
self.addEventListener("fetch", (event) => {
  // console.log('fetch event', event)
  event.respondWith(
    caches
      .match(event.request)
      .then((cacheRes) => {
        return (
          cacheRes ||
          fetch(event.request).then((fetchRes) => {
            // with the help of this dynamic cache we can go to the other pages like about page on offline mode when user will be online and visited the different pages the pages user visited these will be cached in dynamicCacheName storage
            return caches.open(dynamicCacheName).then(cache => {
                // it takes two parameters
              cache.put(event.request.url, fetchRes.clone());
            //   limitCacheSize(dynamicCacheName, 3);
              return fetchRes;  
            });
          })
        );
      })
      .catch(() => {
        // iss check ki madad sy hum different calls ko check kr skty han k woh woh kis cheez ki call ha agr call png ki hoti ha to iss page ki jaga hum dumy png show krwa skty han 
        if(event.request.url.indexOf('.html') > -1 ){
            return caches.match("/pages/fallback.html");
        }
      })
  );
});

