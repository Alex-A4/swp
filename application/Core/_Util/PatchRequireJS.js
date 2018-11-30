/* global define, Object */
define('Core/_Util/PatchRequireJS', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
     * Some patches for RequireJS through official and semi-official API
     * @class Core/_Util/patchRequireJS
     * @author Мальцев А.А.
     */
    /**
     * Some patches for RequireJS through official and semi-official API
     * @class Core/_Util/patchRequireJS
     * @author Мальцев А.А.
     */
    var getInstance = function () {
        var global = function () {
            return this || (0, eval)('this');    // eslint-disable-line no-eval
        }();
        // eslint-disable-line no-eval
        return global.requirejs;
    };    /**
     * Undefines failed modules on error to force RequireJS try again to load them and generate that error
     * @param {Error} err Error instance
     * @param {Function} [require] RequireJS
     */
    /**
     * Undefines failed modules on error to force RequireJS try again to load them and generate that error
     * @param {Error} err Error instance
     * @param {Function} [require] RequireJS
     */
    var undefineFailed = function (err, require) {
        if (arguments.length < 2) {
            require = getInstance();
        }
        if (err.originalError) {
            undefineFailed(err.originalError, require);
        }
        if (require && err.requireModules) {
            err.requireModules.forEach(function (moduleName) {
                require.undef(moduleName);
            });
        }
    };    /**
     * Registers RequireJS errors hook
     * @param {Function} require RequireJS
     */
    /**
     * Registers RequireJS errors hook
     * @param {Function} require RequireJS
     */
    var registerErrorHandler = function (require) {
        require.onError = function (err) {
            undefineFailed(err, require);
            throw err;
        };
    };    /**
     * Stores name of each loaded module in a prototype property with name "_moduleName"
     * @param {Function} require RequireJS
     */
    /**
     * Stores name of each loaded module in a prototype property with name "_moduleName"
     * @param {Function} require RequireJS
     */
    var registerResourceLoadCallback = function (require) {
        // https://github.com/requirejs/requirejs/wiki/Internal-API:-onResourceLoad
        require.onResourceLoad = function (source) {
            var makeFunctionSerializable = function (func, moduleName, path) {
                    func.toJSON = function () {
                        var serialized = {
                            $serialized$: 'func',
                            module: moduleName
                        };
                        if (path) {
                            serialized.path = path;
                        }
                        return serialized;
                    };
                }, makeArraySerializable = function (arr, moduleName, prefix, depth) {
                    var arrLength = arr.length, i;
                    prefix = prefix ? prefix + '.' : '';
                    for (i = 0; i < arrLength; i++) {
                        makeSerializable(depth, arr[i], moduleName, prefix + i);
                    }
                }, makeObjectSerializable = function (obj, moduleName, prefix, depth) {
                    var keys = Object.keys(obj), keysLength = keys.length, prop, i;
                    prefix = prefix ? prefix + '.' : '';
                    for (i = 0; i < keysLength; i++) {
                        prop = keys[i];
                        makeSerializable(depth, obj[prop], moduleName, prefix + prop);
                    }
                },
                /**
             * После require js модуля на все функции навешивается toJSON
             * функции ищутся рекурсивно вглубь объектов.
             * Модуль А: { f1 : function(){} }
             * Модуль В: { K :  {
             *                    someFunction: A.f1
             *                  }
             *            }
             * При require модуля B с зависимостью модулем А сначала toJSON будет вызван для
             * функции f1 от объекта А (при загрузке зависимостей)
             * А при загрузке самого модуля В, toJSON для f1 будет вызван от объекта B.K
             * соответственно правильная ссылка будет потеряна.
             */
                makeSerializable = function (depth, obj, moduleName, prefix) {
                    var _a;
                    if (depth === 0) {
                        return;
                    }
                    depth--;
                    switch (obj && typeof obj) {
                    case 'function':
                        if (!obj.hasOwnProperty('toJSON')) {
                            var moduleNameFromProto = obj.prototype && obj.prototype.hasOwnProperty('_moduleName') && obj.prototype._moduleName;
                            if (moduleNameFromProto) {
                                moduleNameFromProto = String(moduleNameFromProto);
                                if (moduleNameFromProto.indexOf(':') > -1) {
                                    _a = moduleNameFromProto.split(':', 2), moduleName = _a[0], prefix = _a[1];
                                }
                            }
                            makeFunctionSerializable(obj, moduleName, prefix);
                        }
                        if (obj.constructor) {
                            makeObjectSerializable(obj, moduleName, prefix, depth);
                        }
                        break;
                    case 'object':
                        if (Array.isArray(obj)) {
                            makeArraySerializable(obj, moduleName, prefix, depth);
                        } else if (Object.getPrototypeOf(obj) === Object.prototype) {
                            // is plain Object
                            makeObjectSerializable(obj, moduleName, prefix, depth);
                        }
                        break;
                    }
                };
            return function (context, map) {
                var prefix = map.prefix || '';
                if (!prefix || prefix === 'js') {
                    var exports = context.defined[map.id];
                    var moduleName = map.name;
                    if (prefix) {
                        prefix += '!';
                    }
                    if (typeof exports === 'function') {
                        var proto = exports.prototype;
                        if (!proto.hasOwnProperty('_moduleName')) {
                            proto._moduleName = prefix + moduleName;
                        }
                    }
                    makeSerializable(4, exports, prefix + moduleName);
                }
                if (source) {
                    source.apply(this, arguments);
                }
            };
        }(require.onResourceLoad);
    };
    var pathApplied = false;
    var patchRequireJS = function () {
        var require = getInstance();
        if (require && !pathApplied) {
            pathApplied = true;    // Undefine failed modules on server side
            // Undefine failed modules on server side
            if (typeof window === 'undefined') {
                registerErrorHandler(require);
            }
            registerResourceLoadCallback(require);
        }
    };
    patchRequireJS.getInstance = getInstance;
    patchRequireJS.undefineFailed = undefineFailed;
    exports.default = patchRequireJS;
});