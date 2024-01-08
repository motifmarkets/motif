/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, MultiEvent } from '@motifmarkets/motif-core';
import { DesktopFrame } from 'desktop-internal-api';

export class WorkspaceService {
    private _localDesktopFrameLoadedMultiEvent = new MultiEvent<WorkspaceService.LocalDesktopFrameLoadedEventHandler>();

    private _localDesktopFrame: DesktopFrame | undefined;

    get localDesktopFrame() { return this._localDesktopFrame; }

    subscribeLocalDesktopFrameLoadedEvent(handler: WorkspaceService.LocalDesktopFrameLoadedEventHandler) {
        return this._localDesktopFrameLoadedMultiEvent.subscribe(handler);
    }

    unsubscribeLocalDesktopFrameLoadedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        return this._localDesktopFrameLoadedMultiEvent.unsubscribe(subscriptionId);
    }

    setLocalDesktopFrame(value: DesktopFrame) {
        if (this._localDesktopFrame !== undefined) {
            throw new AssertInternalError('WSSLDF22293546');
        } else {
            this._localDesktopFrame = value;
            this.notifyLocalDesktopFrameLoaded(value);
        }
    }

    private notifyLocalDesktopFrameLoaded(desktopFrame: DesktopFrame) {
        const handlers = this._localDesktopFrameLoadedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler(desktopFrame);
        }
    }
}

export namespace WorkspaceService {
    export type LocalDesktopFrameLoadedEventHandler = (this: void, desktopFrame: DesktopFrame) => void;
}
