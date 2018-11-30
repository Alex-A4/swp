/// <amd-module name="Data/_shim/Set" />
/**
 * Limited emulation of standard built-in object "Set" if it's not supported.
 * Follow {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Set} for details.
 * @author Мальцев А.А.
 */
define('Data/_shim/Set', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    //Use native implementation if supported
    //Use native implementation if supported
    var SetImplementation;
    if (typeof Set === 'undefined') {
        SetImplementation = /** @class */
        function () {
            function class_1() {
                this.clear();
            }
            class_1.prototype.add = function (value) {
                var key = this._isObject(value) ? this._addObject(value) : value;
                this._hash[SetImplementation._getHashedKey(key)] = value;
                return this;
            };
            class_1.prototype.clear = function () {
                this._hash = {};
                this._objects = [];
            };
            class_1.prototype.delete = function (value) {
                var key;
                if (this._isObject(value)) {
                    key = this._deleteObject(value);
                    if (!key) {
                        return;
                    }
                } else {
                    key = value;
                }
                this._hash[SetImplementation._getHashedKey(key)] = undefined;
            };
            class_1.prototype.entries = function () {
                throw new Error('Method is not supported');
            };
            class_1.prototype.forEach = function (callbackFn, thisArg) {
                //FIXME: now not in insertion order
                var hash = this._hash;
                for (var key in hash) {
                    if (hash.hasOwnProperty(key) && hash[key] !== undefined) {
                        callbackFn.call(thisArg, hash[key], hash[key], this);
                    }
                }
            };
            class_1.prototype.has = function (value) {
                var key;
                if (this._isObject(value)) {
                    key = this._getObjectKey(value);
                    if (!key) {
                        return false;
                    }
                } else {
                    key = value;
                }
                key = SetImplementation._getHashedKey(key);
                return this._hash.hasOwnProperty(key) && this._hash[key] !== undefined;
            };
            class_1.prototype.keys = function () {
                throw new Error('Method is not supported');
            };
            class_1.prototype.values = function () {
                throw new Error('Method is not supported');
            };
            class_1.prototype._isObject = function (value) {
                return value && typeof value === 'object';
            };
            class_1.prototype._addObject = function (value) {
                var index = this._objects.indexOf(value);
                if (index === -1) {
                    index = this._objects.length;
                    this._objects.push(value);
                }
                return this._objectPrefix + index;
            };
            class_1.prototype._deleteObject = function (value) {
                var index = this._objects.indexOf(value);
                if (index > -1) {
                    this._objects[index] = null;
                    return this._objectPrefix + index;
                }
                return undefined;
            };
            class_1.prototype._getObjectKey = function (value) {
                var index = this._objects.indexOf(value);
                if (index === -1) {
                    return undefined;
                }
                return this._objectPrefix + index;
            };
            class_1._getHashedKey = function (key) {
                return typeof key + '@' + key;
            };
            return class_1;
        }();    // @ts-ignore
        // @ts-ignore
        SetImplementation.prototype._hash = null;    // @ts-ignore
        // @ts-ignore
        SetImplementation.prototype._objectPrefix = '{[object]}:';    // @ts-ignore
        // @ts-ignore
        SetImplementation.prototype._objects = null;
        Object.defineProperty(SetImplementation.prototype, 'size', {
            get: function () {
                return Object.keys(this._hash).length;
            },
            enumerable: true,
            configurable: false
        });
    } else {
        SetImplementation = Set;
    }
    exports.default = SetImplementation;
});