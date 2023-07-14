import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GridSourceNgDirective } from '../../grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { BrokerageAccountsFrame } from '../brokerage-accounts-frame';

@Component({
    selector: 'app-brokerage-accounts',
    templateUrl: './brokerage-accounts-ng.component.html',
    styleUrls: ['./brokerage-accounts-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrokerageAccountsNgComponent extends GridSourceNgDirective {
    declare frame: BrokerageAccountsFrame;

    protected override createGridSourceFrame(contentNgService: ContentNgService, hostElement: HTMLElement) {
        return  contentNgService.createBrokerageAccountsFrame(this, hostElement);
    }
}
