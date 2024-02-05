/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Injector, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import {
    AssertInternalError,
    CommandRegisterService,
    EnumInfoOutOfOrderError,
    EnumUiAction,
    ExplicitElementsEnumUiAction,
    IconButtonUiAction,
    Integer,
    MultiEvent,
    ScanConditionSet,
    ScanField,
    ScanFieldCondition,
    StringId,
    Strings,
    UnreachableCaseError,
    UsableListChangeType,
    UsableListChangeTypeId,
} from '@motifmarkets/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { CaptionedRadioNgComponent, EnumInputNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../../../../../../../ng/content-component-base-ng.directive';
import { ScanFieldEditorFrame } from '../scan-field-editor-frame';

@Component({
    selector: 'app-scan-field-editor',
    templateUrl: './scan-field-editor-ng.component.html',
    styleUrls: ['./scan-field-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanFieldEditorNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    @ViewChild('requiresAllControl', { static: true }) private _requiresAllControlComponent: CaptionedRadioNgComponent;
    @ViewChild('requiresAnyControl', { static: true }) private _requiresAnyControlComponent: CaptionedRadioNgComponent;
    @ViewChild('requiresExactly1Of2Control', { static: true }) private _requiresExactly1Of2ControlComponent: CaptionedRadioNgComponent;
    @ViewChild('removeMeControl', { static: true }) private _removeMeControlComponent: SvgButtonNgComponent;
    @ViewChild('addConditionControl', { static: true }) private _addConditionControlComponent: EnumInputNgComponent;
    @ViewChild('conditionsContainer', { read: ViewContainerRef, static: true }) private _conditionsContainer: ViewContainerRef;

    public fieldNameLabel = Strings[StringId.FieldName];
    public requiresLabel = Strings[StringId.Requires];
    public conditionsLabel = Strings[StringId.Conditions];
    public requiresRadioName: string;

    private _frame: ScanFieldEditorFrame | undefined;
    private _frameChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _frameFieldsListChangeSubscriptionId: MultiEvent.SubscriptionId;

    private _fieldName = '';

    private readonly _requiresUiAction: ExplicitElementsEnumUiAction;
    private readonly _removeMeUiAction: IconButtonUiAction;
    private readonly _addConditionUiAction: ExplicitElementsEnumUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        private readonly _injector: Injector,
        commandRegisterNgService: CommandRegisterNgService,
    ) {
        super(elRef, ++ScanFieldEditorNgComponent.typeInstanceCreateCount);

        const commandRegisterService = commandRegisterNgService.service;

        this.requiresRadioName = this.generateInstancedRadioName('requiresRadioName');
        this._requiresUiAction = this.createRequiresUiAction();
        this._removeMeUiAction = this.createRemoveMeUiAction(commandRegisterService);
        this._addConditionUiAction = this.createAddConditionUiAction();

        // remove these when ScanConditionSet properly used
        this._requiresUiAction.pushValue(ScanConditionSet.BooleanOperationId.And);
        this._removeMeUiAction.pushValue(false);
    }

    public get fieldName() { return this._fieldName }

    ngOnDestroy(): void {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this.initialiseComponents();
    }

    setFrame(value: ScanFieldEditorFrame | undefined, finalise: boolean) {
        const wasPreviouslyUndefined = this.disconnectFromFrame();

        if (value === undefined) {
            this.pushUndefined();
        } else {
            this.connectToFrame(value);
            this.pushAddConditionElements(value.supportedOperatorIds);
            this.pushProperties(value);
            this.loadConditions(value.conditions);

            if (wasPreviouslyUndefined) {
                this._requiresUiAction.pushValidOrMissing();
                this._addConditionUiAction.pushValidOrMissing();
            }
        }
    }

    private initialiseComponents() {
        this._requiresAllControlComponent.initialiseEnum(this._requiresUiAction, ScanField.BooleanOperationId.And);
        this._requiresAnyControlComponent.initialiseEnum(this._requiresUiAction, ScanField.BooleanOperationId.Or);
        this._requiresExactly1Of2ControlComponent.initialiseEnum(this._requiresUiAction, ScanField.BooleanOperationId.Xor);
        this._removeMeControlComponent.initialise(this._removeMeUiAction);
        this._addConditionControlComponent.initialise(this._addConditionUiAction);
    }

    private finalise() {
        if (this._frame !== undefined) {
            this.disconnectFromFrame();
        }
        this._requiresUiAction.finalise();
        this._removeMeUiAction.finalise();
        this._addConditionUiAction.finalise();
    }

    private connectToFrame(frame: ScanFieldEditorFrame) {
        this._frame = frame;
        this._frameChangedSubscriptionId = this._frame.subscribeChangedEvent(() => this.pushProperties(frame))
        this._frameFieldsListChangeSubscriptionId = this._frame.conditions.subscribeListChangeEvent(
            (listChangeTypeId, idx, count) => this.processConditionsListChange(listChangeTypeId, idx, count)
        );
    }

    private disconnectFromFrame() {
        if (this._frame === undefined) {
            return true;
        } else {
            this._frame.unsubscribeChangedEvent(this._frameChangedSubscriptionId);
            this._frameChangedSubscriptionId = undefined;
            this._frame.conditions.unsubscribeListChangeEvent(this._frameFieldsListChangeSubscriptionId);
            this._frameFieldsListChangeSubscriptionId = undefined;
            this._frame = undefined;
            return false;
        }
    }

    private pushAddConditionElements(supportedOperatorIds: readonly ScanFieldCondition.OperatorId[]) {
        const elementPropertiesArray = supportedOperatorIds.map<EnumUiAction.ElementProperties>(
            (id) => ({
                    element: id,
                    caption: ScanFieldCondition.Operator.idToCaption(id),
                    title: ScanFieldCondition.Operator.idToTitle(id),
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

        this._requiresUiAction.pushValue(undefined);
        this._requiresUiAction.pushDisabled();

        this.pushAddConditionElements([]);
        this._addConditionUiAction.pushDisabled();

        if (this._conditionsContainer.length > 0) {
            this._conditionsContainer.clear();
        }
    }

    private pushProperties(frame: ScanFieldEditorFrame) {
        if (this._fieldName !== frame.name) {
            this._fieldName = frame.name;
            this.markForCheck();
        }

        this._requiresUiAction.pushValue(frame.conditionsOperationId);
    }

    private processConditionsListChange(listChangeTypeId: UsableListChangeTypeId, idx: number, count: number): void {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
            case UsableListChangeTypeId.PreUsableAdd:
            case UsableListChangeTypeId.PreUsableClear:
            case UsableListChangeTypeId.Usable:
                throw new AssertInternalError('SFENCPCLCU33323');
            case UsableListChangeTypeId.Insert:
                this.insertConditions(idx, count);
                break;
            case UsableListChangeTypeId.BeforeReplace:
                break;
            case UsableListChangeTypeId.AfterReplace: {
                for (let i = 0; i < count; i++) {
                    this._conditionsContainer.remove(idx);
                }
                this.insertConditions(idx, count);
                break;
            }
            case UsableListChangeTypeId.BeforeMove:
                break;
            case UsableListChangeTypeId.AfterMove: {
                const { fromIndex, toIndex, count: moveCount } = UsableListChangeType.getMoveParameters(idx); // recordIdx is actually move parameters registration index
                if (moveCount !== 1) {
                    throw new AssertInternalError('SFENCPCLCMC33323', moveCount.toString());
                } else {
                    const ref = this._conditionsContainer.get(fromIndex);
                    if (ref === null) {
                        throw new AssertInternalError('SFENCPCLCMR33323');
                    } else {
                        this._conditionsContainer.move(ref, toIndex);
                        break;
                    }
                }
            }
            case UsableListChangeTypeId.Remove:
                for (let i = 0; i < count; i++) {
                    this._conditionsContainer.remove(idx);
                }
                break;
            case UsableListChangeTypeId.Clear:
                this._conditionsContainer.clear();
                break;
            default:
                throw new UnreachableCaseError('SFENCPCLCD33323', listChangeTypeId);
        }
    }

    private createRequiresUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.pushCaption(Strings[StringId.ScanFieldEditor_Requires]);
        action.pushTitle(Strings[StringId.ScanFieldEditor_SpecifyHowManyConditionsNeedToBeMet]);
        const ids = ScanField.BooleanOperation.getAllIds();
        const elementPropertiesArray = ids.map<EnumUiAction.ElementProperties>(
            (id) => ({
                    element: id,
                    caption: ScanField.BooleanOperation.idToCaption(id),
                    title: ScanField.BooleanOperation.idToTitle(id),
                }
            )
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => {
            if (this._frame === undefined) {
                throw new AssertInternalError('SFENCCRUA44453');
            } else {
                this._frame.conditionsOperationId = this._addConditionUiAction.definedValue;
                this.markForCheck();
            }
        }

        return action;
    }

    private createRemoveMeUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.ScanFieldEditor_RemoveMe;
        const displayId = StringId.ScanFieldEditor_RemoveMe;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.DeleteField]);
        action.pushIcon(IconButtonUiAction.IconId.Delete);
        action.pushUnselected();
        action.signalEvent = () => {
            if (this._frame === undefined) {
                throw new AssertInternalError('SFENCCRMUA43211');
            } else {
                this._frame.remove();
            }
        };

        return action;
    }

    private createAddConditionUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.pushCaption(Strings[StringId.ScanFieldEditor_Add]);
        action.pushTitle(Strings[StringId.ScanFieldEditor_AddCondition]);
        action.commitEvent = () => {
            if (this._frame === undefined) {
                throw new AssertInternalError('SFENCCACUA43211');
            } else {
                this._frame.addCondition(this._addConditionUiAction.definedValue);
            }
        }

        return action;
    }

    private insertConditions(index: Integer, count: Integer) {
        const frame = this._frame;
        if (frame === undefined) {
            throw new AssertInternalError('SFENCIC39872');
        } else {
            const afterRangeIdx = index + count;
            for (let i = index; i < afterRangeIdx; i++) {
                this.insertCondition(frame, i);
            }
        }
    }

    private insertCondition(frame: ScanFieldEditorFrame, index: Integer) {
        const conditionFrame = frame.conditions.getAt(index);
        const conditionViewRef = this.createConditionComponent(conditionFrame.operandsTypeId, conditionFrame);
        this._conditionsContainer.insert(conditionViewRef, index);
    }

    private markForCheck() {
        this._cdr.markForCheck();
    }
}

