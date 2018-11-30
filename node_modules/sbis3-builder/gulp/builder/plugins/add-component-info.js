/**
 * Плагин для парсинга js компонентов и получения из них всей необходимой для сборки информации.
 * Больше js компоненты парсится не должны нигде.
 * Результат кешируется.
 * @author Бегунов Ал. В.
 */

'use strict';

const through = require('through2'),
   logger = require('../../../lib/logger').logger(),
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

         // нас не интересуют:
         //  не js-файлы
         //  *.test.js - тесты
         //  *.worker.js - воркеры
         //  *.routes.js - роутинг. обрабатывается в отдельном плагине
         //  файлы в папках design - файлы для макетирования в genie
         // jquery также не должен парситься, это модуль с cdn.
         if (
            file.extname !== '.js' ||
            file.path.endsWith('.worker.js') ||
            file.path.endsWith('.test.js') ||
            file.path.includes('/design/') ||
            file.basename.includes('jquery-min') ||
            file.basename.includes('jquery-full')
         ) {
            callback(null, file);
            return;
         }

         const [error, componentInfo] = await execInPool(
            taskParameters.pool,
            'parseJsComponent',
            [file.contents.toString()],
            file.history[0],
            moduleInfo
         );
         if (error) {
            taskParameters.cache.markFileAsFailed(file.history[0]);
            logger.error({
               message: 'Ошибка при обработке JS компонента',
               filePath: file.history[0],
               error,
               moduleInfo
            });
         }
         taskParameters.cache.storeComponentInfo(file.history[0], moduleInfo.name, componentInfo);
         callback(null, file);
      },
      function onFlush(callback) {
         try {
            const componentsInfo = taskParameters.cache.getComponentsInfo(moduleInfo.name);
            Object.keys(componentsInfo).forEach((filePath) => {
               const info = componentsInfo[filePath];
               if (info.hasOwnProperty('isNavigation') && info.isNavigation) {
                  moduleInfo.navigationModules.push(info.componentName);
               }
            });
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
