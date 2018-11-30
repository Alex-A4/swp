/// <amd-module name="Data/_type/ObservableMixin" />
/**
 * Примесь, позволяющая сущности возможность узнавать об изменении состояния объекта через события.
 * @class WS.Data/Entity/ObservableMixin
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/ObservableMixin', [
    'require',
    'exports',
    'Core/EventBus'
], function (require, exports, EventBus) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var ObservableMixin    /**@lends WS.Data/Entity/ObservableMixin.prototype */ = /**@lends WS.Data/Entity/ObservableMixin.prototype */
    /** @class */
    function () {
        function ObservableMixin(options) {
            var handlers = options && options.handlers;
            if (handlers instanceof Object) {
                for (var event in handlers) {
                    if (handlers.hasOwnProperty(event)) {
                        this.subscribe(event, handlers[event]);
                    }
                }
            }
        }
        ObservableMixin.prototype.destroy = function () {
            if (this._eventBusChannel) {
                this._eventBusChannel.unsubscribeAll();
                this._eventBusChannel.destroy();
                this._eventBusChannel = null;
            }
        };    /**
         * Добавляет подписку на событие
         * @param {String} event Имя события, на которое подписается обработчик
         * @param {Function} handler Обработчик события.
         * @param {Object} [ctx] Контекст выполнения
         * @example
         * Подпишемся на событие OnSomethingChanged:
         * <pre>
         *    var instance = new Entity();
         *    instance.subscribe('OnSomethingChanged', function(event, eventArg1) {
         *       //do something
         *    });
         * </pre>
         */
        /**
         * Добавляет подписку на событие
         * @param {String} event Имя события, на которое подписается обработчик
         * @param {Function} handler Обработчик события.
         * @param {Object} [ctx] Контекст выполнения
         * @example
         * Подпишемся на событие OnSomethingChanged:
         * <pre>
         *    var instance = new Entity();
         *    instance.subscribe('OnSomethingChanged', function(event, eventArg1) {
         *       //do something
         *    });
         * </pre>
         */
        ObservableMixin.prototype.subscribe = function (event, handler, ctx) {
            if (this._destroyed) {
                return;
            }
            if (!this._eventBusChannel) {
                this._eventBusChannel = EventBus.channel();
                if (this._publishedEvents) {
                    for (var i = 0; i < this._publishedEvents.length; i++) {
                        this._eventBusChannel.publish(this._publishedEvents[i]);
                    }
                }
            }
            if (ctx === undefined) {
                ctx = this;
            }
            this._eventBusChannel.subscribe(event, handler, ctx);
        };    /**
         * Отменяет подписку на событие
         * @param {String} event Имя события, на которое подписается обработчик
         * @param {Function} handler Обработчик события.
         * @param {Object} [ctx] Контекст выполнения
         * @example
         * Подпишемся на событие OnSomethingChanged и обработаем его только один раз:
         * <pre>
         *    var instance = new Entity(),
         *       handler = function(event, eventArg1) {
         *          instance.unsubscribe(handler);
         *          //do something
         *       };
         *    instance.subscribe('OnSomethingChanged', handler);
         * </pre>
         */
        /**
         * Отменяет подписку на событие
         * @param {String} event Имя события, на которое подписается обработчик
         * @param {Function} handler Обработчик события.
         * @param {Object} [ctx] Контекст выполнения
         * @example
         * Подпишемся на событие OnSomethingChanged и обработаем его только один раз:
         * <pre>
         *    var instance = new Entity(),
         *       handler = function(event, eventArg1) {
         *          instance.unsubscribe(handler);
         *          //do something
         *       };
         *    instance.subscribe('OnSomethingChanged', handler);
         * </pre>
         */
        ObservableMixin.prototype.unsubscribe = function (event, handler, ctx) {
            if (this._eventBusChannel) {
                if (ctx === undefined) {
                    ctx = this;
                }
                this._eventBusChannel.unsubscribe(event, handler, ctx);
            }
        };    /**
         * Возвращет массив подписчиков на событие
         * @param {String} event Имя события
         * @return {Array.<Core/EventObject>}
         * @example
         * Посмотрим, сколько подписчиков у события OnSomethingChanged
         * <pre>
         *    var handlersCount = instance.getEventHandlers().length;
         * </pre>
         */
        /**
         * Возвращет массив подписчиков на событие
         * @param {String} event Имя события
         * @return {Array.<Core/EventObject>}
         * @example
         * Посмотрим, сколько подписчиков у события OnSomethingChanged
         * <pre>
         *    var handlersCount = instance.getEventHandlers().length;
         * </pre>
         */
        ObservableMixin.prototype.getEventHandlers = function (event) {
            return this._eventBusChannel ? this._eventBusChannel.getEventHandlers(event) : [];
        };    /**
         * Проверяет наличие подписки на событие
         * @param {String} event Имя события
         * @return {Boolean}
         * @example
         * Посмотрим, есть ли подписчики у события OnSomethingChanged
         * <pre>
         *    var hasHandlers = instance.hasEventHandlers();
         * </pre>
         */
        /**
         * Проверяет наличие подписки на событие
         * @param {String} event Имя события
         * @return {Boolean}
         * @example
         * Посмотрим, есть ли подписчики у события OnSomethingChanged
         * <pre>
         *    var hasHandlers = instance.hasEventHandlers();
         * </pre>
         */
        ObservableMixin.prototype.hasEventHandlers = function (event) {
            return this._eventBusChannel ? this._eventBusChannel.hasEventHandlers(event) : false;
        };    /**
         * Деклариует наличие события
         * @param {...String} events Имя события
         * @protected
         */
        /**
         * Деклариует наличие события
         * @param {...String} events Имя события
         * @protected
         */
        ObservableMixin.prototype._publish = function () {
            var events = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                events[_i] = arguments[_i];
            }
            this._publishedEvents = this._publishedEvents || [];
            var event;
            for (var i = 0; i < events.length; i++) {
                event = events[i];
                this._publishedEvents.push(event);
                if (this._eventBusChannel) {
                    this._eventBusChannel.publish(event);
                }
            }
        };    /**
         * Извещает о наступлении события.
         * Если в процессе извещения приходит очередное событие, то извещение о нем будет отправлено после выполнения обработчиков предыдущего.
         * @param {String} event Имя события
         * @param {...*} args Аргументы события
         * @return {*} Результат обработки события (возвращается только в случае отсутствия очереди)
         * @protected
         */
        /**
         * Извещает о наступлении события.
         * Если в процессе извещения приходит очередное событие, то извещение о нем будет отправлено после выполнения обработчиков предыдущего.
         * @param {String} event Имя события
         * @param {...*} args Аргументы события
         * @return {*} Результат обработки события (возвращается только в случае отсутствия очереди)
         * @protected
         */
        ObservableMixin.prototype._notify = function (event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (this._eventBusChannel) {
                this._notifyPushQueue.apply(this, arguments);
                return this._notifyQueue(this._eventsQueue)[0];
            }
        };    /**
         * Ставит в очередь извещение о наступлении события.
         * @param {String} event Имя события
         * @param {...*} args Аргументы события
         * @protected
         */
        /**
         * Ставит в очередь извещение о наступлении события.
         * @param {String} event Имя события
         * @param {...*} args Аргументы события
         * @protected
         */
        ObservableMixin.prototype._notifyLater = function (event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (this._eventBusChannel) {
                this._notifyPushQueue.apply(this, arguments);
            }
        };    /**
         * Добавляет извещение о событии в очередь.
         * @param {String} event Имя события
         * @param {...*} args Аргументы события
         * @protected
         */
        /**
         * Добавляет извещение о событии в очередь.
         * @param {String} event Имя события
         * @param {...*} args Аргументы события
         * @protected
         */
        ObservableMixin.prototype._notifyPushQueue = function (event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            this._eventsQueue = this._eventsQueue || [];
            this._eventsQueue.push([event].concat(args));
        };    /**
         * Инициирует выполнение обработчиков из очереди событий
         * @param {Array.<Array>} eventsQueue Очередь событий
         * @return {Array} Результаты обработки событиий
         * @protected
         */
        /**
         * Инициирует выполнение обработчиков из очереди событий
         * @param {Array.<Array>} eventsQueue Очередь событий
         * @return {Array} Результаты обработки событиий
         * @protected
         */
        ObservableMixin.prototype._notifyQueue = function (eventsQueue) {
            var results = [];    // @ts-ignore
            // @ts-ignore
            if (!eventsQueue.running) {
                // @ts-ignore
                eventsQueue.running = true;
                var item = void 0;
                while (item = eventsQueue[0]) {
                    results.push(this._eventBusChannel._notifyWithTarget(item[0], this, item.slice(1)));
                    eventsQueue.shift();
                }    // @ts-ignore
                // @ts-ignore
                eventsQueue.running = false;
            }
            return results;
        };    /**
         * Удаляет из очереди все обработчики указанного события
         * @param {String} eventName Имя события
         * @protected
         */
        /**
         * Удаляет из очереди все обработчики указанного события
         * @param {String} eventName Имя события
         * @protected
         */
        ObservableMixin.prototype._removeFromQueue = function (eventName) {
            if (!this._eventsQueue) {
                return;
            }
            for (var i = 1; i < this._eventsQueue.length; i++) {
                if (this._eventsQueue[i][0] === eventName) {
                    this._eventsQueue.splice(i, 1);
                    i--;
                }
            }
        };
        return ObservableMixin;
    }();
    exports.default = ObservableMixin;
    ObservableMixin.prototype['[Data/_type/ObservableMixin]'] = true;    // @ts-ignore
    // @ts-ignore
    ObservableMixin.prototype._eventBusChannel = null;    // @ts-ignore
    // @ts-ignore
    ObservableMixin.prototype._eventsQueue = null;    // @ts-ignore
    // @ts-ignore
    ObservableMixin.prototype._publishedEvents = null;
});