import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { RevRecordFieldIndex, RevRecordIndex } from 'revgrid';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';
import { ScanPropertiesNgComponent } from '../../properties/ng-api';
import { ScanListFrame } from '../../scan-list/internal-api';
import { ScanListNgComponent } from '../../scan-list/ng-api';

@Component({
    selector: 'app-scans',
    templateUrl: './scans-ng.component.html',
    styleUrls: ['./scans-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScansNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit {
    private static typeInstanceCreateCount = 0;

    @ViewChild('scanList', { static: true }) private _listComponent: ScanListNgComponent;
    @ViewChild('scanProperties', { static: true }) private _propertiesComponent: ScanPropertiesNgComponent;

    readonly gridSize = 540;
    readonly gridMinSize = 50;
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
                this._propertiesComponent.setScan(undefined);
            } else {
                const scan = this._listFrame.recordList.getAt(newRecordIndex);
                this._propertiesComponent.setScan(scan);
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
