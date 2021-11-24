/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SessionInfoService } from 'component-services-internal-api';
import { ExtensionsAccessService } from 'content-internal-api';
import {
    BalancesDitemFrame,
    BrokerageAccountsDitemFrame,
    BuiltinDitemFrame,
    DesktopAccessService,
    DitemComponent,
    DitemFrame,
    ExtensionDitemComponent,
    ExtensionDitemFrame,
    HoldingsDitemFrame,
    OrdersDitemFrame,
    ParidepthDitemFrame,
    PlaceholderDitemFrame,
    WatchlistDitemFrame
} from 'ditem-internal-api';
import { BuiltinDitemNgComponentBaseDirective } from 'ditem-ng-api';
import {
    ComponentContainer,
    ComponentItemConfig,
    ContentItem,
    Json,
    JsonValue,
    LayoutConfig,
    LayoutManager,
    ResolvedLayoutConfig,
    RowOrColumn,
    VirtualLayout
} from 'golden-layout';
import { AssertInternalError, ExtensionHandle, TUID, UnreachableCaseError } from 'sys-internal-api';

export class GoldenLayoutHostFrame {
    constructor(
        private readonly _componentAccess: GoldenLayoutHostFrame.ComponentAccess,
        private readonly _goldenLayout: VirtualLayout,
        private readonly _defaultLayoutConfig: SessionInfoService.DefaultLayout,
        private readonly _extensionsAccessService: ExtensionsAccessService,
        private readonly _desktopAccessService: DesktopAccessService,
    ) { }

    finalise() {
    }

    saveLayout() {
        return this._goldenLayout.saveLayout();
    }

    loadLayout(config: LayoutConfig) {
        if (config === undefined) {
            config = this.createDefaultLayoutConfig();
        }

        config.settings = {
            constrainDragToContainer: true,
            showPopoutIcon: false,
            showMaximiseIcon: true,
            showCloseIcon: true,
        };
        config.header = {
            popout: false,
        };
        config.dimensions = {
            borderGrabWidth: ResolvedLayoutConfig.Dimensions.defaults.borderWidth,
        };

        this._goldenLayout.loadLayout(config);

        if (GoldenLayoutHostFrame.DefaultLayoutConfig.is(config)) {
            this.prepareDefaultLayout(config);
        }
    }

    resetLayout() {
        this.loadDefaultLayout();
    }

    loadDefaultLayout() {
        const defaultLayout = this.createDefaultLayoutConfig();
        this.loadLayout(defaultLayout);
    }

    createBuiltinComponent(typeId: BuiltinDitemFrame.BuiltinTypeId, initialState: Json | undefined,
        preferredLocationId: GoldenLayoutHostFrame.PreferredLocationId | undefined
    ) {
        const config = this.createBuiltinComponentConfig(typeId, initialState);
        return this.createComponent(config, preferredLocationId) as BuiltinDitemNgComponentBaseDirective;
    }

    createExtensionComponent(extensionHandle: ExtensionHandle, frameTypeName: string, initialState: JsonValue | undefined,
        tabText: string | undefined, preferredLocationId?: GoldenLayoutHostFrame.PreferredLocationId | undefined,
    ) {
        const config = this.createExtensionComponentConfig(extensionHandle, frameTypeName, initialState, tabText);
        return this.createComponent(config, preferredLocationId) as ExtensionDitemComponent;
    }

    destroyExtensionComponent(ditemFrame: ExtensionDitemFrame) {
        const container = ditemFrame.container;
        container.close();
    }

    createPlaceheldExtensionComponents(extensionHandle: ExtensionHandle) {
        const containedPlacehelds = this._componentAccess.getExtensionContainedPlacehelds(extensionHandle);
        for (const containedPlaceheld of containedPlacehelds) {
            this.createPlaceheldExtensionComponent(extensionHandle, containedPlaceheld);
        }
    }

    placeholdExtensionComponent(ditemFrame: ExtensionDitemFrame, reason: string) {
        const extensionPersistState = ditemFrame.getPersistState();
        const container = ditemFrame.container;

        this.placeholdComponent(
            container,
            ditemFrame.extensionHandle,
            DitemComponent.ConstructionMethodId.Extension1,
            ditemFrame.typeName,
            extensionPersistState,
            container.title,
            reason);
    }

