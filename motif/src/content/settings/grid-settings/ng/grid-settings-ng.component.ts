/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { assert, BooleanUiAction, IntegerUiAction, NumberUiAction, StringId, Strings, StringUiAction } from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import {
    CaptionLabelNgComponent,
    CheckboxInputNgComponent,
    IntegerTextInputNgComponent,
    NumberInputNgComponent,
    TextInputNgComponent
} from 'controls-ng-api';
import { SettingsComponentBaseNgDirective } from '../../ng/settings-component-base-ng.directive';

@Component({
    selector: 'app-grid-settings',
    templateUrl: './grid-settings-ng.component.html',
    styleUrls: ['./grid-settings-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridSettingsNgComponent extends SettingsComponentBaseNgDirective implements OnDestroy, AfterViewInit {

    @ViewChild('fontFamilyLabel', { static: true }) private _fontFamilyLabelComponent: CaptionLabelNgComponent;
    @ViewChild('fontFamilyControl', { static: true }) private _fontFamilyControlComponent: TextInputNgComponent;
    @ViewChild('fontSizeLabel', { static: true }) private _fontSizeLabelComponent: CaptionLabelNgComponent;
    @ViewChild('fontSizeControl', { static: true }) private _fontSizeControlComponent: TextInputNgComponent;
    @ViewChild('columnHeaderFontSizeLabel', { static: true }) private _columnHeaderFontSizeLabelComponent: CaptionLabelNgComponent;
    @ViewChild('columnHeaderFontSizeControl', { static: true }) private _columnHeaderFontSizeControlComponent: TextInputNgComponent;
    @ViewChild('rowHeightLabel', { static: true }) private _rowHeightLabelComponent: CaptionLabelNgComponent;
    @ViewChild('rowHeightControl', { static: true }) private _rowHeightControlComponent: IntegerTextInputNgComponent;
    @ViewChild('showHorizontalGridLinesLabel', { static: true }) private _showHorizontalGridLinesLabel: CaptionLabelNgComponent;
    @ViewChild('showHorizontalGridLinesCheckbox', { static: true }) private _showHorizontalGridLinesCheckbox: CheckboxInputNgComponent;
    @ViewChild('showVerticalGridLinesLabel', { static: true }) private _showVerticalGridLinesLabel: CaptionLabelNgComponent;
    @ViewChild('showVerticalGridLinesCheckbox', { static: true }) private _showVerticalGridLinesCheckbox: CheckboxInputNgComponent;
    @ViewChild('gridLineHorizontalWidthLabel', { static: true }) private _gridLineHorizontalWidthLabel: CaptionLabelNgComponent;
    @ViewChild('gridLineHorizontalWidthEdit', { static: true }) private _gridLineHorizontalWidthEdit: IntegerTextInputNgComponent;
    @ViewChild('gridLineVerticalWidthLabel', { static: true }) private _gridLineVerticalWidthLabel: CaptionLabelNgComponent;
    @ViewChild('gridLineVerticalWidthEdit', { static: true }) private _gridLineVerticalWidthEdit: IntegerTextInputNgComponent;
    @ViewChild('cellPaddingLabel', { static: true }) private _cellPaddingLabel: CaptionLabelNgComponent;
    @ViewChild('cellPaddingEdit', { static: true }) private _cellPaddingEdit: IntegerTextInputNgComponent;
    @ViewChild('changedAllHighlightDurationLabel', { static: true }) private _changedAllHighlightDurationLabel: CaptionLabelNgComponent;
    @ViewChild('changedAllHighlightDurationEdit', { static: true }) private _changedAllHighlightDurationEdit: IntegerTextInputNgComponent;
    @ViewChild('addedRowHighlightDurationLabel', { static: true }) private _addedRowHighlightDurationLabel: CaptionLabelNgComponent;
    @ViewChild('addedRowHighlightDurationEdit', { static: true }) private _addedRowHighlightDurationEdit: IntegerTextInputNgComponent;
    @ViewChild('changedRowRecordHighlightDurationLabel', { static: true })
        private _changedRowRecordHighlightDurationLabel: CaptionLabelNgComponent;
    @ViewChild('changedRowRecordHighlightDurationEdit', { static: true })
        private _changedRowRecordHighlightDurationEdit: IntegerTextInputNgComponent;
    @ViewChild('changedValueHighlightDurationLabel', { static: true })
        private _changedValueHighlightDurationLabel: CaptionLabelNgComponent;
    @ViewChild('changedValueHighlightDurationEdit', { static: true })
        private _changedValueHighlightDurationEdit: IntegerTextInputNgComponent;
    @ViewChild('focusRowColoredLabel', { static: true }) private _focusRowColoredLabel: CaptionLabelNgComponent;
    @ViewChild('focusRowColoredCheckbox', { static: true }) private _focusRowColoredCheckbox: CheckboxInputNgComponent;
    @ViewChild('focusRowBorderedLabel', { static: true }) private _focusRowBorderedLabel: CaptionLabelNgComponent;
    @ViewChild('focusRowBorderedCheckbox', { static: true }) private _focusRowBorderedCheckbox: CheckboxInputNgComponent;
    @ViewChild('focusRowBorderWidthLabel', { static: true }) private _focusRowBorderWidthLabel: CaptionLabelNgComponent;
    @ViewChild('focusRowBorderWidthEdit', { static: true }) private _focusRowBorderWidthEdit: IntegerTextInputNgComponent;
    @ViewChild('smoothHorizontalScrollingLabel', { static: true }) private _smoothHorizontalScrollingLabel: CaptionLabelNgComponent;
    @ViewChild('smoothHorizontalScrollingCheckbox', { static: true }) private _smoothHorizontalScrollingCheckbox: CheckboxInputNgComponent;
    @ViewChild('horizontalScrollbarWidthLabel', { static: true }) private _horizontalScrollbarWidthLabel: CaptionLabelNgComponent;
    @ViewChild('horizontalScrollbarWidthEdit', { static: true }) private _horizontalScrollbarWidthEdit: IntegerTextInputNgComponent;
    @ViewChild('verticalScrollbarWidthLabel', { static: true }) private _verticalScrollbarWidthLabel: CaptionLabelNgComponent;
    @ViewChild('verticalScrollbarWidthEdit', { static: true }) private _verticalScrollbarWidthEdit: IntegerTextInputNgComponent;
    @ViewChild('scrollbarMarginLabel', { static: true }) private _scrollbarMarginLabel: CaptionLabelNgComponent;
    @ViewChild('scrollbarMarginEdit', { static: true }) private _scrollbarMarginEdit: IntegerTextInputNgComponent;
    @ViewChild('scrollbarThumbInactiveOpacityLabel', { static: true })
        private _scrollbarThumbInactiveOpacityLabel: CaptionLabelNgComponent;
    @ViewChild('scrollbarThumbInactiveOpacityControl', { static: true })
        private _scrollbarThumbInactiveOpacityEdit: NumberInputNgComponent;

    private readonly _fontFamilyUiAction: StringUiAction;
    private readonly _fontSizeUiAction: StringUiAction;
    private readonly _columnHeaderFontSizeUiAction: StringUiAction;
    private readonly _rowHeightUiAction: IntegerUiAction;
    private readonly _showHorizontalGridLinesUiAction: BooleanUiAction;
    private readonly _showVerticalGridLinesUiAction: BooleanUiAction;
    private readonly _gridLineHorizontalWidthUiAction: IntegerUiAction;
    private readonly _gridLineVerticalWidthUiAction: IntegerUiAction;
    private readonly _cellPaddingUiAction: IntegerUiAction;
    private readonly _changedAllHighlightDurationUiAction: IntegerUiAction;
    private readonly _addedRowHighlightDurationUiAction: IntegerUiAction;
    private readonly _changedRowRecordHighlightDurationUiAction: IntegerUiAction;
    private readonly _changedValueHighlightDurationUiAction: IntegerUiAction;
    private readonly _focusRowColoredUiAction: BooleanUiAction;
    private readonly _focusRowBorderedUiAction: BooleanUiAction;
    private readonly _focusRowBorderWidthUiAction: IntegerUiAction;
    private readonly _smoothHorizontalScrollingUiAction: BooleanUiAction;
    private readonly _horizontalScrollbarWidthUiAction: IntegerUiAction;
    private readonly _verticalScrollbarWidthUiAction: IntegerUiAction;
    private readonly _scrollbarMarginUiAction: IntegerUiAction;
    private readonly _scrollbarThumbInactiveOpacityUiAction: NumberUiAction;

    constructor(cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(cdr, settingsNgService.settingsService);

        this._fontFamilyUiAction = this.createFontFamilyUiAction();
        this._fontSizeUiAction = this.createFontSizeUiAction();
        this._columnHeaderFontSizeUiAction = this.createColumnHeaderFontSizeUiAction();
        this._rowHeightUiAction = this.createRowHeightUiAction();
        this._showHorizontalGridLinesUiAction = this.createShowHorizontalGridLinesUiAction();
        this._showVerticalGridLinesUiAction = this.createShowVerticalGridLinesUiAction();
        this._gridLineHorizontalWidthUiAction = this.createGridLineHorizontalWidthUiAction();
        this._gridLineVerticalWidthUiAction = this.createGridLineVerticalWidthUiAction();
        this._cellPaddingUiAction = this.createCellPaddingUiAction();
        this._changedAllHighlightDurationUiAction = this.createChangedAllHighlightDurationUiAction();
        this._addedRowHighlightDurationUiAction = this.createAddedRowHighlightDurationUiAction();
        this._changedRowRecordHighlightDurationUiAction = this.createChangedRowRecordHighlightDurationUiAction();
        this._changedValueHighlightDurationUiAction = this.createChangedValueHighlightDurationUiAction();
        this._focusRowColoredUiAction = this.createFocusRowColoredUiAction();
        this._focusRowBorderedUiAction = this.createFocusRowBorderedUiAction();
        this._focusRowBorderWidthUiAction = this.createFocusRowBorderWidthUiAction();
        this._smoothHorizontalScrollingUiAction = this.createSmoothHorizontalScrollingUiAction();
        this._horizontalScrollbarWidthUiAction = this.createHorizontalScrollbarWidthUiAction();
        this._verticalScrollbarWidthUiAction = this.createVerticalScrollbarWidthUiAction();
        this._scrollbarMarginUiAction = this.createScrollbarMarginUiAction();
        this._scrollbarThumbInactiveOpacityUiAction = this.createScrollbarThumbInactiveOpacityUiAction();

        this.processSettingsChanged();
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        this.initialiseComponents();

        setTimeout(() => this.markForCheck(), 0);
    }

    protected processSettingsChanged() {
        this.pushValues();
    }

    protected override finalise() {
        this._fontFamilyUiAction.finalise();
        this._fontSizeUiAction.finalise();
        this._columnHeaderFontSizeUiAction.finalise();
        this._rowHeightUiAction.finalise();
        this._showHorizontalGridLinesUiAction.finalise();
        this._showVerticalGridLinesUiAction.finalise();
        this._gridLineHorizontalWidthUiAction.finalise();
        this._gridLineVerticalWidthUiAction.finalise();
        this._cellPaddingUiAction.finalise();
        this._changedAllHighlightDurationUiAction.finalise();
        this._addedRowHighlightDurationUiAction.finalise();
        this._changedRowRecordHighlightDurationUiAction.finalise();
        this._changedValueHighlightDurationUiAction.finalise();
        this._focusRowColoredUiAction.finalise();
        this._focusRowBorderedUiAction.finalise();
        this._focusRowBorderWidthUiAction.finalise();
        this._smoothHorizontalScrollingUiAction.finalise();
        this._horizontalScrollbarWidthUiAction.finalise();
        this._verticalScrollbarWidthUiAction.finalise();
        this._scrollbarMarginUiAction.finalise();
        this._scrollbarThumbInactiveOpacityUiAction.finalise();

        super.finalise();
    }

    private initialiseComponents() {
        this._fontFamilyLabelComponent.initialise(this._fontFamilyUiAction);
        this._fontFamilyControlComponent.initialise(this._fontFamilyUiAction);
        this._fontSizeLabelComponent.initialise(this._fontSizeUiAction);
        this._fontSizeControlComponent.initialise(this._fontSizeUiAction);
        this._columnHeaderFontSizeLabelComponent.initialise(this._columnHeaderFontSizeUiAction);
        this._columnHeaderFontSizeControlComponent.initialise(this._columnHeaderFontSizeUiAction);
        this._rowHeightLabelComponent.initialise(this._rowHeightUiAction);
        this._rowHeightControlComponent.initialise(this._rowHeightUiAction);
        this._showHorizontalGridLinesLabel.initialise(this._showHorizontalGridLinesUiAction);
        this._showHorizontalGridLinesCheckbox.initialise(this._showHorizontalGridLinesUiAction);
        this._showVerticalGridLinesLabel.initialise(this._showVerticalGridLinesUiAction);
        this._showVerticalGridLinesCheckbox.initialise(this._showVerticalGridLinesUiAction);
        this._gridLineHorizontalWidthLabel.initialise(this._gridLineHorizontalWidthUiAction);
        this._gridLineHorizontalWidthEdit.initialise(this._gridLineHorizontalWidthUiAction);
        this._gridLineVerticalWidthLabel.initialise(this._gridLineVerticalWidthUiAction);
        this._gridLineVerticalWidthEdit.initialise(this._gridLineVerticalWidthUiAction);
        this._cellPaddingLabel.initialise(this._cellPaddingUiAction);
        this._cellPaddingEdit.initialise(this._cellPaddingUiAction);
        this._changedAllHighlightDurationLabel.initialise(this._changedAllHighlightDurationUiAction);
        this._changedAllHighlightDurationEdit.initialise(this._changedAllHighlightDurationUiAction);
        this._addedRowHighlightDurationLabel.initialise(this._addedRowHighlightDurationUiAction);
        this._addedRowHighlightDurationEdit.initialise(this._addedRowHighlightDurationUiAction);
        this._changedRowRecordHighlightDurationLabel.initialise(this._changedRowRecordHighlightDurationUiAction);
        this._changedRowRecordHighlightDurationEdit.initialise(this._changedRowRecordHighlightDurationUiAction);
        this._changedValueHighlightDurationLabel.initialise(this._changedValueHighlightDurationUiAction);
        this._changedValueHighlightDurationEdit.initialise(this._changedValueHighlightDurationUiAction);
        this._focusRowColoredLabel.initialise(this._focusRowColoredUiAction);
        this._focusRowColoredCheckbox.initialise(this._focusRowColoredUiAction);
        this._focusRowBorderedLabel.initialise(this._focusRowBorderedUiAction);
        this._focusRowBorderedCheckbox.initialise(this._focusRowBorderedUiAction);
        this._focusRowBorderWidthLabel.initialise(this._focusRowBorderWidthUiAction);
        this._focusRowBorderWidthEdit.initialise(this._focusRowBorderWidthUiAction);
        this._smoothHorizontalScrollingLabel.initialise(this._smoothHorizontalScrollingUiAction);
        this._smoothHorizontalScrollingCheckbox.initialise(this._smoothHorizontalScrollingUiAction);
        this._horizontalScrollbarWidthLabel.initialise(this._horizontalScrollbarWidthUiAction);
        this._horizontalScrollbarWidthEdit.initialise(this._horizontalScrollbarWidthUiAction);
        this._verticalScrollbarWidthLabel.initialise(this._verticalScrollbarWidthUiAction);
        this._verticalScrollbarWidthEdit.initialise(this._verticalScrollbarWidthUiAction);
        this._scrollbarMarginLabel.initialise(this._scrollbarMarginUiAction);
        this._scrollbarMarginEdit.initialise(this._scrollbarMarginUiAction);
        this._scrollbarThumbInactiveOpacityLabel.initialise(this._scrollbarThumbInactiveOpacityUiAction);
        this._scrollbarThumbInactiveOpacityEdit.initialise(this._scrollbarThumbInactiveOpacityUiAction);
    }

    private createFontFamilyUiAction() {
        const action = new StringUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_FontFamily]);
        action.pushTitle(Strings[StringId.SettingTitle_FontFamily]);
        action.commitEvent = () => {
            this.coreSettings.grid_FontFamily = this._fontFamilyUiAction.definedValue;
        };
        return action;
    }

    private createFontSizeUiAction() {
        const action = new StringUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_FontSize]);
        action.pushTitle(Strings[StringId.SettingTitle_FontSize]);
        action.commitEvent = () => {
            this.coreSettings.grid_FontSize = this._fontSizeUiAction.definedValue;
        };
        return action;
    }

    private createColumnHeaderFontSizeUiAction() {
        const action = new StringUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_ColumnHeaderFontSize]);
        action.pushTitle(Strings[StringId.SettingTitle_ColumnHeaderFontSize]);
        action.commitEvent = () => {
            this.coreSettings.grid_ColumnHeaderFontSize = this._columnHeaderFontSizeUiAction.definedValue;
        };
        return action;
    }

    private createRowHeightUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_RowHeight]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_RowHeight]);
        action.commitEvent = () => {
            this.coreSettings.grid_RowHeight = this._rowHeightUiAction.definedValue;
        };
        return action;
    }

    private createScrollbarThumbInactiveOpacityUiAction() {
        const action = new NumberUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_ScrollbarThumbInactiveOpacity]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_ScrollbarThumbInactiveOpacity]);
        action.commitEvent = () => {
            this.coreSettings.grid_ScrollbarThumbInactiveOpacity = this._scrollbarThumbInactiveOpacityUiAction.definedValue;
        };
        return action;
    }

    private createScrollbarMarginUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_ScrollbarMargin]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_ScrollbarMargin]);
        action.commitEvent = () => {
            this.coreSettings.grid_ScrollbarMargin = this._scrollbarMarginUiAction.definedValue;
        };
        return action;
    }

    private createVerticalScrollbarWidthUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_VerticalScrollbarWidth]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_VerticalScrollbarWidth]);
        action.commitEvent = () => {
            this.coreSettings.grid_VerticalScrollbarWidth = this._verticalScrollbarWidthUiAction.definedValue;
        };
        return action;
    }

    private createHorizontalScrollbarWidthUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_HorizontalScrollbarWidth]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_HorizontalScrollbarWidth]);
        action.commitEvent = () => {
            this.coreSettings.grid_HorizontalScrollbarWidth = this._horizontalScrollbarWidthUiAction.definedValue;
        };
        return action;
    }

    private createSmoothHorizontalScrollingUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_SmoothHorizontalScrolling]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_SmoothHorizontalScrolling]);
        action.commitEvent = () => {
            this.coreSettings.grid_ScrollHorizontallySmoothly = this._smoothHorizontalScrollingUiAction.definedValue;
        };
        return action;
    }

    private createFocusRowBorderWidthUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_FocusedRowBorderWidth]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_FocusedRowBorderWidth]);
        action.commitEvent = () => {
            this.coreSettings.grid_FocusedRowBorderWidth = this._focusRowBorderWidthUiAction.definedValue;
        };
        return action;
    }

    private createFocusRowBorderedUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_FocusedRowBordered]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_FocusedRowBordered]);
        action.commitEvent = () => {
            this.coreSettings.grid_FocusedRowBordered = this._focusRowBorderedUiAction.definedValue;
        };
        return action;
    }

    private createFocusRowColoredUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_FocusedRowColored]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_FocusedRowColored]);
        action.commitEvent = () => {
            this.coreSettings.grid_FocusedRowColored = this._focusRowColoredUiAction.definedValue;
        };
        return action;
    }

    private createChangedAllHighlightDurationUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_ChangedAllHighlightDuration]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_ChangedAllHighlightDuration]);
        action.commitEvent = () => {
            this.coreSettings.grid_AllChangedRecentDuration = this._changedAllHighlightDurationUiAction.definedValue;
        };
        return action;
    }

    private createAddedRowHighlightDurationUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_AddedRowHighlightDuration]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_AddedRowHighlightDuration]);
        action.commitEvent = () => {
            this.coreSettings.grid_RecordInsertedRecentDuration = this._addedRowHighlightDurationUiAction.definedValue;
        };
        return action;
    }

    private createChangedRowRecordHighlightDurationUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_ChangedRowRecordHighlightDuration]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_ChangedRowRecordHighlightDuration]);
        action.commitEvent = () => {
            this.coreSettings.grid_RecordUpdatedRecentDuration = this._changedRowRecordHighlightDurationUiAction.definedValue;
        };
        return action;
    }

    private createChangedValueHighlightDurationUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_ChangedValueHighlightDuration]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_ChangedValueHighlightDuration]);
        action.commitEvent = () => {
            this.coreSettings.grid_ValueChangedRecentDuration = this._changedValueHighlightDurationUiAction.definedValue;
        };
        return action;
    }

    private createCellPaddingUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_CellPadding]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_CellPadding]);
        action.commitEvent = () => {
            this.coreSettings.grid_CellPadding = this._cellPaddingUiAction.definedValue;
        };
        return action;
    }

    private createGridLineVerticalWidthUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_VerticalLineWidth]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_VerticalLineWidth]);
        action.commitEvent = () => {
            this.coreSettings.grid_VerticalLineWidth = this._gridLineVerticalWidthUiAction.definedValue;
        };
        return action;
    }

    private createGridLineHorizontalWidthUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_HorizontalLineWidth]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_HorizontalLineWidth]);
        action.commitEvent = () => {
            this.coreSettings.grid_HorizontalLineWidth = this._gridLineHorizontalWidthUiAction.definedValue;
        };
        return action;
    }

    private createShowVerticalGridLinesUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_VerticalLinesVisible]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_VerticalLinesVisible]);
        action.commitEvent = () => {
            this.coreSettings.grid_VerticalLinesVisible = this._showVerticalGridLinesUiAction.definedValue;
        };
        return action;
    }

    private createShowHorizontalGridLinesUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Grid_HorizontalLinesVisible]);
        action.pushTitle(Strings[StringId.SettingTitle_Grid_HorizontalLinesVisible]);
        action.commitEvent = () => {
            this.coreSettings.grid_HorizontalLinesVisible = this._showHorizontalGridLinesUiAction.definedValue;
        };
        return action;
    }

    private pushValues() {
        this._fontFamilyUiAction.pushValue(this.coreSettings.grid_FontFamily);
        this._fontSizeUiAction.pushValue(this.coreSettings.grid_FontSize);
        this._columnHeaderFontSizeUiAction.pushValue(this.coreSettings.grid_ColumnHeaderFontSize);
        this._rowHeightUiAction.pushValue(this.coreSettings.grid_RowHeight);
        this._showHorizontalGridLinesUiAction.pushValue(this.coreSettings.grid_HorizontalLinesVisible);
        this._showVerticalGridLinesUiAction.pushValue(this.coreSettings.grid_VerticalLinesVisible);
        this._gridLineHorizontalWidthUiAction.pushValue(this.coreSettings.grid_HorizontalLineWidth);
        this._gridLineVerticalWidthUiAction.pushValue(this.coreSettings.grid_VerticalLineWidth);
        this._cellPaddingUiAction.pushValue(this.coreSettings.grid_CellPadding);
        this._changedAllHighlightDurationUiAction.pushValue(this.coreSettings.grid_AllChangedRecentDuration);
        this._addedRowHighlightDurationUiAction.pushValue(this.coreSettings.grid_RecordInsertedRecentDuration);
        this._changedRowRecordHighlightDurationUiAction.pushValue(this.coreSettings.grid_RecordUpdatedRecentDuration);
        this._changedValueHighlightDurationUiAction.pushValue(this.coreSettings.grid_ValueChangedRecentDuration);
        this._focusRowColoredUiAction.pushValue(this.coreSettings.grid_FocusedRowColored);
        this._focusRowBorderedUiAction.pushValue(this.coreSettings.grid_FocusedRowBordered);
        this._focusRowBorderWidthUiAction.pushValue(this.coreSettings.grid_FocusedRowBorderWidth);
        this._smoothHorizontalScrollingUiAction.pushValue(this.coreSettings.grid_ScrollHorizontallySmoothly);
        this._horizontalScrollbarWidthUiAction.pushValue(this.coreSettings.grid_HorizontalScrollbarWidth);
        this._verticalScrollbarWidthUiAction.pushValue(this.coreSettings.grid_VerticalScrollbarWidth);
        this._scrollbarMarginUiAction.pushValue(this.coreSettings.grid_ScrollbarMargin);
        this._scrollbarThumbInactiveOpacityUiAction.pushValue(this.coreSettings.grid_ScrollbarThumbInactiveOpacity);
    }
}

export namespace GridSettingsNgComponent {

    export function create(container: ViewContainerRef) {
        container.clear();
        const componentRef = container.createComponent(GridSettingsNgComponent);
        assert(componentRef.instance instanceof GridSettingsNgComponent, 'GSCC39399987');
        return componentRef.instance;
    }
}