export namespace ScanFieldEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export namespace SetOperation {
        export type Id = ScanConditionSet.BooleanOperationId;

        interface Info {
            readonly id: Id;
            readonly captionId: StringId;
            readonly titleId: StringId;
        }

        type InfosObject = { [id in keyof typeof ScanConditionSet.BooleanOperationId]: Info };
        const infosObject: InfosObject = {
            Or: {
                id: ScanConditionSet.BooleanOperationId.Or,
                captionId: StringId.ConditionSetScanFormulaViewNgComponent_SetOperationCaption_Any,
                titleId: StringId.ConditionSetScanFormulaViewNgComponent_SetOperationTitle_Any,
            },
            And: {
                id: ScanConditionSet.BooleanOperationId.And,
                captionId: StringId.ConditionSetScanFormulaViewNgComponent_SetOperationCaption_All,
                titleId: StringId.ConditionSetScanFormulaViewNgComponent_SetOperationTitle_All,
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                if (info.id !== i as ScanConditionSet.BooleanOperationId) {
                    throw new EnumInfoOutOfOrderError('ConditionSetScanFormulaViewNgComponent.SetOperationId', i, Strings[info.captionId]);
                }
            }
        }

        export function getAllIds() {
            return infos.map((info) => info.id);
        }

        export function idToCaptionId(id: Id) {
            return infos[id].captionId;
        }

