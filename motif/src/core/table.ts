/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecordInvalidatedValue } from 'revgrid';
import { GridLayout } from 'src/content/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import {
    AssertInternalError,
    Badness,
    ComparableList,
    compareString,
    Guid,
    Integer,
    JsonElement,
    Logger,
    MultiEvent,
    UnreachableCaseError,
    UsableListChangeTypeId
} from 'src/sys/internal-api';
import { v1 as uuid } from 'uuid';
import { BaseDirectory } from './base-directory';
import { GridLayoutIO } from './grid-layout-io';
import { TableDefinition } from './table-definition';
import { tableDefinitionFactory } from './table-definition-factory';
import { TableGridFieldAndStateArrays } from './table-grid-field-and-state-arrays';
import { TableRecord } from './table-record';
import { LitIvemIdTableRecordDefinition, TableRecordDefinition, TableRecordDefinitionArray } from './table-record-definition';
import { TableRecordDefinitionList } from './table-record-definition-list';
import { TableRecordDefinitionListDirectory } from './table-record-definition-list-directory';

export class Table implements TableRecordDefinitionListDirectory.ILocker {
    name: string;

    openEvent: Table.OpenEvent;
    openChangeEvent: Table.OpenChangeEvent;
    badnessChangeEvent: Table.BadnessChangeEvent;
    listChangeEvent: Table.ListChangeEvent;
    recordValuesChangedEvent: Table.RecordValuesChangedEvent;
    recordFieldsChangedEvent: Table.RecordFieldsChangedEvent;
    recordChangedEvent: Table.RecordChangedEvent;
    layoutChangedEvent: Table.LayoutChangedEvent;
    recordDisplayOrderChangedEvent: Table.RecordDisplayOrderChangedEvent;
    firstPreUsableEvent: Table.FirstPreUsableEvent;
    recordDisplayOrderSetEvent: Table.RecordDisplayOrderSetEvent;

    private _definition: TableDefinition;
    private _recordDefinitionList: TableRecordDefinitionList;
    private _recordDefinitionListBadnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _recordDefinitionListListChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _recordDefinitionListAfterRecDefinitionChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _recordDefinitionListBeforeRecDefinitionChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _layout = new GridLayout();
    private _records: TableRecord[] = [];
    private _id: Guid;
    private _orderedRecordDefinitions: TableRecordDefinitionArray = [];
    private _orderedRecordDefinitionsValidated = false;
    private _badness = Badness.createCopy(Badness.inactive);
    private _good = false;
    private _usable = false;
    private _firstUsable = false;
    private _setGoodBadTransactionId = 0;

    get id() { return this._id; }
    get fieldList() { return this._definition.fieldList; }
    get opened() { return this._definition.opened; }
    get recordCount() { return this._records.length; }
    get records(): readonly TableRecord[] { return this._records; }

    get layout() { return this._layout; }
    set layout(value: GridLayout) { this._layout = value; }

    get recordDefinitionList() { return this._recordDefinitionList; }
    get recordDefinitionListName() { return this.getRecordDefinitionListName(); }
    get recordDefinitionListTypeAbbr() { return this.getRecordDefinitionListTypeAbbr(); }
    get recordDefinitionListTypeDisplay() { return this.getRecordDefinitionListTypeDisplay(); }
    get recordDefinitionListMissing() { return this.getRecordDefinitionListMissing(); }

    get badness() { return this._badness; }
    get firstUsable() { return this._firstUsable; }

    get changeRecordDefinitionOrderAllowed(): boolean { return this.getChangeRecordDefinitionOrderAllowed(); }
    get addDeleteRecordDefinitionsAllowed(): boolean { return this.getAddDeleteRecordDefinitionsAllowed(); }

    // ILocker function

    getLockerName(): string {
        return 'T: ' + this.name;
    }

    subscriberInterfaceDescriminator() {
        // no code - interface descriminator
    }

    lockerInterfaceDescriminator() {
        // no code - interface descriminator
    }

    openerInterfaceDescriminator() {
        // no code - interface descriminator
    }

