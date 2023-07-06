/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ColorScheme, Line, UnreachableCaseError, getElementDocumentPositionRect } from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { MenuBarChildItemComponentNgDirective } from '../../../ng/menu-bar-child-item-component-ng.directive';
import { MenuBarMenuItemComponentNgDirective } from '../../../ng/menu-bar-menu-item-component-ng.directive';
import { MenuBarNgService } from '../../../ng/menu-bar-ng.service';

@Component({
    selector: 'app-menu-bar-root-child-item',
    templateUrl: './menu-bar-root-child-item-ng.component.html',
    styleUrls: ['./menu-bar-root-child-item-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuBarRootChildItemNgComponent extends MenuBarChildItemComponentNgDirective implements OnInit, OnDestroy {
    constructor(cdr: ChangeDetectorRef, private readonly _elRef: ElementRef<HTMLElement>,
        settingsNgService: SettingsNgService,
        menuBarNgService: MenuBarNgService
    ) {
        super(cdr, settingsNgService.service, menuBarNgService);
    }

    @HostListener('click', []) handleClickEvent() {
        const contactLine = this.calculateChildMenuContactDocumentLine();
        this.menuItem.onMouseClick(contactLine);
    }

    @HostListener('mouseenter', []) handleMouseEnterEvent() {
        const contactLine = this.calculateChildMenuContactDocumentLine();
        this.menuItem.onMouseEnter(contactLine);
    }

    ngOnInit() {
        this.initialise();
    }

    ngOnDestroy() {
        this.finalise();
    }

    protected applyColors() {
        switch (this.stateColorId) {
            case MenuBarMenuItemComponentNgDirective.StateColorId.Disabled: {
                this.bkgdColor = this.colorSettings.getBkgd(ColorScheme.ItemId.MenuBar_RootItem_Disabled);
                this.foreColor = this.colorSettings.getFore(ColorScheme.ItemId.MenuBar_RootItem_Disabled);
                break;
            }
            case MenuBarMenuItemComponentNgDirective.StateColorId.Enabled: {
                this.bkgdColor = this.colorSettings.getBkgd(ColorScheme.ItemId.MenuBar_RootItem);
                this.foreColor = this.colorSettings.getFore(ColorScheme.ItemId.MenuBar_RootItem);
                break;
            }
            case MenuBarMenuItemComponentNgDirective.StateColorId.Highlighed: {
                this.bkgdColor = this.colorSettings.getBkgd(ColorScheme.ItemId.MenuBar_RootItemHighlighted);
                this.foreColor = this.colorSettings.getFore(ColorScheme.ItemId.MenuBar_RootItemHighlighted);
                break;
            }
            default:
                throw new UnreachableCaseError('MBRCICAC23399904', this.stateColorId);
        }
    }

    private calculateChildMenuContactDocumentLine(): Line {
        const documentRect = getElementDocumentPositionRect(this._elRef.nativeElement);
        const y = documentRect.top + documentRect.height;
        return {
            beginX: documentRect.left,
            beginY: y,
            endX: documentRect.left + documentRect.width - 1,
            endY: y,
        };
    }
}
