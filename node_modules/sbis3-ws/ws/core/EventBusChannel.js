define('Core/EventBusChannel', [
   'Core/EventObject',
   'Core/IoC',
   'Core/constants'
], function(
   EventObject,
   IoC,
   constants
) {
   "use strict";
   /*
    * Подписки на события нужны только на клиенте и во время выполнения тестов
    * При рендере на СП подписки являются только источником утечек памяти, поэтому запрещаем их
    */
   var SUBSCRIBE_FORBIDDEN = !(constants.isBrowserPlatform || !constants.isBuildOnServer);
   /**
    * Класс "Шина событий".
    * Предназначен для обмена данными между компонентами.
    * Подробнее читайте <a href="/doc/platform/developmentapl/interface-development/component-infrastructure/events-and-commands/#eventbus">здесь</a>.
    * @class Core/EventBusChannel
    * @public
    * @author Санников К.А.
    */
   function EventBusChannel(cfg) {
      cfg = cfg || {};
      this._events = {};
      this._eventQueue = [];
      this._eventsAllowed = false;
      this._isDestroyed = false;
      this._onceEvents = {};
      // Очередь нотификаций события для отложенной подписки. Обрабатывается слева-на-право. 0 индекс будет взят первым
      this._notificationQueue = {};
      this._queueSize = {};
      this._waitForPermit = cfg.waitForPermit || false;
      this._strictMode = cfg.strictMode || false;
      this._name = cfg.name || '';
      this.__EbDestroyCallback = cfg.destroyCallback || function () {};
       /*
        * Костыль для поддержки работоспособности старых Record/RecordSet на СП
        */
      this._subscribeOnPS = cfg.subscribeOnPS || false;

      this.publish('onDestroy');
   }

   function getRightEventName(eventName) {
      if (typeof eventName !== 'string') {
         return eventName;
      }

      return eventName.toLowerCase();
   }

   /**
    * @name Core/EventBusChannel#isDestroyed
    * @function
    * @description
    * Возвращает признак того, удалён канал или нет (отработала ли функция destroy).
    * @remark
    * Функция полезна в обработчиках асинхронных вызовов, обращающихся к объектам, которые могли быть удалены за время
    * асинхронного вызова. Удалённый канал обнуляет все свои подписки, и не принимает новых подписок на события.
    * @returns {Boolean} true - объект удалён, false - объект не удалён, функция {@link destroy} не отработала.
    * @see destroy
    */
   EventBusChannel.prototype.isDestroyed = function() {
      return this._isDestroyed;
   };

   /**
    * @description Декларирует наличие у объекта событий
    * События могут быть переданы в виде строки, в виде массива строк.
    * @name Core/EventBusChannel#publish
    * @function
    */
   EventBusChannel.prototype.publish = function(/*$event*/) {
      for (var i = 0, li = arguments.length; i < li; i++) {
         var event = arguments[i];
         if (event && !event.charAt) {
            throw new Error(rk('Аргументами функции publish должно быть несколько строк - имён событий'));
         }
         event = getRightEventName(event);
         this._events[event] = this._events[event] || [];
         this._notificationQueue[event] = this._notificationQueue[event] || [];
      }
      return this;
   };

   /**
    * @name Core/EventBusChannel#setEventQueueSize
    * @function
    * @description
    * Задачет длину орчереди для события. Если очередь не нулевая - сохраняется заданное количество последних нотификаций.
    * Новые подписчики получат все события, сохраненные в очереди.
    *
    * @param {String|Object} [event='*'] Название события или '*' для всех событий.
    * Чтобы применить ограничение для всех события можно также позвать метод с одним целочесленным аргументом.
    * Можно передать объект: ключи - события, значение - размер очереди
    * @param {Number} queueLength Желаемая длина очереди
    *
    * @example
    * <pre>
    *    // Событие onFoo - очередь 3
    *    channel.setEventQueueSize('onFoo', 3);
    *    // Для всех событий очередь 5, для onFoo - 3, onBar - 4
    *    channel.setEventQueueSize({
    *       onFoo: 3,
    *       onBar: 4,
    *       '*': 5
    *    });
    *    // Для всех событий очередь 5
    *    channel.setEventQueueSize('*', 5); // эквивалентно следующему
    *    channel.setEventQueueSize(5);
    * </pre>
    */
   EventBusChannel.prototype.setEventQueueSize = function(event, queueLength) {
      var eventList;

      if (typeof event == 'number') {
         queueLength = event;
         event = '*';
      }

      if (typeof event == 'object') {

         for (var key in event) {
            if (event.hasOwnProperty(key)) {
               var
                  limit = event[key];
               this.setEventQueueSize(key, limit);
            }
         }
         return;
      }

      event = getRightEventName(event);

      this._queueSize[event] = queueLength;

      if (event == '*') {
         eventList = Object.keys(this._notificationQueue);
      } else {
         eventList = [event];
      }

      eventList.forEach(function(event) {
         if (this._notificationQueue[event] && this._notificationQueue[event].length > queueLength) {
            this._notificationQueue[event].slice(0, queueLength);
         }
      }, this);
   };

   EventBusChannel.prototype._notifyToHandler = function(eventName, eventState, handler, args) {
      try {
         args = [eventState].concat(args);
         if (handler && (!handler.ctx || !handler.ctx.isDestroyed || !handler.ctx.isDestroyed())) {
            handler.fn.apply(handler.ctx, args);
         }

         if (!eventState.isBubbling() || !this._events) {
            return false;
         }
      } catch (e) {
         IoC.resolve('ILogger').error(
            (handler.ctx && handler.ctx.describe) ? handler.ctx.describe() : 'Unknown Object',
            'Event handler for "' + eventName + '" returned error: ' + e.message,
            e);
      }
   };

   /**
    * @name Core/EventBusChannel#notify
    * @function
    * @description
    * Извещает всех подписантов события.
    * @remark
    * Этот метод аналогичен методу {@link notifyWithTarget} с параметром target === undefined.
    * @param {string} event Имя события.
    * @param [arg1, [...]] Параметры, получаемые подписантами.
    * @returns {Boolean|String|Object} Результат выполнения цепочки callback'ов.
    * В функции-обработчике события можно изменить результат, который возвращается методом notify.
    * Для этого достаточно в экземпляре класса {@link Core/EventObject} (первый аргумент обработчика) установить значение с помощью метода {@link Core/EventObject#setResult}.
    * <br/>
    * Когда на событие установлено несколько обработчиков, они образуют цепочку выполнения, в которой результат события (см. {@link Core/EventObject#getResult}) передаётся из одного обработчика в другой.
    * Передача результата происходит последовательно в порядке объявления обработчиков в исходном коде.
    * В итоге метод notify возвращает результат события из последнего обработчика такой цепочки.
    * <br/>
    * В блоке "Примеры" приведены оба случая формирования результата метода notify.
    * @example
    * <pre>
    *     require(['Core/EventBusChannel'], function(Channel) {
    *
    *        // Создали новый канал событий.
    *        var channel = new Channel();
    *
    *        // Первый обработчик события.
    *        channel.subscribe('myEvent', function(eventObject) {
    *
    *           // first event: undefined
    *           console.log('first event: ', eventObject.getResult())
    *           eventObject.setResult('value 1')
    *        });
    *
    *        // result: value1
    *        console.log('result:', channel.notify('myevent'))
    *     });
    * </pre>
    * <pre>
    *     // Цепочка обработчиков события.
    *
    *     require(['Core/EventBusChannel'], function(Channel) {
    *
    *        // Создали новый канал событий.
    *        var channel = new Channel();
    *
    *        // Первый обработчик события.
    *        channel.subscribe('myEvent', function(eventObject) {
    *
    *           // first event: undefined
    *           console.log('first event: ', eventObject.getResult())
    *           eventObject.setResult('value1')
    *        });
    *
    *        // Второй обработчик события.
    *        channel.subscribe('myEvent', function(eventObject) {
    *
    *           // second event: value1
    *           console.log('second event: ', eventObject.getResult())
    *           eventObject.setResult('value2')
    *        });
    *
    *        // result: value2
    *        console.log('result:', channel.notify('myevent'))
    *     });
    * </pre>
    */
   EventBusChannel.prototype.notify = function(event/*, payload*/) {
      var args = new Array(arguments.length - 1);
      for (var i = 1; i < arguments.length; i++) {
         args[i - 1] = arguments[i];
      }
      return this._notifyWithTarget(event, undefined, args);
   };

   /**
    * @name Core/EventBusChannel#notifyWithTarget
    * @function
    * @description
    * Извещает всех подписантов события
    * Все аргументы после имени события будут переданы подписантам.
    * @param {string} event Имя события.
    * @param {*} target Объект, на котором произошло событие.
    * @param [arg1, [...]] Параметры, получаемые подписантами.
    * @returns {Boolean|String|Object} Результат выполнения цепочки.
    */
   EventBusChannel.prototype.notifyWithTarget = function(event, target/*, payload*/) {
      var args = new Array(arguments.length - 2);
      for (var i = 2; i < arguments.length; i++) {
         args[i - 2] = arguments[i];
      }
      return this._notifyWithTarget(event, target, args);
   };

    /**
     * Извещает всех подписантов события
     * @param {String} event
     * @param {*} target
     * @param {Array<*>} args
     * @private
     */
   EventBusChannel.prototype._notifyWithTarget = function(event, target, args) {
      var eventName = getRightEventName(event),
          result, eventState, eventSaved, i, ln, handlers;

      if (this._waitForPermit && !this._eventsAllowed) {
         this._eventQueue.push(arguments);
         return;
      }
      handlers = this._events[eventName];

      if (!handlers) {
         if (this._strictMode) {
            throw new Error('Event "' + eventName + '" have not published yet');
         }
         handlers = [];
         this._events[eventName] = handlers;
      }

      ln = handlers.length;
      if (ln !== 0) {
         eventSaved = eventName;
         eventState = new EventObject(eventName, target);

         for (i = 0; i < ln; i++) {
            if (this._notifyToHandler(eventSaved, eventState, handlers[i], args) === false) {
               break;
            }
         }
         result = eventState.getResult();
      }
      this._saveNotification(eventName, target, args);
      return result;
   };
    /**
     * Запись нотификаций для событий
     * @param {String} event
     * @param {*} target
     * @param {Array<*>} args
     * @private
     */
    EventBusChannel.prototype._saveNotification = function (event, target, args) {
       var queueLimit = this._queueSize[event] || this._queueSize['*'] || 0;
       if (queueLimit) {
          var notifyQueue = (this._notificationQueue[event] = this._notificationQueue[event] || []);
          // Если в очереди накопилось больше чем положено
          if (notifyQueue.length >= queueLimit) {
             // Уберем первый элемент
             notifyQueue.shift();
          }
          // Добавим новый в конец очереди
          notifyQueue.push([target, args]);
       }
    };
   /**
    * @name Core/EventBusChannel#eventsAllowed
    * @function
    * @description
    * Показывает, включена ли отсылка событий.
    * Если она отключена, то при вызовах notify события будут накапливаться в очереди, и отсылаться
    * после вызова метода allowEvents. Подробнее см. метод allowEvents.
    * @returns {boolean}
    */
   EventBusChannel.prototype.eventsAllowed = function() {
      return this._eventsAllowed;
   };

   /**
    * @name Core/EventBusChannel#allowEvents
    * @function
    * @description
    * Включает отсылку событий, и отсылает все события, скопленные до вызова этого метода, пока отсылка была выключена.
    * Откладывание отсылки событий используется при конструировании контролов, чтобы события остылались после окончания работы всей
    * цепочки конструкторов по иерархии наследования.
    */
   EventBusChannel.prototype.allowEvents = function() {
      if (this._eventsAllowed === false) {
         this._eventsAllowed = true;
         for (var i = 0, l = this._eventQueue.length; i < l; i++) {
            this._notifyWithTarget.apply(this, this._eventQueue[i]);
         }
         this._eventQueue.length = 0;
      }
   };

   /**
    * @name Core/EventBusChannel#once
    * @function
    * @description
    * Выполнит обработчик события единожды
    * @param {String} event Имя события, при котором следует выполнить обработчик.
    * @param {Function} handler Функция-обработчик события.
    * @param {Object} ctx Контекст, в котором выполнится обработчик.
    * @param {Function} fallback Функция которая гарантированно стрельнет, если не стрельнет событие за определенное время
    * @param {Number} time Время, через которое должен стрельнуть fallback
    * <pre>
    *    eventBusChannel.once('onSome', function(event){
    *       //do smth
    *    });
    * </pre>
    */
   EventBusChannel.prototype.once = function(event, handler, ctx, fallback, time) {
      if (SUBSCRIBE_FORBIDDEN && !this._subscribeOnPS) {
         return this;
      }
      event = getRightEventName(event);

      function handlerWrapper() {
         self._unsubscribeFromOnce(event, handler, ctx, handlerWrapper);
         handler.apply(this, arguments);
      }
      handlerWrapper.originalFn = handler;

      if (typeof ctx === 'function') {
         time = fallback;
         fallback = ctx;
         ctx = null;
      }

      var
         self = this,
         object = {
            handler: handler,
            ctx: ctx,
            wrapper: handlerWrapper,
            fallback: fallback
         };

      if (!this._onceEvents[event]) {
         this._onceEvents[event] = [];
      }
      this._onceEvents[event].push(object);

      return this.subscribe(event, handlerWrapper, ctx, fallback, time);
   };

   /**
    * @name Core/EventBusChannel#subscribe
    * @function
    * @description
    * Добавить обработчик на событие.
    * Подписывает делегата на указанное событие текущего объекта.
    * Добавлена поддержка fallback, если за отведенное время событие не стрельнуло, вызывается fallback,
    * при этом handler отписывается. Время по умеолчанию 20 секунд
    * @param {String} event Имя события, на которое следует подписать обработчик.
    * @param {Function} handler Функция-делегат, обработчик события.
    * @param {Object} [ctx] Контекст, в котором выполнится обработчик.
    * @param {Function} [fallback] Функция которая гарантированно стрельнет, если не стрельнет событие за определенное время
    * @param {Number} [time] Время, через которое должен стрельнуть fallback
    * @throws Error Выкидывает исключение при отсутствии события и передаче делегата не-функции.
    * @example
    * <pre>
    *    eventBusChannel.subscribe('onSome', function(event){
    *       //do smth
    *    });
    * </pre>
    */
   EventBusChannel.prototype.subscribe = function(event, handler, ctx, fallback, time) {
      if (SUBSCRIBE_FORBIDDEN && !this._subscribeOnPS) {
         return this;
      }
      event = getRightEventName(event);

      var handlerObject;

      if (this._isDestroyed) {
         throw new Error("Trying to subscribe event '" + event + "', but EventBusChannel is destroyed");
      } else if (this._strictMode && !(event in this._events)) {
         throw new Error("Event '" + event + "' is not registered");
      } else {
         if (typeof handler === 'function') {
            if (typeof ctx === 'function') {
               time = fallback;
               fallback = ctx;
               ctx = null;
            }
            if (fallback && typeof fallback === 'function') {
               var
                  self = this,
                  clear = function() {
                     clearTimeout(timeout);
                  },
                  releaseFallback = (function() {
                     var fallbacked;
                     return function (silent) {
                        if (fallbacked) return;

                        fallbacked = true;
                        self.unsubscribe(event, clear, ctx);
                        if (typeof handler.originalFn == 'function') {
                           self.unsubscribe(event, handler.originalFn, ctx, fallback);
                        } else {
                           self.unsubscribe(event, handler, ctx, fallback);
                        }
                        silent ? clear() : fallback();
                        return true;
                     }
                  })(),
                  timeout = setTimeout(releaseFallback, time || 20000);

               this.once(event, clear, ctx);
            }

            handlerObject = {
               fn: handler,
               ctx : ctx,
               fb: fallback,
               killFb: releaseFallback
            };

            this._events[event] = this._events[event] || [];
            this._events[event].push(handlerObject);

            if (this._notificationQueue[event] && this._notificationQueue[event].length) {
               this._notificationQueue[event].forEach(function(savedEvent) {
                  var
                     target = savedEvent[0],
                     args = savedEvent[1],
                     eventState = new EventObject(event, target);

                  this._notifyToHandler(event, eventState, handlerObject, args);
               }, this);
            }

            return this;
         } else {
            throw new TypeError("Event '" + event + "' has unexpected handler");
         }
      }
   };

   /**
    * Отписаться от обработчиков, добавленных через once
    * @param {String}   event       Имя события.
    * @param {Function} handler     Функция-обработчик события.
    * @param {Object}   [ctx]       Контекст, в котором выполнялся обработчик.
    * @param {Function} [wrapper]   Сама обёртка, если отписываемся из уже стрельнувшего через once события.
    * @param {Function} fallback Функция которая гарантированно стрельнет, если не стрельнет событие за определенное время
    * @private
    */
   EventBusChannel.prototype._unsubscribeFromOnce = function(event, handler, ctx, wrapper, fallback) {
      event = getRightEventName(event);
      var
         i, elem,
         events = this._onceEvents[event],
         found = [];
      if (!events) {
         return;
      }
      for (i = 0; i < events.length; ++i) {
         elem = events[i];
         if(elem.handler === handler && (!ctx || elem.ctx === ctx) && (!wrapper || wrapper === elem.wrapper) && (!fallback || fallback === elem.fallback)) {
            found.push(i);
         }
      }
      for (i = found.length - 1; i >= 0; --i) {
         this.unsubscribe(event, events[found[i]].wrapper, ctx, fallback);
         this._onceEvents[event].splice(found[i], 1);
      }
   };

   /**
    * @name Core/EventBusChannel#unsubscribe
    * @function
    * @description
    * Снять подписку заданного обработчика с заданного события
    * @param {String} event Имя события.
    * @param {Function} handler Функция-обработчик события.
    * @param {Object} [ctx] Контекст, в котором выполнялся обработчик.
    * @param {Function} [fallback] Функция которая гарантированно стрельнет, если не стрельнет событие за определенное время
    * <pre>
    *    eventBusChannel.unsubscribe('onSome', function(event){
    *       //do smth
    *    });
    * </pre>
    */
   EventBusChannel.prototype.unsubscribe = function(event, handler, ctx, fallback) {
      if (SUBSCRIBE_FORBIDDEN && !this._subscribeOnPS) {
         return this;
      }
      event = getRightEventName(event);

      if (!handler || typeof handler !== 'function') {
         throw new TypeError("Unsubscribe: second argument is not a function");
      }
      var handlers = this._strictMode ? this._events[event] : this._events[event] = this._events[event] || [];
      if (handlers) {
         if (typeof ctx === 'function') {
            fallback = ctx;
            ctx = null;
         }
         this._unsubscribeFromOnce(event, handler, ctx, null, fallback);
         handlers = this._events[event];
         var newHandlers, i, last, ln;
         for (i = 0, ln = handlers.length; i !== ln; i++) {
            if (handlers[i]["fn"] === handler && (handlers[i]["ctx"] && ctx ? handlers[i]["ctx"] === ctx : true) && (handlers[i]["fb"] && fallback ? handlers[i]["fb"] === fallback : true)) {

               //если можем убить фоллбек, то дальше можно не идти, так как убийство фоллбека уже предусматривает полную отписку от связанного с ним события
               if (handlers[i]["killFb"] && handlers[i]["killFb"](true)) {
                  continue;
               }

               newHandlers = handlers.slice(0, i);

               i++;
               last = i;
               for (; i !== ln; i++) {
                  if (handlers[i]["fn"] === handler && (handlers[i]["ctx"] && ctx ? handlers[i]["ctx"] === ctx : true) && (handlers[i]["fb"] && fallback ? handlers[i]["fb"] === fallback : true)) {
                     if (last !== i) {
                        newHandlers = newHandlers.concat(handlers.slice(last, i));
                     }
                     last = i + 1;
                  }
               }

               if (last !== ln) {
                  newHandlers = newHandlers.concat(handlers.slice(last, ln));
               }

               this._events[event] = newHandlers;
               break;
            }
         }

         return this;
      } else {
         throw new Error("Event '" + event + "' is not registered");
      }
   };

   /**
    *
    * Снять все подписки со всех событий.
    */
   EventBusChannel.prototype.unsubscribeAll = function() {
      for (var key in this._events) {
         if (this._events.hasOwnProperty(key) && this._events[key]) {
            this._events[key].length = 0;
         }
      }
      this._onceEvents = {};
   };

   /**
    * @name Core/EventBusChannel#getName
    * @function
    * @description
    * Возвращает имя канала
    * @returns {String} Возвращает имя контрола, на который применили метод.
    * @example
    * <pre>
    *     class.getName();
    * </pre>
    */
   EventBusChannel.prototype.getName = function() {
      return this._name;
   };

   EventBusChannel.prototype.destroy = function() {
      //Нужно делать notifyWithTarget, чтобы у тех, кто подписался прямо на этот EventBusChannel, правильно
      //работала автоотписка (чтобы там таргет в событии onDestroy был правильный)
      this.notifyWithTarget('onDestroy', this);

      this.unsubscribeAll();

      if (this._name) {
         /**
          * Вызываем в EventBus уничтожение себя
          */
         this.__EbDestroyCallback(this);
      }
      this._isDestroyed = true;
   };

   /**
    * @name Core/EventBusChannel#unbind
    * @function
    * @description
    * Снимает все обработчики с указанного события
    * @param {String} event Имя события.
    * <pre>
    *    eventBusChannel.unbind('onSome');
    * </pre>
    */
   EventBusChannel.prototype.unbind = function(event) {
      event = getRightEventName(event);
      this._events[event] = [];

      return this;
   };

   /**
    * @name Core/EventBusChannel#hasEvent
    * @function
    * @description
    * Проверка наличия указанного события
    * @param {String} name Имя события.
    * @return {Boolean} Есть("true") или нет("false") событие у класса.
    * <pre>
    *    if(eventBusChannel.hasEvent('onSome'))
    *       eventBusChannel.unbind('onSome');
    * </pre>
    */
   EventBusChannel.prototype.hasEvent = function(name) {
      name = getRightEventName(name);
      return !this._strictMode || this._events && !!this._events[name];
   };

   /**
    * @name Core/EventBusChannel#getEvents
    * @function
    * @description
    * Возвращает список зарегистрированных событий
    * @return {Array} Массив зарегистрированных событий.
    * @example
    * <pre>
    *     eventBusChannel.getEvents();
    * </pre>
    */
   EventBusChannel.prototype.getEvents = function() {
      return Object.keys(this._events);
   };

   /**
    * @name Core/EventBusChannel#hasEventHandlers
    * @function
    * @description
    * Проверка наличия обработчиков на указанное событие
    * @param {String} name Имя события.
    * @return {Boolean} Есть("true") или нет("false") обработчики.
    * @example
    * <pre>
    *     class.hasEventHandlers();
    * </pre>
    */
   EventBusChannel.prototype.hasEventHandlers = function(name) {
      name = getRightEventName(name);
      return !!this._events[name] && this._events[name].length > 0;
   };

   /**
    * @name Core/EventBusChannel#getEventHandlers
    * @function
    * @description
    * Получение списка обработчиков, подписанных на событие
    * @param {String} name Имя события.
    * @return {Array} Массив функций-обработчиков.
    * @example
    * <pre>
    *     var handlers = eventBusChannel.getEventHandlers('onSomeEvent');
    *     log('Событие onSomeEvent имеет ' + handlers.length + ' обработчиков');
    * </pre>
    */
   EventBusChannel.prototype.getEventHandlers = function(name) {
      name = getRightEventName(name);
      return (this._events[name] || []).map(function(i) {
         return i.fn
      });
   };

   return EventBusChannel;
});
