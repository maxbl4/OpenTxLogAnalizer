import {Component, ViewChild} from '@angular/core';
import {GridApi, GridOptions} from "ag-grid-community";
import {NgxFileDropEntry} from "ngx-file-drop";
import {ILog} from "../services/open-tx-log-parser";
import {DateTime} from "luxon";
import {DataManager} from "../services/data-manager";
import {SrtGenerator} from "../services/srt-generator";
import {LogChooserViewComponent} from "./log-chooser-view/log-chooser-view.component";

@Component({
  selector: 'otx-root',
  template: `
    <!-- Usage -->
    <otx-usage-text-view #usageInfo></otx-usage-text-view>
    <!-- Drop zone -->
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
        <button class="btn btn-danger" (click)="usageInfo.show()">How to use?</button>
      </div>
    </div>

    <div class="row flex-container gx-0">
      <div class="col">
        <otx-log-chooser-view #logChooser [(selectedLog)]="selectedLog" [logs]="data.originalOtxLogs" (srtLogDropped)="addSrtLog($event)"></otx-log-chooser-view>
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
                  <otx-srt-export-view [selectedLog]="selectedLog" [logFileName]="data.openTxLogFileName"></otx-srt-export-view>
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
            <otx-statistics-view [selectedLog]="selectedLog"></otx-statistics-view>
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
            <otx-charts-view></otx-charts-view>
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
  @ViewChild('logChooser')
  logChooser?: LogChooserViewComponent;
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

  constructor(public data: DataManager, private srtGenerator: SrtGenerator) {
  }

  public openOtxLog(files: NgxFileDropEntry[]) {
    if (files.length == 0 || !files[0].fileEntry.isFile) return;
    this.selectedLog = undefined;
    const file = files[0].fileEntry as FileSystemFileEntry;
    this.data.loadOpenTxLog(file);
  }

  public addSrtLog(file: FileSystemFileEntry) {
    this.data.attachDjiSrtLog(this.selectedLog!, file);
  }

  exportCsv(selectedLog: ILog) {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(new Blob([this.data.otxParser.exportToCsv(selectedLog)]));
    a.href = objectUrl;
    a.download = `${this.data.openTxLogFileName.substring(0, this.data.openTxLogFileName.length - 4)}-enriched.csv`;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }
}
