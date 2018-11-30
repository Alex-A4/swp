/// <amd-module name="Lib/ServerEvent/_class/Constants" />
module CONST {
    export enum CHANNEL_SCOPE {
        GLOBAL = 'global',
        CLIENT = 'client',
        USER = 'user'
    }

    export const DELIVERY_COMMON = 'common';
    export const DELIVERY_HOST = 'host';
    export const DELIVERY_EXCLUSIVE_PAGE = 'page';
    export const ERR_MSG_RABBIT_OFF = "Can't create RabbitMQ channel";
    export const ERR_MSG_EMPTY_SID = 'sid not found';
    export const ERR_MSG_HASH_401 = '!hash not found';
}

export = CONST;