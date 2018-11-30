define('ControlsSandbox/VDomCalendarListVirtualScroll', [
   'Core/core-extend',
   'Core/Control',
   'tmpl!ControlsSandbox/VDomCalendarListVirtualScroll',
   'WS.Data/Source/Memory',
   'Controls/Calendar/Utils',
   'wml!Controls/Calendar/MonthTableBody'
], function(extend,
   BaseControl,
   template,
   MemorySource,
   calendarUtils) {
   
   'use strict';
   
   var VDomListViewVirtualScroll = BaseControl.extend(
      {
         _mySelIndex: 0,
         _canTop: false,
         _canBottom: true,
         _template: template,
         
         constructor: function() {
            VDomListViewVirtualScroll.superclass.constructor.apply(this, arguments);
            
            var
               srcData = [],
               date = new Date(2007, 0);
            
            for (var i = 0; i < 240; i++) {
               srcData.push({
                  id: i,
                  calendarTitle: date.strftime("%B '%y"),
                  weeksArray: calendarUtils.getWeeksArray(date.getFullYear(), date.getMonth() + 1)
               });
               
               date.setMonth(date.getMonth() + 1);
            }
            
            this._viewSource = new MemorySource({
               idProperty: 'id',
               data: srcData
            })
         },
         
         _onMoreClick: function() {
            this._children.list.__loadPage('down');
         }
      });
   
   return VDomListViewVirtualScroll;
});