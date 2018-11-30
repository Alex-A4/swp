(function() {

   // проверяем поддержку
   if (!Element.prototype.closest) {

      // реализуем
      Element.prototype.closest = function(css) {
         var node = this;

         while (node) {
            if (node.matches(css)) return node;
            else node = node.parentElement;
         }
         return null;
      };
   }

})();