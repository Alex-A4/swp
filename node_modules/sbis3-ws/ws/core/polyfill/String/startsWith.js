if(!String.prototype.startsWith) {
   String.prototype.startsWith = function(s) {
      s = '' + s;
      return this.substr(0, s.length) === s;
   };
}
