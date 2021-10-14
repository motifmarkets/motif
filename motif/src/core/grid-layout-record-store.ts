/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecordField, RevRecordIndex, RevRecordStore } from 'revgrid';
import { GridLayout, MotifGrid } from 'src/content/internal-api';
import { IntegerRenderValue, StringRenderValue } from './render-value';

export class GridLayoutRecordStore implements RevRecordStore {
    private _layout: GridLayout;
    private _headersMap: MotifGrid.FieldNameToHeaderMap;

    constructor() { }

    getLayout() {
        return this._layout;
    }

    setData(layoutWithHeadings: MotifGrid.LayoutWithHeadersMap) {
        this._layout = layoutWithHeadings.layout;
        this._layout.reindexColumns();
        this._headersMap = layoutWithHeadings.headersMap;
    }

    clearData() {
        this._layout = new GridLayout(); // replace with empty one
        this._headersMap.clear();
    }

    createPositionField() { return new GridLayoutRecordStore.PositionField(this._layout); }
    createNameField() { return new GridLayoutRecordStore.NameField(); }
    createHeadingField() { return new GridLayoutRecordStore.HeadingField(this._headersMap); }
    createVisibleField() { return new GridLayoutRecordStore.VisibleField(); }
    createWidthField() { return new GridLayoutRecordStore.WidthField(); }
    createSortPriorityField() { return new GridLayoutRecordStore.SortPriorityField(); }
    createSortAscendingField() { return new GridLayoutRecordStore.SortAscendingField(); }

    /*createFields(): GridField[] {
        const result = new Array<GridField>(7);
        result[0] = new GridLayoutDataStore.PositionField(this._layout);
        result[1] = new GridLayoutDataStore.NameField();
        result[2] = new GridLayoutDataStore.HeadingField(this._headingsMap);
        result[3] = new GridLayoutDataStore.VisibleField();
        result[4] = new GridLayoutDataStore.WidthField();
        result[5] = new GridLayoutDataStore.SortPriorityField();
        result[6] = new GridLayoutDataStore.SortAscendingField();

        return result;
    }*/

    getRecord(index: RevRecordIndex) {
        return this._layout.getRecord(index);
    }

    getRecords() {
        return this._layout.getRecords();
    }

    get recordCount(): number {
        return this._layout.columnCount;
    }
}

export namespace GridLayoutRecordStore {
    export namespace FieldName {
        export const position = 'Position';
        export const name = 'Name';
        export const heading = 'Heading';
        export const visible = 'Visible';
        export const width = 'Width';
        export const sortPriority = 'Sort Priority';
        export const sortAscending = 'Sort Ascending';
    }

    export class PositionField implements RevRecordField {
        readonly name = FieldName.position;
        constructor(private _layout: GridLayout) {
        }

        getFieldValue(record: GridLayout.RecordColumn): IntegerRenderValue {
            const index = this._layout.indexOfColumn(record);
            return new IntegerRenderValue(index);
        }
    }

    export class NameField implements RevRecordField {
        readonly name = FieldName.name;

        getFieldValue(record: GridLayout.RecordColumn): StringRenderValue {
            return new StringRenderValue(record.field.name);
        }
    }

    export class HeadingField implements RevRecordField {
        readonly name = FieldName.heading;

        constructor(private _headersMap: MotifGrid.FieldNameToHeaderMap) {
        }

        getFieldValue(record: GridLayout.RecordColumn): StringRenderValue {
            const heading = this._headersMap.get(record.field.name);
            return new StringRenderValue(heading === undefined ? record.field.name : heading);
        }
    }

    export class VisibleField implements RevRecordField {
        readonly name = FieldName.visible;

        getFieldValue(record: GridLayout.RecordColumn): StringRenderValue {
            return new StringRenderValue(record.visible ? 'Y' : '');
        }
    }

    export class WidthField implements RevRecordField {
        readonly name = FieldName.width;

        getFieldValue(record: GridLayout.RecordColumn): IntegerRenderValue {
            return new IntegerRenderValue(record.width);
        }
    }

    export class SortPriorityField implements RevRecordField {
        readonly name = FieldName.sortPriority;

        getFieldValue(record: GridLayout.RecordColumn): IntegerRenderValue {
            return new IntegerRenderValue(record.sortPriority);
        }
    }

    export class SortAscendingField implements RevRecordField {
        readonly name = FieldName.sortAscending;

        getFieldValue(record: GridLayout.RecordColumn): StringRenderValue {
            const sortAscending = record.sortAscending;
            let value: string | undefined;
            if (sortAscending === undefined) {
                value = undefined;
            } else {
                value = sortAscending ? '+' : '-';
            }
            return new StringRenderValue(value);
        }
    }

    export const StringGridFieldState: MotifGrid.FieldState = {
        header: undefined,
        width: undefined,
        alignment: 'left'
    };
    export const IntegerGridFieldState: MotifGrid.FieldState = {
        header: undefined,
        width: undefined,
        alignment: 'right'
    };
}
