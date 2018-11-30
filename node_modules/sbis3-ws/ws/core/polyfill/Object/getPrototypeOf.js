if (!Object.getPrototypeOf) {
   if (typeof 'test'.__proto__ === 'object') {
      Object.getPrototypeOf = function(object) {
         return object.__proto__;
      };
   } else {
      Object.getPrototypeOf = function(object) {
         // May break if the constructor has been tampered with
         return object.constructor.prototype;
      };
   }
   Object.getPrototypeOf.simulated = true;
}
