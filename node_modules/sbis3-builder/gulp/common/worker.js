/**
 * Воркер для пула воркеров. Используется для сборки статики и сбора локализуемых фраз.
 * @author Бегунов Ал. В.
 */

/* eslint-disable no-console, global-require, no-inner-declarations */
'use strict';

/**
 * Попытаемся получить текущую рабочую директорию Node.js.
 * Если произойдёт ошибка, возьмём в качестве CWD директорию
 * основного процесса Node.js, которую мы получим из окружения
 * пула воркеров
 * @returns {*}
 */
function checkCWDAvailability() {
   try {
      const currentDir = process.cwd();
      return currentDir;
   } catch (error) {
      console.log('cwd потеряна. Скорее всего директория, из которой был запущен воркер, была удалена.' +
         'В таком случае возьмём cwd основного процесса Node.js');
      return false;
   }
}

// не всегда понятно по 10 записям, откуда пришёл вызов.
Error.stackTraceLimit = 100;

if (!checkCWDAvailability()) {
   console.log('Меняем cwd воркера на cwd основного процесса Node.js');
   process.chdir(process.env['main-process-cwd']);
}

// логгер - прежде всего
require('../../lib/logger').setWorkerLogger();

const logger = require('../../lib/logger').logger();
const needInitWs = process.env['init-ws'] === 'true';

try {
   process.on('unhandledRejection', (reason, p) => {
      console.log(
         "[00:00:00] [ERROR] Критическая ошибка в работе worker'а. ",
         'Unhandled Rejection at:\n',
         p,
         '\nreason:\n',
         reason
      );
      process.exit(1);
   });

   if (needInitWs) {
      // ws должен быть вызван раньше чем первый global.requirejs
      const nodeWS = require('./node-ws');
      nodeWS.init();
   }

   /**
    * require данного набора функционала требует инициализации ядра
    * для работы. Поэтому обьявление данных функций выполняем только
    * в случае инициализации ядра.
    */
   let processingTmpl, prepareXHTMLPrimitive,
      buildXhtmlPrimitive, collectWordsPrimitive;
   if (needInitWs) {
      processingTmpl = require('../../lib/processing-tmpl');
      prepareXHTMLPrimitive = require('../../lib/i18n/prepare-xhtml');
      buildXhtmlPrimitive = require('../../lib/processing-xhtml').buildXhtml;
      collectWordsPrimitive = require('../../lib/i18n/collect-words');
   }

   const fs = require('fs-extra'),
      workerPool = require('workerpool'),
      compileEsAndTs = require('../../lib/compile-es-and-ts'),
      buildLess = require('../../lib/build-less'),
      parseJsComponent = require('../../lib/parse-js-component'),
      processingRoutes = require('../../lib/processing-routes'),
      runMinifyCss = require('../../lib/run-minify-css'),
      runMinifyXhtmlAndHtml = require('../../lib/run-minify-xhtml-and-html'),
      uglifyJs = require('../../lib/run-uglify-js'),
      { wrapWorkerFunction } = require('./helpers');

   let componentsProperties;

   /**
    * Прочитать описание компонетов из json для локализации. Или взять прочитанное ранее.
    * @param {string} componentsPropertiesFilePath путь до json-файла описания компонентов
    * @returns {Promise<Object>}
    */
   async function readComponentsProperties(componentsPropertiesFilePath) {
      if (!componentsProperties) {
         if (await fs.pathExists(componentsPropertiesFilePath)) {
            componentsProperties = await fs.readJSON(componentsPropertiesFilePath);
         } else {
            componentsProperties = {};
         }
      }
      return componentsProperties;
   }

   /**
    * Компиляция tmpl файлов
    * @param {string} text содержимое файла
    * @param {string} relativeFilePath относительный путь до файла (начинается с имени модуля)
    * @param {string} componentsPropertiesFilePath путь до json-файла описания компонентов
    * @returns {Promise<{text, nodeName, dependencies}>}
    */
   async function buildTmpl(text, relativeFilePath, componentsPropertiesFilePath, templateExt) {
      return processingTmpl.buildTmpl(
         processingTmpl.minifyTmpl(text),
         relativeFilePath,
         await readComponentsProperties(componentsPropertiesFilePath),
         templateExt
      );
   }

   /**
    * Компиляция html.tmpl файлов
    * @param {string} text содержимое файла
    * @param {string} fullPath полный путь до файла
    * @param {string} relativeFilePath относительный путь до файла (начинается с имени модуля)
    * @param {string} componentsPropertiesFilePath путь до json-файла описания компонентов
    * @param {boolean} isMultiService является ли проект мультисервисным
    * @param {string} servicesPath путь к текущему сервису
    * @returns {Promise<string>}
    */
   async function buildHtmlTmpl(
      text,
      fullPath,
      relativeFilePath,
      componentsPropertiesFilePath,
      isMultiService,
      servicesPath
   ) {
      return processingTmpl.buildHtmlTmpl(
         text,
         fullPath,
         relativeFilePath,
         await readComponentsProperties(componentsPropertiesFilePath),
         true,
         isMultiService,
         servicesPath
      );
   }

   /**
    * Для xhtml В XML формате расставляются скобки {[]} - аналог rk - для локализцемых фраз
    * (строки в разметке и переводимые опции).
    * @param {string} text содержимое файла
    * @param {string} componentsPropertiesFilePath путь до json-файла описания компонентов
    * @returns {Promise<String>}
    */
   async function prepareXHTML(text, componentsPropertiesFilePath) {
      return prepareXHTMLPrimitive(text, await readComponentsProperties(componentsPropertiesFilePath));
   }

   /**
    * Компиляция xhtml в js
    * @param {string} text содержимое файла
    * @param {string} relativeFilePath относительный путь до файла (начинается с имени модуля)
    * @returns {Promise<{nodeName, text}>}
    */
   async function buildXhtml(text, relativeFilePath) {
      return buildXhtmlPrimitive(await runMinifyXhtmlAndHtml(text), relativeFilePath);
   }

   /**
    * Сбор локализуемых фрах для конкретного файла
    * @param {string} modulePath путь до модуля
    * @param {string} filePath путь до файла
    * @param {string} componentsPropertiesFilePath путь до json-файла описания компонентов
    * @returns {Promise<string[]>}
    */
   async function collectWords(modulePath, filePath, componentsPropertiesFilePath) {
      if (!componentsProperties) {
         componentsProperties = await fs.readJSON(componentsPropertiesFilePath);
      }
      const text = await fs.readFile(filePath);
      return collectWordsPrimitive(modulePath, filePath, text.toString(), componentsProperties);
   }

   workerPool.worker({
      parseJsComponent: wrapWorkerFunction(parseJsComponent),
      parseRoutes: wrapWorkerFunction(processingRoutes.parseRoutes),
      buildLess: wrapWorkerFunction(buildLess),
      compileEsAndTs: wrapWorkerFunction(compileEsAndTs),
      buildTmpl: wrapWorkerFunction(buildTmpl),
      buildHtmlTmpl: wrapWorkerFunction(buildHtmlTmpl),
      prepareXHTML: wrapWorkerFunction(prepareXHTML),
      buildXhtml: wrapWorkerFunction(buildXhtml),
      minifyCss: wrapWorkerFunction(runMinifyCss),
      minifyXhtmlAndHtml: wrapWorkerFunction(runMinifyXhtmlAndHtml),
      uglifyJs: wrapWorkerFunction(uglifyJs),
      collectWords: wrapWorkerFunction(collectWords)
   });
} catch (workerInitError) {
   logger.error({
      message: 'Ошибка инициализации Worker\'а',
      error: workerInitError
   });
}
