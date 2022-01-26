import {Component} from '@angular/core';
import {DataManager} from "../../services/data-manager";

@Component({
  selector: 'otx-log-bounds-control',
  template: `
    <ng-container *ngIf="data.currentLogProject">
      <div class="mb-3">
        <label for="formGroupExampleInput" class="form-label">Start Row
          <span class="badge bg-secondary" ngbTooltip="Select start/end row of log to filter out, to look only at particular part">?</span>
        </label>
        <input type="number" class="form-control" [(ngModel)]="data.currentLogProject.startRow" (change)="onChange()" (click)="selectAll($event)" />
      </div>
      <div class="mb-3">
        <label for="formGroupExampleInput" class="form-label">End Row
          <span class="badge bg-secondary" ngbTooltip="Select start/end row of log to filter out, to look only at particular part">?</span>
        </label>
        <input type="number" class="form-control" [(ngModel)]="data.currentLogProject.endRow" (change)="onChange()" (click)="selectAll($event)" />
      </div>
      <div class="mb-3">
        <label for="formGroupExampleInput" class="form-label">Current Correction
          <span class="badge bg-secondary" ngbTooltip="Correction for your current meter calculation. E.g. 0.8 means, that actual current was 80% of measured by sensor">?</span>
        </label>
        <input type="number" class="form-control" [(ngModel)]="data.currentLogProject.correction" (change)="whChanged()" (click)="selectAll($event)"/>
      </div>
      <div class="mb-3">
        <label for="formGroupExampleInput" class="form-label">Total Watt Hour capacity
          <span class="badge bg-secondary" ngbTooltip="Total Watt Hour capacity of your battery to use in range estimations. E.g. 1300mAh 6s Lipo will have 3.7*1.3*6=28.86 wh of capacity">?</span>
        </label>
        <input type="number" class="form-control" [(ngModel)]="data.currentLogProject.powerAvailable" (change)="whChanged()" (click)="selectAll($event)"/>
      </div>
    </ng-container>
  `,
  styles: [
  ]
})
export class LogBoundsControlComponent {
  constructor(public data:DataManager) {
  }

  onChange(){
    this.data.updateSelectedLog();
  }

  whChanged() {
    this.data.updateSelectedLog();
  }

  selectAll(ev: any) {
    ev.target.select();
  }
}
