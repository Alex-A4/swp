define('Transport/ReaderGETJSON', [
   'Deprecated/ReaderGETJSON',
   'Core/deprecated'
], function(ReaderGETJSON, deprecated) {
   deprecated.showInfoLog('Transport/ReaderGETJSON помечен как deprecated и будет удален в 3.18.');
   return ReaderGETJSON;
});