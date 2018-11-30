define('Transport/Source', [
   'Deprecated/Source',
   'Core/deprecated'
], function(Source, deprecated) {
   deprecated.showInfoLog('Transport/Source помечен как deprecated и будет удален в 3.18.');

   return Source;
});