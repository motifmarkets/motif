/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { nanoid } from 'nanoid';
import { AssertInternalError, Authorisations, EnumInfoOutOfOrderError, Guid, Integer, Logger, SysTick } from 'src/sys/internal-api';
import { GroupTableRecordDefinitionList } from './group-table-record-definition-list';
import { IvemIdServerTableRecordDefinitionList } from './ivem-id-server-table-record-definition-list';
import { PortfolioTableRecordDefinitionList } from './portfolio-table-record-definition-list';
import {
    NullTableRecordDefinitionList, TableRecordDefinitionList,
    TableRecordDefinitionListList,
    UserTableRecordDefinitionList
} from './table-record-definition-list';

export class TableRecordDefinitionListDirectory {
    private localFilePath = '';
    private groupLoadFilePath = TableRecordDefinitionListDirectory.defaultGroupLoadFilePath;
    private groupLoadFileAccessTypeId = TableRecordDefinitionListDirectory.defaultGroupLoadFileAccessTypeId;
    private groupSaveEnabled = TableRecordDefinitionListDirectory.defaultGroupSaveEnabled;
    private groupSaveFilePath = TableRecordDefinitionListDirectory.defaultGroupSaveFilePath;
    private groupSaveFileAccessTypeId = TableRecordDefinitionListDirectory.defaultGroupSaveFileAccessTypeId;

    private entries: TableRecordDefinitionListDirectory.Entry[];
    private _nullListId: Guid;

    private localSaveModified: boolean;
    private nextPeriodicLocalSaveCheckTickLimit: SysTick.Time;
    private localSavePeriodicRequired: boolean;

    private _markDeletedCount = 0;

    get nullListId() { return this._nullListId; }
    getList(idx: Integer) { return this.entries[idx].list; }
    get count() { return this.entries.length; }

    indexOfList(list: TableRecordDefinitionList): Integer {
        return this.entries.findIndex((entry: TableRecordDefinitionListDirectory.Entry) => entry.list === list);
    }

    indexOfId(id: Guid): Integer {
        return this.entries.findIndex((entry: TableRecordDefinitionListDirectory.Entry) => entry.list.id === id);
    }

    indexOfListTypeAndName(listTypeId: TableRecordDefinitionList.TypeId, name: string): Integer {
        const upperName = name.toUpperCase();
        return this.entries.findIndex(
            (entry: TableRecordDefinitionListDirectory.Entry) =>
                entry.list.typeId === listTypeId && entry.list.name.toUpperCase() === upperName);
    }

    addNoIdUserList(name: string, listTypeId: TableRecordDefinitionList.TypeId): Integer {
        const id = nanoid();
        return this.addUserList(id, name, listTypeId);
    }

    addUserList(id: Guid, name: string, listTypeId: TableRecordDefinitionList.TypeId): Integer {
        let list: UserTableRecordDefinitionList | undefined;
        switch (listTypeId) {
            case TableRecordDefinitionList.TypeId.Portfolio:
                list = new PortfolioTableRecordDefinitionList();
                break;
            case TableRecordDefinitionList.TypeId.Group:
                list = new GroupTableRecordDefinitionList();
                break;
            default:
                list = undefined;
        }

        let result: Integer;

        if (list === undefined) {
            result = -1;
        } else {
            list.setIdAndName(id, name);
            list.modifiedEvent = (modifiedList) => this.handleListModifiedEvent(modifiedList);
            list.requestIsGroupSaveEnabledEvent = () => this.handleRequestIsGroupSaveEnabledEvent();
            result = this.addList(list);

            if (list.typeId === TableRecordDefinitionList.TypeId.Group) {
                this.localSaveModified = true;
            }
        }

        return result;
    }

    deleteList(idx: Integer) {
        if (this.entries[idx].lockCount !== 0) {
            throw new AssertInternalError('TRDLDDL2499', `${idx}, ${this.entries[idx].lockCount}`);
        } else {
            if (!this.entries[idx].list.builtIn) {
                this.localSaveModified = true;
            }

            if (idx === this.entries.length - 1) {
                this.entries.length -= 1;
            } else {
                this.entries[idx].markDeleted();
                this._markDeletedCount += 1;
            }
        }
    }

    clearNonBuiltInLists() {
        for (let i = this.count - 1; i >= 0; i--) {
            if (!this.entries[i].list.builtIn) {
                this.deleteList(i);
            }
        }
    }

    clear() {
        for (let i = this.count - 1; i >= 0; i--) {
            this.deleteList(i);
        }
    }

    compareName(leftIdx: Integer, rightIdx: Integer): Integer {
        return this.entries[leftIdx].list.compareNameTo(this.entries[rightIdx].list);
    }

