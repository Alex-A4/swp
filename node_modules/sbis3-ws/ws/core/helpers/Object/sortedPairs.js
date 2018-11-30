define('Core/helpers/Object/sortedPairs', function() {
   return function sortedPairs(obj, sortByValues) {
      if (typeof window != 'undefined') {
         console.info('Deprecated', 'Core/helpers/Object/sortedPairs помечен как deprecated и будет удален в 3.18');// eslint-disable-line no-console
      }

      var
         keys = Object.keys(obj),
         values = [],
         tempValue,
         comparator = function(a, b) {
            var aFloat = parseFloat(a),
               bFloat = parseFloat(b),
               aNumeric = aFloat + '' === a,
               bNumeric = bFloat + '' === b;
            if (aNumeric && bNumeric) {
               return aFloat > bFloat ? 1 : aFloat < bFloat ? -1 : 0;
            } else if (aNumeric && !bNumeric) {
               return 1;
            } else if (!aNumeric && bNumeric) {
               return -1;
            }
            return a > b ? 1 : a < b ? -1 : 0;
         };

      sortByValues = sortByValues || false;

      for (var i = 0, l = keys.length; i < l; i++) {
         values.push(obj[keys[i]]);
      }

      for (i = values.length - 2; i >= 0; i--) {
         for (var j = 0; j <= i; j++) {
            var what = sortByValues ? values : keys;
            var ret = comparator(what[j + 1], what[j]);
            if (ret < 0) {
               tempValue = values[j];
               values[j] = values[j + 1];
               values[j + 1] = tempValue;

               tempValue = keys[j];
               keys[j] = keys[j + 1];
               keys[j + 1] = tempValue;
            }
         }
      }
      return {keys: keys, values: values};
   };
});
