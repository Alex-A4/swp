define('Core/Util/_Array/IsPlainArray', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function isPlainArray(arr) {
        return Array.isArray(arr);
    }
    exports.default = isPlainArray;
});