/* eslint-disable global-require */
'use strict';

const path = require('path');
const dblSlashes = /\\/g;

module.exports = function gruntMain(grunt) {
   try {
      const ver = process.versions.node;

      if (ver.split('.')[0] < 8) {
         // eslint-disable-next-line no-console
         console.error('nodejs >= v8.x required');
         process.exit(1);
      }

      process.on('unhandledRejection', (reason, p) => {
         // eslint-disable-next-line no-console
         console.log(
            "[ERROR] Критическая ошибка в работе builder'а. ",
            'Unhandled Rejection at:\n',
            p,
            '\nreason:\n',
            reason
         );
         process.exit(1);
      });

      // Read options
      const root = grunt.option('root') || '';
      const app = grunt.option('application') || '/';
      const versionize = grunt.option('versionize');
      const packaging = grunt.option('package');

      // Init environment
      const target = path.resolve(root);
      const application = path.join('/', app, '/').replace(dblSlashes, '/');
      const logger = require('./lib/logger').setGruntLogger(grunt);
      for (let i = 0; i < 50; i++) {
         logger.warning('Обнаружено использование Grunt. ' +
            'Чтобы перейти на Gulp, нужно удалить в проекте слой "Приложения" (s3app). ' +
            'Для облачных решений это означает переход на Сервис Представлений. ' +
            'Для desktop решений это просто отказ от ненужной сущности.');
      }
      const configBuilder = require('./lib/config-builder.js');

      process.env.ROOT = target;
      process.env.APPROOT = app;

      // Инициализация ws в текущем application
      require('./packer/lib/node-ws')();

      // Load tasks
      // для загрузки задач включаем verbose, чтобы видел stack ошибки, если вознкнет при require
      const oldVerbose = grunt.option('verbose');
      grunt.option('verbose', true);

      // используется как задача "replace:что-то"
      grunt.loadNpmTasks('grunt-text-replace');
      grunt.loadTasks('Tasks');
      grunt.loadTasks('Tasks/pack');
      grunt.loadTasks('packer/tasks');

      grunt.option('verbose', oldVerbose);

      // Init config
      grunt.file.mkdir(target);
      grunt.file.setBase(target);
      grunt.initConfig(configBuilder(grunt, target, application));

      const defaultTasks = [];

      if (versionize && typeof versionize === 'string') {
         defaultTasks.push('replace:core', 'replace:css', 'replace:res', 'ver-contents');
      }

      defaultTasks.push('i18n', 'collect-dependencies', 'routsearch');

      // таска replace:html, реализующая версионирование для html и tmpl, должна выполняться перед таской owndepspack
      if (packaging) {
         defaultTasks.push('cssmin', 'xhtmlmin', 'tmplmin', 'tmpl-build', 'xhtml-build');
         if (versionize && typeof versionize === 'string') {
            defaultTasks.push('replace:html');
         }

         /**
          * выполняем задачу минификации до какой-либо паковки. Минификатор физически не вывозит столь огромный объём
          * js-кода и сваливается через долгое время по таймауту, причём без ошибок.
          * packjs и packcss работают с *.min.* файлами
          */
         defaultTasks.push('owndepspack', 'uglify', 'custompack', 'packwsmod', 'gzip');
      }

      if (!packaging && versionize && typeof versionize === 'string') {
         defaultTasks.push('replace:html');
      }
      defaultTasks.push('correct-exit-code');

      grunt.fail.warn = grunt.fail.fatal;

      grunt.registerTask('default', defaultTasks);

      grunt.log.ok(`SBIS3 Builder v${require(path.join(__dirname, 'package.json')).version}`);
   } catch (error) {
      // eslint-disable-next-line no-console
      console.log("[ERROR] Критическая ошибка в работе builder'а: ", error.stack);
      process.exit(1);
   }
};

if (require.main === module) {
   // eslint-disable-next-line no-console
   console.log(require(path.join(__dirname, 'package.json')).version.split('-')[0]);
}
