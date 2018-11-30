define('Core/helpers/getStackTrace', function() {

    /**
     * Возвращает стек ошибки
     * @param e - ошибка
     */
    return function (e) {
        var
            getChromeStack = function () {
                var obj = {};
                Error.captureStackTrace(obj, getChromeStack);
                return obj.stack;
            },
            stringifyArguments = function (args) {
                var result = [];
                var slice = Array.prototype.slice;
                for (var i = 0; i < args.length; ++i) {
                    var arg = args[i];
                    if (arg === undefined) {
                        result[i] = 'undefined';
                    } else if (arg === null) {
                        result[i] = 'null';
                    } else if (arg.constructor) {
                        if (arg.constructor === Array) {
                            if (arg.length < 3) {
                                result[i] = '[' + stringifyArguments(arg) + ']';
                            } else {
                                result[i] = '[' + stringifyArguments(slice.call(arg, 0, 1)) + '...' + stringifyArguments(slice.call(arg, -1)) + ']';
                            }
                        } else if (arg.constructor === Object) {
                            result[i] = '#object';
                        } else if (arg.constructor === Function) {
                            result[i] = '#function';
                        } else if (arg.constructor === String) {
                            result[i] = '"' + arg + '"';
                        } else if (arg.constructor === Number) {
                            result[i] = arg;
                        }
                    }
                }
                return result.join(',');
            },
            other = function (curr) {
                var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i, trace = [], fn, args, maxStackSize = 40;
                while (curr && curr['arguments'] && trace.length < maxStackSize) {
                    fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
                    args = Array.prototype.slice.call(curr['arguments'] || []);
                    trace[trace.length] = fn + '(' + stringifyArguments(args) + ')';
                    curr = curr.caller;
                }
                return trace.join('\r\n');
            },
            stack;

        if (e && e.stack) {
            stack = e.stack;
        } else {
            if (Error && Error.captureStackTrace) {
                stack = getChromeStack();
            } else if ((stack = Error().stack)) {
                return stack;
            } else {
                // ie11 thinks he is in strict mode. Yes, some kind of...
                try {
                    stack = other(arguments.callee);
                } catch (e) {
                    stack = '';
                }
            }
        }
        return stack;
    };
});