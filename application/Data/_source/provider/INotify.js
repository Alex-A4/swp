/// <amd-module name="Data/_source/provider/INotify" />
/**
 * Интерфейс провайдера c доступом к серверным событиям
 * @interface WS.Data/Source/Provider/INotify
 * @public
 * @author Мальцев А.А.
 * @example
 * <pre>
 *    require(['WS.Data/Source/Remote', 'Core/core-instance'], function(RemoteSource, coreInstance) {
 *       //...
 *       if (dataSource instanceof RemoteSource) {
 *          var provider = dataSource.getProvider();
 *          if (coreInstance.instanceOfMixin(provider, 'WS.Data/Source/Provider/INotify') {
 *             provider.getEventsChannel().subscribe('onMessage', function(event, message) {
 *                console.log('A message from the server: ' + message);
 *             });
 *          }
 *       }
 *    });
 * </pre>
 * @example
 * <pre>
 *    dataSource.getProvider().getEventsChannel('ErrorLog').subscribe('onMessage', function(event, message) {
 *       console.error('Something went wrong: ' + message);
 *    });
 * </pre>
 */
define('Data/_source/provider/INotify', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
});