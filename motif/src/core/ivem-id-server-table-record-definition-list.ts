/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness, Integer, JsonElement, UsableListChangeTypeId } from 'sys-internal-api';
import { LitIvemIdTableRecordDefinition, TableRecordDefinition } from './table-record-definition';
import { ServerTableRecordDefinitionList, TableRecordDefinitionList } from './table-record-definition-list';

export class IvemIdServerTableRecordDefinitionList extends ServerTableRecordDefinitionList {
    private static readonly definitionTypeId = TableRecordDefinition.TypeId.LitIvemId;
    private static readonly className = 'IvemIdServer';

    private _list: LitIvemIdTableRecordDefinition[];

    // private FDataItem:
    // private handleDataItemStatusChangeEvent(ADataItem: TDataItem);
    // private handleDataItemListChangeEvent(ListChangeType: TBasicListChangeType; Idx, Count: Integer);

    // private processDataItemListChange(ListChangeType: TBasicListChangeType; Idx, Count: Integer);

    constructor() {
        super(TableRecordDefinitionList.TypeId.IvemIdServer);
        this._changeDefinitionOrderAllowed = true;
    }

    getDefinition(idx: Integer): TableRecordDefinition {
        return this._list[idx];
    }

    override activate() {
        /*Definition := TDataDefinition_IvemIdServerWatchItemDefinitionList.Create;
        Definition.ListName := ServerListName;

        FDataItem := PariAdi.Subscribe(Definition) as TIvemIdServerWatchItemDefinitionListDataItem;
        FDataItem.SubscribeStatusChangeEvent(HandleDataItemStatusChangeEvent);
        FDataItem.SubscribeListChangeEvent(HandleDataItemListChangeEvent);*/
        super.activate();

        /*this.beenReady = FDataItem.Synchronised;

        if (dataItem.Count > 0) {
            this.processDataItemListChange(blctAfterInsert, 0, FDataItem.Count);
        }*/

        // currently list can never go bad
        const newCount = this._list.length;
        if (newCount > 0) {
            this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, newCount);
        }

        this.setUsable(Badness.notBad);
        this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
    }

    override deactivate() {
        super.deactivate();
        /*    if Count > 0 then
            begin
              NotifyListChange(blctBeforeRemove, 0, Count);
            end;

            Assert(Assigned(FDataItem));
            FDataItem.UnsubscribeListChangeEvent(HandleDataItemListChangeEvent);
            FDataItem.UnsubscribeStatusChangeEvent(HandleDataItemStatusChangeEvent);
            PariAdi.Unsubscribe(FDataItem);
            FDataItem := nil;
            FBeenSynchronised := False;*/
    }

    override loadFromJson(element: JsonElement) {
        super.loadFromJson(element);
        // TODO
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        // TODO
    }

    protected getCount(): Integer { return this._list.length; }
    protected getCapacity() { return this._list.length; }
    protected setCapacity(value: Integer) { /* no code */ }
}
