/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from 'src/adi/internal-api';
import { MenuBarService } from 'src/controls/internal-api';
import { Command, CommandRegisterService, InternalCommand, SymbolsService } from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { EnumInfoOutOfOrderError, ExtensionHandle } from 'src/sys/internal-api';
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
            readonly newInternalCommandName: InternalCommand.Name;
            readonly menuDisplayId: StringId;
            readonly menuBarItemPosition: MenuBarService.MenuItem.Position | undefined;
        }

        type InfoObjects = { [id in keyof typeof BuiltinTypeId]: Info };

        const infoObjects: InfoObjects = {
            Placeholder: {
                id: BuiltinTypeId.Placeholder,
                name: 'Placeholder',
                newInternalCommandName: InternalCommand.Name.NewPlaceholderDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Placeholder,
                menuBarItemPosition: undefined,
            },
            Extensions: {
                id: BuiltinTypeId.Extensions,
                name: 'Extensions',
                newInternalCommandName: InternalCommand.Name.NewExtensionsDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Extensions,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.tools],
                    rank: 30000,
                }
            },
            Symbols: {
                id: BuiltinTypeId.Symbols,
                name: 'Symbols',
                newInternalCommandName: InternalCommand.Name.NewSymbolsDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Symbols,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.tools],
                    rank: 10000,
                },
            },
            DepthAndTrades: {
                id: BuiltinTypeId.DepthAndTrades,
                name: 'DepthAndTrades',
                newInternalCommandName: InternalCommand.Name.NewDepthAndTradesDitem,
                menuDisplayId: StringId.DitemMenuDisplay_DepthAndTrades,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.price],
                    rank: 40000,
                },
            },
            Watchlist: {
                id: BuiltinTypeId.Watchlist,
                name: 'Watchlist',
                newInternalCommandName: InternalCommand.Name.NewWatchlistDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Watchlist,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.price],
                    rank: 10000,
                },
            },
            Depth: {
                id: BuiltinTypeId.Depth,
                name: 'Depth',
                newInternalCommandName: InternalCommand.Name.NewDepthDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Depth,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.price],
                    rank: 20000,
                },
            },
            NewsHeadlines: {
                id: BuiltinTypeId.NewsHeadlines,
                name: 'NewsHeadlines',
                newInternalCommandName: InternalCommand.Name.NewNewsHeadlinesDitem,
                menuDisplayId: StringId.DitemMenuDisplay_NewsHeadlines,
                menuBarItemPosition: undefined,
            },
            NewsBody: {
                id: BuiltinTypeId.NewsBody,
                name: 'NewsBody',
                newInternalCommandName: InternalCommand.Name.NewNewsBodyDitem,
                menuDisplayId: StringId.DitemMenuDisplay_NewsBody,
                menuBarItemPosition: undefined,
            },
            TopShareholders: {
                id: BuiltinTypeId.TopShareholders,
                name: 'TopShareholders',
                newInternalCommandName: InternalCommand.Name.NewTopShareholdersDitem,
                menuDisplayId: StringId.DitemMenuDisplay_TopShareholders,
                menuBarItemPosition: undefined,
            },
            Status: {
                id: BuiltinTypeId.Status,
                name: 'Status',
                newInternalCommandName: InternalCommand.Name.NewStatusDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Status,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.help],
                    rank: 10000,
                },
            },
            Trades: {
                id: BuiltinTypeId.Trades,
                name: 'Trades',
                newInternalCommandName: InternalCommand.Name.NewTradesDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Trades,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.price],
                    rank: 30000,
                },
            },
            OrderRequest: {
                id: BuiltinTypeId.OrderRequest,
                name: 'OrderRequest',
                newInternalCommandName: InternalCommand.Name.NewOrderRequestDitem,
                menuDisplayId: StringId.DitemMenuDisplay_OrderRequest,
                menuBarItemPosition: undefined,
            },
            BrokerageAccounts: {
                id: BuiltinTypeId.BrokerageAccounts,
                name: 'BrokerageAccounts',
                newInternalCommandName: InternalCommand.Name.NewBrokerageAccountsDitem,
                menuDisplayId: StringId.DitemMenuDisplay_BrokerageAccounts,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.trading],
                    rank: 60000,
                },
            },
            Orders: {
                id: BuiltinTypeId.Orders,
                name: 'Orders',
                newInternalCommandName: InternalCommand.Name.NewOrdersDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Orders,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.trading],
                    rank: 30000,
                },
            },
            Holdings: {
                id: BuiltinTypeId.Holdings,
                name: 'Holdings',
                newInternalCommandName: InternalCommand.Name.NewHoldingsDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Holdings,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.trading],
                    rank: 40000,
                },
            },
            Balances: {
                id: BuiltinTypeId.Balances,
                name: 'Balances',
                newInternalCommandName: InternalCommand.Name.NewBalancesDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Balances,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.trading],
                    rank: 50000,
                },
            },
            Settings: {
                id: BuiltinTypeId.Settings,
                name: 'Settings',
                newInternalCommandName: InternalCommand.Name.NewSettingsDitem,
                menuDisplayId: StringId.DitemMenuDisplay_Settings,
                menuBarItemPosition: {
                    menuPath: [MenuBarService.Menu.Name.Root.tools],
                    rank: 20000,
                },
            },
            EtoPriceQuotation: {
                id: BuiltinTypeId.EtoPriceQuotation,
                name: 'EtoPriceQuotation',
                newInternalCommandName: InternalCommand.Name.NewEtoPriceQuotationDitem,
                menuDisplayId: StringId.DitemMenuDisplay_EtoPriceQuotation,
                menuBarItemPosition: undefined,
            },
            GeneralWebPage: {
                id: BuiltinTypeId.GeneralWebPage,
                name: 'GeneralWebPage',
                newInternalCommandName: InternalCommand.Name.NewGeneralWebPageDitem,
                menuDisplayId: StringId.DitemMenuDisplay_GeneralWebPage,
                menuBarItemPosition: undefined,
            },
            BrandingSplashWebPage: {
                id: BuiltinTypeId.BrandingSplashWebPage,
                name: 'BrandingSplashWebPage',
                newInternalCommandName: InternalCommand.Name.NewBrandingSplashWebPageDitem,
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
            return infos[id].newInternalCommandName;
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
