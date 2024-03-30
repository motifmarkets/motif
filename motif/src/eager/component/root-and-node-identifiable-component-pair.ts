/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IdentifiableComponent } from './identifiable-component';

export interface RootAndNodeIdentifiableComponentPair {
    root: IdentifiableComponent;
    node: IdentifiableComponent;
}

export namespace RootAndNodeIdentifiableComponentPair {
    export function isEqual(left: RootAndNodeIdentifiableComponentPair, right: RootAndNodeIdentifiableComponentPair) {
        return IdentifiableComponent.isEqual(left.root, right.root) && IdentifiableComponent.isEqual(left.node, right.node);
    }
}

