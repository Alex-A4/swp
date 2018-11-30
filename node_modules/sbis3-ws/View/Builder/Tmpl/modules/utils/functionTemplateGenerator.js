define('View/Builder/Tmpl/modules/utils/functionTemplateGenerator', [
      'text!View/Builder/Tmpl/modules/templates/templateFunctionTemplate.jstpl',
      'text!View/Builder/Tmpl/modules/templates/templateObjectHtmlTemplate.jstpl',
      'text!View/Builder/Tmpl/modules/templates/templateObjectHtmlTemplateNew.jstpl',
      'text!View/Builder/Tmpl/modules/templates/templateStringTemplate.jstpl',
      'View/Builder/Tmpl/modules/data/utils/functionStringCreator',
      'View/Builder/Tmpl/expressions/dirtyCheckingPatch'
   ],
   function (
      templateFunctionTemplate,
      templateObjectHtmlTemplate,
      templateObjectHtmlTemplateNew,
      templateStringTemplate,
      FSC,
      dirtyCheckingPatch
   ) {
      'use string';

      var clearPropertyName = function clearPropertyName(propertyName) {
            var pName = propertyName;
            if (pName) {
               pName = pName.split('/');
               return pName[pName.length - 1];
            }
            return pName;
         },
         useFuncTemplate = function useFuncTemplate(templateFunction, html,  propertyName) {
            return templateFunction
               .replace('/*#HTML_PROPERTY_NAME#*/', propertyName)
               .replace('/*#GENERATED_STRING#*/',
                  this.getString(html, {}, this.handlers, {}, true)
               );
         },
         generateStringReadyToUse = function generateStringReadyToUse(funcText, propName) {
            var func = new Function('data, attr, context, isVdom, sets', funcText);
            this.includedFunctions[propName] = func;
            if (this.privateFn){
               this.privateFn.push(func);
               return this.privatePrefix+''+(this.privateFn.length-1).toString();
            }
            return func.toString().replace(/\n/g, ' ');
         },
         generateFunctionString = function generateFunctionString(htmlPropertyName, html, string, injected) {
            var cleanPropertyName = clearPropertyName(htmlPropertyName),
               funcText,
               generatedString;
            if (string) {
               funcText = useFuncTemplate.call(this, templateStringTemplate, html, cleanPropertyName);
               generatedString =
                  createFunctionWrappers.call(this, generateStringReadyToUse.call(this, funcText, cleanPropertyName))
                  + '(Object.create(data), null, context)'
            } else {
               var dirtyCh = '';
               if (!this.includedFn){
                  dirtyCh = 'this.func.internal = ';
               }
               if (injected && injected.internal){
                 dirtyCheckingPatch.doDirtyCheckingSafety(injected.internal);
                 dirtyCh += FSC.getStr(injected.internal, cleanPropertyName);
               } else {
                  dirtyCh += '{}';
                  if (!this.includedFn){
                     dirtyCh += ';';
                  }
               }
               funcText = useFuncTemplate.call(this, templateFunctionTemplate, html, cleanPropertyName);
               generatedString = createFunctionWrappers.call(this, generateStringReadyToUse.call(this, funcText, cleanPropertyName), dirtyCh);
            }
            return new String(generatedString);
         },
         createFunctionWrappers = function createFunctionWrappers(functionString, dirtyString) {
            if (!dirtyString){
               dirtyString = '';
            }

            if (this.includedFn){
               return templateObjectHtmlTemplateNew.replace(/\n/g, ' ')
                  .replace('/*#FUNC#*/', functionString).replace('/*#FUNCTOSTR#*/', functionString)
                  .replace('/*#DIRTY#*/', dirtyString||'{}');
            }
            return templateObjectHtmlTemplate
               .replace(/\n/g, ' ')
               .replace('/*#FUNC#*/', functionString)
               .replace('/*#DIRTY#*/', dirtyString);
         },
         generateFunction = function generateFunction(htmlPropertyName, html, string, injected) {
            var functionResult = generateFunctionString.call(this, htmlPropertyName, html, string, injected);
            functionResult.innerFunction = true;
            return functionResult;
         };



      templateFunctionTemplate = templateFunctionTemplate.replace(/\r/g, '');
      templateObjectHtmlTemplate = templateObjectHtmlTemplate.replace(/\r/g, '');
      templateStringTemplate = templateStringTemplate.replace(/\r/g, '');

      return {
         generateFunction: generateFunction,
         generateEntityFunction: function generateEntityFunction(htmlPropertyName, html) {
            return generateFunction.call(this, htmlPropertyName, html);
         }
      };
   }
);