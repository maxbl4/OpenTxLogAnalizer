import { Component } from '@angular/core';
import {GridApi, GridOptions} from "ag-grid-community";
import {NgxFileDropEntry} from "ngx-file-drop";
import {ILog, OpenTxLogParser} from "../services/open-tx-log-parser";
import {DateTime} from "luxon";
import * as _ from 'underscore';
import {DataManager} from "../services/data-manager";
import {OsdItems, SrtGenerator} from "../services/srt-generator";

@Component({
  selector: 'otx-root',
  template: `
    <div class="row flex-container gx-0">
      <div class="col">
        <ngx-file-drop dropZoneLabel="Drop files here" (onFileDrop)="dropped($event)">
          <ng-template ngx-file-drop-content-tmp let-openFileSelector="openFileSelector">
            <ng-container *ngIf="data.hasData">{{data.openTxLogFileName}}</ng-container>
            <ng-container *ngIf="!data.hasData">Drop Open Tx log here</ng-container>
          </ng-template>
        </ngx-file-drop>
      </div>
    </div>
    <div class="row flex-container gx-0">
      <div class="col">
        <div class="list-group" *ngIf="!selectedLog">
          <a (click)="chooseLog(log)" href="#" class="list-group-item list-group-item-action" [class.active]="log.isSelected" aria-current="true"
             *ngFor="let log of data.originalOtxLogs">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">{{log.timestamp?.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)}}</h5>
              <small>Duration: {{log.duration?.toFormat("hh:mm:ss")}} Records: {{log.rows.length}}</small>
            </div>
<!--            <p class="mb-1"></p>-->
          </a>
        </div>
        <a *ngIf="selectedLog" (click)="clearSelectedLog()" href="#" class="list-group-item list-group-item-action active" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{selectedLog.timestamp?.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)}}</h5>
            <small>Duration: {{selectedLog.duration?.toFormat("hh:mm:ss")}} Records: {{selectedLog.rows.length}}</small>
          </div>
<!--          <p class="mb-1">Duration: {{selectedLog.duration?.toFormat("hh:mm:ss")}}</p>-->
<!--          <small>Records: {{selectedLog.rows.length}}</small>-->
        </a>
      </div>
    </div>

    <div *ngIf="selectedLog" class="flex-container flex-grow-1">
      <ul ngbNav #nav="ngbNav"  class="nav-tabs" >
        <li [ngbNavItem]="1">
          <a ngbNavLink>Export Results</a>
          <ng-template ngbNavContent>
            <div class="container">
              <div class="row">
                <div class="col">
                  <h3>Export subtitles file with OSD telemetry</h3>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="osdItems.gps">
                    <label class="form-check-label" for="flexCheckDefault">
                      GPS Coordinates
                    </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="osdItems.dist">
                    <label class="form-check-label" for="flexCheckDefault">
                      Distance to home and total trip
                    </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="osdItems.altitude">
                    <label class="form-check-label" for="flexCheckDefault">
                      Altitude
                    </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="osdItems.gpsSpeed">
                    <label class="form-check-label" for="flexCheckDefault">
                      Speed
                    </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="osdItems.rss1">
                    <label class="form-check-label" for="flexCheckDefault">
                      RSSI and LQ
                    </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="osdItems.dji">
                    <label class="form-check-label" for="flexCheckDefault">
                      DJI Latency and Bitrate (will not show if you did not add DJI SRT file)
                    </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="osdItems.battery">
                    <label class="form-check-label" for="flexCheckDefault">
                      Battery voltage and capacity used
                    </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="osdItems.power">
                    <label class="form-check-label" for="flexCheckDefault">
                      Power, current and efficiency in estimated Watt hours consumed per 1 km
                    </label>
                  </div>
                  <button class="btn btn-success" (click)="exportSrt()">Export SRT with OSD values</button>
                  <p>After export you can use ffmpeg to burn subtitles into your video</p>
                  <input class="form-control" type="text" readonly (click)="selectAll($event)" value="ffmpeg -i original_video.mp4 -vf subtitles=generated_subtitles.srt result_video.mp4">
                </div>
                <div class="col">
                  <h3>Export enriched log in CSV format</h3>
                  <p>Additional data is calculated in the output: Distance to Home, Total Trip Distance, Electrical Power, Electrical Efficiency in Watt hour per km</p>
                  <button class="btn btn-success" (click)="exportCsv(selectedLog)">Export CSV</button>
                </div>
              </div>
            </div>
          </ng-template>
        </li>
        <li [ngbNavItem]="2">
          <a ngbNavLink>Statistics</a>
          <ng-template ngbNavContent>
            <table class="table table-striped">
              <thead>
              <tr>
                <th>Metric</th>
                <th>Min</th>
                <th>Avg</th>
                <th>Max</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td>Speed, km/h</td>
                <td>{{stats?.speed?.min}}</td>
                <td>{{stats?.speed?.avg}}</td>
                <td>{{stats?.speed?.max}}</td>
              </tr>
              <tr>
                <td>Rx Battery, V</td>
                <td>{{stats?.rxBattery?.min}}</td>
                <td>{{stats?.rxBattery?.avg}}</td>
                <td>{{stats?.rxBattery?.max}}</td>
              </tr>
              <tr>
                <td>Current, A</td>
                <td>{{stats?.current?.min}}</td>
                <td>{{stats?.current?.avg}}</td>
                <td>{{stats?.current?.max}}</td>
              </tr>
              <tr>
                <td>Power, W</td>
                <td>{{stats?.power?.min}}</td>
                <td>{{stats?.power?.avg}}</td>
                <td>{{stats?.power?.max}}</td>
              </tr>
              <tr>
                <td>Efficiency, Wh/km <span class="badge bg-secondary" ngbTooltip="How many Watt hours are required to fly 1km at current rate">???</span></td>
                <td>{{stats?.wattPerKm?.min}}</td>
                <td>{{stats?.wattPerKm?.avg}}</td>
                <td>{{stats?.wattPerKm?.max}}</td>
              </tr>
              <tr>
                <td>Estimated range, km <span class="badge bg-secondary" ngbTooltip="Considering the total battery capacity used, how far we could fly with given efficiency">???</span></td>
                <td>{{stats?.estimatedRange?.min}}</td>
                <td>{{stats?.estimatedRange?.avg}}</td>
                <td>{{stats?.estimatedRange?.max}}</td>
              </tr>
              <tr>
                <td>Estimated flight time, m <span class="badge bg-secondary" ngbTooltip="Considering the total battery capacity used, how long can we fly with given power">???</span></td>
                <td>{{stats?.estimatedFlightTime?.min}}</td>
                <td>{{stats?.estimatedFlightTime?.avg}}</td>
                <td>{{stats?.estimatedFlightTime?.max}}</td>
              </tr>
              <tr>
                <td>1RSS(dB)</td>
                <td>{{stats?.rss1?.min}}</td>
                <td>{{stats?.rss1?.avg}}</td>
                <td>{{stats?.rss1?.max}}</td>
              </tr>
              <tr>
                <td>Altitude, m</td>
                <td>{{stats?.altitude?.min}}</td>
                <td>{{stats?.altitude?.avg}}</td>
                <td>{{stats?.altitude?.max}}</td>
              </tr>
              <tr>
                <td>Distance to Home, km</td>
                <td>{{stats?.distanceToHome?.min}}</td>
                <td>{{stats?.distanceToHome?.avg}}</td>
                <td>{{stats?.distanceToHome?.max}}</td>
              </tr>
              <tr>
                <td>Distance traveled, km</td>
                <td colspan="3">
                  <div class="text-center">{{stats?.distanceTraveled}}</div>
                </td>
              </tr>
              <tr>
                <td>Capacity used, mAh</td>
                <td colspan="3">
                  <div class="text-center">{{stats?.totalCapacity}}</div>
                </td>
              </tr>
              <tr>
                <td>Watt hours used</td>
                <td colspan="3">
                  <div class="text-center">{{stats?.totalWh}}</div>
                </td>
              </tr>
              </tbody>
            </table>
          </ng-template>
        </li>
        <li [ngbNavItem]="3">
          <a ngbNavLink>Rows</a>
          <ng-template ngbNavContent>
            <ag-grid-angular
              style="width: 100%; height: 100%;"
              class="ag-theme-alpine"
              [gridOptions]="gridOptions">
            </ag-grid-angular>
          </ng-template>
        </li>
        <li [ngbNavItem]="4">
          <a ngbNavLink>Charts</a>
          <ng-template ngbNavContent>
            Coming soon
<!--            <ngx-charts-line-chart-->
<!--              [view]="view"-->
<!--              [results]="results"-->
<!--              [legend]="true"-->
<!--              [showXAxisLabel]="true"-->
<!--              [showYAxisLabel]="true"-->
<!--              [xAxis]="true"-->
<!--              [yAxis]="true"-->
<!--              xAxisLabel="Index"-->
<!--              yAxisLabel=""-->
<!--            >-->
<!--            </ngx-charts-line-chart>-->
          </ng-template>
        </li>
      </ul>

      <div [ngbNavOutlet]="nav" class="mt-2 flex-container flex-grow-1"></div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {
  view: [number,number] = [700, 300];
  results = [
    {
      "name": "Germany",
      "series": [
        {
          "name": "1990",
          "value": 62000000
        },
        {
          "name": "2010",
          "value": 73000000
        },
        {
          "name": "2011",
          "value": 89400000
        }
      ]
    }];
  DateTime = DateTime;
  title = 'otx-ui';
  private api: GridApi|undefined;
  selectedLog?: ILog;
  gridOptions: GridOptions = {
    defaultColDef: {
      resizable: true
    },
    columnDefs: [
      { field: 'index'},
      { field: 'timecode'},
      { field: 'timestamp', valueFormatter: params => (params.value as DateTime).toLocaleString(DateTime.TIME_24_WITH_SECONDS)},
      { field: 'distanceTraveled' },
      { field: 'distanceToHome' },
      { field: 'rxBattery' },
      { field: 'capacity' },
      { field: 'current' },
      { field: 'power' },
      { field: 'wattPerKm', headerName: 'Watt per km' },
      { field: 'estimatedRange', headerName: 'Estimated range' },
      { field: 'estimatedFlightTime', headerName: 'Estimated time' },
      { field: 'txBattery' },
      { field: 'gpsSpeed'},
      { field: 'altitude'},
      { field: 'GPS'},
      { field: 'rss1' },
      { field: 'rss2' },
    ],
    rowData: [],
    onGridReady: e => {
      this.api = e.api;
      if (this.selectedLog) {
        this.api.setRowData(this.selectedLog.rows);
      }
    },
    onGridSizeChanged: e => e.api.sizeColumnsToFit()
  };
  stats?: Stats;
  osdItems: OsdItems = {
    gps: true,
    dist: true,
    altitude: true,
    gpsSpeed: true,
    rss1: true,
    dji: true,
    battery: true,
    power: true,
  };

  constructor(public data: DataManager, private srtGenerator: SrtGenerator) {
  }

  public dropped(files: NgxFileDropEntry[]) {
    if (files.length == 0 || !files[0].fileEntry.isFile) return;
    const file = files[0].fileEntry as FileSystemFileEntry;
    this.data.processLog(file);
  }

  chooseLog(log: ILog) {
    if (this.selectedLog)
      this.selectedLog.isSelected = false;
    this.selectedLog = log;
    log.isSelected = true;
    this.updateStatistics();
    return false;
  }

  clearSelectedLog() {
    if (this.selectedLog)
      this.selectedLog.isSelected = false;
    this.selectedLog = undefined;
    return false;
  }

  private updateStatistics() {
    const rows = this.selectedLog!.rows;
    const last = _.last(rows);
    this.stats = {
      speed: stat(rows.map(x => x.gpsSpeed!)),
      current: stat(rows.map(x => x.current!)),
      power: stat(rows.map(x => x.power!)),
      rxBattery: stat(rows.map(x => x.rxBattery!)),
      wattPerKm: stat(rows.map(x => x.wattPerKm!)),
      estimatedRange: stat(rows.map(x => x.estimatedRange!)),
      estimatedFlightTime: stat(rows.map(x => x.estimatedFlightTime!)),
      altitude: stat(rows.map(x => x.altitude!)),
      rss1: stat(rows.map(x => x.rss1!)),
      distanceToHome: stat(rows.map(x => x.distanceToHome!)),
      distanceTraveled: last?.distanceTraveled ?? 0,
      totalCapacity: (last?.totalCapacity ?? 0) * 1000,
      totalWh: last?.totalWh ?? 0,
    };
  }

  exportCsv(selectedLog: ILog) {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(new Blob([this.data.otxParser.exportToCsv(selectedLog)]));
    a.href = objectUrl;
    a.download = `${this.data.openTxLogFileName.substring(0, this.data.openTxLogFileName.length-4)}-enriched.csv`;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  exportSrt() {
    console.log(this.osdItems);
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(new Blob([this.srtGenerator.exportSrt(this.selectedLog!, this.osdItems)]));
    a.href = objectUrl;
    a.download = `${this.data.openTxLogFileName.substring(0, this.data.openTxLogFileName.length-4)}.srt`;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  selectAll(ev:any) {
    ev.target.select();
  }
}

interface Stats {
  speed: StatTriple;
  current: StatTriple;
  power: StatTriple;
  rxBattery: StatTriple;
  wattPerKm: StatTriple;
  estimatedRange: StatTriple;
  estimatedFlightTime: StatTriple;
  altitude: StatTriple;
  rss1: StatTriple;
  distanceToHome: StatTriple;
  distanceTraveled: number;
  totalCapacity: number;
  totalWh: number;
}

interface StatTriple {
  min: number;
  avg: number;
  max: number;
}

function stat(items:number[]): StatTriple {
  return {
    min: Math.min(...items),
    avg: Math.round(items.reduce((prev, current) => prev + current)/items.length * 10)/10,
    max: Math.max(...items)
  };
}
