define('Core/xslt-async', [
   'Core/constants',
   'Core/detection',
   'Core/core-extend',
   'Core/IoC',
   'Core/helpers/axo',
   'Core/Deferred',
   'Core/ParallelDeferred'
], function(constants, detection, coreExtend, ioc, axo, Deferred, ParallelDeferred) {

   var XSLTCaps = {
      TRANSFORM_TO_TEXT: 1,
      TRANSFORM_TO_DOC: 2,
      TRANSFORM_TO_FRAGMENT: 4,
      LOAD_URL: 8,
      LOAD_TEXT: 16
   };

   function removeInvalidXMLChars(valueStr) {
      /* eslint-disable no-control-regex */
      if (typeof valueStr == "string") {
         valueStr = valueStr.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]*/g, "");
      }
      return valueStr;
   }

   function preparseChanges(changes, docXSL) {
      var
         docSplit = /(document\('[0-9A-z\/)(.,-]+'\))/gi,
         attribute,
         splitted;
      if(changes.length > 0) {
         var fakeFix = docXSL.createElement('xsl:template');
         fakeFix.setAttribute('match', 'ws-foreign-documents-namespace');
         docXSL.documentElement.appendChild(fakeFix);
         for(var k = 0, l = changes.length; k < l; k++) {
            attribute = changes[k][0].getAttribute('select');
            splitted = attribute.split(docSplit);
            if (splitted && splitted[2]) {
               changes[k][0].setAttribute('select', changes[k][1] + splitted[2]);
            } else {
               changes[k][0].setAttribute('select', changes[k][1]);
            }
         }
      }
   }

   function checkDocumentOnError(document) {
      var error = null;
      if(document) {
         if(document.parseError) {
            if(document.parseError.errorCode !== 0)
               error = document.parseError.reason;
         } else {
            var pErr = document.getElementsByTagName('parsererror');
            if(pErr.length)
               error = pErr[0].textContent;
         }
      }
      else
         error = "Empty document";
      return error;
   }

   /**
    * Класс-обертка для кроссбраузерного выполнения XSL-трансформаций
    *
    * @description
    * <pre>
    *    var transform = new XSLTransform({ xml: './xml.xml', xsl: './xsl.xsl' });
    *    transform.execute().addCallback(function () {
    *    transform.transformToText().addCallback();
    *    transform.transformToDocument().addCallback();
    *    });
    * </pre>
    *
    * @class Core/XSLTransform
    * @public
    * @author Бегунов А.В.
    */
   var XSLTransform = coreExtend.extend({}, /** @lends Core/XSLTransform.prototype */{
      $protected: {
         _xmlDoc: '',
         _xslDoc: '',
         _loadedFiles: [],
         // массив загруженных файлов для переиспользования
         _loadedDefs: [],
         _options: {
            /**
             * @cfg {String|Document} Адрес, текстовове содержимое или инстанс XML-документа
             */
            xml: '',
            /**
             * @cfg {String|Document} Адрес, текстовое содержимое или инстанс XSL-документа
             */
            xsl: '',
            /**
             * @cfg {Function} Errback для обработки асинхронных запросов за файлами документов
             */
            errback: undefined
         },
         _nsResolver: null
      },
      $constructor: function() {

         var xmlDoc = new XMLDocument({ name: this._options.xml, errback: this._options.errback }).getDocument(),
            xslDoc = new XMLDocument({ name: this._options.xsl }).getDocument(),
            xmlDef = xmlDoc instanceof Deferred ? xmlDoc : new Deferred().callback(xmlDoc),
            xslDef = xslDoc instanceof Deferred ? xslDoc : new Deferred().callback(xslDoc);
         this._mainDef = new ParallelDeferred();

         this._mainDef.push(xmlDef);
         this._mainDef.push(xslDef);

         this._xmlDoc = null;
         this._xslDoc = null;

         if(detection.webkit || detection.chrome) {
            this._nsResolver = function(ns) {
               switch(ns) {
                  case 'xsl':
                     return 'http://www.w3.org/1999/XSL/Transform';
                  default:
                     return null;
               }
            };
         }

      },
      /**
       * Проверяет документ - не является ли он результатом ошибки разбора
       *
       * @param {Document} document
       * @returns {Document}
       */
      checkDocument: function(document) {
         var error = checkDocumentOnError(document);
         if (error) {
            return error;
         }
         return null;
      },
      execute: function () {
         var self = this;
         var def = new Deferred();

         self._mainDef.done().getResult().addCallback(function (res) {
            self._xmlDoc = self._xmlDoc || res[0];
            self._xslDoc = self._xslDoc || res[1];
            if (detection.webkit || detection.chrome) {
               self._chromeWorkaround().addCallback(function () {
                  def.callback(self);
               });
            } else {
               if (detection.firefox) {
                  self._xslDoc = self.preparseIncludeNames(self._xslDoc);
               }
               def.callback();
            }
         });

         return def;
      },
      _loadDoc: function(doc) {
         if(this._loadedFiles.indexOf(doc) == -1) {
            var rv = new XMLDocument({ name: doc }).getDocument();
            this._loadedFiles.push(doc);
            this._loadedDefs.push(rv);
            return rv;
         } else {
            return this._loadedDefs[this._loadedFiles.indexOf(doc)];
         }
      },
      /**
       * Зачем это?
       * В Google Chrome не работают директивы xsl:import и xsl:include. Данный метод пересобирает документы так, чтобы
       * обйти эти ограничения другими средствами XSLT
       *
       * Как это работает?
       *
       * xsl:include
       * Проще всего. Находи все директивы, загружаем файлы по найденным адресам и просто вставляем в документ
       *
       * xsl:import
       * Чуть сложнее. Также находим все документы, загружаем файлы, вставляем в документ НО
       * - xsl:template name=... проверяем что нет с таким же именем в главном документе
       *    случаи нахождения одноименных template логаются в текущим логгером
       * - xsl:template match=... добавляем mode=imports если такой же match уже есть в документе
       * - xsl:apply-import заменяем на xsl:apply-templates select=. mode=imports
       *
       * document()
       * При нахождении функции document в исходном XSLT проводятся следующие действия:
       * 1. В исходном XML (!) создается нода ws-foreign-documents-namespace
       * 2. Для каждого документа, подключаемого через document() генерируется нода внутри ws-foreign-documents-namespace
       *    с названием, равным пути к документу но все / заменены на -, в начале дописано х (для обработки путей
       *    начинающихся со /, в конце дописан -document
       *    т.е. получаются ноды вида x-res-qualifier-dictionary1.xml-document для документа /res/qualifier/dictionary1.xml
       * 3. Содержимое документа целиком подгружается в ноду, созданную на шаге 2
       * 4. в XSL document(...) заменяется на конструкцию вида /ws-foreign-documents-namespace/x-translated-doc.xml-document
       * 5. в XSL создается пустой шаблон для ноды ws-foreign-documents-namespace (для предотвращения ее обработки)
       *
       * Обработка циклических зависимостей
       * Тупо. Просто не даем по второму разу грузить уже подгруженный документ.
       * Случаи потенциальных циклических зависимостей логаются текущим логгером
       */
      _chromeWorkaround: function() {

         var self = this;
         var pDef = new ParallelDeferred();
         var importsDef = new Deferred();
         var includesDef = new Deferred(),
            resDef;
         this._preparseImports(this._xslDoc).done().getResult().addCallback(function () {
            self._preparseImportAppliance(self._xslDoc);
            importsDef.callback();
         });

         this._preparseIncludes(this._xslDoc).done().getResult().addCallback(function () {
            includesDef.callback();
         });

         resDef = this._preparseDocumentFunction(this._xmlDoc, this._xslDoc);

         if (resDef instanceof Deferred) {
            pDef.push(resDef);
         }
         pDef.push(importsDef);
         pDef.push(includesDef);
         return pDef.done().getResult();
      },
      _xslIEWorkaround: function (xsl) {
         var pDef = new ParallelDeferred();
         var success = new Deferred();
         var self = this;

         if (xsl.selectNodes("//xsl:import").length) {
            var ImportDef = new Deferred();
            pDef.push(ImportDef);
            this._xslIEImports(xsl, "//xsl:import").addCallback(function (xslT) {
               xslT = self._preparseImportApplianceIE(xslT);
               ImportDef.callback(xslT);
            });
         }

         if (xsl.selectNodes("//xsl:include").length) {
            var IncludeDef = new Deferred();
            pDef.push(IncludeDef);
            this._xslIEIncludes(xsl, "//xsl:include").addCallback(function (xslT) {
               IncludeDef.callback(xslT);
            });
         }

         /**
          * Some documents includes search by other tag names
          */
         if (xsl.selectNodes("//include").length) {
            var IncludeSoftDef= new Deferred();
            pDef.push(IncludeSoftDef);
            this._xslIEIncludes(xsl, "//include").addCallback(function (xslT) {
               IncludeSoftDef.callback(xslT);
               return xslT;
            });
         }

         pDef.done().getResult().addCallback(function () {
            if (xsl instanceof Deferred) {
               /**
                * We have to save inner includes if there's one
                */
               xsl.addCallbacks(function (res) {
                  success.callback(res);
               }, function (err) {
                  throw err;
               });
            } else {
               success.callback(xsl);
            }
         });

         return success;
      },
      _preparseImportApplianceIE: function(docXSL) {
         var importAppliance = docXSL.selectNodes('//xsl:apply-imports');
         if (importAppliance.length > 0) {
            var applyNode = importAppliance[0];
            var p = applyNode.parentNode;
            var replacement = docXSL.createElement('xsl:apply-templates');
            replacement.setAttribute('select', '.');
            replacement.setAttribute('mode', 'imports');
            p.replaceChild(replacement, applyNode);
         }
         return docXSL;
      },

      _moveChildrenIE: function _moveChildrenIE(includedChildren, template) {
         if (template.childNodes.length > 0) {
            for (var i=0; i < includedChildren.length; i++) {
               template.insertBefore(includedChildren[i], template.childNodes[0]);
            }
         } else {
            for (var i=0; i < includedChildren.length; i++) {
               template.appendChild(includedChildren[i]);
            }
         }
         return template;
      },

      _checkTemplates: function _checkTemplates(template, templates) {
         if (template.getAttribute('match')) {
            for (var i=0; i < templates.length; i++) {
               if (template.getAttribute('match')) {
                  if (templates[i].getAttribute('match') === template.getAttribute('match')) {
                     this._moveChildrenIE(template.childNodes, templates[i]);
                     template.setAttribute('mode', 'imports');
                  }
               }
            }
         }
      },
      _xslIEImports: function xslIEImports(xsl, string) {
         var pDef = new ParallelDeferred();
         var success = new Deferred();
         var inc = xsl.selectNodes(string),
            templates = xsl.selectNodes('//xsl:template'),
            docElement = xsl.documentElement,
            self = this,
            nNode;

         if (inc.length > 0) {
            for (var i = 0; i < inc.length; i++) {
               (function (I) {
                  var hr = inc[I].getAttribute('href'),
                     document = new ClientXMLDocument({ name: hr }).getDocument();
                  if (document) {
                     pDef.push(document.addCallback(function (doc) {
                        if (doc) {
                           self._xslIEWorkaround(doc).addCallback(function (docT) {
                              var makes = docT.documentElement.childNodes;
                              while (makes.length > 0) {
                                 nNode = makes.nextNode();
                                 if (nNode.nodeName === 'xsl:template') {
                                    self._checkTemplates(nNode, templates);
                                 }
                                 docElement.insertBefore(nNode, inc[I]); // вставка нод
                              }
                              docElement.removeChild(inc[I]);
                           });
                        } else {
                           docElement.removeChild(inc[I]);
                        }
                     }));
                  } else {
                     docElement.removeChild(inc[I]);
                  }
               })(i);
            }
         }
         pDef.done().getResult().addCallback(function () {
            success.callback(xsl);
         });
         return success;
      },
      _xslIEIncludes: function xslIEIncludes(xsl, string) {
         var pDef = new ParallelDeferred();
         var success = new Deferred();
         var inc = xsl.selectNodes(string),
            docElement = xsl.documentElement,
            self = this,
            nNode;

         if (inc.length > 0) {
            for (var i = 0; i < inc.length; i++) {
               (function (I) {
                  var hr = inc[I].getAttribute('href'),
                     /**
                      * Mapping over inner document includes
                      * @type {*}
                      */
                     document = new ClientXMLDocument({ name: hr }).getDocument();
                  if (document) {
                     pDef.push(document.addCallback(function (doc) {
                        if (doc) {
                           var makes = doc.documentElement.childNodes;
                           while (makes.length > 0) {
                              nNode = makes.nextNode();
                              docElement.insertBefore(nNode, inc[I]); // вставка нод
                           }
                           docElement.removeChild(inc[I]);
                        } else {
                           docElement.removeChild(inc[I]);
                        }
                     }));
                  } else {
                     docElement.removeChild(inc[I]);
                  }
               })(i);
            }
         }

         pDef.done().getResult().addCallback(function () {
            /**
             * Inner includes generates result in state of deferred
             */
            if (xsl instanceof Deferred) {
               xsl.addCallbacks(function (res) {
                  success.callback(res);
               }, function (err) {
                  throw err;
               });
            } else {
               success.callback(xsl);
            }
         });
         return success;
      },
      _convertAbsolutePath: function(path, mainPath){
         if (path.charAt(0) !== '/'){
            if (mainPath === ''){
               /*
                * У нас не указан основной путь шаблона. Сформируем из корня сайта.
                */
               mainPath = window.location.protocol + '//' + window.location.hostname;
            } else {
               /*
                * У нас указан основной путь до шаблона. Возьмем его путь.
                */
               if (mainPath.lastIndexOf('/') > (mainPath.indexOf('//')+1)){
                  mainPath = mainPath.substring(0, mainPath.lastIndexOf('/'));
               }
            }
            /*
             * Проверяем и прогоняем наш путь path, на ../
             */
            while(/^\.\.\//.test(path)){
               /*
                * Производим выход на уровень только в том случае, если мы не в корне.
                */
               if (mainPath.lastIndexOf('/') > (mainPath.indexOf('//')+1)){
                  mainPath = mainPath.substring(0, mainPath.lastIndexOf('/'));
               }
               path = path.substring(3);
            }
            /*
             * Сформируем наш сконвертированный путь.
             */
            /**
             * Если есть location. Построим путь на основе origin и resourceRoot,
             * чтобы не основываться на url самого документа, который может не соответствовать
             * пути до ресурсов.
             */
            if (window.location.origin) {
               if (constants.resourceRoot) {
                  path = window.location.origin + path.replace('resources/', constants.resourceRoot);
               }
            } else {
               path = mainPath + '/' + path;
            }
            /*
             * Удалим все возможные вхождения ./
             */
            path = path.replace('./', '');
         } else {
            /**
             *  If absolute path has no information of resources root
             *  we should react to that kind of differences in document url
             */
            if (constants.resourceRoot && path.indexOf(constants.resourceRoot) === -1) {
               path = path.replace('/resources/', constants.resourceRoot);
            }
         }
         return path;
      },
      /**
       * Replace resource names in include xsl tags
       * @param docXSL
       * @returns {*}
       */
      preparseIncludeNames: function preparseIncludeNames(docXSL) {
         var includes = docXSL.getElementsByTagName('xsl:include');
         if (includes.length > 0) {
            for (var i=0; i < includes.length; i++) {
              includes[i].setAttribute('href', this._convertAbsolutePath(includes[i].getAttribute('href'), docXSL.URL));
            }
         }
         return docXSL;
      },
      _preparseIncludes: function(docXSL) {
         var pDef = new ParallelDeferred();
         var includes = docXSL.getElementsByTagName('include');
         var includesCount = includes.length;
         var self = this;

         if (includesCount === 0) {
            includes = docXSL.getElementsByTagName('xsl:include');
            includesCount = includes.length;
         }

         for (var i = 0; i < includesCount; i++) {
            (function (I) {
               var includeNode = includes[I];
               var docName = self._convertAbsolutePath(includeNode.getAttribute('href'), docXSL.URL);
               var document = self._loadDoc(docName);
               var p = includeNode.parentNode;

               if (document) {
                  pDef.push(document.addCallback(function (doc) {
                     if(doc) {
                        var children = doc.documentElement.childNodes;
                        for(var j = 0, lj = children.length; j < lj; j++) {
                           p.insertBefore(docXSL.importNode(children[j], true), includeNode);
                        }
                     }
                     p.removeChild(includeNode);
                  }));
               } else {
                  p.removeChild(includeNode);
               }
            })(i);
         }

         return pDef;
      },
      _preparseImportAppliance: function(docXSL) {
         var importAppliance = docXSL.getElementsByTagName('apply-imports');
         while(importAppliance.length > 0) {
            var applyNode = importAppliance[0];
            var p = applyNode.parentNode;
            var replacement = docXSL.createElement('xsl:apply-templates');
            replacement.setAttribute('select', '.');
            replacement.setAttribute('mode', 'imports');
            p.replaceChild(replacement, applyNode);
         }
      },
      _preparseImports: function(docXSL) {
         var pDef = new ParallelDeferred(),
             imports,
             importsCount,
             self = this;
         if (detection.isMac) {
            imports = docXSL.getElementsByTagName('xsl:import');
         } else {
            imports = docXSL.getElementsByTagName('import');
         }
         importsCount = imports.length;
         for (var i = 0; i < importsCount; i++) {
            (function (I) {
               var importNode = imports[I];
               var docName = self._convertAbsolutePath(importNode.getAttribute('href'), docXSL.URL);
               var document = self._loadDoc(docName);
               var p = importNode.parentNode;
               if (document) {
                  pDef.push(document.addCallback(function (doc) {
                     if(doc) {
                        var children = doc.documentElement.childNodes;
                        for(var j = 0, lj = children.length; j < lj; j++) {
                           var child = children[j];
                           if(child.nodeName == 'xsl:template') {

                              if(child.hasAttribute('name')) {
                                 var n = child.getAttribute('name');
                                 var numDups = docXSL.evaluate("count(//xsl:template[@name='" + n + "'])", docXSL, self._nsResolver, XPathResult.NUMBER_TYPE, null);
                                 if(numDups && numDups.numberValue > 0) {
                                    ioc.resolve('ILogger').log("xslt", "Ignored duplicate named template: " + n);
                                    continue; // If template with same name is already declared - ignore it
                                 }
                              }

                              if(child.hasAttribute('match')) {
                                 var m = child.getAttribute('match');
                                 var numSameMatchPattern = docXSL.evaluate("count(//xsl:template[@match='" + m + "'])", docXSL, self._nsResolver, XPathResult.NUMBER_TYPE, null);

                                 // Если такой темплейт с таким же match уже есть - выставим mode=imports
                                 // А если нет - не выставим
                                 if(numSameMatchPattern && numSameMatchPattern.numberValue > 0)
                                    child.setAttribute('mode', 'imports');
                              }
                           }
                           p.insertBefore(docXSL.importNode(child, true), importNode);
                        }
                     }
                     p.removeChild(importNode);
                  }));
               } else {
                  p.removeChild(importNode);
               }
            })(i);
         }

         return pDef;
      },

      handleForeignDoc: function(url, docXML, sExpr, changes, i, foreignDoc, def) {
         var fakeNodeName = "x" + url.replace(/[\/)(:]/g,'-') + '-document';
         var docCtr = docXML.createElement(fakeNodeName);
         var fakeCtr = this._getForeignDocContainer(docXML);
         fakeCtr.appendChild(docCtr);

         docCtr.appendChild(docXML.importNode(foreignDoc.documentElement, true));

         /**
          * Формируем специальное имя для асинхронной загрузки внешних документов,
          * в синхронном случае формируем имя как нужно для обычной обработки xsl
          */
         if (def) {
            sExpr = "//ws-foreign-documents-namespace/" + fakeNodeName;
         } else {
            sExpr = "//ws-foreign-documents-namespace/" + fakeNodeName + sExpr.substring(url.length + 12);
         }
         changes.push([ i, sExpr ]);
      },

      _preparseDocumentFunction: function(docXML, docXSL) {
         var hasDocumentF = docXSL.evaluate("//*[contains(@select, 'document(')]", docXSL, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
         var i;
         var changes = [],
            self = this,
            isDocDef = false,
            singleDef = new Deferred(),
            pdef = new ParallelDeferred();
         while((i = hasDocumentF.iterateNext()) !== null) {
            var sExpr = i.getAttribute('select'),
               m = sExpr.match(/document\('([^]+)'\)/);

            if(m && m.length > 0) {
               var url = this._convertAbsolutePath(m[1], docXSL.URL);
               var foreignDoc = this._loadDoc(url);
               if(foreignDoc) {
                  isDocDef = foreignDoc instanceof Deferred;
                  if (isDocDef) {
                     (function (fileUrl, doc) {
                        foreignDoc.addCallback(function (foreignDocResult) {
                           self.handleForeignDoc.call(this.xslt, fileUrl, docXML, sExpr, changes, this.doc, foreignDocResult, true);
                           return foreignDocResult;
                        }.bind({ xslt: self, doc: doc }));
                     })(url, i);
                     pdef.push(foreignDoc);
                  } else {
                     self.handleForeignDoc.call(this, url, docXML, sExpr, changes, i, foreignDoc);
                  }
               }
            }
         }

         if (isDocDef) {
            pdef.done().getResult().addCallback(function () {
               preparseChanges(changes, docXSL);
               singleDef.callback(true)
            });
            return singleDef;
         } else {
            preparseChanges(changes, docXSL);
         }
      },
      _getForeignDocContainer: function(doc) {
         var ctr = doc.getElementsByTagName('ws-foreign-documents-namespace')[0];
         if(!ctr) {
            ctr = doc.createElement('ws-foreign-documents-namespace');
            doc.documentElement.appendChild(ctr);
         }
         return ctr;
      },
      _insertForeignDoc: function(toDoc, docName) {
         var foreignDoc = new XMLDocument({ name: docName });
         var xmlDocName = 'xxx';

         var ctr = this._getForeignDocContainer(toDoc);
         var docE = toDoc.createElement(xmlDocName);
         docE.appendChild(docE.importNode(foreignDoc.getDocument(), true));
         ctr.appendChild(docE);
      },
      /**
       * Добавляет параметры (xsl:param) в xsl-документ
       * @param   {Document}  xslDoc   Документ, в который необходимо добавить параметры
       * @param   {Object}    params   Мап с ключ-значение
       * @returns {Document}           Результирующий документ
       */
      _ieAddParams: function(xslDoc, params){
         if(!params){
            return xslDoc;
         }
         for(var p in params){
            try{
               var value = params[p];
               if(typeof value === 'boolean' || (isNaN(parseInt(value,10)) && (typeof value !== 'string' || value.charAt(0) !== "'"))){
                  value = "'" + value + "'";
               }
               // Судя по всему в IE больше добавлять select к xsl:param больше не нужно
               // var element = xslDoc.selectSingleNode('//xsl:param[@name="' + p + '"]');
               // if(element){
               //    element.setAttribute('select', value);
               // }
            }
            catch(e){
               throw new Error('Problems with setting parameter ' + p + ' in the xsl transform');
            }
         }
         return xslDoc;
      },
      /**
       * Выполняет XSL-трансформацию в строку
       * <strong>ВНИМАНИЕ!!!</strong> если ваша трансформация использует method="text" результат работы
       * этого метода в разных браузерах будет разный.
       * Лучше всего работает IE - он действительно вернет текст. Chrome и FF вернут XML в виде текста в котором будет
       * присутствовать результат трансформации в т.ч.
       *
       * @param {Object} [params] Ассоциативный массив с параметрами
       * @returns {Deferred}
       * @throws {Error} Если трансформация в текст недоступна
       */
      transformToText: function(params) {
         var resDef = new Deferred(),
            transformedDoc;
         //Проверка на ИЕ вставлена специально (koshelevav). Теоретически в девятке должно работать, НО падает. Насильно запущено по второй ветке
         if(window.XMLSerializer && (!detection.isIE || detection.isIE12)) {
            transformedDoc = this.transformToDocument(params);

            this.includeCss(transformedDoc, function (doc) {
               resDef.callback(new XMLSerializer().serializeToString(doc));
            });

            return resDef;
         } else {
            if(axo) {
               var self = this;

               this._xslIEWorkaround(this._xslDoc).addCallback(function (xslT) {
                  self._xslDoc = xslT;
                  transformedDoc = self._ieAddParams(self._xslDoc, params);
                  self.includeCss(transformedDoc, function (doc) {
                     try {
                        resDef.callback(self._xmlDoc.transformNode(doc));
                     } catch(e) {
                        resDef.errback(e);
                     }
                  }, true);
               });
               return resDef;
            }
         }
         throw new Error("Transform to text is not supported in your environment");
      },
      includeCss: function (doc, callback, IE) {
         var head = $(doc).find('head'),
            links = head.find('link'),
            hrefs = [],
            pDef = new ParallelDeferred();
         if (links.length) {
            links = links.toArray();
            links.forEach(function (link) {
               var $link = $(link);
               hrefs.push($link.attr('href'));
               $link.remove();
            });

            hrefs.forEach(function (href) {
               pDef.push(function () {
                  var
                     xhttp = new XMLHttpRequest(),
                     def = new Deferred();

                  xhttp.open("GET", href, true);
                  xhttp.send("");
                  xhttp.onreadystatechange = function () {
                     if (xhttp.readyState == 4) {
                        def.callback(xhttp);
                     }
                  };
                  return def;
               });
            });
         }
         pDef.done().getResult().addCallback(function (results) {
            for (var key in results) {
               if (!results.hasOwnProperty(key)) continue;
               var res = results[key];
               if (IE) {
                  var style = doc.createElement('style');
                  style.text = res.responseText;
                  if (head && head[0]) {
                     head[0].appendChild(style);
                  }
               } else {
                  head.append($('<style>' + res.responseText + '</style>'));
               }
            }
            callback(doc);
         });
      },
      /**
       * Выполняет XSL-трансформацию в документ
       *
       * @param {Object} [params] Ассоциативный массив с параметрами
       * @returns {Document}
       * @throws {Error} Если трансформация в документ недоступна
       */
      transformToDocument: function(params) {
         if(window.XSLTProcessor) {
            var xsltProcessor = new XSLTProcessor();
            for(var p in params){
               xsltProcessor.setParameter(null, p, params[p]);
            }
            if(xsltProcessor.transformToDocument) {
               xsltProcessor.importStylesheet(this._xslDoc);
               return xsltProcessor.transformToDocument(this._xmlDoc);
            }
         } else {
            if(axo) {
               var doc = axo("Microsoft.XMLDOM");
               this._ieAddParams(doc, params);
               if('transformNodeToObject' in this._xmlDoc) {
                  this._xslDoc = this._xslIEWorkaround(this._xslDoc);
                  this._xmlDoc.transformNodeToObject(this._ieAddParams(this._xslDoc, params), doc);
                  return doc;
               }
            }
         }
         throw new Error("Transform to document is not supported in your environment");
      },
      /**
       * Трансформирует в фрагмент указанного документа
       *
       * @param {Document} doc
       * @params {Object} [params] Ассоциативный массив с параметрами
       * @returns {Document}
       * @throws {Error} Если трансформация в фрагмент недоступна
       */
      transformToFragment: function(doc, params) {
         if (window.XSLTProcessor) {
            var proc = new XSLTProcessor();
            for(var p in params){
               proc.setParameter(null, p, params[p]);
            }
            if (proc.transformToFragment) {
               proc.importStylesheet(this._xslDoc);
               return proc.transformToFragment(this._xmlDoc, doc);
            }
         } else {
            if (axo) {
               var fragment = doc.createDocumentFragment();
               var output = this._xmlDoc.transformNode(this._ieAddParams(this._xslDoc, params));
               var container = doc.createElement('div');
               container.innerHTML = output;
               while (container.hasChildNodes()) {
                  fragment.appendChild(container.firstChild);
               }
               return fragment;
            }
         }
         throw new Error("Transform to fragment is not supported in your environment");
      },
      /**
       * Выясняет возможности текущегно окружения
       * @see {$ws._const.XSLTCaps}
       * @returns {number}
       */
      getCapabilities: function() {
         var
            caps = XSLTCaps.LOAD_URL, // Anyone can load through XMLHttpRequest
            proc;
         if(window.DOMParser)
            caps |= XSLTCaps.LOAD_TEXT;
         if(window.XSLTProcessor) {
            proc = new XSLTProcessor();
            if(proc.transformToDocument)
               caps |= XSLTCaps.TRANSFORM_TO_DOC;
            if(proc.transformToFragment)
               caps |= XSLTCaps.TRANSFORM_TO_FRAGMENT;
         } else {
            if(axo) {
               proc = axo("Microsoft.XMLDOM");
               if('transformNodeToObject' in proc)
                  caps |= XSLTCaps.TRANSFORM_TO_DOC;
               if('transformNode' in proc)
                  caps |= XSLTCaps.TRANSFORM_TO_TEXT;
               if('loadXML' in proc)
                  caps |= XSLTCaps.LOAD_TEXT;
            }
         }

         if(window.XMLSerializer)
            caps |= XSLTCaps.TRANSFORM_TO_TEXT;

         return caps;
      },
      /**
       * Зачищает внутренние структуры. После выполнения данного метода класс более не пригоден к использоавнию
       */
      destroy: function() {
         this._xmlDoc = null;
         this._xslDoc = null;
         this._options = null;
      }
   });

   /**
    * Создаем XMLDocument через ioc, чтобы подменять реализации на сервере на другую
    */
   var XMLDocument = function(config) {
      return ioc.resolve('IXMLDocument', config);
   };

   /**
    * @class Core/XMLDocument
    * @public
    */
   var ClientXMLDocument = coreExtend.extend({}, /** @lends Core/XMLDocument.prototype */{
      $protected: {
         _options: {
            /**
             *  @cfg {String} Текст документа, инстанс документа или URL - тип определяется автоматически
             */
            name: '',
            errback: undefined
         },
         _doc: null
      },
      $constructor: function() {
         this._doc = this._loadDocument(this._options.name);
      },
      /**
       * @returns {Document}
       */
      getDocument: function() {
         return this._doc;
      },
      /**
       * Проверяет документ - не является ли он результатом ошибки разбора
       *
       * @param {Document} document
       * @returns {Document}
       * @throws {EvalError} Если документ некорректный (в результате его разбора произошла ошибка)
       */
      checkDocument: function(document) {
         var error = checkDocumentOnError(document);
         if(error !== null && !this._options.errback)
            throw new EvalError("Parse error: " + error);
         return document;
      },
      /**
       * Загружает и проверяет документ
       * @param {String|Document} resource
       * @returns {Document}
       */
      _loadDocument: function(resource) {
         var
            doc = null,
            self = this,
            res;

         if(resource.documentElement) {
            doc = resource;
         } else {
            doc = this['_loadDocumentFrom' + (this._isUrl(resource) ? 'Url' : 'String')](resource);
         }

         if (doc instanceof Deferred) {

            doc.addCallback(function (loadDoc) {
               return self.checkDocument(loadDoc);
            });

            if (this._options.errback) {
               doc.addErrback(this._options.errback);
            }

            res = doc;
         } else {
            res = new Deferred();
            res.callback(this.checkDocument(doc));
         }
         return res;
      },

      /**
       * @param {String} content
       * @returns {Document}
       * @throws {Error} Если нет возможности получить документ из строки
       */
      _loadDocumentFromString: function(content) {
         var
            doc = null,
            def = new Deferred();

         content = removeInvalidXMLChars(content);
         if (axo) {
            doc = axo("Microsoft.XMLDOM");
            doc.async = false;
            doc.loadXML(content);
         } else
         if(window.DOMParser)
            doc = new DOMParser().parseFromString(content, "text/xml");
         if(doc !== null) {
            def.callback(doc);
            return def;
         }
         throw new Error("Your environment is not able to parse XML documents from string");
      },
      _loadDocumentUsingXHR: function (url) {
         var
            xhttp = new XMLHttpRequest(),
            def = new Deferred();

         //TODO: переписать на асинхронную загрузку
         //ХАК: В последней версии Хрома (48.0.2564.103) сломали кеш для синхронных запросов из XMLHttpRequest
         // https://code.google.com/p/chromium/issues/detail?id=570622
         //Если сервер возвращает код 304, то из кеша может прийти пустая строка вместо закешированного значения
         //Приходится для Хрома отключать кеширование
         if (detection.chrome && /\.(xml|xsl)$/.test(url)) {
            url += '?_=' + Math.random();
         }
         xhttp.open("GET", url, true);
         xhttp.send("");
         xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4) {
               def.callback(xhttp);
            }
         };
         return def;
      },
      /**
       * @param {String} url
       * @returns {Document}
       */
      _loadDocumentFromUrl: function(url) {
         var def;
         if(axo) { // IE
            var doc = axo("Microsoft.XMLDOM");
            if (window.XMLHttpRequest) {
               def = this._loadDocumentUsingXHR(url);
               def.addCallback(function (xhr) {
                  doc.loadXML(removeInvalidXMLChars(xhr.responseText));
                  return doc;
               });
               //xhr = this._loadDocumentUsingXHR(url);
               //doc.loadXML(sHelpers.removeInvalidXMLChars(xhr.responseText));
            } else {
               doc.async = false;
               doc.load(url);
               def.callback(doc);
            }
            return def;
         }
         else {
            def = this._loadDocumentUsingXHR(url);
            def.addCallback(function (xhr) {
               return xhr.responseXML;
            });

            return def;
         }
      },
      /**
       * Проверяет, является ли строка URL'ом
       * Поддерживаются схемы:
       *  - http://host/file
       *  - https://host/file
       *  - /file
       *  - ./file
       *  - ../file
       *  - file
       *
       * @param {String} str проверяемая строка
       * @returns {Boolean}
       */
      _isUrl: function(str) {
         if(str.substr === undefined || str === '' || !str) {
            return false;
         }

         if (!/^http[s]?:/.test(str)) {
            var firstChar = str.substr(0, 1);
            if (firstChar != '/' && firstChar != '.') {
               if(firstChar == '<') // Begin of XML declaration
                  return false;
            }
         }
         return true;
      },

      /**
       * Зачищает внутренние структуры. После выполнения данного метода класс более не пригоден к использоавнию
       */
      destroy: function() {
         this._doc = null;
         this._options = null;
      }
   });

   ioc.bind('IXMLDocument', ClientXMLDocument);
   constants.XSLTCaps = XSLTCaps;

   return XSLTransform;
});
