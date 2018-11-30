/**
 * Created by ps.borisov on 05.05.2017.
 */
define('Core/helpers/vital/processImagePath', [
   'Core/constants',
   'Core/helpers/getVersionedLink'
], function(
   constants,
   getVersionedLink
) {
   /**
    * Модуль, в котором описана функция <b>processImagePath(path)</b>.
    *
    * @class Core/helpers/vital/processImagePath
    * @public
    * @author Крайнов Д.О.
    */
   return function processImagePath(path) {
      if (typeof path == 'string') {
         if (typeof window == 'undefined') {
            var nodePath = require('path');
         }

         if (path.indexOf('ws:/') === 0) {
            var replaceTo = constants.wsRoot + 'img/themes/wi_scheme';
            if (typeof window == 'undefined') {
               //constants.wsRoot начинается со слеша
               replaceTo = nodePath.join(constants.wsRoot, 'img/themes/wi_scheme');
            }
            path = path.replace('ws:', replaceTo);
         } else if (path.indexOf('/') > -1) {
            var moduleName = path.split('/')[0],
               modulePath =  constants.requirejsPaths[moduleName];
            if (modulePath) {
               path = '/' + path.replace(moduleName, modulePath)
            }
         }

         if (/(jpg|png|gif|svg)$/.test(path)) {
            path = getVersionedLink(path);
         }
      }
      return path;
   }
});
