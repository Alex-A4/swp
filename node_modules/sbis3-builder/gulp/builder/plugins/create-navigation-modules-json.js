/**
 * Плагин для создания navigation-modules.json (информация для работы аккордеона)
 * @author Бегунов Ал. В.
 */

'use strict';

const through = require('through2'),
   Vinyl = require('vinyl'),
   logger = require('../../../lib/logger').logger();

/**
 * Объявление плагина
 * @param {ModuleInfo} moduleInfo информация о модуле
 * @returns {stream}
 */
module.exports = function declarePlugin(moduleInfo) {
   return through.obj(
      function onTransform(file, encoding, callback) {
         callback(null, file);
      },

      /* @this Stream */
      function onFlush(callback) {
         try {
            this.push(
               new Vinyl({
                  path: 'navigation-modules.json',
                  contents: Buffer.from(JSON.stringify(moduleInfo.navigationModules.sort(), null, 2)),
                  moduleInfo
               })
            );
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
