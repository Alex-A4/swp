define('Core/SessionStorage', [
   'Core/UserInfo',
   'Core/detection',
   'Core/constants',
   'Core/_storage'
], function (UserInfo, detection, constants, _storage) {
   var saveSSTimeout;
   var storage = _storage.getSession();
   var SAVE_TIMEOUT = 4 * 1000;
   var SESSION_NAME = 'wsss';

   var sessionObject;

   function getSessionObject() {
      /*
       * На СП объект со значениями sessionStorage храним внутри объекта "запрос",
       * который по завершению почистится от нашего кеша
       * Вычитываем каждый раз, т.к. СП обрабатывает в один процесс несколько пользователей
       * и кэширование может привести к тому что помешаем данные разных пользователей
       */
      if (!constants.isBrowserPlatform && constants.isBuildOnServer) {
          var request = process && process.domain && process.domain.req || {};
          sessionObject = request.sessionStorage = request.sessionStorage || {};
      }
      if (sessionObject) {
          return sessionObject;
      }
      var sessionString = storage.getItem(SESSION_NAME);
      try {
         sessionObject = JSON.parse(sessionString) || {};
      } catch(e) {
         sessionObject = {};
      }
      if (!UserInfo.isValid(sessionObject.user)) {
         //если изменились пользователи или клиент, то чистим
         storage.removeItem(SESSION_NAME);
         sessionObject = {};
         sessionObject.user = UserInfo.getCurrent();
      }
      return sessionObject;
   }

    /*
     * из-за "ленивого" сохранения в SessionStorage появляется возможность потерять данные,
     * записанные перед перезагрузкой страницы
     * поэтому записываем принудительно перед закрытием
     */
    if (constants.isBrowserPlatform) {
        var event = detection.firefox? 'beforeunload': 'unload';
        window.addEventListener(event, function () {
            storage.setItem(SESSION_NAME, JSON.stringify(getSessionObject()))
        });
   }

   function saveSS() {
       if (!constants.isBrowserPlatform) {
           return;
       }
       /*
        * Серилизация и запись в SessionStorage выходит накладно, поэтому делаем это отложенно,
        * чтобы не тормозить другие процессы
        */
       if (saveSSTimeout) {
           clearTimeout(saveSSTimeout);
       }
       saveSSTimeout = setTimeout(function() {
           storage.setItem(SESSION_NAME, JSON.stringify(getSessionObject()));
           saveSSTimeout = null;
       }, SAVE_TIMEOUT);
   }

   /**
    * class Core/SessionStorage
    * singleton
    * @public
    */
   var SessionStorage = /** @lends Core/SessionStorage.prototype */{
      get: function(key) {
         return getSessionObject()[key];
      },
      set: function(key, value) {
         if (!key) return;
         if (value == null && typeof key == 'object' && Object.prototype.toString.call(key) == '[object Object]') {
            // Обходимся без нашего helpers
            for (var k in key) {
               if (key.hasOwnProperty(k)) {
                   getSessionObject()[k] = key[k];
               }
            }
         } else {
             getSessionObject()[key] = value;
         }

         saveSS();
      },
      remove: function(key) {
         delete getSessionObject()[key];
         saveSS();
      },
      toObject: function() {
         return getSessionObject();
      }
   };

   return SessionStorage;
});
