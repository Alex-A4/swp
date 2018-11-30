define('Controls/Container/MasterList', [
   'Core/Control',
   'wml!Controls/Container/MasterList/MasterList'
], function(Control, template) {
   return Control.extend({
      _template: template,
      _markedKeyChangedHandler: function(event, key) {
         this._notify('selectedMasterValueChanged', [key], {bubbling: true});
      }
   });
});
