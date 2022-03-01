import {Component, OnInit} from '@angular/core';
import {PersistenceService} from "../../services/persistence.service";
import {knownStats, StatDesc} from "../map-view/map-view.component";
import {DataManager} from "../../services/data-manager";
import {ILogRow} from "../../services/open-tx-log-parser";
import {IStatTriple} from "../../services/IStats";

@Component({
  selector: 'otx-charts-view',
  template: `
    <div class="container-fluid flex-container flex-grow-1">
      <div class="grid-two-panes flex-grow-1">
        <div class="grid-left-pane">
          <div class="mb-3">
            <label for="formGroupExampleInput" class="form-label">X Axis</label>
            <select class="form-select" [(ngModel)]="selectedXAxisType" (change)="chartSelectionChanged()">
              <option [ngValue]="s" *ngFor="let s of xAxisTypes">{{s.name}}</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="formGroupExampleInput" class="form-label">Value to draw
              <span class="badge bg-secondary" ngbTooltip="Ctrl+Click to select several values at once">?</span></label>
            <select class="form-select" multiple [(ngModel)]="selectedStat" (change)="chartSelectionChanged()" [size]="15">
              <option [value]="s" *ngFor="let s of stats">{{s.name}}</option>
            </select>
          </div>
          <otx-log-bounds-control></otx-log-bounds-control>
        </div>
        <div class="grid-right-pane" style="display: grid">
            <ngx-charts-line-chart
              [results]="results"
              [legend]="true"
              [showXAxisLabel]="true"
              [showYAxisLabel]="true"
              [xAxis]="true"
              [yAxis]="true"
              [xAxisLabel]="selectedXAxisType.name"
              yAxisLabel=""
              [autoScale]="true"
              (select)="onSelect($event)"
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
  results = [];
  selectedStat: StatDesc[] = [];
  xAxisTypes: xAxisType[] = [
    {name: "Index", field: "index"},
    {name: "Time, s", field: "timecode"},
    {name: "Trip distance, m", field: "distanceTraveled"},
    {name: "Home distance, m", field: "distanceToHome"},
  ];
  selectedXAxisType = this.xAxisTypes[0];
  constructor(private data: DataManager, private persistance: PersistenceService) {
    data.selectedLogChange.subscribe(x => this.chartSelectionChanged());
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
          this.data.selectedLog?.rows
            .map(x => {return {
              seriesName: f.name,
              index: x.index,
              name: x[this.selectedXAxisType.field],
              value: (<any>x)[f.field] ?? 0,
            }})};
      data.push(series);
    }
    this.results = <any>data;
  }

  onSelect($event: any) {
    if (!this.data.currentLogProject) return;
    this.data.currentLogProject.startRow = $event.index - 1;
  }
}

interface xAxisType {
  name: string;
  field: keyof ILogRow;
}
