import { AssertInternalError, GridField, IndexedRecord, RenderValue } from '@motifmarkets/motif-core';

export class RowDataArrayGridField extends GridField {
    override getViewValue(_record: IndexedRecord): RenderValue {
        throw new AssertInternalError('RDAGFGVV22211'); // not used in RowDataArray grids
    }
}
