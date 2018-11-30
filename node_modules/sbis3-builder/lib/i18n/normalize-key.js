'use strict';

const path = require('path');
const fs = require('fs-extra');
const logger = require('../logger').logger();
const pMap = require('p-map');

async function normalizeDicts(dictPaths) {
   const originalDicts = {};
   await pMap(
      dictPaths,
      async(dictPath) => {
         let result = {};
         if (await fs.pathExists(dictPath)) {
            try {
               result = await fs.readJSON(dictPath);
            } catch (e) {
               logger.error({
                  message: 'Ошибка чтения словаря локализации',
                  error: e,
                  filePath: dictPath
               });
            }
         }
         originalDicts[dictPath] = result;
      },
      {
         concurrency: 20
      }
   );

   const globalDict = Object.assign({}, ...dictPaths.map(dictPath => originalDicts[dictPath]));

   const needWrite = new Set();
   for (const dictPath of dictPaths) {
      for (const key of Object.keys(originalDicts[dictPath])) {
         if (originalDicts[dictPath][key] !== globalDict[key]) {
            originalDicts[dictPath][key] = globalDict[key];
            needWrite.add(dictPath);
         }
      }
   }
   await pMap(
      [...needWrite],
      async(dictPath) => {
         try {
            await fs.writeJSON(dictPath, originalDicts[dictPath], { spaces: 3 });
         } catch (e) {
            logger.error({
               message: 'Ошибка записи словаря локализации',
               error: e,
               filePath: dictPath
            });
         }
      },
      {
         concurrency: 20
      }
   );
}

/**
 * Находит все словари, формирует общий словарь исключая повторяющиеся ключи.
 * После чего приводит все повторяющиеся ключи к единому значению (зависит от порядка модулей в папке).
 * Обход модулей происходит по алфавиту.
 * @param resourceRoot - папка, в которой лежат модули
 * @param languages - массив доступных языков локализации
 */
async function normalize(resourceRoot, languages) {
   const namesDir = (await fs.readdir(resourceRoot)).sort();
   const promises = [];

   // Найдём все словари и для каждого языка локализации составим единный словарь.
   languages.forEach((lang) => {
      const dictPaths = namesDir.map(nameDir => path.normalize(path.join(resourceRoot, nameDir, 'lang', lang, `${lang}.json`)));
      promises.push(normalizeDicts(dictPaths));
   });
   return Promise.all(promises);
}

module.exports = normalize;
