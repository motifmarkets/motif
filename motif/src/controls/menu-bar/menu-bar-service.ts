/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Command, CommandRegisterService, CommandUiAction, InternalCommand, UiAction } from 'core-internal-api';
import { ExtStringId, extStrings, StringId } from 'res-internal-api';
import {
    addToArrayByPush,

    AssertInternalError,
    CommaText,
    compareInteger,

    Integer,
    isArrayEqual,
    Line,
    MultiEvent,
    UnreachableCaseError
} from 'sys-internal-api';

export class MenuBarService {
    addOverlayChildMenuEvent: MenuBarService.AddOverlayChildMenuEvent;
    deleteOverlayChildMenuEvent: MenuBarService.DeleteOverlayChildMenuEvent;
    clearOverlayChildMenusEvent: MenuBarService.ClearOverlayChildMenusEvent;

    private readonly _commandMenuItemByRegistrationMap = new Map<string, MenuBarService.CommandMenuItem>();
    private readonly _menuItemByIdMap = new Map<Integer, MenuBarService.MenuItem>();
    private readonly _menuByIdMap = new Map<Integer, MenuBarService.Menu>();

    // private readonly _missingCommandUiAction: CommandUiAction;
    private readonly _missingCommandMenuItem: MenuBarService.CommandMenuItem;
    private readonly _missingChildMenuItem: MenuBarService.ChildMenuItem;

    private readonly _rootMenu = new MenuBarService.RootMenu();
    private readonly _activeChildMenus: MenuBarService.ChildMenu[] = [];

    private _beginChangeCount = 0;

    private _active: boolean;
    private _mouseOverMenu: MenuBarService.Menu | undefined;
    // Keyboard support not yet implemented
    // Will require that Menu can get focus when Menu becomes active. (probably via a hidden or zero sized div with tabIndex = -1)
    // Focus will need to return to original element when Menu becomes inactive.
    // Do in conjunction with keyboard shortcut service and modal service
    private _keyboardActive = false;
    private _focusedChildMenuStack: MenuBarService.ChildMenu.Stack = [];
    private _focusedMenuItem: MenuBarService.MenuItem | undefined;

    private _keyboardActiveChangedMultiEvent = new MultiEvent<MenuBarService.KeyboardActiveChangedEventHandler>();

    constructor(private _commandRegisterService: CommandRegisterService,
    ) {
        // this._missingCommandUiAction = this.createMissingCommandUiAction();
        // this._missingCommandMenuItem = this.connectMenuItem(this._missingCommandUiAction);
        // this._missingChildMenuItem = this.positionRootChildMenuItem(MenuBarService.ChildMenuItem.missingName,
        //     MenuBarService.MenuItem.Position.defaultRank,
        //     StringId.Missing);
        this._menuByIdMap.set(this._rootMenu.id, this._rootMenu);
        globalThis.addEventListener('mousedown', this._globalMouseDownListener);
    }

    get rootMenu() { return this._rootMenu; }

    get keyboardActive() { return this._keyboardActive; }
    get menuMouseOver() { return this._mouseOverMenu !== undefined; }
    get missingCommandMenuItem() { return this._missingCommandMenuItem; }
    get missingChildMenuItem() { return this._missingChildMenuItem; }

    finalise() {
        globalThis.removeEventListener('mousedown', this._globalMouseDownListener);
        for (const [key, menuItem] of this._menuItemByIdMap) {
            menuItem.finalise();
        }
    }

    beginChanges() {
        this._beginChangeCount++;
    }

    endChanges() {
        if (--this._beginChangeCount === 0) {
            this.update();
        }
    }

    registerChildMenuItem(childMenuName: MenuBarService.Menu.Name, defaultPosition: MenuBarService.MenuItem.Position) {
        this.beginChanges();
        try {
            const menuPath = defaultPosition.menuPath;
            const menu = this.forceFindMenu(menuPath, defaultPosition);
            let item = menu.findChildMenuItem(childMenuName);
            if (item === undefined) {
                item = this.addChildMenuToMenu(menu, childMenuName, defaultPosition);
            }
            return item;
        } finally {
            this.endChanges();
        }
    }

    deregisterChildMenuItem(childMenuName: MenuBarService.Menu.Name, defaultPosition: MenuBarService.MenuItem.Position) {
        this.beginChanges();
        try {
            const menuPath = defaultPosition.menuPath;
            const menu = this.findMenu(menuPath);
            if (menu !== undefined) {
                const item = menu.findChildMenuItem(childMenuName);
                if (item !== undefined) {
                    if (menu.isRoot) {
                        this.removeChildMenuItem(item);
                    } else {
                        const removed = this.tryRemoveChildMenuItem(item);
                        if (!removed) {
                            // Is rendered. Need to wait for it to not be rendered.
                            // The remove event will now fire when it becomes unrendered
                            item.unrenderedEvent = () => this.removeChildMenuItem(item);
                        }
                    }
                }
            }
        } finally {
            this.endChanges();
        }
    }

    registerCommandMenuItem(command: Command, overrideDefaultPosition?: MenuBarService.MenuItem.Position) {
        this.beginChanges();
        try {
            const defaultPosition = this.resolveCommandDefaultPosition(overrideDefaultPosition, command);
            const menuItem = this.forceFindCommandMenuItemByRegistration(command, defaultPosition);

            if (menuItem.ownerMenu === undefined) {
                const menu = this.forceFindMenu(defaultPosition.menuPath, defaultPosition);
                menuItem.setOwnerMenu(menu);
            }

            return menuItem;
        } finally {
            this.endChanges();
        }
    }

