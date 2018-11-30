define('Core/LicenseManager', function() {
   /**
    * Менеджер работы с лицензией.
    * Класс предназначен для синхронной проверки параметров лицензии пользователя.
    * @public
    * @class Core/LicenseManager
    * @author Бегунов А.В.
    * @singleton
    */

   var LicenseManager = /** @lends Core/LicenseManager.prototype */{
      /**
       * Метод получения параметров лицензии.
       * Работает и на клиенте, и в роутинге при генерации страниц на сервере.
       * @param {String|Array} params Массив идентификаторов параметров лицензии.
       * @returns {Object} Объект со значениями параметров лицензии
       * @example
       * <pre>
       *    LicenseManager.checkLicense(['param0', 'param1', 'param2']);
       * </pre>
       */
      checkLicense: function(params) {
         var license = process && process.domain && process.domain.req && process.domain.req.license || window.userLicense || {};
         var checkLicense = !!Object.keys(license).length;
         var result = {};

         if (!(params instanceof Array)) {
            params = [params];
         }

         for (var i in params) {
            if (params.hasOwnProperty(i)) {
               var param = params[i];
               if (checkLicense) {
                  result[param] = license && license[param] || false;
               } else {
                  result[param] = false;
               }
            }
         }

         return result;
      }
   };

   return LicenseManager;
});