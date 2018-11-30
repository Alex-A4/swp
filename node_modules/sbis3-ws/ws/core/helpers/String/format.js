define('Core/helpers/String/format', [
   'require',
   'Core/defaultRenders'
], function(
   require,
   defaultRenders
) {
   /**
    *
    * Модуль, в котором описана функция <b>format(source, format)</b>, которая строит строку заданного формата (параметр format) по объекту/записи/контексту (параметр source).
    *
    * <h2>Параметры функции</h2>
    * <ul>
    *   <li>t: $имя поля$<b>t</b>$формат даты$ - дата/время, используется формат функции {@link Date#strftime}.</li>
    *   <li>d: $имя поля$<b>d</b>$ - целое число (D - с разделителями).</li>
    *   <li>f: $имя поля$<b>f</b>$[точность$] - вещественное число (F - с разделителями).</li>
    *   <li>s: $имя поля$<b>s</b>$ - прочее, строки, в т.ч. Enum.</li>
    * </ul>
    *
    * <h2>Пример использования</h2>
    * <pre>
    *    require(['Core/helpers/String/format'], function(format) {
    *
    *       //В консоль будет выведена строка 'Сегодня 11 октября 2013 года и курс доллара составляет 1 234.568 рублей.'
    *       console.log(format(
    *          {number:1234.5678, date:new Date()},
    *          'Сегодня $date$t$%e %q %Y года$ и курс доллара составляет $number$F$3$ рублей.'
    *       ));
    *    });
    * </pre>
    *
    * @class Core/helpers/String/format
    * @public
    * @author Мальцев А.А.
    */
   return function format(source, format) {
      /*Если сюда передали rkString а не примитив string*/
      if (typeof format === 'object' && format instanceof String) {
         format = '' + format;
      }
      if (typeof format !== 'string') {
         return '';
      }

      return format.replace(/\$([а-яА-Яa-zA-Z0-9_ .]+)\$(?:([sdD])|([t])\$([\s\S]*?)|([fF])(?:\$([0-9]+))?)\$/g, function (str, m0, m1, m2, m3, m4, m5) {
         var
            field =
               source ? (
                  //todo: убрать завязку на рекорд
                  //подразуменвается что только у рекорда есть hasColumn, утиная типизация
                  source && source.hasColumn && source.hasColumn(m0) ? source.get(m0) :
                     source.getValue && typeof source.getValue === 'function' ? source.getValue(m0) :
                        source[m0]
               ) : null;
         if (m2) {
            m1 = m2;
         }
         if (m4) {
            m1 = m4;
         }
         if (m1 === 't') {
            return field ? field.strftime(m3) : '';
         }
         if (m1 === 'd' || m1 === 'D') {
            return defaultRenders.integer(field, !!(m1 === 'd'));
         }
         if (m1 === 'f' || m1 === 'F') {
            return defaultRenders.real(field, m5 ? m5 : 2, m1 !== 'f');
         }
         //if (m1 === 's')
         var Enum = require.defined('Deprecated/Enum') ? require('Deprecated/Enum') : null;
         if (Enum && (field instanceof Enum)) {
            return defaultRenders.enumType(field);
         } else {
            return field === undefined || field === null ? '' : field;
         }
      });
   };
});
