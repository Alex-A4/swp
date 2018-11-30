define('Core/helpers/Date/isISODate', function() {

   /**
    * Проверяет строковое значение даты на соответствие формату ISO 8601.
    * @param {String} value Строковое значение даты.
    * @returns {Boolean} true, если строковое значение даты соответствует формату ISO.
    * @see dateFromISO
    * @see compareDates
    * @see getFormattedDateRange
    */
   return function (value) {
      return /^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*)?)([zZ]|([+\-])(\d\d):?(\d\d))?$/g.test(value);
   };
});
