import {Component, Input, OnInit} from '@angular/core';
import {ILog} from "../../services/open-tx-log-parser";
import {PersistanceService} from "../../services/persistance-service";

@Component({
  selector: 'otx-charts-view',
  template: `
    <div class="container-fluid flex-container flex-grow-1">
      <div class="row">
        <div class="col">
          Include rows from <input [(ngModel)]="startRow" (change)="chartSelectionChanged()"/> to <input [(ngModel)]="endRow" (change)="chartSelectionChanged()"/>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <ul class="list-inline">
            <li class="list-inline-item">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="chartsToDraw.gpsSpeed" (change)="chartSelectionChanged()">
                <label class="form-check-label" for="flexCheckDefault">
                  Speed km/h
                </label>
              </div>
            </li>
            <li class="list-inline-item">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="chartsToDraw.rxBattery" (change)="chartSelectionChanged()">
                <label class="form-check-label" for="flexCheckDefault">
                  Rx Battery V
                </label>
              </div>
            </li>
            <li class="list-inline-item">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="chartsToDraw.power" (change)="chartSelectionChanged()">
                <label class="form-check-label" for="flexCheckDefault">
                  Power W
                </label>
              </div>
            </li>
            <li class="list-inline-item">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="chartsToDraw.wattPerKm" (change)="chartSelectionChanged()">
                <label class="form-check-label" for="flexCheckDefault">
                  Watt hour per km
                </label>
              </div>
            </li>
            <li class="list-inline-item">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="chartsToDraw.estimatedRange" (change)="chartSelectionChanged()">
                <label class="form-check-label" for="flexCheckDefault">
                  Estimated range km
                </label>
              </div>
            </li>
            <li class="list-inline-item">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="chartsToDraw.estimatedFlightTime" (change)="chartSelectionChanged()">
                <label class="form-check-label" for="flexCheckDefault">
                  Estimated time minutes
                </label>
              </div>
            </li>

          </ul>
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
  private _selectedLog?: ILog;
  @Input() get selectedLog() {return this._selectedLog;}
  set selectedLog(v: ILog|undefined) {
    this._selectedLog = v;
    this.startRow = 0;
    this.endRow = v?.rows.length ?? 0;
  }

  startRow = 0;
  endRow = 0;
  chartsToDraw: ChartsToDraw = {gpsSpeed: true};

  view = [undefined, 500];
  results = [];
  constructor(private persistance: PersistanceService) {
  }

  ngOnInit(): void {
    this.chartsToDraw = this.persistance.chartsToDraw ?? this.chartsToDraw;
    this.chartSelectionChanged();
  }

  chartSelectionChanged() {
    this.persistance.chartsToDraw = this.chartsToDraw;
    const data = [];
    if (this.chartsToDraw.gpsSpeed) {
      const series = {name: "Speed", series: this.selectedLog?.rows.slice(this.startRow, this.endRow - this.startRow).map(x => {return {name: x.index, value: x.gpsSpeed ?? 0}})};
      data.push(series);
    }
    if (this.chartsToDraw.power) {
      const series = {name: "Power", series: this.selectedLog?.rows.slice(this.startRow, this.endRow - this.startRow).map(x => {return {name: x.index, value: x.power ?? 0}})};
      data.push(series);
    }
    if (this.chartsToDraw.rxBattery) {
      const series = {name: "Rx Battery", series: this.selectedLog?.rows.slice(this.startRow, this.endRow - this.startRow).map(x => {return {name: x.index, value: x.rxBattery ?? 0}})};
      data.push(series);
    }
    if (this.chartsToDraw.wattPerKm) {
      const series = {name: "Wh/km", series: this.selectedLog?.rows.slice(this.startRow, this.endRow - this.startRow).map(x => {return {name: x.index, value: x.wattPerKm ?? 0}})};
      data.push(series);
    }
    if (this.chartsToDraw.estimatedRange) {
      const series = {name: "Est. range", series: this.selectedLog?.rows.slice(this.startRow, this.endRow - this.startRow).map(x => {return {name: x.index, value: x.estimatedRange ?? 0}})};
      data.push(series);
    }
    if (this.chartsToDraw.estimatedFlightTime) {
      const series = {name: "Est. time", series: this.selectedLog?.rows.slice(this.startRow, this.endRow - this.startRow).map(x => {return {name: x.index, value: x.estimatedFlightTime ?? 0}})};
      data.push(series);
    }
    this.results = <any>data;
  }
}

export interface ChartsToDraw {
  trip?:boolean;
  altitude?:boolean;
  gpsSpeed?:boolean;
  rss1?:boolean;
  djiBitrate?:boolean;
  djiDelay?:boolean;
  rxBattery?:boolean;
  power?:boolean;
  wattPerKm?:boolean;
  estimatedRange?:boolean;
  estimatedFlightTime?:boolean;
}
