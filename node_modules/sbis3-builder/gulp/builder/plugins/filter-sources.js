/**
 * Плагин для фильтрации исходных файлов, чтобы не перетирать исходники.
 * Актуально в случае, если output указан на исходники, например для компиляции ts.
 * @author Колбешин Ф.А.
 */

'use strict';

const logger = require('../../../lib/logger').logger(),
   through = require('through2');

/**
 * Объявление плагина
 * @returns {stream}
 */
module.exports = function declarePlugin() {
   return through.obj(function onTransform(file, encoding, callback) {
      try {
         if (file.hasOwnProperty('compiled')) {
            callback(null, file);
            return;
         }
      } catch (error) {
         logger.error({ error });
      }
      callback();
   });
};
