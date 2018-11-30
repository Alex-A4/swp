/**
 * Created by rn.kondakov on 23.10.2018.
 */
define('Controls/Decorator/Markup/resolvers/linkDecorate', [
   'Core/base64',
   'Core/constants'
], function(base64,
   cConstants) {
   'use strict';

   /**
    *
    * Module with a function to replace common link on decorated link, if it needs.
    * Tag resolver for {@link Controls/Decorator/Markup}.
    *
    * @class Controls/Decorator/Markup/resolvers/highlight
    * @public
    * @author Кондаков Р.Н.
    */
   return function linkDecorate(value, parent) {
      // Decorate tag "a" only.
      if (!Array.isArray(value) || Array.isArray(value[0]) || value[0] != 'a') {
         return value;
      }

      // Decorate link right inside paragraph.
      if (!parent || parent[0] != 'p') {
         return value;
      }

      // Decorate link only with text == href, and href length should be less then 1500;
      if (!value[1] || !value[1].href || value[1].length >= 1500 || value[1].href != value[2]) {
         return value;
      }

      // Decorate link just in the end of paragraph.
      var last = parent.length - 1;
      if (value !== parent[last] && value !== parent[last - 1]) {
         return value;
      }
      if (parent[last] !== value && (Array.isArray(parent[last]) || /[^ \u00a0]/.test(parent[last]))) {
         return value;
      }

      var linkAttrs = {};
      for (var key in value[1]) {
         if (value[1].hasOwnProperty(key)) {
            linkAttrs[key] = value[1][key];
         }
      }
      linkAttrs.class = (linkAttrs.class ? linkAttrs.class + ' ' : '') + 'LinkDecorator__linkWrap';
      linkAttrs.href = linkAttrs.href.replace(/\\/g, '/');

      var image = cConstants.decoratedLinkService ? ((typeof location === 'object' ? location.origin : '') + cConstants.decoratedLinkService) : '' +
         '?method=LinkDecorator.DecorateAsSvg&params=' + encodeURIComponent(base64.encode('{"SourceLink":"' + linkAttrs.href + '"}')) + '&id=0&srv=1';

      return ['span',
         { 'class': 'LinkDecorator__wrap' },
         ['a',
            linkAttrs,
            ['img',
               { 'class': 'LinkDecorator__image', alt: linkAttrs.href, src: image }
            ]
         ]
      ];
   };
});
