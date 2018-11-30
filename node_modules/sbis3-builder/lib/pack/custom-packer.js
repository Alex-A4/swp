'use strict';

const commonPackage = require('../../packer/lib/common-package'),
   fs = require('fs-extra'),
   logger = require('../../lib/logger').logger(),
   packerDictionary = require('../../packer/tasks/lib/pack-dictionary'),
   packHelpers = require('./helpers/custompack'),
   path = require('path'),
   pMap = require('p-map'),
   helpers = require('../../lib/helpers'),
   cssHelpers = require('../../packer/lib/css-helpers'),
   builderConstants = require('../../lib/builder-constants');

async function rebaseCSS(css, appRoot, urlServicePath, isGulp) {
   if (await fs.pathExists(css)) {
      const content = await fs.readFile(css);

      /**
       * для гальп нам надо ещё сформировать resourceRoot, поскольку в гальпе
       * относительный путь всегда формируется относительно интерфейсного модуля.
       * В гранте он формировался относительно корня приложения(именно приложения
       * а не сервиса)
       */
      let resourceRoot;
      if (isGulp) {
         resourceRoot = `${path.join(urlServicePath, 'resources/')}`;
      } else {
         resourceRoot = '/';
      }
      return cssHelpers.rebaseUrls(appRoot, css, content.toString(), resourceRoot);
   }
   return '';
}

async function customPackCSS(files, root, application, isGulp) {
   const results = await pMap(
      files,
      async(css) => {
         const result = await rebaseCSS(css, root, application, isGulp);
         return result;
      },
      {
         concurrency: 10
      }
   );

   return cssHelpers.bumpImportsUp(results.join('\n'));
}

async function writeCustomPackage(
   packageConfig,
   root,
   application,
   splittedCore,
   taskParameters,
   isGulp
) {
   const
      currentFileExists = await fs.pathExists(packageConfig.outputFile),
      originalFileExists = await fs.pathExists(packHelpers.originalPath(packageConfig.outputFile));

   // Не будем портить оригинальный файл.
   if (currentFileExists && !originalFileExists) {
      await fs.copy(packageConfig.outputFile, packHelpers.originalPath(packageConfig.outputFile));
   }

   const modulesContent = await commonPackage.limitingNativePackFiles(
      packageConfig,
      root,
      application,
      taskParameters,
      isGulp
   );

   /**
    * Отсортируем контент модулей по именам модулей,
    * чтобы между двумя дистрами не было разницы в случае
    * одинакового набора модулей пакета.
    * @type {string[]}
    */
   const listOfModules = Object.keys(modulesContent).sort();
   const result = [];
   if (listOfModules.length > 0) {
      listOfModules.forEach((currentModule) => {
         result.push(modulesContent[currentModule]);
      });
   }
   if (packageConfig.cssModulesFromOrderQueue.length > 0) {
      result.unshift(
         packHelpers.generateLinkForCss(packageConfig.cssModulesFromOrderQueue, packageConfig.packagePath, splittedCore)
      );
   } else if (listOfModules.length === 0) {
      /**
       * если в качестве результата нам вернулась пустая строка и при этом
       * полностью отсутствуют стили на запись в кастомный пакет, значит,
       * скорее всего, создатели неправильно описали правила паковки
       */
      throw new Error('В ваш пакет ничего не запаковалось, проверьте правильность описания правил паковки в package.json файле');
   }

   /**
    * теперь на использование флага optimized будем ругаться предупреждениями, поскольку
    * в рамках перехода на библиотеки данный флаг не нужен
    */
   if (packageConfig.optimized) {
      logger.warning({
         message: 'Использование неразрешённой опции optimized в конфигурации кастомной паковки. ' +
            'Пакет будет сохранён по стандартной схеме',
         filePath: packageConfig.path
      });
   }
   await fs.outputFile(
      packageConfig.outputFile,
      result ? result.reduce((res, modContent) => res + (res ? '\n' : '') + modContent) : ''
   );
}

/**
 * Разбивает набор cssок по темам в соответствии с постфиксом _{themeName}
 * @param{Array} cssModules - набор css
 * @returns{Object} themeName: listOfCss
 */
function splitCssByThemes(cssModules, cssCurrentTheme) {
   const result = {};
   cssModules.forEach((module) => {
      const
         moduleName = module.moduleYes ? module.moduleYes.fullName : module.fullName,
         cssNameParts = moduleName.split('/').pop().split('_');

      let themeName = '';
      if (cssNameParts.length > 1) {
         themeName = cssNameParts.pop();
      }
      module.currentTheme = themeName;
      cssCurrentTheme[moduleName] = themeName;
      if (!result.hasOwnProperty(themeName)) {
         result[themeName] = [module];
      } else {
         result[themeName].push(module);
      }
   });
   return result;
}

