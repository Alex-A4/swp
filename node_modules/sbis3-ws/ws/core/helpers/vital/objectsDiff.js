define('Core/helpers/vital/objectsDiff', [], function() {
    /**
     * Модуль, в котором описана функция <b>objectsDiff(obj1, obj2)</b>, которая проверяет изменения между двумя наборами данных.
     *
     * <h2>Параметры функции</h2>
     * <ul>
     *   <li><b>obj1</b> {Object}.</li>
     *   <li><b>obj2</b> {Object}.</li>
     * </ul>
     *
     * <h2>Возвращает</h2>
     * Массив изменений {Array}.
     *
     * <h2>Пример использования</h2>
     * <pre>
     *    require(['Core/helpers/vital/objectsDiff'], function(objectsDiff) {
     *       console.log(objectsDiff(
     *          [{foo: 'bar'}],
     *          [{foo: 'baz'}]
     *       ));
     *    });
     * </pre>
     * @class Core/helpers/vital/objectsDiff
     * @author Мальцев А.А.
     */
   //todo: Используется в Deprecated/RecordSet
   return function objectsDiff(object1, object2) {
      var VALUE_CREATED = 'created',
         VALUE_UPDATED = 'updated',
         VALUE_DELETED = 'deleted',
         VALUE_UNCHANGED = 'unchanged',
         VALUE_MOVED = 'moved',
         cloneObj1 = JSON.parse(JSON.stringify(object1)),
         cloneObj2 = JSON.parse(JSON.stringify(object2));

      function compareValues(value1, value2) {
         if (value1 === value2) {
            return VALUE_UNCHANGED;
         }
         if (value1 !== value2 && 'undefined' !== typeof(value1) && 'undefined' !== typeof(value2)) {
            return VALUE_UPDATED;
         }
         if ('undefined' == typeof(value1)) {
            return VALUE_CREATED;
         }
         if ('undefined' == typeof(value2)) {
            return VALUE_DELETED;
         }

         return VALUE_UPDATED;
      }
      function isFunction(obj) {
         return {}.toString.apply(obj) === '[object Function]';
      }
      function isArray(obj) {
         return {}.toString.apply(obj) === '[object Array]';
      }
      function isObject(obj) {
         return {}.toString.apply(obj) === '[object Object]';
      }
      function isValue(obj) {
         return !isObject(obj) && !isArray(obj);
      }
      function push(arr, index, id, data) {
         for (var i = arr.length; i > index; i--) {
            arr[i] = JSON.parse(JSON.stringify(arr[i - 1]));
         }
         arr[index] = {};
         arr[index][id] = data;
      }
      function findInArr(obj, id) {
         for (var i in obj) {
            if (Object.keys(obj[i])[0] == id) return i;
         }
         return false;
      }
      function createChanges(obj1, obj2) {
         for (var i in obj1) {
            var curKey = Object.keys(obj1[i])[0],
               newKey = obj2[i] && Object.keys(obj2[i])[0],
               isMoved = findInArr(obj2, curKey);
            if (curKey != newKey && isMoved === false) {
               push(obj2, i, curKey, obj1[i][curKey])
               obj2[i].type = VALUE_DELETED
            }
         }
         for (var i in obj2) {
            var curKey = Object.keys(obj2[i])[0],
               newKey = obj1[i] && Object.keys(obj1[i])[0],
               isMoved = findInArr(obj1, curKey);
            if (curKey != newKey && isMoved === false) {
               push(obj1, i, curKey, obj2[i][newKey])
               obj2[i].type = VALUE_CREATED
            }
            if (curKey != newKey && isMoved !== false) {
               obj2[i].type = VALUE_MOVED;
               obj2[i].fromRowNum = isMoved;
            }
         }

         return parseValues(getChanges(obj1, obj2, 0));
      }
      function getChanges(obj1, obj2, level) {
         if (isFunction(obj1) || isFunction(obj2)) {
            throw 'Invalid argument. Function given, object expected.';
         }
         if (isValue(obj1) || isValue(obj2)) {
            return {type: compareValues(obj1, obj2)};
         }
         var isChanged = false, changed = {};
         for (var key in obj2) {
            if (isFunction(obj2[key]) || (obj2[key] && obj2[key].type !== undefined)) {
               continue;
            }

            changed = getChanges(obj1[key], obj2[key], level + 1);
            if (changed.type === VALUE_UPDATED) {
               isChanged = true;
               if (level == 1) {
                  obj2.type = VALUE_UPDATED;
               }
            }
         }

         if (isChanged && level > 1) return {type: VALUE_UPDATED};
         if (level == 0) return obj2;
         return changed;
      }
      function parseValues(obj) {
         var actions = [];
         if (obj.type == VALUE_UNCHANGED) return actions;
         for (var i in obj) {
            if (!obj[i].type) continue;
            var result = {};
            result.op = obj[i].type;
            if (obj[i].fromRowNum) {
               result.fromRowNum = obj[i].fromRowNum;
            }
            result.rowNum = i;
            result.id = Object.keys(obj[i])[0];
            actions.push(result);
         }
         return actions;
      }
      return createChanges(cloneObj1, cloneObj2);
   }
});
