/// <amd-module name="Data/_type/relation/OneToMany" />
/**
 * Посредник, реализующий отношения "один ко многим".
 * @class WS.Data/Mediator/OneToMany
 * @extends WS.Data/Entity/Abstract
 * @author Мальцев А.А.
 */
define('Data/_type/relation/OneToMany', [
    'require',
    'exports',
    'tslib',
    'Data/_type/Abstract',
    'Data/shim'
], function (require, exports, tslib_1, Abstract_1, shim_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
     * Проверяет, что объект "живой" (не был уничтожен)
     * @param {Object} item Объект
     * @return {Boolean}
     */
    /**
     * Проверяет, что объект "живой" (не был уничтожен)
     * @param {Object} item Объект
     * @return {Boolean}
     */
    function isAlive(item) {
        return item instanceof Object && item['[Data/_type/Abstract]'] ? !item.destroyed : true;
    }
    var OneToMany = /** @class */
    function (_super) {
        tslib_1.__extends(OneToMany, _super);    /** @lends WS.Data/Mediator/OneToMany.prototype */
        /** @lends WS.Data/Mediator/OneToMany.prototype */
        function OneToMany() {
            var _this = _super.call(this) || this;
            _this._parentToChild = new shim_1.Map();
            _this._childToParent = new shim_1.Map();
            _this._childToRelation = new shim_1.Map();
            return _this;
        }
        OneToMany.prototype.destroy = function () {
            this._parentToChild = null;
            this._childToParent = null;
            this._childToRelation = null;
            _super.prototype.destroy.call(this);
        };    //region WS.Data/Mediator/IMediator
              //endregion WS.Data/Mediator/IMediator
              //region Public methods
              /**
         * Добавляет отношение "родитель - ребенок"
         * @param {Object} parent Родитель
         * @param {Object} child Ребенок
         * @param {String} [name] Название отношений
         */
        //region WS.Data/Mediator/IMediator
        //endregion WS.Data/Mediator/IMediator
        //region Public methods
        /**
         * Добавляет отношение "родитель - ребенок"
         * @param {Object} parent Родитель
         * @param {Object} child Ребенок
         * @param {String} [name] Название отношений
         */
        OneToMany.prototype.addTo = function (parent, child, name) {
            this._addForParent(parent, child);
            this._addForChild(child, parent, name);
        };    /**
         * Удаляет отношение "родитель - ребенок"
         * @param {Object} parent Родитель
         * @param {Object} child Ребенок
         */
        /**
         * Удаляет отношение "родитель - ребенок"
         * @param {Object} parent Родитель
         * @param {Object} child Ребенок
         */
        OneToMany.prototype.removeFrom = function (parent, child) {
            this._removeForParent(parent, child);
            this._removeForChild(child, parent);
        };    /**
         * Очищает все отношения c детьми у указанного родителя
         * @param {Object} parent Родитель
         */
        /**
         * Очищает все отношения c детьми у указанного родителя
         * @param {Object} parent Родитель
         */
        OneToMany.prototype.clear = function (parent) {
            var _this = this;
            if (this._parentToChild.has(parent)) {
                this._parentToChild.get(parent).forEach(function (child) {
                    _this._removeForChild(child, parent);
                });
                this._parentToChild.delete(parent);
            }
        };    /**
         * Возвращает всех детей для указанного родителя
         * @param {Object} parent Родитель
         * @param {Function(Object, String)} callback Функция обратного вызова для каждого ребенка
         */
        /**
         * Возвращает всех детей для указанного родителя
         * @param {Object} parent Родитель
         * @param {Function(Object, String)} callback Функция обратного вызова для каждого ребенка
         */
        OneToMany.prototype.each = function (parent, callback) {
            var _this = this;
            if (this._parentToChild.has(parent)) {
                this._parentToChild.get(parent).forEach(function (child) {
                    if (isAlive(child)) {
                        callback.call(_this, child, _this._childToParent.get(child) === parent ? _this._childToRelation.get(child) : undefined);
                    }
                });
            }
        };    /**
         * Возвращает родителя для указанного ребенка
         * @param {Object} child Ребенок
         * @return {Object}
         */
        /**
         * Возвращает родителя для указанного ребенка
         * @param {Object} child Ребенок
         * @return {Object}
         */
        OneToMany.prototype.getParent = function (child) {
            var parent = this._childToParent.get(child);
            return parent !== undefined && isAlive(parent) ? parent : undefined;
        };    //endregion Public methods
              //region Protected methods
              /**
         * Добавляет ребенка в список родителя
         * @param {Object} parent Родитель
         * @param {Object} child Ребенок
         * @protected
         */
        //endregion Public methods
        //region Protected methods
        /**
         * Добавляет ребенка в список родителя
         * @param {Object} parent Родитель
         * @param {Object} child Ребенок
         * @protected
         */
        OneToMany.prototype._addForParent = function (parent, child) {
            var children;
            if (this._parentToChild.has(parent)) {
                children = this._parentToChild.get(parent);
            } else {
                children = new shim_1.Set();
                this._parentToChild.set(parent, children);
            }
            children.add(child);
        };    /**
         * Удаляет ребенка из списка родителя
         * @param {Object} parent Родитель
         * @param {Object} child Ребенок
         * @protected
         */
        /**
         * Удаляет ребенка из списка родителя
         * @param {Object} parent Родитель
         * @param {Object} child Ребенок
         * @protected
         */
        OneToMany.prototype._removeForParent = function (parent, child) {
            if (this._parentToChild.has(parent)) {
                var children = this._parentToChild.get(parent);
                children.delete(child);
                if (children.size === 0) {
                    this._parentToChild.delete(parent);
                }
            }
        };    /**
         * Добавляет связь ребенка с родителем
         * @param {Object} child Ребенок
         * @param {Object} parent Родитель
         * @param {String} name Название отношения
         * @protected
         */
        /**
         * Добавляет связь ребенка с родителем
         * @param {Object} child Ребенок
         * @param {Object} parent Родитель
         * @param {String} name Название отношения
         * @protected
         */
        OneToMany.prototype._addForChild = function (child, parent, name) {
            this._childToParent.set(child, parent);
            this._childToRelation.set(child, name);
        };    /**
         * Удаляет связь ребенка с родителем
         * @param {Object} child Ребенок
         * @param {Object} parent Родитель
         * @protected
         */
        /**
         * Удаляет связь ребенка с родителем
         * @param {Object} child Ребенок
         * @param {Object} parent Родитель
         * @protected
         */
        OneToMany.prototype._removeForChild = function (child, parent) {
            if (this._childToParent.get(child) === parent) {
                this._childToParent.delete(child);
                this._childToRelation.delete(child);
            }
        };
        return OneToMany;
    }(Abstract_1.default    /** @lends WS.Data/Mediator/OneToMany.prototype */);
    /** @lends WS.Data/Mediator/OneToMany.prototype */
    exports.default = OneToMany;
    OneToMany.prototype['[Data/_type/relation/OneToMany]'] = true;
    OneToMany.prototype._parentToChild = null;
    OneToMany.prototype._childToParent = null;
    OneToMany.prototype._childToRelation = null;
});