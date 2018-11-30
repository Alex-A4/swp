/**
 * Плагин для создания routes-info.json (информация для работы роутинга)
 * @author Бегунов Ал. В.
 */

'use strict';

const through = require('through2'),
   path = require('path'),
   Vinyl = require('vinyl'),
   logger = require('../../../lib/logger').logger(),
   helpers = require('../../../lib/helpers'),
   transliterate = require('../../../lib/transliterate'),
   processingRoutes = require('../../../lib/processing-routes'),
   execInPool = require('../../common/exec-in-pool');

/**
 * Объявление плагина
 * @param {TaskParameters} taskParameters параметры для задач
 * @param {ModuleInfo} moduleInfo информация о модуле
  * @returns {stream}
 */
module.exports = function declarePlugin(taskParameters, moduleInfo) {
   return through.obj(
      async function onTransform(file, encoding, callback) {
         if (file.cached) {
            callback(null, file);
            return;
         }
         if (!file.path.endsWith('.routes.js')) {
            callback(null, file);
            return;
         }

         const [error, routeInfo] = await execInPool(
            taskParameters.pool,
            'parseRoutes',
            [file.contents.toString()],
            file.history[0],
            moduleInfo
         );
         if (error) {
            taskParameters.cache.markFileAsFailed(file.history[0]);
            logger.error({
               message: 'Ошибка при обработке файла роутинга',
               filePath: file.history[0],
               error,
               moduleInfo
            });
         } else {
            taskParameters.cache.storeRouteInfo(file.history[0], moduleInfo.name, routeInfo);
         }
         callback(null, file);
      },

      /* @this Stream */
      function onFlush(callback) {
         try {
            // Всегда сохраняем файл, чтобы не было ошибки при удалении последнего роутинга в модуле.

            // нужно преобразовать абсолютные пути в исходниках в относительные пути в стенде
            const routesInfoBySourceFiles = taskParameters.cache.getRoutesInfo(moduleInfo.name);
            const resultRoutesInfo = {};
            Object.keys(routesInfoBySourceFiles).forEach((filePath) => {
               const routeInfo = routesInfoBySourceFiles[filePath];
               const relativePath = path.relative(path.dirname(moduleInfo.path), filePath);
               const relativeResultPath = helpers.prettifyPath(path.join('resources', transliterate(relativePath)));
               resultRoutesInfo[relativeResultPath] = routeInfo;
            });

            // подготовим routes-info.json
            processingRoutes.prepareToSave(resultRoutesInfo);

            const routesInfoText = JSON.stringify(helpers.sortObject(resultRoutesInfo), null, 2);
            const routesInfoFile = new Vinyl({
               path: 'routes-info.json',
               contents: Buffer.from(routesInfoText),
               moduleInfo
            });
            this.push(routesInfoFile);
         } catch (error) {
            logger.error({
               message: "Ошибка Builder'а",
               error,
               moduleInfo
            });
         }
         callback();
      }
   );
};
