define('Core/s3ds', ['Core/cookie', 'Core/helpers/Function/debounce'], function(cookie, debounce) {
   function setS3DSCookie() {

      //В screen, лежат реальные размеры экрана, а не размер окна браузера. screen.width и screen.height
      //поддерживается всеми браузерами https://developer.mozilla.org/en-US/docs/Web/API/Screen/
      var dimensions = [
         window.screen.width,
         window.screen.height,
         window.innerWidth,
         window.innerHeight,
         window.outerWidth,
         window.outerHeight
      ];
      cookie.set('s3ds', dimensions.join('|'), {
         path: '/',
         expires: 365
      });
   }

   if (window) {
      setS3DSCookie();

      //Навешиваем обработчик на window, чтобы при перезагрузке кука обновлялась.
      window.addEventListener('resize', debounce(setS3DSCookie, 200));
      window.addEventListener('beforeunload', setS3DSCookie);
   }
});