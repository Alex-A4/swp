/// <amd-module name="Transport/RPC/request" />
import EventBus = require('Core/EventBus');
import RPCBody = require('Transport/RPC/Body');
import ErrorCreator = require('Transport/RPC/ErrorCreator');
import ITransport = require('Transport/ITransport');
import {CallFunction, RequestParam} from './CallFunction';

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
let request: CallFunction = ({data, headers, transport, method, url}: RequestParam) => {
    return transport.execute(data, headers).addCallbacks((response) => {
        var resp = response || RPCBody.getEmptyResponse();
        // 200, но пустой ответ или вложенная ошибка
        if ('error' in resp){
            return ErrorCreator.fromRPC(resp.error, method, url);
        }
        return resp.result;
    }, (error) => {
        return ErrorCreator.fromHTTP(error, method);
    }).addErrback((error) => {
        notify(error);
        return error;
    });
};

export = request;
