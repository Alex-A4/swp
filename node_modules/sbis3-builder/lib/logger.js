/* eslint-disable no-console, max-classes-per-file */

'use strict';
const humanize = require('humanize');

let logger = null;

class Logger {
   constructor() {
      this._hasErrors = false;
      this._hasWarnings = false;
   }

   // нам нужно собрать дистрибутив полностью, вывести все ошибки и только после свалится с кодом выхода 1 или 6.
   // а grunt так не умеет. он может лишь падать при первой ошибке.
   correctExitCode(exitWithWarning = true) {
      if (this._hasErrors) {
         process.exit(1);
      } else if (this._hasWarnings && exitWithWarning) {
         // grunt такой же код выдаёт на варнинги. legacy, которое поддержано в jinnee
         process.exit(6);
      }
   }
}
class GruntLogger extends Logger {
   constructor(grunt) {
      super();
      this._grunt = grunt;
      this._lastPercentStr = '';
   }

   error(message) {
      this._hasErrors = true;
      if (typeof message === 'string') {
         this._grunt.log.error(message);
      } else {
         this._grunt.log.error(this._prepareObjectMessage(message));
      }
   }

   warning(message) {
      this._hasWarnings = true;
      if (typeof message === 'string') {
         this._grunt.log.warn(message);
      } else {
         this._grunt.log.warn(this._prepareObjectMessage(message));
      }
   }

   info(message) {
      this._grunt.log.ok(message);
   }

   debug(message) {
      this._grunt.log.debug(`${message}`);
   }

   static prepareStringMessage(timestamp, argsObj) {
      const args = [];

      for (let i = 0; i < argsObj.length; i++) {
         args[i] = argsObj[i];
      }

      if (args.length) {
         args[0] = timestamp + args[0];
      }

      return args;
   }

   _prepareObjectMessage(obj) {
      const messages = [];
      if (obj.hasOwnProperty('message')) {
         messages.push(obj.message);
      }
      if (obj.hasOwnProperty('error')) {
         messages.push(obj.error.message);
      }

      let locations = '';
      if (obj.hasOwnProperty('filePath')) {
         locations = `location: [${obj.filePath}] `;
      }

      if (obj.hasOwnProperty('error') && obj.error.stack) {
         this.info(`Stack: ${obj.error.stack}`);
      }

      return `${locations}${messages.join(': ')}`;
   }

   progress(percent, text) {
      const currentPercentStr = percent.toFixed(0);
      if (currentPercentStr !== this._lastPercentStr) {
         this.info(`[${currentPercentStr}%] ${text}`);
         this._lastPercentStr = currentPercentStr;
      }
   }
}

class GulpLogger extends Logger {
   constructor() {
      super();
      this._lastPercentStr = '';
      this._messages = [];
      this._appInfo = {
         application: '',
         responsible: ''
      };
   }

   setBaseInfo(application, responsible) {
      this._appInfo = {
         application,
         responsible
      };
   }

   error(message) {
      this._hasErrors = true;
      this._consoleLog('ERROR', message);
      this._addMessageForReport('error', message, this._appInfo);
   }

   warning(message) {
      this._hasWarnings = true;
      this._consoleLog('WARNING', message);
      this._addMessageForReport('warning', message, this._appInfo);
   }

   info(message) {
      this._consoleLog('INFO', message);
   }

   debug(message) {
      this._consoleLog('', message);
   }

   progress(percent) {
      const currentPercentStr = percent.toFixed(0);
      if (currentPercentStr !== this._lastPercentStr) {
         // выводим без [INFO]
         this._consoleLog('', `[PERCENT_COMPLETE] ${currentPercentStr}`);
         this._lastPercentStr = currentPercentStr;
      }
   }

