define('Transport/serializeURLData', [
   'Core/base64'
], function(
   base64
) {

   /**
    * Переводит строку адреса в строку base64.
    * @param {string} data Строка адреса.
    * @returns {String}
    * @see deserializeURLData
    */
   return function (data) {
      //Determinate order of plain object properties
      if (data instanceof Object && Object.getPrototypeOf(data) === Object.prototype) {
         data = Object.keys(data)
            .sort()
            .reduce(function(memo, key) {
               memo[key] = data[key];
               return memo;
            }, {});
      }

      // undefined должен обрабатываться как пустая строка, иначе stringify выдаёт undefined, и всё ломается
      var stringified = JSON.stringify(data === undefined ? '' : data);

      // Если это IE8 или мало ли какой паразит, то преобразуем в UTF-8
      if (stringified.indexOf("\\u") !== -1) {
         stringified = unescape(stringified.replace(/\\u/g, '%u'));
      }
      return base64.encode(stringified);
   };
});
