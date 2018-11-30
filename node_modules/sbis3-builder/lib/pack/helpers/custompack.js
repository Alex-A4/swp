/* eslint-disable indent */
'use strict';

const path = require('path');
const dblSlashes = /\\/g;
const commonPackage = require('../../../packer/lib/common-package');
const excludeCore = ['Core/*', 'Deprecated/*', 'Transport/*'];

/**
 * набор модулей, которые не должны попадать в пакет
 * в связи с их исключением из процесса минификации
 */
const excludeRegexes = [
   /.*\.worker\.js$/,
   /.*[/\\]node_modules[/\\].*/,
   /.*[/\\]ServerEvent[/\\]worker[/\\].*/,
];
const pMap = require('p-map');
const esprima = require('esprima');
const escodegen = require('escodegen');
const estraverse = require('estraverse');
const { traverse } = estraverse;
const esReplace = estraverse.replace;
const fs = require('fs-extra');
const helpers = require('../../../lib/helpers');

// набор регулярок для генерации линков css
const isResources = /^(resources)/i;
const isWS = /^(ws)/i;

/**
 * Путь до original файла
 * @param {String} filePath
 * @return {string}
 */
function originalPath(filePath) {
   return filePath.indexOf('.original.') > -1 ? filePath : filePath.replace(/(\.js)$/, '.original$1');
}

/**
 * Путь до выходного файла
 */
function getOutputFile(packageConfig, applicationRoot, depsTree, isSplittedCore) {
   const mDepsPath = depsTree.getNodeMeta(packageConfig.output).path;
   let outputFile;

   if (mDepsPath) {
      outputFile = mDepsPath;
   } else {
      outputFile = path.join(path.dirname(packageConfig.path), path.normalize(packageConfig.output));
   }
   if (isSplittedCore && !mDepsPath) {
      outputFile = outputFile.replace(/(\.js)$/, '.min$1');
   }

   return path.join(path.normalize(applicationRoot), outputFile).replace(dblSlashes, '/');
}

/**
 * Экранируем строку для RegExp
 * @param {String} str
 * @return {string}
 */
