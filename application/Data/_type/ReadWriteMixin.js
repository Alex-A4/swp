/// <amd-module name="Data/_type/ReadWriteMixin" />
/**
 * Миксин, позволяющий ограничивать запись и чтение.
 * Подмешивается после WS.Data/Entity/ObservableMixin и после WS.Data/Entity/ManyToManyMixin, перекрывая часть их методов
 * @mixin WS.Data/Entity/ReadWriteMixin
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/ReadWriteMixin', [
    'require',
    'exports',
    'Data/_type/OptionsMixin',
    'Data/_type/ObservableMixin',
    'Data/_type/ManyToManyMixin',
    'Data/util'
], function (require, exports, OptionsMixin_1, ObservableMixin_1, ManyToManyMixin_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var hasOwnProperty = Object.prototype.hasOwnProperty;    /**
     * Свойство, хранящее признак возможности записи
     */
    /**
     * Свойство, хранящее признак возможности записи
     */
    var $writable = util_1.protect('writable');
    var ReadWriteMixin = /** @lends WS.Data/Entity/ReadWriteMixin.prototype */
    {
        '[Data/_type/ReadWriteMixin]': true,
        //region WS.Data/Entity/ReadWriteMixin
        get writable() {
            return this[$writable];
        },
        constructor: function (options) {
            if (this._options && hasOwnProperty.call(this._options, 'writable')) {
                this[$writable] = this._options.writable;
            }
            if (options && hasOwnProperty.call(options, 'writable')) {
                this[$writable] = options.writable;
            }
            if (this[$writable]) {
                ObservableMixin_1.default.apply(this, arguments);
            }
        },
        destroy: function () {
            if (this[$writable]) {
                ObservableMixin_1.default.prototype.destroy.call(this);
                ManyToManyMixin_1.default.destroy.call(this);
            }
        },
        //endregion WS.Data/Entity/ReadWriteMixin
        //region WS.Data/Entity/ObservableMixin
        subscribe: function (event, handler, ctx) {
            if (this[$writable]) {
                return ObservableMixin_1.default.prototype.subscribe.call(this, event, handler, ctx);
            }
        },
        unsubscribe: function (event, handler, ctx) {
            if (this[$writable]) {
                return ObservableMixin_1.default.prototype.unsubscribe.call(this, event, handler, ctx);
            }
        },
        _publish: function () {
            if (this[$writable]) {
                // @ts-ignore
                return ObservableMixin_1.default.prototype._publish.apply(this, arguments);
            }
        },
        _notify: function () {
            if (this[$writable]) {
                // @ts-ignore
                return ObservableMixin_1.default.prototype._notify.apply(this, arguments);
            }
        },
        //endregion WS.Data/Entity/ObservableMixin
        //region WS.Data/Entity/OptionsMixin
        _getOptions: function () {
            // @ts-ignore
            var options = OptionsMixin_1.default.prototype._getOptions.call(this);    //Delete "writable" property received from _options
            //Delete "writable" property received from _options
            delete options.writable;
            return options;
        }    //endregion WS.Data/Entity/OptionsMixin
    };    // @ts-ignore
    //endregion WS.Data/Entity/OptionsMixin
    // @ts-ignore
    var IS_BROWSER = typeof window !== 'undefined';    // @ts-ignore
    // @ts-ignore
    var IS_TESTING = !!(typeof global !== 'undefined' && global.assert && global.assert.strictEqual);    /**
     * @property {Boolean} Объект можно модифицировать. Запрет модификации выключит механизмы генерации событий (ObservableMixin).
     */
    /**
     * @property {Boolean} Объект можно модифицировать. Запрет модификации выключит механизмы генерации событий (ObservableMixin).
     */
    Object.defineProperty(ReadWriteMixin, $writable, {
        writable: true,
        value: IS_BROWSER || IS_TESTING
    });
    exports.default = ReadWriteMixin;
});