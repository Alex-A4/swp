define('Controls/Button/Menu',
   [
      'Core/Control',
      'wml!Controls/Button/Menu/Menu',
      'Controls/Button/Menu/MenuUtils',
      'css!Controls/Button/Menu/Menu',
      'Controls/Button'
   ],
   function(Control, template, MenuUtils) {

      /**
       * MenuButton
       * @class Controls/Button/Menu
       * @extends Core/Control
       * @mixes Controls/interface/ICaption
       * @mixes Controls/Button/interface/IIcon
       * @mixes Controls/interface/ITooltip
       * @mixes Controls/interface/ISource
       * @mixes Controls/interface/IItemTemplate
       * @mixes Controls/interface/IDropdown
       * @mixes Controls/interface/IGroupedView
       * @control
       * @public
       * @author Михайловский Д.С.
       * @category Button
       * @demo Controls-demo/Dropdown/MenuVdom
       */

      'use strict';

      /**
       * @event Controls/Button/Menu#onMenuItemActivate Occurs when an item is selected from the list.
       */

      /**
       * @name Controls/Button/Menu#size
       * @cfg {String} Size of the menu button.
       * @variant s Button has s size. Not supported by these button styles: buttonPrimary, buttonDefault, buttonAdd, iconButtonBordered.
       * @variant m Button has m size.
       * @variant l Button has l size.
       * @variant xl Button has xl size. Not supported by these button styles: buttonPrimary, buttonDefault, buttonAdd, iconButtonBordered.
       */

      /**
       * @name Controls/Button/Menu#style
       * @cfg {String} Display style of menu button.
       * @variant iconButtonBordered Button display as icon with border.
       * @variant linkMain Button display as main link style.
       * @variant linkMain2 Button display as first nonaccent link style.
       * @variant linkMain3 Button display as second nonaccent link style.
       * @variant linkAdditional Button display as third nonaccent link style.
       * @variant linkAdditional2 Button display as first accent link style.
       * @variant linkAdditional3 Button display as second accent link style.
       * @variant linkAdditional4 Button display as third accent link style.
       * @variant linkAdditional5 Button display as fourth accent link style.
       * @variant buttonPrimary Button display as primary contour button style.
       * @variant buttonDefault Button display as default contour button style.
       * @variant buttonAdd Button display as button with icon add style.
       */

      var Menu = Control.extend({
         _template: template,
         _filter: null,

         _beforeMount: function(options) {
            this._offsetClassName = MenuUtils.cssStyleGeneration(options);
            this._filter = options.filter;
         },

         _beforeUpdate: function(options) {
            this._offsetClassName = MenuUtils.cssStyleGeneration(options);
         },

         _onItemClickHandler: function(event, result) {
            this._notify('onMenuItemActivate', [result[0]]);
         }

      });

      Menu.getDefaultOptions = function() {
         return {
            showHeader: true,
            style: 'buttonDefault',
            size: 'm',
            filter: {}
         };
      };

      return Menu;
   }
);