function escapeRegExp(str) {
   return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

/**
 * Экранируем строку для RegExp без экранирования *, она заменена на .*
 * @param {String} str
 * @return {string}
 */
function escapeRegExpWithoutAsterisk(str) {
   return str.replace(/[-[\]/{}()+?.\\^$|]/g, '\\$&').replace('*', '.*');
}

/**
 * Формируем RegExp для фильтрации модулей
 * @param {Array} modules
 * @return {RegExp}
 */
function generateRegExp(modules) {
   let regexpStr = '';

   if (!modules || !modules.length) {
      return null;
   }

   modules.forEach((module) => {
      if (typeof module !== 'string') {
         return;
      }

      if (module.indexOf('*') > -1) {
         regexpStr += `${regexpStr ? '|' : ''}^(.+?!)?(${escapeRegExpWithoutAsterisk(module)})`;
      } else {
         regexpStr += `${regexpStr ? '|' : ''}^(.+?!)?(${escapeRegExp(module)}$)`;
      }
   });

   return new RegExp(`${regexpStr}`);
}

/**
 * Получаем список вершин
 * @param {DepGraph} dg
 * @param {Array} modules
 * @return {Array}
 */
function findAllModules(dg, modules) {
   const nodes = dg.getNodes();
   const regexp = generateRegExp(modules);

   return nodes.filter(node => regexp.test(node));
}

/**
 * Проверяем путь на наличие исключения
 * @param fullPath - путь до файла
 * @returns {boolean}
 */
function testForExcludeRegexes(fullPath) {
   let result = false;
   excludeRegexes.forEach((regex) => {
      if (regex.test(fullPath)) {
         result = true;
      }
   });
   return result;
}

/**
 * Получаем отфильтрованный граф
 * @param {DepGraph} depsTree - дерево зависимостей module-dependencies
 * @param {Object} cfg - текущая конфигурация для кастомной паковки
 * @param {Object} excludedCSS - набор css, которые были выброшены из пакетов через exclude
 * @param {String} applicationRoot - полный путь до корня сервиса
 * @return {Array}
 */
function getOrderQueue(depsTree, cfg, excludedCSS, applicationRoot) {
   let excludeCoreReg;

   // если особый пакет(вебинары), то оставляем старый способ паковки
   if (!cfg.includeCore && cfg.modules) {
      cfg.modules.forEach((expression) => {
         if (!cfg.include.includes(expression)) {
            cfg.include.push(expression);
         }
      });
      excludeCoreReg = generateRegExp(excludeCore);
   }
   const modules = findAllModules(depsTree, !cfg.includeCore && !cfg.modules ? cfg.include : cfg.modules);
   const include = generateRegExp(cfg.include);
   const exclude = generateRegExp(cfg.exclude);

   const orderQueue = depsTree.getLoadOrder(modules);

   return commonPackage
      .prepareOrderQueue(depsTree, orderQueue, applicationRoot)
      .filter(module => !testForExcludeRegexes(module.fullPath))
      .filter(module => (include ? include.test(module.fullName) : true))
      .filter((module) => {
         if (exclude && exclude.test(module.fullName)) {
            if (module.fullName.startsWith('css!')) {
               excludedCSS[module.fullName] = module.fullName;
            }
            return false;
         }
         if (excludeCoreReg) {
            return !excludeCoreReg.test(module.fullName);
         }
         return true;
      });
}

/**
 * Получаем физический путь для названия пакета
 * @param {String} currentOutput - физический путь до пакета
 * @param {String} applicationRoot - корень сервиса
 * @param {String} wsRoot - путь до ws, чтобы отличать СП или Препроцессор.
 * TODO спилить wsRoot когда все приложения будут переведены на СП.
 * @returns {*}
 */
function getBundlePath(currentOutput, applicationRoot, wsRoot) {
   let result = currentOutput.replace(applicationRoot.replace(/\\/g, '/'), '');
   if (wsRoot === 'resources/WS.Core') {
      result = result.replace(/^ws/, wsRoot);
   }
   return result.replace(/\\/g, '/').replace(/\.js/g, '');
}

/**
 * Проверяет наличие стиля или шаблона в списке на запись
 * @param module - Полное имя модуля(с плагинами)
 * @param orderQueue - список модулей на запись
 */
function checkForIncludeInOrderQueue(module, orderQueue) {
   const moduleWithoutPlugin = module.split('!').pop(),
      founded = {};

   const checkModule = (currentModule) => {
      const currentModuleParts = new Set(currentModule.fullName.split('!'));
      if (currentModuleParts.has(moduleWithoutPlugin)) {
         if (currentModuleParts.has('css')) {
            founded.css = true;
         }
         if (currentModuleParts.has('tmpl')) {
            founded.tmpl = true;
         }
         if (currentModuleParts.has('html')) {
            founded.xhtml = true;
         }
      }
   };

   orderQueue.forEach(node => checkModule(node));
   return founded;
}

/**
 * проверяем, сгенерирован ли шаблон и стоит ли его включать в пакет.
 * P.S. эта функция работает исключительно для анонимных шаблонов, которые
 * любят глубоко в callback тянуть через require
 * @param templatePath
 */
async function checkTemplateForAMD(templatePath) {
   const data = await fs.readFile(templatePath, 'utf8');
   return data.indexOf('define(') === 0;
}

/**
 * Генерирует кастомный пакет для requirejs конфигурации.
 * @param {Object} orderQueue - очередь модулей на запись в пакет.
 * @return {Array}
 */
async function generateBundle(orderQueue, cssModulesFromOrderQueue, splittedCore) {
   const bundle = [],
      moduleExtReg = /(\.module)?(\.min)?(\.original)?\.js$/,
      modulesToPushToOrderQueue = [];

   /**
    * в bundles непосредственно css должны остаться на случай динамического запроса пакетов
    */
   cssModulesFromOrderQueue.forEach(css => bundle.push(css.fullName));
   await pMap(
      orderQueue,
      async(node) => {
         const isJSModuleWithoutJSPlugin = node.fullName.indexOf('!') === -1 && node.plugin === 'js';
         let modulePath;
         if (node.fullPath) {
            modulePath = node.fullPath;
         } else {
            modulePath = node.moduleYes.fullPath ? node.moduleYes.fullPath : node.moduleNo.fullPath;
         }

         const moduleHaveTmpl = await fs.pathExists(modulePath.replace(moduleExtReg, '.tmpl')),
            moduleHaveXhtml = await fs.pathExists(modulePath.replace(moduleExtReg, '.xhtml')),
            moduleHaveCSS = await fs.pathExists(modulePath.replace(moduleExtReg, '.css'));

         if (node.amd) {
            /**
             * Если модуль без плагина js и у него есть шаблон или стиль, мы должны удостовериться,
             * что они также попадут в бандлы и будут запакованы, иначе require будет вызывать
             * кастомный пакет, но с соответствующим расширением
             */
            if (isJSModuleWithoutJSPlugin && (moduleHaveTmpl || moduleHaveXhtml || moduleHaveCSS)) {
               const foundedElements = checkForIncludeInOrderQueue(node.fullName, orderQueue);
               let config;
               if (moduleHaveTmpl && !foundedElements.tmpl) {
                  config = {
                     fullName: `tmpl!${node.fullName}`,
                     fullPath: modulePath.replace(moduleExtReg, splittedCore ? '.min.tmpl' : '.tmpl'),
                     plugin: 'tmpl'
                  };
                  config.amd = await checkTemplateForAMD(config.fullPath);
                  modulesToPushToOrderQueue.push(config);
               }
               if (moduleHaveXhtml && !foundedElements.xhtml) {
                  config = {
                     fullName: `tmpl!${node.fullName}`,
                     fullPath: modulePath.replace(moduleExtReg, splittedCore ? '.min.xhtml' : '.xhtml'),
                     plugin: 'html',
                     amd: true
                  };
                  config.amd = await checkTemplateForAMD(config.fullPath);
                  modulesToPushToOrderQueue.push(config);
               }
               if (moduleHaveCSS && !foundedElements.css) {
                  /**
                   * Проверяем наш список css на наличие подходящего имени и в случае его
                   * наличия не надо добавлять в orderQueue на запись.
                   */
                  const foundedCSSFromList = cssModulesFromOrderQueue.find(css => css.fullName.includes(`css!${node.fullName}`));
                  if (!foundedCSSFromList) {
                     modulesToPushToOrderQueue.push({
                        fullName: `css!${node.fullName}`,
                        fullPath: modulePath.replace(moduleExtReg, splittedCore ? '.min.css' : '.css'),
                        plugin: 'css'
                     });
                  }
               }
            }
            bundle.push(node.fullName);
         } else if (node.plugin === 'css' || node.plugin === 'text') {
            bundle.push(node.fullName);
         }
      },
      {
         concurrency: 10
      }
   );

   modulesToPushToOrderQueue.forEach((module) => {
      if (!bundle.includes(module.fullName)) {
         bundle.push(module.fullName);
      }
      orderQueue.push(module);
   });
   return bundle;
}

/**
 * Генерирует список: модуль и путь до пакета, в котором он лежит
 * @param currentBundle - текущий бандл
 * @param pathToBundle - физический путь до бандла
 * @param bundlesRoutingObject - результирующий список
 */
function generateBundlesRouting(currentBundle, pathToBundle, cssBundleConfig) {
   const
      bundlesRoute = {},
      {
         cssExtIncludesPackage,
         cssBundlePath,
         excludedCSS,
         cssCurrentTheme
      } = cssBundleConfig;
   for (let i = 0; i < currentBundle.length; i++) {
      const themeForCurrentCss = cssCurrentTheme[currentBundle[i]];

      if (currentBundle[i].indexOf('css!') === 0) {
         if (!excludedCSS.hasOwnProperty(currentBundle[i])) {
            bundlesRoute[currentBundle[i]] = `${helpers.unixifyPath(path.join('resources', cssBundlePath))}` +
               `${themeForCurrentCss ? `_${themeForCurrentCss}` : ''}` +
               `${cssExtIncludesPackage ? '.package' : ''}.min.css`;
         }
      } else {
         bundlesRoute[currentBundle[i]] = `${pathToBundle}.js`;
      }
   }
   return bundlesRoute;
}

/**
 * Проверяем конфигурационный файл на обязательное наличие опции include и чтобы она не была пустым массивом.
 * В случае успеха кладём его в configsArray, иначе в badConfigs.
 * @param {Object} config - json-файл формата name.package.json
 * @param {String} cfgPath - полный путь до данного конфигурационного файла
 * @param {String} applicationRoot - путь до корня
 * @param {Array} badConfigs - json-файлы формата name.package.json, которые будут проигнорированы паковщиком
 * @param {Array} configsArray - корректные json-файлы формата name.package.json
 * @return {Array}
 */
function checkConfigForIncludeOption(config) {
   return !(config.includeCore || (config.include && config.include.length > 0));
}

/**
 * Обходим конфигурационные файлы, складываем все содержащиеся внутри объекты в configsArray
 * Если конфиг плохой, складываем его в badConfigs
 * По каждому объекту будет создан свой пакет.
 * @param {Object} grunt
 * @param {Array} configsFiles - json-файлы формата name.package.json
 * @param {String} applicationRoot - путь до корня
 * @param {Array} badConfigs - json-файлы формата name.package.json, которые будут проигнорированы паковщиком
 * @return {Array}
 */
function getConfigsFromPackageJson(configPath, cfgContent) {
   const
      configsArray = [],
      packageName = path.basename(configPath);

   if (cfgContent instanceof Array) {
      for (let i = 0; i < cfgContent.length; i++) {
         const cfgObj = cfgContent[i];
         cfgObj.packageName = packageName;
         cfgObj.configNum = i + 1;
         cfgObj.path = configPath;
         cfgObj.isBadConfig = checkConfigForIncludeOption(cfgObj, configPath);
         configsArray.push(cfgObj);
      }
   } else {
      cfgContent.packageName = packageName;
      cfgContent.path = configPath;
      cfgContent.isBadConfig = checkConfigForIncludeOption(cfgContent, configPath);
      configsArray.push(cfgContent);
   }

   return configsArray;
}

// генерируем параметры, необходимые для генерации пакета без использования множественного define
function generateParamsForPackage(orderQueue) {
   return orderQueue.map((currentNodeInString) => {
      const ast = esprima.parse(currentNodeInString),
         ifStatementIncluded = ast.body[0].type === 'IfStatement',
         currentDepsIndexes = {};
      let deps, moduleName, callBack;

      traverse(ast, {
         enter(node) {
            if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'define') {
               node.arguments.forEach((argument) => {
                  switch (argument.type) {
                     case 'Literal':
                        moduleName = argument.value;
                        break;
                     case 'ArrayExpression':
                        deps = argument.elements.map((element, index) => {
                           currentDepsIndexes[element.value] = index;
                           return element.value;
                        });
                        break;
                     case 'FunctionExpression':
                        callBack = argument;
                        break;
                     case 'ObjectExpression':
                        // иногда встречаются модули, где в качестве callBack выступает объект
                        callBack = argument;
                        break;
                     default:
                        break;
                  }
               });
            }
         }
      });

      return {
         ast,
         deps,
         moduleName,
         callBack,
         ifStatementIncluded
      };
   });
}

