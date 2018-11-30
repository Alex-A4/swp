'use strict';

// подключение ws для grunt.
// данная версия загружает модули платформы из развернутого стенда
// есть ещё версия для gulp

// /////////////////////////
// Это здесь нужно, потому что внутри они переопределяют require, и портят наш requirejs
// Surprise MF
// /////////////////////////
require('esprima');
require('escodegen');
require('estraverse');

// /////////////////////////

const path = require('path'),
   fs = require('fs-extra');

const dblSlashes = /\\/g;

// Это физический путь до корня статики
const root = process.env.ROOT || path.join(process.cwd(), '..', '..');

// Относительные пути от корня сайта

const appRoot = path.join(process.env.APPROOT, path.sep).replace(dblSlashes, '/');

// При распили ядра на отдельные интрефейсные модули возникла проблема с доступностью некоторых модулей уехавших из ws.
// Напряляем require в правильном направление.
const existWsCore = fs.existsSync(path.join(root, 'WS.Core'));
const wsRoot = path.join(appRoot, existWsCore ? 'WS.Core' : 'ws', path.sep).replace(dblSlashes, '/');
const resourceRoot = existWsCore ? '.' : path.join(appRoot, 'resources', path.sep).replace(dblSlashes, '/');
const requireJS = require('requirejs');
const logger = require('./../../lib/logger').logger();

function removeLeadingSlash(filePath) {
   let newFilePath = filePath;
   if (newFilePath) {
      const head = newFilePath.charAt(0);
      if (head === '/' || head === '\\') {
         newFilePath = newFilePath.substr(1);
      }
   }
   return newFilePath;
}

const formatMessage = function(message) {
   if (typeof message === 'string') {
      return message;
   }
   return JSON.stringify(message);
};

const wsLogger = {
   error(tag, msg, err) {
      let stack = '';
      if (err && err.hasOwnProperty('stack')) {
         stack = `: ${err.stack}`;
      }
      logger.info(`WS error: ${tag}::${formatMessage(msg)}${stack}`);
   },
   info(tag, msg) {
      logger.debug(`WS info: ${tag}::${formatMessage(msg)}`);
   },
   log(tag, msg) {
      logger.debug(`WS log: ${tag}::${formatMessage(msg)}`);
   }
};


let isInit = false;
module.exports = function initWs() {
   if (!isInit) {
      isInit = true;

      global.wsConfig = {
         appRoot,
         wsRoot,
         resourceRoot
      };
      global.wsBindings = {
         ITransport() {
            const e = new Error();
            throw new Error(`ITransport is not implemented in build environment.${e.stack}`);
         },
         ILogger() {
            return wsLogger;
         }
      };
      global.rk = function rk(key) {
         let newKey = key;
         const index = newKey.indexOf('@@');
         if (index > -1) {
            newKey = newKey.substr(index + '@@'.length);
         }
         return newKey;
      };
      global.requirejs = requireJS;
      global.define = requireJS.define;
      // eslint-disable-next-line global-require
      const requirejsConfig = require(path.join(root, wsRoot, 'ext/requirejs/config.js'));
      const requirejs = requireJS.config(
         requirejsConfig(root, removeLeadingSlash(wsRoot), removeLeadingSlash(resourceRoot), {
            waitSeconds: 20,
            nodeRequire: require
         })
      );
      requirejs(path.join(root, wsRoot, 'lib/core.js'));
      const ws = requirejs('Core/core');
      const loadContents = requirejs('Core/load-contents');
      try {
         // eslint-disable-next-line global-require
         const appContents = require(path.join(root, resourceRoot, 'contents.json'));
         loadContents(appContents, true, { service: appRoot });
      } catch (err) {
         // eslint-disable-next-line no-console
         console.log('ws initialized without contents.json');
      }
      global.$ws = ws;
   }
   return global.$ws;
};
