/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ApplicationRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    EmbeddedViewRef,
    HostListener,
    OnDestroy,

    ViewEncapsulation
} from '@angular/core';
import {
    ComponentContainer,
    ComponentItem,
    GoldenLayout,
    JsonValue,
    ResolvedComponentItemConfig
} from 'golden-layout';
import { SessionInfoNgService, SettingsNgService } from 'src/component-services/ng-api';
import { ExtensionId } from 'src/content/internal-api';
import { ExtensionsAccessNgService } from 'src/content/ng-api';
import { ColorScheme, ColorSettings, SettingsService } from 'src/core/internal-api';
import {
    BuiltinDitemFrame,
    DitemComponent,
    DitemComponentIdAndType,
    DitemFrame,
    ExtensionDitemComponent,
    PlaceholderDitemFrame
} from 'src/ditem/internal-api';
import {
    BuiltinDitemNgComponentBaseDirective,
    DesktopAccessNgService,
    DitemComponentFactoryNgService,
    PlaceholderDitemNgComponent
} from 'src/ditem/ng-api';
import { StringId, Strings } from 'src/res/i18n-strings';
import {
    AssertInternalError,
    ExtensionHandle,
    getElementDocumentPosition,
    Json,
    MultiEvent,
    UnreachableCaseError
} from 'src/sys/internal-api';
import { FrameExtensionsAccessService } from '../frame-extension-access-service';
import { GoldenLayoutHostFrame } from '../golden-layout-host-frame';