    deregisterCommandMenuItem(command: Command, defaultPosition: MenuBarService.MenuItem.Position) {
        this.beginChanges();
        try {
            const { key, item } = this.findCommandMenuItemByRegistration(command, defaultPosition);

            if (item !== undefined) {
                 // remove from registration immediately so it cannot be found anymore
                this._commandMenuItemByRegistrationMap.delete(key);

                const removed = this.tryRemoveCommandMenuItem(item);
                if (!removed) {
                    // Is rendered. Need to wait for it to not be rendered.
                    // The remove event will fire when it becomes unrendered
                    item.unrenderedEvent = () => this.removeCommandMenuItem(item);
                }
            }
        } finally {
            this.endChanges();
        }
    }

    positionChildMenuItem(childMenuName: MenuBarService.Menu.Name, defaultPosition: MenuBarService.MenuItem.Position,
        displayId?: ExtStringId, accessKeyId?: ExtStringId, embedded: boolean = false
    ) {
        this.beginChanges();
        try {
            const menuItem = this.registerChildMenuItem(childMenuName, defaultPosition);
            menuItem.embedded = embedded === true;
            menuItem.setDisplayIdAndAccessKeyId(displayId, accessKeyId);
            menuItem.ownerMenu.flagModified();
            return menuItem;
        } finally {
            this.endChanges();
        }
    }

    positionRootChildMenuItem(childMenuName: MenuBarService.Menu.Name, rank: number, displayId?: ExtStringId, accessKeyId?: ExtStringId) {
        return this.positionChildMenuItem(childMenuName, { menuPath: MenuBarService.Menu.Path.root, rank}, displayId, accessKeyId, false);
    }

    positionEmbeddedChildMenu(menuName: MenuBarService.Menu.Name, defaultPosition: MenuBarService.MenuItem.Position) {
        return this.positionChildMenuItem(menuName, defaultPosition, undefined, undefined, true);
    }

    connectMenuItem(uiAction: CommandUiAction, overrideDefaultPosition?: MenuBarService.MenuItem.Position) {
        this.beginChanges();
        try {
            const command = uiAction.command;
            const menuItem = this.registerCommandMenuItem(command, overrideDefaultPosition);
            menuItem.connect(uiAction);
            return menuItem;
        } finally {
            this.endChanges();
        }
    }

    disconnectMenuItem(commandMenuItem: MenuBarService.CommandMenuItem) {
        this.beginChanges();
        try {
            commandMenuItem.disconnect();
        } finally {
            this.endChanges();
        }
    }

    activate() {
        this._active = true;
    }

    deactivate() {
        // this._overlayService.closeChildMenus();
        this._active = false;
    }

    getMenuItem(menuItemId: Integer) {
        return this._menuItemByIdMap.get(menuItemId);
    }

    subscribeKeyboardActiveChangedEvent(handler: MenuBarService.KeyboardActiveChangedEventHandler) {
        return this._keyboardActiveChangedMultiEvent.subscribe(handler);
    }

    unsubscribeKeyboardActiveChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._keyboardActiveChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private readonly _globalMouseDownListener = (ev: MouseEvent) => this.handleGlobalMouseDownEvent(ev);

    private handleGlobalMouseDownEvent(ev: MouseEvent) {
        if (this._focusedChildMenuStack.length > 0 && !this.isMouseOverAMenu(ev.clientX, ev.clientY)) {
            this.clearChildMenus();
        }
    }

    private handleCommandMenuItemMouseEnter(menuItem: MenuBarService.CommandMenuItem) {
        switch (menuItem.stateId) {
            case MenuBarService.MenuItem.StateId.NotRendered: {
                throw new AssertInternalError('MBSHCOMIMEN668344');
            }
            case MenuBarService.MenuItem.StateId.Disabled: {
                break;
            }
            case MenuBarService.MenuItem.StateId.Enabled:
            case MenuBarService.MenuItem.StateId.ParentHighlighted: {
                this.focusMenuItem(menuItem);
                break;
            }
            case MenuBarService.MenuItem.StateId.FocusHighlighted: {
                break;
            }
            default:
                throw new UnreachableCaseError('MBSHCOMIMEU2299112', menuItem.stateId);
        }
    }

    private handleCommandMenuItemMouseLeave(menuItem: MenuBarService.CommandMenuItem) {
        switch (menuItem.stateId) {
            case MenuBarService.MenuItem.StateId.NotRendered: {
                throw new AssertInternalError('MBSHCMIMLN768344');
            }
            case MenuBarService.MenuItem.StateId.Disabled: {
                break;
            }
            case MenuBarService.MenuItem.StateId.Enabled: {
                throw new AssertInternalError('MBSHCMIMLE868344');
            }
            case MenuBarService.MenuItem.StateId.ParentHighlighted: {
                throw new AssertInternalError('MBSHCMIMLP968344');
            }
            case MenuBarService.MenuItem.StateId.FocusHighlighted: {
                this.checkUnfocusFocusedMenuItem();
                break;
            }
            default:
                throw new UnreachableCaseError('MBSHCMIMEU2299112', menuItem.stateId);
        }
    }

    private handleMenuItemClearChildMenusEvent() {
        this.clearChildMenus();
    }