async function generateCustomPackage(
   depsTree,
   root,
   application,
   packageConfig,
   isSplittedCore,
   isGulp,
   taskParameters
) {
   const
      availableLanguage = taskParameters.config.localizations,
      applicationRoot = path.join(root, application),
      outputFile = packHelpers.getOutputFile(packageConfig, applicationRoot, depsTree, isSplittedCore),
      packagePath = packHelpers.getBundlePath(outputFile, applicationRoot, isSplittedCore ? 'resources/WS.Core' : 'ws'),
      bundlePath = isGulp ? `resources${packagePath[0] !== '/' ? '/' : ''}${packagePath}` : packagePath,
      pathToCustomCSS = outputFile.replace(/(\.package)?(\.min)?\.js$/, ''),
      cssExtIncludesPackage = outputFile.replace(/(\.min)?\.js$/, '').endsWith('.package'),
      result = {
         bundles: {},
         bundlesRoute: {},
         excludedCSS: {}
      },
      cssCurrentTheme = {},
      excludedCSS = {};

   let cssModulesFromOrderQueue = [],
      orderQueue;

   if (packageConfig.isBadConfig) {
      throw new Error('Конфиг для кастомного пакета должен содержать опцию include для нового вида паковки.');
   }

   orderQueue = packHelpers.getOrderQueue(depsTree, packageConfig, excludedCSS, applicationRoot).filter((node) => {
      /**
       * Для обычных пакетов произведём фильтрацию тех модулей, что уже
       * записаны в приоритетных пакетах
       */
      if (node.plugin === 'js' || node.plugin === 'tmpl' || node.plugin === 'html') {
         return node.amd;
      }
      if (node.fullName.includes('css!')) {
         cssModulesFromOrderQueue.push(node);
         return false;
      }
      return true;
   });

   /**
    * создадим мета-данные для модуля, если этого не было сделано в рамках
    * Инкрементальной сборки. Нужно включать все безусловно, в пакетах могут
    * быть запакованы шаблоны с версионированием.
    */
   const moduleName = packagePath.split('/')[0];
   if (!taskParameters.versionedModules[moduleName]) {
      taskParameters.versionedModules[moduleName] = [];
   }
   taskParameters.versionedModules[moduleName].push(`${packagePath}.js`);
   packageConfig.moduleName = moduleName;

   /**
    * пишем все стили по пути кастомного пакета в css-файл.
    */
   cssModulesFromOrderQueue = commonPackage.prepareResultQueue(
      cssModulesFromOrderQueue,
      applicationRoot,
      availableLanguage
   );
   if (cssModulesFromOrderQueue.css.length > 0) {
      const
         splittedCssByThemes = splitCssByThemes(cssModulesFromOrderQueue.css, cssCurrentTheme),
         currentVersionedModules = taskParameters.versionedModules[moduleName];

      await pMap(
         Object.keys(splittedCssByThemes),
         async(themeName) => {
            const cssRes = await customPackCSS(
               splittedCssByThemes[themeName]
                  .map(function onlyPath(module) {
                     const cssIsPackageOutput = module.fullPath === outputFile.replace(/\.js$/, '.css');

                     /**
                      * Мы не должны удалять модуль, если в него будет записан результат паковки.
                      */
                     if (!taskParameters.config.sources && !cssIsPackageOutput) {
                        taskParameters.filesToRemove.push(module.fullPath);

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
                     return module.fullPath;
                  }),
               root,
               application,
               isGulp
            );
            await fs.outputFile(
               `${pathToCustomCSS}${themeName ? `_${themeName}` : ''}` +
               `${cssExtIncludesPackage ? '.package' : ''}${isSplittedCore ? '.min.css' : '.css'}`,
               cssRes
            );

            /**
             * создадим мета-данные для модуля, если этого не было сделано в рамках
             * Инкрементальной сборки
             */
            if (!taskParameters.versionedModules[moduleName]) {
               taskParameters.versionedModules[moduleName] = [];
            }
            taskParameters.versionedModules[moduleName].push(`${packagePath}.css`);
         },
         {
            concurrency: 10
         }
      );
   }

   /**
    * Чистим всю локализацию до формирования bundles и bundlesRoute
    * @type {Array}
    */
   orderQueue = packerDictionary.deleteModulesLocalization(orderQueue);
   if (packageConfig.platformPackage || !packageConfig.includeCore) {
      const cssBundlePath = pathToCustomCSS.replace(helpers.unixifyPath(applicationRoot), '');
      result.bundles[bundlePath] = (await packHelpers.generateBundle(
         orderQueue,
         cssModulesFromOrderQueue.css,
         isSplittedCore
      )).sort();
      result.bundlesRoute = packHelpers.generateBundlesRouting(
         result.bundles[bundlePath],
         bundlePath,
         {
            cssExtIncludesPackage,
            cssBundlePath,
            excludedCSS,
            cssCurrentTheme
         }
      );
   }

   packageConfig.orderQueue = await packerDictionary.packerCustomDictionary(
      orderQueue,
      applicationRoot,
      depsTree,
      availableLanguage,
      isGulp
   );
   packageConfig.outputFile = outputFile;
   packageConfig.packagePath = packagePath;
   packageConfig.cssModulesFromOrderQueue = cssModulesFromOrderQueue.css;
   result.output = packageConfig.outputFile;

   result.excludedCSS = excludedCSS;
   await writeCustomPackage(
      packageConfig,
      root,
      application,
      isSplittedCore,
      taskParameters,
      isGulp
   );
   return result;
}

/**
 * Сортируем объект по его ключам
 * @param currentObject
 */
function sortObjectByKeys(currentObject) {
   const result = {};
   Object.keys(currentObject).sort().forEach((currentProperty) => {
      result[currentProperty] = currentObject[currentProperty];
   });
   return result;
}

/**
 * Функция, которая сплитит результат работы таски custompack в секции bundles
 */
async function saveBundlesForEachModule(taskParameters, applicationRoot, result) {
   /**
    * Сделаем список json на запись, нам надо защититься от параллельной перезаписи
    */
   const jsonToWrite = {};
   await pMap(
      Object.keys(result.bundles),
      async(currentBundle) => {
         const intModuleName = currentBundle.match(/^resources\/([^/]+)/)[1],
            currentModules = result.bundles[currentBundle];

         const
            bundlesRoutePath = path.normalize(path.join(applicationRoot, intModuleName, 'bundlesRoute.json')),
            bundlesPath = path.normalize(path.join(applicationRoot, intModuleName, 'bundles.json'));

         if (taskParameters.config.sources && (await fs.pathExists(bundlesRoutePath))) {
            jsonToWrite[bundlesRoutePath] = await fs.readJson(bundlesRoutePath);
         }

         if (await fs.pathExists(bundlesPath)) {
            jsonToWrite[bundlesPath] = await fs.readJson(bundlesPath);
         }

         if (taskParameters.config.sources && !jsonToWrite[bundlesRoutePath]) {
            jsonToWrite[bundlesRoutePath] = {};
         }

         if (!jsonToWrite[bundlesPath]) {
            jsonToWrite[bundlesPath] = {};
         }

         currentModules.forEach((node) => {
            /**
             * Все css-модули, которые были выкинуты из кастомных пакетов путём использования
             * опции exclude, не должны попадать в bundlesRoute, поскольку:
             * 1) При наличии одинаковых имён со своими компонентами css всё равно попадут в bundles,
             * но запишутся в js-пакет.
             * 2) Из 1го следует что такие cssки должны быть описаны в bundles(чтобы require не ошибался
             * и ходил за cssкой в jsный пакет, а не в cssный), но не должны быть описаны в bundlesRoute
             * (чтобы Сервис Представлений не вставлял cssный пакет и не обьявлял css как пустышку без
             * наличия стиля как такового
             */
            if (taskParameters.config.sources && !result.excludedCSS.hasOwnProperty(node)) {
               jsonToWrite[bundlesRoutePath][node] = result.bundlesRoute[node];
            }
         });
         jsonToWrite[bundlesPath][currentBundle] = result.bundles[currentBundle];
      },
      {
         concurrency: 10
      }
   );
   await pMap(Object.keys(jsonToWrite), key => fs.outputJson(key, sortObjectByKeys(jsonToWrite[key])), {
      concurrency: 10
   });
}

/**
 * Сохраняем результаты работы кастомной паковки для всех секций.
 */
async function saveCustomPackResults(taskParameters, result, applicationRoot, splittedCore) {
   const wsRoot = 'WS.Core';
   const bundlesPath = 'ext/requirejs',
      bundlesRoutePath = path.join(wsRoot, bundlesPath, 'bundlesRoute').replace(/\\/g, '/'),
      pathsToSave = {
         bundles: path.join(applicationRoot, wsRoot, bundlesPath, 'bundles.js')
      };

   if (taskParameters.config.sources) {
      pathsToSave.bundlesJson = path.join(applicationRoot, wsRoot, bundlesPath, 'bundles.json');
      pathsToSave.bundlesRoute = path.join(applicationRoot, `${bundlesRoutePath}.json`);
   }
   await saveBundlesForEachModule(taskParameters, applicationRoot, result);
   if (taskParameters.config.version) {
      await pMap(
         Object.keys(taskParameters.versionedModules),
         async(currentModule) => {
            await fs.outputJson(
               path.join(applicationRoot, currentModule, '.builder/versioned_modules.json'),
               taskParameters.versionedModules[currentModule].sort()
            );
         },
         {
            concurrency: 10
         }
      );
   }
   await pMap(Object.keys(pathsToSave), async(key) => {
      let json;

      // нам надо проверить, что нужные файлы уже были сгенерены(инкрементальная сборка)
      if (await fs.pathExists(pathsToSave[key])) {
         switch (key) {
            case 'bundlesRoute':
            case 'bundlesJson':
               json = await fs.readJson(pathsToSave[key]);
               break;
            default:
               // bundles
               try {
                  // для bundles надо сначала удалить лишний код, а только потом парсить json
                  json = JSON.parse((await fs.readFile(pathsToSave[key], 'utf8')).slice(8, -1));
               } catch (error) {
                  logger.debug({
                     message: `Проблема с разбором файла ${pathsToSave[key]}. Но это скорее всего нормально`,
                     error
                  });
               }
               break;
         }
      }

      // если файл существует и мы его прочитали, то просто дополняем его свежесгенеренными результатами.
      if (json) {
         Object.keys(result[key]).forEach((option) => {
            json[option] = result[key][option];
         });
      } else {
         json = result[key];
      }
      switch (key) {
         case 'bundlesRoute':
            await fs.outputJson(pathsToSave[key], sortObjectByKeys(json));
            logger.debug(`Записали bundlesRoute.json по пути: ${pathsToSave[key]}`);
            break;
         case 'bundlesJson':
            await fs.outputJson(pathsToSave[key], sortObjectByKeys(json));
            logger.debug(`Записали bundles.json по пути: ${pathsToSave[key]}`);
            break;
         default:
            // bundles
            if (taskParameters.config.sources) {
               await fs.writeFile(pathsToSave[key], `bundles=${JSON.stringify(sortObjectByKeys(json))};`);
               logger.debug(`Записали bundles.js по пути: ${pathsToSave[key]}`);

               /**
                * Таска минификации выполняется до кастомной паковки, поэтому мы должны для СП также
                * сохранить .min бандл
                * TODO выключить для оффлайн-приложений, когда все подключения bundles.js будут переведены на корень
                */
               if (splittedCore) {
                  await fs.writeFile(pathsToSave[key].replace(/\.js$/, '.min.js'), `bundles=${JSON.stringify(sortObjectByKeys(json))};`);
                  logger.debug(
                     `Записали bundles.min.js по пути: ${path.join(
                        applicationRoot,
                        wsRoot,
                        bundlesPath,
                        'bundles.min.js'
                     )}`
                  );
               }
            }
            break;
      }
   });
}

/**
 * Создаёт кастомный пакет по текущей конфигурации. Записывает результаты компиляции
 * ( bundles и bundlesRoute) в общий набор - results
 * @param {TaskParameters} taskParameters параметры для задач
 * @param {DependencyGraph} depsTree граф зависимостей
 * @param {Object} currentConfig текущая конфигурация кастомной паковки
 * @param {Object}results общие результаты компиляции для всех кастомных пакетов
 * @param {String} root корень приложения
 * @returns {Promise<void>}
 */
async function compileCurrentPackage(taskParameters, depsTree, currentConfig, results, root) {
   let currentResult = {
      bundles: {},
      bundlesRoute: {},
      excludedCSS: {}
   };


   const configNum = currentConfig.configNum ? `конфигурация №${currentConfig.configNum}` : '';
   try {
      /**
       * результатом выполнения функции мы сделаем объект, он будет содержать ряд опций:
       * 1)bundles: в нём будут храниться подвергнутые изменениям бандлы.
       * 2)bundlesRoute: тоже самое что и выше, только для bundlesRoute.
       */
      currentResult = await generateCustomPackage(
         depsTree,
         root,

         // application
         '/',
         currentConfig,

         // isSplittedCore
         true,

         // isGulp
         true,
         taskParameters
      );
      packHelpers.appendBundlesOptionsToCommon(currentResult, results, 'excludedCSS');
      logger.info(`Создан кастомный пакет по конфигурационному файлу ${currentConfig.packageName} - ${configNum}- ${currentConfig.output}`);
   } catch (err) {
      logger.warning({
         message: `Ошибка создания кастомного пакета по конфигурационному файлу ${
            currentConfig.packageName} - ${configNum}- ${currentConfig.output}`,
         error: err,
         filePath: currentConfig.path
      });
   }
   packHelpers.appendBundlesOptionsToCommon(currentResult, results, 'bundles');
   packHelpers.appendBundlesOptionsToCommon(currentResult, results, 'bundlesRoute');
}

/**
 * Генерирует кастомные пакеты для всего набора конфигураций кастомной паковки.
 * Сперва приоритетные, для них создаётся набор записанных модулей. Затем обычные
 * пакеты, в которые уже не смогут попасть модули из приоритетных пакетов.
 * @param {Object} configs общий набор конфигураций кастомной паковки
 * @param {TaskParameters} taskParameters параметры для задач
 * @param {Object} depsTree граф зависимостей
 * @param {Object} results общие результаты компиляции для всех кастомных пакетов
 * @param {String} root корень приложения
 * @returns {Promise<void>}
 */
async function generateAllCustomPackages(configs, taskParameters, depsTree, results, root) {
   const configsArray = [...Object.keys(configs.commonBundles).map(key => configs.commonBundles[key])];
   if (configs.superBundles && configs.superBundles.length > 0) {
      configsArray.splice(configsArray.length, 0, ...configs.superBundles);
   }
   await pMap(
      configsArray,
      async(currentConfig) => {
         await compileCurrentPackage(taskParameters, depsTree, currentConfig, results, root);
      },
      {
         concurrency: 10
      }
   );
}

/**
 * Возвращаем название Интерфейсного модуля
 * @param {String} nodeName - полное имя модуля
 * @returns {*} Название Интерфейсного модуля
 */
function getUiModuleName(nodeName) {
   const firstModulePart = nodeName.split('/')[0];
   if (firstModulePart.includes('!')) {
      return firstModulePart.split('!').pop();
   }
   return firstModulePart;
}

/**
 * Разбиваем пересечения по Интерфейсным модулям
 * @param {String} root корень приложения
 * @param {Array[][]} intersects пересечения между кастомными пакетами
 * @returns {Promise<void>}
 */
async function splitIntersectsByUiModuleName(root, intersects) {
   const intersectsByUiModules = {};

   intersects.forEach((currentEntry) => {
      const
         currentModule = currentEntry[0],
         currentModuleIntersect = currentEntry[1].sort(),
         interfaceModule = getUiModuleName(currentModule);

      let currentUiIntersect = intersectsByUiModules[interfaceModule];
      if (!currentUiIntersect) {
         currentUiIntersect = {};
         currentUiIntersect[currentModule] = currentModuleIntersect;
         intersectsByUiModules[interfaceModule] = currentUiIntersect;
      } else {
         currentUiIntersect[currentModule] = currentModuleIntersect;
      }
   });

   await pMap(
      Object.entries(intersectsByUiModules),
      async(currentEntry) => {
         const
            currentUiModuleName = currentEntry[0],
            currentUiModuleIntersects = currentEntry[1],
            intersectOutput = path.join(root, `${currentUiModuleName}${builderConstants.metaFolder}customPackIntersects.json`);
         logger.info(
            `В Интерфейсном модуле ${currentUiModuleName} присутствуют пересечения между кастомными пакетами!` +
            ` Посмотреть можно в json-файле по пути ${intersectOutput}`
         );
         await fs.outputJson(intersectOutput, sortObjectByKeys(currentUiModuleIntersects));
      },
      {
         concurrency: 10
      }
   );
}

/**
 * Собираем в один файл все пересечения между кастомными пакетами.
 * @param {String} root - корень приложения
 * @param {Object} results - результаты создания кастомных пакетов
 * @returns {Promise<void>}
 */
async function collectAllIntersects(root, results) {
   const
      { bundles } = results,
      allBundlesRoute = {};

   Object.entries(bundles).forEach((currentEntry) => {
      const
         currentBundleName = currentEntry[0],
         currentBundle = currentEntry[1];

      currentBundle.forEach((module) => {
         if (!allBundlesRoute.hasOwnProperty(module)) {
            allBundlesRoute[module] = [currentBundleName];
         } else {
            allBundlesRoute[module].push(currentBundleName);
         }
      });
   });

   await splitIntersectsByUiModuleName(
      root,

      /**
       * оставляем только те модули, у которых больше 1 вхождения в кастомные пакеты
       */
      Object.entries(allBundlesRoute).filter(currentEntry => currentEntry[1].length > 1)
   );
}

module.exports = {
   generateAllCustomPackages,
   saveCustomPackResults,
   generateCustomPackage,
   rebaseCSS,
   collectAllIntersects
};
