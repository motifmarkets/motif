/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { SettingsNgService } from 'component-services-ng-api';
import { ColorScheme } from 'core-internal-api';
import { MenuBarNgService } from '../../../ng/menu-bar-ng.service';
import { MenuBarRenderItemComponentNgDirective } from '../../../ng/menu-bar-render-item-component-ng.directive';

@Component({
    selector: 'app-menu-bar-overlay-divider-item',
    templateUrl: './menu-bar-overlay-divider-item-ng.component.html',
    styleUrls: ['./menu-bar-overlay-divider-item-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuBarOverlayDividerItemNgComponent extends MenuBarRenderItemComponentNgDirective {
    public lineBkgdColor: string;

    constructor(cdr: ChangeDetectorRef, settingsNgService: SettingsNgService, menuBarNgService: MenuBarNgService) {
        super(cdr, menuBarNgService);
        this.lineBkgdColor = settingsNgService.settingsService.color.getFore(ColorScheme.ItemId.MenuBar_OverlayItem_Disabled);
    }
}
