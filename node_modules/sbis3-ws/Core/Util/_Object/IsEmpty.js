define('Core/Util/_Object/IsEmpty', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function isEmpty(obj) {
        if (obj === null || typeof obj !== 'object') {
            return false;
        }
        if (obj instanceof Object) {
            for (var i in obj) {
                return false;
            }
        } else if (obj instanceof Array) {
            return obj.length === 0;
        }
        return true;
    }
    exports.default = isEmpty;
});