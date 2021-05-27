/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RoutedIvemId } from '../adi/extension-api';
import { RoutedIvemIdParseDetails } from './routed-ivem-id-parse-details-api';
import { UiAction } from './ui-action-api';

/** @public */
export interface RoutedIvemIdUiAction extends UiAction {
    readonly value: RoutedIvemId | undefined;
    readonly definedValue: RoutedIvemId;
    readonly parseDetails: RoutedIvemIdParseDetails | undefined;

    pushValue(value: RoutedIvemId | undefined): void;
}
