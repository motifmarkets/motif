/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import {
    Scan
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
    private static typeInstanceCreateCount = 0;

    @ViewChild('generalSection', { static: true }) private _generalSectionComponent: GeneralScanPropertiesSectionNgComponent;
    @ViewChild('criteriaSection', { static: true }) private _criteriaSectionComponent: CriteriaScanPropertiesSectionNgComponent;
    // @ViewChild('rankSection', { static: true }) private _rankSectionComponent: RankScanPropertiesSectionNgComponent;
    @ViewChild('notifiersSection', { static: true }) private _notifiersSectionComponent: NotifiersScanPropertiesSectionNgComponent;

    private _scan: Scan | undefined;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
    ) {
        super(elRef, ++ScanPropertiesNgComponent.typeInstanceCreateCount);
    }


    setScan(value: Scan | undefined) {
        this._scan = value;

        this._generalSectionComponent.setScan(value);
        this._criteriaSectionComponent.setScan(value);
        // this._rankSectionComponent.setScan(value);
        this._notifiersSectionComponent.setScan(value);
    }
}
