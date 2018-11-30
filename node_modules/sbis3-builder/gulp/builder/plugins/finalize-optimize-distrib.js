/**
 * Плагин, удаляющий исходники, которые были необходимы для паковки.
 * @author Колбешин Ф.А.
 */

'use strict';

const through = require('through2');
const fs = require('fs-extra');

/**
 * Объявление плагина
 * @returns {stream}
 */
module.exports = function declarePlugin() {
   return through.obj(
      async function onTransform(file, encoding, callback) {
         if (file.basename.endsWith('.min.original.js') || file.basename.endsWith('.package.json')) {
            await fs.remove(file.path);
         }
         callback(null);
      }
   );
};
