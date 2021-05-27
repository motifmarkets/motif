/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RoutedIvemId } from '../adi/extension-api';

/** @public */
export interface RoutedIvemIdParseDetails {
    readonly success: boolean;
    readonly routedIvemId: RoutedIvemId | undefined;
    readonly sourceIdExplicit: boolean;
    readonly orderRouteExplicit: boolean;
    readonly errorText: string;
    readonly parseText: string;
}

