/* eslint-disable no-sync */
'use strict';

const path = require('path');
const fs = require('fs-extra');
const loaders = require('./loaders');
const getMeta = require('./get-dependency-meta');
const packerDictionary = require('../tasks/lib/pack-dictionary');
const logger = require('../../lib/logger').logger();
const pMap = require('p-map');
const dblSlashes = /\\/g,
   CDN = /\/?cdn\//;

const langRe = /lang\/([a-z]{2}-[A-Z]{2})/;

/**
 * Get loader
 * @param {String} type - loader type
 * @return {*|baseTextLoader}
 */
function getLoader(type) {
   return loaders[type] || loaders.default;
}

/**
 * Правильное копирование файлов
 * @param {String} source - откуда
 * @param {String} target - куда
 * @param {Function} cb - callback
 */
function copyFile(source, target, cb) {
   let cbCalled = false;

   const rd = fs.createReadStream(source);
   rd.on('error', (err) => {
      done(err);
   });
   const wr = fs.createWriteStream(target);
   wr.on('error', (err) => {
      done(err);
   });
   wr.on('close', () => {
      done();
   });
   rd.pipe(wr);

   function done(err) {
      if (!cbCalled) {
         cb(err);
         cbCalled = true;
      }
   }
}

/**
 * Подготавливает метаданные модулей графа
 * @param {DepGraph} dg
 * @param {Array} orderQueue - развернутый граф
 * @param {String} applicationRoot - полный путь до корня сервиса
 * @return {Array}
 */
function prepareOrderQueue(dg, orderQueue, applicationRoot) {
   const cssFromCDN = /css!\/cdn\//;
   return orderQueue
      .filter((dep) => {
         if (dep.path) {
            return !CDN.test(dep.path.replace(dblSlashes, '/'));
         }
         if (dep.module) {
            return !cssFromCDN.test(dep.module);
         }
         return true;
      })
      .map(function parseModule(dep) {
         const meta = getMeta(dep.module);
         if (meta.plugin === 'is') {
            if (meta.moduleYes) {
               meta.moduleYes.fullPath = dg.getNodeMeta(meta.moduleYes.fullName).path || '';
               meta.moduleYes.amd = dg.getNodeMeta(meta.moduleYes.fullName).amd;
            }
            if (meta.moduleNo) {
               meta.moduleNo.fullPath = dg.getNodeMeta(meta.moduleNo.fullName).path || '';
               meta.moduleNo.amd = dg.getNodeMeta(meta.moduleNo.fullName).amd;
            }
         } else if ((meta.plugin === 'browser' || meta.plugin === 'optional') && meta.moduleIn) {
            meta.moduleIn.fullPath = dg.getNodeMeta(meta.moduleIn.fullName).path || '';
            meta.moduleIn.amd = dg.getNodeMeta(meta.moduleIn.fullName).amd;
         } else if (meta.plugin === 'i18n') {
            meta.fullPath = dg.getNodeMeta(meta.fullName).path || dep.path || '';
            meta.amd = dg.getNodeMeta(meta.fullName).amd;
            meta.deps = dg.getDependenciesFor(meta.fullName);
         } else {
            meta.fullPath = dg.getNodeMeta(meta.fullName).path || dep.path || '';
            meta.amd = dg.getNodeMeta(meta.fullName).amd;
         }
         return meta;
      })
      .filter((module) => {
         if (module.plugin === 'is') {
            if (module.moduleYes && !module.moduleYes.fullPath) {
               logger.debug(`Empty file name: ${module.moduleYes.fullName}`);
               return false;
            }
            if (module.moduleNo && !module.moduleNo.fullPath) {
               logger.debug(`Empty file name: ${module.moduleNo.fullName}`);
               return false;
            }
         } else if (module.plugin === 'browser' || module.plugin === 'optional') {
            if (module.moduleIn && !module.moduleIn.fullPath) {
               logger.debug(`Empty file name: ${module.moduleIn.fullName}`);
               return false;
            }
         } else if (!module.fullPath) {
            logger.debug(`Empty file name: ${module.fullName}`);
            return false;
         }
         return true;
      })
      .map(function addApplicationRoot(module) {
         if (module.plugin === 'is') {
            if (module.moduleYes) {
               module.moduleYes.fullPath = path
                  .join(applicationRoot, module.moduleYes.fullPath)
                  .replace(dblSlashes, '/');
            }
            if (module.moduleNo) {
               module.moduleNo.fullPath = path.join(applicationRoot, module.moduleNo.fullPath).replace(dblSlashes, '/');
            }
         } else if ((module.plugin === 'browser' || module.plugin === 'optional') && module.moduleIn) {
            module.moduleIn.fullPath = path.join(applicationRoot, module.moduleIn.fullPath).replace(dblSlashes, '/');
         } else {
            module.fullPath = path.join(applicationRoot, module.fullPath).replace(dblSlashes, '/');
         }
         return module;
      })
      .map(function excludePackOwnsDependencies(module) {
         function originalPath(filePath) {
            return filePath.replace(/(\.js)$/, '.original$1');
         }

         if (module.plugin === 'is') {
            if (
               module.moduleYes &&
               module.moduleYes.plugin === 'js' &&
               fs.existsSync(originalPath(module.moduleYes.fullPath))
            ) {
               module.moduleYes.fullPath = originalPath(module.moduleYes.fullPath);
            }
            if (
               module.moduleNo &&
               module.moduleNo.plugin === 'js' &&
               fs.existsSync(originalPath(module.moduleNo.fullPath))
            ) {
               module.moduleNo.fullPath = originalPath(module.moduleNo.fullPath);
            }
         } else if (module.plugin === 'browser' || module.plugin === 'optional') {
            if (
               module.moduleIn &&
               module.moduleIn.plugin === 'js' &&
               fs.existsSync(originalPath(module.moduleIn.fullPath))
            ) {
               module.moduleIn.fullPath = originalPath(module.moduleIn.fullPath);
            }
         } else if (module.plugin === 'js' && fs.existsSync(originalPath(module.fullPath))) {
            module.fullPath = originalPath(module.fullPath);
         }
         return module;
      });
}

