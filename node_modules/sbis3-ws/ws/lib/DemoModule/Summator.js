define('Lib/DemoModule/Summator', function(){

   function Summator() {}

   // Сложение двух чисел
   Summator.prototype.add = function(number1, number2) {

      return number1 + number2;

   };

   // Асинхронное сложение двух чисел
   Summator.prototype.addAsync = function(number1, number2, callback) {

      callback(null, number1 + number2);

   };

   // Асинхронная функция для сложения двух чисел, получаемых из объекта
   Summator.prototype.addAsyncObject = function(objectWithNumbers, callback) {

      var number1 = objectWithNumbers.getNumber(0),
         number2 = objectWithNumbers.getNumber(1);

      callback(null, number1 + number2);

   };

   return Summator;

});