/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Injector, OnDestroy, ViewChild } from '@angular/core';
import { BooleanUiAction, EnumInfoOutOfOrderError, IntegerExplicitElementsEnumUiAction, ScanConditionSet, StringId, Strings, delay1Tick } from '@motifmarkets/motif-core';
import { CaptionLabelNgComponent, CaptionedCheckboxNgComponent, CaptionedRadioNgComponent, IntegerEnumInputNgComponent } from 'controls-ng-api';
import { ScanFormulaViewNgDirective } from '../../scan-formula-view-ng.directive';

@Component({
    selector: 'app-condition-set-scan-formula-view',
    templateUrl: './condition-set-scan-formula-view-ng.component.html',
    styleUrls: ['./condition-set-scan-formula-view-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConditionSetScanFormulaViewNgComponent extends ScanFormulaViewNgDirective implements OnDestroy, AfterViewInit {
    @ViewChild('allControl', { static: true }) private _allControlComponent: CaptionedRadioNgComponent;
    @ViewChild('anyControl', { static: true }) private _anyControlComponent: CaptionedRadioNgComponent;
    @ViewChild('excludeControl', { static: true }) private _excludeControlComponent: CaptionedCheckboxNgComponent;
    @ViewChild('newConditionLabel', { static: true }) private _newConditionLabelComponent: CaptionLabelNgComponent;
    @ViewChild('newConditionControl', { static: true }) private _newConditionControlComponent: IntegerEnumInputNgComponent;

    private readonly _setOperationUiAction: IntegerExplicitElementsEnumUiAction;
    private readonly _excludeUiAction: BooleanUiAction;
    private readonly _newConditionUiAction: IntegerExplicitElementsEnumUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        private readonly _injector: Injector,
    ) {
        super(elRef, ++ConditionSetScanFormulaViewNgComponent.typeInstanceCreateCount);

        this._setOperationUiAction = this.createSetOperationUiAction();
        this._excludeUiAction = this.createExcludeUiAction();
        this._newConditionUiAction = this.createNewConditionUiAction();

        // remove these when ScanConditionSet properly used
        this._setOperationUiAction.pushValue(ScanConditionSet.BooleanOperationId.And);
        this._excludeUiAction.pushValue(false);
    }

    public get allAnyRadioName() { return this.generateInstancedRadioName('allAnyRadioName'); }
    public get conditionCount() { return 0; }
    public get nonConditionalReason() { return 'Too Complicated'; }
    public isConditionable() { return true; }

    ngOnDestroy(): void {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this.initialiseComponents();
    }

    private initialiseComponents() {
        this._allControlComponent.initialiseEnum(this._setOperationUiAction, ScanConditionSet.BooleanOperationId.And);
        this._anyControlComponent.initialiseEnum(this._setOperationUiAction, ScanConditionSet.BooleanOperationId.Or);
        this._excludeControlComponent.initialise(this._excludeUiAction);
        this._newConditionLabelComponent.initialise(this._newConditionUiAction);
        this._newConditionControlComponent.initialise(this._newConditionUiAction);
    }

    private finalise() {
        this._setOperationUiAction.finalise();
        this._excludeUiAction.finalise();
        this._newConditionUiAction.finalise();
    }

    private createSetOperationUiAction() {
        const action = new IntegerExplicitElementsEnumUiAction();
        action.pushCaption(Strings[StringId.ConditionSetScanFormulaViewNgComponentCaption_SetOperation]);
        action.pushTitle(Strings[StringId.ConditionSetScanFormulaViewNgComponentTitle_SetOperation]);
        const ids = ConditionSetScanFormulaViewNgComponent.SetOperation.getAllIds();
        const elementPropertiesArray = ids.map<IntegerExplicitElementsEnumUiAction.ElementProperties>(
            (id) => ({
                    element: id,
                    caption: ConditionSetScanFormulaViewNgComponent.SetOperation.idToCaption(id),
                    title: ConditionSetScanFormulaViewNgComponent.SetOperation.idToTitle(id),
                }
            )
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => {
            // todo
        }

        return action;
    }

    private createExcludeUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.Exclude]);
        action.pushTitle(Strings[StringId.ConditionSetScanFormulaViewNgComponentTitle_Exclude]);
        action.commitEvent = () => {
            // todo
        };

        return action;
    }

    private createNewConditionUiAction() {
        const action = new IntegerExplicitElementsEnumUiAction(false);
        action.pushCaption(Strings[StringId.New]);
        action.pushTitle(Strings[StringId.ConditionSetScanFormulaViewNgComponentTitle_NewCondition]);
        const ids = ConditionSetScanFormulaViewNgComponent.ConditionKind.getAllIds();
        const elementPropertiesArray = ids.map<IntegerExplicitElementsEnumUiAction.ElementProperties>(
            (id) => ({
                    element: id,
                    caption: ConditionSetScanFormulaViewNgComponent.ConditionKind.idToCaption(id),
                    title: ConditionSetScanFormulaViewNgComponent.ConditionKind.idToTitle(id),
                }
            )
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => {
            delay1Tick(() => action.pushValue(undefined));
            // todo
        }

        return action;
    }


}

export namespace ConditionSetScanFormulaViewNgComponent {
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

export namespace ConditionSetScanFormulaViewNgComponentModule {
    export function initialiseStatic() {
        ConditionSetScanFormulaViewNgComponent.SetOperation.initialise();
        ConditionSetScanFormulaViewNgComponent.ConditionKind.initialise();
    }
}
