/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ColorRenderValue,
    ColorScheme,
    ColorSettings,
    CoreSettings,
    CorrectnessId,
    DepthRecord,
    DepthRecordRenderValue,
    GridField,
    HigherLowerId,
    IndexSignatureHack,
    OrderSideId,
    RenderValue,
    SettingsService,
    TextFormatterService,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import {
    CellPainter,
    DataServer,
    DatalessViewCell,
    RevRecordMainDataServer,
    RevRecordRecentChangeTypeId,
    RevRecordValueRecentChangeTypeId,
    StandardTextCellPainter
} from 'revgrid';
import { AdaptedRevgrid } from '../adapted-revgrid';
import { AdaptedRevgridBehavioredColumnSettings, AdaptedRevgridBehavioredGridSettings } from '../settings/content-adapted-revgrid-settings-internal-api';

export abstract class RenderValueTextCellPainter
    extends StandardTextCellPainter<AdaptedRevgridBehavioredGridSettings, AdaptedRevgridBehavioredColumnSettings, GridField>
    implements CellPainter<AdaptedRevgridBehavioredColumnSettings, GridField> {

    protected declare readonly _dataServer: RevRecordMainDataServer<GridField>;

    private _coreSettings: CoreSettings;
    private _colorSettings: ColorSettings;

    constructor(settingsService: SettingsService, private readonly _textFormatterService: TextFormatterService, grid: AdaptedRevgrid, dataServer: DataServer<GridField>) {
        super(grid, dataServer);
        this._coreSettings = settingsService.core;
        this._colorSettings = settingsService.color;
    }

    paintValue(cell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, prefillColor: string | undefined, renderValue: RenderValue): number | undefined {
    //     gc: CanvasRenderingContext2D,
    //     renderValue: RenderValue,
    //     recordRecentChangeTypeId: RevRecordRecentChangeTypeId | undefined,
    //     valueRecentChangeTypeId: RevRecordValueRecentChangeTypeId | undefined,
    // ): void {
        const grid = this._grid;

        const columnSettings = cell.columnSettings;
        this.setColumnSettings(columnSettings);

        const gc = this._renderingContext;
        const subgridRowIndex = cell.viewLayoutRow.subgridRowIndex;

        const altRow = subgridRowIndex % 2 === 1;

        let bkgdColor: string;
        const subgrid = cell.subgrid;
        const isMainSubgrid = subgrid.isMain;
        const rowFocused = isMainSubgrid && grid.focus.isMainSubgridRowFocused(subgridRowIndex);
        if (rowFocused) {
            bkgdColor = this._colorSettings.getBkgd(ColorScheme.ItemId.Grid_FocusedRow);
        } else {
            if (prefillColor === undefined) {
                bkgdColor = this._colorSettings.getBkgd(ColorScheme.ItemId.Grid_Base);
            } else {
                bkgdColor = prefillColor;
            }
        }


        let foreColor: string;
        if (altRow) {
            foreColor = this._colorSettings.getFore(ColorScheme.ItemId.Grid_BaseAlt);
        } else {
            foreColor = this._colorSettings.getFore(ColorScheme.ItemId.Grid_Base);
        }

        let horizontalAlign = columnSettings.horizontalAlign;
        let graphicId = GraphicId.None;
        let proportionBarGraphic: ProportionBarGraphic | undefined;
        const field = cell.viewLayoutColumn.column.field;

        const attributes = renderValue.attributes;

        for (let i = attributes.length - 1; i >= 0; i--) {
            const attribute = attributes[i];
            switch (attribute.id) {
                case RenderValue.AttributeId.Correctness: {
                    const correctnessAttribute =
                        attribute as RenderValue.CorrectnessAttribute;
                    const correctnessId = correctnessAttribute.correctnessId;
                    switch (correctnessId) {
                        case CorrectnessId.Suspect:
                            if (altRow) {
                                foreColor = this._colorSettings.getFore(
                                    ColorScheme.ItemId.Grid_DataSuspectAlt
                                );
                            } else {
                                foreColor = this._colorSettings.getFore(
                                    ColorScheme.ItemId.Grid_DataSuspect
                                );
                            }
                            break;
                        case CorrectnessId.Error:
                            if (altRow) {
                                foreColor = this._colorSettings.getFore(
                                    ColorScheme.ItemId.Grid_DataErrorAlt
                                );
                            } else {
                                foreColor = this._colorSettings.getFore(
                                    ColorScheme.ItemId.Grid_DataError
                                );
                            }
                            break;
                    }
                    break;
                }

                case RenderValue.AttributeId.HigherLower: {
                    const higherLowerAttribute =
                        attribute as RenderValue.HigherLowerAttribute;
                    const higherLowerId = higherLowerAttribute.higherLowerId;
                    switch (higherLowerId) {
                        case HigherLowerId.Higher:
                            foreColor = this._colorSettings.getFore(
                                ColorScheme.ItemId.Grid_UpValue
                            );
                            break;
                        case HigherLowerId.Lower:
                            foreColor = this._colorSettings.getFore(
                                ColorScheme.ItemId.Grid_DownValue
                            );
                            break;
                    }
                    break;
                }

                case RenderValue.AttributeId.BackgroundColor: {
                    if (renderValue instanceof ColorRenderValue) {
                        if (renderValue.isUndefined()) {
                            graphicId = GraphicId.UndefinedColor;
                        } else {
                            if (renderValue.definedData === ColorScheme.schemeInheritColor) {
                                graphicId = GraphicId.InheritColor;
                            } else {
                                bkgdColor = renderValue.definedData;
                            }
                        }
                    }
                    break;
                }

                case RenderValue.AttributeId.DepthRecord: {
                    const depthRecordAttribute = attribute as DepthRecordRenderValue.Attribute;
                    let depthRecordItemId: ColorScheme.ItemId;
                    if (depthRecordAttribute.ownOrder) {
                        depthRecordItemId = altRow ? ColorScheme.ItemId.Grid_MyOrderAlt : ColorScheme.ItemId.Grid_MyOrder;
                    } else {
                        depthRecordItemId =
                            calculateDepthRecordBidAskOrderPriceLevelColorSchemeItemId(
                                depthRecordAttribute.orderSideId,
                                depthRecordAttribute.depthRecordTypeId,
                                altRow
                            );
                    }
                    bkgdColor = this._colorSettings.getBkgd(depthRecordItemId);
                    break;
                }

                case RenderValue.AttributeId.DepthCountXRefField: {
                    const depthCountXRefFieldAttribute = attribute as RenderValue.DepthCountXRefFieldAttribute;
                    if (depthCountXRefFieldAttribute.isCountAndXrefs) {
                        horizontalAlign = 'right';
                    } else {
                        horizontalAlign = 'left';
                    }
                    break;
                }

                case RenderValue.AttributeId.DepthRecordInAuction: {
                    const depthRecordInAuctionAttribute =
                        attribute as RenderValue.DepthRecordInAuctionAttribute;
                    const auctionItemId = altRow ? ColorScheme.ItemId.Grid_PriceSellOverlapAlt : ColorScheme.ItemId.Grid_PriceSellOverlap;
                    if (depthRecordInAuctionAttribute.partialAuctionProportion === undefined) {
                        bkgdColor = this._colorSettings.getBkgd(auctionItemId);
                    } else {
                        graphicId = GraphicId.ProportionBar;
                        proportionBarGraphic = {
                            color: this._colorSettings.getBkgd(auctionItemId),
                            proportion: depthRecordInAuctionAttribute.partialAuctionProportion,
                        };
                    }
                    break;
                }

                case RenderValue.AttributeId.OwnOrder: {
                    // Note that Depth does not use this attribute as it has a custom attribute
                    const ownOrderRecordItemId = altRow ? ColorScheme.ItemId.Grid_MyOrderAlt : ColorScheme.ItemId.Grid_MyOrder;
                    bkgdColor = this._colorSettings.getBkgd(ownOrderRecordItemId);
                    break;
                }

                case RenderValue.AttributeId.Cancelled: {
                    graphicId = GraphicId.LineThrough;
                    break;
                }

                case RenderValue.AttributeId.Canceller:
                case RenderValue.AttributeId.GreyedOut: {
                    foreColor = this._colorSettings.getFore(ColorScheme.ItemId.Grid_GreyedOut);
                    break;
                }

                case RenderValue.AttributeId.Advert: {
                    if (!rowFocused) {
                        bkgdColor = this._colorSettings.getBkgd(ColorScheme.ItemId.Grid_Advert);
                    }
                    break;
                }

                default:
                    throw new UnreachableCaseError('GCRDGCRP333389', attribute.id);
            }
        }

        const foreText = this._textFormatterService.formatRenderValue(renderValue);
        const foreFont = this._gridSettings.font;
        let internalBorderRowOnly: boolean;

        let internalBorderColor: string | undefined;
        const valueRecentChangeTypeId = this._dataServer.getValueRecentChangeTypeId(field, subgridRowIndex);
        if (valueRecentChangeTypeId !== undefined) {
            internalBorderRowOnly = false;
            switch (valueRecentChangeTypeId) {
                case RevRecordValueRecentChangeTypeId.Update:
                    internalBorderColor = this._colorSettings.getFore(ColorScheme.ItemId.Grid_ValueRecentlyModifiedBorder);
                    break;
                case RevRecordValueRecentChangeTypeId.Increase:
                    internalBorderColor = this._colorSettings.getFore(ColorScheme.ItemId.Grid_ValueRecentlyModifiedUpBorder);
                    break;
                case RevRecordValueRecentChangeTypeId.Decrease:
                    internalBorderColor = this._colorSettings.getFore(ColorScheme.ItemId.Grid_ValueRecentlyModifiedDownBorder);
                    break;
                default:
                    throw new UnreachableCaseError('GCPPRVCTU02775', valueRecentChangeTypeId);
            }
        } else {
            const recordRecentChangeTypeId = this._dataServer.getRecordRecentChangeTypeId(subgridRowIndex);
            if (recordRecentChangeTypeId !== undefined) {
                internalBorderRowOnly = true;

                switch (recordRecentChangeTypeId) {
                    case RevRecordRecentChangeTypeId.Update:
                        internalBorderColor = this._colorSettings.getFore(ColorScheme.ItemId.Grid_RowRecordRecentlyChangedBorder);
                        break;
                    case RevRecordRecentChangeTypeId.Insert:
                        internalBorderColor = this._colorSettings.getFore(ColorScheme.ItemId.Grid_RowRecentlyAddedBorder);
                        break;
                    case RevRecordRecentChangeTypeId.Remove:
                        internalBorderColor = undefined;
                        break;
                    default:
                        throw new UnreachableCaseError('TCPPRRCTU02775', recordRecentChangeTypeId);
                }

            } else {
                internalBorderRowOnly = false;
                internalBorderColor = undefined;
            }
        }

        let bkgdRenderingRequired: boolean;
        let textProcessingRequired: boolean;
        let internalBorderProcessingRequired: boolean;
        if (prefillColor !== undefined) {
            bkgdRenderingRequired = prefillColor !== bkgdColor;
            textProcessingRequired = true;
            internalBorderProcessingRequired = true;
        } else {
            const fingerprint = cell.paintFingerprint as PaintFingerprint | undefined;
            if (fingerprint === undefined) {
                bkgdRenderingRequired = true;
                textProcessingRequired = true;
                internalBorderProcessingRequired = true;
            } else {
                if (fingerprint.bkgdColor !== bkgdColor) {
                    bkgdRenderingRequired = true;
                    textProcessingRequired = true;
                    internalBorderProcessingRequired = true;
                } else {
                    bkgdRenderingRequired = false;
                    textProcessingRequired =
                        fingerprint.foreColor !== foreColor
                        || fingerprint.foreText !== foreText
                        || graphicId !== GraphicId.None;
                    internalBorderProcessingRequired =
                        fingerprint.internalBorderColor !== internalBorderColor
                        || fingerprint.internalBorderRowOnly !== internalBorderRowOnly
                        || graphicId !== GraphicId.None;
                }
            }
        }

        if (
            !bkgdRenderingRequired &&
            !textProcessingRequired &&
            !internalBorderProcessingRequired
        ) {
            return undefined;
        } else {
            const newFingerprint: PaintFingerprint = {
                bkgdColor,
                foreColor,
                internalBorderColor,
                internalBorderRowOnly,
                foreText,
            };

            cell.paintFingerprint = newFingerprint;

            const bounds = cell.bounds;
            const x = bounds.x;
            const y = bounds.y;
            const width = bounds.width;
            const height = bounds.height;

            if (bkgdRenderingRequired) {
                gc.cache.fillStyle = bkgdColor;
                gc.fillRect(x, y, width, height);
            }

            if (rowFocused && this._coreSettings.grid_FocusedRowBordered) {
                const borderWidth = this._coreSettings.grid_FocusedRowBorderWidth;
                gc.cache.strokeStyle = this._colorSettings.getBkgd(ColorScheme.ItemId.Grid_FocusedRowBorder);
                gc.cache.lineWidth = borderWidth;
                const midOffset = borderWidth / 2;
                gc.beginPath();
                gc.moveTo(x, y + midOffset);
                gc.lineTo(x + width, y + midOffset);
                gc.stroke();

                gc.beginPath();
                gc.moveTo(x, y + height - midOffset);
                gc.lineTo(x + width, y + height - midOffset);
                gc.stroke();
            }

            if (
                internalBorderProcessingRequired &&
                internalBorderColor !== undefined
            ) {
                gc.cache.strokeStyle = internalBorderColor;
                gc.cache.lineWidth = 1;
                if (internalBorderRowOnly) {
                    gc.beginPath();
                    gc.moveTo(x, y + 0.5);
                    gc.lineTo(x + width, y + 0.5);
                    gc.stroke();

                    gc.beginPath();
                    gc.moveTo(x, y + height - 0.5);
                    gc.lineTo(x + width, y + height - 0.5);
                    gc.stroke();
                } else {
                    gc.beginPath();
                    gc.strokeRect(x + 0.5, y + 0.5, width - 2, height - 2);
                }
            }

            const cellPadding = this._coreSettings.grid_CellPadding;

            if (graphicId !== GraphicId.None) {
                switch (graphicId) {
                    case GraphicId.UndefinedColor: {
                        const paddedLeftX = x + cellPadding;
                        const paddedRightX = x + width - cellPadding;
                        const paddedTopY = y + cellPadding;
                        const paddedBottomY = y + height - cellPadding;

                        gc.cache.strokeStyle = foreColor;
                        gc.beginPath();
                        gc.moveTo(paddedLeftX, paddedTopY);
                        gc.lineTo(paddedRightX, paddedBottomY);
                        gc.stroke();
                        gc.beginPath();
                        gc.moveTo(paddedRightX, paddedTopY);
                        gc.lineTo(paddedLeftX, paddedBottomY);
                        gc.stroke();
                        break;
                    }

                    case GraphicId.InheritColor: {
                        const inheritColorCenterY = y + height / 2 - 0.5;

                        gc.cache.strokeStyle = foreColor;
                        gc.beginPath();
                        gc.moveTo(x + cellPadding + 2, inheritColorCenterY);
                        gc.lineTo(
                            x + width - cellPadding - 2,
                            inheritColorCenterY
                        );
                        gc.stroke();
                        break;
                    }

                    case GraphicId.ProportionBar: {
                        if (proportionBarGraphic !== undefined) {
                            const barWidth =
                                proportionBarGraphic.proportion * width;
                            gc.cache.fillStyle = proportionBarGraphic.color;
                            gc.fillRect(x, y, barWidth, height);
                        }
                        break;
                    }

                    case GraphicId.LineThrough: {
                        const lineThroughcenterY = y + height / 2 - 0.5;

                        gc.cache.strokeStyle = foreColor;
                        gc.beginPath();
                        gc.moveTo(x, lineThroughcenterY);
                        gc.lineTo(x + width, lineThroughcenterY);
                        gc.stroke();
                        break;
                    }

                    default:
                        throw new UnreachableCaseError(
                            'GCRDGCRP2284',
                            graphicId
                        );
                }
            }

            if (!textProcessingRequired) {
                return undefined;
            } else {
                gc.cache.fillStyle = foreColor;
                gc.cache.font = foreFont;
                return this.renderSingleLineText(bounds, foreText, cellPadding, cellPadding, horizontalAlign);
            }
        }
    }
}

