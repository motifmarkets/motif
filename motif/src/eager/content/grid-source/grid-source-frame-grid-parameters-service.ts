import { InjectionToken } from '@angular/core';
import { AdaptedRevgrid, AdaptedRevgridBehavioredColumnSettings, GridField } from '@motifmarkets/motif-core';
import { Subgrid } from '@xilytix/revgrid';

export interface GridSourceFrameGridParametersService {
    customGridSettings: AdaptedRevgrid.CustomGridSettings;
    customiseSettingsForNewColumnEventer: AdaptedRevgrid.CustomiseSettingsForNewColumnEventer;
    getMainCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>;
    getHeaderCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>;
}

export namespace GridSourceFrameGridParametersService {
    const tokenName = 'gridSourceFrameGridParametersService';
    export const injectionToken = new InjectionToken<GridSourceFrameGridParametersService>(tokenName);
}
