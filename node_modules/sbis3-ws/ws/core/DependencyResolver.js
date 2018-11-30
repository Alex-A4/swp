define('Core/DependencyResolver', function() {
   /**
    *
    * @class Core/DependencyResolver
    * @author Бегунов А.В.
    * @public
    * @singleton
    */
   var DependencyResolver = /** @lends Core/DependencyResolver.prototype */{
      _store: {},
      _parents: {},
      /**
       * Метод регистрации зависимостей
       * @param {String} control Имя класса контрола, для которого регистрируются зависимости.
       * @param {Array|Function} dependency Зависимости в виде массива или функции, которая возвращает массив.
       * @param {String} parentsControl Список родителей контрола для вызова резолверов родителей.
       */
      register: function(control, dependency, parentsControl) {
         this._store[control] = dependency;
         this._parents[control] = parentsControl;
      },
      /**
       *
       * @param {String} control Имя класса, для которого требуется выяснить зависимости.
       * @param {Object} [config] Конфиг контрола.
       * @return {Array} Массив зависимостей.
       */
      resolve: function(control, config) {
         var
            result = [],
            components = control.split('/'),
            parents = this._parents[control] ? this._parents[control].split('/') : [];
         while (components.length) {
            this._addDependency(result, components.join('/'), config, true);
            components.pop();
         }

         while (parents.length) {
            this._addDependency(result, parents.pop(), config, true);
         }
         return result.sort();
      },
      /**
       * Добавляет зависимость в массив store, если ее там еще нет.
       * Вычисляет дополнительные зависимости по данным, зарегистрированным через register.
       *
       * @param {Array} store
       * @param {String} dependency
       * @param {Object} [config]
       * @param {Boolean} [excludeSelf] исключает сам переданный класс из результата, по умолчанию == false.
       * @private
       */
      _addDependency: function(store, dependency, config, excludeSelf) {
         var self = this;
         if (store && store.indexOf(dependency) === -1) {
            if (!excludeSelf) {
               store.push(dependency);
            }
            if (this._store[dependency]) {
               var resolved = typeof this._store[dependency] === 'function' ? this._store[dependency](config) : this._store[dependency];
               if (resolved && resolved instanceof Array) {
                  resolved.forEach(function(dep) {
                     self._addDependency(store, dep);
                  });
               }
            }
         }
      }
   };

   return DependencyResolver;
});