@Component({
    selector: 'app-golden-layout-host',
    templateUrl: './golden-layout-host-ng.component.html',
    styleUrls: ['./golden-layout-host-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class GoldenLayoutHostNgComponent implements OnDestroy, GoldenLayoutHostFrame.ComponentAccess {

    private readonly _frame: GoldenLayoutHostFrame;
    private readonly _goldenLayout: GoldenLayout;

    private readonly _containerMap = new Map<ComponentContainer, GoldenLayoutHostNgComponent.ContainedDitemComponent>();

    private readonly _settingsService: SettingsService;
    private readonly _colorSettings: ColorSettings;
    private readonly _extensionsAccessService: FrameExtensionsAccessService;

    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    get frame() { return this._frame; }

    constructor(
        private readonly _cdr: ChangeDetectorRef,
        private readonly _elRef: ElementRef<HTMLElement>,
        private readonly _appRef: ApplicationRef,
        private readonly _ditemComponentFactoryNgService: DitemComponentFactoryNgService,
        sessionNgService: SessionInfoNgService,
        settingsNgService: SettingsNgService,
        extensionsAccessNgService: ExtensionsAccessNgService,
        desktopAccessNgService: DesktopAccessNgService,
    ) {
        this._settingsService = settingsNgService.settingsService;
        this._colorSettings = this._settingsService.color;
        this._extensionsAccessService = extensionsAccessNgService.service;

        this._goldenLayout = new GoldenLayout(this._elRef.nativeElement);
        this._goldenLayout.getComponentEvent = (container, itemConfig) => this.handleGetComponentEvent(container, itemConfig);
        this._goldenLayout.releaseComponentEvent = (container, component) => this.handleReleaseComponentEvent(container, component);

        this._frame = new GoldenLayoutHostFrame(this, this._goldenLayout, sessionNgService.service.defaultLayout,
            this._extensionsAccessService, desktopAccessNgService.service);

        this.registerDitemComponents();

        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());
    }

    @HostListener('window:resize', ['$event']) onResize(event: UIEvent) {
        const { left: layoutLeft, top: layoutTop} = getElementDocumentPosition(this._elRef.nativeElement);
        const bodyWidth = document.body.offsetWidth;
        const bodyHeight = document.body.offsetHeight;
        this._goldenLayout.setSize(bodyWidth - layoutLeft, bodyHeight - layoutTop);
    }

    ngOnDestroy() {
        this._frame.finalise();
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
        this._goldenLayout.destroy();
    }

    // Component Access functions
    public getDitemFrameByComponentId(componentId: string): DitemFrame | undefined {
        const componentItem = this._goldenLayout.findFirstComponentItemById(componentId);
        if (componentItem === undefined) {
            return undefined;
        } else {
            const component = componentItem.container.component;
            if (component instanceof BuiltinDitemNgComponentBaseDirective) {
                return component.ditemFrame;
            } else {
                return undefined;
            }
        }
    }

    public getExtensionContainedPlacehelds(extensionHandle: ExtensionHandle) {
        const extensionInfo = this._extensionsAccessService.getRegisteredExtensionInfo(extensionHandle);

        const maxCount = this._containerMap.size;
        const result = new Array<GoldenLayoutHostFrame.ContainedPlaceheld>(maxCount);
        let count = 0;

        for (const [ container, containedDitemComponent ] of this._containerMap) {
            const builtinComponentRef = containedDitemComponent.builtinComponentRef;
            if (builtinComponentRef !== undefined) {
                const builtinComponent = builtinComponentRef.instance;
                const ditemFrame = builtinComponent.ditemFrame;
                if (PlaceholderDitemFrame.is(ditemFrame)) {
                    const placeheld = ditemFrame.placeheld;
                    const definition = placeheld.definition;
                    if (ExtensionId.isEqual(definition.extensionId, extensionInfo)) {
                        const containedPlaceheld: GoldenLayoutHostFrame.ContainedPlaceheld = {
                            container,
                            placeheld,
                        };
                        result[count++] = containedPlaceheld;
                    }
                }
            }
        }

        result.length = count;
        return result;
    }

    private handleGetComponentEvent(container: ComponentContainer, itemConfig: ResolvedComponentItemConfig): ComponentItem.Component {
        const parseResult = this.parseGoldenLayoutComponentType(itemConfig.componentType);
        const componentDefinition = parseResult.definition;

        const componentState = itemConfig.componentState;
        let state: Json | undefined;
        if (componentState === undefined) {
            state = undefined;
        } else {
            if (!JsonValue.isJson(componentState)) {
                state = undefined;
            } else {
                state = componentState;
            }
        }

        if (parseResult.errorText !== undefined) {
            const placeheld: PlaceholderDitemFrame.Placeheld = {
                definition: componentDefinition,
                state,
                tabText: itemConfig.title,
                reason: parseResult.errorText,
                invalidReason: undefined,
            };
            return this.getPlaceholderComponent(container, placeheld);
        } else {
            switch (componentDefinition.constructionMethodId) {
                case DitemComponent.ConstructionMethodId.Invalid:
                    throw new AssertInternalError('GLHCHGCE78533009');
                case DitemComponent.ConstructionMethodId.Builtin1:
                    return this.getBuiltinComponent(container, componentDefinition);
                case DitemComponent.ConstructionMethodId.Extension1: {
                    const getComponentResult = this.getExtensionComponent(container, componentDefinition);
                    const component = getComponentResult.component;
                    if (component !== undefined) {
                        return component;
                    } else {
                        // Need to create a placeholder
                        const errorText = getComponentResult.errorText;
                        const reason = errorText === undefined ? Strings[StringId.Unknown] : errorText;

                        const placeheld: PlaceholderDitemFrame.Placeheld = {
                            definition: componentDefinition,
                            state,
                            tabText: itemConfig.title,
                            reason,
                            invalidReason: undefined,
                        };
                        return this.getPlaceholderComponent(container, placeheld);
                    }
                }
                default:
                    throw new UnreachableCaseError('GLHCHGCEU199533', componentDefinition.constructionMethodId);
            }
        }
    }

    private handleReleaseComponentEvent(container: ComponentContainer, component: ComponentItem.Component) {
        const containedDitemComponent = this._containerMap.get(container);
        if (containedDitemComponent === undefined) {
            const componentTypeAsStr = this._frame.componentTypeToString(container.componentType);
            throw new AssertInternalError('GLHCHRCEU313122', componentTypeAsStr);
        } else {
            const componentRef = containedDitemComponent.builtinComponentRef;
            if (componentRef !== undefined) {
                this.releaseBuiltinComponent(container, componentRef);
            } else {
                const extensionDitemComponent = containedDitemComponent.extensionComponent;
                if (extensionDitemComponent !== undefined) {
                    this.releaseExtensionComponent(container, extensionDitemComponent);
                } else {
                    const componentTypeAsStr = this._frame.componentTypeToString(container.componentType);
                    throw new AssertInternalError('GLHCHRCEE313122', componentTypeAsStr);
                }
            }

            this._containerMap.delete(container);
        }
    }

    private handleSettingsChangedEvent() {
        this.applySettings();
    }

    private registerDitemComponents() {
        const factoryService = this._ditemComponentFactoryNgService;
        const allIdAndTypes = DitemComponentIdAndType.all;
        for (const { id, type } of allIdAndTypes) {
            const name = BuiltinDitemFrame.BuiltinType.idToName(id);
            factoryService.registerDitemComponentType(name, type);
        }
    }

    private applySettings() {
        for (const itemId of GoldenLayoutHostNgComponent.layoutColorSchemeItems) {
            if (ColorScheme.Item.idHasBkgd(itemId)) {
                const varName = ColorScheme.Item.idToBkgdCssVariableName(itemId);
                const color = this._colorSettings.getBkgd(itemId);
                this._elRef.nativeElement.style.setProperty(varName, color);
            }
            if (ColorScheme.Item.idHasFore(itemId)) {
                const varName = ColorScheme.Item.idToForeCssVariableName(itemId);
                const color = this._colorSettings.getFore(itemId);
                this._elRef.nativeElement.style.setProperty(varName, color);
            }
        }
        this._cdr.markForCheck();
    }

    private parseGoldenLayoutComponentType(value: JsonValue): DitemComponent.Definition.FromPersistableResult {
        if (value === undefined) {
            throw new AssertInternalError('GLHCPGLCTU98983333');
        } else {
            if (!JsonValue.isJsonObject(value)) {
                if (value === null) {
                    throw new AssertInternalError('GLHCPGLCTN98983333');
                } else {
                    throw new AssertInternalError('GLHCPGLCTJ98983333', value.toString());
                }
            } else {
                const persistableDefinition = value as DitemComponent.PersistableDefinition;
                return DitemComponent.Definition.fromPersistable(persistableDefinition);
            }
        }
    }

    private createPlaceholderComponentDefinition() {
        const extensionInfo = this._extensionsAccessService.internalRegisteredExtensionInfo;

        const result: DitemComponent.Definition = {
            extensionId: {
                publisherTypeId: extensionInfo.publisherTypeId,
                publisherName: extensionInfo.publisherName,
                name: extensionInfo.name,
            },
            constructionMethodId: DitemComponent.ConstructionMethodId.Builtin1,
            componentTypeName: BuiltinDitemFrame.BuiltinType.idToName(BuiltinDitemFrame.BuiltinTypeId.Placeholder),
        };

        return result;
    }

    private getBuiltinComponent(
        container: ComponentContainer,
        componentDefinition: DitemComponent.Definition,
    ) {
        const componentTypeName = componentDefinition.componentTypeName;
        const componentRef = this._ditemComponentFactoryNgService.createComponent(componentTypeName, container);

        this._appRef.attachView(componentRef.hostView);

        const componentRootElement = (componentRef.hostView as EmbeddedViewRef<unknown>).rootNodes[0] as HTMLElement;
        container.element.appendChild(componentRootElement);

        const containedDitemComponent: GoldenLayoutHostNgComponent.ContainedDitemComponent = {
            builtinComponentRef: componentRef,
            extensionComponent: undefined,
        };

        this._containerMap.set(container, containedDitemComponent);

        return componentRef.instance;
    }

    private releaseBuiltinComponent(container: ComponentContainer, componentRef: ComponentRef<BuiltinDitemNgComponentBaseDirective>) {
        const componentRootElement = (componentRef.hostView as EmbeddedViewRef<unknown>).rootNodes[0] as HTMLElement;
        container.element.removeChild(componentRootElement);

        this._appRef.detachView(componentRef.hostView);
        componentRef.destroy();
    }

    private getExtensionComponent(container: ComponentContainer, componentDefinition: DitemComponent.Definition) {
        const getComponentResult = this._extensionsAccessService.getFrame(container,
            componentDefinition.extensionId, componentDefinition.componentTypeName
        );

        const extensionDitemComponent = getComponentResult.component;
        if (extensionDitemComponent !== undefined) {
            const frameRootHtmlElement = extensionDitemComponent.rootHtmlElement;
            container.element.appendChild(frameRootHtmlElement);

            const containedDitemComponent: GoldenLayoutHostNgComponent.ContainedDitemComponent = {
                builtinComponentRef: undefined,
                extensionComponent: extensionDitemComponent,
            };

            this._containerMap.set(container, containedDitemComponent);
        }
        return getComponentResult;
    }

    private releaseExtensionComponent(container: ComponentContainer, extensionDitemComponent: ExtensionDitemComponent) {
        const frameRootHtmlElement = extensionDitemComponent.rootHtmlElement;
        container.element.removeChild(frameRootHtmlElement);

        this._extensionsAccessService.releaseFrame(extensionDitemComponent);
    }

    private getPlaceholderComponent(container: ComponentContainer, placeHeld: PlaceholderDitemFrame.Placeheld) {
        const placeholderDefinition = this.createPlaceholderComponentDefinition();
        const component = this.getBuiltinComponent(container, placeholderDefinition) as PlaceholderDitemNgComponent;

        component.ditemFrame.setPlaceheld(placeHeld);

        return component;
    }
}

export namespace GoldenLayoutHostNgComponent {
    export interface ContainedDitemComponent {
        builtinComponentRef: ComponentRef<BuiltinDitemNgComponentBaseDirective> | undefined;
        extensionComponent: ExtensionDitemComponent | undefined;
    }

    export const layoutColorSchemeItems: ColorScheme.ItemId[] = [
        ColorScheme.ItemId.Layout_Base,
        ColorScheme.ItemId.Layout_SinglePaneContent,
        ColorScheme.ItemId.Layout_PopinIconBorder,
        ColorScheme.ItemId.Layout_ActiveTab,
        ColorScheme.ItemId.Layout_DropTargetIndicatorOutline,
        ColorScheme.ItemId.Layout_SplitterDragging,
        ColorScheme.ItemId.Layout_SingleTabContainer,
        ColorScheme.ItemId.Layout_SelectedHeader,
        ColorScheme.ItemId.Layout_TransitionIndicatorBorder,
        ColorScheme.ItemId.Layout_DropDownArrow,
    ];
}
