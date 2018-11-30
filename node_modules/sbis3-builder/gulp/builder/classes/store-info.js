/**
 * @author Бегунов Ал. В.
 */
'use strict';

const fs = require('fs-extra'),
   path = require('path'),
   logger = require('../../../lib/logger').logger();

/**
 * Класс с данными про текущую сборку. Для реализации инкрементальной сборки.
 */
class StoreInfo {
   constructor() {
      // в случае изменений параметров запуска проще кеш сбросить,
      // чем потом ошибки на стенде ловить. не сбрасываем только кеш json
      this.runningParameters = {};

      // если поменялась версия билдера, могло помянятся решительно всё. и кеш json в том числе
      // unknown используется далее
      this.versionOfBuilder = 'unknown';

      // время начала предыдущей сборки. нам не нужно хранить дату изменения каждого файла
      // для сравнения с mtime у файлов
      this.startBuildTime = 0;

      // запоминаем что было на входе и что породило на выход, чтобы потом можно было
      // 1. отследить восстановленный из корзины файл
      // 2. удалить лишние файлы
      this.inputPaths = {};

      // для инкрементальной сборки нужно знать зависимости файлов:
      // - imports из less файлов
      // - зависимости js на файлы вёрстки для паковки собственных зависмостей
      this.dependencies = {};

      // нужно сохранять информацию о компонентах и роутингах для заполнения contents.json
      this.modulesCache = {};

      // Чтобы ошибки не терялись при инкрементальной сборке, нужно запоминать файлы с ошибками
      // и подавать их при повторном запуске как изменённые
      this.filesWithErrors = new Set();

      // Темы для компиляции less. <Имя темы>: <путь до файла <Имя темы>.less>
      this.styleThemes = {};
   }

   static getLastRunningParametersPath(filePath) {
      return path.join(path.dirname(filePath), 'last_build_gulp_config.json');
   }

   async load(filePath) {
      logger.debug(`Читаем файл кеша ${filePath}`);

      try {
         if (await fs.pathExists(filePath)) {
            this.runningParameters = await fs.readJSON(StoreInfo.getLastRunningParametersPath(filePath));

            const obj = await fs.readJSON(filePath);
            this.versionOfBuilder = obj.versionOfBuilder;
            logger.debug(`В кеше versionOfBuilder: ${this.versionOfBuilder}`);
            this.startBuildTime = obj.startBuildTime;
            logger.debug(`В кеше startBuildTime: ${this.startBuildTime}`);
            this.inputPaths = obj.inputPaths;
            this.dependencies = obj.dependencies;
            this.modulesCache = obj.modulesCache;
            this.filesWithErrors = new Set(obj.filesWithErrors);
            this.styleThemes = obj.styleThemes;
         }
      } catch (error) {
         logger.info({
            message: `Не удалось прочитать файл кеша ${filePath}`,
            error
         });
      }
   }

   async save(filePath) {
      await fs.outputJson(
         filePath,
         {
            versionOfBuilder: this.versionOfBuilder,
            startBuildTime: this.startBuildTime,
            inputPaths: this.inputPaths,
            dependencies: this.dependencies,
            modulesCache: this.modulesCache,
            filesWithErrors: [...this.filesWithErrors],
            styleThemes: this.styleThemes
         },
         {
            spaces: 1
         }
      );

      await fs.outputJson(
         StoreInfo.getLastRunningParametersPath(filePath),
         this.runningParameters,
         {
            spaces: 1
         }
      );
   }


   /**
    * Получить набор выходных файлов. Нужно чтобы получать разницы между сборками и удалять лишнее.
    * @returns {Set<string>}
    */
   getOutputFilesSet() {
      const resultSet = new Set();
      for (const filePath in this.inputPaths) {
         if (!this.inputPaths.hasOwnProperty(filePath)) {
            continue;
         }
         for (const outputFilePath of this.inputPaths[filePath].output) {
            resultSet.add(outputFilePath);
         }
      }
      return resultSet;
   }
}

module.exports = StoreInfo;
