define('Core/deprecated', [
   'Core/constants'
], function (constants) {

   var deprecatedMessages = [];
   function callNext(fn, after) {
      var f = fn;
      return function () {
         var res = f.apply(fn, arguments),
            sourceResult = res;
         if (after) {
            Array.prototype.push.call(arguments, res);
            res = after.apply(fn, arguments);
         }
         return res === undefined ? sourceResult : res;
      };
   }

   function showErrorLog(message) {
      if (constants.isBrowserPlatform) {
         if (deprecatedMessages.indexOf(message) == -1) {
            deprecatedMessages.push(message);
            console.error('Deprecated', message);// eslint-disable-line no-console
         }
      }
   }

   function showInfoLog(message) {
      if (constants.isBrowserPlatform) {
         if (deprecatedMessages.indexOf(message) == -1) {
            deprecatedMessages.push(message);
             console.info('Deprecated', message);// eslint-disable-line no-console
         }
      }
   }

   var deprecatedFunc = function (func, cfg) {
      if (typeof func == 'function') {
         var
            customMessage = typeof cfg == 'string' ? cfg : null,
            funcName,
            ver,
            use,
            deprecMessage,
            minimalOnly;

         if (typeof cfg == 'object' && cfg !== null) {
            funcName = cfg.name || func.name;
            ver = cfg.ver;
            use = cfg.use;
            minimalOnly = cfg.minimalOnly;
         }

         deprecMessage = customMessage || 'Функция ' + funcName + ' помечена как deprecated и будет удалена в ' + ver + '.' + (use ? ' Используйте ' + use : '');
         return callNext(func, function () {
            if (constants.isBrowserPlatform) {
               if (minimalOnly) {
                  if (constants._isMinimalCore) {
                     console.error('Deprecated', deprecMessage); // eslint-disable-line no-console
                  }
               } else {
                  console.error('Deprecated', deprecMessage); // eslint-disable-line no-console
               }
            }
         });
      }
   };
   deprecatedFunc.callNextWrapper = callNext;
   deprecatedFunc.showErrorLog = showErrorLog;
   deprecatedFunc.showInfoLog = showInfoLog;
   return deprecatedFunc;
});