    compareListType(leftIdx: Integer, rightIdx: Integer): Integer {
        return this.entries[leftIdx].list.compareListTypeTo(this.entries[rightIdx].list);
    }

    lockId(id: Guid, locker: TableRecordDefinitionListDirectory.ILocker): Integer | undefined {
        const idx = this.indexOfId(id);
        if (this.indexOfId(id) < 0) {
            return undefined;
        } else {
            this.lock(idx, locker);
            return idx;
        }
    }

    lock(idx: Integer, locker: TableRecordDefinitionListDirectory.ILocker): TableRecordDefinitionList {
        this.entries[idx].lock(locker);
        return this.entries[idx].list;
    }

    unlockList(list: TableRecordDefinitionList, locker: TableRecordDefinitionListDirectory.ILocker) {
        const idx = this.indexOfList(list);
        if (idx === -1) {
            Logger.assert(false, '');
        } else {
            this.unlockEntry(idx, locker);
        }
    }

    unlockEntry(idx: Integer, locker: TableRecordDefinitionListDirectory.ILocker) {
        if (idx < 0) {
            Logger.assert(false, 'WatchItemDefinitionListDirectory.unlockEntry: idx < 0');
        } else {
            this.entries[idx].unlock(locker);
        }
    }

    isListLocked(list: TableRecordDefinitionList, ignoreLocker: TableRecordDefinitionListDirectory.ILocker): boolean {
        const idx = this.indexOfList(list);
        if (idx === -1) {
            throw new AssertInternalError('TRDLDILL86675');
        } else {
            return this.isEntryLocked(idx, ignoreLocker);
        }
    }

    isEntryLocked(idx: Integer, ignoreLocker: TableRecordDefinitionListDirectory.ILocker | undefined): boolean {
        return this.entries[idx].isLocked(ignoreLocker);
    }

    openId(id: Guid, opener: TableRecordDefinitionList.Opener): TableRecordDefinitionList | undefined {
        const idx = this.indexOfId(id);
        if (this.indexOfId(id) < 0) {
            return undefined;
        } else {
            return this.open(idx, opener);
        }
    }

    open(idx: Integer, opener: TableRecordDefinitionList.Opener): TableRecordDefinitionList {
        this.entries[idx].open(opener);
        return this.entries[idx].list;
    }

    closeList(list: TableRecordDefinitionList, opener: TableRecordDefinitionList.Opener) {
        const idx = this.indexOfList(list);
        if (idx === -1) {
            Logger.assert(false, 'WatchItemDefinitionListDirectory.closeList: list not found');
        } else {
            this.closeEntry(idx, opener);
        }
    }

    closeEntry(idx: Integer, opener: TableRecordDefinitionList.Opener) {
        if (idx < 0) {
            Logger.assert(false, 'WatchItemDefinitionListDirectory.closeEntry: idx < 0');
        } else {
            this.entries[idx].close(opener);
        }
    }

    lockAll(locker: TableRecordDefinitionListDirectory.ILocker): TableRecordDefinitionListList {
        const result = new TableRecordDefinitionListList();
        result.capacity = this.count;
        for (let i = 0; i < this.count; i++) {
            this.lock(i, locker);
            result.add(this.getList(i));
        }
        return result;
    }

    lockAllExceptNull(locker: TableRecordDefinitionListDirectory.ILocker): TableRecordDefinitionListList {
        const result = new TableRecordDefinitionListList();
        result.capacity = this.count;
        for (let i = 0; i < this.count; i++) {
            const list = this.getList(i);
            if (!(list instanceof NullTableRecordDefinitionList)) {
                this.lock(i, locker);
                result.add(list);
            }
        }
        return result;
    }

    lockAllPortfolio(locker: TableRecordDefinitionListDirectory.ILocker): TableRecordDefinitionListList {
        const result = new TableRecordDefinitionListList();
        result.capacity = this.count;
        for (let i = 0; i < this.count; i++) {
            const list = this.getList(i);
            if (list.typeId === TableRecordDefinitionList.TypeId.Portfolio) {
                this.lock(i, locker);
                result.add(list);
            }
        }
        return result;
    }

    lockAllGroup(locker: TableRecordDefinitionListDirectory.ILocker): TableRecordDefinitionListList {
        const result = new TableRecordDefinitionListList();
        result.capacity = this.count;
        for (let i = 0; i < this.count; i++) {
            const list = this.getList(i);
            if (list.typeId === TableRecordDefinitionList.TypeId.Group) {
                this.lock(i, locker);
                result.add(list);
            }
        }
        return result;
    }

    // function LockAllMarketMovers(Locker: ILocker): TWatchItemDefinitionListList;

