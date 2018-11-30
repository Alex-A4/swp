define('Core/base64', ['Core/iconv'], function(iconv) {
   /**
    * @class Deprecated/base64
    * @public
    * @author Бегунов А.В.
    */
   return /** @lends Deprecated/base64.prototype */{
      _keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
      utf8: 'UTF-8',
      win1251: 'WINDOWS-1251',
      auto: 'AUTO',
      noConvert: 'NOCONVERT',

      /**
       * Метод, кодирующий переданные данные в base64
       * @param {String} input.
       * @param {String} [format="UTF-8"] кодировка, в которую будет переведен текст.
       * Возможные значения: UTF-8|WINDOWS-1251|AUTO|NOCONVERT
       * @returns {String} данные в base64.
       */
      encode: function(input, format) {
         var output;
         format = !format || typeof format !== 'string' ? this.utf8 : format.toUpperCase();
         if (format === this.utf8) {
            input = iconv.unicode2utf(input);
         } else if (format === this.win1251) {
            input = iconv.unicode2win(input);
         } else if (format === this.auto) {
            input = iconv.autoDetect(input, true);
         } else if (format === this.noConvert) {
            // ничего не делаем
         } else {
            input = encodeURIComponent(input);
         }

         if (typeof btoa !== 'function' || format === this.noConvert) {
            output = this._encode(input);
         } else {
            output = btoa(input);
         }

         return output;
      },

      /**
       * Декодирует данные из base64
       * @param {String} input.
       * @param {String} [format="UTF-8"] кодировка, из которой будет переведен текст.
       * Возможные значения: UTF-8|WINDOWS-1251|AUTO|NOCONVERT
       * @returns {String} Декодированные данные.
       */
      decode: function(input, format) {
         var output;

         input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

         if (typeof atob !== 'function') {
            output = this._decode(input);
         } else {
            output = atob(input);
         }

         // Попытка определить кодировку, медленно
         format = !format || typeof format !== 'string' ? this.utf8 : format.toUpperCase();
         if (format === this.utf8) {
            output = iconv.utf2unicode(output);
         } else if (format === this.win1251) {
            output = iconv.win2unicode(output);
         } else if (format === this.auto) {
            output = iconv.autoDetect(output);
         } else if (format === this.noConvert) {
            // ничего не делаем
         } else {
            output = decodeURIComponent(output);
         }

         return output;
      },

      /**
       * Кодирование в base64 средствами JS
       * @param {String} input
       * @returns {String}
       * @private
       */
      _encode: function(input) {
         var output = "",
            i = 0,
            chr1, chr2, chr3,
            enc1, enc2, enc3, enc4;

         while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
               enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
               enc4 = 64;
            }

            output = output +
                     this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                     this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
         }

         return output;
      },

      /**
       * Декодирование из base64 средствами JS
       * @param input
       * @returns {String}
       * @private
       */
      _decode: function(input) {
         var output = '',
            i = 0,
            chr1, chr2, chr3,
            enc1, enc2, enc3, enc4;

         while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
               output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
               output = output + String.fromCharCode(chr3);
            }
         }
         return output;
      }
   };

});