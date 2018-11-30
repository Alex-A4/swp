'use strict';

const esprima = require('esprima'),
   { traverse } = require('estraverse');

/**
 * Допустимый тип right - объект или синхронная функция.
 */
function parseAssignment(assignmentNode, routes) {
   const errors = [];
   if (!isModuleExports(assignmentNode.left)) {
      return;
   }

   if (assignmentNode.right.type === 'ObjectExpression') {
      assignmentNode.right.properties.forEach((prop) => {
         observeProperty(prop, routes, errors);
      });
   } else if (assignmentNode.right.type === 'FunctionExpression') {
      let returnedObjects = [],
         innerFunctionDeclaration = 0,
         innerFunctionExpression = 0;

      /*
         * Если это функция, разберем ее с помощью esprima.
         * Найдем return функции и проверим, является ли возвращаемое значение объектом.
         * Используя счетчик innerFunctionDeclaration, будем понимать, находимся мы в теле интересующей нас
          * функции или функции, объявленной внутри нее.
         * На входе в узел декларации функции увеличиваем innerFunctionDeclaration, на выходе - уменьшаем.
         * Узел с типом ReturnStatement при innerFunctionDeclaration === 0 признаем соответствующим
          * интересующей функции.
          * Поскольку return-ов может быть несколько, складываем их в объект для последующего анализа.
         */
      traverse(assignmentNode.right.body, {
         enter(node) {
            if (node.type === 'FunctionDeclaration') {
               innerFunctionDeclaration++;
            }

            if (node.type === 'FunctionExpression') {
               innerFunctionExpression++;
            }

            if (node.type === 'ReturnStatement' && innerFunctionDeclaration === 0 && innerFunctionExpression === 0) {
               if (node.argument && node.argument.type === 'ObjectExpression' && node.argument.properties) {
                  returnedObjects.push(node.argument.properties);
               }
            }
         },
         leave(node) {
            if (node.type === 'FunctionDeclaration') {
               innerFunctionDeclaration--;
            }

            if (node.type === 'FunctionExpression') {
               innerFunctionExpression--;
            }
         }
      });

      returnedObjects = returnedObjects.filter((propArray) => {
         if (propArray) {
            let allPropertiesCorrect = true;
            propArray.forEach((prop) => {
               const isCorrectProp = observeProperty(prop, routes, errors);
               allPropertiesCorrect = allPropertiesCorrect && isCorrectProp;
            });
            return allPropertiesCorrect;
         }
         return false;
      });

      if (!returnedObjects.length) {
         let details = '';
         if (errors.length) {
            details = `Список некорректных роутингов: ${errors.join(', ')}`;
         }

         throw new Error('Некоторые роутинги не являются корректными. ' +
            `Роутинг должен задаваться строкой, которая начинается с символа "/". ${details}`);
      }
   } else {
      throw new Error('Экспортируется не объект и не функция');
   }
}

/**
 * Проверяет, соответствует ли левый операнд у "=" конструкции вида module.exports
 */
function isModuleExports(left) {
   return (
      left.type === 'MemberExpression' &&
      left.object &&
      left.object.name === 'module' &&
      left.property &&
      left.property.name === 'exports'
   );
}

/**
 * Анализирует объект с урлами роутингов.
 * Допустимы 2 вида:
 * {
 *    "/blah1.html": function() {...},
 *    ...
 * }
 *
 * {
 *    "/blah2.html": "js!SBIS3.Blah"
 * }
 *
 * Для первого варианта не заполняем поля isMasterPage и controller.
 * Для второго - заполним controller соответствующим роутингу модулем
 * */
function observeProperty(prop, routes, errors) {
   if (
      prop.type === 'Property' &&
      prop.key &&
      prop.value &&
      prop.key.type === 'Literal' &&
      prop.key.value.indexOf &&
      prop.key.value.indexOf('/') === 0
   ) {
      if (prop.value.type !== 'Literal') {
         routes[prop.key.value] = {
            controller: null
         };
      } else {
         routes[prop.key.value] = {
            controller: prop.value.value.toString()
         };
      }
      return true;
   }
   if (prop && prop.key && prop.key.hasOwnProperty('value')) {
      errors.push(prop.key.value.toString());
   }
   return false;
}

function parseRoutes(text) {
   const routes = {};
   let ast;
   try {
      ast = esprima.parse(text);
   } catch (error) {
      throw new Error(`Ошибка при парсинге: ${error.toString()}`);
   }

   traverse(ast, {
      enter(node) {
         // Ищем оператор =
         if (node.type === 'AssignmentExpression' && node.operator === '=') {
            parseAssignment(node, routes);
         }
      }
   });

   return routes;
}

// простаявляем флаг isMasterPage
function prepareToSave(routesInfo) {
   for (const routesFilePath in routesInfo) {
      if (!routesInfo.hasOwnProperty(routesFilePath)) {
         continue;
      }
      const routesRules = routesInfo[routesFilePath];
      for (const url of Object.keys(routesRules)) {
         // этот флаг нужен препроцессору.
         // сервис представлений его не смотрит.
         // TODO: удалить всесте с препроцессором
         routesRules[url].isMasterPage = false;
      }
   }
}

module.exports = {
   parseRoutes,
   prepareToSave
};
