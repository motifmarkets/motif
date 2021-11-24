/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EnumInfoOutOfOrderError, Integer, UnreachableCaseError } from 'sys-internal-api';
import { ColorScheme } from './color-scheme';

export namespace ColorSchemePreset {
    export const enum Id {
        Light,
        Dark
    }

    export function createColorSchemeById(id: Id) {
        switch (id) {
            case Id.Light: return Pastel.createColorScheme();
            case Id.Dark: return Dark.createColorScheme();
            default: throw new UnreachableCaseError('CSPCCS19984', id);
        }
    }

    export function createColorSchemeByName(name: string) {
        switch (name) {
            case Pastel.name: return Pastel.createColorScheme();
            case Dark.name: return Dark.createColorScheme();
            default: return undefined;
        }
    }

    const NoneColor = ColorScheme.schemeInheritColor;
    const inherit = ColorScheme.schemeInheritColor;
    const transparent = ColorScheme.cssTransparentColor;
    const WhiteColor = 'White';
    const BlackColor = 'Black';
    const BlueColor = 'Blue';
    const LtGrayColor = 'LightGray';
    const MedGrayColor = 'DimGray';
    const DkGrayColor = 'DarkGray';
    const YellowColor = 'Yellow';
    const lightYellow = 'lightyellow';
    const GreenColor = 'Green';
    const RedColor = 'Red';
    const NavyColor = 'Navy';
    const MaroonColor = 'Maroon';
    const SkyBlueColor = 'SkyBlue';
    const CreamColor = 'MintCream';
    const WebIndianRedColor = 'IndianRed';
    const orange = 'orange';

    const GrayTextColor = 'Gray';
    const BtnFaceColor = 'LightGray';
    const WindowColor = 'White';
    const WindowTextColor = 'Black';
    const HighlightColor = 'Gold';
    const HotLightColor = 'Gold';

    type ItemsObject = { [id in keyof typeof ColorScheme.ItemId]: ColorScheme.Item };

    namespace Pastel {
        export const name = 'Default Light';

        const PastelDefaultBkgd = WhiteColor;
        const PastelDefaultAltRowBkgd = '#FDFFFA';
        const PastelDefaultFlashedOnBkgd = '#FBFCFF';
        const PastelDefaultAltRowFlashedOnBkgd = '#F8F8FF';
        const PastelDefaultFore = BlackColor;
        const PastelDefaultAltRowFore = BlackColor;
        const PastelDefaultFlashedOnFore = BlackColor;
        const PastelDefaultAltRowFlashedOnFore = BlackColor;

