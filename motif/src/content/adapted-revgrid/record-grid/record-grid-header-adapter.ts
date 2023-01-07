/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridField } from '@motifmarkets/motif-core';
import { RevRecordField, RevRecordHeaderAdapter } from 'revgrid';

export class RecordGridHeaderAdapter extends RevRecordHeaderAdapter {
    override getValue(schemaColumn: RevRecordField.SchemaColumn): string {
        const field = schemaColumn.field as GridField;
        return field.heading;
    }
}
