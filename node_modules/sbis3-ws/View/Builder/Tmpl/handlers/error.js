define('View/Builder/Tmpl/handlers/error', [
   'Core/IoC'
], function errorHandlingDefine(
   IoC
) {
   'use strict';

   var setError = function(tag, message) {
      IoC.resolve('ILogger').error(tag, message);
   },
   getStack = function getStack(error) {
      return error && error.stack ? error.stack : error;
   };

   /**
    * One entry point for all errors from template engine
    */
   return function errorHandlingF(messageBody, filename, err) {
      if (err) {
         IoC.resolve('ILogger', 'ConsoleLogger').log("Tmpl", "Actual Error log: " + getStack(err));
      }
      if (filename) {
         setError("Tmpl", 'TMPL Engine error: ' + getStack(messageBody) + '. In file: ' + filename);
      } else {
         setError('TMPL Engine error: ' + getStack(messageBody), '');
      }
   };
});