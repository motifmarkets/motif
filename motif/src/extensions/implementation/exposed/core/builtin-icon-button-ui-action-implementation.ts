/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IconButtonUiAction, UnreachableCaseError } from '@motifmarkets/motif-core';
import { ApiError as ApiErrorApi, BuiltinIconButtonUiAction as BuiltinIconButtonUiActionApi } from '../../../api/extension-api';
import { UnreachableCaseApiErrorImplementation } from '../sys/internal-api';
import { ButtonUiActionImplementation } from './button-ui-action-implementation';

export class BuiltinIconButtonUiActionImplementation extends ButtonUiActionImplementation implements BuiltinIconButtonUiActionApi {
    constructor(private readonly _iconButtonActual: IconButtonUiAction) {
        super(_iconButtonActual);
    }

    get iconButtonActual() { return this._iconButtonActual; }

    public get iconId() { return BuiltinIconButtonUiActionImplementation.IconId.toApi(this._iconButtonActual.iconId); }

    pushIcon(iconId: BuiltinIconButtonUiActionApi.IconId) {
        const iconIdHandle = BuiltinIconButtonUiActionImplementation.IconId.fromApi(iconId);
        this._iconButtonActual.pushIcon(iconIdHandle);
    }
}

export namespace BuiltinIconButtonUiActionImplementation {
    export namespace IconId {
        export function toApi(value: IconButtonUiAction.IconId): BuiltinIconButtonUiActionApi.IconId {
            switch (value) {
                case IconButtonUiAction.IconId.Blankest: return BuiltinIconButtonUiActionApi.IconIdEnum.Blankest;
                case IconButtonUiAction.IconId.PrimaryDitemFrame: return BuiltinIconButtonUiActionApi.IconIdEnum.PrimaryDitemFrame;
                case IconButtonUiAction.IconId.SymbolLink: return BuiltinIconButtonUiActionApi.IconIdEnum.SymbolLink;
                case IconButtonUiAction.IconId.AccountGroupLink: return BuiltinIconButtonUiActionApi.IconIdEnum.AccountGroupLink;
                case IconButtonUiAction.IconId.SubWindowReturn: return BuiltinIconButtonUiActionApi.IconIdEnum.SubWindowReturn;
                case IconButtonUiAction.IconId.CopyToClipboard: return BuiltinIconButtonUiActionApi.IconIdEnum.CopyToClipboard;
                case IconButtonUiAction.IconId.Execute: return BuiltinIconButtonUiActionApi.IconIdEnum.Execute;
                case IconButtonUiAction.IconId.BuyOrderPad: return BuiltinIconButtonUiActionApi.IconIdEnum.BuyOrderPad;
                case IconButtonUiAction.IconId.SellOrderPad: return BuiltinIconButtonUiActionApi.IconIdEnum.SellOrderPad;
                case IconButtonUiAction.IconId.AmendOrderPad: return BuiltinIconButtonUiActionApi.IconIdEnum.AmendOrderPad;
                case IconButtonUiAction.IconId.CancelOrderPad: return BuiltinIconButtonUiActionApi.IconIdEnum.CancelOrderPad;
                case IconButtonUiAction.IconId.MoveOrderPad: return BuiltinIconButtonUiActionApi.IconIdEnum.MoveOrderPad;
                case IconButtonUiAction.IconId.SelectColumns: return BuiltinIconButtonUiActionApi.IconIdEnum.SelectColumns;
                case IconButtonUiAction.IconId.AutoSizeColumnWidths: return BuiltinIconButtonUiActionApi.IconIdEnum.AutoSizeColumnWidths;
                case IconButtonUiAction.IconId.RollUp: return BuiltinIconButtonUiActionApi.IconIdEnum.RollUp;
                case IconButtonUiAction.IconId.RollDown: return BuiltinIconButtonUiActionApi.IconIdEnum.RollDown;
                case IconButtonUiAction.IconId.Filter: return BuiltinIconButtonUiActionApi.IconIdEnum.Filter;
                case IconButtonUiAction.IconId.Save: return BuiltinIconButtonUiActionApi.IconIdEnum.Save;
                case IconButtonUiAction.IconId.DeleteSymbol: return BuiltinIconButtonUiActionApi.IconIdEnum.DeleteSymbol;
                case IconButtonUiAction.IconId.NewWatchlist: return BuiltinIconButtonUiActionApi.IconIdEnum.NewWatchlist;
                case IconButtonUiAction.IconId.OpenWatchlist: return BuiltinIconButtonUiActionApi.IconIdEnum.OpenWatchlist;
                case IconButtonUiAction.IconId.SaveWatchlist: return BuiltinIconButtonUiActionApi.IconIdEnum.SaveWatchlist;
                case IconButtonUiAction.IconId.Lighten: return BuiltinIconButtonUiActionApi.IconIdEnum.Lighten;
                case IconButtonUiAction.IconId.Darken: return BuiltinIconButtonUiActionApi.IconIdEnum.Darken;
                case IconButtonUiAction.IconId.Brighten: return BuiltinIconButtonUiActionApi.IconIdEnum.Brighten;
                case IconButtonUiAction.IconId.Complement: return BuiltinIconButtonUiActionApi.IconIdEnum.Complement;
                case IconButtonUiAction.IconId.Saturate: return BuiltinIconButtonUiActionApi.IconIdEnum.Saturate;
                case IconButtonUiAction.IconId.Desaturate: return BuiltinIconButtonUiActionApi.IconIdEnum.Desaturate;
                case IconButtonUiAction.IconId.SpinColor: return BuiltinIconButtonUiActionApi.IconIdEnum.SpinColor;
                case IconButtonUiAction.IconId.CopyColor: return BuiltinIconButtonUiActionApi.IconIdEnum.CopyColor;
                case IconButtonUiAction.IconId.ReturnOk: return BuiltinIconButtonUiActionApi.IconIdEnum.ReturnOk;
                case IconButtonUiAction.IconId.ReturnCancel: return BuiltinIconButtonUiActionApi.IconIdEnum.ReturnCancel;
                case IconButtonUiAction.IconId.SearchNext: return BuiltinIconButtonUiActionApi.IconIdEnum.SearchNext;
                case IconButtonUiAction.IconId.CancelSearch: return BuiltinIconButtonUiActionApi.IconIdEnum.CancelSearch;
                case IconButtonUiAction.IconId.MoveUp: return BuiltinIconButtonUiActionApi.IconIdEnum.MoveUp;
                case IconButtonUiAction.IconId.MoveToTop: return BuiltinIconButtonUiActionApi.IconIdEnum.MoveToTop;
                case IconButtonUiAction.IconId.MoveDown: return BuiltinIconButtonUiActionApi.IconIdEnum.MoveDown;
                case IconButtonUiAction.IconId.MoveToBottom: return BuiltinIconButtonUiActionApi.IconIdEnum.MoveToBottom;
                case IconButtonUiAction.IconId.NotHistorical: return BuiltinIconButtonUiActionApi.IconIdEnum.NotHistorical;
                case IconButtonUiAction.IconId.Historical: return BuiltinIconButtonUiActionApi.IconIdEnum.Historical;
                case IconButtonUiAction.IconId.HistoricalCompare: return BuiltinIconButtonUiActionApi.IconIdEnum.HistoricalCompare;
                case IconButtonUiAction.IconId.Details: return BuiltinIconButtonUiActionApi.IconIdEnum.Details;
                case IconButtonUiAction.IconId.ToggleSearchTermNotExchangedMarketProcessed:
                    return BuiltinIconButtonUiActionApi.IconIdEnum.ToggleSearchTermNotExchangedMarketProcessed;
                default: throw new UnreachableCaseError('BIBUAITAU09992223', value);
            }
        }

