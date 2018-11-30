'use strict';

const path = require('path');
const re = /encode=([\S]+)\?/;

/**
 * Разбираем is плагин
 * @param {String} dep
 * @return {{feature: string, yes: string, no: string}}
 */
function isParser(dep) {
   let yesModuleId = null,
      noModuleId = null,
      f,
      feature,
      actions;

   if (dep.indexOf('is!') > -1) {
      f = dep.replace('is!', '');
      feature = f.substr(0, f.indexOf('?'));
      actions = f.substr(feature.length + 1, f.length - feature.length - 1);

      yesModuleId = actions.substr(0, actions.indexOf(':'));

      if (actions.substr(yesModuleId.length + 1, 2) === '//') {
         yesModuleId = actions.substr(0, actions.indexOf(':', yesModuleId.length + 1));
      }

      noModuleId = actions.substr(yesModuleId.length + 1, actions.length - yesModuleId.length - 1);

      if (yesModuleId === '') {
         yesModuleId = actions;
         noModuleId = null;
      }
   }

   return {
      feature,
      yes: yesModuleId,
      no: noModuleId
   };
}

/**
 * Разбираем имя модуля на соствляющие
 * @param {String} dep
 * @return {{fullName: string, plugin: string, module: string, encode: boolean}}
 */
function getMeta(dep) {
   let encode = false;
   if (re.test(dep)) {
      encode = dep.match(re)[1] === 'true';
   }

   const pluginAndModule = dep.replace(re, '').split('!'),
      pluginType = pluginAndModule[1] ? pluginAndModule.shift() : '',
      moduleName = pluginAndModule.join('!'),
      meta = {
         fullName: dep,
         plugin: pluginType,
         module: moduleName,
         encode
      };

   if (pluginType === 'is') {
      const is = isParser(dep);
      meta.moduleFeature = is.feature || '';
      meta.moduleYes = is.yes ? getMeta(is.yes) : null;
      meta.moduleNo = is.no ? getMeta(is.no) : null;
   }

   if (pluginType === 'browser' || pluginType === 'optional') {
      meta.moduleIn = getMeta(moduleName);
   }

   if (!pluginType) {
      const ext = path.extname(dep).substr(1);
      if (ext === 'xhtml') {
         meta.plugin = 'html';
      } else if (ext) {
         meta.plugin = ext;
      } else {
         // Вроде если нет расширения, то require всегда считает, что там js
         meta.plugin = 'js';
      }
   }

   return meta;
}

module.exports = getMeta;
