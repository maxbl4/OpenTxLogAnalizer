import {Component, Input, OnInit} from '@angular/core';
import {OsdItems, SrtGenerator} from "../../services/srt-generator";
import {ILog} from "../../services/open-tx-log-parser";
import {PersistenceService} from "../../services/persistence.service";

@Component({
  selector: 'otx-srt-export-view',
  template: `
    <h3>Export subtitles file with OSD telemetry</h3>
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="osdItems.gps">
      <label class="form-check-label" for="flexCheckDefault">
        GPS Coordinates
      </label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="osdItems.dist">
      <label class="form-check-label" for="flexCheckDefault">
        Distance to home and total trip
      </label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="osdItems.altitude">
      <label class="form-check-label" for="flexCheckDefault">
        Altitude
      </label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="osdItems.gpsSpeed">
      <label class="form-check-label" for="flexCheckDefault">
        Speed
      </label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="osdItems.rss1">
      <label class="form-check-label" for="flexCheckDefault">
        RSSI and LQ
      </label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="osdItems.dji">
      <label class="form-check-label" for="flexCheckDefault">
        DJI Latency and Bitrate (will not show if you did not add DJI SRT file)
      </label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="osdItems.battery">
      <label class="form-check-label" for="flexCheckDefault">
        Battery voltage and capacity used
      </label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="gps" [(ngModel)]="osdItems.power">
      <label class="form-check-label" for="flexCheckDefault">
        Power, current and efficiency in estimated Watt hours consumed per 1 km
      </label>
    </div>
    <button class="btn btn-success" (click)="exportSrt()" [disabled]="!logFileName || !selectedLog">Export SRT with OSD values</button>
    <p>After export you can use ffmpeg to burn subtitles into your video</p>
    <input class="form-control" type="text" readonly (click)="selectAll($event)"
           value="ffmpeg -i original_video.mp4 -vf subtitles=generated_subtitles.srt result_video.mp4">
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
  @Input() logFileName?: string;
  @Input() selectedLog?: ILog;

  constructor(private srtGenerator: SrtGenerator, private persistance: PersistenceService) { }

  ngOnInit(): void {
    this.osdItems = this.persistance.srtExport_osdItems ?? this.osdItems;
  }

  exportSrt() {
    this.persistance.srtExport_osdItems = this.osdItems;
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(new Blob([this.srtGenerator.exportSrt(this.selectedLog!, this.osdItems)]));
    a.href = objectUrl;
    a.download = `${this.logFileName!.substring(0, this.logFileName!.length - 4)}.srt`;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  selectAll(ev: any) {
    ev.target.select();
  }
}
