/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { isReadable as TinyColorIsReadable, readability as TinyColorReadability } from '@ctrl/tinycolor';
import { RevRecord, RevRecordField, RevRecordIndex, RevRecordStore } from 'revgrid';
import { StringId } from 'src/res/internal-api';
import { MultiEvent, UnreachableCaseError } from 'src/sys/internal-api';
import { ColorScheme } from './color-scheme';
import {
    ColorRenderValue, ColorSettingsItemStateIdRenderValue, IntegerRenderValue,
    IsReadableRenderValue, NumberRenderValue, RenderValue, StringRenderValue
} from './render-value';
import { ColorSettings } from './settings/color-settings';
import { SettingsService } from './settings/settings-service';

export class ColorSchemeGridRecordStore implements RevRecordStore {
    fieldsEventers: RevRecordStore.FieldsEventers;
    recordsEventers: RevRecordStore.RecordsEventers;

    private readonly _records = new Array<ColorSchemeGridRecordStore.Record>(ColorScheme.Item.idCount);
    private _colorSettings: ColorSettings;
    private _settingsChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    get colorSettings() { return this._colorSettings; }

    constructor(private readonly _settingsService: SettingsService) {
        this._colorSettings = this._settingsService.color;

        for (let itemId = 0; itemId < ColorScheme.Item.idCount; itemId++) {
            const record = {
                index: itemId,
                itemId,
            };
            this._records[itemId] = record;
        }

        this._settingsChangedEventSubscriptionId =
            this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());
    }

    finalise() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedEventSubscriptionId);
    }

    setFieldEventers(fieldsEventers: RevRecordStore.FieldsEventers): void {
        this.fieldsEventers = fieldsEventers;
    }

    setRecordEventers(recordsEventers: RevRecordStore.RecordsEventers): void {
        this.recordsEventers = recordsEventers;
    }

    createItemIdField() { return new ColorSchemeGridRecordStore.ItemIdField(this.colorSettings); }
    createNameField() { return new ColorSchemeGridRecordStore.NameField(this.colorSettings); }
    createDisplayField() { return new ColorSchemeGridRecordStore.DisplayField(this.colorSettings); }
    createItemBkgdColorTextField() { return new ColorSchemeGridRecordStore.ItemBkgdColorTextField(this.colorSettings); }
    createResolvedBkgdColorTextField() { return new ColorSchemeGridRecordStore.ResolvedBkgdColorTextField(this.colorSettings); }
    createItemForeColorTextField() { return new ColorSchemeGridRecordStore.ItemForeColorTextField(this.colorSettings); }
    createResolvedForeColorTextField() { return new ColorSchemeGridRecordStore.ResolvedForeColorTextField(this.colorSettings); }
    createItemBkgdColorField() { return new ColorSchemeGridRecordStore.ItemBkgdColorField(this.colorSettings); }
    createResolvedBkgdColorField() { return new ColorSchemeGridRecordStore.ResolvedBkgdColorField(this.colorSettings); }
    createItemForeColorField() { return new ColorSchemeGridRecordStore.ItemForeColorField(this.colorSettings); }
    createResolvedForeColorField() { return new ColorSchemeGridRecordStore.ResolvedForeColorField(this.colorSettings); }
    createBkgdItemStateField() { return new ColorSchemeGridRecordStore.BkgdItemStateField(this.colorSettings); }
    createForeItemStateField() { return new ColorSchemeGridRecordStore.ForeItemStateField(this.colorSettings); }
    createReadabilityField() { return new ColorSchemeGridRecordStore.ReadabilityField(this.colorSettings); }
    createIsReadableField() { return new ColorSchemeGridRecordStore.IsReadableField(this.colorSettings); }

    getRecord(index: RevRecordIndex): ColorSchemeGridRecordStore.Record {
        return this._records[index];
    }

    getRecords(): readonly ColorSchemeGridRecordStore.Record[] {
        return this._records;
    }

    get recordCount(): number {
        return ColorScheme.Item.idCount;
    }

    private handleSettingsChangedEvent() {
        this.recordsEventers.invalidateAll();
    }
}

export namespace ColorSchemeGridRecordStore {
    export interface Record extends RevRecord {
        itemId: ColorScheme.ItemId;
    }

    export type ChangedEvent = (this: void) => void;

    export namespace FieldName {
        export const itemId = 'Id';
        export const name = 'Name';
        export const display = 'Display';
        export const itemBkgdColorText = 'ItemBkgdText';
        export const resolvedBkgdColorText = 'ResolvedBkgdText';
        export const itemForeColorText = 'ItemForeText';
        export const resolvedForeColorText = 'ResolvedForeText';
        export const itemBkgdColor = 'ItemBkgd';
        export const resolvedBkgdColor = 'ResolvedBkgd';
        export const itemForeColor = 'ItemFore';
        export const resolvedForeColor = 'ResolvedFore';
        export const bkgdState = 'BkgdState';
        export const foreState = 'ForeState';
        export const readability = 'readability';
        export const isReadable = 'isReadable';
    }

