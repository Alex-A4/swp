'use strict';
const less = require('less'),
   path = require('path'),
   helpers = require('../lib/helpers'),
   LessError = require('less/lib/less/less-error'),
   autoprefixer = require('autoprefixer'),
   postcss = require('postcss'),
   postcssSafeParser = require('postcss-safe-parser'),
   postcssUrl = require('postcss-url'),
   pMap = require('p-map');

const invalidUrl = /^(\/|#|data:|[a-z]+:\/\/)(?=.*)/i;

const defaultTheme = 'online';

const themes = [
   'carry',
   'carry_medium',
   'carrynew',
   'carrynew_medium',
   'cloud',
   'genie',
   'online',
   'presto',
   'presto_medium',
   'prestonew',
   'prestonew_medium'
];

const themesForModules = new Map([['CloudControl', 'cloud'], ['Presto', 'presto'], ['Retail', 'carry']]);


/**
 @workaround ресолвим текущую тему по названию модуля или папке в темах
 */
function resolveThemeName(filePath, modulePath) {
   const relativePath = filePath.replace(modulePath, '');
   for (const themeName of themes) {
      if (relativePath.includes(`/themes/${themeName}/`)) {
         return themeName;
      }
   }
   const moduleName = path.basename(modulePath);
   if (themesForModules.has(moduleName)) {
      return themesForModules.get(moduleName);
   }
   return defaultTheme;
}

async function processLessFile(data, filePath, theme, sbis3ControlsPath, pathsForImport, appRoot) {
   // если есть SBIS3.CONTROLS, то путь до его директори должен быть всегда перым,
   // чтобы избежать коллизии
   let preparedPathsForImport = pathsForImport;

   // если в проекте нет SBIS3.CONTROLS - это не проблема
   const imports = [];

   /**
    * импортим набор переменных в зависимости от темы и наличия
    * SBIS3.CONTROLS в проекте.
    */
   if (theme.path) {
      imports.push(`@import '${path.join(theme.path, '_variables')}';`);
   } else if (sbis3ControlsPath) {
      imports.push(`@import 'SBIS3.CONTROLS/themes/${theme.name}/_variables';`);
      preparedPathsForImport = [path.dirname(sbis3ControlsPath), ...pathsForImport];
   } else {
      imports.push('@import \'Controls-theme/themes/default/_variables\';');
   }
   imports.push('@import \'Controls-theme/themes/default/helpers/_mixins\';');
   imports.push(`@themeName: ${theme.name};`);
   const newData = [...imports, ...[data]].join('\n');
   try {
      const outputLess = await less.render(newData, {
         filename: filePath,
         cleancss: false,
         relativeUrls: true,
         strictImports: true,

         // так предписывает делать документация для поддержки js в less
         inlineJavaScript: true,

         // а так работает на самом деле поддержка js в less
         javascriptEnabled: true,
         paths: preparedPathsForImport
      });

      const processor = postcss([
         postcssUrl({
            url(asset) {
               // ignore absolute urls, hashes or data uris
               if (invalidUrl.test(asset.url)) {
                  return asset.url;
               }

               // из-за того, что less компилируются из исходников, а не из стенда,
               // в СБИС плаигне при импорте less из SBIS.CONTROLS получаются кривые пути
               if (asset.url.includes('..')) {
                  if (asset.url.includes('/SBIS3.CONTROLS/')) {
                     let newFolder = '/resources/SBIS3.CONTROLS';
                     if (appRoot && appRoot !== '/') {
                        newFolder = helpers.prettifyPath(path.join(appRoot, newFolder));
                     }
                     return asset.url.replace(/.*SBIS3\.CONTROLS/, newFolder);
                  }
                  if (asset.url.includes('/ui-modules/Controls/')) {
                     let newFolder = '/resources/Controls';
                     if (appRoot && appRoot !== '/') {
                        newFolder = helpers.prettifyPath(path.join(appRoot, newFolder));
                     }
                     return asset.url.replace(/.*\/ui-modules\/Controls/, newFolder);
                  }
                  if (asset.url.includes('/Controls-theme/')) {
                     let newFolder = '/resources/Controls-theme';
                     if (appRoot && appRoot !== '/') {
                        newFolder = helpers.prettifyPath(path.join(appRoot, newFolder));
                     }
                     return asset.url.replace(/.*\/Controls-theme/, newFolder);
                  }
               }
               return asset.url;
            }
         }),
         autoprefixer({ browsers: ['last 2 versions', 'ie>=10'], remove: false })
      ]);
      if (filePath.includes('themes')) {
         /**
          * надо поменять папку с путём до SDK, поскольку ")" является признаком конца урла в postcss-url,
          * а encodeURI не принесёт результата, поскольку ")" является валидной частью запроса и
          * не экранируется с помощью функций encodeURI и encodeURIComponent
          * TODO сделать более красиво, можно например засимлинкать модули из SDK в директорию без ")"
          */
         outputLess.css = outputLess.css.replace(/\/Program\\? Files\\? \\?\(x86\\?\)\//g, '/temp_form_sdk/');
      }
      const outputPostcss = await processor.process(
         outputLess.css,
         {
            parser: postcssSafeParser,
            from: filePath
         }
      );

      return {
         text: outputPostcss.css,
         imports: outputLess.imports,
         nameTheme: theme.name,
         defaultTheme: theme.isDefault
      };
   } catch (error) {
      if (error instanceof LessError) {
         // error.line может не существовать.
         let errorLineStr = '';
         if (error.hasOwnProperty('line') && typeof error.line === 'number') {
            let errorLine = error.line;
            if (
               helpers.prettifyPath(error.filename) === helpers.prettifyPath(filePath) &&
               errorLine >= imports.length
            ) {
               // сколько строк добавили в файл, столько и вычтем для вывода ошибки
               // в errorLine не должно быть отрицательных значений.
               errorLine -= imports.length;
            }
            errorLineStr = ` на строке ${errorLine.toString()}`;
         }

         // error.filename может быть где-то в импортируемых лесс файлах. поэтому дублирования информации нет
         const message = `Ошибка компиляции ${error.filename} для темы ${theme.name}: ${errorLineStr}: ${error.message}`;
         throw new Error(message);
      }
      throw error;
   }
}

async function buildLess(filePath, text, modulePath, sbis3ControlsPath, pathsForImport, notThemedLess, styleThemes) {
   const prettyRelativeFilePath = helpers.prettifyPath(path.relative(modulePath, filePath));
   const partsOfRelativeFilePath = prettyRelativeFilePath.split('/');
   if (path.basename(filePath).startsWith('_') || partsOfRelativeFilePath.includes('_less')) {
      return [{
         ignoreMessage: `Файл '${filePath}' не будет компилироваться.`
      }];
   }

   const prettyFilePath = helpers.prettifyPath(filePath);

   const prettyModulePath = helpers.prettifyPath(modulePath);
   const defaultModuleTheme = resolveThemeName(prettyFilePath, prettyModulePath);
   const prettySbis3ControlsPath = helpers.prettifyPath(sbis3ControlsPath);

   /**
    * Темы билдим без тем. Также в качестве исключения добавляем SBIS3.CONTROLS/default-theme, поскольку здесь хранится
    * дефолтная тема проекта.
    * @type {*|boolean}
    */
   const isThemePath = prettyRelativeFilePath.startsWith('themes/') || prettyFilePath.includes('SBIS3.CONTROLS/default-theme/');

   const buildAllThemes = [];
   const results = [];
   const defaultModuleThemeObject = {
      name: defaultModuleTheme,
      isDefault: true
   };
   if (styleThemes.hasOwnProperty(defaultModuleTheme)) {
      defaultModuleThemeObject.path = styleThemes[defaultModuleTheme];
   }
   buildAllThemes.push(
      processLessFile(text, prettyFilePath, defaultModuleThemeObject, prettySbis3ControlsPath, pathsForImport)
   );

   /**
    * less'ки непосредственно в папке ${UI-module}/themes нужно компилить исключительно без тем
    */
   if (!notThemedLess && !isThemePath) {
      for (const themeName of Object.keys(styleThemes)) {
         /**
          * default тему можно билдить исключительно с WS4, то есть только с модулем "Controls"
          * @type {boolean}
          */
         const oldModuleNewDefaultTheme = themeName === 'default' && path.basename(modulePath) !== 'Controls';
         if (!oldModuleNewDefaultTheme) {
            buildAllThemes.push(processLessFile(text, prettyFilePath, {
               name: themeName,
               path: styleThemes[themeName]
            }, prettySbis3ControlsPath, pathsForImport));
         }
      }
   }

   /**
    * билдим все темы, но если одна зафейлилась, то остальные мы автоматически
    * не грохаем. Будем возвращать для каждой скомпиленной lessки объект. В зависимости
    * от результата она будет содержать свойство
    * error - сообщение о произошедшей ошибке.
    * compiled - результаты успешной компиляции less.
    */
   await pMap(
      Object.keys(buildAllThemes),
      async(key) => {
         try {
            const currentResult = await buildAllThemes[key];
            results.push({
               compiled: currentResult
            });
         } catch (error) {
            results.push({
               error: error.message
            });
         }
      }
   );
   return results;
}

module.exports = buildLess;
