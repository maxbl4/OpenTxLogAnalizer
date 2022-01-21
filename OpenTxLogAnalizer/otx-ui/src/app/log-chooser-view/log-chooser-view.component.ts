import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { DateTime } from 'luxon';
import {ILog} from "../../services/open-tx-log-parser";
import {NgxFileDropEntry} from "ngx-file-drop";

@Component({
  selector: 'otx-log-chooser-view',
  template: `
    <div class="list-group" *ngIf="!selectedLog">
      <a (click)="chooseLog(log)" href="#" class="list-group-item list-group-item-action"
         [class.active]="log.isSelected" aria-current="true"
         *ngFor="let log of logs">
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
  `,
  styles: [
  ]
})
export class LogChooserViewComponent implements OnInit {
  DateTime = DateTime;
  private _logs?: ILog[];
  @Input()
  get logs() {
    return this._logs;
  }
  set logs(v) {
    this.clearSelectedLog();
    this._logs = v;
    if (v && v.length === 1)
      this.chooseLog(v[0]);
  }

  private _selectedLog?: ILog;
  @Input()
  get selectedLog() {
    return this._selectedLog;
  }
  set selectedLog(v: ILog|undefined) {
    this._selectedLog = v;
    if (v) this.chooseLog(v);
  }
  @Output() selectedLogChange = new EventEmitter<ILog|undefined>();

  @Output() srtLogDropped = new EventEmitter<FileSystemFileEntry>();


  constructor() { }

  ngOnInit(): void {
  }

  chooseLog(log: ILog) {
    if (this._selectedLog)
      this._selectedLog.isSelected = false;
    this._selectedLog = log;
    log.isSelected = true;
    this.selectedLogChange.next(log);
    return false;
  }

  clearSelectedLog() {
    if (this._selectedLog)
      this._selectedLog.isSelected = false;
    this._selectedLog = undefined;
    this.selectedLogChange.next(undefined);
    return false;
  }

  addSrtLog(selectedLog: ILog, files: NgxFileDropEntry[]) {
    if (files.length == 0 || !files[0].fileEntry.isFile) return;
    const file = files[0].fileEntry as FileSystemFileEntry;
    this.srtLogDropped.next(file);
  }
}