        const itemsObject: ItemsObject = {
            /* eslint-disable max-len */
            Layout_Base: { id: ColorScheme.ItemId.Layout_Base, bkgd: '#e1e1e1', fore: inherit },
            Layout_SinglePaneContent: { id: ColorScheme.ItemId.Layout_SinglePaneContent, bkgd: '#000000', fore: inherit },
            Layout_PopinIconBorder: { id: ColorScheme.ItemId.Layout_PopinIconBorder, bkgd: inherit, fore: '#cccccc' },
            Layout_ActiveTab: { id: ColorScheme.ItemId.Layout_ActiveTab, bkgd: inherit, fore: '#777777' },
            Layout_DropTargetIndicatorOutline: { id: ColorScheme.ItemId.Layout_DropTargetIndicatorOutline, bkgd: inherit, fore: '#ffffff' },
            Layout_SplitterDragging: { id: ColorScheme.ItemId.Layout_SplitterDragging, bkgd: '#555555', fore: inherit },
            Layout_SingleTabContainer: { id: ColorScheme.ItemId.Layout_SingleTabContainer, bkgd: '#fafafa', fore: '#452500' },
            Layout_SelectedHeader: { id: ColorScheme.ItemId.Layout_SelectedHeader, bkgd: '#999999', fore: inherit },
            Layout_TransitionIndicatorBorder: { id: ColorScheme.ItemId.Layout_TransitionIndicatorBorder, bkgd: inherit, fore: '#bbbbbb' },
            Layout_DropDownArrow: { id: ColorScheme.ItemId.Layout_DropDownArrow, bkgd: inherit, fore: '#888888' },
            Environment_Production: { id: ColorScheme.ItemId.Environment_Production, bkgd: 'lavenderblush', fore: inherit },
            Environment_DelayedProduction: { id: ColorScheme.ItemId.Environment_DelayedProduction, bkgd: 'green', fore: inherit },
            Environment_Demo: { id: ColorScheme.ItemId.Environment_Demo, bkgd: 'yellow', fore: inherit },
            Environment_Production_Offline: { id: ColorScheme.ItemId.Environment_Production_Offline, bkgd: 'red', fore: inherit },
            Environment_DelayedProduction_Offline: { id: ColorScheme.ItemId.Environment_DelayedProduction_Offline, bkgd: 'lime', fore: inherit },
            Environment_Demo_Offline: { id: ColorScheme.ItemId.Environment_Demo_Offline, bkgd: 'orange', fore: inherit },
            Environment_StartFinal: { id: ColorScheme.ItemId.Environment_StartFinal, bkgd: 'slategray', fore: inherit },
            Environment_StartFinal_KickedOff: { id: ColorScheme.ItemId.Environment_StartFinal_KickedOff, bkgd: 'magenta', fore: inherit },
            DesktopBar: { id: ColorScheme.ItemId.DesktopBar, bkgd: 'silver', fore: '' },
            MenuBar_RootItem: { id: ColorScheme.ItemId.MenuBar_RootItem, bkgd: 'silver', fore: '' },
            MenuBar_RootItem_Disabled: { id: ColorScheme.ItemId.MenuBar_RootItem_Disabled, bkgd: inherit, fore: '#686869' },
            MenuBar_RootItemHighlighted: { id: ColorScheme.ItemId.MenuBar_RootItemHighlighted, bkgd: 'dimgray', fore: '' },
            MenuBar_OverlayMenu: { id: ColorScheme.ItemId.MenuBar_OverlayMenu, bkgd: '', fore: 'darkslategray' },
            MenuBar_OverlayItem: { id: ColorScheme.ItemId.MenuBar_OverlayItem, bkgd: 'silver', fore: '' },
            MenuBar_OverlayItem_Disabled: { id: ColorScheme.ItemId.MenuBar_OverlayItem_Disabled, bkgd: inherit, fore: '#686869' },
            MenuBar_OverlayItemHighlighted: { id: ColorScheme.ItemId.MenuBar_OverlayItemHighlighted, bkgd: 'ghostwhite', fore: '' },
            MenuBar_OverlayItemDivider: { id: ColorScheme.ItemId.MenuBar_OverlayItemDivider, bkgd: '', fore: '#686869' },
            Grid_Blank: { id: ColorScheme.ItemId.Grid_Blank, bkgd: WhiteColor, fore: BlackColor },
            Grid_VerticalLine: { id: ColorScheme.ItemId.Grid_VerticalLine, bkgd: '', fore: '#595959' },
            Grid_HorizontalLine: { id: ColorScheme.ItemId.Grid_HorizontalLine, bkgd: '', fore: '#595959' },
            Grid_ColumnHeader: { id: ColorScheme.ItemId.Grid_ColumnHeader, bkgd: BlueColor, fore: WhiteColor },
            Grid_HighestPrioritySortColumnHeader: { id: ColorScheme.ItemId.Grid_HighestPrioritySortColumnHeader, bkgd: BlueColor, fore: WhiteColor },
            Grid_Base: { id: ColorScheme.ItemId.Grid_Base, bkgd: '#FFEEEE', fore: BlackColor },
            Grid_BaseAlt: { id: ColorScheme.ItemId.Grid_BaseAlt, bkgd: '#EEDDDD', fore: NoneColor },
            Grid_BaseFlashedOn: { id: ColorScheme.ItemId.Grid_BaseFlashedOn, bkgd: PastelDefaultFlashedOnBkgd, fore: PastelDefaultFlashedOnFore },
            Grid_BaseAltFlashedOn: { id: ColorScheme.ItemId.Grid_BaseAltFlashedOn, bkgd: PastelDefaultAltRowFlashedOnBkgd, fore: PastelDefaultAltRowFlashedOnFore },
            Grid_DataError: { id: ColorScheme.ItemId.Grid_DataError, bkgd: NoneColor, fore: '#466AE6' },
            Grid_DataErrorAlt: { id: ColorScheme.ItemId.Grid_DataErrorAlt, bkgd: NoneColor, fore: '#466AE6' },
            Grid_DataErrorRowHeader: { id: ColorScheme.ItemId.Grid_DataErrorRowHeader, bkgd: NoneColor, fore: GrayTextColor },
            Grid_DataErrorRowHeaderAlt: { id: ColorScheme.ItemId.Grid_DataErrorRowHeaderAlt, bkgd: NoneColor, fore: GrayTextColor },
            Grid_DataSuspect: { id: ColorScheme.ItemId.Grid_DataSuspect, bkgd: NoneColor, fore: MedGrayColor },
            Grid_DataSuspectAlt: { id: ColorScheme.ItemId.Grid_DataSuspectAlt, bkgd: NoneColor, fore: MedGrayColor },
            Grid_DataSuspectRowHeader: { id: ColorScheme.ItemId.Grid_DataSuspectRowHeader, bkgd: NoneColor, fore: MedGrayColor },
            Grid_DataSuspectRowHeaderAlt: { id: ColorScheme.ItemId.Grid_DataSuspectRowHeaderAlt, bkgd: NoneColor, fore: MedGrayColor },
            Grid_RowHeader: { id: ColorScheme.ItemId.Grid_RowHeader, bkgd: BtnFaceColor, fore: WindowTextColor },
            Grid_RowHeaderAlt: { id: ColorScheme.ItemId.Grid_RowHeaderAlt, bkgd: NoneColor, fore: NoneColor },
            Grid_TopRowHeader: { id: ColorScheme.ItemId.Grid_TopRowHeader, bkgd: NoneColor, fore: NoneColor },
            Grid_FocusedRowBorder: { id: ColorScheme.ItemId.Grid_FocusedRowBorder, bkgd: LtGrayColor, fore: NoneColor },
            Grid_FocusedCell: { id: ColorScheme.ItemId.Grid_FocusedCell, bkgd: '#97FFFF', fore: NoneColor },
            Grid_FocusedCellBorder: { id: ColorScheme.ItemId.Grid_FocusedCellBorder, bkgd: NoneColor, fore: LtGrayColor },
            Grid_FocusedCellFlashedOn: { id: ColorScheme.ItemId.Grid_FocusedCellFlashedOn, bkgd: YellowColor, fore: NoneColor },
            Grid_FocusedRow: { id: ColorScheme.ItemId.Grid_FocusedRow, bkgd: '#E1FFFF', fore: NoneColor },
            Grid_FocusedRowFlashedOn: { id: ColorScheme.ItemId.Grid_FocusedRowFlashedOn, bkgd: YellowColor, fore: NoneColor },
            Grid_FocusedRowHeader: { id: ColorScheme.ItemId.Grid_FocusedRowHeader, bkgd: '#D0FFFF', fore: NoneColor },
            Grid_FocusedTopRowHeader: { id: ColorScheme.ItemId.Grid_FocusedTopRowHeader, bkgd: NoneColor, fore: NoneColor },
            Grid_SelectedRow: { id: ColorScheme.ItemId.Grid_SelectedRow, bkgd: '#E1FFFF', fore: NoneColor },
            Grid_SelectedRowHeader: { id: ColorScheme.ItemId.Grid_SelectedRowHeader, bkgd: '#E1FFFF', fore: NoneColor },
            Grid_SelectedRowFlashedOn: { id: ColorScheme.ItemId.Grid_SelectedRowFlashedOn, bkgd: YellowColor, fore: NoneColor },
            Grid_TopBase: { id: ColorScheme.ItemId.Grid_TopBase, bkgd: '#E7E8DB', fore: NoneColor },
            Grid_Cancelled: { id: ColorScheme.ItemId.Grid_Cancelled, bkgd: LtGrayColor, fore: NoneColor },
            Grid_RowRecentlyAddedBorder: { id: ColorScheme.ItemId.Grid_RowRecentlyAddedBorder, bkgd: inherit, fore: NoneColor },
            Grid_RowRecordRecentlyChangedBorder: { id: ColorScheme.ItemId.Grid_RowRecordRecentlyChangedBorder, bkgd: '#CFFFFF', fore: NoneColor },
            Grid_ValueRecentlyModifiedBorder: { id: ColorScheme.ItemId.Grid_ValueRecentlyModifiedBorder, bkgd: '#B7F9F3', fore: YellowColor },
            Grid_ValueRecentlyModifiedUpBorder: { id: ColorScheme.ItemId.Grid_ValueRecentlyModifiedUpBorder, bkgd: GreenColor, fore: GreenColor },
            Grid_ValueRecentlyModifiedDownBorder: { id: ColorScheme.ItemId.Grid_ValueRecentlyModifiedDownBorder, bkgd: RedColor, fore: RedColor },
            Grid_UpValue: { id: ColorScheme.ItemId.Grid_UpValue, bkgd: GreenColor, fore: GreenColor },
            Grid_DownValue: { id: ColorScheme.ItemId.Grid_DownValue, bkgd: RedColor, fore: RedColor },
            Grid_Sensitive: { id: ColorScheme.ItemId.Grid_Sensitive, bkgd: '#FFEEEE', fore: WhiteColor },
            Grid_SensitiveAlt: { id: ColorScheme.ItemId.Grid_SensitiveAlt, bkgd: '#EEDDDD', fore: WhiteColor },
            Grid_TopSensitive: { id: ColorScheme.ItemId.Grid_TopSensitive, bkgd: '#E7E8DB', fore: WhiteColor },
            Grid_NewsIncoming: { id: ColorScheme.ItemId.Grid_NewsIncoming, bkgd: WhiteColor, fore: RedColor },
            Grid_NewsIncomingAlt: { id: ColorScheme.ItemId.Grid_NewsIncomingAlt, bkgd: inherit, fore: inherit },
            Grid_NewsHeadlineOnly: { id: ColorScheme.ItemId.Grid_NewsHeadlineOnly, bkgd: WhiteColor, fore: '#00136CFF' },
            Grid_NewsHeadlineOnlyAlt: { id: ColorScheme.ItemId.Grid_NewsHeadlineOnlyAlt, bkgd: inherit, fore: inherit },
            Grid_OrderBuy: { id: ColorScheme.ItemId.Grid_OrderBuy, bkgd: WhiteColor, fore: BlackColor },
            Grid_OrderBuyAlt: { id: ColorScheme.ItemId.Grid_OrderBuyAlt, bkgd: WhiteColor, fore: BlackColor },
            Grid_PriceBuy: { id: ColorScheme.ItemId.Grid_PriceBuy, bkgd: '#D7FFD7', fore: BlackColor },
            Grid_PriceBuyAlt: { id: ColorScheme.ItemId.Grid_PriceBuyAlt, bkgd: '#EBFFEB', fore: BlackColor },
            Grid_OrderSell: { id: ColorScheme.ItemId.Grid_OrderSell, bkgd: WhiteColor, fore: BlackColor },
            Grid_OrderSellAlt: { id: ColorScheme.ItemId.Grid_OrderSellAlt, bkgd: WhiteColor, fore: BlackColor },
            Grid_PriceSell: { id: ColorScheme.ItemId.Grid_PriceSell, bkgd: '#D7D7FF', fore: BlackColor },
            Grid_PriceSellAlt: { id: ColorScheme.ItemId.Grid_PriceSellAlt, bkgd: '#EBEBFF', fore: BlackColor },
            Grid_PriceSellOverlap: { id: ColorScheme.ItemId.Grid_PriceSellOverlap, bkgd: '#9B9BFF', fore: NavyColor },
            Grid_PriceSellOverlapAlt: { id: ColorScheme.ItemId.Grid_PriceSellOverlapAlt, bkgd: '#9B9BFF', fore: NavyColor },
            Grid_MyOrder: { id: ColorScheme.ItemId.Grid_MyOrder, bkgd: '#C3C6FF', fore: BlackColor },
            Grid_MyOrderAlt: { id: ColorScheme.ItemId.Grid_MyOrderAlt, bkgd: '#C3C6FF', fore: BlackColor },
            Grid_PriceHasMyOrder: { id: ColorScheme.ItemId.Grid_PriceHasMyOrder, bkgd: '#8284FF', fore: BlackColor },
            Grid_PriceHasMyOrderAlt: { id: ColorScheme.ItemId.Grid_PriceHasMyOrderAlt, bkgd: '#8284FF', fore: BlackColor },
            Grid_Expanded: { id: ColorScheme.ItemId.Grid_Expanded, bkgd: '#CFFFFF', fore: BlackColor },
            Grid_Unacknowledged: { id: ColorScheme.ItemId.Grid_Unacknowledged, bkgd: RedColor, fore: NoneColor },
            Grid_Fired: { id: ColorScheme.ItemId.Grid_Fired, bkgd: MaroonColor, fore: NoneColor },
            Grid_GreyedOut: { id: ColorScheme.ItemId.Grid_GreyedOut, bkgd: NoneColor, fore: GrayTextColor },
            Grid_Scrollbar: { id: ColorScheme.ItemId.Grid_Scrollbar, bkgd: transparent, fore: '#d3d3d3' },
            Grid_ScrollbarThumbShadow: { id: ColorScheme.ItemId.Grid_ScrollbarThumbShadow, bkgd: BlackColor, fore: NoneColor },
            TextControl: { id: ColorScheme.ItemId.TextControl, bkgd: WhiteColor, fore: BlackColor },
            TextControl_Disabled: { id: ColorScheme.ItemId.TextControl_Disabled, bkgd: LtGrayColor, fore: DkGrayColor },
            TextControl_ReadOnly: { id: ColorScheme.ItemId.TextControl_ReadOnly, bkgd: '#F7F1FF', fore: BlackColor },
            TextControl_Missing: { id: ColorScheme.ItemId.TextControl_Missing, bkgd: SkyBlueColor, fore: BlackColor },
            TextControl_Invalid: { id: ColorScheme.ItemId.TextControl_Invalid, bkgd: WebIndianRedColor, fore: BlackColor },
            TextControl_Valid: { id: ColorScheme.ItemId.TextControl_Valid, bkgd: WhiteColor, fore: BlackColor },
            TextControl_Accepted: { id: ColorScheme.ItemId.TextControl_Accepted, bkgd: WhiteColor, fore: BlackColor },
            TextControl_Waiting: { id: ColorScheme.ItemId.TextControl_Waiting, bkgd: WhiteColor, fore: BlackColor },
            TextControl_Warning: { id: ColorScheme.ItemId.TextControl_Warning, bkgd: WhiteColor, fore: BlackColor },
            TextControl_Error: { id: ColorScheme.ItemId.TextControl_Error, bkgd: inherit, fore: BlackColor },
            TextControl_Highlight: { id: ColorScheme.ItemId.TextControl_Highlight, bkgd: WhiteColor, fore: YellowColor },
            TextControl_Selected: { id: ColorScheme.ItemId.TextControl_Selected, bkgd: 'DimGray', fore: BlackColor },
            ClickControl: { id: ColorScheme.ItemId.ClickControl, bkgd: BtnFaceColor, fore: DkGrayColor },
            ClickControl_Disabled: { id: ColorScheme.ItemId.ClickControl_Disabled, bkgd: BtnFaceColor, fore: DkGrayColor },
            ClickControl_ReadOnly: { id: ColorScheme.ItemId.ClickControl_ReadOnly, bkgd: BtnFaceColor, fore: GrayTextColor },
            ClickControl_Missing: { id: ColorScheme.ItemId.ClickControl_Missing, bkgd: BtnFaceColor, fore: BlueColor },
            ClickControl_Invalid: { id: ColorScheme.ItemId.ClickControl_Invalid, bkgd: WebIndianRedColor, fore: BlackColor },
            ClickControl_Valid: { id: ColorScheme.ItemId.ClickControl_Valid, bkgd: BtnFaceColor, fore: WebIndianRedColor },
            ClickControl_Accepted: { id: ColorScheme.ItemId.ClickControl_Accepted, bkgd: BtnFaceColor, fore: BlackColor },
            ClickControl_Waiting: { id: ColorScheme.ItemId.ClickControl_Waiting, bkgd: BtnFaceColor, fore: BlackColor },
            ClickControl_Warning: { id: ColorScheme.ItemId.ClickControl_Warning, bkgd: BtnFaceColor, fore: BlackColor },
            ClickControl_Error: { id: ColorScheme.ItemId.ClickControl_Error, bkgd: BtnFaceColor, fore: BlackColor },
            Label: { id: ColorScheme.ItemId.Label, bkgd: inherit, fore: DkGrayColor },
            Label_Disabled: { id: ColorScheme.ItemId.Label_Disabled, bkgd: inherit, fore: DkGrayColor },
            Label_ReadOnly: { id: ColorScheme.ItemId.Label_ReadOnly, bkgd: inherit, fore: GrayTextColor },
            Label_Missing: { id: ColorScheme.ItemId.Label_Missing, bkgd: inherit, fore: BlueColor },
            Label_Invalid: { id: ColorScheme.ItemId.Label_Invalid, bkgd: WebIndianRedColor, fore: BlackColor },
            Label_Valid: { id: ColorScheme.ItemId.Label_Valid, bkgd: inherit, fore: WebIndianRedColor },
            Label_Accepted: { id: ColorScheme.ItemId.Label_Accepted, bkgd: inherit, fore: BlackColor },
            Label_Waiting: { id: ColorScheme.ItemId.Label_Waiting, bkgd: inherit, fore: HotLightColor },
            Label_Warning: { id: ColorScheme.ItemId.Label_Warning, bkgd: inherit, fore: HotLightColor },
            Label_Error: { id: ColorScheme.ItemId.Label_Error, bkgd: inherit, fore: RedColor },

            Caution: { id: ColorScheme.ItemId.Caution, bkgd: inherit, fore: YellowColor },
            Caution_UsableButNotGood: { id: ColorScheme.ItemId.Caution_UsableButNotGood, bkgd: inherit, fore: lightYellow },
            Caution_Suspect: { id: ColorScheme.ItemId.Caution_Suspect, bkgd: inherit, fore: orange },
            Caution_Error: { id: ColorScheme.ItemId.Caution_Error, bkgd: inherit, fore: RedColor },

            Text_ControlBorder: { id: ColorScheme.ItemId.Text_ControlBorder, bkgd: NoneColor, fore: 'blue' },
            Text_ReadonlyMultiline: { id: ColorScheme.ItemId.Text_ReadonlyMultiline, bkgd: inherit, fore: inherit },
            Text_GreyedOut: { id: ColorScheme.ItemId.Text_GreyedOut, bkgd: inherit, fore: inherit },

            IconButton: { id: ColorScheme.ItemId.IconButton, bkgd: NoneColor, fore: NoneColor },
            IconButton_SelectedBorder: { id: ColorScheme.ItemId.IconButton_SelectedBorder, bkgd: NoneColor, fore: RedColor },
            IconButton_Hover: { id: ColorScheme.ItemId.IconButton_Hover, bkgd: LtGrayColor, fore: NoneColor },

            Panel: { id: ColorScheme.ItemId.Panel, bkgd: BtnFaceColor, fore: WindowTextColor },
            Panel_Hoisted: { id: ColorScheme.ItemId.Panel_Hoisted, bkgd: inherit, fore: inherit },
            Panel_Divider: { id: ColorScheme.ItemId.Panel_Divider, bkgd: inherit, fore: '#686869' },
            Panel_Splitter: { id: ColorScheme.ItemId.Panel_Splitter, bkgd: inherit, fore: inherit },
            Panel_ItemHover: { id: ColorScheme.ItemId.Panel_ItemHover, bkgd: inherit, fore: NoneColor },

            Unexpected: { id: ColorScheme.ItemId.Unexpected, bkgd: BtnFaceColor, fore: WindowTextColor },
            /* eslint-enable max-len */
        };

