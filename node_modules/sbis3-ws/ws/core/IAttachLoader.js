define('Core/IAttachLoader', ['Core/core-extend'], function(coreExtend) {
   /**
    * Интерфейс для подключения JS/CSS-файла в контекст документа.
    *
    * @class Core/IAttachLoader
    * @public
    * @author Бегунов А.В.
    */
   return coreExtend({}, /** @lends Core/IAttachLoader.prototype */{
      /**
       * Подключить файл.
       * @param {String} URL URL подключаемого файла.
       * @param {Core/Deferred} resource Deferred, который будет зависеть от загрузки файла.
       * @param {Object} [options] Опции.
       */
      attach: function(URL, resource, options) {
         throw new Error("IAttachLoader::attach method is not implemented");
      }
   });

});