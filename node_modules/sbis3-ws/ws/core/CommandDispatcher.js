define('Core/CommandDispatcher', ['Core/core-extend',
   'Core/constants'],
function(coreExtend,
         constants) {
   var ControlClass = null;
   function isControl(inst) {
      /**
       * При построении контролов на сервере они могут начать декларировать команды
       * этого можно упустить, чтобы не расходовать серверные ресурсы. Плюсом ко всему,
       * команды никогда не декларировались на сервере до смены жизненного цикла компонентов.
       */
      if (constants.isBuildOnServer) {
         return false;
      }
      if (!ControlClass) {
         ControlClass = requirejs('Lib/Control/Control').Control;
      }
      return inst && inst instanceof ControlClass || (inst && inst._template);
   }
   /**
    * Синглтон диспетчера команд.
    *
    * @class Core/CommandDispatcher
    * @public
    * @author Бегунов А.В.
    * @singleton
    */
   var CommandDispatcher = new (coreExtend({}, /** @lends Core/CommandDispatcher.prototype */{
      /**
       * Позволяет зарегистрировать команду.
       * @remark
       * Объявление команд выполняйте в функции <code>init()</code>.
       * Для каждого объекта, в котором есть <code>declareCommand</code>, необходимо подписываться на событие <code>onDestroy</code>, в обработчике которого вызвать метод удаления всех команд <code>deleteCommandsForObject(this)</code>.
       * @example
       * Объявляются 2 команды: <code>fill</code> и <code>clear</code>.
       * Команда <code>fill</code> принимает параметры.
       * Если команда возвращает <code>true-value</code> (что-то, что приводится к логическому <code>true</code>), то всплытие команды прекращается; если <code>false</code>, то всплытие по цепочке хозяев продолжается.
       *
       * <pre>
       *    FieldIntegerWithCommands = FieldInteger.extend({
       *       init: function() {
       *          CommandDispatcher.declareCommand(this, 'fill', this._fillCommand);
       *          CommandDispatcher.declareCommand(this, 'clear', this._clearCommand);
       *       },
       *       _fillCommand: function(args) {
       *          var options = $.extend({
       *              'fillData': '12345'
       *          }, args);
       *          this.setValue(options['fillData']);
       *          
       *          // Чтобы продолжить всплытие команды.
       *          return false;
       *       },
       *       _clearCommand: function() {
       *          this.setValue('');
       *          return true;
       *       },
       *       ...
       *    });
       * </pre>
       * @param {*} control Экземпляр класса компонента, для которого регистрируется команда.
       * @param {String} commandName Имя команды. При именовании используют стиль CamelCase, первая буква в нижнем регистре.
       * @param {Function} commandHandler Функция-обработчик, которая будет выполнена при вызове команды.
       * @see sendCommand
       * @see deleteCommandsForObject
       */
      declareCommand: function(control, commandName, commandHandler) {
         var commandStorage;
         if (isControl(control)) {
            commandStorage = control.getUserData('commandStorage') || {};
            commandStorage[commandName] = commandHandler.bind(control);
            control.setUserData('commandStorage', commandStorage);
         }
      },
      /**
       * Удаление всех команд для объекта.
       * @remark
       * Должно ОБЯЗАТЕЛЬНО выполняться для удаляемых объектов (вызываться в деструкторах, например).
       * @param {*} object Экземпляр класса объекта (контрола, компонента).
       */
      deleteCommandsForObject: function(object) {
         if (isControl(object)) {
            object.setUserData('commandStorage');
         }
      },
      /**
       * Производит отправку команды.
       * @remark
       * При отправке команды происходит следующее:
       * <ol>
       *     <li>Команда отправляется на исполнение владельцу контрола/компонента (см. {@link Lib/Control/Control#owner}).</li>
       *     <li>Если владелец не существует, то родительскому контролу/компоненту (см. {@link Lib/Control/Control#parent}) и так далее по цепочке родительских контролов/компонентов до первого функции-обработчика, который вернул *true-value* (что-то, что приводится к логическому *true*).</li>
       * </ol>
       * @example
       * <pre>
       *    hdl = {
       *        sendCommand1: function(e) {
       *           CommandDispatcher.sendCommand(this, 'fill', {'fillData': '+7 (4855) 25245'});
       *        },
       *        sendCommand2: function(e) {
       *           CommandDispatcher.sendCommand(this, 'clear');
       *        },
       *        sendCommand3: function () {
       *           dialogRecord.sendCommand('save', readyDeferred, true);
       *           readyDeferred.addCallBacks(
       *              function () {
       *                 CoreFunctions.alert("Сохранено успешно.");
       *              },
       *              function () {
       *                 CoreFunctions.alert("Ошибка при сохранении.");
       *              }
       *          );
       *        }
       *    };
       * </pre>
       * @param {Lib/Control/Control} eventSender Экземпляр класса контрола, который отправил команду.
       * @param {String} commandName Имя команды. Его устанавливают при объявлении команды (см. {@link declareCommand}, параметр *commandName*).
       * @param {*} [arg1, ...] Аргументы, которые будут переданы в функцию-обработчик команды.
       *
       * @return {*}
       * <ol>
       *    <li>true. Один из обработчиков команд вернул *true*, либо ни один из обработчиков команды не вернул *true-value* (!!value === true).</li>
       *    <li>false. Команда не была никем обработана, её не было ни у одного контрола.</li>
       *    <li>другой результат. Обработчик команды вернул какое-либо *true-value* (!!value === true), тогда возвращается это значение.</li>
       * </ol>
       * @see declareCommand
       */
      sendCommand: function(eventSender, commandName) {
         var
            slice = Array.prototype.slice,
            payload = slice.call(arguments, 2),
            payloadWithName = slice.call(arguments, 1),
            commandDestination,
            commandHandler,
            result,
            owner;
         if (eventSender) {
            if (eventSender.hasEventHandlers('onCommandCatch')) {
               result = eventSender._notify.apply(eventSender, ['onCommandCatch'].concat(payloadWithName));
               if (result) {
                  return result;
               }
            }

            commandHandler = this._getCommand(eventSender, commandName);
            if (commandHandler !== null) {
               result = commandHandler.apply(eventSender, payload);
               if (result) {
                  return result;
               }
            }
            /**
             * Получаем owner с флагом, чтобы не было сообщений в консоль
             * Мы перестали кешировать owner при рождении, поскольку получить owner это значит подняться по родителям
             * вверх и у каждого запросить ребенка по имени, долгая не нужная операция
             * При этом, owner может появиться позже компонента, например компонент label
             * Тихий флаг здесь включается по ошибке: кнопка шлет команду на "разрегистрацию" кнопки по умолчанию
             * а ее owner уже разрушен. Технически ему уже не инетерсно ничего знать о командах, ведь
             * выполнять их он уже не будет
             */
            if (eventSender.getOwner && (owner = eventSender.getOwner(true)) !== null) {
               commandDestination = owner;
               commandHandler = this._getCommand(commandDestination, commandName);
               if (commandHandler !== null) {
                  return commandHandler.apply(commandDestination, payload) || true;
               }
            }
            var flag = false;
            commandDestination = eventSender;
            while ((commandDestination = commandDestination.getParent()) !== null) {
               if (commandDestination.hasEventHandlers('onCommandCatch')) {
                  flag = true;
                  result = commandDestination._notify.apply(commandDestination, ['onCommandCatch'].concat(payloadWithName));
                  if (result) {
                     return result;
                  }
               }

               commandHandler = this._getCommand(commandDestination, commandName);
               if (commandHandler !== null) {
                  flag = true;
                  result = commandHandler.apply(commandDestination, payload);
                  if (result) {
                     return result;
                  }
               }
            }
            return flag;
         } else {
            return false;
         }
      },
      /**
       * Получает команду из хэша команд
       * @param {Lib/Control/Control} owner Элемент, для которого запрашивается обработчик команды.
       * @param {String} commandName Имя команды.
       * @return {Function} Возвращает обработчик команды или null, если передаваемый элемент не декларировал обработку данной команды.
       */
      _getCommand: function(owner, commandName) {
         if (isControl(owner)) {
            var commandStorage = owner.getUserData('commandStorage');
            if (commandStorage) {
               return commandStorage[commandName] || null;
            }
         }
         return null;
      }
   }))();

   return CommandDispatcher;
});