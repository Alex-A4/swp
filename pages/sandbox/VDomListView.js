define('ControlsSandbox/VDomListView', [
   'Core/core-extend',
   'Core/Control',
   'tmpl!ControlsSandbox/VDomListView',
   'WS.Data/Source/Memory'
], function (extend,
             BaseControl,
             template,
             MemorySource
   ) {
   'use strict';

   var srcData = [
      {
         id: 1,
         title: 'Настолько длинное название папки что оно не влезет в максимальный размер',
         'par@': true,
         groupField : 1
      },
      {
         id: 2,
         title: 'Notebooks',
         'par@': true,
         groupField : 1
      },
      {
         id: 3,
         title: 'Smartphones',
         'par@': true,
         groupField : 1
      },
      {
         id: 4,
         title: 'Notebook Lenovo G505 59426068',
         flag: true,
         img: 'img/4.png',
         par: 9,
         'par@': false,
         price: '11 490',
         count: 2,
         groupField : 1
      },
      {
         id: 5,
         title: 'Notebook Packard Bell EasyNote TE69HW-29572G32',
         flag: true,
         img: 'img/5.png',
         par: 1,
         'par@': false,
         price: '15 990',
         count: 12,
         groupField : 2
      },
      {
         id: 6,
         title: 'Notebook ASUS X550LC-XO228H',
         flag: true,
         img: 'img/6.png',
         par: 10,
         'par@': false,
         price: '19 990',
         count: 22,
         groupField : 2
      },
      {
         id: 7,
         title: 'Notebook Lenovo IdeaPad G5030 (80G0001FRK)',
         flag: true,
         img: 'img/7.png',
         price: '22 590',
         par: 9,
         'par@': false,
         count: 13,
         groupField : 2
      },
      {
         id: 8,
         title: 'Notebook Lenovo G505 59426068',
         flag: true,
         img: 'img/8.png',
         price: '25 100',
         par: 9,
         'par@': false,
         count: 5,
         groupField : 2
      },
      {
         id: 9,
         title: 'Lenovo',
         par: 1,
         'par@': true,
         groupField : 3
      },
      { id: 10, title: 'Lenovo1', par: 1, 'par@': true, groupField : 3 },
      { id: 11, title: 'Lenovo2', par: 1, 'par@': true, groupField : 3 },
      { id: 12, title: 'Lenovo3', par: 1, 'par@': true, groupField : 3 },
      { id: 13, title: 'Lenovo4', par: 1, 'par@': true, groupField : 3 },
      { id: 14, title: 'Lenovo5', par: 1, 'par@': true, groupField : 3 },
      { id: 15, title: 'Lenovo6', par: 1, 'par@': true, groupField : 3 },
      { id: 16, title: 'Lenovo7', par: 1, 'par@': true, groupField : 3 },
      { id: 17, title: 'Lenovo8', par: 1, 'par@': true, groupField : 3 },
      { id: 18, title: 'Lenovo9', par: 1, 'par@': true, groupField : 3 },
      { id: 19, title: 'Lenovo10', par: 1, 'par@': true, groupField : 3 },
      { id: 20, title: 'Lenovo11', par: 1, 'par@': true, groupField : 3 },
      { id: 21, title: 'Lenovo12', par: 1, 'par@': true, groupField : 3 },
      { id: 22, title: 'Lenovo13', par: 1, 'par@': true, groupField : 3 },
      { id: 23, title: 'Lenovo14', par: 1, 'par@': true, groupField : 3 },
      { id: 24, title: 'Lenovo15', par: 1, 'par@': true, groupField : 3 },
      { id: 25, title: 'Lenovo16', par: 1, 'par@': true, groupField : 3 },
      { id: 26, title: 'Lenovo17', par: 1, 'par@': true, groupField : 3 },
      { id: 27, title: 'Lenovo18', par: 1, 'par@': true, groupField : 3 },
      { id: 28, title: 'Lenovo19', par: 1, 'par@': true, groupField : 3 },
      { id: 29, title: 'Lenovo20', par: 1, 'par@': true, groupField : 3 },
      { id: 30, title: 'Lenovo21', par: 1, 'par@': true, groupField : 3 },
      { id: 31, title: 'Lenovo22', par: 1, 'par@': true, groupField : 3 },
      { id: 32, title: 'Lenovo23', par: 1, 'par@': true, groupField : 3 },
      { id: 33, title: 'Lenovo24', par: 1, 'par@': true, groupField : 3 },
      { id: 34, title: 'Lenovo25', par: 1, 'par@': true, groupField : 3 },
      { id: 35, title: 'Lenovo26', par: 1, 'par@': true, groupField : 3 },
      { id: 36, title: 'Lenovo27', par: 1, 'par@': true, groupField : 3 }
   ];

   var VDomListView = BaseControl.extend(
      {
         _mySelIndex: 0,
         _canTop: false,
         _canBottom: true,
         _template: template,

         constructor: function() {
            VDomListView.superclass.constructor.apply(this, arguments);
            this._viewSource = new MemorySource({
               idProperty: 'id',
               data: srcData
            });
         }
      });
   return VDomListView;
});