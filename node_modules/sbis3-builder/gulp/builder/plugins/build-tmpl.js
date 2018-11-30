/* eslint-disable no-invalid-this */

/**
 * Плагин для компиляции xml из *.tmpl файлов в js.
 * В debug (при локализации) заменяет оригинальный файл.
 * В release создаёт новый файл *.min.tmpl.
 * @author Бегунов Ал. В.
 */

'use strict';

const through = require('through2'),
   path = require('path'),
   Vinyl = require('vinyl'),
   logger = require('../../../lib/logger').logger(),
   transliterate = require('../../../lib/transliterate'),
   execInPool = require('../../common/exec-in-pool'),
   buildConfigurationChecker = require('../../../lib/check-build-for-main-modules'),
   templateExtReg = /(\.tmpl|\.wml)$/;

/**
 * Объявление плагина
 * @param {TaskParameters} taskParameters параметры для задач
 * @param {ModuleInfo} moduleInfo информация о модуле
 * @returns {stream}
 */
module.exports = function declarePlugin(taskParameters, moduleInfo) {
   const componentsPropertiesFilePath = path.join(taskParameters.config.cachePath, 'components-properties.json');

   return through.obj(async function onTransform(file, encoding, callback) {
      try {
         if (!['.tmpl', '.wml'].includes(file.extname)) {
            callback(null, file);
            return;
         }
         let outputMinFile = '';
         if (taskParameters.config.isReleaseMode) {
            const relativePath = path.relative(moduleInfo.path, file.history[0]).replace(templateExtReg, '.min$1');
            outputMinFile = path.join(moduleInfo.output, transliterate(relativePath));
         }
         if (file.cached) {
            if (outputMinFile) {
               taskParameters.cache.addOutputFile(file.history[0], outputMinFile, moduleInfo);
            }
            callback(null, file);
            return;
         }

         // если tmpl не возможно скомпилировать, то запишем оригинал
         let newText = file.contents.toString();
         let relativeFilePath = path.relative(moduleInfo.path, file.history[0]);
         relativeFilePath = path.join(path.basename(moduleInfo.path), relativeFilePath);

         const [error, result] = await execInPool(
            taskParameters.pool,
            'buildTmpl',
            [newText, relativeFilePath, componentsPropertiesFilePath, file.extname.slice(1, file.extname.length)],
            relativeFilePath,
            moduleInfo
         );
         if (error) {
            taskParameters.cache.markFileAsFailed(file.history[0]);
            const missedTemplateModules = buildConfigurationChecker.getMissedTemplateModules(
               ['View'],
               taskParameters.config.modules
            );

            /**
             * при отсутствии ИМ View в структуре проекта обязательно ругаемся ошибкой.
             * При билде .tmpl данный модуль необходим в обязательном порядке.
             */
            if (missedTemplateModules.length > 0) {
               const moduleNotExistsError = new Error('В вашем проекте отсутствуют обязательные Интерфейсные модули, ' +
                  `необходимые для компиляции *.tmpl:\n${missedTemplateModules}\n` +
                  'Добавьте его в проект из $(SBISPlatformSDK)/ui-modules');

               logger.error({
                  message: 'Ошибка компиляции TMPL',
                  error: moduleNotExistsError,
                  filePath: file.history[0],
                  moduleInfo
               });
            } else {
               logger.error({
                  message: 'Ошибка компиляции TMPL',
                  error,
                  moduleInfo,
                  filePath: relativeFilePath
               });
            }
         } else {
            /**
             * запишем в markupCache информацию о версионировании, поскольку
             * markupCache извлекаем при паковке собственных зависимостей. Так
             * можно легко обьединить, помечать компонент как версионированный или нет.
             */
            if (file.versioned) {
               result.versioned = true;
            }
            taskParameters.cache.storeBuildedMarkup(file.history[0], moduleInfo.name, result);
            newText = result.text;

            if (taskParameters.config.isReleaseMode) {
               // если tmpl/wml невозможно минифицировать, то запишем оригинал

               const [errorUglify, obj] = await execInPool(
                  taskParameters.pool,
                  'uglifyJs',
                  [file.path, newText, true],
                  relativeFilePath.replace(templateExtReg, '.min$1'),
                  moduleInfo
               );
               if (errorUglify) {
                  taskParameters.cache.markFileAsFailed(file.history[0]);

                  /**
                   * ошибку uglify-js возвращает в виде объекта с 2мя свойствами:
                   * 1)message - простое сообщение ошибки.
                   * 2)stack - сообщение об ошибке + стек вызовов.
                   * Воспользуемся для вывода вторым.
                   */
                  logger.error({
                     message: `Ошибка минификации скомпилированного TMPL: ${errorUglify.stack}`,
                     moduleInfo,
                     filePath: relativeFilePath.replace(templateExtReg, '.min$1')
                  });
               } else {
                  newText = obj.code;
               }
            }
         }

         if (outputMinFile) {
            if (file.versioned) {
               taskParameters.cache.storeVersionedModule(file.history[0], moduleInfo.name, outputMinFile);
               file.versioned = false;
            }
            this.push(
               new Vinyl({
                  base: moduleInfo.output,
                  path: outputMinFile,
                  contents: Buffer.from(newText),
                  history: [...file.history]
               })
            );
            taskParameters.cache.addOutputFile(file.history[0], outputMinFile, moduleInfo);
         } else {
            file.contents = Buffer.from(newText);
         }
      } catch (error) {
         taskParameters.cache.markFileAsFailed(file.history[0]);
         logger.error({
            message: "Ошибка builder'а при компиляции TMPL",
            error,
            moduleInfo,
            filePath: file.path
         });
      }
      callback(null, file);
   });
};
