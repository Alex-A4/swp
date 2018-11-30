define('Core/core-simpleExtend', [
   'Core/detection'
], function(detection) {
   /**
    * Быстрое простое наследование без "сахара" (не поддерживаются инструкции $protected и $constructor, не осуществляется deep merge объектов)
    * @class Core/core-simpleExtend
    */
   var inheritedExtend = function(mixins, overrides) {
         return simpleExtend.extend(this, mixins, overrides);
      },
      simpleExtend;

   simpleExtend = /** @lends Core/core-simpleExtend.prototype */{
      isCompatibleParent: function(Parent) {
         return !Parent || (
            Parent instanceof Function &&
            Parent.prototype &&
            !Parent.prototype.$constructor
            );
      },

      isCompatibleChild: function(Child) {
         return Child &&
            !Child.$constructor &&
            !Child.$protected;
      },

      setInheritedExtend: function(extend) {
         inheritedExtend = extend;
      },

      /**
       * Наследует один класс от другого
       * @remark
       * Наследование осуществляется на основе цепочки прототипов.
       * Защищенные члены класса имеют название, начинающееся с подчеркивания:
       * <pre>
       *    var Account = simpleExtend.extend({
       *       _token: '',
       *       _getToken: function () {
       *          return this._token || (this._token = Date.now());
       *       }
       *    });
       * </pre>
       * Можно использовать инкапсуляцию реализации свойств:
       * <pre>
       *    var Account = simpleExtend.extend({
       *       _token: '',
       *       get token() {
       *          return this._token || (this._token = Date.now());
       *       }
       *    });
       *    var guest = new Account();
       *    console.log(guest.token);
       * </pre>
       * Для обеспечения возможности использовать свойства и методы родителя, в наследнике определено свойство superclass, которое ссылается на прототип родителя:
       * <pre>
       *    var Account = simpleExtend.extend({
       *       _login: '',
       *       getLogin: function () {
       *          return this._login;
       *       },
       *       setLogin: function (login) {
       *          this._login = login;
       *       }
       *    });
       *
       *    var User = Account.extend({
       *       _domain: 'localhost',
       *       getLogin: function() {
       *          return User.superclass.getLogin.call(this) + '@' + this._domain;
       *       }
       *    });
       *
       *    var mike = new User();
       *    mike.setLogin('jessica');
       *    mike.getLogin();//jessica@localhost
       * </pre>
       * Конструктор потомка определяется свойством constructor в overrides.
       * Для того, чтобы цепочка конструкторов не прерывалась, необходимо вызывать конструктор родителя:
       * <pre>
       *    var Account = simpleExtend.extend({
       *       _login: '',
       *       constructor: function (login) {
       *          this._login = login;
       *       },
       *       getLogin: function () {
       *          return this._login;
       *       }
       *    });
       *
       *    var User = Account.extend({
       *       _domain: '',
       *       constructor: function(login, domain) {
       *          User.superclass.constructor.call(this, login);
       *          this._domain = domain;
       *       },
       *       getLogin: function() {
       *          return User.superclass.getLogin.call(this) + '@' + this._domain;
       *       }
       *    });
       *
       *    var jess = new User('jessica', 'nigri.name');
       *    jess.getLogin();//jessica@nigri.name
       * </pre>
       * Примеси добавляют определенные в них свойства и методы в прототип. Если родитель имеет те же свойства и методы,
       * то они заменяются свойствами и методами примеси (тоже самое касается свойств и методов примеси, относительно
       * свойств и методов, определенных в overrides):
       * <pre>
       *    var Vehicle = simpleExtend.extend({
       *       move: function () {
       *          console.log('I\'m not able to move.');
       *       }
       *    });
       *
       *    var WheelMixin = {
       *       _wheels: 0,
       *       move: function () {
       *          console.log('I\'m roll on ' + this._wheels + ' wheels.');
       *       }
       *    };
       *
       *    var Bike = Vehicle.extend([WheelMixin], {
       *       _wheels: 2
       *    });
       *
       *    var myBike = new Bike();
       *    myBike.move();//I'm roll on 2 wheels.
       * </pre>
       * Для набора примесей свойства и методы последующих примесей перетирают свойства и методы предыдущих:
       * <pre>
       *    var Vehicle = simpleExtend.extend({
       *       move: function () {
       *          console.log('I\'m not able to move.');
       *       }
       *    });
       *
       *    var WheelMixin = {
       *       _wheels: 0,
       *       move: function () {
       *          console.log('I\'m roll on ' + this._wheels + ' wheels.');
       *       }
       *    };
       *
       *    var WingMixin = {
       *       _wings: 2,
       *       move: function () {
       *          console.log('I\'m fly with ' + this._wings + ' wings.');
       *       }
       *    };
       *
       *    var OnlyFlyingJet = Vehicle.extend([WheelMixin, WingMixin], {
       *       _wheels: 3
       *    });
       *
       *    var myJet = new OnlyFlyingJet();
       *    myJet.move();//I'm fly with 2 wings.
       * </pre>
       * Чтобы задействовать поведение всех примесей, необходимо вызывать методы  каждой из них в требуемой
       * последовательности и с требуемыми аргументами:
       * <pre>
       *    var Vehicle = simpleExtend.extend({
       *       move: function () {
       *          console.log('I\'m not able to move.');
       *       }
       *    });
       *
       *    var WheelMixin = {
       *       _wheels: 0,
       *       move: function () {
       *          console.log('I\'m roll on ' + this._wheels + ' wheels.');
       *       }
       *    };
       *
       *    var WingMixin = {
       *       _wings: 2,
       *       move: function () {
       *          console.log('I\'m fly with ' + this._wings + ' wings.');
       *       }
       *    };
       *
       *    var Jet = Vehicle.extend([WheelMixin, WingMixin], {
       *       _wheels: 3
       *       move: function () {
       *          WheelMixin.move.call(this);
       *          WingMixin.move.call(this);
       *       }
       *    });
       *
       *    var myJet = new Jet();
       *    myJet.move();//I'm roll on 3 wheels. I'm fly with 2 wings.
       * </pre>
       *
       * Известные "подводные камни":
       * 1. Если вы объявили в прототипе свойство-объект, то оно принадлежит прототипу (а значит и всем наследниками
       * вашего класса, а также всем созданным экземплярам класса и экземлпярам его наследников - т.е. считайте его
       * статическим на уровне прототипа). А это, в свою очередь, означает, что изменив какое-то поле этого объекта, вы
       * меняете его для всех наследников и всех экземпляров. Поэтому свойства-объекты лучше переопределять в конструкторе,
       * чтобы разорвать связь экземпляра с прототипом. В противном случае изменение такого свойства повлияет на все
       * унаследованные классы и их экземпляры.
       * 2. Свойства-объекты не объединяются при наследовании: если вы переопределяете свойство-объект в наследнике, то
       * вы не наследуете от него предыдущий набор свойств. Если вам требуется организовать объединение свойств-объектов, то
       * позаботьтесь об этом сами. Причем делать это надо как при объявлении наследника, так при создании экземпляра
       * класса (если экземпляр принимает в конструкторе аргументом часть набора полей свойства-объекта).
       *
       * @param {Function} Parent Конструктор родителя
       * @param {Array.<Object>} mixins Миксины
       * @param {Object} overrides Переназначенные свойства и методы
       * @return {Function} Конструктор потомка
       * @static
       */
      extend: function (Parent, mixins, overrides) {
         if (!(Parent instanceof Function)) {
            overrides = mixins;
            mixins = Parent;
            Parent = Object;
         }
         if (!(mixins instanceof Array)) {
            overrides = mixins;
            mixins = undefined;
         }

         if (!overrides) {
            overrides = {};
         }
         if (!overrides.hasOwnProperty('constructor')) {
            overrides.constructor = function () {
               if (Parent !== overrides.constructor) {
                  Parent.apply(this, arguments);
               }
            };
         }

         var Child = overrides.constructor,
            Proxy = function () {};
         Proxy.prototype = Parent.prototype;
         Child.prototype = new Proxy();
         Child.superclass = Parent.prototype;

         if (mixins) {
            for (var i = 0, count = mixins.length; i < count; i++) {
               this._mixin(Child.prototype, mixins[i]);
            }
         }

         this._override(Child.prototype, overrides);

         this._inheritStatic(Parent, Child);
         Child.extend = inheritedExtend;

         return Child;
      },

      /**
       * Добавляет примесь в прототип
       * @param {Object} target Прототип модуля
       * @param {Object} mixin Примесь
       * @protected
       * @static
       */
      _mixin: function (target, mixin) {
         if (mixin instanceof Object) {
            if (!target.hasOwnProperty('_mixins')) {
               target._mixins = target._mixins ? target._mixins.slice() : [];
            }
            target._mixins.push(mixin);

            var inject = function(key) {
               Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(mixin, key));
            };

            Object.getOwnPropertyNames(mixin).forEach(inject);
            if (Object.getOwnPropertySymbols) {
               Object.getOwnPropertySymbols(mixin).forEach(inject);
            }

            this._checkIgnoredPropertiesInIE(target, mixin);
         }
      },

      /**
       * Перезаписывает свойства одного объекта свойствами другого
       * @param {Object} target Объект, в который пишем
       * @param {Object} source Объект, из которого получаем
       * @protected
       * @static
       */
      _override: function (target, source) {
         if (source instanceof Object) {
            Object.getOwnPropertyNames(source).forEach(function(key) {
               Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
            });
            if (Object.getOwnPropertySymbols) {
               Object.getOwnPropertySymbols(source).forEach(function(symbol) {
                  Object.defineProperty(target, symbol, Object.getOwnPropertyDescriptor(source, symbol));
               });
            }
            this._checkIgnoredPropertiesInIE(target, source);
         }
      },

      /**
       * Наследует в потомке статические свойства и методы родителя
       * @param {Function} Parent Конструктор родителя
       * @param {Function} Child Конструктор потомка
       * @protected
       * @static
       */
      _inheritStatic: function (Parent, Child) {
         //Don't inherit from plain object
         if (Parent === Object) {
            return;
         }

         var keys = Object.getOwnPropertyNames(Parent),
            key,
            count,
            i;
         for (i = 0, count = keys.length; i < count; i++) {
            key = keys[i];
            switch (key) {
               case 'length':
               case 'caller':
               case 'arguments':
               case 'superclass':
               case 'extend':
               case 'beforeExtend':
               case 'toJSON':
                  //Skip some valuable keys
                  break;
               default:
                  if (!Child.hasOwnProperty(key)) {
                     Object.defineProperty(Child, key, Object.getOwnPropertyDescriptor(Parent, key));
                  }
            }
         }
      },

      /**
       * Проверяет проброс свойств, которые IE<9 пропускает при переборе в for in
       * @param {Object} target Объект, в который пишем
       * @param {Object} source Объект, из которого получаем
       * @protected
       * @static
       */
      _checkIgnoredPropertiesInIE: function(target, source) {
         if (detection.isModernIE) {
            return;
         }
         var props = ['constructor', 'valueOf', 'toString'],
            name,
            i;
         for (i = 0; i < props.length; i++) {
            name = props[i];
            if (source.hasOwnProperty(name)) {
               target[name] = source[name];
            }
         }
      }
   };

   return simpleExtend;
});