import {Component, Input, OnInit} from '@angular/core';
import {ILog, ILogRow} from "../../services/open-tx-log-parser";
import * as _ from "underscore";

@Component({
  selector: 'otx-map-view',
  template: `
    <div id="map" style="width: 100%; height: 800px"></div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
  `]
})
export class MapViewComponent implements OnInit {
  private _selectedLog?: ILog;
  private myMap: any;
  @Input() get selectedLog() {return this._selectedLog;}
  set selectedLog(v: ILog|undefined) {
    this._selectedLog = v;
    if (this.myMap)
      this.drawTrack();
  }

  constructor() { }

  ngOnInit(): void {
    ymaps.ready(() => {
      this.myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        // от 0 (весь мир) до 19.
        zoom: 7
      });
      this.myMap.setType('yandex#hybrid')
      if (this._selectedLog)
        this.drawTrack();
    });
  }

  private drawTrack() {
    let coords = this.selectedLog?.rows.map(x => [x.lat, x.lon]) ?? [];
    this.myMap.setCenter(this.findTrackCenter(coords), 17);
    this.drawMulticolorTrack();

    // const myPolyline = new ymaps.Polyline(coords, undefined, {strokeWidth:4, strokeColor: ["FF0000"]});
    // this.myMap.geoObjects.add(myPolyline);
  }

  private drawMulticolorTrack() {
    const rows = this.selectedLog?.rows ?? [];
    const minRssi = (<ILogRow>_.min(rows, x => x.rss1)).rss1 ?? 0;
    const maxRssi = (<ILogRow>_.max(rows, x => x.rss1)).rss1 ?? 0;
    const rssRange = maxRssi - minRssi;
    let currentRss = rows[0].rss1!;
    let minShown = false;
    for (let i = 0; i < rows.length - 1; i++) {
      const rss1 = <number>rows[i].rss1;
      const t = new ymaps.Polyline([[rows[i].lat, rows[i].lon], [rows[i + 1].lat, rows[i + 1].lon]], {balloonContent : rss1.toString()},
        {strokeWidth:6, strokeColor: this.getMultiColor((rss1 - minRssi)/rssRange)});
      this.myMap.geoObjects.add(t);
      if (Math.abs(currentRss - rss1)/rssRange > 0.2) {
        const myPlacemark = new ymaps.Placemark([rows[i].lat, rows[i].lon], {iconCaption: rss1.toString()});
        this.myMap.geoObjects.add(myPlacemark);
        currentRss = rss1;
      }
      if (rss1 == minRssi && !minShown) {
        const myPlacemark = new ymaps.Placemark([rows[i].lat, rows[i].lon], {iconCaption: "MIN: " + rss1.toString()});
        this.myMap.geoObjects.add(myPlacemark);
        minShown = true;
      }
    }
  }

  private getMultiColor(value:number) {
    return this.colorPart(1 - value) + this.colorPart(value) + "00";
  }

  private colorPart(value: number) {
    const s = Math.round(value * 255).toString(16);
    if (s.length == 1)
      return "0" + s;
    return s;
  }

  private findTrackCenter(coords: (number | undefined)[][]) {
    let minLat = 1000, maxLat = -1000, minLon = 1000, maxLon = -1000;
    for (let c of coords) {
      if (c[0]! > maxLat) maxLat = c[0]!;
      if (c[0]! < minLat) minLat = c[0]!;
      if (c[1]! > maxLon) maxLon = c[1]!;
      if (c[1]! < minLon) minLon = c[1]!;
    }
    return [(minLat + maxLat) / 2, (minLon + maxLon) / 2];
  }
}

declare const ymaps: any;

function init(){

}
