import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { DateTime } from 'luxon';
import {NgxFileDropEntry} from "ngx-file-drop";
import {DataManager} from "../../services/data-manager";

@Component({
  selector: 'otx-log-chooser-view',
  template: `
    <div class="list-group" *ngIf="data.selectedOtxIndex < 0">
      <a (click)="chooseLog(i)" href="#" class="list-group-item list-group-item-action" aria-current="true"
         *ngFor="let log of data.otxLogs; index as i">
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1">{{log.timestamp?.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)}}</h5>
          <small>Duration: {{log.duration?.toFormat("hh:mm:ss")}} Records: {{log.rows.length}}</small>
        </div>
      </a>
    </div>
    <a *ngIf="data.selectedOtxIndex >= 0" (click)="clearSelectedLog()" href="#"
       class="list-group-item list-group-item-action active" aria-current="true">
      <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-1">{{data.selectedLog?.timestamp?.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)}}</h5>
        <ngx-file-drop dropZoneLabel="Drop files here" (onFileDrop)="addSrtLog($event)"
                       dropZoneClassName="drop-zone-white" contentClassName="drop-content-white" style="min-width:200px;">
          <ng-template ngx-file-drop-content-tmp let-openFileSelector="openFileSelector">
            <ng-container *ngIf="data.currentLogProject?.srt?.name">{{data.currentLogProject?.srt?.name}}</ng-container>
            <ng-container *ngIf="!data.currentLogProject?.srt?.name">DROP DJI SRT here</ng-container>
          </ng-template>
        </ngx-file-drop>
        <small>Duration: {{data.selectedLog?.duration?.toFormat("hh:mm:ss")}} Records: {{data.selectedLog?.rows?.length}}</small>
      </div>
    </a>
  `,
  styles: [
  ]
})
export class LogChooserViewComponent implements OnInit {
  DateTime = DateTime;

  @Output() srtLogDropped = new EventEmitter<FileSystemFileEntry>();


  constructor(public data: DataManager) { }

  ngOnInit(): void {
  }

  chooseLog(logIndex: number) {
    this.data.updateSelectedLog(logIndex);
    return false;
  }

  clearSelectedLog() {
    this.data.updateSelectedLog(-1);
    return false;
  }

  addSrtLog(files: NgxFileDropEntry[]) {
    if (files.length == 0 || !files[0].fileEntry.isFile) return;
    const file = files[0].fileEntry as FileSystemFileEntry;
    this.data.attachDjiSrtLog(file);
  }
}
