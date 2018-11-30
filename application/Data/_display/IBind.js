/// <amd-module name="Data/_display/IBind" />
/**
 * Интерфейс привязки к проекции коллекции
 * @interface WS.Data/Display/IBindCollection
 * @public
 * @author Мальцев А.А.
 */
define('Data/_display/IBind', [
    'require',
    'exports',
    'Data/collection'
], function (require, exports, collection_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var IBind = /** @lends WS.Data/Display/IBindCollection.prototype */
    {
        '[Data/_display/IBind]': true,
        /**
         * @const {String} Изменение коллекции: добавлены элементы
         */
        ACTION_ADD: collection_1.IBind.ACTION_ADD,
        /**
         * @const {String} Изменение коллекции: удалены элементы
         */
        ACTION_REMOVE: collection_1.IBind.ACTION_REMOVE,
        /**
         * @const {String} Изменение коллекции: изменены элементы
         */
        ACTION_CHANGE: collection_1.IBind.ACTION_CHANGE,
        /**
         * @const {String} Изменение коллекции: заменены элементы
         */
        ACTION_REPLACE: collection_1.IBind.ACTION_REPLACE,
        /**
         * @const {String} Изменение коллекции: перемещены элементы
         */
        ACTION_MOVE: collection_1.IBind.ACTION_MOVE,
        /**
         * @const {String} Изменение коллекции: значительное изменение
         */
        ACTION_RESET: collection_1.IBind.ACTION_RESET    /**
         * @event onCollectionChange После изменения коллекции
         * @param {Core/EventObject} event Дескриптор события.
         * @param {WS.Data/Collection/IBind#ChangeAction} action Действие, приведшее к изменению.
         * @param {WS.Data/Display/CollectionItem[]} newItems Новые элементы коллекции.
         * @param {Number} newItemsIndex Индекс, в котором появились новые элементы.
         * @param {WS.Data/Display/CollectionItem[]} oldItems Удаленные элементы коллекции.
         * @param {Number} oldItemsIndex Индекс, в котором удалены элементы.
         * @param {String} groupId Идентификатор группы, в которой произошли изменения
         * @example
         * <pre>
         *    define([
         *       'WS.Data/Collection/ObservableList',
         *       'WS.Data/Display/Collection',
         *       'WS.Data/Display/IBindCollection'
         *    ], function(
         *       ObservableList,
         *       CollectionDisplay,
         *       IBindCollection
         *    ) {
         *       var list = new ObservableList(),
         *          display = new CollectionDisplay({
         *             collection: list
         *          });
         *
         *       display.subscribe('onCollectionChange', function(eventObject, action){
         *          if (action == IBindCollection.ACTION_REMOVE){
         *             //Do something with removed items
         *          }
         *       });
         *    });
         * </pre>
         */
    };
    /**
         * @event onCollectionChange После изменения коллекции
         * @param {Core/EventObject} event Дескриптор события.
         * @param {WS.Data/Collection/IBind#ChangeAction} action Действие, приведшее к изменению.
         * @param {WS.Data/Display/CollectionItem[]} newItems Новые элементы коллекции.
         * @param {Number} newItemsIndex Индекс, в котором появились новые элементы.
         * @param {WS.Data/Display/CollectionItem[]} oldItems Удаленные элементы коллекции.
         * @param {Number} oldItemsIndex Индекс, в котором удалены элементы.
         * @param {String} groupId Идентификатор группы, в которой произошли изменения
         * @example
         * <pre>
         *    define([
         *       'WS.Data/Collection/ObservableList',
         *       'WS.Data/Display/Collection',
         *       'WS.Data/Display/IBindCollection'
         *    ], function(
         *       ObservableList,
         *       CollectionDisplay,
         *       IBindCollection
         *    ) {
         *       var list = new ObservableList(),
         *          display = new CollectionDisplay({
         *             collection: list
         *          });
         *
         *       display.subscribe('onCollectionChange', function(eventObject, action){
         *          if (action == IBindCollection.ACTION_REMOVE){
         *             //Do something with removed items
         *          }
         *       });
         *    });
         * </pre>
         */
    exports.default = IBind;
});