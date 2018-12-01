const CACHE = 'network-or-cache-v1';
const timeout = 400;

self.addEventListener('install', (event) => {
   console.log('okey');
   event.waitUntil(
      caches.open(CACHE)
         .then(function(cache) {
            console.log('Opened cache');
            return cache.addAll(['/',
               '/w.js',
               '/WS.Core/css/core-min.css',
               '/all_desktop.css',
               '/WS.Core/ext/requirejs/bundles.js',
               '/cdn/requirejs/2.3.5-p3/require-min.js',
               '/contents.min.js',
               '/WS.Core/ext/requirejs/config.js',
               '/WS.Core/lib/Ext/tslib.min.js',
               '/WS.Core/core/i18n.min.js',
               '/WS.Core/ext/requirejs/plugins/i18n.min.js',
               '/WS.Core/ext/requirejs/plugins/text.min.js',
               '/WS.Core/ext/requirejs/plugins/native-css.min.js',
               '/WS.Core/ext/requirejs/plugins/tmpl.min.js',
               '/WS.Core/ext/requirejs/plugins/is.min.js',
               '/WS.Core/core/polyfill/PromiseAPIDeferred.min.js',
               '/WS.Core/ext/requirejs/plugins/wml.min.js',
               '/WS.Core/ext/requirejs/plugins/is-api.min.js',
               '/WS.Core/core/Control.min.tmpl',
               '/WS.Core/ext/requirejs/plugins/css.min.js',
               '/WS.Core/core/TimeTester.min.tmpl',
               '/Controls/Utils/getWidth.css',
               '/Controls/Utils/getWidth.min.css',
               '/Controls/Button/Close.css',
               '/Controls/Popup/Templates/Stack/StackTemplate.css',
               '/Controls/Button/Close.css',
               '/EDM/Document/DocumentStyles.css',
               '/EDM/Reestr/rowstyle.min.css',
               '/EDM/indexstyle.min.css',
               '/EDM/Reestr/cross.png',
               '/EDM/Reestr/rowstyle.css',
               '/EDM/indexstyle.css']);
         })
   );
});

self.addEventListener('fetch', (event) => {
   if (event.request.url.indexOf('clearcache') > -1) {
      return caches.keys().then(function(names) {
         for (let name of names) {
            caches.delete(name);
         }
         return fetch(event.request);
      });
   } if (event.request.url.indexOf('/api/') > -1) {
      return fetch(event.request);
   }
   event.respondWith(
      caches.match(event.request)
         .then(function(response) {
            if (response) {
               return response;
            }

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
         })
   );
});
