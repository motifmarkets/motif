import { Command, Extension, ExtensionSvc, LocalDesktop } from 'motif';
import { NonWebPageFrame } from './non-web-page-frame';
import { I18nStrings, StringId, strings } from './i18nStrings';
import { WebPageFrame } from './web-page-frame';

export class WebsiteEmbedExtension implements Extension {
    private readonly webPageMenuItemConfigs: WebPageMenuItemConfig[] = [
        {
            name: 'NewHomePageFrame',
            displayId: StringId.HomePageFrameMenuCaption,
            rank: 100,
            url: 'https://motionite.trade/',
        },
        {
            name: 'NewAdvantagesPageFrame',
            displayId: StringId.AdvantagesPageFrameMenuCaption,
            rank: 200,
            url: 'https://motionite.trade/advantages/',
        },
        {
            name: 'NewFeaturesPageFrame',
            displayId: StringId.FeaturesPageFrameMenuCaption,
            rank: 300,
            url: 'https://motionite.trade/features/',
        },
        {
            name: 'NewDocumentationPageFrame',
            displayId: StringId.DocumentationFrameMenuCaption,
            rank: 400,
            url: 'https://motionite.trade/documentation/',
        },
        {
            name: 'NewContactPageFrame',
            displayId: StringId.ContactPageFrameMenuCaption,
            rank: 500,
            url: 'https://motionite.trade/contact/',
        },
    ];

    private readonly nonWebPageMenuItemConfig: NonWebPageMenuItemConfig = {
        name: 'NewNonWebPage',
        displayId: StringId.NonWebPageFrameMenuCaption,
        rank: 100,
    };

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

    private handleWebPageMenuItemSignalEvent(menuItemConfig: WebPageMenuItemConfig) {
        const tabText = 'Motionite: ' + strings[menuItemConfig.displayId];
        const frameConfig: WebPageFrame.FrameConfig = {
            url: menuItemConfig.url,
        };
        this._desktop.createFrame(WebPageFrame.frameTypeName, tabText, frameConfig);
    }

    private handleNonWebPageMenuItemSignalEvent(menuItemConfig: NonWebPageMenuItemConfig) {
        const tabText = 'Motionite: ' + strings[menuItemConfig.displayId];
        this._desktop.createFrame(NonWebPageFrame.frameTypeName, tabText);
    }

    private async awaitDesktop() {
        const desktop = await this._extensionSvc.workspaceSvc.getLoadedLocalDesktop();
        if (desktop === undefined) {
            // Extension has been uninstalled or app has terminated while waiting for desktop to be loaded
            return undefined;
        } else {
            desktop.getFrameEventer = (frameSvc) => {
                switch (frameSvc.frameTypeName) {
                    case WebPageFrame.frameTypeName: {
                        const initialPersistState = frameSvc.initialPersistState;
                        if (initialPersistState === undefined) {
                            throw new Error('Frame missing initialPersistState');
                        }
                        const frame = new WebPageFrame(frameSvc, initialPersistState.json as WebPageFrame.FrameConfig);
                        frame.initialise();
                        return frame;
                    }

                    case NonWebPageFrame.frameTypeName: {
                        const frame = new NonWebPageFrame(frameSvc);
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
            const motioniteRootMenuName = 'Motionite';
            menuBarService.createRootChildMenuItem(motioniteRootMenuName, 100000, StringId.MotioniteWebsiteMenuCaption);

            const menuItemConfigs = this.webPageMenuItemConfigs;
            const menuItemConfigCount = menuItemConfigs.length;
            for (let i = 0; i < menuItemConfigCount; i++) {
                const menuItemConfig = menuItemConfigs[i]; // used in signalEventer closure
                this.addWebPageMenuItem([motioniteRootMenuName], menuItemConfig);
            }

            const nonWebPageChildMenuName = 'NonWebPage';
            const nonWebPageItemPosition: Command.MenuBarItemPosition = {
                rank: 2000,
                menuPath: [motioniteRootMenuName],
            }
            menuBarService.createChildMenuItem(nonWebPageChildMenuName, nonWebPageItemPosition, undefined, undefined, true);
            this.addNonWebPageMenuItem([motioniteRootMenuName, nonWebPageChildMenuName], this.nonWebPageMenuItemConfig);
            
        } finally {
            menuBarService.endChanges();
        }
    }

    private addWebPageMenuItem(menuPath: string[], menuItemConfig: WebPageMenuItemConfig) {
        const menuBarService = this._desktop.menuBar;
        const newFrameCommand: Command = {
            name: menuItemConfig.name,
            defaultDisplayId: menuItemConfig.displayId,
            defaultMenuBarItemPosition: {
                rank: menuItemConfig.rank,
                menuPath,
            }
        };
        const menuItem = menuBarService.createCommandMenuItem(newFrameCommand);
        menuItem.signalEventer = () => this.handleWebPageMenuItemSignalEvent(menuItemConfig);
    }

    private addNonWebPageMenuItem(menuPath: string[], menuItemConfig: NonWebPageMenuItemConfig) {
        const menuBarService = this._desktop.menuBar;
        const newFrameCommand: Command = {
            name: menuItemConfig.name,
            defaultDisplayId: menuItemConfig.displayId,
            defaultMenuBarItemPosition: {
                rank: menuItemConfig.rank,
                menuPath,
            }
        };
        const menuItem = menuBarService.createCommandMenuItem(newFrameCommand);
        menuItem.signalEventer = () => this.handleNonWebPageMenuItemSignalEvent(menuItemConfig);
    }
}

interface WebPageMenuItemConfig {
    name: string,
    displayId: StringId,
    rank: number,
    url: string,
}

interface NonWebPageMenuItemConfig {
    name: string,
    displayId: StringId,
    rank: number,
}
