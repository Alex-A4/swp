'use strict';

const esprima = require('esprima');
const { traverse } = require('estraverse');
const async = require('async');
const path = require('path');
const fs = require('fs-extra');
const DepGraph = require('../../lib/dependency-graph');
const getMeta = require('../../lib/get-dependency-meta');
const logger = require('../../../lib/logger').logger();

const rjsPaths = global.requirejs.s.contexts._.config.paths || {};
const requirejsPathResolver = global.requirejs('Core/pathResolver');
const i18n = global.requirejs('Core/i18n');
const availableLangs = Object.keys(i18n.getAvailableLang());

let supportedPlugins = [
   'js',
   'html',
   'css',
   'json',
   'xml',
   'text',
   'native-css',
   'browser',
   'optional',
   'i18n',
   'tmpl'
];
const pluginsOnlyDeps = ['cdn', 'preload', 'remote'];
const systemModules = ['module', 'require', 'exports'];
const reIsRemote = /^http[s]?:|^\/\//i;
const firstDot = /^\.\/|\.\\\\/;
const dblSlashes = /\\/g;
const isCss = /\.css$/;
const isWS = /^\.\.\/ws/;

supportedPlugins = supportedPlugins.concat(pluginsOnlyDeps);

/**
 * @typedef {Object} Meta
 * @property {String} fullName - module name with plugin
 * @property {String} fullPath - module full path
 * @property {String} plugin - plugin name
 * @property {String} module - module name
 * @property {Object} [moduleYes] - is plugin, module yes
 * @property {Object} [moduleNo] - is plugin, module no
 * @property {String} [moduleFeature] - is plugin, module feature
 * @property {Boolean} [amd] - module is amd notation
 * @property {Array} [deps] - module dependencies
 */

/**
 * Определяем, нужен ли включать плагин в зависимости
 * @param {Meta} meta
 * @return {boolean}
 */
function needPlugin(meta) {
   if (meta.plugin === 'js') {
      // Проверим на пути requirejs
      const firstFolder = meta.module && meta.module.split('/')[0];
      if (firstFolder && rjsPaths[firstFolder]) {
         return false;
      }
   }

   return true;
}

/**
 * Есть ли элемент в массиве
 * @param {Array} arr
 * @param {*} val
 * @return {boolean}
 */
function hasValue(arr, val) {
   return arr.indexOf(val) !== -1;
}

/**
 * Есть ли плагин в белом списке
 * @param {Meta} meta
 * @return {boolean}
 */
function whitelistedPlugin(meta) {
   if (meta.plugin === 'is') {
      return (
         (meta.moduleYes ? hasValue(supportedPlugins, meta.moduleYes.plugin) : true) &&
         (meta.moduleNo ? hasValue(supportedPlugins, meta.moduleNo.plugin) : true)
      );
   }
   if (meta.plugin === 'browser' || meta.plugin === 'optional') {
      return meta.moduleIn ? hasValue(supportedPlugins, meta.moduleIn.plugin) : true;
   }
   return hasValue(supportedPlugins, meta.plugin);
}

/**
 * Проверяет, является ли модуль "удаленным", то есть находится не на текущей статике
 * @param {Meta} meta
 * @return {boolean}
 */
function notRemoteFile(meta) {
   if (meta.plugin === 'is') {
      return (
         (meta.moduleYes ? !reIsRemote.test(meta.moduleYes.module) : true) &&
         (meta.moduleNo ? !reIsRemote.test(meta.moduleNo.module) : true)
      );
   }
   if (meta.plugin === 'browser' || meta.plugin === 'optional') {
      return meta.moduleIn ? !reIsRemote.test(meta.moduleIn.module) : true;
   }
   return meta.module && !reIsRemote.test(meta.module);
}

/**
 * Проверяет, является ли модуль "служебным", то есть необрабатываемым
 * @param {Meta} meta
 * @return {boolean}
 */
function notSystemModule(meta) {
   return meta.module && !hasValue(systemModules, meta.module);
}

/**
 * Удаляет лидирующую точку в пути модуля
 * @param {Meta} meta
 * @return {Meta}
 */
function replaceFirstDot(meta) {
   meta.fullName = meta.fullName.replace(firstDot, '');
   return meta;
}

