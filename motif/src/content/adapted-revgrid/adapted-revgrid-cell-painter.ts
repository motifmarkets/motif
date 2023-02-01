import {
    ColorRenderValue,
    ColorScheme,
    ColorSettings,
    CoreSettings,
    CorrectnessId,
    DepthRecord,
    DepthRecordRenderValue,
    HigherLowerId,
    IndexSignatureHack,
    Integer,
    OrderSideId,
    RenderValue,
    SettingsService,
    TextFormatterService,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import {
    CanvasRenderingContext2DEx,
    CellPaintConfig, Halign,
    RevRecordRecentChangeTypeId,
    RevRecordValueRecentChangeTypeId
} from 'revgrid';

const WHITESPACE = /\s\s+/g;

// export const defaultGridCellRendererName = 'default';

export class AdaptedRevgridCellPainter {
    private _coreSettings: CoreSettings;
    private _colorSettings: ColorSettings;

    constructor(settingsService: SettingsService, private readonly _textFormatterService: TextFormatterService) {
        this._coreSettings = settingsService.core;
        this._colorSettings = settingsService.color;
    }

    paint(
        gc: CanvasRenderingContext2DEx,
        config: CellPaintConfig,
        renderValue: RenderValue,
        recordRecentChangeTypeId: RevRecordRecentChangeTypeId | undefined,
        valueRecentChangeTypeId: RevRecordValueRecentChangeTypeId | undefined,
    ): void {
        const rowIndex = config.dataCell.y;
        const altRow = rowIndex % 2 === 1;

        let halign = config.halign;

        let foreColor: string;
        let bkgdColor: string;

        const rowFocused = config.isRowFocused;
        if (rowFocused && this._coreSettings.grid_FocusedRowColored) {
            bkgdColor = this._colorSettings.getBkgd(
                ColorScheme.ItemId.Grid_FocusedRow
            );
        } else {
            bkgdColor = altRow
                ? this._colorSettings.getBkgd(ColorScheme.ItemId.Grid_BaseAlt)
                : this._colorSettings.getBkgd(ColorScheme.ItemId.Grid_Base);
        }

        if (altRow) {
            foreColor = this._colorSettings.getFore(ColorScheme.ItemId.Grid_BaseAlt);
        } else {
            foreColor = this._colorSettings.getFore(ColorScheme.ItemId.Grid_Base);
        }

        let graphicId = GraphicId.None;
        let proportionBarGraphic: ProportionBarGraphic | undefined;

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
                        halign = 'right';
                    } else {
                        halign = 'left';
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
        const foreFont = config.font;
        let internalBorderRowOnly: boolean;

        let internalBorderColor: string | undefined;
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
        const prefillColor = config.prefillColor;
        if (prefillColor !== undefined) {
            bkgdRenderingRequired = prefillColor !== bkgdColor;
            textProcessingRequired = true;
            internalBorderProcessingRequired = true;
        } else {
            const configSnapshot = config.snapshot;
            if (configSnapshot === undefined) {
                bkgdRenderingRequired = true;
                textProcessingRequired = true;
                internalBorderProcessingRequired = true;
            } else {
                const existingSnapshot = configSnapshot as BeingPaintedCellSnapshot;
                if (existingSnapshot.bkgdColor !== bkgdColor) {
                    bkgdRenderingRequired = true;
                    textProcessingRequired = true;
                    internalBorderProcessingRequired = true;
                } else {
                    bkgdRenderingRequired = false;
                    textProcessingRequired =
                        existingSnapshot.foreColor !== foreColor
                        || existingSnapshot.foreText !== foreText
                        || graphicId !== GraphicId.None;
                    internalBorderProcessingRequired =
                        existingSnapshot.internalBorderColor !== internalBorderColor
                        || existingSnapshot.internalBorderRowOnly !== internalBorderRowOnly
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
            const newSnapshot: BeingPaintedCellSnapshot = {
                bkgdColor,
                foreColor,
                internalBorderColor,
                internalBorderRowOnly,
                foreText,
            };

            config.snapshot = newSnapshot;

            const bounds = config.bounds;
            const x = bounds.x;
            const y = bounds.y;
            const width = bounds.width;
            const height = bounds.height;

            if (bkgdRenderingRequired) {
                gc.cache.fillStyle = bkgdColor;
                gc.fillRect(x, y, width, height);
            }

            if (config.isRowSelected && this._coreSettings.grid_FocusedRowBordered) {
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

            let valWidth: Integer;

            if (textProcessingRequired && foreText === '') {
                valWidth = 0;
            } else {
                gc.cache.fillStyle = foreColor;
                gc.cache.font = foreFont;
                valWidth = config.isHeaderRow && config.headerTextWrapping
                    ? renderMultiLineText(gc, config, foreText, cellPadding, cellPadding, halign)
                    : renderSingleLineText(gc, config, foreText, cellPadding, cellPadding, halign);
            }

            const contentWidth = cellPadding + valWidth + cellPadding;
            config.minWidth = contentWidth;
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

interface CellPaintSnapshot {
    bkgdColor: string;
    foreColor: string;
    internalBorderColor: string | undefined;
    internalBorderRowOnly: boolean;
    foreText: string;
}

type BeingPaintedCellSnapshot = IndexSignatureHack<CellPaintSnapshot>;

interface ProportionBarGraphic {
    color: string;
    proportion: number;
}

function renderMultiLineText(
    gc: CanvasRenderingContext2DEx,
    config: CellPaintConfig,
    val: string,
    leftPadding: number,
    rightPadding: number,
    halign: Halign,
) {
    const x = config.bounds.x;
    const y = config.bounds.y;
    const width = config.bounds.width;
    const height = config.bounds.height;
    const cleanVal = (val + '').trim().replace(WHITESPACE, ' '); // trim and squeeze whitespace
    const lines = findLines(gc, config, cleanVal.split(' '), width);

    if (lines.length === 1) {
        return renderSingleLineText(
            gc,
            config,
            cleanVal,
            leftPadding,
            rightPadding,
            halign,
        );
    }

    let halignOffset = leftPadding;
    let valignOffset = config.voffset;
    const textHeight = gc.getTextHeight(config.font).height;

    switch (halign) {
        case 'right':
            halignOffset = width - rightPadding;
            break;
        case 'center':
            halignOffset = width / 2;
            break;
    }

    const hMin = 0;
    const vMin = Math.ceil(textHeight / 2);

    valignOffset += Math.ceil((height - (lines.length - 1) * textHeight) / 2);

    halignOffset = Math.max(hMin, halignOffset);
    valignOffset = Math.max(vMin, valignOffset);

    gc.cache.save(); // define a clipping region for cell
    gc.beginPath();
    gc.rect(x, y, width, height);
    gc.clip();

    gc.cache.textAlign = halign;
    gc.cache.textBaseline = 'middle';

    for (let i = 0; i < lines.length; i++) {
        gc.fillText(
            lines[i],
            x + halignOffset,
            y + valignOffset + (i * textHeight)
        );
    }

    gc.cache.restore(); // discard clipping region

    return width;
}

function renderSingleLineText(
    gc: CanvasRenderingContext2DEx,
    config: CellPaintConfig,
    val: string,
    leftPadding: number,
    rightPadding: number,
    halign: Halign,
) {
    let x = config.bounds.x;
    let y = config.bounds.y;
    const width = config.bounds.width;
    let halignOffset = leftPadding;
    let minWidth: number;
    const rightHaligned = halign === 'right';
    const truncateWidth = width - rightPadding - leftPadding;

    if (config.columnAutosizing) {
        const truncatedResult = gc.getTextWidthTruncated(val, truncateWidth, config.textTruncateType, false, rightHaligned);
        minWidth = truncatedResult.textWidth;
        val = truncatedResult.text ?? val;
        if (halign === 'center') {
            halignOffset = (width - truncatedResult.textWidth) / 2;
        }
    } else {
        const truncatedResult = gc.getTextWidthTruncated(val, truncateWidth, config.textTruncateType, true, rightHaligned);
        minWidth = 0;
        if (truncatedResult.text !== undefined) {
            // not enough space to show the extire text, the text is truncated to fit for the width
            val = truncatedResult.text;
        } else {
            // enought space to show the entire text
            if (halign === 'center') {
                halignOffset = (width - truncatedResult.textWidth) / 2;
            }
        }
    }

    if (val !== null) {
        // the position for x need to be relocated.
        // for canvas to print text, when textAlign is 'end' or 'right'
        // it will start with position x and print the text on the left
        // so the exact position for x need to increase by the acutal width - rightPadding
        x += halign === 'right'
            ? width - rightPadding
            : Math.max(leftPadding, halignOffset);
        y += Math.floor(config.bounds.height / 2);

        if (config.isUserDataArea) {
            if (config.link) {
                if (config.isCellHovered || !config.linkOnHover) {
                    if (config.linkColor) {
                        gc.cache.strokeStyle = config.linkColor;
                    }
                    gc.beginPath();
                    underline(config, gc, val, x, y, 1);
                    gc.stroke();
                    gc.closePath();
                }
                if (config.linkColor && (config.isCellHovered || !config.linkColorOnHover)) {
                    gc.cache.fillStyle = config.linkColor;
                }
            }

            if (config.strikeThrough === true) {
                gc.beginPath();
                strikeThrough(config, gc, val, x, y, 1);
                gc.stroke();
                gc.closePath();
            }
        }

        gc.cache.textAlign = halign === 'right'
            ? 'right'
            : 'left';
        gc.cache.textBaseline = 'middle';
        gc.fillText(val, x, y);
    }

    return minWidth;
}

function findLines(gc: CanvasRenderingContext2DEx, config: CellPaintConfig, words: string[], width: number) {

    if (words.length <= 1) {
        return words;
    } else {
        // starting with just the first word...
        let stillFits: boolean;
        let line = [words.shift() as string]; // cannot be undefined as has at least one entry
        while (
            // so long as line still fits within current column...
            (stillFits = gc.getTextWidth(line.join(' ')) < width)
            // ...AND there are more words available...
            && words.length > 0
        ) {
            // ...add another word to end of line and retest
            line.push(words.shift() as string); // cannot be undefined as words has at least one entry
        }

        if (
            !stillFits && // if line is now too long...
            line.length > 1 // ...AND is multiple words...
        ) {
            words.unshift(line.pop() as string); // ...back off by (i.e., remove) one word
        }

        line = [line.join(' ')];

        if (words.length) {
            // if there's anything left...
            line = line.concat(findLines(gc, config, words, width)); // ...break it up as well
        }

        return line;
    }
}

function strikeThrough(
    config: CellPaintConfig,
    gc: CanvasRenderingContext2DEx,
    text: string,
    x: number,
    y: number,
    thickness: number
) {
    const textWidth = gc.getTextWidth(text);

    switch (gc.cache.textAlign) {
        case 'center':
            x -= textWidth / 2;
            break;
        case 'right':
            x -= textWidth;
            break;
    }

    y = Math.round(y) + 0.5;

    gc.cache.lineWidth = thickness;
    gc.moveTo(x - 1, y);
    gc.lineTo(x + textWidth + 1, y);
}

function underline(
    config: CellPaintConfig,
    gc: CanvasRenderingContext2DEx,
    text: string,
    x: number,
    y: number,
    thickness: number
) {
    const textHeight = gc.getTextHeight(config.font).height;
    const textWidth = gc.getTextWidth(text);

    switch (gc.cache.textAlign) {
        case 'center':
            x -= textWidth / 2;
            break;
        case 'right':
            x -= textWidth;
            break;
    }

    y = Math.ceil(y) + Math.round(textHeight / 2) - 0.5;

    // gc.beginPath();
    gc.cache.lineWidth = thickness;
    gc.moveTo(x, y);
    gc.lineTo(x + textWidth, y);
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
