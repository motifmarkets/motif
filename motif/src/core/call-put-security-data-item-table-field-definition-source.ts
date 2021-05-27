/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CallOrPutId } from 'src/adi/internal-api';
import { UnreachableCaseError } from 'src/sys/internal-api';
import { PrefixableSecurityDataItemTableFieldDefinitionSource } from './prefixable-security-data-item-table-field-definition-source';
import { TableFieldCustomHeadings } from './table-field-custom-headings';
import { TableFieldDefinitionSource } from './table-field-definition-source';

export class CallPutSecurityDataItemTableFieldDefinitionSource extends PrefixableSecurityDataItemTableFieldDefinitionSource {

    constructor(customHeadings: TableFieldCustomHeadings, callOrPutId: CallOrPutId) {
        super(TableFieldDefinitionSource.TypeId.CallPutLitIvemId, customHeadings,
            CallPutSecurityDataItemTableFieldDefinitionSource.calculatePrefix(callOrPutId));
    }
}

export namespace CallPutSecurityDataItemTableFieldDefinitionSource {
    export const enum FieldNameHeaderPrefix {
        Call = 'C.',
        Put = 'P.',
    }

    export function calculatePrefix(callOrPutId: CallOrPutId): string {
        switch (callOrPutId) {
            case CallOrPutId.Call: return FieldNameHeaderPrefix.Call;
            case CallOrPutId.Put: return FieldNameHeaderPrefix.Put;
            default:
                throw new UnreachableCaseError('CPSDITFDSCP33382', callOrPutId);
        }
    }
}
