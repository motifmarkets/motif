/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RootAndNodeComponentInstanceIdPair } from 'component-internal-api';

export interface NegatableOperator {
    readonly not: boolean;
    negateOperator(modifier: RootAndNodeComponentInstanceIdPair): void;
}
