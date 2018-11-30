/**
 * @author Бегунов Ал. В.
 */

'use strict';

const logger = require('../../lib/logger').logger();

/**
 * Выполнить фукнцию в пуле воркеров.
 * Установлен таймаут.
 * Подготавливаются данные для вывода корректных логов из пула воркеров.
 * @param {Pool} pool пул воркеров
 * @param {string} funcName имя функции, которую нужно выполнить в пуле воркеров
 * @param {Array} funcArgs аргументы функции, которую нужно выполнить в пуле воркеров
 * @param {string} filePath путь до обрабатываемого файла. Для красивых логов.
 * @param {ModuleInfo} moduleInfo информация о модуле. Для красивых логов.
 * @returns {Promise<[error, result]>}
 */
async function execInPool(pool, funcName, funcArgs, filePath = '', moduleInfo = null) {
   try {
      let moduleInfoObj;
      if (moduleInfo) {
         moduleInfoObj = {
            name: moduleInfo.name,
            responsible: moduleInfo.responsible,
            nameWithResponsible: moduleInfo.nameWithResponsible
         };
      }
      const [error, result, messagesForReport] = await pool
         .exec(funcName, [funcArgs, filePath, moduleInfoObj])
         .timeout(180000);
      logger.addMessagesFromWorker(messagesForReport);
      return [error, result];
   } catch (error) {
      return [error, null];
   }
}
module.exports = execInPool;
