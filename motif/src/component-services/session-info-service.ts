/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeEnvironmentId, LitIvemId } from 'adi-internal-api';
import { SessionStateId } from 'core-internal-api';
import { MultiEvent } from 'sys-internal-api';

export class SessionInfoService {
    private _stateId: SessionStateId;
    private _kickedOff: boolean;

    private _serviceName: string;
    private _serviceDescription: string | undefined;
    private _userId: string;
    private _username: string;
    private _userFullName: string;
    private _zenithEndpoint: string;

    private _defaultLayout: SessionInfoService.DefaultLayout;

    private _stateChangedMultiEvent = new MultiEvent<SessionInfoService.StateChangedEventHandler>();
    private _kickedOffChangedMultiEvent = new MultiEvent<SessionInfoService.KickedOffChangedEventHandler>();

    // _bannerOverrideExchangeEnvironmentId is a hack used if you want banner to display a different Exchange EnvironmentId
    private _bannerOverrideExchangeEnvironmentId: ExchangeEnvironmentId | undefined;

    get stateId() { return this._stateId; }
    set stateId(value: SessionStateId) {
        this._stateId = value;
        this.notifyStateChanged();
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get kickedOff() { return this._kickedOff; }
    set kickedOff(value: boolean) {
        this._kickedOff = value;
        this.notifyKickedOffChanged();
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get serviceName() { return this._serviceName; }
    set serviceName(value: string) { this._serviceName = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get serviceDescription() { return this._serviceDescription; }
    set serviceDescription(value: string | undefined) { this._serviceDescription = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get userId() { return this._userId; }
    set userId(value: string) { this._userId = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get username() { return this._username; }
    set username(value: string) { this._username = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get userFullName() { return this._userFullName; }
    set userFullName(value: string) { this._userFullName = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get zenithEndpoint() { return this._zenithEndpoint; }
    set zenithEndpoint(value: string) { this._zenithEndpoint = value; }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get bannerOverrideExchangeEnvironmentId() { return this._bannerOverrideExchangeEnvironmentId; }
    set bannerOverrideExchangeEnvironmentId(value: ExchangeEnvironmentId | undefined) { this._bannerOverrideExchangeEnvironmentId = value; }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get defaultLayout() { return this._defaultLayout; }
    set defaultLayout(value: SessionInfoService.DefaultLayout) { this._defaultLayout = value; }

    subscribeStateChangedEvent(handler: SessionInfoService.StateChangedEventHandler) {
        return this._stateChangedMultiEvent.subscribe(handler);
    }

    unsubscribeStateChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        return this._stateChangedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeKickedOffChangedEvent(handler: SessionInfoService.KickedOffChangedEventHandler) {
        return this._kickedOffChangedMultiEvent.subscribe(handler);
    }

    unsubscribeKickedOffChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        return this._kickedOffChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyStateChanged() {
        const handlers = this._stateChangedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler();
        }
    }

    private notifyKickedOffChanged() {
        const handlers = this._kickedOffChangedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler();
        }
    }
}

export namespace SessionInfoService {
    export type StateChangedEventHandler = (this: void) => void;
    export type KickedOffChangedEventHandler = (this: void) => void;

    export interface DefaultLayout {
        readonly internalName: string | undefined;
        readonly instanceName: string | undefined;
        readonly linkedSymbol: LitIvemId | undefined;
        readonly watchlist: LitIvemId[] | undefined;
    }
}
