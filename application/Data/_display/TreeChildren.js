/// <amd-module name="Data/_display/TreeChildren" />
/**
 * Список дочерних элементов узла дерева.
 * @class WS.Data/Display/TreeChildren
 * @extends WS.Data/Collection/List
 * @public
 * @author Мальцев А.А.
 */
define('Data/_display/TreeChildren', [
    'require',
    'exports',
    'tslib',
    'Data/_display/TreeItem',
    'Data/collection',
    'Data/util'
], function (require, exports, tslib_1, TreeItem_1, collection_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var TreeChildren = /** @class */
    function (_super) {
        tslib_1.__extends(TreeChildren, _super);    /** @lends WS.Data/Display/TreeChildren.prototype */
        /** @lends WS.Data/Display/TreeChildren.prototype */
        function TreeChildren(options) {
            var _this = _super.call(this, options) || this;
            if (!(_this._$owner instanceof Object)) {
                throw new TypeError('Tree children owner should be an object');
            }
            if (!(_this._$owner instanceof TreeItem_1.default)) {
                throw new TypeError('Tree children owner should be an instance of Data/display:TreeItem');
            }
            return _this;
        }    /**
         * Возвращает узел-владелец
         * @return {WS.Data/Display/TreeItem}
         */
        /**
         * Возвращает узел-владелец
         * @return {WS.Data/Display/TreeItem}
         */
        TreeChildren.prototype.getOwner = function () {
            return this._$owner;
        };
        return TreeChildren;
    }(collection_1.List);
    exports.default = TreeChildren;
    TreeChildren.prototype['[Data/_display/TreeChildren]'] = true;
    TreeChildren.prototype._$owner = null;
    util_1.di.register('Data/display:TreeChildren', TreeChildren);
});