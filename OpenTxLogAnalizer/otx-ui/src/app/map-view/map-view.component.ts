import {Component, OnInit} from '@angular/core';
import {Distance} from "gps";
import {PersistenceService} from "../../services/persistence.service";
import {DataManager} from "../../services/data-manager";
import {StatTriple} from "../../services/IStats";
import {LogRow} from "../../services/open-tx-log-parser";

@Component({
  selector: 'otx-map-view',
  template: `
    <div class="grid-two-panes flex-grow-1">
      <div class="grid-left-pane">
        <div class="mb-3">
          <label for="formGroupExampleInput" class="form-label">Value to draw</label>
          <select class="form-select" multiple [(ngModel)]="selectedStat" (change)="drawTrack()" [size]="stats.length">
            <option [value]="s" *ngFor="let s of stats">{{s.name}}</option>
          </select>
        </div>
        <otx-log-bounds-control></otx-log-bounds-control>
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
  private myMap: any;
  selectedStat = [this.stats[0]];
  strokeWidth = 14;
  private objectManager: any;
  private trackCenter?: { trackBounds: { minLon: number; maxLat: number; minLat: number; maxLon: number }; center: number[]; zoom: number, trackSize: number };

  constructor(private persistence: PersistenceService, public data: DataManager) {
    const d = persistence.mapViewPreferences ?? {selectedStat: this.stats[0].field, strokeWidth: 14};
    this.strokeWidth = d.strokeWidth!;
    this.selectedStat = [this.stats.find(x => x.field === d.selectedStat) ?? this.stats[0]];
    data.selectedLogChange.subscribe(x => this.drawTrack(true));
  }

  ngOnInit(): void {
    ymaps.ready(() => {
      this.myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        controls: ['typeSelector', 'fullscreenControl', 'zoomControl', 'rulerControl'],
        zoom: 7
      });
      this.myMap.setType('yandex#hybrid');
      this.objectManager = new ymaps.ObjectManager({});
      this.drawTrack(true);
    });
  }

  drawTrack(setCenter:boolean = false) {
    if (!this.data.selectedLog || !this.myMap) return;
    this.persistence.mapViewPreferences = {selectedStat: this.selectedStat[0].field, strokeWidth: this.strokeWidth};
    this.myMap.geoObjects.removeAll();
    this.objectManager.removeAll();
    this.myMap.geoObjects.add(this.objectManager);
    let coords = this.data.selectedLog.rows.map(x => [x.lat, x.lon]);
    const objectManagerData: any = {type: "FeatureCollection",
      features: [{
        type: 'Feature',
        id: 0,
        geometry: {
          type: 'LineString',
          coordinates: coords
        },
        options: {strokeWidth: parseInt(<any>this.strokeWidth) + 2, strokeColor: ["FFFFFF"]}
      }]};
    this.trackCenter = this.findTrackCenter(coords);
    if (setCenter) {
      this.myMap.setCenter(this.trackCenter.center, this.trackCenter.zoom);
    }
    this.drawMulticolorTrack(objectManagerData);
  }

  private drawMulticolorTrack(objectManagerData: any) {
    const rows = this.data.selectedLog!.rows;
    const selectedStat = this.selectedStat[0];
    const statData = <StatTriple>(<any>(this.data.selectedLog?.stats))[selectedStat.field]!;
    for (let i = 0; i < rows.length - 1; i++) {
      const stat = (<any>rows[i])[selectedStat.field] ?? 0;
      let statValue = (stat - statData.min)/statData.range;
      if (selectedStat.lowIsBetter)
        statValue = 1 - statValue;
      let color = this.getMultiColor(statValue);
      if (!statData.range)
        color = "00FF00";
      objectManagerData.features.push({
        type: 'Feature',
        id: i,
        geometry: {
          type: 'LineString',
          coordinates: [[rows[i].lat, rows[i].lon], [rows[i + 1].lat, rows[i + 1].lon]]
        },
        properties: {balloonContent : `[${i+1}] ${stat}`, hintContent: `${stat}`},
        options: {
          strokeWidth: this.strokeWidth, strokeColor: color, zIndex: 1000, zIndexActive: 1500
        }
      });
    }
    this.objectManager.add(objectManagerData);
    this.drawMarkers();
  }

  private drawMarkers() {
    const selectedStat = this.selectedStat[0];
    const statData = <StatTriple>(<any>(this.data.selectedLog?.stats))[selectedStat.field]!;
    const points = this.findInterestingPoint();
    this.myMap.geoObjects.add(new ymaps.Placemark([points[0].lat, points[0].lon], {iconCaption: `MIN: ` + statData.min}));
    this.myMap.geoObjects.add(new ymaps.Placemark([points[1].lat, points[1].lon], {iconCaption: `MAX: ` + statData.max}));

    for (let i = 2; i < points.length; i++) {
      const stat = (<any>points[i])[selectedStat.field] ?? 0;
      this.myMap.geoObjects.add(new ymaps.Placemark([points[i].lat, points[i].lon], {iconCaption: `${stat}`}));
    }
  }

  private findInterestingPoint(pointCount: number = 10) {
    if (this.data.selectedLog!.rows.length < pointCount + 2)
      return [];
    const selectedStat = this.selectedStat[0];
    const statData = <StatTriple>(<any>(this.data.selectedLog?.stats))[selectedStat.field]!;
    const result: LogRow[] = [
      this.data.selectedLog!.rows[statData.minIndex],
      this.data.selectedLog!.rows[statData.maxIndex],
    ];
    const rows = this.data.selectedLog!.rows;
    const minSpacing = Math.round(rows.length / (pointCount + 2));
    const window = 100;
    let i = 0;
    const data = [];
    while (i + window < rows.length) {
      data.push(this.minMax(rows, i, window, statData));
      i += window / 5;
    }
    if (selectedStat.lowIsBetter)
      data.sort((a,b) => b.value - a.value);
    else
      data.sort((a,b) => a.value - b.value);
    i = 0;
    while (i < data.length && result.length < pointCount) {
      const candidate = data[i];
      if (!result.find(x => Math.abs(x.index - candidate.index) <= minSpacing)) {
        result.push(rows[candidate.index]);
      }
      i++;
    }
    return result;
  }

  private minMax(rows: LogRow[], start: number, window: number, statData: StatTriple) {
    const selectedStat = this.selectedStat[0];
    const stat = (<any>rows[start])[selectedStat.field] ?? 0;
    let min = stat, max = stat, minIndex = start, maxIndex = start, avg = stat;
    for (let i = start; i < start + window; i++) {
      let stat = (<any>rows[i])[selectedStat.field] ?? 0;
      avg += stat;
      if (min > stat) {
        min = stat;
        minIndex = i;
      }
      if (max < stat) {
        max = stat;
        maxIndex = i;
      }
    }
    avg = avg / window;
    if (Math.abs(min - avg) > Math.abs(max - avg))
      return {value: min, index: minIndex - 1, difference: Math.abs(min - avg)};
    else
      return {value: max, index: maxIndex - 1, difference: Math.abs(max - avg)};
  }

  private getMultiColor(value:number) {
    if (isNaN(value)|| !isFinite(value) || value < 0 || value > 1)
      return "00ff00";
    const del = 1/3;
    if (value < del) {
      return this.colorPart(value * 3) + "0000";
    }
    if (value >= del && value < del * 2) {
      const v = (value - del) * 3;
      return "ff" + this.colorPart(v) + "00";
    }
    const v = Math.round((value - del * 2) * 3 * 255 % 255)/255;
    return this.colorPart(v) + "ff00";
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
        Distance(minLat, minLon, maxLat, minLon))
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

    return {center: [(minLat + maxLat) / 2, (minLon + maxLon) / 2], zoom: zoom, trackBounds: {minLat: minLat, minLon: minLon, maxLat: maxLat, maxLon: maxLon}, trackSize: dist };
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
  {name: "Trip", field: "distanceTraveled"},
  {name: "Sats Count", field: "sats"},
  {name: "Rx Battery", field: "rxBattery"},
  {name: "Current", field: "current", lowIsBetter: true},
  {name: "Capacity", field: "capacity", lowIsBetter: true},
  {name: "Power", field: "power", lowIsBetter: true},
  {name: "Watt hour per km", field: "wattPerKm", lowIsBetter: true},
  {name: "Watt hour per 10 km", field: "wattPer10Km", lowIsBetter: true},
  {name: "Estimated Range", field: "estimatedRange"},
  {name: "Estimated Time", field: "estimatedFlightTime"},
  {name: "RSSI dbm 1", field: "rss1"},
  {name: "RSSI dbm 2", field: "rss2"},
  {name: "LQ", field: "rqly"},
  {name: "LQ CRSF", field: "rqlySum"},
  {name: "SNR", field: "rsnr"},
  {name: "Tx Power", field: "tpwr", lowIsBetter: true},
  {name: "DJI Latency", field: "djiDelay", lowIsBetter: true},
  {name: "DJI Bitrate", field: "djiBitrate"},
];
