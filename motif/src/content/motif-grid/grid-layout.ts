import { RevRecord, RevRecordFieldIndex, RevRecordMainAdapter } from 'revgrid';
import { ExternalError, GridLayoutError } from 'sys-internal-api';

/**
 * Provides access to a saved layout for a Grid
 *
 * @public
 */
export class GridLayout {
    private readonly _fields: GridLayout.Field[];
    private readonly _recordColumns: GridLayout.RecordColumn[];

    /**
     * Creates a new Layout
     *
     * @param fields - The fields to pre-populate it with
     */
    constructor(
        fieldNames?: string[]
    ) {
        if (fieldNames === undefined || fieldNames.length === 0) {
            this._fields = [];
            this._recordColumns = [];
        } else {
            this._fields = fieldNames.map<GridLayout.Field>((name) => new GridLayout.Field(name));
            this._recordColumns = this._fields.map<GridLayout.RecordColumn>((field, index) => ({ index, field, visible: true }));
        }
    }

    get columnCount(): number {
        return this._recordColumns.length;
    }

    /**
     * Registers a new Field with the Layout
     *
     * @param gridField - The field to register
     */
    addField(fieldName: string, visible = true): GridLayout.Column {
        const index = this._recordColumns.length;
        const field = new GridLayout.Field(fieldName);
        const column: GridLayout.RecordColumn = {
            index,
            field,
            visible
        };

        this._fields.push(field);
        this._recordColumns.push(column);

        return column;
    }

    createCopy(): GridLayout {
        const result = new GridLayout(this._fields.map<string>((field) => field.name));
        this._recordColumns.forEach((column, index) => {
            const resultColumn = result._recordColumns[index];
            resultColumn.sortAscending = column.sortAscending;
            resultColumn.sortPriority = column.sortPriority;
            resultColumn.visible = column.visible;
            resultColumn.width = column.width;
        });

        return result;
    }

    /**
     * Deserialises a saved layout into this Grid Layout
     *
     * @param layout - A layout previously returned by @see Serialise
     */
    deserialise(source: GridLayout.SerialisedColumn[]): void {
        const nameMap = new Map<string, GridLayout.Field>();

        for (const field of this._fields) {
            nameMap.set(field.name, field);
        }

        let index = 0;

        for (const columnLayout of source) {
            const field = nameMap.get(columnLayout.name);

            if (field === undefined) {
                continue;
            } // Ignore the undefined field

            const columnIndex = index++;

            this.moveFieldColumn(field, columnIndex);

            const column = this._recordColumns[columnIndex];

            column.width = columnLayout.width;
            column.visible = columnLayout.show === undefined ? true : columnLayout.show;
            column.sortPriority = columnLayout.priority;
            column.sortAscending = columnLayout.ascending;
        }
    }

    hasField(fieldName: string): boolean {
        return this._fields.findIndex((field) => field.name === fieldName) >= 0;
    }

    getColumn(columnIndex: number): GridLayout.Column {
        return this._recordColumns[columnIndex];
    }

    /** Gets all columns */
    getColumns(): GridLayout.Column[] {
        return this._recordColumns.slice();
    }

    getRecord(recordIndex: number): GridLayout.RecordColumn {
        return this._recordColumns[recordIndex];
    }

    /** Gets all records */
    getRecords(): readonly GridLayout.RecordColumn[] {
        return this._recordColumns;
    }

    indexOfColumn(column: GridLayout.Column): number {
        return this._recordColumns.indexOf(column as GridLayout.RecordColumn);
    }

    moveColumn(fromColumnIndex: number, toColumnIndex: number): boolean {
        if (fromColumnIndex === toColumnIndex || fromColumnIndex === toColumnIndex - 1) {
            return false;
        } else {
            const column = this._recordColumns[fromColumnIndex];

            this._recordColumns.splice(fromColumnIndex, 1);

            if (toColumnIndex > fromColumnIndex) {
                toColumnIndex--;
            }

            this._recordColumns.splice(toColumnIndex, 0, column);

            this.reindexColumns();

            return true;
        }
    }

    reindexColumns() {
        const columns = this._recordColumns;
        const columnCount = columns.length;
        for (let i = 0; i < columnCount; i++) {
            columns[i].index = i;
        }
    }

    serialise(): GridLayout.SerialisedColumn[] {
        return this._recordColumns.map<GridLayout.SerialisedColumn>((column) => {
            const result: GridLayout.SerialisedColumn = {
                name: column.field.name, width: column.width, priority: column.sortPriority, ascending: column.sortAscending
            };

            if (!column.visible) {
                result.show = false;
            }

            return result;
        });
    }

    setFieldColumnsByFieldNames(fieldNames: string[]): void {
        for (let idx = 0; idx < fieldNames.length; idx++) {
            const field = this.getFieldByName(fieldNames[idx]);
            if (field !== undefined) {
                this.moveFieldColumn(field, idx);
            }
        }
    }

