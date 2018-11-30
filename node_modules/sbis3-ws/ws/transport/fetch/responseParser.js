define("Transport/fetch/responseParser", ["require", "exports", "Transport/Errors"], function (require, exports, Errors) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var getParserMethod = function (dataType) {
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
    var additionalParser = {
        xml: function (response) {
            return response.text().then(function (data) {
                var xml;
                if (!data) {
                    return null;
                }
                if (typeof DOMParser !== 'undefined') {
                    try {
                        xml = new DOMParser().parseFromString(data, "text/xml");
                    }
                    catch (e) {
                        xml = undefined;
                    }
                }
                if (!xml || xml.getElementsByTagName("parsererror").length) {
                    throw new Error("Invalid XML: " + data);
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
    exports.parse = function (response, type) {
        var parser = getParserMethod(type);
        var parse;
        if (parser in response) {
            parse = response[parser];
        }
        else {
            parse = additionalParser[parser];
        }
        return parse.call(response, response).catch(function (error) {
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
    exports.RESPONSE_TYPE = {
        TEXT: 'TEXT',
        JSON: 'JSON',
        BLOB: 'BLOB',
        XML: 'XML'
    };
});