    setDefinition(value: TableDefinition) {
        if (this._definition !== undefined) {
            this._definition.checkCloseAndUnlockRecordDefinitionList(this);
        }
        this._id = uuid();

        this._definition = value;
        this._recordDefinitionList = this._definition.lockRecordDefinitionList(this);

        this._recordDefinitionListBadnessChangeSubscriptionId = this._recordDefinitionList.subscribeBadnessChangeEvent(
            () => this.handleRecordDefinitionListBadnessChangeEvent()
        );
        this._recordDefinitionListListChangeSubscriptionId = this._recordDefinitionList.subscribeListChangeEvent(
            (listChangeType, recordIdx, recordCount) =>
                this.handleRecordDefinitionListListChangeEvent(listChangeType, recordIdx, recordCount)
        );
        this._recordDefinitionListBeforeRecDefinitionChangeSubscriptionId =
            this._recordDefinitionList.subscribeBeforeRecDefinitionChangeEvent(
                (recordIdx) => this.handleRecordDefinitionListBeforeRecDefinitionChangeEvent(recordIdx)
            );
        this._recordDefinitionListAfterRecDefinitionChangeSubscriptionId =
            this._recordDefinitionList.subscribeAfterRecDefinitionChangeEvent(
                (recordIdx) => this.handleRecordDefinitionListAfterRecDefinitionChangeEvent(recordIdx)
            );

        if (this._recordDefinitionList.usable) {
            const count = this._recordDefinitionList.count;
            if (count > 0) {
                this.processRecordDefinitionListListChange(UsableListChangeTypeId.PreUsableAdd, 0, count);
            }
            this.processRecordDefinitionListListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.processRecordDefinitionListListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    setNameFromRecordDefinitionList() {
        if (this.recordDefinitionList === undefined) {
            throw new AssertInternalError('TSNFRDL75542');
        } else {
            this.name = this.recordDefinitionList.name;
        }
    }

    loadFromJson(element: JsonElement /*, ScaleByMParam: Integer, ScaleByDParam: Integer*/) {
        let modified = false;
        this.clearRecords();

        const loadedId = element.tryGetGuid(Table.JsonTag.id, 'Table.loadFromJson: Id');
        if (loadedId !== undefined) {
            this._id = loadedId;
        } else {
            this._id = uuid();
            modified = true;
        }

        const loadedName = element.tryGetString(Table.JsonTag.name, 'Table.loadFromJson: name');
        if (loadedName !== undefined) {
            this.name = loadedName;
        } else {
            this.name = Strings[StringId.Unnamed];
            modified = true;
        }

        const sourceElement = element.tryGetElement(Table.JsonTag.source, 'Table.loadFromJson: source');
        if (sourceElement === undefined) {
            return Logger.logPersistError('TLFJS28289', element.stringify());
        } else {
            const definition = tableDefinitionFactory.tryCreateFromJson(sourceElement);
            if (definition === undefined) {
                return undefined;
            } else {
                this.setDefinition(definition);

                this.layout = this.createDefaultLayout();
                const layoutElement = element.tryGetElement(Table.JsonTag.layout, 'Table.loadFromJson: layout');
                const serialisedColumns = GridLayoutIO.loadLayout(layoutElement);
                if (serialisedColumns) {
                    this.layout.deserialise(serialisedColumns);
                }
                return true;
            }
        }
    }

    saveToJson(element: JsonElement /*, ScaleByMParam: Integer, ScaleByDParam: Integer*/) {
        element.setGuid(Table.JsonTag.id, this.id);
        element.setString(Table.JsonTag.name, this.name);
        const sourceElement = element.newElement(Table.JsonTag.source);
        this._definition.saveToJson(sourceElement);
        const layoutElement = element.newElement(Table.JsonTag.layout);
        const columns = this.layout.serialise();
        GridLayoutIO.saveLayout(columns, layoutElement);

        const orderedRecordDefinitionsElement = element.newElement(Table.JsonTag.orderedRecordDefinitions);
        for (let i = 0; i < this._orderedRecordDefinitions.length; i++) {
            const orderedRecordDefinitionElement = orderedRecordDefinitionsElement.newElement(Table.JsonTag.orderedRecordDefinition);
            this._orderedRecordDefinitions[i].saveKeyToJson(orderedRecordDefinitionElement);
        }
    }

    open(recordDefinitionListIdx?: Integer) {
        if (this._recordDefinitionList === undefined) {
            throw new AssertInternalError('TA299587');
        } else {
            this.close();

            this._definition.open();

            // this._definition.open(); will push definitionlist definitions
            // if (this._recordDefinitionList.usable) {
            //     this.processRecordDefinitionListListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
            //     const count = this._recordDefinitionList.count;
            //     if (count > 0) {
            //         this.processRecordDefinitionListListChange(UsableListChangeTypeId.PreUsableAdd, 0, count);
            //     }
            //     this.processRecordDefinitionListListChange(UsableListChangeTypeId.Usable, 0, 0);
            // } else {
            //     this.processRecordDefinitionListListChange(UsableListChangeTypeId.Unusable, 0, 0);
            // }

            this.openEvent(this.recordDefinitionList);
            this.openChangeEvent(this.opened);
        }
    }

    close() {
        if (this._definition !== undefined && this._definition.opened) {
            this._recordDefinitionList.unsubscribeBadnessChangeEvent(this._recordDefinitionListBadnessChangeSubscriptionId);
            this._recordDefinitionListBadnessChangeSubscriptionId = undefined;
            this._recordDefinitionList.unsubscribeListChangeEvent(this._recordDefinitionListListChangeSubscriptionId);
            this._recordDefinitionListListChangeSubscriptionId = undefined;
            this._recordDefinitionList.unsubscribeBeforeRecDefinitionChangeEvent(
                this._recordDefinitionListBeforeRecDefinitionChangeSubscriptionId);
            this._recordDefinitionListBeforeRecDefinitionChangeSubscriptionId = undefined;
            this._recordDefinitionList.unsubscribeAfterRecDefinitionChangeEvent(
                this._recordDefinitionListAfterRecDefinitionChangeSubscriptionId);
            this._recordDefinitionListAfterRecDefinitionChangeSubscriptionId = undefined;

            this.processRecordDefinitionListListChange(UsableListChangeTypeId.Clear, 0, 0);
            this._definition.checkClose(); // change this

            this.setUnusable(Badness.inactive);

            this._orderedRecordDefinitionsValidated = false;
            this._firstUsable = false;

            this.openChangeEvent(this.opened);
        }
    }

    getRecord(idx: Integer) { return this._records[idx]; }

    deleteRecord(idx: Integer) {
        this.recordDefinitionList.delete(idx);
    }

    findRecord(recordDefinition: TableRecordDefinition): Integer | undefined {
        for (let i = 0; i < this.recordCount; i++) {
            const record = this._records[i];
            if (record.definition.sameAs(recordDefinition)) {
                return i;
            }
        }
        return undefined;
    }

    findLitIvemId(recordDefinition: LitIvemIdTableRecordDefinition): Integer | undefined {
        for (let i = 0; i < this.recordCount; i++) {
            const record = this._records[i];
            const elementRecordDefinition = record.definition;
            if (TableRecordDefinition.hasLitIvemIdInterface(elementRecordDefinition)) {
                if (elementRecordDefinition.sameAs(recordDefinition)) {
                    return i;
                }
            }
        }
        return undefined;
    }

    clearRendering() {
        for (let i = 0; i < this.recordCount; i++) {
            const record = this._records[i];
            record.clearRendering();
        }
    }

    /*generateFieldNames(): string[] {
        return [];
        // todo
    }*/

    /*getFieldName(fieldIdx: Integer): string {
        return '';
        // todo
    }*/

    /*getFieldHeading(fieldIdx: Integer): string {
        return '';
        // todo
    }*/

    /*getAttributedFieldHeading(fieldIdx: Integer): string {
        return '';
        // todo
    }*/
    /*function FindSecurityDataItemField(SecurityFieldId: TSecurityFieldId; out FieldIdx: Integer): Boolean;
    function FindNewsField(FieldId: TWatchValueSource_News.TFieldId; out FieldIdx: Integer): Boolean;
    function FindAlertsField(FieldId: TWatchValueSource_Alerts.TFieldId; out FieldIdx: Integer): Boolean;
    function FindTmcDefinitionLegsField(FieldId: TWatchValueSource_TmcDefinitionLegs.TFieldId; out FieldIdx: Integer): Boolean;
    */

    createDefaultLayout() { return this._definition.createDefaultLayout(); }

    hasPrivateRecordDefinitionList(): boolean {
        return this._definition.hasPrivateRecordDefinitionList();
    }

    /*newPrivateRecordDefinitionList() {
        this.close();
        this.open();
    }*/

    /*lockRecordDefinitionListById(id: Guid): boolean {
        const idx = tableRecordDefinitionListDirectory.indexOfId(id);
        if (idx < 0) {
            return false;
        } else {
            this.lockRecordDefinitionListByIndex(idx);
            return true;
        }
    }

    lockRecordDefinitionListByIndex(idx: Integer): TableRecordDefinitionList {
        this.closeRecordDefinitionList();
        this._recordDefinitionList = tableRecordDefinitionListDirectory.lock(idx, this);
        return this._recordDefinitionList;
    }*/

    clearRecordDefinitions() {
        this.recordDefinitionList.clear();
    }

    canAddRecordDefinition(value: TableRecordDefinition): boolean {
        if (this._recordDefinitionList === undefined) {
            return false;
        } else {
            return this._recordDefinitionList.canAdd(value);
        }
    }

    canAddRecordDefinitions(definitions: TableRecordDefinitionArray): boolean {
        if (this._recordDefinitionList === undefined) {
            return false;
        } else {
            return this._recordDefinitionList.canAddArray(definitions);
        }
    }

    addRecordDefinition(value: TableRecordDefinition) {
        this.recordDefinitionList.add(value);
    }

    setRecordDefinition(idx: Integer, value: TableRecordDefinition) {
        this.recordDefinitionList.setDefinition(idx, value);
    }

    canMoveOrderedRecordDefinitions(srcIdx: Integer, srcCount: Integer, destIdx: Integer): boolean {
        return this.changeRecordDefinitionOrderAllowed
            &&
            ((destIdx < srcIdx) || (destIdx > (srcIdx + srcCount)));
    }

    /*assign(src: Table) {
        this._fieldList = TableFieldList.createCopy(src._fieldList);
        this.orderedRecordDefinitions = new Array<ITableRecordDefinition>(src.orderedRecordDefinitions.length);
        for (let i = 0; i < src.orderedRecordDefinitions.length; i++) {
            this.orderedRecordDefinitions[i] = src.orderedRecordDefinitions[i].createCopy();
        }

        if (src.hasPrivateRecordDefinitionList()) {
            src.closeRecordDefinitionList();
            const newList = PortfolioTableRecordDefinitionList.createFromRecordDefinitionList(src.recordDefinitionList);
            this.bindPrivateRecordDefinitionList(newList);
        } else {
            if ((this._recordDefinitionList === undefined)
                || this.hasPrivateRecordDefinitionList()
                || (this.recordDefinitionList.id !== src.recordDefinitionList.id)) {
                this.closeRecordDefinitionList();
                this.lockRecordDefinitionListById(src.recordDefinitionList.id);
            }
        }

        this.layout = new GridLayout();
        this.layout.Deserialise(src.layout.Serialise());
    }

    convertToPrivateUserRecordDefinitionList() {
        const newList = PortfolioTableRecordDefinitionList.createFromRecordDefinitionList(this.recordDefinitionList);
        this.closeRecordDefinitionList();
        this.bindPrivateRecordDefinitionList(newList);
    }*/

    compareNameTo(other: Table): Integer {
        return compareString(this.name, other.name);
    }

    adviseLayoutChanged(notifier: Table.Opener, newLayout: GridLayout) {
        this.layout = new GridLayout();
        this.layout.deserialise(newLayout.serialise());
    }

    adviseRecordDisplayOrderChanged(notifier: Table.Opener, newDisplayOrder: TableRecordDefinitionArray) {
        this._orderedRecordDefinitions = newDisplayOrder;
        this.notifyRecordDisplayOrderChanged(notifier);
    }

    getGridFieldsAndInitialStates(): TableGridFieldAndStateArrays {
        return this._definition.fieldList.gridFieldsAndInitialStates;
    }

    private handleRecordDefinitionListBadnessChangeEvent() {
        this.checkSetUnusable(this._recordDefinitionList.badness);
    }

    private handleRecordDefinitionListListChangeEvent(
            listChangeTypeId: UsableListChangeTypeId,
            recordIdx: Integer,
            recordCount: Integer) {
        this.processRecordDefinitionListListChange(listChangeTypeId, recordIdx, recordCount);
    }

    private handleRecordDefinitionListBeforeRecDefinitionChangeEvent(recordIdx: Integer) {
        this._records[recordIdx].deactivate();
    }

    private handleRecordDefinitionListAfterRecDefinitionChangeEvent(recordIdx: Integer) {
        const tableRecordDefinition = this.recordDefinitionList.getDefinition(recordIdx);
        const valueList = this._definition.createTableValueList(tableRecordDefinition);
        this._records[recordIdx].setRecordDefinition(tableRecordDefinition, valueList);
        this._records[recordIdx].activate();

        this.recordChangedEvent(recordIdx);
    }

    private handleRecordFirstUsableEvent() {
        if (!this._firstUsable && this._recordDefinitionList !== undefined && this._recordDefinitionList.usable) {
            this.checkProcessRecordsFirstUsable();
        }
    }

    private notifyBadnessChange() {
        this.badnessChangeEvent();
    }

    private notifyListChange(listChangeTypeId: UsableListChangeTypeId, recordIdx: Integer, recordCount: Integer) {
        this.listChangeEvent(listChangeTypeId, recordIdx, recordCount);
    }

    private notifyLayoutChange(opener: Table.Opener) {
        this.layoutChangedEvent(opener);
    }

    private notifyRecordDisplayOrderChanged(opener: Table.Opener) {
        this.recordDisplayOrderChangedEvent(opener);
    }

    private notifyFirstUsable() {
        this.firstPreUsableEvent();
    }

    private notifyRecordDisplayOrderSet(recordIndices: Integer[]) {
        this.recordDisplayOrderSetEvent(recordIndices);
    }

    private processUsableChange() {
        if (this._usable) {
            this.notifyListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
            const usableRecordCount = this.recordCount;
            if (usableRecordCount > 0) {
                this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, usableRecordCount);
            }
            if (!this._orderedRecordDefinitionsValidated) {
                this.validateOrderedRecordDefinitions();
            }
            if (!this.firstUsable) {
                this.checkProcessRecordsFirstUsable();
            }
            this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
        }
    }

    private setGood() {
        if (!this._good) {
            const oldUsable = this._usable;
            this._good = true;
            this._usable = true;
            this._badness = Badness.createCopy(Badness.notBad);
            const transactionId = ++this._setGoodBadTransactionId;
            if (!oldUsable) {
                this.processUsableChange();
            }
            if (transactionId === this._setGoodBadTransactionId) {
                this.notifyBadnessChange();
            }
        }
    }

    private setUsable(badness: Badness) {
        if (Badness.isUnusable(badness)) {
            throw new AssertInternalError('TSU268305888'); // must always be bad
        } else {
            this.setBadness(badness);
        }
    }

    private setUnusable(badness: Badness) {
        if (Badness.isUsable(badness)) {
            throw new AssertInternalError('TSUN268305888'); // must always be bad
        } else {
            this.setBadness(badness);
        }
    }

    private checkSetUnusable(badness: Badness) {
        if (Badness.isUnusable(badness)) {
            this.setBadness(badness);
        }
    }

    private setBadness(badness: Badness) {
        if (Badness.isGood(badness)) {
            this.setGood();
        } else {
            const newReasonId = badness.reasonId;
            const newReasonExtra = badness.reasonExtra;
            if (newReasonId !== this._badness.reasonId || newReasonExtra !== this.badness.reasonExtra) {
                const oldUsable = this._usable;
                this._good = false;
                this._badness = {
                    reasonId: newReasonId,
                    reasonExtra: newReasonExtra,
                } as const;
                this._usable = Badness.isUsable(badness);
                const transactionId = ++this._setGoodBadTransactionId;
                if (oldUsable) {
                    this.processUsableChange();
                }
                if (transactionId === this._setGoodBadTransactionId) {
                    this.notifyBadnessChange();
                }
            }
        }
    }

    private processRecordDefinitionListListChange(listChangeTypeId: UsableListChangeTypeId, recordIdx: Integer, recordCount: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this.setUnusable(this._recordDefinitionList.badness);
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this.clearRecords();
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                this.insertRecords(recordIdx, recordCount);
                break;
            case UsableListChangeTypeId.Usable:
                this.setUsable(this._recordDefinitionList.badness);
                break;
            case UsableListChangeTypeId.Insert:
                this.insertRecords(recordIdx, recordCount);
                this.notifyListChange(UsableListChangeTypeId.Insert, recordIdx, recordCount);
                break;
            case UsableListChangeTypeId.Remove:
                this.notifyListChange(UsableListChangeTypeId.Remove, recordIdx, recordCount);
                this.deleteRecords(recordIdx, recordCount);
                break;
            case UsableListChangeTypeId.Clear:
                this.notifyListChange(UsableListChangeTypeId.Clear, 0, this.recordCount);
                this.clearRecords();
                break;
            default:
                throw new UnreachableCaseError('THTRDLLCE20098', listChangeTypeId);
        }
    }

