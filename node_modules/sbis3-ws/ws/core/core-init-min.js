define('Core/core-init-min', [
   'Core/patchRequireJS',
   'Core/nativeExtensions',
   'Core/apply-contents',
   'Core/cookie',
   'Core/BodyClasses',
   'Core/Deferred',
   'Core/constants',
   'Core/compatibility',
   'Core/core-config-min',
   'Core/Context',
   'Core/ConsoleLogger',
   'Core/polyfill/PromiseAPIDeferred',
   'is!browser?Lib/Control/CompoundControl/CompoundControl',
   'Transport/RPCJSON'
], function(
   patchRequireJS,
   nativeExtensions,
   applyContents,
   cookie,
   BodyClasses,
   Deferred,
   _const,
   compatibility
) {
   function resolveThemeName() {
     var href = location.href;
     if (~href.indexOf('carry.html') || ~href.indexOf('carry_minimal.html')) {
       return 'carry';
     }
     else if (~href.indexOf('newpresto') || ~href.indexOf('presto.html')) {
       return 'presto';
     }
     else if (~href.indexOf('booking.html')) {
       return 'carrynew';
     }
     //TODO: временно не резолвим тему клауда. для здоровья клауда
     else if (~href.indexOf('cloud.html')) {
       return null;
     }
     else if (~href.indexOf('genie')) {
       return null;
     }
     else {
       return null;
     }
   }

   var
      _touchPrivate = {
         moveInRow: 1,

         //При инициализации необходимо корректно проставить значение, далее значение определяется в зависимости от событий
         state: compatibility.touch,

         lastState: undefined,

         touchHandler: function() {
            _touchPrivate.state = true;
            _touchPrivate.moveInRow = 0;
            _touchPrivate.updateClasses();
         },

         moveHandler: function() {
            if (_touchPrivate.moveInRow > 0) {
               _touchPrivate.state = false;
            }
            _touchPrivate.moveInRow++;
            _touchPrivate.updateClasses();
         },

         updateClasses : function() {
            if (_touchPrivate.state !== _touchPrivate.lastState) {
               $('body').removeClass('ws-is-touch ws-is-no-touch');
               $('body').addClass(_touchPrivate.state ? 'ws-is-touch' : 'ws-is-no-touch');
               _touchPrivate.lastState = _touchPrivate.state;
            }
         }
      };

   function coreInitialization() {

      var ready = Deferred.success(true);

      if (window) {
         Error.stackTraceLimit && (Error.stackTraceLimit = 40);

         // Шилов Д.А. Убрал проверку на jquery, jquery-cookie
         // Все равно без них не стартанем, а кому надо подключит сам
         // Убрал wi_scheme и core.css
         // Кому нужны подключит сам в шаблоне
         ready.addCallback(function() {
            _const.$win = $(window);
            _const.$doc = $(document);
         }).addCallback(function() {
           var themeName = resolveThemeName();
           var config = window.wsConfig;
           if (config) {
               if (config.themeName && !themeName) {
                  themeName = config.themeName;
               }
           }

           // Сообщаем серверу о нашей теме
           // На /auth/ ставится кука на текущий path, а ПП читает куку с корня. поэтому такие манипуляции

            // cookie.set('thmname', null) должен удалять куку, но в IE11 этого не происходит,
            // поэтому сначала присвоим в нее пустую строку,
            // $.removeCookie в хроме не работает
            // возможно новый jquery полечит

            if (themeName) {
               cookie.set('thmname', themeName, {path: '/'});
               cookie.set('thmname', themeName);
            }
            else {
               cookie.set('thmname', '', {path: '/'});
               cookie.set('thmname', null, {path: '/'});
               cookie.set('thmname', '', themeName);
               cookie.set('thmname', null, themeName);
            }

            // Сообщаем серверу о нашей timezone
            cookie.set('tz', null);//remove current value, it can be set not on to '/' path

            /**
             * Время жизни куки в 30 дней, иначе она будет сбрасываться при закрытии браузера.
             * Значение указывается в днях, см. недокументированные возможности cookie.set в 'Core/cookie':78
             */
            cookie.set('tz', new Date().getTimezoneOffset(), {
               path: '/',
               expires: 30
            });

            // Заставляем перерисовать контент
            _const.$win.bind('orientationchange', function() {
               _const.$win.trigger('resize');
            });
         }).addCallback(function() {
            _const.$doc.ready(function applySpecificCssClasses() {
               var
                  body = $('body'),
                  classes = BodyClasses();

               if (classes.length) {
                  body.addClass(classes);
               }

               _const.$body = body;
            });
         }).addCallback(function() {
            //TODO: временное решение. В зависимостях Core/core-extensions быть не должно, т.к. он зависит от WS/Data.
            var def = new Deferred();
            require(['Core/core-extensions'], function(cExtensionsInit) {
               if (cExtensionsInit instanceof Deferred) {
                  def.dependOn(cExtensionsInit);
               } else {
                  def.callback(cExtensionsInit);
               }
            });
            return def;
         }).addCallback(function(){

            //TODO: Решение с ws-is-touch ws-is-no-touch для не VDOM страниц
            if (document && document.body) {
               _touchPrivate.updateClasses(); // страховочное действие при инициализации страницы
               document.body.addEventListener('mousemove', _touchPrivate.moveHandler);
               document.body.addEventListener('touchstart', _touchPrivate.touchHandler);
            }
         });
      }

      return ready;
   }

   patchRequireJS();

   coreInitialization.applyContents = applyContents;
   coreInitialization.nativeExtensions = nativeExtensions;

   return coreInitialization();
});
