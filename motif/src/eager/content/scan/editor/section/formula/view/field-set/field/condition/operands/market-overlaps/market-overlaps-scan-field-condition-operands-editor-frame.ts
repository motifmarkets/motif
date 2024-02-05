/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MarketId } from '@motifmarkets/motif-core';
import { NegatableOperator } from '../negatableOperator';
import { OverlapsScanFieldConditionOperandsEditorFrame } from '../overlaps/internal-api';

export interface MarketOverlapsScanFieldConditionOperandsEditorFrame extends OverlapsScanFieldConditionOperandsEditorFrame, NegatableOperator {
    values: readonly MarketId[];
}
