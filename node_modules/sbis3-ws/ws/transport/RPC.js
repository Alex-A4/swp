define("Transport/RPC", ["require", "exports", "Transport/sbis", "Transport/_utils", "Transport/RPC/Body", "Transport/RPC/ErrorCreator", "Core/EventBus", "Transport/RPC/getFetchConfig", "Transport/Errors"], function (require, exports, sbisTransport, _utils_1, Body_1, ErrorCreator, EventBus, getFetchConfig, Errors_1) {
    "use strict";
    var getGlobalChannel = function () { return EventBus.globalChannel(); };
    var getErrorChannel = function () { return EventBus.channel('errors'); };
    /**
     * Транспорт для вызова методов бизнес-логики в формате json-rpc.
     * @param {Object} config
     * @param {String} config.method Метод бизнес-логики
     * @param {*} [config.body] Тело запроса
     * @param {Object} [config.headers] Дополнительные заголовки запроса
     * @param {String} [config.url] Адрес сервиса
     * @param {Boolean} [config.asyncInvoke] Устанавливать ли заголовок X-ASYNCINVOKE,
     * который отвечает за автоматическое закрытие соединение сервером,
     * не дожидаясь обработки выполнения метода бизнес логики
     * @param {Boolean} [config.recent] Признак, по которому чтение данных будет произведено из master-базы.
     * @return {Transport/AbortPromise}
     *
     * @name Transport/RPC
     * @author Заляев А.В.
     * @public
     * @function
     * @see Transport/RPC/Error
     * @see Transport/fetch
     * @see Transport/sbis
     */
    var RPC = function (config) {
        var request = sbisTransport(getFetchConfig(config), sbisTransport.RESPONSE_TYPE.JSON);
        var processing = request.then(function (response) {
            var resp = response || Body_1.getEmptyResponse();
            // 200, но пустой ответ или вложенная ошибка
            if ('error' in resp) {
                throw ErrorCreator.fromRPC(resp.error, config.method, config.url);
            }
            return resp.result;
        }, function (error) {
            if (error instanceof Errors_1.Connection) {
                var _a = config.method.split('.'), object = _a[0], method = _a[1];
                getGlobalChannel().notify('onOfflineModeError', object, method, error);
            }
            throw ErrorCreator.fromHTTP(error, config.method);
        }).catch(function (error) {
            if (error.canceled) {
                throw error;
            }
            if (!error.details) {
                var code = error.httpError || 0;
                error.details = code > 500 ? rk('Попробуйте заглянуть сюда через 15 минут') : '';
            }
            getErrorChannel().notify('onRPCError', error);
            throw error;
        });
        return _utils_1.getAbortedPromise(processing, request);
    };
    return RPC;
});
