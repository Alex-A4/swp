'use strict';

const
   libPackHelpers = require('./helpers/librarypack'),
   escodegen = require('escodegen'),
   esprima = require('esprima'),
   path = require('path'),
   logger = require('../logger').logger(),
   pMap = require('p-map'),
   { traverse } = require('estraverse');


function checkDependencyForExisting(dependencyName, privateDependenciesSet) {
   let existsInSet = false;
   privateDependenciesSet.forEach((dependency) => {
      if (dependency.moduleName === dependencyName) {
         existsInSet = true;
      }
   });
   return existsInSet;
}

async function dependencyWalker(
   sourceRoot,
   libraryName,
   currentDepTree,
   parentDependency,
   currentDependency,
   libraryDependenciesMeta,
   externalDependenciesToPush,
   privateModulesCache,
   privatePartsForCache,
   result,
   dependenciesTreeError
) {
   let newDepTree;
   if (!currentDepTree.has(currentDependency)) {
      const
         dependencyContent = await libPackHelpers.readModuleAndGetParamsNames(
            sourceRoot,
            libraryName,
            currentDependency,
            libraryDependenciesMeta,
            externalDependenciesToPush,
            privateModulesCache
         ),
         currentPrivateDependencies = dependencyContent.dependencies.filter((dep) => {
            if (dep === libraryName) {
               logger.error({
                  message: `Cycle library dependency. Parent module: ${currentDependency}`,
                  filePath: `${path.join(sourceRoot, libraryName)}.js`
               });
               dependenciesTreeError.enabled = true;
            }
            return libPackHelpers.isPrivate(dep);
         });

      newDepTree = new Set([...currentDepTree, currentDependency]);
      if (!checkDependencyForExisting(dependencyContent.moduleName, result)) {
         result.add(dependencyContent);

         // добавляем в список на запись в кэш dependencies. Нужно для инкрементальной сборки
         privatePartsForCache.push(dependencyContent.moduleName);
      }
      if (currentPrivateDependencies.length > 0) {
         await pMap(
            currentPrivateDependencies,
            async(childDependency) => {
               await dependencyWalker(
                  sourceRoot,
                  libraryName,
                  newDepTree,
                  currentDependency,
                  childDependency,
                  libraryDependenciesMeta,
                  externalDependenciesToPush,
                  privateModulesCache,
                  privatePartsForCache,
                  result,
                  dependenciesTreeError
               );
            },
            {
               concurrency: 10
            }
         );
      }
   } else {
      logger.error({
         message: `Cycle dependency detected: ${currentDependency}. Parent module: ${parentDependency}`,
         filePath: `${path.join(sourceRoot, libraryName)}.js`
      });
      dependenciesTreeError.enabled = true;
   }
}

async function recursiveAnalizeEntry(
   sourceRoot,
   libraryName,
   libraryDependenciesMeta,
   externalDependenciesToPush,
   privateDependencies,
   privateModulesCache,
   privatePartsForCache
) {
   const result = new Set();

   /**
    * Не будем ругаться через throw, просто проставим флаг.
    * Это позволит нам полностью проанализировать граф и сразу
    * выдать разработчикам все проблемные места.
    */
   const dependenciesTreeError = {};
   await pMap(
      privateDependencies,
      async(dependency) => {
         const currentTreeSet = new Set();
         await dependencyWalker(
            sourceRoot,
            libraryName,
            currentTreeSet,

            // parent module
            libraryName,

            // current dependency
            dependency,
            libraryDependenciesMeta,
            externalDependenciesToPush,
            privateModulesCache,
            privatePartsForCache,
            result,
            dependenciesTreeError
         );
      }
   );
   if (dependenciesTreeError.enabled) {
      throw new Error('Cycle dependencies detected. See logs.');
   }
   return result;
}

