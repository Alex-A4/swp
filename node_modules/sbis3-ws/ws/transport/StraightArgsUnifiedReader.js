define('Transport/StraightArgsUnifiedReader', [
   'Deprecated/StraightArgsUnifiedReader',
   'Core/deprecated'
], function(StraightArgsUnifiedReader, deprecated) {
   deprecated.showInfoLog('Transport/StraightArgsUnifiedReader помечен как deprecated и будет удален в 3.18.');
   return StraightArgsUnifiedReader;
});