define('Transport/getRpcInvocationUrl', [
   'Core/constants',
   'Transport/serializeURLData'
], function(
   constants,
   serializeURLData
) {
   'use strict';

   var NAME_SEPARATOR = '.';

   /**
    * Возвращает URL для вызова метода БЛ через HTTP GET.
    * <h2>Параметры функции</h2>
    * <ul>
    *     <li><b>object</b> {String} - Имя объекта БЛ.</li>
    *     <li><b>method</b> {String} - Название метода объекта БЛ.</li>
    *     <li><b>args</b> {Object} - Аргументы метода.</li>
    *     <li><b>[options]</b> {Object} - Дополнительные настройки:
    *        <ul>
    *           <li><b>[url]</b> {String} - Точка входа на БЛ, по умолчанию Core/constants:defaultServiceUrl.</li>
    *           <li><b>[id]</b> {Number} - Идентификатор запроса JSON-RPC, по умолчанию 0.</li>
    *        </ul>
    *     </li>
    * </ul>
    *
    * <h2>Возвращает</h2>
    * {String} URL вызова метода.
    * @class Transport/getRpcInvocationUrl
    * @public
    * @author Мальцев А.А.
    */
   return function getRpcInvocationUrl (object, method, args, options) {
      var options = options || {},
         id = options.id || 0,
         baseUrl = options.url || constants.defaultServiceUrl,
         methodName = object + NAME_SEPARATOR + method;

      return baseUrl +
         '?id=' + encodeURIComponent(id) +
         '&method=' + encodeURIComponent(methodName) +
         '&protocol=' + encodeURIComponent(constants.JSONRPC_PROOTOCOL_VERSION) +
         '&params=' + encodeURIComponent(serializeURLData(args || {}));
   };
});
