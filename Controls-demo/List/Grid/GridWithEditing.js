define('Controls-demo/List/Grid/GridWithEditing', [
   'Core/Control',
   'Controls-demo/List/Grid/GridWithEditingData',
   'wml!Controls-demo/List/Grid/GridWithEditing',
   'WS.Data/Source/Memory',
   'wml!Controls-demo/List/Tree/treeEditingTemplate',
   'wml!Controls-demo/List/Grid/DemoItem',
   'wml!Controls-demo/List/Grid/DemoBalancePrice',
   'wml!Controls-demo/List/Grid/DemoCostPrice',
   'wml!Controls-demo/List/Grid/DemoHeaderCostPrice',

   'wml!Controls-demo/List/Grid/DemoTasksPhoto',
   'wml!Controls-demo/List/Grid/DemoTasksDescr',
   'wml!Controls-demo/List/Grid/DemoTasksReceived',
   'Controls/Render/Money/Money',
   'css!Controls-demo/List/Grid/Grid',
   'Controls/Container/Scroll',
   'Controls/Grid',
   'Controls/Render/Money/Money'
], function(BaseControl, GridData, template, MemorySource) {
   'use strict';
   var ModuleClass = BaseControl.extend({
      _template: template,
      _itemActions: null,
      _viewSource: null,
      gridData: null,
      gridColumns: null,
      gridHeader: null,
      tasksColumns: null,
      showType: null,

      _beforeMount: function() {
         this.showType = {

            // show only in Menu
            MENU: 0,

            // show in Menu and Toolbar
            MENU_TOOLBAR: 1,

            // show only in Toolbar
            TOOLBAR: 2
         };
         this._itemActions = [
            {
               id: 5,
               title: 'прочитано',
               showType: this.showType.TOOLBAR,
               handler: function() {
                  console.log('action read Click');
               }
            },
            {
               id: 1,
               icon: 'icon-primary icon-PhoneNull',
               title: 'phone',
               handler: function(item) {
                  console.log('action phone Click ', item);
               }
            },
            {
               id: 2,
               icon: 'icon-primary icon-EmptyMessage',
               title: 'message',
               handler: function() {
                  alert('Message Click');
               }
            },
            {
               id: 3,
               icon: 'icon-primary icon-Profile',
               title: 'profile',
               showType: this.showType.MENU_TOOLBAR,
               handler: function() {
                  console.log('action profile Click');
               }
            },
            {
               id: 4,
               icon: 'icon-Erase icon-error',
               title: 'delete pls',
               showType: this.showType.TOOLBAR,
               handler: function() {
                  console.log('action delete Click');
               }
            }
         ];
         this._viewSource = new MemorySource({
            idProperty: 'id',
            data: GridData.catalog
         });
         this.gridData = GridData;
         this.gridColumns = [
            {
               displayProperty: 'name',
               width: '1fr',
               template: 'wml!Controls-demo/List/Tree/treeEditingTemplate'
            },
            {
               displayProperty: 'price',
               width: 'auto',
               align: 'right',
               template: 'wml!Controls-demo/List/Grid/DemoCostPrice'
            },
            {
               displayProperty: 'balance',
               width: 'auto',
               align: 'right',
               template: 'wml!Controls-demo/List/Grid/DemoBalancePrice'
            },
            {
               displayProperty: 'description',
               width: '1fr',
               align: 'right',
               template: 'wml!Controls-demo/List/Tree/treeEditingTemplate'
            },
            {
               displayProperty: 'costPrice',
               width: 'auto',
               align: 'right',
               template: 'wml!Controls-demo/List/Grid/DemoCostPrice'
            },
            {
               displayProperty: 'balanceCostSumm',
               width: 'auto',
               align: 'right',
               template: 'wml!Controls-demo/List/Grid/DemoCostPrice'
            }
         ];
         this.gridHeader = [
            {
               title: ''
            },
            {
               title: 'Цена',
               align: 'right'
            },
            {
               title: 'Остаток',
               align: 'right'
            },
            {
               title: 'Описание',
               align: 'right'
            },
            {
               title: 'Себест.',
               align: 'right',
               template: 'wml!Controls-demo/List/Grid/DemoHeaderCostPrice'
            },
            {
               title: 'Сумма остатка',
               align: 'right'
            }
         ];
         this.tasksColumns = [
            {
               template: 'wml!Controls-demo/List/Grid/DemoTasksPhoto',
               width: 'auto'
            },
            {
               template: 'wml!Controls-demo/List/Grid/DemoTasksDescr',
               width: '1fr'
            },
            {
               template: 'wml!Controls-demo/List/Grid/DemoTasksReceived',
               width: 'auto'
            }
         ];
      },
      _showAction: function(action, item) {
         if (item.get('id') === '471329') {
            if (action.id === 2 || action.id === 3) {
               return false;
            }
            return true;
         }
         if (action.id === 5) {
            return false;
         }
         if (item.get('id') === '448390') {
            return false;
         }

         return true;
      },
      _onActionClick: function(event, action, item) {
         console.log(arguments);
      }
   });

   return ModuleClass;
});
