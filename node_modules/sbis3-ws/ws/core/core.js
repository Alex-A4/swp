define('Core/core', [
   'Core/core-ready',
   'Core/core-init',
   'i18n!Core/core'
], function(cReady, coreInit) {
   'use strict';

   coreInit.addCallback(function() {
      //Проверяем, на случай если на странице уже есть ядро. Иначе будет ошибка что пытаемся поджечь готовый деферред.
      if (!cReady.isReady()) {
         cReady.callback();
      }
   });

   return {};
});
