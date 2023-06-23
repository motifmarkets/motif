import { GridField, RenderValue } from '@motifmarkets/motif-core';
import { DatalessViewCell } from 'revgrid';
import { RenderValueTextCellPainter } from '../cell-painters/render-value-text-cell-painter';
import { AdaptedRevgridBehavioredColumnSettings } from '../settings/adapted-revgrid-behaviored-column-settings';

export class RecordGridMainTextCellPainter extends RenderValueTextCellPainter {
    override paint(cell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, prefillColor: string | undefined) {
        const field = cell.viewLayoutColumn.column.field;
        const subgridRowIndex = cell.viewLayoutRow.subgridRowIndex;
        const renderValue = this._dataServer.getViewValue(field, subgridRowIndex) as RenderValue;
        return super.paintValue(cell, prefillColor, renderValue);
    }
}
