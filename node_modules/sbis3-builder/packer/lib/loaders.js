'use strict';

const esprima = require('esprima');
const { traverse } = require('estraverse');
const codegen = require('escodegen');
const stripBOM = require('strip-bom');
const path = require('path');
const fs = require('fs-extra');
const rebaseUrlsToAbsolutePath = require('./css-helpers').rebaseUrls;
const logger = require('../../lib/logger').logger();
const dblSlashes = /\\/g;
let availableLangs;
const langRegExp = /lang\/([a-z]{2}-[A-Z]{2})/;

// FIXME: сделать бы по хорошему, чтобы не через костыль
let not404error = false;

let currentFile;

const loaders = {
   js: jsLoader,
   html: xhtmlLoader,
   xhtml: xhtmlLoader,
   css: cssLoader,
   'native-css': cssLoader,
   json: jsonLoader,
   xml: xmlLoader,
   is: isLoader,
   text: textLoader,
   browser: browserLoader,
   optional: optionalLoader,
   i18n: i18nLoader,
   tmpl: tmplLoader,
   wml: tmplLoader,
   default: baseTextLoader
};

/**
 * @callback loaders~callback
 * @param {Error} error
 * @param {string} [result]
 */

/**
 * Get AST
 *
 * @param {Object} module - module
 * @param {String} module.fullName - module name with plugin
 * @param {String} module.fullPath - module full path
 * @param {String} module.plugin - plugin name
 * @param {String} module.module - module name
 * @param {Object} [module.moduleYes] - is plugin, module yes
 * @param {Object} [module.moduleNo] - is plugin, module no
 * @param {String} [module.moduleFeature] - is plugin, module feature
 */
function parseModule(text, module) {
   let res;
   try {
      res = esprima.parse(text);
   } catch (e) {
      e.message = `While parsing ${module.fullName} from ${module.fullPath}: ${e.message}`;
      res = e;
   }
   return res;
}

/**
 * Read js and inserts a module name into "define" function if name not specified
 * Use AST
 *
 * @param {Meta} module - module
 * @param {String} base - site root
 * @param {loaders~callback} done
 */
function jsLoader(module, base, done) {
   readFile(
      module.fullPath,
      ignoreIfNoFile(function addNamesToAnonymousModules(err, res) {
         let anonymous = false,
            rebuild = false,
            { amd } = module;

         if (err) {
            done(err);
         } else if (!res) {
            done(null, '');
         } else if (amd && !module.addDeps) {
            done(null, res);
         } else {
            const ast = parseModule(res, module);
            if (ast instanceof Error) {
               done(ast);
               return;
            }

            traverse(ast, {
               enter: function detectAnonymnousModules(node) {
                  if (
                     node.type === 'CallExpression' &&
                     node.callee.type === 'Identifier' &&
                     node.callee.name === 'define'
                  ) {
                     // Check anonnimous define
                     if (node.arguments.length < 3) {
                        if (
                           node.arguments.length === 2 &&
                           node.arguments[0].type === 'Literal' &&
                           typeof node.arguments[0].value === 'string'
                        ) {
                           // define('somestring', /* whatever */);
                        } else {
                           anonymous = true;
                        }
                     }
                     if (
                        node.arguments[0] &&
                        node.arguments[0].type === 'Literal' &&
                        typeof node.arguments[0].value === 'string' &&
                        node.arguments[0].value === module.fullName
                     ) {
                        amd = true;
                     }

                     // Check additional dependenccies
                     if (!String(module.fullName).startsWith('Core/') && module.addDeps) {
                        if (!node.arguments[1].elements) {
                           node.arguments.splice(1, 0, {
                              elements: [],
                              type: 'ArrayExpression'
                           });
                        }
                        node.arguments[1].elements.push({
                           raw: module.addDeps,
                           type: 'Literal',
                           value: module.addDeps
                        });
                        rebuild = true;
                     }
                  }
               }
            });
            if (anonymous) {
               done(null, '');
            } else if (amd || module.fullPath.indexOf('ext/requirejs/plugins') !== -1) {
               /**
                * временный костыль для плагинов requirejs, спилю как будет решение ошибки
                * https://online.sbis.ru/opendoc.html?guid=04191b13-e919-498d-b2e5-135e85f06f74
                */
               if (rebuild) {
                  done(
                     null,
                     codegen.generate(ast, {
                        format: {
                           compact: true
                        }
                     })
                  );
               } else {
                  done(null, res);
               }
            } else {
               done(null, `define("${module.fullName}", ""); ${res}`);
            }
         }
      }, 'jsLoader')
   );
}

/**
 * Read *html and wrap as text module.
 *
 * @param {Meta} module - module
 * @param {String} base - site root
 * @param {loaders~callback} done
 */
