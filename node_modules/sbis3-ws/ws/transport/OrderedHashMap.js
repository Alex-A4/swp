define('Transport/OrderedHashMap', [
   'Deprecated/OrderedHashMap',
   'Core/deprecated'
], function(OrderedHashMap, deprecated) {
   deprecated.showInfoLog('Transport/OrderedHashMap помечен как deprecated и будет удален в 3.18.');
   return OrderedHashMap;
});