        export const items = Object.values(itemsObject);

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function createColorScheme() {
            const scheme = new ColorScheme(name, true);
            for (let i = 0; i < ColorScheme.Item.idCount; i++) {
                scheme.items[i] = items[i];
            }
            return scheme;
        }

        export function initialise() {
            const outOfOrderIdx = items.findIndex((item: ColorScheme.Item, index: Integer) => item.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('ColorSchemePreset.Pastel', outOfOrderIdx, items[outOfOrderIdx].id.toString(10));
            }
        }

        /* eslint-disable max-len */
        // News_BodyText: { id: ColorScheme.ItemId.News_BodyText, bkgd: WindowColor, fore: WindowTextColor },
        // Alert_Disabled: { id: ColorScheme.ItemId.Alert_Disabled, bkgd: LtGrayColor, fore: BlackColor },
        // Alert_DisabledAltRow: { id: ColorScheme.ItemId.Alert_DisabledAltRow, bkgd: MedGrayColor, fore: BlackColor },
        // Alert_Invalid: { id: ColorScheme.ItemId.Alert_Invalid, bkgd: PastelDefaultBkgd, fore: PastelDefaultFore },
        // Alert_InvalidAltRow: { id: ColorScheme.ItemId.Alert_InvalidAltRow, bkgd: PastelDefaultAltRowBkgd, fore: PastelDefaultAltRowFore },
        // Alert_InvalidFlashedOn: { id: ColorScheme.ItemId.Alert_InvalidFlashedOn, bkgd: PastelDefaultFlashedOnBkgd, fore: PastelDefaultFlashedOnFore },
        // Alert_InvalidAltRowFlashedOn: { id: ColorScheme.ItemId.Alert_InvalidAltRowFlashedOn, bkgd: PastelDefaultAltRowFlashedOnBkgd, fore: PastelDefaultAltRowFlashedOnFore },
        // Alert_Valid: { id: ColorScheme.ItemId.Alert_Valid, bkgd: PastelDefaultBkgd, fore: PastelDefaultFore },
        // Alert_ValidAltRow: { id: ColorScheme.ItemId.Alert_ValidAltRow, bkgd: PastelDefaultAltRowBkgd, fore: PastelDefaultAltRowFore },
        // Alert_ValidFlashedOn: { id: ColorScheme.ItemId.Alert_ValidFlashedOn, bkgd: PastelDefaultFlashedOnBkgd, fore: PastelDefaultFlashedOnFore },
        // Alert_ValidAltRowFlashedOn: { id: ColorScheme.ItemId.Alert_ValidAltRowFlashedOn, bkgd: PastelDefaultAltRowFlashedOnBkgd, fore: PastelDefaultAltRowFlashedOnFore },
        // Alert_Expired: { id: ColorScheme.ItemId.Alert_Expired, bkgd: PastelDefaultBkgd, fore: PastelDefaultFore },
        // Alert_ExpiredAltRow: { id: ColorScheme.ItemId.Alert_ExpiredAltRow, bkgd: PastelDefaultAltRowBkgd, fore: PastelDefaultAltRowFore },
        // Alert_ExpiredFlashedOn: { id: ColorScheme.ItemId.Alert_ExpiredFlashedOn, bkgd: PastelDefaultFlashedOnBkgd, fore: PastelDefaultFlashedOnFore },
        // Alert_ExpiredAltRowFlashedOn: { id: ColorScheme.ItemId.Alert_ExpiredAltRowFlashedOn, bkgd: PastelDefaultAltRowFlashedOnBkgd, fore: PastelDefaultAltRowFlashedOnFore },
        // Alert_Error: { id: ColorScheme.ItemId.Alert_Error, bkgd: PastelDefaultBkgd, fore: PastelDefaultFore },
        // Alert_ErrorAltRow: { id: ColorScheme.ItemId.Alert_ErrorAltRow, bkgd: PastelDefaultAltRowBkgd, fore: PastelDefaultAltRowFore },
        // Alert_ErrorFlashedOn: { id: ColorScheme.ItemId.Alert_ErrorFlashedOn, bkgd: PastelDefaultFlashedOnBkgd, fore: PastelDefaultFlashedOnFore },
        // Alert_ErrorAltRowFlashedOn: { id: ColorScheme.ItemId.Alert_ErrorAltRowFlashedOn, bkgd: PastelDefaultAltRowFlashedOnBkgd, fore: PastelDefaultAltRowFlashedOnFore },
        // Alert_Offline: { id: ColorScheme.ItemId.Alert_Offline, bkgd: PastelDefaultBkgd, fore: PastelDefaultFore },
        // Alert_OfflineAltRow: { id: ColorScheme.ItemId.Alert_OfflineAltRow, bkgd: PastelDefaultAltRowBkgd, fore: PastelDefaultAltRowFore },
        // Alert_OfflineFlashedOn: { id: ColorScheme.ItemId.Alert_OfflineFlashedOn, bkgd: PastelDefaultFlashedOnBkgd, fore: PastelDefaultFlashedOnFore },
        // Alert_OfflineAltRowFlashedOn: { id: ColorScheme.ItemId.Alert_OfflineAltRowFlashedOn, bkgd: PastelDefaultAltRowFlashedOnBkgd, fore: PastelDefaultAltRowFlashedOnFore },
        // Alert_Armed: { id: ColorScheme.ItemId.Alert_Armed, bkgd: PastelDefaultBkgd, fore: PastelDefaultFore },
        // Alert_ArmedAltRow: { id: ColorScheme.ItemId.Alert_ArmedAltRow, bkgd: PastelDefaultAltRowBkgd, fore: PastelDefaultAltRowFore },
        // Alert_ArmedFlashedOn: { id: ColorScheme.ItemId.Alert_ArmedFlashedOn, bkgd: PastelDefaultFlashedOnBkgd, fore: PastelDefaultFlashedOnFore },
        // Alert_ArmedAltRowFlashedOn: { id: ColorScheme.ItemId.Alert_ArmedAltRowFlashedOn, bkgd: PastelDefaultAltRowFlashedOnBkgd, fore: PastelDefaultAltRowFlashedOnFore },
        // Alert_Fired: { id: ColorScheme.ItemId.Alert_Fired, bkgd: PastelDefaultBkgd, fore: PastelDefaultFore },
        // Alert_FiredAltRow: { id: ColorScheme.ItemId.Alert_FiredAltRow, bkgd: PastelDefaultAltRowBkgd, fore: PastelDefaultAltRowFore },
        // Alert_FiredFlashedOn: { id: ColorScheme.ItemId.Alert_FiredFlashedOn, bkgd: PastelDefaultFlashedOnBkgd, fore: PastelDefaultFlashedOnFore },
        // Alert_FiredAltRowFlashedOn: { id: ColorScheme.ItemId.Alert_FiredAltRowFlashedOn, bkgd: PastelDefaultAltRowFlashedOnBkgd, fore: PastelDefaultAltRowFlashedOnFore },
        // Alarm_Info: { id: ColorScheme.ItemId.Alarm_Info, bkgd: PastelDefaultBkgd, fore: PastelDefaultFore },
        // Alarm_InfoAltRow: { id: ColorScheme.ItemId.Alarm_InfoAltRow, bkgd: PastelDefaultAltRowBkgd, fore: PastelDefaultAltRowFore },
        // Alarm_InfoFlashedOn: { id: ColorScheme.ItemId.Alarm_InfoFlashedOn, bkgd: PastelDefaultFlashedOnBkgd, fore: PastelDefaultFlashedOnFore },
        // Alarm_InfoAltRowFlashedOn: { id: ColorScheme.ItemId.Alarm_InfoAltRowFlashedOn, bkgd: PastelDefaultAltRowFlashedOnBkgd, fore: PastelDefaultAltRowFlashedOnFore },
        // Alarm_Warning: { id: ColorScheme.ItemId.Alarm_Warning, bkgd: PastelDefaultBkgd, fore: PastelDefaultFore },
        // Alarm_WarningAltRow: { id: ColorScheme.ItemId.Alarm_WarningAltRow, bkgd: PastelDefaultAltRowBkgd, fore: PastelDefaultAltRowFore },
        // Alarm_WarningFlashedOn: { id: ColorScheme.ItemId.Alarm_WarningFlashedOn, bkgd: PastelDefaultFlashedOnBkgd, fore: PastelDefaultFlashedOnFore },
        // Alarm_WarningAltRowFlashedOn: { id: ColorScheme.ItemId.Alarm_WarningAltRowFlashedOn, bkgd: PastelDefaultAltRowFlashedOnBkgd, fore: PastelDefaultAltRowFlashedOnFore },
        // Alarm_Low: { id: ColorScheme.ItemId.Alarm_Low, bkgd: PastelDefaultBkgd, fore: PastelDefaultFore },
        // Alarm_LowAltRow: { id: ColorScheme.ItemId.Alarm_LowAltRow, bkgd: PastelDefaultAltRowBkgd, fore: PastelDefaultAltRowFore },
        // Alarm_LowFlashedOn: { id: ColorScheme.ItemId.Alarm_LowFlashedOn, bkgd: PastelDefaultFlashedOnBkgd, fore: PastelDefaultFlashedOnFore },
        // Alarm_LowAltRowFlashedOn: { id: ColorScheme.ItemId.Alarm_LowAltRowFlashedOn, bkgd: PastelDefaultAltRowFlashedOnBkgd, fore: PastelDefaultAltRowFlashedOnFore },
        // Alarm_Normal: { id: ColorScheme.ItemId.Alarm_Normal, bkgd: PastelDefaultBkgd, fore: PastelDefaultFore },
        // Alarm_NormalAltRow: { id: ColorScheme.ItemId.Alarm_NormalAltRow, bkgd: PastelDefaultAltRowBkgd, fore: PastelDefaultAltRowFore },
        // Alarm_NormalFlashedOn: { id: ColorScheme.ItemId.Alarm_NormalFlashedOn, bkgd: PastelDefaultFlashedOnBkgd, fore: PastelDefaultFlashedOnFore },
        // Alarm_NormalAltRowFlashedOn: { id: ColorScheme.ItemId.Alarm_NormalAltRowFlashedOn, bkgd: PastelDefaultAltRowFlashedOnBkgd, fore: PastelDefaultAltRowFlashedOnFore },
        // Alarm_High: { id: ColorScheme.ItemId.Alarm_High, bkgd: PastelDefaultBkgd, fore: PastelDefaultFore },
        // Alarm_HighAltRow: { id: ColorScheme.ItemId.Alarm_HighAltRow, bkgd: PastelDefaultAltRowBkgd, fore: PastelDefaultAltRowFore },
        // Alarm_HighFlashedOn: { id: ColorScheme.ItemId.Alarm_HighFlashedOn, bkgd: PastelDefaultFlashedOnBkgd, fore: PastelDefaultFlashedOnFore },
        // Alarm_HighAltRowFlashedOn: { id: ColorScheme.ItemId.Alarm_HighAltRowFlashedOn, bkgd: PastelDefaultAltRowFlashedOnBkgd, fore: PastelDefaultAltRowFlashedOnFore },
        // Alarm_Urgent: { id: ColorScheme.ItemId.Alarm_Urgent, bkgd: PastelDefaultBkgd, fore: PastelDefaultFore },
        // Alarm_UrgentAltRow: { id: ColorScheme.ItemId.Alarm_UrgentAltRow, bkgd: PastelDefaultAltRowBkgd, fore: PastelDefaultAltRowFore },
        // Alarm_UrgentFlashedOn: { id: ColorScheme.ItemId.Alarm_UrgentFlashedOn, bkgd: PastelDefaultFlashedOnBkgd, fore: PastelDefaultFlashedOnFore },
        // Alarm_UrgentAltRowFlashedOn: { id: ColorScheme.ItemId.Alarm_UrgentAltRowFlashedOn, bkgd: PastelDefaultAltRowFlashedOnBkgd, fore: PastelDefaultAltRowFlashedOnFore },
        // Alarm_Error: { id: ColorScheme.ItemId.Alarm_Error, bkgd: PastelDefaultBkgd, fore: PastelDefaultFore },
        // Alarm_ErrorAltRow: { id: ColorScheme.ItemId.Alarm_ErrorAltRow, bkgd: PastelDefaultAltRowBkgd, fore: PastelDefaultAltRowFore },
        // Alarm_ErrorFlashedOn: { id: ColorScheme.ItemId.Alarm_ErrorFlashedOn, bkgd: PastelDefaultFlashedOnBkgd, fore: PastelDefaultFlashedOnFore },
        // Alarm_ErrorAltRowFlashedOn: { id: ColorScheme.ItemId.Alarm_ErrorAltRowFlashedOn, bkgd: PastelDefaultAltRowFlashedOnBkgd, fore: PastelDefaultAltRowFlashedOnFore },
        // TitleBarButton: { id: ColorScheme.ItemId.TitleBarButton, bkgd: SkyBlueColor, fore: PastelDefaultFore },
        // AlertsTitleBarButton: { id: ColorScheme.ItemId.AlertsTitleBarButton, bkgd: SkyBlueColor, fore: PastelDefaultFore },
        // AlertsTitleBarButton_FlashedOn: { id: ColorScheme.ItemId.AlertsTitleBarButton_FlashedOn, bkgd: RedColor, fore: PastelDefaultFore },
        // TextDisplay: { id: ColorScheme.ItemId.TextDisplay, bkgd: WhiteColor, fore: BlackColor },
        // TextDisplay_Disabled: { id: ColorScheme.ItemId.TextDisplay_Disabled, bkgd: GrayColor, fore: DkGrayColor },
        // TextDisplay_Waiting: { id: ColorScheme.ItemId.TextDisplay_Waiting, bkgd: '#E7F1F3', fore: BlackColor },
        // TextDisplay_Info: { id: ColorScheme.ItemId.TextDisplay_Info, bkgd: '#FDFDEB', fore: BlackColor },
        // TextDisplay_Warning: { id: ColorScheme.ItemId.TextDisplay_Warning, bkgd: '#68A9EA', fore: BlackColor },
        // TextDisplay_Error: { id: ColorScheme.ItemId.TextDisplay_Error, bkgd: '#6161FF', fore: BlackColor },
        // TextDisplay_Danger: { id: ColorScheme.ItemId.TextDisplay_Danger, bkgd: '#c23848', fore: BlackColor },
        // OrderPad_Side_Buy: { id: ColorScheme.ItemId.OrderPad_Side_Buy, bkgd: '#C6FFC6', fore: NoneColor },
        // OrderPad_Side_Sell: { id: ColorScheme.ItemId.OrderPad_Side_Sell, bkgd: '#C6C3FF', fore: NoneColor },
        // OrderPad_Side_Empty: { id: ColorScheme.ItemId.OrderPad_Side_Empty, bkgd: NoneColor, fore: NoneColor },
        // OrderPad_Side_Unknown: { id: ColorScheme.ItemId.OrderPad_Side_Unknown, bkgd: WhiteColor, fore: NoneColor },
        // ApfcOrderStatus_Accepted: { id: ColorScheme.ItemId.ApfcOrderStatus_Accepted, bkgd: WhiteColor, fore: WindowTextColor },
        // ApfcOrderStatus_AcceptedAlt: { id: ColorScheme.ItemId.ApfcOrderStatus_AcceptedAlt, bkgd: WhiteColor, fore: WindowTextColor },
        // ApfcOrderStatus_PartiallyFilled: { id: ColorScheme.ItemId.ApfcOrderStatus_PartiallyFilled, bkgd: '#D0FFD0', fore: WindowTextColor },
        // ApfcOrderStatus_PartiallyFilledAlt: { id: ColorScheme.ItemId.ApfcOrderStatus_PartiallyFilledAlt, bkgd: '#D0FFD0', fore: WindowTextColor },
        // ApfcOrderStatus_Filled: { id: ColorScheme.ItemId.ApfcOrderStatus_Filled, bkgd: '#80FF80', fore: WindowTextColor },
        // ApfcOrderStatus_FilledAlt: { id: ColorScheme.ItemId.ApfcOrderStatus_FilledAlt, bkgd: '#80FF80', fore: WindowTextColor },
        // ApfcOrderStatus_Cancelled: { id: ColorScheme.ItemId.ApfcOrderStatus_Cancelled, bkgd: '#C0C0FF', fore: WindowTextColor },
        // ApfcOrderStatus_CancelledAlt: { id: ColorScheme.ItemId.ApfcOrderStatus_CancelledAlt, bkgd: '#C0C0FF', fore: WindowTextColor },
        // ApfcOrderStatus_Other: { id: ColorScheme.ItemId.ApfcOrderStatus_Other, bkgd: '#FBFBE8', fore: WindowTextColor },
        // ApfcOrderStatus_OtherAlt: { id: ColorScheme.ItemId.ApfcOrderStatus_OtherAlt, bkgd: '#FBFBE8', fore: WindowTextColor },
        // PopupLookup_Id: { id: ColorScheme.ItemId.PopupLookup_Id, bkgd: WindowColor, fore: WindowTextColor },
        // PopupLookup_IdAlt: { id: ColorScheme.ItemId.PopupLookup_IdAlt, bkgd: WindowColor, fore: WindowTextColor },
        // PopupLookup_IdFocused: { id: ColorScheme.ItemId.PopupLookup_IdFocused, bkgd: BlueColor, fore: WhiteColor },
        // PopupLookup_Description: { id: ColorScheme.ItemId.PopupLookup_Description, bkgd: WindowColor, fore: WindowTextColor },
        // PopupLookup_DescriptionAlt: { id: ColorScheme.ItemId.PopupLookup_DescriptionAlt, bkgd: WindowColor, fore: WindowTextColor },
        // PopupLookup_DescriptionFocused: { id: ColorScheme.ItemId.PopupLookup_DescriptionFocused, bkgd: BlueColor, fore: WhiteColor },
        // DragImageText: { id: ColorScheme.ItemId.DragImageText, bkgd: NoneColor, fore: WindowTextColor },
        // WaitingPanel: { id: ColorScheme.ItemId.WaitingPanel, bkgd: NoneColor, fore: NoneColor },
        // WaitingBar: { id: ColorScheme.ItemId.WaitingBar, bkgd: HighlightColor, fore: NoneColor },
        // Highlight: { id: ColorScheme.ItemId.Highlight, bkgd: HighlightColor, fore: WindowTextColor },
        /* eslint-enable max-len */
    }

