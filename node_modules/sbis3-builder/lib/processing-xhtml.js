'use strict';

const helpers = require('../lib/helpers'),
   transliterate = require('../lib/transliterate');

const DoT = global.requirejs('Core/js-template-doT');

// замены, которые нужны для поддержки ядра WS.
// костыль в /ws/ext/requirejs/config.js
const requireJsSubstitutions = new Map([

   // splittedCore == true
   ['WS.Core/lib/', 'Lib/'],
   ['WS.Core/core/', 'Core/'],
   ['WS.Deprecated/', 'Deprecated/'],

   // splittedCore == false
   ['ws/lib/', 'Lib/'],
   ['ws/core/', 'Core/'],
   ['ws/deprecated/', 'Deprecated/']
]);

function buildXhtml(text, relativeFilePath) {
   const prettyRelativeFilePath = helpers.removeLeadingSlash(helpers.prettifyPath(relativeFilePath));
   let currentNode = prettyRelativeFilePath.replace(/\.xhtml$/g, '');
   for (const pair of requireJsSubstitutions) {
      if (currentNode.startsWith(pair[0])) {
         currentNode = currentNode.replace(pair[0], pair[1]);
         break;
      }
   }

   // currentNode может содержать пробелы. Нужен transliterate
   currentNode = transliterate(`html!${currentNode}`);

   const config = DoT.getSettings();

   const template = DoT.template(text, config);
   const contents =
      `define("${currentNode}",function(){` +
      `var f=${template.toString().replace(/[\n\r]/g, '')};` +
      'f.toJSON=function(){' +
      `return {$serialized$:"func", module:"${currentNode}"}` +
      '};return f;});';
   return {
      nodeName: currentNode,
      text: contents
   };
}

module.exports = {
   buildXhtml
};
