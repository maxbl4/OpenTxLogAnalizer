import { Component } from '@angular/core';
import {ColDef, GridApi, GridOptions} from "ag-grid-community";
import {NgxFileDropEntry} from "ngx-file-drop";
import {OpenTxLogParser} from "../services/open-tx-log-parser";
import {DateTime} from "luxon";

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
<!--            <button class="btn btn-primary" type="button" (click)="openFileSelector()">Browse Files</button>-->
          </ng-template>
        </ngx-file-drop>
      </div>
      <div class="col">
        <ngx-file-drop dropZoneLabel="Drop files here" (onFileDrop)="dropped($event)"
                       (onFileOver)="fileOver($event)" (onFileLeave)="fileLeave($event)">
          <ng-template ngx-file-drop-content-tmp let-openFileSelector="openFileSelector">
            Drop DJI SRT file here
            <!--            <button class="btn btn-primary" type="button" (click)="openFileSelector()">Browse Files</button>-->
          </ng-template>
        </ngx-file-drop>
      </div>
    </div>

    <ag-grid-angular
      style="width: 100%; height: 500px;"
      class="ag-theme-alpine"
      [gridOptions]="gridOptions"
    >
    </ag-grid-angular>
  `,
  styles: []
})
export class AppComponent {
  title = 'otx-ui';
  openTxLogFileName: string = '';
  private api: GridApi|undefined;
  gridOptions: GridOptions = {
    columnDefs: [
      { field: 'timecode'},
      { field: 'timestamp', valueFormatter: params => (params.value as DateTime).toLocaleString(DateTime.TIME_24_WITH_SECONDS)},
      { field: 'distanceTraveled' },
      { field: 'distanceToHome' },
      { field: 'rxBattery' },
      { field: 'txBattery' },
      { field: 'rss1' },
      { field: 'rss2' },
      { field: 'GPS'},
      { field: 'altitude'}
    ],
    rowData: [],
    onGridReady: e => {
      this.api = e.api;
    },
    onGridSizeChanged: e => e.api.sizeColumnsToFit()
  };

  constructor(private otxParser: OpenTxLogParser) {
  }


  public dropped(files: NgxFileDropEntry[]) {
    if (files.length == 0 || !files[0].fileEntry.isFile) return;
    const file = files[0].fileEntry as FileSystemFileEntry;
    this.openTxLogFileName = file.name;
    file.file(async (f: File) => {
      const text = await f.text();
      const logs = this.otxParser.parse(text);
      console.log(logs);
      this.api?.setRowData(logs[0].rows);
    });
  }

  public fileOver(event:any){
    console.log(event);
  }

  public fileLeave(event:any){
    console.log(event);
  }
}
