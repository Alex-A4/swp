define('Core/_Util/PathResolver', [
    'require',
    'exports',
    'Core/_Util/Constants'
], function (require, exports, Constants_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var
        // Global variables root
        global = function () {
            return this || (0, eval)('this');
        }(), plugins = {
            'js': 0,
            'css': 0,
            'html': 0,
            'tmpl': 0,
            'wml': 0,
            'tmplstr': 0,
            'json': 0,
            'dpack': 0,
            'xml': 0
        }, isRemote = /[a-z]+:\/{2}/i, leadSlash = /^\//, jsExt = /\.js$/, anyModule = /(\w|\.)+(\?.*)?$/, jsModule = /(\w|\.)+\.module\.js(\?.*)?$/, jsModule2 = /(\.module\.js|\.js)(\?.*)?$/;    /**
     * @name Core/pathResolver#resolveModulePath
     * @function
     * @description
     * Возвращает актуальный путь до файла с модулем
     * @param moduleName {String} - имя модуля в оглавлении
     * @returns {string}
     */
    /**
     * @name Core/pathResolver#resolveModulePath
     * @function
     * @description
     * Возвращает актуальный путь до файла с модулем
     * @param moduleName {String} - имя модуля в оглавлении
     * @returns {string}
     */
    function resolveModulePath(moduleName) {
        return [
            moduleName,
            moduleName + '.module.js'
        ].join('/');
    }    /**
     * @name Core/pathResolver#resolveModule
     * @function
     * @description
     * Возвращает путь до модуля по его имени
     * @param {String} name имя модуля
     * @returns {string}
     */
    /**
     * @name Core/pathResolver#resolveModule
     * @function
     * @description
     * Возвращает путь до модуля по его имени
     * @param {String} name имя модуля
     * @returns {string}
     */
    function resolveModule(name, plugin, clearAlias) {
        var path = '', isSplitted = true, checkInJsCoreModules = function (path) {
                if (name in Constants_1.default.jsCoreModules) {
                    path = Constants_1.default.wsRoot + Constants_1.default.jsCoreModules[name];
                }
                return path;
            }, checkInJsModules = function (path) {
                if (name in Constants_1.default.jsModules) {
                    var jsMod = Constants_1.default.jsModules[name];
                    if (jsMod) {
                        if (jsMod.charAt(0) === '/' || isRemote.test(jsMod) || jsMod.charAt(1) === ':') {
                            path = jsMod;
                        } else {
                            path = Constants_1.default.resourceRoot + jsMod;
                        }
                    } else {
                        path = Constants_1.default.resourceRoot + resolveModulePath(name);
                    }
                }
                return path;
            };
        if (isSplitted) {
            path = checkInJsModules(path);
        } else {
            path = checkInJsCoreModules(path);
            if (!path) {
                path = checkInJsModules(path);
            }
        }
        return path;
    }    /**
     * @name Core/pathResolver#resolveComponentPath
     * @function
     * @description
     * Возаращает полный путь до компонента или его ресурсов по принятому короткому пути.
     * @remark
     * Метод может быть использован для определения возможности использовать компонент.
     * @param {String} path Упрощенный путь до ресурсов комопнента. Например, 'SBIS3.CONTROLS/Button/resources/images/process.gif'.
     * @example
     * <pre>
     *    var image = helpers.resolveComponentPath('SBIS3.CONTROLS/Button/resources/images/process.gif');
     * </pre>
     * @function
     * @return {String} Полный путь.
     */
    /**
     * @name Core/pathResolver#resolveComponentPath
     * @function
     * @description
     * Возаращает полный путь до компонента или его ресурсов по принятому короткому пути.
     * @remark
     * Метод может быть использован для определения возможности использовать компонент.
     * @param {String} path Упрощенный путь до ресурсов комопнента. Например, 'SBIS3.CONTROLS/Button/resources/images/process.gif'.
     * @example
     * <pre>
     *    var image = helpers.resolveComponentPath('SBIS3.CONTROLS/Button/resources/images/process.gif');
     * </pre>
     * @function
     * @return {String} Полный путь.
     */
    function resolveComponentPath(path) {
        var pA = path.split('/'), componentName = pA.shift(), relativePath = Constants_1.default.requirejsPaths && Constants_1.default.requirejsPaths[componentName] ? '/' + Constants_1.default.requirejsPaths[componentName] + '/' : resolveModule(componentName).replace(/\/[^\/]*$/, '/');
        if (!relativePath) {
            return '';
        }
        return relativePath + pA.join('/');
    }    /**
     * @name Core/pathResolver#pathResolver
     * @function
     * @description
     * Разрешает пути до наших модулей в зависимости от плагина
     * @param {String} name имя модуля
     * @param {String} plugin плагин
     * @return {String}
     */
    /**
     * @name Core/pathResolver#pathResolver
     * @function
     * @description
     * Разрешает пути до наших модулей в зависимости от плагина
     * @param {String} name имя модуля
     * @param {String} plugin плагин
     * @return {String}
     */
    function pathResolver(name, plugin, clearAlias) {
        var path, ext;
        if (plugin === 'html') {
            ext = '.xhtml';
        } else {
            ext = '.' + plugin;
        }
        if (name.indexOf('/') > -1) {
            var paths = name.split('/'), moduleName = paths.shift();
            path = resolveModule(moduleName, plugin, clearAlias);
            if (path) {
                // TODO Для совместимости новых и старых имён.
                /* При переходе к новым именнам возникла проблема при вложенных ресурсах.
                 Пример:  для модуля tmpl!Cryptography/CertificateView/resources/Physic
                 он строил путь "resources/Cryptography/CertificateView/CertificateView.tmpl", а должен был
                 "resources/Cryptography/CertificateView/resources/Physic.tmpl".
                */
                if (path.search(jsModule) > -1) {
                    path = path.replace(jsModule, paths.join('/') + ext + '$2');
                } else {
                    path = path.replace(anyModule, paths.join('/') + ext + '$2');
                }
            } else {
                var regexp = new RegExp('\\' + ext + '$');
                path = name + (plugin === 'js' || regexp.test(name) ? '' : ext);
            }
        } else {
            path = resolveModule(name, plugin, clearAlias);
            if (!path) {
                throw new Error('Module ' + name + ' is not defined');
            }
            if (plugin !== 'js') {
                path = path.replace(jsModule2, ext + '$2');
            }
        }    // В node.js необходимо передавать пути без лидирующего / и без расширения, тогда модуль ищется относительно baseUrl
        // В node.js необходимо передавать пути без лидирующего / и без расширения, тогда модуль ищется относительно baseUrl
        if (Constants_1.default.isNodePlatform) {
            path = path.replace(leadSlash, '').replace(jsExt, '');
        }
        return path;
    }
    function requirejsPathResolver(name, plugin, clearAlias) {
        if (!(plugin in plugins)) {
            throw new ReferenceError('Plugin ' + plugin + ' is not supported by Core/pathResolver');
        }
        return pathResolver(name, plugin, clearAlias);
    }
    requirejsPathResolver.resolveModulePath = resolveModulePath;
    requirejsPathResolver.resolveModule = resolveModule;
    requirejsPathResolver.resolveComponentPath = resolveComponentPath;    /**
     * @class Core/pathResolver
     * @public
     */
    /**
     * @class Core/pathResolver
     * @public
     */
    exports.default = requirejsPathResolver;
});