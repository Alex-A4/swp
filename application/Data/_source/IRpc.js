/// <amd-module name="Data/_source/IRpc" />
/**
 * Интерфейс источника данных, поддерживающего {@link https://en.wikipedia.org/wiki/Remote_procedure_call RPC}.
 *
 * Заставим тигра прыгнуть:
 * <pre>
 *    var dataSource = new RpcSource({
 *       endpoint: 'Tiger'
 *    });
 *    dataSource.call('jump', {height: '3 meters'}).addCallbacks(function(result) {
 *       console.log(result);
 *    }, function(error) {
 *       console.error(error);
 *    });
 * </pre>
 * @interface WS.Data/Source/IRpc
 * @public
 * @author Мальцев А.А.
 */
define('Data/_source/IRpc', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
});