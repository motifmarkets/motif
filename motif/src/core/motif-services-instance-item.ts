import { Json } from 'sys-internal-api';

export interface MotifServicesInstanceItem extends Json {
    readonly instanceTypeId: MotifServicesInstanceItem.TypeId;
    readonly instanceName: string;
    readonly instanceId: string;
}

export namespace MotifServicesInstanceItem {
    export const enum TypeId {
        Layout,
    }
}
