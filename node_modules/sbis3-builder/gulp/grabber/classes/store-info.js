/**
 * @author Бегунов Ал. В.
 */

'use strict';

const fs = require('fs-extra'),
   logger = require('../../../lib/logger').logger();

/**
 * Класс с данными про текущую сборку.
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

      // запоминаем соответствие "файл - список фраз для локализации"
      // 1. отследить восстановленный из корзины файл
      // 2. удалить лишние файлы
      this.cachedFiles = {};
   }

   async load(filePath) {
      try {
         if (await fs.pathExists(filePath)) {
            const obj = await fs.readJSON(filePath);
            this.runningParameters = obj.runningParameters;
            this.versionOfBuilder = obj.versionOfBuilder;
            this.startBuildTime = obj.startBuildTime;
            this.cachedFiles = obj.cachedFiles;
         }
      } catch (error) {
         logger.warning({
            message: `Не удалось прочитать файл кеша ${filePath}`,
            error
         });
      }
   }

   save(filePath) {
      return fs.outputJson(
         filePath,
         {
            runningParameters: this.runningParameters,
            versionOfBuilder: this.versionOfBuilder,
            startBuildTime: this.startBuildTime,
            cachedFiles: this.cachedFiles
         },
         {
            spaces: 1
         }
      );
   }
}

module.exports = StoreInfo;
