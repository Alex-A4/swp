define('Transport/RecordSetStatic', [
   'Deprecated/RecordSetStatic',
   'Core/deprecated'
], function(RecordSetStatic, deprecated) {
   deprecated.showInfoLog('Transport/RecordSetStatic помечен как deprecated и будет удален в 3.18.');
   return RecordSetStatic;
});