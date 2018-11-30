/**
 * Генерация задачи сохранения отчета об ошибках в json формате.
 * Нужно прежде всего для сотрудников отдела сборки,
 * чтобы оперативно реагировать на ошибки и предупреждения.
 * @author Бегунов Ал. В.
 */

'use strict';

const logger = require('../../../lib/logger').logger(),
   path = require('path'),
   fs = require('fs-extra');

/**
 * Генерация задачи сохранения отчета об ошибках в json формате.
 * @param {TaskParameters} taskParameters параметры для задач
 * @returns {function(): (Promise)}
 */
module.exports = function generateTaskForSaveLoggerReport(taskParameters) {
   return function saveReport() {
      return new Promise(async(resolve, reject) => {
         try {
            if (taskParameters.config.logFolder) {
               const messages = logger.getMessageForReport();

               const reportFilePath = path.join(taskParameters.config.logFolder, 'builder_report.json');
               await fs.outputJSON(reportFilePath, { messages });
            }
         } catch (error) {
            logger.error({ error });
            reject(error);
         }
         resolve();
      });
   };
};
