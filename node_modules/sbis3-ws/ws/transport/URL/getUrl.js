define('Transport/URL/getUrl', function() {
   'use strict';

   return function() {
      var req = process && process.domain && process.domain.req;
      return req
         ? req.originalUrl
         : location
            ? location.href
            : '';
   };
});
