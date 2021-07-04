/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService, AllOrdersDataDefinition,
    AllOrdersDataItem,
    BrokerageAccountGroup,
    BrokerageAccountGroupDataRecordList,
    BrokerageAccountGroupOrderList,
    BrokerageAccountOrdersDataDefinition,
    BrokerageAccountOrdersDataItem,
    Order,

    SingleBrokerageAccountGroup
} from 'src/adi/internal-api';
import { UnreachableCaseError } from 'src/sys/internal-api';
import {
    BrokerageAccountGroupDataRecordTableRecordDefinitionList
} from './brokerage-account-group-data-record-table-record-definition-list';
import { OrderTableRecordDefinition } from './order-table-record-definition';
import { TableRecordDefinitionList } from './table-record-definition-list';

export class OrderTableRecordDefinitionList extends BrokerageAccountGroupDataRecordTableRecordDefinitionList<Order> {
    private static _constructCount = 0;

    override get dataRecordList() { return super.dataRecordList as BrokerageAccountGroupOrderList; }

    constructor(private _adi: AdiService) {
        super(TableRecordDefinitionList.TypeId.Order);
        this.setName(OrderTableRecordDefinitionList.createName());
        this._changeDefinitionOrderAllowed = true;
    }

    private static createName() {
        return OrderTableRecordDefinitionList.baseName + (++OrderTableRecordDefinitionList._constructCount).toString(10);
    }

    protected subscribeList(): BrokerageAccountGroupDataRecordList<Order> {
        switch (this.brokerageAccountGroup.typeId) {
            case BrokerageAccountGroup.TypeId.Single: {
                const brokerageAccountGroup = this.brokerageAccountGroup as SingleBrokerageAccountGroup;
                const definition = new BrokerageAccountOrdersDataDefinition();
                definition.accountId = brokerageAccountGroup.accountKey.id;
                definition.environmentId = brokerageAccountGroup.accountKey.environmentId;
                const dataItem = this._adi.subscribe(definition) as BrokerageAccountOrdersDataItem;
                this.setSingleDataItem(dataItem);
                return dataItem;
            }

            case BrokerageAccountGroup.TypeId.All: {
                const definition = new AllOrdersDataDefinition();
                const dataItem = this._adi.subscribe(definition) as AllOrdersDataItem;
                this.setSingleDataItem(dataItem);
                return dataItem;
            }

            default:
                throw new UnreachableCaseError('OTRDLSDI19999834346', this.brokerageAccountGroup.typeId);
        }
    }

    protected unsubscribeList(list: BrokerageAccountGroupDataRecordList<Order>) {
        this._adi.unsubscribe(this.singleDataItem);
    }

    protected createTableRecordDefinition(record: Order) {
        return new OrderTableRecordDefinition(record);
    }
}

export namespace OrderTableRecordDefinitionList {
    export const baseName = 'Order';
}
