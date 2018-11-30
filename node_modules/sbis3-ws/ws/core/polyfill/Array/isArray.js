if (!Array.isArray) {
   Array.isArray = function (arr) {
      return !!(
      arr && typeof(arr) === 'object' &&
      Object.prototype.toString.call(arr) === '[object Array]' &&
      Object.getPrototypeOf(arr) === Array.prototype
      );
   };
}
