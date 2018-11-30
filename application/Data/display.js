/// <amd-module name="Data/display" />
/**
 * Displays library
 * @library Data/display
 * @includes Abstract Data/_display/Abstract
 * @includes Collection Data/_display/Collection
 * @includes Enum Data/_display/Enum
 * @includes Flags Data/_display/Flags
 * @includes Ladder Data/_display/Ladder
 * @includes Search Data/_display/Search
 * @includes Tree Data/_display/Tree
 * @author Мальцев А.А.
 */
define('Data/display', [
    'require',
    'exports',
    'Data/_display/Abstract',
    'Data/_display/Collection',
    'Data/_display/CollectionItem',
    'Data/_display/Enum',
    'Data/_display/Flags',
    'Data/_display/FlagsItem',
    'Data/_display/GroupItem',
    'Data/_display/itemsStrategy',
    'Data/_display/Ladder',
    'Data/_display/Search',
    'Data/_display/Tree',
    'Data/_display/TreeItem'
], function (require, exports, Abstract_1, Collection_1, CollectionItem_1, Enum_1, Flags_1, FlagsItem_1, GroupItem_1, itemsStrategy, Ladder_1, Search_1, Tree_1, TreeItem_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.Abstract = Abstract_1.default;
    exports.Collection = Collection_1.default;
    exports.CollectionItem = CollectionItem_1.default;
    exports.Enum = Enum_1.default;
    exports.Flags = Flags_1.default;
    exports.FlagsItem = FlagsItem_1.default;
    exports.GroupItem = GroupItem_1.default;
    exports.itemsStrategy = itemsStrategy;
    exports.Ladder = Ladder_1.default;
    exports.Search = Search_1.default;
    exports.Tree = Tree_1.default;
    exports.TreeItem = TreeItem_1.default;
});