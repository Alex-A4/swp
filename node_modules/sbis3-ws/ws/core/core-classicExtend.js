define('Core/core-classicExtend', [], function() {
   /**
    * Классическое наследование на классах
    * @param Child - класс-наследник.
    * @param Parent - класс-родитель.
    */
   return function classicExtend(Child, Parent) {
      var F = function() {};
      F.prototype = Parent.prototype;
      Child.prototype = new F();
      Child.prototype.constructor = Child;
      Child.superclass = Parent.prototype
   };
});