define('View/Builder/Tmpl/handlers/log', ['Core/IoC'], function errorHandlingDefine(IoC) {
   'use strict';
   return {
      generateErrorMessage: function (filename) {
         return 'Template ' + filename + ' failed to generate html.';
      },
      IoC: IoC
   };
});