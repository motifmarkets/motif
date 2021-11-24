/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommandParameters } from 'core-internal-api';

export interface DitemCommandParameters extends CommandParameters {

}

export interface SetSecurityLinkingDitemCommandParameters extends DitemCommandParameters {
    linked: boolean;
}

export interface SetAccountLinkingDitemCommandParameters extends DitemCommandParameters {
    linked: boolean;
}
