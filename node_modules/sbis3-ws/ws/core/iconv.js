define('Core/iconv', [], function() {
   /**
    * @class Deprecated/iconv
    * @author Бегунов А.В.
    * @public
    */
   var iconv;

   return iconv = /** @lends Deprecated/iconv.prototype */{
      _CP1251ToUnicode: {
         128: 1026, 129: 1027, 130: 8218, 131: 1107, 132: 8222, 133: 8230, 134: 8224, 135: 8225,
         136: 8364, 137: 8240, 138: 1033, 139: 8249, 140: 1034, 141: 1036, 142: 1035, 143: 1039,
         144: 1106, 145: 8216, 146: 8217, 147: 8220, 148: 8221, 149: 8226, 150: 8211, 151: 8212,
         152: 65533, 153: 8482, 154: 1113, 155: 8250, 156: 1114, 157: 1116, 158: 1115, 159: 1119,
         160: 160, 161: 1038, 162: 1118, 163: 1032, 164: 164, 165: 1168, 166: 166, 167: 167,
         168: 1025, 169: 169, 170: 1028, 171: 171, 172: 172, 173: 173, 174: 174, 175: 1031,
         176: 176, 177: 177, 178: 1030, 179: 1110, 180: 1169, 181: 181, 182: 182, 183: 183,
         184: 1105, 185: 8470, 186: 1108, 187: 187, 188: 1112, 189: 1029, 190: 1109, 191: 1111
      },
      _UnicodeToCP1251: {
         1026: 128, 1027: 129, 8218: 130, 1107: 131, 8222: 132, 8230: 133, 8224: 134, 8225: 135,
         8364: 136, 8240: 137, 1033: 138, 8249: 139, 1034: 140, 1036: 141, 1035: 142, 1039: 143,
         1106: 144, 8216: 145, 8217: 146, 8220: 147, 8221: 148, 8226: 149, 8211: 150, 8212: 151,
         65533: 152, 8482: 153, 1113: 154, 8250: 155, 1114: 156, 1116: 157, 1115: 158, 1119: 159,
         160: 160, 1038: 161, 1118: 162, 1032: 163, 164: 164, 1168: 165, 166: 166, 167: 167,
         1025: 168, 169: 169, 1028: 170, 171: 171, 172: 172, 173: 173, 174: 174, 1031: 175,
         176: 176, 177: 177, 1030: 178, 1110: 179, 1169: 180, 181: 181, 182: 182, 183: 183,
         1105: 184, 8470: 185, 1108: 186, 187: 187, 1112: 188, 1029: 189, 1109: 190, 1111: 191
      },

      /**
       * Конвертирует данные из unicode в win1251
       * @param {String} input Строка в кодировке Unicode (16-bit).
       * @returns {String} Строка в кодировке win1251.
       */
      unicode2win: function(input) {
         var output = "";
         for (var i = 0; i < input.length; i++) {
            var ord = input.charCodeAt(i);
            if (ord < 128) {
               output += String.fromCharCode(ord);
            } else if (ord >= 0x410 && ord <= 0x44f) {
               output += String.fromCharCode(ord - 848);
            } else if (ord in this._UnicodeToCP1251) {
               output += String.fromCharCode(this._UnicodeToCP1251[ord]);
            } else {
               output += "";
            }
         }

         return output;
      },

      /**
       * Конвертирует данные из win1251 в unicode
       * @param {String} input Строка в кодировке win1251.
       * @returns {String} Строка в кодировке Unicode (16-bit).
       */
      win2unicode: function(input) {
         var output = "";
         for (var i = 0; i < input.length; i++) {
            var ord = input.charCodeAt(i);
            if (ord < 128) {
               output += String.fromCharCode(ord);
            } else if (ord >= 192 && ord <= 255) {
               output += String.fromCharCode(ord + 848);
            } else if (ord in this._CP1251ToUnicode) {
               output += String.fromCharCode(this._CP1251ToUnicode[ord]);
            } else {
               output += "";
            }
         }

         return output;
      },

      /**
       * Конвертирует данные из unicode в UTF-8
       * @param {String} input Строка в кодировке Unicode (16-bit).
       * @returns {String} Строка в кодировке UTF-8.
       * @description
       * При кодировании нужно учесть, что UTF-8 однобайтная кодировка,
       * где символы из большого диапазона представлены последовательностью байт.
       * [0x0000–0x007f] - 0xxxxxxx (7 bits, один байт)
       * [0x0080–0x07FF] - 110xxxxx, 10xxxxxx (5+6 bits = 11 bits, 2-х байтная последовательность)
       * [0x0800–0xFFFF] - 1110xxxx, 10xxxxxx, 10xxxxxx (4+6+6 bits = 16 bits, 3-х байтная последовательность)
       * [0x10000–0x10FFFF] - 11110xxx, 10xxxxxx, 10xxxxxx, 10xxxxxx (3+6+6+6 bits = 21 bits, 4-х байтная последовательность)
       * [0x10FFFF-0x1FFFFF] - Неавилдные символы для UTF-8
       * @see http://en.wikipedia.org/wiki/UTF-8#Codepage_layout
       * @see http://phpjs.org/functions/utf8_encode/
       * @see http://www.2ality.com/2013/09/javascript-unicode.html
       */
      unicode2utf: function(input) {
         var output = "";
         //input = input.replace(/\r\n/g,"\n");
         for (var n = 0; n < input.length; n++) {
            var c1 = input.charCodeAt(n);
            if (c1 < 0x80) {
               output += String.fromCharCode(c1);
            } else if (c1 <= 0x7FF) {
               output += String.fromCharCode((c1 >> 6) | 0xC0);
               output += String.fromCharCode((c1 & 0x3F) | 0x80);
            } else if (c1 <= 0xFFFF) {
               output += String.fromCharCode((c1 >> 12) | 0xE0);
               output += String.fromCharCode(((c1 >> 6) & 0x3F) | 0x80);
               output += String.fromCharCode((c1 & 0x3F) | 0x80);
            } else if (c1 <= 0x10FFFF) {
               // surrogate pairs
               if ((c1 & 0xFC00) != 0xD800) {
                  throw new RangeError('Unmatched tail surrogate at ' + n);
               }
               var c2 = input.charCodeAt(++n);
               if ((c2 & 0xFC00) != 0xDC00) {
                  throw new RangeError('Unmatched lead surrogate at ' + (n - 1));
               }
               c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
               output += String.fromCharCode((c1 >> 18) | 0xF0);
               output += String.fromCharCode(((c1 >> 12) & 0x3F) | 0x80);
               output += String.fromCharCode(((c1 >> 6) & 0x3F) | 0x80);
               output += String.fromCharCode((c1 & 0x3F) | 0x80);
            } else {
               throw Error('Invalid Unicode code point');
            }
         }

         return output;
      },

      /**
       * Конвертирует данные из UTF-8 в unicode
       * @param {String} input Строка в кодировке UTF-8.
       * @returns {String} Строка в кодировке Unicode (16-bit).
       * @description
       * По стандартам UTF-8 не требует BOM. Его мы вырежем.
       *
       * При декодировании нужно учесть, что UTF-8 однобайтная кодировка,
       * где символы из большого диапазона представлены последовательностью байт.
       * [0x00-0x7F] - ASCII.
       * [0x80-0xBF] - Байты продолжения последовательности. Могут быть только 2, 3, 4 байтами.
       * [0xC0-0xC1] - Невалидные коды.
       * [0xC2-0xDF] - Начало 2-х байтной последовательности. Второй байт должен жыть байтом продолжением.
       * [0xE0-0xEF] - Начало 3-х байтной последовательности. Второй и третий байт должен жыть байтом продолжением.
       * [0xF0-0xF4] - Начало 4-х байтной последовательности. Второй и третий и четвертый байт должен жыть байтом продолжением.
       * [0xF5-0xFF] - Невалидные коды. Так как в юникодые это коды больше U+10FFFF
       * @see http://en.wikipedia.org/wiki/UTF-8#Codepage_layout
       * @see http://phpjs.org/functions/utf8_decode/
       */
      utf2unicode: function(input) {
         var output = "",
            i = 0, c1 = 0, c2 = 0, c3 = 0, c4 = 0;

         /* remove BOM */
         if (input.substr(0, 3) === 'ï»¿') {
            input = input.substr(3);
         }

         function sequenceError(index, symbol) {
            throw Error('Invalid continuation byte at ' + symbol + ' (index: ' + index + ')');
         }

         while (i < input.length) {
            c1 = input.charCodeAt(i);
            if (c1 < 0x80) {
               output += String.fromCharCode(c1);
               i += 1;
            } else if (c1 < 0xC2) { // continuation or overlong 2-byte sequence
               throw Error('Invalid UTF-8 detected');
            } else if (c1 < 0xE0) { // 2-byte sequence
               c2 = input.charCodeAt(i + 1);
               if ((c2 & 0xC0) != 0x80) sequenceError(i + 1, c2);

               output += String.fromCharCode(((c1 & 0x1F) << 6) | (c2 & 0x3F));
               i += 2;
            } else if (c1 < 0xF0) { // 3-byte sequence
               c2 = input.charCodeAt(i + 1);
               if ((c2 & 0xC0) != 0x80) sequenceError(i + 1, c2);
               if (c1 == 0xE0 && c2 < 0xA0) sequenceError(i + 1, c2); // overlong

               c3 = input.charCodeAt(i + 2);
               if ((c3 & 0xC0) != 0x80) sequenceError(i + 2, c3);

               output += String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6) | (c3 & 0x3F));
               i += 3;
            } else if (c1 < 0xF5) { // 4-byte sequence
               c2 = input.charCodeAt(i + 1);
               if ((c2 & 0xC0) != 0x80) sequenceError(i + 1, c2);
               if (c1 == 0xF0 && c2 < 0x90) sequenceError(i + 1, c2); // overlong
               if (c1 == 0xF4 && c2 >= 0x90) sequenceError(i + 1, c2);  // > U+10FFFF

               c3 = input.charCodeAt(i + 2);
               if ((c3 & 0xC0) != 0x80) sequenceError(i + 2, c3);

               c4 = input.charCodeAt(i + 3);
               if ((c4 & 0xC0) != 0x80) sequenceError(i + 3, c4);

               c1 = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) | ((c3 & 0x3F) << 6) | (c4 & 0x3F);
               c1 -= 0x10000;
               output += String.fromCharCode(0xD800 | ((c1 >> 10) & 0x3FF));
               output += String.fromCharCode(0xDC00 | (c1 & 0x3FF));
               i += 4;
            } else { // > U+10FFFF
               throw Error('Invalid UTF-8 detected');
            }
         }

         return output;
      },

      /**
       * Попытаемся сами определить кодировку
       * @param {String} input - входная строка в неизвестной кодировке
       * @param {Boolean} [encode] - перекодировать. По умолчанию пытаемся в UTF-8. Если не получилось в windows-1251
       * @returns {String}
       */
      autoDetect: function(input, encode) {
         var output;
         if (encode) {
            try {
               output = iconv.unicode2utf(input);
            } catch (e) {
               output = iconv.unicode2win(input);
            }
         } else {
            try {
               var deltaUtf, deltaWin, // Погрешность
                  j, charCode;

               output = iconv.utf2unicode(input);
               // Сначала пытаемся узнать не UTF-8 ли у нас
               for (deltaUtf = 0, j = 0; j < output.length; j++) {
                  charCode = output.charCodeAt(j);
                  // Русские символы в UNICODE
                  if (charCode >= 0x410 && charCode <= 0x44F) {
                     deltaUtf++;
                  }
               }

               // Вполне возможно что строка в UTF-8, но нет кириллицы,
               // но все равно проверим, может есть символы из диаппазона 192-255 кодовой таблицы windows-1251
               for (deltaWin = 0, j = 0; j < input.length; j++) {
                  charCode = input.charCodeAt(j);
                  // Русские символы в windows-1251
                  if (charCode > 0xC0 && charCode < 0xFF) {
                     deltaWin++;
                  }
               }

               // если дельта cp1251 больше, предположим, что строка в windows-1251
               output = deltaUtf >= deltaWin ? output : iconv.win2unicode(input);
            } catch (e) {
               // Если не смогли декодировать из UTF-8, предположим, что это windows-1251
               output = iconv.win2unicode(input);
            }
         }
         return output;
      }
   };

});