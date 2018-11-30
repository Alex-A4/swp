define('Core/core-extend', [
   'require',
   'Core/core-extend-initializer',
   'Core/helpers/Function/callAround',
   'Core/helpers/Function/callNext',
   'Core/helpers/Function/callBefore',
   'Core/helpers/Function/callIf',
   'Core/helpers/Object/isEmpty',
   'Core/helpers/Object/find',
   'Core/helpers/Function/forAliveOnly',
   'Core/core-merge',
   'Core/core-hash',
   'Core/property-merge',
   'Core/core-classicExtend',
   'Core/core-simpleExtend',
   'Core/detection',
   'Core/IoC'
], function(
   require,
   coreInitializer,
   callAround,
   callNext,
   callBefore,
   callIf,
   isEmptyObject,
   objectFind,
   forAliveOnly,
   coreMerge,
   coreHash,
   propertyMerge,
   classicExtend,
   simpleExtend,
   detection,
   IoC
) {
    /**
     * @class Core/core-extend
     * @public
     *
     */
   var coreExtend = /** @lends Core/core-extend.prototype */{
      /**
       * Создание класса-наследника.
       *
       * @description
       * Класс-наследник описывается объектом.
       * В нем поддерживаются следующие элементы:
       *  - {Function} $constructor - Функция-конструктор нового класса.
       *  - {Object} $protected - объект-описание защищенных (protected) полей класса.
       *             Описывается как _ИмяПеременной : ЗначениеПоУмолчанию
       *  - {Function} любойМетод - методы класса.
       * Также функция extend доступна как член конструктора любого класса, полученного с помощью нее.
       * В этом случае первый аргумент не используется.
       * Пример:
       * <pre>
       *    // Наследуем SomeClass от Abstract
       *    SomeClass = Abstract.extend({
       *       $protected: {
       *          _myProtectedVar: 10,
       *          _myProtectedArray: []
       *       },
       *       $constructor: function(cfg){
       *          this._doInit(); // Call method
       *       },
       *       _doInit: function(){
       *          // do something
       *       },
       *       doSomethingPublic: function(){
       *          // do something public
       *       }
       *    });
       * </pre>
       *
       * @param {Function|Object} classPrototype Родительский класс.
       * @param {Array} mixinsList - массив объектов-миксинов
       * @param {Object} classExtender Объект-описание нового класса-наследника.
       * @returns {Function} Новый класс-наследник.
       */
      extend: (function() {

         function localExtend(mixinsList, classExtender) {
            return coreExtend.extend(this, mixinsList, classExtender);
         }

         function localExtendPlugin(pluginConfig) {
            return coreExtend.extendPlugin(this, pluginConfig);
         }

         function localMixin(mixinConfig) {
            return coreExtend.mixin(this, mixinConfig);
         }

         function mergePropertiesToPrototype(classResult, classExtender) {
            // Copy all properties to a newly created prototype
            for (var i in classExtender) {
               if (classExtender.hasOwnProperty(i) && i.charAt(0) != '$') {
                  classResult.prototype[i] = classExtender[i];
               }
            }
         }

         return function extend(classPrototype, mixinsList, classExtender) {
            if (Object.prototype.toString.call(classPrototype) === '[object Array]') {
               classExtender = mixinsList;
               mixinsList = classPrototype;
               classPrototype = undefined;
            }
            if (Object.prototype.toString.call(mixinsList) !== '[object Array]') {
               classExtender = mixinsList;
               mixinsList = undefined;
            }

            if (classPrototype && typeof classPrototype.beforeExtend === 'function') {
               classPrototype.beforeExtend.call(this, classPrototype, mixinsList, classExtender);
            }

            if (
               arguments.length === 1 || (
               simpleExtend.isCompatibleParent(classPrototype) &&
               simpleExtend.isCompatibleChild(classExtender)
               )
            ) {
               return simpleExtend.extend(
                  classPrototype || Object,
                  mixinsList || [],
                  classExtender
               );
            }

            if (mixinsList) {
               classPrototype = coreExtend.mixin(classPrototype, mixinsList);
            }

            if (classExtender && '_options' in classExtender) {
               throw new Error(rk('Ошибка в определении класса: секция _options в наследнике должна быть внутри секции $protected, а не в корне'));
            }

            var
               parentProto = classPrototype.prototype,
               useNativeConstructorFirst = parentProto && parentProto._useNativeAsMain,
               parentCtor = parentProto && parentProto.$constructor || null,
               parentNativeCtor = parentProto && parentProto.constructor || null,
               childCtor = classExtender.$constructor,
               constructor = function() {},
               classResult;

            classResult = classExtender.$constructor = function constructFn(cfg) {



               this._goUp = this._goUp || 1;
               if (this._goUp === 1 && useNativeConstructorFirst){
                  this.constructor.call(this, cfg);
               }
               /**
                * Пойдем к родительской функции-обертке, если она есть
                * Ее нет, если мы на вершине иерархии.
                */

               if (parentCtor) {
                  this._goUp++;
                  parentCtor.call(this, cfg);
               } else if (!useNativeConstructorFirst) {
                  this._initializer(propertyMerge);
                  if (cfg && typeof cfg === 'object') {
                     propertyMerge(cfg, this._options = this._options || {});
                  }
                  if (parentNativeCtor) {
                     parentNativeCtor.call(this, cfg);
                  }
               }

               /**
                * Вызов собственного конструктора
                */
               if (childCtor) {
                  /**
                   * Это честная возможность вернуть из конструктора класса что-то иное...
                   */
                  var r = childCtor.call(this, cfg);
                  if (r) {
                     return r;
                  }
               }

               --this._goUp;

               if (this._goUp === 0) {
                  if (!this._useNativeAsMain) {
                     this.init && this.init();
                     this._initComplete && this._initComplete();
                     this._isInitialized = true;
                     this._allowEvents && this._allowEvents();
                     this._constructionDone && this._constructionDone();

                     // проверяем, что init был вызван для всех предков включая Abstract
                     if (this._isAbstractInitialized === false) {
                        IoC.resolve('ILogger').error('core-extend', 'При инициализации компонента "' + (this.getName && this.getName()) + '" функция init не была вызвана для всех предков. ' +
                           'Проверьте, что для всех init вызван init предка.');
                     }
                  }
               }

               return undefined;
            };

            constructor.prototype = classPrototype.prototype;
            classResult.prototype = new constructor();

            coreInitializer.extend(classPrototype.prototype, classExtender);
            mergePropertiesToPrototype(classResult, classExtender);
            if (classExtender.destroy &&
                'isDestroyed' in classResult.prototype &&
                typeof classResult.prototype.isDestroyed === 'function') {
               classResult.prototype.destroy = forAliveOnly(classExtender.destroy);
            }

            simpleExtend._inheritStatic(classPrototype || Object, classResult);

            classResult.prototype.$constructor = classExtender.$constructor;

            classResult.extend = localExtend;
            classResult.extendPlugin = localExtendPlugin;
            classResult.mixin = localMixin;
            classResult.superclass = classPrototype.prototype;

            return classResult;
         }

      })(),
      /**
       * Расширение класса с помощью "плагина"
       * Подробное описание см. в файле EXTENDING.md
       *
       * @param {Function} classPrototype Прототип расширяемого класса
       * @param {Object} pluginConfig "Конфигурация" плагина
       */
      extendPlugin: function(classPrototype, pluginConfig) {
         var
            proto = classPrototype.prototype,
            hasPlugin = !!objectFind(proto._plugins, function(val) {
               return val === pluginConfig;
            });

         if (!hasPlugin) {
            if (!isEmptyObject(pluginConfig.$protected)) {
               proto._initializer = callNext.call(
                  proto._initializer,
                  coreInitializer.build(pluginConfig)
               );
            }

            pluginConfig.$withoutCondition = coreHash(pluginConfig.$withoutCondition || []);
            var callNextOnPlugin = function(classMethod, pluginFunction) {
               var classFunction;
               if (proto.hasOwnProperty(classMethod)) {
                  classFunction = proto[classMethod];
               } else if (classPrototype.superclass) {
                  classFunction = function() {
                     var superClassFunction = classPrototype.superclass[classMethod];
                     if (superClassFunction) {
                        return superClassFunction.apply(this, arguments);
                     }
                  };
               }
               if (classFunction) {
                  // Делаем исключение для метода destroy, сначала вызовем метод плагина
                  var method = classMethod === 'destroy' ? 'callBefore' : 'callNext';
                  if (pluginConfig.$condition && pluginConfig.$withoutCondition[classMethod] === undefined) {
                     proto[classMethod] = classFunction[method + 'WithCondition'](pluginFunction, pluginConfig.$condition);
                  } else {
                     proto[classMethod] = classFunction[method](pluginFunction);
                  }
               }
            };

            var addPluginFunction = function(functionName, pluginFunction) {
               if (proto[functionName]) {
                  callNextOnPlugin(functionName, pluginFunction);
               } else if (pluginConfig.$condition) {
                  proto[functionName] = pluginConfig.$withoutCondition[functionName] === undefined ?
                     callIf.call(pluginFunction, pluginConfig.$condition) :
                     pluginFunction;
               } else {
                  proto[functionName] = pluginFunction;
               }
            };

            for (var i in pluginConfig) {
               if (pluginConfig.hasOwnProperty(i) && !(i in {
                     '$constructor': true,
                     '$protected': true,
                     'init': true,
                     '$condition': true,
                     '$withoutCondition': true
                  })) {
                  addPluginFunction(i, pluginConfig[i]);
               }
            }
            // IE 7-8 не видит при переборе через for-in свойства valueOf и toString
            if (!detection.isModernIE) {
               var props = ['valueOf', 'toString'];
               for (i = 0; i < props.length; i++) {
                  if (pluginConfig.hasOwnProperty(props[i])) {
                     // property is redefined
                     addPluginFunction(props[i], pluginConfig[props[i]]);
                  }
               }
            }

            if (pluginConfig.$constructor) {
               callNextOnPlugin('init', pluginConfig.$constructor);
               var ControlStorage = require('Lib/Control/Control').ControlStorage;
               if (ControlStorage) {
                  var pluginConstructor = pluginConfig.$constructor,
                     controls = ControlStorage.getControls();
                  for (var id in controls) {
                     if (controls.hasOwnProperty(id)) {
                        if (controls[id] instanceof classPrototype) {
                           pluginConstructor.apply(controls[id]);
                        }
                     }
                  }
               }
            }

            proto._plugins = (proto._plugins || []).concat(pluginConfig);
         }
      },
      /**
       * Расширение класса с помощью "mixin'а"
       *
       *
       * @param {Function} classPrototype Прототип расширяемого класса
       * @param {Object|Array} mixinConfig "Конфигурация" примеси, или массив описаний нескольких примесей
       * В случае массива будут подмешаны в том порядке, в котором перечислены.
       */
      mixin: function(classPrototype, mixinConfig) {
         if (mixinConfig && Object.prototype.toString.call(mixinConfig) === '[object Object]') {
            mixinConfig = [mixinConfig];
         }
         var mixinOptions = {},
            mixinConstructor,
            l = mixinConfig.length, i,
            description = {},
            functionCollection,
            callMethod = {
               'around': callAround,
               'after': callNext,
               'before': callBefore
            };
         for (i = 0; i < l; i++) {
            description = mixinConfig[i];
            if (description.$protected) {
               mixinOptions = coreMerge(mixinOptions, description.$protected, {clone: true});
            }
            if (description.$constructor) {
               mixinConstructor = mixinConstructor ? callNext.call(mixinConstructor, description.$constructor) : description.$constructor;
            }
         }
         var mixin = coreExtend.extend(classPrototype, {
            $protected: mixinOptions,
            $constructor: mixinConstructor || function() {}
         });

         function addSpecialFunctionInIE(descriptionObject, position) {
            // IE 7-8 не видит при переборе через for-in свойства valueOf и toString
            if (!detection.isModernIE) {
               var props = ['valueOf', 'toString'];
               for (k = 0; k < props.length; k++) {
                  if (descriptionObject.hasOwnProperty(props[k]) && !(props[k] in {'$protected': 0, '$constructor': 0})) {
                     addMixinFunction(props[k], descriptionObject[props[k]], position);
                  }
               }
            }
         }

         function addMixinFunction(functionName, functionDescription, functionPosition) {
            if (typeof(functionDescription) === 'function') {
               //проверим определена ли уже функция в классе, иначе добавим
               if (functionPosition === 'instead' || typeof(mixin.prototype[functionName]) !== 'function') {
                  mixin.prototype[functionName] = functionDescription;
               } else {
                  var newFunction = callMethod[functionPosition].call(mixin.prototype[functionName], functionDescription);
                  mixin.prototype[functionName] = newFunction;
               }
            }
         }

         for (i = 0; i < l; i++) {
            description = mixinConfig[i];
            for (var k in description) {
               if (!( k in {'$protected': 0, '$constructor': 0} )) {
                  functionCollection = description[k];
                  if (functionCollection && Object.prototype.toString.call(functionCollection) === '[object Object]') {
                     for (var j in functionCollection) {
                        addMixinFunction(j, functionCollection[j], k);
                     }
                     addSpecialFunctionInIE(functionCollection, k);
                  } else {
                     addMixinFunction(k, functionCollection, 'instead');
                  }
               }
            }
            addSpecialFunctionInIE(description, 'instead');
         }

         mixin.prototype._mixins = (mixin.prototype._mixins || []).concat(mixinConfig);

         return mixin;
      }
   };

   simpleExtend.setInheritedExtend(function(mixins, overrides) {
      return coreExtend.extend(this, mixins, overrides);
   });

   coreExtend.extend.extend = coreExtend.extend;
   coreExtend.extend.mixin = coreExtend.mixin;
   coreExtend.extend.extendPlugin = coreExtend.extendPlugin;
   coreExtend.extend.classicExtend = classicExtend;

   return coreExtend.extend;
});
