define("Lib/ServerEvent/_class/deliver/IndexedDB", ["require", "exports", "Lib/ServerEvent/native/_IndexedDB"], function (require, exports, _IndexedDB_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SECONDS_5 = 5000;
    /**
     * Класс доставки событий через indexedDB.
     * Доставка на вкладку осуществляется через периодический опрос indexedDB.
     * При запросе на доставку, сообщение помещается в indexedDB.
     */
    var IndexedDB = /** @class */ (function () {
        function IndexedDB(notifier, connect) {
            this.notifier = notifier;
            this.connect = connect;
            this.lastReaded = Date.now() - IndexedDB.INIT_TIMEOUT;
            this.tick = this.tick.bind(this);
            this.timer = setInterval(this.tick, SECONDS_5);
            this.reader = this.connect.createReader();
        }
        IndexedDB.prototype.deliver = function (channelName, eventName, rawData) {
            if (!this.writer) {
                this.writer = this.connect.createWriter();
            }
            this.writer.write(channelName, eventName, rawData);
        };
        /**
         * Функция доставки событий до вкладки
         */
        IndexedDB.prototype.tick = function () {
            var _this = this;
            /*
                Из-за длительного запроса на мобильных браузерах,
                мы должны запомнить время запроса сразу, а не в результате ответа.
            */
            var last = this.lastReaded;
            this.lastReaded = Date.now();
            this.reader.query(last)
                .then(function (events) {
                for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
                    var _a = events_1[_i], channelName = _a.channelName, eventName = _a.eventName, body = _a.body;
                    _this.notifier.fire(channelName, eventName, body);
                }
            });
        };
        IndexedDB.prototype.destroy = function () {
            this.destroy = function () {
            };
            this.connect = null;
            clearInterval(this.timer);
            if (this.writer) {
                this.writer.destructor();
            }
        };
        IndexedDB.create = function (notifier) {
            return _IndexedDB_1.Connector.connect(_IndexedDB_1.Connector.DB_DELIVER, _IndexedDB_1.Connector.EVENTS_STORE_NAME, new _IndexedDB_1.AdapterEvent(2)).addCallback(function (connect) {
                return new IndexedDB(notifier, connect);
            });
        };
        IndexedDB.INIT_TIMEOUT = 4000;
        return IndexedDB;
    }());
    exports.IndexedDB = IndexedDB;
});
