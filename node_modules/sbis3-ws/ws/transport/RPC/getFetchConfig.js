define("Transport/RPC/getFetchConfig", ["require", "exports", "Transport/RPC/Body", "Transport/RPC/Headers", "Core/constants"], function (require, exports, Body_1, Headers, constants) {
    "use strict";
    var isGetMethod = function (method) {
        if ((typeof window === 'undefined') ||
            !window.cachedMethods ||
            !window.cachedMethods.length) {
            return false;
        }
        return window.cachedMethods.indexOf(method) > -1;
    };
    var canUseGetMethod = function (url) {
        return url.length < 2 * 1024;
    };
    /**
     * Получение параметров вызова Fetch
     * @param {Transport/RPC/Config} config
     * @param {String} config.method RPC метод запроса
     * @param {String} config.url Адрес сер
     * @param {Object} [config.body] Тело запросависа
     * @param {Object} [config.headers] Объект заголовков запроса
     * @param {Boolean} [config.asyncInvoke]
     * @param {Boolean} [config.recent]
     * @param {Boolean} [config.fallback]
     * @return {Partial<FetchConfig>}
     */
    var getFetchConfig = function (_a) {
        var method = _a.method, body = _a.body, url = _a.url, asyncInvoke = _a.asyncInvoke, recent = _a.recent, fallback = _a.fallback, headers = _a.headers;
        var dataUrl = "";
        var isGet = false;
        var httpMethod = 'POST';
        url = url || constants.defaultServiceUrl;
        if (isGetMethod(method)) {
            dataUrl = Body_1.getURL(method, body);
        }
        if (dataUrl && canUseGetMethod(dataUrl)) {
            httpMethod = 'GET';
            isGet = true;
            url += dataUrl;
        }
        return {
            method: httpMethod,
            headers: new Headers({
                method: method, url: url, httpMethod: httpMethod, headers: headers,
                asyncInvoke: asyncInvoke, recent: recent, fallback: fallback
            }),
            body: isGet ? '' : Body_1.getBody(method, body),
            url: url
        };
    };
    return getFetchConfig;
});
