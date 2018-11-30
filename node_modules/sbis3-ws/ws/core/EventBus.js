define('Core/EventBus', [
   'Core/EventBusChannel',
   'Core/detection',
   'Core/constants'
], function (EventBusChannel, detection, constants) {
   "use strict";
   var EventBus;
   
   function unregisterChannel(channel) {
      EventBus.removeChannel(channel.getName());
   }
   
   /**
    * Класс "Шина событий".
    * Предназначен для обмена данными между компонентами.
    * Подробнее читайте <a href="/doc/platform/developmentapl/interface-development/component-infrastructure/events-and-commands/#eventbus">здесь</a>.
    * @class Core/EventBus
    * @public
    * @author Санников К.А.
    */
   EventBus = /** @lends Core/EventBus.prototype */{
      _channels: {},
      /**
       * Возвращает канал. Если он не найден, создаётся новый канал.
       * @param {String|Object} [name] Имя канала.
       * @param {Object} [options] Опции канала.
       * @returns {Core/EventBusChannel}
       */
      channel: function (name, options) {
         if (arguments.length == 1 && typeof name == 'object') {
            options = name;
            name = '';
         }
         
         if (!name) {
            return new EventBusChannel(options);
         }
         
         name = name.toLowerCase();
         options = options || {};
         options.name = name;
         
         if (!(name in this._channels)) {
            options['destroyCallback'] = unregisterChannel;
            this._channels[name] = new EventBusChannel(options);
         }
         
         return this._channels[name];
      },
      /**
       * Удаляет канал.
       * @param {String} name Имя канала.
       */
      removeChannel: function (name) {
         delete this._channels[name.toLowerCase()];
      },
      /**
       * Проверяет наличие канала.
       *
       * @param {String} name Имя канала.
       * @returns {Boolean}
       */
      hasChannel: function (name) {
         return this._channels[name.toLowerCase()] !== undefined;
      },
      /**
       * Возвращает "глобальный" канал.
       * @return {Core/EventBusGlobalChannel}
       * @see Core/EventBusGlobalChannel
       */
      globalChannel: function () {
         return EventBus.channel('global');
      }
   };
   
   /**
    * @event Core/EventBusGlobalChannel#onWakeUp
    * @description Событие происходит при выходе машины клиента из спящего режима(гибернации)
    * @remark <ul>
    * <li> Считается, что спящий режим(гибернации) наступает через 2 минуты. </li>
    * <li> Мобильные браузеры отправляют в спящий режим вкладки практически сразу,
    * если устройство было заблокировано, свернули браузер или перешли на другую вкладку,
    * поэтому событие будет срабатывать на мобильных устройствах по получению видимости </li>
    * <li> Если вкладка на мобильном браузере отображается как "полная версия" событие не стрельнёт после реального,
    * кратковременного ухода в спящий режим </li>
    * </ul>
    * @param {Core/EventObject} event Дескриптор события
    * @param {Number} lastTick Таймстамп активности окна перед спящим режимом
    * @example
    * <pre>
    *    EventBus.globalChannel().subscribe('onWakeUp', function(event, lastTick){
    *       console.log("Wake up, Neo...");
    *       var sleepTime = Date.now() - lastTick;
    *       if (sleepTime > 10 * MIN) {
    *          console.log("The Matrix has you...");
    *       }
    *       console.log("Sleep time: ", sleepTime);
    *    });
    * </pre>
    */
   function onWakeUp() {
      var lastTick = Date.now();
      var TICK_INTERVAL = 1260;
      /**
       * @const
       * @description Время, по прошествии которого считаем что машина клиента была в спящем режиме или гибернации
       */
      var SLEEP_TIMEOUT = 2 * 60 * 1000;
      
      setInterval(function () {
         var timestamp = Date.now();
         if (timestamp - lastTick >= SLEEP_TIMEOUT) {
            EventBus.globalChannel().notify('onWakeUp', lastTick);
         }
         lastTick = timestamp;
      }, TICK_INTERVAL);
      if (detection.isMobilePlatform) {
          document.addEventListener("visibilitychange", function () {
              if (!document.hidden) {
                  EventBus.globalChannel().notify('onWakeUp', lastTick);
                  lastTick = Date.now();
              }
          }, false);
      }
   }
   
   if (constants.isBrowserPlatform) {
      onWakeUp();
   }
   
   return EventBus;
   /**
    * @class Core/EventBusGlobalChannel
    * @public
    * @description "Глобальный" канал, в котором дублируются все события контролов, и сигналятся некоторые "глобальные" события.
    * Последние происходят при изменении некоторых параметров документа, которые могут повлиять на позиции некоторых контролов, например, лежащих в body.
    */
});
