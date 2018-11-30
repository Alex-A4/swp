/**
 * Генерация задач для предотвращения множественного запуска builder'а на одном кеше.
 * Необходимо для предсказуемого результата.
 * @author Бегунов Ал. В.
 */

'use strict';

const logger = require('../../../lib/logger').logger(),
   path = require('path'),
   fs = require('fs-extra');

let lockFile;

/**
 * Геренация задачи блокировки. Обязательно должна выполнятся перед всеми другими задачами.
 * @param {TaskParameters} taskParameters параметры для задач
 * @returns {function(): (Promise)}
 */
function generateTaskForLock(taskParameters) {
   const { cachePath } = taskParameters.config;
   return function lock() {
      return new Promise(async(resolve, reject) => {
         await fs.ensureDir(cachePath);
         lockFile = path.join(cachePath, 'builder.lockfile');

         const isFileExist = await fs.pathExists(lockFile);
         if (isFileExist) {
            const errorMessage =
               'Похоже, что запущен другой процесс builder в этой же папке, попробуйте перезапустить его позже. ' +
               `Если вы уверены, что предыдущий запуск завершился, то удалите папку '${cachePath}' и перезапустите процесс.`;

            logger.error(errorMessage);
            reject(new Error(errorMessage));
            return;
         }
         await fs.ensureFile(lockFile);
         logger.debug(`Создали файл '${lockFile}'`);

         // задаём в логгере информацию о приложении и ответственном
         logger.setBaseInfo(taskParameters.config.rawConfig.cld_name, taskParameters.config.rawConfig.cld_responsible);
         resolve();
      });
   };
}

/**
 * Геренация задачи разблокировки. Обязательно должна выполнятся после всех других задач.
 * @returns {function(): (Promise)}
 */
function generateTaskForUnlock() {
   return function unlock() {
      return new Promise(async(resolve, reject) => {
         const isFileExist = await fs.pathExists(lockFile);
         if (!isFileExist) {
            const errorMessage =
               `В процессе выполнения кто-то удалил файл '${lockFile}'. ` +
               'Нет гарантий, что результат не пострадал. Перезапустите процесс.';

            logger.error(errorMessage);
            reject(new Error(errorMessage));
            return;
         }
         await fs.remove(lockFile);
         logger.debug(`Удалили файл '${lockFile}'`);
         resolve();
      });
   };
}

module.exports = {
   generateTaskForLock,
   generateTaskForUnlock
};