function xhtmlLoader(module, base, done) {
   readFile(
      module.fullPath,
      ignoreIfNoFile((err, res) => {
         if (err) {
            done(err);
         } else if (module.amd && res) {
            done(null, res);
         } else {
            /**
             * сгенеренного шаблона нету, это означает что произошла ранее ошибка при его генерации
             * и пытаться здесь сгенерировать его снова нет смысла, всё равно будет ошибка.
             * Но для кастомной паковки дефайн всё равно должен быть, иначе реквайр при запросе модуля
             * пойдёт за xhtml кастомным пакетом и упадёт.
             */
            done(null, `define('${module.fullName}', '');`);
         }
      }, 'xhtmlLoader')
   );
}

/**
 * Read css and Rebase urls and Wrap as module that inserts the tag style
 * Ignore IE8-9
 *
 * @param {Meta} module - module
 * @param {String} base - site root
 * @param {loaders~callback} done
 */
function cssLoader(
   module,
   base,
   done,
   themeName,
   languageConfig,
   isGulp,
   root,
   urlServicePath
) {
   const suffix = themeName ? `__${themeName}` : '';
   let modulePath = module.fullPath;
   if (suffix && module.fullName.includes('SBIS3.CONTROLS')) {
      modulePath = `${modulePath.slice(0, -4) + suffix}.css`;
   }
   const resourceRoot = isGulp ? `${path.join(urlServicePath, 'resources/')}` : '/';
   readFile(
      modulePath,
      rebaseUrls(
         base,
         modulePath,
         styleTagLoader(
            asModuleWithContent(
               onlyForIE10AndAbove(ignoreIfNoFile(done, 'cssLoader'), module.fullName),
               module.fullName
            )
         ),
         resourceRoot
      )
   );
}

/**
 * Read *json and wrap as text module.
 *
 * @param {Meta} module - module
 * @param {loaders~callback} done
 */
function jsonLoader(module, base, done) {
   readFile(
      module.fullPath,
      ignoreIfNoFile((err, res) => {
         if (err) {
            done(err);
         } else {
            let minRes = res;
            try {
               minRes = JSON.stringify(JSON.parse(minRes));
            } catch (error) {
               logger.warning({
                  error
               });
            }
            done(null, `define("${module.fullName}", function() {return ${minRes};});`);
         }
      }, 'jsonLoader')
   );
}

/**
 * Read *xml and wrap as text module.
 *
 * @param {Meta} module - module
 * @param {String} base - site root
 * @param {loaders~callback} done
 */
function xmlLoader(module, base, done) {
   readFile(
      module.fullPath,
      ignoreIfNoFile((err, res) => {
         if (err) {
            done(err);
         } else {
            done(null, `define("${module.fullName}", function() {return ${JSON.stringify(res)};});`);
         }
      }, 'xmlLoader')
   );
}

/**
 * Read *xml and wrap as text module.
 *
 * @param {Meta} module - module
 * @param {String} base - site root
 * @param {loaders~callback} done
 */
function isLoader(module, base, done) {
   let ifCondition = 'if(%c)';
   let elseCondition = 'else';
   if (module.moduleFeature === 'browser') {
      ifCondition = ifCondition.replace('%c', 'typeof window !== "undefined"');
   }
   if (module.moduleFeature === 'msIe') {
      ifCondition = ifCondition.replace(
         '%c',
         'typeof window !== "undefined" && navigator && navigator.appVersion.match(/MSIE\\s+(\\d+)/)'
      );
   }
   if (module.moduleFeature === 'compatibleLayer') {
      ifCondition = ifCondition.replace(
         '%c',
         'typeof window === "undefined" || window && window.location.href.indexOf("withoutLayout")===-1'
      );
   }
   if (module.moduleYes) {
      loaders[module.moduleYes.plugin](module.moduleYes, base, (err, res) => {
         if (err) {
            done(err);
         } else if (!res) {
            done(null, '');
         } else {
            ifCondition = `${ifCondition}{${removeSourceMap(res)}}`;
            if (module.moduleNo) {
               loaders[module.moduleNo.plugin](module.moduleNo, base, (curErr, curRes) => {
                  if (curErr) {
                     done(curErr);
                  } else if (!curRes) {
                     done(null, '');
                  } else {
                     elseCondition = `${elseCondition}{${removeSourceMap(curRes)}}`;
                     done(null, ifCondition + elseCondition);
                  }
               });
            } else {
               done(null, ifCondition);
            }
         }
      });
   }
}

/**
 * Удаляет из модуля sourcemap, если она есть. При паковке они не имеют смысла
 * и могут закомментировать закрывающую скобку. Также source map ссылается на js-ку,
 * которая лежит с ней в одной директории, а при паковке хозяева могут указать другое
 * место для хранения своего пакет. В таком случае мапы ещё и не будут работать
 * @param res - модуль в виде строки
 */
