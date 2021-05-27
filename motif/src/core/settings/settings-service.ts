/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridColourScheme as RevGridColourScheme, GridSettings as RevGridSettings } from '@motifmarkets/revgrid';
import { AssertInternalError, Integer, JsonElement, Logger, MultiEvent } from 'src/sys/internal-api';
import { ColorScheme } from '../color-scheme';
import { ColorSettings } from './color-settings';
import { CoreSettings } from './core-settings';
import { MasterSettings } from './master-settings';
import { SettingsGroup } from './settings-group';

export class SettingsService {
    private _registryEntryCount = 0;
    private _registry = new Array<SettingsGroup | undefined>(10);
    private _beginMasterChangesCount = 0;
    private _masterChanged = false;
    private _beginChangesCount = 0;
    private _changed = false;
    private _saveRequired = false;
    private _restartRequired = false;

    private _master: MasterSettings; // not registered
    private _core: CoreSettings;
    private _color: ColorSettings;

    private _masterChangedMultiEvent = new MultiEvent<SettingsService.ChangedEventHandler>();
    private _changedMultiEvent = new MultiEvent<SettingsService.ChangedEventHandler>();

    get saveRequired() { return this._saveRequired; }
    get restartRequired() { return this._restartRequired; }
    get master() { return this._master; }
    get core() { return this._core; }
    get color() { return this._color; }

    constructor() {
        // automatically create master group but handle differently from others.
        this._master = new MasterSettings();
        this._master.beginChangesEvent = () => this.handleMasterBeginChangesEvent();
        this._master.endChangesEvent = () => this.handleMasterEndChangesEvent();
        this._master.settingChangedEvent = (settingId) => this.handleMasterSettingChangedEvent(settingId);

        // automatically create and register core and color settings groups
        this._core = new CoreSettings();
        this.register(this._core);
        this._color = new ColorSettings();
        this.register(this._color);
    }

    register(group: SettingsGroup) {
        const existingIdx = this.indexOfGroupName(group.name);
        if (existingIdx >= 0) {
            // group with this name already exists
            return undefined;
        } else {
            const result = this._registryEntryCount;

            if (this._registryEntryCount >= this._registry.length) {
                this._registry.length = this._registryEntryCount + 10;
            }
            this._registry[result] = group;
            group.beginChangesEvent = () => this.handleBeginChangesEvent();
            group.endChangesEvent = () => this.handleEndChangesEvent();
            group.settingChangedEvent = (settingId) => this.handleSettingChangedEvent(settingId);

            this._registryEntryCount++;

            return result;
        }
    }

    load(element: JsonElement | undefined) {
        this.beginChanges();
        try {
            const loadedGroups: SettingsGroup[] = [];
            const groupElements = element?.tryGetElementArray(SettingsService.JsonName.Groups, 'SSL045822327');
            if (groupElements === undefined) {
                Logger.logWarning('No setting groups.  Using defaults');
            } else {
                for (const groupElement of groupElements) {
                    const loadedGroup = this.loadGroupElement(groupElement);
                    if (loadedGroup !== undefined && !loadedGroups.includes(loadedGroup)) {
                        loadedGroups.push(loadedGroup);
                    }
                }
            }

            for (let i = 0; i < this._registryEntryCount; i++) {
                const group = this._registry[i];
                if (group !== undefined) {
                    // see if not loaded
                    if (!loadedGroups.includes(group)) {
                        // load defaults
                        group.load(undefined);
                    }
                }
            }
        } finally {
            this.endChanges();
        }
        this.notifyChanged();
    }

    save(element: JsonElement) {
        let count = 0;
        const groupElements = new Array<JsonElement>(this._registryEntryCount);
        for (let i = 0; i < this._registryEntryCount; i++) {
            const entry = this._registry[i];
            if (entry !== undefined) {
                const entryElement = new JsonElement();
                entry.save(entryElement);
                groupElements[count++] = entryElement;
            }
        }
        groupElements.length = count;
        element.setElementArray(SettingsService.JsonName.Groups, groupElements);
    }

    reportSaved() {
        this._saveRequired = false;
    }

    subscribeMasterSettingsChangedEvent(handler: SettingsService.ChangedEventHandler): MultiEvent.DefinedSubscriptionId {
        return this._masterChangedMultiEvent.subscribe(handler);
    }

    unsubscribeMasterSettingsChangedEvent(id: MultiEvent.SubscriptionId): void {
        this._masterChangedMultiEvent.unsubscribe(id);
    }

    subscribeSettingsChangedEvent(handler: SettingsService.ChangedEventHandler): MultiEvent.DefinedSubscriptionId {
        return this._changedMultiEvent.subscribe(handler);
    }

    unsubscribeSettingsChangedEvent(id: MultiEvent.SubscriptionId): void {
        this._changedMultiEvent.unsubscribe(id);
    }

