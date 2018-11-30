// <amd-module name="Core/Util/Object" />
define('Core/Util/Function', [
    'require',
    'exports',
    'Core/Util/_Function/CallAround',
    'Core/Util/_Function/CallBefore',
    'Core/Util/_Function/CallBeforeWithCondition',
    'Core/Util/_Function/CallIf',
    'Core/Util/_Function/CallNext',
    'Core/Util/_Function/CallNextWithCondition',
    'Core/Util/_Function/Debounce',
    'Core/Util/_Function/ForAliveDeferred',
    'Core/Util/_Function/ForAliveOnly',
    'Core/Util/_Function/Memoize',
    'Core/Util/_Function/Once',
    'Core/Util/_Function/RunDelayed',
    'Core/Util/_Function/ShallowClone',
    'Core/Util/_Function/Throttle'
], function (require, exports, CallAround_1, CallBefore_1, CallBeforeWithCondition_1, CallIf_1, CallNext_1, CallNextWithCondition_1, Debounce_1, ForAliveDeferred_1, ForAliveOnly_1, Memoize_1, Once_1, RunDelayed_1, ShallowClone_1, Throttle_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.callAround = CallAround_1.default;
    exports.callBefore = CallBefore_1.default;
    exports.callBeforeWithCondition = CallBeforeWithCondition_1.default;
    exports.callIf = CallIf_1.default;
    exports.callNext = CallNext_1.default;
    exports.callNextWithCondition = CallNextWithCondition_1.default;
    exports.debounce = Debounce_1.default;
    exports.forAliveDeferred = ForAliveDeferred_1.default;
    exports.forAliveOnly = ForAliveOnly_1.default;
    exports.memoize = Memoize_1.default;
    exports.once = Once_1.default;
    exports.runDelayed = RunDelayed_1.default;
    exports.shallowClone = ShallowClone_1.default;
    exports.throttle = Throttle_1.default;
});