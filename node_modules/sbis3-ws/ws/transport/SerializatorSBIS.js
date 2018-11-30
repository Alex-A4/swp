define('Transport/SerializatorSBIS', [
   'Deprecated/SerializatorSBIS',
   'Core/deprecated'
], function(SerializatorSBIS, deprecated) {
   deprecated.showInfoLog('Transport/SerializatorSBIS помечен как deprecated и будет удален в 3.18.');
   return SerializatorSBIS;
});