/**
 * Генерация задачи архивации для файлов
 * @author Бегунов Ал. В.
 */

'use strict';

const gulp = require('gulp'),
   path = require('path'),
   plumber = require('gulp-plumber');

const gzipPlugin = require('../plugins/gzip'),
   logger = require('../../../lib/logger').logger();

/**
 * Генерация задачи архивации для файлов
 * @param {TaskParameters} taskParameters параметры для задач
 * @returns {Undertaker.TaskFunction|function(done)} В debug режиме вернёт пустышку, чтобы gulp не упал
 */
function generateTaskForGzip(taskParameters) {
   if (!taskParameters.config.gzip) {
      return function skipGzip(done) {
         done();
      };
   }

   const tasks = taskParameters.config.modules.map((moduleInfo) => {
      const moduleOutput = path.join(taskParameters.config.rawConfig.output, path.basename(moduleInfo.output));

      // интересны именно файлы на первом уровне вложенности в модулях
      const input = path.join(moduleOutput, '/**/*.*');

      return function gzip() {
         return gulp
            .src(input, { dot: false, nodir: true })
            .pipe(
               plumber({
                  errorHandler(err) {
                     logger.error({
                        message: 'Задача gzip завершилась с ошибкой',
                        error: err,
                        moduleInfo
                     });
                     this.emit('end');
                  }
               })
            )
            .pipe(gzipPlugin(moduleInfo))
            .pipe(gulp.dest(moduleOutput));
      };
   });

   return gulp.parallel(tasks);
}

module.exports = generateTaskForGzip;
