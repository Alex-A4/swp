define('Controls/Container/PendingRegistrator', [
   'Core/Control',
   'wml!Controls/Container/PendingRegistrator/PendingRegistrator',
   'Core/Deferred',
   'Core/ParallelDeferred'
], function(Control, tmpl, Deferred, ParallelDeferred) {
   'use strict';

   // pending identificator counter
   var cnt = 0;

   var module = Control.extend({
      _template: tmpl,
      _pendings: null,
      _parallelDef: null,
      _beforeMount: function() {
         this._pendings = {};
      },
      _registerPendingHandler: function(e, def, config) {
         this._pendings[cnt] = {

            // its deferred what signalling about pending finish
            def: def,

            // its function what helps pending to finish when query goes from finishPendingOperations
            onPendingFail: config.onPendingFail,

            // show indicator when pending is registered
            showLoadingIndicator: config.showLoadingIndicator
         };
         if (config.showLoadingIndicator && !def.isReady()) {
            // show indicator if deferred still not finished on moment of registration
            this._children.loadingIndicator.toggleIndicator(true);
         }

         def.addBoth(function(cnt, res) {
            this._unregisterPending(cnt);
            return res;
         }.bind(this, cnt));

         cnt++;
      },
      _unregisterPending: function(id) {
         delete this._pendings[id];

         // hide indicator if no more pendings with indicator showing
         if (!this._hasPendingsWithIndicator()) {
            this._children.loadingIndicator.toggleIndicator(false);
         }

         // notify if no more pendings
         if (!this._hasRegisteredPendings()) {
            this._notify('pendingsFinished', [], { bubbling: true });
         }
      },
      _hasRegisteredPendings: function() {
         return !!Object.keys(this._pendings).length;
      },
      _hasPendingsWithIndicator: function() {
         var self = this;
         var res = false;
         Object.keys(this._pendings).forEach(function(key) {
            var pending = self._pendings[key];
            if (pending.showLoadingIndicator) {
               res = true;
            }
         });
         return res;
      },
      finishPendingOperations: function(forceFinishValue) {
         var resultDeferred = new Deferred(),
            parallelDef = new ParallelDeferred(),
            pendingResults = [];

         var self = this;
         Object.keys(this._pendings).forEach(function(key) {
            var pending = self._pendings[key];
            if (pending.onPendingFail) {
               var res = pending.onPendingFail(forceFinishValue);
               if (res instanceof Deferred) {
                  parallelDef.push(res);
               } else {
                  // save result of pending finish
                  pendingResults.push(res);
               }
            } else {
               // pending is finished without result
               pendingResults.push(undefined);
            }
         });

         // cancel previous query of pending finish. create new query.
         this._cancelFinishingPending();
         this._parallelDef = parallelDef.done().getResult();

         this._parallelDef.addCallback(function(results) {
            if (typeof results === 'object') {
               for (var resultIndex in results) {
                  if (results.hasOwnProperty(resultIndex)) {
                     var result = results[resultIndex];
                     pendingResults.push(result);
                  }
               }
            }

            self._parallelDef = null;

            resultDeferred.callback(pendingResults);
         }).addErrback(function(e) {
            if (!e.canceled) {
               resultDeferred.errback(e);
            }
            return e;
         });

         return resultDeferred;
      },
      _cancelFinishingPending: function() {
         if (this._parallelDef) {
            // its need to cancel result deferred of parallel defered. reset state of deferred to achieve it.
            this._parallelDef._fired = -1;
            this._parallelDef.cancel();
         }
      }
   });

   return module;
});