async function packCurrentLibrary(sourceRoot, privatePartsForCache, data, privateModulesCache) {
   const
      ast = esprima.parse(data),
      {
         libraryDependencies,
         libraryDependenciesMeta,
         libraryParametersNames,
         functionCallbackBody,
         topLevelReturnStatement,
         exportsDefine,
         libraryName
      } = libPackHelpers.getLibraryMeta(ast),
      externalDependenciesToPush = [];

   let privateDependenciesOrder = [];
   try {
      const privateDependenciesSet = Object.keys(libraryDependenciesMeta).filter(
         dependency => libraryDependenciesMeta[dependency].isLibraryPrivate
      );

      /**
       * рекурсивно по дереву получаем полный набор приватных частей библиотеки,
       * от которых она зависит.
       * @type {Set<any>} в качестве результата нам будет возвращён Set
       */
      privateDependenciesOrder = [...await recursiveAnalizeEntry(
         sourceRoot,
         libraryName,
         libraryDependenciesMeta,
         externalDependenciesToPush,
         privateDependenciesSet,
         privateModulesCache,
         privatePartsForCache
      )];
   } catch (error) {
      logger.error({
         message: 'Ошибка анализа приватных зависимостей библиотеки. Библиотека упакована не будет!',
         error,
         filePath: `${path.join(sourceRoot, libraryName)}.js`
      });

      // возвращаем исходную библиотеку для её дальнейшего сохранения в .min файл.
      return {
         compiled: data
      };
   }

   /**
    * сортируем приватные модули между собой, наиболее зависимые от других приватных частей модули
    * будут обьявляться в самом конце, самые независимые вначале.
    */
   privateDependenciesOrder = libPackHelpers.sortPrivateModulesByDependencies(privateDependenciesOrder);

   /**
    * производим непосредственно сами манипуляции с библиотекой:
    * 1) Добавляем в зависимости библиотеки внешние зависимости приватных частей библиотеки, если их нет в списке.
    * 2) Выкидываем из зависимостей библиотеки все приватные её части, уменьшая таким образом Стэк requirejs.
    * 3) Обьявляем сами приватные части библиотеки внутри неё и экспортируем наружу вместе с исходным экспортируемым
    * библиотекой объектом.
    */
   traverse(ast, {
      enter(node) {
         if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'define') {
            const currentReturnExpressions = [];

            libPackHelpers.addExternalDepsToLibrary(
               externalDependenciesToPush,
               libraryDependencies,
               libraryDependenciesMeta,
               libraryParametersNames
            );

            let packIndex;
            if (exportsDefine.position) {
               packIndex = exportsDefine.position + 1;
               if (topLevelReturnStatement) {
                  const returnArgument = topLevelReturnStatement.statement.argument;

                  /**
                   * надо проверить, что возвращается exports, иначе кидать ошибку.
                   */
                  if (escodegen.generate(returnArgument) !== 'exports') {
                     logger.error({
                        message: 'Библиотека в случае использования механизма exports должна возвращать в качестве результата именно exports',
                        filePath: `${path.join(sourceRoot, libraryName)}.js`
                     });
                  }
                  functionCallbackBody.body.splice(
                     topLevelReturnStatement.position,
                     1
                  );
               }
            } else {
               let exportsObject;

               if (escodegen.generate(functionCallbackBody.body[0]).includes('\'use strict\';')) {
                  packIndex = 1;
               } else {
                  packIndex = 0;
               }

               if (topLevelReturnStatement) {
                  const returnArgument = topLevelReturnStatement.statement.argument;
                  exportsObject = escodegen.generate(returnArgument);

                  /**
                   * в случае если возвращается последовательность операций, оборачиваем его
                   * и присваиваем exports результат выполнения этой последовательности операций
                   * Актуально для ts-конструкций вида "exports = {<перечисление экспортируемых свойств>}"
                   */
                  if (topLevelReturnStatement.returnsType === 'SequenceExpression') {
                     exportsObject = `(${exportsObject})`;
                  }

                  functionCallbackBody.body.splice(
                     topLevelReturnStatement.position,
                     1
                  );
               } else {
                  exportsObject = '{}';
               }
               currentReturnExpressions.push(`var exports = ${exportsObject};`);
            }

            privateDependenciesOrder.forEach((dep) => {
               const
                  argumentsForClosure = dep.dependencies
                     .filter((element, index) => (index <= dep.ast.params.length))
                     .map((dependency) => {
                        if (
                           libPackHelpers.isPrivate(dependency) &&
                           libPackHelpers.isInternalDependency(path.dirname(libraryName), dependency)
                        ) {
                           return `${libraryDependenciesMeta[dependency].names[0]}`;
                        }
                        return libraryDependenciesMeta[dependency].names[0];
                     });

               let [currentDependencyName] = libraryDependenciesMeta[dep.moduleName].names;

               /**
                * если имени для зависимости нет, значит модуль только импортится без передачи аргумента,
                * а значит в такой ситуации мы должны сгенерить имя сами для дальнейшего запакования
                * приватной зависимости.
                */
               if (!currentDependencyName) {
                  currentDependencyName = dep.moduleName.replace(/\//g, '_');
                  libraryDependenciesMeta[dep.moduleName].names.push(currentDependencyName);
               }

               const
                  libDependenciesList = libraryDependencies.map(dependency => dependency.value),
                  privateDependencyIndex = libDependenciesList.indexOf(dep.moduleName),
                  moduleCode = `var ${currentDependencyName} = function(){var exports = {};\nvar result =` +
                     `(${escodegen.generate(dep.ast)})(${argumentsForClosure});\n` +
                     'for (var property in result) {\n' +
                     'if (result.hasOwnProperty(property)) {\n' +
                     'exports[property] = result[property];\n' +
                     '}}' +
                     'return exports;\n}();';

               if (privateDependencyIndex !== -1) {
                  libPackHelpers.deletePrivateDepsFromList(
                     privateDependencyIndex,
                     libraryDependencies,
                     libraryParametersNames
                  );
               }

               functionCallbackBody.body.splice(
                  packIndex,
                  0,
                  esprima.parse(moduleCode)
               );
               packIndex++;
            });
            functionCallbackBody.body.push(esprima.parse(currentReturnExpressions.join('\n')));
            functionCallbackBody.body.push({
               'type': 'ReturnStatement',
               'argument': {
                  'type': 'Identifier',
                  'name': 'exports'
               }
            });
         }
      }
   });
   return {
      compiled: escodegen.generate(ast),
      newDependencies: libraryDependencies.map(object => object.value)
   };
}

module.exports = {
   packCurrentLibrary
};
