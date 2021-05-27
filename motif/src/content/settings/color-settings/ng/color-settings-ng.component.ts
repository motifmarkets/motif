/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver,
    ElementRef, OnDestroy, ViewChild, ViewContainerRef
} from '@angular/core';
import { CommandRegisterNgService, SettingsNgService } from 'src/component-services/ng-api';
import { AngularSplitTypes } from 'src/controls/internal-api';
import { SvgButtonNgComponent } from 'src/controls/ng-api';
import { ColorScheme, ColorSettings, CommandRegisterService, IconButtonUiAction, InternalCommand, UiAction } from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { assert, delay1Tick, Integer, Logger } from 'src/sys/internal-api';
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
    public propertiesSize: AngularSplitTypes.AreaSize.Html = 120;
    public excessSize = 0;
    public splitterGutterSize = 3;

    private _commandRegisterService: CommandRegisterService;

    private _colorSettings: ColorSettings;
    private _layoutInitialised = false;

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

        this._colorSettings = this.settingsService.color;

        this._saveSchemeUiAction = this.createSaveSchemeUiAction();
    }

    ngAfterViewInit() {
        this._gridComponent.recordFocusEvent = (recordIndex) => this.handleGridRecordFocusEvent(recordIndex);
        this._gridComponent.renderedEvent = () => this.handleGridRenderedEvent();
        const itemId = this._gridComponent.focusedRecordIndex;
        this._itemPropertiesComponent.itemId = itemId;
        this._itemPropertiesComponent.itemChangedEvent = (changedItemId) => this.handleItemPropertiesChangedEvent(changedItemId);
        this.propertiesSize = this._itemPropertiesComponent.width;

        delay1Tick(() => this.setUiActions());
    }

    ngOnDestroy() {
        this.finalise();
    }

    handleGuiLoadSelectChange(value: string) {
        this._colorSettings.loadColorScheme(value);
    }

    protected finalise() {
        this._saveSchemeUiAction.finalise();
        super.finalise();
    }

    protected processSettingsChanged() {
        this._itemPropertiesComponent.processSettingsChanged();
    }

    private handleGridRenderedEvent() {
        if (!this._layoutInitialised && this._gridComponent !== undefined && this._itemPropertiesComponent !== undefined) {
            this.initialiseWidths();
        }
    }

    private handleGridRecordFocusEvent(recordIndex: Integer) {
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

    private updateCurrentRecordIndex(index: Integer | undefined): void {
        if (index !== this._currentRecordIndex) {
            this._currentRecordIndex = index;
            this._itemPropertiesComponent.itemId = index;
        }
    }

    private setUiActions() {
        this._saveSchemeButton.initialise(this._saveSchemeUiAction);
    }

    private showPresetCode() {
        this.isPresetCodeVisible = true;

        const closePromise = ColorSchemePresetCodeNgComponent.open(this._presetCodeContainer, this._resolver, this._colorSettings);
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

    private initialiseWidths() {
        const totalWidth = this._leftAndRightDiv.nativeElement.offsetWidth;
        const availableTotalWidth = totalWidth - this.splitterGutterSize;
        const propertiesWidth = this._itemPropertiesComponent.width;
        const gridActiveWidth = this._gridComponent.getActiveWidth();
        let calculatedPropertiesWidth: Integer;
        if (availableTotalWidth >= (propertiesWidth + gridActiveWidth)) {
            calculatedPropertiesWidth = availableTotalWidth - gridActiveWidth;
        } else {
            if (availableTotalWidth <= ColorSettingsNgComponent.minimumInitialGridWidth) {
                calculatedPropertiesWidth = 0;
            } else {
                calculatedPropertiesWidth = availableTotalWidth - ColorSettingsNgComponent.minimumInitialGridWidth;
            }
        }

        this.propertiesSize = calculatedPropertiesWidth;
        this._layoutInitialised = true;
        this.markForCheck();
    }
}

export namespace ColorSettingsNgComponent {
    export const minimumInitialGridWidth = 40;

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