    createSplashComponent() {
        const config = this.createBuiltinComponentConfig(BuiltinDitemFrame.BuiltinTypeId.BrandingSplashWebPage, undefined);
        config.width = 50;
        const rootItem = this._goldenLayout.rootItem;
        let contentItem: ContentItem;
        if (rootItem === undefined) {
            contentItem = this._goldenLayout.newItem(config);
        } else {
            if (rootItem.type === 'row') {
                const rootRow = rootItem as RowOrColumn;
                contentItem = rootRow.newItem(config);
            } else {
                contentItem = this._goldenLayout.newItem(config);
            }
        }

        if (!ContentItem.isComponentItem(contentItem)) {
            throw new AssertInternalError('GLHFCSC33911');
        } else {
            return contentItem.component as BuiltinDitemNgComponentBaseDirective;
        }
    }

    componentTypeToString(componentType: JsonValue) {
        const componentTypeType = typeof componentType;

        switch (componentTypeType) {
            case 'undefined': return 'undefined';
            case 'string': return componentType as string;
            case 'number': return (componentType as number).toString();
            case 'boolean': return (componentType as boolean).toString();
            case 'bigint': return 'bigint';
            case 'function': return 'function';
            case 'object': return JSON.stringify(componentType);
            case 'symbol': return 'symbol';
            default: throw new UnreachableCaseError('GLHFCTTS988854', componentTypeType);
        }
    }

    private createComponentPersistableDefinition(extensionHandle: ExtensionHandle,
        constructionMethodId: DitemComponent.ConstructionMethodId, componentTypeName: string,
    ) {
        const extensionInfo = this._extensionsAccessService.getRegisteredExtensionInfo(extensionHandle);

        const definition: DitemComponent.Definition = {
            extensionId: {
                publisherTypeId: extensionInfo.publisherTypeId,
                publisherName: extensionInfo.publisherName,
                name: extensionInfo.name,
            },
            constructionMethodId,
            componentTypeName,
        };

        return DitemComponent.Definition.toPersistable(definition);
    }

    private generateComponentId(): string {
        return TUID.getUID().toString(36);
    }

    private createDefaultLayoutConfig() {
        const watchlistItemConfig = this.createBuiltinComponentConfig(BuiltinDitemFrame.BuiltinTypeId.Watchlist, undefined);
        const orderRequestItemConfig = this.createBuiltinComponentConfig(BuiltinDitemFrame.BuiltinTypeId.OrderRequest, undefined);
        const brokerageAccountsItemConfig = this.createBuiltinComponentConfig(BuiltinDitemFrame.BuiltinTypeId.BrokerageAccounts, undefined);
        const holdingsItemConfig = this.createBuiltinComponentConfig(BuiltinDitemFrame.BuiltinTypeId.Holdings, undefined);
        const depthAndTradesItemConfig = this.createBuiltinComponentConfig(BuiltinDitemFrame.BuiltinTypeId.DepthAndTrades, undefined);
        const ordersItemConfig = this.createBuiltinComponentConfig(BuiltinDitemFrame.BuiltinTypeId.Orders, undefined);
        const balancesItemConfig = this.createBuiltinComponentConfig(BuiltinDitemFrame.BuiltinTypeId.Balances, undefined);

        const config: GoldenLayoutHostFrame.DefaultLayoutConfig = {
            root: {
                type: 'row',
                content: [
                    {
                        type: 'column',
                        width: 100,
                        content: [
                            {
                                type: 'row',
                                height: 60,
                                content: [watchlistItemConfig, orderRequestItemConfig],
                            },
                            {
                                type: 'row',
                                height: 40,
                                content: [brokerageAccountsItemConfig, holdingsItemConfig],
                            },
                        ],
                    },
                    {
                        type: 'column',
                        width: 100,
                        content: [
                            depthAndTradesItemConfig,
                            {
                                type: 'row',
                                width: 50,
                                content: [ordersItemConfig, balancesItemConfig],
                            },
                        ],
                    },
                ],
            },

            componentIds: {
                watchlist: watchlistItemConfig.id,
                orderRequest: orderRequestItemConfig.id,
                brokerageAccounts: brokerageAccountsItemConfig.id,
                holdings: holdingsItemConfig.id,
                depthAndTrades: depthAndTradesItemConfig.id,
                orders: ordersItemConfig.id,
                balances: balancesItemConfig.id,
            },
        };

        return config;
    }

