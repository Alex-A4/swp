define("Transport/RPC/Headers", ["require", "exports", "Core/EventBus", "Core/UserInfo", "Core/i18n", "Core/helpers/i18n/transliterate", "Core/base64", "Core/helpers/createGUID"], function (require, exports, EventBus, userInfo, i18n, transliterate, base64, createGUID) {
    "use strict";
    var SAVE_HEADER_NAME = 'X-LastModification';
    /*
     * Кэширование заголовка из ответа от каждого сервиса
     * Необходимо чтобы принимать решение о чтении с реплик БД
     */
    var _cacheHeaders = {};
    EventBus.channel('Transport').subscribe('onResponseSuccess', function (event, xhr, def, url) {
        _cacheHeaders[url] = xhr.getResponseHeader(SAVE_HEADER_NAME) || _cacheHeaders[url];
    });
    var getForHttpMethod = function (httpMethod, url) {
        switch (httpMethod) {
            case 'GET': {
                /*
                 * Необходимо для кэширования на уровне http
                 * для заполнения заголовка ответа VARY
                 */
                var headers = {};
                var s3su = userInfo.getCurrent();
                if (s3su) {
                    var _a = s3su.split('-'), client = _a[0], user = _a[1];
                    headers['X-SbisSessionsID'] = s3su;
                    headers['X-CID'] = client;
                    headers['X-UID'] = user;
                }
                return headers;
            }
            case 'POST': {
                var headers = {};
                if (_cacheHeaders[url]) {
                    headers[SAVE_HEADER_NAME] = _cacheHeaders[url];
                }
                return headers;
            }
            default: {
                return {};
            }
        }
    };
    var getForMethod = function (method) {
        if (!method) {
            return {};
        }
        return {
            'X-CalledMethod': transliterate("" + method),
            'X-OriginalMethodName': base64.encode("" + method),
            'Accept-Language': (i18n.getLang() || 'ru-RU') + ';q=0.8,en-US;q=0.5,en;q=0.3'
        };
    };
    /**
     * @cfg {'POST' | 'GET'} [httpMethod] Метод запроса
     */
    /**
     * @cfg {String} method Имя вызываемого метода БЛ. Значение устанавливается в формате "ИмяОбъекта.ИмяМетода".
     */
    /**
     * @cfg {Boolean} [recent] Признак, по которому чтение данных будет произведено из master-базы.
     */
    /**
     * @cfg {String} url Адрес сервиса
     */
    /**
     * @cfg {Boolean} [asyncInvoke] Устанавливать ли заголовок X-ASYNCINVOKE,
     * который отвечает за автоматическое закрытие соединение сервером,
     * не дожидаясь обработки выполнения метода бизнес логики
     */
    /**
     * @cfg {Boolean} [fallback] Устанавливает признак асинхронного вызова метода без гарантии доставки.
     */
    /**
     * Получение объекта заголовков для вызова метода бизнес-логики
     * @class
     * @name Transport/RPC/Headers
     * @public
     * @author Заляев А.В
     */
    var RPCHeaders = /** @class */ (function () {
        function RPCHeaders(_a) {
            var fallback = _a.fallback, asyncInvoke = _a.asyncInvoke, url = _a.url, recent = _a.recent, method = _a.method, httpMethod = _a.httpMethod, headers = _a.headers;
            if (fallback) {
                this['X-PublishAsyncResponse'] = true;
                this['X-UNIQ-ID'] = createGUID();
            }
            if (asyncInvoke || fallback) {
                this['X-ASYNCINVOKE'] = true;
            }
            if (recent) {
                this['X-RequireRecent'] = true;
            }
            Object.assign(this, getForMethod(method), getForHttpMethod(httpMethod, url), headers);
        }
        /*
         * Необходимо чтобы покрыть функционал Transport/RPCJSON#jsonRpcPreparePacket
         * Если не найдём кто использует можно выпилить и не торчать наружу
         */
        /**
         *
         * @param {String} method
         * @return {Object} headers
         * @method
         * @static
         */
        RPCHeaders.getForMethod = getForMethod;
        return RPCHeaders;
    }());
    return RPCHeaders;
});
