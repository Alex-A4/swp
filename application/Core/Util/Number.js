define('Core/Util/Number', [
    'require',
    'exports',
    'Core/Util/_Number/RandomId',
    'Core/Util/_Number/ToRoman'
], function (require, exports, RandomId_1, ToRoman_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.randomId = RandomId_1.default;
    exports.toRoman = ToRoman_1.default;
});