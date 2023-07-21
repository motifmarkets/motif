/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { ColorScheme } from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { MenuBarNgService } from '../../../ng/menu-bar-ng.service';
import { MenuBarRenderItemComponentNgDirective } from '../../../ng/menu-bar-render-item-component-ng.directive';

@Component({
    selector: 'app-menu-bar-overlay-divider-item',
    templateUrl: './menu-bar-overlay-divider-item-ng.component.html',
    styleUrls: ['./menu-bar-overlay-divider-item-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuBarOverlayDividerItemNgComponent extends MenuBarRenderItemComponentNgDirective {
    private static typeInstanceCreateCount = 0;

    public lineBkgdColor: string;

    constructor(elRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService, menuBarNgService: MenuBarNgService) {
        super(elRef, ++MenuBarOverlayDividerItemNgComponent.typeInstanceCreateCount, cdr, menuBarNgService);
        this.lineBkgdColor = settingsNgService.service.color.getFore(ColorScheme.ItemId.MenuBar_OverlayItem_Disabled);
    }
}
