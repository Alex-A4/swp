define('Core/helpers/Hcontrol/configStorage', [
   'Core/helpers/Number/randomId'
], function (
   randomId
) {
    /**
     *
     * Модуль работы с хранилищем настроек контролов.
     * @class Core/helpers/Hcontrol/configStorage
     * @public
     * @author Шипин А.А.
     */

   var
       clientConfigAttrPrefix = 'cfg-',
       configStorage = {},
       getCS = function getCS() {
          if (typeof process !== 'undefined' && process && process.domain && process.domain.req) {
              if (!process.domain.req.localGlobalStorage) {
                  process.domain.req.localGlobalStorage = {};
              }
             return process.domain.req.localGlobalStorage;
          }

          return configStorage;
       };

   var configStorages = /** @lends Core/helpers/Hcontrol/configStorage.prototype */{
       /**
        *
        * @param key
        * @param value
        */
       setValue: function (key, value) {
          getCS()[key] = value;
       },
       /**
        *
        * @param json
        * @returns {string|*}
        */
       pushValue: function (json) {
           var id;
           id = randomId(clientConfigAttrPrefix);
           configStorages.setValue(id, json);
           return id;
       },
       /**
        *
        * @param cfgObject
        */
       merge: function (cfgObject) {
           for (var prop in cfgObject) {
               if (cfgObject.hasOwnProperty(prop)) {
                   configStorages.setValue(prop, cfgObject[prop]);
                   if (configStorages.hasKey(prop) === undefined) {
                       configStorages.deleteKey(prop);
                   }
               }
           }
       },
       /**
        *
        * @param Key
        */
       deleteString: function (Key) {
           if (Key && Key.indexOf(clientConfigAttrPrefix) === 0) {
               configStorages.deleteKey(Key);
           }
       },
       /**
        *
        * @param key
        */
       deleteKey: function (key) {
           delete getCS()[key];
       },
       /**
        *
        */
       clear: function () {
           if (typeof process !== 'undefined' && process && process.domain && process.domain.req) {
              process.domain.req.localGlobalStorage = {};
           } else {
               configStorage = {};
           }
       },
       /**
        *
        * @param key
        * @returns {*|{}}
        */
       getValue: function (key) {
           return getCS()[key] || {};
       },
       /**
        *
        * @param key
        * @returns {*|undefined}
        */
       hasKey: function (key) {
           return getCS()[key] || undefined;
       },
       /**
        *
        * @returns {{}}
        */
       getData: getCS
   };

   return configStorages;
});
