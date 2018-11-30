/// <amd-module name="Data/_display/itemsStrategy" />
/**
 * Items strategy library
 * @library Data/_display/itemsStrategy
 * @includes Abstract Data/_display/itemsStrategy/Abstract
 * @includes Direct Data/_display/itemsStrategy/Direct
 * @author Мальцев А.А.
 */
define('Data/_display/itemsStrategy', [
    'require',
    'exports',
    'Data/_display/itemsStrategy/AbstractStrategy',
    'Data/_display/itemsStrategy/AdjacencyList',
    'Data/_display/itemsStrategy/Composer',
    'Data/_display/itemsStrategy/Direct',
    'Data/_display/itemsStrategy/Group',
    'Data/_display/itemsStrategy/MaterializedPath',
    'Data/_display/itemsStrategy/Root',
    'Data/_display/itemsStrategy/Search',
    'Data/_display/itemsStrategy/User'
], function (require, exports, AbstractStrategy_1, AdjacencyList_1, Composer_1, Direct_1, Group_1, MaterializedPath_1, Root_1, Search_1, User_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.AbstractStrategy = AbstractStrategy_1.default;
    exports.AdjacencyList = AdjacencyList_1.default;
    exports.Composer = Composer_1.default;
    exports.Direct = Direct_1.default;
    exports.Group = Group_1.default;
    exports.MaterializedPath = MaterializedPath_1.default;
    exports.Root = Root_1.default;
    exports.Search = Search_1.default;
    exports.User = User_1.default;
});