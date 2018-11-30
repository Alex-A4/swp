define('Core/core-init', [
   'Core/core-init-min',
   'Core/Context'
], function(minInit, Context) {

   //TODO требуется для работоспособности старых контролов.
   return typeof window === 'undefined' ? minInit : minInit.addCallback(function() {
      // Вычитка параметров из адресной строки в глобальный контекст
      var args = location.search;
      if (args.indexOf('?') === 0) {
         var argsArr = args.substr(1).split('&');
         for (var i = 0, l = argsArr.length; i < l; i++) {
            // Шилов Д.А. не будем сплитить, надо найти только первый символ =
            var
               index = argsArr[i].indexOf('='),
               name = decodeURIComponent(argsArr[i].substring(0, index));

            if (name) {
               Context.global.setValue(name, decodeURIComponent(argsArr[i].substring(index + 1)));
            }
         }
      }
   });
});