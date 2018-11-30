/**
 * Плагин для удаления из потока Gulp исходников и мета-файлов,
 * которые не должны попасть в конечную директорию. Актуально для
 * Desktop-приложений.
 * @author Колбешин Ф.А.
 */

'use strict';

const through = require('through2');
const builderMeta = new Set([
   'module-dependencies.json',
   'navigation-modules.json',
   'routes-info.json',
   'static_templates.json'
]);

const extensions = new Set([
   '.js',
   '.tmpl',
   '.xhtml',
   '.less',
   '.wml',
   '.json',
   '.jstpl',
   '.css',
   '.es',
   '.ts',
   '.map'
]);

/**
 * Объявление плагина
 * @returns {stream}
 */
module.exports = function declarePlugin() {
   return through.obj(
      function onTransform(file, encoding, callback) {
         /**
          * не копируем мета-файлы билдера.
          */
         if (builderMeta.has(file.basename)) {
            callback(null);
            return;
         }

         /**
          * если файл нестандартного расширения, сразу копируем.
          */
         if (!extensions.has(file.extname)) {
            callback(null, file);
            return;
         }

         const isMinified = file.basename.endsWith(`.min${file.extname}`);
         switch (file.extname) {
            case '.js':
               /**
                * нужно скопировать .min.original модули, чтобы не записать в кастомный
                * пакет шаблон компонента 2 раза
                */
               if (isMinified || file.basename.endsWith('.min.original.js')) {
                  callback(null, file);
                  return;
               }
               callback(null);
               return;
            case '.es':
            case '.ts':
            case '.less':
            case '.json':
               /**
                * конфиги для кастомной паковки нужно скопировать, чтобы создались кастомные пакеты
                */
               if (isMinified || file.basename.endsWith('.package.json')) {
                  callback(null, file);
                  return;
               }
               callback(null);
               return;

            // шаблоны, .css, .jstpl
            default:
               if (isMinified) {
                  callback(null, file);
                  return;
               }
               callback(null);
         }
      }
   );
};
