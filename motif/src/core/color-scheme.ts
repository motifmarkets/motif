/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EnumInfoOutOfOrderError, Integer, UnreachableCaseError } from 'src/sys/internal-api';

export class ColorScheme {
    private _items = new Array<ColorScheme.Item>(ColorScheme.Item.idCount);

    constructor(private _name: string, private _builtIn: boolean) { }

    get name() { return this._name; }
    get builtIn() { return this._builtIn; }
    get items() { return this._items; }

    resolve(itemId: ColorScheme.ItemId): ColorScheme.ResolvedItem {
        let bkgdResolver = ColorScheme.Item.idToBkgdResolver(itemId);
        if (bkgdResolver === undefined) {
            bkgdResolver = ColorScheme.resolveBkgdColor_Unexpected;
        }
        const bkgd = bkgdResolver(this.items);

        let foreResolver = ColorScheme.Item.idToForeResolver(itemId);
        if (foreResolver === undefined) {
            foreResolver = ColorScheme.resolveForeColor_Unexpected;
        }
        const fore = foreResolver(this.items);

        return {
            bkgd,
            fore
        };
    }

    differencesFrom(otherScheme: ColorScheme) {
        const differences = new Array<ColorScheme.Item>(ColorScheme.Item.idCount);
        let count = 0;
        for (let i = 0; i < ColorScheme.Item.idCount; i++) {
            const otherItem = otherScheme.items[i];
            if (!ColorScheme.Item.areColorsEqual(this.items[i], otherItem)) {
                differences[count++] = this.items[i]; // note takes referenence - dont change
            }
        }
        differences.length = count;
        return differences;
    }

    createCopy() {
        const result = new ColorScheme(this.name, this.builtIn);
        for (let i = 0; i < ColorScheme.Item.idCount; i++) {
            result._items[i] = ColorScheme.Item.createCopy(this.items[i]);
        }
        return result;
    }
}

export namespace ColorScheme {
    export const schemeInheritColor = '';
    export const schemeTransparentColor = 'transparent';
    export const cssInheritColor = 'inherit';
    export const cssTransparentColor = schemeTransparentColor;

    export type OpaqueColor = string; // non-transparent color explicitly defined for an item
    export type ItemColor = OpaqueColor | '' | 'transparent';
    export type ResolvedColor = string;

    export enum BkgdForeId {
        Bkgd,
        Fore,
    }

    export namespace BkgdFore {
        export function getOther(id: BkgdForeId) {
            switch (id) {
                case BkgdForeId.Bkgd: return BkgdForeId.Fore;
                case BkgdForeId.Fore: return BkgdForeId.Bkgd;
                default: throw new UnreachableCaseError('CSBFGO4482177', id);
            }
        }
    }

    export interface ResolvedItem {
        bkgd: ColorScheme.ResolvedColor;
        fore: ColorScheme.ResolvedColor;
    }

    export const FallbackEnvironmentProductionBkgdColor = 'lavenderblush'; // should never be used
    export const FallbackEnvironmentDelayedProductionBkgdColor = 'green'; // should never be used
    export const FallbackEnvironmentDemoBkgdColor = 'yellow'; // should never be used

    export const enum ItemId {
        Layout_Base, // 0=bkgd
        Layout_SinglePaneContent, // 1=bkgd
        Layout_PopinIconBorder, // 2=fore
        Layout_ActiveTab, // 3=fore
        Layout_DropTargetIndicatorOutline, // 4=fore
        Layout_SplitterDragging, // 5=bkgd
        Layout_SingleTabContainer, // 6=fore, 7=bkgd
        Layout_SelectedHeader, // 8=bkgd
        Layout_TransitionIndicatorBorder, // 9=fore
        Layout_DropDownArrow, // 10=fore
        Environment_Production,
        Environment_DelayedProduction,
        Environment_Demo,
        Environment_Production_Offline,
        Environment_DelayedProduction_Offline,
        Environment_Demo_Offline,
        Environment_StartFinal,
        Environment_StartFinal_KickedOff,
        DesktopBar,
        MenuBar_RootItem,
        MenuBar_RootItem_Disabled,
        MenuBar_RootItemHighlighted,
        MenuBar_OverlayMenu,
        MenuBar_OverlayItem,
        MenuBar_OverlayItem_Disabled,
        MenuBar_OverlayItemHighlighted,
        MenuBar_OverlayItemDivider,
        Grid_Blank,
        Grid_VerticalLine,
        Grid_HorizontalLine,
        Grid_ColumnHeader,
        Grid_HighestPrioritySortColumnHeader,
        Grid_Base,
        Grid_BaseAlt,
        Grid_BaseFlashedOn,
        Grid_BaseAltFlashedOn,
        Grid_DataError,
        Grid_DataErrorAlt,
        Grid_DataErrorRowHeader,
        Grid_DataErrorRowHeaderAlt,
        Grid_DataSuspect,
        Grid_DataSuspectAlt,
        Grid_DataSuspectRowHeader,
        Grid_DataSuspectRowHeaderAlt,
        Grid_RowHeader,
        Grid_RowHeaderAlt,
        Grid_TopRowHeader,
        Grid_FocusedRowBorder,
        Grid_FocusedCell,
        Grid_FocusedCellBorder,
        Grid_FocusedCellFlashedOn,
        Grid_FocusedRow,
        Grid_FocusedRowFlashedOn,
        Grid_FocusedRowHeader,
        Grid_FocusedTopRowHeader,
        Grid_SelectedRow,
        Grid_SelectedRowHeader,
        Grid_SelectedRowFlashedOn,
        Grid_TopBase,
        Grid_Cancelled,
        Grid_RowRecentlyAddedBorder,
        Grid_RowRecordRecentlyChangedBorder,
        Grid_ValueRecentlyModifiedBorder,
        Grid_ValueRecentlyModifiedUpBorder,
        Grid_ValueRecentlyModifiedDownBorder,
        Grid_UpValue,
        Grid_DownValue,
        Grid_Sensitive,
        Grid_SensitiveAlt,
        Grid_TopSensitive,
        Grid_NewsIncoming,     // A news item is incoming. The news body is not available yet.
        Grid_NewsIncomingAlt,
        Grid_NewsHeadlineOnly, // A news item headline & body is available but user doesn't have permission to view body.
        Grid_NewsHeadlineOnlyAlt,
        Grid_OrderBuy,
        Grid_OrderBuyAlt,
        Grid_PriceBuy,
        Grid_PriceBuyAlt,
        Grid_OrderSell,
        Grid_OrderSellAlt,
        Grid_PriceSell,
        Grid_PriceSellAlt,
        Grid_PriceSellOverlap,
        Grid_PriceSellOverlapAlt,
        Grid_MyOrder,
        Grid_MyOrderAlt,
        Grid_PriceHasMyOrder,
        Grid_PriceHasMyOrderAlt,
        Grid_Expanded,
        Grid_Unacknowledged,
        Grid_Fired,
        Grid_GreyedOut,
        Grid_Scrollbar,
        Grid_ScrollbarThumbShadow,

/*        Alert_Disabled,
        Alert_DisabledAltRow,
        Alert_Invalid,
        Alert_InvalidAltRow,
        Alert_InvalidFlashedOn,
        Alert_InvalidAltRowFlashedOn,
        Alert_Valid,
        Alert_ValidAltRow,
        Alert_ValidFlashedOn,
        Alert_ValidAltRowFlashedOn,
        Alert_Expired,
        Alert_ExpiredAltRow,
        Alert_ExpiredFlashedOn,
        Alert_ExpiredAltRowFlashedOn,
        Alert_Error,
        Alert_ErrorAltRow,
        Alert_ErrorFlashedOn,
        Alert_ErrorAltRowFlashedOn,
        Alert_Offline,
        Alert_OfflineAltRow,
        Alert_OfflineFlashedOn,
        Alert_OfflineAltRowFlashedOn,
        Alert_Armed,
        Alert_ArmedAltRow,
        Alert_ArmedFlashedOn,
        Alert_ArmedAltRowFlashedOn,
        Alert_Fired,
        Alert_FiredAltRow,
        Alert_FiredFlashedOn,
        Alert_FiredAltRowFlashedOn,

        Alarm_Info,
        Alarm_InfoAltRow,
        Alarm_InfoFlashedOn,
        Alarm_InfoAltRowFlashedOn,
        Alarm_Warning,
        Alarm_WarningAltRow,
        Alarm_WarningFlashedOn,
        Alarm_WarningAltRowFlashedOn,
        Alarm_Low,
        Alarm_LowAltRow,
        Alarm_LowFlashedOn,
        Alarm_LowAltRowFlashedOn,
        Alarm_Normal,
        Alarm_NormalAltRow,
        Alarm_NormalFlashedOn,
        Alarm_NormalAltRowFlashedOn,
        Alarm_High,
        Alarm_HighAltRow,
        Alarm_HighFlashedOn,
        Alarm_HighAltRowFlashedOn,
        Alarm_Urgent,
        Alarm_UrgentAltRow,
        Alarm_UrgentFlashedOn,
        Alarm_UrgentAltRowFlashedOn,
        Alarm_Error,
        Alarm_ErrorAltRow,
        Alarm_ErrorFlashedOn,
        Alarm_ErrorAltRowFlashedOn,

        TitleBarButton,
        AlertsTitleBarButton,
        AlertsTitleBarButton_FlashedOn,*/

        /*TextDisplay,
        TextDisplay_Disabled,
        TextDisplay_Waiting,
        TextDisplay_Info,
        TextDisplay_Warning,
        TextDisplay_Error,
        TextDisplay_Danger,*/

        TextControl,
        TextControl_Disabled,
        TextControl_ReadOnly,
        TextControl_Missing,
        TextControl_Invalid,
        TextControl_Valid,
        TextControl_Accepted,
        TextControl_Waiting,
        TextControl_Warning,
        TextControl_Error,

        TextControl_Highlight,
        TextControl_Selected,

        ClickControl,
        ClickControl_Disabled,
        ClickControl_ReadOnly,
        ClickControl_Missing,
        ClickControl_Invalid,
        ClickControl_Valid,
        ClickControl_Accepted,
        ClickControl_Waiting,
        ClickControl_Warning,
        ClickControl_Error,

        Label,
        Label_Disabled,
        Label_ReadOnly,
        Label_Missing,
        Label_Invalid,
        Label_Valid,
        Label_Accepted,
        Label_Waiting,
        Label_Warning,
        Label_Error,

        Caution,
        Caution_UsableButNotGood,
        Caution_Suspect,
        Caution_Error,

        Text_ControlBorder,
        Text_ReadonlyMultiline,
        Text_GreyedOut,

        IconButton,
        IconButton_SelectedBorder,
        IconButton_Hover,

        /*OrderPad_Side_Buy,
        OrderPad_Side_Sell,
        OrderPad_Side_Empty,
        OrderPad_Side_Unknown,*/
        //                   OrderPad_Control_Disabled,
        //                   OrderPad_Control_ValueRequired,
        //                   OrderPad_Control_Error,
        //                   OrderPad_Control_ReadOnly,
        //                   OrderPad_Control_Writeable,
        //                   OrderPad_Edit_Disabled,
        //                   OrderPad_Edit_ValueRequired,
        //                   OrderPad_Edit_Error,
        //                   OrderPad_Edit_ReadOnly,
        //                   OrderPad_Edit_Writeable,
        //                   OrderPad_Grid_Selected,

        /*ApfcOrderStatus_Accepted,
        ApfcOrderStatus_AcceptedAlt,
        ApfcOrderStatus_PartiallyFilled,
        ApfcOrderStatus_PartiallyFilledAlt,
        ApfcOrderStatus_Filled,
        ApfcOrderStatus_FilledAlt,
        ApfcOrderStatus_Cancelled,
        ApfcOrderStatus_CancelledAlt,
        ApfcOrderStatus_Other,
        ApfcOrderStatus_OtherAlt,

        PopupLookup_Id,
        PopupLookup_IdAlt,
        PopupLookup_IdFocused,
        PopupLookup_Description,
        PopupLookup_DescriptionAlt,
        PopupLookup_DescriptionFocused,

        DragImageText,
        WaitingPanel,
        WaitingBar,*/

        // Highlight,
        Panel,
        Panel_Hoisted,
        Panel_Divider,
        Panel_Splitter,
        Panel_ItemHover,
        Unexpected,
    }

    export interface Item {
        id: ItemId;
        bkgd: ItemColor;
        fore: ItemColor;
    }

    export interface CssVariableName {
        bkgd: string;
        fore: string;
    }

    export type Resolver = (items: Item[]) => ResolvedColor;

    export namespace Item {
        export type Id = ItemId;

        interface Info {
            id: ItemId;
            name: string;
            display: string;
            bkgdResolver: Resolver | undefined;
            foreResolver: Resolver | undefined;
        }

        type InfosObject = { [id in keyof typeof ItemId]: Info };

