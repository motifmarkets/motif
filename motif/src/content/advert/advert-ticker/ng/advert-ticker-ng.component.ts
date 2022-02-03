import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-advert-ticker',
  templateUrl: './advert-ticker-ng.component.html',
  styleUrls: ['./advert-ticker-ng.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdvertTickerNgComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
