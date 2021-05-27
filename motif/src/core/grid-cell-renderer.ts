/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevgridCellRenderConfig, RevgridCellRenderer } from '@motifmarkets/revgrid';
import { CanvasRenderingContext2DEx, CellRenderConfig } from 'fin-hypergrid';
import { BidAskSideId, HigherLowerId } from 'src/adi/internal-api';
import { CorrectnessId, Integer, UnreachableCaseError } from 'src/sys/internal-api';
import { ColorScheme } from './color-scheme';
import { DepthRecord } from './depth-record';
import { ColorRenderValue, RenderValue } from './render-value';
import { ColorSettings } from './settings/color-settings';
import { CoreSettings } from './settings/core-settings';
import { textFormatter } from './text-formatter';

const WHITESPACE = /\s\s+/g;

export const defaultGridCellRendererName = 'default';

export function defaultGridCellRenderPaint(this: RevgridCellRenderer, gc: CanvasRenderingContext2DEx,
    config: RevgridCellRenderConfig): number | undefined {
    const renderValue = config.value as RenderValue;

    const rowIndex = config.dataCell.y;
    const altRow = (rowIndex % 2) === 1;

    let halign = config.halign;

    let foreColor: string;
    let bkgdColor: string;

    const rowFocused = config.isRowFocused;
    if (rowFocused && coreSettings.grid_FocusedRowColored) {
        bkgdColor = colorSettings.getBkgd(ColorScheme.ItemId.Grid_FocusedRow);
    } else {
        bkgdColor = altRow ? colorSettings.getBkgd(ColorScheme.ItemId.Grid_BaseAlt) :
                             colorSettings.getBkgd(ColorScheme.ItemId.Grid_Base);
    }

    if (altRow) {
        foreColor = colorSettings.getFore(ColorScheme.ItemId.Grid_BaseAlt);
    } else {
        foreColor = colorSettings.getFore(ColorScheme.ItemId.Grid_Base);
    }

    let graphicId = GraphicId.None;
    let proportionBarGraphic: ProportionBarGraphic | undefined;

    const attributes = renderValue.attributes;

    for (let i = attributes.length - 1; i >= 0; i--) {
        const attribute = attributes[i];
        switch (attribute.id) {
            case RenderValue.AttributeId.Correctness:
                const correctnessAttribute = attribute as RenderValue.CorrectnessAttribute;
                const correctnessId = correctnessAttribute.correctnessId;
                switch (correctnessId) {
                    case CorrectnessId.Suspect:
                        if (altRow) {
                            foreColor = colorSettings.getFore(ColorScheme.ItemId.Grid_DataSuspectAlt);
                        } else {
                            foreColor = colorSettings.getFore(ColorScheme.ItemId.Grid_DataSuspect);
                        }
                        break;
                    case CorrectnessId.Error:
                        if (altRow) {
                            foreColor = colorSettings.getFore(ColorScheme.ItemId.Grid_DataErrorAlt);
                        } else {
                            foreColor = colorSettings.getFore(ColorScheme.ItemId.Grid_DataError);
                        }
                        break;
                }
                break;

            case RenderValue.AttributeId.HigherLower:
                const higherLowerAttribute = attribute as RenderValue.HigherLowerAttribute;
                const higherLowerId = higherLowerAttribute.higherLowerId;
                switch (higherLowerId) {
                    case HigherLowerId.Higher:
                        foreColor = colorSettings.getFore(ColorScheme.ItemId.Grid_UpValue);
                        break;
                    case HigherLowerId.Lower:
                        foreColor = colorSettings.getFore(ColorScheme.ItemId.Grid_DownValue);
                        break;
                }
                break;

            case RenderValue.AttributeId.BackgroundColor:
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

            case RenderValue.AttributeId.DepthRecord:
                const depthRecordAttribute = attribute as RenderValue.DepthRecordAttribute;
                let depthRecordItemId: ColorScheme.ItemId;
                if (depthRecordAttribute.ownOrder) {
                    depthRecordItemId = (altRow) ? ColorScheme.ItemId.Grid_MyOrderAlt : ColorScheme.ItemId.Grid_MyOrder;
                } else {
                    depthRecordItemId = calculateDepthRecordBidAskOrderPriceLevelColorSchemeItemId(
                        depthRecordAttribute.bidAskSideId,
                        depthRecordAttribute.depthRecordTypeId,
                        altRow
                    );
                }
                bkgdColor = colorSettings.getBkgd(depthRecordItemId);
                break;

            case RenderValue.AttributeId.DepthCountXRefField:
                const depthCountXRefFieldAttribute = attribute as RenderValue.DepthCountXRefFieldAttribute;
                if (depthCountXRefFieldAttribute.isCountAndXrefs) {
                    halign = 'right';
                } else {
                    halign = 'left';
                }
                break;

            case RenderValue.AttributeId.DepthRecordInAuction:
                const depthRecordInAuctionAttribute = attribute as RenderValue.DepthRecordInAuctionAttribute;
                const auctionItemId = (altRow) ? ColorScheme.ItemId.Grid_PriceSellOverlapAlt : ColorScheme.ItemId.Grid_PriceSellOverlap;
                if (depthRecordInAuctionAttribute.partialAuctionProportion === undefined) {
                    bkgdColor = colorSettings.getBkgd(auctionItemId);
                } else {
                    graphicId = GraphicId.ProportionBar;
                    proportionBarGraphic = {
                        color: colorSettings.getBkgd(auctionItemId),
                        proportion: depthRecordInAuctionAttribute.partialAuctionProportion,
                    };
                }
                break;

            case RenderValue.AttributeId.OwnOrder:
                // Note that Depth does not use this attribute as it has a custom attribute
                const ownOrderRecordItemId = (altRow) ? ColorScheme.ItemId.Grid_MyOrderAlt : ColorScheme.ItemId.Grid_MyOrder;
                bkgdColor = colorSettings.getBkgd(ownOrderRecordItemId);
                break;

            case RenderValue.AttributeId.Cancelled:
                graphicId = GraphicId.LineThrough;
                break;

            case RenderValue.AttributeId.Canceller:
            case RenderValue.AttributeId.GreyedOut:
                foreColor = colorSettings.getFore(ColorScheme.ItemId.Grid_GreyedOut);
                break;

            default:
                throw new UnreachableCaseError('GCRDGCRP333389', attribute.id);
        }
    }

    const foreText = textFormatter.formatRenderValue(renderValue);
    const foreFont = config.font;
    const internalBorderColor = config.internalBorder;

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
            const existingSnapshot = configSnapshot as CellRenderSnapshot;
            if (existingSnapshot.bkgdColor !== bkgdColor) {
                bkgdRenderingRequired = true;
                textProcessingRequired = true;
                internalBorderProcessingRequired = true;
            } else {
                bkgdRenderingRequired = false;
                textProcessingRequired =
                    existingSnapshot.foreColor !== foreColor || existingSnapshot.foreText !== foreText || graphicId !== GraphicId.None;
                internalBorderProcessingRequired =
                    existingSnapshot.internalBorderColor !== internalBorderColor || graphicId !== GraphicId.None;
            }
        }
    }

    if (!bkgdRenderingRequired && !textProcessingRequired && !internalBorderProcessingRequired) {
        return undefined;
    } else {
        const newSnapshot: CellRenderSnapshot = {
            bkgdColor,
            foreColor,
            internalBorderColor,
            foreText
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

        if (config.isRowSelected && coreSettings.grid_FocusedRowBordered) {
            const borderWidth = coreSettings.grid_FocusedRowBorderWidth;
            gc.strokeStyle = colorSettings.getBkgd(ColorScheme.ItemId.Grid_FocusedRowBorder);
            gc.lineWidth = borderWidth;
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

        if (internalBorderProcessingRequired && internalBorderColor !== undefined) {
            gc.strokeStyle = internalBorderColor;
            gc.beginPath();
            gc.lineWidth = 1;
            gc.strokeRect(x + 0.5, y + 0.5, width - 2, height - 2);
        }

        const cellPadding = coreSettings.grid_CellPadding;

        if (graphicId !== GraphicId.None) {
            switch (graphicId) {
                case GraphicId.UndefinedColor:
                    const paddedLeftX = x + cellPadding;
                    const paddedRightX = x + width - cellPadding;
                    const paddedTopY = y + cellPadding;
                    const paddedBottomY = y + height - cellPadding;

                    gc.strokeStyle = foreColor;
                    gc.beginPath();
                    gc.moveTo(paddedLeftX, paddedTopY);
                    gc.lineTo(paddedRightX, paddedBottomY);
                    gc.stroke();
                    gc.beginPath();
                    gc.moveTo(paddedRightX, paddedTopY);
                    gc.lineTo(paddedLeftX, paddedBottomY);
                    gc.stroke();
                    break;

                case GraphicId.InheritColor:
                    const inheritColorCenterY = y + height / 2 - 0.5;

                    gc.strokeStyle = foreColor;
                    gc.beginPath();
                    gc.moveTo(x + cellPadding + 2, inheritColorCenterY);
                    gc.lineTo(x + width - cellPadding - 2, inheritColorCenterY);
                    gc.stroke();
                    break;

                case GraphicId.ProportionBar:
                    if (proportionBarGraphic !== undefined) {
                        const barWidth = proportionBarGraphic.proportion * width;
                        gc.cache.fillStyle = proportionBarGraphic.color;
                        gc.fillRect(x, y, barWidth, height);
                    }
                    break;

                case GraphicId.LineThrough:
                    const lineThroughcenterY = y + height / 2 - 0.5;

                    gc.strokeStyle = foreColor;
                    gc.beginPath();
                    gc.moveTo(x, lineThroughcenterY);
                    gc.lineTo(x + width, lineThroughcenterY);
                    gc.stroke();
                    break;

                default:
                    throw new UnreachableCaseError('GCRDGCRP2284', graphicId);
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        let valWidth: Integer;

        if (textProcessingRequired && foreText === '') {
            valWidth = 0;
        } else {
            gc.cache.fillStyle = foreColor;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            gc.cache.font = foreFont!;
            valWidth = config.isHeaderRow && config.headerTextWrapping
                ? renderMultiLineText(gc, config, foreText, cellPadding, cellPadding, halign)
                : renderSingleLineText(gc, config, foreText, cellPadding, cellPadding, halign);
        }

        const contentWidth = cellPadding + valWidth + cellPadding;
        config.minWidth = contentWidth;
        return contentWidth;
    }
}

const enum GraphicId {
    None,
    UndefinedColor,
    InheritColor,
    ProportionBar,
    LineThrough,
}

type Halign = 'left' | 'right' | 'center' | 'start' | 'end' | undefined; // must match Fin-Hypergrid definition

interface CellRenderSnapshot {
    bkgdColor: string;
    foreColor: string;
    internalBorderColor: string | undefined;
    foreText: string;
}

interface ProportionBarGraphic {
    color: string;
    proportion: number;
}

function renderMultiLineText(gc: CanvasRenderingContext2DEx, config: CellRenderConfig, val: string,
    leftPadding: number, rightPadding: number, halign: Halign) {
    const x = config.bounds.x;
    const y = config.bounds.y;
    const width = config.bounds.width;
    const height = config.bounds.height;
    const cleanVal = (val + '').trim().replace(WHITESPACE, ' '); // trim and squeeze whitespace
    const lines = findLines(gc, config, cleanVal.split(' '), width);

    if (lines.length === 1) {
        return renderSingleLineText(gc, config, cleanVal, leftPadding, rightPadding, halign);
    }

    let halignOffset = leftPadding;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let valignOffset = config.voffset!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const textHeight = gc.getTextHeight(config.font!).height;

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

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    gc.cache.textAlign = halign!;
    gc.cache.textBaseline = 'middle';

    for (let i = 0; i < lines.length; i++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        gc.simpleText(lines[i]!, x + halignOffset, y + valignOffset + (i * textHeight));
    }

    gc.cache.restore(); // discard clipping region

    return width;
}

function renderSingleLineText(gc: CanvasRenderingContext2DEx, config: CellRenderConfig, val: string,
    leftPadding: number, rightPadding: number, halign: Halign) {
    let x = config.bounds.x;
    let y = config.bounds.y;
    const width = config.bounds.width;
    let halignOffset = leftPadding;
    let minWidth: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let metrics: any;

    if (config.columnAutosizing) {
        metrics = gc.getTextWidthTruncated(val, width - leftPadding, config.truncateTextWithEllipsis);
        minWidth = metrics.width;
        val = metrics.string || val;
        switch (halign) {
            case 'right':
                halignOffset = width - rightPadding - metrics.width;
                break;
            case 'center':
                halignOffset = (width - metrics.width) / 2;
                break;
        }
    } else {
        metrics = gc.getTextWidthTruncated(val, width - leftPadding, config.truncateTextWithEllipsis, true);
        minWidth = 0;
        if (metrics.string !== undefined) {
            val = metrics.string;
        } else {
            switch (halign) {
                case 'right':
                    halignOffset = width - rightPadding - metrics.width;
                    break;
                case 'center':
                    halignOffset = (width - metrics.width) / 2;
                    break;
            }
        }
    }

    if (val !== null) {
        x += Math.max(leftPadding, halignOffset);
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

        gc.cache.textAlign = 'left';
        gc.cache.textBaseline = 'middle';
        gc.simpleText(val, x, y);
    }

    return minWidth;
}

function findLines(gc: CanvasRenderingContext2DEx, config: CellRenderConfig, words: string[], width: number) {

    if (words.length === 1) {
        return words;
    }

    // starting with just the first word...
    let stillFits: boolean;
    let line = [words.shift()];
    while (
        // so lone as line still fits within current column...
        (stillFits = gc.getTextWidth(line.join(' ')) < width)
        // ...AND there are more words available...
        && words.length
    ) {
        // ...add another word to end of line and retest
        line.push(words.shift());
    }

    if (
        !stillFits // if line is now too long...
        && line.length > 1 // ...AND is multiple words...
    ) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        words.unshift(line.pop()!); // ...back off by (i.e., remove) one word
    }

    line = [line.join(' ')];

    if (words.length) { // if there's anything left...
        line = line.concat(findLines(gc, config, words, width)); // ...break it up as well
    }

    return line;
}

function strikeThrough(config: CellRenderConfig, gc: CanvasRenderingContext2DEx, text: string, x: number, y: number, thickness: number) {
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

function underline(config: CellRenderConfig, gc: CanvasRenderingContext2DEx, text: string, x: number, y: number, thickness: number) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const textHeight = gc.getTextHeight(config.font!).height;
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
    sideId: BidAskSideId,
    typeId: DepthRecord.TypeId,
    altRow: boolean,
) {
    switch (sideId) {
        case BidAskSideId.Bid:
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
                    throw new UnreachableCaseError('GCRCDRBAOPLCSIIB23467', typeId);
            }

        case BidAskSideId.Ask:
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
                    throw new UnreachableCaseError('GCRCDRBAOPLCSIIA22985', typeId);
            }

        default:
            throw new UnreachableCaseError('GCRCDRBAOPLCSII11187', sideId);
    }
}

let coreSettings: CoreSettings;
let colorSettings: ColorSettings;

export namespace GridCellRendererModule {
    export function setSettings(coreSettingsValue: CoreSettings, colorSettingsValue: ColorSettings) {
        coreSettings = coreSettingsValue;
        colorSettings = colorSettingsValue;
    }
}
