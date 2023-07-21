/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Badness, ColorScheme, MultiEvent, SettingsService, StringId, StringUiAction, Strings, delay1Tick } from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { CaptionLabelNgComponent, TextInputNgComponent } from 'controls-ng-api';
import { DelayedBadnessNgComponent } from '../../../delayed-badness/ng-api';
import { ContentNgService } from '../../../ng/content-ng.service';
import { OrderRequestStepComponentNgDirective } from '../../ng/order-request-step-component-ng.directive';
import { ResultOrderRequestStepFrame } from '../result-order-request-step-frame';

@Component({
    selector: 'app-result-order-request-step',
    templateUrl: './result-order-request-step-ng.component.html',
    styleUrls: ['./result-order-request-step-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultOrderRequestStepNgComponent extends OrderRequestStepComponentNgDirective
    implements OnDestroy, AfterViewInit, ResultOrderRequestStepFrame.ComponentAccess {

    private static typeInstanceCreateCount = 0;

    @ViewChild('delayedBadness') private _delayedBadnessComponent: DelayedBadnessNgComponent;
    @ViewChild('statusLabel', { static: true }) private _statusLabelComponent: CaptionLabelNgComponent;
    @ViewChild('statusInput', { static: true }) private _statusInputComponent: TextInputNgComponent;
    @ViewChild('orderIdLabel', { static: true }) private _orderIdLabelComponent: CaptionLabelNgComponent;
    @ViewChild('orderIdInput', { static: true }) private _orderIdInputComponent: TextInputNgComponent;
    @ViewChild('errorsLabel', { static: true }) private _errorsLabelComponent: CaptionLabelNgComponent;

    public success = false;

    public errorsText = '';
    public errorsTitle = '';
    public errorsTextAreaSuccessBkgdColor: string;
    public errorsTextAreaSuccessForeColor: string;
    public errorsTextAreaErrorBkgdColor: string;
    public errorsTextAreaErrorForeColor: string;

    private readonly _settingsService: SettingsService;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    private readonly _frame: ResultOrderRequestStepFrame;

    private readonly _statusUiAction: StringUiAction;
    private readonly _orderIdUiAction: StringUiAction;
    private readonly _errorsUiAction: StringUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        private _contentService: ContentNgService
    ) {
        super(elRef, ++ResultOrderRequestStepNgComponent.typeInstanceCreateCount, cdr);

        this._settingsService = settingsNgService.service;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(
            () => this.applySettings()
        );

        this._frame = this._contentService.createResultOrderRequestStepFrame(this);

        this._statusUiAction = this.createStatusUiAction();
        this._orderIdUiAction = this.createOrderIdUiAction();
        this._errorsUiAction = this.createErrorsUiAction();

        this.applySettings();
    }

    get frame() { return this._frame; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        delay1Tick(() => this.initialiseComponents());
    }

    // Html functions
    public uiOrderIdClick() {
        // use this to display order in orders
    }

    // Component Access Methods
    public pushStatus(success: boolean, value: string) {
        this._statusUiAction.pushValue(value);

        if (success !== this.success) {
            this.success = success;
            this.markForCheck();
        }
    }

    public pushErrors(text: string, title: string) {
        this.errorsText = text;
        this.errorsTitle = title;
        this.markForCheck();
    }

    public pushOrderId(value: string) {
        this._orderIdUiAction.pushValue(value);
    }

    public setBadness(value: Badness) {
        this._delayedBadnessComponent.setBadness(value);
    }

    public hideBadnessWithVisibleDelay(badness: Badness) {
        this._delayedBadnessComponent.hideWithVisibleDelay(badness);
    }

    protected finalise() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);

        this._statusUiAction.finalise();
        this._orderIdUiAction.finalise();
        this._errorsUiAction.finalise();

        this._frame.finalise();
    }

    private applySettings() {
        const colorSettings = this._settingsService.color;
        this.errorsTextAreaSuccessBkgdColor = colorSettings.getBkgd(ColorScheme.ItemId.TextControl_Valid);
        this.errorsTextAreaSuccessForeColor = colorSettings.getFore(ColorScheme.ItemId.TextControl_Valid);
        this.errorsTextAreaErrorBkgdColor = colorSettings.getBkgd(ColorScheme.ItemId.TextControl_Error);
        this.errorsTextAreaErrorForeColor = colorSettings.getFore(ColorScheme.ItemId.TextControl_Error);
    }

    private createStatusUiAction() {
        const action = new StringUiAction();
        action.pushTitle(Strings[StringId.OrderRequestResultTitle_Status]);
        action.pushCaption(Strings[StringId.OrderRequestResultCaption_Status]);
        action.pushReadonly();
        return action;
    }

    private createOrderIdUiAction() {
        const action = new StringUiAction();
        action.pushTitle(Strings[StringId.OrderRequestResultTitle_OrderId]);
        action.pushCaption(Strings[StringId.OrderRequestResultCaption_OrderId]);
        action.pushReadonly();
        return action;
    }

    private createErrorsUiAction() {
        const action = new StringUiAction();
        action.pushTitle(Strings[StringId.OrderRequestResultTitle_Errors]);
        action.pushCaption(Strings[StringId.OrderRequestResultCaption_Errors]);
        action.pushValid();
        return action;
    }

    private initialiseComponents() {
        this._statusLabelComponent.initialise(this._statusUiAction);
        this._statusInputComponent.initialise(this._statusUiAction);
        this._orderIdLabelComponent.initialise(this._orderIdUiAction);
        this._orderIdInputComponent.initialise(this._orderIdUiAction);
        this._errorsLabelComponent.initialise(this._errorsUiAction);
        this._errorsLabelComponent.readonlyAlways = true;
    }
}
