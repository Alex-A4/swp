define('Core/helpers/getResourceUrl', [
], function() {
   /**
    * Возвращает обработанный URL ресураса с указанием домена и версии.
    *
    * <h2>Параметры функции</h2>
    * <ul>
    *     <li><b>url</b> {String} - URL для обработки.</li>
    * </ul>
    *
    * <h2>Возвращает</h2>
    * {String} обработанный URL.
    * @class Core/helpers/getResourceUrl
    * @public
    * @author Мальцев А.А.
    */
   var global = this || (0, eval)('this');// eslint-disable-line no-eval

   return function getResourceUrl(url) {
      return global.wsConfig.getWithDomain(
         global.wsConfig.getWithSuffix(
            global.wsConfig.getWithVersion(url)
         )
      );
   };
});
