define('Transport/Templates/XMLTemplate', [
   'Deprecated/Templates/XMLTemplate',
   'Core/deprecated'
], function(XMLTemplate, deprecated) {
   deprecated.showInfoLog('Transport/Templates/XMLTemplate помечен как deprecated и будет удален в 3.18. Используйте Transport/Templates/CompoundControlTemplate.');
   return XMLTemplate;
});