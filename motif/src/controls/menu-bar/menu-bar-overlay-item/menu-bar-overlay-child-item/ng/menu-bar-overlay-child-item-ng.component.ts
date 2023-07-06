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
    selector: 'app-menu-bar-overlay-child-item',
    templateUrl: './menu-bar-overlay-child-item-ng.component.html',
    styleUrls: ['./menu-bar-overlay-child-item-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuBarOverlayChildItemNgComponent extends MenuBarChildItemComponentNgDirective implements OnInit, OnDestroy {
    constructor(cdr: ChangeDetectorRef,
        private readonly _elRef: ElementRef<HTMLElement>,
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
                this.bkgdColor = this.colorSettings.getBkgd(ColorScheme.ItemId.MenuBar_OverlayItem_Disabled);
                this.foreColor = this.colorSettings.getFore(ColorScheme.ItemId.MenuBar_OverlayItem_Disabled);
                break;
            }
            case MenuBarMenuItemComponentNgDirective.StateColorId.Enabled: {
                this.bkgdColor = this.colorSettings.getBkgd(ColorScheme.ItemId.MenuBar_OverlayItem);
                this.foreColor = this.colorSettings.getFore(ColorScheme.ItemId.MenuBar_OverlayItem);
                break;
            }
            case MenuBarMenuItemComponentNgDirective.StateColorId.Highlighed: {
                this.bkgdColor = this.colorSettings.getBkgd(ColorScheme.ItemId.MenuBar_OverlayItemHighlighted);
                this.foreColor = this.colorSettings.getFore(ColorScheme.ItemId.MenuBar_OverlayItemHighlighted);
                break;
            }
            default:
                throw new UnreachableCaseError('MBOCICAC23399934', this.stateColorId);
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
