/* eslint-disable no-sync */
/**
 * Генерирует поток выполнения сборки одного less файла при измении
 * Вызывается из WebStorm, например.
 * @author Бегунов Ал. В.
 */

'use strict';

const path = require('path'),
   gulp = require('gulp'),
   gulpIf = require('gulp-if'),
   fs = require('fs-extra'),
   gulpRename = require('gulp-rename'),
   gulpChmod = require('gulp-chmod'),
   plumber = require('gulp-plumber');

const Cache = require('./classes/cache'),
   Configuration = require('./classes/configuration.js'),
   ConfigurationReader = require('../common/configuration-reader'),
   generateTaskForCollectThemes = require('./generate-task/collect-style-themes'),
   TaskParameters = require('../common/classes/task-parameters'),
   compileLess = require('./plugins/compile-less'),
   generateTaskForPrepareWS = require('../common/generate-task/prepare-ws'),
   logger = require('../../lib/logger').logger(),
   transliterate = require('../../lib/transliterate');

const {
   needSymlink,
   generateTaskForLoadCache,
   generateTaskForInitWorkerPool,
   generateTaskForTerminatePool
} = require('../common/helpers');

/**
 * Генерирует поток выполнения сборки одного less файла при измении
 * @param {string[]} processArgv массив аргументов запуска утилиты
 * @returns {Undertaker.TaskFunction} gulp задача
 */
function generateBuildWorkflowOnChange(processArgv) {
   // загрузка конфигурации должна быть синхронной, иначе не построятся задачи для сборки модулей
   const config = new Configuration();
   config.loadSync(processArgv);

   const { filePath } = ConfigurationReader.getProcessParameters(processArgv);
   if (!filePath) {
      throw new Error('Не указан параметр --filePath');
   }

   const taskParameters = new TaskParameters(config, new Cache(config));

   // guardSingleProcess пришлось убрать из-за того что WebStorm может вызвать несколько процессов параллельно
   return gulp.series(
      generateTaskForLoadCache(taskParameters),
      generateTaskForCheckVersion(taskParameters),
      generateTaskForPrepareWS(taskParameters),
      generateTaskForInitWorkerPool(taskParameters),
      generateTaskForCollectThemes(taskParameters, config),
      generateTaskForBuildFile(taskParameters, filePath),
      generateTaskForTerminatePool(taskParameters)
   );
}

function generateTaskForBuildFile(taskParameters, filePath) {
   let currentModuleInfo;
   let sbis3ControlsPath = '';
   const pathsForImportSet = new Set();
   let filePathInProject = filePath;
   for (const moduleInfo of taskParameters.config.modules) {
      if (!currentModuleInfo) {
         let relativePath = path.relative(moduleInfo.path, filePath);

         // на windows если два файла на разных дисках, то path.relative даёт путь от диска, без ..
         if (!relativePath.includes('..') && !path.isAbsolute(relativePath)) {
            currentModuleInfo = moduleInfo;
         } else {
            // если модуль задан через симлинк, попробуем сопоставить файл и модуль
            const realModulePath = fs.realpathSync(moduleInfo.path);
            relativePath = path.relative(realModulePath, filePath);
            if (!relativePath.includes('..') && !path.isAbsolute(relativePath)) {
               currentModuleInfo = moduleInfo;
               filePathInProject = path.join(moduleInfo.path, relativePath);
            }
         }
      }
      pathsForImportSet.add(path.dirname(moduleInfo.path));
      if (path.basename(moduleInfo.path) === 'SBIS3.CONTROLS') {
         sbis3ControlsPath = moduleInfo.path;
      }
   }

   const pathsForImport = [...pathsForImportSet];
   if (!currentModuleInfo) {
      logger.info(`Файл ${filePathInProject} вне проекта`);
      return function buildModule(done) {
         done();
      };
   }
   return function buildModule() {
      return gulp
         .src(filePathInProject, { dot: false, nodir: true, base: currentModuleInfo.path })
         .pipe(
            plumber({
               errorHandler(err) {
                  logger.error({
                     message: 'Задача buildModule завершилась с ошибкой',
                     error: err,
                     currentModuleInfo
                  });
                  this.emit('end');
               }
            })
         )
         .pipe(compileLess(taskParameters, currentModuleInfo, sbis3ControlsPath, pathsForImport))
         .pipe(
            gulpRename((file) => {
               file.dirname = transliterate(file.dirname);
               file.basename = transliterate(file.basename);
            })
         )
         .pipe(gulpChmod({ read: true, write: true }))
         .pipe(
            gulpIf(
               needSymlink(taskParameters.config, currentModuleInfo),
               gulp.symlink(currentModuleInfo.output),
               gulp.dest(currentModuleInfo.output)
            )
         );
   };
}
function generateTaskForCheckVersion(taskParameters) {
   return function checkBuilderVersion(done) {
      const lastVersion = taskParameters.cache.lastStore.versionOfBuilder,
         currentVersion = taskParameters.cache.currentStore.versionOfBuilder;
      if (lastVersion !== currentVersion) {
         logger.error(
            `Текущая версия Builder'а (${currentVersion}) не совпадает с версией, ` +
               `сохранённой в кеше (${lastVersion}). ` +
               'Вероятно, необходимо передеплоить стенд.'
         );
      }
      done();
   };
}
module.exports = generateBuildWorkflowOnChange;
