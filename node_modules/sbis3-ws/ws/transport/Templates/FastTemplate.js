define('Transport/Templates/FastTemplate',[
   'Deprecated/Templates/FastTemplate',
   'Core/deprecated'
], function(FastTemplate, deprecated) {
   deprecated.showInfoLog('Transport/Templates/FastTemplate помечен как deprecated и будет удален в 3.18. Используйте Transport/Templates/CompoundControlTemplate.');
   return FastTemplate;
});