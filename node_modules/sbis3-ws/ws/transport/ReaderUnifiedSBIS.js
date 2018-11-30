define('Transport/ReaderUnifiedSBIS', [
   'Deprecated/ReaderUnifiedSBIS',
   'Core/deprecated'
], function(ReaderUnifiedSBIS, deprecated) {
   deprecated.showInfoLog('Transport/ReaderUnifiedSBIS помечен как deprecated и будет удален в 3.18.');
   return ReaderUnifiedSBIS;
});