const enum GraphicId {
    None,
    UndefinedColor,
    InheritColor,
    ProportionBar,
    LineThrough,
}

interface PaintFingerprintInterface {
    bkgdColor: string;
    foreColor: string;
    internalBorderColor: string | undefined;
    internalBorderRowOnly: boolean;
    foreText: string;
}

type PaintFingerprint = IndexSignatureHack<PaintFingerprintInterface>;

interface ProportionBarGraphic {
    color: string;
    proportion: number;
}
export function calculateDepthRecordBidAskOrderPriceLevelColorSchemeItemId(
    sideId: OrderSideId,
    typeId: DepthRecord.TypeId,
    altRow: boolean
) {
    switch (sideId) {
        case OrderSideId.Bid:
            switch (typeId) {
                case DepthRecord.TypeId.Order:
                    if (altRow) {
                        return ColorScheme.ItemId.Grid_OrderBuyAlt;
                    } else {
                        return ColorScheme.ItemId.Grid_OrderBuy;
                    }
                case DepthRecord.TypeId.PriceLevel:
                    if (altRow) {
                        return ColorScheme.ItemId.Grid_PriceBuyAlt;
                    } else {
                        return ColorScheme.ItemId.Grid_PriceBuy;
                    }
                default:
                    throw new UnreachableCaseError(
                        'GCRCDRBAOPLCSIIB23467',
                        typeId
                    );
            }

        case OrderSideId.Ask:
            switch (typeId) {
                case DepthRecord.TypeId.Order:
                    if (altRow) {
                        return ColorScheme.ItemId.Grid_OrderSellAlt;
                    } else {
                        return ColorScheme.ItemId.Grid_OrderSell;
                    }
                case DepthRecord.TypeId.PriceLevel:
                    if (altRow) {
                        return ColorScheme.ItemId.Grid_PriceSellAlt;
                    } else {
                        return ColorScheme.ItemId.Grid_PriceSell;
                    }
                default:
                    throw new UnreachableCaseError(
                        'GCRCDRBAOPLCSIIA22985',
                        typeId
                    );
            }

        default:
            throw new UnreachableCaseError('GCRCDRBAOPLCSII11187', sideId);
    }
}
