/// <amd-module name="Data/_display/BreadcrumbsItem" />
/**
 * Хлебная крошка
 * @class WS.Data/Display/BreadcrumbsItem
 * @extends WS.Data/Display/CollectionItem
 * @public
 * @author Мальцев А.А.
 */
define('Data/_display/BreadcrumbsItem', [
    'require',
    'exports',
    'tslib',
    'Data/_display/CollectionItem',
    'Data/util'
], function (require, exports, tslib_1, CollectionItem_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var BreadcrumbsItem = /** @class */
    function (_super) {
        tslib_1.__extends(BreadcrumbsItem, _super);    /** @lends WS.Data/Display/BreadcrumbsItem.prototype */
        /** @lends WS.Data/Display/BreadcrumbsItem.prototype */
        function BreadcrumbsItem(options) {
            return _super.call(this, options) || this;
        }    // region Public methods
        // region Public methods
        BreadcrumbsItem.prototype.getContents = function () {
            var root = this._$owner ? this._$owner.getRoot() : {};
            var current = this._$last;
            var contents = [];    // Go up from last item until end
            // Go up from last item until end
            while (current) {
                contents.unshift(current.getContents());
                current = current.getParent();
                if (current === root) {
                    break;
                }
            }
            return contents;
        };
        BreadcrumbsItem.prototype.setContents = function () {
            throw new ReferenceError('BreadcrumbsItem contents is read only.');
        };
        return BreadcrumbsItem;
    }(CollectionItem_1.default    /** @lends WS.Data/Display/BreadcrumbsItem.prototype */);
    /** @lends WS.Data/Display/BreadcrumbsItem.prototype */
    exports.default = BreadcrumbsItem;
    BreadcrumbsItem.prototype._moduleName = 'Data/display:BreadcrumbsItem';
    BreadcrumbsItem.prototype['[Data/_display/BreadcrumbsItem]'] = true;    // @ts-ignore
    // @ts-ignore
    BreadcrumbsItem.prototype._$last = null;
    util_1.di.register('Data/display:BreadcrumbsItem', BreadcrumbsItem);
});