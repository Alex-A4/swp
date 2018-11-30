/// <amd-module name="Transport/RPC/getFetchConfig" />
import {FetchConfig, HttpMethod} from "Transport/fetch.d";
import {getURL, getBody} from "Transport/RPC/Body";
import Headers = require("Transport/RPC/Headers");
import constants = require('Core/constants');
import {RPCConfig} from 'Transport/RPC.d'

let isGetMethod = (method) => {
    if ((typeof window === 'undefined') ||
        !window.cachedMethods ||
        !window.cachedMethods.length
    ) {
        return false;
    }
    return  window.cachedMethods.indexOf(method) > -1;
};

let canUseGetMethod = (url) => {
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
let getFetchConfig = ({method, body, url, asyncInvoke, recent,fallback, headers}: RPCConfig): Partial<FetchConfig> => {
    let dataUrl = "";
    let isGet = false;
    let httpMethod: HttpMethod = 'POST';
    url = url || constants.defaultServiceUrl;
    if (isGetMethod(method)) {
        dataUrl = getURL(method, body);
    }
    if (dataUrl && canUseGetMethod(dataUrl)) {
        httpMethod = 'GET';
        isGet = true;
        url += dataUrl;
    }
    return {
        method: httpMethod,
        headers: new Headers({
            method, url, httpMethod, headers,
            asyncInvoke, recent, fallback
        }),
        body: isGet? '': getBody(method, body),
        url
    };
    
};

export = getFetchConfig;
