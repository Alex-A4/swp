/// <amd-module name="Transport/_utils" />
import {AbortPromise} from 'fetch.d';

/**
 * Добавляет к экземпляру Promise метод abort для обрыва запроса
 * @param {Promise.<T>} originPromise
 * @param {AbortController | Transport/AbortPromise} [abortController]
 * @return {Transport/AbortPromise.<T>}
 * @name Transport/_utils#getAbortedPromise
 */
export let getAbortedPromise = <T>(
    originPromise: Promise<T>,
    abortController?: any & {
        abort(): void;
    }
): AbortPromise<T> => {
    return Object.assign(originPromise, {
        abort() {
            if (abortController){
                abortController.abort();
            }
        }
    });
};

/**
 * Возвращает Promise.<void>, который будет выполнен через заданный промежуток времени
 * @param {Number} time
 * @return {Promise.<void>}
 * @name Transport/_utils#delay
 */
export let delay = (time?: number) => new Promise((res) => {
    setTimeout(res, time || 0);
});
