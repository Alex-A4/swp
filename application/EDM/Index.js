define('EDM/Index', [
    'require',
    'exports',
    'tslib',
    'Core/Control',
    'wml!EDM/Index',
    'EDM/LocalStorage/Source'
], function (require, exports, tslib_1, Control, template, Source_1) {
    'use strict';
    var Index = /** @class */
    function (_super) {
        tslib_1.__extends(Index, _super);
        function Index() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._template = template;
            return _this;
        }
        Index.prototype.add = function () {
            Source_1.default.addDocument({
                id: '1243',
                title: 'Prodam GARAGE',
                description: 'Hochy prodat garage pod samagon',
                date: '10.11.2018',
                time: '15:32',
                author: 'Dima'
            });
        };
        Index.prototype.remove = function () {
            Source_1.default.removeDocument('1243');
        };
        Index.prototype.readAll = function () {
            Source_1.default.readAll();
        };
        Index.prototype.search = function () {
            Source_1.default.search(this.state);
        };
        Index.prototype._beforeMount = function () {
            Source_1.default.initIfNotExist();
        };
        return Index;
    }(Control);
    return Index;
});