/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, CallOrPutId, IvemId, QuerySymbolsDataDefinition, SymbolsDataItem } from 'src/adi/internal-api';
import {
    AssertInternalError,
    Badness,
    Integer,
    JsonElement,
    Logger,
    MultiEvent,
    UnreachableCaseError,
    UsableListChangeTypeId
} from 'src/sys/internal-api';
import { CallPut } from './call-put';
import { SingleDataItemTableRecordDefinitionList } from './single-data-item-table-record-definition-list';
import { CallPutTableRecordDefinition, TableRecordDefinition } from './table-record-definition';
import { TableRecordDefinitionList } from './table-record-definition-list';

export class CallPutFromUnderlyingTableRecordDefinitionList extends SingleDataItemTableRecordDefinitionList {
    private static _constructCount = 0;

    private _underlyingIvemId: IvemId | undefined;

    private _list: CallPutTableRecordDefinition[] = [];

    private _dataItem: SymbolsDataItem;
    private _dataItemSubscribed = false;
    // private _litIvemDetails: LitIvemDetail[];
    private _dataItemListChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private _dataItemBadnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private _adi: AdiService) {
        super(TableRecordDefinitionList.TypeId.CallPutFromUnderlying);
        this.setName(CallPutFromUnderlyingTableRecordDefinitionList.baseName +
            (++CallPutFromUnderlyingTableRecordDefinitionList._constructCount).toString(10));
        this._changeDefinitionOrderAllowed = true;
    }

    load(underlyingIvemId: IvemId) {
        this._underlyingIvemId = underlyingIvemId;
    }

    get dataItem() { return this._dataItem; }

    getDefinition(idx: Integer): TableRecordDefinition {
        return this._list[idx];
    }

    activate() {
        const definition = new QuerySymbolsDataDefinition();

        if (this._underlyingIvemId !== undefined) {
            definition.underlyingIvemId = this._underlyingIvemId;
            this._dataItem = this._adi.subscribe(definition) as SymbolsDataItem;
            this._dataItemSubscribed = true;
            super.setSingleDataItem(this._dataItem);
            this._dataItemListChangeEventSubscriptionId = this.dataItem.subscribeListChangeEvent(
                (listChangeTypeId, idx, count) => this.handleDataItemListChangeEvent(listChangeTypeId, idx, count)
            );
            this._dataItemBadnessChangeEventSubscriptionId = this._dataItem.subscribeBadnessChangeEvent(
                () => this.handleDataItemBadnessChangeEvent()
            );

            super.activate();

            if (this.dataItem.usable) {
                const newCount = this._dataItem.records.length;
                if (newCount > 0) {
                    this.processDataItemListChange(UsableListChangeTypeId.PreUsableAdd, 0, newCount);
                }
                this.processDataItemListChange(UsableListChangeTypeId.Usable, 0, 0);
            } else {
                this.processDataItemListChange(UsableListChangeTypeId.Unusable, 0, 0);
            }
        }
    }

    deactivate() {
        // TableRecordDefinitionList can no longer be used after it is deactivated
        if (this.count > 0) {
            this.notifyListChange(UsableListChangeTypeId.Clear, 0, 0);
        }

        if (!this._dataItemSubscribed) {
            throw new AssertInternalError('CPFUTRDL234332', '');
        } else {
            this._dataItem.unsubscribeListChangeEvent(this._dataItemListChangeEventSubscriptionId);
            this._dataItemListChangeEventSubscriptionId = undefined;
            this._dataItem.unsubscribeBadnessChangeEvent(this._dataItemBadnessChangeEventSubscriptionId);
            this._dataItemBadnessChangeEventSubscriptionId = undefined;

            super.deactivate();

            this._adi.unsubscribe(this._dataItem);
            this._dataItemSubscribed = false;
        }
    }

    loadFromJson(element: JsonElement) {
        super.loadFromJson(element);

        this._underlyingIvemId =
            IvemId.tryGetFromJsonElement(element, CallPutFromUnderlyingTableRecordDefinitionList.JsonTag.underlyingIvemId,
                'CallPutTableRecordDefinitionList.loadFromJson: UnderlyingIvemId');
    }

    saveToJson(element: JsonElement) {
        super.saveToJson(element);
        element.setJson(CallPutFromUnderlyingTableRecordDefinitionList.JsonTag.underlyingIvemId, this._underlyingIvemId?.toJson());
    }

    protected getCount() { return this._list.length; }
    protected getCapacity() { return this._list.length; }
    protected setCapacity(value: Integer) { /* no code */ }

    protected processUsableChanged() {
        if (this.usable) {
            this.notifyListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
            const count = this.count;
            if (count > 0) {
                this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, count);
            }
            this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.notifyListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    private handleDataItemListChangeEvent(listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) {
        this.processDataItemListChange(listChangeTypeId, idx, count);
    }

    private handleDataItemBadnessChangeEvent() {
        this.checkSetUnusable(this._dataItem.badness);
    }

    private processDataItemListChange(listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this.setUnusable(this._dataItem.badness);
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this.setUnusable(Badness.preUsableClear);
                this._list.length = 0;
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                this.setUnusable(Badness.preUsableAdd);
                break;
            case UsableListChangeTypeId.Usable:
                this.processDataItemUsable();
                break;
            case UsableListChangeTypeId.Insert:
                // no action
                break;
            case UsableListChangeTypeId.Remove:
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, idx, count);
                this._list.splice(idx, count);
                break;
            case UsableListChangeTypeId.Clear:
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Clear, idx, count);
                this._list.length = 0;
                break;
            default:
                throw new UnreachableCaseError('SDITRDLPDILC83372992', listChangeTypeId);
        }
    }

    private processDataItemUsable() {
        const symbolInfoArray = this._dataItem.records;
        if (symbolInfoArray === undefined) {
            throw new AssertInternalError('CPFUTRDLPDISC23239');
        } else {
            const symbolCount = symbolInfoArray.length;
            const definitions = new Array<CallPutTableRecordDefinition>(symbolCount);
            let count = 0;
            const existingIndexMap = new Map<string, Integer>();
            for (let i = 0; i < symbolCount; i++) {
                const symbol = symbolInfoArray[i];
                const callPutKey = this.createKeyFromSymbol(symbolInfoArray[i]);
                if (callPutKey !== undefined) {
                    const callPutMapKey = callPutKey.mapKey;
                    const existingIndex = existingIndexMap.get(callPutMapKey);
                    if (existingIndex === undefined) {
                        const newCallPut = this.createCallPutFromKeyAndSymbol(callPutKey, symbol);
                        if (newCallPut !== undefined) {
                            existingIndexMap.set(callPutMapKey, count);
                            definitions[count++] = new CallPutTableRecordDefinition(newCallPut);
                        }
                    } else {
                        const existingCallPut = definitions[existingIndex].callPut;
                        this.updateCallPutFromSymbol(existingCallPut, symbol);
                    }
                }
            }
            definitions.length = count;
            this._list.splice(0, 0, ...definitions);

            this.setUsable(this._dataItem.badness);
        }
    }

    private createKeyFromSymbol(symbolInfo: SymbolsDataItem.Record): CallPut.Key | undefined {
        const exercisePrice = symbolInfo.strikePrice;
        if (exercisePrice === undefined) {
            Logger.logDataError('CPFUTSCKFSP28875', symbolInfo.litIvemId.name);
            return undefined;
        } else {
            const expiryDate = symbolInfo.expiryDate;
            if (expiryDate === undefined) {
                Logger.logDataError('CPFUTSCKFSD18557', symbolInfo.litIvemId.name);
                return undefined;
            } else {
                const litId = symbolInfo.litIvemId.litId;
                return new CallPut.Key(exercisePrice, expiryDate.utcMidnight, litId);
            }
        }
    }

    private createCallPutFromKeyAndSymbol(key: CallPut.Key, symbolInfo: SymbolsDataItem.Record): CallPut | undefined {
        const result = new CallPut();
        result.exercisePrice = key.exercisePrice;
        result.expiryDate = key.expiryDate;
        result.litId = key.litId;
        const callOrPutId = symbolInfo.callOrPutId;
        if (callOrPutId === undefined) {
            Logger.logDataError('CPFUTSCCPFKASCP22887', symbolInfo.litIvemId.name);
            return undefined;
        } else {
            const litIvemId = symbolInfo.litIvemId;
            switch (callOrPutId) {
                case CallOrPutId.Call:
                    result.callLitIvemId = litIvemId;
                    break;
                case CallOrPutId.Put:
                    result.putLitIvemId = litIvemId;
                    break;
                default:
                    throw new UnreachableCaseError('CPFUTSCCPFKASD11134', callOrPutId);
            }
            const exerciseTypeId = symbolInfo.exerciseTypeId;
            if (exerciseTypeId === undefined) {
                Logger.logDataError('CPFUTSCCPFKASE99811', symbolInfo.name);
                return undefined;
            } else {
                result.exerciseTypeId = exerciseTypeId;

                const contractMultipler = symbolInfo.contractSize;
                if (contractMultipler === undefined) {
                    Logger.logDataError('CPFUTSCCPFKASC44477', symbolInfo.litIvemId.name);
                    return undefined;
                } else {
                    result.contractMultiplier = contractMultipler;
                    // currently do not need underlyingIvemId or underlyingIsIndex
                    return result;
                }
            }
        }
    }

    private updateCallPutFromSymbol(callPut: CallPut, symbolInfo: SymbolsDataItem.Record) {
        const callOrPutId = symbolInfo.callOrPutId;
        if (callOrPutId === undefined) {
            Logger.logDataError('CPFUTSUCPFSU22995', symbolInfo.litIvemId.name);
        } else {
            const litIvemId = symbolInfo.litIvemId;
            switch (callOrPutId) {
                case CallOrPutId.Call:
                    if (callPut.callLitIvemId !== undefined) {
                        Logger.logDataError('CPUATSUPCPFSC90445', `${callPut.callLitIvemId.name} ${litIvemId.name}`);
                    } else {
                        callPut.callLitIvemId = litIvemId;
                    }
                    break;
                case CallOrPutId.Put:
                    if (callPut.putLitIvemId !== undefined) {
                        Logger.logDataError('CPUATSUPCPFSP33852', `${callPut.putLitIvemId.name} ${litIvemId.name}`);
                    } else {
                        callPut.putLitIvemId = litIvemId;
                    }
                    break;
                default:
                    throw new UnreachableCaseError('CPUATSUPCPFSD98732', callOrPutId);
            }

            const exerciseTypeId = symbolInfo.exerciseTypeId;
            if (exerciseTypeId === undefined) {
                Logger.logDataError('CPUATSUPCPFSE13123', litIvemId.name);
            } else {
                if (callPut.exerciseTypeId === undefined) {
                    callPut.exerciseTypeId = exerciseTypeId;
                    Logger.logDataError('CPUATSUPCPFST22258', litIvemId.name);
                } else {
                    if (callPut.exerciseTypeId !== exerciseTypeId) {
                        Logger.logDataError('CPUATSUPCPFSY91192', `${litIvemId.name} ${callPut.exerciseTypeId} ${exerciseTypeId}`);
                    }
                }
            }

            const contractMultiplier = symbolInfo.contractSize;
            if (contractMultiplier === undefined) {
                Logger.logDataError('CPUATSUPCPFSM48865', litIvemId.name);
            } else {
                if (callPut.contractMultiplier === undefined) {
                    callPut.contractMultiplier = contractMultiplier;
                    Logger.logDataError('CPUATSUPCPFSU33285', litIvemId.name);
                } else {
                    if (callPut.contractMultiplier !== contractMultiplier) {
                        Logger.logDataError('CPUATSUPCPFSL32238', `${litIvemId.name} ${callPut.contractMultiplier} ${contractMultiplier}`);
                    }
                }
            }
        }
    }
}

export namespace CallPutFromUnderlyingTableRecordDefinitionList {
    export const baseName = 'CallPut';

    export namespace JsonTag {
        export const underlyingIvemId = 'underlyingIvemId';
    }
}
