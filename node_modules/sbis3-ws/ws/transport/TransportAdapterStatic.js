define('Transport/TransportAdapterStatic', [
   'Deprecated/TransportAdapterStatic',
   'Core/deprecated'
], function(TransportAdapterStatic, deprecated) {
   deprecated.showInfoLog('Transport/TransportAdapterStatic помечен как deprecated и будет удален в 3.18.');
   return TransportAdapterStatic;
});