    private prepareDefaultLayout(config: GoldenLayoutHostFrame.DefaultLayoutConfig) {
        const componentIds = config.componentIds;
        this.prepareDefaultLayoutWatchlist(componentIds.watchlist);
        this.prepareDefaultLayoutBrokerageAccounts(componentIds.brokerageAccounts);
        this.prepareDefaultLayoutHoldings(componentIds.holdings);
        this.prepareDefaultLayoutDepthAndTrades(componentIds.depthAndTrades);
        this.prepareDefaultLayoutOrders(componentIds.orders);
        this.prepareDefaultLayoutBalances(componentIds.balances);
        const linkedSymbol = this._defaultLayoutConfig.linkedSymbol;
        if (linkedSymbol !== undefined) {
            this._desktopAccessService.initialiseLitIvemId(linkedSymbol);
        }
    }

    private prepareDefaultLayoutWatchlist(componentId: string | undefined) {
        if (componentId !== undefined) {
            const frame = this._componentAccess.getDitemFrameByComponentId(componentId);
            if (frame === undefined || !(frame instanceof WatchlistDitemFrame)) {
                throw new AssertInternalError('GLHFPDLW1444812');
            } else {
                if (frame.litIvemIdLinkable) {
                    frame.litIvemIdLinked = true;
                }
                frame.defaultLitIvemIds = this._defaultLayoutConfig.watchlist;
            }
        }
    }

    private prepareDefaultLayoutBrokerageAccounts(componentId: string | undefined) {
        if (componentId !== undefined) {
            const frame = this._componentAccess.getDitemFrameByComponentId(componentId);
            if (frame === undefined || !(frame instanceof BrokerageAccountsDitemFrame)) {
                throw new AssertInternalError('GLHFPDLBA2444812');
            } else {
                if (frame.brokerageAccountGroupLinkable) {
                    frame.brokerageAccountGroupLinked = true;
                }
            }
        }
    }

    private prepareDefaultLayoutHoldings(componentId: string | undefined) {
        if (componentId !== undefined) {
            const frame = this._componentAccess.getDitemFrameByComponentId(componentId);
            if (frame === undefined || !(frame instanceof HoldingsDitemFrame)) {
                throw new AssertInternalError('GLHFPDLH3444812');
            } else {
                if (frame.litIvemIdLinkable) {
                    frame.litIvemIdLinked = true;
                }
                if (frame.brokerageAccountGroupLinkable) {
                    frame.brokerageAccountGroupLinked = true;
                }
            }
        }
    }

    private prepareDefaultLayoutDepthAndTrades(componentId: string | undefined) {
        if (componentId !== undefined) {
            const frame = this._componentAccess.getDitemFrameByComponentId(componentId);
            if (frame === undefined || !(frame instanceof ParidepthDitemFrame)) {
                throw new AssertInternalError('GLHFPDLDAT4444812');
            } else {
                if (frame.litIvemIdLinkable) {
                    frame.litIvemIdLinked = true;
                }
            }
        }
    }

    private prepareDefaultLayoutOrders(componentId: string | undefined) {
        if (componentId !== undefined) {
            const frame = this._componentAccess.getDitemFrameByComponentId(componentId);
            if (frame === undefined || !(frame instanceof OrdersDitemFrame)) {
                throw new AssertInternalError('GLHFPDLO5444812');
            } else {
                if (frame.brokerageAccountGroupLinkable) {
                    frame.brokerageAccountGroupLinked = true;
                }
            }
        }
    }

    private prepareDefaultLayoutBalances(componentId: string | undefined) {
        if (componentId !== undefined) {
            const frame = this._componentAccess.getDitemFrameByComponentId(componentId);
            if (frame === undefined || !(frame instanceof BalancesDitemFrame)) {
                throw new AssertInternalError('GLHFPDLB6444812');
            } else {
                if (frame.brokerageAccountGroupLinkable) {
                    frame.brokerageAccountGroupLinked = true;
                }
            }
        }
    }

    private createBuiltinComponentConfig(type: BuiltinDitemFrame.BuiltinTypeId, initialState: JsonValue | undefined, tabText?: string) {
        if (tabText === undefined) {
            tabText = BuiltinDitemFrame.BuiltinType.idToTabTitle(type);
        }

        return this.createComponentConfig(
            this._extensionsAccessService.internalHandle,
            DitemComponent.ConstructionMethodId.Builtin1,
            BuiltinDitemFrame.BuiltinType.idToName(type),
            initialState,
            tabText,
        );
    }

    private createExtensionComponentConfig(extensionHandle: ExtensionHandle,
        frameTypeName: string, initialState: JsonValue | undefined, tabText: string | undefined
    ) {
        return this.createComponentConfig(
            extensionHandle,
            DitemComponent.ConstructionMethodId.Extension1,
            frameTypeName,
            initialState,
            tabText,
        );
    }

