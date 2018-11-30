define('Core/helpers/String/wrapFileOpener', [
   'require',
   'Core/constants',
   'Core/helpers/openFile'
], function (
   require,
   cConstants,
   openFile
) {
   var fileOpener = {
      linkClickHandler: function(event) {
         var target = event.target || event.srcElement;
         if (target && target !== document && target.tagName !== 'HTML') {
            if (target.hasAttribute('data-open-file')) {
               var
                  file = target.getAttribute('data-open-file');
               openFile(file,'always').addErrback(function(result) {
                  result.message !== 'fromPlugin' && require(['SBIS3.CONTROLS/Utils/InformationPopupManager'], function(InformationPopupManager) {
                     InformationPopupManager.showMessageDialog({
                        status: 'error',
                        message: result.message ?  result.message : 'Файл "' + file +'" не найден'
                     });
                  });
               });
               event.preventDefault();
               event.stopImmediatePropagation();
            }
         }
      }
   };
   if (cConstants.isBrowserPlatform) {
      document.addEventListener('click', fileOpener.linkClickHandler, true);
   }
   return fileOpener;
});
