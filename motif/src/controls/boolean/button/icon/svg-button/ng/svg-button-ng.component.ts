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
import './svg/noun-collapse-vertical-2439339.svg';
import './svg/noun-expand-vertical-2439362.svg';
import './svg/noun-mark-all-3067122.svg';
import './svg/noun-minimize-4143571.svg';
import './svg/noun_Brightness-Full_218687.svg';
import './svg/noun_Cancel-Search_677094.svg';
import './svg/noun_Close_82107.svg';
import './svg/noun_File-Plus_1669467.svg';
import './svg/noun_Folder_3438446.svg';
import './svg/noun_Light-Bulb_3019480.svg';
import './svg/noun_List_1242568.svg';
import './svg/noun_No-Tint_120407.svg';
import './svg/noun_Save_3141427.svg';
import './svg/noun_Save_801270.svg';
import './svg/noun_Search-event_515474.svg';
import './svg/noun_Sunglasses_3668612.svg';
import './svg/noun_Target_1492976.svg';
import './svg/noun_Tint-Hollow_120409.svg';
import './svg/noun_Write-File_1669429.svg';
import './svg/noun_blank_1667007.svg';
import './svg/noun_bolt_3396896.svg';
import './svg/noun_cancel_1896724.svg';
import './svg/noun_clipboard_158395.svg';
import './svg/noun_code-event_515475.svg';
import './svg/noun_details_251351.svg';
import './svg/noun_dot_658609.svg';
import './svg/noun_down-chevron_3529447.svg';
import './svg/noun_file-minus_1669468.svg';
import './svg/noun_file-remove_1669462.svg';
import './svg/noun_filter_1252200.svg';
import './svg/noun_flip_2063119.svg';
import './svg/noun_grid-width_834238.svg';
import './svg/noun_link_1096675.svg';
import './svg/noun_link_2220043.svg';
import './svg/noun_mirror_26874.svg';
import './svg/noun_next-file_1669433.svg';
import './svg/noun_remove-event_515462.svg';
import './svg/noun_return_1651212.svg';
import './svg/noun_search-next_677099.svg';
import './svg/noun_select-column_1779607.svg';
import './svg/noun_spinning_997678.svg';
import './svg/noun_up-chevron_3529491.svg';
import './svg/noun_world_2593665.svg';

