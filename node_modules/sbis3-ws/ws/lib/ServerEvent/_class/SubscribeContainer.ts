/// <amd-module name="Lib/ServerEvent/_class/SubscribeContainer" />
import { SEB } from "../interfaces";
import { HashedCounter as SubsCounter } from "Lib/ServerEvent/native/HashedCounter";

/**
 * Класс для хранения подписок и учёта количества ссылок.
 */
export class SubscribeContainer {
    private common = new SubsCounter<SEB.ISubscribe>(false);
    private channeled = new SubsCounter<SEB.IChanneledSubscribe>();

    /**
     * @param subscribe
     * @return {boolean} true - если добавлено успешно. false - если уже было добавлено ранее.
     */
    add(subscribe: SEB.ISubscribe): void {
        if (subscribe.isChanneled()) {
            return this.channeled.add(subscribe as SEB.IChanneledSubscribe);
        }
        this.common.add(subscribe);
    }

    /**
     * @param subscribe
     * @return {boolean} true - если удалено. false - если не нашли.
     */
    remove(subscribe: SEB.ISubscribe): void {
        if (subscribe.isChanneled()) {
            return this.channeled.remove(subscribe as SEB.IChanneledSubscribe);
        }
        this.common.remove(subscribe);
    }

    has(subscribe: SEB.ISubscribe): boolean {
        return this.common.has(subscribe) || this.channeled.has(subscribe as SEB.IChanneledSubscribe);
    }

    all() {
        /* В this.common всегда одна копия */
        return this.common.getSubscribes().concat(this.channeled.getSubscribes());
    }

    clear() {
        this.common.clear();
        this.channeled.clear();
    }

    /**
     * Удаляем подписки по имени канала и возвращаем их
     * FIXME нужно подписок возвращать столько же, какое и их количество!!!
     * @param {string} name
     * @return {SEB.ISubscribe[]}
     */
    removeByName(name: string): SEB.ISubscribe[] {
        let common = this.common.getByName(name);
        let channeled = this.channeled.getByName(name);

        for (let item of common) {
            this.common.remove(item);
        }
        for (let item of channeled) {
            this.channeled.remove(item);
        }

        return common.concat(channeled);
    }

    /**
     * Присутствует ли обычная подписка
     * @return {boolean}
     */
    hasCommon(): boolean {
        return this.common.getSubscribes().length > 0;
    }

    /**
     * Присутствует ли канализированная подписка
     * @return {boolean}
     */
    hasChanneled(): boolean {
        return this.channeled.getSubscribes().length > 0;
    }
}