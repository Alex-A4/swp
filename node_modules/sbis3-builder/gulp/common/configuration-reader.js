/* eslint-disable no-sync */

/**
 * Общие для сборок методы работы с файлом конфигурации
 * @author Бегунов Ал. В.
 */

'use strict';

const fs = require('fs-extra');
const path = require('path');

/**
 * Получить параметры командной строки, что начинаются с --
 * @param {string[]} argv спискок аргументов запуска утилиты
 * @returns {Object}
 */
function getProcessParameters(argv) {
   const result = {};
   for (const argument of argv) {
      const match = argument.match(/^--([^-=]+)=['"]?([^'"]*)['"]?$/i);
      if (match) {
         // eslint-disable-next-line prefer-destructuring
         result[match[1]] = match[2];
      }
   }
   return result;
}

/**
 * Прочитать файл конфигурации синхронно.
 * @param {string} configPath путь до файла конфигурации
 * @returns {Object} конфигурация в виде объекта
 */
function readConfigFileSync(configPath) {
   if (!configPath) {
      throw new Error('Файл конфигурации не задан.');
   }

   const resolvedConfigPath = path.resolve(process.cwd(), configPath);
   if (!fs.pathExistsSync(resolvedConfigPath)) {
      throw new Error(`Файл конфигурации '${configPath}' не существует.`);
   }

   let rawConfig = {};
   try {
      rawConfig = fs.readJSONSync(resolvedConfigPath);
   } catch (e) {
      e.message = `Файл конфигурации ${configPath} не корректен. Он должен представлять собой JSON-документ в кодировке UTF8. Ошибка: ${
         e.message
      }`;
      throw e;
   }
   checkModules(rawConfig);
   return rawConfig;
}

function checkModules(rawConfig) {
   if (!rawConfig.hasOwnProperty('modules')) {
      throw new Error('Не задан обязательный параметр modules');
   }
   if (!Array.isArray(rawConfig.modules)) {
      throw new Error('Параметр modules должен быть массивом');
   }
   if (rawConfig.modules.length === 0) {
      throw new Error('Массив modules должен быть не пустым');
   }
   for (const module of rawConfig.modules) {
      if (!module.hasOwnProperty('path') || !module.path) {
         throw new Error('Для модуля не задан обязательный параметр path');
      }
      if (!fs.pathExistsSync(module.path)) {
         throw new Error(`Директория ${module.path} не существует`);
      }
   }
}

module.exports = {
   getProcessParameters,
   readConfigFileSync
};