    private validateOrderedRecordDefinitions() {
        let recordIndices: Integer[];

        if (this.recordCount === 0) {
            this._orderedRecordDefinitions.length = 0;
            recordIndices = [];
        } else {
            const recordUsages = new Array<Table.RecordUsageRec>(this.recordCount);
            for (let i = 0; i < this.recordCount; i++) {
                recordUsages[i] = { record: this.getRecord(i), used: false };
            }

            const validatedDefinitions = new Array<TableRecordDefinition>(this.recordCount);
            recordIndices = new Array<Integer>(this.recordCount);

            let validatedCount = 0;

            for (let i = 0; i < this._orderedRecordDefinitions.length; i++) {
                const recordDefinition = this._orderedRecordDefinitions[i];
                const recordIdx = recordUsages.findIndex((usage: Table.RecordUsageRec) =>
                    !usage.used && usage.record.definition.sameAs(recordDefinition));

                if (recordIdx >= 0) {
                    validatedDefinitions[validatedCount] = recordDefinition;
                    recordIndices[validatedCount] = recordIdx;
                    validatedCount++;

                    if (validatedCount < this.recordCount) {
                        break;
                    }
                }
            }

            if (validatedCount < this.recordCount) {
                for (let i = 0; i < recordUsages.length; i++) {
                    if (!recordUsages[i].used) {
                        validatedDefinitions[validatedCount] = recordUsages[i].record.definition;
                        recordIndices[validatedCount] = i;
                        validatedCount++;

                        if (validatedCount === this.recordCount) {
                            break;
                        }
                    }
                }
            }

            this._orderedRecordDefinitions = validatedDefinitions;
        }

        this._orderedRecordDefinitionsValidated = true;
        this.notifyRecordDisplayOrderSet(recordIndices);
    }

