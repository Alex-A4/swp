/// <amd-module name="Transport/sbis" />
import fetch = require('Transport/fetch');
import * as Errors from "Transport/Errors";
import constants = require('Core/constants');
import UserInfo = require('Core/UserInfo');
import EventBus = require('Core/EventBus');
import {getAbortedPromise} from 'Transport/_utils';
import {SbisTransport} from 'Transport/sbis.d';
import {AbortPromise, FetchConfig} from 'Transport/fetch.d';
import {parse, RESPONSE_TYPE} from "Transport/fetch/responseParser";
import {FetchResponseType} from "Transport/fetch/responseParser.d";

/**
 * Объект заголовков по уполчанию
 */
const DEFAULT_HEADERS = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept': 'application/json, text/javascript, */*; q=0.01'
};

/**
 * Объект конфигураций запроса по уполчанию
 */
const DEFAULT: Partial<FetchConfig> = {
    method: 'GET'
};

const SAVE_HEADER_NAME = 'X-LastModification';
let cachedHeaders = {};

/**
 * Подготавливает объект параметров запроса, докидывая значения по умолчанию
 * @param {Partial.<Transport/SbisConfig>} receivedConfig
 * @return {Transport/SbisConfig}
 */
let getConfig = (receivedConfig: Partial<FetchConfig>): Partial<FetchConfig> => {
    let config = {
        ...DEFAULT,
        ...receivedConfig
    };
    let headers = {
        ...DEFAULT_HEADERS,
        ...receivedConfig.headers
    };

    /*
     * Если кто-то решил не проставлять заголовки, которые мы поддкидываем по умолчанию,
     * то надо эти ключи удалить из объекта вообще, чтобы в запросе не ушли заголовки типа "n:undefined"
     */
    for (let i in headers) {
        if (headers.hasOwnProperty(i) && !headers[i]) {
            delete headers[i];
        }
    }

    if (cachedHeaders[config.url]) {
        headers[SAVE_HEADER_NAME] = cachedHeaders[config.url];
    }
    config.headers = headers;
    return config;
};

/**
 * Проверка актуальности пользователя
 * для запуска механизмов чистки данных от старого пользователя и перезагрузки страницы
 * возможно откажемся от этого по проекту обработки ошибок
 */
let checkUser = (url) => {
    if (constants.checkSessionCookie && !UserInfo.isValid()) {
        return Promise.reject(new Errors.Auth(url));
    }
    return Promise.resolve();
};

/**
 * Оповещение об ошибке авторизации.
 * для запуска механизмов чистки данных от старого пользователя и перезагрузки страницы
 * возможно откажемся от этого по проекту обработки ошибок
 * @param {Error} error
 */
let notifyAuthError = (error: Error) => {
    if (error instanceof Errors.Auth) {
        EventBus.channel('errors').notify('onAuthError');
    }
    throw error;
};

/**
 * Кэширование заголовка из ответа от каждого сервиса
 * Необходимо чтобы принимать решение о чтении с реплик БД
 */
let cacheHeaders = (response: Response): Response => {
    cachedHeaders[response.url] = response.headers.get(SAVE_HEADER_NAME);
    return response;
};

/**
 * Транспорт-обёртка над fetch, отвечающая за разбор ответа от сервера.
 * Так же позволяющая предотвратить запрос
 * @param {Object} requestConfig
 * @param {String} [requestConfig.url] Адрес запроса.
 * @param {*} [requestConfig.body] Тело запроса.
 * @param {String} [requestConfig.method] Http-метод запроса.
 * @param {Object | Headers} [requestConfig.headers] Объект с заголовками запроса.
 * @param {"default" | "no-store" | "reload" | "no-cache" | "force-cache"} [requestConfig.cache] Как кешировать запрос
 * @param {"omit" | "same-origin" | "include"} [requestConfig.credentials] Пересылать ли куки и заголовки авторизации вместе с запросом.
 * @param {"navigate" | "same-origin" | "no-cors" | "cors"} [requestConfig.mode] Режим кросс-доменности.
 * @param {"follow" | "error" | "manual"} [requestConfig.redirect]
 * @param {'TEXT' | 'JSON' | 'BLOB' | 'XML'} responseType Тип данных, ожидаемый от сервера.
 * @return {Transport/AbortPromise}
 *
 * @see Transport/fetch
 * @see Transport/Errors#Parse
 * @function
 * @name Transport/sbis
 * @author Заляев А.В.
 * @public
 */
let sbisTransport: SbisTransport = <T>(
    requestConfig: Partial<FetchConfig>,
    responseType: FetchResponseType = RESPONSE_TYPE.TEXT
) => {
    let _config = getConfig(requestConfig);
    let request: AbortPromise<Response>;
    let aborted: boolean;
    let processing = checkUser(_config.url).then(() => {
        request = fetch(_config);
        if (aborted) {
            request.abort();
        }
        return request;
    }).then(
        cacheHeaders,
        notifyAuthError
    ).then((response: Response) => {
        return parse(response, responseType)
    });
    
    // прокидывание метода abort
    return getAbortedPromise<T>(processing, {
        abort() {
            request && request.abort();
            aborted = true;
        }
    });
};

/**
 * Набор типов данных, в которые можно преобразовать ответ от сервера.
 * @static
 * @type {Object}
 * @property TEXT
 * @property JSON
 * @property BLOB
 * @property XML
 * @name Transport/sbis#RESPONSE_TYPE
 */

export = <SbisTransport & {
    RESPONSE_TYPE: {
        TEXT: 'TEXT',
        JSON: 'JSON',
        BLOB: 'BLOB',
        XML: 'XML'
    }
}> Object.assign(
    sbisTransport, {
        RESPONSE_TYPE
    }
);
