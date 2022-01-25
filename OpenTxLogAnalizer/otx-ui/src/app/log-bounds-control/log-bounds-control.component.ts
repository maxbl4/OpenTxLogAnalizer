import {Component} from '@angular/core';
import {DataManager} from "../../services/data-manager";

@Component({
  selector: 'otx-log-bounds-control',
  template: `
    <ng-container *ngIf="data.currentLogProject">
      <div class="mb-3">
        <label for="formGroupExampleInput" class="form-label">Start Row</label>
        <input type="number" class="form-control" [(ngModel)]="data.currentLogProject.startRow" (change)="onChange()" (click)="selectAll($event)" />
      </div>
      <div class="mb-3">
        <label for="formGroupExampleInput" class="form-label">End Row</label>
        <input type="number" class="form-control" [(ngModel)]="data.currentLogProject.endRow" (change)="onChange()" (click)="selectAll($event)" />
      </div>
      <div class="mb-3">
        <label for="formGroupExampleInput" class="form-label">Current Correction (actual/logged)</label>
        <input type="number" class="form-control" [(ngModel)]="data.currentLogProject.correction" (change)="whChanged()" (click)="selectAll($event)"/>
      </div>
      <div class="mb-3">
        <label for="formGroupExampleInput" class="form-label">Total Watt Hour capacity</label>
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
