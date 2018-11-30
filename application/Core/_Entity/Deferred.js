define('Core/_Entity/Deferred', [
    'require',
    'exports',
    'Core/Util',
    'Core/Debug'
], function (require, exports, Util_1, Debug_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function DeferredCanceledError(message) {
        this.message = message;
        this.canceled = true;
    }
    DeferredCanceledError.prototype = Object.create(Error.prototype);
    var global = function () {
        return this || (0, eval)('this');
    }();
    global.DeferredCanceledError = DeferredCanceledError;
    var WAITING = -1, SUCCESS = 0, FAILED = 1, CANCELED = 2, CHAIN_INDEXES = [
            0,
            1,
            1
        ], STATE_NAMES = {};
    STATE_NAMES[WAITING] = 'waiting';
    STATE_NAMES[SUCCESS] = 'success';
    STATE_NAMES[FAILED] = 'failed';
    STATE_NAMES[CANCELED] = 'canceled';
    var Deferred = /** @class */
    function () {
        /**
         * @param {Object} [cfg] Конфигурация. Содержит опцию: cancelCallback - функция,
         *    реализующая отмену на уровне кода, управляющего этим Deferred-ом.
         * @example
         * <pre>
         *    var dfr;
         *    var timeoutId = setTimeout(function() {
         *      console.log('TIMEOUT'); doSomething(); dfr.callback();
         *    }, 1000);
         *    var dfr = new Deferred({
         *      cancelCallback: function() {
         *         clearTimeout(timeoutId);
         *      }
         *    });
         *    dfr.cancel();//таймаут timeoutId отменится, его обработчик не выполнится (console.log, doSomething, и т.п.)
         * </pre>
         */
        function Deferred(cfg) {
            if (cfg) {
                if (cfg.cancelCallback) {
                    this._cancelCallback = cfg.cancelCallback;
                }
            }
            this._chained = false;
            this._chain = [];
            this._fired = WAITING;
            this._paused = 0;
            this._results = [
                null,
                null
            ];
            this._running = false;
        }    /**
         * Отменяет Deferred. Отмена работает только тогда, когда он находится в состоянии ожидания (когда на нём ещё не были
         * вызваны методы callback/errback/cancel), иначе метод cancel не делает ничего.
         * Если в конструкторе в опции cancelCallback ему была передана функция отмены, то при первом вызове метода cancel
         * она вызовется (только если Deferred ещё не сработал и не отменён).
         * @returns {Core/Deferred}
         */
        /**
         * Отменяет Deferred. Отмена работает только тогда, когда он находится в состоянии ожидания (когда на нём ещё не были
         * вызваны методы callback/errback/cancel), иначе метод cancel не делает ничего.
         * Если в конструкторе в опции cancelCallback ему была передана функция отмены, то при первом вызове метода cancel
         * она вызовется (только если Deferred ещё не сработал и не отменён).
         * @returns {Core/Deferred}
         */
        Deferred.prototype.cancel = function () {
            if (this._fired === WAITING) {
                // Состояние CANCELED нужно выставить в самом начале, чтобы вызов методов callback/errback,
                // возможный из cancelCallback, срабатывал бы вхолостую, и не мешал бы выполняться обработчикам, вызванным из
                // _fire отмены
                this._fired = CANCELED;
                this._results[CHAIN_INDEXES[this._fired]] = new DeferredCanceledError('Cancel');    /** Если Deferred получен от Promise, вызываем abort у Promise;
                 *  https://online.sbis.ru/opendoc.html?guid=b7d3305f-6805-46e8-8502-8e9ed46639bf
                 */
                /** Если Deferred получен от Promise, вызываем abort у Promise;
                 *  https://online.sbis.ru/opendoc.html?guid=b7d3305f-6805-46e8-8502-8e9ed46639bf
                 */
                if (this.__parentPromise && this.__parentPromise.abort) {
                    this.__parentPromise.abort();
                }
                if (this._cancelCallback) {
                    var cbk = this._cancelCallback;
                    this._cancelCallback = null;
                    try {
                        cbk();
                    } catch (err) {
                        Util_1.IoC.resolve('ILogger').error('Deferred', 'Cancel function throwing an error: ' + err.message, err);
                    }
                }
                this._fire();
            }
            return this;
        };    /**
         * Запускает на выполнение цепочку коллбэков.
         * Метод должен вызываться только на несработавшем или отменённом объекте, иначе он выдаст ошибку.
         * На отменённом объекте (после вызова метода cancel) callback/errback можно вызывать сколько угодно -
         * ошибки не будет, метод отработает вхолостую.
         * @param [res] результат асинхронной операции, передаваемой в коллбэк.
         * @returns {Core/Deferred}
         */
        /**
         * Запускает на выполнение цепочку коллбэков.
         * Метод должен вызываться только на несработавшем или отменённом объекте, иначе он выдаст ошибку.
         * На отменённом объекте (после вызова метода cancel) callback/errback можно вызывать сколько угодно -
         * ошибки не будет, метод отработает вхолостую.
         * @param [res] результат асинхронной операции, передаваемой в коллбэк.
         * @returns {Core/Deferred}
         */
        Deferred.prototype.callback = function (res) {
            if (!isCanceled(this)) {
                this._resback(this._check(res));
            }
            return this;
        };    /**
         * Запуск цепочки обработки err-бэков.
         * Метод должен вызываться только на несработавшем или отменённом объекте, иначе он выдаст ошибку.
         * На отменённом объекте (после вызова метода cancel) callback/errback можно вызывать сколько угодно -
         * ошибки не будет, метод отработает вхолостую.
         * @param [res] результат асинхронной операции.
         * @param checkCallback включить проверку наличия callback обработки ошибок
         * @returns {Core/Deferred}
         */
        /**
         * Запуск цепочки обработки err-бэков.
         * Метод должен вызываться только на несработавшем или отменённом объекте, иначе он выдаст ошибку.
         * На отменённом объекте (после вызова метода cancel) callback/errback можно вызывать сколько угодно -
         * ошибки не будет, метод отработает вхолостую.
         * @param [res] результат асинхронной операции.
         * @param checkCallback включить проверку наличия callback обработки ошибок
         * @returns {Core/Deferred}
         */
        Deferred.prototype.errback = function (res, checkCallback) {
            if (!isCanceled(this)) {
                this._resback(this._check(res, true, checkCallback));
            }
            return this;
        };
        Deferred.prototype._resback = function (res) {
            // после вызова callback/errback/cancel отмена работает вхолостую, поэтому функция отмены (cancelCallback) после
            // _resback точно не понадобится, и её можно обнулить, чтобы GC её мог собрать пораньше
            this._cancelCallback = null;
            this._fired = resultToFired(res);
            this._results[CHAIN_INDEXES[this._fired]] = res;
            this._fire();
        };
        Deferred.prototype._check = function (res, isError, checkCallback) {
            var result = res;
            if (this._fired !== WAITING) {
                throw new Error('Deferred is already fired with state "' + STATE_NAMES[this._fired] + '"');
            }
            if (isDeferredValue(result)) {
                throw new Error('Deferred instances can only be chained if they are the result of a callback');
            }
            if (isError) {
                if (checkCallback !== false && Util_1.constants.isNodePlatform && !this._chain.some(function (pair) {
                        return typeof pair[1] === 'function';
                    })) {
                    Util_1.IoC.resolve('ILogger').error('Deferred', 'There is no callbacks attached to handle error');
                }
                if (!isErrorValue(result)) {
                    result = new Error(result);    // Исправляем поведение IE8.
                                                   // Error(1) == { number: 1 }, Error("1") == { number: 1 }, Error("x1") == { message: "x1" }
                                                   // Если после создания ошибки в ней есть поле number, содержащее число, а в message - пусто,
                                                   // скастуем к строке и запишем в message
                    // Исправляем поведение IE8.
                    // Error(1) == { number: 1 }, Error("1") == { number: 1 }, Error("x1") == { message: "x1" }
                    // Если после создания ошибки в ней есть поле number, содержащее число, а в message - пусто,
                    // скастуем к строке и запишем в message
                    if (result.number !== undefined && !Number.isNaN(result.number) && !result.message) {
                        result.message = '' + result.number;
                    }
                }
            }
            return result;
        };    /**
         * Добавляет один коллбэк как на ошибку, так и на успех
         * @param {Function} fn общий коллбэк.
         * @returns {Core/Deferred}
         */
        /**
         * Добавляет один коллбэк как на ошибку, так и на успех
         * @param {Function} fn общий коллбэк.
         * @returns {Core/Deferred}
         */
        Deferred.prototype.addBoth = function (fn) {
            if (arguments.length !== 1) {
                throw new Error('No extra args supported');
            }
            return this.addCallbacks(fn, fn);
        };    /**
         * Добавляет один коллбэк как на ошибку, так и на успех
         * @param {Function} onFinally функция-обработчик
         * @returns {Promise}
         */
        /**
         * Добавляет один коллбэк как на ошибку, так и на успех
         * @param {Function} onFinally функция-обработчик
         * @returns {Promise}
         */
        Deferred.prototype.finally = function (onFinally) {
            var callback = function () {
                return res;
            };
            var errback = function () {
                return err;
            };
            var promise = new Promise(function (resolve, reject) {
                callback = resolve;
                errback = reject;
            }).then(onFinally, onFinally);    // finally не поддерживается Node < 10
            // finally не поддерживается Node < 10
            this.addCallbacks(function () {
                return callback();
            }, function () {
                return errback();
            });
            return promise;
        };    /**
         * Добавляет колбэк на успех
         * @param {Function} fn коллбэк на успех.
         * @returns {Core/Deferred}
         */
        /**
         * Добавляет колбэк на успех
         * @param {Function} fn коллбэк на успех.
         * @returns {Core/Deferred}
         */
        Deferred.prototype.addCallback = function (fn) {
            if (arguments.length !== 1) {
                throw new Error('No extra args supported');
            }
            return this.addCallbacks(fn, null);
        };    /**
         * Добавляет обработчики на успех и на ошибку
         * @param {Function} onFulfilled функция-обработчик на успех
         * @param {Function} [onRejected] функция-обработчик на ошибку
         * @returns {Promise}
         */
        /**
         * Добавляет обработчики на успех и на ошибку
         * @param {Function} onFulfilled функция-обработчик на успех
         * @param {Function} [onRejected] функция-обработчик на ошибку
         * @returns {Promise}
         */
        Deferred.prototype.then = function (onFulfilled, onRejected) {
            var callback = function (res) {
                return res;
            };
            var errback = function (err) {
                return err;
            };
            var promise = new Promise(function (resolve, reject) {
                callback = resolve;
                errback = reject;
            }).then(onFulfilled, onRejected);
            this.addCallbacks(function (res) {
                return callback(res);
            }, function (err) {
                return errback(err);
            });
            return promise;
        };    /**
         * Добавляет колбэк на ошибку
         * @param {Function} fn коллбэк на ошибку.
         * @returns {Core/Deferred}
         */
        /**
         * Добавляет колбэк на ошибку
         * @param {Function} fn коллбэк на ошибку.
         * @returns {Core/Deferred}
         */
        Deferred.prototype.addErrback = function (fn) {
            if (arguments.length !== 1) {
                throw new Error('No extra args supported');
            }
            return this.addCallbacks(null, fn);
        };    /**
         * Добавляет обработчик на ошибку
         * @param {Function} onRejected функция-обработчик на ошибку
         * @returns {Promise} Promise
         */
        /**
         * Добавляет обработчик на ошибку
         * @param {Function} onRejected функция-обработчик на ошибку
         * @returns {Promise} Promise
         */
        Deferred.prototype.catch = function (onRejected) {
            var errback = function (err) {
                return err;
            };
            var promise = new Promise(function (resolve, reject) {
                errback = reject;
            }).catch(onRejected);
            this.addErrback(function (err) {
                return errback(err);
            });
            return promise;
        };    /**
         * Добавляет два коллбэка, один на успешный результат, другой на ошибку
         * @param {Function} cb коллбэк на успешный результат.
         * @param {Function} eb коллбэк на ошибку.
         * @returns {Core/Deferred}
         */
        /**
         * Добавляет два коллбэка, один на успешный результат, другой на ошибку
         * @param {Function} cb коллбэк на успешный результат.
         * @param {Function} eb коллбэк на ошибку.
         * @returns {Core/Deferred}
         */
        Deferred.prototype.addCallbacks = function (cb, eb) {
            if (this._chained) {
                throw new Error('Chained Deferreds can not be re-used');
            }
            if (cb !== null && typeof cb !== 'function' || eb !== null && typeof eb !== 'function') {
                throw new Error('Both arguments required in addCallbacks');
            }
            var fired = this._fired, waiting = fired === WAITING || this._running || this._paused > 0;
            if (waiting || cb && fired === SUCCESS || eb && (fired === FAILED || fired === CANCELED)) {
                this._chain.push([
                    cb,
                    eb
                ]);
                if (!waiting) {
                    // не запускаем выполнение цепочки при добавлении нового элемента, если цепочка уже выполняется
                    this._fire();
                }
            }
            return this;
        };    /**
         * Вся логика обработки результата.
         * Вызов коллбэков-еррбэков, поддержка вложенного Deferred
         */
        /**
         * Вся логика обработки результата.
         * Вызов коллбэков-еррбэков, поддержка вложенного Deferred
         */
        Deferred.prototype._fire = function () {
            var chain = this._chain;
            var fired = this._fired;
            var res = this._results[CHAIN_INDEXES[fired]];
            var self = this;
            var cb = null;
            while (chain.length > 0 && this._paused === 0) {
                var pair = chain.shift();
                var f = pair[CHAIN_INDEXES[fired]];
                if (f === null) {
                    continue;
                }
                try {
                    // Признак того, что Deferred сейчас выполняет цепочку
                    this._running = true;
                    res = Debug_1.Debug.methodExecutionTime(f, this, [res]);
                    fired = resultToFired(res);
                    if (isDeferredValue(res)) {
                        cb = function (cbRes) {
                            self._paused--;
                            self._resback(cbRes);
                        };
                        this._paused++;
                    }
                } catch (err) {
                    fired = FAILED;
                    res = isErrorValue(err) ? err : new Error(err);
                    Util_1.IoC.resolve('ILogger').error('Deferred', 'Callback function throwing an error: ' + err.message, err);
                } finally {
                    this._running = false;
                }
            }
            this._fired = fired;
            this._results[CHAIN_INDEXES[fired]] = res;
            if (cb && this._paused) {
                res.addBoth(cb);
                res._chained = true;
            }
        };    /**
         * Объявляет данный текущий Deferred зависимым от другого.
         * Колбэк/Еррбэк текущего Deferred будет вызван при соотвествтующем событии в "мастер"-Deferred.
         *
         * @param {Core/Deferred} master Deferred, от которого будет зависеть данный.
         * @returns {Core/Deferred}
         */
        /**
         * Объявляет данный текущий Deferred зависимым от другого.
         * Колбэк/Еррбэк текущего Deferred будет вызван при соотвествтующем событии в "мастер"-Deferred.
         *
         * @param {Core/Deferred} master Deferred, от которого будет зависеть данный.
         * @returns {Core/Deferred}
         */
        Deferred.prototype.dependOn = function (master) {
            var _this = this;
            master.addCallbacks(function (v) {
                _this.callback(v);
                return v;
            }, function (e) {
                _this.errback(e);
                return e;
            });
            return this;
        };    /**
         * Создаёт новый Deferred, зависимый от этого.
         * Колбэк/Еррбэк этого Deferred-а будут вызваны при соотвествтующем событии исходного.
         *
         * @returns {Core/Deferred}
         */
        /**
         * Создаёт новый Deferred, зависимый от этого.
         * Колбэк/Еррбэк этого Deferred-а будут вызваны при соотвествтующем событии исходного.
         *
         * @returns {Core/Deferred}
         */
        Deferred.prototype.createDependent = function () {
            var dependent = new Deferred();
            return dependent.dependOn(this);
        };    /**
         * Проверяет возможность вызова методов callback/errback
         * @param {Boolean} [withChain=false] Проверять, отработала ли цепочка обработчиков.
         * @returns {Boolean} Готов или нет этот экземпляр (стрельнул с каким-то результатом)
         */
        /**
         * Проверяет возможность вызова методов callback/errback
         * @param {Boolean} [withChain=false] Проверять, отработала ли цепочка обработчиков.
         * @returns {Boolean} Готов или нет этот экземпляр (стрельнул с каким-то результатом)
         */
        Deferred.prototype.isReady = function (withChain) {
            // Признак _paused тут учитывать не надо, потому что isReady говорит именно о наличии результата этого
            // Deferred-а (и возможности или невозможности вызывать методы callback/errback),
            // а не о состоянии цепочки его обработчиков.
            return this._fired !== WAITING && (withChain ? !this._paused : true);
        };    /**
         * Показывает, не запрещено ли пользоваться методами, добавляющими обработчики:
         * addCallbacks/addCallback/addErrback/addBoth.
         * Не влияет на возможность вызова методов callback/errback.
         * @return {Boolean} true: добавлять обработчики запрещено. false: добавлять обработчики можно.
         */
        /**
         * Показывает, не запрещено ли пользоваться методами, добавляющими обработчики:
         * addCallbacks/addCallback/addErrback/addBoth.
         * Не влияет на возможность вызова методов callback/errback.
         * @return {Boolean} true: добавлять обработчики запрещено. false: добавлять обработчики можно.
         */
        Deferred.prototype.isCallbacksLocked = function () {
            return this._chained;
        };    /**
         * Проверяет, завершился ли данный экземпляр успехом
         * @returns {Boolean} Завершился ли данный экземпляр успехом
         */
        /**
         * Проверяет, завершился ли данный экземпляр успехом
         * @returns {Boolean} Завершился ли данный экземпляр успехом
         */
        Deferred.prototype.isSuccessful = function () {
            return this._fired === SUCCESS;
        };    /**
         * Возвращает текущее значение Deferred.
         * @returns Текущее значение Deferred
         * @throws {Error} Когда значения еще нет.
         */
        /**
         * Возвращает текущее значение Deferred.
         * @returns Текущее значение Deferred
         * @throws {Error} Когда значения еще нет.
         */
        Deferred.prototype.getResult = function () {
            if (this.isReady()) {
                return this._results[CHAIN_INDEXES[this._fired]];
            }
            throw new Error('No result at this moment. Deferred is still not ready');
        };    /**
         * Возвращает Deferred, который завершится успехом через указанное время.
         * @param {Number} delay Значение в миллисекундах.
         * @returns {Core/Deferred}
         * @example
         * <pre>
         *    //выполнит обработчик через 5 секунд
         *    var def = Deferred.fromTimer(5000);
         *    def.addCallback(function(){
         *     //код обработчика
         *    });
         * </pre>
         */
        /**
         * Возвращает Deferred, который завершится успехом через указанное время.
         * @param {Number} delay Значение в миллисекундах.
         * @returns {Core/Deferred}
         * @example
         * <pre>
         *    //выполнит обработчик через 5 секунд
         *    var def = Deferred.fromTimer(5000);
         *    def.addCallback(function(){
         *     //код обработчика
         *    });
         * </pre>
         */
        Deferred.fromTimer = function (delay) {
            var d = new Deferred();
            setTimeout(d.callback.bind(d), delay);
            return d;
        };    /**
         * Возвращает Deferred, завершившийся успехом.
         * @param {*} [result] Результат выполнения.
         * @returns {Core/Deferred}
         * @example
         * <pre>
         *    var def = Deferred.success('bar');
         *    //выполнит обработчик и передаст в него результат.
         *    def.addCallback(function(res) {
         *       // Выведет в консоль 'bar'
         *       console.log(res);
         *    });
         * </pre>
         */
        /**
         * Возвращает Deferred, завершившийся успехом.
         * @param {*} [result] Результат выполнения.
         * @returns {Core/Deferred}
         * @example
         * <pre>
         *    var def = Deferred.success('bar');
         *    //выполнит обработчик и передаст в него результат.
         *    def.addCallback(function(res) {
         *       // Выведет в консоль 'bar'
         *       console.log(res);
         *    });
         * </pre>
         */
        Deferred.success = function (result) {
            return new Deferred().callback(result);
        };    /**
         * Возвращает Deferred, завершившийся ошибкой.
         * @param {*|Error} [result] - результат выполнения.
         * @returns {Core/Deferred}
         * @example
         * <pre>
         *    var def = Deferred.fail('Bug');
         *    // Выполнит обработчик и передаст в него результат.
         *    def.addErrback(function(err) {
         *       console.log(err.message); // Выведет в консоль 'Bug'
         *    });
         * </pre>
         */
        /**
         * Возвращает Deferred, завершившийся ошибкой.
         * @param {*|Error} [result] - результат выполнения.
         * @returns {Core/Deferred}
         * @example
         * <pre>
         *    var def = Deferred.fail('Bug');
         *    // Выполнит обработчик и передаст в него результат.
         *    def.addErrback(function(err) {
         *       console.log(err.message); // Выведет в консоль 'Bug'
         *    });
         * </pre>
         */
        Deferred.fail = function (result) {
            var err = result instanceof Error ? result : new Error(result ? String(result) : '');
            return new Deferred().errback(err, false);
        };    /**
         * Возвращает Deferred, который завершится успехом или ошибкой, сразу же как завершится успехом или
         * ошибкой любой из переданных Deferred.
         * @param {Array} steps Набор из нескольких отложенных результатов.
         * @returns {Core/Deferred}
         * @example
         * <pre>
         * var query = (new BLObject('Клиент')).call('Параметры');
         *
         * // Если запрос к БЛ займёт более 10 секунд, то Deferred завершится успехом, но вернёт undefined в результате.
         * var def = Deferred.nearestOf([Deferred.fromTimer(10000), query]);
         * def.addCallback(function(res){
         *    if (res.from === 0) {
         *
         *       // Обработка случая не завершённого запроса к БЛ, занимающего продолжительное время.
         *       helpers.alert('Ваш запрос обрабатывается слишком долго.');
         *    } else {
         *       var recordSet = res.data;
         *       // Логика обработки полученных данных.
         *    }
         * });
         * def.addErrback(function(res) {
         *   // В res.data придёт экземпляр ошибки, если один из запросов завершился ошибкой.
         * });
         * </pre>
         */
        /**
         * Возвращает Deferred, который завершится успехом или ошибкой, сразу же как завершится успехом или
         * ошибкой любой из переданных Deferred.
         * @param {Array} steps Набор из нескольких отложенных результатов.
         * @returns {Core/Deferred}
         * @example
         * <pre>
         * var query = (new BLObject('Клиент')).call('Параметры');
         *
         * // Если запрос к БЛ займёт более 10 секунд, то Deferred завершится успехом, но вернёт undefined в результате.
         * var def = Deferred.nearestOf([Deferred.fromTimer(10000), query]);
         * def.addCallback(function(res){
         *    if (res.from === 0) {
         *
         *       // Обработка случая не завершённого запроса к БЛ, занимающего продолжительное время.
         *       helpers.alert('Ваш запрос обрабатывается слишком долго.');
         *    } else {
         *       var recordSet = res.data;
         *       // Логика обработки полученных данных.
         *    }
         * });
         * def.addErrback(function(res) {
         *   // В res.data придёт экземпляр ошибки, если один из запросов завершился ошибкой.
         * });
         * </pre>
         */
        Deferred.nearestOf = function (steps) {
            var dResult = new Deferred();
            steps.forEach(function (step, key) {
                step.addBoth(function (r) {
                    if (!dResult.isReady()) {
                        if (r instanceof Error) {
                            var res = new Error();
                            res.from = key;
                            res.data = r;
                            dResult.errback(res);
                        } else {
                            dResult.callback({
                                from: key,
                                data: r
                            });
                        }
                    }
                    return r;
                });
            });
            if (steps.length === 0) {
                dResult.callback();
            }
            return dResult;
        };    /**
         * Если есть deferred, то дожидается его окончания и выполняет callback, иначе просто выполняет callback
         * @param {*} deferred То, чего ждём.
         * @param {Function} callback То, что нужно выполнить.
         * @return {Core/Deferred|*} Если есть деферред, то возвращает его, иначе - результат выполнения функции.
         */
        /**
         * Если есть deferred, то дожидается его окончания и выполняет callback, иначе просто выполняет callback
         * @param {*} deferred То, чего ждём.
         * @param {Function} callback То, что нужно выполнить.
         * @return {Core/Deferred|*} Если есть деферред, то возвращает его, иначе - результат выполнения функции.
         */
        Deferred.callbackWrapper = function (deferred, callback) {
            if (deferred && deferred instanceof Deferred) {
                return deferred.addCallback(callback);
            }
            return callback(deferred);
        };    /**
         * Возвращаем Deferred который подхватывает результаты Promise
         * @param {Promise} promise
         * @returns {Deferred}
         */
        /**
         * Возвращаем Deferred который подхватывает результаты Promise
         * @param {Promise} promise
         * @returns {Deferred}
         */
        Deferred.fromPromise = function (promise) {
            var def = new Deferred();    /** Сохранить ссылку на Promise, чтобы в def.cancel() вызвать promise.abort();
             * https://online.sbis.ru/opendoc.html?guid=b7d3305f-6805-46e8-8502-8e9ed46639bf
             */
            /** Сохранить ссылку на Promise, чтобы в def.cancel() вызвать promise.abort();
             * https://online.sbis.ru/opendoc.html?guid=b7d3305f-6805-46e8-8502-8e9ed46639bf
             */
            def.__parentPromise = promise;
            promise.then(function (res) {
                def.callback(res);
            }).catch(function (err) {
                def.errback(err);
            });
            return def;
        };    /**
         * Возвращает Promise из Deferred.
         * Не затрагивает цепочку переданного Deferred.
         * @param {Deferred} def
         * @returns {Promise}
         */
        /**
         * Возвращает Promise из Deferred.
         * Не затрагивает цепочку переданного Deferred.
         * @param {Deferred} def
         * @returns {Promise}
         */
        Deferred.toPromise = function (def) {
            return new Promise(function (resolve, reject) {
                def.createDependent().addCallbacks(function (res) {
                    resolve(res);
                }, function (err) {
                    reject(err);
                });
            });
        };
        return Deferred;
    }();
    function isCanceled(dfr) {
        return dfr._fired === CANCELED;
    }
    function isCancelValue(res) {
        return res instanceof DeferredCanceledError;
    }
    function isErrorValue(res) {
        return res instanceof Error;
    }
    function isDeferredValue(res) {
        return res instanceof Deferred;
    }
    function resultToFired(res) {
        return isCancelValue(res) ? CANCELED : isErrorValue(res) ? FAILED : SUCCESS;
    }
    exports.default = Deferred;
});