    private handleChildMenuItemMouseEnter(menuItem: MenuBarService.ChildMenuItem, childMenuContactDocumentLine: Line) {
        switch (menuItem.stateId) {
            case MenuBarService.MenuItem.StateId.NotRendered: {
                throw new AssertInternalError('MBSHCHMIMEN668344');
            }
            case MenuBarService.MenuItem.StateId.Disabled: {
                break;
            }
            case MenuBarService.MenuItem.StateId.Enabled: {
                const childMenuToBeShown = !menuItem.ownerMenu.isRoot || this._focusedChildMenuStack.length > 0;
                this.focusMenuItem(menuItem);
                if (childMenuToBeShown) {
                    this.renderChildMenuToFocusStack(menuItem.childMenu, childMenuContactDocumentLine);
                }
                break;
            }
            case MenuBarService.MenuItem.StateId.ParentHighlighted: {
                break;
            }
            case MenuBarService.MenuItem.StateId.FocusHighlighted: {
                break;
            }
            default:
                throw new UnreachableCaseError('MBSHCHMIMEU2299112', menuItem.stateId);
        }
    }

    private handleChildMenuItemMouseLeave(menuItem: MenuBarService.ChildMenuItem) {
        switch (menuItem.stateId) {
            case MenuBarService.MenuItem.StateId.NotRendered: {
                throw new AssertInternalError('MBSHCMIMEN668344');
            }
            case MenuBarService.MenuItem.StateId.Disabled: {
                break;
            }
            case MenuBarService.MenuItem.StateId.Enabled: {
                break;
            }
            case MenuBarService.MenuItem.StateId.ParentHighlighted: {
                break;
            }
            case MenuBarService.MenuItem.StateId.FocusHighlighted: {
                if (menuItem.ownerMenu.isRoot && this._focusedChildMenuStack.length === 0) {
                    this.checkUnfocusFocusedMenuItem();
                }
                break;
            }
            default:
                throw new UnreachableCaseError('MBSHCMIMEU2299112', menuItem.stateId);
        }
    }

    private handleChildMenuItemChildMenuRenderEvent(childMenu: MenuBarService.ChildMenu, parentItemContactDocumentLine: Line) {
        this.renderChildMenuToFocusStack(childMenu, parentItemContactDocumentLine);
    }

