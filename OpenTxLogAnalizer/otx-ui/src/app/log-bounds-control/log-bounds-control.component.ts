import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { ILog } from 'src/services/open-tx-log-parser';
import * as _ from "underscore";

@Component({
  selector: 'otx-log-bounds-control',
  template: `
    Include rows from <input [(ngModel)]="startRow" (change)="selectionChanged()"/> to <input [(ngModel)]="endRow" (change)="selectionChanged()"/>
  `,
  styles: [
  ]
})
export class LogBoundsControlComponent implements OnInit {
  _selectedLog?: ILog;
  @Input() get selectedLog() {return this._selectedLog;}
  set selectedLog(v) {
    this._selectedLog = v;
    this.startRow = 0;
    this.endRow = v?.rows?.length ?? 0;
    this.selectionChanged();
  }
  @Input() startRow = 0;
  @Output() startRowChange = new EventEmitter<number>();
  @Input() endRow = 0;
  @Output() endRowChange = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

  selectionChanged() {
    this.startRowChange.next(this.startRow);
    this.endRowChange.next(this.endRow);
  }
}