    private checkProcessRecordsFirstUsable() {
        let allFirstUsable = true;
        for (let i = 0; i < this._records.length; i++) {
            if (!this._records[i].firstUsable) {
                allFirstUsable = false;
                break;
            }
        }

        if (allFirstUsable) {
            this._firstUsable = true;
            this.notifyFirstUsable();
        }
    }

    private insertRecords(idx: Integer, insertCount: Integer) {
        if (this.recordDefinitionList === undefined) {
            throw new AssertInternalError('TIR200985');
        } else {
            const newRecordsArray = new Array<TableRecord>(insertCount);
            for (let i = 0; i < insertCount; i++) {
                const recIdx = idx + i;

                const record = new TableRecord(recIdx);
                record.valuesChangedEvent = (recordIdx, invalidatedValues) => this.recordValuesChangedEvent(recordIdx, invalidatedValues);
                record.fieldsChangedEvent = (recordIdx, fieldIndex, fieldCount) =>
                    this.recordFieldsChangedEvent(recordIdx, fieldIndex, fieldCount);
                record.recordChangedEvent = (recordIdx) => this.recordChangedEvent(recordIdx);
                record.firstUsableEvent = () => this.handleRecordFirstUsableEvent(); // Event not implemented
                newRecordsArray[i] = record;
            }

            this._records.splice(idx, 0, ...newRecordsArray);

            for (let i = idx + insertCount; i < this._records.length; i++) {
                this._records[i].index = i;
            }

            // this._valueChangedEventSuppressed = true;
            // try {
            for (let i = idx; i < idx + insertCount; i++) {
                const tableRecordDefinition = this.recordDefinitionList.getDefinition(i);
                const valueList = this._definition.createTableValueList(tableRecordDefinition);
                this._records[i].setRecordDefinition(tableRecordDefinition, valueList);
                this._records[i].activate();
            }
            // }
            // finally {
            //     this._valueChangedEventSuppressed = false;
            // }
        }
    }

