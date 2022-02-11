import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {OsdItems, SrtGenerator} from "../../services/srt-generator";
import {PersistenceService} from "../../services/persistence.service";
import {DataManager} from "../../services/data-manager";
import {AssGenerator, LayoutSettings} from "../../services/ass-generator.service";
import {GpxGenerator} from "../../services/gpx-generator";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'otx-srt-export-view',
  template: `
    <ng-template #usageInfo let-modal>
      <div class="modal-header">
        <h4 class="modal-title" id="modal-basic-title">OSD Template Format</h4>
        <button type="button" class="close btn btn-danger btn-sm" aria-label="Close" (click)="modal.dismiss('Cross click')">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <h3>Basic</h3>
        <p>Any text output as is. To output telemtry value put it's name in curly braces: {{'{gps}'}} will output GPS coordinates</p>
        <p>Example template: <code>Current {{'{current}'}}A</code> will draw something like this: <code>Current 15.1A</code></p>
        <h3>Value formatting</h3>
        <p>You can add left padding to the values, so they don't jump around because of different length: <code>{{'{rxBattery,6}'}}</code> will draw <code>"  16.1"</code> and pad with additional 2 spaces</p>
        <h3>Value bars</h3>
        <p>You can draw value as bar instead of number <code>{{'{power,5,bar}'}}</code> will draw bar of 5 characters <code>###--</code> representing the current value relative to minimum and maximum in the log. <code>barReverse</code> will draw bar right-to-left.</p>
        <h3>Header</h3>
        <p><code>#!x:10,y:720,width:1280,height:720,font:Courier New,fontSize:28,color:ffffff</code></p>
        <p>All fields are optional, you can remove header if not used</p>
        <h3>Available fields</h3>
        <p>gps, lat, lon, gpsSpeed, Sats, distanceToHome, distanceTraveled, rss1, rss2, rqly, rqlySum, rqlyOsd, rsnr, rfmd, tpwr, rxBattery, current, power, capacity, wattPerKm, estimatedRange, estimatedFlightTime, batteryPercent, pitchDeg, rollDeg, yawDeg, throttle, djiDelay, djiBitrate</p>
      </div>
    </ng-template>
    <div class="container-fluid">
      <h3>Export subtitles file with OSD telemetry</h3>
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
          <div class="mb-3">
            <label for="exampleFormControlTextarea1" class="form-label">OSD Template</label><button class="btn btn-sm btn-danger ms-2" (click)="showHelp()">Help me!</button>
            <textarea class="form-control osd-layout" id="exampleFormControlTextarea1" rows="15" [(ngModel)]="osdLayout" (keyup)="updatePreview()"></textarea>
          </div>
        </div>
        <div class="col">
          <div class="mb-3">
              <label for="exampleFormControlTextarea1" class="form-label">OSD Preview</label>
            <div class="osd-preview"
                 [style.color]="'#'+layoutSettings.color"
                 [style.padding-left]="layoutSettings.x+'px'"
                 [style.padding-bottom]="layoutSettings.height-layoutSettings.y+'px'"
                 [style.width]="layoutSettings.width+'px'"
                 [style.height]="layoutSettings.height+'px'">
                <pre style="align-self: flex-end"
                     [style.font-family]="layoutSettings.font+'!important'" [style.font-size]="layoutSettings.fontSize+'px'">{{osdLayoutPreview}}</pre>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <h3>Export enriched log in CSV format</h3>
          <p>Additional data is calculated in the output: Distance to Home, Total Trip Distance, Electrical
            Power, Electrical Efficiency in Watt hour per km</p>
          <button class="btn btn-success" (click)="exportCsv()">Export CSV</button>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <h3>Export track in GPX format</h3>
          <button class="btn btn-success" (click)="exportGpx()">Export GPX</button>
        </div>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class SrtExportViewComponent implements OnInit {
  @ViewChild('usageInfo')
  usageInfo?: ElementRef;

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
|R/C|{rqlyOsd,10} |{rss1,8}dBm |{rsnr,5}SNR |            |
`;
  layoutSettings = new LayoutSettings();

  constructor(public data: DataManager, private srtGenerator: SrtGenerator, private assGenerator: AssGenerator, private gpxGenerator: GpxGenerator, private persistance: PersistenceService,
              private modalService: NgbModal) { }

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

  exportCsv() {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(new Blob([this.data.otxParser.exportToCsv(this.data.selectedLog!)]));
    a.href = objectUrl;
    a.download = `${this.data.currentLogProject?.otx.name.substring(0, this.data.currentLogProject?.otx.name.length - 4)}-enriched.csv`;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  exportGpx() {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(new Blob([this.gpxGenerator.exportGpx(this.data.selectedLog!)]));
    a.href = objectUrl;
    a.download = `${this.data.currentLogProject?.otx.name.substring(0, this.data.currentLogProject?.otx.name.length - 4)}.gpx`;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  showHelp() {
    this.modalService.open(this.usageInfo, {ariaLabelledBy: 'modal-basic-title'});
  }
}
