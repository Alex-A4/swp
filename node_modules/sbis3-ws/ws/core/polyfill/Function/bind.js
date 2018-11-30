/**
 * Привязывает фукнцию к заданному контексту и аргументам
 * (Почти) Аналог Function.bind из ES5.
 * @param {*} ctx Привязанный контекст исполнения.
 * @param {*} [arg...] Аргумент...
 * @returns {Function}
 * @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind
 * @author Мальцев А.А.
 * @example
 * <pre>
 *   function sum(a, b, c) {
 *     return a + b + c;
 *   }
 *   var sum10 = sum.bind(undefined, 10);
 *   alert(sum(20, 1)); // 31, == sum.apply(undefined, [ 10, 20, 1 ]);
 *
 *   function getA() {
 *      alert(this.a);
 *   }
 *   var a10 = getA.bind({ a: 10 });
 *   a10(); // 10, == getA.apply({ a : 10 }, []);
 * </pre>
 */
if (!Function.prototype.bind) {
   (function () {
      var funcSlice = Array.prototype.slice,
         funcPush = Array.prototype.push;
      Function.prototype.bind = function (ctx) {
         var f = this, args = arguments, result;
         if (args.length > 1) {
            result = function () {
               var selfArgs = funcSlice.call(args, 1);
               if (selfArgs.concat) {
                  selfArgs = selfArgs.concat(funcSlice.call(arguments));
               } else {
                  funcPush.apply(selfArgs, funcSlice.call(arguments));
               }
               return f.apply(ctx, selfArgs);
            }
         } else {
            result = function () {
               return f.apply(ctx, arguments);
            }
         }
         result.wrappedFunction = f;
         return result;
      };
   })();
}
