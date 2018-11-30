/* global define */
define('WS.Data/Utils/metrics', [
   'WS.Data/Entity/Record',
   'WS.Data/Entity/Model',
   'WS.Data/Utils'
], function(
   Record,
   Model,
   Utils
) {
   'use strict';

   var logger = Utils.logger,
      patches = {};

   var restoreFunction = function(patch) {
      patch.scope[patch.property] = patch.original;
   };

   var wrapFunction = function(original, metrics) {
      metrics.counter = 0;
      metrics.time = 0;
      return function() {
         metrics.counter++;

         var start = Date.now(),
            result = original.apply(this, arguments);

         metrics.time += Date.now() - start;

         return result;
      };
   };

   var patchFunction = function(scope, property, alias) {
      var metrics = {},
         patch = {
            scope: scope,
            property: property,
            metrics: metrics,
            original: scope[property],
            replacement: wrapFunction(scope[property], metrics)
         };

      scope[property] = patch.replacement;

      return (patches[alias] = patch);
   };

   var patch = function() {
      patchFunction(Record.prototype, 'get', 'WS.Data/Entity/Record::get()');
      patchFunction(Model.prototype, 'get', 'WS.Data/Entity/Model::get()');
      patchFunction(Model.prototype, '_processCalculatedValue', 'WS.Data/Entity/Model::_processCalculatedValue()');
   };

   var restore = function() {
      for (var alias in patches) {
         if (patches.hasOwnProperty(alias)) {
            restoreFunction(patches[alias]);
            delete patches[alias];
         }
      }
   };

   /**
    * Метрики производительности
    * @class WS.Data/Metrics
    * @public
    * @author Мальцев Алексей
    */

   var Metrics = {
      start: function(id) {
         logger.log('[Metrics]', 'Strart ' + id);
         patch();
      },

      stop: function(id) {
         logger.log('[Metrics]', 'Stop ' + id);

         var alias,
            patch;
         for (alias in patches) {
            if (patches.hasOwnProperty(alias)) {
               patch = patches[alias];
               logger.log('[Metrics]', alias + ' ' + patch.metrics.counter + ' times, ' + patch.metrics.time + 'ms');
            }
         }

         restore();

         logger.log('[Metrics]', 'Complete ' + id);
      }
   };

   return Metrics;
});
