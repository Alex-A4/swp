/**
 * Плагин для версионирования после инкрементальной сборки. Убирает версионирование
 * из исходников, оставляет placeholder в минифицированных модулях.
 * Связан с versionize-to-stub
 * @author Бегунов Ал. В.
 */

'use strict';

const through = require('through2'),
   logger = require('../../../lib/logger').logger();

const VERSION_STUB = /\?x_version=%{BUILDER_VERSION_STUB}/g;

const includeExts = ['.css', '.js', '.html', '.tmpl', '.xhtml', '.wml'];

/**
 * Объявление плагина
 * @param {TaskParameters} taskParameters параметры для задач
 * @param {ModuleInfo} moduleInfo информация о модуле
 * @returns {stream}
 */
module.exports = function declarePlugin(taskParameters, moduleInfo) {
   return through.obj(function onTransform(file, encoding, callback) {
      try {
         if (!includeExts.includes(file.extname)) {
            callback(null, file);
            return;
         }

         if (file.path.match(/\.min\.[^.\\/]+$/) || file.extname === '.html') {
            callback(null, file);
            return;
         }
         const text = file.contents.toString();
         file.contents = Buffer.from(text.replace(VERSION_STUB, ''));
      } catch (error) {
         logger.error({
            message: "Ошибка builder'а при версионировании",
            error,
            moduleInfo,
            filePath: file.path
         });
      }
      callback(null, file);
   });
};
