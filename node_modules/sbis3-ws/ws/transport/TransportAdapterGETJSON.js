define('Transport/TransportAdapterGETJSON', [
   'Deprecated/TransportAdapterGETJSON',
   'Core/deprecated'
], function(TransportAdapterGETJSON, deprecated) {
   deprecated.showInfoLog('Transport/TransportAdapterGETJSON помечен как deprecated и будет удален в 3.18.');
   return TransportAdapterGETJSON;
});