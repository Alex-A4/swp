define('Lib/Cache/Cache', ['Core/core-extend', 'Core/IoC', 'Core/Deferred', 'Core/ConsoleLogger'], function(cExtend, IoC, Deferred){

   function retTrue() {
      return true;
   }

   var caches = {};

   /**
    * @class Lib/Cache/Cache
    * @author Крайнов Д.О.
    * @description Абстрактный именованный кэш со строковыми ключами и сроком жизни каждого элемента
    *
    * Позволяет кэшировать абстрактные сущности, получаемые асинхронно. При этом если в данный момент есть запрос на
    * "приготовление" сущности с данным ключем, он будет передан всем запрашивающим в виде Deferred.
    * После завершения "приготовления" сущности она будет возвращаться незамедлительно до истечения срока хранения.
    *
    * Поддерживается возврат из "готовящей" функции ошибки (Error) с полем data. Этот случай означает, что данные нужно
    * отдать пользователям, но не следует кэшировать.
    *
    * Все аргументы, передаваемые в функцию getItem() передаются в конструирующую функцию. Первым аргументом всегда идет ключ.
    *
    * Пример использования:
    *
    * require(['Lib/Cache/Cache'], function(cache) {
    *
    *    var rightsCache = cache.getByName('currentUserRights', 5 * 60 * 1000, function(key) {
    *       return new BLObject('ПроверкаПрав').query('ДоступныеЗоныСВложением', {});
    *    });
    *
    *    rightsCache.getItem(1023).addCallback(...);
    *
    * });
    */
   var Cache = cExtend({}, {
      $protected: {
         _cache: {},
         _options: {
            name: '',
            factory: null,
            expire: -1
         }
      },
      $constructor: function() {
         if (this._options.expire === -1) {
            this._isItemValid = retTrue;
         }
      },
      getItem: function(key) {
         return this._getItemData(this._getItem.apply(this, arguments));
      },
      purge: function(key) {
         if (key) {
            delete this._cache[key];
         } else {
            this._cache = {};
         }
      },
      destroy: function() {
         this.purge();
         delete caches[this._options.name];
      },
      _getItemLow: function(key) {
         return this._cache[key];
      },
      _getItem: function(key) {
         var item = this._getItemLow(key);
         if (item) {
            if (this._isItemValid(item)) {
               return item;
            } else {
               return this._mkItem.apply(this, arguments);
            }
         } else {
            return this._mkItem.apply(this, arguments);
         }
      },
      _getItemData: function(item) {
         return item.deferred && item.deferred.createDependent() || new Deferred().callback(item.data);
      },
      _isItemValid: function(item) {
         return !item.dirty && ('data' in item || 'deferred' in item) && this._options.expire > 0 && +new Date() - item.created <= this._options.expire;
      },
      _mkItem: function(key) {
         var
            dResult = new Deferred(),
            item = {
               created: +new Date(),
               deferred: dResult
            },
            self = this;

         this._cache[key] = item;
         this._options.factory.apply(null, arguments)
            .addBoth(function(res){
               if (res instanceof Error) {
                  item.dirty = true;
                  if ('data' in res) {
                     res = res.data;
                  }
               }
               self._setItemResult(item, res);
               return res;
            });

         return item;
      },
      _setItemResult: function(item, result) {
         var def = item.deferred;
         item.data = result;
         delete item.deferred;
         def.callback(result);
         return result;
      }
   });

   IoC.bind('ICache', 'Cache');

   function mkCacheInstance(impl, config) {
      return impl ? new impl(config) : IoC.resolve('ICache', config);
   }

   /**
    * Создаст новый кэш с именем name, сроком жизни элемента expire и конструирующей функцией factory.
    * Если такой кэш уже существует - отдаст его
    *
    * @param {String} name
    * @param {Number} expire -1 для бесконечного хранения
    * @param {Function} factory
    * @param {Lib/Cache/Cache} [impl] Реализация кэша.
    * Можно передать сюда собственного наследника SBIS3.CORE.Cache.
    * Если не передано - разрешает интерфейс ICache с помощью $ws.single.ioc
    * @returns {Lib/Cache/Cache}
    * @static
    */
   Cache.getByName = function(name, expire, factory, impl) {
      return caches[name] = caches[name] || mkCacheInstance(impl, {
         name: name,
         expire: expire,
         factory: factory
      });
   };

   return Cache;

});