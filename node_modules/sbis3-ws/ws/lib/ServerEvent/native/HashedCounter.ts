/// <amd-module name="Lib/ServerEvent/native/HashedCounter" />
import {SEB} from "../interfaces";

/**
 * Класс, который считает хэшированыне объекты и хранит одну копию
 */
export class HashedCounter<T extends SEB.IHashedSub> {
    private counter: {[hash: string]: number} = Object.create(null);
    /**
     * Храним только одну копию <T>
     */
    private list: T[] = [];

    constructor(countClones: boolean=true) {
        if (!countClones) {
            this.add = this.addWithoutCount.bind(this);
        }
    }

    /**
     * Добавляем подписку, если её нет и увеличиваем счётчик
     * @param {SEB.IHashedSub} item
     */
    add(item: T): void {
        let count = this.counter[item.hash()] || 0;
        count = count + 1;
        this.counter[item.hash()] = count;
        this.list.push(item);
    }

    /**
     * Добавляем подписку, если её нет и устанавливаем счётчик в единицу
     * @param {SEB.IHashedSub} item
     */
    private addWithoutCount(item: T) {
        let count = this.counter[item.hash()] || 0;
        if (count > 0) {
            return;
        }
        this.counter[item.hash()] = 1;
        this.list.push(item);
    }

    remove(item: T): void {
        let count = this.counter[item.hash()] || 0;
        if (count === 0) {
            return;
        }

        count = count - 1;
        this.counter[item.hash()] = count;
        if (count === 0) {
            this.list = this.list.filter((current: T) => {
                return current.hash() !== item.hash();
            });
            delete this.counter[item.hash()];
            return;
        }

        let searchTheSame = this.list.indexOf(item);
        if (searchTheSame > -1) {
            this.list.splice(searchTheSame, 1);
            return;
        }

        let index = -1;
        let i = 0;
        /* Array.prototype.findIndex не поддерживается в IE */
        while (index === -1 && i < this.list.length) {
           let current = this.list[i];
           if (current.hash() === item.hash()) {
               index = i;
           }
           i = i + 1;
        }
        if (index > -1) {
            this.list.splice(index, 1);
        }
    }

    has(item: T): boolean {
        return !!this.counter[item.hash()];
    }

    getSubscribes(): T[] {
        return this.list.slice();
    }

    getByName(name: string): T[] {
        let result = [];
        for (let item of this.list) {
            if (item.getChannelName() !== name) {
                continue;
            }
            result.push(item);
        }

        return result;
    }

    getCount(item: T) {
        return this.counter[item.hash()] || 0;
    }

    clear(): void {
        this.list = [];
        this.counter = Object.create(null);
    }
}
