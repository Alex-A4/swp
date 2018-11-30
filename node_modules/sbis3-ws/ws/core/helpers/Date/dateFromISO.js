define('Core/helpers/Date/dateFromISO', function() {

   /**
    * Преобразует строковое значение даты в формате ISO 8601 в Date.
    * @param {String} value строковое значение даты в формате ISO 8601.
    * @returns {Date|NaN} Date - в случае успешного преобразования, NaN - в противном случае.
    * @see isISODate
    * @see compareDates
    * @see getFormattedDateRange
    */
   return function(value) {
      var
         day,
         tz,
         rx= /^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*)?)([zZ]|([+\-])(\d\d):?(\d\d))?$/,
         p= rx.exec(value) || [];

      if (p[1]) {
         day = p[1].split(/\D/).map(function(itm) {
            return parseInt(itm, 10) || 0;
         });

         day[1] -= 1;
         var secToStr = (day[6] !== undefined ? day[6] + '' : '');

         if (secToStr.length > 3) {
            day[6] = parseInt(secToStr.substr(0,3), 10);
         }

         day= new Date(Date.UTC.apply(Date, day));

         if (!day.getDate()) {
            return NaN;
         }

         if (p[5]) {
            tz= parseInt(p[5], 10)*60;
            if (p[6]) {
               tz += parseInt(p[6], 10);
            }
            if (p[4] === "+") {
               tz *= -1;
            }
            if (tz) {
               day.setUTCMinutes(day.getUTCMinutes() + tz);
            }
         }

         return day;
      }

      return NaN;
   };
});
