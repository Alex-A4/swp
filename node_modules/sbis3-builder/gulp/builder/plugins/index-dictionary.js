/**
 * Плагин для обработки ресурсов локализации (словари и стили).
 * Если есть ресурсы локализации, то нужно записать <локаль>.js файл
 * в папку "lang/<локаль>" и занести данные в contents.json
 * Объединеям стили локализации в единый файл "lang/<локаль>/<локаль>.css".
 * Стили локализации могут быть в less.
 * @author Бегунов Ал. В.
 */

'use strict';

const through = require('through2'),
   Vinyl = require('vinyl'),
   path = require('path'),
   logger = require('../../../lib/logger').logger(),
   DictionaryIndexer = require('../../../lib/i18n/dictionary-indexer');

/**
 * Объявление плагина
 * @param {TaskParameters} taskParameters параметры для задач
 * @param {ModuleInfo} moduleInfo информация о модуле
 * @returns {stream}
 */
module.exports = function declarePlugin(taskParameters, moduleInfo) {
   const indexer = new DictionaryIndexer(taskParameters.config.localizations);
   return through.obj(
      function onTransform(file, encoding, callback) {
         try {
            // нам нужны только css и json локализации
            const locale = file.stem;
            if ((file.extname !== '.json' && file.extname !== '.css') || !taskParameters.config.localizations.includes(locale)) {
               callback(null, file);
               return;
            }
            if (file.extname === '.json') {
               indexer.addLocalizationJson(moduleInfo.path, file.path, locale);
            } else if (file.extname === '.css') {
               indexer.addLocalizationCSS(moduleInfo.path, file.path, locale, file.contents.toString());
            }
         } catch (error) {
            logger.error({
               message: "Ошибка Builder'а",
               error,
               moduleInfo,
               filePath: file.path
            });
         }
         callback(null, file);
      },

      /* @this Stream */
      function onFlush(callback) {
         try {
            for (const locale of taskParameters.config.localizations) {
               const mergedCSSCode = indexer.extractMergedCSSCode(moduleInfo.output, locale);
               if (mergedCSSCode) {
                  const mergedCSSPath = path.join(moduleInfo.output, 'lang', locale, `${locale}.css`);
                  this.push(
                     new Vinyl({
                        base: moduleInfo.output,
                        path: mergedCSSPath,
                        contents: Buffer.from(mergedCSSCode),
                        unitedDict: true
                     })
                  );
               }

               const loaderCode = indexer.extractLoaderCode(moduleInfo.output, locale);
               if (loaderCode) {
                  const loaderPath = path.join(moduleInfo.output, 'lang', locale, `${locale}.js`);
                  this.push(
                     new Vinyl({
                        base: moduleInfo.output,
                        path: loaderPath,
                        contents: Buffer.from(loaderCode),
                        unitedDict: true
                     })
                  );
               }
            }
            const dictList = indexer.getDictionaryForContents();
            if (dictList.length) {
               moduleInfo.contents.modules[moduleInfo.runtimeModuleName].dict = dictList;
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