    private notifyKeyboardActiveChanged() {
        const handlers = this._keyboardActiveChangedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler();
        }
    }

    private resolveCommandDefaultPosition(overrideDefaultPosition: Command.MenuBarItemPosition | undefined, command: Command) {
        let defaultPosition: MenuBarService.MenuItem.Position | undefined;
        if (overrideDefaultPosition === undefined) {
            defaultPosition = command.defaultMenuBarItemPosition;
        } else {
            defaultPosition = overrideDefaultPosition;
        }

        if (defaultPosition === undefined) {
            defaultPosition = MenuBarService.unpositionedCommandDefaultPosition;
        }
        return defaultPosition;
    }

    private forceFindCommandMenuItemByRegistration(command: Command, defaultPosition: MenuBarService.MenuItem.Position) {
        const { key, item, } = this.findCommandMenuItemByRegistration(command, defaultPosition);
        let menuItem = item;
        if (menuItem === undefined) {
            menuItem = new MenuBarService.CommandMenuItem(command, defaultPosition);
            this._commandMenuItemByRegistrationMap.set(key, menuItem);
            this._menuItemByIdMap.set(menuItem.id, menuItem);
            menuItem.mouseEnterEvent = (enteredMenuItem) => this.handleCommandMenuItemMouseEnter(enteredMenuItem);
            menuItem.mouseLeaveEvent = (leavedMenuItem) => this.handleCommandMenuItemMouseLeave(leavedMenuItem);
            menuItem.clearChildMenusEvent = () => this.handleMenuItemClearChildMenusEvent();
        }
        return menuItem;
    }

    private forceFindMenu(menuPath: MenuBarService.Menu.Path, defaultPosition: MenuBarService.MenuItem.Position) {
        const menuDepth = menuPath.length;
        let menu = this._rootMenu;
        for (let i = 0; i < menuDepth; i++) {
            const menuName = menuPath[i];
            if (menuName === '') {
                throw new AssertInternalError('MBSFFM23995437', `"${menuPath.join(',')}"`);
            } else {
                const childMenuItem = this.forceFindChildMenuItem(menu, menuName, defaultPosition);
                menu = childMenuItem.childMenu;
            }
        }

        return menu;
    }

    private forceFindChildMenuItem(menu: MenuBarService.Menu, childName: MenuBarService.Menu.Name,
        defaultPosition: MenuBarService.MenuItem.Position
    ) {
        let childMenuItem = menu.findChildMenuItem(childName);
        if (childMenuItem === undefined) {
            childMenuItem = this.addChildMenuToMenu(menu, childName, defaultPosition);
        }
        return childMenuItem;
    }

    private findCommandMenuItemByRegistration(command: Command, defaultPosition: MenuBarService.MenuItem.Position) {
        const key = MenuBarService.MenuItem.generateRegistrationMapKey(command, defaultPosition);
        const item = this._commandMenuItemByRegistrationMap.get(key);
        return { key, item };
    }

    private findMenu(menuPath: MenuBarService.Menu.Path) {
        const menuDepth = menuPath.length;
        let menu = this._rootMenu;
        for (let i = 0; i < menuDepth; i++) {
            const menuName = menuPath[i];
            if (menuName === '') {
                throw new AssertInternalError('MBSFM23995437', `"${menuPath.join(',')}"`);
            } else {
                const childMenuItem = menu.findChildMenuItem(menuName);
                if (childMenuItem === undefined) {
                    return undefined;
                } else {
                    menu = childMenuItem.childMenu;
                }
            }
        }

        return menu;
    }

    private addChildMenuToMenu(menu: MenuBarService.Menu, childName: MenuBarService.Menu.Name,
        defaultPosition: MenuBarService.MenuItem.Position
    ) {
        const childMenuParentStack = MenuBarService.Menu.isChild(menu) ? menu.stack : [];
        const childMenu = new MenuBarService.ChildMenu(childName, menu.registrationPath, childMenuParentStack);
        this._menuByIdMap.set(childMenu.id, childMenu);

        const childMenuItem = new MenuBarService.ChildMenuItem(childMenu, defaultPosition);
        childMenuItem.childMenuRenderEvent = (toRenderChildMenu, parentItemContactDocumentLine) =>
            this.handleChildMenuItemChildMenuRenderEvent(toRenderChildMenu, parentItemContactDocumentLine);
        this._menuItemByIdMap.set(childMenuItem.id, childMenuItem);
        childMenuItem.setOwnerMenu(menu);
        childMenuItem.mouseEnterEvent =
            (enteredMenuItem, childMenuContactDocumentLine) =>
                this.handleChildMenuItemMouseEnter(enteredMenuItem, childMenuContactDocumentLine);
        childMenuItem.mouseLeaveEvent = (leavedMenuItem) => this.handleChildMenuItemMouseLeave(leavedMenuItem);
        childMenuItem.clearChildMenusEvent = () => this.handleMenuItemClearChildMenusEvent();

        childMenu.parentItem = childMenuItem;

        return childMenuItem;
    }

    private tryRemoveChildMenuItem(item: MenuBarService.ChildMenuItem) {
        if (item.rendered) {
            return false;
        } else {
            // If not rendered then none of its children are rendered.  So can delete all
            this.removeChildMenuItem(item);
            return true;
        }
    }

    private removeChildMenuItem(menuItem: MenuBarService.ChildMenuItem) {
        const childMenu = menuItem.childMenu;
        this.removeChildMenu(childMenu);
        const ownerMenu = menuItem.ownerMenu;
        ownerMenu.deregisterItem(menuItem);
        this._menuItemByIdMap.delete(menuItem.id);
    }

    private tryRemoveCommandMenuItem(item: MenuBarService.CommandMenuItem) {
        if (item.rendered) {
            return false;
        } else {
            this.removeCommandMenuItem(item);
            return true;
        }
    }

    private removeCommandMenuItem(menuItem: MenuBarService.CommandMenuItem) {
        if (menuItem.ownerMenu !== undefined) {
            const ownerMenu = menuItem.ownerMenu;
            ownerMenu.deregisterItem(menuItem);
            this._menuItemByIdMap.delete(menuItem.id);
        }
    }

    private removeChildMenu(menu: MenuBarService.ChildMenu) {
        const count = menu.itemCount;
        const items = menu.items;
        for (let i = count - 1; i >= 0; i--) {
            const item = items[i];
            switch (item.typeId) {
                case MenuBarService.MenuItem.TypeId.ChildMenu: {
                    this.removeChildMenuItem(item as MenuBarService.ChildMenuItem);
                    break;
                }
                case MenuBarService.MenuItem.TypeId.Command: {
                    this.removeCommandMenuItem(item as MenuBarService.CommandMenuItem);
                    break;
                }
                default:
                    throw new UnreachableCaseError('MBSRCM87774331', item.typeId);
            }
        }
        this._menuByIdMap.delete(menu.id);
    }

    private update() {
        for (const [id, menu] of this._menuByIdMap) {
            if (menu.modified) {
                menu.update();
            }
        }
    }

    private createMissingCommandUiAction() {
        const commandName = InternalCommand.Name.Missing;
        const displayId = StringId.Missing;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        return new CommandUiAction(command);
    }

    private focusMenuItem(menuItem: MenuBarService.MenuItem) {
        const ownerMenu = menuItem.ownerMenu;
        let newFocusedChildMenuStack: MenuBarService.ChildMenu.Stack;
        if (!MenuBarService.Menu.isChild(ownerMenu)) {
            this.clearChildMenus();
            newFocusedChildMenuStack = [];
        } else {
            newFocusedChildMenuStack = ownerMenu.generateUnembeddedStack();
            const currentFocusedChildMenuStack = this._focusedChildMenuStack;
            const overlayMenuCount = currentFocusedChildMenuStack.length;
            for (let i = 0; i < overlayMenuCount; i++) {
                if (currentFocusedChildMenuStack[i] !== newFocusedChildMenuStack[i]) {
                    this.trimFocusedChildMenus(overlayMenuCount - i);
                }
            }
        }
        this.checkUnfocusFocusedMenuItem();
        menuItem.setHighlightTypeId(MenuBarService.MenuItem.HighlightTypeId.Focus);
        this._focusedChildMenuStack = newFocusedChildMenuStack;
        this._focusedMenuItem = menuItem;
    }

    private checkUnfocusFocusedMenuItem() {
        if (this._focusedMenuItem !== undefined) {
            this._focusedMenuItem.setHighlightTypeId(MenuBarService.MenuItem.HighlightTypeId.Not);
            this._focusedMenuItem = undefined;
        }
    }

    private clearChildMenus() {
        // Currently this is used to deactivate the menu.  Will need to change when keyboard support is added
        const focusedChildMenuCount = this._focusedChildMenuStack.length;
        for (let i = focusedChildMenuCount - 1; i >= 0; i--) {
            this._focusedChildMenuStack[i].parentItem.setHighlightTypeId(MenuBarService.MenuItem.HighlightTypeId.Not);
        }
        this.clearOverlayChildMenusEvent();
        this._focusedChildMenuStack = [];
    }

    private trimFocusedChildMenus(trimCount: Integer) {
        const focusedChildMenuCount = this._focusedChildMenuStack.length;
        const trimToIdx = focusedChildMenuCount - trimCount;
        for (let i = focusedChildMenuCount - 1; i >= trimToIdx; i--) {
            const menu = this._focusedChildMenuStack[i];
            menu.parentItem.setHighlightTypeId(MenuBarService.MenuItem.HighlightTypeId.Not);
            this.deleteOverlayChildMenuEvent(menu);
        }
    }

    private renderChildMenuToFocusStack(childMenu: MenuBarService.ChildMenu, childMenuContactDocumentLine: Line) {
        this._focusedChildMenuStack = childMenu.generateUnembeddedStack();
        this.addOverlayChildMenuEvent(childMenu, childMenuContactDocumentLine);
        childMenu.tryRender();
    }

    private isMouseOverAMenu(mouseClientX: number, mouseClientY: number) {
        if (this._rootMenu.isMouseOver(mouseClientX, mouseClientY)) {
            return true;
        } else {
            for (const menu of this._focusedChildMenuStack) {
                if (menu.isMouseOver(mouseClientX, mouseClientY)) {
                    return true;
                }
            }
            return false;
        }
    }
}

