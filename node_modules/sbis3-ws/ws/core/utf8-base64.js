define('Core/utf8-base64', ['Core/constants'], function() {
   /**
    * @class Core/utf8-base64
    * @public
    * @author Бегунов А.В.
    */
   return /** @lends Core/utf8-base64.prototype */{
      /**
       * Метод, кодирующий переданные данные в base64
       * @param {String} input.
       * @returns {String} данные в base64.
       */
      encode: function utf8_to_b64(input) {
         //TODO не работает на серверном скрипте
         if (typeof window !='undefined') {
            return window.btoa(unescape(encodeURIComponent(input)));
         } else {
            return unescape(encodeURIComponent(new Buffer(input).toString('base64')));
         }
      },

      /**
       * Декодирует данные из base64
       * @param {String} input.
       * @returns {String} Декодированные данные.
       */
      decode: function b64_to_utf8(input) {
         //TODO не работает на серверном скрипте
         if (typeof window !='undefined') {
            return decodeURIComponent(escape(window.atob(input)));
         } else {
            return unescape(decodeURIComponent(new Buffer(input, 'base64').toString('utf-8')));
         }
      }
   };

});