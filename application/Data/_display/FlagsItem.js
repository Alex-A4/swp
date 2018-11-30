/// <amd-module name="Data/_display/FlagsItem" />
/**
 * Элемент коллекции флагов
 * @class WS.Data/Display/FlagsItem
 * @extends WS.Data/Display/CollectionItem
 * @public
 * @author Мальцев А.А.
 */
define('Data/_display/FlagsItem', [
    'require',
    'exports',
    'tslib',
    'Data/_display/CollectionItem',
    'Data/util'
], function (require, exports, tslib_1, CollectionItem_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var FlagsItem = /** @class */
    function (_super) {
        tslib_1.__extends(FlagsItem, _super);    /** @lends WS.Data/Display/FlagsItem.prototype */
        /** @lends WS.Data/Display/FlagsItem.prototype */
        function FlagsItem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FlagsItem.prototype.isSelected = function () {
            return this._$owner.getCollection().get(this._$contents, this._$owner.localize);
        };
        FlagsItem.prototype.setSelected = function (selected) {
            if (this.isSelected() === selected) {
                return;
            }
            this._$owner.getCollection().set(this._$contents, selected, this._$owner.localize);
        };
        return FlagsItem;
    }(CollectionItem_1.default    /** @lends WS.Data/Display/FlagsItem.prototype */);
    /** @lends WS.Data/Display/FlagsItem.prototype */
    exports.default = FlagsItem;
    FlagsItem.prototype._moduleName = 'Data/display:FlagsItem';
    FlagsItem.prototype['[Data/_display/FlagsItem]'] = true;
    util_1.di.register('Data/display:FlagsItem', FlagsItem);
});