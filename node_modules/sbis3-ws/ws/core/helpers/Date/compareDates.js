define('Core/helpers/Date/compareDates', function() {

   /**
    * Производит сравнение двух дат без учета времени.
    * @remark
    * В качестве примера, "12.12.2012 13:23:12" и "12.12.2012 14:43:52" равны.
    * @param {Date} date1 Первая дата.
    * @param {Date} date2 Вторая дата.
    * @param {String} sign Тип сравнения дат. Например, " >= " - первая дата больше или равна второй.
    * Доступны значения: "<", "<=", "=", "==", ">=", ">" и "!=".
    * @returns {boolean}
    * @see isISODate
    * @see dateFromISO
    * @see getFormattedDateRange
    */
   return function (date1, sign, date2) {
      if (!date1 || !date2) {
         return false;
      }

      var equal = date1.toSQL() === date2.toSQL();

      switch (sign) {
         case '<':
            return !equal && date1 < date2;
         case '<=':
            return equal || date1 < date2;
         case '=':
            return equal;
         case '==':
            return equal;
         case '>=':
            return equal || date1 > date2;
         case '>':
            return !equal && date1 > date2;
         case '!=':
            return !equal;
         default:
            return false;
      }
   };
});
