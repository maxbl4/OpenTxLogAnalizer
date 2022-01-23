import {Component, Input, OnInit} from '@angular/core';
import {ILog, ILogRow} from "../../services/open-tx-log-parser";
import * as _ from "underscore";
import {LatLon, Distance} from "gps";

@Component({
  selector: 'otx-map-view',
  template: `
    <select class="form-select" aria-label="Default select example" [(ngModel)]="strokeWidth">
      <option value="4">4</option>
      <option value="6">6</option>
      <option value="8">8</option>
      <option value="10">10</option>
      <option value="12">12</option>
      <option value="14">14</option>
      <option value="16">16</option>
    </select>
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
  _strokeWidth = 14;
  get strokeWidth() {return this._strokeWidth;}
  set strokeWidth(v: number) {
    this._strokeWidth = parseInt(<any>v);
    this.drawTrack(false);
  }
  @Input() get selectedLog() {return this._selectedLog;}
  set selectedLog(v: ILog|undefined) {
    this._selectedLog = v;
    this.drawTrack(true);
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
      this.drawTrack(true);
    });
  }

  private drawTrack(setCenter:boolean) {
    if (!this._selectedLog || !this.myMap) return;
    this.myMap.geoObjects.removeAll();
    let coords = this.selectedLog?.rows.map(x => [x.lat, x.lon]) ?? [];
    const myPolyline = new ymaps.Polyline(coords, undefined, {strokeWidth:this.strokeWidth + 2, strokeColor: ["FFFFFF"]});
    this.myMap.geoObjects.add(myPolyline);
    if (setCenter) {
      const c = this.findTrackCenter(coords);
      this.myMap.setCenter(c.center, c.zoom);
    }
    this.drawMulticolorTrack();
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
      const t = new ymaps.Polyline([[rows[i].lat, rows[i].lon], [rows[i + 1].lat, rows[i + 1].lon]], {balloonContent : rss1.toString(), hintContent: rss1.toString()},
        {strokeWidth: this.strokeWidth, strokeColor: this.getMultiColor((rss1 - minRssi)/rssRange)});
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
    // Black 000000
    // Red   FF0000
    // Yell  FFFF00
    // Green 00FF00
    // White FFFFFF
    if (value < 0.25) {
      return this.colorPart(value * 4) + "0000";
    }
    if (value >= 0.25 && value < 0.5) {
      const v = (value - 0.25) * 4;
      return "FF" + this.colorPart(v) + "00";
    }
    if (value >= 0.5 && value < 0.75) {
      const v = (value - 0.5) * 4;
      return this.colorPart(1 - v) + "FF00";
    }
    const v = (value - 0.75) * 4;
    return "FFFF" + this.colorPart(v);
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
    const dist = Distance(minLat, minLon, maxLat, maxLon) * 1000;
    let zoom = 11;
    if (dist < 16000) zoom = 12;
    if (dist < 8000) zoom = 13;
    if (dist < 4000) zoom = 14;
    if (dist < 2000) zoom = 15;
    if (dist < 1000) zoom = 16;
    if (dist < 500) zoom = 17;
    if (dist < 300) zoom = 18;
    if (dist < 100) zoom = 19;
    console.log(dist, zoom);

    return {center: [(minLat + maxLat) / 2, (minLon + maxLon) / 2], zoom: zoom };
  }
}

declare const ymaps: any;

function init(){

}
