/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ComponentRef,
    createComponent,
    createEnvironmentInjector,
    EnvironmentInjector,
    Type,
    ValueProvider
} from '@angular/core';
import { EnumInfoOutOfOrderError } from '@motifmarkets/motif-core';
import { BuiltinDitemFrame } from 'ditem-internal-api';
import {
    AdvertWebPageDitemNgComponent,
    AlertsDitemNgComponent,
    BalancesDitemNgComponent,
    BrandingSplashWebPageDitemNgComponent,
    BrokerageAccountsDitemNgComponent,
    BuiltinDitemNgComponentBaseNgDirective,
    DepthAndSalesDitemNgComponent,
    DepthDitemNgComponent,
    DiagnosticsDitemNgComponent,
    EtoPriceQuotationDitemNgComponent,
    ExtensionsDitemNgComponent,
    HoldingsDitemNgComponent,
    NewsBodyDitemNgComponent,
    NewsHeadlinesDitemNgComponent,
    OrderAuthoriseDitemNgComponent,
    OrderRequestDitemNgComponent,
    OrdersDitemNgComponent,
    PlaceholderDitemNgComponent,
    ScansDitemNgComponent,
    SearchDitemNgComponent,
    SearchSymbolsDitemNgComponent,
    SettingsDitemNgComponent,
    StatusDitemNgComponent,
    TopShareholdersDitemNgComponent,
    TradesDitemNgComponent,
    WatchlistDitemNgComponent
} from 'ditem-ng-api';
import { ComponentContainer } from 'golden-layout';

export class DitemComponentFactoryNgService {
    constructor(private readonly _environmentInjector: EnvironmentInjector) {
    }

    createComponent(componentTypeName: string, container: ComponentContainer): ComponentRef<BuiltinDitemNgComponentBaseNgDirective> {
        const id = BuiltinDitemFrame.BuiltinType.tryNameToId(componentTypeName);
        let componentType: Type<BuiltinDitemNgComponentBaseNgDirective>;
        if (id === undefined) {
            componentType = PlaceholderDitemNgComponent;
        } else {
            componentType = DitemComponentFactoryNgService.Builtin.idToType(id);
        }

        const provider: ValueProvider = {
            provide: BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken,
            useValue: container,
        };

        const newEnvironmentInjector = createEnvironmentInjector([provider], this._environmentInjector);
        return createComponent(componentType, { environmentInjector: newEnvironmentInjector } );
    }
}

export namespace DitemComponentFactoryNgService {
    export interface Entry {
        readonly extensionPublisher: string;
        readonly extensionName: string;
        readonly componentTypeName: string;
        readonly ditemComponentType: Type<BuiltinDitemNgComponentBaseNgDirective>;
    }

    export namespace Builtin {
        interface Info {
            readonly id: BuiltinDitemFrame.BuiltinTypeId;
            readonly type: Type<BuiltinDitemNgComponentBaseNgDirective>;
        }

        type InfosObject = { [id in keyof typeof BuiltinDitemFrame.BuiltinTypeId]: Info };

