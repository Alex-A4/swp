define('Transport/StraightArgsReader', [
   'Deprecated/StraightArgsReader',
   'Core/deprecated'
], function(StraightArgsReader, deprecated) {
   deprecated.showInfoLog('Transport/StraightArgsReader помечен как deprecated и будет удален в 3.18.');
   return StraightArgsReader;
});