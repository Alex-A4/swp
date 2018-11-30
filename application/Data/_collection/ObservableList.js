/// <amd-module name="Data/_collection/ObservableList" />
/**
 * Список, в котором можно отслеживать изменения.
 * <pre>
 *    define(['WS.Data/Collection/ObservableList', 'WS.Data/Collection/IBind'], function(ObservableList, IBindCollection) {
 *       var list = new ObservableList({
 *          items: [1, 2, 3]
 *       });
 *
 *       list.subscribe('onCollectionChange', function(eventObject, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
 *          if (action == IBindCollection.ACTION_REMOVE){
 *             console.log(oldItems);//[1]
 *             console.log(oldItemsIndex);//0
 *          }
 *       });
 *
 *       list.removeAt(0);
 *    });
 * </pre>
 * @class WS.Data/Collection/ObservableList
 * @extends WS.Data/Collection/List
 * @implements WS.Data/Collection/IBind
 * @implements WS.Data/Mediator/IReceiver
 * @mixes WS.Data/Collection/EventRaisingMixin
 * @public
 * @author Мальцев А.А.
 */
define('Data/_collection/ObservableList', [
    'require',
    'exports',
    'tslib',
    'Data/_collection/IBind',
    'Data/_collection/List',
    'Data/_collection/EventRaisingMixin',
    'Data/util'
], function (require, exports, tslib_1, IBind_1, List_1, EventRaisingMixin_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var arraySlice = Array.prototype.slice;
    var ObservableList = /** @class */
    function (_super) {
        tslib_1.__extends(ObservableList, _super);
        function ObservableList(options) {
            var _this = _super.call(this, options) || this;
            EventRaisingMixin_1.default.constructor.call(_this, options);
            _this._publish('onCollectionChange', 'onCollectionItemChange');
            return _this;
        }    //region List
        //region List
        ObservableList.prototype.assign = function (items) {
            var oldItems = this._itemsSlice();
            var eventsWasRaised = this._eventRaising;
            this._eventRaising = false;
            _super.prototype.assign.call(this, items);
            this._eventRaising = eventsWasRaised;
            if (oldItems.length > 0 || this._$items.length > 0) {
                this._notifyCollectionChange(IBind_1.default.ACTION_RESET, this._itemsSlice(), 0, oldItems, 0);
            }
        };
        ObservableList.prototype.append = function (items) {
            var eventsWasRaised = this._eventRaising;
            this._eventRaising = false;
            var count = this.getCount();
            _super.prototype.append.call(this, items);
            this._eventRaising = eventsWasRaised;
            this._notifyCollectionChange(IBind_1.default.ACTION_ADD, this._itemsSlice(count), count, [], 0);
        };
        ObservableList.prototype.prepend = function (items) {
            var eventsWasRaised = this._eventRaising;
            this._eventRaising = false;
            var length = this.getCount();
            _super.prototype.prepend.call(this, items);
            this._eventRaising = eventsWasRaised;
            this._notifyCollectionChange(IBind_1.default.ACTION_ADD, this._itemsSlice(0, this.getCount() - length), 0, [], 0);
        };
        ObservableList.prototype.clear = function () {
            var oldItems = this._$items.slice();
            var eventsWasRaised = this._eventRaising;
            this._eventRaising = false;
            _super.prototype.clear.call(this);
            this._eventRaising = eventsWasRaised;
            this._notifyCollectionChange(IBind_1.default.ACTION_RESET, this._itemsSlice(), 0, oldItems, 0);
        };
        ObservableList.prototype.add = function (item, at) {
            _super.prototype.add.call(this, item, at);
            at = this._isValidIndex(at) ? at : this.getCount() - 1;
            this._notifyCollectionChange(IBind_1.default.ACTION_ADD, this._itemsSlice(at, at + 1), at, [], 0);
        };
        ObservableList.prototype.removeAt = function (index) {
            var item = _super.prototype.removeAt.call(this, index);
            this._notifyCollectionChange(IBind_1.default.ACTION_REMOVE, [], 0, [item], index);
            return item;
        };
        ObservableList.prototype.replace = function (item, at) {
            var oldItem = this._$items[at];
            _super.prototype.replace.call(this, item, at);    //Replace with itself has no effect
            //Replace with itself has no effect
            if (oldItem !== item) {
                this._notifyCollectionChange(IBind_1.default.ACTION_REPLACE, this._itemsSlice(at, at + 1), at, [oldItem], at);
            }
        };
        ObservableList.prototype.move = function (from, to) {
            var item = this._$items[from];
            _super.prototype.move.call(this, from, to);
            if (from !== to) {
                this._notifyCollectionChange(IBind_1.default.ACTION_MOVE, [item], to, [item], from);
            }
        };
        ObservableList.prototype.relationChanged = function (which, route) {
            var target = which.target;
            var index = this.getIndex(target);
            var data = {};
            if (index > -1) {
                this._reindex('', index, 1);
            }
            var name = route[0];
            if (name === undefined) {
                this._notifyItemChange(target, which.data || {});
            }
            data[index] = target;
            return {
                target: target,
                data: data
            };
        };    //endregion IReceiver
              //region EventRaisingMixin
        //endregion IReceiver
        //region EventRaisingMixin
        ObservableList.prototype.setEventRaising = function (enabled, analyze) {
            var _this = this;
            EventRaisingMixin_1.default.setEventRaising.call(this, enabled, analyze);    //Если стрелять событиями до синхронизации то проекция не всегда сможет найти стрельнувший item или найдет не тот
            //Если стрелять событиями до синхронизации то проекция не всегда сможет найти стрельнувший item или найдет не тот
            if (enabled && analyze && this._silentChangedItems) {
                if (this._silentChangedItems.length >= Math.min(this._resetChangesCount, this._$items.length)) {
                    //Если изменилось критическое число элементов, то генерируем reset
                    this._notifyCollectionChange(IBind_1.default.ACTION_RESET, this._itemsSlice(), 0, [], 0);
                } else {
                    //Собираем изменившиеся элементы в пачки
                    EventRaisingMixin_1.default._extractPacksByList(this, this._silentChangedItems, function (pack, index) {
                        _this._notifyCollectionChange(IBind_1.default.ACTION_CHANGE, pack, index, pack, index);
                    });
                }
            }
            delete this._silentChangedItems;
        };    //endregion EventRaisingMixin
              //region Protected methods
              /**
         * Генерирует событие об изменении элемента
         * @param {*} item Элемент
         * @param {Object} properties Изменившиеся свойства
         */
        //endregion EventRaisingMixin
        //region Protected methods
        /**
         * Генерирует событие об изменении элемента
         * @param {*} item Элемент
         * @param {Object} properties Изменившиеся свойства
         */
        ObservableList.prototype._notifyItemChange = function (item, properties) {
            if (this._isNeedNotifyCollectionItemChange()) {
                var index = this.getIndex(item);
                this._notify('onCollectionItemChange', this._$items[index], index, properties);
            }
            if ((this.hasEventHandlers('onCollectionItemChange') || this.hasEventHandlers('onCollectionChange')) && !this._eventRaising) {
                if (!this._silentChangedItems) {
                    this._silentChangedItems = [];
                }
                this._silentChangedItems.push(item);
            }
        };    /**
         * Извлекает элементы, входящие в указанный отрезок
         * @param {Number} [begin] Индекс, по которому начинать извлечение.
         * @param {Number} [end] Индекс, по которому заканчивать извлечение.
         * @return {Array}
         * @protected
         */
        /**
         * Извлекает элементы, входящие в указанный отрезок
         * @param {Number} [begin] Индекс, по которому начинать извлечение.
         * @param {Number} [end] Индекс, по которому заканчивать извлечение.
         * @return {Array}
         * @protected
         */
        ObservableList.prototype._itemsSlice = function (begin, end) {
            return arraySlice.apply(this._$items, arguments);
        };    /**
         * Возвращает признак, что нужно генерировать события об изменениях элементов коллекции
         * @return {Boolean}
         * @protected
         */
        /**
         * Возвращает признак, что нужно генерировать события об изменениях элементов коллекции
         * @return {Boolean}
         * @protected
         */
        ObservableList.prototype._isNeedNotifyCollectionItemChange = function () {
            return this._eventRaising && this.hasEventHandlers('onCollectionItemChange');
        };
        return ObservableList;
    }(util_1.mixin(List_1.default, IBind_1.default, EventRaisingMixin_1.default));
    exports.default = ObservableList;
    ObservableList.prototype['[Data/_collection/ObservableList]'] = true;    // @ts-ignore
    // @ts-ignore
    ObservableList.prototype['[Data/_type/relation/IReceiver]'] = true;
    ObservableList.prototype._moduleName = 'Data/collection:ObservableList';
    ObservableList.prototype._resetChangesCount = 100;
    util_1.di.register('Data/collection:ObservableList', ObservableList, { instantiate: false });
});