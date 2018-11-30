define('View/Builder/Tmpl/modules/data/object',
   [
      'Core/helpers/Hcontrol/configStorage',
      'Core/IoC',
      'View/Builder/Tmpl/expressions/dirtyCheckingPatch',
      'View/Builder/Tmpl/modules/utils/tag',
      'View/Builder/Tmpl/modules/data/utils/dataTypesCreator',
      'View/Builder/Tmpl/modules/utils/common',
      'View/Builder/Tmpl/modules/data/utils/functionStringCreator',
      'View/Builder/Tmpl/modules/utils/parse',
      'text!View/Builder/Tmpl/modules/templates/templateFunctionTemplate.jstpl',
      'text!View/Builder/Tmpl/modules/templates/templateObjectHtmlTemplate.jstpl',
      'text!View/Builder/Tmpl/modules/templates/templateObjectHtmlTemplateNew.jstpl'
   ], function objectLoader(configStorage,
                            IoC,
                            dirtyCheckingPatch,
                            tagUtils,
                            DTC,
                            common,
                            FSC,
                            parseUtils,
                            templateFunctionTemplate,
                            templateObjectHtmlTemplate,
                            templateObjectHtmlTemplateNew) {
   'use strict';

      templateFunctionTemplate = templateFunctionTemplate.replace(/\r/g, '');
      templateObjectHtmlTemplate = templateObjectHtmlTemplate.replace(/\r/g, '');
      templateObjectHtmlTemplateNew = templateObjectHtmlTemplateNew.replace(/\r/g, '');

      function checkSingleResultData(data, type) {
         return typeof data === 'string' && type !== 'Array';
      }

      function getChildrenData(children) {
         return children && children[0] && children[0].children;
      }

      return function objectTag(injected, types, scopeData, propertyName, restricted, root) {
      var 
         tObject = {}, 
         typeFunction, 
         nameExists, 
         i, 
         objectForMerge = {}, 
         curatedScope,
         result,
         realInjected,
         propName,
         useful,
         stepInto = false,
         templateObject = DTC.createHtmlDataObject([], scopeData),
         internalData,
         rootTemplateName = 'content',
         html;

      function writeObjectEntity(typeFunction, injected, types, scopeData, propName, falsy) {
         return typeFunction.call(this,
            injected,
            types,
            scopeData,
            propName,
            falsy
         );
      }

      function variativeTemplate(name) {
         return name === 'ws:if' || name === 'ws:else' || name === 'ws:for';
      }

      function createArray(children, real, types, scopeData, propName) {
         return writeObjectEntity.call(this,
            types['Array'],
            {
               attribs: real.attribs,
               internal: real.internal,
               children: children,
               isControl: real.isControl,
               rootConfig: real.rootConfig
            }, types, scopeData, propName, true
         );
      }

      function createTypeByPropertyName(nameExists, typeFunction, injected, real, config) {
         var ln = injected.length;
         if (typeFunction) {
            if (ln === 1) {
               var res = writeObjectEntity.call(this,
                  typeFunction,
                  {
                     attribs: injected[i].attribs,
                     internal: injected[i].internal,
                     children: injected[i].children,
                     isControl: real.isControl,
                     rootConfig: real.rootConfig
                  }, config.types, config.scopeData, config.propertyName
               );
               if (checkSingleResultData(res, nameExists)) {
                  res = DTC.createDataRepresentation(nameExists, res, getChildrenData(injected));
               }
               return res;
            }
         }
         return createArray.call(this,
            injected,
            real,
            types,
            scopeData,
            propertyName
         );
      }

      function createObjectByPropertyName(nameExists, types, injected, real, config) {
         var propName = config.propName ? config.propName + '/' + nameExists : nameExists;
         return writeObjectEntity.call(
            this,
            types.Object,
            {
               attribs: injected[i].attribs,
               internal: injected[i].internal,
               children: injected[i].children,
               isControl: real.isControl,
               rootConfig: real.rootConfig || config.curatedScope,
               rPropName: nameExists
            }, types, config.scopeData, propName
         );
      }

      /**
       * Узнаем существует имя тэга в числе модулей или нет?
       * @param nameExists
       * @returns {*|boolean}
       */
      function isEntityUsefulOrHTML(nameExists) {
         // условие с template для описания опции, через синтаксис ws:template внутри тега ws:Component или ws:partial
         return nameExists &&
            (!this._modules.hasOwnProperty(nameExists) || nameExists === 'template') &&
            !tagUtils.isTagRequirableBool.call(this, nameExists, DTC.injectedDataTypes) && !~DTC.injectedDataTypes.indexOf(nameExists);
      }
      objectForMerge = parseUtils.parseAttributesForData.call(this, {
         attribs: injected.attribs,
         isControl: injected.isControl, 
         configObject: objectForMerge,
         rootConfig: injected.rootConfig
      }, scopeData, propertyName, restricted);

      // Если есть служебные опции, делаем разбор их Expression'ов
      if (injected.internal) {
         injected.internal = parseUtils.parseInternalForData.call(
            this,
            injected.internal,
            scopeData, propertyName,
            injected.isControl,
            injected.rootConfig
         );
         internalData = injected.internal;
      } else {
         internalData = {};
      }
      
      if (objectForMerge && objectForMerge.createdscope) {
         curatedScope = objectForMerge.obj;
      } else {
         curatedScope = objectForMerge;
      }
      
      realInjected = injected;
      
      if (injected.children) {
         injected = injected.children;
      }

      stepInto = !(common.isArray(injected) && injected.filter(function (entity) {
         return variativeTemplate(entity && entity.name);
         }).length);

      for (i = 0; i < injected.length; i++) {
         nameExists = tagUtils.splitWs(injected[i].name);
            if (injected[i].children && stepInto) {
               typeFunction = types[nameExists];
               useful = isEntityUsefulOrHTML.call(this, nameExists);
               if ((propertyName || typeFunction)&& !useful) {
                  return createTypeByPropertyName.call(this,
                     nameExists,
                     typeFunction,
                     injected,
                     realInjected,
                     {
                        types: types,
                        scopeData: scopeData,
                        propertyName: propertyName
                     }
                  );
               }

               if (nameExists && !typeFunction && useful) {
                  tObject[nameExists] = createObjectByPropertyName.call(this,
                     nameExists,
                     types,
                     injected,
                     realInjected,
                     {
                        types:        types,
                        scopeData:    scopeData,
                        propName:     propertyName,
                        curatedScope: curatedScope

                     }
                  );

               } else {
                  /**
                   * Если рутовое перечисление. Пишем в массив опции content
                   */
                  if (root) {
                     nameExists = rootTemplateName;
                     propName = propertyName ? propertyName + '/' + nameExists : nameExists;
                     tObject[nameExists] = writeObjectEntity.call(this,
                        types.Object,
                        {
                           attribs: realInjected.attribs,
                           internal: realInjected.internal,
                           children: injected,
                           isControl: realInjected.isControl,
                           rootConfig: realInjected.rootConfig || curatedScope,
                           rPropName: nameExists
                        }, types, scopeData, propName
                     );
                  } else {
                     return DTC.createDataRepresentation(nameExists, this._processEntity(injected[i], templateObject.data));
                  }
               }
            } else {

               templateObject.html.push(injected[i]);

            }
      }

      if (objectForMerge !== undefined) {
         // Проверяем наличие переменных dirty-checking'а и добавляем "безопасные геттеры", если это необходимо
         // (Если используется опция, проброшенная на несколько уровней вложенности, нужно убедиться что она существует
         // на каждом уровне вложенности)
         dirtyCheckingPatch.doDirtyCheckingSafety(internalData);

         if (objectForMerge.createdscope) {
            result = common.plainMergeAttrs(tObject, curatedScope);
            if (common.isEmpty(result)) {
               /*В любом случае нельзя отдавать сам объект. Иначе он будет меняться по ссылке
                 и DirtyChecking не сможет найти изменения и обновить контрол*/
               tObject = FSC.injectFunctionCall('thelpers.uniteScope', [objectForMerge.createdscope, '{}']);
            } else {
               tObject = FSC.injectFunctionCall('thelpers.uniteScope', [objectForMerge.createdscope, FSC.getStr(result)]);
            }
         } else {
            tObject = common.plainMergeAttrs(tObject, curatedScope);
         }
      }
      if (templateObject.html.length > 0) {

         var htmlPropertyName = root ? rootTemplateName : realInjected.rPropName;
         html = templateObject.html;
         configStorage.merge(this._controlsData);

         if (tObject.type === 'string') {

            var result = '₪(' + this.getFunction(html, templateObject.data, this.handlers, undefined, true).toString().replace(/\n/g, ' ') + ')(Object.create(data), null, context)₪';
            if (result.indexOf("markupGenerator.createControl(")>-1){
               /**
                * TODO: слишком много предупреждений в логи
                * 1. Сократить сообщения так чтобы отображался только filename для tmpl
                * 2. Включить когда будет полный запрет
                */
               if (typeof window !== 'undefined' && window.leakDetectedMode) {
                  var num = result.indexOf('thelpers.templateError('),
                     numEnd = result.indexOf(';', num+1);
                  IoC.resolve('ILogger').error('Deprecated', 'Вы пытаетесь создать компонент внутри опции type=string. ' +
                     'PropertyName=' + htmlPropertyName + '. ResultFunction=' + result.substring(num, numEnd));
               }
            }

            return result;

         } else if (tObject.type === 'function') {

            /*
            Для обработки type="function" в конфигурации компонента
             */
            return FSC.functionTypeHanlder(this._processData.bind(this), html, undefined, parseUtils.parseAttributesForData);
         } else {
            /***
             * Сделано для того чтобы попадала родительская область видимости при применении инлайн-шаблона
             */
            var funcText = templateFunctionTemplate.replace('/*#HTML_PROPERTY_NAME#*/', htmlPropertyName)
                     .replace('/*#GENERATED_STRING#*/', this.getString(html, {}, this.handlers, {}, true)),
            func = new Function('data, attr, context, isVdom, sets', funcText);

            this.includedFunctions[htmlPropertyName] = func;
            if (this.privateFn){
               this.privateFn.push(func);

            }
            var fAsString = '';
            if (this.privateFn) {
               fAsString = this.privatePrefix+''+(this.privateFn.length-1);
            }else{
               fAsString = func.toString().replace(/\n/g, ' ');
            }

            var dirtyCh = '';
            if (injected && injected.internal){
               dirtyCheckingPatch.doDirtyCheckingSafety(injected.internal);
               dirtyCh += FSC.getStr(injected.internal, htmlPropertyName);
            } else {
               dirtyCh += '{}';
               if (!this.includedFn){
                  dirtyCh += ';';
               }
            }

            if (this.includedFn){
               templateObject.html = FSC.wrapAroundObject(templateObjectHtmlTemplateNew.replace(/\n/g, ' ')
                  .replace('/*#FUNC#*/', fAsString).replace('/*#FUNCTOSTR#*/', fAsString)
                  .replace('/*#DIRTY#*/', dirtyCh||'{}'));
            } else {
               templateObject.html = FSC.wrapAroundObject(templateObjectHtmlTemplate.replace(/\n/g, ' ')
                  .replace('/*#FUNC#*/', fAsString)
                  .replace('/*#DIRTY#*/', 'this.func.internal = ' + dirtyCh));
            }
            if (root) {
               tObject[rootTemplateName] = templateObject.html;
               return tObject;
            }
            return templateObject.html;
         }
      } else if (tObject.type === 'string') {
         return tObject.value || "";
      }
      return tObject;
   };
});