/**
 * Created by dv.zuev on 25.12.2017.
 */
define('Controls/Application',
   [
      'Core/Control',
      'Core/detection',
      'wml!Controls/Application/Page',
      'Core/Deferred',
      'Core/BodyClasses',
      'Core/constants',
      'Core/compatibility',
      'Controls/Application/AppData',
      'Controls/Container/Scroll/Context',
      'Controls/Application/HeadDataContext',
      'Controls/Application/LinkResolver',
      'Core/Themes/ThemesController',
      'Core/ConsoleLogger',
      'css!theme?Controls/Application/Application'
   ],

   /**
    * Root component for WS applications. Creates basic html page.
    *
    * @class Controls/Application
    * @extends Core/Control
    * @control
    * @public
    * @author Зуев Д.В.
    */

   /**
    * @name Controls/Application#staticDomains
    * @cfg {Number} The list of domains for distributing static resources. These domains will be used to create paths
    * for static resources and distribute downloading for several static domains.
    * There will be another way to propagate this data after this problem:
    * https://online.sbis.ru/opendoc.html?guid=d4b76528-b3a0-4b9d-bbe8-72996d4272b2
    */

   function(Base,
      detection,
      template,
      Deferred,
      BodyClasses,
      constants,
      compatibility,
      AppData,
      ScrollContext,
      HeadDataContext,
      LinkResolver,
      ThemesController) {
      'use strict';

      var _private,
         DEFAULT_DEBUG_CATALOG = 'debug/';

      _private = {

         /**
          * Перекладываем опции или recivedState на инстанс
          * @param self
          * @param cfg
          * @param routesConfig
          */
         initState: function(self, cfg) {
            self.title = cfg.title;
            self.templateConfig = cfg.templateConfig;
            self.compat = cfg.compat || false;
         },
         calculateBodyClasses: function() {
            // Эти классы вешаются в двух местах. Разница в том, что BodyClasses всегда возвращает один и тот же класс,
            // а TouchDetector реагирует на изменение состояния.
            // Поэтому в Application оставим только класс от TouchDetector

            var bodyClasses = BodyClasses().replace('ws-is-touch', '').replace('ws-is-no-touch', '');

            if (detection.isMobileIOS) {
               bodyClasses += ' ' + this._scrollingClass;
            }

            return bodyClasses;
         },

         getPopupConfig: function(config) {
            var def = new Deferred();

            // Find opener for Infobox
            if (!config.opener) {
               requirejs(['Vdom/Utils/DefaultOpenerFinder'], function(DefaultOpenerFinder) {
                  config.opener = DefaultOpenerFinder.find(config.target);
                  def.callback(config);
               });
               return def;
            }

            return def.callback(config);
         }
      };
      var Page = Base.extend({
         _template: template,

         /**
          * @type {String} Property controls whether or not touch devices use momentum-based scrolling for inner scrollable areas.
          * @private
          */
         _scrollingClass: 'controls-Scroll_webkitOverflowScrollingTouch',

         _getChildContext: function() {
            return {
               ScrollData: this._scrollData
            };
         },

         _scrollPage: function(ev) {
            this._children.scrollDetect.start(ev);
         },

         _resizePage: function(ev) {
            this._children.resizeDetect.start(ev);
         },
         _mousedownPage: function(ev) {
            this._children.mousedownDetect.start(ev);
         },
         _mousemovePage: function(ev) {
            this._children.mousemoveDetect.start(ev);
         },
         _mouseupPage: function(ev) {
            this._children.mouseupDetect.start(ev);
         },
         _touchmovePage: function(ev) {
            this._children.touchmoveDetect.start(ev);
         },
         _touchendPage: function(ev) {
            this._children.touchendDetect.start(ev);
         },
         _touchclass: function() {
            // Данный метод вызывается из вёрстки, и при первой отрисовке еще нет _children (это нормально)
            // поэтому сами детектим touch с помощью compatibility
            return this._children.touchDetector
               ? this._children.touchDetector.getClass()
               : compatibility.touch
                  ? 'ws-is-touch'
                  : 'ws-is-no-touch';
         },

         /**
          * Код должен быть вынесен в отдельных контроллер в виде хока в 610.
          * https://online.sbis.ru/opendoc.html?guid=2dbbc7f1-2e81-4a76-89ef-4a30af713fec
          */
         _popupCreatedHandler: function() {
            this._isPopupShow = true;

            this._changeOverflowClass();
         },

         _popupDestroyedHandler: function(event, element, popupItems) {
            if (popupItems.getCount() === 0) {
               this._isPopupShow = false;
            }

            this._changeOverflowClass();
         },

         _suggestStateChangedHandler: function(event, state) {
            this._isSuggestShow = state;

            this._changeOverflowClass();
         },

         /** ************************************************** */

         _changeOverflowClass: function() {
            if (this._isPopupShow || this._isSuggestShow) {
               this._scrollingClass = 'controls-Scroll_webkitOverflowScrollingAuto';
            } else {
               this._scrollingClass = 'controls-Scroll_webkitOverflowScrollingTouch';
            }
         },

         _beforeMount: function(cfg, context, receivedState) {
            var self = this,
               def = new Deferred();

            self._scrollData = new ScrollContext({ pagingVisible: false });

            self.onServer = typeof window === 'undefined';
            self.isCompatible = cfg.compat || self.compat;
            _private.initState(self, receivedState || cfg);
            if (!receivedState) {
               receivedState = {};
            }
            self.application = (context.AppData ? context.AppData.application : cfg.application);
            self.buildnumber = (context.AppData ? context.AppData.buildnumber : '');
            self.appRoot = cfg.appRoot ? cfg.appRoot : (context.AppData ? context.AppData.appRoot : '/');
            self.wsRoot = receivedState.wsRoot || (context.AppData ? context.AppData.wsRoot : cfg.wsRoot);
            self.resourceRoot = receivedState.resourceRoot || (context.AppData ? context.AppData.resourceRoot : cfg.resourceRoot);
            if (self.resourceRoot[self.resourceRoot.length - 1] !== '/') {
               self.resourceRoot = self.resourceRoot + '/';
            }
            self.RUMEnabled = cfg.RUMEnabled ? cfg.RUMEnabled : (context.AppData ? context.AppData.RUMEnabled : '');
            self.pageName = cfg.pageName ? cfg.pageName : (context.AppData ? context.AppData.pageName : '');
            self.staticDomains = receivedState.staticDomains || (context.AppData ? context.AppData.staticDomains : cfg.staticDomains) || [];
            self.lite = receivedState.lite || (context.AppData ? context.AppData.lite : cfg.lite) || false;
            self.product = receivedState.product || (context.AppData ? context.AppData.product : cfg.product);
            self.lite = receivedState.lite || (context.AppData ? context.AppData.lite : cfg.lite);
            self.servicesPath = receivedState.servicesPath || (context.AppData ? context.AppData.servicesPath : cfg.servicesPath) || '/service/';
            self.BodyClasses = _private.calculateBodyClasses;

            self.linkResolver = new LinkResolver(context.headData.isDebug,
               self.buildnumber,
               self.wsRoot,
               self.appRoot,
               self.resourceRoot);

            // LinkResolver.getInstance().init(context.headData.isDebug, self.buildnumber, self.appRoot, self.resourceRoot);

            context.headData.pushDepComponent(self.application, false);

            if (receivedState.csses && !context.headData.isDebug) {
               ThemesController.getInstance().initCss({
                  themedCss: receivedState.csses.themedCss,
                  simpleCss: receivedState.csses.simpleCss
               });
            }

            if (receivedState && context.AppData) {
               context.AppData.buildnumber = self.buildnumber;
               context.AppData.wsRoot = self.wsRoot;
               context.AppData.lite = self.lite;
               context.AppData.appRoot = self.appRoot;
               context.AppData.resourceRoot = self.resourceRoot;
               context.AppData.application = self.application;
               context.AppData.servicesPath = self.servicesPath;
               context.AppData.product = self.product;
               context.AppData.staticDomains = self.staticDomains;
            }

            /**
             * Этот перфоманс нужен, для сохранения состояния с сервера, то есть, cfg - это конфиг, который нам прийдет из файла
             * роутинга и с ним же надо восстанавливаться на клиенте.
             */
            def.callback({
               application: self.application,
               buildnumber: self.buildnumber,
               lite: self.lite,
               csses: ThemesController.getInstance().getCss(),
               title: self.title,
               appRoot: self.appRoot,
               staticDomains: self.staticDomains,
               wsRoot: self.wsRoot,
               resourceRoot: self.resourceRoot,
               templateConfig: self.templateConfig,
               servicesPath: self.servicesPath,
               compat: self.compat,
               product: self.product
            });
            return def;
         },

         _openInfoBoxHandler: function(event, config) {
            var self = this;
            this._activeInfobox = event.target;
            _private.getPopupConfig(config).addCallback(function(popupConfig) {
               self._children.infoBoxOpener.open(popupConfig);
            });
         },

         _closeInfoBoxHandler: function(event) {
            if (this._activeInfobox === event.target) {
               this._activeInfobox = null;
               this._children.infoBoxOpener.close();
            }
         },

         _openPreviewerHandler: function(event, config, type) {
            this._children.previewerOpener.open(config, type);
         },

         _closePreviewerHandler: function(event, type) {
            this._children.previewerOpener.close(type);
         },

         _keyPressHandler: function(event) {
            if (this._isPopupShow) {
               if (constants.browser.safari) {
                  // Need to prevent default behaviour if popup is opened
                  // because safari escapes fullscreen mode on 'ESC' pressed
                  // TODO https://online.sbis.ru/opendoc.html?guid=5d3fdab0-6a25-41a1-8018-a68a034e14d9
                  if (event.nativeEvent && event.nativeEvent.keyCode === 27) {
                     event.preventDefault();
                  }
               }
            }
         },

         _cancelPreviewerHandler: function(event, action) {
            this._children.previewerOpener.cancel(action);
         }
      });


      Page.contextTypes = function contextTypes() {
         return {
            AppData: AppData,
            headData: HeadDataContext
         };
      };

      return Page;
   });
