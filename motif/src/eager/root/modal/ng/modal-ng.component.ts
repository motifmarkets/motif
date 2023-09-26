/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit } from '@angular/core';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { ModalNgService } from '../../ng/modal-ng.service';


@Component({
    selector: 'app-jw-modal',
    template: './modal.component.html',

    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ModalNgComponent extends ComponentBaseNgDirective implements OnInit {
    private static typeInstanceCreateCount = 0;

    @Input() id: string;
    // private element: any;

    constructor(elRef: ElementRef<HTMLElement>, private modalService: ModalNgService) {
        super(elRef, ++ModalNgComponent.typeInstanceCreateCount);
    }

    ngOnInit(): void {
        // const modal = this;

        // ensure id attribute exists
        if (!this.id) {
            console.error('modal must have an id');
            return;
        }

        // move element to bottom of page (just before </body>) so it can be displayed above everything else
        // document.body.appendChild(this.element);

        // close modal on background click
        // this.element.addEventListener('click', function (e: any) {
        //     if (e.target.className === 'jw-modal') {
        //         modal.close();
        //     }
        // });

        // add self (this modal instance) to the modal service so it's accessible from controllers
        // this.modalService.add(this);
    }

    // open modal
    open(): void {
        // this.element.style.display = 'block';
        // document.body.classList.add('jw-modal-open');
    }

    // close modal
    close(): void {
        // this.element.style.display = 'none';
        // document.body.classList.remove('jw-modal-open');
    }
}