/**
 * Получает массив зависимостей для модуля
 * @param {Object} grunt
 * @param {String} fullPath - полный путь до js файла
 * @param {Array} deps - массив зависимостей
 * @return {Array}
 */
function getDependencies(grunt, fullPath, deps) {
   const plugins = [];
   let newDeps = deps && deps instanceof Array ? deps : [];
   newDeps = newDeps
      .map(function getValue(i) {
         if (!i || i.type !== 'Literal') {
            logger.debug(`Warning! Dependencies is not literal. ${fullPath}. ${JSON.stringify(i)}`);
            return '';
         }
         return i.value;
      })
      .map(getMeta)
      .filter(whitelistedPlugin)
      .filter(notRemoteFile)
      .filter(notSystemModule)
      .map(replaceFirstDot);

   newDeps.forEach(function collectPlugins(i) {
      if (i.plugin && !hasValue(plugins, i.plugin) && needPlugin(i)) {
         plugins.push(i.plugin);
      }

      if (i.plugin === 'is') {
         const yesPlugin = i.moduleYes && i.moduleYes.plugin;
         const noPlugin = i.moduleNo && i.moduleNo.plugin;
         if (yesPlugin && !hasValue(plugins, yesPlugin) && needPlugin(i.moduleYes)) {
            plugins.push(yesPlugin);
         }
         if (noPlugin && !hasValue(plugins, noPlugin) && needPlugin(i.moduleNo)) {
            plugins.push(noPlugin);
         }
      } else if (i.plugin === 'browser' || i.plugin === 'optional') {
         const inPlugin = i.moduleIn && i.moduleIn.plugin;
         if (inPlugin && !hasValue(plugins, inPlugin) && needPlugin(i.moduleIn)) {
            plugins.push(inPlugin);
         }
      }
   });

   newDeps = newDeps.filter((i) => {
      if (i.plugin === 'is') {
         const yesPlugin = i.moduleYes && i.moduleYes.plugin;
         const noPlugin = i.moduleNo && i.moduleNo.plugin;
         return !hasValue(pluginsOnlyDeps, yesPlugin) && !hasValue(pluginsOnlyDeps, noPlugin);
      }
      if (i.plugin === 'browser' || i.plugin === 'optional') {
         const inPlugin = i.moduleIn && i.moduleIn.plugin;
         return !hasValue(pluginsOnlyDeps, inPlugin);
      }
      return !hasValue(pluginsOnlyDeps, i.plugin);
   });

   // формируем объект зависимости для плагина и вставляем в начало массива зависимостей
   plugins
      .map(name => ({
         fullName: name,
         amd: true
      }))
      .forEach(function pushPluginsDependencies(plugin) {
         newDeps.unshift(plugin);
      });

   return newDeps;
}

/**
 * Возвращает полный путь для модуля
 * @param {Object} grunt
 * @param {Meta} dep
 * @param {string} plugin
 * @return {string}
 */
