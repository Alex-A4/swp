define('Core/ContextBinder', [
   'Core/Context',
   'Core/Abstract',
   'Core/helpers/Object/isPlainObject',
   'Core/helpers/Object/isEmpty',
   'Core/helpers/Array/findIndex',
   'Core/IoC',
   'Core/core-merge',
   'Core/core-clone',
   'Core/helpers/Function/shallowClone',
   'Core/core-instance',
   'Core/core-debug',
   'Core/ConsoleLogger'
], function(
   Context,
   Abstract,
   isPlainObject,
   isEmptyObject,
   arrayFindIndex,
   ioc,
   coreMerge,
   coreClone,
   cShallowClone,
   cInstance,
   cDebug
) {
   'use strict';

   /**
    * @typedef {Object} BinderOptions Тип, описывающий данные, возвращаемые функциями для отладки привязок контролов к контексту
    * (Core/ContextBinder.getBindingsForContext и Core/ContextBinder.getBindingsForControl).
    * @property {Array} bindings Привязки к контексту (указанному в параметре context), определённые для контрола (указанного в поле control).
    * @property {Lib/Control/Control} control Контрол, для которого определены привязки, указанные в поле bindings.
    * @property {Core/Context} context Контекст, к которому привязан контрол, указанный в параметре control.
    * @property {Function} synchronize Функция, запускающая синхронизацию между контекстом и контролом (указанным в соотв. параметрах)  по привязкам из параметра bindings.
    * Принимает строковый аргумент direction.
    * Возможные значения:
    * <ol>
    *    <li>fromProperty</li> - свойства контрола пишутся в поля контекста
    *    <li>fromContext</li> - поля контекста пишутся в свойства контрола
    * </ol>
    * @property {Function} getSynchData Возвращает данные, которые используются для синхронизации. Принимает аргумент direction.
    * Возможные значения:
    * <ol>
    *    <li>fromProperty</li> - функция вернёт объект с полями контекста, которые будут установлены/удалены в соответствии со значениями свойств контрола, к которым они привязаны
    *    <li>fromContext</li> - функция вернёт объект со свойствами контрола, которые будут установлены в соответствии со значениями полей контекста, к которым они привязаны
    * </ol>
    * @property {Function} getConstructorOptions Возвращает извлеченные из контекста опции, предназначенные для передачи в конструктор компонента.
    * @see Core/ContextBinder.getBindingsForContext
    * @see Core/ContextBinder.getBindingsForControl
    */

   /**
    * @typedef {Object} BindingDefinition Тип, описывающий определение привязки к контексту (массив таких определений передаётся в конструктор класса Core/ContextBinder)
    * @property {string} fieldName Поле контекста, к которому привязывается свойство контрола, указанное в параметре propName
    * @property {string} propName Свойство контрола, привязанное к полю контекста, указанному в параметре fieldName
    * @property {string} oneWay
    * @property {string} direction
    * @property {string} nonExistentValue
    * @property {string} bindNonExistent
    */

   var
      STRUCTURE_SEPARATOR = Context.STRUCTURE_SEPARATOR,
      NonExistentValue = Context.NonExistentValue,
      NonExistentLocal = {},
      DEBUG_MODE = false,
      DEBUG_TRACE = 'trace',
      DEBUG_LOG = 'log',
      binderArray = [],
      logger = ioc.resolve('ILogger'),
      merge = coreMerge,
      clone = coreClone,
      shallowClone = cShallowClone,
      DIR_FROM_PROPERTY = 'fromProperty',
      DIR_FROM_CONTEXT = 'fromContext',
      currentUpdates = [],
      global = (function() { return this || (0,eval)('this') })(),
      consoleObj = global['console'],
      consoleLog = (consoleObj && consoleObj.log) ? Function.prototype.bind.call(consoleObj.log, consoleObj) : function () {},
      consoleTrace = (consoleObj && consoleObj.trace) ? Function.prototype.bind.call(consoleObj.trace, consoleObj) : consoleLog;
      
   function registerBinder(control, binder, context, synchronize, getSynchData, getConstructorOptions) {
      binderArray.push({
         control: control,
         binder: binder,
         context: context,
         synchronize: synchronize,
         getSynchData: getSynchData,
         getConstructorOptions: getConstructorOptions
      });
   }

   function unregisterBinder(control, binder, context) {
      binderArray = binderArray.filter(function(value) {
         return value.control !== control && value.binder !== binder && value.context !== context;
      });
   }

   function filterMapBindings(filterFn) {
      var filtered = binderArray.filter(filterFn);
      return filtered.map(function(value) {
         return {
            bindings: coreClone(value.binder._bindings),
            context: value.context,
            synchronize: value.synchronize,
            getSynchData: value.getSynchData,
            getConstructorOptions: value.getConstructorOptions
         };
      });
   }

   function warnBindError(msg) {
      if (DEBUG_MODE) {
         logger.error('Core/ContextBinder', typeof msg === 'string' ? msg : msg());
      }
   }

   function addComment(obj, name, commentMsg, control, needWarn) {
      if (DEBUG_MODE) {
         if (!obj.comment) {
            obj.comment = {};
         }

         var
            newComment = typeof commentMsg === 'function' ? commentMsg() : commentMsg,
            oldName = obj.comment[name],
            msg;

         if (oldName) {
            if (Array.isArray(oldName)) {
               oldName.push(newComment);
            }
            else {
               obj.comment[name] = [oldName, newComment];
            }
         }
         else {
            obj.comment[name] = newComment;
         }

         if (needWarn) {
            msg = 'Проблема в синхронизации контрола ' + control.getName() + '/' + control.getId() + ': ' + newComment;
            warnBindError(msg);
         }
      }
   }

   /**
    * Служебный класс, управляющий привязками свойств контрола к контексту.
    * @class Core/ContextBinder
    * @public
    * @extends Core/Abstract
    */
   var ContextBinder = Abstract.extend(/** @lends Core/ContextBinder.prototype */{
      $protected: {
         _options: {
            /**
             *@cfg {Array.<Array>|Array.<} Устанавливает режим взаимодействия с контролом.
             ** true Взаимодействие с контролом разрешено.
             ** false Взаимодействие с контролом запрещено.
             */
            bindings: null
         },
         
         _bindings: [{
            fieldName: '',
            propName: '',
            propPath: [],
            oneWay: false,
            lastValues: {
               fromContext: NonExistentLocal,
               fromProperty: NonExistentLocal
            }
         }],
         
         _isBound: false
      },
      
      $constructor: function (cfg) {
         this._bindings = [];
         
         function propName(binding) {
            var res;
            if ('index' in binding) {
               res = '' + binding.index;
            } else {
               res = binding.propName || '';
            }
            
            return res;
         }
         
         function processBinding(prefix, binding) {
            if (isPlainObject(binding)) {
               if (binding.fieldName && propName(binding) !== '') {
                  this.defineBinding(prefix + propName(binding), binding.fieldName, binding.oneWay, binding.direction, 
                     binding.nonExistentValue, binding.bindNonExistent);
               } else if (binding.subBindings && propName(binding) !== '') {
                  for (var key in binding.subBindings) {
                     if (binding.subBindings.hasOwnProperty(key)) {
                        processBinding.call(this, prefix + propName(binding) + STRUCTURE_SEPARATOR, binding.subBindings[key]);
                     }
                  }
               } else {
                  throw new Error('плохой формат элемента binding');
               }
            } else if (Array.isArray(binding)) {
               this.defineBinding.apply(this, binding);
            } else {
               throw new Error('плохой формат элемента binding');
            }
         };
         
         var bindings = this._options.bindings;
         if (bindings && bindings.length) {
            var self = this;
            bindings.forEach(function (binding) {
               if (!binding.propName || binding.propName.indexOf('__dirtyCheckingVars_') === -1) {
                  processBinding.call(self, '', binding);
               }
            });
         }
      },
      
      _reduceBindings: function (oneWayDir, func, memo) {
         return this._bindings.filter(function(binding) {
            return !binding.oneWay || (binding.oneWay && binding.direction === oneWayDir);
         }).reduce(function (memo, binding, index, bindings) {
            memo = func.call(this, memo, binding, index === bindings.length - 1);
            return memo;
         }, memo, this);
      },
      
      /**
       * Извлечение из контекста опций для передачи их в конструктор компонента
       * @param {Core/Context} context Контекст, из которого извлекаются опции
       * @param {Function} controlClass Класс контрола, для конструктора которого запрашиваются опции.
       * @param {Object} controlOptions Опции для контрола, в которые надо замержить опции, полученные из контекста.
       * @returns {Object} Объект, в котором хранятся опции
       */
      getConstructorOptions: function (context, controlClass, controlOptions) {
         var
            handleBinding = function(props, binding) {
               var
                  hasField = context.hasFieldWithParents(binding.fieldName),
                  fieldValue,
                  fullPath,
                  checkPath,
                  lastName,
                  lastNameIdx,
                  propObj;
               
               if (hasField) {
                  fieldValue = context.getValue(binding.fieldName);
               } else {
                  hasField = binding.bindNonExistent;
                  if (hasField) {
                     fieldValue = binding.nonExistentValue;
                  }
                  else {
                     warnBindError(function() {
                        return 'Невозможно прочитать из контекста опцию (начальное значение свойства) для конструктора: ' + binding.propName  +
                               ', поскольку в контексте нет соответствующего ей поля ' + binding.fieldName +
                               ', и у привязки не установлены параметры bindNonExistent или bindNonExistentType';
                     });
                  }
               }
               
               if (hasField) {
                  fullPath = [binding.propName].concat(binding.propPath);
                  checkPath = fullPath.slice(0, fullPath.length - 1);
                  lastName = fullPath[fullPath.length - 1];
                  lastNameIdx = parseInt(lastName, 10);
                  propObj = checkPath.reduce(function (props, subName, index) {
                     var
                        nextSubName = fullPath[index + 1],
                        parsed = parseInt(nextSubName, 10),
                        needArray = !isNaN(parsed),
                        ok;
                     
                     if (needArray) {
                        ok = subName in props && Array.isArray(props[subName]);
                        if (!ok) {
                           props[subName] = [];
                        }
                     } else {
                        ok = subName in props && isPlainObject(props[subName]);
                        if (!ok) {
                           props[subName] = {};
                        }
                     }
                     return props[subName];
                  }, props);
                  
                  propObj[isNaN(lastNameIdx) ? lastName : lastNameIdx] = fieldValue;
               }
               
               return props;
            }.bind(this),
            result = this._reduceBindings(DIR_FROM_CONTEXT, handleBinding, {}),
            nameOpt;

         if (controlClass && controlOptions) {
            nameOpt = controlOptions.name;
            if (nameOpt && controlOptions.loadValueFromContextToConstructorOptions && cInstance.classOfMixin(controlClass, 'Lib/Mixins/DataBoundMixin')) {
               result = handleBinding(result, {
                  fieldName: nameOpt,
                  propName: 'value',
                  propPath: [],
                  oneWay: true,
                  direction: DIR_FROM_CONTEXT,
                  bindNonExistent: false
               });
            }

            result = merge(controlOptions, result);
         }

         return result;
      },

      /**
       * Биндинг контрола к заданному контексту
       * @param {Lib/Control/Control} control Контрол
       * @param {Core/Context} context Контекст
       * @param {String} [syncNow] Возможные значения: 'syncContext' - немедленное обновление контекста,
       * 'syncControl' - немедленное обновление контрола
       */
      bindControl: function (control, context, syncNow) {
         function runUpdate(direction, func) {
            function currentUpdateIdx(direction) {
               return arrayFindIndex(currentUpdates, function(upd) {
                  return upd.control === control && upd.context === context && upd.direction === direction;
               });
            }
      
            function endCurrentUpdate() {
               var idx = currentUpdateIdx(direction);
               if (idx !== -1) {
                  currentUpdates.splice(idx, 1);
               }
            }
      
            if (!control.isDestroyed() && !context.isDestroyed()) {
               var idx = currentUpdateIdx(direction);
               if (idx === -1) {
                  currentUpdates.push({
                     control: control, context: context, direction: direction
                  });
                  try {
                     func.call(this);
                  } finally {
                     endCurrentUpdate();
                  }
               }
            }
         }
         
         function logSync(direction, synchData) {
            var container, consoleFunc, title;
   
            if (DEBUG_MODE === DEBUG_TRACE || DEBUG_MODE === DEBUG_LOG) {
               container = control.getContainer();
               consoleFunc = DEBUG_MODE === DEBUG_TRACE ? consoleTrace : consoleLog;
               title = direction === DIR_FROM_CONTEXT ? 'Синхронизация контрола из контекста ' : 'Синхронизация контрола в контекст ';
   
               consoleFunc(title, container && container[0], synchData.comment, control, context, synchData);
            }
         }
         
         function updateControl() {
            var
               result = getValueForUpdateControl.call(this),
               newProps = result.value;
   
            logSync(DIR_FROM_CONTEXT, result);

            result.lastValues.forEach(function(lastVal) {
               lastVal.binding.lastValues[DIR_FROM_CONTEXT] = lastVal.value;
            });
            
            if (!isEmptyObject(newProps)) {
               control.setProperties(newProps);
            }
         }
   
         function updateContext() {
            var result = getValueForUpdateContext.call(this);
   
            logSync(DIR_FROM_PROPERTY, result);
            
            //Запомним последнее изменённое значение...
            result.lastValues.forEach(function(lastVal) {
               lastVal.binding.lastValues[DIR_FROM_PROPERTY] = lastVal.value;
            });
            
            context.runInBatchUpdate(function () {
               result.toRemove.forEach(function (field) {
                  context.removeValue(field);
               });

               // если объект пустой, не пытаемся звать setValue с ним, потому что там ничего не произойдет, только время займет
               if (!isEmptyObject(result.toSet)) {
                  context.setValue(result.toSet);
               }
            });
         }
   
         function getValueForUpdateControl() {
            var initPropType = function(propType) {
                  if (processedPropTypes.indexOf(propType) === -1) {
                     if (propType.transaction) {
                        propType.transaction();
                     }
                     processedPropTypes.push(propType);
                  }

               },
               processedPropTypes = [],
               newProps,
               oldProps,
               oldClonedProps;
            if (!context.isDestroyed() && !control.isDestroyed()) {
               oldProps = this._reduceBindings(DIR_FROM_CONTEXT, function (props, binding) {
                  if (binding.propName && !(binding.propName in props)) {
                     if (binding.propName.indexOf('__dirtyCheckingVars_') > -1) {
                        delete binding.propName;
                     } else {
                        props[binding.propName] = control.getProperty(binding.propName);
                     }
                  }
                  return props;
               }, {});
               oldClonedProps = shallowClone(oldProps);
               newProps = this._reduceBindings(DIR_FROM_CONTEXT, function (result, binding, last) {
                  var
                     fieldValue, propName, propValue,
                     propType, change, removeResult, newPropValue, hasField, oldValue, propPath, equals,
                     props = result.value,
                     lastVal = binding.lastValues[DIR_FROM_CONTEXT];
            
                  hasField = context.hasFieldWithParents(binding.fieldName);
                  if (hasField) {
                     fieldValue = context.getValue(binding.fieldName);
                  } else {
                     hasField = binding.bindNonExistent;
                     if (hasField) {
                        fieldValue = binding.nonExistentValue;
                     }
                     else {
                        fieldValue = NonExistentValue;
                     }
                  }
            
                  propPath = binding.propPath;
                  propName = binding.propName;
                  propValue = (propName in props ? props : oldClonedProps)[propName];
                  propType = Context.getValueType(propValue);

                  initPropType(propType);

                  result.lastValues.push({binding: binding, value: fieldValue, lastValue: lastVal});
                  if (lastVal !== fieldValue) {
                     if (hasField) {
                        change = propType.setWillChange(propValue, propPath, fieldValue);
                        if (change) {
                           newPropValue = propType.set(propValue, propPath, fieldValue);
                           props[propName] = newPropValue;
                           addComment(result, propName, 'Свойство ' + binding.fullPropName + ' синхронизировано с полем контекста ' + binding.fieldName);
                        } else if (propPath.length > 0) {
                           oldValue = propType.get(propValue, propPath);
                           equals = oldValue === fieldValue || (propType.equals && propType.equals(oldValue, fieldValue));
         
                           if (!equals) {
                              cDebug.checkAssertion(oldValue === NonExistentValue);
            
                              if (propValue === null || propValue === undefined) {
                                 control.initializeProperty(propName);
                                 propValue = control.getProperty(propName);
               
                                 if (propValue !== null && propValue !== undefined) {
                                    propType = Context.getValueType(propValue);
                                    initPropType(propType);
                                    change = propType.setWillChange(propValue, propPath, fieldValue);
                  
                                    if (change) {
                                       newPropValue = propType.set(propValue, propPath, fieldValue);
                                       props[propName] = newPropValue;
                                       addComment(result, propName, 'Свойство ' + binding.fullPropName + ' успешно инициализировано из значения null или undefined, и синхронизировано с полем контекста ' + binding.fieldName);
                                    } else {
                                       addComment(result, propName, 'Свойство ' + binding.fullPropName + ' не синхронизируется, потому что не отличается от значения поля контекста ' + binding.fieldName);
                                    }
                                 } else {
                                    addComment(result, propName, 'Свойство ' + binding.fullPropName + ' не синхронизируется, поскольку его инициализация из null/undefined не прошла, ' +
                                                                 'оно всё так же равно null или undefined, и в него невозможна запись по пути ' + +binding.propPathStr, control, true);
                                 }
                              } else {
                                 addComment(result, propName, 'Свойство ' + binding.fullPropName + ' не синхронизируется, потому что в его текущее значение невозможна запись по пути ' + binding.propPathStr, control, true);
                              }
                           } else {
                              addComment(result, propName, 'Свойство ' + binding.fullPropName + ' не синхронизируется, потому что не отличается от значения поля контекста ' + binding.fieldName);
                           }
                        } else {
                           addComment(result, propName, 'Свойство ' + binding.fullPropName + ' не синхронизируется, потому что не отличается от значения поля контекста ' + binding.fieldName);
                        }
                     } else if (propPath.length > 0) {
                        removeResult = propType.remove(propValue, propPath);
                        if (removeResult.changed) {
                           props[propName] = removeResult.value;
                           addComment(result, propName, 'В свойстве ' + binding.propName + ' значение по пути ' + binding.propPathStr + ' удаляется, потому что в контексте нет соответствующего ему поля ' + binding.fieldName);
                        } else {
                           addComment(result, propName, 'В свойстве ' + binding.propName + ' значение по пути ' + binding.propPathStr + ' нужно удалить, поскольку в контексте нет соответствующего ему поля ' + binding.fieldName +
                                                        ', но удаление невозможно, поскольку значения в свойстве по этому пути нет, или типом значения не поддерживается удаление', control, true);
                        }
                     } else {
                        addComment(result, propName, 'Свойство ' + binding.propName + ' нужно удалить, поскольку в контексте нет соответствующего ему поля ' + binding.fieldName +
                                                     ', но удаление невозможно, поскольку контрол не умеет удалять свойства (только под-свойства - значения внутри свойств)', control, true);
                     }
                  }
                  else {
                     addComment(result, propName, 'В свойстве ' + binding.propName + ' значение по пути ' + binding.propPathStr +
                                                  ' не синхронизируется, потому что при прошлой синхронизации соотв. ему поле контекста ' + binding.fieldName + ' было таким же, как и в эту синхронизацию', control, true);
                  }


                  if (last) {
                     processedPropTypes.forEach(function(propType) {
                        if (propType.commit) {
                           propType.commit();
                        }
                     });
                     processedPropTypes.length = 0;
                  }

                  return result;
               }, {
                  value: {},
                  comment: {},
                  lastValues: []
               });
            }
            else {
               newProps = {
                  value: {},
                  comment: {},
                  lastValues: []
               };
            }
            return newProps;
         }
         
         function getValueForUpdateContext() {
            if (!context.isDestroyed() && !control.isDestroyed()) {
               var
                  getProp = function (propName) {
                     try {
                        return control.getProperty(propName);
                     } catch (e) {
                        logger.error('Control', e.message);
                     }
                  },
                  contextFields = this._reduceBindings(DIR_FROM_PROPERTY, function (fields, binding) {
                     var
                        propValue = getProp(binding.propName),
                        propType = Context.getValueType(propValue),
                        pathValue = propType.get(propValue, binding.propPath),
                        lastValue = binding.lastValues[DIR_FROM_PROPERTY];
   
                     fields.lastValues.push({binding: binding, value: pathValue, lastValue: lastValue});
                     if (lastValue !== pathValue) {
                        if (pathValue !== NonExistentValue && pathValue !== binding.nonExistentValue) {
                           fields.toSet[binding.fieldName] = pathValue;
                           addComment(fields, binding.fieldName, 'Поле контекста ' + binding.fieldName + ' записывается, потому что соответствующее ему свойство ' + binding.fullPropName + ' существует в свойствах контрола, и не равно параметру nonExistentValue');
                        } else {
                           fields.toRemove.push(binding.fieldName);
                           if (pathValue === NonExistentValue) {
                              addComment(fields, binding.fieldName, 'Поле контекста ' + binding.fieldName + ' удаляется, потому что соответствующее ему св-во контрола ' + binding.fullPropName + ' не существует в свойствах контрола');
                           } else {
                              addComment(fields, binding.fieldName, 'Поле контекста ' + binding.fieldName + ' удаляется, потому что соответствующее ему св-во контрола ' + binding.fullPropName + ' равно параметру nonExistentValue');
                           }
                        }
                     } else {
                        addComment(fields, binding.fieldName, 'Поле контекста ' + binding.fieldName + ' не меняется (не записывается и не удаляется), потому что при прошлой синхронизации значение соотв. (под)свойства контрола было таким же');
                     }
                     return fields;
                  }, {
                     toSet: {},
                     toRemove: [],
                     comment: {},
                     lastValues: []
                  });

               return contextFields;
            }
         }
         
         function synchronize(direction) {
            var fn = direction === DIR_FROM_PROPERTY ? updateContext : updateControl;
            runUpdate.call(self, direction, fn);
         }

         function getSynchData(direction) {
            if (direction === DIR_FROM_PROPERTY) {
               return getValueForUpdateContext.call(self);
            } else if (direction === DIR_FROM_CONTEXT) {
               return getValueForUpdateControl.call(self);
            }
         }

         var
            self = this,
            dataBindHandler,
            propertiesChangeHandler,
            unsubscribeFn;
         
         if (this._isBound) {
            throw new Error('На этом экземпляре класса Core/ContextBinder bindControl уже был вызван (из метода createBoundControl, или bindControl). Второй раз bindControl вызывать нельзя.');
         }
         this._isBound = true;

         if (this._bindings.length > 0) {
            dataBindHandler = runUpdate.bind(this, DIR_FROM_CONTEXT, updateControl);
            propertiesChangeHandler = runUpdate.bind(this, DIR_FROM_PROPERTY, updateContext);
            unsubscribeFn = function () {
               context.unsubscribe('onFieldsChanged', dataBindHandler);
               control.unsubscribe('onPropertiesChanged', propertiesChangeHandler);
               self.unsubscribe('onDestroy', unsubscribeFn);
               control.unsubscribe('onDestroy', unsubscribeFn);
               context.unsubscribe('onDestroy', unsubscribeFn);
               unregisterBinder(control, self, context);
            };

            context.subscribe('onFieldsChanged', dataBindHandler);
            control.subscribe('onPropertiesChanged', propertiesChangeHandler);

            this.subscribe('onDestroy', unsubscribeFn);
            control.subscribe('onDestroy', unsubscribeFn);
            context.subscribe('onDestroy', unsubscribeFn);

            registerBinder(control, this, context, synchronize, getSynchData.bind(this), this.getConstructorOptions.bind(this, context));

            if (syncNow === 'syncContext') {
               updateContext.call(this);
            } else if (syncNow === 'syncControl') {
               updateControl.call(this);
            }
         }
      },
      
      /**
       * Определение биндинга в экземпляре данного класса для последующих манипуляций с ним через другие методы
       * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/component-infrastructure/databinding/#binding
       * @param {String} controlPropName Соответствует полю name в заданной опции в верстке
       * @param {String} contextFieldName Соответствует полю bind в заданной опции в верстке
       * @param {Boolean} oneWay
       * @param {String} direction (Только при параметре oneWay == true) Возможные значения:
       * 'fromProperty' - значение свойства пишется в поле контекста, а обратно - нет.
       * 'fromContext' (по умолчанию) - значение поля контекста пишется в свойство контрола, а обратно - нет.
       * @param {Object} nonExistentValue какое значение писать в св-во контрола, если поля в контексте нет.
       * (актуально, если bindNonExistent == true)
       * @param {Boolean} bindNonExistent для несущ. значения в поле контекста писать в свойство значение,
       * указанное в nonExistentValue верно и обратное - если в свойстве контрола будет значение,
       * соотв. nonExistentValue, то поле в контексте будет удаляться при синхронизации из контрола в контекст
       */
      defineBinding: function (controlPropName, contextFieldName, oneWay, direction, nonExistentValue, bindNonExistent) {
         var
            propArr = controlPropName.split(STRUCTURE_SEPARATOR),
            propName = propArr[0],
            propPath = propArr.slice(1),
            propPathStr = propPath.join(STRUCTURE_SEPARATOR),
            obj = {
               fieldName: contextFieldName,
               propName: propName,
               propPath: propPath,
               fullPropName: controlPropName,
               propPathStr: propPathStr,
               oneWay: oneWay,
               direction: direction || DIR_FROM_CONTEXT,
               nonExistentValue: nonExistentValue,
               bindNonExistent: bindNonExistent,
               lastValues: {}
            };
            
         obj.lastValues[DIR_FROM_CONTEXT] = NonExistentLocal;
         obj.lastValues[DIR_FROM_PROPERTY] = NonExistentLocal;
         
         this._bindings.push(obj);
      }
   });
   
   /**
    * @name Core/ContextBinder#createBoundControl
    * Возможность с помощью вызова одного метода биндить опции заданного компонента с заданными полями контекста.
    * @remark
    * Подробнее о системе биндинга можно посмотреть в <a href="https://wi.sbis.ru/doc/platform/developmentapl/interfacedev/core/context/binding/">документации</a>.
    * @param {function} controlClass Класс (функция-конструктор) создаваемого компонента
    * @param {Object} cfg Конфигурация для конструктора компонента
    * @param {Core/Context} context Контекст, из которого берутся опции для создаваемого компонента
    * @param {Array} bindings каждый элемент массива - массив аргументов для функции defineBinding
    * @see Core/ContextBinder метод defineBinding
    * @returns {Lib/Control/Control} Компонент с опциями, взятыми из заданного контекста
    */
   ContextBinder.createBoundControl = function(controlClass, cfg, context, bindings) {
      var
         binder = new ContextBinder({bindings: bindings}),
         сfgWithCtx = binder.getConstructorOptions(context, controlClass, clone(cfg)),
         childControl = new controlClass(сfgWithCtx);
      
      binder.bindControl(childControl, context);
      return childControl;
   };

   /**
    * @name Core/ContextBinder#getBindingsForControl
    * Возвращает информацию о том, какие привязки к контексту имеет контрол, и сопутствующие функции для отладки привязок.
    * @param {Lib/Control/Control} control Контрол, для которого определены какие-либо привязки к одному (обычно одному) или нескольким контекстам.
    * @returns {Array.<BinderOptions>} Массив объектов, содержащих привязки и сопутствующие функции для отладки привязок.
    * @see Core/ContextBinder#getConstructorOptions
    * @see Core/Context
    */
   ContextBinder.getBindingsForControl = function(control) {
      return filterMapBindings(function (value) {
         return value.control === control;
      });
   };

   /**
    * @name Core/ContextBinder#getBindingsForContext
    * Возвращает информацию о том, привязки к каким контролам имеет контекст, и сопутствующие функции для отладки привязок.
    * @param {Core/Context} context Контекст, для которого определены привязки к каким-либо контролам.
    * @returns {Array.<BinderOptions>} Массив объектов, содержащих привязки и сопутствующие функции для отладки привязок.
    * @see Core/ContextBinder#getConstructorOptions
    * @see Core/Context
    */
   ContextBinder.getBindingsForContext = function(context) {
      return filterMapBindings(function (value) {
         return value.context === context;
      });
   };

   /**
    * @name Core/ContextBinder#initBinderForControlConfig
    * Метод создаёт Core/ContextBinder, инициализированный для заданного конфига компонента.
    * @param {Object} cfg Конфиг компонента
    * @param {Array.<Object>} cfg.bindings Описание с привязками свойств компонента.
    * @return {Core/ContextBinder | null} Если параметр bindings в конфиге содержит непустой массив с привязками свойств,
    * то метод возвращает экземпляр Core/ContextBinder, иначе (параметра bindings нет, или он пустой) метод возвращает null
    */
   ContextBinder.initBinderForControlConfig = function(cfg) {
      return new ContextBinder({bindings: cfg.bindings || []});
   };

   /**
    * @name Core/ContextBinder#setDebugMode
    * Включает или выключает отладочный режим для синхронизации привязок.
    * @remark
    * При включенном отладочном режиме (значениях true, 'trace', 'log') в консоль пишутся сообщения о проблемах синхронизации, которые игнорируются в выключенном отладочном режиме.
    * <ul>
    *   <li>При значении value=true пишутся только сообщения о проблемах синхронизации.</li>
    *   <li>При значении value='log' пишутся подробные сообщения о каждой синхронизации, с данными и контролом.</li>
    *   <li>При значении value='trace' сообщения о каждой синхронизации выводятся как при value='log', но с помощью console.trace, что помогает найти функцию, вызвавшую синхронизацию.</li>
    * </ul>
    * @param {Boolean|String} value
    */
   ContextBinder.setDebugMode = function(value) {
      DEBUG_MODE = value;
   };

   return ContextBinder;
});