export namespace MenuBarService {
    export type AddOverlayChildMenuEvent = (this: void, menu: ChildMenu, contactDocumentLine: Line) => void;
    export type DeleteOverlayChildMenuEvent = (this: void, menu: ChildMenu) => void;
    export type ClearOverlayChildMenusEvent = (this: void) => void;
    export type KeyboardActiveChangedEventHandler = (this: void) => void;

    export abstract class Menu {
        renderEvent: Menu.RenderEvent | undefined;
        getIsMouseOverEvent: Menu.GetIsMouseOverEvent | undefined;

        private readonly _id: Integer;
        private readonly _items: MenuItem[] = [];

        private _modified = true;

        constructor(private readonly _name: string,
            private readonly _registrationPath: Menu.Path
        ) {
            this._id = Menu.getNextId();
        }

        get name() { return this._name; }
        get registrationPath() { return this._registrationPath; }
        get id() { return this._id; }
        get items() { return this._items; }
        get itemCount() { return this._items.length; }

        get modified() { return this._modified; }

        abstract get isRoot(): boolean;

        registerItem(item: MenuItem) {
            this._items.push(item);
            this._modified = true;
        }

        deregisterItem(menuItem: MenuItem) {
            const idx = this._items.findIndex((item) => item === menuItem);
            if (idx < 0) {
                throw new AssertInternalError('MBSMDI10009454');
            } else {
                this._items.splice(idx, 1);
            }
            this._modified = true;
        }

        flagModified() {
            this._modified = true;
        }

        update() {
            this.sortItems();
            this._modified = false;
            this.tryRender();
        }

        tryRender() {
            if (this.renderEvent !== undefined) {
                const renderMenu = this.createRenderMenu();
                this.renderEvent(renderMenu);
            }
        }

        findChildMenuItem(childMenuName: Menu.Name) {
            const count = this._items.length;
            for (let i = 0; i < count; i++) {
                const item = this._items[i];
                if (!item.removePending && MenuItem.isChildMenu(item) && item.childMenu.name === childMenuName) {
                    return item;
                }
            }
            return undefined;
            // return this._items.find((item) => MenuItem.isChildMenu(item) && item.childMenu.name === childMenuName) as ChildMenuItem;
        }

        createRenderMenu() {
            const renderItems = this.renderItems();

            const renderMenu: MenuBarService.RenderMenu = {
                items: renderItems,
            };

            return renderMenu;
        }

        isMouseOver(mouseClientX: number, mouseClientY: number) {
            if (this.getIsMouseOverEvent === undefined) {
                return false;
            } else {
                return this.getIsMouseOverEvent(mouseClientX, mouseClientY);
            }
        }

        private sortItems() {
            this._items.sort((left, right) => this.compareMenuItem(left, right));
        }

        private compareMenuItem(left: MenuItem, right: MenuItem) {
            let result = compareInteger(left.rank, right.rank);
            if (result === 0) {
                result = compareInteger(left.id, right.id);
            }
            return result;
        }

        private renderItems() {
            const result: MenuBarService.RenderMenuItem[] = [];
            const itemCount = this._items.length;
            for (let i = 0; i < itemCount; i++) {
                const item = this._items[i];
                const id = item.id;
                switch (item.typeId) {
                    case MenuItem.TypeId.Command: {
                        const renderItem: RenderMenuItem = { typeId: RenderMenuItemTypeId.Command, id };
                        result.push(renderItem);
                        break;
                    }
                    case MenuItem.TypeId.ChildMenu: {
                        const childMenuItem = item as ChildMenuItem;
                        const childMenu = childMenuItem.childMenu;
                        if (childMenuItem.embedded) {
                            const embeddedItems = childMenu.renderItems();
                            if (embeddedItems.length > 0) {
                                if (i !== 0) {
                                    const renderItem: RenderMenuItem = { typeId: RenderMenuItemTypeId.Divider, id };
                                    result.push(renderItem);
                                }
                                addToArrayByPush(result, embeddedItems);
                                if (i < itemCount - 1) {
                                    const renderItem: RenderMenuItem = { typeId: RenderMenuItemTypeId.Divider, id };
                                    result.push(renderItem);
                                }
                            }
                        } else {
                            if (childMenu.itemCount > 0) {
                                const renderItem: RenderMenuItem = { typeId: RenderMenuItemTypeId.ChildMenu, id };
                                result.push(renderItem);
                            }
                        }
                    }
                }
            }
            return result;
        }
    }

