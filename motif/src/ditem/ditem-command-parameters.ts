/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommandParameters } from '@motifmarkets/motif-core';

export interface DitemCommandParameters extends CommandParameters {

}

export interface SetSecurityLinkingDitemCommandParameters extends DitemCommandParameters {
    linked: boolean;
}

export interface SetAccountLinkingDitemCommandParameters extends DitemCommandParameters {
    linked: boolean;
}