   /* obj может быть строкой или объектом: {
      code: 1,
      message: 'Ошибка при обработке шаблона',
      error: error,
      moduleInfo: moduleInfo,
      filePath: file.history[0]
   }
   */
   _consoleLog(level, obj) {
      let formattedMessage = '';
      let formattedMessageWithStack = '';
      if (typeof obj === 'string') {
         formattedMessage = obj;
      } else {
         const messages = [];

         if (obj.hasOwnProperty('message') && obj.message) {
            messages.push(obj.message);
         }
         if (obj.hasOwnProperty('error') && obj.error && obj.error.message) {
            messages.push(obj.error.message);
         }

         const locations = [];
         if (obj.hasOwnProperty('moduleInfo') && obj.moduleInfo && obj.moduleInfo.nameWithResponsible) {
            locations.push(`module: ${obj.moduleInfo.nameWithResponsible}`);
         }
         if (obj.hasOwnProperty('filePath') && obj.filePath) {
            locations.push(`file: ${obj.filePath}`);
         }
         if (obj.hasOwnProperty('error') && obj.error && obj.error.stack) {
            formattedMessageWithStack = `Stack: ${obj.error.stack}`;
         }
         let formattedLocation = '';
         if (locations.length > 0) {
            formattedLocation = `location: [${locations.join(', ')}] `;
         }
         formattedMessage = `${formattedLocation}${messages.join(': ')}`;
      }
      let formattedLevel = '';
      if (level) {
         formattedLevel = `[${level}] `;
      }
      console.log(`[${humanize.date('H:i:s')}] ${formattedLevel}${formattedMessage}`);
      if (formattedMessageWithStack) {
         this.debug(formattedMessageWithStack);
      }
   }

   _addMessageForReport(level, obj, appInfo) {
      const result = {
         level,
         message: '',
         'cld_name': appInfo.application,
         'cld_responsible': appInfo.responsible
      };

      if (typeof obj === 'string') {
         result.message = obj;
      } else {
         if (obj.hasOwnProperty('message') && obj.message) {
            result.message += obj.message;
         }
         if (obj.hasOwnProperty('error') && obj.error && (obj.error.message || obj.error.stack)) {
            if (result.message) {
               result.message += '\nError: ';
            }
            if (obj.error.message) {
               result.message += obj.error.message;
            }
            if (obj.error.stack) {
               result.message += `\nStack: ${obj.error.stack}`;
            }
         }

         if (obj.hasOwnProperty('moduleInfo') && obj.moduleInfo) {
            result.module = obj.moduleInfo.name;
            result.responsibleOfModule = obj.moduleInfo.responsible;
         }
         if (obj.hasOwnProperty('filePath') && obj.filePath) {
            result.file = obj.filePath;
         }
      }
      this._messages.push(result);
   }

   addMessagesFromWorker(messages) {
      if (messages) {
         for (const msg of messages) {
            this._messages.push(msg);
         }
      }
   }

   getMessageForReport() {
      return this._messages;
   }
}
class WorkerLogger extends GulpLogger {
   constructor() {
      super();
      this._filePath = null;
      this._moduleInfo = null;
   }

   setInfo(filePath = null, moduleInfo = null) {
      this._filePath = filePath;
      this._moduleInfo = moduleInfo;
      this._messages = [];
   }

   error(message) {
      this._outputWithInfo('error', message);
   }

   warning(message) {
      this._outputWithInfo('warning', message);
   }

   info(message) {
      this._outputWithInfo('info', message);
   }

   debug(message) {
      this._outputWithInfo('debug', message);
   }

   _outputWithInfo(level, message) {
      if (typeof message === 'object') {
         super[level]({
            ...message,
            filePath: this._filePath,
            moduleInfo: this._moduleInfo
         });
      } else {
         super[level]({
            message,
            filePath: this._filePath,
            moduleInfo: this._moduleInfo
         });
      }
   }
}
module.exports = {
   setGruntLogger(grunt) {
      if (!logger) {
         logger = new GruntLogger(grunt);

         // TODO: избавиться от определения grunt.log.* и перейти везде на использовани класса логгера
         grunt.log.ok = function ok(...args) {
            const prefixMode = '[INFO]: ';
            console.log(...GruntLogger.prepareStringMessage(prefixMode, args));
            return grunt.log;
         };
         grunt.log.debug = function debug(...args) {
            if (grunt.option('debug')) {
               const prefixMode = '[DEBUG]: ';
               console.log(...GruntLogger.prepareStringMessage(prefixMode, args));
            }
            return grunt.log;
         };
         grunt.log.warn = function warn(...args) {
            const prefixMode = '[WARNING]: ';
            console.log(...GruntLogger.prepareStringMessage(prefixMode, args));
            return grunt.log;
         };
         grunt.log.error = function error(...args) {
            const prefixMode = '[ERROR]: ';
            console.log(...GruntLogger.prepareStringMessage(prefixMode, args));
            return grunt.log;
         };
      }
      return logger;
   },
   setGulpLogger() {
      if (!logger) {
         logger = new GulpLogger();
      }
      return logger;
   },
   setWorkerLogger() {
      if (!logger) {
         logger = new WorkerLogger();
      }
      return logger;
   },
   logger() {
      if (!logger) {
         throw new Error('Логгер не был инициализирован!');
      }
      return logger;
   }
};
