/// <amd-module name="Data/_collection/format" />
/**
 * Formats library.
 * @library Data/_collection/format
 * @includes Factory Data/_collection/format/factory
 * @includes Format Data/_collection/format/Format
 * @author Мальцев А.А.
 */
define('Data/_collection/format', [
    'require',
    'exports',
    'Data/_collection/format/factory',
    'Data/_collection/format/Format'
], function (require, exports, factory_1, Format_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.factory = factory_1.default;
    exports.Format = Format_1.default;
});