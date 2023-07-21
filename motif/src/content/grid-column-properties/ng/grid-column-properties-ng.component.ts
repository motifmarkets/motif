/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, ElementRef } from '@angular/core';
import { GridLayout, Integer } from '@motifmarkets/motif-core';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-grid-column-properties',
    templateUrl: './grid-column-properties-ng.component.html',
    styleUrls: ['./grid-column-properties-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridColumnPropertiesNgComponent extends ContentComponentBaseNgDirective {
    private static typeInstanceCreateCount = 0;

    columnChangeEvent: GridColumnPropertiesComponent.ColumnChangeEvent;
    positionChangeEvent: GridColumnPropertiesComponent.PositionChangeEvent;

    // only support editing of position, visible, width

    private _column: GridLayout.Column;
    private _position: Integer;

    constructor(elRef: ElementRef<HTMLElement>) {
        super(elRef, ++GridColumnPropertiesNgComponent.typeInstanceCreateCount);
    }

    get column() { return this._column; }
    get position() { return this._position; }

    setColumn(column: GridLayout.Column, position: Integer) {
        this._column = column;
        this._position = position;
        this.load();
    }

    private load() {
        //
    }
}

export namespace GridColumnPropertiesComponent {
    export type PositionChangeEvent = (column: GridLayout.Column, position: Integer) => void;
    export type ColumnChangeEvent = (column: GridLayout.Column) => void;
}
