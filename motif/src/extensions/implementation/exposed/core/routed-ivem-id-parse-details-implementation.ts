/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SymbolsService } from 'core-internal-api';
import { RoutedIvemIdParseDetails as RoutedIvemIdParseDetailsApi } from '../../../api/extension-api';
import { RoutedIvemIdImplementation } from '../adi/internal-api';

export namespace RoutedIvemIdParseDetailsImplementation {
    export function toApi(details: SymbolsService.RoutedIvemIdParseDetails): RoutedIvemIdParseDetailsApi {
        const routedIvemId = details.routedIvemId;
        return {
            success: details.success,
            routedIvemId: routedIvemId === undefined ? undefined : RoutedIvemIdImplementation.toApi(routedIvemId),
            sourceIdExplicit: details.sourceIdExplicit,
            orderRouteExplicit: details.orderRouteExplicit,
            errorText: details.errorText,
            parseText: details.value,
        };
    }
}
