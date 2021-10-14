/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { GridLayout } from 'src/content/internal-api';
import { Integer } from 'src/sys/internal-api';

@Component({
    selector: 'app-grid-column-properties',
    templateUrl: './grid-column-properties-ng.component.html',
    styleUrls: ['./grid-column-properties-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridColumnPropertiesNgComponent implements OnInit {
    columnChangeEvent: GridColumnPropertiesComponent.ColumnChangeEvent;
    positionChangeEvent: GridColumnPropertiesComponent.PositionChangeEvent;

    // only support editing of position, visible, width

    private _column: GridLayout.Column;
    private _position: Integer;

    constructor() {
    }

    ngOnInit() {
    }

    setColumn(column: GridLayout.Column, position: Integer) {
        this._column = column;
        this._position = position;
        this.load();
    }

    get column() { return this._column; }
    get position() { return this._position; }

    private load() {

    }
}

export namespace GridColumnPropertiesComponent {
    export type PositionChangeEvent = (column: GridLayout.Column, position: Integer) => void;
    export type ColumnChangeEvent = (column: GridLayout.Column) => void;
}
