/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver,
    ElementRef, OnDestroy, ViewChild, ViewContainerRef
} from '@angular/core';
import { assert, ColorScheme, CommandRegisterService, delay1Tick, IconButtonUiAction, Integer, InternalCommand, Logger, StringId, Strings, UiAction } from '@motifmarkets/motif-core';
import { CommandRegisterNgService, SettingsNgService } from 'component-services-ng-api';
import { AngularSplitTypes } from 'controls-internal-api';
import { SvgButtonNgComponent } from 'controls-ng-api';
import { RevRecordIndex } from 'revgrid';
import { ColorSchemeGridNgComponent } from '../../../color-scheme-grid/ng-api';
import { ColorSchemeItemPropertiesNgComponent } from '../../../color-scheme-item-properties/ng-api';
import { ColorSchemePresetCodeNgComponent } from '../../../color-scheme-preset-code/ng-api';
import { SettingsComponentBaseNgDirective } from '../../ng/settings-component-base-ng.directive';

@Component({
    selector: 'app-color-settings',
    templateUrl: './color-settings-ng.component.html',
    styleUrls: ['./color-settings-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorSettingsNgComponent extends SettingsComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    @ViewChild('leftAndRightDiv', { static: true }) private _leftAndRightDiv: ElementRef;
    @ViewChild('grid', { static: true }) private _gridComponent: ColorSchemeGridNgComponent;
    @ViewChild('saveSchemeButton', { static: true }) private _saveSchemeButton: SvgButtonNgComponent;
    @ViewChild('itemProperties', { static: true }) private _itemPropertiesComponent: ColorSchemeItemPropertiesNgComponent;
    @ViewChild('presetCodeContainer', { read: ViewContainerRef, static: true }) private _presetCodeContainer: ViewContainerRef;

    public isPresetCodeVisible = false;
    public gridSize: AngularSplitTypes.AreaSize.Html;
    public gridMinSize: AngularSplitTypes.AreaSize.Html;
    public splitterGutterSize = 3;

    private _commandRegisterService: CommandRegisterService;

    private _resizeObserver: ResizeObserver;
    private _splitterDragged = false;

    private _saveSchemeUiAction: IconButtonUiAction;

    private _currentRecordIndex: Integer | undefined;

    constructor(
        cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        settingsNgService: SettingsNgService,
        private _resolver: ComponentFactoryResolver,
    ) {
        super(cdr, settingsNgService.settingsService);

        this._commandRegisterService = commandRegisterNgService.service;

        this._saveSchemeUiAction = this.createSaveSchemeUiAction();
    }

    ngAfterViewInit() {
        this._gridComponent.recordFocusEventer = (recordIndex) => this.handleGridRecordFocusEvent(recordIndex);
        this._gridComponent.columnsViewWithsChangedEventer = () => this.updateWidths();
        const itemId = this._gridComponent.focusedRecordIndex;
        this._itemPropertiesComponent.itemId = itemId;
        this._itemPropertiesComponent.itemChangedEvent = (changedItemId) => this.handleItemPropertiesChangedEvent(changedItemId);
        this.gridSize = this._itemPropertiesComponent.approximateWidth;

        delay1Tick(() => this.initialise());
    }

    ngOnDestroy() {
        this.finalise();
    }

    handleGuiLoadSelectChange(value: string) {
        this.colorSettings.loadColorScheme(value);
    }

    public handleSplitterDragEnd() {
        this._splitterDragged = true;
    }

    protected override finalise() {
        this._saveSchemeUiAction.finalise();
        this._resizeObserver.disconnect();
        super.finalise();
    }

    protected processSettingsChanged() {
        this._itemPropertiesComponent.processSettingsChanged();
        this._gridComponent.invalidateAll();
    }

    private handleGridRecordFocusEvent(recordIndex: RevRecordIndex | undefined) {
        this.updateCurrentRecordIndex(recordIndex);
    }

    private handleItemPropertiesChangedEvent(itemId: ColorScheme.ItemId) {
        this._gridComponent.invalidateRecord(itemId);
    }

    private handleSaveSchemeAction(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        if (UiAction.downKeysIncludesId(downKeys, UiAction.DownKeyId.Alt)) {
            this.showPresetCode();
        }
    }

    private createSaveSchemeUiAction() {
        const commandName = InternalCommand.Name.ColorSettings_SaveScheme;
        const displayId = StringId.SaveColorSchemeCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SaveColorSchemeToADifferentNameTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Save);
        action.signalEvent = (signalTypeId, downKeys) => this.handleSaveSchemeAction(signalTypeId, downKeys);
        return action;
    }

    private updateCurrentRecordIndex(index: RevRecordIndex | undefined): void {
        if (index !== this._currentRecordIndex) {
            this._currentRecordIndex = index;
            this._itemPropertiesComponent.itemId = index;
        }
    }

    private initialise() {
        this._saveSchemeButton.initialise(this._saveSchemeUiAction);

        this._resizeObserver = new ResizeObserver(() => this.updateWidths());
        this._resizeObserver.observe(this._leftAndRightDiv.nativeElement);
        this._gridComponent.waitRendered().then((success) => {
            if (success) {
                this.updateWidths();
            }
        });

        this.processSettingsChanged();
    }

    private showPresetCode() {
        this.isPresetCodeVisible = true;

        const closePromise = ColorSchemePresetCodeNgComponent.open(this._presetCodeContainer, this._resolver, this.colorSettings);
        closePromise.then(
            () => {
                this.closePresetCode();
            },
            (reason) => {
                Logger.logError(`ColorSchemePresetCode error: ${reason}`);
                this.closePresetCode();
            }
        );

        this.markForCheck();
    }

    private closePresetCode() {
        this._presetCodeContainer.clear();
        this.isPresetCodeVisible = false;
        this.markForCheck();
    }

    private updateWidths() {
        const gridMinWidth = this._gridComponent.calculateFixedColumnsWidth() + ColorSettingsNgComponent.extraGridFixedColumnsWidth;
        this.gridMinSize = gridMinWidth;

        if (!this._splitterDragged) {
            const totalWidth = this._leftAndRightDiv.nativeElement.offsetWidth;
            const availableTotalWidth = totalWidth - this.splitterGutterSize;
            const propertiesWidth = this._itemPropertiesComponent.approximateWidth;
            const gridActiveColumnsWidth = this._gridComponent.calculateActiveColumnsWidth();
            let calculatedGridWidth: Integer;
            if (availableTotalWidth >= (propertiesWidth + gridActiveColumnsWidth)) {
                calculatedGridWidth = gridActiveColumnsWidth;
            } else {
                if (availableTotalWidth > (propertiesWidth + gridMinWidth)) {
                    calculatedGridWidth = availableTotalWidth - propertiesWidth;
                } else {
                    calculatedGridWidth = gridMinWidth;
                }
            }

            this.gridSize = calculatedGridWidth;
            this.markForCheck();
        }
    }
}

export namespace ColorSettingsNgComponent {
    export const extraGridFixedColumnsWidth = 20;

    export function create(
        container: ViewContainerRef,
        resolver: ComponentFactoryResolver,
    ) {
        container.clear();
        const factory = resolver.resolveComponentFactory(ColorSettingsNgComponent);
        const componentRef = container.createComponent(factory);
        assert(componentRef.instance instanceof ColorSettingsNgComponent, 'CSCC909553');
        return componentRef.instance as ColorSettingsNgComponent;
    }
}