    unlockLockList(lockList: TableRecordDefinitionListList, locker: TableRecordDefinitionListDirectory.ILocker) {
        for (let i = 0; i < lockList.count; i++) {
            this.unlockList(lockList.getItem(i), locker);
        }
    }

    private handleListModifiedEvent(list: TableRecordDefinitionList) {
        if (list.typeId !== TableRecordDefinitionList.TypeId.Group) {
            this.localSaveModified = true;
        }
    }

    private handleRequestIsGroupSaveEnabledEvent(): boolean {
        return this.groupSaveEnabled && this.groupSaveFilePath !== '';
    }

    private addList(list: TableRecordDefinitionList): Integer {
        const entry = new TableRecordDefinitionListDirectory.Entry(list);
        if (this._markDeletedCount === 0) {
            return this.entries.push(entry) - 1;
        } else {
            for (let i = 0; i < this.entries.length; i++) {
                if (this.entries[i].deleted) {
                    this.entries[i] = entry;
                    this._markDeletedCount -= 1;
                    return i;
                }
            }
            throw new AssertInternalError('TRDLDAL22224', `${this.entries.length}, ${this._markDeletedCount}`);
        }
    }

    private loadBuiltIn() {
        const idx = this.addList(new NullTableRecordDefinitionList());
        this._nullListId = this.entries[idx].list.id;

        if (Authorisations.isAsxEquitiesDataAllowed()) {
            // TODO:LOW These built in watch lists also contain definitions for "Global Summary" and
            // "Currencies". These two lists could likely be loaded even if the user doesn't
            // have ASX data permissions.
            this.loadBuiltInSymbolAndSourceServerWatchItemDefinitionLists();
        }
    }

    private loadBuiltInSymbolAndSourceServerWatchItemDefinitionLists() {
        for (const info of TableRecordDefinitionListDirectory.BuiltInSymbolAndSourceServerWatchItemDefinitionList.infos) {
            const list = new IvemIdServerTableRecordDefinitionList();
            list.setBuiltInParams(info.id, info.name, info.serverListName);
            this.addList(list);
        }
    }
}

export namespace TableRecordDefinitionListDirectory {
    export type ILocker = TableRecordDefinitionList.ILocker;
    // export type IOpener = TableRecordDefinitionList.IOpener;

    export class Entry {
        private _deleted = false;
        private lockers: ILocker[] = [];
        private openers: TableRecordDefinitionList.Opener[] = [];

        // private handleListChangeEvent(typeId: ListChangeTypeId, itemIdx: Integer, itemCount: Integer) {
        //     this.openers.forEach((opener: IOpener) => opener.notifyTableRecordDefinitionListListChange(typeId, itemIdx, itemCount));
        // }

        // private handleAfterRecChangeEvent(itemIdx: Integer, itemCount: Integer) {
        //     this.openers.forEach((opener: IOpener) =>
        //         opener.notifyTableRecordDefinitionListAfterRecDefinitionChange(itemIdx, itemCount));
        // }

        // private handleBeenReadyEvent() {
        //     this.openers.forEach((opener: IOpener) => opener.notifyTableRecordDefinitionListBeenReady());
        // }

        constructor(private _list: TableRecordDefinitionList) {
            // _list.listChangeEvent = this.handleListChangeEvent.bind(this);
            // _list.afterRecChangeEvent = this.handleAfterRecChangeEvent.bind(this);
            // _list.beenReadyEvent = this.handleBeenReadyEvent.bind(this);
        }

        get list() { return this._list; }

        open(opener: TableRecordDefinitionList.Opener) {
            this.openers.push(opener);
            if (this.openers.length === 1) {
                this._list.activate();
            }
        }

        close(opener: TableRecordDefinitionList.Opener) {
            const idx = this.openers.indexOf(opener);
            if (idx < 0) {
                Logger.assert(false, 'WatchItemDefinitionListDirectory.close: opener not found');
            } else {
                this.openers.splice(idx, 1);
                if (this.openers.length === 0) {
                    this._list.deactivate();
                }
            }
        }

        get openCount() { return this.openers.length; }

        lock(locker: ILocker) {
            this.lockers.push(locker);
        }

        unlock(locker: ILocker) {
            const idx = this.lockers.indexOf(locker);
            if (idx < 0) {
                Logger.assert(false, 'WatchItemDefinitionListDirectory.unlock: locker not found');
            } else {
                this.lockers.splice(idx, 1);
            }
        }

        get lockCount() { return this.lockers.length; }

        isLocked(ignoreLocker: ILocker | undefined) {
            switch (this.lockCount) {
                case 0: return false;
                case 1: return ignoreLocker === undefined || this.lockers[0] !== ignoreLocker;
                default: return true;
            }
        }

        get deleted() { return this._deleted; }

