define('Core/helpers/Date/getPeriodLengthInMonthByType', [
   'Core/helpers/Date/periodTypes'
], function(
   periodTypes
) {

   /**
    * Возвращает длинну периода в месяцах по его текстовому представлению
    * @param periodType
    * @returns {number}
    * @see getPeriodType
    */
   return function (periodType) {
      switch (periodType) {
         case periodTypes.month:
            return 1;
         case periodTypes.quarter:
            return 3;
         case periodTypes.halfyear:
            return 6;
         case periodTypes.year:
            return 12;
      }
   };
});
