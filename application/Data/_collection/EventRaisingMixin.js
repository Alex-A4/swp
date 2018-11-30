/// <amd-module name="Data/_collection/EventRaisingMixin" />
/**
 * Миксин для реализации коллекции, в которой можно приостанавливать генерацию событий об изменениях с фиксацией состояния
 * @mixin WS.Data/Collection/EventRaisingMixin
 * @public
 * @author Мальцев А.А.
 */
define('Data/_collection/EventRaisingMixin', [
    'require',
    'exports',
    'Data/_collection/comparator'
], function (require, exports, comparator_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var EventRaisingMixin = /** @lends WS.Data/Entity/EventRaisingMixin.prototype */
    {
        '[Data/_type/EventRaisingMixin]': true,
        /**
         * @event onEventRaisingChange После изменения режима генерации событий
         * @param {Boolean} enabled Включена или выключена генерация событий
         * @param {Boolean} analyze Включен или выключен анализ изменений
         */
        /**
         * @member {Boolean} Генерация событий включена
         */
        _eventRaising: true,
        /**
         * @member {String} Метод получения содержимого элемента коллекции (если такое поведение поддерживается)
         */
        _sessionItemContentsGetter: '',
        /**
         * @member {Object|null} Состояние коллекции до выключения генерации событий
         */
        _beforeRaiseOff: null,
        constructor: function () {
            this._publish('onEventRaisingChange');
        },
        //region Public methods
        /**
         * Включает/выключает генерацию событий об изменении коллекции
         * @param {Boolean} enabled Включить или выключить генерацию событий
         * @param {Boolean} [analyze=false] Анализировать изменения (если включить, то при enabled = true будет произведен анализ всех изменений с момента enabled = false - сгенерируются события обо всех изменениях)
         * @example
         * Сгенерируем событие о перемещении элемента c позиции 1 на позицию 3:
         * <pre>
         *    define(['WS.Data/Collection/ObservableList', 'WS.Data/Collection/IBind'], function(ObservableList, IBindCollection) {
         *       var list = new ObservableList({
         *          items: ['one', 'two', 'three', 'four', 'five']
         *       });
         *
         *      list.subscribe('onCollectionChange', function(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
         *         action === IBindCollection.ACTION_MOVE;//true
         *
         *         oldItems[0] === 'two';//true
         *         oldItems[0] === item;//true
         *         oldItemsIndex === 1;//true
         *
         *         newItems[0] === 'two';//true
         *         newItems[0] === item;//true
         *         newItemsIndex === 3;//true
         *      });
         *
         *      list.setEventRaising(false, true);
         *      var item = list.removeAt(1);
         *      list.add(item, 3);
         *      list.setEventRaising(true, true);
         *   });
         * </pre>
         */
        setEventRaising: function (enabled, analyze) {
            enabled = !!enabled;
            analyze = !!analyze;
            var isEqual = this._eventRaising === enabled;
            if (analyze && isEqual) {
                throw new Error('The events raising is already ' + (enabled ? 'enabled' : 'disabled') + ' with analize=true');
            }
            if (analyze) {
                if (enabled) {
                    this._eventRaising = enabled;
                    this._finishUpdateSession(this._beforeRaiseOff);
                    this._beforeRaiseOff = null;
                } else {
                    this._beforeRaiseOff = this._startUpdateSession();
                    this._eventRaising = enabled;
                }
            } else {
                this._eventRaising = enabled;
            }
            if (!isEqual) {
                this._notify('onEventRaisingChange', enabled, analyze);
            }
        },
        /**
         * Возвращает признак, включена ли генерация событий об изменении проекции
         * @return {Boolean}
         */
        isEventRaising: function () {
            return this._eventRaising;
        },
        //endregion Public methods
        //region Protected methods
        /**
         * Запускает серию обновлений
         * @return {Object}
         * @protected
         */
        _startUpdateSession: function () {
            if (!this._eventRaising) {
                return null;
            }
            return comparator_1.default.startSession(this, this._sessionItemContentsGetter);
        },
        /**
         * Завершает серию обновлений
         * @param {Object} session Серия обновлений
         * @param {Boolean} [analize=true] Запустить анализ изменений
         * @protected
         */
        _finishUpdateSession: function (session, analize) {
            if (!session) {
                return;
            }
            analize = analize === undefined ? true : analize;
            comparator_1.default.finishSession(session, this, this._sessionItemContentsGetter);
            if (analize) {
                this._analizeUpdateSession(session);
            }
        },
        /**
         * Анализирует серию обновлений, генерирует события об изменениях
         * @param {Object} session Серия обновлений
         * @protected
         */
        _analizeUpdateSession: function (session) {
            var _this = this;
            if (!session) {
                return;
            }
            comparator_1.default.analizeSession(session, this, function (action, changes) {
                _this._notifyCollectionChange(action, changes.newItems, changes.newItemsIndex, changes.oldItems, changes.oldItemsIndex, session);
            });
        },
        /**
         * Генерирует событие об изменении коллекции
         * @param {String} action Действие, приведшее к изменению.
         * @param {Array} newItems Новые исходной коллекции.
         * @param {Number} newItemsIndex Индекс коллекции, в котором появились новые элементы.
         * @param {Array} oldItems Удаленные элементы коллекции.
         * @param {Number} oldItemsIndex Индекс коллекции, в котором удалены элементы.
         * @param {Object} [session] Серия обновлений
         * @protected
         */
        _notifyCollectionChange: function (action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
            if (!this._isNeedNotifyCollectionChange()) {
                return;
            }
            this._notify('onCollectionChange', action, newItems, newItemsIndex, oldItems, oldItemsIndex);
        },
        /**
         * Разбивает элементы списка на пачки в порядке их следования в списке.
         * @param {WS.Data/Collection/IList} list Список, в котором содержатся элементы.
         * @param {Array} items Элементы в произвольном порядке.
         * @param {Function} callback Функция обратного вызова для каждой пачки
         * @protected
         * @static
         */
        _extractPacksByList: function (list, items, callback) {
            var send = function (pack, index) {
                callback(pack.slice(), index);
                pack.length = 0;
            };
            var sortedItems = [];
            var item;
            var index;
            for (var i = 0; i < items.length; i++) {
                item = items[i];
                index = list.getIndex(item);
                sortedItems[index] = item;
            }
            var pack = [];
            var packIndex = 0;
            var maxIndex = sortedItems.length - 1;
            for (var index_1 = 0; index_1 <= maxIndex; index_1++) {
                item = sortedItems[index_1];
                if (!item) {
                    if (pack.length) {
                        send(pack, packIndex);
                    }
                    continue;
                }
                if (!pack.length) {
                    packIndex = index_1;
                }
                pack.push(item);
            }
            if (pack.length) {
                send(pack, packIndex);
            }
        },
        /**
         * Возвращает признак, что нужно генерировать события об изменениях коллекции
         * @return {Boolean}
         * @protected
         */
        _isNeedNotifyCollectionChange: function () {
            return this._eventRaising && this.hasEventHandlers('onCollectionChange');
        }    //endregion Protected methods
    };
    //endregion Protected methods
    exports.default = EventRaisingMixin;
});