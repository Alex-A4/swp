define('Controls/Popup/InfoBox',
   [
      'Core/Control',
      'wml!Controls/Popup/InfoBox/InfoBox',
      'Controls/Popup/Previewer/OpenerTemplate',
      'Controls/Popup/Opener/InfoBox',
      'Controls/Context/TouchContextField',
      'Controls/Utils/getZIndex'
   ],
   function(Control, template, OpenerTemplate, InfoBoxOpener, TouchContext, getZIndex) {

      'use strict';

      /**
       * Component that opens a popup that is positioned relative to a specified element. {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/wasaby/components/openers/#_4 see more}.
       *
       * @class Controls/Popup/InfoBox
       *
       * @public
       * @author Красильников А.С.
       * @demo Controls-demo/InfoBox/InfoBox
       */

      /**
       * @name Controls/Popup/InfoBox#hideDelay
       * @cfg {Number} Delay before closing after mouse leaves.
       */

      /**
       * @name Controls/Popup/InfoBox#showDelay
       * @cfg {Number} Delay before opening after mouse enters.
       */

      /**
       * @name Controls/Popup/InfoBox#position
       * @cfg {Number} Point positioning of the target relative to infobox.
       */

      /**
       * @name Controls/Popup/InfoBox#content
       * @cfg {Function} The content to which the logic of opening and closing the template is added.
       */

      /**
       * @name Controls/Popup/InfoBox#template
       * @cfg {String|Function} Popup template.
       */

      /**
       * @name Controls/Popup/InfoBox#templateOptions
       * @cfg {Object} Popup template options.
       */

      /**
       * @name Controls/Popup/InfoBox#trigger
       * @cfg {String} Event name trigger the opening or closing of the template.
       * @variant click Opening by click on the content. Closing by click not on the content or template.
       * @variant hover Opening by hover on the content. Closing by hover not on the content or template.
       * Opening is ignored on touch devices.
       * @variant hover|touch Opening by hover or touch on the content. Closing by hover not on the content or template.
       * @default hover
       */

      /**
       * @name Controls/Popup/InfoBox#float
       * @cfg {String} Whether the content should wrap around the cross closure.
       */

      /**
       * @name Controls/Popup/InfoBox#style
       * @cfg {String} Infobox display style.
       */


      var _private = {
         getCfg: function(self) {
            return {
               opener: self,
               target: self._container,
               template: OpenerTemplate,
               position: self._options.position,
               style: self._options.style,
               eventHandlers: {
                  onResult: self._resultHandler
               },
               templateOptions: {
                  content: self._options.template,
                  contentTemplateName: self._options.templateName,
                  contentTemplateOptions: self._options.templateOptions
               }
            };
         }
      };

      var InfoBox = Control.extend({
         _template: template,

         _isNewEnvironment: InfoBoxOpener.isNewEnvironment,

         _openId: null,

         _closeId: null,

         _beforeMount: function() {
            this._resultHandler = this._resultHandler.bind(this);
         },

         /**
          * TODO: https://online.sbis.ru/opendoc.html?guid=ed987a67-0d73-4cf6-a55b-306462643982
          * Кто должен закрывать инфобокс после разрушения компонента нужно будет обсудить.
          * Если компонент обрабатывающий openInfoBox и closeInfoBox, то данный код будет удален по ошибке выше.
          */
         _beforeUnmount: function() {
            if (this._opened) {
               this._notify('closeInfoBox', [], {bubbling: true});
            }
         },

         _open: function() {
            var config = _private.getCfg(this);

            if (this._isNewEnvironment()) {
               this._notify('openInfoBox', [config], {bubbling: true});
            } else {
               // To place zIndex in the old environment
               config.zIndex = getZIndex(this._children.infoBoxOpener);
               this._children.infoBoxOpener.open(config);
            }

            clearTimeout(this._openId);
            clearTimeout(this._closeId);

            this._openId = null;
            this._closeId = null;
            this._opened = true;
         },

         _close: function() {
            if (this._isNewEnvironment()) {
               this._notify('closeInfoBox', [], {bubbling: true});
            } else {
               this._children.infoBoxOpener.close();
            }

            clearTimeout(this._openId);
            clearTimeout(this._closeId);

            this._openId = null;
            this._closeId = null;
            this._opened = false;
         },

         _contentMousedownHandler: function(event) {
            this._open(event);
            event.stopPropagation();
         },

         _contentMouseenterHandler: function() {
            /**
             * On touch devices there is no real hover, although the events are triggered. Therefore, the opening is not necessary.
             */
            if (!this._context.isTouch.isTouch) {
               this._startOpeningPopup();
            }
         },

         _contentTouchStartHandler: function() {
            this._startOpeningPopup();
         },

         _startOpeningPopup: function() {
            var self = this;

            clearTimeout(this._closeId);

            this._openId = setTimeout(function() {
               self._open();
               self._forceUpdate();
            }, self._options.showDelay);
         },

         _contentMouseleaveHandler: function() {
            var self = this;

            clearTimeout(this._openId);

            this._closeId = setTimeout(function() {
               self._close();
               self._forceUpdate();
            }, self._options.hideDelay);
         },

         _mousedownHandler: function() {
            this._close();
         },

         _resultHandler: function(event) {
            switch (event.type) {
               case 'mouseenter':
                  clearTimeout(this._closeId);
                  this._closeId = null;
                  break;
               case 'mouseleave':
                  if (this._options.trigger === 'hover' || this._options.trigger === 'hover|touch') {
                     this._contentMouseleaveHandler();
                  }
                  break;
               case 'mousedown':
                  event.stopPropagation();
                  break;
            }
         },

         _scrollHandler: function() {
            this._close();
         }
      });

      InfoBox.contextTypes = function() {
         return {
            isTouch: TouchContext
         };
      };

      InfoBox.getDefaultOptions = function() {
         return {
            position: 'tl',
            showDelay: 300,
            hideDelay: 300,
            trigger: 'hover'
         };
      };

      return InfoBox;
   });
