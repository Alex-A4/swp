define('View/_Request/_Storage/NodeCookie', [
    'require',
    'exports',
    'tslib'
], function (require, exports, tslib_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var getRequest = function () {
        return process && process.domain && process.domain.req || {};
    };    /**
     * Класс, реализующий интерфейс {@link Core/Request/IStorage},
     * предназначенный для работы с cookie в серверном окружении
     * @class
     * @name View/_Request/_Storage/Cookie
     * @implements Core/Request/IStorage
     * @author Заляев А.В
     */
    /**
     * Класс, реализующий интерфейс {@link Core/Request/IStorage},
     * предназначенный для работы с cookie в серверном окружении
     * @class
     * @name View/_Request/_Storage/Cookie
     * @implements Core/Request/IStorage
     * @author Заляев А.В
     */
    var NodeCookie = /** @class */
    function () {
        function NodeCookie() {
        }
        NodeCookie.prototype.get = function (key) {
            var request = getRequest();
            return request.cookies ? request.cookies[key] : null;
        };
        NodeCookie.prototype.set = function (key, value, options) {
            throw new Error('Set cookie on server is not supported');
            return false;
        };
        NodeCookie.prototype.remove = function (key) {
            this.set(key, null);
        };
        NodeCookie.prototype.getKeys = function () {
            return Object.keys(getRequest().cookies || {});
        };
        NodeCookie.prototype.toObject = function () {
            return tslib_1.__assign({}, getRequest().cookies);
        };
        return NodeCookie;
    }();
    exports.default = NodeCookie;
});