define('Controls-demo/Container/Scroll',
   [
      'Core/Control',
      'WS.Data/Source/Memory',
      'Controls/Container/Scroll/Context',
      'wml!Controls-demo/Container/Scroll',
      'css!Controls-demo/Container/Scroll'
   ],
   function(Control, MemorySource, ScrollData, template) {
      return Control.extend({
         _template: template,
         _pagingVisible: true,
         _scrollbarVisible: true,
         _shadowVisible: true,
         _numberOfRecords: 50,
         _selectedStyle: 'normal',
         _scrollStyleSource: null,

         _beforeMount: function() {
            this._scrollStyleSource = new MemorySource({
               idProperty: 'title',
               data: [{
                  title: 'normal'
               }, {
                  title: 'inverted'
               }]
            });
         },

         _getChildContext: function() {
            return {
               ScrollData: new ScrollData({
                  pagingVisible: this._pagingVisible
               })
            };
         }
      });
   }
);