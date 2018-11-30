/// <amd-module name="Data/_util/logger" />
/**
 * Logger
 * @public
 * @author Мальцев А.А.
 */
define('Data/_util/logger', [
    'require',
    'exports',
    'Core/IoC'
], function (require, exports, IoC) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var STACK_DETECTOR = /:[0-9]+:[0-9]+/;
    var stackPoints = {};
    var logger = {
        /**
         * Пишет в лог сообщение
         * @param {String} tag Метка
         * @param {String} message Сообщение
         */
        log: function (tag, message) {
            if (arguments.length === 1) {
                message = tag;
                tag = 'Log';
            }
            IoC.resolve('ILogger').log(tag, message || '');
        },
        /**
         * Пишет в лог сообщение об ошибке
         * @param {String} tag Метка
         * @param {String} message Сообщение
         */
        error: function (tag, message) {
            if (arguments.length === 1) {
                message = tag;
                tag = 'Critical';
            }
            IoC.resolve('ILogger').error(tag, message || '');
        },
        /**
         * Пишет в лог информационное сообщение
         * @param {String} tag Метка
         * @param {String} message Сообщение
         * @static
         */
        info: function (tag, message) {
            if (arguments.length === 1) {
                message = tag;
                tag = 'Warning';
            }
            IoC.resolve('ILogger').warn(tag, message || '');
        },
        /**
         * Пишет в лог предупреждение с указанием файла, спровоцировавшего это предупреждение.
         * Для каждой точки файла предупреждение выводится только один раз.
         * @param {String} message Сообщение
         * @param {Number} [offset=0] Смещение по стеку
         * @param {String} [level=info] Уровень логирования
         */
        stack: function (message, offset, level) {
            offset = offset || 0;
            level = level || 'info';
            var error = new Error(message);
            var at = 2 + offset;    //this scope -> logStack() called scope -> error scope
            //this scope -> logStack() called scope -> error scope
            var callStack = '';
            var hash = '';
            if ('stack' in error) {
                var stack = String(error.stack).split('\n');
                if (!STACK_DETECTOR.test(stack[0])) {
                    at++;    //Error text may be at first row
                }
                //Error text may be at first row
                callStack = stack.slice(at).join('\n').trim();    // Don't repeat the same message
                // Don't repeat the same message
                hash = message + callStack;
                if (stackPoints.hasOwnProperty(hash)) {
                    return;
                }
                stackPoints[hash] = true;
            }
            IoC.resolve('ILogger')[level](error.message, callStack);
        }
    };
    exports.default = logger;
});