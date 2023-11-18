/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import {
    AssertInternalError,
    LockOpenListItem,
    ScanEditor, ScansService
} from '@motifmarkets/motif-core';
import { ScansNgService } from '../../../../component-services/ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';
import {
    CriteriaScanEditorSectionNgComponent,
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
    @ViewChild('criteriaSection', { static: true }) private _criteriaSectionComponent: CriteriaScanEditorSectionNgComponent;
    // @ViewChild('rankSection', { static: true }) private _rankSectionComponent: RankScanPropertiesSectionNgComponent;
    @ViewChild('notifiersSection', { static: true }) private _notifiersSectionComponent: NotifiersScanEditorSectionNgComponent;

    private readonly _opener: LockOpenListItem.Opener = {
        lockerName: 'ScanEditor',
    };

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
        this.closeEditor();
    }

    newScan() {

    }

    async editScan(scanId: string) {
        this.closeEditor();

        const openResult = await this._scansService.tryOpenScanEditor(scanId, this._opener);
        if (openResult.isErr()) {

        } else {
            const scanEditor = openResult.value;
            if (scanEditor === undefined) {
                throw new AssertInternalError('SENCESU40612'); // should always exist
            } else {
                this._scanEditor = scanEditor;
                this._generalSectionComponent.setEditor(scanEditor);
                this._criteriaSectionComponent.setEditor(scanEditor);
                // this._rankSectionComponent.setScan(value);
                this._notifiersSectionComponent.setEditor(scanEditor);
            }
        }
    }

    closeEditor() {

    }
}
