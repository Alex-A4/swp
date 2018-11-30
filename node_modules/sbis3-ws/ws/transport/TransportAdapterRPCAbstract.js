define('Transport/TransportAdapterRPCAbstract', [
   'Deprecated/TransportAdapterRPCAbstract',
   'Core/deprecated'
], function(TransportAdapterRPCAbstract, deprecated) {
   deprecated.showInfoLog('Transport/TransportAdapterRPCAbstract помечен как deprecated и будет удален в 3.18.');
   return TransportAdapterRPCAbstract;
});