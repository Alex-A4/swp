/**
 * Генерация задачи паковки для статических html.
 * @author Бегунов Ал. В.
 */

'use strict';
const gulp = require('gulp'),
   path = require('path'),
   plumber = require('gulp-plumber');

const logger = require('../../../lib/logger').logger(),
   DepGraph = require('../../../packer/lib/dependency-graph'),
   pluginPackHtml = require('../plugins/pack-html');

/**
 * Генерация задачи паковки для статических html.
 * @param {TaskParameters} taskParameters параметры для задач
 * @returns {Undertaker.TaskFunction|function(done)} В debug режиме вернёт пустышку, чтобы gulp не упал
 */
function generateTaskForPackHtml(taskParameters) {
   if (!taskParameters.config.deprecatedStaticHtml) {
      return function skipPackHtml(done) {
         done();
      };
   }
   const depGraph = new DepGraph();
   const tasks = taskParameters.config.modules.map((moduleInfo) => {
      const moduleOutput = path.join(taskParameters.config.rawConfig.output, path.basename(moduleInfo.output));

      // интересны именно файлы на первом уровне вложенности в модулях
      const input = path.join(moduleOutput, '/**/*.html');

      return function packHtml() {
         return gulp
            .src(input, { dot: false, nodir: true })
            .pipe(
               plumber({
                  errorHandler(err) {
                     logger.error({
                        message: 'Задача packHtml завершилась с ошибкой',
                        error: err,
                        moduleInfo
                     });
                     this.emit('end');
                  }
               })
            )
            .pipe(pluginPackHtml(taskParameters, moduleInfo, depGraph))
            .pipe(gulp.dest(moduleOutput));
      };
   });

   return gulp.series(
      generateTaskForLoadDG(taskParameters.cache, depGraph),
      gulp.parallel(tasks)
   );
}

function generateTaskForLoadDG(cache, depGraph) {
   return function load(done) {
      depGraph.fromJSON(cache.getModuleDependencies());
      done();
   };
}

module.exports = generateTaskForPackHtml;
