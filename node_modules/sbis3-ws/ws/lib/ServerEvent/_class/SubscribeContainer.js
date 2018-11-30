define("Lib/ServerEvent/_class/SubscribeContainer", ["require", "exports", "Lib/ServerEvent/native/HashedCounter"], function (require, exports, HashedCounter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Класс для хранения подписок и учёта количества ссылок.
     */
    var SubscribeContainer = /** @class */ (function () {
        function SubscribeContainer() {
            this.common = new HashedCounter_1.HashedCounter(false);
            this.channeled = new HashedCounter_1.HashedCounter();
        }
        /**
         * @param subscribe
         * @return {boolean} true - если добавлено успешно. false - если уже было добавлено ранее.
         */
        SubscribeContainer.prototype.add = function (subscribe) {
            if (subscribe.isChanneled()) {
                return this.channeled.add(subscribe);
            }
            this.common.add(subscribe);
        };
        /**
         * @param subscribe
         * @return {boolean} true - если удалено. false - если не нашли.
         */
        SubscribeContainer.prototype.remove = function (subscribe) {
            if (subscribe.isChanneled()) {
                return this.channeled.remove(subscribe);
            }
            this.common.remove(subscribe);
        };
        SubscribeContainer.prototype.has = function (subscribe) {
            return this.common.has(subscribe) || this.channeled.has(subscribe);
        };
        SubscribeContainer.prototype.all = function () {
            /* В this.common всегда одна копия */
            return this.common.getSubscribes().concat(this.channeled.getSubscribes());
        };
        SubscribeContainer.prototype.clear = function () {
            this.common.clear();
            this.channeled.clear();
        };
        /**
         * Удаляем подписки по имени канала и возвращаем их
         * FIXME нужно подписок возвращать столько же, какое и их количество!!!
         * @param {string} name
         * @return {SEB.ISubscribe[]}
         */
        SubscribeContainer.prototype.removeByName = function (name) {
            var common = this.common.getByName(name);
            var channeled = this.channeled.getByName(name);
            for (var _i = 0, common_1 = common; _i < common_1.length; _i++) {
                var item = common_1[_i];
                this.common.remove(item);
            }
            for (var _a = 0, channeled_1 = channeled; _a < channeled_1.length; _a++) {
                var item = channeled_1[_a];
                this.channeled.remove(item);
            }
            return common.concat(channeled);
        };
        /**
         * Присутствует ли обычная подписка
         * @return {boolean}
         */
        SubscribeContainer.prototype.hasCommon = function () {
            return this.common.getSubscribes().length > 0;
        };
        /**
         * Присутствует ли канализированная подписка
         * @return {boolean}
         */
        SubscribeContainer.prototype.hasChanneled = function () {
            return this.channeled.getSubscribes().length > 0;
        };
        return SubscribeContainer;
    }());
    exports.SubscribeContainer = SubscribeContainer;
});
