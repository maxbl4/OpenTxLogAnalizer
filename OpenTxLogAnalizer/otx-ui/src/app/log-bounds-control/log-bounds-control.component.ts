import {Component} from '@angular/core';
import {DataManager} from "../../services/data-manager";

@Component({
  selector: 'otx-log-bounds-control',
  template: `
    <ng-container *ngIf="data.currentLogProject">
      Include rows from <input [(ngModel)]="data.currentLogProject.startRow" (change)="onChange()" />
      to <input [(ngModel)]="data.currentLogProject.endRow" (change)="onChange()" />
      Current Correction (actual/logged) <input [(ngModel)]="data.currentLogProject.correction" (change)="whChanged()"/>
      Total Watt Hour capacity <input [(ngModel)]="data.currentLogProject.powerAvailable" (change)="whChanged()"/>
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
