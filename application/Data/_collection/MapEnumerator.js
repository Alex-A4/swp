/// <amd-module name="Data/_collection/MapEnumerator" />
/**
 * Энумератор для Map
 * @class WS.Data/Collection/MapEnumerator
 * @implements WS.Data/Collection/IEnumerator
 * @public
 * @author Мальцев А.А.
 */
define('Data/_collection/MapEnumerator', [
    'require',
    'exports',
    'Data/shim'
], function (require, exports, shim_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var MapEnumerator = /** @class */
    function () {
        /**
         * Конструктор
         * @param {Map} items Массив
         */
        function MapEnumerator(items) {
            this['[Data/_collection/IEnumerator]'] = true;
            if (items === undefined) {
                items = new shim_1.Map();
            }
            if (!(items instanceof shim_1.Map)) {
                throw new Error('Argument items should be an instance of Map');
            }
            this._items = items;
        }
        Object.defineProperty(MapEnumerator.prototype, '_keys', {
            /**
             * @property {Array} Ключи
             */
            get: function () {
                if (!this._cachedKeys) {
                    var keys_1 = [];
                    this._items.forEach(function (value, key) {
                        keys_1.push(key);
                    });
                    this._cachedKeys = keys_1;
                }
                return this._cachedKeys;
            },
            enumerable: true,
            configurable: true
        });    // region Data/_collection/IEnumerator
        // region Data/_collection/IEnumerator
        MapEnumerator.prototype.getCurrent = function () {
            return this._index === -1 ? undefined : this._items.get(this._keys[this._index]);
        };
        MapEnumerator.prototype.moveNext = function () {
            var keys = this._keys;
            if (this._index >= keys.length - 1) {
                return false;
            }
            this._index++;
            return true;
        };
        MapEnumerator.prototype.reset = function () {
            this._cachedKeys = undefined;
            this._index = -1;
        };    // endregion Data/_collection/IEnumerator
              // region Public methods
        // endregion Data/_collection/IEnumerator
        // region Public methods
        MapEnumerator.prototype.getCurrentIndex = function () {
            return this._keys[this._index];
        };
        return MapEnumerator;
    }();
    exports.default = MapEnumerator;
    MapEnumerator.prototype['[Data/_collection/MapEnumerator]'] = true;    // @ts-ignore
    // @ts-ignore
    MapEnumerator.prototype._items = null;    // @ts-ignore
    // @ts-ignore
    MapEnumerator.prototype._index = -1;    // @ts-ignore
    // @ts-ignore
    MapEnumerator.prototype._cachedKeys = undefined;
});