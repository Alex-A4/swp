define('Lib/Control/SwitchableArea/SwitchableAreaItem', [
   'Core/helpers/Number/randomId',
   "Core/ParallelDeferred",
   "Core/Deferred",
   "Lib/Control/CompoundControl/CompoundControl"
],
   function(randomId, cParallelDeferred, cDeferred, CompoundControl) {
   'use strict';

   /**
    * Класс переключаемой области, который используется в {@link Lib/Control/SwitchableArea/SwitchableArea}.
    * @class Lib/Control/SwitchableArea/SwitchableAreaItem
    * @extends Lib/Control/CompoundControl/CompoundControl
    * @author Крайнов Д.О.
    * @public
    * @ignoreOptions name, allowChangeEnable, className, contextRestriction, enabled, independentContext, tabIndex
    */
   var SwitchableAreaItem = CompoundControl.extend(/** @lends Lib/Control/SwitchableArea/SwitchableAreaItem.prototype */{
       /**
        * @event onIdChanged Происходит при изменении идентификатора области.
        * @param {String} oldId Предыдущий идентификатор области.
        * @param {String} Id Новый идентификатор области.
        */
       /**
        * @event onContentChanged Происходит при изменении содержимого области.
        * @param {String} Id Идентификатор области.
        * @param {String|Content} content Новое содержимое области.
        */
       /**
        * @event onLoadedChanged
        * @param {String} Id
        * @param {Boolean} isLoaded
        */
      $protected: {
         _loaded: false,
         _options: {
            /**
             * @cfg {String} Устанавливает идентификатор области.
             * @remark
             * Для каждой области должен быть уникальным.
             * @see setId
             * @see getId
             */
            id: '',
            /**
             * @cfg {String|Content} Устанавливает содержимое области.
             */
            content: '',
            /**
             * @cfg {String} Имя модуля, который необходимо разместить в области. Используется вместо опции {@link content}
             */
            template: undefined,
            /**
             * @cfg {Object} Конифгурация, с которой будет создан {@link} template
             */
            componentOptions: {},
             /**
              * @cfg {Boolean} Устанавливает видимость области.
              */
            visible: false,
            /**
             * @cfg {Boolean} Устанавливает наличие контента в верстке области.
             * @see isContentExistence
             * @see setContentExistence
             */
            contentExistence: false,
            /**
             * @cfg {Boolean} Устанавливает валидацию области, даже если она скрыт в данный момент.
             */
            validateIfHidden: true
         }
      },
      $constructor: function(){
         this._publish('onIdChanged', 'onContentChanged', 'onLoadedChanged');
      },
      // Подмена метода из CompoundControl. Не инстанцируем детей при инициализации.
      // Дети инстанцируются методом loadChildControls
      _loadControls: function(pdResult){
         return pdResult.done([]);
      },
       /**
        * Возвращает идентификатор области.
        * @returns {String}
        * @see id
        * @see setId
        */
      getId: function(){
         return this._options.id;
      },
       /**
        * Устанавливает идентификатор области.
        * @returns {String}
        * @see id
        * @see setId
        */
      setId: function(id){
         var oldId = this.getId();
         if (!id){ // не может быть пустым
            id = randomId('ws-area-');
         }
         this._options.id = id;
         this._notify('onIdChanged', oldId, id);
      },
       /**
        * Возвращает содержимое области.
        * @returns {String|Content}
        * @see setContent
        * @see content
        */
      getContent: function(){
         return this._options.content;
      },

       getTemplate: function() {
         return this._options.template;
       },

       getComponentOptions: function() {
         return this._options.componentOptions;
       },
       /**
        * Устанавливает содержимое области.
        * @param {String|Content} content
        * @see getContent
        * @see content
        * @deprecated setContent Использование метода может приводить серьёзным к утечкам памяти
        * В качестве альтернативы могут использоваться опции template и componentOptions у SwitchableAreaItem
        *@Deprecated
        */
       
      setContent: function(content){
         this._options.content = content;
         if (this.isLoaded()){
            this.destroyChildControls();
            this.setLoaded(false);
         }
         this._clearContainer();
         this.setContentExistence(true); //При установке контента запоминаем, что он установлен
         this._notify('onContentChanged', this.getId(), content);
      },
       /**
        * @returns {*}
        * @see setLoaded
        */
      isLoaded: function(){
         return this._loaded;
      },
       /**
        * @param isLoaded
        * @see isLoaded
        */
      setLoaded: function(isLoaded){
         this._loaded = isLoaded;
         this._notify('onLoadedChanged', this.getId(), isLoaded);
      },
       /**
        * @returns {Boolean|contentExistence|*}
        * @see contentExistence
        * @see setContentExistence
        */
      isContentExistence: function() {
         return this._options.contentExistence;
      },
       /**
        * @param {Boolean} value
        * @see contentExistence
        * @see isContentExistence
        */
      setContentExistence: function(value) {
         this._options.contentExistence = value;
      },
      /**
       * Отложенно инстанцирует дочерние компоненты
       * @returns {Core/Deferred} - Deferred готовности
       */
      loadChildControls: function() {
         if (!this.isContentExistence()) {
            this.setContent(this.getContent());
         }
         var def = new cDeferred();
         if (!this.isLoaded()){
            var self = this;
            this.setLoaded(true);
            self._loadControlsBySelector(new cParallelDeferred(), undefined, '[data-component]')
               .getResult().addCallback(function(){
                  self._notify('onReady');
                  def.callback();
               });
         }
         else {
            def.callback();
         }
         return def;
      },
      /**
       * Уничтожает инстансы дочерних компонент области
       * @private
       */
      destroyChildControls: function(){
         for (var i = this._childControls.length - 1; i >= 0; i--) {
            if (this._childControls[i] && this._childControls[i].destroy instanceof Function) {
               this._childControls[i].destroy();
            }
         }
         this._childControls.length = 0;
         this._childContainers.length = 0;
         this._clearContainer();
      }
   });

   return SwitchableAreaItem;
});
