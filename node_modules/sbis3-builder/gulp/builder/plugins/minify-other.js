/**
 * Плагин для минификации простейших случаев: *.json, *.jstpl
 * Заводить для каждого из них отдельный плагин - лишняя работа.
 * Включать в minify-js - значит усложнить и без того сложный плагин.
 * @author Бегунов Ал. В.
 */

'use strict';

const through = require('through2'),
   path = require('path'),
   Vinyl = require('vinyl'),
   logger = require('../../../lib/logger').logger(),
   transliterate = require('../../../lib/transliterate');

const includeExts = ['.jstpl', '.json'];

const excludeRegexes = [/.*\.package\.json$/];

/**
 * Объявление плагина
 * @param {TaskParameters} taskParameters параметры для задач
 * @param {ModuleInfo} moduleInfo информация о модуле
 * @returns {stream}
 */
module.exports = function declarePlugin(taskParameters, moduleInfo) {
   return through.obj(

      /* @this Stream */
      function onTransform(file, encoding, callback) {
         const isJsonJs = file.basename.endsWith('.json.js');

         try {
            if (!isJsonJs && !includeExts.includes(file.extname)) {
               callback(null, file);
               return;
            }

            for (const regex of excludeRegexes) {
               if (regex.test(file.path)) {
                  callback(null, file);
                  return;
               }
            }

            const
               currentFilePath = isJsonJs ? file.history[0].replace('.json', '.json.js') : file.history[0],
               currentExt = isJsonJs ? '.json.js' : file.extname,
               minFileExt = isJsonJs ? '.json.min.js' : `.min${file.extname}`;

            const relativePath = path
               .relative(moduleInfo.path, currentFilePath)
               .replace(currentExt, minFileExt);
            const outputMinFile = path.join(moduleInfo.output, transliterate(relativePath));

            if (file.cached) {
               taskParameters.cache.addOutputFile(file.history[0], outputMinFile, moduleInfo);
               callback(null, file);
               return;
            }

            /**
             * если json файл не возможно минифицировать, то запишем оригинал.
             * jstpl копируем напрямую, их минифицировать никак нельзя,
             * но .min файл присутствовать должен во избежание ошибки 404
             */
            let newText = file.contents.toString();

            if (file.extname === '.json') {
               try {
                  newText = JSON.stringify(JSON.parse(newText));
               } catch (error) {
                  taskParameters.cache.markFileAsFailed(file.history[0]);
                  logger.error({
                     message: 'Ошибка минификации файла',
                     error,
                     moduleInfo,
                     filePath: file.path
                  });
               }
            }

            this.push(
               new Vinyl({
                  base: moduleInfo.output,
                  path: outputMinFile,
                  contents: Buffer.from(newText)
               })
            );
            taskParameters.cache.addOutputFile(file.history[0], outputMinFile, moduleInfo);
         } catch (error) {
            taskParameters.cache.markFileAsFailed(file.history[0]);
            logger.error({
               message: "Ошибка builder'а при минификации",
               error,
               moduleInfo,
               filePath: file.path
            });
         }
         callback(null, file);
      }
   );
};
