/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectorRef, Directive, ElementRef, ViewChild } from '@angular/core';
import { Account, AssertInternalError, Integer, MultiEvent, SettingsService, UiAction } from '@motifmarkets/motif-core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgSelectUtils } from '../../ng-select-utils';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';
import { NgSelectOverlayNgService } from '../../ng/ng-select-overlay-ng.service';
import { EnumComponentBaseNgDirective } from './enum-component-base-ng.directive';

@Directive()
export abstract class EnumInputNgDirective<T> extends EnumComponentBaseNgDirective<T> {
    @ViewChild('ngSelect', { static: true }) private _ngSelectComponent: NgSelectComponent;

    openEventer: EnumInputNgComponent.OpenEventer | undefined;

    public selected: T | undefined;
    public entries: Entry<T>[] = [];

    private _measureCanvasContextsEventSubscriptionId: MultiEvent.SubscriptionId;
    private _measureCanvasContext: CanvasRenderingContext2D;
    private _ngSelectDropDownPanelWidth: number | undefined;

    constructor(
        elRef: ElementRef<HTMLElement>,
        typeInstanceCreateId: Integer,
        private _ngSelectOverlayNgService: NgSelectOverlayNgService,
        cdr: ChangeDetectorRef,
        settingsService: SettingsService,
        undefinedValue: T,
    ) {
        super(
            elRef,
            typeInstanceCreateId,
            cdr,
            settingsService,
            ControlComponentBaseNgDirective.textControlStateColorItemIdArray,
            undefinedValue,
        );
        this.inputId = 'EnumInput' + this.typeInstanceId;
        this._measureCanvasContext = this._ngSelectOverlayNgService.measureCanvasContext;
        this._measureCanvasContextsEventSubscriptionId = this._ngSelectOverlayNgService.subscribeMeasureCanvasContextsEvent(
            () => this.handleMeasureCanvasContextsEvent()
        );
    }

    public customSearchFtn(term: string, item: Entry<T>) {
        term = term.toUpperCase();
        return item.upperCaption.includes(term);
    }

    public handleSelectChangeEvent(event: unknown) {
        const changeEvent = event as ChangeEvent<T>;

        if (changeEvent === undefined || changeEvent === null) {
            this.commitValue(undefined);
        } else {
            this.commitValue(changeEvent.element);
        }
    }

    public handleSelectSearchEvent(event: SearchEvent) {
        // this.inputValue(event.term, event.items.length === 1);
    }

    public handleSelectOpenEvent() {
        if (this.openEventer !== undefined) {
            const promise = this.openEventer();
            promise.then(
                () => {
                    this.setDropDownPanelClientWidth();
                },
                (reason) => { throw AssertInternalError.createIfNotError(reason, 'EINCHSOE31313'); }
            );
        } else {
            this.setDropDownPanelClientWidth();
        }
    }

    protected override setStateColors(stateId: UiAction.StateId) {
        super.setStateColors(stateId);

        NgSelectUtils.ApplyColors(this._ngSelectComponent.element, this.foreColor, this.bkgdColor);
    }

    protected override applyValue(value: T | undefined, edited: boolean) {
        if (!edited) {
            this._ngSelectComponent.searchTerm = '';
            this.selected = value;
            // if (value === undefined) {
            //     this.selected = undefined;
            // } else {
            //     const entry = this.findEntry(value);
            //     this.selected = entry.element;
            // }
            this.markForCheck();
        }
    }

    protected override applyFilter(filter: T[] | undefined) {
        super.applyFilter(filter);
        this.updateEntries();
    }

    protected override applyElementCaption(element: T, caption: string) {
        super.applyElementCaption(element, caption);
        this.updateEntries();
        this._ngSelectDropDownPanelWidth = undefined; // force recalculation
    }

    protected override applyElements() {
        super.applyElements();
        this.updateEntries();
        this._ngSelectDropDownPanelWidth = undefined; // force recalculation
    }

    protected override finalise() {
        this._ngSelectOverlayNgService.unsubscribeMeasureCanvasContextsEvent(this._measureCanvasContextsEventSubscriptionId);
        super.finalise();
    }

    private handleMeasureCanvasContextsEvent() {
        this._measureCanvasContext = this._ngSelectOverlayNgService.measureCanvasContext;
        this._ngSelectDropDownPanelWidth = undefined; // force recalculation
    }

    private setDropDownPanelClientWidth() {
        this._ngSelectOverlayNgService.notifyDropDownOpen();

        if (this._ngSelectDropDownPanelWidth === undefined) {
            this._ngSelectDropDownPanelWidth = this.calculateNgSelectDropDownPanelWidth();
        }
        this._ngSelectOverlayNgService.setDropDownPanelClientWidth(this._ngSelectDropDownPanelWidth, false);
    }

    private calculateNgSelectDropDownPanelWidth() {
        let maxWidth = 0;
        const filter = this.uiAction.filter;
        const elementPropertiesArray = this.uiAction.getElementPropertiesArray();
        for (const properties of elementPropertiesArray) {
            const element = properties.element;
            if (filter === undefined || filter.includes(element)) {
                const caption = properties.caption;
                const metrics = this._measureCanvasContext.measureText(caption);
                if (metrics.width > maxWidth) {
                    maxWidth = metrics.width;
                }
            }
        }

        const componentWidth = this._ngSelectComponent.element.offsetWidth;
        if (maxWidth < componentWidth) {
            maxWidth = componentWidth;
        }

        return maxWidth;
    }

    private updateEntries() {
        const filter = this.uiAction.filter;

        const elementPropertiesArray = this.uiAction.getElementPropertiesArray();
        const maxCount = elementPropertiesArray.length;
        const entries = new Array<Entry<T>>(maxCount);
        let count = 0;
        for (const properties of elementPropertiesArray) {
            const element = properties.element;
            if (filter === undefined || filter.includes(element)) {
                const caption = properties.caption;
                const title = properties.title;
                const entry: Entry<T> = {
                    element,
                    caption,
                    upperCaption: caption.toUpperCase(),
                    title,
                };
                entries[count++] = entry;
            }
        }

        entries.length = count;
        this.entries = entries;
        this.markForCheck();
    }
}

interface Entry<T> {
    element: T;
    caption: string;
    upperCaption: string;
    title: string;
}

interface SearchEvent {
    term: string;
    items: Account[];
}

type ChangeEvent<T> = Entry<T> | undefined | null;

export namespace EnumInputNgComponent {
    export type OpenEventer = (this: void) => Promise<void>;
}
