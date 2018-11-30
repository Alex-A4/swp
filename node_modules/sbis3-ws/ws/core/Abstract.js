define('Core/Abstract', [
   'Core/core-extend', 'Core/Abstract.compatible', 'Core/helpers/Function/shallowClone', 'Core/EventBus', 'Core/IoC'
], function(coreExtend, AbstractCompatible, shallowClone) {
   /**
    * Абстрактный класс.
    * Здесь живет событийная модель.
    * Все, кому нужны события, должны наследоваться от него.
    *
    * EventObject
    * В обработчик события первым параметром ВСЕГДА приходит объект, используя который можно работать с текущим событием.
    * Событию можно запретить всплытие(Bubbling) и сменить результат.
    * В зависимости от результата оно продолжит выполняться дальше, либо перестанет.
    * Интерфейс EventObject:
    * void     cancelBubble()    - метод, запрещающий дальнейшее всплытие.
    * boolean  isBubbling()      - получение статуса всплытия.
    * boolean  getResult()       - получение результата события.
    * void     setResult(result) - смена результата события.
    *
    * @class Core/Abstract
    * @public
    * @author Бегунов А.В.
    *
    * @mixes Core/Abstract.compatible
    */
   var Abstract = coreExtend([AbstractCompatible], /** @lends Core/Abstract.prototype */{
      /**
       * @event onInit Происходит при инициализации экземпляра класса контрола.
       * @param {Core/EventObject} eventObject Дескриптор события.
       * @return Результат не обрабатывается.
       * @example
       * 1. При инициализации класса вывести об этом информацию в элемент с идентификатором status.
       * <pre>
       *    onInit: function(eventObject) {
       *       $('#status').html('Инициализация прошла успешно');
       *    }
       * </pre>
       *
       * 2. При инициализации контрола проверить значение поля контекста.
       * При необходимости запретить пользователю взаимодействовать с контролом.
       * <pre>
       *    control.subscribe('onInit', function(eventObject) {
       *       var value = this.getLinkedContext().getValue('РазрешеноРедактирование');
       *       this.setEnabled(!!value);
       *    });
       * </pre>
       */
      /**
       * @event onInitComplete Происходит после инициализации компонента.
       * @remark
       * Именно в обработчике на это событие рекомендуется использовать метод {@link Lib/Control/Control#setEnabled} для изменения режима взаимодействия с дочерними контролами.
       * @param {Core/EventObject} eventObject Дескриптор события.
       * @return Результат не обрабатывается.
       */
      /**
       * @event onReady Происходит при готовности экземпляра класса.
       * @remark
       * Событие, возникающее при готовности класса, что означает:
       * 1. С экземпляром класса уже можно полноценно работать.
       * 2. Все дочерние элементы построены и доступны для взаимодействия.
       *
       * @param {Core/EventObject} eventObject Дескриптор события.
       * @return Результат не обрабатывается.
       * @example
       * 1. При готовности класса вывести об этом информацию в элемент с идентификатором status.
       * <pre>
       *    onReady: function(eventObject) {
       *       $('#status').html('Готовность к работе');
       *    }
       * </pre>
       *
       * 2. При готовности табличного браузера (tableView) изменить фильтр.
       * <pre>
       *    tableView.subscribe('onReady', function(eventObject) {
       *       this.setQuery({'Тип': 'Все'});
       *    });
       * </pre>
       *
       * 3. При готовности контрола (control) установить открытие группы аккордеона в верхней позиции.
       * <pre>
       *    control.subscribe('onReady', function(eventObject) {
       *       this.getChildControlByName('Аккордеон').setDragToTop(true);
       *    });
       * </pre>
       */
      /**
       * @event onDestroy Происходит при уничтожении экземпляра класса.
       * @remark
       * Событие, возникающее при уничтожении экземпляра класса.
       * Происходит, например, при закрытии страницы или смене шаблона области по шаблону.
       *
       * @param {Core/EventObject} eventObject Дескриптор события.
       * @return Результат не обрабатывается.
       * @example
       * 1. При уничтожении экземпляра класса вывести об этом информацию в элемент с идентификатором status.
       * <pre>
       *    onDestroy: function(eventObject) {
       *       $('#status').html('Экземпляр класса уничтожен');
       *    }
       * </pre>
       *
       * 2. При смене шаблона Области по шаблону (template) сбросить группу флагов (groupCheckbox) к значениям по умолчанию.
       * <pre>
       *    template.subscribe('onDestroy', function(eventObject) {
       *       var value = groupCheckbox.getDefaultValue();
       *       groupCheckbox.setValue(value);
       *    });
       * </pre>
       */

      _$eventBusId: null,

      /**
       * 
       * @name Core/Abstract#handlers
       * @cfg {Object} Эта опция задаёт обработчики на события компонента.
       * @remark
       * 
       * Обработчиком называют функцию, которая выполняется при наступлении события.
       * На одно событие можно задать несколько обработчиков, которые будут выполнены в порядке их объявления.
       * 
       * Опция нашла применение в нескольких случаях:
       * * при создании экземпляра класса компонента из JS-модуля с помощью ключевого слова new;
       * * при создании экземпляра класса компонента из JS-модуля с помощью метода {@link Deprecated/core-attach/attachInstance};
       * * при передачи конфигурации в вёрстку компонента.
       * @example
       * В следующем примере компонент {@link Lib/Control/Dialog/Dialog} создаётся в JS-модуле. Ему задаются обработчики в опции handlers.
       * <pre>
       * require(['Lib/Control/Dialog/Dialog'], function(Dialog){
       *    new Dialog ({
       *       opener: self,
       *       handlers: {
       *
       *          // Обработчик на событие перед закрытие диалога - onBeforeShow .
       *          onBeforeShow: function() {
       *             
       *             // Код обработчика.
       *             self.getLinkedContext().setValue('NumOfRecords', defaultCount);
       *          }
       *       }
       *    });
       *    // ... прикладная логика.
       * });
       * </pre>
       * Далее на примере компонента "Кнопка" (см. {@link SBIS3.CONTROLS/Button}) показано как передать обработчик события через вёрстку.
       * Обработчик задан на событие клика по кнопке - onActivated.
       * Функция обработчика описана в стороннем компоненте Examples/MyArea/InteractiveMove.
       * <pre>
       * <SBIS3.CONTROLS.Button name="MyButton" caption="Кнопка">
       *     <ws:handlers>
       *         <ws:Object>
       *             <ws:onActivated>
       *                 <ws:Function>Examples/MyArea/InteractiveMove:prototype.buttonInteractiveMove</ws:Function>
       *             </ws:onActivated> 
       *         </ws:Object>
       *     </ws:handlers>
       * </SBIS3.CONTROLS.Button>
       * </pre>
       */
      _handlers: null,
      _moduleName: 'Core/Abstract',
      _eventBusChannel: null,
      _isDestroyed: false,
      /**
       * Показывает, окончен ли процесс конструирования и инициализации этого объекта.
       */
      _isInitialized: false,
      /**
       * Показывает, была ли вызвана инициализация базового компонента Abstract.
       */
      _isAbstractInitialized: false,
      _subscriptions: null,
      _subDestroyControls: null,

      constructor: function Abstract(cfg, skipInit) {
         cfg = cfg || {};
         if(!cfg.handlers){
            cfg.handlers = {};
         }

         this._handlers = this._handlers || (cfg.handlers && typeof cfg.handlers == 'object' ? shallowClone(cfg.handlers) : {});
         this._subscriptions = this._subscriptions || [];
         this._subDestroyControls = this._subDestroyControls || [];

         //Apply cfg to this._${option} if fast extend used
         if (!this._options) {
            this._setOptions(cfg, true);
         }

         this._publish('onInit', 'onInitComplete', 'onReady', 'onDestroy');

         for (var property in cfg) {
            if(~property.indexOf("on:")) {
               /**
                * Здесь делаем функцию обертку,
                * чтобы были замыкания из шаблона
                */
               (function(_property, self) {
                  self.subscribe(_property.split('on:')[1], function synteticHandler() {
                     var args = [];
                     for(var i in arguments){
                        if (arguments.hasOwnProperty(i)){
                           args[i] = arguments[i];
                        }
                     }
                     args = args.concat(cfg[_property][0].args);
                     cfg[_property][0].fn.apply(cfg.logicParent, args);
                     cfg.logicParent && cfg.logicParent._forceUpdate && cfg.logicParent._forceUpdate();
                  });
               })(property, this);
            }
         }

         if (!skipInit) {
            this._initInstance();
         }
      },



      /**
       * Этот метод производит инициализацию в быстрой ветке наследования вместо тех же вызовов в core-extend.js
       * @protected
       */
      _initInstance: function() {
         //Call initialization methods only if fast extend used
         if (this.$constructor) {
            return;
         }
         this.init();
         this._initComplete();
         this._isInitialized = true;
         this._allowEvents();
         this._constructionDone();
      },

      /**
       *
       * Метод инициализации класса.
       * @see describe
       * @see destroy
       */
      init: function() {
         if (this._isAbstractInitialized) {
            // ругаемся, если init был вызван более одного раза
            throw new Error('При инициализации компонента "' + (this.getName && this.getName()) + '"  функция init была вызвана более одного раза.');
         } else {
            this._isAbstractInitialized = true;
         }

         // В момент вызова init() события отложены
         // После отработки метода init конструирующая функция ($ws.core.extend) вызовет _initComplete,
         // а потом запустит отложенные события через _allowEvents()
         this._notify('onInit');
      },

      /**
       * Этот метод вызывается конструирующей функцией ($ws.core.extend) тогда, когда отработали init всех классов в цепочке наследования,
       * контрол совсем готов, его можно класть в ControlStorage, и запускать его отложенные события.
       *
       * @protected
       */
      _initComplete: function() {
      },

      _constructionDone: function() {
         this._notify('onInitComplete');
      },

      /**
       *
       * Получить описание класса.
       * Удобно использовать для логгирования ошибок.
       * @returns {String} "Описание" класса.
       * @example
       * <pre>
       * define(..., [... , 'Core/IoC']. function(... , IoC) {
       *    onDestroy: function(){
       *       Ioc.resolve('ILogger').log('Error', 'Class ' + myClass.describe() + ' destroyed');
       *    }
       * });
       * </pre>
       * @see init
       * @see destroy
       */
      describe: function() {
         return 'Abstract';
      },




      _setCompatibleOptions: function (classSuper, mixinsList, classExtender) {
         mixinsList = mixinsList || [];

         var classPrototype = classSuper.prototype,
            prefix = '_$',
            mixinsOptions,
            protectedOptions,
            needOptions,
            mixin,
            key,
            name,
            item,
            i;

         for (i = 0; i < mixinsList.length; i++) {
            mixin = mixinsList[i];
            if (mixin.$protected && mixin.$protected._options) {
               item = mixin.$protected._options;
               for (key in item) {
                  if (item.hasOwnProperty(key)) {
                     if (!mixinsOptions) {
                        mixinsOptions = {};
                     }
                     mixinsOptions[key] = true;
                  }
               }
            }
         }

         //old-style extend signatures
         needOptions = mixinsOptions || classExtender.$protected || classExtender.$constructor || (classExtender._dotTplFn);
         if (!needOptions) {
            return;
         }

         if (!classExtender.$protected) {
            classExtender.$protected = {};
         }
         if (!classExtender.$protected._options) {
            classExtender.$protected._options = {};
         }
         protectedOptions = classExtender.$protected._options;
         for (key in classPrototype) {
            if (key.substring(0, 2) === prefix) {
               name = key.substring(2);
               if (mixinsOptions && mixinsOptions.hasOwnProperty(name)) {
                  continue;
               }
               if (protectedOptions.hasOwnProperty(name)) {
                  continue;
               }
               protectedOptions[name] = classPrototype[key];
            }
         }
      }
   });

   Abstract.beforeExtend = function (classPrototype, mixinsList, classExtender) {
      Abstract.prototype._setCompatibleOptions(classPrototype, mixinsList, classExtender);
   };

   return Abstract;
});