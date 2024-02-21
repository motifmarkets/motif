/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Injector, OnDestroy, Type, ValueProvider, ViewChild, ViewContainerRef } from '@angular/core';
import {
    AssertInternalError,
    ColorScheme,
    ColorSettings,
    CommandRegisterService,
    ComparableList,
    EnumUiAction,
    ExplicitElementsEnumUiAction,
    IconButtonUiAction,
    Integer,
    InternalCommand,
    MultiEvent,
    ScanConditionSet,
    ScanField,
    ScanFieldCondition,
    SettingsService,
    StringId,
    Strings,
    UnreachableCaseError,
    UsableListChangeType,
    UsableListChangeTypeId,
    delay1Tick
} from '@motifmarkets/motif-core';
import { CommandRegisterNgService, SettingsNgService } from 'component-services-ng-api';
import { CaptionLabelNgComponent, CaptionedRadioNgComponent, EnumInputNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { ComponentBaseNgDirective } from '../../../../../../../../../component/ng-api';
import { RootAndNodeComponentInstanceIdPair } from '../../../../../../../../../component/root-and-node-component-instance-id-pair';
import { ContentComponentBaseNgDirective } from '../../../../../../../../ng/content-component-base-ng.directive';
import {
    CategoryValueScanFieldConditionOperandsEditorNgComponent,
    CurrencyOverlapsScanFieldConditionOperandsEditorNgComponent,
    DeleteScanFieldConditionNgComponent,
    ScanFieldConditionOperandsEditorNgDirective,
} from '../condition/ng-api';
import { ScanFieldConditionEditorFrame } from '../internal-api';
import { ScanFieldEditorFrame } from '../scan-field-editor-frame';

@Component({
    selector: 'app-scan-field-editor',
    templateUrl: './scan-field-editor-ng.component.html',
    styleUrls: ['./scan-field-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanFieldEditorNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    @ViewChild('requiresLabel', { static: true }) private _requiresLabelComponent: CaptionLabelNgComponent;
    @ViewChild('requiresAllControl', { static: true }) private _requiresAllControlComponent: CaptionedRadioNgComponent;
    @ViewChild('requiresAnyControl', { static: true }) private _requiresAnyControlComponent: CaptionedRadioNgComponent;
    @ViewChild('requiresExactly1Of2Control', { static: true }) private _requiresExactly1Of2ControlComponent: CaptionedRadioNgComponent;
    @ViewChild('deleteMeControl', { static: true }) private _deleteMeControlComponent: SvgButtonNgComponent;
    @ViewChild('addConditionControl', { static: true }) private _addConditionControlComponent: EnumInputNgComponent;
    @ViewChild('conditionsContainer', { read: ViewContainerRef, static: true }) private _conditionEditorFrameComponentsContainer: ViewContainerRef;

    public labelColor: string;
    public fieldNameLabel = Strings[StringId.ScanFieldEditor_FieldName];
    public conditionsLabel = Strings[StringId.ScanFieldEditor_Conditions];
    public requiresRadioName: string;

    private _frame: ScanFieldEditorFrame | undefined;
    private _frameFieldValueChangesSubscriptionId: MultiEvent.SubscriptionId;
    private _frameConditionsListChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _modifier: ScanFieldEditorFrame.Modifier;

    private _fieldName = '';
    private _valid = false;
    private _errorText = '';

    private readonly _settingsService: SettingsService;
    private readonly _colorSettings: ColorSettings;
    private readonly _requiresUiAction: ExplicitElementsEnumUiAction;
    private readonly _deleteMeUiAction: IconButtonUiAction;
    private readonly _addConditionUiAction: ExplicitElementsEnumUiAction;

    private readonly _deleteComponents = new ComparableList<DeleteScanFieldConditionNgComponent>();

    private _settingsChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        private readonly _injector: Injector,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
    ) {
        super(elRef, ++ScanFieldEditorNgComponent.typeInstanceCreateCount);

        this._settingsService = settingsNgService.service;
        this._colorSettings = this._settingsService.color;

        this._settingsChangeSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(
            () => this.handleSettingsChangeEvent()
        );

        const commandRegisterService = commandRegisterNgService.service;

        this.requiresRadioName = this.generateInstancedRadioName('requiresRadioName');
        this._requiresUiAction = this.createRequiresUiAction();
        this._deleteMeUiAction = this.createDeleteMeUiAction(commandRegisterService);
        this._addConditionUiAction = this.createAddConditionUiAction();

        // remove these when ScanConditionSet properly used
        this._requiresUiAction.pushValue(ScanConditionSet.BooleanOperationId.And);
    }

    public get frameUndefined() { return this._frame === undefined; }
    public get fieldName() { return this._fieldName }
    public get valid() { return this._valid }
    public get errorText() { return this._errorText }

    get frame() { return this._frame; }

    ngOnDestroy(): void {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this.initialiseComponents();
        delay1Tick(() => this.pushUndefined());
    }

    setRootComponentInstanceId(root: ComponentBaseNgDirective.InstanceId) {
        this._modifier = {
            root,
            node: this.instanceId,
        }
    }

    setFrame(value: ScanFieldEditorFrame | undefined, finalise: boolean) {
        const wasPreviouslyUndefined = this.disconnectFromFrame();

        if (value === undefined) {
            this.pushUndefined();
        } else {
            this.connectToFrame(value);
            this.pushAddConditionElements(value.supportedOperatorIds);
            this.pushAllProperties(value);
            this.loadConditionEditorFrames(value.conditions);

            if (wasPreviouslyUndefined) {
                this._requiresUiAction.pushValidOrMissing();
                this._addConditionUiAction.pushValidOrMissing();
            }
        }
    }

    private initialiseComponents() {
        this._requiresLabelComponent.initialise(this._requiresUiAction);
        this._requiresAllControlComponent.initialiseEnum(this._requiresUiAction, ScanField.BooleanOperationId.And);
        this._requiresAnyControlComponent.initialiseEnum(this._requiresUiAction, ScanField.BooleanOperationId.Or);
        this._requiresExactly1Of2ControlComponent.initialiseEnum(this._requiresUiAction, ScanField.BooleanOperationId.Xor);
        this._deleteMeControlComponent.initialise(this._deleteMeUiAction);
        this._addConditionControlComponent.initialise(this._addConditionUiAction);
    }

    private finalise() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangeSubscriptionId);
        this._settingsChangeSubscriptionId = undefined;
        if (this._frame !== undefined) {
            this.disconnectFromFrame();
        }
        this._requiresUiAction.finalise();
        this._deleteMeUiAction.finalise();
        this._addConditionUiAction.finalise();
    }

    private connectToFrame(frame: ScanFieldEditorFrame) {
        this._frame = frame;
        this._frameFieldValueChangesSubscriptionId = this._frame.subscribeFieldValuesChangedEvent(
            (changedFrame, valueChanges) => this.pushChangedProperties(changedFrame, valueChanges)
        );
        this._frameConditionsListChangeSubscriptionId = this._frame.conditions.subscribeListChangeEvent(
            (listChangeTypeId, idx, count) => this.processConditionsListChange(listChangeTypeId, idx, count)
        );
    }

    private disconnectFromFrame() {
        if (this._frame === undefined) {
            return true;
        } else {
            this._frame.unsubscribeFieldValuesChangedEvent(this._frameFieldValueChangesSubscriptionId);
            this._frameFieldValueChangesSubscriptionId = undefined;
            this._frame.conditions.unsubscribeListChangeEvent(this._frameConditionsListChangeSubscriptionId);
            this._frameConditionsListChangeSubscriptionId = undefined;
            this._frame = undefined;
            return false;
        }
    }

    private handleSettingsChangeEvent() {
        this.updateColor();
    }

    private pushAddConditionElements(supportedOperatorIds: readonly ScanFieldCondition.OperatorId[]) {
        const elementPropertiesArray = supportedOperatorIds.map<EnumUiAction.ElementProperties>(
            (id) => ({
                    element: id,
                    caption: ScanFieldCondition.Operator.idToDisplay(id),
                    title: ScanFieldCondition.Operator.idToDescription(id),
                }
            )
        );
        this._addConditionUiAction.pushElements(elementPropertiesArray, undefined);

    }

    private pushUndefined() {
        if (this._fieldName !== '') {
            this._fieldName = '';
            this.markForCheck();
        }

        this.updateColor();

        this._requiresUiAction.pushValue(undefined);
        this._requiresUiAction.pushDisabled();

        this.pushAddConditionElements([]);
        this._addConditionUiAction.pushDisabled();

        if (this._conditionEditorFrameComponentsContainer.length > 0) {
            this._conditionEditorFrameComponentsContainer.clear();
        }
    }

    private pushAllProperties(frame: ScanFieldEditorFrame) {
        this.pushName(frame);
        this.pushValid(frame);
        this.pushErrorText(frame);
        this.pushRequires(frame);
        this.updateColor();
    }

    private pushChangedProperties(frame: ScanFieldEditorFrame, valueChanges: ScanFieldEditorFrame.Field.ValueChange[]) {
        const count = valueChanges.length;
        for (let i = 0; i < count; i++) {
            const valueChange = valueChanges[i];
            switch (valueChange.fieldId) {
                case ScanFieldEditorFrame.FieldId.Name:
                    this.pushName(frame);
                    break;
                case ScanFieldEditorFrame.FieldId.Valid:
                    this.pushValid(frame);
                    break;
                case ScanFieldEditorFrame.FieldId.ErrorText:
                    this.pushErrorText(frame);
                    break;
                case ScanFieldEditorFrame.FieldId.ConditionsOperationId:
                    this.pushRequires(frame);
                    break;
                case ScanFieldEditorFrame.FieldId.ConditionCount:
                    // not displayed
                    break;
                default:
                    throw new UnreachableCaseError('SFENCPCP44498', valueChange.fieldId);
            }
        }
    }

    private pushName(frame: ScanFieldEditorFrame) {
        if (frame.name !== this._fieldName) {
            this._fieldName = frame.name;
            this.markForCheck();
        }
    }

    private pushValid(frame: ScanFieldEditorFrame) {
        if (frame.valid !== this._valid) {
            this._valid = frame.valid;
            this.markForCheck();
        }
    }

    private pushErrorText(frame: ScanFieldEditorFrame) {
        if (frame.errorText !== this._errorText) {
            this._errorText = frame.errorText;
            this.markForCheck();
        }
    }

    private pushRequires(frame: ScanFieldEditorFrame) {
        this._requiresUiAction.pushValue(frame.conditionsOperationId);
    }

    private processConditionsListChange(listChangeTypeId: UsableListChangeTypeId, idx: number, count: number): void {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
            case UsableListChangeTypeId.PreUsableAdd:
            case UsableListChangeTypeId.PreUsableClear:
            case UsableListChangeTypeId.Usable:
                throw new AssertInternalError('SFENCPCLCU33323', listChangeTypeId.toString());
            case UsableListChangeTypeId.Insert:
                this.insertConditionEditorFrameComponents(idx, count);
                break;
            case UsableListChangeTypeId.BeforeReplace:
                break;
            case UsableListChangeTypeId.AfterReplace: {
                this.removeConditionEditorFrameComponents(idx, count);
                this.insertConditionEditorFrameComponents(idx, count);
                break;
            }
            case UsableListChangeTypeId.BeforeMove:
                break;
            case UsableListChangeTypeId.AfterMove: {
                const { fromIndex, toIndex, count: moveCount } = UsableListChangeType.getMoveParameters(idx); // recordIdx is actually move parameters registration index
                if (moveCount !== 1) {
                    throw new AssertInternalError('SFENCPCLCMC33323', moveCount.toString());
                } else {
                    const ref = this._conditionEditorFrameComponentsContainer.get(fromIndex);
                    if (ref === null) {
                        throw new AssertInternalError('SFENCPCLCMR33323');
                    } else {
                        this._conditionEditorFrameComponentsContainer.move(ref, toIndex);
                        break;
                    }
                }
            }
            case UsableListChangeTypeId.Remove:
                this.removeConditionEditorFrameComponents(idx, count);
                break;
            case UsableListChangeTypeId.Clear:
                this._conditionEditorFrameComponentsContainer.clear();
                break;
            default:
                throw new UnreachableCaseError('SFENCPCLCD33323', listChangeTypeId);
        }
    }

    private createRequiresUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.pushCaption(Strings[StringId.ScanFieldEditor_RequiresDisplay]);
        action.pushTitle(Strings[StringId.ScanFieldEditor_RequiresDescription]);
        const ids = ScanField.BooleanOperation.allIds;
        const elementPropertiesArray = ids.map<EnumUiAction.ElementProperties>(
            (id) => (
                {
                    element: id,
                    caption: ScanField.BooleanOperation.idToDisplay(id),
                    title: ScanField.BooleanOperation.idToDescription(id),
                }
            )
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => {
            if (this._frame === undefined) {
                throw new AssertInternalError('SFENCCRUA44453');
            } else {
                this._frame.setConditionsOperationId(this._addConditionUiAction.definedValue, this._modifier);
                this.markForCheck();
            }
        }

        return action;
    }

    private createDeleteMeUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.ScanField_DeleteMe;
        const displayId = StringId.ScanFieldEditor_DeleteMeDisplay;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ScanFieldEditor_DeleteMeDescription]);
        action.pushIcon(IconButtonUiAction.IconId.Delete);
        action.pushUnselected();
        action.signalEvent = () => {
            if (this._frame === undefined) {
                throw new AssertInternalError('SFENCCRMUA43211');
            } else {
                this._frame.deleteMe(this._modifier);
            }
        };

        return action;
    }

    private createAddConditionUiAction() {
        const action = new ExplicitElementsEnumUiAction(false);
        action.pushCaption(Strings[StringId.Add]);
        action.pushPlaceholder(Strings[StringId.ScanFieldEditor_AddConditionDisplay]);
        action.pushTitle(Strings[StringId.ScanFieldEditor_AddConditionDescription]);
        action.commitEvent = () => {
            if (this._frame === undefined) {
                throw new AssertInternalError('SFENCCACUA43211');
            } else {
                this._frame.addCondition(this._addConditionUiAction.definedValue, this._modifier);
                delay1Tick(() => this._addConditionUiAction.pushValue(undefined));
            }
        }

        return action;
    }

    private loadConditionEditorFrames(conditionEditorFrames: ScanFieldConditionEditorFrame.List<ScanFieldConditionEditorFrame>) {
        this._conditionEditorFrameComponentsContainer.clear();
        const conditionCount = conditionEditorFrames.count;
        for (let i = 0; i < conditionCount; i++) {
            const frame = conditionEditorFrames.getAt(i);
            this.insertConditionEditorFrameComponent(frame, i);
        }
    }

    private insertConditionEditorFrameComponents(index: Integer, count: Integer) {
        const frame = this._frame;
        if (frame === undefined) {
            throw new AssertInternalError('SFENCIC39872');
        } else {
            const afterRangeIdx = index + count;
            for (let i = index; i < afterRangeIdx; i++) {
                const conditionFrame = frame.conditions.getAt(index);
                this.insertConditionEditorFrameComponent(conditionFrame, i);
            }
        }
    }

    private insertConditionEditorFrameComponent(frame: ScanFieldConditionEditorFrame, index: Integer) {
        const componentType = this.getScanFieldConditionOperandsEditorNgDirectiveType(frame.operandsTypeId);
        this.createAndInsertConditionOperandsEditorNgDirective(componentType, frame, index);
    }

    private getScanFieldConditionOperandsEditorNgDirectiveType(operandsTypeId: ScanFieldCondition.Operands.TypeId): Type<ScanFieldConditionOperandsEditorNgDirective> {
        switch (operandsTypeId) {
            case ScanFieldCondition.Operands.TypeId.HasValue:
            case ScanFieldCondition.Operands.TypeId.NumericComparisonValue:
            case ScanFieldCondition.Operands.TypeId.NumericValue:
            case ScanFieldCondition.Operands.TypeId.DateValue:
            case ScanFieldCondition.Operands.TypeId.NumericRange:
            case ScanFieldCondition.Operands.TypeId.DateRange:
            case ScanFieldCondition.Operands.TypeId.TextValue:
            case ScanFieldCondition.Operands.TypeId.TextContains:
            case ScanFieldCondition.Operands.TypeId.TextEnum:
                throw new Error('todo');
            case ScanFieldCondition.Operands.TypeId.CurrencyEnum:
                return CurrencyOverlapsScanFieldConditionOperandsEditorNgComponent;
            case ScanFieldCondition.Operands.TypeId.ExchangeEnum:
            case ScanFieldCondition.Operands.TypeId.MarketEnum:
            case ScanFieldCondition.Operands.TypeId.MarketBoardEnum:
                throw new Error('todo');
            case ScanFieldCondition.Operands.TypeId.CategoryValue:
                return CategoryValueScanFieldConditionOperandsEditorNgComponent;
            default:
                throw new UnreachableCaseError('SFENCGCEFCT66723', operandsTypeId);
        }
    }

    private createAndInsertConditionOperandsEditorNgDirective(
        componentType: Type<ScanFieldConditionOperandsEditorNgDirective>,
        frame: ScanFieldConditionEditorFrame,
        index: Integer,
    ) {
        const modifierRootProvider: ValueProvider = {
            provide: ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken,
            useValue: this._modifier.root,
        };

        const frameProvider: ValueProvider = {
            provide: ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken,
            useValue: frame,
        };

        const frameAndModifierRootInjector = Injector.create({
            providers: [frameProvider, modifierRootProvider],
        });

        const editorFrameComponentRef = this._conditionEditorFrameComponentsContainer.createComponent(
            componentType,
            { index: index * 2, injector: frameAndModifierRootInjector }
        );
        const editorFrameComponent = editorFrameComponentRef.instance;

        const deleteComponentRef = this._conditionEditorFrameComponentsContainer.createComponent(
            DeleteScanFieldConditionNgComponent,
            { index: index * 2 + 1 },
        );
        const deleteComponent = deleteComponentRef.instance;
        deleteComponent.deleteEventer = () => {
            const deleteModifier: RootAndNodeComponentInstanceIdPair = {
                root: this._modifier.root,
                node: editorFrameComponent.instanceId, // specify the editor frame component as the node
            };

            frame.deleteMe(deleteModifier);
        }
        this._deleteComponents.insert(index, deleteComponent);
    }

    private removeConditionEditorFrameComponents(idx: number, count: number) {
        for (let i = idx + count - 1; i >= idx; i--) {
            const deleteComponent = this._deleteComponents.getAt(i);
            deleteComponent.deleteEventer = undefined;
            this._deleteComponents.removeAtIndex(i);
            this._conditionEditorFrameComponentsContainer.remove(i * 2 + 1);
            this._conditionEditorFrameComponentsContainer.remove(i * 2);
        }
    }

    private updateColor() {
        const labelItemId = this._frame === undefined ? ColorScheme.ItemId.Label_Disabled : ColorScheme.ItemId.Label_Valid;
        const labelColor = this._colorSettings.getFore(labelItemId);
        if (labelColor !== this.labelColor) {
            this.labelColor = labelColor;
            this.markForCheck();
        }
    }

    private markForCheck() {
        this._cdr.markForCheck();
    }
}

export namespace ScanFieldEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;
}

