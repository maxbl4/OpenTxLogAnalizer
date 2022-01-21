import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'otx-usage-text-view',
  template: `
    <ng-template #usageInfo let-modal>
      <div class="modal-header">
        <h4 class="modal-title" id="modal-basic-title">How to use</h4>
        <button type="button" class="close btn btn-danger btn-sm" aria-label="Close" (click)="modal.dismiss('Cross click')">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <h3>Overview</h3>
        <p>This tool is intended to help analyze your telemetry logs and optionally overlay the log values over DVR video</p>
        <p>It processes OpenTX telemetry logs recorded in your TX and can join DJI SRT logs recorded by your goggles, so you have both flight controller telemetry values and DJI latency and bitrate values in one log</p>
        <p>Here is the list of values calculated/processed for each row:</p>
        <ul>
          <li>Distance from home</li>
          <li>Total trip distance</li>
          <li>Total trip distance</li>
          <li>Electrical power</li>
          <li>Pitch, Roll, Yaw converted to degrees from radians</li>
          <li>Stick positions (ail, ele, thr, rud) are converted to percent. E.g. 0% - 100% throttle</li>
          <li>GPS coordinates are split into separate Lat, Lon fields</li>
          <li>Efficiency as Watt hour per kilometer of flight. How many Watt hours of power would be consumed to fly 1 km with current speed and power</li>
          <li>Total used Watt hours is calculated as mAh from last row and number of cells from first row</li>
          <li>Total WH is used to calculate estimated range at current efficiency and estimated flight time at current power for each line. So you can chart speed vs estimated range and get a clue what is the optimal cruise speed</li>
        </ul>
        <p>Also overall statistics are calculated as min, avg, max: Speed, Current, Power, Rx Battery Voltage, Wh per km, Estimated Range, Estimated Time, Altitude, RSSI, LQ, DJI Latency, DJI Bitrate, Distance to Home</p>
        <h3>Usage</h3>
        <ul>
          <li>Drag and drop your OpenTx telemetry log CSV. It will be parsed locally, without uploading</li>
          <li>Select the flight you want. Now if you have corresponding DJI SRT file you can drag on the selected log to join it's data</li>
          <li>You can check what data is loaded on the Rows tab, check statistics on Statistics tab</li>
          <li>If you are satisfied with loaded data, you can export it as CSV or SRT. In case of SRT you can choose which field will be present</li>
          <li>Put downloaded SRT file next to video and name it the same as video, open video and you should see your values overlayed</li>
        </ul>
      </div>
    </ng-template>
  `,
  styles: [
  ]
})
export class UsageTextViewComponent implements OnInit {
  @ViewChild('usageInfo')
  usageInfo?: ElementRef;

  constructor( private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  show() {
    this.modalService.open(this.usageInfo, {ariaLabelledBy: 'modal-basic-title'});
  }

}
