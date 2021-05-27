/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, AdiService, BrokerageAccountsDataDefinition, BrokerageAccountsDataItem, DataRecordList } from 'src/adi/internal-api';
import { BrokerageAccountTableRecordDefinition } from './brokerage-account-table-record-definition';
import { DataRecordTableRecordDefinitionList } from './data-record-table-record-definition-list';
import { TableRecordDefinitionList } from './table-record-definition-list';

export class BrokerageAccountTableRecordDefinitionList extends DataRecordTableRecordDefinitionList<Account> {
    private static _constructCount = 0;

    constructor(private _adi: AdiService) {
        super(TableRecordDefinitionList.TypeId.BrokerageAccount);
        this.setName(BrokerageAccountTableRecordDefinitionList.createName());
        this._changeDefinitionOrderAllowed = true;
    }

    private static createName() {
        const constructCountAsStr = (++BrokerageAccountTableRecordDefinitionList._constructCount).toString(10);
        return BrokerageAccountTableRecordDefinitionList.baseName + constructCountAsStr;
    }

    protected subscribeList() {
        const definition = new BrokerageAccountsDataDefinition();
        const dataItem = this._adi.subscribe(definition) as BrokerageAccountsDataItem;
        super.setSingleDataItem(dataItem);
        return dataItem;
    }

    protected unsubscribeList(list: DataRecordList<Account>) {
        this._adi.unsubscribe(this.singleDataItem);
    }

    protected createTableRecordDefinition(record: Account) {
        return new BrokerageAccountTableRecordDefinition(record);
    }
}

export namespace BrokerageAccountTableRecordDefinitionList {
    export const baseName = 'BrokerageAccount';
}
