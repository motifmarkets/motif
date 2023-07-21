/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, ElementRef } from '@angular/core';
import { StringId, Strings } from '@motifmarkets/motif-core';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { Version } from 'generated-internal-api';
import { nanoid } from 'nanoid';
import { ConfigNgService } from '../../ng/config-ng.service';

@Component({
    selector: 'app-not-current-version',
    templateUrl: './not-current-version-ng.component.html',
    styleUrls: ['./not-current-version-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotCurrentVersionNgComponent extends ComponentBaseNgDirective {
    private static typeInstanceCreateCount = 0;

    public notRunningCurrentVersionText = Strings[StringId.NotCurrentVersion_NotRunningCurrentVersion];
    public currentCaption = Strings[StringId.NotCurrentVersion_CurrentCaption];
    public currentVersion: string;
    public runningCaption = Strings[StringId.NotCurrentVersion_RunningCaption];
    public runningVersion = Version.app;
    public clickButtonToAttemptLoadCurrentText = Strings[StringId.NotCurrentVersion_ClickButtonToAttemptLoadCurrentText];
    public reloadAppCaption = Strings[StringId.NotCurrentVersion_ReloadAppCaption];
    public moreInfo = Strings[StringId.NotCurrentVersion_MoreInfo];

    constructor(elRef: ElementRef<HTMLElement>, configNgService: ConfigNgService) {
        super(elRef, ++NotCurrentVersionNgComponent.typeInstanceCreateCount);
        this.currentVersion = configNgService.version;
    }

    public reloadAppClick() {
        const random = Date.now().toString(10) + nanoid();
        const url = window.location.origin + `?random=${random}`;
        window.location.replace(url);
    }
}
