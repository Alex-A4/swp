define('Core/nativeExtensions/deprecated', function() {
   var global = (function() { return this || (0, eval)('this') })(),
      shows = {},
      limit = 10,
      deprecated;

   deprecated = function deprecated(method, module, implementation, version, level) {
      version = version || '3.18';
      level = level || 'warn';

      return function() {
         var message = 'Метод ' +
            method +
            ' объявлен deprecated и будет удален в версии ' + version +
            (module ? '. Bместо этого используйте ' + module + '.' : '');

         if (level === 'fatal') {
            throw new ReferenceError(message);
         }
         if (shows[method] === undefined) {
            shows[method] = 0;
         }
         if (shows[method] < limit) {
            shows[method]++;
            if (global.console && !global.IS_PRODUCTION ) {
               global.console[level] ? global.console[level](message) : global.console.log(message);
            }
         }

         return implementation.apply(this, arguments);
      };
   };
   deprecated.error = function error(method, module, implementation, version) {
      return deprecated(method, module, implementation, version, 'error');
   };
   deprecated.fatal = function fatal(method, module, implementation, version) {
      return deprecated(method, module, implementation, version, 'fatal');
   };

   return deprecated;
});