    namespace Dark {
        export const name = 'Default Dark';

        const itemsObject: ItemsObject = {
            /* eslint-disable max-len */
            Layout_Base: { id: ColorScheme.ItemId.Layout_Base, bkgd: '#212828', fore: inherit },
            Layout_SinglePaneContent: { id: ColorScheme.ItemId.Layout_SinglePaneContent, bkgd: inherit, fore: inherit },
            Layout_PopinIconBorder: { id: ColorScheme.ItemId.Layout_PopinIconBorder, bkgd: inherit, fore: '#eeeeee' },
            Layout_ActiveTab: { id: ColorScheme.ItemId.Layout_ActiveTab, bkgd: inherit, fore: '#dddddd' },
            Layout_DropTargetIndicatorOutline: { id: ColorScheme.ItemId.Layout_DropTargetIndicatorOutline, bkgd: inherit, fore: '#cccccc' },
            Layout_SplitterDragging: { id: ColorScheme.ItemId.Layout_SplitterDragging, bkgd: '#444444', fore: inherit },
            Layout_SingleTabContainer: { id: ColorScheme.ItemId.Layout_SingleTabContainer, bkgd: '#111111', fore: '#999999' },
            Layout_SelectedHeader: { id: ColorScheme.ItemId.Layout_SelectedHeader, bkgd: '#452500', fore: inherit },
            Layout_TransitionIndicatorBorder: { id: ColorScheme.ItemId.Layout_TransitionIndicatorBorder, bkgd: inherit, fore: '#555555' },
            Layout_DropDownArrow: { id: ColorScheme.ItemId.Layout_DropDownArrow, bkgd: inherit, fore: 'white' },
            Environment_Production: { id: ColorScheme.ItemId.Environment_Production, bkgd: 'lavenderblush', fore: '#243b53' },
            Environment_DelayedProduction: { id: ColorScheme.ItemId.Environment_DelayedProduction, bkgd: 'green', fore: '#f0f4f8' },
            Environment_Demo: { id: ColorScheme.ItemId.Environment_Demo, bkgd: 'yellow', fore: '#616e67' },
            Environment_Production_Offline: { id: ColorScheme.ItemId.Environment_Production_Offline, bkgd: 'red', fore: '#f0f4f8' },
            Environment_DelayedProduction_Offline: { id: ColorScheme.ItemId.Environment_DelayedProduction_Offline, bkgd: 'lime', fore: '#243b53' },
            Environment_Demo_Offline: { id: ColorScheme.ItemId.Environment_Demo_Offline, bkgd: 'orange', fore: '#243b53' },
            Environment_StartFinal: { id: ColorScheme.ItemId.Environment_StartFinal, bkgd: 'slategray', fore: inherit },
            Environment_StartFinal_KickedOff: { id: ColorScheme.ItemId.Environment_StartFinal_KickedOff, bkgd: 'fuchsia', fore: inherit },
            DesktopBar: { id: ColorScheme.ItemId.DesktopBar, bkgd: '#3c3c3c', fore: inherit },
            MenuBar_RootItem: { id: ColorScheme.ItemId.MenuBar_RootItem, bkgd: inherit, fore: '#cccccc' },
            MenuBar_RootItem_Disabled: { id: ColorScheme.ItemId.MenuBar_RootItem_Disabled, bkgd: inherit, fore: '#686869' },
            MenuBar_RootItemHighlighted: { id: ColorScheme.ItemId.MenuBar_RootItemHighlighted, bkgd: '#505050', fore: inherit },
            MenuBar_OverlayMenu: { id: ColorScheme.ItemId.MenuBar_OverlayMenu, bkgd: '#252526', fore: 'black' },
            MenuBar_OverlayItem: { id: ColorScheme.ItemId.MenuBar_OverlayItem, bkgd: inherit, fore: '#cccccc' },
            MenuBar_OverlayItem_Disabled: { id: ColorScheme.ItemId.MenuBar_OverlayItem_Disabled, bkgd: inherit, fore: '#686869' },
            MenuBar_OverlayItemHighlighted: { id: ColorScheme.ItemId.MenuBar_OverlayItemHighlighted, bkgd: '#094771', fore: 'white' },
            MenuBar_OverlayItemDivider: { id: ColorScheme.ItemId.MenuBar_OverlayItemDivider, bkgd: inherit, fore: '#686869' },
            Grid_Blank: { id: ColorScheme.ItemId.Grid_Blank, bkgd: '#201F23', fore: 'dimgray' },
            Grid_VerticalLine: { id: ColorScheme.ItemId.Grid_VerticalLine, bkgd: inherit, fore: '#595959' },
            Grid_HorizontalLine: { id: ColorScheme.ItemId.Grid_HorizontalLine, bkgd: inherit, fore: '#595959' },
            Grid_ColumnHeader: { id: ColorScheme.ItemId.Grid_ColumnHeader, bkgd: '#626262', fore: 'white' },
            Grid_HighestPrioritySortColumnHeader: { id: ColorScheme.ItemId.Grid_HighestPrioritySortColumnHeader, bkgd: '#b6a523', fore: 'white' },
            Grid_Base: { id: ColorScheme.ItemId.Grid_Base, bkgd: '#212121', fore: '#f9f0f0' },
            Grid_BaseAlt: { id: ColorScheme.ItemId.Grid_BaseAlt, bkgd: '#2b2b2b', fore: inherit },
            Grid_BaseFlashedOn: { id: ColorScheme.ItemId.Grid_BaseFlashedOn, bkgd: '#423E4D', fore: inherit },
            Grid_BaseAltFlashedOn: { id: ColorScheme.ItemId.Grid_BaseAltFlashedOn, bkgd: '#615B5E', fore: inherit },
            Grid_DataError: { id: ColorScheme.ItemId.Grid_DataError, bkgd: inherit, fore: '#ff466d' },
            Grid_DataErrorAlt: { id: ColorScheme.ItemId.Grid_DataErrorAlt, bkgd: inherit, fore: inherit },
            Grid_DataErrorRowHeader: { id: ColorScheme.ItemId.Grid_DataErrorRowHeader, bkgd: inherit, fore: '#ff46ea' },
            Grid_DataErrorRowHeaderAlt: { id: ColorScheme.ItemId.Grid_DataErrorRowHeaderAlt, bkgd: inherit, fore: inherit },
            Grid_DataSuspect: { id: ColorScheme.ItemId.Grid_DataSuspect, bkgd: inherit, fore: 'dimgray' },
            Grid_DataSuspectAlt: { id: ColorScheme.ItemId.Grid_DataSuspectAlt, bkgd: inherit, fore: inherit },
            Grid_DataSuspectRowHeader: { id: ColorScheme.ItemId.Grid_DataSuspectRowHeader, bkgd: inherit, fore: 'dimgray' },
            Grid_DataSuspectRowHeaderAlt: { id: ColorScheme.ItemId.Grid_DataSuspectRowHeaderAlt, bkgd: inherit, fore: inherit },
            Grid_RowHeader: { id: ColorScheme.ItemId.Grid_RowHeader, bkgd: '#201F23', fore: 'white' },
            Grid_RowHeaderAlt: { id: ColorScheme.ItemId.Grid_RowHeaderAlt, bkgd: '#424041', fore: inherit },
            Grid_TopRowHeader: { id: ColorScheme.ItemId.Grid_TopRowHeader, bkgd: inherit, fore: inherit },
            Grid_FocusedRowBorder: { id: ColorScheme.ItemId.Grid_FocusedRowBorder, bkgd: '#C8B900', fore: inherit },
            Grid_FocusedCell: { id: ColorScheme.ItemId.Grid_FocusedCell, bkgd: '#424041', fore: inherit },
            Grid_FocusedCellBorder: { id: ColorScheme.ItemId.Grid_FocusedCellBorder, bkgd: '#D3D3D1', fore: '#0d1d7f' },
            Grid_FocusedCellFlashedOn: { id: ColorScheme.ItemId.Grid_FocusedCellFlashedOn, bkgd: '#00EBE1', fore: inherit },
            Grid_FocusedRow: { id: ColorScheme.ItemId.Grid_FocusedRow, bkgd: '#6e6835', fore: inherit },
            Grid_FocusedRowFlashedOn: { id: ColorScheme.ItemId.Grid_FocusedRowFlashedOn, bkgd: '#FFFFA9', fore: inherit },
            Grid_FocusedRowHeader: { id: ColorScheme.ItemId.Grid_FocusedRowHeader, bkgd: '#B7499A', fore: 'white' },
            Grid_FocusedTopRowHeader: { id: ColorScheme.ItemId.Grid_FocusedTopRowHeader, bkgd: inherit, fore: inherit },
            Grid_SelectedRow: { id: ColorScheme.ItemId.Grid_SelectedRow, bkgd: '#B7128B', fore: inherit },
            Grid_SelectedRowHeader: { id: ColorScheme.ItemId.Grid_SelectedRowHeader, bkgd: '#8B4076', fore: inherit },
            Grid_SelectedRowFlashedOn: { id: ColorScheme.ItemId.Grid_SelectedRowFlashedOn, bkgd: '#C2008E', fore: inherit },
            Grid_TopBase: { id: ColorScheme.ItemId.Grid_TopBase, bkgd: inherit, fore: inherit },
            Grid_Cancelled: { id: ColorScheme.ItemId.Grid_Cancelled, bkgd: 'silver', fore: inherit },
            Grid_RowRecentlyAddedBorder: { id: ColorScheme.ItemId.Grid_RowRecentlyAddedBorder, bkgd: inherit, fore: inherit },
            Grid_RowRecordRecentlyChangedBorder: { id: ColorScheme.ItemId.Grid_RowRecordRecentlyChangedBorder, bkgd: '#8C5F46', fore: inherit },
            Grid_ValueRecentlyModifiedBorder: { id: ColorScheme.ItemId.Grid_ValueRecentlyModifiedBorder, bkgd: '#8C5F46', fore: 'yellow' },
            Grid_ValueRecentlyModifiedUpBorder: { id: ColorScheme.ItemId.Grid_ValueRecentlyModifiedUpBorder, bkgd: '#64FA64', fore: 'lime' },
            Grid_ValueRecentlyModifiedDownBorder: { id: ColorScheme.ItemId.Grid_ValueRecentlyModifiedDownBorder, bkgd: '#4646FF', fore: '#ff0004' },
            Grid_UpValue: { id: ColorScheme.ItemId.Grid_UpValue, bkgd: inherit, fore: '#64FA64' },
            Grid_DownValue: { id: ColorScheme.ItemId.Grid_DownValue, bkgd: inherit, fore: '#ff0037' },
            Grid_Sensitive: { id: ColorScheme.ItemId.Grid_Sensitive, bkgd: '#201F23', fore: inherit },
            Grid_SensitiveAlt: { id: ColorScheme.ItemId.Grid_SensitiveAlt, bkgd: '#424041', fore: inherit },
            Grid_TopSensitive: { id: ColorScheme.ItemId.Grid_TopSensitive, bkgd: inherit, fore: inherit },
            Grid_NewsIncoming: { id: ColorScheme.ItemId.Grid_NewsIncoming, bkgd: inherit, fore: '#4646FF' },
            Grid_NewsIncomingAlt: { id: ColorScheme.ItemId.Grid_NewsIncomingAlt, bkgd: inherit, fore: inherit },
            Grid_NewsHeadlineOnly: { id: ColorScheme.ItemId.Grid_NewsHeadlineOnly, bkgd: inherit, fore: '#3BB7F0' },
            Grid_NewsHeadlineOnlyAlt: { id: ColorScheme.ItemId.Grid_NewsHeadlineOnlyAlt, bkgd: inherit, fore: inherit },
            Grid_OrderBuy: { id: ColorScheme.ItemId.Grid_OrderBuy, bkgd: '#214121', fore: inherit },
            Grid_OrderBuyAlt: { id: ColorScheme.ItemId.Grid_OrderBuyAlt, bkgd: '#2b462b', fore: inherit },
            Grid_PriceBuy: { id: ColorScheme.ItemId.Grid_PriceBuy, bkgd: '#212821', fore: inherit },
            Grid_PriceBuyAlt: { id: ColorScheme.ItemId.Grid_PriceBuyAlt, bkgd: '#2b302b', fore: inherit },
            Grid_OrderSell: { id: ColorScheme.ItemId.Grid_OrderSell, bkgd: '#412121', fore: inherit },
            Grid_OrderSellAlt: { id: ColorScheme.ItemId.Grid_OrderSellAlt, bkgd: '#462b2b', fore: inherit },
            Grid_PriceSell: { id: ColorScheme.ItemId.Grid_PriceSell, bkgd: '#282121', fore: inherit },
            Grid_PriceSellAlt: { id: ColorScheme.ItemId.Grid_PriceSellAlt, bkgd: '#302b2b', fore: inherit },
            Grid_PriceSellOverlap: { id: ColorScheme.ItemId.Grid_PriceSellOverlap, bkgd: '#784EF5', fore: inherit },
            Grid_PriceSellOverlapAlt: { id: ColorScheme.ItemId.Grid_PriceSellOverlapAlt, bkgd: '#784EF5', fore: inherit },
            Grid_MyOrder: { id: ColorScheme.ItemId.Grid_MyOrder, bkgd: '#162675', fore: '#C8B900' },
            Grid_MyOrderAlt: { id: ColorScheme.ItemId.Grid_MyOrderAlt, bkgd: '#162157', fore: '#C8B900' },
            Grid_PriceHasMyOrder: { id: ColorScheme.ItemId.Grid_PriceHasMyOrder, bkgd: '#C8B900', fore: inherit },
            Grid_PriceHasMyOrderAlt: { id: ColorScheme.ItemId.Grid_PriceHasMyOrderAlt, bkgd: '#C8B900', fore: inherit },
            Grid_Expanded: { id: ColorScheme.ItemId.Grid_Expanded, bkgd: '#424041', fore: 'white' },
            Grid_Unacknowledged: { id: ColorScheme.ItemId.Grid_Unacknowledged, bkgd: '#784EF5', fore: inherit },
            Grid_Fired: { id: ColorScheme.ItemId.Grid_Fired, bkgd: 'maroon', fore: inherit },
            Grid_GreyedOut: { id: ColorScheme.ItemId.Grid_GreyedOut, bkgd: inherit, fore: '#7e7e7e' },
            Grid_Scrollbar: { id: ColorScheme.ItemId.Grid_Scrollbar, bkgd: 'transparent', fore: 'lightgray' },
            Grid_ScrollbarThumbShadow: { id: ColorScheme.ItemId.Grid_ScrollbarThumbShadow, bkgd: 'black', fore: inherit },
            TextControl: { id: ColorScheme.ItemId.TextControl, bkgd: '#3c3c3c', fore: '#fffcf5' },
            TextControl_Disabled: { id: ColorScheme.ItemId.TextControl_Disabled, bkgd: '#484747', fore: '#b6b5b3' },
            TextControl_ReadOnly: { id: ColorScheme.ItemId.TextControl_ReadOnly, bkgd: '#19268d', fore: inherit },
            TextControl_Missing: { id: ColorScheme.ItemId.TextControl_Missing, bkgd: '#307d4f', fore: inherit },
            TextControl_Invalid: { id: ColorScheme.ItemId.TextControl_Invalid, bkgd: '#9825e3', fore: inherit },
            TextControl_Valid: { id: ColorScheme.ItemId.TextControl_Valid, bkgd: inherit, fore: inherit },
            TextControl_Accepted: { id: ColorScheme.ItemId.TextControl_Accepted, bkgd: '#3b3a35', fore: inherit },
            TextControl_Waiting: { id: ColorScheme.ItemId.TextControl_Waiting, bkgd: inherit, fore: '#fbc665' },
            TextControl_Warning: { id: ColorScheme.ItemId.TextControl_Warning, bkgd: inherit, fore: 'orange' },
            TextControl_Error: { id: ColorScheme.ItemId.TextControl_Error, bkgd: inherit, fore: 'red' },
            TextControl_Highlight: { id: ColorScheme.ItemId.TextControl_Highlight, bkgd: inherit, fore: 'yellow' },
            TextControl_Selected: { id: ColorScheme.ItemId.TextControl_Selected, bkgd: '#c9e2ef', fore: inherit },
            ClickControl: { id: ColorScheme.ItemId.ClickControl, bkgd: 'transparent', fore: '#eaeaea' },
            ClickControl_Disabled: { id: ColorScheme.ItemId.ClickControl_Disabled, bkgd: '#212121', fore: '#9c9c9c' },
            ClickControl_ReadOnly: { id: ColorScheme.ItemId.ClickControl_ReadOnly, bkgd: '#19268d', fore: inherit },
            ClickControl_Missing: { id: ColorScheme.ItemId.ClickControl_Missing, bkgd: '#307d4f', fore: inherit },
            ClickControl_Invalid: { id: ColorScheme.ItemId.ClickControl_Invalid, bkgd: '#9825e3', fore: inherit },
            ClickControl_Valid: { id: ColorScheme.ItemId.ClickControl_Valid, bkgd: inherit, fore: inherit },
            ClickControl_Accepted: { id: ColorScheme.ItemId.ClickControl_Accepted, bkgd: inherit, fore: 'white' },
            ClickControl_Waiting: { id: ColorScheme.ItemId.ClickControl_Waiting, bkgd: inherit, fore: '#fbc665' },
            ClickControl_Warning: { id: ColorScheme.ItemId.ClickControl_Warning, bkgd: inherit, fore: 'orange' },
            ClickControl_Error: { id: ColorScheme.ItemId.ClickControl_Error, bkgd: inherit, fore: 'red' },
            Label: { id: ColorScheme.ItemId.Label, bkgd: 'transparent', fore: 'white' },
            Label_Disabled: { id: ColorScheme.ItemId.Label_Disabled, bkgd: inherit, fore: '#9c9c9c' },
            Label_ReadOnly: { id: ColorScheme.ItemId.Label_ReadOnly, bkgd: '#19268d', fore: inherit },
            Label_Missing: { id: ColorScheme.ItemId.Label_Missing, bkgd: '#307d4f', fore: inherit },
            Label_Invalid: { id: ColorScheme.ItemId.Label_Invalid, bkgd: '#9825e3', fore: inherit },
            Label_Valid: { id: ColorScheme.ItemId.Label_Valid, bkgd: inherit, fore: inherit },
            Label_Accepted: { id: ColorScheme.ItemId.Label_Accepted, bkgd: inherit, fore: inherit },
            Label_Waiting: { id: ColorScheme.ItemId.Label_Waiting, bkgd: inherit, fore: '#fbc665' },
            Label_Warning: { id: ColorScheme.ItemId.Label_Warning, bkgd: inherit, fore: 'orange' },
            Label_Error: { id: ColorScheme.ItemId.Label_Error, bkgd: inherit, fore: 'red' },
            Caution: { id: ColorScheme.ItemId.Caution, bkgd: inherit, fore: '#ff00c2' },
            Caution_UsableButNotGood: { id: ColorScheme.ItemId.Caution_UsableButNotGood, bkgd: inherit, fore: '#ffebd2' },
            Caution_Suspect: { id: ColorScheme.ItemId.Caution_Suspect, bkgd: inherit, fore: 'orange' },
            Caution_Error: { id: ColorScheme.ItemId.Caution_Error, bkgd: inherit, fore: 'red' },
            Text_ControlBorder: { id: ColorScheme.ItemId.Text_ControlBorder, bkgd: inherit, fore: inherit },
            Text_ReadonlyMultiline: { id: ColorScheme.ItemId.Text_ReadonlyMultiline, bkgd: inherit, fore: inherit },
            Text_GreyedOut: { id: ColorScheme.ItemId.Text_GreyedOut, bkgd: inherit, fore: '#7e7e7e' },
            IconButton: { id: ColorScheme.ItemId.IconButton, bkgd: inherit, fore: inherit },
            IconButton_SelectedBorder: { id: ColorScheme.ItemId.IconButton_SelectedBorder, bkgd: inherit, fore: 'red' },
            IconButton_Hover: { id: ColorScheme.ItemId.IconButton_Hover, bkgd: '#504a40', fore: inherit },
            Panel: { id: ColorScheme.ItemId.Panel, bkgd: '#171717', fore: '#EDE2E6' },
            Panel_Hoisted: { id: ColorScheme.ItemId.Panel_Hoisted, bkgd: '#1b1b1b', fore: inherit },
            Panel_Divider: { id: ColorScheme.ItemId.Panel_Divider, bkgd: inherit, fore: '#686869' },
            Panel_Splitter: { id: ColorScheme.ItemId.Panel_Splitter, bkgd: inherit, fore: inherit },
            Panel_ItemHover: { id: ColorScheme.ItemId.Panel_ItemHover, bkgd: '#272727', fore: inherit },
            Unexpected: { id: ColorScheme.ItemId.Unexpected, bkgd: '#D4D3D1', fore: 'black' },
            /* eslint-enable max-len */
        };

