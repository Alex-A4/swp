define('Transport/deserializeURLData', [
   'Core/base64'
], function(
   base64
) {

   /**
    * Переводит строку из base64 в обычную строку.
    * @param {string} serialized
    * @returns {*}
    * @see serializeURLData
    */
   return function (serialized) {
      return JSON.parse(base64.decode(serialized));
   };
});
