/**
 * Воркер для пула воркеров компиляции ES6 и TS.
 * @author Бегунов Ал. В.
 */

'use strict';

// не всегда понятно по 10 записям, откуда пришёл вызов.
Error.stackTraceLimit = 100;

process.on('unhandledRejection', (reason, p) => {
   // eslint-disable-next-line no-console
   console.log(
      "[00:00:00] [ERROR] Критическая ошибка в работе worker'а. ",
      'Unhandled Rejection at:\n',
      p,
      '\nreason:\n',
      reason
   );
   process.exit(1);
});

// логгер - прежде всего
require('../../lib/logger').setWorkerLogger();

const
   workerPool = require('workerpool'),
   compileEsAndTs = require('../../lib/compile-es-and-ts'),
   { wrapWorkerFunction } = require('./helpers');

workerPool.worker({
   compileEsAndTs: wrapWorkerFunction(compileEsAndTs)
});