/*
 * Функция для сортировки модулей по зависимостям. Если модуль A из
 * пакета зависит от модуля B из пакета, то модуль B должен быть
 * определён до модуля A, Если встречается внешняя зависимость, то это никак не влияет на модуль.
 */
function sortModulesForDependencies(orderQueue) {
   orderQueue.forEach((currentModule) => {
      function watcher(dependency, currentDepth, maxDepth) {
         const founded = orderQueue.find(module => module.moduleName === dependency);
         let newMaxDepth = maxDepth;
         if (founded) {
            newMaxDepth += 1;
            if (founded.deps) {
               founded.deps.forEach((dep) => {
                  const depth = watcher(dep, currentDepth + 1, newMaxDepth);
                  newMaxDepth = depth > currentDepth ? depth : currentDepth;
               });
            }
         }
         return newMaxDepth;
      }

      currentModule.depth = 0;
      if (currentModule.deps) {
         currentModule.deps.forEach((dep) => {
            const maxDepth = watcher(dep, 0, 0);
            currentModule.depth = maxDepth > currentModule.depth ? maxDepth : currentModule.depth;
         });
      }
   });

   // непосредственно сама сортировка
   return orderQueue.sort((a, b) => {
      if (a.depth > b.depth) {
         return 1;
      }
      if (a.depth < b.depth) {
         return -1;
      }
      return 0;
   });
}

