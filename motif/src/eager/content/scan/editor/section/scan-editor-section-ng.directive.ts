/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Directive } from '@angular/core';
import { MultiEvent, ScanEditor } from '@motifmarkets/motif-core';
import { ExpandableCollapsibleLinedHeadingNgComponent } from '../../../expandable-collapsible-lined-heading/ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Directive()
export abstract class ScanEditorSectionNgDirective extends ContentComponentBaseNgDirective {
    protected _sectionHeadingComponent: ExpandableCollapsibleLinedHeadingNgComponent;
    protected _scanEditor: ScanEditor | undefined;

    private _scanEditorFieldChangesSubscriptionId: MultiEvent.SubscriptionId | undefined;
    private _scanEditorLifeCycleStateChangeSubscriptionId: MultiEvent.SubscriptionId | undefined;
    private _scanEditorModifiedStateChangeSubscriptionId: MultiEvent.SubscriptionId | undefined;

    public abstract sectionHeadingText: string;

    initialiseSectionHeadingComponent() {
        this._sectionHeadingComponent.expandEventer = () => this.handleExpandEvent();
        this._sectionHeadingComponent.restoreEventer = () => this.handleRestoreEvent();
        this._sectionHeadingComponent.collapseEventer = () => this.handleCollapseEvent();
    }

    setEditor(value: ScanEditor | undefined) {
        if (this._scanEditor !== undefined) {
            this._scanEditor.unsubscribeFieldChangesEvents(this._scanEditorFieldChangesSubscriptionId);
            this._scanEditorFieldChangesSubscriptionId = undefined;
            this._scanEditor.unsubscribeLifeCycleStateChangeEvents(this._scanEditorLifeCycleStateChangeSubscriptionId);
            this._scanEditorFieldChangesSubscriptionId = undefined;
            this._scanEditor.unsubscribeModifiedStateChangeEvents(this._scanEditorModifiedStateChangeSubscriptionId);
            this._scanEditorFieldChangesSubscriptionId = undefined;
        }
        this._scanEditor = value;
        if (this._scanEditor !== undefined) {
            this._scanEditorFieldChangesSubscriptionId = this._scanEditor.subscribeFieldChangesEvents(
                (fieldIds) => { this.processFieldChanges(fieldIds); }
            );
            this._scanEditorLifeCycleStateChangeSubscriptionId = this._scanEditor.subscribeLifeCycleStateChangeEvents(
                () => { this.processLifeCycleStateChange(); }
            );
            this._scanEditorModifiedStateChangeSubscriptionId = this._scanEditor.subscribeModifiedStateChangeEvents(
                () => { this.processModifiedStateChange(); }
            );
        }
    }

    private handleExpandEvent() {

    }

    private handleRestoreEvent() {

    }

    private handleCollapseEvent() {

    }

    protected abstract processFieldChanges(fieldIds: readonly ScanEditor.FieldId[]): void;
    protected abstract processLifeCycleStateChange(): void;
    protected abstract processModifiedStateChange(): void;
}
