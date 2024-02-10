/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RootAndNodeIdentifiableComponentPair } from 'component-internal-api';

export interface NegatableOperator {
    readonly not: boolean;
    negateOperator(modifier: RootAndNodeIdentifiableComponentPair): void;
}
