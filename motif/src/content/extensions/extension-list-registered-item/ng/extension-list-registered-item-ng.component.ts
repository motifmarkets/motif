/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ExtensionId, ExtensionInfo } from '../../extension/internal-api';

@Component({
    selector: 'app-extension-list-registered-item',
    templateUrl: './extension-list-registered-item-ng.component.html',
    styleUrls: ['./extension-list-registered-item-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtensionListRegisteredItemNgComponent {

    @Output() installSignalEmitter = new EventEmitter();
    @Input() private _info: ExtensionInfo;

    public get abbreviatedPublisherTypeDisplay() { return ExtensionId.PublisherType.idToAbbreviatedDisplay(this._info.publisherTypeId); }
    public get publisherName() { return this._info.publisherName; }
    public get name() { return this._info.name; }
    public get version() { return this._info.version; }
    public get description() { return this._info.shortDescription; }

    public handleInstallClick() {
        this.installSignalEmitter.emit();
    }
}