    private deleteRecords(idx: Integer, deleteCount: Integer) {
        for (let i = idx; i < idx + deleteCount; i++) {
            this._records[i].deactivate();
        }

        this._records.splice(idx, deleteCount);

        for (let i = idx; i < this._records.length; i++) {
            this._records[i].index = i;
        }
    }

    private clearRecords() {
        if (this.recordCount > 0) {
            for (let i = 0; i < this.recordCount; i++) {
                this._records[i].deactivate();
            }

            this._records.length = 0;
        }
    }

    private updateAllRecordValues() {
        for (let i = 0; i < this.recordCount; i++) {
            this._records[i].updateAllValues();
        }
    }

    private getRecordDefinitionListName(): string {
        return this.recordDefinitionList.name;
    }

    private getRecordDefinitionListTypeAbbr(): string {
        return this.recordDefinitionList.typeAsAbbr;
    }

    private getRecordDefinitionListTypeDisplay(): string {
        return this.recordDefinitionList.typeAsDisplay;
    }

    private getRecordDefinitionListMissing(): boolean {
        return this.recordDefinitionList.missing;
    }

    /*function GetItems(Idx: Integer): TItem;
    function GetFieldNames(FieldIdx: Integer): string;
    function GetFieldHeadings(FieldIdx: Integer): string;
    function GetItemCount: Integer;
    function GetDefaultLayout: TGridXmlLayout;*/
    private getChangeRecordDefinitionOrderAllowed(): boolean {
        return this.recordDefinitionList.changeDefinitionOrderAllowed;
    }

