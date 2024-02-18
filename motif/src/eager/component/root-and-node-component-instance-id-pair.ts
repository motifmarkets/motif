/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComponentInstanceId } from './component-instance-id';

export interface RootAndNodeComponentInstanceIdPair {
    root: ComponentInstanceId;
    node: ComponentInstanceId;
}

export namespace RootAndNodeComponentInstanceIdPair {
    export function isEqual(left: RootAndNodeComponentInstanceIdPair, right: RootAndNodeComponentInstanceIdPair) {
        return left.root === right.root && left.node === right.node;
    }
}

