/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { SettingsNgService } from 'component-services-ng-api';
import { ColorScheme } from 'core-internal-api';
import { UnreachableCaseError } from 'sys-internal-api';
import { MenuBarCommandItemComponentNgDirective } from '../../../ng/menu-bar-command-item-component-ng.directive';
import { MenuBarMenuItemComponentNgDirective } from '../../../ng/menu-bar-menu-item-component-ng.directive';
import { MenuBarNgService } from '../../../ng/menu-bar-ng.service';

@Component({
    selector: 'app-menu-bar-overlay-command-item',
    templateUrl: './menu-bar-overlay-command-item-ng.component.html',
    styleUrls: ['./menu-bar-overlay-command-item-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuBarOverlayCommandItemNgComponent extends MenuBarCommandItemComponentNgDirective implements OnInit, OnDestroy {
    constructor(cdr: ChangeDetectorRef, settingsNgService: SettingsNgService, menuBarNgService: MenuBarNgService) {
        super(cdr, settingsNgService.settingsService, menuBarNgService);
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
}