        export const items = Object.values(itemsObject);

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function createColorScheme() {
            const scheme = new ColorScheme(name, true);
            for (let i = 0; i < ColorScheme.Item.idCount; i++) {
                scheme.items[i] = items[i];
            }
            return scheme;
        }

        export function initialise() {
            const outOfOrderIdx = items.findIndex((item: ColorScheme.Item, index: Integer) => item.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('ColorSchemePreset.Dark', outOfOrderIdx, items[outOfOrderIdx].id.toString(10));
            }
        }

        /* eslint-disable max-len */
        // News_BodyText: { id: ColorScheme.ItemId.News_BodyText, bkgd: '#201F23', fore: 'White' },
        // Alert_Disabled: { id: ColorScheme.ItemId.Alert_Disabled, bkgd: '#B8B8B8', fore: 'White' },
        // Alert_DisabledAltRow: { id: ColorScheme.ItemId.Alert_DisabledAltRow, bkgd: '#C1C0C0', fore: 'White' },
        // Alert_Invalid: { id: ColorScheme.ItemId.Alert_Invalid, bkgd: '#A769AA', fore: 'White' },
        // Alert_InvalidAltRow: { id: ColorScheme.ItemId.Alert_InvalidAltRow, bkgd: '#A15CA4', fore: 'White' },
        // Alert_InvalidFlashedOn: { id: ColorScheme.ItemId.Alert_InvalidFlashedOn, bkgd: '#AD70B0', fore: 'White' },
        // Alert_InvalidAltRowFlashedOn: { id: ColorScheme.ItemId.Alert_InvalidAltRowFlashedOn, bkgd: '#A562A8', fore: 'White' },
        // Alert_Valid: { id: ColorScheme.ItemId.Alert_Valid, bkgd: '#64FA64', fore: 'White' },
        // Alert_ValidAltRow: { id: ColorScheme.ItemId.Alert_ValidAltRow, bkgd: inherit, fore: 'White' },
        // Alert_ValidFlashedOn: { id: ColorScheme.ItemId.Alert_ValidFlashedOn, bkgd: inherit, fore: 'White' },
        // Alert_ValidAltRowFlashedOn: { id: ColorScheme.ItemId.Alert_ValidAltRowFlashedOn, bkgd: inherit, fore: 'White' },
        // Alert_Expired: { id: ColorScheme.ItemId.Alert_Expired, bkgd: '#4F92CB', fore: 'White' },
        // Alert_ExpiredAltRow: { id: ColorScheme.ItemId.Alert_ExpiredAltRow, bkgd: inherit, fore: 'White' },
        // Alert_ExpiredFlashedOn: { id: ColorScheme.ItemId.Alert_ExpiredFlashedOn, bkgd: inherit, fore: 'White' },
        // Alert_ExpiredAltRowFlashedOn: { id: ColorScheme.ItemId.Alert_ExpiredAltRowFlashedOn, bkgd: inherit, fore: 'White' },
        // Alert_Error: { id: ColorScheme.ItemId.Alert_Error, bkgd: '#8572E2', fore: 'White' },
        // Alert_ErrorAltRow: { id: ColorScheme.ItemId.Alert_ErrorAltRow, bkgd: inherit, fore: 'White' },
        // Alert_ErrorFlashedOn: { id: ColorScheme.ItemId.Alert_ErrorFlashedOn, bkgd: inherit, fore: 'White' },
        // Alert_ErrorAltRowFlashedOn: { id: ColorScheme.ItemId.Alert_ErrorAltRowFlashedOn, bkgd: inherit, fore: 'White' },
        // Alert_Offline: { id: ColorScheme.ItemId.Alert_Offline, bkgd: '#57616A', fore: 'White' },
        // Alert_OfflineAltRow: { id: ColorScheme.ItemId.Alert_OfflineAltRow, bkgd: inherit, fore: 'White' },
        // Alert_OfflineFlashedOn: { id: ColorScheme.ItemId.Alert_OfflineFlashedOn, bkgd: inherit, fore: 'White' },
        // Alert_OfflineAltRowFlashedOn: { id: ColorScheme.ItemId.Alert_OfflineAltRowFlashedOn, bkgd: inherit, fore: 'White' },
        // Alert_Armed: { id: ColorScheme.ItemId.Alert_Armed, bkgd: inherit, fore: '#C8B900' },
        // Alert_ArmedAltRow: { id: ColorScheme.ItemId.Alert_ArmedAltRow, bkgd: inherit, fore: '#FFFFA9' },
        // Alert_ArmedFlashedOn: { id: ColorScheme.ItemId.Alert_ArmedFlashedOn, bkgd: inherit, fore: '#C8B900' },
        // Alert_ArmedAltRowFlashedOn: { id: ColorScheme.ItemId.Alert_ArmedAltRowFlashedOn, bkgd: inherit, fore: '#FFFFA9' },
        // Alert_Fired: { id: ColorScheme.ItemId.Alert_Fired, bkgd: inherit, fore: '#4646FF' },
        // Alert_FiredAltRow: { id: ColorScheme.ItemId.Alert_FiredAltRow, bkgd: inherit, fore: '#784EF5' },
        // Alert_FiredFlashedOn: { id: ColorScheme.ItemId.Alert_FiredFlashedOn, bkgd: inherit, fore: '#4646FF' },
        // Alert_FiredAltRowFlashedOn: { id: ColorScheme.ItemId.Alert_FiredAltRowFlashedOn, bkgd: inherit, fore: '#784EF5' },
        // Alarm_Info: { id: ColorScheme.ItemId.Alarm_Info, bkgd: inherit, fore: inherit },
        // Alarm_InfoAltRow: { id: ColorScheme.ItemId.Alarm_InfoAltRow, bkgd: inherit, fore: inherit },
        // Alarm_InfoFlashedOn: { id: ColorScheme.ItemId.Alarm_InfoFlashedOn, bkgd: inherit, fore: inherit },
        // Alarm_InfoAltRowFlashedOn: { id: ColorScheme.ItemId.Alarm_InfoAltRowFlashedOn, bkgd: inherit, fore: inherit },
        // Alarm_Warning: { id: ColorScheme.ItemId.Alarm_Warning, bkgd: inherit, fore: inherit },
        // Alarm_WarningAltRow: { id: ColorScheme.ItemId.Alarm_WarningAltRow, bkgd: inherit, fore: inherit },
        // Alarm_WarningFlashedOn: { id: ColorScheme.ItemId.Alarm_WarningFlashedOn, bkgd: inherit, fore: inherit },
        // Alarm_WarningAltRowFlashedOn: { id: ColorScheme.ItemId.Alarm_WarningAltRowFlashedOn, bkgd: inherit, fore: inherit },
        // Alarm_Low: { id: ColorScheme.ItemId.Alarm_Low, bkgd: inherit, fore: inherit },
        // Alarm_LowAltRow: { id: ColorScheme.ItemId.Alarm_LowAltRow, bkgd: inherit, fore: inherit },
        // Alarm_LowFlashedOn: { id: ColorScheme.ItemId.Alarm_LowFlashedOn, bkgd: inherit, fore: inherit },
        // Alarm_LowAltRowFlashedOn: { id: ColorScheme.ItemId.Alarm_LowAltRowFlashedOn, bkgd: inherit, fore: inherit },
        // Alarm_Normal: { id: ColorScheme.ItemId.Alarm_Normal, bkgd: inherit, fore: '#FFFFA9' },
        // Alarm_NormalAltRow: { id: ColorScheme.ItemId.Alarm_NormalAltRow, bkgd: inherit, fore: '#FFFFA9' },
        // Alarm_NormalFlashedOn: { id: ColorScheme.ItemId.Alarm_NormalFlashedOn, bkgd: inherit, fore: inherit },
        // Alarm_NormalAltRowFlashedOn: { id: ColorScheme.ItemId.Alarm_NormalAltRowFlashedOn, bkgd: inherit, fore: inherit },
        // Alarm_High: { id: ColorScheme.ItemId.Alarm_High, bkgd: inherit, fore: inherit },
        // Alarm_HighAltRow: { id: ColorScheme.ItemId.Alarm_HighAltRow, bkgd: inherit, fore: inherit },
        // Alarm_HighFlashedOn: { id: ColorScheme.ItemId.Alarm_HighFlashedOn, bkgd: inherit, fore: inherit },
        // Alarm_HighAltRowFlashedOn: { id: ColorScheme.ItemId.Alarm_HighAltRowFlashedOn, bkgd: inherit, fore: inherit },
        // Alarm_Urgent: { id: ColorScheme.ItemId.Alarm_Urgent, bkgd: inherit, fore: '#4646FF' },
        // Alarm_UrgentAltRow: { id: ColorScheme.ItemId.Alarm_UrgentAltRow, bkgd: inherit, fore: '#4646FF' },
        // Alarm_UrgentFlashedOn: { id: ColorScheme.ItemId.Alarm_UrgentFlashedOn, bkgd: inherit, fore: inherit },
        // Alarm_UrgentAltRowFlashedOn: { id: ColorScheme.ItemId.Alarm_UrgentAltRowFlashedOn, bkgd: inherit, fore: inherit },
        // Alarm_Error: { id: ColorScheme.ItemId.Alarm_Error, bkgd: inherit, fore: '#4646FF' },
        // Alarm_ErrorAltRow: { id: ColorScheme.ItemId.Alarm_ErrorAltRow, bkgd: inherit, fore: '#4646FF' },
        // Alarm_ErrorFlashedOn: { id: ColorScheme.ItemId.Alarm_ErrorFlashedOn, bkgd: inherit, fore: inherit },
        // Alarm_ErrorAltRowFlashedOn: { id: ColorScheme.ItemId.Alarm_ErrorAltRowFlashedOn, bkgd: inherit, fore: inherit },
        // TitleBarButton: { id: ColorScheme.ItemId.TitleBarButton, bkgd: 'SkyBlue', fore: '#000001' },
        // AlertsTitleBarButton: { id: ColorScheme.ItemId.AlertsTitleBarButton, bkgd: 'SkyBlue', fore: 'Black' },
        // AlertsTitleBarButton_FlashedOn: { id: ColorScheme.ItemId.AlertsTitleBarButton_FlashedOn, bkgd: '#4646FF', fore: 'Black' },
        // TextDisplay: { id: ColorScheme.ItemId.TextDisplay, bkgd: 'White', fore: 'Black' },
        // TextDisplay_Disabled: { id: ColorScheme.ItemId.TextDisplay_Disabled, bkgd: 'Gray', fore: 'DarkGray' },
        // TextDisplay_Waiting: { id: ColorScheme.ItemId.TextDisplay_Waiting, bkgd: '#E7F1F3', fore: 'Black' },
        // TextDisplay_Info: { id: ColorScheme.ItemId.TextDisplay_Info, bkgd: '#FDFDEB', fore: 'Black' },
        // TextDisplay_Warning: { id: ColorScheme.ItemId.TextDisplay_Warning, bkgd: '#F4CB5A', fore: 'Black' },
        // TextDisplay_Error: { id: ColorScheme.ItemId.TextDisplay_Error, bkgd: '#F65442', fore: 'Black' },
        // TextDisplay_Danger: { id: ColorScheme.ItemId.TextDisplay_Danger, bkgd: '#c23848', fore: 'Black' },
        // OrderPad_Side_Buy: { id: ColorScheme.ItemId.OrderPad_Side_Buy, bkgd: '#C8B900', fore: inherit },
        // OrderPad_Side_Sell: { id: ColorScheme.ItemId.OrderPad_Side_Sell, bkgd: '#784EF5', fore: inherit },
        // OrderPad_Side_Empty: { id: ColorScheme.ItemId.OrderPad_Side_Empty, bkgd: '#C8B900', fore: inherit },
        // OrderPad_Side_Unknown: { id: ColorScheme.ItemId.OrderPad_Side_Unknown, bkgd: '#C8B900', fore: inherit },
        // ApfcOrderStatus_Accepted: { id: ColorScheme.ItemId.ApfcOrderStatus_Accepted, bkgd: inherit, fore: 'White' },
        // ApfcOrderStatus_AcceptedAlt: { id: ColorScheme.ItemId.ApfcOrderStatus_AcceptedAlt, bkgd: inherit, fore: 'White' },
        // ApfcOrderStatus_PartiallyFilled: { id: ColorScheme.ItemId.ApfcOrderStatus_PartiallyFilled, bkgd: inherit, fore: '#FFF375' },
        // ApfcOrderStatus_PartiallyFilledAlt: { id: ColorScheme.ItemId.ApfcOrderStatus_PartiallyFilledAlt, bkgd: inherit, fore: '#FFF375' },
        // ApfcOrderStatus_Filled: { id: ColorScheme.ItemId.ApfcOrderStatus_Filled, bkgd: inherit, fore: '#C8B900' },
        // ApfcOrderStatus_FilledAlt: { id: ColorScheme.ItemId.ApfcOrderStatus_FilledAlt, bkgd: inherit, fore: '#C8B900' },
        // ApfcOrderStatus_Cancelled: { id: ColorScheme.ItemId.ApfcOrderStatus_Cancelled, bkgd: inherit, fore: '#4646FF' },
        // ApfcOrderStatus_CancelledAlt: { id: ColorScheme.ItemId.ApfcOrderStatus_CancelledAlt, bkgd: inherit, fore: '#4646FF' },
        // ApfcOrderStatus_Other: { id: ColorScheme.ItemId.ApfcOrderStatus_Other, bkgd: inherit, fore: '#4646FF' },
        // ApfcOrderStatus_OtherAlt: { id: ColorScheme.ItemId.ApfcOrderStatus_OtherAlt, bkgd: inherit, fore: '#4646FF' },
        // PopupLookup_Id: { id: ColorScheme.ItemId.PopupLookup_Id, bkgd: inherit, fore: inherit },
        // PopupLookup_IdAlt: { id: ColorScheme.ItemId.PopupLookup_IdAlt, bkgd: inherit, fore: inherit },
        // PopupLookup_IdFocused: { id: ColorScheme.ItemId.PopupLookup_IdFocused, bkgd: inherit, fore: inherit },
        // PopupLookup_Description: { id: ColorScheme.ItemId.PopupLookup_Description, bkgd: inherit, fore: inherit },
        // PopupLookup_DescriptionAlt: { id: ColorScheme.ItemId.PopupLookup_DescriptionAlt, bkgd: inherit, fore: inherit },
        // PopupLookup_DescriptionFocused: { id: ColorScheme.ItemId.PopupLookup_DescriptionFocused, bkgd: inherit, fore: inherit },
        // DragImageText: { id: ColorScheme.ItemId.DragImageText, bkgd: inherit, fore: 'White' },
        // WaitingPanel: { id: ColorScheme.ItemId.WaitingPanel, bkgd: inherit, fore: inherit },
        // WaitingBar: { id: ColorScheme.ItemId.WaitingBar, bkgd: 'Aqua', fore: inherit },
        // Highlight: { id: ColorScheme.ItemId.Highlight, bkgd: 'Aqua', fore: inherit },
        /* eslint-enable max-len */
    }

    export function initialiseStatic() {
        Pastel.initialise();
        Dark.initialise();
    }

    export function getLightColorScheme(): ColorScheme.Item[] {
        return Pastel.items;
    }

    export function getDarkColorScheme(): ColorScheme.Item[] {
        return Dark.items;
    }
}
