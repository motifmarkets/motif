/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridAttribute, GridDataStore, GridField, GridFieldNameToHeaderMap, GridFieldState, GridLayout, TRecordIndex } from '@motifmarkets/revgrid';
import { IntegerRenderValue, StringRenderValue } from './render-value';

export class GridLayoutDataStore implements GridDataStore {
    private _layout: GridLayout;
    private _headersMap: GridFieldNameToHeaderMap;

    constructor() { }

    getLayout() {
        return this._layout;
    }

    setData(layoutWithHeadings: GridLayoutDataStore.GridLayoutWithHeaders) {
        this._layout = layoutWithHeadings.layout;
        this._headersMap = layoutWithHeadings.headersMap;
    }

    clearData() {
        this._layout = new GridLayout(); // replace with empty one
        this._headersMap.clear();
    }

    createPositionField() { return new GridLayoutDataStore.PositionField(this._layout); }
    createNameField() { return new GridLayoutDataStore.NameField(); }
    createHeadingField() { return new GridLayoutDataStore.HeadingField(this._headersMap); }
    createVisibleField() { return new GridLayoutDataStore.VisibleField(); }
    createWidthField() { return new GridLayoutDataStore.WidthField(); }
    createSortPriorityField() { return new GridLayoutDataStore.SortPriorityField(); }
    createSortAscendingField() { return new GridLayoutDataStore.SortAscendingField(); }

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

    // eslint-disable-next-line @typescript-eslint/ban-types
    GetRecordValue(index: TRecordIndex): object {
        return this._layout.GetColumn(index);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    GetRecords(): ArrayLike<object> {
        return this._layout.GetColumns();
    }

    GetRecordAttributes?(index: TRecordIndex): GridAttribute[] {
        return [];
    }

    get RecordCount(): number {
        return this._layout.columnCount;
    }
}

export namespace GridLayoutDataStore {
    export namespace FieldName {
        export const position = 'Position';
        export const name = 'Name';
        export const heading = 'Heading';
        export const visible = 'Visible';
        export const width = 'Width';
        export const sortPriority = 'Sort Priority';
        export const sortAscending = 'Sort Ascending';
    }
    export interface GridLayoutWithHeaders {
        layout: GridLayout;
        headersMap: GridFieldNameToHeaderMap;
    }

    export class PositionField extends GridField {
        constructor(private _layout: GridLayout) {
            super(FieldName.position);
        }

        GetFieldValue(record: GridLayout.Column): IntegerRenderValue {
            const index = this._layout.IndexOfColumn(record);
            return new IntegerRenderValue(index);
        }
    }

    export class NameField extends GridField {
        constructor() {
            super(FieldName.name);
        }

        GetFieldValue(record: GridLayout.Column): StringRenderValue {
            return new StringRenderValue(record.Field.Name);
        }
    }

    export class HeadingField extends GridField {
        constructor(private _headersMap: GridFieldNameToHeaderMap) {
            super(FieldName.heading);
        }

        GetFieldValue(record: GridLayout.Column): StringRenderValue {
            const heading = this._headersMap.get(record.Field.Name);
            return new StringRenderValue(heading === undefined ? record.Field.Name : heading);
        }
    }

    export class VisibleField extends GridField {
        constructor() {
            super(FieldName.visible);
        }

        GetFieldValue(record: GridLayout.Column): StringRenderValue {
            return new StringRenderValue(record.Visible ? 'Y' : '');
        }
    }

    export class WidthField extends GridField {
        constructor() {
            super(FieldName.width);
        }

        GetFieldValue(record: GridLayout.Column): IntegerRenderValue {
            return new IntegerRenderValue(record.Width);
        }
    }

    export class SortPriorityField extends GridField {
        constructor() {
            super(FieldName.sortPriority);
        }

        GetFieldValue(record: GridLayout.Column): IntegerRenderValue {
            return new IntegerRenderValue(record.SortPriority);
        }
    }

    export class SortAscendingField extends GridField {
        constructor() {
            super(FieldName.sortAscending);
        }

        GetFieldValue(record: GridLayout.Column): StringRenderValue {
            const sortAscending = record.SortAscending;
            let value: string | undefined;
            if (sortAscending === undefined) {
                value = undefined;
            } else {
                value = sortAscending ? '+' : '-';
            }
            return new StringRenderValue(value);
        }
    }

    export const StringGridFieldState: GridFieldState = {
        Header: undefined,
        Width: undefined,
        Alignment: 'left'
    };
    export const IntegerGridFieldState: GridFieldState = {
        Header: undefined,
        Width: undefined,
        Alignment: 'right'
    };
}
