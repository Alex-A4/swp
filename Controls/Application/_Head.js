define('Controls/Application/_Head',
   [
      'Core/Control',
      'Core/Deferred',
      'wml!Controls/Application/_Head',
      'Controls/Application/HeadDataContext',
      'Core/Themes/ThemesController',
      'Controls/Application/HeadDataContext'
   ],
   function(Base, Deferred, template, HeadDataContext, ThemesController) {
      'use strict';

      // Component for <head> html-node, it contents all css depends

      var Page = Base.extend({
         _template: template,
         _beforeMountLimited: function() {
            // https://online.sbis.ru/opendoc.html?guid=252155de-dc95-402c-967d-7565951d2061
            // This component awaits completion of building content of _Wait component
            // So we don't need timeout of async building in this component
            // Because we need to build depends list in any case
            // before returning html to client
            return this._beforeMount.apply(this, arguments);
         },
         _beforeMount: function(options, context, receivedState) {
            ThemesController.getInstance().setUpdateCallback(function() {
               var csses = ThemesController.getInstance().getCss();
               this.themedCss = csses.themedCss;
               this.simpleCss = csses.simpleCss;
               this._forceUpdate();
            }.bind(this));
            if (typeof window !== 'undefined') {
               var csses = ThemesController.getInstance().getCss();
               this.themedCss = csses.themedCss;
               this.simpleCss = csses.simpleCss;
               return;
            }
            if (typeof options.staticDomains === 'string') {
               this.staticDomainsStringified = options.staticDomains;
            } else if (options.staticDomains instanceof Array) {
               this.staticDomainsStringified = JSON.stringify(options.staticDomains);
            } else {
               this.staticDomainsStringified = '[]';
            }
            var def = context.headData.waitAppContent();
            var self = this;
            var innerDef = new Deferred();
            self.cssLinks = [];
            def.addCallback(function(res) {
               self.themedCss = res.css.themedCss;
               self.simpleCss = res.css.simpleCss;
               self.errorState = res.errorState;
               innerDef.callback(true);
               return res;
            });
            return innerDef;
         },
         isArrayHead: function() {
            return Array.isArray(this._options.head);
         },
         isMultiThemes: function() {
            return Array.isArray(this._options.theme);
         },
         getCssWithTheme: function(value, theme) {
            return value.replace('.css', '') + '_' + theme + '.css';
         }
      });
      Page.contextTypes = function() {
         return {
            headData: HeadDataContext
         };
      };
      return Page;
   }
);
