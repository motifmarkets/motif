/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BrokerageAccountGroup, LitIvemId, SingleBrokerageAccountGroup } from '../adi/extension-api';
import { MenuBar } from '../controls/menu-bar-api';
import { Frame } from '../ditem/frame-api';
import { JsonValue } from '../sys/extension-api';

/** @public */
export interface LocalDesktop {
    readonly lastFocusedLitIvemId: LitIvemId | undefined;
    readonly lastFocusedBrokerageAccountGroup: BrokerageAccountGroup | undefined;
    readonly lastSingleBrokerageAccountGroup: SingleBrokerageAccountGroup | undefined;

    readonly menuBar: MenuBar;

    litIvemId: LitIvemId | undefined;
    brokerageAccountGroup: BrokerageAccountGroup | undefined;

    // editOrderRequest(orderPad: OrderPad): void;

    getFrameEventer: LocalDesktop.GetFrameEventHandler | undefined;
    releaseFrameEventer: LocalDesktop.ReleaseFrameEventHandler | undefined;

    readonly frames: Frame[];

    createFrame(frameTypeName: string, tabText?: string, initialState?: JsonValue,
        preferredLocation?: LocalDesktop.PreferredLocation
    ): Frame;
    destroyFrame(frame: Frame): void;
    destroyAllFrames(): void;
}

/** @public */
export namespace LocalDesktop {
    export type GetFrameEventHandler = (this: void, frameSvc: Frame.SvcProxy) => Frame;
    export type ReleaseFrameEventHandler = (this: void, frame: Frame) => void;

    export const enum PreferredLocationEnum {
        FirstTabset = 'FirstTabset',
        NextToFocused = 'NextToFocused',
    }
    export type PreferredLocation = keyof typeof PreferredLocationEnum;
}
