define('Core/helpers/collection', [
   'Core/helpers/Function/callNext',
   'Core/EventBus'
], function(callNext, EventBus) {

   /**
    *
    * @param arr
    * @returns {*}
    */
   return function collection(arr) {
      arr._eventBusChannel = EventBus.channel({
         strictMode: true
      });
      arr._eventBusChannel.publish("onChange", "onRemoveItem", "onInsertItem", "onMove", "onChangeOrder");
      var notifyChanges = function() {
            this._eventBusChannel.notify("onChange");
         },
         notifyChagesAndChangeOrder = function() {
            notifyChanges.apply(this);
            this._eventBusChannel.notify("onChangeOrder");
         },
         toCollection = function() {
            return collection(arguments[arguments.length - 1]);
         },
         onInsertItems = function(items, indexes) {
            notifyChanges.apply(this, []);
            this._eventBusChannel.notify("onInsertItem", items, indexes);
         },
         onRemoveItems = function(items, indexes) {
            notifyChanges.apply(this, []);
            this._eventBusChannel.notify("onRemoveItem", items, indexes);
         },
         callMethod = function(methodName, args) {
            this._eventBusChannel[methodName].apply(this._eventBusChannel, args);
            return this;
         },
         getItems = function() {
            return Array.prototype.slice.apply(arguments, [0, arguments.length - 1]);
         },
         getIndexes = function(start, length) {
            var indexes = [];
            for (var i = 0; i < length; i++) {
               indexes.push(start + i);
            }
            return indexes;
         };
      arr.subscribe = function(event, $handler) {
         this._eventBusChannel.subscribe(event, $handler, this);
         return this;
      };
      arr.once = function() {
         return callMethod.apply(this, ["once", arguments]);
      };
      arr.unsubscribe = function() {
         return callMethod.apply(this, ["unsubscribe", arguments]);
      };
      arr.unbind = function() {
         return callMethod.apply(this, ["unbind", arguments]);
      };
      arr.slice = callNext.call(Array.prototype.slice, toCollection.bind(arr));
      arr.concat = callNext.call(Array.prototype.concat, toCollection.bind(arr));
      arr.pop = callNext.call(Array.prototype.pop, function(element) {
         if (this._eventBusChannel.hasEventHandlers("onRemoveItem")) {
            onRemoveItems.apply(this, [[element], [this.length]]);
         } else if (this._eventBusChannel.hasEventHandlers("onChange")) {
            notifyChanges.apply(this, []);
         }
      });
      arr.push = callNext.call(Array.prototype.push, function() {
         if (this._eventBusChannel.hasEventHandlers("onInsertItem")) {
            var items = getItems.apply(this, arguments),
               l = items.length,
               indexes = getIndexes(this.length - l, l);
            onInsertItems.apply(this, [items, indexes]);
         } else if (this._eventBusChannel.hasEventHandlers("onChange")) {
            notifyChanges.apply(this, []);
         }
      });
      arr.reverse = callNext.call(Array.prototype.reverse, notifyChagesAndChangeOrder.bind(arr));
      arr.shift = callNext.call(Array.prototype.shift, function() {
         if (this._eventBusChannel.hasEventHandlers("onRemoveItem")) {
            onRemoveItems.apply(this, [Array.prototype.slice.apply(arguments, []), [0]]);
         } else if (this._eventBusChannel.hasEventHandlers("onChange")) {
            notifyChanges.apply(this, []);
         }
      });
      arr.unshift = callNext.call(Array.prototype.unshift, function() {
         if (this._eventBusChannel.hasEventHandlers("onInsertItem")) {
            var items = getItems.apply(this, arguments).reverse(),
               indexes = getIndexes(0, items.length);
            onInsertItems.apply(this, [items, indexes]);
         } else if (this._eventBusChannel.hasEventHandlers("onChange")) {
            notifyChanges.apply(this, []);
         }
      });
      arr.sort = callNext.call(Array.prototype.sort, notifyChagesAndChangeOrder.bind(arr));
      arr.splice = callNext.call(Array.prototype.splice, function(start, deleteCount) {
         var ln = arguments.length,
            needNotifyChanges = true;
         if (this._eventBusChannel.hasEventHandlers("onRemoveItem") && deleteCount > 0) {
            var deletedItems = arguments[ln - 1];
            needNotifyChanges = false;
            onRemoveItems.apply(this, [deletedItems, getIndexes(start, deletedItems.length)]);
         }
         if (this._eventBusChannel.hasEventHandlers("onInsertItem") && ln > 3) {
            var items = Array.prototype.slice.apply(arguments, [2, ln - 1]);
            needNotifyChanges = false;
            onInsertItems.apply(this, [items, getIndexes(start, items.length)]);
         }
         if (needNotifyChanges) {
            notifyChanges.apply(this, []);
         }
         return toCollection.apply(this, arguments);
      });
      arr.move = function(from, to) {
         var element = this[from];
         Array.prototype.splice.apply(this, [from, 1]);
         Array.prototype.splice.apply(this, [to, 0, element]);
         this._eventBusChannel.notify("onMove", from, to);
         notifyChagesAndChangeOrder.bind(arr).apply(this);
         return this;
      };
      return arr;
   };
});
