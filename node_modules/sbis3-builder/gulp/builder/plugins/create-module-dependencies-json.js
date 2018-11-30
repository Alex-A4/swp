/**
 * Плагин для создания module-dependencies.json (зависимости компонентов и их расположение. для runtime паковка)
 * @author Бегунов Ал. В.
 */

'use strict';

const through = require('through2'),
   Vinyl = require('vinyl'),
   path = require('path'),
   logger = require('../../../lib/logger').logger(),
   helpers = require('../../../lib/helpers'),
   transliterate = require('../../../lib/transliterate'),
   modulePathToRequire = require('../../../lib/modulepath-to-require');

// плагины, которые должны попасть в links
const supportedPluginsForLinks = new Set([
   'is',
   'html',
   'css',
   'json',
   'xml',
   'text',
   'native-css',
   'browser',
   'optional',
   'i18n',
   'tmpl',
   'wml',
   'cdn',
   'preload',
   'remote'
]);

// стандартные модули, которые и так всегда есть
const excludeSystemModulesForLinks = new Set(['module', 'require', 'exports']);

// нужно добавить эти плагины, но сами зависимости добавлять в links не нужно
const pluginsOnlyDeps = new Set(['cdn', 'preload', 'remote']);

const parsePlugins = dep => [
   ...new Set(
      dep
         .split('!')
         .slice(0, -1)
         .map((depName) => {
            if (depName.includes('?')) {
               return depName.split('?')[1];
            }
            return depName;
         })
   )
];

/**
 * Объявление плагина
 * @param {TaskParameters} taskParameters параметры для задач
 * @param {ModuleInfo} moduleInfo информация о модуле
 * @returns {stream}
 */
module.exports = function declarePlugin(taskParameters, moduleInfo) {
   return through.obj(
      function onTransform(file, encoding, callback) {
         callback(null, file);
      },

      /* @this Stream */
      function onFlush(callback) {
         try {
            const json = {
               links: {},
               nodes: {}
            };

            const filePathToRelativeInResources = (filePath) => {
               const ext = path.extname(filePath);
               const relativePath = path.relative(path.dirname(moduleInfo.path), filePath);
               const prettyPath = helpers.prettifyPath(path.join('resources', transliterate(relativePath)));
               return prettyPath.replace(ext, `.min${ext}`);
            };
            const componentsInfo = taskParameters.cache.getComponentsInfo(moduleInfo.name);
            Object.keys(componentsInfo).forEach((filePath) => {
               const info = componentsInfo[filePath];
               if (info.hasOwnProperty('componentName')) {
                  const depsOfLink = new Set();
                  if (info.hasOwnProperty('componentDep')) {
                     for (const dep of info.componentDep) {
                        let skipDep = false;
                        for (const plugin of parsePlugins(dep)) {
                           if (supportedPluginsForLinks.has(plugin)) {
                              depsOfLink.add(plugin);
                           }
                           if (pluginsOnlyDeps.has(plugin)) {
                              skipDep = true;
                           }
                        }
                        if (!excludeSystemModulesForLinks.has(dep) && !skipDep) {
                           depsOfLink.add(dep);
                        }
                     }
                  }
                  json.links[info.componentName] = [...depsOfLink];
                  json.nodes[info.componentName] = {
                     amd: true,
                     path: filePathToRelativeInResources(filePath).replace(/(\.ts|\.es)$/, '.js')
                  };
               }
            });

            const markupCache = taskParameters.cache.getMarkupCache(moduleInfo.name);
            for (const filePath of Object.keys(markupCache)) {
               const markupObj = markupCache[filePath];
               if (markupObj) {
                  /**
                   * добавляем в module-dependencies в links только информацию о tmpl и wml.
                   * Остальное незачем там хранить.
                   */
                  if (markupObj.nodeName.startsWith('tmpl!') || markupObj.nodeName.startsWith('wml!')) {
                     json.links[markupObj.nodeName] = markupObj.dependencies || [];
                  }
                  json.nodes[markupObj.nodeName] = {
                     amd: true,
                     path: filePathToRelativeInResources(filePath)
                  };
               }
            }

            const cssFiles = taskParameters.cache
               .getInputPathsByFolder(moduleInfo.path)
               .filter(filePath => filePath.endsWith('.less') || filePath.endsWith('.css'))
               .map(filePath => filePath.replace('.less', '.css'));
            for (const filePath of cssFiles) {
               const relativePath = path.relative(path.dirname(moduleInfo.path), filePath);
               const prettyPath = modulePathToRequire.getPrettyPath(helpers.prettifyPath(transliterate(relativePath)));
               const nodeName = `css!${prettyPath.replace('.css', '')}`;
               json.nodes[nodeName] = {
                  path: filePathToRelativeInResources(filePath)
               };
            }

            /**
             * сохраняем мета-данные по module-dependencies по требованию.
             */
            if (taskParameters.config.dependenciesGraph) {
               const jsonFile = new Vinyl({
                  path: 'module-dependencies.json',
                  contents: Buffer.from(JSON.stringify(helpers.sortObject(json), null, 2)),
                  moduleInfo
               });
               this.push(jsonFile);
            }

            taskParameters.cache.storeLocalModuleDependencies(json);
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
