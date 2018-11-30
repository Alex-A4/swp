define('View/_Request/Storage', [
    'require',
    'exports',
    'View/_Request/_Storage/Cookie',
    'View/_Request/_Storage/Native',
    'View/_Request/_Storage/Object'
], function (require, exports, Cookie_1, Native_1, Object_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
     * Перечень доступных хранилищ "{@link Core/Request/IStorage}" внутри запроса
     * @name Core/Request/StorageKey
     * @typedef {Enum}
     * @property {String} sessionStorage
     * @property {String} localStorage
     * @property {String} userInfo
     * @property {String} cookie
     * @property {String} object
     */
    /**
     * Перечень доступных хранилищ "{@link Core/Request/IStorage}" внутри запроса
     * @name Core/Request/StorageKey
     * @typedef {Enum}
     * @property {String} sessionStorage
     * @property {String} localStorage
     * @property {String} userInfo
     * @property {String} cookie
     * @property {String} object
     */
    var Key;
    (function (Key) {
        Key['sessionStorage'] = 'sessionStorage';
        Key['localStorage'] = 'localStorage';
        Key['userInfo'] = 'userInfo';
        Key['cookie'] = 'cookie';
        Key['object'] = 'object';
    }(Key = exports.Key || (exports.Key = {})));    /**
     * Создаение экземпляра хранилища {@link Core/Request/IStorage}
     * @param {Core/Request/StorageKey} storage
     * @return {Core/Request/IStorage}
     */
    /**
     * Создаение экземпляра хранилища {@link Core/Request/IStorage}
     * @param {Core/Request/StorageKey} storage
     * @return {Core/Request/IStorage}
     */
    exports.create = function (storage) {
        switch (storage) {
        case Key.sessionStorage: {
                return new Native_1.default(Native_1.StorageType.session);
            }
        case Key.localStorage: {
                return new Native_1.default(Native_1.StorageType.local);
            }
        case Key.cookie: {
                return new Cookie_1.default();
            }
        default: {
                return new Object_1.default();
            }
        }
    };
});