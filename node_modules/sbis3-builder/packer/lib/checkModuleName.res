(function () {
   for (var moduleName in global.defineStorage) {
      if (moduleName.substr(0, 3) === 'js!') {
         var module = global.defineStorage[moduleName],
            proto = module && module.prototype;
         if (proto && !proto.hasOwnProperty('_moduleName')) {
            proto._moduleName = moduleName.substr(3);
         }
      }
   }
})();
