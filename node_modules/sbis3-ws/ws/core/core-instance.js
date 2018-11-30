define('Core/core-instance', [
   'require'
], function(
   require
) {
   var _requireCache = {},
      _definedCache = {},
      _isNode = typeof window === 'undefined',
      _requireFromCache = function(name) {
         if (_isNode) {
            return require(name);
         }
         return _requireCache[name] || (_requireCache[name] = require(name));
      },
      _definedFromCache = function(name) {
         if (_isNode) {
            return require.defined(name);
         }
         return _definedCache[name] || (_definedCache[name] = require.defined(name));
      },
      _isInheritedFrom = function(inst, moduleName) {
         var proto = Object.getPrototypeOf(inst);
         if (proto) {
            return proto._moduleName === moduleName || _isInheritedFrom(proto, moduleName);
         } else {
            return false;
         }
      },

      /**
       * @class Core/core-instance
       * @public
       * @author Мальцев А.А.
       */
      coreInstance = /** @lends Core/core-instance.prototype */{
          /**
           * Возвращает признак: является ли объект экземпляром класса, с которым производят сравнение.
           * @remark
           * Для корректной работы функции необходимо, чтобы проверяемый модуль декларировал новый класс, а не являлся заглушкой, экспортирующей другой модуль.
           * @param {*} inst Проверяемый объект.
           * @param {String} moduleName Имя модуля, в котором определён класс. Например, SBIS3.CONTROLS.Button.
           * @returns {Boolean} false - модуль не определен.
           * @function
           * @example
           * Проверим экзмемпляр Core/Abstract:
           * <pre>
           *    require(['Core/Abstract', 'Core/core-instance'], function(Abstract, coreInstance) {
           *      var instance = new Abstract();
           *      console.log(coreInstance.instanceOfModule(instance, 'Core/Abstract'));//true
           *    });
           * </pre>
           * Для заглушек работать не будет:
           * <pre>
           *    //Модуль
           *    define('My/Module/SomeNewName', function() {
           *       function SomeNewName () {}
           *       return SomeNewName;
           *    });
           *    //Заглушка для старого имени
           *    define('My/Module/SomeOldName', ['My/Module/SomeNewName'], function(SomeNewName) {
           *       return SomeNewName;
           *    });
           *    //Для заглушки получим false
           *    require(['My/Module/SomeOldName', 'Core/core-instance'], function(SomeModule, coreInstance) {
           *      var instance = new SomeModule();
           *      console.log(coreInstance.instanceOfModule(instance, 'My/Module/SomeOldName'));//false
           *      console.log(coreInstance.instanceOfModule(instance, 'My/Module/SomeNewName'));//true
           *    });
           * </pre>
           */
         instanceOfModule: function(inst, moduleName) {
            //Support fastest check by marker property
            var moduleMarker = '[' + moduleName + ']';
            if (inst && inst[moduleMarker]) {
               return true;
            }

             //Support fast check by _moduleName property in prototypes chain
            if (
               inst &&
               inst._moduleName !== undefined
            ) {
               return _isInheritedFrom(inst, moduleName);
            }

            //Slow check through RequireJS
            var Module;
            if (_definedFromCache(moduleName)) {
               Module = _requireFromCache(moduleName);
               if (Module && inst instanceof Module) {
                  return true;
               }
            }

            return false;
         },

          /**
           * Возвращает признак: является ли объект миксином, с которым производят сравнение.
           * @param {*} inst Проверяемый объект.
           * @param {String} moduleName Имя модуля, в котором определён миксин.
           * @returns {Boolean} false - модуль не определен.
           * @function
           */
         instanceOfMixin: function(inst, mixin) {
            if (!inst || !inst._mixins) {
               return false;
            }

            //Support fast check by marker property
            var mixinMarker = '[' + mixin + ']';
            if (inst[mixinMarker]) {
               return true;
            }

            return _definedFromCache(mixin) ?
               inst._mixins.indexOf(_requireFromCache(mixin)) !== -1 :
               false;
         },

         classOfMixin: function(classFn, mixin) {
            var proto = classFn.prototype;
            return coreInstance.instanceOfMixin(proto, mixin);
         }
      };

   return coreInstance;
});
