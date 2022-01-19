import { Component } from '@angular/core';
import {GridApi, GridOptions} from "ag-grid-community";
import {NgxFileDropEntry} from "ngx-file-drop";
import {ILog, OpenTxLogParser} from "../services/open-tx-log-parser";
import {DateTime} from "luxon";
import * as _ from 'underscore';

@Component({
  selector: 'otx-root',
  template: `
    <div class="row">
      <div class="col">
        <ngx-file-drop dropZoneLabel="Drop files here" (onFileDrop)="dropped($event)"
                       (onFileOver)="fileOver($event)" (onFileLeave)="fileLeave($event)">
          <ng-template ngx-file-drop-content-tmp let-openFileSelector="openFileSelector">
            <ng-container *ngIf="openTxLogFileName != ''">{{openTxLogFileName}}</ng-container>
            <ng-container *ngIf="openTxLogFileName == ''">Drop Open Tx log here</ng-container>
          </ng-template>
        </ngx-file-drop>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <div class="list-group" *ngIf="!selectedLog">
          <a (click)="chooseLog(log)" href="#" class="list-group-item list-group-item-action" [class.active]="log.isSelected" aria-current="true"
             *ngFor="let log of logs">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">{{log.timestamp?.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)}}</h5>
              <small>Duration: {{log.duration?.toFormat("hh:mm:ss")}} Records: {{log.rows.length}}</small>
              <button class="btn btn-success" (click)="exportCsv(log)">Export CSV</button>
            </div>
<!--            <p class="mb-1"></p>-->
          </a>
        </div>
        <a *ngIf="selectedLog" (click)="clearSelectedLog()" href="#" class="list-group-item list-group-item-action active" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{selectedLog.timestamp?.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)}}</h5>
            <small>Duration: {{selectedLog.duration?.toFormat("hh:mm:ss")}} Records: {{selectedLog.rows.length}}</small>
            <button class="btn btn-success" (click)="exportCsv(selectedLog)">Export CSV</button>
          </div>
<!--          <p class="mb-1">Duration: {{selectedLog.duration?.toFormat("hh:mm:ss")}}</p>-->
<!--          <small>Records: {{selectedLog.rows.length}}</small>-->
        </a>
      </div>
    </div>

    <div *ngIf="selectedLog">
      <ul ngbNav #nav="ngbNav"  class="nav-tabs" >
        <li [ngbNavItem]="1">
          <a ngbNavLink>Rows</a>
          <ng-template ngbNavContent>
            <ag-grid-angular
              style="width: 100%; height: 500px;"
              class="ag-theme-alpine"
              [gridOptions]="gridOptions">
            </ag-grid-angular>
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
                  <td>Efficiency, Wh/km</td>
                  <td>{{stats?.wattPerKm?.min}}</td>
                  <td>{{stats?.wattPerKm?.avg}}</td>
                  <td>{{stats?.wattPerKm?.max}}</td>
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
              </tbody>
            </table>
          </ng-template>
        </li>
        <li [ngbNavItem]="3">
          <a ngbNavLink>Charts</a>
          <ng-template ngbNavContent>
            Some charts will be here
          </ng-template>
        </li>
      </ul>

      <div [ngbNavOutlet]="nav" class="mt-2"></div>
    </div>
  `,
  styles: []
})
export class AppComponent {
  DateTime = DateTime;
  title = 'otx-ui';
  openTxLogFileName: string = '';
  private api: GridApi|undefined;
  logs: ILog[] = [];
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
      { field: 'current' },
      { field: 'power' },
      { field: 'wattPerKm', headerName: 'Watt per km' },
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

  constructor(private otxParser: OpenTxLogParser) {
  }

  public dropped(files: NgxFileDropEntry[]) {
    if (files.length == 0 || !files[0].fileEntry.isFile) return;
    const file = files[0].fileEntry as FileSystemFileEntry;
    this.openTxLogFileName = file.name;
    file.file(async (f: File) => {
      const text = await f.text();
      this.logs = this.otxParser.parse(text);
    });
  }

  public fileOver(event:any){
    console.log(event);
  }

  public fileLeave(event:any){
    console.log(event);
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
    this.stats = {
      speed: stat(rows.map(x => x.gpsSpeed!)),
      current: stat(rows.map(x => x.current!)),
      power: stat(rows.map(x => x.power!)),
      rxBattery: stat(rows.map(x => x.rxBattery!)),
      wattPerKm: stat(rows.map(x => x.wattPerKm!)),
      altitude: stat(rows.map(x => x.altitude!)),
      distanceToHome: stat(rows.map(x => x.distanceToHome!)),
      distanceTraveled: _.last(rows)?.distanceTraveled ?? 0
    };
  }

  exportCsv(selectedLog: ILog) {
    const a = document.createElement('a')
    const objectUrl = URL.createObjectURL(new Blob([this.otxParser.exportToCsv(selectedLog)]));
    a.href = objectUrl
    a.download = `${this.openTxLogFileName.substring(0, this.openTxLogFileName.length-4)}-enriched.csv`;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }
}

interface Stats {
  speed: StatTriple;
  current: StatTriple;
  power: StatTriple;
  rxBattery: StatTriple;
  wattPerKm: StatTriple;
  altitude: StatTriple;
  distanceToHome: StatTriple;
  distanceTraveled: number;
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
