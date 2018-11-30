define('Core/Debug', [
    'require',
    'exports',
    'Core/_Debug/ConsoleLogger',
    'Core/_Debug/Debug'
], function (require, exports, ConsoleLogger_1, Debug_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.ConsoleLogger = ConsoleLogger_1.default;
    exports.Debug = Debug_1.default;
});