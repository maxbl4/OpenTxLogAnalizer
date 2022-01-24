import {Component, Input, OnInit} from '@angular/core';
import {ILog, ILogRow} from "../../services/open-tx-log-parser";
import * as _ from "underscore";
import {Distance} from "gps";
import {PersistenceService} from "../../services/persistence.service";
import {DataManager} from "../../services/data-manager";

@Component({
  selector: 'otx-map-view',
  template: `
    <div class="row">
      <div class="col">
        <otx-log-bounds-control [selectedLog]="selectedLog" (boundsChange)="drawTrack()"></otx-log-bounds-control>
      </div>
    </div>
    <div class="grid-two-panes flex-grow-1">
      <div class="grid-left-pane">
        <div class="mb-3">
          <label for="formGroupExampleInput" class="form-label">Value to draw</label>
          <select class="form-select" multiple [(ngModel)]="selectedStat" (change)="drawTrack()" [size]="stats.length">
            <option [value]="s" *ngFor="let s of stats">{{s.name}}</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="formGroupExampleInput" class="form-label">Line Width</label>
          <select class="form-select" aria-label="Default select example" [(ngModel)]="strokeWidth" (change)="drawTrack()">
            <option [value]="4">4</option>
            <option [value]="6">6</option>
            <option [value]="8">8</option>
            <option [value]="10">10</option>
            <option [value]="12">12</option>
            <option [value]="14">14</option>
            <option [value]="16">16</option>
          </select>
        </div>
      </div>
      <div class="grid-right-pane" style="display: grid">
          <div id="map" style="width: 100%; height: 100%"></div>
      </div>
    </div>
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
  stats = knownStats;
  private _selectedLog?: ILog;
  private myMap: any;
  selectedStat = [this.stats[0]];
  strokeWidth = 14;
  @Input() get selectedLog() {return this._selectedLog;}
  set selectedLog(v: ILog|undefined) {
    this._selectedLog = v;
    this.drawTrack(true);
  }

  constructor(private persistence: PersistenceService, public data: DataManager) {
    const d = persistence.mapViewPreferences ?? {selectedStat: this.stats[0].field, strokeWidth: 14};
    this.strokeWidth = d.strokeWidth!;
    this.selectedStat = [this.stats.find(x => x.field === d.selectedStat) ?? this.stats[0]];
  }

  ngOnInit(): void {
    ymaps.ready(() => {
      this.myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        controls: ['typeSelector', 'fullscreenControl', 'zoomControl', 'rulerControl'],
        zoom: 7
      });
      this.myMap.setType('yandex#hybrid')
      this.drawTrack(true);
    });
  }

  drawTrack(setCenter:boolean = false) {
    if (!this._selectedLog || !this.myMap) return;
    this.persistence.mapViewPreferences = {selectedStat: this.selectedStat[0].field, strokeWidth: this.strokeWidth};
    this.myMap.geoObjects.removeAll();
    let coords = this.getRows().map(x => [x.lat, x.lon]);
    const myPolyline = new ymaps.Polyline(coords, undefined, {strokeWidth: parseInt(<any>this.strokeWidth) + 2, strokeColor: ["FFFFFF"]});
    this.myMap.geoObjects.add(myPolyline);
    if (setCenter) {
      const c = this.findTrackCenter(coords);
      this.myMap.setCenter(c.center, c.zoom);
    }
    this.drawMulticolorTrack();
  }

  private drawMulticolorTrack() {
    const rows = this.getRows();
    const selectedStat = this.selectedStat[0];
    const minRow = <ILogRow>_.min(rows, (x:any) => x[selectedStat.field]);
    const maxRow = <ILogRow>_.max(rows, (x:any) => x[selectedStat.field]);
    const minStat = (<any>minRow)[selectedStat.field] ?? 0;
    const maxStat = (<any>maxRow)[selectedStat.field] ?? 0;
    const statRange = maxStat - minStat;
    let minShown = false, maxShown = false;
    const markerSpacing = Math.round(rows.length / 5);
    for (let i = 0; i < rows.length - 1; i++) {
      const stat = (<any>rows[i])[selectedStat.field];
      let statValue = (stat - minStat)/statRange;
      if (selectedStat.lowIsBetter)
        statValue = 1 - statValue;
      let color = this.getMultiColor(statValue);
      if (statRange == 0)
        color = "FFFFFF";
      const t = new ymaps.Polyline([[rows[i].lat, rows[i].lon], [rows[i + 1].lat, rows[i + 1].lon]], {balloonContent : stat.toString(), hintContent: stat.toString()},
        {strokeWidth: this.strokeWidth, strokeColor: color});
      this.myMap.geoObjects.add(t);
      if (i % markerSpacing == 0) {
        const myPlacemark = new ymaps.Placemark([rows[i].lat, rows[i].lon], {iconCaption: stat.toString()});
        this.myMap.geoObjects.add(myPlacemark);
      }
      if (i == minRow.index && !minShown) {
        const myPlacemark = new ymaps.Placemark([rows[i].lat, rows[i].lon], {iconCaption: "MIN: " + stat.toString()});
        this.myMap.geoObjects.add(myPlacemark);
        minShown = true;
      }
      if (i == maxRow.index && !maxShown) {
        const myPlacemark = new ymaps.Placemark([rows[i].lat, rows[i].lon], {iconCaption: "MAX: " + stat.toString()});
        this.myMap.geoObjects.add(myPlacemark);
        maxShown = true;
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
    const dist = Math.max(Distance(minLat, minLon, minLat, maxLon),
        Distance(maxLat, minLon, maxLat, maxLon),
        Distance(minLat, minLon, maxLat, minLon),
        Distance(minLat, maxLon, maxLat, maxLon))
      * 1000;
    let zoom = 11;
    if (dist < 20480) zoom = 11;
    if (dist < 10240) zoom = 12;
    if (dist < 5120) zoom = 13;
    if (dist < 2560) zoom = 14;
    if (dist < 1280) zoom = 15;
    if (dist < 640) zoom = 16;
    if (dist < 320) zoom = 17;
    if (dist < 160) zoom = 18;
    if (dist < 80) zoom = 19;

    return {center: [(minLat + maxLat) / 2, (minLon + maxLon) / 2], zoom: zoom };
  }

  private getRows() {
    return this.selectedLog?.rows.slice(this.data.startRow, this.data.endRow) ?? [];
  }
}

declare const ymaps: any;

export interface MapViewPreferences {
  strokeWidth?: number;
  selectedStat?: string;
}

export interface StatDesc {
  name: string;
  field: string;
  lowIsBetter?: boolean;
}

export const knownStats: StatDesc[] = [
  {name: "Speed", field: "gpsSpeed"},
  {name: "Altitude", field: "altitude"},
  {name: "Pitch Degrees", field: "pitchDeg"},
  {name: "Throttle %", field: "throttle"},
  {name: "Home", field: "distanceToHome", lowIsBetter: true},
  {name: "Sats Count", field: "sats"},
  {name: "Rx Battery", field: "rxBattery"},
  {name: "Current", field: "current", lowIsBetter: true},
  {name: "Capacity", field: "capacity", lowIsBetter: true},
  {name: "Watt hour per km", field: "wattPerKm", lowIsBetter: true},
  {name: "Estimated Range", field: "estimatedRange"},
  {name: "Estimated Time", field: "estimatedFlightTime"},
  {name: "RSSI dbm", field: "rss1"},
  {name: "LQ", field: "rqly"},
  {name: "Tx Power", field: "tpwr", lowIsBetter: true},
  {name: "DJI Latency", field: "djiDelay", lowIsBetter: true},
  {name: "DJI Bitrate", field: "djiBitrate"},
];
