/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component,
    ComponentFactoryResolver, OnDestroy, ViewChild,
    ViewContainerRef
} from '@angular/core';
import { SettingsNgService } from 'src/component-services/ng-api';
import { CaptionLabelNgComponent, CheckboxInputNgComponent, IntegerTextInputNgComponent } from 'src/controls/ng-api';
import { BooleanUiAction, IntegerUiAction } from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { assert } from 'src/sys/internal-api';
import { SettingsComponentBaseNgDirective } from '../../ng/settings-component-base-ng.directive';

@Component({
    selector: 'app-grid-settings',
    templateUrl: './grid-settings-ng.component.html',
    styleUrls: ['./grid-settings-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridSettingsNgComponent extends SettingsComponentBaseNgDirective implements OnDestroy, AfterViewInit {

    @ViewChild('showHorizontalGridLinesLabel', { static: true }) private _showHorizontalGridLinesLabel: CaptionLabelNgComponent;
    @ViewChild('showHorizontalGridLinesCheckbox', { static: true }) private _showHorizontalGridLinesCheckbox: CheckboxInputNgComponent;
    @ViewChild('showVerticalGridLinesLabel', { static: true }) private _showVerticalGridLinesLabel: CaptionLabelNgComponent;
    @ViewChild('showVerticalGridLinesCheckbox', { static: true }) private _showVerticalGridLinesCheckbox: CheckboxInputNgComponent;
    @ViewChild('gridLineHorizontalWeightLabel', { static: true }) private _gridLineHorizontalWeightLabel: CaptionLabelNgComponent;
    @ViewChild('gridLineHorizontalWeightEdit', { static: true }) private _gridLineHorizontalWeightEdit: IntegerTextInputNgComponent;
    @ViewChild('gridLineVerticalWeightLabel', { static: true }) private _gridLineVerticalWeightLabel: CaptionLabelNgComponent;
    @ViewChild('gridLineVerticalWeightEdit', { static: true }) private _gridLineVerticalWeightEdit: IntegerTextInputNgComponent;
    @ViewChild('cellPaddingLabel', { static: true }) private _cellPaddingLabel: CaptionLabelNgComponent;
    @ViewChild('cellPaddingEdit', { static: true }) private _cellPaddingEdit: IntegerTextInputNgComponent;
    @ViewChild('highlightAddDurationLabel', { static: true }) private _highlightAddDurationLabel: CaptionLabelNgComponent;
    @ViewChild('highlightAddDurationEdit', { static: true }) private _highlightAddDurationEdit: IntegerTextInputNgComponent;
    @ViewChild('highlightUpdateDurationLabel', { static: true }) private _highlightUpdateDurationLabel: CaptionLabelNgComponent;
    @ViewChild('highlightUpdateDurationEdit', { static: true }) private _highlightUpdateDurationEdit: IntegerTextInputNgComponent;
    @ViewChild('focusRowColoredChecLabel', { static: true }) private _focusRowColoredChecLabel: CaptionLabelNgComponent;
    @ViewChild('focusRowColoredCheckbox', { static: true }) private _focusRowColoredCheckbox: CheckboxInputNgComponent;
    @ViewChild('focusRowBorderedChecLabel', { static: true }) private _focusRowBorderedChecLabel: CaptionLabelNgComponent;
    @ViewChild('focusRowBorderedCheckbox', { static: true }) private _focusRowBorderedCheckbox: CheckboxInputNgComponent;
    @ViewChild('focusRowBorderWidthLabel', { static: true }) private _focusRowBorderWidthLabel: CaptionLabelNgComponent;
    @ViewChild('focusRowBorderWidthEdit', { static: true }) private _focusRowBorderWidthEdit: IntegerTextInputNgComponent;
    @ViewChild('horizontalScrollbarWidthLabel', { static: true }) private _horizontalScrollbarWidthLabel: CaptionLabelNgComponent;
    @ViewChild('horizontalScrollbarWidthEdit', { static: true }) private _horizontalScrollbarWidthEdit: IntegerTextInputNgComponent;
    @ViewChild('verticalScrollbarWidthLabel', { static: true }) private _verticalScrollbarWidthLabel: IntegerTextInputNgComponent;
    @ViewChild('verticalScrollbarWidthEdit', { static: true }) private _verticalScrollbarWidthEdit: IntegerTextInputNgComponent;
    @ViewChild('scrollbarMarginLabel', { static: true }) private _scrollbarMarginLabel: IntegerTextInputNgComponent;
    @ViewChild('scrollbarMarginEdit', { static: true }) private _scrollbarMarginEdit: IntegerTextInputNgComponent;
    @ViewChild('scrollbarsCanOverlapGridLabel', { static: true }) private _scrollbarsCanOverlapGridLabel: IntegerTextInputNgComponent;
    @ViewChild('scrollbarsCanOverlapGridCheckbox', { static: true }) private _scrollbarsCanOverlapGridCheckbox: IntegerTextInputNgComponent;

    private _showHorizontalGridLinesUiAction: BooleanUiAction;
    private _showVerticalGridLinesUiAction: BooleanUiAction;
    private _gridLineHorizontalWeightUiAction: IntegerUiAction;
    private _gridLineVerticalWeightUiAction: IntegerUiAction;
    private _cellPaddingUiAction: IntegerUiAction;
    private _highlightAddDurationUiAction: IntegerUiAction;
    private _highlightUpdateDurationUiAction: IntegerUiAction;
    private _focusRowColoredUiAction: BooleanUiAction;
    private _focusRowBorderedUiAction: BooleanUiAction;
    private _focusRowBorderWidthUiAction: IntegerUiAction;
    private _horizontalScrollbarWidthUiAction: IntegerUiAction;
    private _verticalScrollbarWidthUiAction: IntegerUiAction;
    private _scrollbarMarginUiAction: IntegerUiAction;
    private _scrollbarsCanOverlapGridUiAction: BooleanUiAction;

    constructor(cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(cdr, settingsNgService.settingsService);

        this.createUiActions();
        this.pushValues();
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

    protected finalise() {
        this._showHorizontalGridLinesUiAction.finalise();
        this._showVerticalGridLinesUiAction.finalise();
        this._gridLineHorizontalWeightUiAction.finalise();
        this._gridLineVerticalWeightUiAction.finalise();
        this._cellPaddingUiAction.finalise();
        this._highlightAddDurationUiAction.finalise();
        this._highlightUpdateDurationUiAction.finalise();
        this._focusRowColoredUiAction.finalise();
        this._focusRowBorderedUiAction.finalise();
        this._focusRowBorderWidthUiAction.finalise();
        this._horizontalScrollbarWidthUiAction.finalise();
        this._verticalScrollbarWidthUiAction.finalise();
        this._scrollbarMarginUiAction.finalise();
        this._scrollbarsCanOverlapGridUiAction.finalise();

        super.finalise();
    }

    private createUiActions() {
        this._showHorizontalGridLinesUiAction = new BooleanUiAction();
        this._showHorizontalGridLinesUiAction.pushCaption(Strings[StringId.SettingCaption_Grid_HorizontalLinesVisible]);
        this._showHorizontalGridLinesUiAction.pushTitle(Strings[StringId.SettingTitle_Grid_HorizontalLinesVisible]);
        this._showHorizontalGridLinesUiAction.commitEvent = () => {
            this.coreSettings.grid_HorizontalLinesVisible = this._showHorizontalGridLinesUiAction.definedValue;
        };
        this._showVerticalGridLinesUiAction = new BooleanUiAction();
        this._showVerticalGridLinesUiAction.pushCaption(Strings[StringId.SettingCaption_Grid_VerticalLinesVisible]);
        this._showVerticalGridLinesUiAction.pushTitle(Strings[StringId.SettingTitle_Grid_VerticalLinesVisible]);
        this._showVerticalGridLinesUiAction.commitEvent = () => {
            this.coreSettings.grid_VerticalLinesVisible = this._showVerticalGridLinesUiAction.definedValue;
        };
        this._gridLineHorizontalWeightUiAction = new IntegerUiAction();
        this._gridLineHorizontalWeightUiAction.pushCaption(Strings[StringId.SettingCaption_Grid_HorizontalLineWeight]);
        this._gridLineHorizontalWeightUiAction.pushTitle(Strings[StringId.SettingTitle_Grid_HorizontalLineWeight]);
        this._gridLineHorizontalWeightUiAction.commitEvent = () => {
            this.coreSettings.grid_HorizontalLineWeight = this._gridLineHorizontalWeightUiAction.definedValue;
        };
        this._gridLineVerticalWeightUiAction = new IntegerUiAction();
        this._gridLineVerticalWeightUiAction.pushCaption(Strings[StringId.SettingCaption_Grid_VerticalLineWeight]);
        this._gridLineVerticalWeightUiAction.pushTitle(Strings[StringId.SettingTitle_Grid_VerticalLineWeight]);
        this._gridLineVerticalWeightUiAction.commitEvent = () => {
            this.coreSettings.grid_VerticalLineWeight = this._gridLineVerticalWeightUiAction.definedValue;
        };
        this._cellPaddingUiAction = new IntegerUiAction();
        this._cellPaddingUiAction.pushCaption(Strings[StringId.SettingCaption_Grid_CellPadding]);
        this._cellPaddingUiAction.pushTitle(Strings[StringId.SettingTitle_Grid_CellPadding]);
        this._cellPaddingUiAction.commitEvent = () => {
            this.coreSettings.grid_CellPadding = this._cellPaddingUiAction.definedValue;
        };
        this._highlightAddDurationUiAction = new IntegerUiAction();
        this._highlightAddDurationUiAction.pushCaption(Strings[StringId.SettingCaption_Grid_AddHighlightDuration]);
        this._highlightAddDurationUiAction.pushTitle(Strings[StringId.SettingTitle_Grid_AddHighlightDuration]);
        this._highlightAddDurationUiAction.commitEvent = () => {
            this.coreSettings.grid_AddHighlightDuration = this._highlightAddDurationUiAction.definedValue;
        };
        this._highlightUpdateDurationUiAction = new IntegerUiAction();
        this._highlightUpdateDurationUiAction.pushCaption(Strings[StringId.SettingCaption_Grid_UpdateHighlightDuration]);
        this._highlightUpdateDurationUiAction.pushTitle(Strings[StringId.SettingTitle_Grid_UpdateHighlightDuration]);
        this._highlightUpdateDurationUiAction.commitEvent = () => {
            this.coreSettings.grid_UpdateHighlightDuration = this._highlightUpdateDurationUiAction.definedValue;
        };
        this._focusRowColoredUiAction = new BooleanUiAction();
        this._focusRowColoredUiAction.pushCaption(Strings[StringId.SettingCaption_Grid_FocusedRowColored]);
        this._focusRowColoredUiAction.pushTitle(Strings[StringId.SettingTitle_Grid_FocusedRowColored]);
        this._focusRowColoredUiAction.commitEvent = () => {
            this.coreSettings.grid_FocusedRowColored = this._focusRowColoredUiAction.definedValue;
        };
        this._focusRowBorderedUiAction = new BooleanUiAction();
        this._focusRowBorderedUiAction.pushCaption(Strings[StringId.SettingCaption_Grid_FocusedRowBordered]);
        this._focusRowBorderedUiAction.pushTitle(Strings[StringId.SettingTitle_Grid_FocusedRowBordered]);
        this._focusRowBorderedUiAction.commitEvent = () => {
            this.coreSettings.grid_FocusedRowBordered = this._focusRowBorderedUiAction.definedValue;
        };
        this._focusRowBorderWidthUiAction = new IntegerUiAction();
        this._focusRowBorderWidthUiAction.pushCaption(Strings[StringId.SettingCaption_Grid_FocusedRowBorderWidth]);
        this._focusRowBorderWidthUiAction.pushTitle(Strings[StringId.SettingTitle_Grid_FocusedRowBorderWidth]);
        this._focusRowBorderWidthUiAction.commitEvent = () => {
            this.coreSettings.grid_FocusedRowBorderWidth = this._focusRowBorderWidthUiAction.definedValue;
        };
        this._horizontalScrollbarWidthUiAction = new IntegerUiAction();
        this._horizontalScrollbarWidthUiAction.pushCaption(Strings[StringId.SettingCaption_Grid_HorizontalScrollbarWidth]);
        this._horizontalScrollbarWidthUiAction.pushTitle(Strings[StringId.SettingTitle_Grid_HorizontalScrollbarWidth]);
        this._horizontalScrollbarWidthUiAction.commitEvent = () => {
            this.coreSettings.grid_HorizontalScrollbarWidth = this._horizontalScrollbarWidthUiAction.definedValue;
        };
        this._verticalScrollbarWidthUiAction = new IntegerUiAction();
        this._verticalScrollbarWidthUiAction.pushCaption(Strings[StringId.SettingCaption_Grid_VerticalScrollbarWidth]);
        this._verticalScrollbarWidthUiAction.pushTitle(Strings[StringId.SettingTitle_Grid_VerticalScrollbarWidth]);
        this._verticalScrollbarWidthUiAction.commitEvent = () => {
            this.coreSettings.grid_VerticalScrollbarWidth = this._verticalScrollbarWidthUiAction.definedValue;
        };
        this._scrollbarMarginUiAction = new IntegerUiAction();
        this._scrollbarMarginUiAction.pushCaption(Strings[StringId.SettingCaption_Grid_ScrollbarMargin]);
        this._scrollbarMarginUiAction.pushTitle(Strings[StringId.SettingTitle_Grid_ScrollbarMargin]);
        this._scrollbarMarginUiAction.commitEvent = () => {
            this.coreSettings.grid_ScrollbarMargin = this._scrollbarMarginUiAction.definedValue;
        };
        this._scrollbarsCanOverlapGridUiAction = new BooleanUiAction();
        this._scrollbarsCanOverlapGridUiAction.pushCaption(Strings[StringId.SettingCaption_Grid_ScrollbarsOverlayAllowed]);
        this._scrollbarsCanOverlapGridUiAction.pushTitle(Strings[StringId.SettingTitle_Grid_ScrollbarsOverlayAllowed]);
        this._scrollbarsCanOverlapGridUiAction.commitEvent = () => {
            this.coreSettings.grid_ScrollbarsOverlayAllowed = this._scrollbarsCanOverlapGridUiAction.definedValue;
        };
    }

    private initialiseComponents() {
        this._showHorizontalGridLinesLabel.initialise(this._showHorizontalGridLinesUiAction);
        this._showHorizontalGridLinesCheckbox.initialise(this._showHorizontalGridLinesUiAction);
        this._showVerticalGridLinesLabel.initialise(this._showVerticalGridLinesUiAction);
        this._showVerticalGridLinesCheckbox.initialise(this._showVerticalGridLinesUiAction);
        this._gridLineHorizontalWeightLabel.initialise(this._gridLineHorizontalWeightUiAction);
        this._gridLineHorizontalWeightEdit.initialise(this._gridLineHorizontalWeightUiAction);
        this._gridLineVerticalWeightLabel.initialise(this._gridLineVerticalWeightUiAction);
        this._gridLineVerticalWeightEdit.initialise(this._gridLineVerticalWeightUiAction);
        this._cellPaddingLabel.initialise(this._cellPaddingUiAction);
        this._cellPaddingEdit.initialise(this._cellPaddingUiAction);
        this._highlightAddDurationLabel.initialise(this._highlightAddDurationUiAction);
        this._highlightAddDurationEdit.initialise(this._highlightAddDurationUiAction);
        this._highlightUpdateDurationLabel.initialise(this._highlightUpdateDurationUiAction);
        this._highlightUpdateDurationEdit.initialise(this._highlightUpdateDurationUiAction);
        this._focusRowColoredChecLabel.initialise(this._focusRowColoredUiAction);
        this._focusRowColoredCheckbox.initialise(this._focusRowColoredUiAction);
        this._focusRowBorderedChecLabel.initialise(this._focusRowBorderedUiAction);
        this._focusRowBorderedCheckbox.initialise(this._focusRowBorderedUiAction);
        this._focusRowBorderWidthLabel.initialise(this._focusRowBorderWidthUiAction);
        this._focusRowBorderWidthEdit.initialise(this._focusRowBorderWidthUiAction);
        this._horizontalScrollbarWidthLabel.initialise(this._horizontalScrollbarWidthUiAction);
        this._horizontalScrollbarWidthEdit.initialise(this._horizontalScrollbarWidthUiAction);
        this._verticalScrollbarWidthLabel.initialise(this._verticalScrollbarWidthUiAction);
        this._verticalScrollbarWidthEdit.initialise(this._verticalScrollbarWidthUiAction);
        this._scrollbarMarginLabel.initialise(this._scrollbarMarginUiAction);
        this._scrollbarMarginEdit.initialise(this._scrollbarMarginUiAction);
        this._scrollbarsCanOverlapGridLabel.initialise(this._scrollbarsCanOverlapGridUiAction);
        this._scrollbarsCanOverlapGridCheckbox.initialise(this._scrollbarsCanOverlapGridUiAction);
    }

    private pushValues() {
        this._showHorizontalGridLinesUiAction.pushValue(this.coreSettings.grid_HorizontalLinesVisible);
        this._showVerticalGridLinesUiAction.pushValue(this.coreSettings.grid_VerticalLinesVisible);
        this._gridLineHorizontalWeightUiAction.pushValue(this.coreSettings.grid_HorizontalLineWeight);
        this._gridLineVerticalWeightUiAction.pushValue(this.coreSettings.grid_VerticalLineWeight);
        this._cellPaddingUiAction.pushValue(this.coreSettings.grid_CellPadding);
        this._highlightAddDurationUiAction.pushValue(this.coreSettings.grid_AddHighlightDuration);
        this._highlightUpdateDurationUiAction.pushValue(this.coreSettings.grid_UpdateHighlightDuration);
        this._focusRowColoredUiAction.pushValue(this.coreSettings.grid_FocusedRowColored);
        this._focusRowBorderedUiAction.pushValue(this.coreSettings.grid_FocusedRowBordered);
        this._focusRowBorderWidthUiAction.pushValue(this.coreSettings.grid_FocusedRowBorderWidth);
        this._horizontalScrollbarWidthUiAction.pushValue(this.coreSettings.grid_HorizontalScrollbarWidth);
        this._verticalScrollbarWidthUiAction.pushValue(this.coreSettings.grid_VerticalScrollbarWidth);
        this._scrollbarMarginUiAction.pushValue(this.coreSettings.grid_ScrollbarMargin);
        this._scrollbarsCanOverlapGridUiAction.pushValue(this.coreSettings.grid_ScrollbarsOverlayAllowed);
    }
}

export namespace GridSettingsNgComponent {

    export function create(
        container: ViewContainerRef,
        resolver: ComponentFactoryResolver,
    ) {
        container.clear();
        const factory = resolver.resolveComponentFactory(GridSettingsNgComponent);
        const componentRef = container.createComponent(factory);
        assert(componentRef.instance instanceof GridSettingsNgComponent, 'GSCC39399987');
        return componentRef.instance as GridSettingsNgComponent;
    }
}
