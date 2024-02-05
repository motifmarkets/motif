/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, Inject, InjectionToken, OnDestroy, ViewChild } from '@angular/core';
import { BooleanUiAction, Integer, MultiEvent, StringId, Strings } from '@motifmarkets/motif-core';
import { SvgButtonNgComponent } from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../../../../../../../../../ng/content-component-base-ng.directive';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

@Directive()
export abstract class ScanFieldConditionOperandsEditorNgDirective extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    @ViewChild('removeMeControl', { static: true }) private _removeMeControlComponent: SvgButtonNgComponent;

    private readonly _removeMeUiAction: BooleanUiAction;
    private _frameChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        elRef: ElementRef<HTMLElement>,
        typeInstanceCreateId: Integer,
        private readonly _cdr: ChangeDetectorRef,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken) protected readonly _frame: ScanFieldConditionOperandsEditorFrame,

    ) {
        super(elRef, typeInstanceCreateId);

        this._removeMeUiAction = this.createRemoveMeUiAction();
        this._frameChangedSubscriptionId = this._frame.subscribeChangedEvent(() => this.markForCheck());
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
        this._removeMeControlComponent.initialise(this._removeMeUiAction);
    }

    protected finalise() {
        this._frame.unsubscribeChangedEvent(this._frameChangedSubscriptionId);
        this._frameChangedSubscriptionId = undefined;
        this._removeMeUiAction.finalise();
    }

    protected markForCheck() {
        this._cdr.markForCheck();
    }

    private createRemoveMeUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.ScanFieldConditionOperandsEditorCaption_RemoveMe]);
        action.pushTitle(Strings[StringId.ScanFieldConditionOperandsEditorTitle_RemoveMe]);
        action.commitEvent = () => {
            this._frame.removeMe(this._frame);
        };

        return action;
    }
}

export namespace ScanFieldConditionOperandsEditorNgDirective {
    export const frameInjectionToken = new InjectionToken<ScanFieldConditionOperandsEditorFrame>('ScanFieldConditionOperandsEditorNgDirective.FrameInjectionToken');
}
