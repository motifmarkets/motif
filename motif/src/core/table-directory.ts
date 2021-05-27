/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    Guid,
    Integer,
    JsonElement,
    Logger,
    mSecsPerSec,
    SysTick,
    UsableListChangeTypeId
} from 'src/sys/internal-api';
import { Table, TableList } from './table';
import { TableRecordDefinitionList } from './table-record-definition-list';

export class TableDirectory {
    private entries: TableDirectory.Entry[] = [];

    private _saveModified: boolean;
    private nextPeriodicSaveCheckTime: SysTick.Time =
        SysTick.now() + TableDirectory.periodicSaveCheckInterval;
    private savePeriodicRequired: boolean;

    constructor() {}

    get count() {
        return this.entries.length;
    }
    get saveModified() {
        return this._saveModified;
    }

    indexOfList(list: Table): Integer {
        return this.entries.findIndex((entry) => entry.table === list);
    }

    indexOfId(id: Guid): Integer {
        return this.entries.findIndex((entry) => entry.table.id === id);
    }

    getTable(idx: Integer) {
        return this.entries[idx].table;
    }

    add(): Integer {
        const entry = new TableDirectory.Entry();
        entry.saveRequiredEvent = () => this.handleSaveRequiredEvent();
        return this.entries.push(entry) - 1;
    }

    delete(idx: Integer) {
        if (this.entries[idx].lockCount !== 0) {
            throw new AssertInternalError(
                'TDD2995887',
                `${this.entries[idx].lockCount}`
            );
        } else {
            this.entries.splice(idx, 1);
        }
    }

    clear() {
        this.entries.length = 0;
    }

    initialise() {
        this.load();
    }

    load() {
        // todo
    }

    save() {
        const rootElement = new JsonElement();
        this.saveToJson(rootElement);
        const serialisedData = rootElement.stringify();
        // todo
    }

    checkSave(onlyIfPeriodicRequired: boolean) {
        if (
            this.savePeriodicRequired ||
            (!onlyIfPeriodicRequired && this._saveModified)
        ) {
            this.save();
        }
    }

    checkPeriodiSaveRequired(nowTime: SysTick.Time) {
        if (nowTime > this.nextPeriodicSaveCheckTime) {
            if (this._saveModified) {
                this.savePeriodicRequired = true;
            }

            this.nextPeriodicSaveCheckTime =
                nowTime + TableDirectory.periodicSaveCheckInterval;
        }
    }

    compareName(leftIdx: Integer, rightIdx: Integer) {
        this.entries[leftIdx].table.compareNameTo(this.entries[rightIdx].table);
    }

    lockById(id: Guid, locker: TableDirectory.Locker): Table | undefined {
        const idx = this.indexOfId(id);
        return idx < 0 ? undefined : this.lock(idx, locker);
    }

    lock(idx: Integer, locker: TableDirectory.Locker): Table {
        const entry = this.entries[idx];
        entry.lock(locker);
        return entry.table;
    }

    unlockTable(list: Table, locker: TableDirectory.Locker) {
        const idx = this.indexOfList(list);
        if (idx < 0) {
            throw new AssertInternalError(
                'TDUT113872',
                `${list.recordDefinitionListName}`
            );
        } else {
            this.unlock(idx, locker);
        }
    }

    unlock(idx: Integer, locker: TableDirectory.Locker) {
        const entry = this.entries[idx];
        entry.unlock(locker);
    }

    isTableLocked(list: Table, ignoreLocker: TableDirectory.Locker): boolean {
        const idx = this.indexOfList(list);
        if (idx < 0) {
            throw new AssertInternalError(
                'TDITL55789',
                `${list.recordDefinitionListName}`
            );
        } else {
            return this.isLocked(idx, ignoreLocker);
        }
    }

    isLocked(
        idx: Integer,
        ignoreLocker: TableDirectory.Locker | undefined
    ): boolean {
        const entry = this.entries[idx];
        return entry.isLocked(ignoreLocker);
    }

    open(idx: Integer, opener: TableDirectory.Opener): Table {
        const entry = this.entries[idx];
        entry.open(opener);
        return entry.table;
    }

