define('Lib/StickyHeader/StickyHeaderManager/StickyHeaderManager', [
   'Core/constants',
   'Core/deprecated',
   'Core/detection',
   'Core/EventBus',
   // 'Core/helpers/Function/debounce',
   'css!Lib/StickyHeader/StickyHeaderManager/StickyHeaderManager'
], function(cConstants, deprecated, cDetection, EventBus/*, debounce*/) {
   'use strict';
   /* jshint maxcomplexity:20 */
   /**
    * Менеджер фиксированной шапки.
    * Позволяет фиксировать блоки в шапке страницы / всплывающей панели / произвольного скроллируемого блока.
    * Также содержит логику по прилипанию "прилипающих" блоков к фиксированной шапке.
    * Требует определённой организации вёрстки.
    * @class Lib/StickyHeader/StickyHeaderManager/StickyHeaderManager
    * @author Миронов А.Ю.
    */

   var fixedHeadersStack = [],     // Стек заголовков, зафиксированных вверху страницы (как зафиксированные "навсегда", так и зафиксированные прилипающие)
      stickyHeadersStack = [],     // Стек заголовков, которые могут прилипать к верху страницы при скроллинге
      hasGradient = !(cConstants.browser.isIE7 || cConstants.browser.isIE8 || cConstants.browser.isIE9),// IE9 и ниже не поддерживает CSS-стиль linear-gradient
      wrappersArray = [],
      parseMarginOrPadding = function parseMarginOrPadding(val){
         var result = 0;
         if (val && val !== '0px'){
            result = parseInt(val.replace('px', ''), 10);
            if (isNaN(result)){
               result = 0;
            }
         }
         return result;
      },
      getFullPadding = function getFullPadding(jqElem){
         var padding = jqElem.css('padding');
         if (padding !== ''){
            return (padding === '0px') ? '' : padding;
         }
         /* в IE9 и IE10 (в IE8 - нет) замечено, что css('padding') возвращает '' при padding-top: 8px; */
         var paddingObj = {
            top: parseMarginOrPadding(jqElem.css('padding-top')),
            bottom: parseMarginOrPadding(jqElem.css('padding-bottom')),
            left: parseMarginOrPadding(jqElem.css('padding-left')),
            right: parseMarginOrPadding(jqElem.css('padding-right'))
         };
         if (paddingObj.top || paddingObj.bottom || paddingObj.left || paddingObj.right){
            return (paddingObj.top ? paddingObj.top + 'px' : 0) + ' ' + (paddingObj.right ? paddingObj.right + 'px' : 0) +
               ' ' + (paddingObj.bottom ? paddingObj.bottom + 'px' : 0) + ' ' + (paddingObj.left ? paddingObj.left + 'px' : 0);
         }
         return '';
      },
      updateWrapperScrolledStyle = function (jqScrollContainer, scrolled) {
         jqScrollContainer.parent('.ws-sticky-header__wrapper').toggleClass('ws-sticky-header__wrapper-scrolled', jqScrollContainer.scrollTop() > 0);
      },
      scrollHandler = function scrollHandler(){
         var registry = $(this);
         updateWrapperScrolledStyle(registry);
         stickyHeaderManager.checkAllSticky(registry);
      },
      headerWheelHandler = function headerWheelHandler(e){
         // при прокрутке колеса мыши над фикс.шапкой - скроллим реестр
         var isIE8 = cConstants.browser.isIE8,
            delta = isIE8 ? e.wheelDelta || e.originalEvent.wheelDelta : e.deltaY || e.originalEvent.deltaY,
            scrollable = $(this).parent('.ws-sticky-header__wrapper').children('.ws-sticky-header__scrollable-container');
         if (isIE8){
            // в IE8 при скроллинге "вниз" всегда -120, а "вверх" 120, меняем знак и значение дельты
            delta = delta < 0 ? 80 : -80;
         }
         scrollable[0].scrollTop += delta;
      },
      getFixedContainer = function (fixedObject) {
         return fixedObject.isTableHeader ? fixedObject.elemCopy : fixedObject.jqElem;
      },
      getFixedDummyContainer = function (fixedObject) {
         return fixedObject.isTableHeader ? fixedObject.jqElem : fixedObject.elemCopy;
      },
      getStickyContainerFromOrigPlacement = function (stickyObject) {
         return stickyObject.stuck ? getFixedDummyContainer(stickyObject.fixedStackElem) : stickyObject.jqElem;
      },
      getStackElementByFixedContainer = function (element) {
         if (element instanceof jQuery) {
            element = element[0];
         }
         for (var i = 0, l = fixedHeadersStack.length; i < l; i++) {
            if (getFixedContainer(fixedHeadersStack[i])[0] === element) {
               return fixedHeadersStack[i];
            }
         }
      },
      notifyOnStickyChanged = function () {
         if (!_changedTimer) {
            _changedTimer = setTimeout(_notifyOnStickyChanged, 0)
         }
      },
      _notifyOnStickyChanged = function () {
         EventBus.channel('stickyHeader').notify('onStickyHeadersChanged');
         _changedTimer = null;
      },
      _changedTimer;

   var stickyHeaderManager = {
      _subscribeWrapper: function($wrapper){
         if ($wrapper.length && wrappersArray.indexOf($wrapper[0]) === -1){
            var scrollableContainer = $wrapper.children('.ws-sticky-header__scrollable-container'),
               headerContainer = $wrapper.children('.ws-sticky-header__header-container'),
               innerScrollContainers;

            if (scrollableContainer.length  && headerContainer.length) {
               wrappersArray.push($wrapper[0]);
               // при скролле включаем тени и проверяем необходимость прилипления липнущих блоков
               scrollableContainer.bind('scroll.stickyHeaderManager', scrollHandler);
               // если крутим колесом мыши над фикс.шапкой - скроллим контейнер со скроллом, к которому относится шапка
               headerContainer.bind(cConstants.browser.isIE8 ? 'mousewheel.stickyHeaderManager' : 'wheel.stickyHeaderManager', stickyHeaderManager.headerWheelHandler);
               // Генерируем события 'onClick' на контроле в котором лежал заголовок
               headerContainer.bind('click.stickyHeaderManager', stickyHeaderManager._headerClickHandler);
            }
            updateWrapperScrolledStyle(scrollableContainer);
         }
      },
      _unSubscribeWrapper: function($wrapper){
         var wrapperIndex = wrappersArray.indexOf($wrapper[0]),
            headerContainer = $wrapper.children('.ws-sticky-header__header-container');

         if (wrapperIndex !== -1){
            wrappersArray.splice(wrapperIndex, 1);
            $wrapper.children('.ws-sticky-header__scrollable-container').unbind('scroll.stickyHeaderManager');
            headerContainer.unbind(cConstants.browser.isIE8 ? 'mousewheel.stickyHeaderManager' : 'wheel.stickyHeaderManager');
            headerContainer.unbind('click.stickyHeaderManager');
            $wrapper.removeClass('ws-sticky-header__wrapper-scrolled');
         }
      },
      _headerClickHandler: function (event) {
         var stackElem = getStackElementByFixedContainer($(event.target).closest('.ws-sticky-header__table-header-copy'));
         if (stackElem) {
            getFixedDummyContainer(stackElem).wsControl()._onClickHandler(event);
         }
      },
      // сортируем фикс.элементы по высоте их верхней границы и регистритуем
      fixAllChildren: function($container, elements){
         stickyHeaderManager._subscribeWrapper($container.closest('.ws-sticky-header__wrapper'));
         var innerWrappers = $container.find('.ws-sticky-header__wrapper:visible');
         innerWrappers.each(function (ind, elem){
            stickyHeaderManager._subscribeWrapper($(elem));
         });
         var sortedList = [],
            sortElements = elements ? elements.filter(':visible') : $container.find('.ws-sticky-header__block:visible:not(.ws-sticky-header__registered), .ws-sticky-header__table:visible:not(.ws-sticky-header__registered)'),
            outOfScrollContainer = sortElements.not('.controls-ScrollContainer .ws-sticky-header__block, .controls-ScrollContainer .ws-sticky-header__table');

         outOfScrollContainer.each(function (index, element) {
            var jqElement = $(element),
               str = 'Обнаружен зафиксированный заголовок вне SBIS3.CONTROLS/ScrollContainer';
            if (jqElement.attr('id') === 'header' || jqElement.hasClass('ws-IE8Warning')) {
               return;
            }
            ['id', 'class'].forEach(function(attrName) {
               var attr = jqElement.attr(attrName);
               if (attr)  {
                  str += ' ' + attrName + ': "' + attr + '"';
               }
            });
            str += '. Если на странице есть ScrollContainer, то вам необходимо отключить фиксацию этого заголовка. ' +
               'Если на странице нет ScrollContainer, то необходимо внедрить его, отказавшись по максимуму от фиксации. ' +
               'В идеальном случае фиксация заголовков должна остаться только для заголовков таблиц. ' +
               'В 3.17.350 механизм фиксации заголвков вне ScrollContainer отключен.';
            deprecated.showInfoLog(str);
         });

         sortElements.each(function (ind, elem) {
            var jqElem = $(elem);
            sortedList.push({
               index: ind,
               jqElem: jqElem,
               top: jqElem.offset().top,
               height: jqElem.innerHeight()
            });
         });
         sortedList.sort(function(el1, el2){
            var topDiff = el1.top - el2.top;
            return topDiff !== 0 ? topDiff : (el1.height > 0 ? 1 : (el1.index - el2.index));
         });
         // Регистрируем липнущие элементы и регистрируем и закрепляем фиксируемые.
         for (var i = 0, l = sortedList.length; i < l; i++){
            stickyHeaderManager._registerElement(sortedList[i].jqElem);
         }
         // После регистрации проверяем липнущие элементы, если липнущий элемент находится в самом верху,
         // то он будет сразу же закреплен. Если элемент находится в самом верху страницы,
         // и явно не помечен как липнущий, то он будет считаться зафиксированным навсегда.
         // В данном случае фиксируем элементы которые явно помечены как липнущие.
         // Это контейнеры находящиеся внутри .ws-sticky-header__parent либо липнущие строки таблицы.
         stickyHeaderManager.checkAllSticky($container.closest('.ws-sticky-header__scrollable-container'));
         stickyHeaderManager._fixGradientTop($container);
         // Скрол контейнер изначально проскролен. Затем часть контента удаляется, получается что контент
         // полностью влазит в скролируемый контейнер. Плучается что scrollTop у контейнера равен0.
         // На всех платформах срабатывает событие scroll, кроме firefox. Для ff обновляем стили на скролируемом контейнере.
         if (cDetection.firefox) {
            updateWrapperScrolledStyle($container);
         }
      },
      // Определяем, какие элементы - фиксированные, а какие - прилипающие.
      // Фиксированные - это те, которые изначально прижаты к верху страницы / FloatArea-и.
      // Прилипающие - те, над которыми есть нефиксированная вёрстка, либо те, которые зафиксированы в пределах родителя и под родителем что-то ещё есть.
      _registerElement: function(jqElem){
         if (!stickyHeaderManager._validateStickyLayout(jqElem)){
            return;
         }
         var positionParams = stickyHeaderManager.__calcPositionParams(jqElem),
            stackHeight = stickyHeaderManager._getStackHeight(jqElem.closest('.ws-sticky-header__scrollable-container')),
            // между элементом и уже зафикс.шапкой что-то есть, либо есть ограничивающий родитель
            // Если масштаб страницы не 100% или установлен увеличиный шрифт в настройках windows в разделе "Удобство чтения с экрана",
            // то рассчет высоты может быть неточным. Делаем допуск в 2 точки.
            isSticky = stackHeight + 2 < positionParams.top + positionParams.scrollTop || positionParams.stickyParent || positionParams.isTableWithStickyRows;
         if (isSticky){
            stickyHeaderManager._registerStickyElement(jqElem, positionParams);
         }
         else {
            stickyHeaderManager._fixElement(jqElem);
         }
         jqElem.addClass('ws-sticky-header__registered');
      },
      _validateStickyLayout: function(jqElem){
         var scrollableContainer = jqElem.closest('.ws-sticky-header__scrollable-container'),
            stickyWrapper = scrollableContainer.parent('.ws-sticky-header__wrapper'),
            headerContainer = stickyWrapper.children('.ws-sticky-header__header-container');
         return scrollableContainer.length && stickyWrapper.length && headerContainer.length;
      },

      _isTableHeader: function (jqElem) {
         return jqElem.is('table') && jqElem.hasClass('ws-sticky-header__table');
      },

      _isTableHeaderHasScroll: function (jqElem) {
         return jqElem.closest('.controls-DataGridView').hasClass('controls-DataGridView__with-partScroll');
      },

      _isTableHeaderPartScrollShown: function (jqElem) {
         return jqElem.closest('.controls-DataGridView').hasClass('controls-DataGridView__PartScroll__shown');
      },

      _registerStickyElement: function(jqElem, positionParams){
         var isTableHeader = stickyHeaderManager._isTableHeader(jqElem),
            isTableHeaderHasScroll = isTableHeader && stickyHeaderManager._isTableHeaderHasScroll(jqElem),
            scrollableContainer = jqElem.closest('.ws-sticky-header__scrollable-container'),
            lastTop = - Infinity,
            pParams, stickyElement;
         var stickyObj = function () {
            return {
               jqElem: jqElem,
               isTableHeader: isTableHeader,
               isTableHeaderHasScroll: isTableHeaderHasScroll,
               isTableWithStickyRows: positionParams.isTableWithStickyRows,
               // Если заголовок находится в самом вверху, то не отклеиваем его, а просто обновлем группировку при смене
               dontUnsticky: !positionParams.stickyParent && positionParams.isTableWithStickyRows && positionParams.top === 0,
               scrollableContainer: scrollableContainer,
               fixedStickyTableRow: $(),
               fixedStickyTableRowDummy: $(),
               stuck: false
            }
         };
         // Если заголовки липнут в рамках одного контенера, и у контейнеров с заголовками меняют видимость, то
         // возможна ситуация, когда заголовок надо вставить в середину списка заголовков.
         // Находим позицию заголовка и вставляем его в этой позиции в список липнущих заголовков.
         if (positionParams.stickyParent && stickyHeadersStack.length) {
            for (var i = 0; i < stickyHeadersStack.length; i++) {
               stickyElement = getStickyContainerFromOrigPlacement(stickyHeadersStack[i]);
               if (!stickyElement.closest('.ws-sticky-header__scrollable-container').length) {
                  continue;
               }
               pParams = stickyHeaderManager.__calcPositionParams(stickyElement);
               // Если заголовок находится ниже предыдущего, но выше текущего, значит его надо вставить между ними
               if (lastTop < positionParams.top && positionParams.top < pParams.top) {
                  break;
               }
               lastTop = pParams.top;
            }
            stickyHeadersStack.splice(i + 1, 0, stickyObj());
            stickyHeaderManager.checkAllSticky(jqElem.closest('.ws-sticky-header__scrollable-container'))
         } else {
            stickyHeadersStack.push(stickyObj());
         }

         jqElem.addClass('ws-sticky-header__sticky');
      },
      _unRegisterStickyElement: function(stickyStackElem){
         stickyStackElem.jqElem.removeClass('ws-sticky-header__sticky ws-sticky-header__registered');
         var indexOfElem = stickyHeadersStack.indexOf(stickyStackElem);
         stickyHeadersStack.splice(indexOfElem, 1);
      },
      // расчёт вспомогательных параметров
      __calcPositionParams: function(jqElem){
         var scrollableContainer = jqElem.closest('.ws-sticky-header__scrollable-container'),
            scrollableAreaTop = scrollableContainer.offset().top,
            stickyParent = jqElem.closest('.ws-sticky-header__parent');
         var retObj = {
            // верхняя позиция элемента относительно верха скроллируемой области (!)
            // дополнеительно учитываем положительный верхний margin. Только положительный, т.к.:
            // - если margin положительный, то фиксируем вместе с margin-ом (считаем margin частью фикс.блока)
            // - если margin отрицательный, то это обычно делается, чтобы прижать блок ближе к другому блоку, в том числе используется для того, чтобы блок фиксировался в шапке
            top: jqElem.offset().top - scrollableAreaTop - Math.max(parseMarginOrPadding(jqElem.css('margin-top')), 0),
            scrollTop: scrollableContainer[0].scrollTop,
            // родитель, в пределах которого фиксируется элемент
            stickyParent: (scrollableContainer.has(stickyParent).length) ? stickyParent : null,
            isTableWithStickyRows: jqElem.hasClass('ws-sticky-header__table-with-sticky-rows'),
            // верхняя позиция скроллиемой области относительно страницы
            scrollableTop: scrollableAreaTop,
            scrollableHeight: scrollableContainer.innerHeight()
         };
         if (retObj.stickyParent){
            // позиция нижнего края родителя относительно скроллируемой области (!)
            retObj.parentBottomEdge = retObj.stickyParent.offset().top + retObj.stickyParent.innerHeight() - scrollableAreaTop;
         }
         return retObj;
      },
      // обход всех прилипающих блоков и вызов проверки их позиции
      checkAllSticky: function(scrollableRegistry){
         var stuckElements = [],
            stuckCandidates = [],
            elem, i;

         for (i = 0; i < stickyHeadersStack.length; i++){
            if (stickyHeadersStack[i].scrollableContainer[0] == scrollableRegistry[0]){
               if (stickyHeadersStack[i].stuck){
                  stuckElements.push([
                     stickyHeadersStack[i],
                     stickyHeaderManager.getDimensions(stickyHeadersStack[i]),
                     stickyHeaderManager._getStackHeight(stickyHeadersStack[i].scrollableContainer,
                        stickyHeadersStack[i].fixedStackElem)
                  ]);
               } else {
                  elem = stickyHeadersStack[i].jqElem;
                  // Для таблиц у которых нет фиксированных строк(гркппировка) видимость проверяем через заголовки.
                  // Заголовки могут быт скрытыми. Если есть фиксируемые строки, то проверяем через саму таблицу.
                  // Строки надо проверять в любом случае.
                  if (stickyHeadersStack[i].isTableHeader && !stickyHeadersStack[i].isTableWithStickyRows) {
                     elem = elem.children('thead');
                  }
                  // Заметил странное поведение в ie. В других браузерах возвращает true.
                  // elem.is(':visible') для пустого thead возвращает false. Может стрельнуть ошибкой..
                  if(elem.is(':visible')) {
                     stuckCandidates.push([
                        stickyHeadersStack[i],
                        stickyHeaderManager.getDimensions(stickyHeadersStack[i])
                     ]);
                  }
               }
            }
         }
         // сначала отклеиваем лишние
         for (i = stuckElements.length - 1; i >= 0; i--) {
            stickyHeaderManager._checkStickyElement(stuckElements[i][0], stuckElements[i][1], stuckElements[i][2]);
         }
         // потом приклеиваем новые.
         // Не фиксируем заголовки если scrollTop < 0. Актуально, например, при срабатывании резинового скрола на ipad.
         if (scrollableRegistry.scrollTop() >= 0) {
            for (i = 0; i < stuckCandidates.length; i++) {
               stickyHeaderManager._checkStickyElement(stuckCandidates[i][0], stuckCandidates[i][1]);
            }
         }
      },

      getDimensions: function(stickyStackElem) {
         var elemToCheckPosition,
            elemToCheckHeaderHeight;

         this._checkTableStickyRow(stickyStackElem);

         // Синхронизируем прилепленные строки таблиц(группировка) перед тем как будем проверять
         // отклеивать ли все заголовки таблицы что бы делать эту проверку по актальному состоянию заголовков.
         if (stickyStackElem.stuck && stickyStackElem.isTableWithStickyRows) {
            this._synchronizeTableStickyRows(stickyStackElem);
         }

         if (stickyStackElem.isTableHeader){
            elemToCheckPosition = stickyStackElem.jqElem.find('thead:first');
            elemToCheckHeaderHeight = elemToCheckPosition;
            // thead в таблице может быть еще не отрисован
            if (!elemToCheckPosition.length) {
               if (stickyStackElem.fixedStickyTableRowDummy && stickyStackElem.fixedStickyTableRowDummy.length) {
                  elemToCheckPosition = stickyStackElem.jqElem;
                  elemToCheckHeaderHeight = stickyStackElem.jqElem;
               } else {
                  return;
               }
            }
         }
         else if (stickyStackElem.stuck){
            // для прилепленного блока надо проверить позицию заглушки, которая осталась после переноса блока в шапку
            elemToCheckPosition = stickyStackElem.fixedStackElem.elemCopy;
            elemToCheckHeaderHeight = stickyStackElem.jqElem;
         }
         else {
            elemToCheckPosition = stickyStackElem.jqElem;
            elemToCheckHeaderHeight = stickyStackElem.jqElem;
         }

         return {
            positionParams: stickyHeaderManager.__calcPositionParams(elemToCheckPosition),
            height: elemToCheckHeaderHeight.outerHeight(),
            scrollHeight: stickyStackElem.scrollableContainer[0].scrollHeight
         };
      },

      // проверка прилипающего блока с его последующим отлеплением / прилеплением к шапке
      _checkStickyElement: function(stickyStackElem, dimensions, stackHeight) {
         /* jshint maxcomplexity:false */
         stackHeight = stackHeight || stickyHeaderManager._getStackHeight(stickyStackElem.scrollableContainer);

         var positionParams = dimensions.positionParams,
            height = dimensions.height,
            topShift;

         // Не отклевиваем и не приклеиваем заголовки на ios в момент резинового оттягивания снизу.
         // Иначе из-за бага описанного ниже наблюдаем мигания заголовка из-за постоянного приклеивания/отклеивания.
         // Если в момент срабатывания резинового скрола где нибудь вставляется или удалется контейнер
         // из дом дерева, то иногда стреляет событие скролирования и scrolltop в этот момент неправильный.
         // Затем событие скролирования стреляет еще раз и в этот момент scrollTop правильный.
         if (cDetection.isMobileIOS &&
             (dimensions.scrollHeight - positionParams.scrollTop - positionParams.scrollableHeight < 0)) {
            return;
         }

         topShift = stickyStackElem.stuck ? stickyStackElem.fixedStackElem.topShift || 0 : 0;
         stackHeight -= topShift;
         // Если таблица содержит фиксируемые строки, то для рассчета высоты зафиксированных заголовков
         // учитываем высоту этих строк.
         if (stickyStackElem.isTableWithStickyRows) {
            height += stickyStackElem.fixedStickyTableRow.outerHeight() || 0;
         }
         // Если есть липнущий заголовок в самом верху страницы, то он сразу приклеивается. Это сделано для оптимизации
         // и исключениятого, что эти заголвки некрасиво уезжают на платформах отличных от chrome,
         // мы их фиксируем сразу же и не отклеиваем пока не появился контенет над ними.
         // Плюс при рассчете положения скролла мы сразу же учитываем эти заголовки и исключаем ситуацию когда
         // когда он залазит на них, потому что заголовки сразу же закреплены.
         // Но на Ipad в этом случае при срабатывании резинового скрола
         // начинается последовательное приклевание/отклеивание на каждом срабатывании onscroll.
         // Почему то после отклеивания срабатывает событие onscroll, а scrollTop на скролируемом
         // контейнере в этот моемет равен 0. На айпаде первый заголовок находящийся в самом верху приклевается
         // когда он пересекает верхнюю границу, на других платформах он приклеивается сразу же.
         if (stickyStackElem.stuck && !stickyStackElem.dontUnsticky && // Если заголовок приклеен
            // и он полностью скрылся за предыдущими заголовками и если это не ios, то еще проверяем что это
            // не первый заголовок находящийся в самом верху скролируемой области.
            ((stackHeight - height <= positionParams.top && (cDetection.isMobileIOS ? true : (stackHeight !== 0 && positionParams.top !== 0))) ||
               // или отклеиваем еще если контейнер находится в ws-sticky-header__block и нижний край
               // ws-sticky-header__block скрылся за предыдущими заголовками или верхней границей скролируемой области.
               (positionParams.stickyParent && stackHeight - height >= positionParams.parentBottomEdge))) {
            // Отклеиваем заголовок
            if (topShift){
               stickyHeaderManager._shiftElem(stickyStackElem.fixedStackElem, 0);
            }
            stickyHeaderManager._unfixTableRow(stickyStackElem);
            stickyHeaderManager._unfixElement(stickyStackElem.fixedStackElem);
            stickyStackElem.stuck = false;
            delete stickyStackElem.fixedStackElem;
         }
         else if (!stickyStackElem.stuck && // Если заголовок отклеен
            (stickyStackElem.dontUnsticky ||
            // и он частично или полностью выплыл за предыдущими заголовками и если это не ios, то еще проверяем что это
            // не первый заголовок находящийся в самом верху скролируемой области.
            ((stackHeight > positionParams.top || (cDetection.isMobileIOS ? false : (stackHeight === 0 && positionParams.top === 0))) &&
               // или приклеевиваем еще заголовки если нижняя граница ws-sticky-header__block выплыла из под верхнего
               // края скрлируемой области и предыдущих заголовков
               (positionParams.stickyParent ? (stackHeight < positionParams.parentBottomEdge) : true)))) {
            var fixedStackElem = stickyHeaderManager._fixElement(stickyStackElem.jqElem);
            stickyStackElem.stuck = true;
            stickyStackElem.fixedStackElem = fixedStackElem;
            stackHeight += height;
            // после того как приклеили заголовки таблицы фиксируем строки таблицы если это нужно
            if (stickyStackElem.isTableWithStickyRows) {
               this._synchronizeTableStickyRows(stickyStackElem);
            }
         }
         // Идея на будущее если она будет актуальной. Сейчас заголовки скрываются последовательно, сначала нижний,
         // как только он скрылся начинает уезжать заголовок который находится выше. Красивее будет если они будут
         // уезжать пачкой, т.е. если они будут двигаться группой и первым будет скрываться самый верхний.
         if (stickyStackElem.stuck && positionParams.stickyParent){
            if (stackHeight > positionParams.parentBottomEdge && stackHeight - height < positionParams.parentBottomEdge){
               topShift = positionParams.parentBottomEdge - stackHeight;
               stickyHeaderManager._shiftElem(stickyStackElem.fixedStackElem, topShift);
            }
            else {
               stickyHeaderManager._shiftElem(stickyStackElem.fixedStackElem, 0);
            }
         }
      },
      // Сдвигаем элемент. Используется в том случае, если от родителя, в котором фиксируется элемент, осталось маньше видимой высоты, чем надо зафиксированному заголовку.
      _shiftElem: function(fixedStackElem, topShift){
         var fixedElemContainer = fixedStackElem.isTableHeader ? fixedStackElem.elemCopy : fixedStackElem.jqElem,
            gradientContainer = fixedStackElem.gradientContainer;
         topShift = topShift || 0;
         fixedStackElem.topShift = topShift;
         fixedElemContainer.toggleClass('ws-sticky-header__shifted', !!topShift).css('margin-top', topShift ? topShift + 'px' : '');
         fixedElemContainer.prev().toggleClass('ws-sticky-header__shifted-under', !!topShift);
         if (gradientContainer) {
            gradientContainer.css('margin-top', topShift ? topShift + 'px' : '');
         }
      },

      _getStackHeight: function(scrollableContainer, fixedElement){
         var wrapper = scrollableContainer.parent('.ws-sticky-header__wrapper'),
            lastElem = (fixedElement && getFixedContainer(fixedElement)) ||
               wrapper.children('.ws-sticky-header__header-container').children(':not(.ws-sticky-header__gradient)').last();
         if (!lastElem.length){
            return 0;
         }
         else {
            return lastElem.offset().top + lastElem.outerHeight() - wrapper.offset().top;
         }
      },
      // для произвольного контейнера возвращаем высоту фикс.шапки страницы / всплывающей панели, в которой он расположен
      getStickyHeaderHeight: function($block){
         var closestScrollable = $block.closest('.ws-sticky-header__scrollable-container');
         if (closestScrollable.length){
            return stickyHeaderManager._getStackHeight(closestScrollable);
         }
         return 0;
      },

      /**
       * Возвращает высоту на которую фиксированные заголовки перекрывают переданный контейнер
       * @param {jQuery} $block jQuery-блок, над которым надо узнать высоту шапки
       */
      getStickyHeaderIntersectionHeight: function ($block) {
         var wrapper = $block.closest('.ws-sticky-header__wrapper'),
            scrollable = $block.closest('.ws-sticky-header__scrollable-container'),
            intersectionHeight;
         if (!scrollable.length) {
            return 0;
         }
         intersectionHeight = this.getStickyHeaderHeight($block) - $block.offset().top + wrapper.offset().top;
         // Если intersectionHeight < 0, то блок не перекрывается заголовками, возвращаем 0.
         return intersectionHeight >= 0 ? intersectionHeight : 0;
      },
      /**
       * Возвращает максимальную высоту фикс.шапки страницы / всплывающей панели в которой он расположен.
       * В контейнере могут находится липнущие блоки. Максимальная высота это высота шапки когда
       * все болки находящиеся в контейнере закреплены. Т.е. это сумма всех помеченных для фиксации блоков
       * в скролируемом контейнере.
       * @param $block произвольный блок находящийся в скролируемом контейнере
       * @returns {Number}
       */
      getStickyHeaderMaxHeight: function($block) {
         var stickyBlocks = $block.closest('.ws-sticky-header__scrollable-container').find('.ws-sticky-header__block-copy, .ws-sticky-header__table>thead, .ws-sticky-header__block'),
            height = 0;
         stickyBlocks.each(function (index, element) {
            height += $(element).outerHeight();
         });
         return height;
      },

      _fixElement: function(jqElem){
         /* jshint maxcomplexity:false */
         var isTableHeader = stickyHeaderManager._isTableHeader(jqElem),
            isTableHeaderHasScroll = isTableHeader && stickyHeaderManager._isTableHeaderHasScroll(jqElem),
            elemInlineStyles = jqElem.attr('style') || '',
            elemClassesArray = (jqElem.attr('class') || '').split(/\s+/),
            filteredElemClassesArray = [],
            top = jqElem.offset().top,
            lastTop = -Infinity,
            insertPosition = 0,
            insertBefore, headerElement, element, input, textLength;

         // в IE 8 нет поддержки Array.filter(), фильтруем перебором
         for (var i = 0; i < elemClassesArray.length - 1; i++){
            var excludeClasses = [
               'ws-sticky-header__block',
               'ws-sticky-header__table',
               'ws-sticky-header__fixed',
               'ws-sticky-header__registered',
               'ws-sticky-header__sticky'
            ];
            if (excludeClasses.indexOf(elemClassesArray[i]) === -1){
               filteredElemClassesArray.push(elemClassesArray[i]);
            }
         }

         var scrollableContainer = jqElem.closest('.ws-sticky-header__scrollable-container'),
            marginLeft = parseMarginOrPadding(jqElem.css('margin-left')),
            leftPosition = jqElem.offset().left - scrollableContainer.offset().left - marginLeft,
            width = stickyHeaderManager._calcWidth(jqElem, leftPosition, scrollableContainer, false, isTableHeaderHasScroll),
            outerWidth = stickyHeaderManager._calcWidth(jqElem, leftPosition, scrollableContainer, true, isTableHeaderHasScroll),
            headerContainer = scrollableContainer.parent('.ws-sticky-header__wrapper').children('.ws-sticky-header__header-container:first'),
            elementToMove = isTableHeader ? jqElem.find('thead:first') : jqElem,
            height = elementToMove.css('box-sizing') === 'border-box' ? elementToMove.outerHeight() : elementToMove.height(),
            focusedElem = elementToMove.find(':focus'),
            elemCopyContainer,
            stickyHeaderContainer,
            stickyHeight;

         if (focusedElem.length){
            // при перемещении в вёрстке фокусного элемента - фокус пропадает, а IE может начать мигать курсором в неожиданном месте и подвиснуть
            // снимаем фокус (переносим на контейнер шапки), а потом вернём обратно
            headerContainer.focus();
         }

         if (isTableHeader){
            var copyHeaderTable = $('<table ' + (elemInlineStyles ? 'style="' + elemInlineStyles + '"' : '') + (filteredElemClassesArray.length ? ' class="' + filteredElemClassesArray.join(' ') + '"' : '') + '></table>'),
               tableParentClass = jqElem.parent().attr('class') || '';
            elemCopyContainer = $('<div class="' + (tableParentClass) + ' ws-sticky-header__table-header-copy"></div>');
            copyHeaderTable.appendTo(elemCopyContainer);
            stickyHeaderManager._changeTableHeaders(jqElem, copyHeaderTable);
            stickyHeaderContainer = elemCopyContainer;
         }
         else {
            var elemPadding = getFullPadding(jqElem),
               elemMargin = jqElem.css('margin'),
               inlineStyleStr = 'height:' + height + 'px;' +
                  (elemPadding ? 'padding:' + elemPadding + ';' : '') +
                  ((elemMargin && elemMargin !== '0px') ? 'margin:' + elemMargin + ';' : '') +
                  elemInlineStyles;
            elemCopyContainer = $('<div style="' + inlineStyleStr + '" class="' + filteredElemClassesArray.join(' ') + ' ws-sticky-header__block-copy"></div>');
            jqElem.before(elemCopyContainer);
            stickyHeaderContainer = jqElem;
         }
         jqElem.addClass('ws-sticky-header__fixed');

         // Если меняют видимость блоков содержащих заголовки, то возможна ситуация когда надо вставить заголовок
         // в середину списка заголовков. Ищим позицию в которую надо его вставить.
         for (insertPosition = 0; insertPosition < fixedHeadersStack.length; insertPosition++) {
            if (!fixedHeadersStack[insertPosition].scrollableContainer.is(scrollableContainer)) {
               continue;
            }
            // Структура объектов о фиксируемых заголовков разная для таблиц и прочих заголовков.
            // Не знаю зачем так сделал Паша. Подобные проверки встречаются в других частях кода.
            // TODO: Надо унифицировать формат и избавится от этих придротов под формат.
            if (fixedHeadersStack[insertPosition].isTableHeader) {
               headerElement = fixedHeadersStack[insertPosition].elemCopy;
               element = fixedHeadersStack[insertPosition].jqElem;
            } else {
               headerElement = fixedHeadersStack[insertPosition].jqElem;
               element = fixedHeadersStack[insertPosition].elemCopy;
            }
            // Если заголовок находится ниже предыдущего, но выше текущего, значит его надо вставить между ними
            if (lastTop < top && top < element.offset().top) {
               insertBefore = headerElement;
               break;
            }
            lastTop = element.offset().top
         }

         // Вставляем заголовок в нужную позицию
         if (insertBefore) {
            insertBefore.before(stickyHeaderContainer);
         } else {
            headerContainer.append(stickyHeaderContainer);
         }

         stickyHeaderContainer.css({
            width: width + 'px',
            'margin-left': (leftPosition + marginLeft) + 'px'
         });

         stickyHeight  = elementToMove.css('box-sizing') === 'border-box' ? elementToMove.outerHeight() : elementToMove.height();

         var stackElem = {
            jqElem: jqElem,
            isTableHeader: isTableHeader,
            isTableHeaderHasScroll: isTableHeaderHasScroll,
            // Контейнер копии элемента. Для блока - заглушка, оставшаяся после перемещения в шапку, для таблиц - блок с копией заголовка таблицы, засунутый в шапку.
            elemCopy: elemCopyContainer,
            width: width,
            height: height,
            // Если мы обнаружили, что высота заголовка изменилась при фиксации(прикладники установили другие размеры
            // у заголовка после фиксации), то высоту заглушки оставляем оригинального размера иначе
            // будут скачки в интерфейсе, но теперь мы не можем синхронизировать высоту заглушки и заголовка,
            // т.к. они изначально разные.
            dontUpdateHeight: !isTableHeader && stickyHeight !== height,
            leftPosition: leftPosition,
            marginLeft: marginLeft,
            scrollableContainer: scrollableContainer
         };

         if (hasGradient){
            var gradientContainer = $('<div class="ws-sticky-header__gradient"></div>');
            gradientContainer.css({
               top: stickyHeaderManager._calcGradientTop(stackElem, scrollableContainer) + 'px',
               left: leftPosition + 'px',
               width: outerWidth + 'px',
               display: stackElem.height ? '' : 'none'
            });
            headerContainer.append(gradientContainer);
            stackElem.gradientContainer = gradientContainer;
         }

         // после перемещения по append сбивается фокус, возвращаем его обратно ( https://inside.tensor.ru/opendoc.html?guid=6bbd32d6-276b-472c-8066-9eb77b7bc2c4 )
         if (focusedElem && focusedElem.length === 1){
            focusedElem.focus();
            // Если фокус был на поле ввода, то получаем выделенный текст в этом поле ввода. Если пользователь
            // вводил текст в этот момент, то он стирает то что ввел до этого. Принудительно устанавливаем курсорсор
            // в конец текста.
            if (focusedElem.is('input') && focusedElem.attr('type') === 'text') {
               input = focusedElem[0];
               textLength = input.value.length;
               input.setSelectionRange(textLength, textLength);
            }
         }

         fixedHeadersStack.splice(insertPosition + 1, 0, stackElem);
         notifyOnStickyChanged();
         return stackElem;
      },
      // Меняем заголовки у таблиц.
      // thead перемещается во вторую таблицу, оставляя от себя копию в первой
      // colgroup остаётся в первой, но делает свою копию во второй
      _changeTableHeaders: function(origTable, copyTable){
         stickyHeaderManager._synchronizeCollGroup(origTable, copyTable);
         stickyHeaderManager._changeTableThead(origTable, copyTable);
         stickyHeaderManager._synchronizeTableHeaderRows(origTable, copyTable);
         stickyHeaderManager._updateTableHeaderColumnWidth(origTable, copyTable);
      },

      _synchronizeCollGroup: function(origTable, copyTable){
         var colGroup = origTable.find('>colgroup:first');
         copyTable.find('>colgroup').remove();
         if (colGroup.length === 1) {
            colGroup.clone().prependTo(copyTable);
         }
      },

      _changeTableThead: function (origTable, copyTable) {
         var tableHeader = origTable.find('thead:first'),
            headerCopy;
         // В оригинальной таблице заголовков может не быть, и они могут быть отрисованы позже
         if (tableHeader.length) {
            headerCopy = stickyHeaderManager._createDummyThead(tableHeader);
            copyTable.append(tableHeader);
            origTable.find('tbody:first').before(headerCopy);
         }
      },

      _createDummyThead: function (tableHeader) {
         return $('<thead class="' + (tableHeader.attr('class') || '') + ' ws-sticky-header__thead-copy" style="visibility:hidden"></thead>');
      },

      synchronizeTableHeaderColumnWidth: function ($element) {
         var stackElem = stickyHeaderManager._getStackElementByJQ($element);
         if (stackElem) {
            stickyHeaderManager._updateTableHeaderColumnWidth(stackElem.jqElem, stackElem.elemCopy.children('table'));
         }
      },

      _synchronizeTableHeaderRows: function (origTable, copyTable) {
         var copyTableColunms, theadCopy, width;
         // Создаем копию заголовков что бы потом вставить в оригинальную таблицу
         // Всегда используем копию заголовков, а не пустой контейнер заглушку
         // т.к. это позволяет избежать следующих ошибок
         // 1. В ie если запросить высоту синхронно сразу же после изменения верстки, то можем получить
         // старые значения, что приводит к ошибкам рассчета размеров заглушки.
         // 2. На webkit если высота контейнера задана в rem и мы ее получаем в js и потом устанавливаем
         // на другой контейнер, то размер этих контейнеров в инспекторе показывается одинаковыми, но по факту
         // их высоты могут отличаться.
         theadCopy = copyTable.find('thead').clone();
         // Удаляем атрибуты id и прочие атрибуты которые используются платформой для построения компонентов
         // со всех контейнеров в копии заголовков. id не должны дублироваться. После шаблонизации и до поднятия
         // компонентов на них нет атрибута id, ищем и подчищаем компоненты по атрибуту data-component.
         theadCopy.find('[id], [data-component]').removeAttr('id data-component sbisname name config hasmarkup wasbuildmarkup hidefocus tabindex');
         // Делаем копию заголовков невидимой, иначе иногда ее будет видно, например при резиновом скроле на ipad.
         theadCopy.css('visibility', 'hidden');
         // Удаляем ширины строк в зафиксированном заголовке которые мы установили при предыдущей синхронизации.
         theadCopy.find('>tr>th,>tr>td').css({'min-width': '', 'max-width': ''});
         // Удаляем старую копию заголовков и вставляем новую.
         origTable.find('thead').remove();
         theadCopy.insertAfter(origTable.find('colgroup'));
      },

      /**
       * Переносит ширину столбцов из оригинальной таблицы на таблицу с заголовками.
       * @param origTable
       * @param copyTable
       * @private
       */
      _updateTableHeaderColumnWidth: function (origTable, copyTable) {
         var headerRowSelector = '>thead>tr.controls-DataGridView__headerRow, >thead>tr.controls-DataGridView__results',
            copyTableHeaders = copyTable.find(headerRowSelector),
            copyTableHeadersCount = copyTableHeaders.length,
            copyTableColumns, width;

         origTable.find(headerRowSelector).each(function (trInd, trElem) {
            copyTableColumns = copyTableHeaders.eq(trInd).children('td,th');
            $(trElem).children('td,th').each(function (ind, elem) {
               /*
                * В Chrome если стоит масштаб отличный от 100% и задан colspan, то сумма ширин вложенных столбцов
                * может несовпасть с шириной ячейки с colspan. В этом случае браузер ведет себя очень странно.
                * При заданной ширине в 60 пикселей настоящая ширина ячейки может оказаться в разы больше.
                * Не проставляем ширину если есть еще строки в заголовках на которых будет установлена ширина.
                * В IE это решение приводит к странным последствиям. Такое впечатление, что если есть colspan,
                * то ширина устанавливается с учетом падингов и бордеров, а если его нет, то без учета.
                * В других браузерах все работает одинакого если включить или выключить эту фичу.
                * Включаем ее только в хроме.
                **/
               if (cDetection.chrome && $(elem).attr('colspan') && copyTableHeadersCount > trInd + 1) {
                  return;
               }
               width = getComputedStyle(elem, null).width;

               /*
                * TODO https://online.sbis.ru/opendoc.html?guid=ac01bbb3-c4b0-4b24-afd3-1ece296da789
                * Очень странный баг, проявляется только у одного клиента.
                * В колонку вставлен символ пробела, который по непонятным причинам имеет ОТРИЦАТЕЛЬНУЮ ширину.
                * После установки отрицательного значения в min-width и max-width, колонка в fakeHeader растягивается и таблица едет.
                * Хром свежий, шрифты TensorFont с CDN.
                * */
               if (width.indexOf('-') !== -1) {
                  width='0px';
               }

               copyTableColumns.eq(ind).css({'min-width': width, 'max-width': width});
            });
         });
      },

      _synchronizeTableCssClasses: function (fixedStackElem) {
         var elem = getFixedContainer(fixedStackElem),
            dummyElem = getFixedDummyContainer(fixedStackElem);

         elem.attr('class', dummyElem.parent().attr('class') + ' ws-sticky-header__table-header-copy');
      },

      _synchronizeTableStickyRows: function (stickyStackElem) {
         var origTable = getFixedDummyContainer(stickyStackElem.fixedStackElem),
            copyTable = getFixedContainer(stickyStackElem.fixedStackElem),
            stickyRows = origTable.find('.ws-sticky-header__table-sticky-row'),
            lastInvisibleElement = $(), firstVisibleElement = $(),
            stackHeight, lastIndex, pParams, elemCopyContainer, dummyTR;

         // var fixTopShift = function () {
         //    if (lastInvisibleElement[0] !== firstVisibleElement[0] && stackHeight + lastInvisibleElement.outerHeight() > pParams.top) {
         //       stickyHeaderManager._shiftTableStickyRowElem(stickyStackElem, pParams.top - (stackHeight + lastInvisibleElement.outerHeight()));
         //    } else {
         //       stickyHeaderManager._shiftTableStickyRowElem(stickyStackElem, 0);
         //    }
         // };
         // Если таблицу перерисовали, и элемент был удален из таблицы, то убираем его из заголовка
         if (stickyStackElem.fixedStickyTableRowDummy.length && !stickyStackElem.fixedStickyTableRowDummy.parent().length) {
            this._unfixTableRow(stickyStackElem);
         }

         if(!stickyRows.length) {
            return;
         }

         stackHeight = stickyHeaderManager._getStackHeight(stickyStackElem.scrollableContainer);
         if (stickyStackElem.fixedStickyTableRow.length) {
            stackHeight -= stickyStackElem.fixedStickyTableRow.outerHeight(); // topShift
         }

         stickyRows.each(function (index, element) {
            lastIndex = index;
            firstVisibleElement = $(element);
            pParams = stickyHeaderManager.__calcPositionParams(firstVisibleElement);
            if (stackHeight < pParams.top) {
               return false;
            }
            lastInvisibleElement = firstVisibleElement;
         }.bind(this));

         if (stickyStackElem.fixedStickyTableRow[0] === lastInvisibleElement[0] || lastInvisibleElement.hasClass('ws-sticky-header__tr-copy')) {
            return;
         }

         // Если первую групперовку оттянули вниз на айпаде, то не все равно не отклеиваем ее если таблица изначально
         // располагалась в самомо верху скролируемой области.
         if(cDetection.isMobileIOS && !lastInvisibleElement.length && stickyStackElem.dontUnsticky) {
            return;
         }

         // if (lastInvisibleElement.hasClass('ws-sticky-header__tr-copy')) {
         //    fixTopShift();
         // } else {
         this._unfixTableRow(stickyStackElem);
         if (lastInvisibleElement) {
            stickyStackElem.fixedStickyTableRow = lastInvisibleElement;
            dummyTR = lastInvisibleElement.clone().addClass('ws-sticky-header__tr-copy');
            dummyTR.insertAfter(lastInvisibleElement);
            stickyStackElem.fixedStickyTableRowDummy = dummyTR;
            lastInvisibleElement.remove();
            elemCopyContainer = $('<tbody></tbody>');
            elemCopyContainer.append(lastInvisibleElement);
            copyTable.children('table').append(elemCopyContainer);
            // fixTopShift();
         }
         // }
         stickyStackElem.fixedStackElem.height = copyTable.outerHeight() - (stickyStackElem.topShift || 0);
         // stickyStackElem.fixedStackElem.height = stickyStackElem.topShift ? 0 : copyTable.outerHeight();
         stickyHeaderManager._fixGradientTop(stickyStackElem.scrollableContainer);
      },

      // _shiftTableStickyRowElem: debounce(function(stickyStackElem, topShift){
      //    var fixedElemContainer = stickyStackElem.fixedStickyTableRow.children('td'),
      //       copyTable = getFixedContainer(stickyStackElem.fixedStackElem),
      //       gradientContainer = stickyStackElem.fixedStackElem.gradientContainer,
      //       topShiftStr;
      //    topShift = topShift || 0;
      //    topShiftStr = topShift ? topShift + 'px' : '';
      //    stickyStackElem.topShift = topShift;
      //    fixedElemContainer.toggleClass('ws-sticky-header__shifted', !!topShift);
      //    if (topShift) {
      //       copyTable.addClass('ws-sticky-header__shifted');
      //       fixedElemContainer.css({position: 'relative', top: topShiftStr, 'z-index': -1});
      //    } else {
      //       copyTable.removeClass('ws-sticky-header__shifted');
      //       fixedElemContainer.css({position: '', top: '', 'z-index': ''});
      //    }
      //
      //    if (gradientContainer) {
      //       gradientContainer.css({
      //          // 'margin-top': topShift ? topShift + 'px' : '',
      //          'margin-top': topShift ? -fixedElemContainer.outerHeight() + 'px' : '',
      //          'z-index': topShift ? 3 : ''
      //       });
      //    }
      // }, 50),

      _unfixTableRow: function (stickyStackElem) {
         var rowCopy;
         if (stickyStackElem.fixedStickyTableRow.length) {
            rowCopy = getFixedDummyContainer(stickyStackElem.fixedStackElem).find('.ws-sticky-header__tr-copy');
            getFixedContainer(stickyStackElem.fixedStackElem).find('>table>tbody').remove();
            // stickyHeaderManager._shiftTableStickyRowElem(stickyStackElem, 0);
            stickyStackElem.fixedStickyTableRow.insertAfter(rowCopy);
            rowCopy.remove();
            stickyStackElem.fixedStickyTableRow = $();
            stickyStackElem.fixedStickyTableRowDummy = $();
         }
      },

      _checkTableStickyRow: function (stackElem) {
         // Проверяем если строку удалили из верстки, то удаляем копию и обновляем stackElem
         if (stackElem.fixedStickyTableRowDummy.length && !jQuery.contains(document.documentElement, stackElem.fixedStickyTableRowDummy[0])) {
            stackElem.fixedStickyTableRowDummy = $();
            stackElem.fixedStickyTableRow.remove();
            stackElem.fixedStickyTableRow = $();
         }
      },

      _unfixElement: function(fixedStackElem){
         var stackIndex = fixedHeadersStack.indexOf(fixedStackElem);
         if (stackIndex === -1){
            throw new Error('Lib/StickyHeader/StickyHeaderManager/StickyHeaderManager - trying to unfix unknown element.');
         }
         fixedHeadersStack.splice(stackIndex, 1);
         var jqElem = fixedStackElem.jqElem,
            elemCopyContainer = fixedStackElem.elemCopy,
            elementToMove = fixedStackElem.isTableHeader ? elemCopyContainer.find('thead:first') : jqElem,
            focusedElem = elementToMove.find(':focus'),
            scrollTop;

         if (focusedElem.length){
            // сохранием и затем вновь востанавливаем положение прокрутки, т.к. при перемещении фокуса браузер
            // прокручивает контейнер что бы элемент с фокусом был виден.
            scrollTop = fixedStackElem.scrollableContainer.scrollTop();
            // при перемещении в вёрстке фокусного элемента - фокус пропадает, а IE может начать мигать курсором в неожиданном месте и подвиснуть
            // снимаем фокус (переносим на контейнер шапки), а потом вернём обратно
            var headerContainer = elementToMove.closest('.ws-sticky-header__header-container');
            headerContainer.focus();
         }

         if (fixedStackElem.isTableHeader){
            jqElem.find('thead:first').remove();
            jqElem.find('tbody:first').before(elementToMove);
            elementToMove.find('th,td').css({
               minWidth: '',
               maxWidth: ''
            });
         }
         else {
            elemCopyContainer.before(elementToMove);
            elementToMove.css({
               height: '',
               width: '',
               'margin-left': ''
            });
         }
         jqElem.removeClass('ws-sticky-header__fixed');
         if (!jqElem.hasClass('ws-sticky-header__sticky')){ // с не-прилипающих снимаем класс регитрации, вдруг их кто-то захочет потом обратно зафиксировать
            jqElem.removeClass('ws-sticky-header__registered');
         }
         elemCopyContainer.remove();
         if (fixedStackElem.gradientContainer){
            fixedStackElem.gradientContainer.remove();
         }

         if (focusedElem.length){
            // возвращаем фокус на элемент, на котором он был до переноса элемента в вёрстке
            focusedElem.focus();
            fixedStackElem.scrollableContainer.scrollTop(scrollTop);
         }
         notifyOnStickyChanged();
      },
      // собирает элементы стека для всех фиксированных блоков внутри переданного блока
      _findElementsInContainer: function(jqElem, isIncludeSticky){
         var selector = '.ws-sticky-header__block-copy, .ws-sticky-header__table.ws-sticky-header__fixed',
            innerFixedElements = jqElem.find(selector).addBack(selector),
            fixedArr = [],
            j, k, elemToCompare;
         for (j = 0; j < innerFixedElements.length; j++){
            for (k = 0; k < fixedHeadersStack.length; k++){
               elemToCompare = fixedHeadersStack[k].isTableHeader ? fixedHeadersStack[k].jqElem : fixedHeadersStack[k].elemCopy;
               if (elemToCompare[0] === innerFixedElements[j]){
                  fixedArr.push(fixedHeadersStack[k]);
                  break;
               }
            }
         }
         var retObj = {
            fixed: fixedArr
         };
         // дополнительно собираем элемента стека липнущих элементов
         if (isIncludeSticky){
            var stickySelector = '.ws-sticky-header__sticky.ws-sticky-header__registered, .ws-sticky-header__block-copy',
               innerStickyElements = jqElem.find(stickySelector).addBack(stickySelector),
               stickyArr = [];
            for (j = 0; j < innerStickyElements.length; j++){
               var isCopy = $(innerStickyElements[j]).hasClass('ws-sticky-header__block-copy');
               for (k = 0; k < stickyHeadersStack.length; k++){
                  elemToCompare = !isCopy ? stickyHeadersStack[k].jqElem : (stickyHeadersStack[k].stuck ? stickyHeadersStack[k].fixedStackElem.elemCopy : null);
                  if (elemToCompare && elemToCompare[0] === innerStickyElements[j]){
                     stickyArr.push(stickyHeadersStack[k]);
                     break;
                  }
               }
            }
            retObj.sticky = stickyArr;
         }
         return retObj;
      },
      // Проверяем и правим положение и ширину фикс.элементов. Может понадобиться в случае изменения соседней вёрстки.
      // Также правим высоту заглушки если поменялась высота у фикс. элемента.
      // Обновляем прилипшие заголовки т.к. размеры элементов верстки поменялись.
      checkStickyHeaderSize: function(jqElem){
         var checkStackElements = jqElem ? stickyHeaderManager._findElementsInContainer(jqElem).fixed : fixedHeadersStack,
            origTable, copyTable, newHeight;
         for (var i = 0, l = checkStackElements.length; i < l; i++){
            var stackElem = checkStackElements[i],
               dummyElem = stackElem.isTableHeader ? stackElem.jqElem : stackElem.elemCopy,
               fixedElemContainer = stackElem.isTableHeader ? stackElem.elemCopy : stackElem.jqElem,
               leftPosition = dummyElem.offset().left - stackElem.scrollableContainer.offset().left - parseMarginOrPadding(dummyElem.css('margin-left')),
               newWidth = stickyHeaderManager._calcWidth(dummyElem, leftPosition, stackElem.scrollableContainer, false, stackElem.isTableHeaderHasScroll);

            if (newWidth !== stackElem.width){
               stackElem.width = newWidth;
               fixedElemContainer.css('width', newWidth + 'px');
               if (stackElem.gradientContainer) {
                  var outerWidth = stickyHeaderManager._calcWidth(dummyElem, stackElem.leftPosition, stackElem.scrollableContainer, true, stackElem.isTableHeaderHasScroll);
                  stackElem.gradientContainer.css('width', outerWidth + 'px');
               }
            }

            if (stackElem.leftPosition !== leftPosition){
               stackElem.leftPosition = leftPosition;
               fixedElemContainer.css('margin-left', (leftPosition + stackElem.marginLeft) + 'px');
               if (stackElem.gradientContainer) {
                  stackElem.gradientContainer.css('left', leftPosition + 'px');
               }
            }

            newHeight = fixedElemContainer.height();

            if (stackElem.isTableHeader) {
               origTable = stackElem.jqElem;
               copyTable = stackElem.elemCopy.children('table');
            }

            if (stackElem.height !== newHeight) {
               if (!stackElem.dontUpdateHeight) {
                  stackElem.height = newHeight;
                  if (stackElem.isTableHeader) {
                     // Синхронизируем только контент заголовков таблицы. Ширина строк будет синхронизирована ниже
                     // независимо от того обновился ли контент в заголовкоах т.к. onResize могли позвать из-за
                     // изменеия ширины таблицы.
                     stickyHeaderManager._synchronizeTableHeaderRows(origTable, copyTable);
                  } else {
                     dummyElem.css('height', newHeight + 'px');
                  }
               }
               if (stackElem.gradientContainer) {
                  stickyHeaderManager._fixGradientTop(stackElem.scrollableContainer);
               }
            }
            // Если заголовок принадлежит таблице, то надо синхронизировать ширину столбцов
            if (stackElem.isTableHeader) {
               stickyHeaderManager._synchronizeTableCssClasses(stackElem);
               stickyHeaderManager._synchronizeCollGroup(origTable, copyTable);
               stickyHeaderManager._updateTableHeaderColumnWidth(origTable, copyTable);
            }
         }
         // Если jqElem не задан, то не пересчитываем закрепленность прилипающих блоков.
         // На данный момент такой вызов есть только при ресайзе и проверять закрепленность не надо.
         jqElem && stickyHeaderManager.checkAllSticky(jqElem.closest('.ws-sticky-header__scrollable-container'));
      },

      // после изменения высоты элемента фикс.заголовка надо править положение градиентов
      _fixGradientTop: function(scrollableContainer){
         for (var i = 0, l = fixedHeadersStack.length; i < l; i++){
            if (fixedHeadersStack[i].scrollableContainer[0] == scrollableContainer[0]){
               var stackElem = fixedHeadersStack[i];
               stackElem.gradientContainer.css({
                  top: stickyHeaderManager._calcGradientTop(stackElem, scrollableContainer) + 'px',
                  display: stackElem.height ? '' : 'none'
               });
            }
         }
      },
      _calcGradientTop: function(stackElem, scrollableContainer){
         var positionElem = stackElem.isTableHeader ? stackElem.elemCopy : stackElem.jqElem,
            topPos = positionElem.offset().top - scrollableContainer.offset().top,
            outerHeight = positionElem.outerHeight();
         if (stackElem.isTableHeader) {
            if (outerHeight === 0) {
               // FixMe: Если у контейнера стоит стиль height:100% и внутри таблица с ненулевой высотой, то у самого контейнера почему-то высота 0
               outerHeight = positionElem.children('table:first').outerHeight() || 0;
            }
            if (stackElem.isTableHeaderHasScroll && this._isTableHeaderPartScrollShown(positionElem)) {
               outerHeight -= 7;
            }
         }
         return topPos + outerHeight - 1;
      },
      _calcWidth: function(jqElem, leftPosition, scrollableContainer, isOuter, isTableHeaderHasScroll){
         // В случае включенного скрола в заголовках таблиц или в ie10 ширина таблицы полученная напрямую из table
         // может быть неправильной. Для SBIS.Controls.DataGridView используем контейнер в котором лежит table.
         // IE10: странный баг проявляющийся только если на таблице навешен position: relative; width: 100%
         // и заданы ширины столбцов через colgroup. Ширина отрендеренной таблицы получается исходя из width: 100%,
         // а ширина которую мы получаем в js равна сумме ширин заданных в colgroup.
         // TODO: Зависимость от SBIS.Controls. Подумать как избавится от нее.
         var dgv = jqElem.closest('.controls-DataGridView');
         if (dgv.length && (isTableHeaderHasScroll || cConstants.browser.isIE10)) {
            jqElem = dgv;
         }
         var width = isOuter ? jqElem.outerWidth(true) : jqElem.width();
         if (scrollableContainer && scrollableContainer.length === 1){
            if (width + leftPosition > scrollableContainer.innerWidth()){
               width = scrollableContainer[0].clientWidth - leftPosition;
            }
         }
         return width;
      },

      // при изменении заголовка табличных представлений надо синхронизировать заголовок в шапке и заглушку заголовка в таблице
      tableHeadRedrawn: function($table){
         var stackElem = stickyHeaderManager._getStackElementByJQ($table);
         if (stackElem) {
            if (!stackElem.elemCopy.find('thead').length) {
               stickyHeaderManager._changeTableThead(stackElem.jqElem, stackElem.elemCopy.find('table'));
            }
            stickyHeaderManager._tableHeadRedrawn(stackElem);
         }
      },
      // надо актуализировать colgroup, высота заглушки вроде должна сама синхронизироваться от resize-а
      _tableHeadRedrawn: function(stackElem){
         var tableCopy = stackElem.elemCopy.children('table'),
            copyColGroup = tableCopy.find('colgroup:first');
         if (copyColGroup.length === 1) {
            var colGroup = stackElem.jqElem.find('colgroup:first');
            copyColGroup.replaceWith(colGroup.clone());
            stickyHeaderManager._synchronizeTableHeaderRows(stackElem.jqElem, tableCopy);
            stickyHeaderManager._updateTableHeaderColumnWidth(stackElem.jqElem, tableCopy);
         }
      },
      updateTableHeaderVisibility: function ($element) {
         var stackElem = stickyHeaderManager._getStackElementByJQ($element);
         if (stackElem) {
            stackElem.jqElem.find('thead').toggleClass('ws-hidden', stackElem.elemCopy.find('thead').hasClass('ws-hidden'));
         }
      },
      _getStackElementByJQ: function ($element) {
         for (var i = 0, l = fixedHeadersStack.length; i < l; i++) {
            if (fixedHeadersStack[i].isTableHeader && fixedHeadersStack[i].jqElem[0] === $element[0]) {
               return fixedHeadersStack[i];
            }
         }
      },
      unfixAllChildren: function($block, isOnDestroy){
         var innerScrollableContainers = $block.find('.ws-sticky-header__scrollable-container');
         if (innerScrollableContainers && innerScrollableContainers.length){
            for (var i = innerScrollableContainers.length - 1; i >= 0; i--){
               stickyHeaderManager._unfixAllInArea($(innerScrollableContainers[i]), isOnDestroy);
            }
         }
         if ($block.hasClass('ws-sticky-header__scrollable-container')){
            stickyHeaderManager._unfixAllInArea($block, isOnDestroy);
         }
         else {
            var filteredElements = stickyHeaderManager._findElementsInContainer($block, isOnDestroy);
            for (var j = filteredElements.fixed.length - 1; j >= 0; j--){
               stickyHeaderManager._unfixElement(filteredElements.fixed[j]);
            }
            // для уничтоженной вёрстки надо найти все липнущие блоки и удалить из стека, чтобы при скроллинге они не пересчитывались
            if (isOnDestroy){
               for (var k = filteredElements.sticky.length - 1; k >= 0; k--){
                  stickyHeaderManager._unRegisterStickyElement(filteredElements.sticky[k]);
               }
            }
            stickyHeaderManager._fixGradientTop($block.closest('.ws-sticky-header__scrollable-container'));
         }
      },
      _unfixAllInArea: function(scrollableContainer, isOnDestroy){
         if (!scrollableContainer || scrollableContainer.length !== 1){
            return;
         }
         for (var i = fixedHeadersStack.length - 1; i >= 0; i--){
            if (fixedHeadersStack[i].scrollableContainer[0] == scrollableContainer[0]){
               stickyHeaderManager._unfixElement(fixedHeadersStack[i]);
            }
         }
         // для уничтоженной вёрстки надо найти все липнущие блоки и удалить из стека, чтобы при скроллинге они не пересчитывались
         if (isOnDestroy){
            for (var j = stickyHeadersStack.length - 1; j >= 0; j--){
               if (stickyHeadersStack[j].scrollableContainer[0] == scrollableContainer[0]){
                  stickyHeaderManager._unRegisterStickyElement(stickyHeadersStack[j]);
               }
            }
         }
         stickyHeaderManager._unSubscribeWrapper(scrollableContainer.parent('.ws-sticky-header__wrapper'));
      },
      unfixOne: function($elem, isOnDestroy){
         for (var i = fixedHeadersStack.length - 1; i >= 0; i--){
            if (fixedHeadersStack[i].jqElem[0] == $elem[0]){
               stickyHeaderManager._unfixElement(fixedHeadersStack[i]);
               break;
            }
         }
         // для уничтоженной вёрстки надо удалить из стека липнущих, чтобы при скроллинге он не пересчитывался
         if (isOnDestroy){
            for (var j = stickyHeadersStack.length - 1; j >= 0; j--){
               if (stickyHeadersStack[j].jqElem[0] == $elem[0]){
                  stickyHeaderManager._unRegisterStickyElement(stickyHeadersStack[j]);
                  break;
               }
            }
         }
         stickyHeaderManager._fixGradientTop($elem.closest('.ws-sticky-header__scrollable-container'));
      }
   };

   return {
      /**
       * Инициализация фиксации шапки. Ищет блоки со скроллом и фиксированной шапкой, фиксирует шапку.
       * При наличии прилипающих блоков подписывается на scroll и занимается прилипанием / отлипанием липнущих блоков.
       * @param {jQuery} [$block] - jQuery-элемент с блоком, внутри которого нужно зафиксировать шапку.
       * @noShow
       */
      fixAllChildren: stickyHeaderManager.fixAllChildren,
      /**
       * Сбрасывает фиксацию для всех элементов внутри переданного.
       * Метод следует использовать при destroy-е блока, содержащего элементы, зафиксированные в шапке.
       * @param {jQuery} $block - jQuery-элемент с блоком, внутри которого содержатся зафиксированные элементы, которые надо расфиксировать
       * @noShow
       */
      unfixAllChildren: stickyHeaderManager.unfixAllChildren,
      /**
       * Сброс фиксации одного конкретного блока.
       * @param {jQuery} $elem - jQuery-элемент из фиксированной шапки, который надо расфиксировать.
       * @param {Boolean} isOnDestroy - признак что расфиксация произошла из-за уничтожения контрола, в котором лежал блок.
       * @noShow
       */
      unfixOne: stickyHeaderManager.unfixOne,
      /**
       * Проверка и, при необходимости, изменение позиции и размера фиксированной шапки.
       * Может понадобиться при изменениях соседней с шапкой вёрстки.
       * @noShow
       */
      checkStickyHeaderSize: stickyHeaderManager.checkStickyHeaderSize,
      /**
       * Метод получения высоты фикс.шапки над произвольным блоком.
       * @param {jQuery} - jQuery-блок, над которым надо узнать высоту шапки
       */
      getStickyHeaderHeight: stickyHeaderManager.getStickyHeaderHeight,
      /**
       * Возвращает высоту на сколько фиксированные заголовки перекрывают переданный контейнер
       * @param {jQuery} - jQuery-блок, над которым надо узнать высоту шапки
       */
      getStickyHeaderIntersectionHeight: stickyHeaderManager.getStickyHeaderIntersectionHeight,
      /**
       * Возвращает максимальную высоту фикс.шапки страницы / всплывающей панели в которой он расположен.
       * В контейнере могут находится липнущие блоки. Максимальная высота это высота шапки когда
       * все болки находящиеся в контейнере закреплены. Т.е. это сумма всех помеченных для фиксации блоков
       * в скролируемом контейнере.
       * @param $block произвольный блок находящийся в скролируемом контейнере
       * @returns {Number}
       */
      getStickyHeaderMaxHeight: stickyHeaderManager.getStickyHeaderMaxHeight,
      /**
       * Перерисовывает заголовок таблицы (он мог поменяться - могло поменяться число столбцов или их ширина).
       * @param {jQuery} $table - jQuery-элемент с таблицей, чей заголовок нужно перерисовать
       * @noShow
       */
      tableHeadRedrawn: stickyHeaderManager.tableHeadRedrawn,
      /**
       * Обновляет видимость заголовка
       * @param {jQuery} $table - jQuery-элемент с таблицей, чей заголовок нужно перерисовать
       * @noShow
       */
      updateTableHeaderVisibility: stickyHeaderManager.updateTableHeaderVisibility,
      /**
       * Обновляет ширину колонок в заголовке таблицы
       * @param {jQuery} $table - jQuery-элемент с таблицей, чей заголовок нужно перерисовать
       * @noShow
       */
      synchronizeTableHeaderColumnWidth: stickyHeaderManager.synchronizeTableHeaderColumnWidth
   };
});