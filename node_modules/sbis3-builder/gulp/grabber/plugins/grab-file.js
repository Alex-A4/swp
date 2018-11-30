/**
 * @author Бегунов Ал. В.
 */

'use strict';

const through = require('through2'),
   path = require('path'),
   logger = require('../../../lib/logger').logger(),
   execInPool = require('../../common/exec-in-pool');

const supportExtensions = ['.js', '.xhtml', '.tmpl'];

/**
 * Объявление плагина
 * @param {TaskParameters} taskParameters параметры для задач
 * @param {ModuleInfo} moduleInfo информация о модуле
 * @returns {stream}
 */
module.exports = function declarePlugin(taskParameters, moduleInfo) {
   return through.obj(async(file, encoding, callback) => {
      try {
         if (!supportExtensions.includes(file.extname)) {
            callback();
            return;
         }

         if (file.cached) {
            callback();
            return;
         }

         const componentsPropertiesFilePath = path.join(taskParameters.config.cachePath, 'components-properties.json');

         const [error, collectWords] = await execInPool(
            taskParameters.pool,
            'collectWords',
            [moduleInfo.path, file.path, componentsPropertiesFilePath],
            file.path,
            moduleInfo
         );
         if (error) {
            logger.warning({
               message: 'Ошибка при обработке файла',
               filePath: file.path,
               error,
               moduleInfo
            });
         } else {
            taskParameters.cache.storeCollectWords(file.history[0], collectWords);
         }
      } catch (error) {
         logger.warning({
            message: "Ошибка builder'а при обработке файла",
            filePath: file.path,
            error,
            moduleInfo
         });
      }
      callback();
   });
};
