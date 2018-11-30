/**
 * Плагин для создания preload_urls.json (url'ы для прогрева при старте сервиса представлений)
 * @author Бегунов Ал. В.
 */

'use strict';

const through = require('through2'),
   Vinyl = require('vinyl'),
   logger = require('../../../lib/logger').logger();

/**
 *
 * @param {ModuleInfo} moduleInfo информация о модуле
 * @returns {stream}
 */
module.exports = function declarePlugin(moduleInfo) {
   const preloadUrls = [];
   return through.obj(
      function onTransform(file, encoding, callback) {
         if (file.extname !== '.s3mod') {
            callback(null, file);
            return;
         }

         try {
            const text = file.contents.toString().replace(/\s/g, '');
            const matchs = text.match(/<preload>([\s\S]*)<\/preload>/);

            if (matchs && matchs[0]) {
               const [, preloadList] = matchs;
               const preload = preloadList.match(/["|'][\w?=.#/\-&А-я]*["|']/g);
               if (preload) {
                  preload.forEach((value) => {
                     preloadUrls.push(value.replace(/['|"]/g, ''));
                  });
               }
            }
         } catch (error) {
            logger.error({
               message: "Ошибка Builder'а",
               error,
               moduleInfo
            });
         }
         callback(null, file);
      },

      /* @this Stream */
      function onFlush(callback) {
         try {
            if (preloadUrls.length > 0) {
               this.push(
                  new Vinyl({
                     path: 'preload_urls.json',
                     contents: Buffer.from(JSON.stringify(preloadUrls.sort(), null, 2)),
                     moduleInfo
                  })
               );
            }
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
