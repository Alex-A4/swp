define('Core/core-min', [
   'Core/core-ready',
   'Core/core-init-min',
   'bootup-min',
   'Core/constants'
], function(cReady, cInit, bootup, constants) {
   'use strict';

   cReady.dependOn(cInit);
   constants._isMinimalCore = true;

   bootup();
   return {};
});