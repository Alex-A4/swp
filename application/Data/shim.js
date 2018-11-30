/// <amd-module name="Data/shim" />
/**
 * Compatibility layer library
 * @library Data/shim
 * @includes Abstract Data/_shim/Map
 * @includes Abstract Data/_shim/Set
 * @author Мальцев А.А.
 */
define('Data/shim', [
    'require',
    'exports',
    'Data/_shim/Map',
    'Data/_shim/Set'
], function (require, exports, Map_1, Set_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.Map = Map_1.default;
    exports.Set = Set_1.default;
});