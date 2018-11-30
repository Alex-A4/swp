/// <amd-module name="Data/_source/LazyMixin" />
/**
 * Миксин, позволяющий загружать некоторые зависимости лениво.
 * @mixin WS.Data/Source/LazyMixin
 * @public
 * @author Мальцев А.А.
 */
define('Data/_source/LazyMixin', [
    'require',
    'exports',
    'Core/Deferred',
    'require'
], function (require, exports, Deferred, req) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var global = (0, eval)('this');
    var DeferredCanceledError = global.DeferredCanceledError;
    var LazyMixin = /** @lends WS.Data/Source/LazyMixin.prototype */
    {
        '[Data/_source/LazyMixin]': true,
        /**
         * @property {Array.<String>} Список зависимостей, которые нужно загружать лениво
         */
        _additionalDependencies: [
            'WS.Data/Source/DataSet',
            'WS.Data/Entity/Model',
            'WS.Data/Collection/RecordSet'
        ],
        /**
         * Загружает дополнительные зависимости
         * @param {Function(Core/Deferred)} [callback] Функция обратного вызова при успешной загрузке зависимостей
         * @return {Core/Deferred}
         * @protected
         */
        _loadAdditionalDependencies: function (callback) {
            var _this = this;
            var deps = this._additionalDependencies;
            var depsLoaded = deps.reduce(function (prev, curr) {
                return prev && req.defined(curr);
            }, true);
            var result = new Deferred();
            if (depsLoaded) {
                if (callback) {
                    callback.call(this, result);
                } else {
                    result.callback();
                }
            } else {
                // XXX: this case isn't covering by tests because all dependencies are always loaded in tests
                req(deps, function () {
                    // Don't call callback() if deferred has been cancelled during require
                    if (callback && (!result.isReady() || !(result.getResult() instanceof DeferredCanceledError))) {
                        callback.call(_this, result);
                    } else {
                        result.callback();
                    }
                }, function (error) {
                    return result.errback(error);
                });
            }
            return result;
        },
        /**
         * Связывает два деферреда, назначая результат работы ведущего результом ведомого.
         * @param {Core/Deferred} master Ведущий
         * @param {Core/Deferred} slave Ведомый
         * @protected
         */
        _connectAdditionalDependencies: function (master, slave) {
            //Cancel master on slave cancelling
            if (!slave.isCallbacksLocked()) {
                slave.addErrback(function (err) {
                    if (err instanceof DeferredCanceledError) {
                        master.cancel();
                    }
                    return err;
                });
            }    //Connect master's result with slave's result
            //Connect master's result with slave's result
            master.addCallbacks(function (result) {
                slave.callback(result);
                return result;
            }, function (err) {
                slave.errback(err);
                return err;
            });
        }
    };
    exports.default = LazyMixin;
});