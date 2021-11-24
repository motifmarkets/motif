/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MotifGrid } from 'content-internal-api';
import { Integer } from 'sys-internal-api';
import { TableFieldDefinitionSource } from './table-field-definition-source';
import { TableGridField } from './table-grid-field';
import { TableGridValue } from './table-grid-value';

export class TableFieldSource {
    fieldIndexOffset: Integer;
    nextFieldIndexOffset: Integer;

    constructor(private _definitionSource: TableFieldDefinitionSource, private _headingPrefix: string) { }

    get name(): string { return this._definitionSource.sourceName; }
    get fieldCount(): Integer { return this._definitionSource.fieldCount; }

    getFieldName(idx: Integer) {
        return this._definitionSource.getFieldName(idx - this.fieldIndexOffset);
    }

    getIndexAdjustedFieldName(idx: Integer) {
        return this._definitionSource.getFieldName(idx);
    }

    getFieldHeading(idx: Integer) {
        const prefix = this._headingPrefix;
        const unprefixedHeading = this._definitionSource.getFieldHeading(idx - this.fieldIndexOffset);
        if (prefix.length === 0) {
            return unprefixedHeading;
        } else {
            return prefix + unprefixedHeading;
        }
    }

    getIndexAdjustedFieldHeading(idx: Integer) {
        const prefix = this._headingPrefix;
        const unprefixedHeading = this._definitionSource.getFieldHeading(idx);
        if (prefix.length === 0) {
            return unprefixedHeading;
        } else {
            return prefix + unprefixedHeading;
        }
    }

    findFieldByName(name: string): Integer | undefined {
        return this._definitionSource.findFieldByName(name);
    }

    // createValueSource(firstFieldIdx: Integer, initialRecordIdx: Integer): TableValueSource {
    //     return this.definition.createTableValueSource(firstFieldIdx, initialRecordIdx);
    // }

    createUndefinedTableGridValueArray(): TableGridValue[] {
        return this._definitionSource.createUndefinedTableGridValueArray();
    }


    createCopy(): TableFieldSource {
        const result = new TableFieldSource(this._definitionSource, this._headingPrefix);
        result.fieldIndexOffset = this.fieldIndexOffset;
        result.nextFieldIndexOffset = this.nextFieldIndexOffset;
        return result;
    }

    getGridFields(): TableGridField[] {
        return this._definitionSource.getGridFields(this.fieldIndexOffset);
    }

    getGridFieldInitialStates(): MotifGrid.FieldState[] {
        return this._definitionSource.getGridFieldInitialStates(this.fieldIndexOffset, this._headingPrefix);
    }
}
