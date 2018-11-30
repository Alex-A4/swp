define('Core/helpers/getVersionedLink', [
], function() {
   /**
    * Возвращает URL с добавленной информацией о версии преложения.
    *
    * <h2>Параметры функции</h2>
    * <ul>
    *     <li><b>link</b> {String} - URL для добавления информации о версии.</li>
    * </ul>
    *
    * <h2>Возвращает</h2>
    * {String} URL с добавленной информацией о версии.
    * @class Core/helpers/getVersionedLink
    * @public
    * @author Мальцев А.А.
    */
   var global = this || (0, eval)('this');// eslint-disable-line no-eval

   return global.wsConfig.getWithVersion;
});
