/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AllScanCondition,
    AltCodeSubFieldContainsScanCondition,
    AltCodeSubFieldHasValueScanCondition,
    AssertInternalError,
    AttributeSubFieldContainsScanCondition,
    AttributeSubFieldHasValueScanCondition,
    BooleanFieldEqualsScanCondition,
    CommandRegisterService,
    DateFieldEqualsScanCondition,
    DateFieldInRangeScanCondition,
    DateSubFieldEqualsScanCondition,
    DateSubFieldHasValueScanCondition,
    DateSubFieldInRangeScanCondition,
    Err,
    ErrorCode,
    FieldHasValueScanCondition,
    GridLayoutOrReferenceDefinition,
    Integer,
    IsScanCondition,
    JsonElement,
    LockOpenListItem,
    Logger,
    NoneScanCondition,
    NumericComparisonScanCondition,
    NumericFieldEqualsScanCondition,
    NumericFieldInRangeScanCondition,
    Ok,
    PriceSubFieldEqualsScanCondition,
    PriceSubFieldHasValueScanCondition,
    PriceSubFieldInRangeScanCondition,
    Result,
    ScanCondition,
    ScanConditionFactory,
    ScanConditionSet,
    ScanConditionSetLoadError,
    ScanConditionSetLoadErrorTypeId,
    ScanEditor,
    ScanFormula,
    ScanList,
    ScansService,
    SettingsService,
    SourceTzOffsetDateTime,
    SymbolsService,
    TextFieldContainsScanCondition,
    TextFieldIncludesScanCondition,
    UiBadnessComparableList,
    UnreachableCaseError,
} from '@motifmarkets/motif-core';
import { ScanListFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class ScansDitemFrame extends BuiltinDitemFrame {
    private _scanListFrame: ScanListFrame | undefined;
    private _scanList: ScanList | undefined;
    private _scanEditor: ScanEditor | undefined;
    private _newScanEditor: ScanEditor | undefined;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopInterface: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _scansService: ScansService,
        private readonly _opener: LockOpenListItem.Opener,
        private readonly _setEditorEventer: ScansDitemFrame.SetEditorEventer,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Scans, ditemComponentAccess,
            settingsService, commandRegisterService, desktopInterface, symbolsService, adiService
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    get initialised() { return this._scanListFrame !== undefined; }

    get scanEditor() { return this._scanEditor; }

    get filterText() {
        if (this._scanListFrame === undefined) {
            throw new AssertInternalError('SDFGFT49471');
        } else {
            return this._scanListFrame.filterText;
        }
    }
    set filterText(value: string) {
        if (this._scanListFrame === undefined) {
            throw new AssertInternalError('SDFSFT49471');
        } else {
            this._scanListFrame.filterText = value;
        }
    }

    initialise(ditemFrameElement: JsonElement | undefined, scanListFrame: ScanListFrame): void {
        this._scanListFrame = scanListFrame;

        scanListFrame.gridSourceOpenedEventer = () => {
            this._scanList = scanListFrame.scanList;
            this._scanList.suspendUnwantDetailOnScanLastClose();
        }
        scanListFrame.recordFocusedEventer = (newRecordIndex) => { this.handleScanListFrameRecordFocusedEvent(newRecordIndex); }

        let scanListFrameElement: JsonElement | undefined;
        if (ditemFrameElement !== undefined) {
            const scanListFrameElementResult = ditemFrameElement.tryGetElement(ScansDitemFrame.JsonName.scanListFrame);
            if (scanListFrameElementResult.isOk()) {
                scanListFrameElement = scanListFrameElementResult.value;
            }
        }

        scanListFrame.initialiseGrid(this.opener, undefined, true);

        const openPromise = scanListFrame.openJsonOrDefault(scanListFrameElement, true)
        openPromise.then(
            (gridSourceOrReference) => {
                if (gridSourceOrReference === undefined) {
                    throw new AssertInternalError('SDFIPU50135');
                } else {
                    this.applyLinked();
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'SDFIPR50135') }
        );
    }

    override finalise() {
        this.checkCloseActiveScanEditor();

        if (this._scanList !== undefined) {
            this._scanList.unsuspendUnwantDetailOnScanLastClose();
        }

        const scanListFrame = this._scanListFrame;
        if (scanListFrame !== undefined) {
            scanListFrame.gridSourceOpenedEventer = undefined;
            scanListFrame.recordFocusedEventer = undefined;
            scanListFrame.finalise();
            this._scanListFrame = undefined;
        }
        super.finalise();
    }

    override save(ditemFrameElement: JsonElement) {
        super.save(ditemFrameElement);

        const scanListFrame = this._scanListFrame;
        if (scanListFrame === undefined) {
            throw new AssertInternalError('SDFS29974');
        } else {
            const scanListFrameElement = ditemFrameElement.newElement(ScansDitemFrame.JsonName.scanListFrame);
            scanListFrame.save(scanListFrameElement);
        }
    }

    autoSizeAllColumnWidths(widenOnly: boolean) {
        if (this._scanListFrame === undefined) {
            throw new AssertInternalError('SDFASACW49471');
        } else {
            this._scanListFrame.autoSizeAllColumnWidths(widenOnly);
        }
    }

    newOrFocusNewScan() {
        if (this._newScanEditor === undefined) {
            this.newScan();
        } else {
            if (this._newScanEditor.lifeCycleStateId !== ScanEditor.LifeCycleStateId.NotYetCreated) {
                this._newScanEditor = undefined;
                this.newScan();
            } else {
                if (this._scanEditor !== this._newScanEditor) {
                    this.checkCloseActiveScanEditor();
                    this._scanEditor = this._newScanEditor;
                    this._setEditorEventer(this._scanEditor);
                }
            }
        }

        if (this._scanListFrame !== undefined) {
            this._scanListFrame.focusItem(undefined);
        }
    }

    newScan() {
        this.checkCloseActiveScanEditor();
        this._scanEditor = this._scansService.openNewScanEditor(this._opener, new ScansDitemFrame.ConditionSet());
        this._newScanEditor = this._scanEditor;
        this._setEditorEventer(this._scanEditor);
    }

    createAllowedFieldsGridLayoutDefinition() {
        if (this._scanListFrame === undefined) {
            throw new AssertInternalError('SDFCAFALD04418');
        } else {
            return this._scanListFrame.createAllowedFieldsGridLayoutDefinition();
        }
    }

    openGridLayoutOrReferenceDefinition(gridLayoutOrReferenceDefinition: GridLayoutOrReferenceDefinition) {
        if (this._scanListFrame === undefined) {
            throw new AssertInternalError('SLFOGLONRD04418');
        } else {
            this._scanListFrame.openGridLayoutOrReferenceDefinition(gridLayoutOrReferenceDefinition);
        }
    }

    private handleScanListFrameRecordFocusedEvent(newRecordIndex: Integer | undefined) {
        this.checkCloseActiveScanEditor();
        if (newRecordIndex !== undefined) {
            const scanList = this._scanList;
            if (scanList === undefined) {
                throw new AssertInternalError('SCFHSCFRFESLU50515');
            } else {
                const scan = scanList.getAt(newRecordIndex);
                const openResultPromise = this._scansService.tryOpenScanEditor(
                    scan.id,
                    this._opener,
                    () => new ScansDitemFrame.ConditionSet(),
                );
                openResultPromise.then(
                    (openResult) => {
                        if (openResult.isErr()) {
                            Logger.logWarning(ErrorCode.ScanEditorFrame_RecordFocusedTryOpenEditor, scan.id);
                        } else {
                            const scanEditor = openResult.value;
                            if (scanEditor === undefined) {
                                throw new AssertInternalError('SDFHSLFRFESM50515'); // should always exist
                            } else {
                                this._scanEditor = scanEditor;
                                this._setEditorEventer(scanEditor);
                            }
                        }
                    },
                    (reason) => { throw AssertInternalError.createIfNotError(reason, 'SDFHSLFRFEPR50515'); }
                )
            }
        }
    }

    private checkCloseActiveScanEditor() {
        if (this._scanEditor !== undefined) {
            this._setEditorEventer(undefined);
            this._scansService.closeScanEditor(this._scanEditor, this._opener);
            this._scanEditor = undefined;
        }
    }
}


export namespace ScansDitemFrame {
    export namespace JsonName {
        export const scanListFrame = 'scanListFrame';
    }

    export type OpenedEventHandler = (this: void) => void;
    export type SetEditorEventer = (this: void, editor: ScanEditor | undefined) => void;

    export class ConditionSet implements ScanConditionSet {
        readonly conditionFactory = new ConditionSet.ConditionFactory();

        setOperationId: ScanConditionSet.SetOperationId;
        notSetOperation: boolean;
        conditions: UiBadnessComparableList<ScanCondition>;
        loadError: ScanConditionSetLoadError | undefined;

        assign(value: ScanConditionSet): void {
            this.setOperationId = value.setOperationId;
            this.notSetOperation = value.notSetOperation;
            this.loadError = value.loadError;
            this.conditions.clear();

            const valueConditions = value.conditions;
            const conditionCount = valueConditions.count;
            this.conditions.capacity = conditionCount;
            for (let i = 0; i < conditionCount; i++) {
                const valueCondition = valueConditions.getAt(i);
                const copiedCondition = this.createCopyOfCondition(valueCondition);
                this.conditions.add(copiedCondition);
            }
        }

        private createCopyOfCondition(condition: ScanCondition): ScanCondition {
            const typeId = condition.typeId;
            switch(condition.typeId) {
                case ScanCondition.TypeId.NumericComparison: {
                    const originalCondition = condition as NumericComparisonScanCondition;
                    const originalLeftOperand = originalCondition.leftOperand;
                    const originalRightOperand = originalCondition.rightOperand;

                    let copiedRightOperand: NumericComparisonScanCondition.TypedOperand;
                    switch (originalRightOperand.typeId) {
                        case NumericComparisonScanCondition.TypedOperand.TypeId.Number: {
                            const copiedTypedOperand: NumericComparisonScanCondition.NumberTypedOperand = {
                                typeId: NumericComparisonScanCondition.TypedOperand.TypeId.Number,
                                value: (originalRightOperand as NumericComparisonScanCondition.NumberTypedOperand).value,
                            };
                            copiedRightOperand = copiedTypedOperand;
                            break;
                        }
                        case NumericComparisonScanCondition.TypedOperand.TypeId.Field: {
                            const copiedTypedOperand: NumericComparisonScanCondition.FieldTypedOperand = {
                                typeId: NumericComparisonScanCondition.TypedOperand.TypeId.Field,
                                fieldId: (originalRightOperand as NumericComparisonScanCondition.FieldTypedOperand).fieldId,
                            };
                            copiedRightOperand = copiedTypedOperand;
                            break;
                        }
                        default:
                            throw new UnreachableCaseError('SDFCCOCU69111', originalRightOperand.typeId);
                    }

                    const copiedCondition: NumericComparisonScanCondition = {
                        typeId,
                        operationId: originalCondition.operationId,
                        leftOperand: {
                            fieldId: originalLeftOperand.fieldId,
                        },
                        rightOperand: copiedRightOperand,
                    }
                    return copiedCondition;
                }
                case ScanCondition.TypeId.All: {
                    const originalCondition = condition as AllScanCondition;
                    const copiedCondition: AllScanCondition = {
                        typeId: originalCondition.typeId,
                    };
                    return copiedCondition;
                }
                case ScanCondition.TypeId.None: {
                    const originalCondition = condition as NoneScanCondition;
                    const copiedCondition: NoneScanCondition = {
                        typeId: originalCondition.typeId,
                    };
                    return copiedCondition;
                }
                case ScanCondition.TypeId.Is: {
                    const originalCondition = condition as IsScanCondition;
                    const copiedCondition: IsScanCondition = {
                        typeId: originalCondition.typeId,
                        not: originalCondition.not,
                        categoryId: originalCondition.categoryId,
                    };
                    return copiedCondition;
                }
                case ScanCondition.TypeId.FieldHasValue: {
                    const originalCondition = condition as FieldHasValueScanCondition;
                    const copiedCondition: FieldHasValueScanCondition = {
                        typeId: originalCondition.typeId,
                        not: originalCondition.not,
                        fieldId: originalCondition.fieldId,
                    };
                    return copiedCondition;
                }
                case ScanCondition.TypeId.BooleanFieldEquals: {
                    const originalCondition = condition as BooleanFieldEqualsScanCondition;
                    const copiedCondition: BooleanFieldEqualsScanCondition = {
                        typeId: originalCondition.typeId,
                        not: originalCondition.not,
                        fieldId: originalCondition.fieldId,
                        target: originalCondition.target,
                    };
                    return copiedCondition;
                }
                case ScanCondition.TypeId.NumericFieldEquals: {
                    const originalCondition = condition as NumericFieldEqualsScanCondition;
                    const copiedCondition: NumericFieldEqualsScanCondition = {
                        typeId: originalCondition.typeId,
                        not: originalCondition.not,
                        fieldId: originalCondition.fieldId,
                        target: originalCondition.target,
                    };
                    return copiedCondition;
                }
                case ScanCondition.TypeId.NumericFieldInRange: {
                    const originalCondition = condition as NumericFieldInRangeScanCondition;
                    const copiedCondition: NumericFieldInRangeScanCondition = {
                        typeId: originalCondition.typeId,
                        not: originalCondition.not,
                        fieldId: originalCondition.fieldId,
                        min: originalCondition.min,
                        max: originalCondition.max,
                    };
                    return copiedCondition;
                }
                case ScanCondition.TypeId.DateFieldEquals: {
                    const originalCondition = condition as DateFieldEqualsScanCondition;
                    const copiedCondition: DateFieldEqualsScanCondition = {
                        typeId: originalCondition.typeId,
                        not: originalCondition.not,
                        fieldId: originalCondition.fieldId,
                        target: SourceTzOffsetDateTime.createCopy(originalCondition.target),
                    };
                    return copiedCondition;
                }
                case ScanCondition.TypeId.DateFieldInRange: {
                    const originalCondition = condition as DateFieldInRangeScanCondition;
                    const copiedCondition: DateFieldInRangeScanCondition = {
                        typeId: originalCondition.typeId,
                        not: originalCondition.not,
                        fieldId: originalCondition.fieldId,
                        min: SourceTzOffsetDateTime.newUndefinable(originalCondition.min),
                        max: SourceTzOffsetDateTime.newUndefinable(originalCondition.max),
                    };
                    return copiedCondition;
                }
                case ScanCondition.TypeId.TextFieldIncludes: {
                    const originalCondition = condition as TextFieldIncludesScanCondition;
                    const copiedCondition: TextFieldIncludesScanCondition = {
                        typeId: originalCondition.typeId,
                        not: originalCondition.not,
                        fieldId: originalCondition.fieldId,
                        values: originalCondition.values.slice(),
                    };
                    return copiedCondition;
                }
                case ScanCondition.TypeId.TextFieldContains: {
                    const originalCondition = condition as TextFieldContainsScanCondition;
                    const copiedCondition: TextFieldContainsScanCondition = {
                        typeId: originalCondition.typeId,
                        not: originalCondition.not,
                        fieldId: originalCondition.fieldId,
                        value: originalCondition.value,
                        asId: originalCondition.asId,
                        ignoreCase: originalCondition.ignoreCase,
                    };
                    return copiedCondition;
                }
                case ScanCondition.TypeId.PriceSubFieldHasValue: {
                    const originalCondition = condition as PriceSubFieldHasValueScanCondition;
                    const copiedCondition: PriceSubFieldHasValueScanCondition = {
                        typeId: originalCondition.typeId,
                        not: originalCondition.not,
                        fieldId: originalCondition.fieldId,
                        subFieldId: originalCondition.subFieldId,
                    };
                    return copiedCondition;
                }
                case ScanCondition.TypeId.PriceSubFieldEquals: {
                    const originalCondition = condition as PriceSubFieldEqualsScanCondition;
                    const copiedCondition: PriceSubFieldEqualsScanCondition = {
                        typeId: originalCondition.typeId,
                        not: originalCondition.not,
                        subFieldId: originalCondition.subFieldId,
                        fieldId: originalCondition.fieldId,
                        target: originalCondition.target,
                    };
                    return copiedCondition;
                }
                case ScanCondition.TypeId.PriceSubFieldInRange: {
                    const originalCondition = condition as PriceSubFieldInRangeScanCondition;
                    const copiedCondition: PriceSubFieldInRangeScanCondition = {
                        typeId: originalCondition.typeId,
                        not: originalCondition.not,
                        fieldId: originalCondition.fieldId,
                        subFieldId: originalCondition.subFieldId,
                        min: originalCondition.min,
                        max: originalCondition.max,
                    };
                    return copiedCondition;
                }
                case ScanCondition.TypeId.DateSubFieldHasValue: {
                    const originalCondition = condition as DateSubFieldHasValueScanCondition;
                    const copiedCondition: DateSubFieldHasValueScanCondition = {
                        typeId: originalCondition.typeId,
                        not: originalCondition.not,
                        fieldId: originalCondition.fieldId,
                        subFieldId: originalCondition.subFieldId,
                    };
                    return copiedCondition;
                }
                case ScanCondition.TypeId.DateSubFieldEquals: {
                    const originalCondition = condition as DateSubFieldEqualsScanCondition;
                    const copiedCondition: DateSubFieldEqualsScanCondition = {
                        typeId: originalCondition.typeId,
                        not: originalCondition.not,
                        subFieldId: originalCondition.subFieldId,
                        fieldId: originalCondition.fieldId,
                        target: SourceTzOffsetDateTime.createCopy(originalCondition.target),
                    };
                    return copiedCondition;
                }
                case ScanCondition.TypeId.DateSubFieldInRange: {
                    const originalCondition = condition as DateSubFieldInRangeScanCondition;
                    const copiedCondition: DateSubFieldInRangeScanCondition = {
                        typeId: originalCondition.typeId,
                        not: originalCondition.not,
                        fieldId: originalCondition.fieldId,
                        subFieldId: originalCondition.subFieldId,
                        min: SourceTzOffsetDateTime.newUndefinable(originalCondition.min),
                        max: SourceTzOffsetDateTime.newUndefinable(originalCondition.max),
                    };
                    return copiedCondition;
                }
                case ScanCondition.TypeId.AltCodeSubFieldHasValue: {
                    const originalCondition = condition as AltCodeSubFieldHasValueScanCondition;
                    const copiedCondition: AltCodeSubFieldHasValueScanCondition = {
                        typeId: originalCondition.typeId,
                        not: originalCondition.not,
                        fieldId: originalCondition.fieldId,
                        subFieldId: originalCondition.subFieldId,
                    };
                    return copiedCondition;
                }
                case ScanCondition.TypeId.AltCodeSubFieldContains: {
                    const originalCondition = condition as AltCodeSubFieldContainsScanCondition;
                    const copiedCondition: AltCodeSubFieldContainsScanCondition = {
                        typeId: originalCondition.typeId,
                        not: originalCondition.not,
                        fieldId: originalCondition.fieldId,
                        subFieldId: originalCondition.subFieldId,
                        value: originalCondition.value,
                        asId: originalCondition.asId,
                        ignoreCase: originalCondition.ignoreCase,
                    };
                    return copiedCondition;
                }
                case ScanCondition.TypeId.AttributeSubFieldHasValue: {
                    const originalCondition = condition as AttributeSubFieldHasValueScanCondition;
                    const copiedCondition: AttributeSubFieldHasValueScanCondition = {
                        typeId: originalCondition.typeId,
                        not: originalCondition.not,
                        fieldId: originalCondition.fieldId,
                        subFieldId: originalCondition.subFieldId,
                    };
                    return copiedCondition;
                }
                case ScanCondition.TypeId.AttributeSubFieldContains: {
                    const originalCondition = condition as AttributeSubFieldContainsScanCondition;
                    const copiedCondition: AttributeSubFieldContainsScanCondition = {
                        typeId: originalCondition.typeId,
                        not: originalCondition.not,
                        fieldId: originalCondition.fieldId,
                        subFieldId: originalCondition.subFieldId,
                        value: originalCondition.value,
                        asId: originalCondition.asId,
                        ignoreCase: originalCondition.ignoreCase,
                    };
                    return copiedCondition;
                }
            }
        }
    }

    export namespace ConditionSet {
        export class ConditionFactory implements ScanConditionFactory {
            createNumericComparison(
                formulaNode: ScanFormula.NumericComparisonBooleanNode,
                operationId: NumericComparisonScanCondition.OperationId
            ): Result<NumericComparisonScanCondition, ScanConditionSetLoadError> {
                const formulaLeftOperand = formulaNode.leftOperand;
                const formulaRightOperand = formulaNode.rightOperand;
                let possiblySwitchedFormulaLeftOperand: ScanFormula.NumericNode;
                let possiblySwitchedFormulaRightOperand: number | ScanFormula.NumericNode;
                let leftRightOperandsSwitched: boolean;

                if (typeof formulaLeftOperand !== 'number') {
                    possiblySwitchedFormulaLeftOperand = formulaLeftOperand;
                    possiblySwitchedFormulaRightOperand = formulaRightOperand;
                    leftRightOperandsSwitched = false;
                } else {
                    if (typeof formulaRightOperand !== 'number') {
                        possiblySwitchedFormulaLeftOperand = formulaRightOperand;
                        possiblySwitchedFormulaRightOperand = formulaLeftOperand;
                        leftRightOperandsSwitched = true;
                    } else {
                        return new Err( { typeId: ScanConditionSetLoadErrorTypeId.LeftAndRightNumericComparisonOperandTypesAreBothNumber, extra: '' });
                    }
                }

                if (!ScanFormula.NumericFieldValueGetNode.is(possiblySwitchedFormulaLeftOperand)) {
                    const errorTypeId = leftRightOperandsSwitched ?
                        ScanConditionSetLoadErrorTypeId.RightNumericComparisonOperandTypeIsNotSupported :
                        ScanConditionSetLoadErrorTypeId.LeftNumericComparisonOperandTypeIsNotSupported;
                    return new Err( { typeId: errorTypeId, extra: possiblySwitchedFormulaLeftOperand.typeId.toString() } );
                } else {
                    const leftConditionOperand: NumericComparisonScanCondition.FieldOperand = {
                        fieldId: possiblySwitchedFormulaLeftOperand.fieldId,
                    };

                    let rightConditionOperand: NumericComparisonScanCondition.TypedOperand;
                    if (typeof possiblySwitchedFormulaRightOperand === 'number') {
                        const numberTypedOperand: NumericComparisonScanCondition.NumberTypedOperand = {
                            typeId: NumericComparisonScanCondition.TypedOperand.TypeId.Number,
                            value: possiblySwitchedFormulaRightOperand,
                        }
                        rightConditionOperand = numberTypedOperand;
                    } else {
                        if (!ScanFormula.NumericFieldValueGetNode.is(possiblySwitchedFormulaRightOperand)) {
                            const errorTypeId = leftRightOperandsSwitched ?
                                ScanConditionSetLoadErrorTypeId.LeftNumericComparisonOperandTypeIsNotSupported :
                                ScanConditionSetLoadErrorTypeId.RightNumericComparisonOperandTypeIsNotSupported;
                            return new Err( { typeId: errorTypeId, extra: possiblySwitchedFormulaRightOperand.typeId.toString() } );
                        } else {
                            const fieldTypedOperand: NumericComparisonScanCondition.FieldTypedOperand = {
                                typeId: NumericComparisonScanCondition.TypedOperand.TypeId.Field,
                                fieldId: possiblySwitchedFormulaRightOperand.fieldId,
                            }
                            rightConditionOperand = fieldTypedOperand;
                        }
                    }

                    return new Ok({
                        typeId: ScanCondition.TypeId.NumericComparison,
                        operationId,
                        leftOperand: leftConditionOperand,
                        rightOperand: rightConditionOperand,
                    });
                }
            }
            createAll(_formulaNode: ScanFormula.AllNode): Result<AllScanCondition, ScanConditionSetLoadError> {
                return new Ok({ typeId: ScanCondition.TypeId.All });
            }
            createNone(_formulaNode: ScanFormula.NoneNode): Result<NoneScanCondition, ScanConditionSetLoadError> {
                return new Ok({ typeId: ScanCondition.TypeId.None });
            }
            createIs(formulaNode: ScanFormula.IsNode, not: boolean): Result<IsScanCondition, ScanConditionSetLoadError> {
                return new Ok({
                    typeId: ScanCondition.TypeId.Is,
                    not: formulaNode.trueFalse === not, // condition can be not if either trueFalse is false or not is true or vice versa.  Cannot be not if both the same
                    categoryId: formulaNode.categoryId,
                });
            }
            createFieldHasValue(formulaNode: ScanFormula.FieldHasValueNode, not: boolean): Result<FieldHasValueScanCondition, ScanConditionSetLoadError> {
                return new Ok({
                    typeId: ScanCondition.TypeId.FieldHasValue,
                    not,
                    fieldId: formulaNode.fieldId,
                });
            }
            createBooleanFieldEquals(formulaNode: ScanFormula.BooleanFieldEqualsNode, not: boolean): Result<BooleanFieldEqualsScanCondition, ScanConditionSetLoadError> {
                return new Ok({
                    typeId: ScanCondition.TypeId.BooleanFieldEquals,
                    not,
                    fieldId: formulaNode.fieldId,
                    target: formulaNode.target,
                });
            }
            createNumericFieldEquals(formulaNode: ScanFormula.NumericFieldEqualsNode, not: boolean): Result<NumericFieldEqualsScanCondition, ScanConditionSetLoadError> {
                return new Ok({
                    typeId: ScanCondition.TypeId.NumericFieldEquals,
                    not,
                    fieldId: formulaNode.fieldId,
                    target: formulaNode.target,
                });
            }
            createNumericFieldInRange(formulaNode: ScanFormula.NumericFieldInRangeNode, not: boolean): Result<NumericFieldInRangeScanCondition, ScanConditionSetLoadError> {
                return new Ok({
                    typeId: ScanCondition.TypeId.NumericFieldInRange,
                    not,
                    fieldId: formulaNode.fieldId,
                    min: formulaNode.min,
                    max: formulaNode.max,
                });
            }
            createDateFieldEquals(formulaNode: ScanFormula.DateFieldEqualsNode, not: boolean): Result<DateFieldEqualsScanCondition, ScanConditionSetLoadError> {
                return new Ok({
                    typeId: ScanCondition.TypeId.DateFieldEquals,
                    not,
                    fieldId: formulaNode.fieldId,
                    target: SourceTzOffsetDateTime.createCopy(formulaNode.target),
                });
            }
            createDateFieldInRange(formulaNode: ScanFormula.DateFieldInRangeNode, not: boolean): Result<DateFieldInRangeScanCondition, ScanConditionSetLoadError> {
                return new Ok({
                    typeId: ScanCondition.TypeId.DateFieldInRange,
                    not,
                    fieldId: formulaNode.fieldId,
                    min: SourceTzOffsetDateTime.newUndefinable(formulaNode.min),
                    max: SourceTzOffsetDateTime.newUndefinable(formulaNode.max),
                });
            }
            createTextFieldIncludes(formulaNode: ScanFormula.TextFieldIncludesNode, not: boolean): Result<TextFieldIncludesScanCondition, ScanConditionSetLoadError> {
                return new Ok({
                    typeId: ScanCondition.TypeId.TextFieldIncludes,
                    not,
                    fieldId: formulaNode.fieldId,
                    values: formulaNode.values.slice(),
                });
            }
            createTextFieldContains(formulaNode: ScanFormula.TextFieldContainsNode, not: boolean): Result<TextFieldContainsScanCondition, ScanConditionSetLoadError> {
                return new Ok({
                    typeId: ScanCondition.TypeId.TextFieldContains,
                    not,
                    fieldId: formulaNode.fieldId,
                    value: formulaNode.value,
                    asId: formulaNode.asId,
                    ignoreCase: formulaNode.ignoreCase,
                });
            }
            createPriceSubFieldHasValue(formulaNode: ScanFormula.PriceSubFieldHasValueNode, not: boolean): Result<PriceSubFieldHasValueScanCondition, ScanConditionSetLoadError> {
                return new Ok({
                    typeId: ScanCondition.TypeId.PriceSubFieldHasValue,
                    not,
                    fieldId: formulaNode.fieldId,
                    subFieldId: formulaNode.subFieldId,
                });
            }
            createPriceSubFieldEquals(formulaNode: ScanFormula.PriceSubFieldEqualsNode, not: boolean): Result<PriceSubFieldEqualsScanCondition, ScanConditionSetLoadError> {
                return new Ok({
                    typeId: ScanCondition.TypeId.PriceSubFieldEquals,
                    not,
                    fieldId: formulaNode.fieldId,
                    subFieldId: formulaNode.subFieldId,
                    target: formulaNode.target,
                });
            }
            createPriceSubFieldInRange(formulaNode: ScanFormula.PriceSubFieldInRangeNode, not: boolean): Result<PriceSubFieldInRangeScanCondition, ScanConditionSetLoadError> {
                return new Ok({
                    typeId: ScanCondition.TypeId.PriceSubFieldInRange,
                    not,
                    fieldId: formulaNode.fieldId,
                    subFieldId: formulaNode.subFieldId,
                    min: formulaNode.min,
                    max: formulaNode.max,
                });
            }
            createDateSubFieldHasValue(formulaNode: ScanFormula.DateSubFieldHasValueNode, not: boolean): Result<DateSubFieldHasValueScanCondition, ScanConditionSetLoadError> {
                return new Ok({
                    typeId: ScanCondition.TypeId.DateSubFieldHasValue,
                    not,
                    fieldId: formulaNode.fieldId,
                    subFieldId: formulaNode.subFieldId,
                });
            }
            createDateSubFieldEquals(formulaNode: ScanFormula.DateSubFieldEqualsNode, not: boolean): Result<DateSubFieldEqualsScanCondition, ScanConditionSetLoadError> {
                return new Ok({
                    typeId: ScanCondition.TypeId.DateSubFieldEquals,
                    not,
                    fieldId: formulaNode.fieldId,
                    subFieldId: formulaNode.subFieldId,
                    target: SourceTzOffsetDateTime.createCopy(formulaNode.target),
                });
            }
            createDateSubFieldInRange(formulaNode: ScanFormula.DateSubFieldInRangeNode, not: boolean): Result<DateSubFieldInRangeScanCondition, ScanConditionSetLoadError> {
                return new Ok({
                    typeId: ScanCondition.TypeId.DateSubFieldInRange,
                    not,
                    fieldId: formulaNode.fieldId,
                    subFieldId: formulaNode.subFieldId,
                    min: SourceTzOffsetDateTime.newUndefinable(formulaNode.min),
                    max: SourceTzOffsetDateTime.newUndefinable(formulaNode.max),
                });
            }
            createAltCodeSubFieldHasValue(formulaNode: ScanFormula.AltCodeSubFieldHasValueNode, not: boolean): Result<AltCodeSubFieldHasValueScanCondition, ScanConditionSetLoadError> {
                return new Ok({
                    typeId: ScanCondition.TypeId.AltCodeSubFieldHasValue,
                    not,
                    fieldId: formulaNode.fieldId,
                    subFieldId: formulaNode.subFieldId,
                });
            }
            createAltCodeSubFieldContains(formulaNode: ScanFormula.AltCodeSubFieldContainsNode, not: boolean): Result<AltCodeSubFieldContainsScanCondition, ScanConditionSetLoadError> {
                return new Ok({
                    typeId: ScanCondition.TypeId.AltCodeSubFieldContains,
                    not,
                    fieldId: formulaNode.fieldId,
                    subFieldId: formulaNode.subFieldId,
                    value: formulaNode.value,
                    asId: formulaNode.asId,
                    ignoreCase: formulaNode.ignoreCase,
                });
            }
            createAttributeSubFieldHasValue(formulaNode: ScanFormula.AttributeSubFieldHasValueNode, not: boolean): Result<AttributeSubFieldHasValueScanCondition, ScanConditionSetLoadError> {
                return new Ok({
                    typeId: ScanCondition.TypeId.AttributeSubFieldHasValue,
                    not,
                    fieldId: formulaNode.fieldId,
                    subFieldId: formulaNode.subFieldId,
                });
            }
            createAttributeSubFieldContains(formulaNode: ScanFormula.AttributeSubFieldContainsNode, not: boolean): Result<AttributeSubFieldContainsScanCondition, ScanConditionSetLoadError> {
                return new Ok({
                    typeId: ScanCondition.TypeId.AttributeSubFieldContains,
                    not,
                    fieldId: formulaNode.fieldId,
                    subFieldId: formulaNode.subFieldId,
                    value: formulaNode.value,
                    asId: formulaNode.asId,
                    ignoreCase: formulaNode.ignoreCase,
                });
            }
        }
    }
}
