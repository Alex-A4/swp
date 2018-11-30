/* global define, Date */
define('Core/helpers/Date/format', [
   'Core/helpers/String/format',
   'Core/helpers/Number/toRoman',
   'Core/helpers/i18n/locales'
], function(
   strformat,
   toRoman,
   locales
) {
   'use strict';

   /**
    * Преобразует дату в строку указанного формата.
    *
    * <h2>Параметры функции</h2>
    * <ul>
    *     <li><b>date</b> {Date} Дата.</li>
    *     <li><b>format</b> {String} Формат вывода.</li>
    * </ul>
    * <h2>Возвращает</h2>
    * {String} Дата в указанном формате.
    *
    * @remark
    * <h2>Доступные константы (следует использовать для вывода дат {@link http://axure.tensor.ru/standarts/v7/%D1%84%D0%BE%D1%80%D0%BC%D0%B0%D1%82%D1%8B_%D0%B4%D0%B0%D1%82_01.html по стандарту} с учетом локализации).</h2>
    * <ul>
    *    <li>FULL_DATE: полная дата, "DD.MM.YY" для "Ru-ru";</li>
    *    <li>FULL_DATE_DOW: полная дата с днем недели, "DD MMMMlo'YY, ddddl" для "Ru-ru";</li>
    *    <li>FULL_DATE_FULL_MONTH: полная дата с полным названием месяца, "DD MMMMlo'YY" для "Ru-ru";</li>
    *    <li>FULL_DATE_FULL_MONTH_FULL_YEAR: полная дата с полным названием месяца и полным годом, "DD MMMMlo YYYY" для "Ru-ru";</li>
    *    <li>FULL_DATE_FULL_YEAR: полная дата с полным годом, "DD.MM.YYYY" для "Ru-ru";</li>
    *    <li>FULL_DATE_SHORT_MONTH: полная дата с кратким названием месяца, "DD MMMl'YY" для "Ru-ru";</li>
    *    <li>FULL_DATE_SHORT_MONTH_FULL_YEAR: полная дата с кратким названием месяца и полным годом, "DD MMMl YYYY" для "Ru-ru";</li>
    *    <li>FULL_DATETIME: полный формат даты и времени, "DD MMM'YY HH:mm" для "Ru-ru";</li>
    *    <li>FULL_HALF_YEAR: полное полугодие и год, "YYYYhr 'YY" для "Ru-ru";</li>
    *    <li>FULL_MONTH: полное название месяца и год, "MMMM'YY" для "Ru-ru";</li>
    *    <li>FULL_QUATER: полный квартал и год, "QQQQr 'YY" для "Ru-ru";</li>
    *    <li>FULL_TIME: полное время, "HH:mm:ss" для "Ru-ru";</li>
    *    <li>SHORT_DATE: краткая дата, "DD.MM" для "Ru-ru";</li>
    *    <li>SHORT_DATE_DOW: краткая дата с днем недели, "DD MMMMlo, ddddl" для "Ru-ru";</li>
    *    <li>SHORT_DATE_FULL_MONTH: краткая дата с полным названием месяца, "DD MMMMlo" для "Ru-ru";</li>
    *    <li>SHORT_DATE_SHORT_MONTH: краткая дата с кратким названием месяца, "DD MMMl" для "Ru-ru";</li>
    *    <li>SHORT_DATETIME: краткий формат даты и времени, "DD MMMl HH:mm" для "Ru-ru";</li>
    *    <li>SHORT_HALF_YEAR: краткое полугодие, "YYhr 'YY" для "Ru-ru";</li>
    *    <li>SHORT_MONTH: краткое название месяца и год, "MMM'YY" для "Ru-ru";</li>
    *    <li>SHORT_QUATER: краткий квартал и год, "QQr 'YY" для "Ru-ru";</li>
    *    <li>SHORT_TIME: краткое время, "HH:mm" для "Ru-ru".</li>
    * </ul>
    *
    * <h2>Примеры использования констант.</h2>
    *
    * Выведем полную дату:
    * <pre>
    *    require(['Core/helpers/Date/format'], function(format) {
    *       var date = new Date(2018, 4, 7);
    *       console.log(format(date, format.FULL_DATE));//07.05.18
    *    });
    * </pre>
    * Выведем полную дату с днем недели:
    * <pre>
    *    require(['Core/helpers/Date/format'], function(format) {
    *       var date = new Date(2018, 4, 7);
    *       console.log(format(date, format.FULL_DATE_DOW));//07 мая'18, понедельник
    *    });
    * </pre>
    *
    * <h2>Доступные маски.</h2>
    * Отображение времени:
    * <ul>
    *    <li>s: секунды;</li>
    *    <li>ss: секунды с лидирующим нулем;</li>
    *    <li>m: минуты;</li>
    *    <li>mm: минуты с лидирующим нулем;</li>
    *    <li>h: часы в 12-часовом формате;</li>
    *    <li>hh: часы в 12-часовом формате с лидирующим нулем;</li>
    *    <li>H: часы в 24-часовом формате;</li>
    *    <li>HH: часы в 24-часовом формате с лидирующим нулем;</li>
    *    <li>a: интервал суток либо до полудня (ante meridiem), либо после полудня (post meridiem) в текущей локали;</li>
    *    <li>SSS: дробная часть секунд (миллисекунды).</li>
    * </ul>
    * Отображение даты:
    * <ul>
    *    <li>D: порядковый номер дня месяца;</li>
    *    <li>DD: порядковый номер дня месяца с лидирующим нулем;</li>
    *    <li>dd: краткое название дня недели в текущей локали с заглавной буквы (например, 'Пн' или 'Mo');</li>
    *    <li>ddl: краткое название дня недели в текущей локали в нижнем регистре (например, 'пн' или 'mo');</li>
    *    <li>ddd: сокращенное название дня недели в текущей локали с заглавной буквы (например, 'Пнд' или 'Mon');</li>
    *    <li>dddl: сокращенное название дня недели в текущей локали в нижнем регистре (например, 'пнд' или 'mon');</li>
    *    <li>dddd: полное название дня недели в текущей локали с заглавной буквы (например, 'Понедельник' или 'Monday');</li>
    *    <li>ddddl: полное название дня недели в текущей локали в нижнем регистре (например, 'понедельник' или 'monday');</li>
    *    <li>M: порядковый номер месяца;</li>
    *    <li>MM: порядковый номер месяца с лидирующим нулем;</li>
    *    <li>MMM: сокращенное название месяца в текущей локали (например, 'Янв' или 'Jan');</li>
    *    <li>MMMl: сокращенное название месяца в текущей локали в нижнем регистре (например, 'янв' или 'jan');</li>
    *    <li>MMMM: полное название месяца в текущей локали (например, 'Январь' или 'January');</li>
    *    <li>MMMMl: полное название месяца в текущей локали в нижнем регистре (например, 'январь' или 'january');</li>
    *    <li>MMMMo: полное название месяца в текущей локали в плюральной форме (например, 'Января' или 'January');</li>
    *    <li>MMMMlo: полное название месяца в текущей локали в плюральной форме и нижнем регистре (например, 'января' или 'january');</li>
    *    <li>Y: двузначный номер года;</li>
    *    <li>YY: двузначный номер года с лидирующим нулем;</li>
    *    <li>YYYY: четырехзначный номер года;</li>
    *    <li>YYhr: номер полугодия в римской нотации и полугодие в текущей локали в краткой форме (например, 'I по' или 'I hy');</li>
    *    <li>YYYYhr: номер полугодия в римской нотации и полугодие в текущей локали в полной форме (например, 'I полугодие' или 'I half year');</li>
    *    <li>QQr: номер квартала в римской нотации и квартал в текущей локали в краткой форме (например, 'I кв' или 'I qt');</li>
    *    <li>QQQr: номер квартала в римской нотации и квартал в текущей локали в сокращенной форме (например, 'I квр' или 'I qtr');</li>
    *    <li>QQQQr: номер квартала в римской нотации и квартал в текущей локали в полной форме (например, 'I квартал' или 'I quarter').</li>
    * </ul>
    *
    * <h2>Примеры использования масок.</h2>
    * Выведем дату:
    * <pre>
    *    require(['Core/helpers/Date/format'], function(format) {
    *       var date = new Date(2018, 4, 7);
    *       console.log(format(date, 'Сегодня ddddl, D MMMMlo YYYY года.'));//Сегодня понедельник, 7 мая 2018 года.
    *    });
    * </pre>
    *
    * Для экранирования вывода следует использовать квадратные скобки:
    * <pre>
    *    require(['Core/helpers/Date/format'], function(format) {
    *       var date = new Date(2018, 4, 7);
    *       console.log(format(date, '[Today is] YYYY/DD/MM'));//Today is 2018/07/05
    *    });
    * </pre>
    *
    * @class Core/helpers/Date/format
    * @public
    * @author Мальцев А.А.
    */

   var tokensRegex;
   var tokens = {};
   var locale = locales.current;

   /**
    * Adds lead zeroes to the Number
    * @param {Number} value Number
    * @param {Number} count Max digits count
    * @return {String} Number with leading zeroes
    */
   function withLeadZeroes(value, count) {
      var absValue = String(Math.abs(value)),
         restCount = count - absValue.length,
         sign = value >= 0 ? '' : '-';
      return sign + (String(Math.pow(
         10,
         Math.max(0, restCount)
      )).substr(1) + absValue);
   }

   /**
    * Returns hour in 12-hours format
    * @param {Date} date Date
    * @return {Number}
    */
   function getTwelveHours(date) {
      return  date.getHours() % 12 || 12;
   }

   /**
    * Returns localized am/pm mark
    * @param {Date} date Date
    * @return {String}
    */
   function getAmPm(date) {
      return date.getHours() >= 12 ? locale.config.pm : locale.config.am;
   }

   /**
    * Returns localized day of week in minimized notation
    * @param {Date} date Date
    * @return {String}
    */
   function getDayOfWeekMin(date) {
      return locale.config.minDays[date.getDay()];
   }

   /**
    * Returns localized day of week in short notation
    * @param {Date} date Date
    * @return {String}
    */
   function getDayOfWeekShort(date) {
      return locale.config.shortDays[date.getDay()];
   }

   /**
    * Returns localized day of week in long notation
    * @param {Date} date Date
    * @return {String}
    */
   function getDayOfWeekLong(date) {
      return locale.config.longDays[date.getDay()];
   }

   /**
    * Returns human-friendly month number
    * @param {Date} date Date
    * @return {Number}
    */
   function getHumanMonth(date) {
      return date.getMonth() + 1;
   }

   /**
    * Returns localized month name in short notation
    * @param {Date} date Date
    * @return {String}
    */
   function getMonthNameShort(date) {
      return locale.config.shortMonths[date.getMonth()];
   }

   /**
    * Returns localized month name in long notation
    * @param {Date} date Date
    * @return {String}
    */
   function getMonthNameLong(date) {
      return locale.config.longMonths[date.getMonth()];
   }

   /**
    * Returns localized month name in ordinal notation
    * @param {Date} date Date
    * @return {String}
    */
   function getMonthOrdinal(date) {
      return locale.config.ordinalMonths[date.getMonth()];
   }

   /**
    * Returns quarter number
    * @param {Date} date Date
    * @return {Number}
    */
   function getQuarter(date) {
      return 1 + Math.floor((date.getMonth()) / 3);
   }

   /**
    * Returns quarter number in roman notation
    * @param {Date} date Date
    * @return {String}
    */
   function getQuarterRoman(date) {
      return toRoman(getQuarter(date));
   }

   /**
    * Returns quarter number in minimized roman notation
    * @param {Date} date Date
    * @return {String}
    */
   function getQuarterRomanMin(date) {
      return strformat(
         {digit: getQuarterRoman(date)},
         locale.config.minQuarter
      );
   }

   /**
    * Returns quarter number in short roman notation
    * @param {Date} date Date
    * @return {String}
    */
   function getQuarterRomanShort(date) {
      return strformat(
         {digit: getQuarterRoman(date)},
         locale.config.shortQuarter
      );
   }

   /**
    * Returns quarter number in long roman notation
    * @param {Date} date Date
    * @return {String}
    */
   function getQuarterRomanLong(date) {
      return strformat(
         {digit: getQuarterRoman(date)},
         locale.config.longQuarter
      );
   }

   /**
    * Returns year number in minimized notation
    * @param {Date} date Date
    * @return {Number}
    */
   function getYearMin(date) {
      return date.getFullYear() % 100;
   }

   /**
    * Returns half a year number (1 or 2)
    * @param {Date} date Date
    * @return {Number}
    */
   function getHalfYear(date) {
      return date.getMonth() < 6 ? 1 : 2;
   }

   /**
    * Returns half a year number in roman notation
    * @param {Date} date Date
    * @return {String}
    */
   function getHalfYearRoman(date) {
      return toRoman(getHalfYear(date));
   }

   /**
    * Returns localized half a year in minimized roman notation
    * @param {Date} date Date
    * @return {String}
    */
   function getHalfYearRomanMin(date) {
      return strformat(
         {digit: getHalfYearRoman(date)},
         locale.config.minHalfYear
      );
   }

   /**
    * Returns localized half a year in long roman notation
    * @param {Date} date Date
    * @return {String}
    */
   function getHalfYearRomanLong(date) {
      return strformat(
         {digit: getHalfYearRoman(date)},
         locale.config.longHalfYear
      );
   }

   /**
    * Returns regular expression to match date tokens in a string
    * @return {RegExp}
    */
   function getTokensRegex() {
      if (tokensRegex) {
         return tokensRegex;
      }

      //More longer must match first
      var expr = Object.keys(tokens).sort(function(a, b) {
         return b.length - a.length;
      });
      tokensRegex = new RegExp('\\[[^\\]]+\\]|(' + expr.join('|') + ')', 'g');

      return tokensRegex;
   }

   /**
    * Adds token to match
    * @param {String} token Token
    * @param {String|Function(Date): String} handler Token handler (for String is the method name in Date.prototype)
    * @param {Object} [options] Options to pass to the handler
    */
   function addToken(token, handler, options) {
      tokens[token] = [handler, options || {}];
      tokensRegex = null;
   }

   /**
    * Formats date with a handler
    * @param {Date} date Date to format
    * @param {String|Function(Date): String} handler Token handler (for String is the method name in Date.prototype)
    * @param {Object} [options] Options to pass to the handler
    * @return {String}
    */
   function formatByToken(date, handler, options) {
      if (typeof handler === 'string') {
         handler = (function(method) {
            return function(date) {
               return date[method]();
            };
         })(handler);
      }

      var result = handler(date);

      if (options.lead) {
         result = withLeadZeroes(result, options.lead);
      }

      if (options.lower) {
         result = result.toLowerCase();
      }

      return result;
   }

   //Time tokens
   addToken('SSS', 'getMilliseconds');
   addToken('s', 'getSeconds');
   addToken('ss', 'getSeconds', {lead: 2});
   addToken('m', 'getMinutes');
   addToken('mm', 'getMinutes', {lead: 2});
   addToken('h', getTwelveHours);
   addToken('hh', getTwelveHours, {lead: 2});
   addToken('H', 'getHours');
   addToken('HH', 'getHours', {lead: 2});
   addToken('a', getAmPm);

   //Date tokens
   addToken('D', 'getDate');
   addToken('DD', 'getDate', {lead: 2});
   addToken('dd', getDayOfWeekMin);
   addToken('ddl', getDayOfWeekMin, {lower: true});
   addToken('ddd', getDayOfWeekShort);
   addToken('dddl', getDayOfWeekShort, {lower: true});
   addToken('dddd', getDayOfWeekLong);
   addToken('ddddl', getDayOfWeekLong, {lower: true});
   addToken('M', getHumanMonth);
   addToken('MM', getHumanMonth, {lead: 2});
   addToken('MMM', getMonthNameShort);
   addToken('MMMl', getMonthNameShort, {lower: true});
   addToken('MMMM', getMonthNameLong);
   addToken('MMMMl', getMonthNameLong, {lower: true});
   addToken('MMMMo', getMonthOrdinal);
   addToken('MMMMlo', getMonthOrdinal, {lower: true});
   addToken('Y', getYearMin);
   addToken('Yh', getHalfYear);
   addToken('YY', getYearMin, {lead: 2});
   addToken('YYhr', getHalfYearRomanMin);
   addToken('YYYY', 'getFullYear');
   addToken('YYYYhr', getHalfYearRomanLong);
   addToken('Q', getQuarter);
   addToken('QQr', getQuarterRomanMin);
   addToken('QQQr', getQuarterRomanShort);
   addToken('QQQQr', getQuarterRomanLong);

   /**
    * Formats Date
    * @param {Date} date Date to format
    * @param {String} format Format string
    * @return {String} Date as string
    */
   var format = function(date, format) {
      return String(format).replace(getTokensRegex(), function(token) {
         //Check if to be escaped
         if (token[0] === '[' && token[token.length - 1] === ']') {
            return token.substr(1, token.length - 2);
         }

         return formatByToken(date, tokens[token][0], tokens[token][1]);
      });
   };

   /**
    * Constants with predefined formats
    */
   Object.assign(format, {
      get FULL_DATE_DOW() {
         return locale.config.fullDateDayOfWeekFormat;
      },
      get FULL_DATE() {
         return locale.config.fullDateFormat;
      },
      get FULL_DATE_FULL_MONTH() {
         return locale.config.fullDateFullMonthFormat;
      },
      get FULL_DATE_FULL_MONTH_FULL_YEAR() {
         return locale.config.fullDateFullMonthFullYearFormat;
      },
      get FULL_DATE_FULL_YEAR() {
         return locale.config.fullDateFullYearFormat;
      },
      get FULL_DATE_SHORT_MONTH() {
         return locale.config.fullDateShortMonthFormat;
      },
      get FULL_DATE_SHORT_MONTH_FULL_YEAR() {
         return locale.config.fullDateShortMonthFullYearFormat;
      },
      get FULL_DATETIME() {
         return locale.config.fullDateShortMonthFormat + ' ' + locale.config.shortTimeFormat;
      },
      get FULL_HALF_YEAR() {
         return locale.config.fullHalfYearFormat;
      },
      get FULL_MONTH() {
         return locale.config.fullMonthFormat;
      },
      get FULL_QUATER() {
         return locale.config.fullQuarterFormat;
      },
      get FULL_TIME() {
         return locale.config.fullTimeFormat;
      },
      get SHORT_DATE_DOW() {
         return locale.config.shortDateDayOfWeekFormat;
      },
      get SHORT_DATE() {
         return locale.config.shortDateFormat;
      },
      get SHORT_DATE_FULL_MONTH() {
         return locale.config.shortDateFullMonthFormat;
      },
      get SHORT_DATE_SHORT_MONTH() {
         return locale.config.shortDateShortMonthFormat;
      },
      get SHORT_DATETIME() {
         return locale.config.shortDateShortMonthFormat + ' ' + locale.config.shortTimeFormat;
      },
      get SHORT_HALF_YEAR() {
         return locale.config.shortHalfYearFormat;
      },
      get SHORT_MONTH() {
         return locale.config.shortMonthFormat;
      },
      get SHORT_QUATER() {
         return locale.config.shortQuarterFormat;
      },
      get SHORT_TIME() {
         return locale.config.shortTimeFormat;
      }
   });

   return format;
});
