/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RegisteredExtension } from 'src/content/internal-api';
import { CommandRegisterService } from 'src/core/internal-api';
import { WorkspaceService } from 'src/workspace/internal-api';
import { LocalDesktop as LocalDesktopApi, WorkspaceSvc } from '../../../api/extension-api';
import { LocalDesktopImplementation } from '../../exposed/internal-api';

export class WorkspaceSvcImplementation implements WorkspaceSvc {
    localDesktopLoadedEventer: WorkspaceSvc.LocalDesktopLoadedEventHandler;

    private _localDesktop: LocalDesktopImplementation;
    private _getLoadedLocalDesktopResolveFtns: WorkspaceSvcImplementation.GetLoadedLocalDesktopResolveFtn[]  = [];

    get localDesktop() { return this._localDesktop; }

    constructor(
        private readonly _registeredExtension: RegisteredExtension,
        private readonly _workspaceService: WorkspaceService,
        private readonly _commandRegisterService: CommandRegisterService,
    ) {
        const localDesktop  = this._workspaceService.localDesktopFrame;
        if (localDesktop === undefined) {
            this._workspaceService.localDesktopFrameLoadedEvent = () => this.loadLocalDesktop();
        } else {
            this.loadLocalDesktop();
        }
    }

    destroy() {
        if (this._localDesktop !== undefined) {
            this._localDesktop.destroy();
        }

        this.resolveGetLoadedLocalDesktop(this._localDesktop);
    }

    getLoadedLocalDesktop(): Promise<LocalDesktopApi | undefined> {
        if (this._localDesktop !== undefined) {
            return Promise.resolve(this._localDesktop);
        } else {
            return new Promise(
                (resolve) => {
                    this._getLoadedLocalDesktopResolveFtns.push(resolve);
                }
            );
        }
    }

    private loadLocalDesktop() {
        this._localDesktop = new LocalDesktopImplementation(this._registeredExtension,
            this._workspaceService.localDesktopFrame,
            this._commandRegisterService,
        );

        if (this.localDesktopLoadedEventer !== undefined) {
            this.localDesktopLoadedEventer();
        }

        this.resolveGetLoadedLocalDesktop(this._localDesktop);
    }

    private resolveGetLoadedLocalDesktop(value: LocalDesktopApi | undefined) {
        for (const ftn of this._getLoadedLocalDesktopResolveFtns) {
            ftn(value);
        }
        this._getLoadedLocalDesktopResolveFtns.length = 0;
    }
}

export namespace WorkspaceSvcImplementation {
    export type GetLoadedLocalDesktopResolveFtn = (localDesktop: LocalDesktopApi | undefined) => void;
}