/**
 * Разбивает массив зависмостей на объект с js, css, dict и cssForLocale
 * @param {Array} orderQueue - развернутый граф
 * @return {{js: Array, css: Array, dict: Object, cssForLocale: Object}}
 */
function prepareResultQueue(orderQueue, applicationRoot, availableLanguage) {
   const pack = orderQueue.reduce(
      (memo, module) => {
         if (module.plugin === 'is') {
            if (!memo.paths[module.moduleYes.fullPath]) {
               if (module.moduleYes && module.moduleYes.plugin === 'css') {
                  memo.css.push(module.moduleYes);
               } else {
                  memo.js.push(module);
               }
               if (module.moduleYes) {
                  memo.paths[module.moduleYes.fullPath] = true;
               }
               if (module.moduleNo) {
                  memo.paths[module.moduleNo.fullPath] = true;
               }
            }
         } else if (module.plugin === 'browser' || module.plugin === 'optional') {
            if (!memo.paths[module.moduleIn.fullPath]) {
               if (module.moduleIn && module.moduleIn.plugin === 'css') {
                  memo.css.push(module.moduleIn);
               } else {
                  memo.js.push(module);
               }
               if (module.moduleIn) {
                  memo.paths[module.moduleIn.fullPath] = true;
               }
            }
         } else if (!memo.paths[module.fullPath]) {
            if (module.plugin === 'css') {
               memo.css.push(module);
            } else {
               const matchLangArray = module.fullName.match(langRe);

               /* if (matchLangArray !== null && (module.plugin === 'text' || module.plugin === 'js')) {
                        var locale = matchLangArray[1];
                        (memo.dict[locale] ? memo.dict[locale]: memo.dict[locale] = []).push(module);
                        //в итоге получится memo.dict = {'en-US': [modules], 'ru-RU': [modules], ...}
                    }
                    else */
               if (matchLangArray !== null && module.plugin === 'native-css') {
                  const locale = matchLangArray[1];
                  (memo.cssForLocale[locale] ? memo.cssForLocale[locale] : (memo.cssForLocale[locale] = [])).push(
                     module
                  );

                  // в итоге получится memo.cssForLocale = {'en-US': [modules], 'ru-RU': [modules], ...}
                  // только теперь для css-ок
               } else {
                  memo.js.push(module);
               }
            }
            memo.paths[module.fullPath] = true;
         }
         return memo;
      },
      {
         css: [],
         js: [],
         dict: {},
         cssForLocale: {},
         paths: {}
      }
   );

   // Удалим все модули локализации добавленные жёсткими зависимостями от i18n.
   pack.js = packerDictionary.deleteModulesLocalization(pack.js);

   // Запакуем словари.
   pack.dict = packerDictionary.packerDictionary(pack.js, applicationRoot, availableLanguage);

   return pack;
}

