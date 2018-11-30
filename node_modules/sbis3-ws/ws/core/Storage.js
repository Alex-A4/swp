define('Core/Storage', ['Core/Deferred'], function(Deferred) {
   //MOVE_TO САННИКОВ
   /**
    * Хранилище асинхронных событий.
    *
    * @author Бегунов А.В.
    * @class Core/Storage
    * @public
    * @singleton
    */
   return /** @lends Core/Storage.prototype */{
      _storage: {},
      /**
       *
       * @param {string} name Уникальное имя асинхронной операции.
       * @param {Function} constructor Функция, выполняющая асинхронное действие.
       * Первым и единственным аргументом принимает {@link Core/Deferred},
       * у которого по завершении должна вызвать .callback.
       * @returns {Core/Deferred}
       * @see isStored
       */
      store: function(name, constructor) {
         // помещаем ресурс в хранилище и блокируем возможность повторной загрузки
         if (!(name in this._storage)) {
            if (typeof(constructor) != 'function') {
               throw new Error("Constructor is not specified for newly created async resource");
            }
            this._storage[name] = new Deferred();
            // запускаем асинхронное событие
            constructor(this._storage[name]);
         }
         return new Deferred().dependOn(this._storage[name]);
      },
      /**
       * Проверяет существует ли deferred с данным именем.
       * @param {string} name Имя.
       * @return {Boolean} Результат проверки существования deferred с указанным именем.
       * @see store
       */
      isStored: function(name) {
         return name in this._storage;
      },
      isReady: function(name) {
         return name in this._storage ? this._storage[name].isReady() : false;
      }
   };

});