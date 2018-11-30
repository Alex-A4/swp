define('Core/core-extend-initializer', [
   'Core/helpers/Object/isPlainObject',
   'Core/helpers/Function/shallowClone',
   'Core/core-merge',
   'Core/property-merge'
], function(
   isPlainObject,
   shallowClone,
   merge,
   propertyMerge
) {
   /**
    * Модуль для работы с инфраструктурой создаваемого экземпляра класса.
    * Основная задача - перенос членов класса, являющихся объектами, с прототипа на экземпляр (разрыв ссылки).
    * @class Core/core-extend-initializer
    * @author Мальцев А.А.
    */

   var storage = [],
      nativeFunc = /"REF\((\d+)\)"/g,
      customType = /"CUSTOMTYPE\((\d+)\)"/g,
      positiveInf = /"\+INF"/g,
      negativeInf = /"\-INF"/g,
      undef = /"UNDEF!"/g,
      isWord = /^[_a-zA-Z][_a-zA-Z0-9]*$/,

      /**
       * Проверяет, что указанное значение не является простым объектом или массивом.
       * @param {*} v Проверяемое значение
       * @return {Boolean}
       */
      isComplicatedObject = function(v) {
         return !!(
            typeof v === 'function' ||
            (v && typeof v === 'object' && !isPlainObject(v) && !Array.isArray(v)))
         ;
      },

      /**
       * Сохраняет значение в хранилище.
       * @param {*} v Сохраняемое значение
       * @return {String} Ключ значения в хранилище
       */
      saveToStorage = function (v) {
         storage[storage.length] = v;
         if (v.prototype && v.prototype.isCustomType) {
            return 'CUSTOMTYPE(' + (storage.length - 1) + ')';
         } else {
            return 'REF(' + (storage.length - 1) + ')';
         }
      },

      /**
       * Заменяет значения, игнорируемые стандартным вызовом JSON.stringify, на специальные сигнатуры.
       * @param {String|Number} k Ключ
       * @param {*} v Значение
       * @return {*} Оригинальное либо преобразованное значение
       */
      replacer = function(k, v) {
         if (v && typeof v === 'object') {
            var copied;
            for (var key in v) {
               if (v.hasOwnProperty(key)) {
                  var value = v[key];
                  if (isComplicatedObject(value)) {
                     copied = copied || shallowClone(v);
                     copied[key] = saveToStorage(value);
                  }
               }
            }
            if (copied) {
               return copied;
            }
         }

         if (v === Infinity) {
            return '+INF';
         } else if (v === -Infinity) {
            return '-INF';
         } else if (!isNaN(Number(k)) && Number(k) >= 0 && v === undefined) {
            // В массивах позволяем передавать undefined
            return 'UNDEF!';
         } else {
            return v;
         }
      },

      /**
       * Генерирует JS-код, создающий значение в контексте экземпляра класса.
       * @param {*} v Значение
       * @param {String|Number} k Ключ
       * @param {Array.<String>} text Ранее сформированный JS-код, в который нужно добавить код для указанного значения
       */
      iterateCallback = function(v, k, text) {
         var stringified;
         if (isComplicatedObject(v)) {
            stringified = '"' + saveToStorage(v) + '"';
         } else {
            stringified = JSON.stringify(v, replacer);
         }
         if (stringified) {
            stringified = stringified.replace(nativeFunc, 'storage[$1]');
            stringified = stringified.replace(customType, 'new storage[$1]()');
            stringified = stringified.replace(positiveInf, 'Infinity');
            stringified = stringified.replace(negativeInf, '-Infinity');
            stringified = stringified.replace(undef, 'undefined');
         }

         if (!isWord.test(k)) {
            k = '["' + k + '"]';
         } else {
            k = '.' + k;
         }

         var isO = isPlainObject(v);
         if (isO) {
            if (stringified === '{}' || stringified === '[]') {
               text.push('this' + k + '= this' + k + ' || ' + stringified + ';');
            } else {
               text.push('compVal = ' + stringified + ';');
               text.push('this' + k + ' !== undefined ? propertyMerge(compVal, this' + k + ') : this' + k + '= compVal;');
            }
         } else {
            text.push('this' + k + '=' + stringified + ';');
         }
      },

      /**
       * Создает функцию, инициализирующую экземпляр класса.
       * @param {Object} declaration Декларация класса
       * @return {Function}
       */
      buildInitializer = function(declaration) {
         var text = ['var compVal;'];
         for (var key in declaration.$protected) {
            if (declaration.$protected.hasOwnProperty(key)) {
               iterateCallback(declaration.$protected[key], key, text);
            }
         }
         return new Function('propertyMerge', 'storage', text.join('\n'));
      },

      /**
       * Расширяет функцию, инициализирующую экземпляр класса, декларацией класса-наслединка
       * @param {Object} base Декларация базового класса
       * @param {Object} extender Декларация класса-наследника
       * @return {Function}
       */
      extendInitializer = function(base, extender) {
         var func;
         extender._initializer = function() {
            if (base && base._initializer) {
               base._initializer.call(this, propertyMerge, storage);
            }
            func = func || buildInitializer(extender);
            func.call(this, propertyMerge, storage);
         };
      },

      /**
       * Вызывает инициалайзер для указанного класса.
       * Возвращает объект, который содержит значения полей и опций по умолчанию для экземпляра заданного класса (тех, что объявлены в секции $protected).
       * @param {Function} ctor Конструктор класса
       * @return {Object} Опции по умолчанию для экземпляра класса: {_var1: 1, var2: 2, _options: {opt1: 1, opt2: 2}}
       */
      callInitializer = function(ctor) {
         var result;
         if (ctor) {
            if (ctor.prototype._initializer) {
               var cfg = {};
               ctor.prototype._initializer.call(cfg, propertyMerge);
               result = cfg;
            } else {
               result = merge(
                  getInstanceOptions(ctor.superclass && ctor.superclass.$constructor),
                  ctor.prototype.$protected && ctor.prototype.$protected._options || {},
                  {clone: true});
            }
         } else {
            result = {};
         }
         return result;
      },

      /**
       * Возвращает набор опций для экземпляра указанного класса.
       * @param {Function} ctor Конструктор класса
       * @param {Object} [options] Опции, переданные в конструктор класса
       * @returns {Object} Опции из цепочки прототипов, объединённые с options
       */
      getInstanceOptions = function (ctor, options) {
         if (ctor) {
            return getInstanceOptionsByDefaults(
               ctor,
               options,
               callInitializer(ctor)
            );
         }
         return {};
      },

      /**
       * Объединяет опции, переданные в конструктор класса (options), с опциями, полученными из цепочки прототипов (defaults._options).
       * Дополнительно к опциям может применяться метод _contentAliasing (может устанавливать опцию content по какой-то другой опции).
       * @param {Function} ctor Конструктор класса
       * @param {Object} options Опции, переданные в конструктор класса
       * @param {Object} defaults Свойства экземпляра, полученные из цепочки прототипов (результат вызова {@link callInitializer})
       * @return {Object} defaults._options + options
       */
      getInstanceOptionsByDefaults = function(ctor, options, defaults) {
         var result = (defaults && defaults._options) || {};
         propertyMerge(options, result);
         if (ctor.prototype._contentAliasing) {
            //result надо давать вторым аргументом в качестве "актуального конфига" - чтобы _contentAliasing мог понять
            //дана ли ему в актуальном конфиге (а не дефолтом в опциях) альяснутая опция, и решить, заменять ли её на опцию content
            result = ctor.prototype._contentAliasing.apply(defaults, [result, result]);
         }
         return result;
      };

   return {
      build: buildInitializer,
      extend: extendInitializer,
      call: callInitializer,
      getInstanceOptions: getInstanceOptions,
      getInstanceOptionsByDefaults: getInstanceOptionsByDefaults
   };
});