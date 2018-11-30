/// <amd-module name="Data/_type/adapter/Json" />
/**
 * Адаптер для данных в формате JSON.
 * Работает с данными, представленными в виде обычных JSON объектов.
 * Примеры можно посмотреть в модулях {@link WS.Data/Adapter/JsonRecord} и {@link WS.Data/Adapter/JsonTable}.
 * @class WS.Data/Adapter/Json
 * @extends WS.Data/Adapter/Abstract
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/adapter/Json', [
    'require',
    'exports',
    'tslib',
    'Data/_type/adapter/Abstract',
    'Data/_type/adapter/JsonTable',
    'Data/_type/adapter/JsonRecord',
    'Data/util'
], function (require, exports, tslib_1, Abstract_1, JsonTable_1, JsonRecord_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var Json = /** @class */
    function (_super) {
        tslib_1.__extends(Json, _super);    /** @lends WS.Data/Adapter/Json.prototype */
        /** @lends WS.Data/Adapter/Json.prototype */
        function Json() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Json.prototype.forTable = function (data) {
            return new JsonTable_1.default(data);
        };
        Json.prototype.forRecord = function (data) {
            return new JsonRecord_1.default(data);
        };
        Json.prototype.getKeyField = function () {
            return undefined;
        };
        return Json;
    }(Abstract_1.default    /** @lends WS.Data/Adapter/Json.prototype */);
    /** @lends WS.Data/Adapter/Json.prototype */
    exports.default = Json;
    Json.prototype['[Data/_type/adapter/Json]'] = true;
    Json.prototype._moduleName = 'Data/type:adapter.Json';
    util_1.di.register('Data/type:adapter.Json', Json, { instantiate: false });    //FIXME: deprecated
    //FIXME: deprecated
    util_1.di.register('adapter.json', Json);
});