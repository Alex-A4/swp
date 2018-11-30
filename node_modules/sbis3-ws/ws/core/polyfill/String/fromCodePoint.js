//полифил взят с https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint
if (!String.fromCodePoint) {
   if (typeof window != 'undefined') {
      console.info('Deprecated', 'String.fromCodePoint помечен как deprecated и будет удален в 3.18');// eslint-disable-line no-console
   }

   (function() {
      var defineProperty = (function() {
         // IE 8 поддерживает метод `Object.defineProperty` только на элементах DOM
         try {
            var object = {};
            var $defineProperty = Object.defineProperty;
            var result = $defineProperty(object, object, object) && $defineProperty;
         } catch(error) {}
         return result;
      }());
      var stringFromCharCode = String.fromCharCode;
      var floor = Math.floor;
      var fromCodePoint = function() {
         var MAX_SIZE = 0x4000;
         var codeUnits = [];
         var highSurrogate;
         var lowSurrogate;
         var index = -1;
         var length = arguments.length;
         if (!length) {
            return '';
         }
         var result = '';
         while (++index < length) {
            var codePoint = Number(arguments[index]);
            if (
               !isFinite(codePoint) ||       // `NaN`, `+Infinity` или `-Infinity`
               codePoint < 0 ||              // неверная кодовая точка Юникода
               codePoint > 0x10FFFF ||       // неверная кодовая точка Юникода
               floor(codePoint) != codePoint // не целое число
            ) {
               throw RangeError('Invalid code point: ' + codePoint);
            }
            if (codePoint <= 0xFFFF) { // кодовая точка Базовой многоязыковой плоскости (БМП)
               codeUnits.push(codePoint);
            } else { // Астральная кодовая точка; делим её на суррогатную пару
               // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
               codePoint -= 0x10000;
               highSurrogate = (codePoint >> 10) + 0xD800;
               lowSurrogate = (codePoint % 0x400) + 0xDC00;
               codeUnits.push(highSurrogate, lowSurrogate);
            }
            if (index + 1 == length || codeUnits.length > MAX_SIZE) {
               result += stringFromCharCode.apply(null, codeUnits);
               codeUnits.length = 0;
            }
         }
         return result;
      };
      if (defineProperty) {
         defineProperty(String, 'fromCodePoint', {
            'value': fromCodePoint,
            'configurable': true,
            'writable': true
         });
      } else {
         String.fromCodePoint = fromCodePoint;
      }
   }());
}
