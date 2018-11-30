define('Lib/StickyHeader/StickyHeaderMediator/StickyHeaderMediator', [
   'Core/Abstract',
   'Core/EventBus',
   'Core/detection',
   'Core/helpers/Hcontrol/isElementVisible',
   'Core/IoC',
   'Core/core-instance',
   'Core/helpers/Function/runDelayed',
   'Lib/StickyHeader/StickyHeaderManager/StickyHeaderManager',
   'Core/constants'
], function(Abstract, EventBus, cDetection, isElementVisible, IoC, cInstance, runDelayed, StickyHeaderManager) {
   'use strict';
   /**
    * Связыватель фиксированной шапки.
    * Занимается подпиской на события страниц, всплывающих панелей и контролов и корректирует фиксированную шапку.
    * @class Lib/StickyHeader/StickyHeaderMediator/StickyHeaderMediator
    * @author Миронов А.Ю.
    */

   var calcEventsBound = false,
      wsControlsArray = [],
      switchableAreaArray = [],
      tempAreasArray = [];

   /**
    * Возвращает функцию фильтр, которую можно использовать в jquery filter, что бы отфильтровать элементы у которых
    * ближайший родитель с классом closestSelector является html узлом element.
    * @param element
    * @param closestSelector
    * @returns {Function}
    */
   var filterByClosestParentElements = function (element, closestSelector) {
      return function(ind, elem){
         var closest = $(elem).closest(closestSelector);
         return !closest.length || closest[0] === element;
      };
   };

   var stickyHeaderMediator = new (Abstract.extend({
      $constructor : function(){},
      documentReady: function(eventObject, args){
         var error = args && args.error;
         // если во время бутапа произошла ошибка, значит часть компонентов не было оживлено
         // и настраивать sticky header смысла нет т.к. страница не функциональна
         // возможно до оживления ws-SwitchableArea дело не дошло и во время инициализации sticky header все упадет
         if (error) {
            IoC.resolve('ILogger').error('StickyHeaderMediator', (error && error.message) || error);
         } else {
            this._subscribeCommonEvents();
            this._initFixation();
         }
      },
      _subscribeCommonEvents: function(){
         if (!calcEventsBound){
            var self = this,
               globalChannel = EventBus.globalChannel();

            // события, при которых возможно изменение позиции или ширины шапки
            var globalResizeHandler = function globalResizeHandler(){
               self._resizeHandler();
            };
            $(window).bind('resize', globalResizeHandler);
            this.subscribeTo(EventBus.channel('navigation'), 'onAccTransform', globalResizeHandler);

            this.subscribeTo(globalChannel, 'onWindowCreated', function(e, wsWindow){
               wsWindow.subscribe('onAfterShow', function() {
                  self._initFixation(wsWindow.getContainer());
                  wsWindow.subscribe('onBeforeClose', function(e) {
                     if (e.getResult() !== false){
                        self._unfixChildren(wsWindow.getContainer(), true);
                     }
                  });
               });
            });

            this.subscribeTo(globalChannel, 'onFloatAreaCreating', function(e, floatArea){
               self.subscribeTo(floatArea, 'onAfterShow', function(){
                  if (floatArea.getProperty('isStack') && floatArea.getContainer().closest('.ws-sticky-header__scrollable-container').length === 1){
                     self._initFixation(floatArea.getContainer());
                     self.subscribeTo(floatArea, 'onBeforeClose', function(e){
                        if (e.getResult() !== false){
                           self._unfixChildren(floatArea.getContainer().closest('.ws-sticky-header__scrollable-container'), true);
                        }
                     });
                     self.subscribeTo(floatArea, 'onChangeMaximizeState', function(e){
                        self._resizeHandler(floatArea.getContainer());
                     });
                  }
               });
               // Во всех внутренних скроллируемых контенерах фиксируем заголовки до анимации открытия если
               // плавающая панель сконфигурирована так что внутренние компоненты инициализируются до открытия.
               if (floatArea.getProperty('showOnControlsReady')) {
                  self.subscribeTo(floatArea, 'onBeforeShow', function(e){
                     this.getContainer().find('.ws-sticky-header__scrollable-container').each(function (index, container) {
                        self._findHeaderElements($(container));
                     });
                  });
               }
            });
            // Даём возможность фиксировать шапку по глобальному событию.
            // В EDONavigationHandlers на переключение навигации дестроятся BrowserTabs и интанцируются новые.
            // Мы такое отловить автоматиески не можем отловить, поэтому введено данное глобальное событие.
            // FixMe: Когда EDO перейдут на роутинг с переключением областей при переключении навигации - убрать глоб.событие и ловить переключение автоматически
            this.subscribeTo(EventBus.channel('stickyHeader'), 'onForcedStickHeader', function(e, $container){
               self._initFixation($container);
            });
            calcEventsBound = true;
         }
      },
      _initFixation: function($block){
         // если передать блок - то хотят зафиксировать только его содержимое
         var self = this,
            fixScrollableContainerElements = function fixScrollableContainerElements(index, container){
               self._findHeaderElements($(container));
            };
         if($block){
            // Устанавливаем обработчики для фиксации заголовков на все изменяемые области лежащие вне скролируемых областей
            this._initChangeableAreas($block);
            // Фиксируем все в скролируемых областях
            var closestScrollable = $block.closest('.ws-sticky-header__scrollable-container');
            if (closestScrollable.length){
               fixScrollableContainerElements(0, closestScrollable[0]);
            }
            var innerScrollableContainers = $block.find('.ws-sticky-header__scrollable-container');
            innerScrollableContainers.each(fixScrollableContainerElements);
         }
         else { // иначе фиксируем всё, что найдём
            // Устанавливаем обработчики для фиксации заголовков на все изменяемые области лежащие вне скролируемых областей
            this._initChangeableAreas($('body'));
            // Фиксируем все в скролируемых областях
            $('.ws-sticky-header__wrapper > .ws-sticky-header__scrollable-container').each(fixScrollableContainerElements);
         }
      },
      _findHeaderElements: function($fixedHeaderWrapper){
         if (!$fixedHeaderWrapper.hasClass('ws-sticky-header__scrollable-container')){
            throw new Error('Lib/StickyHeader/StickyHeaderMediator/StickyHeaderMediator::_findHeaderElements - incorrect container fixation');
         }
         var self = this,
            elements = $fixedHeaderWrapper.find('.ws-sticky-header__block:not(.ws-sticky-header__registered), .ws-sticky-header__table:not(.ws-sticky-header__registered)'),
            drawHeadHandler = function (self, context, element) {
               self._updateTableHeaderVisibility(element);
               self._resizeHandler.bind(context, element);
            };

         var filterOnlySelfElements = filterByClosestParentElements($fixedHeaderWrapper[0], '.ws-sticky-header__scrollable-container');

         // отфильтровываем только свои элементы, если внутри есть другие контейнеры с фикс.шапкой, то они сами обработают свои фикс.элементы
         elements = elements.filter(filterOnlySelfElements);

         elements.each(function (ind, elem) {
            var jqElem = $(elem),
               isTableHeader = jqElem.hasClass('ws-sticky-header__table'),
               wsControl = jqElem.wsControl(),
               view;
            if (wsControl){
               // Подписываемся на события 1 раз т.к. по этим событиям обновляется весь контейнер контрола
               if (wsControlsArray.indexOf(wsControl) === -1) {
                   
                  self.subscribeTo(wsControl, 'onDestroy', function() {
                     self._unfixChildren(wsControl.getContainer(), true);
                     var indexOfCtrl = wsControlsArray.indexOf(wsControl);
                     wsControlsArray.splice(indexOfCtrl, 1);
                  });

                  self.subscribeTo(wsControl, 'onAfterVisibilityChange', function (event, visibile) {
                     if (visibile) {
                        self._initFixation(wsControl.getContainer());
                     } else {
                        self._unfixChildren(wsControl.getContainer(), true);
                     }
                  });

                  self.subscribeTo(wsControl, 'onResize', function () {
                     wsControl._runBatchDelayedFunc('stickyResize', self._resizeHandler.bind(this, wsControl.getContainer()));
                     // Если заголовоки лежат непосредсвенно в скрол контейнере, то ресайзим их.
                     if (cInstance.instanceOfModule(wsControl, 'SBIS3.CONTROLS/ScrollContainer')) {
                        runDelayed(function () {
                           self._resizeHandler(wsControl.getContainer().children('.ws-sticky-header__scrollable-container'));
                        });
                     }
                  });

                  // TODO: избавится от зависимости от SBIS3.CONTROLS

                  // Синхронно обновляем заголовки в браузере после изменения корня в иерархическом представлении
                  // т.к. в этот момент меняются хлебные крошки. Хлебные крошки обновляются по onResize,
                  // но событие onResize асинхронное и видно что таблица смещается при обновлении корня.
                  if (cInstance.instanceOfModule(wsControl, 'SBIS3.CONTROLS/Browser')) {
                     view = wsControl.getView();
                     if (cInstance.instanceOfMixin(view, 'SBIS3.CONTROLS/Mixins/TreeMixin') ||
                           cInstance.instanceOfMixin(view, 'SBIS3.CONTROLS/Mixins/hierarchyMixin')) {
                        self.subscribeTo(view, 'onSetRoot', function() {
                           self._resizeHandler(wsControl.getContainer());
                        });
                     }
                  }

                  if (isTableHeader && cInstance.instanceOfModule(wsControl, 'SBIS3.CONTROLS/DataGridView')){
                     self.subscribeTo(wsControl, 'onDrawHead', function(){
                        // Нельзя синхронизировать заголовки отложенно после того как отрисовали их т.к.
                        // они используются для рассчета положения хлебных крошек в браузере.
                        self._dataGridViewDrawHeadHandler(jqElem);
                        /**
                         * В safari requestAnimationFrame, работает не так как хотелось бы.
                         * drawHeadHandler происходит после перерисовки шапки, а долна совместно.
                         */
                        if (cDetection.safari) {
                           drawHeadHandler(self, this, jqElem);
                        } else {
                           runDelayed(function () {
                              drawHeadHandler(self, this, jqElem);
                           });
                        }
                     });
                     // При асинхронном обновлении по onResize видно как данные перерисовываются.
                     // Синхронизируем размеры заголовка таблицы синхронно.
                     self.subscribeTo(wsControl, 'onDrawItems', function(){
                        if (cDetection.safari) {
                           StickyHeaderManager.synchronizeTableHeaderColumnWidth(jqElem);
                        } else {
                           runDelayed(function () {
                              StickyHeaderManager.synchronizeTableHeaderColumnWidth(jqElem);
                           });
                        }
                     });
                     self.subscribeTo(wsControl, 'onChangeHeadVisibility', function(){
                        // В некоторых случаях таблица со скрытыми заголовками может быть еще не зафиксирована,
                        // обновляем фиксацию заголовков
                        self._initFixation(wsControl.getContainer());
                        self._updateTableHeaderVisibility(jqElem);
                     });
                     if (cInstance.instanceOfMixin(wsControl, 'SBIS3.CONTROLS/Mixins/CompositeViewMixin')) {
                        self.subscribeTo(wsControl, 'onViewModeChanged', function (event) {
                           if (wsControl.getViewMode() === 'table') {
                              self._initFixation(wsControl.getContainer());
                           } else {
                               self._unfixChildren(wsControl.getContainer(), true);
                           }
                        });
                     }
                  }
                  wsControlsArray.push(wsControl);
               }
            }
         });

         self._initChangeableAreas($fixedHeaderWrapper);

         // Не фиксируем заголовки если контейнер не видим. Они зафиксируются по событиям изменения видимости.
         if (isElementVisible($fixedHeaderWrapper)) {
            this._fixChildren($fixedHeaderWrapper, elements);
         }
      },

      /**
       * Устанавливает обработчики на изменяемые области(SwitchableArea, TemplatedArea),
       * которые фиксируют/расфиксируют заголовки при изменении этих областей.
       * @param $block
       * @private
       */
      _initChangeableAreas: function ($block) {
         var self = this,
            filterOnlySelfElements = filterByClosestParentElements($block[0], '.ws-sticky-header__scrollable-container');

         // в SwitchableArea на области изначально может не быть вёрстки, но при переключении областей может появиться, а там может быть фиксация
         var switchableAreas = $block.find('.ws-SwitchableArea').filter(filterOnlySelfElements);
         switchableAreas.each(function (ind, elem) {
            var swArea = $(elem).wsControl();
            if (switchableAreaArray.indexOf(swArea) === -1){
               switchableAreaArray.push(swArea);
               self.subscribeTo(swArea, 'onBeforeChangeActiveArea', function(e, oldArea){
                  if (oldArea) {
                     self._unfixChildren(oldArea.getContainer(), true);
                  }
               });
               self.subscribeTo(swArea, 'onAfterChangeActiveArea', function(e, newArea){
                  self._initFixation(newArea.getContainer());
               });
               self.subscribeTo(swArea, 'onDestroy', function(){
                  var swAreaIndex = switchableAreaArray.indexOf(swArea);
                  switchableAreaArray.splice(swAreaIndex, 1);
               });
            }
         });

         // фиксация после установки шаблона в TemplatedArea
         var tempAreas = $block.find('.ws-templatedArea').filter(filterOnlySelfElements);
         tempAreas.each(function (ind, elem) {
            var tempArea = $(elem).wsControl();
            if (tempAreasArray.indexOf(tempArea) === -1){
               tempAreasArray.push(tempArea);
               self.subscribeTo(tempArea, 'onAfterShow', function(){
                  self._initFixation(tempArea.getContainer());
               });
               self.subscribeTo(tempArea, 'onDestroy', function(){
                  var tempAreaIndex = tempAreasArray.indexOf(tempArea);
                  tempAreasArray.splice(tempAreaIndex, 1);
               });
               self.subscribeTo(tempArea, 'onBeforeChangeActiveArea', function(){
                  self._unfixChildren(tempArea.getContainer(), true);
               });
            }
         });
      },

      _fixChildren: function($container, elements){
         // ToDo: DIV с Id == 'header' прописан в шаблонах в Теме Скрепке и непонятно где конкретно надо его фиксировать, а где нет
         // Фиксируем его только вместе с чем-то, т.к. считаем, что один он зафиксирован быть не может
         // сделано по ошибке https://inside.tensor.ru/opendoc.html?guid=5e6d4917-e372-4cef-bfd9-826530e6c232
         if (!elements || !elements.length || (elements.length === 1 && $(elements[0]).is('#header'))){
            return;
         }

         StickyHeaderManager.fixAllChildren($container, elements);
      },
      _unfixOne: function(elem, isOnDestroy){
         StickyHeaderManager.unfixOne(elem, isOnDestroy);
      },
      _unfixChildren: function($container, isOnDestroy){
         StickyHeaderManager.unfixAllChildren($container, isOnDestroy);
      },
      _resizeHandler: function(jqElem){
         StickyHeaderManager.checkStickyHeaderSize(jqElem);
      },
      _dataGridViewDrawHeadHandler: function($table){
         StickyHeaderManager.tableHeadRedrawn($table);
      },
      _updateTableHeaderVisibility: function($table) {
         StickyHeaderManager.updateTableHeaderVisibility($table);
      }
   }))();

   // ждаем когда bootup выполнится, и только тогда запускаем инициализацию stickyHeader
   EventBus.globalChannel().subscribe('bootupReady', stickyHeaderMediator.documentReady.bind(stickyHeaderMediator));
});
