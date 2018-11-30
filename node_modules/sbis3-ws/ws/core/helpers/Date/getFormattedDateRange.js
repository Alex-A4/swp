define('Core/helpers/Date/getFormattedDateRange', [
   'Core/helpers/Date/strftime'
], function(strftime) {

   /**
    * Форматирует значения диапазона дат в строку.
    * @param {Date} startDate Первая дата.
    * @param {Date} endDate Вторая дата.
    * @returns {String} Строковое представление диапазона дат.
    * @see isISODate
    * @see dateFromISO
    * @see compareDates
    */
   return function(startDate, endDate, options) {
      options = options || {};
      options.fullNameOfMonth = typeof options.fullNameOfMonth !== 'undefined' ? options.fullNameOfMonth : false;
      options.contractToMonth = typeof options.contractToMonth !== 'undefined' ? options.contractToMonth : true;
      options.contractToQuarter = typeof options.contractToQuarter !== 'undefined' ? options.contractToQuarter : false;
      options.contractToHalfYear = typeof options.contractToHalfYear !== 'undefined' ? options.contractToHalfYear : false;
      options.contractToYear = typeof options.contractToYear !== 'undefined' ? options.contractToYear : true;
      options.shortYear = typeof options.shortYear !== 'undefined' ? options.shortYear : true;

      var
         fullNameOfMonth = typeof options.fullNameOfMonth !== 'undefined' ? options.fullNameOfMonth : false,
         contractToMonth = typeof options.contractToMonth !== 'undefined' ? options.contractToMonth : false,
         contractToQuarter = typeof options.contractToQuarter !== 'undefined' ? options.contractToQuarter : false,
         contractToHalfYear = typeof options.contractToHalfYear !== 'undefined' ? options.contractToHalfYear : false,
         contractToYear = typeof options.contractToYear !== 'undefined' ? options.contractToYear : true,
         shortYear = typeof options.shortYear !== 'undefined' ? options.shortYear : true,
         emptyPeriodTitle = typeof options.emptyPeriodTitle !== 'undefined' ? options.emptyPeriodTitle : '...',
         lastDay,
         result = "",
         yearMask = shortYear? "'%y": " %Y",
         isSameYear,
         isFullMonth,
         isFullQuarter,
         isFullHalfYear,
         isFullYear,
         isOneDay,
         startDateParts,
         endDateParts;
      // TODO: использовать getPeriodType
      if (startDate && endDate) {
         lastDay = (new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0)).getDate();
         startDateParts = [startDate.getDate(), startDate.getMonth(), startDate.getFullYear(),
            Math.floor(startDate.getMonth()/6), Math.floor(startDate.getMonth()/3)];
         endDateParts = [endDate.getDate(), endDate.getMonth(), endDate.getFullYear(),
            Math.floor(endDate.getMonth()/6), Math.floor(endDate.getMonth()/3)];
         isSameYear = startDateParts[2] === endDateParts[2];
         isFullMonth = startDateParts[0] === 1 && endDateParts[0] === lastDay;
         isFullQuarter = isFullMonth && isSameYear && startDateParts[1]%3 === 0 && (endDateParts[1] + 1)%3 === 0;
         isFullHalfYear = isFullMonth && isSameYear && startDateParts[3] === endDateParts[3] && startDateParts[1]%6 === 0 && (endDateParts[1] + 1)%6 === 0;
         isFullYear = isFullMonth && startDateParts[1] === 0 && endDateParts[1] === 11;
         isOneDay = startDateParts[0] === endDateParts[0] && startDateParts[1] === endDateParts[1] && startDateParts[2] === endDateParts[2];

         if (isFullYear) {
            if (isSameYear) {
               result = strftime(startDate, "%Y");
            } else if (contractToYear) {
               result = strftime(startDate, "%Y") + '-' + strftime(endDate, "%Y");
            } else {
               result = strftime(startDate, "%d.%m.%y") + ' - ' + strftime(endDate, "%d.%m.%y");
            }
         } else if (contractToHalfYear && isFullHalfYear) {
            result = strftime(startDate, "%E полугодие" + yearMask);
         } else if (contractToQuarter && isFullQuarter) {
            if (startDateParts[4] === endDateParts[4]) {
               result = strftime(startDate, "%Q квартал" + yearMask);
            } else {
               result = strftime(startDate, "%Q") + '-' + strftime(endDate, "%Q квартал" + yearMask);
            }
         } else if (isFullMonth) {
            if (isSameYear) {
               if (startDateParts[1] === endDateParts[1]) {
                  result = strftime(startDate, "%B" + yearMask);
               } else {
                  if (contractToMonth) {
                     result = strftime(startDate, '%f') + ' - ' + strftime(endDate, '%f' + yearMask);
                  } else {
                     result = strftime(startDate, '%d.%m.%y') + ' - ' + strftime(endDate, '%d.%m.%y');
                  }
               }
            } else {
               if (contractToMonth) {
                  result = strftime(startDate, '%f' + yearMask) + ' - ' + strftime(endDate, '%f' + yearMask);
               } else {
                  result = strftime(startDate, '%d.%m.%y') + ' - ' + strftime(endDate, '%d.%m.%y');
               }
            }
         } else if (isOneDay) {
            if (fullNameOfMonth) {
               result = strftime(startDate, "%i %q'%y");
            } else {
               result = strftime(startDate, "%d.%m.%y");
            }
         } else {
            result = strftime(startDate, "%d.%m.%y") + ' - ' + strftime(endDate, "%d.%m.%y");
         }
      } else if (startDate) {
         result = strftime(startDate, "%d.%m.%y") + ' - ...';
      } else if (endDate) {
         result = '... - ' + strftime(endDate, "%d.%m.%y");
      } else {
         result = emptyPeriodTitle;
      }
      return result;
   };
});
