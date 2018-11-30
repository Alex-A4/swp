define('Controls-demo/List/Tree/TreeWithPhoto', [
   'Core/Control',
   'wml!Controls-demo/List/Tree/TreeWithPhoto',
   'Controls-demo/List/Tree/TreeMemory',
   'css!Controls-demo/List/Tree/TreeWithPhoto',
   'css!Controls-demo/List/data/images',
   'wml!Controls-demo/List/Tree/TreeWithPhoto-content',
   'wml!Controls-demo/List/Tree/TreeWithPhoto-item16',
   'wml!Controls-demo/List/Tree/TreeWithPhoto-item24',
   'wml!Controls-demo/List/Tree/TreeWithPhoto-item32',
   'wml!Controls-demo/List/Tree/TreeWithPhoto-item40',
   'wml!Controls-demo/List/Tree/TreeWithPhoto-itemTwoLevels',
   'wml!Controls-demo/List/Tree/TreeWithPhoto-contentTwoLevels',
   'Controls/TreeGrid'
], function(BaseControl, template, MemorySource) {
   'use strict';
   var
      ModuleClass = BaseControl.extend({
         _template: template,
         _viewSource: null,
         _viewSourceTwoLevels: null,
         _viewColumns: null,
         _viewColumnsTwoLevels: null,
         _beforeMount: function() {
            this._viewSource = new MemorySource({
               idProperty: 'id',
               data: [
                  {
                     id: 1, title: 'Node', 'Раздел': null, 'Раздел@': true, 'Раздел$': null, photo: ''
                  },
                  {
                     id: 11, title: 'Node', 'Раздел': 1, 'Раздел@': true, 'Раздел$': null, photo: ''
                  },
                  {
                     id: 111, title: 'Leaf', 'Раздел': 11, 'Раздел@': null, 'Раздел$': null, photo: 'Krainov'
                  },
                  {
                     id: 12, title: 'Leaf', 'Раздел': 1, 'Раздел@': null, 'Раздел$': null, photo: 'Korbyt'
                  },
                  {
                     id: 13, title: 'Hidden node', 'Раздел': 1, 'Раздел@': false, 'Раздел$': true, photo: 'Dogadkin'
                  },
                  {
                     id: 2, title: 'Empty node', 'Раздел': null, 'Раздел@': true, 'Раздел$': null, photo: ''
                  },
                  {
                     id: 3, title: 'Hidden node', 'Раздел': null, 'Раздел@': false, 'Раздел$': true, photo: 'Krainov'
                  },
                  {
                     id: 31, title: 'Leaf', 'Раздел': 3, 'Раздел@': null, 'Раздел$': null, photo: 'Korbyt'
                  },
                  {
                     id: 4, title: 'Empty hidden', 'Раздел': null, 'Раздел@': false, 'Раздел$': false, photo: 'Dogadkin'
                  },
                  {
                     id: 5, title: 'Leaf', 'Раздел': null, 'Раздел@': null, 'Раздел$': null, photo: 'Korbyt'
                  }
               ]
            });
            this._viewSourceTwoLevels = new MemorySource({
               idProperty: 'id',
               data: [
                  {
                     id: 1, title: 'Крайнов Дмитрий', 'Раздел': null, 'Раздел@': true, photo: 'Krainov'
                  },
                  {
                     id: 2, title: 'Корбут Антон', 'Раздел': null, 'Раздел@': true, photo: 'Korbyt'
                  },
                  {
                     id: 3, title: 'Догадкин Владимир', 'Раздел': null, 'Раздел@': true, photo: 'Dogadkin'
                  },
                  {
                     id: 11, title: 'Шеврон платформенно появляется с отступом от самого длинного поля', 'Раздел': 1, 'Раздел@': null, photo: null
                  },
                  {
                     id: 12, title: 'Разработать макет блока для реестров (наподобии информационого)', 'Раздел': 1, 'Раздел@': null, photo: null
                  },
                  {
                     id: 13, title: 'Стандартизовать выезжающую панель бв такмо виде как на скринах', 'Раздел': 1, 'Раздел@': null, photo: null
                  },
                  {
                     id: 21, title: 'Шапка этой панекли всё ещё не соотвествует стандарту: высота нестандартная', 'Раздел': 2, 'Раздел@': null, photo: null
                  },
                  {
                     id: 22, title: 'Необходимо, при наличии панели действий, предоставить возможность выводить чекбоксы', 'Раздел': 2, 'Раздел@': null, photo: null
                  },
                  {
                     id: 23, title: 'В окне большой корзины смещена базовая линия у колонки "сумма"', 'Раздел': 3, 'Раздел@': null, photo: null
                  },
                  {
                     id: 31, title: 'Необходимо заполнять ссылки для декорированрия дефолтными плашками', 'Раздел': 3, 'Раздел@': null, photo: null
                  },
                  {
                     id: 32, title: 'Необходимо событие при ошибке записи данных в редактировании по месту', 'Раздел': 3, 'Раздел@': null, photo: null
                  }
               ]
            });
            this._viewColumns = [
               {
                  displayProperty: 'title',
                  width: '1fr',
                  template: 'wml!Controls-demo/List/Tree/TreeWithPhoto-content'
               }
            ];
            this._viewColumnsTwoLevels = [
               {
                  displayProperty: 'title',
                  width: '1fr',
                  template: 'wml!Controls-demo/List/Tree/TreeWithPhoto-contentTwoLevels'
               }
            ];
         },
      });

   return ModuleClass;
});
