/// <amd-module name="Data/_type/functor" />
/**
 * Functors library.
 * @library Data/_type/functor
 * @includes Compute Data/_type/functor/Compute
 * @author Мальцев А.А.
 */
define('Data/_type/functor', [
    'require',
    'exports',
    'Data/_type/functor/Compute'
], function (require, exports, Compute_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.Compute = Compute_1.default;
});