        const infosObject: InfosObject = {
            Layout_Base: {
                id: ItemId.Layout_Base,
                name: 'Layout_Base',
                display: 'Layout: Base',
                bkgdResolver: resolveBkgdColor_Layout_Base,
                foreResolver: undefined,
            },
            Layout_SinglePaneContent: {
                id: ItemId.Layout_SinglePaneContent,
                name: 'Layout_SinglePaneContent',
                display: 'Layout: Single Pane Content',
                bkgdResolver: resolveBkgdColor_Layout_SinglePaneContent,
                foreResolver: undefined,
            },
            Layout_PopinIconBorder: {
                id: ItemId.Layout_PopinIconBorder,
                name: 'Layout_PopinIconBorder',
                display: 'Layout: Popin Icon Border',
                bkgdResolver: undefined,
                foreResolver: resolveForeColor_Layout_PopinIconBorder,
            },
            Layout_ActiveTab: {
                id: ItemId.Layout_ActiveTab,
                name: 'Layout_ActiveTab',
                display: 'Layout: Active Tab',
                bkgdResolver: undefined,
                foreResolver: resolveForeColor_Layout_ActiveTab,
            },
            Layout_DropTargetIndicatorOutline: {
                id: ItemId.Layout_DropTargetIndicatorOutline,
                name: 'Layout_DropTargetIndicatorOutline',
                display: 'Layout: Drop Target Indicator Outline',
                bkgdResolver: undefined,
                foreResolver: resolveForeColor_Layout_DropTargetIndicatorOutline,
            },
            Layout_SplitterDragging: {
                id: ItemId.Layout_SplitterDragging,
                name: 'Layout_SplitterDragging',
                display: 'Layout: Splitter Dragging',
                bkgdResolver: resolveBkgdColor_Layout_SplitterDragging,
                foreResolver: undefined,
            },
            Layout_SingleTabContainer: {
                id: ItemId.Layout_SingleTabContainer,
                name: 'Layout_SingleTabContainer',
                display: 'Layout: Single Tab Container',
                bkgdResolver: resolveBkgdColor_Layout_SingleTabContainer,
                foreResolver: resolveForeColor_Layout_SingleTabContainer,
            },
            Layout_SelectedHeader: {
                id: ItemId.Layout_SelectedHeader,
                name: 'Layout_SelectedHeader',
                display: 'Layout: Selected Header',
                bkgdResolver: resolveBkgdColor_Layout_SelectedHeader,
                foreResolver: undefined,
            },
            Layout_TransitionIndicatorBorder: {
                id: ItemId.Layout_TransitionIndicatorBorder,
                name: 'Layout_TransitionIndicatorBorder',
                display: 'Layout: Transition Indicator Border',
                bkgdResolver: undefined,
                foreResolver: resolveForeColor_Layout_TransitionIndicatorBorder,
            },
            Layout_DropDownArrow: {
                id: ItemId.Layout_DropDownArrow,
                name: 'Layout_DropDownArrow',
                display: 'Layout: Drop Down Arrow',
                bkgdResolver: undefined,
                foreResolver: resolveForeColor_Layout_DropDownArrow,
            },
            Environment_Production: {
                id: ItemId.Environment_Production,
                name: 'Environment_Production',
                display: 'Environment: Production',
                bkgdResolver: resolveBkgdColor_Environment_Production,
                foreResolver: resolveForeColor_Environment_Production,
            },
            Environment_DelayedProduction: {
                id: ItemId.Environment_DelayedProduction,
                name: 'Environment_DelayedProduction',
                display: 'Environment: Delayed Production',
                bkgdResolver: resolveBkgdColor_Environment_DelayedProduction,
                foreResolver: resolveForeColor_Environment_DelayedProduction,
            },
            Environment_Demo: {
                id: ItemId.Environment_Demo,
                name: 'Environment_Demo',
                display: 'Environment: Demo',
                bkgdResolver: resolveBkgdColor_Environment_Demo,
                foreResolver: resolveForeColor_Environment_Demo,
            },
            Environment_Production_Offline: {
                id: ItemId.Environment_Production_Offline,
                name: 'Environment_Production_Offline',
                display: 'Environment: Production: Offline',
                bkgdResolver: resolveBkgdColor_Environment_Production_Offline,
                foreResolver: resolveForeColor_Environment_Production_Offline,
            },
            Environment_DelayedProduction_Offline: {
                id: ItemId.Environment_DelayedProduction_Offline,
                name: 'Environment_DelayedProduction_Offline',
                display: 'Environment: Delayed Production: Offline',
                bkgdResolver: resolveBkgdColor_Environment_DelayedProduction_Offline,
                foreResolver: resolveForeColor_Environment_DelayedProduction_Offline,
            },
            Environment_Demo_Offline: {
                id: ItemId.Environment_Demo_Offline,
                name: 'Environment_Demo_Offline',
                display: 'Environment: Demo: Offline',
                bkgdResolver: resolveBkgdColor_Environment_Demo_Offline,
                foreResolver: resolveForeColor_Environment_Demo_Offline,
            },
            Environment_StartFinal: {
                id: ItemId.Environment_StartFinal,
                name: 'Environment_StartFinal',
                display: 'Environment: Start/Final',
                bkgdResolver: resolveBkgdColor_Environment_StartFinal,
                foreResolver: resolveForeColor_Environment_StartFinal,
            },
            Environment_StartFinal_KickedOff: {
                id: ItemId.Environment_StartFinal_KickedOff,
                name: 'Environment_StartFinal_KickedOff',
                display: 'Environment: Start/Final: Kicked Off',
                bkgdResolver: resolveBkgdColor_Environment_StartFinal_KickedOff,
                foreResolver: resolveForeColor_Environment_StartFinal_KickedOff,
            },
            DesktopBar: {
                id: ItemId.DesktopBar,
                name: 'DesktopBar',
                display: 'DesktopBar',
                bkgdResolver: resolveBkgdColor_DesktopBar,
                foreResolver: resolveForeColor_DesktopBar,
            },
            MenuBar_RootItem: {
                id: ItemId.MenuBar_RootItem,
                name: 'MenuBar_RootItem',
                display: 'MenuBar: Root Item',
                bkgdResolver: resolveBkgdColor_MenuBar_RootItem,
                foreResolver: resolveForeColor_MenuBar_RootItem,
            },
            MenuBar_RootItem_Disabled: {
                id: ItemId.MenuBar_RootItem_Disabled,
                name: 'MenuBar_RootItem_Disabled',
                display: 'MenuBar: Root Item Disabled',
                bkgdResolver: resolveBkgdColor_MenuBar_RootItem_Disabled,
                foreResolver: resolveForeColor_MenuBar_RootItem_Disabled,
            },
            MenuBar_RootItemHighlighted: {
                id: ItemId.MenuBar_RootItemHighlighted,
                name: 'MenuBar_RootItemHighlighted',
                display: 'MenuBar: Root Item Highlighted',
                bkgdResolver: resolveBkgdColor_MenuBar_RootItemHighlighted,
                foreResolver: resolveForeColor_MenuBar_RootItemHighlighted,
            },
            MenuBar_OverlayMenu: {
                id: ItemId.MenuBar_OverlayMenu,
                name: 'MenuBar_OverlayMenu',
                display: 'MenuBar: Overlay Menu',
                bkgdResolver: resolveBkgdColor_MenuBar_OverlayMenu,
                foreResolver: undefined,
            },
            MenuBar_OverlayItem: {
                id: ItemId.MenuBar_OverlayItem,
                name: 'MenuBar_OverlayItem',
                display: 'MenuBar: Overlay Item',
                bkgdResolver: resolveBkgdColor_MenuBar_OverlayItem,
                foreResolver: resolveForeColor_MenuBar_OverlayItem,
            },
            MenuBar_OverlayItem_Disabled: {
                id: ItemId.MenuBar_OverlayItem_Disabled,
                name: 'MenuBar_OverlayItem_Disabled',
                display: 'MenuBar: Overlay Item Disabled',
                bkgdResolver: resolveBkgdColor_MenuBar_OverlayItem_Disabled,
                foreResolver: resolveForeColor_MenuBar_OverlayItem_Disabled,
            },
            MenuBar_OverlayItemHighlighted: {
                id: ItemId.MenuBar_OverlayItemHighlighted,
                name: 'MenuBar_OverlayItemHighlighted',
                display: 'MenuBar: Overlay Item Highlighted',
                bkgdResolver: resolveBkgdColor_MenuBar_OverlayItemHighlighted,
                foreResolver: resolveForeColor_MenuBar_OverlayItemHighlighted,
            },
            MenuBar_OverlayItemDivider: {
                id: ItemId.MenuBar_OverlayItemDivider,
                name: 'MenuBar_OverlayItemDivider',
                display: 'MenuBar: Overlay Item Divider',
                bkgdResolver: undefined,
                foreResolver: resolveForeColor_MenuBar_OverlayItem_Divider,
            },
            Grid_Blank: {
                id: ItemId.Grid_Blank,
                name: 'Grid_Blank',
                display: 'Grid: Blank',
                bkgdResolver: resolveBkgdColor_Grid_Blank,
                foreResolver: undefined,
            },
            Grid_VerticalLine: {
                id: ItemId.Grid_VerticalLine,
                name: 'Grid_VerticalLine',
                display: 'Grid: Vertical Line',
                bkgdResolver: undefined,
                foreResolver: resolveForeColor_Grid_VerticalLine,
            },
            Grid_HorizontalLine: {
                id: ItemId.Grid_HorizontalLine,
                name: 'Grid_HorizontalLine',
                display: 'Grid: Horizontal Line',
                bkgdResolver: undefined,
                foreResolver: resolveForeColor_Grid_HorizontalLine,
            },
            Grid_ColumnHeader: {
                id: ItemId.Grid_ColumnHeader,
                name: 'Grid_ColumnHeader',
                display: 'Grid: Column Header',
                bkgdResolver: resolveBkgdColor_Grid_ColumnHeader,
                foreResolver: resolveForeColor_Grid_ColumnHeader,
            },
            Grid_HighestPrioritySortColumnHeader: {
                id: ItemId.Grid_HighestPrioritySortColumnHeader,
                name: 'Grid_HighestPrioritySortColumnHeader',
                display: 'Grid: Sort Column Header',
                bkgdResolver: resolveBkgdColor_Grid_HighestPrioritySortColumnHeader,
                foreResolver: resolveForeColor_Grid_HighestPrioritySortColumnHeader,
            },
            Grid_Base: {
                id: ItemId.Grid_Base,
                name: 'Grid_Base',
                display: 'Grid: Base Row',
                bkgdResolver: resolveBkgdColor_Grid_Base,
                foreResolver: resolveForeColor_Grid_Base,
            },
            Grid_BaseAlt: {
                id: ItemId.Grid_BaseAlt,
                name: 'Grid_BaseAlt',
                display: 'Grid: Base Alternate Row',
                bkgdResolver: resolveBkgdColor_Grid_BaseAlt,
                foreResolver: resolveForeColor_Grid_BaseAlt,
            },
            Grid_BaseFlashedOn: {
                id: ItemId.Grid_BaseFlashedOn,
                name: 'Grid_BaseFlashedOn',
                display: 'Grid_BaseFlashedOn',
                bkgdResolver: resolveBkgdColor_Grid_BaseFlashedOn,
                foreResolver: resolveForeColor_Grid_BaseFlashedOn,
            },
            Grid_BaseAltFlashedOn: {
                id: ItemId.Grid_BaseAltFlashedOn,
                name: 'Grid_BaseAltFlashedOn',
                display: 'Grid_BaseAltFlashedOn',
                bkgdResolver: resolveBkgdColor_Grid_BaseAltFlashedOn,
                foreResolver: resolveForeColor_Grid_BaseAltFlashedOn,
            },
            Grid_DataError: {
                id: ItemId.Grid_DataError,
                name: 'Grid_DataError',
                display: 'Grid: Data Error',
                bkgdResolver: resolveBkgdColor_Grid_DataError,
                foreResolver: resolveForeColor_Grid_DataError,
            },
            Grid_DataErrorAlt: {
                id: ItemId.Grid_DataErrorAlt,
                name: 'Grid_DataErrorAlt',
                display: 'Grid: Alternate Data Error',
                bkgdResolver: resolveBkgdColor_Grid_DataErrorAlt,
                foreResolver: resolveForeColor_Grid_DataErrorAlt,
            },
            Grid_DataErrorRowHeader: {
                id: ItemId.Grid_DataErrorRowHeader,
                name: 'Grid_DataErrorRowHeader',
                display: 'Grid: Data Error Row Header',
                bkgdResolver: resolveBkgdColor_Grid_DataErrorRowHeader,
                foreResolver: resolveForeColor_Grid_DataErrorRowHeader,
            },
            Grid_DataErrorRowHeaderAlt: {
                id: ItemId.Grid_DataErrorRowHeaderAlt,
                name: 'Grid_DataErrorRowHeaderAlt',
                display: 'Grid: Data Error Row Header Alt',
                bkgdResolver: resolveBkgdColor_Grid_DataErrorRowHeaderAlt,
                foreResolver: resolveForeColor_Grid_DataErrorRowHeaderAlt,
            },
            Grid_DataSuspect: {
                id: ItemId.Grid_DataSuspect,
                name: 'Grid_DataSuspect',
                display: 'Grid: Data Suspect',
                bkgdResolver: resolveBkgdColor_Grid_DataSuspect,
                foreResolver: resolveForeColor_Grid_DataSuspect,
            },
            Grid_DataSuspectAlt: {
                id: ItemId.Grid_DataSuspectAlt,
                name: 'Grid_DataSuspectAlt',
                display: 'Grid: Alternate Data Suspect',
                bkgdResolver: resolveBkgdColor_Grid_DataSuspectAlt,
                foreResolver: resolveForeColor_Grid_DataSuspectAlt,
            },
            Grid_DataSuspectRowHeader: {
                id: ItemId.Grid_DataSuspectRowHeader,
                name: 'Grid_DataSuspectRowHeader',
                display: 'Grid: Data Suspect Row Header',
                bkgdResolver: resolveBkgdColor_Grid_DataSuspectRowHeader,
                foreResolver: resolveForeColor_Grid_DataSuspectRowHeader,
            },
            Grid_DataSuspectRowHeaderAlt: {
                id: ItemId.Grid_DataSuspectRowHeaderAlt,
                name: 'Grid_DataSuspectRowHeaderAlt',
                display: 'Grid: Data Suspect Row Header Alt',
                bkgdResolver: resolveBkgdColor_Grid_DataSuspectRowHeaderAlt,
                foreResolver: resolveForeColor_Grid_DataSuspectRowHeaderAlt,
            },
            Grid_RowHeader: {
                id: ItemId.Grid_RowHeader,
                name: 'Grid_RowHeader',
                display: 'Grid: Row Header',
                bkgdResolver: resolveBkgdColor_Grid_RowHeader,
                foreResolver: resolveForeColor_Grid_RowHeader,
            },
            Grid_RowHeaderAlt: {
                id: ItemId.Grid_RowHeaderAlt,
                name: 'Grid_RowHeaderAlt',
                display: 'Grid: Alternate Row Header',
                bkgdResolver: resolveBkgdColor_Grid_RowHeaderAlt,
                foreResolver: resolveForeColor_Grid_RowHeaderAlt,
            },
            Grid_TopRowHeader: {
                id: ItemId.Grid_TopRowHeader,
                name: 'Grid_TopRowHeader',
                display: 'Grid: Top Row Header',
                bkgdResolver: resolveBkgdColor_Grid_TopRowHeader,
                foreResolver: resolveForeColor_Grid_TopRowHeader,
            },
            Grid_FocusedRowBorder: {
                id: ItemId.Grid_FocusedRowBorder,
                name: 'Grid_FocusedRowBorder',
                display: 'Grid: Focused Row Border',
                bkgdResolver: undefined,
                foreResolver: resolveForeColor_Grid_FocusedRowBorder,
            },
            Grid_FocusedCell: {
                id: ItemId.Grid_FocusedCell,
                name: 'Grid_FocusedCell',
                display: 'Grid: Focused Cell',
                bkgdResolver: resolveBkgdColor_Grid_FocusedCell,
                foreResolver: resolveForeColor_Grid_FocusedCell,
            },
            Grid_FocusedCellBorder: {
                id: ItemId.Grid_FocusedCellBorder,
                name: 'Grid_FocusedCellBorder',
                display: 'Grid: Focused Cell Border',
                bkgdResolver: undefined,
                foreResolver: resolveForeColor_Grid_FocusedCellBorder,
            },
            Grid_FocusedCellFlashedOn: {
                id: ItemId.Grid_FocusedCellFlashedOn,
                name: 'Grid_FocusedCellFlashedOn',
                display: 'Grid: Focused Cell Flashed On',
                bkgdResolver: resolveBkgdColor_Grid_FocusedCellFlashedOn,
                foreResolver: resolveForeColor_Grid_FocusedCellFlashedOn,
            },
            Grid_FocusedRow: {
                id: ItemId.Grid_FocusedRow,
                name: 'Grid_FocusedRow',
                display: 'Grid: Focused Row',
                bkgdResolver: resolveBkgdColor_Grid_FocusedRow,
                foreResolver: resolveForeColor_Grid_FocusedRow,
            },
            Grid_FocusedRowFlashedOn: {
                id: ItemId.Grid_FocusedRowFlashedOn,
                name: 'Grid_FocusedRowFlashedOn',
                display: 'Grid: Focused Row Flashed On',
                bkgdResolver: resolveBkgdColor_Grid_FocusedRowFlashedOn,
                foreResolver: resolveForeColor_Grid_FocusedRowFlashedOn,
            },
            Grid_FocusedRowHeader: {
                id: ItemId.Grid_FocusedRowHeader,
                name: 'Grid_FocusedRowHeader',
                display: 'Grid: Focused Row Header',
                bkgdResolver: resolveBkgdColor_Grid_FocusedRowHeader,
                foreResolver: resolveForeColor_Grid_FocusedRowHeader,
            },
            Grid_FocusedTopRowHeader: {
                id: ItemId.Grid_FocusedTopRowHeader,
                name: 'Grid_FocusedTopRowHeader',
                display: 'Grid: Focused Top Row Header',
                bkgdResolver: resolveBkgdColor_Grid_FocusedTopRowHeader,
                foreResolver: resolveForeColor_Grid_FocusedTopRowHeader,
            },
            Grid_SelectedRow: {
                id: ItemId.Grid_SelectedRow,
                name: 'Grid_SelectedRow',
                display: 'Grid: Selected Row',
                bkgdResolver: resolveBkgdColor_Grid_SelectedRow,
                foreResolver: resolveForeColor_Grid_SelectedRow,
            },
            Grid_SelectedRowHeader: {
                id: ItemId.Grid_SelectedRowHeader,
                name: 'Grid_SelectedRowHeader',
                display: 'Grid: Selected Row Header',
                bkgdResolver: resolveBkgdColor_Grid_SelectedRowHeader,
                foreResolver: resolveForeColor_Grid_SelectedRowHeader,
            },
            Grid_SelectedRowFlashedOn: {
                id: ItemId.Grid_SelectedRowFlashedOn,
                name: 'Grid_SelectedRowFlashedOn',
                display: 'Grid: Selection Row Flashed On',
                bkgdResolver: resolveBkgdColor_Grid_SelectedRowFlashedOn,
                foreResolver: resolveForeColor_Grid_SelectedRowFlashedOn,
            },
            Grid_TopBase: {
                id: ItemId.Grid_TopBase,
                name: 'Grid_TopBase',
                display: 'Grid: Top Row',
                bkgdResolver: resolveBkgdColor_Grid_TopBase,
                foreResolver: resolveForeColor_Grid_TopBase,
            },
            Grid_Cancelled: {
                id: ItemId.Grid_Cancelled,
                name: 'Grid_Cancelled',
                display: 'Grid: Cancelled',
                bkgdResolver: resolveBkgdColor_Grid_Cancelled,
                foreResolver: resolveForeColor_Grid_Cancelled,
            },
            Grid_RowRecentlyAddedBorder: {
                id: ItemId.Grid_RowRecentlyAddedBorder,
                name: 'Grid_RowRecentlyAddedBorder',
                display: 'Grid: Row Recently Added',
                bkgdResolver: undefined,
                foreResolver: resolveForeColor_Grid_RowRecentlyAddedBorder,
            },
            Grid_RowRecordRecentlyChangedBorder: {
                id: ItemId.Grid_RowRecordRecentlyChangedBorder,
                name: 'Grid_RowRecordRecentlyChangedBorder',
                display: 'Grid: Row Record Recently Changed',
                bkgdResolver: undefined,
                foreResolver: resolveForeColor_Grid_RowRecordRecentlyChangedBorder,
            },
            Grid_ValueRecentlyModifiedBorder: {
                id: ItemId.Grid_ValueRecentlyModifiedBorder,
                name: 'Grid_ValueRecentlyModifiedBorder',
                display: 'Grid: Value Recently Modified',
                bkgdResolver: undefined,
                foreResolver: resolveForeColor_Grid_ValueRecentlyModifiedBorder,
            },
            Grid_ValueRecentlyModifiedUpBorder: {
                id: ItemId.Grid_ValueRecentlyModifiedUpBorder,
                name: 'Grid_ValueRecentlyModifiedUpBorder',
                display: 'Grid: Value Recently Modified Up',
                bkgdResolver: undefined,
                foreResolver: resolveForeColor_Grid_ValueRecentlyModifiedUpBorder,
            },
            Grid_ValueRecentlyModifiedDownBorder: {
                id: ItemId.Grid_ValueRecentlyModifiedDownBorder,
                name: 'Grid_ValueRecentlyModifiedDownBorder',
                display: 'Grid: Value Recently Modified Down',
                bkgdResolver: undefined,
                foreResolver: resolveForeColor_Grid_ValueRecentlyModifiedDownBorder,
            },
            Grid_UpValue: {
                id: ItemId.Grid_UpValue,
                name: 'Grid_UpValue',
                display: 'Grid: Up Value',
                bkgdResolver: resolveBkgdColor_Grid_UpValue,
                foreResolver: resolveForeColor_Grid_UpValue,
            },
            Grid_DownValue: {
                id: ItemId.Grid_DownValue,
                name: 'Grid_DownValue',
                display: 'Grid: Down Value',
                bkgdResolver: resolveBkgdColor_Grid_DownValue,
                foreResolver: resolveForeColor_Grid_DownValue,
            },
            Grid_Sensitive: {
                id: ItemId.Grid_Sensitive,
                name: 'Grid_Sensitive',
                display: 'Grid: Sensitive',
                bkgdResolver: resolveBkgdColor_Grid_Sensitive,
                foreResolver: resolveForeColor_Grid_Sensitive,
            },
            Grid_SensitiveAlt: {
                id: ItemId.Grid_SensitiveAlt,
                name: 'Grid_SensitiveAlt',
                display: 'Grid: Alternative Sensitive',
                bkgdResolver: resolveBkgdColor_Grid_SensitiveAlt,
                foreResolver: resolveForeColor_Grid_SensitiveAlt,
            },
            Grid_TopSensitive: {
                id: ItemId.Grid_TopSensitive,
                name: 'Grid_TopSensitive',
                display: 'Grid: Top Sensitive',
                bkgdResolver: resolveBkgdColor_Grid_TopSensitive,
                foreResolver: resolveForeColor_Grid_TopSensitive,
            },
            Grid_NewsIncoming: {
                id: ItemId.Grid_NewsIncoming,
                name: 'Grid_NewsIncoming',
                display: 'Grid: News Incoming',
                bkgdResolver: resolveBkgdColor_Grid_NewsIncoming,
                foreResolver: resolveForeColor_Grid_NewsIncoming,
            },
            Grid_NewsIncomingAlt: {
                id: ItemId.Grid_NewsIncomingAlt,
                name: 'Grid_NewsIncomingAlt',
                display: 'Grid: Alternate News Incoming',
                bkgdResolver: resolveBkgdColor_Grid_NewsIncomingAlt,
                foreResolver: resolveForeColor_Grid_NewsIncomingAlt,
            },
            Grid_NewsHeadlineOnly: {
                id: ItemId.Grid_NewsHeadlineOnly,
                name: 'Grid_NewsHeadlineOnly',
                display: 'Grid: News Headline Only',
                bkgdResolver: resolveBkgdColor_Grid_NewsHeadlineOnly,
                foreResolver: resolveForeColor_Grid_NewsHeadlineOnly,
            },
            Grid_NewsHeadlineOnlyAlt: {
                id: ItemId.Grid_NewsHeadlineOnlyAlt,
                name: 'Grid_NewsHeadlineOnlyAlt',
                display: 'Grid: Alternate News Headline Only',
                bkgdResolver: resolveBkgdColor_Grid_NewsHeadlineOnlyAlt,
                foreResolver: resolveForeColor_Grid_NewsHeadlineOnlyAlt,
            },
            Grid_OrderBuy: {
                id: ItemId.Grid_OrderBuy,
                name: 'Grid_OrderBuy',
                display: 'Grid: Order Buy',
                bkgdResolver: resolveBkgdColor_Grid_OrderBuy,
                foreResolver: resolveForeColor_Grid_OrderBuy,
            },
            Grid_OrderBuyAlt: {
                id: ItemId.Grid_OrderBuyAlt,
                name: 'Grid_OrderBuyAlt',
                display: 'Grid: Alternative Order Buy',
                bkgdResolver: resolveBkgdColor_Grid_OrderBuyAlt,
                foreResolver: resolveForeColor_Grid_OrderBuyAlt,
            },
            Grid_PriceBuy: {
                id: ItemId.Grid_PriceBuy,
                name: 'Grid_PriceBuy',
                display: 'Grid: Price Buy',
                bkgdResolver: resolveBkgdColor_Grid_PriceBuy,
                foreResolver: resolveForeColor_Grid_PriceBuy,
            },
            Grid_PriceBuyAlt: {
                id: ItemId.Grid_PriceBuyAlt,
                name: 'Grid_PriceBuyAlt',
                display: 'Grid: Alternative Price Buy',
                bkgdResolver: resolveBkgdColor_Grid_PriceBuyAlt,
                foreResolver: resolveForeColor_Grid_PriceBuyAlt,
            },
            Grid_OrderSell: {
                id: ItemId.Grid_OrderSell,
                name: 'Grid_OrderSell',
                display: 'Grid: Order Sell',
                bkgdResolver: resolveBkgdColor_Grid_OrderSell,
                foreResolver: resolveForeColor_Grid_OrderSell,
            },
            Grid_OrderSellAlt: {
                id: ItemId.Grid_OrderSellAlt,
                name: 'Grid_OrderSellAlt',
                display: 'Grid: Alternative Order Sell',
                bkgdResolver: resolveBkgdColor_Grid_OrderSellAlt,
                foreResolver: resolveForeColor_Grid_OrderSellAlt,
            },
            Grid_PriceSell: {
                id: ItemId.Grid_PriceSell,
                name: 'Grid_PriceSell',
                display: 'Grid: Price Sell',
                bkgdResolver: resolveBkgdColor_Grid_PriceSell,
                foreResolver: resolveForeColor_Grid_PriceSell,
            },
            Grid_PriceSellAlt: {
                id: ItemId.Grid_PriceSellAlt,
                name: 'Grid_PriceSellAlt',
                display: 'Grid: Alternative Price Sell',
                bkgdResolver: resolveBkgdColor_Grid_PriceSellAlt,
                foreResolver: resolveForeColor_Grid_PriceSellAlt,
            },
            Grid_PriceSellOverlap: {
                id: ItemId.Grid_PriceSellOverlap,
                name: 'Grid_PriceSellOverlap',
                display: 'Grid: Overlap Price Sell',
                bkgdResolver: resolveBkgdColor_Grid_PriceSellOverlap,
                foreResolver: resolveForeColor_Grid_PriceSellOverlap,
            },
            Grid_PriceSellOverlapAlt: {
                id: ItemId.Grid_PriceSellOverlapAlt,
                name: 'Grid_PriceSellOverlapAlt',
                display: 'Grid: Alternative Overlap Price Sell',
                bkgdResolver: resolveBkgdColor_Grid_PriceSellOverlapAlt,
                foreResolver: resolveForeColor_Grid_PriceSellOverlapAlt,
            },
            Grid_MyOrder: {
                id: ItemId.Grid_MyOrder,
                name: 'Grid_MyOrder',
                display: 'Grid: My Order',
                bkgdResolver: resolveBkgdColor_Grid_MyOrder,
                foreResolver: resolveForeColor_Grid_MyOrder,
            },
            Grid_MyOrderAlt: {
                id: ItemId.Grid_MyOrderAlt,
                name: 'Grid_MyOrderAlt',
                display: 'Grid: Alternative My Order',
                bkgdResolver: resolveBkgdColor_Grid_MyOrderAlt,
                foreResolver: resolveForeColor_Grid_MyOrderAlt,
            },
            Grid_PriceHasMyOrder: {
                id: ItemId.Grid_PriceHasMyOrder,
                name: 'Grid_PriceHasMyOrder',
                display: 'Grid: Price Has My Order',
                bkgdResolver: resolveBkgdColor_Grid_PriceHasMyOrder,
                foreResolver: resolveForeColor_Grid_PriceHasMyOrder,
            },
            Grid_PriceHasMyOrderAlt: {
                id: ItemId.Grid_PriceHasMyOrderAlt,
                name: 'Grid_PriceHasMyOrderAlt',
                display: 'Grid: Alternative Price Has My Order',
                bkgdResolver: resolveBkgdColor_Grid_PriceHasMyOrderAlt,
                foreResolver: resolveForeColor_Grid_PriceHasMyOrderAlt,
            },
            Grid_Expanded: {
                id: ItemId.Grid_Expanded,
                name: 'Grid_Expanded',
                display: 'Grid: Expanded',
                bkgdResolver: resolveBkgdColor_Grid_Expanded,
                foreResolver: undefined,
            },
            Grid_Unacknowledged: {
                id: ItemId.Grid_Unacknowledged,
                name: 'Grid_Unacknowledged',
                display: 'Grid: Unacknowledged',
                bkgdResolver: resolveBkgdColor_Grid_Unacknowledged,
                foreResolver: resolveForeColor_Grid_Unacknowledged,
            },
            Grid_Fired: {
                id: ItemId.Grid_Fired,
                name: 'Grid_Fired',
                display: 'Grid: Fired',
                bkgdResolver: resolveBkgdColor_Grid_Fired,
                foreResolver: resolveForeColor_Grid_Fired,
            },
            Grid_GreyedOut: {
                id: ItemId.Grid_GreyedOut,
                name: 'Grid_GreyedOut',
                display: 'Grid: Greyed Out',
                bkgdResolver: undefined,
                foreResolver: resolveForeColor_Grid_GreyedOut,
            },
            Grid_Scrollbar: {
                id: ItemId.Grid_Scrollbar,
                name: 'Grid_Scrollbar',
                display: 'Grid: Scrollbar',
                bkgdResolver: resolveBkgdColor_Grid_Scrollbar,
                foreResolver: resolveForeColor_Grid_Scrollbar,
            },
            Grid_ScrollbarThumbShadow: {
                id: ItemId.Grid_ScrollbarThumbShadow,
                name: 'Grid_ScrollbarThumbShadow',
                display: 'Grid: Scrollbar Thumb Shadow',
                bkgdResolver: resolveBkgdColor_Grid_ScrollbarThumbShadow,
                foreResolver: undefined,
            },
/*            News_BodyText: {
                id: ItemId.News_BodyText,
                name: 'News_BodyText',
                display: 'News: Body Text',
                bkgdResolver: resolveBkgdColor_News_BodyText,
                foreResolver: resolveForeColor_News_BodyText,
            },
            Alert_Disabled: {
                id: ItemId.Alert_Disabled,
                name: 'Alert_Disabled',
                display: 'Alert: Disabled',
                bkgdResolver: resolveBkgdColor_Alert_Disabled,
                foreResolver: resolveForeColor_Alert_Disabled,
            },
            Alert_DisabledAltRow: {
                id: ItemId.Alert_DisabledAltRow,
                name: 'Alert_DisabledAltRow',
                display: 'Alert: Disabled Alternate Row',
                bkgdResolver: resolveBkgdColor_Alert_DisabledAltRow,
                foreResolver: resolveForeColor_Alert_DisabledAltRow,
            },
            Alert_Invalid: {
                id: ItemId.Alert_Invalid,
                name: 'Alert_Invalid',
                display: 'Alert: Invalid',
                bkgdResolver: resolveBkgdColor_Alert_Invalid,
                foreResolver: resolveForeColor_Alert_Invalid,
            },
            Alert_InvalidAltRow: {
                id: ItemId.Alert_InvalidAltRow,
                name: 'Alert_InvalidAltRow',
                display: 'Alert: Invalid Alternate Row',
                bkgdResolver: resolveBkgdColor_Alert_InvalidAltRow,
                foreResolver: resolveForeColor_Alert_InvalidAltRow,
            },
            Alert_InvalidFlashedOn: {
                id: ItemId.Alert_InvalidFlashedOn,
                name: 'Alert_InvalidFlashedOn',
                display: 'Alert: Invalid Flashed On',
                bkgdResolver: resolveBkgdColor_Alert_InvalidFlashedOn,
                foreResolver: resolveForeColor_Alert_InvalidFlashedOn,
            },
            Alert_InvalidAltRowFlashedOn: {
                id: ItemId.Alert_InvalidAltRowFlashedOn,
                name: 'Alert_InvalidAltRowFlashedOn',
                display: 'Alert: Invalid Alternate Row Flashed On',
                bkgdResolver: resolveBkgdColor_Alert_InvalidAltRowFlashedOn,
                foreResolver: resolveForeColor_Alert_InvalidAltRowFlashedOn,
            },
            Alert_Valid: {
                id: ItemId.Alert_Valid,
                name: 'Alert_Valid',
                display: 'Alert: Valid',
                bkgdResolver: resolveBkgdColor_Alert_Valid,
                foreResolver: resolveForeColor_Alert_Valid,
            },
            Alert_ValidAltRow: {
                id: ItemId.Alert_ValidAltRow,
                name: 'Alert_ValidAltRow',
                display: 'Alert: Valid Alternate Row',
                bkgdResolver: resolveBkgdColor_Alert_ValidAltRow,
                foreResolver: resolveForeColor_Alert_ValidAltRow,
            },
            Alert_ValidFlashedOn: {
                id: ItemId.Alert_ValidFlashedOn,
                name: 'Alert_ValidFlashedOn',
                display: 'Alert: Valid Flashed On',
                bkgdResolver: resolveBkgdColor_Alert_ValidFlashedOn,
                foreResolver: resolveForeColor_Alert_ValidFlashedOn,
            },
            Alert_ValidAltRowFlashedOn: {
                id: ItemId.Alert_ValidAltRowFlashedOn,
                name: 'Alert_ValidAltRowFlashedOn',
                display: 'Alert: Valid Alt Row Flashed On',
                bkgdResolver: resolveBkgdColor_Alert_ValidAltRowFlashedOn,
                foreResolver: resolveForeColor_Alert_ValidAltRowFlashedOn,
            },
            Alert_Expired: {
                id: ItemId.Alert_Expired,
                name: 'Alert_Expired',
                display: 'Alert: Expired',
                bkgdResolver: resolveBkgdColor_Alert_Expired,
                foreResolver: resolveForeColor_Alert_Expired,
            },
            Alert_ExpiredAltRow: {
                id: ItemId.Alert_ExpiredAltRow,
                name: 'Alert_ExpiredAltRow',
                display: 'Alert: Expired Alt Row',
                bkgdResolver: resolveBkgdColor_Alert_ExpiredAltRow,
                foreResolver: resolveForeColor_Alert_ExpiredAltRow,
            },
            Alert_ExpiredFlashedOn: {
                id: ItemId.Alert_ExpiredFlashedOn,
                name: 'Alert_ExpiredFlashedOn',
                display: 'Alert: Expired Flashed On',
                bkgdResolver: resolveBkgdColor_Alert_ExpiredFlashedOn,
                foreResolver: resolveForeColor_Alert_ExpiredFlashedOn,
            },
            Alert_ExpiredAltRowFlashedOn: {
                id: ItemId.Alert_ExpiredAltRowFlashedOn,
                name: 'Alert_ExpiredAltRowFlashedOn',
                display: 'Alert: Expired Alt Row Flashed On',
                bkgdResolver: resolveBkgdColor_Alert_ExpiredAltRowFlashedOn,
                foreResolver: resolveForeColor_Alert_ExpiredAltRowFlashedOn,
            },
            Alert_Error: {
                id: ItemId.Alert_Error,
                name: 'Alert_Error',
                display: 'Alert: Error',
                bkgdResolver: resolveBkgdColor_Alert_Error,
                foreResolver: resolveForeColor_Alert_Error,
            },
            Alert_ErrorAltRow: {
                id: ItemId.Alert_ErrorAltRow,
                name: 'Alert_ErrorAltRow',
                display: 'Alert: Error Alt Row',
                bkgdResolver: resolveBkgdColor_Alert_ErrorAltRow,
                foreResolver: resolveForeColor_Alert_ErrorAltRow,
            },
            Alert_ErrorFlashedOn: {
                id: ItemId.Alert_ErrorFlashedOn,
                name: 'Alert_ErrorFlashedOn',
                display: 'Alert: Error Flashed On',
                bkgdResolver: resolveBkgdColor_Alert_ErrorFlashedOn,
                foreResolver: resolveForeColor_Alert_ErrorFlashedOn,
            },
            Alert_ErrorAltRowFlashedOn: {
                id: ItemId.Alert_ErrorAltRowFlashedOn,
                name: 'Alert_ErrorAltRowFlashedOn',
                display: 'Alert: Error Alt Row Flashed On',
                bkgdResolver: resolveBkgdColor_Alert_ErrorAltRowFlashedOn,
                foreResolver: resolveForeColor_Alert_ErrorAltRowFlashedOn,
            },
            Alert_Offline: {
                id: ItemId.Alert_Offline,
                name: 'Alert_Offline',
                display: 'Alert: Offline',
                bkgdResolver: resolveBkgdColor_Alert_Offline,
                foreResolver: resolveForeColor_Alert_Offline,
            },
            Alert_OfflineAltRow: {
                id: ItemId.Alert_OfflineAltRow,
                name: 'Alert_OfflineAltRow',
                display: 'Alert: Offline Alt Row',
                bkgdResolver: resolveBkgdColor_Alert_OfflineAltRow,
                foreResolver: resolveForeColor_Alert_OfflineAltRow,
            },
            Alert_OfflineFlashedOn: {
                id: ItemId.Alert_OfflineFlashedOn,
                name: 'Alert_OfflineFlashedOn',
                display: 'Alert: Offline Flashed On',
                bkgdResolver: resolveBkgdColor_Alert_OfflineFlashedOn,
                foreResolver: resolveForeColor_Alert_OfflineFlashedOn,
            },
            Alert_OfflineAltRowFlashedOn: {
                id: ItemId.Alert_OfflineAltRowFlashedOn,
                name: 'Alert_OfflineAltRowFlashedOn',
                display: 'Alert: Offline Alt Row Flashed On',
                bkgdResolver: resolveBkgdColor_Alert_OfflineAltRowFlashedOn,
                foreResolver: resolveForeColor_Alert_OfflineAltRowFlashedOn,
            },
            Alert_Armed: {
                id: ItemId.Alert_Armed,
                name: 'Alert_Armed',
                display: 'Alert: Armed',
                bkgdResolver: resolveBkgdColor_Alert_Armed,
                foreResolver: resolveForeColor_Alert_Armed,
            },
            Alert_ArmedAltRow: {
                id: ItemId.Alert_ArmedAltRow,
                name: 'Alert_ArmedAltRow',
                display: 'Alert: Armed Alt Row',
                bkgdResolver: resolveBkgdColor_Alert_ArmedAltRow,
                foreResolver: resolveForeColor_Alert_ArmedAltRow,
            },
            Alert_ArmedFlashedOn: {
                id: ItemId.Alert_ArmedFlashedOn,
                name: 'Alert_ArmedFlashedOn',
                display: 'Alert: Armed Flashed On',
                bkgdResolver: resolveBkgdColor_Alert_ArmedFlashedOn,
                foreResolver: resolveForeColor_Alert_ArmedFlashedOn,
            },
            Alert_ArmedAltRowFlashedOn: {
                id: ItemId.Alert_ArmedAltRowFlashedOn,
                name: 'Alert_ArmedAltRowFlashedOn',
                display: 'Alert: Armed Alt Row Flashed On',
                bkgdResolver: resolveBkgdColor_Alert_ArmedAltRowFlashedOn,
                foreResolver: resolveForeColor_Alert_ArmedAltRowFlashedOn,
            },
            Alert_Fired: {
                id: ItemId.Alert_Fired,
                name: 'Alert_Fired',
                display: 'Alert: Fired',
                bkgdResolver: resolveBkgdColor_Alert_Fired,
                foreResolver: resolveForeColor_Alert_Fired,
            },
            Alert_FiredAltRow: {
                id: ItemId.Alert_FiredAltRow,
                name: 'Alert_FiredAltRow',
                display: 'Alert: Fired Alt Row',
                bkgdResolver: resolveBkgdColor_Alert_FiredAltRow,
                foreResolver: resolveForeColor_Alert_FiredAltRow,
            },
            Alert_FiredFlashedOn: {
                id: ItemId.Alert_FiredFlashedOn,
                name: 'Alert_FiredFlashedOn',
                display: 'Alert: Fired Flashed On',
                bkgdResolver: resolveBkgdColor_Alert_FiredFlashedOn,
                foreResolver: resolveForeColor_Alert_FiredFlashedOn,
            },
            Alert_FiredAltRowFlashedOn: {
                id: ItemId.Alert_FiredAltRowFlashedOn,
                name: 'Alert_FiredAltRowFlashedOn',
                display: 'Alert: Fired Alt Row Flashed On',
                bkgdResolver: resolveBkgdColor_Alert_FiredAltRowFlashedOn,
                foreResolver: resolveForeColor_Alert_FiredAltRowFlashedOn,
            },
            Alarm_Info: {
                id: ItemId.Alarm_Info,
                name: 'Alarm_Info',
                display: 'Alarm: Info',
                bkgdResolver: resolveBkgdColor_Alarm_Info,
                foreResolver: resolveForeColor_Alarm_Info,
            },
            Alarm_InfoAltRow: {
                id: ItemId.Alarm_InfoAltRow,
                name: 'Alarm_InfoAltRow',
                display: 'Alarm: Info Alt Row',
                bkgdResolver: resolveBkgdColor_Alarm_InfoAltRow,
                foreResolver: resolveForeColor_Alarm_InfoAltRow,
            },
            Alarm_InfoFlashedOn: {
                id: ItemId.Alarm_InfoFlashedOn,
                name: 'Alarm_InfoFlashedOn',
                display: 'Alarm: Info Flashed On',
                bkgdResolver: resolveBkgdColor_Alarm_InfoFlashedOn,
                foreResolver: resolveForeColor_Alarm_InfoFlashedOn,
            },
            Alarm_InfoAltRowFlashedOn: {
                id: ItemId.Alarm_InfoAltRowFlashedOn,
                name: 'Alarm_InfoAltRowFlashedOn',
                display: 'Alarm: Info Alt Row Flashed On',
                bkgdResolver: resolveBkgdColor_Alarm_InfoAltRowFlashedOn,
                foreResolver: resolveForeColor_Alarm_InfoAltRowFlashedOn,
            },
            Alarm_Warning: {
                id: ItemId.Alarm_Warning,
                name: 'Alarm_Warning',
                display: 'Alarm: Warning',
                bkgdResolver: resolveBkgdColor_Alarm_Warning,
                foreResolver: resolveForeColor_Alarm_Warning,
            },
            Alarm_WarningAltRow: {
                id: ItemId.Alarm_WarningAltRow,
                name: 'Alarm_WarningAltRow',
                display: 'Alarm: Warning Alt Row',
                bkgdResolver: resolveBkgdColor_Alarm_WarningAltRow,
                foreResolver: resolveForeColor_Alarm_WarningAltRow,
            },
            Alarm_WarningFlashedOn: {
                id: ItemId.Alarm_WarningFlashedOn,
                name: 'Alarm_WarningFlashedOn',
                display: 'Alarm: Warning Flashed On',
                bkgdResolver: resolveBkgdColor_Alarm_WarningFlashedOn,
                foreResolver: resolveForeColor_Alarm_WarningFlashedOn,
            },
            Alarm_WarningAltRowFlashedOn: {
                id: ItemId.Alarm_WarningAltRowFlashedOn,
                name: 'Alarm_WarningAltRowFlashedOn',
                display: 'Alarm: Warning Alt Row Flashed On',
                bkgdResolver: resolveBkgdColor_Alarm_WarningAltRowFlashedOn,
                foreResolver: resolveForeColor_Alarm_WarningAltRowFlashedOn,
            },
            Alarm_Low: {
                id: ItemId.Alarm_Low,
                name: 'Alarm_Low',
                display: 'Alarm: Low',
                bkgdResolver: resolveBkgdColor_Alarm_Low,
                foreResolver: resolveForeColor_Alarm_Low,
            },
            Alarm_LowAltRow: {
                id: ItemId.Alarm_LowAltRow,
                name: 'Alarm_LowAltRow',
                display: 'Alarm: Low Alt Row',
                bkgdResolver: resolveBkgdColor_Alarm_LowAltRow,
                foreResolver: resolveForeColor_Alarm_LowAltRow,
            },
            Alarm_LowFlashedOn: {
                id: ItemId.Alarm_LowFlashedOn,
                name: 'Alarm_LowFlashedOn',
                display: 'Alarm: Low Flashed On',
                bkgdResolver: resolveBkgdColor_Alarm_LowFlashedOn,
                foreResolver: resolveForeColor_Alarm_LowFlashedOn,
            },
            Alarm_LowAltRowFlashedOn: {
                id: ItemId.Alarm_LowAltRowFlashedOn,
                name: 'Alarm_LowAltRowFlashedOn',
                display: 'Alarm: Low Alt Row Flashed On',
                bkgdResolver: resolveBkgdColor_Alarm_LowAltRowFlashedOn,
                foreResolver: resolveForeColor_Alarm_LowAltRowFlashedOn,
            },
            Alarm_Normal: {
                id: ItemId.Alarm_Normal,
                name: 'Alarm_Normal',
                display: 'Alarm: Normal',
                bkgdResolver: resolveBkgdColor_Alarm_Normal,
                foreResolver: resolveForeColor_Alarm_Normal,
            },
            Alarm_NormalAltRow: {
                id: ItemId.Alarm_NormalAltRow,
                name: 'Alarm_NormalAltRow',
                display: 'Alarm: Normal Alt Row',
                bkgdResolver: resolveBkgdColor_Alarm_NormalAltRow,
                foreResolver: resolveForeColor_Alarm_NormalAltRow,
            },
            Alarm_NormalFlashedOn: {
                id: ItemId.Alarm_NormalFlashedOn,
                name: 'Alarm_NormalFlashedOn',
                display: 'Alarm: Normal Flashed On',
                bkgdResolver: resolveBkgdColor_Alarm_NormalFlashedOn,
                foreResolver: resolveForeColor_Alarm_NormalFlashedOn,
            },
            Alarm_NormalAltRowFlashedOn: {
                id: ItemId.Alarm_NormalAltRowFlashedOn,
                name: 'Alarm_NormalAltRowFlashedOn',
                display: 'Alarm: Normal Alt Row Flashed On',
                bkgdResolver: resolveBkgdColor_Alarm_NormalAltRowFlashedOn,
                foreResolver: resolveForeColor_Alarm_NormalAltRowFlashedOn,
            },
            Alarm_High: {
                id: ItemId.Alarm_High,
                name: 'Alarm_High',
                display: 'Alarm: High',
                bkgdResolver: resolveBkgdColor_Alarm_High,
                foreResolver: resolveForeColor_Alarm_High,
            },
            Alarm_HighAltRow: {
                id: ItemId.Alarm_HighAltRow,
                name: 'Alarm_HighAltRow',
                display: 'Alarm: High Alt Row',
                bkgdResolver: resolveBkgdColor_Alarm_HighAltRow,
                foreResolver: resolveForeColor_Alarm_HighAltRow,
            },
            Alarm_HighFlashedOn: {
                id: ItemId.Alarm_HighFlashedOn,
                name: 'Alarm_HighFlashedOn',
                display: 'Alarm: High Flashed On',
                bkgdResolver: resolveBkgdColor_Alarm_HighFlashedOn,
                foreResolver: resolveForeColor_Alarm_HighFlashedOn,
            },
            Alarm_HighAltRowFlashedOn: {
                id: ItemId.Alarm_HighAltRowFlashedOn,
                name: 'Alarm_HighAltRowFlashedOn',
                display: 'Alarm: High Alt Row Flashed On',
                bkgdResolver: resolveBkgdColor_Alarm_HighAltRowFlashedOn,
                foreResolver: resolveForeColor_Alarm_HighAltRowFlashedOn,
            },
            Alarm_Urgent: {
                id: ItemId.Alarm_Urgent,
                name: 'Alarm_Urgent',
                display: 'Alarm: Urgent',
                bkgdResolver: resolveBkgdColor_Alarm_Urgent,
                foreResolver: resolveForeColor_Alarm_Urgent,
            },
            Alarm_UrgentAltRow: {
                id: ItemId.Alarm_UrgentAltRow,
                name: 'Alarm_UrgentAltRow',
                display: 'Alarm: Urgent Alt Row',
                bkgdResolver: resolveBkgdColor_Alarm_UrgentAltRow,
                foreResolver: resolveForeColor_Alarm_UrgentAltRow,
            },
            Alarm_UrgentFlashedOn: {
                id: ItemId.Alarm_UrgentFlashedOn,
                name: 'Alarm_UrgentFlashedOn',
                display: 'Alarm: Urgent Flashed On',
                bkgdResolver: resolveBkgdColor_Alarm_UrgentFlashedOn,
                foreResolver: resolveForeColor_Alarm_UrgentFlashedOn,
            },
            Alarm_UrgentAltRowFlashedOn: {
                id: ItemId.Alarm_UrgentAltRowFlashedOn,
                name: 'Alarm_UrgentAltRowFlashedOn',
                display: 'Alarm: Urgent Alt Row Flashed On',
                bkgdResolver: resolveBkgdColor_Alarm_UrgentAltRowFlashedOn,
                foreResolver: resolveForeColor_Alarm_UrgentAltRowFlashedOn,
            },
            Alarm_Error: {
                id: ItemId.Alarm_Error,
                name: 'Alarm_Error',
                display: 'Alarm: Error',
                bkgdResolver: resolveBkgdColor_Alarm_Error,
                foreResolver: resolveForeColor_Alarm_Error,
            },
            Alarm_ErrorAltRow: {
                id: ItemId.Alarm_ErrorAltRow,
                name: 'Alarm_ErrorAltRow',
                display: 'Alarm: Error Alt Row',
                bkgdResolver: resolveBkgdColor_Alarm_ErrorAltRow,
                foreResolver: resolveForeColor_Alarm_ErrorAltRow,
            },
            Alarm_ErrorFlashedOn: {
                id: ItemId.Alarm_ErrorFlashedOn,
                name: 'Alarm_ErrorFlashedOn',
                display: 'Alarm: Error Flashed On',
                bkgdResolver: resolveBkgdColor_Alarm_ErrorFlashedOn,
                foreResolver: resolveForeColor_Alarm_ErrorFlashedOn,
            },
            Alarm_ErrorAltRowFlashedOn: {
                id: ItemId.Alarm_ErrorAltRowFlashedOn,
                name: 'Alarm_ErrorAltRowFlashedOn',
                display: 'Alarm: Error Alt Row Flashed On',
                bkgdResolver: resolveBkgdColor_Alarm_ErrorAltRowFlashedOn,
                foreResolver: resolveForeColor_Alarm_ErrorAltRowFlashedOn,
            },
            TitleBarButton: {
                id: ItemId.TitleBarButton,
                name: 'TitleBarButton',
                display: 'Title Bar Button',
                bkgdResolver: resolveBkgdColor_TitleBarButton,
                foreResolver: resolveForeColor_TitleBarButton,
            },
            AlertsTitleBarButton: {
                id: ItemId.AlertsTitleBarButton,
                name: 'AlertsTitleBarButton',
                display: 'Alerts Title Bar Button',
                bkgdResolver: resolveBkgdColor_AlertsTitleBarButton,
                foreResolver: resolveForeColor_AlertsTitleBarButton,
            },
            AlertsTitleBarButton_FlashedOn: {
                id: ItemId.AlertsTitleBarButton_FlashedOn,
                name: 'AlertsTitleBarButton_FlashedOn',
                display: 'Alerts Title Bar Button Flashed On',
                bkgdResolver: resolveBkgdColor_AlertsTitleBarButton_FlashedOn,
                foreResolver: resolveForeColor_AlertsTitleBarButton_FlashedOn,
            },
            TextDisplay: {
                id: ItemId.TextDisplay,
                name: 'TextDisplay',
                display: 'TextDisplay',
                bkgdResolver: resolveBkgdColor_TextDisplay,
                foreResolver: resolveForeColor_TextDisplay,
            },
            TextDisplay_Disabled: {
                id: ItemId.TextDisplay_Disabled,
                name: 'TextDisplay_Disabled',
                display: 'TextDisplay: Disabled',
                bkgdResolver: resolveBkgdColor_TextDisplay_Disabled,
                foreResolver: resolveForeColor_TextDisplay_Disabled,
            },
            TextDisplay_Waiting: {
                id: ItemId.TextDisplay_Waiting,
                name: 'TextDisplay_Waiting',
                display: 'TextDisplay: Waiting',
                bkgdResolver: resolveBkgdColor_TextDisplay_Waiting,
                foreResolver: resolveForeColor_TextDisplay_Waiting,
            },
            TextDisplay_Info: {
                id: ItemId.TextDisplay_Info,
                name: 'TextDisplay_Info',
                display: 'TextDisplay: Info',
                bkgdResolver: resolveBkgdColor_TextDisplay_Info,
                foreResolver: resolveForeColor_TextDisplay_Info,
            },
            TextDisplay_Warning: {
                id: ItemId.TextDisplay_Warning,
                name: 'TextDisplay_Warning',
                display: 'TextDisplay: Warning',
                bkgdResolver: resolveBkgdColor_TextDisplay_Warning,
                foreResolver: resolveForeColor_TextDisplay_Warning,
            },
            TextDisplay_Error: {
                id: ItemId.TextDisplay_Error,
                name: 'TextDisplay_Error',
                display: 'TextDisplay: Error',
                bkgdResolver: resolveBkgdColor_TextDisplay_Error,
                foreResolver: resolveForeColor_TextDisplay_Error,
            },
            TextDisplay_Danger: {
                id: ItemId.TextDisplay_Danger,
                name: 'TextDisplay_Danger',
                display: 'TextDisplay: Danger',
                bkgdResolver: resolveBkgdColor_TextDisplay_Danger,
                foreResolver: resolveForeColor_TextDisplay_Danger,
            },*/
            TextControl: {
                id: ItemId.TextControl,
                name: 'TextControl',
                display: 'TextControl',
                bkgdResolver: resolveBkgdColor_TextControl,
                foreResolver: resolveForeColor_TextControl,
            },
            TextControl_Disabled: {
                id: ItemId.TextControl_Disabled,
                name: 'TextControl_Disabled',
                display: 'TextControl: Disabled',
                bkgdResolver: resolveBkgdColor_TextControl_Disabled,
                foreResolver: resolveForeColor_TextControl_Disabled,
            },
            TextControl_ReadOnly: {
                id: ItemId.TextControl_ReadOnly,
                name: 'TextControl_ReadOnly',
                display: 'TextControl: ReadOnly',
                bkgdResolver: resolveBkgdColor_TextControl_ReadOnly,
                foreResolver: resolveForeColor_TextControl_ReadOnly,
            },
            TextControl_Missing: {
                id: ItemId.TextControl_Missing,
                name: 'TextControl_Missing',
                display: 'TextControl: Missing',
                bkgdResolver: resolveBkgdColor_TextControl_Missing,
                foreResolver: resolveForeColor_TextControl_Missing,
            },
            TextControl_Invalid: {
                id: ItemId.TextControl_Invalid,
                name: 'TextControl_Invalid',
                display: 'TextControl: Invalid',
                bkgdResolver: resolveBkgdColor_TextControl_Invalid,
                foreResolver: resolveForeColor_TextControl_Invalid,
            },
            TextControl_Valid: {
                id: ItemId.TextControl_Valid,
                name: 'TextControl_Valid',
                display: 'TextControl: Valid',
                bkgdResolver: resolveBkgdColor_TextControl_Valid,
                foreResolver: resolveForeColor_TextControl_Valid,
            },
            TextControl_Accepted: {
                id: ItemId.TextControl_Accepted,
                name: 'TextControl_Accepted',
                display: 'TextControl: Accepted',
                bkgdResolver: resolveBkgdColor_TextControl_Accepted,
                foreResolver: resolveForeColor_TextControl_Accepted,
            },
            TextControl_Waiting: {
                id: ItemId.TextControl_Waiting,
                name: 'TextControl_Waiting',
                display: 'TextControl: Waiting',
                bkgdResolver: resolveBkgdColor_TextControl_Waiting,
                foreResolver: resolveForeColor_TextControl_Waiting,
            },
            TextControl_Warning: {
                id: ItemId.TextControl_Warning,
                name: 'TextControl_Warning',
                display: 'TextControl: Warning',
                bkgdResolver: resolveBkgdColor_TextControl_Warning,
                foreResolver: resolveForeColor_TextControl_Warning,
            },
            TextControl_Error: {
                id: ItemId.TextControl_Error,
                name: 'TextControl_Error',
                display: 'TextControl: Error',
                bkgdResolver: resolveBkgdColor_TextControl_Error,
                foreResolver: resolveForeColor_TextControl_Error,
            },
            TextControl_Highlight: {
                id: ItemId.TextControl_Highlight,
                name: 'TextControl_Highlight',
                display: 'TextControl: Highlight',
                bkgdResolver: resolveBkgdColor_TextControl_Highlight,
                foreResolver: resolveForeColor_TextControl_Highlight,
            },
            TextControl_Selected: {
                id: ItemId.TextControl_Selected,
                name: 'TextControl_Selected',
                display: 'TextControl: Selected',
                bkgdResolver: resolveBkgdColor_TextControl_Selected,
                foreResolver: resolveForeColor_TextControl_Selected,
            },
            ClickControl: {
                id: ItemId.ClickControl,
                name: 'ClickControl',
                display: 'ClickControl',
                bkgdResolver: resolveBkgdColor_ClickControl,
                foreResolver: resolveForeColor_ClickControl,
            },
            ClickControl_Disabled: {
                id: ItemId.ClickControl_Disabled,
                name: 'ClickControl_Disabled',
                display: 'ClickControl: Disabled',
                bkgdResolver: resolveBkgdColor_ClickControl_Disabled,
                foreResolver: resolveForeColor_ClickControl_Disabled,
            },
            ClickControl_ReadOnly: {
                id: ItemId.ClickControl_ReadOnly,
                name: 'ClickControl_ReadOnly',
                display: 'ClickControl: ReadOnly',
                bkgdResolver: resolveBkgdColor_ClickControl_ReadOnly,
                foreResolver: resolveForeColor_ClickControl_ReadOnly,
            },
            ClickControl_Missing: {
                id: ItemId.ClickControl_Missing,
                name: 'ClickControl_Missing',
                display: 'ClickControl: Missing',
                bkgdResolver: resolveBkgdColor_ClickControl_Missing,
                foreResolver: resolveForeColor_ClickControl_Missing,
            },
            ClickControl_Invalid: {
                id: ItemId.ClickControl_Invalid,
                name: 'ClickControl_Invalid',
                display: 'ClickControl: Invalid',
                bkgdResolver: resolveBkgdColor_ClickControl_Invalid,
                foreResolver: resolveForeColor_ClickControl_Invalid,
            },
            ClickControl_Valid: {
                id: ItemId.ClickControl_Valid,
                name: 'ClickControl_Valid',
                display: 'ClickControl: Valid',
                bkgdResolver: resolveBkgdColor_ClickControl_Valid,
                foreResolver: resolveForeColor_ClickControl_Valid,
            },
            ClickControl_Accepted: {
                id: ItemId.ClickControl_Accepted,
                name: 'ClickControl_Accepted',
                display: 'ClickControl: Accepted',
                bkgdResolver: resolveBkgdColor_ClickControl_Accepted,
                foreResolver: resolveForeColor_ClickControl_Accepted,
            },
            ClickControl_Waiting: {
                id: ItemId.ClickControl_Waiting,
                name: 'ClickControl_Waiting',
                display: 'ClickControl: Waiting',
                bkgdResolver: resolveBkgdColor_ClickControl_Waiting,
                foreResolver: resolveForeColor_ClickControl_Waiting,
            },
            ClickControl_Warning: {
                id: ItemId.ClickControl_Warning,
                name: 'ClickControl_Warning',
                display: 'ClickControl: Warning',
                bkgdResolver: resolveBkgdColor_ClickControl_Warning,
                foreResolver: resolveForeColor_ClickControl_Warning,
            },
            ClickControl_Error: {
                id: ItemId.ClickControl_Error,
                name: 'ClickControl_Error',
                display: 'ClickControl: Error',
                bkgdResolver: resolveBkgdColor_ClickControl_Error,
                foreResolver: resolveForeColor_ClickControl_Error,
            },
            Label: {
                id: ItemId.Label,
                name: 'Label',
                display: 'Label',
                bkgdResolver: resolveBkgdColor_Label,
                foreResolver: resolveForeColor_Label,
            },
            Label_Disabled: {
                id: ItemId.Label_Disabled,
                name: 'Label_Disabled',
                display: 'Label: Disabled',
                bkgdResolver: resolveBkgdColor_Label_Disabled,
                foreResolver: resolveForeColor_Label_Disabled,
            },
            Label_ReadOnly: {
                id: ItemId.Label_ReadOnly,
                name: 'Label_ReadOnly',
                display: 'Label: ReadOnly',
                bkgdResolver: resolveBkgdColor_Label_ReadOnly,
                foreResolver: resolveForeColor_Label_ReadOnly,
            },
            Label_Missing: {
                id: ItemId.Label_Missing,
                name: 'Label_Missing',
                display: 'Label: Missing',
                bkgdResolver: resolveBkgdColor_Label_Missing,
                foreResolver: resolveForeColor_Label_Missing,
            },
            Label_Invalid: {
                id: ItemId.Label_Invalid,
                name: 'Label_Invalid',
                display: 'Label: Invalid',
                bkgdResolver: resolveBkgdColor_Label_Invalid,
                foreResolver: resolveForeColor_Label_Invalid,
            },
            Label_Valid: {
                id: ItemId.Label_Valid,
                name: 'Label_Valid',
                display: 'Label: Valid',
                bkgdResolver: resolveBkgdColor_Label_Valid,
                foreResolver: resolveForeColor_Label_Valid,
            },
            Label_Accepted: {
                id: ItemId.Label_Accepted,
                name: 'Label_Accepted',
                display: 'Label: Accepted',
                bkgdResolver: resolveBkgdColor_Label_Accepted,
                foreResolver: resolveForeColor_Label_Accepted,
            },
            Label_Waiting: {
                id: ItemId.Label_Waiting,
                name: 'Label_Waiting',
                display: 'Label: Waiting',
                bkgdResolver: resolveBkgdColor_Label_Waiting,
                foreResolver: resolveForeColor_Label_Waiting,
            },
            Label_Warning: {
                id: ItemId.Label_Warning,
                name: 'Label_Warning',
                display: 'Label: Warning',
                bkgdResolver: resolveBkgdColor_Label_Warning,
                foreResolver: resolveForeColor_Label_Warning,
            },
            Label_Error: {
                id: ItemId.Label_Error,
                name: 'Label_Error',
                display: 'Label: Error',
                bkgdResolver: resolveBkgdColor_Label_Error,
                foreResolver: resolveForeColor_Label_Error,
            },
            Caution: {
                id: ItemId.Caution,
                name: 'Caution',
                display: 'Caution',
                bkgdResolver: resolveBkgdColor_Caution,
                foreResolver: resolveForeColor_Caution,
            },
            Caution_UsableButNotGood: {
                id: ItemId.Caution_UsableButNotGood,
                name: 'Caution_UsableButNotGood',
                display: 'Caution_UsableButNotGood',
                bkgdResolver: resolveBkgdColor_Caution_UsableButNotGood,
                foreResolver: resolveForeColor_Caution_UsableButNotGood,
            },
            Caution_Suspect: {
                id: ItemId.Caution_Suspect,
                name: 'Caution_Suspect',
                display: 'Caution_Suspect',
                bkgdResolver: resolveBkgdColor_Caution_Suspect,
                foreResolver: resolveForeColor_Caution_Suspect,
            },
            Caution_Error: {
                id: ItemId.Caution_Error,
                name: 'Caution_Error',
                display: 'Caution_Error',
                bkgdResolver: resolveBkgdColor_Caution_Error,
                foreResolver: resolveForeColor_Caution_Error,
            },

            Text_ControlBorder: {
                id: ItemId.Text_ControlBorder,
                name: 'Text_ControlBorder',
                display: 'Text: Control Border',
                bkgdResolver: resolveBkgdColor_Text_ControlBorder,
                foreResolver: resolveForeColor_Text_ControlBorder,
            },
            Text_ReadonlyMultiline: {
                id: ItemId.Text_ReadonlyMultiline,
                name: 'Text_ReadonlyMultiline',
                display: 'Text: Readonly Multiline',
                bkgdResolver: resolveBkgdColor_Text_ReadonlyMultiline,
                foreResolver: resolveForeColor_Text_ReadonlyMultiline,
            },
            Text_GreyedOut: {
                id: ItemId.Text_GreyedOut,
                name: 'Text_GreyedOut',
                display: 'Text: Greyed out',
                bkgdResolver: resolveBkgdColor_Text_GreyedOut,
                foreResolver: resolveForeColor_Text_GreyedOut,
            },
            IconButton: {
                id: ItemId.IconButton,
                name: 'IconButton',
                display: 'Icon Button',
                bkgdResolver: resolveBkgdColor_IconButton,
                foreResolver: resolveForeColor_IconButton,
            },
            IconButton_SelectedBorder: {
                id: ItemId.IconButton_SelectedBorder,
                name: 'IconButton_SelectedBorder',
                display: 'Icon Button: Selected Border',
                bkgdResolver: undefined,
                foreResolver: resolveForeColor_IconButton_SelectedBorder,
            },
            IconButton_Hover: {
                id: ItemId.IconButton_Hover,
                name: 'IconButton_Hover',
                display: 'Icon Button: Hover',
                bkgdResolver: resolveBkgdColor_IconButton_Hover,
                foreResolver: undefined,
            },
/*            OrderPad_Side_Buy: {
                id: ItemId.OrderPad_Side_Buy,
                name: 'OrderPad_Side_Buy',
                display: 'OrderPad: Side: Buy',
                bkgdResolver: resolveBkgdColor_OrderPad_Side_Buy,
                foreResolver: undefined,
            },
            OrderPad_Side_Sell: {
                id: ItemId.OrderPad_Side_Sell,
                name: 'OrderPad_Side_Sell',
                display: 'OrderPad: Side: Sell',
                bkgdResolver: resolveBkgdColor_OrderPad_Side_Sell,
                foreResolver: undefined,
            },
            OrderPad_Side_Empty: {
                id: ItemId.OrderPad_Side_Empty,
                name: 'OrderPad_Side_Empty',
                display: 'OrderPad: Side Empty',
                bkgdResolver: resolveBkgdColor_OrderPad_Side_Empty,
                foreResolver: undefined,
            },
            OrderPad_Side_Unknown: {
                id: ItemId.OrderPad_Side_Unknown,
                name: 'OrderPad_Side_Unknown',
                display: 'OrderPad: Side Unknown',
                bkgdResolver: resolveBkgdColor_OrderPad_Side_Unknown,
                foreResolver: undefined,
            },
            ApfcOrderStatus_Accepted: {
                id: ItemId.ApfcOrderStatus_Accepted,
                name: 'ApfcOrderStatus_Accepted',
                display: 'APFC Order Status: Accepted',
                bkgdResolver: undefined,
                foreResolver: undefined,
            },
            ApfcOrderStatus_AcceptedAlt: {
                id: ItemId.ApfcOrderStatus_AcceptedAlt,
                name: 'ApfcOrderStatus_AcceptedAlt',
                display: 'APFC OrderStatus: Accepted Alt',
                bkgdResolver: undefined,
                foreResolver: undefined,
            },
            ApfcOrderStatus_PartiallyFilled: {
                id: ItemId.ApfcOrderStatus_PartiallyFilled,
                name: 'ApfcOrderStatus_PartiallyFilled',
                display: 'APFC Order Status: Partially Filled',
                bkgdResolver: undefined,
                foreResolver: undefined,
            },
            ApfcOrderStatus_PartiallyFilledAlt: {
                id: ItemId.ApfcOrderStatus_PartiallyFilledAlt,
                name: 'ApfcOrderStatus_PartiallyFilledAlt',
                display: 'APFC Order Status: Partially Filled Alt',
                bkgdResolver: undefined,
                foreResolver: undefined,
            },
            ApfcOrderStatus_Filled: {
                id: ItemId.ApfcOrderStatus_Filled,
                name: 'ApfcOrderStatus_Filled',
                display: 'APFC Order Status: Filled',
                bkgdResolver: undefined,
                foreResolver: undefined,
            },
            ApfcOrderStatus_FilledAlt: {
                id: ItemId.ApfcOrderStatus_FilledAlt,
                name: 'ApfcOrderStatus_FilledAlt',
                display: 'APFC Order Status: Filled Alt',
                bkgdResolver: undefined,
                foreResolver: undefined,
            },
            ApfcOrderStatus_Cancelled: {
                id: ItemId.ApfcOrderStatus_Cancelled,
                name: 'ApfcOrderStatus_Cancelled',
                display: 'APFC Order Status: Cancelled',
                bkgdResolver: undefined,
                foreResolver: undefined,
            },
            ApfcOrderStatus_CancelledAlt: {
                id: ItemId.ApfcOrderStatus_CancelledAlt,
                name: 'ApfcOrderStatus_CancelledAlt',
                display: 'APFC Order Status: Cancelled Alt',
                bkgdResolver: undefined,
                foreResolver: undefined,
            },
            ApfcOrderStatus_Other: {
                id: ItemId.ApfcOrderStatus_Other,
                name: 'ApfcOrderStatus_Other',
                display: 'APFC Order Status: Other',
                bkgdResolver: undefined,
                foreResolver: undefined,
            },
            ApfcOrderStatus_OtherAlt: {
                id: ItemId.ApfcOrderStatus_OtherAlt,
                name: 'ApfcOrderStatus_OtherAlt',
                display: 'APFC Order Status: Other Alt',
                bkgdResolver: undefined,
                foreResolver: undefined,
            },
            PopupLookup_Id: {
                id: ItemId.PopupLookup_Id,
                name: 'PopupLookup_Id',
                display: 'PopupLookup: Id',
                bkgdResolver: resolveBkgdColor_PopupLookup_Id,
                foreResolver: resolveForeColor_PopupLookup_Id,
            },
            PopupLookup_IdAlt: {
                id: ItemId.PopupLookup_IdAlt,
                name: 'PopupLookup_IdAlt',
                display: 'PopupLookup: Id Alt',
                bkgdResolver: resolveBkgdColor_PopupLookup_IdAlt,
                foreResolver: resolveForeColor_PopupLookup_IdAlt,
            },
            PopupLookup_IdFocused: {
                id: ItemId.PopupLookup_IdFocused,
                name: 'PopupLookup_IdFocused',
                display: 'PopupLookup: Id Focused',
                bkgdResolver: resolveBkgdColor_PopupLookup_IdFocused,
                foreResolver: resolveForeColor_PopupLookup_IdFocused,
            },
            PopupLookup_Description: {
                id: ItemId.PopupLookup_Description,
                name: 'PopupLookup_Description',
                display: 'PopupLookup: Description',
                bkgdResolver: resolveBkgdColor_PopupLookup_Description,
                foreResolver: resolveForeColor_PopupLookup_Description,
            },
            PopupLookup_DescriptionAlt: {
                id: ItemId.PopupLookup_DescriptionAlt,
                name: 'PopupLookup_DescriptionAlt',
                display: 'PopupLookup: Description Alt',
                bkgdResolver: resolveBkgdColor_PopupLookup_DescriptionAlt,
                foreResolver: resolveForeColor_PopupLookup_DescriptionAlt,
            },
            PopupLookup_DescriptionFocused: {
                id: ItemId.PopupLookup_DescriptionFocused,
                name: 'PopupLookup_DescriptionFocused',
                display: 'PopupLookup: Description Focused',
                bkgdResolver: resolveBkgdColor_PopupLookup_DescriptionFocused,
                foreResolver: resolveForeColor_PopupLookup_DescriptionFocused,
            },
            DragImageText: {
                id: ItemId.DragImageText,
                name: 'DragImageText',
                display: 'Drag Image Text',
                bkgdResolver: resolveBkgdColor_DragImageText,
                foreResolver: resolveForeColor_DragImageText,
            },
            WaitingPanel: {
                id: ItemId.WaitingPanel,
                name: 'WaitingPanel',
                display: 'Waiting Panel',
                bkgdResolver: resolveBkgdColor_WaitingPanel,
                foreResolver: resolveForeColor_WaitingPanel,
            },
            WaitingBar: {
                id: ItemId.WaitingBar,
                name: 'WaitingBar',
                display: 'Waiting Bar',
                bkgdResolver: resolveBkgdColor_WaitingBar,
                foreResolver: undefined,
            },
            Highlight: {
                id: ItemId.Highlight,
                name: 'Highlight',
                display: 'Highlight',
                bkgdResolver: resolveBkgdColor_Highlight,
                foreResolver: resolveForeColor_Highlight,
            },*/
            Panel: {
                id: ItemId.Panel,
                name: 'Panel',
                display: 'Panel',
                bkgdResolver: resolveBkgdColor_Panel,
                foreResolver: resolveForeColor_Panel,
            },
            Panel_Hoisted: {
                id: ItemId.Panel_Hoisted,
                name: 'Panel_Hoisted',
                display: 'Panel: Hoisted',
                bkgdResolver: resolveBkgdColor_Panel_Hoisted,
                foreResolver: resolveForeColor_Panel_Hoisted,
            },
            Panel_Divider: {
                id: ItemId.Panel_Divider,
                name: 'Panel_Divider',
                display: 'Panel: Divider',
                bkgdResolver: resolveBkgdColor_Panel_Divider,
                foreResolver: resolveForeColor_Panel_Divider,
            },
            Panel_Splitter: {
                id: ItemId.Panel_Splitter,
                name: 'Panel_Splitter',
                display: 'Panel: Splitter',
                bkgdResolver: resolveBkgdColor_Panel_Splitter,
                foreResolver: resolveForeColor_Panel_Splitter,
            },
            Panel_ItemHover: {
                id: ItemId.Panel_ItemHover,
                name: 'Panel_ItemHover',
                display: 'Panel: Item Hover',
                bkgdResolver: resolveBkgdColor_Panel_ItemHover,
                foreResolver: undefined,
            },
            Unexpected: {
                id: ItemId.Unexpected,
                name: 'Unexpected',
                display: 'Unexpected',
                bkgdResolver: resolveBkgdColor_Unexpected,
                foreResolver: resolveForeColor_Unexpected,
            },
        };

