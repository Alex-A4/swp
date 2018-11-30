/**
 * Плагин архивации файлов с помощью gzip.
 * Генерирует в поток gzip файлы, но не пропускает через себя все остальные файлы, чтобы не перезаписывать лишинй раз.
 * @author Бегунов Ал. В.
 */

'use strict';

const through = require('through2'),
   logger = require('../../../lib/logger').logger(),
   helpers = require('../../../lib/helpers'),
   { promiseWithTimeout } = require('../../../lib/promise-with-timeout');

const includeExts = ['.js', '.json', '.css', '.tmpl', '.woff', '.ttf', '.eot'];

const excludeRegexes = [
   /.*\.routes\.js$/,
   /.*\.test\.js$/,
   /[/\\]ServerEvent[/\\]worker[/\\].*/,
   /.*\.routes\.js$/,
   /.*\.original\.js$/,
   /.*\.modulepack\.js$/,
   /.*\.test\.js$/,
   /.*\.esp\.json$/,
   /.*[/\\]data-providers[/\\].*\.js$/,
   /.*[/\\]design[/\\].*\.js$/
];

/**
 * Объявление плагина
 * @param {ModuleInfo} moduleInfo информация о модуле
 * @returns {stream}
 */
module.exports = function declarePlugin(moduleInfo) {
   return through.obj(

      /* @this Stream */
      async function onTransform(file, encoding, callback) {
         try {
            if (!file.contents) {
               callback();
               return;
            }

            if (!includeExts.includes(file.extname)) {
               callback();
               return;
            }

            for (const regex of excludeRegexes) {
               if (regex.test(file.path)) {
                  callback();
                  return;
               }
            }

            file.path = `${file.path}.gz`;
            const gzippedContent = await promiseWithTimeout(helpers.gzip(file.contents), 90000);
            file.contents = Buffer.from(gzippedContent);
            this.push(file);
         } catch (error) {
            logger.error({
               message: "Ошибка builder'а при архивации",
               error,
               moduleInfo,
               filePath: file.path
            });
         }
         callback();
      }
   );
};
