/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'src/res/internal-api';
import { assert, EnumInfoOutOfOrderError, Integer, JsonElement, Logger, UnreachableCaseError } from 'src/sys/internal-api';
import { ColorScheme } from '../color-scheme';
import { ColorSchemePreset } from '../color-scheme-preset';
import { SettingsGroup } from './settings-group';

export class ColorSettings extends SettingsGroup {
    private _baseScheme: ColorScheme;
    private _activeScheme: ColorScheme;
    private _resolvedItems = new Array<ColorScheme.ResolvedItem>(ColorScheme.Item.idCount);
    private _beginChangeCount = 0;
    private _changed = false;

    private _lastOpaqueItems = new Array<ColorSettings.LastOpaqueItem>(ColorScheme.Item.idCount);

    get lastNonInheritedItems() { return this._lastOpaqueItems; }

    constructor() {
        super(SettingsGroup.Type.Id.Color, ColorSettings.groupName);
    }

    beginChanges() {
        this._beginChangeCount++;
        if (this._beginChangeCount === 1) {
            super.beginChanges();
        }
    }

    endChanges() {
        if (--this._beginChangeCount === 0) {
            if (this._changed) {
                this.resolve();
                this.notifySettingChanged(0);
                this._changed = false;
            }
            super.endChanges();
        }
    }

    load(element: JsonElement | undefined) {
        this.beginChanges();
        try {
            if (element === undefined) {
                this.loadDefault();
            } else {
                const context = 'ColorSettings.load';
                const baseName = element.tryGetString(ColorSettings.JsonName.BaseName, context);
                if (baseName === undefined) {
                    this.loadDefaultWithWarning('baseName not found');
                } else {
                    let isBuiltIn = element.tryGetBoolean(ColorSettings.JsonName.BaseIsBuiltIn, context);
                    if (isBuiltIn === undefined) {
                        Logger.logWarning(`${ColorSettings.loadWarningPrefix} isBuiltIn not found. Assuming true`);
                        isBuiltIn = true;
                    }

                    if (!isBuiltIn) {
                        this.loadDefaultWithWarning('Only BuiltIn currently supported');
                    } else {
                        const scheme = ColorSchemePreset.createColorSchemeByName(baseName);
                        if (scheme === undefined) {
                            this.loadDefaultWithWarning(`Built In color scheme not found: ${baseName}`);
                        } else {
                            this._baseScheme = scheme;
                            this._activeScheme = this._baseScheme.createCopy();

                            const differenceElements = element.tryGetElementArray(ColorSettings.JsonName.Differences, context);
                            if (differenceElements !== undefined && differenceElements.length > 0) {
                                this.loadDifferences(differenceElements);
                            }

                            this.resolve();
                            this.initialiseLastNonInheritedItemColors();
                        }
                    }
                }
            }
        } finally {
            this.endChanges();
        }
    }

    save(element: JsonElement) {
        super.save(element);
        element.setString(ColorSettings.JsonName.BaseName, this._baseScheme.name);
        element.setBoolean(ColorSettings.JsonName.BaseIsBuiltIn, this._baseScheme.builtIn);
        const differences = this._activeScheme.differencesFrom(this._baseScheme);
        if (differences.length > 0) {
            const differenceElements = new Array<JsonElement>(differences.length);
            for (let i = 0; i < differences.length; i++) {
                const differenceItem = differences[i];
                const differenceElement = new JsonElement();
                differenceElement.setString(ColorSettings.JsonName.ItemName, ColorScheme.Item.idToName(differenceItem.id));
                if (differenceItem.bkgd !== ColorScheme.schemeInheritColor) {
                    differenceElement.setString(ColorSettings.JsonName.ItemBkgd, differenceItem.bkgd);
                }
                if (differenceItem.fore !== ColorScheme.schemeInheritColor) {
                    differenceElement.setString(ColorSettings.JsonName.ItemFore, differenceItem.fore);
                }
                differenceElements[i] = differenceElement;
            }

            element.setElementArray(ColorSettings.JsonName.Differences, differenceElements);
        }
    }

    loadColorScheme(value: string) {
        // TODO: Presets are hard coded into form.
        this.beginChanges();
        try {
            let scheme: ColorScheme | undefined;
            switch (value) {
                case '<Light>':
                    scheme = ColorSchemePreset.createColorSchemeById(ColorSchemePreset.Id.Light);
                    break;
                case '<Dark>':
                    scheme = ColorSchemePreset.createColorSchemeById(ColorSchemePreset.Id.Dark);
                    break;
                default:
                    scheme = undefined;
            }
            if (scheme === undefined) {
                this.loadDefaultWithWarning(`Selected color scheme not found: ${value}`);
            } else {
                this._baseScheme = scheme;
                this._activeScheme = this._baseScheme.createCopy();
                this.resolve();
                this.initialiseLastNonInheritedItemColors();
            }
            this._changed = true;
        } finally {
            this.endChanges();
        }
    }

