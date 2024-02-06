/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import {
    AssertInternalError,
    ColorScheme,
    EnumInfoOutOfOrderError,
    IconButtonUiAction,
    ModifierKey,
    MultiEvent,
    UiAction
} from '@motifmarkets/motif-core';
import { SvgIconComponent, SvgIconRegistryService } from 'angular-svg-icon';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../../../ng/control-component-base-ng.directive';
import nounArrowDownSvg from './svg/noun-arrow-down-70422.svg';
import nounClose82107Svg from './svg/noun-close-82107.svg';
import nounCollapseVerticalSvg from './svg/noun-collapse-vertical-2439339.svg';
import nounExclamationSvg from './svg/noun-exclamation-1447148-cropped.svg';
import nounExpandVerticalSvg from './svg/noun-expand-vertical-2439362.svg';
import nounLoginSvg from './svg/noun-login-4123950.svg';
import nounLogoutSvg from './svg/noun-logout-4124631.svg';
import nounMarkAllSvg from './svg/noun-mark-all-3067122.svg';
import nounMinimizeSvg from './svg/noun-minimize-4143571.svg';
import nounMoveToBottomSvg from './svg/noun-move-to-bottom-269053.svg';
import nounMoveToTopSvg from './svg/noun-move-to-top-269054.svg';
import nounResize4146882Svg from './svg/noun-resize-4146882.svg';
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
// 3. Save in ./svg subfolder
// 4. Make sure it includes fill="currentcolor"
// 5. If necessary, remove height and width
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
export class SvgButtonNgComponent extends ControlComponentBaseNgDirective implements OnInit, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    @Input() inputId: string;
    @Input() public svgName: string;

    @ViewChild('button', { static: true }) private _buttonRef: ElementRef;
    @ViewChild('svgIcon', { static: true }) private _iconComponent: SvgIconComponent;

    public selectedDisabledClass: string;

    private _pushFaButtonEventsSubscriptionId: MultiEvent.SubscriptionId;

    private _bkgdColorCssVarName: string;
    private _foreColorCssVarName: string;
    private _selectedBorderForeColorCssVarName: string;
    private _hoverBkgdColorCssVarName: string;

    private _value: boolean | undefined;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private _renderer: Renderer2,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService
    ) {
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

    public override get uiAction() { return super.uiAction as IconButtonUiAction | undefined; }

    ngOnInit() {
        this.setInitialiseReady();
    }

    ngAfterViewInit(): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._iconComponent === undefined) {
            throw new AssertInternalError('SBNCNAVI66698');
        }
    }

    public onClick(event: Event) {
        if (!(event instanceof MouseEvent)) {
            throw new AssertInternalError('FBICOE9846652');
        } else {
            const uiAction = this.uiAction;
            if (uiAction === undefined) {
                throw new AssertInternalError('SBNCOC555312');
            } else {
                const downKeys = ModifierKey.IdSet.create(event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
                uiAction.signal(UiAction.SignalTypeId.MouseClick, downKeys);
            }
        }
    }

    public onEnterKeyDown(event: Event) {
        if (!(event instanceof KeyboardEvent)) {
            throw new AssertInternalError('FBICOSED6555739');
        } else {
            const uiAction = this.uiAction;
            if (uiAction === undefined) {
                throw new AssertInternalError('SBNCOEKD555312');
            } else {
                const downKeys = ModifierKey.IdSet.create(event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
                uiAction.signal(UiAction.SignalTypeId.EnterKeyPress, downKeys);
            }
        }
    }

    public onSpacebarKeyDown(event: Event) {
        if (!(event instanceof KeyboardEvent)) {
            throw new AssertInternalError('FBICOSKD232005339');
        } else {
            const uiAction = this.uiAction;
            if (uiAction === undefined) {
                throw new AssertInternalError('SBNCOSBD555312');
            } else {
                const downKeys = ModifierKey.IdSet.create(event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
                uiAction.signal(UiAction.SignalTypeId.SpacebarKeyPress, downKeys);
            }
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
        this._pushFaButtonEventsSubscriptionId = action.subscribePushEvents(pushEventHandlersInterface);

        this.applyValue(action.value, action.edited);
        if (action.iconId !== undefined) {
            this.applyIcon(action.iconId);
        }
    }

    protected override finalise() {
        const uiAction = this.uiAction;
        if (uiAction !== undefined) {
            uiAction.unsubscribePushEvents(this._pushFaButtonEventsSubscriptionId);
        }
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
        const newSvgName = iconId === undefined ? '' : SvgButtonNgComponent.Lookup.idToName(iconId);

        if (newSvgName !== this.svgName) {
            this.svgName = newSvgName;
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
            readonly name: string;
            readonly svg: string;
        }

        type InfosObject = { [id in keyof typeof IconButtonUiAction.IconId]: Info };

        const infosObject: InfosObject = {
            Blankest: { id: IconButtonUiAction.IconId.Blankest,
                name: 'Blankest',
                svg: nounBlankSvg
            },
            PrimaryDitemFrame: { id: IconButtonUiAction.IconId.PrimaryDitemFrame,
                name: 'PrimaryDitemFrame',
                svg: nounTargetSvg
            },
            SymbolLink: { id: IconButtonUiAction.IconId.SymbolLink,
                name: 'SymbolLink',
                svg: nounSymbolLinkSvg
            },
            AccountGroupLink: { id: IconButtonUiAction.IconId.AccountGroupLink,
                name: 'AccountGroupLink',
                svg: nounAccountLinkSvg
            },
            SubWindowReturn: { id: IconButtonUiAction.IconId.SubWindowReturn,
                name: 'SubWindowReturn',
                svg: nounReturnSvg
            },
            CopyToClipboard: { id: IconButtonUiAction.IconId.CopyToClipboard,
                name: 'CopyToClipboard',
                svg: nounClipboardSvg
            },
            Execute: { id: IconButtonUiAction.IconId.Execute,
                name: 'Execute',
                svg: nounBoltSvg
            },
            BuyOrderPad: { id: IconButtonUiAction.IconId.BuyOrderPad,
                name: 'BuyOrderPad',
                svg: nounFilePlusSvg
            },
            SellOrderPad: { id: IconButtonUiAction.IconId.SellOrderPad,
                name: 'SellOrderPad',
                svg: nounFileMinusSvg
            },
            AmendOrderPad: { id: IconButtonUiAction.IconId.AmendOrderPad,
                name: 'AmendOrderPad',
                svg: nounWriteFileSvg
            },
            CancelOrderPad: { id: IconButtonUiAction.IconId.CancelOrderPad,
                name: 'CancelOrderPad',
                svg: nounFileRemoveSvg
            },
            MoveOrderPad: { id: IconButtonUiAction.IconId.MoveOrderPad,
                name: 'MoveOrderPad',
                svg: nounNextFileSvg
            },
            SelectColumns: { id: IconButtonUiAction.IconId.SelectColumns,
                name: 'SelectColumns',
                svg: nounSelectColumnSvg
            },
            AutoSizeColumnWidths: { id: IconButtonUiAction.IconId.AutoSizeColumnWidths,
                name: 'AutoSizeColumnWidths',
                svg: nounGridWidthSvg
            },
            RollUp: { id: IconButtonUiAction.IconId.RollUp,
                name: 'RollUp',
                svg: nounUpChevronSvg
            },
            RollDown: { id: IconButtonUiAction.IconId.RollDown,
                name: 'RollDown',
                svg: nounDownChevronSvg
            },
            Filter: { id: IconButtonUiAction.IconId.Filter,
                name: 'Filter',
                svg: nounFilterSvg
            },
            Save: { id: IconButtonUiAction.IconId.Save,
                name: 'Save',
                svg: nounSaveOperationSvg
            },
            DeleteSymbol: { id: IconButtonUiAction.IconId.DeleteSymbol,
                name: 'DeleteSymbol',
                svg: nounCloseSvg
            },
            NewWatchlist: { id: IconButtonUiAction.IconId.NewWatchlist,
                name: 'NewWatchlist',
                svg: nounListSvg
            },
            OpenWatchlist: { id: IconButtonUiAction.IconId.OpenWatchlist,
                name: 'OpenWatchlist',
                svg: nounFolderSvg
            },
            SaveWatchlist: { id: IconButtonUiAction.IconId.SaveWatchlist,
                name: 'SaveWatchlist',
                svg: nounSaveDocumentSvg
            },
            Lighten: { id: IconButtonUiAction.IconId.Lighten,
                name: 'Lighten',
                svg: nounLightBulbSvg
            },
            Darken: { id: IconButtonUiAction.IconId.Darken,
                name: 'Darken',
                svg: nounSunglassesSvg
            },
            Brighten: { id: IconButtonUiAction.IconId.Brighten,
                name: 'Brighten',
                svg: nounBrightnessFullSvg
            },
            Complement: { id: IconButtonUiAction.IconId.Complement,
                name: 'Complement',
                svg: nounFlipSvg
            },
            Saturate: { id: IconButtonUiAction.IconId.Saturate,
                name: 'Saturate',
                svg: nounTintHollowSvg
            },
            Desaturate: { id: IconButtonUiAction.IconId.Desaturate,
                name: 'Desaturate',
                svg: nounNoTintSvg
            },
            SpinColor: { id: IconButtonUiAction.IconId.SpinColor,
                name: 'SpinColor',
                svg: nounSpinningSvg
            },
            CopyColor: { id: IconButtonUiAction.IconId.CopyColor,
                name: 'CopyColor',
                svg: nounMirrorSvg
            },
            ReturnOk: { id: IconButtonUiAction.IconId.ReturnOk,
                name: 'ReturnOk',
                svg: nounReturnSvg
            },
            ReturnCancel: { id: IconButtonUiAction.IconId.ReturnCancel,
                name: 'ReturnCancel',
                svg: nounCancelSvg
            },
            SearchNext: { id: IconButtonUiAction.IconId.SearchNext,
                name: 'SearchNext',
                svg: nounSearchNextSvg
            },
            CancelSearch: { id: IconButtonUiAction.IconId.CancelSearch,
                name: 'CancelSearch',
                svg: nounCancelSearchSvg
            },
            MoveUp: { id: IconButtonUiAction.IconId.MoveUp,
                name: 'MoveUp',
                svg: nounArrowUpSvg
            },
            MoveToTop: { id: IconButtonUiAction.IconId.MoveToTop,
                name: 'MoveToTop',
                svg: nounMoveToTopSvg
            },
            MoveDown: { id: IconButtonUiAction.IconId.MoveDown,
                name: 'MoveDown',
                svg: nounArrowDownSvg,
            },
            MoveToBottom: { id: IconButtonUiAction.IconId.MoveToBottom,
                name: 'MoveToBottom',
                svg: nounMoveToBottomSvg
            },
            NotHistorical: { id: IconButtonUiAction.IconId.NotHistorical,
                name: 'NotHistorical',
                svg: nounRemoveEventSvg
            },
            Historical: { id: IconButtonUiAction.IconId.Historical,
                name: 'Historical',
                svg: nounSearchEventSvg
            },
            HistoricalCompare: { id: IconButtonUiAction.IconId.HistoricalCompare,
                name: 'HistoricalCompare',
                svg: nounCodeEventSvg
            },
            Details: { id: IconButtonUiAction.IconId.Details,
                name: 'Details',
                svg: nounDetailsSvg
            },
            ToggleSearchTermNotExchangedMarketProcessed: { id: IconButtonUiAction.IconId.ToggleSearchTermNotExchangedMarketProcessed,
                name: 'ToggleSearchTermNotExchangedMarketProcessed',
                svg: nounWorldSvg
            },
            ExpandVertically: { id: IconButtonUiAction.IconId.ExpandVertically,
                name: 'ExpandVertically',
                svg: nounExpandVerticalSvg
            },
            RestoreVertically: { id: IconButtonUiAction.IconId.RestoreVertically,
                name: 'RestoreVertically',
                svg: nounMinimizeSvg
            },
            CollapseVertically: { id: IconButtonUiAction.IconId.CollapseVertically,
                name: 'CollapseVertically',
                svg: nounCollapseVerticalSvg
            },
            MarkAll: { id: IconButtonUiAction.IconId.MarkAll,
                name: 'MarkAll',
                svg: nounMarkAllSvg
            },
            InsertIntoListFromLeft: { id: IconButtonUiAction.IconId.InsertIntoListFromLeft,
                name: 'InsertIntoListFromLeft',
                svg: nounLoginSvg
            },
            RemoveFromListToLeft: { id: IconButtonUiAction.IconId.RemoveFromListToLeft,
                name: 'RemoveFromListToLeft',
                svg: nounLogoutSvg
            },
            RemoveSelectedFromList: { id: IconButtonUiAction.IconId.RemoveSelectedFromList,
                name: 'RemoveSelectedFromList',
                svg: nounClose82107Svg
            },
            EnlargeToTopLeft: { id: IconButtonUiAction.IconId.EnlargeToTopLeft,
                name: 'EnlargeToTopLeft',
                svg: nounResize4146882Svg
            },
            Dot: { id: IconButtonUiAction.IconId.Dot,
                name: 'Dot',
                svg: nounDotSvg
            },
            Exclamation: { id: IconButtonUiAction.IconId.Exclamation,
                name: 'Exclamation',
                svg: nounExclamationSvg
            },
            Delete: { id: IconButtonUiAction.IconId.Delete,
                name: 'Delete',
                svg: nounExclamationSvg // need to fix
            },
        };

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise(svgIconRegistryService: SvgIconRegistryService) {
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                if (info.id !== i as IconButtonUiAction.IconId) {
                    throw new EnumInfoOutOfOrderError('SvgButtonComponent.Lookup', i, info.name);
                } else {
                    svgIconRegistryService.addSvg(info.name, info.svg);
                }
            }
        }

        export function idToName(id: Id) {
            return infos[id].name;
        }
    }
}

export namespace SvgButtonNgComponentModule {
    export function initialiseStatic(svgIconRegistryService: SvgIconRegistryService) {
        SvgButtonNgComponent.Lookup.initialise(svgIconRegistryService);
    }
}
