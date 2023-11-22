import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { RevRecordFieldIndex, RevRecordIndex } from 'revgrid';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';
import { ScanEditorNgComponent } from '../../editor/ng-api';
import { ScanListFrame } from '../../scan-list/internal-api';
import { ScanListNgComponent } from '../../scan-list/ng-api';
import { AssertInternalError } from '@motifmarkets/motif-core';

@Component({
    selector: 'app-scans',
    templateUrl: './scans-ng.component.html',
    styleUrls: ['./scans-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScansNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit {
    private static typeInstanceCreateCount = 0;

    @ViewChild('scanList', { static: true }) private _listComponent: ScanListNgComponent;
    @ViewChild('scanEditor', { static: true }) private _editorComponent: ScanEditorNgComponent;

    readonly listAreaWidth = 540;
    readonly listAreaMinWidth = 50;
    readonly splitterGutterSize = 3;

    recordFocusEventer: ScansNgComponent.RecordFocusEventer;
    gridClickEventer: ScansNgComponent.GridClickEventer;
    columnsViewWithsChangedEventer: ScansNgComponent.ColumnsViewWithsChangedEventer;

    private _listFrame: ScanListFrame;

    constructor(elRef: ElementRef<HTMLElement>) {
        super(elRef, ++ScansNgComponent.typeInstanceCreateCount);
    }

    get listFrame() { return this._listFrame; }

    ngAfterViewInit() {
        this._listFrame = this._listComponent.frame;
        this._listFrame.recordFocusedEventer = (newRecordIndex) => {
            if (newRecordIndex === undefined) {
                this._editorComponent.closeEditor();
            } else {
                const scan = this._listFrame.scanList.getAt(newRecordIndex);
                const promise = this._editorComponent.editScan(scan.id);
                AssertInternalError.throwErrorIfVoidPromiseRejected(promise, 'SNCNAVI50355');
            }
        }
    }

    handleSplitterDragEnd() {
        //
    }
}

export namespace ScansNgComponent {
    export type RenderedEvent = (this: void) => void;
    export type RecordFocusEventer = (recordIndex: RevRecordIndex | undefined) => void;
    export type GridClickEventer = (fieldIndex: RevRecordFieldIndex, recordIndex: RevRecordIndex) => void;
    export type ColumnsViewWithsChangedEventer = (this: void) => void;
}
