/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DesktopFrame } from 'src/desktop/internal-api';
import { AssertInternalError } from 'src/sys/internal-api';

export class WorkspaceService {
    localDesktopFrameLoadedEvent: WorkspaceService.LocalDesktopFrameLoadedEvent;

    private _localDesktopFrame: DesktopFrame;

    get localDesktopFrame() { return this._localDesktopFrame; }

    setLocalDesktopFrame(value: DesktopFrame) {
        if (this._localDesktopFrame !== undefined) {
            throw new AssertInternalError('WSSLDF22293546');
        } else {
            this._localDesktopFrame = value;
            if (this.localDesktopFrameLoadedEvent !== undefined) {
                this.localDesktopFrameLoadedEvent();
            }
        }
    }
}

export namespace WorkspaceService {
    export type LocalDesktopFrameLoadedEvent = (this: void) => void;
}
