'use strict';

const esprima = require('esprima'),
   { traverse } = require('estraverse');

const NAME_NAVIGATION = /(optional!)?(js!SBIS3\.NavigationController|Navigation\/NavigationController)$/;

function findExpression(node, left) {
   return (
      node.type === 'ExpressionStatement' &&
      node.expression &&
      node.expression.type === 'AssignmentExpression' &&
      node.expression.operator === '=' &&
      node.expression.left.type === 'MemberExpression' &&
      node.expression.left.property.name === left &&
      node.expression.left.object &&
      node.expression.left.object.type === 'Identifier'
   );
}

function parseObjectExpression(properties) {
   const obj = {};
   properties.forEach((prop) => {
      if (prop.value.type === 'ArrayExpression') {
         obj[prop.key.name] = [];
         for (const element of prop.value.elements) {
            obj[prop.key.name].push(element.value);
         }
      } else {
         obj[prop.key.name] = prop.value.value;
      }
   });
   return obj;
}

function parseJsComponent(text) {
   const result = {};
   let ast;
   try {
      ast = esprima.parse(text);
   } catch (error) {
      throw new Error(`Ошибка при парсинге: ${error.toString()}`);
   }

   let returnStatement;
   const arrExpr = [];

   traverse(ast, {
      enter(node) {
         if (
            findExpression(node, 'webPage') &&
            node.expression.right &&
            node.expression.right.type === 'ObjectExpression'
         ) {
            arrExpr.push(node.expression);
         }

         if (findExpression(node, 'title') && node.expression.right && node.expression.right.type === 'Literal') {
            arrExpr.push(node.expression);
         }

         if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'define') {
            if (node.arguments[0].type === 'Literal' && typeof node.arguments[0].value === 'string') {
               result.componentName = node.arguments[0].value;
            }
            const index = node.arguments.length > 2 ? 1 : 0;
            if (node.arguments[index].type === 'ArrayExpression' && node.arguments[index].elements instanceof Array) {
               result.componentDep = [];
               node.arguments[index].elements.forEach((elem) => {
                  if (elem && elem.value) {
                     result.componentDep.push(elem.value);
                     if (elem.value.startsWith('css!theme?')) {
                        if (!result.themedStyles) {
                           result.themedStyles = [];
                        }
                        result.themedStyles.push(`${elem.value.replace('css!theme?', '')}.less`);
                     }
                  }
               });
            }

            let fnNode = null;
            if (node.arguments[1] && node.arguments[1].type === 'FunctionExpression') {
               fnNode = node.arguments[1].body;
            } else if (node.arguments[2] && node.arguments[2].type === 'FunctionExpression') {
               fnNode = node.arguments[2].body;
            }
            if (fnNode) {
               if (fnNode.body && fnNode.body instanceof Array) {
                  fnNode.body.forEach((i) => {
                     if (i.type === 'ReturnStatement') {
                        returnStatement = i.argument;
                     }
                  });
               }
            }
         }
      }
   });

   if (arrExpr.length && returnStatement) {
      const opts = {};

      arrExpr.forEach((expr) => {
         if (expr.left.object.name === returnStatement.name) {
            if (expr.right.type === 'ObjectExpression') {
               opts[expr.left.property.name] = parseObjectExpression(expr.right.properties);
            } else {
               opts[expr.left.property.name] = expr.right.value;
            }
         }
      });

      if (opts.hasOwnProperty('webPage')) {
         // отсеем то, что не запланировано
         result.webPage = {};
         if (opts.webPage.hasOwnProperty('htmlTemplate') && opts.webPage.htmlTemplate) {
            result.webPage.htmlTemplate = opts.webPage.htmlTemplate.trim();
         }
         if (opts.webPage.hasOwnProperty('title') && opts.webPage.title) {
            result.webPage.title = opts.webPage.title;
         } else if (opts.hasOwnProperty('title') && opts.title) {
            result.webPage.title = opts.title;
         }
         if (opts.webPage.hasOwnProperty('outFileName') && opts.webPage.outFileName) {
            result.webPage.outFileName = opts.webPage.outFileName;
         }
         if (opts.webPage.hasOwnProperty('urls') && opts.webPage.urls) {
            result.webPage.urls = opts.webPage.urls;
         }
      }
   }

   if (result.hasOwnProperty('componentDep') && result.componentName) {
      result.isNavigation = result.componentDep.some(name => NAME_NAVIGATION.test(name));
   }
   return result;
}

module.exports = parseJsComponent;
