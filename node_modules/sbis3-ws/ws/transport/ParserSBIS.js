define('Transport/ParserSBIS', [
   'Deprecated/ParserSBIS',
   'Core/deprecated'
], function(ParserSBIS, deprecated) {
   deprecated.showInfoLog('Transport/ParserSBIS помечен как deprecated и будет удален в 3.18.');
   return ParserSBIS;
});