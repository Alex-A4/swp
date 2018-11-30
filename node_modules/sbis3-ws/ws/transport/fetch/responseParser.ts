/// <amd-module name="Transport/fetch/responseParser" />
import * as Errors from "Transport/Errors";
import {FetchResponseType} from "Transport/fetch/responseParser.d";

let getParserMethod = (dataType?: FetchResponseType) => {
    switch (dataType) {
        // additional
        case 'XML': return 'xml';
        // native
        case 'JSON': return 'json';
        case 'TEXT': return 'text';
        case 'BLOB': return 'blob';
        default: return 'text';
    }
};

/**
 * Набор дополнительных парсеров данных
 */
let additionalParser = {
    xml(response: Response) {
        return response.text().then((data: string) => {
            let xml;
            if (!data) {
                return null;
            }
            if (typeof DOMParser !== 'undefined') {
                try {
                    xml = new DOMParser().parseFromString( data, "text/xml" );
                } catch ( e ) {
                    xml = undefined;
                }
            }
            if (!xml || xml.getElementsByTagName( "parsererror" ).length ) {
                throw new Error( "Invalid XML: " + data );
            }
            return xml;
        });
    }
};

/**
 * Разбор ответа от сервера
 * @param {Response} response Ответ сервера
 * @param {Transport/fetch/ResponseType} type Ожидаемый тип
 * @return {any}
 * @name Transport/fetch/responseParser#parse
 */
export let parse = (response: Response, type: FetchResponseType) => {
    let parser = getParserMethod(type);
    let parse;
    if (parser in response) {
        parse = response[parser];
    } else {
        parse = additionalParser[parser];
    }
    
    return parse.call(response, response).catch((error) => {
        throw new Errors.Parse({
            url: response.url,
            details: error.message
        });
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
 * @name Transport/fetch/responseParser#RESPONSE_TYPE
 */
export const RESPONSE_TYPE: {
    [propName in FetchResponseType]: FetchResponseType
} = {
    TEXT: 'TEXT',
    JSON: 'JSON',
    BLOB: 'BLOB',
    XML: 'XML'
};
