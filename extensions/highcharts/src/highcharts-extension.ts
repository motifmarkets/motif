/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Command, Extension, ExtensionSvc, LocalDesktop } from 'motif';
import { I18nStrings, StringId } from './i18n-strings';
import { Settings } from './settings';
import { UiFrame } from './ui-frame/ui-frame';

export class HighchartsExtension implements Extension {
    private readonly _settings: Settings;
    private _desktop: LocalDesktop;

    unloadEventer = () => this.destroy();

    constructor(private readonly _extensionSvc: ExtensionSvc) {
        I18nStrings.initialise(this._extensionSvc);
        this._settings = new Settings();
    }

    async initialise() {
        const desktop = await this.awaitDesktop();
        if (desktop !== undefined) {
            this._desktop = desktop;
            this.loadMenus();
        }
    }

    private destroy() {

    }


    private handleNewChartsFrameSignalEvent() {
        this._desktop.createFrame(UiFrame.frameTypeName);
    }

    private async awaitDesktop() {
        const desktop = await this._extensionSvc.workspaceSvc.getLoadedLocalDesktop();
        if (desktop === undefined) {
            // Extension has been uninstalled or app has terminated while waiting for desktop to be loaded
            return undefined;
        } else {
            desktop.getFrameEventer = (frameSvc) => {
                switch (frameSvc.frameTypeName) {
                    case UiFrame.frameTypeName: {
                        const uiFrame = new UiFrame(this._extensionSvc, frameSvc, this._settings);
                        uiFrame.initialise();
                        return uiFrame;
                    }
                    default: throw Error(`getFrameEvent does not support frameTypeName: ${frameSvc.frameTypeName}`);
                }
            }

            desktop.releaseFrameEventer = (frame) => (frame as UiFrame).destroy();
    
            return desktop;
        }
    }

    private loadMenus() {
        const menuBarService = this._desktop.menuBar;
        menuBarService.beginChanges();
        try {
            const PriceRootMenuName = 'Price';
            const ChartCommand: Command = {
                name: 'ChartFrame',
                defaultDisplayId: StringId.ChartFrameMenuCaption,
                defaultMenuBarItemPosition: {
                    rank: 25000,
                    menuPath: [PriceRootMenuName],
                }
            };
            const menuItem = menuBarService.createCommandMenuItem(ChartCommand);
            menuItem.signalEventer = () => this.handleNewChartsFrameSignalEvent();
        } finally {
            menuBarService.endChanges();
        }
    }
}

export namespace HighchartsExtension {
    export const cssFileUrl = 'highcharts-extension.css';
}