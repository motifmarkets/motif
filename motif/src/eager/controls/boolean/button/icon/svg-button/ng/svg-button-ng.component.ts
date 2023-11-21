/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import {
    AssertInternalError,
    ColorScheme,
    EnumInfoOutOfOrderError,
    IconButtonUiAction,
    Integer,
    ModifierKey,
    MultiEvent,
    UiAction
} from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../../../ng/control-component-base-ng.directive';
import nounArrowDownSvg from './svg/noun-arrow-down-70422.svg';
import nounCollapseVerticalSvg from './svg/noun-collapse-vertical-2439339.svg';
import nounExpandVerticalSvg from './svg/noun-expand-vertical-2439362.svg';
import nounLoginSvg from './svg/noun-login-4123950.svg';
import nounLogoutSvg from './svg/noun-logout-4124631.svg';
import nounMarkAllSvg from './svg/noun-mark-all-3067122.svg';
import nounMinimizeSvg from './svg/noun-minimize-4143571.svg';
import nounMoveToBottomSvg from './svg/noun-move-to-bottom-269053.svg';
import nounMoveToTopSvg from './svg/noun-move-to-top-269054.svg';
import nounArrowUpSvg from './svg/noun-up-70478.svg';
import nounBrightnessFullSvg from './svg/noun_Brightness-Full_218687.svg';
import nounCancelSearchSvg from './svg/noun_Cancel-Search_677094.svg';
import nounCloseSvg from './svg/noun_Close_82107.svg';
import nounFilePlusSvg from './svg/noun_File-Plus_1669467.svg';
import nounFolderSvg from './svg/noun_Folder_3438446.svg';
import nounLightBulbSvg from './svg/noun_Light-Bulb_3019480.svg';
import nounListSvg from './svg/noun_List_1242568.svg';
import nounNoTintSvg from './svg/noun_No-Tint_120407.svg';
import nounSaveOperationSvg from './svg/noun_Save_3141427.svg';
import nounSaveDocumentSvg from './svg/noun_Save_801270.svg';
import nounSearchEventSvg from './svg/noun_Search-event_515474.svg';
import nounSunglassesSvg from './svg/noun_Sunglasses_3668612.svg';
import nounTargetSvg from './svg/noun_Target_1492976.svg';
import nounTintHollowSvg from './svg/noun_Tint-Hollow_120409.svg';
import nounWriteFileSvg from './svg/noun_Write-File_1669429.svg';
import nounBlankSvg from './svg/noun_blank_1667007.svg';
import nounBoltSvg from './svg/noun_bolt_3396896.svg';
import nounCancelSvg from './svg/noun_cancel_1896724.svg';
import nounClipboardSvg from './svg/noun_clipboard_158395.svg';
import nounCodeEventSvg from './svg/noun_code-event_515475.svg';
import nounDetailsSvg from './svg/noun_details_251351.svg';
import nounDotSvg from './svg/noun_dot_658609.svg';
import nounDownChevronSvg from './svg/noun_down-chevron_3529447.svg';
import nounFileMinusSvg from './svg/noun_file-minus_1669468.svg';
import nounFileRemoveSvg from './svg/noun_file-remove_1669462.svg';
import nounFilterSvg from './svg/noun_filter_1252200.svg';
import nounFlipSvg from './svg/noun_flip_2063119.svg';
import nounGridWidthSvg from './svg/noun_grid-width_834238.svg';
import nounAccountLinkSvg from './svg/noun_link_1096675.svg';
import nounSymbolLinkSvg from './svg/noun_link_2220043.svg';
import nounMirrorSvg from './svg/noun_mirror_26874.svg';
import nounNextFileSvg from './svg/noun_next-file_1669433.svg';
import nounRemoveEventSvg from './svg/noun_remove-event_515462.svg';
import nounReturnSvg from './svg/noun_return_1651212.svg';
import nounSearchNextSvg from './svg/noun_search-next_677099.svg';
import nounSelectColumnSvg from './svg/noun_select-column_1779607.svg';
import nounSpinningSvg from './svg/noun_spinning_997678.svg';
import nounUpChevronSvg from './svg/noun_up-chevron_3529491.svg';
import nounWorldSvg from './svg/noun_world_2593665.svg';

