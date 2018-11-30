/**
 * Created by am.gerasimov on 13.12.2017.
 */
define('ControlsSandbox/TestSuggest/TestSuggest',
   [
      'Core/Control',
      'tmpl!ControlsSandbox/TestSuggest/TestSuggest'
   ],
   function(Control, template) {
      
      'use strict';
      
      var TestSuggest = Control.extend({
         _template: template
      });
      
      return TestSuggest;
   }
);