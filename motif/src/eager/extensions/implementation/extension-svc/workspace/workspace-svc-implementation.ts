/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, CommandRegisterService, MultiEvent, RegisteredExtension } from '@motifmarkets/motif-core';
import { WorkspaceService } from 'workspace-internal-api';
import { LocalDesktop as LocalDesktopApi, WorkspaceSvc } from '../../../api/extension-api';
import { LocalDesktopImplementation } from '../../exposed/internal-api';

export class WorkspaceSvcImplementation implements WorkspaceSvc {
    localDesktopLoadedEventer: WorkspaceSvc.LocalDesktopLoadedEventHandler;

    private _localDesktop: LocalDesktopImplementation;
    private _workspaceServiceLocalDesktopFrameLoadedSubscriptionId: MultiEvent.SubscriptionId;
    private _getLoadedLocalDesktopResolveFtns: WorkspaceSvcImplementation.GetLoadedLocalDesktopResolveFtn[]  = [];

    constructor(
        private readonly _registeredExtension: RegisteredExtension,
        private readonly _workspaceService: WorkspaceService,
        private readonly _commandRegisterService: CommandRegisterService,
    ) {
        const localDesktop  = this._workspaceService.localDesktopFrame;
        if (localDesktop === undefined) {
            this._workspaceServiceLocalDesktopFrameLoadedSubscriptionId = this._workspaceService.subcribeLocalDesktopFrameLoadedEvent(
                () => this.loadLocalDesktop()
            );
        } else {
            this.loadLocalDesktop();
        }
    }

    get localDesktop() { return this._localDesktop; }

    destroy() {
        this.checkUnsubscribeWorkspaceServiceLocalDesktopFrameLoadedEvent();

        if (this._localDesktop !== undefined) {
            this._localDesktop.destroy();
        }

        this.resolveGetLoadedLocalDesktop(undefined);
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
        const localDesktopFrame = this._workspaceService.localDesktopFrame;
        if (localDesktopFrame === undefined) {
            throw new AssertInternalError('WSILLD00023');
        } else {
            this._localDesktop = new LocalDesktopImplementation(this._registeredExtension,
                localDesktopFrame,
                this._commandRegisterService,
            );

            if (this.localDesktopLoadedEventer !== undefined) {
                this.localDesktopLoadedEventer();
            }

            this.resolveGetLoadedLocalDesktop(this._localDesktop);

            this.checkUnsubscribeWorkspaceServiceLocalDesktopFrameLoadedEvent();
        }
    }

    private resolveGetLoadedLocalDesktop(value: LocalDesktopApi | undefined) {
        for (const ftn of this._getLoadedLocalDesktopResolveFtns) {
            ftn(value);
        }
        this._getLoadedLocalDesktopResolveFtns.length = 0;
    }

    private checkUnsubscribeWorkspaceServiceLocalDesktopFrameLoadedEvent() {
        if (this._workspaceServiceLocalDesktopFrameLoadedSubscriptionId !== undefined) {
            this._workspaceService.unsubcribeLocalDesktopFrameLoadedEvent(this._workspaceServiceLocalDesktopFrameLoadedSubscriptionId);
            this._workspaceServiceLocalDesktopFrameLoadedSubscriptionId = undefined;
        }
    }
}

export namespace WorkspaceSvcImplementation {
    export type GetLoadedLocalDesktopResolveFtn = (localDesktop: LocalDesktopApi | undefined) => void;
}