    export namespace Menu {
        export type RenderEvent = (this: void, renderMenu: RenderMenu) => void;
        export type GetIsMouseOverEvent = (this: void, mouseClientX: number, mouseClientY: number) => boolean;

        export type Name = Command.MenuBarMenuName;
        export namespace Name {
            export namespace Root {
                export const file = 'File';
                export const price = 'Price';
                export const trading = 'Trading';
                export const tools = 'Tools';
                export const help = 'Help';
                export const commands = 'Commands';
            }
        }
        export type Path = Command.MenuBarMenuPath;

        export namespace Path {
            export const root: Path = [];

            export function isEqual(left: Path, right: Path) {
                return isArrayEqual(left, right);
            }

            export function getName(path: Path) {
                const length = path.length;
                if (length === 0) {
                    return undefined;
                } else {
                    return path[length - 1];
                }
            }
        }

        let nextId = 1;

        export function getNextId() {
            return nextId++;
        }

        export function isChild(menu: Menu): menu is ChildMenu {
            return !menu.isRoot;
        }
    }

    export class RootMenu extends Menu {
        constructor() {
            super(MenuBarService.RootMenuName, []);
        }

        get isRoot() { return true; }
    }

    export class ChildMenu extends Menu {
        parentItem: ChildMenuItem;

        private readonly _stack: ChildMenu.Stack;
        private _rendered = false;

        constructor(name: string, parentRegistrationPath: Menu.Path, parentStack: ChildMenu.Stack) {
            super(name, [...parentRegistrationPath, name]);
            this._stack = [...parentStack, this];
        }

        get isRoot() { return false; }
        get rendered() { return this._rendered; }
        get stack() { return this._stack; }

        generateUnembeddedStack(): ChildMenu.Stack {
            const depth = this._stack.length;
            if (!this._stack[depth - 1].parentItem.embedded) {
                return this._stack;
            } else {
                const maxUnembeddedDepth = depth - 1;
                const result = new Array<ChildMenu>(maxUnembeddedDepth);
                for (let i = 0; i < maxUnembeddedDepth; i++) {
                    const childMenu = this._stack[i];
                    if (childMenu.parentItem.embedded) {
                        result.length = i;
                        break;
                    } else {
                        result[i] = childMenu;
                    }
                }
                return result;
            }
        }

        flagRendered() {
            if (this._rendered) {
                throw new AssertInternalError('MBSCMFR111094');
            } else {
                this._rendered = true;
            }
        }

        flagNotRendered() {
            if (!this._rendered) {
                throw new AssertInternalError('MBSCMFNR111094');
            } else {
                this._rendered = false;
            }
        }
    }

    export abstract class MenuItem {
        stateChangedEvent: MenuItem.StateChangedEvent | undefined;
        captionChangedEvent: MenuItem.CaptionChangedEvent | undefined;
        accessibleCaptionChangedEvent: MenuItem.AccessibleCaptionChangedEvent | undefined;
        clearChildMenusEvent: MenuItem.ClearChildMenusEvent;
        unrenderedEvent: MenuItem.UnrenderedEvent;

        private readonly _id: Integer;
        private _ownerMenu: Menu;

        private _rendered = false;
        private _enabled = true;
        private _highlightTypeId = MenuItem.HighlightTypeId.Not;
        private _stateId = MenuItem.StateId.NotRendered;

        constructor(private readonly _typeId: MenuItem.TypeId, private readonly _defaultPosition: MenuBarService.MenuItem.Position) {
            this._id = MenuItem.getNextId();
        }

        get defaultPosition() { return this._defaultPosition; }
        get rank() { return this._defaultPosition.rank; }

        get id() { return this._id; }
        get typeId() { return this._typeId; }
        get ownerMenu() { return this._ownerMenu; }
        get rendered() { return this._rendered; }
        get removePending() { return this.unrenderedEvent !== undefined; }
        get stateId() { return this._stateId; }

        abstract get caption(): string;
        abstract get accessibleCaption(): CommandUiAction.AccessibleCaption; // use AccessibleCaption for ChildMenu as well

        finalise() {
            // can be overridden in descendants
        }

        setOwnerMenu(value: Menu) {
            if (this._ownerMenu !== undefined) {
                this._ownerMenu.deregisterItem(this);
            }
            this._ownerMenu = value;
            this._ownerMenu.registerItem(this);
        }

        flagRendered() {
            if (this._rendered) {
                throw new AssertInternalError('MBSMIFR111094');
            } else {
                this._rendered = true;
                this.updateState();
            }
        }

        flagNotRendered() {
            if (!this._rendered) {
                throw new AssertInternalError('MBSMIFNR111094');
            } else {
                this._rendered = false;
                this.updateState();

                if (this.unrenderedEvent !== undefined) {
                    this.unrenderedEvent();
                }
            }
        }

        setHighlightTypeId(value: MenuItem.HighlightTypeId) {
            if (value !== this._highlightTypeId) {
                this._highlightTypeId = value;
                this.updateState();
            }
        }

        protected setStateId(value: MenuItem.StateId) {
            if (value !== this._stateId) {
                this._stateId = value;
                if (this.stateChangedEvent !== undefined) {
                    this.stateChangedEvent();
                }
            }
        }

        protected notifyCaptionChanged() {
            if (this.captionChangedEvent !== undefined) {
                this.captionChangedEvent();
            }
        }

