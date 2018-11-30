define('Transport/ReaderSBIS', [
   'Deprecated/ReaderSBIS',
   'Core/deprecated'
], function(ReaderSBIS, deprecated) {
   deprecated.showInfoLog('Transport/ReaderSBIS помечен как deprecated и будет удален в 3.18.');
   return ReaderSBIS;
});