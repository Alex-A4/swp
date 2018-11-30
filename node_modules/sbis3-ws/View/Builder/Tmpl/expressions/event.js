define('View/Builder/Tmpl/expressions/event', [
   'View/Builder/Tmpl/expressions/process',
   'View/Builder/Tmpl/modules/data/utils/functionStringCreator',
   'View/Builder/Tmpl/expressions/types',
   'View/Builder/Tmpl/handlers/error'
], function (processExpressions, FSC, expressions, errorHandling) {

   function embraceEventChain(array, ev) {
      var arr;

      if (array && isArray(array)) {
         array.push(ev);
         return array;
      }
      arr = [ev];
      arr.events = true;
      return arr;
   }
   function createEvent(name, fArgs, value, fn) {
      return {
         name: name,
         args: fArgs,
         value: value,
         fn: fn
      };
   }
   function compose() {
      var fns = arguments;

      return function (result) {
         for (var i = fns.length - 1; i > -1; i--) {
            result = fns[i].call(this, result);
         }

         return result;
      };
   }

   var
      getExpression = function getExpression(entity) {
         return entity.data[0];
      },
      getExpressionBody = function getExpressionBody(expression) {
         return expression.name.body;
      },
      getExpressionStatement = function getExpressionStatement(body) {
         return body[0];
      },
      getFunctionExpressionCallee = function getFunctionExpressionCalee(statement) {
         try {
            return statement.expression.callee.name;
         } catch (e) {
            errorHandling('"' + statement.string + '" is an invalid name for an event handler');
            throw new Error('Event handler name is invalid', e);
         }
      },
      getExpressionStatementFromExpression = function getExpressionStatementFromExpression(statement) {
         var fn = compose(getExpressionStatement, getExpressionBody, getExpression);
         return fn(statement);
      },
      getEventFunctionNameFromExpression = function (expression) {
         var actualFn = compose(getFunctionExpressionCallee, getExpressionStatementFromExpression);
         return actualFn(expression);
      },
      processEventAttribute = function processEventAttribute(value, name, data, isControl) {
         var
            res = processExpressions(value.data[0], data, this.calculators, this.filename),
            functionName = getEventFunctionNameFromExpression(value),
            funcLink = res.substring(0, res.indexOf(".apply")).replace('markupGenerator.escape(','')
               .replace('data', 'this'+(functionName?'':'._children')),
            //TODO: рефакторить после мержа оптимизации шаблонов
            objectLink = funcLink.substring(0, funcLink.indexOf(",\""))+"])",
            /* Генерируем функцию, в которой будет вызываться указанный в шаблоне обработчик. Также сохраняем здесь
            * ссылку на контрол, чей обработчик будет вызываться, это необходимо для распространения события */
            fn =  FSC.wrapAroundExec(
               '(function(self){ ' +
               '   var f = (function() { ' +
               '     var event = arguments[0];' +
               '     var res = ' + funcLink + '.apply(' + (functionName ? 'this' : objectLink) + ', arguments); ' +
               '     event.result = res;' +
               '  });' +
               '  f = f.bind(self);' +
               '  f.control = self;' +
               '  f.isControlEvent = ' + isControl+ ';'+
               '  return f;' +
               '})(viewController)' +
               '');

         res = FSC.wrapAroundExec(expressions.buildArgumentsArray.call(expressions, value.data[0].name.body[0].expression.arguments, data));

         return embraceEventChain(undefined, createEvent("event", res, functionName, fn));
      };

   return {
      embraceEventChain: embraceEventChain,
      createEvent: createEvent,
      isEvent: function isEvent(titleAttribute) {
         return /^(on:[A-z0-9])\w*$/.test(titleAttribute);
      },
      getEventName: function(eventAttribute) {
         return eventAttribute.slice(3).toLowerCase();
      },
      compose: compose,
      processEventAttribute: processEventAttribute
   }
});