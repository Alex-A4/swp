define('Transport/JSONLoader', [
   'Deprecated/JSONLoader',
   'Core/deprecated'
], function(JSONLoader, deprecated) {
   deprecated.showInfoLog('Transport/JSONLoader помечен как deprecated и будет удален в 3.18.');
   return JSONLoader;
});