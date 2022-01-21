import {Component, Input, OnInit} from '@angular/core';
import {ILog} from "../../services/open-tx-log-parser";
import {PersistanceService} from "../../services/persistance-service";

@Component({
  selector: 'otx-charts-view',
  template: `
    <div class="container-fluid flex-container flex-grow-1">
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
  @Input() selectedLog?: ILog;

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
      const series = {name: "Speed", series: this.selectedLog?.rows.map(x => {return {name: x.timecode, value: x.gpsSpeed ?? 0}})};
      data.push(series);
    }
    if (this.chartsToDraw.power) {
      const series = {name: "Power", series: this.selectedLog?.rows.map(x => {return {name: x.timecode, value: x.power ?? 0}})};
      data.push(series);
    }
    if (this.chartsToDraw.rxBattery) {
      const series = {name: "Rx Battery", series: this.selectedLog?.rows.map(x => {return {name: x.timecode, value: x.rxBattery ?? 0}})};
      data.push(series);
    }
    if (this.chartsToDraw.wattPerKm) {
      const series = {name: "Wh/km", series: this.selectedLog?.rows.map(x => {return {name: x.timecode, value: x.wattPerKm ?? 0}})};
      data.push(series);
    }
    if (this.chartsToDraw.estimatedRange) {
      const series = {name: "Est. range", series: this.selectedLog?.rows.map(x => {return {name: x.timecode, value: x.estimatedRange ?? 0}})};
      data.push(series);
    }
    if (this.chartsToDraw.estimatedFlightTime) {
      const series = {name: "Est. time", series: this.selectedLog?.rows.map(x => {return {name: x.timecode, value: x.estimatedFlightTime ?? 0}})};
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
