/// <amd-module name="Data/_collection/comparator" />
/**
 * Позволяет сравнить две коллекции до и после набора изменений
 * @class WS.Data/Collection/Comparer
 * @author Мальцев А.А.
 */
define('Data/_collection/comparator', [
    'require',
    'exports',
    'Data/_collection/IBind'
], function (require, exports, IBind_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var sessionId = 0;    /**
     * Возвращает уникальный идентификатор сессии
     * @return {Number}
     */
    /**
     * Возвращает уникальный идентификатор сессии
     * @return {Number}
     */
    function getId() {
        if (sessionId > 65534) {
            sessionId = 0;
        }
        return sessionId++;
    }    /**
     * Извлекает элементы коллекции
     * @param {WS.Data/Collection/IEnumerable} collection Коллекция
     * @param {String} [contentsWrapper] Название метода, возвращающего содержимое элемента коллекции
     * @return {Object}
     */
    /**
     * Извлекает элементы коллекции
     * @param {WS.Data/Collection/IEnumerable} collection Коллекция
     * @param {String} [contentsWrapper] Название метода, возвращающего содержимое элемента коллекции
     * @return {Object}
     */
    function extractItems(collection, contentsWrapper) {
        var enumerator = collection.getEnumerator();
        var items = [];
        var contents = [];
        var item;
        enumerator.reset();
        while (enumerator.moveNext()) {
            item = enumerator.getCurrent();
            items.push(item);
            if (contentsWrapper) {
                contents.push(item[contentsWrapper]());
            }
        }
        return {
            items: items,
            contents: contentsWrapper ? contents : null
        };
    }    /**
     * Возвращает изменения группы
     * @param {String} groupName Название группы
     * @param {Object} session Сессия изменений
     * @param {WS.Data/Collection/IEnumerable} collection Коллекция
     * @param {Number} [startFrom=0] Начать с элемента номер
     * @param {Number} [offset=0] Смещение элеметов в after относительно before
     * @return {Object}
     */
    /**
     * Возвращает изменения группы
     * @param {String} groupName Название группы
     * @param {Object} session Сессия изменений
     * @param {WS.Data/Collection/IEnumerable} collection Коллекция
     * @param {Number} [startFrom=0] Начать с элемента номер
     * @param {Number} [offset=0] Смещение элеметов в after относительно before
     * @return {Object}
     */
    function getGroupChanges(groupName, session, collection, startFrom, offset) {
        session.addedProcessed = session.addedProcessed || [];
        session.removedProcessed = session.removedProcessed || {};
        var before = session.before;
        var after = session.after;
        var beforeContents = session.beforeContents;
        var afterContents = session.afterContents;
        var addedProcessed = session.addedProcessed;    //индексы новых элементов, которые уже были найдены
        //индексы новых элементов, которые уже были найдены
        var removedProcessed = session.removedProcessed;    //индексы удаленных элементов, которые уже были найдены
        //индексы удаленных элементов, которые уже были найдены
        var newItems = [];
        var newItemsIndex = 0;
        var oldItems = [];
        var oldItemsIndex = 0;
        var beforeItem;    //элемент до изменений
        //элемент до изменений
        var beforeIndex;    //индекс элемента до изменений
        //индекс элемента до изменений
        var afterItem;    //элемент после изменений
        //элемент после изменений
        var afterIndex;    //индекс элемента после изменений
        //индекс элемента после изменений
        var exit = false;
        var index;
        var count = Math.max(before.length, after.length);
        var skip;
        var lookUp;
        startFrom = startFrom || 0;
        offset = offset || 0;
        for (index = startFrom; index < count; index++) {
            beforeItem = before[index];
            afterItem = after[index];
            switch (groupName) {
            case 'added':
                //собираем добавленные элементы
                if (!afterItem) {
                    continue;
                }
                afterIndex = index;    //ищем индекс с учетом возможных дубликатов
                //ищем индекс с учетом возможных дубликатов
                skip = 0;
                lookUp = true;
                do {
                    beforeIndex = before.indexOf(afterItem, skip);
                    if (beforeIndex === -1) {
                        lookUp = false;
                    } else if (addedProcessed.indexOf(beforeIndex) > -1) {
                        //этот индекс мы уже находили, значит afterItem - дубль, ищем дальше
                        skip = beforeIndex + 1;
                    } else {
                        if (!newItems.length) {
                            //запомним найденный индекс
                            addedProcessed.push(beforeIndex);
                        }
                        lookUp = false;
                    }
                } while (lookUp);    //если элемента не было - добавим его в список новых,
                                     //если был - отдаем накопленный список новых, если там что-то есть
                //если элемента не было - добавим его в список новых,
                //если был - отдаем накопленный список новых, если там что-то есть
                if (beforeIndex === -1) {
                    //элемент добавлен
                    newItems.push(afterItem);
                    newItemsIndex = newItems.length === 1 ? afterIndex : newItemsIndex;
                } else if (newItems.length) {
                    exit = true;
                }
                break;
            case 'removed':
                //собираем удаленные элементы
                if (!beforeItem) {
                    continue;
                }
                beforeIndex = index;    //ищем индекс с учетом возможных дубликатов
                //ищем индекс с учетом возможных дубликатов
                skip = 0;
                lookUp = true;
                do {
                    afterIndex = after.indexOf(beforeItem, skip);
                    if (afterIndex === -1) {
                        lookUp = false;
                    } else if (removedProcessed[afterIndex]) {
                        //этот индекс мы уже находили, значит beforeItem - дубль, ищем дальше
                        skip = afterIndex + 1;
                    } else {
                        if (!oldItems.length) {
                            //запомним найденный индекс
                            removedProcessed[afterIndex] = true;
                        }
                        lookUp = false;
                    }
                } while (lookUp);    //если элемента не стало - добавим его в список старых,
                                     //если остался - отдаем накопленный список старых, если там что-то есть
                //если элемента не стало - добавим его в список старых,
                //если остался - отдаем накопленный список старых, если там что-то есть
                if (afterIndex === -1) {
                    oldItems.push(beforeItem);
                    oldItemsIndex = oldItems.length === 1 ? beforeIndex : oldItemsIndex;
                } else if (oldItems.length) {
                    exit = true;
                }
                break;
            case 'replaced':
                //собираем замененные элементы
                if (!beforeContents) {
                    index = -1;
                    exit = true;
                    break;
                }
                if (!afterItem) {
                    continue;
                }
                afterIndex = index;
                beforeIndex = before.indexOf(afterItem);    //если элемент на месте, но изменилось его содержимое - добавим новый в список новых, а для старого генерим новую обертку, которую добавим в список старых
                                                            //если остался - отдаем накопленные списки старых и новых, если в них что-то есть
                //если элемент на месте, но изменилось его содержимое - добавим новый в список новых, а для старого генерим новую обертку, которую добавим в список старых
                //если остался - отдаем накопленные списки старых и новых, если в них что-то есть
                if (beforeIndex === afterIndex && beforeContents[index] !== afterContents[index]) {
                    //FIXME: convertToItem
                    oldItems.push(collection._getItemsStrategy().convertToItem(beforeContents[index]));
                    newItems.push(afterItem);
                    oldItemsIndex = newItemsIndex = oldItems.length === 1 ? beforeIndex : oldItemsIndex;
                } else if (oldItems.length) {
                    exit = true;
                }
                break;
            case 'moved':
                //собираем перемещенные элементы
                if (before.length !== after.length) {
                    throw new Error('The "before" and "after" arrays are not synchronized by the length - "move" can\'t be applied.');
                }
                if (beforeItem === afterItem) {
                    if (oldItems.length === 0) {
                        continue;
                    }
                    exit = true;
                    break;
                }
                afterIndex = index;
                beforeIndex = before.indexOf(afterItem, index);
                if (beforeIndex !== afterIndex) {
                    if (oldItems.length && beforeIndex !== oldItemsIndex + oldItems.length || newItems.length && afterIndex !== newItemsIndex + newItems.length) {
                        exit = true;
                    } else {
                        if (oldItems.length === 0) {
                            oldItemsIndex = beforeIndex;
                        }
                        oldItems.push(afterItem);
                        if (newItems.length === 0) {
                            newItemsIndex = afterIndex;
                        }
                        newItems.push(afterItem);
                    }
                }
                break;
            }
            if (exit) {
                break;
            }
        }
        return {
            newItems: newItems,
            newItemsIndex: newItemsIndex,
            oldItems: oldItems,
            oldItemsIndex: oldItemsIndex,
            endAt: exit ? index : -1,
            offset: offset
        };
    }    /**
     * Применяет изменения группы
     * @param {String} groupName Название группы
     * @param {Object} changes Изменения группы
     * @param {Object} session Сессия изменений
     */
    /**
     * Применяет изменения группы
     * @param {String} groupName Название группы
     * @param {Object} changes Изменения группы
     * @param {Object} session Сессия изменений
     */
    function applyGroupChanges(groupName, changes, session) {
        var before = session.before;
        var beforeContents = session.beforeContents;
        var afterContents = session.afterContents;    //Производим с before действия согласно пачке изменений
        //Производим с before действия согласно пачке изменений
        switch (groupName) {
        case 'added':
            before.splice.apply(before, [
                changes.newItemsIndex,
                0
            ].concat(changes.newItems));
            if (session.addedProcessed) {
                var count = changes.newItems.length;
                for (var i = 0; i < session.addedProcessed.length; i++) {
                    if (session.addedProcessed[i] >= changes.newItemsIndex) {
                        session.addedProcessed[i] += count;
                    }
                }
                for (var i = 0; i < count; i++) {
                    session.addedProcessed.push(changes.newItemsIndex + i);
                }
            }
            if (beforeContents !== null) {
                var added = afterContents.slice(changes.newItemsIndex, changes.newItemsIndex + changes.newItems.length);
                beforeContents.splice.apply(beforeContents, [
                    changes.newItemsIndex,
                    0
                ].concat(added));
            }
            break;
        case 'removed':
            before.splice(changes.oldItemsIndex, changes.oldItems.length);
            if (beforeContents !== null) {
                beforeContents.splice(changes.oldItemsIndex, changes.oldItems.length);
            }
            if (changes.endAt !== -1) {
                changes.endAt -= changes.oldItems.length;
            }
            break;
        case 'replaced':
            before.splice.apply(before, [
                changes.oldItemsIndex,
                changes.oldItems.length
            ].concat(changes.newItems));
            if (beforeContents !== null) {
                var added = afterContents.slice(changes.newItemsIndex, changes.newItemsIndex + changes.newItems.length);
                beforeContents.splice.apply(beforeContents, [
                    changes.oldItemsIndex,
                    changes.oldItems.length
                ].concat(added));
            }
            break;
        case 'moved':
            var afterSpliceIndex = changes.oldItemsIndex + changes.oldItems.length > changes.newItemsIndex ? changes.newItemsIndex : changes.newItemsIndex - changes.oldItems.length + 1;
            before.splice(changes.oldItemsIndex, changes.oldItems.length);
            before.splice.apply(before, [
                afterSpliceIndex,
                0
            ].concat(changes.newItems));
            if (beforeContents !== null) {
                beforeContents.splice(changes.oldItemsIndex, changes.oldItems.length);
                var added = afterContents.slice(changes.newItemsIndex, changes.newItemsIndex + changes.newItems.length);
                beforeContents.splice.apply(beforeContents, [
                    afterSpliceIndex,
                    0
                ].concat(added));
            }
            if (changes.endAt !== -1 && changes.oldItemsIndex < changes.newItemsIndex) {
                changes.endAt -= changes.oldItems.length;
            }
            break;
        }
    }
    var comparator = {
        '[Data/_collection/comparator]': true,
        /**
         * Запускает сессию изменений коллекции (фиксирует ее состояние до изменений)
         * @param {WS.Data/Collection/IEnumerable} collection Коллекция
         * @param {String} [contentsWrapper] Название метода, возвращающего содержимое элемента коллекции
         * @return {Object}
         */
        startSession: function (collection, contentsWrapper) {
            var items = extractItems(collection, contentsWrapper);
            return {
                id: getId(),
                before: items.items,
                beforeContents: items.contents
            };
        },
        /**
         * Завершает сессию изменений коллекции (фиксирует ее состояние после изменений)
         * @param {Object} session Сессия изменений
         * @param {WS.Data/Collection/IEnumerable} collection Коллекция
         * @param {String} [contentsWrapper] Название метода, возвращающего содержимое элемента коллекции
         */
        finishSession: function (session, collection, contentsWrapper) {
            var items = extractItems(collection, contentsWrapper);
            session.after = items.items;
            session.afterContents = items.contents;
        },
        /**
         * Анализирует изменения в коллекции по завершенной сессии
         * @param {Object} session Сессия изменений
         * @param {WS.Data/Collection/IEnumerable} collection Коллекция
         * @param {Function} callback Функция обратного вызова для каждой пачки изменений
         */
        analizeSession: function (session, collection, callback) {
            //сначала удаление, потому что в listview при удалении/добалении одного элемента он сначала дублируется потом удаляются оба
            var groups = [
                'removed',
                'added',
                'replaced',
                'moved'
            ];
            var changes;
            var maxRepeats = Math.max(65535, groups.length * session.before.length * session.after.length);
            var startFrom;
            var offset;
            var groupName;
            var groupAction;    //Информируем об изменениях по группам
            //Информируем об изменениях по группам
            for (var groupIndex = 0; groupIndex < groups.length; groupIndex++) {
                //Собираем изменения в пачки (следующие подряд наборы элементов коллекции)
                startFrom = 0;
                offset = 0;
                groupName = groups[groupIndex];
                while (startFrom !== -1) {
                    //Очередная пачка
                    changes = getGroupChanges(groupName, session, collection, startFrom, offset);    //Есть какие-то изменения
                    //Есть какие-то изменения
                    if (changes.newItems.length || changes.oldItems.length) {
                        //Уведомляем
                        if (callback) {
                            groupAction = '';
                            switch (groupName) {
                            case 'added':
                                groupAction = IBind_1.default.ACTION_ADD;
                                break;
                            case 'removed':
                                groupAction = IBind_1.default.ACTION_REMOVE;
                                break;
                            case 'replaced':
                                groupAction = IBind_1.default.ACTION_REPLACE;
                                break;
                            case 'moved':
                                groupAction = IBind_1.default.ACTION_MOVE;
                                break;
                            }
                            callback(groupAction, changes);
                        }    //Синхронизируем состояние по пачке
                        //Синхронизируем состояние по пачке
                        applyGroupChanges(groupName, changes, session);
                    }    //Проверяем, все ли хорошо
                    //Проверяем, все ли хорошо
                    if (changes.endAt !== -1 && changes.endAt <= startFrom) {
                        maxRepeats--;
                        if (maxRepeats === 0) {
                            throw new Error('Endless cycle detected.');
                        }
                    }    //Запоминаем, на чем остановились
                    //Запоминаем, на чем остановились
                    startFrom = changes.endAt;
                    offset = changes.offset;
                }
            }
        }
    };
    exports.default = comparator;
});