import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {GridApi, GridOptions} from "ag-grid-community";
import {NgxFileDropEntry} from "ngx-file-drop";
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
    <!-- Drop zone -->
    <div class="row gx-0">
      <div class="col align-self-center">
        <ngx-file-drop dropZoneLabel="Drop files here" (onFileDrop)="openOtxLog($event)">
          <ng-template ngx-file-drop-content-tmp let-openFileSelector="openFileSelector">
            <ng-container *ngIf="data.currentLogProject?.otx?.name">{{data.currentLogProject?.otx?.name}}</ng-container>
            <ng-container *ngIf="!data.currentLogProject?.otx?.name">Drop Open Tx log here or</ng-container>
            <button class="btn btn-sm btn-outline-primary ms-2" type="button" (click)="openFileSelector()">Browse</button>
          </ng-template>
        </ngx-file-drop>
      </div>
      <div class="col" *ngIf="data.selectedLog">
        <ngx-file-drop dropZoneLabel="Drop files here" (onFileDrop)="addSrtLog($event)">
          <ng-template ngx-file-drop-content-tmp let-openFileSelector="openFileSelector">
            <ng-container *ngIf="data.currentLogProject?.srt?.name">{{data.currentLogProject?.srt?.name}}</ng-container>
            <ng-container *ngIf="!data.currentLogProject?.srt?.name">Drop DJI SRT here or</ng-container>
            <button class="btn btn-sm btn-outline-primary ms-2" type="button" (click)="openFileSelector()">Browse</button>
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
            <otx-srt-export-view></otx-srt-export-view>
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
export class AppComponent implements OnInit{
  @ViewChild('tabPane', { read: ElementRef })
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
}
