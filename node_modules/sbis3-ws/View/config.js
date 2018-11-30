define('View/config', [
   'Core/helpers/Object/isPlainObject',
   'Core/core-instance'
], function (
   isPlainObject,
   cInstance
) {
   var config = {
      calculators: [
         {
            type: 'model_record',
            is: function isModel(ent) {
               return cInstance.instanceOfModule(ent, 'WS.Data/Entity/Model');
            },
            calculator: function modelRecordCalculator(prop, root) {
               var val = root.get(prop);
               // Чтобы можно было звать дефолтные свойства модели
               if (prop in root && !val) {
                  return root[prop];
               }
               return root.get(prop);
            }
         }
      ],

      iterators: [
         {
            type: 'recordset',
            is: function isRecordset(ent) {
               return ent && Object.prototype.toString.call(ent.each) === '[object Function]';
            },
            iterator: function recordsetIterator(recordset, callback) {
               recordset.each(callback);
            }
         },
         {
            type: 'array',
            is: function isArray(ent) {
               return ent instanceof Array;
            },
            iterator: function arrayIterator(array, callback) {
               var i, ln = array.length;
               for (i = 0; i !== ln; i++) {
                  callback(array[i], i);
               }
            }
         },
         {
            type: 'object',
            is: function isObject(ent) {
               return isPlainObject(ent);
            },
            iterator: function objectIterator(object, callback) {
               for (var key in object) {
                  if (object.hasOwnProperty(key)) {
                     callback(object[key], key);
                  }
               }
            }
         },
         {
            type: 'int',
            is: function isInt(n) { return parseInt(n) === n },
            iterator: function intIterator(number, callback) {
               for (var i = 0; i < number; i++) {
                  callback(i, i);
               }
            }
         }
      ],
      ignored: [
         'comment'
      ],
      mustBeDots: [
         'SBIS3.CONTROLS',
         'SBIS3.ENGINE'
      ],
      screen: '#_#_#',
      /**
       * Максимально возможная длинна имени модуля или подключаемого шаблона
       */
      moduleMaxNameLength: 4096
   };
   return config;
});