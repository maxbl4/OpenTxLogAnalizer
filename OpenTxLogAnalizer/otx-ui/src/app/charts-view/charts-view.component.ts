import {Component, Input, OnInit} from '@angular/core';
import {ILog} from "../../services/open-tx-log-parser";
import {PersistenceService} from "../../services/persistence.service";
import {knownStats, StatDesc} from "../map-view/map-view.component";

@Component({
  selector: 'otx-charts-view',
  template: `
    <div class="container-fluid flex-container flex-grow-1">
      <div class="row">
        <div class="col">
          Include rows from <input [(ngModel)]="startRow" (change)="chartSelectionChanged()"/> to <input [(ngModel)]="endRow" (change)="chartSelectionChanged()"/>
        </div>
      </div>

      <div class="grid-two-panes flex-grow-1">
        <div class="grid-left-pane">
          <div class="mb-3">
            <label for="formGroupExampleInput" class="form-label">Value to draw</label>
            <select class="form-select" multiple [(ngModel)]="selectedStat" (change)="chartSelectionChanged()" [size]="stats.length">
              <option [value]="s" *ngFor="let s of stats">{{s.name}}</option>
            </select>
          </div>
        </div>
        <div class="grid-right-pane" style="display: grid">
            <ngx-charts-line-chart
              [results]="results"
              [legend]="true"
              [showXAxisLabel]="true"
              [showYAxisLabel]="true"
              [xAxis]="true"
              [yAxis]="true"
              xAxisLabel="Index"
              yAxisLabel=""
            >
            </ngx-charts-line-chart>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }`
  ]
})
export class ChartsViewComponent implements OnInit {
  stats = knownStats;
  private _selectedLog?: ILog;
  @Input() get selectedLog() {return this._selectedLog;}
  set selectedLog(v: ILog|undefined) {
    this._selectedLog = v;
    this.startRow = 0;
    this.endRow = v?.rows.length ?? 0;
  }

  startRow = 0;
  endRow = 0;

  results = [];
  selectedStat: StatDesc[] = [];
  constructor(private persistance: PersistenceService) {
  }

  ngOnInit(): void {
    this.selectedStat = this.persistance.chartsToDraw?.map(x => this.stats.find(y => y.field == x.field)!)
      ?? [this.stats[0]];
    this.chartSelectionChanged();
  }

  chartSelectionChanged() {
    this.persistance.chartsToDraw = this.selectedStat;
    const data = [];
    for (let f of this.selectedStat) {
      const series = {name: f.name, series:
          this.selectedLog?.rows.slice(this.startRow, this.endRow - this.startRow)
            .map(x => {return {name: x.index, value: (<any>x)[f.field] ?? 0}})};
      data.push(series);
    }
    // if (this.chartsToDraw.gpsSpeed) {
    //   const series = {name: "Speed", series: this.selectedLog?.rows.slice(this.startRow, this.endRow - this.startRow).map(x => {return {name: x.index, value: x.gpsSpeed ?? 0}})};
    //   data.push(series);
    // }
    // if (this.chartsToDraw.power) {
    //   const series = {name: "Power", series: this.selectedLog?.rows.slice(this.startRow, this.endRow - this.startRow).map(x => {return {name: x.index, value: x.power ?? 0}})};
    //   data.push(series);
    // }
    // if (this.chartsToDraw.rxBattery) {
    //   const series = {name: "Rx Battery", series: this.selectedLog?.rows.slice(this.startRow, this.endRow - this.startRow).map(x => {return {name: x.index, value: x.rxBattery ?? 0}})};
    //   data.push(series);
    // }
    // if (this.chartsToDraw.wattPerKm) {
    //   const series = {name: "Wh/km", series: this.selectedLog?.rows.slice(this.startRow, this.endRow - this.startRow).map(x => {return {name: x.index, value: x.wattPerKm ?? 0}})};
    //   data.push(series);
    // }
    // if (this.chartsToDraw.estimatedRange) {
    //   const series = {name: "Est. range", series: this.selectedLog?.rows.slice(this.startRow, this.endRow - this.startRow).map(x => {return {name: x.index, value: x.estimatedRange ?? 0}})};
    //   data.push(series);
    // }
    // if (this.chartsToDraw.estimatedFlightTime) {
    //   const series = {name: "Est. time", series: this.selectedLog?.rows.slice(this.startRow, this.endRow - this.startRow).map(x => {return {name: x.index, value: x.estimatedFlightTime ?? 0}})};
    //   data.push(series);
    // }
    this.results = <any>data;
  }
}
