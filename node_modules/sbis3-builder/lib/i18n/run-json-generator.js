'use strict';

/*
 * файл нужен для правильной загрузки run-json-generator.js в окружении тестов и в боевом окружении
 * (т.е. в составе jinnee).
 * json-generator - должен быть расположен в папке 'jinnee/distrib/json-generator'.
 * это позволяет выполнять сборку builder'а без флага --legacy-bundling
 */
const fs = require('fs-extra'),
   path = require('path'),
   logger = require('../logger').logger();

const libFromJinnee = path.join(__dirname, '../../../json-generator/run-json-generator.js');
logger.info(`Ищем json-generator по пути ${libFromJinnee}`);
if (fs.existsSync(libFromJinnee)) {
   // зависимость из jinnee
   logger.info(`Загружаем ${libFromJinnee}`);
   // eslint-disable-next-line global-require
   module.exports = require(libFromJinnee);
} else {
   // зависимость из devDependencies
   logger.info('Загружаем node_modules/sbis3-json-generator/run-json-generator.js');

   // eslint-disable-next-line node/no-unpublished-require, global-require
   module.exports = require('sbis3-json-generator/run-json-generator.js');
}