        export const idCount = Object.keys(infosObject).length;

        const infos = Object.values(infosObject);

        class StaticInfo {
            static readonly bkgdSuffix = 'bkgd';
            static readonly foreSuffix = 'fore';

            private _bkgdCssVariableName: string;
            private _foreCssVariableName: string;

            constructor(
                id: ItemId) {
                this._bkgdCssVariableName = this.idNameToCssVariableName(id, StaticInfo.bkgdSuffix);
                this._foreCssVariableName = this.idNameToCssVariableName(id, StaticInfo.foreSuffix);
            }

            get bkgdCssVariableName() { return this._bkgdCssVariableName; }
            get foreCssVariableName() { return this._foreCssVariableName; }

            private idNameToCssVariableName(id: ItemId, suffix: string) {
                function upperToHyphenLower(match: string, offset: Integer) {
                    return (offset > 0 ? '-' : '') + match.toLowerCase();
                }

                const propertyName = Item.idToName(id)
                    .replace(/_/g, '')
                    .replace(/[A-Z]/g, upperToHyphenLower);

                return `--color-${propertyName}-${suffix}`;
            }
        }

        export const enum FolderId {
            Grid
        }
        export namespace Folder {
            class FolderInfo {
                constructor(
                    public id: FolderId,
                    public name: string,
                    public prefix: string,
                ) { }
            }