        protected notifyAccessibleCaptionChanged() {
            if (this.accessibleCaptionChangedEvent !== undefined) {
                this.accessibleCaptionChangedEvent();
            }
        }

        protected notifyClearChildMenus() {
            this.clearChildMenusEvent();
        }

        protected updateEnabled(value: boolean) {
            if (value !== this._enabled) {
                this._enabled = value;
                this.updateState();
            }
        }

        private updateState() {
            let stateId: MenuItem.StateId;
            if (!this._rendered) {
                stateId = MenuItem.StateId.NotRendered;
            } else {
                if (!this._enabled) {
                    stateId = MenuItem.StateId.Disabled;
                } else {
                    stateId = this.highlighTypeIdToStateId(this._highlightTypeId);
                }
            }
            this.setStateId(stateId);
        }

        private highlighTypeIdToStateId(highlightTypeId: MenuItem.HighlightTypeId) {
            switch (highlightTypeId) {
                case MenuItem.HighlightTypeId.Not: return MenuItem.StateId.Enabled;
                case MenuItem.HighlightTypeId.Parent: return MenuItem.StateId.ParentHighlighted;
                case MenuItem.HighlightTypeId.Focus: return MenuItem.StateId.FocusHighlighted;
                default: throw new UnreachableCaseError('MBSMISTITSI4555934', highlightTypeId);
            }
        }
    }

    export namespace MenuItem {
        export const enum StateId {
            NotRendered,
            Disabled,
            Enabled,
            ParentHighlighted,
            FocusHighlighted,
        }

        export const enum HighlightTypeId {
            Not,
            Parent,
            Focus,
        }

        export type StateChangedEvent = (this: void) => void;
        export type CaptionChangedEvent = (this: void) => void;
        export type AccessibleCaptionChangedEvent = (this: void) => void;
        export type ClearChildMenusEvent = (this: void) => void;
        export type UnrenderedEvent = (this: void) => void;

        export const enum TypeId {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            Command,
            // eslint-disable-next-line @typescript-eslint/no-shadow
            ChildMenu,
        }

        export type Position = Command.MenuBarItemPosition;

        export namespace Position {
            export const fileMenuPath: Menu.Name[] = [Menu.Name.Root.file];
            export const pricesMenuPath: Menu.Name[] = [Menu.Name.Root.price];
            export const tradingMenuPath: Menu.Name[] = [Menu.Name.Root.trading];
            export const toolsMenuPath: Menu.Name[] = [Menu.Name.Root.tools];
            export const helpMenuPath: Menu.Name[] = [Menu.Name.Root.help];
            export const commandMenuPath: Menu.Name[] = [Menu.Name.Root.commands];

            export const defaultRank = 10000;
        }

        let nextId = 1;

        export function getNextId() {
            return nextId++;
        }

        export function isCommand(menuItem: MenuItem): menuItem is CommandMenuItem {
            return menuItem.typeId === TypeId.Command;
        }

        export function isChildMenu(menuItem: MenuItem): menuItem is ChildMenuItem {
            return menuItem.typeId === TypeId.ChildMenu;
        }

        export function generateRegistrationMapKey(command: Command, defaultPosition: Position) {
            const commandKey = Command.generateMapKey(command.extensionHandle, command.name);
            const menuPath = defaultPosition.menuPath;
            const stringArray = new Array<string>(2 + menuPath.length);
            stringArray[0] = commandKey;
            stringArray[1] = command.extensionHandle.toString();
            let idx = 2;
            for (let i = 0; i < menuPath.length; i++) {
                stringArray[idx++] = menuPath[i];
            }
            return CommaText.fromStringArray(stringArray);
        }
    }

    export class CommandMenuItem extends MenuItem {
        titleChangedEvent: CommandMenuItem.TitleChangedEvent | undefined;
        valueChangedEvent: CommandMenuItem.ValueChangedEvent | undefined;

        mouseEnterEvent: CommandMenuItem.MouseEnterEvent;
        mouseLeaveEvent: CommandMenuItem.MouseLeaveEvent;

        private _uiAction: CommandUiAction;
        private _uiActionPushEventsSubscriptionId: MultiEvent.SubscriptionId;

        constructor(private readonly _command: Command, defaultPosition: MenuItem.Position) {
            super(MenuItem.TypeId.Command, defaultPosition);
        }

        get command() { return this._command; }
        get uiAction() { return this._uiAction; }

        get caption() { return this._uiAction.caption; }
        get accessibleCaption() { return this._uiAction.accessibleCaption; }
        get title() { return this._uiAction.title; }
        get value() { return this._uiAction.value; }

        override finalise() {
            this.disconnect();
        }

        connect(uiAction: CommandUiAction) {
            this._uiAction = uiAction;
            const pushEventHandlersInterface: CommandUiAction.PushEventHandlersInterface = {
                stateChange: (stateId) => this.handleStateChangePushEvent(stateId),
                caption: () => this.notifyCaptionChanged(),
                title: () => this.notifyTitleChanged(),
                value: () => this.notifyValueChanged(),
                accessibleCaption: () => this.notifyAccessibleCaptionChanged(),
            };
            this._uiActionPushEventsSubscriptionId = this._uiAction.subscribePushEvents(pushEventHandlersInterface);

            const enabled = this.isUiActionStateIdEnabled(this._uiAction.stateId);
            this.updateEnabled(enabled);
            this.notifyAccessibleCaptionChanged();
            this.notifyCaptionChanged();
            this.notifyTitleChanged();
            this.notifyValueChanged();
        }

