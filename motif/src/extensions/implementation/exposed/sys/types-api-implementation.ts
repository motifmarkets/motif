/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExtensionId } from 'content-internal-api';
import { AssertInternalError, ComparisonResult, UnreachableCaseError } from 'sys-internal-api';
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
    export function toApi(value: ExtensionId.PublisherTypeId) {
        switch (value) {
            case ExtensionId.PublisherTypeId.Invalid: throw new AssertInternalError('TAIPTITAI87773231');
            case ExtensionId.PublisherTypeId.Builtin: return PublisherTypeApi.builtin;
            case ExtensionId.PublisherTypeId.User: return PublisherTypeApi.user;
            case ExtensionId.PublisherTypeId.Organisation: return PublisherTypeApi.organisation;
            default: throw new UnreachableCaseError('TAIPTITAU87773231', value);
        }
    }

    export function tryFromApi(value: PublisherTypeApi) {
        switch (value) {
            case PublisherTypeApi.builtin: return ExtensionId.PublisherTypeId.Builtin;
            case PublisherTypeApi.user: return ExtensionId.PublisherTypeId.User;
            case PublisherTypeApi.organisation: return ExtensionId.PublisherTypeId.Organisation;
            default: return undefined;
        }
    }

    export function fromApi(value: PublisherTypeApi) {
        const publisherTypeId = tryFromApi(value);
        if (publisherTypeId === undefined) {
            return ExtensionId.PublisherTypeId.Invalid;
        } else {
            return publisherTypeId;
        }
    }
}
