/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ActionCommandContext } from '@motifmarkets/motif-core';

export interface DitemCommandContext extends ActionCommandContext {
    readonly litIvemIdLinkable: boolean;
    litIvemIdLinked: boolean;
    readonly brokerageAccountGroupLinkable: boolean;
    brokerageAccountGroupLinked: boolean;
}
