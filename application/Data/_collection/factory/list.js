/// <amd-module name="Data/_collection/factory/list" />
/**
 * Фабрика для получения списка из WS.Data/Collection/IEnumerable.
 * @class WS.Data/Collection/Factory/List
 * @public
 * @author Мальцев А.А.
 */
define('Data/_collection/factory/list', [
    'require',
    'exports',
    'Data/_collection/List'
], function (require, exports, List_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
     * @alias WS.Data/Collection/Factory/List
     * @param {WS.Data/Collection/IEnumerable} items Коллекция
     * @return {WS.Data/Collection/List}
     */
    /**
     * @alias WS.Data/Collection/Factory/List
     * @param {WS.Data/Collection/IEnumerable} items Коллекция
     * @return {WS.Data/Collection/List}
     */
    function list(items) {
        if (!items || !items['[Data/_collection/IEnumerable]']) {
            throw new TypeError('Argument "items" should implement Data/collection:IEnumerable');
        }
        var itemsArray = [];
        items.each(function (item) {
            itemsArray.push(item);
        });
        return new List_1.default({ items: itemsArray });
    }
    exports.default = list;
});