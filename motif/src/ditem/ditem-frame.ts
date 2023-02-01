/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    BrokerageAccountGroup,
    CommandRegisterService,
    ExtensionHandle,
    JsonElement,
    LitIvemId,
    OrderPad,
    SymbolsService
} from '@motifmarkets/motif-core';
import { Frame } from 'component-internal-api';
import { ComponentContainer } from 'golden-layout';
import { DitemCommandProcessor } from './ditem-command-processor';

export abstract class DitemFrame extends Frame {

    private static readonly jsonTag_FrameLitIvemId = 'frameLitIvemId';
    private static readonly jsonTag_FrameLitIvemIdLinked = 'frameLitIvemIdLinked';
    private static readonly jsonTag_BrokerageAccountGroup = 'brokerageAccountGroup';
    private static readonly jsonTag_BrokerageAccountGroupLinked = 'brokerageAccountGroupLinked';
    private static readonly jsonTag_Primary = 'primary';

    protected layoutConfigLoading = false;
    protected layoutConfigLoaded = false;

    private _primary: boolean;

    private _litIvemId: LitIvemId | undefined;
    private _oldLitIvemId: LitIvemId;
    private _litIvemIdLinkable = true;
    private _litIvemIdLinked: boolean;

    private _currentFocusedLitIvemId: LitIvemId | undefined;
    private _lastFocusedLitIvemId: LitIvemId;

    private _brokerageAccountGroup: BrokerageAccountGroup | undefined;
    private _oldBrokerageAccountGroup: BrokerageAccountGroup;
    private _brokerageAccountGroupLinkable = true;
    private _brokerageAccountGroupLinked: boolean;

    private _currentFocusedBrokerageAccountGroup: BrokerageAccountGroup | undefined;
    private _lastFocusedBrokerageAccountGroup: BrokerageAccountGroup;
    private _allBrokerageAccountGroupSupported: boolean;

    private _selectAllWhenFrameSymbolAndSourceApplied: boolean;

    private _ditemCommandProcessor: DitemCommandProcessor;

    constructor(private readonly _ditemTypeId: DitemFrame.TypeId,
        private readonly _ditemComponentAccess: DitemFrame.ComponentAccess,
        private readonly _commandRegisterService: CommandRegisterService,
        private readonly _desktopAccessService: DitemFrame.DesktopAccessService,
        private readonly _symbolsService: SymbolsService,
        private readonly _adiService: AdiService
    ) {
        super();

        this._desktopAccessService.registerFrame(this);
        this._ditemCommandProcessor = new DitemCommandProcessor(this._commandRegisterService);
    }

    get ditemTypeId() { return this._ditemTypeId; }

    get container() { return this._ditemComponentAccess.container; }

    get litIvemId() { return this._litIvemId; }
    get oldlitIvemId() { return this._oldLitIvemId; }

    get litIvemIdValid() { return this.getLitIvemIdValid(); }
    get oldlitIvemIdValid() { return this.getOldLitIvemIdValid(); }

    get brokerageAccountGroup() { return this._brokerageAccountGroup; }
    get oldbrokerageAccountGroup() { return this._oldBrokerageAccountGroup; }

    get ditemCommandProcessor() { return this._ditemCommandProcessor; }

