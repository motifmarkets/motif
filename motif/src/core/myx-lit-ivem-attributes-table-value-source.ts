/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemFullDetail, MyxLitIvemAttributes, SymbolsDataItem } from 'adi-internal-api';
import { Integer, MultiEvent, UnreachableCaseError } from 'sys-internal-api';
import { MyxLitIvemAttributesTableFieldDefinitionSource } from './myx-lit-ivem-attributes-table-field-definition-source';
import {
    CorrectnessTableGridValue,
    DeliveryBasisIdMyxLitIvemAttributeCorrectnessTableGridValue,
    IntegerCorrectnessTableGridValue,
    MarketClassificationIdMyxLitIvemAttributeCorrectnessTableGridValue,
    PercentageCorrectnessTableGridValue,
    ShortSellTypeIdArrayMyxLitIvemAttributeCorrectnessTableGridValue,
    TableGridValue
} from './table-grid-value';
import { TableValueSource } from './table-value-source';

export class MyxLitIvemAttributesTableValueSource extends TableValueSource {
    private _litIvemDetailExtendedChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private _litIvemFullDetail: LitIvemFullDetail, private _dataItem: SymbolsDataItem) {
        super(firstFieldIndexOffset);
    }

    activate(): TableGridValue[] {
        this._litIvemDetailExtendedChangedEventSubscriptionId = this._litIvemFullDetail.subscribeExtendedChangeEvent(
            (changedFieldIds) => this.handleDetailChangedEvent(changedFieldIds)
        );

        return this.getAllValues();
    }

    deactivate() {
        if (this._litIvemDetailExtendedChangedEventSubscriptionId !== undefined) {
            this._litIvemFullDetail.unsubscribeExtendedChangeEvent(this._litIvemDetailExtendedChangedEventSubscriptionId);
            this._litIvemDetailExtendedChangedEventSubscriptionId = undefined;
        }
    }

    getAllValues(): TableGridValue[] {
        const fieldCount = MyxLitIvemAttributesTableFieldDefinitionSource.Field.count;
        const result = new Array<TableGridValue>(fieldCount);

        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableGridValue(fieldIdx);
            const fieldId = MyxLitIvemAttributesTableFieldDefinitionSource.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return MyxLitIvemAttributesTableFieldDefinitionSource.Field.count;
    }

    private handleDetailChangedEvent(changedFieldIds: LitIvemFullDetail.ExtendedField.Id[]) {
        if (changedFieldIds.includes(LitIvemFullDetail.ExtendedField.Id.Attributes)) {
            const allValues = this.getAllValues();
            this.notifyAllValuesChangeEvent(allValues);
        }
    }

    private createTableGridValue(fieldIdx: Integer) {
        const valueConstructor = MyxLitIvemAttributesTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: MyxLitIvemAttributes.Field.Id, value: CorrectnessTableGridValue) {
        value.dataCorrectnessId = this._dataItem.correctnessId;

        const attributes = this._litIvemFullDetail.attributes as MyxLitIvemAttributes;

        switch (id) {
            case MyxLitIvemAttributes.Field.Id.Category:
                const categoryValue = value as IntegerCorrectnessTableGridValue;
                categoryValue.data = attributes?.category;
                break;
            case MyxLitIvemAttributes.Field.Id.MarketClassification:
                const marketClassificationIdValue = value as MarketClassificationIdMyxLitIvemAttributeCorrectnessTableGridValue;
                marketClassificationIdValue.data = attributes?.marketClassificationId;
                break;
            case MyxLitIvemAttributes.Field.Id.DeliveryBasis:
                const deliveryBasisIdValue = value as DeliveryBasisIdMyxLitIvemAttributeCorrectnessTableGridValue;
                deliveryBasisIdValue.data = attributes?.deliveryBasisId;
                break;
            case MyxLitIvemAttributes.Field.Id.MaxRSS:
                const maxRssValue = value as PercentageCorrectnessTableGridValue;
                maxRssValue.data = attributes?.maxRss;
                break;
            case MyxLitIvemAttributes.Field.Id.Sector:
                const sectorValue = value as IntegerCorrectnessTableGridValue;
                sectorValue.data = attributes?.sector;
                break;
            case MyxLitIvemAttributes.Field.Id.Short:
                const shortValue = value as ShortSellTypeIdArrayMyxLitIvemAttributeCorrectnessTableGridValue;
                shortValue.data = attributes?.short;
                break;
            case MyxLitIvemAttributes.Field.Id.ShortSuspended:
                const shortSuspendedValue = value as ShortSellTypeIdArrayMyxLitIvemAttributeCorrectnessTableGridValue;
                shortSuspendedValue.data = attributes?.shortSuspended;
                break;
            case MyxLitIvemAttributes.Field.Id.SubSector:
                const subSectorValue = value as IntegerCorrectnessTableGridValue;
                subSectorValue.data = attributes?.subSector;
                break;
            default:
                throw new UnreachableCaseError('MLIATVSLV38228338', id);
        }
    }
}
