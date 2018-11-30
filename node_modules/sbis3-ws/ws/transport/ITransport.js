define('Transport/ITransport', ['Core/core-extend'], function(coreExtend) {
   /**
    * Абстрактный транспорт
    *
    * @class Transport/ITransport
    * @author Бегунов А.В.
    * @public
    */
   var ITransport = coreExtend({}, /** @lends Transport/ITransport.prototype */{
      /**
       * Отправка запроса
       *
       * @param data данные
       * @param {Object} [headers] Заголовки запроса
       * @returns {Core/Deferred}
       */
      execute: function(data, headers) {
         throw new Error("Method not implemented");
      }
   });

   return ITransport;
});