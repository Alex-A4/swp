define('Lib/Mixins/PendingOperationProducerMixin', [
   'Core/helpers/Array/findIndex'
], function(arrayFindIndex) {
   var allProducedPendingOperations = [];
   
   function removeOperation(operation, array) {
      var idx = arrayFindIndex(array, function(op) { return op === operation; });
      if (idx !== -1) {
         array.splice(idx, 1);
      }
   }
   
   return /** @lends Lib/Mixins/PendingOperationProducerMixin.prototype */ {
      $protected: {
         _producedPendingOperations: []
      },

      _removeOpFromCollections: function (operation) {
         removeOperation(operation, this._producedPendingOperations);
         removeOperation(operation, allProducedPendingOperations);
      },

      _registerPendingOperation: function(name, finishFunc, registerTarget) {
         var
            name = this._moduleName ? this._moduleName + '/' + name : name,
            operation = {
               name: name,
               finishFunc: finishFunc,
               cleanup: null,
               control: this,
               registerTarget: registerTarget
            };

         operation.cleanup = this._removeOpFromCollections.bind(this, operation);
         if (operation.registerTarget) {
            operation.registerTarget.sendCommand('registerPendingOperation', operation);

            this._producedPendingOperations.push(operation);
            allProducedPendingOperations.push(operation);
         }
         return operation;
      },

      _unregisterPendingOperation: function(operation) {
         operation.cleanup();

         if (operation.registerTarget) {
            operation.registerTarget.sendCommand('unregisterPendingOperation', operation);
         }
      },

      getAllPendingOperations: function() {
         return allProducedPendingOperations;
      },

      getPendingOperations: function() {
         return this._producedPendingOperations;
      },

      before: {
         destroy: function () {
            var ops = this._producedPendingOperations;
            while (ops.length > 0) {
               this._unregisterPendingOperation(ops[0]);
            }
         }
      }
   };
});