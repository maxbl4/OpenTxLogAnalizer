import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {GridApi, GridOptions} from "ag-grid-community";
import {NgxFileDropEntry} from "ngx-file-drop";
import {ILog} from "../services/open-tx-log-parser";
import {DateTime} from "luxon";
import {DataManager} from "../services/data-manager";
import {PersistenceService} from "../services/persistence.service";

@Component({
  selector: 'otx-root',
  template: `
    <div class="alert alert-danger alert-dismissible" role="alert" *ngIf="!persistence.howToRecordLogsDismissed">
      How to record your logs?
      <a href="https://oscarliang.com/log-gps-coordinates-taranis/" target="_blank" class="alert-link">Click here</a>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" (click)="persistence.howToRecordLogsDismissed = true"></button>
    </div>
    <!-- Usage -->
    <otx-usage-text-view #usageInfo></otx-usage-text-view>
    <div *ngIf="data.operation" class="modal fade show modal-dialog-centered">
      <div class="modal-dialog w-100">
        <div class="modal-content">
          <div class="modal-body">
            <ngb-progressbar type="success" [value]="data.progress??0" [max]="100" [striped]="true">{{data.operation}}</ngb-progressbar>
          </div>
        </div>
      </div>
    </div>
    <!-- Drop zone -->
    <div class="row gx-0">
      <div class="col align-self-center">
        <ngx-file-drop dropZoneLabel="Drop files here" (onFileDrop)="openOtxLog($event)">
          <ng-template ngx-file-drop-content-tmp let-openFileSelector="openFileSelector">
            <ng-container *ngIf="data.currentLogProject?.otx?.name">{{data.currentLogProject?.otx?.name}}</ng-container>
            <ng-container *ngIf="!data.currentLogProject?.otx?.name">Drop Open Tx log here</ng-container>
          </ng-template>
        </ngx-file-drop>
      </div>
      <div class="col" *ngIf="data.selectedLog">
        <ngx-file-drop dropZoneLabel="Drop files here" (onFileDrop)="addSrtLog($event)">
          <ng-template ngx-file-drop-content-tmp let-openFileSelector="openFileSelector">
            <ng-container *ngIf="data.currentLogProject?.srt?.name">{{data.currentLogProject?.srt?.name}}</ng-container>
            <ng-container *ngIf="!data.currentLogProject?.srt?.name">DROP DJI SRT here</ng-container>
          </ng-template>
        </ngx-file-drop>
      </div>
      <div class="col-auto align-self-center text-center">
          <button class="btn btn-danger m-1" (click)="usageInfo.show()">How to use?</button><br/>
          <button class="btn btn-primary m-1" (click)="data.loadDemoProject()">DEMO</button>
      </div>
    </div>

    <div class="row flex-container gx-0">
      <div class="col">
        <otx-log-chooser-view></otx-log-chooser-view>
      </div>
    </div>

    <div *ngIf="data.selectedLog" class="flex-container flex-grow-1">
      <ul ngbNav #nav="ngbNav" class="nav-tabs" [(activeId)]="selectedTabPane"
          (activeIdChange)="persistence.selectedTabPane = $event">
        <li [ngbNavItem]="1">
          <a ngbNavLink>Export Results</a>
          <ng-template ngbNavContent>
            <div class="container">
              <div class="row">
                <div class="col">
                  <otx-srt-export-view></otx-srt-export-view>
                </div>
                <div class="col">
                  <h3>Export enriched log in CSV format</h3>
                  <p>Additional data is calculated in the output: Distance to Home, Total Trip Distance, Electrical
                    Power, Electrical Efficiency in Watt hour per km</p>
                  <button class="btn btn-success" (click)="exportCsv(data.selectedLog)">Export CSV</button>
                </div>
              </div>
            </div>
          </ng-template>
        </li>
        <li [ngbNavItem]="2">
          <a ngbNavLink>Statistics</a>
          <ng-template ngbNavContent>
            <otx-statistics-view></otx-statistics-view>
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
        <li [ngbNavItem]="5">
          <a ngbNavLink>Map</a>
          <ng-template ngbNavContent>
            <otx-map-view></otx-map-view>
          </ng-template>
        </li>
      </ul>

      <div #tabPane [ngbNavOutlet]="nav" class="mt-2 flex-container flex-grow-1"></div>
    </div>
    <div *ngIf="data.operation" class="modal-backdrop show fade"></div>
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
export class AppComponent implements OnInit {
  @ViewChild('tabPane', {read: ElementRef})
  tabPane?: ElementRef;
  private api: GridApi | undefined;
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
      if (this.data.selectedLog) {
        this.api.setRowData(this.data.selectedLog.rows);
      }
    },
    onGridSizeChanged: e => e.api.sizeColumnsToFit()
  };
  selectedTabPane: number = 1;

  constructor(public data: DataManager, public persistence: PersistenceService) {
    this.selectedTabPane = persistence.selectedTabPane ?? 1;
    data.initWorker(new Worker(new URL('./app.worker', import.meta.url)));
  }

  ngOnInit(): void {
  }

  openOtxLog(files: NgxFileDropEntry[]) {
    if (files.length == 0 || !files[0].fileEntry.isFile) return;
    const file = files[0].fileEntry as FileSystemFileEntry;
    this.data.replaceCurrentLogProject(file);
  }

  addSrtLog(files: NgxFileDropEntry[]) {
    if (files.length == 0 || !files[0].fileEntry.isFile) return;
    const file = files[0].fileEntry as FileSystemFileEntry;
    this.data.attachDjiSrtLog(file);
  }

  exportCsv(selectedLog: ILog) {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(new Blob([this.data.otxParser.exportToCsv(selectedLog)]));
    a.href = objectUrl;
    a.download = `${this.data.currentLogProject?.otx.name.substring(0, this.data.currentLogProject?.otx.name.length - 4)}-enriched.csv`;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }
}
