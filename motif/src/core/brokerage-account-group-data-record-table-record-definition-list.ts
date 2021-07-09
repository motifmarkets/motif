/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AllBrokerageAccountGroup,
    BrokerageAccountDataRecord,
    BrokerageAccountGroup,
    BrokerageAccountGroupDataRecordList
} from 'src/adi/internal-api';
import { JsonElement } from 'src/sys/internal-api';
import { BrokerageAccountDataRecordTableRecordDefinition } from './brokerage-account-data-record-table-record-definition';
import { BrokerageAccountDataRecordTableRecordDefinitionList } from './brokerage-account-data-record-table-record-definition-list';
import { TableRecordDefinitionList } from './table-record-definition-list';

export abstract class BrokerageAccountGroupDataRecordTableRecordDefinitionList<
    Record extends BrokerageAccountDataRecord
> extends BrokerageAccountDataRecordTableRecordDefinitionList<Record> {
    private _brokerageAccountGroup: BrokerageAccountGroup;

    get brokerageAccountGroup() {
        return this._brokerageAccountGroup;
    }
    override get dataRecordList() {
        return super
            .dataRecordList as BrokerageAccountGroupDataRecordList<Record>;
    }

    // setting accountId to undefined will return orders for all accounts
    constructor(typeId: TableRecordDefinitionList.TypeId) {
        super(typeId);
    }

    load(group: BrokerageAccountGroup) {
        this._brokerageAccountGroup = group;
    }

    override loadFromJson(element: JsonElement) {
        super.loadFromJson(element);

        const groupElement = element.tryGetElement(
            BrokerageAccountGroupDataRecordTableRecordDefinitionList.JsonTag
                .brokerageAccountGroup,
            'BADRTRDLLFJ28882950'
        );
        const group = BrokerageAccountGroup.tryCreateFromJson(groupElement);
        if (group === undefined) {
            this._brokerageAccountGroup =
                BrokerageAccountGroupDataRecordTableRecordDefinitionList.defaultAccountGroup;
        } else {
            this._brokerageAccountGroup = group;
        }
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const groupElement = element.newElement(
            BrokerageAccountGroupDataRecordTableRecordDefinitionList.JsonTag
                .brokerageAccountGroup
        );
        this._brokerageAccountGroup.saveToJson(groupElement);
    }

    protected abstract override subscribeList(): BrokerageAccountGroupDataRecordList<Record>;
    protected abstract override unsubscribeList(
        list: BrokerageAccountGroupDataRecordList<Record>
    ): void;
    protected abstract override createTableRecordDefinition(
        record: Record
    ): BrokerageAccountDataRecordTableRecordDefinition<Record>;
}

export namespace BrokerageAccountGroupDataRecordTableRecordDefinitionList {
    export namespace JsonTag {
        export const brokerageAccountGroup = 'brokerageAccountGroup';
    }

    export const defaultAccountGroup: AllBrokerageAccountGroup = BrokerageAccountGroup.createAll();
}