function getModulePath(grunt, dep, plugin, errMes) {
   /**
    * Набор плагинов для модулей типа plugin1!plugin2!SomeModule
    * чтобы независимо от порядка плагинов правильно определять наличие
    * определённого плагина.
    */
   const modulePlugins = new Set([plugin, dep.plugin]);
   let pathToModule = '';
   try {
      if (dep.module) {
         if (dep.plugin === 'text' || dep.plugin === 'native-css') {
            pathToModule = dep.module;
         } else if (dep.plugin === 'i18n') {
            let jsPath, cssPath, countryPath;

            /**
             * Перебираем все доступные языки и пытаемся получить путь до любой css или json
             */
            availableLangs.forEach((lang) => {
               jsPath = i18n.getDictPath(dep.module, lang, 'json');
               cssPath = i18n.getDictPath(dep.module, lang, 'css');
               countryPath = i18n.getDictPath(dep.module, lang.split('-')[1], 'css');

               pathToModule = jsPath || cssPath || countryPath || '';
            });
         } else {
            pathToModule = requirejsPathResolver(dep.module, dep.plugin);
         }
      } else {
         pathToModule = dep.fullName;
      }

      pathToModule = pathToModule ? path.normalize(pathToModule).replace(dblSlashes, '/') : '';

      if (pathToModule) {
         // добавляем расширение модуля в путь до работы функции requirejs.toUrl,
         // поскольку она требует обязательного наличия расширения.
         let ext = path.extname(pathToModule).substr(1);
         if (
            !ext ||
            (dep.plugin === 'html' && ext !== 'xhtml') ||
            (dep.plugin !== 'html' && dep.plugin !== 'text' && ext !== dep.plugin)
         ) {
            switch (dep.plugin) {
               case 'html':
                  ext = 'xhtml';
                  break;
               case 'i18n':
                  ext = '';
                  break;
               case 'native-css':
                  ext = 'css';
                  break;
               default:
                  if (!dep.plugin) {
                     ext = 'js';
                  } else {
                     ext = dep.plugin;
                  }
                  break;
            }
            pathToModule = pathToModule + (ext ? `.${ext}` : '');
         }
         pathToModule = global.requirejs.toUrl(pathToModule);

         /**
          * Если какие-то файлы локализации присутствуют, оставляем путь до папки верхнего уровня,
          * чтобы в i18nLoader найти в ней словари для всех доступных языков.
          */
         if (dep.plugin === 'i18n') {
            [pathToModule] = pathToModule.split('lang/');
         }

         /**
          * Если плагин optional и сформированного пути не существует, тогда нету смысла помещать
          * данный путь в module dependencies
          */
         if (modulePlugins.has('optional')) {
            if (!fs.pathExistsSync(pathToModule)) {
               return '';
            }
         }
      }
   } catch (e) {
      if (!modulePlugins.has('optional') && !rjsPaths[dep.fullName]) {
         logger.warning({
            message: errMes,
            error: e
         });
      }
   }

   return pathToModule;
}

/**
 * Регистрирует модуль как ноду, если он еще не зарегистрирован
 * @param {Object} grunt
 * @param {DepGraph} graph
 * @param {String} applicationRoot - полный путь до корня сервиса
 * @param {Meta} dep
 * @param {string} plugin
 */
function registerNodeMaybe(grunt, graph, applicationRoot, dep, plugin, errMes) {
   // Встретили зависимость, для которой еще нет ноды в графе
   if (dep && !graph.hasNode(dep.fullName)) {
      let pathToModule;
      try {
         pathToModule = getModulePath(grunt, dep, plugin, errMes);
      } catch (e) {
         // pass;
         // ловим эксепшн из pathResolver, чтобы не хламить сборку
      }

      if (pathToModule) {
         dep.fullPath = pathToModule;

         graph.registerNode(dep.fullName, {
            path: parsePathForPresentationService(applicationRoot, dep.fullPath)
         });
      }
   }
}

/**
 * Регистрирует зависимость модуля, если она еще не зарегистрирована
 * @param {Object} grunt
 * @param {DepGraph} graph
 * @param {String} applicationRoot - полный путь до корня сервиса
 * @param {Meta} dep
 * @return {String}
 */
function registerDependencyMayBe(grunt, graph, applicationRoot, errMes, dep) {
   if (dep.plugin === 'is') {
      registerNodeMaybe(grunt, graph, applicationRoot, dep.moduleYes, dep.plugin, errMes);
      registerNodeMaybe(grunt, graph, applicationRoot, dep.moduleNo, dep.plugin, errMes);
   } else if (dep.plugin === 'browser' || dep.plugin === 'optional') {
      registerNodeMaybe(grunt, graph, applicationRoot, dep.moduleIn, dep.plugin, errMes);
      getComponentForTmpl(grunt, graph, applicationRoot, dep.moduleIn);
   } else {
      registerNodeMaybe(grunt, graph, applicationRoot, dep, dep.plugin, errMes);
      getComponentForTmpl(grunt, graph, applicationRoot, dep);
      getDependenciesForI18N(grunt, graph, applicationRoot, dep);
   }

   return dep.fullName;
}

/**
 * Добавляет зависимости для tmpl плагина
 * @param {Object} grunt
 * @param {DepGraph} graph
 * @param {String} applicationRoot - полный путь до корня сервиса
 * @param {Meta} mod
 */
