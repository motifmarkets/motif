/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { MultiEvent, UiAction } from '@motifmarkets/motif-core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { SettingsNgService } from 'component-services-ng-api';
import { TypedArrayUiActionNgDirective } from '../../../array/ng-api';
import { NgSelectUtils } from '../../../ng-select-utils';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { NgSelectOverlayNgService } from '../../../ng/ng-select-overlay-ng.service';

@Component({
    selector: 'app-string-array-input',
    templateUrl: './string-array-input-ng.component.html',
    styleUrls: ['./string-array-input-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class StringArrayInputNgComponent extends TypedArrayUiActionNgDirective<string> implements AfterViewInit {
    private static typeInstanceCreateCount = 0;

    @Input() inputSize = '8em';
    @Input() addTag = true;
    @Input() isOpen: boolean;

    @ViewChild('ngSelect', { static: true }) private _ngSelectComponent: NgSelectComponent;

    private _selecting = false;
    private _committing = false;

    private _measureCanvasContextsEventSubscriptionId: MultiEvent.SubscriptionId;
    private _measureCanvasContext: CanvasRenderingContext2D;
    private _ngSelectDropDownPanelWidth: number | undefined;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        private _ngSelectOverlayNgService: NgSelectOverlayNgService,
        settingsNgService: SettingsNgService
    ) {
        super(
            elRef,
            ++StringArrayInputNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
            ControlComponentBaseNgDirective.textControlStateColorItemIdArray
        );
        this.inputId = 'StringArrayInput' + this.typeInstanceId;
        this._measureCanvasContext = this._ngSelectOverlayNgService.measureCanvasContext;
        this._measureCanvasContextsEventSubscriptionId = this._ngSelectOverlayNgService.subscribeMeasureCanvasContextsEvent(
            () => this.handleMeasureCanvasContextsEvent()
        );
    }

    ngAfterViewInit() {
        this._ngSelectComponent.element.style.setProperty(inputSizeCssCustomPropertyName, this.inputSize);
    }

    public handleSelectChangeEvent(event: ChangeEvent) {
        if (!this._selecting) {
            this._committing = true;
            if (event === undefined || event === null) {
                this.commitValue(undefined);
            } else {
                const value = event.slice();
                this.commitValue(value);
            }
            this._committing = false;
        }
    }

    public handleSelectSearchEvent(event: SearchEvent) {
        // const items = event.items;
        // const value = items.slice();
        // this.inputValue(value);
    }

    public handleSelectOpenEvent() {
        this._ngSelectOverlayNgService.notifyDropDownOpen();

        if (this._ngSelectDropDownPanelWidth === undefined) {
            this._ngSelectDropDownPanelWidth = this.calculateNgSelectDropDownPanelWidth();
        }
        this._ngSelectOverlayNgService.setDropDownPanelClientWidth(this._ngSelectDropDownPanelWidth, false);
    }

    protected override setStateColors(stateId: UiAction.StateId) {
        super.setStateColors(stateId);

        NgSelectUtils.ApplyColors(this._ngSelectComponent.element, this.foreColor, this.bkgdColor);
    }

    protected override applyValue(value: string[] | undefined, edited: boolean) {
        if (!edited && !this._committing) {
            this._selecting = true;
            super.applyValue(value, edited);
            this._ngSelectComponent.searchTerm = '';
            if (value === undefined) {
                value = [];
            }
            this._ngSelectComponent.itemsList.clearSelected();
            this._ngSelectComponent.itemsList.setItems(value);
            const items = this._ngSelectComponent.itemsList.items;
            const itemCount = items.length;
            for (let i = 0; i < itemCount; i++) {
                const item = (items)[i];
                this._ngSelectComponent.select(item);
            }
            this.markForCheck();
            this._selecting = false;
        }
    }

    protected override finalise() {
        this._ngSelectOverlayNgService.unsubscribeMeasureCanvasContextsEvent(this._measureCanvasContextsEventSubscriptionId);
        super.finalise();
    }

    private handleMeasureCanvasContextsEvent() {
        this._measureCanvasContext = this._ngSelectOverlayNgService.measureCanvasContext;
        this._ngSelectDropDownPanelWidth = undefined; // force recalculation
    }

    private calculateNgSelectDropDownPanelWidth() {
        let maxWidth = 0;
        // const filter = this.uiAction.filter;
        // const elementPropertiesArray = this.uiAction.getElementPropertiesArray();
        // for (const properties of elementPropertiesArray) {
        //     const element = properties.element;
        //     if (filter === undefined || filter.includes(element)) {
        //         const caption = properties.caption;
        //         const metrics = this._measureCanvasContext.measureText(caption);
        //         if (metrics.width > maxWidth) {
        //             maxWidth = metrics.width;
        //         }
        //     }
        // }

        const componentWidth = this._ngSelectComponent.element.offsetWidth;
        if (maxWidth < componentWidth) {
            maxWidth = componentWidth;
        }

        return maxWidth;
    }
}

const inputSizeCssCustomPropertyName = '--inputSize';

interface SearchEvent {
    term: string;
    items: string[];
}

type ChangeEvent = string[] | undefined | null;
