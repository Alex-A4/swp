define('Transport/ParserAbstract', [
   'Deprecated/ParserAbstract',
   'Core/deprecated'
], function(ParserAbstract, deprecated) {
   deprecated.showInfoLog('Transport/ParserAbstract помечен как deprecated и будет удален в 3.18.');
   return ParserAbstract;
});