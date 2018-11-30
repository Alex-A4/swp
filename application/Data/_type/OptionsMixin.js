/// <amd-module name="Data/_type/OptionsMixin" />
/**
 * Примесь, позволяющая передавать в конструктор сущности набор опций (объект вида ключ-значение).
 * Для разделения защищенных свойств и опций последние должны именоваться определенным образом - имя должно
 * начинаться с префикса '_$':
 * <pre>
 *    var Device = Core.extend([OptionsMixin], {
 *       _$vendor: '',
 *       getVendor: function () {
 *          return this._$vendor;
 *       }
 *    });
 * </pre>
 * Если класс-наследник имеет свой конструктор, обязательно вызовите конструктор примеси (или конструктор
 * родительского класса, если примесь уже есть у родителя):
 * <pre>
 *    var Device = Core.extend([OptionsMixin], {
 *       _$vendor: '',
 *       constructor: function(options) {
 *          OptionsMixin.constructor.call(this, options);
 *       },
 *       getVendor: function () {
 *          return this._$vendor;
 *       }
 *    });
 * </pre>
 * Потому что именно конструктор примеси OptionsMixin раскладывает значения аргумента options по защищенным свойствам:
 * <pre>
 *    var hdd = new Device({
 *       vendor: 'Seagate'
 *    });
 *    hdd.getVendor();//Seagate
 * </pre>
 * @class WS.Data/Entity/OptionsMixin
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/OptionsMixin', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var optionPrefix = '_$';
    var optionPrefixLen = optionPrefix.length;
    function defineProperty(instance, name, key, scope) {
        Object.defineProperty(instance, name, {
            enumerable: true,
            configurable: true,
            get: function () {
                delete instance[name];
                return instance[name] = scope[key];
            },
            set: function (value) {
                delete instance[name];
                instance[name] = value;
            }
        });
    }
    var OptionsMixin    /** @lends WS.Data/Entity/OptionsMixin.prototype */ = /** @lends WS.Data/Entity/OptionsMixin.prototype */
    /** @class */
    function () {
        /**
         * Конструктор объекта, принимающий набор опций в качестве первого аргумента
         * @param {Object} [options] Значения опций
         */
        function OptionsMixin(options) {
            if (options && typeof options === 'object') {
                var prefix = optionPrefix;
                var keys = Object.keys(options);
                var option = void 0;
                var property = void 0;
                for (var i = 0, count = keys.length; i < count; i++) {
                    option = keys[i];
                    property = prefix + option;
                    if (property in this) {
                        defineProperty(this, property, option, options);
                    }
                }
            }
        }    /**
         * Возвращает опции объекта
         * @return {Object} Значения опций
         * @protected
         */
        /**
         * Возвращает опции объекта
         * @return {Object} Значения опций
         * @protected
         */
        OptionsMixin.prototype._getOptions = function () {
            var options = {};
            var keys = Object.keys(this);
            var key;
            for (var i = 0, count = keys.length; i < count; i++) {
                key = keys[i];
                if (key.substr(0, optionPrefixLen) === optionPrefix) {
                    options[key.substr(optionPrefixLen)] = this[key];
                }
            }    //FIXME: get rid of _options
            //FIXME: get rid of _options
            if (this._options) {
                for (key in this._options) {
                    if (this._options.hasOwnProperty(key) && !(key in options)) {
                        options[key] = this._options[key];
                    }
                }
            }
            return options;
        };
        return OptionsMixin;
    }();
    exports.default = OptionsMixin;
    OptionsMixin.prototype['[Data/_type/OptionsMixin]'] = true;
});