        const infosObject: InfosObject = {
            Placeholder: {
                id: BuiltinDitemFrame.BuiltinTypeId.Placeholder,
                type: PlaceholderDitemNgComponent,
            },
            Extensions: {
                id: BuiltinDitemFrame.BuiltinTypeId.Extensions,
                type: ExtensionsDitemNgComponent,
            },
            Symbols: {
                id: BuiltinDitemFrame.BuiltinTypeId.Symbols,
                type: SearchSymbolsDitemNgComponent,
            },
            DepthAndTrades: {
                id: BuiltinDitemFrame.BuiltinTypeId.DepthAndTrades,
                type: DepthAndSalesDitemNgComponent,
            },
            Watchlist: {
                id: BuiltinDitemFrame.BuiltinTypeId.Watchlist,
                type: WatchlistDitemNgComponent,
            },
            Depth: {
                id: BuiltinDitemFrame.BuiltinTypeId.Depth,
                type: DepthDitemNgComponent,
            },
            NewsHeadlines: {
                id: BuiltinDitemFrame.BuiltinTypeId.NewsHeadlines,
                type: NewsHeadlinesDitemNgComponent,
            },
            NewsBody: {
                id: BuiltinDitemFrame.BuiltinTypeId.NewsBody,
                type: NewsBodyDitemNgComponent,
            },
            Scans: {
                id: BuiltinDitemFrame.BuiltinTypeId.Scans,
                type: ScansDitemNgComponent,
            },
            Alerts: {
                id: BuiltinDitemFrame.BuiltinTypeId.Alerts,
                type: AlertsDitemNgComponent,
            },
            Search: {
                id: BuiltinDitemFrame.BuiltinTypeId.Search,
                type: SearchDitemNgComponent,
            },
            AdvertWebPage: {
                id: BuiltinDitemFrame.BuiltinTypeId.AdvertWebPage,
                type: AdvertWebPageDitemNgComponent,
            },
            TopShareholders: {
                id: BuiltinDitemFrame.BuiltinTypeId.TopShareholders,
                type: TopShareholdersDitemNgComponent,
            },
            Status: {
                id: BuiltinDitemFrame.BuiltinTypeId.Status,
                type: StatusDitemNgComponent,
            },
            Trades: {
                id: BuiltinDitemFrame.BuiltinTypeId.Trades,
                type: TradesDitemNgComponent,
            },
            OrderRequest: {
                id: BuiltinDitemFrame.BuiltinTypeId.OrderRequest,
                type: OrderRequestDitemNgComponent,
            },
            BrokerageAccounts: {
                id: BuiltinDitemFrame.BuiltinTypeId.BrokerageAccounts,
                type: BrokerageAccountsDitemNgComponent,
            },
            Orders: {
                id: BuiltinDitemFrame.BuiltinTypeId.Orders,
                type: OrdersDitemNgComponent,
            },
            OrderAuthorise: {
                id: BuiltinDitemFrame.BuiltinTypeId.OrderAuthorise,
                type: OrderAuthoriseDitemNgComponent,
            },
            Holdings: {
                id: BuiltinDitemFrame.BuiltinTypeId.Holdings,
                type: HoldingsDitemNgComponent,
            },
            Balances: {
                id: BuiltinDitemFrame.BuiltinTypeId.Balances,
                type: BalancesDitemNgComponent,
            },
            Settings: {
                id: BuiltinDitemFrame.BuiltinTypeId.Settings,
                type: SettingsDitemNgComponent,
            },
            Diagnostics: {
                id: BuiltinDitemFrame.BuiltinTypeId.Diagnostics,
                type: DiagnosticsDitemNgComponent,
            },
            EtoPriceQuotation: {
                id: BuiltinDitemFrame.BuiltinTypeId.EtoPriceQuotation,
                type: EtoPriceQuotationDitemNgComponent,
            },
            GeneralWebPage: {
                id: BuiltinDitemFrame.BuiltinTypeId.GeneralWebPage,
                type: BrandingSplashWebPageDitemNgComponent,
            },
            BrandingSplashWebPage: {
                id: BuiltinDitemFrame.BuiltinTypeId.BrandingSplashWebPage,
                type: BrandingSplashWebPageDitemNgComponent,
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let i = 0; i < idCount; i++) {
                if (infos[i].id !== i as BuiltinDitemFrame.BuiltinTypeId) {
                    throw new EnumInfoOutOfOrderError('DitemComponentFactoryNgService.Builtin', i, BuiltinDitemFrame.BuiltinType.idToName(i));
                }
            }
        }

        export function idToType(id: BuiltinDitemFrame.BuiltinTypeId) {
            return infos[id].type;
        }
    }
}

export namespace DitemComponentFactoryNgServiceModule {
    export function initialiseStatic() {
        DitemComponentFactoryNgService.Builtin.initialise();
    }
}
