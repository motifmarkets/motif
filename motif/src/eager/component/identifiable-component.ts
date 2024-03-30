/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

export interface IdentifiableComponent {
    readonly typeName: string;
    readonly typeInstanceId: string;
}

export namespace IdentifiableComponent {
    export function isEqual(left: IdentifiableComponent, right: IdentifiableComponent) {
        return left.typeName === right.typeName && left.typeInstanceId === right.typeInstanceId;
    }
}
