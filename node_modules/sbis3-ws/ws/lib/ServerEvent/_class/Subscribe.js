define("Lib/ServerEvent/_class/Subscribe", ["require", "exports", "tslib", "Lib/ServerEvent/_class/Constants"], function (require, exports, tslib_1, CONST) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Subscribe = /** @class */ (function () {
        function Subscribe(channelName, type) {
            this.channelName = channelName;
            this.type = type;
        }
        /**
         * Хэш, который идентифицирует подписку.
         * Поэтому хэшу необходимо проверять соответстве подписок.
         * @return {string}
         */
        Subscribe.prototype.hash = function () {
            var type = this.isChanneled() ? 'ch' : 'cm';
            return this.channelName + "::" + type + "::" + this.getDeliveryType();
        };
        Subscribe.prototype.getDeliveryType = function () {
            return this.type;
        };
        Subscribe.prototype.getChannelName = function () {
            return this.channelName;
        };
        Subscribe.create = function (channelName, isChanneled, isExclusive, target) {
            if (isChanneled === void 0) { isChanneled = false; }
            if (isExclusive === void 0) { isExclusive = false; }
            if (target === void 0) { target = null; }
            var type = isExclusive ? CONST.DELIVERY_EXCLUSIVE_PAGE : CONST.DELIVERY_COMMON;
            if (!isChanneled) {
                return new CommonSubscribe(channelName, type);
            }
            return new ChanneledSubscribe(channelName, type, target);
        };
        Subscribe.createRaw = function (channelName, isChanneled, isExclusive, scope) {
            if (isChanneled === void 0) { isChanneled = false; }
            if (isExclusive === void 0) { isExclusive = false; }
            if (scope === void 0) { scope = null; }
            var type = isExclusive ? CONST.DELIVERY_EXCLUSIVE_PAGE : CONST.DELIVERY_COMMON;
            if (!isChanneled) {
                return new CommonSubscribe(channelName, type);
            }
            return new RawChanneledSubscribe(channelName, type, scope);
        };
        return Subscribe;
    }());
    exports.Subscribe = Subscribe;
    var CommonSubscribe = /** @class */ (function (_super) {
        tslib_1.__extends(CommonSubscribe, _super);
        function CommonSubscribe() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * Нужен для TabMessage. Он пересылает лишь поля объекта.
             * @type {boolean}
             */
            _this.channeled = false;
            return _this;
        }
        CommonSubscribe.prototype.isChanneled = function () {
            return false;
        };
        return CommonSubscribe;
    }(Subscribe));
    exports.CommonSubscribe = CommonSubscribe;
    var ChanneledSubscribe = /** @class */ (function (_super) {
        tslib_1.__extends(ChanneledSubscribe, _super);
        /**
         * @param channelName
         * @param {string} type CONST.DELIVERY_EXCLUSIVE_PAGE | CONST.DELIVERY_COMMON
         * @param {string} target идентификатор аккаунта для получения событий
         */
        function ChanneledSubscribe(channelName, type, target) {
            if (target === void 0) { target = null; }
            var _this = _super.call(this, channelName, type) || this;
            _this.target = target;
            /**
             * Нужен для TabMessage. Он пересылает лишь поля объекта.
             * @type {boolean}
             */
            _this.channeled = true;
            return _this;
        }
        ChanneledSubscribe.prototype.isChanneled = function () {
            return true;
        };
        ChanneledSubscribe.prototype.hash = function () {
            return _super.prototype.hash.call(this) + "::" + this.target;
        };
        ChanneledSubscribe.prototype.getTarget = function () {
            return this.target;
        };
        return ChanneledSubscribe;
    }(Subscribe));
    exports.ChanneledSubscribe = ChanneledSubscribe;
    var RawChanneledSubscribe = /** @class */ (function (_super) {
        tslib_1.__extends(RawChanneledSubscribe, _super);
        function RawChanneledSubscribe(channelName, type, scope) {
            if (scope === void 0) { scope = null; }
            var _this = _super.call(this, channelName, type) || this;
            _this.scope = scope;
            return _this;
        }
        RawChanneledSubscribe.prototype.isChanneled = function () {
            return true;
        };
        RawChanneledSubscribe.prototype.hash = function () {
            return _super.prototype.hash.call(this) + "::" + this.scope;
        };
        RawChanneledSubscribe.prototype.getScope = function () {
            return this.scope;
        };
        return RawChanneledSubscribe;
    }(Subscribe));
    exports.RawChanneledSubscribe = RawChanneledSubscribe;
});