function removeSourceMap(res) {
   const sourceMapIndex = res.indexOf('\n//# sourceMappingURL');
   return sourceMapIndex !== -1 ? res.slice(0, sourceMapIndex) : res;
}

/**
 * @param {Meta} module - module
 * @param {String} base - site root
 * @param {loaders~callback} done
 */

function browserLoader(module, base, done) {
   const ifCondition = 'if(typeof window !== "undefined")';
   loaders[module.moduleIn.plugin](module.moduleIn, base, (err, res) => {
      if (err) {
         done(err);
      } else if (!res) {
         done(null, '');
      } else {
         done(null, `${ifCondition}{${removeSourceMap(res)}}`);
      }
   });
}

/**
 * @param {Meta} module - module
 * @param {String} base - site root
 * @param {loaders~callback} done
 */
function optionalLoader(module, base, done) {
   not404error = true;
   loaders[module.moduleIn.plugin](module.moduleIn, base, (err, res) => {
      not404error = false;
      if (err || !res) {
         done(null, '');
      } else {
         done(null, removeSourceMap(res));
      }
   });
}

/**
 * @param {Meta} module - module
 * @param {String} base - site root
 * @param {loaders~callback} done
 */
function textLoader(module, base, done) {
   readFile(
      module.fullPath,
      ignoreIfNoFile((err, res) => {
         if (err) {
            done(err);
         } else {
            done(null, `define("${module.fullName}", function() {return ${JSON.stringify(res)};});`);
         }
      }, 'textLoader')
   );
}

/**
 * Read file and wrap as text module.
 *
 * @param {Meta} module - module
 * @param {String} base - site root
 * @param {loaders~callback} done
 */
function baseTextLoader(module, base, done) {
   readFile(module.fullPath, ignoreIfNoFile(asText(done, path.relative(base, module.fullPath)), 'baseTextLoader'));
}

function readFile(fullPath, done) {
   fs.readFile(fullPath, 'utf8', (err, file) => {
      currentFile = fullPath;
      if (err) {
         done(err);
      } else {
         done(null, stripBOM(file));
      }
   });
}

/**
 * Read file and wrap as tmpl module.
 *
 * @param {Meta} module - module
 * @param {String} base - site root
 * @param {loaders~callback} done
 */
function tmplLoader(module, base, done) {
   readFile(
      module.fullPath,
      ignoreIfNoFile((err, html) => {
         if (err) {
            done(err);
         } else if (module.amd && html) {
            done(null, html);
         } else {
            /**
             * сгенеренного шаблона нету, это означает что произошла ранее ошибка при его генерации
             * и пытаться здесь сгенерировать его снова нет смысла, всё равно будет ошибка.
             * Но для кастомной паковки дефайн всё равно должен быть, иначе реквайр при запросе
             * модуля пойдёт за tmpl шаблоном и упадёт.
             */
            done(null, `define('${module.fullName}', '');`);
         }
      }, 'tmplLoader')
   );
}

/**
 * If file not exist, write error.
 * Change error on empty string
 * @param {Function} f - callback
 * @param {String} loaderName
 * @return {Function}
 */
function ignoreIfNoFile(f, loaderName) {
   return function log404AndIgnoreIt(err, res) {
      if (err && (err.code === 'ENOENT' || err.code === 'EISDIR') && !not404error) {
         logger.warning({
            message: `Potential 404 error for loader ${loaderName}`,
            filePath: currentFile,
            error: err
         });
         f(null, '');
         return;
      }
      f(err, removeSourceMap(res));
   };
}

/**
 * Text wraps an 'if' that does not work in IE8-9
 * @param {Function} f - callback
 * @return {Function}
 */
function onlyForIE10AndAbove(f, modName) {
   let ifConditionThemes;
   const ifCondition = 'if(typeof window !== "undefined" && window.atob){';

   if (
      modName.startsWith('css!SBIS3.CONTROLS') ||
      modName.startsWith('css!Controls') ||
      modName.startsWith('css!Deprecated/Controls')
   ) {
      ifConditionThemes =
         'var global=(function(){return this || (0,eval)(this);})();if(global.wsConfig && global.wsConfig.themeName){return;}';
   }

   return function onlyRunCodeForIE10AndAbove(err, res) {
      if (err) {
         f(err);
      } else {
         let result;
         if (ifConditionThemes) {
            const indexVar = res.indexOf('var style = document.createElement(');
            result = `${ifCondition + res.slice(0, indexVar) + ifConditionThemes + res.slice(indexVar)}}`;
         } else {
            result = `${ifCondition + res}}`;
         }
         f(null, result);
      }
   };
}

