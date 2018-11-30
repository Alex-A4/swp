define('Core/MicroSession', [
   'Core/cookie',
   'Core/helpers/Object/isEmpty',
   'Core/constants',
   'Core/detection'
], function (
   cookie,
   isEmptyObject
) {

   /*function deprecate(msg) {
      msg = msg || 'MicroSession deprecated and will remove after 3.7.5.200';
      IoC.resolve('ILogger').log('Deprecated', msg);
   }*/

   /**
    * @class Core/MicroSession
    * @author Бегунов А.В.
    * @public
    * @singleton
    */
   var MicroSession = /** @lends Core/MicroSession.prototype */{
      _available: true,
      _ms: {},
      _msid: '',
      _storage: null,
      _sessionsLimit: 5,
      _storageChangeHandler: function (e) {
         if (!e) {
            e = window.event;
         }
         if ('key' in e) {
            if (e.key == this._msid && e.newValue === null) {
               try {
                  localStorage.setItem(this._msid, JSON.stringify(this._ms));
               } catch (e) {
                  // ignore
               }
            }
         } else {
            if (!localStorage.getItem(this._msid)) {
               try {
                  localStorage.setItem(this._msid, JSON.stringify(this._ms));
               } catch (e) {
                  // ignore
               }
            }
         }
      },
      syncMsid: function () {
         this._set('ws-msid', this._msid);
      },
      init: function () {
         var self = this;

         function syncMsidOnLinkClick(event) {
            event = event || window.event;
            var target = event.target || event.srcElement;
            if (target.hasAttribute && target.hasAttribute('href')) {
               self.syncMsid();
            }
         }

         this._prepareStorage();

         if (!this._available) {
            return;
         }

         this._msid = this._getId();

         var
            prevSessionId = this._get('ws-msid'),
            prevSession = prevSessionId ? this._get(prevSessionId) : '';

         this._ms = prevSession ? JSON.parse(prevSession) : {};


         this._ms.sid = cookie.get('s3su');

         this._set('ws-msid', '');
         this._set(this._msid, JSON.stringify(this._ms));


         if (window.addEventListener) {
            window.addEventListener('storage', this._storageChangeHandler.bind(this), false);
         } else {
            window.attachEvent('onstorage', this._storageChangeHandler.bind(this));
         }

         window.addEventListener('unload', function () {
            self._garbageCollector();
            // deprecate('MicroSession.syncMsid() will remove from $(window).unload, use it manualy');
            self.syncMsid();
         });

         if (window.addEventListener) {
            // Ловим на capture-фазе чтобы поймать все клики
            document.addEventListener('click', syncMsidOnLinkClick, true);
         } else {
            document.attachEvent('onclick', syncMsidOnLinkClick);
         }

         (function (open) {
            window.open = function () {
               // deprecate('window.open wrapper deprecated and will remove, use MicroSession.syncMsid() manualy');
               self.syncMsid();
               var res;
               switch (arguments.length) {
                  case 1:
                     res = open(arguments[0]);
                     break;
                  case 2:
                     res = open(arguments[0], arguments[1]);
                     break;
                  case 3:
                     res = open(arguments[0], arguments[1], arguments[2]);
                     break;
               }
               return res;
            };
         })(window.open);
      },
      /**
       * Подготавливает хранилище
       * @private
       */
      _prepareStorage: function () {
         if (typeof localStorage !== "undefined") {
            //use localStorage
            this._storage = window.localStorage;
         } else {
            this._available = false;
         }
      },
      /**
       * Возвращает значение непосредственно из localStorage
       * @param {String} key - ключ.
       * @return {*}
       * @private
       */
      _get: function (key) {
         var result;
         result = this._storage.getItem(key);
         result = result === "undefined" ? undefined : result;
         return result ? result.toString() : undefined;
      },
      /**
       * Записывает значение непосредственно в localStorage
       * @param {String} key - ключ.
       * @param {String} value - значение.
       * @private
       */
      _set: function (key, value) {
         try {
            this._storage.setItem(key, value);
         } catch (e) {
            // ignore
         }
      },
      /**
       * Сборщик мусора, не позволяет накапливаться сессиям. Держит _sessionsLimit сессий
       */
      _garbageCollector: function () {
         var
            keys = [],
            sid = cookie.get('s3su'),
            ms, i, len, msVal;

         //collect session keys
         for (i in this._storage) {
            if (this._storage.hasOwnProperty ? this._storage.hasOwnProperty(i) : true) {
               if (/^s\d+$/.exec(i)) {
                  keys.push(parseInt(i.substr(1), 10));
               }
            }
         }

         //sort
         keys.sort();

         //remove old keys
         while (keys.length > this._sessionsLimit) {
            try {
               this._storage.removeItem('s' + keys[0]);
            } catch (e) {
               // ignore
            }
            keys.shift();
         }

         // actualize sid
         for (i = 0, len = keys.length; i < len - 1; ++i) {
            msVal = this._get('s' + keys[i]);
            if (msVal) {
               try {
                  ms = JSON.parse(msVal);
               } catch (e) {
                  ms = null;
               }
            } else {
               ms = null;
            }
            // ms может быть null
            if (ms && (!ms.hasOwnProperty('sid') || (sid !== ms.sid))) {
               this._storage.removeItem('s' + keys[i]);
            }
         }
      },
      /**
       * Очищает ВСЁ хранилище
       */
      _clear: function () {
         this._storage.clear();
      },

      clearCurrentSession: function () {
         if (this._available) {
            this._ms = {};
            this._set(this._msid, "{}");
         } else {
            return false;
         }
      },
      /**
       * Проверяет является ли сессия пустой
       * @return {Boolean}
       */
      isEmpty: function () {
         return isEmptyObject(this.toObject());
      },
      /**
       * Возвращает если уже есть, иначе генерирует идентификатор текущей сессии
       * @return {String} идентификатор сессии.
       * @private
       */
      _getId: function () {
         if (this._available) {
            return ["s", ("" + new Date().getTime())].join("");
         } else {
            return '';
         }
      },
      /**
       * Устанавливает значение
       * @param {String} key - ключ.
       * @param {String} value - значение.
       */
      set: function (key, value) {
         if (this._available) {
            this._ms[key] = value;
            this._set(this._msid, JSON.stringify(this._ms));
         } else {
            return false;
         }
      },
      /**
       * Возвращает значение
       * @param {String} key - ключ.
       * @return {*}
       */
      get: function (key) {
         if (this._available) {
            return this._ms[key];
         } else {
            return false;
         }
      },
      /**
       * Устанавливает значение постоянно. Не зависит от текущей микросессии.
       * Сделано оберткой, может понадобиться еще доработать.
       * @param {String} key - ключ.
       * @param {String} value - значение.
       */
      setPermanently: function (key, value) {
         // deprecate('Method MicroSession.setPermanently is deprecated and will remove after 3.7.5.200');
         this._set(key, value);
      },
      /**
       * Возвращает значение из постоянного хранилища
       * @param {String} key - ключ.
       * @return {*}
       */
      getPermanently: function (key) {
         // deprecate('Method MicroSession.getPermanently is deprecated and will remove after 3.7.5.200');
         return this._get(key);
      },
      /**
       * Удаляет значение из сессии по ключу
       * @param {String} key - ключ.
       */
      remove: function (key) {
         if (this._available) {
            delete this._ms[key];
            this._set(this._msid, JSON.stringify(this._ms));
         } else {
            return false;
         }
      },
      /**
       * Возвращает текущую сессию в виде объекта
       * @return {*}
       */
      toObject: function () {
         return this._ms;
      }
   };

   MicroSession.init(); // раньше было в core-init

   return MicroSession;
});
