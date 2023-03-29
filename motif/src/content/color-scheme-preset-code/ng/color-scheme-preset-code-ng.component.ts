/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { TinyColor } from '@ctrl/tinycolor';
import {
    assert,
    ColorScheme,
    ColorSettings,
    CommandRegisterService,
    delay1Tick,
    IconButtonUiAction,
    InternalCommand,
    ModifierKey,
    StringBuilder,
    StringId,
    UiAction
} from '@motifmarkets/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { SvgButtonNgComponent } from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-color-scheme-preset-code',
    templateUrl: './color-scheme-preset-code-ng.component.html',
    styleUrls: ['./color-scheme-preset-code-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorSchemePresetCodeNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private static readonly _tabs2 = ' '.repeat(8);
    private static readonly _tabs3 = ' '.repeat(12);

    @ViewChild('returnButton', { static: true }) private _returnButtonComponent: SvgButtonNgComponent;
    @ViewChild('copyToClipboardButton', { static: true }) private _copyToClipboardButton: SvgButtonNgComponent;

    public dialogCaption = 'Preset code for current color scheme (only for developers)';
    public presetCode = '';

    private _commandRegisterService: CommandRegisterService;

    private _returnUiAction: IconButtonUiAction;
    private _copyToClipboardUiAction: IconButtonUiAction;

    private _closeResolve: () => void;
    private _closeReject: (reason: unknown) => void;

    constructor(private _cdr: ChangeDetectorRef, commandRegisterNgService: CommandRegisterNgService) {
        super();

        this._commandRegisterService = commandRegisterNgService.service;

        this._returnUiAction = this.createReturnUiAction();
        this._copyToClipboardUiAction = this.createCopyToClipboardUiAction();
    }

    ngAfterViewInit() {
        delay1Tick(() => this.initialiseComponents());
    }

    ngOnDestroy() {
        this._returnUiAction.finalise();
        this._copyToClipboardUiAction.finalise();
    }

    open(colorSettings: ColorSettings): ColorSchemePresetCodeNgComponent.ClosePromise {
        this.generateCodeText(colorSettings);
        this._cdr.markForCheck();

        return new Promise<void>((resolve, reject) => {
            this._closeResolve = resolve;
            this._closeReject = reject;
        });
    }

    private handleCopyToClipboardSignalAction(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        const listener = (e: ClipboardEvent) => {
            const clipboard = e.clipboardData;
            if (clipboard === null) {
                // show some type of warning in future
            } else {
                clipboard.setData('text/plain', this.presetCode);
                e.preventDefault();
            }
        };

        document.addEventListener('copy', listener, false);
        document.execCommand('copy');
        document.removeEventListener('copy', listener, false);
    }

    private handleReturnSignalAction(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.close();
    }

    private createReturnUiAction() {
        const commandName = InternalCommand.Id.GridLayoutDialog_Ok;
        const displayId = StringId.Ok;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.SubWindowReturn);
        action.signalEvent = (signalTypeId, downKeys) => this.handleReturnSignalAction(signalTypeId, downKeys);
        return action;
    }

    private createCopyToClipboardUiAction() {
        const commandName = InternalCommand.Id.ColorSchemePresetCode_CopyToClipboard;
        const displayId = StringId.CopyToClipboard;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.CopyToClipboard);
        action.signalEvent =
            (signalTypeId, downKeys) => this.handleCopyToClipboardSignalAction(signalTypeId, downKeys);
        return action;
    }


    private close() {
        this._closeResolve();
    }

    private initialiseComponents() {
        this._returnButtonComponent.initialise(this._returnUiAction);
        this._copyToClipboardButton.initialise(this._copyToClipboardUiAction);
    }

    private calculateName(color: string): string {
        const tinyColor = new TinyColor(color);
        const name = tinyColor.toName();
        if (name === false) {
            return `'${color}'`;
        } else {
            return `'${name}'`;
        }
    }

    private generateCodeText(colorSettings: ColorSettings) {
        const builder = new StringBuilder(ColorScheme.Item.idCount + 3);
        builder.appendLine(`${ColorSchemePresetCodeNgComponent._tabs2}const itemsObject: ItemsObject = {`);
        builder.appendLine(`${ColorSchemePresetCodeNgComponent._tabs3}/* eslint-disable max-len */`);
        for (let id = 0; id < ColorScheme.Item.idCount; id++) {
            let bkgdColor = colorSettings.getItemBkgd(id);
            if (bkgdColor === '') {
                bkgdColor = 'inherit';
            } else {
                bkgdColor = this.calculateName(bkgdColor);
            }
            let foreColor = colorSettings.getItemFore(id);
            if (foreColor === '') {
                foreColor = 'inherit';
            } else {
                foreColor = this.calculateName(foreColor);
            }
            const name = ColorScheme.Item.idToName(id);
            const line = `${ColorSchemePresetCodeNgComponent._tabs3}${name}: { id: ColorScheme.ItemId.${name}, ` +
                `bkgd: ${bkgdColor}, fore: ${foreColor} },`;
            builder.appendLine(line);
        }
        builder.appendLine(`${ColorSchemePresetCodeNgComponent._tabs3}/* eslint-enable max-len */`);
        builder.appendLine(`${ColorSchemePresetCodeNgComponent._tabs2}};`);
        builder.appendLine();
        this.presetCode = builder.toString();
    }
}

export namespace ColorSchemePresetCodeNgComponent {
    export type ClosePromise = Promise<void>;

    export function open(
        container: ViewContainerRef,
        colorSettings: ColorSettings,
    ): ClosePromise {
        container.clear();
        const componentRef = container.createComponent(ColorSchemePresetCodeNgComponent);
        assert(componentRef.instance instanceof ColorSchemePresetCodeNgComponent, 'CSPCCO232324');

        const component = componentRef.instance;

        return component.open(colorSettings);
    }
}
