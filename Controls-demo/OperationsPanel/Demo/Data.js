define('Controls-demo/OperationsPanel/Demo/Data', function() {
   var
      data = {
         employees: [{
            id: 1,
            'Раздел': null,
            'Раздел@': null,
            name: 'Новиков Дмитрий',
            photo: 'data:image/png;base64,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',
            position: 'Директор департамента разработки',
            phone: '2300',
            likes: 9,
            department: null,
            count: null
         }, {
            id: 2,
            'Раздел': null,
            'Раздел@': true,
            name: 'Голованов К.А.',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'Платформа',
            count: 71
         }, {
            id: 3,
            'Раздел': 5,
            'Раздел@': null,
            name: 'Батурина Наталия',
            photo: 'data:image/png;base64,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',
            position: 'Ведущий проектировщик пользовательских интерфейсов (3 категории)',
            phone: '1018',
            likes: 2,
            department: null,
            count: null
         }, {
            id: 4,
            'Раздел': 5,
            'Раздел@': null,
            name: 'Лосикова Ольга',
            photo: 'data:image/png;base64,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',
            position: 'Проектировщик пользовательских интерфейсов (2+ категории)',
            phone: '2514',
            likes: 2,
            department: null,
            count: null
         }, {
            id: 5,
            'Раздел': null,
            'Раздел@': true,
            name: 'Батурина Н.А.',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'Стандарты интерфейса',
            count: 2
         }, {
            id: 6,
            'Раздел': null,
            'Раздел@': true,
            name: 'Макаров С.А.',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'Предприятие',
            count: 39
         }, {
            id: 7,
            'Раздел': null,
            'Раздел@': true,
            name: 'Гареева Д.А.',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'Управленческий и налоговый учет',
            count: 6
         }, {
            id: 8,
            'Раздел': null,
            'Раздел@': true,
            name: 'Зафиевский Д.А.',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'Документооборот и УЦ',
            count: 71
         }, {
            id: 9,
            'Раздел': null,
            'Раздел@': true,
            name: 'Семилетов Д.А.',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'Отчетность',
            count: 83
         }, {
            id: 10,
            'Раздел': null,
            'Раздел@': true,
            name: 'Уваров С.В.',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'Торговля и склад, EDI и маркет',
            count: 32
         }, {
            id: 11,
            'Раздел': null,
            'Раздел@': true,
            name: 'Волков Д.Н.',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'Управление проектами и рабочим временем',
            count: 34
         }, {
            id: 12,
            'Раздел': null,
            'Раздел@': true,
            name: 'Исаков С.В.',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'Контрагенты и торговые площадки',
            count: 29
         }, {
            id: 13,
            'Раздел': null,
            'Раздел@': true,
            name: 'Боровиков К.С.',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'sbis.Communication',
            count: 39
         }, {
            id: 14,
            'Раздел': 2,
            'Раздел@': null,
            name: 'Голованов Константин',
            photo: 'data:image/png;base64,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',
            position: 'Руководитель сектора (2 категории)',
            phone: '2352',
            likes: 7,
            department: null,
            count: null
         }, {
            id: 15,
            'Раздел': 2,
            'Раздел@': true,
            name: 'Бегунов А.В.',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'Интерфейсный фреймворк',
            count: 25
         }, {
            id: 16,
            'Раздел': 2,
            'Раздел@': true,
            name: 'Фадин Д.Э.',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'Middleware службы',
            count: 4
         }, {
            id: 17,
            'Раздел': 2,
            'Раздел@': true,
            name: 'Бойцов Е.А.',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'Сервисный фреймворк',
            count: 11
         }, {
            id: 18,
            'Раздел': 2,
            'Раздел@': true,
            name: 'Бегунов А.В.',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'Окружение разработки',
            count: 8
         }, {
            id: 19,
            'Раздел': 2,
            'Раздел@': true,
            name: '',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'Инфраструктура пользователей',
            count: 11
         }, {
            id: 20,
            'Раздел': 2,
            'Раздел@': true,
            name: 'Терентьев А.А.',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'Управление облаком',
            count: 13
         }, {
            id: 21,
            'Раздел': 15,
            'Раздел@': null,
            name: 'Бегунов Андрей',
            photo: 'data:image/png;base64,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',
            position: 'Руководитель направления (2+ категории)',
            phone: '2471',
            likes: 5,
            department: null,
            count: null
         }, {
            id: 22,
            'Раздел': 15,
            'Раздел@': true,
            name: 'Крайнов Д.О.',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'Web компоненты',
            count: 13
         }, {
            id: 23,
            'Раздел': 15,
            'Раздел@': true,
            name: 'Мальцев А.А.',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'Система типов',
            count: 5
         }, {
            id: 24,
            'Раздел': 15,
            'Раздел@': true,
            name: 'Зуев Д.В.',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'Инфраструктура представления',
            count: 6
         }, {
            id: 25,
            'Раздел': 22,
            'Раздел@': null,
            name: 'Крайнов Дмитрий',
            photo: 'data:image/png;base64,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',
            position: 'Ведущий Инженер-программист (2 категории)',
            phone: '3419',
            likes: 3,
            department: null,
            count: null
         }, {
            id: 26,
            'Раздел': 22,
            'Раздел@': true,
            name: 'Уваров И.С.',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'Внедрение VDOM',
            count: 3
         }, {
            id: 27,
            'Раздел': 22,
            'Раздел@': true,
            name: 'Авраменко А.С.',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'Компоненты фреймворка',
            count: 4
         }, {
            id: 28,
            'Раздел': 22,
            'Раздел@': true,
            name: 'Герасимов А.М.',
            photo: null,
            position: null,
            phone: null,
            likes: null,
            department: 'Базовые аспекты',
            count: 5
         }],
         panelItems: [{
            id: 'save',
            '@parent': true,
            icon: 'icon-Save',
            title: 'Выгрузить',
            parent: null
         }, {
            id: 'PDF',
            '@parent': false,
            title: 'PDF',
            parent: 'save'
         }, {
            id: 'Excel',
            '@parent': false,
            title: 'Excel',
            parent: 'save'
         }, {
            id: 'print',
            '@parent': false,
            icon: 'icon-Print',
            title: 'Распечатать',
            parent: null
         }, {
            id: 'plainList',
            '@parent': false,
            icon: 'icon-ListView',
            title: 'Развернуть без подразделений',
            parent: null
         }, {
            id: 'sum',
            '@parent': false,
            icon: 'icon-Sum',
            title: 'Суммировать',
            parent: null
         }],
         removeOperation: {
            id: 'remove',
            icon: 'icon-Erase icon-error',
            '@parent': false,
            title: 'Удалить',
            parent: null
         },
         moveOperation: {
            id: 'move',
            icon: 'icon-Move',
            '@parent': false,
            title: 'Перенести',
            parent: null
         },
         itemActions: [{
            id: 'remove',
            icon: 'icon-Erase icon-error',
            showType: 2
         }, {
            id: 'moveUp',
            icon: 'icon-ArrowUp icon-primary',
            showType: 2
         }, {
            id: 'moveDown',
            icon: 'icon-ArrowDown icon-primary',
            showType: 2
         }]
      };
   return data;
});
