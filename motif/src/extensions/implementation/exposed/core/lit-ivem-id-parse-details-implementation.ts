/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SymbolsService } from 'src/core/internal-api';
import { LitIvemIdParseDetails as LitIvemIdParseDetailsApi } from '../../../api/extension-api';
import { LitIvemIdImplementation } from '../adi/internal-api';

export namespace LitIvemIdParseDetailsImplementation {
    export function toApi(details: SymbolsService.LitIvemIdParseDetails): LitIvemIdParseDetailsApi {
        const litIvemId = details.litIvemId;
        return {
            success: details.success,
            litIvemId: litIvemId === undefined ? undefined : LitIvemIdImplementation.toApi(litIvemId),
            sourceIdExplicit: details.sourceIdExplicit,
            marketIdExplicit: details.marketIdExplicit,
            errorText: details.errorText,
            parseText: details.value,
        };
    }
}
