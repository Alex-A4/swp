define('Core/HashManager', [
   'require',
   'Core/helpers/Object/isEmpty',
   'Core/EventBus',
   'Core/constants'
], function(require, isEmptyObject, EventBus) {
   /**
    * Инструмент управления location.hash
    * @author Бегунов А.В.
    * @class Core/HashManager
    * @public
    * @singleton
    */
   "use strict";

   var HashManager = /** @lends Core/HashManager.prototype */{
      /**
       * @event onChange Событие, происходящее при изменении хэша
       * @param {Core/EventObject} eventObject Дескриптор события
       */
      _eventBusChannel: null,
      eventBusId: 'HashManager',
      _handlers: {},

      get _location() {
         return window ? window.location : undefined;
      },

      get _history() {
         return window ? window.history : undefined;
      },

      _getLocWithoutHash: function() {
         var
            loc = this._location.toString(),
            hPos = loc.indexOf('#');
         if (hPos !== -1) {
            loc = loc.substring(0, hPos);
         }
         return loc;
      },
      /**
       * Возвращает параметр из хэша
       * @param {String} name имя параметра.
       * @return {*}
       */
      get: function(name) {
         var result = "";
         if (window) {
            var
               hash = decodeURI(this._location.hash),
               reg = new RegExp("(?:#|&)" + name + "=(?:[^&]+$|[^&]+(?=&))", "");
            result = hash.match(reg);
         }
         return result ? (result[0].replace(/^./, "").replace(name + "=", "")).replace(/:a:/g, "&") : undefined;
      },

      _prepareHash: function(hash) {
         if (hash.indexOf('#') === 0) {
            return hash.substring(1);
         }
         return hash;
      },

      /**
       * Устанавливает значение в хэш
       * @param {String|Object} name имя параметра или набор параметров и их значений.
       * @param {String} [value] значение параметра (если name передано в виде String).
       * @param {Boolean|String} [replace] Установить без добавления записи в историю.
       * @param {Boolean} [forceReplace] Установить без добавления записи в историю.
       * @example
       * <pre>
       *    HashManager.set('p0', 'v0');
       *
       *    HashManager.set('p1', 'v1', true);
       *    HashManager.set('p2', 'v2', true);
       *
       *    HashManager.set({
       *       p1: 'v1',
       *      p2: 'v2'
       *   }, true);
       * </pre>
       */
      set: function(name, value, replace, forceReplace) {
         if (window && name) {
            var map = {},
               toSet = {},
               toRemove = [],
               paramName,
               paramValue;

            //Normalize arguments
            if (typeof name === 'object') {
               map = name;
               forceReplace = replace;
               replace = value;
            } else {
               map[name] = value;
            }

            //Analize hash params
            for (paramName in map) {
               if (map.hasOwnProperty(paramName)) {
                  paramValue = map[paramName];
                  if (paramValue === undefined || !('' + paramValue).trim()) {
                     toRemove.push(paramName);
                  } else {
                     toSet[paramName] = paramValue;
                  }
               }
            }

            //Apply hash params
            if (toRemove.length) {
               this.remove(toRemove, replace);
            }
            if (!isEmptyObject(toSet)) {
               var hash = decodeURI(this._location.hash);

               hash = this._prepareHash(hash);

               for (paramName in toSet) {
                  if (toSet.hasOwnProperty(paramName)) {
                     var v = (toSet[paramName] + '').replace(/&/g, ":a:"),
                        reg = new RegExp(paramName + "=[^&]+$|" + paramName + "=[^&]+(?=&)", ""),
                        param = [paramName, v].join("=");

                     if (hash.length) {
                        hash = hash.match(reg) ? hash.replace(reg, param) : [hash, param].join("&");
                     } else {
                        hash = param;
                     }
                  }
               }

               this.setHash(hash, replace, forceReplace);
            }
         }
      },
      setHash: function(hashValue, replace, forceReplace) {
         var sLoc = this._getLocWithoutHash();
         this._changeLocation(sLoc, hashValue, this._replace || forceReplace);
         !forceReplace && (this._replace = replace);
      },
      /**
       * Записывает текущее состояние в историю браузера
       */
      pushState: function() {
         this._replace = false;
         this.set('ws-dummy', '1');
         this._replace = true;
         this.remove('ws-dummy', true);

         if (require.defined('Lib/NavigationController/NavigationController')) {
             require('Lib/NavigationController/NavigationController').saveAllStates();
         }
      },
      /**
       * Удаляет значение из хэша
       * @param {String|Array} name имя параметра или набор имен параметров.
       * @param {Boolean} [replace] Установить без добавления записи в историю.
       * @example
       * <pre>
       *    HashManager.remove('p0');
       *
       *    HashManager.remove(['p1', 'p2'], true);
       * </pre>
       */
      remove: function(name, replace) {
         if (window) {
            if (!(name instanceof Array)) {
               name = [name];
            }
            var hash = decodeURI(this._location.hash),
               sLoc = this._getLocWithoutHash();

            if (hash.indexOf('#') === 0) {
               hash = hash.substring(1);
            }

            for (var i = 0; i < name.length; i++) {
               var reg = new RegExp("&?" + name[i] + "=[^&]+$|" + name[i] + "=[^&]+&", "g");
               hash = hash.replace(reg, "");
            }

            this._changeLocation(sLoc, hash, this._replace);

            this._replace = replace;
         }
      },

      _changeLocation: function(sLoc, hash, replace) {
         var newLoc = sLoc + '#' + encodeURI(hash);
         if (this._prepareHash(hash) === this._prepareHash(this._location.hash) || replace) {
            this._history.replaceState(this._history.state, '', newLoc);
         } else {
            this._history.pushState(this._history.state, '', newLoc);
         }
         HashManager._getChannel().notify('onChange');
      },

      _getChannel: function() {
         if (!this._eventBusChannel) {
            this._eventBusChannel = EventBus.channel(this.eventBusId);
         }
         return this._eventBusChannel;
      },

      once: function(event, handler) {
         this._getChannel().once(event, handler, this);
      },

      subscribe: function(event, $handler) {
         this._getChannel().subscribe(event, $handler, this);
         return this;
      },

      unsubscribe: function(event, handler) {
         this._getChannel().unsubscribe(event, handler);
         return this;
      }
   };

   if (typeof window !== 'undefined') {
      HashManager._replace = true;
      window.onhashchange = function () {
         HashManager._getChannel().notify('onChange');
      }
   }

   return HashManager;
});
