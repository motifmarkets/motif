import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-scan-types-grid-ng',
  templateUrl: './scan-types-grid-ng.component.html',
  styleUrls: ['./scan-types-grid-ng.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScanTypesGridNgComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
