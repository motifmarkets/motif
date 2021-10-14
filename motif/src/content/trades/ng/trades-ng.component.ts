/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from '@angular/core';
import { MotifGrid } from 'src/content/internal-api';
import { MotifGridNgComponent } from 'src/content/motif-grid/ng-api';
import { Badness } from 'src/sys/internal-api';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { TradesFrame } from '../trades-frame';

@Component({
    selector: 'app-trades',
    templateUrl: './trades-ng.component.html',
    styleUrls: ['./trades-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradesNgComponent implements OnDestroy, AfterViewInit, TradesFrame.ComponentAccess {
    @ViewChild('delayedBadness') private _delayedBadnessComponent: DelayedBadnessNgComponent;
    @ViewChild(MotifGridNgComponent, { static: true }) private _gridComponent: MotifGridNgComponent;

    private _frame: TradesFrame;

    constructor(
        contentService: ContentNgService,
    ) {
        this._frame = contentService.createTradesFrame(this);
    }

    ngOnDestroy() {
        // this._onAutoAdjustColumnWidths = undefined;
        this.frame.finalise();
    }

    ngAfterViewInit() {
        this._gridComponent.destroyEventer = () => {
            this.frame.finalise();
            this._gridComponent.destroyGrid();
        };

        const grid = this._gridComponent.createGrid(this._frame.dataStore, TradesNgComponent.frameGridProperties);
        this._frame.setGrid(grid);

        // this._gridAccess.gridLoadLayout = (layout: GridLayout): void => {
        //     gridAdapter.LoadLayout(layout);
        // };
        // this._gridAccess.gridSaveLayout = (): MotifGrid.LayoutWithHeadersMap => {
        //     const layout = gridAdapter.SaveLayout();
        //     return {
        //         layout: layout,
        //         headersMap: calcGridHeadersMap(layout),
        //     };
        // };

        // pulseGridTransforms.forEach(transform => gridAdapter.AddTransform(transform));

        // for (let id = 0; id < TradeColumn.columnCount; id++) {
        //     gridAdapter.AddField(TradeColumn.createGridField(this._settings, id));
        // }

        // for (let id = 0; id < TradeColumn.columnCount; id++) {
        //     gridAdapter.SetFieldState(id, { Alignment: TradeColumn.idToFieldAlignment(id) });
        //     gridAdapter.SetFieldVisible(id, TradeColumn.idToIsVisibleDefault(id));
        // }

        // this.dataStore.AddEventListeners({
        //     onDataStatusChange: () => {},
        //     onBeginChange: () => { gridAdapter.BeginChange(); },
        //     onEndChange: () => { gridAdapter.EndChange(); },
        //     onClear: () => { gridAdapter.ClearRecords(); },
        //     onInsertRecords: (recordIndex: number, count: number) => { gridAdapter.InsertRecords(recordIndex, count); },
        //     onDeleteRecords: (recordIndex: number, count: number) => { gridAdapter.DeleteRecords(recordIndex, count); },
        //     onInvalidateRecord: (recordIndex: number) => { gridAdapter.InvalidateRecord(recordIndex); },
        //     onInvalidateAll: () => { gridAdapter.InvalidateAll(); },
        // });

        // this._onAutoAdjustColumnWidths = () => {
        //     for (let id = 0; id < TradeGridField.idCount; id++) {
        //         this._gridAdapter.SetFieldWidth(id, undefined);
        //     }
        // };

        // gridAdapter.BeginChange();
        // gridAdapter.EndChange();

        // this._revGridSettingsChangedSubscriptionId = this._gridSettingsService.subscribeSettingsChangedEvent(() => {
        //     gridAdapter.ApplySettings(this._gridSettingsService.revGridSettings);
        // });
    }

    get frame(): TradesFrame { return this._frame; }

    // onColumnWidthChanged(columnIndex: Integer) {
    //     this._frame.adviseColumnWidthChanged(columnIndex);
    // }

   // Component Access members

    get id(): string {
        return '';
        // todo - needs to return a unique id for this component
    }

    // public gridGetRenderedActiveWidth() {
    //     return this._gridAdapter.GetRenderedActiveWidth(false);
    // }

    public setBadness(value: Badness) {
        this._delayedBadnessComponent.setBadness(value);
    }

    public hideBadnessWithVisibleDelay(badness: Badness) {
        this._delayedBadnessComponent.hideWithVisibleDelay(badness);
    }
}

export namespace TradesNgComponent {
    export namespace JsonName {
        export const frame = 'frame';
    }

    export const frameGridProperties: MotifGrid.FrameGridProperties = {
        fixedColumnCount: 0,
        gridRightAligned: false,
    };
}
