/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import {
    EditableScan
} from '@motifmarkets/motif-core';
import { ContentComponentBaseNgDirective } from '../../../../ng/content-component-base-ng.directive';
import {
    CriteriaScanPropertiesSectionNgComponent,
    GeneralScanPropertiesSectionNgComponent,
    NotifiersScanPropertiesSectionNgComponent
} from '../../section/ng-api';

@Component({
    selector: 'app-scan-properties',
    templateUrl: './scan-properties-ng.component.html',
    styleUrls: ['./scan-properties-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanPropertiesNgComponent extends ContentComponentBaseNgDirective {
    @ViewChild('generalSection', { static: true }) private _generalSectionComponent: GeneralScanPropertiesSectionNgComponent;
    @ViewChild('criteriaSection', { static: true }) private _criteriaSectionComponent: CriteriaScanPropertiesSectionNgComponent;
    // @ViewChild('rankSection', { static: true }) private _rankSectionComponent: RankScanPropertiesSectionNgComponent;
    @ViewChild('notifiersSection', { static: true }) private _notifiersSectionComponent: NotifiersScanPropertiesSectionNgComponent;

    private _scan: EditableScan | undefined;

    constructor(
        private readonly _cdr: ChangeDetectorRef,
    ) {
        super();
    }


    setScan(value: EditableScan | undefined) {
        this._scan = value;

        this._generalSectionComponent.setScan(value);
        this._criteriaSectionComponent.setScan(value);
        // this._rankSectionComponent.setScan(value);
        this._notifiersSectionComponent.setScan(value);
    }
}
