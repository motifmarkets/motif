/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Account } from 'src/adi/internal-api';
import { SettingsNgService } from 'src/component-services/ng-api';
import { Command, ProcessorCommandUiAction, UiAction } from 'src/core/internal-api';
import { extStrings } from 'src/res/internal-api';
import { MultiEvent } from 'src/sys/internal-api';
import { NgSelectUtils } from '../../../ng-select-utils';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { NgSelectOverlayNgService } from '../../../ng/ng-select-overlay-ng.service';
import { CommandComponentNgDirective } from '../../ng/command-component-ng.directive';

@Component({
    selector: 'app-command-select',
    templateUrl: './command-select-ng.component.html',
    styleUrls: ['./command-select-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class CommandSelectNgComponent extends CommandComponentNgDirective {
    @ViewChild('ngSelect', { static: true }) private _ngSelectComponent: NgSelectComponent;

    public selected: ProcessorCommandUiAction.Item | undefined;
    public entries: Entry[] = [];

    private _measureCanvasContextsEventSubscriptionId: MultiEvent.SubscriptionId;
    private _measureCanvasContext: CanvasRenderingContext2D;
    private _ngSelectDropDownPanelWidth: number | undefined;

    constructor(private _ngSelectOverlayNgService: NgSelectOverlayNgService,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService
    ) {
        super(cdr, settingsNgService.settingsService, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);
        this.inputId = 'EnumInput' + this.componentInstanceId;
        this._measureCanvasContext = this._ngSelectOverlayNgService.measureCanvasContext;
        this._measureCanvasContextsEventSubscriptionId = this._ngSelectOverlayNgService.subscribeMeasureCanvasContextsEvent(
            () => this.handleMeasureCanvasContextsEvent()
        );
    }

    focus() {
        // this does not work.  needs further investigation
        // const element = this._renderer.selectRootElement('symbolInput');
        // element.focus();
    }

    public customSearchFtn(term: string, item: Entry) {
        term = term.toUpperCase();
        return item.upperCaption.indexOf(term) > -1;
    }

    public handleSelectChangeEvent(event: unknown) {
        const changeEvent = event as ChangeEvent;

        if (changeEvent === undefined || changeEvent === null) {
            this.commitValue(undefined);
        } else {
            this.commitValue(changeEvent.item);
        }
    }

    public handleSelectSearchEvent(event: SearchEvent) {
        // this.inputValue(event.term, event.items.length === 1);
    }

    public handleSelectOpenEvent() {
        this._ngSelectOverlayNgService.notifyDropDownOpen();

        this.uiAction.notifyLatestItemsWanted();
        if (this._ngSelectDropDownPanelWidth === undefined) {
            this._ngSelectDropDownPanelWidth = this.calculateNgSelectDropDownPanelWidth();
        }
        this._ngSelectOverlayNgService.setDropDownPanelClientWidth(this._ngSelectDropDownPanelWidth, false);
    }

    protected override setStateColors(stateId: UiAction.StateId) {
        super.setStateColors(stateId);

        NgSelectUtils.ApplyColors(this._ngSelectComponent.element, this.foreColor, this.bkgdColor);
    }

    protected override applyValue(value: ProcessorCommandUiAction.Item | undefined) {
        if (!this.uiAction.edited) {
            super.applyValue(value);
            this._ngSelectComponent.searchTerm = '';
            this.selected = value;
            // if (value === undefined) {
            //     this.selected = undefined;
            // } else {
            //     const entry = this.findEntry(value);
            //     this.selected = entry.command;
            // }
            this.markForCheck();
        }
    }

    protected override applyItemCaption(command: Command, caption: string) {
        super.applyItemCaption(command, caption);
        this.updateEntries();
        this._ngSelectDropDownPanelWidth = undefined; // force recalculation
    }

    protected override applyItems() {
        super.applyItems();
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

    private calculateNgSelectDropDownPanelWidth() {
        let maxWidth = 0;
        const items = this.uiAction.items;
        for (const item of items) {
            const command = item.command;
            const caption = extStrings[command.extensionHandle][command.defaultDisplayIndex];
            const metrics = this._measureCanvasContext.measureText(caption);
            if (metrics.width > maxWidth) {
                maxWidth = metrics.width;
            }
        }

        const componentWidth = this._ngSelectComponent.element.offsetWidth;
        if (maxWidth < componentWidth) {
            maxWidth = componentWidth;
        }

        return maxWidth;
    }

    private updateEntries() {
        const items = this.uiAction.items;
        const count = items.length;
        const entries = new Array<Entry>(count);
        for (let i = 0; i < count; i++) {
            const item = items[i];
            const command = item.command;
            const caption = extStrings[command.extensionHandle][command.defaultDisplayIndex];
            const title = caption;
            const entry: Entry = {
                item,
                caption,
                upperCaption: caption.toUpperCase(),
                title,
            };
            entries[i] = entry;
        }
        this.entries = entries;
        this.markForCheck();
    }
}

interface Entry {
    item: ProcessorCommandUiAction.Item;
    caption: string;
    upperCaption: string;
    title: string;
}

interface SearchEvent {
    term: string;
    items: Account[];
}

type ChangeEvent = Entry | undefined | null;
