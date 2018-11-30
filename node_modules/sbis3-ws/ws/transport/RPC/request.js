define("Transport/RPC/request", ["require", "exports", "Core/EventBus", "Transport/RPC/Body", "Transport/RPC/ErrorCreator"], function (require, exports, EventBus, RPCBody, ErrorCreator) {
    "use strict";
    /**
     * @param {Error} error
     */
    var notify = function (error) {
        EventBus.channel('errors').notify('onRPCError', error);
    };
    /**
     * @cfg {Transport/ITransport} transport Транспорт, по которому будет осуществлён запрос
     */
    /**
     * @cfg {String} data Тело запроса в виде строки.
     */
    /**
     * @cfg {Object} headers Объект с необходимыми заголовками.
     */
    /**
     * Отправляет запрос на бизнес-логику
     * @name Transport/RPC/request
     * @private
     * @author Заляев А.В
     */
    var request = function (_a) {
        var data = _a.data, headers = _a.headers, transport = _a.transport, method = _a.method, url = _a.url;
        return transport.execute(data, headers).addCallbacks(function (response) {
            var resp = response || RPCBody.getEmptyResponse();
            // 200, но пустой ответ или вложенная ошибка
            if ('error' in resp) {
                return ErrorCreator.fromRPC(resp.error, method, url);
            }
            return resp.result;
        }, function (error) {
            return ErrorCreator.fromHTTP(error, method);
        }).addErrback(function (error) {
            notify(error);
            return error;
        });
    };
    return request;
});
