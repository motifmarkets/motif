/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridLayout, MotifGrid } from 'src/content/internal-api';
import { AssertInternalError, Integer, JsonElement } from 'src/sys/internal-api';
import { TableFieldCustomHeadings } from './table-field-custom-headings';
import { TableFieldDefinitionSource } from './table-field-definition-source';
import { TableFieldSource } from './table-field-source';
import { TableGridField } from './table-grid-field';
import { TableGridFieldAndStateArrays } from './table-grid-field-and-state-arrays';
import { TableGridValue } from './table-grid-value';

export class TableFieldList {
    private _sources: TableFieldSource[] = [];
    private _fieldCount: Integer = 0;
    private _gridFields: TableGridField[] | undefined = undefined;
    private _gridFieldInitialStates: MotifGrid.FieldState[] | undefined = undefined;

    get sourceCount() { return this._sources.length; }
    get fieldCount() { return this._fieldCount; }

    get gridFields(): TableGridField[] {
        return this.getGridFields();
    }

    get gridFieldInitialStates(): MotifGrid.FieldState[] {
        return this.getGridFieldInitialStates();
    }

    get gridFieldsAndInitialStates(): TableGridFieldAndStateArrays {
        return this.getGridFieldsAndInitialStates();
    }

    clear() {
        this._sources = [];
        this._fieldCount = 0;
        this._gridFields = undefined;
        this._gridFieldInitialStates = undefined;
    }

    getSource(idx: Integer) { return this._sources[idx]; }
    getFieldName(idx: Integer) {
        const findFieldResult = this.findFieldSourceIndex(idx);
        if (!findFieldResult.found) {
            throw new AssertInternalError('TFLGFN84312', `${idx}`);
        } else {
            return this._sources[findFieldResult.sourceIndex].getIndexAdjustedFieldName(findFieldResult.sourceFieldIndex);
        }
    }

    getFieldHeading(idx: Integer) {
        const findFieldResult = this.findFieldSourceIndex(idx);
        if (!findFieldResult.found) {
            throw new AssertInternalError('TFLGFH45576', `${idx}`);
        } else {
            return this._sources[findFieldResult.sourceIndex].getIndexAdjustedFieldHeading(findFieldResult.sourceFieldIndex);
        }
    }

    findFieldByName(name: string): Integer | undefined {
        const sourceCount = this._sources.length;
        if (sourceCount <= 0) {
            return undefined;
        } else {
            const upperName = name.toUpperCase();
            for (let i = 0; i < sourceCount; i++) {
                const source = this._sources[i];
                const sourceFieldIdx = source.findFieldByName(upperName);
                if (sourceFieldIdx !== undefined) {
                    return sourceFieldIdx + source.fieldIndexOffset;
                }
            }
        }

        return undefined;
    }

    saveToJson(element: JsonElement) {
        // if (!this._standard) {
        //     throw new AssertInternalError('TFLSTJ75554');
        // } else {
        //     element.setString(TableFieldList.jsonTag_StandardId, TableFieldList.Standard.idToJsonValue(this._standardId));
        // }
    }

    addSource(source: TableFieldSource) {
        const sourceFieldCount = source.fieldCount;
        source.fieldIndexOffset = this._fieldCount;
        source.nextFieldIndexOffset = source.fieldIndexOffset + sourceFieldCount;

        this._sources.push(source);

        this._fieldCount += sourceFieldCount;
    }

    addSourceFromDefinition(definitionSource: TableFieldDefinitionSource, feedHeadingPrefix: string = '') {
        const source = new TableFieldSource(definitionSource, feedHeadingPrefix);
        this.addSource(source);
    }

    // createTableValueList(initialRecordIndex: Integer): TableValueList {
    //     const result = new TableValueList();
    //     for (let i = 0; i < this.sources.length; i++) {
    //         const fieldSource = this.sources[i];
    //         const valueSource = fieldSource.createValueSource(/*this.fieldCount*/fieldSource.fieldIndexOffset, initialRecordIndex);
    //         result.addSource(valueSource);
    //     }
    //     return result;
    // }

    createSourceUndefinedTableGridValueArray(sourceIdx: Integer) {
        const source = this._sources[sourceIdx];
        return source.createUndefinedTableGridValueArray();
    }

    createUndefinedTableGridValueArray(): TableGridValue[] {
        let result = new Array<TableGridValue>(0);
        for (let i = 0; i < this._sources.length; i++) {
            const valueArray = this.createSourceUndefinedTableGridValueArray(i);
            result = result.concat(valueArray);
        }
        return result;
    }

