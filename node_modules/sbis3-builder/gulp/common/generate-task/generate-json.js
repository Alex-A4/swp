/**
 * Генерация задачи генерации json описания компонентов для локализации
 * @author Бегунов Ал. В.
 */

'use strict';
const path = require('path'),
   fs = require('fs-extra'),
   assert = require('assert');

const logger = require('../../../lib/logger').logger();

/**
 * Генерация задачи генерации json описания компонентов для локализации
 * @param {TaskParameters} taskParameters параметры для задач
 * @return {function} функция-задача для gulp
 */
function generateTaskForGenerateJson(taskParameters) {
   if (!taskParameters.needGenerateJson) {
      return function generateJson(done) {
         done();
      };
   }
   return async function generateJson() {
      try {
         const folders = [];
         for (const module of taskParameters.config.modules) {
            folders.push(module.path);
         }

         // если локализация не нужна, то и ругаться, что json-generator нет, не нужно.
         // eslint-disable-next-line global-require
         const runJsonGenerator = require('../../../lib/i18n/run-json-generator');
         const resultJsonGenerator = await runJsonGenerator(folders, taskParameters.config.cachePath);
         for (const error of resultJsonGenerator.errors) {
            logger.warning({
               message: 'Ошибка при разборе JSDoc комментариев',
               filePath: error.filePath,
               error: error.error
            });
         }

         // если components-properties поменялись, то нужно сбросить кеш для верстки
         let isComponentsPropertiesChanged = false;
         const filePath = path.join(taskParameters.config.cachePath, 'components-properties.json');
         if (await fs.pathExists(filePath)) {
            let oldIndex = {};
            try {
               oldIndex = await fs.readJSON(filePath);
            } catch (err) {
               logger.warning({
                  message: 'Не удалось прочитать файл кеша',
                  filePath,
                  error: err
               });
            }

            try {
               assert.deepStrictEqual(oldIndex, resultJsonGenerator.index);
            } catch (error) {
               isComponentsPropertiesChanged = true;
            }
         } else {
            isComponentsPropertiesChanged = true;
         }
         if (isComponentsPropertiesChanged) {
            logger.info('Кеш для файлов верстки будет сброшен, если был.');
            taskParameters.cache.setDropCacheForMarkup();
            await fs.writeJSON(filePath, resultJsonGenerator.index, { spaces: 1 });
         }
      } catch (error) {
         logger.error({
            message: "Ошибка Builder'а. Задача generateJson",
            error
         });
      }
   };
}

module.exports = generateTaskForGenerateJson;
