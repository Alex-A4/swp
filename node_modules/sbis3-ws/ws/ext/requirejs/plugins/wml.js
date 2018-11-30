(function(){
   'use strict';

   var global = (function(){ return this || (0,eval)('this'); }()),
      define = global.define || (global.requirejs && global.requirejs.define) || requirejsVars.define,
      isServerSide = typeof window === 'undefined' && !(process && process.versions);

   /**
    * Плагин для подключения шаблонов в виде функций.
    */
   define('wml', [
      'text',
      'View/config',
      'Core/pathResolver',
      'Core/constants',
      'Core/IoC'
   ], function(
      text,
      config,
      pathResolver,
      constants,
      IoC
   ) {

      function createLostFunction(err, ext) {
         var f = function () {
            IoC.resolve('ILogger').error(ext+'!', err.message, err);
            return '<div>' + err.message + '</div>';
         };
         f.stable = true;
         f.includedFunctions = {};
         return f;
      }

      function createTemplate(name, html, tmpl, conf, load, ext) {
         try {
            if (!conf.fileName) {
               conf.fileName = name;
            }
            tmpl.getFile(html, conf, function (file) {
               load.fromTextFixed ? load.fromTextFixed(file) : load.fromText(file);
               load = undefined;
            }, undefined, ext);
         } catch (err) {
            err.message = 'Error while parsing template "' + name + '": ' + err.message;
            load(createLostFunction(err, ext));
            load = undefined;
         }
      }

      function createLoader(name, require, load, conf, ext, needRequire, callback) {
         var loader = function (html) {
            if (html && html.indexOf('define') === 0) {
               //Got template as compiled AMD module
               load.fromTextFixed ? load.fromTextFixed(html) : load.fromText(html);
            } else {
               //Got template as string with markup
               try {
                  require(needRequire, function(builder) {
                     callback(name, html, builder.Tmpl, conf, load, ext);
                  });
               } catch (err) {
                  err.message = 'Error while loading builder for template "' + name + '": ' + err.message;
                  load.error(err);
               }
            }
         };

         loader.error = function (err) {
            err.message = 'Error while loading template "' + name + '": ' + err.message;
            load.error(err);
         };

         return loader;
      }

      var wmlObj = {
         loadBase: function (name, require, load, ext, deps, callback){
            try {
               var path = pathResolver(name, ext, true),
                  conf = {
                     config: config,
                     filename: path
                  };

               // для Сервиса Представлений необходимы именно сбилженные шаблоны(для здоровья локализации)
               // Также проверяем наличие process - на Серверном скрипте должны просится шаблоны без .min
               if (isServerSide && constants.buildMode === 'release' && constants.isNodePlatform) {
                  path = path.replace(/(\.min)?\.tmpl$/, '.min.tmpl');
                  path = path.replace(/(\.min)?\.wml/, '.min.wml');
               }


               text.load(
                  path,
                  require,
                  createLoader(name, require, load, conf, ext, deps, callback),
                  conf
               );
            } catch(err) {
               err.message = 'Error while resolving template "' + name + '": ' + err.message;
               load.error(err);
            }
         },
         load: function (name, require, load) {
            wmlObj.loadBase(name, require, load, 'wml', ['View/Builder'], createTemplate);
         },
         createLostFunction: createLostFunction,
         createLoader: createLoader
      };

      return wmlObj;
   });
})();