    closeTable(list: Table, opener: TableDirectory.Opener) {
        const idx = this.indexOfList(list);
        if (idx < 0) {
            throw new AssertInternalError(
                'TDCT6677667',
                `${list.recordDefinitionListName}`
            );
        } else {
            this.close(idx, opener);
        }
    }

    close(idx: Integer, opener: TableDirectory.Opener) {
        const entry = this.entries[idx];
        entry.close(opener);
    }

    lockAll(locker: TableDirectory.Locker): TableList {
        const result = new TableList();
        result.capacity = this.count;
        for (let i = 0; i < this.count; i++) {
            const entry = this.entries[i];
            entry.lock(locker);
            result.add(entry.table);
        }
        return result;
    }

    unlockLockList(lockList: TableList, locker: TableDirectory.Locker) {
        for (let i = 0; i < lockList.count; i++) {
            this.unlockTable(lockList.getItem(i), locker);
        }
    }

    private handleSaveRequiredEvent() {
        this._saveModified = true;
    }

    private loadFromJson(element: JsonElement): boolean {
        return false;
        // todo
    }

    private saveToJson(element: JsonElement) {
        const watchlistElements = new Array<JsonElement>(this.count);
        for (let i = 0; i < this.entries.length; i++) {
            const entry = this.entries[i];
            const watchlistElement = new JsonElement();
            entry.table.saveToJson(watchlistElement);
            watchlistElements[i] = watchlistElement;
        }
        element.setElementArray(
            TableDirectory.jsonTag_Watchlists,
            watchlistElements
        );
    }
}

export namespace TableDirectory {
    export type Locker = Table.Locker;
    export type Opener = Table.Opener;

    export type SaveRequiredEvent = (this: void) => void;

    export const jsonTag_Root = 'Watchlists';
    export const jsonTag_Watchlists = 'Watchlist';
    export const periodicSaveCheckInterval = 60.0 * mSecsPerSec;

    export class Entry {
        saveRequiredEvent: SaveRequiredEvent;

        private _table: Table;
        private lockers: Locker[] = [];
        private openers: Opener[] = [];

        private layoutChangeNotifying: boolean;

        constructor() {
            this._table = new Table();
            this.table.openEvent = (recordDefinitionList) =>
                this.handleOpenEvent(recordDefinitionList);
            this.table.openChangeEvent = (opened) =>
                this.handleOpenChangeEvent(opened);
            this.table.badnessChangeEvent = () =>
                this.handleBadnessChangeEvent();
            this.table.listChangeEvent = (typeId, itemIdx, itemCount) =>
                this.handleListChangeEvent(typeId, itemIdx, itemCount);
            this.table.valueChangeEvent = (fieldIdx, recordIdx) =>
                this.handleValueChangeEvent(fieldIdx, recordIdx);
            this.table.recordChangeEvent = (recordIdx) =>
                this.handleRecordChangeEvent(recordIdx);
            this.table.layoutChangedEvent = (opener) =>
                this.handleLayoutChangedEvent(opener);
            this.table.recordDisplayOrderChangedEvent = (opener) =>
                this.handleItemDisplayOrderChangedEvent(opener);
            this.table.recordDisplayOrderSetEvent = (itemIndices) =>
                this.handleItemDisplayOrderSetEvent(itemIndices);
            this.table.firstPreUsableEvent = () =>
                this.handleFirstPreUsableEvent();
        }

        get table() {
            return this._table;
        }

        open(opener: Opener) {
            this.openers.push(opener);
            if (this.openers.length === 1) {
                this._table.open();
            }
        }

        close(opener: Opener) {
            const idx = this.openers.indexOf(opener);
            if (idx < 0) {
                Logger.assert(
                    false,
                    'WatchItemDefinitionListDirectory.close: opener not found'
                );
            } else {
                this.openers.splice(idx, 1);
                if (this.openers.length === 0) {
                    this._table.close();
                }
            }
        }

        get openCount() {
            return this.openers.length;
        }

