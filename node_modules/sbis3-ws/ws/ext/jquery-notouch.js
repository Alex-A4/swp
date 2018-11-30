/**
 * @author Глебский Роман Вадимович
 */
(function($) {
   var bTouchEnabled = 'ontouchstart' in window || ('onmsgesturechange' in window && 'msMaxTouchPoints' in window.navigator && window.navigator.msMaxTouchPoints);
   if (!bTouchEnabled) {
      var oldOn = $.fn.on,
         oldOff = $.fn.off,
         regexp = /(\s|^)(touchstart|touchmove|touchend)(?=(\s|$))/g,
         filter = function(args) {
            if (typeof args[0] === 'object' ) {
               delete args[0].touchstart;
               delete args[0].touchmove;
               delete args[0].touchend;
            } else if (args[0]) {
               args[0] = args[0].replace(regexp, '$1');
            }
            return args;
         };
      $.fn.on = function() {
         return oldOn.apply(this, filter(arguments));
      };
      $.fn.off = function() {
         return oldOff.apply(this, filter(arguments));
      };
   }
})(jQuery);
