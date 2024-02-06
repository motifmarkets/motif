/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, Inject, InjectionToken, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { BooleanUiAction, Integer, MultiEvent, StringId, Strings } from '@motifmarkets/motif-core';
import { SvgButtonNgComponent } from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../../../../../../../../../ng/content-component-base-ng.directive';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

@Directive({
})
export abstract class ScanFieldConditionOperandsEditorNgDirective extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    @ViewChild('removeMeTemplate', { read: TemplateRef }) protected _removeMeTemplate: TemplateRef<unknown>;
    @ViewChild('removeMeControl', { static: true }) private _removeMeControlComponent: SvgButtonNgComponent;

    private readonly _removeMeUiAction: BooleanUiAction;
    private _frameChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        elRef: ElementRef<HTMLElement>,
        typeInstanceCreateId: Integer,
        private readonly _cdr: ChangeDetectorRef,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken) protected readonly frame: ScanFieldConditionOperandsEditorFrame,

    ) {
        super(elRef, typeInstanceCreateId);

        this._removeMeUiAction = this.createRemoveMeUiAction();
        this._frameChangedSubscriptionId = this.frame.subscribeChangedEvent(() => this.pushAll());
    }

    public get affirmativeOperatorDisplayLines() { return this.frame.affirmativeOperatorDisplayLines; }
    public get valid() { return this.frame.valid; }

    ngOnDestroy(): void {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this.initialise();
    }

    protected initialise() {
        this._removeMeControlComponent.initialise(this._removeMeUiAction);
    }

    protected finalise() {
        this.frame.unsubscribeChangedEvent(this._frameChangedSubscriptionId);
        this._frameChangedSubscriptionId = undefined;
        this._removeMeUiAction.finalise();
    }

    protected pushAll() {
        this.markForCheck();
    }

    protected markForCheck() {
        this._cdr.markForCheck();
    }

    private createRemoveMeUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.ScanFieldConditionOperandsEditorCaption_RemoveMe]);
        action.pushTitle(Strings[StringId.ScanFieldConditionOperandsEditorTitle_RemoveMe]);
        action.commitEvent = () => {
            this.frame.removeMe(this.frame);
        };

        return action;
    }
}

export namespace ScanFieldConditionOperandsEditorNgDirective {
    export const frameInjectionToken = new InjectionToken<ScanFieldConditionOperandsEditorFrame>('ScanFieldConditionOperandsEditorNgDirective.FrameInjectionToken');
}
