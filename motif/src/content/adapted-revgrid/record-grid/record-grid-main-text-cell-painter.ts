/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridField, RenderValue } from '@motifmarkets/motif-core';
import { DatalessViewCell } from 'revgrid';
import { RenderValueTextCellPainter } from '../cell-painters/content-adapted-revgrid-cell-painters-internal-api';
import { AdaptedRevgridBehavioredColumnSettings } from '../settings/content-adapted-revgrid-settings-internal-api';

export class RecordGridMainTextCellPainter extends RenderValueTextCellPainter {
    override paint(cell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, prefillColor: string | undefined) {
        const field = cell.viewLayoutColumn.column.field;
        const subgridRowIndex = cell.viewLayoutRow.subgridRowIndex;
        const renderValue = this._dataServer.getViewValue(field, subgridRowIndex) as RenderValue;
        return super.paintValue(cell, prefillColor, renderValue);
    }
}
