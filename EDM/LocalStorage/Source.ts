/// <amd-module name="EDM/LocalStorage/Source";

const LocalStorageWorker = {

    //Добавляет запись в localStorage
    addDocument(document: Document) {
        let pref :Array<Document> = JSON.parse(localStorage.getItem('documentData'));
        for (let i = 0, len = pref.length; i < len; i++) {
            if (pref[i].id === document.id)
            return;
        }
        pref.push(document);
        localStorage.setItem('documentData', JSON.stringify(pref));
    },

    //Удаляет запись из localStorage по id
    removeDocument(id: string) {
        let pref :Array<Document> = JSON.parse(localStorage.getItem('documentData'));
        
        //Ищем совпадения по id и удаляем найденный объект
        for (let i = 0, len = pref.length; i < len; i++) {
            if (pref[i].id === id) {
                pref.splice(i,1);
                break;
            }
        }
        localStorage.setItem('documentData', JSON.stringify(pref));
    },

    //Читает и возвращает все записи
    readAll(){
        let pref: Array<Document> = JSON.parse(localStorage.getItem('documentData'));
        return pref;
    },

    //Ищет записи, которые содержат входную строку и возвращает массив подходящих записей
    search (line:string){
        let pref: Array<Document> = JSON.parse(localStorage.getItem('documentData'));
        
        let temp :Array<Document> = [];
        //Ищем совпадения указанной строки в title и description
        //Если совпадения есть, то добавляем объект в temp
        for (let i = 0, len = pref.length; i < len; i++) {
            if (pref[i].title.indexOf(line) !== -1)
                temp.push(pref[i]);
    
            if (pref[i].description.indexOf(line) !== -1)
                temp.push(pref[i]);
        }

        alert(JSON.stringify(temp));
        return temp;
    },

    //Используется в _beforeMount для инициализации
    initIfNotExist() {
        if (localStorage) {
            let pref: Array<Document> = JSON.parse(localStorage.getItem('documentData'));

            if (pref === null) {
                pref = [];
                localStorage.setItem('documentData', JSON.stringify(pref));
            }
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