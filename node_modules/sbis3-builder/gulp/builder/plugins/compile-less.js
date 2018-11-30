/**
 * Плагин для компиляции less.
 * @author Бегунов Ал. В.
 */

'use strict';

const through = require('through2'),
   path = require('path'),
   logger = require('../../../lib/logger').logger(),
   transliterate = require('../../../lib/transliterate'),
   execInPool = require('../../common/exec-in-pool'),
   pMap = require('p-map'),
   helpers = require('../../../lib/helpers');

/**
 * Проверяем, необходима ли темизация конкретной lessки по
 * её наличию less в наборе темизируемых less, полученных
 * в процессе анализа зависимостей компонентов
 * @param {Vinyl} currentLessFile
 * @param {Object} moduleInfo
 * @param {Array} moduleThemedStyles - набор темизируемых less
 * @returns {boolean}
 */
function checkLessForThemeInCache(currentLessFile, moduleInfo, moduleThemedStyles) {
   const
      prettyModuleDirectory = helpers.unixifyPath(path.dirname(moduleInfo.path)),
      prettyLessPath = helpers.unixifyPath(currentLessFile.history[0]),
      relativeLessPath = prettyLessPath.replace(`${prettyModuleDirectory}/`, '');

   return moduleThemedStyles.includes(transliterate(relativeLessPath));
}

/**
 * Объявление плагина
 * @param {TaskParameters} taskParameters параметры для задач
 * @param {ModuleInfo} moduleInfo информация о модуле
 * @param {string} sbis3ControlsPath путь до модуля SBIS3.CONTROLS. нужно для поиска тем
 * @param {string[]} pathsForImport пути, в которыи less будет искать импорты. нужно для работы межмодульных импортов.
 * @returns {stream}
 */
module.exports = function declarePlugin(taskParameters, moduleInfo, sbis3ControlsPath, pathsForImport) {
   const getOutput = function(file, replacingExt) {
      const relativePath = path.relative(moduleInfo.path, file.history[0]).replace(/\.less$/, replacingExt);
      return path.join(moduleInfo.output, transliterate(relativePath));
   };

   /**
    * Получаем полный набор темизируемых less в рамках одного Интерфейсного модуля по информации
    * о явных зависимостях компонента.
    * @returns {Array}
    */
   const getThemedStyles = function() {
      const
         componentsInfo = taskParameters.cache.getComponentsInfo(moduleInfo.name),
         result = [];

      Object.keys(componentsInfo).forEach((module) => {
         if (componentsInfo[module].hasOwnProperty('themedStyles')) {
            result.push(...componentsInfo[module].themedStyles);
         }
      });
      return result;
   };
   const moduleLess = [];
   const allThemes = taskParameters.cache.currentStore.styleThemes;
   return through.obj(

      /* @this Stream */
      function onTransform(file, encoding, callback) {
         try {
            let isLangCss = false;

            if (moduleInfo.contents.availableLanguage) {
               const avlLang = Object.keys(moduleInfo.contents.availableLanguage);
               isLangCss = avlLang.includes(file.basename.replace('.less', ''));
               file.isLangCss = isLangCss;
            }

            if (!file.path.endsWith('.less')) {
               callback(null, file);
               return;
            }

            if (file.cached) {
               taskParameters.cache.addOutputFile(file.history[0], getOutput(file, '.css'), moduleInfo);

               if (!isLangCss) {
                  Object.keys(allThemes).forEach((key) => {
                     taskParameters.cache.addOutputFile(file.history[0], getOutput(file, `_${key}.css`), moduleInfo);
                  });
               }

               callback(null, file);
               return;
            }
            moduleLess.push(file);
            callback(null);
         } catch (error) {
            taskParameters.cache.markFileAsFailed(file.history[0]);
            logger.error({
               message: 'Ошибка builder\'а при сборе less-файлов',
               error,
               moduleInfo,
               filePath: file.history[0]
            });
         }
      },

      /* @this Stream */
      async function onFlush(callback) {
         const moduleThemedStyles = getThemedStyles();
         await pMap(
            moduleLess,
            async(currentLessFile) => {
               try {
                  const isThemedLess = checkLessForThemeInCache(currentLessFile, moduleInfo, moduleThemedStyles);
                  const [error, results] = await execInPool(
                     taskParameters.pool,
                     'buildLess',
                     [
                        currentLessFile.history[0],
                        currentLessFile.contents.toString(),
                        moduleInfo.path,
                        sbis3ControlsPath,
                        pathsForImport,
                        currentLessFile.isLangCss || !isThemedLess,
                        allThemes
                     ],
                     currentLessFile.history[0],
                     moduleInfo
                  );

                  /**
                   * нужно выводить ошибку из пулла, это будет означать неотловленную ошибку,
                   * и она не будет связана с ошибкой компиляции непосредственно less-файла.
                   */
                  if (error) {
                     taskParameters.cache.markFileAsFailed(currentLessFile.history[0]);
                     logger.error({
                        message: 'Необработанная ошибка builder\'а при компиляции less',
                        error,
                        moduleInfo,
                        filePath: currentLessFile.history[0]
                     });
                  } else {
                     for (const result of results) {
                        if (result.ignoreMessage) {
                           logger.debug(result.ignoreMessage);
                        } else if (result.error) {
                           logger.error({
                              message: `Ошибка компиляции less: ${result.error}`,
                              filePath: currentLessFile.history[0],
                              moduleInfo
                           });
                        } else {
                           const { compiled } = result;
                           const outputPath = getOutput(currentLessFile, compiled.defaultTheme ? '.css' : `_${compiled.nameTheme}.css`);

                           taskParameters.cache.addOutputFile(currentLessFile.history[0], outputPath, moduleInfo);
                           taskParameters.cache.addDependencies(currentLessFile.history[0], compiled.imports);

                           const newFile = currentLessFile.clone();
                           newFile.contents = Buffer.from(compiled.text);
                           newFile.path = outputPath;
                           newFile.base = moduleInfo.output;
                           this.push(newFile);
                        }
                     }
                  }
               } catch (error) {
                  taskParameters.cache.markFileAsFailed(currentLessFile.history[0]);
                  logger.error({
                     message: 'Ошибка builder\'а при компиляции less',
                     error,
                     moduleInfo,
                     filePath: currentLessFile.history[0]
                  });
               }
               this.push(currentLessFile);
            },
            {
               concurrency: 20
            }
         );
         callback(null);
      }
   );
};
