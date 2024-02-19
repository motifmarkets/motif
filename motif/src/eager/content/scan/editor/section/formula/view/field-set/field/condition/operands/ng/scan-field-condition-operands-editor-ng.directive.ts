/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, InjectionToken, OnDestroy } from '@angular/core';
import { Integer, MultiEvent } from '@motifmarkets/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { ContentComponentBaseNgDirective } from '../../../../../../../../../../ng/content-component-base-ng.directive';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

@Directive({
})
export abstract class ScanFieldConditionOperandsEditorNgDirective extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    protected readonly _modifier: ScanFieldConditionOperandsEditorFrame.Modifier;
    private _frameChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        elRef: ElementRef<HTMLElement>,
        typeInstanceCreateId: Integer,
        private readonly _cdr: ChangeDetectorRef,
        protected readonly _frame: ScanFieldConditionOperandsEditorFrame,
        modifierRoot: ComponentInstanceId,
    ) {
        super(elRef, typeInstanceCreateId);

        this._modifier = {
            root: modifierRoot,
            node: this.instanceId,
        };

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
        // for descendants
    }

    protected finalise() {
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
}

export namespace ScanFieldConditionOperandsEditorNgDirective {
    export const frameInjectionToken = new InjectionToken<ScanFieldConditionOperandsEditorFrame>('ScanFieldConditionOperandsEditorNgDirective.FrameInjectionToken');
    export const modifierRootInjectionToken = new InjectionToken<ComponentInstanceId>('ScanFieldConditionOperandsEditorNgDirective.ModifierRootInjectionToken');
}