        disconnect() {
            if (this._uiActionPushEventsSubscriptionId !== undefined) {
                this._uiAction.unsubscribePushEvents(this._uiActionPushEventsSubscriptionId);
                this._uiActionPushEventsSubscriptionId = undefined;
            }
        }

        onMouseClick(altKey: boolean, ctrlKey: boolean, metaKey: boolean, shiftKey: boolean) {
            const downKeys = UiAction.makeDownKeys(altKey, ctrlKey, metaKey, shiftKey);
            this._uiAction.signal(UiAction.SignalTypeId.MouseClick, downKeys);
            this.notifyClearChildMenus();
        }

        onMouseEnter() {
            this.mouseEnterEvent(this);
        }

        onMouseLeave() {
            this.mouseLeaveEvent(this);
        }

        private handleStateChangePushEvent(stateId: UiAction.StateId) {
            const enabled = this.isUiActionStateIdEnabled(stateId);
            this.updateEnabled(enabled);
        }

        private notifyTitleChanged() {
            if (this.titleChangedEvent !== undefined) {
                this.titleChangedEvent();
            }
        }

        private notifyValueChanged() {
            if (this.valueChangedEvent !== undefined) {
                this.valueChangedEvent();
            }
        }

        private isUiActionStateIdEnabled(stateId: UiAction.StateId) {
            return stateId !== UiAction.StateId.Disabled;
        }
    }

    export namespace CommandMenuItem {
        export type TitleChangedEvent = (this: void) => void;
        export type ValueChangedEvent = (this: void) => void;
        export type MouseEnterEvent = (this: void, menuItem: CommandMenuItem) => void;
        export type MouseLeaveEvent = (this: void, menuItem: CommandMenuItem) => void;
    }

    export class ChildMenuItem extends MenuItem {
        embedded = false;

        childMenuRenderEvent: ChildMenuItem.ChildMenuRenderEvent;

        mouseEnterEvent: ChildMenuItem.MouseEnterEvent;
        mouseLeaveEvent: ChildMenuItem.MouseLeaveEvent;

        private _displayId: ExtStringId | undefined;
        private _accessKeyId: ExtStringId | undefined;
        private _caption: string;
        private _accessibleCaption: CommandUiAction.AccessibleCaption;

        constructor(private readonly _childMenu: ChildMenu, defaultPosition: MenuBarService.MenuItem.Position) {
            super(MenuItem.TypeId.ChildMenu, defaultPosition);
            this._caption = this._childMenu.name;
            const unaccessibleCaption: CommandUiAction.UnaccessibleCaption = {
                preAccessKey: this._caption,
                accessKey: '',
                postAccessKey: '',
            };
            this._accessibleCaption = unaccessibleCaption;
        }

        get childMenu() { return this._childMenu; }
        get caption() { return this._caption; }
        get accessibleCaption() { return this._accessibleCaption; }

        setDisplayIdAndAccessKeyId(displayId: ExtStringId | undefined, accessKeyId: ExtStringId | undefined) {
            if (displayId !== this._displayId) {
                this._displayId = displayId;
                if (displayId === undefined) {
                    this._caption = this._childMenu.name;
                } else {
                    this._caption = extStrings[displayId.handle][displayId.index];
                }
                this.notifyCaptionChanged();
            }
            if (accessKeyId !== this._accessKeyId) {
                this._accessKeyId = accessKeyId;
                let accessibleCaption: CommandUiAction.AccessibleCaption;
                if (accessKeyId === undefined) {
                    const unaccessibleCaption: CommandUiAction.UnaccessibleCaption = {
                        preAccessKey: this._caption,
                        accessKey: '',
                        postAccessKey: '',
                    };
                    accessibleCaption = unaccessibleCaption;
                } else {
                    this._accessibleCaption = CommandUiAction.AccessibleCaption.create(this._caption,
                        extStrings[accessKeyId.handle][accessKeyId.index]
                    );
                }
                this.notifyAccessibleCaptionChanged();
            }
        }

        onMouseClick(contactDocumentLine: Line) {
            if (!this.childMenu.rendered) {
                this.childMenuRenderEvent(this.childMenu, contactDocumentLine);
            } else {
                if (this.ownerMenu.isRoot) {
                    this.notifyClearChildMenus();
                }
            }
        }

        onMouseEnter(contactDocumentLine: Line) {
            this.mouseEnterEvent(this, contactDocumentLine);
        }

        onMouseLeave() {
            this.mouseLeaveEvent(this);
        }
    }

    export namespace ChildMenuItem {
        export const missingName = 'Missing';

        export type ChildMenuRenderEvent = (this: void, childMenu: ChildMenu, childMenuContactDocumentLine: Line) => void;
        export type MouseEnterEvent = (this: void, menuItem: ChildMenuItem, childMenuContactDocumentLine: Line) => void;
        export type MouseLeaveEvent = (this: void, menuItem: ChildMenuItem) => void;
    }

    export namespace ChildMenu {
        export type Stack = readonly ChildMenu[];
    }

    export enum RenderMenuItemTypeId {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        Command,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        ChildMenu,
        Divider,
    }

    export interface RenderMenuItem {
        readonly typeId: RenderMenuItemTypeId;
        readonly id: Integer;
    }

    export interface RenderMenu {
        readonly items: readonly RenderMenuItem[];
    }

    export const RootMenuName = 'InternalRoot';

    export const unpositionedCommandDefaultPosition: Command.MenuBarItemPosition = {
        menuPath: MenuItem.Position.commandMenuPath,
        rank: MenuItem.Position.defaultRank,
    } as const;
}
