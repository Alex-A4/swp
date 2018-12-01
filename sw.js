const CACHE = 'network-or-cache-v1';
const timeout = 400;

self.addEventListener('install', (event) => {
        console.log("okey");
        event.waitUntil(
            caches.open(CACHE)
                .then(function(cache) {
                    console.log('Opened cache');
                    return cache.addAll(['/', '/w.js']);
                  }
        ));
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
          .then(function(response) {
            /*if (response) {
              return response;
            }*/

            var fetchRequest = event.request.clone();
            return fetch(fetchRequest).then(
                function(response) {

                  var responseToCache = response.clone();

                  caches.open(CACHE)
                    .then(function(cache) {
                      cache.put(event.request, responseToCache);
                    });

                  return response;
                }
            );
          }
        )
    );
});


