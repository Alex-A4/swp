'use strict';

const path = require('path'),
   fs = require('fs-extra'),
   pMap = require('p-map'),
   getMeta = require('../../lib/get-dependency-meta'),
   commonPackage = require('../../lib/common-package');

/**
 * Get all js modules
 * @param {DepGraph} dg - dependencies graph file
 * @param {String} applicationRoot
 * @return {Array}
 */
function getAllModules(dg, applicationRoot) {
   return (
      dg
         .getNodes()
         .map(getMeta)
         .filter(function onlyJS(node) {
            return node.plugin === 'js' && !(node.fullName.includes('tmpl!') || node.fullName.includes('html!'));
         })
         .map(function setFullPath(node) {
            node.fullPath = path.join(applicationRoot, dg.getNodeMeta(node.fullName).path);
            node.amd = dg.getNodeMeta(node.fullName).amd;
            return node;
         })
         .map(function setTempPath(node) {
            node.tempPath = node.fullPath.replace(/\.js$/, '.modulepack.js');
            return node;
         })

         // не включаем несуществующие пути(например в WS.Core не копируется папка test)
         .filter(function excludeNotExistingModules(node) {
            // eslint-disable-next-line no-sync
            return fs.existsSync(node.fullPath);
         })
         .filter(function excludePacked(node) {
            // eslint-disable-next-line no-sync
            return !fs.existsSync(node.tempPath);
         })
         .map(function getDependencies(node) {
            node.deps = dg
               .getDependenciesFor(node.fullName)
               .map(getMeta)
               .filter(function excludeEmptyDependencies(dep) {
                  let res = false;
                  if (dep.plugin === 'is') {
                     if (dep.moduleYes) {
                        res = dg.getNodeMeta(dep.moduleYes.fullName);
                     }
                     if (res && dep.moduleNo) {
                        res = dg.getNodeMeta(dep.moduleNo.fullName);
                     }
                  } else if ((dep.plugin === 'browser' || dep.plugin === 'optional') && dep.moduleIn) {
                     res = dg.getNodeMeta(dep.moduleIn.fullName);
                  } else {
                     res = dg.getNodeMeta(dep.fullName);
                  }
                  return res && res.path;
               })
               .filter(function excludeI18N(dep) {
                  return dep.plugin !== 'i18n' && dep.plugin !== 'css';
               })
               .filter(function excludeNonOwnDependencies(dep) {
                  let ownDeps = false;
                  if (dep.plugin === 'is') {
                     if (dep.moduleYes) {
                        ownDeps = new RegExp(`(.+!)?${node.module}($|\\\\|\\/)`).test(dep.moduleYes.fullName);
                     }
                     if (dep.moduleNo) {
                        ownDeps = new RegExp(`(.+!)?${node.module}($|\\\\|\\/)`).test(dep.moduleNo.fullName);
                     }
                  } else if ((dep.plugin === 'browser' || dep.plugin === 'optional') && dep.moduleIn) {
                     ownDeps = new RegExp(`(.+!)?${node.module}($|\\\\|\\/)`).test(dep.moduleIn.fullName);
                  } else {
                     ownDeps = new RegExp(`(.+!)?${node.module}($|\\\\|\\/)`).test(dep.fullName);
                  }
                  return ownDeps;
               })
               .map(function setFullPath(dep) {
                  if (dep.plugin === 'is') {
                     if (dep.moduleYes) {
                        dep.moduleYes.fullPath = path.join(
                           applicationRoot,
                           dg.getNodeMeta(dep.moduleYes.fullName).path
                        );
                        dep.moduleYes.amd = dg.getNodeMeta(dep.moduleYes.fullName).amd;
                     }
                     if (dep.moduleNo) {
                        dep.moduleNo.fullPath = path.join(applicationRoot, dg.getNodeMeta(dep.moduleNo.fullName).path);
                        dep.moduleNo.amd = dg.getNodeMeta(dep.moduleNo.fullName).amd;
                     }
                  } else if ((dep.plugin === 'browser' || dep.plugin === 'optional') && dep.moduleIn) {
                     dep.moduleIn.fullPath = path.join(applicationRoot, dg.getNodeMeta(dep.moduleIn.fullName).path);
                     dep.moduleIn.amd = dg.getNodeMeta(dep.moduleIn.fullName).amd;
                  } else {
                     dep.fullPath = path.join(applicationRoot, dg.getNodeMeta(dep.fullName).path);
                     dep.amd = dg.getNodeMeta(dep.fullName).amd;
                  }
                  return dep;
               })

               // пакуем вместе с модулями исключительно шаблоны.
               .filter(function includeOnlyTemplates(dep) {
                  return dep.plugin === 'tmpl' || dep.plugin === 'html';
               })

               // Add self
               .concat(node);
            return node;
         })
         .filter(function withDependencies(node) {
            return node.deps.length > 1;
         })
   );
}

function promisifyLoader(loader, dep, root) {
   return new Promise((resolve, reject) => {
      loader(dep, root, (err, res) => {
         if (err) {
            reject(err);
         } else {
            resolve(res);
         }
      });
   });
}

/**
 * @param {DepGraph} dg
 * @param {String} root - полный путь до корня приложения
 * @param {String} applicationRoot - полный путь до корня сервиса
 * @param {Boolean} splittedCore - разделённое ядро.
 */
async function packOwnDependencies(dg, root, applicationRoot, splittedCore) {
   const allModules = getAllModules(dg, applicationRoot);
   await pMap(
      allModules,
      async(item) => {
         const loadedDependencies = await pMap(
            item.deps,
            dep => promisifyLoader(commonPackage.getLoader(dep.plugin), dep, root),
            {
               concurrency: 5
            }
         );

         await fs.writeFile(
            item.tempPath,
            loadedDependencies.reduce((res, modContent) => res + (res ? '\n' : '') + modContent, '')
         );
      },
      {
         concurrency: 5
      }
   );

   /**
    * Для Сервиса Представлений не трогаем оригиналы и оставляем .modulepack.js файлы, они в дальнейшем
    * в таске минификации будут минифицированы и сохранены в .min.js, а
    * .modulepack.js удалены.
    */
   if (!splittedCore) {
      await pMap(
         allModules,
         async(item) => {
            /**
             * для начала удостоверимся, что временный файл существует, поскольку один и тот же путь может
             * быть у разных модулей-оригинал или например через is! плагин, это совершенно отдельные узлы и они
             * также обрабатываются отдельно, но при этом работают с одним путём.
             */
            if (await fs.pathExists(item.tempPath)) {
               // Старую js тоже надо сохранить
               await fs.copy(item.fullPath, item.fullPath.replace(/(\.js)$/, '.original$1'));
               await fs.copy(item.tempPath, item.fullPath);
               await fs.unlink(item.tempPath);
            }
         },
         {
            concurrency: 20
         }
      );
   }
}

module.exports = packOwnDependencies;
