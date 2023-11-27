/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import {
    ScanEditor, ScansService
} from '@motifmarkets/motif-core';
import { ScansNgService } from '../../../../component-services/ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';
import {
    FormulaScanEditorSectionNgComponent,
    GeneralScanEditorSectionNgComponent,
    NotifiersScanEditorSectionNgComponent
} from '../section/ng-api';

@Component({
    selector: 'app-scan-editor',
    templateUrl: './scan-editor-ng.component.html',
    styleUrls: ['./scan-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanEditorNgComponent extends ContentComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    @ViewChild('generalSection', { static: true }) private _generalSectionComponent: GeneralScanEditorSectionNgComponent;
    @ViewChild('criteriaSection', { static: true }) private _criteriaSectionComponent: FormulaScanEditorSectionNgComponent;
    @ViewChild('rankSection', { static: true }) private _rankSectionComponent: FormulaScanEditorSectionNgComponent;
    @ViewChild('notifiersSection', { static: true }) private _notifiersSectionComponent: NotifiersScanEditorSectionNgComponent;

    private _scansService: ScansService;
    private _scanEditor: ScanEditor | undefined;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        scansNgService: ScansNgService,
    ) {
        super(elRef, ++ScanEditorNgComponent.typeInstanceCreateCount);
        this._scansService = scansNgService.service;
    }

    ngOnDestroy(): void {
        this.setEditor(undefined);
    }

    setEditor(scanEditor: ScanEditor | undefined) {
        this._generalSectionComponent.setEditor(scanEditor);
        this._criteriaSectionComponent.setEditor(scanEditor);
        this._rankSectionComponent.setEditor(scanEditor);
        this._notifiersSectionComponent.setEditor(scanEditor);
        this._scanEditor = scanEditor;
    }
}
