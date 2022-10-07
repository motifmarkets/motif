import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { EditableScan } from '@motifmarkets/motif-core';
import { ScansNgService } from 'component-services-ng-api';
import { RevRecordFieldIndex, RevRecordIndex } from 'revgrid';
import { AdaptedRevgrid } from '../../../adapted-revgrid/internal-api';
import { RecordGridNgComponent } from '../../../adapted-revgrid/ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';
import { ContentNgService } from '../../../ng/content-ng.service';
import { GeneralScanPropertiesSectionNgComponent } from '../../properties/ng-api';
import { ScansFrame } from '../scans-frame';

@Component({
    selector: 'app-scans',
    templateUrl: './scans-ng.component.html',
    styleUrls: ['./scans-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScansNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit, ScansFrame.ComponentAccess {
    @Input() frameGridProperties: AdaptedRevgrid.FrameGridProperties;
    @ViewChild(RecordGridNgComponent, { static: true }) private _gridComponent: RecordGridNgComponent;
    @ViewChild(GeneralScanPropertiesSectionNgComponent, { static: true }) private _propertiesComponent: GeneralScanPropertiesSectionNgComponent;

    recordFocusEventer: ScansNgComponent.RecordFocusEventer;
    gridClickEventer: ScansNgComponent.GridClickEventer;
    columnsViewWithsChangedEventer: ScansNgComponent.ColumnsViewWithsChangedEventer;

    public readonly frame: ScansFrame;

    // private _grid: RecordGrid;

    constructor(
        private _cdr: ChangeDetectorRef,
        contentService: ContentNgService,
        scansNgService: ScansNgService
    ) {
        super();
        this.frame = contentService.createScansFrame(this, scansNgService.service);
    }

    get gridSize() { return 540; }
    get gridMinSize() { return 50; }
    get splitterGutterSize() { return 3; }

    // get focusedRecordIndex() { return this._grid.focusedRecordIndex; }
    // get fixedColumnsViewWidth() { return this._grid.fixedColumnsViewWidth; }
    // get activeColumnsViewWidth() { return this._grid.activeColumnsViewWidth; }

    ngOnDestroy() {
        // this._onAutoAdjustColumnWidths = undefined;
        this.frame.finalise();
    }

    ngAfterViewInit() {
        this._gridComponent.destroyEventer = () => {
            this._gridComponent.destroyGrid();
        };

        const grid = this._gridComponent.createGrid(this.frame.recordStore, ScansNgComponent.frameGridProperties);
        this.frame.setGrid(grid);
        // this.frame.bindPropertiesComponent(this._propertiesComponent);
        // this._grid.recordFocusEventer = (newRecordIndex) => this.handleRecordFocusEvent(newRecordIndex);
        // this._grid.mainClickEventer = (fieldIndex, recordIndex) => this.handleGridClickEvent(fieldIndex, recordIndex);
        // this._grid.columnsViewWidthsChangedEventer =
        //     (fixedChanged, nonFixedChanged, allChanged) => this.handleColumnsViewWidthsChangedEvent(
        //         fixedChanged, nonFixedChanged, allChanged
        //     );

        // this.prepareGrid();
    }

    // calculateActiveColumnsWidth() {
    //     return this._grid.calculateActiveColumnsWidth();
    // }

    // calculateFixedColumnsWidth() {
    //     return this._grid.calculateFixedColumnsWidth();
    // }

    // waitRendered() {
    //     return this._grid.waitModelRendered();
    // }

    // handleRecordFocusEvent(recordIndex: RevRecordIndex | undefined) {
    //     if (recordIndex === undefined) {
    //         this._propertiesComponent.setScan(undefined);
    //     } else {
    //         const scan = this._
    //         this._propertiesComponent.setScan();
    //     }
    //     if (this.recordFocusEventer !== undefined) {
    //         this.recordFocusEventer(recordIndex);
    //     }
    // }

    // handleGridClickEvent(fieldIndex: RevRecordFieldIndex, recordIndex: RevRecordIndex): void {
    //     if (this.gridClickEventer !== undefined) {
    //         this.gridClickEventer(fieldIndex, recordIndex);
    //     }
    // }

    // handleColumnsViewWidthsChangedEvent(fixedChanged: boolean, nonFixedChanged: boolean, allChanged: boolean) {
    //     if ((fixedChanged || allChanged) && this.columnsViewWithsChangedEventer !== undefined) {
    //         this.columnsViewWithsChangedEventer();
    //     }
    // }

    handleSplitterDragEnd() {

    }

    setFocusedScan(value: EditableScan | undefined) {
        this._propertiesComponent.setScan(value);
    }
    // invalidateAll(): void {
    //     this._recordStore.invalidateAll();
    // }

    // invalidateRecord(recordIndex: Integer): void {
    //     this._recordStore.invalidateRecord(recordIndex);
    // }

}

export namespace ScansNgComponent {
    export type RenderedEvent = (this: void) => void;
    export type RecordFocusEventer = (recordIndex: RevRecordIndex | undefined) => void;
    export type GridClickEventer = (fieldIndex: RevRecordFieldIndex, recordIndex: RevRecordIndex) => void;
    export type ColumnsViewWithsChangedEventer = (this: void) => void;

    export const frameGridProperties: AdaptedRevgrid.FrameGridProperties = {
        fixedColumnCount: 1,
        gridRightAligned: false,
    };
}
