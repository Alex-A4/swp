define('Core/UserInfo', [
   'Core/cookie'
], function(
   cookie
) {
   "use strict";
   var SESSION_KEY = "s3su";
   var stored = cookie.get(SESSION_KEY);
   /**
    * Получение информации о текущем пользователе
    * @class Core/UserInfo
    * @public
    * @author Зуев Д.В.
    * @singleton
    */
   var UserInfo = /** @lends Core/UserInfo.prototype */ {
      /**
       * Метод получения значения по ключу
       * @param {String} key Ключ для поиска.
       * @return {String} value Значение
       * @example
       * <pre>
       *    var userName = UserInfo.get('ИмяПользователя');
       *    console.log(userName); // 'Демо Д.'
       * </pre>
       */
      get: function(key) {
         var info = process && process.domain && process.domain.req && process.domain.req.userInfo || typeof window !== 'undefined' && window.userInfo || {};
         return info[key];
      },
      /**
       * Актуальная ли сессия относительно той, которая лежит в cookie
       * @param {String} [session]
       * @return {Boolean}
       */
      isValid: function (session) {
         if (arguments.length === 0) {
            session = stored;
         }
         var current = cookie.get(SESSION_KEY);
         if (!session && !current) {
            return true;
         }
         if (!session || !current) {
            return false;
         }
         return session === current;
      },
      getCurrent: function () {
          return cookie.get(SESSION_KEY);
      }
   };

   return UserInfo;
});
