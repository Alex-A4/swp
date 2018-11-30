define('Core/_Util/IoC', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
     * IoC контейнер
     * Эта штука позволяет нам конфигурировать, какая конкретная реализация соответствует заданному интерфейсу.
     * Все как во взрослых языках, ога.
     * Это используется например для:
     *    - конфигурирования какой транспорт использовать;
     *    - конфигурирования system-wide логгера.
     *
     * <pre>
     *    ioc.bind('ITransport', 'XHRPostTransport');
     *    ioc.bindSingle('ILogger', 'ConsoleLogger', { ...config...});
     *    ...
     *    ioc.resolve('ITransport', config);
     *    ioc.resolve('ILogger');
     * </pre>
     *
     * @class Core/_Util/IoC
     * @author Бегунов А.В.
     * @public
     * @singleton
     */
    /**
     * IoC контейнер
     * Эта штука позволяет нам конфигурировать, какая конкретная реализация соответствует заданному интерфейсу.
     * Все как во взрослых языках, ога.
     * Это используется например для:
     *    - конфигурирования какой транспорт использовать;
     *    - конфигурирования system-wide логгера.
     *
     * <pre>
     *    ioc.bind('ITransport', 'XHRPostTransport');
     *    ioc.bindSingle('ILogger', 'ConsoleLogger', { ...config...});
     *    ...
     *    ioc.resolve('ITransport', config);
     *    ioc.resolve('ILogger');
     * </pre>
     *
     * @class Core/_Util/IoC
     * @author Бегунов А.В.
     * @public
     * @singleton
     */
    var map = {}, singletons = {};
    function resolveAsFunction(func, config) {
        var result;
        if (func instanceof Function && func.prototype && func.prototype.$constructor) {
            result = new func(config);
        } else {
            result = func(config);
        }
        return result;
    }
    exports.default = {
        /**
         * Привязывает реализацию к интерфейсу.
         *
         * @param {String} interfaceName
         * @param {String|Function} implementationName Имя реализации или функция-резолвер возвращающая экземпляр
         */
        bind: function (interfaceName, implementationName) {
            map[interfaceName] = {
                implementation: implementationName,
                isSingle: 0
            };
        },
        /**
         * Привязывает единственный экземпляр реализации к указанному "интерфейсу"
         *
         * @param {String} interfaceName
         * @param {String} implementationName
         * @param {Object} [config]
         */
        bindSingle: function (interfaceName, implementationName, config) {
            map[interfaceName] = {
                implementation: implementationName,
                isSingle: 1,
                config: config || {}
            };
            singletons[interfaceName] = '';
        },
        /**
         * @param {String} interfaceName
         * @param {Object} [config]
         * @returns {Object}
         * @throws TypeError
         * @throws ReferenceError
         */
        resolve: function (interfaceName, config) {
            if (interfaceName in map) {
                var binding = map[interfaceName], classConstructorName = binding.implementation, isSingleton = binding.isSingle, implementation = void 0;
                if (isSingleton && singletons[interfaceName]) {
                    return singletons[interfaceName];
                }    // resolver mode
                // resolver mode
                if (typeof classConstructorName === 'function') {
                    implementation = classConstructorName;    // TODO костыль для сервиса представления как только они удалять $ws убрать это отсюда
                } else // TODO костыль для сервиса представления как только они удалять $ws убрать это отсюда
                if (typeof window === 'undefined' && require.defined('Core/core-structure')) {
                    var $ws = require('Core/core-structure');
                    if (typeof $ws.proto[classConstructorName] === 'function') {
                        implementation = $ws.proto[classConstructorName];
                    }
                }    /* else {
       
                    console.error('Module:' + interfaceName + '   Constructor' + map[interfaceName].implementation);
                    throw new ReferenceError("No mappings defined forrrrrr " + interfaceName);
                } */
                /* else {
       
                    console.error('Module:' + interfaceName + '   Constructor' + map[interfaceName].implementation);
                    throw new ReferenceError("No mappings defined forrrrrr " + interfaceName);
                } */
                if (implementation) {
                    if (isSingleton) {
                        return singletons[interfaceName] = resolveAsFunction(implementation, binding.config);
                    }
                    return resolveAsFunction(implementation, config);
                }
                return binding.implementation;
            }
            throw new ReferenceError('No mappings defined for ' + interfaceName);
        },
        has: function (interfaceName) {
            return interfaceName in map;
        }
    };
});