    getItemFore(itemId: ColorScheme.ItemId) {
        return this._activeScheme.items[itemId].fore;
    }

    setItemFore(itemId: ColorScheme.ItemId, color: ColorScheme.ItemColor): void {
        this.setItemColor(itemId, ColorScheme.BkgdForeId.Fore, color);
    }

    getItemBkgd(itemId: ColorScheme.ItemId) {
        return this._activeScheme.items[itemId].bkgd;
    }

    setItemBkgd(itemId: ColorScheme.ItemId, color: ColorScheme.ItemColor): void {
        this.setItemColor(itemId, ColorScheme.BkgdForeId.Bkgd, color);
    }

    getItemColor(itemId: ColorScheme.ItemId, bkgdFore: ColorScheme.BkgdForeId) {
        switch (bkgdFore) {
            case ColorScheme.BkgdForeId.Bkgd: return this.getItemBkgd(itemId);
            case ColorScheme.BkgdForeId.Fore: return this.getItemFore(itemId);
            default: throw new UnreachableCaseError('CSFGIC323085543', bkgdFore);
        }
    }

    setItemColor(itemId: ColorScheme.ItemId, bkgdFore: ColorScheme.BkgdForeId, color: ColorScheme.ItemColor): void {
        this.beginChanges();
        try {
            assert(itemId >= 0, 'ID:1313123410');
            assert(itemId < this._activeScheme.items.length, 'ID:1513123428');
            if (color !== ColorScheme.schemeInheritColor) {
                this.setLastOpaqueItemColor(itemId, bkgdFore, color);
            }
            switch (bkgdFore) {
                case ColorScheme.BkgdForeId.Bkgd:
                    if (color !== this._activeScheme.items[itemId].bkgd) {
                        this._activeScheme.items[itemId].bkgd = color;
                        this._changed = true;
                    }
                    break;
                case ColorScheme.BkgdForeId.Fore:
                    if (color !== this._activeScheme.items[itemId].fore) {
                        this._activeScheme.items[itemId].fore = color;
                        this._changed = true;
                    }
                    break;
                default:
                    throw new UnreachableCaseError('CSFSIC1009185', bkgdFore);
            }
        } finally {
            this.endChanges();
        }
    }

    getForeItemStateId(itemId: ColorScheme.ItemId) {
        if (!ColorScheme.Item.idHasFore(itemId)) {
            return ColorSettings.ItemStateId.Never;
        } else {
            const value = this.getItemFore(itemId);
            if (value === ColorScheme.schemeInheritColor) {
                return ColorSettings.ItemStateId.Inherit;
            } else {
                return ColorSettings.ItemStateId.Value;
            }
        }
    }

    getBkgdItemStateId(itemId: ColorScheme.ItemId) {
        if (!ColorScheme.Item.idHasBkgd(itemId)) {
            return ColorSettings.ItemStateId.Never;
        } else {
            const value = this.getItemBkgd(itemId);
            if (value === ColorScheme.schemeInheritColor) {
                return ColorSettings.ItemStateId.Inherit;
            } else {
                return ColorSettings.ItemStateId.Value;
            }
        }
    }

    getFore(itemId: ColorScheme.ItemId): ColorScheme.ResolvedColor {
        return this._resolvedItems[itemId].fore;
    }

    getBkgd(itemId: ColorScheme.ItemId): ColorScheme.ResolvedColor {
        return this._resolvedItems[itemId].bkgd;
    }

    getColor(itemId: ColorScheme.ItemId, bkgdFore: ColorScheme.BkgdForeId) {
        switch (bkgdFore) {
            case ColorScheme.BkgdForeId.Bkgd: return this.getBkgd(itemId);
            case ColorScheme.BkgdForeId.Fore: return this.getFore(itemId);
            default: throw new UnreachableCaseError('CSGC6847739', bkgdFore);
        }
    }

    getLastOpaqueItemColor(itemId: ColorScheme.ItemId, bkgdFore: ColorScheme.BkgdForeId) {
        const lastOpaqueItem = this._lastOpaqueItems[itemId];
        return lastOpaqueItem[bkgdFore];
    }

    setLastOpaqueItemColor(itemId: ColorScheme.ItemId, bkgdFore: ColorScheme.BkgdForeId,
        value: ColorSettings.UndefineablOpaqueColor) {
        const lastOpaqueItem = this._lastOpaqueItems[itemId];
        lastOpaqueItem[bkgdFore] = value;
    }

