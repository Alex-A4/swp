/// <amd-module name="Data/_collection/List" />
/**
 * Список - коллекция c доступом по индексу.
 * Основные возможности:
 * <ul>
 *    <li>последовательный перебор элементов коллекции - поддержка интерфейса {@link WS.Data/Collection/IEnumerable};</li>
 *    <li>доступ к элементам коллекции по индексу - поддержка интерфейса {@link WS.Data/Collection/IList};</li>
 *    <li>поиск элементов коллекции по значению свойства - поддержка интерфейса {@link WS.Data/Collection/IIndexedCollection}.</li>
 * </ul>
 * Создадим рекордсет, в котором в качестве сырых данных используется plain JSON (адаптер для данных в таком формате используется по умолчанию):
 * <pre>
 *    var characters = new List({
 *       items: [{
 *          id: 1,
 *          firstName: 'Tom',
 *          lastName: 'Sawyer'
 *       }, {
 *          id: 2,
 *          firstName: 'Huckleberry',
 *          lastName: 'Finn'
 *       }]
 *    });
 *    characters.at(0).firstName;//'Tom'
 *    characters.at(1).firstName;//'Huckleberry'
 * </pre>
 * @class WS.Data/Collection/List
 * @extends WS.Data/Entity/Abstract
 * @implements WS.Data/Collection/IEnumerable
 * @implements WS.Data/Collection/IList
 * @implements WS.Data/Collection/IIndexedCollection
 * @implements WS.Data/Entity/ICloneable
 * @implements WS.Data/Entity/IEquatable
 * @mixes WS.Data/Entity/OptionsMixin
 * @mixes WS.Data/Entity/ObservableMixin
 * @mixes WS.Data/Entity/SerializableMixin
 * @mixes WS.Data/Entity/CloneableMixin
 * @mixes WS.Data/Entity/ManyToManyMixin
 * @mixes WS.Data/Entity/ReadWriteMixin
 * @mixes WS.Data/Entity/VersionableMixin
 * @public
 * @author Мальцев А.А.
 */
