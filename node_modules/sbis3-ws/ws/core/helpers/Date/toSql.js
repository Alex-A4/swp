/* global define, Date */
define('Core/helpers/Date/toSql', [
], function(
) {
   'use strict';

   /**
    * @public
    * @author Мальцев А.А.
    */

   /**
    * @typedef {String} SerializeMode
    * @variant MODE_DATETIME Дата в время
    * @variant MODE_DATE Дата
    * @variant MODE_TIME Время
    *

    /**
    * Режим сериализации: дата и время
    * @constant
    * @name Core/helpers/Date/toSQL#MODE_DATETIME
    */
   var MODE_DATETIME = 'datetime';

   /**
    * Режим сериализации: дата
    * @constant
    * @name Core/helpers/Date/toSQL#MODE_DATE
    */
   var MODE_DATE = 'date';

   /**
    * Режим сериализации: время
    * @constant
    * @name Core/helpers/Date/toSQL#MODE_TIME
    */
   var MODE_TIME = 'time';

   /**
    * Дата и время начала эпохи UNIX
    * @constant
    */
   var UNIX_EPOCH_START = new Date(0);

   /**
    * Приводит объект Date() к строке, содержащей дату в формате SQL.
    * @function
    * @name Core/helpers/Date#toSQL
    * @param {Date} date Дата
    * @param {SerializeMode} [mode=MODE_DATETIME] Режим сериализации.
    * @return {String}
    */
   var toSQL = function(date, mode) {
      mode = mode || MODE_DATETIME;

      var
         year = date.getFullYear(),
         month = date.getMonth() + 1,
         day = date.getDate(),
         hours = date.getHours(),
         minutes = date.getMinutes(),
         seconds = date.getSeconds(),
         milliseconds = date.getMilliseconds(),
         offsetNum = date.getTimezoneOffset(),
         offset = ['+', 0],
         someDig = function(num, dig) { // функция для форматирования чисел с нужным количеством цифр/ведущих нулей
            if (dig === undefined || dig < 2) {
               dig = 2;
            }
            var
               dec = num % 10;
            num -= dec;
            num /= 10;
            return (dig === 2 ? '' + num : someDig(num, dig - 1)) + dec;
         },
         data = '';
      if (mode !== MODE_TIME) {
         data = year + '-' + someDig(month) + '-' + someDig(day);
      }
      if (mode !== MODE_DATE) {
         if (mode === MODE_DATETIME) {
            data += ' ';
         }
         data += someDig(hours) + ':' + someDig(minutes) + ':' + someDig(seconds);
         if (milliseconds) {// выводим милисекунды, если они заданы
            data += '.' + someDig(milliseconds, 3);
         }

         // There is some problem with integer timezone offsets in dates before UNIX epoch (maybe not only these ones)
         // because we'll lose time shift and get wrong result during next fromSql() call. Let's see an example:
         // var dt = new Date(0, 0, 1, 18, 00, 00);
         // console.log(dt);//Mon Jan 01 1900 18:00:00 GMT+0230 (Moscow standard time)
         // console.log(toSql(dt, toSql.MODE_TIME));//18:00:00+02
         // The problem is '+02' because the real shift sholud be '+02.50'
         // We would really deal with it if we use timezone offsets with floating numbers.
         // FIXME: just skip an offset from time-serialized value by now.
         if (mode === MODE_DATETIME || date > UNIX_EPOCH_START) {
            if (offsetNum > 0) {// добавляем указание часового пояса локали
               offset[0] = '-';
            } else {
               offsetNum = -offsetNum;
            }

            //offset[3] = offsetNum % 60;
            offsetNum -= offsetNum % 60;
            offset[1] = offsetNum / 60;
            offset[1] = someDig(offset[1]);

            //offset[3] = someDig(offset[3]);
            data += offset.join('');
         }
      }

      return data;
   };

   toSQL.MODE_DATETIME = MODE_DATETIME;
   toSQL.MODE_DATE = MODE_DATE;
   toSQL.MODE_TIME = MODE_TIME;

   return toSQL;
});
