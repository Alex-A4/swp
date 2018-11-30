/// <amd-module name="Data/_display/itemsStrategy/Root" />
/**
 * Стратегия-декоратор для формирования корня дерева
 * @class WS.Data/Display/ItemsStrategy/Root
 * @extends WS.Data/Entity/Abstract
 * @implements WS.Data/Display/IItemsStrategy
 * @mixes WS.Data/Entity/SerializableMixin
 * @author Мальцев А.А.
 */
define('Data/_display/itemsStrategy/Root', [
    'require',
    'exports',
    'tslib',
    'Data/type',
    'Data/util'
], function (require, exports, tslib_1, type_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var Root = /** @class */
    function (_super) {
        tslib_1.__extends(Root, _super);    /**
         * Конструктор
         * @param {Options} options Опции
         */
        /**
         * Конструктор
         * @param {Options} options Опции
         */
        function Root(options) {
            var _this = _super.call(this) || this;    //region IItemsStrategy
            //region IItemsStrategy
            _this['[Data/_display/IItemsStrategy]'] = true;
            _this._options = options;
            return _this;
        }
        Object.defineProperty(Root.prototype, 'root', {
            /**
             * Корень дерева
             */
            get: function () {
                return this._options.root();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Root.prototype, 'source', {
            get: function () {
                return this._options.source;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Root.prototype, 'options', {
            get: function () {
                return this.source.options;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Root.prototype, 'count', {
            get: function () {
                return this.source.count + 1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Root.prototype, 'items', {
            get: function () {
                return [this.root].concat(this.source.items);
            },
            enumerable: true,
            configurable: true
        });
        Root.prototype.at = function (index) {
            if (index === 0) {
                return this.root;
            } else {
                return this.source.at(index - 1);
            }
        };
        Root.prototype.splice = function (start, deleteCount, added) {
            return this.source.splice(start, deleteCount, added);
        };
        Root.prototype.reset = function () {
            return this.source.reset();
        };
        Root.prototype.invalidate = function () {
            return this.source.invalidate();
        };
        Root.prototype.getDisplayIndex = function (index) {
            if (isNaN(parseInt(String(index), 10))) {
                return -1;
            }
            index = this.source.getDisplayIndex(index);
            return index === -1 ? index : 1 + index;
        };
        Root.prototype.getCollectionIndex = function (index) {
            return this.source.getCollectionIndex(index - 1);
        };    //endregion
              //region SerializableMixin
        //endregion
        //region SerializableMixin
        Root.prototype._getSerializableState = function (state) {
            state = type_1.SerializableMixin._getSerializableState.call(this, state);
            state.$options = this._options;
            return state;
        };
        Root.prototype._setSerializableState = function (state) {
            var fromSerializableMixin = type_1.SerializableMixin._setSerializableState(state);
            return function () {
                fromSerializableMixin.call(this);
            };
        };
        return Root;
    }(util_1.mixin(type_1.Abstract, type_1.SerializableMixin));
    exports.default = Root;
    Root.prototype._moduleName = 'Data/display:itemsStrategy.Root';
    Root.prototype['[Data/_display/itemsStrategy/Root]'] = true;
});