define('Data/_collection/List', [
    'require',
    'exports',
    'tslib',
    'Data/_collection/IBind',
    'Data/_collection/ArrayEnumerator',
    'Data/_collection/Indexer',
    'Data/type',
    'Data/util'
], function (require, exports, tslib_1, IBind_1, ArrayEnumerator_1, Indexer_1, type_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var List = /** @class */
    function (_super) {
        tslib_1.__extends(List, _super);
        function List(options) {
            var _this = this;
            if (options && 'items' in options && !(options.items instanceof Array)) {
                throw new TypeError('Option "items" should be an instance of Array');
            }
            _this = _super.call(this, options) || this;
            type_1.OptionsMixin.call(_this, options);
            type_1.SerializableMixin.constructor.call(_this);
            type_1.ReadWriteMixin.constructor.call(_this, options);
            _this._$items = _this._$items || [];
            for (var i = 0, count = _this._$items.length; i < count; i++) {
                _this._addChild(_this._$items[i]);
            }
            return _this;
        }
        List.prototype.destroy = function () {
            this._$items = null;
            this._indexer = null;
            type_1.ReadWriteMixin.destroy.call(this);
            _super.prototype.destroy.call(this);
        };    /**
         * Возвращает энумератор для перебора элементов списка.
         * Пример использования можно посмотреть в модуле {@link WS.Data/Collection/IEnumerable}.
         * @return {WS.Data/Collection/ArrayEnumerator}
         */
        /**
         * Возвращает энумератор для перебора элементов списка.
         * Пример использования можно посмотреть в модуле {@link WS.Data/Collection/IEnumerable}.
         * @return {WS.Data/Collection/ArrayEnumerator}
         */
        List.prototype.getEnumerator = function () {
            return new ArrayEnumerator_1.default(this._$items);
        };
        List.prototype.each = function (callback, context) {
            //It's faster than use getEnumerator()
            for (var i = 0, count = this.getCount(); i < count; i++) {
                callback.call(context || this, this.at(i), i, this);
            }
        };
        List.prototype.assign = function (items) {
            for (var i = 0, count = this._$items.length; i < count; i++) {
                this._removeChild(this._$items[i]);
            }
            this._$items.length = 0;
            items = this._splice(items || [], 0, IBind_1.default.ACTION_RESET);
            for (var i = 0, count = items.length; i < count; i++) {
                this._addChild(items[i]);
            }
            this._childChanged(items);
        };
        List.prototype.append = function (items) {
            items = this._splice(items, this.getCount(), IBind_1.default.ACTION_ADD);
            for (var i = 0, count = items.length; i < count; i++) {
                this._addChild(items[i]);
            }
            this._childChanged(items);
        };
        List.prototype.prepend = function (items) {
            items = this._splice(items, 0, IBind_1.default.ACTION_ADD);
            for (var i = 0, count = items.length; i < count; i++) {
                this._addChild(items[i]);
            }
            this._childChanged(items);
        };
        List.prototype.clear = function () {
            this._$items.length = 0;
            this._reindex();
            this._getMediator().clear(this);
            this._childChanged();
            this._nextVersion();
        };
        List.prototype.add = function (item, at) {
            if (at === undefined) {
                at = this._$items.length;
                this._$items.push(item);
            } else {
                at = at || 0;
                if (at !== 0 && !this._isValidIndex(at, true)) {
                    throw new Error('Index is out of bounds');
                }
                this._$items.splice(at, 0, item);
            }
            this._addChild(item);
            this._childChanged(item);
            this._nextVersion();
            this._reindex(IBind_1.default.ACTION_ADD, at, 1);
        };
        List.prototype.at = function (index) {
            return this._$items[index];
        };
        List.prototype.remove = function (item) {
            var index = this.getIndex(item);
            if (index !== -1) {
                this.removeAt(index);
                this._childChanged(item);
                return true;
            }
            return false;
        };
        List.prototype.removeAt = function (index) {
            if (!this._isValidIndex(index)) {
                throw new Error('Index is out of bounds');
            }
            this._removeChild(this._$items[index]);
            var deleted = this._$items.splice(index, 1);
            this._reindex(IBind_1.default.ACTION_REMOVE, index, 1);
            this._childChanged(index);
            this._nextVersion();
            return deleted[0];
        };
        List.prototype.replace = function (item, at) {
            if (!this._isValidIndex(at)) {
                throw new Error('Index is out of bounds');
            }
            var oldItem = this._$items[at];    //Replace with itself has no effect
            //Replace with itself has no effect
            if (oldItem === item) {
                return;
            }
            this._removeChild(oldItem);
            this._$items[at] = item;
            this._addChild(item);
            this._reindex(IBind_1.default.ACTION_REPLACE, at, 1);
            this._childChanged(item);
            this._nextVersion();
        };
        List.prototype.move = function (from, to) {
            if (!this._isValidIndex(from)) {
                throw new Error('Argument "from" is out of bounds');
            }
            if (!this._isValidIndex(to)) {
                throw new Error('Argument "to" is out of bounds');
            }
            if (from === to) {
                return;
            }
            var items = this._$items.splice(from, 1);
            this._$items.splice(to, 0, items[0]);
            if (from < to) {
                this._reindex(IBind_1.default.ACTION_REPLACE, from, 1 + to - from);
            } else {
                this._reindex(IBind_1.default.ACTION_REPLACE, to, 1 + from - to);
            }
            this._childChanged(items[0]);
            this._nextVersion();
        };
        List.prototype.getIndex = function (item) {
            return this._$items.indexOf(item);
        };
        List.prototype.getCount = function () {
            return this._$items.length;
        };
        List.prototype.getIndexByValue = function (property, value) {
            return this._getIndexer().getIndexByValue(property, value);
        };
        List.prototype.getIndicesByValue = function (property, value) {
            return this._getIndexer().getIndicesByValue(property, value);
        };    //endregion IIndexedCollection
              //region IEquatable
        //endregion IIndexedCollection
        //region IEquatable
        List.prototype.isEqual = function (to) {
            if (to === this) {
                return true;
            }
            if (!to || !(to instanceof List)) {
                return false;
            }
            if (this.getCount() !== to.getCount()) {
                return false;
            }
            for (var i = 0, count = this.getCount(); i < count; i++) {
                if (this.at(i) !== to.at(i)) {
                    return false;
                }
            }
            return true;
        };    //endregion IVersionable
              // SerializableMixin
        //endregion IVersionable
        // SerializableMixin
        List.prototype._getSerializableState = function (state) {
            return type_1.SerializableMixin._getSerializableState.call(this, state);
        };
        List.prototype._setSerializableState = function (state) {
            var fromSerializableMixin = type_1.SerializableMixin._setSerializableState(state);
            return function () {
                fromSerializableMixin.call(this);
                this._clearIndexer();
            };
        };    // SerializableMixin
              //region Protected methods
              /**
         * Возвращает индексатор коллекции
         * @return {WS.Data/Collection/Indexer}
         * @protected
         */
        // SerializableMixin
        //region Protected methods
        /**
         * Возвращает индексатор коллекции
         * @return {WS.Data/Collection/Indexer}
         * @protected
         */
        List.prototype._getIndexer = function () {
            return this._indexer || (this._indexer = new Indexer_1.default(this._$items, function (items) {
                return items.length;
            }, function (items, at) {
                return items[at];
            }, function (item, property) {
                return util_1.object.getPropertyValue(item, property);
            }));
        };    /**
         * Очищает индексатор коллекции
         * @protected
         */
        /**
         * Очищает индексатор коллекции
         * @protected
         */
        List.prototype._clearIndexer = function () {
            this._indexer = null;
        };    /**
         * Проверяет корректность индекса
         * @param {Number} index Индекс
         * @param {Boolean} [addMode=false] Режим добавления
         * @return {Boolean}
         * @protected
         */
        /**
         * Проверяет корректность индекса
         * @param {Number} index Индекс
         * @param {Boolean} [addMode=false] Режим добавления
         * @return {Boolean}
         * @protected
         */
        List.prototype._isValidIndex = function (index, addMode) {
            var max = this.getCount();
            if (addMode) {
                max++;
            }
            return index >= 0 && index < max;
        };    /**
         * Переиндексирует список
         * @param {WS.Data/Collection/IBind/ChangeAction.typedef[]} action Действие, приведшее к изменению.
         * @param {Number} [start=0] С какой позиции переиндексировать
         * @param {Number} [count=0] Число переиндексируемых элементов
         * @protected
         */
        /**
         * Переиндексирует список
         * @param {WS.Data/Collection/IBind/ChangeAction.typedef[]} action Действие, приведшее к изменению.
         * @param {Number} [start=0] С какой позиции переиндексировать
         * @param {Number} [count=0] Число переиндексируемых элементов
         * @protected
         */
        List.prototype._reindex = function (action, start, count) {
            if (!this._indexer) {
                return;
            }
            var indexer = this._getIndexer();
            switch (action) {
            case IBind_1.default.ACTION_ADD:
                indexer.shiftIndex(start, this.getCount() - start, count);
                indexer.updateIndex(start, count);
                break;
            case IBind_1.default.ACTION_REMOVE:
                indexer.removeFromIndex(start, count);
                indexer.shiftIndex(start + count, this.getCount() - start, -count);
                break;
            case IBind_1.default.ACTION_REPLACE:
                indexer.removeFromIndex(start, count);
                indexer.updateIndex(start, count);
                break;
            case IBind_1.default.ACTION_RESET:
                indexer.resetIndex();
                break;
            default:
                if (count > 0) {
                    indexer.removeFromIndex(start, count);
                    indexer.updateIndex(start, count);
                } else {
                    indexer.resetIndex();
                }
            }
        };    /**
         * Вызывает метод splice
         * @param {WS.Data/Collection/IEnumerable|Array} items Коллекция с элементами для замены
         * @param {Number} start Индекс в массиве, с которого начинать добавление.
         * @param {WS.Data/Collection/IBind/ChangeAction.typedef[]} action Действие, приведшее к изменению.
         * @return {Array}
         * @protected
         */
        /**
         * Вызывает метод splice
         * @param {WS.Data/Collection/IEnumerable|Array} items Коллекция с элементами для замены
         * @param {Number} start Индекс в массиве, с которого начинать добавление.
         * @param {WS.Data/Collection/IBind/ChangeAction.typedef[]} action Действие, приведшее к изменению.
         * @return {Array}
         * @protected
         */
        List.prototype._splice = function (items, start, action) {
            var _a;
            items = this._itemsToArray(items);
            (_a = this._$items).splice.apply(_a, [
                start,
                0
            ].concat(items));
            this._reindex(action, start, items.length);
            this._nextVersion();
            return items;
        };    /**
         * Приводит переденные элементы к массиву
         * @param items
         * @return {Array}
         * @protected
         */
        /**
         * Приводит переденные элементы к массиву
         * @param items
         * @return {Array}
         * @protected
         */
        List.prototype._itemsToArray = function (items) {
            if (items instanceof Array) {
                return items;
            } else if (items && items['[Data/_collection/IEnumerable]']) {
                var result_1 = [];
                items.each(function (item) {
                    result_1.push(item);
                });
                return result_1;
            } else {
                throw new TypeError('Argument "items" must be an instance of Array or implement Data/collection:IEnumerable.');
            }
        };
        return List;
    }(util_1.mixin(type_1.Abstract, type_1.OptionsMixin, type_1.ObservableMixin, type_1.SerializableMixin, type_1.CloneableMixin, type_1.ManyToManyMixin, type_1.ReadWriteMixin, type_1.VersionableMixin));
    exports.default = List;    //Properties defaults
    //Properties defaults
    List.prototype['[Data/_collection/List]'] = true;    // @ts-ignore
    // @ts-ignore
    List.prototype['[Data/_collection/IEnumerable]'] = true;    // @ts-ignore
    // @ts-ignore
    List.prototype['[Data/_collection/IIndexedCollection]'] = true;    // @ts-ignore
    // @ts-ignore
    List.prototype['[Data/_collection/IList]'] = true;    // @ts-ignore
    // @ts-ignore
    List.prototype['[Data/_type/ICloneable]'] = true;    // @ts-ignore
    // @ts-ignore
    List.prototype['[Data/_type/IEquatable]'] = true;    // @ts-ignore
    // @ts-ignore
    List.prototype['[Data/_type/IVersionable]'] = true;    // @ts-ignore
    // @ts-ignore
    List.prototype._$items = null;    // @ts-ignore
    // @ts-ignore
    List.prototype._indexer = null;    //Aliases
    //Aliases
    List.prototype.forEach = List.prototype.each;    //FIXME: backward compatibility for check via Core/core-instance::instanceOfModule()
    //FIXME: backward compatibility for check via Core/core-instance::instanceOfModule()
    List.prototype['[WS.Data/Collection/List]'] = true;    //FIXME: backward compatibility for check via Core/core-instance::instanceOfMixin()
    //FIXME: backward compatibility for check via Core/core-instance::instanceOfMixin()
    List.prototype['[WS.Data/Collection/IEnumerable]'] = true;
    List.prototype['[WS.Data/Collection/IList]'] = true;
    List.prototype['[WS.Data/Collection/IIndexedCollection]'] = true;
    List.prototype['[WS.Data/Entity/ICloneable]'] = true;
    List.prototype._moduleName = 'Data/collection:List';
    util_1.di.register('Data/collection:List', List, { instantiate: false });
});