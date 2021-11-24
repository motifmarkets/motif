/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BrokerageAccountGroup, LitIvemId } from 'adi-internal-api';
import { OrderPad } from 'core-internal-api';
import { DitemFrame } from './ditem-frame';

export interface DesktopAccessService {
    readonly lastSingleBrokerageAccountGroup: BrokerageAccountGroup | undefined;

    initialLoadedEvent: DesktopAccessService.InitialLoadedEvent;

    readonly litIvemId: LitIvemId | undefined;
    readonly brokerageAccountGroup: BrokerageAccountGroup | undefined;
    readonly brokerageAccountGroupOrLitIvemIdSetting: boolean;
    notifyDitemFramePrimaryChanged(frame: DitemFrame): void;
    initialiseLitIvemId(litIvemId: LitIvemId): void;
    setLitIvemId(litIvemId: LitIvemId | undefined, initiatingFrame: DitemFrame | undefined): void;
    setBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, initiatingFrame: DitemFrame | undefined): void;
    setLastFocusedLitIvemId(value: LitIvemId): void;
    setLastFocusedBrokerageAccountGroup(group: BrokerageAccountGroup): void;

    editOrderRequest(orderPad: OrderPad): void;

    registerFrame(frame: DitemFrame): void;
    deleteFrame(frame: DitemFrame): void;

}

export namespace DesktopAccessService {
    export type InitialLoadedEvent = (this: void) => void;
}
