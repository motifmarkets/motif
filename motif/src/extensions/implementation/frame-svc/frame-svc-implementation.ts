/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, BrokerageAccountGroup, CommandRegisterService, ExtensionHandle, JsonElement, JsonValue, LitIvemId, SymbolsService } from '@motifmarkets/motif-core';
import { DesktopAccessService, DitemFrame, ExtensionDitemFrame } from 'ditem-internal-api';
import { ComponentContainer } from 'golden-layout';
import {
    BrokerageAccountGroup as BrokerageAccountGroupApi,
    FrameSvc,
    JsonElement as JsonElementApi,
    LitIvemId as LitIvemIdApi
} from '../../api/extension-api';
import { BrokerageAccountGroupImplementation, LitIvemIdImplementation } from '../exposed/adi/internal-api';
import { JsonElementImplementation } from '../exposed/internal-api';
import { ApiContentComponentFactory } from './api-content-component-factory';
import { ApiControlComponentFactory } from './api-control-component-factory';
import { ContentSvcImplementation } from './content-svc-implementation';
import { ControlsSvcImplementation } from './controls-svc-implementation';

export class FrameSvcImplementation implements FrameSvc, ExtensionDitemFrame.ComponentAccess {
    savePersistStateEventer: FrameSvc.SavePersistStateEventHandler | undefined;
    shownEventer: FrameSvc.ShownEventHandler | undefined;
    hiddenEventer: FrameSvc.HiddenEventHandler | undefined;
    focusedEventer: FrameSvc.FocusedEventHandler | undefined;
    blurredEventer: FrameSvc.BlurredEventHandler | undefined;
    resizedEventer: FrameSvc.ResizedEventHandler | undefined;
    applySymbolEventer: FrameSvc.ApplySymbolEventHandler | undefined;
    symbolLinkedChangedEventer: FrameSvc.SymbolLinkedChangedEventHandler | undefined;
    applyBrokerageAccountGroupEventer: FrameSvc.ApplyBrokerageAccountGroupEventHandler | undefined;
    brokerageAccountGroupLinkedChangedEventer: FrameSvc.BrokerageAccountGroupLinkedChangedEventHandler | undefined;
    primaryChangedEventer: FrameSvc.PrimaryChangedEventHandler | undefined;

    private readonly _ditemFrame: ExtensionDitemFrame;
    private readonly _controlsSvc: ControlsSvcImplementation;
    private readonly _contentSvc: ContentSvcImplementation;

    private _initialPersistState: JsonElementApi | undefined;
    private _focused = false;

    constructor(
        extensionHandle: ExtensionHandle,
        frameTypeName: string,
        private readonly _container: ComponentContainer,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        apiControlComponentFactory: ApiControlComponentFactory,
        apiContentComponentFactory: ApiContentComponentFactory,
    ) {
        const ditemTypeId = DitemFrame.TypeId.create(extensionHandle, frameTypeName);
        this._ditemFrame = new ExtensionDitemFrame(ditemTypeId, this,
            commandRegisterService, desktopAccessService, symbolsService, adiService
        );

        this._container.addEventListener('show', this._containerShowEventListener);
        this._container.addEventListener('hide', this._containerHideEventListener);
        this._container.addEventListener('focus', this._containerFocusEventListener);
        this._container.addEventListener('blur', this._containerBlurEventListener);
        this._container.addEventListener('resize', this._containerResizeEventListener);

        this.initialiseFocusDetectionHandling();

        this._controlsSvc = new ControlsSvcImplementation(apiControlComponentFactory);
        this._contentSvc = new ContentSvcImplementation(apiContentComponentFactory);

        this.loadInitialPersistState(this._container.initialState);
    }

    get ditemFrame() { return this._ditemFrame; }
    get container() { return this._container; }
    get shown() { return !this._container.isHidden; }
    get focused() { return this._focused; }

