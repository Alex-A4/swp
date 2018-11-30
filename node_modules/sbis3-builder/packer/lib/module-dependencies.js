'use strict';

const path = require('path');
const fs = require('fs-extra');
const DepGraph = require('./dependency-graph');
const pMap = require('p-map');
const MODULE_DEPENDENCIES_FILENAME = 'module-dependencies.json';

/**
 * @callback checkModuleDependenciesSanity~callback
 * @param {Error} [error]
 */

/**
 * Проверяем время создания module-dependencies.json. Оно должно быть больше времени создания contents.json.
 * Иначе мы рискуем получить уже неактульные данные.
 * @param {String} applicationRoot - путь до папки ресурсов
 * @param {checkModuleDependenciesSanity~callback} done - callback
 * @return {boolean}
 */
function checkModuleDependenciesSanity(applicationRoot, done) {
   const resourcesPath = path.join(applicationRoot, 'resources'),
      moduleDependenciesFile = path.join(resourcesPath, MODULE_DEPENDENCIES_FILENAME),
      contentsFile = path.join(resourcesPath, 'contents.json');

   if (!fs.existsSync(moduleDependenciesFile)) {
      done(new Error('No module dependencies file present. Please create with --collect-dependencies'));
      return false;
   }

   if (fs.existsSync(contentsFile) && fs.statSync(contentsFile).mtime > fs.statSync(moduleDependenciesFile).mtime) {
      done(new Error(`${MODULE_DEPENDENCIES_FILENAME} is outdated. Please recreate with --collect-dependencies`));
      return false;
   }

   return true;
}

/**
 * Получает путь до файла module-dependencies.json
 * @param {String} applicationRoot - путь до корня сервиса
 * @return {String}
 */
function getModuleDependenciesPath(applicationRoot) {
   return path.join(applicationRoot, 'resources', MODULE_DEPENDENCIES_FILENAME);
}

/**
 * Получение графа зависимостей
 * @param {String} applicationRoot
 * @return {DepGraph}
 */
function getDependencyGraphSync(applicationRoot) {
   const dg = new DepGraph();
   return dg.fromJSON(fs.readJsonSync(getModuleDependenciesPath(applicationRoot)));
}

/**
 * Получаем список интерфейсных модулей для дальнейшего
 * чтения помодульных module-dependencies
 */
async function getDirectoriesList(source) {
   const directories = [],
      sourceList = await fs.readdir(source);

   await pMap(
      sourceList,
      async(element) => {
         const elementStats = await fs.lstat(path.join(source, element));
         if (elementStats.isDirectory()) {
            directories.push(element);
         }
      },
      {
         concurrency: 10
      }
   );
   return directories;
}

/**
 * Собираем общий module-dependencies из помодульных
 * и сохраняем его.
 */
async function createModuleDepsFromParts(resourcePath) {
   const interfaceModules = await getDirectoriesList(resourcePath),
      mDeps = {
         nodes: {},
         links: {}
      };

   await pMap(interfaceModules, async(currentDir) => {
      const moduleMDepsPath = path.join(resourcePath, currentDir, 'module-dependencies.json');
      let moduleMDeps;
      if (await fs.pathExists(moduleMDepsPath)) {
         moduleMDeps = await fs.readJson(moduleMDepsPath);
         Object.keys(moduleMDeps.nodes).forEach((node) => {
            mDeps.nodes[node] = moduleMDeps.nodes[node];
         });
         Object.keys(moduleMDeps.links).forEach((node) => {
            mDeps.links[node] = moduleMDeps.links[node];
         });
      }
   });

   await fs.writeJson(path.join(resourcePath, 'module-dependencies.json'), mDeps);
   return mDeps;
}

async function getDependencyGraph(applicationRoot, splittedCore) {
   const dg = new DepGraph(),
      depsTreePath = getModuleDependenciesPath(applicationRoot);

   if (!(await fs.pathExists(depsTreePath)) && splittedCore) {
      const result = await createModuleDepsFromParts(path.join(applicationRoot, 'resources'));
      return dg.fromJSON(result);
   }
   return dg.fromJSON(await fs.readJson(depsTreePath));
}

module.exports = {
   checkModuleDependenciesSanity,
   getModuleDependenciesPath,
   getDependencyGraphSync,
   getDependencyGraph
};