        export function idToCaption(id: Id) {
            return Strings[idToCaptionId(id)];
        }

        export function idToTitleId(id: Id) {
            return infos[id].captionId;
        }

        export function idToTitle(id: Id) {
            return Strings[idToTitleId(id)];
        }
    }

    export const enum ConditionKindId {
        Compare,
        InRange,
        Equals,
        Includes,
        Contains,
        Has,
        Is,
        All,
        None,
    }

    export namespace ConditionKind {
        export type Id = ConditionKindId;

        interface Info {
            readonly id: Id;
            readonly captionId: StringId;
            readonly titleId: StringId;
        }

        type InfosObject = { [id in keyof typeof ConditionKindId]: Info };
        const infosObject: InfosObject = {
            Compare: {
                id: ConditionKindId.Compare,
                captionId: StringId.ConditionSetScanFormulaViewNgComponent_ConditionKindCaption_Compare,
                titleId: StringId.ConditionSetScanFormulaViewNgComponent_ConditionKindTitle_Compare,
            },
            InRange: {
                id: ConditionKindId.InRange,
                captionId: StringId.ConditionSetScanFormulaViewNgComponent_ConditionKindCaption_InRange,
                titleId: StringId.ConditionSetScanFormulaViewNgComponent_ConditionKindTitle_InRange,
            },
            Equals: {
                id: ConditionKindId.Equals,
                captionId: StringId.ConditionSetScanFormulaViewNgComponent_ConditionKindCaption_Equals,
                titleId: StringId.ConditionSetScanFormulaViewNgComponent_ConditionKindTitle_Equals,
            },
            Includes: {
                id: ConditionKindId.Includes,
                captionId: StringId.ConditionSetScanFormulaViewNgComponent_ConditionKindCaption_Includes,
                titleId: StringId.ConditionSetScanFormulaViewNgComponent_ConditionKindTitle_Includes,
            },
            Contains: {
                id: ConditionKindId.Contains,
                captionId: StringId.ConditionSetScanFormulaViewNgComponent_ConditionKindCaption_Contains,
                titleId: StringId.ConditionSetScanFormulaViewNgComponent_ConditionKindTitle_Contains,
            },
            Has: {
                id: ConditionKindId.Has,
                captionId: StringId.ConditionSetScanFormulaViewNgComponent_ConditionKindCaption_Has,
                titleId: StringId.ConditionSetScanFormulaViewNgComponent_ConditionKindTitle_Has,
            },
            Is: {
                id: ConditionKindId.Is,
                captionId: StringId.ConditionSetScanFormulaViewNgComponent_ConditionKindCaption_Is,
                titleId: StringId.ConditionSetScanFormulaViewNgComponent_ConditionKindTitle_Is,
            },
            All: {
                id: ConditionKindId.All,
                captionId: StringId.ConditionSetScanFormulaViewNgComponent_ConditionKindCaption_All,
                titleId: StringId.ConditionSetScanFormulaViewNgComponent_ConditionKindTitle_All,
            },
            None: {
                id: ConditionKindId.None,
                captionId: StringId.ConditionSetScanFormulaViewNgComponent_ConditionKindCaption_None,
                titleId: StringId.ConditionSetScanFormulaViewNgComponent_ConditionKindTitle_None,
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                if (info.id !== i as ConditionKindId) {
                    throw new EnumInfoOutOfOrderError('ConditionSetScanFormulaViewNgComponent.ConditionKindId', i, Strings[info.captionId]);
                }
            }
        }

        export function getAllIds() {
            return infos.map((info) => info.id);
        }

        export function idToCaptionId(id: Id) {
            return infos[id].captionId;
        }

        export function idToCaption(id: Id) {
            return Strings[idToCaptionId(id)];
        }

        export function idToTitleId(id: Id) {
            return infos[id].captionId;
        }

        export function idToTitle(id: Id) {
            return Strings[idToTitleId(id)];
        }
    }
}

