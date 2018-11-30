/**
 * Created by dv.zuev on 17.04.2018.
 */
define('View/Logger', [
   'Transport/URL/getQueryParam',
   'Core/IoC'
], function(
   getQueryParam,
   IoC
) {
   var
      loggerStatus = getQueryParam('viewLogger') === 'true',
      msgLevel = getQueryParam('viewLoggerLevel') || 0,
      statusOverride = false;

   return {
      setLoggerStatus: function(status, applyOnServer) {
         loggerStatus = status;
         if (!status || applyOnServer) {
            // setLoggerStatus(false) always disables logger, but
            // setLoggerStatus(true) only enables logger on server
            // if applyOnServer is true
            statusOverride = status;
         }
      },

      getLoggerStatus: function() {
         if (statusOverride) {
            // statusOverride takes priority
            return true;
         }
         if (typeof window !== 'undefined') {
            // on client logger can be enabled and disabled normally
            // by changing loggerStatus
            return loggerStatus;
         }

         // on server loggerStatus does not matter, logging depends on viewLogger
         // query param (if statusOverride is not enabled)
         return getQueryParam('viewLogger') === 'true';
      },

      setMsgLevel: function(level) {
         msgLevel = level;
      },

      catchLifeCircleErrors: function catchLifeCircleErrors(hookName, error) {
         IoC.resolve("ILogger").error("LIFECYCLE ERROR. HOOK NAME: " + hookName, error, error);
      },

      /*
      * msg - array
      * 0: info
      * 1: debugging info
      * 2: debugging additional info
      * */
      log: function(process, msg) {
         if (this.getLoggerStatus()) {
            for (var i = 0; i <= msgLevel && i < msg.length; i++) {
               if (msg[i]) {
                  if (typeof window !== 'undefined') {
                     /*
                     * Can't use IoC here
                     * IoC convert all mesages to string
                     * */
                     window['console'].log('View logger [' + process + ']', msg[i]);
                  } else if (typeof msg[i] === 'string') {
                     IoC.resolve('ILogger').log('View logger [' + process + ']', msg[i]);
                  }
               }
            }
         }
      }
   };
});
