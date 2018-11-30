/* global define, Date */
define('Core/helpers/Date/strftime', [
   'Core/helpers/i18n/locales'
], function(
   locales
) {
   'use strict';

   /**
    * Преобразует дату в строку указанного формата
    * @remark
    * Во многом похож на аналог из пхп.
    * <a href="http://php.net/manual/ru/function.strftime.php">http://php.net/manual/ru/function.strftime.php</a>
    *
    * <h2>Параметры функции</h2>
    * <ul>
    *     <li><b>date</b> {Date} Дата.</li>
    *     <li><b>format</b> {String} Формат вывода.</li>
    * </ul>
    * <h2>Возвращает</h2>
    * {String} Дата в указанном формате.
    *
    * Отображение года:
    * <ul>
    *    <li>'%y': Двухзначный порядковый номер года;</li>
    *    <li>'%Y': Четырехзначный номер года;</li>
    *    <li>'%C': Двухзначный порядковый номер столетия (год, делённый на 100, усечённый до целого);</li>
    *    <li>'%g': <b>См. пример 2!</b> Двухзначный номер года в соответствии со стандартом ISO-8601:1988 (см. %V);</li>
    *    <li>'%G': <b>См. пример 2!</b> Полная четырёхзначная версия %g.</li>
    * </ul>
    * Отображение месяца:
    * <ul>
    *    <li>'%b': Аббревиатура названия месяца (Янв);</li>
    *    <li>'%v': Аббревиатура названия месяца со строчной буквы (янв);</li>
    *    <li>'%K': Аббревиатура названия месяца со строчной буквы в родительном падеже(мая, дек);</li>
    *    <li>'%B': Полное название месяца (Январь);</li>
    *    <li>'%f': Полное название месяца со строчной буквы (январь);</li>
    *    <li>'%q': Имя месяца родительном падеже (января);</li>
    *    <li>'%m': Двухзначный порядковый номер месяца (01, 02, ...).</li>
    * </ul>
    * Отображение дня:
    * <ul>
    *    <li>'%d': Двухзначное представление дня месяца (с ведущими нулями) (01, 02, ...);</li>
    *    <li>'%e': День месяца, с ведущим пробелом, если он состоит из одной цифры. ( 1,  2, ...);</li>
    *    <li>'%j': Порядковый номер в году, 3 цифры с ведущими нулями;</li>
    *    <li>'%u': Порядковый номер дня недели согласно стандарту ISO-8601.</li>
    * </ul>
    * Отображение недели и дня недели:
    * <ul>
    *    <li>'%a': Сокращённое название дня недели (Пн, Вт, ...);</li>
    *    <li>'%A': Полное название дня недели (Понедельник, ...);</li>
    *    <li>'%w': Порядковый номер дня недели (0 - воскресенье, 1 - понедельник, ...);</li>
    *    <li>'%U': Порядковый номер недели в указанном году, начиная с первого воскресенья в качестве первой недели;</li>
    *    <li>'%W': Порядковый номер недели в указанном году, начиная с первого понедельника в качестве первой недели;</li>
    *    <li>'%V': <b>См. пример 2!</b> Порядковый номер недели в указанном году в соответствии со стандартом ISO-8601:1988.</li>
    * </ul>
    * Отображение времени:
    * <ul>
    *    <li>'%R': Аналогично '%H:%M' (21:17);</li>
    *    <li>'%T': Аналогично '%H:%M:%S' (21:17:56);</li>
    *    <li>'%H': Двухзначный номер часа в 24-часовом формате;</li>
    *    <li>'%I': Двухзначный номер часа в 12-часовом формате;</li>
    *    <li>'%l': Час в 12-часовом формате, с пробелом перед одиночной цифрой;</li>
    *    <li>'%p': 'AM' или 'PM' в верхнем регистре, в зависимости от указанного времени;</li>
    *    <li>'%P': 'am' или 'pm' в зависимости от указанного времени;</li>
    *    <li>'%M': Двухзначный номер минуты;</li>
    *    <li>'%S': Двухзначный номер секунды;</li>
    *    <li>'%z': Смещение временной зоны относительно UTC либо аббревиатура;</li>
    *    <li>'%Z': Смещение временной зоны/аббревиатура, НЕ выдаваемая опцией %z.</li>
    * </ul>
    * Прочее:
    * <ul>
    *    <li>'%Q': квартал (I, II, ...);</li>
    *    <li>'%E': полугодие (I, II);</li>
    *    <li>'%s': Метка времени Эпохи Unix;</li>
    *    <li>'%%': Символ процента ("%").</li>
    * </ul>
    *
    * <h2>Примеры</h2>
    * 1. Вывод даты.
    * <pre>
    *    require(['Core/helpers/Date/strftime'], function(strftime) {
    *       var date = new Date();
    *       console.log(strftime(date, 'Сегодня %e %q %Y года.'));// Сегодня 16 апреля 2014 года.
    *    });
    * </pre>
    * 2. Про %V, %g и %G.
    * По стандарту ISO-8601:1988 счет недель начинается с той, которая содержит минимум 4 дня текущего года.
    * Неделя начинается с понедельника, даже если он выпал на предыдущий год.
    * <pre>
    *    require(['Core/helpers/Date/strftime'], function(strftime) {
    *       var date = new Date(2013,11,30);
    *       console.log(date.toString());
    *       // Mon Dec 30 2013 00:00:00 GMT+0400 (Московское время (зима))
    *
    *       console.log(strftime(date, 'Дата %d %q %Y года по ISO-8601:1988 выпадает на %V неделю %G года (%G-%V).'));
    *       //Дата 30 декабря 2013 года по ISO-8601:1988 выпадает на 01 неделю 2014 года (2014-01).
    *    });
    * </pre>
    *
    * @class Core/helpers/Date/strftime
    * @public
    * @author Мальцев А.А.
    */

   var _xPad = function(x, pad, r) {
         if (typeof r === 'undefined') {
            r = 10;
         }
         for (; parseInt(x, 10) < r && r > 1; r /= 10) {
            x = ('' + pad) + x;
         }
         return '' + x;
      },
      locale = locales.current,
      leadingZero = '000',
      /* eslint-disable new-cap, no-cap */
      formats = {
         a: function(date) {
            return locale.config.days[date.getDay()];
         },
         A: function(date) {
            return locale.config.longDays[date.getDay()];
         },
         b: function(date) {
            return locale.config.shortMonths[date.getMonth()];
         },
         B: function(date) {
            return locale.config.longMonths[date.getMonth()];
         },
         c: '%a %d %b %Y %r %Z',
         C: function(date) {
            return _xPad(
               parseInt(date.getFullYear() / 100, 10),
               0
            );
         },
         d: function(date) {
            return _xPad(date.getDate(), '0');
         },
         D: '%d/%m/%y',
         e: function(date) {
            return _xPad(date.getDate(), ' ');
         },
         E: function(date) {
            return ['I', 'II'][parseInt(date.getMonth() / 6, 10)];
         },
         f: function(date) {
            return locale.config.longMonthsSmall[date.getMonth()];
         },
         F: '%y-%m-%d',
         g: function(date) {
            return _xPad(
               parseInt(formats.G(date) % 100, 10),
               0
            );
         },
         G: function(date) {
            var y = date.getFullYear(),
               V = parseInt(formats.V(date), 10),
               W = parseInt(formats.W(date), 10);

            if (W > V) {
               y++;
            } else if (W === 0 && V >= 52) {
               y--;
            }

            return y;
         },
         h: '%b',
         H: function(date) {
            return _xPad(date.getHours(), '0');
         },
         i: function(date) {
            return date.getDate();
         },
         I: function(date) {
            var I = date.getHours() % 12;
            return _xPad(I === 0 ? 12 : I, 0);
         },
         j: function(date) {
            var ms = date - new Date('' + date.getFullYear() + '/1/1 GMT');
            ms += date.getTimezoneOffset() * 60000; // Line differs from Yahoo implementation which would be equivalent to replacing it here with:
            var doy = parseInt(ms / 60000 / 60 / 24, 10) + 1;
            return _xPad(doy, 0, 100);
         },
         J: function(date) {
            var ms = date.getMilliseconds().toString();
            return leadingZero.substr(0, 3 - ms.length) + ms;
         },
         k: function(date) {
            return _xPad(date.getHours(), '0');
         },
         K: function(date) {
            return locale.config.monthsSmallWithDays[date.getMonth()];
         },
         l: function(date) {// not in PHP, but implemented here (as in Yahoo)
            var l = date.getHours() % 12;
            return _xPad(l === 0 ? 12 : l, ' ');
         },
         L: function(date) {
            return date.getMilliseconds();
         },
         m: function(date) {
            return _xPad(date.getMonth() + 1, 0);
         },
         M: function(date) {
            return _xPad(date.getMinutes(), '0');
         },
         n: '\n',
         p: function(date) {
            return ['AM', 'PM'][date.getHours() >= 12 ? 1 : 0];
         },
         P: function(date) {
            return ['am', 'pm'][date.getHours() >= 12 ? 1 : 0];
         },
         q: function(date) {
            return locale.config.monthsWithDays[date.getMonth()];
         },
         Q: function(date) {
            return ['I', 'II', 'III', 'IV'][parseInt(date.getMonth() / 3, 10)];
         },
         r: '%I:%M:%S %p',
         R: '%H:%M',
         s: function(date) { // Yahoo uses return parseInt(d.getTime()/1000, 10);
            return Date.parse(date) / 1000;
         },
         S: function(date) {
            return _xPad(date.getSeconds(), '0');
         },
         t: '\t',
         T: '%H:%M:%S',
         u: function(date) {
            var dow = date.getDay();
            return ((dow === 0) ? 7 : dow);
         },
         U: function(date) {
            var doy = parseInt(formats.j(date), 10),
               rdow = 6 - date.getDay(),
               woy = parseInt((doy + rdow) / 7, 10);
            return _xPad(woy, 0);
         },
         v: function(date) {
            var month = date.getMonth();
            return locale.config.monthsSmall[month];
         },
         V: function(date) {
            var woy = parseInt(formats.W(date), 10),
               dowFirstDayOfYear = (new Date('' + date.getFullYear() + '/1/1')).getDay();

            // First week is 01 and not 00 as in the case of %U and %W,
            // so we add 1 to the final result except if day 1 of the year
            // is a Monday (then %W returns 01).
            // We also need to subtract 1 if the day 1 of the year is
            // Friday-Sunday, so the resulting equation becomes:
            var idow = woy + (dowFirstDayOfYear > 4 || dowFirstDayOfYear <= 1 ? 0 : 1);
            if (idow === 53 && (new Date('' + date.getFullYear() + '/12/31')).getDay() < 4) {
               idow = 1;
            } else if (idow === 0) {
               idow = formats.V(new Date('' + (date.getFullYear() - 1) + '/12/31'));
            }
            return _xPad(idow, 0);
         },
         w: function(date) {
            return date.getDay();
         },
         W: function(date) {
            var doy = parseInt(formats.j(date), 10),
               rdow = 7 - formats.u(date),
               woy = parseInt((doy + rdow) / 7, 10);
            return _xPad(woy, 0, 10);
         },
         get x() {
            return locale.config.masks.date;
         },
         get X() {
            return locale.config.masks.sec;
         },
         y: function(date) {
            return _xPad(date.getFullYear() % 100, 0);
         },
         Y: function(date) {
            return date.getFullYear();
         },
         z: function(date) {
            var o = date.getTimezoneOffset(),
               H = _xPad(parseInt(Math.abs(o / 60), 10), 0),
               M = _xPad(o % 60, 0);
            return (o > 0 ? '-' : '+') + H + M;
         },
         Z: function(date) {
            var Z = date.toString().match(/^[^(]+\((.+)\)$/);
            return Z ? Z[1] : '';
         },
         '%': function() {
            return '%';
         }
      },
      /* eslint-enable new-cap, no-cap */
      replaceFormat = function(m0, m1) {
         return formats[m1];
      },
      aggregates = Object.keys(formats).filter(function(key) {
         return typeof formats[key] === 'string';
      }).join(''),
      aggregatesSearch = new RegExp('%[' + aggregates + ']'),
      aggregatesReplace = new RegExp('%([' + aggregates + '])', 'g'),
      generics = Object.keys(formats).filter(function(key) {
         return typeof formats[key] === 'function';
      }).join(''),
      genericsReplace = new RegExp('%([' + generics + '])', 'g');

   /**
    * @function
    * @name Core/helpers/Date/strftime
    * @param {Date} date Дата
    * @param {String} format Формат вывода
    * @return {String} Дата в указанном формате
    */
   var strftime = function(date, format) {
      // First replace aggregates (run in a loop because an agg may be made up of other aggs)
      while (format.match(aggregatesSearch)) {
         format = format.replace(aggregatesReplace, replaceFormat);
      }

      // Now replace formats - we need a closure so that the date object gets passed through
      return format.replace(genericsReplace, function(m0, m1) {
         var f = formats[m1];
         if (typeof f === 'function') {
            return f(date);
         }

         // Shouldn't reach here
         return m1;
      });
   };

   return strftime;
});
