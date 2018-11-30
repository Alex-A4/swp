/**
 * Плагин для генерации статических html по *.html.tmpl файлам.
 * @author Бегунов Ал. В.
 */

'use strict';

const through = require('through2'),
   Vinyl = require('vinyl'),
   path = require('path'),
   transliterate = require('../../../lib/transliterate'),
   helpers = require('../../../lib/helpers'),
   logger = require('../../../lib/logger').logger(),
   execInPool = require('../../common/exec-in-pool'),
   buildConfigurationChecker = require('../../../lib/check-build-for-main-modules');

/**
 * Объявление плагина
 * @param {TaskParameters} taskParameters параметры для задач
 * @param {ModuleInfo} moduleInfo информация о модуле
 * @returns {stream}
 */
module.exports = function declarePlugin(taskParameters, moduleInfo) {
   const componentsPropertiesFilePath = path.join(taskParameters.config.cachePath, 'components-properties.json');

   return through.obj(

      /* @this Stream */
      async function onTransform(file, encoding, callback) {
         try {
            if (!file.path.endsWith('.html.tmpl')) {
               callback(null, file);
               return;
            }

            const relativeTmplPath = path.relative(moduleInfo.path, file.history[0]);
            const relativeTmplPathWithModuleName = helpers.prettifyPath(
               path.join(path.basename(moduleInfo.path), relativeTmplPath)
            );
            const servicesPath = `${taskParameters.config.urlDefaultServicePath}service/`;

            const [error, result] = await execInPool(
               taskParameters.pool,
               'buildHtmlTmpl',
               [
                  file.contents.toString(),
                  file.history[0],
                  relativeTmplPathWithModuleName,
                  componentsPropertiesFilePath,
                  taskParameters.config.multiService,
                  servicesPath
               ],
               file.history[0],
               moduleInfo
            );
            if (error) {
               taskParameters.cache.markFileAsFailed(file.history[0]);

               const missedTemplateModules = buildConfigurationChecker.getMissedTemplateModules(
                  ['Controls', 'View'],
                  taskParameters.config.modules
               );

               /**
                * при отсутствии ИМ View и Controls в структуре проекта обязательно ругаемся ошибкой.
                * При билде .html.tmpl данные модули необходимы в обязательном порядке.
                */
               if (missedTemplateModules.length > 0) {
                  const moduleNotExistsError = new Error('В вашем проекте отсутствуют обязательные Интерфейсные модули, ' +
                     `необходимые для компиляции *.html.tmpl:\n${missedTemplateModules}\n` +
                     'Добавьте его в проект из $(SBISPlatformSDK)/ui-modules');

                  logger.error({
                     message: 'Ошибка при обработке html-tmpl шаблона',
                     error: moduleNotExistsError,
                     filePath: file.history[0],
                     moduleInfo
                  });
               } else {
                  logger.error({
                     message: 'Ошибка при обработке html-tmpl шаблона',
                     error,
                     moduleInfo,
                     filePath: file.history[0]
                  });
               }
            } else {
               const outputPath = path.join(moduleInfo.output, transliterate(relativeTmplPath)).replace('.tmpl', '');
               taskParameters.cache.addOutputFile(file.history[0], outputPath, moduleInfo);
               this.push(
                  new Vinyl({
                     base: moduleInfo.output,
                     path: outputPath,
                     contents: Buffer.from(result)
                  })
               );

               moduleInfo.staticTemplates[path.basename(outputPath)] = relativeTmplPathWithModuleName.replace(
                  '.tmpl',
                  ''
               );
            }
         } catch (error) {
            logger.error({ error });
         }
         callback(null, file);
      }
   );
};
