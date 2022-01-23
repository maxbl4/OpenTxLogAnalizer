import {Component, Input, OnInit} from '@angular/core';
import {ILog} from "../../services/open-tx-log-parser";
import {PersistenceService} from "../../services/persistence.service";
import {knownStats, StatDesc} from "../map-view/map-view.component";
import {DataManager} from "../../services/data-manager";

@Component({
  selector: 'otx-charts-view',
  template: `
    <div class="container-fluid flex-container flex-grow-1">
      <div class="row">
        <div class="col">
          <otx-log-bounds-control [selectedLog]="selectedLog" (boundsChange)="chartSelectionChanged()"></otx-log-bounds-control>
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
  }

  results = [];
  selectedStat: StatDesc[] = [];
  constructor(private data: DataManager, private persistance: PersistenceService) {
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
          this.selectedLog?.rows.slice(this.data.startRow, this.data.endRow)
            .map(x => {return {name: x.index, value: (<any>x)[f.field] ?? 0}})};
      data.push(series);
    }
    this.results = <any>data;
  }
}
