define('Core/helpers/String/diffAt', function() {
   /**
    * Модуль, в котором описана функция <b>diffAt(str1, str2)</b>, которая возвращает позицию (Number), в которой одна строка начинает отличаться от другой.
    * Если переданные строки совпадают, или же аргументы не являются строками, то возвращается -1.
    *
    * <h2>Параметры функции</h2>
    * <ul>
    *    <li>{String} str1 Первая строка.</li>
    *    <li>{String} str2 Вторая строка.</li>
    * </ul>
    *
    * <h2>Пример использования</h2>
    * <pre>
    *    require(['Core/helpers/String/diffAt'], function(diffAt) {
    *
    *       // Возвращается 0
    *       console.log(diffAt('Foo', 'Bar'));
    *
    *       // Возвращается 4
    *       console.log(diffAt('Sometimes', 'Somewhere'));
    *
    *       // Возвращается -1
    *       console.log(diffAt(0, 1));
    *    });
    * </pre>
    *
    * @class Core/helpers/String/diffAt
    * @public
    * @author Мальцев А.А.
    */
   return function diffAt(str1, str2) {
      if (typeof str1 === 'string' && typeof str2 === 'string') {
         for (var i = 0, len = Math.max(str1.length, str2.length); i < len; i++) {
            if (str1[i] !== str2[i]) {
               return i;
            }
         }
      }
      return -1;
   };
});
