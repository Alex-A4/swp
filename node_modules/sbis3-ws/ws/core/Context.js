define('Core/Context', [
   'Core/core-extend',
   'Core/Abstract',
   'Core/helpers/Object/isPlainObject',
   'Core/helpers/Object/find',
   'Core/helpers/Array/findIndex',
   'Core/helpers/Function/shallowClone',
   'Core/core-instance',
   'Core/core-debug',
   'Core/IoC'
], function(
   extend,
   Abstract,
   isPlainObject,
   objectFind,
   arrayFindIndex,
   shallowClone,
   cInstance,
   cDebug,
   IoC
) {

      function unique(arr) {
         if (!Array.isArray(arr)) {
            throw new TypeError('array-unique expects an array.');
         }

         var len = arr.length;
         var i = -1;

         while (i++ < len) {
            var j = i + 1;

            for (; j < arr.length; ++j) {
               if (arr[i] === arr[j]) {
                  arr.splice(j--, 1);
               }
            }
         }
         return arr;
      }

      var
         Context,
         FindIntent = {
            SET: 'FindIntent.SET',
            GET: 'FindIntent.GET',
            REMOVE: 'FindIntent.REMOVE'
         },
         RestrictFlags = {
            NONE: 0,
            GET: 1,
            SET: 2,
            GETSET: 3,
            UNDEFINEDS_AS_EXISTENT: 4
         },

         constant = function (value) {
             return function () {
                 return value;
             };
         },
         STRUCTURE_SEPARATOR = '/',
         LINK_SEPARATOR = '.',

         notImplemented = function() {
            throw new Error(rk('Метод не должен вызываться'));
         },
         NonExistentValue = function() {},
         UndefinedFieldType = {
            is: notImplemented,

            get: constant(NonExistentValue),

            set: function(oldValue, keyPath, value) {
               //если значения в структуре нет, то структура будет создана автоматически
               return keyPath.length === 0 ? value : SimpleFieldType.set({}, keyPath, value);
            },

            remove: notImplemented,

            setWillChange: constant(true),

            toJSON: notImplemented
         },
         SimpleFieldType = {
            name: 'SimpleFieldType',

            is: constant(true),

            equals: function(v1, v2) {
               return (v1 === v2) || (v1 && v2 && typeof(v1.equals) === 'function' && v1.equals(v2));
            },

            get: function(value, keyPath) {
               var result, subValue, subType;

               if (keyPath.length === 0) {
                  result = value;
               } else if (value === null || typeof(value) !== 'object' || !(keyPath[0] in value)) {
                  result = NonExistentValue;
               } else {
                  subValue = value[keyPath[0]];
                  subType = Context.getValueType(subValue);
                  result = subType.get(subValue, keyPath.slice(1));
               }

               return result;
            },

            setWillChange: function(oldValue, keyPath, value) {
               var result, subValue, subType, key;

               if (keyPath.length === 0) {
                  result = !SimpleFieldType.equals(oldValue, value);
               } else if (oldValue === NonExistentValue) {
                  result = true;//если значения в структуре нет, то структура будет создана автоматически
               } else if (oldValue === null || typeof(oldValue) !== 'object') {
                  result = false;
               } else {
                  key = keyPath[0];
                  result = !(key in oldValue);
                  if (!result) {
                     subValue = oldValue[key];
                     subType = Context.getValueType(subValue);
                     result = subType.setWillChange(subValue, keyPath.slice(1), value);
                  }
               }

               return result;
            },

            set: function(oldValue, keyPath, value) {
               var subValue, newSubValue, subType, key, result,
                  isEqual, equals = SimpleFieldType.equals;

               if (keyPath.length === 0) {
                  result = value;
               } else if (oldValue === NonExistentValue) {
                  //если значения в структуре нет, то структура будет создана автоматически
                  result = SimpleFieldType.set({}, keyPath, value);
               } else if (oldValue !== null && typeof(oldValue) === 'object') {
                  key = keyPath[0];
                  subValue = oldValue.hasOwnProperty(key) ? oldValue[key] : NonExistentValue;

                  if (keyPath.length === 1) {
                     isEqual = key in oldValue && equals(subValue, value);
                     if (isEqual) {
                        result = oldValue;
                     } else {
                        subType = Context.getValueType(subValue);
                        newSubValue = subType.set(subValue, [], value);
                        if (equals(subValue, newSubValue)) {
                           result = oldValue;
                        } else {
                           result = shallowClone(oldValue);
                           result[key] = newSubValue;
                        }
                     }
                  } else {
                     subType = Context.getValueType(subValue);
                     newSubValue = subType.set(subValue, keyPath.slice(1), value);
                     if (subValue === newSubValue) {
                        result = oldValue;
                     } else {
                        result = SimpleFieldType.set(oldValue, [key], newSubValue);
                     }
                  }
               } else {
                  result = oldValue;
               }

               return result;
            },

            remove: function(value, keyPath) {
               var
                  subValue, subType, changed, key, newValue, res, idx,
                  equals = SimpleFieldType.equals;

               changed = keyPath.length !== 0;
               if (changed) {
                  key = keyPath[0];
                  changed = value !== null && typeof(value) === 'object' && key in value;
                  if (changed) {
                     if (keyPath.length === 1) {
                        if (Array.isArray(value)) {
                           newValue = value.slice(0);
                           idx = parseInt(key, 10);
                           if (idx == key) {//строка-индекс вроде "1", "2"...
                              newValue.splice(idx, 1);
                           } else {
                              delete newValue[key];
                           }
                        } else {
                           subValue = value[key];
                           subType = Context.getValueType(subValue);
                           res = subType.remove(subValue, []);

                           if (subType.isProxy) {
                              changed = res.changed;
                              newValue = value;
                           } else {
                              changed = true;
                              newValue = shallowClone(value);
                              delete newValue[key];
                           }
                        }
                     } else {
                        subValue = value[key];
                        subType = Context.getValueType(subValue);
                        res = subType.remove(subValue, keyPath.slice(1));
                        changed = res.changed;
                        if (changed) {
                           if (subType.isProxy || equals(res.value, subValue)) {
                              newValue = value;
                           } else {
                              newValue = shallowClone(value);
                              newValue[key] = res.value;
                           }
                        }
                     }
                  }
               }

               return {
                  value: changed ? newValue : value,
                  changed: changed
               };
            },

            toJSON: function(value, deep) {
               var useToJson = deep && value !== null && typeof(value) === 'object' && typeof(value['toJSON']) === 'function';

               return useToJson ? value.toJSON() : value;
            }
         },
         AllFieldTypes = [SimpleFieldType];

      /**
       * Объект контекста.
       * Содержит в себе ВСЕ данные контекста и умеет отличать, какие лежат в рекорде, а какие нет.
       * При изменении данных рекорд актуализируется.
       * Умеет отдавать рекорд целиком.
       *
       * ContextObject
       */
      var ContextObject = extend({}, {
         $protected: {
            _options: {
               /**
                * @cfg {Deprecated/Record | Object} Объект с начальными данными. Может быть рекордом.
                */
               objectData: null
            },
            _isEmpty: true,
            _contextObject: {}
         },
         $constructor: function() {
            this._contextObject = {};
            if (this._options.objectData) {
               var data = this._options.objectData;

               if (!isPlainObject(data)) {
                  throw new Error(rk('Опция objectData должна быть простым объектом с ключами и значениями'));
               }
               //перелопачиваем объект переданный в конфигурации в свой формат
               for (var key in data) {
                  if (data.hasOwnProperty(key)) {
                     var
                        value = data[key],
                        type = this._getValueType(value);
                     this._contextObject[key] = this._createTypedValue(value, type);
                     this._isEmpty = false;
                  }
               }
            }
         },

         /**
          * @param value
          * @return {number}
          * @private
          */
         _getValueType: function(value) {
            return Context.getValueType(value);
         },

         /**
          * @param qname
          * @return {number}
          */
         getFieldType: function(qname) {
            var
               data = this._contextObject,
               hasKey = qname in data;
            return hasKey ? data[qname].type : UndefinedFieldType;
         },

         _getFieldValue: function(qname) {
            var
               data = this._contextObject,
               hasKey = qname in data;

            return hasKey ? data[qname].value : NonExistentValue;
         },

         /**
          * Проверка на пустоту
          * @return {Boolean} пуст контекст или нет.
          */
         isEmpty: function() {
            return this._isEmpty;
         },

         _createTypedValue: function(value, type) {
            return {
               value: value,
               type: type
            };
         },

         toObject: function(recursive) {
            return Object.keys(this._contextObject).reduce(function(result, key) {
               var
                  ftype = this.getFieldType(key),
                  v = this._getFieldValue(key);

               result[key] = ftype.toJSON(v, recursive);
               return result;
            }.bind(this), {});
         },

         has: function(fieldName) {
            var
               descr = this._getFieldDescr(fieldName),
               value = descr && this.get(descr.qname, descr.keyPath);

            return !!(descr && value !== NonExistentValue);
         },

         /**
          * Меняет значение поля
          * @param {String} fieldName имя поля.
          * @param value значение поля.
          */
         set: function(qname, keyPath, value) {
            var
               vtype, newValue,
               oldValue = this._getFieldValue(qname),
               ftype = this.getFieldType(qname),
               data = this._contextObject,
               changed = !(oldValue === NonExistentValue && value === undefined) ? ftype.setWillChange(oldValue, keyPath, value) : false;

            if (changed) {
               newValue = ftype.set(oldValue, keyPath, value);
               vtype = this._getValueType(newValue);
               data[qname] = this._createTypedValue(newValue, vtype);
               this._isEmpty = false;
            }

            return changed;
         },

         /**
          * Инициализирует изменения
          */
         transaction: function(fieldType) {
            if (fieldType.transaction) {
               fieldType.transaction();
            }
         },

         /**
          * Завершает изменения
          */
         commit: function(fieldType) {
            if (fieldType.commit) {
               fieldType.commit();
            }
         },

         /**
          * @param {string} name
          * @param {Boolean} [undefiniedAsExistent]
          * @param {Boolean} [createNonExistent]
          * @return {{qname: string, keyPath: Array}}
          * @private
          */
         _getFieldDescr: function(name, undefiniedAsExistent, createNonExistent) {
            var
               path = name.split(STRUCTURE_SEPARATOR),
               pathSlices = path.map(function(_, i) {
                  return path.slice(0, path.length - i);
               }),
               data = this._contextObject,
               foundSlice = objectFind(pathSlices, function(slice) {
                  var fieldName = slice[0];
                  for (var i = 1; i < slice.length; i++) {
                     fieldName += STRUCTURE_SEPARATOR + slice[i];
                  }
                  var hasValue = data.hasOwnProperty(fieldName),
                     value;
                  if (hasValue) {
                     value = data[fieldName];
                  }

                  return value !== undefined || (undefiniedAsExistent && hasValue && value === undefined);
               }),
               qname, keyPath, result;

            if (foundSlice) {
               qname = foundSlice.join(STRUCTURE_SEPARATOR);
               keyPath = path.slice(foundSlice.length);

               result = {
                  qname: qname,
                  keyPath: keyPath
               };
            } else if (createNonExistent && path.length > 0) {
               result = {
                  qname: path[0],
                  keyPath: path.slice(1)
               };
            } else {
               result = null;
            }

            return result;
         },

         /**
          * Получение значения поля
          * @param {String} fieldName имя поля.
          * @return value значение поля или undefined при его отсутствии.
          */
         get: function(qname, keyPath) {
            var
               ftype = this.getFieldType(qname),
               fvalue = this._getFieldValue(qname);

            return ftype.get(fvalue, keyPath);
         },

         getRaw: function(qname) {
            var data = this._contextObject;

            return qname in data ? data[qname].value : NonExistentValue;
         },

         removeRaw: function(qname) {
            delete this._contextObject[qname];
         },

         setRaw: function(qname, value) {
            this._contextObject[qname] = {
               value: value,
               type: this._getValueType(value)
            };
         },

         /**
          * Удаляет поле из объекта контекста.
          * @param {String} fieldName имя поля, которое необходимо удалить.
          * @return {Boolean} result результат удаления, произошло оно или нет.
          */
         remove: function(qname, keyPath) {
            var
               ftype = this.getFieldType(qname),
               data = this._contextObject,
               result = ftype !== UndefinedFieldType,
               res;

            if (result) {
               if (keyPath.length === 0) {
                  if (ftype.clear) {
                     res = ftype.clear(data[qname].value);
                     data[qname].value = res.value;

                     result = res.changed;
                  } else {
                     delete data[qname];
                  }
               } else {
                  res = ftype.remove(data[qname].value, keyPath);

                  data[qname].value = res.value;
                  result = res.changed;
               }
            }
            return result;
         }
      });

      function withGroupChangeEvent(func) {
         return function() {
            var
               eventsCnt,
               result;

            if (!this.isDestroyed()) {
               if (this._updateLockCnt === 0) {
                  this._updatedEventsCnt = 0;
               }
               this._updateLockCnt++;
               try {
                  result = func.apply(this, arguments);
               } finally {
                  this._updateLockCnt--;
                  if (this._updateLockCnt === 0) {
                     eventsCnt = this._updatedEventsCnt;
                     this._updatedEventsCnt = 0;

                     if (Array.isArray(this._changedContexts)) {
                        var changedContexts = unique(this._changedContexts);
                        this._changedContexts = [];
                        changedContexts.forEach(function(context) {
                           context._notify('onFieldsChanged');
                        });
                     }
                     if (eventsCnt > 0) {
                        this._notify('onFieldsChanged');
                     }
                  }
               }
            }
            return result;
         };
      }

      /**
       * Класс для работы с <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/component-infrastructure/databinding/'>контекстом</a> области.
       *
       * @class Core/Context
       * @extends Core/Abstract
       * @public
       */
      Context = Abstract.extend(/** @lends Core/Context.prototype */{
         /**
          * @event onFieldNameResolution Происходит при поиске поля в контексте.
          * @remark
          * Когда обработчик события в качестве результата возвращает имя другого поля, то поиск будет произведён в текущем и родительских контекста по полученному имени.
          *
          * Когда обработчик события не возвращает никакого результата, то будет выполнена следующая логика:
          * <ul>
          *    <li>Если поле существует в текущем контексте, то результатом поиска будет текущий контекст и это поле.</li>
          *    <li>Если поле существует в родительском контексте, то результатом поиска будет родительский контекст и это поле.</li>
          * </ul>
          * @param {Core/EventObject} eventObject Дескриптор события.
          * @param {String} fieldName Имя поля контекста.
          */
         /**
          * @event onDataBind Происходит при полном изменении контекста, а не одного или нескольких полей.
          * @remark
          * Например, событие происходит при выполнении метода {@link setContextData}.
          * @param {Core/EventObject} eventObject Дескриптор события.
          * @see setContextData
          */
         /**
          * @event onFieldChange Происходит при изменении значения в поле контекста.
          * @remark
          * Событие происходит при изменении значения в поле текущего или вышестоящего контекста (см. <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/component-infrastructure/databinding/'>Контекст области</a>).
          * Изменить значение в поле контекста можно двумя способами:
          * <ul>
          *    <li>с помощью метода {@link setValue};</li>
          *    <li>с помощью <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/component-infrastructure/databinding/#binding'>связывания опций контрола</a> с полем контекста.</li>
          * </ul>
          * @param {Core/EventObject} eventObject Дескриптор события.
          * @param {String} fieldName Имя поля контекста.
          * @param {*} value Новое значение поля контекста.
          * @param {Lib/Control/Control} [initiator] Инициатор изменения поля контекста. Параметр передается, если изменение было вызвано из контрола.
          * @see setValue
          * @see setValueSelf
          */
         /**
          * @event onFieldsChanged Происходит изменении значения в нескольких полях контекста.
          * @remark
          * Событие происходит при изменении значения в поле текущего или вышестоящего контекста (см. <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/component-infrastructure/databinding/'>Контекст области</a>).
          * Если метод контекста (или группа методов, выполняемая через метод контекста runInBatchUpdate) делает несколько изменений в контексте, то событие onFieldsChanged произойдёт только один раз по окончании этого метода.
          * @param {Core/EventObject} eventObject Дескриптор события.
          * @see setValue
          * @see setValueSelf
          * @see removeValue
          * @see insert
          * @see runInBatchUpdate
          */
         /**
          * @event onFieldRemove Происходит при удалении поля контекста.
          * @remark
          * Событие происходит при удалении поля текущего или вышестоящего контекста (см. <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/component-infrastructure/databinding/'>Контекст области</a>).
          * @param {Core/EventObject} eventObject Дескриптор события.
          * @param {String} fieldName Имя удалённого поля контекста.
          * @see removeValue
          */
         $protected: {
            _options: {
               /**
                * @cfg {Boolean} Является ли данный контекст глобальным.
                * Глобальный контекст - это контекст верхнего уровня.
                */
               isGlobal: false,
               /**
                * @cfg {String} Ограничение на запись или чтения
                * Работа только с текущим контекстом, игнорируется previousContext
                * Если значение set, то запись происходит только в текущий контекст, чтение не ограничено
                * Если значение setget, то запись происходит только в текущий контекст, чтение только из текущего контекста
                */
               restriction: ''
            },
            _restrictFlags: 0,
            _previousContext: null,
            _context: null,
            _record: null,
            _parentContextDataBindHandler: null,
            _parentContextFieldUpdateHandler: null,
            _updateLockCnt: 0,
            _updatedEventsCnt: 0,
            _fieldSubscriptions: {}
         },
         $constructor: function() {
            if (!this._options._createdWithWrapper && !this._options.isGlobal) {
               IoC.resolve('ILogger').error('Core/Context', 'Для создания контекста нужно использовать метод Context.createContext(control[, options[, previousContext]]).');
            }

            this._context = new ContextObject();

            switch (this._options.restriction) {
               case 'setget':
                  this._restrictFlags = this._restrictFlags | RestrictFlags.GETSET;
               // break; пропущен специально, так как ограничиваем и на set тоже
               case 'set':
                  this._restrictFlags = this._restrictFlags | RestrictFlags.SET;
            }

            this._parentContextDataBindHandler = withGroupChangeEvent(function() {
               if (!this._hasGetRestrictions()) {
                  this._updatedEventsCnt++;
                  this._notify('onDataBind');
               }
            }).bind(this);

            this._parentContextFieldsChangedHandler = withGroupChangeEvent(function() {
               if (!this._hasGetRestrictions()) {
                  this._updatedEventsCnt++;
               }
            }).bind(this);

            this._parentContextFieldUpdateHandler = function(event, field, value, initiator) {
               if (!this._hasGetRestrictions()) {
                  var descr = this._getFieldDescr(field, FindIntent.GET, RestrictFlags.GET);
                  if (!descr) {
                     // если у нас самих нет такого значения ...
                     this._notify('onFieldChange', field, value, initiator); // ... известим ниже о смене выше
                  }
               }
            }.bind(this);

            this._parentContextFieldRemovedHandler = function(event, field) {
               if (!this._hasGetRestrictions()) {
                  var descr = this._getFieldDescr(field, FindIntent.GET, RestrictFlags.GET);
                  if (!descr) {
                     this._notify('onFieldRemove', field); // ... известим об удалении
                  }
               }
            }.bind(this);

            if (this._options.isGlobal === false) {
               this._previousContext = Context.global;
            }

            this._subscribeOnParentUpdates();

            this._publish('onDataBind', 'onFieldChange', 'onFieldsChanged', 'onFieldRemove');
         },
         _subscribeOnParentUpdates: function() {
            var prev = this._previousContext;
            if (prev) {
               prev.subscribe('onDataBind', this._parentContextDataBindHandler);
               prev.subscribe('onFieldsChanged', this._parentContextFieldsChangedHandler);
               prev.subscribe('onFieldChange', this._parentContextFieldUpdateHandler);
               prev.subscribe('onFieldRemove', this._parentContextFieldRemovedHandler);
            }
         },
         _unsubscribeOnParentUpdates: function() {
            var prev = this._previousContext;
            if (prev) {
               prev.unsubscribe('onDataBind', this._parentContextDataBindHandler);
               prev.unsubscribe('onFieldsChanged', this._parentContextFieldsChangedHandler);
               prev.unsubscribe('onFieldChange', this._parentContextFieldUpdateHandler);
               prev.unsubscribe('onFieldRemove', this._parentContextFieldRemovedHandler);
            }
         },

         _unsubscribeFromFields: function() {
            for (var key in this._fieldSubscriptions) {
               if (this._fieldSubscriptions.hasOwnProperty(key)) {
                  this._setFieldSubscription(key, this._context.getRaw(key), NonExistentValue);
               }
            }
            this._fieldSubscriptions = {};
         },

         /**
          * Получить текущее ограничение контекста
          * @return {string}
          */
         getRestriction: function() {
            return this._options.restriction;
         },

         /**
          * Установить ограничение контекста
          * @param {String} restriction Ограничение на запись или чтения
          * Работа только с текущим контекстом, игнорируется previousContext
          * Если значение set, то запись происходит только в текущий контекст, чтение не ограничено
          * Если значение setget, то запись происходит только в текущий контекст, чтение только из текущего контекста
          */
         setRestriction: function(restriction) {
            this._options.restriction = restriction;
            this._restrictFlags = this._restrictFlags & (~RestrictFlags.GETSET);

            switch (restriction) {
               case 'setget':
                  this._restrictFlags = this._restrictFlags | RestrictFlags.GET;
               // break; пропущен специально, так как ограничиваем и на set тоже
               case 'set':
                  this._restrictFlags = this._restrictFlags | RestrictFlags.SET;
            }
         },

         _hasGetRestrictions: function() {
            return this._hasRestrictions(RestrictFlags.GET);
         },

         _hasSetRestrictions: function() {
            return this._hasRestrictions(RestrictFlags.SET);
         },

         _hasRestrictions: function(flags) {
            return (this._restrictFlags & flags) !== 0;
         },

         /**
          * Установить предыдущий контекст
          * @param {Core/Context} previous Контекст, который необходимо привязать предыдущим к текущему.
          * @return {Core/Context}  Текущий контекст.
          * @see getPrevious
          */
         setPrevious: withGroupChangeEvent(function(previous) {
            if (this.isGlobal()) {
               throw new Error('Attempt to set a previous context to a global context');
            }

            if (previous !== null && !previous instanceof Context) {
               throw new Error('"previous" argument should be instance of Core/Context');
            }

            if (previous !== this._previousContext) {
               this._unsubscribeOnParentUpdates();
               this._previousContext = previous;
               this._subscribeOnParentUpdates();

               if (!this._hasGetRestrictions()) {
                  this._updatedEventsCnt++;
               }
            }
            return this;
         }),

         /**
          * Получить предыдущий контекст.
          * @return {Core/Context} Предыдущий контекст или null, если он отсутствует.
          * @see setPrevious
          */
         getPrevious: function() {
            return this._previousContext;
         },

         /**
          * Навешивает/снимает обработчики с _context._record. Вызывает callback(newData).
          * @param {Object|Deprecated/Record} newData Новый контекст.
          * @param {Function} callback Функция для выполнения дополнительного кода
          * @private
          */
         _changeContextData: withGroupChangeEvent(function(newData, callback) {
            var
               RecordFieldProxy = Context.RecordFieldProxy,
               proxy, old;

            callback.apply(this);

            if (cInstance.instanceOfModule(newData, 'Deprecated/Record')) {
               this._record = newData;

               this._record.each(function(colName) {
                  proxy = new RecordFieldProxy(this._record, colName);
                  old = this._context.getRaw(colName);

                  this._setFieldSubscription(colName, old, proxy);
                  this._context.setRaw(colName, proxy);
               }.bind(this));
            } else {
               for (var colName in newData) {
                  if (newData.hasOwnProperty(colName)) {
                     var
                        value = newData[colName];
                     old = this._context.getRaw(colName);
                     this._setFieldSubscription(colName, old, value);
                     this._context.setRaw(colName, value);
                  }
               }
            }

            this._updatedEventsCnt++;
            this._notify('onDataBind');
         }),

         /**
          * Изменить данные, хранимые контекстом.
          * Стирает всё, что было и записывает новые значения. В контексте будет только то, что передали в параметре context.
          * @param {Object|Deprecated/Record} context Новый контекст.
          * @see replaceRecord
          * @see {@link Deprecated/RecordSet#getContext getContext}
          */
         setContextData: function(context) {
            this._unsubscribeFromFields();

            this._changeContextData(context, function() {
               this._context = new ContextObject();
            });
         },
         /**
          * Смена записи в контексте.
          * Оставляет без изменения всё, кроме записи - её подменяет на новую.
          * @param {Deprecated/Record} record Новая запись.
          * @see setContextData
          * @see {@link Deprecated/RecordSet#getContext getContext}
          */
         replaceRecord: function(record) {
            if (this._record) {
               //Отписываюсь от полей рекорда
               this._record.each(function(colName) {
                  this._setFieldSubscription(colName, this._context.getRaw(colName), null);
                  this._context.removeRaw(colName);
               }.bind(this));
            }

            this._changeContextData(record, function () {});
         },
         /**
          * Проверить контекст на то, является он глобальным или нет.
          * @return {Boolean} Флаг глобальности.
          */
         isGlobal: function() {
            return this._options.isGlobal;
         },
         /**
          * Проверить пуст ли контекст
          * @return {Boolean} true - контекст пуст, false - контекст не пуст.
          * @see setValue
          * @see getValue
          */
         isEmpty: function() {
            return this.isDestroyed() ? true : this._context.isEmpty();
         },
         /**
          * Получить запись, по которой построен контекст
          * Если контекст построен без записи, вернет null.
          * @returns {Deprecated/Record} Если в контекст положили запись, то возвращаем её.
          */
         getRecord: function() {
            return this._record;
         },

         _getValue: function(fieldName, func, selfOnly, nonExistentAsIs) {
            if (func !== undefined && typeof(func) !== 'function') {
               throw new Error(rk('Параметр func должен быть функцией, если он есть'));
            }

            var
               restrOvr = RestrictFlags[selfOnly ? 'GET' : 'NONE'],
               descr = this._getFieldDescr(fieldName, FindIntent.GET, restrOvr, func),
               result;

            if (descr) {
               result = descr.contextData.get(descr.qname, descr.keyPath);
            } else {
               result = NonExistentValue;
            }
            return result === NonExistentValue && !nonExistentAsIs ? undefined : result;
         },

         /**
          * Получить значение поля из контекста
          * Если поле не найдено в текущем контексте, то ищется в предыдущем. И так, пока не найдётся.
          * @param {String} fieldName Имя поля, значение которого необходимо вернуть.
          * @param {Function} [func] Функция валидации значения, принимает один параметр - значение поля в контексте;
          * если возвращает TRUE, то значение ищется в предыдущем контексте, иначе должен возвращать значение поля.
          * @returns {String} Значение поля из контекста. Если такого поля нет, то вернёт undefined.
          * @see isEmpty
          * @see setValue
          */
         getValue: function(fieldName, func) {
            return fieldName ? this._getValue(fieldName, func, false) : undefined;
         },
         /**
          * Получить значение поля из контекста
          * Отличается от {@link getValue} тем, что не ищет в "родительских" контекстах.
          * @param {String} fieldName Название поля.
          * @returns {*} Значение поля из контекста. Если такого поля нет, то вернёт undefined.
          */
         getValueSelf: function(fieldName) {
            return this._getValue(fieldName, undefined, true);
         },

         /**
          * Функция возвращает true, если поле subField лежит внутри поля parentField, или является тем же самым полем.
          * @param {String} subField - предполагаемое под-поле (или то же самое поле)
          * @param {String} parentField - предполагаемое родительское (или то же самое поле)
          * @return {boolean}
          */
         isFieldSameOrSubField: function(subField, parentField) {
            var
               subDescr = this._getFieldDescr(subField),
               parentDescr = this._getFieldDescr(parentField),
               result;

            result = subDescr && parentDescr && subDescr.context === parentDescr.context && subDescr.qname === parentDescr.qname;
            if (result) {
               result = arrayFindIndex(parentDescr.keyPath, function(val, idx) {
                     return subDescr.keyPath[idx] !== val;
                  }) === -1;
            }
            return result;
         },

         /**
          * @param {string} fieldName
          * @param {string} intent
          * @param {number} [restrictionsOvrerride]
          * @param {function} [validateFn]
          * @return {{qname: string, keyPath: Array, context: Core/Context, contextData: ContextObject}}
          * @private
          */
         _getFieldDescr: function(fieldName, intent, restrictionsOvrerride, validateFn) {
            var
               context = this,
               result = null,
               intentCheckFlags = {},
               isSetIntent = intent === FindIntent.SET,
               restrFlags,
               undefAsExistent,
               check, val, newName;

            intentCheckFlags[FindIntent.GET]    = RestrictFlags.GET;
            intentCheckFlags[FindIntent.SET]    = RestrictFlags.SET;
            intentCheckFlags[FindIntent.REMOVE] = RestrictFlags.SET;

            while (!result && context) {
               restrFlags = context._restrictFlags | (restrictionsOvrerride || 0);
               undefAsExistent = (restrFlags & RestrictFlags.UNDEFINEDS_AS_EXISTENT) !== 0;

               if (context.hasEventHandlers('onFieldNameResolution')) {
                  newName = '' + (context._notify('onFieldNameResolution', fieldName, isSetIntent) || '');
                  if (newName.length > 0) {
                     result = context._context._getFieldDescr(newName, undefAsExistent, isSetIntent);
                     context = result ? context : null;
                  }
               }

               if (!result && context) {
                  result = context._context._getFieldDescr(fieldName, undefAsExistent);
                  if (result && validateFn) {
                     val = context._context.get(result.qname, result.keyPath);
                     result = !validateFn(val) ? result : null;
                  }

                  if (!result) {
                     check = restrFlags & intentCheckFlags[intent];
                     context = check === 0 ? context.getPrevious() : null;
                  }
               }
            }

            cDebug.checkAssertion(!!result === !!context);

            if (!result && isSetIntent) {
               context = this;
               result = context._context._getFieldDescr(fieldName, false, true);
            }

            if (result) {
               result.context = context;
               result.contextData = context._context;
            }

            return result;
         },

         _setFieldSubscription: function(qname, oldValue, newValue) {
            var subscriptions = this._fieldSubscriptions, sub, newType;

            function notifyOnFieldChange(){
               this._updatedEventsCnt++;
               this._notify('onFieldChange', qname, this.getValue(qname));
            }

            if (oldValue !== newValue) {
               if (qname in subscriptions) {
                  sub = subscriptions[qname];
                  delete subscriptions[qname];
                  if (sub) {
                     sub();
                  }
               }

               newType = Context.getValueType(newValue);
               if (newValue && newValue !== NonExistentValue && newType.subscribe) {
                  sub = function() {
                     //если это внешнее изменение, от самого поля, а не из setValue
                     if (this._updateLockCnt === 0) {
                        withGroupChangeEvent(notifyOnFieldChange).call(this);
                     } else {
                        // если еще не закончилось обновление полей, подпишемся на событие, когда поля обновятся и стрельнем onFieldChange
                        // (если этого не сделать, события об изменении этих полей вообще не стрельнут для данного контекста)
                        this.once('onFieldsChanged', notifyOnFieldChange.bind(this))
                     }
                  }.bind(this);

                  subscriptions[qname] = newType.subscribe(newValue, sub);
               }
            }
         },

         /**
          * Получить оригинальный контекст, в котором непосредственно расположено поле.
          * Если такого поля во всех родительских контекстах нет, то вернёт undefined.
          * @param {String} fieldName Имя поля.
          * @param {Boolean} [setRestriction] - Учесть ограничение на set
          * @return {Core/Context|undefined} Объект контекста или undefined.
          */
         getFieldOrigin: function(fieldName, setRestriction) {
            var
               intent = FindIntent[setRestriction ? 'SET' : 'GET'],
               descr = this._getFieldDescr(fieldName, intent);

            return descr && descr.context;
         },

         /**
          * Проверить, есть ли указанное поле в данном контексте
          * @param {String} fieldName Имя поля.
          * @returns {Boolean} true - указанное поле есть в данном контексте, false - нет.
          */
         hasField: function(fieldName) {
            var value = this._getValue(fieldName, undefined, true, true);
            return value !== NonExistentValue;
         },

         /**
          * Проверить, есть ли указанное поле в данном контексте, или в его родительских контекстах.
          * @param {String} fieldName Имя поля.
          * @returns {Boolean} true - указанное поле есть в данном контексте, false - нет.
          */
         hasFieldWithParents: function(fieldName) {
            var value = this._getValue(fieldName, undefined, false, true);
            return value !== NonExistentValue;
         },

         /**
          * Получить оригинальный контекст, непосредственно в котором расположено поле.
          * Аналогично {@link getFieldOrigin}, но находит даже те поля, значения которых undefined.
          * Если контекст не найден, то вернет null.
          * @param {String} fieldName Имя поля.
          * @returns {Core/Context} Объект контекста.
          */
         getFieldOrigin2: function(fieldName) {
            var
               descr = this._getFieldDescr(fieldName, FindIntent.GET, RestrictFlags.UNDEFINEDS_AS_EXISTENT);

            return descr && descr.context;
         },

         /**
          * Устанавливает значения в одно или несколько полей контекста.
          * @remark
          * Значение поля будет установлено в текущий контекст и во все родительские.
          * @param {String|Object} fieldName Имя поля, в которое будет установлено значение.
          * Чтобы установить значения сразу в несколько полей контекста, в параметр передают объект: ключ - имя поля, значение - устанавливаемое значение.
          * @param {*} [value] Значение, которое будет установлено.
          * @param {Boolean} [toSelf=false] Принудительная установка значения в текущий контекст.
          * <ul>
          *    <li>true - значение будет установлено только в текущий контекст.</li>
          *    <li>false - значение будет пытаться найти в родительских контекстах поле с таким же именем и записать туда, если не найдёт, то запишет в текущий. Если желаемого значения нет ни в одном из контекстов выше, независимо от параметра toSelf запишет значение в текущий контекст.</li>
          * </ul>
          * @param {Lib/Control/Control} [initiator] Инициатор изменения поля контекста. Параметр передается, если изменение было вызвано из контрола.
          * @example
          * 1. Установим значение для одного поля контекста:
          * <pre>
          * control.getLinkedContext().setValue(myFieldName, myValue);
          * </pre>
          * 2. Установим значение для нескольких полей контекста:
          * <pre>
          * control.getLinkedContext().setValue({
          *    myFieldName1: myValue1,
          *    myFieldName2: myValue2
          * });
          * </pre>
          * @see setValueSelf
          */
         setValue: withGroupChangeEvent(function(fieldName, value, toSelf, initiator) {
            // пустые названия полей вообще не принимаем
            if (!fieldName) {
               throw new Error(rk('Нельзя писать значения в контекст по пустому полю') + ' ""');
            }

            var processedFieldTypes = [];
            function setV(fieldName, val, toSelf, initiator, last) {
               var descr = this._getFieldDescr(fieldName, FindIntent.SET, RestrictFlags[toSelf ? 'SET' : 'NONE']);

               if (!descr) {
                  var logger = IoC.resolve('ILogger');
                  logger.error('setValue', rk('Нельзя записывать значение в под-поле сложного поля контекста, если этого сложного поля в контексте не существует. Путь к под-полю:') + ' ' + fieldName);
               } else {
                  var context = descr.context;
                  var
                     fieldType = context._context.getFieldType(descr.qname),
                     oldRaw = context._context.getRaw(descr.qname),
                     changed,
                     newRaw;

                  if (processedFieldTypes.indexOf(fieldType) === -1) {
                     processedFieldTypes.push(fieldType);
                     context._context.transaction(fieldType);
                  }

                  changed = context._context.set(descr.qname, descr.keyPath, val);
                  newRaw = context._context.getRaw(descr.qname);

                  if (last) {
                     processedFieldTypes.forEach(function(fieldType) {
                        context._context.commit(fieldType);
                     });
                     processedFieldTypes.length = 0;
                  }

                  if (changed) {
                     context._setFieldSubscription(descr.qname, oldRaw, newRaw);
                     context._updatedEventsCnt++;
                     context._notify('onFieldChange', fieldName, val, initiator); // ... известим

                     this._changedContexts = this._changedContexts || [];
                     this._changedContexts.push(context);
                  }
               }
            }

            // А вдруг кто-то передал объект
            if (typeof(fieldName) == 'object') {
               if (!isPlainObject(fieldName)) {
                  throw new Error('setValue supports simple JSON objects only');
               }

               var toSelf_ = value, initiator_ = toSelf;
               Object.keys(fieldName).forEach(function(key, index, keys) {
                  // Смещаем параметры
                  setV.call(this, key, fieldName[key], toSelf_, initiator_, index === keys.length - 1);
               }, this);
            } else {
               setV.call(this, fieldName, value, toSelf, initiator, true);
            }
         }),

         /** Эта функция позволяет вызвать несколько методов контекста, и получить по итогам выполнения этих методов только
          * одно событие onFieldsChanged (если были сделаны какие-то изменения). В неё передаётся один аргумент - функция,
          * которая и вызывает эти методы.
          * @param {Function} fn Функция, которая вызывает у контекста несколько методов.
          */
         runInBatchUpdate: withGroupChangeEvent(function(fn) {
            return fn.call(this);
         }),

         /**
          * Удалить значения из контекста
          * @param {String} fieldName Имя поля, из которого удалять.
          * @param {Boolean} [toSelf=false]  Если false и не удалил в текущем, то пытается удалить в предыдущем.
          */
         removeValue: withGroupChangeEvent(function(fieldName, toSelf) {
            var
               restrOvr = toSelf ? RestrictFlags.SET : RestrictFlags.NONE,
               descr = this._getFieldDescr(fieldName, FindIntent.REMOVE, restrOvr),
               newRaw, result, context, updateContext;

            if (descr) {
               context = descr.context,
               updateContext = withGroupChangeEvent(function () {
                  var
                     data = descr.contextData,
                     oldRaw = data.getRaw(descr.qname),
                     result = descr.contextData.remove(descr.qname, descr.keyPath);

                  if (result) {
                     newRaw = data.getRaw(descr.qname);
                     descr.context._setFieldSubscription(descr.qname, oldRaw, newRaw);

                     this._updatedEventsCnt++;
                     this._notify('onFieldRemove', fieldName); // ... известим об удалении
                  }
                  return result;
               }).bind(context);

               result = updateContext();
            } else {
               result = false;
            }
            return result;
         }),
         /**
          * Устанавливает значения в одно или несколько полей текущего контекста, без изменения родительского контекста.
          * @param {String|Object} fieldName Имя поля контекста. Если передан объект с данными, то второй параметр будет неактуален.
          * @param [value] Значение, которое будет установлено.
          * @param {Lib/Control/Control} [initiator] Инициатор изменения поля контекста. Параметр передается, если изменение было вызвано из контрола.
          * @example
          * <pre>
          * ctx.setValueSelf('field', 10, control);
          * </pre>
          * <pre>
          * ctx.setValueSelf({
          *    field: 10
          * }, control);
          * </pre>
          * @see setValue
          */
         setValueSelf: function(fieldName, value, initiator) {
            if (typeof fieldName == 'object') {
               this.setValue(fieldName, true, initiator);
            } else {
               this.setValue(fieldName, value, true, initiator);
            }
         },
         /**
          * Вставить в контекст объект как связанный
          * @param {Deprecated/Record || Object} values Значения для вставки
          * @param {String} link Имя связи
          */
         insert: function(values, link) {
            this._multiOperation(values, link, 'insert');
         },
         /**
          * Удалить из контекста объект по связи
          * @param {Deprecated/Record | Object} values Значения для удаления
          * @param {String} link Имя связи
          */
         remove: function(values, link) {
            this._multiOperation(values, link, 'remove');
         },
         /**
          * Метод работы со связанными объектами
          * @param {Deprecated/Record | Object} values значения для вставки.
          * @param {String} link Имя связи.
          * @param {String} type  Тип действия 'insert' || 'remove'.
          */
         _multiOperation: withGroupChangeEvent(function(values, link, type) {
            if (link !== null && link !== undefined && typeof link !== 'string') {
               throw new Error(rk('Параметр link должен быть строкой - именем связи'));
            }

            var linkS = link ? link + LINK_SEPARATOR : '';

            if (cInstance.instanceOfModule(values, 'Deprecated/Record')) {
               values = values.toObject();
            }

            if (typeof(values) === 'object') {
               if (!isPlainObject(values) && !Array.isArray(values)) {
                  throw new Error('"values" argument error: _multiOperation supports simple JSON objects only');
               }

               for (var i in values) {
                  if (values.hasOwnProperty(i)) {
                     if (type == 'remove') {
                        this.removeValue(linkS + i, true);
                     }
                     if (type == 'insert') {
                        this.setValueSelf(linkS + i, values[i]);
                     }
                  }
               }
            } else if (values === false || values === null || values === undefined) {
               // Вычищение связанных значений из контекста с попыткой понять, что же вычищать
               var
                  record = this.getRecord(),
                  removeValue = function(key) {
                     if (key.indexOf(link) === 0) {
                        this.removeValue(key, true);
                     }
                  }.bind(this);

               if (record) {
                  record.getColumns().forEach(function(key) {
                     removeValue(key);
                  });
               } else {
                  var
                     contextObject = this.toObject(false);
                  for (var key in contextObject) {
                     if (contextObject.hasOwnProperty(key)) {
                        removeValue(key);
                     }
                  }
               }
            }

            this._notify('onDataBind');
         }),
         destroy: function() {
            this._record = null;

            this._unsubscribeOnParentUpdates();
            this._unsubscribeFromFields();
            this._context = new ContextObject();

            Context.superclass.destroy.apply(this, arguments);
         },
         /**
          * Создать дочерний контекст
          * Создаёт новый контекст, зависимый от текущего.
          * @returns {Core/Context} Дочерний контекст
          * @deprecated Для создания контекста нужно использовать метод Context.createContext(control[, options[, previousContext]])
          */
         createDependent: function() {
            var result = new Context();
            result.setPrevious(this);
            return result;
         },
         /**
          * Представляет контекст в виде объекта, содержащего поля контекста со значениями в строковом виде
          * @param {Boolean} recursive Флаг, позволяющий при значени true получить полное содержимое контекста включая всех родителей.
          * @returns {Object} Объект, содержащий поля контекста в строковом виде
          */
         toObject: function(recursive) {
            var result = this._context.toObject(recursive);

            if (recursive) {
               var parent = this.getPrevious();
               if (parent) {
                  var parentObj = parent.toObject(true);
                  for (var i in parentObj) {
                     if (parentObj.hasOwnProperty(i) && !(i in result)) {
                        result[i] = parentObj[i];
                     }
                  }
               }
            }

            return result;
         }
      });

      /**
       * @name Core/Context#createContext
       * @function
       * @description
       * Создает контекст и запоминает его.
       * @remark
       * Созданный контекст будет уничтожен:
       * <ul>
       *    <li>Во время destroy() контрола, переданного первым параметром (если был передан контрол)</li>
       *    <li>Во время callback() Deferred'a, переданного первым параметром (если был передан Deferred)</li>
       * </ul>
       * @param {Lib/Control/Control.compatible|Core/Deferred} ctrlDef 1) Контрол - владелец контекста, на destroy которого контекст будет уничтожен, или 2) Deferred, по callback'у которого контекст будет уничтожен
       * @param {Object} [options] Объект с опциями для контекста, или null, если опции не нужны
       * @param {Core/Context} [previousContext] Контекст-родитель для нового контекста
       * @returns {Core/Context} Созданный контекст
       * @example
       * В качестве контрола-владельца можно использовать this. Тогда создание дочерних контролов вида:
       * <pre>
       *    ...
       *    this._someChildControl = new SubControl({
       *       parent: this,
       *       name: 'someChildControl',
       *       linkedContext: new Context({ restriction: 'setget' })
       *    });
       *    ...
       * </pre>
       * можно переписать в виде:
       * <pre>
       *    ...
       *    this._someChildControl = new SubControl({
       *       parent: this,
       *       name: 'someChildControl',
       *       linkedContext: Context.createContext(this, { restriction: 'setget' })
       *    });
       *    ...
       * </pre>
       * <br>
       * Вместо someContext.createDependent() теперь нужно использовать createContext. Если было:
       * <pre>
       *    ...
       *    var ctx = this.getLinkedContext().createDependent();
       *    или
       *    var ctx = new Context().setPrevious(this.getLinkedContext());
       *    ...
       * </pre>
       * станет:
       * <pre>
       *    var ctx = Context.createContext(this, null, this.getLinkedContext());
       * </pre>
       * <br>
       * Если привязать контекст к какому-то контролу невозможно (например никаких контролов просто нет), нужно использовать Deferred. Его нужно передать
       * в Context.createContext и вызвать callback у этого Deferred тогда, когда созданный контекст больше не нужен. Для него будет вызван destroy().
       * <pre>
       *    ...
       *    this._destroyCtxDfr = new Deferred();
       *    this._someContext = Context.createContext(this._destroyCtxDfr);
       *    ...
       *    this._destroyCtxDfr.callback(); // контекст this._someContext будет уничтожен
       * </pre>
       */
      Context.createContext = function (ctrlDef, options, previousContext) {
         var ctx;

         if (!ctrlDef || (!cInstance.instanceOfMixin(ctrlDef, 'Lib/Control/Control.compatible') && !cInstance.instanceOfModule(ctrlDef, 'Core/Deferred'))) {
            IoC.resolve('ILogger').info('Для создания контекста необходимо передать контрол, которому он будет принадлежать, или Deffered, который выстрелит, когда контекст перестанет быть нужным.');
         }
         options = options || {};
         if (previousContext && !(previousContext instanceof Context)) {
            throw new Error('Родительский контекст должен иметь тип Core/Context');
         }

         options._createdWithWrapper = true;
         ctx = new Context(options);
         if (previousContext) {
            ctx.setPrevious(previousContext);
         }

         if (cInstance.instanceOfMixin(ctrlDef, 'Lib/Control/Control.compatible')) {
            // Контекст будет задестроен по destroy контрола
            ctrlDef.addOwnedContext(ctx);
         } else if (cInstance.instanceOfModule(ctrlDef, 'Core/Deferred')){
            // Контекст будет задестроен, когда выстрелит переданный Deferred
            ctrlDef.addCallback(function () {
               ctx.destroy();
            });
         }

         return ctx;
      };

      Context.registerFieldType = function(type) {
         AllFieldTypes.unshift(type);
      };

      Context.getValueType = function(value) {
         return objectFind(AllFieldTypes, function(ftype) {
            return ftype.is(value);
         });
      };

      Context.NonExistentValue = NonExistentValue;
      Context.SimpleFieldType = SimpleFieldType;
      Context.RecordFieldProxy = null;
      Context.STRUCTURE_SEPARATOR = STRUCTURE_SEPARATOR;
      Context.global = new Context({isGlobal: true});

      return Context;

   });