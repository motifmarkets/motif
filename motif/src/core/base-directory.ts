/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

export abstract class BaseDirectory {

}

export namespace BaseDirectory {
    export namespace Entry {
        export interface ISubscriber {
            subscriberInterfaceDescriminator(): void;
        }
    }
}
