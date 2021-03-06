/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    Command,
    CommandRegisterService,
    EnumInfoOutOfOrderError,
    ExtensionHandle,
    InternalCommand,
    StringId,
    Strings,
    SymbolsService
} from '@motifmarkets/motif-core';
import { MenuBarService } from 'controls-internal-api';
import { DesktopAccessService } from './desktop-access-service';
import { DitemFrame } from './ditem-frame';

export abstract class BuiltinDitemFrame extends DitemFrame {
    constructor(private readonly _builtinDitemTypeId: BuiltinDitemFrame.BuiltinTypeId,
        ditemComponentAccess: DitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService
    ) {
        super(BuiltinDitemFrame.createBuiltinDitemTypeId(commandRegisterService.internalExtensionHandle, _builtinDitemTypeId),
            ditemComponentAccess, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    get builtinDitemTypeId() { return this._builtinDitemTypeId; }
}

export namespace BuiltinDitemFrame {
    export function createBuiltinDitemTypeId(internalExtensionHandle: ExtensionHandle,
        builtinDitemTypeId: BuiltinTypeId
    ) {
        const name = BuiltinType.idToName(builtinDitemTypeId);
        return DitemFrame.TypeId.create(internalExtensionHandle, name);
    }

    export const enum BuiltinTypeId {
        Placeholder,
        Extensions,
        Symbols,
        DepthAndTrades,
        Watchlist,
        Depth,
        NewsHeadlines,
        NewsBody,
        Alerts,
        Search,
        AdvertWebPage,
        TopShareholders,
        Status,
        Trades,
        OrderRequest,
        BrokerageAccounts,
        Orders,
        Holdings,
        Balances,
        Settings,
        EtoPriceQuotation,
        GeneralWebPage,
        BrandingSplashWebPage,
    }

    export namespace BuiltinType {
        export type Id = BuiltinTypeId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly newInternalCommandId: InternalCommand.Id;
            readonly menuDisplayId: StringId;
            readonly menuBarItemPosition: MenuBarService.MenuItem.Position | undefined;
        }

        type InfoObjects = { [id in keyof typeof BuiltinTypeId]: Info };

        const infoObjects: InfoObjects = {
            Placeholder: {
                id: BuiltinTypeId.Placeholder,
                name: 'Placeholder',
                newInternalCommandId: InternalCommand.Id.NewPlaceholderDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Placeholder,
                menuBarItemPosition: undefined,
            },
            Extensions: {
                id: BuiltinTypeId.Extensions,
                name: 'Extensions',
                newInternalCommandId: InternalCommand.Id.NewExtensionsDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Extensions,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.tools],
                    rank: 30000,
                }
            },
            Symbols: {
                id: BuiltinTypeId.Symbols,
                name: 'Symbols',
                newInternalCommandId: InternalCommand.Id.NewSymbolsDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Symbols,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.tools],
                    rank: 10000,
                },
            },
            DepthAndTrades: {
                id: BuiltinTypeId.DepthAndTrades,
                name: 'DepthAndTrades',
                newInternalCommandId: InternalCommand.Id.NewDepthAndTradesDitem,
                menuDisplayId: StringId.DitemMenuDisplay_DepthAndTrades,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.price],
                    rank: 40000,
                },
            },
            Watchlist: {
                id: BuiltinTypeId.Watchlist,
                name: 'Watchlist',
                newInternalCommandId: InternalCommand.Id.NewWatchlistDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Watchlist,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.price],
                    rank: 10000,
                },
            },
            Depth: {
                id: BuiltinTypeId.Depth,
                name: 'Depth',
                newInternalCommandId: InternalCommand.Id.NewDepthDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Depth,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.price],
                    rank: 20000,
                },
            },
            NewsHeadlines: {
                id: BuiltinTypeId.NewsHeadlines,
                name: 'NewsHeadlines',
                newInternalCommandId: InternalCommand.Id.NewNewsHeadlinesDitem,
                menuDisplayId: StringId.DitemMenuDisplay_NewsHeadlines,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.tools],
                    rank: 15000,
                },
            },
            NewsBody: {
                id: BuiltinTypeId.NewsBody,
                name: 'NewsBody',
                newInternalCommandId: InternalCommand.Id.NewNewsBodyDitem,
                menuDisplayId: StringId.DitemMenuDisplay_NewsBody,
                menuBarItemPosition: undefined,
            },
            Alerts: {
                id: BuiltinTypeId.Alerts,
                name: 'Alerts',
                newInternalCommandId: InternalCommand.Id.NewAlertsDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Alerts,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.tools],
                    rank: 16000,
                },
            },
            Search: {
                id: BuiltinTypeId.Search,
                name: 'Search',
                newInternalCommandId: InternalCommand.Id.NewSearchDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Search,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.tools],
                    rank: 17000,
                },
            },
            AdvertWebPage: {
                id: BuiltinTypeId.AdvertWebPage,
                name: 'Spectaculix Web Page',
                newInternalCommandId: InternalCommand.Id.NewAdvertWebPageDitem,
                menuDisplayId: StringId.DitemMenuDisplay_AdvertWebPage,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.tools],
                    rank: 18000,
                },
            },
            TopShareholders: {
                id: BuiltinTypeId.TopShareholders,
                name: 'TopShareholders',
                newInternalCommandId: InternalCommand.Id.NewTopShareholdersDitem,
                menuDisplayId: StringId.DitemMenuDisplay_TopShareholders,
                menuBarItemPosition: undefined,
            },
            Status: {
                id: BuiltinTypeId.Status,
                name: 'Status',
                newInternalCommandId: InternalCommand.Id.NewStatusDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Status,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.help],
                    rank: 10000,
                },
            },
            Trades: {
                id: BuiltinTypeId.Trades,
                name: 'Trades',
                newInternalCommandId: InternalCommand.Id.NewTradesDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Trades,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.price],
                    rank: 30000,
                },
            },
            OrderRequest: {
                id: BuiltinTypeId.OrderRequest,
                name: 'OrderRequest',
                newInternalCommandId: InternalCommand.Id.NewOrderRequestDitem,
                menuDisplayId: StringId.DitemMenuDisplay_OrderRequest,
                menuBarItemPosition: undefined,
            },
            BrokerageAccounts: {
                id: BuiltinTypeId.BrokerageAccounts,
                name: 'BrokerageAccounts',
                newInternalCommandId: InternalCommand.Id.NewBrokerageAccountsDitem,
                menuDisplayId: StringId.DitemMenuDisplay_BrokerageAccounts,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.trading],
                    rank: 60000,
                },
            },
            Orders: {
                id: BuiltinTypeId.Orders,
                name: 'Orders',
                newInternalCommandId: InternalCommand.Id.NewOrdersDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Orders,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.trading],
                    rank: 30000,
                },
            },
            Holdings: {
                id: BuiltinTypeId.Holdings,
                name: 'Holdings',
                newInternalCommandId: InternalCommand.Id.NewHoldingsDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Holdings,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.trading],
                    rank: 40000,
                },
            },
            Balances: {
                id: BuiltinTypeId.Balances,
                name: 'Balances',
                newInternalCommandId: InternalCommand.Id.NewBalancesDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Balances,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.trading],
                    rank: 50000,
                },
            },
            Settings: {
                id: BuiltinTypeId.Settings,
                name: 'Settings',
                newInternalCommandId: InternalCommand.Id.NewSettingsDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Settings,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.tools],
                    rank: 20000,
                },
            },
            EtoPriceQuotation: {
                id: BuiltinTypeId.EtoPriceQuotation,
                name: 'EtoPriceQuotation',
                newInternalCommandId: InternalCommand.Id.NewEtoPriceQuotationDitem,
                menuDisplayId: StringId.DitemMenuDisplay_EtoPriceQuotation,
                menuBarItemPosition: undefined,
            },
            GeneralWebPage: {
                id: BuiltinTypeId.GeneralWebPage,
                name: 'GeneralWebPage',
                newInternalCommandId: InternalCommand.Id.NewGeneralWebPageDitem,
                menuDisplayId: StringId.DitemMenuDisplay_GeneralWebPage,
                menuBarItemPosition: undefined,
            },
            BrandingSplashWebPage: {
                id: BuiltinTypeId.BrandingSplashWebPage,
                name: 'BrandingSplashWebPage',
                newInternalCommandId: InternalCommand.Id.NewBrandingSplashWebPageDitem,
                menuDisplayId: StringId.DitemMenuDisplay_BrandingSplashWebPage,
                menuBarItemPosition: undefined,
            },
        };

        export const idCount = Object.keys(infoObjects).length;
        const infos = Object.values(infoObjects);

        export function staticConstructor() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: number) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('InputComponent.Id', outOfOrderIdx, infos[outOfOrderIdx].name);
            }
        }

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function tryNameToId(name: string) {
            const index = infos.findIndex(info => info.name === name);
            return index >= 0 ? infos[index].id : undefined;
        }

        export function idToJsonValue(id: Id) {
            return idToName(id);
        }

        export function tryJsonValueToId(jsonValue: string) {
            return tryNameToId(jsonValue);
        }

        export function idToTabTitle(id: Id) {
            return idToMenuDisplay(id);
        }

        export function idToNewInternalCommandName(id: Id) {
            return infos[id].newInternalCommandId;
        }

        export function idToMenuDisplayId(id: Id) {
            return infos[id].menuDisplayId;
        }

        export function idToMenuBarItemPosition(id: Id): Command.MenuBarItemPosition | undefined {
            return infos[id].menuBarItemPosition;
        }

        export function idToMenuDisplay(id: Id) {
            return Strings[idToMenuDisplayId(id)];
        }

        export function getAll(): Id[] {
            return infos.map(info => info.id);
        }
    }
}
export namespace BuiltinDitemFrameModule {
    export function initialiseStatic(): void {
        BuiltinDitemFrame.BuiltinType.staticConstructor();
    }
}
