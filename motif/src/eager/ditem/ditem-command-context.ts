/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommandContext } from '@motifmarkets/motif-core';

export interface DitemCommandContext extends CommandContext {
    readonly litIvemIdLinkable: boolean;
    litIvemIdLinked: boolean;
    readonly brokerageAccountGroupLinkable: boolean;
    brokerageAccountGroupLinked: boolean;
}
