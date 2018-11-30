define('Core/Util', [
    'require',
    'exports',
    'Core/_Util/Constants',
    'Core/_Util/Cookie',
    'Core/_Util/Compatibility',
    'Core/_Util/Detection',
    'Core/_Util/IoC',
    'Core/_Util/LoadContents',
    'Core/_Util/PatchRequireJS',
    'Core/_Util/PathResolver'
], function (require, exports, Constants_1, Cookie_1, Compatibility_1, Detection_1, IoC_1, LoadContents_1, PatchRequireJS_1, PathResolver_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.constants = Constants_1.default;
    exports.cookie = Cookie_1.default;
    exports.compatibility = Compatibility_1.default;
    exports.detection = Detection_1.default;
    exports.IoC = IoC_1.default;
    exports.loadContents = LoadContents_1.default;
    exports.patchRequireJS = PatchRequireJS_1.default;
    exports.pathResolver = PathResolver_1.default;
});