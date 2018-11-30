'use strict';

const CleanCSS = require('clean-css');

const options = {
   advanced: false,
   aggressiveMerging: false,
   compatibility: 'ie8',
   inliner: false,
   keepBreaks: false,
   keepSpecialComments: '*',
   mediaMerging: false,
   processImport: false,
   rebase: false,
   restructuring: false,
   roundingPrecision: 2,
   sourceMap: false
};

function runMinifyCss(text) {
   const compiled = new CleanCSS(options).minify(text);

   let errors = [];
   if (compiled.errors.length) {
      errors = [...compiled.errors];
   }

   if (compiled.warnings.length) {
      errors = [...errors, ...compiled.warnings];
   }
   const compiledCssString = errors.length > 0 ? `/*${errors}*/` : compiled.styles;

   return {
      styles: compiledCssString,
      errors
   };
}

module.exports = runMinifyCss;
