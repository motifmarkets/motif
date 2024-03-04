/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject } from '@angular/core';
import { AssertInternalError, LockOpenListItem, StringId, Strings } from '@motifmarkets/motif-core';
import { CoreInjectionTokens, ToastNgService } from 'component-services-ng-api';
import { GridSourceNgDirective } from '../../../grid-source/ng-api';
import { ContentNgService } from '../../../ng/content-ng.service';
import { LockOpenNotificationChannelsGridFrame } from '../lock-open-notification-channels-grid-frame';

@Component({
    selector: 'app-lock-open-notification-channels-grid',
    templateUrl: './lock-open-notification-channels-grid-ng.component.html',
    styleUrls: ['./lock-open-notification-channels-grid-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LockOpenNotificationChannelsGridNgComponent extends GridSourceNgDirective {
    declare frame: LockOpenNotificationChannelsGridNgComponent.Frame;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        private readonly _toastNgService: ToastNgService,
        contentNgService: ContentNgService,
        @Inject(CoreInjectionTokens.lockOpenListItemOpener) private readonly _opener: LockOpenListItem.Opener,
    ) {
        const frame: LockOpenNotificationChannelsGridNgComponent.Frame = contentNgService.createLockOpenNotificationChannelsGridFrame(_opener);
        super(elRef, ++LockOpenNotificationChannelsGridNgComponent.typeInstanceCreateCount, cdr, frame);
    }

    selectAllRows() {
        this.frame.selectAllRows();
    }

    getSelectedRecordIndices() {
        return this.frame.getSelectedRecordIndices();
    }

    protected override processAfterViewInit() {
        super.processAfterViewInit();
        this.frame.initialiseGrid(this._opener, undefined, false);
        const openPromise = this.frame.tryOpenDefault(true);
        openPromise.then(
            (openResult) => {
                if (openResult.isErr()) {
                    this._toastNgService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.NotificationChannelsGrid]}: ${openResult.error}`);
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'LONCGNCPAVI44332'); }
        );
    }
}

export namespace LockOpenNotificationChannelsGridNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;
    export type Frame = LockOpenNotificationChannelsGridFrame;
}
