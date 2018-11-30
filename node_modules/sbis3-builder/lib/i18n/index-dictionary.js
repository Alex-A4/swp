/* часть grunt сборщика */
'use strict';

const path = require('path');
const fs = require('fs-extra');
const getLanguageByLocale = require('../get-language-by-locale');
const helpers = require('../helpers');
const DictionaryIndexer = require('./dictionary-indexer-grunt');
const logger = require('../../lib/logger').logger();


function getContents(grunt, filePath) {
   return grunt.file.readJSON(filePath);
}

/**
 * Записывает ключ в contents.json
 * @param grunt
 * @param {Object} keys
 * @param {String} applicationRoot - полный путь до корня сервиса
 */
function replaceContents(grunt, keys, applicationRoot) {
   const absolutePath = path.join(applicationRoot, 'resources/contents.json');
   try {
      let content = getContents(grunt, absolutePath);
      if (content) {
         Object.keys(keys).forEach((key) => {
            content[key] = keys[key];
         });
         content = helpers.sortObject(content);
         grunt.file.write(absolutePath, JSON.stringify(content, null, 2));
         grunt.file.write(absolutePath.replace('.json', '.js'), `contents = ${JSON.stringify(content, null, 2)}`);
      }
   } catch (e) {
      logger.error({
         message: "Can't read contents.json file",
         error: e
      });
   }
}

/**
 * Получает список языков, которые будут доступны
 * @param languagesStr
 * @returns {{availableLanguage: {}, defaultLanguage: string}}
 */
function getAvailableLang(languagesStr) {
   const availableLang = {};

   let defLang = '',
      languageCulture,
      parts,
      language,
      country;

   if (typeof languagesStr === 'string') {
      const languages = languagesStr.replace(/"/g, '').split(';');
      for (let i = 0; i < languages.length; i++) {
         let isDef = false;

         languageCulture = languages[i];
         if (languageCulture.length === 6 && languageCulture[0] === '*') {
            languageCulture = languageCulture.substring(1, 6);
            isDef = true;
         }

         if (languageCulture.length === 5) {
            parts = languageCulture.split('-');
            language = parts[0].toLowerCase();
            country = parts[1].toUpperCase();
            languageCulture = `${language}-${country}`;
            defLang = isDef ? languageCulture : defLang;
            availableLang[languageCulture] = getLanguageByLocale(languageCulture);
         }
      }
   }

   return { availableLanguage: availableLang, defaultLanguage: defLang };
}

/**
 * Возвращает массив путей до ws и папок первого уровня вложенности в resources
 */
function getFirstLevelDirs(app) {
   const resources = path.join(app, 'resources'),
      ws = path.join(app, 'ws');

   const dirs = fs.readdirSync(resources).map(e => path.join(resources, e));

   dirs.push(ws);

   return dirs.filter(e => fs.statSync(e).isDirectory());
}

/**
 * Индексирует словари и записывает информацию о них в contents.json
 * @param {Object} grunt
 * @param {String} languages - Языки для индексации
 * @param {Object} data - Конфигурация таски
 * @param done
 */
function indexDict(grunt, languages, data, done) {
   grunt.log.ok(`${grunt.template.today('hh:MM:ss')}: Начато индексирование словарей для локализации.`);

   try {
      const temp = getAvailableLang(languages),
         availableLang = temp.availableLanguage,
         defLang = temp.defaultLanguage,
         firstLevelDirs = getFirstLevelDirs(data.cwd),
         coreConstants = global.requirejs('Core/constants');

      const localizations = Object.keys(availableLang);
      const indexer = new DictionaryIndexer(localizations);
      if (localizations.length) {
         for (const modulePath of firstLevelDirs) {
            grunt.file.recurse(modulePath, (filePath) => {
               try {
                  if (filePath.endsWith('.json')) {
                     const locale = path.basename(filePath, '.json');
                     if (localizations.includes(locale)) {
                        indexer.addLocalizationJson(modulePath, filePath, locale);
                     }
                  } else if (filePath.endsWith('.css')) {
                     const locale = path.basename(filePath, '.css');
                     if (localizations.includes(locale)) {
                        const cssContent = fs.readFileSync(filePath);
                        indexer.addLocalizationCSS(modulePath, filePath, locale, cssContent.toString());
                     }
                  }
               } catch (e) {
                  logger.error({
                     error: e
                  });
               }
            });

            for (const localization of localizations) {
               const mergedCSSCode = indexer.extractMergedCSSCode(modulePath, localization);
               if (mergedCSSCode) {
                  const mergedCSSPath = path.join(modulePath, 'lang', localization, `${localization}.css`);
                  fs.outputFileSync(mergedCSSPath, mergedCSSCode);
               }

               const loaderCode = indexer.extractLoaderCode(modulePath, localization);
               if (loaderCode) {
                  const loaderPath = path.join(modulePath, 'lang', localization, `${localization}.js`);
                  fs.outputFileSync(loaderPath, loaderCode);
               }
            }
         }
      }

      const jsDict = indexer.getDictionaryForContents();
      replaceContents(
         grunt,
         {
            availableLanguage: availableLang,
            defaultLanguage: defLang,
            dictionary: jsDict
         },
         data.cwd
      );

      // Нужно для заполенения констант локализации на время сборки.
      coreConstants.availableLanguage = availableLang;
      coreConstants.defaultLanguage = defLang;
      coreConstants.dictionary = jsDict;
   } catch (e) {
      logger.error({
         error: e
      });
   }

   grunt.log.ok(`${grunt.template.today('hh:MM:ss')}: Индексирование словарей для локализации выполнено.`);
   done();
}

module.exports = indexDict;
