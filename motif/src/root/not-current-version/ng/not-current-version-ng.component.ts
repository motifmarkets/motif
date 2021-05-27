/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Version } from 'src/generated/internal-api';
import { StringId, Strings } from 'src/res/i18n-strings';
import { v1 as uuid } from 'uuid';
import { ConfigNgService } from '../../ng/config-ng.service';

@Component({
    selector: 'app-not-current-version',
    templateUrl: './not-current-version-ng.component.html',
    styleUrls: ['./not-current-version-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotCurrentVersionNgComponent {
    public notRunningCurrentVersionText = Strings[StringId.NotCurrentVersion_NotRunningCurrentVersion];
    public currentCaption = Strings[StringId.NotCurrentVersion_CurrentCaption];
    public currentVersion: string;
    public runningCaption = Strings[StringId.NotCurrentVersion_RunningCaption];
    public runningVersion = Version.app;
    public clickButtonToAttemptLoadCurrentText = Strings[StringId.NotCurrentVersion_ClickButtonToAttemptLoadCurrentText];
    public reloadAppCaption = Strings[StringId.NotCurrentVersion_ReloadAppCaption];
    public moreInfo = Strings[StringId.NotCurrentVersion_MoreInfo];

    constructor(configNgService: ConfigNgService) {
        this.currentVersion = configNgService.version;
    }

    public reloadAppClick() {
        const random = Date.now().toString(10) + uuid();
        const url = window.location.origin + `?random=${random}`;
        window.location.replace(url);
    }
}