        export function fromApi(value: BuiltinIconButtonUiActionApi.IconId): IconButtonUiAction.IconId {
            const enumValue = value as BuiltinIconButtonUiActionApi.IconIdEnum;
            switch (enumValue) {
                case BuiltinIconButtonUiActionApi.IconIdEnum.Blankest: return IconButtonUiAction.IconId.Blankest;
                case BuiltinIconButtonUiActionApi.IconIdEnum.PrimaryDitemFrame: return IconButtonUiAction.IconId.PrimaryDitemFrame;
                case BuiltinIconButtonUiActionApi.IconIdEnum.SymbolLink: return IconButtonUiAction.IconId.SymbolLink;
                case BuiltinIconButtonUiActionApi.IconIdEnum.AccountGroupLink: return IconButtonUiAction.IconId.AccountGroupLink;
                case BuiltinIconButtonUiActionApi.IconIdEnum.SubWindowReturn: return IconButtonUiAction.IconId.SubWindowReturn;
                case BuiltinIconButtonUiActionApi.IconIdEnum.CopyToClipboard: return IconButtonUiAction.IconId.CopyToClipboard;
                case BuiltinIconButtonUiActionApi.IconIdEnum.Execute: return IconButtonUiAction.IconId.Execute;
                case BuiltinIconButtonUiActionApi.IconIdEnum.BuyOrderPad: return IconButtonUiAction.IconId.BuyOrderPad;
                case BuiltinIconButtonUiActionApi.IconIdEnum.SellOrderPad: return IconButtonUiAction.IconId.SellOrderPad;
                case BuiltinIconButtonUiActionApi.IconIdEnum.AmendOrderPad: return IconButtonUiAction.IconId.AmendOrderPad;
                case BuiltinIconButtonUiActionApi.IconIdEnum.CancelOrderPad: return IconButtonUiAction.IconId.CancelOrderPad;
                case BuiltinIconButtonUiActionApi.IconIdEnum.MoveOrderPad: return IconButtonUiAction.IconId.MoveOrderPad;
                case BuiltinIconButtonUiActionApi.IconIdEnum.SelectColumns: return IconButtonUiAction.IconId.SelectColumns;
                case BuiltinIconButtonUiActionApi.IconIdEnum.AutoSizeColumnWidths: return IconButtonUiAction.IconId.AutoSizeColumnWidths;
                case BuiltinIconButtonUiActionApi.IconIdEnum.RollUp: return IconButtonUiAction.IconId.RollUp;
                case BuiltinIconButtonUiActionApi.IconIdEnum.RollDown: return IconButtonUiAction.IconId.RollDown;
                case BuiltinIconButtonUiActionApi.IconIdEnum.Filter: return IconButtonUiAction.IconId.Filter;
                case BuiltinIconButtonUiActionApi.IconIdEnum.Save: return IconButtonUiAction.IconId.Save;
                case BuiltinIconButtonUiActionApi.IconIdEnum.DeleteSymbol: return IconButtonUiAction.IconId.DeleteSymbol;
                case BuiltinIconButtonUiActionApi.IconIdEnum.NewWatchlist: return IconButtonUiAction.IconId.NewWatchlist;
                case BuiltinIconButtonUiActionApi.IconIdEnum.OpenWatchlist: return IconButtonUiAction.IconId.OpenWatchlist;
                case BuiltinIconButtonUiActionApi.IconIdEnum.SaveWatchlist: return IconButtonUiAction.IconId.SaveWatchlist;
                case BuiltinIconButtonUiActionApi.IconIdEnum.Lighten: return IconButtonUiAction.IconId.Lighten;
                case BuiltinIconButtonUiActionApi.IconIdEnum.Darken: return IconButtonUiAction.IconId.Darken;
                case BuiltinIconButtonUiActionApi.IconIdEnum.Brighten: return IconButtonUiAction.IconId.Brighten;
                case BuiltinIconButtonUiActionApi.IconIdEnum.Complement: return IconButtonUiAction.IconId.Complement;
                case BuiltinIconButtonUiActionApi.IconIdEnum.Saturate: return IconButtonUiAction.IconId.Saturate;
                case BuiltinIconButtonUiActionApi.IconIdEnum.Desaturate: return IconButtonUiAction.IconId.Desaturate;
                case BuiltinIconButtonUiActionApi.IconIdEnum.SpinColor: return IconButtonUiAction.IconId.SpinColor;
                case BuiltinIconButtonUiActionApi.IconIdEnum.CopyColor: return IconButtonUiAction.IconId.CopyColor;
                case BuiltinIconButtonUiActionApi.IconIdEnum.ReturnOk: return IconButtonUiAction.IconId.ReturnOk;
                case BuiltinIconButtonUiActionApi.IconIdEnum.ReturnCancel: return IconButtonUiAction.IconId.ReturnCancel;
                case BuiltinIconButtonUiActionApi.IconIdEnum.SearchNext: return IconButtonUiAction.IconId.SearchNext;
                case BuiltinIconButtonUiActionApi.IconIdEnum.CancelSearch: return IconButtonUiAction.IconId.CancelSearch;
                case BuiltinIconButtonUiActionApi.IconIdEnum.MoveUp: return IconButtonUiAction.IconId.MoveUp;
                case BuiltinIconButtonUiActionApi.IconIdEnum.MoveToTop: return IconButtonUiAction.IconId.MoveToTop;
                case BuiltinIconButtonUiActionApi.IconIdEnum.MoveDown: return IconButtonUiAction.IconId.MoveDown;
                case BuiltinIconButtonUiActionApi.IconIdEnum.MoveToBottom: return IconButtonUiAction.IconId.MoveToBottom;
                case BuiltinIconButtonUiActionApi.IconIdEnum.NotHistorical: return IconButtonUiAction.IconId.NotHistorical;
                case BuiltinIconButtonUiActionApi.IconIdEnum.Historical: return IconButtonUiAction.IconId.Historical;
                case BuiltinIconButtonUiActionApi.IconIdEnum.HistoricalCompare: return IconButtonUiAction.IconId.HistoricalCompare;
                case BuiltinIconButtonUiActionApi.IconIdEnum.Details: return IconButtonUiAction.IconId.Details;
                case BuiltinIconButtonUiActionApi.IconIdEnum.ToggleSearchTermNotExchangedMarketProcessed:
                    return IconButtonUiAction.IconId.ToggleSearchTermNotExchangedMarketProcessed;
                default:
                    throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidBuiltinIconButtonUiActionIconId, enumValue);
            }
        }
    }
}
