/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject } from '@angular/core';
import { AssertInternalError, BadnessComparableList, LockOpenListItem, StringId, Strings } from '@motifmarkets/motif-core';
import { CoreInjectionTokens, ToastNgService } from 'component-services-ng-api';
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
        private readonly _toastNgService: ToastNgService,
        contentNgService: ContentNgService,
        @Inject(CoreInjectionTokens.lockOpenListItemOpener) private readonly _opener: LockOpenListItem.Opener,
    ) {
        const frame: ScanFieldEditorFramesGridNgComponent.Frame = contentNgService.createScanFieldEditorFramesGridFrame();
        super(elRef, ++ScanFieldEditorFramesGridNgComponent.typeInstanceCreateCount, cdr, frame);
    }

    setList(value: BadnessComparableList<ScanFieldEditorFrame> | undefined) {
        if (value === undefined) {
            this.frame.closeGridSource(true);
        } else {
            const openPromise = this.frame.tryOpenList(value, true);
            openPromise.then(
                (result) => {
                    if (result.isErr()) {
                        this._toastNgService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.ScanFieldEditorFramesGrid]}: ${result.error}`);
                    }
                },
                (reason) => { throw AssertInternalError.createIfNotError(reason, 'FNCPR50139') }
            );
        }
    }

    protected override processAfterViewInit() {
        super.processAfterViewInit();
        this.frame.initialiseGrid(this._opener, undefined, false);
    }
}

export namespace ScanFieldEditorFramesGridNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;
    export type Frame = ScanFieldEditorFramesGridFrame;
}
