define('Core/helpers/createGUID', function () {

   /**
    * Создает "GUID".
    * @remark
    * В кавычках потому, что он не настоящий, только выглядит как GUID. Используется свой аглоритм, не такой как настоящий.
    * @returns {String} "GUID"
    * @see generateURL
    * @see generatePageURL
    * @see randomId
    */
   return function () {
      var
         i = 0, s = 0, pad = new Date().getTime().toString(16);
      pad = '000000000000'.substr(0, 12 - pad.length) + pad;
      var p = function () {
         return (pad.substring(s, s += (i++ % 2 ? 2 : 1)) + (((1 + Math.random()) * 0x10000) | 0).toString(16)).substring(0, 4);
      };
      return (p() + p() + '-' + p() + '-' + p() + '-' + p() + '-' + p() + p() + p());
   };
});