    private getAddDeleteRecordDefinitionsAllowed(): boolean {
        return this.recordDefinitionList.addDeleteDefinitionsAllowed;
    }

    // private getStandardFieldListId(): TableFieldList.StandardId {
    //     if (this.fieldList === undefined) {
    //         return TableFieldList.StandardId.Null;
    //     } else {
    //         if (!this.fieldList.standard) {
    //             return TableFieldList.StandardId.Null;
    //         } else {
    //             return this.fieldList.standardId;
    //         }
    //     }
    // }
}

export namespace Table {
    export namespace JsonTag {
        export const id = 'id';
        export const name = 'name';
        export const source = 'source';
        export const layout = 'layout';
        export const columns = 'columns';
        export const column = 'column';
        export const orderedRecordDefinitions = 'orderedRecordDefinitions';
        export const orderedRecordDefinition = 'orderedRecordDefinition';

        export namespace SerialisedColumn {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            export const name = 'name';
            export const show = 'show';
            export const width = 'width';
            export const priority = 'priority';
            export const ascending = 'ascending';
        }
    }

    export interface Locker extends BaseDirectory.Entry.ISubscriber {
        readonly lockerName: string;
    }

    export interface Opener extends BaseDirectory.Entry.ISubscriber {
        isTableGrid(): boolean;