function getComponentForTmpl(grunt, graph, applicationRoot, mod) {
   if (mod && mod.plugin === 'tmpl' && mod.fullPath) {
      try {
         // Можем не прочитать, так как подключили через optional
         const text = fs.readFileSync(mod.fullPath);
         if (text) {
            const tmplstr = global.requirejs('Core/tmpl/tmplstr');
            const config = global.requirejs('View/config');
            const arr = tmplstr.getComponents(text, config).map(dp => ({
               type: 'Literal',
               value: dp
            }));
            const d = getDependencies(grunt, mod.fullPath, arr);
            const errMes = `-------- Parent name: "${mod.fullName}"; Parent path: "${mod.fullPath}"`;
            graph.addDependencyFor(
               mod.fullName,
               d.map(registerDependencyMayBe.bind(undefined, grunt, graph, applicationRoot, errMes))
            );
         }
      } catch (err) {
         logger.warning({
            error: err
         });
      }
   }
}

/**
 * Добавляет зависимости для i18n плагина
 * @param {Object} grunt
 * @param {DepGraph} graph
 * @param {String} applicationRoot - полный путь до корня сервиса
 * @param {Meta} mod
 */
function getDependenciesForI18N(grunt, graph, applicationRoot, mod) {
   if (mod && mod.plugin === 'i18n' && mod.fullPath) {
      try {
         const deps = [];
         const resourceRoot = path.join(applicationRoot, 'resources');
         availableLangs.forEach((lang) => {
            const country = lang.split('-')[1];
            const jsonPath = path.join(mod.fullPath, 'lang', lang, `${lang}.json`);
            const dictPath = jsonPath.replace('.json', '.js');
            const dictModule = path
               .relative(resourceRoot, dictPath)
               .replace(dblSlashes, '/')
               .replace(isWS, 'WS')
               .replace('.js', '');

            const cssPath = path.join(mod.fullPath, 'lang', lang, `${lang}.css`);
            const cssModule = `native-css!${path
               .relative(resourceRoot, cssPath)
               .replace(dblSlashes, '/')
               .replace(isCss, '')
               .replace(isWS, 'WS')}`;

            const countryPath = path.join(mod.fullPath, 'lang', country, `${country}.css`);
            const countryModule = `native-css!${path
               .relative(resourceRoot, countryPath)
               .replace(dblSlashes, '/')
               .replace(isCss, '')
               .replace(isWS, 'WS')}`;

            if (fs.existsSync(cssPath)) {
               deps.push({ plugin: 'native-css', fullPath: cssPath, fullName: cssModule });
            }
            if (fs.existsSync(countryPath)) {
               deps.push({ plugin: 'native-css', fullPath: countryPath, fullName: countryModule });
            }

            if (fs.existsSync(dictPath)) {
               deps.push({ plugin: 'js', fullPath: dictPath, fullName: dictModule });
            }
         });

         deps.forEach((dep) => {
            if (!graph.hasNode(dep.fullName)) {
               graph.registerNode(dep.fullName, {
                  path: path.relative(applicationRoot, dep.fullPath)
               });
            }
         });

         graph.addDependencyFor(mod.fullName, deps.map(dep => dep.fullName));
      } catch (err) {
         logger.warning({
            error: err
         });
      }
   }
}

/**
 * Получаем AST дерево из js файла
 * @param {String} text
 * @return {Object|Error}
 */
function parseModule(text) {
   let res;
   try {
      res = esprima.parse(text);
   } catch (e) {
      res = e;
   }
   return res;
}

/**
 * Перестраивает пути до WS модулей в случае сборки для Сервиса Представлений
 * Таска tmpl-build работает по module-dependencies и она не в курсе существования
 * WS.Core и WS.Deprecated.
 * @param {String} applicationRoot - полный путь до корня сервиса
 * @param {String} fullPath - полный путь до модуля
 */
function parsePathForPresentationService(applicationRoot, fullPath) {
   const presentationService = fs.pathExistsSync(path.join(applicationRoot, 'resources', 'WS.Core'));
   let modulePath = path.relative(applicationRoot, fullPath),
      parts;

   if (presentationService) {
      parts = modulePath.split(path.sep);
      if (parts[0] === 'ws') {
         if (parts[1] === 'deprecated') {
            modulePath = modulePath.replace([parts[0], parts[1]].join(path.sep), 'WS.Deprecated');
         } else {
            modulePath = modulePath.replace(/^ws/, 'WS.Core');
         }
         modulePath = `resources${path.sep}${modulePath}`;
      }
   }
   return modulePath;
}

/**
 * @callback collectDependencies~callback
 * @param {Error} error
 * @param {String} [graph]
 */

