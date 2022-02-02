import {Component, OnInit} from '@angular/core';
import {OsdItems, SrtGenerator} from "../../services/srt-generator";
import {PersistenceService} from "../../services/persistence.service";
import {DataManager} from "../../services/data-manager";
import {AssGenerator, LayoutSettings} from "../../services/ass-generator.service";
import {ILog} from "../../services/open-tx-log-parser";

@Component({
  selector: 'otx-srt-export-view',
  template: `
    <div class="container-fluid">
      <h3>Export subtitles file with OSD telemetry</h3>
      <div class="row">
        <div class="col">
          <div class="mb-3">
            <label for="exampleFormControlTextarea1" class="form-label">OSD Template</label>
            <textarea class="form-control osd-layout" id="exampleFormControlTextarea1" rows="15" [(ngModel)]="osdLayout" (keyup)="updatePreview()"></textarea>
          </div>
        </div>
        <div class="col">
          <div class="mb-3">
              <label for="exampleFormControlTextarea1" class="form-label">OSD Preview</label>
            <div class="osd-preview"
                 [style.font-family]="layoutSettings.font" [style.font-size]="layoutSettings.fontSize+'px'"
                 [style.color]="'#'+layoutSettings.color"
                 [style.width]="layoutSettings.width+'px'"
                 [style.height]="layoutSettings.height+'px'"
                 [style.padding-left]="layoutSettings.x+'px'"
                 [style.padding-bottom]="layoutSettings.height-layoutSettings.y+'px'">
                <pre style="align-self: flex-end">{{osdLayoutPreview}}</pre>
            </div>

<!--              <textarea class="form-control osd-layout" id="exampleFormControlTextarea1" rows="15" [ngModel]="osdLayoutPreview" readonly-->
<!--                ></textarea>-->
          </div>
        </div>
        <div class="col-auto">
          Available Fields: gps, lat, lon, gpsSpeed, Sats, distanceToHome, distanceTraveled, rss1, rss2, rqly, rsnr, rfmd, tpwr, rxBattery, current, power, capacity, wattPerKm, estimatedRange, estimatedFlightTime, batteryPercent, pitchDeg, rollDeg, yawDeg, throttle, djiDelay, djiBitrate
        </div>
      </div>
      <div class="row mb-3">
        <div class="col">
          <button class="btn btn-success" (click)="exportSrt()" [disabled]="!data.selectedLog">Export SRT with OSD values</button>
          <p>After export you can use ffmpeg to burn subtitles into your video</p>
          <input class="form-control" type="text" readonly (click)="selectAll($event)"
                 value="ffmpeg -i original_video.mp4 -vf subtitles=generated_subtitles.ass result_video.mp4">
        </div>
      </div>
      <div class="row">
        <div class="col">
          <h3>Export enriched log in CSV format</h3>
          <p>Additional data is calculated in the output: Distance to Home, Total Trip Distance, Electrical
            Power, Electrical Efficiency in Watt hour per km</p>
          <button class="btn btn-success" (click)="exportCsv(data.selectedLog!)">Export CSV</button>
        </div>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class SrtExportViewComponent implements OnInit {
  osdItems: OsdItems = {
    gps: true,
    dist: true,
    altitude: true,
    gpsSpeed: true,
    rss1: true,
    dji: true,
    battery: true,
    power: true,
  };
  osdLayoutPreview: string = "";
  osdLayout: string = `#!x:10,y:710,font:Courier New,fontSize:30,color:9cfaff
|GPS| {lat,9} | {lat,10} | {Sats,3}Sats | {distanceToHome,6}Home |
|DJI|{djiDelay,8}ms | {djiBitrate,6}MBit |         |            |
|Ele|{rxBattery,9}V | {current,9}A | {power,6}W |{wattPerKm,6}Wh/km |
|R/C|{rqly,10} |{rss1,8}dBm |{rsnr,5}SNR |            |
`;
  layoutSettings = new LayoutSettings();

  constructor(public data: DataManager, private srtGenerator: SrtGenerator, private assGenerator: AssGenerator, private persistance: PersistenceService) { }

  ngOnInit(): void {
    this.osdItems = this.persistance.srtExport_osdItems ?? this.osdItems;
    this.osdLayout = this.persistance.srtExport_osdLayout ?? this.osdLayout;
    this.updatePreview();
  }

  exportSrt() {
    if (!this.data.currentLogProject) return;
    const fileName = this.data.currentLogProject.otx.name;
    this.persistance.srtExport_osdItems = this.osdItems;
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(new Blob([this.assGenerator.exportAss(this.data.selectedLog!, this.osdLayout)]));
    a.href = objectUrl;
    a.download = `${fileName.substring(0, fileName.length - 4)}.ass`;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  selectAll(ev: any) {
    ev.target.select();
  }

  updatePreview() {
    this.layoutSettings = this.assGenerator.getLayoutSettings(this.osdLayout);
    this.osdLayoutPreview = this.assGenerator.getPreview(this.osdLayout, this.data.selectedLog!);
    this.persistance.srtExport_osdLayout = this.osdLayout;
  }

  exportCsv(selectedLog: ILog) {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(new Blob([this.data.otxParser.exportToCsv(selectedLog)]));
    a.href = objectUrl;
    a.download = `${this.data.currentLogProject?.otx.name.substring(0, this.data.currentLogProject?.otx.name.length - 4)}-enriched.csv`;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }
}
