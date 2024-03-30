/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, InjectionToken, OnDestroy } from '@angular/core';
import { ColorScheme, ColorSettings, Integer, MultiEvent, SettingsService } from '@motifmarkets/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { ContentComponentBaseNgDirective } from '../../../../../../../../../../ng/content-component-base-ng.directive';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';
import { SettingsNgService } from 'component-services-ng-api';

@Directive({
})
export abstract class ScanFieldConditionOperandsEditorNgDirective extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    protected readonly _modifier: ScanFieldConditionOperandsEditorFrame.Modifier;
    private _frameChangedSubscriptionId: MultiEvent.SubscriptionId;

    private readonly _settingsService: SettingsService;
    private readonly _colorSettings: ColorSettings;

    private _exclamationColor: string;

    private _settingsChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        elRef: ElementRef<HTMLElement>,
        typeInstanceCreateId: Integer,
        private readonly _cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        protected readonly _frame: ScanFieldConditionOperandsEditorFrame,
        modifierRoot: ComponentInstanceId,
    ) {
        super(elRef, typeInstanceCreateId);

        this._modifier = {
            root: modifierRoot,
            node: this.instanceId,
        };

        this._settingsService = settingsNgService.service;
        this._colorSettings = this._settingsService.color;

        this._settingsChangeSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(
            () => this.updateColor()
        );

        this._frameChangedSubscriptionId = this._frame.subscribeChangedEvent((modifierNode) => this.handleFrameChangedEvent(modifierNode));

        this.updateColor();
    }

    public get affirmativeOperatorDisplayLines() { return this._frame.affirmativeOperatorDisplayLines; }
    public get valid() { return this._frame.valid; }
    public get exclamationColor() { return this._exclamationColor }

    ngOnDestroy(): void {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this.initialise();
    }

    protected initialise() {
        // for descendants
    }

    protected finalise() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangeSubscriptionId);
        this._settingsChangeSubscriptionId = undefined;
        this._frame.unsubscribeChangedEvent(this._frameChangedSubscriptionId);
        this._frameChangedSubscriptionId = undefined;
    }

    protected pushAll() {
        this.markForCheck();
    }

    protected markForCheck() {
        this._cdr.markForCheck();
    }

    private handleFrameChangedEvent(modifierNode: ComponentInstanceId) {
        if (modifierNode !== this._modifier.node) {
            this.pushAll();
        }
    }

    private updateColor() {
        const exclamationColor = this._colorSettings.getFore(ColorScheme.ItemId.Label_Error);
        if (exclamationColor !== this._exclamationColor) {
            this._exclamationColor = exclamationColor;
            this.markForCheck();
        }
    }
}

export namespace ScanFieldConditionOperandsEditorNgDirective {
    export const frameInjectionToken = new InjectionToken<ScanFieldConditionOperandsEditorFrame>('ScanFieldConditionOperandsEditorNgDirective.FrameInjectionToken');
    export const modifierRootInjectionToken = new InjectionToken<ComponentInstanceId>('ScanFieldConditionOperandsEditorNgDirective.ModifierRootInjectionToken');
}