    createRevGridSettings(verticalScrollbarLeftPos?: boolean) {
        const revGridColorScheme = new RevGridColourScheme();

        // revGridColorScheme.GridLineHorizontal = this.color.getBkgdColor(ColorScheme.ItemId.Grid_LineHorizontal);
        // revGridColorScheme.GridLineVertical = this.color.getBkgdColor(ColorScheme.ItemId.Grid_LineVertical);

        revGridColorScheme.background = this.color.getBkgd(ColorScheme.ItemId.Grid_Base);
        revGridColorScheme.backgroundAlt = this.color.getBkgd(ColorScheme.ItemId.Grid_BaseAlt);
        revGridColorScheme.backgroundColumnHeader = this.color.getBkgd(ColorScheme.ItemId.Grid_ColumnHeader);
        // revGridColorScheme.backgroundColumnHover = this.color.getBkgdColor(ColorScheme.ItemId.Grid_ColumnHover);
        // revGridColorScheme.BackgroundColumnHoverAlt = this.color.getBkgdColor(ColorScheme.ItemId.Grid_ColumnHoverAlt);
        revGridColorScheme.borderFocus = this.color.getFore(ColorScheme.ItemId.Grid_FocusedCellBorder);
        revGridColorScheme.backgroundFocus = this.color.getBkgd(ColorScheme.ItemId.Grid_FocusedCell);
        // revGridColorScheme.BackgroundHover = this.color.getBkgdColor(ColorScheme.ItemId.Grid_FocusedCellHover);
        // revGridColorScheme.BackgroundHoverAlt = this.color.getBkgdColor(ColorScheme.ItemId.Grid_FocusedCellHoverAlt);
        revGridColorScheme.backgroundRowHeader = this.color.getBkgd(ColorScheme.ItemId.Grid_RowHeader);
        // revGridColorScheme.BackgroundRowHover = this.color.getBkgdColor(ColorScheme.ItemId.Grid_RowHover);
        // revGridColorScheme.BackgroundRowHoverAlt = this.color.getBkgdColor(ColorScheme.ItemId.Grid_RowHoverAlt);
        // revGridColorScheme.BackgroundColumnHeaderFocus = this.color.getBkgdColor(ColorScheme.ItemId.Grid_ColumnHeaderFocus);
        // revGridColorScheme.BackgroundRowHeaderFocus = this.color.getBkgdColor(ColorScheme.ItemId.Grid_RowHeaderFocus);

        revGridColorScheme.foreground = this.color.getFore(ColorScheme.ItemId.Grid_Base);
        revGridColorScheme.foregroundColumnHeader = this.color.getFore(ColorScheme.ItemId.Grid_ColumnHeader);
        revGridColorScheme.foregroundFocus = this.color.getFore(ColorScheme.ItemId.Grid_FocusedCell);
        revGridColorScheme.foregroundRowHeader = this.color.getFore(ColorScheme.ItemId.Grid_RowHeader);
        // revGridColorScheme.ForegroundColumnHeaderFocus = this.color.getFontColor(ColorScheme.ItemId.Grid_ColumnHeaderFocus);
        // revGridColorScheme.ForegroundRowHeaderFocus = this.color.getFontColor(ColorScheme.ItemId.Grid_RowHeaderFocus);

        revGridColorScheme.highlightAdd = this.color.getFore(ColorScheme.ItemId.Grid_RecordRecentlyAddedBorder);
        revGridColorScheme.highlightUpdate = this.color.getFore(ColorScheme.ItemId.Grid_ValueRecentlyModifiedBorder);
        revGridColorScheme.highlightUpdateUp = this.color.getFore(ColorScheme.ItemId.Grid_ValueRecentlyModifiedUpBorder);
        revGridColorScheme.highlightUpdateDown = this.color.getFore(ColorScheme.ItemId.Grid_ValueRecentlyModifiedDownBorder);

        revGridColorScheme.scrollbarThumbColor = this.color.getFore(ColorScheme.ItemId.Grid_ScrollbarThumb);
        revGridColorScheme.scrollbarThumbShadowColor = this.color.getBkgd(ColorScheme.ItemId.Grid_ScrollbarThumbShadow);

        const result = new RevGridSettings();
        result.colourScheme = revGridColorScheme;
        result.showVerticalGridLines = this.core.grid_VerticalLinesVisible;
        result.showHorizontalGridLines = this.core.grid_HorizontalLinesVisible;
        result.cellPadding = this.core.grid_CellPadding;
        result.fixedRowHeight = this.core.grid_RowHeightFixed;
        result.fontFocus = this.core.grid_FocusedFont === '' ? undefined : this.core.grid_FocusedFont;
        result.fontColumnHeader = this.core.grid_ColumnHeaderFont === '' ? undefined : this.core.grid_ColumnHeaderFont;
        result.fontColumnHeaderFocus = this.core.grid_FocusedColumnHeaderFont === '' ? undefined : this.core.grid_FocusedColumnHeaderFont;
        result.gridLineHorizontalWeight = this.core.grid_HorizontalLineWeight;
        result.gridLineVerticalWeight = this.core.grid_VerticalLineWeight;
        result.highlightAddDuration = this.core.grid_AddHighlightDuration;
        result.highlightUpdateDuration = this.core.grid_UpdateHighlightDuration;
        result.highlightUpdateDuration = this.core.grid_UpdateHighlightDuration;
        result.scrollbarHorizontalWidth = this.core.grid_HorizontalScrollbarWidth;
        if (this.core.grid_HorizontalScrollbarWidth < 11) {
            result.scrollbarHorizontalThumbWidth = this.core.grid_HorizontalScrollbarWidth;
        } else {
            result.scrollbarHorizontalThumbWidth = this.core.grid_HorizontalScrollbarWidth - 4;
        }
        result.scrollbarVerticalWidth = this.core.grid_VerticalScrollbarWidth;
        if (this.core.grid_VerticalScrollbarWidth < 11) {
            result.scrollbarVerticalThumbWidth = this.core.grid_VerticalScrollbarWidth;
        } else {
            result.scrollbarVerticalThumbWidth = this.core.grid_VerticalScrollbarWidth - 4;
        }
        if (verticalScrollbarLeftPos === undefined) {
            verticalScrollbarLeftPos = this.core.grid_VerticalScrollbarLeftPos;
        }
        result.leftScrollbarPos = verticalScrollbarLeftPos;
        result.scrollBarsCanOverlapGrid = this.core.grid_ScrollbarsOverlayAllowed;
        result.scrollbarMargin = this.core.grid_ScrollbarMargin;

        return result;
    }

