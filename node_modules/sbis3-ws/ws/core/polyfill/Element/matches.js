(function(e){

   e.matches || (e.matches=e.matchesSelector||e.webkitMatchesSelector||e.mozMatchesSelector||e.msMatchesSelector||e.oMatchesSelector||function(selector){
         var matches = document.querySelectorAll(selector), th = this;
         return Array.prototype.some.call(matches, function(e){
            return e === th;
         });
      });

})(Element.prototype);