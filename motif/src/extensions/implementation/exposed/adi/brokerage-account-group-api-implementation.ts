/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AllBrokerageAccountGroup, AssertInternalError, BrokerageAccountGroup, SingleBrokerageAccountGroup, UnreachableCaseError } from '@motifmarkets/motif-core';
import {
    AllBrokerageAccountGroup as AllBrokerageAccountGroupApi,
    ApiError as ApiErrorApi, BrokerageAccountGroup as BrokerageAccountGroupApi,
    SingleBrokerageAccountGroup as SingleBrokerageAccountGroupApi
} from '../../../api/extension-api';
import { ComparisonResultImplementation, UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export abstract class BrokerageAccountGroupImplementation implements BrokerageAccountGroupApi {
    constructor(private readonly _actual: BrokerageAccountGroup) { }

    get actual() { return this._actual; }

    get type() { return BrokerageAccountGroupImplementation.TypeId.toApi(this._actual.typeId); }
    get id() { return this._actual.id; }

    isSingle() { return this._actual.isSingle(); }
    isAll() { return this._actual.isAll(); }

    isEqualTo(otherApi: BrokerageAccountGroupApi) {
        const other = BrokerageAccountGroupImplementation.fromApi(otherApi);
        return this._actual.isEqualTo(other);
    }

    compareTo(otherApi: BrokerageAccountGroupApi) {
        const other = BrokerageAccountGroupImplementation.fromApi(otherApi);
        const comparisonResult = this._actual.compareTo(other);
        return ComparisonResultImplementation.toApi(comparisonResult);
    }
}

export class SingleBrokerageAccountGroupImplementation extends BrokerageAccountGroupImplementation
    implements SingleBrokerageAccountGroupApi {

    constructor(private readonly _singleActual: SingleBrokerageAccountGroup) {
        super(_singleActual);
    }

    get accountId() { return this._singleActual.accountKey.id; }
}

export class AllBrokerageAccountGroupImplementation extends BrokerageAccountGroupImplementation
    implements AllBrokerageAccountGroupApi {

    constructor(actual: AllBrokerageAccountGroup) {
        super(actual);
    }
}

export namespace BrokerageAccountGroupImplementation {
    export namespace TypeId {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function toApi(value: BrokerageAccountGroup.TypeId) {
            switch (value) {
                case BrokerageAccountGroup.TypeId.Single: return BrokerageAccountGroupApi.TypeEnum.Single;
                case BrokerageAccountGroup.TypeId.All: return BrokerageAccountGroupApi.TypeEnum.All;
                default: throw new UnreachableCaseError('BAGAITITA0999242', value);
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function fromApi(value: BrokerageAccountGroupApi.Type) {
            const enumValue = value as BrokerageAccountGroupApi.TypeEnum;
            switch (enumValue) {
                case BrokerageAccountGroupApi.TypeEnum.Single: return BrokerageAccountGroup.TypeId.Single;
                case BrokerageAccountGroupApi.TypeEnum.All: return BrokerageAccountGroup.TypeId.All;
                default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidBrokerageAccountGroupType, enumValue);
            }
        }
    }

    export function toApi(brokerageAccountGroup: BrokerageAccountGroup): BrokerageAccountGroupApi {
        switch (brokerageAccountGroup.typeId) {
            case BrokerageAccountGroup.TypeId.Single: {
                const actual = brokerageAccountGroup as SingleBrokerageAccountGroup;
                return new SingleBrokerageAccountGroupImplementation(actual);
            }
            case BrokerageAccountGroup.TypeId.All: {
                const actual = brokerageAccountGroup as AllBrokerageAccountGroup;
                return new AllBrokerageAccountGroupImplementation(actual);
            }
            default:
                throw new AssertInternalError('BAGAITA99822424', brokerageAccountGroup.typeId);
        }
    }

    export function fromApi(brokerageAccountGroupApi: BrokerageAccountGroupApi) {
        const brokerageAccountGroupImplementation = brokerageAccountGroupApi as BrokerageAccountGroupImplementation;
        return brokerageAccountGroupImplementation.actual;
    }
}

export namespace SingleBrokerageAccountGroupImplementation {
    export function toSingleApi(brokerageAccountGroup: SingleBrokerageAccountGroup): SingleBrokerageAccountGroupApi {
        return new SingleBrokerageAccountGroupImplementation(brokerageAccountGroup);
    }
}