            type FolderInfosObject = { [id in keyof typeof FolderId]: FolderInfo };

            const folderInfosObject: FolderInfosObject = {
                Grid: {
                    id: FolderId.Grid,
                    name: 'Grid',
                    prefix: 'Grid_',
                },
            };

            export const folderIdCount = Object.keys(folderInfosObject).length;
            const folderInfos = Object.values(folderInfosObject);

            export function staticConstructor() {
                const outOfOrderIdx = folderInfos.findIndex((info: FolderInfo, index: Integer) => info.id !== index);
                if (outOfOrderIdx >= 0) {
                    throw new EnumInfoOutOfOrderError('CSIFSC28857', outOfOrderIdx, folderInfos[outOfOrderIdx].prefix);
                }
            }

            // eslint-disable-next-line @typescript-eslint/no-shadow
            export function idToName(id: FolderId): string {
                return folderInfos[id].name;
            }

            // eslint-disable-next-line @typescript-eslint/no-shadow
            export function tryNameToId(nameValue: string): FolderId | undefined {
                for (let idx = 0; idx < folderInfos.length; idx++) {
                    if (folderInfos[idx].name === nameValue) {
                        return folderInfos[idx].id;
                    }
                }
                return undefined;
            }

            export function idToPrefix(id: FolderId): string {
                return folderInfos[id].prefix;
            }
        }

