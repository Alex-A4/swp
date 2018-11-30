define('Transport/attachTemplate', [
   'Core/constants',
   'Core/cookie',
   'Core/Deferred',
   'Core/IoC',
   'Core/Storage',
   'Transport/nodeType',
   'Transport/Templates/EmptyTemplate'
], function(constants, cookie, Deferred, ioc, Storage, nodeType) {
   var attach;

   function addXmlLog(templateName) {
      var tplListElem = $('#xmlContent');
      if (!tplListElem.length) {
         tplListElem = $('<div id="xmlContent" style="display:none; visibility: hidden;"></div>');
         $('body').append(tplListElem);
      }
      if (!tplListElem.data(templateName)) {
         tplListElem.data(templateName, true);
         tplListElem.append('<div name="' + templateName + '">')
      }
   }

   /**
    * Асинхронная загрузка XML-документа с шаблоном.
    * Для каждого файла непосредственно загрузка будет выполняться только один раз
    *
    * @param {String} templateName имя шаблона или путь (если начинается с . или /)
    * @param {Boolean} [fast]
    * @returns {Core/Deferred}
    */
   function loadTemplateFile(templateName, fast) {

      /**
       * Функция, запрашивающая шаблон.
       * @param {String} file конкретное абсолютное имя файла шаблона
       * @return {Core/Deferred}
       */
      function requestTemplateFile(file) {
         //проверяем загружался ли хоть 1 из пакетов содержащий нужный шаблон, если нет - берем последний
         if (!fast && file instanceof Array) {
            for (var i = 0, l = file.length; i < l; i++) {
               if (Storage.isStored('resfile://' + file[i]) || i == l - 1) {
                  file = file[i];
                  break;
               }
            }
         }

         var rid = typeof document !== 'undefined' && (cookie.get('s3rh') || cookie.get('rightshash')) || 0;

         return Storage.store('resfile://' + file, function(dResult) {
            dResult.dependOn(ioc.resolve('ITransport', {
               dataType: fast ? 'text' : 'xml',
               url: (function() {
                  // При запросе XML допишем к версии идентификатор прав (передаваемый в cookie)
                  var res = file + (fast ? '.fast.xml' : '.xml');
                  if (rid) {
                     res = res.replace(/(\.fast)?(\.v[0-9a-f]+)?(\.l[\S-]+)?(\.xml)$/, '$1.r' + rid + '$2$3$4');
                  }
                  return res;
               })()
            }).execute(null));
         });
      }

      // Если ресурс пакетирован - грузим пакет и ищем там
      if (constants.xmlPackages[templateName] && !fast) {
         return new Deferred().dependOn(requestTemplateFile(constants.xmlPackages[templateName]))
            .addCallback(function(res) {
               var root = res.documentElement;
               for (var j = root.childNodes.length - 1; j >= 0; --j) {
                  if (root.childNodes[j].nodeType != nodeType.ELEMENT_NODE) {
                     continue;
                  }
                  if (root.childNodes[j].getAttribute('id') == templateName) {
                     return root.childNodes[j];
                  }
               }
               return new Error(templateName + ' is not found in the package ' + constants.xmlPackages[templateName]);
            });
      }

      // Иначе работаем по старой схеме
      var
         firstChar = templateName.charAt(0),
         base = '';
      // Если первый символ . или / - значит это путь. Грузим его непосредственно. В противном случае
      // это или ресурс движка или ресурс по оглавлению
      if (firstChar !== '/' && firstChar !== '.') {
         // Проверим есть ли в оглавлении
         if (templateName in constants.xmlContents) {
            templateName = constants.xmlContents[templateName];
            firstChar = templateName.charAt(0);
            if (firstChar !== '/') {
               // Если у нас не абсолютный путь
               base = constants.resourceRoot;
            }
         } else {
            // если нет - грузим из ресурсов движка
            base = constants.wsRoot + 'res/xml/';
         }
      }
      return requestTemplateFile(base + templateName);
   }

   /**
    * Асинхронная загрузка инстанса класса SBIS3.CORE.Template
    * Для каждого не первого вызова будет отдаваться ранее созданный инстанс
    *
    * @param {String} templateName имя шаблона
    * @param {Object} [options]
    * @param {Boolean} [options.fast=false]
    * @param {String} [options.html='']
    * @returns {Core/Deferred}
    */
   function attachTemplate(templateName, options) {
      var
         res,
         fast = false,
         html = '',
         result = new Deferred();

      if (options && typeof options == 'object') {
         fast = options.fast || false;
         html = options.html || '';
      } else {
         fast = arguments[1];
         html = arguments[2];
      };

      Storage.store('res://' + templateName, function(dResult) {
         function createTpl(transportTemplate, cont, tplName) {
            dResult.callback({
               transportTemplate: transportTemplate,
               templateXML: cont,
               template: cont,
               templateName: tplName
            })
         }
         var  coreModules =  ['Deprecated', 'Lib'],
            moduleName = templateName.indexOf('/') > 0 ? templateName.split('/')[0] : false;

         if ((coreModules.indexOf(moduleName) > -1 || constants.modules.hasOwnProperty(moduleName)) ||
            (templateName[0] !== '.' && templateName.indexOf('SBIS3.') === -1 && templateName.indexOf('/') > -1)
         ) {
            require([templateName, 'Transport/Templates/CompoundControlTemplate'], function(constructor, transportTemplate) {
               createTpl(transportTemplate, constructor, templateName);
            }, function(e) {
               dResult.errback(e);
            });
         }
         else if (fast && html) {
            createTpl('Deprecated/Templates/FastTemplate', html, templateName);
         } else if (templateName) {
            loadTemplateFile(templateName, fast).addCallbacks(function(content) {

               createTpl(fast ? 'Deprecated/Templates/FastTemplate' : 'Deprecated/Templates/XMLTemplate', content, templateName);

               addXmlLog(templateName);
               return content;
            }, function(error) {
               dResult.errback(error);
               return error;
            });
         } else {
            createTpl('Transport/Templates/EmptyTemplate', '', '');
         }
      }).addCallbacks(function(cfg) {
         var transportTemplate = cfg.transportTemplate;
         if (typeof transportTemplate == 'string') {
            transportTemplate = require(transportTemplate);
         }
         var templateInstance = new transportTemplate(cfg);
         templateInstance.getRenderResult().addCallback(function () {
            result.callback(templateInstance);
         }).addErrback(function (e) {
            result.errback(new Error('attachTemplate: ' + e.message));
         });
         return cfg;
      }, function (error) {
         result.errback(error);
         return error;
      });

      return result;
   }

   return attach = {
      attachTemplate: attachTemplate,
      loadTemplateFile: loadTemplateFile
   }
});
