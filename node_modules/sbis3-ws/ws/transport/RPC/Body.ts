/// <amd-module name="Transport/RPC/Body" />
import constants = require('Core/constants');
import serializeURLData = require('Transport/serializeURLData');
import {RPCResponse} from "Transport/RPC.d";
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
export let getBody = (method: string, params: any, id?: number): string => {
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
export let getURL = (method: string, params: any, id?: number): string => {
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
export let getEmptyResponse = (): RPCResponse<never> => {
    return {
        error: {
            message: rk('Получен пустой ответ от сервиса'),
            code: "",
            details: ""
        }
    }
};
