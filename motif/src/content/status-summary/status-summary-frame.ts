/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AssertInternalError,
    Badness,
    CorrectnessId,
    MultiEvent, SessionInfoService, StringId,
    Strings,
    UnreachableCaseError,
    ZenithExtConnectionDataDefinition, ZenithExtConnectionDataItem,
    ZenithPublisherState,
    ZenithServerInfoDataDefinition,
    ZenithServerInfoDataItem
} from '@motifmarkets/motif-core';
import { ContentFrame } from '../content-frame';

export class StatusSummaryFrame extends ContentFrame {
    private _userAccessTokenExpiryTimeChangedSubscriptionId: MultiEvent.SubscriptionId;

    private _extConnectionDataItem: ZenithExtConnectionDataItem;
    private _extConnectionPublisherOnlineChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _extConnectionPublisherStateChangeSubscriptionId: MultiEvent.SubscriptionId;

    private _serverInfoDataItem: ZenithServerInfoDataItem | undefined;
    private _serverInfoFieldValuesChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _serverInfoCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private _componentAccess: StatusSummaryFrame.ComponentAccess, private _adi: AdiService,
        public readonly _sessionInfoService: SessionInfoService
    ) {
        super();

        this._userAccessTokenExpiryTimeChangedSubscriptionId = this._sessionInfoService.subscribeUserAccessTokenExpiryTimeChangedEvent(
            () => this._componentAccess.notifyUserAccessTokenExpiryTimeChange()
        );
    }

    get publisherOnline() { return this._extConnectionDataItem.publisherOnline ? Strings[StringId.Online] : Strings[StringId.Offline]; }
    get publisherStateId() { return ZenithPublisherState.idToDisplay(this._extConnectionDataItem.publisherStateId); }
    get serverName() { return this._serverInfoDataItem?.serverName === undefined ? '' : this._serverInfoDataItem.serverName; }

    initialise() {
        this.subscribeZenithExtConnection();
        this.subscribeZenithServerInfo();

        const badness = this.calculateBadness();
        this._componentAccess.hideBadnessWithVisibleDelay(badness);

        this._componentAccess.notifyServerInfoChanged();
    }

    override finalise() {
        this._sessionInfoService.unsubscribeUserAccessTokenExpiryTimeChangedEvent(this._userAccessTokenExpiryTimeChangedSubscriptionId);
        this._userAccessTokenExpiryTimeChangedSubscriptionId = undefined;

        this.unsubscribeZenithExtConnection();
        this.unsubscribeZenithServerInfo();

        super.finalise();
    }

    private handleExtConnectionPublisherOnlineChangeEvent() {
        this._componentAccess.notifyPublisherOnlineChange();
    }

    private handleExtConnectionPublisherStateChangeEvent() {
        this._componentAccess.notifyPublisherStateChange();
    }

    private handleServerInfoFieldValuesChangedEvent() {
        this._componentAccess.notifyServerInfoChanged();
    }

    private handleServerInfoBadnessChangeEvent() {
        const badness = this.calculateBadness();
        this._componentAccess.setBadness(badness);
        this._componentAccess.notifyServerInfoChanged();
    }

    private subscribeZenithExtConnection() {
        const dataDefinition = new ZenithExtConnectionDataDefinition();
        dataDefinition.zenithWebsocketEndpoints = this._sessionInfoService.zenithEndpoints;

        this._extConnectionDataItem = this._adi.subscribe(dataDefinition) as ZenithExtConnectionDataItem;
        this._extConnectionPublisherOnlineChangeSubscriptionId = this._extConnectionDataItem.subscribePublisherOnlineChangeEvent(
            () => { this.handleExtConnectionPublisherOnlineChangeEvent(); }
        );
        this._extConnectionPublisherStateChangeSubscriptionId = this._extConnectionDataItem.subscribePublisherStateChangeEvent(
            () => { this.handleExtConnectionPublisherStateChangeEvent(); }
        );
    }

    private unsubscribeZenithExtConnection() {
        this._extConnectionDataItem.unsubscribePublisherOnlineChangeEvent(this._extConnectionPublisherOnlineChangeSubscriptionId);
        this._extConnectionPublisherOnlineChangeSubscriptionId = undefined;
        this._extConnectionDataItem.unsubscribePublisherStateChangeEvent(this._extConnectionPublisherStateChangeSubscriptionId);
        this._extConnectionPublisherStateChangeSubscriptionId = undefined;
        this._adi.unsubscribe(this._extConnectionDataItem);
    }

    private subscribeZenithServerInfo() {
        const dataDefinition = new ZenithServerInfoDataDefinition();
        this._serverInfoDataItem = this._adi.subscribe(dataDefinition) as ZenithServerInfoDataItem;
        this._serverInfoFieldValuesChangedSubscriptionId = this._serverInfoDataItem.subscribeFieldValuesChangedEvent(
            () => { this.handleServerInfoFieldValuesChangedEvent(); }
        );
        this._serverInfoCorrectnessChangeSubscriptionId = this._serverInfoDataItem.subscribeBadnessChangeEvent(
            () => { this.handleServerInfoBadnessChangeEvent(); }
        );
    }

    private unsubscribeZenithServerInfo() {
        if (this._serverInfoDataItem !== undefined) {
            this._serverInfoDataItem.unsubscribeFieldValuesChangedEvent(this._serverInfoFieldValuesChangedSubscriptionId);
            this._serverInfoFieldValuesChangedSubscriptionId = undefined;
            this._serverInfoDataItem.unsubscribeBadnessChangeEvent(this._serverInfoCorrectnessChangeSubscriptionId);
            this._serverInfoCorrectnessChangeSubscriptionId = undefined;
            this._adi.unsubscribe(this._serverInfoDataItem);
            this._serverInfoDataItem = undefined;
        }
    }

    private calculateBadness() {
        if (this._serverInfoDataItem === undefined) {
            throw new AssertInternalError('SSFCB34986');
        } else {
            const serverInfoBadness = this._serverInfoDataItem.badness;
            const correctnessId = Badness.Reason.idToCorrectnessId(serverInfoBadness.reasonId);
            switch (correctnessId) {
                case CorrectnessId.Good:
                case CorrectnessId.Usable:
                    return Badness.notBad;
                case CorrectnessId.Suspect: {
                    const badness: Badness = {
                        reasonId: Badness.ReasonId.StatusRetrieving,
                        reasonExtra: Badness.generateText(serverInfoBadness),
                    };
                    return badness;
                }
                case CorrectnessId.Error: {
                    const badness: Badness = {
                        reasonId: Badness.ReasonId.StatusWarnings,
                        reasonExtra: Badness.generateText(serverInfoBadness),
                    };
                    return badness;
                }
                default:
                    throw new UnreachableCaseError('SSFCB988873444', correctnessId);
            }
        }
    }
}

export namespace StatusSummaryFrame {
    export interface ComponentAccess {
        notifyUserAccessTokenExpiryTimeChange(): void;
        notifyPublisherOnlineChange(): void;
        notifyPublisherStateChange(): void;
        notifyServerInfoChanged(): void;

        setBadness(value: Badness): void;
        hideBadnessWithVisibleDelay(badness: Badness): void;
    }
}