/*
 * собираем все внешние зависимости, также делаем копию самих зависимостей,
 * которые мы вернём в отсортированный по зависимостям набор модулей.
 */
function collectExternalDependencies(orderQueue) {
   const externalDependencies = [];
   orderQueue.forEach((currentModule) => {
      // отбираем внешние зависимости, дубликаты откидываем
      if (currentModule.deps) {
         currentModule.deps
            .filter((dep) => {
               let newDep = dep;
               const currentIndex = currentModule.deps.indexOf(newDep);
               if (typeof newDep === 'string') {
                  newDep = newDep.replace(/^is!browser\?|^is!compatibleLayer\?|^is!msIe\?|^browser!/, '');
               }
               currentModule.deps[currentIndex] = newDep;
               return orderQueue.filter(module => module.moduleName === newDep).length === 0;
            })
            .forEach((dep) => {
               if (!externalDependencies.includes(dep)) {
                  externalDependencies.push(dep);
               }
            });
      }
   });
   return externalDependencies;
}

// собирает полный список зависимостей согласно дереву зависимостей от указанной зависимости - точки входа.
function getAllDepsRecursively(dependency, allDeps, orderQueue) {
   const founded = orderQueue.find(module => module.moduleName === dependency);
   if (founded && founded.deps) {
      founded.deps.forEach((dep) => {
         const result = getAllDepsRecursively(dep, allDeps, orderQueue);
         if (result && !allDeps.includes(dep)) {
            allDeps.push(dep);
         }
      });
   }
   return dependency;
}

