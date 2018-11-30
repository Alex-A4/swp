define('View/Builder/Tmpl/modules/utils/tag', [
      'Core/constants',
      'View/Builder/Tmpl/modules/utils/names',
      'View/Builder/Tmpl/modules/utils/common'
   ], function (constants, names, common) {
      var
         controlNameDivider = '.',
         controlPathDivider = '/',
         cyrillicPattern = /[\u0400-\u04FF]/,
         sbisModuleName = 'SBIS3',
         getFirstLetter = function getFirstLetter(string) {
            return string.charAt(0);
         },
         isUpperCase = function isUpperCase(firstLetter) {
            return firstLetter === firstLetter.toUpperCase();
         },
         splitWs = function splitWs(string) {
            var ws;
            if (string !== undefined && string.indexOf('ws:')===0) {
               ws = string.split('ws:');
               return ws[1];
            }
            return undefined;
         },
         splitJs = function splitJs(string) {
            var ws;
            ws = string.split('js!');
            return ws[1];
         },
         splitOptional = function splitOptional(string) {
            var ws;
            ws = string.split('optional!');
            return ws[1];
         },
         splitHtml = function splitJs(string) {
            var ws;
            ws = string.split('html!');
            return ws[1];
         },
         splitTmpl = function splitJs(string) {
            var ws;
            ws = string.split('tmpl!');
            return ws[1];
         },
         splitWml = function splitJs(string) {
            var ws;
            ws = string.split('wml!');
            return ws[1];
         },
         slashedControl = function slashedControl(string) {
            var ws = string.split('/');
            return ws[1];
         },
         getJsModules = function getJsModules() {
            return constants.jsModules;
         },
         getJsCoreModules = function getJsCoreModules() {
            return constants.jsCoreModules;
         },
         oldNamesPopout = function oldNamesPopout(name, seekingDeps) {
            return name === sbisModuleName && seekingDeps;
         },
         isControlNameBool = function isControlNameBool(name) {
            return name && !cyrillicPattern.test(name) && controlNameByFirstLetter(name);
         },
         isControlName = function isControlName(name) {
            return isControlNameBool(splitWs(name) || name);
         },
         getJsModulesByName = function getJsModuleByName(name, isColonized, seekingDeps, oldNames) {
            var modules = getJsModules(),
               coreModules = getJsCoreModules(),
               ismod = modules && (modules[name] || coreModules[name]);
            if (seekingDeps) {
               /**
                * Функция должна вернуть undefined чтобы ничего не падало, если это не модуль
                * Если начинается со SBIS3. - это модуль
                */
               if (oldNames && !ismod) {
                  return true;
               }
               return ismod;
            }
            return ismod || (isColonized ? undefined : true);
         },
         splitJsModuleName = function splitJsModuleName(moduleName, divider) {
            return moduleName.split(divider ? divider : controlNameDivider)[0];
         },
         getJsModulesByNameGetBack = function getJsModulesByNameGetBack(name, splitted, clean, seekingDeps) {
            var oldNames = oldNamesPopout(splitted, seekingDeps);
            if (clean || oldNames) {
               return getJsModulesByName(splitted, false, seekingDeps, oldNames) ? name : false;
            }
            return getJsModulesByName(splitted) ? name.replace(/[.]/g, '/') : false;
         },

         // Проверка с помощью modules во время разбора конфига контрола,
         // сначала ищем старые,
         // потом новые по первой части наименования
         controlNameByModules = function decideControlNameOrNot(name, divider, seekingDeps) {
            if (divider) {
               return getJsModulesByName(name) ? name : getJsModulesByNameGetBack(name, splitJsModuleName(name, divider), true);
            }
            return getJsModulesByName(name, seekingDeps) ? name : getJsModulesByNameGetBack(name, splitJsModuleName(name, divider), false, seekingDeps);
         },
         // Простая проверка на уровне, когда мы не в конфиге компонента
         controlNameByFirstLetter = function controlNameByFirstLetter(name) {
            return isUpperCase(getFirstLetter(name)) ? name : false;
         },
         // Для понимания в зависимости от контекста разбора
         // Тег компонента это или нет
         isControlTag = function isControlTag(tagName, types, isInjectingData, seekingDeps) {
            var result = false;
            if (tagName && !~types.indexOf(tagName)) {
               result = controlNameByFirstLetter(tagName);
               if (isInjectingData) {
                  //Если в имени тега есть слеши - это значит что это контрол.
                  //Функции получения контрола заточены на точки. Заменим слеши на точки
                  tagName = tagName.replace(/\//g, controlNameDivider);
                  if (~tagName.indexOf(controlNameDivider)) {
                     result = controlNameByModules(tagName, false, seekingDeps);
                  } else {
                     result = false;
                  }
               }
            }
            return result;
         },
         isControlOnlyDotNotation = function isControlOnlyDotNotation(name) {
            var splitWsStandart = name.split(':');
            return name.indexOf('.') >= 0 && splitWsStandart[0] !== 'ws';
         },
         controlOnlyDotNotation = function controlColonNotation(tagName, types, isInjectingData) {
            var result = false;
            if (tagName && !~types.indexOf(tagName)) {
               result = controlNameByFirstLetter(tagName);
               if (isInjectingData) {
                  tagName = cleverReplaceDotsOnDivider.call(this, tagName, controlPathDivider);
                  if (~tagName.indexOf(controlPathDivider)) {
                     result = controlNameByModules(tagName, controlPathDivider);
                  } else {
                     result = false;
                  }
               }
            }
            return result;
         },
         isStandartControlTag = function isStandartControlTag(name, types, isInjectingData, bool, seekingDeps) {
            if (bool) {
               return isControlTag(name, types, true);
            }
            return isControlTag(splitWs(name), types, isInjectingData, seekingDeps);
         },
         retainControl = function (name, types, isInjectingData, bool, seekingDeps) {
            if (isControlOnlyDotNotation(name)) {
               return controlOnlyDotNotation.call(this, name, types, isInjectingData);
            }
            return isStandartControlTag(name, types, isInjectingData, bool, seekingDeps);
         },
         checkForControl = function checkForControl(name, types, isInjectingData, bool, seekingDeps) {
            if (isControlName(name)) {
               return retainControl.call(this, name, types, isInjectingData, bool, seekingDeps);
            }
         },
         replaceDotsOnSlashes = function replaceDotsOnSlashes(name) {
            return name.replace(/\./g, '/');
         },
         // Магическая замена вроде SBIS3.CONTROLS.ListView -> SBIS3.CONTROLS/ListView,
         // но Deprecated.Controls.Label.Label -> Deprecated/Controls/Label/Label
         cleverReplaceDotsOnDivider = function cleverReplaceDotsOnSlashes(name, divider) {
            var mustBeDots = [],
               screen = '';
            if (this && this.config) {
               mustBeDots = this.config.mustBeDots;
               // Чтобы экранировать нужные строки на время замены, нужна подстрока такого вида,
               // чтобы точно не использовалась в тегах
               screen = this.config.screen;
            }
            for (var key in mustBeDots) {
               name = name.replace(mustBeDots[key], screen + key + screen);
            }
            name = name.replace(/\./g, divider);
            for (var key in mustBeDots) {
               name = name.replace(screen + key + screen, mustBeDots[key]);
            }
            return name;
         },
         hasOnlyDots = function hasOnlyDots(name) {
            return name.indexOf('.') >= 0 && name.indexOf('/') < 0;
         },

         isControlSlashed = function isControlSlashed(name, seekingDeps) {
            var module = getJsModulesByName(name, true, seekingDeps, oldNamesPopout(splitJsModuleName(name), seekingDeps)),
               controlModuleName = name;
            if (module === undefined) {
               controlModuleName = replaceDotsOnSlashes(name);
            }
            return 'ws:' + controlModuleName;
         },
         isControlColonized = function isControlColonized(name) {
            var controlModuleName = name;
            if (hasOnlyDots(name)) {
               controlModuleName = cleverReplaceDotsOnDivider.call(this, name, '/');
            }
            return 'ws:' + controlModuleName;
         };

      var tagUtils =  {
         getModuleExpressionBody: function getModuleExpressionBody(tag) {
            return tag.attribs.data.data[0];
         },
         elseChecker: function elseChecker(tag) {
            return tag.prev === undefined || (tag.prev.name !== 'ws:if' && tag.prev.name !== 'ws:else');
         },
         createTagKey: function createTagKey(prefix, key) {
            return prefix ? prefix + '-' + key : key;
         },
         createControlTagName: function createControlTagName(tag, splitWs) {
            var
               name = { value: null, type: 'ws-control' },
               nameVal = tag.name.trim();

            if (nameVal === 'control') {
               name.value = tag.attribs['data-component'];
            } else if (common.isLibraryModuleString(nameVal)) {
               name.libPath = common.splitModule(nameVal);
               name.value = name.libPath.library + ':' + name.libPath.module;
               name.type = 'ws-module';
            } else {
               name.value = splitWs ? splitWs(nameVal) : nameVal;
            }

            return name;
         },
         isTag: function isTag(type) {
            return common.toEqual(type, 'tag') || common.toEqual(type, 'style') || common.toEqual(type, 'script');
         },
         isText: function isText(type) {
            return common.toEqual(type, 'text');
         },
         isDirective: function isDirective(type) {
            return common.toEqual(type, 'directive');
         },
         isComment: function isComment(type) {
            return common.toEqual(type, 'comment');
         },
         /**
          * Проверим, возможна ли загрузка такого компонента?
          * @param name
          * @returns {*}
          */
         isTagRequirable: function isTagRequreable(name, types, isInjectingData, seekingDeps) {
            return checkForControl.call(this, name, types, isInjectingData, false, seekingDeps);
         },
         /**
          * Булевая проверка на возможность загрузки тэга
          * @param name
          * @returns {*}
          */
         isTagRequirableBool: function isTagRequreableBool(name, types) {
            return checkForControl.call(this, name, types, true, true);
         },
         /**
          * Во время генерации проверяем, контрол это или нет
          * @param tag
          * @returns {*}
          */
         isWsControl: function isWsControl(tag) {
            return tag.children && tag.children[0] && tag.children[0].fn && (names.isControlString(tag.children[0].fn) || names.isSlashedControl(tag.children[0].fn));
         },
         isModule: function isModule(tag) {
            return tag.children && tag.children[0] && tag.children[0].type === 'module';
         },
         isTemplate: function isTemplate(tag) {
            return tag.children && tag.children[0] && tag.children[0].fn;
         },
         /**
          * Для загрузки и исполнения функции директивы
          * @param  {Function} moduleFunction
          * @param  {Object} tag
          * @param  {Object} data
          * @return {Array}
          */
         loadModuleFunction: function loadModuleFunction(moduleFunction, tag, data, decor) {
            var tagModule = moduleFunction.call(this, tag, data, decor);
            return tagModule.call(this, decor);
         },
         /**
          * Для проверки существования директивы, и её функции модуля
          * @param  {Object} tag
          * @return {Function}
          */
         moduleMatcher: function moduleMatcher(tag) {
            var moduleName = splitWs(tag.name);
            return (this._modules[moduleName] !== undefined) ? this._modules[moduleName].module : false;
         },
         /**
          * Ищем функции определения типов и на основе них создаем элементы
          * @param entity
          * @param objectName
          * @param data
          * @returns {*}
          */
         findFunctionCase: function findFunctionCase(entity, objectName, data) {
            var
               type = common.capitalize(entity.type),
               functionName = objectName + type;

            /**
             * Если тип элемента есть в ignored. Не генерируем.
             */
            if (common.findInArray(entity.type, this.config.ignored)) {
               return;
            }

            if (tagUtils.isTag(entity.type)) {
               return this[objectName + 'Tag'](entity.name, data);
            }

            return tagUtils['is' + type] ? this[functionName] : undefined;
         },
         splitWs: splitWs,
         splitJs: splitJs,
         splitHtml: splitHtml,
         splitWml: splitWml,
         splitTmpl: splitTmpl,
         splitOptional: splitOptional,
         slashedControl: slashedControl,
         resolveModuleName: function resolveModuleName(name, tagName, seekingDeps) {
            return name ?
               isControlSlashed(name, seekingDeps) :
               isControlColonized.call(this, tagName);
         },
         checkForKeys: function checkForKeys(entity) {
            if (entity.type === 'tag') {
               return entity.name !== 'ws:template';
            }
            return false;
         },
         getJsModuleByName: getJsModulesByName,
         replaceDotsOnSlashes: replaceDotsOnSlashes,
         cleverReplaceDotsOnDivider: cleverReplaceDotsOnDivider
      };
      return tagUtils;
   }
);

