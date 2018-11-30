define('Core/ApplyContents', [
    'require',
    'exports',
    'Core/Util/Object',
    'Core/Util'
], function (require, exports, Object_1, Util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var global = function () {
        return this || (0, eval)('this');
    }();
    if (global.contents && !Object_1.isEmpty(global.contents)) {
        Util_1.loadContents(global.contents, false, { resources: Util_1.constants.resourceRoot });
    }
});