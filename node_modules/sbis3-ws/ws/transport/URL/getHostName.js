define('Transport/URL/getHostName', function() {
   'use strict';

   return function() {
      var req = process && process.domain && process.domain.req;
      return req ? req.hostname : location.hostname;
   };
});
