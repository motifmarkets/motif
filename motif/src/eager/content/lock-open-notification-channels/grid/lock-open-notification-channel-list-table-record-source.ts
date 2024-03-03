/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Integer,
    LockOpenListItem,
    LockOpenListTableRecordSource,
    LockOpenNotificationChannel,
    LockOpenNotificationChannelList,
    NotificationChannelsService,
    Ok,
    Result,
    TableFieldSourceDefinition,
    TableRecord,
    TableRecordDefinition,
    TableRecordSourceDefinitionFactoryService,
    TextFormatterService,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { LockOpenNotificationChannelListTableRecordSourceDefinition } from './lock-open-notification-channel-list-table-record-source-definition';
import { LockOpenNotificationChannelTableRecordDefinition } from './lock-open-notification-channel-table-record-definition';
import { LockOpenNotificationChannelTableValueSource } from './lock-open-notification-channel-table-value-source';

export class LockOpenNotificationChannelListTableRecordSource extends LockOpenListTableRecordSource<LockOpenNotificationChannel, LockOpenNotificationChannelList> {
    declare readonly definition: LockOpenNotificationChannelListTableRecordSourceDefinition;
    declare readonly list: LockOpenNotificationChannelList;

    constructor(
        private readonly _notificationChannelsService: NotificationChannelsService,
        textFormatterService: TextFormatterService,
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        definition: LockOpenNotificationChannelListTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            tableRecordSourceDefinitionFactoryService,
            definition,
            definition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override get recordList() { return super.recordList; }

    override createDefinition(): LockOpenNotificationChannelListTableRecordSourceDefinition {
        return LockOpenNotificationChannelListTableRecordSourceDefinition.create(
            this._gridFieldCustomHeadingsService,
            this._tableFieldSourceDefinitionCachedFactoryService,
        )
    }

    override createRecordDefinition(idx: Integer): LockOpenNotificationChannelTableRecordDefinition {
        const lockOpenNotificationChannel = this.list.getAt(idx);
        return {
            typeId: TableRecordDefinition.TypeId.LockOpenNotificationChannel,
            mapKey: LockOpenNotificationChannel.name,
            record: lockOpenNotificationChannel,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const lockerScanAttachedNotificationChannel = this.list.getAt(recordIndex);

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId = fieldSourceDefinition.typeId as LockOpenNotificationChannelListTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            if (this.allowedFieldSourceDefinitionTypeIds.includes(fieldSourceDefinitionTypeId)) {
                switch (fieldSourceDefinitionTypeId) {
                    case TableFieldSourceDefinition.TypeId.LockerScanAttachedNotificationChannel: {
                        const valueSource = new LockOpenNotificationChannelTableValueSource(result.fieldCount, lockerScanAttachedNotificationChannel);
                        result.addSource(valueSource);
                        break;
                    }
                    default:
                        throw new UnreachableCaseError('SFEFCLTRSCTR19909', fieldSourceDefinitionTypeId);
                }
            }
        }

        return result;
    }

    override async tryLock(locker: LockOpenListItem.Locker): Promise<Result<void>> {
        const result = await this._notificationChannelsService.getLoadedList(false);
        if (result.isErr()) {
            return result.createType();
        } else {
            // Ignore returned list - just want to make sure it has been loaded
            return Ok.createResolvedPromise(undefined);
        }
    }


    protected override getDefaultFieldSourceDefinitionTypeIds() {
        return LockOpenNotificationChannelListTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }

    protected override subscribeList(opener: LockOpenListItem.Opener): LockOpenNotificationChannelList {
        return this._notificationChannelsService.list;
    }

    protected override unsubscribeList(opener: LockOpenListItem.Opener, list: LockOpenNotificationChannelList): void {
        // nothing to do
    }
}
