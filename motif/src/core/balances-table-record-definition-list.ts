/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService, AllBalancesDataDefinition,
    AllBalancesDataItem,
    Balances,
    BrokerageAccountBalancesDataDefinition,
    BrokerageAccountBalancesDataItem,
    BrokerageAccountGroup,
    BrokerageAccountGroupBalancesList,
    BrokerageAccountGroupDataRecordList,

    SingleBrokerageAccountGroup
} from 'src/adi/internal-api';
import { UnreachableCaseError } from 'src/sys/internal-api';
import { BalancesTableRecordDefinition } from './balances-table-record-definition';
import {
    BrokerageAccountGroupDataRecordTableRecordDefinitionList
} from './brokerage-account-group-data-record-table-record-definition-list';
import { TableRecordDefinitionList } from './table-record-definition-list';

export class BalancesTableRecordDefinitionList extends BrokerageAccountGroupDataRecordTableRecordDefinitionList<Balances> {
    private static _constructCount = 0;

    override get dataRecordList() { return super.dataRecordList as BrokerageAccountGroupBalancesList; }

    constructor(private _adi: AdiService) {
        super(TableRecordDefinitionList.TypeId.Balances);
        this.setName(BalancesTableRecordDefinitionList.createName());
        this._changeDefinitionOrderAllowed = true;
    }

    private static createName() {
        return BalancesTableRecordDefinitionList.baseName + (++BalancesTableRecordDefinitionList._constructCount).toString(10);
    }

    protected subscribeList(): BrokerageAccountGroupDataRecordList<Balances> {
        switch (this.brokerageAccountGroup.typeId) {
            case BrokerageAccountGroup.TypeId.Single: {
                const brokerageAccountGroup = this.brokerageAccountGroup as SingleBrokerageAccountGroup;
                const definition = new BrokerageAccountBalancesDataDefinition();
                definition.accountId = brokerageAccountGroup.accountKey.id;
                definition.environmentId = brokerageAccountGroup.accountKey.environmentId;
                const dataItem = this._adi.subscribe(definition) as BrokerageAccountBalancesDataItem;
                this.setSingleDataItem(dataItem);
                return dataItem;
            }

            case BrokerageAccountGroup.TypeId.All: {
                const definition = new AllBalancesDataDefinition();
                const dataItem = this._adi.subscribe(definition) as AllBalancesDataItem;
                this.setSingleDataItem(dataItem);
                return dataItem;
            }

            default:
                throw new UnreachableCaseError('BTRDLSDI199990834346', this.brokerageAccountGroup.typeId);
        }
    }

    protected unsubscribeList(list: BrokerageAccountGroupDataRecordList<Balances>) {
        this._adi.unsubscribe(this.singleDataItem);
    }

    protected createTableRecordDefinition(record: Balances) {
        return new BalancesTableRecordDefinition(record);
    }
}

export namespace BalancesTableRecordDefinitionList {
    export const baseName = 'Balances';
}
