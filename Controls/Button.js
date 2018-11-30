define('Controls/Button', [
   'Core/Control',
   'Controls/Button/Classes',
   'wml!Controls/Button/Button',
   'Controls/Button/validateIconStyle',
   'css!theme?Controls/Button/Button'
], function(Control, Classes, template, validateIconStyle) {
   'use strict';

   /**
    * This control native button or a elements enhanced with display styling.
    *
    * <a href="/materials/demo-ws4-buttons">Demo-example</a>.
    *
    * @class Controls/Button
    * @extends Core/Control
    * @mixes Controls/Button/interface/IHref
    * @mixes Controls/interface/ICaption
    * @mixes Controls/Button/interface/IClick
    * @mixes Controls/Button/interface/IIcon
    * @mixes Controls/interface/ITooltip
    * @control
    * @public
    * @author Михайловский Д.С.
    * @category Button
    * @demo Controls-demo/Buttons/ButtonDemoPG
    */

   /**
    * @name Controls/Button#style
    * @cfg {Enum} Button display style.
    * @variant primary
    * @variant success
    * @variant warning
    * @variant danger
    * @variant info
    * @variant secondary
    * @variant default
    * @default secondary
    * @example
    * Primary link button with xl size.
    * <pre>
    *    <Controls.Button caption="Send document" style="primary" viewMode="link" size="xl"/>
    * </pre>
    * Quick button with m size.
    * <pre>
    *    <Controls.Button caption="Send document" style="danger" viewMode="quickButton"/>
    * </pre>
    * Uncorrect button. ViewMode button doesn't support xl size.
    * <pre>
    *    <Controls.Button size="xl" caption="Send document" style="success" viewMode="button"/>
    * </pre>
    * @see Size
    */

   /**
    * @name Controls/Button#viewMode
    * @cfg {Enum} Button view mode.
    * @variant link
    * @variant button
    * @variant quickButton
    * @default button
    * @remark
    * Sizes 's' and 'xl' don't supported by viewModes:
    * <ul>
    *     <li>button,</li>
    *     <li>quickButton</li>
    * </ul>
    * @example
    * Button with link viewMode.
    * <pre>
    *    <Controls.Button caption="Send document" style="primary" viewMode="link" size="xl"/>
    * </pre>
    * Button with quickButton viewMode.
    * <pre>
    *    <Controls.Button caption="Send document" style="danger" viewMode="quickButton"/>
    * </pre>
    * Button with button viewMode.
    * <pre>
    *    <Controls.Button caption="Send document" style="success" viewMode="button"/>
    * </pre>
    * @see Size
    */

   /**
    * @name Controls/Button#size
    * @cfg {String} Button size. The value is given by common size notations.
    * @variant s Small button size.
    * @variant m Medium button size.
    * @variant l Large button size.
    * @variant xl Extra large button size.
    * @default m
    * @remark
    * Button size is different for different button styles.
    * Sizes 's' and 'xl' don't supported by styles:
    * <ul>
    *     <li>button,</li>
    *     <li>quickButton</li>
    * </ul>
    * @example
    * L size of primary button.
    * <pre>
    *    <Controls.Button caption="Send document" style="primary" viewMode="button" size="l"/>
    * </pre>
    * M size of primary button.
    * <pre>
    *    <Controls.Button caption="Send document" style="primary" viewMode="button"/>
    * </pre>
    * Uncorrect size of primary button.
    * <pre>
    *    <Controls.Button caption="Send document" style="primary" viewMode="button" size="xl"/>
    * </pre>
    * @see style
    */

   /**
    * @name Controls/Button#icon
    * @cfg {String} Button icon.
    * @default Undefined
    * @remark Icon is given by css-rules, without color class.
    * @example
    * Button with style buttonPrimary and icon Add.
    * <pre>
    *    <Controls.Button icon="icon-Add" style="primary" viewMode="button"/>
    * </pre>
    * @see iconStyle
    */

   /**
    * @name Controls/Button#iconStyle
    * @cfg {Enum} Icon display style.
    * @variant primary The display style of the attracting attention icon.
    * @variant success The display style of the success icon.
    * @variant warning The display style of the warning icon.
    * @variant danger The display style of the danger icon.
    * @variant info The display style of the danger icon.
    * @variant secondary The display style of the secondary icon.
    * @default secondary
    * @example
    * Primary button with default icon style.
    * <pre>
    *    <Controls.Button icon="icon-Add" style="primary" viewMode="button"/>
    * </pre>
    * Primary button with done icon style.
    * <pre>
    *    <Controls.Button icon="icon-Add" iconStyle="done" style="primary" viewMode="button"/>
    * </pre>
    * @see Icon
    */
   var _private = {
      cssStyleGeneration: function(self, options) {
         var currentButtonClass = Classes.getCurrentButtonClass(options.style);

         self._style = currentButtonClass.style ? currentButtonClass.style : options.style;
         self._viewMode = currentButtonClass.viewMode ? currentButtonClass.viewMode : options.viewMode;
         self._state = options.readOnly ? '_readOnly' : '';
         self._caption = options.caption;
         self._stringCaption = typeof options.caption === 'string';
         self._icon = options.icon;
         self._iconStyle = currentButtonClass.buttonAdd ? 'default' : validateIconStyle.iconStyleTransformation(options.iconStyle);
      }
   };
   var Button = Control.extend({
      _template: template,

      _beforeMount: function(options) {
         _private.cssStyleGeneration(this, options);
      },

      _beforeUpdate: function(newOptions) {
         _private.cssStyleGeneration(this, newOptions);
      },

      _keyUpHandler: function(e) {
         if (e.nativeEvent.keyCode === 13 && !this._options.readOnly) {
            this._notify('click');
         }
      },

      _clickHandler: function(e) {
         if (this._options.readOnly) {
            e.stopPropagation();
         }
      }
   });

   Button.getDefaultOptions = function() {
      return {
         style: 'secondary',
         viewMode: 'button',
         size: 'm',
         iconStyle: 'secondary'
      };
   };

   Button._private = _private;

   return Button;
});
