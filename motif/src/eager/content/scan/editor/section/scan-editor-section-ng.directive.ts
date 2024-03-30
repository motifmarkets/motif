/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Directive } from '@angular/core';
import { MultiEvent, ScanEditor } from '@motifmarkets/motif-core';
import { ComponentBaseNgDirective } from '../../../../component/ng-api';
import { ExpandableCollapsibleLinedHeadingNgComponent } from '../../../expandable-collapsible-lined-heading/ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Directive()
export abstract class ScanEditorSectionNgDirective extends ContentComponentBaseNgDirective {
    protected _sectionHeadingComponent: ExpandableCollapsibleLinedHeadingNgComponent;

    private _scanEditor: ScanEditor | undefined;

    private _scanEditorFieldChangesSubscriptionId: MultiEvent.SubscriptionId | undefined;
    private _scanEditorLifeCycleStateChangeSubscriptionId: MultiEvent.SubscriptionId | undefined;
    private _scanEditorModifiedStateChangeSubscriptionId: MultiEvent.SubscriptionId | undefined;

    public abstract sectionHeadingText: string;

    get expandCollapseRestoreStateId() { return this._sectionHeadingComponent.stateId; }
    get scanEditor() { return this._scanEditor; }

    initialiseSectionHeadingComponent() {
        this._sectionHeadingComponent.expandEventer = () => this.processExpandCollapseRestoreStateChanged();
        this._sectionHeadingComponent.restoreEventer = () => this.processExpandCollapseRestoreStateChanged();
        this._sectionHeadingComponent.collapseEventer = () => this.processExpandCollapseRestoreStateChanged();
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
                (fieldIds, fieldChanger) => { this.processFieldChanges(fieldIds, fieldChanger); }
            );
            this._scanEditorLifeCycleStateChangeSubscriptionId = this._scanEditor.subscribeLifeCycleStateChangeEvents(
                () => { this.processLifeCycleStateChange(); }
            );
            this._scanEditorModifiedStateChangeSubscriptionId = this._scanEditor.subscribeModifiedStateChangeEvents(
                () => { this.processModifiedStateChange(); }
            );
        }
    }

    protected abstract processExpandCollapseRestoreStateChanged(): void;

    protected abstract processFieldChanges(fieldIds: readonly ScanEditor.FieldId[], fieldChanger: ComponentBaseNgDirective.InstanceId | undefined): void;
    protected abstract processLifeCycleStateChange(): void;
    protected abstract processModifiedStateChange(): void;
}