@Component({
    selector: 'app-svg-button',
    templateUrl: './svg-button-ng.component.html',
    styleUrls: ['./svg-button-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgButtonNgComponent extends ControlComponentBaseNgDirective implements OnInit {
    @Input() sprite: string;
    @Input() inputId: string;

    @ViewChild('button', { static: true }) private _buttonRef: ElementRef;
    @ViewChild('svg', { static: true }) private _iconComponent: ElementRef;

    public selectedDisabledClass: string;

    private _pushFaButtonEventsSubscriptionId: MultiEvent.SubscriptionId;

    private _bkgdColorCssVarName: string;
    private _foreColorCssVarName: string;
    private _selectedBorderForeColorCssVarName: string;
    private _hoverBkgdColorCssVarName: string;

    private _value: boolean | undefined;

    constructor(private _renderer: Renderer2, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(cdr, settingsNgService.service, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);
        this._bkgdColorCssVarName = this.getBkgdColorCssVariableName(SvgButtonNgComponent.buttonColorItemId);
        this._foreColorCssVarName = this.getForeColorCssVariableName(SvgButtonNgComponent.buttonColorItemId);
        this._selectedBorderForeColorCssVarName = this.getForeColorCssVariableName(SvgButtonNgComponent.selectedBorderColorItemId);
        this._hoverBkgdColorCssVarName = this.getBkgdColorCssVariableName(SvgButtonNgComponent.hoverColorItemId);

        this.inputId = 'SvgButton' + this.componentInstanceId;
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
        const newSprite = iconId === undefined ? '' : SvgButtonNgComponent.Lookup.idToSprite(iconId);

        if (newSprite !== this.sprite) {
            this.sprite = newSprite;
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
            readonly spriteId: string;
        }

        type InfosObject = { [id in keyof typeof IconButtonUiAction.IconId]: Info };

        const infosObject: InfosObject = {
            Blankest: { id: IconButtonUiAction.IconId.Blankest,
                spriteId: 'noun_blank_1667007' }, // falSquare
            PrimaryDitemFrame: { id: IconButtonUiAction.IconId.PrimaryDitemFrame,
                spriteId: 'noun_Target_1492976' }, // falCompressArrowsAlt
            SymbolLink: { id: IconButtonUiAction.IconId.SymbolLink,
                spriteId: 'noun_link_2220043' }, // falLink
            AccountGroupLink: { id: IconButtonUiAction.IconId.AccountGroupLink,
                spriteId: 'noun_link_1096675' }, // falFolderTree
            SubWindowReturn: { id: IconButtonUiAction.IconId.SubWindowReturn,
                spriteId: 'noun_return_1651212' }, // falArrowAltLeft
            CopyToClipboard: { id: IconButtonUiAction.IconId.CopyToClipboard,
                spriteId: 'noun_clipboard_158395' }, // falCopy
            Execute: { id: IconButtonUiAction.IconId.Execute,
                spriteId: 'noun_bolt_3396896' }, // falBolt
            BuyOrderPad: { id: IconButtonUiAction.IconId.BuyOrderPad,
                spriteId: 'noun_File-Plus_1669467' }, // falFilePlus
            SellOrderPad: { id: IconButtonUiAction.IconId.SellOrderPad,
                spriteId: 'noun_file-minus_1669468' }, // falFileMinus
            AmendOrderPad: { id: IconButtonUiAction.IconId.AmendOrderPad,
                spriteId: 'noun_Write-File_1669429' }, // falFileEdit
            CancelOrderPad: { id: IconButtonUiAction.IconId.CancelOrderPad,
                spriteId: 'noun_file-remove_1669462' }, // falFileTimes
            MoveOrderPad: { id: IconButtonUiAction.IconId.MoveOrderPad,
                spriteId: 'noun_next-file_1669433' }, // falFileExport
            SelectColumns: { id: IconButtonUiAction.IconId.SelectColumns,
                spriteId: 'noun_select-column_1779607' }, // falColumns
            AutoSizeColumnWidths: { id: IconButtonUiAction.IconId.AutoSizeColumnWidths,
                spriteId: 'noun_grid-width_834238' }, // falArrowsH
            RollUp: { id: IconButtonUiAction.IconId.RollUp,
                spriteId: 'noun_up-chevron_3529491' }, // falChevronDoubleUp
            RollDown: { id: IconButtonUiAction.IconId.RollDown,
                spriteId: 'noun_down-chevron_3529447' }, // falChevronDoubleDown
            Filter: { id: IconButtonUiAction.IconId.Filter,
                spriteId: 'noun_filter_1252200' }, // falFilter
            Save: { id: IconButtonUiAction.IconId.Save,
                spriteId: 'noun_Save_3141427' }, // falSave
            DeleteSymbol: { id: IconButtonUiAction.IconId.DeleteSymbol,
                spriteId: 'noun_Close_82107' }, // falMinus
            NewWatchlist: { id: IconButtonUiAction.IconId.NewWatchlist,
                spriteId: 'noun_List_1242568' }, // falFileSpreadsheet
            OpenWatchlist: { id: IconButtonUiAction.IconId.OpenWatchlist,
                spriteId: 'noun_Folder_3438446' }, // falFolderOpen
            SaveWatchlist: { id: IconButtonUiAction.IconId.SaveWatchlist,
                spriteId: 'noun_Save_801270' }, // falSave
            Lighten: { id: IconButtonUiAction.IconId.Lighten,
                spriteId: 'noun_Light-Bulb_3019480' }, // falLightbulbOn
            Darken: { id: IconButtonUiAction.IconId.Darken,
                spriteId: 'noun_Sunglasses_3668612' }, // farSunglasses
            Brighten: { id: IconButtonUiAction.IconId.Brighten,
                spriteId: 'noun_Brightness-Full_218687' }, // falSun
            Complement: { id: IconButtonUiAction.IconId.Complement,
                spriteId: 'noun_flip_2063119' }, // farAdjust
            Saturate: { id: IconButtonUiAction.IconId.Saturate,
                spriteId: 'noun_Tint-Hollow_120409' }, // falTint
            Desaturate: { id: IconButtonUiAction.IconId.Desaturate,
                spriteId: 'noun_No-Tint_120407' }, // falTintSlash
            SpinColor: { id: IconButtonUiAction.IconId.SpinColor,
                spriteId: 'noun_spinning_997678' }, // falSpinner
            CopyColor: { id: IconButtonUiAction.IconId.CopyColor,
                spriteId: 'noun_mirror_26874' }, // falShare
            ReturnOk: { id: IconButtonUiAction.IconId.ReturnOk,
                spriteId: 'noun_return_1651212' }, // fasArrowAltLeft
            ReturnCancel: { id: IconButtonUiAction.IconId.ReturnCancel,
                spriteId: 'noun_cancel_1896724' }, // fasWindowClose
            SearchNext: { id: IconButtonUiAction.IconId.SearchNext,
                spriteId: 'noun_search-next_677099' }, // falCaretDown
            CancelSearch: { id: IconButtonUiAction.IconId.CancelSearch,
                spriteId: 'noun_Cancel-Search_677094' }, // falTimes
            MoveUp: { id: IconButtonUiAction.IconId.MoveUp,
                spriteId: 'noun-up-70478' }, // falArrowAltUp
            MoveToTop: { id: IconButtonUiAction.IconId.MoveToTop,
                spriteId: 'noun-move-to-top-269054.svg' }, // falArrowAltToTop
            MoveDown: { id: IconButtonUiAction.IconId.MoveDown,
                spriteId: 'noun-arrow-down-70422', }, // falArrowAltDown
            MoveToBottom: { id: IconButtonUiAction.IconId.MoveToBottom,
                spriteId: 'noun-move-to-bottom-269053.svg' }, // falArrowAltToBottom
            NotHistorical: { id: IconButtonUiAction.IconId.NotHistorical,
                spriteId: 'noun_remove-event_515462' }, // falCalendarTimes
            Historical: { id: IconButtonUiAction.IconId.Historical,
                spriteId: 'noun_Search-event_515474' }, // falCalendarAlt
            HistoricalCompare: { id: IconButtonUiAction.IconId.HistoricalCompare,
                spriteId: 'noun_code-event_515475' }, // falCalendarMinus
            Details: { id: IconButtonUiAction.IconId.Details,
                spriteId: 'noun_details_251351' }, // falInfo
            ToggleSearchTermNotExchangedMarketProcessed: { id: IconButtonUiAction.IconId.ToggleSearchTermNotExchangedMarketProcessed,
                spriteId: 'noun_world_2593665' },
            ExpandVertically: { id: IconButtonUiAction.IconId.ExpandVertically,
                spriteId: 'noun-expand-vertical-2439362' },
            RestoreVertically: { id: IconButtonUiAction.IconId.RestoreVertically,
                spriteId: 'noun-minimize-4143571' },
            CollapseVertically: { id: IconButtonUiAction.IconId.CollapseVertically,
                spriteId: 'noun-collapse-vertical-2439339' },
            MarkAll: { id: IconButtonUiAction.IconId.MarkAll,
                spriteId: 'noun-mark-all-3067122' },
            InsertIntoListFromLeft: { id: IconButtonUiAction.IconId.InsertIntoListFromLeft,
                spriteId: 'noun-login-4123950' },
            RemoveFromListToLeft: { id: IconButtonUiAction.IconId.RemoveFromListToLeft,
                spriteId: 'noun-logout-4124631' },
        };

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('SvgButtonComponent.Lookup', outOfOrderIdx, outOfOrderIdx.toString(10));
            }
        }

        export function idToSprite(id: Id) {
            return infos[id].spriteId;
        }
    }
}