// генерируем пакет с использованием нативной формы обьявления модулей взамен define
function generatePackageToWrite(listOfModules) {
   let resultPackageToWrite = '';
   if (listOfModules) {
      let orderQueue = generateParamsForPackage(listOfModules),
         defineOfModules = '';
      const externalDependencies = collectExternalDependencies(orderQueue);

      /* Правим структуру модулей. define нельзя делать внутри require. Нужно их вынести,
       * замкнуть с exports и передать каждому define зависимости, чтобы exports назначился
       * и модули правильно задефайнились.
       */
      resultPackageToWrite =
         '(function(){\nvar global = (function(){ return this || (0, eval)(\'this\'); }());\n' +
         `var require = global.requirejs;\nvar exports = {};\nvar deps = [${externalDependencies
            .map(dep => `'${dep}'`)
            .join(', ')}];\n`;

      /* если для конкретного модуля помимо явного define существует define
           *при определённом условии, то оставляем только 2й вариант
           * define оборачивается в условие сборщиком, когда данный модуль
           * запрашивают через плагины is!, browser!.
           */
      orderQueue = orderQueue.filter(
         currentModule => !(
            !currentModule.ifStatementIncluded &&
            orderQueue.find(module => currentModule.moduleName === module.moduleName && module.ifStatementIncluded)
         )
      );

      orderQueue = sortModulesForDependencies(orderQueue);

      orderQueue.forEach((moduleToWrite) => {
         esReplace(moduleToWrite.ast, {
            enter(node) {
               if (
                  node.expression &&
                  node.expression.type === 'CallExpression' &&
                  node.expression.callee.type === 'Identifier' &&
                  node.expression.callee.name === 'define'
               ) {
                  const generatedCallBack = escodegen.generate(moduleToWrite.callBack),
                     writeForm = `Object.defineProperty(exports, '${moduleToWrite.moduleName}', {\n
                                            configurable: true,\nget: function() {\n
                                            delete exports['${moduleToWrite.moduleName}'];\n
                                            return exports['${moduleToWrite.moduleName}'] = ${generatedCallBack}(${
                        moduleToWrite.deps
                           ? moduleToWrite.deps
                              .map((dep) => {
                                 const moduleInPackage = orderQueue.find(module => module.moduleName === dep),
                                    extDep = externalDependencies.indexOf(dep);

                                 return moduleInPackage
                                    ? `exports['${moduleInPackage.moduleName}']`
                                    : `require${
                                       externalDependencies[extDep] === 'require' ? '' : `(deps[${extDep}])`
                                       }`;
                              })
                              .filter(dep => dep)
                              .join(', ')
                           : ''
                        });\n}\n});\n`;
                  return esprima.parse(writeForm);
               }
               return node;
            }
         });
         resultPackageToWrite += `\n${escodegen.generate(moduleToWrite.ast, { format: { compact: true } })}`;
         const allDeps = [];
         if (moduleToWrite.deps) {
            moduleToWrite.deps.forEach((currentDep) => {
               const dep = getAllDepsRecursively(currentDep, allDeps, orderQueue);
               if (!allDeps.includes(dep)) {
                  allDeps.push(dep);
               }
            });
         }
         defineOfModules += `\ndefine('${moduleToWrite.moduleName}', [${allDeps.map(
            dep => `'${dep}'`
         )}], function() {return exports['${moduleToWrite.moduleName}'];});`;
      });
      resultPackageToWrite += defineOfModules;
      resultPackageToWrite += '\n})()';
   }
   return resultPackageToWrite;
}

