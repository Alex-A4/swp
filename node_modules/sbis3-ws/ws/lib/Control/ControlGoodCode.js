define('Lib/Control/ControlGoodCode', [
      "Core/constants",
      "Core/Deferred",
      "Core/core-merge",
      "Core/ControlBatchUpdater",
      'Core/core-instance',
      "Core/IoC"
   ], function (Constants,
                cDeferred,
                cMerge) {
      return {

         /**
          *
          *
          * Получить текст расширенной всплывающей подсказки.
          * @returns {String|Boolean}
          * Возможные значения:
          * <ol>
          *    <li>true - подсказка включена, но текст не задан.</li>
          *    <li>false - подсказка отключена.</li>
          *    <li>Если подсказка включена и задан текст, то вернётся текстовое сообщение расширенной подсказки.</li>
          * </ol>
          * @example
          * Для поля ввода (fieldString) с именем "ИНН" установить подсказку о вводимой информации.
          * <pre>
          *    var message = 'Введите идентификационный номер налогоплательщика РФ';
          *    fieldString.subscribe('onReady', function() {
       *       if (this.getName() === 'ИНН' && this.getExtendedTooltip() === false)
       *          this.setExtendedTooltip(message);
       *    });
          * </pre>
          * @see extendedTooltip
          * @see setExtendedTooltip
          * @see tooltip
          * @see setTooltip
          * @see getTooltip
          */
         getExtendedTooltip: function () {
            return this._getOption('extendedTooltip');
         },

         /**
          *
          *
          * Задать текст расширенной подсказки.
          * @param {String|Boolean} tooltip Текст подсказки.
          * Если передать true, то расширенная подсказка будет включена, false - выключена.
          * @example
          * При наведении курсора на контрол показать подсказку с текущими датой и временем.
          * <pre>
          *    //включаем расширенную подсказку
          *    control.setExtendedTooltip(true);
          *    control.subscribe('onTooltipContentRequest', function(event, originalMessage) {
       *       event.setResult('Подсказка запрошена в ' + new Date());
       *    });
          * </pre>
          * @see extendedTooltip
          * @see getExtendedTooltip
          * @see tooltip
          * @see setTooltip
          * @see getTooltip
          */
         setExtendedTooltip: function (tooltip) {
            this._setOption('extendedTooltip', tooltip);
         },

         /**
          * Делает все необходимое, чтобы показывать подсказку у контрола
          * @private
          */
         _bindExtendedTooltip: function () {
            var self = this;
            if (this._tooltipSettings.handleFocus) {
               this.subscribe('onFocusIn', function () {
                  if (this._isCanShowExtendedTooltip()) {
                     this._showExtendedTooltip();
                  }
               });

               this.subscribe('onFocusOut', function (event, destroyed, focusedControl) {
                  // Внутри инфобокса теперь могут быть контролы, способные принять фокус.
                  // Если фокус ушел в них, то не скрываем подсказку
                  if (this._isCanShowExtendedTooltip() && !self._isInfoboxFocus(focusedControl)) {
                     // Будем скрывать подсказку только в том случае, если она сейчас привязана к текущему контролу
                     self._getInfobox(function(Infobox) {
                        if (Infobox.isCurrentTarget(self._getExtendedTooltipTarget())) {
                           Infobox.hide(0);
                        }
                     });
                  }
               });
            }

            if (this._tooltipSettings.handleHover) {
               this.getContainer().bind('mouseenter', function () {
                  self._underCursor = true;
                  self._initiatedByCursor = true;
                  if (self._isCanShowExtendedTooltip()) {
                     self._showExtendedTooltip(true);
                  }
               });

               this.getContainer().bind('mouseleave', function () {
                  self._underCursor = false;
                  self._initiatedByCursor = false;
                  // Скрывать будем только если задан текст. Иначе подсказки небыло.
                  if (self._isCanShowExtendedTooltip()) {
                     // Подсказку скрываем только если текущий контрол не активен
                     // Иначе скрывать ничего не надо, всеравно придется показывать снова
                     if (!self.isActive()) {
                        // Будем скрывать подсказку только в том случае, если она сейчас привязана к текущему контролу
                        self._getInfobox(function (Infobox) {
                           if (Infobox.isCurrentTarget(self._getExtendedTooltipTarget())) {
                              Infobox.hide(Infobox.HIDE_TIMEOUT);
                           }
                        });
                     }
                  }
               });
            }
         },

         _isInfoboxFocus: function(focusedControl) {
           if (!focusedControl) {
              return false;
           }
           return !!focusedControl.getContainer().closest('.ws-info-box').length;
         },

         /**
          * Используется для определения, нужно ли для данного контрола показвать подсказку.
          * Можно перегружать чтобы модифицировать поведение.
          * @returns {boolean}
          * @protected
          */
         _isCanShowExtendedTooltip: function () {
            var isCanShow = false;
            if (!Constants.browser.isMobilePlatform && this._getOption('extendedTooltip')) {
               // для неактивного контрола проверям опцию alwaysShowExtendedTooltip
               if (!this.isEnabled()) {
                  isCanShow = !!this._getOption('alwaysShowExtendedTooltip');
               }
               else {
                  isCanShow = true;
               }
            }
            return isCanShow;
         },

         /**
          * Задает объект, относительно которого будет показана подсказка
          *
          * @returns {jQuery}
          * @protected
          */
         _getExtendedTooltipTarget: function () {
            return this.getContainer();
         },
         _getExtendedTooltipPositionContainer: function() {
            return this.getContainer();
         },
         /**
          * Показать подсказку. Если она уже на текущем контроле - ничего не делаем. Если очень надо - используем force
          * @param {Boolean} [force=false] Если передать true - подсказка будет показана даже если она уже на текущем элементе. Фактически это перестроение
          * @protected
          */
         _showExtendedTooltip: function (force) {
            var self = this,
               infoboxModule = 'Lib/Control/Infobox/Infobox',
               message, result;

            // Если подсказка уже на текущем контроле - ничего не делаем (кроме случая, если нас особо попросили)
            if (requirejs.defined(infoboxModule)) {
               var Infobox = requirejs(infoboxModule);
               if (force !== true && Infobox.isCurrentTarget(this._getExtendedTooltipTarget())) {
                  return;
               }
            }

            this._getInfobox(function(Infobox) {
               result = self._notify('onTooltipContentRequest', message = self._getOption('extendedTooltip'));
               // Deferred - дождемся результата
               if (result instanceof cDeferred) {
                  // Временно покажем индикатор загрузки
                  message = '<i class="ws-inline-ajax-loader-16">Загрузка&hellip;</i>';
                  // Когда придет результат - поменяем подсказку
                  result.addBoth(function (r) {
                     // Если подсказка невидима - покажем
                     if (!Infobox.hasTarget()) {
                        self._finallyShowInfobox(r);
                     } else {
                        // Если видима, то меняем текст только в том случае, если подсказка приделана к текущему контролу
                        if (Infobox.isCurrentTarget(self._getExtendedTooltipTarget())) {
                           Infobox.setText(self._alterTooltipText(r));
                        }
                        else {
                           Infobox.once("onShow", function () {
                              if (Infobox.isCurrentTarget(self._getExtendedTooltipTarget())) {
                                 Infobox.setText(self._alterTooltipText(r));
                              }
                           });
                        }
                     }
                     return r;
                  });
               } else if (typeof result === 'string') {
                  message = result;
               } else if (result === false) {
                  message = '';
               }
               self._finallyShowInfobox(message);
            });
         },

         /**
          * Метод, непосредственно показывающий подсказку. Выясняет где показывать через {@link _getExtendedTooltipTarget}
          * и модицицирует текст через {@link _alterTooltipText}
          * @param {String} message
          * @protected
          */
         _finallyShowInfobox: function (message) {
            if (this._isCanShowExtendedTooltip()) {
               var
                  self = this,
                  byCursor = this._initiatedByCursor,
                  confirmAction = function () {
                     return self._isCanShowExtendedTooltip() && (!byCursor || self._underCursor);
                  },
                  //При ховере Infobox'a, сработал mouseleave у target'a, который должен был скрыть подсказку
                  //Указываю autoHide, чтобы после ухода ховера с подсказки, она закрылась
                  cfg = {
                     control: this._getExtendedTooltipTarget(),
                     positionByTarget: this._getExtendedTooltipPositionContainer(),
                     message: this._alterTooltipText(message),
                     modifiers: this._getExtendedTooltipModifiers(),
                     autoHide: true,
                     needToShow: confirmAction
                  };
               cMerge(cfg, this._getOption('extendedTooltipConfig'));
               // TODO а нужна ли эта функция (confirmAction)?
               this._initiatedByCursor = false;
               this._getInfobox(function(Infobox) {
                  cfg.delay = Infobox.SHOW_TIMEOUT;
                  cfg.hideDelay = Infobox.ACT_CTRL_HIDE_TIMEOUT;
                  Infobox.show(cfg);
               });
            }
         },

         _getInfobox: function(callback) {
            var infoboxModule = 'Lib/Control/Infobox/Infobox';
            if (requirejs.defined(infoboxModule)) {
               return callback(requirejs(infoboxModule));
            } else {
               requirejs([infoboxModule], function (Infobox) {
                  return callback(Infobox);
               })
            }
         }
      };
   }
);
