'use strict';

const minimatch = require('minimatch');
const async = require('async');
const path = require('path');
const fs = require('fs-extra');
const zlib = require('zlib');
const logger = require('./logger').logger();

const isWindows = process.platform === 'win32';

const writeOptions = { flag: 'wx' };
const gzOptions = {
   level: zlib.Z_BEST_COMPRESSION,
   strategy: zlib.Z_DEFAULT_STRATEGY
};
const dblSlashes = /\\/g;

function copyFile(target, dest, dataToCopy, cb) {
   if (dataToCopy) {
      writeFile(dest, dataToCopy, cb);
   } else {
      fs.readFile(target, (err, data) => {
         if (err) {
            logger.error({
               error: err
            });
            cb();
         } else {
            writeFile(dest, data, cb);
         }
      });
   }
}

function mkSymlink(target, dest, cb) {
   const link = function(linkTarget, linkDest, linkCb) {
      fs.symlink(linkTarget, linkDest, (linkErr) => {
         if (linkErr && linkErr.code === 'ENOENT') {
            fs.ensureDir(path.dirname(linkDest), (err) => {
               if (!err || err.code === 'EEXIST') {
                  link(linkTarget, linkDest, linkCb);
               } else {
                  logger.error({
                     error: err
                  });
                  linkCb();
               }
            });
         } else if (linkErr && linkErr.code !== 'EEXIST') {
            logger.error({
               error: linkErr
            });
            linkCb();
         } else {
            linkCb();
         }
      });
   };

   link(target, dest, cb);
}

function recurse(input, handler, done, limit) {
   fs.readdir(input, (err, files) => {
      if (!err) {
         async.eachLimit(
            files,
            limit || 20,
            (file, cb) => {
               const prettyFilePath = file.normalize();
               const abspath = path.join(input, prettyFilePath);

               fs.lstat(abspath, (statErr, stats) => {
                  if (!statErr) {
                     if (stats.isDirectory()) {
                        recurse(abspath, handler, cb, Math.floor(limit / 1.2) || 1);
                     } else {
                        handler(abspath, cb);
                     }
                  } else {
                     cb(statErr);
                  }
               });
            },
            (limitErr) => {
               done(limitErr);
            }
         );
      }
   });
}

function validateFile(file, patterns) {
   let passed = false;

   for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const neg = pattern.charAt(0) === '!';

      if (minimatch(file, pattern)) {
         if (!neg) {
            passed = true;
         }
      } else if (neg) {
         passed = false;
         break;
      }
   }

   return passed;
}

function percentage(x, all) {
   return Math.floor(x * 100 / all);
}

function sortObject(obj, comparator) {
   const sorted = {};
   Object.keys(obj)
      .sort(comparator)
      .forEach((key) => {
         const val = obj[key];
         if (Array.isArray(val)) {
            sorted[key] = val.sort();
         } else if (val instanceof Object) {
            sorted[key] = sortObject(val, comparator);
         } else {
            sorted[key] = val;
         }
      });
   return sorted;
}

function writeFile(dest, data, cb) {
   fs.writeFile(dest, data, writeOptions, (writeErr) => {
      if (writeErr && writeErr.code === 'ENOENT') {
         fs.ensureDir(path.dirname(dest), (err) => {
            if (!err || err.code === 'EEXIST') {
               writeFile(dest, data, cb);
            } else {
               logger.error({
                  error: err
               });
               cb();
            }
         });
      } else if (writeErr && writeErr.code !== 'EEXIST') {
         logger.error({
            error: writeErr
         });
         cb();
      } else {
         cb();
      }
   });
}

function writeGzip(dest, data, callback) {
   zlib.gzip(data, gzOptions, (err, compressed) => {
      if (!err) {
         writeFile(dest, compressed, callback);
      } else {
         logger.error({
            error: err
         });
         callback();
      }
   });
}

function gzip(data) {
   return new Promise((resolve, reject) => {
      zlib.gzip(data, gzOptions, (err, compressed) => {
         if (err) {
            reject(err);
         } else {
            resolve(compressed);
         }
      });
   });
}

// получить первую папку в относительном пути. нужно для получения папки модуля
function getFirstDirInRelativePath(relativePath) {
   const parts = relativePath.replace(dblSlashes, '/').split('/');

   // в пути должно быть минимум два элемента: имя папки модуля и имя файла.
   if (parts.length < 2) {
      return relativePath;
   }

   // если путь начинается со слеша, то первый элемент - пустая строка
   return parts[0] || parts[1];
}

/**
 * Преобразует пути к одному формату. Для сетевых путей на windows слеш "\", а для всех остальных "/".
 * Нужно, например, для вывода путей в итоговые файлы и для сравнения путей на эквивалетность.
 * @param {string} filePath путь до файла или папки
 * @returns {string}
 */

function prettifyPath(filePath) {
   if (!filePath || typeof filePath !== 'string') {
      return '';
   }

   // специальная обработка для путей сетевого SDK, что используется для сборки под Windows на Jenkins
   if (isWindows && /^[\\|/]{2}.*/.test(filePath)) {
      return `\\${filePath.replace(/\//g, '\\').replace(/\\\\/g, '\\')}`;
   }

   return unixifyPath(filePath);
}

/**
 * Преобразует пути к unix формату. Сетевой путь в windows станет не рабочим от такого преобразования.
 * Нужно, например, для сравнения путей с помощью метода endsWith.
 * @param {string} filePath путь до файла или папки
 * @returns {string}
 */
function unixifyPath(filePath) {
   if (!filePath || typeof filePath !== 'string') {
      return '';
   }

   return path
      .normalize(filePath)
      .replace(dblSlashes, '/')
      .replace(/\/\//g, '/');
}

function removeLeadingSlash(filePath) {
   let newFilePath = filePath;
   if (newFilePath) {
      const head = newFilePath.charAt(0);
      if (head === '/' || head === '\\') {
         newFilePath = newFilePath.substr(1);
      }
   }
   return newFilePath;
}

function removeLatestSlash(filePath) {
   if (filePath.endsWith('/') || filePath.endsWith('\\')) {
      return filePath.slice(0, filePath.length - 1);
   }
   return filePath;
}

async function tryRemoveFolder(folder) {
   try {
      await fs.remove(folder);
   } catch (e) {
      return e;
   }
   return null;
}

const delay = function(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
};

const promisifyDeferred = function(deferred) {
   return new Promise((resolve, reject) => {
      deferred
         .addCallback((result) => {
            resolve(result);
         })
         .addErrback((error) => {
            reject(error);
         });
   });
};

/**
 * Сравнивает два объекта без рекурсии
 * @param {Object} a перый аргумент
 * @param {Object} b второй аргумент
 * @returns {boolean}
 */
function isEqualObjectFirstLevel(a, b) {
   if (!a || !b) {
      return false;
   }

   const arrKey = Object.keys(a);

   if (arrKey.length !== Object.keys(b).length) {
      return false;
   }

   return arrKey.every((key) => {
      if (b.hasOwnProperty(key) && a[key] === b[key]) {
         return true;
      }
      return false;
   });
}


module.exports = {
   writeFile,
   writeGzip,
   copyFile,
   mkSymlink,
   recurse,
   validateFile,
   percentage,
   sortObject,
   getFirstDirInRelativePath,
   prettifyPath,
   unixifyPath,
   removeLeadingSlash,
   removeLatestSlash,
   tryRemoveFolder,
   delay,
   promisifyDeferred,
   gzip,
   isEqualObjectFirstLevel
};
