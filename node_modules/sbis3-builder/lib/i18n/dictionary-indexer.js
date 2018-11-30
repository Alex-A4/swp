'use strict';

const helpers = require('../../lib/helpers'),
   path = require('path');

const cssHelpers = require('../../packer/lib/css-helpers');
const resolveUrl = cssHelpers.rebaseUrls;
const { bumpImportsUp } = cssHelpers;

class DictionaryIndexer {
   constructor(localizations) {
      this.localizations = localizations;

      // множество ресурсов локализации:
      // 'en-US' - словарь
      // 'en-US.css' - стили
      this.dictionaryForContents = new Set();

      // список всех css для локализациёй
      // {<локаль>: [{filePath:<путь до файла>, text: <текст файла>}, ...], ...}
      this.cssStore = {};
   }

   addLocalizationJson(modulePath, filePath, locale) {
      if (this.localizations.includes(locale)) {
         const expectedFilePath = path.join(modulePath, 'lang', locale, `${locale}.json`);
         if (helpers.prettifyPath(filePath) === helpers.prettifyPath(expectedFilePath)) {
            this.dictionaryForContents.add(locale);
         }
      }
   }

   addLocalizationCSS(modulePath, filePath, locale, text) {
      if (this.localizations.includes(locale)) {
         const expectedFilePath = path.join('lang', locale, `${locale}.css`);
         if (helpers.unixifyPath(filePath).endsWith(helpers.unixifyPath(expectedFilePath))) {
            this.dictionaryForContents.add(`${locale}.css`);

            if (!this.cssStore.hasOwnProperty(locale)) {
               this.cssStore[locale] = [];
            }
            this.cssStore[locale].push({
               filePath,
               text
            });
         }
      }
   }

   extractMergedCSSCode(modulePath, locale) {
      if (!this.cssStore.hasOwnProperty(locale)) {
         return '';
      }

      // порядок должен быть строго определён, чтобы не падали интеграционные тесты
      this.cssStore[locale].sort((a, b) => {
         if (a.filePath > b.filePath) {
            return 1;
         }
         if (a.filePath < b.filePath) {
            return -1;
         }
         return 0;
      });
      return bumpImportsUp(
         this.cssStore[locale].map(cssObj => resolveUrl(path.dirname(modulePath), cssObj.filePath, cssObj.text)).join('\n')
      );
   }

   extractLoaderCode(modulePath, locale) {
      const hasDict = this.dictionaryForContents.has(locale);
      const hasCss = this.dictionaryForContents.has(`${locale}.css`);
      if (!hasDict && !hasCss) {
         return '';
      }

      const dictModuleDeps = ['"Core/i18n"'],
         dictModuleArgs = ['i18n'];

      let dictModuleContent = '';
      const moduleName = path.basename(modulePath);

      if (hasDict) {
         const relativeDictPath = helpers.prettifyPath(path.join(moduleName, 'lang', locale, `${locale}.json`));
         dictModuleDeps.push(`"${relativeDictPath.replace(/^ws/, 'WS')}"`);
         dictModuleArgs.push('dict');
         dictModuleContent += `i18n.setDict(dict, "${relativeDictPath.replace(
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
      return [...this.dictionaryForContents];
   }
}

module.exports = DictionaryIndexer;
