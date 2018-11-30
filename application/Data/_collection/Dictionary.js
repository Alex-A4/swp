/// <amd-module name="Data/_collection/Dictionary" />
/**
 * Тип данных словарь.
 * Это абстрактный класс, не предусмотрено создание самостоятельных экземпляров.
 * @class WS.Data/Type/Dictionary
 * @implements WS.Data/Collection/IEnumerable
 * @implements WS.Data/Entity/IEquatable
 * @mixes WS.Data/Entity/OptionsMixin
 * @mixes WS.Data/Entity/ObservableMixin
 * @public
 * @author Мальцев А.А.
 */
define('Data/_collection/Dictionary', [
    'require',
    'exports',
    'tslib',
    'Data/_collection/ArrayEnumerator',
    'Data/_collection/ObjectEnumerator',
    'Data/type',
    'Data/util'
], function (require, exports, tslib_1, ArrayEnumerator_1, ObjectEnumerator_1, type_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var Dictionary = /** @class */
    function (_super) {
        tslib_1.__extends(Dictionary, _super);
        function Dictionary(options) {
            var _this = _super.call(this) || this;
            type_1.OptionsMixin.call(_this, options);
            type_1.ObservableMixin.call(_this, options);
            _this._$dictionary = _this._$dictionary || [];
            return _this;
        }
        Dictionary.prototype.destroy = function () {
            type_1.ObservableMixin.prototype.destroy.call(this);
            _super.prototype.destroy.call(this);
        };    /**
         * Возвращает словарь возможных значений
         * @param {Boolean} [localize=false] Вернуть локализованный словарь
         * @return {Array.<String>|Object.<String>}
         * @protected
         */
        /**
         * Возвращает словарь возможных значений
         * @param {Boolean} [localize=false] Вернуть локализованный словарь
         * @return {Array.<String>|Object.<String>}
         * @protected
         */
        Dictionary.prototype.getDictionary = function (localize) {
            var dictionary = localize && this._$localeDictionary ? this._$localeDictionary : this._$dictionary;
            return dictionary ? Array.isArray(dictionary) ? dictionary.slice() : Object.assign({}, dictionary) : dictionary;
        };
        Dictionary.prototype.each = function (callback, context, localize) {
            context = context || this;
            var enumerator = this.getEnumerator(localize);
            while (enumerator.moveNext()) {
                callback.call(context, enumerator.getCurrent(), enumerator.getCurrentIndex());
            }
        };
        Dictionary.prototype.getEnumerator = function (localize) {
            var dictionary = localize && this._$localeDictionary ? this._$localeDictionary : this._$dictionary;
            var enumerator = dictionary instanceof Array ? new ArrayEnumerator_1.default(dictionary) : new ObjectEnumerator_1.default(dictionary);
            enumerator.setFilter(function (item, index) {
                return index !== 'null';
            });
            return enumerator;
        };
        Dictionary.prototype.isEqual = function (to) {
            if (!(to instanceof Dictionary)) {
                return false;
            }
            var enumerator = this.getEnumerator();
            var toEnumerator = to.getEnumerator();
            var item;
            var hasItem;
            var toItem;
            var hasToItem;
            do {
                hasItem = enumerator.moveNext();
                hasToItem = toEnumerator.moveNext();
                item = hasItem ? enumerator.getCurrent() : undefined;
                toItem = hasToItem ? toEnumerator.getCurrent() : undefined;
                if (item !== toItem) {
                    return false;
                }
                if (enumerator.getCurrentIndex() !== toEnumerator.getCurrentIndex()) {
                    return false;
                }
            } while (hasItem || hasToItem);
            return true;
        };    //endregion
              //region Protected methods
              /**
         * Возвращает индекс значения в словаре
         * @param {String} name Значение в словаре
         * @param {Boolean} [localize=false] Это локализованное значение
         * @return {Number|String|undefined}
         * @protected
         */
        //endregion
        //region Protected methods
        /**
         * Возвращает индекс значения в словаре
         * @param {String} name Значение в словаре
         * @param {Boolean} [localize=false] Это локализованное значение
         * @return {Number|String|undefined}
         * @protected
         */
        Dictionary.prototype._getIndex = function (name, localize) {
            var enumerator = this.getEnumerator(localize);
            while (enumerator.moveNext()) {
                if (enumerator.getCurrent() === name) {
                    return enumerator.getCurrentIndex();
                }
            }
            return undefined;
        };    /**
         * Возвращает значение в словаре по индексу
         * @param {Number|String} index Индекс в словаре
         * @param {Boolean} [localize=false] Вернуть локализованное значение
         * @return {String}
         * @protected
         */
        /**
         * Возвращает значение в словаре по индексу
         * @param {Number|String} index Индекс в словаре
         * @param {Boolean} [localize=false] Вернуть локализованное значение
         * @return {String}
         * @protected
         */
        Dictionary.prototype._getValue = function (index, localize) {
            return localize && this._$localeDictionary ? this._$localeDictionary[index] : this._$dictionary[index];
        };    /**
         * Возвращает словарь из формата
         * @param {WS.Data/Format/Field|WS.Data/Format/UniversalField|String} format Формат поля
         * @return {Array}
         * @protected
         */
        /**
         * Возвращает словарь из формата
         * @param {WS.Data/Format/Field|WS.Data/Format/UniversalField|String} format Формат поля
         * @return {Array}
         * @protected
         */
        Dictionary.prototype._getDictionaryByFormat = function (format) {
            if (!format) {
                return [];
            }
            return (format.getDictionary ? format.getDictionary() : format.meta && format.meta.dictionary) || [];
        };    /**
         * Возвращает локализованный словарь из формата
         * @param {WS.Data/Format/Field|WS.Data/Format/UniversalField|String} format Формат поля
         * @return {Array|undefined}
         * @protected
         */
        /**
         * Возвращает локализованный словарь из формата
         * @param {WS.Data/Format/Field|WS.Data/Format/UniversalField|String} format Формат поля
         * @return {Array|undefined}
         * @protected
         */
        Dictionary.prototype._getLocaleDictionaryByFormat = function (format) {
            if (!format) {
                return;
            }
            return (format.getLocaleDictionary ? format.getLocaleDictionary() : format.meta && format.meta.localeDictionary) || undefined;
        };
        return Dictionary;
    }(type_1.Abstract);
    exports.default = Dictionary;
    util_1.applyMixins(Dictionary, type_1.OptionsMixin, type_1.ObservableMixin);
    Dictionary.prototype['[Data/_collection/Dictionary]'] = true;    // @ts-ignore
    // @ts-ignore
    Dictionary.prototype['[Data/_collection/IEnumerable]'] = true;    // @ts-ignore
    // @ts-ignore
    Dictionary.prototype['[Data/_type/IEquatable]'] = true;    // @ts-ignore
    // @ts-ignore
    Dictionary.prototype._$dictionary = undefined;    // @ts-ignore
    // @ts-ignore
    Dictionary.prototype._$localeDictionary = undefined;    // @ts-ignore
    // @ts-ignore
    Dictionary.prototype._type = undefined;    //FIXME: backward compatibility for check via Core/core-instance::instanceOfMixin()
    //FIXME: backward compatibility for check via Core/core-instance::instanceOfMixin()
    Dictionary.prototype['[WS.Data/Collection/IEnumerable]'] = true;
});