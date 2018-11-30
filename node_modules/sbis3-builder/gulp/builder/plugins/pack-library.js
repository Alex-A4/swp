/**
 * Плагин для паковки приватных частей библиотеки.
 * Приватная часть библиотеки - AMD-модуль, в начале имени
 * которого присутствует символ "_" или расположенных в
 * поддиректории папки, имя которой начинается с "_"
 * @author Колбешин Ф.А.
 */

'use strict';

const through = require('through2'),
   path = require('path'),
   logger = require('../../../lib/logger').logger(),
   libPackHelpers = require('../../../lib/pack/helpers/librarypack'),
   { packCurrentLibrary } = require('../../../lib/pack/library-packer'),
   pMap = require('p-map'),
   helpers = require('../../../lib/helpers'),
   esExt = /\.(es|ts)$/;

/**
 * Возвращает путь до исходного ES файла для анализируемой зависимости.
 * @param {string} sourceRoot - корень UI-исходников
 * @param {array<string>} privateModulesCache - кэш из taskParameters.cache для приватных модулей
 * @param {string} moduleName - имя анализируемой зависимости
 * @returns {string}
 */
function getSourcePathByModuleName(sourceRoot, privateModulesCache, moduleName) {
   let result = null;
   Object.keys(privateModulesCache).forEach((cacheName) => {
      if (privateModulesCache[cacheName].moduleName === moduleName) {
         result = cacheName;
      }
   });

   /**
    * если не нашли исходник для приватной зависимости в esModulesCache,
    * значит приватная зависимость - это js-модуль в ES5 формате.
    */
   if (!result) {
      result = `${path.join(sourceRoot, moduleName)}.js`;
   }
   return result;
}

/**
 * Объявление плагина
 * @param {TaskParameters} taskParameters параметры для задач
 * @param {ModuleInfo} moduleInfo информация о модуле
 * @returns {stream}
 */
module.exports = function declarePlugin(taskParameters, moduleInfo) {
   const libraries = [];
   return through.obj(

      /* @this Stream */
      function onTransform(file, encoding, callback) {
         if (
            file.extname === '.js' &&
            esExt.test(file.history[0]) &&
            !libPackHelpers.isPrivate(path.relative(moduleInfo.output, file.path))
         ) {
            libraries.push(file);
            callback();
         } else {
            callback(null, file);
         }
      },

      /* @this Stream */
      async function onFlush(callback) {
         const
            privatePartsCache = taskParameters.cache.getCompiledEsModuleCache(moduleInfo.name),
            sourceRoot = moduleInfo.path.replace(moduleInfo.name, '');
         await pMap(
            libraries,
            async(library) => {
               const privatePartsForCache = [];
               let result;
               try {
                  result = await packCurrentLibrary(
                     sourceRoot,
                     privatePartsForCache,
                     library.contents.toString(),
                     privatePartsCache
                  );
                  library.modulepack = result.compiled;

                  /**
                   * Для запакованных библиотек нужно обновить информацию в кэше о
                   * зависимостях, чтобы при создании module-dependencies учитывалась
                   * информация о запакованных библиотеках и приватные модули из
                   * библиотек не вставлялись при Серверном рендеринге на VDOM
                   * @type {string}
                   */
                  const
                     prettyPath = helpers.unixifyPath(library.history[0]),
                     prettyCompiledPath = prettyPath.replace(/\.(ts|es)$/, '.js'),
                     currentModuleStore = taskParameters.cache.currentStore.modulesCache[moduleInfo.name];

                  if (result.newDependencies) {
                     if (currentModuleStore.componentsInfo[prettyPath]) {
                        currentModuleStore.componentsInfo[prettyPath].componentDep = result.newDependencies;
                     }
                     if (currentModuleStore.componentsInfo[prettyCompiledPath]) {
                        currentModuleStore.componentsInfo[prettyCompiledPath].componentDep = result.newDependencies;
                     }
                  }
               } catch (error) {
                  logger.error({
                     message: 'Ошибка при паковке библиотеки',
                     error,
                     filePath: library.history[0]
                  });
               }
               if (privatePartsForCache.length > 0) {
                  taskParameters.cache.addDependencies(library.history[0], privatePartsForCache.map(
                     dependency => getSourcePathByModuleName(sourceRoot, privatePartsCache, dependency)
                  ));
               }
               this.push(library);
            },
            {
               concurrency: 10
            }
         );
         callback(null);
      }
   );
};
