define('Core/helpers/Hcontrol/doAutofocus', [
   'Core/IoC',
   'Core/helpers/Hcontrol/isElementVisible'
], function (
   IoC,
   isElementVisible
) {
   /**
    * Модуль, в котором описана функция <b>doAutofocus(findContainer)</b>.
    *
    * Инициирование автофокуса. Активность будет проставлен для AreaAbstract, контейнер которой содержит класс ws-autofocus
    * Если ws-autofocus будет не найден, берется контейнер, передаваемый в функцию аргументом
    * Внутри области поищется первый доступный для установки активности компонент функцией onBringToFront
    *
    * @class Core/helpers/Hcontrol/doAutofocus
    * @public
    * @author Шипин А.А.
    */

   var findAutofocus = function(findContainer) {
         // ищет элемент, на котором висит ws-autofocus и элемент видим
         function find(container, selector) {
            var found;
            if (container.is(selector) && isElementVisible(container)) {
               found = container;
            } else {
               found = container.find(selector).filter(function(index, elem) {
                  return isElementVisible(elem);
               });
            }
            return found;
         }

         findContainer = $(findContainer);

         var mainContainer;
         mainContainer = find(findContainer, '.ws-autofocus');
         if (mainContainer.length) {
            if (mainContainer.length > 1) {
               IoC.resolve('ILogger').info('doAutofocus', 'Внимание, потенциальная ошибка! В процессе автофокусировки было найдено несколько элементов с классом ws-autofocus');
            }
         } else {
            // todo удалить, когда все перейдут на ws-autofocus
            mainContainer = find(findContainer, '.ws-bootup-autofocus');
            if (mainContainer.length) {
               IoC.resolve('ILogger').info('doAutofocus', 'Пожалуйста замените класс ws-bootup-autofocus на класс ws-autofocus');
            }
            if (mainContainer.length > 1) {
               IoC.resolve('ILogger').info('doAutofocus', 'Внимание, потенциальная ошибка! В процессе автофокусировки было найдено несколько элементов с классом ws-bootup-autofocus');
            }
         }
         return mainContainer;
      },
      findAutofocusForVDOM = function (findContainer) {
         return findContainer.querySelectorAll('[ws-autofocus="true"]');
      },

      doAutofocus = function(findContainer) {
         findContainer = $(findContainer);

         // ищем элемент с классом ws-autofocus
         var mainContainer = findAutofocus(findContainer);

         // если не нашли ws-autofocus, находим первый компонент и ставим активность ему.
         if (!mainContainer.length) {
            mainContainer = $(findContainer);
         } else if (!mainContainer[0].wsControl) {
            // если ws-autofocus висит на элементе, на котором не висит компонент
            mainContainer = $(findContainer);
         } else if (!mainContainer[0].wsControl.canAcceptFocus()) {
            // если нашли компонент с ws-autofocus, который не может получить активность, попробуем взять findContainer
            mainContainer = $(findContainer);
         }

         var mainContainerElem = mainContainer[0];
         // если нашли элемент AreaAbstract, который может принять на себя активность, отдаем активность ему
         if (mainContainerElem && mainContainerElem.wsControl && mainContainerElem.wsControl.setActive) {
            if (mainContainerElem.wsControl.activateFirstControl) {
               // пока так, если это область то фокусируем ее первый компонент, если позвать setActive, он стрельнет
               // onActivate для парента и все сломает, окно откроется и сразу закроется
               mainContainerElem.wsControl.activateFirstControl();
            } else {
               mainContainerElem.wsControl.setActive(true);
            }
            return true;
         }
      };

   doAutofocus.findAutofocus = findAutofocus;
   doAutofocus.findAutofocusForVDOM = findAutofocusForVDOM;

   return doAutofocus;
});