import { Command, Extension, ExtensionSvc, LocalDesktop } from 'motif';
import { BlueFrame } from './blue-frame';
import { I18nStrings, StringId } from './i18nStrings';

export class TsDemoExtension implements Extension {
    private _desktop: LocalDesktop;

    unloadEventer = () => this.destroy();

    constructor(private readonly _extensionSvc: ExtensionSvc) {
        I18nStrings.initialise(this._extensionSvc);

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


    private handleNewBlueFrameSignalEvent() {
        this._desktop.createFrame(BlueFrame.frameTypeName);
    }

    private async awaitDesktop() {
        const desktop = await this._extensionSvc.workspaceSvc.getLoadedLocalDesktop();
        if (desktop === undefined) {
            // Extension has been uninstalled or app has terminated while waiting for desktop to be loaded
            return undefined;
        } else {
            desktop.getFrameEventer = (frameSvc) => {
                switch (frameSvc.frameTypeName) {
                    case BlueFrame.frameTypeName: {
                        const frame = new BlueFrame(frameSvc);
                        frame.initialise();
                        return frame;
                    }
                    default: throw Error(`getFrameEvent does not support frameTypeName: ${frameSvc.frameTypeName}`);
                }
            }
            return desktop;
        }
    }

    private loadMenus() {
        const menuBarService = this._desktop.menuBar;
        menuBarService.beginChanges();
        try {
            const TsDemoRootMenuName = 'TsDemo';
            menuBarService.createRootChildMenuItem(TsDemoRootMenuName, 100000, StringId.TsDemoMenuCaption);
            const newBlueFrameCommand: Command = {
                name: 'NewBlueFrame',
                defaultDisplayId: StringId.BlueFrameMenuCaption,
                defaultMenuBarItemPosition: {
                    rank: 100,
                    menuPath: [TsDemoRootMenuName],
                }
            };
            const menuItem = menuBarService.createCommandMenuItem(newBlueFrameCommand);
            menuItem.signalEventer = () => this.handleNewBlueFrameSignalEvent();
        } finally {
            menuBarService.endChanges();
        }
    }
}