/**
 * Wrap string as text module, remove BOM
 * @param {loaders~callback} done - callback
 * @param {String} relPath - module name or path to module
 * @param {String} [withPlugin=text] - requirejs plugin name
 * @return {Function}
 */
function asText(done, relPath, withPlugin) {
   const withPluginStr = withPlugin ? `${withPlugin}!/` : '';
   return (err, res) => {
      if (err) {
         done(err);
      } else {
         done(null, `define("${withPluginStr}${relPath.replace(dblSlashes, '/')}", ${JSON.stringify(res)});`);
      }
   };
}

/**
 * Wrap text (function) as module with name
 * @param {Function} f - callback
 * @param {String} modName - module name
 * @return {Function}
 */
function asModuleWithContent(f, modName) {
   return function wrapWithModule(err, res) {
      if (err) {
         f(err);
      } else {
         f(null, `define('${modName}', ${res});`);
      }
   };
}

/**
 * Wrap css to inserts code
 * @param {Function} f - callback
 * @return {Function}
 */
function styleTagLoader(f) {
   return function createStyleNodeWithText(err, res) {
      if (err) {
         f(err);
      } else {
         const code = `function() {\
var style = document.createElement("style"),\
head = document.head || document.getElementsByTagName("head")[0];\
style.type = "text/css";\
style.setAttribute("data-vdomignore", "true");\
style.appendChild(document.createTextNode(${JSON.stringify(res)}));\
head.appendChild(style);\
}`;
         f(null, code);
      }
   };
}

/**
 * Rebase urls to absolute path in css
 * @param {String} root - absolute path root
 * @param {String} sourceFile - path to css
 * @param {Function} f - callback
 * @return {Function}
 */
function rebaseUrls(root, sourceFile, f, resourceRoot) {
   return (err, res) => {
      if (err) {
         f(err);
      } else if (resourceRoot) {
         f(null, rebaseUrlsToAbsolutePath(root, sourceFile, res, resourceRoot));
      } else {
         f(null, rebaseUrlsToAbsolutePath(root, sourceFile, res));
      }
   };
}

function getTemplateI18nModule(module) {
   const dictName = String(module.fullName || '').replace('_localization', ''),
      availableDict = JSON.stringify(module.availableDict || {}),
      code = `(function() {
   var availableDict = ${availableDict},
      langMatch = String(typeof document === 'undefined' ? '' : document.cookie).match(/lang=([A-z-]+)/),
      langName = langMatch ? langMatch[1] : 'ru-RU',
      langModule = '${dictName}/lang/' + langName + '/' + langName + '.json';
   if (langName in availableDict) {
      define('${module.fullName}', ['Core/i18n', langModule], function(i18n, data) {
         if (data){
            i18n.setDict(data, langModule, langName);
         }
      });
   } else {
      define('${module.fullName}', function() {});
   }
})();
`;
   return codegen.generate(esprima.parse(code), {
      format: {
         compact: true
      }
   });
}

/**
 * Получает список доступных языков для локализации.
 * Вычитывает словарь, css для языка, css для страны и оборачивает их как модули для каждого из доступных языков.
 *
 * @param {Meta} module - module
 * @param {String} base - site root
 * @param {loaders~callback} done
 * @return {Function}
 */
function i18nLoader(module, base, done, themeName, languageConfig, isGulp) {
   const
      deps = ['Core/i18n'],
      { availableLanguage, defaultLanguage } = languageConfig;

   if (isGulp) {
      availableLangs = availableLanguage;
      if (!availableLangs || !defaultLanguage || !module.deps) {
         done(null, getTemplateI18nModule(module));
         return;
      }
   } else {
      const coreConstants = global.requirejs('Core/constants');
      availableLangs = availableLangs || Object.keys(global.requirejs('Core/i18n').getAvailableLang());
      if (!availableLangs || (coreConstants && !coreConstants.defaultLanguage) || !module.deps) {
         done(null, getTemplateI18nModule(module));
         return;
      }
   }

   const noCssDeps = module.deps.filter(d => d.indexOf('native-css!') === -1);

   const noLangDeps = [];
   const langDeps = [];
   deps.concat(noCssDeps).forEach((d) => {
      if (d.match(langRegExp) === null) {
         noLangDeps.push(d);
      } else {
         langDeps.push(d);
      }
   });

   // дописываем зависимость только от необходимого языка
   const result =
      `define("${module.fullName}", ${JSON.stringify(noLangDeps)}, function(i18n) {` +
      `var langDep = ${JSON.stringify(langDeps)}.filter(function(dep){var lang = dep.match(${langRegExp}); ` +
      'if (lang && lang[1] == i18n.getLang()){return dep;}}); ' +
      'if (langDep){global.requirejs(langDep)} return i18n.rk.bind(i18n);});';

   done(null, result);
}

module.exports = loaders;
