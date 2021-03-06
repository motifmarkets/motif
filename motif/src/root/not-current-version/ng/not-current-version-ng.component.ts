/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StringId, Strings } from '@motifmarkets/motif-core';
import { Version } from 'generated-internal-api';
import { nanoid } from 'nanoid';
import { ComponentBaseNgDirective } from 'src/component/ng-api';
import { ConfigNgService } from '../../ng/config-ng.service';

@Component({
    selector: 'app-not-current-version',
    templateUrl: './not-current-version-ng.component.html',
    styleUrls: ['./not-current-version-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotCurrentVersionNgComponent extends ComponentBaseNgDirective {
    public notRunningCurrentVersionText = Strings[StringId.NotCurrentVersion_NotRunningCurrentVersion];
    public currentCaption = Strings[StringId.NotCurrentVersion_CurrentCaption];
    public currentVersion: string;
    public runningCaption = Strings[StringId.NotCurrentVersion_RunningCaption];
    public runningVersion = Version.app;
    public clickButtonToAttemptLoadCurrentText = Strings[StringId.NotCurrentVersion_ClickButtonToAttemptLoadCurrentText];
    public reloadAppCaption = Strings[StringId.NotCurrentVersion_ReloadAppCaption];
    public moreInfo = Strings[StringId.NotCurrentVersion_MoreInfo];

    constructor(configNgService: ConfigNgService) {
        super();
        this.currentVersion = configNgService.version;
    }

    public reloadAppClick() {
        const random = Date.now().toString(10) + nanoid();
        const url = window.location.origin + `?random=${random}`;
        window.location.replace(url);
    }
}
