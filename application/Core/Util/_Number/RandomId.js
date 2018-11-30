define('Core/Util/_Number/RandomId', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function default_1(prefix) {
        return (prefix || 'ws-') + Math.random().toString(36).substr(2) + +new Date();
    }
    exports.default = default_1;
});