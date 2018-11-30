/// <amd-module name="Data/_source/OptionsMixin" />
/**
 * Миксин, позволяющий задавать опциональные настройки источника данных.
 * @mixin WS.Data/Source/OptionsMixin
 * @public
 * @author Мальцев А.А.
 */
define('Data/_source/OptionsMixin', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var OptionsMixin = /** @lends WS.Data/Source/OptionsMixin.prototype */
    {
        '[Data/_source/OptionsMixin]': true,
        /**
         * @cfg {Object} Дополнительные настройки источника данных.
         * @name WS.Data/Source/OptionsMixin#options
         */
        _$options: {
            /**
             * @cfg {Boolean} Режим отладки.
             * @name WS.Data/Source/OptionsMixin#options.debug
             */
            debug: false
        },
        constructor: function (options) {
            if (options && options.options instanceof Object) {
                this._$options = Object.assign({}, this._$options || {}, options.options);
                delete options.options;
            }
        },
        /**
         * Возвращает дополнительные настройки источника данных.
         * @return {Object}
         * @see options
         */
        getOptions: function () {
            return Object.assign({}, this._$options);
        },
        setOptions: function (options) {
            this._$options = Object.assign({}, this._$options, options || {});
        },
        /**
         * Объединяет набор опций суперкласса с наследником
         * @param {WS.Data/Source/OptionsMixin} Super Суперкласс
         * @param {Object} options Опции наследника
         * @return {Object}
         * @static
         */
        addOptions: function (Super, options) {
            return Object.assign({}, Super.prototype._$options, options);
        }
    };
    exports.default = OptionsMixin;
});