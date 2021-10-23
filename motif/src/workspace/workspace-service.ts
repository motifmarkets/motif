/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DesktopFrame } from 'src/desktop/internal-api';
import { AssertInternalError, MultiEvent } from 'src/sys/internal-api';

export class WorkspaceService {
    private _localDesktopFrameLoadedMultiEvent = new MultiEvent<WorkspaceService.LocalDesktopFrameLoadedEventHandler>();

    private _localDesktopFrame: DesktopFrame;

    get localDesktopFrame() { return this._localDesktopFrame; }

    subcribeLocalDesktopFrameLoadedEvent(handler: WorkspaceService.LocalDesktopFrameLoadedEventHandler) {
        return this._localDesktopFrameLoadedMultiEvent.subscribe(handler);
    }

    unsubcribeLocalDesktopFrameLoadedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        return this._localDesktopFrameLoadedMultiEvent.unsubscribe(subscriptionId);
    }

    setLocalDesktopFrame(value: DesktopFrame) {
        if (this._localDesktopFrame !== undefined) {
            throw new AssertInternalError('WSSLDF22293546');
        } else {
            this._localDesktopFrame = value;
            if (this._localDesktopFrameLoadedMultiEvent !== undefined) {
                this.notifyLocalDesktopFrameLoaded();
            }
        }
    }

    private notifyLocalDesktopFrameLoaded() {
        const handlers = this._localDesktopFrameLoadedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler();
        }
    }
}

export namespace WorkspaceService {
    export type LocalDesktopFrameLoadedEventHandler = (this: void) => void;
}
