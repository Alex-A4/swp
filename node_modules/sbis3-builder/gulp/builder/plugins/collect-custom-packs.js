/**
 * Плагин для кастомной паковки. Ищет файлы *.package.json, в зависимости от наличия опции level и её значения
 * делит конфигурации для кастомной паковки на приоритетные и обычные.
 * @author Колбешин Ф.А.
 */

'use strict';

const
   path = require('path'),
   through = require('through2'),
   packHelpers = require('../../../lib/pack/helpers/custompack'),
   helpers = require('../../../lib/helpers'),
   logger = require('../../../lib/logger').logger();

/**
 * Объявление плагина
 * @param {Object} configs все конфигурации для кастомной паковки
 * @param {string} root корень развернутого приложения
 * @returns {stream}
 */
module.exports = function collectPackageJson(applicationRoot, commonBundles, superBundles) {
   return through.obj(
      function onTransform(file, encoding, callback) {
         let currentPackageJson;
         try {
            currentPackageJson = JSON.parse(file.contents);
            const prettyApplicationRoot = helpers.unixifyPath(applicationRoot);
            const configPath = helpers.unixifyPath(file.path).replace(prettyApplicationRoot, '');
            const configsArray = packHelpers.getConfigsFromPackageJson(
               configPath,
               currentPackageJson
            );
            configsArray.forEach((currentConfig) => {
               if (currentConfig.hasOwnProperty('includePackages') && currentConfig.includePackages.length > 0) {
                  superBundles.push(currentConfig);
               } else {
                  commonBundles[helpers.unixifyPath(
                     path.join(path.dirname(file.path), currentConfig.output)
                  )] = currentConfig;
               }
            });
         } catch (err) {
            logger.error({
               message: 'Ошибка парсинга конфигурации для кастомного пакета',
               filePath: file.path
            });
         }
         callback();
      }
   );
};
