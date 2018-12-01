/// <amd-module name="EDM/LocalStorage/Source";

const LocalStorageWorker = {

    //Добавляет запись в localStorage
    addDocument(document: Document) {
        if (typeof localStorage !== 'undefined') {
            let pref :Array<Document> = JSON.parse(localStorage.getItem('documentData'));
            for (let i = 0, len = pref.length; i < len; i++) {
                if (pref[i].id === document.id)
                return;
            }
            document.sync = false;
            pref.push(document);
            localStorage.setItem('documentData', JSON.stringify(pref));
        }
    },

    //Удаляет запись из localStorage по id
    removeDocument(id: string) {
        if (typeof localStorage !== 'undefined') {
        let pref :Array<Document> = JSON.parse(localStorage.getItem('documentData'));
        
            //Ищем совпадения по id и удаляем найденный объект
            for (let i = 0, len = pref.length; i < len; i++) {
                if (pref[i].id === id) {
                    pref.splice(i,1);
                    break;
             }
            }
            localStorage.setItem('documentData', JSON.stringify(pref));
        }
    },

    //Читает и возвращает все записи
    readAll(){
        let pref: Array<Document> = [];
        if (typeof localStorage !== 'undefined') {
             pref = JSON.parse(localStorage.getItem('documentData'));
        }

        return pref;
    },

    //Ищет записи, которые содержат входную строку и возвращает массив подходящих записей
    search (line:string){
        if (typeof localStorage !== 'undefined') {
            let pref: Array<Document> = JSON.parse(localStorage.getItem('documentData'));
        
            let temp :Array<Document> = [];
            //Ищем совпадения указанной строки в title и description
            //Если совпадения есть, то добавляем объект в temp
            for (let i = 0, len = pref.length; i < len; i++) {
                if (pref[i].title.toLowerCase.indexOf(line.toLowerCase) !== -1)
                    temp.push(pref[i]);
    
                if (pref[i].description.toLowerCase.indexOf(line.toLowerCase) !== -1)
                    temp.push(pref[i]);
         }

            alert(JSON.stringify(temp));
            return temp;
        } else return [];
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
    update(id:string, document:Document) {
        if (typeof localStorage !== 'undefined') {
            let pref: Array<Document> = JSON.parse(localStorage.getItem('documentData'));

            for (let i = 0, len = pref.length; i < len; i++) {
                if (pref[i].id === id) {
                    pref[i] = document;
                    localStorage.setItem('documentData',JSON.stringify(pref));
                    return;
                }
            }
        
            //Если запись не была обновлена, то добавляем ее
            pref.push(document);
            localStorage.setItem('documentData',JSON.stringify(pref));
        }
    },

    //Фильтрация записей по указанному полю и значению
    //Возвращает список записей, удовлетворяющих условию фильтра
    filter(field:string, value:string) {
        if (typeof localStorage !== 'undefined') {
            let pref: Array<Document> = JSON.parse(localStorage.getItem('documentData'));

            let temp: Array<Document> = [];

            for (let i = 0, len = pref.length; i < len; i++) {
                if (pref[i][field] === value)
                    temp.push(pref[i]);
            }

            return temp;
        } else return [];
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