    addMissingFieldsToLayout(layout: GridLayout, visible: boolean) {
        for (let i = 0; i < this.sourceCount; i++) {
            this.addMissingSourceFieldsToLayout(layout, this._sources[i], visible);
        }
    }

    private getGridFields(): TableGridField[] {
        let result: TableGridField[];
        if (this._gridFields !== undefined) {
            result = this._gridFields;
        } else {
            result = new Array<TableGridField>(0);
            for (let i = 0; i < this.sourceCount; i++) {
                const source = this._sources[i];
                result = result.concat(source.getGridFields());
            }
            this._gridFields = result;
        }
        return result;
    }

    private getGridFieldInitialStates(): MotifGrid.FieldState[] {
        let result: MotifGrid.FieldState[];
        if (this._gridFieldInitialStates !== undefined) {
            result = this._gridFieldInitialStates;
        } else {
            result = new Array<MotifGrid.FieldState>(0);
            for (let i = 0; i < this.sourceCount; i++) {
                const source = this._sources[i];
                result = result.concat(source.getGridFieldInitialStates());
            }
            this._gridFieldInitialStates = result;
        }
        return result;
    }

    private getGridFieldsAndInitialStates(): TableGridFieldAndStateArrays {
        return {
            fields: this.getGridFields(),
            states: this.getGridFieldInitialStates()
        };
    }

    private indexOfSource(name: string): Integer {
        return this._sources.findIndex((source: TableFieldSource) => source.name === name);
    }

    private findFieldSourceIndex(idx: Integer): TableFieldList.FindFieldSourceIndexResult {
        if (idx >= 0) {
            const sourceCount = this._sources.length;
            if (sourceCount > 0) {
                for (let i = 0; i < sourceCount; i++) {
                    const source = this._sources[i];
                    if (idx < source.nextFieldIndexOffset) {
                        return {
                            found: true,
                            sourceIndex: i,
                            sourceFieldIndex: idx - source.fieldIndexOffset
                        };
                    }
                }
            }
        }

        return {
            found: false,
            sourceIndex: -1,
            sourceFieldIndex: -1
        };
    }

    private addMissingSourceFieldsToLayout(layout: GridLayout, source: TableFieldSource, visible: boolean) {
        for (let i = 0; i < source.fieldCount; i++) {
            const fieldName = source.getIndexAdjustedFieldName(i);
            if (!layout.hasField(fieldName)) {
                layout.addField(fieldName, visible);
            }
        }
    }
}

export namespace TableFieldList {

    // export class Layout {
    //     fields: Layout.Field[] = [];

    //     addField(name: string, columnIndex: Integer, visible: boolean) {
    //         const field = new Layout.Field(name, columnIndex, visible);
    //         this.fields.push(field);
    //     }

    //     findFieldIndex(name: string): Integer {
    //         return this.fields.findIndex((field: Layout.Field) => field.name === name);
    //     }

    //     hasField(name: string): boolean {
    //         const idx = this.findFieldIndex(name);
    //         return idx >= 0;
    //     }
    // }

    // export namespace Layout {
    //     export class Field {
    //         constructor(
    //             public name: string,
    //             public columnIndex: Integer,
    //             public visible: boolean
    //         ) { }
    //     }
    // }

    export interface FindFieldSourceIndexResult {
        found: boolean;
        sourceIndex: Integer;
        sourceFieldIndex: Integer;
    }

    export const customHeadings = new TableFieldCustomHeadings('CustomFieldHeadings');

    // export function tryGetFromJson(element: JsonElement): TableFieldList | undefined {
        // const loadedStandardIdAsString = element.tryGetString(TableFieldList.jsonTag_StandardId);
        // if (loadedStandardIdAsString === undefined) {
        //     return undefined;
        // } else {
        //     const loadedStandardId = TableFieldList.Standard.tryJsonValueToId(loadedStandardIdAsString);
        //     if (loadedStandardId === undefined) {
        //         return undefined;
        //     } else {
        //         return standardFieldLists[loadedStandardId];
        //     }
        // }
    // }

    export function createEmpty(): TableFieldList {
        return new TableFieldList();
    }

    export function createCopy(list: TableFieldList): TableFieldList {
        const result = new TableFieldList();
        for (let i = 0; i < list.sourceCount; i++) {
            result.addSource(list.getSource(i).createCopy());
        }
        return result;
    }

    export function initialiseStatic() {
        // nothing for now
    }
}
