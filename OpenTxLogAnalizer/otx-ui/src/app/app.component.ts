import { Component } from '@angular/core';
import {GridApi, GridOptions} from "ag-grid-community";
import {NgxFileDropEntry} from "ngx-file-drop";
import {ILog} from "../services/open-tx-log-parser";
import {DateTime} from "luxon";
import {DataManager} from "../services/data-manager";
import {OsdItems, SrtGenerator} from "../services/srt-generator";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'otx-root',
  template: `
    <ng-template #usageInfo let-modal>
      <div class="modal-header">
        <h4 class="modal-title" id="modal-basic-title">How to use</h4>
        <button type="button" class="close btn btn-danger btn-sm" aria-label="Close" (click)="modal.dismiss('Cross click')">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <h3>Overview</h3>
        <p>This tool is intended to help analyze your telemetry logs and optionally overlay the log values over DVR video</p>
        <p>It processes OpenTX telemetry logs recorded in your TX and can join DJI SRT logs recorded by your goggles, so you have both flight controller telemetry values and DJI latency and bitrate values in one log</p>
        <p>Here is the list of values calculated/processed for each row:</p>
        <ul>
          <li>Distance from home</li>
          <li>Total trip distance</li>
          <li>Total trip distance</li>
          <li>Electrical power</li>
          <li>Pitch, Roll, Yaw converted to degrees from radians</li>
          <li>Stick positions (ail, ele, thr, rud) are converted to percent. E.g. 0% - 100% throttle</li>
          <li>GPS coordinates are split into separate Lat, Lon fields</li>
          <li>Efficiency as Watt hour per kilometer of flight. How many Watt hours of power would be consumed to fly 1 km with current speed and power</li>
          <li>Total used Watt hours is calculated as mAh from last row and number of cells from first row</li>
          <li>Total WH is used to calculate estimated range at current efficiency and estimated flight time at current power for each line. So you can chart speed vs estimated range and get a clue what is the optimal cruise speed</li>
        </ul>
        <p>Also overall statistics are calculated as min, avg, max: Speed, Current, Power, Rx Battery Voltage, Wh per km, Estimated Range, Estimated Time, Altitude, RSSI, LQ, DJI Latency, DJI Bitrate, Distance to Home</p>
        <h3>Usage</h3>
        <ul>
            <li>Drag and drop your OpenTx telemetry log CSV. It will be parsed locally, without uploading</li>
            <li>Select the flight you want. Now if you have corresponding DJI SRT file you can drag on the selected log to join it's data</li>
            <li>You can check what data is loaded on the Rows tab, check statistics on Statistics tab</li>
            <li>If you are satisfied with loaded data, you can export it as CSV or SRT. In case of SRT you can choose which field will be present</li>
            <li>Put downloaded SRT file next to video and name it the same as video, open video and you should see your values overlayed</li>
        </ul>
      </div>
    </ng-template>
    <div class="row gx-0">
      <div class="col">
        <ngx-file-drop dropZoneLabel="Drop files here" (onFileDrop)="openOtxLog($event)">
          <ng-template ngx-file-drop-content-tmp let-openFileSelector="openFileSelector">
            <ng-container *ngIf="data.hasData">{{data.openTxLogFileName}}</ng-container>
            <ng-container *ngIf="!data.hasData">Drop Open Tx log here</ng-container>
          </ng-template>
        </ngx-file-drop>
      </div>
      <div class="col-auto p-3">
        <button class="btn btn-danger" (click)="showUsage(usageInfo)">How to use?</button>
      </div>
    </div>
    <div class="row flex-container gx-0">
      <div class="col">
        <div class="list-group" *ngIf="!selectedLog">
          <a (click)="chooseLog(log)" href="#" class="list-group-item list-group-item-action"
             [class.active]="log.isSelected" aria-current="true"
             *ngFor="let log of data.originalOtxLogs">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">{{log.timestamp?.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)}}</h5>
              <small>Duration: {{log.duration?.toFormat("hh:mm:ss")}} Records: {{log.rows.length}}</small>
            </div>
            <!--            <p class="mb-1"></p>-->
          </a>
        </div>
        <a *ngIf="selectedLog" (click)="clearSelectedLog()" href="#"
           class="list-group-item list-group-item-action active" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{selectedLog.timestamp?.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)}}</h5>
            <ngx-file-drop dropZoneLabel="Drop files here" (onFileDrop)="addSrtLog(selectedLog, $event)"
                           dropZoneClassName="drop-zone-white" contentClassName="drop-content-white" style="min-width:200px;">
              <ng-template ngx-file-drop-content-tmp let-openFileSelector="openFileSelector">
                <ng-container>Drop DJI SRT here</ng-container>
              </ng-template>
            </ngx-file-drop>
            <small>Duration: {{selectedLog.duration?.toFormat("hh:mm:ss")}} Records: {{selectedLog.rows.length}}</small>
          </div>
          <!--          <p class="mb-1">Duration: {{selectedLog.duration?.toFormat("hh:mm:ss")}}</p>-->
          <!--          <small>Records: {{selectedLog.rows.length}}</small>-->
        </a>
      </div>
    </div>

    <div *ngIf="selectedLog" class="flex-container flex-grow-1">
      <ul ngbNav #nav="ngbNav" class="nav-tabs">
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
                  <input class="form-control" type="text" readonly (click)="selectAll($event)"
                         value="ffmpeg -i original_video.mp4 -vf subtitles=generated_subtitles.srt result_video.mp4">
                </div>
                <div class="col">
                  <h3>Export enriched log in CSV format</h3>
                  <p>Additional data is calculated in the output: Distance to Home, Total Trip Distance, Electrical
                    Power, Electrical Efficiency in Watt hour per km</p>
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
                <td>{{selectedLog?.stats?.speed?.min}}</td>
                <td>{{selectedLog?.stats?.speed?.avg}}</td>
                <td>{{selectedLog?.stats?.speed?.max}}</td>
              </tr>
              <tr>
                <td>Rx Battery, V</td>
                <td>{{selectedLog?.stats?.rxBattery?.min}}</td>
                <td>{{selectedLog?.stats?.rxBattery?.avg}}</td>
                <td>{{selectedLog?.stats?.rxBattery?.max}}</td>
              </tr>
              <tr>
                <td>Current, A</td>
                <td>{{selectedLog?.stats?.current?.min}}</td>
                <td>{{selectedLog?.stats?.current?.avg}}</td>
                <td>{{selectedLog?.stats?.current?.max}}</td>
              </tr>
              <tr>
                <td>Power, W</td>
                <td>{{selectedLog?.stats?.power?.min}}</td>
                <td>{{selectedLog?.stats?.power?.avg}}</td>
                <td>{{selectedLog?.stats?.power?.max}}</td>
              </tr>
              <tr>
                <td>Efficiency, Wh/km <span class="badge bg-secondary"
                                            ngbTooltip="How many Watt hours are required to fly 1km at current rate">???</span>
                </td>
                <td>{{selectedLog?.stats?.wattPerKm?.min}}</td>
                <td>{{selectedLog?.stats?.wattPerKm?.avg}}</td>
                <td>{{selectedLog?.stats?.wattPerKm?.max}}</td>
              </tr>
              <tr>
                <td>Estimated range, km <span class="badge bg-secondary"
                                              ngbTooltip="Considering the total battery capacity used, how far we could fly with given efficiency">???</span>
                </td>
                <td>{{selectedLog?.stats?.estimatedRange?.min}}</td>
                <td>{{selectedLog?.stats?.estimatedRange?.avg}}</td>
                <td>{{selectedLog?.stats?.estimatedRange?.max}}</td>
              </tr>
              <tr>
                <td>Estimated flight time, m <span class="badge bg-secondary"
                                                   ngbTooltip="Considering the total battery capacity used, how long can we fly with given power">???</span>
                </td>
                <td>{{selectedLog?.stats?.estimatedFlightTime?.min}}</td>
                <td>{{selectedLog?.stats?.estimatedFlightTime?.avg}}</td>
                <td>{{selectedLog?.stats?.estimatedFlightTime?.max}}</td>
              </tr>
              <tr>
                <td>1RSS(dB)</td>
                <td>{{selectedLog?.stats?.rss1?.min}}</td>
                <td>{{selectedLog?.stats?.rss1?.avg}}</td>
                <td>{{selectedLog?.stats?.rss1?.max}}</td>
              </tr>
              <tr>
                <td>RQLY</td>
                <td>{{selectedLog?.stats?.rqly?.min}}</td>
                <td>{{selectedLog?.stats?.rqly?.avg}}</td>
                <td>{{selectedLog?.stats?.rqly?.max}}</td>
              </tr>
              <tr>
                <td>DJI Latency ms</td>
                <td>{{selectedLog?.stats?.djiDelay?.min}}</td>
                <td>{{selectedLog?.stats?.djiDelay?.avg}}</td>
                <td>{{selectedLog?.stats?.djiDelay?.max}}</td>
              </tr>
              <tr>
                <td>DJI Bitrate MBits</td>
                <td>{{selectedLog?.stats?.djiBitrate?.min}}</td>
                <td>{{selectedLog?.stats?.djiBitrate?.avg}}</td>
                <td>{{selectedLog?.stats?.djiBitrate?.max}}</td>
              </tr>
              <tr>
                <td>Altitude, m</td>
                <td>{{selectedLog?.stats?.altitude?.min}}</td>
                <td>{{selectedLog?.stats?.altitude?.avg}}</td>
                <td>{{selectedLog?.stats?.altitude?.max}}</td>
              </tr>
              <tr>
                <td>Distance to Home, km</td>
                <td>{{selectedLog?.stats?.distanceToHome?.min}}</td>
                <td>{{selectedLog?.stats?.distanceToHome?.avg}}</td>
                <td>{{selectedLog?.stats?.distanceToHome?.max}}</td>
              </tr>
              <tr>
                <td>Distance traveled, km</td>
                <td colspan="3">
                  <div class="text-center">{{selectedLog?.stats?.distanceTraveled}}</div>
                </td>
              </tr>
              <tr>
                <td>Capacity used, mAh</td>
                <td colspan="3">
                  <div class="text-center">{{selectedLog?.stats?.totalCapacity}}</div>
                </td>
              </tr>
              <tr>
                <td>Watt hours used</td>
                <td colspan="3">
                  <div class="text-center">{{selectedLog?.stats?.totalWh}}</div>
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
  view: [number, number] = [700, 300];
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
  private api: GridApi | undefined;
  selectedLog?: ILog;
  gridOptions: GridOptions = {
    defaultColDef: {
      resizable: true
    },
    columnDefs: [
      {field: 'index'},
      {field: 'timecode'},
      {
        field: 'timestamp',
        valueFormatter: params => (params.value as DateTime).toLocaleString(DateTime.TIME_24_WITH_SECONDS)
      },
      {field: 'distanceTraveled'},
      {field: 'distanceToHome'},
      {field: 'rxBattery'},
      {field: 'capacity'},
      {field: 'current'},
      {field: 'power'},
      {field: 'wattPerKm', headerName: 'Watt per km'},
      {field: 'estimatedRange', headerName: 'Estimated range'},
      {field: 'estimatedFlightTime', headerName: 'Estimated time'},
      {field: 'txBattery'},
      {field: 'gpsSpeed'},
      {field: 'altitude'},
      {field: 'GPS'},
      {field: 'rss1'},
      {field: 'rss2'},
      {field: 'djiDelay'},
      {field: 'djiBitrate'},
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

  constructor(public data: DataManager, private srtGenerator: SrtGenerator, private modalService: NgbModal) {
  }

  public openOtxLog(files: NgxFileDropEntry[]) {
    if (files.length == 0 || !files[0].fileEntry.isFile) return;
    this.clearSelectedLog();
    const file = files[0].fileEntry as FileSystemFileEntry;
    this.data.loadOpenTxLog(file);
  }

  public addSrtLog(otxLog: ILog, files: NgxFileDropEntry[]) {
    if (files.length == 0 || !files[0].fileEntry.isFile) return;
    const file = files[0].fileEntry as FileSystemFileEntry;
    this.data.attachDjiSrtLog(this.selectedLog!, file);
  }

  chooseLog(log: ILog) {
    if (this.selectedLog)
      this.selectedLog.isSelected = false;
    this.selectedLog = log;
    log.isSelected = true;
    return false;
  }

  clearSelectedLog() {
    if (this.selectedLog)
      this.selectedLog.isSelected = false;
    this.selectedLog = undefined;
    return false;
  }

  exportCsv(selectedLog: ILog) {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(new Blob([this.data.otxParser.exportToCsv(selectedLog)]));
    a.href = objectUrl;
    a.download = `${this.data.openTxLogFileName.substring(0, this.data.openTxLogFileName.length - 4)}-enriched.csv`;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  exportSrt() {
    console.log(this.osdItems);
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(new Blob([this.srtGenerator.exportSrt(this.selectedLog!, this.osdItems)]));
    a.href = objectUrl;
    a.download = `${this.data.openTxLogFileName.substring(0, this.data.openTxLogFileName.length - 4)}.srt`;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  selectAll(ev: any) {
    ev.target.select();
  }

  showUsage(usageInfo:any) {
    this.modalService.open(usageInfo, {ariaLabelledBy: 'modal-basic-title'});
  }
}
