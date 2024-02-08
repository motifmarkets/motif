/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { AssertInternalError, BadnessComparableList } from '@motifmarkets/motif-core';
import { GridSourceNgDirective } from '../../../../../../../../grid-source/ng-api';
import { ContentNgService } from '../../../../../../../../ng/content-ng.service';
import { ScanFieldEditorFrame } from '../../field/internal-api';
import { ScanFieldEditorFramesGridFrame } from '../scan-field-editor-frames-grid-frame';

@Component({
    selector: 'app-scan-field-editor-frames-grid',
    templateUrl: './scan-field-editor-frames-grid-ng.component.html',
    styleUrls: ['./scan-field-editor-frames-grid-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanFieldEditorFramesGridNgComponent extends GridSourceNgDirective {
    declare frame: ScanFieldEditorFramesGridNgComponent.Frame;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        contentNgService: ContentNgService,
    ) {
        const frame: ScanFieldEditorFramesGridNgComponent.Frame = contentNgService.createScanFieldEditorFramesGridFrame();
        super(elRef, ++ScanFieldEditorFramesGridNgComponent.typeInstanceCreateCount, cdr, frame);
    }

    setList(value: BadnessComparableList<ScanFieldEditorFrame> | undefined) {
        if (value === undefined) {
            this.frame.closeGridSource(true);
        } else {
            const promise = this.frame.tryOpenList(value, true);
            AssertInternalError.throwErrorIfPromiseRejected(promise, 'SFEGGNC33133');
        }
    }
}

export namespace ScanFieldEditorFramesGridNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;
    export type Frame = ScanFieldEditorFramesGridFrame;
}