// Instructions for adding new Icon
// 1. Add an entry for it in Motif Core IconButtonUiAction
// 2. Get file with single SVG inside it
// 3. Transform to symbol if necessary (can use https://svg-to-symbol-app.pages.dev/)
// 4. Save in ./svg subfolder
// 5. Change id="only" (can only include one symbol in SVG)
// 6. Add to imports above
// 7. Add to infosObject below
// Links
// https://www.sitepoint.com/use-svg-image-sprites/

@Component({
    selector: 'app-svg-button',
    templateUrl: './svg-button-ng.component.html',
    styleUrls: ['./svg-button-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgButtonNgComponent extends ControlComponentBaseNgDirective implements OnInit {
    private static typeInstanceCreateCount = 0;

    @Input() inputId: string;

    @ViewChild('button', { static: true }) private _buttonRef: ElementRef;
    @ViewChild('svg', { static: true }) private _iconComponent: ElementRef;

    public selectedDisabledClass: string;
    public spriteLink: string;

    private _pushFaButtonEventsSubscriptionId: MultiEvent.SubscriptionId;

    private _bkgdColorCssVarName: string;
    private _foreColorCssVarName: string;
    private _selectedBorderForeColorCssVarName: string;
    private _hoverBkgdColorCssVarName: string;
    private _svg: string;

    private _value: boolean | undefined;

    constructor(elRef: ElementRef<HTMLElement>, private _renderer: Renderer2, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(
            elRef,
            ++SvgButtonNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
            ControlComponentBaseNgDirective.clickControlStateColorItemIdArray,
        );
        this._bkgdColorCssVarName = this.getBkgdColorCssVariableName(SvgButtonNgComponent.buttonColorItemId);
        this._foreColorCssVarName = this.getForeColorCssVariableName(SvgButtonNgComponent.buttonColorItemId);
        this._selectedBorderForeColorCssVarName = this.getForeColorCssVariableName(SvgButtonNgComponent.selectedBorderColorItemId);
        this._hoverBkgdColorCssVarName = this.getBkgdColorCssVariableName(SvgButtonNgComponent.hoverColorItemId);

        this.inputId = 'SvgButton' + this.typeInstanceId;
    }

    @Input() set svg(value: string) {
        this._svg = value;
        this.spriteLink = `${value}#only`;
    }
    public override get uiAction() { return super.uiAction as IconButtonUiAction; }

    ngOnInit() {
        this.setInitialiseReady();
    }

    public onClick(event: Event) {
        if (!(event instanceof MouseEvent)) {
            throw new AssertInternalError('FBICOE9846652');
        } else {
            const downKeys = ModifierKey.IdSet.create(event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
            this.uiAction.signal(UiAction.SignalTypeId.MouseClick, downKeys);
        }
    }

    public onEnterKeyDown(event: Event) {
        if (!(event instanceof KeyboardEvent)) {
            throw new AssertInternalError('FBICOSED6555739');
        } else {
            const downKeys = ModifierKey.IdSet.create(event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
            this.uiAction.signal(UiAction.SignalTypeId.EnterKeyPress, downKeys);
        }
    }

    public onSpacebarKeyDown(event: Event) {
        if (!(event instanceof KeyboardEvent)) {
            throw new AssertInternalError('FBICOSKD232005339');
        } else {
            const downKeys = ModifierKey.IdSet.create(event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
            this.uiAction.signal(UiAction.SignalTypeId.SpacebarKeyPress, downKeys);
        }
    }

    protected override applyStateId(newState: UiAction.StateId) {
        super.applyStateId(newState);
        this.updateButtonClass();
    }

    protected override applySettingColors() {
        const bkgdColor = this.getBkgdColor(SvgButtonNgComponent.buttonColorItemId);
        const foreColor = this.getForeColor(SvgButtonNgComponent.buttonColorItemId);
        const selectedBorderForeColor = this.getForeColor(SvgButtonNgComponent.selectedBorderColorItemId);
        const hoverBkgdColor = this.getBkgdColor(SvgButtonNgComponent.hoverColorItemId);
        this._renderer.setProperty(this._iconComponent, this._bkgdColorCssVarName, bkgdColor);
        this._renderer.setProperty(this._iconComponent, this._foreColorCssVarName, foreColor);
        this._renderer.setProperty(this._buttonRef, this._selectedBorderForeColorCssVarName, selectedBorderForeColor);
        this._renderer.setProperty(this._buttonRef, this._hoverBkgdColorCssVarName, hoverBkgdColor);
        this.markForCheck();
    }

    protected override setUiAction(action: IconButtonUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: IconButtonUiAction.PushEventHandlersInterface = {
            value: (value, edited) => this.handleValuePushEvent(value, edited),
            icon: (definition) => this.handleIconPushEvent(definition)
        };
        this._pushFaButtonEventsSubscriptionId = this.uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyValue(action.value, action.edited);
        if (action.iconId !== undefined) {
            this.applyIcon(action.iconId);
        }
    }

    protected override finalise() {
        this.uiAction.unsubscribePushEvents(this._pushFaButtonEventsSubscriptionId);
        super.finalise();
    }

    private handleValuePushEvent(value: boolean | undefined, edited: boolean) {
        this.applyValue(value, edited);
    }

    private handleIconPushEvent(iconId: IconButtonUiAction.IconId | undefined) {
        this.applyIcon(iconId);
    }

    private applyValue(value: boolean | undefined, _edited: boolean) {
        this._value = value;
        this.updateButtonClass();
    }

    private applyIcon(iconId: IconButtonUiAction.IconId | undefined) {
        const newSvg = iconId === undefined ? '' : SvgButtonNgComponent.Lookup.idToSvg(iconId);

        if (newSvg !== this.svg) {
            this.svg = newSvg;
            this.markForCheck();
        }
    }

    private calculateSelectedDisabledClass() {
        if (this.stateId === UiAction.StateId.Disabled) {
            return SvgButtonNgComponent.SelectedDisabledClass.disabled;
        } else {
            if (this._value === undefined || !this._value) {
                return SvgButtonNgComponent.SelectedDisabledClass.unselected;
            } else {
                return SvgButtonNgComponent.SelectedDisabledClass.selected;
            }
        }
    }

    private updateButtonClass() {
        const selectedDisabledClass = this.calculateSelectedDisabledClass();
        if (selectedDisabledClass !== this.selectedDisabledClass) {
            this.selectedDisabledClass = selectedDisabledClass;
            this.markForCheck();
        }
    }
}

export namespace SvgButtonNgComponent {
    export const buttonColorItemId = ColorScheme.ItemId.IconButton;
    export const selectedBorderColorItemId = ColorScheme.ItemId.IconButton_SelectedBorder;
    export const hoverColorItemId = ColorScheme.ItemId.IconButton_Hover;

    export namespace SelectedDisabledClass {
        export const disabled = 'disabled';
        export const unselected = 'unselected';
        export const selected = 'selected';
    }

    export namespace Lookup {
        export type Id = IconButtonUiAction.IconId;

        interface Info {
            readonly id: Id;
            readonly svg: string;
        }

        type InfosObject = { [id in keyof typeof IconButtonUiAction.IconId]: Info };

        const infosObject: InfosObject = {
            Blankest: { id: IconButtonUiAction.IconId.Blankest, svg: nounBlankSvg },
            PrimaryDitemFrame: { id: IconButtonUiAction.IconId.PrimaryDitemFrame, svg: nounTargetSvg },
            SymbolLink: { id: IconButtonUiAction.IconId.SymbolLink, svg: nounSymbolLinkSvg },
            AccountGroupLink: { id: IconButtonUiAction.IconId.AccountGroupLink, svg: nounAccountLinkSvg },
            SubWindowReturn: { id: IconButtonUiAction.IconId.SubWindowReturn, svg: nounReturnSvg },
            CopyToClipboard: { id: IconButtonUiAction.IconId.CopyToClipboard, svg: nounClipboardSvg },
            Execute: { id: IconButtonUiAction.IconId.Execute, svg: nounBoltSvg },
            BuyOrderPad: { id: IconButtonUiAction.IconId.BuyOrderPad, svg: nounFilePlusSvg },
            SellOrderPad: { id: IconButtonUiAction.IconId.SellOrderPad, svg: nounFileMinusSvg },
            AmendOrderPad: { id: IconButtonUiAction.IconId.AmendOrderPad, svg: nounWriteFileSvg },
            CancelOrderPad: { id: IconButtonUiAction.IconId.CancelOrderPad, svg: nounFileRemoveSvg },
            MoveOrderPad: { id: IconButtonUiAction.IconId.MoveOrderPad, svg: nounNextFileSvg },
            SelectColumns: { id: IconButtonUiAction.IconId.SelectColumns, svg: nounSelectColumnSvg },
            AutoSizeColumnWidths: { id: IconButtonUiAction.IconId.AutoSizeColumnWidths, svg: nounGridWidthSvg },
            RollUp: { id: IconButtonUiAction.IconId.RollUp, svg: nounUpChevronSvg },
            RollDown: { id: IconButtonUiAction.IconId.RollDown, svg: nounDownChevronSvg },
            Filter: { id: IconButtonUiAction.IconId.Filter, svg: nounFilterSvg },
            Save: { id: IconButtonUiAction.IconId.Save, svg: nounSaveOperationSvg },
            DeleteSymbol: { id: IconButtonUiAction.IconId.DeleteSymbol, svg: nounCloseSvg },
            NewWatchlist: { id: IconButtonUiAction.IconId.NewWatchlist, svg: nounListSvg },
            OpenWatchlist: { id: IconButtonUiAction.IconId.OpenWatchlist, svg: nounFolderSvg },
            SaveWatchlist: { id: IconButtonUiAction.IconId.SaveWatchlist, svg: nounSaveDocumentSvg },
            Lighten: { id: IconButtonUiAction.IconId.Lighten, svg: nounLightBulbSvg },
            Darken: { id: IconButtonUiAction.IconId.Darken, svg: nounSunglassesSvg },
            Brighten: { id: IconButtonUiAction.IconId.Brighten, svg: nounBrightnessFullSvg },
            Complement: { id: IconButtonUiAction.IconId.Complement, svg: nounFlipSvg },
            Saturate: { id: IconButtonUiAction.IconId.Saturate, svg: nounTintHollowSvg },
            Desaturate: { id: IconButtonUiAction.IconId.Desaturate, svg: nounNoTintSvg },
            SpinColor: { id: IconButtonUiAction.IconId.SpinColor, svg: nounSpinningSvg },
            CopyColor: { id: IconButtonUiAction.IconId.CopyColor, svg: nounMirrorSvg },
            ReturnOk: { id: IconButtonUiAction.IconId.ReturnOk, svg: nounReturnSvg },
            ReturnCancel: { id: IconButtonUiAction.IconId.ReturnCancel, svg: nounCancelSvg },
            SearchNext: { id: IconButtonUiAction.IconId.SearchNext, svg: nounSearchNextSvg },
            CancelSearch: { id: IconButtonUiAction.IconId.CancelSearch, svg: nounCancelSearchSvg },
            MoveUp: { id: IconButtonUiAction.IconId.MoveUp, svg: nounArrowUpSvg },
            MoveToTop: { id: IconButtonUiAction.IconId.MoveToTop, svg: nounMoveToTopSvg },
            MoveDown: { id: IconButtonUiAction.IconId.MoveDown, svg: nounArrowDownSvg, },
            MoveToBottom: { id: IconButtonUiAction.IconId.MoveToBottom, svg: nounMoveToBottomSvg },
            NotHistorical: { id: IconButtonUiAction.IconId.NotHistorical, svg: nounRemoveEventSvg },
            Historical: { id: IconButtonUiAction.IconId.Historical, svg: nounSearchEventSvg },
            HistoricalCompare: { id: IconButtonUiAction.IconId.HistoricalCompare, svg: nounCodeEventSvg },
            Details: { id: IconButtonUiAction.IconId.Details, svg: nounDetailsSvg },
            ToggleSearchTermNotExchangedMarketProcessed: { id: IconButtonUiAction.IconId.ToggleSearchTermNotExchangedMarketProcessed, svg: nounWorldSvg },
            ExpandVertically: { id: IconButtonUiAction.IconId.ExpandVertically, svg: nounExpandVerticalSvg },
            RestoreVertically: { id: IconButtonUiAction.IconId.RestoreVertically, svg: nounMinimizeSvg },
            CollapseVertically: { id: IconButtonUiAction.IconId.CollapseVertically, svg: nounCollapseVerticalSvg },
            MarkAll: { id: IconButtonUiAction.IconId.MarkAll, svg: nounMarkAllSvg },
            InsertIntoListFromLeft: { id: IconButtonUiAction.IconId.InsertIntoListFromLeft, svg: nounLoginSvg },
            RemoveFromListToLeft: { id: IconButtonUiAction.IconId.RemoveFromListToLeft, svg: nounLogoutSvg },
            Dot: { id: IconButtonUiAction.IconId.Dot, svg: nounDotSvg },
        };

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('SvgButtonComponent.Lookup', outOfOrderIdx, outOfOrderIdx.toString(10));
            }
        }

        export function idToSvg(id: Id) {
            return infos[id].svg;
        }
    }
}
