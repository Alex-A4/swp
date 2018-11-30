define('Core/helpers/Date/getPeriodLength', function() {

   return function (start, end) {
      var oneDay = 24*60*60*1000;
      return Math.round(Math.abs((start.getTime() - end.getTime())/(oneDay))) + 1;
   };
});
