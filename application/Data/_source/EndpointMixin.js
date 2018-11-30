/// <amd-module name="Data/_source/EndpointMixin" />
/**
 * Миксин, позволяющий задавать конечную точку доступа.
 * @mixin WS.Data/Source/EndpointMixin
 * @public
 * @author Мальцев А.А.
 */
define('Data/_source/EndpointMixin', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var EndpointMixin = /** @lends WS.Data/Source/EndpointMixin.prototype */
    {
        '[Data/_source/EndpointMixin]': true,
        /**
         * @cfg {WS.Data/Source/IProvider/Endpoint.typedef[]|String} Конечная точка, обеспечивающая доступ клиента к функциональным возможностям источника данных.
         * @name WS.Data/Source/EndpointMixin#endpoint
         * @remark
         * Можно успользовать сокращенную запись, передав значение в виде строки - в этом случае оно будет интерпретироваться как контракт (endpoint.contract).
         * @see getEndPoint
         * @example
         * Подключаем пользователей через HTTP API:
         * <pre>
         *    var dataSource = new HttpSource({
         *       endpoint: {
         *          address: '/api/',
         *          contract: 'users/'
         *       }
         *    });
         * </pre>
         * Подключаем пользователей через HTTP API с использованием сокращенной нотации:
         * <pre>
         *    var dataSource = new HttpSource({
         *       endpoint: '/users/'
         *    });
         * </pre>
         * Подключаем пользователей через HTTP API с указанием адреса подключения:
         * <pre>
         *    var dataSource = new RpcSource({
         *       endpoint: {
         *          address: '//server.name/api/rpc/',
         *          contract: 'Users'
         *       }
         *    });
         * </pre>
         */
        _$endpoint: null,
        constructor: function (options) {
            this._$endpoint = this._$endpoint || {};
            if (options) {
                //Shortcut support
                if (typeof options.endpoint === 'string') {
                    options.endpoint = { contract: options.endpoint };
                }
                if (options.endpoint instanceof Object) {
                    options.endpoint = Object.assign({}, this._$endpoint, options.endpoint);
                }
            }
        },
        getEndpoint: function () {
            return Object.assign({}, this._$endpoint);
        }
    };
    exports.default = EndpointMixin;
});