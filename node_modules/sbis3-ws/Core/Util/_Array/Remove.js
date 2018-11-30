define('Core/Util/_Array/Remove', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function remove(arr, index, count) {
        var resCount = count || 1;
        if (!(arr instanceof Array)) {
            throw new TypeError('Incorrect type of the first arguments. Array expected');
        }
        return arr.splice(index, resCount);
    }
    exports.default = remove;
});