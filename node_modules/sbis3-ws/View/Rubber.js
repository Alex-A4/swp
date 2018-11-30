define('View/Rubber', [
   'Core/Control',
   'tmpl!View/Rubber'
], function(Control, template) {
   'use strict';
   var Editor = Control.extend({
      _controlName: 'View/Rubber',
      _template: template
   });
   return Editor;
});
