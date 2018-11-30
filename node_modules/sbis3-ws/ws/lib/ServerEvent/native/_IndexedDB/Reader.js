define("Lib/ServerEvent/native/_IndexedDB/Reader", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @class Lib/ServerEvent/native/_IndexedDB/Reader
     */
    var Reader = /** @class */ (function () {
        function Reader(db, storeName, adapter) {
            this.db = db;
            this.storeName = storeName;
            this.adapter = adapter;
        }
        Reader.prototype.query = function () {
            var _this = this;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var query = this.adapter.query.apply(this.adapter.query, args.slice());
            return new Promise(function (resolve, reject) {
                var request = _this.db.transaction(_this.storeName, "readonly")
                    .objectStore(_this.storeName)
                    .openCursor(query.getKeyRange());
                var results = [];
                request.onsuccess = function (event) {
                    var cursor = request.result;
                    if (!cursor) {
                        return resolve(results);
                    }
                    var value = cursor.value;
                    if (value) {
                        results.push(cursor.value);
                    }
                    cursor.continue();
                };
                request.onerror = reject;
            }).then(function (data) {
                var filter = query.getFilter();
                if (!filter) {
                    return data;
                }
                return data.filter(filter);
            });
        };
        return Reader;
    }());
    exports.Reader = Reader;
});
