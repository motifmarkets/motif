/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Feed } from 'src/adi/internal-api';
import { JsonElement, Logger } from 'src/sys/internal-api';
import { DataRecordTableRecordDefinition } from './data-record-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';

export class FeedTableRecordDefinition extends DataRecordTableRecordDefinition<Feed> {
    constructor(feed: Feed | undefined, key?: Feed.Key) {
        super(TableRecordDefinition.TypeId.Feed, feed, key);
    }

    feedInterfaceDescriminator() {
        // no code
    }

    createCopy() {
        return new FeedTableRecordDefinition(this.record, this.key as Feed.Key);
    }

    sameAs(other: TableRecordDefinition): boolean {
        if (!FeedTableRecordDefinition.hasFeedInterface(other)) {
            return false;
        } else {
            return Feed.Key.isEqual(this.key as Feed.Key, other.key as Feed.Key);
        }
    }
}

export namespace FeedTableRecordDefinition {
    export function hasFeedInterface(definition: TableRecordDefinition): definition is FeedTableRecordDefinition {
        return (definition as FeedTableRecordDefinition).feedInterfaceDescriminator !== undefined;
    }

    export function tryCreateKeyFromJson(element: JsonElement) {
        const keyOrError = Feed.Key.tryCreateFromJson(element);
        if (typeof keyOrError === 'object') {
            return keyOrError;
        } else {
            Logger.logConfigError('TRDBATRD29983', keyOrError);
            return undefined;
        }
    }
}
