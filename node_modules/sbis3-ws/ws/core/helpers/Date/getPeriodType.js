define('Core/helpers/Date/getPeriodType', [
   'Core/helpers/Date/periodTypes'
], function(
   periodTypes
) {

   /**
    * Возвращает тип периода по переданным датам его начала и конца.
    *
    * @param {Date} startDate - первая дата
    * @param {Date} endDate - вторая дата
    * @returns {String} Строковое представление типа периода:
    *  <ul>
    *    <li>years: несколько лет;</li>
    *    <li>year: один год;</li>
    *    <li>halfyears_different_years: несколько полугодий включающие разные года;</li>
    *    <li>halfyear: одно полугодие;</li>
    *    <li>quarters: несколько кварталов в рамках 1 года;</li>
    *    <li>quarters_different_years: несколько кварталов в рамках нескольких лет;</li>
    *    <li>quarter: один квартал;</li>
    *    <li>months: несколько месяцев в рамках 1 года;</li>
    *    <li>months_different_years: несколько месяцев в рамках несколькиз лет;</li>
    *    <li>month: одно месяц;</li>
    *    <li>day: один день;</li>
    * </ul>
    */
   return function (startDate, endDate) {
      var
         lastDay,
         isSameYear,
         isFullMonth,
         isFullQuarter,
         isFullHalfYear,
         isFullYear,
         isOneDay,
         startDateParts,
         endDateParts;

      lastDay = (new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0)).getDate();
      startDateParts = [startDate.getDate(), startDate.getMonth(), startDate.getFullYear(),
         Math.floor(startDate.getMonth()/6), Math.floor(startDate.getMonth()/3)];
      endDateParts = [endDate.getDate(), endDate.getMonth(), endDate.getFullYear(),
         Math.floor(endDate.getMonth()/6), Math.floor(endDate.getMonth()/3)];
      isSameYear = startDateParts[2] === endDateParts[2];
      isFullMonth = startDateParts[0] === 1 && endDateParts[0] === lastDay;
      isFullQuarter = isFullMonth && startDateParts[1]%3 === 0 && (endDateParts[1] + 1)%3 === 0;
      isFullHalfYear = isFullMonth && startDateParts[1]%6 === 0 && (endDateParts[1] + 1)%6 === 0;
      isFullYear = isFullMonth && startDateParts[1] === 0 && endDateParts[1] === 11;
      isOneDay = startDateParts[0] === endDateParts[0] && startDateParts[1] === endDateParts[1] && startDateParts[2] === endDateParts[2];

      // TODO: Вынести куда нибудь возвращаемые константы
      if (isFullYear) {
         if (isSameYear) {
            return periodTypes.year;
         } else {
            return periodTypes.years;
         }
      } else if (isFullHalfYear) {
         if (isSameYear) {
            if (startDateParts[3] === endDateParts[3]) {
               return periodTypes.halfyear;
            } else {
               return periodTypes.halfyears;
            }
         } else {
            return periodTypes.halfyears_different_years;
         }
      } else if (isFullQuarter) {
         if (isSameYear) {
            if (startDateParts[4] === endDateParts[4]) {
               return periodTypes.quarter;
            } else {
               return periodTypes.quarters;
            }
         } else {
            return periodTypes.quarters_different_years;
         }
      } else if (isFullMonth) {
         if (isSameYear) {
            if (startDateParts[1] === endDateParts[1]) {
               return periodTypes.month;
            } else {
               return periodTypes.months;
            }
         } else {
            return periodTypes.months_different_years;
         }
      } else if (isOneDay) {
         return periodTypes.day;
      }
   };
});
