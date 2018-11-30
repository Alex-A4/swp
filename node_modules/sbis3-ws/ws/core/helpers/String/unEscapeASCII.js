define('Core/helpers/String/unEscapeASCII', function() {

    // умеет конвертировать не только ansii символы, но и unicode
   function fixedFromCharCode(codePt) {
      //Код может быть в 16тиричной форме
      if (codePt && codePt.indexOf){
         if (codePt.indexOf('x')===0){
            var trueCode = codePt.split('x')[1];
            codePt = parseInt(trueCode, 16);
         }
      }
      if (codePt > 0xFFFF) {
         codePt -= 0x10000;
         return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
      } else {
         return String.fromCharCode(codePt);
      }
   }

    /**
     * Модуль, в котором описана функция <b>unEscapeASCII(str)</b>, которая производит разэкранирование ASCII символов.
     *
     * @class Core/helpers/String/unEscapeASCII
     * @public
     * @author Мальцев А.А.
     */
    return function (str) {
        if (typeof str == "string") {
            return str.replace(/&#(\w*);?/g, function (str, sub) {
                return fixedFromCharCode(sub);
            });
        } else {
            return str;
        }
    };
});