/**
 * Тот же загрузчик модулей, что использует callback,
 * но зато могёт с промисами
 * @param loader
 * @param module
 * @param base
 * @param availableLanguage
 * @param themeName
 * @returns {Promise<any>}
 */
function promisifyLoader(
   loader,
   module,
   base,
   themeName,
   languageConfig,
   isGulp,
   root,
   application
) {
   return new Promise((resolve, reject) => {
      loader(
         module,
         base,
         (err, result) => {
            if (err) {
               return reject(err);
            }
            return resolve(result);
         },
         themeName,
         languageConfig,
         isGulp,
         root,
         application
      );
   });
}

/**
 * @callback limitingNativePackFiles~callback
 * @param {Error} error
 * @param {String} [result]
 */
/**
 * Просто собирает указанные файлы в один большой кусок текста
 * @param {Array} filesToPack - модули для паковки
 * @param {Number} limit - лимит операций
 * @param {String} base - полный путь до папки с пакетами
 * Относительно этой папки будут высчитаны новые пути в ссылках
 * @param {nativePackFiles~callback} done
 */
async function limitingNativePackFiles(
   packageConfig,
   root,
   application,
   taskParameters,
   isGulp
) {
   const
      filesToPack = packageConfig.orderQueue,
      availableLanguage = taskParameters.config.localizations,
      defaultLanguage = taskParameters.config.defaultLocalization,
      currentVersionedModules = taskParameters.versionedModules[packageConfig.moduleName],
      result = {};

   if (filesToPack && filesToPack.length) {
      const base = path.join(root, application);

      await pMap(
         filesToPack,
         async(module) => {
            const extReg = new RegExp(`\\.${module.moduleYes ? module.moduleYes.plugin : module.plugin}(\\.min)?\\.js$`);
            let { fullPath } = module;
            if (!fullPath) {
               fullPath = module.moduleYes ? module.moduleYes.fullPath : null;
            }

            /**
             * Костыль для правильной загрузки модулей, в которых нету плагина js,
             * но которые используют точки в конце имени модуля(например это .compatible)
             */
            if (fullPath && fullPath.match(extReg)) {
               if (module.moduleYes) {
                  module.moduleYes.plugin = 'js';
               } else {
                  module.plugin = 'js';
               }
            }

            try {
               result[module.fullName] = await promisifyLoader(
                  getLoader(module.plugin),
                  module,
                  base,
                  null,
                  {
                     availableLanguage,
                     defaultLanguage
                  },
                  isGulp,
                  root,
                  application
               );
               const jsIsPackageOutput = module.fullPath === packageConfig.outputFile;

               /**
                * Мы не должны удалять модуль, если в него будет записан результат паковки.
                */
               if (!taskParameters.config.sources && fullPath && !jsIsPackageOutput) {
                  taskParameters.filesToRemove.push(fullPath);

                  /**
                   * Из версионирования надо удалить информацию о файлах, которые
                   * будут удалены при оптимизации дистрибутива.
                   * @type {Array}
                   */
                  const removeFromVersioned = [];
                  currentVersionedModules.forEach((versionedModule) => {
                     if (module.fullPath.endsWith(versionedModule)) {
                        removeFromVersioned.push(versionedModule);
                     }
                  });
                  removeFromVersioned.forEach((moduleToRemove) => {
                     const moduleIndex = currentVersionedModules.indexOf(moduleToRemove);
                     currentVersionedModules.splice(moduleIndex, 1);
                  });
               }
            } catch (error) {
               logger.warning({
                  message: 'Ошибка при чтении файла во время кастомной паковки',
                  filePath: fullPath,
                  error
               });
            }
         },
         {
            concurrency: 10
         }
      );
   }
   return result;
}

module.exports = {
   prepareOrderQueue,
   prepareResultQueue,
   limitingNativePackFiles,
   getLoader,
   promisifyLoader,
   copyFile
};
