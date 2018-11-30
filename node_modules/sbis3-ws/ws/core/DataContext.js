define('Core/DataContext', ['Core/core-extend'], function(coreExtend) {
   /**
    * @class Core/DataContext
    * @author Белотелов Н.В.
    * @public
    */

   var DataContext = coreExtend.extend([], {
      _version: 0,

      getVersion: function() {
         return this._version;
      },
      _nextVersion: function() {
         this._version++;
      },
      registerConsumer: function(control) {
         if(!this._$users$) {
            this._$users$ = [];
         }
         if (!~this._$users$.indexOf(control)) {
            this._$users$.push(control);
         }
      },
      unregisterConsumer: function(control) {
         if(this._$users$) {
            var index = this._$users$.indexOf(control);
            if (index > -1) {
               this._$users$.splice(index, 1);
            }
         }
      },
      updateConsumers: function() {
         if(this._$users$ && this._$users$.length) {
            for(var i = 0; i < this._$users$.length; i++) {
               this._$users$[i]._forceUpdate();
            }
         }
      }
   });

   return DataContext;
});