define("Transport/Errors", ["require", "exports", "tslib", "Core/i18n", "Core/core-classicExtend", "i18n!Transport/Error"], function (require, exports, tslib_1, i18n, classicExtend) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ERROR_TEXT = {
        get timeout() {
            return i18n.rk('Таймаут запроса');
        },
        get unknown() {
            return i18n.rk('Неизвестная ошибка');
        },
        get parsererror() {
            return i18n.rk('Ошибка разбора документа');
        },
        get abort() {
            return i18n.rk('Запрос был прерван');
        },
        get lossOfConnection() {
            return i18n.rk('Потеряна связь с сайтом');
        },
        get '401'() {
            return i18n.rk('Ошибка авторизации');
        },
        get '403'() {
            return i18n.rk('У вас недостаточно прав для выполнения данного действия');
        },
        get '404'() {
            return i18n.rk('Документ не найден');
        },
        get '413'() {
            return i18n.rk('Превышен допустимый размер загружаемого файла');
        },
        get '423'() {
            return i18n.rk('Действие заблокировано лицензией');
        },
        get '500'() {
            return i18n.rk('Внутренняя ошибка сервера');
        },
        get '502'() {
            return i18n.rk('Сервис находится на техническом обслуживании');
        },
        get '503'() {
            return i18n.rk('Сервис находится на техническом обслуживании');
        },
        get '504'() {
            return i18n.rk('Сервис находится на техническом обслуживании');
        },
    };
    exports.DETAILS_TEXT = {
        get default() {
            return i18n.rk('Мы знаем об этом и уже исправляем. Попробуйте заглянуть сюда через 15 минут.');
        },
        get lossOfConnection() {
            return i18n.rk('Проверьте настройки подключения к сети');
        },
    };
    /**
     * Ошибка работы транспорта
     * @name Transport/Errors#Transport
     * @extends Error
     * @param {Object} config
     * @param {String} config.message Сообщение ошибки
     * @param {String} config.url Адрес запроса
     * @param {String} config.details Дополнительная информация
     */
    var Transport = /** @class */ (function () {
        function Transport(_a) {
            var url = _a.url, message = _a.message, details = _a.details, name = _a.name;
            this.name = 'TransportError';
            this.processed = false;
            this.message = message;
            this.stack = new Error().stack;
            this.url = url;
            this.details = details;
            this.name = this.name || name;
        }
        Transport.prototype.toString = function () {
            return this.name + ": " + this.message + "; url: " + this.url;
        };
        return Transport;
    }());
    exports.Transport = Transport;
    // ts-extend Error, Array, Map некоректно отрабатывают без вызова setPrototypeOf почле super
    // но такой вариант не работает в IE, поэтому наследуемся через classicExtend
    // tslint:disable-next-line:max-line-length
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    classicExtend(Transport, Error);
    /**
     * HTTP ошибка
     * @param {Object} cfg
     * @param {String} cfg.message Сообщение об ошибке.
     * @param {Number} cfg.status HTTP-код ошибки.
     * @param {String} cfg.url Адрес.
     * @param {String} cfg.payload.
     * @param {String} [cfg.details]
     *
     * @name Transport/Errors#HTTP
     * @extends Transport/Errors#Transport
     */
    var HTTP = /** @class */ (function (_super) {
        tslib_1.__extends(HTTP, _super);
        function HTTP(cfg) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var _this = this;
            var config;
            // для обратной совместимсти с Transport/HTTPError
            if (typeof cfg == "string") {
                var status_1 = args[0], url = args[1], payload = args[2], details = args[3];
                config = {
                    message: cfg,
                    httpError: status_1, url: url, payload: payload, details: details
                };
            }
            else {
                config = cfg;
            }
            _this = _super.call(this, config) || this;
            _this.name = 'HTTP Error';
            _this.payload = config.payload || '';
            _this.status = config.httpError;
            _this.details = _this.details || exports.DETAILS_TEXT.default;
            // для обратной совместимсти с Transport/HTTPError
            _this.httpError = typeof _this.status !== 'undefined' ? _this.status : '';
            return _this;
        }
        HTTP.prototype.toString = function () {
            return this.name + ": " + this.message + "; httpError: " + this.httpError + "; url: " + this.url;
        };
        return HTTP;
    }(Transport));
    exports.HTTP = HTTP;
    /**
     * Ошибка разбора ответа сервера
     * @name Transport/Errors#Parse
     * @extends Transport/Errors#Transport
     */
    var Parse = /** @class */ (function (_super) {
        tslib_1.__extends(Parse, _super);
        function Parse(_a) {
            var url = _a.url, details = _a.details;
            var _this = _super.call(this, {
                url: url, details: details,
                message: exports.ERROR_TEXT.parsererror,
            }) || this;
            _this.name = 'ParseError';
            return _this;
        }
        return Parse;
    }(Transport));
    exports.Parse = Parse;
    /**
     * Ошибка подключения
     * @name Transport/Errors#Connection
     * @extends Transport/Errors#Transport
     */
    var Connection = /** @class */ (function (_super) {
        tslib_1.__extends(Connection, _super);
        function Connection(url) {
            var _this = _super.call(this, {
                url: url,
                message: exports.ERROR_TEXT.lossOfConnection,
                details: exports.DETAILS_TEXT.lossOfConnection
            }) || this;
            _this.name = 'ConnectionError';
            // для обратной совместимсти с Transport/HTTPError#offlineModeError
            _this._isOfflineMode = true;
            return _this;
        }
        return Connection;
    }(Transport));
    exports.Connection = Connection;
    /**
     * Ошибка авторизации
     * @name Transport/Errors#Auth
     * @extends Transport/Errors#Transport
     */
    var Auth = /** @class */ (function (_super) {
        tslib_1.__extends(Auth, _super);
        function Auth(url) {
            var _this = _super.call(this, {
                url: url,
                message: exports.ERROR_TEXT[401]
            }) || this;
            _this.name = 'AuthError';
            return _this;
        }
        return Auth;
    }(Transport));
    exports.Auth = Auth;
    /**
     * Ошибка, возвращаемая при отмене запроса
     * @name Transport/Errors#Abort
     * @extends Transport/Errors#Transport
     */
    var Abort = /** @class */ (function (_super) {
        tslib_1.__extends(Abort, _super);
        function Abort(url) {
            var _this = _super.call(this, {
                url: url,
                message: exports.ERROR_TEXT.abort
            }) || this;
            _this.canceled = true;
            return _this;
        }
        return Abort;
    }(Transport));
    exports.Abort = Abort;
});
