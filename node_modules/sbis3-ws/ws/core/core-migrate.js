if (typeof window !== 'undefined') {
   var global = (function () { return this || (1, eval)('this') }());
   global._callbackStorage =  global._callbackStorage || [];
   global._singleStoreStorage = global._singleStoreStorage || [];
   global._withCompStorage = global._withCompStorage || [];
}