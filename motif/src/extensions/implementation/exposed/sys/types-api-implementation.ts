/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ComparisonResult, PublisherId, UnreachableCaseError } from '@motifmarkets/motif-core';
import { ComparisonResult as ComparisonResultApi, PublisherType as PublisherTypeApi } from '../../../api/extension-api';

export namespace ComparisonResultImplementation {
    export function toApi(value: ComparisonResult): ComparisonResultApi {
        switch (value) {
            case ComparisonResult.LeftEqualsRight: return ComparisonResultApi.LeftEqualsRight;
            case ComparisonResult.LeftGreaterThanRight: return ComparisonResultApi.LeftGreaterThanRight;
            case ComparisonResult.LeftLessThanRight: return ComparisonResultApi.LeftLessThanRight;
            default: throw new UnreachableCaseError('CRAITA89995443', value);
        }
    }

    export function fromApi(value: ComparisonResultApi): ComparisonResult {
        switch (value) {
            case ComparisonResultApi.LeftEqualsRight: return ComparisonResult.LeftEqualsRight;
            case ComparisonResultApi.LeftGreaterThanRight: return ComparisonResult.LeftGreaterThanRight;
            case ComparisonResultApi.LeftLessThanRight: return ComparisonResult.LeftLessThanRight;
            default: throw new UnreachableCaseError('CRAIFA89995443', value);
        }
    }
}

export namespace PublisherTypeImplementation {
    export function toApi(value: PublisherId.TypeId) {
        switch (value) {
            case PublisherId.TypeId.Invalid: throw new AssertInternalError('TAIPTITAI87773231');
            case PublisherId.TypeId.Builtin: return PublisherTypeApi.builtin;
            case PublisherId.TypeId.User: return PublisherTypeApi.user;
            case PublisherId.TypeId.Organisation: return PublisherTypeApi.organisation;
            default: throw new UnreachableCaseError('TAIPTITAU87773231', value);
        }
    }

    export function tryFromApi(value: PublisherTypeApi) {
        switch (value) {
            case PublisherTypeApi.builtin: return PublisherId.TypeId.Builtin;
            case PublisherTypeApi.user: return PublisherId.TypeId.User;
            case PublisherTypeApi.organisation: return PublisherId.TypeId.Organisation;
            default: return undefined;
        }
    }

    export function fromApi(value: PublisherTypeApi) {
        const publisherTypeId = tryFromApi(value);
        if (publisherTypeId === undefined) {
            return PublisherId.TypeId.Invalid;
        } else {
            return publisherTypeId;
        }
    }
}
