/**
 * Плагин для компиляции json-файлов в AMD-формат.
 * json-файлы необходимо вставлять в разметку как скрипты, чтобы
 * разрешить проблему, которую описал Бегунов Андрей:
 * Cсылку на json нельзя вставить в тело страницы. В итоге оживление
 * идет с синхронными разрывами через require.js.
 * Также в будущем возникнет ситуация, что json плагина нет в es6 modules
 * @author Колбешин Ф.А.
 */

'use strict';

const through = require('through2'),
   fs = require('fs-extra'),
   path = require('path'),
   logger = require('../../../lib/logger').logger(),
   transliterate = require('../../../lib/transliterate'),
   compileJsonToJs = require('../../../lib/compile-json-to-js');

/**
 * Объявление плагина
 * @param {TaskParameters} taskParameters параметры для задач
 * @param {ModuleInfo} moduleInfo информация о модуле
 * @returns {stream}
 */
module.exports = function declarePlugin(taskParameters, moduleInfo) {
   return through.obj(

      /* @this Stream */
      async function onTransform(file, encoding, callback) {
         try {
            if (!file.contents) {
               callback();
               return;
            }

            if (!['.json'].includes(file.extname) || file.basename.includes('package.json')) {
               callback(null, file);
               return;
            }

            const relativePath = path.relative(moduleInfo.path, file.history[0]).replace(/\.(json)$/, '.json.js');
            const outputPath = path.join(moduleInfo.output, transliterate(relativePath));
            const outputMinPath = outputPath.replace(/\.js$/, '.min.js');

            if (file.cached) {
               taskParameters.cache.addOutputFile(file.history[0], outputPath, moduleInfo);
               taskParameters.cache.addOutputFile(file.history[0], outputMinPath, moduleInfo);
               callback(null, file);
               return;
            }

            const jsInSources = file.history[0].replace(/\.(json)$/, '.json.js');
            if (await fs.pathExists(jsInSources)) {
               const message = 'Существует скомпилированный в AMD-формат JSON-файл. Данный файл будет перезаписан!';

               // выводим пока в режиме debug, чтобы никого не сподвигнуть удалять файлы
               logger.warning({
                  message,
                  filePath: jsInSources,
                  moduleInfo
               });
            }

            // выводим пока в режиме debug, чтобы никого не сподвигнуть удалять файлы
            logger.debug({
               message: 'Компилируем в json.js',
               filePath: file.history[0],
               moduleInfo
            });

            let
               relativeFilePath = path.relative(moduleInfo.path, file.history[0]),
               result;

            relativeFilePath = path.join(path.basename(moduleInfo.path), relativeFilePath);

            try {
               result = compileJsonToJs(relativeFilePath, file.contents.toString());
            } catch (error) {
               taskParameters.cache.markFileAsFailed(file.history[0]);
               logger.error({
                  message: 'Ошибка создания AMD-модуля для json-файла',
                  error,
                  filePath: file.history[0],
                  moduleInfo
               });
               callback(null, file);
               return;
            }

            taskParameters.cache.addOutputFile(file.history[0], outputPath, moduleInfo);
            const newFile = file.clone();
            newFile.contents = Buffer.from(result);
            newFile.path = outputPath;
            newFile.base = moduleInfo.output;
            this.push(newFile);
         } catch (error) {
            taskParameters.cache.markFileAsFailed(file.history[0]);
            logger.error({
               message: "Ошибка builder'а при компиляции json в JS",
               error,
               moduleInfo,
               filePath: file.history[0]
            });
         }
         callback(null, file);
      }
   );
};
