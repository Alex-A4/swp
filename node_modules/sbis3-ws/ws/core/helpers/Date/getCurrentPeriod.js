define('Core/helpers/Date/getCurrentPeriod', [
   'Core/helpers/Date/periodTypes'
], function(
   periodTypes
) {

   /**
    * Возвращает массив содержащий начальную и конечную даты текущего периода включительно
    * @param {String} periodType тип возвращаемого периода:(month, quarter, halfyear, year)
    * <ul>
    *    <li>month: текущий месяц;</li>
    *    <li>quarter: текущий квартал;</li>
    *    <li>halfyear: текущее полугодие;</li>
    *    <li>year: текущий год;</li>
    * </ul>
    * @returns {Array} Массив содержащий даты начала и конца теккущего периода
    */
   return function (periodType) {
      var now = new Date();
      if (periodType === periodTypes.month) {
         return [
            new Date(now.getFullYear(), now.getMonth(), 1),
            new Date(now.getFullYear(), now.getMonth() + 1, 0)
         ];
      } else if (periodType === 'quarter') {
         return [
            new Date(now.getFullYear(), (now.getMonth() / 3 | 0) * 3, 1),
            new Date(now.getFullYear(), (now.getMonth() / 3 | 0) * 3 + 3, 0)
         ];
      } else if (periodType === 'halfyear') {
         return [
            new Date(now.getFullYear(), (now.getMonth() / 6 | 0) * 6, 1),
            new Date(now.getFullYear(), (now.getMonth() / 6 | 0) * 6 + 6, 0)
         ];
      } else if (periodType === 'year') {
         return [
            new Date(now.getFullYear(), 0, 1),
            new Date(now.getFullYear(), 11, 31)
         ];
      }
   };
});
