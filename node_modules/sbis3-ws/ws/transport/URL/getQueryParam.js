define('Transport/URL/getQueryParam', function() {
   'use strict';

   function _parseString(string, regExp) {
      var match = regExp.exec(string);
      return match && decodeURI(match[1]);
   }

   return function(name) {
      var
         req = typeof process !== 'undefined' && process.domain && process.domain.req,
         regExp = new RegExp('[?&]' + name + '=([^&]*)');
      return (req && req.query) ? req.query[name] : (typeof location !== 'undefined' ? _parseString(location.search, regExp) : '');
   };
});
