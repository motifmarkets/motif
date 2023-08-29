import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-scan-new-ng',
  templateUrl: './scan-new-ng.component.html',
  styleUrls: ['./scan-new-ng.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScanNewNgComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
