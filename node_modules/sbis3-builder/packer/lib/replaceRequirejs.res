var global = function () {
      return this || (0, eval)("this");
   }(),
   checkResourceLoadCallback = function() {
      if (global._requirejs.onResourceLoad !== global.requirejs.onResourceLoad) {
         global._requirejs.onResourceLoad = global.requirejs.onResourceLoad;
      }
   };

global.defineStorage = global.defineStorage || {};
global.defineStorage['preloadFunc'] = function(module) {
   return function() {
      global.requirejs([module], function(preload) {
         preload();
      })
   }
};
global._requirejs = global._requirejs || global.requirejs;
global.requirejs = function (dep, callback) {
   if (typeof dep == "string" && (dep in global.defineStorage)) {
      return global.defineStorage[dep];
   } else {
      if (dep instanceof Array && typeof callback === 'function') {
         var
            resolvedDepsArray = [],
            curDep;

         for (var i = 0; i < dep.length; i++) {
            curDep = dep[i];
            if (curDep in global.defineStorage) {
               resolvedDepsArray.push(global.defineStorage[curDep])
            } else {
               checkResourceLoadCallback();
               return global._requirejs.apply(null, arguments);
            }
         }

         setTimeout(function () {
            callback.apply(null, resolvedDepsArray);
         }, 4);
      } else {
         checkResourceLoadCallback();
         return global._requirejs.apply(null, arguments);
      }
   }
};

for (var p in _requirejs) {
   if (global._requirejs.hasOwnProperty(p)) {
      global.requirejs[p] = global._requirejs[p]
   }
}

global.requirejs._defined = global.requirejs._defined || global.requirejs.defined;
global.requirejs.defined = function (dep) {
   if (typeof dep == "string" && (dep in global.defineStorage)) {
      return true;
   } else {
      return global.requirejs._defined.apply(null, arguments);
   }
};
global.require = global.requirejs;
global._i18nStorage = [];
