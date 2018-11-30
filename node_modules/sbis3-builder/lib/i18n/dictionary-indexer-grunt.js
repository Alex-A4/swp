'use strict';

const helpers = require('../../lib/helpers'),
   transliterate = require('../../lib/transliterate'),
   path = require('path');

const cssHelpers = require('../../packer/lib/css-helpers');
const resolveUrl = cssHelpers.rebaseUrls;
const { bumpImportsUp } = cssHelpers;

// Формирует ключ вида Папка.язык.расширение
function getDirectoryKey(modulePath, locale, ext) {
   const moduleName = transliterate(path.basename(modulePath));
   return `${moduleName}.${locale}.${ext}`;
}

class DictionaryIndexer {
   constructor(localizations) {
      this.localizations = localizations;

      // объект dictionary для записи в contents.json
      this.dictionaryForContents = {};

      // список всех css локализации.
      // {<имя модуля.локаль.css>: [{filePath:<путь до файла>, text: <текст файла>}, ...], ...}
      this.cssStore = {};
   }

   addLocalizationJson(modulePath, filePath, locale) {
      if (this.localizations.includes(locale)) {
         const expectedFilePath = path.join(modulePath, 'lang', locale, `${locale}.json`);
         if (helpers.prettifyPath(filePath) === helpers.prettifyPath(expectedFilePath)) {
            this.dictionaryForContents[getDirectoryKey(modulePath, locale, 'json')] = true;
         }
      }
   }

   addLocalizationCSS(modulePath, filePath, locale, text) {
      if (this.localizations.includes(locale)) {
         const expectedFilePath = path.join('lang', locale, `${locale}.css`);
         if (helpers.prettifyPath(filePath).endsWith(helpers.prettifyPath(expectedFilePath))) {
            const key = getDirectoryKey(modulePath, locale, 'css');

            this.dictionaryForContents[key] = true;

            if (!this.cssStore.hasOwnProperty(key)) {
               this.cssStore[key] = [];
            }
            this.cssStore[key].push({
               filePath,
               text
            });
         }
      }
   }

   extractMergedCSSCode(modulePath, locale) {
      const key = getDirectoryKey(modulePath, locale, 'css');
      if (!this.cssStore.hasOwnProperty(key)) {
         return '';
      }

      return bumpImportsUp(
         this.cssStore[key].map(cssObj => resolveUrl(path.dirname(modulePath), cssObj.filePath, cssObj.text)).join('\n')
      );
   }

   extractLoaderCode(modulePath, locale) {
      const hasDict = this.dictionaryForContents.hasOwnProperty(getDirectoryKey(modulePath, locale, 'json'));
      const hasCss = this.dictionaryForContents.hasOwnProperty(getDirectoryKey(modulePath, locale, 'css'));
      if (!hasDict && !hasCss) {
         return '';
      }

      const dictModuleDeps = ['"Core/i18n"'],
         dictModuleArgs = ['i18n'];

      let dictModuleContent = '';
      const moduleName = path.basename(modulePath);

      if (hasDict) {
         const relativeDictPath = helpers.prettifyPath(path.join(moduleName, 'lang', locale, `${locale}.json`));
         dictModuleDeps.push(`"text!${relativeDictPath.replace(/^ws/, 'WS')}"`);
         dictModuleArgs.push('dict');
         dictModuleContent += `i18n.setDict(JSON.parse(dict), "text!${relativeDictPath.replace(
            /^ws/,
            'WS'
         )}", "${locale}");`;
      }
      if (hasCss) {
         const relativeCssPath = helpers.prettifyPath(path.join(moduleName, 'lang', locale, locale));
         dictModuleContent += `if(i18n.getLang()=="${locale}"){global.requirejs(["native-css!${relativeCssPath}"]);}`;
      }

      return (
         '(function() {' +
         'var global = (function(){ return this || (0,eval)("this"); }()),' +
         'define = global.define || (global.requirejs && global.requirejs.define) || (requirejsVars && requirejsVars.define);' +
         'global.requirejs(["Core/core-ready"],function(){' +
         `global.requirejs([${dictModuleDeps.join()}],function(${dictModuleArgs.join()}){${dictModuleContent}});});})();`
      );
   }

   getDictionaryForContents() {
      return this.dictionaryForContents;
   }
}

module.exports = DictionaryIndexer;
