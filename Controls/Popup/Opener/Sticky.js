define('Controls/Popup/Opener/Sticky',
   [
      'Controls/Popup/Opener/BaseOpener',
      'Core/core-merge'
   ],
   function(Base, coreMerge) {
      /**
       * Component that opens a popup that is positioned relative to a specified element. {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/wasaby/components/openers/#sticky See more}.
       * @class Controls/Popup/Opener/Sticky
       * @mixes Controls/interface/IStickyOptions
       * @control
       * @author Красильников А.С.
       * @category Popup
       * @public
       */
      var Sticky = Base.extend({

         /**
          * Open sticky popup.
          * @function Controls/Popup/Opener/Sticky#open
          * @param {Object} popupOptions Sticky popup options.
          * @returns {Undefined}
          * @remark {@link https://wi.sbis.ru/docs/js/Controls/interface/IStickyOptions#popupOptions popupOptions}
          * @example
          * wml
          * <pre>
          *    <Controls.Popup.Opener.Sticky name="sticky">
          *       <ws:popupOptions template="Controls-demo/Popup/TestDialog">
          *          <ws:verticalAlign side="bottom"/>
          *          <ws:horizontalAlign side="left"/>
          *          <ws:corner vertical="bottom" horizontal="left"/>
          *       </ws:popupOptions>
          *   </Controls.Popup.Opener.Sticky>
          *
          *   <div name="target">{{_text}}</div>
          *
          *   <Controls.Button name="openStickyButton" caption="open sticky" on:click="_open()"/>
          *   <Controls.Button name="closeStickyButton" caption="close sticky" on:click="_close()"/>
          * </pre>
          * js
          * <pre>
          *    Control.extend({
          *       ...
          *
          *       _open() {
          *          var popupOptions = {
          *              target: this._children.target,
          *              opener: this._children.openStickyButton,
          *              templateOptions: {
          *                  record: this._record
          *              }
          *          }
          *          this._children.sticky.open(popupOptions);
          *      }
          *
          *      _close() {
          *          this._children.sticky.close()
          *      }
          *      ...
          *    });
          * </pre>
          * @see close
          */
         open: function(config) {
            config.isDefaultOpener = config.isDefaultOpener !== undefined ? config.isDefaultOpener : true;
            this._setCompatibleConfig(config);
            Base.prototype.open.call(this, config, 'Controls/Popup/Opener/Sticky/StickyController');
         },

         _setCompatibleConfig: function(config) {
            config._type = 'sticky'; //for compoundArea
         }
      });

      Sticky.getDefaultOptions = function() {
         return coreMerge(Base.getDefaultOptions(), {});
      };
      return Sticky;
   }
);

/**
 * @name Controls/Popup/Opener/Sticky#closePopupBeforeUnmount
 * @cfg {Boolean} closePopupBeforeUnmount Determines whether to close the popup when the component is destroyed.
 */

/**
 * @name Controls/Popup/Opener/Sticky#targetTracking
 * @cfg {Boolean} targetTracking Determines whether popup position update when scrolling the area with the opener.
*/

/**
 * @name Controls/Popup/Opener/Sticky#closeOnTargetScroll
 * @cfg {Boolean} closeOnTargetScroll Determines whether closing of the popup when scrolling area with the opener.
 */

/**
 * @name Controls/Popup/Opener/Sticky#close
 * @description Close sticky popup.
 * @function
 * @returns {Undefined}
 * @example
 * wml
 * <pre>
 *    <Controls.Popup.Opener.Sticky name="sticky">
 *       <ws:popupOptions template="Controls-demo/Popup/TestDialog">
 *          <ws:verticalAlign side="bottom"/>
 *          <ws:horizontalAlign side="left"/>
 *          <ws:corner vertical="bottom" horizontal="left"/>
 *       </ws:popupOptions>
 *    </Controls.Popup.Opener.Sticky>
 *
 *    <div name="target">{{_text}}</div>
 *
 *    <Controls.Button name="openStickyButton" caption="open sticky" on:click="_open()"/>
 *    <Controls.Button name="closeStickyButton" caption="close sticky" on:click="_close()"/>
 * </pre>
 * js
 * <pre>
 *   Control.extend({
 *      ...
 *
 *      _open() {
 *          var popupOptions = {
 *              target: this._children.target,
 *              opener: this._children.openStickyButton,
 *              templateOptions: {
 *                  record: this._record
 *              }
 *          }
 *          this._children.sticky.open(popupOptions);
 *      }
 *
 *      _close() {
 *          this._children.sticky.close()
 *      }
 *      ...
 *  });
 *  </pre>
 *  @see open
 */

/**
 * @name Controls/Popup/Opener/Sticky#isOpened
 * @description Popup opened status.
 * @function
 */