        lock(locker: Locker) {
            this.lockers.push(locker);
        }

        unlock(locker: Locker) {
            const idx = this.lockers.indexOf(locker);
            if (idx < 0) {
                Logger.assert(
                    false,
                    'WatchItemDefinitionListDirectory.unlock: locker not found'
                );
            } else {
                this.lockers.splice(idx, 1);
            }
        }

        get lockCount() {
            return this.lockers.length;
        }

        isLocked(ignoreLocker: Locker | undefined) {
            switch (this.lockCount) {
                case 0:
                    return false;
                case 1:
                    return (
                        ignoreLocker === undefined ||
                        this.lockers[0] !== ignoreLocker
                    );
                default:
                    return true;
            }
        }

        getGridOpenCount(): Integer {
            let result = 0;
            this.openers.forEach((opener: Opener) => {
                if (opener.isTableGrid()) {
                    result++;
                }
            });
            return result;
        }

        getFirstGridOpener(): Opener | undefined {
            return this.openers.find((opener: Opener) => opener.isTableGrid());
        }

        private handleOpenEvent(
            recordDefinitionList: TableRecordDefinitionList
        ) {
            this.openers.forEach((opener: Opener) =>
                opener.notifyTableOpen(recordDefinitionList)
            );
        }

        private handleBadnessChangeEvent() {
            this.openers.forEach((opener: Opener) =>
                opener.notifyTableBadnessChange()
            );
        }

        private handleOpenChangeEvent(opened: boolean) {
            this.openers.forEach((opener: Opener) =>
                opener.notifyTableOpenChange(opened)
            );
        }

        private handleListChangeEvent(
            typeId: UsableListChangeTypeId,
            itemIdx: Integer,
            itemCount: Integer
        ) {
            this.openers.forEach((opener: Opener) =>
                opener.notifyTableRecordListChange(typeId, itemIdx, itemCount)
            );

            this.saveRequiredEvent();
        }

        private handleValueChangeEvent(fieldIdx: Integer, recordIdx: Integer) {
            this.openers.forEach((opener: Opener) =>
                opener.notifyTableValueChange(fieldIdx, recordIdx)
            );
        }

        private handleRecordChangeEvent(recordIdx: Integer) {
            this.openers.forEach((opener: Opener) =>
                opener.notifyTableRecordChange(recordIdx)
            );
        }

        private handleLayoutChangedEvent(opener: Opener) {
            if (!this.layoutChangeNotifying) {
                this.layoutChangeNotifying = true;
                try {
                    const count = this.getGridOpenCount();

                    if (count > 1) {
                        this.openers.forEach((openerElem: Opener) => {
                            if (
                                openerElem.isTableGrid() &&
                                openerElem !== opener
                            ) {
                                openerElem.notifyTableLayoutUpdated();
                            }
                        });
                    }
                } finally {
                    this.layoutChangeNotifying = false;
                }

                this.saveRequiredEvent();
            }
        }

        private handleItemDisplayOrderChangedEvent(opener: Opener) {
            const count = this.getGridOpenCount();

            if (count > 1) {
                const recIndices = opener.getOrderedGridRecIndices();
                this.openers.forEach((openerElem: Opener) => {
                    if (openerElem.isTableGrid() && openerElem !== opener) {
                        openerElem.notifyTableRecordDisplayOrderChanged(
                            recIndices
                        );
                    }
                });
            }
            this.saveRequiredEvent();
        }

        private handleItemDisplayOrderSetEvent(itemIndices: Integer[]) {
            this.openers.forEach((openerElem: Opener) => {
                if (openerElem.isTableGrid()) {
                    openerElem.notifyTableRecordDisplayOrderChanged(
                        itemIndices
                    );
                }
            });

            this.saveRequiredEvent();
        }

        private handleFirstPreUsableEvent() {
            const opener = this.getFirstGridOpener();
            if (opener !== undefined) {
                opener.notifyTableFirstPreUsable();
            }
        }
    }
}

export let tableDirectory: TableDirectory;

export function setTableDirectory(value: TableDirectory) {
    tableDirectory = value;
}
