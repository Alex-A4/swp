/// <amd-module name="Router/Link" />
define('Router/Link', [
    'require',
    'exports',
    'tslib',
    'Core/Control',
    'wml!Router/Link',
    'Router/Helper',
    'css!Router/Link'
], function (require, exports, tslib_1, Control, template, Helper_1) {
    'use strict';
    var Link = /** @class */
    function (_super) {
        tslib_1.__extends(Link, _super);
        function Link() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._href = '';
            _this._prettyhref = '';
            _this._template = template;
            return _this;
        }
        Link.prototype.clickHandler = function (e) {
            e.preventDefault();
            e.stopPropagation();
            this._notify('routerUpdated', [
                this._href,
                this._prettyhref
            ], { bubbling: true });
        };
        Link.prototype._beforeMount = function (cfg) {
            this._recalcHref(cfg);
        };
        Link.prototype._afterMount = function () {
            this._notify('linkCreated', [this], { bubbling: true });
        };
        Link.prototype._beforeUpdate = function (cfg) {
            this._recalcHref(cfg);
        };
        Link.prototype._beforeUnmount = function () {
            this._notify('linkDestroyed', [this], { bubbling: true });
        };
        Link.prototype._recalcHref = function (cfg) {
            this._href = Helper_1.default.calculateHref(cfg.href, cfg, undefined);
            if (cfg.prettyUrl) {
                this._prettyhref = Helper_1.default.calculateHref(cfg.prettyUrl, cfg, undefined);
            } else {
                this._prettyhref = undefined;
            }
        };
        Link.prototype.recalcHref = function () {
            this._recalcHref(this._options);
            this._forceUpdate();
        };
        return Link;
    }(Control);
    return Link;
});