    get extensionHandle() { return this._ditemFrame.extensionHandle; }
    get frameTypeName() { return this._ditemFrame.typeName; }
    get width() {
        const width = this._container.width;
        return width === null ? 0 : width;
    }
    get height() {
        const height = this._container.height;
        return height === null ? 0 : height;
    }

    get controlsSvc() { return this._controlsSvc; }
    get contentSvc() { return this._contentSvc; }

    get initialPersistState() { return this._initialPersistState; }

    get litIvemId() {
        const actual = this._ditemFrame.litIvemId;
        return actual === undefined ? undefined : LitIvemIdImplementation.toApi(actual);
    }
    get oldlitIvemId() {
        const actual = this._ditemFrame.oldlitIvemId;
        return actual === undefined ? undefined : LitIvemIdImplementation.toApi(actual);
    }

    get litIvemIdValid() { return this._ditemFrame.litIvemIdLinkable; }
    get oldlitIvemIdValid() { return this._ditemFrame.oldlitIvemIdValid; }

    get brokerageAccountGroup() {
        const actual = this._ditemFrame.brokerageAccountGroup;
        return actual === undefined ? undefined : BrokerageAccountGroupImplementation.toApi(actual);
    }
    get oldbrokerageAccountGroup() {
        const actual = this._ditemFrame.oldbrokerageAccountGroup;
        return actual === undefined ? undefined : BrokerageAccountGroupImplementation.toApi(actual);
    }

