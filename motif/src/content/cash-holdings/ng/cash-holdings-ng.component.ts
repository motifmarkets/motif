/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cash-holdings',
  templateUrl: './cash-holdings-ng.component.html',
  styleUrls: ['./cash-holdings-ng.component.scss'],

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashHoldingsNgComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