        notifyTableOpen(recordDefinitionList: TableRecordDefinitionList): void;
        notifyTableOpenChange(opened: boolean): void;
        notifyTableRecordListChange(listChangeTypeId: UsableListChangeTypeId, recordIdx: Integer, changeCount: Integer): void;
        notifyTableBadnessChange(): void;
        notifyTableRecordValuesChanged(recordIdx: Integer, invalidatedValues: RevRecordInvalidatedValue[]): void;
        notifyTableRecordFieldsChanged(recordIdx: number, fieldIndex: number, fieldCount: number): void;
        notifyTableRecordChanged(recordIdx: Integer): void;
        notifyTableLayoutUpdated(): void;
        notifyTableRecordDisplayOrderChanged(recordIndices: Integer[]): void;
        notifyTableFirstPreUsable(): void;

        getOrderedGridRecIndices(): Integer[];
    }

    export interface RecordUsageRec {
        record: TableRecord;
        used: boolean;
    }

    export type OpenEvent = (this: void, recordDefinitionList: TableRecordDefinitionList) => void;
    export type OpenChangeEvent = (this: void, opened: boolean) => void;
    export type BadnessChangeEvent = (this: void) => void;
    export type ListChangeEvent = (this: void, listChangeType: UsableListChangeTypeId, recordIdx: Integer, recordCount: Integer) => void;
    export type RecordValuesChangedEvent = (this: void, recordIdx: Integer, invalidatedValues: RevRecordInvalidatedValue[]) => void;
    export type RecordFieldsChangedEvent = (this: void, recordIdx: Integer, fieldIdx: Integer, fieldCount: Integer) => void;
    export type RecordChangedEvent = (this: void, recordIdx: Integer) => void;
    export type LayoutChangedEvent = (this: void, subscriber: Opener) => void;
    export type RecordDisplayOrderChangedEvent = (this: void, subscriber: Opener) => void;
    export type FirstPreUsableEvent = (this: void) => void;
    export type RecordDisplayOrderSetEvent = (this: void, recordIndices: Integer[]) => void;

