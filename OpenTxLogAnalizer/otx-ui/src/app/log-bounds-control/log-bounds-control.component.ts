import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { ILog } from 'src/services/open-tx-log-parser';
import {DataManager} from "../../services/data-manager";

@Component({
  selector: 'otx-log-bounds-control',
  template: `
    Include rows from <input [(ngModel)]="data.startRow" (change)="onChange()" />
    to <input [(ngModel)]="data.endRow" (change)="onChange()" />
<!--    Actual mAh used <input [(ngModel)]="selectedLog.actualMah" (change)="whChanged()"/>-->
<!--    Total Watt Hour capacity <input [(ngModel)]="selectedLog.totalWh" (change)="whChanged()"/>-->
  `,
  styles: [
  ]
})
export class LogBoundsControlComponent {
  @Input() selectedLog?: ILog;
  @Output() boundsChange = new EventEmitter<void>();

  constructor(public data:DataManager) {
  }

  onChange(){
    if (this.data.endRow > (this.selectedLog?.rows.length ?? 0))
      this.data.endRow = this.selectedLog?.rows.length ?? 0;
    if (this.data.startRow > this.data.endRow || this.data.startRow < 0)
      this.data.startRow = 0;
    this.boundsChange.next();
  }

  whChanged() {
    if (this.selectedLog)
      this.data.updateStatistics(this.selectedLog);
  }
}
