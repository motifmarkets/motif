/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectorRef, Directive, ElementRef, InjectionToken } from '@angular/core';
import { ColorScheme, CommandRegisterService, Json, JsonElement, MultiEvent, SettingsService } from '@motifmarkets/motif-core';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemComponent } from '../ditem-component';
import { DitemFrame } from '../ditem-frame';

@Directive()
export abstract class BuiltinDitemNgComponentBaseNgDirective extends ComponentBaseNgDirective
    implements DitemFrame.ComponentAccess, DitemComponent {

    private readonly _rootHtmlElement: HTMLElement;

    private _focused = false;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private readonly _cdr: ChangeDetectorRef,
        private readonly _container: ComponentContainer,
        private readonly _elRef: ElementRef<HTMLElement>,
        private readonly _settingsService: SettingsService,
        private readonly _commandRegisterService: CommandRegisterService,
    ) {
        super();

        this._rootHtmlElement = this._elRef.nativeElement;

        this._container.stateRequestEvent = () => this.handleContainerStateRequestEvent();

        this._container.addEventListener('show', this._containerShownEventListener);
        this._container.addEventListener('hide', this._containerHideEventListener);
        this._container.addEventListener('focus', this._containerFocusEventListener);
        this._container.addEventListener('blur', this._containerBlurEventListener);

        this.initialiseFocusDetectionHandling();
    }

    get container() { return this._container; }
    get rootHtmlElement() { return this._rootHtmlElement; }
    get focused() { return this._focused; }

    protected get settingsService() { return this._settingsService; }
    protected get commandRegisterService() { return this._commandRegisterService; }
    protected get elRef() { return this._elRef; }

    abstract get ditemFrame(): BuiltinDitemFrame;
    protected abstract get stateSchemaVersion(): string;

    focus() {
        this._container.focus();
    }

    blur() {
        this._container.blur();
    }

    public processSymbolLinkedChanged() {
        // descendants can override as necessary
    }

    public processBrokerageAccountGroupLinkedChanged() {
        // descendants can override as necessary
    }

    public processPrimaryChanged() {
        // descendants can override as necessary
    }

    protected initialise() {
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(
            () => this.applySettings()
        );
        this.applySettings();
    }

    protected finalise() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);

        this._container.stateRequestEvent = undefined;

        this._container.removeEventListener('show', this._containerShownEventListener);
        this._container.removeEventListener('hide', this._containerHideEventListener);
        this._container.removeEventListener('focus', this._containerFocusEventListener);
        this._container.removeEventListener('blur', this._containerBlurEventListener);

        this.finaliseFocusDetectionHandling();
    }

    protected applySettings() {
        const containerBkgdColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.Layout_SinglePaneContent);
        this._container.element.style.setProperty('background-color', containerBkgdColor);
    }

    protected initialiseFocusDetectionHandling() {
        this._rootHtmlElement.addEventListener('click', this._containerElementClickListener, { capture: true });
        this._rootHtmlElement.addEventListener('focusin', this._containerElementFocusinListener, { capture: true });
    }

    protected finaliseFocusDetectionHandling() {
        this._rootHtmlElement.removeEventListener('click', this._containerElementClickListener);
        this._rootHtmlElement.removeEventListener('focusin', this._containerElementFocusinListener);
    }

    protected getInitialComponentStateJsonElement() {
        const json = this._container.initialState as Json | undefined;
        return json === undefined ? undefined : new JsonElement(json);
    }

    protected tryGetChildFrameJsonElement(element: JsonElement | undefined) {
        if (element === undefined) {
            return undefined;
        } else {
            const frameResult = element.tryGetElement(BuiltinDitemNgComponentBaseNgDirective.DitemJsonName.frame);
            if (frameResult.isErr()) {
                return undefined;
            } else {
                return frameResult.value;
            }
        }
    }

    protected createChildFrameJsonElement(element: JsonElement) {
        return element.newElement(BuiltinDitemNgComponentBaseNgDirective.DitemJsonName.frame);
    }

    protected tryGetStateSchemaVersion(element: JsonElement) {
        return element.tryGetString(BuiltinDitemNgComponentBaseNgDirective.DitemJsonName.schemaVersion);
    }

    protected markForCheck() {
        this._cdr.markForCheck();
    }

    protected setTitle(baseTabDisplay: string, contentName: string | undefined) {
        let title: string;
        if (contentName === undefined || contentName === '') {
            title = baseTabDisplay;
        } else {
            title = `${baseTabDisplay}: ${contentName}`;
        }
        this._container.setTitle(title);
    }

    protected processShown() {
        // descendants can override as necessary
    }

    protected processHidden() {
        // descendants can override as necessary
    }

    protected processFocused() {
        this._focused = true;
        // descendants can override as necessary
    }

    protected processBlurred() {
        this._focused = false;
        // descendants can override as necessary
    }

    private _containerShownEventListener = () => this.processShown();
    private _containerHideEventListener = () => this.processHidden();
    private _containerFocusEventListener = () => this.processFocused();
    private _containerBlurEventListener = () => this.processBlurred();

    private _containerElementClickListener = () => this.focus();
    private _containerElementFocusinListener = () => this.focus();

    private handleContainerStateRequestEvent() {
        const element = new JsonElement();
        element.setString(BuiltinDitemNgComponentBaseNgDirective.DitemJsonName.schemaVersion, this.stateSchemaVersion);
        this.save(element);
        return element.json;
    }

    protected abstract save(element: JsonElement): void;
}

export namespace BuiltinDitemNgComponentBaseNgDirective {
    export namespace DitemJsonName {
        export const frame = 'frame';
        export const schemaVersion = 'schemaVersion';
    }

    export type SaveLayoutConfigEventHandler = (this: void) => JsonElement | undefined;

    const goldenLayoutContainerTokenName = 'GoldenLayoutContainer';
    export const goldenLayoutContainerInjectionToken = new InjectionToken<ComponentContainer>(goldenLayoutContainerTokenName);
}
