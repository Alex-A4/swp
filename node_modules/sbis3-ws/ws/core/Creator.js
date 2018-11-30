define('Core/Creator',
   [
      'Core/Control'
   ], function(
      Control
   ) {
      'use strict';

      /*
      * Method return Promise and resolve it when component will mount to DOM
      * */

      return function(ctor, cfg, domElement) {
         return new Promise(function(resolve, reject) {
            try {
               var inst = Control.createControl(ctor, cfg, domElement),
                  baseAM = inst._afterMount;

               inst._afterMount = function() {
                  baseAM.apply(this, arguments);
                  resolve(this);
               };
            } catch (e) {
               reject(e);
            }
         });
      };
   });