    private handleMasterBeginChangesEvent() {
        this.beginMasterChanges();
    }

    private handleMasterEndChangesEvent() {
        this.endMasterChanges();
    }

    private handleMasterSettingChangedEvent(settingId: Integer) {
        this.beginMasterChanges();
        try {
            this._masterChanged = true;
            if (settingId === MasterSettings.Id.ApplicationEnvironmentSelectorId) {
                this._restartRequired = true;
            }
        } finally {
            this.endMasterChanges();
        }
    }

    private handleBeginChangesEvent() {
        this.beginChanges();
    }

    private handleEndChangesEvent() {
        this.endChanges();
    }

    private handleSettingChangedEvent(settingId: Integer) {
        this.beginChanges();
        try {
            this._changed = true;
        } finally {
            this.endChanges();
        }
    }

    private notifyMasterChanged() {
        const handlers = this._masterChangedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i]();
        }
    }

    private notifyChanged() {
        const handlers = this._changedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i]();
        }
    }

    private indexOfGroupName(name: string) {
        const upperName = name.toUpperCase();
        for (let i = 0; i < this._registryEntryCount; i++) {
            const entry = this._registry[i];
            if (entry !== undefined && entry.upperName === upperName) {
                return i;
            }
        }
        return -1;
    }

    private getGroup(name: string) {
        const upperName = name.toUpperCase();
        for (let i = 0; i < this._registryEntryCount; i++) {
            const entry = this._registry[i];
            if (entry !== undefined && entry.upperName === upperName) {
                return entry;
            }
        }
        return undefined;
    }

    private beginMasterChanges() {
        this._beginMasterChangesCount++;
    }

    private endMasterChanges() {
        this._beginMasterChangesCount--;
        if (this._beginMasterChangesCount === 0) {
            if (this._masterChanged) {
                this.notifyMasterChanged();
                this._masterChanged = false;
            }
        }
    }

    private beginChanges() {
        this._beginChangesCount++;
    }

    private endChanges() {
        this._beginChangesCount--;
        if (this._beginChangesCount === 0) {
            if (this._changed) {
                this._saveRequired = true;
                this.notifyChanged();
                this._changed = false;
            }
        }
    }

    private loadGroupElement(groupElement: JsonElement) {
        const { name, typeId, errorText } = SettingsGroup.getNameAndType(groupElement);
        if (errorText !== undefined) {
            Logger.logWarning(`Setting group Error: "${errorText}"  Using defaults`);
            return undefined;
        } else {
            if (name === undefined || typeId === undefined) {
                throw new AssertInternalError('SSL1927777768');
            } else {
                const group = this.getGroup(name);
                if (group === undefined) {
                    Logger.logWarning(`Cannot load group as not registered: ${name}`);
                    return undefined;
                } else {
                    if (group.typeId !== typeId) {
                        const groupTypeName = SettingsGroup.Type.idToName(group.typeId);
                        const elementTypeName = SettingsGroup.Type.idToName(typeId);
                        Logger.logWarning(`Cannot load group as not type mismatch: ${name}, ${groupTypeName}, ${elementTypeName}`);
                        return undefined;
                    } else {
                        group.load(groupElement);
                        return group;
                    }
                }
            }
        }
    }
}

export namespace SettingsService {
    export type RegistryEntry = SettingsGroup | undefined;

    export type ChangedEventHandler = (this: void) => void;

    export const enum JsonName {
        Groups = 'groups',
    }
}