/**
 * Ищет и регистрирует все модули и их зависимости в файле module-dependencies.json
 * @param {Object} grunt
 * @param {DepGraph} graph
 * @param {Array.<String>} jsFiles - массив путей до js файлов, в которых ищем модули
 * @param {Object} jsModules - объект известных модулей с учетом перекрытия
 * @param {String} applicationRoot - полный путь до корня сервиса
 * @param {collectDependencies~callback} taskDone
 */
function collectDependencies(grunt, graph, jsFiles, jsModules, applicationRoot, taskDone) {
   logger.debug(`Building dependencies tree on ${jsFiles.length} files`);
   async.eachSeries(
      jsFiles,
      (fullPath, done) => {
         logger.debug(`Loading dependencies for ${fullPath}`);
         fs.readFile(fullPath, 'utf8', function moduleParser(err, res) {
            if (err) {
               done(err);
               return;
            }
            const ast = parseModule(res);

            if (ast instanceof Error) {
               ast.message += `\nPath: ${fullPath}`;
               done(ast);
               return;
            }

            let myName,
               meta,
               deps = [],
               errMes;
            traverse(ast, {
               enter: function getModuleNameAndDependencies(node) {
                  if (
                     node.type === 'CallExpression' &&
                     node.callee.type === 'Identifier' &&
                     node.callee.name === 'define'
                  ) {
                     if (node.arguments[0].type === 'Literal' && typeof node.arguments[0].value === 'string') {
                        myName = node.arguments[0].value;
                        if (node.arguments[1].type === 'ArrayExpression') {
                           deps = getDependencies(grunt, fullPath, node.arguments[1].elements);
                        }
                     } else if (
                        node.arguments[0].type === 'ArrayExpression' ||
                        node.arguments[0].type === 'FunctionExpression'
                     ) {
                        logger.debug(`Ignore anonymous define ${fullPath}`);
                        return;
                     } else {
                        logger.debug(`Fail parse ${fullPath}`);
                        return;
                     }

                     meta = getMeta(myName);

                     const needToRegister =
                        (meta.plugin === 'js' && (!jsModules[meta.module] || jsModules[meta.module] === fullPath)) ||
                        meta.plugin !== 'js';

                     errMes = `-------- Parent module: "${myName}"; Parent path: "${fullPath}"`;

                     const registeredDependencies = deps.map(
                        registerDependencyMayBe.bind(undefined, grunt, graph, applicationRoot, errMes)
                     );

                     if (needToRegister) {
                        /**
                         * nodes['(supportedPlugins)!NAME.SPACE.MODULE'] = { path: '/path/to/module/file' }
                         */
                        graph.registerNode(myName, {
                           path: parsePathForPresentationService(applicationRoot, fullPath),
                           amd: true
                        });

                        /**
                         * links['(supportedPlugins)!NAME.SPACE.MODULE'] =
                         *    [ '(supportedPlugins)!NAME.SPACE.MODULE', ... ]
                         */
                        graph.addDependencyFor(myName, registeredDependencies);
                     }
                  }
               }
            });

            done();
         });
      },
      (err) => {
         if (err) {
            taskDone(err);
         } else {
            taskDone(null, graph.toJSON());
         }
      }
   );
}

function addRoot(root) {
   return p => (root ? path.join(root, p) : p);
}

function merge(obj1, obj2) {
   const result = {};
   Object.keys(obj1).forEach((name) => {
      result[name] = path.normalize(obj1[name]);
   });

   Object.keys(obj2).forEach((name) => {
      result[name] = result[name] || path.normalize(obj2[name]);
   });

   return result;
}

function map(obj, fn) {
   const result = {};
   Object.keys(obj).forEach((name) => {
      result[name] = fn(obj[name]);
   });
   return result;
}

function makeDependenciesGraph(grunt, root, applicationRoot, jsFiles, done) {
   const graph = new DepGraph(),
      coreConstants = global.requirejs('Core/constants'),
      jsCoreModules = map(coreConstants.jsCoreModules, addRoot(path.join(applicationRoot, 'ws'))),
      jsModules = map(coreConstants.jsModules, addRoot(root)),
      modules = merge(jsCoreModules, jsModules);

   collectDependencies(grunt, graph, jsFiles, modules, applicationRoot, done);
}

module.exports = makeDependenciesGraph;
