define("Lib/Control/TemplatedArea/TemplatedArea", [
   "Core/core-instance",
   'Core/helpers/Function/forAliveOnly',
   "Core/ParallelDeferred",
   "Core/Deferred",
   "Lib/Control/TemplatedAreaAbstract/TemplatedAreaAbstract"
], function(cInstance, forAliveOnly, cParallelDeferred, cDeferred, TemplatedAreaAbstract) {

   "use strict";

   function setTemplateOnDestroyedHandler() {
      return new Error('Область разрушена до окончания предыдущего вызова в очереди setTemplateQueue');
   }

   /**
    * Модуль "Компонент "Область по шаблону".
    * Представляет собой статическую экранную область, в которую можно устанавливать XML-шаблон
    * @public
    * @class Lib/Control/TemplatedArea/TemplatedArea
    * @extends Lib/Control/TemplatedAreaAbstract/TemplatedAreaAbstract
    * @author Крайнов Д.О.
    * @control
    * @category Containers
    * @designTime actions /design/design
    * @designTime plugin /design/DesignPlugin
    * @initial
    * <component data-component='Lib/Control/TemplatedArea/TemplatedArea' style='width: 100px; height: 100px;'></component>
    */
   var TemplatedArea = TemplatedAreaAbstract.extend(/** @lends Lib/Control/TemplatedArea/TemplatedArea.prototype */{
      /**
       * @event onBeforeClose Событие, возникающее перед разрушением области
       * @param {Core/EventObject} eventObject описание в классе Core/Abstract
       */
      /**
       * @event onAfterClose Событие, возникающее после разрушения области
       * @param {Core/EventObject} eventObject описание в классе Core/Abstract
       */
      $protected: {
         _width: '',
         _height: '',
         _setTemplateQueue: null
      },

      $constructor: function(){
         this._publish('onBeforeClose', 'onAfterClose', 'onBeforeChangeActiveArea');
         this._setTemplateQueue = (new cDeferred()).callback(true);

         // класс нужен для того, чтобы быстро найти TemplatedArea-и и при установке шаблона зафиксировать внутри шапку если нужно
         this.getContainer().addClass('ws-templatedArea');
      },

      _activeOnLoad: function() {
         if(!this._parent) {
            this._activateFirstCtrl();
         }
      },

      _loadDescendents: function(){
         this._notify("onStateChanged");

         var loadDescendentsSuper = TemplatedArea.superclass._loadDescendents;

         return this._setTemplateQueue.addCallback(forAliveOnly(function() {
            //Если шаблона нет, то вызываем родительский метод, который может создать дочерние контролы по родительскому шаблону
            var loadDfr = this._options.template ? this._loadTemplate() : loadDescendentsSuper.apply(this, arguments);
            return loadDfr.addCallback(this._activeOnLoad.bind(this));
         }, this, setTemplateOnDestroyedHandler));
      },

      _templateInnerCallback: function() {
         TemplatedArea.superclass._templateInnerCallback.apply(this);

         var state = this.getCurrentTemplateName();
         if (typeof state == 'string') {
            this._notify("onStateChanged", state);
         }
      },

      applyState : function(state){
         if (state !== this.getCurrentTemplateName()){
            this.setTemplate(state);
         }
      },
      _setTemplateDimensions: function(dimensions) {
         var args = arguments;
         if(!this._options.keepSize)
            args = [ { width: '', height: '' } ];
         TemplatedArea.superclass._setTemplateDimensions.apply(this, args);
      },
      /**
       * @param {String} [templateName] имя шаблона
       * @param {String} [templateOptions] опции шаблона (компонента)
       * @returns {Core/Deferred} результат загрузки шаблона
       */
      _prepareTemplate: function(templateName, templateOptions) {
         return this._runInBatchUpdate('_prepareTemplate' + ' - ' + this._id, function() {
            return this._loadTemplate(templateName, templateOptions).addCallback(function(){
               this._notify('onBeforeShow');
               this._notifyBatchDelayed('onAfterShow');
            }.bind(this));
         });
      },
      /**
       * Меняет шаблон в области на заданный
       * @param {String} templateName Имя шаблона.
       * @param {Object} [templateOptions] Опции шаблона (компонента).
       * @returns {Core/Deferred} Результат загрузки шаблона.
       * @see clearTemplate
       */
      setTemplate: function(templateName, templateOptions) {
         this._notify('onBeforeChangeActiveArea');
         //Нужно возвращать "зависимый" Deferred, чтобы разные тормозные операции, повешенные пользователем на результат setTemplate,
         //не тормозили бы очередь. А то ожидание ответа на диалог, повешенное на рез-т setTemplate, блокирует все последующие setTemplate
         var handler = forAliveOnly(this._setTemplate.bind(this, templateName, templateOptions), this, setTemplateOnDestroyedHandler);
         return this._setTemplateQueue.addBoth(handler).createDependent();
      },

      /**
       * Очищает область от текущего шаблона и загружает в пустой шаблон.
       * Работает аналогично вызову setTemplate("" | null | undefined)
       */
      clearTemplate: function() {
         return this.setTemplate('');
      },
      _cleanupCurrentTemplate: function() {
         if(this._currentTemplateInstance) {
            var handlersPack = this._currentTemplateInstance.getDeclaredHandlers();
            for(var evntName in handlersPack) {
               if(handlersPack.hasOwnProperty(evntName)) {
                  var eHandlers = handlersPack[evntName];
                  for(var i = 0, l = eHandlers.length; i < l; i++)
                     this.unsubscribe(evntName, eHandlers[i]);
               }
            }
            // принудительно очищаем все события onResize, которые были созданы в loadTemplate
            this.unbind('onResize');
            this._currentTemplateInstance = null;
         }
         this._removeControls();
         this._container.attr("hasMarkup", "false").children().not(".r").empty().remove();
         this._options.template = "";
         this._options.children = [];
      },
      _setTemplate: function(templateName, templateOptions) {
         return this._runInBatchUpdate('_setTemplate' + ' - ' + this._id, function() {
            this._cleanupCurrentTemplate();
            this._dChildReady = new cParallelDeferred();
            // Шилов Д.А.
            if( templateName instanceof cDeferred ) {
               this._options.template = ''; // Пока не знаем имени шаблона
            } else {
               this._options.template = templateName;
            }
            return this._prepareTemplate(templateName, templateOptions);
         });
      },
      destroy: function() {
         //FloatArea сама стреляет эти события
         var checkFA = !cInstance.instanceOfModule(this, 'Lib/Control/FloatArea/FloatArea');
         if (checkFA) {
            this._notify('onBeforeClose');
         }
         TemplatedArea.superclass.destroy.apply(this, arguments);
         if (checkFA) {
            this._notify('onAfterClose');
         }
      },

      _postUpdateResizer: function(width, height) {
         if(!this._parent && this._isPage){
            var css = {};
            // сделано, чтобы появлялись скроллеры
            if(this._options.autoWidth) {// только для корневого элемента
               css['min-width'] = width;
            }

            // для корневой области - в любом случае
            css['min-height'] = height;

            this._container.css(css);
         }
      },

      _restoreSize: function() {
         if(this._isPage && !this.getParent()) {// растягивается по ширине только корневая область по шаблону
            var parent = this._container.parent();
            var margins = this._margins.left + this._margins.right;
            var oldWidth = parent.width() - margins;

            this._container.css({
               width: (this._horizontalAlignment === 'Stretch' ? '100%' : (this._options.autoWidth ? 'auto' : this._width)),
               height: (this._verticalAlignment === 'Stretch' ? '100%' : (this._options.autoHeight ? 'auto' : this._height))
            });

            var newWidth = parent.width() - margins;
            // Если элемент развернул окно так, что появилась полоса прокрутки,
            // то размер уже не актуален и нужно пересчитывать.
            if (oldWidth != newWidth) {
               this._container.css({width: newWidth});
            }
         } else {
            TemplatedArea.superclass._restoreSize.apply(this, arguments);
         }
      }
   });

   return TemplatedArea;

});