define('View/Builder/Tmpl/expressions/types',
   [
      'View/Builder/Tmpl/modules/data/utils/functionStringCreator',
      'View/Builder/Tmpl/modules/utils/common',
      'View/Builder/Tmpl/decorators',
      'View/Builder/Tmpl/handlers/error'
   ], function (FSC, common, decorators, errorHandling) {
      'use strict';
      var bindingNames = {
            one: 'bind',
            two: 'mutable'
         },
         identifierExpressions = {
            'rk'    : 'thelpers.rk',
            'debug' : 'debug',
            '...'   : 'thelpers.uniteScope(markupGenerator.getScope(data), {parent: undefined, element: undefined})(thelpers.plainMerge)',
            'undefined': 'undefined',
            'null' : 'null'
         },
         escapeFalseDecorators = [
            'sanitize',
            'unescape',
            'money',
            'highlight',
            'colorMark',
            'wrapURLs'
         ],
         unescapedHtmlFunctionName = '__setHTMLUnsafe';

      identifierExpressions[unescapedHtmlFunctionName] = unescapedHtmlFunctionName;

      // приводит строку к стандартному виду, если это expression был Literal - без лишних кавычек, если что-то еще - чтобы эта строка была исполняемой
      function repairValue(str, type) {
         var res = str;
         if (typeof str === 'string') {
            if (type === 'Literal' && str !== 'null' && str !== 'undefined') {
               res = str.replace(/^"/, '').replace(/"$/, '');
            }
            else {
               res = FSC.wrapAroundExec(str);
            }
         }
         return res;
      }

      var
         checkForContextDecorators = function checkForContextDecorators(text) {
            return ~text.indexOf(bindingNames.one) || ~text.indexOf(bindingNames.two);
         },
         resolveIdentifier = function resolveIdentifier(node, data, forMemberExpression) {
            if (identifierExpressions[node.name]) {
               return identifierExpressions[node.name];
            } else if (data) {
               return data + '[' + FSC.wrapAroundQuotes(node.name) + ']';
            } else if (node.name === 'context') {
               // context может перекрываться в scope'е, поэтому вставляем проверку, так ли это
               // Если он перекрыт, возвращаем перекрытое поле, иначе сам контекст
               return '(!thelpers.getter(data, ["context"]) ? context : thelpers.getter(data, ["context"]))'; // может быть заменить getter на data.context? значительное сокращение
            } else if (forMemberExpression) {
               return 'data';
            } else {
               return 'thelpers.getter(data, ['+ FSC.wrapAroundQuotes(node.name) +'])';
            }
         },
         processUnescapedHtmlFunction = function processUnescapedHtmlFunction(args, data) {
            var res = '';
            if (args && args.length > 0) {
               var argument = args[0];
               res = this[argument.type](argument, data);
               this.escape = false;
               this.sanitize = false;
            }
            return res;
         };
      var expressions = {
         'Identifier': function IdentifierCaller(node, data) {
            return resolveIdentifier(node, data, false);
         },
         'ExpressionStatement': function ExpressionStatementCaller(node, data) {
            var expr = this[node.expression.type](node.expression, data);
            return expr;
         },
         'LogicalExpression': function LogicalExpressionCaller(node, data) {
            var left = this[node.left.type](node.left, data),
               right = this[node.right.type](node.right, data),
               exprString = left + ' ' + node + ' ' + right,
               val = logicalExpressionTypes(node.operator, left, right);
            function logicalExpressionTypes(operator, left, right) {
               if (operator) {
                  switch (operator) {
                     case '||':
                        return left + '||' + right;
                     case '&&':
                        return left + '&&' + right;
                     default:
                        errorHandling('Wrong conditional expression ' + exprString, this.filename);
                  }
               }
               errorHandling('Wrong conditional expression ' + exprString, this.filename);
            }
            return val;
         },
         /**
          * @return {string}
          */
         'Literal': function LiteralNodeCaller(node) {
            if (typeof node.value === 'string') {
               return '"' + node.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
            } else {
               // если в выражении участвует null или undefined, вернем их как строки, чтобы они были представлены
               // в функции как константы. Иначе вообще ничего не будет вставлено
               if (node.value === null) {
                  return 'null';
               }
               if (node.value === undefined) {
                  return 'undefined';
               }
               return node.value;
            }
         },
         'Brace': function BraceNodeCaller(node, data) {
            var expr = this[node.name.type](node.name, data);
            return '(' + expr + ')';
         },
         'MemberExpression': function MemberExpressionNodeCaller(node, data) {
            var
               obj = node,
               arr = [],
               res;

            if (obj.property) {
               while (obj.type === 'MemberExpression') {
                  arr.unshift(obj.computed ? this[obj.property.type](obj.property) : FSC.wrapAroundQuotes(obj.property.name));
                  obj = obj.object;
               }

               var dataSource = '';
               if (obj.type === 'Identifier') {
                  dataSource = resolveIdentifier(obj, data, true);
                  if (dataSource === 'data') {
                     // Значение любого data-идентификатора будет получено из scope'а, поэтому ставим
                     // data в качестве источника, а сам идентификтор ставим первым в списке полей
                     arr.unshift(FSC.wrapAroundQuotes(obj.name));
                  }
               } else {
                  // Если источник данных - сложное выражение, его нужно будет вычислять
                  dataSource = this[obj.type](obj, data);
               }

               res = 'thelpers.getter(' +  dataSource + ', [' + arr.join(',') + '])';
            } else {
               res = this[obj.object.type](obj.object, data);
            }

            return res;
         },
         'ConditionalExpression': function ConditionalExpressionNodeCaller(node, data) {
            var alternate = (node.alternate !== undefined) ? this[node.alternate.type](node.alternate, data) : undefined,
               val;
            val = '(' + this[node.test.type](node.test, data) + ' ? ' + this[node.consequent.type](node.consequent, data) + ' : ' + (alternate || '\'\'') + ')';
            return val;
         },
         buildArgumentsArray: function(args, data) {
            var mapFn = function mapArgs(value) {
               return this[value.type](value, data);
            };

            return '[' + common.mapForLoop(args, mapFn.bind(this)).toString() + ']';
         },
         'CallExpression': function CallExpressionCaller(node, data) {
            var callee = this[node.callee.type](node.callee, data),
               val;
            if (callee)  {
               if (callee === unescapedHtmlFunctionName) {
                  val = processUnescapedHtmlFunction.call(this, node.arguments, data);
               } else if (node.callee.object) {
                  val = callee + '.apply(' + this[node.callee.object.type](node.callee.object) + ', ' + this.buildArgumentsArray(node.arguments, data) + ')';
               } else {
                  val = callee + '.apply(data, ' + this.buildArgumentsArray(node.arguments, data) + ')';
               }
               return val;
            }
            errorHandling('Call expression error. Object to call on is "' + node.callee.string + '" equals to ' + callee, this.filename);
         },
         'BinaryExpression': function BinaryExpressionCaller(node, data) {
            var val = binaryExpressionTypes(node.operator, this[node.left.type](node.left, data), this[node.right.type](node.right, data));
            function binaryExpressionTypes(operator, left, right) {
               if (operator) {
                  switch (operator) {
                     case '*':
                        return left + '*' + right;
                     case '/':
                        return left + '/' + right;
                     case '%':
                        return left + '%' + right;
                     case '+':
                        return left + '+' + right;
                     case '-':
                        return left + '-' + right;
                     case '<':
                        return left + '<' + right;
                     case '>':
                        return left + '>' + right;
                     case '<=':
                        return left + '<=' + right;
                     case '>=':
                        return left + '>=' + right;
                     case '==':
                        return left + '==' + right;
                     case '!=':
                        return left + '!=' + right;
                     case '===':
                        return left + '===' + right;
                     case '!==':
                        return left + '!==' + right;
                     default:
                        errorHandling('Wrong binary expression ' + left + ' ' + operator + ' ' + right, this.filename);
                  }
               }
               errorHandling('Wrong binary expression ' + left + ' ' + operator + ' ' + right, this.filename);
            }
            return val;
         },
         'DecoratorChainCall': function DecoratorChainCallCaller(node, data, caller, nodecaller) {
            var decArgs = common.mapForLoop(node.argumentsDecorator || [], function decArgsMap(value) {
               return this[value.type](value, data);
            }.bind(this)), val;
            if (node.identifier === bindingNames.one || node.identifier === bindingNames.two ) {
               decArgs.unshift(this.attributeName)
            }
            if (~escapeFalseDecorators.indexOf(node.identifier)) {
               this.escape = false;
            }
            decArgs.unshift(caller);

            if (checkForContextDecorators(node.identifier)) {
               val = decorators[node.identifier].apply(undefined, decArgs);
            } else {
               val = 'thelpers.getDecorators()["' + node.identifier + '"].apply(undefined, [' + decArgs.toString() + '])';
            }
            return val;
         },
         'DecoratorChainContext': function DecoratorChainContextCaller(node, data, caller, nodecaller) {
            var val;
            if (node.entity) {
               val = this[node.fn.type](node.fn, data, this[node.entity.type](node.entity, data, caller, nodecaller), nodecaller);
            } else {
               val = this[node.fn.type](node.fn, data, caller, nodecaller);
            }
            return val;
         },
         'DecoratorCall': function DecoratorCallCaller(node, data) {
            var val = this[node.decorator.type](node.decorator, data, (node.caller ? this[node.caller.type](node.caller, data) : undefined), node.caller);
            if (
               (node.decorator.fn.identifier === bindingNames.one || node.decorator.fn.identifier === bindingNames.two)
               &&
               (this.isControl || checkForContextDecorators(node.decorator.string))
            ) {
               if (common.isString(this.configObject)) {
                  this.configObject.bindings = JSON.stringify(common.bindingArrayHolder(this.configObject.bindings, val.binding));
               } else {
                  this.configObject.bindings = common.bindingArrayHolder(this.configObject.bindings, val.binding);
               }
               return val.value;
            }
            return val;
         },
         'UnaryExpression': function UnaryExpressionCaller(node, data) {
            var val = unaryExpressionTypes(node.operator, this[node.argument.type](node.argument, data));
            node.value = val;
            function unaryExpressionTypes(operator, argument) {
               if (operator) {
                  switch (operator) {
                     case '+':
                        return '+' + argument;
                     case '-':
                        return '-' + argument;
                     case '!':
                        return '!' + argument;
                     default:
                        errorHandling('Wrong unary expression ' + operator + argument, this.filename);
                  }
               }
               errorHandling('Wrong unary expression ' + operator + argument, this.filename);
            }
            return val;
         },
         'ArrayExpression': function ArrayExpressionNodeCaller(node, data) {
            var val = common.mapForLoop(node.elements, function ArrayExpressionNodeMap(value) {
                  var res = this[value.type](value, data);
                  res = repairValue(res, value.type);
                  return res;
               }.bind(this)) || [];

            return FSC.getStr(val);
         },
         'ObjectExpression': function ObjectExpressionNodeCaller(node, data) {
            var obj = {}, massArr = common.mapForLoop(node.properties, function ObjectExpressionNodeMap(value) {
                  var key = this[value.key.type](value.key, data);
                  if (key) {
                     key = repairValue(key, value.key.type);
                     obj[key] = this[value.value.type](value.value, data);
                     obj[key] = repairValue(obj[key], value.value.type);
                  }
               }.bind(this)) || {};

            return FSC.getStr(obj);
         },
         'EmptyStatement': function EmptyStatementNodeCaller(node, data) {
         }
      };
      return expressions;
   });
