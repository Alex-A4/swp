define('Core/Sanitize', [
   'Core/markup/ParserUtilities',
   'Core/validHtml',
   'Core/core-merge',
   'Core/core-clone',
   'Core/helpers/String/escapeHtml',
   'Core/helpers/String/unEscapeASCII'
], function(Parser,
            defaultOptions,
            coreMerge,
            coreClone,
            escapeHtml,
            unEscapeASCII) {
   'use strict';
   /**
    * Очищает контент от вредоносных скриптов
    * @class Core/Sanitize
    * @author Авраменко А.С.
    * @public
    */

   var
      // Для того чтобы data-атрибуты не вырезались
      checkDataAttribute = function checkDataAttribute(name) {
         return /^data-([\w-])*$/gi.test(name);
      },

      asciiRegExp = /(&#\d+)/gim,
      jsRegExp = /javascript:/gim,
      commentOpen = /<!--/gim,
      commentClose = /-->/gim;

   function validateAttributes(content, settings) {
      var
         attributeSettings;
      for (var attributeName in content.attributes) {
         if (content.attributes.hasOwnProperty(attributeName)) {
            var
               attribute = content.attributes[attributeName];
            attributeSettings = settings.validAttributes[attributeName] || (settings.checkDataAttribute ? checkDataAttribute(attributeName): false);
            if (typeof attributeSettings !== 'function') {
               if (attributeSettings) {
                  attribute.value = attribute.value.replace(asciiRegExp, function(str) {
                     return unEscapeASCII(str + ';');
                  });
                  while (jsRegExp.test(attribute.value)) {
                     attribute.value = attribute.value.replace(jsRegExp, '');
                  }
               } else {
                  delete content.attributes[attributeName];
               }
            } else {
               // если attributeSettings - функция, то она должна сама вырезать или оставить атрибут
               attributeSettings(content, attributeName);
            }
         }
      }
   }

   function validateContent(content, settings) {
      if (content.childNodes) {
         var idx = content.childNodes.length;

         while (idx--) {
            var
               node = content.childNodes[idx],
               nodeType = node.nodeType,
               nodeName = node.nodeName,
               nodeSettings = settings.validNodes[(nodeName || '').toLowerCase()];

            if (typeof nodeSettings !== 'object') {
               if (nodeType !== 1 || nodeSettings) {
                  // детей component и его атрибуты не надо валидировать
                  if (nodeName !== 'component') {
                     validateContent(node, settings);
                  }
               } else {
                  // обрабатываем неразрешенный тег в зависимости от опции
                  if (settings.escapeInvalidTags) {
                     // экранируем запрещенный тег
                     if (settings.fullEscapeNodes[nodeName]) {
                        // создаем новую текстовую ноду, с содержимым в виде текста неразрешенного тега
                        var escapedTag = escapeHtml(node.outerHTML());
                        content.childNodes[idx] = new Parser.Node({nodeType: 3, text: escapedTag});
                     } else {
                        // считаем за текст открывающий и закрывающий теги, внутренние ноды пока оставляем без изменений
                        var innerNodes = node.childNodes; // берем внутренние ноды экранируемого тега
                        if (node.startTag) {
                           // экранируем открывающий тег и добавляем в начало innerNodes
                           innerNodes.unshift(new Parser.Node({ nodeType: 3, text: escapeHtml(node.startTag) }));
                        }
                        if (node.closeTag) {
                           // экранируем закрывающий тег и добавляем в конец innerNodes
                           innerNodes.push(new Parser.Node({ nodeType: 3, text: escapeHtml(node.closeTag) }));
                        }

                        // заменяем запрещенный тег на [экранированный открывающий + вложенные теги + экранированный закрывающий
                        content.childNodes.splice.apply(content.childNodes, [ idx, 1 ].concat(innerNodes));

                        // сдвигаем указатель проверки, так как нужно проверить ноды, которые раньше лежали
                        // внутри замененного тега
                        idx += innerNodes.length;
                     }
                  } else {
                     // вырезаем запрещенный тег
                     content.childNodes.splice(idx, 1);
                  }
               }
            } else {
               // если nodeSettings - object, значит это набор атрибутов с их валидаторами
               var tempSettings = coreMerge(coreClone(settings), {validAttributes: nodeSettings});
               validateContent(content.childNodes[idx], tempSettings);
            }
         }
      }
      validateAttributes(content, settings);
   }

   return function(content, options) {
      var parsed, settings, canParse, result;

      if (typeof(content) !== 'string') {
         return content;
      }

      // нет <[A-z] значит точно нет тегов и нечего санитайзить
      // мы должны удостовериться, что это именно что-то похожее на тег < + какой-то alphaсимвол
      if (content.search(/<[A-zA-я]/g) === -1) {
         return content;
      }

      try {
         parsed = Parser.parse(content);
         canParse = true;
      } catch(e) {
         canParse = false;
      }

      if (canParse) {
         settings = options ? coreMerge(coreClone(defaultOptions), options) : defaultOptions;
         validateContent(parsed, settings);
         result = parsed.innerHTML();
      } else {
         result = escapeHtml(content);
      }

      return result;
   };

});
