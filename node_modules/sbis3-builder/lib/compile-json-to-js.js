'use strict';

const
   transliterate = require('../lib/transliterate'),
   helpers = require('../lib/helpers'),
   modulePathToRequire = require('../lib/modulepath-to-require');

function generateAmdJson(text, moduleName) {
   // превращаем json в минифицированный вариант
   const
      minifiedJson = JSON.stringify(JSON.parse(text)),
      prettifiedModuleName = modulePathToRequire.getPrettyPath(helpers.unixifyPath(moduleName));

   return `define('${prettifiedModuleName}',[],function(){return ${minifiedJson};});`;
}

/**
 * Компилирует Json в AMD-формат
 * @param {string} relativePath относительный путь файла. Начинается с имени модуля
 * @param {string} text содержимое json-файла
 * @returns {string}
 */
function compileJsonToJs(relativePath, text) {
   const moduleName = transliterate(relativePath);
   return generateAmdJson(text, moduleName);
}

module.exports = compileJsonToJs;
