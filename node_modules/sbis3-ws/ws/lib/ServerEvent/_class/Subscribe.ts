/// <amd-module name="Lib/ServerEvent/_class/Subscribe" />
import { SEB } from "../interfaces";
import * as CONST from "Lib/ServerEvent/_class/Constants";

export abstract class Subscribe implements SEB.ISubscribe {
    constructor(private channelName, private type: string) {
    }

    abstract isChanneled(): boolean;

    /**
     * Хэш, который идентифицирует подписку.
     * Поэтому хэшу необходимо проверять соответстве подписок.
     * @return {string}
     */
    hash() {
        let type = this.isChanneled() ? 'ch': 'cm';
        return `${this.channelName}::${type}::${this.getDeliveryType()}`;
    }

    getDeliveryType() {
        return this.type;
    }

    getChannelName() {
        return this.channelName;
    }

    static create(channelName: string, isChanneled: boolean=false,
                  isExclusive: boolean = false,
                  target: string=null): SEB.ISubscribe {
        let type = isExclusive ? CONST.DELIVERY_EXCLUSIVE_PAGE : CONST.DELIVERY_COMMON;

        if (!isChanneled) {
            return new CommonSubscribe(channelName, type);
        }

        return new ChanneledSubscribe(channelName, type, target);
    }

    static createRaw(channelName: string, isChanneled: boolean=false,
                  isExclusive: boolean = false, scope: CONST.CHANNEL_SCOPE=null): SEB.ISubscribe {
        let type = isExclusive ? CONST.DELIVERY_EXCLUSIVE_PAGE : CONST.DELIVERY_COMMON;

        if (!isChanneled) {
            return new CommonSubscribe(channelName, type);
        }

        return new RawChanneledSubscribe(channelName, type, scope);
    }
}

export class CommonSubscribe extends Subscribe {
    /**
     * Нужен для TabMessage. Он пересылает лишь поля объекта.
     * @type {boolean}
     */
    private channeled = false;

    isChanneled() {
        return false;
    }
}

export class ChanneledSubscribe extends Subscribe implements SEB.IChanneledSubscribe {
    /**
     * Нужен для TabMessage. Он пересылает лишь поля объекта.
     * @type {boolean}
     */
    private channeled = true;

    /**
     * @param channelName
     * @param {string} type CONST.DELIVERY_EXCLUSIVE_PAGE | CONST.DELIVERY_COMMON
     * @param {string} target идентификатор аккаунта для получения событий
     */
    constructor(channelName, type: string, private target: string=null) {
        super(channelName, type);
    }

    isChanneled() {
        return true;
    }

    hash() {
        return `${super.hash()}::${this.target}`;
    }

    getTarget(): string|null {
        return this.target;
    }
}

export class RawChanneledSubscribe extends Subscribe implements SEB.IRawChanneledSubscribe {
    constructor(channelName, type: string, private scope: CONST.CHANNEL_SCOPE=null) {
        super(channelName, type);
    }

    isChanneled() {
        return true;
    }

    hash() {
        return `${super.hash()}::${this.scope}`;
    }

    getScope(): CONST.CHANNEL_SCOPE {
        return this.scope;
    }
}