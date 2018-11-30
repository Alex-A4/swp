define('Transport/RecordTypes', [
   'Deprecated/RecordTypes',
   'Core/deprecated'
], function(RecordTypes, deprecated) {
   deprecated.showInfoLog('Transport/RecordTypes помечен как deprecated и будет удален в 3.18.');
   return RecordTypes;
});