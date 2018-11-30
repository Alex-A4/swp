/// <amd-module name="Data/_display/GroupItem" />
/**
 * Группа элементов
 * @class WS.Data/Display/GroupItem
 * @extends WS.Data/Display/CollectionItem
 * @public
 * @author Мальцев А.А.
 */
define('Data/_display/GroupItem', [
    'require',
    'exports',
    'tslib',
    'Data/_display/CollectionItem',
    'Data/util'
], function (require, exports, tslib_1, CollectionItem_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var GroupItem = /** @class */
    function (_super) {
        tslib_1.__extends(GroupItem, _super);    /** @lends WS.Data/Display/GroupItem.prototype */
        /** @lends WS.Data/Display/GroupItem.prototype */
        function GroupItem(options) {
            var _this = _super.call(this, options) || this;
            _this._$expanded = !!_this._$expanded;
            return _this;
        }    /**
         * Возвращает признак, что узел развернут
         * @return {Boolean}
         */
        /**
         * Возвращает признак, что узел развернут
         * @return {Boolean}
         */
        GroupItem.prototype.isExpanded = function () {
            return this._$expanded;
        };    /**
         * Устанавливает признак, что узел развернут или свернут
         * @param {Boolean} expanded Развернут или свернут узел
         * @param {Boolean} [silent=false] Не генерировать событие
         */
        /**
         * Устанавливает признак, что узел развернут или свернут
         * @param {Boolean} expanded Развернут или свернут узел
         * @param {Boolean} [silent=false] Не генерировать событие
         */
        GroupItem.prototype.setExpanded = function (expanded, silent) {
            if (this._$expanded === expanded) {
                return;
            }
            this._$expanded = expanded;
            if (!silent) {
                this._notifyItemChangeToOwner('expanded');
            }
        };    /**
         * Переключает признак, что узел развернут или свернут
         */
        /**
         * Переключает признак, что узел развернут или свернут
         */
        GroupItem.prototype.toggleExpanded = function () {
            this.setExpanded(!this.isExpanded());
        };
        return GroupItem;
    }(CollectionItem_1.default    /** @lends WS.Data/Display/GroupItem.prototype */);
    /** @lends WS.Data/Display/GroupItem.prototype */
    exports.default = GroupItem;
    GroupItem.prototype._moduleName = 'Data/display:GroupItem';
    GroupItem.prototype['[Data/_display/GroupItem]'] = true;    // @ts-ignore
    // @ts-ignore
    GroupItem.prototype._instancePrefix = 'group-item-';    // @ts-ignore
    // @ts-ignore
    GroupItem.prototype._$expanded = true;    // Deprecated
    // Deprecated
    GroupItem.prototype['[WS.Data/Display/GroupItem]'] = true;
    util_1.di.register('Data/display:GroupItem', GroupItem);
});