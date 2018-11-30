define('Transport/TransportAdapterRPCJSON', [
   'Deprecated/TransportAdapterRPCJSON',
   'Core/deprecated'
], function(TransportAdapterRPCJSON, deprecated) {
   deprecated.showInfoLog('Transport/TransportAdapterRPCJSON помечен как deprecated и будет удален в 3.18.');
   return TransportAdapterRPCJSON;
});