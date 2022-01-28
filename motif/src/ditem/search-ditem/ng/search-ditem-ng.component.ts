import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-search-ditem-ng',
  templateUrl: './search-ditem-ng.component.html',
  styleUrls: ['./search-ditem-ng.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchDitemNgComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