/**
 * Генерим код для правильного подключения кастомных css-пакетов
 * Аппендим линку с версией для кэширования, и дефайним все css
 * модули пустышками, чтобы они не затянулись отдельно через require
 * TODO надо будет доработать с Никитой, чтобы я не аппендил линки, если он уже зааппендил
 * в момент серверной вёрстки(какой нибудь аттрибут?например cssBundles).
 * @param cssModules - список всех css-модулей
 * @param packagePath - путь до пакета
 * @returns {string}
 */
function generateLinkForCss(cssModules, packagePath, splittedCore) {
   let linkHref = packagePath.replace(/\.min$/, '');
   if (splittedCore) {
      linkHref = linkHref.replace(/(^resources\/)|(^\/)/, '');
   } else {
      const isResourcesPath = linkHref.match(isResources);
      if (isResourcesPath) {
         linkHref = linkHref.replace(isResourcesPath[1], 'Resources');
      } else {
         const wsPath = linkHref.match(isWS);
         linkHref = linkHref.replace(wsPath[1], 'WS');
      }
   }
   let result = '(function(){';
   const packageSuffix = linkHref.endsWith('.package');

   if (packageSuffix) {
      linkHref = linkHref.replace(/\.package$/, '');
   }
   cssModules.forEach((module) => {
      result += `define('${module.fullName}',['css!${linkHref}` +
         `${module.currentTheme ? `_${module.currentTheme}` : ''}${packageSuffix ? '.package' : ''}'],'');`;
   });
   return `${result}})();`;
}

function appendBundlesOptionsToCommon(current, common, idProperty) {
   Object.keys(current[idProperty]).forEach((key) => {
      common[idProperty][key] = current[idProperty][key];
   });
}

module.exports = {
   appendBundlesOptionsToCommon,
   getOrderQueue,
   getOutputFile,
   getConfigsFromPackageJson,
   getBundlePath,
   generateBundle,
   generateBundlesRouting,
   generateLinkForCss,
   originalPath,
   generatePackageToWrite
};
