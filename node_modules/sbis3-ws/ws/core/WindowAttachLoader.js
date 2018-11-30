define('Core/WindowAttachLoader', [
   'require',
   'Core/IAttachLoader',
   'Core/IoC',
   'Core/deprecated'
], function(
   require,
   IAttachLoader,
   IoC,
   cDeprecated
) {
   /**
    * @class Core/WindowAttachLoader
    * @extends Core/IAttachLoader
    * @public
    * @author Бегунов А.В.
    */
   var WindowAttachLoader = IAttachLoader.extend(/** @lends Core/WindowAttachLoader.prototype */{
      attach: function(URL, resource, options) {
         var
            nodeType = URL.replace(/^.*\.([^\.]+)(\?.*)?$/ig, "$1").toLowerCase(),
            nodePath = URL,
            nodeAttr = {
               css: {
                  tag: "LINK",
                  rel: "stylesheet",
                  type: "text/css",
                  href: nodePath
               },
               js: {
                  tag: "SCRIPT",
                  charset: options && options.charset || 'UTF-8',
                  type: "text/javascript",
                  src: nodePath
               }
            }[nodeType];

         // создаем ресурс в контексте документа
         if (nodeAttr !== undefined) {
            var
               head = document.getElementsByTagName("head")[0],
               node = document.createElement(nodeAttr.tag),
               ready = false;
            delete nodeAttr.tag;
            for (var i in nodeAttr) {
               node.setAttribute(i, nodeAttr[i]);
            }

            node.onerror = function() {
               resource.errback(new Error('attach: cannot load resource: ' + nodePath));
            };

            switch (node.tagName.toUpperCase()) {
               case "LINK":
                  require(['native-css!' + nodePath], function() {
                     resource.callback();
                  }, function(error) {
                     resource.errback(error);
                  });
                  break;
               case "SCRIPT":
                  node.onload = node.onreadystatechange = function() {
                     var state = this.readyState;
                     if (!ready && (!state || state == "loaded" || state == "complete")) {
                        ready = true;
                        node.onload = node.onreadystatechange = null;
                        // Такой результат здесь нужен для корректной работы attachComponent,
                        // в случае, если мы сделали сначала attach, а потом attachComponent и он загрузил
                        // тот же файл
                        resource.callback('');
                     }
                  };
                  head.appendChild(node);
                  break;
            }
         } else {
            resource.errback(new Error("attach: Unknown resource type specified: " + URL));
         }
      }
   });

   WindowAttachLoader.attach = cDeprecated(WindowAttachLoader.attach, {
      name: 'WindowAttachLoader.attach',
      ver: '3.7.5',
      use: 'requirejs'
   });

   IoC.bindSingle('IAttachLoader', WindowAttachLoader);

   return WindowAttachLoader

});