    export function moveRecordDefinitionsInArray(anArray: TableRecordDefinitionArray,
        srcIdx: Integer, srcCount: Integer, destIdx: Integer) {
        const srcBuffer = anArray.slice(srcIdx, srcIdx + srcCount);

        if (destIdx < srcIdx) {
            // Shuffle up
            let shuffleUpDestIdx = srcIdx + srcCount - 1;
            for (let shuffleSrcIdx = srcIdx - 1; shuffleSrcIdx >= destIdx; shuffleSrcIdx--) {
                anArray[shuffleUpDestIdx] = anArray[shuffleSrcIdx];
                shuffleUpDestIdx--;
            }
        } else {
            let shuffleDownDestIdx = srcIdx;
            for (let shuffleSrcIdx = srcIdx + srcCount; shuffleSrcIdx < destIdx - srcCount; shuffleSrcIdx++) {
                anArray[shuffleDownDestIdx] = anArray[shuffleSrcIdx];
                shuffleDownDestIdx++;
            }
        }

        let shuffleDestIdx = destIdx;
        for (let shuffleSrcIdx = 0; shuffleSrcIdx < srcBuffer.length; shuffleSrcIdx++) {
            anArray[shuffleDestIdx] = srcBuffer[shuffleSrcIdx];
            shuffleDestIdx++;
        }
    }
}

export class TableList extends ComparableList<Table> {

    compareName(leftIdx: Integer, rightIdx: Integer): Integer {
        return this.getItem(leftIdx).compareNameTo(this.getItem(rightIdx));
    }

    find(name: string, ignoreCase: boolean): Integer | undefined {
        return ignoreCase ? this.findIgnoreCase(name) : this.findCaseSensitive(name);
    }

    findCaseSensitive(name: string): Integer | undefined {
        for (let i = 0; i < this.count; i++) {
            if (this.getItem(i).name === name) {
                return i;
            }
        }
        return undefined;
    }

    findIgnoreCase(name: string): Integer | undefined {
        const upperName = name.toUpperCase();
        for (let i = 0; i < this.count; i++) {
            if (this.getItem(i).name.toUpperCase() === upperName) {
                return i;
            }
        }
        return undefined;
    }
}

export class OpenedTable extends Table {
    private opener: Table.Opener;

    constructor(opener: Table.Opener) {
        super();

        this.opener = opener;
        this.openEvent = (recordDefinitionList) => this.opener.notifyTableOpen(recordDefinitionList);
        this.openChangeEvent = (opened) => this.opener.notifyTableOpenChange(opened);
        this.badnessChangeEvent = () => this.opener.notifyTableBadnessChange();
        this.listChangeEvent =
            (listChangeTypeId, recordIdx, recordCount) => this.opener.notifyTableRecordListChange(listChangeTypeId, recordIdx, recordCount);
        this.recordValuesChangedEvent = (recordIdx, invalidatedValues) =>
            this.opener.notifyTableRecordValuesChanged(recordIdx, invalidatedValues);
        this.recordFieldsChangedEvent = (recordIdx, fieldIndex, fieldCount) =>
            this.opener.notifyTableRecordFieldsChanged(recordIdx, fieldIndex, fieldCount);
        this.recordChangedEvent = (recordIdx) => this.opener.notifyTableRecordChanged(recordIdx);
        this.layoutChangedEvent = (subscriber) => this.handleLayoutChangedEvent(subscriber);
        this.recordDisplayOrderChangedEvent = (subscriber) => this.handleRecordDisplayOrderChangedEvent(subscriber);
        this.firstPreUsableEvent = () => this.opener.notifyTableFirstPreUsable();
        this.recordDisplayOrderSetEvent = (recordIndices) => this.opener.notifyTableRecordDisplayOrderChanged(recordIndices);
    }

    private handleLayoutChangedEvent(subscriber: Table.Opener) {
        // no code
    }

    private handleRecordDisplayOrderChangedEvent(subscriber: Table.Opener) {
        // no code
    }
}
