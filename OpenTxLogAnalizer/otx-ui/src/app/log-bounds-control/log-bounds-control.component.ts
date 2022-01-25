import {Component} from '@angular/core';
import {DataManager} from "../../services/data-manager";

@Component({
  selector: 'otx-log-bounds-control',
  template: `
    <ng-container *ngIf="data.currentLogProject">
      Include rows from <input type="number" [(ngModel)]="data.currentLogProject.startRow" (change)="onChange()" />
      to <input type="number" [(ngModel)]="data.currentLogProject.endRow" (change)="onChange()" />
      Current Correction (actual/logged) <input type="number" [(ngModel)]="data.currentLogProject.correction" (change)="whChanged()"/>
      Total Watt Hour capacity <input type="number" [(ngModel)]="data.currentLogProject.powerAvailable" (change)="whChanged()"/>
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
}
