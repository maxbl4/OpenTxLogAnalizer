import {Component, Input, OnInit} from '@angular/core';
import { ILog } from 'src/services/open-tx-log-parser';

@Component({
  selector: 'otx-statistics-view',
  template: `
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
        <td>{{selectedLog?.stats?.speed?.min}}</td>
        <td>{{selectedLog?.stats?.speed?.avg}}</td>
        <td>{{selectedLog?.stats?.speed?.max}}</td>
      </tr>
      <tr>
        <td>Rx Battery, V</td>
        <td>{{selectedLog?.stats?.rxBattery?.min}}</td>
        <td>{{selectedLog?.stats?.rxBattery?.avg}}</td>
        <td>{{selectedLog?.stats?.rxBattery?.max}}</td>
      </tr>
      <tr>
        <td>Current, A</td>
        <td>{{selectedLog?.stats?.current?.min}}</td>
        <td>{{selectedLog?.stats?.current?.avg}}</td>
        <td>{{selectedLog?.stats?.current?.max}}</td>
      </tr>
      <tr>
        <td>Power, W</td>
        <td>{{selectedLog?.stats?.power?.min}}</td>
        <td>{{selectedLog?.stats?.power?.avg}}</td>
        <td>{{selectedLog?.stats?.power?.max}}</td>
      </tr>
      <tr>
        <td>Efficiency, Wh/km <span class="badge bg-secondary"
                                    ngbTooltip="How many Watt hours are required to fly 1km at current rate">???</span>
        </td>
        <td>{{selectedLog?.stats?.wattPerKm?.min}}</td>
        <td>{{selectedLog?.stats?.wattPerKm?.avg}}</td>
        <td>{{selectedLog?.stats?.wattPerKm?.max}}</td>
      </tr>
      <tr>
        <td>Estimated range, km <span class="badge bg-secondary"
                                      ngbTooltip="Considering the total battery capacity used, how far we could fly with given efficiency">???</span>
        </td>
        <td>{{selectedLog?.stats?.estimatedRange?.min}}</td>
        <td>{{selectedLog?.stats?.estimatedRange?.avg}}</td>
        <td>{{selectedLog?.stats?.estimatedRange?.max}}</td>
      </tr>
      <tr>
        <td>Estimated flight time, m <span class="badge bg-secondary"
                                           ngbTooltip="Considering the total battery capacity used, how long can we fly with given power">???</span>
        </td>
        <td>{{selectedLog?.stats?.estimatedFlightTime?.min}}</td>
        <td>{{selectedLog?.stats?.estimatedFlightTime?.avg}}</td>
        <td>{{selectedLog?.stats?.estimatedFlightTime?.max}}</td>
      </tr>
      <tr>
        <td>1RSS(dB)</td>
        <td>{{selectedLog?.stats?.rss1?.min}}</td>
        <td>{{selectedLog?.stats?.rss1?.avg}}</td>
        <td>{{selectedLog?.stats?.rss1?.max}}</td>
      </tr>
      <tr>
        <td>RQLY</td>
        <td>{{selectedLog?.stats?.rqly?.min}}</td>
        <td>{{selectedLog?.stats?.rqly?.avg}}</td>
        <td>{{selectedLog?.stats?.rqly?.max}}</td>
      </tr>
      <tr>
        <td>DJI Latency ms</td>
        <td>{{selectedLog?.stats?.djiDelay?.min}}</td>
        <td>{{selectedLog?.stats?.djiDelay?.avg}}</td>
        <td>{{selectedLog?.stats?.djiDelay?.max}}</td>
      </tr>
      <tr>
        <td>DJI Bitrate MBits</td>
        <td>{{selectedLog?.stats?.djiBitrate?.min}}</td>
        <td>{{selectedLog?.stats?.djiBitrate?.avg}}</td>
        <td>{{selectedLog?.stats?.djiBitrate?.max}}</td>
      </tr>
      <tr>
        <td>Altitude, m</td>
        <td>{{selectedLog?.stats?.altitude?.min}}</td>
        <td>{{selectedLog?.stats?.altitude?.avg}}</td>
        <td>{{selectedLog?.stats?.altitude?.max}}</td>
      </tr>
      <tr>
        <td>Distance to Home, km</td>
        <td>{{selectedLog?.stats?.distanceToHome?.min}}</td>
        <td>{{selectedLog?.stats?.distanceToHome?.avg}}</td>
        <td>{{selectedLog?.stats?.distanceToHome?.max}}</td>
      </tr>
      <tr>
        <td>Distance traveled, km</td>
        <td colspan="3">
          <div class="text-center">{{selectedLog?.stats?.distanceTraveled}}</div>
        </td>
      </tr>
      <tr>
        <td>Capacity used, mAh</td>
        <td colspan="3">
          <div class="text-center">{{selectedLog?.stats?.totalCapacity}}</div>
        </td>
      </tr>
      <tr>
        <td>Watt hours used</td>
        <td colspan="3">
          <div class="text-center">{{selectedLog?.stats?.totalWh}}</div>
        </td>
      </tr>
      </tbody>
    </table>
  `,
  styles: [
  ]
})
export class StatisticsViewComponent implements OnInit {
  @Input()
  selectedLog?: ILog;

  constructor() { }

  ngOnInit(): void {
  }

}