    setFieldColumnsByColumnIndices(columnIndices: number[]): void {
        for (let idx = 0; idx < columnIndices.length; idx++) {
            const columnIdx = columnIndices[idx];
            this.moveColumn(columnIdx, idx);
        }
    }

    setFieldSorting(sorting: readonly RevRecordMainAdapter.SortFieldSpecifier[]): void {
        for (let idx = 0; idx < this._recordColumns.length; idx++) {
            const column = this._recordColumns[idx];

            delete column.sortPriority;
            delete column.sortAscending;
        }

        for (let idx = 0; idx < sorting.length; idx++) {
            const specifier = sorting[idx];

            const columnIndex = this.getFieldColumnIndexByFieldIndex(specifier.fieldIndex);
            const column = this._recordColumns[columnIndex];

            column.sortPriority = idx;
            column.sortAscending = specifier.ascending;
        }
    }

    setFieldWidthByFieldName(fieldName: string, width?: number): void {
        const columnIdx = this.getFieldColumnIndexByFieldName(fieldName);
        if (columnIdx !== undefined) {
            const column = this._recordColumns[columnIdx];
            this.setFieldWidthByColumn(column, width);
        }
    }

    setFieldsVisible(fieldNames: string[], visible: boolean): void {
        for (let idx = 0; idx < fieldNames.length; idx++) {
            const columnIdx = this.getFieldColumnIndexByFieldName(fieldNames[idx]);
            if (columnIdx !== undefined) {
                this._recordColumns[columnIdx].visible = visible;
            }
        }
    }

    private setFieldWidthByColumn(column: GridLayout.Column, width?: number): void {
        if (width === undefined) {
            delete column.width;
        } else {
            column.width = width;
        }
    }

    // SetFieldVisible(field: TFieldIndex | GridLayout.Field, visible: boolean): void {
    //     this.columns[this.GetFieldColumnIndex(field)].Visible = visible;
    // }

    private setColumnVisible(columnIndex: number, visible: boolean): void {
        this._recordColumns[columnIndex].visible = visible;
    }

    private moveFieldColumn(field: GridLayout.Field, columnIndex: number): void {
        const oldColumnIndex = this.getFieldColumnIndexByField(field);

        if (oldColumnIndex === undefined) {
            throw new GridLayoutError(ExternalError.Code.GridLayoutFieldDoesNotExist, field.name);
        }

        this.moveColumn(oldColumnIndex, columnIndex);
    }

    private getFieldByName(fieldName: string): GridLayout.Field | undefined {
        return this._fields.find((field) => field.name === fieldName);
    }

    private getFieldIndexByName(fieldName: string): number | undefined {
        const idx = this._fields.findIndex((field) => field.name === fieldName);
        return idx < 0 ? undefined : idx;
    }

    private getFieldColumnIndexByFieldName(fieldName: string): number | undefined {
        const idx = this._recordColumns.findIndex((column) => column.field.name === fieldName);
        return idx < 0 ? undefined : idx;
    }

    private getFieldColumnIndexByFieldIndex(fieldIdx: RevRecordFieldIndex): number {
        const field = this._fields[fieldIdx];
        return this.getFieldColumnIndexByField(field);
    }

    private getFieldColumnIndexByField(field: GridLayout.Field): number {
        for (let idx = 0; idx < this._recordColumns.length; idx++) {
            if (this._recordColumns[idx].field === field) {
                return idx;
            }
        }

        throw new GridLayoutError(ExternalError.Code.GridLayoutColumnNotFoundForField, `${field.name}`);
    }

    /** Gets all visible columns */
    private getVisibleColumns(): GridLayout.Column[] {
        return this._recordColumns.filter(column => column.visible);
    }

    private setFieldWidthByField(field: GridLayout.Field, width?: number): void {
        const columnIdx = this.getFieldColumnIndexByField(field);
        const column = this._recordColumns[columnIdx];
        this.setFieldWidthByColumn(column, width);
    }

    private setFieldWidthByFieldIndex(fieldIdx: RevRecordFieldIndex, width?: number): void {
        const columnIdx = this.getFieldColumnIndexByFieldIndex(fieldIdx);
        const column = this._recordColumns[columnIdx];

        this.setFieldWidthByColumn(column, width);
    }
}

/** @public */
export namespace GridLayout {
    export class Field {
        constructor(public readonly name: string) { }
    }

    export interface Column {
        field: Field;
        visible: boolean;
        width?: number;
        sortPriority?: number;
        sortAscending?: boolean;
    }

    export interface SortPrioritizedColumn extends Column {
        sortPriority: number;
    }

    export interface SerialisedColumn {
        name: string;
        show?: boolean;
        width?: number;
        priority?: number;
        ascending?: boolean;
    }

    export interface RecordColumn extends Column, RevRecord {
    }
}
