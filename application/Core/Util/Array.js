define('Core/Util/Array', [
    'require',
    'exports',
    'Core/Util/_Array/Clone',
    'Core/Util/_Array/FindIndex',
    'Core/Util/_Array/Flatten',
    'Core/Util/_Array/IndexOf',
    'Core/Util/_Array/Insert',
    'Core/Util/_Array/IsPlainArray',
    'Core/Util/_Array/LastIndexOf',
    'Core/Util/_Array/Remove',
    'Core/Util/_Array/Uniq'
], function (require, exports, Clone_1, FindIndex_1, Flatten_1, IndexOf_1, Insert_1, IsPlainArray_1, LastIndexOf_1, Remove_1, Uniq_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.clone = Clone_1.default;
    exports.findIndex = FindIndex_1.default;
    exports.flatten = Flatten_1.default;
    exports.indexOf = IndexOf_1.default;
    exports.insert = Insert_1.default;
    exports.isPlainArray = IsPlainArray_1.default;
    exports.lastIndexOf = LastIndexOf_1.default;
    exports.remove = Remove_1.default;
    exports.uniq = Uniq_1.default;
});