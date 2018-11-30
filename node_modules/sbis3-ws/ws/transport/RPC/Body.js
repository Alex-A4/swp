define("Transport/RPC/Body", ["require", "exports", "Core/constants", "Transport/serializeURLData"], function (require, exports, constants, serializeURLData) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Тело RPC вызова метода бизнес-логики
     * @name Transport/RPC/Body
     * @public
     * @author Заляев А.В
     */
    /**
     * Получение тела RPC для GET запроса
     * @param {String} method Метод бизнес логики
     * @param {*} params Параметры БЛ
     * @param {Number} [id]
     * @return {String}
     * @name Transport/RPC/Body#getURL
     */
    exports.getBody = function (method, params, id) {
        return JSON.stringify({
            jsonrpc: '2.0',
            protocol: constants.JSONRPC_PROOTOCOL_VERSION,
            method: method,
            params: params,
            id: id !== undefined ? id : 1
        });
    };
    /**
     * Получение тела RPC запроса
     * @param {String} method Метод бизнес логики
     * @param {*} params Параметры БЛ
     * @param {Number} [id]
     * @return {String}
     * @name Transport/RPC/Body#getBody
     */
    exports.getURL = function (method, params, id) {
        return '?protocol=' + constants.JSONRPC_PROOTOCOL_VERSION +
            '&method=' + encodeURI(method) +
            '&params=' + encodeURIComponent(serializeURLData(params)) +
            '&id=' + (id !== undefined ? id : 1);
    };
    /**
     * Шаблон пустого RPC ответа от сервиса
     * @return {Object}
     * @name Transport/RPC/Body#getEmptyResponse
     */
    exports.getEmptyResponse = function () {
        return {
            error: {
                message: rk('Получен пустой ответ от сервиса'),
                code: "",
                details: ""
            }
        };
    };
});
