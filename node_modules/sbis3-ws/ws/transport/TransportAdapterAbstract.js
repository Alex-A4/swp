define('Transport/TransportAdapterAbstract', [
   'Deprecated/TransportAdapterAbstract',
   'Core/deprecated'
], function(TransportAdapterAbstract, deprecated) {
   deprecated.showInfoLog('Transport/TransportAdapterAbstract помечен как deprecated и будет удален в 3.18.');
   return TransportAdapterAbstract;
});