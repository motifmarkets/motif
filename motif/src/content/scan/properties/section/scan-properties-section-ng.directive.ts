/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Directive } from '@angular/core';
import { ExpandableCollapsibleLinedHeadingNgComponent } from '../../../expandable-collapsible-lined-heading/ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Directive()
export abstract class ScanPropertiesSectionNgDirective extends ContentComponentBaseNgDirective {
    protected _sectionHeadingComponent: ExpandableCollapsibleLinedHeadingNgComponent;

    public abstract sectionHeadingText: string;

    initialiseSectionHeadingComponent() {
        this._sectionHeadingComponent.expandEventer = () => this.handleExpandEvent();
        this._sectionHeadingComponent.restoreEventer = () => this.handleRestoreEvent();
        this._sectionHeadingComponent.collapseEventer = () => this.handleCollapseEvent();
    }

    private handleExpandEvent() {

    }

    private handleRestoreEvent() {

    }

    private handleCollapseEvent() {

    }

}
