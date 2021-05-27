/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../adi/extension-api';
import { LitIvemIdParseDetails } from './lit-ivem-id-parse-details-api';
import { UiAction } from './ui-action-api';

/** @public */
export interface LitIvemIdUiAction extends UiAction {
    readonly value: LitIvemId | undefined;
    readonly definedValue: LitIvemId;
    readonly parseDetails: LitIvemIdParseDetails | undefined;

    pushValue(value: LitIvemId | undefined): void;
}
