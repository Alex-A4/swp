define("Lib/ServerEvent/native/_IndexedDB/Writer", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Класс, который записывает Stomp данные в IndexDB
     * @class Lib/ServerEvent/native/_IndexedDB/Writer
     */
    var Writer = /** @class */ (function () {
        /** @constructor */
        function Writer(db, storeName, adapter) {
            this.db = db;
            this.storeName = storeName;
            this.adapter = adapter;
            this.garbageCollection = this.garbageCollection.bind(this);
            this.gc_work = setInterval(this.garbageCollection, Writer.GC_INTERVAL);
        }
        Writer.prototype.write = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var data = this.adapter.prepare.apply(this.adapter, args.slice());
            try {
                this.db.transaction(this.storeName, "readwrite")
                    .objectStore(this.storeName)
                    .add(data);
            }
            catch (e) {
                /* Fx bug: https://bugzilla.mozilla.org/show_bug.cgi?id=781982
                    ничего сделать не можем */
                return false;
            }
            return true;
        };
        Writer.prototype.createStore = function () {
            try {
                this.db.deleteObjectStore(this.storeName);
            }
            catch (e) {
                // Не смог удалить, ну и бог с ним
            }
            try {
                this.db.createObjectStore(this.storeName, {
                    keyPath: this.adapter.getKeyPath(),
                    autoIncrement: false
                });
            }
            catch (e) {
                /* Fx bug: https://bugzilla.mozilla.org/show_bug.cgi?id=781982
                ничего сделать не можем */
                return false;
            }
            return true;
        };
        Writer.prototype.garbageCollection = function () {
            var _this = this;
            try {
                var store_1 = this.db.transaction(this.storeName, "readwrite")
                    .objectStore(this.storeName);
                var request_1 = store_1.count();
                request_1.onsuccess = function () {
                    if (!_this.adapter) {
                        return;
                    } // может произойти после вызова Writer::destructor
                    if (request_1.result <= _this.adapter.getGCLimit()) {
                        return;
                    }
                    store_1.delete(_this.adapter.getGCKeyBound());
                };
                request_1.onerror = function () {
                };
            }
            catch (e) {
                /* Fx bug: https://bugzilla.mozilla.org/show_bug.cgi?id=781982
                ничего сделать не можем */
                return false;
            }
            return true;
        };
        Writer.prototype.destructor = function () {
            clearInterval(this.gc_work);
            this.write = function () { return false; };
            this.createStore = function () { return false; };
            this.db = undefined;
            this.adapter = undefined;
        };
        Writer.GC_INTERVAL = 10000;
        Writer.GC_EVENT_LIMIT = 5 * 60 * 1000;
        return Writer;
    }());
    exports.Writer = Writer;
});
