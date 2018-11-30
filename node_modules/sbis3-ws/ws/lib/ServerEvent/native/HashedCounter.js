define("Lib/ServerEvent/native/HashedCounter", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Класс, который считает хэшированыне объекты и хранит одну копию
     */
    var HashedCounter = /** @class */ (function () {
        function HashedCounter(countClones) {
            if (countClones === void 0) { countClones = true; }
            this.counter = Object.create(null);
            /**
             * Храним только одну копию <T>
             */
            this.list = [];
            if (!countClones) {
                this.add = this.addWithoutCount.bind(this);
            }
        }
        /**
         * Добавляем подписку, если её нет и увеличиваем счётчик
         * @param {SEB.IHashedSub} item
         */
        HashedCounter.prototype.add = function (item) {
            var count = this.counter[item.hash()] || 0;
            count = count + 1;
            this.counter[item.hash()] = count;
            this.list.push(item);
        };
        /**
         * Добавляем подписку, если её нет и устанавливаем счётчик в единицу
         * @param {SEB.IHashedSub} item
         */
        HashedCounter.prototype.addWithoutCount = function (item) {
            var count = this.counter[item.hash()] || 0;
            if (count > 0) {
                return;
            }
            this.counter[item.hash()] = 1;
            this.list.push(item);
        };
        HashedCounter.prototype.remove = function (item) {
            var count = this.counter[item.hash()] || 0;
            if (count === 0) {
                return;
            }
            count = count - 1;
            this.counter[item.hash()] = count;
            if (count === 0) {
                this.list = this.list.filter(function (current) {
                    return current.hash() !== item.hash();
                });
                delete this.counter[item.hash()];
                return;
            }
            var searchTheSame = this.list.indexOf(item);
            if (searchTheSame > -1) {
                this.list.splice(searchTheSame, 1);
                return;
            }
            var index = -1;
            var i = 0;
            /* Array.prototype.findIndex не поддерживается в IE */
            while (index === -1 && i < this.list.length) {
                var current = this.list[i];
                if (current.hash() === item.hash()) {
                    index = i;
                }
                i = i + 1;
            }
            if (index > -1) {
                this.list.splice(index, 1);
            }
        };
        HashedCounter.prototype.has = function (item) {
            return !!this.counter[item.hash()];
        };
        HashedCounter.prototype.getSubscribes = function () {
            return this.list.slice();
        };
        HashedCounter.prototype.getByName = function (name) {
            var result = [];
            for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
                var item = _a[_i];
                if (item.getChannelName() !== name) {
                    continue;
                }
                result.push(item);
            }
            return result;
        };
        HashedCounter.prototype.getCount = function (item) {
            return this.counter[item.hash()] || 0;
        };
        HashedCounter.prototype.clear = function () {
            this.list = [];
            this.counter = Object.create(null);
        };
        return HashedCounter;
    }());
    exports.HashedCounter = HashedCounter;
});
