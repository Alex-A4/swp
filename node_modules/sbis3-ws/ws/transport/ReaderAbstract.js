define('Transport/ReaderAbstract', [
   'Deprecated/ReaderAbstract',
   'Core/deprecated'
], function(ReaderAbstract, deprecated) {
   deprecated.showInfoLog('Transport/ReaderAbstract помечен как deprecated и будет удален в 3.18.');
   return ReaderAbstract;
});