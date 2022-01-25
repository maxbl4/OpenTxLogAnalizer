import {Component, Input, OnInit} from '@angular/core';
import { ILog } from 'src/services/open-tx-log-parser';
import {DataManager} from "../../services/data-manager";

@Component({
  selector: 'otx-statistics-view',
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-auto" style="width: 200px">
          <otx-log-bounds-control></otx-log-bounds-control>
        </div>
        <div class="col">
          <table class="table table-hover">
            <thead>
            <tr>
              <th>Metric</th>
              <th>Min</th>
              <th>Avg</th>
              <th>Max</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>Speed, km/h</td>
              <td>{{data.selectedLog?.stats?.gpsSpeed?.min}}</td>
              <td>{{data.selectedLog?.stats?.gpsSpeed?.avg}}</td>
              <td>{{data.selectedLog?.stats?.gpsSpeed?.max}}</td>
            </tr>
            <tr>
              <td>Rx Battery, V</td>
              <td>{{data.selectedLog?.stats?.rxBattery?.min}}</td>
              <td>{{data.selectedLog?.stats?.rxBattery?.avg}}</td>
              <td>{{data.selectedLog?.stats?.rxBattery?.max}}</td>
            </tr>
            <tr>
              <td>Current, A</td>
              <td>{{data.selectedLog?.stats?.current?.min}}</td>
              <td>{{data.selectedLog?.stats?.current?.avg}}</td>
              <td>{{data.selectedLog?.stats?.current?.max}}</td>
            </tr>
            <tr>
              <td>Power, W</td>
              <td>{{data.selectedLog?.stats?.power?.min}}</td>
              <td>{{data.selectedLog?.stats?.power?.avg}}</td>
              <td>{{data.selectedLog?.stats?.power?.max}}</td>
            </tr>
            <tr>
              <td>Efficiency, Wh/km <span class="badge bg-secondary"
                                          ngbTooltip="How many Watt hours are required to fly 1km at current rate">???</span>
              </td>
              <td>{{data.selectedLog?.stats?.wattPerKm?.min}}</td>
              <td>{{data.selectedLog?.stats?.wattPerKm?.avg}}</td>
              <td>{{data.selectedLog?.stats?.wattPerKm?.max}}</td>
            </tr>
            <tr>
              <td>Estimated range, km <span class="badge bg-secondary"
                                            ngbTooltip="Considering the total battery capacity used, how far we could fly with given efficiency">???</span>
              </td>
              <td>{{data.selectedLog?.stats?.estimatedRange?.min}}</td>
              <td>{{data.selectedLog?.stats?.estimatedRange?.avg}}</td>
              <td>{{data.selectedLog?.stats?.estimatedRange?.max}}</td>
            </tr>
            <tr>
              <td>Estimated flight time, m <span class="badge bg-secondary"
                                                 ngbTooltip="Considering the total battery capacity used, how long can we fly with given power">???</span>
              </td>
              <td>{{data.selectedLog?.stats?.estimatedFlightTime?.min}}</td>
              <td>{{data.selectedLog?.stats?.estimatedFlightTime?.avg}}</td>
              <td>{{data.selectedLog?.stats?.estimatedFlightTime?.max}}</td>
            </tr>
            <tr>
              <td>1RSS(dB)</td>
              <td>{{data.selectedLog?.stats?.rss1?.min}}</td>
              <td>{{data.selectedLog?.stats?.rss1?.avg}}</td>
              <td>{{data.selectedLog?.stats?.rss1?.max}}</td>
            </tr>
            <tr>
              <td>2RSS(dB)</td>
              <td>{{data.selectedLog?.stats?.rss2?.min}}</td>
              <td>{{data.selectedLog?.stats?.rss2?.avg}}</td>
              <td>{{data.selectedLog?.stats?.rss2?.max}}</td>
            </tr>
            <tr>
              <td>RQLY</td>
              <td>{{data.selectedLog?.stats?.rqly?.min}}</td>
              <td>{{data.selectedLog?.stats?.rqly?.avg}}</td>
              <td>{{data.selectedLog?.stats?.rqly?.max}}</td>
            </tr>
            <tr>
              <td>DJI Latency ms</td>
              <td>{{data.selectedLog?.stats?.djiDelay?.min}}</td>
              <td>{{data.selectedLog?.stats?.djiDelay?.avg}}</td>
              <td>{{data.selectedLog?.stats?.djiDelay?.max}}</td>
            </tr>
            <tr>
              <td>DJI Bitrate MBits</td>
              <td>{{data.selectedLog?.stats?.djiBitrate?.min}}</td>
              <td>{{data.selectedLog?.stats?.djiBitrate?.avg}}</td>
              <td>{{data.selectedLog?.stats?.djiBitrate?.max}}</td>
            </tr>
            <tr>
              <td>Altitude, m</td>
              <td>{{data.selectedLog?.stats?.altitude?.min}}</td>
              <td>{{data.selectedLog?.stats?.altitude?.avg}}</td>
              <td>{{data.selectedLog?.stats?.altitude?.max}}</td>
            </tr>
            <tr>
              <td>Distance to Home, km</td>
              <td>{{data.selectedLog?.stats?.distanceToHome?.min}}</td>
              <td>{{data.selectedLog?.stats?.distanceToHome?.avg}}</td>
              <td>{{data.selectedLog?.stats?.distanceToHome?.max}}</td>
            </tr>
            <tr>
              <td>Distance traveled, km</td>
              <td></td>
              <td>
                <div>{{data.selectedLog?.stats?.distanceTraveled?.max}}</div>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>Capacity used, mAh</td>
              <td></td>
              <td>
                <div>{{data.selectedLog?.capacityUsed}}</div>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>Watt hours used</td>
              <td></td>
              <td>
                <div>{{data.selectedLog?.powerUsed}}</div>
              </td>
              <td></td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class StatisticsViewComponent implements OnInit {
  constructor(public data: DataManager) { }

  ngOnInit(): void {
  }
}
