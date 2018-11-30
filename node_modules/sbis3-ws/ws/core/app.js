define('Core/app', [
   'Core/app-start',
   'Core/app-init'
], function(appStart, appInit) {
   'use strict';
   return function(deps) {
      appInit();
      if (deps && deps.length) {
         require(deps, function() {
            appStart();
         });
      } else {
         appStart();
      }
   };
});
