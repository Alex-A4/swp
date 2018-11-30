define('Core/markup/ParserUtilities', [
   'require',
   'Core/htmlparser2',
   'Core/helpers/Number/randomId',
   'Core/markup/parse',
   'Core/helpers/Hcontrol/variableStorage',
   'Core/helpers/Hcontrol/configStorage',
   'Core/core-extend-initializer',
   'Core/RightsManager',
   'Core/ContextBinder',
   'Core/IoC',
   'Core/helpers/Function/shallowClone',
   'Core/Abstract',
   'Core/constants',
   'Core/Deferred'
], function(
   require,
   Parser,
   randomId,
   parseMarkup,
   variableStorage,
   configStorages,
   coreInitializer,
   RightsManager,
   ContextBinder,
   ioc,
   shallowClone,
   Abstract,
   constants,
   Deferred
) {
   "use strict";

   var
      ATTRIBUTE_QUOTES = /&quot;/g,
      CONDITIONAL_COMMENT = /^(\[[\s\S]*?\])$/i,
      WS_EXPERT_COMMENT = /^WS-EXPERT([\s\S]+?)WS-EXPERT$/,
      EVAL_DOT = /\{\{([\s\S]*?(}?)+)}}/gi,
      EVAL_DOT_REPLACEMENT = /<!-#\/EVAL#(\d+)#->/gi,
      quoteReplacingFn = function(found) {
         if (found === '&quot;') {
            return '"';
         } else {
            return '';
         }
      },
      QUOTE_RE = /"/g,
      closeTagSymbols = /\/>$/,
      ParserUtilities = {},
      logger = ioc.resolve('ILogger'),
      varStorageUseCount = 0;

   function removeEvalDot(markup, store) {
      return markup.replace(EVAL_DOT, function (str) {
         store.push(str);
         return '<!-#/EVAL#' + (store.length - 1) + '#->';
      });
   }
   function restoreEvalDot(markup, store) {
      return store.length ? markup.replace(EVAL_DOT_REPLACEMENT, function (str, commentID) {
         return store[+commentID];
      }) : markup;
   }

   /**
    * Минимальный вариант node
    * @class
    */
   var Node = function(cfg){
      var self = this;

      this.startTag    = cfg.startTag || '';
      this.closeTag    = cfg.closeTag || '';

      this.nodeType    = cfg.nodeType;
      this.nodeName    = cfg.nodeName;
      this.attributes  = cfg.attributes || {};
      this.childNodes  = cfg.childNodes;
      this.parentNode  = cfg.parentNode;
      this.text        = cfg.text || cfg.nodeValue;
      this.sequence    = cfg.sequence || [];
      this._junk       = cfg._junk || [];

      // сейчас эти свойства нужны только при сборке. ie8 не поддерживает defineProperty
      if (constants.isNodePlatform) {
         Object.defineProperty(this, 'firstChild', {
            get: function () {
               // Возвращает первый Node, не являющийся комментарием и инструкцией обработки
               if (self.childNodes) {
                  for (var i = 0; i < self.childNodes.length; i++) {
                     if (self.childNodes[i].nodeType !== 8 && self.childNodes[i].nodeType !== 10) {
                        return self.childNodes[i];
                     }
                  }
               }
               return null;
            }
         });

         Object.defineProperty(this, 'nextSibling', {
            get: function () {
               var
                  siblings = self.parentNode.childNodes || [],
                  i = siblings.indexOf(self);

               for (var k = i + 1; k < siblings.length; k++) {
                  // Пропускаем комментарии и инструкции обработки при обходе
                  if (siblings[k].nodeType !== 8 && siblings[k].nodeType !== 10) {
                     return siblings[k];
                  }
               }

               return null;
            }
         });

         Object.defineProperty(this, 'nodeValue', {
            get: function() {
               return self.text;
            },
            set: function(value) {
               self.text = value;
            }
         });
      }
   };

   /**
    * Получить значение атрибута
    * @return {String}
    */
   Node.prototype.getAttribute = function(attributeName){
      var attr = this.attributes[attributeName];
      return attr ? attr.value : null;
   };

   Node.prototype.setAttribute = function(attributeName, attributeValue, attributeQuote){
      var attr = this.attributes[attributeName];

      attributeValue = '' + attributeValue;

      if (attr) {
         attr.value = attributeValue;
         attr.quote = attributeQuote === undefined ? attr.quote : attributeQuote;
      } else {
         this.attributes[attributeName] = {
            value: attributeValue,
            quote: attributeQuote === undefined ? '"' : attributeQuote
         };
         this.sequence.push(attributeName);
      }
   };

   /**
    * Получить/установить внутренний контент
    * Если есть параметр, то устанавливаем контент
    * @param {String} []
    */
   Node.prototype.innerHTML = function(content) {
      var
         result = '',
         cNode;

      // Это сеттер
      if (content !== undefined) {
         if (typeof(content) !== 'string') {
            throw new Error('Invalid parameter format');
         }

         if (this.nodeType !== 1) {
            throw new Error('Only element node can change the innerHTML property');
         }

         result = content;

         cNode = ParserUtilities.parse(result);
         this.childNodes = cNode.childNodes;

         return result;
      }

      // А это геттер
      if (this.nodeType === 3 || this.nodeType === 8) {
         result += this.text;
      } else if (this.nodeType === 10) {
         result += '<' + this.text + '>';
      } else {
         for (var i = 0, l = this.childNodes.length; i < l; i++) {
            cNode = this.childNodes[i];
            result += cNode.nodeType === 3 ? cNode.text : cNode.outerHTML();
         }
      }
      return result;
   };

   /**
    * Получить контент ноды текстом
    */
   Node.prototype.outerHTML = function() {
      var
         startTag = '',
         closeTag = '';

      if (this.nodeType == 1) {
         closeTag = this.closeTag ? this.closeTag : '';
         startTag += '<' + this.nodeName;

         for (var i = 0; i < this.sequence.length; i++) {
            var attrName = this.sequence[i];

            if (attrName[0] === '{') { // doT-аттрибут
               startTag += ' ' + attrName;
            } else { // обычный аттрибут
               var attr = this.attributes[attrName];

               if (attr) {
                  var
                     attrValue = attr.value;

                  if (attrValue !== '' || attr.quote !== '') {
                     var store = [];

                     attrValue = removeEvalDot(attrValue, store);
                     attrValue = attrValue ? (attrValue + '').replace(QUOTE_RE, '&quot;') : '';
                     attrValue = restoreEvalDot(attrValue, store);

                     startTag += ' ' + attrName + '=' + attr.quote + attrValue + attr.quote;
                  } else {
                     startTag += ' ' + attrName;
                  }
               }
            }
         }

         startTag += this.startTag.indexOf('/>') != -1 ? '/>' : '>';
      } else if (this.nodeType === 8) {
         startTag = '<!--';
         closeTag = '-->';
      }

      return startTag + this.innerHTML() + closeTag;
   };

   /**
    * Получить дочерний элемент по имени тега
    */
   Node.prototype.getElementsByTagName = function(tagName) {
      var result = [];
      if (this.nodeType !== 3 && this.nodeType !== 8 && this.nodeType !== 10) {
         for (var i = 0, l = this.childNodes.length; i < l; i++) {
            if (this.childNodes[i].nodeName == tagName) {
               result.push(this.childNodes[i]);
            }
            result = result.concat(this.childNodes[i].getElementsByTagName(tagName));
         }
      }
      return result;
   };

   Node.prototype.hasAttribute = function(attributeName) {
      return !!this.attributes[attributeName];
   };

   function createParser(handler) {
      return new Parser(handler, {
         recognizeSelfClosing: true,
         lowerCaseAttributeNames: false,
         lowerCaseTags: false
      });
   }

   function isControlSequenceComment(comment) {
      return CONDITIONAL_COMMENT.test(comment) || WS_EXPERT_COMMENT.test(comment);
   }

   var
      assert = function(isOk, str) {
         if (!isOk) {
            logger.log('ParserUtilities', str);
         }
      },
      ComponentHandler = Abstract.extend({
         $constructor: function(cfg) {
            this.onreset();
            this._markup = cfg.markup;
            this._buildHtml = !!cfg.buildHtml;
            this._tag = cfg.tag || 'component';

            this._rootNode = new Node({childNodes: [], parentNode: null});

            this._replacer = cfg.replacer;

            if (typeof cfg.firstTagHandler === 'function') {
               this._firstTagHandler = cfg.firstTagHandler;
            }
            if (typeof cfg.callback === 'function') {
               this._callback = cfg.callback;
            }
         },

         _tagStackLast: function() {
            var ln = this._tagStack.length;
            return ln ? this._tagStack[ln - 1] : null;
         },

         setParser: function(parser) {
            this._parser = parser;
         },
         onparserinit: function(parser) {
            parser._tokenizer.ignoreAttrib(true);
         },
         onreset: function() {
            if (this._buildHtml) {
               this.html = '';
            }
            this._curPos = 0;
            this._isFirstTag = true;
            this._tagStack = [];
            this._componentCount = 0;
            this._componentNode = null;
         },
         onend: function() {
            if (this._buildHtml) {
               this.html += this._markup.slice(this._curPos);
            }
            this.handleCallback(null);
         },
         onopentagname: function() {
            if (this._isFirstTag) {
               this._parser._tokenizer.ignoreAttrib(false);
            }
         },
         onopentag: function(name, attribs, quotes, attribSequence) {
            var
               selfClosing = this._markup[this._parser.endIndex - 1] === '/',
               endIndexP = this._parser.endIndex,
               endIndex = selfClosing ? endIndexP - 1 : endIndexP,
               startIndex = this._parser.startIndex;

            assert(this._componentCount >= 0, 'ParserUtilities: _componentCount < 0');

            if (this._componentCount === 0) {
               if (name === this._tag) {
                  this._componentNode = this._foundComponentHandler({
                     name: name,
                     raw: this._markup.slice(startIndex, endIndex),
                     rawStart: startIndex,
                     attribs: attribs,
                     quotes: quotes,
                     attribSequence: attribSequence,
                     selfclosing: selfClosing
                  });

                  this._componentCount++;
                  this._tagStack.push(this._componentNode);

               } else if (this._isFirstTag && this._firstTagHandler) {
                  if (this._firstTagHandler) {
                     this._foundFirstTag({
                        name: name,
                        rawStart: startIndex + 1,
                        rawEnd: this._parser.endIndex,
                        attribs: attribs,
                        quotes: quotes,
                        attribSequence: attribSequence,
                        selfclosing: selfClosing
                     });
                  }
                  this._isFirstTag = false;
                  this._parser._tokenizer.ignoreAttrib(false);
               }
            } else {
               var node = this._foundComponentInnerHandler({
                  name: name,
                  raw: this._markup.slice(startIndex, this._parser.endIndex),
                  rawStart: startIndex,
                  attribs: attribs,
                  quotes: quotes,
                  attribSequence: attribSequence,
                  selfclosing: selfClosing
               });
               if (node.nodeName === this._tag) {
                  this._componentCount++;
               }

               this._tagStack.push(node);
            }
         },
         onclosetag: function(name, isVoidElement) {
            function isEmpty(str) {
               return str === '' || str === null;
            }
            function isSelfClosing(tag) {
               return tag && tag.startTag && closeTagSymbols.test(tag.startTag);
            }

            var
               markup = this._markup,
               endIndex = this._parser.endIndex,
               html, raw, lastTag;

            if (this._componentCount > 0) {
               lastTag = this._tagStack.pop();
               if (lastTag) {
                  if (isVoidElement || isEmpty(name) || isSelfClosing(lastTag)) {
                     lastTag.closeTag = '';
                  } else {
                     lastTag.closeTag = '</' + name + '>';
                  }
               }
            }

            if (lastTag && lastTag.nodeName === this._tag) {
               this._componentCount--;

               assert(this._componentCount >= 0, 'ParserUtilities: _componentCount < 0');

               if (this._componentCount === 0) {
                  raw = markup.slice(this._componentNode.rawStart, repairEndIndex(markup, endIndex) + 1);

                  html = this._replacer(this._componentNode, raw);
                  if (this._buildHtml) {
                     this.html += html;
                  }
                  this._curPos = endIndex + 1;
               }
            }
         },
         ontext: function(text) {
            if (this._componentCount > 0) {
               var last = this._tagStackLast();
               last.childNodes.push(new Node({
                  nodeType: 3,
                  text: text,
                  parentNode: last
               }));
            }
         },
         onprocessinginstruction: function(text, value) {
            if (this._componentCount > 0) {
               var last = this._tagStackLast();
               last.childNodes.push(new Node({
                  nodeType: 10,
                  text: value,
                  parentNode: last
               }));
            }
         },
         oncomment: function(comment) {
            // Сохраняем только комментарии WS_EXPERT и Conditional
            if (isControlSequenceComment(comment) && this._componentCount > 0) {
               var last = this._tagStackLast();
               last.childNodes.push(new Node({
                  nodeType: 8,
                  text: comment,
                  parentNode: last
               }));
            }
         },
         onerror: function(error) {
            this.handleCallback(error);
         },
         handleCallback: function(error) {
            if (error) {
               throw error;
            } else if (typeof this._callback === 'function') {
               this._callback(this.html);
            }
         },
         _createElement: function(element, last) {
            var
               node,
               attributes = {};

            // Дополнить объект аттрибутов свойством quote и экранировать value
            for (var key in element.attribs) {
               if (element.attribs.hasOwnProperty(key)) {
                  var
                     value = element.attribs[key];
                  attributes[key] = {
                     value: (value || '').replace(ATTRIBUTE_QUOTES, quoteReplacingFn),
                     quote: (element.quotes && element.quotes[key] !== undefined) ? element.quotes[key] : '"'
                  };
               }
            }

            node = new Node({
               nodeType: 1,
               nodeName: element.name,
               startTag: Node._forTest ? '' : (element.raw + (element.selfclosing ? '/>' : '>')),
               closeTag: Node._forTest ? '' : (element.selfclosing ? '' : ('</' + element.name + '>')),
               attributes: attributes,
               sequence: Node._forTest ? [] : element.attribSequence,
               childNodes: [],
               parentNode: last
            });
            node.rawStart = element.rawStart;
            last.childNodes.push(node);
            return node;
         },
         _foundComponentHandler: function(element) {
            if (this._buildHtml) {
               this.html += this._markup.slice(this._curPos, element.rawStart);
            }
            return this._createElement(element, this._rootNode);
         },
         _foundFirstTag: function(element) {
            if (this._buildHtml) {
               this.html += this._markup.slice(0, element.rawStart - 1) + this._firstTagHandler(element);
            }
            this._curPos = element.rawEnd + 1;
         },
         _foundComponentInnerHandler: function(element) {
            var last = this._tagStackLast();
            return this._createElement(element, last);
         }
      });

   function repairEndIndex(markup, index) {
      var
         endTagIndex = index,
         ln = markup.length,
         endIndex = index;

      while (markup[endTagIndex] !== '>' && endTagIndex !== ln) {
         endTagIndex++;
      }

      return (endTagIndex === ln ? endIndex : endTagIndex);
   }

   function mutateFirstTag(markup, mutatorFn) {
      var
         foundElement = null,
         handler = {
            onopentag: function(name, attribs, quotes, attribSequence) {
               parser.pause();
               foundElement = {
                  name: name,
                  attribs: attribs,
                  quotes: quotes,
                  attribSequence: attribSequence,
                  raw: markup.slice(parser.startIndex + 1, repairEndIndex(markup, parser.endIndex)),
                  rawStart: parser.startIndex + 1,
                  selfclosing: markup[parser.endIndex-1] === '/'
               };
            }
         },
         parser = createParser(handler);

      parser.end(markup);

      return foundElement ? mutatorFn(foundElement) : markup;
   }

   var insertFirstTagOptions = (function() {
      var
         spacesRe = /\s+/;

      function splitToObj(str) {
         var result = {}, i, ln, split;
         if (str) {
            split = str.split(spacesRe);
            for (i = 0, ln = split.length; i !== ln; i++) {
               if (split[i].trim()) {
                  result[split[i]] = true;
               }
            }
         }
         return result;
      }

      return function(options, attrsToMergeFn, makeResultFn, element) {
         var
            classes, attrsStr, newTagStr, attrs, attrsToMerge, mergeClassFn;

         if (options.enable !== undefined) {
            options.enabled = !!options.enable;
         }
         if (options.hidden !== undefined) {
            options.visible = !options.hidden;
         }

         attrs = element.attribs ? shallowClone(element.attribs) : {};

         if (attrsToMergeFn) {
            attrsToMerge = attrsToMergeFn();
         }

         if (attrsToMerge) {
            for (var name in attrsToMerge) {
               if (attrsToMerge.hasOwnProperty(name)) {
                  var
                     val = attrsToMerge[name];
                  if (name !== 'class') {
                     attrs[name] = val;
                  }
               }
            }
         }

         if (options.name) {
            attrs.sbisname = '' + options.name;
            // для того чтобы проставить имя после построения через buildMarkupForClass,
            // если имя определено в _options
            if (!attrs.name) {
               attrs.name = '' + options.name;
            }
         }

         if (!attrs.id && options.hasOwnProperty('id')) {
            attrs.id = '' + options.id;
         }

         attrs.tabindex = options.enabled ? '0' : '-1';
         attrs.hidefocus = 'true';
         attrs.hasmarkup = 'true';
         attrs.wasbuildmarkup = 'true';

         //TODO: style
         //if (options.hasOwnProperty('zIndex')) {
         //   attrs['z-index'] = '' + options.zIndex;
         //}

         var classStr = (attrs['class'] ? attrs['class'] + ' ' : '') +
            options['className'] + ' ' +
            options['cssClassName'] + ' ' +
            (attrsToMerge && attrsToMerge['class'] ? attrsToMerge['class'] : '');
         classes = splitToObj(classStr);

         classes['ws-control-inactive'] = true;
         classes['ws-component'] = true;

         if (options.visible) {
            delete classes['ws-hidden'];
         }
         else {
            classes['ws-hidden'] = true;
         }

         delete classes[options.enabled ? 'ws-disabled' : 'ws-enabled'];
         classes[options.enabled ? 'ws-enabled' : 'ws-disabled'] = true;

         attrs['class'] = Object.keys(classes).join(' ');

         attrsStr = Object.keys(attrs).reduce(function(res, key) {
            var
               val = attrs[key],
               escapedVal = key === 'config' ?
                  val :
                  typeof val === 'string' ?
                     val.replace(QUOTE_RE, '&quot;') :
                     val;
            return res + key + '="' + escapedVal + '" ';
         }, '');
         newTagStr = element.name + ' ' + attrsStr + (element.selfclosing ? '/' : '');

         return makeResultFn(element, newTagStr);
      }
   })();

   function parse(markup) {
      var
         mainTag = 'maintag',
         markupForParse = '<'+mainTag+'>' + markup + '</'+mainTag+'>',
         componentHandler = new ComponentHandler({
            markup: markupForParse,
            replacer: function() {},
            buildHtml: false,
            tag: mainTag
         }),
         parser = createParser(componentHandler);

      componentHandler.setParser(parser);
      parser.parseComplete(markupForParse);

      var node = componentHandler._componentNode;
      node.closeTag = '';
      node.nodeName = undefined;
      node.nodeType = 9; // Document Node
      node.parentNode = null;
      node.startTag = '';
      node.text = undefined;
      return node;
   }

   function buildMarkupForClass(constructor, options, context, vStorage, parentOptions, controlId, attributesToMerge, node) {
      var markup = '';

      if (!parentOptions) {
         parentOptions = {};
      } else if (typeof parentOptions === 'string') { // TODO сейчас с препроцессора может приходить в parentOptions сам id
         parentOptions = {id: parentOptions};
      }

      if (constructor){
         var
            finalConfig,
            parentId = parentOptions.parentId || parentOptions.id,
            parsedOptions = options,
            proto = constructor.prototype,
            modifyOptionsFn = proto._modifyOptions && proto._modifyOptions.bind(proto),
            buildMarkupFn = proto._buildMarkup && proto._buildMarkup.bind(proto),
            attrsToMerge, attrsToMergeFn, attrsStr, binder, bindOpts,
            defaultInstanceData = coreInitializer.call(constructor),
            defaultOptions = defaultInstanceData._options || {},
            buildMarkupWithContext = 'buildMarkupWithContext' in parsedOptions ? parsedOptions.buildMarkupWithContext : defaultOptions.buildMarkupWithContext,
            moduleName;

         if (context && buildMarkupWithContext) {
            binder = ContextBinder.initBinderForControlConfig(parsedOptions);
            parsedOptions = binder.getConstructorOptions(context, constructor, parsedOptions);
         }

         //modifyOptions нужно запускать и для finalConfig, потому что иначе невозможно переопределить опции из класса.
         //Однако, для parsedOptions тоже надо запускать modifyOptions, чтобы в атрибуты с конфигом приходили опции,
         //изменённые по конфигу из parseMarkup, иначе будет несоответствие между опциями, пришедшими в конструктор, и
         //построенной вёрсткой.
         if (proto._template) {
            finalConfig = coreInitializer.getInstanceOptionsByDefaults(constructor, parsedOptions, {_options: defaultInstanceData});
         } else {
            finalConfig = coreInitializer.getInstanceOptionsByDefaults(constructor, parsedOptions, defaultInstanceData);
         }

         // Выключаем enabled у потомка, если у предка он выключен, а у потомка не проставлен. Опция allowChangeEnable может отменить этот механизм.
         // делаем это перед modifyOptions чтобы туда пришел правильный enabled
         if (parentOptions && !('enabled' in parsedOptions) && ('enabled' in parentOptions) && !parentOptions.enabled && (finalConfig.allowChangeEnable || finalConfig.allowChangeEnable===undefined)) {
            finalConfig.enabled = parentOptions.enabled;
            finalConfig.enable = parentOptions.enabled;
         }

         if (modifyOptionsFn) {
            finalConfig = modifyOptionsFn(finalConfig, parsedOptions, attributesToMerge);
            if (!finalConfig) {
               moduleName = proto._moduleName || '???';
               throw new Error('Метод _modifyOptions модуля \'' + moduleName + '\' выдал null или undefined! Проверьте результат, возвращаемый методом _modifyOptions. Встаньте на точку этого исключения, и ');
            }
         }

         if (!finalConfig.id){
            if(typeof process !== 'undefined' && controlId) {
               // генерируем xml страницу на сервере
               finalConfig.id = '' + controlId;
            } else {
               finalConfig.id = '' + randomId();
            }
         }

         attrsToMergeFn = function(ready) {
            var result = {
               config: ready||configStorages.pushValue(parsedOptions)
            };

            if (parentId) {
               result['data-pid'] = '' + parentId;
            }

            for (var name in attributesToMerge) {
               if (attributesToMerge.hasOwnProperty(name)) {
                  var
                     val = attributesToMerge[name];
                  if (name !== 'data-pid' && name !== 'config') {
                     if (name.indexOf('attr:')!==-1){
                        name = name.split('attr:')[1];
                     }
                     result[name] = val;
                     if (name === 'name'){
                        result['sbisname'] = val;
                     }
                  }
               }
            }

            return result;
         };

         if (proto._template) {

            var binder;
            finalConfig.container = node;

            if (context) {
               finalConfig.linkedContext = context;
               binder = ContextBinder.initBinderForControlConfig(finalConfig);
            }

            var instance = new constructor(finalConfig);
            var configStorage = {};

            if (window)
               configStorage[finalConfig.__$config] = instance;
            else
               configStorage[finalConfig.__$config] = finalConfig;

            configStorages.merge(configStorage);

            if (context) {
               binder.bindControl(instance, context, 'syncControl');
            }

            markup = instance.render(undefined, {
               attributes: attrsToMergeFn(finalConfig.__$config)
            });



         } else if (typeof proto._dotTplFn === 'function') {
            //атрибуты исходного узла (xmlNode), которые будет объединять _insertFirstTagOptions с атрибутами от
            //шаблона и опций, должны навешиваться после выполнения шаблона, поскольку в шаблоне могут быть выражения,
            //которые их изменят, и значит, 'Core/helpers/Hcontrol/configStorage'.pushValue(parsedOptions) можно делать только после выполнения шаблона
            markup = buildMarkupFn(proto._dotTplFn, finalConfig, null, attrsToMergeFn, finalConfig.buildMarkupWithContext ? context : null);
         } else {
            //todo Если нет шаблона, на элемент навешиваются атрибуты, но не по алгоритму insertFirstTagOptions который учитывает опции, а как то укороченно.
            //markup = mutateFirstTag('<component></component>', insertFirstTagOptions.bind(undefined, parsedOptions, attrsToMergeFn, function(element, newTagStr) {
            //   return '<' + newTagStr + '>';
            //}));
            //markup += '</component>';

            /*Первый раз сюда попадаем когда выполняем шаблон
              * Второй раз попадаем, когда по верстке оживляем компонент
              * Если attributesToMerge.config есть - значит в configStorage возможно 
              * уже есть нужные параметры
             */
            var needMerge = true,
               conf;
            if (attributesToMerge&&attributesToMerge.config) {
               conf = configStorages.getData()[attributesToMerge.config];
               if (conf) {
                  needMerge = false;
               }
            }
            attrsToMerge = needMerge?attrsToMergeFn():attrsToMergeFn(attributesToMerge.config);
            attrsToMerge.id = '' + finalConfig.id;
            if (parsedOptions.visible === false) {
               attrsToMerge['class'] += ' ws-hidden';
            }
            attrsStr = Object.keys(attrsToMerge).reduce(function(res, key) {
               var
                  val = attrsToMerge[key],
                  escapedVal = key === 'config' ?
                     val :
                     typeof val === 'string' ?
                        val.replace(QUOTE_RE, '&quot;') :
                        val;
               return res + key + '="' + escapedVal + '" ';
            }, '');
            markup = '<component ' + attrsStr + '></component>';
         }

         //уберём временные поля, добавленные для построения вёрстки
         if (proto._modifyOptionsAfter) {
            proto._modifyOptionsAfter(parsedOptions);
            if (finalConfig && finalConfig.__$config){
               /**
                * Если мы вдруг у ScrollContainer переопределили modifyOptionsAfter чтобы не передавать с сервера опцию
                * content, то надо пересохранить, т.к. все что с template - создается с опциями, которые
                * лежат в finalConfig. Актуализируем то, что лежит в configStorage
                */
               var cc = {};
               cc[finalConfig.__$config] = parsedOptions;
               configStorages.merge(cc);
            }
         }
      }

      return markup;
   }

   function prepareMarkupForNode(node, parentOptions, vStorage, controlId, context) {
      var
         componentType = '',
         markup = '',
         constructor = null;

      // FIXME Это поддержка для старого кода, который еще есть в data-provider'ах (navigation.js, newslistedo.js)
      if (typeof node === 'string') {
         node = parse(node);
         for (var cI = 0, cL = node.childNodes.length; cI < cL; cI++){
            if (node.childNodes[cI].nodeType == 1){
               node = node.childNodes[cI];
               break;
            }
         }
      }

      try{
         //определяем тип компонента
         componentType = node.getAttribute('data-component');
         //получаем конструктор
         constructor = require(componentType);
      }
      catch (e){
         var dataOpt = node.getAttribute('data-optional');
         if (dataOpt && dataOpt !== 'false') {
            return '';
         } else {
            e.message = 'Не удалось определить тип компонента. Тип: \n' + componentType + '\n' + e.message;
            throw e;
         }
      }

      if (constructor){
         //парсим разметку
         var
            parsedOptions = parseMarkup(node),
            attributesToMerge = {};
         for (var attrName in node.attributes) {
            if (node.attributes.hasOwnProperty(attrName)) {
               var
                  attr = node.attributes[attrName];
               attributesToMerge[attrName] = attr.value;
            }
         }
         //todo сделано для на время проекта отказ от оглавлений для случая когда созданы заглушки и компонент создается по новому имени а в коде обыявлен по старому,
         //в конце проекта надо удалить
         if (attributesToMerge.hasOwnProperty('data-component') && constructor && constructor.prototype._moduleName) {
            attributesToMerge['data-component'] = constructor.prototype._moduleName;
         }
         markup = buildMarkupForClass(constructor, parsedOptions, context, undefined, parentOptions, controlId, attributesToMerge, node);
      } else {
         // если на сервере constructor из require не вернулся (еще не был загружен), значит возвращаем не пустую строку, а верстку компонента.
         // таким образом компонент долетит до клиента и там уже построится
         if (typeof window === 'undefined') {
            markup = node.outerHTML();
         }
      }

      return markup;
   }

   function hasComponents(markup) {
      if (typeof markup === 'string') {
         return markup.indexOf('<component') !== -1;
      } else if (markup instanceof Deferred) {
         logger.error('ParserUtilities', 'Can\'t perform an asynchronous build inside of a CompoundControl');
      }
      return false;
   }

   /**
    * Строит развернутую верстку по строке шаблона
    * @param markup Строка шаблона
    * @param options Опции компонента
    * @param context
    * @returns {Object} Объект, хранящий верстку (поле markup) и флаг (hasComponents), символизирующий наличие компонентов в верстке
    */
   function buildInnerComponentsExtended(markup, options, context) {
      if (typeof markup === 'string') {
         var hasDataComponent = markup.indexOf('data-component') !== -1;
         return {
            hasComponents: hasDataComponent,
            markup: hasDataComponent ? buildInnerComponents(markup, options, context) : markup
         };
      } else if (markup instanceof Deferred) {
         logger.error('ParserUtilities', 'Can\'t perform an asynchronous build inside of a CompoundControl');
      }

      return {
         hasComponents: false,
         markup: markup
      };
   }

   /**
    * Строит развернутую верстку по строке шаблона
    * @param markup Строка шаблона
    * @param options Опции компонента
    * @param [vStorage] Хранилище, содержащее данные для поддержки ссылок в шаблонизаторе
    * @param [attrsToMergeFn] Функция, возвращающая аттрибуты для строящейся верстки компонента
    * @returns {String} Развернутая верстка
    */
   function buildInnerComponents(markup, options, context) {
      var
         rightsNeeded = RightsManager.rightsNeeded(),
         componentHandler = new ComponentHandler({
            markup: markup,
            buildHtml: true,
            tag: 'component',
            replacer: function(node) {
               if (!node) {
                  return;
               }

               if (rightsNeeded && RightsManager.hasDataAccess(node) ) {
                  node = RightsManager.applyRights(node, ParserUtilities);
               }

               if (!node) {
                  return '';
               }
               return prepareMarkupForNode(
                  node,
                  options,
                  undefined,
                  undefined,
                  context
               );
            }
         }),
         parser = createParser(componentHandler);
      componentHandler.setParser(parser);

      parser.parseComplete(markup);

      return componentHandler.html;
   }

   /**
    * map. Для каждого тега (верхний уровень иерархии) вызовем функцию,
    * результат выполнения функции заменит тег
    * @param {String} tagname - название тега
    * @param {String} markup - разметка
    * @param {Function} fn - function(Node tag)
    * @returns {String}
    */
   function mapTag(tagname, markup, fn) {
      var
         componentHandler = new ComponentHandler({
            markup: markup,
            buildHtml: true,
            tag: tagname,
            replacer: fn
         }),
         parser = createParser(componentHandler);
      componentHandler.setParser(parser);

      parser.parseComplete(markup);

      return componentHandler.html;
   }

   /**
    * forEach. Для каждого тега (верхний уровень иерархии) вызовем функцию
    * @param {String} tagname
    * @param {String} markup
    * @param {Function} fn - function(String tag)
    */
   function forEachTag(tagname, markup, fn) {
      var
         componentHandler = new ComponentHandler({
            markup: markup,
            buildHtml: false,
            tag: tagname,
            replacer: fn
         }),
         parser = createParser(componentHandler);
      componentHandler.setParser(parser);

      parser.parseComplete(markup);
   }

   /**
    * Строит развернутую верстку по функции dotTplFn компонента и опциям компонента
    * @param dotTplFn Функция, возвращающая шаблон компонента
    * @param options Опции компонента
    * @param [vStorage] Хранилище, содержащее данные для поддержки ссылок в шаблонизаторе
    * @param [attrsToMergeFn] Функция, возвращающая аттрибуты для строящейся верстки компонента
    * @returns {String} Развернутая верстка
    */
   function buildMarkup(dotTplFn, options, vStorage, attrsToMergeFn, context, dontDecorateFirstTag){
      //создаем разметку
      var
         markup,
         attributesToDecor = {
            'config': randomId('cfg-'),
            'hasmarkup': 'true'
         },
         result;
      attributesToDecor.attributes = {
         config: attributesToDecor.config,
         hasmarkup: attributesToDecor.hasmarkup
      };
      markup = dotTplFn.apply(variableStorage.getValue(), [options, attributesToDecor, context]);

      if (hasComponents(markup)) {
         var
            i = 1,
            rightsNeeded = RightsManager.rightsNeeded(),
            componentHandler = new ComponentHandler({
               markup: markup,
               buildHtml: true,
               tag: 'component',
               replacer: function(node) {
                  if (!node) {
                     return;
                  }

                  if (rightsNeeded && RightsManager.hasDataAccess(node) ) {
                     node = RightsManager.applyRights(node, ParserUtilities);
                  }

                  if (!node) {
                     return '';
                  }
                  return prepareMarkupForNode(
                     node,
                     options,
                     null,
                     options && options.sequenceId,
                     context
                  );
               },
               firstTagHandler: dontDecorateFirstTag ? null : insertFirstTagOptions.bind(undefined, options, attrsToMergeFn, function(element, newTagStr) {
                  return '<' + newTagStr + '>';
               })
            }),
            parser = createParser(componentHandler);
         componentHandler.setParser(parser);

         parser.parseComplete(markup);

         result = componentHandler.html;
      } else if (dontDecorateFirstTag) {
         result = markup;
      } else {
         result = mutateFirstTag(markup, insertFirstTagOptions.bind(undefined, options, attrsToMergeFn, function(element, newTagStr) {
            return markup.substr(0, element.rawStart) + newTagStr + markup.substr(element.rawStart + element.raw.length);
         }));
      }

      return result;
   }

   ParserUtilities = {
      parse: parse,
      forEachTag: forEachTag,
      mapTag: mapTag,
      buildMarkup: buildMarkup,
      prepareMarkupForNode: prepareMarkupForNode,
      buildMarkupForClass: buildMarkupForClass,
      buildInnerComponents: buildInnerComponents,
      buildInnerComponentsExtended: buildInnerComponentsExtended,
      Node: Node
   };

   return ParserUtilities;
});
