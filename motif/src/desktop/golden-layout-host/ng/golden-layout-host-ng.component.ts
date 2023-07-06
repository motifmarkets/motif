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
    OnDestroy,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import {
    AssertInternalError,
    ColorScheme,
    ColorSettings,
    ExtensionHandle,
    ExtensionId,
    Json,
    JsonElement,
    MultiEvent,
    Result,
    SettingsService,
    StringId,
    Strings,
    UnreachableCaseError,
    numberToPixels
} from '@motifmarkets/motif-core';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { SessionInfoNgService, SettingsNgService } from 'component-services-ng-api';
import { ExtensionsAccessNgService } from 'content-ng-api';
import {
    BuiltinDitemFrame,
    DitemComponent,
    DitemComponentIdAndType,
    DitemFrame,
    ExtensionDitemComponent,
    PlaceholderDitemFrame
} from 'ditem-internal-api';
import {
    BuiltinDitemNgComponentBaseDirective,
    DesktopAccessNgService,
    DitemComponentFactoryNgService,
    PlaceholderDitemNgComponent
} from 'ditem-ng-api';
import {
    ComponentContainer,
    JsonValue,
    LogicalZIndex,
    ResolvedComponentItemConfig,
    VirtualLayout
} from 'golden-layout';
import { FrameExtensionsAccessService } from '../frame-extension-access-service';
import { GoldenLayoutHostFrame } from '../golden-layout-host-frame';

