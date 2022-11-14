/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, CommandRegisterService, delay1Tick, RegisteredExtension, StringId, Strings } from '@motifmarkets/motif-core';
import { DesktopFrame, GoldenLayoutHostFrame } from 'src/desktop/internal-api';
import {
    ApiError as ApiErrorApi,
    Frame as FrameApi,
    JsonValue as JsonValueApi,
    LocalDesktop as LocalDesktopApi
} from '../../../api/extension-api';
import { FrameSvcImplementation } from '../../frame-svc/internal-api';
import {
    BrokerageAccountGroupImplementation,
    LitIvemIdImplementation,
    SingleBrokerageAccountGroupImplementation
} from '../adi/internal-api';
import { MenuBarImplementation } from '../controls/internal-api';
import { ApiErrorImplementation, UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export class LocalDesktopImplementation implements LocalDesktopApi {
    public releaseFrameEventer: LocalDesktopApi.ReleaseFrameEventHandler | undefined;

    private readonly _menuBarImplementation: MenuBarImplementation;
    private readonly _frames: FrameApi[] = [];

    private _placeheldFramesCreated = false;
    private _getFrameEventer: LocalDesktopApi.GetFrameEventHandler;

    constructor(
        private readonly _registeredExtension: RegisteredExtension,
        private readonly _desktopFrame: DesktopFrame,
        commandRegisterService: CommandRegisterService,
    ) {
        this._menuBarImplementation = new MenuBarImplementation(
            this._registeredExtension.handle,
            this._desktopFrame.menuBarService,
            commandRegisterService,
        );
    }

    public get lastFocusedLitIvemId() {
        const actualLitIvemId = this._desktopFrame.lastFocusedLitIvemId;
        if (actualLitIvemId === undefined) {
            return undefined;
        } else {
            return LitIvemIdImplementation.toApi(actualLitIvemId);
        }
    }
    public get lastFocusedBrokerageAccountGroup() {
        const actualBrokerageAccountGroup = this._desktopFrame.lastFocusedBrokerageAccountGroup;
        if (actualBrokerageAccountGroup === undefined) {
            return undefined;
        } else {
            return BrokerageAccountGroupImplementation.toApi(actualBrokerageAccountGroup);
        }
    }
    public get lastSingleBrokerageAccountGroup() {
        const actualBrokerageAccountGroup = this._desktopFrame.lastSingleBrokerageAccountGroup;
        if (actualBrokerageAccountGroup === undefined) {
            return undefined;
        } else {
            return SingleBrokerageAccountGroupImplementation.toSingleApi(actualBrokerageAccountGroup);
        }
    }

    public get litIvemId() {
        const actualLitIvemId = this._desktopFrame.litIvemId;
        if (actualLitIvemId === undefined) {
            return undefined;
        } else {
            return LitIvemIdImplementation.toApi(actualLitIvemId);
        }
    }
    public get brokerageAccountGroup() {
        const actualBrokerageAccountGroup = this._desktopFrame.brokerageAccountGroup;
        if (actualBrokerageAccountGroup === undefined) {
            return undefined;
        } else {
            return BrokerageAccountGroupImplementation.toApi(actualBrokerageAccountGroup);
        }
    }

    public get frames() { return this._frames.slice(); }

    get menuBar() { return this._menuBarImplementation; }

    public get getFrameEventer() { return this._getFrameEventer; }
    public set getFrameEventer(value: LocalDesktopApi.GetFrameEventHandler) {
        this._getFrameEventer = value;
        if (!this._placeheldFramesCreated) {
            delay1Tick(() => this.createPlaceheldFrames());
        }
    }

    destroy() {
        this.placeholdAllFrames();
        this._menuBarImplementation.destroy();
    }

    getFrame(frameSvc: FrameSvcImplementation) {
        if (this._getFrameEventer === undefined) {
            throw new ApiErrorImplementation(ApiErrorApi.CodeEnum.GetFrameEventerIsUndefined);
        } else {
            const frame = this._getFrameEventer(frameSvc);
            this._frames.push(frame);
            return frame;
        }
    }

    releaseFrame(frame: FrameApi) {
        const releaseFrameEventer = this.releaseFrameEventer;
        if (releaseFrameEventer !== undefined) {
            releaseFrameEventer(frame);
        }

        const frameIdx = this._frames.indexOf(frame);
        if (frameIdx < 0) {
            throw new AssertInternalError('LDAIRF29994887', frame.svc.frameTypeName);
        } else {
            this._frames.splice(frameIdx, 1);
        }
    }

    public createFrame(frameTypeName: string, tabText?: string, initialState?: JsonValueApi,
        preferredLocation?: LocalDesktopApi.PreferredLocation
    ) {
        let preferredLocationId: GoldenLayoutHostFrame.PreferredLocationId | undefined;
        if (preferredLocation === undefined) {
            preferredLocationId = undefined;
        } else {
            preferredLocationId = LocalDesktopImplementation.PreferredLocationId.fromApi(preferredLocation);
        }

        const frame = this._desktopFrame.createExtensionComponent(
            this._registeredExtension.handle,
            frameTypeName,
            initialState,
            tabText,
            preferredLocationId) as FrameApi;

        return frame;
    }

    public destroyFrame(frame: FrameApi) {
        const frameSvc = frame.svc as FrameSvcImplementation;
        const ditemFrame = frameSvc.ditemFrame;
        this._desktopFrame.destroyExtensionComponent(ditemFrame); // ditemFrame is used to get container
        frameSvc.destroy();
    }

    public destroyAllFrames() {
        for (let i = this._frames.length - 1; i >= 0; i--) {
            const frame = this._frames[i];
            this.destroyFrame(frame);
        }

        if (this._frames.length !== 0) {
            throw new AssertInternalError('LDAIDAF479921220', this._frames.length.toString());
        }
    }

    private createPlaceheldFrames() {
        if (this._getFrameEventer !== undefined) {
            this._desktopFrame.createPlaceheldExtensionComponents(this._registeredExtension.handle);
            this._placeheldFramesCreated = true;
        }
    }

    private placeholdAllFrames() {
        for (let i = this._frames.length - 1; i >= 0; i--) {
            const frame = this._frames[i];
            this.placeholdFrame(frame);
        }

        if (this._frames.length !== 0) {
            throw new AssertInternalError('LDAIPAF479921220', this._frames.length.toString());
        }
    }

    private placeholdFrame(frame: FrameApi) {
        const frameSvc = frame.svc as FrameSvcImplementation;
        const ditemFrame = frameSvc.ditemFrame;
        frameSvc.destroy(); // destroy before placeholding as need to release ComponentContainer.stateRequestEvent first
        this._desktopFrame.placeholdExtensionComponent(ditemFrame, Strings[StringId.Extensions_ExtensionNotInstalledOrEnabled]);
    }
}

export namespace LocalDesktopImplementation {
    export namespace PreferredLocationId {
        export function fromApi(value: LocalDesktopApi.PreferredLocation) {
            const enumValue = value as LocalDesktopApi.PreferredLocationEnum;
            switch (enumValue) {
                case LocalDesktopApi.PreferredLocationEnum.FirstTabset: return GoldenLayoutHostFrame.PreferredLocationId.FirstTabset;
                case LocalDesktopApi.PreferredLocationEnum.NextToFocused: return GoldenLayoutHostFrame.PreferredLocationId.NextToFocused;
                default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidUiActionState, enumValue);
            }
        }
    }
}
