/// <amd-module name="Router/Route" />
define('Router/Route', [
    'require',
    'exports',
    'tslib',
    'Core/Control',
    'wml!Router/Route',
    'Router/Helper',
    'Router/History'
], function (require, exports, tslib_1, Control, template, Helper_1, History_1) {
    'use strict';
    var Route = /** @class */
    function (_super) {
        tslib_1.__extends(Route, _super);
        function Route() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._urlOptions = null;
            _this._entered = false;
            _this._index = 0;
            _this._template = template;
            return _this;
        }
        Route.prototype.pathUrlOptionsFromCfg = function (cfg) {
            for (var i in cfg) {
                if (!this._urlOptions.hasOwnProperty(i) && cfg.hasOwnProperty(i) && i !== 'mask' && i !== 'content' && i !== '_logicParent') {
                    this._urlOptions[i] = cfg[i];
                }
            }
        };    /**
         * return flag = resolved params from URL
         */
        /**
         * return flag = resolved params from URL
         */
        Route.prototype._wasResolvedParam = function () {
            var notUndefVal = false;
            for (var i in this._urlOptions) {
                if (this._urlOptions.hasOwnProperty(i)) {
                    if (this._urlOptions[i] !== undefined) {
                        notUndefVal = true;
                        break;
                    }
                }
            }
            return notUndefVal;
        };
        Route.prototype._applyNewUrl = function (mask, cfg) {
            this._urlOptions = Helper_1.default.calculateUrlParams(mask, undefined, this._index);
            var notUndefVal = this._wasResolvedParam();
            this.pathUrlOptionsFromCfg(cfg);
            return notUndefVal;
        };
        Route.prototype.beforeApplyUrl = function (newLoc, oldLoc) {
            var result;
            this._urlOptions = Helper_1.default.calculateUrlParams(this._options.mask, newLoc.url, this._index);
            var wasResolvedParam = this._wasResolvedParam();
            if (wasResolvedParam) {
                this.pathUrlOptionsFromCfg(this._options);
                if (!this._entered) {
                    result = this._notify('enter', [
                        newLoc,
                        oldLoc
                    ]);
                } else {
                    result = new Promise(function (resolve) {
                        resolve(true);
                    });
                }
                this._entered = true;
            } else {
                this.pathUrlOptionsFromCfg(this._options);
                if (this._entered) {
                    result = this._notify('leave', [
                        newLoc,
                        oldLoc
                    ]);
                } else {
                    result = new Promise(function (resolve) {
                        resolve(true);
                    });
                }
                this._entered = false;
            }
            return result;
        };
        Route.prototype.afterUpForNotify = function () {
            this._urlOptions = Helper_1.default.calculateUrlParams(this._options.mask, Helper_1.default.getRelativeUrl(), this._index);
            var notUndefVal = this._wasResolvedParam();
            this.pathUrlOptionsFromCfg(this._options);
            var currentState = History_1.default.getCurrentState();
            var prevState = History_1.default.getPrevState();
            if (notUndefVal) {
                this._entered = true;
                if (!prevState) {
                    prevState = { url: Helper_1.default.calculateHref(this._options.mask, { clear: true }, undefined) };
                }
                return this._notify('enter', [
                    currentState,
                    prevState
                ]);
            }
            return new Promise(function (resolve) {
                resolve();
            });
        };
        Route.prototype.applyNewUrl = function () {
            this._forceUpdate();
        };
        Route.prototype._reserve = function (index, newUrl) {
            var res = Helper_1.default.findIndex(this._options.mask, index, newUrl);
            if (res !== -1) {
                this._index = res - 1;
            } else {
                res = index;
            }
            return res;
        };
        Route.prototype._beforeMount = function (cfg) {
            this._urlOptions = {};
            this._applyNewUrl(cfg.mask, cfg);
        };
        Route.prototype._afterMount = function () {
            this._notify('routerCreated', [this], { bubbling: true });
            this.afterUpForNotify();
        };
        Route.prototype._beforeUpdate = function (cfg) {
            this._applyNewUrl(cfg.mask, cfg);
        };
        Route.prototype._beforeUnmount = function () {
            this._notify('routerDestroyed', [this], { bubbling: true });
        };
        return Route;
    }(Control);
    return Route;
});