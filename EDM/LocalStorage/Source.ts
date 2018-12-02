/// <amd-module name="EDM/LocalStorage/Source";
import Service from 'EDM/Service';

const LocalStorageWorker = {

    //Добавляет запись в localStorage
    addDocument(document: Document) {
        if (typeof localStorage !== 'undefined') {
            let pref: Array<Document> = JSON.parse(localStorage.getItem('documentData'));
            for (let i = 0, len = pref.length; i < len; i++) {
                if (pref[i] !== null)
                    if (pref[i].id === document.id)
                        return;
            }
            document.sync = false;
            if (document !== null)
                pref = [document].concat(pref);
            localStorage.setItem('documentData', JSON.stringify(pref));
        }
    },

    //Удаляет запись из localStorage по id
    removeDocument(id: string) {
        if (typeof localStorage !== 'undefined') {
            let pref: Array<Document> = JSON.parse(localStorage.getItem('documentData'));
            //Ищем совпадения по id и удаляем найденный объект
            for (let i = 0, len = pref.length; i < len; i++) {
                if (pref[i] !== null)
                    if (pref[i].id === id) {
                        pref.splice(i, 1);
                        break;
                    }
            }
            localStorage.setItem('documentData', JSON.stringify(pref));
        }
    },

    //Читает и возвращает все записи
    readAll() {
        let pref: Array<Document> = [];
        if (typeof localStorage !== 'undefined') {
            pref = JSON.parse(localStorage.getItem('documentData'));
        }
        return pref;
    },

    //Ищет записи, которые содержат входную строку и возвращает массив подходящих записей
    search(line: string) {
        if (typeof localStorage !== 'undefined') {
            let pref: Array<Document> = JSON.parse(localStorage.getItem('documentData'));
            let temp: Array<Document> = [];
            //Ищем совпадения указанной строки в title и description
            //Если совпадения есть, то добавляем объект в temp
            for (let i = 0, len = pref.length; i < len; i++) {
                if (pref[i] === null)
                    continue;
                if (pref[i].title)
                    if (pref[i].title.toLowerCase().indexOf(line.toLowerCase()) !== -1)
                        temp.push(pref[i]);
                if (pref[i].description)
                    if (pref[i].description.toLowerCase().indexOf(line.toLowerCase()) !== -1)
                        temp.push(pref[i]);
            }
            return temp;
        } else
            return [];
    },

    //Используется в _beforeMount для инициализации
    initIfNotExist() {
        if (typeof localStorage !== 'undefined') {
            let pref: Array<Document> = JSON.parse(localStorage.getItem('documentData'));
            if (pref === null) {
                pref = [];
                localStorage.setItem('documentData', JSON.stringify(pref));
            }
        }
    },

    //Обновляет указанную запись в localStorage по id
    update(id: string, document: Document) {
        if (typeof localStorage !== 'undefined') {
            let pref: Array<Document> = JSON.parse(localStorage.getItem('documentData'));
            for (let i = 0, len = pref.length; i < len; i++) {
                if (pref[i] !== null)
                    if (pref[i].id === id) {
                        pref[i] = document;
                        localStorage.setItem('documentData', JSON.stringify(pref));
                        return;
                    }
            }
            //Если запись не была обновлена, то добавляем ее
            if (document !== null)
                pref = [document].concat(pref);
            localStorage.setItem('documentData', JSON.stringify(pref));
        }
    },

    //Фильтрация записей по указанному полю и значению
    //Возвращает список записей, удовлетворяющих условию фильтра
    filter(field: string, value: boolean) {
        if (typeof localStorage !== 'undefined') {
            let pref: Array<Document> = JSON.parse(localStorage.getItem('documentData'));
            let temp: Array<Document> = [];
            for (let i = 0, len = pref.length; i < len; i++) {
                if (pref[i] !== null)
                    if (pref[i][field] === value)
                        temp.push(pref[i]);
            }
            return temp;
        } else
            return [];
    },

    //Слияние входного массива с localStorage
    merge(arr: Array<Document>) {
        if (typeof localStorage !== 'undefined') {
            let pref: Array<Document> = JSON.parse(localStorage.getItem('documentData'));
            for (let i = 0, len = pref.length; i < len; i++) {
                let j, newLen = arr.length;

                //Ищем соответствие id для обновления записи
                for (j = 0; j < newLen; j++) {
                    if (pref[i] !== null && arr[j] !== null)
                        if (arr[j].id === pref[i].id) {
                            pref[i] = arr[j];
                            //Удаляем элемент из массива
                            arr.splice(j, 1);
                            break;
                        }
                }
                
                if (j === newLen) {
                    if (pref[i].sync === false) {
                        new Service(location.origin).post('api/update', {id: pref[i].id, document: pref[i]});
                        pref[i].sync = true;
                    }else {
                        pref.splice(i,1);
                        i--;
                        len--;
                    }
                }
            }
            //По окончании цикла в arr должны остаться только новые элементы, которые добавляем в конец pref
            pref = arr.concat(pref);
            localStorage.setItem('documentData', JSON.stringify(pref));
        }
    }
}
// Пример объекта
// {
//     id: '1243',
//     title: 'Prodam GARAGE',
//     description: 'Hochy prodat garage pod samagon',
//     date: '10.11.2018',
//     time: '15:32',
//     author: 'Dima'
// }

export default LocalStorageWorker;