        markDeleted() {
            this._deleted = true;
        }
    }

    const BuiltInNullWatchItemDefinitionListId = 'F21CC292-6291-4071-8791-7BA07FDD4A3F';

    export namespace BuiltInSymbolAndSourceServerWatchItemDefinitionList {
        class InfoRec {
            constructor(
                readonly id: Guid,
                readonly name: string,
                readonly serverListName: string
            ) { }
        }

        export const infos: InfoRec[] = [
            new InfoRec('1561042D-C140-4950-9D52-0C30BF95505F', 'ASX Indices', 'AsxIndices'),
            new InfoRec('1561042D-C140-4950-9D52-0C30BF95505F', 'ASX Indices', 'AsxIndices'),
            new InfoRec('A03AC167-D94B-447A-B723-3AC8C45AAD96', 'ASX 20 Leaders', 'Asx20Leaders'),
            new InfoRec('9CC8115B-C746-4151-877D-11B4EF00E386', 'ASX 50 Leaders', 'Asx50Leaders'),
            new InfoRec('E217F59F-6928-42C8-B5D0-0F6BE2F13ECE', 'ASX 100 Leaders', 'Asx100Leaders'),
            new InfoRec('7D35CE63-D44C-4D9C-B740-0717F9CE4C4B', 'ASX 200 Leaders', 'Asx200Leaders'),
            new InfoRec('9B4D4BFA-BD53-42F3-884C-03EB84FB5599', 'ASX 300 Leaders', 'Asx300Leaders'),
            new InfoRec('26FA9050-F62A-4691-B2FB-C2AD9BF41170', 'ASX 50 Mid Cap Leaders', 'Asx50MidcapLeaders'),
            new InfoRec('D4B3BFEC-91E6-4722-BAA9-0DB8FF561602', 'ASX All Ords', 'AsxAllOrds'),
            new InfoRec('D5D38CD1-46A7-4BDE-B2DD-066610E12F6A', 'ASX Small Ords', 'AsxSmallOrds'),
            new InfoRec('6A1D4043-43BF-406A-A2FB-4D4CB906C4AF', 'ASX Emerging', 'AsxEmergingCo'),
            new InfoRec('E9A176BA-8AA8-4FF1-B92E-835D378816C5', 'ASX All Ord Gold', 'AsxAllOrdGold'),
            new InfoRec('55778104-929D-4254-8FC0-BDA9C0C0E1BC', 'ASX All Aust 50', 'AsxAllAust50'),
            new InfoRec('62402F50-C1B8-41E4-9A01-8E0140215571', 'ASX All Aust 200', 'AsxAllAust200'),
            new InfoRec('A3C9E8E2-16C4-483E-9AF4-72A428904910', 'ASX 300 Metals/Mining', 'Asx300MetalsMining'),
            new InfoRec('493C3E2A-B783-46C4-AF6B-EA1BE775449C', 'Currencies', 'Currencies'),
            new InfoRec('88E40CBB-F80A-4FD8-8EE8-815902126A25', 'Global Summary', 'GlobalSummary'),
        ];

        export const count = infos.length;
    }

    export namespace FileAccessType {
        export const enum Id {
            File,
            Url
        }

        class Info {
            readonly id: Id;
            readonly persist: string;
        }

        type InfosObject = {
            [id in keyof typeof Id]: Info
        };

        const infosObject: InfosObject = {
            File: { id: Id.File, persist: 'File' },
            Url: { id: Id.Url, persist: 'Url' }
        };

        export const idCount = Object.keys(infosObject).length;

        const infos = Object.values(infosObject);

        export function idToPersist(id: Id): string {
            return infos[id].persist;
        }

        export function tryPersistToId(value: string): Id | undefined {
            const idx = infos.findIndex((info: Info) => info.persist === value);
            return idx < 0 ? undefined : infos[idx].id;
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                // eslint-disable-next-line max-len
                throw new EnumInfoOutOfOrderError('WatchItemDefinitionListDirectory.FileAccessType.Id', outOfOrderIdx, infos[outOfOrderIdx].toString());
            }
        }
    }

    export const defaultGroupLoadFilePath = '';
    export const defaultGroupLoadFileAccessTypeId = FileAccessType.Id.File;
    export const defaultGroupSaveEnabled = false;
    export const defaultGroupSaveFilePath = '';
    export const defaultGroupSaveFileAccessTypeId = FileAccessType.Id.File;

    function initialise() {
        FileAccessType.initialise();
    }
}

export let tableRecordDefinitionListDirectory: TableRecordDefinitionListDirectory;

export function setTableRecordDefinitionListDirectory(value: TableRecordDefinitionListDirectory) {
    tableRecordDefinitionListDirectory = value;
}