@Component({
    selector: 'app-golden-layout-host',
    templateUrl: './golden-layout-host-ng.component.html',
    styleUrls: ['./golden-layout-host-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class GoldenLayoutHostNgComponent extends ComponentBaseNgDirective implements OnDestroy, GoldenLayoutHostFrame.ComponentAccess {
    @ViewChild('componentsViewContainer', { read: ViewContainerRef, static: true }) private _componentsViewContainerRef: ViewContainerRef;

    private readonly _frame: GoldenLayoutHostFrame;
    private readonly _componentsParentHtmlElement: HTMLElement;
    private readonly _virtualLayout: VirtualLayout;

    private readonly _containerMap = new Map<ComponentContainer, GoldenLayoutHostNgComponent.ContainedDitemComponent>();

    private readonly _settingsService: SettingsService;
    private readonly _colorSettings: ColorSettings;
    private readonly _extensionsAccessService: FrameExtensionsAccessService;

    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _componentsParentBoundingClientRect: DOMRect = new DOMRect();

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
        super();

        this._componentsParentHtmlElement = this._elRef.nativeElement;
        this._settingsService = settingsNgService.service;
        this._colorSettings = this._settingsService.color;
        this._extensionsAccessService = extensionsAccessNgService.service as FrameExtensionsAccessService;

        this._virtualLayout = new VirtualLayout(
            this._componentsParentHtmlElement,
            this._bindComponentEventListener,
            this._unbindComponentEventListener
        );

        this._virtualLayout.resizeWithContainerAutomatically = true;
        this._virtualLayout.beforeVirtualRectingEvent = (count) => this.handleBeforeVirtualRectingEvent(count);

        this._frame = new GoldenLayoutHostFrame(this, this._virtualLayout, sessionNgService.service.defaultLayout,
            this._extensionsAccessService, desktopAccessNgService.service);

        this.registerDitemComponents();

        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());
    }

    get frame() { return this._frame; }

    ngOnDestroy() {
        this._frame.finalise();
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
        this._virtualLayout.destroy();
    }

    // Component Access functions
    public getDitemFrameByComponentId(componentId: string): DitemFrame | undefined {
        const componentItem = this._virtualLayout.findFirstComponentItemById(componentId);
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
                    const ditemCodedefinition = placeheld.definition;
                    if (ExtensionId.isEqual(ditemCodedefinition.extensionId, extensionInfo)) {
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

    private readonly _bindComponentEventListener =
        (container: ComponentContainer, itemConfig: ResolvedComponentItemConfig) => this.handleBindComponentEvent(container, itemConfig);
    private readonly _unbindComponentEventListener =
        (container: ComponentContainer) => this.handleUnbindComponentEvent(container);

    private handleBindComponentEvent(
        componentContainer: ComponentContainer,
        itemConfig: ResolvedComponentItemConfig
    ): ComponentContainer.BindableComponent {

        componentContainer.virtualRectingRequiredEvent =
            (container, width, height) => this.handleContainerVirtualRectingRequiredEvent(container, width, height);
        componentContainer.virtualVisibilityChangeRequiredEvent =
            (container, visible) => this.handleContainerVirtualVisibilityChangeRequiredEvent(container, visible);
        componentContainer.virtualZIndexChangeRequiredEvent =
            (container, logicalZIndex, defaultZIndex) =>
                this.handleContainerVirtualZIndexChangeRequiredEvent(container, logicalZIndex, defaultZIndex);

        const parseResult = this.parseGoldenLayoutComponentType(itemConfig.componentType);

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

        let containedDitemComponent: GoldenLayoutHostNgComponent.ContainedDitemComponent;
        let component: ComponentContainer.Component;

        if (parseResult.isErr()) {
            const placeheld: PlaceholderDitemFrame.Placeheld = {
                definition: DitemComponent.Definition.invalid,
                state,
                tabText: itemConfig.title,
                reason: parseResult.error,
                invalidReason: undefined,
            };
            const builtinComponentRef = this.attachPlaceholderComponent(componentContainer, placeheld);
            containedDitemComponent = {
                builtinComponentRef,
                extensionComponent: undefined,
                focusClosure: undefined,
            };
            component = builtinComponentRef.instance;
        } else {
            const componentDefinition = parseResult.value;
            switch (componentDefinition.constructionMethodId) {
                case DitemComponent.ConstructionMethodId.Invalid: {
                    throw new AssertInternalError('GLHCHGCE78533009');
                }
                case DitemComponent.ConstructionMethodId.Builtin1: {
                    const builtinComponentRef = this.attachBuiltinComponent(componentContainer, componentDefinition);
                    containedDitemComponent = {
                        builtinComponentRef,
                        extensionComponent: undefined,
                        focusClosure: undefined,
                    };
                    component = builtinComponentRef.instance;
                    break;
                }
                case DitemComponent.ConstructionMethodId.Extension1: {
                    const attachExtensionComponentResult = this.attachExtensionComponent(componentContainer, componentDefinition);
                    const extensionComponent = attachExtensionComponentResult.component;
                    if (extensionComponent !== undefined) {
                        containedDitemComponent = {
                            builtinComponentRef: undefined,
                            extensionComponent,
                            focusClosure: attachExtensionComponentResult.focusClosure,
                        };
                        component = extensionComponent;
                    } else {
                        // Need to create a placeholder
                        const errorText = attachExtensionComponentResult.errorText;
                        const reason = errorText === undefined ? Strings[StringId.Unknown] : errorText;

                        const placeheld: PlaceholderDitemFrame.Placeheld = {
                            definition: componentDefinition,
                            state,
                            tabText: itemConfig.title,
                            reason,
                            invalidReason: undefined,
                        };

                        const builtinComponentRef = this.attachPlaceholderComponent(componentContainer, placeheld);

                        containedDitemComponent = {
                            builtinComponentRef,
                            extensionComponent: undefined,
                            focusClosure: undefined,
                        };
                        component = builtinComponentRef.instance;
                    }
                    break;
                }
                default:
                    throw new UnreachableCaseError('GLHCHGCEU199533', componentDefinition.constructionMethodId);
            }
        }

        this._containerMap.set(componentContainer, containedDitemComponent);

        return {
            component,
            virtual: true,
        };
    }

    private handleUnbindComponentEvent(container: ComponentContainer) {
        const containedDitemComponent = this._containerMap.get(container);
        if (containedDitemComponent === undefined) {
            const componentTypeAsStr = this._frame.componentTypeToString(container.componentType);
            throw new AssertInternalError('GLHCHRCEU313122', componentTypeAsStr);
        } else {
            const componentRef = containedDitemComponent.builtinComponentRef;
            if (componentRef !== undefined) {
                this.detachBuiltinComponent(componentRef);
            } else {
                const extensionDitemComponent = containedDitemComponent.extensionComponent;
                const focusClosure = containedDitemComponent.focusClosure;
                if (extensionDitemComponent !== undefined && focusClosure !== undefined) {
                    this.detachExtensionComponent(extensionDitemComponent, focusClosure);
                } else {
                    const componentTypeAsStr = this._frame.componentTypeToString(container.componentType);
                    throw new AssertInternalError('GLHCHRCEE313122', componentTypeAsStr);
                }
            }

            this._containerMap.delete(container);
        }
    }

    private handleBeforeVirtualRectingEvent(count: number) {
        this._componentsParentBoundingClientRect = this._componentsParentHtmlElement.getBoundingClientRect();
    }

    private handleContainerVirtualRectingRequiredEvent(container: ComponentContainer, width: number, height: number) {
        const containerBoundingClientRect = container.element.getBoundingClientRect();
        const left = containerBoundingClientRect.left - this._componentsParentBoundingClientRect.left;
        const top = containerBoundingClientRect.top - this._componentsParentBoundingClientRect.top;

        const containedDitemComponent = this._containerMap.get(container);
        if (containedDitemComponent === undefined) {
            const componentTypeAsStr = this._frame.componentTypeToString(container.componentType);
            throw new AssertInternalError('GLHCHCVRREF8883222', componentTypeAsStr);
        } else {
            const componentRef = containedDitemComponent.builtinComponentRef;
            let componentRootHtmlElement: HTMLElement;
            if (componentRef !== undefined) {
                componentRootHtmlElement = componentRef.instance.rootHtmlElement;
            } else {
                const extensionDitemComponent = containedDitemComponent.extensionComponent;
                if (extensionDitemComponent !== undefined) {
                    componentRootHtmlElement = extensionDitemComponent.rootHtmlElement;
                } else {
                    const componentTypeAsStr = this._frame.componentTypeToString(container.componentType);
                    throw new AssertInternalError('GLHCHCVRREU8883222', componentTypeAsStr);
                }
            }
            this.setComponentPositionAndSize(componentRootHtmlElement, left, top, width, height);
        }
    }

    private handleContainerVirtualVisibilityChangeRequiredEvent(container: ComponentContainer, visible: boolean) {
        const containedDitemComponent = this._containerMap.get(container);
        if (containedDitemComponent === undefined) {
            const componentTypeAsStr = this._frame.componentTypeToString(container.componentType);
            throw new AssertInternalError('GLHCHCVVCREF8883222', componentTypeAsStr);
        } else {
            const componentRef = containedDitemComponent.builtinComponentRef;
            let componentRootHtmlElement: HTMLElement;
            if (componentRef !== undefined) {
                componentRootHtmlElement = componentRef.instance.rootHtmlElement;
            } else {
                const extensionDitemComponent = containedDitemComponent.extensionComponent;
                if (extensionDitemComponent !== undefined) {
                    componentRootHtmlElement = extensionDitemComponent.rootHtmlElement;
                } else {
                    const componentTypeAsStr = this._frame.componentTypeToString(container.componentType);
                    throw new AssertInternalError('GLHCHCVVCREU8883222', componentTypeAsStr);
                }
            }
            this.setComponentVisibility(componentRootHtmlElement, visible);
        }
    }

    private handleContainerVirtualZIndexChangeRequiredEvent(container: ComponentContainer,
        logicalZIndex: LogicalZIndex, defaultZIndex: string
    ) {
        const containedDitemComponent = this._containerMap.get(container);
        if (containedDitemComponent === undefined) {
            const componentTypeAsStr = this._frame.componentTypeToString(container.componentType);
            throw new AssertInternalError('GLHCHCVZICREF8883222', componentTypeAsStr);
        } else {
            const componentRef = containedDitemComponent.builtinComponentRef;
            let componentRootHtmlElement: HTMLElement;
            if (componentRef !== undefined) {
                componentRootHtmlElement = componentRef.instance.rootHtmlElement;
            } else {
                const extensionDitemComponent = containedDitemComponent.extensionComponent;
                if (extensionDitemComponent !== undefined) {
                    componentRootHtmlElement = extensionDitemComponent.rootHtmlElement;
                } else {
                    const componentTypeAsStr = this._frame.componentTypeToString(container.componentType);
                    throw new AssertInternalError('GLHCHCVZICREU8883222', componentTypeAsStr);
                }
            }
            this.setComponentZIndex(componentRootHtmlElement, defaultZIndex);
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

    private setComponentPositionAndSize(componentRootHtmlElement: HTMLElement, left: number, top: number, width: number, height: number) {
        componentRootHtmlElement.style.left = numberToPixels(left);
        componentRootHtmlElement.style.top = numberToPixels(top);
        componentRootHtmlElement.style.width = numberToPixels(width);
        componentRootHtmlElement.style.height = numberToPixels(height);
    }

    private setComponentVisibility(componentRootHtmlElement: HTMLElement, visible: boolean) {
        if (visible) {
            componentRootHtmlElement.style.display = '';
        } else {
            componentRootHtmlElement.style.display = 'none';
        }
    }

    private setComponentZIndex(componentRootHtmlElement: HTMLElement, value: string) {
        componentRootHtmlElement.style.zIndex = value;
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

    private parseGoldenLayoutComponentType(value: JsonValue): Result<DitemComponent.Definition> {
        if (value === undefined) {
            throw new AssertInternalError('GLHCPGLCTU98983333');
        } else {
            if (!JsonValue.isJson(value)) {
                if (value === null) {
                    throw new AssertInternalError('GLHCPGLCTN98983333');
                } else {
                    throw new AssertInternalError('GLHCPGLCTJ98983333', value.toString());
                }
            } else {
                const jsonElement = new JsonElement(value);
                const definitionResult = DitemComponent.Definition.tryCreateFromJson(jsonElement);
                return definitionResult;
            }
        }
    }

    private createPlaceholderComponentDefinition() {
        const extensionInfo = this._extensionsAccessService.internalRegisteredExtensionInfo;

        const result: DitemComponent.Definition = {
            extensionId: {
                publisherId: extensionInfo.publisherId,
                name: extensionInfo.name,
            },
            constructionMethodId: DitemComponent.ConstructionMethodId.Builtin1,
            componentTypeName: BuiltinDitemFrame.BuiltinType.idToName(BuiltinDitemFrame.BuiltinTypeId.Placeholder),
        };

        return result;
    }

    private attachBuiltinComponent(
        container: ComponentContainer,
        componentDefinition: DitemComponent.Definition,
    ) {
        const componentTypeName = componentDefinition.componentTypeName;
        const componentRef = this._ditemComponentFactoryNgService.createComponent(componentTypeName, container);

        if (GoldenLayoutHostNgComponent.viewContainerRefActive) {
            this._componentsViewContainerRef.insert(componentRef.hostView);
        } else {
            this._appRef.attachView(componentRef.hostView);
            const component = componentRef.instance;
            const componentRootElement = component.rootHtmlElement;
            this._componentsParentHtmlElement.appendChild(componentRootElement);
        }

        return componentRef;
    }

    private detachBuiltinComponent(componentRef: ComponentRef<BuiltinDitemNgComponentBaseDirective>) {
        const hostView = componentRef.hostView;

        if (GoldenLayoutHostNgComponent.viewContainerRefActive) {
            const viewRefIndex = this._componentsViewContainerRef.indexOf(hostView);
            if (viewRefIndex < 0) {
                throw new Error('Could not unbind component. ViewRef not found');
            }
            this._componentsViewContainerRef.remove(viewRefIndex);
        } else {
            const component = componentRef.instance;
            const componentRootElement = component.rootHtmlElement;
            this._componentsParentHtmlElement.removeChild(componentRootElement);
            this._appRef.detachView(hostView);
        }

        componentRef.destroy();
    }

    private attachExtensionComponent(
        container: ComponentContainer,
        componentDefinition: DitemComponent.Definition
    ): GoldenLayoutHostNgComponent.AttachExtensionComponentResult {
        const getComponentResult = this._extensionsAccessService.getFrame(container,
            componentDefinition.extensionId, componentDefinition.componentTypeName
        );

        let focusClosure: GoldenLayoutHostNgComponent.FocusClosure | undefined;
        const extensionDitemComponent = getComponentResult.component;
        if (extensionDitemComponent !== undefined) {
            const frameRootHtmlElement = extensionDitemComponent.rootHtmlElement;
            this._componentsParentHtmlElement.appendChild(frameRootHtmlElement);

            focusClosure = () => this.focusExtensionFrame(container);
            frameRootHtmlElement.addEventListener('click', focusClosure, { capture: true });
            frameRootHtmlElement.addEventListener('focusin', focusClosure, { capture: true });
        }

        return {
            ...getComponentResult,
            focusClosure,
        };
    }

    private detachExtensionComponent(
        extensionDitemComponent: ExtensionDitemComponent,
        focusClosure: GoldenLayoutHostNgComponent.FocusClosure
    ) {
        const frameRootHtmlElement = extensionDitemComponent.rootHtmlElement;
        frameRootHtmlElement.removeEventListener('click', focusClosure);
        frameRootHtmlElement.removeEventListener('focusin', focusClosure);
        this._componentsParentHtmlElement.removeChild(frameRootHtmlElement);

        this._extensionsAccessService.releaseFrame(extensionDitemComponent);
    }

    private attachPlaceholderComponent(container: ComponentContainer, placeHeld: PlaceholderDitemFrame.Placeheld) {
        const placeholderDefinition = this.createPlaceholderComponentDefinition();
        const builtinComponentRef = this.attachBuiltinComponent(container, placeholderDefinition);
        const component = builtinComponentRef.instance as PlaceholderDitemNgComponent;

        component.ditemFrame.setPlaceheld(placeHeld);

        return builtinComponentRef;
    }

    private focusExtensionFrame(container: ComponentContainer) {
        container.focus();
    }
}

export namespace GoldenLayoutHostNgComponent {
    export type FocusClosure = (this: void) => void;
    export interface AttachExtensionComponentResult extends ExtensionDitemComponent.GetResult {
        focusClosure: FocusClosure | undefined;
    }

    export interface ContainedDitemComponent {
        builtinComponentRef: ComponentRef<BuiltinDitemNgComponentBaseDirective> | undefined;
        extensionComponent: ExtensionDitemComponent | undefined;
        focusClosure: FocusClosure | undefined; // only used for extensions
    }

    export const viewContainerRefActive = false;

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
