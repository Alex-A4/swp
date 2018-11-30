/*
 * Полифил для безопасной проверки на NaN. В отличие от глобальной функции isNaN(), Number.isNaN() не имеет проблемы
 * принудительного преобразования параметра в число. Это значит, что в него безопасно передавать значения,
 * которые обычно превращаются в NaN, но на самом деле NaN не являются. Также это значит, что метод возвращает true
 * только для числовых значений, имеющих значение NaN.
 * @param {*} value Значение, проверяемое на NaN.
 * @returns {Function}
 * @see https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN
 * @author Мальцев А.А.
 * @example
*/
if (!Number.isNaN) {
   Number.isNaN = function(value) {
      return typeof value === 'number' && isNaN(value);
   };
}