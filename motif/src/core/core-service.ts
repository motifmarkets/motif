/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from 'src/adi/internal-api';
import { MultiEvent } from 'src/sys/internal-api';
import { AppStorageService } from './app-storage-service';
import { CommandRegisterService } from './command/internal-api';
import { MotifServicesService } from './motif-services-service';
import { SettingsService } from './settings/settings-service';
import { setSymbolDetailCache, SymbolDetailCache } from './symbol-detail-cache';
import { SymbolsService } from './symbols-service';
import { setTableDefinitionFactory, TableDefinitionFactory } from './table-definition-factory';
import { setTableDirectory, TableDirectory } from './table-directory';
import { setTableRecordDefinitionListDirectory, TableRecordDefinitionListDirectory } from './table-record-definition-list-directory';
import { setTableRecordDefinitionListFactory, TableRecordDefinitionListFactory } from './table-record-definition-list-factory';
import { TextFormatter, textFormatter, TextFormatterModule } from './text-formatter';

export class CoreService {
    private _finalised = false;

    private readonly _settingsService: SettingsService;
    private readonly _motifServicesService: MotifServicesService;
    private readonly _appStorageService: AppStorageService;
    private readonly _adiService: AdiService;
    private readonly _symbolsService: SymbolsService;
    private readonly _commandRegisterService: CommandRegisterService;

    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _activeColorSchemeName: string;

    constructor() {
        this._settingsService = new SettingsService();
        this._motifServicesService = new MotifServicesService(this._settingsService);
        this._appStorageService = new AppStorageService(this._motifServicesService);
        this._adiService = new AdiService();
        this._symbolsService = new SymbolsService(this._settingsService, this._adiService);
        this._commandRegisterService = new CommandRegisterService();

        setSymbolDetailCache(new SymbolDetailCache(this._adiService.dataMgr, this._symbolsService));
        setTableRecordDefinitionListFactory(new TableRecordDefinitionListFactory(
            this._adiService,
            this._settingsService,
            this._symbolsService,
        ));
        setTableDefinitionFactory(new TableDefinitionFactory(this._adiService));
        setTableRecordDefinitionListDirectory(new TableRecordDefinitionListDirectory());
        setTableDirectory(new TableDirectory());
        TextFormatterModule.setTextFormatter(new TextFormatter(this._symbolsService, this._settingsService));

        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => {
            this.handleSettingsChanged();
        });
    }

    get settingsService() { return this._settingsService; }
    get motifServicesService() { return this._motifServicesService; }
    get applicationStateStorage() { return this._appStorageService; }
    get adi() { return this._adiService; }
    get symbolsManager() { return this._symbolsService; }
    get commandRegisterService() { return this._commandRegisterService; }

    finalise() {
        if (!this._finalised) {
            this._motifServicesService.finalise();
            this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
            this._settingsChangedSubscriptionId = undefined;

            textFormatter.finalise();
            this.symbolsManager.finalise();
        }
    }

    private handleSettingsChanged(): void {

        // const colorSchemeName = this._settings.appearance.activeColorSchemeName || ColorSchemePreset.DARK_PRESET_NAME;
        // if (this._activeColorSchemeName !== colorSchemeName) {
        //     this._activeColorSchemeName = colorSchemeName;
        //     this.loadColorScheme(this._activeColorSchemeName);
        // }
    }

    // private updateCssVariables(): void {

    //     // #CodeLink[15141146197] Define CSS variables.

    //     function replaceEmptyColorString(value: string): string {
    //         return value.trim() === ''
    //             ? 'inherit'
    //             : value;
    //     }

    //     const motifRoot = document.querySelector('#motif-root');
    //     assert(assigned(motifRoot), 'ID:20919132025');

    //     ColorScheme.Item.getAll()
    //         .filter(ColorScheme.Item.idIsCssVariable)
    //         .forEach(id => {
    //             if (ColorScheme.Item.idHasFore(id)) {
    //                 const cssVarName = ColorScheme.Item.idToForeCssVariableName(id);
    //                 const cssVarValue = replaceEmptyColorString(this._settings.colorScheme.getForeColor(id));
    //                 (motifRoot as HTMLElement).style.setProperty(cssVarName, cssVarValue);
    //             }
    //             if (ColorScheme.Item.idHasBkgd(id)) {
    //                 const cssVarName = ColorScheme.Item.idToBkgdCssVariableName(id);
    //                 const cssVarValue = replaceEmptyColorString(this._settings.colorScheme.getBkgdColor(id));
    //                 (motifRoot as HTMLElement).style.setProperty(cssVarName, cssVarValue);
    //             }
    //         });
    // }
}
