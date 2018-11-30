/**
 * Рекрусивно объединяет два объекта опций.
 * @param {Object} source Объект-источник. Все его опции, которых еще нет в target, будут записаны в target.
 * @param {Object} target Объект-приемник. В него будут добавлены недостающие опции из source.
 * @author Мальцев А.А.
 */
define('Core/property-merge', [], function() {
   var toS = Object.prototype.toString;

   return function wsPropertyMerge(source, target) {
      /**
       * При конструировании source это конфиг, переданный в new, target - this._options
       * Если есть _goUp это сконструированный класс ферймворка
       */
      for (var prop in source) {
         if (source.hasOwnProperty(prop)) {
            if (!target){
               /**
                * Если наследник хочет переопределить поле null объектом
                * Нужно сначала определить объект
                */
               target = {};
            }
            if (prop in target) {
               if (typeof source[prop] == 'object') {
                  if (toS.call(source[prop]) == '[object Object]' && source[prop]) {
                     if (!('_goUp' in source[prop]) && Object.getPrototypeOf(source[prop]) === Object.prototype) {
                        if (toS.call(target[prop]) == '[object Object]' && target[prop]) {
                           if (!('_goUp' in target[prop]) && Object.getPrototypeOf(target[prop]) === Object.prototype) {
                              wsPropertyMerge(source[prop], target[prop]);
                           } else {
                              if ('isCustomType' in target[prop]) {
                                 target[prop].updateProperties(source[prop]);
                              } else {
                                 target[prop] = source[prop];
                              }
                           }
                        } else {
                           target[prop] = source[prop];
                        }
                     } else {
                        target[prop] = source[prop];
                     }
                  } else {
                     target[prop] = source[prop];
                  }
               } else if (toS.call(target[prop]) == '[object Object]' && target[prop] && ('isCustomType' in target[prop])) {
                  // Пропускаем параметр, ничего не присваиваем. Оставим дефолтное значение
                  // Просто любой CustomType может иметь несколько обязательныйх свойств
               } else {
                  target[prop] = source[prop];
               }
            } else {
               target[prop] = source[prop];
            }
         }
      }
   };
});