    export abstract class Field implements RevRecordField {
        constructor(private _colorSettings: ColorSettings, public readonly name: string) {
        }

        get colorSettings() { return this._colorSettings; }

        abstract getValue(record: Record): RenderValue;
    }

    export interface FieldStateDefinition {
        HeaderId: StringId;
        Alignment: 'right' | 'left' | 'center';
    }

    export class ItemIdField extends Field {
        static readonly gridFieldState: FieldStateDefinition = {
            HeaderId: StringId.ColorGridHeading_ItemId,
            Alignment: 'right'
        };

        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.itemId);
        }

        getValue(record: Record): IntegerRenderValue {
            return new IntegerRenderValue(record.itemId);
        }
    }

    export class NameField extends Field {
        static readonly gridFieldState: FieldStateDefinition = {
            HeaderId: StringId.ColorGridHeading_Name,
            Alignment: 'left'
        };

        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.name);
        }

        getValue(record: Record): StringRenderValue {
            return new StringRenderValue(ColorScheme.Item.idToName(record.itemId));
        }
    }

    export class DisplayField extends Field {
        static readonly fieldStateDefinition: FieldStateDefinition = {
            HeaderId: StringId.ColorGridHeading_Display,
            Alignment: 'left'
        };

        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.display);
        }

        getValue(record: Record): StringRenderValue {
            return new StringRenderValue(ColorScheme.Item.idToDisplay(record.itemId));
        }
    }

    export class ItemBkgdColorTextField extends Field {
        static readonly fieldStateDefinition: FieldStateDefinition = {
            HeaderId: StringId.ColorGridHeading_ItemBkgdColorText,
            Alignment: 'right'
        };

        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.itemBkgdColorText);
        }

        getValue(record: Record): StringRenderValue {
            return new StringRenderValue(this.colorSettings.getItemBkgd(record.itemId));
        }
    }

    export class ResolvedBkgdColorTextField extends Field {
        static readonly fieldStateDefinition: FieldStateDefinition = {
            HeaderId: StringId.ColorGridHeading_ResolvedBkgdColorText,
            Alignment: 'right'
        };

        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.itemBkgdColorText);
        }

        getValue(record: Record): StringRenderValue {
            const stateId = this.colorSettings.getBkgdItemStateId(record.itemId);
            let attribute: RenderValue.GreyedOutAttribute | undefined;
            let value: string;

            switch (stateId) {
                case ColorSettings.ItemStateId.Never:
                    value = '';
                    attribute = undefined;
                    break;
                case ColorSettings.ItemStateId.Inherit:
                    value = this.colorSettings.getBkgd(record.itemId);
                    attribute = {
                        id: RenderValue.AttributeId.GreyedOut,
                    };
                    break;
                case ColorSettings.ItemStateId.Value:
                    value = this.colorSettings.getBkgd(record.itemId);
                    attribute = undefined;
                    break;
                default:
                    throw new UnreachableCaseError('CSGDSRBCTF12129', stateId);
            }

            const renderValue = new StringRenderValue(value);
            if (attribute !== undefined) {
                renderValue.addAttribute(attribute);
            }

            return renderValue;
        }
    }

    export class ItemForeColorTextField extends Field {
        static readonly fieldStateDefinition: FieldStateDefinition = {
            HeaderId: StringId.ColorGridHeading_ItemForeColorText,
            Alignment: 'right'
        };

        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.itemForeColorText);
        }

        getValue(record: Record): StringRenderValue {
            return new StringRenderValue(this.colorSettings.getItemFore(record.itemId));
        }
    }

    export class ResolvedForeColorTextField extends Field {
        static readonly fieldStateDefinition: FieldStateDefinition = {
            HeaderId: StringId.ColorGridHeading_ResolvedForeColorText,
            Alignment: 'right'
        };

        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.itemForeColorText);
        }

        getValue(record: Record): StringRenderValue {
            const stateId = this.colorSettings.getForeItemStateId(record.itemId);
            let attribute: RenderValue.GreyedOutAttribute | undefined;
            let value: string;

            switch (stateId) {
                case ColorSettings.ItemStateId.Never:
                    value = '';
                    attribute = undefined;
                    break;
                case ColorSettings.ItemStateId.Inherit:
                    value = this.colorSettings.getFore(record.itemId);
                    attribute = {
                        id: RenderValue.AttributeId.GreyedOut,
                    };
                    break;
                case ColorSettings.ItemStateId.Value:
                    value = this.colorSettings.getFore(record.itemId);
                    attribute = undefined;
                    break;
                default:
                    throw new UnreachableCaseError('CSGDSRBCTF12129', stateId);
            }

            const renderValue = new StringRenderValue(value);
            if (attribute !== undefined) {
                renderValue.addAttribute(attribute);
            }

            return renderValue;
        }
    }

    export class ItemBkgdColorField extends Field {
        static readonly fieldStateDefinition: FieldStateDefinition = {
            HeaderId: StringId.ColorGridHeading_ItemBkgdColor,
            Alignment: 'left'
        };

        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.itemBkgdColor);
        }

        getValue(record: Record): ColorRenderValue {
            return new ColorRenderValue(this.colorSettings.getItemBkgd(record.itemId));
        }
    }

    export class ResolvedBkgdColorField extends Field {
        static readonly fieldStateDefinition: FieldStateDefinition = {
            HeaderId: StringId.ColorGridHeading_ResolvedBkgdColor,
            Alignment: 'left'
        };

        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.itemBkgdColor);
        }

        getValue(record: Record): ColorRenderValue {
            return new ColorRenderValue(this.colorSettings.getBkgd(record.itemId));
        }
    }

    export class ItemForeColorField extends Field {
        static readonly fieldStateDefinition: FieldStateDefinition = {
            HeaderId: StringId.ColorGridHeading_ItemForeColor,
            Alignment: 'left'
        };

        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.itemForeColor);
        }

        getValue(record: Record): ColorRenderValue {
            return new ColorRenderValue(this.colorSettings.getItemFore(record.itemId));
        }
    }

    export class ResolvedForeColorField extends Field {
        static readonly fieldStateDefinition: FieldStateDefinition = {
            HeaderId: StringId.ColorGridHeading_ResolvedForeColor,
            Alignment: 'left'
        };

        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.itemForeColor);
        }

        getValue(record: Record): ColorRenderValue {
            return new ColorRenderValue(this.colorSettings.getFore(record.itemId));
        }
    }

    export class BkgdItemStateField extends Field {
        static readonly fieldStateDefinition: FieldStateDefinition = {
            HeaderId: StringId.ColorGridHeading_NotHasBkgd,
            Alignment: 'left'
        };

        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.bkgdState);
        }

        getValue(record: Record) {
            const stateId = this.colorSettings.getBkgdItemStateId(record.itemId);
            return new ColorSettingsItemStateIdRenderValue(stateId);
        }
    }

    export class ForeItemStateField extends Field {
        static readonly fieldStateDefinition: FieldStateDefinition = {
            HeaderId: StringId.ColorGridHeading_NotHasFore,
            Alignment: 'left'
        };

        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.foreState);
        }

        getValue(record: Record) {
            const stateId = this.colorSettings.getForeItemStateId(record.itemId);
            return new ColorSettingsItemStateIdRenderValue(stateId);
        }
    }

    export class ReadabilityField extends Field {
        static readonly fieldStateDefinition: FieldStateDefinition = {
            HeaderId: StringId.ColorGridHeading_Readability,
            Alignment: 'right'
        };

        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.readability);
        }

        getValue(record: Record): NumberRenderValue {
            if (ColorScheme.Item.idHasBkgd(record.itemId) && ColorScheme.Item.idHasFore(record.itemId)) {
                const resolvedBkgdColor = this.colorSettings.getBkgd(record.itemId);
                const resolvedForeColor = this.colorSettings.getFore(record.itemId);
                const value = TinyColorReadability(resolvedBkgdColor, resolvedForeColor);
                return new NumberRenderValue(value);
            } else {
                return new NumberRenderValue(undefined);
            }
        }
    }

    export class IsReadableField extends Field {
        static readonly fieldStateDefinition: FieldStateDefinition = {
            HeaderId: StringId.ColorGridHeading_IsReadable,
            Alignment: 'center'
        };

        constructor(scheme: ColorSettings) {
            super(scheme, FieldName.isReadable);
        }

        getValue(record: Record): IsReadableRenderValue {
            if (ColorScheme.Item.idHasBkgd(record.itemId) && ColorScheme.Item.idHasFore(record.itemId)) {
                const resolvedBkgdColor = this.colorSettings.getBkgd(record.itemId);
                const resolvedForeColor = this.colorSettings.getFore(record.itemId);
                const value = TinyColorIsReadable(resolvedBkgdColor, resolvedForeColor);
                return new IsReadableRenderValue(value);
            } else {
                return new IsReadableRenderValue(undefined);
            }
        }
    }
}