        const staticInfos = new Array<StaticInfo>(idCount);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('ColorScheme.ItemId', outOfOrderIdx, infos[outOfOrderIdx].name);
            }

            for (let id = 0; id < idCount; id++) {
                staticInfos[id] = new StaticInfo(id);
            }
        }

        export function idToName(id: ItemId): string {
            return infos[id].name;
        }
        export function tryNameToId(nameValue: string): ItemId | undefined {
            for (let idx = 0; idx < infos.length; idx++) {
                if (infos[idx].name === nameValue) {
                    return infos[idx].id;
                }
            }
            return undefined;
        }
        export function idToDisplay(id: ItemId): string {
            return infos[id].display;
        }
        export function tryDisplayToId(display: string): ItemId | undefined {
            for (let idx = 0; idx < infos.length; idx++) {
                if (infos[idx].display === display) {
                    return infos[idx].id;
                }
            }
            return undefined;
        }
        export function idHasBkgd(id: ItemId): boolean {
            return infos[id].bkgdResolver !== undefined;
        }
        export function idHasFore(id: ItemId): boolean {
            return infos[id].foreResolver !== undefined;
        }
        export function idHas(id: ItemId, bkgdFore: ColorScheme.BkgdForeId) {
            switch (bkgdFore) {
                case ColorScheme.BkgdForeId.Bkgd: return idHasBkgd(id);
                case ColorScheme.BkgdForeId.Fore: return idHasFore(id);
                default: throw new UnreachableCaseError('CSIH67677399', bkgdFore);
            }
        }

        export function idToBkgdResolver(id: ItemId) {
            return infos[id].bkgdResolver;
        }

        export function idToForeResolver(id: ItemId) {
            return infos[id].foreResolver;
        }

        export function getAll(): Id[] {
            return infos.map(info => info.id);
        }

        export function idToBkgdCssVariableName(id: ItemId) {
            return staticInfos[id].bkgdCssVariableName;
        }

        export function idToForeCssVariableName(id: ItemId) {
            return staticInfos[id].foreCssVariableName;
        }

        export function idInFolder(id: ItemId, folderId: FolderId) {
            return idToName(id).startsWith(Folder.idToPrefix(folderId));
        }

        export function areColorsEqual(left: Item, right: Item) {
            return left.bkgd === right.bkgd && left.fore === right.fore;
        }

        export function create(id: ItemId, bkgd: ColorScheme.ItemColor, fore: ColorScheme.ItemColor): Item {
            return {
                id,
                bkgd,
                fore
            };
        }

        export function createCopy(src: Item): Item {
            return create(src.id, src.bkgd, src.fore);
        }
    }

    function resolveBkgdColor_Layout_Base(items: Item[]) {
        const itemColor = items[ItemId.Layout_Base].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Panel(items) : itemColor;
    }
    function resolveForeColor_Layout_Base(items: Item[]) {
        const itemColor = items[ItemId.Layout_Base].bkgd;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Panel(items) : itemColor;
    }
    function resolveBkgdColor_Layout_SinglePaneContent(items: Item[]) {
        const itemColor = items[ItemId.Layout_SinglePaneContent].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Panel(items) : itemColor;
    }
    function resolveForeColor_Layout_PopinIconBorder(items: Item[]) {
        const itemColor = items[ItemId.Layout_PopinIconBorder].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Layout_Base(items) : itemColor;
    }
    function resolveForeColor_Layout_ActiveTab(items: Item[]) {
        const itemColor = items[ItemId.Layout_ActiveTab].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Layout_Base(items) : itemColor;
    }
    function resolveForeColor_Layout_DropTargetIndicatorOutline(items: Item[]) {
        const itemColor = items[ItemId.Layout_DropTargetIndicatorOutline].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Layout_Base(items) : itemColor;
    }
    function resolveBkgdColor_Layout_SplitterDragging(items: Item[]) {
        const itemColor = items[ItemId.Layout_SplitterDragging].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Layout_Base(items) : itemColor;
    }
    function resolveBkgdColor_Layout_SingleTabContainer(items: Item[]) {
        const itemColor = items[ItemId.Layout_SingleTabContainer].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Layout_Base(items) : itemColor;
    }
    function resolveForeColor_Layout_SingleTabContainer(items: Item[]) {
        const itemColor = items[ItemId.Layout_SingleTabContainer].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Layout_Base(items) : itemColor;
    }
    function resolveBkgdColor_Layout_SelectedHeader(items: Item[]) {
        const itemColor = items[ItemId.Layout_SelectedHeader].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Layout_Base(items) : itemColor;
    }
    function resolveForeColor_Layout_TransitionIndicatorBorder(items: Item[]) {
        const itemColor = items[ItemId.Layout_TransitionIndicatorBorder].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Layout_Base(items) : itemColor;
    }
    function resolveForeColor_Layout_DropDownArrow(items: Item[]) {
        const itemColor = items[ItemId.Layout_DropDownArrow].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Layout_Base(items) : itemColor;
    }

    function resolveBkgdColor_Environment_Production(items: Item[]) {
        const itemColor = items[ItemId.Environment_Production].bkgd;
        return (itemColor === schemeInheritColor) ? FallbackEnvironmentProductionBkgdColor : itemColor;
    }
    function resolveForeColor_Environment_Production(items: Item[]) {
        const itemColor = items[ItemId.Environment_Production].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Panel(items) : itemColor;
    }
    function resolveBkgdColor_Environment_DelayedProduction(items: Item[]) {
        const itemColor = items[ItemId.Environment_DelayedProduction].bkgd;
        return (itemColor === schemeInheritColor) ? FallbackEnvironmentDelayedProductionBkgdColor : itemColor;
    }
    function resolveForeColor_Environment_DelayedProduction(items: Item[]) {
        const itemColor = items[ItemId.Environment_DelayedProduction].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Panel(items) : itemColor;
    }
    function resolveBkgdColor_Environment_Demo(items: Item[]) {
        const itemColor = items[ItemId.Environment_Demo].bkgd;
        return (itemColor === schemeInheritColor) ? FallbackEnvironmentDemoBkgdColor : itemColor;
    }
    function resolveForeColor_Environment_Demo(items: Item[]) {
        const itemColor = items[ItemId.Environment_Demo].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Panel(items) : itemColor;
    }
    function resolveBkgdColor_Environment_Production_Offline(items: Item[]) {
        const itemColor = items[ItemId.Environment_Production_Offline].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Environment_Production(items) : itemColor;
    }
    function resolveForeColor_Environment_Production_Offline(items: Item[]) {
        const itemColor = items[ItemId.Environment_Production_Offline].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Environment_Production(items) : itemColor;
    }
    function resolveBkgdColor_Environment_DelayedProduction_Offline(items: Item[]) {
        const itemColor = items[ItemId.Environment_DelayedProduction_Offline].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Environment_DelayedProduction(items) : itemColor;
    }
    function resolveForeColor_Environment_DelayedProduction_Offline(items: Item[]) {
        const itemColor = items[ItemId.Environment_DelayedProduction_Offline].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Environment_DelayedProduction(items) : itemColor;
    }
    function resolveBkgdColor_Environment_Demo_Offline(items: Item[]) {
        const itemColor = items[ItemId.Environment_Demo_Offline].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Environment_Demo(items) : itemColor;
    }
    function resolveForeColor_Environment_Demo_Offline(items: Item[]) {
        const itemColor = items[ItemId.Environment_Demo_Offline].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Environment_Demo(items) : itemColor;
    }
    function resolveBkgdColor_Environment_StartFinal(items: Item[]) {
        const itemColor = items[ItemId.Environment_StartFinal].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Panel(items) : itemColor;
    }
    function resolveForeColor_Environment_StartFinal(items: Item[]) {
        const itemColor = items[ItemId.Environment_StartFinal].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Panel(items) : itemColor;
    }
    function resolveBkgdColor_Environment_StartFinal_KickedOff(items: Item[]) {
        const itemColor = items[ItemId.Environment_StartFinal_KickedOff].bkgd;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Environment_StartFinal(items) : itemColor;
    }
    function resolveForeColor_Environment_StartFinal_KickedOff(items: Item[]) {
        const itemColor = items[ItemId.Environment_StartFinal_KickedOff].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Environment_StartFinal(items) : itemColor;
    }

    function resolveBkgdColor_DesktopBar(items: Item[]) {
        const itemColor = items[ItemId.DesktopBar].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Panel(items) : itemColor;
    }
    function resolveForeColor_DesktopBar(items: Item[]) {
        const itemColor = items[ItemId.DesktopBar].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Panel(items) : itemColor;
    }

    function resolveBkgdColor_MenuBar_RootItem(items: Item[]) {
        const itemColor = items[ItemId.MenuBar_RootItem].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_DesktopBar(items) : itemColor;
    }
    function resolveForeColor_MenuBar_RootItem(items: Item[]) {
        const itemColor = items[ItemId.MenuBar_RootItem].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_DesktopBar(items) : itemColor;
    }
    function resolveBkgdColor_MenuBar_RootItem_Disabled(items: Item[]) {
        const itemColor = items[ItemId.MenuBar_RootItem_Disabled].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_MenuBar_RootItem(items) : itemColor;
    }
    function resolveForeColor_MenuBar_RootItem_Disabled(items: Item[]) {
        const itemColor = items[ItemId.MenuBar_RootItem_Disabled].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_MenuBar_RootItem(items) : itemColor;
    }
    function resolveBkgdColor_MenuBar_RootItemHighlighted(items: Item[]) {
        const itemColor = items[ItemId.MenuBar_RootItemHighlighted].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_MenuBar_RootItem(items) : itemColor;
    }
    function resolveForeColor_MenuBar_RootItemHighlighted(items: Item[]) {
        const itemColor = items[ItemId.MenuBar_RootItemHighlighted].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_MenuBar_RootItem(items) : itemColor;
    }
    function resolveBkgdColor_MenuBar_OverlayMenu(items: Item[]) {
        const itemColor = items[ItemId.MenuBar_OverlayMenu].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Panel(items) : itemColor;
    }
    function resolveBkgdColor_MenuBar_OverlayItem(items: Item[]) {
        const itemColor = items[ItemId.MenuBar_OverlayItem].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_MenuBar_OverlayMenu(items) : itemColor;
    }
    function resolveForeColor_MenuBar_OverlayItem(items: Item[]) {
        const itemColor = items[ItemId.MenuBar_OverlayItem].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_MenuBar_RootItem(items) : itemColor;
    }
    function resolveBkgdColor_MenuBar_OverlayItem_Disabled(items: Item[]) {
        const itemColor = items[ItemId.MenuBar_OverlayItem_Disabled].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_MenuBar_OverlayItem(items) : itemColor;
    }
    function resolveForeColor_MenuBar_OverlayItem_Disabled(items: Item[]) {
        const itemColor = items[ItemId.MenuBar_OverlayItem_Disabled].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_MenuBar_OverlayItem(items) : itemColor;
    }
    function resolveBkgdColor_MenuBar_OverlayItemHighlighted(items: Item[]) {
        const itemColor = items[ItemId.MenuBar_OverlayItemHighlighted].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_MenuBar_OverlayItem(items) : itemColor;
    }
    function resolveForeColor_MenuBar_OverlayItemHighlighted(items: Item[]) {
        const itemColor = items[ItemId.MenuBar_OverlayItemHighlighted].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_MenuBar_OverlayItem(items) : itemColor;
    }
    function resolveForeColor_MenuBar_OverlayItem_Divider(items: Item[]) {
        const itemColor = items[ItemId.MenuBar_OverlayItemDivider].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Panel_Divider(items) : itemColor;
    }

    function resolveBkgdColor_Grid_Blank(items: Item[]) {
        const itemColor = items[ItemId.Grid_Blank].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_VerticalLine(items: Item[]) {
        const itemColor = items[ItemId.Grid_VerticalLine].fore;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Panel(items) : itemColor;
    }
    function resolveForeColor_Grid_HorizontalLine(items: Item[]) {
        const itemColor = items[ItemId.Grid_HorizontalLine].fore;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Panel(items) : itemColor;
    }
    function resolveBkgdColor_Grid_ColumnHeader(items: Item[]) {
        const itemColor = items[ItemId.Grid_ColumnHeader].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_ColumnHeader(items: Item[]) {
        const itemColor = items[ItemId.Grid_ColumnHeader].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_HighestPrioritySortColumnHeader(items: Item[]) {
        const itemColor = items[ItemId.Grid_HighestPrioritySortColumnHeader].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_ColumnHeader(items) : itemColor;
    }
    function resolveForeColor_Grid_HighestPrioritySortColumnHeader(items: Item[]) {
        const itemColor = items[ItemId.Grid_HighestPrioritySortColumnHeader].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_ColumnHeader(items) : itemColor;
    }
    function resolveBkgdColor_Grid_Base(items: Item[]) {
        const itemColor = items[ItemId.Grid_Base].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Panel(items) : itemColor;
    }
    function resolveForeColor_Grid_Base(items: Item[]) {
        const itemColor = items[ItemId.Grid_Base].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Panel(items) : itemColor;
    }
    function resolveBkgdColor_Grid_BaseAlt(items: Item[]) {
        const itemColor = items[ItemId.Grid_BaseAlt].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_BaseAlt(items: Item[]) {
        const itemColor = items[ItemId.Grid_BaseAlt].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_BaseFlashedOn(items: Item[]) {
        const itemColor = items[ItemId.Grid_BaseFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_BaseFlashedOn(items: Item[]) {
        const itemColor = items[ItemId.Grid_BaseFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_BaseAltFlashedOn(items: Item[]) {
        let itemColor = items[ItemId.Grid_BaseAltFlashedOn].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_BaseFlashedOn].bkgd;
            return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_BaseAlt(items) : itemColor;
        }
    }
    function resolveForeColor_Grid_BaseAltFlashedOn(items: Item[]) {
        let itemColor = items[ItemId.Grid_BaseAltFlashedOn].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_BaseFlashedOn].fore;
            return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_BaseAlt(items) : itemColor;
        }
    }
    function resolveBkgdColor_Grid_DataError(items: Item[]) {
        const itemColor = items[ItemId.Grid_DataError].bkgd;
        return itemColor === schemeInheritColor ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_DataError(items: Item[]) {
        const itemColor = items[ItemId.Grid_DataError].fore;
        return itemColor === schemeInheritColor ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_DataErrorAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_DataErrorAlt].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_DataError].bkgd;
            return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_BaseAlt(items) : itemColor;
        }
    }
    function resolveForeColor_Grid_DataErrorAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_DataErrorAlt].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_DataError].fore;
            return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_BaseAlt(items) : itemColor;
        }
    }
    function resolveBkgdColor_Grid_DataErrorRowHeader(items: Item[]) {
        const itemColor = items[ItemId.Grid_DataErrorRowHeader].bkgd;
        return itemColor === schemeInheritColor ? resolveBkgdColor_Grid_RowHeader(items) : itemColor;
    }
    function resolveForeColor_Grid_DataErrorRowHeader(items: Item[]) {
        const itemColor = items[ItemId.Grid_DataErrorRowHeader].fore;
        return itemColor === schemeInheritColor ? resolveForeColor_Grid_RowHeader(items) : itemColor;
    }
    function resolveBkgdColor_Grid_DataErrorRowHeaderAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_DataErrorRowHeaderAlt].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_DataErrorRowHeader].bkgd;
            return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_RowHeaderAlt(items) : itemColor;
        }
    }
    function resolveForeColor_Grid_DataErrorRowHeaderAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_DataErrorRowHeaderAlt].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_DataErrorRowHeader].fore;
            return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_RowHeaderAlt(items) : itemColor;
        }
    }
    function resolveBkgdColor_Grid_DataSuspect(items: Item[]) {
        const itemColor = items[ItemId.Grid_DataSuspect].bkgd;
        return itemColor === schemeInheritColor ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_DataSuspect(items: Item[]) {
        const itemColor = items[ItemId.Grid_DataSuspect].fore;
        return itemColor === schemeInheritColor ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_DataSuspectAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_DataSuspectAlt].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_DataSuspect].bkgd;
            return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_BaseAlt(items) : itemColor;
        }
    }
    function resolveForeColor_Grid_DataSuspectAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_DataSuspectAlt].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_DataSuspect].fore;
            return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_BaseAlt(items) : itemColor;
        }
    }
    function resolveBkgdColor_Grid_DataSuspectRowHeader(items: Item[]) {
        const itemColor = items[ItemId.Grid_DataSuspectRowHeader].bkgd;
        return itemColor === schemeInheritColor ? resolveBkgdColor_Grid_RowHeader(items) : itemColor;
    }
    function resolveForeColor_Grid_DataSuspectRowHeader(items: Item[]) {
        const itemColor = items[ItemId.Grid_DataSuspectRowHeader].fore;
        return itemColor === schemeInheritColor ? resolveForeColor_Grid_RowHeader(items) : itemColor;
    }
    function resolveBkgdColor_Grid_DataSuspectRowHeaderAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_DataSuspectRowHeaderAlt].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_DataSuspectRowHeader].bkgd;
            return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_RowHeaderAlt(items) : itemColor;
        }
    }
    function resolveForeColor_Grid_DataSuspectRowHeaderAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_DataSuspectRowHeaderAlt].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_DataSuspectRowHeader].fore;
            return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_RowHeaderAlt(items) : itemColor;
        }
    }
    function resolveBkgdColor_Grid_RowHeader(items: Item[]) {
        const itemColor = items[ItemId.Grid_RowHeader].bkgd;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_RowHeader(items: Item[]) {
        const itemColor = items[ItemId.Grid_RowHeader].fore;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_RowHeaderAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_RowHeaderAlt].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_RowHeader].bkgd;
            return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_BaseAlt(items) : itemColor;
        }
    }
    function resolveForeColor_Grid_RowHeaderAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_RowHeaderAlt].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_RowHeader].fore;
            return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_BaseAlt(items) : itemColor;
        }
    }
    function resolveBkgdColor_Grid_TopRowHeader(items: Item[]) {
        let itemColor = items[ItemId.Grid_TopRowHeader].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_RowHeader].bkgd;
            return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_TopBase(items) : itemColor;
        }
    }
    function resolveForeColor_Grid_TopRowHeader(items: Item[]) {
        let itemColor = items[ItemId.Grid_TopRowHeader].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_RowHeader].fore;
            return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_TopBase(items) : itemColor;
        }
    }
    function resolveForeColor_Grid_FocusedRowBorder(items: Item[]) {
        const itemColor = items[ItemId.Grid_FocusedRowBorder].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_FocusedCell(items: Item[]) {
        const itemColor = items[ItemId.Grid_FocusedCell].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_FocusedRow(items) : itemColor;
    }
    function resolveForeColor_Grid_FocusedCell(items: Item[]) {
        const itemColor = items[ItemId.Grid_FocusedCell].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_FocusedRow(items) : itemColor;
    }
    function resolveForeColor_Grid_FocusedCellBorder(items: Item[]) {
        const itemColor = items[ItemId.Grid_FocusedCellBorder].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_FocusedRowBorder(items) : itemColor;
    }
    function resolveBkgdColor_Grid_FocusedCellFlashedOn(items: Item[]) {
        let itemColor = items[ItemId.Grid_FocusedCellFlashedOn].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_FocusedRowFlashedOn].bkgd;
            if (itemColor !== schemeInheritColor) {
                return itemColor;
            } else {
                itemColor = items[ItemId.Grid_SelectedRowFlashedOn].bkgd;
                if (itemColor !== schemeInheritColor) {
                    return itemColor;
                } else {
                    itemColor = items[ItemId.Grid_BaseFlashedOn].bkgd;
                    return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_FocusedRow(items) : itemColor;
                }
            }
        }
    }
    function resolveForeColor_Grid_FocusedCellFlashedOn(items: Item[]) {
        let itemColor = items[ItemId.Grid_FocusedCellFlashedOn].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_FocusedRowFlashedOn].fore;
            if (itemColor !== schemeInheritColor) {
                return itemColor;
            } else {
                itemColor = items[ItemId.Grid_SelectedRowFlashedOn].fore;
                if (itemColor !== schemeInheritColor) {
                    return itemColor;
                } else {
                    itemColor = items[ItemId.Grid_BaseFlashedOn].fore;
                    return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_FocusedRow(items) : itemColor;
                }
            }
        }
    }
    function resolveBkgdColor_Grid_FocusedRow(items: Item[]) {
        const itemColor = items[ItemId.Grid_FocusedRow].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_SelectedRow(items) : itemColor;
    }
    function resolveForeColor_Grid_FocusedRow(items: Item[]) {
        const itemColor = items[ItemId.Grid_FocusedRow].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_SelectedRow(items) : itemColor;
    }
    function resolveBkgdColor_Grid_FocusedRowFlashedOn(items: Item[]) {
        let itemColor = items[ItemId.Grid_FocusedRowFlashedOn].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_SelectedRowFlashedOn].bkgd;
            if (itemColor !== schemeInheritColor) {
                return itemColor;
            } else {
                itemColor = items[ItemId.Grid_BaseFlashedOn].bkgd;
                return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_FocusedRow(items) : itemColor;
            }
        }
    }
    function resolveForeColor_Grid_FocusedRowFlashedOn(items: Item[]) {
        let itemColor = items[ItemId.Grid_FocusedRowFlashedOn].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_SelectedRowFlashedOn].fore;
            if (itemColor !== schemeInheritColor) {
                return itemColor;
            } else {
                itemColor = items[ItemId.Grid_BaseFlashedOn].fore;
                return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_FocusedRow(items) : itemColor;
            }
        }
    }
    function resolveBkgdColor_Grid_FocusedRowHeader(items: Item[]) {
        let itemColor = items[ItemId.Grid_FocusedRowHeader].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_RowHeader].bkgd;
            return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_FocusedRow(items) : itemColor;
        }
    }
    function resolveForeColor_Grid_FocusedRowHeader(items: Item[]) {
        let itemColor = items[ItemId.Grid_FocusedRowHeader].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_RowHeader].fore;
            return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_FocusedRow(items) : itemColor;
        }
    }
    function resolveBkgdColor_Grid_FocusedTopRowHeader(items: Item[]) {
        const itemColor = items[ItemId.Grid_FocusedTopRowHeader].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_FocusedRowHeader(items) : itemColor;
    }
    function resolveForeColor_Grid_FocusedTopRowHeader(items: Item[]) {
        const itemColor = items[ItemId.Grid_FocusedTopRowHeader].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_FocusedRowHeader(items) : itemColor;
    }
    function resolveBkgdColor_Grid_SelectedRow(items: Item[]) {
        const itemColor = items[ItemId.Grid_SelectedRow].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_SelectedRow(items: Item[]) {
        const itemColor = items[ItemId.Grid_SelectedRow].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_SelectedRowHeader(items: Item[]) {
        let itemColor = items[ItemId.Grid_SelectedRowHeader].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_RowHeader].bkgd;
            return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_SelectedRow(items) : itemColor;
        }
    }
    function resolveForeColor_Grid_SelectedRowHeader(items: Item[]) {
        let itemColor = items[ItemId.Grid_SelectedRowHeader].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_RowHeader].fore;
            return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_SelectedRow(items) : itemColor;
        }
    }
    function resolveBkgdColor_Grid_SelectedRowFlashedOn(items: Item[]) {
        const itemColor = items[ItemId.Grid_SelectedRowFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_BaseFlashedOn(items) : itemColor;
    }
    function resolveForeColor_Grid_SelectedRowFlashedOn(items: Item[]) {
        const itemColor = items[ItemId.Grid_SelectedRowFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_BaseFlashedOn(items) : itemColor;
    }
    function resolveBkgdColor_Grid_TopBase(items: Item[]) {
        const itemColor = items[ItemId.Grid_TopBase].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_TopBase(items: Item[]) {
        const itemColor = items[ItemId.Grid_TopBase].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_Cancelled(items: Item[]) {
        const itemColor = items[ItemId.Grid_Cancelled].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_Cancelled(items: Item[]) {
        const itemColor = items[ItemId.Grid_Cancelled].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_RowRecentlyAddedBorder(items: Item[]) {
        const itemColor = items[ItemId.Grid_RowRecentlyAddedBorder].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_HorizontalLine(items) : itemColor;
    }
    function resolveForeColor_Grid_RowRecordRecentlyChangedBorder(items: Item[]) {
        const itemColor = items[ItemId.Grid_RowRecordRecentlyChangedBorder].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_ValueRecentlyModifiedBorder(items: Item[]) {
        const itemColor = items[ItemId.Grid_ValueRecentlyModifiedBorder].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_ValueRecentlyModifiedUpBorder(items: Item[]) {
        const itemColor = items[ItemId.Grid_ValueRecentlyModifiedUpBorder].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_ValueRecentlyModifiedBorder(items) : itemColor;
    }
    function resolveForeColor_Grid_ValueRecentlyModifiedDownBorder(items: Item[]) {
        const itemColor = items[ItemId.Grid_ValueRecentlyModifiedDownBorder].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_ValueRecentlyModifiedBorder(items) : itemColor;
    }
    function resolveBkgdColor_Grid_UpValue(items: Item[]) {
        const itemColor = items[ItemId.Grid_UpValue].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_UpValue(items: Item[]) {
        const itemColor = items[ItemId.Grid_UpValue].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_DownValue(items: Item[]) {
        const itemColor = items[ItemId.Grid_DownValue].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_DownValue(items: Item[]) {
        const itemColor = items[ItemId.Grid_DownValue].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_Sensitive(items: Item[]) {
        const itemColor = items[ItemId.Grid_Sensitive].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_Sensitive(items: Item[]) {
        const itemColor = items[ItemId.Grid_Sensitive].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_SensitiveAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_SensitiveAlt].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_Sensitive].bkgd;
            return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_BaseAlt(items) : itemColor;
        }
    }
    function resolveForeColor_Grid_SensitiveAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_SensitiveAlt].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_Sensitive].fore;
            return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_BaseAlt(items) : itemColor;
        }
    }
    function resolveBkgdColor_Grid_TopSensitive(items: Item[]) {
        let itemColor = items[ItemId.Grid_TopSensitive].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_Sensitive].bkgd;
            return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_TopBase(items) : itemColor;
        }
    }
    function resolveForeColor_Grid_TopSensitive(items: Item[]) {
        let itemColor = items[ItemId.Grid_TopSensitive].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_Sensitive].fore;
            return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_TopBase(items) : itemColor;
        }
    }
    function resolveBkgdColor_Grid_NewsIncoming(items: Item[]) {
        const itemColor = items[ItemId.Grid_NewsIncoming].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_NewsIncoming(items: Item[]) {
        const itemColor = items[ItemId.Grid_NewsIncoming].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_NewsIncomingAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_NewsIncomingAlt].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_NewsIncoming].bkgd;
            return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
        }
    }
    function resolveForeColor_Grid_NewsIncomingAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_NewsIncomingAlt].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_NewsIncoming].fore;
            return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
        }
    }
    function resolveBkgdColor_Grid_NewsHeadlineOnly(items: Item[]) {
        const itemColor = items[ItemId.Grid_NewsHeadlineOnly].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_NewsHeadlineOnly(items: Item[]) {
        const itemColor = items[ItemId.Grid_NewsHeadlineOnly].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_NewsHeadlineOnlyAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_NewsHeadlineOnlyAlt].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_NewsHeadlineOnly].bkgd;
            return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
        }
    }
    function resolveForeColor_Grid_NewsHeadlineOnlyAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_NewsHeadlineOnlyAlt].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_NewsHeadlineOnly].fore;
            return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
        }
    }
    function resolveBkgdColor_Grid_OrderBuy(items: Item[]) {
        const itemColor = items[ItemId.Grid_OrderBuy].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_OrderBuy(items: Item[]) {
        const itemColor = items[ItemId.Grid_OrderBuy].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_OrderBuyAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_OrderBuyAlt].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_OrderBuy].bkgd;
            return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_BaseAlt(items) : itemColor;
        }
    }
    function resolveForeColor_Grid_OrderBuyAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_OrderBuyAlt].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_OrderBuy].fore;
            return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_BaseAlt(items) : itemColor;
        }
    }
    function resolveBkgdColor_Grid_PriceBuy(items: Item[]) {
        const itemColor = items[ItemId.Grid_PriceBuy].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_PriceBuy(items: Item[]) {
        const itemColor = items[ItemId.Grid_PriceBuy].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_PriceBuyAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_PriceBuyAlt].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_PriceBuy].bkgd;
            return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_BaseAlt(items) : itemColor;
        }
    }
    function resolveForeColor_Grid_PriceBuyAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_PriceBuyAlt].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_PriceBuy].fore;
            return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_BaseAlt(items) : itemColor;
        }
    }
    function resolveBkgdColor_Grid_OrderSell(items: Item[]) {
        const itemColor = items[ItemId.Grid_OrderSell].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_OrderSell(items: Item[]) {
        const itemColor = items[ItemId.Grid_OrderSell].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_OrderSellAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_OrderSellAlt].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_OrderSell].bkgd;
            return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_BaseAlt(items) : itemColor;
        }
    }
    function resolveForeColor_Grid_OrderSellAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_OrderSellAlt].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_OrderSell].fore;
            return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_BaseAlt(items) : itemColor;
        }
    }
    function resolveBkgdColor_Grid_PriceSell(items: Item[]) {
        const itemColor = items[ItemId.Grid_PriceSell].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_PriceSell(items: Item[]) {
        const itemColor = items[ItemId.Grid_PriceSell].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_PriceSellAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_PriceSellAlt].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_PriceSell].bkgd;
            return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_BaseAlt(items) : itemColor;
        }
    }
    function resolveForeColor_Grid_PriceSellAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_PriceSellAlt].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_PriceSell].fore;
            return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_BaseAlt(items) : itemColor;
        }
    }
    function resolveBkgdColor_Grid_PriceSellOverlap(items: Item[]) {
        const itemColor = items[ItemId.Grid_PriceSellOverlap].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_PriceSellOverlap(items: Item[]) {
        const itemColor = items[ItemId.Grid_PriceSellOverlap].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_PriceSellOverlapAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_PriceSellOverlapAlt].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_PriceSellOverlap].bkgd;
            return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_PriceSellAlt(items) : itemColor;
        }
    }
    function resolveForeColor_Grid_PriceSellOverlapAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_PriceSellOverlapAlt].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_PriceSellOverlap].fore;
            return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_PriceSellAlt(items) : itemColor;
        }
    }
    function resolveBkgdColor_Grid_MyOrder(items: Item[]) {
        const itemColor = items[ItemId.Grid_MyOrder].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_MyOrder(items: Item[]) {
        const itemColor = items[ItemId.Grid_MyOrder].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_MyOrderAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_MyOrderAlt].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_MyOrder].bkgd;
            return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
        }
    }
    function resolveForeColor_Grid_MyOrderAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_MyOrderAlt].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_MyOrder].fore;
            return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
        }
    }
    function resolveBkgdColor_Grid_PriceHasMyOrder(items: Item[]) {
        const itemColor = items[ItemId.Grid_PriceHasMyOrder].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_PriceHasMyOrder(items: Item[]) {
        const itemColor = items[ItemId.Grid_PriceHasMyOrder].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_PriceHasMyOrderAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_PriceHasMyOrderAlt].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_PriceHasMyOrder].bkgd;
            return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
        }
    }
    function resolveForeColor_Grid_PriceHasMyOrderAlt(items: Item[]) {
        let itemColor = items[ItemId.Grid_PriceHasMyOrderAlt].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            itemColor = items[ItemId.Grid_PriceHasMyOrder].fore;
            return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
        }
    }
    function resolveBkgdColor_Grid_Expanded(items: Item[]) {
        const itemColor = items[ItemId.Grid_Expanded].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_Unacknowledged(items: Item[]) {
        const itemColor = items[ItemId.Grid_Unacknowledged].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_Unacknowledged(items: Item[]) {
        const itemColor = items[ItemId.Grid_Unacknowledged].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_Fired(items: Item[]) {
        const itemColor = items[ItemId.Grid_Fired].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_Fired(items: Item[]) {
        const itemColor = items[ItemId.Grid_Fired].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_GreyedOut(items: Item[]) {
        const itemColor = items[ItemId.Grid_GreyedOut].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_Scrollbar(items: Item[]) {
        const itemColor = items[ItemId.Grid_Scrollbar].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
    function resolveForeColor_Grid_Scrollbar(items: Item[]) {
        const itemColor = items[ItemId.Grid_Scrollbar].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Grid_Base(items) : itemColor;
    }
    function resolveBkgdColor_Grid_ScrollbarThumbShadow(items: Item[]) {
        const itemColor = items[ItemId.Grid_ScrollbarThumbShadow].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Grid_Base(items) : itemColor;
    }
/*    function resolveBkgdColor_Alert_Disabled(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_Disabled].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_Disabled(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_Disabled].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_DisabledAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_DisabledAltRow].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_DisabledAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_DisabledAltRow].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_Invalid(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_Invalid].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_Invalid(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_Invalid].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_InvalidAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_InvalidAltRow].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_InvalidAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_InvalidAltRow].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_InvalidFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_InvalidFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_InvalidFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_InvalidFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_InvalidAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_InvalidAltRowFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_InvalidAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_InvalidAltRowFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_Valid(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_Valid].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_Valid(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_Valid].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_ValidAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ValidAltRow].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_ValidAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ValidAltRow].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_ValidFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ValidFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_ValidFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ValidFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_ValidAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ValidAltRowFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_ValidAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ValidAltRowFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_Expired(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_Expired].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_Expired(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_Expired].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_ExpiredAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ExpiredAltRow].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_ExpiredAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ExpiredAltRow].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_ExpiredFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ExpiredFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_ExpiredFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ExpiredFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_ExpiredAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ExpiredAltRowFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_ExpiredAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ExpiredAltRowFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_Error(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_Error].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_Error(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_Error].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_ErrorAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_ErrorAltRow].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_ErrorAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_ErrorAltRow].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_ErrorFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ErrorFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_ErrorFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ErrorFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_ErrorAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ErrorAltRowFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_ErrorAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ErrorAltRowFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_Offline(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_Offline].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_Offline(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_Offline].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_OfflineAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_OfflineAltRow].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_OfflineAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_OfflineAltRow].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_OfflineFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_OfflineFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_OfflineFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_OfflineFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_OfflineAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_OfflineAltRowFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_OfflineAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_OfflineAltRowFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_Armed(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_Armed].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_Armed(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_Armed].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_ArmedAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ArmedAltRow].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_ArmedAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ArmedAltRow].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_ArmedFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ArmedFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_ArmedFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ArmedFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_ArmedAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ArmedAltRowFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_ArmedAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_ArmedAltRowFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_Fired(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_Fired].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_Fired(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_Fired].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_FiredAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_FiredAltRow].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_FiredAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_FiredAltRow].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_FiredFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_FiredFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_FiredFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_FiredFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alert_FiredAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_FiredAltRowFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alert_FiredAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alert_FiredAltRowFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_Info(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_Info].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_Info(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_Info].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_InfoAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_InfoAltRow].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_InfoAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_InfoAltRow].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_InfoFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_InfoFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_InfoFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_InfoFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_InfoAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_InfoAltRowFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_InfoAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_InfoAltRowFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_Warning(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_Warning].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_Warning(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_Warning].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_WarningAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_WarningAltRow].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_WarningAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_WarningAltRow].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_WarningFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_WarningFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_WarningFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_WarningFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_WarningAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_WarningAltRowFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_WarningAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_WarningAltRowFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_Low(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_Low].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_Low(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_Low].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_LowAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_LowAltRow].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_LowAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_LowAltRow].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_LowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_LowFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_LowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_LowFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_LowAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_LowAltRowFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_LowAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_LowAltRowFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_Normal(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_Normal].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_Normal(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_Normal].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_NormalAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_NormalAltRow].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_NormalAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_NormalAltRow].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_NormalFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_NormalFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_NormalFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_NormalFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_NormalAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_NormalAltRowFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_NormalAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_NormalAltRowFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_High(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_High].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_High(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_High].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_HighAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_HighAltRow].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_HighAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_HighAltRow].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_HighFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_HighFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_HighFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_HighFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_HighAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_HighAltRowFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_HighAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_HighAltRowFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_Urgent(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_Urgent].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_Urgent(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_Urgent].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_UrgentAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_UrgentAltRow].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_UrgentAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_UrgentAltRow].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_UrgentFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_UrgentFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_UrgentFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_UrgentFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_UrgentAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_UrgentAltRowFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_UrgentAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_UrgentAltRowFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_Error(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_Error].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_Error(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_Error].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_ErrorAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_ErrorAltRow].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_ErrorAltRow(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_ErrorAltRow].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_ErrorFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_ErrorFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_ErrorFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_ErrorFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Alarm_ErrorAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_ErrorAltRowFlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Alarm_ErrorAltRowFlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Alarm_ErrorAltRowFlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_TitleBarButton(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.TitleBarButton].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_TitleBarButton(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.TitleBarButton].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_AlertsTitleBarButton(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.AlertsTitleBarButton].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_AlertsTitleBarButton(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.AlertsTitleBarButton].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_AlertsTitleBarButton_FlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.AlertsTitleBarButton_FlashedOn].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_AlertsTitleBarButton_FlashedOn(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.AlertsTitleBarButton_FlashedOn].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_TextDisplay(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.TextDisplay].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_TextDisplay(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.TextDisplay].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_TextDisplay_Disabled(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.TextDisplay_Disabled].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_TextDisplay_Disabled(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.TextDisplay_Disabled].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_TextDisplay_Waiting(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.TextDisplay_Waiting].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_TextDisplay_Waiting(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.TextDisplay_Waiting].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_TextDisplay_Info(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.TextDisplay_Info].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_TextDisplay_Info(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.TextDisplay_Info].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_TextDisplay_Warning(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.TextDisplay_Warning].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_TextDisplay_Warning(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.TextDisplay_Warning].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_TextDisplay_Error(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.TextDisplay_Error].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_TextDisplay_Error(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.TextDisplay_Error].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_TextDisplay_Danger(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.TextDisplay_Danger].bkgd;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            return resolveBkgdColor_TextDisplay_Error(items);
        }
    }
    function resolveForeColor_TextDisplay_Danger(items: Item[]) {
        const itemColor = items[ItemId.TextDisplay_Danger].fore;
        if (itemColor !== schemeInheritColor) {
            return itemColor;
        } else {
            return resolveForeColor_TextDisplay_Error(items);
        }
    }*/
    function resolveBkgdColor_TextControl(items: Item[]) {
        const itemColor = items[ItemId.TextControl].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Panel(items) : itemColor;
    }
    function resolveForeColor_TextControl(items: Item[]) {
        const itemColor = items[ItemId.TextControl].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Panel(items) : itemColor;
    }
    function resolveBkgdColor_TextControl_Disabled(items: Item[]) {
        const itemColor = items[ItemId.TextControl_Disabled].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_TextControl(items) : itemColor;
    }
    function resolveForeColor_TextControl_Disabled(items: Item[]) {
        const itemColor = items[ItemId.TextControl_Disabled].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_TextControl(items) : itemColor;
    }
    function resolveBkgdColor_TextControl_ReadOnly(items: Item[]) {
        const itemColor = items[ItemId.TextControl_ReadOnly].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_TextControl(items) : itemColor;
    }
    function resolveForeColor_TextControl_ReadOnly(items: Item[]) {
        const itemColor = items[ItemId.TextControl_ReadOnly].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_TextControl(items) : itemColor;
    }
    function resolveBkgdColor_TextControl_Missing(items: Item[]) {
        const itemColor = items[ItemId.TextControl_Missing].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_TextControl(items) : itemColor;
    }
    function resolveForeColor_TextControl_Missing(items: Item[]) {
        const itemColor = items[ItemId.TextControl_Missing].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_TextControl(items) : itemColor;
    }
    function resolveBkgdColor_TextControl_Invalid(items: Item[]) {
        const itemColor = items[ItemId.TextControl_Invalid].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_TextControl(items) : itemColor;
    }
    function resolveForeColor_TextControl_Invalid(items: Item[]) {
        const itemColor = items[ItemId.TextControl_Invalid].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_TextControl(items) : itemColor;
    }
    function resolveBkgdColor_TextControl_Valid(items: Item[]) {
        const itemColor = items[ItemId.TextControl_Valid].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_TextControl(items) : itemColor;
    }
    function resolveForeColor_TextControl_Valid(items: Item[]) {
        const itemColor = items[ItemId.TextControl_Valid].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_TextControl(items) : itemColor;
    }
    function resolveBkgdColor_TextControl_Accepted(items: Item[]) {
        const itemColor = items[ItemId.TextControl_Accepted].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_TextControl(items) : itemColor;
    }
    function resolveForeColor_TextControl_Accepted(items: Item[]) {
        const itemColor = items[ItemId.TextControl_Accepted].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_TextControl(items) : itemColor;
    }
    function resolveBkgdColor_TextControl_Waiting(items: Item[]) {
        const itemColor = items[ItemId.TextControl_Waiting].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_TextControl(items) : itemColor;
    }
    function resolveForeColor_TextControl_Waiting(items: Item[]) {
        const itemColor = items[ItemId.TextControl_Waiting].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_TextControl(items) : itemColor;
    }
    function resolveBkgdColor_TextControl_Warning(items: Item[]) {
        const itemColor = items[ItemId.TextControl_Warning].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_TextControl(items) : itemColor;
    }
    function resolveForeColor_TextControl_Warning(items: Item[]) {
        const itemColor = items[ItemId.TextControl_Warning].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_TextControl(items) : itemColor;
    }
    function resolveBkgdColor_TextControl_Error(items: Item[]) {
        const itemColor = items[ItemId.TextControl_Error].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_TextControl(items) : itemColor;
    }
    function resolveForeColor_TextControl_Error(items: Item[]) {
        const itemColor = items[ItemId.TextControl_Error].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_TextControl(items) : itemColor;
    }

    function resolveBkgdColor_TextControl_Highlight(items: Item[]) {
        const itemColor = items[ItemId.TextControl_Highlight].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_TextControl(items) : itemColor;
    }
    function resolveForeColor_TextControl_Highlight(items: Item[]) {
        const itemColor = items[ItemId.TextControl_Highlight].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_TextControl(items) : itemColor;
    }
    function resolveBkgdColor_TextControl_Selected(items: Item[]) {
        const itemColor = items[ItemId.TextControl_Selected].bkgd;
        return (itemColor === schemeInheritColor) ? resolveForeColor_TextControl(items) : itemColor;
    }
    function resolveForeColor_TextControl_Selected(items: Item[]) {
        const itemColor = items[ItemId.TextControl_Selected].fore;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_TextControl(items) : itemColor;
    }

    function resolveBkgdColor_ClickControl(items: Item[]) {
        const itemColor = items[ItemId.ClickControl].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Panel(items) : itemColor;
    }
    function resolveForeColor_ClickControl(items: Item[]) {
        const itemColor = items[ItemId.ClickControl].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Panel(items) : itemColor;
    }
    function resolveBkgdColor_ClickControl_Disabled(items: Item[]) {
        const itemColor = items[ItemId.ClickControl_Disabled].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_ClickControl(items) : itemColor;
    }
    function resolveForeColor_ClickControl_Disabled(items: Item[]) {
        const itemColor = items[ItemId.ClickControl_Disabled].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_ClickControl(items) : itemColor;
    }
    function resolveBkgdColor_ClickControl_ReadOnly(items: Item[]) {
        const itemColor = items[ItemId.ClickControl_ReadOnly].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_ClickControl(items) : itemColor;
    }
    function resolveForeColor_ClickControl_ReadOnly(items: Item[]) {
        const itemColor = items[ItemId.ClickControl_ReadOnly].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_ClickControl(items) : itemColor;
    }
    function resolveBkgdColor_ClickControl_Missing(items: Item[]) {
        const itemColor = items[ItemId.ClickControl_Missing].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_ClickControl(items) : itemColor;
    }
    function resolveForeColor_ClickControl_Missing(items: Item[]) {
        const itemColor = items[ItemId.ClickControl_Missing].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_ClickControl(items) : itemColor;
    }
    function resolveBkgdColor_ClickControl_Invalid(items: Item[]) {
        const itemColor = items[ItemId.ClickControl_Invalid].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_ClickControl(items) : itemColor;
    }
    function resolveForeColor_ClickControl_Invalid(items: Item[]) {
        const itemColor = items[ItemId.ClickControl_Invalid].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_ClickControl(items) : itemColor;
    }
    function resolveBkgdColor_ClickControl_Valid(items: Item[]) {
        const itemColor = items[ItemId.ClickControl_Valid].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_ClickControl(items) : itemColor;
    }
    function resolveForeColor_ClickControl_Valid(items: Item[]) {
        const itemColor = items[ItemId.ClickControl_Valid].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_ClickControl(items) : itemColor;
    }
    function resolveBkgdColor_ClickControl_Accepted(items: Item[]) {
        const itemColor = items[ItemId.ClickControl_Accepted].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_ClickControl(items) : itemColor;
    }
    function resolveForeColor_ClickControl_Accepted(items: Item[]) {
        const itemColor = items[ItemId.ClickControl_Accepted].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_ClickControl(items) : itemColor;
    }
    function resolveBkgdColor_ClickControl_Waiting(items: Item[]) {
        const itemColor = items[ItemId.ClickControl_Waiting].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_ClickControl(items) : itemColor;
    }
    function resolveForeColor_ClickControl_Waiting(items: Item[]) {
        const itemColor = items[ItemId.ClickControl_Waiting].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_ClickControl(items) : itemColor;
    }
    function resolveBkgdColor_ClickControl_Warning(items: Item[]) {
        const itemColor = items[ItemId.ClickControl_Warning].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_ClickControl(items) : itemColor;
    }
    function resolveForeColor_ClickControl_Warning(items: Item[]) {
        const itemColor = items[ItemId.ClickControl_Warning].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_ClickControl(items) : itemColor;
    }
    function resolveBkgdColor_ClickControl_Error(items: Item[]) {
        const itemColor = items[ItemId.ClickControl_Error].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_ClickControl(items) : itemColor;
    }
    function resolveForeColor_ClickControl_Error(items: Item[]) {
        const itemColor = items[ItemId.ClickControl_Error].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_ClickControl(items) : itemColor;
    }

    function resolveBkgdColor_Label(items: Item[]) {
        const itemColor = items[ItemId.Label].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Panel(items) : itemColor;
    }
    function resolveForeColor_Label(items: Item[]) {
        const itemColor = items[ItemId.Label].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Panel(items) : itemColor;
    }
    function resolveBkgdColor_Label_Disabled(items: Item[]) {
        const itemColor = items[ItemId.Label_Disabled].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Label(items) : itemColor;
    }
    function resolveForeColor_Label_Disabled(items: Item[]) {
        const itemColor = items[ItemId.Label_Disabled].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Label(items) : itemColor;
    }
    function resolveBkgdColor_Label_ReadOnly(items: Item[]) {
        const itemColor = items[ItemId.Label_ReadOnly].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Label(items) : itemColor;
    }
    function resolveForeColor_Label_ReadOnly(items: Item[]) {
        const itemColor = items[ItemId.Label_ReadOnly].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Label(items) : itemColor;
    }
    function resolveBkgdColor_Label_Missing(items: Item[]) {
        const itemColor = items[ItemId.Label_Missing].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Label(items) : itemColor;
    }
    function resolveForeColor_Label_Missing(items: Item[]) {
        const itemColor = items[ItemId.Label_Missing].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Label(items) : itemColor;
    }
    function resolveBkgdColor_Label_Invalid(items: Item[]) {
        const itemColor = items[ItemId.Label_Invalid].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Label(items) : itemColor;
    }
    function resolveForeColor_Label_Invalid(items: Item[]) {
        const itemColor = items[ItemId.Label_Invalid].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Label(items) : itemColor;
    }
    function resolveBkgdColor_Label_Valid(items: Item[]) {
        const itemColor = items[ItemId.Label_Valid].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Label(items) : itemColor;
    }
    function resolveForeColor_Label_Valid(items: Item[]) {
        const itemColor = items[ItemId.Label_Valid].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Label(items) : itemColor;
    }
    function resolveBkgdColor_Label_Accepted(items: Item[]) {
        const itemColor = items[ItemId.Label_Accepted].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Label(items) : itemColor;
    }
    function resolveForeColor_Label_Accepted(items: Item[]) {
        const itemColor = items[ItemId.Label_Accepted].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Label(items) : itemColor;
    }
    function resolveBkgdColor_Label_Waiting(items: Item[]) {
        const itemColor = items[ItemId.Label_Waiting].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Label(items) : itemColor;
    }
    function resolveForeColor_Label_Waiting(items: Item[]) {
        const itemColor = items[ItemId.Label_Waiting].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Label(items) : itemColor;
    }
    function resolveBkgdColor_Label_Warning(items: Item[]) {
        const itemColor = items[ItemId.Label_Warning].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Label(items) : itemColor;
    }
    function resolveForeColor_Label_Warning(items: Item[]) {
        const itemColor = items[ItemId.Label_Warning].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Label(items) : itemColor;
    }
    function resolveBkgdColor_Label_Error(items: Item[]) {
        const itemColor = items[ItemId.Label_Error].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Label(items) : itemColor;
    }
    function resolveForeColor_Label_Error(items: Item[]) {
        const itemColor = items[ItemId.Label_Error].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Label(items) : itemColor;
    }

    function resolveBkgdColor_Caution(items: Item[]) {
        const itemColor = items[ItemId.Caution].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Panel(items) : itemColor;
    }
    function resolveForeColor_Caution(items: Item[]) {
        const itemColor = items[ItemId.Caution].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Panel(items) : itemColor;
    }
    function resolveBkgdColor_Caution_UsableButNotGood(items: Item[]) {
        const itemColor = items[ItemId.Caution_UsableButNotGood].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Caution(items) : itemColor;
    }
    function resolveForeColor_Caution_UsableButNotGood(items: Item[]) {
        const itemColor = items[ItemId.Caution_UsableButNotGood].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Caution(items) : itemColor;
    }
    function resolveBkgdColor_Caution_Suspect(items: Item[]) {
        const itemColor = items[ItemId.Caution_Suspect].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Caution(items) : itemColor;
    }
    function resolveForeColor_Caution_Suspect(items: Item[]) {
        const itemColor = items[ItemId.Caution_Suspect].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Caution(items) : itemColor;
    }
    function resolveBkgdColor_Caution_Error(items: Item[]) {
        const itemColor = items[ItemId.Caution_Error].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Caution(items) : itemColor;
    }
    function resolveForeColor_Caution_Error(items: Item[]) {
        const itemColor = items[ItemId.Caution_Error].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Caution(items) : itemColor;
    }

    function resolveBkgdColor_Text_ControlBorder(items: Item[]) {
        const itemColor = items[ItemId.Text_ControlBorder].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Panel(items) : itemColor;
    }
    function resolveForeColor_Text_ControlBorder(items: Item[]) {
        const itemColor = items[ItemId.Text_ControlBorder].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Panel(items) : itemColor;
    }
    function resolveBkgdColor_Text_ReadonlyMultiline(items: Item[]) {
        const itemColor = items[ItemId.Text_ReadonlyMultiline].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_TextControl(items) : itemColor;
    }
    function resolveForeColor_Text_ReadonlyMultiline(items: Item[]) {
        const itemColor = items[ItemId.Text_ReadonlyMultiline].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_TextControl(items) : itemColor;
    }
    function resolveBkgdColor_Text_GreyedOut(items: Item[]) {
        const itemColor = items[ItemId.Text_GreyedOut].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_TextControl(items) : itemColor;
    }
    function resolveForeColor_Text_GreyedOut(items: Item[]) {
        const itemColor = items[ItemId.Text_GreyedOut].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_TextControl(items) : itemColor;
    }

    function resolveBkgdColor_IconButton(items: Item[]) {
        const itemColor = items[ItemId.IconButton].bkgd;
        return (itemColor === schemeInheritColor) ? resolveForeColor_TextControl(items) : itemColor;
    }
    function resolveForeColor_IconButton(items: Item[]) {
        const itemColor = items[ItemId.IconButton].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_TextControl(items) : itemColor;
    }
    function resolveForeColor_IconButton_SelectedBorder(items: Item[]) {
        const itemColor = items[ItemId.IconButton_SelectedBorder].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Panel(items) : itemColor;
    }
    function resolveBkgdColor_IconButton_Hover(items: Item[]) {
        const itemColor = items[ItemId.IconButton_Hover].fore;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Panel(items) : itemColor;
    }
/*    function resolveBkgdColor_OrderPad_Side_Buy(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.OrderPad_Side_Buy].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_OrderPad_Side_Sell(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.OrderPad_Side_Sell].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_OrderPad_Side_Empty(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.OrderPad_Side_Empty].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_OrderPad_Side_Unknown(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.OrderPad_Side_Unknown].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_PopupLookup_Id(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.PopupLookup_Id].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_PopupLookup_Id(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.PopupLookup_Id].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_PopupLookup_IdAlt(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.PopupLookup_IdAlt].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_PopupLookup_IdAlt(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.PopupLookup_IdAlt].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_PopupLookup_IdFocused(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.PopupLookup_IdFocused].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_PopupLookup_IdFocused(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.PopupLookup_IdFocused].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_PopupLookup_Description(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.PopupLookup_Description].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_PopupLookup_Description(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.PopupLookup_Description].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_PopupLookup_DescriptionAlt(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.PopupLookup_DescriptionAlt].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_PopupLookup_DescriptionAlt(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.PopupLookup_DescriptionAlt].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_PopupLookup_DescriptionFocused(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.PopupLookup_DescriptionFocused].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_PopupLookup_DescriptionFocused(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.PopupLookup_DescriptionFocused].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_DragImageText(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.DragImageText].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_DragImageText(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.DragImageText].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_WaitingPanel(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.WaitingPanel].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_WaitingPanel(items: Item[]) {
        const itemColor = items[ItemId.WaitingPanel].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_WaitingBar(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.WaitingBar].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveBkgdColor_Highlight(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Highlight].bkgd;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }
    function resolveForeColor_Highlight(items: Item[]) {
        // TODO:MED Backup colors may be needed.
        const itemColor = items[ItemId.Highlight].fore;
        return (itemColor === schemeInheritColor) ? '' : itemColor;
    }*/
    function resolveBkgdColor_Panel(items: Item[]) {
        const itemColor = items[ItemId.Panel].bkgd;
        return (itemColor === schemeInheritColor) ? cssInheritColor : itemColor;
    }
    function resolveForeColor_Panel(items: Item[]) {
        const itemColor = items[ItemId.Panel].fore;
        return (itemColor === schemeInheritColor) ? cssInheritColor : itemColor;
    }
    function resolveBkgdColor_Panel_Hoisted(items: Item[]) {
        const itemColor = items[ItemId.Panel_Hoisted].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Panel(items) : itemColor;
    }
    function resolveForeColor_Panel_Hoisted(items: Item[]) {
        const itemColor = items[ItemId.Panel_Hoisted].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Panel(items) : itemColor;
    }
    function resolveBkgdColor_Panel_Divider(items: Item[]) {
        const itemColor = items[ItemId.Panel_Divider].bkgd;
        return (itemColor === schemeInheritColor) ? cssInheritColor : itemColor;
    }
    function resolveForeColor_Panel_Divider(items: Item[]) {
        const itemColor = items[ItemId.Panel_Divider].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Panel(items) : itemColor;
    }
    function resolveBkgdColor_Panel_Splitter(items: Item[]) {
        const itemColor = items[ItemId.Panel_Splitter].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Panel_Divider(items) : itemColor;
    }
    function resolveForeColor_Panel_Splitter(items: Item[]) {
        const itemColor = items[ItemId.Panel_Splitter].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Panel_Divider(items) : itemColor;
    }
    function resolveBkgdColor_Panel_ItemHover(items: Item[]) {
        const itemColor = items[ItemId.Panel_ItemHover].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Panel(items) : itemColor;
    }
    export function resolveBkgdColor_Unexpected(items: Item[]) {
        const itemColor = items[ItemId.Unexpected].bkgd;
        return (itemColor === schemeInheritColor) ? resolveBkgdColor_Panel(items) : itemColor;
    }
    export function resolveForeColor_Unexpected(items: Item[]) {
        const itemColor = items[ItemId.Unexpected].fore;
        return (itemColor === schemeInheritColor) ? resolveForeColor_Panel(items) : itemColor;
    }
}

export namespace ColorSchemeModule {
    export function initialiseStatic() {
        ColorScheme.Item.initialise();
    }
}
