define('Core/css-resolve', ['Core/helpers/getVersionedLink'], function(getVersionedLink) {

   function pathJoin(a, b) {
      return (a + b).replace('//', '/');
   }

   var global = (function () {
      return this || (0, eval)('this');
   }());


   var buildMode = global.contents ? global.contents.buildMode : 'debug',
      isDebugMode = function () {
         return global.document && global.document.cookie && global.document.cookie.indexOf('s3debug=true') > -1;
      };

   var suffix = '';
   if (buildMode === 'release' && !isDebugMode()) {
      suffix = '.min';
   }


   return function (path) {
      var paths = typeof window !=='undefined' ? {
         'WS': window.wsConfig.wsRoot,
         'tslib': pathJoin(window.wsConfig.wsRoot, 'lib/Ext/tslib'),
         'Lib': pathJoin(window.wsConfig.wsRoot, 'lib'),
         'Ext': pathJoin(window.wsConfig.wsRoot, 'lib/Ext'),
         'Core': pathJoin(window.wsConfig.wsRoot, 'core')
      } : {};

      var splitted = path.split('/');
      if (paths[splitted[0]]) {
         splitted[0] = paths[splitted[0]];
         path = splitted.join('/');
      } else {
         path = (window.wsConfig.resourceRoot + '/' + path).replace('//', '/');
      }
      path = getVersionedLink(path + suffix + '.css');
      return path;
   };
});