    get litIvemIdLinkable() { return this._litIvemIdLinkable; }
    set litIvemIdLinkable(value: boolean) { this._litIvemIdLinkable = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get litIvemIdLinked() { return this._litIvemIdLinked; }
    set litIvemIdLinked(value: boolean) { this.setLitIvemIdLinked(value); }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get allBrokerageAccountGroupSupported() { return this._allBrokerageAccountGroupSupported; }
    set allBrokerageAccountGroupSupported(value: boolean) { this._allBrokerageAccountGroupSupported = value; }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get brokerageAccountGroupLinkable() { return this._brokerageAccountGroupLinkable; }
    set brokerageAccountGroupLinkable(value: boolean) { this._brokerageAccountGroupLinkable = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get brokerageAccountGroupLinked() { return this._brokerageAccountGroupLinked; }
    set brokerageAccountGroupLinked(value: boolean) { this.setBrokerageAccountGroupLinked(value); }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get primary() { return this._primary; }
    set primary(value: boolean) {
        if (value !== this._primary) {
            this._primary = value;
            this.notifyPrimaryChanged();
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected get desktopAccessService() { return this._desktopAccessService; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected get symbolsService() { return this._symbolsService; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected get adi() { return this._adiService; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected get currentFocusedLitIvemId() { return this._currentFocusedLitIvemId; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected get lastFocusedLitIvemId() { return this._lastFocusedLitIvemId; }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected get currentFocusedBrokerageAccountGroup() { return this._currentFocusedBrokerageAccountGroup; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected get lastFocusedBrokerageAccountGroup() { return this._lastFocusedBrokerageAccountGroup; }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected get selectAllWhenFrameSymbolAndSourceApplied(): boolean { return this._selectAllWhenFrameSymbolAndSourceApplied; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected set selectAllWhenFrameSymbolAndSourceApplied(value: boolean) { this._selectAllWhenFrameSymbolAndSourceApplied = value; }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    abstract get initialised(): boolean;

    finalise() {
        this._desktopAccessService.deleteFrame(this);
    }

    constructLoad(element: JsonElement | undefined) {
        if (element === undefined) {
            this._litIvemIdLinked = DitemFrame.DitemDefault.litIvemIdLinked;
            this._brokerageAccountGroupLinked = DitemFrame.DitemDefault.brokerageAccountGroupLinked;
            this._litIvemId = DitemFrame.DitemDefault.litIvemId;
            this._brokerageAccountGroup = DitemFrame.DitemDefault.brokerageAccountGroup;
            this._primary = DitemFrame.DitemDefault.primary;
        } else {
            if (!this.litIvemIdLinkable) {
                this._litIvemIdLinked = DitemFrame.DitemDefault.litIvemIdLinked;
            } else {
                const isFrameLitIvemIdLinkedResult = element.tryGetBoolean(DitemFrame.jsonTag_FrameLitIvemIdLinked);
                if (isFrameLitIvemIdLinkedResult.isErr()) {
                    this.litIvemIdLinked = DitemFrame.DitemDefault.litIvemIdLinked;
                } else {
                    this.litIvemIdLinked = isFrameLitIvemIdLinkedResult.value;
                }
            }

            if (!this.brokerageAccountGroupLinkable) {
                this._brokerageAccountGroupLinked = DitemFrame.DitemDefault.brokerageAccountGroupLinked;
            } else {
                const isBrokerageAccountGroupLinkedResult = element.tryGetBoolean(DitemFrame.jsonTag_BrokerageAccountGroupLinked);
                if (isBrokerageAccountGroupLinkedResult.isErr()) {
                    this.brokerageAccountGroupLinked = DitemFrame.DitemDefault.brokerageAccountGroupLinked;
                } else {
                    this.brokerageAccountGroupLinked = isBrokerageAccountGroupLinkedResult.value;
                }
            }

            const litIvemIdElementResult = element.tryGetElement(DitemFrame.jsonTag_FrameLitIvemId);
            if (litIvemIdElementResult.isErr()) {
                this._litIvemId = undefined;
            } else {
                const litIvemIdResult = LitIvemId.tryCreateFromJson(litIvemIdElementResult.value);
                if (litIvemIdResult.isErr()) {
                    this._litIvemId = undefined;
                } else {
                    this._litIvemId = litIvemIdResult.value;
                }
            }

            const groupElementResult = element.tryGetElement(DitemFrame.jsonTag_BrokerageAccountGroup);
            if (groupElementResult.isErr()) {
                this._brokerageAccountGroup = undefined;
            } else {
                const groupResult = BrokerageAccountGroup.tryCreateFromJson(groupElementResult.value);
                if (groupResult.isErr()) {
                    this._brokerageAccountGroup = undefined;
                } else {
                    this._brokerageAccountGroup = groupResult.value;
                }
            }

            const jsonPrimaryResult = element.tryGetBoolean(DitemFrame.jsonTag_Primary);
            if (jsonPrimaryResult.isErr()) {
                this._primary = DitemFrame.DitemDefault.primary;
            } else {
                this._primary = jsonPrimaryResult.value;
                if (this._primary) {
                    this.desktopAccessService.notifyDitemFramePrimaryChanged(this);
                }
            }
            // TODO:MED need to load LitIvemId history
        }
    }

    save(element: JsonElement) {
        if (this._litIvemId !== undefined) {
            const litIvemIdElement = element.newElement(DitemFrame.jsonTag_FrameLitIvemId);
            this._litIvemId.saveToJson(litIvemIdElement);
        }
        element.setBoolean(DitemFrame.jsonTag_FrameLitIvemIdLinked, this.litIvemIdLinked);
        if (this._brokerageAccountGroup !== undefined) {
            const groupElement = element.newElement(DitemFrame.jsonTag_BrokerageAccountGroup);
            this._brokerageAccountGroup.saveToJson(groupElement);
        }
        element.setBoolean(DitemFrame.jsonTag_BrokerageAccountGroupLinked, this.brokerageAccountGroupLinked);
        if (this._primary !== DitemFrame.DitemDefault.primary) {
            element.setBoolean(DitemFrame.jsonTag_Primary, this.primary);
        }
    }

    applyAppOptions(displaySettingsOnly: boolean) { // override;
    }

    focus() {
        this._ditemComponentAccess.focus();
    }

    blur() {
        this._ditemComponentAccess.blur();
    }

    setLitIvemIdFromDesktop(litIvemId: LitIvemId | undefined, initiatingFrame: DitemFrame | undefined): void {
        this.setLitIvemId(litIvemId, initiatingFrame);
    }

    setLitIvemIdFromDitem(litIvemId: LitIvemId | undefined, force = false): void {
        const litIvemIdChanged = !LitIvemId.isUndefinableEqual(litIvemId, this._litIvemId);

        if (!litIvemIdChanged && force) {
            this.setLitIvemId(litIvemId, this);
        } else {
            if (litIvemIdChanged) {
                const desktopSet = this.trySetDesktopLitIvemId(litIvemId);
                if (!desktopSet) {
                    this.setLitIvemId(litIvemId, this);
                }
            }
        }
    }

    setBrokerageAccountGroupFromDesktop(group: BrokerageAccountGroup | undefined, initiatingFrame: DitemFrame | undefined): void {
        this.setBrokerageAccountGroup(group, initiatingFrame);
    }

    setBrokerageAccountGroupFromDitem(group: BrokerageAccountGroup | undefined, force = false) {
        const groupChanged = !BrokerageAccountGroup.isUndefinableEqual(group, this._brokerageAccountGroup);

        if (!groupChanged && force) {
            this.setBrokerageAccountGroup(group, this);
        } else {
            if (groupChanged) {
                const desktopSet = this.trySetDesktopBrokerageAccountGroup(group);
                if (!desktopSet) {
                    this.setBrokerageAccountGroup(group, this);
                }
            }
        }
    }

    protected flagSaveRequired() {
        this._desktopAccessService.flagLayoutSaveRequired();
    }

    protected applyLinked() {
        if (this._litIvemIdLinked) {
            const desktopLitIvemId = this._desktopAccessService.litIvemId;
            if (desktopLitIvemId !== undefined) {
                this.setLitIvemIdFromDesktop(desktopLitIvemId, undefined);
            }
        }

        if (this._brokerageAccountGroupLinked) {
            const brokerageAccountGroup = this._desktopAccessService.brokerageAccountGroup;
            if (brokerageAccountGroup !== undefined) {
                this.setBrokerageAccountGroupFromDesktop(brokerageAccountGroup, undefined);
            }
        }
    }

    protected applyLitIvemId(litIvemId: LitIvemId | undefined, selfInitiated: boolean): boolean { // virtual
        if (this._litIvemId !== undefined) {
            this._oldLitIvemId = this._litIvemId;
        }
        this._litIvemId = litIvemId;
        return true;
    }

    protected applyDitemLitIvemIdFocus(litIvemId: LitIvemId, applyToLinking: boolean) {
        this.setCurrentFocusedLitIvemId(litIvemId);

        if (applyToLinking) {
            this.trySetDesktopLitIvemId(litIvemId);
        }
    }

    protected clearCurrentFocusedLitIvemId() {
        this._currentFocusedLitIvemId = undefined;
    }

    protected hasCurrentFocusedLitIvemId() {
        return this._currentFocusedLitIvemId !== undefined;
    }

    protected applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean): boolean { // virtual;
        if (this._brokerageAccountGroup !== undefined) {
            this._oldBrokerageAccountGroup = this._brokerageAccountGroup;
        }
        this._brokerageAccountGroup = group;
        return true;
    }

    protected applyDitemBrokerageAccountGroupFocus(group: BrokerageAccountGroup, applyToLinking: boolean) {
        this.setCurrentFocusedBrokerageAccountGroup(group);

        if (applyToLinking) {
            this.trySetDesktopBrokerageAccountGroup(group);
        }
    }

    protected clearCurrentFocusedAccount() {
        this._currentFocusedBrokerageAccountGroup = undefined;
    }

    protected hasCurrentFocusedAccountAggregation() {
        return this._currentFocusedBrokerageAccountGroup !== undefined;
    }

    protected setLayoutComponentConfig(element: JsonElement, componentConfig: JsonElement | undefined) {
        element.setElement(DitemFrame.FrameConfigItemName.component, componentConfig);
    }

    private notifyPrimaryChanged() {
        this._ditemComponentAccess.processPrimaryChanged();
        this.desktopAccessService.notifyDitemFramePrimaryChanged(this);
    }

    private setCurrentFocusedLitIvemId(litIvemId: LitIvemId) {
        this._currentFocusedLitIvemId = litIvemId;
        this._lastFocusedLitIvemId = this._currentFocusedLitIvemId;
        if (this._ditemComponentAccess.focused) {
            this._desktopAccessService.setLastFocusedLitIvemId(this.lastFocusedLitIvemId);
        }
    }

    private setLitIvemId(litIvemId: LitIvemId | undefined, initiatingFrame: DitemFrame | undefined): void {
        const selfInitiated = (initiatingFrame !== undefined && initiatingFrame.frameId === this.frameId);
        const applied = this.applyLitIvemId(litIvemId, selfInitiated);

        if (applied && litIvemId !== undefined) {
            this.setCurrentFocusedLitIvemId(litIvemId);
        }
    }

    private trySetDesktopLitIvemId(litIvemId: LitIvemId | undefined) {
        if (this.litIvemIdLinked
                &&
                !this.layoutConfigLoading
                &&
                !this._desktopAccessService.brokerageAccountGroupOrLitIvemIdSetting
                &&
                litIvemId !== undefined
                &&
                !LitIvemId.isUndefinableEqual(litIvemId, this._desktopAccessService.litIvemId)) {
            this._desktopAccessService.setLitIvemId(litIvemId, this);
            return true;
        } else {
            return false;
        }
    }

    private setLitIvemIdLinked(value: boolean) {
        if (value !== this._litIvemIdLinked) {
            this._litIvemIdLinked = value;
            if (!this.layoutConfigLoading && this._litIvemIdLinked) {
                const desktopLitIvemId = this.desktopAccessService.litIvemId;
                const same = LitIvemId.isUndefinableEqual(desktopLitIvemId, this._litIvemId);
                if (!same) {
                    if (desktopLitIvemId === undefined) {
                        this._desktopAccessService.setLitIvemId(this._litIvemId, this);
                    } else {
                        this.setLitIvemId(desktopLitIvemId, undefined);
                    }
                }
            }
            this._ditemComponentAccess.processSymbolLinkedChanged();
        }
    }

    private getLitIvemIdValid() {
        return this._litIvemId !== undefined;
    }
    private getOldLitIvemIdValid() {
        return this._oldLitIvemId !== undefined;
    }

    private setCurrentFocusedBrokerageAccountGroup(group: BrokerageAccountGroup) {
        this._currentFocusedBrokerageAccountGroup = group;
        this._lastFocusedBrokerageAccountGroup = this._currentFocusedBrokerageAccountGroup;
        if (this._ditemComponentAccess.focused) {
            this._desktopAccessService.setLastFocusedBrokerageAccountGroup(this._lastFocusedBrokerageAccountGroup);
        }
    }

    private setBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, initiatingFrame: DitemFrame | undefined) {
        const selfInitiated = (initiatingFrame !== undefined && initiatingFrame.frameId === this.frameId);
        const applied = this.applyBrokerageAccountGroup(group, selfInitiated);
        if (applied && group !== undefined) {
            this.setCurrentFocusedBrokerageAccountGroup(group);
        }
    }

    private trySetDesktopBrokerageAccountGroup(group: BrokerageAccountGroup | undefined) {
        if (this.brokerageAccountGroupLinked
                &&
                !this.layoutConfigLoading
                &&
                !this._desktopAccessService.brokerageAccountGroupOrLitIvemIdSetting
                &&
                group !== undefined
                &&
                !BrokerageAccountGroup.isUndefinableEqual(group, this._desktopAccessService.brokerageAccountGroup)) {
            this._desktopAccessService.setBrokerageAccountGroup(group, this);
            return true;
        } else {
            return false;
        }
    }

    private setBrokerageAccountGroupLinked(value: boolean) {
        if (value !== this._brokerageAccountGroupLinked) {
            this._brokerageAccountGroupLinked = value;
            if (!this.layoutConfigLoading && this._brokerageAccountGroupLinked) {
                const desktopGroup = this.desktopAccessService.brokerageAccountGroup;
                if (!BrokerageAccountGroup.isUndefinableEqual(this._brokerageAccountGroup, desktopGroup)) {
                    if (desktopGroup === undefined) {
                        this._desktopAccessService.setBrokerageAccountGroup(this._brokerageAccountGroup, this);
                    } else {
                        if (desktopGroup.isSingle() || this._allBrokerageAccountGroupSupported) {
                            this.setBrokerageAccountGroup(desktopGroup, this);
                        } else {
                            const lastSingleBrokerageAccountGroup = this._desktopAccessService.lastSingleBrokerageAccountGroup;
                            if (lastSingleBrokerageAccountGroup !== undefined) {
                                this.setBrokerageAccountGroup(this._desktopAccessService.lastSingleBrokerageAccountGroup, undefined);
                            }
                        }
                    }
                }
            }
            this._ditemComponentAccess.processBrokerageAccountGroupLinkedChanged();
        }
    }
}

export namespace DitemFrame {
    export interface TypeId {
        readonly extensionHandle: ExtensionHandle;
        readonly name: string;
    }

    export namespace TypeId {
        export function create(extensionHandle: ExtensionHandle, name: string): TypeId {
            return {
                extensionHandle,
                name,
            };
        }

        export function isEqual(left: TypeId, right: TypeId) {
            return left.extensionHandle === right.extensionHandle && left.name === right.name;
        }
    }

    export namespace DitemDefault {
        export const litIvemIdLinked = false;
        export const brokerageAccountGroupLinked = false;
        export const litIvemId = undefined;
        export const brokerageAccountGroup = undefined;
        export const primary = false;
    }

    export interface ComponentAccess {
        readonly container: ComponentContainer;
        readonly focused: boolean;

        focus(): void;
        blur(): void;

        processSymbolLinkedChanged(): void;
        processBrokerageAccountGroupLinkedChanged(): void;
        processPrimaryChanged(): void;
    }

    export interface DesktopAccessService {
        readonly lastSingleBrokerageAccountGroup: BrokerageAccountGroup | undefined;

        initialLoadedEvent: DesktopAccessService.InitialLoadedEvent;

        readonly litIvemId: LitIvemId | undefined;
        readonly brokerageAccountGroup: BrokerageAccountGroup | undefined;
        readonly brokerageAccountGroupOrLitIvemIdSetting: boolean;

        flagLayoutSaveRequired(): void;
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
}
