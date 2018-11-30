define('Controls/Button/Classes', ['Core/IoC'], function(IoC) {

   'use strict';

   var deprecatedClassesOfButton = {
      iconButtonBorderedAdditional: {
         style: 'secondary',
         type: 'quickButton'
      },

      iconButtonBordered: {
         style: 'secondary',
         type: 'transparentQuickButton'
      },

      linkMain: {
         style: 'secondary',
         type: 'link'
      },
      linkMain2: {
         style: 'info',
         type: 'link'
      },
      linkMain3: {
         style: 'info',
         type: 'link'
      },
      linkAdditional: {
         style: 'info',
         type: 'link'
      },
      linkAdditional2: {
         style: 'default',
         type: 'link'
      },

      linkAdditional3: {
         style: 'danger',
         type: 'link'
      },

      linkAdditional4: {
         style: 'success',
         type: 'link'
      },

      linkAdditional5: {
         style: 'magic',
         type: 'link'
      },

      buttonPrimary: {
         style: 'primary',
         type: 'button'
      },

      buttonDefault: {
         style: 'secondary',
         type: 'button'
      },

      buttonAdd: {
         style: 'primary',
         type: 'button'
      }
   };

   var Classes = {

      /**
     * Получить текущий стиль кнопки
     * @param {String} style
     * @returns {Object}
     */
      getCurrentButtonClass: function(style) {
         var currentButtonClass = {};
         if (deprecatedClassesOfButton.hasOwnProperty(style)) {
            currentButtonClass.viewMode = deprecatedClassesOfButton[style].type;
            currentButtonClass.style = deprecatedClassesOfButton[style].style;
            if (style === 'linkMain2' || style === 'linkMain3') {
               IoC.resolve('ILogger').error('Button', 'Используются устаревшие стили. Используйте компонент Controls/Label c модификаторами: controls-Label_underline-hovered и controls-Label_underline_color-hovered');
            } else if (style === 'buttonAdd') {
               currentButtonClass.buttonAdd = true;
               IoC.resolve('ILogger').error('Button', 'Используются устаревшие стили. Используйте опцию iconStyle в различных значениях для изменения по наведению');
            } else {
               IoC.resolve('ILogger').error('Button', 'Используются устаревшие стили. Используйте опции: viewMode = ' + currentButtonClass.viewMode + ', style = ' + currentButtonClass.style);
            }
         }
         return currentButtonClass;
      }

   };

   return Classes;
});
