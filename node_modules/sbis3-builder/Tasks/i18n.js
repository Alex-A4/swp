/* eslint-disable no-invalid-this,no-sync,promise/catch-or-return,promise/prefer-await-to-then,promise/always-return */
'use strict';

const path = require('path'),
   fs = require('fs-extra'),
   async = require('async'),
   helpers = require('../lib/helpers'),
   logger = require('../lib/logger').logger(),
   indexDict = require('../lib/i18n/index-dictionary'),
   prepareXHTML = require('../lib/i18n/prepare-xhtml'),
   collectWords = require('../lib/i18n/collect-words'),
   runJsonGenerator = require('../lib/i18n/run-json-generator'),
   normalizeKeyDict = require('../lib/i18n/normalize-key');

/**
 * Получает список языков, которые будут доступны
 * @param languagesStr
 * @returns {Array}
 */
function getAvailableLang(languagesStr) {
   const availableLang = [];
   let lang, parts, local, country;

   const languages = languagesStr.replace(/"/g, '').split(';');
   for (let i = 0; i < languages.length; i++) {
      lang = languages[i];
      if (lang.length === 6 && lang[0] === '*') {
         lang = lang.substring(1, 6);
      }

      if (lang.length === 5) {
         parts = lang.split('-');
         local = parts[0].toLowerCase();
         country = parts[1].toUpperCase();
         lang = `${local}-${country}`;
         availableLang.push(lang);
      }
   }

   return availableLang;
}

/**
 * Подготавливаем ресурсы к переводу
 * Находит все xhtml файлы, разбирает их, и выискивает слова для перевода
 * Нужные слова обрамляет {[  ]}, для перевода с помощью шаблонизатора
 * Работаем по алгоритму:
 * 1 - ищем все xhtml файлы
 * 2 - разбираем их, и выискиваем простые текстовые ноды и компоненты
 * 3 - простые текстовые ноды просто обрамляем {[]}
 * 4 - Для компонента ищем его json файл с описанием
 * 5 - Если нашли файл с описанием, переводим внутренности, которые того требуют и уходим в глубь
 */
function runPrepareXHTML(root, componentsProperties, done) {
   try {
      logger.info('Подготавливаем xhtml файлы для локализации.');

      // Находим все xhtml файлы
      helpers.recurse(
         root,
         async(filePath, fileDone) => {
            if (/\.xhtml$/.test(filePath)) {
               try {
                  const text = (await fs.readFile(filePath)).toString();
                  if (text) {
                     await fs.writeFile(filePath, prepareXHTML(text, componentsProperties));
                  }
               } catch (err) {
                  logger.error({
                     message: 'Error on localization XHTML',
                     filePath,
                     error: err
                  });
               }
            }
            setImmediate(fileDone);
         },
         (err) => {
            if (err) {
               logger.error({ error: err });
            }
            done();
         }
      );
      logger.info('Подготовка xhtml файлов для локализации выполнена.');
   } catch (err) {
      logger.error({ error: err });
   }
}

function runCreateResultDictForDir(words, dir, componentsProperties) {
   return new Promise((resolve) => {
      helpers.recurse(
         dir,
         (filePath, fileDone) => {
            if (!helpers.validateFile(filePath, ['**/*.xhtml', '**/*.tmpl', '**/*.js'])) {
               setImmediate(fileDone);
               return;
            }
            fs.readFile(filePath, async function readFileCb(readFileError, textBuffer) {
               if (readFileError) {
                  logger.error({
                     message: 'Ошибка при чтении less файла',
                     error: readFileError,
                     filePath
                  });
                  setImmediate(fileDone);
                  return;
               }
               try {
                  const newWords = await collectWords(dir, filePath, textBuffer.toString(), componentsProperties);
                  Array.prototype.push.apply(words, newWords);
               } catch (error) {
                  logger.error({
                     message: 'Ошибка при сборе фраз для локализации',
                     error,
                     filePath
                  });
               }
               setImmediate(fileDone);
            });
         },
         (err) => {
            if (err) {
               logger.error({ error: err });
            }
            resolve();
         }
      );
   });
}

function runCreateResultDict(modules, componentsProperties, out) {
   return new Promise((resolve, reject) => {
      try {
         logger.info('Запускается построение результирующего словаря.');

         if (!out) {
            reject(new Error('Parameter "out" is not find'));
            return;
         }
         if (!modules) {
            reject(new Error('Parameter "modules" is not find'));
            return;
         }

         const paths = JSON.parse(fs.readFileSync(modules).toString());

         let curCountModule = 0;
         const words = [];

         async.eachSeries(
            paths,
            (dir, dirDone) => {
               runCreateResultDictForDir(words, dir, componentsProperties).then(
                  () => {
                     dirDone();
                     curCountModule += 1;
                     logger.progress(100 * curCountModule / paths.length, path.basename(dir));
                  },
                  (error) => {
                     dirDone(error);
                  }
               );
            },
            (err) => {
               if (err) {
                  logger.error({ error: err });
               }

               // Записать в результирующий словарь
               try {
                  fs.writeFileSync(out, JSON.stringify(words, null, 2));
               } catch (error) {
                  logger.error({
                     message: "Could't create output file ",
                     filePath: out,
                     error
                  });
               }

               logger.info('Построение результирующего словаря выполнено.');
               resolve();
            }
         );
      } catch (error) {
         reject(error);
      }
   });
}

module.exports = function register(grunt) {
   grunt.registerMultiTask('i18n', 'Translate static', async function i18nTask() {
      logger.info(`${grunt.template.today('hh:MM:ss')}: Запускается задача i18n.`);

      const taskDone = this.async();
      let taskCount = 0;
      let isDone = false;

      const readOption = (name) => {
         const value = grunt.option(name);
         if (!value) {
            return value;
         }
         if (typeof value === 'string') {
            return value.replace(/"/g, '');
         }
         return value;
      };

      const optModules = readOption('modules'),
         optJsonCache = readOption('json-cache'),
         optOut = readOption('out'),
         optIndexDict = readOption('index-dict'),
         optMakeDict = readOption('make-dict'),
         optPrepareXhtml = readOption('prepare-xhtml'),
         optJsonGenerate = readOption('json-generate');

      let componentsProperties = {};
      if (optPrepareXhtml || optMakeDict || optJsonGenerate) {
         const folders = await fs.readJSON(optModules);
         const resultJsonGenerator = await runJsonGenerator(folders, optJsonCache);
         for (const error of resultJsonGenerator.errors) {
            logger.warning({
               message: 'Ошибка при разборе JSDoc комментариев',
               filePath: error.filePath,
               error: error.error
            });
         }
         componentsProperties = resultJsonGenerator.index;
         if (optMakeDict) {
            try {
               ++taskCount;
               await runCreateResultDict(optModules, componentsProperties, optOut);
               done();
            } catch (error) {
               logger.error({ error });
            }
         }

         if (optPrepareXhtml) {
            runPrepareXHTML(this.data.cwd, componentsProperties, ++taskCount && done);
         }
      }

      if (optIndexDict) {
         const langs = getAvailableLang(optIndexDict),
            applicationRoot = path.join(this.data.root, this.data.application),
            resourceRoot = path.join(applicationRoot, 'resources');

         // Приводит повторяющиеся ключи в словарях к единому значению
         await normalizeKeyDict(resourceRoot, langs);
         indexDict(grunt, optIndexDict, this.data, ++taskCount && done);
      }

      if (taskCount === 0) {
         done();
      }

      function done(err) {
         if (err) {
            logger.error({ error: err });
         }

         if (!isDone && --taskCount <= 0) {
            logger.info(`${grunt.template.today('hh:MM:ss')}: Задача i18n выполнена.`);
            isDone = true;

            // i18n - особая таска. выполняется и отдельно и в составе default задачи
            logger.correctExitCode(false);
            taskDone();
         }
      }

      return true;
   });
};
