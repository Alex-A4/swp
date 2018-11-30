define('View/Request', [
    'require',
    'exports',
    'tslib',
    'View/_Request/createDefault',
    'View/_Request/Storage'
], function (require, exports, tslib_1, createDefault_1, Storage_1) {
    'use strict';
    var currentRequest;    /**
     *
     * @class
     * @name IStateReceiver
     * @implements Core/IRequest
     * @public
     * @author Заляев А.В
     * @see Core/Request/IStorage
     * @see Core/Request/ILocation
     * @see Core/Request/IConsole
     * @see Core/Request/ISerializableState
     * @see Core/Request/IStateReceiver
     * @example
     * <h2>Работа с singleton(в рамках одного потока/запроса) хранилищами</h2>
     * <pre>
     *     import CoreRequest = require('Core/Request');
     *     const LAST_ENTRANCE_KEY = 'debug';
     *
     *     let getCurrentRequest = () => CoreRequest.getCurrent();
     *     let getLocalStorage = () => getCurrentRequest().getStorage(CoreRequest.StorageKey.localStorage);
     *
     *     let lastEntrance = getLocalStorage().get(LAST_ENTRANCE_KEY);
     *     if (lastEntrance) {
     *         getCurrentRequest().console.log(`last visit was ${(lastEntrance - Date.now())/1000} second ago`)
     *     }
     *     getLocalStorage().set(LAST_ENTRANCE_KEY, Date.now());
     * </pre>
     * <h2>Сохранение состояния своего компонента при построении на сервере</h2>
     * <pre>
     *     import CoreRequest = require('Core/Request');
     *     import Page = require('MyService/Page'); // implements Core/Request/ISerializableState
     *
     *     let mainPage = new Page({
     *         // ...
     *     });
     *     CoreRequest.getCurrent().stateReceiver.register(mainPage.getUid(), mainPage);
     * </pre>
     */
    /**
     *
     * @class
     * @name IStateReceiver
     * @implements Core/IRequest
     * @public
     * @author Заляев А.В
     * @see Core/Request/IStorage
     * @see Core/Request/ILocation
     * @see Core/Request/IConsole
     * @see Core/Request/ISerializableState
     * @see Core/Request/IStateReceiver
     * @example
     * <h2>Работа с singleton(в рамках одного потока/запроса) хранилищами</h2>
     * <pre>
     *     import CoreRequest = require('Core/Request');
     *     const LAST_ENTRANCE_KEY = 'debug';
     *
     *     let getCurrentRequest = () => CoreRequest.getCurrent();
     *     let getLocalStorage = () => getCurrentRequest().getStorage(CoreRequest.StorageKey.localStorage);
     *
     *     let lastEntrance = getLocalStorage().get(LAST_ENTRANCE_KEY);
     *     if (lastEntrance) {
     *         getCurrentRequest().console.log(`last visit was ${(lastEntrance - Date.now())/1000} second ago`)
     *     }
     *     getLocalStorage().set(LAST_ENTRANCE_KEY, Date.now());
     * </pre>
     * <h2>Сохранение состояния своего компонента при построении на сервере</h2>
     * <pre>
     *     import CoreRequest = require('Core/Request');
     *     import Page = require('MyService/Page'); // implements Core/Request/ISerializableState
     *
     *     let mainPage = new Page({
     *         // ...
     *     });
     *     CoreRequest.getCurrent().stateReceiver.register(mainPage.getUid(), mainPage);
     * </pre>
     */
    var CoreRequest = /** @class */
    function () {
        function CoreRequest(config) {
            var stateReceiver = config.stateReceiver, storageMap = config.storageMap, console = config.console, location = config.location;
            this.stateReceiver = stateReceiver;
            this.__storageMap = tslib_1.__assign({}, storageMap);
            this.console = console;
            this.location = location;
        }    /**
         * Получение хранилища для сохранений данных в рамках запроса.
         * @param {Core/Request/StorageKey} key Тип хранилища
         * @name IStateReceiver#getStorage
         */
        /**
         * Получение хранилища для сохранений данных в рамках запроса.
         * @param {Core/Request/StorageKey} key Тип хранилища
         * @name IStateReceiver#getStorage
         */
        CoreRequest.prototype.getStorage = function (key) {
            if (!this.__storageMap[key]) {
                this.__storageMap[key] = Storage_1.create(Storage_1.Key.object);
            }
            return this.__storageMap[key];
        };    /// region Кандидат на удаление.
              // Нужно чтобы работать с Request без начальной точки входа
        /// region Кандидат на удаление.
        // Нужно чтобы работать с Request без начальной точки входа
        CoreRequest.prototype.setStorage = function (key, storage) {
            if (this.__storageMap[key]) {
                throw new Error('attempt to overwrite used storage "' + key + '"');
            }
            this.__storageMap[key] = storage;
        };
        CoreRequest.prototype.setConsole = function (console) {
            this.console = console;
        };
        CoreRequest.prototype.setLocation = function (location) {
            this.location = location;
        };
        CoreRequest.prototype.setStateReceiver = function (stateReceiver) {
            this.stateReceiver = stateReceiver;
        };    /// endregion Кандидат на удаление.
              /**
         * @param {Core/IRequest} request
         * @static
         * @name Core/Request#setCurrent
         */
        /// endregion Кандидат на удаление.
        /**
         * @param {Core/IRequest} request
         * @static
         * @name Core/Request#setCurrent
         */
        CoreRequest.setCurrent = function (request) {
            currentRequest = request;
        };    /**
         * @return {Core/IRequest}
         * @static
         * @name Core/Request#getCurrent
         */
        /**
         * @return {Core/IRequest}
         * @static
         * @name Core/Request#getCurrent
         */
        CoreRequest.getCurrent = function (request) {
            return currentRequest;
        };    /**
         * @name Core/Request#StorageKey
         * @static
         * @type {Core/Request/StorageKey}
         */
        /**
         * @name Core/Request#StorageKey
         * @static
         * @type {Core/Request/StorageKey}
         */
        CoreRequest.StorageKey = Storage_1.Key;
        return CoreRequest;
    }();    /*
     * Первичная инициализация
     */
    /*
     * Первичная инициализация
     */
    CoreRequest.setCurrent(createDefault_1.default(CoreRequest));
    return CoreRequest;
});