    private initialiseLastNonInheritedItemColors() {
        for (let i = 0; i < this._lastOpaqueItems.length; i++) {
            const itemId = i as ColorScheme.ItemId;

            let bkgdColor = this.getItemBkgd(itemId);
            if (bkgdColor === undefined) {
                bkgdColor = this.getBkgd(itemId); // try using resolved color instead
                if (bkgdColor === undefined) {
                    bkgdColor = ColorSettings.FallbackLastOpaqueBkgdColor;
                }
            }

            let foreColor = this.getItemFore(itemId);
            if (foreColor === undefined) {
                foreColor = this.getFore(itemId); // try using resolved color instead
                if (foreColor === undefined) {
                    foreColor = ColorSettings.FallbackLastOpaqueForeColor;
                }
            }

            const lastNonInheritedItem: ColorSettings.LastOpaqueItem = [
                bkgdColor, foreColor
            ];
            this._lastOpaqueItems[itemId] = lastNonInheritedItem;
        }
    }

    private loadDefault() {
        this._baseScheme = ColorSchemePreset.createColorSchemeById(ColorSchemePreset.Id.Dark);
        this._activeScheme = this._baseScheme.createCopy();
        this.resolve();
        this.initialiseLastNonInheritedItemColors();
    }

    private loadDefaultWithWarning(warningText: string) {
        Logger.logWarning(`${ColorSettings.loadWarningPrefix} ${warningText}`);
        this.loadDefault();
    }

    private loadDifferences(differenceElements: JsonElement[]) {
        const context = 'ColorSettings.loadDifferences';
        for (let i = 0; i < differenceElements.length; i++) {
            const differenceElement = differenceElements[i];
            const itemName = differenceElement.tryGetString(ColorSettings.JsonName.ItemName, context);
            if (itemName === undefined) {
                Logger.logWarning(`${ColorSettings.loadWarningPrefix} Difference missing Item Name`);
            } else {
                const itemId = ColorScheme.Item.tryNameToId(itemName);
                if (itemId === undefined) {
                    Logger.logWarning(`${ColorSettings.loadWarningPrefix} Difference Item Name not found: ${itemName}`);
                } else {
                    let bkgd = differenceElement.tryGetString(ColorSettings.JsonName.ItemBkgd, context);
                    if (bkgd === undefined) {
                        bkgd = ColorScheme.schemeInheritColor;
                    }
                    let fore = differenceElement.tryGetString(ColorSettings.JsonName.ItemFore, context);
                    if (fore === undefined) {
                        fore = ColorScheme.schemeInheritColor;
                    }
                    this._activeScheme.items[itemId] = ColorScheme.Item.create(itemId, bkgd, fore);
                }
            }
        }
    }

    private resolve() {
        for (let itemId = 0; itemId < ColorScheme.Item.idCount; itemId++) {
            this._resolvedItems[itemId] = this._activeScheme.resolve(itemId);
        }
    }
}

export namespace ColorSettings {
    export const groupName = 'color';

    export const enum JsonName {
        BaseName = 'baseName',
        BaseIsBuiltIn = 'baseIsBuiltIn',
        ItemName = 'itemName',
        ItemBkgd = 'itemBkgd',
        ItemFore = 'itemFore',
        Differences = 'differences',
    }

    export const loadWarningPrefix = 'Color Settings Load Warning:';

    export type ChangedEventHandler = (this: void) => void;

    export type UndefineablOpaqueColor = ColorScheme.OpaqueColor | undefined;
    export type BkgdForeUndefinableOpaqueColorArray = [
        UndefineablOpaqueColor, // Bkgd
        UndefineablOpaqueColor  // Fore
    ];
    export type LastOpaqueItem = BkgdForeUndefinableOpaqueColorArray;

    export const FallbackLastOpaqueBkgdColor = '#000';
    export const FallbackLastOpaqueForeColor = '#FFF';

    export const enum ItemStateId {
        Never,
        Inherit,
        Value,
    }

    export namespace ItemState {
        type Id = ItemStateId;

        interface Info {
            id: Id;
            displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof ItemStateId]: Info };

        const infosObject: InfosObject = {
            Never: {
                id: ItemStateId.Never,
                displayId: StringId.ColorSettingsItemStateDisplay_Never,
            },
            Inherit: {
                id: ItemStateId.Inherit,
                displayId: StringId.ColorSettingsItemStateDisplay_Inherit,
            },
            Value: {
                id: ItemStateId.Value,
                displayId: StringId.ColorSettingsItemStateDisplay_Value,
            },
        };

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('ColorSettings.ItemState', outOfOrderIdx, infos[outOfOrderIdx].id.toString(10));
            }
        }

        export function idToDisplayId(id: Id): StringId {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id): string {
            return Strings[idToDisplayId(id)];
        }
    }
}
