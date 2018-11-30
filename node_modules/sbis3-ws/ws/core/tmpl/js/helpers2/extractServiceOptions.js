/**
 * Created by dv.zuev on 03.07.2017.
 */
define('Core/tmpl/js/helpers2/extractServiceOptions', [
   'Core/tmpl/js/helpers2/eventExpressions'
], function extractServiceOptions(eventExpressions){
   'use strict';

   var serviceOptions = [ 'parent',
      'logicParent'];

   var extractServiceOptions = {

      extact: function(options){
         var ex = {};

         for(var i in options) {
            if (options.hasOwnProperty(i) && (options[i] in serviceOptions || eventExpressions.isEvent(options[i]))){
               ex[i] = options[i];
               delete options[i];
            }
         }

         return ex;
      }

   };

   return extractServiceOptions;
});