/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, LitIvemId, TopShareholdersDataDefinition, TopShareholdersDataItem } from 'src/adi/internal-api';
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
import { SingleDataItemTableRecordDefinitionList } from './single-data-item-table-record-definition-list';
import { TableRecordDefinition, TopShareholderTableRecordDefinition } from './table-record-definition';
import { TableRecordDefinitionList } from './table-record-definition-list';

export class TopShareholderTableRecordDefinitionList extends SingleDataItemTableRecordDefinitionList {
    private static _constructCount = 0;

    private _litIvemId: LitIvemId;
    private _tradingDate: Date | undefined;
    private _compareToTradingDate: Date | undefined;

    private _list: TopShareholderTableRecordDefinition[] = [];

    private _dataItem: TopShareholdersDataItem;
    private _dataItemSubscribed = false;
    private _listChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private _badnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private _adi: AdiService) {
        super(TableRecordDefinitionList.TypeId.TopShareholder);
        this.setName(TopShareholderTableRecordDefinitionList.baseName +
            (++TopShareholderTableRecordDefinitionList._constructCount).toString(10));
        this._changeDefinitionOrderAllowed = true;
    }

    load(litIvemId: LitIvemId, tradingDate: Date | undefined, compareToTradingDate: Date | undefined) {
        this._litIvemId = litIvemId;
        this._tradingDate = tradingDate;
        this._compareToTradingDate = compareToTradingDate;
    }

    get dataItem() { return this._dataItem; }

    getDefinition(idx: Integer): TableRecordDefinition {
        return this._list[idx];
    }

    override activate() {
        const definition = new TopShareholdersDataDefinition();

        definition.litIvemId = this._litIvemId;
        definition.tradingDate = this._tradingDate;
        definition.compareToTradingDate = this._compareToTradingDate;

        this._dataItem = this._adi.subscribe(definition) as TopShareholdersDataItem;
        this._dataItemSubscribed = true;
        super.setSingleDataItem(this._dataItem);
        this._listChangeEventSubscriptionId = this._dataItem.subscribeListChangeEvent(
                (listChangeTypeId, idx, count) => this.handleDataItemListChangeEvent(listChangeTypeId, idx, count)
        );
        this._badnessChangeEventSubscriptionId = this._dataItem.subscribeBadnessChangeEvent(
            () => this.handleDataItemBadnessChangeEvent()
        );

        super.activate();

        if (this.dataItem.usable) {
            const newCount = this.dataItem.count;
            if (newCount > 0) {
                this.processDataItemListChange(UsableListChangeTypeId.PreUsableAdd, 0, newCount);
            }
            this.processDataItemListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.processDataItemListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    override deactivate() {
        // TableRecordDefinitionList can no longer be used after it is deactivated
        if (this.count > 0) {
            this.notifyListChange(UsableListChangeTypeId.Clear, 0, 0);
        }

        if (!this._dataItemSubscribed) {
            throw new AssertInternalError('TSHTRDLD29987', '');
        } else {
            this._dataItem.unsubscribeListChangeEvent(this._listChangeEventSubscriptionId);
            this._listChangeEventSubscriptionId = undefined;
            this._dataItem.unsubscribeBadnessChangeEvent(this._badnessChangeEventSubscriptionId);
            this._badnessChangeEventSubscriptionId = undefined;

            super.deactivate();

            this._adi.unsubscribe(this._dataItem);
            this._dataItemSubscribed = false;
        }
    }

    override loadFromJson(element: JsonElement) {
        super.loadFromJson(element);

        const baseContext = 'TopShareholderTableRecordDefinitionList.loadFromJson: ';


        const litIvemId = LitIvemId.tryGetFromJsonElement(element, TopShareholderTableRecordDefinitionList.JsonTag.litItemId,
            baseContext + 'LitIvemId'
        );
        if (litIvemId === undefined) {
            Logger.logConfigError('TSTRDLLFJLU3859', 'TopShareholder config missing symbol');
        } else {
            this._litIvemId = litIvemId;

            this._tradingDate = element.tryGetDate(TopShareholderTableRecordDefinitionList.JsonTag.tradingDate,
                baseContext + 'tradingDate');

            this._compareToTradingDate = element.tryGetDate(TopShareholderTableRecordDefinitionList.JsonTag.compareToTradingDate,
                baseContext + 'tradingDate');
        }
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);

        element.setJson(TopShareholderTableRecordDefinitionList.JsonTag.litItemId, this._litIvemId.toJson());
        if (this._tradingDate !== undefined) {
            element.setDate(TopShareholderTableRecordDefinitionList.JsonTag.tradingDate, this._tradingDate);
        }
        if (this._compareToTradingDate !== undefined) {
            element.setDate(TopShareholderTableRecordDefinitionList.JsonTag.compareToTradingDate, this._compareToTradingDate);
        }
    }

    protected getCount() { return this._list.length; }
    protected getCapacity() { return this._list.length; }
    protected setCapacity(value: Integer) { /* no code */ }

    protected override processUsableChanged() {
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

    private insertRecordDefinition(idx: Integer, count: Integer) {
        if (count === 1) {
            const topShareholder = this._dataItem.topShareholders[idx];
            const definition = new TopShareholderTableRecordDefinition(topShareholder);
            if (idx === this._list.length) {
                this._list.push(definition);
            } else {
                this._list.splice(idx, 0, definition);
            }
        } else {
            const definitions = new Array<TopShareholderTableRecordDefinition>(count);
            let insertArrayIdx = 0;
            for (let i = idx; i < idx + count; i++) {
                const topShareholder = this._dataItem.topShareholders[i];
                definitions[insertArrayIdx++] = new TopShareholderTableRecordDefinition(topShareholder);
            }
            this._list.splice(idx, 0, ...definitions);
        }
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
                this.insertRecordDefinition(idx, count);
                break;
            case UsableListChangeTypeId.Usable:
                this.setUsable(this._dataItem.badness);
                break;
            case UsableListChangeTypeId.Insert:
                this.insertRecordDefinition(idx, count);
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, idx, count);
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
                throw new UnreachableCaseError('TSTRDLPDILC983338', listChangeTypeId);
        }
    }
}

export namespace TopShareholderTableRecordDefinitionList {
    export const baseName = 'TopShareholder';
    export namespace JsonTag {
        export const litItemId = 'litItemId';
        export const tradingDate = 'tradingDate';
        export const compareToTradingDate = 'compareToTradingDate';
    }
}