    private createComponentConfig(
        extensionHandle: ExtensionHandle,
        constructionMethodId: DitemComponent.ConstructionMethodId,
        componentTypeName: string,
        initialState: JsonValue | undefined,
        tabText: string | undefined,
    ) {
        const definition = this.createComponentPersistableDefinition(extensionHandle, constructionMethodId, componentTypeName);

        if (tabText === undefined) {
            tabText = componentTypeName;
        }

        const config: ComponentItemConfig = {
            componentType: definition,
            title: tabText,
            type: 'component',
            id: this.generateComponentId(),
            componentState: initialState,
        };

        return config;
    }

    private createComponent(config: ComponentItemConfig, preferredLocationId: GoldenLayoutHostFrame.PreferredLocationId | undefined) {
        const locationSelectors = GoldenLayoutHostFrame.PreferredLocation.idToLocationSelectors(preferredLocationId);

        const contentItem = this._goldenLayout.newItemAtLocation(config, locationSelectors);
        if (contentItem === undefined) {
            throw new AssertInternalError('GLHFCNDC8992466');
        } else {
            if (!ContentItem.isComponentItem(contentItem)) {
                throw new AssertInternalError('GLHFCNDCC45559248');
            } else {
                return contentItem.component;
            }
        }
        // this._cdr.markForCheck();
    }

    private placeholdComponent(
        container: ComponentContainer,
        extensionHandle: ExtensionHandle,
        constructionMethodId: DitemComponent.ConstructionMethodId,
        componentTypeName: string,
        componentState: Json,
        tabText: string,
        reason: string
    ) {
        const definition = this.createComponentPersistableDefinition(extensionHandle, constructionMethodId, componentTypeName);
        const placeheld: PlaceholderDitemFrame.PersistablePlaceheld = {
            definition,
            state: componentState,
            tabText,
            reason,
            invalidReason: undefined,
        };

        const config = this.createBuiltinComponentConfig(BuiltinDitemFrame.BuiltinTypeId.Placeholder, placeheld, tabText);
        container.replaceComponent(config);
    }

    private createPlaceheldExtensionComponent(
        extensionHandle: ExtensionHandle,
        containedPlaceheld: GoldenLayoutHostFrame.ContainedPlaceheld,
    ) {
        const { container, placeheld } = containedPlaceheld;
        const definition = placeheld.definition;

        const frameTypeName = definition.componentTypeName;
        const config = this.createExtensionComponentConfig(extensionHandle, frameTypeName, placeheld.state, placeheld.tabText);

        container.replaceComponent(config);
    }
}

export namespace GoldenLayoutHostFrame {
    export const ComponentTypeNameSeparator = '`';

    export interface DefaultLayoutConfig extends LayoutConfig {
        componentIds: DefaultLayoutConfig.ComponentIds;
    }

    export namespace DefaultLayoutConfig {
        export interface ComponentIds {
            watchlist: string | undefined;
            orderRequest: string | undefined;
            brokerageAccounts: string | undefined;
            holdings: string | undefined;
            depthAndTrades: string | undefined;
            orders: string | undefined;
            balances: string | undefined;
        }

        export function is(layoutConfig: LayoutConfig): layoutConfig is DefaultLayoutConfig {
            return (layoutConfig as DefaultLayoutConfig).componentIds !== undefined;
        }
    }

    export const enum PreferredLocationId {
        FirstTabset,
        NextToFocused,
    }

    export namespace PreferredLocation {
        export function idToLocationSelectors(id: PreferredLocationId | undefined) {
            if (id === undefined) {
                return LayoutManager.defaultLocationSelectors;
            } else {
                switch (id) {
                    case PreferredLocationId.FirstTabset:
                        return LayoutManager.defaultLocationSelectors;
                    case PreferredLocationId.NextToFocused:
                        return LayoutManager.afterFocusedItemIfPossibleLocationSelectors;
                    default:
                        throw new UnreachableCaseError('GLHFPLITLS244477777', id);
                }
            }
        }
    }

    export interface ContainedPlaceheld {
        readonly container: ComponentContainer;
        readonly placeheld: PlaceholderDitemFrame.Placeheld;
    }

    export interface ComponentAccess {
        getDitemFrameByComponentId(componentId: string): DitemFrame | undefined;
        getExtensionContainedPlacehelds(extensionHandle: ExtensionHandle): ContainedPlaceheld[];
    }
}
