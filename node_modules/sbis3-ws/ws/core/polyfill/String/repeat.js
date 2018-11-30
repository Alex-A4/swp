//полифил взят с https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/String/repeat
if (!String.prototype.repeat) {
   String.prototype.repeat = function(count) {
      if (this == null) {
         throw new TypeError('can\'t convert ' + this + ' to object');
      }
      var str = '' + this;
      count = +count;
      if (count != count) {
         count = 0;
      }
      if (count < 0) {
         throw new RangeError('repeat count must be non-negative');
      }
      if (count == Infinity) {
         throw new RangeError('repeat count must be less than infinity');
      }
      count = Math.floor(count);
      if (str.length == 0 || count == 0) {
         return '';
      }

      // Обеспечение того, что count является 31-битным целым числом, позволяет нам значительно
      // соптимизировать главную часть функции. Впрочем, большинство современных (на август
      // 2014 года) браузеров не обрабатывают строки, длиннее 1 << 28 символов, так что:
      if (str.length * count >= 1 << 28) {
         throw new RangeError('repeat count must not overflow maximum string size');
      }
      var rpt = '';
      for (var i = 0; i < count; i++) {
         rpt += str;
      }
      return rpt;
   };
}
