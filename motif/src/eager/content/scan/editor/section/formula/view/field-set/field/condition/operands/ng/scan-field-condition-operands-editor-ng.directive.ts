/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, InjectionToken, OnDestroy, ViewChild } from '@angular/core';
import { CommandRegisterService, IconButtonUiAction, Integer, InternalCommand, MultiEvent, StringId, Strings } from '@motifmarkets/motif-core';
import { IdentifiableComponent } from 'component-internal-api';
import { SvgButtonNgComponent } from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../../../../../../../../../ng/content-component-base-ng.directive';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';
import { CommandRegisterNgService } from '../../../../../../../../../../../component-services/ng-api';

@Directive({
})
export abstract class ScanFieldConditionOperandsEditorNgDirective extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    @ViewChild('deleteMeControl', { static: true }) private _deleteMeControlComponent: SvgButtonNgComponent;

    protected readonly _modifier: ScanFieldConditionOperandsEditorFrame.Modifier;
    private readonly _deleteMeUiAction: IconButtonUiAction;
    private _frameChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        elRef: ElementRef<HTMLElement>,
        typeInstanceCreateId: Integer,
        private readonly _cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        protected readonly _frame: ScanFieldConditionOperandsEditorFrame,
        modifierRoot: IdentifiableComponent,
    ) {
        super(elRef, typeInstanceCreateId);

        this._modifier = {
            root: modifierRoot,
            node: this,
        };

        const commandRegisterService = commandRegisterNgService.service;
        this._deleteMeUiAction = this.createDeleteMeUiAction(commandRegisterService);
        this._frameChangedSubscriptionId = this._frame.subscribeChangedEvent((modifierNode) => this.handleFrameChangedEvent(modifierNode));
    }

    public get affirmativeOperatorDisplayLines() { return this._frame.affirmativeOperatorDisplayLines; }
    public get valid() { return this._frame.valid; }

    ngOnDestroy(): void {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this.initialise();
    }

    protected initialise() {
        this._deleteMeControlComponent.initialise(this._deleteMeUiAction);
    }

    protected finalise() {
        this._frame.unsubscribeChangedEvent(this._frameChangedSubscriptionId);
        this._frameChangedSubscriptionId = undefined;
        this._deleteMeUiAction.finalise();
    }

    protected pushAll() {
        this.markForCheck();
    }

    protected markForCheck() {
        this._cdr.markForCheck();
    }

    private createDeleteMeUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.ScanFieldCondition_DeleteMe;
        const displayId = StringId.ScanFieldConditionOperandsEditorCaption_DeleteMe;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ScanFieldConditionOperandsEditorTitle_DeleteMe]);
        action.pushIcon(IconButtonUiAction.IconId.Delete);
        action.pushUnselected();
        action.signalEvent = () => this._frame.deleteMe(this._modifier);

        return action;
    }

    private handleFrameChangedEvent(modifierNode: IdentifiableComponent) {
        if (modifierNode !== this._modifier.node) {
            this.pushAll();
        }
    }
}

export namespace ScanFieldConditionOperandsEditorNgDirective {
    export const frameInjectionToken = new InjectionToken<ScanFieldConditionOperandsEditorFrame>('ScanFieldConditionOperandsEditorNgDirective.FrameInjectionToken');
    export const modifierRootInjectionToken = new InjectionToken<IdentifiableComponent>('ScanFieldConditionOperandsEditorNgDirective.ModifierRootInjectionToken');
}