    get tabText() { return this._container.title; }
    set tabText(value: string) { this._container.setTitle(value); }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get litIvemIdLinkable() { return this._ditemFrame.litIvemIdLinkable; }
    set litIvemIdLinkable(value: boolean) { this._ditemFrame.litIvemIdLinkable = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get litIvemIdLinked() { return this._ditemFrame.litIvemIdLinked; }
    set litIvemIdLinked(value: boolean) { this._ditemFrame.litIvemIdLinked = value; }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get allBrokerageAccountGroupSupported() { return this._ditemFrame.allBrokerageAccountGroupSupported; }
    set allBrokerageAccountGroupSupported(value: boolean) { this._ditemFrame.allBrokerageAccountGroupSupported = value; }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get brokerageAccountGroupLinkable() { return this._ditemFrame.brokerageAccountGroupLinkable; }
    set brokerageAccountGroupLinkable(value: boolean) { this._ditemFrame.brokerageAccountGroupLinkable = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get brokerageAccountGroupLinked() { return this._ditemFrame.brokerageAccountGroupLinked; }
    set brokerageAccountGroupLinked(value: boolean) { this._ditemFrame.brokerageAccountGroupLinked = value; }

    // readonly ditemCommandProcessor

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get primary() { return this._ditemFrame.primary; }
    set primary(value: boolean) { this._ditemFrame.primary = value; }

    destroy() {
        this._container.stateRequestEvent = undefined;

        this._container.removeEventListener('show', this._containerShowEventListener);
        this._container.removeEventListener('hide', this._containerHideEventListener);
        this._container.removeEventListener('focus', this._containerFocusEventListener);
        this._container.removeEventListener('blur', this._containerBlurEventListener);
        this._container.removeEventListener('resize', this._containerResizeEventListener);

        this.finaliseFocusDetectionHandling();

        this.destroyAllComponents();
    }

    public focus() {
        this._container.focus();
    }

    public blur() {
        this._container.blur();
    }

    public destroyAllComponents() {
        this._contentSvc.destroyAllComponents();
        this._controlsSvc.destroyAllControls();
    }

    public setLitIvemId(value: LitIvemIdApi, force?: boolean) {
        const actualLitIvemId = LitIvemIdImplementation.fromApi(value);
        this._ditemFrame.setLitIvemIdFromDitem(actualLitIvemId, force === true);
    }

    public setBrokerageAccountGroup(value: BrokerageAccountGroupApi, force?: boolean) {
        const actualBrokerageAccountGroup = BrokerageAccountGroupImplementation.fromApi(value);
        this._ditemFrame.setBrokerageAccountGroupFromDitem(actualBrokerageAccountGroup, force === true);
    }

    processSymbolLinkedChanged() {
        if (this.symbolLinkedChangedEventer !== undefined) {
            this.symbolLinkedChangedEventer();
        }
    }

    processBrokerageAccountGroupLinkedChanged() {
        if (this.brokerageAccountGroupLinkedChangedEventer !== undefined) {
            this.brokerageAccountGroupLinkedChangedEventer();
        }
    }

    processPrimaryChanged() {
        if (this.primaryChangedEventer !== undefined) {
            this.primaryChangedEventer();
        }
    }

    savePersistState(element: JsonElement) {
        if (this.savePersistStateEventer === undefined) {
            return undefined;
        } else {
            const elementApi = JsonElementImplementation.toApi(element);
            return this.savePersistStateEventer(elementApi);
        }
    }

    applyLitIvemId(litIvemId: LitIvemId | undefined, selfInitiated: boolean) {
        if (this.applySymbolEventer === undefined) {
            return false;
        } else {
            const litIvemIdApi = litIvemId === undefined ? undefined : LitIvemIdImplementation.toApi(litIvemId);
            return this.applySymbolEventer(litIvemIdApi, selfInitiated);
        }
    }

    applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean) {
        if (this.applyBrokerageAccountGroupEventer === undefined) {
            return false;
        } else {
            const groupApi = group === undefined ? undefined : BrokerageAccountGroupImplementation.toApi(group);
            return this.applyBrokerageAccountGroupEventer(groupApi, selfInitiated);
        }
    }

    private _containerShowEventListener = () => this.handleContainerShowEvent();
    private _containerHideEventListener = () => this.handleContainerHideEvent();
    private _containerFocusEventListener = () => this.handleContainerFocusEvent();
    private _containerBlurEventListener = () => this.handleContainerBlurEvent();
    private _containerResizeEventListener = () => this.handleContainerResizeEvent();

    private _containerElementClickListener = () => this.focus();
    private _containerElementFocusinListener = () => this.focus();

    private handleContainerShowEvent() {
        if (this.shownEventer !== undefined) {
            this.shownEventer();
        }
    }

    private handleContainerHideEvent() {
        if (this.hiddenEventer !== undefined) {
            this.hiddenEventer();
        }
    }

    private handleContainerFocusEvent() {
        this._focused = false;
        if (this.focusedEventer !== undefined) {
            this.focusedEventer();
        }
    }

    private handleContainerBlurEvent() {
        this._focused = false;
        if (this.blurredEventer !== undefined) {
            this.blurredEventer();
        }
    }

    private handleContainerResizeEvent() {
        this._focused = false;
        if (this.resizedEventer !== undefined) {
            this.resizedEventer();
        }
    }

    private initialiseFocusDetectionHandling() {
        this._container.element.addEventListener('click', this._containerElementClickListener, { capture: true });
        this._container.element.addEventListener('focusin', this._containerElementFocusinListener, { capture: true });
    }

    private finaliseFocusDetectionHandling() {
        this._container.element.removeEventListener('click', this._containerElementClickListener);
        this._container.element.removeEventListener('focusin', this._containerElementFocusinListener);
    }

    private loadInitialPersistState(value: JsonValue | undefined) {
        if (value === undefined) {
            this._initialPersistState = undefined;
            this._ditemFrame.constructLoad(undefined);
        } else {
            if (!JsonValue.isJson(value)) {
                this._initialPersistState = undefined;
                this._ditemFrame.constructLoad(undefined);
            } else {
                const element = new JsonElement(value);
                this._ditemFrame.constructLoad(element);
                this._initialPersistState = JsonElementImplementation.toApi(element);
            }
        }
    }
}

export namespace FrameSvcImplementation {
}
