(function() {

   "use strict";
   var global = (function() {return this || (0,eval)('this');}()),
      define = global.define || (global.requirejs && global.requirejs.define) || (requirejsVars && requirejsVars.define);

   define("i18n", [
      'Core/i18n',
      'Core/constants',
      'text',
      'native-css'
   ], function(i18n, constants) {
      var isOnServer = constants.isNodePlatform || constants.isServerScript;
      return {
         load: function(name, require, onLoad) {
            if (isOnServer || i18n.isEnabled()) {
               var curLang = i18n.getLang(),
                  // На препроцессоре грузим все языки
                  // На клиенте - лишь нужный
                  langToLoad = isOnServer ? Object.keys(i18n.getAvailableLang()) : i18n.hasLang(curLang) ? [curLang] : [],
                  dictPaths = [], cssPaths = [], dictPathLang = [],
                  findDictionary = function(curLang) {
                     var dictPath, cssPath;

                     // Грузим только те словари, о которых знал Джин при конвертации
                     dictPath = i18n.getDictPath(name, curLang, 'json');
                     if (dictPath) {
                        dictPaths.push(dictPath);
                        dictPathLang.push(curLang);
                     }

                     if (!isOnServer) {
                        // Грузим только те css, о которых знал Джин при конвертации
                        cssPath = i18n.getDictPath(name, curLang, 'css');
                        if (cssPath) {
                           cssPaths.push('native-css!' + cssPath);
                        }

                        var curCountry = curLang.substr(3, 2);
                        cssPath = i18n.getDictPath(name, curCountry, 'css');
                        if (cssPath) {
                           cssPaths.push('native-css!' + cssPath);
                        }
                     }
                  };

               for (var key in langToLoad) {
                  if (langToLoad.hasOwnProperty(key)) {
                     findDictionary(langToLoad[key]);
                  }
               }

               require(dictPaths.concat(cssPaths), function() {
                  try {
                     for (var i = 0, len = dictPaths.length; i < len; i++) {
                        i18n.setDict(arguments[i], dictPaths[i], dictPathLang[i]);
                     }

                     onLoad(i18n.rk.bind(i18n));
                  } catch(err) {
                     onLoad.error(err);
                  }
               }, function(err) {
                  onLoad.error(err);
               });
            } else {
               onLoad(i18n.rk.bind(i18n));
            }
         }
      }
   });
})();
