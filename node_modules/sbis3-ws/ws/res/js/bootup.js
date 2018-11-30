define('bootup', [
   'bootup-min',
   'Deprecated/Serializer'
], function(bootupMin, Serializer) {

   "use strict";

   var bootup = function(page, container, areaTemplate) {
      bootupMin.call(this, page, container, areaTemplate, Serializer)
   };

   return bootup;
});