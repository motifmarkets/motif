import { InjectionToken } from '@angular/core';
import { GridField } from '@motifmarkets/motif-core';
import { Subgrid } from 'revgrid';
import { AdaptedRevgrid } from '../adapted-revgrid/adapted-revgrid';
import { AdaptedRevgridBehavioredColumnSettings } from '../adapted-revgrid/internal-api';

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
